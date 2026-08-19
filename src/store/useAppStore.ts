'use client';

import { create } from 'zustand';
import { journeyData } from '@/data/journey';
import { createProjectSeed } from '@/data/projectSeed';
import { STAGE_ORDER, scheduleProfiles } from '@/data/scheduleProfiles';
import type {
  Contact,
  Deliverable,
  Item,
  ItemKind,
  Leader,
  StageContent,
  StageId,
} from '@/data/types';
import {
  addWeeks,
  applyDateEdit,
  computeSchedule,
  hasOverrides,
  startOfDay,
  type Schedule,
  type StageOverrides,
} from '@/lib/schedule';

/** Which inline sheet a panel is showing, if any. */
export type InlineKind = 'stage' | 'potential' | 'leader';
export interface InlineState {
  kind: InlineKind;
  /** Contact id being edited, "new" for the add row, or null. */
  editContact: string | null;
}

export interface AppState {
  hydrated: boolean;
  today: Date;
  projectName: string;
  kickoff: Date;
  profileId: keyof typeof scheduleProfiles;
  overrides: StageOverrides;
  schedule: Schedule;
  edited: boolean;
  currentStage: number;
  content: Record<StageId, StageContent>;
  deliverables: Record<StageId, Deliverable[]>;
  leaders: Record<StageId, Leader>;
  contacts: Record<StageId, Contact[]>;
  inline: Partial<Record<StageId, InlineState | null>>;

  hydrate: (now?: Date) => void;
  setProjectName: (name: string) => void;
  setKickoff: (d: Date) => void;
  setProfile: (id: keyof typeof scheduleProfiles) => void;
  selectStage: (i: number) => void;
  editStageDate: (stageId: StageId, which: 'start' | 'end', date: Date) => void;
  resetSchedule: () => void;

  openInline: (stageId: StageId, kind: InlineKind, editContact?: string | null) => void;
  closeInline: (stageId: StageId) => void;
  closeAllInline: () => void;

  toggleDeliverable: (stageId: StageId, id: string, done: boolean) => void;
  setDeliverableDue: (stageId: StageId, id: string, due: Date | null) => void;
  addDeliverable: (stageId: StageId, title: string, due: Date | null) => void;
  deleteDeliverable: (stageId: StageId, id: string) => void;

  saveContact: (stageId: StageId, contact: Omit<Contact, 'id'> & { id?: string }) => void;
  deleteContact: (stageId: StageId, id: string) => void;
  saveLeader: (stageId: StageId, l: Omit<Leader, 'short'>) => void;
  adoptPotentialRisk: (stageId: StageId, title: string) => void;
}

/** Runtime ids for anything created after the seed. */
let _uid = 0;
export const uid = () => 'r' + ++_uid;

const emptyMap = <T,>(make: () => T) =>
  Object.fromEntries(STAGE_ORDER.map((id) => [id, make()])) as Record<StageId, T>;

const BOOT_TODAY = new Date(0);
const BOOT_KICKOFF = new Date(0);

export const useAppStore = create<AppState>()((set, get) => ({
  /* Pre-hydration placeholders: the real values need a clock, and a clock read
     during SSR would not survive hydration. AppShell calls hydrate() on mount. */
  hydrated: false,
  today: BOOT_TODAY,
  projectName: 'AtlasEX',
  kickoff: BOOT_KICKOFF,
  profileId: 'typicalSoC',
  overrides: {},
  schedule: computeSchedule(BOOT_KICKOFF, scheduleProfiles.typicalSoC, {}),
  edited: false,
  currentStage: 0,
  content: emptyMap<StageContent>(() => ({ keyinfo: [], activities: [], risks: [] })),
  deliverables: emptyMap<Deliverable[]>(() => []),
  leaders: Object.fromEntries(
    journeyData.map((s) => [s.id, { ...s.leader }]),
  ) as Record<StageId, Leader>,
  contacts: emptyMap<Contact[]>(() => []),
  inline: {},

  hydrate: (now = new Date()) => {
    if (get().hydrated) return;
    const today = startOfDay(now);
    /* default kickoff = 30 weeks before today, so "today" sits mid-program */
    const kickoff = addWeeks(today, -30);
    const schedule = computeSchedule(kickoff, scheduleProfiles.typicalSoC, {});
    const seed = createProjectSeed({ schedule, now });
    set({
      hydrated: true,
      today,
      kickoff,
      schedule,
      projectName: seed.projectName,
      content: seed.content,
      deliverables: seed.deliverables,
      leaders: seed.leaders,
      contacts: seed.contacts,
      /* stage details are open by default on the first stage */
      inline: { [STAGE_ORDER[0]]: { kind: 'stage', editContact: null } },
    });
  },

  setProjectName: (projectName) => set({ projectName }),

  setKickoff: (kickoff) =>
    set((s) => ({
      kickoff,
      schedule: computeSchedule(kickoff, scheduleProfiles[s.profileId], s.overrides),
    })),

  setProfile: (profileId) =>
    set((s) => ({
      profileId,
      overrides: {},
      edited: false,
      schedule: computeSchedule(s.kickoff, scheduleProfiles[profileId], {}),
    })),

  selectStage: (i) =>
    set((s) => {
      if (i === s.currentStage) return s;
      const stageId = STAGE_ORDER[i];
      return {
        currentStage: i,
        /* stage details are visible by default on the newly selected stage */
        inline: s.inline[stageId]
          ? s.inline
          : { ...s.inline, [stageId]: { kind: 'stage', editContact: null } },
      };
    }),

  editStageDate: (stageId, which, date) =>
    set((s) => {
      const profile = scheduleProfiles[s.profileId];
      const overrides = applyDateEdit(profile, s.overrides, s.schedule, stageId, which, date);
      return {
        overrides,
        edited: hasOverrides(profile, overrides),
        schedule: computeSchedule(s.kickoff, profile, overrides),
      };
    }),

  resetSchedule: () =>
    set((s) => ({
      overrides: {},
      edited: false,
      schedule: computeSchedule(s.kickoff, scheduleProfiles[s.profileId], {}),
    })),

  openInline: (stageId, kind, editContact = null) =>
    set((s) => ({ inline: { ...s.inline, [stageId]: { kind, editContact } } })),

  closeInline: (stageId) =>
    set((s) => ({ inline: { ...s.inline, [stageId]: null } })),

  closeAllInline: () => set({ inline: {} }),

  toggleDeliverable: (stageId, id, done) =>
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].map((d) =>
          d.id === id
            ? /* completion timestamp is automatic */
              { ...d, done, completedAt: done ? new Date() : null }
            : d,
        ),
      },
    })),

  setDeliverableDue: (stageId, id, due) =>
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].map((d) => (d.id === id ? { ...d, due } : d)),
      },
    })),

  addDeliverable: (stageId, title, due) =>
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: [
          ...s.deliverables[stageId],
          { id: uid(), title, done: false, due, completedAt: null },
        ],
      },
    })),

  deleteDeliverable: (stageId, id) =>
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].filter((d) => d.id !== id),
      },
    })),

  saveContact: (stageId, c) =>
    set((s) => {
      const list = s.contacts[stageId];
      const next = c.id
        ? list.map((x) => (x.id === c.id ? { ...x, ...c, id: x.id } : x))
        : [...list, { ...c, id: uid() }];
      return { contacts: { ...s.contacts, [stageId]: next } };
    }),

  deleteContact: (stageId, id) =>
    set((s) => ({
      contacts: { ...s.contacts, [stageId]: s.contacts[stageId].filter((c) => c.id !== id) },
    })),

  saveLeader: (stageId, l) =>
    set((s) => {
      const parts = l.name.split(/\s+/);
      const short =
        parts.length > 1 ? parts[0][0] + '. ' + parts.slice(1).join(' ') : l.name;
      return { leaders: { ...s.leaders, [stageId]: { ...l, short } } };
    }),

  adoptPotentialRisk: (stageId, title) =>
    set((s) => {
      const risk: Item = {
        id: uid(),
        title,
        body: '',
        owner: s.leaders[stageId].short,
        due: null,
        done: false,
        updated: new Date(),
        updates: [],
      };
      return {
        content: {
          ...s.content,
          [stageId]: {
            ...s.content[stageId],
            risks: [...s.content[stageId].risks, risk],
          },
        },
      };
    }),
}));

/** Newest first — the order every board renders in. */
export const sortedItems = (content: StageContent, kind: ItemKind): Item[] =>
  [...content[kind]].sort((a, b) => b.updated.getTime() - a.updated.getTime());
