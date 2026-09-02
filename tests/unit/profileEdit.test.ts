import { describe, expect, it } from 'vitest';
import {
  addStage,
  assertPrefixes,
  duplicatePrefixes,
  moveStage,
  normalizePrefix,
  prefixCharsOk,
  refRenames,
  removeStage,
  retimeStage,
  setStagePrefix,
  StageEditError,
  typedPrefix,
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

describe('a stage prefix', () => {
  /* The prefix is what every reference in the stage is built from — DEF-01 is
     the first activity of the stage whose prefix is DEF — so it is stored the
     way it is printed and there is no second form to keep in step. */
  /* The canonical form, used where a prefix is compared or stored — never on
     the way in from the keyboard. */
  it('has one canonical form, for comparing and storing', () => {
    expect(normalizePrefix('  cus ')).toBe('CUS');
    expect(normalizePrefix('pkg-d')).toBe('PKGD');
    expect(normalizePrefix('a b c')).toBe('ABC');
    expect(normalizePrefix('verylongprefix')).toBe('VERYLO');
    expect(normalizePrefix('!!')).toBe('');
  });

  /* Typing removes nothing. Stripping a character the field cannot use looks
     exactly like a dead field: a Korean input source answers the `d` key with
     `ㅇ`, and swallowing it left nothing on screen while digits — which never
     reach an input method — went in fine. What cannot be a prefix is reported
     rather than deleted, which is how the duplicate rule already behaves. */
  it('keeps what was typed, upper-cased, and swallows nothing', () => {
    expect(typedPrefix(' cus ')).toBe(' CUS ');
    expect(typedPrefix('ㅇㄷ')).toBe('ㅇㄷ');
    expect(typedPrefix('cus-t')).toBe('CUS-T');
    expect(typedPrefix('verylongprefix')).toBe('VERYLO');
  });

  it('is set on the one stage named', () => {
    const out = setStagePrefix(BASE, 'b', 'cus');
    expect(out.map((s) => s.shortTitle)).toEqual(['A', 'CUS', 'C']);
  });

  /* Upper-casing a half-composed syllable rewrites the value under the input
     method and destroys the composition. While one is running, the field holds
     exactly what it is given. */
  it('leaves a composing input method alone', () => {
    expect(setStagePrefix(BASE, 'b', 'ㅇ', true)[1].shortTitle).toBe('ㅇ');
    expect(setStagePrefix(BASE, 'b', 'de', true)[1].shortTitle).toBe('de');
  });

  it('says which characters a prefix may hold', () => {
    expect(prefixCharsOk('CUS')).toBe(true);
    expect(prefixCharsOk('PD2')).toBe(true);
    expect(prefixCharsOk('ㅇㄷ')).toBe(false);
    expect(prefixCharsOk('CUS-T')).toBe(false);
    expect(prefixCharsOk('')).toBe(false);
  });

  /* The message has to name the value and say what to do about it, because
     the reason the field looks broken is invisible from inside it. */
  it('refuses a prefix no reference could carry, and names it', () => {
    const hangul = setStagePrefix(BASE, 'b', 'ㅇㄷ');
    expect(() => assertPrefixes(hangul)).toThrow(/ㅇㄷ/);
    expect(() => assertPrefixes(hangul)).toThrow(/English/);
  });

  it('refuses a stage that is not there', () => {
    expect(() => setStagePrefix(BASE, 'zz', 'X')).toThrow(StageEditError);
  });

  /* Setting does not throw on a clash: a prefix is typed a letter at a time,
     and rejecting a keystroke because the half-typed value collides would make
     the field impossible to edit. The clash is reported, and refused on save. */
  it('accepts a clash while it is being typed, and names it', () => {
    const clashing = setStagePrefix(BASE, 'b', 'A');
    expect(clashing[1].shortTitle).toBe('A');
    expect(duplicatePrefixes(clashing)).toEqual(['A']);
    expect(() => assertPrefixes(clashing)).toThrow(/A/);
  });

  it('sees no duplicate in a list where every prefix stands alone', () => {
    expect(duplicatePrefixes(BASE)).toEqual([]);
    expect(() => assertPrefixes(BASE)).not.toThrow();
  });

  it('refuses a stage left with no prefix at all', () => {
    expect(() => assertPrefixes(setStagePrefix(BASE, 'b', ''))).toThrow(StageEditError);
  });

  /* Two blanks are one problem, not two: the empty message says it first. */
  it('reports the blank rather than counting blanks as a duplicate', () => {
    const blanks = setStagePrefix(setStagePrefix(BASE, 'a', ''), 'b', '');
    expect(duplicatePrefixes(blanks)).toEqual([]);
    expect(() => assertPrefixes(blanks)).toThrow(/prefix/i);
  });

  /* An added stage cannot arrive already clashing, or the dialog would open on
     an error nobody caused. */
  it('is unique on a stage that was just added', () => {
    const one = addStage(BASE, 3);
    expect(one[3].shortTitle).toBe('NEW');
    const two = addStage(one, 4);
    expect(two[4].shortTitle).toBe('NEW2');
    expect(duplicatePrefixes(two)).toEqual([]);
  });
});

describe('renaming the references a prefix owns', () => {
  const acts = [
    { ref: 'NEW-01', stageKey: 'b' },
    { ref: 'NEW-04', stageKey: 'b' },
    { ref: 'A-01', stageKey: 'a' },
  ];

  /* The number is the activity's identity within its stage; the prefix is the
     stage's. Changing one must not disturb the other. */
  it('carries the number across unchanged', () => {
    expect(refRenames(acts, [{ stageKey: 'b', from: 'NEW', to: 'CUS' }])).toEqual([
      { from: 'NEW-01', to: 'CUS-01' },
      { from: 'NEW-04', to: 'CUS-04' },
    ]);
  });

  it('leaves the other stages alone', () => {
    const out = refRenames(acts, [{ stageKey: 'b', from: 'NEW', to: 'CUS' }]);
    expect(out.some((r) => r.from === 'A-01')).toBe(false);
  });

  it('has nothing to do when the prefix did not move', () => {
    expect(refRenames(acts, [{ stageKey: 'b', from: 'NEW', to: 'NEW' }])).toEqual([]);
    expect(refRenames(acts, [])).toEqual([]);
  });

  /* A row whose ref does not start with the old prefix was named by hand or by
     an older prefix; renaming it would be a guess. */
  it('ignores a reference the old prefix does not own', () => {
    const odd = [{ ref: 'ZZ-09', stageKey: 'b' }];
    expect(refRenames(odd, [{ stageKey: 'b', from: 'NEW', to: 'CUS' }])).toEqual([]);
  });

  /* profileId+ref is unique, so a rename onto a live ref would fail in the
     database. It fails here instead, where the message can say which. */
  it('refuses to rename onto a reference that already exists', () => {
    const clash = [...acts, { ref: 'CUS-01', stageKey: 'c' }];
    expect(() => refRenames(clash, [{ stageKey: 'b', from: 'NEW', to: 'CUS' }])).toThrow(
      /CUS-01/,
    );
  });
});
