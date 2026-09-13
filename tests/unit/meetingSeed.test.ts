import { describe, expect, it } from 'vitest';
import { activitySteps } from '@/data/activitySteps';
import { journeyData } from '@/data/journey';
import { createProjectSeed } from '@/data/projectSeed';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { BUILTIN_PROFILE, milestoneDefs, STAGE_ORDER } from '@/data/scheduleProfiles';
import { TEAM_SEEDS } from '@/data/teamSeeds';
import { buildMeetingSeed } from '@/lib/meetingSeed';
import { parseStepRef } from '@/lib/meetings/links';
import { addWeeks, computeSchedule } from '@/lib/schedule';
import { fromStepIndex } from '@/lib/steps';
import { seedRisks } from '@/lib/stepSeed';

/**
 * The seeded programme's meetings. They are a fixture the demo and the e2e
 * suite both open, so what is checked here is that they read as a programme's
 * real meeting record — past sittings held, future ones scheduled, nothing
 * about work that has not started, and links only to things the programme has.
 */
const NOW = new Date(2026, 8, 13, 10, 0);
const TODAY = new Date(2026, 8, 13);
const kickoff = addWeeks(TODAY, -66);
const schedule = computeSchedule(kickoff, BUILTIN_PROFILE, {});
const stages = STAGE_ORDER.map((id) => ({ id, start: schedule.stages[id].start, end: schedule.stages[id].end }));
const activities = Object.keys(activitySteps).map((ref) => fromStepIndex(ref, activitySteps[ref]));
const risks = seedRisks({ stages, activities, today: TODAY }).map((r) => ({
  postId: `atlasax1:risk:${r.activityRef}:${r.stepN}`,
  activityRef: r.activityRef,
  stepN: r.stepN,
}));
const project = createProjectSeed({ schedule, now: NOW });
const deliverables = STAGE_ORDER.flatMap((stageId) =>
  project.deliverables[stageId].map((d) => ({ id: d.id, stageId, title: d.title, done: d.done })),
);
const people = Object.fromEntries(
  journeyData.map((s) => [s.id, { lead: s.leader.name, team: (TEAM_SEEDS[s.id] ?? []).map(([n]) => n) }]),
);

const seed = buildMeetingSeed({
  projectId: 'atlasax1',
  now: NOW,
  today: TODAY,
  timeZone: 'America/Los_Angeles',
  stages,
  activities,
  risks,
  deliverables,
  milestones: milestoneDefs.map((m) => ({ id: m.id, stageId: m.anchor.stage })),
  people,
  me: RISK_AUTHOR,
});

describe('buildMeetingSeed', () => {
  it('names the five series, one of them not running yet', () => {
    expect(seed.series.map((s) => s.title)).toEqual([
      'DFT Weekly Review',
      'Physical Design Closure Review',
      'Tapeout Readiness Review',
      'Package Supplier Review',
      'Silicon Bring-up Daily',
    ]);
    const bringup = seed.series.find((s) => s.title === 'Silicon Bring-up Daily')!;
    expect(bringup.status).toBe('inactive');
    expect(seed.meetings.filter((m) => m.seriesId === bringup.id)).toHaveLength(0);
  });

  it('holds what is past as completed or cancelled, and schedules what is ahead', () => {
    expect(seed.meetings.length).toBeGreaterThanOrEqual(8);
    for (const m of seed.meetings) {
      if (m.status === 'completed' || m.status === 'cancelled') expect(m.startsAt < NOW, m.title).toBe(true);
      else expect(m.startsAt > NOW, m.title).toBe(true);
      expect(m.endsAt > m.startsAt).toBe(true);
    }
  });

  it('never meets about a stage before that stage has started', () => {
    for (const s of seed.series.filter((x) => x.status === 'active')) {
      const stage = stages.find((x) => x.id === s.primaryStage)!;
      for (const m of seed.meetings.filter((x) => x.seriesId === s.id)) {
        expect(m.startsAt >= stage.start, `${m.title} on ${m.startsAt.toISOString()}`).toBe(true);
      }
    }
  });

  it('gives every sitting two to four agenda items', () => {
    for (const m of seed.meetings) {
      const n = seed.agenda.filter((a) => a.meetingId === m.id).length;
      expect(n, m.title).toBeGreaterThanOrEqual(2);
      expect(n, m.title).toBeLessThanOrEqual(4);
    }
  });

  it('records at least one decision for every series that has met, and leaves one awaiting approval', () => {
    for (const s of seed.series.filter((x) => x.status === 'active')) {
      const ids = new Set(seed.meetings.filter((m) => m.seriesId === s.id).map((m) => m.id));
      expect(seed.decisions.some((d) => ids.has(d.meetingId)), s.title).toBe(true);
    }
    expect(seed.decisions.some((d) => d.status === 'proposed')).toBe(true);
  });

  it('leaves action items open, in progress, blocked and done', () => {
    expect(new Set(seed.actions.map((a) => a.status))).toEqual(new Set(['open', 'in_progress', 'blocked', 'done']));
    for (const a of seed.actions.filter((x) => x.status === 'done')) expect(a.completedAt).not.toBeNull();
  });

  it('carries an unfinished action into a later sitting of the same series', () => {
    const carried = seed.actions.filter((a) => a.carriedToMeetingId);
    expect(carried.length).toBeGreaterThan(0);
    for (const a of carried) {
      const from = seed.meetings.find((m) => m.id === a.meetingId)!;
      const into = seed.meetings.find((m) => m.id === a.carriedToMeetingId)!;
      expect(into.seriesId).toBe(from.seriesId);
      expect(into.startsAt > from.startsAt).toBe(true);
      expect(['open', 'in_progress', 'blocked']).toContain(a.status);
    }
  });

  it('links only to what the programme has', () => {
    const acts = new Set(activities.map((a) => a.ref));
    const riskIds = new Set(risks.map((r) => r.postId));
    const dlv = new Set(deliverables.map((d) => d.id));
    const ms = new Set(milestoneDefs.map((m) => m.id));
    const stageIds = new Set<string>(STAGE_ORDER);
    expect(seed.links.length).toBeGreaterThan(10);
    for (const l of seed.links) {
      if (l.targetType === 'activity') expect(acts.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'step') {
        const s = parseStepRef(l.targetRef)!;
        expect(acts.has(s.act)).toBe(true);
        expect(s.n).toBeLessThanOrEqual(activities.find((a) => a.ref === s.act)!.steps.length);
      }
      if (l.targetType === 'risk') expect(riskIds.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'deliverable') expect(dlv.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'milestone') expect(ms.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'stage') expect(stageIds.has(l.targetRef), l.targetRef).toBe(true);
    }
    /* and to at least one activity, one step and one risk, which is what the
       activity and step panels read */
    const kinds = new Set(seed.links.map((l) => l.targetType));
    for (const k of ['activity', 'step', 'risk', 'deliverable', 'milestone', 'stage']) expect(kinds.has(k), k).toBe(true);
  });

  it('puts every row on the programme, with ids that do not collide', () => {
    const rows = [...seed.series, ...seed.meetings, ...seed.attendees, ...seed.agenda, ...seed.decisions, ...seed.actions, ...seed.links];
    expect(rows.every((r) => r.projectId === 'atlasax1')).toBe(true);
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('owns at least one coming meeting as the TPM, so Upcoming has something that is mine', () => {
    expect(seed.meetings.some((m) => m.owner === RISK_AUTHOR && m.startsAt > NOW)).toBe(true);
  });
});
