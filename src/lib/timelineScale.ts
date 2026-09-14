/**
 * /lib/timelineScale.ts — the strip of months or years across the Timeline.
 *
 * Each cell is as wide as the part of the chart it covers. A programme longer
 * than thirty months is drawn in years, anything shorter in months, with the
 * year written on January so a reader crossing into a new one can tell.
 *
 * Every cell carries a key of its own. The label is not one: a programme of
 * a year and a half shows March twice.
 *
 * Pure: no DOM.
 */

export interface ScaleCell {
  key: string;
  label: string;
  /** Percent of the chart the cell covers. */
  grow: number;
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Past this many months the strip is drawn in years. */
const YEAR_SCALE_MONTHS = 30;

export const isYearScale = (start: Date, end: Date): boolean =>
  (end.getTime() - start.getTime()) / 864e5 / 30.44 > YEAR_SCALE_MONTHS;

export function scaleCells(start: Date, end: Date, at: (d: Date) => number): ScaleCell[] {
  const cells: ScaleCell[] = [];

  if (isYearScale(start, end)) {
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      const a = Math.max(0, at(new Date(y, 0, 1)));
      const b = Math.min(100, at(new Date(y + 1, 0, 1)));
      if (b <= 0 || a >= 100) continue;
      cells.push({ key: String(y), label: String(y), grow: b - a });
    }
    return cells;
  }

  let c = new Date(start.getFullYear(), start.getMonth(), 1);
  while (c <= end) {
    const next = new Date(c.getFullYear(), c.getMonth() + 1, 1);
    const a = Math.max(0, at(c));
    const b = Math.min(100, at(next));
    if (b > 0 && a < 100) {
      cells.push({
        key: `${c.getFullYear()}-${c.getMonth() + 1}`,
        label: MON[c.getMonth()] + (c.getMonth() === 0 ? ` '${String(c.getFullYear()).slice(2)}` : ''),
        grow: b - a,
      });
    }
    c = next;
  }
  return cells;
}
