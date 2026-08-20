/**
 * The AtlasAX1 seed, as a function so both `prisma db seed` and the e2e
 * harness can use it. Writing it once keeps "what the tests run against" and
 * "what a fresh install gets" the same program.
 */
import { journeyData } from '../src/data/journey';
import {
  SEED_COST_PER_MAN_MONTH,
  SEED_EFFORT,
  createProjectSeed,
} from '../src/data/projectSeed';
import { BUILTIN_PROFILE, STAGE_ORDER } from '../src/data/scheduleProfiles';
import { ensureBuiltinProfile } from '../src/lib/builtinProfile';
import { DB_KIND } from '../src/lib/projectState';
import { addWeeks, computeSchedule, startOfDay } from '../src/lib/schedule';
import type { PrismaClient } from '../src/generated/prisma/client';

export const PROJECT_ID = 'atlasax1';

export interface SeedCounts {
  stages: number;
  items: number;
  updates: number;
  deliverables: number;
  kickoff: Date;
  projectName: string;
}

export async function seedProject(prisma: PrismaClient, now = new Date()): Promise<SeedCounts> {
  const today = startOfDay(now);
  /* default kickoff = 30 weeks before today, so "today" sits mid-program */
  const kickoff = addWeeks(today, -30);
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
      stageDetails: {
        create: STAGE_ORDER.map((stageId) => ({
          id: `${PROJECT_ID}:detail:${stageId}`,
          stageId,
          engineeringEffort: SEED_EFFORT[stageId].join('\n'),
        })),
      },
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
        create: STAGE_ORDER.flatMap((stageId) =>
          seed.deliverables[stageId].map((d, position) => ({ ...d, stageId, position })),
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
      })),
    ),
  );
  const updates = STAGE_ORDER.flatMap((stageId) =>
    (['keyinfo', 'activities', 'risks'] as const).flatMap((kind) =>
      seed.content[stageId][kind].flatMap((it) =>
        it.updates.map((u) => ({
          id: u.id,
          itemId: it.id,
          text: u.text,
          createdAt: u.date,
        })),
      ),
    ),
  );
  await prisma.item.createMany({ data: items });
  await prisma.statusUpdate.createMany({ data: updates });

  return {
    stages: journeyData.length,
    items: items.length,
    updates: updates.length,
    deliverables: STAGE_ORDER.reduce((n, id) => n + seed.deliverables[id].length, 0),
    kickoff,
    projectName: seed.projectName,
  };
}
