import { describe, expect, it } from 'vitest';
import {
  MAIN_MIN,
  PANE_DEFAULT,
  PANE_MAX,
  PANE_MIN,
  fitPanes,
  readPanes,
  snapPane,
  writePanes,
} from '@/lib/paneWidths';

describe('snapPane', () => {
  it('takes the width the drag left, rounded', () => {
    expect(snapPane('side', 260.4)).toBe(260);
    expect(snapPane('peek', 500.6)).toBe(501);
  });

  it('will not let a panel grow past what it is annotating', () => {
    expect(snapPane('side', 900)).toBe(PANE_MAX.side);
    expect(snapPane('peek', 2000)).toBe(PANE_MAX.peek);
  });

  it('holds at the minimum while the drag is still near it', () => {
    expect(snapPane('side', PANE_MIN.side - 1)).toBe(PANE_MIN.side);
    expect(snapPane('peek', PANE_MIN.peek - 20)).toBe(PANE_MIN.peek);
  });

  /* Dragging a panel shut is the gesture people reach for. A panel pinned at
     its smallest useful width instead looks like the drag failed. */
  it('collapses once the drag is past half the minimum', () => {
    expect(snapPane('side', PANE_MIN.side / 2 - 1)).toBe(0);
    expect(snapPane('peek', 4)).toBe(0);
    expect(snapPane('side', 0)).toBe(0);
  });

  it('falls back to the default rather than passing NaN on', () => {
    expect(snapPane('side', Number.NaN)).toBe(PANE_DEFAULT.side);
  });
});

describe('fitPanes', () => {
  it('leaves both panes alone when the window has room', () => {
    expect(fitPanes({ side: 232, peek: 442 }, 1600)).toEqual({ side: 232, peek: 442 });
  });

  /* A width stored on a wide monitor arrives on a laptop still asking for it. */
  it('gives room back from the rail first, since the nav is what you steer with', () => {
    const w = fitPanes({ side: 232, peek: 700 }, 1200);
    expect(w.side).toBe(232);
    expect(w.peek).toBe(1200 - MAIN_MIN - 232);
    expect(w.side + w.peek + MAIN_MIN).toBe(1200);
  });

  it('takes from the nav only once the rail is shut', () => {
    const w = fitPanes({ side: 400, peek: 300 }, 800);
    expect(w.peek).toBe(0);
    expect(w.side).toBe(800 - MAIN_MIN);
  });

  it('never asks for a negative width, however narrow the window', () => {
    const w = fitPanes({ side: 232, peek: 442 }, 320);
    expect(w.side).toBeGreaterThanOrEqual(0);
    expect(w.peek).toBe(0);
  });

  it('clamps a stored width that is past the maximum before fitting', () => {
    expect(fitPanes({ side: 9000, peek: 0 }, 3000).side).toBe(PANE_MAX.side);
  });
});

describe('readPanes', () => {
  it('is the defaults when nothing was stored', () => {
    expect(readPanes(null)).toEqual(PANE_DEFAULT);
    expect(readPanes('')).toEqual(PANE_DEFAULT);
  });

  it('is the defaults when what was stored is not a pane', () => {
    expect(readPanes('{')).toEqual(PANE_DEFAULT);
    expect(readPanes('"232"')).toEqual(PANE_DEFAULT);
    expect(readPanes('{"side":"wide"}')).toEqual(PANE_DEFAULT);
    expect(readPanes('{"side":-5}')).toEqual(PANE_DEFAULT);
  });

  it('keeps a collapsed pane collapsed', () => {
    expect(readPanes('{"side":0,"peek":300}')).toEqual({ side: 0, peek: 300 });
  });

  it('round-trips', () => {
    const w = { side: 199, peek: 501 };
    expect(readPanes(writePanes(w))).toEqual(w);
  });
});
