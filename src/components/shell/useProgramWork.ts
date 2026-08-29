'use client';

import { useMemo } from 'react';
import { activitySteps } from '@/data/activitySteps';
import { openRisks, type DerivedRisk } from '@/lib/risks';
import {
  allOverdue,
  doneStepKeys,
  fromStepIndex,
  resolveSteps,
  type OverdueStep,
  type ResolvedStep,
} from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';

/* Which stage runs which activity never changes, so the join is built once. */
const STAGE_OF: Record<string, string> = {};
for (const [ref, a] of Object.entries(activitySteps)) STAGE_OF[ref] = a.st;

/**
 * The programme's work, resolved once: every activity's steps, what is late,
 * and what is flagged.
 *
 * The nav, the two boards and the overview all read this, so they cannot
 * disagree about the numbers — which is the whole reason the counts were left
 * blank until step state reached the browser.
 */
export interface ProgramWork {
  steps: ResolvedStep[];
  overdue: OverdueStep[];
  risks: DerivedRisk[];
}

export function useProgramWork(): ProgramWork {
  const schedule = useAppStore((s) => s.schedule);
  const stepStates = useAppStore((s) => s.stepStates);
  const posts = useAppStore((s) => s.posts);
  const today = useAppStore((s) => s.today);

  return useMemo(() => {
    const resolved: { activity: ReturnType<typeof fromStepIndex>; steps: ResolvedStep[] }[] = [];
    for (const ref of Object.keys(activitySteps)) {
      const activity = fromStepIndex(ref, activitySteps[ref]);
      const span = schedule.stages[activity.stageId];
      /* an activity whose stage this programme's profile does not run */
      if (!span) continue;
      resolved.push({ activity, steps: resolveSteps(span.start, activity, stepStates) });
    }
    const steps = resolved.flatMap((r) => r.steps);
    return {
      steps,
      overdue: allOverdue(resolved, today),
      risks: openRisks(posts, doneStepKeys(steps), STAGE_OF),
    };
  }, [schedule, stepStates, posts, today]);
}
