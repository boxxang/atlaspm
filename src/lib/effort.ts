/**
 * /lib/effort.ts — man-months and what they cost.
 *
 * Effort is recorded per engineering line of a stage. Summing a stage's lines
 * gives what that stage takes; summing the stages gives the program. Multiply
 * by a fully-loaded rate and you have an estimate.
 *
 * Pure: no DOM.
 */

/** Stored newline-separated and index-aligned to the engineering list. */
export function parseEffort(stored: string | null | undefined, length: number): number[] {
  const parsed = (stored ?? '').split('\n').map(toNumber);
  return Array.from({ length }, (_, i) => parsed[i] ?? 0);
}

/** null when nothing has been recorded, so the column stays empty. */
export function serialiseEffort(values: readonly number[]): string | null {
  return values.some((v) => v > 0) ? values.map((v) => String(v)).join('\n') : null;
}

const toNumber = (line: string) => {
  const n = Number.parseFloat(line.trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/**
 * Sums a stored effort column without knowing the engineering list's length.
 * Writers always store exactly one value per line of the list, so this and the
 * per-stage total agree.
 */
export const sumEffortText = (stored: string | null | undefined): number =>
  sumEffort((stored ?? '').split('\n').map(toNumber));

export const sumEffort = (values: readonly number[]): number =>
  /* one decimal: half a man-month is a real number, a thousandth is not */
  Math.round(values.reduce((n, v) => n + (v > 0 ? v : 0), 0) * 10) / 10;

/** "0" reads as unrecorded, so callers decide whether to show it at all. */
export const formatManMonths = (mm: number): string =>
  `${Number.isInteger(mm) ? mm : mm.toFixed(1)} MM`;

export const estimateCost = (manMonths: number, ratePerManMonth: number): number =>
  Math.round(manMonths * ratePerManMonth);

/* ---------- turn-around time ---------- */

/**
 * TAT is stored the same way as effort — one number per engineering line — but
 * it admits negatives: a negative value marks an activity that runs
 * continuously across the stage rather than closing once, and its magnitude is
 * still the span in weeks.
 */
export function parseTat(stored: string | null | undefined, length: number): number[] {
  const parsed = (stored ?? '').split('\n').map(toSignedNumber);
  return Array.from({ length }, (_, i) => parsed[i] ?? 0);
}

/** null when nothing has been recorded, so the column stays empty. */
export function serialiseTat(values: readonly number[]): string | null {
  return values.some((v) => v !== 0) ? values.map((v) => String(v)).join('\n') : null;
}

const toSignedNumber = (line: string) => {
  const n = Number.parseFloat(line.trim());
  return Number.isFinite(n) ? n : 0;
};

/** "12w", "0.5w", and "30w cont." for the continuous ones. */
export function formatTat(weeks: number): string {
  if (!weeks) return '—';
  const w = Math.abs(weeks);
  const span = `${Number.isInteger(w) ? w : w.toFixed(1)}w`;
  return weeks < 0 ? `${span} cont.` : span;
}

export const CURRENCIES = ['USD', 'KRW', 'EUR', 'JPY'] as const;
export type Currency = (typeof CURRENCIES)[number];

export function formatCost(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString('en-US')} ${currency}`;
  }
}

/** Compact enough for a gantt bar: 1.2k MM rather than 1200 MM. */
export function formatManMonthsShort(mm: number): string {
  if (mm >= 1000) return `${(mm / 1000).toFixed(1).replace(/\.0$/, '')}k MM`;
  return formatManMonths(mm);
}
