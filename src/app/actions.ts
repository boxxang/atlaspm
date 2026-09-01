'use server';

import { revalidatePath } from 'next/cache';
import { stageMilestone } from '@/data/scheduleProfiles';
import type { ItemKind, ScheduleProfile, StageBaseline, StageId } from '@/data/types';
import { pickStages } from '@/lib/customProfile';
import { prisma } from '@/lib/db';
import { DB_KIND } from '@/lib/projectState';
import { resolveStages } from '@/lib/stages';
import {
  MAX_ATTACHMENT_BYTES,
  safeFilename,
  type AttachmentMeta,
} from '@/lib/attachments';
import { addWeeks, computeSchedule } from '@/lib/schedule';

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
  /** Who raised it — the board's original poster. */
  author?: string;
  /** What the post is about: an activity, and optionally a step of it. */
  activityRef?: string | null;
  stepN?: number | null;
  /** The key deliverable this activity is work towards, if any. */
  deliverableId?: string | null;
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
    author: input.author ?? '',
    activityRef: input.activityRef ?? null,
    stepN: input.stepN ?? null,
    deliverableId: input.deliverableId ?? null,
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
  author: string;
  createdAt: Date;
}) {
  const { projectId, ...su } = input;
  await prisma.$transaction([
    /* kind 'update' is a post on a board item — the same table now holds risks
       flagged on a step, key-info notes and deliverable handovers. The author
       is recorded rather than blanked: a comment on the communication board is
       somebody's, and a board of anonymous replies answers nothing. */
    prisma.post.create({ data: { ...su, projectId, kind: 'update' } }),
    prisma.item.update({ where: { id: su.itemId }, data: { updatedAt: su.createdAt } }),
  ]);
  touch(projectId);
}

/** Editing rewrites the text only — createdAt is the honest post time. */
export async function editUpdate(projectId: string, id: string, text: string) {
  await prisma.post.update({ where: { id }, data: { text } });
  touch(projectId);
}

export async function deleteUpdate(projectId: string, id: string) {
  await prisma.post.delete({ where: { id } });
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

/**
 * The completion stamp is written when the box is ticked, but it is a date like
 * any other after that: a deliverable finished last week and ticked off today
 * should say last week.
 */
export async function setDeliverableCompleted(
  projectId: string,
  id: string,
  completedAt: Date | null,
) {
  await prisma.deliverable.update({ where: { id }, data: { completedAt } });
  touch(projectId);
}

export async function setDeliverableDue(projectId: string, id: string, due: Date | null) {
  await prisma.deliverable.update({ where: { id }, data: { due } });
  touch(projectId);
}

/* ---------- posts ---------- */

/**
 * Write a post.
 *
 * One action for all of it, because a post is one shape wherever it lands: an
 * update on a step, a risk flagged on that step, a note on a stage's key-info
 * board, the handover that completes a deliverable, or a reply under any of
 * them. Exactly one target is set — a reply sets `parentId` and nothing else,
 * because it belongs to its parent and the parent knows where it is.
 *
 * The id comes from the caller so the optimistic row and the stored row are the
 * same row.
 */
export async function savePost(input: {
  projectId: string;
  id: string;
  kind: string;
  text: string;
  author: string;
  activityRef?: string | null;
  stepN?: number | null;
  stageId?: string | null;
  deliverableId?: string | null;
  itemId?: string | null;
  parentId?: string | null;
  doneAt?: Date | null;
}) {
  const { projectId, id, ...post } = input;
  await assertProject(projectId);
  await prisma.post.upsert({
    where: { id },
    /* An edit changes what was said and when it was said again — never who said
       it, and never where it lives. */
    update: { text: post.text, editedAt: new Date(), doneAt: post.doneAt ?? null },
    create: { id, projectId, createdAt: new Date(), ...post },
  });
  touch(projectId);
}

/** Delete a post. Its replies and attachments go with it, by cascade. */
export async function deletePost(projectId: string, id: string) {
  await assertProject(projectId);
  await prisma.post.delete({ where: { id } });
  touch(projectId);
}

/* ---------- steps ---------- */

/**
 * What has happened to one step.
 *
 * Addressed by activity reference and step number rather than by a row id,
 * because steps are content: they live in the generated write-ups and have no
 * rows of their own. The upsert is on that pair, so the first time anyone
 * touches a step is a create and every time after is an update, and nothing has
 * to ask which.
 *
 * A partial patch: the panel edits one field at a time, and a step nobody has
 * set an owner on should not have its owner cleared because its percentage
 * moved.
 */
export async function saveStepState(input: {
  projectId: string;
  activityRef: string;
  stepN: number;
  done?: boolean;
  doneAt?: Date | null;
  pct?: number;
  owner?: string;
  dueOverride?: Date | null;
}) {
  const { projectId, activityRef, stepN, ...patch } = input;
  await assertProject(projectId);
  await prisma.stepState.upsert({
    where: { projectId_activityRef_stepN: { projectId, activityRef, stepN } },
    update: patch,
    /* the defaults of an untouched step, so a first write of one field does not
       invent values for the rest */
    create: {
      projectId,
      activityRef,
      stepN,
      done: patch.done ?? false,
      doneAt: patch.doneAt ?? null,
      pct: patch.pct ?? 0,
      owner: patch.owner ?? '',
      dueOverride: patch.dueOverride ?? null,
    },
  });
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

/* ---------- profiles ---------- */

/** Read a stored profile in the shape the schedule engine takes. */
async function loadProfile(profileId: string): Promise<ScheduleProfile> {
  const row = await prisma.profile.findUnique({
    where: { id: profileId },
    include: { stages: { orderBy: { order: 'asc' } } },
  });
  if (!row) throw new Error(`Unknown profile: ${profileId}`);
  return {
    id: row.id,
    label: row.name,
    builtin: row.builtin,
    template: row.template,
    stages: row.stages,
  };
}

export interface StageInput {
  key: string;
  title: string;
  shortTitle: string;
  phaseId: string;
  baseKey: string | null;
  startOffsetWeeks: number;
  durationWeeks: number;
}

interface SaveStagesInput {
  projectId: string;
  /** Id to mint a profile under, when this edit needs one of its own. */
  newProfileId: string;
  stages: StageInput[];
  /** Publish these stages as a template others can start from. */
  template?: { name: string };
}

/**
 * Rewrite the stages a program runs on.
 *
 * Editing stages is about this program, not about authoring a template: the
 * change lands on the program you are looking at and on nothing else. A
 * program already on a profile of its own is edited in place; one sharing a
 * profile — the built-in one, or a template two programs picked — gets a
 * private copy first, so nobody else is rescheduled by the edit.
 *
 * Passing `template` publishes the same stages under a name, which is what puts
 * them in the profile pickers for other programs to start from.
 *
 * Stage keys survive the copy, which is what lets the boards, deliverables,
 * contacts and leader come along. Content on a stage that was removed is
 * deleted with it; overrides survive only where the baseline did not move,
 * since an override is a manual edit of that baseline.
 */
export async function saveProjectStages(input: SaveStagesInput) {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { id: true, name: true, profileId: true },
  });
  if (!project) throw new Error(`No such program: ${input.projectId}`);

  const current = await loadProfile(project.profileId);
  if (!input.stages.length) throw new Error('A program needs at least one stage.');

  const keys = new Set<string>();
  for (const st of input.stages) {
    if (!st.title.trim()) throw new Error('Every stage needs a title.');
    if (keys.has(st.key)) throw new Error(`Duplicate stage: ${st.key}`);
    keys.add(st.key);
    if (st.durationWeeks < 1 / 7) throw new Error(`${st.title} is shorter than a day.`);
    if (st.startOffsetWeeks < 0) throw new Error(`${st.title} starts before kickoff.`);
  }
  /* Milestones are anchored to stages, so a stage carrying one cannot leave
     without taking Tapeout, First Silicon or Production with it. */
  for (const st of current.stages) {
    const ms = stageMilestone[st.key];
    if (ms && !keys.has(st.key)) {
      throw new Error(`${st.title} carries the ${ms.label} milestone and cannot be deleted.`);
    }
  }

  const templateName = input.template?.name.trim();
  if (input.template && !templateName) throw new Error('A template needs a name.');
  if (templateName) await assertProfileNameFree(templateName);

  const others = await prisma.project.count({
    where: { profileId: current.id, id: { not: project.id } },
  });
  /* "Private" means this program is the only thing the profile describes. */
  const isPrivate = !current.builtin && !current.template && others === 0;
  const needsOwn = !isPrivate || !!templateName;
  const profileId = needsOwn ? input.newProfileId : current.id;

  if (needsOwn) {
    await prisma.profile.create({
      data: {
        id: profileId,
        name: templateName ?? `${project.name} stages`,
        builtin: false,
        template: !!templateName,
      },
    });
  } else {
    await prisma.profile.update({
      where: { id: profileId },
      data: { name: `${project.name} stages` },
    });
    await prisma.profileStage.deleteMany({
      where: { profileId, key: { notIn: [...keys] } },
    });
  }

  await prisma.$transaction(
    input.stages.map((st, order) =>
      prisma.profileStage.upsert({
        where: { profileId_key: { profileId, key: st.key } },
        create: {
          id: `${profileId}:${st.key}`,
          profileId,
          key: st.key,
          order,
          title: st.title.trim(),
          shortTitle: st.shortTitle.trim(),
          phaseId: st.phaseId,
          baseKey: st.baseKey,
          startOffsetWeeks: st.startOffsetWeeks,
          durationWeeks: st.durationWeeks,
        },
        update: {
          order,
          title: st.title.trim(),
          shortTitle: st.shortTitle.trim(),
          phaseId: st.phaseId,
          startOffsetWeeks: st.startOffsetWeeks,
          durationWeeks: st.durationWeeks,
        },
      }),
    ),
  );

  /* Content of stages that are gone, and overrides that no longer describe an
     edit of the baseline they were made against. */
  const dropped = current.stages.map((st) => st.key).filter((key) => !keys.has(key));
  const moved = input.stages
    .filter((st) => {
      const was = current.stages.find((c) => c.key === st.key);
      return (
        was &&
        (was.startOffsetWeeks !== st.startOffsetWeeks ||
          was.durationWeeks !== st.durationWeeks)
      );
    })
    .map((st) => st.key);

  const where = { projectId: project.id, stageId: { in: dropped } };
  await prisma.$transaction([
    prisma.item.deleteMany({ where }),
    prisma.deliverable.deleteMany({ where }),
    prisma.leader.deleteMany({ where }),
    prisma.contact.deleteMany({ where }),
    prisma.stageDetail.deleteMany({ where }),
    prisma.stageOverride.deleteMany({
      where: { projectId: project.id, stageId: { in: [...dropped, ...moved] } },
    }),
    prisma.project.update({ where: { id: project.id }, data: { profileId } }),
  ]);

  /* A profile nobody is on any more is nobody's history — drop it, unless it
     is a template or the built-in one, which exist to be started from. */
  if (profileId !== current.id && !current.builtin && !current.template) {
    const left = await prisma.project.count({ where: { profileId: current.id } });
    if (left === 0) await prisma.profile.delete({ where: { id: current.id } });
  }

  touch(project.id);
  return { profileId, template: !!templateName };
}

/**
 * Names are how templates are told apart, so two may not share one. Only
 * templates are compared: a program's private profile is named after the
 * program and never appears in a picker, so it cannot be confused with one.
 */
async function assertProfileNameFree(name: string) {
  /* SQLite has no case-insensitive filter that also travels to Postgres, so the
     comparison is done here rather than in the query. */
  const taken = await prisma.profile.findMany({
    where: { template: true },
    select: { name: true },
  });
  const wanted = name.trim().toLocaleLowerCase();
  if (taken.some((p) => p.name.trim().toLocaleLowerCase() === wanted)) {
    throw new Error(`A profile called "${name}" already exists.`);
  }
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
 *
 * `stageKeys` starts the program on some of the template's stages rather than
 * all of them. That is a different stage list, so it is a different profile:
 * the program gets a private one of its own — not a template, so it is never
 * offered to anybody else — by exactly the mechanism that editing a program's
 * stages already uses. The template itself is untouched, which is the point.
 */
export async function createProject(input: {
  id: string;
  name: string;
  kickoff: Date;
  profileId: string;
  /** A subset of the template's stages; omitted means all of them. */
  stageKeys?: string[];
  /** Fully-loaded rate. Without one the cost column can only ever be empty. */
  costPerManMonth?: number;
}) {
  const name = input.name.trim();
  if (!name) throw new Error('A program needs a name.');

  const template = await loadProfile(input.profileId);

  /* A template is a blueprint, not a live reference. The programme takes a copy
     of the stages it was created on and is independent from then on, so editing
     the template afterwards reschedules nothing already running.

     The copy happened before this, but only when somebody picked a subset of
     the stages; a programme taking all of them pointed at the shared template
     row and moved whenever it did. Copying always is what turns the rule from
     usually true into true, and it is what makes template editing safe to
     offer at all. */
  const stageDefs =
    input.stageKeys && input.stageKeys.length !== template.stages.length
      ? pickStages(template.stages, input.stageKeys)
      : [...template.stages];

  const profileId = `${input.id}:stages`;
  await prisma.profile.create({
    data: {
      id: profileId,
      name: `${name} stages`,
      builtin: false,
      /* Not offered in the pickers: this is one programme's stage list, not
         something to start another programme from. */
      template: false,
      stages: {
        create: stageDefs.map((st) => ({
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
  await copyActivities(input.profileId, profileId);

  const profile: ScheduleProfile = {
    ...template,
    id: profileId,
    template: false,
    builtin: false,
    stages: stageDefs,
  };

  const schedule = computeSchedule(input.kickoff, profile, {});
  const stages = resolveStages(profile);

  await prisma.project.create({
    data: {
      id: input.id,
      name,
      kickoff: input.kickoff,
      profileId,
      costPerManMonth:
        Number.isFinite(input.costPerManMonth) && input.costPerManMonth! >= 0
          ? input.costPerManMonth!
          : 0,
      deliverables: {
        /* Dated by the stage's own plan, which says the week each artefact is
           due — the week the work that makes it finishes. A stage with no plan
           falls back to even fractions of its span, last one on the end date,
           which is a spread rather than a schedule but is at least ordered. */
        create: stages.flatMap((stage) => {
          const st = schedule.stages[stage.id];
          const planned = stage.deliverableWeek;
          return stage.deliverables.map((title, position) => ({
            id: `${input.id}:dlv:${stage.id}:${position}`,
            stageId: stage.id,
            title,
            due: addWeeks(
              st.start,
              planned?.[position] ??
                (st.durationWeeks * (position + 1)) / stage.deliverables.length,
            ),
            done: false,
            completedAt: null,
            position,
          }));
        }),
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

/* ---------- templates ---------- */

/**
 * Copy a profile's activities and their steps onto another profile.
 *
 * Refs survive the copy, which is the whole point: the copy shows the same
 * write-ups, and a programme made from it records work against the same
 * references its template names.
 */
async function copyActivities(fromProfileId: string, toProfileId: string) {
  const rows = await prisma.profileActivity.findMany({
    where: { profileId: fromProfileId },
    orderBy: { order: 'asc' },
    include: { steps: { orderBy: { n: 'asc' } } },
  });
  if (!rows.length) return;

  await prisma.profileActivity.createMany({
    data: rows.map((a) => ({
      id: `${toProfileId}:act:${a.ref}`,
      profileId: toProfileId,
      stageKey: a.stageKey,
      ref: a.ref,
      order: a.order,
      title: a.title,
      windowFrom: a.windowFrom,
      windowTo: a.windowTo,
      baseRef: a.baseRef,
    })),
  });

  const steps = rows.flatMap((a) =>
    a.steps.map((s) => ({
      id: `${toProfileId}:act:${a.ref}:${s.n}`,
      activityId: `${toProfileId}:act:${a.ref}`,
      n: s.n,
      text: s.text,
      tat: s.tat,
      lane: s.lane,
    })),
  );
  if (steps.length) await prisma.profileStep.createMany({ data: steps });
}

/**
 * Copy a template so it can be edited.
 *
 * The built-in one is read-only, so this is the only way to change what it
 * says: take a copy under a name of your own and edit that. Duplicating is
 * explicit rather than a fork that happens behind the edit, because a
 * baseline that changes without anybody choosing it is not a baseline.
 *
 * Stage keys survive the copy, which is what lets a programme created from the
 * copy inherit the same text, drawings and standard deliverables.
 */
export async function duplicateProfile(input: {
  sourceId: string;
  newId: string;
  name: string;
}): Promise<string> {
  const name = input.name.trim();
  if (!name) throw new Error('A template needs a name.');
  await assertProfileNameFree(name);

  const source = await loadProfile(input.sourceId);

  await prisma.profile.create({
    data: {
      id: input.newId,
      name,
      builtin: false,
      /* Listed in the pickers: the point of a copy is to start programmes on it. */
      template: true,
      stages: {
        create: source.stages.map((st) => ({
          id: `${input.newId}:${st.key}`,
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
  await copyActivities(input.sourceId, input.newId);
  revalidatePath('/');
  revalidatePath('/templates');
  return input.newId;
}

/**
 * Rewrite a template's stages.
 *
 * Distinct from `saveProjectStages`, which is about one programme and forks a
 * private profile to protect the others. This edits a template in place,
 * because that is what a template is for — and it refuses the built-in one,
 * which is the baseline every schedule here was verified against.
 */
export async function saveProfileStages(input: {
  profileId: string;
  name?: string;
  stages: StageInput[];
}): Promise<void> {
  const profile = await prisma.profile.findUnique({
    where: { id: input.profileId },
    select: { id: true, name: true, builtin: true },
  });
  if (!profile) throw new Error(`Unknown template: ${input.profileId}`);
  if (profile.builtin) {
    throw new Error('The built-in template is read-only. Duplicate it to make changes.');
  }
  if (!input.stages.length) throw new Error('A template needs at least one stage.');

  const keys = new Set<string>();
  for (const st of input.stages) {
    if (!st.title.trim()) throw new Error('Every stage needs a title.');
    if (keys.has(st.key)) throw new Error(`Duplicate stage: ${st.key}`);
    keys.add(st.key);
  }

  const name = input.name?.trim();
  if (name && name !== profile.name) await assertProfileNameFree(name);

  await prisma.$transaction([
    prisma.profileStage.deleteMany({ where: { profileId: profile.id } }),
    prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...(name ? { name } : {}),
        stages: {
          create: input.stages.map((st, order) => ({
            id: `${profile.id}:${st.key}`,
            key: st.key,
            order,
            title: st.title.trim(),
            shortTitle: st.shortTitle.trim() || st.title.trim().slice(0, 4).toUpperCase(),
            phaseId: st.phaseId,
            baseKey: st.baseKey,
            startOffsetWeeks: st.startOffsetWeeks,
            durationWeeks: st.durationWeeks,
          })),
        },
      },
    }),
  ]);
  revalidatePath('/');
  revalidatePath('/templates');
}


/**
 * Rewrite one stage's activities in a template.
 *
 * Editing any step of an inherited activity materialises all of them: the row
 * drops its baseRef and owns every step from then on. An activity is inherited
 * or owned, never half of each, so nothing downstream has to consult two
 * sources for one activity.
 */
export async function saveTemplateActivities(input: {
  profileId: string;
  stageKey: string;
  activities: {
    ref: string;
    title: string;
    windowFrom: number;
    windowTo: number;
    baseRef: string | null;
    steps: { n: number; text: string; tat: number; lane: string }[];
  }[];
}): Promise<void> {
  const profile = await prisma.profile.findUnique({
    where: { id: input.profileId },
    select: { id: true, builtin: true },
  });
  if (!profile) throw new Error(`Unknown template: ${input.profileId}`);
  if (profile.builtin) {
    throw new Error('The built-in template is read-only. Duplicate it to make changes.');
  }

  const refs = new Set<string>();
  for (const a of input.activities) {
    if (!a.title.trim()) throw new Error('Every activity needs a title.');
    if (refs.has(a.ref)) throw new Error(`Duplicate activity: ${a.ref}`);
    refs.add(a.ref);
    if (a.windowTo <= a.windowFrom) throw new Error(`${a.ref} has to end after it starts.`);
    if (!a.baseRef && !a.steps.length) {
      throw new Error(`${a.ref} needs at least one step.`);
    }
  }

  await prisma.$transaction([
    prisma.profileActivity.deleteMany({
      where: { profileId: profile.id, stageKey: input.stageKey },
    }),
    ...input.activities.map((a, order) =>
      prisma.profileActivity.create({
        data: {
          id: `${profile.id}:act:${a.ref}`,
          profileId: profile.id,
          stageKey: input.stageKey,
          ref: a.ref,
          order,
          title: a.title.trim(),
          windowFrom: a.windowFrom,
          windowTo: a.windowTo,
          baseRef: a.baseRef,
          steps: a.baseRef
            ? undefined
            : {
                create: a.steps.map((st, i) => ({
                  id: `${profile.id}:act:${a.ref}:${i + 1}`,
                  n: i + 1,
                  text: st.text.trim(),
                  tat: st.tat,
                  lane: st.lane === 'par' ? 'par' : 'main',
                })),
              },
        },
      }),
    ),
  ]);
  revalidatePath('/');
  revalidatePath('/templates');
}

/** Removing a template. The built-in one and any in use are refused. */
export async function deleteProfile(profileId: string): Promise<void> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { builtin: true, _count: { select: { projects: true } } },
  });
  if (!profile) throw new Error(`Unknown template: ${profileId}`);
  if (profile.builtin) throw new Error('The built-in template cannot be deleted.');
  if (profile._count.projects > 0) {
    throw new Error(`${profile._count.projects} program(s) still run on this template.`);
  }
  await prisma.profile.delete({ where: { id: profileId } });
  revalidatePath('/');
  revalidatePath('/templates');
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
    engineeringEffort: string | null;
    engineeringTat: string | null;
    programView: string | null;
    tools: string | null;
    collaboration: string | null;
  },
) {
  const pid = await assertProject(projectId);
  /* engineeringView === '' is a deliberately empty list, not an absent one */
  const empty = !Object.entries(detail).some(([k, v]) =>
    k === 'engineeringView' ? v !== null : Boolean(v),
  );
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
  /* the form still says statusUpdateId; the column it lands in is postId */
  const postId = String(form.get('statusUpdateId') ?? '') || null;
  const deliverableId = String(form.get('deliverableId') ?? '') || null;
  /* An output handed over on a step. Steps have no rows, so this pair is the
     whole address — and it only means anything alongside the programme. */
  const activityRef = String(form.get('activityRef') ?? '') || null;
  const rawStep = form.get('stepN');
  const stepN = rawStep == null || rawStep === '' ? null : Number(rawStep);
  if (!itemId && !postId && !deliverableId && !(activityRef && stepN !== null))
    throw new Error('An attachment needs an item, a post, a deliverable or a step.');
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
        projectId,
        itemId,
        postId,
        deliverableId,
        activityRef,
        stepN,
        data: Buffer.from(await file.arrayBuffer()),
        createdAt: new Date(),
      },
    });
    saved.push(meta);
  }
  touch(projectId);
  return saved;
}

/** A deliverable's title, corrected from its record. */
export async function renameDeliverable(projectId: string, id: string, title: string) {
  await assertProject(projectId);
  await prisma.deliverable.update({ where: { id }, data: { title } });
  touch(projectId);
}

/**
 * A deliverable's record: its development history, and the tick that follows
 * from whether an artefact is attached to it.
 */
export async function saveDeliverableRecord(
  projectId: string,
  id: string,
  note: string,
  done: boolean,
  completedAt: Date | null,
) {
  await assertProject(projectId);
  await prisma.deliverable.update({ where: { id }, data: { note, done, completedAt } });
  touch(projectId);
}

export async function deleteAttachment(projectId: string, id: string) {
  await prisma.attachment.delete({ where: { id } });
  touch(projectId);
}

/* ---------- effort and cost ---------- */

/**
 * Man-months and elapsed weeks per engineering line of a stage, both aligned to
 * that stage's list. They travel together because the table edits them together.
 */
export async function setStageEffort(
  projectId: string,
  stageId: StageId,
  effort: string | null,
  tat: string | null = null,
) {
  const pid = await assertProject(projectId);
  const existing = await prisma.stageDetail.findUnique({
    where: { projectId_stageId: { projectId: pid, stageId } },
  });

  if (!effort && !tat && existing && !existing.description && existing.engineeringView === null &&
      !existing.programView && !existing.tools && !existing.collaboration) {
    /* nothing left on the row once the numbers go */
    await prisma.stageDetail.delete({ where: { id: existing.id } });
  } else {
    await prisma.stageDetail.upsert({
      where: { projectId_stageId: { projectId: pid, stageId } },
      create: {
        id: `${pid}:detail:${stageId}`,
        projectId: pid,
        stageId,
        engineeringEffort: effort,
        engineeringTat: tat,
      },
      update: { engineeringEffort: effort, engineeringTat: tat },
    });
  }
  touch(projectId);
}

export async function setCostRate(projectId: string, rate: number, currency: string) {
  await prisma.project.update({
    where: { id: await assertProject(projectId) },
    data: { costPerManMonth: Number.isFinite(rate) && rate >= 0 ? rate : 0, currency },
  });
  touch(projectId);
}
