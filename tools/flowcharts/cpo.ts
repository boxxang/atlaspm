/**
 * `npx tsx tools/flowcharts/cpo.ts` — writes public/flowcharts/cpo-switch.html,
 * the CPO Network Switch System template's program flowchart.
 *
 * The flowchart pages are one drawing engine fed two constants: STAGES (each
 * stage's band, weeks, activities, deliverables and gate) and CFG (the rows
 * the stages are laid out in, the stage-to-stage links, the silicon spine and
 * the second path). This takes the Typical SoC page as the engine, fills
 * STAGES from the template itself so the chart cannot drift from it, and
 * gives the CPO program's own layout and links.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CPO_ACTIVITY_TITLES, CPO_PROFILE, CPO_SKELETON, CPO_STAGES } from '../../src/data/cpoSwitch';

const root = path.join(__dirname, '..', '..');
const engine = readFileSync(path.join(root, 'public/flowcharts/typical-soc.html'), 'utf8');

const STAGES = CPO_PROFILE.stages.map((ps) => {
  const sk = CPO_SKELETON.find((s) => s.key === ps.key)!;
  const st = CPO_STAGES.find((s) => s.id === ps.key)!;
  return {
    key: ps.key,
    order: ps.order,
    title: ps.title,
    short: ps.shortTitle,
    phase: ps.phaseId,
    start: ps.startOffsetWeeks,
    dur: ps.durationWeeks,
    tagline: st.tagline,
    activities: sk.activities.map((a) => CPO_ACTIVITY_TITLES[a.ref]),
    deliverables: [...st.deliverables],
    milestones: [{ label: sk.gate.label, major: !!sk.gate.major }],
  };
});

/* One row per band at a time, top to bottom by start week. */
const ROWS = [
  ['cpoConcept'],
  ['cpoRequirements', 'cpoFeasibility'],
  ['cpoReadiness'],
  ['cpoArchitecture'],
  ['cpoModeling'],
  ['cpoInterfaces'],
  ['cpoProgramControl'],
  ['cpoDesign'],
  ['cpoPresilicon', 'cpoTestInfra'],
  ['cpoImplementation'],
  ['cpoSignoff'],
  ['cpoTapeout'],
  ['cpoFabrication'],
  ['cpoSort', 'cpoAssembly'],
  ['cpoPowerOn'],
  ['cpoDebug'],
  ['cpoOpticalBringup'],
  ['cpoSystemIntegration'],
  ['cpoNpi'],
  ['cpoCharacterization'],
  ['cpoCompliance'],
  ['cpoQualification'],
  ['cpoRamp'],
  ['cpoSustaining'],
];

/* Stage-to-stage hand-offs: the gate each stage closes on is what the next consumes. */
const EDGES: [string, string][] = [
  ['cpoConcept', 'cpoRequirements'],
  ['cpoConcept', 'cpoFeasibility'],
  ['cpoConcept', 'cpoReadiness'],
  ['cpoRequirements', 'cpoArchitecture'],
  ['cpoFeasibility', 'cpoArchitecture'],
  ['cpoArchitecture', 'cpoInterfaces'],
  ['cpoArchitecture', 'cpoModeling'],
  ['cpoInterfaces', 'cpoProgramControl'],
  ['cpoInterfaces', 'cpoDesign'],
  ['cpoModeling', 'cpoDesign'],
  ['cpoReadiness', 'cpoDesign'],
  ['cpoFeasibility', 'cpoReadiness'],
  ['cpoModeling', 'cpoPresilicon'],
  ['cpoDesign', 'cpoPresilicon'],
  ['cpoDesign', 'cpoImplementation'],
  ['cpoDesign', 'cpoTestInfra'],
  ['cpoPresilicon', 'cpoSignoff'],
  ['cpoImplementation', 'cpoSignoff'],
  ['cpoSignoff', 'cpoTapeout'],
  ['cpoTapeout', 'cpoFabrication'],
  ['cpoFabrication', 'cpoSort'],
  ['cpoTestInfra', 'cpoSort'],
  ['cpoReadiness', 'cpoAssembly'],
  ['cpoSort', 'cpoAssembly'],
  ['cpoAssembly', 'cpoPowerOn'],
  ['cpoPowerOn', 'cpoOpticalBringup'],
  ['cpoPowerOn', 'cpoDebug'],
  ['cpoOpticalBringup', 'cpoSystemIntegration'],
  ['cpoSystemIntegration', 'cpoCharacterization'],
  ['cpoSystemIntegration', 'cpoNpi'],
  ['cpoTestInfra', 'cpoNpi'],
  ['cpoCharacterization', 'cpoCompliance'],
  ['cpoCharacterization', 'cpoQualification'],
  ['cpoDebug', 'cpoQualification'],
  ['cpoQualification', 'cpoRamp'],
  ['cpoCompliance', 'cpoRamp'],
  ['cpoNpi', 'cpoRamp'],
  ['cpoRamp', 'cpoSustaining'],
  ['cpoProgramControl', 'cpoSustaining'],
];

const SPINE = [
  'cpoConcept',
  'cpoRequirements',
  'cpoArchitecture',
  'cpoInterfaces',
  'cpoDesign',
  'cpoImplementation',
  'cpoSignoff',
  'cpoTapeout',
  'cpoFabrication',
  'cpoSort',
  'cpoAssembly',
  'cpoPowerOn',
  'cpoOpticalBringup',
  'cpoSystemIntegration',
  'cpoCharacterization',
  'cpoQualification',
  'cpoRamp',
  'cpoSustaining',
];
const RIBS: [string, string][] = [
  ['cpoFeasibility', 'cpoArchitecture'],
  ['cpoReadiness', 'cpoDesign'],
  ['cpoModeling', 'cpoDesign'],
  ['cpoPresilicon', 'cpoSignoff'],
  ['cpoTestInfra', 'cpoSort'],
  ['cpoDebug', 'cpoQualification'],
  ['cpoCompliance', 'cpoRamp'],
  ['cpoNpi', 'cpoRamp'],
];

const at = (key: string) => {
  const s = STAGES.find((x) => x.key === key)!;
  return s.start + s.dur;
};

const CFG = {
  rows: ROWS,
  edges: EDGES,
  spine: SPINE,
  ribs: RIBS,
  siliconNote:
    '<b>Spine</b> (bold) from concept to sustaining. <b>Feeds</b> (dashed) show where each block of work lands on it: feasibility → architecture, readiness &amp; models → detailed design, pre-silicon validation → signoff, test infrastructure → wafer sort, debug → qualification, compliance &amp; NPI → production release.',
  second: {
    label: 'Package, optics &amp; test path',
    nodes: [
      'cpoFeasibility',
      'cpoReadiness',
      'cpoArchitecture',
      'cpoInterfaces',
      'cpoDesign',
      'cpoTestInfra',
      'cpoSort',
      'cpoAssembly',
      'cpoOpticalBringup',
      'cpoSystemIntegration',
      'cpoNpi',
      'cpoRamp',
    ],
    note: 'Test vehicles and supplier readiness → package, optics and test designed beside the silicon → sort and first package build → optical bring-up → NPI builds → production release.',
  },
  tags: {},
  tagStyle: {},
  origin: {},
  originDefault: '',
  statExtra: [],
  endTitle: 'Production Release',
  endNote: `Tapeout at W${at('cpoTapeout')} · First Silicon at W${at('cpoFabrication')} · First Optical Link at W${at('cpoOpticalBringup')} · Production Release at W${at('cpoRamp')}`,
};

const edgesOk = EDGES.every(([a, z]) => STAGES.some((s) => s.key === a) && STAGES.some((s) => s.key === z));
const rowsOk = ROWS.flat().length === STAGES.length && STAGES.every((s) => ROWS.flat().includes(s.key));
for (const row of ROWS) {
  const bands = row.map((k) => STAGES.find((s) => s.key === k)!.phase);
  if (new Set(bands).size !== bands.length) throw new Error(`Row ${row.join(', ')} puts two stages in one band`);
}
if (!edgesOk || !rowsOk) throw new Error('Flowchart layout does not match the template.');
/* the engine routes a link down the page or across a row, never back up it */
const rowOf = (k: string) => ROWS.findIndex((r) => r.includes(k));
const upward = EDGES.filter(([a, z]) => rowOf(z) < rowOf(a));
if (upward.length) throw new Error(`Links run up the page: ${upward.map((e) => e.join(' -> ')).join(', ')}`);

const replaceLine = (html: string, prefix: string, body: string) => {
  const i = html.indexOf(prefix);
  if (i < 0) throw new Error(`No ${prefix} in the engine page.`);
  const j = html.indexOf('\n', i);
  return html.slice(0, i) + prefix + body + html.slice(j);
};

let out = engine;
out = replaceLine(out, 'const STAGES = ', `${JSON.stringify(STAGES)};`);
out = replaceLine(out, 'const CFG = ', `${JSON.stringify(CFG)};`);
const swap = (from: string, to: string) => {
  if (!out.includes(from)) throw new Error(`No "${from.slice(0, 40)}" in the engine page.`);
  out = out.replace(from, to);
};
swap('<title>Typical SoC Flow</title>', '<title>CPO Network Switch System Flow</title>');
swap('<h1>Typical SoC — Program Flowchart</h1>', '<h1>CPO Network Switch System — Program Flowchart</h1>');
out = out.replace(
  /<p>The full development flow of AtlasPM’s built-in <b>Typical SoC<\/b> template:[^<]*(<[^>]+>[^<]*)*?<\/p>/,
  '<p>The full development flow of AtlasPM’s built-in <b>CPO Network Switch System</b> template: a switch whose optics are co-packaged with the switching silicon — switch ASIC, high-speed I/O, electrical and photonic ICs, optical source, bridge and silicon capacitors, advanced package and fiber, board, cooling, firmware and software — from concept to sustaining. Stages are the program lifecycle, each closing on a gate; the components run as parallel activities inside them. Stages flow top to bottom by start week; columns are the lifecycle bands. Click any stage for its activities, deliverables and links.</p>',
);
swap('<button data-mode="platform" aria-pressed="false">Package &amp; test path</button>', '<button data-mode="platform" aria-pressed="false">Package, optics &amp; test path</button>');
swap("' years kickoff → MP'", "' years kickoff → sustaining handover'");
out = out.replace(
  /<footer>Source:[\s\S]*?<\/footer>/,
  '<footer>Source: <code>src/data/cpoSwitch/skeleton.ts</code> and the stage modules beside it — the <code>cpoSwitch</code> profile’s baselines, gates and stage content. Links between stages summarise the hand-offs between lifecycle gates; each activity’s own dependencies are on its write-up page in the app.</footer>',
);
if (!out.includes('CPO Network Switch System</b> template')) throw new Error('Intro paragraph was not replaced.');

writeFileSync(path.join(root, 'public/flowcharts/cpo-switch.html'), out);
console.log(`Wrote public/flowcharts/cpo-switch.html — ${STAGES.length} stages, ${EDGES.length} links.`);
