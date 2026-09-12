import { describe, expect, it } from 'vitest';
import {
  retimeStageByDate,
  stageWindow,
  weeksFromKickoff,
  StageEditError,
} from '@/lib/profileEdit';
import { addWeeks } from '@/lib/schedule';
import type { ProfileStageDef } from '@/data/types';

/**
 * Reading a template's stages as dates, and editing them that way.
 *
 * A template still stores weeks and nothing but weeks — `startOffsetWeeks` and
 * `durationWeeks`, exactly as before. The kickoff is a reading aid the editor
 * supplies, so every date here is derived on the way out and converted back on
 * the way in. That is the whole reason these are pure functions: the rule that
 * a template has no dates in it survives only if the conversion lives outside
 * the stored shape.
 */

const KICKOFF = new Date(2026, 0, 5); // a Monday, so the arithmetic reads cleanly

const stage = (key: string, start: number, dur: number): ProfileStageDef => ({
  key,
  order: 0,
  title: key,
  shortTitle: key.toUpperCase(),
  phaseId: 'define',
  baseKey: null,
  startOffsetWeeks: start,
  durationWeeks: dur,
});

const BASE = [stage('a', 0, 8), stage('b', 6, 18)];

describe('reading a stage as dates', () => {
  it('starts at the kickoff plus its offset and runs for its length', () => {
    const { start, end } = stageWindow(KICKOFF, BASE[1]);
    expect(start).toEqual(addWeeks(KICKOFF, 6));
    expect(end).toEqual(addWeeks(KICKOFF, 24));
  });

  it('puts a stage with no offset on the kickoff itself', () => {
    expect(stageWindow(KICKOFF, BASE[0]).start).toEqual(KICKOFF);
  });
});

describe('weeks from the kickoff', () => {
  it('counts whole weeks forward', () => {
    expect(weeksFromKickoff(KICKOFF, addWeeks(KICKOFF, 6))).toBe(6);
  });

  /* A stage's offsets are whole weeks; a date picker hands back any day. The
     nearest week is the honest reading of "this stage starts that week", and
     it keeps a half-week from creeping into a template that has never held
     one. */
  it('rounds a mid-week date to the nearest week', () => {
    const d = addWeeks(KICKOFF, 6);
    d.setDate(d.getDate() + 3);
    expect(weeksFromKickoff(KICKOFF, d)).toBe(6);
    d.setDate(d.getDate() + 2);
    expect(weeksFromKickoff(KICKOFF, d)).toBe(7);
  });

  it('is negative before the kickoff, so the caller can reject it', () => {
    expect(weeksFromKickoff(KICKOFF, addWeeks(KICKOFF, -2))).toBe(-2);
  });
});

describe('editing a stage by its dates', () => {
  /* Moving the start moves the stage; it does not stretch it. Same rule the
     week fields have always followed. */
  it('a new start moves the stage and keeps its length', () => {
    const out = retimeStageByDate(BASE, 'b', KICKOFF, { start: addWeeks(KICKOFF, 10) });
    expect(out[1].startOffsetWeeks).toBe(10);
    expect(out[1].durationWeeks).toBe(18);
  });

  it('a new end changes the length and keeps the start', () => {
    const out = retimeStageByDate(BASE, 'b', KICKOFF, { end: addWeeks(KICKOFF, 30) });
    expect(out[1].startOffsetWeeks).toBe(6);
    expect(out[1].durationWeeks).toBe(24);
  });

  it('leaves every other stage alone', () => {
    const out = retimeStageByDate(BASE, 'b', KICKOFF, { end: addWeeks(KICKOFF, 30) });
    expect(out[0]).toEqual(BASE[0]);
  });

  /* The two edits are the same edit seen from either end, which is what makes
     the TAT column and the end-date column interchangeable. */
  it('setting the end is the same as setting the length it implies', () => {
    const byEnd = retimeStageByDate(BASE, 'b', KICKOFF, { end: addWeeks(KICKOFF, 30) });
    expect(byEnd).toEqual(
      retimeStageByDate(BASE, 'b', KICKOFF, { durationWeeks: 24 }),
    );
  });

  it('refuses a start before the kickoff', () => {
    expect(() =>
      retimeStageByDate(BASE, 'b', KICKOFF, { start: addWeeks(KICKOFF, -1) }),
    ).toThrow(StageEditError);
  });

  it('refuses an end on or before the start', () => {
    expect(() =>
      retimeStageByDate(BASE, 'b', KICKOFF, { end: addWeeks(KICKOFF, 6) }),
    ).toThrow(StageEditError);
    expect(() =>
      retimeStageByDate(BASE, 'b', KICKOFF, { end: addWeeks(KICKOFF, 2) }),
    ).toThrow(StageEditError);
  });

  /* Moving the start past the old end would otherwise leave a negative length.
     The stage travels whole, so it cannot. */
  it('a start moved beyond the old end takes the end with it', () => {
    const out = retimeStageByDate(BASE, 'b', KICKOFF, { start: addWeeks(KICKOFF, 40) });
    expect(out[1].startOffsetWeeks).toBe(40);
    expect(out[1].durationWeeks).toBe(18);
  });

  it('refuses a date that is not a date', () => {
    expect(() =>
      retimeStageByDate(BASE, 'b', KICKOFF, { start: new Date(Number.NaN) }),
    ).toThrow(StageEditError);
  });
});
