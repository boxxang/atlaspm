/**
 * /lib/meetings/recurrence.ts — when a series meets.
 *
 * Deliberately small: daily, weekly on chosen days, or monthly on a day of the
 * month, every n of them, from a start date to an optional last one. That is
 * what programme meetings actually do. Exceptions, "second Tuesday" and the
 * rest of RFC 5545 are left out rather than half-built; a sitting that moves is
 * edited as the sitting it is.
 *
 * Nothing here creates meetings. A series says when it would meet; somebody
 * schedules the sittings, which is when they become rows with agendas.
 *
 * Pure: no DOM, no clock — "after" is always passed in.
 */
import {
  addDaysKey,
  daysBetweenKeys,
  daysInMonth,
  parseKey,
  weekdayOfKey,
  WEEKDAY_SHORT,
} from './calendar';
import type { Frequency, RecurrenceRule } from './types';
import { zonedDayKey, zonedToUtc } from './zonedTime';

/** How far ahead to look for the next sitting before giving up. */
const SEARCH_DAYS = 366 * 3;

const FREQUENCIES: readonly Frequency[] = ['none', 'daily', 'weekly', 'monthly'];
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

/** A weekly rule on the start date's weekday — what "New series" starts from. */
export const defaultRule = (startDate: string): RecurrenceRule => ({
  freq: 'weekly',
  interval: 1,
  weekdays: [weekdayOfKey(startDate)],
  monthDay: null,
  startDate,
  time: '09:00',
  until: null,
});

/** A stored rule read back, with anything malformed replaced by the default. */
export function readRule(raw: unknown, fallbackStart: string): RecurrenceRule {
  const base = defaultRule(fallbackStart);
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<RecurrenceRule>;
  const startDate = typeof r.startDate === 'string' && DAY_KEY.test(r.startDate) ? r.startDate : base.startDate;
  return {
    freq: FREQUENCIES.includes(r.freq as Frequency) ? (r.freq as Frequency) : base.freq,
    interval: Number.isFinite(r.interval) && (r.interval as number) >= 1 ? Math.floor(r.interval as number) : 1,
    weekdays: Array.isArray(r.weekdays)
      ? [...new Set(r.weekdays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b)
      : base.weekdays,
    monthDay:
      Number.isInteger(r.monthDay) && (r.monthDay as number) >= 1 && (r.monthDay as number) <= 31
        ? (r.monthDay as number)
        : null,
    startDate,
    time: typeof r.time === 'string' && TIME.test(r.time) ? r.time : base.time,
    until: typeof r.until === 'string' && DAY_KEY.test(r.until) ? r.until : null,
  };
}

/** Whether the series meets on this calendar day, in its own zone. */
export function meetsOn(rule: RecurrenceRule, key: string): boolean {
  if (rule.freq === 'none') return false;
  if (key < rule.startDate) return false;
  if (rule.until && key > rule.until) return false;
  const interval = Math.max(1, Math.floor(rule.interval || 1));
  const weekday = weekdayOfKey(key);

  switch (rule.freq) {
    case 'daily':
      if (daysBetweenKeys(rule.startDate, key) % interval !== 0) return false;
      return rule.weekdays.length === 0 || rule.weekdays.includes(weekday);
    case 'weekly': {
      const days = rule.weekdays.length ? rule.weekdays : [weekdayOfKey(rule.startDate)];
      if (!days.includes(weekday)) return false;
      /* weeks counted from the Sunday of the start date's week, so "every other
         Tuesday" and "every other Thursday" in one rule stay in step */
      const firstSunday = addDaysKey(rule.startDate, -weekdayOfKey(rule.startDate));
      return Math.floor(daysBetweenKeys(firstSunday, key) / 7) % interval === 0;
    }
    case 'monthly': {
      const [sy, sm, sd] = parseKey(rule.startDate);
      const [y, m, d] = parseKey(key);
      if (((y - sy) * 12 + (m - sm)) % interval !== 0) return false;
      /* the 31st in a 30-day month meets on the 30th rather than not at all */
      return d === Math.min(rule.monthDay ?? sd, daysInMonth(y, m - 1));
    }
  }
}

/** The next `count` sittings strictly after `after`, as instants. */
export function nextOccurrences(
  rule: RecurrenceRule,
  timeZone: string,
  after: Date,
  count: number,
): Date[] {
  if (rule.freq === 'none' || count <= 0) return [];
  const out: Date[] = [];
  /* a day early, because the zone's day and the UTC day can differ */
  const from = addDaysKey(zonedDayKey(after, timeZone), -1);
  let key = from > rule.startDate ? from : rule.startDate;
  for (let i = 0; i < SEARCH_DAYS && out.length < count; i++, key = addDaysKey(key, 1)) {
    if (rule.until && key > rule.until) break;
    if (!meetsOn(rule, key)) continue;
    const at = zonedToUtc(key, rule.time, timeZone);
    if (at.getTime() > after.getTime()) out.push(at);
  }
  return out;
}

const dayList = (days: readonly number[]) =>
  [...days]
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_SHORT[d])
    .join(', ');

/** The rule in the words a calendar invite uses. */
export function describeRule(rule: RecurrenceRule): string {
  if (rule.freq === 'none') return 'On demand';
  const n = Math.max(1, Math.floor(rule.interval || 1));
  const at = ` at ${rule.time}`;

  if (rule.freq === 'daily') {
    const weekdaysOnly =
      rule.weekdays.length === 5 && [1, 2, 3, 4, 5].every((d) => rule.weekdays.includes(d));
    if (weekdaysOnly) return (n === 1 ? 'Every weekday' : `Every ${n} days on weekdays`) + at;
    const on = rule.weekdays.length ? ` on ${dayList(rule.weekdays)}` : '';
    return (n === 1 ? 'Daily' : `Every ${n} days`) + on + at;
  }
  if (rule.freq === 'weekly') {
    const days = rule.weekdays.length ? rule.weekdays : [weekdayOfKey(rule.startDate)];
    return (n === 1 ? 'Weekly' : `Every ${n} weeks`) + ` on ${dayList(days)}` + at;
  }
  const day = rule.monthDay ?? parseKey(rule.startDate)[2];
  return (n === 1 ? 'Monthly' : `Every ${n} months`) + ` on day ${day}` + at;
}
