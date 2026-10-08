/**
 * `npx tsx tools/cpoFlow/report.ts` — prints the computed sections of the CPO
 * flow verification report (docs/cpoSwitch-flow-verification.md) as Markdown:
 * the before/after reconciliation, the item tracks, producer-consumer checks,
 * gates, the critical path and owner load. The judgement around them is
 * written in the report by hand; these tables are regenerated, not edited.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { CPO_ACTIVITIES, CPO_ACTIVITY_TITLES, CPO_DELIVERABLES, CPO_SKELETON } from '../../src/data/cpoSwitch';
import { CPO_WRITE_UPS } from '../../src/data/cpoSwitch/writeUps';
import * as A from './analysis';
import { ACTIVITY_FATE, DELIVERABLE_FATE } from './refMap';
import { TRACKS } from './tracks';

const root = path.join(__dirname, '..', '..');
const base = JSON.parse(readFileSync(path.join(root, 'tests/unit/fixtures/cpoSwitchBaseline.json'), 'utf8')) as {
  programWeeks: number;
  activities: { ref: string; title: string; start: number; end: number; dependsOn: string[] }[];
  deliverables: { ref: string; title: string }[];
};

const out: string[] = [];
const p = (s = '') => out.push(s);
const row = (cells: (string | number)[]) => p(`| ${cells.join(' | ')} |`);
const head = (cells: string[]) => {
  row(cells);
  row(cells.map(() => '---'));
};
const fateLabel = { kept: 'Kept', renumbered: 'Kept (renumbered)', moved: 'Moved', split: 'Split', deleted: 'Deleted' } as const;

/* ---------------- V1 ---------------- */
p('### V1 — activities, before → after');
p();
head(['Before', 'Title before', 'Fate', 'After']);
for (const a of base.activities) {
  const f = ACTIVITY_FATE[a.ref];
  row([a.ref, a.title, f ? fateLabel[f.fate] : '**UNACCOUNTED**', f ? (f.to.join(', ') || `— ${f.why ?? ''}`) : '']);
}
const covered = new Set(Object.values(ACTIVITY_FATE).flatMap((f) => f.to));
const added = A.ALL_REFS.filter((r) => !covered.has(r));
p();
p(`New activities with no predecessor in the baseline (${added.length}):`);
p();
head(['Ref', 'Title', 'Item']);
for (const r of added) row([r, CPO_ACTIVITY_TITLES[r], CPO_ACTIVITIES[r].item]);
p();
p('### V1 — deliverables, before → after');
p();
head(['Before', 'Fate', 'After', 'Title after']);
for (const d of base.deliverables) {
  const f = DELIVERABLE_FATE[d.ref];
  row([d.ref, f ? fateLabel[f.fate] : '**UNACCOUNTED**', f ? f.to.join(', ') || '—' : '', f ? f.to.map((t) => CPO_DELIVERABLES[t]).join(' / ') : d.title]);
}

/* ---------------- V2 ---------------- */
p();
p('### V2 — item tracks');
for (const t of TRACKS) {
  p();
  p(`**${t.label}**`);
  p();
  head(['Step', 'Activities (weeks)']);
  for (const s of t.steps) {
    row([s.step, s.refs.length ? s.refs.map((r) => `${r} (W${A.absStart(r)}–${A.absEnd(r)})`).join(', ') : `— ${s.why ?? ''}`]);
  }
}

/* ---------------- V3 ---------------- */
p();
p('### V3 — producer → consumer');
p();
const unnamed = A.ALL_REFS.flatMap((y) => A.namedProducers(y).filter((x) => !A.predecessorsOf(y).includes(x)).map((x) => [x, y]));
p(`Inputs named in a write-up's consumes list whose producer is not among its dependencies: ${unnamed.length}`);
for (const [x, y] of unnamed) p(`- ${y} consumes from ${x}`);
p();
const late = A.edges().filter(([x, y]) => A.edgeKind(x, y) === 'SS');
p(`Dependencies where the producer finishes after the consumer (start-to-start on an interim output): ${late.length}`);
p();
head(['Producer (ends)', 'Consumer (ends)']);
for (const [x, y] of late) row([`${x} (W${A.absEnd(x)})`, `${y} (W${A.absEnd(y)})`]);
p();
p(`Isolated activities: ${A.isolated().join(', ') || 'none'}`);
p();
const terminal = A.deliverableUse().filter((d) => d.downstream.length === 0);
p(`Deliverables whose producer feeds nothing downstream: ${terminal.length}`);
for (const d of terminal) p(`- ${d.ref} — ${d.title} (from ${d.producer})`);

/* ---------------- V4 ---------------- */
p();
p('### V4 — gates');
p();
head(['Stage', 'Gate', 'Week', 'Closing review', 'Started before the gate by later stages']);
for (const s of CPO_SKELETON) {
  const review = s.activities.find((a) => a.ref === A.GATE_CLOSERS[s.key]);
  const gate = s.start + s.dur;
  const mine = new Set(s.activities.map((a) => a.ref));
  const early = A.ALL_REFS.filter(
    (y) => !mine.has(y) && A.predecessorsOf(y).some((x) => mine.has(x)) && A.absStart(y) < gate && A.stageOfRef(y).start >= s.start,
  );
  row([s.prefix, `${s.gate.label}${s.gate.major ? ' ★' : ''}`, `W${gate}`, review ? review.ref : '**none**', early.join(', ') || '—']);
}
p();
const majors = CPO_SKELETON.filter((s) => s.gate.major)
  .map((s) => ({ label: s.gate.label, wk: s.start + s.dur }))
  .sort((a, b) => a.wk - b.wk);
head(['Major gate', 'Week', 'Weeks after the previous']);
majors.forEach((m, i) => row([m.label, `W${m.wk}`, i ? m.wk - majors[i - 1].wk : '—']));

/* ---------------- V5 ---------------- */
p();
p('### V5 — critical path by dependency logic');
const c = A.cpm();
for (const end of ['RAMP-07', 'PKGA-06']) {
  p();
  p(`Into ${end} (${CPO_ACTIVITY_TITLES[end]}): logic finish W${c.ef(end)}, template finish W${A.absEnd(end)}`);
  p();
  head(['Activity', 'Item', 'Logic weeks', 'Template weeks', 'Wait']);
  for (const s of c.chainTo(end)) row([`${s.ref} ${CPO_ACTIVITY_TITLES[s.ref]}`, CPO_ACTIVITIES[s.ref].item, `W${s.es}–${s.ef}`, `W${A.absStart(s.ref)}–${A.absEnd(s.ref)}`, s.kind ?? '—']);
}
p();
p('Total float, in weeks, into the first package build (PKGA-06) and into production release (RAMP-07):');
p();
head(['Path', 'Activity', 'Into PKGA-06', 'Into RAMP-07']);
const fb = c.floatTo('PKGA-06');
const fr = c.floatTo('RAMP-07');
const PATHS: [string, string[]][] = [
  ['Optical engine', ['OTO-02', 'WFAB-04', 'WFAB-08', 'SORT-04', 'SORT-05', 'OEB-02', 'OEB-05', 'OEB-09', 'PKGA-04']],
  ['Switch SoC', ['MTO-01', 'WFAB-01', 'SORT-01', 'SORT-07', 'PKGA-03']],
  ['I/O die', ['MTO-02', 'WFAB-02', 'SORT-02']],
];
for (const [name, refs] of PATHS) for (const r of refs) row([name, `${r} ${CPO_ACTIVITY_TITLES[r]}`, fb(r) ?? '—', fr(r) ?? '—']);
p();
p(`Program length: before W${base.programWeeks}, after W${Math.max(...CPO_SKELETON.map((s) => s.start + s.dur))}.`);

/* ---------------- V6 ---------------- */
p();
p('### V6 — owner load');
p();
head(['Owner', 'Activities', 'Most at once', 'Weeks', 'Which']);
for (const o of A.ownerPeaks()) row([o.owner, o.total, o.peak, `W${o.from}–${o.to + 1}`, o.at.join(', ')]);

void CPO_WRITE_UPS;
console.log(out.join('\n'));
