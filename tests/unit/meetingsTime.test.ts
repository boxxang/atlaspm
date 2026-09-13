import { describe, expect, it } from 'vitest';
import {
  addMinutesToTime,
  minutesBetweenTimes,
  fmtZonedDate,
  fmtZonedTime,
  tzLabel,
  zonedDayKey,
  zonedParts,
  zonedToUtc,
} from '@/lib/meetings/zonedTime';

/**
 * A meeting is at a wall-clock time in a room somewhere. Nine o'clock in San
 * Jose is 16:00 UTC in September and 17:00 UTC in November, and a meeting that
 * silently moved to eight when the clocks changed would be a bug nobody could
 * see from the database.
 */
describe('zonedToUtc', () => {
  it('reads a wall-clock time in Los Angeles during daylight time', () => {
    expect(zonedToUtc('2026-09-15', '09:00', 'America/Los_Angeles').toISOString()).toBe(
      '2026-09-15T16:00:00.000Z',
    );
  });

  it('reads the same wall-clock time after the clocks go back', () => {
    expect(zonedToUtc('2026-11-10', '09:00', 'America/Los_Angeles').toISOString()).toBe(
      '2026-11-10T17:00:00.000Z',
    );
  });

  it('reads Seoul, which keeps no daylight time', () => {
    expect(zonedToUtc('2026-09-15', '09:00', 'Asia/Seoul').toISOString()).toBe(
      '2026-09-15T00:00:00.000Z',
    );
  });

  it('lands on the previous UTC day for a morning in a zone ahead of UTC', () => {
    expect(zonedToUtc('2026-09-15', '08:30', 'Asia/Seoul').toISOString()).toBe(
      '2026-09-14T23:30:00.000Z',
    );
  });

  it('treats UTC as UTC', () => {
    expect(zonedToUtc('2026-01-02', '23:45', 'UTC').toISOString()).toBe('2026-01-02T23:45:00.000Z');
  });
});

describe('wall-clock arithmetic', () => {
  it('adds minutes to a time of day', () => {
    expect(addMinutesToTime('09:30', 45)).toBe('10:15');
    expect(addMinutesToTime('09:00', 90)).toBe('10:30');
  });

  it('wraps past midnight rather than printing a twenty-fifth hour', () => {
    expect(addMinutesToTime('23:30', 60)).toBe('00:30');
  });

  it('measures a sitting in minutes, negative when it would end before it starts', () => {
    expect(minutesBetweenTimes('09:00', '10:30')).toBe(90);
    expect(minutesBetweenTimes('10:00', '09:00')).toBe(-60);
    expect(minutesBetweenTimes('', '09:00')).toBe(0);
  });
});

describe('reading an instant in the meeting’s zone', () => {
  const at = new Date('2026-09-15T16:00:00.000Z');

  it('prints the date as MM/DD/YYYY in that zone', () => {
    expect(fmtZonedDate(at, 'America/Los_Angeles')).toBe('09/15/2026');
    expect(fmtZonedDate(at, 'Asia/Seoul')).toBe('09/16/2026');
  });

  it('prints a 24-hour time in that zone', () => {
    expect(fmtZonedTime(at, 'America/Los_Angeles')).toBe('09:00');
    expect(fmtZonedTime(at, 'Asia/Seoul')).toBe('01:00');
  });

  it('keys the calendar day in that zone', () => {
    expect(zonedDayKey(at, 'America/Los_Angeles')).toBe('2026-09-15');
    expect(zonedDayKey(at, 'Asia/Seoul')).toBe('2026-09-16');
  });

  it('knows the weekday there', () => {
    expect(zonedParts(at, 'America/Los_Angeles').weekday).toBe(2);
    expect(zonedParts(at, 'Asia/Seoul').weekday).toBe(3);
  });

  it('names the zone briefly', () => {
    expect(tzLabel(at, 'America/Los_Angeles')).toBe('PDT');
    expect(tzLabel(new Date('2026-12-01T16:00:00Z'), 'America/Los_Angeles')).toBe('PST');
    expect(tzLabel(at, 'UTC')).toBe('UTC');
  });

  it('falls back to UTC for a zone it does not know rather than throwing', () => {
    expect(fmtZonedTime(at, 'Mars/Olympus_Mons')).toBe('16:00');
  });
});
