/**
 * /data/scenarioTypes.ts — what a seeded program scenario is written in.
 *
 * A scenario is a program's record as the PM entered it: step records, posts
 * and notes, meeting series and sittings with their agenda, decisions and
 * action items. AtlasFX1 was the first and these types were its own; they are
 * shared now that a second scenario is written in them. Dates are local
 * YYYY-MM-DD, stamps YYYY-MM-DD HH:MM, and `@me` is the PM.
 */
import type { NoteBlock } from './stageNotes';

/** A step record the story needs. `due` is a date moved by hand. */
export interface ScenarioStep {
  ref: string;
  n: number;
  pct?: number;
  owner?: string;
  due?: string;
  doneAt?: string;
}

/** A deliverable by stage and position: finished (`'due'` = on its date), or re-dated by hand. */
export interface ScenarioDeliverable {
  stageId: string;
  position: number | 'all';
  doneAt?: string;
  due?: string;
}

export interface ScenarioPerson {
  name: string;
  role: string;
}

export interface ScenarioPost {
  key: string;
  /** For a risk: the day it was closed. The reply under it says how. */
  closed?: string;
  kind: 'update' | 'risk' | 'note' | 'reply';
  /** Local date and time, YYYY-MM-DD HH:MM. */
  at: string;
  /** The post's text — a note written as blocks gives only its title here. */
  text: string;
  /** A key-info note's body as blocks: paragraphs, headings, lists and tables. */
  blocks?: readonly NoteBlock[];
  /** A step, as ACT:n. */
  step?: string;
  stageId?: string;
  parent?: string;
  /** The meeting a risk was raised in, by key. */
  meeting?: string;
}

export interface ScenarioLink {
  type: 'stage' | 'activity' | 'step' | 'risk' | 'deliverable' | 'milestone';
  ref: string;
}

export interface ScenarioSeries {
  key: string;
  title: string;
  purpose: string;
  type: string;
  attendees: readonly string[];
  freq: 'daily' | 'weekly';
  weekdays: readonly number[];
  startDate: string;
  /** Last day it met, for a series that has ended; it is then inactive. */
  until?: string;
  time: string;
  durationMinutes: number;
  agendaTemplate: readonly string[];
  location: string;
  stage: string;
  links: readonly ScenarioLink[];
}

export interface ScenarioAgenda {
  title: string;
  presenter: string;
  minutes: number;
  notes?: string;
  outcome?: 'info' | 'decision' | 'action' | 'risk' | 'escalation' | 'deferred';
  links?: readonly ScenarioLink[];
}

export interface ScenarioDecision {
  title: string;
  description: string;
  rationale: string;
  status: 'proposed' | 'approved' | 'superseded' | 'rejected';
  owner: string;
  approvedBy: string;
  scope: string;
  agenda?: number;
  links?: readonly ScenarioLink[];
}

export interface ScenarioAction {
  description: string;
  owner: string;
  contributors?: readonly string[];
  due: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'open' | 'in_progress' | 'blocked' | 'done';
  type: 'support' | 'new_step' | 'standalone';
  agenda?: number;
  blocker?: string;
  escalation?: string;
  impact?: 'none' | 'step_at_risk' | 'activity_end' | 'milestone' | 'not_assessed';
  impactNote?: string;
  evidence?: string;
  verifiedBy?: string;
  completed?: string;
  /** The meeting it was carried into, by key. */
  carriedTo?: string;
  links?: readonly ScenarioLink[];
}

export interface ScenarioMeeting {
  key: string;
  series?: string;
  /** A one-off meeting names itself; a sitting takes its series'. */
  title?: string;
  type?: string;
  purpose?: string;
  attendees?: readonly string[];
  location?: string;
  stage?: string;
  links?: readonly ScenarioLink[];
  date: string;
  time: string;
  durationMinutes?: number;
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled';
  minutes?: string;
  agenda: readonly ScenarioAgenda[];
  decisions?: readonly ScenarioDecision[];
  actions?: readonly ScenarioAction[];
}
