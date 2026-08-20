import { describe, expect, it } from 'vitest';
import { BUILTIN_PROFILE, milestoneDefs } from '@/data/scheduleProfiles';
import type { ProfileStageDef, ScheduleProfile } from '@/data/types';
import { computeSchedule, fmtDate } from '@/lib/schedule';
import {
  defaultShortTitle,
  forkName,
  newStage,
  resolveStages,
  stageBands,
  toProfileStages,
} from '@/lib/stages';

const KICKOFF = new Date(2027, 4, 12); // 05/12/2027

const custom = (over: Partial<ProfileStageDef> & { key: string; order: number }): ProfileStageDef => ({
  title: over.key,
  shortTitle: 'X',
  phaseId: 'define',
  baseKey: null,
  startOffsetWeeks: 0,
  durationWeeks: 4,
  ...over,
});

const profileOf = (stages: ProfileStageDef[]): ScheduleProfile => ({
  id: 'p1',
  label: 'Forked',
  builtin: false,
  stages,
});

describe('resolving a profile into stages', () => {
  it('gives the built-in profile the prototype content, in order', () => {
    const stages = resolveStages(BUILTIN_PROFILE);
    expect(stages).toHaveLength(12);
    expect(stages.map((s) => s.id)).toEqual(BUILTIN_PROFILE.stages.map((s) => s.key));
    expect(stages.map((s) => s.stage)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    const def = stages[0];
    expect(def.title).toBe('Product Definition');
    expect(def.vizKey).toBe('productDefinition');
    expect(def.phaseId).toBe('define');
    expect(def.baseline).toEqual({ startOffsetWeeks: 0, durationWeeks: 4 });
    expect(def.activities.length).toBeGreaterThan(0);
    expect(def.leader.name).toBe('Daniel Kim');
  });

  it('sorts by order, not by the order the rows arrive in', () => {
    const stages = resolveStages(
      profileOf([
        custom({ key: 'b', order: 1, title: 'Second' }),
        custom({ key: 'a', order: 0, title: 'First' }),
      ]),
    );
    expect(stages.map((s) => s.title)).toEqual(['First', 'Second']);
    expect(stages.map((s) => s.stage)).toEqual([1, 2]);
  });

  it('starts an added stage blank — no text, no drawing, no leader', () => {
    const [s] = resolveStages(
      profileOf([custom({ key: 'stg_1', order: 0, title: 'Package Bring-up', shortTitle: 'PBU' })]),
    );
    expect(s.vizKey).toBeNull();
    expect(s.shortTitle).toBe('PBU');
    expect(s.tagline).toBe('');
    expect(s.description).toBe('');
    expect(s.deliverables).toEqual([]);
    expect(s.potentialRisks).toEqual([]);
    expect(s.leader).toEqual({ name: '', short: '', phone: '', email: '' });
  });

  it('keeps the built-in text while the profile row supplies the title', () => {
    const [s] = resolveStages(
      profileOf([custom({ key: 'rtl', order: 0, title: 'RTL & Integration', baseKey: 'rtl' })]),
    );
    expect(s.title).toBe('RTL & Integration');
    expect(s.vizKey).toBe('rtl');
    expect(s.activities.length).toBeGreaterThan(0);
  });

  it('round-trips through the rows a profile stores', () => {
    const rows = toProfileStages(resolveStages(BUILTIN_PROFILE));
    expect(rows).toEqual(BUILTIN_PROFILE.stages);
  });
});

describe('lifecycle bands', () => {
  it('groups consecutive stages that share a phase', () => {
    const bands = stageBands(resolveStages(BUILTIN_PROFILE));
    expect(bands.map((b) => b.id)).toEqual([
      'define',
      'designVerify',
      'implement',
      'manufacture',
      'integrate',
      'validateRamp',
    ]);
    expect(bands[0].stages).toEqual(['productDefinition', 'architecture']);
    expect(bands[2].label).toBe('Implement');
  });

  it('opens a second band when a phase comes back later', () => {
    const bands = stageBands(
      resolveStages(
        profileOf([
          custom({ key: 'a', order: 0, phaseId: 'define' }),
          custom({ key: 'b', order: 1, phaseId: 'implement' }),
          custom({ key: 'c', order: 2, phaseId: 'define' }),
        ]),
      ),
    );
    expect(bands.map((b) => b.id)).toEqual(['define', 'implement', 'define']);
    expect(bands.map((b) => b.stages)).toEqual([['a'], ['b'], ['c']]);
  });
});

describe('naming', () => {
  it('makes a legend from a title when none is given', () => {
    expect(defaultShortTitle('Package Bring-up')).toBe('PBU');
    expect(defaultShortTitle('Trial')).toBe('TRI');
    expect(defaultShortTitle('Design For Test Insertion')).toBe('DFTI');
    expect(defaultShortTitle('  ')).toBe('NEW');
    expect(newStage('k', 'Second Die', { startOffsetWeeks: 4, durationWeeks: 6 }).shortTitle).toBe(
      'SD',
    );
  });

  it('numbers a fork past the copies already taken', () => {
    expect(forkName('Typical SoC', [])).toBe('Typical SoC (copy)');
    expect(forkName('Typical SoC', ['Typical SoC (copy)'])).toBe('Typical SoC (copy 2)');
    expect(forkName('Typical SoC', ['Typical SoC (copy)', 'Typical SoC (copy 2)'])).toBe(
      'Typical SoC (copy 3)',
    );
  });
});

describe('scheduling a profile that is not the built-in one', () => {
  it('places added stages and skips milestones whose stage is gone', () => {
    const profile = profileOf([
      custom({ key: 'productDefinition', order: 0, baseKey: 'productDefinition', durationWeeks: 4 }),
      custom({ key: 'stg_new', order: 1, title: 'Second Die', startOffsetWeeks: 4, durationWeeks: 6 }),
    ]);
    const s = computeSchedule(KICKOFF, profile, {});
    expect(Object.keys(s.stages)).toEqual(['productDefinition', 'stg_new']);
    expect(fmtDate(s.stages.stg_new.start)).toBe('06/09/2027');
    expect(fmtDate(s.stages.stg_new.end)).toBe('07/21/2027');
    expect(s.totalWeeks).toBe(10);
    // no architecture, no Arch Freeze
    expect(s.milestones).toHaveLength(0);
    // and the three toolbar dates fall back to where the program actually ends
    expect(fmtDate(s.production)).toBe('07/21/2027');
  });

  it('keeps the milestones whose stages survive', () => {
    const keep = ['architecture', 'tapeout'];
    const profile: ScheduleProfile = {
      ...BUILTIN_PROFILE,
      builtin: false,
      stages: BUILTIN_PROFILE.stages.filter((st) => keep.includes(st.key)),
    };
    const s = computeSchedule(KICKOFF, profile, {});
    expect(s.milestones.map((m) => m.id)).toEqual(['archFreeze', 'tapeout']);
    expect(milestoneDefs.length).toBeGreaterThan(s.milestones.length);
    expect(fmtDate(s.tapeout)).toBe(fmtDate(s.stages.tapeout.end));
  });
});
