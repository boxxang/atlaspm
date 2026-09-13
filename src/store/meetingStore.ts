'use client';

import { create } from 'zustand';
import * as api from '@/app/meetingActions';
import { uploadAttachments } from '@/app/actions';
import { detailActivityTitles } from '@/data/activityIndex';
import { activitySteps } from '@/data/activitySteps';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { rejectFile, rejectionMessage } from '@/lib/attachments';
import { canComplete, completionChecks } from '@/lib/meetings/completion';
import { nextOccurrences } from '@/lib/meetings/recurrence';
import {
  EMPTY_MEETINGS,
  type ActionItem,
  type AgendaItem,
  type CompletionMode,
  type Decision,
  type Meeting,
  type MeetingFile,
  type MeetingSeries,
  type MeetingsState,
  type MeetingStatus,
  type Stamped,
} from '@/lib/meetings/types';
import { resolveActivities, resolvedTitles } from '@/lib/resolveActivities';
import { flushWrites, sync, uid, useAppStore } from './useAppStore';

/**
 * The programme's meetings, in the browser.
 *
 * Its own store rather than more of the app store: meetings are their own
 * objects with their own screens, and the app store is already the size where
 * a second concern would be easy to tangle into the first. It is hydrated from
 * the same server render, by the same shell, on the same rule — once per
 * programme, never over optimistic state on a refresh.
 *
 * Writes are optimistic, like everywhere else, and tracked by the app store's
 * write set so flushWrites and the e2e harness wait for them. What is different
 * is that a refused write says so: `saveError` is shown on the meetings screens
 * rather than left in the console, because a lost action item is exactly the
 * failure this feature exists to prevent.
 */

/** The person using the app. There is no sign-in, so it is the programme's TPM. */
export const ME = RISK_AUTHOR;

export interface MeetingStore extends MeetingsState {
  hydrated: boolean;
  projectId: string;
  saveError: string | null;
  hydrate: (projectId: string, state: MeetingsState) => void;
  dismissError: () => void;

  setCompletionMode: (mode: CompletionMode) => void;

  saveSeries: (s: MeetingSeries) => void;
  deleteSeries: (id: string) => void;
  /** Schedule the series' next sittings, each starting with its agenda template. */
  scheduleFromSeries: (seriesId: string, count: number) => string[];

  saveMeeting: (m: Meeting, agenda?: AgendaItem[]) => void;
  /** Resolves with the reasons it was refused, or null once it is done. */
  setMeetingStatus: (id: string, status: MeetingStatus, cancelReason?: string) => Promise<string[] | null>;
  deleteMeeting: (id: string) => void;

  saveAgendaItem: (a: AgendaItem) => void;
  moveAgendaItem: (id: string, dir: -1 | 1) => void;
  deleteAgendaItem: (id: string) => void;
  /** Defer an item into a later sitting: it is marked there, and a fresh copy is added. */
  carryAgendaItem: (id: string, targetMeetingId: string) => void;

  saveDecision: (d: Decision) => void;
  deleteDecision: (id: string) => void;

  saveAction: (a: ActionItem) => void;
  deleteAction: (id: string) => void;
  carryActions: (ids: string[], targetMeetingId: string) => void;
  /** Resolves with the error, or null once the step exists. */
  convertActionToStep: (actionId: string, act: string, text: string, tatWeeks: number) => Promise<string | null>;

  saveFile: (f: MeetingFile) => void;
  deleteFile: (id: string) => void;
  attachToFile: (fileId: string, files: FileList | File[]) => Promise<string[]>;

  /** Raise a risk on a step through the ordinary risk flow, naming this meeting as its source. */
  raiseRisk: (meetingId: string, act: string, n: number, text: string) => Promise<string>;
}

const upsert = <T extends { id: string }>(list: readonly T[], row: T): T[] =>
  list.some((x) => x.id === row.id) ? list.map((x) => (x.id === row.id ? row : x)) : [...list, row];

/** Who and when, on the way in: a new row is created now by me; an edited row keeps its creation. */
function stamp<T extends Stamped>(row: T, prev: Stamped | undefined): T {
  const now = new Date();
  return {
    ...row,
    createdAt: prev?.createdAt ?? now,
    createdBy: prev?.createdBy ?? ME,
    updatedAt: now,
    updatedBy: ME,
  };
}

const said = (e: unknown) =>
  e instanceof Error && e.message
    ? `That change was not saved: ${e.message}`
    : 'That change was not saved. Reload to see what the server has.';

export const useMeetingStore = create<MeetingStore>()((set, get) => {
  /** Send a write, and say so on screen if it is refused. */
  const write = (p: Promise<unknown>) => {
    sync(
      p.catch((e) => {
        set({ saveError: said(e) });
        throw e;
      }),
    );
  };
  const pid = () => get().projectId;

  return {
    ...EMPTY_MEETINGS,
    hydrated: false,
    projectId: '',
    saveError: null,

    hydrate: (projectId, state) => {
      if (get().hydrated && get().projectId === projectId) return;
      set({ ...state, projectId, hydrated: true, saveError: null });
    },
    dismissError: () => set({ saveError: null }),

    setCompletionMode: (completionMode) => {
      set({ completionMode });
      write(api.setCompletionMode(pid(), completionMode));
    },

    saveSeries: (s) => {
      const row = stamp(s, get().series.find((x) => x.id === s.id));
      set((st) => ({ series: upsert(st.series, row) }));
      write(api.saveSeries(pid(), row, ME));
    },

    deleteSeries: (id) => {
      set((st) => ({
        series: st.series.filter((s) => s.id !== id),
        meetings: st.meetings.map((m) => (m.seriesId === id ? { ...m, seriesId: null } : m)),
      }));
      write(api.deleteSeries(pid(), id));
    },

    scheduleFromSeries: (seriesId, count) => {
      const s = get().series.find((x) => x.id === seriesId);
      if (!s) return [];
      const sittings = get().meetings.filter((m) => m.seriesId === seriesId);
      /* after the last sitting already on the calendar, or from now */
      const after = new Date(Math.max(Date.now(), ...sittings.map((m) => m.startsAt.getTime())));
      const ids: string[] = [];
      for (const startsAt of nextOccurrences(s.recurrence, s.timeZone, after, count)) {
        const id = uid();
        ids.push(id);
        const meeting = stamp<Meeting>(
          {
            id,
            projectId: pid(),
            seriesId: s.id,
            title: s.title,
            type: s.type,
            status: 'scheduled',
            startsAt,
            endsAt: new Date(startsAt.getTime() + s.durationMinutes * 60000),
            timeZone: s.timeZone,
            owner: s.owner,
            facilitator: '',
            location: s.location,
            purpose: s.purpose,
            minutes: '',
            attendees: s.attendees.map((name) => ({ id: uid(), name, optional: false })),
            links: s.links,
            completedAt: null,
            cancelReason: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: ME,
            updatedBy: ME,
          },
          undefined,
        );
        const agenda = s.agendaTemplate.map((title, position) =>
          stamp<AgendaItem>(
            {
              id: uid(),
              projectId: pid(),
              meetingId: id,
              position,
              title,
              description: '',
              presenter: '',
              minutes: 0,
              notes: '',
              outcome: '',
              status: 'pending',
              deferral: '',
              deferNote: '',
              carriedFromId: null,
              links: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: ME,
              updatedBy: ME,
            },
            undefined,
          ),
        );
        get().saveMeeting(meeting, agenda);
      }
      return ids;
    },

    saveMeeting: (m, agenda = []) => {
      const prev = get().meetings.find((x) => x.id === m.id);
      const row = stamp({ ...m, status: prev ? prev.status : m.status }, prev);
      const items = agenda.map((a) => stamp(a, undefined));
      set((st) => ({
        meetings: upsert(st.meetings, row),
        agenda: items.reduce((list, a) => upsert(list, a), st.agenda),
      }));
      write(api.saveMeeting(pid(), row, items, ME));
    },

    setMeetingStatus: async (id, status, cancelReason = '') => {
      const s = get();
      const prev = s.meetings.find((m) => m.id === id);
      if (!prev) return ['That meeting is no longer here.'];
      if (status === 'completed') {
        const verdict = canComplete(
          completionChecks({ meeting: prev, agenda: s.agenda, decisions: s.decisions, actions: s.actions }),
          s.completionMode,
        );
        if (!verdict.allowed) return verdict.failing.map((c) => c.message);
      }
      const now = new Date();
      set((st) => ({
        meetings: st.meetings.map((m) =>
          m.id === id
            ? {
                ...m,
                status,
                completedAt: status === 'completed' ? now : null,
                cancelReason: status === 'cancelled' ? cancelReason : '',
                updatedAt: now,
                updatedBy: ME,
              }
            : m,
        ),
      }));
      const revert = () => set((st) => ({ meetings: st.meetings.map((m) => (m.id === id ? prev : m)) }));
      try {
        /* anything just typed into the meeting has to be on the server first,
           or the server's checks read an older meeting than the screen did */
        await flushWrites();
        const p = api.setMeetingStatus(pid(), id, status, { cancelReason }, ME);
        sync(p);
        const res = await p;
        if (!res.ok) {
          revert();
          return res.failing;
        }
        return null;
      } catch (e) {
        revert();
        set({ saveError: said(e) });
        return [said(e)];
      }
    },

    deleteMeeting: (id) => {
      set((st) => ({
        meetings: st.meetings.filter((m) => m.id !== id),
        agenda: st.agenda.filter((a) => a.meetingId !== id),
        decisions: st.decisions.filter((d) => d.meetingId !== id),
        actions: st.actions
          .filter((a) => a.meetingId !== id)
          .map((a) => (a.carriedToMeetingId === id ? { ...a, carriedToMeetingId: null } : a)),
        files: st.files.filter((f) => f.meetingId !== id),
      }));
      write(api.deleteMeeting(pid(), id));
    },

    saveAgendaItem: (a) => {
      const row = stamp(a, get().agenda.find((x) => x.id === a.id));
      set((st) => ({ agenda: upsert(st.agenda, row) }));
      write(api.saveAgendaItem(pid(), row, ME));
    },

    moveAgendaItem: (id, dir) => {
      const item = get().agenda.find((a) => a.id === id);
      if (!item) return;
      const list = get()
        .agenda.filter((a) => a.meetingId === item.meetingId)
        .sort((a, b) => a.position - b.position);
      const i = list.findIndex((a) => a.id === id);
      const j = i + dir;
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      const position = new Map(list.map((a, k) => [a.id, k]));
      set((st) => ({
        agenda: st.agenda.map((a) => (position.has(a.id) ? { ...a, position: position.get(a.id)! } : a)),
      }));
      write(api.reorderAgenda(pid(), item.meetingId, list.map((a) => a.id)));
    },

    deleteAgendaItem: (id) => {
      set((st) => ({
        agenda: st.agenda.filter((a) => a.id !== id),
        decisions: st.decisions.map((d) => (d.agendaItemId === id ? { ...d, agendaItemId: null } : d)),
        actions: st.actions.map((a) => (a.agendaItemId === id ? { ...a, agendaItemId: null } : a)),
      }));
      write(api.deleteAgendaItem(pid(), id));
    },

    carryAgendaItem: (id, targetMeetingId) => {
      const src = get().agenda.find((a) => a.id === id);
      if (!src) return;
      get().saveAgendaItem({ ...src, outcome: 'deferred', deferral: 'next_meeting' });
      const last = Math.max(
        -1,
        ...get()
          .agenda.filter((a) => a.meetingId === targetMeetingId)
          .map((a) => a.position),
      );
      get().saveAgendaItem(
        stamp<AgendaItem>(
          {
            ...src,
            id: uid(),
            meetingId: targetMeetingId,
            position: last + 1,
            notes: '',
            outcome: '',
            status: 'pending',
            deferral: '',
            deferNote: '',
            carriedFromId: src.id,
          },
          undefined,
        ),
      );
    },

    saveDecision: (d) => {
      const row = stamp(d, get().decisions.find((x) => x.id === d.id));
      set((st) => ({ decisions: upsert(st.decisions, row) }));
      write(api.saveDecision(pid(), row, ME));
      /* Approving a decision that supersedes another retires the other one —
         the relationship is the statement that it no longer stands. */
      const old = row.supersedesId && get().decisions.find((x) => x.id === row.supersedesId);
      if (old && row.status === 'approved' && old.status !== 'superseded') {
        get().saveDecision({ ...old, status: 'superseded' });
      }
    },

    deleteDecision: (id) => {
      set((st) => ({
        decisions: st.decisions
          .filter((d) => d.id !== id)
          .map((d) => (d.supersedesId === id ? { ...d, supersedesId: null } : d)),
        files: st.files.filter((f) => f.decisionId !== id),
      }));
      write(api.deleteDecision(pid(), id));
    },

    saveAction: (a) => {
      const prev = get().actions.find((x) => x.id === a.id);
      const done = a.status === 'done';
      const row = stamp(
        {
          ...a,
          completedAt: done ? (a.completedAt ?? new Date()) : null,
          /* only convertActionToStep may say an action became a step */
          convertedStep: prev?.convertedStep ?? null,
        },
        prev,
      );
      set((st) => ({ actions: upsert(st.actions, row) }));
      write(api.saveActionItem(pid(), row, ME));
    },

    deleteAction: (id) => {
      set((st) => ({
        actions: st.actions.filter((a) => a.id !== id),
        files: st.files.filter((f) => f.actionItemId !== id),
      }));
      write(api.deleteActionItem(pid(), id));
    },

    carryActions: (ids, targetMeetingId) => {
      const now = new Date();
      const carry = new Set(ids);
      set((st) => ({
        actions: st.actions.map((a) =>
          carry.has(a.id) ? { ...a, carriedToMeetingId: targetMeetingId, updatedAt: now, updatedBy: ME } : a,
        ),
      }));
      write(api.carryActions(pid(), ids, targetMeetingId, ME));
    },

    convertActionToStep: async (actionId, act, text, tatWeeks) => {
      try {
        await flushWrites();
        const p = api.convertActionToStep({
          projectId: pid(),
          actionId,
          activityRef: act,
          text,
          tatWeeks,
          newProfileId: `${pid()}:stages:${uid().slice(0, 8)}`,
          author: ME,
        });
        sync(p);
        const res = await p;
        set((st) => ({
          actions: st.actions.map((a) =>
            a.id === actionId
              ? { ...a, actionType: 'new_step', convertedStep: { act, n: res.stepN }, updatedAt: new Date(), updatedBy: ME }
              : a,
          ),
        }));
        /* The programme's plan now has the step. Its profile may be a new
           private copy, carrying the same stages — so the store takes the new
           id and label, and a later refresh does not read it as a different
           programme and re-hydrate over everything. */
        useAppStore.setState((st) => ({
          activities: resolveActivities(res.activities, activitySteps),
          activityTitles: resolvedTitles(res.activities, detailActivityTitles),
          profile:
            st.profile.id === res.profileId
              ? st.profile
              : { ...st.profile, id: res.profileId, label: res.profileLabel, builtin: false, template: false },
        }));
        return null;
      } catch (e) {
        return said(e);
      }
    },

    saveFile: (f) => {
      set((st) => ({ files: upsert(st.files, f) }));
      write(api.saveMeetingFile(pid(), f, ME));
    },

    deleteFile: (id) => {
      set((st) => ({ files: st.files.filter((f) => f.id !== id) }));
      write(api.deleteMeetingFile(pid(), id));
    },

    attachToFile: async (fileId, files) => {
      const held = get().files.find((f) => f.id === fileId)?.attachments ?? [];
      const accepted: File[] = [];
      const problems: string[] = [];
      for (const f of files) {
        const reason = rejectFile(f, held.length + accepted.length);
        if (reason) problems.push(rejectionMessage(reason, f.name));
        else accepted.push(f);
      }
      if (!accepted.length) return problems;
      const form = new FormData();
      form.set('projectId', pid());
      form.set('meetingFileId', fileId);
      for (const f of accepted) {
        form.append('files', f);
        form.append('ids', uid());
      }
      try {
        /* the file row has to be on the server before bytes can hang off it */
        await flushWrites();
        const saved = await uploadAttachments(form);
        set((st) => ({
          files: st.files.map((f) => (f.id === fileId ? { ...f, attachments: [...f.attachments, ...saved] } : f)),
        }));
      } catch (e) {
        console.error('[atlaspm] meeting file upload failed', e);
        problems.push('Upload failed — the files were not attached.');
      }
      return problems;
    },

    raiseRisk: async (meetingId, act, n, text) => {
      const id = uid();
      useAppStore.getState().savePost({
        id,
        kind: 'risk',
        text,
        author: ME,
        activityRef: act,
        stepN: n,
        meetingId,
      });
      /* the meeting names the risk too, so it is listed with what the meeting
         is about — and the link is only accepted once the risk exists */
      await flushWrites();
      const m = get().meetings.find((x) => x.id === meetingId);
      if (m) get().saveMeeting({ ...m, links: [...m.links, { type: 'risk', ref: id }] });
      return id;
    },
  };
});
