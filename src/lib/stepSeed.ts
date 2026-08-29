/**
 * /lib/stepSeed.ts — what a seeded programme has already finished.
 *
 * A fresh programme with no step state reads as 0 of 1,649 done and everything
 * whose date has passed overdue, which is not a programme anybody recognises.
 * So the seed states the obvious: work whose window has closed is finished.
 *
 * But a real programme is never that tidy either, and a TPM tool with an empty
 * Overdue list is a tool with nothing to say. So a few activities are stalled —
 * and stalled the way work actually stalls, which is the point of doing this
 * carefully rather than opening steps at random.
 *
 * Work inside an activity runs in order. When it stops, everything before where
 * it stopped is finished and that step and the ones after it are not. Step 1
 * open while steps 2 to 8 are complete is not something that happens; it read as
 * a bug in the prototype until it was fixed there the same way.
 *
 * Pure: no DOM, no database, no clock of its own.
 */
import type { StageId } from '@/data/types';
import { RISK_AUTHOR, riskSeeds } from '@/data/riskSeeds';
import { plannedSteps, type ActivitySteps, type PlannedStep } from './steps';

/**
 * How far an activity has got: every step up to the first one still open.
 *
 * A prefix, not a filter. "Its window has closed" is not monotonic in step
 * number — a parallel step starts where the main step before it started, so it
 * can end after the main step that follows. Filtering on the date alone
 * therefore finishes step 5 while step 4 is still open, which is the exact
 * nonsense this seed exists to avoid.
 */
export const finishedPrefix = (steps: readonly PlannedStep[], today: Date): PlannedStep[] => {
  const i = steps.findIndex((s) => s.end >= today);
  return i === -1 ? [...steps] : steps.slice(0, i);
};

/** One step the seed marks finished, and the day it was finished on. */
export interface SeededStep {
  activityRef: string;
  stepN: number;
  doneAt: Date;
}

/**
 * Six stalled activities, two late steps each: ten late steps over six stages,
 * which reads as a programme with a few things stuck rather than one falling
 * apart. Spread beats depth — six stages with a problem each is the picture a
 * TPM actually has.
 */
export const STALL_ACTIVITIES = 6;
export const STALL_DEPTH = 2;

export interface StepSeedInput {
  /** Stages in the order the programme runs them, with their spans. */
  stages: readonly { id: StageId; start: Date; end: Date }[];
  /** Every activity, keyed by the stage that runs it. */
  activities: readonly ActivitySteps[];
  today: Date;
  stallActivities?: number;
  stallDepth?: number;
}

/**
 * Which activities are stalled: one per stage that is in flight, taken from the
 * middle of those genuinely mid-run — some steps behind them, some ahead.
 *
 * The middle rather than the first, so the stall is not always the activity at
 * the top of the table.
 */
export function pickStalls(input: StepSeedInput): string[] {
  const { stages, activities, today } = input;
  const limit = input.stallActivities ?? STALL_ACTIVITIES;
  const out: string[] = [];

  for (const stage of stages) {
    /* Checked before the push, not after it: a limit of none has to mean none,
       and a limit checked afterwards always lets the first one through. */
    if (out.length >= limit) break;
    if (today < stage.start || today > stage.end) continue;
    const candidates = activities.filter((a) => {
      if (a.stageId !== stage.id) return false;
      const dates = plannedSteps(stage.start, a);
      const done = finishedPrefix(dates, today);
      return done.length > 0 && done.length < dates.length;
    });
    if (candidates.length) out.push(candidates[Math.floor(candidates.length / 2)].ref);
  }
  return out;
}

/**
 * Every step the seed marks finished: those whose window has closed, minus the
 * last few of each stalled activity, which are what the Overdue list is for.
 *
 * Finished on the day the plan said, not on the day the seed ran — a completion
 * date is a fact about the work, and stamping today's date on 800 steps would
 * say the whole programme landed this morning.
 */
export function seedStepStates(input: StepSeedInput): SeededStep[] {
  const { stages, activities, today } = input;
  const depth = input.stallDepth ?? STALL_DEPTH;
  const spans = new Map(stages.map((s) => [s.id, s]));

  const leaveOpen = new Set<string>();
  for (const ref of pickStalls(input)) {
    const a = activities.find((x) => x.ref === ref);
    const span = a && spans.get(a.stageId);
    if (!a || !span) continue;
    for (const d of finishedPrefix(plannedSteps(span.start, a), today).slice(-depth))
      leaveOpen.add(`${ref}:${d.n}`);
  }

  const out: SeededStep[] = [];
  for (const a of activities) {
    const span = spans.get(a.stageId);
    if (!span) continue;
    for (const d of finishedPrefix(plannedSteps(span.start, a), today)) {
      if (leaveOpen.has(`${a.ref}:${d.n}`)) continue;
      out.push({ activityRef: a.ref, stepN: d.n, doneAt: d.end });
    }
  }
  return out;
}

/** A risk the seed raises, on the step where the work actually stopped. */
export interface SeededRisk {
  activityRef: string;
  stepN: number;
  text: string;
  author: string;
  /** When it was raised: the day the step went past its date. */
  createdAt: Date;
}

/**
 * One risk per stalled activity, flagged on its first open step.
 *
 * Not a migration of the old risk board. Those were `Item(kind:'risk')` rows
 * entered in the abstract, with nothing tying them to the work they were about;
 * matching them to steps by title would have been guesswork, and guesswork that
 * puts a risk on the wrong step is worse than no risk at all. These are written
 * for the stage in /data/riskSeeds.ts and raised where the work stopped, so the
 * Risks board and the Overdue board point at the same steps and explain each
 * other.
 *
 * Raised on the day the step went past its date, not on the day the seed ran —
 * a risk nobody has touched for three weeks should say so.
 */
export function seedRisks(input: StepSeedInput): SeededRisk[] {
  const { stages, activities, today } = input;
  const depth = input.stallDepth ?? STALL_DEPTH;
  const spans = new Map(stages.map((s) => [s.id, s]));
  const out: SeededRisk[] = [];

  for (const ref of pickStalls(input)) {
    const a = activities.find((x) => x.ref === ref);
    const span = a && spans.get(a.stageId);
    if (!a || !span) continue;
    const text = riskSeeds[a.stageId];
    if (!text) continue;
    const steps = plannedSteps(span.start, a);
    /* The frontier: the first step the stall leaves open. seedStepStates
       finishes the prefix minus the last `depth` of it, so the frontier sits
       that far back — not at the end of the prefix, which is a step the stall
       has already opened past. */
    const stuck = steps[Math.max(0, finishedPrefix(steps, today).length - depth)];
    if (!stuck) continue;
    out.push({
      activityRef: ref,
      stepN: stuck.n,
      text,
      author: RISK_AUTHOR,
      /* raised the day it went past its date, so a risk nobody has touched for
         three weeks says three weeks rather than today */
      createdAt: stuck.end < today ? stuck.end : stuck.start,
    });
  }
  return out;
}
