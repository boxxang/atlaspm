/**
 * `npx tsx prisma/seedMeetings.ts [projectId]` — (re)writes the sample
 * meetings of one programme, and nothing else.
 *
 * `prisma db seed` recreates the whole programme, which throws away every post,
 * step and handover people have written since. This writes only the meeting
 * tables, placed against the programme as it is in the database: its kickoff,
 * the risks actually raised on it, its deliverables and its people.
 *
 * Only the seed's own rows are replaced — series and meetings whose ids the
 * seed gives them. Meetings somebody created are left alone.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { activitySteps } from '../src/data/activitySteps';
import { RISK_AUTHOR } from '../src/data/riskSeeds';
import { BUILTIN_PROFILE, milestoneDefs, STAGE_ORDER } from '../src/data/scheduleProfiles';
import { PrismaClient } from '../src/generated/prisma/client';
import { buildMeetingSeed } from '../src/lib/meetingSeed';
import { computeSchedule, startOfDay } from '../src/lib/schedule';
import { fromStepIndex } from '../src/lib/steps';

const projectId = process.argv[2] ?? 'atlasax1';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      overrides: true,
      leaders: true,
      contacts: { orderBy: { position: 'asc' } },
      deliverables: { orderBy: { position: 'asc' } },
    },
  });
  /* The seed's content is written against the built-in stages and activities.
     A programme that has moved off them would get meetings about work it does
     not have, so stop rather than guess. */
  if (project.profileId !== BUILTIN_PROFILE.id || project.overrides.length) {
    throw new Error(`${projectId} is not on the unedited built-in profile; the sample meetings do not fit it.`);
  }

  const now = new Date();
  const today = startOfDay(now);
  const schedule = computeSchedule(project.kickoff, BUILTIN_PROFILE, {});
  const stages = STAGE_ORDER.map((id) => ({ id, start: schedule.stages[id].start, end: schedule.stages[id].end }));
  const activities = Object.keys(activitySteps).map((ref) => fromStepIndex(ref, activitySteps[ref]));
  const risks = await prisma.post.findMany({
    where: { projectId, kind: 'risk', activityRef: { not: null }, stepN: { not: null } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, activityRef: true, stepN: true },
  });

  const seed = buildMeetingSeed({
    projectId,
    now,
    today,
    timeZone: 'America/Los_Angeles',
    stages,
    activities,
    risks: risks.map((r) => ({ postId: r.id, activityRef: r.activityRef!, stepN: r.stepN! })),
    deliverables: project.deliverables.map((d) => ({ id: d.id, stageId: d.stageId, title: d.title, done: d.done })),
    milestones: milestoneDefs.map((m) => ({ id: m.id, stageId: m.anchor.stage })),
    people: Object.fromEntries(
      STAGE_ORDER.map((stageId) => [
        stageId,
        {
          lead: project.leaders.find((l) => l.stageId === stageId)?.name ?? '',
          team: project.contacts.filter((c) => c.stageId === stageId).map((c) => c.name),
        },
      ]),
    ),
    me: RISK_AUTHOR,
  });

  await prisma.$transaction(async (tx) => {
    /* the seed's own rows only; attendees, agenda, decisions, actions and
       links go with their meeting or series */
    const gone = await tx.meeting.deleteMany({ where: { projectId, id: { startsWith: `${projectId}:m:` } } });
    const goneSeries = await tx.meetingSeries.deleteMany({ where: { projectId, id: { startsWith: `${projectId}:ms:` } } });
    if (gone.count || goneSeries.count) console.log(`Replaced ${goneSeries.count} seeded series and ${gone.count} seeded meetings.`);

    await tx.meetingSeries.createMany({ data: seed.series.map(({ primaryStage: _s, ...row }) => row) });
    await tx.meeting.createMany({ data: seed.meetings.map(({ primaryStage: _s, ...row }) => row) });
    await tx.meetingAttendee.createMany({ data: seed.attendees });
    await tx.meetingAgendaItem.createMany({ data: seed.agenda });
    await tx.meetingDecision.createMany({ data: seed.decisions });
    await tx.actionItem.createMany({ data: seed.actions });
    await tx.meetingLink.createMany({ data: seed.links });
  }, { timeout: 60000 });

  console.log(
    `Seeded meetings for ${project.name}: ${seed.series.length} series, ${seed.meetings.length} meetings, ` +
      `${seed.agenda.length} agenda items, ${seed.decisions.length} decisions, ${seed.actions.length} action items, ` +
      `${seed.links.length} links.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
