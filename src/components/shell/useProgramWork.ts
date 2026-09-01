'use client';

import { useProgramActivities } from './useProgramActivities';
import { useMemo } from 'react';
import { openRisks, type DerivedRisk } from '@/lib/risks';
import {
  allOverdue,
  allUpcoming,
  doneStepKeys,
  fromStepIndex,
  resolveSteps,
  type OverdueStep,
  type ResolvedStep,
} from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';

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
  /** Open steps whose date is still ahead, soonest first. */
  upcoming: OverdueStep[];
  risks: DerivedRisk[];
}

export function useProgramWork(): ProgramWork {
  const activitySteps = useProgramActivities();
  const schedule = useAppStore((s) => s.schedule);
  const stepStates = useAppStore((s) => s.stepStates);
  const posts = useAppStore((s) => s.posts);
  const today = useAppStore((s) => s.today);

  return useMemo(() => {
    /* Which stage runs which activity — the programme's own join now, since a
       template decides which activities exist. */
    const stageOf: Record<string, string> = {};
    for (const [ref, a] of Object.entries(activitySteps)) stageOf[ref] = a.st;

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
      upcoming: allUpcoming(resolved, today),
      risks: openRisks(posts, doneStepKeys(steps), stageOf),
    };
  }, [activitySteps, schedule, stepStates, posts, today]);
}
