/**
 * `npx tsx prisma/seedFoundryDemo.ts` — the Foundry Turnkey template and the
 * AtlasFX1 programme started from it, with its timing-signoff story.
 * See /prisma/scenarioSeed.ts for what writing a scenario does.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { activitySteps } from '../src/data/activitySteps';
import { BUILTIN_PROFILE } from '../src/data/scheduleProfiles';
import { PrismaClient } from '../src/generated/prisma/client';
import { buildFoundryDemo } from '../src/lib/foundryDemo';
import { seedScenario } from './scenarioSeed';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

seedScenario(prisma, buildFoundryDemo({ builtin: BUILTIN_PROFILE, library: activitySteps }))
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
