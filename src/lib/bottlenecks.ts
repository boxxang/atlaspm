/**
 * /lib/bottlenecks.ts — what the rest of the programme is waiting on.
 *
 * An activity is a bottleneck when it is provably late and work downstream of
 * it has not started. Both halves are worth stating carefully, because both
 * are places where a tool can be made to say more than it knows.
 *
 * Provably late. The engineering table carries titles, durations and effort —
 * no completion state. The only record that says a thing was promised and has
 * not arrived is a Key Deliverable, which carries `due`, `done` and the
 * stage's `deliverableFrom` map from deliverable to the activity that makes
 * it. So the evidence is always a deliverable: an activity that owns none
 * cannot be named here however late its window looks, and a deliverable with
 * no due date is not a promise and cannot be missed. This is a lagging signal
 * and deliberately so — the alternative is inferring lateness from a schedule
 * position, which is a guess wearing a number.
 *
 * Waiting. `feedsInto` from the write-ups is followed transitively, because
 * the activity two hops down is held up just as surely as the one below. The
 * graph is not acyclic — an activity can feed one that feeds back into it —
 * so the walk remembers where it has been.
 *
 * No composite score. Every column is a fact that can be checked against the
 * programme: how late, how many wait, how much effort, when the first of it
 * was due to start. A weighted index would rank better and survive one
 * question in a review.
 *
 * Pure: no DOM, no clock of its own — `today` is supplied.
 */
import type { Deliverable, Stage, StageId } from '@/data/types';
import { addWeeks, type Schedule } from './schedule';
import { resolveStageDetail, type StageDetailOverride } from './stageDetail';
import { activityRowId } from './rowIds';

const DAY = 24 * 60 * 60 * 1000;

export interface BottleneckInput {
  /** The programme's stages, in order. */
  stages: readonly Stage[];
  /** Per-stage text overrides, so the engineering list is this programme's. */
  stageDetails: Record<StageId, StageDetailOverride | null | undefined>;
  schedule: Schedule;
  deliverables: Record<StageId, Deliverable[]>;
  today: Date;
  /** The dependency graph: activity → the activities it feeds. */
  feeds: Record<string, readonly string[]>;
  /** Effort per activity, filled in from the programme's own tables. */
  manMonths: Record<string, number>;
  /** Activities a slip moves the programme through. */
  critical: readonly string[];
  titles: Record<string, string>;
}

export interface BlockedActivity {
  id: string;
  stageId: StageId;
  title: string;
  /** When it is scheduled to begin, or null where the stage has no plan. */
  start: Date | null;
  manMonths: number;
  critical: boolean;
  /** False once its start is behind us — under way, so not held at the gate. */
  waiting: boolean;
}

export interface LateDeliverable {
  id: string;
  title: string;
  due: Date;
  days: number;
}

export interface Bottleneck {
  id: string;
  title: string;
  stageId: StageId;
  stageTitle: string;
  /** Days past the due date of the worst deliverable it owes. */
  lateDays: number;
  lateDeliverables: LateDeliverable[];
  /** Activities it feeds directly. */
  direct: number;
  /** Every activity downstream of it, however many hops away. */
  downstream: BlockedActivity[];
  /**
   * The figures below all describe the same population: downstream work that
   * has not started. Work already under way is downstream too, and it is in
   * `downstream` so the reader can see it, but unblocking this activity does
   * not release it — counting it here would answer a different question from
   * the one the panel asks.
   */
  waiting: number;
  stagesTouched: number;
  manMonthsAtRisk: number;
  criticalDownstream: number;
  /** The earliest start among the work that is waiting. */
  firstBlockedStart: Date | null;
}

/** Where each activity of a stage sits, as the stage's own plan states it. */
function planOf(stage: Stage, view: readonly string[], start: Date | null) {
  const plan = stage.engineeringStart;
  const n = view.length;
  return (i: number): Date | null => {
    if (!start) return null;
    const week = plan?.[i] ?? (n ? (stage.baseline.durationWeeks * i) / n : 0);
    return addWeeks(start, week);
  };
}

/**
 * Everything reachable from `id`, itself excluded. Breadth-first over a graph
 * that may loop back on itself.
 */
function reach(id: string, feeds: Record<string, readonly string[]>, known: Set<string>): string[] {
  const seen = new Set<string>([id]);
  const out: string[] = [];
  const queue = [...(feeds[id] ?? [])];
  while (queue.length) {
    const next = queue.shift()!;
    if (seen.has(next)) continue;
    seen.add(next);
    if (!known.has(next)) continue;
    out.push(next);
    queue.push(...(feeds[next] ?? []));
  }
  return out;
}

export function findBottlenecks(input: BottleneckInput): Bottleneck[] {
  const { stages, stageDetails, schedule, deliverables, today, feeds, manMonths, titles } = input;
  const critical = new Set(input.critical);

  /* One pass over the programme first: where every activity sits and what it
     costs, so the walk downstream can price what it finds. */
  const startOf = new Map<string, Date | null>();
  const stageOf = new Map<string, StageId>();
  const labelOf = new Map<string, string>();
  const effortOf = new Map<string, number>();

  for (const stage of stages) {
    const detail = resolveStageDetail(stage, stageDetails[stage.id]);
    const st = schedule.stages[stage.id];
    const whereIn = planOf(stage, detail.engineeringView, st?.start ?? null);
    detail.engineeringView.forEach((label, i) => {
      const id = activityRowId(stage.shortTitle, i);
      startOf.set(id, whereIn(i));
      stageOf.set(id, stage.id);
      labelOf.set(id, label);
      effortOf.set(id, detail.engineeringEffort[i] ?? manMonths[id] ?? 0);
    });
  }

  const known = new Set(stageOf.keys());
  const out: Bottleneck[] = [];

  for (const stage of stages) {
    const from = stage.deliverableFrom;
    /* Without this map nothing in the stage can be tied to an activity, and a
       stage's deliverables say nothing about which of its rows is holding. */
    if (!from) continue;

    const detail = resolveStageDetail(stage, stageDetails[stage.id]);
    const list = deliverables[stage.id] ?? [];

    /* Group the stage's overdue deliverables under the activity that owes them. */
    const owed = new Map<number, LateDeliverable[]>();
    list.forEach((d, i) => {
      const activity = from[i];
      if (activity === undefined) return;
      if (d.done || !d.due) return;
      const days = Math.floor((today.getTime() - d.due.getTime()) / DAY);
      if (days <= 0) return;
      const late = { id: d.id, title: d.title, due: d.due, days };
      owed.set(activity, [...(owed.get(activity) ?? []), late]);
    });

    for (const [index, late] of owed) {
      const id = activityRowId(stage.shortTitle, index);
      const downstreamIds = reach(id, feeds, known);
      /* Late and blocking nothing is simply late; the overdue count says that
         already, and this panel is about what the delay is holding up. */
      if (!downstreamIds.length) continue;

      const downstream: BlockedActivity[] = downstreamIds.map((d) => {
        const start = startOf.get(d) ?? null;
        return {
          id: d,
          stageId: stageOf.get(d)!,
          title: labelOf.get(d) ?? titles[d] ?? d,
          start,
          manMonths: effortOf.get(d) ?? 0,
          critical: critical.has(d),
          waiting: start ? start.getTime() > today.getTime() : false,
        };
      });

      /* One population for every figure on the row: what has yet to start. */
      const held = downstream.filter((d) => d.waiting);
      const starts = held.map((d) => d.start!.getTime()).sort((a, b) => a - b);

      out.push({
        id,
        title: detail.engineeringView[index] ?? id,
        stageId: stage.id,
        stageTitle: stage.title,
        lateDays: Math.max(...late.map((d) => d.days)),
        lateDeliverables: late.sort((a, b) => b.days - a.days),
        direct: (feeds[id] ?? []).filter((d) => known.has(d) && d !== id).length,
        downstream,
        waiting: held.length,
        stagesTouched: new Set(held.map((d) => d.stageId)).size,
        manMonthsAtRisk: held.reduce((t, d) => t + d.manMonths, 0),
        criticalDownstream: held.filter((d) => d.critical).length,
        firstBlockedStart: starts.length ? new Date(starts[0]) : null,
      });
    }
  }

  /* The size of what is stuck leads; how late it is settles a tie. */
  return out.sort((a, b) => b.manMonthsAtRisk - a.manMonthsAtRisk || b.lateDays - a.lateDays);
}

/**
 * The one line the panel opens with.
 *
 * Bottlenecks share their downstream — three late activities in the same stage
 * can hold up the same block of work — so the totals are a union, not a sum.
 * Adding the per-row figures would count that work once per bottleneck and
 * report more waiting work than the programme contains.
 */
export const bottleneckSummary = (list: readonly Bottleneck[]) => {
  const held = new Map<string, BlockedActivity>();
  for (const b of list) for (const d of b.downstream) if (d.waiting) held.set(d.id, d);
  const blocked = [...held.values()];
  return {
    count: list.length,
    activities: blocked.length,
    manMonths: blocked.reduce((t, d) => t + d.manMonths, 0),
    stages: new Set(blocked.map((d) => d.stageId)).size,
  };
};
