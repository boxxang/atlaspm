/**
 * /lib/paneWidths.ts — how wide the two side panels are allowed to be.
 *
 * The left nav and the right properties rail are dragged by their inner edge.
 * What that drag is allowed to produce lives here, away from the DOM, because
 * the awkward part is not the pointer maths but the rules: a panel narrower
 * than its own contents is a panel nobody can read, and two panels that
 * between them leave no main column are worse than either.
 *
 * Pure: no DOM, no storage.
 */

export type PaneKey = 'side' | 'peek';

/** The widths the stylesheet ships with, and what a reset goes back to. */
export const PANE_DEFAULT: Record<PaneKey, number> = { side: 232, peek: 442 };

/** Below this a panel cannot say what it is for, so the drag collapses it. */
export const PANE_MIN: Record<PaneKey, number> = { side: 140, peek: 220 };

/** Past this a panel is taking room from the thing it annotates. */
export const PANE_MAX: Record<PaneKey, number> = { side: 420, peek: 720 };

/** Zero is collapsed — the panel is not drawn and its grip stays at the edge. */
export const PANE_COLLAPSED = 0;

/** What the main column must keep, whatever the two panels would like. */
export const MAIN_MIN = 480;

export interface PaneWidths {
  side: number;
  peek: number;
}

export const PANE_DEFAULTS: PaneWidths = { side: PANE_DEFAULT.side, peek: PANE_DEFAULT.peek };

/**
 * One pane's width as the drag leaves it.
 *
 * Under the minimum it collapses rather than being pinned there: dragging a
 * panel shut is the gesture people reach for, and a panel stuck at its
 * smallest useful width looks like the drag failed.
 */
export function snapPane(key: PaneKey, px: number): number {
  if (!Number.isFinite(px)) return PANE_DEFAULT[key];
  if (px < PANE_MIN[key] / 2) return PANE_COLLAPSED;
  if (px < PANE_MIN[key]) return PANE_MIN[key];
  return Math.min(Math.round(px), PANE_MAX[key]);
}

/**
 * Both panes against the window they have to fit in.
 *
 * A width stored on a wide monitor arrives on a laptop still asking for it,
 * so the panes give room back — the rail first, since the nav is the one you
 * steer with — rather than squeezing the main column to nothing.
 */
export function fitPanes(w: PaneWidths, viewport: number): PaneWidths {
  const side = Math.max(0, Math.min(w.side, PANE_MAX.side));
  let peek = Math.max(0, Math.min(w.peek, PANE_MAX.peek));
  let over = side + peek + MAIN_MIN - viewport;
  if (over <= 0) return { side, peek };

  const peekGiven = Math.min(peek, over);
  peek -= peekGiven;
  over -= peekGiven;
  if (over <= 0) return { side, peek };

  return { side: Math.max(0, side - over), peek };
}

/** What was stored, or the defaults — never a shape the rest of the app has to check. */
export function readPanes(raw: string | null): PaneWidths {
  if (!raw) return { ...PANE_DEFAULTS };
  try {
    const parsed = JSON.parse(raw) as Partial<PaneWidths>;
    const num = (v: unknown, fallback: number) =>
      typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v) : fallback;
    return {
      side: num(parsed?.side, PANE_DEFAULT.side),
      peek: num(parsed?.peek, PANE_DEFAULT.peek),
    };
  } catch {
    return { ...PANE_DEFAULTS };
  }
}

export const writePanes = (w: PaneWidths): string => JSON.stringify(w);
