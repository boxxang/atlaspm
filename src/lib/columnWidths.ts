/**
 * /lib/columnWidths.ts — the widths of a table whose columns can be dragged.
 *
 * Each column has a default and a minimum; a dragged width is clamped to the
 * minimum and kept per browser, because how wide a column should be is a
 * matter of the screen it is read on, not of the programme. What is stored is
 * read back leniently: an unknown column is dropped and a missing one falls
 * back to its default, so a table that gains a column keeps the widths
 * somebody chose for the others.
 *
 * Pure: the component paints and stores.
 */
export interface ColumnSpec {
  key: string;
  label: string;
  /** px */
  width: number;
  /** px */
  min: number;
  /** takes whatever width is left, never less than its own */
  grow?: boolean;
  align?: 'left' | 'center';
}

export type Widths = Record<string, number>;

export const defaultWidths = (cols: readonly ColumnSpec[]): Widths =>
  Object.fromEntries(cols.map((c) => [c.key, c.width]));

export const clampWidth = (col: ColumnSpec, px: number): number =>
  Math.max(col.min, Math.round(Number.isFinite(px) ? px : col.width));

export function readWidths(cols: readonly ColumnSpec[], stored: string | null | undefined): Widths {
  const out = defaultWidths(cols);
  if (!stored) return out;
  try {
    const x = JSON.parse(stored) as Record<string, unknown>;
    for (const c of cols) if (typeof x[c.key] === 'number') out[c.key] = clampWidth(c, x[c.key] as number);
  } catch {
    /* a stored value this version cannot read is no value at all */
  }
  return out;
}

/** The grid template: fixed columns at their width, a growing one at least at its width. */
export const gridTemplate = (cols: readonly ColumnSpec[], widths: Widths): string =>
  cols.map((c) => (c.grow ? `minmax(${widths[c.key]}px, 1fr)` : `${widths[c.key]}px`)).join(' ');

/** The narrowest the table can be — what a narrow window scrolls to see. */
export const tableMinWidth = (cols: readonly ColumnSpec[], widths: Widths, gap: number): number =>
  cols.reduce((t, c) => t + widths[c.key], 0) + gap * (cols.length - 1);

/**
 * A boundary dragged by dx px: the column on its left gains what the one on
 * its right gives, so the boundary stays under the pointer and nothing else
 * moves. It works from the widths the columns are shown at, because the
 * growing column is shown wider than its stored minimum; a column the drag
 * touches is kept at the width it then shows. Neither goes below its
 * minimum. `index` is the column on the boundary's left.
 */
export function dragBoundary(
  cols: readonly ColumnSpec[],
  stored: Widths,
  shown: Widths,
  index: number,
  dx: number,
): Widths {
  const l = cols[index];
  const r = cols[index + 1];
  if (!l || !r || !Number.isFinite(dx)) return stored;
  const lw = shown[l.key] ?? stored[l.key];
  const rw = shown[r.key] ?? stored[r.key];
  const d = Math.round(Math.min(Math.max(dx, l.min - lw), rw - r.min));
  return { ...stored, [l.key]: Math.round(lw + d), [r.key]: Math.round(rw - d) };
}
