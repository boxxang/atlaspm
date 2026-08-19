'use server';

import { revalidatePath } from 'next/cache';
import { journeyData } from '@/data/journey';
import { scheduleProfiles, type ProfileId } from '@/data/scheduleProfiles';
import type { ItemKind, StageBaseline, StageId } from '@/data/types';
import { prisma } from '@/lib/db';
import { DB_KIND } from '@/lib/projectState';
import {
  MAX_ATTACHMENT_BYTES,
  safeFilename,
  type AttachmentMeta,
} from '@/lib/attachments';
import { computeSchedule } from '@/lib/schedule';

/**
 * Server actions for every mutation the UI makes.
 *
 * Ids are generated on the client and passed in, so the optimistic row and the
 * stored row share an identity — a follow-up edit to a just-created item finds
 * it on the server. Every mutation names the program it belongs to; there is no
 * auth in this pass, so that id is checked for existence but not for access.
 */
async function assertProject(projectId: string): Promise<string> {
  const p = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!p) throw new Error(`No such program: ${projectId}`);
  return p.id;
}

/** Refresh the program's own page and the list that summarises it. */
const touch = (projectId?: string) => {
  if (projectId) revalidatePath(`/p/${projectId}`);
  revalidatePath('/');
};

/* ---------- project ---------- */

export async function renameProject(projectId: string, name: string) {
  await prisma.project.update({ where: { id: await assertProject(projectId) }, data: { name } });
  touch(projectId);
}

export async function setKickoff(projectId: string, kickoff: Date) {
  await prisma.project.update({ where: { id: await assertProject(projectId) }, data: { kickoff } });
  touch(projectId);
}

/** Switching profile drops every override, as in the prototype. */
export async function setProfile(projectId: string, profileId: string) {
  const id = await assertProject(projectId);
  await prisma.$transaction([
    prisma.stageOverride.deleteMany({ where: { projectId: id } }),
    prisma.project.update({ where: { id }, data: { profileId } }),
  ]);
  touch(projectId);
}

/* ---------- schedule ---------- */

/** Stores the effective offsets/durations for every stage after a date edit. */
export async function saveOverrides(
  projectId: string,
  overrides: Record<string, StageBaseline>,
) {
  const id = await assertProject(projectId);
  await prisma.$transaction([
    prisma.stageOverride.deleteMany({ where: { projectId: id } }),
    prisma.stageOverride.createMany({
      data: Object.entries(overrides).map(([stageId, o]) => ({
        id: `${id}:override:${stageId}`,
        projectId: id,
        stageId,
        startOffsetWeeks: o.startOffsetWeeks,
        durationWeeks: o.durationWeeks,
      })),
    }),
  ]);
  touch(projectId);
}

export async function resetOverrides(projectId: string) {
  await prisma.stageOverride.deleteMany({ where: { projectId: await assertProject(projectId) } });
  touch(projectId);
}

/* ---------- items ---------- */

export interface ItemInput {
  projectId: string;
  id: string;
  stageId: StageId;
  kind: ItemKind;
  title: string;
  owner: string;
  body: string;
  due: Date | null;
  done: boolean;
  updatedAt: Date;
}

export async function saveItem(input: ItemInput) {
  const pid = await assertProject(input.projectId);
  /* Pick the columns explicitly: callers hand over whole store items, which
     also carry `updated` and `updates` that have no column of their own. */
  const fields = {
    title: input.title,
    owner: input.owner,
    body: input.body,
    due: input.due,
    done: input.done,
    updatedAt: input.updatedAt,
  };
  await prisma.item.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      projectId: pid,
      stageId: input.stageId,
      kind: DB_KIND[input.kind],
      ...fields,
    },
    update: fields,
  });
  touch(pid);
}

export async function deleteItem(projectId: string, itemId: string) {
  await prisma.item.delete({ where: { id: itemId } });
  touch(projectId);
}

/* ---------- status updates ---------- */

export async function postUpdate(input: {
  projectId: string;
  id: string;
  itemId: string;
  text: string;
  createdAt: Date;
}) {
  const { projectId, ...su } = input;
  await prisma.$transaction([
    prisma.statusUpdate.create({ data: su }),
    prisma.item.update({ where: { id: su.itemId }, data: { updatedAt: su.createdAt } }),
  ]);
  touch(projectId);
}

/** Editing rewrites the text only — createdAt is the honest post time. */
export async function editUpdate(projectId: string, id: string, text: string) {
  await prisma.statusUpdate.update({ where: { id }, data: { text } });
  touch(projectId);
}

export async function deleteUpdate(projectId: string, id: string) {
  await prisma.statusUpdate.delete({ where: { id } });
  touch(projectId);
}

/* ---------- deliverables ---------- */

export async function setDeliverableDone(
  projectId: string,
  id: string,
  done: boolean,
  completedAt: Date | null,
) {
  await prisma.deliverable.update({ where: { id }, data: { done, completedAt } });
  touch(projectId);
}

export async function setDeliverableDue(projectId: string, id: string, due: Date | null) {
  await prisma.deliverable.update({ where: { id }, data: { due } });
  touch(projectId);
}

export async function addDeliverable(input: {
  projectId: string;
  id: string;
  stageId: StageId;
  title: string;
  due: Date | null;
}) {
  const { projectId, ...rest } = input;
  const pid = await assertProject(projectId);
  const last = await prisma.deliverable.findFirst({
    where: { projectId: pid, stageId: rest.stageId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  await prisma.deliverable.create({
    data: {
      ...rest,
      projectId: pid,
      done: false,
      completedAt: null,
      position: (last?.position ?? -1) + 1,
    },
  });
  touch(projectId);
}

export async function deleteDeliverable(projectId: string, id: string) {
  await prisma.deliverable.delete({ where: { id } });
  touch(projectId);
}

/* ---------- leaders and contacts ---------- */

export async function saveLeader(
  projectId: string,
  stageId: StageId,
  leader: { name: string; short: string; phone: string; email: string },
) {
  const pid = await assertProject(projectId);
  await prisma.leader.upsert({
    where: { projectId_stageId: { projectId: pid, stageId } },
    create: { id: `${pid}:leader:${stageId}`, projectId: pid, stageId, ...leader },
    update: leader,
  });
  touch(projectId);
}

export async function saveContact(input: {
  projectId: string;
  id: string;
  stageId: StageId;
  name: string;
  role: string;
  email: string;
  phone: string;
}) {
  const { projectId, id, stageId, ...rest } = input;
  const pid = await assertProject(projectId);
  const last = await prisma.contact.findFirst({
    where: { projectId: pid, stageId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  await prisma.contact.upsert({
    where: { id },
    create: { id, projectId: pid, stageId, ...rest, position: (last?.position ?? -1) + 1 },
    update: rest,
  });
  touch(projectId);
}

export async function deleteContact(projectId: string, id: string) {
  await prisma.contact.delete({ where: { id } });
  touch(projectId);
}

/* ---------- programs ---------- */

/**
 * Create a program.
 *
 * The boards start empty — a new program has no key information, activities or
 * risks until someone writes them. What it does get is the stage scaffolding:
 * each stage's standard deliverables from /data/journey, dated to that stage's
 * end under the chosen profile and kickoff. Milestones need no rows at all;
 * they are derived from kickoff + profile offsets like every other date.
 *
 * Leaders and contacts stay empty too: journeyData's are example names, and
 * putting them on a real program would be inventing its staffing.
 */
export async function createProject(input: {
  id: string;
  name: string;
  kickoff: Date;
  profileId: string;
}) {
  const profile = scheduleProfiles[input.profileId as ProfileId];
  if (!profile) throw new Error(`Unknown profile: ${input.profileId}`);
  const name = input.name.trim();
  if (!name) throw new Error('A program needs a name.');

  const schedule = computeSchedule(input.kickoff, profile, {});

  await prisma.project.create({
    data: {
      id: input.id,
      name,
      kickoff: input.kickoff,
      profileId: input.profileId,
      deliverables: {
        create: journeyData.flatMap((stage) =>
          stage.deliverables.map((title, position) => ({
            id: `${input.id}:dlv:${stage.id}:${position}`,
            stageId: stage.id,
            title,
            due: schedule.stages[stage.id].end,
            done: false,
            completedAt: null,
            position,
          })),
        ),
      },
    },
  });
  revalidatePath('/');
  return input.id;
}

/** Cascades through items, updates, deliverables, leaders and contacts. */
export async function deleteProject(projectId: string) {
  await prisma.project.delete({ where: { id: await assertProject(projectId) } });
  revalidatePath('/');
}

/* ---------- stage detail ---------- */

/**
 * Overrides one program's copy of a stage's descriptive text. Null fields fall
 * back to the shared definition in /data/journey.ts, so clearing every field
 * drops the row and restores the default rather than freezing a copy of it.
 */
export async function saveStageDetail(
  projectId: string,
  stageId: StageId,
  detail: {
    description: string | null;
    engineeringView: string | null;
    programView: string | null;
    tools: string | null;
    collaboration: string | null;
  },
) {
  const pid = await assertProject(projectId);
  const empty = !Object.values(detail).some(Boolean);
  if (empty) {
    await prisma.stageDetail.deleteMany({ where: { projectId: pid, stageId } });
  } else {
    await prisma.stageDetail.upsert({
      where: { projectId_stageId: { projectId: pid, stageId } },
      create: { id: `${pid}:detail:${stageId}`, projectId: pid, stageId, ...detail },
      update: detail,
    });
  }
  touch(projectId);
}

/* ---------- attachments ---------- */

/**
 * Stores files against an item or one of its status updates.
 *
 * Ids come from the client like everywhere else, so the optimistic chip and the
 * stored row are the same thing. Oversized files are rejected here as well as
 * in the browser — a server action is reachable by direct POST.
 */
export async function uploadAttachments(form: FormData): Promise<AttachmentMeta[]> {
  const projectId = String(form.get('projectId') ?? '');
  const itemId = String(form.get('itemId') ?? '') || null;
  const statusUpdateId = String(form.get('statusUpdateId') ?? '') || null;
  if (!itemId && !statusUpdateId) throw new Error('An attachment needs an item or an update.');
  await assertProject(projectId);

  const ids = form.getAll('ids').map(String);
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  const saved: AttachmentMeta[] = [];

  for (const [i, file] of files.entries()) {
    if (file.size === 0 || file.size > MAX_ATTACHMENT_BYTES) continue;
    const id = ids[i];
    if (!id) continue;
    const meta = {
      id,
      filename: safeFilename(file.name),
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    };
    await prisma.attachment.create({
      data: {
        ...meta,
        itemId,
        statusUpdateId,
        data: Buffer.from(await file.arrayBuffer()),
        createdAt: new Date(),
      },
    });
    saved.push(meta);
  }
  touch(projectId);
  return saved;
}

export async function deleteAttachment(projectId: string, id: string) {
  await prisma.attachment.delete({ where: { id } });
  touch(projectId);
}
