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
  it('names the series a programme in physical design runs, one of them not running yet', () => {
    expect(seed.series.map((s) => s.title)).toEqual([
      'Weekly SoC Program Review',
      'DFT Weekly Review',
      'DV Closure Sync',
      'Netlist Drop Review',
      'Physical Design Daily War-room',
      'Physical Design Closure Review',
      'Tapeout Readiness Review',
      'Package Supplier Review',
      'Package Test Vehicle Review',
      'Silicon Bring-up Daily',
    ]);
    const bringup = seed.series.find((s) => s.title === 'Silicon Bring-up Daily')!;
    expect(bringup.status).toBe('inactive');
    expect(seed.meetings.filter((m) => m.seriesId === bringup.id)).toHaveLength(0);
  });

  it('reads like a programme’s record, not a demo: a month of sittings, decisions and actions', () => {
    expect(seed.meetings.length).toBeGreaterThanOrEqual(25);
    expect(seed.decisions.length).toBeGreaterThanOrEqual(12);
    expect(seed.actions.length).toBeGreaterThanOrEqual(20);
  });

  it('adds one-off meetings outside any series, held and ahead', () => {
    const oneOffs = seed.meetings.filter((m) => m.seriesId === null);
    expect(oneOffs.length).toBe(3);
    expect(new Set(oneOffs.map((m) => m.status))).toEqual(new Set(['completed', 'scheduled', 'draft']));
    for (const m of oneOffs) {
      const weekday = m.startsAt.getDay();
      expect(weekday === 0 || weekday === 6, `${m.title} lands on a weekend`).toBe(false);
    }
  });

  it('holds what is past as completed or cancelled, and schedules what is ahead', () => {
    for (const m of seed.meetings) {
      if (m.status === 'completed' || m.status === 'cancelled') expect(m.startsAt < NOW, m.title).toBe(true);
      else expect(m.startsAt > NOW, m.title).toBe(true);
      expect(m.endsAt > m.startsAt).toBe(true);
    }
  });

  it('never meets about a stage before that stage has started', () => {
    for (const m of seed.meetings) {
      const stage = stages.find((x) => x.id === m.primaryStage)!;
      expect(stage, m.title).toBeTruthy();
      expect(m.startsAt >= stage.start, `${m.title} on ${m.startsAt.toISOString()}`).toBe(true);
    }
  });

  it('gives every sitting two to four agenda items', () => {
    for (const m of seed.meetings) {
      const n = seed.agenda.filter((a) => a.meetingId === m.id).length;
      expect(n, m.title).toBeGreaterThanOrEqual(2);
      expect(n, m.title).toBeLessThanOrEqual(4);
    }
  });

  it('records at least one decision for every series that has met, and leaves some awaiting approval', () => {
    for (const s of seed.series.filter((x) => x.status === 'active')) {
      const ids = new Set(seed.meetings.filter((m) => m.seriesId === s.id).map((m) => m.id));
      expect(seed.decisions.some((d) => ids.has(d.meetingId)), s.title).toBe(true);
    }
    expect(seed.decisions.some((d) => d.status === 'proposed')).toBe(true);
  });

  it('leaves action items open, in progress, blocked and done', () => {
    expect(new Set(seed.actions.map((a) => a.status))).toEqual(new Set(['open', 'in_progress', 'blocked', 'done']));
    for (const a of seed.actions.filter((x) => x.status === 'done')) expect(a.completedAt).not.toBeNull();
    for (const a of seed.actions.filter((x) => x.status === 'blocked')) expect(a.blocker).not.toBe('');
  });

  it('carries unfinished actions into a later sitting of the same series', () => {
    const carried = seed.actions.filter((a) => a.carriedToMeetingId);
    expect(carried.length).toBeGreaterThan(1);
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
    expect(seed.links.length).toBeGreaterThan(40);
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
    const kinds = new Set(seed.links.map((l) => l.targetType));
    for (const k of ['activity', 'step', 'risk', 'deliverable', 'milestone', 'stage']) expect(kinds.has(k), k).toBe(true);
    /* every seeded risk is talked about somewhere */
    for (const r of risks) expect(seed.links.some((l) => l.targetType === 'risk' && l.targetRef === r.postId), r.postId).toBe(true);
  });

  it('names people the programme has: its stage leads, its contacts and the TPM', () => {
    const known = new Set([RISK_AUTHOR, ...Object.values(people).flatMap((p) => [p.lead, ...p.team])]);
    for (const m of seed.meetings) expect(known.has(m.owner), m.owner).toBe(true);
    for (const a of seed.attendees) expect(known.has(a.name), a.name).toBe(true);
    for (const a of seed.actions) expect(known.has(a.owner), a.owner).toBe(true);
  });

  it('puts every row on the programme, with ids that do not collide', () => {
    const rows = [...seed.series, ...seed.meetings, ...seed.attendees, ...seed.agenda, ...seed.decisions, ...seed.actions, ...seed.links];
    expect(rows.every((r) => r.projectId === 'atlasax1')).toBe(true);
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    /* every seeded meeting is addressable as the seed's own, so a reseed can
       replace it without touching meetings somebody created */
    for (const m of seed.meetings) expect(m.id.startsWith('atlasax1:m:')).toBe(true);
    for (const s of seed.series) expect(s.id.startsWith('atlasax1:ms:')).toBe(true);
  });

  it('owns coming meetings as the TPM, so Upcoming has something that is mine', () => {
    expect(seed.meetings.some((m) => m.owner === RISK_AUTHOR && m.startsAt > NOW)).toBe(true);
    expect(seed.actions.some((a) => a.owner === RISK_AUTHOR && a.status !== 'done')).toBe(true);
  });
});
