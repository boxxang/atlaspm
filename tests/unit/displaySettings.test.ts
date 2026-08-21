import { describe, expect, it } from 'vitest';
import {
  COLUMN_VARS,
  DISP_DEFAULTS,
  DISP_DEFS,
  cloneDefaults,
  fmtIcon,
} from '@/lib/displaySettings';

describe('display settings defs', () => {
  it('carries every adjustable token from the reference :root', () => {
    expect(DISP_DEFS.map((d) => d.varName)).toEqual([
      '--fs-base',
      '--icon-scale',
      '--gbar-h',
      '--ms-dot',
      '--cp-fs',
      '--dash-row-h',
    ]);
  });

  it('scopes icon size to Main and row height to Dashboard only', () => {
    const byKey = Object.fromEntries(DISP_DEFS.map((d) => [d.key, d]));
    expect(byKey.icon.scopes).toEqual(['main']);
    expect(byKey.drow.scopes).toEqual(['dash']);
    expect(byKey.font.scopes).toEqual(['main', 'dash']);
  });

  it('gives every scoped key a default value', () => {
    for (const def of DISP_DEFS) {
      for (const scope of def.scopes) {
        expect(DISP_DEFAULTS[scope][def.key]).toBeTypeOf('number');
      }
    }
  });

  it('centres every slider on its own default', () => {
    for (const def of DISP_DEFS) {
      for (const scope of def.scopes) {
        const range = def.ranges[scope]!;
        expect(range, `${def.key}/${scope}`).toBeDefined();
        expect(DISP_DEFAULTS[scope][def.key]).toBe(range.default);
        // the default sits exactly mid-track, so the slider starts centred
        expect((range.min + range.max) / 2).toBeCloseTo(range.default, 10);
        expect(range.min).toBeLessThan(range.max);
      }
    }
  });

  it('carries the dashboard defaults the program asked for', () => {
    expect(DISP_DEFAULTS.dash).toEqual({ font: 16, bar: 16, cp: 13, drow: 32 });
    expect(DISP_DEFAULTS.main).toEqual({ font: 15, icon: 2, bar: 16, ms: 26, cp: 11 });
  });

  it('offers a setting only in the scopes it applies to', () => {
    const byKey = Object.fromEntries(DISP_DEFS.map((d) => [d.key, d]));
    expect(byKey.icon.ranges.dash).toBeUndefined();
    expect(byKey.drow.ranges.main).toBeUndefined();
    expect(byKey.font.ranges.main).toBeDefined();
    expect(byKey.font.ranges.dash).toBeDefined();
  });

  it('clones defaults without sharing references', () => {
    const a = cloneDefaults();
    a.main.font = 23;
    expect(DISP_DEFAULTS.main.font).toBe(15);
    expect(cloneDefaults().main.font).toBe(15);
  });
});

describe('value formatters', () => {
  it('formats px values', () => {
    const font = DISP_DEFS.find((d) => d.key === 'font')!;
    expect(font.fmt(18)).toBe('18px');
    expect(font.fmt('13')).toBe('13px');
  });

  it('trims trailing zeros on the icon multiplier', () => {
    expect(fmtIcon(2)).toBe('2×');
    expect(fmtIcon('2')).toBe('2×');
    expect(fmtIcon(2.5)).toBe('2.5×');
    expect(fmtIcon(2.25)).toBe('2.25×');
    expect(fmtIcon(0.75)).toBe('0.75×');
  });
});

describe('column vars cleared by Reset display', () => {
  it('covers all three boards plus the deliverables table', () => {
    expect(COLUMN_VARS).toHaveLength(11);
    expect(COLUMN_VARS).toContain('--bck-keyinfo-date');
    expect(COLUMN_VARS).toContain('--bck-risks-due');
    expect(COLUMN_VARS).toContain('--dlv-comp');
  });
});
