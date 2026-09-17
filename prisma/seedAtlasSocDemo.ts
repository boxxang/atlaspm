/**
 * `npx tsx prisma/seedAtlasSocDemo.ts` — the Netlist Turnkey template and the
 * AtlasSoC program started from it, with its EVT0 congestion story.
 * See /prisma/scenarioSeed.ts for what writing a scenario does, and
 * /data/atlasSocDemo.ts for the story.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { activitySteps } from '../src/data/activitySteps';
import { ATLAS_SOC_SCENARIO } from '../src/data/atlasSocDemo';
import { BUILTIN_PROFILE } from '../src/data/scheduleProfiles';
import { PrismaClient } from '../src/generated/prisma/client';
import { buildScenario } from '../src/lib/scenario';
import { seedScenario } from './scenarioSeed';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

seedScenario(prisma, buildScenario(ATLAS_SOC_SCENARIO, { builtin: BUILTIN_PROFILE, library: activitySteps }))
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
