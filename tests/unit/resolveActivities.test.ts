import { describe, expect, it } from 'vitest';
import { resolveActivities, resolvedTitles, type ActivityRow } from '@/lib/resolveActivities';
import type { ActivityStepEntry } from '@/data/activitySteps';

const LIB: Record<string, ActivityStepEntry> = {
  'DEF-01': {
    st: 'productDefinition',
    w: [0, 4],
    s: [
      [1, 'Interview the customers', 1.5],
      [2, 'Write it down', 0.5, 1],
    ],
    o: ['A requirements list'],
    ob: [2],
    r: [['DEF-D1', 'produces']],
    ro: 'Product manager',
  },
};

const row = (over: Partial<ActivityRow> & { ref: string }): ActivityRow => ({
  stageKey: 'productDefinition',
  order: 0,
  title: 'Requirements',
  windowFrom: 0,
  windowTo: 4,
  baseRef: null,
  steps: [],
  ...over,
});

describe('an inherited activity', () => {
  /* Its steps, outputs and deliverable relations come from the generated
     modules, which is what lets a template be edited without first moving a
     megabyte of authored prose into the database. */
  it('takes its steps and outputs from the library', () => {
    const out = resolveActivities([row({ ref: 'DEF-01', baseRef: 'DEF-01' })], LIB);
    expect(out['DEF-01'].s).toEqual(LIB['DEF-01'].s);
    expect(out['DEF-01'].o).toEqual(LIB['DEF-01'].o);
    expect(out['DEF-01'].r).toEqual(LIB['DEF-01'].r);
    expect(out['DEF-01'].ro).toBe('Product manager');
  });

  /* But the stage and the window are the template's, because moving an
     activity to another stage or re-timing it is exactly what editing is. */
  it('takes its stage and window from the row, not the library', () => {
    const out = resolveActivities(
      [
        row({
          ref: 'DEF-01',
          baseRef: 'DEF-01',
          stageKey: 'architecture',
          windowFrom: 2,
          windowTo: 9,
        }),
      ],
      LIB,
    );
    expect(out['DEF-01'].st).toBe('architecture');
    expect(out['DEF-01'].w).toEqual([2, 9]);
  });

  /* A baseRef pointing at nothing is a template that outlived its library. It
     resolves to an activity with no steps rather than throwing, because one
     stale row must not take a whole programme down. */
  it('survives a baseRef the library does not have', () => {
    const out = resolveActivities([row({ ref: 'X-01', baseRef: 'GONE-99' })], LIB);
    expect(out['X-01'].s).toEqual([]);
    expect(out['X-01'].o).toEqual([]);
  });
});

describe('an owned activity', () => {
  it('takes its steps from its own rows, in step order', () => {
    const out = resolveActivities(
      [
        row({
          ref: 'NEW-01',
          steps: [
            { n: 2, text: 'Second', tat: 1, lane: 'main' },
            { n: 1, text: 'First', tat: 2, lane: 'main' },
          ],
        }),
      ],
      LIB,
    );
    expect(out['NEW-01'].s).toEqual([
      [1, 'First', 2],
      [2, 'Second', 1],
    ]);
  });

  /* The fourth element of a step tuple is the parallel flag, and it is present
     only when true — that is the shape the browser already reads. */
  it('marks a parallel step and leaves the others three long', () => {
    const out = resolveActivities(
      [
        row({
          ref: 'NEW-01',
          steps: [
            { n: 1, text: 'Main', tat: 1, lane: 'main' },
            { n: 2, text: 'Alongside', tat: 1, lane: 'par' },
          ],
        }),
      ],
      LIB,
    );
    expect(out['NEW-01'].s[0]).toHaveLength(3);
    expect(out['NEW-01'].s[1]).toEqual([2, 'Alongside', 1, 1]);
  });

  /* It has no write-up, so it produces nothing and relates to no deliverable.
     An added activity is a plan, not a document. */
  it('has no outputs, relations or inherited role', () => {
    const out = resolveActivities([row({ ref: 'NEW-01' })], LIB);
    expect(out['NEW-01'].o).toEqual([]);
    expect(out['NEW-01'].ob).toEqual([]);
    expect(out['NEW-01'].r).toEqual([]);
    expect(out['NEW-01'].ro).toBe('');
  });
});

describe('the map as a whole', () => {
  it('is keyed by ref and ordered by the row order', () => {
    const out = resolveActivities([row({ ref: 'B', order: 1 }), row({ ref: 'A', order: 0 })], LIB);
    expect(Object.keys(out)).toEqual(['A', 'B']);
  });

  it('is empty for a profile with no activities', () => {
    expect(resolveActivities([], LIB)).toEqual({});
  });
});

describe('titles', () => {
  it('prefers the row’s title over the library’s', () => {
    const out = resolvedTitles([row({ ref: 'DEF-01', baseRef: 'DEF-01', title: 'Renamed here' })], {
      'DEF-01': 'Customer and Market Requirements Definition',
    });
    expect(out['DEF-01']).toBe('Renamed here');
  });
});
