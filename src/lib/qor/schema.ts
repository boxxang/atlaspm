/**
 * /lib/qor/schema.ts — what a QoR workbook holds, and what each number means.
 *
 * One place, because three things read it: the parser that turns a spreadsheet
 * into rows, the roll-up that turns sixty blocks into one chip, and the table
 * that draws them. A measure's unit, its target direction and how it
 * aggregates are properties of the measure, not of the screen showing it.
 *
 * Pure: no DOM, no Prisma.
 */

/** The measures one block carries in one netlist drop. */
export const MEASURE_KEYS = [
  'inst', 'util', 'wns', 'tns', 'feps', 'holdW', 'holdTns', 'holdV', 'skew',
  'maxTran', 'worstTran', 'maxCap', 'maxFanout', 'minPeriod', 'mpw',
  'overflow', 'drc', 'dyn', 'leak', 'budget', 'irStatic', 'irDynamic',
  'runtime', 'ecos', 'ecoRounds', 'power',
] as const;
export type MeasureKey = (typeof MEASURE_KEYS)[number];

/**
 * A measure is a number or null. Null is every way a cell can fail to be a
 * measurement — empty, a word, a tool's sentinel for "there was no path" — and
 * it is deliberately not zero. A block nobody has measured must never sit in
 * the same colour as one that came back clean.
 */
export type QorMeasures = Record<MeasureKey, number | null>;

export interface QorBlockRow extends QorMeasures {
  name: string;
  group: string;
  /** index into PNR_STAGES */
  stage: number;
  /** true when this block has no row in this drop at all */
  missing: boolean;
  setupCorner: string;
  setupMode: string;
  holdCorner: string;
  holdMode: string;
}

export interface QorDrop {
  id: string;
  label: string;
  date: string;
}

export interface QorDataset {
  /** bumped when the stored shape changes; the reader refuses what it predates */
  v: 1;
  fileName: string;
  meta: Record<string, string>;
  drops: QorDrop[];
  blocks: { name: string; group: string }[];
  targets: Partial<Record<MeasureKey, number>>;
  /** drop id -> rows, one per block, in `blocks` order */
  rows: Record<string, QorBlockRow[]>;
}

/* ── the P&R pipeline ─────────────────────────────────────── */

export const PNR_STAGES = [
  'Not started', 'Floorplan', 'Place', 'CTS', 'Route', 'Post-route opt', 'Signoff', 'Complete',
] as const;

/** One hue, light to dark, because the stages are ordered; complete is the status green. */
export const PNR_FILL = [
  '#d8dade', '#dcdcf6', '#c3c3ef', '#a6a6e6', '#8a8adc', '#6f6fd2', '#5b5bd6', '#30a46c',
];

/**
 * What a tool calls a step, against what this page calls it. A script writes
 * its own flow's name; one that is not here is reported rather than quietly
 * landing the block back at Not started.
 */
export const STAGE_ALIAS: Record<string, number> = {
  'not started': 0, none: 0, na: 0,
  floorplan: 1, fp: 1, 'floor plan': 1,
  place: 2, placement: 2, placed: 2, 'place opt': 2,
  cts: 3, clock: 3, 'clock tree': 3,
  route: 4, routed: 4, routing: 4, 'detail route': 4,
  'post-route opt': 5, 'post route opt': 5, postroute: 5, 'route opt': 5, 'post-route': 5,
  signoff: 6, 'sign off': 6, 'sign-off': 6, sta: 6,
  complete: 7, done: 7, closed: 7, 'tape ready': 7,
};

/* ── the status a block reads as ──────────────────────────── */

export const QOR_STATUSES = ['clean', 'watch', 'fail', 'partial', 'none'] as const;
export type QorStatus = (typeof QOR_STATUSES)[number];

export const QOR_STATUS_LABEL: Record<QorStatus, string> = {
  clean: 'Clean',
  watch: 'Watching',
  fail: 'Failing',
  partial: 'Not reported',
  none: 'Not run',
};

/* ── the measures, and how each one rolls up ──────────────── */

export interface MeasureDef {
  label: string;
  unit: string;
  /** which side of the target is good */
  good: 'above' | 'below';
  group: 'Timing' | 'Design rules' | 'Physical' | 'Power and IR' | 'Flow';
  /** how sixty blocks become one chip number */
  agg: 'min' | 'max' | 'sum' | 'mean';
  /** decimals that number is worth */
  dp?: number;
  /** null where the target is derived from the blocks' own budgets */
  target: number | null;
  /** which corner/mode pair to print beside the worst block */
  scn?: 'setup' | 'hold';
}

/**
 * What the chip is signed off against. Targets, not wishes: each is a number
 * the programme committed to, and the full-chip view reads the actual against
 * it rather than on its own. Order here is the order of the rows.
 */
export const MEASURES: Record<string, MeasureDef> = {
  wns: { target: 0, unit: 'ps', good: 'above', label: 'Setup WNS', group: 'Timing', agg: 'min', scn: 'setup' },
  tns: { target: 0, unit: 'ns', good: 'above', label: 'Setup TNS', group: 'Timing', agg: 'sum', dp: 1, scn: 'setup' },
  feps: { target: 0, unit: '', good: 'below', label: 'Setup failing endpoints', group: 'Timing', agg: 'sum', scn: 'setup' },
  holdW: { target: 0, unit: 'ps', good: 'above', label: 'Hold WNS', group: 'Timing', agg: 'min', scn: 'hold' },
  holdTns: { target: 0, unit: 'ns', good: 'above', label: 'Hold TNS', group: 'Timing', agg: 'sum', dp: 2, scn: 'hold' },
  holdV: { target: 0, unit: '', good: 'below', label: 'Hold failing endpoints', group: 'Timing', agg: 'sum', scn: 'hold' },
  skew: { target: 60, unit: 'ps', good: 'below', label: 'Clock skew', group: 'Timing', agg: 'max' },
  maxTran: { target: 0, unit: '', good: 'below', label: 'Max transition violations', group: 'Design rules', agg: 'sum' },
  maxCap: { target: 0, unit: '', good: 'below', label: 'Max capacitance violations', group: 'Design rules', agg: 'sum' },
  maxFanout: { target: 0, unit: '', good: 'below', label: 'Max fanout violations', group: 'Design rules', agg: 'sum' },
  worstTran: { target: 0.35, unit: 'ns', good: 'below', label: 'Worst transition', group: 'Design rules', agg: 'max', dp: 2 },
  minPeriod: { target: 0, unit: '', good: 'below', label: 'Min period violations', group: 'Design rules', agg: 'sum' },
  mpw: { target: 0, unit: '', good: 'below', label: 'Min pulse width violations', group: 'Design rules', agg: 'sum' },
  util: { target: 78, unit: '%', good: 'below', label: 'Utilization', group: 'Physical', agg: 'mean', dp: 1 },
  overflow: { target: 1, unit: '%', good: 'below', label: 'Global route overflow', group: 'Physical', agg: 'max', dp: 2 },
  drc: { target: 0, unit: '', good: 'below', label: 'DRC after route', group: 'Physical', agg: 'sum' },
  power: { target: null, unit: 'mW', good: 'below', label: 'Total power', group: 'Power and IR', agg: 'sum' },
  dyn: { target: null, unit: 'mW', good: 'below', label: 'Dynamic power', group: 'Power and IR', agg: 'sum' },
  leak: { target: 90, unit: 'mW', good: 'below', label: 'Leakage power', group: 'Power and IR', agg: 'sum' },
  irStatic: { target: 25, unit: 'mV', good: 'below', label: 'IR drop — static', group: 'Power and IR', agg: 'max', dp: 1 },
  irDynamic: { target: 45, unit: 'mV', good: 'below', label: 'IR drop — dynamic', group: 'Power and IR', agg: 'max', dp: 1 },
  runtime: { target: 26, unit: 'h', good: 'below', label: 'Turn runtime', group: 'Flow', agg: 'max', dp: 1 },
  ecos: { target: 400, unit: '', good: 'below', label: 'ECOs applied', group: 'Flow', agg: 'sum' },
  ecoRounds: { target: 4, unit: '', good: 'below', label: 'ECO rounds', group: 'Flow', agg: 'max' },
};

export const MEASURE_ORDER = Object.keys(MEASURES) as MeasureKey[];

export const DEFAULT_TARGETS: Partial<Record<MeasureKey, number>> = Object.fromEntries(
  MEASURE_ORDER.filter((k) => MEASURES[k].target !== null).map((k) => [k, MEASURES[k].target as number]),
);

/* ── the spreadsheet's columns ────────────────────────────── */

export interface SheetCol {
  /** what a person reads */
  h: string;
  /** what a script should write */
  a: string;
  k: MeasureKey | 'name' | 'stage' | 'setupCorner' | 'setupMode' | 'holdCorner' | 'holdMode';
  t: 'text' | 'stage' | 'int' | 'num';
}

/**
 * Either spelling is accepted, and so is the bare key. Units live in the
 * header for the reader and on the Meta sheet for the machine — a script that
 * reports slack in nanoseconds says so there rather than being read a thousand
 * times optimistic.
 */
export const SHEET_COLS: SheetCol[] = [
  { h: 'Block', a: 'block', k: 'name', t: 'text' },
  { h: 'P&R stage', a: 'pnr_stage', k: 'stage', t: 'stage' },
  { h: 'Instances', a: 'instances', k: 'inst', t: 'int' },
  { h: 'Utilization (%)', a: 'utilization', k: 'util', t: 'num' },
  { h: 'Setup WNS (ps)', a: 'setup_wns', k: 'wns', t: 'int' },
  { h: 'Setup TNS (ns)', a: 'setup_tns', k: 'tns', t: 'num' },
  { h: 'Setup failing endpoints', a: 'setup_failing_endpoints', k: 'feps', t: 'int' },
  { h: 'Setup corner', a: 'setup_corner', k: 'setupCorner', t: 'text' },
  { h: 'Setup mode', a: 'setup_mode', k: 'setupMode', t: 'text' },
  { h: 'Hold WNS (ps)', a: 'hold_wns', k: 'holdW', t: 'int' },
  { h: 'Hold TNS (ns)', a: 'hold_tns', k: 'holdTns', t: 'num' },
  { h: 'Hold failing endpoints', a: 'hold_failing_endpoints', k: 'holdV', t: 'int' },
  { h: 'Hold corner', a: 'hold_corner', k: 'holdCorner', t: 'text' },
  { h: 'Hold mode', a: 'hold_mode', k: 'holdMode', t: 'text' },
  { h: 'Clock skew (ps)', a: 'clock_skew', k: 'skew', t: 'int' },
  { h: 'Max transition violations', a: 'max_transition_violations', k: 'maxTran', t: 'int' },
  { h: 'Worst transition (ns)', a: 'worst_transition', k: 'worstTran', t: 'num' },
  { h: 'Max capacitance violations', a: 'max_capacitance_violations', k: 'maxCap', t: 'int' },
  { h: 'Max fanout violations', a: 'max_fanout_violations', k: 'maxFanout', t: 'int' },
  { h: 'Min period violations', a: 'min_period_violations', k: 'minPeriod', t: 'int' },
  { h: 'Min pulse width violations', a: 'min_pulse_width_violations', k: 'mpw', t: 'int' },
  { h: 'Global route overflow (%)', a: 'global_route_overflow', k: 'overflow', t: 'num' },
  { h: 'DRC after route', a: 'drc_after_route', k: 'drc', t: 'int' },
  { h: 'Dynamic power (mW)', a: 'dynamic_power', k: 'dyn', t: 'int' },
  { h: 'Leakage power (mW)', a: 'leakage_power', k: 'leak', t: 'num' },
  { h: 'Power budget (mW)', a: 'power_budget', k: 'budget', t: 'int' },
  { h: 'IR drop static (mV)', a: 'ir_drop_static', k: 'irStatic', t: 'num' },
  { h: 'IR drop dynamic (mV)', a: 'ir_drop_dynamic', k: 'irDynamic', t: 'num' },
  { h: 'Turn runtime (h)', a: 'turn_runtime', k: 'runtime', t: 'num' },
  { h: 'ECOs applied', a: 'ecos_applied', k: 'ecos', t: 'int' },
  { h: 'ECO rounds', a: 'eco_rounds', k: 'ecoRounds', t: 'int' },
];

/** Slack this page shows in picoseconds; a tool reports seconds or nanoseconds. */
export const SLACK_PS: MeasureKey[] = ['wns', 'holdW', 'skew'];
export const UNIT_SCALE: Record<string, number> = { ps: 1, ns: 1000, s: 1e12 };

/** Anything at or past this is a tool's "no path", not a measurement. */
export const HUGE = 1e20;
