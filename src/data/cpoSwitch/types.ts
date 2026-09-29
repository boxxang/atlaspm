/**
 * /data/cpoSwitch/types.ts — what each CPO stage module and write-up module is
 * written in.
 *
 * A stage module gives the parts of a stage only a person can write: the
 * steps of each activity with what each step hands over, the deliverables and
 * which activity produces each, the stage's prose and its risks. Everything
 * the skeleton already fixes — the stage's key, prefix, title and weeks, each
 * activity's title, owner and window — is taken from the skeleton when the
 * template is composed, so it is written once.
 */
import type { ActivityStepEntry } from '../activitySteps';
import type { ActivityWriteUp } from '../activityDetailTypes';
import type { JourneyStage } from '../types';

/** An activity's steps, one output per step, and the deliverables it relates to. */
export interface CpoSteps {
  s: ActivityStepEntry['s'];
  o: string[];
  r: ActivityStepEntry['r'];
}

/** A stage's authored content. */
export interface CpoStageContent {
  tagline: string;
  description: string;
  /** short labels, one per activity, in activity order */
  activities: string[];
  deliverables: string[];
  /** index of the producing activity, per deliverable */
  deliverableFrom: number[];
  /** week from the stage start the deliverable is due, per deliverable */
  deliverableWeek: number[];
  /** man-months per activity, in activity order */
  engineeringEffort: number[];
  risks: string[];
  potentialRisks: string[];
  leader: JourneyStage['leader'];
  collaboration: string[];
  tools: string[];
  programView: string[];
  perspective: string;
}

export interface CpoStageModule {
  content: CpoStageContent;
  steps: Record<string, CpoSteps>;
}

export type CpoWriteUps = Record<string, ActivityWriteUp>;

export type CpoGlossary = Record<string, { full: string; group: string; note: string }>;
