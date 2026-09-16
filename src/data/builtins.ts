/**
 * /data/builtins.ts — the templates that ship with the app, and the content
 * every programme resolves against.
 *
 * There were two things called "the built-in profile": the stage list the app
 * ships, and the activity library the browser holds. Adding a second template
 * separates them — a programme on the 3DIC template runs stages whose content
 * is not in journey.ts and activities that are not in activitySteps.ts — so
 * both are composed here, once, and every reader takes them from this module
 * rather than from one of the two sources.
 *
 * Pure data: the generated modules are untouched and the authored 3DIC module
 * sits beside them.
 */
import { activitySteps, type ActivityStepEntry } from './activitySteps';
import { detailActivityTitles } from './activityIndex';
import { journeyData } from './journey';
import { BUILTIN_PROFILE, milestoneDefs } from './scheduleProfiles';
import {
  THREE_DIC_ACTIVITIES,
  THREE_DIC_ACTIVITY_TITLES,
  THREE_DIC_MILESTONES,
  THREE_DIC_PROFILE,
  THREE_DIC_STAGES,
} from './threeDic';
import type { JourneyStage, MilestoneDef, ScheduleProfile } from './types';

/** Every template the app ships, in the order the pickers list them. */
export const BUILTIN_PROFILES: readonly ScheduleProfile[] = [BUILTIN_PROFILE, THREE_DIC_PROFILE];

/**
 * Every activity either template runs, keyed by reference.
 *
 * The references cannot collide: the 3DIC stages carry prefixes of their own,
 * and a test holds that line. So one map answers for both templates, and a
 * programme resolves whichever of them its stages name.
 */
export const ALL_ACTIVITIES: Record<string, ActivityStepEntry> = {
  ...activitySteps,
  ...THREE_DIC_ACTIVITIES,
};

/** Their titles, from the same two sources. */
export const ALL_ACTIVITY_TITLES: Record<string, string> = {
  ...detailActivityTitles,
  ...THREE_DIC_ACTIVITY_TITLES,
};

/** Every stage's content, by the key a profile stage points at with `baseKey`. */
export const ALL_STAGE_CONTENT: readonly JourneyStage[] = [...journeyData, ...THREE_DIC_STAGES];

/** The checkpoints of both templates; a profile keeps the ones it runs. */
export const ALL_MILESTONES: readonly MilestoneDef[] = [...milestoneDefs, ...THREE_DIC_MILESTONES];

/** The content a stage shows, or undefined for one nobody has written up. */
export const stageContent = (key: string | null | undefined): JourneyStage | undefined =>
  key ? ALL_STAGE_CONTENT.find((s) => s.id === key) : undefined;
