/**
 * /lib/rowIds.ts — the reference IDs printed beside each row.
 *
 * DEF-01 is the first engineering activity of the stage whose short title is
 * DEF; DEF-D1 is its first deliverable. They are derived from position, never
 * stored: the template numbers its rows by where they sit, so a list that is
 * reordered or shortened renumbers with it. Quote one in a review and it names
 * a row in the current list, not a row that used to exist.
 *
 * Pure: no DOM.
 */

/** Falls back to '—' so a stage with no short title still renders a column. */
const prefix = (shortTitle: string): string => shortTitle.trim().toUpperCase() || '—';

/** Engineering activity: DEF-01, PKGD-11. Two digits, so ten sorts before two. */
export const activityRowId = (shortTitle: string, index: number): string =>
  `${prefix(shortTitle)}-${String(index + 1).padStart(2, '0')}`;

/** Deliverable: DEF-D1, PKGD-D6. */
export const deliverableRowId = (shortTitle: string, index: number): string =>
  `${prefix(shortTitle)}-D${index + 1}`;
