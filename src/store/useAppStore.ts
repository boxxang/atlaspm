'use client';

import { create } from 'zustand';
import * as api from '@/app/actions';
import { BUILTIN_PROFILE, STAGE_ORDER } from '@/data/scheduleProfiles';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import type { ProgramPost, ProjectState } from '@/lib/projectState';
import { resolveStages } from '@/lib/stages';
import { rejectFile, rejectionMessage } from '@/lib/attachments';
import { serialiseEffort, serialiseTat } from '@/lib/effort';
import { isEmptyOverride, type StageDetailOverride } from '@/lib/stageDetail';
import { handoverComplete } from '@/lib/deliverableStatus';
import { stepKey, type StepStateRecord } from '@/lib/steps';
import type {
  AttachmentRef,
  Contact,
  Deliverable,
  Item,
  ItemKind,
  Leader,
  ScheduleProfile,
  Stage,
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
export type InlineKind = 'stage' | 'leader';
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
  /** The profile this program runs on, and the stages it resolves to. */
  profile: ScheduleProfile;
  stages: Stage[];
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
  /**
   * What has happened to each step, keyed `activityRef:stepN`. Absent means
   * untouched — the plan in /data/activitySteps.ts answers for it.
   */
  stepStates: Record<string, StepStateRecord>;
  /** The outputs handed over on each step, keyed `activityRef:stepN`. */
  stepOutputs: Record<string, AttachmentRef[]>;
  /**
   * Every post that is not a V1 board item's — step updates and risks, stage
   * notes, deliverable handovers, and the replies under them. Newest first.
   */
  posts: ProgramPost[];

  hydrate: (initial: ProjectState, now?: Date) => void;
  setProjectName: (name: string) => void;
  setKickoff: (d: Date) => void;
  setProfile: (id: string) => void;
  /** Picking the selected stage again clears it. */
  selectStage: (i: number | null) => void;
  /**
   * Edit one step. A partial patch, because the panel changes one field at a
   * time and a step nobody has assigned should not lose its owner because its
   * percentage moved.
   */
  setStepState: (act: string, n: number, patch: Partial<StepStateRecord>) => void;
  /**
   * Hand an output over on a step. Attaching one completes the step and stamps
   * the day it was handed over, because that is what completing a step means —
   * the artefact is here, not that somebody said so.
   *
   * Resolves with what the server refused, if anything.
   */
  attachToStep: (act: string, n: number, files: FileList | File[]) => Promise<string[]>;
  /** Take one back. The last one out reopens the step. */
  detachFromStep: (act: string, n: number, attachmentId: string) => void;

  /**
   * Write a post, or edit one that exists. One call for all of them — an update
   * on a step, a risk, a note on a stage, a handover, a reply — because a post
   * is one shape wherever it lands.
   */
  savePost: (post: {
    id: string;
    kind: string;
    text: string;
    author: string;
    activityRef?: string | null;
    stepN?: number | null;
    stageId?: string | null;
    deliverableId?: string | null;
    parentId?: string | null;
    doneAt?: Date | null;
  }) => void;
  /** Change what a post says. Only the text and, on a handover, its date. */
  editPost: (id: string, text: string, doneAt?: Date | null) => void;
  /**
   * Attach an artefact to a handover. The deliverable's own done flag follows —
   * it is stored, the progress figures read it, and V1 reads it too, so it has
   * to agree with what the handover actually says.
   */
  /** Hangs files off any post — a note, an update, a handover. */
  attachToPost: (postId: string, files: FileList | File[]) => Promise<string[]>;
  detachFromPost: (postId: string, attachmentId: string) => void;
  attachToHandover: (
    stageId: StageId,
    deliverableId: string,
    postId: string,
    files: FileList | File[],
  ) => Promise<string[]>;
  detachFromHandover: (stageId: StageId, deliverableId: string, attachmentId: string) => void;
  /** Recompute a deliverable's stored done flag from its handover. */
  syncHandoverDone: (stageId: StageId, deliverableId: string) => void;
  /** Delete a post, and the replies under it. */
  deletePost: (id: string) => void;
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
  /** Renames a deliverable — from its record, in edit mode. */
  renameDeliverable: (stageId: StageId, id: string, title: string) => void;
  /** Files the record; the tick follows whether an artefact is attached. */
  saveDeliverableRecord: (stageId: StageId, id: string, note: string) => void;
  /** Uploads artefacts; resolves with what the server refused, if anything. */
  attachToDeliverable: (stageId: StageId, id: string, files: FileList | File[]) => Promise<string[]>;
  detachFromDeliverable: (stageId: StageId, id: string, attachmentId: string) => void;
  /** Corrects the stamp the checkbox wrote — see setDeliverableCompleted. */
  setDeliverableCompleted: (stageId: StageId, id: string, completedAt: Date | null) => void;
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
    lines: { label: string; manMonths: number; tatWeeks: number }[],
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
  postUpdate: (
    stageId: StageId,
    kind: ItemKind,
    itemId: string,
    text: string,
    author?: string,
  ) => string;
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
  /** Which key deliverable this is work towards. Activities only. */
  deliverableId?: string | null;
  /** Who raised it. Set when the post is written and never rewritten by an edit. */
  author?: string;
  /** What the post is about: an activity, and optionally a step of it. */
  activityRef?: string | null;
  stepN?: number | null;
  /**
   * Optional so the ordinary save leaves it alone: an edit form has no opinion
   * about whether the entry is finished, and the tick that does is a different
   * gesture. New items are created open regardless.
   */
  done?: boolean;
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

/** What a step nobody has touched reads as, before a patch lands on it. */
const UNTOUCHED_STEP: StepStateRecord = {
  done: false,
  doneAt: null,
  pct: 0,
  owner: '',
  dueOverride: null,
};

/** Two dates that are the same day, or both absent. */
const sameDay = (a: Date | null, b: Date | null) =>
  a === b || (!!a && !!b && a.getTime() === b.getTime());

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

/** Changes only when the profile really changes — id, order, names, baselines. */
const profileSignature = (p: ScheduleProfile) =>
  p.id +
  '|' +
  p.stages
    .map(
      (st) =>
        `${st.key}@${st.order}:${st.startOffsetWeeks}/${st.durationWeeks}:${st.title}:${st.shortTitle}:${st.phaseId}`,
    )
    .join(',');

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
  profile: BUILTIN_PROFILE,
  stages: resolveStages(BUILTIN_PROFILE),
  costPerManMonth: 0,
  currency: 'USD',
  overrides: {},
  schedule: computeSchedule(BOOT_KICKOFF, BUILTIN_PROFILE, {}),
  committedSchedule: computeSchedule(BOOT_KICKOFF, BUILTIN_PROFILE, {}),
  draftOverrides: null,
  edited: false,
  currentStage: null,
  content: emptyMap<StageContent>(() => ({ keyinfo: [], activities: [], risks: [] })),
  deliverables: emptyMap<Deliverable[]>(() => []),
  leaders: emptyMap<Leader>(() => ({ name: '', short: '', phone: '', email: '' })),
  contacts: emptyMap<Contact[]>(() => []),
  stageDetails: {},
  inline: {},
  stepStates: {},
  stepOutputs: {},
  posts: [],

  /* Server-rendered DB state in, client clock applied here: "today" belongs to
     the viewer's timezone, so it cannot come from the server render.
     
     The store is a module singleton and client-side navigation does not tear it
     down, so re-hydrate whenever the route points at a different program —
     otherwise opening one program and then switching would keep showing the
     first one's name, schedule and boards until a full page load. */
  hydrate: (initial, now = new Date()) => {
    const prev = get();
    /* Also re-hydrate when the program's stage list has changed under it —
       editing the stages forks a profile, and the keys the boards hang off
       move with it. */
    if (
      prev.hydrated &&
      prev.projectId === initial.projectId &&
      profileSignature(prev.profile) === profileSignature(initial.profile)
    )
      return;
    const profile = initial.profile;
    const stages = resolveStages(profile);
    const today = startOfDay(now);
    const schedule = computeSchedule(initial.kickoff, profile, initial.overrides);
    /* Open on the stage running today. Stages overlap, so several can be — take
       the last, which is the lowest bar on the chart. */
    const inFlight = stages
      .map((st, i) =>
        schedule.stages[st.id].start <= today && today <= schedule.stages[st.id].end
          ? i
          : -1,
      )
      .filter((i) => i >= 0);
    const openStage = inFlight.length ? inFlight[inFlight.length - 1] : null;
    set({
      hydrated: true,
      projectId: initial.projectId,
      today,
      projectName: initial.projectName,
      kickoff: initial.kickoff,
      profile,
      stages,
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
      stepStates: initial.stepStates,
      stepOutputs: initial.stepOutputs,
      posts: initial.posts,
      /* view state belongs to the program you were looking at, not the next one */
      currentStage: openStage,
      inline:
        openStage === null
          ? {}
          : { [stages[openStage].id]: { kind: 'stage', editContact: null } },
    });
  },

  setProjectName: (projectName) => {
    set({ projectName });
    sync(api.renameProject(get().projectId, projectName));
  },

  setKickoff: (kickoff) => {
    set((s) => {
      const schedule = computeSchedule(kickoff, s.profile, s.overrides);
      /* moving kickoff re-bases everything, so any staged stage edit is stale */
      return { kickoff, schedule, committedSchedule: schedule, draftOverrides: null };
    });
    sync(api.setKickoff(get().projectId, kickoff));
  },

  /**
   * Moving a program to another profile changes which stages exist, so there is
   * nothing sensible to draw optimistically — the write goes out and the
   * re-render brings the new stage list, which hydrate() picks up.
   */
  setProfile: (profileId) => {
    sync(api.setProfile(get().projectId, profileId));
  },

  selectStage: (i) =>
    set((s) => {
      /* picking the same bar again closes the panel */
      if (i === null || i === s.currentStage) return { currentStage: null };
      const stageId = s.stages[i].id;
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
    const profile = s.profile;
    const base = s.draftOverrides ?? s.overrides;
    const draftOverrides = applyDateEdit(profile, base, s.schedule, stageId, which, date);
    set({ draftOverrides, schedule: computeSchedule(s.kickoff, profile, draftOverrides) });
  },

  applyScheduleDraft: () => {
    const s = get();
    if (!s.draftOverrides) return;
    const profile = s.profile;
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
      schedule: computeSchedule(s.kickoff, s.profile, s.overrides),
    })),

  resetSchedule: () => {
    set((s) => {
      const schedule = computeSchedule(s.kickoff, s.profile, {});
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

  setStepState: (act, n, patch) => {
    const key = stepKey(act, n);
    set((s) => {
      const prev = s.stepStates[key] ?? UNTOUCHED_STEP;
      return { stepStates: { ...s.stepStates, [key]: { ...prev, ...patch } } };
    });
    sync(
      api.saveStepState({
        projectId: get().projectId,
        activityRef: act,
        stepN: n,
        ...patch,
      }),
    );
  },

  savePost: (post) => {
    const now = new Date();
    set((s) => ({
      posts: [
        {
          activityRef: null,
          stepN: null,
          stageId: null,
          deliverableId: null,
          parentId: null,
          doneAt: null,
          ...post,
          createdAt: now,
          editedAt: null,
          attachments: [],
        },
        ...s.posts,
      ],
    }));
    sync(api.savePost({ projectId: get().projectId, ...post }));
  },

  /**
   * An edit changes what was said and stamps when it was said again. It never
   * changes who said it, where it lives, or what kind of post it is — so only
   * the text travels, rather than the whole row. Spreading a stored post back
   * at the server sends it fields it has no columns for.
   */
  editPost: (id, text, doneAt) => {
    const now = new Date();
    const existing = get().posts.find((p) => p.id === id);
    if (!existing) return;
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === id ? { ...p, text, editedAt: now, doneAt: doneAt === undefined ? p.doneAt : doneAt } : p,
      ),
    }));
    sync(
      api.savePost({
        projectId: get().projectId,
        id,
        kind: existing.kind,
        text,
        author: existing.author,
        doneAt: doneAt === undefined ? existing.doneAt : doneAt,
      }),
    );
  },

  deletePost: (id) => {
    /* A reply belongs to its parent, so deleting the parent takes the thread —
       the database cascades, and the store has to agree or the screen keeps
       showing replies to something that is gone. */
    set((s) => ({ posts: s.posts.filter((p) => p.id !== id && p.parentId !== id) }));
    sync(api.deletePost(get().projectId, id));
  },

  attachToPost: async (postId, files) => {
    const held = get().posts.find((p) => p.id === postId)?.attachments ?? [];
    const accepted: File[] = [];
    const problems: string[] = [];
    for (const f of files) {
      const reason = rejectFile(f, held.length + accepted.length);
      if (reason) problems.push(rejectionMessage(reason, f.name));
      else accepted.push(f);
    }
    if (!accepted.length) return problems;

    const form = new FormData();
    form.set('projectId', get().projectId);
    form.set('statusUpdateId', postId);
    for (const f of accepted) {
      form.append('files', f);
      form.append('ids', uid());
    }
    try {
      /* the post has to be on the server before a row can point at it */
      await flushWrites();
      const saved = await api.uploadAttachments(form);
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, attachments: [...p.attachments, ...saved] } : p,
        ),
      }));
    } catch (e) {
      console.error('[atlaspm] post attachment upload failed', e);
      problems.push('Upload failed — the files were not attached.');
    }
    return problems;
  },

  detachFromPost: (postId, attachmentId) => {
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId
          ? { ...p, attachments: p.attachments.filter((a) => a.id !== attachmentId) }
          : p,
      ),
    }));
    sync(api.deleteAttachment(get().projectId, attachmentId));
  },

  attachToHandover: async (stageId, deliverableId, postId, files) => {
    const held = get().posts.find((p) => p.id === postId)?.attachments ?? [];
    const accepted: File[] = [];
    const problems: string[] = [];
    for (const f of files) {
      const reason = rejectFile(f, held.length + accepted.length);
      if (reason) problems.push(rejectionMessage(reason, f.name));
      else accepted.push(f);
    }
    if (!accepted.length) return problems;

    const form = new FormData();
    form.set('projectId', get().projectId);
    form.set('statusUpdateId', postId);
    for (const f of accepted) {
      form.append('files', f);
      form.append('ids', uid());
    }
    try {
      /* the post has to be on the server before a row can point at it */
      await flushWrites();
      const saved = await api.uploadAttachments(form);
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, attachments: [...p.attachments, ...saved] } : p,
        ),
      }));
      get().syncHandoverDone(stageId, deliverableId);
    } catch (e) {
      console.error('[atlaspm] handover attachment upload failed', e);
      problems.push('Upload failed — the files were not attached.');
    }
    return problems;
  },

  detachFromHandover: (stageId, deliverableId, attachmentId) => {
    set((s) => ({
      posts: s.posts.map((p) => ({
        ...p,
        attachments: p.attachments.filter((a) => a.id !== attachmentId),
      })),
    }));
    sync(api.deleteAttachment(get().projectId, attachmentId));
    get().syncHandoverDone(stageId, deliverableId);
  },

  /**
   * Keep the deliverable's stored done flag in step with its handover.
   *
   * The flag is derived — a handover with a body, an artefact and a date — but
   * it is also stored, because the progress figures and the V1 page both read
   * the column. Deriving it in one place and writing it there is what keeps the
   * two from disagreeing.
   */
  syncHandoverDone: (stageId, deliverableId) => {
    const post = get().posts.find(
      (p) => p.deliverableId === deliverableId && p.kind === 'handover',
    );
    const done = handoverComplete(post ?? null);
    const completedAt = done ? (post?.doneAt ?? null) : null;
    const current = get().deliverables[stageId]?.find((d) => d.id === deliverableId);
    if (!current || (current.done === done && sameDay(current.completedAt, completedAt))) return;
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].map((d) =>
          d.id === deliverableId ? { ...d, done, completedAt } : d,
        ),
      },
    }));
    sync(api.setDeliverableDone(get().projectId, deliverableId, done, completedAt));
  },

  attachToStep: async (act, n, files) => {
    const key = stepKey(act, n);
    const held = get().stepOutputs[key] ?? [];
    const accepted: File[] = [];
    const problems: string[] = [];
    for (const file of files) {
      const reason = rejectFile(file, held.length + accepted.length);
      if (reason) problems.push(rejectionMessage(reason, file.name));
      else accepted.push(file);
    }
    if (!accepted.length) return problems;

    const form = new FormData();
    form.set('projectId', get().projectId);
    form.set('activityRef', act);
    form.set('stepN', String(n));
    for (const file of accepted) {
      form.append('files', file);
      form.append('ids', uid());
    }
    try {
      const saved = await api.uploadAttachments(form);
      set((s) => ({
        stepOutputs: { ...s.stepOutputs, [key]: [...(s.stepOutputs[key] ?? []), ...saved] },
      }));
      /* The artefact arriving is the completion. The date is the day it was
         handed over, which is today — and it stays editable afterwards, because
         work finished last week and filed today should say last week. */
      if (!get().stepStates[key]?.done) {
        get().setStepState(act, n, { done: true, doneAt: new Date(), pct: 100 });
      }
    } catch (e) {
      console.error('[atlaspm] step output upload failed', e);
      problems.push('Upload failed — the files were not attached.');
    }
    return problems;
  },

  detachFromStep: (act, n, attachmentId) => {
    const key = stepKey(act, n);
    const left = (get().stepOutputs[key] ?? []).filter((a) => a.id !== attachmentId);
    set((s) => ({ stepOutputs: { ...s.stepOutputs, [key]: left } }));
    sync(api.deleteAttachment(get().projectId, attachmentId));
    /* Nothing handed over is not a completed step. Taking the last output back
       reopens it, the same way attaching the first one closed it. */
    if (!left.length && get().stepStates[key]?.done) {
      get().setStepState(act, n, { done: false, doneAt: null, pct: 0 });
    }
  },

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

  setDeliverableCompleted: (stageId, id, completedAt) => {
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].map((d) =>
          d.id === id ? { ...d, completedAt } : d,
        ),
      },
    }));
    sync(api.setDeliverableCompleted(get().projectId, id, completedAt));
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
          { id, title, done: false, due, completedAt: null, note: '', attachments: [] },
        ],
      },
    }));
    sync(api.addDeliverable({ projectId: get().projectId, id, stageId, title, due }));
  },

  /**
   * Files a deliverable's record: the development history, and the artefact
   * that came out of it.
   *
   * The tick follows the artefact. Ticking a box says a thing was done; an
   * attached file is the thing, which is why a deliverable is now marked
   * complete by filing rather than by clicking. Filing a record with nothing
   * attached clears the tick again — that is the same rule, read backwards.
   */
  renameDeliverable: (stageId, id, title) => {
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].map((d) => (d.id === id ? { ...d, title } : d)),
      },
    }));
    sync(api.renameDeliverable(get().projectId, id, title));
  },

  saveDeliverableRecord: (stageId, id, note) => {
    const d = get().deliverables[stageId]?.find((x) => x.id === id);
    if (!d) return;
    const done = d.attachments.length > 0;
    const completedAt = done ? (d.completedAt ?? new Date()) : null;
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].map((x) =>
          x.id === id ? { ...x, note, done, completedAt } : x,
        ),
      },
    }));
    sync(api.saveDeliverableRecord(get().projectId, id, note, done, completedAt));
  },

  /**
   * The artefact itself. Like the board's attachments this waits for the
   * bytes to land before the chip means anything, and returns whatever the
   * server refused.
   */
  attachToDeliverable: async (stageId, id, files) => {
    const d = get().deliverables[stageId]?.find((x) => x.id === id);
    if (!d) return ['That deliverable is no longer here.'];
    const accepted: File[] = [];
    const problems: string[] = [];
    for (const file of files) {
      const reason = rejectFile(file, d.attachments.length + accepted.length);
      if (reason) problems.push(rejectionMessage(reason, file.name));
      else accepted.push(file);
    }
    if (!accepted.length) return problems;

    const form = new FormData();
    form.set('projectId', get().projectId);
    form.set('deliverableId', id);
    for (const file of accepted) {
      form.append('files', file);
      form.append('ids', uid());
    }
    try {
      const saved = await api.uploadAttachments(form);
      set((s) => ({
        deliverables: {
          ...s.deliverables,
          [stageId]: s.deliverables[stageId].map((x) =>
            x.id === id ? { ...x, attachments: [...x.attachments, ...saved] } : x,
          ),
        },
      }));
    } catch (e) {
      console.error('[atlaspm] deliverable attachment upload failed', e);
      problems.push('Upload failed — the files were not attached.');
    }
    return problems;
  },

  detachFromDeliverable: (stageId, id, attachmentId) => {
    set((s) => ({
      deliverables: {
        ...s.deliverables,
        [stageId]: s.deliverables[stageId].map((x) =>
          x.id === id
            ? { ...x, attachments: x.attachments.filter((a) => a.id !== attachmentId) }
            : x,
        ),
      },
    }));
    sync(api.deleteAttachment(get().projectId, attachmentId));
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
    const stage = get().stages.find((x) => x.id === stageId)!;
    const kept = lines.filter((l) => l.label.trim());
    const labels = kept.map((l) => l.label.trim());
    /* A list identical to the shared default is not an override, so the stage
       keeps tracking /data/journey.ts. An emptied list stores '' rather than
       null, which is what tells resolveStageDetail the program meant it. */
    const view = labels.join('\n');
    const engineeringView = view === stage.engineeringView.join('\n') ? null : view;
    const engineeringEffort = serialiseEffort(kept.map((l) => l.manMonths));
    const engineeringTat = serialiseTat(kept.map((l) => l.tatWeeks));

    set((s) => ({
      stageDetails: {
        ...s.stageDetails,
        [stageId]: {
          ...s.stageDetails[stageId],
          engineeringView,
          engineeringEffort,
          engineeringTat,
        },
      },
    }));
    const detail = get().stageDetails[stageId] ?? {};
    sync(
      api.saveStageDetail(get().projectId, stageId, {
        description: detail.description ?? null,
        engineeringView,
        engineeringEffort,
        engineeringTat,
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
        engineeringTat: detail.engineeringTat ?? null,
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
      author: RISK_AUTHOR,
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
      : {
          id: uid(),
          author: '',
          activityRef: null,
          stepN: null,
          ...f,
          done: false,
          updated: new Date(),
          updates: [],
          attachments: [],
        };
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

  postUpdate: (stageId, kind, itemId, text, author = RISK_AUTHOR) => {
    const su: StatusUpdate = { id: uid(), text, author, date: new Date(), attachments: [] };
    set((s) => ({
      content: mapItem(s.content, stageId, kind, itemId, (it) => ({
        ...it,
        updates: [...it.updates, su],
        updated: su.date,
      })),
    }));
    sync(
      api.postUpdate({
        projectId: get().projectId,
        id: su.id,
        itemId,
        text,
        author,
        createdAt: su.date,
      }),
    );
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
