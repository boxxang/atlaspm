'use server';

import { revalidatePath } from 'next/cache';
import { ALL_ACTIVITIES as activitySteps } from '@/data/builtins';
import { prisma } from '@/lib/db';
import { canComplete, completionChecks } from '@/lib/meetings/completion';
import { dedupeLinks } from '@/lib/meetings/links';
import { readRule } from '@/lib/meetings/recurrence';
import { toActionItem, toAgendaItem, toDecision, toMeeting } from '@/lib/meetings/state';
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
  type CompletionMode,
  type Decision,
  type LinkRef,
  type Meeting,
  type MeetingFile,
  type MeetingSeries,
  type MeetingStatus,
} from '@/lib/meetings/types';
import { safeZone, zonedDayKey } from '@/lib/meetings/zonedTime';
import { copyActivities } from '@/lib/profileCopy';
import type { ActivityRow } from '@/lib/resolveActivities';

/**
 * Server actions for meetings.
 *
 * Every write names its programme, and every row it touches is checked against
 * that programme before anything is written: a meeting id, an agenda item, a
 * decision a new one supersedes, the meeting an action is carried into, the
 * risk or deliverable a link names. There is no auth in this app, so this is
 * not access control — it is what stops one programme's screen from writing
 * into another programme's rows through an id it was handed.
 *
 * Ids come from the client, as everywhere else, so an optimistic row and the
 * stored row are the same row.
 */

type Owned = 'series' | 'meeting' | 'agenda' | 'decision' | 'action' | 'file';

async function projectOf(kind: Owned, id: string): Promise<string | null> {
  const select = { projectId: true } as const;
  const row =
    kind === 'series'
      ? await prisma.meetingSeries.findUnique({ where: { id }, select })
      : kind === 'meeting'
        ? await prisma.meeting.findUnique({ where: { id }, select })
        : kind === 'agenda'
          ? await prisma.meetingAgendaItem.findUnique({ where: { id }, select })
          : kind === 'decision'
            ? await prisma.meetingDecision.findUnique({ where: { id }, select })
            : kind === 'action'
              ? await prisma.actionItem.findUnique({ where: { id }, select })
              : await prisma.meetingFile.findUnique({ where: { id }, select });
  return row?.projectId ?? null;
}

/** True when the row exists (and is this programme's); false when it is being created. */
async function claim(kind: Owned, id: string, projectId: string): Promise<boolean> {
  if (!id) throw new Error('A record needs an id.');
  const owner = await projectOf(kind, id);
  if (owner && owner !== projectId) throw new Error('That record belongs to another program.');
  return owner !== null;
}

/** A row that must already exist on this programme, when one is named at all. */
async function mustOwn(kind: Owned, id: string | null | undefined, projectId: string) {
  if (!id) return;
  if ((await projectOf(kind, id)) !== projectId) throw new Error('That record is not on this program.');
}

async function programme(projectId: string) {
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, profileId: true, meetingCompletionMode: true },
  });
  if (!p) throw new Error(`No such program: ${projectId}`);
  return p;
}

const touch = (projectId: string) => revalidatePath(`/p/${projectId}`);

/* ---------- input hygiene ---------- */

const text = (v: unknown, max = 20000): string => (typeof v === 'string' ? v : '').slice(0, max);
const line = (v: unknown, max = 300): string => text(v, max).trim();
const lines = (list: readonly string[] | undefined): string =>
  (list ?? [])
    .map((s) => line(s))
    .filter(Boolean)
    .join('\n');
const when = (v: unknown): Date | null =>
  v instanceof Date && !Number.isNaN(v.getTime()) ? v : null;
const whole = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/* ---------- links ---------- */

type LinkOwner =
  | { seriesId: string }
  | { meetingId: string }
  | { agendaItemId: string }
  | { decisionId: string }
  | { actionItemId: string };

/**
 * The links a caller sent, narrowed to ones this programme can name. Stages,
 * activities, steps and milestones are content keys every programme shares;
 * risks and deliverables are rows, and a row from elsewhere is dropped.
 */
async function cleanLinks(projectId: string, links: readonly LinkRef[] | undefined): Promise<LinkRef[]> {
  const typed = dedupeLinks(
    (links ?? [])
      .filter((l) => (LINK_TYPES as readonly string[]).includes(l?.type) && line(l.ref, 200))
      .map((l) => ({ type: l.type, ref: line(l.ref, 200) })),
  );
  const riskIds = typed.filter((l) => l.type === 'risk').map((l) => l.ref);
  const dlvIds = typed.filter((l) => l.type === 'deliverable').map((l) => l.ref);
  const [risks, dlvs] = await Promise.all([
    riskIds.length
      ? prisma.post.findMany({ where: { id: { in: riskIds }, projectId, kind: 'risk' }, select: { id: true } })
      : Promise.resolve([] as { id: string }[]),
    dlvIds.length
      ? prisma.deliverable.findMany({ where: { id: { in: dlvIds }, projectId }, select: { id: true } })
      : Promise.resolve([] as { id: string }[]),
  ]);
  const okRisk = new Set(risks.map((r) => r.id));
  const okDlv = new Set(dlvs.map((d) => d.id));
  return typed.filter((l) =>
    l.type === 'risk' ? okRisk.has(l.ref) : l.type === 'deliverable' ? okDlv.has(l.ref) : true,
  );
}

/** Replace one owner's links: the old set goes, the new set arrives, in one transaction. */
function linkWrites(projectId: string, owner: LinkOwner, links: readonly LinkRef[], by: string) {
  const [key, id] = Object.entries(owner)[0] as [string, string];
  const now = new Date();
  return [
    prisma.meetingLink.deleteMany({ where: { projectId, ...owner } }),
    ...(links.length
      ? [
          prisma.meetingLink.createMany({
            data: links.map((l, i) => ({
              id: `${key}:${id}:${String(i).padStart(3, '0')}`,
              projectId,
              ...owner,
              targetType: l.type,
              targetRef: l.ref,
              createdAt: now,
              createdBy: by,
            })),
          }),
        ]
      : []),
  ];
}

/* ---------- programme setting ---------- */

export async function setCompletionMode(projectId: string, mode: CompletionMode) {
  await programme(projectId);
  await prisma.project.update({
    where: { id: projectId },
    data: { meetingCompletionMode: oneOf(COMPLETION_MODES, mode, 'warn') },
  });
  touch(projectId);
}

/* ---------- series ---------- */

export async function saveSeries(projectId: string, s: MeetingSeries, author: string) {
  await programme(projectId);
  const exists = await claim('series', s.id, projectId);
  const title = line(s.title);
  if (!title) throw new Error('A series needs a title.');
  const by = line(author, 120);
  const now = new Date();
  const timeZone = safeZone(s.timeZone);
  const data = {
    title,
    purpose: text(s.purpose),
    type: oneOf(MEETING_TYPES, s.type, 'working_group'),
    owner: line(s.owner),
    attendees: lines(s.attendees),
    recurrence: JSON.stringify(readRule(s.recurrence, zonedDayKey(now, timeZone))),
    durationMinutes: whole(s.durationMinutes, 5, 24 * 60, 60),
    agendaTemplate: lines(s.agendaTemplate),
    timeZone,
    location: line(s.location, 500),
    accessScope: oneOf(ACCESS_SCOPES, s.accessScope, 'program'),
    status: s.status === 'inactive' ? 'inactive' : 'active',
    updatedAt: now,
    updatedBy: by,
  };
  const links = await cleanLinks(projectId, s.links);
  await prisma.$transaction([
    exists
      ? prisma.meetingSeries.update({ where: { id: s.id }, data })
      : prisma.meetingSeries.create({ data: { id: s.id, projectId, ...data, createdAt: now, createdBy: by } }),
    ...linkWrites(projectId, { seriesId: s.id }, links, by),
  ]);
  touch(projectId);
}

/** Its sittings stay, with their minutes and actions; they simply stop naming a series. */
export async function deleteSeries(projectId: string, id: string) {
  if (!(await claim('series', id, projectId))) return;
  await prisma.meetingSeries.delete({ where: { id } });
  touch(projectId);
}

/* ---------- meetings ---------- */

/**
 * Create or edit a meeting's facts: when, who, where, what it is about.
 *
 * Its status is not written here once it exists — starting, completing and
 * cancelling go through setMeetingStatus, which is where completion is checked.
 * A new meeting may arrive with its first agenda items, written in the same
 * transaction so a sitting never exists without the agenda it was made with.
 */
export async function saveMeeting(
  projectId: string,
  m: Meeting,
  agenda: readonly AgendaItem[],
  author: string,
) {
  await programme(projectId);
  const exists = await claim('meeting', m.id, projectId);
  await mustOwn('series', m.seriesId, projectId);
  const title = line(m.title);
  if (!title) throw new Error('A meeting needs a title.');
  const startsAt = when(m.startsAt);
  const endsAt = when(m.endsAt);
  if (!startsAt || !endsAt) throw new Error('A meeting needs a start and an end.');
  if (endsAt <= startsAt) throw new Error('A meeting has to end after it starts.');
  const by = line(author, 120);
  const now = new Date();

  const fields = {
    seriesId: m.seriesId || null,
    title,
    type: oneOf(MEETING_TYPES, m.type, 'working_group'),
    startsAt,
    endsAt,
    timeZone: safeZone(m.timeZone),
    owner: line(m.owner),
    facilitator: line(m.facilitator),
    location: line(m.location, 500),
    purpose: text(m.purpose),
    minutes: text(m.minutes, 100000),
    updatedAt: now,
    updatedBy: by,
  };
  const links = await cleanLinks(projectId, m.links);

  const newAgenda: AgendaItem[] = [];
  for (const a of agenda) {
    if (await claim('agenda', a.id, projectId)) continue;
    newAgenda.push(a);
  }
  const agendaLinks = await Promise.all(newAgenda.map((a) => cleanLinks(projectId, a.links)));

  await prisma.$transaction([
    exists
      ? prisma.meeting.update({ where: { id: m.id }, data: fields })
      : prisma.meeting.create({
          data: {
            id: m.id,
            projectId,
            ...fields,
            status: m.status === 'draft' ? 'draft' : 'scheduled',
            createdAt: now,
            createdBy: by,
          },
        }),
    prisma.meetingAttendee.deleteMany({ where: { projectId, meetingId: m.id } }),
    prisma.meetingAttendee.createMany({
      data: dedupeNames(m.attendees).map((a, position) => ({
        id: `${m.id}:att:${position}`,
        projectId,
        meetingId: m.id,
        name: a.name,
        optional: !!a.optional,
        position,
      })),
    }),
    ...linkWrites(projectId, { meetingId: m.id }, links, by),
    ...newAgenda.flatMap((a, i) => [
      prisma.meetingAgendaItem.create({
        data: { id: a.id, projectId, meetingId: m.id, ...agendaFields(a), createdAt: now, createdBy: by, updatedAt: now, updatedBy: by },
      }),
      ...linkWrites(projectId, { agendaItemId: a.id }, agendaLinks[i], by),
    ]),
  ]);
  touch(projectId);
}

/** One row per person: a name listed twice is one attendee, required if either said so. */
function dedupeNames(list: readonly { name: string; optional: boolean }[]) {
  const out = new Map<string, { name: string; optional: boolean }>();
  for (const a of list ?? []) {
    const name = line(a?.name, 120);
    if (!name) continue;
    const prev = out.get(name.toLowerCase());
    out.set(name.toLowerCase(), { name, optional: prev ? prev.optional && !!a.optional : !!a.optional });
  }
  return [...out.values()];
}

/**
 * Start, complete, cancel or reopen a meeting.
 *
 * Completion runs the same checks the screen ran. Under a programme that
 * enforces them, a meeting that fails is refused and the reasons come back as
 * a value — an expected outcome, not an exception.
 */
export async function setMeetingStatus(
  projectId: string,
  id: string,
  status: MeetingStatus,
  opts: { cancelReason?: string },
  author: string,
): Promise<{ ok: boolean; failing: string[] }> {
  const p = await programme(projectId);
  if (!(await claim('meeting', id, projectId))) throw new Error('No such meeting on this program.');
  const next = oneOf(MEETING_STATUSES, status, 'scheduled');

  if (next === 'completed') {
    const [row, agenda, decisions, actions] = await Promise.all([
      prisma.meeting.findUnique({ where: { id }, include: { attendees: true } }),
      prisma.meetingAgendaItem.findMany({ where: { projectId, meetingId: id } }),
      prisma.meetingDecision.findMany({ where: { projectId, meetingId: id } }),
      prisma.actionItem.findMany({
        where: { projectId, OR: [{ meetingId: id }, { carriedToMeetingId: id }] },
      }),
    ]);
    const verdict = canComplete(
      completionChecks({
        meeting: toMeeting(row!, []),
        agenda: agenda.map((a) => toAgendaItem(a, [])),
        decisions: decisions.map((d) => toDecision(d, [])),
        actions: actions.map((a) => toActionItem(a, [])),
      }),
      oneOf(COMPLETION_MODES, p.meetingCompletionMode, 'warn'),
    );
    if (!verdict.allowed) return { ok: false, failing: verdict.failing.map((c) => c.message) };
  }

  await prisma.meeting.update({
    where: { id },
    data: {
      status: next,
      completedAt: next === 'completed' ? new Date() : null,
      cancelReason: next === 'cancelled' ? line(opts.cancelReason, 500) : '',
      updatedAt: new Date(),
      updatedBy: line(author, 120),
    },
  });
  touch(projectId);
  return { ok: true, failing: [] };
}

/** Only a draft goes. A meeting that was ever scheduled is history, and is cancelled instead. */
export async function deleteMeeting(projectId: string, id: string) {
  if (!(await claim('meeting', id, projectId))) return;
  const row = await prisma.meeting.findUnique({ where: { id }, select: { status: true } });
  if (row?.status !== 'draft') {
    throw new Error('Only a draft meeting can be deleted — cancel a scheduled one instead.');
  }
  await prisma.meeting.delete({ where: { id } });
  touch(projectId);
}

/* ---------- agenda ---------- */

const agendaFields = (a: AgendaItem) => ({
  position: whole(a.position, 0, 10000, 0),
  title: line(a.title) || 'Untitled item',
  description: text(a.description),
  presenter: line(a.presenter),
  minutes: whole(a.minutes, 0, 24 * 60, 0),
  notes: text(a.notes, 100000),
  outcome: a.outcome ? oneOf(OUTCOMES, a.outcome, 'info') : '',
  status: a.status === 'discussed' ? 'discussed' : 'pending',
  deferral: a.deferral ? oneOf(DEFERRALS, a.deferral, 'next_meeting') : '',
  deferNote: line(a.deferNote, 1000),
  carriedFromId: a.carriedFromId || null,
});

export async function saveAgendaItem(projectId: string, a: AgendaItem, author: string) {
  await programme(projectId);
  const exists = await claim('agenda', a.id, projectId);
  await mustOwn('meeting', a.meetingId, projectId);
  await mustOwn('agenda', a.carriedFromId, projectId);
  if (!line(a.title)) throw new Error('An agenda item needs a title.');
  const by = line(author, 120);
  const now = new Date();
  const links = await cleanLinks(projectId, a.links);
  const fields = { ...agendaFields(a), updatedAt: now, updatedBy: by };
  await prisma.$transaction([
    exists
      ? prisma.meetingAgendaItem.update({ where: { id: a.id }, data: fields })
      : prisma.meetingAgendaItem.create({
          data: { id: a.id, projectId, meetingId: a.meetingId, ...fields, createdAt: now, createdBy: by },
        }),
    ...linkWrites(projectId, { agendaItemId: a.id }, links, by),
  ]);
  touch(projectId);
}

export async function reorderAgenda(projectId: string, meetingId: string, ids: readonly string[]) {
  await mustOwn('meeting', meetingId, projectId);
  await prisma.$transaction(
    ids.map((id, position) =>
      prisma.meetingAgendaItem.updateMany({ where: { id, projectId, meetingId }, data: { position } }),
    ),
  );
  touch(projectId);
}

export async function deleteAgendaItem(projectId: string, id: string) {
  if (!(await claim('agenda', id, projectId))) return;
  await prisma.meetingAgendaItem.delete({ where: { id } });
  touch(projectId);
}

/* ---------- decisions ---------- */

export async function saveDecision(projectId: string, d: Decision, author: string) {
  await programme(projectId);
  const exists = await claim('decision', d.id, projectId);
  await mustOwn('meeting', d.meetingId, projectId);
  await mustOwn('agenda', d.agendaItemId, projectId);
  await mustOwn('decision', d.supersedesId, projectId);
  if (d.supersedesId === d.id) throw new Error('A decision cannot supersede itself.');
  const title = line(d.title);
  if (!title) throw new Error('A decision needs a title.');
  const by = line(author, 120);
  const now = new Date();
  const links = await cleanLinks(projectId, d.links);
  const fields = {
    agendaItemId: d.agendaItemId || null,
    title,
    description: text(d.description),
    owner: line(d.owner),
    approvedBy: line(d.approvedBy),
    decidedOn: when(d.decidedOn),
    rationale: text(d.rationale),
    scope: line(d.scope, 500),
    status: oneOf(DECISION_STATUSES, d.status, 'proposed'),
    supersedesId: d.supersedesId || null,
    updatedAt: now,
    updatedBy: by,
  };
  await prisma.$transaction([
    exists
      ? prisma.meetingDecision.update({ where: { id: d.id }, data: fields })
      : prisma.meetingDecision.create({
          data: { id: d.id, projectId, meetingId: d.meetingId, ...fields, createdAt: now, createdBy: by },
        }),
    ...linkWrites(projectId, { decisionId: d.id }, links, by),
  ]);
  touch(projectId);
}

export async function deleteDecision(projectId: string, id: string) {
  if (!(await claim('decision', id, projectId))) return;
  await prisma.meetingDecision.delete({ where: { id } });
  touch(projectId);
}

/* ---------- action items ---------- */

/**
 * Create or edit an action item.
 *
 * Marking one Done stamps when; reopening clears it. Nothing else follows: the
 * step or activity it supports is not completed, and no date on the plan
 * moves, however late the action is. The step it became is written only by
 * convertActionToStep, so an edit cannot quietly claim a conversion.
 */
export async function saveActionItem(projectId: string, a: ActionItem, author: string) {
  await programme(projectId);
  const exists = await claim('action', a.id, projectId);
  await mustOwn('meeting', a.meetingId, projectId);
  await mustOwn('agenda', a.agendaItemId, projectId);
  await mustOwn('meeting', a.carriedToMeetingId, projectId);
  const description = line(a.description, 2000);
  if (!description) throw new Error('An action item needs a description.');
  const by = line(author, 120);
  const now = new Date();
  const status = oneOf(ACTION_STATUSES, a.status, 'open');
  const links = await cleanLinks(projectId, a.links);
  const fields = {
    meetingId: a.meetingId || null,
    agendaItemId: a.agendaItemId || null,
    description,
    owner: line(a.owner),
    contributors: lines(a.contributors),
    dueDate: when(a.due),
    priority: oneOf(PRIORITIES, a.priority, 'normal'),
    status,
    actionType: oneOf(ACTION_TYPES, a.actionType, 'support'),
    evidence: text(a.evidence),
    blocker: text(a.blocker),
    escalationDate: when(a.escalationDate),
    verifiedBy: line(a.verifiedBy),
    completedAt: status === 'done' ? (when(a.completedAt) ?? now) : null,
    scheduleImpact: a.scheduleImpact ? oneOf(SCHEDULE_IMPACTS, a.scheduleImpact, 'not_assessed') : '',
    impactNote: text(a.impactNote),
    carriedToMeetingId: a.carriedToMeetingId || null,
    updatedAt: now,
    updatedBy: by,
  };
  await prisma.$transaction([
    exists
      ? prisma.actionItem.update({ where: { id: a.id }, data: fields })
      : prisma.actionItem.create({ data: { id: a.id, projectId, ...fields, createdAt: now, createdBy: by } }),
    ...linkWrites(projectId, { actionItemId: a.id }, links, by),
  ]);
  touch(projectId);
}

export async function deleteActionItem(projectId: string, id: string) {
  if (!(await claim('action', id, projectId))) return;
  await prisma.actionItem.delete({ where: { id } });
  touch(projectId);
}

/** Carry open actions into a later sitting. They stay the source meeting's. */
export async function carryActions(
  projectId: string,
  ids: readonly string[],
  targetMeetingId: string,
  author: string,
) {
  await mustOwn('meeting', targetMeetingId, projectId);
  await prisma.actionItem.updateMany({
    where: { id: { in: [...ids] }, projectId, status: { in: ['open', 'in_progress', 'blocked'] } },
    data: { carriedToMeetingId: targetMeetingId, updatedAt: new Date(), updatedBy: line(author, 120) },
  });
  touch(projectId);
}

/**
 * Turn an action item into a new step on the plan.
 *
 * Only ever on request, and only after the person has been shown what it does
 * to the activity. The step is added to this programme alone: a programme that
 * shares its activity list — the built-in template, a published one, or one
 * another programme also runs — first gets a private copy, so nobody else's
 * plan grows a step.
 *
 * The step is appended after the activity's own, and an inherited activity
 * keeps inheriting everything else (see /lib/resolveActivities). The action
 * records the step it became.
 */
export async function convertActionToStep(input: {
  projectId: string;
  actionId: string;
  activityRef: string;
  text: string;
  tatWeeks: number;
  newProfileId: string;
  author: string;
}): Promise<{ profileId: string; profileLabel: string; stepN: number; activities: ActivityRow[] }> {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: {
      id: true,
      name: true,
      profileId: true,
      profile: { select: { name: true, builtin: true, template: true } },
    },
  });
  if (!project) throw new Error(`No such program: ${input.projectId}`);
  const action = await prisma.actionItem.findFirst({ where: { id: input.actionId, projectId: project.id } });
  if (!action) throw new Error('No such action item on this program.');
  if (action.convertedActivityRef) throw new Error('This action item has already become a step.');
  const stepText = line(input.text, 500);
  if (!stepText) throw new Error('The new step needs a description.');
  const tat = Number(input.tatWeeks);
  if (!(tat >= 1 / 7 && tat <= 52)) throw new Error('A step takes between a day and a year.');
  const ref = line(input.activityRef, 40);

  const shared =
    project.profile.builtin ||
    project.profile.template ||
    (await prisma.project.count({ where: { profileId: project.profileId, id: { not: project.id } } })) > 0;

  let profileId = project.profileId;
  let profileLabel = project.profile.name;
  if (shared) {
    profileId = line(input.newProfileId, 120);
    if (!profileId || (await prisma.profile.findUnique({ where: { id: profileId }, select: { id: true } }))) {
      throw new Error('Could not make this program its own copy of the plan.');
    }
    profileLabel = `${project.name} stages`;
    const stages = await prisma.profileStage.findMany({
      where: { profileId: project.profileId },
      orderBy: { order: 'asc' },
    });
    await prisma.profile.create({
      data: {
        id: profileId,
        name: profileLabel,
        builtin: false,
        template: false,
        stages: {
          create: stages.map((st) => ({
            id: `${profileId}:${st.key}`,
            key: st.key,
            order: st.order,
            title: st.title,
            shortTitle: st.shortTitle,
            phaseId: st.phaseId,
            baseKey: st.baseKey,
            startOffsetWeeks: st.startOffsetWeeks,
            durationWeeks: st.durationWeeks,
          })),
        },
      },
    });
    await copyActivities(prisma, project.profileId, profileId);
    await prisma.project.update({ where: { id: project.id }, data: { profileId } });
  }

  const activity = await prisma.profileActivity.findUnique({
    where: { profileId_ref: { profileId, ref } },
    include: { steps: { orderBy: { n: 'asc' } } },
  });
  if (!activity) throw new Error(`${ref} is not an activity this program runs.`);

  /* Numbered as the app will read it back: the inherited steps, then the
     steps already added, then this one. */
  const inherited = activity.baseRef ? (activitySteps[activity.baseRef]?.s.length ?? 0) : 0;
  const stepN = inherited + activity.steps.length + 1;
  const storedN = Math.max(inherited, ...activity.steps.map((s) => s.n)) + 1;
  const now = new Date();

  await prisma.$transaction([
    prisma.profileStep.create({
      data: {
        id: `${profileId}:act:${ref}:${storedN}`,
        activityId: activity.id,
        n: storedN,
        text: stepText,
        tat,
        lane: 'main',
      },
    }),
    prisma.actionItem.update({
      where: { id: action.id },
      data: {
        actionType: 'new_step',
        convertedActivityRef: ref,
        convertedStepN: stepN,
        updatedAt: now,
        updatedBy: line(input.author, 120),
      },
    }),
  ]);

  const rows = await prisma.profileActivity.findMany({
    where: { profileId },
    orderBy: { order: 'asc' },
    include: { steps: { orderBy: { n: 'asc' } } },
  });
  touch(project.id);
  revalidatePath('/');
  return {
    profileId,
    profileLabel,
    stepN,
    activities: rows.map((a) => ({
      ref: a.ref,
      stageKey: a.stageKey,
      order: a.order,
      title: a.title,
      windowFrom: a.windowFrom,
      windowTo: a.windowTo,
      baseRef: a.baseRef,
      steps: a.steps.map((s) => ({ n: s.n, text: s.text, tat: s.tat, lane: s.lane })),
    })),
  };
}

/* ---------- files ---------- */

export async function saveMeetingFile(projectId: string, f: MeetingFile, author: string) {
  await programme(projectId);
  const exists = await claim('file', f.id, projectId);
  await mustOwn('meeting', f.meetingId, projectId);
  await mustOwn('decision', f.decisionId, projectId);
  await mustOwn('action', f.actionItemId, projectId);
  if (!f.meetingId && !f.decisionId && !f.actionItemId) {
    throw new Error('A file belongs to a meeting, a decision or an action item.');
  }
  const url = line(f.url, 2000);
  if (url && !/^https?:\/\//i.test(url)) throw new Error('A link has to start with http:// or https://.');
  const title = line(f.title) || url;
  if (!title) throw new Error('A file needs a title or a link.');
  const data = {
    meetingId: f.meetingId || null,
    decisionId: f.decisionId || null,
    actionItemId: f.actionItemId || null,
    category: oneOf(FILE_CATEGORIES, f.category, 'attachment'),
    title,
    url,
  };
  if (exists) await prisma.meetingFile.update({ where: { id: f.id }, data });
  else
    await prisma.meetingFile.create({
      data: { id: f.id, projectId, ...data, createdAt: new Date(), createdBy: line(author, 120) },
    });
  touch(projectId);
}

export async function deleteMeetingFile(projectId: string, id: string) {
  if (!(await claim('file', id, projectId))) return;
  await prisma.meetingFile.delete({ where: { id } });
  touch(projectId);
}
