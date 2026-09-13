/**
 * /lib/meetings/types.ts — the meeting model, as the browser holds it.
 *
 * A meeting is its own thing, not a kind of activity or step. A series says how
 * a meeting recurs; an instance is one sitting of it on one day, and everything
 * said at that sitting — agenda, minutes, decisions, actions — belongs to the
 * instance, never to the series. A series that stored minutes would be a
 * series whose last meeting overwrote every one before it.
 *
 * Decisions and action items are held once, flat, by id. Every screen that
 * shows one — the meeting, the activity it is about, the follow-up list — reads
 * the same object, so correcting it in one place corrects it everywhere.
 *
 * Every set of values is a const tuple with its labels beside it, because each
 * of them is printed as text wherever it is shown: a status told apart by
 * colour alone is a status half the room cannot read.
 *
 * Pure: no DOM, no database.
 */
import type { AttachmentRef } from '@/data/types';

/* ---------- value sets ---------- */

export const MEETING_STATUSES = ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];
export const MEETING_STATUS_LABEL: Record<MeetingStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const MEETING_TYPES = [
  'program_review',
  'working_group',
  'war_room',
  'supplier_review',
  'readiness_review',
  'design_review',
  'bringup',
  'ad_hoc',
] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];
export const MEETING_TYPE_LABEL: Record<MeetingType, string> = {
  program_review: 'Program review',
  working_group: 'Working group',
  war_room: 'War-room',
  supplier_review: 'Supplier review',
  readiness_review: 'Readiness review',
  design_review: 'Design review',
  bringup: 'Bring-up',
  ad_hoc: 'Ad hoc',
};

export const ACTION_STATUSES = ['open', 'in_progress', 'blocked', 'done', 'cancelled'] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];
export const ACTION_STATUS_LABEL: Record<ActionStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const PRIORITIES = ['critical', 'high', 'normal', 'low'] as const;
export type Priority = (typeof PRIORITIES)[number];
export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

/**
 * What an action is for. Only `new_step` can create work on the plan, and only
 * when somebody explicitly converts it — an action about a step supports that
 * step, and finishing it does not finish the step.
 */
export const ACTION_TYPES = ['support', 'new_step', 'standalone'] as const;
export type ActionType = (typeof ACTION_TYPES)[number];
export const ACTION_TYPE_LABEL: Record<ActionType, string> = {
  support: 'Existing Step Support',
  new_step: 'Convert to New Step',
  standalone: 'Standalone Follow-up',
};

export const DECISION_STATUSES = ['proposed', 'approved', 'superseded', 'rejected'] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];
export const DECISION_STATUS_LABEL: Record<DecisionStatus, string> = {
  proposed: 'Proposed',
  approved: 'Approved',
  superseded: 'Superseded',
  rejected: 'Rejected',
};

export const OUTCOMES = ['info', 'decision', 'action', 'risk', 'escalation', 'deferred'] as const;
export type Outcome = (typeof OUTCOMES)[number];
export const OUTCOME_LABEL: Record<Outcome, string> = {
  info: 'Information only',
  decision: 'Decision made',
  action: 'Action required',
  risk: 'Risk identified',
  escalation: 'Escalation required',
  deferred: 'Deferred to next meeting',
};

/** What happens to an agenda item that was deferred. */
export const DEFERRALS = ['next_meeting', 'offline', 'dropped'] as const;
export type Deferral = (typeof DEFERRALS)[number];
export const DEFERRAL_LABEL: Record<Deferral, string> = {
  next_meeting: 'Carry to the next meeting',
  offline: 'Take offline',
  dropped: 'Drop it',
};

/**
 * What a late or blocked action does to the plan, as somebody judged it. It is
 * a statement, not a change: nothing here moves a step or activity date.
 */
export const SCHEDULE_IMPACTS = [
  'none',
  'step_at_risk',
  'activity_end',
  'milestone',
  'not_assessed',
] as const;
export type ScheduleImpact = (typeof SCHEDULE_IMPACTS)[number];
export const SCHEDULE_IMPACT_LABEL: Record<ScheduleImpact, string> = {
  none: 'No schedule impact',
  step_at_risk: 'Step completion at risk',
  activity_end: 'Activity end date impact',
  milestone: 'Milestone / critical path impact',
  not_assessed: 'Impact not assessed',
};

export const FILE_CATEGORIES = [
  'presentation',
  'report',
  'analysis',
  'attachment',
  'link',
  'evidence',
] as const;
export type FileCategory = (typeof FILE_CATEGORIES)[number];
export const FILE_CATEGORY_LABEL: Record<FileCategory, string> = {
  presentation: 'Presentation',
  report: 'Report',
  analysis: 'Analysis result',
  attachment: 'Meeting attachment',
  link: 'External link',
  evidence: 'Completion evidence',
};

export const LINK_TYPES = ['stage', 'activity', 'step', 'risk', 'deliverable', 'milestone'] as const;
export type LinkType = (typeof LINK_TYPES)[number];
export const LINK_TYPE_LABEL: Record<LinkType, string> = {
  stage: 'Stage',
  activity: 'Activity',
  step: 'Step',
  risk: 'Risk',
  deliverable: 'Deliverable',
  milestone: 'Milestone',
};

export const ACCESS_SCOPES = ['program', 'stage_team', 'invitees'] as const;
export type AccessScope = (typeof ACCESS_SCOPES)[number];
export const ACCESS_SCOPE_LABEL: Record<AccessScope, string> = {
  program: 'Everyone on the program',
  stage_team: 'The related stage teams',
  invitees: 'Invitees only',
};

export const COMPLETION_MODES = ['warn', 'block'] as const;
export type CompletionMode = (typeof COMPLETION_MODES)[number];

/* ---------- recurrence ---------- */

export type Frequency = 'none' | 'daily' | 'weekly' | 'monthly';

/**
 * How a series repeats, in the series' own time zone.
 *
 * Dates are calendar days (`YYYY-MM-DD`) and the time is a wall-clock time
 * (`HH:MM`), because "Tuesdays at nine" means nine o'clock in the room across
 * a daylight-saving change, not a fixed UTC instant that becomes eight.
 */
export interface RecurrenceRule {
  freq: Frequency;
  /** Every n days, weeks or months. */
  interval: number;
  /** 0 = Sunday. Weekly: the days it meets. Daily: an empty list means every day. */
  weekdays: number[];
  /** Monthly: the day of the month; null takes the start date's. */
  monthDay: number | null;
  startDate: string;
  time: string;
  /** Last day it may meet, inclusive; null means open-ended. */
  until: string | null;
}

/* ---------- objects ---------- */

/** Who made and last changed a row, and when. */
export interface Stamped {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * A thing on the plan a meeting row is about.
 *
 * `ref` is how that thing is addressed everywhere else in the app: a stage key,
 * an activity reference (`PD-02`), a step (`PD-02:3`), the risk's post id, a
 * deliverable id, a milestone id. Steps are content rather than rows, so this
 * is the only address they have.
 */
export interface LinkRef {
  type: LinkType;
  ref: string;
}

export interface MeetingSeries extends Stamped {
  id: string;
  projectId: string;
  title: string;
  purpose: string;
  type: MeetingType;
  owner: string;
  attendees: string[];
  recurrence: RecurrenceRule;
  durationMinutes: number;
  /** Agenda item titles each new sitting starts with. */
  agendaTemplate: string[];
  timeZone: string;
  location: string;
  accessScope: AccessScope;
  status: 'active' | 'inactive';
  links: LinkRef[];
}

export interface Attendee {
  id: string;
  name: string;
  optional: boolean;
}

export interface Meeting extends Stamped {
  id: string;
  projectId: string;
  seriesId: string | null;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  owner: string;
  facilitator: string;
  location: string;
  purpose: string;
  /** Free-form minutes, beside the structured notes on each agenda item. */
  minutes: string;
  attendees: Attendee[];
  links: LinkRef[];
  completedAt: Date | null;
  cancelReason: string;
}

export interface AgendaItem extends Stamped {
  id: string;
  projectId: string;
  meetingId: string;
  position: number;
  title: string;
  description: string;
  presenter: string;
  minutes: number;
  /** What was said about it — the structured half of the minutes. */
  notes: string;
  outcome: Outcome | '';
  status: 'pending' | 'discussed';
  deferral: Deferral | '';
  deferNote: string;
  /** Set on an item carried in from an earlier sitting. */
  carriedFromId: string | null;
  links: LinkRef[];
}

export interface Decision extends Stamped {
  id: string;
  projectId: string;
  meetingId: string;
  agendaItemId: string | null;
  title: string;
  description: string;
  owner: string;
  approvedBy: string;
  decidedOn: Date | null;
  rationale: string;
  scope: string;
  status: DecisionStatus;
  supersedesId: string | null;
  links: LinkRef[];
}

export interface ActionItem extends Stamped {
  id: string;
  projectId: string;
  /**
   * The meeting it was raised in. Nullable so an action can one day be raised
   * from a risk or a step directly, with the same shape and the same lists.
   */
  meetingId: string | null;
  agendaItemId: string | null;
  description: string;
  /** Accountable: exactly one person. Empty means nobody yet, which warns. */
  owner: string;
  contributors: string[];
  due: Date | null;
  priority: Priority;
  status: ActionStatus;
  actionType: ActionType;
  evidence: string;
  blocker: string;
  escalationDate: Date | null;
  verifiedBy: string;
  completedAt: Date | null;
  scheduleImpact: ScheduleImpact | '';
  impactNote: string;
  /** The later sitting it has been carried into, if any. It still belongs to its source. */
  carriedToMeetingId: string | null;
  /** The step it became, once somebody converted it. */
  convertedStep: { act: string; n: number } | null;
  links: LinkRef[];
}

export interface MeetingFile {
  id: string;
  projectId: string;
  meetingId: string | null;
  decisionId: string | null;
  actionItemId: string | null;
  category: FileCategory;
  title: string;
  url: string;
  attachments: AttachmentRef[];
  createdAt: Date;
  createdBy: string;
}

/** Everything the meetings screens read, as one serialisable payload. */
export interface MeetingsState {
  completionMode: CompletionMode;
  series: MeetingSeries[];
  meetings: Meeting[];
  agenda: AgendaItem[];
  decisions: Decision[];
  actions: ActionItem[];
  files: MeetingFile[];
}

export const EMPTY_MEETINGS: MeetingsState = {
  completionMode: 'warn',
  series: [],
  meetings: [],
  agenda: [],
  decisions: [],
  actions: [],
  files: [],
};

/** A value is one of a tuple's members — for reading stored strings back safely. */
export const oneOf = <T extends string>(set: readonly T[], v: string, fallback: T): T =>
  (set as readonly string[]).includes(v) ? (v as T) : fallback;
