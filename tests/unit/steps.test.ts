import { describe, expect, it } from 'vitest';
import type { DetailStep } from '@/data/activityDetailTypes';
import { activitySteps } from '@/data/activitySteps';
import {
  activityState,
  allOverdue,
  doneStepKeys,
  fromStepIndex,
  isStepLate,
  plannedSteps,
  resolveSteps,
  stageDoneAt,
  stepKey,
  type ActivitySteps,
  type StepStates,
} from '@/lib/steps';

const d = (iso: string) => new Date(`${iso}T00:00:00`);
const STAGE_START = d('2025-01-06');

const step = (n: number, tat: number, lane: 'main' | 'par' = 'main'): DetailStep => ({
  n,
  text: `step ${n}`,
  tat,
  lane,
});

const activity = (steps: DetailStep[], window: [number, number] = [0, 8]): ActivitySteps => ({
  ref: 'DEF-01',
  stageId: 'def',
  window,
  steps,
  role: 'Product Manager',
});

describe('stepKey', () => {
  it('addresses a step by activity and number, not by row', () => {
    expect(stepKey('DEF-01', 3)).toBe('DEF-01:3');
  });
});

describe('plannedSteps', () => {
  it('runs main steps end to end from the activity window', () => {
    const out = plannedSteps(STAGE_START, activity([step(1, 2), step(2, 3)], [1, 9]));
    // window starts a week in
    expect(out[0].start).toEqual(d('2025-01-13'));
    expect(out[0].end).toEqual(d('2025-01-27'));
    expect(out[1].start).toEqual(out[0].end);
    expect(out[1].end).toEqual(d('2025-02-17'));
  });

  it('starts a parallel step where the main step before it started', () => {
    const out = plannedSteps(STAGE_START, activity([step(1, 2), step(2, 1, 'par'), step(3, 2)]));
    expect(out[1].par).toBe(true);
    expect(out[1].start).toEqual(out[0].start);
    expect(out[1].end).toEqual(d('2025-01-13'));
    // and the parallel step does not push the next main step out
    expect(out[2].start).toEqual(out[0].end);
  });

  it('lets two parallel steps share the same main step', () => {
    const out = plannedSteps(
      STAGE_START,
      activity([step(1, 2), step(2, 1, 'par'), step(3, 4, 'par')]),
    );
    expect(out[1].start).toEqual(out[0].start);
    expect(out[2].start).toEqual(out[0].start);
  });

  it('has nothing to say about an activity with no steps written up', () => {
    expect(plannedSteps(STAGE_START, activity([]))).toEqual([]);
  });
});

describe('resolveSteps', () => {
  const a = activity([step(1, 2), step(2, 2)]);

  it('falls back to the plan where nothing has been recorded', () => {
    const [s] = resolveSteps(STAGE_START, a, {});
    expect(s.due).toEqual(d('2025-01-20'));
    expect(s.dueSet).toBe(false);
    expect(s.done).toBe(false);
    expect(s.pct).toBe(0);
    expect(s.owner).toBe('');
  });

  it('prefers an override, and says the date was set by hand', () => {
    const states: StepStates = {
      'DEF-01:1': { done: false, doneAt: null, pct: 40, owner: 'Jiwon Ahn', dueOverride: d('2025-03-01') },
    };
    const [s] = resolveSteps(STAGE_START, a, states);
    expect(s.due).toEqual(d('2025-03-01'));
    expect(s.dueSet).toBe(true);
    expect(s.pct).toBe(40);
    expect(s.owner).toBe('Jiwon Ahn');
  });

  it('calls a done step 100% whatever the percentage says', () => {
    const states: StepStates = {
      'DEF-01:1': { done: true, doneAt: d('2025-01-15'), pct: 30, owner: '', dueOverride: null },
    };
    const [s] = resolveSteps(STAGE_START, a, states);
    expect(s.pct).toBe(100);
    expect(s.doneAt).toEqual(d('2025-01-15'));
  });

  it('ignores a completion date on a step that is not done', () => {
    const states: StepStates = {
      'DEF-01:1': { done: false, doneAt: d('2025-01-15'), pct: 0, owner: '', dueOverride: null },
    };
    expect(resolveSteps(STAGE_START, a, states)[0].doneAt).toBeNull();
  });
});

describe('isStepLate', () => {
  const a = activity([step(1, 2)]);
  const [s] = resolveSteps(STAGE_START, a, {});

  it('is late once the date has gone by with nothing handed over', () => {
    expect(isStepLate(s, d('2025-01-21'))).toBe(true);
  });

  it('is not late on the day it is due', () => {
    expect(isStepLate(s, d('2025-01-20'))).toBe(false);
  });

  it('is never late once it is done', () => {
    const [done] = resolveSteps(STAGE_START, a, {
      'DEF-01:1': { done: true, doneAt: d('2025-02-01'), pct: 100, owner: '', dueOverride: null },
    });
    expect(isStepLate(done, d('2025-06-01'))).toBe(false);
  });

  it('follows the override rather than the plan', () => {
    const [moved] = resolveSteps(STAGE_START, a, {
      'DEF-01:1': { done: false, doneAt: null, pct: 0, owner: '', dueOverride: d('2025-04-01') },
    });
    expect(isStepLate(moved, d('2025-01-21'))).toBe(false);
    expect(isStepLate(moved, d('2025-04-02'))).toBe(true);
  });
});

describe('stageDoneAt', () => {
  const a = activity([step(1, 2), step(2, 2)]);
  const both = (at1: string, at2: string) =>
    resolveSteps(STAGE_START, a, {
      'DEF-01:1': { done: true, doneAt: d(at1), pct: 100, owner: '', dueOverride: null },
      'DEF-01:2': { done: true, doneAt: d(at2), pct: 100, owner: '', dueOverride: null },
    });

  it('is the day the last step was handed over', () => {
    expect(stageDoneAt(both('2025-02-01', '2025-01-15'))).toEqual(d('2025-02-01'));
  });

  it('is nothing while one step is still open', () => {
    const partial = resolveSteps(STAGE_START, a, {
      'DEF-01:1': { done: true, doneAt: d('2025-02-01'), pct: 100, owner: '', dueOverride: null },
    });
    expect(stageDoneAt(partial)).toBeNull();
  });

  it('has no date for a stage with no steps', () => {
    expect(stageDoneAt([])).toBeNull();
  });
});

describe('activityState', () => {
  const a = activity([step(1, 2), step(2, 2)], [1, 5]);

  it('is future before its own window opens', () => {
    expect(activityState(resolveSteps(STAGE_START, a, {}), d('2025-01-01')).phase).toBe('future');
  });

  it('is running once the window has opened', () => {
    expect(activityState(resolveSteps(STAGE_START, a, {}), d('2025-01-20')).phase).toBe('run');
  });

  it('is done once every step is, whatever the calendar says', () => {
    const steps = resolveSteps(STAGE_START, a, {
      'DEF-01:1': { done: true, doneAt: d('2025-01-10'), pct: 100, owner: '', dueOverride: null },
      'DEF-01:2': { done: true, doneAt: d('2025-01-11'), pct: 100, owner: '', dueOverride: null },
    });
    expect(activityState(steps, d('2025-01-01'))).toEqual({ done: 2, total: 2, phase: 'done' });
  });

  it('counts an activity with no steps as future, not as finished', () => {
    expect(activityState([], d('2030-01-01'))).toEqual({ done: 0, total: 0, phase: 'future' });
  });
});

describe('allOverdue', () => {
  const build = (states: StepStates) => {
    const early = { ...activity([step(1, 1), step(2, 1)]), ref: 'DEF-01' };
    const later = { ...activity([step(1, 6)], [4, 12]), ref: 'ARCH-01', role: 'Architect' };
    return [early, later].map((act) => ({
      activity: act,
      steps: resolveSteps(STAGE_START, act, states),
    }));
  };

  it('lists a step past its date, soonest due first', () => {
    const rows = allOverdue(build({}), d('2025-06-01'));
    expect(rows.map((r) => r.id)).toEqual(['od:DEF-01:1', 'od:DEF-01:2', 'od:ARCH-01:1']);
    expect(rows[0].due).toEqual(d('2025-01-13'));
  });

  it('drops a step once it is handed over', () => {
    const rows = allOverdue(
      build({
        'DEF-01:1': { done: true, doneAt: d('2025-01-13'), pct: 100, owner: '', dueOverride: null },
      }),
      d('2025-06-01'),
    );
    expect(rows.map((r) => r.id)).toEqual(['od:DEF-01:2', 'od:ARCH-01:1']);
  });

  it('carries the owner where there is one, and the activity role either way', () => {
    const rows = allOverdue(
      build({
        'ARCH-01:1': { done: false, doneAt: null, pct: 0, owner: 'Minji Seo', dueOverride: null },
      }),
      d('2025-06-01'),
    );
    const arch = rows.find((r) => r.act === 'ARCH-01');
    expect(arch?.owner).toBe('Minji Seo');
    expect(arch?.role).toBe('Architect');
    expect(rows.find((r) => r.act === 'DEF-01')?.owner).toBe('');
  });

  it('is empty before anything has come due', () => {
    expect(allOverdue(build({}), d('2025-01-01'))).toEqual([]);
  });
});

describe('doneStepKeys', () => {
  it('names every step that has been handed over', () => {
    const a = activity([step(1, 1), step(2, 1)]);
    const keys = doneStepKeys(
      resolveSteps(STAGE_START, a, {
        'DEF-01:2': { done: true, doneAt: d('2025-01-20'), pct: 100, owner: '', dueOverride: null },
      }),
    );
    expect([...keys]).toEqual(['DEF-01:2']);
  });
});

describe('fromStepIndex', () => {
  it('reads the generated tuples back into named fields', () => {
    const a = fromStepIndex('PD-10', {
      st: 'physicalDesign',
      w: [0, 6],
      s: [
        [1, 'Set up SI and run the crosstalk analysis', 2],
        [2, 'Fix crosstalk', 2.5, 1],
      ],
      ro: 'SI/PI engineer',
    });
    expect(a.ref).toBe('PD-10');
    expect(a.stageId).toBe('physicalDesign');
    expect(a.role).toBe('SI/PI engineer');
    expect(a.steps[0]).toEqual({ n: 1, text: 'Set up SI and run the crosstalk analysis', tat: 2, lane: 'main' });
    expect(a.steps[1].lane).toBe('par');
  });

  it('reads the real index, and every activity in it dates its steps', () => {
    const refs = Object.keys(activitySteps);
    expect(refs.length).toBe(257);
    const total = refs.reduce(
      (n, ref) => n + plannedSteps(STAGE_START, fromStepIndex(ref, activitySteps[ref])).length,
      0,
    );
    expect(total).toBe(1649);
  });

  it('never lets a step end before it starts', () => {
    for (const ref of Object.keys(activitySteps)) {
      for (const s of plannedSteps(STAGE_START, fromStepIndex(ref, activitySteps[ref]))) {
        expect(s.end.getTime()).toBeGreaterThanOrEqual(s.start.getTime());
      }
    }
  });

  /* Two steps of the authoring document carry no duration, which the generator
     warns about. They land as zero-width rather than as nothing, so they still
     have a date to be late against. */
  it('gives a step with no stated duration a date anyway', () => {
    const zero = Object.keys(activitySteps).flatMap((ref) =>
      plannedSteps(STAGE_START, fromStepIndex(ref, activitySteps[ref]))
        .filter((s) => s.tat === 0)
        .map((s) => `${ref}:${s.n}`),
    );
    expect(zero).toEqual(['TECH-07:6', 'TECH-08:6']);
  });
});
