import { describe, expect, it } from 'vitest';
import { relatedToWork } from '@/lib/meetings/related';
import { action, agendaItem, decision, meeting } from './meetingFixtures';

const NOW = new Date(2026, 8, 13, 12, 0);
const TODAY = new Date(2026, 8, 13);
const day = (d: number, h = 9) => new Date(2026, 8, d, h);

const RISK_STEPS = { r1: { act: 'DFT-02', stepN: 4 } };

const input = {
  meetings: [
    meeting({ id: 'past', status: 'completed', startsAt: day(1), links: [{ type: 'activity', ref: 'DFT-02' }] }),
    meeting({ id: 'past-later', status: 'completed', startsAt: day(8) }),
    meeting({ id: 'cancelled', status: 'cancelled', startsAt: day(10), links: [{ type: 'activity', ref: 'DFT-02' }] }),
    meeting({ id: 'next', status: 'scheduled', startsAt: day(15), links: [{ type: 'risk', ref: 'r1' }] }),
    meeting({ id: 'after', status: 'scheduled', startsAt: day(22), links: [{ type: 'step', ref: 'DFT-02:1' }] }),
    meeting({ id: 'unrelated', status: 'scheduled', startsAt: day(16), links: [{ type: 'activity', ref: 'PD-02' }] }),
  ],
  /* past-later reaches the activity only through one of its agenda items */
  agenda: [agendaItem({ id: 'ag', meetingId: 'past-later', links: [{ type: 'step', ref: 'DFT-02:4' }] })],
  decisions: [
    decision({ id: 'direct', meetingId: 'past', links: [{ type: 'activity', ref: 'DFT-02' }] }),
    decision({ id: 'via-agenda', meetingId: 'past-later', agendaItemId: 'ag' }),
    decision({ id: 'elsewhere', meetingId: 'past', links: [{ type: 'activity', ref: 'PD-02' }] }),
  ],
  actions: [
    action({ id: 'late', meetingId: 'past', due: day(10), links: [{ type: 'step', ref: 'DFT-02:4' }] }),
    action({ id: 'blocked', meetingId: 'past', status: 'blocked', due: day(30), links: [{ type: 'activity', ref: 'DFT-02' }] }),
    action({ id: 'done', meetingId: 'past', status: 'done', links: [{ type: 'activity', ref: 'DFT-02' }] }),
    action({ id: 'converted', meetingId: 'past', due: day(28), convertedStep: { act: 'DFT-02', n: 9 } }),
    action({ id: 'other', meetingId: 'past', links: [{ type: 'activity', ref: 'PD-02' }] }),
  ],
  riskSteps: RISK_STEPS,
  now: NOW,
  today: TODAY,
};

describe('relatedToWork, for an activity', () => {
  const got = relatedToWork({ ...input, target: { act: 'DFT-02' } });

  it('lists the meetings ahead, soonest first, and never a cancelled one', () => {
    expect(got.upcoming.map((m) => m.id)).toEqual(['next', 'after']);
    expect(got.nextReview?.id).toBe('next');
  });

  it('lists completed meetings, latest first, including one that reached it through its agenda', () => {
    expect(got.recent.map((m) => m.id)).toEqual(['past-later', 'past']);
    expect(got.lastReviewed).toEqual(day(8));
  });

  it('reads decisions through their own links or the agenda item they came from', () => {
    expect(got.decisions.map((d) => d.id).sort()).toEqual(['direct', 'via-agenda']);
  });

  it('separates what is open, what is overdue and what is blocked', () => {
    expect(got.openActions.map((a) => a.id).sort()).toEqual(['blocked', 'converted', 'late']);
    expect(got.overdueActions.map((a) => a.id)).toEqual(['late']);
    expect(got.blocked.map((a) => a.id)).toEqual(['blocked']);
  });
});

describe('relatedToWork, for a step', () => {
  it('reads only what is about that step', () => {
    const got = relatedToWork({ ...input, target: { act: 'DFT-02', n: 4 } });
    expect(got.upcoming.map((m) => m.id)).toEqual(['next']);
    /* `past` is here because an action raised in it is about step 4 — raising
       it is discussing it — while its activity-wide link alone would not be */
    expect(got.recent.map((m) => m.id)).toEqual(['past-later', 'past']);
    expect(got.decisions.map((d) => d.id)).toEqual(['via-agenda']);
    expect(got.openActions.map((a) => a.id)).toEqual(['late']);
  });

  it('knows the step an action was converted into', () => {
    const got = relatedToWork({ ...input, target: { act: 'DFT-02', n: 9 } });
    expect(got.openActions.map((a) => a.id)).toEqual(['converted']);
  });
});
