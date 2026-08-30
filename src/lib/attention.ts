/**
 * /lib/attention.ts — what needs answering today, ranked.
 *
 * Four things can want a TPM's attention: a step somebody has flagged a risk
 * on, a step past its due date, a key deliverable that is late or nearly due,
 * and what is coming. They are not comparable on their own terms, so they are
 * scored into bands: a flagged step outranks an overdue one outranks a
 * deliverable due soon, always.
 *
 * A flagged step is top because somebody wrote down that it is in trouble.
 * That is a person's judgement about work still running, and it outranks a
 * date having passed — which is arithmetic. A step that is both is one row,
 * filed as the risk: the flag is the more useful thing to know, and the row
 * says the step is late underneath it.
 *
 * Under the three sits a fourth: what is coming. It is not a fallback for an
 * empty list — a program with one late step and nothing else has answered the
 * question in two seconds and then has a blank panel for the rest of the day —
 * so the nearest dates ahead top the list up to a readable length, always
 * below anything actually wrong. How long that is, the reader decides.
 *
 * The bands are 1000 apart and the widest spread inside one is a few hundred,
 * so a band is never jumped. The bonus for closing before tapeout is worth 300
 * — enough to order things within a band, not enough to promote one out of it.
 * An earlier 500 against gaps of 400 let a deliverable due in three days sit
 * above things already a week past due, which read as a bug.
 *
 * Pure: no DOM.
 */
import type { StageId } from '@/data/types';
import { DAY, startOfDay } from './schedule';
import type { DerivedRisk } from './risks';
import type { OverdueStep } from './steps';

export const ATTN_BAND = { risk: 4000, overdue: 3000, soon: 2000, stale: 1000, next: 0 } as const;
/** How many rows the panel shows before it starts scrolling for the rest. */
export const ATTN_LIMIT = 10;
/** What the reader can set it to. */
export const ATTN_LIMITS = [5, 10, 20, 50] as const;
/** What closing before tapeout is worth: order inside a band, never across one. */
export const ATTN_MTO = 300;

/** How close a deliverable has to be before it is worth saying anything. */
const SOON_DAYS = 21;
/** How long a risk goes unanswered before the row says so. */
const STALE_DAYS = 7;

export type AttentionTag = 'Risk' | 'Overdue' | 'Due soon' | 'Stale risk' | 'Next up';
export type AttentionType = 'Step' | 'Deliverable';

export interface AttentionRow {
  key: string;
  tag: AttentionTag;
  type: AttentionType;
  title: string;
  /** The magnitude, said in words: "11 days past due", "due in 3 days". */
  why: string;
  stageId: StageId;
  owner: string;
  /** The tag the row is filed under — an activity or deliverable ref. */
  ref: string | null;
  /** Where the row goes when clicked; deliverables go to the step that ticks them. */
  step: { act: string; n: number } | null;
  deliverableId: string | null;
  /** Its stage closes before tapeout. */
  blocks: boolean;
  score: number;
}

/** A key deliverable as the ladder reads it. */
export interface AttentionDeliverable {
  id: string;
  title: string;
  stageId: StageId;
  due: Date | null;
  done: boolean;
  ref: string | null;
  step: { act: string; n: number } | null;
}

export interface AttentionInput {
  today: Date;
  overdue: readonly OverdueStep[];
  deliverables: readonly AttentionDeliverable[];
  risks: readonly DerivedRisk[];
  /** Stage end dates — what "closes before tapeout" is measured against. */
  stageEnds: Readonly<Record<StageId, Date>>;
  tapeout: Date | null;
  /** Open steps whose date is still ahead, for the top-up. */
  upcoming?: readonly OverdueStep[];
  /** How long a list to build. Anything wrong is always in it. */
  limit?: number;
}

const daysSince = (d: Date, today: Date) =>
  Math.max(0, Math.round((today.getTime() - startOfDay(d).getTime()) / DAY));

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function attention(input: AttentionInput): AttentionRow[] {
  const { today, stageEnds, tapeout } = input;
  /* One row per thing, keeping the loudest reason for it. A step that is both
     overdue and carrying a stale risk is one line, filed under the worse of the
     two, not two lines saying the same thing twice. */
  const by = new Map<string, AttentionRow>();
  const push = (row: AttentionRow) => {
    const prev = by.get(row.key);
    if (!prev || row.score > prev.score) by.set(row.key, row);
  };
  const blocksTapeout = (stageId: StageId) => {
    const end = stageEnds[stageId];
    return !!(end && tapeout && end <= tapeout && end >= today);
  };

  for (const o of input.overdue) {
    const late = daysSince(o.due, today);
    const blocks = blocksTapeout(o.stageId);
    push({
      key: `s:${o.act}:${o.stepN}`,
      tag: 'Overdue',
      type: 'Step',
      title: o.title,
      why: `${plural(late, 'day')} past due`,
      stageId: o.stageId,
      owner: o.owner,
      ref: o.act,
      step: { act: o.act, n: o.stepN },
      deliverableId: null,
      blocks,
      score: ATTN_BAND.overdue + late + (blocks ? ATTN_MTO : 0),
    });
  }

  for (const d of input.deliverables) {
    if (d.done || !d.due) continue;
    const n = Math.round((startOfDay(d.due).getTime() - today.getTime()) / DAY);
    if (n > SOON_DAYS) continue;
    const blocks = blocksTapeout(d.stageId);
    const common = {
      key: `d:${d.id}`,
      type: 'Deliverable' as const,
      title: d.title,
      stageId: d.stageId,
      owner: '',
      ref: d.ref,
      step: d.step,
      deliverableId: d.id,
      blocks,
    };
    push(
      n < 0
        ? {
            ...common,
            tag: 'Overdue',
            why: `${plural(-n, 'day')} past due`,
            score: ATTN_BAND.overdue + -n + (blocks ? ATTN_MTO : 0),
          }
        : {
            ...common,
            tag: 'Due soon',
            why: n === 0 ? 'due today' : `due in ${plural(n, 'day')}`,
            score: ATTN_BAND.soon - n + (blocks ? ATTN_MTO : 0),
          },
    );
  }

  /* Every open risk, not only the ones that have gone quiet — a risk raised
     this morning is the most useful thing on the screen, and waiting a week to
     mention it is how the list came to have none on it at all.

     Keyed on the step, not on the risk, so a step that is also overdue is one
     row rather than two saying the same thing. The higher score wins, and the
     risk band is above the overdue one, so it is filed as the risk.

     A risk carries no date of its own, so it is ordered on how long it has
     gone unanswered: the one nobody has touched sits above the one somebody
     answered an hour ago. */
  for (const r of input.risks) {
    const quiet = daysSince(r.updatedAt, today);
    const blocks = blocksTapeout(r.stageId);
    const late = input.overdue.find((o) => o.act === r.act && o.stepN === r.stepN);
    push({
      key: r.stepN == null ? `r:${r.id}` : `s:${r.act}:${r.stepN}`,
      tag: quiet > STALE_DAYS ? 'Stale risk' : 'Risk',
      type: 'Step',
      title: r.title,
      why:
        (quiet > STALE_DAYS ? `no update in ${quiet} days` : quiet === 0 ? 'raised today' : `raised ${plural(quiet, 'day')} ago`) +
        (late ? `, ${plural(daysSince(late.due, today), 'day')} past due` : ''),
      stageId: r.stageId,
      owner: r.owner,
      ref: r.act,
      step: r.stepN == null ? null : { act: r.act, n: r.stepN },
      deliverableId: null,
      blocks,
      score: ATTN_BAND.risk + quiet + (blocks ? ATTN_MTO : 0),
    });
  }

  /* Everything wrong, worst first. There is no per-tag cap: with seventeen
     things overdue, a cap of four would leave thirteen out of the one list
     that says what to answer. */
  const wrong = [...by.values()].sort((a, b) => b.score - a.score);

  /* Then the work coming up, enough of it to fill a readable list. Never
     above anything wrong, and never repeating a row already there — a
     deliverable due next week is Due soon, and saying it twice helps nobody. */
  const room = Math.max(0, (input.limit ?? ATTN_LIMIT) - wrong.length);
  return room > 0 ? [...wrong, ...nextUp(input, room, by)] : wrong;
}

/** The nearest dates ahead, steps and deliverables in one order. */
function nextUp(
  input: AttentionInput,
  room: number,
  taken: ReadonlyMap<string, AttentionRow>,
): AttentionRow[] {
  const { today, stageEnds, tapeout } = input;
  const blocks = (stageId: StageId) => {
    const end = stageEnds[stageId];
    return !!(end && tapeout && end <= tapeout && end >= today);
  };
  const inDays = (d: Date) => Math.round((startOfDay(d).getTime() - today.getTime()) / DAY);
  const why = (n: number) => (n === 0 ? 'due today' : `due in ${plural(n, 'day')}`);

  /* Sorted on the date, which is not part of a row — so it is carried
     alongside rather than added to the shape every other band would then have
     to fill in. */
  const rows: { at: number; row: AttentionRow }[] = [];

  for (const s of input.upcoming ?? []) {
    const n = inDays(s.due);
    rows.push({
      at: s.due.getTime(),
      row: {
        key: `s:${s.act}:${s.stepN}`,
        tag: 'Next up',
        type: 'Step',
        title: s.title,
        why: why(n),
        stageId: s.stageId,
        owner: s.owner,
        ref: s.act,
        step: { act: s.act, n: s.stepN },
        deliverableId: null,
        blocks: blocks(s.stageId),
        score: ATTN_BAND.next,
      },
    });
  }

  for (const d of input.deliverables) {
    if (d.done || !d.due) continue;
    const n = inDays(d.due);
    if (n < 0) continue;
    rows.push({
      at: d.due.getTime(),
      row: {
        key: `d:${d.id}`,
        tag: 'Next up',
        type: 'Deliverable',
        title: d.title,
        why: why(n),
        stageId: d.stageId,
        owner: '',
        ref: d.ref,
        step: d.step,
        deliverableId: d.id,
        blocks: blocks(d.stageId),
        score: ATTN_BAND.next,
      },
    });
  }

  /* Soonest first, and a deliverable before the step that hands it over when
     they fall on the same day — the deliverable is the thing being asked for. */
  return rows
    .filter((r) => !taken.has(r.row.key))
    .sort(
      (a, b) =>
        a.at - b.at ||
        a.row.type.localeCompare(b.row.type) ||
        a.row.title.localeCompare(b.row.title),
    )
    .slice(0, room)
    .map((r) => r.row);
}
