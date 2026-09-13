/**
 * /lib/meetings/followUp.ts — action items after the meeting ends.
 *
 * An action item is a promise with one name and one date on it. What this
 * module answers is the TPM's question the morning after: which of those are
 * mine, which have slipped, which are stuck, and which should be raised again
 * at the next sitting.
 *
 * It judges and sorts; it changes nothing. In particular an overdue action
 * moves no step and no activity date — lateness is reported, and the schedule
 * impact is something a person states on the action.
 *
 * Pure: no DOM, no clock — today is passed in, at local midnight.
 */
import { DAY, startOfDay } from '@/lib/schedule';
import type { ActionItem, ActionStatus, Meeting, Priority } from './types';

/** Inside this many days an open action is "due soon". */
export const DUE_SOON_DAYS = 3;

export const OPEN_ACTION_STATUSES: readonly ActionStatus[] = ['open', 'in_progress', 'blocked'];

export const isActionOpen = (a: Pick<ActionItem, 'status'>): boolean =>
  OPEN_ACTION_STATUSES.includes(a.status);

export type ActionTiming = 'overdue' | 'due_soon' | 'on_track' | 'no_due' | 'closed';

export const ACTION_TIMING_LABEL: Record<ActionTiming, string> = {
  overdue: 'Overdue',
  due_soon: 'Due soon',
  on_track: 'On track',
  no_due: 'No due date',
  closed: 'Closed',
};

const daysUntil = (due: Date, today: Date) =>
  Math.round((startOfDay(due).getTime() - today.getTime()) / DAY);

export function actionTiming(a: Pick<ActionItem, 'status' | 'due'>, today: Date): ActionTiming {
  if (!isActionOpen(a)) return 'closed';
  if (!a.due) return 'no_due';
  const n = daysUntil(a.due, today);
  if (n < 0) return 'overdue';
  return n <= DUE_SOON_DAYS ? 'due_soon' : 'on_track';
}

/** Whole days past its date; zero for anything not late. */
export const daysLate = (a: Pick<ActionItem, 'status' | 'due'>, today: Date): number =>
  actionTiming(a, today) === 'overdue' && a.due ? -daysUntil(a.due, today) : 0;

export interface ActionSummary {
  myOpen: number;
  overdue: number;
  blocked: number;
  dueSoon: number;
}

export function actionSummary(
  actions: readonly ActionItem[],
  me: string,
  today: Date,
): ActionSummary {
  const out: ActionSummary = { myOpen: 0, overdue: 0, blocked: 0, dueSoon: 0 };
  for (const a of actions) {
    if (!isActionOpen(a)) continue;
    if (a.owner === me) out.myOpen++;
    if (a.status === 'blocked') out.blocked++;
    const t = actionTiming(a, today);
    if (t === 'overdue') out.overdue++;
    if (t === 'due_soon') out.dueSoon++;
  }
  return out;
}

const PRIORITY_RANK: Record<Priority, number> = { critical: 0, high: 1, normal: 2, low: 3 };

/**
 * The order a follow-up list reads in: open before closed; the furthest past
 * due first; then priority; then the date — and an undated action ahead of a
 * dated one of the same priority, because a promise with no date is the one
 * nobody will chase.
 */
export function sortActions(list: readonly ActionItem[], today: Date): ActionItem[] {
  return [...list].sort((a, b) => {
    const closed = Number(!isActionOpen(a)) - Number(!isActionOpen(b));
    if (closed) return closed;
    const late = daysLate(b, today) - daysLate(a, today);
    if (late) return late;
    const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rank) return rank;
    const da = a.due ? a.due.getTime() : -Infinity;
    const db = b.due ? b.due.getTime() : -Infinity;
    if (da !== db) return da < db ? -1 : 1;
    return a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id);
  });
}

export type ActionView = 'all' | 'mine' | 'overdue' | 'blocked' | 'due_soon';

export interface ActionFilter {
  view?: ActionView;
  owner?: string;
  status?: ActionStatus | '';
  priority?: Priority | '';
  timing?: ActionTiming | '';
  /** Raised in this meeting, or carried into it. */
  meetingId?: string;
  query?: string;
}

export function filterActions(
  actions: readonly ActionItem[],
  f: ActionFilter,
  me: string,
  today: Date,
): ActionItem[] {
  const q = f.query?.trim().toLowerCase() ?? '';
  return sortActions(
    actions.filter((a) => {
      const timing = actionTiming(a, today);
      if (f.view === 'mine' && !(isActionOpen(a) && a.owner === me)) return false;
      if (f.view === 'overdue' && timing !== 'overdue') return false;
      if (f.view === 'blocked' && a.status !== 'blocked') return false;
      if (f.view === 'due_soon' && timing !== 'due_soon') return false;
      if (f.owner && a.owner !== f.owner) return false;
      if (f.status && a.status !== f.status) return false;
      if (f.priority && a.priority !== f.priority) return false;
      if (f.timing && timing !== f.timing) return false;
      if (f.meetingId && a.meetingId !== f.meetingId && a.carriedToMeetingId !== f.meetingId)
        return false;
      if (q && !`${a.description} ${a.owner} ${a.contributors.join(' ')}`.toLowerCase().includes(q))
        return false;
      return true;
    }),
    today,
  );
}

/** What an open action is missing before anybody can be held to it. */
export function actionWarnings(a: ActionItem): string[] {
  if (!isActionOpen(a)) return [];
  const out: string[] = [];
  if (!a.owner.trim()) out.push('No accountable owner');
  if (!a.due) out.push('No due date');
  return out;
}

/** Raised in this meeting, or carried into it — what its Action Items tab lists. */
export const actionsOfMeeting = (meetingId: string, actions: readonly ActionItem[]): ActionItem[] =>
  actions.filter((a) => a.meetingId === meetingId || a.carriedToMeetingId === meetingId);

/**
 * What can be carried from this sitting to the next: its own open actions not
 * yet carried anywhere, and the ones carried into it that are still open.
 */
export const carryOverCandidates = (
  meetingId: string,
  actions: readonly ActionItem[],
): ActionItem[] =>
  actions.filter(
    (a) =>
      isActionOpen(a) &&
      ((a.meetingId === meetingId && !a.carriedToMeetingId) || a.carriedToMeetingId === meetingId),
  );

const held = (m: Meeting) => m.status !== 'cancelled';

export function nextInSeries(m: Meeting, meetings: readonly Meeting[]): Meeting | null {
  if (!m.seriesId) return null;
  return (
    meetings
      .filter((x) => x.seriesId === m.seriesId && x.id !== m.id && held(x) && x.startsAt > m.startsAt)
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0] ?? null
  );
}

export function previousInSeries(m: Meeting, meetings: readonly Meeting[]): Meeting | null {
  if (!m.seriesId) return null;
  return (
    meetings
      .filter((x) => x.seriesId === m.seriesId && x.id !== m.id && held(x) && x.startsAt < m.startsAt)
      .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())[0] ?? null
  );
}
