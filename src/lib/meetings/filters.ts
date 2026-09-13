/**
 * /lib/meetings/filters.ts — narrowing the All Meetings list.
 *
 * History is not a separate list: it is this one, filtered to Completed and to
 * dates before today. A meeting is found by the stage or activity its work sits
 * in however that work was linked — the meeting itself, or any of its agenda
 * items, naming a stage, an activity, a step, a risk, a deliverable or a
 * milestone.
 *
 * Pure: no DOM, no clock — now is passed in.
 */
import { parseStepRef, touchesWork, type LinkContext, type RiskSteps } from './links';
import type { AgendaItem, LinkRef, Meeting, MeetingStatus, MeetingType } from './types';
import { zonedDayKey } from './zonedTime';

export interface MeetingFilter {
  query?: string;
  status?: MeetingStatus | '';
  /** Still to happen (and not completed or cancelled), or already in the past. */
  when?: 'upcoming' | 'past' | '';
  /** YYYY-MM-DD, inclusive, on the day where the meeting is held. */
  from?: string;
  to?: string;
  type?: MeetingType | '';
  owner?: string;
  stageId?: string;
  activityRef?: string;
  seriesId?: string;
  sort?: 'newest' | 'oldest';
}

type StageLookup = Pick<LinkContext, 'activity' | 'risk' | 'deliverable' | 'milestone'>;

/** Which stage a link's target sits in, whatever kind of link it is. */
export function stageOfLink(l: LinkRef, ctx: StageLookup): string | null {
  switch (l.type) {
    case 'stage':
      return l.ref;
    case 'activity':
      return ctx.activity(l.ref)?.stageId ?? null;
    case 'step': {
      const s = parseStepRef(l.ref);
      return s ? (ctx.activity(s.act)?.stageId ?? null) : null;
    }
    case 'risk':
      return ctx.risk(l.ref)?.stageId ?? null;
    case 'deliverable':
      return ctx.deliverable(l.ref)?.stageId ?? null;
    case 'milestone':
      return ctx.milestone(l.ref)?.stageId ?? null;
  }
}

export function filterMeetings(
  meetings: readonly Meeting[],
  agenda: readonly AgendaItem[],
  f: MeetingFilter,
  ctx: StageLookup,
  riskSteps: RiskSteps,
  now: Date,
): Meeting[] {
  const words = (f.query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  const agendaOf = new Map<string, AgendaItem[]>();
  for (const a of agenda) {
    const list = agendaOf.get(a.meetingId);
    if (list) list.push(a);
    else agendaOf.set(a.meetingId, [a]);
  }

  const kept = meetings.filter((m) => {
    const items = agendaOf.get(m.id) ?? [];
    const links = [...m.links, ...items.flatMap((a) => a.links)];
    if (f.status && m.status !== f.status) return false;
    if (f.when === 'upcoming' && !(m.startsAt >= now && m.status !== 'completed' && m.status !== 'cancelled'))
      return false;
    if (f.when === 'past' && !(m.startsAt < now)) return false;
    const day = zonedDayKey(m.startsAt, m.timeZone);
    if (f.from && day < f.from) return false;
    if (f.to && day > f.to) return false;
    if (f.type && m.type !== f.type) return false;
    if (f.owner && m.owner !== f.owner) return false;
    if (f.seriesId && m.seriesId !== f.seriesId) return false;
    if (f.stageId && !links.some((l) => stageOfLink(l, ctx) === f.stageId)) return false;
    if (f.activityRef && !touchesWork(links, { act: f.activityRef }, riskSteps)) return false;
    if (words.length) {
      const haystack = [
        m.title,
        m.purpose,
        m.minutes,
        m.owner,
        m.facilitator,
        m.location,
        ...m.attendees.map((a) => a.name),
        ...items.map((a) => `${a.title} ${a.notes}`),
      ]
        .join(' ')
        .toLowerCase();
      if (!words.every((w) => haystack.includes(w))) return false;
    }
    return true;
  });

  const dir = f.sort === 'oldest' ? 1 : -1;
  return kept.sort((a, b) => dir * (a.startsAt.getTime() - b.startsAt.getTime()));
}
