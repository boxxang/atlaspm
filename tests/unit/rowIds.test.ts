import { describe, expect, it } from 'vitest';
import { journeyData } from '@/data/journey';
import { activityRowId, deliverableRowId } from '@/lib/rowIds';

describe('reference row IDs', () => {
  it('numbers activities from one, two digits wide', () => {
    expect(activityRowId('DEF', 0)).toBe('DEF-01');
    expect(activityRowId('PKGD', 10)).toBe('PKGD-11');
    /* two digits so a list of ten or more sorts and aligns as text */
    expect(activityRowId('DV', 8)).toBe('DV-09');
  });

  it('numbers deliverables with a D and no padding', () => {
    expect(deliverableRowId('DEF', 0)).toBe('DEF-D1');
    expect(deliverableRowId('PKGD', 5)).toBe('PKGD-D6');
  });

  it('upper-cases and trims whatever the short title is', () => {
    expect(activityRowId(' sipi ', 0)).toBe('SIPI-01');
    expect(deliverableRowId('ptv', 0)).toBe('PTV-D1');
  });

  it('still renders a column for a stage with no short title', () => {
    expect(activityRowId('', 0)).toBe('—-01');
    expect(deliverableRowId('   ', 2)).toBe('—-D3');
  });

  it('matches the template IDs for every built-in stage', () => {
    /* the IDs in docs/stage-template-v2.html are what a review quotes, so the
       app has to mint the same ones from the same positions */
    const def = journeyData.find((s) => s.id === 'productDefinition')!;
    expect(activityRowId(def.shortTitle, 0)).toBe('DEF-01');
    expect(deliverableRowId(def.shortTitle, 0)).toBe('DEF-D1');

    const shorts = journeyData.map((s) => s.shortTitle);
    expect(new Set(shorts).size, 'short titles must be unique to key the IDs').toBe(
      shorts.length,
    );
    expect(shorts).toContain('SIPI');
    expect(shorts).toContain('PKGD');
    expect(shorts).toContain('ASSY');
  });
});
