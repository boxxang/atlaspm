/**
 * /lib/mailDrafts.ts — the two drafts the envelope buttons compose.
 * Pure: hand it state, get back a subject and a plain-text body.
 */
import { journeyData } from '@/data/journey';
import type { Deliverable, Item, ItemKind, StageContent, StageId } from '@/data/types';
import {
  allUpdates,
  dday,
  inFlightStageIds,
  openRiskCount,
  overdueCount,
  progressPct,
  riskStageIds,
  upcomingMilestones,
} from './derive';
import { clip, joinSections, row, section, type MailDraft } from './mailto';
import { fmtDT, fmtDTFull, fmtDate, type Schedule } from './schedule';

const stageOf = (id: StageId) => journeyData.find((s) => s.id === id)!;
const KIND_LABEL: Record<ItemKind, string> = {
  keyinfo: 'Key Info',
  activities: 'Activity',
  risks: 'Risk',
};

const SIGNATURE = '—\nComposed in AtlasPM. Review before sending.';

/** Dashboard → a status summary someone can read without opening the tool. */
export function programSummaryDraft(input: {
  projectName: string;
  schedule: Schedule;
  today: Date;
  content: Record<StageId, StageContent>;
  deliverables: Record<StageId, Deliverable[]>;
}): MailDraft {
  const { projectName, schedule, today, content, deliverables } = input;
  const all = Object.values(deliverables).flat();
  const done = all.filter((d) => d.done).length;
  const risks = openRiskCount(content);
  const riskStages = riskStageIds(content).map((id) => stageOf(id).title);
  const overdue = overdueCount(content, today);
  const inFlight = inFlightStageIds(schedule, today);

  const body = joinSections([
    `${projectName} — Program Summary\nAs of ${fmtDate(today)}`,

    section('PROGRESS', [
      `  ${row('Complete', `${progressPct(deliverables)}%  (${done} of ${all.length} deliverables)`)}`,
    ]),

    section('SCHEDULE', [
      `  ${row('Tapeout', `${fmtDate(schedule.tapeout)}  ${dday(schedule.tapeout, today)}`)}`,
      `  ${row('First Silicon', `${fmtDate(schedule.firstSilicon)}  ${dday(schedule.firstSilicon, today)}`)}`,
      `  ${row('Production', `${fmtDate(schedule.production)}  ${dday(schedule.production, today)}`)}`,
    ]),

    section('ATTENTION', [
      `  ${row('Open risks', String(risks))}${riskStages.length ? `  (${riskStages.join(', ')})` : ''}`,
      `  ${row('Overdue', String(overdue))}`,
    ]),

    section(
      'IN FLIGHT TODAY',
      inFlight.length
        ? inFlight.map((id) => `  ${stageOf(id).shortTitle} · ${stageOf(id).title}`)
        : ['  No stage active today'],
    ),

    section(
      'UPCOMING MILESTONES',
      upcomingMilestones(schedule, today)
        .slice(0, 4)
        .map((m) => `  ${fmtDate(m.date)}  ${m.label.padEnd(16)}${dday(m.date, today)}`),
    ),

    section(
      'RECENT STATUS UPDATES',
      /* three fits inside the mailto ceiling; more would be trimmed anyway */
      allUpdates(content)
        .slice(0, 3)
        .flatMap((r) => [
          `  ${fmtDT(r.su.date)}  [${stageOf(r.stageId).shortTitle}] ${r.item.title}`,
          `    ${clip(r.su.text, 150)}`,
        ]),
    ),

    SIGNATURE,
  ]);

  return {
    subject: `${projectName} — program summary ${fmtDate(today)}`,
    body,
  };
}

/** An activity, risk or key-info row → a note to whoever owns it. */
export function itemDraft(input: {
  projectName: string;
  stageId: StageId;
  kind: ItemKind;
  item: Item;
  today: Date;
  /** null when the owner is not in the program's directory. */
  ownerEmail: string | null;
}): MailDraft {
  const { projectName, stageId, kind, item, today, ownerEmail } = input;
  const stage = stageOf(stageId);
  const overdue = !item.done && item.due && item.due < today;

  const body = joinSections([
    `${KIND_LABEL[kind].toUpperCase()} — ${item.title}`,
    `${projectName} · ${stage.title}`,

    section('SUMMARY', [
      `  ${row('Owner', item.owner || '—')}`,
      `  ${row('Target due', item.due ? `${fmtDate(item.due)}${overdue ? '   OVERDUE' : ''}` : '—')}`,
      `  ${row('Status', item.done ? 'Closed' : 'Open')}`,
      `  ${row('Last updated', fmtDTFull(item.updated))}`,
    ]),

    section('DETAILS', [`  ${item.body || 'No details recorded yet.'}`]),

    section(
      'STATUS UPDATES',
      [...item.updates]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)
        .flatMap((u) => [`  ${fmtDT(u.date)}`, `    ${clip(u.text, 200)}`]),
    ),

    SIGNATURE,
  ]);

  return {
    to: ownerEmail ? [ownerEmail] : [],
    subject: `[${projectName} · ${stage.shortTitle}] ${item.title}`,
    body,
  };
}

/** A whole stage's activity list → one note to everyone who owns a line on it. */
export function activityListDraft(input: {
  projectName: string;
  stageId: StageId;
  items: Item[];
  today: Date;
  recipients: string[];
}): MailDraft {
  const { projectName, stageId, items, today, recipients } = input;
  const stage = stageOf(stageId);
  const open = items.filter((i) => !i.done);

  const body = joinSections([
    `${projectName} · ${stage.title} — Activity list`,
    `As of ${fmtDate(today)}  ·  ${open.length} open of ${items.length}`,

    /* Two lines an item: a roll-up has to stay inside the mailto ceiling, and
       the per-item envelope is where the status thread belongs. */
    section(
      'ACTIVITIES',
      items.flatMap((it) => {
        const overdue = !it.done && it.due && it.due < today;
        const due = it.due ? fmtDate(it.due) : '—';
        return [
          `  ${it.done ? '[x]' : '[ ]'} ${it.title}`,
          `      ${row('owner', it.owner || '—', 8)}   ${row('due', `${due}${overdue ? '  OVERDUE' : ''}`, 6)}`,
        ];
      }),
    ),

    SIGNATURE,
  ]);

  return {
    to: recipients,
    subject: `[${projectName} · ${stage.shortTitle}] Activity list — ${fmtDate(today)}`,
    body,
  };
}
