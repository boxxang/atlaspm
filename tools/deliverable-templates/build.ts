/**
 * Writes the sign-off workbooks a key deliverable's handover can be started
 * from, into public/templates/.
 *
 *   npx tsx --tsconfig tsconfig.json tools/deliverable-templates/build.ts
 *
 * A gate — a freeze, a closure, a signoff — is confirmed item by item. Each
 * workbook lists every item the gate stands on: the baseline it is taken
 * against, the entry criteria, the checks with their targets, the exit
 * criteria and the failure modes the write-up warns of. The people doing the
 * work record a result, the evidence and a status against each; the stage
 * lead confirms or rejects each item on that evidence; and the Sign-off sheet
 * counts what is confirmed, flags what is not supported, suggests an outcome
 * and takes the lead's final decision.
 *
 * Built from the write-up of the activity that produces the deliverable — its
 * entry and exit criteria, risks, roles and receiving activities — so the
 * workbook and the page cannot ask for different things. What only a workbook
 * needs, the baseline to name and the checks to record, is written here.
 *
 * Generated rather than drawn by hand so that a change to a write-up reaches
 * the template on the next run. src/data/deliverableTemplates.ts lists what
 * this writes; a test holds the two to each other.
 */
import fs from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';
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

/* ---------- the workbook ---------- */

const FONT = 'Arial';
const INK = 'FF1F2328';
const MUTED = 'FF6E7781';
const ACCENT = 'FF5B5BD6';
const HEAD_FILL = 'FFEEF0FB';
/* the cells somebody fills in */
const INPUT_FILL = 'FFFFF8D6';
/* the cells the template fills in */
const GIVEN_FILL = 'FFF6F8FA';
const RULE = 'FFD0D7DE';

const OWNER_STATUS = ['Pass', 'Fail', 'Waived', 'N/A', 'Open'];
const LEAD_STATUS = ['Pending', 'Confirmed', 'Rejected'];
const FINAL_DECISION = ['Signed off', 'Signed off with conditions', 'Not signed off'];
const ROLE_DECISION = ['Approve', 'Approve with conditions', 'Reject'];
const SEVERITY = ['Critical', 'High', 'Medium', 'Low'];
const ISSUE_STATUS = ['Open', 'Closed'];

const strip = (s: string) =>
  s
    .replace(/<\/?(b|code)>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

type Sheet = ExcelJS.Worksheet;
type Cell = ExcelJS.Cell;

const thin = { style: 'thin' as const, color: { argb: RULE } };
const boxed: Partial<ExcelJS.Borders> = { top: thin, bottom: thin, left: thin, right: thin };

const style = (c: Cell, o: { bold?: boolean; fill?: string; color?: string; size?: number; wrap?: boolean; italic?: boolean } = {}) => {
  c.font = { name: FONT, size: o.size ?? 10, bold: o.bold, italic: o.italic, color: { argb: o.color ?? INK } };
  if (o.fill) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: o.fill } };
  c.alignment = { vertical: 'top', wrapText: o.wrap ?? true };
};

const list = (values: string[]): ExcelJS.DataValidation => ({
  type: 'list',
  allowBlank: true,
  formulae: [`"${values.join(',')}"`],
  showErrorMessage: true,
  errorTitle: 'Pick from the list',
  error: `One of: ${values.join(', ')}`,
});

const dateRule: ExcelJS.DataValidation = {
  type: 'date',
  operator: 'greaterThan',
  allowBlank: true,
  formulae: [new Date(Date.UTC(2020, 0, 1))],
  showErrorMessage: true,
  error: 'A date, e.g. 2027-03-15',
};

/** A title block: the sheet's name for the reader and one line on what it is for. */
const titled = (ws: Sheet, title: string, line: string, span: number) => {
  ws.mergeCells(1, 1, 1, span);
  ws.getCell(1, 1).value = title;
  style(ws.getCell(1, 1), { bold: true, size: 14, wrap: false });
  ws.mergeCells(2, 1, 2, span);
  ws.getCell(2, 1).value = line;
  style(ws.getCell(2, 1), { italic: true, color: MUTED, size: 9 });
  ws.getRow(2).height = 28;
};

const header = (ws: Sheet, row: number, labels: string[]) => {
  labels.forEach((l, i) => {
    const c = ws.getCell(row, i + 1);
    c.value = l;
    style(c, { bold: true, fill: HEAD_FILL, size: 9 });
    c.border = boxed;
  });
  ws.getRow(row).height = 30;
};

/** A register of blank rows to write in, with each column's rule. */
const register = (
  ws: Sheet,
  first: number,
  rows: number,
  columns: { validation?: ExcelJS.DataValidation; date?: boolean }[],
) => {
  for (let r = first; r < first + rows; r++) {
    columns.forEach((col, i) => {
      const c = ws.getCell(r, i + 1);
      style(c, { fill: INPUT_FILL });
      c.border = boxed;
      if (col.validation) c.dataValidation = col.validation;
      if (col.date) {
        c.dataValidation = dateRule;
        c.numFmt = 'yyyy-mm-dd';
      }
    });
  }
};

const setWidths = (ws: Sheet, widths: number[]) => widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

const landscape = (ws: Sheet) => {
  ws.pageSetup = { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
};

/* ---------- one workbook ---------- */

const producers = producersOf(ALL_ACTIVITIES);
const stageTitle = (key: string) => EMBEDDED_PROFILE.stages.find((s) => s.key === key)?.title ?? key;

interface Item {
  id: string;
  section: string;
  item: string;
  target: string;
}

const ISSUE_ROWS = 40;
const WAIVER_ROWS = 30;
const SPARE_ROWS = 10;

async function build(ref: string): Promise<ExcelJS.Workbook> {
  const spec = SPECS[ref];
  if (!spec) throw new Error(`no template spec for ${ref}`);
  const step = deliverableStep(ref, producers);
  if (!step) throw new Error(`${ref} has no producing activity`);
  const act = step.act;
  const a = ALL_ACTIVITIES[act];
  const w = embeddedDetail(act);
  if (!w) throw new Error(`${act} has no write-up`);
  const title = ALL_DELIVERABLE_TITLES[ref];
  const pad = (n: number) => String(n).padStart(2, '0');

  const items: Item[] = [
    ...spec.baseline.map((b, i) => ({ id: `B-${pad(i + 1)}`, section: 'Baseline', item: b, target: 'Version, tag or ID recorded' })),
    ...w.entry.map((e, i) => ({ id: `E-${pad(i + 1)}`, section: 'Entry criteria', item: strip(e), target: 'Met' })),
    ...spec.checks.map(([c, t], i) => ({ id: `C-${pad(i + 1)}`, section: 'Checks', item: c, target: t })),
    ...w.exit.map((e, i) => ({ id: `X-${pad(i + 1)}`, section: 'Exit criteria', item: strip(e), target: 'Met' })),
    ...w.risks.map((r, i) => ({
      id: `F-${pad(i + 1)}`,
      section: 'Failure modes',
      item: strip(r),
      target: 'Addressed — say how in the result',
    })),
  ];

  const wb = new ExcelJS.Workbook();
  wb.creator = 'AtlasPM';
  wb.title = `${ref} — ${title}`;
  wb.calcProperties.fullCalcOnLoad = true;

  /* sheets in the order a stage lead reads them */
  const signoff = wb.addWorksheet('Sign-off', { views: [{ showGridLines: false }] });
  const check = wb.addWorksheet('Checklist', { views: [{ state: 'frozen', ySplit: 3, xSplit: 3 }] });
  const issues = wb.addWorksheet('Open issues', { views: [{ state: 'frozen', ySplit: 3 }] });
  const waivers = wb.addWorksheet('Waivers', { views: [{ state: 'frozen', ySplit: 3 }] });
  const extra = spec.extra ? wb.addWorksheet(spec.extra.heading.slice(0, 31), { views: [{ state: 'frozen', ySplit: 3 }] }) : null;
  const handover = wb.addWorksheet('Handover', { views: [{ state: 'frozen', ySplit: 3 }] });
  const guide = wb.addWorksheet('Guide', { views: [{ showGridLines: false }] });

  /* ----- Checklist ----- */
  const CL = ['ID', 'Section', 'Item', 'Target / acceptance', 'Result or measured value', 'Evidence — link or file name', 'Evidence owner', 'Owner status', 'Waiver ID', 'Stage lead confirmation', 'Stage lead comment', 'Confirmed on', 'Flag'];
  titled(
    check,
    `${ref} checklist — confirm every item on its evidence`,
    'Owners fill Result, Evidence, Evidence owner and Owner status. The stage lead then confirms or rejects each item. Yellow cells are for input; grey cells come from the template. The Flag column names any row that cannot yet be confirmed as filled in.',
    CL.length,
  );
  header(check, 3, CL);
  setWidths(check, [7, 13, 46, 26, 28, 30, 16, 12, 10, 14, 28, 12, 26]);
  const first = 4;
  const last = first + items.length + SPARE_ROWS - 1;
  for (let i = 0; i < items.length + SPARE_ROWS; i++) {
    const r = first + i;
    const it = items[i];
    /* a spare row is left truly empty: a cell holding "" is counted as filled */
    const given = [it?.id ?? null, it?.section ?? null, it?.item ?? null, it?.target ?? null];
    given.forEach((v, k) => {
      const c = check.getCell(r, k + 1);
      c.value = v;
      style(c, { fill: it ? GIVEN_FILL : INPUT_FILL, bold: k === 0 });
      c.border = boxed;
    });
    for (let k = 5; k <= 12; k++) {
      const c = check.getCell(r, k);
      style(c, { fill: INPUT_FILL });
      c.border = boxed;
    }
    check.getCell(r, 8).dataValidation = list(OWNER_STATUS);
    check.getCell(r, 10).dataValidation = list(LEAD_STATUS);
    check.getCell(r, 12).dataValidation = dateRule;
    check.getCell(r, 12).numFmt = 'yyyy-mm-dd';
    if (it) {
      check.getCell(r, 8).value = 'Open';
      check.getCell(r, 10).value = 'Pending';
    }
    const f = check.getCell(r, 13);
    f.value = {
      formula:
        `IF(C${r}="","",` +
        `IF(AND(J${r}="Confirmed",F${r}=""),"Evidence missing",` +
        `IF(AND(H${r}="Waived",I${r}=""),"Waiver ID missing",` +
        `IF(AND(J${r}="Rejected",K${r}=""),"Comment required",` +
        `IF(AND(J${r}="Confirmed",OR(H${r}="Fail",H${r}="Open",H${r}="")),"Confirmed without a passing status",` +
        `IF(AND(J${r}="Confirmed",L${r}=""),"Date missing",""))))))`,
      /* the value a viewer that does not calculate shows: nothing is flagged yet */
      result: '',
    };
    style(f, { color: 'FFCF222E', bold: true });
    f.border = boxed;
  }
  const H = `H${first}:H${last}`;
  const J = `J${first}:J${last}`;
  check.addConditionalFormatting({
    ref: H,
    rules: [
      { type: 'cellIs', operator: 'equal', formulae: ['"Pass"'], priority: 1, style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFDAFBE1' } } } },
      { type: 'cellIs', operator: 'equal', formulae: ['"Fail"'], priority: 2, style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFD8D3' } } } },
      { type: 'cellIs', operator: 'equal', formulae: ['"Waived"'], priority: 3, style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFEFC6' } } } },
    ],
  });
  check.addConditionalFormatting({
    ref: J,
    rules: [
      { type: 'cellIs', operator: 'equal', formulae: ['"Confirmed"'], priority: 4, style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFDAFBE1' } } } },
      { type: 'cellIs', operator: 'equal', formulae: ['"Rejected"'], priority: 5, style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFD8D3' } } } },
    ],
  });
  check.autoFilter = { from: { row: 3, column: 1 }, to: { row: last, column: CL.length } };
  landscape(check);

  /* ----- Open issues ----- */
  const OI = ['Issue ID', 'Description', 'Linked item ID', 'Severity', 'Owner', 'Due', 'Status', 'Disposition'];
  titled(issues, 'Open issues', 'Anything that stops an item being confirmed. Link it to the checklist item it blocks. A Critical or High issue left Open blocks the sign-off.', OI.length);
  header(issues, 3, OI);
  setWidths(issues, [10, 46, 13, 11, 16, 12, 10, 36]);
  register(issues, 4, ISSUE_ROWS, [{}, {}, {}, { validation: list(SEVERITY) }, {}, { date: true }, { validation: list(ISSUE_STATUS) }, {}]);
  landscape(issues);
  const IL = 4 + ISSUE_ROWS - 1;

  /* ----- Waivers ----- */
  const WV = ['Waiver ID', 'Linked item ID', 'Check or rule waived', 'Justification', 'Risk accepted', 'Condition or expiry', 'Approved by', 'Approved on'];
  titled(waivers, 'Waivers', 'Every item whose Owner status is Waived needs a row here, and every waiver needs an approver. A waiver without one blocks the sign-off.', WV.length);
  header(waivers, 3, WV);
  setWidths(waivers, [10, 13, 30, 40, 30, 26, 18, 12]);
  register(waivers, 4, WAIVER_ROWS, [{}, {}, {}, {}, {}, {}, {}, { date: true }]);
  landscape(waivers);
  const WL = 4 + WAIVER_ROWS - 1;

  /* ----- the gate's own sheet ----- */
  if (extra && spec.extra) {
    titled(extra, spec.extra.heading, spec.extra.intro, spec.extra.columns.length);
    header(extra, 3, spec.extra.columns);
    setWidths(extra, spec.extra.columns.map(() => 36));
    register(extra, 4, 10, spec.extra.columns.map(() => ({})));
    landscape(extra);
  }

  /* ----- Handover ----- */
  const HO = ['Receiving activity', 'What it takes from this deliverable', 'Received by', 'Received on'];
  titled(handover, 'Handover', `Who receives ${ref}, and what they take from it. The receiving owner records receipt.`, HO.length);
  header(handover, 3, HO);
  setWidths(handover, [46, 46, 20, 12]);
  w.feedsInto.forEach((f, i) => {
    const r = 4 + i;
    const c = handover.getCell(r, 1);
    c.value = `${f} — ${ALL_ACTIVITY_TITLES[f] ?? ''}`;
    style(c, { fill: GIVEN_FILL });
    c.border = boxed;
  });
  register(handover, 4, w.feedsInto.length, [{}, {}, {}, { date: true }].map((x, i) => (i === 0 ? {} : x)));
  w.feedsInto.forEach((f, i) => {
    const c = handover.getCell(4 + i, 1);
    c.value = `${f} — ${ALL_ACTIVITY_TITLES[f] ?? ''}`;
    style(c, { fill: GIVEN_FILL });
  });
  landscape(handover);

  /* ----- Sign-off ----- */
  setWidths(signoff, [34, 22, 20, 18, 30]);
  titled(signoff, `${ref} — ${title}`, `Sign-off for ${ref}, produced by ${act} ${ALL_ACTIVITY_TITLES[act]}. Work through the Checklist first; this sheet counts it. See Guide for how to use the workbook.`, 5);
  let r = 4;
  const section = (t: string) => {
    signoff.mergeCells(r, 1, r, 5);
    const c = signoff.getCell(r, 1);
    c.value = t;
    style(c, { bold: true, color: ACCENT, size: 11, wrap: false });
    r++;
  };
  const row = (label: string, value: ExcelJS.CellValue, o: { input?: boolean; validation?: ExcelJS.DataValidation; fmt?: string; date?: boolean; strong?: boolean } = {}) => {
    const l = signoff.getCell(r, 1);
    l.value = label;
    style(l, { bold: true, fill: HEAD_FILL, size: 9 });
    l.border = boxed;
    signoff.mergeCells(r, 2, r, 5);
    const v = signoff.getCell(r, 2);
    v.value = value;
    style(v, { fill: o.input ? INPUT_FILL : GIVEN_FILL, bold: o.strong });
    v.border = boxed;
    if (o.validation) v.dataValidation = o.validation;
    if (o.date) {
      v.dataValidation = dateRule;
      v.numFmt = 'yyyy-mm-dd';
    }
    if (o.fmt) v.numFmt = o.fmt;
    return `B${r++}`;
  };

  section('Document control');
  row('Programme', '', { input: true });
  row('Deliverable', `${ref} — ${title}`);
  row('Stage', stageTitle(a.st));
  row('Producing activity', `${act} — ${ALL_ACTIVITY_TITLES[act]}`);
  row('Activity owner', a.ro);
  row('Version', '', { input: true });
  row('Date issued for review', '', { input: true, date: true });
  r++;

  section('Readiness — counted from the Checklist');
  const C = `Checklist!$C$${first}:$C$${last}`;
  const HH = `Checklist!$H$${first}:$H$${last}`;
  const JJ = `Checklist!$J$${first}:$J$${last}`;
  const MM = `Checklist!$M$${first}:$M$${last}`;
  /* LEN rather than COUNTA or a wildcard COUNTIF: every engine agrees on it,
     and a formula that returns "" is not counted as a value */
  /* Each formula carries the value it has in the blank template, so a viewer
     that does not calculate — a mail preview, a file browser — shows the
     starting state rather than empty cells. Excel recalculates on open. */
  const n = items.length;
  const total = row('Items to confirm', { formula: `SUMPRODUCT(--(LEN(${C})>0))`, result: n });
  const pass = row('Owner status — Pass', { formula: `COUNTIFS(${C},"<>",${HH},"Pass")`, result: 0 });
  const waived = row('Owner status — Waived', { formula: `COUNTIFS(${C},"<>",${HH},"Waived")`, result: 0 });
  const na = row('Owner status — N/A', { formula: `COUNTIFS(${C},"<>",${HH},"N/A")`, result: 0 });
  const fail = row('Owner status — Fail', { formula: `COUNTIFS(${C},"<>",${HH},"Fail")`, result: 0 });
  const open = row('Owner status — Open or blank', { formula: `COUNTIFS(${C},"<>",${HH},"Open")+COUNTIFS(${C},"<>",${HH},"")`, result: n });
  const confirmed = row('Stage lead — Confirmed', { formula: `COUNTIFS(${C},"<>",${JJ},"Confirmed")`, result: 0 });
  const rejected = row('Stage lead — Rejected', { formula: `COUNTIFS(${C},"<>",${JJ},"Rejected")`, result: 0 });
  row('Stage lead — Pending or blank', { formula: `COUNTIFS(${C},"<>",${JJ},"Pending")+COUNTIFS(${C},"<>",${JJ},"")`, result: n });
  const progress = row('Confirmed so far', { formula: `IF(${total}=0,0,${confirmed}/${total})`, result: 0 }, { fmt: '0%' });
  const flags = row('Rows flagged on the Checklist', { formula: `SUMPRODUCT(--(LEN(${MM})>0))`, result: 0 });
  const blocking = row('Critical or High issues still Open', {
    formula:
      `COUNTIFS('Open issues'!$D$4:$D$${IL},"Critical",'Open issues'!$G$4:$G$${IL},"Open")` +
      `+COUNTIFS('Open issues'!$D$4:$D$${IL},"High",'Open issues'!$G$4:$G$${IL},"Open")`,
    result: 0,
  });
  const unapproved = row('Waivers without an approver', { formula: `COUNTIFS(Waivers!$A$4:$A$${WL},"<>",Waivers!$G$4:$G$${WL},"")`, result: 0 });
  const suggested = row(
    'Suggested outcome',
    {
      formula:
        `IF(OR(${fail}>0,${rejected}>0,${blocking}>0),"Not ready — blocking items",` +
        `IF(AND(${total}>0,${confirmed}=${total},${flags}=0,${unapproved}=0),"Ready to sign off","In review"))`,
      result: 'In review',
    },
    { strong: true },
  );
  void pass;
  void waived;
  void na;
  void open;
  void progress;
  r++;

  section('Final decision — stage lead');
  const decision = row('Decision', '', { input: true, validation: list(FINAL_DECISION), strong: true });
  row('Conditions (if any)', '', { input: true });
  row('Stage lead', '', { input: true });
  row('Decided on', '', { input: true, date: true });
  row('Consistency check', {
    formula: `IF(AND(${decision}="Signed off",${suggested}<>"Ready to sign off"),"Signed off while the checklist is not ready — record the reason in Conditions","")`,
    result: '',
  });
  signoff.getCell(r - 1, 2).font = { name: FONT, size: 10, bold: true, color: { argb: 'FFCF222E' } };
  signoff.addConditionalFormatting({
    ref: suggested,
    rules: [
      { type: 'containsText', operator: 'containsText', text: 'Ready', priority: 1, style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFDAFBE1' } } } },
      { type: 'containsText', operator: 'containsText', text: 'Not ready', priority: 2, style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFD8D3' } } } },
    ],
  });
  r++;

  section('Sign-off by role');
  const SR = ['Role', 'Name', 'Decision', 'Date', 'Comment'];
  SR.forEach((l, i) => {
    const c = signoff.getCell(r, i + 1);
    c.value = l;
    style(c, { bold: true, fill: HEAD_FILL, size: 9 });
    c.border = boxed;
  });
  r++;
  for (const role of w.roles) {
    const c = signoff.getCell(r, 1);
    c.value = role.r;
    style(c, { fill: GIVEN_FILL });
    c.border = boxed;
    for (let k = 2; k <= 5; k++) {
      const x = signoff.getCell(r, k);
      style(x, { fill: INPUT_FILL });
      x.border = boxed;
    }
    signoff.getCell(r, 3).dataValidation = list(ROLE_DECISION);
    signoff.getCell(r, 4).dataValidation = dateRule;
    signoff.getCell(r, 4).numFmt = 'yyyy-mm-dd';
    r++;
  }
  signoff.pageSetup = { orientation: 'portrait', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 };

  /* ----- Guide ----- */
  setWidths(guide, [22, 90]);
  titled(guide, 'How to use this workbook', `${ref} is signed off on evidence, item by item. This sheet says who fills what.`, 2);
  let g = 4;
  const gline = (label: string, text: string, fill?: string) => {
    const l = guide.getCell(g, 1);
    l.value = label;
    style(l, { bold: true, fill: fill ?? HEAD_FILL, size: 9 });
    l.border = boxed;
    const v = guide.getCell(g, 2);
    v.value = text;
    style(v, {});
    v.border = boxed;
    g++;
  };
  gline('1. Owners', 'On the Checklist, for each item: write the Result or measured value, the Evidence (a link to the report, dashboard or file name), who owns that evidence, and set Owner status. Waived needs a Waiver ID that exists on the Waivers sheet.');
  gline('2. Stage lead', 'Review each item against its evidence. Set Stage lead confirmation to Confirmed, or Rejected with a comment saying what is missing. Date every confirmation.');
  gline('3. Flags', 'The Flag column names any row that is not yet supported: evidence missing, a waiver without an ID, a rejection without a comment, a confirmation of a failing item, or an undated confirmation. Clear every flag.');
  gline('4. Issues and waivers', 'Record anything blocking an item on Open issues, linked by item ID. A Critical or High issue left Open, or a waiver without an approver, holds the gate.');
  gline('5. Final decision', 'The Sign-off sheet counts the Checklist and suggests an outcome. The stage lead records the Decision, any conditions, and the date. Each role then records its own decision.');
  gline('6. Handover', 'Attach the completed workbook to this deliverable\'s Handover in AtlasPM and date the handover when it is accepted.');
  g++;
  gline('Yellow cells', 'Input — fill these in.', INPUT_FILL);
  gline('Grey cells', 'Given by the template from the activity write-up — do not edit.', GIVEN_FILL);
  gline('Owner status', 'Pass — meets the target. Fail — does not. Waived — does not, and a waiver accepts it. N/A — does not apply, with the reason in Result. Open — not yet assessed.');
  gline('Lead confirmation', 'Pending — not yet reviewed. Confirmed — the evidence supports the status. Rejected — it does not; the comment says why.');
  g++;
  const ex = guide.getCell(g, 1);
  ex.value = 'Example row';
  style(ex, { bold: true, color: ACCENT });
  g++;
  const exHead = ['Item', 'Macro pin timing — setup and hold, all signoff corners'];
  const exRows: [string, string][] = [
    exHead as [string, string],
    ['Target', 'Within vendor limits, no negative slack'],
    ['Result', 'Worst setup slack +42 ps (ss_0p72v_125c); worst hold +18 ps (ff_0p88v_m40c)'],
    ['Evidence', 'sta/turn3/emram_pins_summary.rpt (run 2027-05-14)'],
    ['Evidence owner', 'Timing closure lead'],
    ['Owner status', 'Pass'],
    ['Stage lead', 'Confirmed — 2027-05-16'],
  ];
  for (const [k, v] of exRows) gline(k, v);

  return wb;
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
    const wb = await build(ref);
    await wb.xlsx.writeFile(file);
    console.log(`wrote ${path.relative(process.cwd(), file)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
