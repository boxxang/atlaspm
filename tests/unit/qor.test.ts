import { describe, expect, it } from 'vitest';
import { num, parseSheets, type Cell, type Sheets } from '@/lib/qor/parse';
import { rollup, statusOf } from '@/lib/qor/rollup';
import { PNR_STAGES, SHEET_COLS, type QorBlockRow } from '@/lib/qor/schema';

/* ── a workbook, built the way one arrives ────────────────── */

const HEAD = SHEET_COLS.map((c) => c.h);
const AT = (h: string) => HEAD.indexOf(h);

/** One clean block row: every column filled with something plausible. */
const row = (name: string, over: Record<string, Cell> = {}): Cell[] => {
  const r: Cell[] = HEAD.map((h) => {
    switch (h) {
      case 'Block': return name;
      case 'P&R stage': return 'Signoff';
      case 'Setup corner': return 'SS 0.72V/-40C';
      case 'Setup mode': return 'func';
      case 'Hold corner': return 'FF 0.88V/125C';
      case 'Hold mode': return 'func';
      case 'Instances': return 1_200_000;
      case 'Utilization (%)': return 72;
      case 'Setup WNS (ps)': return 40;
      case 'Hold WNS (ps)': return 12;
      case 'Power budget (mW)': return 100;
      case 'Dynamic power (mW)': return 80;
      case 'Leakage power (mW)': return 9;
      default: return 0;
    }
  });
  for (const [h, v] of Object.entries(over)) r[AT(h)] = v;
  return r;
};

const book = (over: Partial<Sheets> = {}): Sheets => ({
  Meta: [['Key', 'Value'], ['Template version', 1], ['Slack unit', 'ps']],
  Blocks: [['Block', 'Group'], ['cpu_core0', 'CPU'], ['npu_core0', 'NPU']],
  Drops: [['Drop', 'Label', 'Date'], ['N0', 'N0', '04/14/2023'], ['FFN', 'FFN', '09/29/2023']],
  Targets: [['Measure', 'Key', 'Target'], ['Setup WNS', 'wns', 0], ['Clock skew', 'skew', 45]],
  N0: [HEAD, row('cpu_core0'), row('npu_core0')],
  FFN: [HEAD, row('cpu_core0'), row('npu_core0')],
  ...over,
});

const at = (r: ReturnType<typeof parseSheets>, drop: string, name: string) =>
  r.dataset.rows[drop].find((x) => x.name === name)!;

describe('num', () => {
  /* The whole point of the format: a cell that is not a measurement must not
     become a zero, because a zero reads as "met the target". */
  it('is null for everything that is not a measurement', () => {
    for (const v of ['', '  ', null, undefined, 'N/A', 'INF', '-', 'n/a']) expect(num(v as Cell)).toBeNull();
  });

  it("is null for a tool's sentinel for no path", () => {
    expect(num(1e30)).toBeNull();
    expect(num('-1e30')).toBeNull();
  });

  it('reads a number, commas and all', () => {
    expect(num('1,234')).toBe(1234);
    expect(num(-117)).toBe(-117);
    expect(num('0.35')).toBe(0.35);
  });
});

describe('parseSheets', () => {
  it('reads a block per drop, in the Blocks sheet order', () => {
    const r = parseSheets(book(), 'qor.xlsx');
    expect(r.dataset.drops.map((d) => d.id)).toEqual(['N0', 'FFN']);
    expect(r.dataset.rows.FFN.map((x) => x.name)).toEqual(['cpu_core0', 'npu_core0']);
    expect(r.rows).toBe(4);
    expect(r.warn).toEqual([]);
  });

  it('takes targets from the sheet, and keeps the default for the rest', () => {
    const r = parseSheets(book());
    expect(r.dataset.targets.skew).toBe(45);
    expect(r.dataset.targets.worstTran).toBe(0.35);
  });

  /* 1-3: the three ways a script writes something that is not a number */
  it('reads a blank, a word and a sentinel as not reported, and says how many', () => {
    const r = parseSheets(book({
      FFN: [HEAD, row('cpu_core0', { 'Setup WNS (ps)': '', 'Setup failing endpoints': 'N/A', 'DRC after route': 1e30 }), row('npu_core0')],
    }));
    const b = at(r, 'FFN', 'cpu_core0');
    expect(b.wns).toBeNull();
    expect(b.feps).toBeNull();
    expect(b.drc).toBeNull();
    expect(r.warn).toContain('FFN: 3 values blank or unreadable — shown as not reported, left out of the roll-up');
  });

  /* 4 */
  it('says when a block was written twice', () => {
    const r = parseSheets(book({ FFN: [HEAD, row('cpu_core0'), row('npu_core0'), row('cpu_core0', { 'Setup WNS (ps)': -999 })] }));
    expect(at(r, 'FFN', 'cpu_core0').wns).toBe(-999);
    expect(r.warn).toContain('FFN: cpu_core0 appears more than once — the last row wins');
  });

  /* 5 */
  it('catches utilisation written as a fraction, one drop at a time', () => {
    const r = parseSheets(book({
      FFN: [HEAD, row('cpu_core0', { 'Utilization (%)': 0.72 }), row('npu_core0', { 'Utilization (%)': 0.81 })],
    }));
    expect(at(r, 'FFN', 'cpu_core0').util).toBe(72);
    expect(at(r, 'N0', 'cpu_core0').util).toBe(72);
    expect(r.warn.some((w) => w.startsWith('FFN: Utilization looked like a fraction'))).toBe(true);
    expect(r.warn.some((w) => w.startsWith('N0: Utilization'))).toBe(false);
  });

  /* 6 */
  it("takes a tool's own name for a stage, and reports one it does not know", () => {
    const r = parseSheets(book({
      FFN: [HEAD, row('cpu_core0', { 'P&R stage': 'route_opt' }), row('npu_core0', { 'P&R stage': 'magic_step' })],
    }));
    expect(PNR_STAGES[at(r, 'FFN', 'cpu_core0').stage]).toBe('Post-route opt');
    expect(PNR_STAGES[at(r, 'FFN', 'npu_core0').stage]).toBe('Not started');
    expect(r.warn).toContain('FFN: P&R stage "magic_step" not recognised — read as Not started');
  });

  /* 7: a case slip used to invent a block and leave the real one unread */
  it('matches a block name whatever its case', () => {
    const r = parseSheets(book({ FFN: [HEAD, row('CPU_CORE0', { 'Setup WNS (ps)': -50 }), row('npu_core0')] }));
    expect(r.dataset.blocks).toHaveLength(2);
    expect(at(r, 'FFN', 'cpu_core0').wns).toBe(-50);
    expect(at(r, 'FFN', 'cpu_core0').group).toBe('CPU');
  });

  it('names a block that is on no Blocks sheet rather than taking it quietly', () => {
    const r = parseSheets(book({ FFN: [HEAD, row('cpu_core0'), row('npu_core0'), row('ghost_top')] }));
    expect(r.warn).toContain('FFN: "ghost_top" is not on the Blocks sheet');
    expect(r.dataset.blocks.map((b) => b.name)).toContain('ghost_top');
  });

  it('ignores a column it does not know, and says it did', () => {
    const r = parseSheets(book({
      FFN: [[...HEAD, 'Congestion score'], [...row('cpu_core0'), 7], [...row('npu_core0'), 8]],
    }));
    expect(r.warn).toContain('FFN: ignored 1 column (congestion score)');
  });

  it('accepts the short column name a script would rather write', () => {
    const short = SHEET_COLS.map((c) => c.a);
    const r = parseSheets(book({ FFN: [short, row('cpu_core0', { 'Setup WNS (ps)': -33 }), row('npu_core0')] }));
    expect(at(r, 'FFN', 'cpu_core0').wns).toBe(-33);
    expect(r.warn).toEqual([]);
  });

  it('converts slack when the file says it is in nanoseconds', () => {
    const r = parseSheets(book({
      Meta: [['Key', 'Value'], ['Slack unit', 'ns']],
      FFN: [HEAD, row('cpu_core0', { 'Setup WNS (ps)': -0.117, 'Clock skew (ps)': 0.064 }), row('npu_core0')],
    }));
    expect(at(r, 'FFN', 'cpu_core0').wns).toBe(-117);
    expect(at(r, 'FFN', 'cpu_core0').skew).toBe(64);
    expect(r.unit).toBe('ns');
  });

  it('reads one flat table with a Drop column, which is what a script writes', () => {
    const flat = [
      ['Drop', 'Group', ...HEAD],
      ['N0', 'CPU', ...row('cpu_core0')],
      ['N0', 'NPU', ...row('npu_core0')],
      ['FFN', 'CPU', ...row('cpu_core0', { 'Setup WNS (ps)': -22 })],
      ['FFN', 'NPU', ...row('npu_core0')],
    ];
    const r = parseSheets({ QoR: flat });
    expect(r.dataset.drops.map((d) => d.id)).toEqual(['N0', 'FFN']);
    expect(at(r, 'FFN', 'cpu_core0').wns).toBe(-22);
    expect(r.rows).toBe(4);
  });

  it('reads a drop with no sheet as not run, rather than as zeros', () => {
    const b = book();
    delete (b as Record<string, unknown>).N0;
    const r = parseSheets(b);
    expect(r.dataset.rows.N0.every((x) => x.missing)).toBe(true);
    expect(r.warn).toContain('no sheet named "N0" — that drop reads as not run');
  });

  it('refuses a file with nothing to read', () => {
    expect(() => parseSheets({ Blocks: [['Block', 'Group'], ['a', 'b']] })).toThrow(/no Drops sheet/);
    expect(() => parseSheets(book({ N0: [HEAD], FFN: [HEAD] }))).toThrow(/no block rows/);
  });

  it('derives total power, and leaves it unreported when a part of it is', () => {
    const r = parseSheets(book({
      FFN: [HEAD, row('cpu_core0'), row('npu_core0', { 'Leakage power (mW)': '' })],
    }));
    expect(at(r, 'FFN', 'cpu_core0').power).toBe(89);
    expect(at(r, 'FFN', 'npu_core0').power).toBeNull();
  });
});

/* ── how a block reads, and how the chip adds up ──────────── */

const block = (over: Partial<QorBlockRow> = {}): QorBlockRow => ({
  ...parseSheets(book()).dataset.rows.FFN[0],
  ...over,
});

describe('statusOf', () => {
  it('is clean when everything reported is inside the line', () => {
    expect(statusOf(block())).toBe('clean');
  });

  it('is failing on a violation no ECO round absorbs', () => {
    expect(statusOf(block({ wns: -41 }))).toBe('fail');
    expect(statusOf(block({ drc: 401 }))).toBe('fail');
    expect(statusOf(block({ overflow: 2.6 }))).toBe('fail');
  });

  it('is watching while something is open the turn can carry', () => {
    expect(statusOf(block({ wns: -20 }))).toBe('watch');
    expect(statusOf(block({ holdV: 3 }))).toBe('watch');
  });

  /* The distinction the whole format exists for. */
  it('is not reported when a judging number never arrived — not clean', () => {
    expect(statusOf(block({ wns: null }))).toBe('partial');
    expect(statusOf(block({ drc: null }))).toBe('partial');
  });

  it('is not run when the block has no row at all', () => {
    expect(statusOf(block({ missing: true }))).toBe('none');
    expect(statusOf(null)).toBe('none');
  });
});

describe('rollup', () => {
  const rows = [
    block({ name: 'a', wns: -100, tns: -4, feps: 10, drc: 5, util: 70, skew: 30, budget: 100, dyn: 80, leak: 10, power: 90 }),
    block({ name: 'b', wns: -20, tns: -1, feps: 3, drc: 0, util: 80, skew: 55, budget: 60, dyn: 40, leak: 5, power: 45 }),
  ];

  it('aggregates each measure the way that measure is defined', () => {
    const r = rollup(rows);
    expect(r.values.wns).toBe(-100);        // worst of the blocks
    expect(r.values.tns).toBe(-5);          // their sum
    expect(r.values.feps).toBe(13);
    expect(r.values.util).toBe(75);         // their average
    expect(r.values.skew).toBe(55);         // the worst one
    expect(r.values.power).toBe(135);
    expect(r.budget).toBe(160);
  });

  it('names the worst block on each measure, not the worst-slack block', () => {
    const r = rollup(rows);
    expect(r.worst.wns?.name).toBe('a');
    expect(r.worst.skew?.name).toBe('b');
  });

  /* A measure nobody reported is null at the chip too. Averaging what did
     arrive and calling it the chip's number is how a gap becomes a green row. */
  it('rolls an unreported measure up to null, not to zero', () => {
    const r = rollup([block({ wns: null }), block({ wns: null })]);
    expect(r.values.wns).toBeNull();
    expect(r.worst.wns).toBeNull();
  });

  it('leaves a block out of the average when it did not report', () => {
    const r = rollup([block({ util: 60 }), block({ util: null })]);
    expect(r.values.util).toBe(60);
  });

  it('counts the blocks by status and by stage', () => {
    const r = rollup([
      block({ wns: -50 }),
      block({ wns: null }),
      block({ missing: true }),
      block({ stage: 7 }),
    ]);
    expect(r.by.fail).toBe(1);
    expect(r.by.partial).toBe(1);
    expect(r.by.none).toBe(1);
    expect(r.by.clean).toBe(1);
    expect(r.total).toBe(4);
    expect(r.stages[7]).toBe(1);
  });

  it('adds assembly to the longest block for the turn runtime', () => {
    const r = rollup([block({ runtime: 10 }), block({ runtime: 4 })]);
    expect(r.values.runtime).toBe(16.5);
  });

  it('survives a drop where nothing ran', () => {
    const r = rollup([block({ missing: true }), block({ missing: true })]);
    expect(r.values.wns).toBeNull();
    expect(r.budget).toBeNull();
    expect(r.by.none).toBe(2);
  });
});
