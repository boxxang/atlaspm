/**
 * Ordering and narrowing the programs list.
 *
 * The list is where a TPM holding several tape-outs starts the day, so the
 * default is the one closest to its mask order and the questions it answers are
 * the ones asked at that hour: which of these has a risk nobody has touched,
 * which is running late, which have I not started yet.
 *
 * Both work on figures already computed for the row, so a program's position in
 * the list and the numbers printed on it cannot disagree.
 */
export interface ListRow {
  id: string;
  name: string;
  kickoff: Date;
  tapeout: Date;
  openRisks: number;
  staleRisks: number;
  overdue: number;
  progressPct: number;
  /** Stages running today; empty before kickoff and after the last stage. */
  inFlight: readonly string[];
}

export type SortKey = 'tapeout' | 'name' | 'progress' | 'risks' | 'late' | 'kickoff';
export type FilterKey = 'all' | 'risks' | 'late' | 'stale' | 'running';

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'tapeout', label: 'Tapeout' },
  { key: 'name', label: 'Name' },
  { key: 'progress', label: 'Least done' },
  { key: 'risks', label: 'Open risks' },
  { key: 'late', label: 'Late steps' },
  { key: 'kickoff', label: 'Newest' },
];

export const FILTERS: { key: FilterKey; label: string; hint: string }[] = [
  { key: 'all', label: 'All programs', hint: 'Everything, in the chosen order' },
  { key: 'risks', label: 'With open risks', hint: 'Something is flagged on a step still running' },
  { key: 'stale', label: 'Risks going quiet', hint: 'A flagged step nobody has answered in a week' },
  { key: 'late', label: 'With late steps', hint: 'A step is past its date with nothing handed over' },
  { key: 'running', label: 'In flight now', hint: 'Kicked off, and not finished' },
];

export const matches = (r: ListRow, k: FilterKey): boolean => {
  if (k === 'risks') return r.openRisks > 0;
  if (k === 'stale') return r.staleRisks > 0;
  if (k === 'late') return r.overdue > 0;
  if (k === 'running') return r.inFlight.length > 0;
  return true;
};

/**
 * Sorted, and stable: ties fall back to the tapeout date and then to the name,
 * so a list ordered by a column full of zeros still has an order somebody can
 * remember, rather than whatever the database happened to return.
 */
export function sortRows(rows: readonly ListRow[], key: SortKey): ListRow[] {
  const soonest = (a: ListRow, b: ListRow) =>
    a.tapeout.getTime() - b.tapeout.getTime() || a.name.localeCompare(b.name);

  const by: Record<SortKey, (a: ListRow, b: ListRow) => number> = {
    tapeout: soonest,
    name: (a, b) => a.name.localeCompare(b.name),
    /* least done first: the one furthest from finished is the one to look at */
    progress: (a, b) => a.progressPct - b.progressPct || soonest(a, b),
    risks: (a, b) => b.openRisks - a.openRisks || soonest(a, b),
    late: (a, b) => b.overdue - a.overdue || soonest(a, b),
    /* newest first, by when the program was told to start */
    kickoff: (a, b) => b.kickoff.getTime() - a.kickoff.getTime() || soonest(a, b),
  };
  return [...rows].sort(by[key]);
}

export const listPrograms = (
  rows: readonly ListRow[],
  filter: FilterKey,
  sort: SortKey,
): ListRow[] => sortRows(rows.filter((r) => matches(r, filter)), sort);
