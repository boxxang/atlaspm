/**
 * /lib/meetings/zonedTime.ts — wall-clock times in a named time zone.
 *
 * A meeting is at nine o'clock somewhere. The instant is stored, and the zone
 * beside it, because "nine in San Jose" is 16:00 UTC in September and 17:00 in
 * November; a meeting stored as a UTC time and read back in the viewer's zone
 * would drift an hour twice a year and sit on the wrong day for anyone abroad.
 *
 * Built on Intl alone. Dates still print through the one shared formatter in
 * /lib/schedule — the zone decides which day and hour it is, not how they look.
 *
 * Pure: no DOM, no clock.
 */
import { fmtDate, fmtTime } from '@/lib/schedule';

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 0 = Sunday. */
  weekday: number;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const p2 = (n: number) => String(n).padStart(2, '0');

const known = new Map<string, boolean>();
/** A zone Intl does not know is read as UTC rather than taking the page down. */
export function safeZone(timeZone: string): string {
  if (!timeZone) return 'UTC';
  let ok = known.get(timeZone);
  if (ok === undefined) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone });
      ok = true;
    } catch {
      ok = false;
    }
    known.set(timeZone, ok);
  }
  return ok ? timeZone : 'UTC';
}

const formatters = new Map<string, Intl.DateTimeFormat>();
const partsFormatter = (timeZone: string) => {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hourCycle: 'h23',
    });
    formatters.set(timeZone, f);
  }
  return f;
};

export function zonedParts(at: Date, timeZone: string): ZonedParts {
  const parts = partsFormatter(safeZone(timeZone)).formatToParts(at);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '0';
  const hour = Number(get('hour'));
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: hour === 24 ? 0 : hour,
    minute: Number(get('minute')),
    weekday: WEEKDAY_NAMES.indexOf(get('weekday')),
  };
}

/** How far the zone's wall clock is ahead of UTC at that instant, in ms. */
function offsetAt(at: number, timeZone: string): number {
  const minute = Math.floor(at / 60000) * 60000;
  const p = zonedParts(new Date(minute), timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - minute;
}

/**
 * The instant a wall-clock time names in a zone.
 *
 * Two passes: the offset is read once at a guess and again at the answer,
 * which is enough to land on the right side of a daylight-saving change.
 */
export function zonedToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi] = (time || '00:00').split(':').map(Number);
  const zone = safeZone(timeZone);
  const wall = Date.UTC(y, (m || 1) - 1, d || 1, h || 0, mi || 0);
  const guess = wall - offsetAt(wall, zone);
  return new Date(wall - offsetAt(guess, zone));
}

/** `YYYY-MM-DD` of the day it is there — what a date input and the calendar key on. */
export const zonedDayKey = (at: Date, timeZone: string): string => {
  const p = zonedParts(at, timeZone);
  return `${p.year}-${p2(p.month)}-${p2(p.day)}`;
};

/** MM/DD/YYYY, through the shared formatter, on the day it is there. */
export const fmtZonedDate = (at: Date, timeZone: string): string => {
  const p = zonedParts(at, timeZone);
  return fmtDate(new Date(p.year, p.month - 1, p.day));
};

/** HH:MM, 24-hour, as the clock in the room reads. */
export const fmtZonedTime = (at: Date, timeZone: string): string => {
  const p = zonedParts(at, timeZone);
  return fmtTime(new Date(2000, 0, 1, p.hour, p.minute));
};

/** "PDT", "UTC", "GMT+9" — short enough to sit after a time. */
export function tzLabel(at: Date, timeZone: string): string {
  const zone = safeZone(timeZone);
  const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? zone;
}

const TIME_OF_DAY = /^(\d{1,2}):(\d{2})$/;
const minutesOfDay = (time: string): number | null => {
  const m = TIME_OF_DAY.exec(time ?? '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/** "09:30" plus 45 minutes is "10:15"; past midnight it wraps to the next day's clock. */
export const addMinutesToTime = (time: string, minutes: number): string => {
  const total = ((((minutesOfDay(time) ?? 0) + Math.round(minutes)) % 1440) + 1440) % 1440;
  return `${p2(Math.floor(total / 60))}:${p2(total % 60)}`;
};

/** How long from one time of day to another, in minutes; 0 when either is not a time. */
export const minutesBetweenTimes = (from: string, to: string): number => {
  const a = minutesOfDay(from);
  const b = minutesOfDay(to);
  return a == null || b == null ? 0 : b - a;
};

/** The zones the pickers offer first. Any IANA name is accepted. */
export const COMMON_TIME_ZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Jerusalem',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Taipei',
  'Asia/Seoul',
  'Asia/Tokyo',
] as const;
