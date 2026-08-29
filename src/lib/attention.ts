/**
 * /lib/attention.ts — what needs answering today, ranked.
 *
 * Three things can want a TPM's attention: a step past its due date, a key
 * deliverable that is late or nearly due, and a risk nobody has said anything
 * about in a week. They are not comparable on their own terms, so they are
 * scored into bands: overdue outranks due-soon outranks stale, always.
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

export const ATTN_BAND = { overdue: 3000, soon: 2000, stale: 1000 } as const;
/** What closing before tapeout is worth: order inside a band, never across one. */
export const ATTN_MTO = 300;

/** How close a deliverable has to be before it is worth saying anything. */
const SOON_DAYS = 21;
/** How long a risk goes unanswered before it is stale. */
const STALE_DAYS = 7;

export type AttentionTag = 'Overdue' | 'Due soon' | 'Stale risk';
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

  /* A risk carries no date of its own, so it is judged on how long it has gone
     unanswered. It is flagged on a step and answered on that step, so it is a
     step here too. */
  for (const r of input.risks) {
    const quiet = daysSince(r.updatedAt, today);
    if (quiet <= STALE_DAYS) continue;
    const blocks = blocksTapeout(r.stageId);
    push({
      key: `r:${r.id}`,
      tag: 'Stale risk',
      type: 'Step',
      title: r.title,
      why: `no update in ${quiet} days`,
      stageId: r.stageId,
      owner: r.owner,
      ref: r.act,
      step: r.stepN == null ? null : { act: r.act, n: r.stepN },
      deliverableId: null,
      blocks,
      score: ATTN_BAND.stale + quiet + (blocks ? ATTN_MTO : 0),
    });
  }

  /* Ranked, and all of it. There used to be a per-tag cap here — four overdue,
     three due soon, two stale — so that every band got a showing. It meant that
     with seventeen things overdue, thirteen of them were missing from the list
     of what needs answering today, which is the one thing this exists to say.
     The list scrolls instead. */
  return [...by.values()].sort((a, b) => b.score - a.score);
}
