import { describe, expect, it } from 'vitest';
import { countUpcoming, nextSittingOf, upcomingDigest } from '@/lib/meetings/digest';
import { action, agendaItem, decision, meeting } from './meetingFixtures';

const ME = 'Sangwook Park';
const NOW = new Date(2026, 8, 13, 8, 0);
const TODAY = new Date(2026, 8, 13);
const at = (d: number, h = 9) => new Date(2026, 8, d, h);

const base = {
  me: ME,
  now: NOW,
  today: TODAY,
  overdueSteps: ['PD-11:4'],
  openRisks: ['risk-pd'],
  riskSteps: { 'risk-pd': { act: 'PD-11', stepN: 4 } },
  horizonDays: 14,
};

const meetings = [
  meeting({ id: 'yesterday', startsAt: at(12), status: 'completed' }),
  meeting({ id: 'today', startsAt: at(13, 15), owner: 'Marco Bianchi' }),
  meeting({ id: 'tomorrow', startsAt: at(14), links: [{ type: 'activity', ref: 'PD-11' }] }),
  meeting({ id: 'cancelled', startsAt: at(15), status: 'cancelled' }),
  meeting({ id: 'draft', startsAt: at(20), status: 'draft' }),
  meeting({ id: 'far', startsAt: at(30) }),
];

describe('counting what is coming', () => {
  it('counts meetings from today on that are still to happen', () => {
    /* today, tomorrow, the draft and the one outside the horizon — not the
       completed one yesterday, nor the cancellation */
    expect(countUpcoming(meetings, TODAY)).toBe(4);
  });

  it('finds a series’ next sitting that has not happened yet', () => {
    const s = (id: string, d: number, over = {}) => meeting({ id, seriesId: 's1', startsAt: at(d), ...over });
    const list = [s('old', 6), s('gone', 14, { status: 'cancelled' }), s('next', 20), s('later', 27), meeting({ id: 'x', startsAt: at(15) })];
    expect(nextSittingOf('s1', list, TODAY)?.id).toBe('next');
    expect(nextSittingOf('s2', list, TODAY)).toBeNull();
  });
});

describe('upcomingDigest', () => {
  const got = upcomingDigest({
    ...base,
    meetings,
    agenda: [
      agendaItem({ id: 'prep-mine', meetingId: 'tomorrow', presenter: ME }),
      agendaItem({ id: 'prep-other', meetingId: 'tomorrow', presenter: 'Jiwoo Park', position: 1 }),
      agendaItem({ id: 'already', meetingId: 'tomorrow', status: 'discussed', position: 2 }),
      agendaItem({ id: 'risk-row', meetingId: 'draft', links: [{ type: 'risk', ref: 'risk-pd' }] }),
    ],
    actions: [
      action({ id: 'carried', meetingId: 'yesterday', carriedToMeetingId: 'tomorrow', owner: ME, due: at(10) }),
      action({ id: 'carried-done', meetingId: 'yesterday', carriedToMeetingId: 'tomorrow', status: 'done' }),
      action({ id: 'blocked', meetingId: 'yesterday', status: 'blocked', due: at(25) }),
    ],
    decisions: [decision({ status: 'proposed' }), decision({ id: 'd2' })],
  });

  it('looks a week ahead unless told otherwise', () => {
    const week = upcomingDigest({
      ...base,
      horizonDays: undefined,
      meetings: [meeting({ id: 'day7', startsAt: at(20) }), meeting({ id: 'day8', startsAt: at(21) })],
      agenda: [],
      actions: [],
      decisions: [],
    });
    expect(week.upcoming.map((m) => m.id)).toEqual(['day7']);
  });

  it('separates today from what is coming, inside the horizon, without cancellations', () => {
    expect(got.today.map((m) => m.id)).toEqual(['today']);
    expect(got.upcoming.map((m) => m.id)).toEqual(['tomorrow', 'draft']);
  });

  it('picks out the meetings I own', () => {
    expect(got.mine.map((m) => m.id)).toEqual(['tomorrow', 'draft']);
  });

  it('lists the agenda still to prepare, meeting by meeting', () => {
    expect(got.prep.map((p) => [p.meeting.id, p.items.map((i) => i.id)])).toEqual([
      ['tomorrow', ['prep-mine', 'prep-other']],
      ['draft', ['risk-row']],
    ]);
  });

  it('shows what was carried into a coming meeting and is still open', () => {
    expect(got.carriedOver.map((c) => [c.action.id, c.meeting.id])).toEqual([['carried', 'tomorrow']]);
  });

  it('flags coming meetings that are about late steps or open risks', () => {
    expect(got.alerts.map((a) => [a.meeting.id, a.kind])).toEqual([
      ['tomorrow', 'overdue'],
      ['tomorrow', 'risk'],
      ['draft', 'risk'],
    ]);
  });

  it('sums up the follow-up and what is waiting for a decision', () => {
    expect(got.summary).toEqual({ myOpen: 1, overdue: 1, blocked: 1, dueSoon: 0, awaitingDecisions: 1 });
    expect(got.awaiting.map((d) => d.id)).toEqual(['d1']);
  });
});
