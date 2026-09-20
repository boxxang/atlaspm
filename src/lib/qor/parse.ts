/**
 * /lib/qor/parse.ts — sheets to rows, and everything the file got wrong.
 *
 * A script in the design environment writes this file after every run, and the
 * ways a script gets it wrong are not the ways a person does. Two rules the
 * parser is built around:
 *
 *  1. A cell that is blank, or holds a word, or holds a tool's 1e30 for "no
 *     path", is NOT a zero. It reads as null, prints as a dash, and stays out
 *     of the roll-up.
 *  2. Everything the parser could not make sense of comes back in `warn` — a
 *     duplicate block row, an unrecognised P&R stage, a name that is not on
 *     the Blocks sheet, a column it ignored. Silence is what turns a script's
 *     mistake into a decision.
 *
 * Pure: it takes a bag of sheets, not a file. Reading .xlsx bytes is
 * /lib/qor/xlsx.ts, which runs in the browser.
 */
import {
  DEFAULT_TARGETS,
  HUGE,
  MEASURES,
  SHEET_COLS,
  SLACK_PS,
  STAGE_ALIAS,
  UNIT_SCALE,
  type MeasureKey,
  type QorBlockRow,
  type QorDataset,
  type QorDrop,
} from './schema';

export type Cell = string | number | null | undefined;
export type Sheets = Record<string, Cell[][]>;

export interface ParseResult {
  dataset: QorDataset;
  warn: string[];
  /** how many block rows were actually read */
  rows: number;
  /** the unit the file said its slack was in */
  unit: string;
}

const norm = (s: Cell) => String(s ?? '').trim().toLowerCase().replace(/[\s_]+/g, ' ');
const keyOf = (s: Cell) => norm(s).replace(/ /g, '');

/** A number, or null for every way a cell can fail to be a measurement. */
export function num(v: Cell): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(/,/g, '');
  if (!s) return null;
  const n = parseFloat(s);
  if (!Number.isFinite(n) || Math.abs(n) >= HUGE) return null;
  return n;
}

const blank = (): QorBlockRow => {
  const m: Record<string, unknown> = {};
  for (const c of SHEET_COLS) {
    if (c.k === 'name' || c.k === 'stage') continue;
    m[c.k] = c.t === 'text' ? '' : null;
  }
  m.power = null;
  return m as unknown as QorBlockRow;
};

export function parseSheets(sheets: Sheets, fileName = ''): ParseResult {
  const warn: string[] = [];
  const find = (name: string) => Object.keys(sheets).find((s) => norm(s) === name);
  const head = (rows: Cell[][]) => (rows[0] || []).map(norm);

  /* Meta: the unit slack is in, and where the file came from */
  const meta: Record<string, string> = {};
  const metaSheet = find('meta') ? sheets[find('meta')!] : undefined;
  if (metaSheet) for (const r of metaSheet.slice(1)) if (String(r[0] ?? '').trim()) meta[keyOf(r[0])] = String(r[1] ?? '').trim();
  const unit = (meta.slackunit || 'ps').toLowerCase();
  const scale = UNIT_SCALE[unit];
  if (!scale) warn.push(`Meta: slack unit "${meta.slackunit}" is not ps, ns or s — read as ps`);

  /* the flat shape a script writes: one sheet, every drop, a Drop column */
  const flatName = Object.keys(sheets).find(
    (s) => head(sheets[s]).includes('drop') && head(sheets[s]).includes('block'),
  );

  /* Blocks: the roster, and the spelling every other sheet is matched against */
  const byKey: Record<string, { name: string; group: string }> = {};
  const order: { name: string; group: string }[] = [];
  const addBlock = (name: Cell, group: Cell) => {
    const k = keyOf(name);
    if (byKey[k]) return byKey[k];
    const b = { name: String(name).trim(), group: String(group ?? '—').trim() || '—' };
    byKey[k] = b;
    order.push(b);
    return b;
  };
  const blocksSheet = find('blocks') ? sheets[find('blocks')!] : undefined;
  if (blocksSheet) for (const r of blocksSheet.slice(1)) if (String(r[0] ?? '').trim()) addBlock(r[0], r[1]);

  /* Drops: from the Drops sheet, or from a flat sheet's own Drop column */
  let drops: QorDrop[] = [];
  const dropSheet = find('drops') ? sheets[find('drops')!] : undefined;
  if (dropSheet) {
    drops = dropSheet.slice(1)
      .filter((r) => String(r[0] ?? '').trim())
      .map((r) => ({
        id: String(r[0]).trim(),
        label: String(r[1] ?? r[0]).trim() || String(r[0]).trim(),
        date: String(r[2] ?? '').trim(),
      }));
  } else if (flatName) {
    const h = head(sheets[flatName]);
    const di = h.indexOf('drop');
    const seen: string[] = [];
    for (const r of sheets[flatName].slice(1)) {
      const d = String(r[di] ?? '').trim();
      if (d && !seen.includes(d)) seen.push(d);
    }
    drops = seen.map((id) => ({ id, label: id, date: '' }));
  }
  if (!drops.length) throw new Error('no Drops sheet, and no Drop column to take the drops from');

  /* Targets: on the measure key where the sheet carries one, on the label
     otherwise, so renaming a label does not break a file */
  const targets: Partial<Record<MeasureKey, number>> = { ...DEFAULT_TARGETS };
  const tSheet = find('targets') ? sheets[find('targets')!] : undefined;
  if (tSheet) {
    const h = head(tSheet);
    const ki = h.indexOf('key');
    const li = h.indexOf('measure');
    const vi = h.indexOf('target');
    const byLabel: Record<string, MeasureKey> = {};
    for (const [k, c] of Object.entries(MEASURES)) byLabel[norm(c.label)] = k as MeasureKey;
    for (const r of tSheet.slice(1)) {
      const fromKey = ki >= 0 ? String(r[ki] ?? '').trim() : '';
      const k = (fromKey && MEASURES[fromKey] ? (fromKey as MeasureKey) : undefined) ?? byLabel[norm(r[li >= 0 ? li : 0])];
      const v = num(r[vi >= 0 ? vi : 2]);
      if (k && v !== null) targets[k] = v;
      else if (String(r[0] ?? '').trim() && !k) warn.push(`Targets: "${String(r[0]).trim()}" is not a measure this page draws`);
    }
  }

  const colsOf = (h: string[]) => {
    const map: Partial<Record<string, number>> = {};
    for (const c of SHEET_COLS) {
      const i = [norm(c.h), norm(c.a), norm(c.k)].map((n) => h.indexOf(n)).find((x) => x >= 0);
      if (i !== undefined) map[c.k] = i;
    }
    return map;
  };
  const known = new Set(SHEET_COLS.flatMap((c) => [norm(c.h), norm(c.a), norm(c.k)]).concat('drop', 'group'));

  const notReported: Record<string, number> = {};
  /* the slack each drop reported, before it was rounded to whole picoseconds:
     a file written in nanoseconds under a Meta sheet that says picoseconds
     rounds to zero and reads as a closed design */
  const rawSlack: Record<string, number[]> = {};
  const badStage: Record<string, Set<string>> = {};
  const dupes: Record<string, Set<string>> = {};

  const readRow = (r: Cell[], map: Partial<Record<string, number>>, tag: string): QorBlockRow | null => {
    const name = String(r[map.name ?? 0] ?? '').trim();
    if (!name) return null;
    let b = byKey[keyOf(name)];
    if (!b) {
      warn.push(`${tag}: "${name}" is not on the Blocks sheet`);
      b = addBlock(name, '—');
    }
    const m = { ...blank(), name: b.name, group: b.group, stage: 0, missing: false };
    const set = m as unknown as Record<string, unknown>;
    for (const c of SHEET_COLS) {
      if (c.k === 'name') continue;
      const raw = map[c.k] === undefined ? '' : r[map[c.k]!];
      if (c.t === 'stage') {
        const s = norm(raw);
        if (!s) continue;
        const i = STAGE_ALIAS[s];
        if (i === undefined) {
          (badStage[tag] ??= new Set()).add(String(raw).trim());
        } else m.stage = i;
        continue;
      }
      if (c.t === 'text') {
        set[c.k] = String(raw ?? '').trim();
        continue;
      }
      let v = num(raw);
      if (v === null) notReported[tag] = (notReported[tag] || 0) + 1;
      else {
        if (SLACK_PS.includes(c.k as MeasureKey)) {
          v *= scale || 1;
          (rawSlack[tag] ??= []).push(v);
        }
        v = c.t === 'int' ? Math.round(v) : +v.toFixed(3);
      }
      set[c.k] = v;
    }
    m.power = m.dyn === null || m.leak === null ? null : +(m.dyn + m.leak).toFixed(0);
    return m;
  };

  const perDrop: Record<string, Record<string, QorBlockRow> | null> = {};
  for (const d of drops) {
    const sheetName = find(norm(d.id));
    if (!sheetName) { perDrop[d.id] = null; continue; }
    const own = sheets[sheetName];
    const h = head(own);
    const map = colsOf(h);
    if (map.name === undefined) {
      warn.push(`${d.id}: no Block column — that drop reads as not run`);
      perDrop[d.id] = {};
      continue;
    }
    const gone = SHEET_COLS.filter((c) => map[c.k] === undefined).map((c) => c.h);
    if (gone.length) warn.push(`${d.id}: no column for ${gone.join(', ')}`);
    const extra = h.filter((x) => x && !known.has(x));
    if (extra.length) warn.push(`${d.id}: ignored ${extra.length} column${extra.length > 1 ? 's' : ''} (${extra.join(', ')})`);
    const seen: Record<string, QorBlockRow> = {};
    for (const r of own.slice(1)) {
      const m = readRow(r, map, d.id);
      if (!m) continue;
      if (seen[keyOf(m.name)]) (dupes[d.id] ??= new Set()).add(m.name);
      seen[keyOf(m.name)] = m;
    }
    perDrop[d.id] = seen;
  }

  if (flatName) {
    const rows = sheets[flatName];
    const h = head(rows);
    const map = colsOf(h);
    const di = h.indexOf('drop');
    const gi = h.indexOf('group');
    const extra = h.filter((x) => x && !known.has(x));
    if (extra.length) warn.push(`${flatName}: ignored ${extra.length} column${extra.length > 1 ? 's' : ''} (${extra.join(', ')})`);
    for (const r of rows.slice(1)) {
      const id = String(r[di] ?? '').trim();
      if (!id || !(id in perDrop)) continue;
      if (perDrop[id] === null) perDrop[id] = {};
      if (gi >= 0 && String(r[map.name ?? 0] ?? '').trim()) addBlock(r[map.name ?? 0], r[gi]);
      const m = readRow(r, map, id);
      if (!m) continue;
      if (perDrop[id]![keyOf(m.name)]) (dupes[id] ??= new Set()).add(m.name);
      perDrop[id]![keyOf(m.name)] = m;
    }
  }

  for (const [tag, set] of Object.entries(dupes))
    warn.push(`${tag}: ${[...set].join(', ')} appear${set.size > 1 ? '' : 's'} more than once — the last row wins`);
  for (const [tag, set] of Object.entries(badStage))
    warn.push(`${tag}: P&R stage ${[...set].map((s) => `"${s}"`).join(', ')} not recognised — read as Not started`);
  /* Slack under a picosecond, everywhere, is not a design that closed: it is a
     file whose numbers are in some other unit. It is not converted, because
     nanoseconds and seconds are both a thousand apart from something and the
     file is the only thing that knows which — but it is not passed over either,
     since rounding it to whole picoseconds turns it into a clean drop. */
  for (const [tag, vals] of Object.entries(rawSlack)) {
    if (vals.length < 5 || !vals.some((v) => v !== 0) || vals.some((v) => Math.abs(v) >= 1)) continue;
    warn.push(`${tag}: every slack is under a picosecond — check the Meta sheet's slack unit, which says ${unit}`);
  }
  for (const [tag, n] of Object.entries(notReported))
    warn.push(`${tag}: ${n} value${n > 1 ? 's' : ''} blank or unreadable — shown as not reported, left out of the roll-up`);

  if (!order.length) throw new Error('no blocks — neither a Blocks sheet nor any block rows');

  /* Utilisation as a fraction rather than a percent is the one unit slip that
     leaves every number still looking plausible. Judged per drop, because a
     script writes one drop at a time and slips one drop at a time. */
  for (const id of Object.keys(perDrop)) {
    const ms = Object.values(perDrop[id] || {}).filter((m) => m.util !== null);
    if (!ms.length || Math.max(...ms.map((m) => m.util as number)) > 1.5) continue;
    for (const m of ms) m.util = +((m.util as number) * 100).toFixed(1);
    warn.push(`${id}: Utilization looked like a fraction, not a percent — every value was multiplied by 100`);
  }

  const rowsByDrop: Record<string, QorBlockRow[]> = {};
  for (const d of drops) {
    const seen = perDrop[d.id];
    if (seen === null) {
      warn.push(`no sheet named "${d.id}" — that drop reads as not run`);
      rowsByDrop[d.id] = order.map((b) => ({ ...blank(), ...b, stage: 0, missing: true }));
      continue;
    }
    rowsByDrop[d.id] = order.map((b) => seen[keyOf(b.name)] || { ...blank(), ...b, stage: 0, missing: true });
  }

  const rows = Object.values(rowsByDrop).reduce((t, r) => t + r.filter((x) => !x.missing).length, 0);
  if (!rows) throw new Error('no block rows in any drop');

  return {
    dataset: { v: 1, fileName, meta, drops, blocks: order, targets, rows: rowsByDrop },
    warn,
    rows,
    unit,
  };
}
