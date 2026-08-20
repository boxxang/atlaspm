import { describe, expect, it } from 'vitest';
import { journeyData } from '@/data/journey';
import { createProjectSeed } from '@/data/projectSeed';
import { STAGE_ORDER, scheduleProfiles } from '@/data/scheduleProfiles';
import type { Deliverable, StageId } from '@/data/types';
import {
  allUpdates,
  daysTo,
  dday,
  hasOpenRisks,
  inFlightStageIds,
  isOverdue,
  openRiskCount,
  overdueCount,
  overdueItems,
  progressPct,
  riskStageIds,
  stageProgress,
  upcomingMilestones,
} from '@/lib/derive';
import { DAY, addWeeks, computeSchedule, startOfDay } from '@/lib/schedule';

/* The prototype boots with kickoff = 30 weeks before today, so "today" lands
   mid-program (Physical Design). Fixed clock keeps the assertions stable. */
const NOW = new Date(2026, 7, 19, 9, 30);
const TODAY = startOfDay(NOW);
const KICKOFF = addWeeks(TODAY, -30);
const schedule = computeSchedule(KICKOFF, scheduleProfiles.typicalSoC, {});
const seed = createProjectSeed({ schedule, now: NOW });

/** Rebuild the deliverable map stage by stage, keeping it fully typed. */
const mapDeliverables = (fn: (list: Deliverable[]) => Deliverable[]) => {
  const out = {} as Record<StageId, Deliverable[]>;
  for (const id of STAGE_ORDER) out[id] = fn(seed.deliverables[id]);
  return out;
};

describe('project seed', () => {
  it('is AtlasAX1 with content for every stage', () => {
    expect(seed.projectName).toBe('AtlasAX1');
    for (const id of STAGE_ORDER) {
      expect(seed.content[id]).toBeDefined();
      expect(seed.deliverables[id].length).toBeGreaterThan(0);
      expect(seed.leaders[id].name).toBe(
        journeyData.find((s) => s.id === id)!.leader.name,
      );
    }
  });

  it('mints unique ids', () => {
    const ids = [
      ...Object.values(seed.content).flatMap((c) =>
        [...c.keyinfo, ...c.activities, ...c.risks].flatMap((i) => [
          i.id,
          ...i.updates.map((u) => u.id),
        ]),
      ),
      ...Object.values(seed.deliverables).flat().map((d) => d.id),
      ...Object.values(seed.contacts).flat().map((c) => c.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is deterministic for a fixed clock and schedule', () => {
    const again = createProjectSeed({ schedule, now: NOW });
    expect(again).toEqual(seed);
  });

  it('derives contact email and phone from the team seeds', () => {
    const [first] = seed.contacts.productDefinition;
    expect(first).toMatchObject({
      name: 'Nora Feld',
      role: 'Market & requirements analysis',
      email: 'nora.feld@example.com',
      phone: '+1 (408) 555-0010',
    });
    expect(seed.contacts.verification).toHaveLength(5);
  });

  it('dates deliverables across their stage, not all on its last day', () => {
    const pd = seed.deliverables.productDefinition;
    const stage = schedule.stages.productDefinition;
    expect(pd).toHaveLength(4);

    // four of them land at a quarter, half, three quarters and the end
    const dues = pd.map((d) => d.due!.getTime());
    expect([...dues].sort((a, b) => a - b)).toEqual(dues); // in order
    expect(new Set(dues).size).toBe(4); // and no two share a date
    expect(dues[0]).toBeGreaterThan(stage.start.getTime());
    expect(pd[3].due).toEqual(stage.end);

    // a finished one is stamped near its due date, not on the stage end
    expect(pd[0].done).toBe(true);
    const gap = Math.abs(pd[0].completedAt!.getTime() - pd[0].due!.getTime()) / DAY;
    expect(gap).toBeLessThanOrEqual(4);

    const open = seed.deliverables.tapeout[0];
    expect(open.done).toBe(false);
    expect(open.completedAt).toBeNull();
  });

  it('stamps item.updated from the newest status update', () => {
    const routing = seed.content.physicalDesign.activities.find((a) =>
      a.title.startsWith('Top-level detailed routing'),
    )!;
    expect(routing.updates).toHaveLength(2);
    expect(routing.updated).toEqual(routing.updates[0].date);
    expect(routing.updates[0].date > routing.updates[1].date).toBe(true);
  });
});

describe('(e) progress derivation', () => {
  it('is done deliverables over total, program-wide', () => {
    const all = Object.values(seed.deliverables).flat();
    expect(all).toHaveLength(45);
    expect(all.filter((d) => d.done)).toHaveLength(23);
    expect(progressPct(seed.deliverables)).toBe(51);
  });

  it('reports per-stage counters', () => {
    expect(stageProgress(seed.deliverables.physicalDesign)).toEqual({ done: 2, total: 5 });
    expect(stageProgress(seed.deliverables.tapeout)).toEqual({ done: 0, total: 3 });
    expect(stageProgress([])).toEqual({ done: 0, total: 0 });
  });

  it('is 0% with nothing to complete', () => {
    const empty = mapDeliverables(() => []);
    expect(progressPct(empty)).toBe(0);
  });

  it('is 100% once every deliverable is done', () => {
    const done = mapDeliverables((list) => list.map((d) => ({ ...d, done: true })));
    expect(progressPct(done)).toBe(100);
  });
});

describe('(e) overdue derivation', () => {
  it('counts open activities past their due date', () => {
    expect(overdueCount(seed.content, TODAY)).toBe(1);
    const [only] = overdueItems(seed.content, TODAY);
    expect(only.stageId).toBe('physicalDesign');
    expect(only.item.title).toBe('PDN IR-drop analysis rev 2');
  });

  it('ignores done items, undated items, and future dues', () => {
    const base = seed.content.physicalDesign.activities[0];
    const past = new Date(TODAY);
    past.setDate(past.getDate() - 1);
    const future = new Date(TODAY);
    future.setDate(future.getDate() + 1);
    expect(isOverdue({ ...base, done: false, due: past }, TODAY)).toBe(true);
    expect(isOverdue({ ...base, done: true, due: past }, TODAY)).toBe(false);
    expect(isOverdue({ ...base, done: false, due: null }, TODAY)).toBe(false);
    expect(isOverdue({ ...base, done: false, due: future }, TODAY)).toBe(false);
    expect(isOverdue({ ...base, done: false, due: TODAY }, TODAY)).toBe(false);
  });
});

describe('open risks', () => {
  it('counts 19 across 5 stages in the seed', () => {
    expect(openRiskCount(seed.content)).toBe(19);
    expect(riskStageIds(seed.content)).toEqual([
      'productDefinition',
      'physicalDesign',
      'signoff',
      'tapeout',
      'packaging',
    ]);
  });

  it('marks only stages holding an open risk', () => {
    expect(hasOpenRisks(seed.content, 'physicalDesign')).toBe(true);
    expect(hasOpenRisks(seed.content, 'rtl')).toBe(false);
  });
});

describe('schedule position', () => {
  it('puts the program in Physical Design today', () => {
    expect(inFlightStageIds(schedule, TODAY)).toEqual(['physicalDesign']);
  });

  it('counts down to Tapeout', () => {
    expect(daysTo(schedule.tapeout, TODAY)).toBe(56);
    expect(dday(schedule.tapeout, TODAY)).toBe('D−56');
  });

  it('prints D+ for dates already past', () => {
    expect(dday(schedule.stages.rtl.end, TODAY)).toBe('D+77');
  });

  it('lists only milestones still ahead, soonest first', () => {
    const up = upcomingMilestones(schedule, TODAY);
    expect(up.map((m) => m.id)).toEqual([
      'designFreeze',
      'tapeout',
      'firstSilicon',
      'massProduction',
    ]);
    expect(up.map((m) => m.date.getTime())).toEqual(
      [...up].sort((a, b) => a.date.getTime() - b.date.getTime()).map((m) => m.date.getTime()),
    );
  });
});

describe('status update feed', () => {
  it('flattens every update newest first', () => {
    const feed = allUpdates(seed.content);
    expect(feed.length).toBeGreaterThan(10);
    for (let i = 1; i < feed.length; i++) {
      expect(feed[i - 1].su.date >= feed[i].su.date).toBe(true);
    }
    expect(feed[0].stageId).toBe('physicalDesign');
  });
});
