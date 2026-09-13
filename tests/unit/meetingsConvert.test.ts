import { describe, expect, it } from 'vitest';
import { appendStepPreview } from '@/lib/meetings/convert';
import type { ActivitySteps } from '@/lib/steps';

/**
 * Converting an action into a step changes the plan, so the dialog says how
 * before anybody confirms: the new step's dates, and how far the activity's
 * planned end moves.
 */
const activity: ActivitySteps = {
  ref: 'DFT-02',
  stageId: 'dft',
  window: [2, 10],
  steps: [
    { n: 1, text: 'Generate stuck-at patterns', tat: 2, lane: 'main' },
    { n: 2, text: 'Check coverage', tat: 1, lane: 'par' },
    { n: 3, text: 'Generate transition patterns', tat: 3, lane: 'main' },
  ],
};
const STAGE_START = new Date(2026, 0, 5);

describe('appendStepPreview', () => {
  it('places the new step after the last main step and says how far the plan moves', () => {
    const p = appendStepPreview(STAGE_START, activity, 1.5);
    expect(p.n).toBe(4);
    expect(p.start).toEqual(new Date(2026, 1, 23));
    expect(p.end).toEqual(new Date(2026, 2, 6));
    expect(p.previousEnd).toEqual(new Date(2026, 1, 23));
    expect(p.newEnd).toEqual(new Date(2026, 2, 6));
    expect(p.addedDays).toBe(11);
  });

  it('measures from whichever step ended last, parallel or not', () => {
    const longParallel: ActivitySteps = {
      ...activity,
      steps: [
        { n: 1, text: 'Main', tat: 1, lane: 'main' },
        { n: 2, text: 'Alongside, and longer', tat: 4, lane: 'par' },
      ],
    };
    const p = appendStepPreview(STAGE_START, longParallel, 1);
    /* the new main step starts after the one-week main step, and ends before
       the four-week parallel one does — so the plan's end does not move */
    expect(p.previousEnd).toEqual(new Date(2026, 1, 16));
    expect(p.addedDays).toBe(0);
  });
});
