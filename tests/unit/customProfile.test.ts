import { describe, expect, it } from 'vitest';
import { BUILTIN_PROFILE, stageMilestone } from '@/data/scheduleProfiles';
import { computeSchedule } from '@/lib/schedule';
import { kickoffForAnchor, pickStages, StageChoiceError } from '@/lib/customProfile';
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

describe('starting a program on some of a template’s stages', () => {
  it('keeps the chosen stages, in the template’s order', () => {
    const out = pickStages(BASE, ['d', 'a', 'c']);
    expect(out.map((s) => s.key)).toEqual(['a', 'c', 'd']);
    expect(out.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  /* The gaps between kept stages are the template's claim about what has to
     happen before what, so they survive. Dropping b leaves the eight weeks
     between a and c exactly where they were. */
  it('leaves the offsets between the stages it kept alone', () => {
    const out = pickStages(BASE, ['a', 'c', 'd']);
    expect(out.map((s) => s.startOffsetWeeks)).toEqual([0, 12, 20]);
  });

  /* But kickoff means kickoff: drop the stages at the front and the run moves
     back to week zero rather than starting three months into its own plan. */
  it('shifts the run so the first stage it kept starts at kickoff', () => {
    const out = pickStages(BASE, ['c', 'd']);
    expect(out.map((s) => s.startOffsetWeeks)).toEqual([0, 8]);
    /* and nothing else about the shape moved */
    expect(out.map((s) => s.durationWeeks)).toEqual([4, 4]);
  });

  it('refuses a program with no stages at all', () => {
    expect(() => pickStages(BASE, [])).toThrow(StageChoiceError);
  });

  it('refuses a stage the template does not have', () => {
    expect(() => pickStages(BASE, ['a', 'zz'])).toThrow(/No such stage: zz/);
  });

  /* Any stage can go, including the ones carrying the checkpoints every
     countdown reads. A derivative doing only the package work is a real
     program; what it must not do is show a tapeout date it does not have. */
  it('lets any stage go, whatever it carries', () => {
    expect(pickStages(BASE, ['a', 'c']).map((s) => s.key)).toEqual(['a', 'c']);
    expect(pickStages(BASE, ['d']).map((s) => s.key)).toEqual(['d']);
  });
});

describe('against the profile the app actually ships', () => {
  /* A program that stops at signoff: no tapeout, no fabrication, no
     production. The three dates are null rather than standing in for
     something else, which is what lets the screens say "No tapeout". */
  it('a program without those stages simply has no such dates', () => {
    const stages = pickStages(
      BUILTIN_PROFILE.stages,
      BUILTIN_PROFILE.stages
        .map((s) => s.key)
        .filter((k) => !['tapeout', 'fabrication', 'qualification'].includes(k)),
    );
    const s = computeSchedule(new Date(2026, 0, 5), { ...BUILTIN_PROFILE, stages }, {});
    expect(s.tapeout).toBeNull();
    expect(s.firstSilicon).toBeNull();
    expect(s.production).toBeNull();
    /* and it keeps the checkpoints of the stages it does run */
    expect(s.milestones.map((m) => m.anchor.stage)).not.toContain('tapeout');
    expect(s.milestones.length).toBe(stages.length);
  });

  it('keeping everything gives back the profile unchanged', () => {
    const all = BUILTIN_PROFILE.stages.map((s) => s.key);
    const out = pickStages(BUILTIN_PROFILE.stages, all);
    expect(out).toEqual([...BUILTIN_PROFILE.stages]);
  });

  it('a handful of stages from the middle still starts at kickoff', () => {
    const some = ['tapeout', 'fabrication', 'qualification'];
    const out = pickStages(BUILTIN_PROFILE.stages, some);
    expect(out.length).toBe(some.length);
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
    const kept = pickStages(BASE, ['c', 'd']);
    /* c is the first kept stage, so it is week zero and the date is the date */
    expect(day(kickoffForAnchor(kept, 'c', new Date(Date.UTC(2026, 2, 2))))).toBe('2026-03-02');
    /* d is eight weeks after c once the run has been shifted */
    expect(day(kickoffForAnchor(kept, 'd', new Date(Date.UTC(2026, 2, 2))))).toBe('2026-01-05');
  });
});
