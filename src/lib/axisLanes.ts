/**
 * /lib/axisLanes.ts — keeping marks on a date axis from covering each other.
 *
 * A profile with two dozen stages puts eighteen milestones on one line, and
 * some of them are a week apart. Rather than let the labels overprint, each
 * mark is given a lane: lane 0 sits on the line, lane 1 above it, and so on.
 * Marks are packed greedily left to right, which puts everything on lane 0
 * whenever there is room and only stacks where there is not.
 *
 * Pure: no DOM.
 */

export interface LaneMark {
  /** Left and right edge in pixels, measured along the axis. */
  left: number;
  right: number;
}

/**
 * Lane per mark, in the order given. `gap` is the clearance two marks in one
 * lane must keep from each other.
 */
export function packLanes(marks: readonly LaneMark[], gap = 8): number[] {
  const lanes: number[] = new Array(marks.length).fill(0);
  /* The right edge reached so far in each lane. */
  const filled: number[] = [];

  const order = marks
    .map((m, i) => ({ i, ...m }))
    .sort((a, b) => a.left - b.left || a.i - b.i);

  for (const mark of order) {
    let lane = filled.findIndex((edge) => edge + gap <= mark.left);
    if (lane === -1) lane = filled.length;
    filled[lane] = mark.right;
    lanes[mark.i] = lane;
  }
  return lanes;
}

/**
 * Rough width of a monospace label, in pixels. Measuring every label in the DOM
 * would be exact but would also mean a layout pass per render; the axis only
 * needs to know which labels would touch, and this is within a character of it.
 */
export const labelWidth = (text: string, fontPx: number, padding = 10): number =>
  text.length * fontPx * 0.62 + padding;
