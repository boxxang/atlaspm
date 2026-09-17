/**
 * /data/atlasSocDemo.ts — AtlasSoC, a netlist-turnkey program whose first
 * tapeout slipped two months.
 *
 * The customer hands over a gate-level netlist; the program runs physical
 * design through production. When the FFN arrived at the end of September
 * 2023, nine of its sixty blocks had grown by 11% on average. The customer
 * refused a larger die, rebalancing the floorplan did not converge, and at the
 * end of November a normal timing signoff was judged out of reach. EVT0 taped
 * out in March 2024 under relaxed signoff criteria, for functional validation,
 * with the fixes carried into EVT1 under the two-tapeout SoW. Fab time could
 * not be cut; the customer pulled assembly in.
 *
 * The record runs from the FFN to the EVT0 retrospective and is written the
 * way the TPM kept it: who convened what, who owned each issue, and which
 * actions came out of each meeting and how they were followed up. Everything
 * after tapeout is simply done on the program's actual schedule — the app
 * reads today from the clock, and an open step would read as years overdue.
 *
 * The template keeps the plan (tapeout 01/29/2024); the program's overrides
 * and activity windows are what happened (tapeout 03/25/2024).
 */
import { activitySteps } from './activitySteps';
import { journeyData } from './journey';
import type { Scenario, StageSpan, Windows } from './scenario';
import type {
  ScenarioDeliverable,
  ScenarioMeeting,
  ScenarioPerson,
  ScenarioPost,
  ScenarioSeries,
  ScenarioStep,
} from './scenarioTypes';

export const SOC_ID = 'atlassoc';
export const SOC_NAME = 'AtlasSoC';
/** N0 netlist received; physical design starts. */
export const SOC_KICKOFF = '2023-03-06';

export const NETLIST_TEMPLATE_ID = 'netlistTurnkey';
export const NETLIST_TEMPLATE_NAME = 'Netlist Turnkey';

/* ---------- schedule ---------- */

/** The plan the program was committed to, weeks from 03/06/2023. */
export const SOC_PLAN: readonly ({ key: string } & StageSpan)[] = [
  { key: 'physicalDesign', startOffsetWeeks: 0, durationWeeks: 38 },
  { key: 'testDevelopment', startOffsetWeeks: 10, durationWeeks: 42 },
  { key: 'signoff', startOffsetWeeks: 24, durationWeeks: 16 },
  { key: 'packaging', startOffsetWeeks: 37, durationWeeks: 31 },
  { key: 'tapeout', startOffsetWeeks: 39, durationWeeks: 8 },
  { key: 'fabrication', startOffsetWeeks: 43, durationWeeks: 19 },
  { key: 'bringup', startOffsetWeeks: 67, durationWeeks: 18 },
  { key: 'qualification', startOffsetWeeks: 71, durationWeeks: 26 },
];

/** Where the stages actually ran. */
export const SOC_ACTUAL: Readonly<Record<string, StageSpan>> = {
  /* congestion recovery after the FFN, then closure again on relaxed criteria */
  physicalDesign: { startOffsetWeeks: 0, durationWeeks: 45 },
  /* the TAP clock change and 50 more wafers to sort */
  testDevelopment: { startOffsetWeeks: 10, durationWeeks: 50 },
  /* normal signoff abandoned 11/28; relaxed signoff through January */
  signoff: { startOffsetWeeks: 24, durationWeeks: 23 },
  /* moves with the wafers — die attach cannot start before they ship */
  packaging: { startOffsetWeeks: 45, durationWeeks: 31 },
  tapeout: { startOffsetWeeks: 47, durationWeeks: 8 },
  /* DPML already at the contracted minimum: nothing to compress */
  fabrication: { startOffsetWeeks: 51, durationWeeks: 19 },
  /* the customer's priority lot: bring-up starts on its first units four weeks
     before the full assembly completes, not one — three weeks recovered */
  bringup: { startOffsetWeeks: 72, durationWeeks: 18 },
  qualification: { startOffsetWeeks: 76, durationWeeks: 26 },
};

type Segments = readonly (readonly [number, number, number, number])[];

/**
 * Template weeks onto program weeks, piecewise: each segment maps template
 * weeks [a, b] of a stage onto [c, d] of the same stage.
 */
const piecewise = (segments: Segments) => (t: number) => {
  const [a, b, c, d] = segments.find(([from, to]) => t >= from && t <= to) ?? segments[segments.length - 1];
  return Math.round((c + ((t - a) * (d - c)) / (b - a)) * 100) / 100;
};

/** A stage's activity windows, re-timed. The steps inside still run by their own TATs. */
const retime = (stage: string, segments: Segments): Windows => {
  const map = piecewise(segments);
  return Object.fromEntries(
    Object.entries(activitySteps)
      .filter(([, a]) => a.st === stage)
      .map(([ref, a]) => [ref, [map(a.w[0]), map(a.w[1])] as const]),
  );
};

/* The FFN arrives at program week 29.5 (09/29/2023). In the template the final
   turn on the FFN starts at physical design week 19, so that is the hinge. */
const PD_PLAN_SEGMENTS: Segments = [
  [0, 19, 0, 29.5],
  [19, 30, 29.5, 38],
];
/* How each stage that ran long actually ran, in template weeks → program weeks. */
const ACTUAL_SEGMENTS: Readonly<Record<string, Segments>> = {
  physicalDesign: [
    [0, 19, 0, 29.5],
    [19, 30, 29.5, 45],
  ],
  signoff: [[0, 16, 0, 23]],
  testDevelopment: [[0, 42, 0, 50]],
};

const PD_PLAN = retime('physicalDesign', PD_PLAN_SEGMENTS);
const ACTUAL_WINDOWS: Windows = Object.assign(
  {},
  ...Object.entries(ACTUAL_SEGMENTS).map(([stage, segments]) => retime(stage, segments)),
);

/* ---------- people ---------- */

export const SOC_LEADERS: Readonly<Record<string, ScenarioPerson>> = {
  physicalDesign: { name: 'Jihoon Park', role: 'Physical design lead' },
  testDevelopment: { name: 'Taeho Jung', role: 'Test development lead' },
  signoff: { name: 'Dohyun Lee', role: 'Signoff lead' },
  packaging: { name: 'Brian Lim', role: 'Customer assembly and supply lead' },
  tapeout: { name: 'Minseo Han', role: 'Tapeout manager' },
  fabrication: { name: 'Jaehyuk Yoon', role: 'Foundry program manager' },
  bringup: { name: 'Eunji Seo', role: 'Customer SoC design lead' },
  qualification: { name: 'Sora Baek', role: 'Quality and reliability lead' },
};

export const SOC_CONTACTS: Readonly<Record<string, readonly ScenarioPerson[]>> = {
  physicalDesign: [
    { name: 'Yuna Kim', role: 'Floorplan and congestion owner' },
    { name: 'Sungmin Choi', role: 'Timing closure lead' },
    { name: 'Hyejin Oh', role: 'Routing and DRC convergence' },
  ],
  signoff: [
    { name: 'Sungmin Choi', role: 'STA signoff, including test mode' },
    { name: 'Hyejin Oh', role: 'Physical verification' },
  ],
  tapeout: [
    { name: 'Daniel Kwon', role: 'Customer program manager' },
    { name: 'Kyungsoo Nam', role: 'Design service director — executive sponsor' },
  ],
  fabrication: [{ name: 'Jaehyuk Yoon', role: 'Wafer starts, DPML and hot lots' }],
  testDevelopment: [{ name: 'Taeho Jung', role: 'Sort and final test programs' }],
  packaging: [{ name: 'Brian Lim', role: 'Substrate lots, OSAT loading and die attach priority' }],
};

/* ---------- the record ---------- */

/**
 * Step records the story needs, beyond "done on the day the plan said": who
 * owned the steps the story turns on, and the ones that closed late because
 * closure did.
 */
export const SOC_STEPS: readonly ScenarioStep[] = [
  { ref: 'PD-15', n: 1, owner: 'Jihoon Park', doneAt: '2023-10-04' },
  { ref: 'PD-15', n: 2, owner: 'Yuna Kim', doneAt: '2023-10-20' },
  { ref: 'PD-15', n: 6, owner: 'Hyejin Oh', doneAt: '2023-12-22' },
  { ref: 'PD-15', n: 7, owner: 'Hyejin Oh', doneAt: '2024-01-05' },
  { ref: 'PD-15', n: 8, owner: 'Sungmin Choi', doneAt: '2024-01-10' },
  { ref: 'PD-15', n: 9, owner: 'Jihoon Park', doneAt: '2024-01-10' },
  { ref: 'PD-15', n: 10, owner: 'Jihoon Park', doneAt: '2024-01-15' },
  { ref: 'SO-03', n: 6, owner: 'Sungmin Choi', doneAt: '2024-01-12' },
  { ref: 'SO-03', n: 7, owner: 'Dohyun Lee', doneAt: '2024-01-26' },
  { ref: 'SO-11', n: 3, owner: 'Dohyun Lee', doneAt: '2024-01-19' },
  { ref: 'SO-11', n: 4, owner: '@me', doneAt: '2024-01-24' },
  { ref: 'SO-11', n: 6, owner: 'Dohyun Lee', doneAt: '2024-01-29' },
  { ref: 'TEST-06', n: 7, owner: 'Taeho Jung', doneAt: '2023-12-15' },
  { ref: 'TEST-08', n: 4, owner: 'Taeho Jung', doneAt: '2024-01-09' },
  { ref: 'ASSY-01', n: 1, owner: 'Brian Lim', doneAt: '2024-01-05' },
  { ref: 'TO-05', n: 2, owner: '@me', doneAt: '2024-02-08' },
  { ref: 'TO-06', n: 3, owner: 'Minseo Han', doneAt: '2024-02-22' },
  { ref: 'TO-10', n: 3, owner: 'Minseo Han', doneAt: '2024-03-22' },
];

const dateKey = (weeksFromKickoff: number) => {
  const [y, m, d] = SOC_KICKOFF.split('-').map(Number);
  const at = new Date(y, m - 1, d + Math.round(weeksFromKickoff * 7));
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`;
};

/**
 * Every deliverable handed over on the date the actual schedule gives it. In
 * the stages that ran long, the template's due weeks are re-timed with their
 * activity windows — otherwise the final routed database would be due before
 * the final turn that routes it had started.
 */
export const SOC_DELIVERABLES: readonly ScenarioDeliverable[] = SOC_PLAN.flatMap((s): ScenarioDeliverable[] => {
  const segments = ACTUAL_SEGMENTS[s.key];
  const weeks = journeyData.find((j) => j.id === s.key)?.deliverableWeek;
  if (!segments || !weeks) return [{ stageId: s.key, position: 'all', doneAt: 'due' }];
  const map = piecewise(segments);
  return weeks.map((w, position) => {
    const on = dateKey(SOC_ACTUAL[s.key].startOffsetWeeks + map(w));
    return { stageId: s.key, position, due: on, doneAt: on };
  });
});

export const SOC_POSTS: readonly ScenarioPost[] = [
  {
    key: 'ffn-received',
    kind: 'update',
    at: '2023-09-29 18:20',
    step: 'PD-15:1',
    text:
      'FFN received from the customer — 60 blocks, top level and constraints. Intake started: gate-count and utilization delta against N2 for every block by 10/03, trial placement at the current floorplan to follow.',
  },
  {
    key: 'ffn-delta',
    kind: 'update',
    at: '2023-10-03 17:40',
    step: 'PD-15:1',
    text:
      'Delta against N2: 51 blocks within ±3% gate count. Nine have grown by 8.3% to 14.3% — 11.0% on average, +2.8 M gates — with the NPU cores, ISP and GPU shader at the top. Chip total +4.4%. Placement utilization in those nine would go from ~70% to ~78%. Calling an alignment meeting with the customer design lead for tomorrow.',
  },
  {
    key: 'risk-gate-count',
    kind: 'risk',
    at: '2023-10-04 15:30',
    step: 'PD-15:1',
    meeting: 'ffn-qor',
    text:
      'Gate count grew in 9 of 60 blocks at FFN, by 11% on average (8.3–14.3%). At the frozen floorplan those blocks go from ~70% to ~78% utilization and congestion is expected in the NPU / ISP / GPU channels — shorts and timing closure at risk for the 12/11 Design Freeze and the 01/29 tapeout. Owner: Jihoon Park. Mitigation under review: a die-size increase, or rebalancing area inside the current die.',
  },
  {
    key: 'note-ffn-delta',
    kind: 'note',
    at: '2023-10-04 17:00',
    stageId: 'physicalDesign',
    text: 'FFN gate-count delta — the nine blocks that grew',
    blocks: [
      { p: 'FFN (09/29/2023) against N2 (08/18/2023). The other 51 blocks are within ±3%. Die 8.4 × 8.4 mm, package and substrate frozen.' },
      {
        table: {
          head: ['Block', 'Function', 'N2 gates', 'FFN gates', 'Δ', 'Placement utilization'],
          rows: [
            ['npu_core0', 'NPU core 0', '4.12 M', '4.71 M', '+14.3%', '71% → 81%'],
            ['npu_core1', 'NPU core 1', '4.08 M', '4.60 M', '+12.7%', '71% → 80%'],
            ['isp_pipe', 'ISP pipeline', '3.35 M', '3.76 M', '+12.2%', '70% → 78%'],
            ['venc_top', 'Video encoder', '2.94 M', '3.28 M', '+11.6%', '69% → 77%'],
            ['vdec_top', 'Video decoder', '2.61 M', '2.89 M', '+10.7%', '68% → 76%'],
            ['gpu_shader', 'GPU shader cores', '5.20 M', '5.73 M', '+10.2%', '72% → 79%'],
            ['pcie_ctrl', 'PCIe controller', '1.42 M', '1.56 M', '+9.9%', '66% → 72%'],
            ['ddr_ctrl', 'LPDDR controller', '1.18 M', '1.29 M', '+9.3%', '67% → 73%'],
            ['sec_crypto', 'Security and crypto', '0.96 M', '1.04 M', '+8.3%', '65% → 70%'],
            ['Nine blocks', '', '25.86 M', '28.66 M', '+11.0% avg', ''],
          ],
        },
      },
      { h: 'What the customer said changed' },
      {
        bullets: [
          'NPU: a second operator library and wider quantization paths added after N2',
          'ISP / codecs: an extra HDR pipeline stage and a new rate-control mode',
          'GPU shader, PCIe, LPDDR, crypto: debug and safety logic added late',
        ],
      },
    ],
  },
  {
    key: 'ffn-trial',
    kind: 'update',
    at: '2023-10-05 19:10',
    step: 'PD-15:2',
    text:
      'Trial placement and global route on the FFN at the N2 floorplan: global route overflow 4.6% in the nine blocks (0.8% at N2), 8,940 shorts after first detail route, setup WNS −231 ps, 21,300 violating endpoints. Congestion confirmed where the delta predicted it. Die-size impact analysis ready for tomorrow’s review.',
  },
  {
    key: 'risk-gate-count-refused',
    kind: 'reply',
    at: '2023-10-12 17:10',
    parent: 'risk-gate-count',
    text:
      'Customer declined the die-size increase (8.4 → 8.8 mm per side) at the weekly: package and substrate are frozen and the BOM cost target does not allow ~9% fewer gross die per wafer. Agreed to recover inside the current die by rebalancing area — congested blocks up, neighbours down. Congestion task force starts 10/17, Tuesdays and Fridays, owner Yuna Kim.',
  },
  {
    key: 'tf-turn1',
    kind: 'update',
    at: '2023-10-20 18:30',
    step: 'PD-15:2',
    text:
      'Task force turn 1 — the nine blocks grown by ~6% area, six neighbours shrunk by ~4%: overflow 4.6% → 2.1%, shorts 8,940 → 4,110, WNS −231 → −188 ps, violating endpoints 21,300 → 12,600. Better, but two shrunk neighbours (ddr_ctrl region, usb_top) now show local congestion of their own.',
  },
  {
    key: 'tf-turn2',
    kind: 'update',
    at: '2023-11-03 18:45',
    step: 'PD-15:6',
    text:
      'Task force turn 2 — cell padding in the NPU and GPU channels, non-default-rule relief on the widest buses: shorts 4,110 → 2,380, WNS −188 → −162 ps, endpoints 12,600 → 8,900. Each turn is gaining less. Asked Sungmin Choi for a projection of where the WNS curve flattens.',
  },
  {
    key: 'tf-turn3',
    kind: 'update',
    at: '2023-11-17 19:00',
    step: 'PD-15:7',
    text:
      'Task force turn 3 — second rebalance (+3% / −2%): shorts 2,380 → 1,760, WNS −162 → −149 ps, endpoints 8,900 → 7,400. The worst paths are now in the HVQK corner and on the test-mode (TAP) paths that cross the congested NPU channel.',
  },
  {
    key: 'note-tf-trend',
    kind: 'note',
    at: '2023-11-24 18:00',
    stageId: 'physicalDesign',
    text: 'Congestion task force — trend by turn',
    blocks: [
      { p: 'Floorplan rebalancing inside the fixed 8.4 × 8.4 mm die, after the customer declined a larger die on 10/12. Numbers are after detail route on the full chip.' },
      {
        table: {
          head: ['Turn', 'Date', 'Change', 'Overflow (9 blocks)', 'Shorts', 'Setup WNS', 'Violating endpoints'],
          rows: [
            ['FFN trial', '10/05', 'N2 floorplan', '4.6%', '8,940', '−231 ps', '21,300'],
            ['TF-1', '10/20', 'Nine blocks +6% area, six neighbours −4%', '2.1%', '4,110', '−188 ps', '12,600'],
            ['TF-2', '11/03', 'Cell padding, NDR relief on wide buses', '1.4%', '2,380', '−162 ps', '8,900'],
            ['TF-3', '11/17', 'Second rebalance, +3% / −2%', '1.1%', '1,760', '−149 ps', '7,400'],
            ['TF-4', '11/24', 'Partial re-placement, blockage tuning', '1.0%', '1,690', '−151 ps', '7,650'],
          ],
        },
      },
      { h: 'Reading' },
      {
        bullets: [
          'Shorts and WNS flattened between TF-3 and TF-4; TF-4 traded shorts for timing',
          'Every area moved into the nine blocks created congestion in a neighbour',
          'Worst paths: HVQK corner, and TAP test-mode paths through the NPU channel at 130 MHz',
          'Closure assessment with signoff and the design service director on 11/28',
        ],
      },
    ],
  },
  {
    key: 'risk-signoff',
    kind: 'risk',
    at: '2023-11-28 16:40',
    step: 'SO-03:7',
    meeting: 'closure-assessment',
    text:
      'A normal timing signoff is not achievable for the 01/29 tapeout. After four task-force turns shorts plateau at ~1,700 and setup WNS at ~−150 ps, worst in the HVQK corner and on the 130 MHz TAP test-mode paths; the projection needs 8–10 more weeks with no guarantee of convergence inside the current die. Owner: Dohyun Lee. Options A/B/C prepared for the customer escalation on 12/05.',
  },
  {
    key: 'risk-gate-count-escalated',
    kind: 'reply',
    at: '2023-11-28 16:55',
    parent: 'risk-gate-count',
    text: 'Rebalancing did not converge (see the task-force trend note). Escalated as a signoff risk; decision needed from the customer on 12/05.',
  },
  {
    key: 'note-options',
    kind: 'note',
    at: '2023-11-28 20:00',
    stageId: 'tapeout',
    text: 'Recovery options for the customer escalation — 12/05/2023',
    blocks: [
      { p: 'Prepared after the closure assessment on 11/28. The SoW includes two tapeouts (EVT0, EVT1).' },
      {
        table: {
          head: ['Option', 'What it means', 'Tapeout', 'Risk', 'Cost'],
          rows: [
            ['A — close at full criteria', 'Keep the signoff criteria and keep rebalancing, possibly re-partition', '~05/2024 (+4 months)', 'Convergence not shown in four turns; could slip further', 'Engineering time; customer schedule'],
            ['B — EVT0 for functional validation', 'Tape out EVT0 on relaxed signoff criteria; fix the root cause in EVT1 for production', '03/2024 (+2 months)', 'EVT0 silicon not for qualification or production; EVT1 must close at full criteria', '+50 wafers for sample quantity'],
            ['C — larger die', '8.4 → 8.8 mm per side', '—', 'Declined 10/12: package frozen, BOM cost', '~9% fewer gross die'],
          ],
        },
      },
      { h: 'Recommendation' },
      { p: 'Option B: functional validation starts two months late instead of four or more, the second tapeout in the SoW absorbs the fix, and the risk is confined to EVT0 silicon that was never meant for production.' },
    ],
  },
  {
    key: 'note-evt0-criteria',
    kind: 'note',
    at: '2023-12-05 19:30',
    stageId: 'signoff',
    text: 'EVT0 signoff criteria — agreed with the customer on 12/05/2023',
    blocks: [
      { p: 'EVT0 tapes out for functional validation only. EVT1 returns to the full SoW criteria and is the production tapeout.' },
      {
        table: {
          head: ['Item', 'SoW criteria', 'EVT0', 'Owner', 'Due'],
          rows: [
            ['TAP clock', '130 MHz', '100 MHz — test-mode timing, sort and final test programs updated', 'Sungmin Choi / Taeho Jung', '12/15'],
            ['HVQK corner', 'Full signoff limits', 'Relaxed limits; residual violations on the waiver list', 'Dohyun Lee', '12/15'],
            ['FEOL / BEOL variation', '3σ', '1.5σ', 'Dohyun Lee with the foundry', '12/12'],
            ['OCV margin', 'Applied', 'Removed', 'Sungmin Choi', '12/08'],
            ['Wafers', '25', '75 (+50) to protect the functional sample count', 'Jaehyuk Yoon / Daniel Kwon', '12/13'],
          ],
        },
      },
      { h: 'Conditions' },
      {
        bullets: [
          'EVT0 samples are for functional validation; no qualification or customer production builds',
          'The waiver list is reviewed with the foundry and accepted by the customer before tapeout',
          'EVT1 root-cause plan (floorplan and partition changes with the customer) starts by 04/15/2024',
        ],
      },
    ],
  },
  {
    key: 'risk-signoff-decided',
    kind: 'reply',
    at: '2023-12-05 19:45',
    parent: 'risk-signoff',
    text:
      'Customer agreed Option B: EVT0 on relaxed criteria for functional validation, fixes in EVT1 under the two-tapeout SoW, tapeout re-planned to 03/25/2024. Criteria, owners and dates in the EVT0 signoff criteria note; actions tracked from the escalation meeting.',
  },
  {
    key: 'risk-samples',
    kind: 'risk',
    at: '2023-12-05 20:05',
    step: 'FAB-05:2',
    meeting: 'escalation',
    text:
      'At 1.5σ variation and without OCV margin, EVT0 parametric yield will be lower than planned and 25 wafers may not give the customer enough functional samples. Owner: Jaehyuk Yoon. Mitigation agreed: start 50 more wafers with the lot.',
  },
  {
    key: 'risk-samples-slot',
    kind: 'reply',
    at: '2023-12-13 11:20',
    parent: 'risk-samples',
    text: 'Foundry confirmed capacity for 75 wafers in the EVT0 start and quoted the extra 50; customer PO amendment signed by Daniel Kwon.',
  },
  {
    key: 'tap-clock',
    kind: 'update',
    at: '2023-12-12 16:00',
    step: 'TEST-06:7',
    text:
      'Sort program limits and guard bands updated for the 100 MHz TAP clock; the scan shift frequency is re-timed on the load board model. Test time impact on sort +6%, accepted for EVT0.',
  },
  {
    key: 'risk-fab-cycle',
    kind: 'risk',
    at: '2023-12-14 17:30',
    step: 'FAB-05:3',
    meeting: 'fab-review',
    text:
      'No fab cycle-time recovery available: DPML is already at the contracted minimum, so First Silicon moves with tapeout — 05/13 → 07/08/2024 (+8 weeks). Owner: Jaehyuk Yoon. Asked the customer to pull in assembly to protect the sample date.',
  },
  {
    key: 'risk-fab-cycle-pullin',
    kind: 'reply',
    at: '2024-01-11 17:40',
    parent: 'risk-fab-cycle',
    text:
      'Customer pulls assembly in: a priority lot is die-attached on wafer arrival and its first units go straight to bring-up, four weeks before the full assembly completes instead of one. First Assembled Units still move +8 weeks with the wafers, but bring-up, customer samples and production move +5.',
  },
  {
    key: 'note-rebaseline',
    kind: 'note',
    at: '2024-01-12 10:00',
    stageId: 'tapeout',
    text: 'Schedule re-baseline — 01/12/2024',
    blocks: [
      { p: 'Re-baselined after the EVT0 criteria agreement (12/05), the fab-cycle review (12/14) and the customer’s assembly pull-in (01/11).' },
      {
        table: {
          head: ['Milestone', 'Plan', 'Re-baselined', 'Change', 'Why'],
          rows: [
            ['Design Freeze', '12/11/2023', '01/29/2024', '+7 weeks', 'Relaxed-criteria signoff'],
            ['Tapeout (BEOL MTO)', '01/29/2024', '03/25/2024', '+8 weeks', 'EVT0 closure'],
            ['First Silicon', '05/13/2024', '07/08/2024', '+8 weeks', 'DPML at minimum — no compression'],
            ['First Assembled Units', '06/24/2024', '08/19/2024', '+8 weeks', 'Moves with the wafers'],
            ['Bring-up start', '06/17/2024', '07/22/2024', '+5 weeks', 'Customer priority lot recovers 3 weeks'],
            ['Customer Samples', '10/21/2024', '11/25/2024', '+5 weeks', ''],
            ['Mass Production (EVT1)', '01/13/2025', '02/17/2025', '+5 weeks', ''],
          ],
        },
      },
    ],
  },
  {
    key: 'signoff-closed',
    kind: 'update',
    at: '2024-01-26 18:10',
    step: 'SO-03:7',
    text:
      'EVT0 timing signoff closed on the agreed criteria: TAP at 100 MHz, 1.5σ, no OCV margin. 212 residual violations, all in the HVQK corner, on the waiver list reviewed with the foundry and accepted by the customer. Signoff summary and Design Freeze package due 01/29.',
  },
  {
    key: 'feol-mto',
    kind: 'update',
    at: '2024-02-22 15:00',
    step: 'TO-06:3',
    text: 'FEOL MTO submitted and accepted by the foundry. Wafer start authorized for 75 wafers on FEOL mask availability.',
  },
  {
    key: 'beol-mto',
    kind: 'update',
    at: '2024-03-22 16:30',
    step: 'TO-10:3',
    text:
      'BEOL MTO submitted and accepted — EVT0 tapeout complete, full mask set on 03/25/2024, two months after the original plan. EVT1 root-cause plan kickoff scheduled for 04/15.',
  },
  {
    key: 'note-retro',
    kind: 'note',
    at: '2024-03-28 18:00',
    stageId: 'tapeout',
    text: 'EVT0 retrospective — the FFN congestion issue',
    blocks: [
      { h: 'What happened' },
      {
        p: 'The FFN arrived on 09/29/2023 with 9 of 60 blocks 11% larger than N2. The die was fixed by the frozen package, the customer declined a larger die, and four turns of floorplan rebalancing did not converge. On 11/28 a normal timing signoff was judged unreachable for the 01/29 tapeout. EVT0 taped out on 03/25/2024 on relaxed criteria for functional validation; production moves to EVT1.',
      },
      { h: 'Root cause' },
      {
        bullets: [
          'Functional content was added after N2 without a gate-count check against the floorplan budget',
          'The die size was frozen with the package before the netlist was final, with ~5% whitespace',
          'No agreed trigger for re-negotiating die size or criteria when a netlist drop breaks the budget',
        ],
      },
      { h: 'What the TPM did' },
      {
        table: {
          head: ['When', 'What', 'Outcome'],
          rows: [
            ['10/03–10/04', 'Turned the FFN delta into a risk with an owner; convened the customer alignment the next day', 'Issue confirmed with the customer within five days of the FFN'],
            ['10/06–10/12', 'Built the die-size proposal with the impact on cost and schedule', 'A clear customer decision in one week'],
            ['10/17–11/24', 'Ran the congestion task force twice a week; tracked the trend, owners and carried actions', 'Non-convergence visible early from data, not opinion'],
            ['11/28', 'Called the closure assessment; prepared options A/B/C with tapeout, risk and cost', 'Escalation framed as a decision, not a problem'],
            ['12/05', 'Led the customer escalation; each relaxation got an owner and a due date', 'EVT0 on relaxed criteria, +50 wafers, fixes in EVT1'],
            ['12/14–01/12', 'Confirmed fab could not compress; asked the customer for an assembly pull-in; re-baselined', 'Slip at production held to +5 weeks'],
          ],
        },
      },
      { h: 'What changes for EVT1 and the next program' },
      {
        bullets: [
          'A gate-count and utilization gate at every netlist drop from N1, with the customer',
          'Congestion early warning on N1 and N2 trial placements, reviewed weekly',
          'A die-size or criteria re-negotiation clause in the SoW tied to netlist growth',
          'EVT1: re-partition the NPU / ISP area with the customer and close at the full SoW criteria',
        ],
      },
    ],
  },
];

/* ---------- meetings ---------- */

const PD_TEAM = ['Jihoon Park', 'Yuna Kim', 'Sungmin Choi', 'Hyejin Oh'];
const CUSTOMER = ['Daniel Kwon', 'Eunji Seo'];

export const SOC_SERIES: readonly ScenarioSeries[] = [
  {
    key: 'pd-weekly',
    title: 'PD Weekly Sync',
    purpose: 'Physical design status by block and turn, netlist drops, the risks and actions that need the TPM, and what goes to the customer weekly.',
    type: 'working_group',
    attendees: [...PD_TEAM, 'Dohyun Lee', 'Taeho Jung'],
    freq: 'weekly',
    weekdays: [3],
    startDate: '2023-03-08',
    until: '2024-01-17',
    time: '10:00',
    durationMinutes: 60,
    agendaTemplate: ['Status by block and turn', 'Netlist drops and deltas', 'Risks and actions', 'Items for the customer weekly'],
    location: 'Design center 5F / Teams',
    stage: 'physicalDesign',
    links: [{ type: 'stage', ref: 'physicalDesign' }],
  },
  {
    key: 'customer-weekly',
    title: 'AtlasSoC Customer Weekly',
    purpose: 'The customer and the design service team: schedule against the plan, open issues and decisions, and what each side owes the other this week.',
    type: 'program_review',
    attendees: [...CUSTOMER, 'Jihoon Park', 'Dohyun Lee', 'Brian Lim'],
    freq: 'weekly',
    weekdays: [4],
    startDate: '2023-03-09',
    until: '2024-03-28',
    time: '15:00',
    durationMinutes: 60,
    agendaTemplate: ['Schedule against the plan', 'Open issues and decisions', 'Customer inputs owed', 'Actions review'],
    location: 'Teams',
    stage: 'physicalDesign',
    links: [
      { type: 'stage', ref: 'physicalDesign' },
      { type: 'milestone', ref: 'tapeoutBeolMto' },
    ],
  },
  {
    key: 'congestion-tf',
    title: 'Congestion Task Force',
    purpose: 'Twice a week until the nine grown blocks route and time: turn results, the next rebalance, and who owns each block’s fix.',
    type: 'war_room',
    attendees: [...PD_TEAM, 'Dohyun Lee'],
    freq: 'weekly',
    weekdays: [2, 5],
    startDate: '2023-10-17',
    until: '2023-11-24',
    time: '17:00',
    durationMinutes: 45,
    agendaTemplate: ['Turn results — overflow, shorts, WNS', 'Next rebalance', 'Owners by block', 'Carried actions'],
    location: 'Design center 5F war-room',
    stage: 'physicalDesign',
    links: [
      { type: 'activity', ref: 'PD-15' },
      { type: 'risk', ref: 'risk-gate-count' },
    ],
  },
  {
    key: 'readiness',
    title: 'EVT0 Tapeout Readiness Review',
    purpose: 'Tuesdays to tapeout: relaxed-criteria signoff by domain, the waiver list, the tapeout checklist, mask dates and wafer start.',
    type: 'readiness_review',
    attendees: ['Dohyun Lee', 'Sungmin Choi', 'Minseo Han', 'Jaehyuk Yoon', 'Taeho Jung', 'Daniel Kwon'],
    freq: 'weekly',
    weekdays: [2],
    startDate: '2024-01-09',
    until: '2024-03-19',
    time: '10:00',
    durationMinutes: 60,
    agendaTemplate: ['Signoff by domain', 'Waiver list', 'Tapeout checklist', 'Mask dates and wafer start'],
    location: 'Conference room A / Teams',
    stage: 'tapeout',
    links: [
      { type: 'stage', ref: 'signoff' },
      { type: 'stage', ref: 'tapeout' },
      { type: 'milestone', ref: 'tapeoutBeolMto' },
    ],
  },
];

export const SOC_MEETINGS: readonly ScenarioMeeting[] = [
  {
    key: 'ffn-qor',
    title: 'FFN QoR Alignment',
    type: 'design_review',
    purpose: 'Walk the customer through the FFN gate-count delta, confirm what changed and why, and agree how to assess the congestion impact.',
    attendees: [...PD_TEAM, ...CUSTOMER],
    location: 'Teams',
    stage: 'physicalDesign',
    links: [
      { type: 'step', ref: 'PD-15:1' },
      { type: 'risk', ref: 'risk-gate-count' },
    ],
    date: '2023-10-04',
    time: '14:00',
    durationMinutes: 60,
    status: 'completed',
    minutes: 'Customer confirmed the growth is intentional feature content added after N2 and will not be removed for EVT0. Congestion risk raised with Jihoon Park as owner. Die-size impact analysis to be reviewed internally on 10/06 before any proposal goes to the customer.',
    agenda: [
      {
        title: 'FFN delta against N2',
        presenter: 'Jihoon Park',
        minutes: 20,
        notes: '9 of 60 blocks grew 8.3–14.3%, 11.0% on average; chip total +4.4%. Utilization in those blocks ~70% → ~78%.',
        outcome: 'risk',
        links: [{ type: 'step', ref: 'PD-15:1' }],
      },
      {
        title: 'What changed and whether it can come out',
        presenter: 'Eunji Seo',
        minutes: 20,
        notes: 'NPU operator library, HDR ISP stage, codec rate control, late debug and safety logic. All required for the product; nothing removed.',
        outcome: 'info',
      },
      {
        title: 'Assessment plan',
        presenter: '@me',
        minutes: 20,
        notes: 'Trial placement on the FFN by 10/05; die-size impact (area, gross die, package) by 10/06.',
        outcome: 'action',
      },
    ],
    decisions: [
      {
        title: 'Treat the FFN growth as fixed scope and assess congestion before proposing a fix',
        description: 'The added content stays. Physical design assesses congestion on the FFN and the options — a larger die, or rebalancing inside the current die — before anything is proposed to the customer.',
        rationale: 'A proposal without trial-placement data would not survive the customer weekly.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Eunji Seo',
        scope: 'FFN scope',
        agenda: 1,
        links: [{ type: 'risk', ref: 'risk-gate-count' }],
      },
    ],
    actions: [
      {
        description: 'Run trial placement and global route on the FFN at the N2 floorplan and report overflow, shorts and WNS',
        owner: 'Yuna Kim',
        due: '2023-10-05',
        priority: 'critical',
        status: 'done',
        type: 'support',
        agenda: 2,
        evidence: 'Trial results posted on PD-15 step 2: overflow 4.6%, 8,940 shorts, WNS −231 ps.',
        verifiedBy: '@me',
        completed: '2023-10-05',
        links: [{ type: 'step', ref: 'PD-15:2' }],
      },
      {
        description: 'Prepare the die-size increase impact — area, gross die per wafer, package and schedule',
        owner: 'Jihoon Park',
        contributors: ['Brian Lim'],
        due: '2023-10-06',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        agenda: 2,
        evidence: 'Impact deck reviewed on 10/06: 8.8 mm per side, ~9% fewer gross die, substrate re-spin 6 weeks.',
        verifiedBy: '@me',
        completed: '2023-10-06',
      },
    ],
  },
  {
    key: 'diesize-review',
    title: 'Die-Size Proposal Review',
    type: 'program_review',
    purpose: 'Decide internally whether to propose a larger die to the customer, and with what evidence.',
    attendees: ['Jihoon Park', 'Yuna Kim', 'Dohyun Lee', 'Kyungsoo Nam'],
    location: 'Conference room A',
    stage: 'physicalDesign',
    links: [{ type: 'risk', ref: 'risk-gate-count' }],
    date: '2023-10-06',
    time: '10:00',
    durationMinutes: 45,
    status: 'completed',
    minutes: 'Agreed to propose 8.4 → 8.8 mm per side at the 10/12 customer weekly, with rebalancing inside the current die as the fallback if the customer declines.',
    agenda: [
      {
        title: 'Trial placement results',
        presenter: 'Yuna Kim',
        minutes: 15,
        notes: 'Overflow 4.6% in the nine blocks; shorts and WNS well beyond what normal ECO turns close.',
        outcome: 'risk',
      },
      {
        title: 'Die-size increase impact',
        presenter: 'Jihoon Park',
        minutes: 20,
        notes: '8.8 × 8.8 mm (+9.7% area) brings utilization back to ~72%. Costs ~9% gross die and a substrate re-spin.',
        outcome: 'decision',
      },
    ],
    decisions: [
      {
        title: 'Propose a die-size increase to 8.8 × 8.8 mm, with rebalancing as the fallback',
        description: 'The TPM presents the increase at the 10/12 customer weekly with the trial data and the cost and schedule impact; the PD lead prepares a rebalancing plan in parallel.',
        rationale: 'The larger die is the only option that restores placement margin; the customer owns the cost trade-off.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Kyungsoo Nam',
        scope: 'Die size',
        agenda: 1,
        links: [{ type: 'risk', ref: 'risk-gate-count' }],
      },
    ],
    actions: [
      {
        description: 'Send the die-size proposal with trial data and impact to the customer ahead of the weekly',
        owner: '@me',
        due: '2023-10-10',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        evidence: 'Proposal sent to Daniel Kwon and Eunji Seo on 10/10 with the trial results and the impact deck.',
        completed: '2023-10-10',
      },
      {
        description: 'Draft a rebalancing plan inside the current die in case the customer declines',
        owner: 'Yuna Kim',
        due: '2023-10-12',
        priority: 'high',
        status: 'done',
        type: 'support',
        evidence: 'Plan ready 10/12: nine blocks +6% area, six neighbours −4%, channel padding on NPU and GPU.',
        verifiedBy: '@me',
        completed: '2023-10-12',
        links: [{ type: 'activity', ref: 'PD-15' }],
      },
    ],
  },
  {
    key: 'customer-1012',
    series: 'customer-weekly',
    date: '2023-10-12',
    time: '15:00',
    status: 'completed',
    minutes: 'Customer declined the die-size increase. Rebalancing inside the current die starts; task force twice a week from 10/17. Tapeout date held for now, reviewed on the task-force trend.',
    agenda: [
      {
        title: 'Die-size increase proposal',
        presenter: '@me',
        minutes: 25,
        notes: 'Presented 8.8 mm per side with the trial data. Customer: package and substrate are frozen, and ~9% fewer gross die breaks the BOM cost target.',
        outcome: 'decision',
        links: [{ type: 'risk', ref: 'risk-gate-count' }],
      },
      {
        title: 'Recovery inside the current die',
        presenter: 'Jihoon Park',
        minutes: 20,
        notes: 'Rebalancing plan walked through; first turn results expected 10/20.',
        outcome: 'action',
      },
    ],
    decisions: [
      {
        title: 'Keep the die size; recover congestion by rebalancing the floorplan',
        description: 'The 8.4 × 8.4 mm die stays. Grow the congested blocks and shrink their neighbours inside it, run as a task force twice a week, and review the trend before the tapeout date is touched.',
        rationale: 'Package and substrate are frozen and the BOM cost target has no room for fewer gross die.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Daniel Kwon',
        scope: 'Die size and floorplan',
        agenda: 0,
        links: [
          { type: 'risk', ref: 'risk-gate-count' },
          { type: 'activity', ref: 'PD-15' },
        ],
      },
    ],
    actions: [
      {
        description: 'Stand up the congestion task force (Tuesdays and Fridays) with an owner per grown block',
        owner: '@me',
        due: '2023-10-17',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        agenda: 1,
        evidence: 'Series created from 10/17; owners assigned for all nine blocks and six neighbours.',
        completed: '2023-10-16',
      },
      {
        description: 'Run task-force turn 1 with the rebalanced floorplan',
        owner: 'Yuna Kim',
        due: '2023-10-20',
        priority: 'critical',
        status: 'done',
        type: 'support',
        agenda: 1,
        evidence: 'Turn 1 results posted on PD-15 step 2: shorts 8,940 → 4,110, WNS −231 → −188 ps.',
        verifiedBy: '@me',
        completed: '2023-10-20',
        links: [{ type: 'step', ref: 'PD-15:2' }],
      },
    ],
  },
  {
    key: 'tf-1020',
    series: 'congestion-tf',
    date: '2023-10-20',
    time: '17:00',
    status: 'completed',
    minutes: 'Turn 1 halved shorts and endpoints but moved congestion into two shrunk neighbours. Turn 2 adds cell padding and NDR relief.',
    agenda: [
      { title: 'Turn results — overflow, shorts, WNS', presenter: 'Yuna Kim', minutes: 20, notes: 'Overflow 2.1%, shorts 4,110, WNS −188 ps, endpoints 12,600.', outcome: 'info' },
      { title: 'Next rebalance', presenter: 'Hyejin Oh', minutes: 15, notes: 'Cell padding in the NPU and GPU channels; NDR relief on the widest buses.', outcome: 'action' },
    ],
    actions: [
      {
        description: 'Apply cell padding and NDR relief and run turn 2',
        owner: 'Hyejin Oh',
        due: '2023-11-03',
        priority: 'high',
        status: 'done',
        type: 'support',
        agenda: 1,
        evidence: 'Turn 2 posted on PD-15 step 6: shorts 4,110 → 2,380, WNS −162 ps.',
        verifiedBy: '@me',
        completed: '2023-11-03',
        links: [{ type: 'step', ref: 'PD-15:6' }],
      },
      {
        description: 'Project where the setup WNS curve flattens at the current criteria',
        owner: 'Sungmin Choi',
        due: '2023-11-03',
        priority: 'high',
        status: 'done',
        type: 'support',
        evidence: 'Projection delivered 11/17 after turn 3 data: flattening near −150 ps without criteria or area change.',
        verifiedBy: '@me',
        completed: '2023-11-17',
        carriedTo: 'tf-1117',
        impact: 'milestone',
        impactNote: 'Needed to judge whether the 12/11 Design Freeze holds.',
      },
    ],
  },
  {
    key: 'tf-1117',
    series: 'congestion-tf',
    date: '2023-11-17',
    time: '17:00',
    status: 'completed',
    minutes: 'Turn 3 gains are small; the worst paths are HVQK and the 130 MHz TAP test-mode paths. The WNS projection (carried from 10/20) says the curve flattens near −150 ps.',
    agenda: [
      { title: 'Turn results — overflow, shorts, WNS', presenter: 'Yuna Kim', minutes: 15, notes: 'Shorts 1,760, WNS −149 ps, endpoints 7,400.', outcome: 'risk' },
      { title: 'Carried: WNS projection', presenter: 'Sungmin Choi', minutes: 15, notes: 'Flattening near −150 ps at the current criteria; area moves are no longer buying timing.', outcome: 'risk', links: [{ type: 'activity', ref: 'PD-06' }] },
    ],
    actions: [
      {
        description: 'Run turn 4 with partial re-placement and blockage tuning as the last rebalance attempt',
        owner: 'Yuna Kim',
        due: '2023-11-24',
        priority: 'critical',
        status: 'done',
        type: 'support',
        evidence: 'Turn 4: shorts 1,690, WNS −151 ps, endpoints 7,650 — trend note posted 11/24.',
        verifiedBy: '@me',
        completed: '2023-11-24',
        links: [{ type: 'step', ref: 'PD-15:7' }],
      },
      {
        description: 'Book a closure assessment with signoff and the design service director for 11/28',
        owner: '@me',
        due: '2023-11-21',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        evidence: 'Closure assessment scheduled 11/28 with Kyungsoo Nam, Dohyun Lee and the PD team.',
        completed: '2023-11-20',
      },
    ],
  },
  {
    key: 'closure-assessment',
    title: 'Signoff Closure Assessment',
    type: 'program_review',
    purpose: 'Decide whether a normal timing signoff is reachable for the 01/29 tapeout, and if not, which options go to the customer.',
    attendees: [...PD_TEAM, 'Dohyun Lee', 'Kyungsoo Nam'],
    location: 'Conference room A',
    stage: 'signoff',
    links: [
      { type: 'risk', ref: 'risk-signoff' },
      { type: 'milestone', ref: 'designFreeze' },
      { type: 'milestone', ref: 'tapeoutBeolMto' },
    ],
    date: '2023-11-28',
    time: '14:00',
    durationMinutes: 90,
    status: 'completed',
    minutes: 'Normal signoff judged not achievable for 01/29. Three options to be put to the customer on 12/05; recommendation is Option B (EVT0 on relaxed criteria, fix in EVT1).',
    agenda: [
      { title: 'Task-force trend', presenter: 'Yuna Kim', minutes: 20, notes: 'Four turns; shorts and WNS plateaued.', outcome: 'info', links: [{ type: 'step', ref: 'PD-15:9' }] },
      { title: 'Signoff outlook at full criteria', presenter: 'Dohyun Lee', minutes: 25, notes: '8–10 more weeks with no guarantee of convergence inside the current die.', outcome: 'risk', links: [{ type: 'step', ref: 'SO-03:7' }] },
      { title: 'Options for the customer', presenter: '@me', minutes: 35, notes: 'A: full criteria, ~05/2024. B: EVT0 relaxed, fix in EVT1, 03/2024. C: larger die, already declined.', outcome: 'escalation' },
    ],
    decisions: [
      {
        title: 'Escalate to the customer with Option B recommended',
        description: 'Normal timing signoff is not reachable for the 01/29 tapeout. Present options A/B/C at a customer escalation on 12/05, recommending EVT0 on relaxed criteria for functional validation with the fixes in EVT1.',
        rationale: 'B starts functional validation two months late instead of four or more and uses the second tapeout already in the SoW.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Kyungsoo Nam',
        scope: 'Tapeout plan',
        agenda: 2,
        links: [{ type: 'risk', ref: 'risk-signoff' }],
      },
    ],
    actions: [
      {
        description: 'Prepare the options pack — tapeout date, risk and cost per option — for the 12/05 escalation',
        owner: '@me',
        due: '2023-11-30',
        priority: 'critical',
        status: 'done',
        type: 'standalone',
        agenda: 2,
        evidence: 'Options note posted 11/28 and the pack sent to the customer on 11/30.',
        completed: '2023-11-30',
      },
      {
        description: 'Define candidate relaxed signoff criteria and quantify what each recovers',
        owner: 'Dohyun Lee',
        contributors: ['Sungmin Choi', 'Taeho Jung'],
        due: '2023-12-04',
        priority: 'critical',
        status: 'done',
        type: 'support',
        agenda: 1,
        evidence: 'Criteria table ready 12/04: TAP 130 → 100 MHz, HVQK relaxed, 3σ → 1.5σ, OCV removed, with recovered slack per item.',
        verifiedBy: '@me',
        completed: '2023-12-04',
        links: [{ type: 'step', ref: 'SO-03:7' }],
      },
      {
        description: 'Check wafer capacity for a larger EVT0 start if sample yield drops',
        owner: 'Jaehyuk Yoon',
        due: '2023-12-04',
        priority: 'high',
        status: 'done',
        type: 'support',
        evidence: 'Foundry indicated capacity for up to +50 wafers in the EVT0 start; formal quote after the decision.',
        verifiedBy: '@me',
        completed: '2023-12-01',
      },
    ],
  },
  {
    key: 'escalation',
    title: 'EVT0 Signoff Criteria Escalation',
    type: 'program_review',
    purpose: 'Customer decision on how EVT0 tapes out after normal signoff was judged unreachable.',
    attendees: [...CUSTOMER, 'Kyungsoo Nam', 'Jihoon Park', 'Dohyun Lee', 'Jaehyuk Yoon', 'Brian Lim'],
    location: 'Customer site / Teams',
    stage: 'signoff',
    links: [
      { type: 'risk', ref: 'risk-signoff' },
      { type: 'milestone', ref: 'tapeoutBeolMto' },
    ],
    date: '2023-12-05',
    time: '10:00',
    durationMinutes: 120,
    status: 'completed',
    minutes: 'Customer chose Option B. EVT0 tapes out for functional validation on relaxed signoff criteria with 50 more wafers, the root-cause fix goes into EVT1 under the two-tapeout SoW, and tapeout is re-planned to 03/25/2024. Every relaxation has an owner and a date.',
    agenda: [
      { title: 'Where closure stands', presenter: 'Dohyun Lee', minutes: 25, notes: 'Four task-force turns; plateau at ~1,700 shorts and ~−150 ps.', outcome: 'info' },
      { title: 'Options A / B / C', presenter: '@me', minutes: 40, notes: 'Tapeout, risk and cost per option; Option B recommended.', outcome: 'decision' },
      { title: 'EVT0 criteria and conditions', presenter: 'Dohyun Lee', minutes: 35, notes: 'Item by item with owners and dates.', outcome: 'decision', links: [{ type: 'stage', ref: 'signoff' }] },
      { title: 'Sample quantity', presenter: 'Jaehyuk Yoon', minutes: 20, notes: 'Lower parametric yield expected at relaxed criteria.', outcome: 'risk', links: [{ type: 'risk', ref: 'risk-samples' }] },
    ],
    decisions: [
      {
        title: 'Tape out EVT0 for functional validation; fix the root cause in EVT1',
        description: 'EVT0 is a functional validation tapeout on relaxed signoff criteria. Under the two-tapeout SoW, EVT1 fixes the congestion root cause, closes at full criteria and goes to production. Tapeout re-planned from 01/29 to 03/25/2024.',
        rationale: 'Functional validation starts two months late rather than four or more, and the risk is confined to silicon never meant for production.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Daniel Kwon',
        scope: 'Tapeout plan — EVT0 and EVT1',
        agenda: 1,
        links: [
          { type: 'risk', ref: 'risk-signoff' },
          { type: 'milestone', ref: 'tapeoutBeolMto' },
        ],
      },
      {
        title: 'Relax the EVT0 signoff criteria',
        description: 'For EVT0 only: TAP clock 130 MHz → 100 MHz; HVQK corner signed off with relaxed limits and residual violations waived; FEOL/BEOL variation 3σ → 1.5σ; OCV margin removed. EVT1 returns to the SoW criteria.',
        rationale: 'Together these recover enough slack to close timing inside the current die for functional silicon.',
        status: 'approved',
        owner: 'Dohyun Lee',
        approvedBy: 'Eunji Seo',
        scope: 'EVT0 signoff criteria',
        agenda: 2,
        links: [{ type: 'stage', ref: 'signoff' }],
      },
      {
        title: 'Start 50 more wafers with EVT0',
        description: 'Start 75 wafers instead of 25 — 50 wafers more — so functional validation has enough samples despite lower parametric yield at relaxed criteria. Customer amends the PO.',
        rationale: 'Sample shortfall would cost more time than the wafers cost.',
        status: 'approved',
        owner: 'Jaehyuk Yoon',
        approvedBy: 'Daniel Kwon',
        scope: 'EVT0 wafer start',
        agenda: 3,
        links: [{ type: 'risk', ref: 'risk-samples' }],
      },
    ],
    actions: [
      {
        description: 'Re-time test-mode STA and the TAP constraints to 100 MHz',
        owner: 'Sungmin Choi',
        due: '2023-12-15',
        priority: 'critical',
        status: 'done',
        type: 'support',
        agenda: 2,
        evidence: 'Test-mode STA re-run at 100 MHz on 12/14; TAP paths clean.',
        verifiedBy: '@me',
        completed: '2023-12-14',
        links: [{ type: 'step', ref: 'SO-03:6' }],
      },
      {
        description: 'Update the sort and final test programs for the 100 MHz TAP clock',
        owner: 'Taeho Jung',
        due: '2023-12-15',
        priority: 'high',
        status: 'done',
        type: 'support',
        agenda: 2,
        evidence: 'Sort limits and guard bands updated 12/12 (test time +6%); final test pattern timing remapped 01/09.',
        verifiedBy: '@me',
        completed: '2024-01-09',
        links: [{ type: 'step', ref: 'TEST-06:7' }],
      },
      {
        description: 'Set up the 1.5σ variation and no-OCV signoff scenarios and correlate them with the foundry',
        owner: 'Dohyun Lee',
        contributors: ['Jaehyuk Yoon'],
        due: '2023-12-12',
        priority: 'critical',
        status: 'done',
        type: 'support',
        agenda: 2,
        evidence: 'Derate and variation decks updated 12/11; foundry confirmed the correlation on 12/12.',
        verifiedBy: '@me',
        completed: '2023-12-12',
        links: [{ type: 'activity', ref: 'SO-03' }],
      },
      {
        description: 'Define the relaxed HVQK limits and the waiver process for residual violations',
        owner: 'Dohyun Lee',
        due: '2023-12-15',
        priority: 'high',
        status: 'done',
        type: 'support',
        agenda: 2,
        evidence: 'HVQK limits signed by the customer 12/15; waiver template agreed with the foundry.',
        verifiedBy: '@me',
        completed: '2023-12-15',
        links: [{ type: 'activity', ref: 'SO-11' }],
      },
      {
        description: 'Confirm the 50-wafer slot and quote, and get the PO amended',
        owner: 'Jaehyuk Yoon',
        contributors: ['Daniel Kwon'],
        due: '2023-12-13',
        priority: 'high',
        status: 'done',
        type: 'support',
        agenda: 3,
        evidence: 'Slot confirmed and quote accepted; PO amendment signed 12/13.',
        verifiedBy: '@me',
        completed: '2023-12-13',
        links: [{ type: 'risk', ref: 'risk-samples' }],
      },
      {
        description: 'Record the EVT0 / EVT1 split and the relaxed criteria as an SoW change note',
        owner: '@me',
        due: '2023-12-08',
        priority: 'normal',
        status: 'done',
        type: 'standalone',
        evidence: 'SoW change note countersigned by the customer on 12/08.',
        completed: '2023-12-08',
      },
      {
        description: 'Review fab cycle-time options with the foundry before re-baselining',
        owner: '@me',
        contributors: ['Jaehyuk Yoon'],
        due: '2023-12-14',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        evidence: 'Foundry fab-cycle review held 12/14.',
        completed: '2023-12-14',
      },
    ],
  },
  {
    key: 'fab-review',
    title: 'Foundry Fab-Cycle Review',
    type: 'supplier_review',
    purpose: 'Find out whether fab cycle time can absorb part of the two-month tapeout slip.',
    attendees: ['Jaehyuk Yoon', 'Minseo Han'],
    location: 'Teams',
    stage: 'fabrication',
    links: [
      { type: 'stage', ref: 'fabrication' },
      { type: 'milestone', ref: 'firstSilicon' },
    ],
    date: '2023-12-14',
    time: '16:00',
    durationMinutes: 45,
    status: 'completed',
    minutes: 'No fab recovery: DPML already at the contracted minimum. First Silicon moves with tapeout. Assembly is the only place left to recover time; the TPM takes the pull-in request to the customer.',
    agenda: [
      { title: 'Cycle-time options', presenter: 'Jaehyuk Yoon', minutes: 25, notes: 'DPML was negotiated to the minimum at contract; no further hot-lot priority is available.', outcome: 'decision' },
      { title: 'Where else to recover', presenter: '@me', minutes: 20, notes: 'Assembly: a priority lot on wafer arrival so bring-up starts on its first units.', outcome: 'action' },
    ],
    decisions: [
      {
        title: 'Accept First Silicon moving with tapeout',
        description: 'DPML is already at the contracted minimum, so fab cycle time cannot be cut: First Silicon moves from 05/13 to 07/08/2024. Recovery is sought in assembly instead.',
        rationale: 'The fab has no remaining lever; pushing further only adds cost without time.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Kyungsoo Nam',
        scope: 'Fab schedule',
        agenda: 0,
        links: [
          { type: 'risk', ref: 'risk-fab-cycle' },
          { type: 'milestone', ref: 'firstSilicon' },
        ],
      },
    ],
    actions: [
      {
        description: 'Ask the customer to pull in assembly — a priority lot whose first units start bring-up early',
        owner: '@me',
        due: '2023-12-15',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        agenda: 1,
        evidence: 'Request sent to Daniel Kwon and Brian Lim on 12/15 with the fab dates.',
        completed: '2023-12-15',
      },
      {
        description: 'Assess assembly pull-in feasibility with the OSAT',
        owner: 'Brian Lim',
        due: '2024-01-05',
        priority: 'high',
        status: 'done',
        type: 'support',
        agenda: 1,
        evidence: 'OSAT confirmed a priority die-attach slot on wafer arrival and a hot lot for bring-up units; bring-up can start three weeks earlier.',
        verifiedBy: '@me',
        completed: '2024-01-05',
        links: [{ type: 'step', ref: 'ASSY-01:1' }],
      },
    ],
  },
  {
    key: 'customer-0111',
    series: 'customer-weekly',
    date: '2024-01-11',
    time: '15:00',
    status: 'completed',
    minutes: 'Assembly pull-in accepted; production slip held to five weeks. TPM re-baselines the schedule by 01/12.',
    agenda: [
      { title: 'Assembly pull-in', presenter: 'Brian Lim', minutes: 20, notes: 'Priority lot die-attached on wafer arrival; its first units go straight to bring-up.', outcome: 'decision', links: [{ type: 'stage', ref: 'packaging' }] },
      { title: 'Relaxed-criteria signoff status', presenter: 'Dohyun Lee', minutes: 20, notes: 'Timing converging on the EVT0 criteria; waiver list in review.', outcome: 'info', links: [{ type: 'activity', ref: 'SO-03' }] },
    ],
    decisions: [
      {
        title: 'Pull assembly in with a priority lot to recover three weeks',
        description: 'The customer runs a priority lot at the OSAT on wafer arrival and sends its first units to bring-up four weeks before the full assembly completes. First Assembled Units move +8 weeks with the wafers; bring-up, customer samples and production move +5.',
        rationale: 'Assembly is the only schedule lever left after the fab review.',
        status: 'approved',
        owner: 'Brian Lim',
        approvedBy: 'Daniel Kwon',
        scope: 'Assembly schedule',
        agenda: 0,
        links: [
          { type: 'risk', ref: 'risk-fab-cycle' },
          { type: 'milestone', ref: 'firstAssembledUnits' },
        ],
      },
    ],
    actions: [
      {
        description: 'Re-baseline the program schedule and publish it to both teams',
        owner: '@me',
        due: '2024-01-12',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        evidence: 'Re-baseline note posted 01/12 with plan against re-baselined dates per milestone.',
        completed: '2024-01-12',
      },
    ],
  },
  {
    key: 'readiness-0123',
    series: 'readiness',
    date: '2024-01-23',
    time: '10:00',
    status: 'completed',
    minutes: 'Timing signoff on EVT0 criteria closes this week; 212 HVQK residual violations on the waiver list. Design Freeze holds for 01/29.',
    agenda: [
      { title: 'Signoff by domain', presenter: 'Dohyun Lee', minutes: 20, notes: 'STA closing on EVT0 criteria; PV, EM/IR clean.', outcome: 'info', links: [{ type: 'step', ref: 'SO-03:7' }] },
      { title: 'Waiver list', presenter: 'Dohyun Lee', minutes: 20, notes: '212 residual HVQK violations; foundry review done, customer acceptance pending.', outcome: 'action', links: [{ type: 'step', ref: 'SO-11:4' }] },
    ],
    actions: [
      {
        description: 'Get customer acceptance of the EVT0 waiver list',
        owner: 'Daniel Kwon',
        due: '2024-01-26',
        priority: 'critical',
        status: 'done',
        type: 'support',
        agenda: 1,
        evidence: 'Waiver list accepted by the customer on 01/25.',
        verifiedBy: '@me',
        completed: '2024-01-25',
        links: [{ type: 'deliverable', ref: 'signoff:3' }],
      },
    ],
  },
  {
    key: 'gonogo',
    title: 'EVT0 Go / No-Go',
    type: 'readiness_review',
    purpose: 'Go / No-Go for the EVT0 mask release on the agreed criteria.',
    attendees: ['Kyungsoo Nam', 'Dohyun Lee', 'Minseo Han', 'Jaehyuk Yoon', ...CUSTOMER],
    location: 'Conference room A / Teams',
    stage: 'tapeout',
    links: [
      { type: 'step', ref: 'TO-05:2' },
      { type: 'milestone', ref: 'tapeoutBeolMto' },
    ],
    date: '2024-02-08',
    time: '10:00',
    durationMinutes: 60,
    status: 'completed',
    minutes: 'Go for FEOL MTO on 02/22 and BEOL MTO toward 03/25, with the EVT0 conditions restated.',
    agenda: [
      { title: 'Checklist and owner signoffs', presenter: 'Minseo Han', minutes: 20, notes: 'All items signed; residual risks accepted with owners.', outcome: 'info', links: [{ type: 'deliverable', ref: 'tapeout:1' }] },
      { title: 'Decision', presenter: '@me', minutes: 20, notes: 'Go, with conditions.', outcome: 'decision' },
    ],
    decisions: [
      {
        title: 'Go for the EVT0 mask release',
        description: 'Release FEOL on 02/22 and BEOL toward 03/25/2024. Conditions: EVT0 samples for functional validation only; EVT1 root-cause plan kicks off by 04/15/2024.',
        rationale: 'Signoff closed on the agreed criteria, waivers accepted, checklist complete.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Kyungsoo Nam',
        scope: 'EVT0 tapeout',
        agenda: 1,
        links: [{ type: 'deliverable', ref: 'tapeout:3' }],
      },
    ],
    actions: [
      {
        description: 'Submit FEOL mask data and confirm foundry acceptance',
        owner: 'Minseo Han',
        due: '2024-02-22',
        priority: 'critical',
        status: 'done',
        type: 'support',
        evidence: 'FEOL MTO accepted by the foundry on 02/22.',
        verifiedBy: '@me',
        completed: '2024-02-22',
        links: [{ type: 'step', ref: 'TO-06:3' }],
      },
    ],
  },
  {
    key: 'readiness-0319',
    series: 'readiness',
    date: '2024-03-19',
    time: '10:00',
    status: 'completed',
    minutes: 'BEOL re-verification clean; BEOL MTO submission this week. Wafer start plan for 75 wafers confirmed.',
    agenda: [
      { title: 'BEOL re-verification', presenter: 'Minseo Han', minutes: 20, notes: 'DRC, LVS, antenna and density clean on the final database.', outcome: 'info', links: [{ type: 'activity', ref: 'TO-09' }] },
      { title: 'Mask dates and wafer start', presenter: 'Jaehyuk Yoon', minutes: 15, notes: '75 wafers on FEOL mask availability.', outcome: 'info', links: [{ type: 'stage', ref: 'fabrication' }] },
    ],
    actions: [
      {
        description: 'Submit BEOL mask data and confirm foundry acceptance',
        owner: 'Minseo Han',
        due: '2024-03-22',
        priority: 'critical',
        status: 'done',
        type: 'support',
        evidence: 'BEOL MTO accepted on 03/22; full mask set complete 03/25.',
        verifiedBy: '@me',
        completed: '2024-03-22',
        links: [{ type: 'step', ref: 'TO-10:3' }],
      },
      {
        description: 'Schedule the EVT0 retrospective and the EVT1 root-cause kickoff',
        owner: '@me',
        due: '2024-03-22',
        priority: 'normal',
        status: 'done',
        type: 'standalone',
        evidence: 'Retrospective set for 03/28; EVT1 kickoff set for 04/15.',
        completed: '2024-03-20',
      },
    ],
  },
  {
    key: 'retro',
    title: 'EVT0 Retrospective',
    type: 'program_review',
    purpose: 'What happened between the FFN and tapeout, why, and what changes for EVT1 and the next program.',
    attendees: [...PD_TEAM, 'Dohyun Lee', 'Taeho Jung', 'Minseo Han', 'Jaehyuk Yoon', 'Kyungsoo Nam'],
    location: 'Conference room A',
    stage: 'tapeout',
    links: [
      { type: 'risk', ref: 'risk-gate-count' },
      { type: 'risk', ref: 'risk-signoff' },
    ],
    date: '2024-03-28',
    time: '14:00',
    durationMinutes: 90,
    status: 'completed',
    minutes: 'Root cause: netlist growth after N2 with no gate against the floorplan budget, and a die frozen with the package before the netlist was final. Prevention adopted for EVT1 and future netlist-turnkey programs.',
    agenda: [
      { title: 'Timeline from FFN to tapeout', presenter: '@me', minutes: 25, notes: 'FFN 09/29 → risk 10/04 → die size declined 10/12 → task force → closure assessment 11/28 → escalation 12/05 → tapeout 03/25.', outcome: 'info' },
      { title: 'Root cause', presenter: 'Jihoon Park', minutes: 30, notes: 'Late feature content, no gate-count gate at drops, ~5% whitespace.', outcome: 'info' },
      { title: 'Prevention', presenter: '@me', minutes: 30, notes: 'Netlist drop gate, early congestion warning, SoW re-negotiation clause.', outcome: 'decision' },
    ],
    decisions: [
      {
        title: 'Adopt a gate-count and utilization gate at every netlist drop',
        description: 'From N1, each drop is checked with the customer against per-block gate-count and utilization budgets; a breach triggers a floorplan review within a week, and the SoW gets a clause to re-open die size or signoff criteria. Applies to EVT1 and future netlist-turnkey programs.',
        rationale: 'The EVT0 issue was visible only at FFN, when no option was cheap.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Kyungsoo Nam',
        scope: 'Netlist-turnkey process',
        agenda: 2,
      },
    ],
    actions: [
      {
        description: 'Write the netlist drop gate into the EVT1 plan and the SoW template',
        owner: '@me',
        due: '2024-04-15',
        priority: 'normal',
        status: 'done',
        type: 'standalone',
        agenda: 2,
        evidence: 'Gate criteria added to the EVT1 plan and to the netlist-turnkey SoW template on 04/12.',
        completed: '2024-04-12',
      },
      {
        description: 'Prepare the EVT1 re-partition proposal for the NPU / ISP area with the customer',
        owner: 'Jihoon Park',
        contributors: ['Eunji Seo'],
        due: '2024-04-15',
        priority: 'high',
        status: 'done',
        type: 'support',
        agenda: 1,
        evidence: 'Re-partition proposal presented at the EVT1 kickoff on 04/15.',
        verifiedBy: '@me',
        completed: '2024-04-15',
      },
    ],
  },
];

export const ATLAS_SOC_SCENARIO: Scenario = {
  program: {
    id: SOC_ID,
    name: SOC_NAME,
    kickoff: SOC_KICKOFF,
    costPerManMonth: 15000,
    /* after qualification closed, so every planned step is simply done */
    today: '2025-03-31',
    now: '2025-03-31 09:00',
    timeZone: 'Asia/Seoul',
    emailDomain: 'atlassoc.example',
    phoneStart: 210,
  },
  template: {
    id: NETLIST_TEMPLATE_ID,
    name: NETLIST_TEMPLATE_NAME,
    stages: SOC_PLAN,
    windows: PD_PLAN,
  },
  actual: {
    overrides: SOC_ACTUAL,
    windows: ACTUAL_WINDOWS,
  },
  doneStages: SOC_PLAN.map((s) => s.key),
  leaders: SOC_LEADERS,
  contacts: SOC_CONTACTS,
  steps: SOC_STEPS,
  deliverables: SOC_DELIVERABLES,
  posts: SOC_POSTS,
  series: SOC_SERIES,
  meetings: SOC_MEETINGS,
};
