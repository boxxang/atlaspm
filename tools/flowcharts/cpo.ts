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
  ['cpoPresilicon'],
  ['cpoOeStackDesign'],
  ['cpoPackageTestVehicle', 'cpoTestInfra'],
  ['cpoImplementation'],
  ['cpoSignoff'],
  ['cpoTapeoutOptical'],
  ['cpoTapeout'],
  ['cpoFabrication'],
  ['cpoSort'],
  ['cpoOeBuild', 'cpoAssembly'],
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
  ['cpoInterfaces', 'cpoOeStackDesign'],
  ['cpoFeasibility', 'cpoOeStackDesign'],
  ['cpoReadiness', 'cpoOeStackDesign'],
  ['cpoOeStackDesign', 'cpoTestInfra'],
  ['cpoOeStackDesign', 'cpoImplementation'],
  ['cpoInterfaces', 'cpoPackageTestVehicle'],
  ['cpoDesign', 'cpoPackageTestVehicle'],
  ['cpoFeasibility', 'cpoPackageTestVehicle'],
  ['cpoOeStackDesign', 'cpoPackageTestVehicle'],
  ['cpoPackageTestVehicle', 'cpoTestInfra'],
  ['cpoPackageTestVehicle', 'cpoImplementation'],
  ['cpoPackageTestVehicle', 'cpoSignoff'],
  ['cpoPackageTestVehicle', 'cpoAssembly'],
  ['cpoOeStackDesign', 'cpoSignoff'],
  ['cpoOeStackDesign', 'cpoTapeoutOptical'],
  ['cpoPresilicon', 'cpoSignoff'],
  ['cpoImplementation', 'cpoSignoff'],
  ['cpoSignoff', 'cpoTapeoutOptical'],
  ['cpoSignoff', 'cpoTapeout'],
  ['cpoTapeoutOptical', 'cpoFabrication'],
  ['cpoTapeout', 'cpoFabrication'],
  ['cpoFabrication', 'cpoSort'],
  ['cpoTestInfra', 'cpoSort'],
  ['cpoSort', 'cpoOeBuild'],
  ['cpoTestInfra', 'cpoOeBuild'],
  ['cpoOeBuild', 'cpoAssembly'],
  ['cpoSort', 'cpoAssembly'],
  ['cpoReadiness', 'cpoAssembly'],
  ['cpoAssembly', 'cpoPowerOn'],
  ['cpoPowerOn', 'cpoOpticalBringup'],
  ['cpoOeBuild', 'cpoOpticalBringup'],
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

/* The spine is the path that sets the first package build: the optical silicon, its engines, then the main package. */
const SPINE = [
  'cpoConcept',
  'cpoRequirements',
  'cpoArchitecture',
  'cpoInterfaces',
  'cpoDesign',
  'cpoImplementation',
  'cpoSignoff',
  'cpoTapeoutOptical',
  'cpoFabrication',
  'cpoSort',
  'cpoOeBuild',
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
  ['cpoOeStackDesign', 'cpoTapeoutOptical'],
  ['cpoPresilicon', 'cpoSignoff'],
  ['cpoPackageTestVehicle', 'cpoSignoff'],
  ['cpoTapeout', 'cpoFabrication'],
  ['cpoTestInfra', 'cpoSort'],
  ['cpoSort', 'cpoAssembly'],
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
    '<b>Spine</b> (bold) from concept to sustaining, through the path that sets the first package build: photonic and electrical ICs taped out in wave 1, fabricated, sorted and stacked into known-good optical engines, then mounted on the main package. <b>Feeds</b> (dashed) show where each block of work lands on it: feasibility → architecture, readiness &amp; models → detailed design, optical engine stack freeze → wave 1 tapeout, pre-silicon validation and the package test vehicles (MTV, TTV, CPI) → signoff, wave 2 tapeout (Switch SoC and I/O die) → fabrication, test infrastructure → wafer sort, known-good Switch SoC and I/O dies → main package build (its second input), debug → qualification, compliance &amp; NPI → production release.',
  second: {
    label: 'Package, optics &amp; test path',
    nodes: [
      'cpoFeasibility',
      'cpoReadiness',
      'cpoArchitecture',
      'cpoInterfaces',
      'cpoDesign',
      'cpoOeStackDesign',
      'cpoPackageTestVehicle',
      'cpoTestInfra',
      'cpoSort',
      'cpoOeBuild',
      'cpoAssembly',
      'cpoOpticalBringup',
      'cpoSystemIntegration',
      'cpoNpi',
      'cpoRamp',
    ],
    note: 'Test vehicles and supplier readiness → optical engine stack and main package designed beside the silicon → package test vehicles (MTV, TTV, CPI) freeze the assembly process window before the substrate is released → sort → known-good optical engines → main package first build from known-good dies and known-good engines → optical bring-up → NPI builds → production release.',
  },
  /* hand-offs drawn even though a longer route reaches the same stage: the
     main package build's second input, and the standalone engine bring-up */
  keep: ['cpoSort>cpoAssembly', 'cpoOeBuild>cpoOpticalBringup'],
  tags: {},
  tagStyle: {},
  origin: {},
  originDefault: '',
  statExtra: [],
  endTitle: 'Production Release',
  endNote: `Wave 1 Tapeout at W${at('cpoTapeoutOptical')} · All Dies Taped Out at W${at('cpoTapeout')} · First Silicon at W${at('cpoFabrication')} · Known-Good Optical Engines at W${at('cpoOeBuild')} · First Package Build at W${at('cpoAssembly')} · First Optical Link at W${at('cpoOpticalBringup')} · Production Release at W${at('cpoRamp')}`,
};

if (!CFG.keep.every((k) => EDGES.some(([a, z]) => `${a}>${z}` === k))) throw new Error('A kept link is not a link.');
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
/* the engine draws a transitive reduction; keep the hand-offs CFG.keep names */
swap(
  "if (SPINE_EDGES.has(a + '>' + z)) return true;",
  "if (SPINE_EDGES.has(a + '>' + z) || (CFG.keep || []).includes(a + '>' + z)) return true;",
);
swap('<h1>Typical SoC — Program Flowchart</h1>', '<h1>CPO Network Switch System — Program Flowchart</h1>');
out = out.replace(
  /<p>The full development flow of AtlasPM’s built-in <b>Typical SoC<\/b> template:[^<]*(<[^>]+>[^<]*)*?<\/p>/,
  '<p>The full development flow of AtlasPM’s built-in <b>CPO Network Switch System</b> template: a switch whose optics are co-packaged with the switching silicon — four dies (Switch SoC, I/O die, electrical IC, photonic IC) and two packages (the optical engine, with the electrical IC stacked on the photonic IC and its fiber, and the main package that carries the Switch SoC, the I/O die and the known-good engines), plus the optical source, bridge and silicon capacitors, board, cooling, firmware and software — from concept to sustaining. Stages are the program lifecycle, each closing on a gate; the components run as parallel activities inside them. Stages flow top to bottom by start week; columns are the lifecycle bands. Click any stage for its activities, deliverables and links.</p>',
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
