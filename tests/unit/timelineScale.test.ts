import { describe, expect, it } from 'vitest';
import { scaleCells } from '@/lib/timelineScale';

/**
 * The strip of months or years across the top of the Timeline. Each cell is a
 * rendered element, so its key has to be unique — and a month's name is not,
 * once a chart runs past a year without running long enough to be drawn in
 * years instead.
 */
const span = (start: Date, end: Date) => {
  const t0 = start.getTime();
  const w = end.getTime() - t0;
  return (d: Date) => ((d.getTime() - t0) / w) * 100;
};

describe('scaleCells', () => {
  it('draws a 21-month programme in months, each with a key of its own', () => {
    const start = new Date(2026, 1, 9);
    const end = new Date(2027, 10, 1);
    const cells = scaleCells(start, end, span(start, end));
    expect(cells[0].label).toBe('Feb');
    expect(cells.filter((c) => c.label === 'Mar')).toHaveLength(2);
    expect(cells.find((c) => c.label === "Jan '27")).toBeTruthy();
    const keys = cells.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('draws a programme longer than thirty months in years', () => {
    const start = new Date(2025, 5, 7);
    const end = new Date(2028, 0, 16);
    const cells = scaleCells(start, end, span(start, end));
    expect(cells.map((c) => c.label)).toEqual(['2025', '2026', '2027', '2028']);
    expect(new Set(cells.map((c) => c.key)).size).toBe(cells.length);
  });

  it('sizes each cell by how much of the chart it covers', () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 3, 1);
    const cells = scaleCells(start, end, span(start, end));
    /* April starts on the right edge, so it covers none of the chart */
    expect(cells.map((c) => c.label)).toEqual(["Jan '26", 'Feb', 'Mar']);
    const total = cells.reduce((n, c) => n + c.grow, 0);
    expect(total).toBeCloseTo(100, 5);
  });
});
