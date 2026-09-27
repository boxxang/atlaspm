/**
 * Writes the sign-off templates a key deliverable's handover can be started
 * from, into public/templates/.
 *
 *   npx tsx --tsconfig tsconfig.json tools/deliverable-templates/build.ts
 *
 * A template is the document the handover attaches: the gate evidence for
 * RTL freeze, DV closure, the FPGA signoff, the PD handoff, the signoff
 * summary, and the eMRAM, PMU and DFT signoffs that feed them. Each is built
 * from the write-up of the activity that produces the deliverable — its entry
 * and exit criteria, its risks, its roles and whom it hands over to — so the
 * template and the page cannot ask for different things. What only a template
 * needs, the baseline to name and the checks to record, is written here.
 *
 * Generated rather than drawn by hand so that a change to a write-up reaches
 * the template on the next run. src/data/deliverableTemplates.ts lists what
 * this writes; a test holds the two to each other.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { ALL_ACTIVITIES, ALL_ACTIVITY_TITLES, ALL_DELIVERABLE_TITLES } from '../../src/data/builtins';
import { DELIVERABLE_TEMPLATES } from '../../src/data/deliverableTemplates';
import { EMBEDDED_PROFILE } from '../../src/data/embeddedSoc';
import { embeddedDetail } from '../../src/data/embeddedSocDetails';
import { deliverableStep, producersOf } from '../../src/lib/deliverableStatus';

/* ---------- what only the templates say ---------- */

interface Spec {
  /** What the signoff is taken against: each a row to name a version or tag. */
  baseline: string[];
  /** The checks recorded, each [check, target or limit]. */
  checks: [string, string][];
  /** A section only this deliverable carries. */
  extra?: { heading: string; intro: string; columns: string[]; rows: number };
}

const SPECS: Record<string, Spec> = {
  'MRAM-D7': {
    baseline: [
      'eMRAM macro view release (vendor version)',
      'PDK and eMRAM module rule version',
      'Placement database and turn signed off on',
      'IR / EM analysis run ID and corner set',
      'Controller, ECC and trim configuration (MRAM-D2 version)',
    ],
    checks: [
      ['Macro pin timing — setup and hold, all signoff corners', 'Within vendor limits, no negative slack'],
      ['Static IR drop at the macro supply pins', 'Below the vendor limit'],
      ['Dynamic IR drop during write', 'Below the vendor limit at the write corner'],
      ['Electromigration on the write supply', 'Clean at the hot corner'],
      ['Keep-out and placement rules around the macro', 'No violations'],
      ['Magnetic immunity guidance carried into customer documentation (MRAM-D4)', 'Referenced in the datasheet draft'],
      ['Test, repair and trim flow consistent with the integrated configuration (MRAM-D6)', 'Aligned'],
    ],
    extra: {
      heading: 'Conditions for reopening',
      intro: 'A trial layout is not the final one. List what change to the database reopens this signoff.',
      columns: ['Trigger', 'What is re-checked', 'Owner'],
      rows: 3,
    },
  },
  'PMU-D7': {
    baseline: [
      'Analog macro view release (regulators, POR/BOR, oscillators, PLL)',
      'Top-level database and run signed off on',
      'ESD / latch-up rule deck version',
      'Energy budget version (PMU-D6)',
    ],
    checks: [
      ['ESD on every supply pin — HBM and CDM', 'Meets the pin classification target'],
      ['Latch-up spacing around the regulators and I/O', 'No violations'],
      ['Electromigration on regulator outputs and supply straps', 'Clean at the hot corner'],
      ['Analog macros clean in top-level DRC and LVS', 'Zero errors or waived'],
      ['POR and brown-out thresholds in context', 'Match the power architecture specification'],
      ['Regulator line and load response across 1.8–5.5 V in context', 'Within specification'],
      ['Sleep and deep-sleep current estimate after integration', 'Within the PMU-D6 budget'],
      ['Oscillator placement and noise isolation', 'Per layout guidance'],
    ],
    extra: {
      heading: 'Conditions for reopening',
      intro: 'The first top-level runs are not the final ones. List what change reopens this signoff.',
      columns: ['Trigger', 'What is re-checked', 'Owner'],
      rows: 3,
    },
  },
  'EDFT-D7': {
    baseline: [
      'Gate-level netlist and SDF version',
      'Pattern set release (stuck-at, transition, cell-aware, MBIST)',
      'Target ATE platform and timing set',
      'Tester memory depth assumed',
    ],
    checks: [
      ['Stuck-at coverage', 'At or above the EDFT-D1 target'],
      ['Transition (at-speed) coverage', 'At or above the EDFT-D1 target'],
      ['Cell-aware coverage', 'At or above the EDFT-D1 target'],
      ['MBIST — SRAM and eMRAM algorithms, repair and trim paths', 'All memories covered and validated'],
      ['Zero-delay gate-level pattern simulation', 'All sets pass'],
      ['SDF-annotated pattern simulation at the signoff corners', 'All sets pass'],
      ['STIL / WGL conversion validated on the ATE', 'Loads and runs with the target timing set'],
      ['Pattern volume against tester memory', 'Fits with margin'],
      ['Test time against the ETEST-D6 budget', 'Within budget'],
      ['JTAG / IJTAG description files (BSDL, ICL, PDL)', 'Validated'],
    ],
  },
  'ERTL-D7': {
    baseline: [
      'RTL release tag (block and top level)',
      'IP version manifest (ERTL-D4)',
      'UPF power intent version',
      'Register map / RDL version',
      'Boot ROM image frozen for tapeout (SDK-D1)',
    ],
    checks: [
      ['Every block tagged in the release', 'All blocks'],
      ['Lint, CDC and RDC', 'Clean, with every waiver signed'],
      ['Trial synthesis QoR against the block budgets', 'Within budget or dispositioned'],
      ['Open change requests', 'None open, or each deferred with an owner'],
      ['Verification status at freeze (EDV)', 'Stated, with the remaining holes listed'],
      ['IP deliveries final', 'All IP at its final version'],
      ['UPF consistent with the RTL', 'Checked'],
    ],
    extra: {
      heading: 'Post-freeze exception policy',
      intro: 'After freeze, a change is admitted only through this policy. State who approves and on what evidence.',
      columns: ['Change class', 'Admission rule', 'Approver'],
      rows: 3,
    },
  },
  'EDV-D7': {
    baseline: [
      'RTL release verified (tag)',
      'Regression suite version and tier',
      'Merged coverage database ID',
      'Verification plan version (EDV-D1)',
    ],
    checks: [
      ['Functional coverage, per block and chip level', 'At or above the vPlan target'],
      ['Code coverage — line, branch, toggle, FSM', 'At or above target, every hole analysed'],
      ['Assertion coverage', 'At or above target'],
      ['Formal proofs', 'All proven or bounded with the bound stated'],
      ['Low-power — every sleep mode, retention and wake source', 'All scenarios passing'],
      ['Gate-level simulation', 'Passing, X-propagation clean'],
      ['Regression pass rate and flake rate', 'Stable over the last three weeks'],
      ['Open bugs by severity', 'No open critical or high'],
      ['Coverage trend over the last four weeks', 'Flat — not still climbing'],
    ],
  },
  'FPV-D6': {
    baseline: [
      'Final RTL tag including every ECO',
      'FPGA image ID built from that tag',
      'Test list version (FPV-D1)',
      'Compiler and SDK versions used',
    ],
    checks: [
      ['Full regression on the tapeout RTL', 'All tests run'],
      ['Test list pass rate', 'At or above the exit criterion'],
      ['Peripheral interoperability with real devices and shields', 'Pass'],
      ['Boot paths — eMRAM, UART, SPI flash, JTAG, secure boot', 'Pass'],
      ['Compiled workloads against the simulator', 'Results match'],
      ['Soak and stability run', 'Hours met without failure'],
      ['SDK driver and RTOS regression', 'Pass'],
      ['Open FPGA bugs', 'Each fixed, or waived with a workaround and owner'],
    ],
    extra: {
      heading: 'What the prototype could not show',
      intro: 'Restate the blind spots from FPV-D2 and who covers each — power gating, analog behaviour, silicon timing.',
      columns: ['Blind spot', 'Covered by', 'Owner'],
      rows: 3,
    },
  },
  'EPD-D8': {
    baseline: [
      'FFN tag the database is built from',
      'Database version and handoff directory',
      'SDC and UPF versions',
      'PDK, library and signoff deck versions',
    ],
    checks: [
      ['Setup and hold timing across all corners and modes', 'WNS ≥ 0, TNS reported'],
      ['Block models correlated against flat analysis', 'Within the agreed tolerance'],
      ['DRC, LVS and antenna', 'Clean or waived'],
      ['Static and dynamic IR drop', 'Within budget'],
      ['Electromigration — power and signal', 'Clean at the hot corner'],
      ['Scan chains verified after reordering', 'All chains pass'],
      ['Fill and density', 'Compliant'],
      ['eMRAM, PMU and oscillator macro placement against vendor rules', 'Compliant'],
      ['ECO log reconciled with the netlist', 'Reconciled'],
    ],
    extra: {
      heading: 'Handoff file list',
      intro: 'Every file signoff and tapeout will read, with its version and checksum.',
      columns: ['File (GDS/OASIS, netlist, SPEF, SDF, UPF, …)', 'Version', 'Checksum'],
      rows: 6,
    },
  },
  'ESO-D7': {
    baseline: [
      'Final database signed off (version and checksum)',
      'Signoff deck versions per domain',
      'Foundry waiver submission references',
    ],
    checks: [
      ['Static timing — all corners and modes', 'Signed off'],
      ['DRC, LVS, antenna and density', 'Clean or waived'],
      ['EM / IR', 'Signed off'],
      ['ESD, latch-up and FIT', 'Signed off'],
      ['DFM and lithography hotspots', 'Signed off'],
      ['Signal integrity', 'Signed off'],
      ['Final formal equivalence', 'Equivalent'],
      ['Gate-level simulation with final SDF', 'Passing'],
      ['Leakage and sleep current against the budget', 'Within budget'],
    ],
    extra: {
      heading: 'Residual risk statement',
      intro: 'One statement for the gate: what risk the design is frozen with, and why it is accepted.',
      columns: ['Residual risk', 'Accepted because', 'Owner'],
      rows: 3,
    },
  },
};

/* ---------- document building blocks ---------- */

const FONT = 'Arial';
const INK = '1F2328';
const MUTED = '6E7781';
const ACCENT = '5B5BD6';
const RULE = 'D0D7DE';
const HEAD_FILL = 'EEF0FB';
/* A4 with 2 cm margins: 11906 − 2 × 1134 twips of text width. */
const WIDTH = 9638;

const strip = (s: string) =>
  s
    .replace(/<\/?(b|code)>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const text = (t: string, o: { bold?: boolean; color?: string; size?: number; italics?: boolean } = {}) =>
  new TextRun({ text: t, font: FONT, bold: o.bold, color: o.color ?? INK, size: o.size ?? 20, italics: o.italics });

const para = (t: string, o: Parameters<typeof text>[1] & { after?: number } = {}) =>
  new Paragraph({ children: [text(t, o)], spacing: { after: o.after ?? 80 } });

const heading = (t: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: t, font: FONT, bold: true, size: 24, color: INK })],
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 2 } },
  });

const border = { style: BorderStyle.SINGLE, size: 4, color: RULE };
const borders = { top: border, bottom: border, left: border, right: border };

const cell = (t: string, width: number, o: { head?: boolean; muted?: boolean } = {}) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: o.head ? { fill: HEAD_FILL, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        children: [text(t, { bold: o.head, size: o.head ? 18 : 19, color: o.muted ? MUTED : INK })],
      }),
    ],
  });

/** A table: header row, filled rows, then blank rows to write in. */
const table = (columns: string[], widths: number[], rows: string[][], blank = 0) =>
  new Table({
    width: { size: WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: columns.map((c, i) => cell(c, widths[i], { head: true })) }),
      ...rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, widths[i], { muted: !c })) })),
      ...Array.from({ length: blank }, () => new TableRow({ children: widths.map((w) => cell('', w)) })),
    ],
  });

const split = (fractions: number[]) => {
  const w = fractions.map((f) => Math.floor(WIDTH * f));
  w[w.length - 1] += WIDTH - w.reduce((a, b) => a + b, 0);
  return w;
};

/* a checklist line: the box is the mark, so no list numbering is wanted */
const checkLine = (t: string) => new Paragraph({ indent: { left: 200 }, children: [text(t)], spacing: { after: 60 } });

const gap = () => new Paragraph({ children: [], spacing: { after: 60 } });

/* ---------- one template ---------- */

const producers = producersOf(ALL_ACTIVITIES);
const stageTitle = (key: string) => EMBEDDED_PROFILE.stages.find((s) => s.key === key)?.title ?? key;

function build(ref: string): Document {
  const spec = SPECS[ref];
  if (!spec) throw new Error(`no template spec for ${ref}`);
  const step = deliverableStep(ref, producers);
  if (!step) throw new Error(`${ref} has no producing activity`);
  const act = step.act;
  const a = ALL_ACTIVITIES[act];
  const w = embeddedDetail(act);
  if (!w) throw new Error(`${act} has no write-up`);
  const title = ALL_DELIVERABLE_TITLES[ref];

  const body = [
    new Paragraph({
      children: [text('AtlasPM · Embedded SoC · Key deliverable template', { size: 18, color: ACCENT, bold: true })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: `${ref} — ${title}`, font: FONT, bold: true, size: 34, color: INK })],
      spacing: { after: 80 },
    }),
    para(
      `Produced by ${act} ${ALL_ACTIVITY_TITLES[act]} (${stageTitle(a.st)}). Fill in each section, attach the completed document to this deliverable's Handover in AtlasPM, and date the handover when it is accepted.`,
      { color: MUTED, italics: true, size: 19, after: 160 },
    ),

    heading('1. Document control'),
    table(
      ['Field', 'Entry'],
      split([0.32, 0.68]),
      [
        ['Programme', ''],
        ['Deliverable', `${ref} — ${title}`],
        ['Stage', stageTitle(a.st)],
        ['Producing activity', `${act} — ${ALL_ACTIVITY_TITLES[act]}`],
        ['Owner', a.ro],
        ['Version / date', ''],
        ['Status', 'Draft  /  For review  /  Signed'],
      ],
    ),

    heading('2. Decision'),
    para('☐ Signed off     ☐ Signed off with conditions     ☐ Not signed off', { bold: true }),
    table(['Field', 'Entry'], split([0.32, 0.68]), [['Summary', ''], ['Conditions', ''], ['Next review', '']]),

    heading('3. Baseline signed off against'),
    table(['Item', 'Version / tag / ID'], split([0.55, 0.45]), spec.baseline.map((b) => [b, ''])),

    heading('4. Entry criteria'),
    table(
      ['Criterion', 'Evidence (link or file)', 'Met'],
      split([0.5, 0.38, 0.12]),
      w.entry.map((e) => [strip(e), '', '☐']),
    ),

    heading('5. Checks and results'),
    table(
      ['Check', 'Target / limit', 'Result', 'Status'],
      split([0.4, 0.26, 0.22, 0.12]),
      spec.checks.map(([c, t]) => [c, t, '', '☐']),
    ),

    heading('6. Exit criteria'),
    table(
      ['Criterion', 'Evidence (link or file)', 'Met'],
      split([0.5, 0.38, 0.12]),
      w.exit.map((e) => [strip(e), '', '☐']),
    ),

    ...(spec.extra
      ? [
          heading(`7. ${spec.extra.heading}`),
          para(spec.extra.intro, { color: MUTED, italics: true, size: 19 }),
          table(spec.extra.columns, split(spec.extra.columns.map(() => 1 / spec.extra!.columns.length)), [], spec.extra.rows),
        ]
      : []),

    heading(`${spec.extra ? 8 : 7}. Open issues`),
    table(['ID', 'Description', 'Severity', 'Owner', 'Due', 'Disposition'], split([0.08, 0.36, 0.12, 0.14, 0.1, 0.2]), [], 3),

    heading(`${spec.extra ? 9 : 8}. Waivers`),
    table(
      ['ID', 'Check / rule', 'Justification and risk', 'Condition / expiry', 'Approver'],
      split([0.08, 0.2, 0.34, 0.2, 0.18]),
      [],
      3,
    ),

    heading(`${spec.extra ? 10 : 9}. Known failure modes — confirm each is addressed`),
    ...w.risks.map((r) => checkLine(`☐ ${strip(r)}`)),

    heading(`${spec.extra ? 11 : 10}. Handover`),
    para('Who receives this deliverable, and what they take from it.', { color: MUTED, italics: true, size: 19 }),
    table(
      ['Receiving activity', 'What it takes', 'Received (date)'],
      split([0.45, 0.35, 0.2]),
      w.feedsInto.map((f) => [`${f} — ${ALL_ACTIVITY_TITLES[f] ?? ''}`, '', '']),
    ),

    heading(`${spec.extra ? 12 : 11}. Sign-off`),
    table(
      ['Role', 'Name', 'Decision', 'Signature', 'Date'],
      split([0.3, 0.2, 0.18, 0.18, 0.14]),
      w.roles.map((r) => [r.r, '', '', '', '']),
    ),

    heading('Revision history'),
    table(['Version', 'Date', 'Change', 'Author'], split([0.12, 0.16, 0.52, 0.2]), [['0.1', '', 'Template issued', '']], 2),
    gap(),
  ];

  return new Document({
    creator: 'AtlasPM',
    title: `${ref} — ${title}`,
    description: `Template for ${ref}, produced by ${act}`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [text(`${ref} · ${title}`, { size: 16, color: MUTED })] })],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ font: FONT, size: 16, color: MUTED, children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES] }),
                ],
              }),
            ],
          }),
        },
        children: body,
      },
    ],
  });
}

/* ---------- write them ---------- */

async function main() {
  for (const ref of Object.keys(SPECS)) {
    if (!DELIVERABLE_TEMPLATES[ref]) throw new Error(`${ref} has a spec but is not listed in deliverableTemplates.ts`);
  }
  const out = path.join(process.cwd(), 'public');
  for (const [ref, t] of Object.entries(DELIVERABLE_TEMPLATES)) {
    const file = path.join(out, t.href.replace(/^\//, ''));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, await Packer.toBuffer(build(ref)));
    console.log(`wrote ${path.relative(process.cwd(), file)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
