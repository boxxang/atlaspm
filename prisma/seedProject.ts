/**
 * The AtlasAX1 seed, as a function so both `prisma db seed` and the e2e
 * harness can use it. Writing it once keeps "what the tests run against" and
 * "what a fresh install gets" the same program.
 */
import { journeyData } from '../src/data/journey';
import { SEED_COST_PER_MAN_MONTH, createProjectSeed } from '../src/data/projectSeed';
import { BUILTIN_PROFILE, STAGE_ORDER } from '../src/data/scheduleProfiles';
import { ensureBuiltinProfile } from '../src/lib/builtinProfile';
import { DB_KIND } from '../src/lib/projectState';
import { addWeeks, computeSchedule, startOfDay } from '../src/lib/schedule';
import { fromStepIndex, plannedSteps } from '../src/lib/steps';
import { seedRisks, seedStepStates } from '../src/lib/stepSeed';
import { activitySteps } from '../src/data/activitySteps';
import type { PrismaClient } from '../src/generated/prisma/client';

export const PROJECT_ID = 'atlasax1';

export interface SeedCounts {
  stages: number;
  items: number;
  updates: number;
  deliverables: number;
  /** Steps the seed marks finished, and the ones it deliberately leaves late. */
  stepsDone: number;
  stepsLate: number;
  /** Risks raised on the steps where the work stopped. */
  risks: number;
  kickoff: Date;
  projectName: string;
}

export async function seedProject(prisma: PrismaClient, now = new Date()): Promise<SeedCounts> {
  const today = startOfDay(now);
  /* Default kickoff = 66 weeks before today, half way through the 132-week
     baseline: physical design is mid-flight, signoff is ramping, and the
     package and test workstreams are in the thick of it. */
  const kickoff = addWeeks(today, -66);
  const schedule = computeSchedule(kickoff, BUILTIN_PROFILE, {});
  const seed = createProjectSeed({ schedule, now });

  /* Every program needs a profile to point at, and this one is the code's. */
  await ensureBuiltinProfile(prisma);

  /* Scoped to this one project: other programs in the database are left alone.
     Cascades clear its items, updates, deliverables, leaders and contacts. */
  await prisma.project.deleteMany({ where: { id: PROJECT_ID } });

  await prisma.project.create({
    data: {
      id: PROJECT_ID,
      name: seed.projectName,
      kickoff,
      profileId: 'typicalSoC',
      costPerManMonth: SEED_COST_PER_MAN_MONTH,
      currency: 'USD',
      /* No stage detail rows: effort and TAT are the template's own figures
         and the program inherits them. A row is written the moment someone
         edits a number, which is what makes "edited" mean something. */
      leaders: {
        create: STAGE_ORDER.map((stageId) => ({
          id: `${PROJECT_ID}:leader:${stageId}`,
          stageId,
          ...seed.leaders[stageId],
        })),
      },
      contacts: {
        create: STAGE_ORDER.flatMap((stageId) =>
          seed.contacts[stageId].map((c, position) => ({ ...c, stageId, position })),
        ),
      },
      deliverables: {
        /* attachments are rows of their own, and a seeded deliverable has
           none — its record has not been filed */
        create: STAGE_ORDER.flatMap((stageId) =>
          seed.deliverables[stageId].map(({ attachments: _a, ...d }, position) => ({
            ...d,
            stageId,
            position,
          })),
        ),
      },
    },
  });

  /* Items and their updates go in as two flat batches — one insert each. */
  const items = STAGE_ORDER.flatMap((stageId) =>
    (['keyinfo', 'activities', 'risks'] as const).flatMap((kind) =>
      seed.content[stageId][kind].map((it) => ({
        id: it.id,
        projectId: PROJECT_ID,
        stageId,
        kind: DB_KIND[kind],
        title: it.title,
        body: it.body,
        owner: it.owner,
        due: it.due,
        done: it.done,
        updatedAt: it.updated,
        /* what the activity is work towards; keyinfo and risks carry none */
        deliverableId: it.deliverableId ?? null,
      })),
    ),
  );
  const updates = STAGE_ORDER.flatMap((stageId) =>
    (['keyinfo', 'activities', 'risks'] as const).flatMap((kind) =>
      seed.content[stageId][kind].flatMap((it) =>
        it.updates.map((u) => ({
          id: u.id,
          projectId: PROJECT_ID,
          kind: 'update',
          author: it.owner,
          itemId: it.id,
          text: u.text,
          createdAt: u.date,
        })),
      ),
    ),
  );
  /* What the programme has already finished. Without this a fresh install reads
     as 0 of 1,649 steps done with everything overdue, which is not a programme
     anybody recognises — and with only this it reads as one where nothing has
     ever slipped, which is not one either. See /lib/stepSeed.ts. */
  const stages = STAGE_ORDER.map((id) => ({
    id,
    start: schedule.stages[id].start,
    end: schedule.stages[id].end,
  }));
  const activities = Object.keys(activitySteps).map((ref) =>
    fromStepIndex(ref, activitySteps[ref]),
  );
  const done = seedStepStates({ stages, activities, today });
  const risks = seedRisks({ stages, activities, today });
  /* What is left late: every step whose window has closed, minus the ones the
     seed finished. That difference is the Overdue list on a fresh install. */
  const closed = activities.reduce((n, a) => {
    const span = schedule.stages[a.stageId];
    return span ? n + plannedSteps(span.start, a).filter((d) => d.end < today).length : n;
  }, 0);

  await prisma.item.createMany({ data: items });
  await prisma.post.createMany({ data: updates });
  /* One risk per stalled activity, flagged on the step where it stopped. The
     old Item(kind:'risk') rows above are V1's board and are left alone: a risk
     is a post on a step now, and the two are different tables. Both go when
     /classic does. */
  await prisma.post.createMany({
    data: risks.map((r) => ({
      id: `${PROJECT_ID}:risk:${r.activityRef}:${r.stepN}`,
      projectId: PROJECT_ID,
      kind: 'risk',
      text: r.text,
      author: r.author,
      createdAt: r.createdAt,
      activityRef: r.activityRef,
      stepN: r.stepN,
    })),
  });
  await prisma.stepState.createMany({
    data: done.map((d) => ({
      id: `${PROJECT_ID}:step:${d.activityRef}:${d.stepN}`,
      projectId: PROJECT_ID,
      activityRef: d.activityRef,
      stepN: d.stepN,
      done: true,
      /* the day the plan said, not the day the seed ran */
      doneAt: d.doneAt,
      pct: 100,
      owner: '',
      dueOverride: null,
    })),
  });

  return {
    stages: journeyData.length,
    items: items.length,
    updates: updates.length,
    deliverables: STAGE_ORDER.reduce((n, id) => n + seed.deliverables[id].length, 0),
    stepsDone: done.length,
    stepsLate: closed - done.length,
    risks: risks.length,
    kickoff,
    projectName: seed.projectName,
  };
}
