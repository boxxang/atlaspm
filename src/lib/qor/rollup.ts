/**
 * /lib/qor/rollup.ts — how a block reads, and how sixty of them become a chip.
 *
 * Pure: no DOM, no Prisma. Everything here is decided by the measure's own
 * definition in schema.ts, so a new measure needs a row there and nothing here.
 */
import {
  MEASURES,
  MEASURE_ORDER,
  PNR_STAGES,
  type MeasureKey,
  type QorBlockRow,
  type QorStatus,
  QOR_STATUSES,
} from './schema';

/** The measures a block is judged on. Any of them missing and it cannot be judged. */
const JUDGED: MeasureKey[] = ['wns', 'overflow', 'drc', 'holdV'];

const nn = (v: number | null | undefined): v is number => v !== null && v !== undefined;

/**
 * A block is Not reported when it has a row but not the numbers the judgement
 * needs, which is a different thing from Not run — no row at all — and a very
 * different thing from Clean.
 */
export function statusOf(m: QorBlockRow | null | undefined): QorStatus {
  if (!m || m.missing) return 'none';
  if (JUDGED.some((k) => !nn(m[k]))) return 'partial';
  /* failing: a violation no ECO round will absorb, or routing that will not close */
  if (m.wns! < -40 || m.overflow! > 2.5 || m.drc! > 400) return 'fail';
  /* watching: something is still open, but the turn can carry it */
  if (m.wns! < 0 || m.holdV! > 0 || m.overflow! > 1.2) return 'watch';
  return 'clean';
}

const AGG = {
  min: (v: number[]) => Math.min(...v),
  max: (v: number[]) => Math.max(...v),
  sum: (v: number[]) => v.reduce((t, x) => t + x, 0),
  mean: (v: number[]) => v.reduce((t, x) => t + x, 0) / v.length,
};

export interface QorRollup {
  by: Record<QorStatus, number>;
  total: number;
  /** how many blocks sit at each P&R stage */
  stages: number[];
  /** what the blocks were budgeted, which the power rows are read against */
  budget: number | null;
  values: Partial<Record<MeasureKey, number | null>>;
  /** the worst block on each measure — on THAT measure, not on the slack */
  worst: Partial<Record<MeasureKey, QorBlockRow | null>>;
}

/** Top-level assembly, on top of the longest block's own turn. */
const ASSEMBLY_HOURS = 6.5;

export function rollup(rows: QorBlockRow[]): QorRollup {
  const live = rows.filter((r) => !r.missing);
  const by = Object.fromEntries(QOR_STATUSES.map((s) => [s, 0])) as Record<QorStatus, number>;
  for (const r of rows) by[statusOf(r)]++;

  const values: QorRollup['values'] = {};
  const worst: QorRollup['worst'] = {};
  for (const k of MEASURE_ORDER) {
    const c = MEASURES[k];
    const has = live.filter((r) => nn(r[k]));
    values[k] = has.length ? +AGG[c.agg](has.map((r) => r[k] as number)).toFixed(c.dp ?? 0) : null;
    worst[k] = has.length
      ? has.reduce((a, b) => ((c.good === 'above' ? (b[k] as number) < (a[k] as number) : (b[k] as number) > (a[k] as number)) ? b : a))
      : null;
  }
  if (nn(values.runtime)) values.runtime = +(values.runtime + ASSEMBLY_HOURS).toFixed(1);

  const budgets = live.map((r) => r.budget).filter(nn);

  return {
    by,
    total: rows.length,
    stages: PNR_STAGES.map((_, i) => rows.filter((x) => x.stage === i).length),
    budget: budgets.length ? budgets.reduce((t, x) => t + x, 0) : null,
    values,
    worst,
  };
}
