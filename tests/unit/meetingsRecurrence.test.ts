import { describe, expect, it } from 'vitest';
import { describeRule, nextOccurrences } from '@/lib/meetings/recurrence';
import type { RecurrenceRule } from '@/lib/meetings/types';

const LA = 'America/Los_Angeles';
const iso = (ds: Date[]) => ds.map((d) => d.toISOString());

const rule = (over: Partial<RecurrenceRule> = {}): RecurrenceRule => ({
  freq: 'weekly',
  interval: 1,
  weekdays: [2],
  monthDay: null,
  startDate: '2026-09-01',
  time: '09:00',
  until: null,
  ...over,
});

describe('nextOccurrences', () => {
  it('lists the next Tuesdays at nine, local time', () => {
    expect(iso(nextOccurrences(rule(), LA, new Date('2026-09-13T00:00:00Z'), 3))).toEqual([
      '2026-09-15T16:00:00.000Z',
      '2026-09-22T16:00:00.000Z',
      '2026-09-29T16:00:00.000Z',
    ]);
  });

  it('keeps nine o’clock across the change back from daylight time', () => {
    expect(iso(nextOccurrences(rule(), LA, new Date('2026-10-25T00:00:00Z'), 2))).toEqual([
      '2026-10-27T16:00:00.000Z',
      '2026-11-03T17:00:00.000Z',
    ]);
  });

  it('is strictly after the instant given, so the sitting already held is not offered again', () => {
    expect(iso(nextOccurrences(rule(), LA, new Date('2026-09-15T16:00:00Z'), 1))).toEqual([
      '2026-09-22T16:00:00.000Z',
    ]);
  });

  it('skips the weeks between when it meets every other week', () => {
    expect(
      iso(nextOccurrences(rule({ interval: 2 }), LA, new Date('2026-09-02T00:00:00Z'), 2)),
    ).toEqual(['2026-09-15T16:00:00.000Z', '2026-09-29T16:00:00.000Z']);
  });

  it('meets on several days of the week', () => {
    expect(
      iso(
        nextOccurrences(
          rule({ weekdays: [1, 3, 5], startDate: '2026-09-14' }),
          LA,
          new Date('2026-09-13T00:00:00Z'),
          4,
        ),
      ),
    ).toEqual([
      '2026-09-14T16:00:00.000Z',
      '2026-09-16T16:00:00.000Z',
      '2026-09-18T16:00:00.000Z',
      '2026-09-21T16:00:00.000Z',
    ]);
  });

  it('meets daily on weekdays and not at the weekend', () => {
    expect(
      iso(
        nextOccurrences(
          rule({ freq: 'daily', weekdays: [1, 2, 3, 4, 5], startDate: '2026-09-11' }),
          LA,
          new Date('2026-09-11T00:00:00Z'),
          3,
        ),
      ),
    ).toEqual(['2026-09-11T16:00:00.000Z', '2026-09-14T16:00:00.000Z', '2026-09-15T16:00:00.000Z']);
  });

  it('lands on the same day of the month', () => {
    expect(
      iso(
        nextOccurrences(
          rule({ freq: 'monthly', weekdays: [], monthDay: 15 }),
          LA,
          new Date('2026-09-13T00:00:00Z'),
          3,
        ),
      ),
    ).toEqual(['2026-09-15T16:00:00.000Z', '2026-10-15T16:00:00.000Z', '2026-11-15T17:00:00.000Z']);
  });

  it('stops at its last day', () => {
    expect(
      iso(nextOccurrences(rule({ until: '2026-09-22' }), LA, new Date('2026-09-13T00:00:00Z'), 5)),
    ).toEqual(['2026-09-15T16:00:00.000Z', '2026-09-22T16:00:00.000Z']);
  });

  it('never meets before it starts', () => {
    expect(
      iso(nextOccurrences(rule({ startDate: '2026-10-01' }), LA, new Date('2026-09-13T00:00:00Z'), 1)),
    ).toEqual(['2026-10-06T16:00:00.000Z']);
  });

  it('offers nothing for a series that meets on demand', () => {
    expect(nextOccurrences(rule({ freq: 'none' }), LA, new Date('2026-09-13T00:00:00Z'), 3)).toEqual([]);
  });

  it('meets on the start date’s weekday when a weekly rule names none', () => {
    expect(
      iso(nextOccurrences(rule({ weekdays: [] }), LA, new Date('2026-09-13T00:00:00Z'), 1)),
    ).toEqual(['2026-09-15T16:00:00.000Z']);
  });
});

describe('describeRule', () => {
  it('says it the way a calendar invite does', () => {
    expect(describeRule(rule())).toBe('Weekly on Tue at 09:00');
    expect(describeRule(rule({ interval: 2 }))).toBe('Every 2 weeks on Tue at 09:00');
    expect(describeRule(rule({ weekdays: [1, 3] }))).toBe('Weekly on Mon, Wed at 09:00');
    expect(describeRule(rule({ freq: 'daily', weekdays: [1, 2, 3, 4, 5] }))).toBe(
      'Every weekday at 09:00',
    );
    expect(describeRule(rule({ freq: 'daily', weekdays: [] }))).toBe('Daily at 09:00');
    expect(describeRule(rule({ freq: 'monthly', monthDay: 15 }))).toBe('Monthly on day 15 at 09:00');
    expect(describeRule(rule({ freq: 'none' }))).toBe('On demand');
  });
});
