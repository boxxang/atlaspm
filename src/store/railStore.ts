'use client';

import { create } from 'zustand';

/**
 * What the right rail is showing.
 *
 * In the prototype the rail is not a panel a screen owns — it follows whatever
 * was last picked, and every screen picks into the same slot: a stage shows its
 * properties, an activity its write-up and deliverables, a step its progress.
 * So the selection lives here rather than inside any one view, and the views
 * put things into it.
 *
 * It clears on navigation. A step selected on one stage has nothing to say on
 * the next screen, and a rail left showing it would be lying about what is
 * selected.
 */
export type RailSelection =
  | { kind: 'none' }
  | { kind: 'stage'; stageId: string }
  | { kind: 'activity'; act: string }
  | { kind: 'step'; act: string; n: number }
  | { kind: 'deliverable'; stageId: string; deliverableId: string };

interface RailState {
  selection: RailSelection;
  select: (s: RailSelection) => void;
  clear: () => void;
}

const NOTHING: RailSelection = { kind: 'none' };

export const useRailStore = create<RailState>((set) => ({
  selection: NOTHING,
  /* Picking the same thing again clears it, the way the prototype's rows and
     the concurrency chart both behave: the second click is "never mind". */
  select: (s) =>
    set((prev) => ({ selection: sameSelection(prev.selection, s) ? NOTHING : s })),
  clear: () => set({ selection: NOTHING }),
}));

export function sameSelection(a: RailSelection, b: RailSelection): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'none':
      return true;
    case 'stage':
      return a.stageId === (b as { stageId: string }).stageId;
    case 'activity':
      return a.act === (b as { act: string }).act;
    case 'step': {
      const o = b as { act: string; n: number };
      return a.act === o.act && a.n === o.n;
    }
    case 'deliverable': {
      const o = b as { deliverableId: string };
      return a.deliverableId === o.deliverableId;
    }
  }
}
