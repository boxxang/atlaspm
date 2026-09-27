/**
 * `npx tsx prisma/seedKestrelDemo.ts` — Embedded_SoC, the Kestrel interview example,
 * written over the programme of that id: its record, and the sign-off
 * checklists of three gates. See /data/kestrelDemo.ts for the story and
 * /prisma/scenarioSeed.ts for what writing a scenario does.
 *
 * Re-running replaces Embedded_SoC and nothing else. It is started straight
 * from the built-in Embedded SoC template, so no template is written.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { ALL_ACTIVITIES } from '../src/data/builtins';
import { KESTREL_SCENARIO } from '../src/data/kestrelDemo';
import { KESTREL_SIGNOFF_CLOSED, KESTREL_SIGNOFFS } from '../src/data/kestrelSignoffs';
import { EMBEDDED_PROFILE } from '../src/data/embeddedSoc';
import { RISK_AUTHOR } from '../src/data/riskSeeds';
import { PrismaClient } from '../src/generated/prisma/client';
import { buildScenario } from '../src/lib/scenario';
import { signoffDefinition } from '../src/lib/signoffDefinition';
import { seedScenario } from './scenarioSeed';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/* `@me` is the PM, in a checklist as everywhere else */
const me = (payload: unknown) => JSON.stringify(payload).replaceAll('"@me"', JSON.stringify(RISK_AUTHOR));

const day = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

async function main() {
  const demo = buildScenario(KESTREL_SCENARIO, { builtin: EMBEDDED_PROFILE, library: ALL_ACTIVITIES });
  const pid = demo.project.id;

  const before = await prisma.project.findUnique({
    where: { id: pid },
    select: { name: true, kickoff: true, profileId: true, _count: { select: { posts: true, deliverables: true } } },
  });
  if (before) console.log(`Replacing ${before.name} (${pid}), kickoff ${before.kickoff.toISOString().slice(0, 10)}, ${before._count.posts} posts.`);

  await seedScenario(prisma, demo, EMBEDDED_PROFILE.id);

  for (const [ref, payload] of Object.entries(KESTREL_SIGNOFFS)) {
    const def = signoffDefinition(ref);
    if (!def) throw new Error(`${ref} has no sign-off definition.`);
    await prisma.deliverableSignoff.upsert({
      where: { projectId_ref: { projectId: pid, ref } },
      create: { id: `${pid}:signoff:${ref}`, projectId: pid, ref, payload: me(payload) },
      update: { payload: me(payload) },
    });
    const closed = KESTREL_SIGNOFF_CLOSED[ref];
    if (!closed) continue;
    /* the gate's own row: its stage, by title */
    const row = demo.deliverables.find((d) => d.stageId === def.stageKey && d.title === def.title);
    if (!row) throw new Error(`No deliverable "${def.title}" in ${def.stageKey}.`);
    await prisma.deliverable.update({
      where: { id: row.id },
      data: { checklistDoneAt: day(closed), done: true, completedAt: day(closed) },
    });
  }
  console.log(`Sign-off checklists: ${Object.keys(KESTREL_SIGNOFFS).join(', ')}; closed by checklist: ${Object.keys(KESTREL_SIGNOFF_CLOSED).join(', ')}.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
