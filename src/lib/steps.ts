/**
 * /lib/steps.ts — a step's dates, its state, and whether it is late.
 *
 * Steps were static prose until now: /data/activityDetails.ts says what the
 * steps of an activity are and how long each takes, and nothing said whether
 * one had been done. The prototype gave them state, so this module is where
 * the two meet — the plan from the write-up, the record from the database.
 *
 * A step is addressed the way the write-ups address it, by activity ref and
 * step number, because steps are content: they have no rows of their own and
 * renumbering an activity must not silently move somebody's completion onto a
 * different step. Hence `stepKey`, and hence the ref carried on every result.
 *
 * Pure: no DOM, no database.
 */
import type { DetailStep } from '@/data/activityDetailTypes';
import type { StageId } from '@/data/types';
import { addWeeks, startOfDay } from './schedule';

/** How a step is addressed: which activity, and which step of it. */
export const stepKey = (activityRef: string, n: number): string => `${activityRef}:${n}`;

/**
 * What the database holds about one step. Absent means untouched — a step
 * nobody has opened has no row, which is why every reader here takes a map and
 * tolerates a miss rather than expecting a record per step.
 */
export interface StepStateRecord {
  done: boolean;
  doneAt: Date | null;
  pct: number;
  owner: string;
  /** Set only where somebody moved the date; the baseline stays derivable. */
  dueOverride: Date | null;
}

export type StepStates = Readonly<Record<string, StepStateRecord | undefined>>;

/** An activity as this module needs it — where it sits, and what it does. */
export interface ActivitySteps {
  ref: string;
  stageId: StageId;
  /** [from, to] in weeks from the stage start. */
  window: readonly [number, number];
  steps: readonly DetailStep[];
  /** The role that owns it, for rows that have no owner of their own. */
  role?: string;
}

/** A step positioned in time, before anything is known about its state. */
export interface PlannedStep {
  n: number;
  text: string;
  tat: number;
  /** Runs alongside the main step before it rather than after it. */
  par: boolean;
  start: Date;
  end: Date;
}

/**
 * The plan for an activity's steps.
 *
 * Work runs in sequence except where a step is marked parallel, which starts
 * where the previous main step started rather than where it ended. So the
 * cursor only advances on main steps, and a parallel one is measured from the
 * main step it accompanies.
 */
export function plannedSteps(stageStart: Date, activity: ActivitySteps): PlannedStep[] {
  const base = addWeeks(stageStart, activity.window[0]);
  let cursor = 0;
  let lastMain = 0;
  const out: PlannedStep[] = [];
  for (const s of activity.steps) {
    const par = s.lane === 'par';
    const from = par ? lastMain : cursor;
    const to = from + s.tat;
    if (!par) {
      lastMain = cursor;
      cursor = to;
    }
    out.push({
      n: s.n,
      text: s.text,
      tat: s.tat,
      par,
      start: addWeeks(base, from),
      end: addWeeks(base, to),
    });
  }
  return out;
}

/** A step with everything known about it: the plan, and the record. */
export interface ResolvedStep extends PlannedStep {
  act: string;
  stageId: StageId;
  /** The date it is held to: the override where there is one, else the plan. */
  due: Date;
  /** Whether that date was set by hand — an override can always be undone. */
  dueSet: boolean;
  done: boolean;
  doneAt: Date | null;
  /** A done step is 100% by definition; below that, whatever was typed. */
  pct: number;
  owner: string;
}

export function resolveSteps(
  stageStart: Date,
  activity: ActivitySteps,
  states: StepStates,
): ResolvedStep[] {
  return plannedSteps(stageStart, activity).map((p) => {
    const st = states[stepKey(activity.ref, p.n)];
    const done = st?.done ?? false;
    return {
      ...p,
      act: activity.ref,
      stageId: activity.stageId,
      due: st?.dueOverride ?? p.end,
      dueSet: !!st?.dueOverride,
      done,
      doneAt: done ? (st?.doneAt ?? null) : null,
      pct: done ? 100 : (st?.pct ?? 0),
      owner: st?.owner ?? '',
    };
  });
}

/** Past its date with nothing handed over. */
export const isStepLate = (s: ResolvedStep, today: Date): boolean =>
  !s.done && startOfDay(s.due) < today;

/**
 * When a stage actually finished: the day its last step was handed over, and
 * only once every step is done. A stage with one step still open is not
 * complete, whatever the calendar says about it.
 */
export function stageDoneAt(steps: readonly ResolvedStep[]): Date | null {
  let last: Date | null = null;
  for (const s of steps) {
    if (!s.done || !s.doneAt) return null;
    if (!last || s.doneAt > last) last = s.doneAt;
  }
  return last;
}

export type ActivityPhase = 'done' | 'run' | 'future';

export interface ActivityState {
  done: number;
  total: number;
  phase: ActivityPhase;
}

/**
 * Where an activity stands: finished once every step is, running once its own
 * window has opened, otherwise still ahead. An activity with no steps written
 * up is judged on nothing, so it counts as future rather than as done.
 */
export function activityState(steps: readonly ResolvedStep[], today: Date): ActivityState {
  const total = steps.length;
  const done = steps.filter((s) => s.done).length;
  if (total > 0 && done >= total) return { done, total, phase: 'done' };
  if (total > 0 && today >= steps[0].start) return { done, total, phase: 'run' };
  return { done, total, phase: 'future' };
}

/** One late step, as the boards and the attention list read it. */
export interface OverdueStep {
  id: string;
  act: string;
  stepN: number;
  stageId: StageId;
  title: string;
  owner: string;
  role: string;
  due: Date;
}

/**
 * Overdue is a step past its due date with nothing handed over — not an item
 * past a target date, which is what it used to mean. Soonest-due first, so the
 * list reads as the order the work fell over in.
 */
export function allOverdue(
  activities: readonly { activity: ActivitySteps; steps: readonly ResolvedStep[] }[],
  today: Date,
): OverdueStep[] {
  const out: OverdueStep[] = [];
  for (const { activity, steps } of activities) {
    for (const s of steps) {
      if (!isStepLate(s, today)) continue;
      out.push({
        id: `od:${s.act}:${s.n}`,
        act: s.act,
        stepN: s.n,
        stageId: s.stageId,
        title: s.text,
        owner: s.owner,
        role: activity.role ?? '',
        due: s.due,
      });
    }
  }
  return out.sort((a, b) => a.due.getTime() - b.due.getTime());
}

/** The keys of every step handed over — what risk liveness is judged against. */
export const doneStepKeys = (steps: readonly ResolvedStep[]): Set<string> =>
  new Set(steps.filter((s) => s.done).map((s) => stepKey(s.act, s.n)));
