/**
 * /lib/meetings/digest.ts — what the Upcoming tab says.
 *
 * The morning read for a TPM who runs a dozen meetings a week: what is on
 * today, what is coming, which of those are mine to run, what needs preparing,
 * what was carried in unfinished, which coming meetings are about work that is
 * already late or flagged, and the three follow-up numbers worth chasing.
 *
 * Pure: no DOM, no clock — now and today are passed in.
 */
import { DAY } from '@/lib/schedule';
import { actionSummary, isActionOpen, type ActionSummary } from './followUp';
import { parseStepRef, type RiskSteps } from './links';
import type { ActionItem, AgendaItem, Decision, LinkRef, Meeting, MeetingStatus } from './types';

/** How far ahead "upcoming" looks by default. */
export const UPCOMING_DAYS = 7;

const ACTIVE: ReadonlySet<MeetingStatus> = new Set(['draft', 'scheduled', 'in_progress']);

const stillToHappen = (m: Meeting, today: Date) => ACTIVE.has(m.status) && m.startsAt.getTime() >= today.getTime();

/**
 * Sittings still to happen from today to `days` out — what the Upcoming tab
 * lists, so its count and the nav's say the same as the list under them.
 */
export const countUpcoming = (meetings: readonly Meeting[], today: Date, days = UPCOMING_DAYS): number => {
  const end = today.getTime() + (days + 1) * DAY;
  return meetings.filter((m) => stillToHappen(m, today) && m.startsAt.getTime() < end).length;
};

/** Today's meetings in the order they start, held or still to come — not the cancelled. */
export const meetingsToday = (meetings: readonly Meeting[], today: Date): Meeting[] => {
  const t0 = today.getTime();
  return meetings
    .filter((m) => m.status !== 'cancelled' && m.startsAt.getTime() >= t0 && m.startsAt.getTime() < t0 + DAY)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
};

/** A series' next sitting that has not happened yet. */
export const nextSittingOf = (seriesId: string, meetings: readonly Meeting[], today: Date): Meeting | null =>
  meetings
    .filter((m) => m.seriesId === seriesId && stillToHappen(m, today))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0] ?? null;

export interface MeetingAlert {
  meeting: Meeting;
  kind: 'overdue' | 'risk';
  /** The link that raised it, so the row can name the work. */
  link: LinkRef;
}

export interface Digest {
  today: Meeting[];
  upcoming: Meeting[];
  mine: Meeting[];
  prep: { meeting: Meeting; items: AgendaItem[] }[];
  carriedOver: { action: ActionItem; meeting: Meeting }[];
  alerts: MeetingAlert[];
  summary: ActionSummary & { awaitingDecisions: number };
  awaiting: Decision[];
}

export function upcomingDigest(input: {
  meetings: readonly Meeting[];
  agenda: readonly AgendaItem[];
  actions: readonly ActionItem[];
  decisions: readonly Decision[];
  me: string;
  now: Date;
  today: Date;
  /** Keys of steps past due with nothing handed over, `ref:n`. */
  overdueSteps: readonly string[];
  /** Post ids of open risks. */
  openRisks: readonly string[];
  riskSteps: RiskSteps;
  horizonDays?: number;
}): Digest {
  const t0 = input.today.getTime();
  const dayEnd = t0 + DAY;
  const horizonEnd = t0 + ((input.horizonDays ?? UPCOMING_DAYS) + 1) * DAY;
  const byStart = (a: Meeting, b: Meeting) => a.startsAt.getTime() - b.startsAt.getTime();

  const today = meetingsToday(input.meetings, input.today);
  const upcoming = input.meetings
    .filter(
      (m) =>
        ACTIVE.has(m.status) && m.startsAt.getTime() >= dayEnd && m.startsAt.getTime() < horizonEnd,
    )
    .sort(byStart);
  const coming = [...today.filter((m) => ACTIVE.has(m.status)), ...upcoming];
  const comingById = new Map(coming.map((m) => [m.id, m]));

  const agendaOf = (id: string) =>
    input.agenda.filter((a) => a.meetingId === id).sort((a, b) => a.position - b.position);

  const prep = coming
    .map((meeting) => ({ meeting, items: agendaOf(meeting.id).filter((a) => a.status === 'pending') }))
    .filter((p) => p.items.length > 0);

  const carriedOver = input.actions
    .filter((a) => isActionOpen(a) && !!a.carriedToMeetingId && comingById.has(a.carriedToMeetingId))
    .map((action) => ({ action, meeting: comingById.get(action.carriedToMeetingId as string)! }));

  /* What is wrong on the plan, keyed the ways a link can reach it. */
  const lateSteps = new Set(input.overdueSteps);
  const lateActs = new Set([...lateSteps].map((k) => parseStepRef(k)?.act).filter(Boolean));
  const riskIds = new Set(input.openRisks);
  const riskyActs = new Set<string>();
  const riskySteps = new Set<string>();
  for (const id of riskIds) {
    const r = input.riskSteps[id];
    if (!r) continue;
    riskyActs.add(r.act);
    if (r.stepN != null) riskySteps.add(`${r.act}:${r.stepN}`);
  }
  const isLate = (l: LinkRef) =>
    (l.type === 'step' && lateSteps.has(l.ref)) || (l.type === 'activity' && lateActs.has(l.ref));
  const isRisky = (l: LinkRef) =>
    (l.type === 'risk' && riskIds.has(l.ref)) ||
    (l.type === 'activity' && riskyActs.has(l.ref)) ||
    (l.type === 'step' && riskySteps.has(l.ref));

  const alerts: MeetingAlert[] = [];
  for (const meeting of coming) {
    const links = [...meeting.links, ...agendaOf(meeting.id).flatMap((a) => a.links)];
    const late = links.find(isLate);
    if (late) alerts.push({ meeting, kind: 'overdue', link: late });
    const risky = links.find(isRisky);
    if (risky) alerts.push({ meeting, kind: 'risk', link: risky });
  }

  const awaiting = input.decisions
    .filter((d) => d.status === 'proposed')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    today,
    upcoming,
    mine: coming.filter((m) => m.owner === input.me),
    prep,
    carriedOver,
    alerts,
    summary: { ...actionSummary(input.actions, input.me, input.today), awaitingDecisions: awaiting.length },
    awaiting,
  };
}
