/**
 * /lib/meetings/calendar.ts — calendar days as keys.
 *
 * The calendar works in `YYYY-MM-DD` strings rather than Dates. A Date is an
 * instant, and a grid of instants built in one zone and read in another moves
 * a whole column; a key is the day on the wall, and it compares and sorts as a
 * string. Arithmetic happens in UTC, where no day is 23 hours long.
 *
 * Pure: no DOM, no clock.
 */
import { fmtDate } from '@/lib/schedule';

const p2 = (n: number) => String(n).padStart(2, '0');

/** The 1st of the month `months` away — where a month view lands when paged. */
export const addMonthsKey = (key: string, months: number): string => {
  const [y, m] = parseKey(key);
  const t = new Date(Date.UTC(y, m - 1 + months, 1));
  return keyOf(t.getUTCFullYear(), t.getUTCMonth(), 1);
};

/** MM/DD/YYYY, through the app's one date formatter. */
export const fmtDayKey = (key: string): string => {
  const [y, m, d] = parseKey(key);
  return fmtDate(new Date(y, m - 1, d));
};

export const keyOf = (year: number, month0: number, day: number): string =>
  `${year}-${p2(month0 + 1)}-${p2(day)}`;

export const parseKey = (key: string): [year: number, month: number, day: number] => {
  const [y, m, d] = key.split('-').map(Number);
  return [y, m, d];
};

const utcOf = (key: string) => {
  const [y, m, d] = parseKey(key);
  return Date.UTC(y, m - 1, d);
};

export const addDaysKey = (key: string, days: number): string => {
  const t = new Date(utcOf(key) + days * 864e5);
  return keyOf(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
};

/** 0 = Sunday. */
export const weekdayOfKey = (key: string): number => new Date(utcOf(key)).getUTCDay();

export const daysBetweenKeys = (from: string, to: string): number =>
  Math.round((utcOf(to) - utcOf(from)) / 864e5);

export const daysInMonth = (year: number, month0: number): number =>
  new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();

/** The day a local Date is on, as the viewer's wall reads it. */
export const keyOfLocal = (d: Date): string => keyOf(d.getFullYear(), d.getMonth(), d.getDate());

/** A month as whole weeks, Sunday first, padded with the neighbouring months' days. */
export function monthGrid(year: number, month0: number): string[][] {
  const first = keyOf(year, month0, 1);
  const last = keyOf(year, month0, daysInMonth(year, month0));
  const end = addDaysKey(last, 6 - weekdayOfKey(last));
  const weeks: string[][] = [];
  for (let key = addDaysKey(first, -weekdayOfKey(first)); key <= end; key = addDaysKey(key, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDaysKey(key, i)));
  }
  return weeks;
}

/** The seven days of the week a day falls in, Sunday first. */
export const weekOf = (key: string): string[] => {
  const start = addDaysKey(key, -weekdayOfKey(key));
  return Array.from({ length: 7 }, (_, i) => addDaysKey(start, i));
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const monthLabel = (year: number, month0: number): string => `${MONTHS[month0]} ${year}`;

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
