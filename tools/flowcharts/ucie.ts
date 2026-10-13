/**
 * `npx tsx tools/flowcharts/ucie.ts` — writes public/flowcharts/ucie-adv-64g.html,
 * the UCIe Advanced 64G Die-to-Die PHY IP template's program flowchart.
 *
 * The same drawing engine the other flowcharts use (the Typical SoC page),
 * fed from the template itself so the chart cannot drift from it, with this
 * program's layout: four workstreams — digital, electrical PHY, channel and
 * test vehicle, and the customer releases — drawn side by side, joining at
 * the test chip tapeout and again at silicon validation and production release.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { UCIE_ACTIVITY_TITLES, UCIE_PROFILE, UCIE_SKELETON, UCIE_STAGES } from '../../src/data/ucieAdv64';

const root = path.join(__dirname, '..', '..');
const engine = readFileSync(path.join(root, 'public/flowcharts/typical-soc.html'), 'utf8');

const STAGES = UCIE_PROFILE.stages.map((ps) => {
  const sk = UCIE_SKELETON.find((s) => s.key === ps.key)!;
  const st = UCIE_STAGES.find((s) => s.id === ps.key)!;
  return {
    key: ps.key,
    order: ps.order,
    title: ps.title,
    short: ps.shortTitle,
    phase: ps.phaseId,
    start: ps.startOffsetWeeks,
    dur: ps.durationWeeks,
    tagline: st.tagline,
    activities: sk.activities.map((a) => UCIE_ACTIVITY_TITLES[a.ref]),
    deliverables: [...st.deliverables],
    milestones: [{ label: sk.gate.label, major: !!sk.gate.major }],
  };
});

/*
 * One row per band at a time, top to bottom by start week — except where a
 * hand-off has to run down the page: the test chip and the v0.9 release sit
 * beside hard macro signoff, which both consume, and customer support beside
 * tapeout, after the release it starts from.
 */
const ROWS = [
  ['ucieConcept'],
  ['ucieRequirements', 'ucieTechnology'],
  ['ucieFoundation'],
  ['ucieArchitecture'],
  ['ucieChannel'],
  ['ucieAfe'],
  ['ucieRtl'],
  ['ucieDv'],
  ['ucieDft'],
  ['ucieAms'],
  ['ucieLayout'],
  ['ucieDigitalPd', 'ucieTestVehicle'],
  ['ucieSignoff', 'ucieTestChip', 'uciePreSilicon'],
  ['ucieTapeout', 'ucieCustomer'],
  ['ucieFab'],
  ['ucieBringup'],
  ['ucieCharacterization'],
  ['ucieReliability'],
  ['ucieCompliance'],
  ['ucieGa'],
];

/* Stage-to-stage hand-offs: the gate each stage closes on is what the next consumes. */
const EDGES: [string, string][] = [
  ['ucieConcept', 'ucieRequirements'],
  ['ucieConcept', 'ucieTechnology'],
  ['ucieRequirements', 'ucieArchitecture'],
  ['ucieTechnology', 'ucieFoundation'],
  ['ucieTechnology', 'ucieArchitecture'],
  ['ucieTechnology', 'ucieChannel'],
  ['ucieArchitecture', 'ucieChannel'],
  ['ucieArchitecture', 'ucieAfe'],
  ['ucieArchitecture', 'ucieRtl'],
  ['ucieArchitecture', 'ucieDv'],
  ['ucieArchitecture', 'ucieDft'],
  ['ucieFoundation', 'ucieAfe'],
  ['ucieFoundation', 'ucieRtl'],
  ['ucieFoundation', 'ucieDv'],
  ['ucieChannel', 'ucieAms'],
  ['ucieChannel', 'ucieLayout'],
  ['ucieChannel', 'ucieTestVehicle'],
  ['ucieChannel', 'ucieTestChip'],
  ['ucieAfe', 'ucieAms'],
  ['ucieAfe', 'ucieLayout'],
  ['ucieRtl', 'ucieDv'],
  ['ucieRtl', 'ucieDft'],
  ['ucieRtl', 'ucieDigitalPd'],
  ['ucieRtl', 'uciePreSilicon'],
  ['ucieDft', 'ucieDigitalPd'],
  ['ucieDft', 'ucieTestChip'],
  ['ucieDv', 'ucieSignoff'],
  ['ucieDv', 'ucieTestVehicle'],
  ['ucieAms', 'ucieLayout'],
  ['ucieAms', 'ucieSignoff'],
  ['ucieAms', 'ucieTestVehicle'],
  ['ucieLayout', 'ucieSignoff'],
  ['ucieDigitalPd', 'ucieSignoff'],
  ['ucieSignoff', 'ucieTestChip'],
  ['ucieSignoff', 'uciePreSilicon'],
  ['ucieTestChip', 'ucieTapeout'],
  ['ucieSignoff', 'ucieTapeout'],
  ['uciePreSilicon', 'ucieCustomer'],
  ['ucieTapeout', 'ucieFab'],
  ['ucieTestVehicle', 'ucieFab'],
  ['ucieTestVehicle', 'ucieBringup'],
  ['ucieFab', 'ucieBringup'],
  ['ucieFab', 'ucieReliability'],
  ['ucieBringup', 'ucieCharacterization'],
  ['ucieBringup', 'ucieCompliance'],
  ['ucieCharacterization', 'ucieGa'],
  ['ucieReliability', 'ucieGa'],
  ['ucieCompliance', 'ucieGa'],
  ['ucieCustomer', 'ucieGa'],
];

/* The spine is the electrical PHY: the longest design path and the one silicon proves. */
const SPINE = [
  'ucieConcept',
  'ucieRequirements',
  'ucieArchitecture',
  'ucieAfe',
  'ucieAms',
  'ucieLayout',
  'ucieSignoff',
  'ucieTestChip',
  'ucieTapeout',
  'ucieFab',
  'ucieBringup',
  'ucieCharacterization',
  'ucieGa',
];
const RIBS: [string, string][] = [
  ['ucieTechnology', 'ucieArchitecture'],
  ['ucieFoundation', 'ucieAfe'],
  ['ucieChannel', 'ucieAms'],
  ['ucieDigitalPd', 'ucieSignoff'],
  ['ucieTestVehicle', 'ucieBringup'],
  ['ucieReliability', 'ucieGa'],
  ['ucieCompliance', 'ucieGa'],
  ['ucieCustomer', 'ucieGa'],
];

const at = (key: string) => {
  const s = STAGES.find((x) => x.key === key)!;
  return s.start + s.dur;
};

/* the four workstreams, labelled on their stages */
const STREAM: Record<string, string> = {
  ucieRtl: 'Digital',
  ucieDft: 'Digital',
  ucieDv: 'Digital',
  ucieDigitalPd: 'Digital',
  ucieAfe: 'Electrical PHY',
  ucieAms: 'Electrical PHY',
  ucieLayout: 'Electrical PHY',
  ucieChannel: 'Channel',
  ucieTestChip: 'Test vehicle',
  ucieTestVehicle: 'Test vehicle',
  uciePreSilicon: 'Release',
  ucieGa: 'Release',
  ucieCustomer: 'Release',
};

const CFG = {
  rows: ROWS,
  edges: EDGES,
  spine: SPINE,
  ribs: RIBS,
  /* drawn even though a longer route reaches the same stage */
  keep: ['ucieSignoff>ucieTapeout', 'ucieTestVehicle>ucieBringup', 'ucieRtl>uciePreSilicon'],
  siliconNote:
    '<b>Spine</b> (bold) from concept to production release through the electrical PHY — circuit design, link margin, layout, hard macro signoff, the test chip, silicon and characterization. <b>Feeds</b> (dashed) show where the other workstreams join it: technology and foundation IP → architecture and circuits, the channel → link margin, digital implementation → signoff, the test vehicle and boards → bring-up, reliability, compliance and customer integration → production release.',
  second: {
    label: 'Channel, test vehicle &amp; release path',
    nodes: [
      'ucieTechnology',
      'ucieChannel',
      'ucieTestVehicle',
      'ucieTestChip',
      'ucieRtl',
      'ucieSignoff',
      'uciePreSilicon',
      'ucieCustomer',
      'ucieTapeout',
      'ucieFab',
      'ucieBringup',
      'ucieGa',
    ],
    note: 'Package technology → channel specification and bump map → test chip and test vehicle → tapeout, fab and bring-up; and the releases: v0.5 from the RTL freeze, v0.9 from hard macro signoff, customer integration from v0.5, production release from silicon.',
  },
  tags: STREAM,
  tagStyle: {
    Digital: ['#2b6cd4', '#e8f0fc'],
    'Electrical PHY': ['#7a4bd0', '#f1ebfb'],
    Channel: ['#0b8aa8', '#e6f5f9'],
    'Test vehicle': ['#b8680d', '#fbf1e4'],
    Release: ['#c9357a', '#fbeaf2'],
  },
  origin: {},
  originDefault: '',
  statExtra: [],
  endTitle: 'IP Production Release',
  endNote: `v0.5 at W${STAGES.find((s) => s.key === 'uciePreSilicon')!.start + 8} · Architecture Freeze at W${at('ucieArchitecture')} · Hard Macro Signoff at W${at('ucieSignoff')} · Tapeout at W${at('ucieTapeout')} · Silicon in Hand at W${at('ucieFab')} · Silicon-Proven at W${at('ucieReliability')} · production release at W${at('ucieGa')}`,
};

if (!CFG.keep.every((k) => EDGES.some(([a, z]) => `${a}>${z}` === k))) throw new Error('A kept link is not a link.');
const edgesOk = EDGES.every(([a, z]) => STAGES.some((s) => s.key === a) && STAGES.some((s) => s.key === z));
const rowsOk = ROWS.flat().length === STAGES.length && STAGES.every((s) => ROWS.flat().includes(s.key));
for (const row of ROWS) {
  const bands = row.map((k) => STAGES.find((s) => s.key === k)!.phase);
  if (new Set(bands).size !== bands.length) throw new Error(`Row ${row.join(', ')} puts two stages in one band`);
}
if (!edgesOk || !rowsOk) throw new Error('Flowchart layout does not match the template.');
const rowOf = (k: string) => ROWS.findIndex((r) => r.includes(k));
const upward = EDGES.filter(([a, z]) => rowOf(z) < rowOf(a));
if (upward.length) throw new Error(`Links run up the page: ${upward.map((e) => e.join(' -> ')).join(', ')}`);
for (let i = 1; i < SPINE.length; i++) {
  if (!EDGES.some(([a, z]) => a === SPINE[i - 1] && z === SPINE[i])) throw new Error(`Spine ${SPINE[i - 1]} -> ${SPINE[i]} is not a link`);
}

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
swap('<title>Typical SoC Flow</title>', '<title>UCIe Advanced 64G PHY IP Flow</title>');
swap('<h1>Typical SoC — Program Flowchart</h1>', '<h1>UCIe Advanced 64G Die-to-Die PHY IP — Program Flowchart</h1>');
/* the two IP-program bands, after the ones the engine knows */
swap(
  "  { id: 'platform', label: 'Developer Platform & Ecosystem' },\n];",
  "  { id: 'platform', label: 'Developer Platform & Ecosystem' },\n  { id: 'siliconValidation', label: 'Silicon Validation' },\n  { id: 'ipRelease', label: 'IP Release & Enablement' },\n];",
);
swap('  --b-platform: #c9357a;', '  --b-platform: #c9357a;\n  --b-siliconValidation: #2f8f46;\n  --b-ipRelease: #c9357a;');
swap(
  "if (SPINE_EDGES.has(a + '>' + z)) return true;",
  "if (SPINE_EDGES.has(a + '>' + z) || (CFG.keep || []).includes(a + '>' + z)) return true;",
);
out = out.replace(
  /<p>The full development flow of AtlasPM’s built-in <b>Typical SoC<\/b> template:[^<]*(<[^>]+>[^<]*)*?<\/p>/,
  '<p>The full development flow of AtlasPM’s built-in <b>UCIe Advanced 64G Die-to-Die PHY IP</b> template: a die-to-die PHY for UCIe Advanced packages at 64 GT/s — D2D Adapter, Logical PHY and sideband, Electrical PHY, bumps and channel — newly developed, proven on a test chip on an advanced-package test vehicle, and released to the customers who integrate it, from concept to production release. Four workstreams run side by side — digital, electrical PHY, channel and test vehicle, and the customer releases — and join at the test chip tapeout, at silicon validation and at production release. Stages flow top to bottom by start week; columns are the lifecycle bands. Click any stage for its activities, deliverables and links.</p>',
);
swap('<button data-mode="silicon" aria-pressed="false">Silicon path</button>', '<button data-mode="silicon" aria-pressed="false">Electrical PHY path</button>');
swap('<button data-mode="platform" aria-pressed="false">Package &amp; test path</button>', '<button data-mode="platform" aria-pressed="false">Channel, test vehicle &amp; release path</button>');
swap("' years kickoff → MP'", "' years kickoff → sustaining handover'");
out = out.replace(
  /<footer>Source:[\s\S]*?<\/footer>/,
  '<footer>Source: <code>src/data/ucieAdv64/skeleton.ts</code> and the stage modules beside it — the <code>ucieAdv64</code> profile’s baselines, gates and stage content. Links between stages summarise the hand-offs between lifecycle gates; each activity’s own dependencies are on its write-up page in the app.</footer>',
);
if (!out.includes('UCIe Advanced 64G Die-to-Die PHY IP</b> template')) throw new Error('Intro paragraph was not replaced.');

writeFileSync(path.join(root, 'public/flowcharts/ucie-adv-64g.html'), out);
console.log(`Wrote public/flowcharts/ucie-adv-64g.html — ${STAGES.length} stages, ${EDGES.length} links.`);
