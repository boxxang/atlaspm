'use client';

import { create } from 'zustand';
import type { ItemKind, StageId } from '@/data/types';

/**
 * What the pane under the list is showing. 'board' means nothing is selected
 * and the list has the window to itself — the list itself never goes away, so
 * reading an entry and writing one happen in the same window.
 */
export type ModalView = 'board' | 'item' | 'edit';
/** Where the pop-up was opened from — decides what Save/Delete do next. */
export type ModalOrigin = 'board' | 'add' | 'agg' | 'direct';
export type AggType = 'risks' | 'overdue' | 'updates';

/** Cross-stage aggregate boards (opened from the dashboard). */
export const AGG_TITLES: Record<AggType, string> = {
  risks: 'Open Risks — All Stages',
  overdue: 'Overdue Activities — All Stages',
  updates: 'Status Updates — All Stages',
};

export const KIND_LABELS: Record<ItemKind, string> = {
  activities: 'Activity',
  risks: 'Risk',
  keyinfo: 'Key Info',
};

export const PAGE_SIZE = 10;

export interface ModalState {
  open: boolean;
  stageId: StageId | null;
  kind: ItemKind | null;
  view: ModalView;
  itemId: string | null;
  /**
   * The pane's own stage and kind. An aggregate board lists other stages'
   * entries, and opening one must not re-point the list at that stage — so
   * what the pane shows is tracked apart from what the list holds.
   */
  selStageId: StageId | null;
  selKind: ItemKind | null;
  page: number;
  origin: ModalOrigin;
  editingSuId: string | null;
  agg: { type: AggType; title: string } | null;
  /**
   * Bumped every time the pop-up is opened or switched to the editor. The
   * pop-up stays mounted while it is hidden, so without this the editor kept
   * its state and a second "+ Add" opened on the last one's text.
   */
  session: number;

  openBoard: (
    stageId: StageId,
    kind: ItemKind,
    view?: ModalView,
    itemId?: string | null,
    origin?: ModalOrigin,
  ) => void;
  openAgg: (type: AggType) => void;
  close: () => void;
  setView: (view: ModalView, itemId?: string | null) => void;
  setPage: (page: number) => void;
  drillInto: (stageId: StageId, kind: ItemKind, itemId: string) => void;
  setEditingSu: (suId: string | null) => void;
  back: () => void;
}

export const useModalStore = create<ModalState>()((set, get) => ({
  open: false,
  stageId: null,
  kind: null,
  view: 'board',
  itemId: null,
  selStageId: null,
  selKind: null,
  page: 0,
  origin: 'board',
  editingSuId: null,
  agg: null,
  session: 0,

  openBoard: (stageId, kind, view = 'board', itemId = null, origin = 'board') =>
    set((s) => ({
      open: true,
      stageId,
      kind,
      view,
      itemId,
      selStageId: stageId,
      selKind: kind,
      origin,
      editingSuId: null,
      agg: null,
      page: view === 'board' ? 0 : s.page,
      session: s.session + 1,
    })),

  openAgg: (type) =>
    set({
      open: true,
      stageId: null,
      kind: type === 'risks' ? 'risks' : type === 'overdue' ? 'activities' : null,
      view: 'board',
      itemId: null,
      selStageId: null,
      selKind: null,
      page: 0,
      origin: 'agg',
      editingSuId: null,
      agg: { type, title: AGG_TITLES[type] },
      session: get().session + 1,
    }),

  close: () => set({ open: false }),
  setView: (view, itemId) =>
    set((s) => ({
      view,
      itemId: itemId === undefined ? s.itemId : itemId,
      /* selecting from the list means the list's own stage and kind */
      selStageId: itemId === undefined ? s.selStageId : s.stageId,
      selKind: itemId === undefined ? s.selKind : s.kind,
      editingSuId: null,
      session: s.session + 1,
    })),
  setPage: (page) => set({ page }),
  /* aggregate rows carry their own stage and kind, and only the pane follows */
  drillInto: (stageId, kind, itemId) =>
    set((s) => ({
      selStageId: stageId,
      selKind: kind,
      view: 'item',
      itemId,
      editingSuId: null,
      session: s.session + 1,
    })),
  setEditingSu: (editingSuId) => set({ editingSuId }),
  /** Closes the pane; the list is already there. */
  back: () => set({ view: 'board', itemId: null, editingSuId: null }),
}));
