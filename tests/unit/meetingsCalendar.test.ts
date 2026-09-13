import { describe, expect, it } from 'vitest';
import {
  addDaysKey,
  addMonthsKey,
  fmtDayKey,
  keyOfLocal,
  monthGrid,
  monthLabel,
  weekOf,
} from '@/lib/meetings/calendar';

describe('moving the calendar', () => {
  it('steps by whole months, landing on the 1st', () => {
    expect(addMonthsKey('2026-09-16', 1)).toBe('2026-10-01');
    expect(addMonthsKey('2026-01-31', -1)).toBe('2025-12-01');
    expect(addMonthsKey('2026-12-05', 1)).toBe('2027-01-01');
  });

  it('prints a day through the shared date formatter', () => {
    expect(fmtDayKey('2026-09-16')).toBe('09/16/2026');
  });
});

describe('monthGrid', () => {
  it('fills whole weeks from the Sunday before the 1st to the Saturday after the last day', () => {
    const weeks = monthGrid(2026, 8);
    expect(weeks).toHaveLength(5);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0][0]).toBe('2026-08-30');
    expect(weeks[4][6]).toBe('2026-10-03');
  });

  it('adds a sixth week when the month needs it', () => {
    /* August 2026 starts on a Saturday and has 31 days */
    expect(monthGrid(2026, 7)).toHaveLength(6);
  });
});

describe('day keys', () => {
  it('walks across a month end and a year end', () => {
    expect(addDaysKey('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDaysKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysKey('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('reads a local date as the day it is on the wall', () => {
    expect(keyOfLocal(new Date(2026, 8, 13, 23, 59))).toBe('2026-09-13');
  });

  it('gives the week a day falls in, Sunday first', () => {
    expect(weekOf('2026-09-16')).toEqual([
      '2026-09-13',
      '2026-09-14',
      '2026-09-15',
      '2026-09-16',
      '2026-09-17',
      '2026-09-18',
      '2026-09-19',
    ]);
  });

  it('names the month in English', () => {
    expect(monthLabel(2026, 8)).toBe('September 2026');
  });
});
