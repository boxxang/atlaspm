import { describe, expect, it } from 'vitest';
import {
  addStage,
  moveStage,
  removeStage,
  retimeStage,
  StageEditError,
} from '@/lib/profileEdit';
import type { ProfileStageDef } from '@/data/types';

const st = (key: string, order: number, start = 0, dur = 4): ProfileStageDef => ({
  key,
  order,
  title: key.toUpperCase(),
  shortTitle: key.slice(0, 3).toUpperCase(),
  phaseId: 'define',
  baseKey: key,
  startOffsetWeeks: start,
  durationWeeks: dur,
});

const BASE = [st('a', 0, 0, 4), st('b', 1, 4, 6), st('c', 2, 10, 8)];

describe('adding a stage', () => {
  /* A stage someone added points at no built-in stage, so it starts blank —
     the same rule ProfileStage.baseKey already states. */
  it('inserts a blank stage that inherits nothing', () => {
    const out = addStage(BASE, 1);
    expect(out.map((s) => s.key)).toEqual(['a', 'new-1', 'b', 'c']);
    expect(out[1].baseKey).toBeNull();
    expect(out[1].title).toBe('New stage');
  });

  /* It takes the band of the stage it was dropped after, because a stage
     belongs to a lifecycle phase and guessing wrong puts it on the wrong row. */
  it('takes its lifecycle band from the stage before it', () => {
    const withBand = [st('a', 0), { ...st('b', 1), phaseId: 'implement' }];
    expect(addStage(withBand, 2)[2].phaseId).toBe('implement');
  });

  it('opens at the end of the stage before it, lasting four weeks', () => {
    const out = addStage(BASE, 1);
    expect(out[1].startOffsetWeeks).toBe(4);
    expect(out[1].durationWeeks).toBe(4);
  });

  it('numbers each added stage apart from the last', () => {
    const once = addStage(BASE, 3);
    expect(addStage(once, 4).map((s) => s.key)).toEqual(['a', 'b', 'c', 'new-1', 'new-2']);
  });

  it('renumbers order so it is the position in the list', () => {
    expect(addStage(BASE, 1).map((s) => s.order)).toEqual([0, 1, 2, 3]);
  });
});

describe('removing a stage', () => {
  it('drops it and renumbers the rest', () => {
    const out = removeStage(BASE, 'b');
    expect(out.map((s) => s.key)).toEqual(['a', 'c']);
    expect(out.map((s) => s.order)).toEqual([0, 1]);
  });

  /* The gap the removed stage left stays: the offsets are the template's claim
     about what happens when, and the work after it does not move earlier
     because you stopped tracking the work before it. */
  it('leaves the offsets of the stages it kept alone', () => {
    expect(removeStage(BASE, 'b').map((s) => s.startOffsetWeeks)).toEqual([0, 10]);
  });

  it('refuses to empty the list', () => {
    expect(() => removeStage([st('a', 0)], 'a')).toThrow(StageEditError);
  });

  it('refuses a stage that is not there', () => {
    expect(() => removeStage(BASE, 'zz')).toThrow(/No such stage: zz/);
  });
});

describe('moving a stage', () => {
  it('puts it at the position asked for and renumbers', () => {
    const out = moveStage(BASE, 'c', 0);
    expect(out.map((s) => s.key)).toEqual(['c', 'a', 'b']);
    expect(out.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  /* Order is the y-axis, not the calendar. Moving a row does not reschedule it. */
  it('does not change any stage’s dates', () => {
    expect(moveStage(BASE, 'c', 0).map((s) => s.startOffsetWeeks)).toEqual([10, 0, 4]);
  });

  it('clamps a position past either end', () => {
    expect(moveStage(BASE, 'a', 99).map((s) => s.key)).toEqual(['b', 'c', 'a']);
    expect(moveStage(BASE, 'c', -3).map((s) => s.key)).toEqual(['c', 'a', 'b']);
  });
});

describe('re-timing a stage', () => {
  it('changes only the stage named', () => {
    const out = retimeStage(BASE, 'b', { startOffsetWeeks: 5, durationWeeks: 7 });
    expect(out[1].startOffsetWeeks).toBe(5);
    expect(out[1].durationWeeks).toBe(7);
    expect(out[0]).toEqual(BASE[0]);
    expect(out[2]).toEqual(BASE[2]);
  });

  it('leaves a field the patch does not mention', () => {
    expect(retimeStage(BASE, 'b', { durationWeeks: 9 })[1].startOffsetWeeks).toBe(4);
  });

  /* A stage with no length is not a stage, and a negative offset would put it
     before the programme starts. */
  it('refuses a duration of zero or less', () => {
    expect(() => retimeStage(BASE, 'b', { durationWeeks: 0 })).toThrow(StageEditError);
  });

  it('refuses a negative offset', () => {
    expect(() => retimeStage(BASE, 'b', { startOffsetWeeks: -1 })).toThrow(StageEditError);
  });
});
