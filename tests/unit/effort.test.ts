import { describe, expect, it } from 'vitest';
import { journeyData } from '@/data/journey';
import { SEED_COST_PER_MAN_MONTH, SEED_EFFORT } from '@/data/projectSeed';
import { STAGE_ORDER } from '@/data/scheduleProfiles';
import {
  estimateCost,
  formatCost,
  formatManMonths,
  formatManMonthsShort,
  formatTat,
  parseEffort,
  parseTat,
  serialiseEffort,
  serialiseTat,
  sumEffort,
  sumEffortText,
} from '@/lib/effort';
import { resolveStageDetail } from '@/lib/stageDetail';

describe('reading and writing effort', () => {
  it('aligns stored values to the engineering list', () => {
    expect(parseEffort('4\n2\n1', 3)).toEqual([4, 2, 1]);
    // short input pads, long input truncates
    expect(parseEffort('4', 3)).toEqual([4, 0, 0]);
    expect(parseEffort('4\n2\n1\n9', 2)).toEqual([4, 2]);
    expect(parseEffort(null, 2)).toEqual([0, 0]);
  });

  it('treats junk and negatives as nothing recorded', () => {
    expect(parseEffort('abc\n-3\n\n2.5', 4)).toEqual([0, 0, 0, 2.5]);
  });

  it('stores nothing when nothing was recorded', () => {
    expect(serialiseEffort([0, 0, 0])).toBe(null);
    expect(serialiseEffort([0, 2.5, 0])).toBe('0\n2.5\n0');
  });

  it('round-trips', () => {
    const values = [4, 0, 1.5];
    expect(parseEffort(serialiseEffort(values), 3)).toEqual(values);
  });

  it('sums to one decimal, ignoring negatives', () => {
    expect(sumEffort([1, 2, 3])).toBe(6);
    expect(sumEffort([1.1, 2.2])).toBe(3.3);
    expect(sumEffort([])).toBe(0);
    expect(sumEffortText('2\n2.5\nabc')).toBe(4.5);
    expect(sumEffortText(null)).toBe(0);
  });
});

describe('formatting', () => {
  it('shows whole numbers whole and halves as halves', () => {
    expect(formatManMonths(12)).toBe('12 MM');
    expect(formatManMonths(12.5)).toBe('12.5 MM');
    expect(formatManMonthsShort(180)).toBe('180 MM');
    expect(formatManMonthsShort(1200)).toBe('1.2k MM');
    expect(formatManMonthsShort(2000)).toBe('2k MM');
  });

  it('formats a cost in the program currency', () => {
    expect(formatCost(10635000, 'USD')).toBe('$10,635,000');
    expect(formatCost(1000000, 'KRW')).toContain('1,000,000');
    expect(formatCost(1234, 'NOTREAL')).toBe('1,234 NOTREAL');
  });

  it('multiplies effort by the rate', () => {
    expect(estimateCost(709, 15000)).toBe(10635000);
    expect(estimateCost(0, 15000)).toBe(0);
    expect(estimateCost(709, 0)).toBe(0);
  });
});

describe('the seeded program', () => {
  it('gives every engineering line a figure', () => {
    for (const stage of journeyData) {
      expect(SEED_EFFORT[stage.id], stage.id).toHaveLength(stage.engineeringView.length);
      expect(SEED_EFFORT[stage.id].every((v) => v > 0), stage.id).toBe(true);
    }
  });

  it('adds up to the program total the card shows', () => {
    const total = sumEffort(STAGE_ORDER.flatMap((id) => SEED_EFFORT[id]));
    expect(total).toBe(3667);
    expect(estimateCost(total, SEED_COST_PER_MAN_MONTH)).toBe(55_005_000);
  });

  it('resolves through the stage detail merge', () => {
    const pd = journeyData.find((s) => s.id === 'productDefinition')!;
    const r = resolveStageDetail(pd, {
      engineeringEffort: serialiseEffort(SEED_EFFORT.productDefinition),
    });
    expect(r.engineeringEffort).toEqual(SEED_EFFORT.productDefinition);
    expect(r.manMonths).toBe(28);
    // effort does not disturb the text, which still comes from the shared stage
    expect(r.description).toBe(pd.description);
    expect(r.engineeringView).toEqual([...pd.engineeringView]);
    // …and recording it is not a text edit, so the stage is not marked EDITED
    expect(r.overridden.size).toBe(0);
  });

  it('inherits the template figures when a program has entered nothing', () => {
    const pd = journeyData.find((s) => s.id === 'productDefinition')!;
    const r = resolveStageDetail(pd, null);
    expect(r.engineeringEffort).toEqual([...pd.engineeringEffort]);
    expect(r.engineeringTat).toEqual([...pd.engineeringTat]);
    expect(r.manMonths).toBe(28);
    /* inheriting is not editing — the stage is still tracking the template */
    expect(r.overridden.size).toBe(0);
  });

  it('lets one recorded figure override without losing the rest', () => {
    const pd = journeyData.find((s) => s.id === 'productDefinition')!;
    const mine = [...pd.engineeringEffort];
    mine[0] = 99;
    const r = resolveStageDetail(pd, { engineeringEffort: serialiseEffort(mine) });
    expect(r.engineeringEffort[0]).toBe(99);
    expect(r.engineeringEffort.slice(1)).toEqual([...pd.engineeringEffort].slice(1));
  });

  it('stops inheriting once the program owns the activity list', () => {
    const pd = journeyData.find((s) => s.id === 'productDefinition')!;
    /* the indices no longer point at the same activities, so the template's
       numbers would be attached to the wrong rows */
    const r = resolveStageDetail(pd, { engineeringView: 'Only this one' });
    expect(r.engineeringView).toEqual(['Only this one']);
    expect(r.engineeringEffort).toEqual([0]);
    expect(r.engineeringTat).toEqual([0]);
  });
});

describe('turn-around time', () => {
  it('round-trips whole and fractional weeks', () => {
    expect(parseTat(serialiseTat([4, 0.5, 12]), 3)).toEqual([4, 0.5, 12]);
  });

  it('keeps the negative that marks a continuous activity', () => {
    expect(serialiseTat([-30, 4])).toBe('-30\n4');
    expect(parseTat('-30\n4', 2)).toEqual([-30, 4]);
  });

  it('stores nothing when every line is blank', () => {
    expect(serialiseTat([0, 0])).toBeNull();
    expect(parseTat(null, 2)).toEqual([0, 0]);
  });

  it('pads and truncates to the length of the activity list', () => {
    expect(parseTat('4\n5\n6', 2)).toEqual([4, 5]);
    expect(parseTat('4', 3)).toEqual([4, 0, 0]);
  });

  it('reads a span, and marks the continuous ones', () => {
    expect(formatTat(12)).toBe('12w');
    expect(formatTat(0.5)).toBe('0.5w');
    expect(formatTat(-30)).toBe('30w cont.');
    expect(formatTat(0)).toBe('—');
  });

  it('gives every engineering line of the template a span', () => {
    for (const stage of journeyData) {
      expect(stage.engineeringTat, stage.id).toHaveLength(stage.engineeringView.length);
      expect(stage.engineeringTat.every((v) => v !== 0), stage.id).toBe(true);
    }
  });
});
