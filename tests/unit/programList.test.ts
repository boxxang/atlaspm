import { describe, expect, it } from 'vitest';
import { listPrograms, matches, sortRows, type ListRow } from '@/lib/programList';

const row = (over: Partial<ListRow> & { id: string }): ListRow => ({
  name: over.id.toUpperCase(),
  kickoff: new Date(2026, 0, 1),
  tapeout: new Date(2027, 0, 1),
  openRisks: 0,
  staleRisks: 0,
  overdue: 0,
  progressPct: 0,
  inFlight: [],
  ...over,
});

describe('ordering the programs list', () => {
  it('puts the nearest mask order first by default', () => {
    const rows = [
      row({ id: 'c', tapeout: new Date(2028, 0, 1) }),
      row({ id: 'a', tapeout: new Date(2026, 5, 1) }),
      row({ id: 'b', tapeout: new Date(2027, 0, 1) }),
    ];
    expect(sortRows(rows, 'tapeout').map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by name, by least done, and by most of what is wrong', () => {
    const rows = [
      row({ id: 'b', progressPct: 80, openRisks: 1, overdue: 9 }),
      row({ id: 'a', progressPct: 10, openRisks: 7, overdue: 0 }),
      row({ id: 'c', progressPct: 50, openRisks: 3, overdue: 4 }),
    ];
    expect(sortRows(rows, 'name').map((r) => r.id)).toEqual(['a', 'b', 'c']);
    expect(sortRows(rows, 'progress').map((r) => r.id)).toEqual(['a', 'c', 'b']);
    expect(sortRows(rows, 'risks').map((r) => r.id)).toEqual(['a', 'c', 'b']);
    expect(sortRows(rows, 'late').map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });

  it('puts the most recently started first when asked for newest', () => {
    const rows = [
      row({ id: 'old', kickoff: new Date(2024, 0, 1) }),
      row({ id: 'new', kickoff: new Date(2027, 0, 1) }),
    ];
    expect(sortRows(rows, 'kickoff').map((r) => r.id)).toEqual(['new', 'old']);
  });

  /* A column full of zeros still has to come out in an order somebody can
     remember, rather than whatever order it arrived in. */
  it('breaks ties the same way every time', () => {
    const rows = [
      row({ id: 'z', tapeout: new Date(2027, 0, 1) }),
      row({ id: 'a', tapeout: new Date(2027, 0, 1) }),
    ];
    expect(sortRows(rows, 'risks').map((r) => r.id)).toEqual(['a', 'z']);
    expect(sortRows(rows, 'late').map((r) => r.id)).toEqual(['a', 'z']);
  });

  it('leaves the list it was given alone', () => {
    const rows = [row({ id: 'b' }), row({ id: 'a' })];
    sortRows(rows, 'name');
    expect(rows.map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('narrowing the programs list', () => {
  const clean = row({ id: 'clean' });
  const risky = row({ id: 'risky', openRisks: 2 });
  const quiet = row({ id: 'quiet', openRisks: 2, staleRisks: 1 });
  const slipping = row({ id: 'slipping', overdue: 3 });
  const running = row({ id: 'running', inFlight: ['physicalDesign'] });

  it('keeps everything under All', () => {
    for (const r of [clean, risky, quiet, slipping, running]) {
      expect(matches(r, 'all')).toBe(true);
    }
  });

  it('answers each of the questions the toolbar asks', () => {
    expect(matches(risky, 'risks')).toBe(true);
    expect(matches(clean, 'risks')).toBe(false);
    /* a risk nobody has answered is a narrower question than a risk */
    expect(matches(quiet, 'stale')).toBe(true);
    expect(matches(risky, 'stale')).toBe(false);
    expect(matches(slipping, 'late')).toBe(true);
    expect(matches(clean, 'late')).toBe(false);
    expect(matches(running, 'running')).toBe(true);
    expect(matches(clean, 'running')).toBe(false);
  });

  it('narrows and orders in one go', () => {
    const rows = [
      row({ id: 'a', openRisks: 1, tapeout: new Date(2028, 0, 1) }),
      row({ id: 'b', openRisks: 0, tapeout: new Date(2026, 0, 1) }),
      row({ id: 'c', openRisks: 5, tapeout: new Date(2027, 0, 1) }),
    ];
    expect(listPrograms(rows, 'risks', 'tapeout').map((r) => r.id)).toEqual(['c', 'a']);
    expect(listPrograms(rows, 'risks', 'risks').map((r) => r.id)).toEqual(['c', 'a']);
    expect(listPrograms(rows, 'all', 'tapeout').map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });
});
