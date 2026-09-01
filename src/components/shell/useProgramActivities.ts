'use client';

import type { ActivityStepEntry } from '@/data/activitySteps';
import { useAppStore } from '@/store/useAppStore';

/**
 * The activities this programme runs.
 *
 * Was a module constant shared by every programme, which stopped being true
 * the moment a template could be edited: two programmes on two templates run
 * different lists. The shape is unchanged — `Record<ref, ActivityStepEntry>` —
 * so every reader that took the constant takes this instead, and none of them
 * has to learn where it came from.
 */
export const useProgramActivities = (): Record<string, ActivityStepEntry> =>
  useAppStore((s) => s.activities);

/** Titles, with a template's own rename winning over the generated one. */
export const useProgramActivityTitles = (): Record<string, string> =>
  useAppStore((s) => s.activityTitles);
