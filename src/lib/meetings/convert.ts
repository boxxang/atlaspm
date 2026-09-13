/**
 * /lib/meetings/convert.ts — what turning an action into a step does to the plan.
 *
 * The convert dialog shows this before anybody confirms: the new step's
 * planned dates, and how far the activity's planned end moves. It uses the same
 * step planner the stage pages draw with, so the preview and the plan that
 * follows cannot disagree.
 *
 * Pure: no DOM, no clock.
 */
import { DAY } from '@/lib/schedule';
import { plannedSteps, type ActivitySteps } from '@/lib/steps';

export interface StepPreview {
  n: number;
  start: Date;
  end: Date;
  /** When the activity's plan ends today, and when it would end with the step. */
  previousEnd: Date;
  newEnd: Date;
  /** Whole days the planned end moves; 0 when another step already runs longer. */
  addedDays: number;
}

const latest = (dates: readonly Date[], fallback: Date) =>
  dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : fallback;

export function appendStepPreview(
  stageStart: Date,
  activity: ActivitySteps,
  tatWeeks: number,
  text = '',
): StepPreview {
  const before = plannedSteps(stageStart, activity);
  const n = activity.steps.length + 1;
  const after = plannedSteps(stageStart, {
    ...activity,
    steps: [...activity.steps, { n, text, tat: tatWeeks, lane: 'main' }],
  });
  const added = after[after.length - 1];
  const previousEnd = latest(before.map((s) => s.end), added.start);
  const newEnd = latest(after.map((s) => s.end), added.end);
  return {
    n,
    start: added.start,
    end: added.end,
    previousEnd,
    newEnd,
    addedDays: Math.max(0, Math.round((newEnd.getTime() - previousEnd.getTime()) / DAY)),
  };
}
