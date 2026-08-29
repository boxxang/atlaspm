/**
 * /lib/stagePace.ts — how far a stage has got against how far through it is.
 *
 * Two numbers, and whether they agree: the share of steps handed over, and the
 * share of the window spent. The gap between them is the figure a TPM is after
 * — 60% of the calendar spent against 30% of the steps done is the sentence,
 * not either figure on its own.
 *
 * Pure: no DOM. The verdict comes back as a kind and its numbers; the wording
 * of it belongs to the component that shows it.
 */
import { DAY } from './schedule';

export type PaceKind = 'future' | 'complete' | 'overrun' | 'behind' | 'ahead' | 'onpace';

export interface StagePace {
  /** Share of the stage's steps handed over, 0–100. */
  stepsPct: number;
  stepsDone: number;
  stepsTotal: number;
  /** Share of the stage's window spent, 0–100, clamped at both ends. */
  elapsedPct: number;
  /** stepsPct − elapsedPct, in whole points: positive is ahead of the calendar. */
  gap: number;
  /** Which week of the stage today is, 1-based; only meaningful in flight. */
  week: number;
  kind: PaceKind;
  /** Steps still open — what an overrun is measured in. */
  openSteps: number;
}

/** Beyond this many points the two figures are saying different things. */
const PACE_TOLERANCE = 8;

export function stagePace(
  stage: { start: Date; end: Date },
  steps: { done: number; total: number },
  today: Date,
): StagePace {
  const stepsPct = steps.total ? Math.round((steps.done / steps.total) * 100) : 0;
  const span = stage.end.getTime() - stage.start.getTime();
  const elapsedPct = Math.max(
    0,
    Math.min(100, span ? ((today.getTime() - stage.start.getTime()) / span) * 100 : 0),
  );
  const gap = Math.round(stepsPct - elapsedPct);
  const week = Math.max(1, Math.round((today.getTime() - stage.start.getTime()) / DAY / 7));
  const openSteps = steps.total - steps.done;

  let kind: PaceKind;
  if (today < stage.start) kind = 'future';
  else if (today > stage.end) kind = stepsPct >= 100 ? 'complete' : 'overrun';
  else if (gap <= -PACE_TOLERANCE) kind = 'behind';
  else if (gap >= PACE_TOLERANCE) kind = 'ahead';
  else kind = 'onpace';

  return { stepsPct, stepsDone: steps.done, stepsTotal: steps.total, elapsedPct, gap, week, kind, openSteps };
}
