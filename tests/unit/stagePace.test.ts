import { describe, expect, it } from 'vitest';
import { stagePace } from '@/lib/stagePace';

const d = (iso: string) => new Date(`${iso}T00:00:00`);
const STAGE = { start: d('2025-01-01'), end: d('2025-03-01') };

describe('the two figures', () => {
  it('reports the share of steps done and the share of the window spent', () => {
    const p = stagePace(STAGE, { done: 3, total: 10 }, d('2025-02-01'));
    expect(p.stepsPct).toBe(30);
    expect(Math.round(p.elapsedPct)).toBe(53);
    expect(p.gap).toBe(-23);
    expect(p.openSteps).toBe(7);
  });

  it('clamps the window spent at both ends', () => {
    expect(stagePace(STAGE, { done: 0, total: 4 }, d('2024-06-01')).elapsedPct).toBe(0);
    expect(stagePace(STAGE, { done: 0, total: 4 }, d('2026-06-01')).elapsedPct).toBe(100);
  });

  it('says 0% rather than dividing by nothing when a stage has no steps', () => {
    expect(stagePace(STAGE, { done: 0, total: 0 }, d('2025-02-01')).stepsPct).toBe(0);
  });

  /* Stages drawn as a moment — tapeout, fab out, MP — can have no span. Nothing
     divides by zero, and the verdict is judged on the steps alone. */
  it('survives a stage with no span at all', () => {
    const p = stagePace(
      { start: d('2025-01-01'), end: d('2025-01-01') },
      { done: 1, total: 2 },
      d('2025-01-01'),
    );
    expect(p.elapsedPct).toBe(0);
    expect(p.gap).toBe(50);
    expect(p.kind).toBe('ahead');
  });
});

describe('the verdict', () => {
  const pace = (done: number, total: number, today: string) =>
    stagePace(STAGE, { done, total }, d(today)).kind;

  it('is future before the stage begins', () => {
    expect(pace(0, 10, '2024-12-01')).toBe('future');
  });

  it('is complete once the window has closed with every step done', () => {
    expect(pace(10, 10, '2025-04-01')).toBe('complete');
  });

  it('is an overrun once the window has closed with steps still open', () => {
    expect(pace(9, 10, '2025-04-01')).toBe('overrun');
  });

  it('is behind when the work trails the calendar by more than eight points', () => {
    expect(pace(3, 10, '2025-02-01')).toBe('behind');
  });

  it('is ahead when it leads by more than eight', () => {
    expect(pace(8, 10, '2025-02-01')).toBe('ahead');
  });

  it('is on pace inside that tolerance, in both directions', () => {
    // 50% done against 53% spent, and 60% against 53%
    expect(pace(5, 10, '2025-02-01')).toBe('onpace');
    expect(pace(6, 10, '2025-02-01')).toBe('onpace');
  });
});

describe('the week counter', () => {
  it('counts from the stage start, never below one', () => {
    expect(stagePace(STAGE, { done: 0, total: 1 }, d('2025-01-02')).week).toBe(1);
    expect(stagePace(STAGE, { done: 0, total: 1 }, d('2025-02-05')).week).toBe(5);
  });
});
