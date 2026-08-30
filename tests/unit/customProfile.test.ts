import { describe, expect, it } from 'vitest';
import { BUILTIN_PROFILE, stageMilestone } from '@/data/scheduleProfiles';
import {
  kickoffForAnchor,
  pickStages,
  requiredStages,
  StageChoiceError,
} from '@/lib/customProfile';
import type { MilestoneDef, ProfileStageDef } from '@/data/types';

const stage = (
  key: string,
  order: number,
  startOffsetWeeks: number,
  durationWeeks = 4,
): ProfileStageDef => ({
  key,
  order,
  title: key.toUpperCase(),
  shortTitle: key.slice(0, 3).toUpperCase(),
  phaseId: 'define',
  baseKey: key,
  startOffsetWeeks,
  durationWeeks,
});

const BASE = [stage('a', 0, 0), stage('b', 1, 4), stage('c', 2, 12), stage('d', 3, 20)];
const NO_MILESTONES: Record<string, MilestoneDef> = {};

describe('starting a program on some of a template’s stages', () => {
  it('keeps the chosen stages, in the template’s order', () => {
    const out = pickStages(BASE, ['d', 'a', 'c'], NO_MILESTONES);
    expect(out.map((s) => s.key)).toEqual(['a', 'c', 'd']);
    expect(out.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  /* The gaps between kept stages are the template's claim about what has to
     happen before what, so they survive. Dropping b leaves the eight weeks
     between a and c exactly where they were. */
  it('leaves the offsets between the stages it kept alone', () => {
    const out = pickStages(BASE, ['a', 'c', 'd'], NO_MILESTONES);
    expect(out.map((s) => s.startOffsetWeeks)).toEqual([0, 12, 20]);
  });

  /* But kickoff means kickoff: drop the stages at the front and the run moves
     back to week zero rather than starting three months into its own plan. */
  it('shifts the run so the first stage it kept starts at kickoff', () => {
    const out = pickStages(BASE, ['c', 'd'], NO_MILESTONES);
    expect(out.map((s) => s.startOffsetWeeks)).toEqual([0, 8]);
    /* and nothing else about the shape moved */
    expect(out.map((s) => s.durationWeeks)).toEqual([4, 4]);
  });

  it('refuses a program with no stages at all', () => {
    expect(() => pickStages(BASE, [], NO_MILESTONES)).toThrow(StageChoiceError);
  });

  it('refuses a stage the template does not have', () => {
    expect(() => pickStages(BASE, ['a', 'zz'], NO_MILESTONES)).toThrow(/No such stage: zz/);
  });

  /* A major checkpoint hangs off the end of a stage. Without the stage there is
     no tapeout, and a program with no tapeout is not one anybody meant to
     start. */
  it('will not let a stage carrying a major checkpoint be dropped', () => {
    const anchored = { b: { id: 'm', label: 'Tapeout', major: true } as MilestoneDef };
    expect(() => pickStages(BASE, ['a', 'c'], anchored)).toThrow(/carries Tapeout/);
    expect(pickStages(BASE, ['a', 'b'], anchored).map((s) => s.key)).toEqual(['a', 'b']);
  });

  /* A lesser one leaves with its stage. A program with no test chip has no
     Test Chip Silicon date, and should not claim one. */
  it('lets a stage carrying a minor checkpoint go', () => {
    const anchored = { b: { id: 'm', label: 'Test Chip Silicon' } as MilestoneDef };
    expect(pickStages(BASE, ['a', 'c'], anchored).map((s) => s.key)).toEqual(['a', 'c']);
  });
});

describe('against the profile the app actually ships', () => {
  it('locks the three stages the countdowns need, and no more', () => {
    const must = requiredStages(BUILTIN_PROFILE.stages, stageMilestone);
    expect([...must].sort()).toEqual(['fabrication', 'qualification', 'tapeout']);
  });

  /* The point of the feature: most of the 23 can go. */
  it('leaves the great majority of the stages optional', () => {
    const must = requiredStages(BUILTIN_PROFILE.stages, stageMilestone);
    expect(BUILTIN_PROFILE.stages.length - must.size).toBeGreaterThan(15);
  });

  it('keeping everything gives back the profile unchanged', () => {
    const all = BUILTIN_PROFILE.stages.map((s) => s.key);
    const out = pickStages(BUILTIN_PROFILE.stages, all, stageMilestone);
    expect(out).toEqual([...BUILTIN_PROFILE.stages]);
  });

  it('a program on the required stages alone still has every milestone', () => {
    const must = [...requiredStages(BUILTIN_PROFILE.stages, stageMilestone)];
    const out = pickStages(BUILTIN_PROFILE.stages, must, stageMilestone);
    expect(out.length).toBe(must.length);
    /* something starts at kickoff — not necessarily the first row, since
       stages overlap and order is not start order */
    expect(Math.min(...out.map((s) => s.startOffsetWeeks))).toBe(0);
  });
});

describe('anchoring the plan to a stage other than the first', () => {
  const day = (d: Date) => d.toISOString().slice(0, 10);

  it('gives the date back unchanged when the anchor is the first stage', () => {
    expect(day(kickoffForAnchor(BASE, 'a', new Date(Date.UTC(2026, 2, 2))))).toBe('2026-03-02');
  });

  /* "Physical Design starts in March" is the fixed point on a great many
     programs. Anchoring on c, twelve weeks in, puts week zero twelve weeks
     earlier — and c then starts on the day that was typed. */
  it('puts week zero before the date when the anchor is partway through', () => {
    const kickoff = kickoffForAnchor(BASE, 'c', new Date(Date.UTC(2026, 2, 2)));
    expect(day(kickoff)).toBe('2025-12-08');
    /* twelve weeks later is the date asked for */
    const back = new Date(kickoff);
    back.setDate(back.getDate() + 12 * 7);
    expect(day(back)).toBe('2026-03-02');
  });

  it('refuses an anchor the list does not have', () => {
    expect(() => kickoffForAnchor(BASE, 'zz', new Date())).toThrow(StageChoiceError);
  });

  /* The two work together: pick the stages, then anchor on one of them. */
  it('anchors on the trimmed list, not on the template', () => {
    const kept = pickStages(BASE, ['c', 'd'], NO_MILESTONES);
    /* c is the first kept stage, so it is week zero and the date is the date */
    expect(day(kickoffForAnchor(kept, 'c', new Date(Date.UTC(2026, 2, 2))))).toBe('2026-03-02');
    /* d is eight weeks after c once the run has been shifted */
    expect(day(kickoffForAnchor(kept, 'd', new Date(Date.UTC(2026, 2, 2))))).toBe('2026-01-05');
  });
});
