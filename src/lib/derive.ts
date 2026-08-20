/**
 * /lib/derive.ts — derived values. Never stored, always computed.
 * Progress, overdue counts, open risks, in-flight stages, D-days.
 * Pure: no DOM, no state, no UI imports.
 */
import type { Deliverable, Item, StageContent, StageId } from '@/data/types';
import { DAY, type Schedule } from './schedule';

type ContentMap = Record<StageId, StageContent>;
type DeliverableMap = Record<StageId, Deliverable[]>;

/**
 * Which stages exist is a property of the program's profile, so these read the
 * map they are given rather than a list of stages in code. Every per-stage map
 * is built by walking the profile in order (see buildProjectState), so its keys
 * come out chronological.
 */
const stagesOf = (map: object): StageId[] => Object.keys(map);

/** Whole days from `today` to `d`, rounded up — matches the reference. */
export const daysTo = (d: Date, today: Date) =>
  Math.ceil((d.getTime() - today.getTime()) / DAY);

/** "D−12" before the date, "D+3" after. Note the U+2212 minus. */
export const dday = (d: Date, today: Date) => {
  const n = daysTo(d, today);
  return n >= 0 ? 'D−' + n : 'D+' + Math.abs(n);
};

/* ---------- deliverables ---------- */

export const allDeliverables = (deliverables: DeliverableMap): Deliverable[] =>
  stagesOf(deliverables).flatMap((id) => deliverables[id] ?? []);

/** Program progress = done deliverables / total, rounded to a whole percent. */
export function progressPct(deliverables: DeliverableMap): number {
  const all = allDeliverables(deliverables);
  const done = all.filter((d) => d.done).length;
  return all.length ? Math.round((done / all.length) * 100) : 0;
}

export const stageProgress = (list: Deliverable[]) => ({
  done: list.filter((d) => d.done).length,
  total: list.length,
});

/* ---------- risks ---------- */

/** A stage is risk-red while it holds at least one open risk. */
export const hasOpenRisks = (content: ContentMap, stageId: StageId) =>
  (content[stageId]?.risks.length ?? 0) > 0;

export const openRiskCount = (content: ContentMap) =>
  stagesOf(content).reduce((n, id) => n + (content[id]?.risks.length ?? 0), 0);

export const riskStageIds = (content: ContentMap) =>
  stagesOf(content).filter((id) => (content[id]?.risks.length ?? 0) > 0);

/* ---------- overdue ---------- */

export const isOverdue = (it: Item, today: Date) =>
  !it.done && !!it.due && it.due < today;

/** Open activities whose due date has passed, across every stage. */
export const overdueCount = (content: ContentMap, today: Date) =>
  stagesOf(content).reduce(
    (n, id) => n + (content[id]?.activities.filter((a) => isOverdue(a, today)).length ?? 0),
    0,
  );

export const overdueItems = (content: ContentMap, today: Date) =>
  stagesOf(content).flatMap((id) =>
    (content[id]?.activities ?? [])
      .filter((a) => isOverdue(a, today))
      .map((item) => ({ stageId: id, item })),
  );

/* ---------- schedule position ---------- */

/** Stages whose span contains today — the chips on the dashboard. */
export const inFlightStageIds = (schedule: Schedule, today: Date) =>
  stagesOf(schedule.stages).filter((id) => {
    const st = schedule.stages[id];
    return st.start <= today && today <= st.end;
  });

/** Milestones still ahead of today, soonest first. */
export const upcomingMilestones = (schedule: Schedule, today: Date) =>
  schedule.milestones
    .filter((m) => m.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

/* ---------- status updates ---------- */

/** Every status update across the program, newest first. */
export const allUpdates = (content: ContentMap) =>
  stagesOf(content).flatMap((stageId) =>
    (['keyinfo', 'activities', 'risks'] as const).flatMap((kind) =>
      (content[stageId]?.[kind] ?? []).flatMap((item) =>
        item.updates.map((su) => ({ stageId, kind, item, su })),
      ),
    ),
  ).sort((a, b) => b.su.date.getTime() - a.su.date.getTime());
