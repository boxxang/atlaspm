'use client';

import { create } from 'zustand';
import type { ItemKind, StageId } from '@/data/types';

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
  page: number;
  origin: ModalOrigin;
  editingSuId: string | null;
  agg: { type: AggType; title: string } | null;

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

export const useModalStore = create<ModalState>()((set) => ({
  open: false,
  stageId: null,
  kind: null,
  view: 'board',
  itemId: null,
  page: 0,
  origin: 'board',
  editingSuId: null,
  agg: null,

  openBoard: (stageId, kind, view = 'board', itemId = null, origin = 'board') =>
    set((s) => ({
      open: true,
      stageId,
      kind,
      view,
      itemId,
      origin,
      editingSuId: null,
      agg: null,
      page: view === 'board' ? 0 : s.page,
    })),

  openAgg: (type) =>
    set({
      open: true,
      stageId: null,
      kind: type === 'risks' ? 'risks' : type === 'overdue' ? 'activities' : null,
      view: 'board',
      itemId: null,
      page: 0,
      origin: 'agg',
      editingSuId: null,
      agg: { type, title: AGG_TITLES[type] },
    }),

  close: () => set({ open: false }),
  setView: (view, itemId) =>
    set((s) => ({ view, itemId: itemId === undefined ? s.itemId : itemId, editingSuId: null })),
  setPage: (page) => set({ page }),
  /* aggregate rows carry their own stage and kind */
  drillInto: (stageId, kind, itemId) =>
    set({ stageId, kind, view: 'item', itemId, editingSuId: null }),
  setEditingSu: (editingSuId) => set({ editingSuId }),
  back: () => set({ view: 'board', editingSuId: null }),
}));
