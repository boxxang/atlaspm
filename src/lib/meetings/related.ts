/**
 * /lib/meetings/related.ts — the meetings an activity or a step has been in.
 *
 * Read from the other side of the links: nothing on an activity says which
 * meetings discussed it, because a meeting is what records that. A meeting is
 * related when it, one of its agenda items, a decision taken in it or an action
 * raised in it names the work — and the decisions and actions shown are the
 * meeting's own rows, not copies.
 *
 * Pure: no DOM, no clock — now and today are passed in.
 */
import { actionTiming, isActionOpen, sortActions } from './followUp';
import { touchesWork, type RiskSteps, type WorkTarget } from './links';
import type { ActionItem, AgendaItem, Decision, Meeting } from './types';

export interface RelatedWork {
  /** Not yet held, soonest first. */
  upcoming: Meeting[];
  /** Completed, latest first. */
  recent: Meeting[];
  decisions: Decision[];
  openActions: ActionItem[];
  overdueActions: ActionItem[];
  blocked: ActionItem[];
  /** When a completed meeting last covered it. */
  lastReviewed: Date | null;
  nextReview: Meeting | null;
}

export function relatedToWork(input: {
  target: WorkTarget;
  meetings: readonly Meeting[];
  agenda: readonly AgendaItem[];
  decisions: readonly Decision[];
  actions: readonly ActionItem[];
  riskSteps: RiskSteps;
  now: Date;
  today: Date;
}): RelatedWork {
  const { target, riskSteps, now, today } = input;
  const touches = (links: Parameters<typeof touchesWork>[0]) => touchesWork(links, target, riskSteps);

  const agendaHit = new Set(input.agenda.filter((a) => touches(a.links)).map((a) => a.id));
  const viaAgenda = (id: string | null) => !!id && agendaHit.has(id);

  const decisions = input.decisions
    .filter((d) => touches(d.links) || viaAgenda(d.agendaItemId))
    .sort(
      (a, b) =>
        (b.decidedOn ?? b.createdAt).getTime() - (a.decidedOn ?? a.createdAt).getTime(),
    );

  const actions = input.actions.filter(
    (a) =>
      touches(a.links) ||
      viaAgenda(a.agendaItemId) ||
      (!!a.convertedStep &&
        a.convertedStep.act === target.act &&
        (target.n == null || a.convertedStep.n === target.n)),
  );

  const meetingIds = new Set<string>();
  for (const a of input.agenda) if (agendaHit.has(a.id)) meetingIds.add(a.meetingId);
  for (const d of decisions) meetingIds.add(d.meetingId);
  for (const a of actions) if (a.meetingId) meetingIds.add(a.meetingId);

  const related = input.meetings.filter(
    (m) => m.status !== 'cancelled' && (touches(m.links) || meetingIds.has(m.id)),
  );
  const upcoming = related
    .filter((m) => m.status !== 'completed' && m.startsAt >= now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const recent = related
    .filter((m) => m.status === 'completed')
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

  const openActions = sortActions(actions.filter(isActionOpen), today);

  return {
    upcoming,
    recent,
    decisions,
    openActions,
    overdueActions: openActions.filter((a) => actionTiming(a, today) === 'overdue'),
    blocked: openActions.filter((a) => a.status === 'blocked'),
    lastReviewed: recent[0]?.startsAt ?? null,
    nextReview: upcoming[0] ?? null,
  };
}
