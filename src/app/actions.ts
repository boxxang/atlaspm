'use server';

import { revalidatePath } from 'next/cache';
import type { ItemKind, StageId } from '@/data/types';
import { prisma } from '@/lib/db';
import { DB_KIND } from '@/lib/projectState';
import type { StageBaseline } from '@/data/types';

/**
 * Server actions for every mutation the UI makes.
 *
 * Ids are generated on the client and passed in, so the optimistic row and the
 * stored row share an identity — a follow-up edit to a just-created item finds
 * it on the server. Single-project for this pass, so the project is resolved
 * here rather than trusted from the client.
 */
async function projectId(): Promise<string> {
  const p = await prisma.project.findFirst({ orderBy: { id: 'asc' }, select: { id: true } });
  if (!p) throw new Error('No project in the database — run `npm run db:seed`.');
  return p.id;
}

/** Every mutation lands on one page; keep its RSC payload fresh. */
const touch = () => revalidatePath('/');

/* ---------- project ---------- */

export async function renameProject(name: string) {
  await prisma.project.update({ where: { id: await projectId() }, data: { name } });
  touch();
}

export async function setKickoff(kickoff: Date) {
  await prisma.project.update({ where: { id: await projectId() }, data: { kickoff } });
  touch();
}

/** Switching profile drops every override, as in the prototype. */
export async function setProfile(profileId: string) {
  const id = await projectId();
  await prisma.$transaction([
    prisma.stageOverride.deleteMany({ where: { projectId: id } }),
    prisma.project.update({ where: { id }, data: { profileId } }),
  ]);
  touch();
}

/* ---------- schedule ---------- */

/** Stores the effective offsets/durations for every stage after a date edit. */
export async function saveOverrides(overrides: Record<string, StageBaseline>) {
  const id = await projectId();
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
  touch();
}

export async function resetOverrides() {
  await prisma.stageOverride.deleteMany({ where: { projectId: await projectId() } });
  touch();
}

/* ---------- items ---------- */

export interface ItemInput {
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
  const pid = await projectId();
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
  touch();
}

export async function deleteItem(itemId: string) {
  await prisma.item.delete({ where: { id: itemId } });
  touch();
}

/* ---------- status updates ---------- */

export async function postUpdate(input: {
  id: string;
  itemId: string;
  text: string;
  createdAt: Date;
}) {
  await prisma.$transaction([
    prisma.statusUpdate.create({ data: input }),
    prisma.item.update({
      where: { id: input.itemId },
      data: { updatedAt: input.createdAt },
    }),
  ]);
  touch();
}

/** Editing rewrites the text only — createdAt is the honest post time. */
export async function editUpdate(id: string, text: string) {
  await prisma.statusUpdate.update({ where: { id }, data: { text } });
  touch();
}

export async function deleteUpdate(id: string) {
  await prisma.statusUpdate.delete({ where: { id } });
  touch();
}

/* ---------- deliverables ---------- */

export async function setDeliverableDone(id: string, done: boolean, completedAt: Date | null) {
  await prisma.deliverable.update({ where: { id }, data: { done, completedAt } });
  touch();
}

export async function setDeliverableDue(id: string, due: Date | null) {
  await prisma.deliverable.update({ where: { id }, data: { due } });
  touch();
}

export async function addDeliverable(input: {
  id: string;
  stageId: StageId;
  title: string;
  due: Date | null;
}) {
  const pid = await projectId();
  const last = await prisma.deliverable.findFirst({
    where: { projectId: pid, stageId: input.stageId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  await prisma.deliverable.create({
    data: {
      ...input,
      projectId: pid,
      done: false,
      completedAt: null,
      position: (last?.position ?? -1) + 1,
    },
  });
  touch();
}

export async function deleteDeliverable(id: string) {
  await prisma.deliverable.delete({ where: { id } });
  touch();
}

/* ---------- leaders and contacts ---------- */

export async function saveLeader(
  stageId: StageId,
  leader: { name: string; short: string; phone: string; email: string },
) {
  const pid = await projectId();
  await prisma.leader.upsert({
    where: { projectId_stageId: { projectId: pid, stageId } },
    create: { id: `${pid}:leader:${stageId}`, projectId: pid, stageId, ...leader },
    update: leader,
  });
  touch();
}

export async function saveContact(input: {
  id: string;
  stageId: StageId;
  name: string;
  role: string;
  email: string;
  phone: string;
}) {
  const pid = await projectId();
  const { id, stageId, ...rest } = input;
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
  touch();
}

export async function deleteContact(id: string) {
  await prisma.contact.delete({ where: { id } });
  touch();
}
