'use client';

import type { ActionItem, AgendaItem, Decision, FileCategory, MeetingFile } from '@/lib/meetings/types';
import { ME } from '@/store/meetingStore';
import { uid } from '@/store/useAppStore';

/**
 * New rows, every field present, stamped by the person using the app. The
 * editors start from these, so a field nobody touched is saved as its default
 * rather than missing.
 */
const stamp = () => {
  const now = new Date();
  return { createdAt: now, updatedAt: now, createdBy: ME, updatedBy: ME };
};

export const blankAgenda = (projectId: string, meetingId: string, position: number, title: string): AgendaItem => ({
  id: uid(),
  projectId,
  meetingId,
  position,
  title,
  description: '',
  presenter: '',
  minutes: 0,
  notes: '',
  outcome: '',
  status: 'pending',
  deferral: '',
  deferNote: '',
  carriedFromId: null,
  links: [],
  ...stamp(),
});

export const blankDecision = (projectId: string, meetingId: string, over: Partial<Decision> = {}): Decision => ({
  id: uid(),
  projectId,
  meetingId,
  agendaItemId: null,
  title: '',
  description: '',
  owner: '',
  approvedBy: '',
  decidedOn: null,
  rationale: '',
  scope: '',
  status: 'proposed',
  supersedesId: null,
  links: [],
  ...stamp(),
  ...over,
});

export const blankAction = (projectId: string, meetingId: string | null, over: Partial<ActionItem> = {}): ActionItem => ({
  id: uid(),
  projectId,
  meetingId,
  agendaItemId: null,
  description: '',
  owner: '',
  contributors: [],
  due: null,
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
  ...stamp(),
  ...over,
});

export const blankFile = (
  projectId: string,
  owner: { meetingId?: string | null; decisionId?: string | null; actionItemId?: string | null },
  category: FileCategory,
  title: string,
  url = '',
): MeetingFile => ({
  id: uid(),
  projectId,
  meetingId: owner.meetingId ?? null,
  decisionId: owner.decisionId ?? null,
  actionItemId: owner.actionItemId ?? null,
  category,
  title,
  url,
  attachments: [],
  createdAt: new Date(),
  createdBy: ME,
});
