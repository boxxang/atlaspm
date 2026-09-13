/**
 * Builders for the meeting unit tests. Every field is present, the way the
 * store holds them, so a test that forgets one reads what the app would read.
 */
import type { ActionItem, AgendaItem, Decision, Meeting } from '@/lib/meetings/types';

const STAMP = {
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
  createdBy: 'Sangwook Park',
  updatedBy: 'Sangwook Park',
};

export const meeting = (over: Partial<Meeting> = {}): Meeting => ({
  id: 'm1',
  projectId: 'p1',
  seriesId: null,
  title: 'DFT Weekly Review',
  type: 'working_group',
  status: 'scheduled',
  startsAt: new Date(2026, 8, 15, 9, 0),
  endsAt: new Date(2026, 8, 15, 10, 0),
  timeZone: 'America/Los_Angeles',
  owner: 'Sangwook Park',
  facilitator: '',
  location: '',
  purpose: '',
  minutes: '',
  attendees: [],
  links: [],
  completedAt: null,
  cancelReason: '',
  ...STAMP,
  ...over,
});

export const agendaItem = (over: Partial<AgendaItem> = {}): AgendaItem => ({
  id: 'a1',
  projectId: 'p1',
  meetingId: 'm1',
  position: 0,
  title: 'Scan compression status',
  description: '',
  presenter: '',
  minutes: 10,
  notes: '',
  outcome: '',
  status: 'pending',
  deferral: '',
  deferNote: '',
  carriedFromId: null,
  links: [],
  ...STAMP,
  ...over,
});

export const decision = (over: Partial<Decision> = {}): Decision => ({
  id: 'd1',
  projectId: 'p1',
  meetingId: 'm1',
  agendaItemId: null,
  title: 'Raise the compression ratio to 60x',
  description: '',
  owner: 'Yusuf Demir',
  approvedBy: 'Sangwook Park',
  decidedOn: new Date(2026, 8, 8),
  rationale: '',
  scope: '',
  status: 'approved',
  supersedesId: null,
  links: [],
  ...STAMP,
  ...over,
});

export const action = (over: Partial<ActionItem> = {}): ActionItem => ({
  id: 'x1',
  projectId: 'p1',
  meetingId: 'm1',
  agendaItemId: null,
  description: 'Rerun ATPG with the new compression ratio',
  owner: 'Tarek Haddad',
  contributors: [],
  due: new Date(2026, 8, 20),
  priority: 'normal',
  status: 'open',
  actionType: 'support',
  evidence: '',
  blocker: '',
  escalationDate: null,
  verifiedBy: '',
  completedAt: null,
  scheduleImpact: '',
  impactNote: '',
  carriedToMeetingId: null,
  convertedStep: null,
  links: [],
  ...STAMP,
  ...over,
});
