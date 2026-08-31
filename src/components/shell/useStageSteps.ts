'use client';

import { useMemo } from 'react';
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles } from '@/data/activityIndex';
import {
  activityState,
  fromStepIndex,
  resolveSteps,
  type ActivitySteps,
  type ActivityState,
  type ResolvedStep,
} from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';

/** One activity of a stage, dated and with whatever is known about its steps. */
export interface StageActivity {
  ref: string;
  title: string;
  activity: ActivitySteps;
  steps: ResolvedStep[];
  state: ActivityState;
  /** The key deliverables it relates to: [reference, how]. */
  delivers: readonly (readonly [string, string])[];
  /** What each step hands over, keyed by step number. */
  outputs: ReadonlyMap<number, string[]>;
}

/* The index is generated and never changes, so which activities a stage runs is
   worked out once for the module rather than on every render. */
const BY_STAGE = new Map<string, string[]>();
for (const [ref, a] of Object.entries(activitySteps)) {
  const list = BY_STAGE.get(a.st);
  if (list) list.push(ref);
  else BY_STAGE.set(a.st, [ref]);
}

/**
 * A stage reads as a plan, so its activities come out in the order they start.
 *
 * Template order is a logical grouping — the main flow first, then the
 * long-running activities that watch over it — and it is what the generated
 * index preserves. It is the wrong order to read a schedule in: the interposer
 * and substrate build opens the assembly stage and was authored last, so a
 * table in index order put the first work at the bottom.
 *
 * Sorting here and not in the index is deliberate. Reference IDs are derived
 * from position (/lib/rowIds.ts), so reordering the index would renumber every
 * activity of the stage and break the cross-references the write-ups are full
 * of. This reorders what is shown; ASSY-10 stays ASSY-10 and simply moves to
 * the top, where the plan says it belongs.
 *
 * Ties go to the shorter activity and then to the reference, so a stage whose
 * activities all start together still comes out in an order somebody can
 * remember rather than whatever the index happened to hold.
 */
const byStart = (a: StageActivity, b: StageActivity): number =>
  a.activity.window[0] - b.activity.window[0] ||
  a.activity.window[1] - b.activity.window[1] ||
  a.ref.localeCompare(b.ref);

/**
 * A stage's activities with their steps resolved: the plan from the generated
 * index, the record from the store, and the dates the schedule puts them on.
 *
 * The heavy write-ups stay on the server. What this reads is
 * /data/activitySteps.ts, which is the same steps without the prose.
 */
export function useStageSteps(stageId: string): StageActivity[] {
  const schedule = useAppStore((s) => s.schedule);
  const stepStates = useAppStore((s) => s.stepStates);
  const today = useAppStore((s) => s.today);

  return useMemo(() => {
    const span = schedule.stages[stageId];
    if (!span) return [];
    return (BY_STAGE.get(stageId) ?? []).map((ref) => {
      const entry = activitySteps[ref];
      const activity = fromStepIndex(ref, entry);
      const steps = resolveSteps(span.start, activity, stepStates);
      /* The write-up lists outputs flat and names the step each belongs to, so
         they are gathered per step once rather than scanned per row. */
      const outputs = new Map<number, string[]>();
      entry.o.forEach((text, i) => {
        const n = entry.ob[i];
        const list = outputs.get(n);
        if (list) list.push(text);
        else outputs.set(n, [text]);
      });
      return {
        ref,
        title: detailActivityTitles[ref] ?? ref,
        activity,
        steps,
        state: activityState(steps, today),
        delivers: entry.r,
        outputs,
      };
    }).sort(byStart);
  }, [stageId, schedule, stepStates, today]);
}

/** One activity, wherever it runs — for the rail, which is given a ref alone. */
export function useActivitySteps(ref: string): StageActivity | null {
  const entry = activitySteps[ref];
  const stage = entry?.st ?? '';
  const all = useStageSteps(stage);
  return all.find((a) => a.ref === ref) ?? null;
}
