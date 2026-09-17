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
import {
  activityGlossary,
  detailActivityTitles,
  detailDeliverables,
  writtenActivities,
  type GlossaryTerm,
} from './activityIndex';
import { journeyData } from './journey';
import { BUILTIN_PROFILE, milestoneDefs } from './scheduleProfiles';
import {
  THREE_DIC_ACTIVITIES,
  THREE_DIC_ACTIVITY_TITLES,
  THREE_DIC_DELIVERABLES,
  THREE_DIC_GLOSSARY,
  THREE_DIC_MILESTONES,
  THREE_DIC_PROFILE,
  THREE_DIC_STAGES,
} from './threeDic';
import {
  TOP_DIE_ACTIVITIES,
  TOP_DIE_ACTIVITY_TITLES,
  TOP_DIE_DELIVERABLES,
  TOP_DIE_STAGES,
} from './threeDicTopDie';
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
  ...TOP_DIE_ACTIVITIES,
};

/** Their titles, from the same two sources. */
export const ALL_ACTIVITY_TITLES: Record<string, string> = {
  ...detailActivityTitles,
  ...THREE_DIC_ACTIVITY_TITLES,
  ...TOP_DIE_ACTIVITY_TITLES,
};

/** Every stage's content, by the key a profile stage points at with `baseKey`. */
export const ALL_STAGE_CONTENT: readonly JourneyStage[] = [
  ...journeyData,
  ...THREE_DIC_STAGES,
  ...TOP_DIE_STAGES,
];

/** The checkpoints of both templates; a profile keeps the ones it runs. */
export const ALL_MILESTONES: readonly MilestoneDef[] = [...milestoneDefs, ...THREE_DIC_MILESTONES];

/** The content a stage shows, or undefined for one nobody has written up. */
export const stageContent = (key: string | null | undefined): JourneyStage | undefined =>
  key ? ALL_STAGE_CONTENT.find((s) => s.id === key) : undefined;

/**
 * Every key deliverable's reference tag and title, from both templates — the
 * catalogue a programme's deliverable rows are matched against for their tag.
 */
export const ALL_DELIVERABLE_TITLES: Record<string, string> = {
  ...detailDeliverables,
  ...THREE_DIC_DELIVERABLES,
  ...TOP_DIE_DELIVERABLES,
};

/** The terms a write-up may offer to explain, from both corpora. */
export const ALL_GLOSSARY: Record<string, GlossaryTerm> = {
  ...activityGlossary,
  ...THREE_DIC_GLOSSARY,
};

/**
 * Every activity with a write-up: the SoC's, the stack's, then the top die's,
 * each in the order its template runs them. Every 3DIC activity is written up
 * and every top-die one derives its write-up from an SoC one — tests hold both
 * — so the lists are their keys rather than second copies of them.
 */
export const ALL_WRITTEN_ACTIVITIES: readonly string[] = [
  ...writtenActivities,
  ...Object.keys(THREE_DIC_ACTIVITIES),
  ...Object.keys(TOP_DIE_ACTIVITIES),
];

const WRITTEN = new Set(ALL_WRITTEN_ACTIVITIES);
export const hasWriteUp = (id: string): boolean => WRITTEN.has(id);
