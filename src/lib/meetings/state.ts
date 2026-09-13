/**
 * /lib/meetings/state.ts — stored meeting rows into the shape the browser holds.
 *
 * The database keeps lists one per line, the recurrence as JSON, enumerations
 * as strings and links in a table of their own. The screens want arrays, a
 * rule, typed values and each row's links on the row. This is the one place
 * that translation happens, and it forgives: a stored value it does not
 * recognise reads as the safe default rather than taking the page down.
 *
 * The row shapes are structural, so this module stays client-safe and the
 * server actions can reuse the per-row readers to judge completion.
 *
 * Pure: no DOM, no database.
 */
import type { AttachmentRef } from '@/data/types';
import { readRule } from './recurrence';
import {
  ACCESS_SCOPES,
  ACTION_STATUSES,
  ACTION_TYPES,
  COMPLETION_MODES,
  DECISION_STATUSES,
  DEFERRALS,
  FILE_CATEGORIES,
  LINK_TYPES,
  MEETING_STATUSES,
  MEETING_TYPES,
  OUTCOMES,
  PRIORITIES,
  SCHEDULE_IMPACTS,
  oneOf,
  type ActionItem,
  type AgendaItem,
  type Decision,
  type LinkRef,
  type LinkType,
  type Meeting,
  type MeetingFile,
  type MeetingSeries,
  type MeetingsState,
  type Stamped,
} from './types';
import { zonedDayKey } from './zonedTime';

interface StampRow {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface SeriesRow extends StampRow {
  id: string;
  projectId: string;
  title: string;
  purpose: string;
  type: string;
  owner: string;
  attendees: string;
  recurrence: string;
  durationMinutes: number;
  agendaTemplate: string;
  timeZone: string;
  location: string;
  accessScope: string;
  status: string;
}

export interface MeetingRow extends StampRow {
  id: string;
  projectId: string;
  seriesId: string | null;
  title: string;
  type: string;
  status: string;
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  owner: string;
  facilitator: string;
  location: string;
  purpose: string;
  minutes: string;
  completedAt: Date | null;
  cancelReason: string;
  attendees?: { id: string; name: string; optional: boolean; position: number }[];
}

export interface AgendaRow extends StampRow {
  id: string;
  projectId: string;
  meetingId: string;
  position: number;
  title: string;
  description: string;
  presenter: string;
  minutes: number;
  notes: string;
  outcome: string;
  status: string;
  deferral: string;
  deferNote: string;
  carriedFromId: string | null;
}

export interface DecisionRow extends StampRow {
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
  status: string;
  supersedesId: string | null;
}

export interface ActionRow extends StampRow {
  id: string;
  projectId: string;
  meetingId: string | null;
  agendaItemId: string | null;
  description: string;
  owner: string;
  contributors: string;
  dueDate: Date | null;
  priority: string;
  status: string;
  actionType: string;
  evidence: string;
  blocker: string;
  escalationDate: Date | null;
  verifiedBy: string;
  completedAt: Date | null;
  scheduleImpact: string;
  impactNote: string;
  carriedToMeetingId: string | null;
  convertedActivityRef: string | null;
  convertedStepN: number | null;
}

export interface LinkRow {
  seriesId: string | null;
  meetingId: string | null;
  agendaItemId: string | null;
  decisionId: string | null;
  actionItemId: string | null;
  targetType: string;
  targetRef: string;
}

export interface FileRow {
  id: string;
  projectId: string;
  meetingId: string | null;
  decisionId: string | null;
  actionItemId: string | null;
  category: string;
  title: string;
  url: string;
  createdAt: Date;
  createdBy: string;
  attachments?: AttachmentRef[];
}

export interface MeetingsRows {
  completionMode: string;
  series: SeriesRow[];
  meetings: MeetingRow[];
  agenda: AgendaRow[];
  decisions: DecisionRow[];
  actions: ActionRow[];
  links: LinkRow[];
  files: FileRow[];
}

const lines = (s: string): string[] =>
  (s ?? '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

const stamped = (r: StampRow): Stamped => ({
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  createdBy: r.createdBy,
  updatedBy: r.updatedBy,
});

export const toLinkRef = (l: Pick<LinkRow, 'targetType' | 'targetRef'>): LinkRef | null =>
  (LINK_TYPES as readonly string[]).includes(l.targetType)
    ? { type: l.targetType as LinkType, ref: l.targetRef }
    : null;

export function toSeries(r: SeriesRow, links: LinkRef[]): MeetingSeries {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(r.recurrence);
  } catch {
    parsed = null;
  }
  return {
    id: r.id,
    projectId: r.projectId,
    title: r.title,
    purpose: r.purpose,
    type: oneOf(MEETING_TYPES, r.type, 'working_group'),
    owner: r.owner,
    attendees: lines(r.attendees),
    /* a rule that will not parse starts again from the day the series was made */
    recurrence: readRule(parsed, zonedDayKey(r.createdAt, r.timeZone)),
    durationMinutes: r.durationMinutes,
    agendaTemplate: lines(r.agendaTemplate),
    timeZone: r.timeZone,
    location: r.location,
    accessScope: oneOf(ACCESS_SCOPES, r.accessScope, 'program'),
    status: r.status === 'inactive' ? 'inactive' : 'active',
    links,
    ...stamped(r),
  };
}

export function toMeeting(r: MeetingRow, links: LinkRef[]): Meeting {
  return {
    id: r.id,
    projectId: r.projectId,
    seriesId: r.seriesId,
    title: r.title,
    type: oneOf(MEETING_TYPES, r.type, 'working_group'),
    status: oneOf(MEETING_STATUSES, r.status, 'scheduled'),
    startsAt: r.startsAt,
    endsAt: r.endsAt,
    timeZone: r.timeZone,
    owner: r.owner,
    facilitator: r.facilitator,
    location: r.location,
    purpose: r.purpose,
    minutes: r.minutes,
    attendees: [...(r.attendees ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((a) => ({ id: a.id, name: a.name, optional: a.optional })),
    links,
    completedAt: r.completedAt,
    cancelReason: r.cancelReason,
    ...stamped(r),
  };
}

export function toAgendaItem(r: AgendaRow, links: LinkRef[]): AgendaItem {
  return {
    id: r.id,
    projectId: r.projectId,
    meetingId: r.meetingId,
    position: r.position,
    title: r.title,
    description: r.description,
    presenter: r.presenter,
    minutes: r.minutes,
    notes: r.notes,
    outcome: r.outcome ? oneOf(OUTCOMES, r.outcome, 'info') : '',
    status: r.status === 'discussed' ? 'discussed' : 'pending',
    deferral: r.deferral ? oneOf(DEFERRALS, r.deferral, 'next_meeting') : '',
    deferNote: r.deferNote,
    carriedFromId: r.carriedFromId,
    links,
    ...stamped(r),
  };
}

export function toDecision(r: DecisionRow, links: LinkRef[]): Decision {
  return {
    id: r.id,
    projectId: r.projectId,
    meetingId: r.meetingId,
    agendaItemId: r.agendaItemId,
    title: r.title,
    description: r.description,
    owner: r.owner,
    approvedBy: r.approvedBy,
    decidedOn: r.decidedOn,
    rationale: r.rationale,
    scope: r.scope,
    status: oneOf(DECISION_STATUSES, r.status, 'proposed'),
    supersedesId: r.supersedesId,
    links,
    ...stamped(r),
  };
}

export function toActionItem(r: ActionRow, links: LinkRef[]): ActionItem {
  return {
    id: r.id,
    projectId: r.projectId,
    meetingId: r.meetingId,
    agendaItemId: r.agendaItemId,
    description: r.description,
    owner: r.owner,
    contributors: lines(r.contributors),
    due: r.dueDate,
    priority: oneOf(PRIORITIES, r.priority, 'normal'),
    status: oneOf(ACTION_STATUSES, r.status, 'open'),
    actionType: oneOf(ACTION_TYPES, r.actionType, 'support'),
    evidence: r.evidence,
    blocker: r.blocker,
    escalationDate: r.escalationDate,
    verifiedBy: r.verifiedBy,
    completedAt: r.completedAt,
    scheduleImpact: r.scheduleImpact ? oneOf(SCHEDULE_IMPACTS, r.scheduleImpact, 'not_assessed') : '',
    impactNote: r.impactNote,
    carriedToMeetingId: r.carriedToMeetingId,
    convertedStep:
      r.convertedActivityRef && r.convertedStepN != null
        ? { act: r.convertedActivityRef, n: r.convertedStepN }
        : null,
    links,
    ...stamped(r),
  };
}

export function toMeetingFile(r: FileRow): MeetingFile {
  return {
    id: r.id,
    projectId: r.projectId,
    meetingId: r.meetingId,
    decisionId: r.decisionId,
    actionItemId: r.actionItemId,
    category: oneOf(FILE_CATEGORIES, r.category, 'attachment'),
    title: r.title,
    url: r.url,
    attachments: r.attachments ?? [],
    createdAt: r.createdAt,
    createdBy: r.createdBy,
  };
}

type OwnerKey = 'seriesId' | 'meetingId' | 'agendaItemId' | 'decisionId' | 'actionItemId';

export function buildMeetingsState(rows: MeetingsRows): MeetingsState {
  const byOwner = (key: OwnerKey) => {
    const out = new Map<string, LinkRef[]>();
    for (const l of rows.links) {
      const owner = l[key];
      const ref = owner ? toLinkRef(l) : null;
      if (!owner || !ref) continue;
      const list = out.get(owner);
      if (list) list.push(ref);
      else out.set(owner, [ref]);
    }
    return (id: string) => out.get(id) ?? [];
  };
  const seriesLinks = byOwner('seriesId');
  const meetingLinks = byOwner('meetingId');
  const agendaLinks = byOwner('agendaItemId');
  const decisionLinks = byOwner('decisionId');
  const actionLinks = byOwner('actionItemId');

  return {
    completionMode: oneOf(COMPLETION_MODES, rows.completionMode, 'warn'),
    series: rows.series.map((r) => toSeries(r, seriesLinks(r.id))),
    meetings: rows.meetings.map((r) => toMeeting(r, meetingLinks(r.id))),
    agenda: rows.agenda.map((r) => toAgendaItem(r, agendaLinks(r.id))),
    decisions: rows.decisions.map((r) => toDecision(r, decisionLinks(r.id))),
    actions: rows.actions.map((r) => toActionItem(r, actionLinks(r.id))),
    files: rows.files.map(toMeetingFile),
  };
}
