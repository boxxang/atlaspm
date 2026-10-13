/**
 * `npx tsx tools/ucieFlow/report.ts` — prints the computed sections of the UCIe
 * flow verification report (docs/ucieAdv64-flow-verification.md) as Markdown:
 * the content gap check against the brief, the block tracks, producer-consumer
 * checks, the gates and their exit criteria, the critical path with float, and
 * schedule and effort realism. Judgement is written in the report by hand.
 */
import { UCIE_ACTIVITIES, UCIE_ACTIVITY_TITLES, UCIE_SKELETON, UCIE_STAGES } from '../../src/data/ucieAdv64';
import { UCIE_WRITE_UPS } from '../../src/data/ucieAdv64/writeUps';
import * as A from './analysis';
import { REQUIRED } from './requirements';

const out: string[] = [];
const p = (s = '') => out.push(s);
const row = (cells: (string | number)[]) => p(`| ${cells.join(' | ')} |`);
const head = (cells: string[]) => {
  row(cells);
  row(cells.map(() => '---'));
};
const wk = (r: string) => `W${A.absStart(r)}–${A.absEnd(r)}`;

/* ---------------- V1 ---------------- */
p('### V1 — the brief’s required content, against the activities');
p();
head(['Stage', 'Required by the brief', 'Carried by', 'Status']);
let missing = 0;
for (const r of REQUIRED) {
  const ok = r.refs.length > 0 && r.refs.every((x) => UCIE_ACTIVITY_TITLES[x]);
  if (!ok) missing++;
  row([r.stage, r.what, r.refs.map((x) => `${x} ${UCIE_ACTIVITY_TITLES[x] ?? '**missing**'}`).join('; ') || '—', ok ? 'covered' : '**MISSING**']);
}
p();
p(`Required items: ${REQUIRED.length}; missing: ${missing}.`);

/* ---------------- V2 ---------------- */
p();
p('### V2 — each block, from definition to GA');
const PHASE: Record<string, string> = {
  define: 'Define',
  enable: 'Enable',
  designVerify: 'Design & verify',
  implement: 'Implement',
  integrate: 'Integrate',
  manufacture: 'Manufacture',
  siliconValidation: 'Silicon validation',
  ipRelease: 'IP release',
};
for (const item of ['adapter', 'logicalPhy', 'afe', 'channel', 'testchip', 'program']) {
  p();
  p(`**${item}**`);
  p();
  head(['Band', 'Activities (weeks)']);
  for (const [band, label] of Object.entries(PHASE)) {
    const refs = UCIE_SKELETON.filter((s) => s.band === band)
      .flatMap((s) => s.activities.filter((a) => a.item === item).map((a) => a.ref))
      .sort((x, y) => A.absStart(x) - A.absStart(y));
    row([label, refs.length ? refs.map((r) => `${r} (${wk(r)})`).join(', ') : '—']);
  }
}

/* ---------------- V3 ---------------- */
p();
p('### V3 — producer → consumer');
p();
const unlinked = A.ALL_REFS.flatMap((y) => A.namedProducers(y).filter((x) => x !== y && !A.predecessorsOf(y).includes(x)).map((x) => `${x} → ${y}`));
p(`Inputs named in a write-up's consumes list that are linked only as runsWith or revisedBy: ${unlinked.length}${unlinked.length ? ` — ${unlinked.join(', ')}` : ''}`);
const named = A.ALL_REFS.flatMap((y) => A.namedProducers(y).filter((x) => x !== y).map((x): [string, string] => [x, y]));
const late = named.filter(([x, y]) => A.absEnd(x) > A.absEnd(y));
p();
p(`Named inputs: ${named.length}. Producer finishes before the consumer finishes: ${named.length - late.length}. Producer finishes after (an interim output is consumed): ${late.length}.`);
p();
head(['Producer (ends)', 'Consumer (ends)', 'Consumes']);
for (const [x, y] of late) {
  const line = UCIE_WRITE_UPS[y].consumes.find((c) => c.includes(x)) ?? '';
  row([`${x} (W${A.absEnd(x)})`, `${y} (W${A.absEnd(y)})`, line]);
}
p();
p(`Isolated activities: ${A.isolated().join(', ') || 'none'}`);
const terminal = A.deliverableUse().filter((d) => d.downstream.length === 0);
p(`Deliverables whose producer feeds nothing downstream: ${terminal.map((d) => `${d.ref} (${d.producer})`).join(', ') || 'none'}`);

/* ---------------- V4 ---------------- */
p();
p('### V4 — gates and their exit criteria');
p();
head(['Stage', 'Gate', 'Week', 'Closed by', 'Exit criteria']);
for (const s of UCIE_SKELETON) {
  const ref = A.GATE_CLOSERS[s.key];
  row([s.prefix, `${s.gate.label}${s.gate.major ? ' ★' : ''}`, `W${s.start + s.dur}`, `${ref} ${UCIE_ACTIVITY_TITLES[ref]}`, UCIE_WRITE_UPS[ref].exit.join(' · ')]);
}

/* ---------------- V5 ---------------- */
p();
p('### V5 — critical path');
const c = A.cpm();
p();
p(`Into GA approval (UGA-05): logic finish W${c.ef('UGA-05')}, template finish W${A.absEnd('UGA-05')}.`);
p();
head(['Activity', 'Item', 'Logic weeks', 'Template weeks', 'Wait']);
for (const s of c.chainTo('UGA-05')) row([`${s.ref} ${UCIE_ACTIVITY_TITLES[s.ref]}`, UCIE_ACTIVITIES[s.ref].item, `W${s.es}–${s.ef}`, wk(s.ref), s.kind ?? '—']);
const f = c.floatTo('UGA-05');
p();
p('The planned spine, stage by stage, with total float into GA approval:');
p();
head(['Stage', 'Gate activity', 'Weeks', 'Float into GA (weeks)']);
for (const s of A.SPINE) for (const r of s.refs) row([s.stage, `${r} ${UCIE_ACTIVITY_TITLES[r]}`, wk(r), f(r) ?? '—']);
p();
p('Float on the channel and the test vehicle:');
p();
head(['Activity', 'Weeks', 'Float into GA', 'Float into tapeout (UTPO-04)', 'Float into silicon in hand (UFAB-05)']);
const fTo = c.floatTo('UTPO-04');
const fFab = c.floatTo('UFAB-05');
for (const st of ['ucieChannel', 'ucieTestVehicle']) {
  for (const a of UCIE_SKELETON.find((s) => s.key === st)!.activities) row([`${a.ref} ${a.title}`, wk(a.ref), f(a.ref) ?? '—', fTo(a.ref) ?? '—', fFab(a.ref) ?? '—']);
}

/* ---------------- V6 ---------------- */
p();
p('### V6 — schedule and effort realism');
p();
head(['Stage', 'Weeks', 'Activities', 'Step weeks / window (min–max)', 'Effort (man-months)']);
for (const s of UCIE_SKELETON) {
  const st = UCIE_STAGES.find((x) => x.id === s.key)!;
  const ratios = s.activities.map((a) => {
    const e = UCIE_ACTIVITIES[a.ref];
    return e.s.filter((x) => !x[3]).reduce((t, x) => t + x[2], 0) / (a.w[1] - a.w[0]);
  });
  row([s.prefix, `W${s.start}–${s.start + s.dur}`, s.activities.length, `${Math.min(...ratios).toFixed(2)}–${Math.max(...ratios).toFixed(2)}`, st.engineeringEffort.reduce((t, x) => t + x, 0)]);
}
/* effort spread evenly over each activity's window, summed by owner per 4-week period */
const load = new Map<string, number[]>();
const END = Math.max(...UCIE_SKELETON.map((s) => s.start + s.dur));
for (const s of UCIE_SKELETON) {
  const st = UCIE_STAGES.find((x) => x.id === s.key)!;
  s.activities.forEach((a, i) => {
    const per = st.engineeringEffort[i] / (a.w[1] - a.w[0]);
    const arr = load.get(a.owner) ?? Array(END).fill(0);
    for (let w = s.start + a.w[0]; w < s.start + a.w[1]; w++) arr[w] += per;
    load.set(a.owner, arr);
  });
}
p();
p('Peak staffing by owner — effort spread evenly over each window, in full-time people (man-months per week × 52 / 12):');
p();
head(['Owner', 'Total man-months', 'Peak people', 'Peak weeks']);
const peaks = [...load.entries()].map(([owner, arr]) => {
  const fte = arr.map((mmPerWeek) => (mmPerWeek * 52) / 12);
  const peak = Math.max(...fte);
  const at = fte.findIndex((x) => x === peak);
  let to = at;
  while (to + 1 < fte.length && Math.abs(fte[to + 1] - peak) < 1e-9) to++;
  return { owner, total: arr.reduce((t, x) => t + x, 0), peak, at, to };
});
for (const x of peaks.sort((a, b) => b.peak - a.peak)) row([x.owner, x.total.toFixed(0), x.peak.toFixed(1), `W${x.at}–${x.to + 1}`]);
const totalMm = peaks.reduce((t, x) => t + x.total, 0);
p();
p(`Total engineering effort: ${totalMm.toFixed(0)} man-months over ${END} weeks.`);

console.log(out.join('\n'));
