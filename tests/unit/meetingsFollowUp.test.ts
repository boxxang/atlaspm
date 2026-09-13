import { describe, expect, it } from 'vitest';
import {
  actionSummary,
  actionTiming,
  actionWarnings,
  carryOverCandidates,
  filterActions,
  isActionOpen,
  nextInSeries,
  previousInSeries,
} from '@/lib/meetings/followUp';
import { action, meeting } from './meetingFixtures';

const TODAY = new Date(2026, 8, 13);
const ME = 'Sangwook Park';
const day = (d: number) => new Date(2026, 8, d);

describe('actionTiming', () => {
  it('says nothing about timing once an action is closed', () => {
    expect(actionTiming(action({ status: 'done', due: day(1) }), TODAY)).toBe('closed');
    expect(actionTiming(action({ status: 'cancelled', due: day(1) }), TODAY)).toBe('closed');
  });

  it('is overdue from the day after it was due', () => {
    expect(actionTiming(action({ due: day(12) }), TODAY)).toBe('overdue');
    expect(actionTiming(action({ due: day(13) }), TODAY)).toBe('due_soon');
  });

  it('is due soon inside three days, and on track after that', () => {
    expect(actionTiming(action({ due: day(16) }), TODAY)).toBe('due_soon');
    expect(actionTiming(action({ due: day(17) }), TODAY)).toBe('on_track');
  });

  it('has no timing without a date, and a blocked action still has one', () => {
    expect(actionTiming(action({ due: null }), TODAY)).toBe('no_due');
    expect(actionTiming(action({ status: 'blocked', due: day(10) }), TODAY)).toBe('overdue');
  });
});

describe('isActionOpen', () => {
  it('counts open, in progress and blocked as still to answer', () => {
    expect(['open', 'in_progress', 'blocked', 'done', 'cancelled'].map((s) =>
      isActionOpen(action({ status: s as never })),
    )).toEqual([true, true, true, false, false]);
  });
});

describe('actionSummary', () => {
  it('counts only what is still open', () => {
    const got = actionSummary(
      [
        action({ id: '1', owner: ME, due: day(10) }),
        action({ id: '2', owner: ME, status: 'blocked', due: day(20) }),
        action({ id: '3', owner: 'Tarek Haddad', due: day(14) }),
        action({ id: '4', owner: ME, status: 'done', due: day(1) }),
      ],
      ME,
      TODAY,
    );
    expect(got).toEqual({ myOpen: 2, overdue: 1, blocked: 1, dueSoon: 1 });
  });
});

describe('filterActions', () => {
  const list = [
    action({ id: 'late-normal', due: day(10), priority: 'normal' }),
    action({ id: 'later-critical', due: day(25), priority: 'critical', owner: ME }),
    action({ id: 'latest', due: day(1), priority: 'low' }),
    action({ id: 'blocked', status: 'blocked', due: day(30), priority: 'high', owner: ME }),
    action({ id: 'undated', due: null, priority: 'critical' }),
    action({ id: 'done', status: 'done', due: day(2), owner: ME }),
  ];

  it('puts the most overdue first, then by priority, then by date', () => {
    expect(filterActions(list, {}, ME, TODAY).map((a) => a.id)).toEqual([
      'latest',
      'late-normal',
      'undated',
      'later-critical',
      'blocked',
      'done',
    ]);
  });

  it('narrows to mine, to overdue and to blocked, all of them open', () => {
    expect(filterActions(list, { view: 'mine' }, ME, TODAY).map((a) => a.id)).toEqual([
      'later-critical',
      'blocked',
    ]);
    expect(filterActions(list, { view: 'overdue' }, ME, TODAY).map((a) => a.id)).toEqual([
      'latest',
      'late-normal',
    ]);
    expect(filterActions(list, { view: 'blocked' }, ME, TODAY).map((a) => a.id)).toEqual(['blocked']);
  });

  it('filters by owner, status, priority and timing', () => {
    expect(filterActions(list, { owner: ME }, ME, TODAY).map((a) => a.id)).toEqual([
      'later-critical',
      'blocked',
      'done',
    ]);
    expect(filterActions(list, { status: 'done' }, ME, TODAY).map((a) => a.id)).toEqual(['done']);
    expect(filterActions(list, { priority: 'critical' }, ME, TODAY).map((a) => a.id)).toEqual([
      'undated',
      'later-critical',
    ]);
    expect(filterActions(list, { timing: 'no_due' }, ME, TODAY).map((a) => a.id)).toEqual(['undated']);
  });
});

describe('actionWarnings', () => {
  it('asks for an accountable owner and a date on anything still open', () => {
    expect(actionWarnings(action({ owner: '', due: null }))).toEqual([
      'No accountable owner',
      'No due date',
    ]);
    expect(actionWarnings(action({ owner: '  ' }))).toEqual(['No accountable owner']);
  });

  it('does not nag about a closed action', () => {
    expect(actionWarnings(action({ owner: '', due: null, status: 'done' }))).toEqual([]);
  });
});

describe('carry-over', () => {
  it('offers the open actions raised here, and the ones carried in that are still open', () => {
    const got = carryOverCandidates('m1', [
      action({ id: 'raised-open' }),
      action({ id: 'raised-done', status: 'done' }),
      action({ id: 'already-carried-on', carriedToMeetingId: 'm2' }),
      action({ id: 'carried-in', meetingId: 'm0', carriedToMeetingId: 'm1' }),
      action({ id: 'other-meeting', meetingId: 'm9' }),
    ]);
    expect(got.map((a) => a.id)).toEqual(['raised-open', 'carried-in']);
  });

  it('finds the sittings either side in the same series, skipping cancelled ones', () => {
    const s = (id: string, d: number, over = {}) =>
      meeting({ id, seriesId: 's1', startsAt: day(d), endsAt: day(d), ...over });
    const all = [
      s('w1', 1),
      s('w2', 8, { status: 'cancelled' }),
      s('w3', 15),
      s('w4', 22, { status: 'cancelled' }),
      s('w5', 29),
      meeting({ id: 'other', seriesId: 's2', startsAt: day(16) }),
    ];
    expect(nextInSeries(all[2], all)?.id).toBe('w5');
    expect(previousInSeries(all[2], all)?.id).toBe('w1');
    expect(nextInSeries(all[4], all)).toBeNull();
    expect(nextInSeries(meeting({ seriesId: null }), all)).toBeNull();
  });
});
