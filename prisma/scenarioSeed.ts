/**
 * /prisma/scenarioSeed.ts — writing a seeded program scenario.
 *
 * It does what the Templates and Programs screens do, in the same order and
 * with the same rules — duplicate the built-in template, keep the stages the
 * scenario runs, re-time the activities it re-times, then start a program on
 * it, which takes its own copy of the stages — and then writes where the
 * program actually ran and what the PM has entered since.
 *
 * Re-running replaces that scenario's program and template, and nothing else.
 * It refuses if another program has been started on the template, or if a
 * template of the same name exists under a different id.
 */
import { BUILTIN_PROFILE } from '../src/data/scheduleProfiles';
import type { PrismaClient } from '../src/generated/prisma/client';
import { ensureBuiltinProfile } from '../src/lib/builtinProfile';
import { copyActivities } from '../src/lib/profileCopy';
import type { ScenarioDemo } from '../src/lib/scenario';

export async function seedScenario(prisma: PrismaClient, demo: ScenarioDemo): Promise<void> {
  const { template, project } = demo;
  const privateProfileId = `${project.id}:stages`;
  const stageKeys = template.stages.map((s) => s.key);

  await ensureBuiltinProfile(prisma);

  /* the name is how templates are told apart */
  const templates = await prisma.profile.findMany({ where: { template: true }, select: { id: true, name: true } });
  const clash = templates.find(
    (p) => p.id !== template.id && p.name.trim().toLocaleLowerCase() === template.name.toLocaleLowerCase(),
  );
  if (clash) throw new Error(`A template called "${template.name}" already exists (${clash.id}).`);

  const others = await prisma.project.count({ where: { profileId: template.id, id: { not: project.id } } });
  if (others) throw new Error(`${others} other program(s) run on ${template.id}; not replacing it.`);

  /* ---- the previous run, if any ---- */
  if (await prisma.project.findUnique({ where: { id: project.id }, select: { id: true } })) {
    await prisma.project.delete({ where: { id: project.id } });
    console.log(`Removed the previous ${project.name}.`);
  }
  await prisma.profile.deleteMany({ where: { id: { in: [privateProfileId, template.id] } } });

  /* ---- the template: a copy of the built-in one, re-staged ---- */
  const stageRows = (profileId: string) =>
    template.stages.map((st) => ({
      id: `${profileId}:${st.key}`,
      key: st.key,
      order: st.order,
      title: st.title,
      shortTitle: st.shortTitle,
      phaseId: st.phaseId,
      baseKey: st.baseKey,
      startOffsetWeeks: st.startOffsetWeeks,
      durationWeeks: st.durationWeeks,
    }));

  await prisma.profile.create({
    data: { id: template.id, name: template.name, builtin: false, template: true, stages: { create: stageRows(template.id) } },
  });
  await copyActivities(prisma, BUILTIN_PROFILE.id, template.id);
  /* the activities of the stages it dropped go with them */
  await prisma.profileActivity.deleteMany({ where: { profileId: template.id, stageKey: { notIn: stageKeys } } });
  for (const [ref, [from, to]] of Object.entries(template.windows)) {
    await prisma.profileActivity.update({
      where: { profileId_ref: { profileId: template.id, ref } },
      data: { windowFrom: from, windowTo: to },
    });
  }

  /* ---- the programme: its own copy of the template's stages ---- */
  await prisma.profile.create({
    data: {
      id: privateProfileId,
      name: `${project.name} stages`,
      builtin: false,
      template: false,
      stages: { create: stageRows(privateProfileId) },
    },
  });
  await copyActivities(prisma, template.id, privateProfileId);
  /* where the program's own activities ran, where that was not the plan */
  for (const [ref, [from, to]] of Object.entries(demo.programWindows)) {
    await prisma.profileActivity.update({
      where: { profileId_ref: { profileId: privateProfileId, ref } },
      data: { windowFrom: from, windowTo: to },
    });
  }

  await prisma.project.create({
    data: {
      id: project.id,
      name: project.name,
      kickoff: project.kickoff,
      profileId: privateProfileId,
      costPerManMonth: project.costPerManMonth,
      currency: 'USD',
      deliverables: {
        create: demo.deliverables.map(({ id, stageId, title, due, done, completedAt, position }) => ({
          id,
          stageId,
          title,
          due,
          done,
          completedAt,
          position,
        })),
      },
      overrides: {
        create: demo.overrides.map((o) => ({ id: `${project.id}:override:${o.stageId}`, ...o })),
      },
      leaders: { create: demo.leaders.map(({ projectId: _p, ...l }) => l) },
      contacts: { create: demo.contacts.map(({ projectId: _p, ...c }) => c) },
    },
  });

  /* ---- what the PM has written since ---- */
  const m = demo.meetings;
  await prisma.$transaction(
    async (tx) => {
      await tx.stepState.createMany({ data: demo.stepStates });
      await tx.meetingSeries.createMany({ data: m.series.map(({ primaryStage: _s, ...row }) => row) });
      await tx.meeting.createMany({ data: m.meetings.map(({ primaryStage: _s, ...row }) => row) });
      await tx.meetingAttendee.createMany({ data: m.attendees });
      await tx.meetingAgendaItem.createMany({ data: m.agenda });
      await tx.meetingDecision.createMany({ data: m.decisions });
      await tx.actionItem.createMany({ data: m.actions });
      await tx.meetingLink.createMany({ data: m.links });
      /* threads before their replies */
      await tx.post.createMany({ data: demo.posts.filter((p) => p.kind !== 'reply') });
      await tx.post.createMany({ data: demo.posts.filter((p) => p.kind === 'reply') });
    },
    { timeout: 60000 },
  );

  console.log(
    `Created template "${template.name}" (${template.stages.length} stages, ${demo.activities.length} activities) and ${project.name}: ` +
      `${demo.deliverables.length} deliverables, ${demo.stepStates.length} step records, ${demo.posts.length} posts, ` +
      `${m.meetings.length} meetings, ${m.decisions.length} decisions, ${m.actions.length} action items.`,
  );
}
