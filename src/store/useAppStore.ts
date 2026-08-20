'use client';

import { create } from 'zustand';
import * as api from '@/app/actions';
import { journeyData } from '@/data/journey';
import { STAGE_ORDER, scheduleProfiles, type ProfileId } from '@/data/scheduleProfiles';
import type { ProjectState } from '@/lib/projectState';
import { rejectFile, rejectionMessage } from '@/lib/attachments';
import { serialiseEffort } from '@/lib/effort';
import { isEmptyOverride, type StageDetailOverride } from '@/lib/stageDetail';
import type {
  AttachmentRef,
  Contact,
  Deliverable,
  Item,
  ItemKind,
  Leader,
  StageContent,
  StageId,
  StatusUpdate,
} from '@/data/types';
import {
  applyDateEdit,
  computeSchedule,
  hasOverrides,
  materializeOverrides,
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
  projectId: string;
  today: Date;
  projectName: string;
  kickoff: Date;
  profileId: ProfileId;
  costPerManMonth: number;
  currency: string;
  overrides: StageOverrides;
  /** What the UI draws — the proposal while a draft is open. */
  schedule: Schedule;
  /** What is actually saved, so a preview can show both at once. */
  committedSchedule: Schedule;
  /** Non-null while schedule edits are staged for review. */
  draftOverrides: StageOverrides | null;
  edited: boolean;
  /** null until a bar is picked on the concurrency chart. */
  currentStage: number | null;
  content: Record<StageId, StageContent>;
  deliverables: Record<StageId, Deliverable[]>;
  leaders: Record<StageId, Leader>;
  contacts: Record<StageId, Contact[]>;
  stageDetails: Partial<Record<StageId, StageDetailOverride>>;
  inline: Partial<Record<StageId, InlineState | null>>;

  hydrate: (initial: ProjectState, now?: Date) => void;
  setProjectName: (name: string) => void;
  setKickoff: (d: Date) => void;
  setProfile: (id: ProfileId) => void;
  /** Picking the selected stage again clears it. */
  selectStage: (i: number | null) => void;
  editStageDate: (stageId: StageId, which: 'start' | 'end', date: Date) => void;
  /** Commit the staged dates. */
  applyScheduleDraft: () => void;
  /** Throw the staged dates away. */
  discardScheduleDraft: () => void;
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
  saveStageDetail: (stageId: StageId, detail: StageDetailOverride) => void;
  /** One man-month figure per engineering line of the stage. */
  setStageEffort: (stageId: StageId, effort: number[]) => void;
  /** Rewrites the stage's engineering list — titles and their man-months. */
  setEngineeringLines: (
    stageId: StageId,
    lines: { label: string; manMonths: number }[],
  ) => void;
  setCostRate: (rate: number, currency: string) => void;
  attachFiles: (
    stageId: StageId,
    kind: ItemKind,
    itemId: string,
    target: { statusUpdateId?: string },
    files: File[],
  ) => Promise<string[]>;
  removeAttachment: (
    stageId: StageId,
    kind: ItemKind,
    itemId: string,
    attachmentId: string,
    statusUpdateId?: string,
  ) => void;
  adoptPotentialRisk: (stageId: StageId, title: string) => void;

  /** Returns the saved item so the modal can drill into a freshly added one. */
  saveItem: (stageId: StageId, kind: ItemKind, itemId: string | null, f: ItemFields) => Item;
  deleteItem: (stageId: StageId, kind: ItemKind, itemId: string) => void;
  /** Returns the new update's id, so attachments can reference it. */
  postUpdate: (stageId: StageId, kind: ItemKind, itemId: string, text: string) => string;
  saveUpdate: (
    stageId: StageId,
    kind: ItemKind,
    itemId: string,
    suId: string,
    text: string,
  ) => void;
  deleteUpdate: (stageId: StageId, kind: ItemKind, itemId: string, suId: string) => void;
}

/** The four fields the item editor writes. */
export interface ItemFields {
  title: string;
  owner: string;
  body: string;
  due: Date | null;
}

/**
 * Ids are minted on the client and sent to the server, so the optimistic row
 * and the stored row share an identity — editing a just-created item still
 * finds it server-side.
 */
export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'r' + Math.random().toString(36).slice(2);

/**
 * Mutations are optimistic: the store updates first, then the server action
 * runs. A rejected write leaves the two out of step until the next load — there
 * is no rollback in this pass, so failures are surfaced loudly instead.
 */
const inFlight = new Set<Promise<unknown>>();

const sync = (p: Promise<unknown>) => {
  inFlight.add(p);
  void p
    .catch((e) => console.error('[atlaspm] server action failed', e))
    .finally(() => inFlight.delete(p));
};

/**
 * Waits for the writes already sent. Callers need this when the next write
 * depends on an earlier one having landed — attaching a file to an item that
 * was created a moment ago, say. SQLite does not enforce foreign keys by
 * default, so without it the attachment can be written before its item and
 * nothing complains.
 */
export const flushWrites = () => Promise.allSettled([...inFlight]).then(() => undefined);

const emptyMap = <T,>(make: () => T) =>
  Object.fromEntries(STAGE_ORDER.map((id) => [id, make()])) as Record<StageId, T>;

const BOOT_TODAY = new Date(0);
const BOOT_KICKOFF = new Date(0);

export const useAppStore = create<AppState>()((set, get) => ({
  /* Pre-hydration placeholders: the real values need a clock, and a clock read
     during SSR would not survive hydration. AppShell calls hydrate() on mount. */
  hydrated: false,
  projectId: '',
  today: BOOT_TODAY,
  projectName: 'AtlasEX',
  kickoff: BOOT_KICKOFF,
  profileId: 'typicalSoC',
  costPerManMonth: 0,
  currency: 'USD',
  overrides: {},
  schedule: computeSchedule(BOOT_KICKOFF, scheduleProfiles.typicalSoC, {}),
  committedSchedule: computeSchedule(BOOT_KICKOFF, scheduleProfiles.typicalSoC, {}),
  draftOverrides: null,
  edited: false,
  currentStage: null,
  content: emptyMap<StageContent>(() => ({ keyinfo: [], activities: [], risks: [] })),
  deliverables: emptyMap<Deliverable[]>(() => []),
  leaders: Object.fromEntries(
    journeyData.map((s) => [s.id, { ...s.leader }]),
  ) as Record<StageId, Leader>,
  contacts: emptyMap<Contact[]>(() => []),
  stageDetails: {},
  inline: {},

  /* Server-rendered DB state in, client clock applied here: "today" belongs to
     the viewer's timezone, so it cannot come from the server render.
     
     The store is a module singleton and client-side navigation does not tear it
     down, so re-hydrate whenever the route points at a different program —
     otherwise opening one program and then switching would keep showing the
     first one's name, schedule and boards until a full page load. */
  hydrate: (initial, now = new Date()) => {
    const prev = get();
    if (prev.hydrated && prev.projectId === initial.projectId) return;
    const profile = scheduleProfiles[initial.profileId] ?? scheduleProfiles.typicalSoC;
    const today = startOfDay(now);
    const schedule = computeSchedule(initial.kickoff, profile, initial.overrides);
    /* Open on the stage running today. Stages overlap, so several can be — take
       the last, which is the lowest bar on the chart. */
    const inFlight = STAGE_ORDER.map((id, i) =>
      schedule.stages[id].start <= today && today <= schedule.stages[id].end ? i : -1,
    ).filter((i) => i >= 0);
    const openStage = inFlight.length ? inFlight[inFlight.length - 1] : null;
    set({
      hydrated: true,
      projectId: initial.projectId,
      today,
      projectName: initial.projectName,
      kickoff: initial.kickoff,
      profileId: initial.profileId,
      costPerManMonth: initial.costPerManMonth,
      currency: initial.currency,
      overrides: initial.overrides,
      edited: hasOverrides(profile, initial.overrides),
      schedule,
      committedSchedule: schedule,
      draftOverrides: null,
      content: initial.content,
      deliverables: initial.deliverables,
      leaders: initial.leaders,
      contacts: initial.contacts,
      stageDetails: initial.stageDetails,
      /* view state belongs to the program you were looking at, not the next one */
      currentStage: openStage,
      inline:
        openStage === null
          ? {}
          : { [STAGE_ORDER[openStage]]: { kind: 'stage', editContact: null } },
    });
  },

  setProjectName: (projectName) => {
    set({ projectName });
    sync(api.renameProject(get().projectId, projectName));
  },

  setKickoff: (kickoff) => {
    set((s) => {
      const schedule = computeSchedule(kickoff, scheduleProfiles[s.profileId], s.overrides);
      /* moving kickoff re-bases everything, so any staged stage edit is stale */
      return { kickoff, schedule, committedSchedule: schedule, draftOverrides: null };
    });
    sync(api.setKickoff(get().projectId, kickoff));
  },

  setProfile: (profileId) => {
    set((s) => {
      const schedule = computeSchedule(s.kickoff, scheduleProfiles[profileId], {});
      return {
        profileId,
        overrides: {},
        edited: false,
        schedule,
        committedSchedule: schedule,
        draftOverrides: null,
      };
    });
    sync(api.setProfile(get().projectId, profileId));
  },

  selectStage: (i) =>
    set((s) => {
      /* picking the same bar again closes the panel */
      if (i === null || i === s.currentStage) return { currentStage: null };
      const stageId = STAGE_ORDER[i];
      return {
        currentStage: i,
        /* stage details are visible by default on the newly selected stage */
        inline: s.inline[stageId]
          ? s.inline
          : { ...s.inline, [stageId]: { kind: 'stage', editContact: null } },
      };
    }),

  /**
   * Stages the edit instead of committing it. A stage date ripples through
   * every later stage and every milestone, so the change is held as a draft
   * until someone has compared it against the saved schedule and applied it.
   * Further edits compound on the draft, so several stages can move together.
   */
  editStageDate: (stageId, which, date) => {
    const s = get();
    const profile = scheduleProfiles[s.profileId];
    const base = s.draftOverrides ?? s.overrides;
    const draftOverrides = applyDateEdit(profile, base, s.schedule, stageId, which, date);
    set({ draftOverrides, schedule: computeSchedule(s.kickoff, profile, draftOverrides) });
  },

  applyScheduleDraft: () => {
    const s = get();
    if (!s.draftOverrides) return;
    const profile = scheduleProfiles[s.profileId];
    const overrides = s.draftOverrides;
    const schedule = computeSchedule(s.kickoff, profile, overrides);
    set({
      overrides,
      draftOverrides: null,
      schedule,
      committedSchedule: schedule,
      edited: hasOverrides(profile, overrides),
    });
    /* the stored rows are the effective values, not a replay of the edits */
    sync(api.saveOverrides(s.projectId, materializeOverrides(profile, overrides)));
  },

  discardScheduleDraft: () =>
    set((s) => ({
      draftOverrides: null,
      schedule: computeSchedule(s.kickoff, scheduleProfiles[s.profileId], s.overrides),
    })),

  resetSchedule: () => {
    set((s) => {
      const schedule = computeSchedule(s.kickoff, scheduleProfiles[s.profileId], {});
      return {
        overrides: {},
        draftOverrides: null,
        edited: false,
        schedule,
        committedSchedule: schedule,
      };
    });
    sync(api.resetOverrides(get().projectId));
  },

  openInline: (stageId, kind, editContact = null) =>
    set((s) => ({ inline: { ...s.inline, [stageId]: { kind, editContact } } })),

  closeInline: (stageId) =>
    set((s) => ({ inline: { ...s.inline, [stageId]: null } })),

  closeAllInline: () => set({ inline: {} }),

  toggleDeliverable: (stageId, id, done) => {
    const completedAt = done ? new Date() : null;
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].map((d) =>
          /* completion timestamp is automatic */
          d.id === id ? { ...d, done, completedAt } : d,
        ),
      },
    }));
    sync(api.setDeliverableDone(get().projectId, id, done, completedAt));
  },

  setDeliverableDue: (stageId, id, due) => {
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].map((d) => (d.id === id ? { ...d, due } : d)),
      },
    }));
    sync(api.setDeliverableDue(get().projectId, id, due));
  },

  addDeliverable: (stageId, title, due) => {
    const id = uid();
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: [
          ...s.deliverables[stageId],
          { id, title, done: false, due, completedAt: null },
        ],
      },
    }));
    sync(api.addDeliverable({ projectId: get().projectId, id, stageId, title, due }));
  },

  deleteDeliverable: (stageId, id) => {
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].filter((d) => d.id !== id),
      },
    }));
    sync(api.deleteDeliverable(get().projectId, id));
  },

  saveContact: (stageId, c) => {
    const id = c.id ?? uid();
    set((s) => {
      const list = s.contacts[stageId];
      const next = c.id
        ? list.map((x) => (x.id === c.id ? { ...x, ...c, id } : x))
        : [...list, { ...c, id }];
      return { contacts: { ...s.contacts, [stageId]: next } };
    });
    const { name, role, email, phone } = c;
    sync(api.saveContact({ projectId: get().projectId, id, stageId, name, role, email, phone }));
  },

  deleteContact: (stageId, id) => {
    set((s) => ({
      contacts: { ...s.contacts, [stageId]: s.contacts[stageId].filter((c) => c.id !== id) },
    }));
    sync(api.deleteContact(get().projectId, id));
  },

  saveLeader: (stageId, l) => {
    const parts = l.name.split(/\s+/);
    const short = parts.length > 1 ? parts[0][0] + '. ' + parts.slice(1).join(' ') : l.name;
    set((s) => ({ leaders: { ...s.leaders, [stageId]: { ...l, short } } }));
    sync(api.saveLeader(get().projectId, stageId, { ...l, short }));
  },

  /**
   * Uploads first, then records what came back. Bytes have to reach the server
   * before the chip means anything, so this one is not optimistic — it returns
   * the messages for whatever the server refused.
   */
  attachFiles: async (stageId, kind, itemId, target, files) => {
    const accepted: File[] = [];
    const problems: string[] = [];
    const existing = (() => {
      const item = get().content[stageId][kind].find((x) => x.id === itemId);
      if (!item) return 0;
      return target.statusUpdateId
        ? (item.updates.find((u) => u.id === target.statusUpdateId)?.attachments.length ?? 0)
        : item.attachments.length;
    })();

    for (const file of files) {
      const reason = rejectFile(file, existing + accepted.length);
      if (reason) problems.push(rejectionMessage(reason, file.name));
      else accepted.push(file);
    }
    if (!accepted.length) return problems;

    const form = new FormData();
    form.set('projectId', get().projectId);
    form.set('itemId', itemId);
    if (target.statusUpdateId) form.set('statusUpdateId', target.statusUpdateId);
    for (const file of accepted) {
      form.append('files', file);
      form.append('ids', uid());
    }

    try {
      const saved = await api.uploadAttachments(form);
      set((s) => ({
        content: mapItem(s.content, stageId, kind, itemId, (it) =>
          target.statusUpdateId
            ? {
                ...it,
                updates: it.updates.map((u) =>
                  u.id === target.statusUpdateId
                    ? { ...u, attachments: [...u.attachments, ...saved] }
                    : u,
                ),
              }
            : { ...it, attachments: [...it.attachments, ...saved] },
        ),
      }));
    } catch (e) {
      console.error('[atlaspm] attachment upload failed', e);
      problems.push('Upload failed — the files were not attached.');
    }
    return problems;
  },

  removeAttachment: (stageId, kind, itemId, attachmentId, statusUpdateId) => {
    const drop = (list: AttachmentRef[]) => list.filter((a) => a.id !== attachmentId);
    set((s) => ({
      content: mapItem(s.content, stageId, kind, itemId, (it) =>
        statusUpdateId
          ? {
              ...it,
              updates: it.updates.map((u) =>
                u.id === statusUpdateId ? { ...u, attachments: drop(u.attachments) } : u,
              ),
            }
          : { ...it, attachments: drop(it.attachments) },
      ),
    }));
    sync(api.deleteAttachment(get().projectId, attachmentId));
  },

  setStageEffort: (stageId, effort) => {
    const serialised = serialiseEffort(effort);
    set((s) => ({
      stageDetails: {
        ...s.stageDetails,
        [stageId]: { ...s.stageDetails[stageId], engineeringEffort: serialised },
      },
    }));
    sync(api.setStageEffort(get().projectId, stageId, serialised));
  },

  setEngineeringLines: (stageId, lines) => {
    const stage = journeyData.find((x) => x.id === stageId)!;
    const labels = lines.map((l) => l.label.trim()).filter(Boolean);
    const effort = lines.filter((l) => l.label.trim()).map((l) => l.manMonths);
    /* A list identical to the shared default is not an override, so the stage
       keeps tracking /data/journey.ts. An emptied list stores '' rather than
       null, which is what tells resolveStageDetail the program meant it. */
    const view = labels.join('\n');
    const engineeringView = view === stage.engineeringView.join('\n') ? null : view;
    const engineeringEffort = serialiseEffort(effort);

    set((s) => ({
      stageDetails: {
        ...s.stageDetails,
        [stageId]: { ...s.stageDetails[stageId], engineeringView, engineeringEffort },
      },
    }));
    const detail = get().stageDetails[stageId] ?? {};
    sync(
      api.saveStageDetail(get().projectId, stageId, {
        description: detail.description ?? null,
        engineeringView,
        engineeringEffort,
        programView: detail.programView ?? null,
        tools: detail.tools ?? null,
        collaboration: detail.collaboration ?? null,
      }),
    );
  },

  setCostRate: (costPerManMonth, currency) => {
    set({ costPerManMonth, currency });
    sync(api.setCostRate(get().projectId, costPerManMonth, currency));
  },

  saveStageDetail: (stageId, detail) => {
    set((s) => ({
      stageDetails: {
        ...s.stageDetails,
        /* an override with nothing in it is no override — the stage falls back
           to the shared text rather than keeping a frozen copy of it */
        [stageId]: isEmptyOverride(detail) ? undefined : detail,
      },
    }));
    sync(
      api.saveStageDetail(get().projectId, stageId, {
        description: detail.description ?? null,
        engineeringView: detail.engineeringView ?? null,
        engineeringEffort: detail.engineeringEffort ?? null,
        programView: detail.programView ?? null,
        tools: detail.tools ?? null,
        collaboration: detail.collaboration ?? null,
      }),
    );
  },

  adoptPotentialRisk: (stageId, title) => {
    const risk: Item = {
      id: uid(),
      title,
      body: '',
      owner: get().leaders[stageId].short,
      due: null,
      done: false,
      updated: new Date(),
      updates: [],
      attachments: [],
    };
    set((s) => ({
      content: {
        ...s.content,
        [stageId]: { ...s.content[stageId], risks: [...s.content[stageId].risks, risk] },
      },
    }));
    sync(api.saveItem({ projectId: get().projectId, ...risk, stageId, kind: 'risks', updatedAt: risk.updated }));
  },

  saveItem: (stageId, kind, itemId, f) => {
    const existing = itemId
      ? get().content[stageId][kind].find((x) => x.id === itemId)
      : undefined;
    const saved: Item = existing
      ? { ...existing, ...f, updated: new Date() }
      : { id: uid(), ...f, done: false, updated: new Date(), updates: [], attachments: [] };
    set((s) => ({
      content: {
        ...s.content,
        [stageId]: {
          ...s.content[stageId],
          [kind]: existing
            ? s.content[stageId][kind].map((x) => (x.id === itemId ? saved : x))
            : [...s.content[stageId][kind], saved],
        },
      },
    }));
    sync(api.saveItem({ projectId: get().projectId, ...saved, stageId, kind, updatedAt: saved.updated }));
    return saved;
  },

  deleteItem: (stageId, kind, itemId) => {
    set((s) => ({
      content: {
        ...s.content,
        [stageId]: {
          ...s.content[stageId],
          [kind]: s.content[stageId][kind].filter((x) => x.id !== itemId),
        },
      },
    }));
    sync(api.deleteItem(get().projectId, itemId));
  },

  postUpdate: (stageId, kind, itemId, text) => {
    const su: StatusUpdate = { id: uid(), text, date: new Date(), attachments: [] };
    set((s) => ({
      content: mapItem(s.content, stageId, kind, itemId, (it) => ({
        ...it,
        updates: [...it.updates, su],
        updated: su.date,
      })),
    }));
    sync(api.postUpdate({ projectId: get().projectId, id: su.id, itemId, text, createdAt: su.date }));
    return su.id;
  },

  /* editing keeps the update's original timestamp — the thread stays honest */
  saveUpdate: (stageId, kind, itemId, suId, text) => {
    if (!text) return;
    set((s) => ({
      content: mapItem(s.content, stageId, kind, itemId, (it) => ({
        ...it,
        updates: it.updates.map((u) => (u.id === suId ? { ...u, text } : u)),
      })),
    }));
    sync(api.editUpdate(get().projectId, suId, text));
  },

  deleteUpdate: (stageId, kind, itemId, suId) => {
    set((s) => ({
      content: mapItem(s.content, stageId, kind, itemId, (it) => ({
        ...it,
        updates: it.updates.filter((u) => u.id !== suId),
      })),
    }));
    sync(api.deleteUpdate(get().projectId, suId));
  },
}));

/** Replace one item inside the content map, leaving every other stage alone. */
function mapItem(
  content: Record<StageId, StageContent>,
  stageId: StageId,
  kind: ItemKind,
  itemId: string,
  fn: (it: Item) => Item,
): Record<StageId, StageContent> {
  return {
    ...content,
    [stageId]: {
      ...content[stageId],
      [kind]: content[stageId][kind].map((it) => (it.id === itemId ? fn(it) : it)),
    },
  };
}

/** Newest first — the order every board renders in. */
export const sortedItems = (content: StageContent, kind: ItemKind): Item[] =>
  [...content[kind]].sort((a, b) => b.updated.getTime() - a.updated.getTime());
