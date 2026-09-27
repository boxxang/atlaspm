/**
 * /data/e2Demo.ts — Embedded_SoC: a second-generation ultra-low-power
 * dataflow processor ("E2"), read in the middle of physical design.
 *
 * An interview example, and hypothetical: the programme is modelled on the
 * class of part Efficient Computer's Electron E1 represents, and assumes a
 * successor — twice the fabric, 4 MB of eMRAM, a new always-on sensor hub — on
 * the same mature 22 nm ULL node with embedded MRAM. No figure in it describes
 * a real product.
 *
 * Where it stands on 09/27/2026: the FFN went out on 09/11, two and a half
 * weeks late. A long-duration FPGA soak test found a deadlock in the fabric
 * network-on-chip arbiter on 08/19; the core team chose to hold the FFN for
 * the RTL fix rather than carry it as a post-FFN ECO, and bought the time
 * back by running the signoff dry run and deck correlation on the Turn 2
 * database, so the final database needs one signoff iteration fewer. Design Freeze (11/23) and the MTO (01/18/2027) hold.
 * The final turn on the FFN is in its second week: placement is done, final
 * clock trees and power are under way, and three risks are open — fabric
 * setup timing at the cold slow corner, dynamic IR drop at the eMRAM banks,
 * and an ATPG pattern set larger than the tester memory.
 *
 * The programme was started from the built-in Embedded SoC template and keeps
 * its plan; what moved is in `actual`. Everything planned before today in a
 * stage that is running is simply done, and the record is what the TPM wrote.
 */
import { ALL_ACTIVITIES } from './builtins';
import { EMBEDDED_PROFILE } from './embeddedSoc';
import type { Scenario, StageSpan, Windows } from './scenario';
import type {
  ScenarioDeliverable,
  ScenarioMeeting,
  ScenarioPerson,
  ScenarioPost,
  ScenarioSeries,
  ScenarioStep,
} from './scenarioTypes';

export const E2_ID = 'embedded-soc-cd0t9';
export const E2_NAME = 'Embedded_SoC';
/** Programme kickoff: product definition starts. */
export const E2_KICKOFF = '2025-08-18';
export const E2_TODAY = '2026-09-27';

/* ---------- schedule ---------- */

/** The plan: the built-in Embedded SoC template as it ships. */
export const E2_PLAN: readonly ({ key: string } & StageSpan)[] = EMBEDDED_PROFILE.stages.map((s) => ({
  key: s.key,
  startOffsetWeeks: s.startOffsetWeeks,
  durationWeeks: s.durationWeeks,
}));

/** Where the stages actually ran, where that was not the plan. */
export const E2_ACTUAL: Readonly<Record<string, StageSpan>> = {
  /* the FFN held two and a half weeks for the NoC arbiter fix */
  synthesisEmb: { startOffsetWeeks: 36, durationWeeks: 20 },
  /* the final turn starts a week late and runs its full length; signoff keeps its
     dates by proving its flow on the Turn 2 database */
  physicalDesignEmb: { startOffsetWeeks: 40, durationWeeks: 25 },
};

type Segments = readonly (readonly [number, number, number, number])[];

/** Template weeks onto programme weeks, piecewise: [a, b] of a stage onto [c, d] of the same stage. */
const piecewise = (segments: Segments) => (t: number) => {
  const [a, b, c, d] = segments.find(([from, to]) => t >= from && t <= to) ?? segments[segments.length - 1];
  return Math.round((c + ((t - a) * (d - c)) / (b - a)) * 100) / 100;
};

const retime = (stage: string, segments: Segments): Windows => {
  const map = piecewise(segments);
  return Object.fromEntries(
    Object.entries(ALL_ACTIVITIES)
      .filter(([, a]) => a.st === stage)
      .map(([ref, a]) => [ref, [map(a.w[0]), map(a.w[1])] as const]),
  );
};

/* N2 was on time; the FFN, planned at synthesis week 17.25, went out at 19.7
   (09/11). The final turn, planned from PD week 15.25, started at 16 (09/14). */
const ACTUAL_WINDOWS: Windows = {
  ...retime('synthesisEmb', [
    [0, 14.25, 0, 14.25],
    [14.25, 17.25, 14.25, 19.7],
    [17.25, 18, 19.7, 20],
  ]),
  ...retime('physicalDesignEmb', [
    [0, 15.25, 0, 16],
    [15.25, 24, 16, 25],
  ]),
};

/* ---------- people ---------- */

export const E2_LEADERS: Readonly<Record<string, ScenarioPerson>> = {
  productDefinitionEmb: { name: 'Rachel Kim', role: 'Product manager, E2' },
  technologyEmb: { name: 'Arjun Mehta', role: 'Foundry and technology lead' },
  ipReadinessEmb: { name: 'Lena Fischer', role: 'IP program lead' },
  fabricCodesign: { name: 'Daniel Ortiz', role: 'Fabric architect' },
  architectureEmb: { name: 'Priya Natarajan', role: 'Chief SoC architect' },
  pdkEmb: { name: 'Arjun Mehta', role: 'Foundry and technology lead' },
  compiler: { name: 'Marcus Chen', role: 'Compiler lead' },
  emram: { name: 'Hana Yoshida', role: 'eMRAM integration lead' },
  pmu: { name: 'Owen Gallagher', role: 'PMU and analog lead' },
  virtualPlatform: { name: 'Sofia Russo', role: 'Developer platform lead' },
  dftEmb: { name: 'Kevin Tran', role: 'DFT lead' },
  rtlEmb: { name: 'Ethan Brooks', role: 'RTL design lead' },
  verificationEmb: { name: 'Meera Iyer', role: 'Design verification lead' },
  fpgaVerification: { name: 'Jonas Weber', role: 'FPGA prototyping lead' },
  sdk: { name: 'Grace Liu', role: 'SDK and firmware lead' },
  packageEmb: { name: 'Tom Becker', role: 'Package and assembly lead' },
  synthesisEmb: { name: 'Nikhil Rao', role: 'Synthesis lead' },
  physicalDesignEmb: { name: 'Alex Morgan', role: 'Physical design lead' },
  earlyAccess: { name: 'Chris Donovan', role: 'Field applications and early access lead' },
  validationHardwareEmb: { name: 'Luis Herrera', role: 'Validation hardware lead' },
  testDevelopmentEmb: { name: 'Wei Zhang', role: 'Test engineering lead' },
  signoffEmb: { name: 'Olivia Park', role: 'Signoff lead' },
  evkDesign: { name: 'Luis Herrera', role: 'Validation hardware lead' },
  tapeoutEmb: { name: 'Olivia Park', role: 'Signoff lead' },
  fabricationEmb: { name: 'Arjun Mehta', role: 'Foundry and technology lead' },
  assemblyEmb: { name: 'Tom Becker', role: 'Package and assembly lead' },
  softwareRelease: { name: 'Marcus Chen', role: 'Compiler lead' },
  bringupEmb: { name: 'Samira Haddad', role: 'Silicon validation lead' },
  qualificationEmb: { name: 'Brian Walsh', role: 'Quality and reliability lead' },
  evkLaunch: { name: 'Sofia Russo', role: 'Developer platform lead' },
};

export const E2_CONTACTS: Readonly<Record<string, readonly ScenarioPerson[]>> = {
  physicalDesignEmb: [
    { name: 'Yuki Tanaka', role: 'Timing closure — fabric and NoC' },
    { name: 'Ben Carter', role: 'Floorplan, PDN and IR' },
    { name: 'Aisha Rahman', role: 'Routing and physical verification' },
    { name: 'Diego Santos', role: 'Hierarchical closure and top-level integration' },
  ],
  synthesisEmb: [{ name: 'Hannah Scott', role: 'Constraints (SDC) and equivalence' }],
  signoffEmb: [
    { name: 'Aisha Rahman', role: 'DRC / LVS signoff' },
    { name: 'Yuki Tanaka', role: 'STA signoff' },
  ],
  rtlEmb: [
    { name: 'Ravi Kumar', role: 'Fabric NoC and interconnect RTL' },
    { name: 'Julia Martins', role: 'Configuration manager — CI and releases' },
    { name: 'Sam Okafor', role: 'Lint, CDC and RDC owner' },
  ],
  verificationEmb: [
    { name: 'Nora Lindqvist', role: 'Regression owner' },
    { name: 'Pablo Reyes', role: 'Coverage lead' },
    { name: 'Irene Wu', role: 'Formal verification lead' },
  ],
  fpgaVerification: [{ name: 'Emily Novak', role: 'Workload and soak testing' }],
  dftEmb: [{ name: 'Tariq Aziz', role: 'ATPG and pattern delivery' }],
  emram: [{ name: 'Kenji Mori', role: 'Foundry eMRAM applications engineer' }],
  tapeoutEmb: [{ name: 'Mark Ellison', role: 'VP Engineering — executive sponsor' }],
};

/* ---------- the record ---------- */

/** Step records the story needs, beyond "done on the day the plan said". */
export const E2_STEPS: readonly ScenarioStep[] = [
  /* the soak test that found the deadlock, and the fix going back through FPGA */
  { ref: 'FPV-04', n: 4, owner: 'Emily Novak', doneAt: '2026-09-10' },
  { ref: 'FPV-04', n: 6, owner: 'Jonas Weber', doneAt: '2026-09-10' },
  { ref: 'FPV-05', n: 3, owner: 'Jonas Weber', doneAt: '2026-09-04' },
  /* the FFN, held for the fix */
  { ref: 'ESYN-12', n: 1, owner: 'Nikhil Rao', doneAt: '2026-09-02' },
  { ref: 'ESYN-12', n: 2, owner: 'Nikhil Rao', doneAt: '2026-09-07' },
  { ref: 'ESYN-12', n: 3, owner: 'Hannah Scott', doneAt: '2026-09-04' },
  { ref: 'ESYN-12', n: 4, owner: 'Hannah Scott', doneAt: '2026-09-10' },
  { ref: 'ESYN-12', n: 5, owner: 'Nikhil Rao', doneAt: '2026-09-10' },
  { ref: 'ESYN-12', n: 6, owner: 'Nikhil Rao', doneAt: '2026-09-11' },
  /* Turn 2 closed out; its closure risk statement fed the final turn */
  { ref: 'EPD-09', n: 7, owner: 'Ben Carter', doneAt: '2026-09-18' },
  { ref: 'EPD-09', n: 8, owner: 'Alex Morgan', doneAt: '2026-09-23' },
  /* the final turn on the FFN */
  { ref: 'EPD-13', n: 1, owner: 'Alex Morgan', doneAt: '2026-09-15' },
  { ref: 'EPD-13', n: 2, owner: 'Diego Santos', doneAt: '2026-09-25' },
  { ref: 'EPD-13', n: 3, owner: 'Alex Morgan', doneAt: '2026-09-16' },
  { ref: 'EPD-13', n: 4, owner: 'Yuki Tanaka', pct: 40 },
  { ref: 'EPD-13', n: 5, owner: 'Ben Carter', pct: 30 },
  { ref: 'EPD-13', n: 6, owner: 'Aisha Rahman' },
  { ref: 'EPD-13', n: 7, owner: 'Aisha Rahman' },
  { ref: 'EPD-13', n: 8, owner: 'Yuki Tanaka' },
  { ref: 'EPD-13', n: 9, owner: 'Alex Morgan' },
  { ref: 'EPD-13', n: 10, owner: 'Alex Morgan', due: '2026-11-13' },
  { ref: 'EPD-05', n: 8, owner: 'Yuki Tanaka', pct: 60 },
  { ref: 'EPD-07', n: 6, owner: 'Aisha Rahman', pct: 35 },
  { ref: 'EPD-10', n: 4, owner: 'Diego Santos', pct: 70 },
  { ref: 'EPD-10', n: 5, owner: 'Diego Santos', pct: 80, due: '2026-10-02' },
  { ref: 'EPD-11', n: 6, owner: 'Tariq Aziz', pct: 50 },
  { ref: 'EPD-12', n: 4, owner: 'Ben Carter', pct: 45 },
  { ref: 'EPD-12', n: 5, owner: 'Ben Carter', pct: 55 },
  /* the signoff dry run, moved onto the Turn 2 database */
  { ref: 'ESO-01', n: 1, owner: 'Olivia Park', doneAt: '2026-09-15' },
  { ref: 'ESO-01', n: 2, owner: 'Olivia Park', pct: 75, due: '2026-09-30' },
  { ref: 'ESO-01', n: 3, owner: 'Aisha Rahman', doneAt: '2026-09-22' },
  { ref: 'ESO-01', n: 4, owner: 'Olivia Park', doneAt: '2026-09-21' },
  { ref: 'ESO-02', n: 1, owner: 'Yuki Tanaka', doneAt: '2026-09-23' },
  { ref: 'ESO-02', n: 2, owner: 'Yuki Tanaka', pct: 30, due: '2026-10-02' },
  /* ATPG: coverage met, the pattern set does not fit the tester */
  { ref: 'EDFT-10', n: 6, owner: 'Tariq Aziz', pct: 70 },
  { ref: 'EDFT-10', n: 7, owner: 'Kevin Tran', doneAt: '2026-09-18' },
  { ref: 'EDFT-10', n: 8, owner: 'Tariq Aziz', due: '2026-10-16' },
];

/**
 * Deliverables past their date in a running stage are done on it; these are
 * the ones that were not. The FFN and its package went out with the FFN.
 */
export const E2_DELIVERABLES: readonly ScenarioDeliverable[] = [
  { stageId: 'synthesisEmb', position: 3, doneAt: '2026-08-07' },
  { stageId: 'synthesisEmb', position: 4, doneAt: '2026-09-11' },
  { stageId: 'synthesisEmb', position: 5, doneAt: '2026-09-11' },
  { stageId: 'synthesisEmb', position: 6, doneAt: '2026-09-11' },
  { stageId: 'synthesisEmb', position: 7, doneAt: '2026-09-11' },
  /* debug and trace documentation waits on the final pinout from the FFN */
  { stageId: 'validationHardwareEmb', position: 1, due: '2026-10-02' },
];

const PD_TEAM = ['Alex Morgan', 'Yuki Tanaka', 'Ben Carter', 'Aisha Rahman', 'Diego Santos'];
const CORE_TEAM = [
  'Mark Ellison',
  'Rachel Kim',
  'Priya Natarajan',
  'Ethan Brooks',
  'Meera Iyer',
  'Nikhil Rao',
  'Alex Morgan',
  'Olivia Park',
  'Kevin Tran',
  'Hana Yoshida',
  'Marcus Chen',
  'Grace Liu',
  'Luis Herrera',
  'Wei Zhang',
  'Arjun Mehta',
];

export const E2_POSTS: readonly ScenarioPost[] = [
  /* ---- the programme, as it was set up ---- */
  {
    key: 'note-e2-summary',
    kind: 'note',
    at: '2025-08-20 10:00',
    stageId: 'productDefinitionEmb',
    text: 'E2 — product summary and top-level targets',
    blocks: [
      {
        p: 'Second-generation general-purpose dataflow processor for battery-powered edge devices. Same programming model as the first generation — C, C++ and LiteRT / ONNX models compiled onto a spatial fabric — with twice the fabric, more non-volatile memory and an always-on sensor hub, so a design can keep its model resident and wake on an event.',
      },
      {
        table: {
          head: ['Parameter', 'Gen 1 (reference)', 'E2 target', 'Why'],
          rows: [
            ['Process', '22 nm ULL + eMRAM', '22 nm ULL + eMRAM (same node)', 'Reuse the qualified eMRAM macro and PDK; no node risk'],
            ['Compute fabric', '12 × 12 tiles', '24 × 24 tiles (576 PEs)', '2× throughput per wake for vision and audio models'],
            ['Non-volatile memory', '2 MB eMRAM', '4 MB eMRAM (4 × 1 MB banks)', 'Keep a 3 MB model resident through deep sleep'],
            ['SRAM', '1 MB', '2 MB (32 macros)', 'Activation buffers for the larger fabric'],
            ['Always-on domain', 'RTC, wake timer', '+ sensor hub, I²S / PDM front end', 'Wake on a keyword or a motion event'],
            ['Fabric clock', '100 MHz @ 0.8 V', '120 MHz @ 0.8 V, 40 MHz @ 0.6 V', 'Two operating points, one netlist'],
            ['Energy target', '—', '≤ 1.0 pJ / op on the reference workloads', 'The number the design-ins are sold on'],
            ['Deep-sleep current', '2.0 µA', '≤ 1.5 µA at 25 °C, retention on', 'Coin-cell lifetime target of 5 years'],
            ['Die', '3.6 × 3.6 mm', '4.6 × 4.6 mm', 'Fits the same 7 × 7 mm QFN family'],
            ['Package', 'QFN-56', 'QFN-68 and FC-CSP-81', 'Pin-compatible QFN for gen-1 customers'],
          ],
        },
      },
      { h: 'Programme milestones as committed at Go / No-Go' },
      {
        bullets: [
          'Arch Freeze 02/02/2026 · RTL Freeze 06/22/2026 · FFN 08/31/2026',
          'Design Freeze 11/23/2026 · Tapeout (MTO) 01/18/2027',
          'First silicon 05/03/2027 · Customer samples 09/27/2027 · Compiler and SDK 1.0 GA 11/08/2027',
        ],
      },
    ],
  },

  /* ---- the deadlock, and the decision to hold the FFN ---- */
  {
    key: 'soak-hang',
    kind: 'update',
    at: '2026-08-19 18:40',
    step: 'FPV-04:4',
    text:
      `Soak run 14 hung after 31 h on workload W7 (keyword spotting + concurrent eMRAM logging).

- Symptom: fabric stalled with all 4 NoC arbiter queues full; no recovery without reset
- Reproduced twice on FPGA image fpga-rtl-2026.08.14
- DV has not seen it — 31 h is far beyond any simulation run

Next: Ravi Kumar is looking at the arbiter credit return path.`,
  },
  {
    key: 'risk-ffn-late',
    kind: 'risk',
    closed: '2026-09-11',
    at: '2026-08-20 11:15',
    step: 'FPV-04:4',
    text:
      `FFN (planned 08/26) at risk — the FPGA soak test found a deadlock in the fabric NoC arbiter.

- Trigger: credit return starves when two eMRAM write bursts overlap a fabric-to-SRAM burst
- Root cause and fix size: unknown yet
- Option A: hold the FFN for an RTL fix
- Option B: release the FFN on time and carry the fix as a post-FFN functional ECO

Owner: Ethan Brooks. Decision needed by 08/27.`,
  },
  {
    key: 'soak-rootcause',
    kind: 'update',
    at: '2026-08-24 17:20',
    step: 'FPV-05:3',
    text:
      `Root cause confirmed by Ravi Kumar and Irene Wu.

- The arbiter returns a credit one cycle late when a write-back and a read retry hit the same port in the same cycle
- Under sustained load the lost credits accumulate until all queues block
- Formal now reproduces it in 38 cycles — the original proof had over-constrained the retry input

Fix: ~120 lines in noc_arb plus a new assertion set, about 2,400 gates.`,
  },
  {
    key: 'risk-ffn-late-hold',
    kind: 'reply',
    at: '2026-08-27 16:30',
    parent: 'risk-ffn-late',
    text:
      `Decided at the FFN slip review: hold the FFN for the RTL fix.

- Why: a post-FFN functional ECO touching the arbiter in all 576 tiles would reopen the final turn and signoff; holding costs 2.5 weeks up front
- FFN re-planned to 09/11
- Recovery: signoff runs its dry run and deck correlation on the Turn 2 database, so the FFN database needs one signoff iteration fewer
- PD handoff 11/08 → 11/13; Design Freeze and MTO unchanged`,
  },
  {
    key: 'fix-verified',
    kind: 'update',
    at: '2026-09-04 19:05',
    step: 'FPV-05:3',
    text:
      `Arbiter fix (rtl-2026.09.01) verified.

- Full regression: 0 new failures
- Formal: arbiter proofs re-run with the relaxed retry assumption — all proven
- FPGA: image fpga-rtl-2026.09.02 built; 72 h soak restarted on W7 and W3`,
  },
  {
    key: 'soak-clean',
    kind: 'update',
    at: '2026-09-10 09:30',
    step: 'FPV-04:4',
    text: `Soak clean with the fix.

- W7: 72 h, no stall, no ECC event
- W3: 72 h, no stall, no ECC event

Closing the soak item for the FFN. The long-run soak continues on the FFN image for FPGA signoff.`,
  },
  {
    key: 'ffn-released',
    kind: 'update',
    at: '2026-09-11 20:10',
    step: 'ESYN-12:6',
    text:
      `FFN released: tag e2-ffn-2026.09.11 (RTL rtl-2026.09.01).

- Equivalence RTL → FFN: clean on all 3 modes
- UPF consistency: clean
- SDC: frozen at sdc-v3.4
- Size: 3.91 M instances, +1.8% against N2

Functional freeze declared — from now on changes come in only as ECOs through the ECO board.`,
  },
  {
    key: 'risk-ffn-late-closed',
    kind: 'reply',
    at: '2026-09-11 20:20',
    parent: 'risk-ffn-late',
    text: `Closed: FFN released 09/11 with the arbiter fix and a 72 h clean soak.

- Cost: 2.5 weeks on the FFN, 1 week on the start of the final turn
- Held: Design Freeze 11/23 and MTO 01/18, through the signoff recovery plan`,
  },

  /* ---- the final turn ---- */
  {
    key: 'ffn-intake',
    kind: 'update',
    at: '2026-09-15 17:45',
    step: 'EPD-13:1',
    text:
      `FFN intake done — delta against N2:

- Chip: +1.8% instances
- noc_arb: +6.1% (the fix, with its assertions stripped in synthesis)
- emram_ctrl: +4.2% (ECC scrub counter from the ECO board)
- aon_hub: +3.0%
- No block above 72% placement utilization; floorplan and PDN unchanged

ECO-only change discipline in force from today.`,
  },
  {
    key: 'note-ffn-delta',
    kind: 'note',
    at: '2026-09-15 18:00',
    stageId: 'physicalDesignEmb',
    text: 'FFN delta against N2 — by block',
    blocks: [
      { p: 'FFN e2-ffn-2026.09.11 against N2 e2-n2-2026.08.07. Die 4.6 × 4.6 mm, floorplan and PDN frozen at Turn 2.' },
      {
        table: {
          head: ['Block', 'Function', 'N2 instances', 'FFN instances', 'Δ', 'Placement utilization'],
          rows: [
            ['fabric_tile (×576)', 'Processing element tile', '2.61 M', '2.63 M', '+0.8%', '69% → 69%'],
            ['noc_arb', 'Fabric network-on-chip arbiter', '182 k', '193 k', '+6.1%', '64% → 68%'],
            ['emram_ctrl', 'eMRAM controller, ECC and trim', '96 k', '100 k', '+4.2%', '61% → 63%'],
            ['aon_hub', 'Always-on sensor hub', '74 k', '76 k', '+3.0%', '58% → 60%'],
            ['scalar_ctl', 'Scalar control core', '121 k', '121 k', '0.0%', '66% → 66%'],
            ['periph_top', 'Peripherals, I²S / PDM, SPI, I²C', '205 k', '206 k', '+0.5%', '60% → 60%'],
            ['Top level', 'Glue, clocking, reset, PMU interface', '553 k', '582 k', '+5.2%', '—'],
            ['Chip', '', '3.84 M', '3.91 M', '+1.8%', '68.0% → 69.2%'],
          ],
        },
      },
    ],
  },
  {
    key: 'note-final-turn-plan',
    kind: 'note',
    at: '2026-09-16 09:30',
    stageId: 'physicalDesignEmb',
    text: 'Final turn plan — FFN to Design Freeze',
    blocks: [
      {
        p: 'Agreed at the core team on 09/03 and re-based on the FFN date. The final turn starts one week late; signoff absorbs it by running its dry run and deck correlation on the Turn 2 database, so the final database needs one iteration fewer. Nothing after Design Freeze moves.',
      },
      {
        table: {
          head: ['Checkpoint', 'Plan', 'Now', 'Owner', 'Exit'],
          rows: [
            ['FFN release', '08/26', '09/11 ✓', 'Nikhil Rao', 'Equivalence and UPF clean'],
            ['Final placement', '09/25', '09/25 ✓', 'Diego Santos', 'No block above 72%, WNS better than −50 ps'],
            ['Final CTS and power / IR', '10/05', '10/09', 'Yuki Tanaka / Ben Carter', 'Skew in budget, dynamic IR ≤ 8%'],
            ['Final route, DRC / LVS converging', '10/19', '10/23', 'Aisha Rahman', 'DRC < 50, LVS clean'],
            ['Timing closed, all corners', '10/30', '11/06', 'Yuki Tanaka', 'WNS ≥ 0 setup and hold, all MCMM'],
            ['Database to signoff (EPD-D8)', '11/08', '11/13', 'Alex Morgan', 'EPD-D8 checklist confirmed'],
            ['Design Freeze', '11/23', '11/23', 'Olivia Park', 'ESO-D7 signed off'],
            ['Tapeout (MTO)', '01/18/2027', '01/18/2027', '@me', 'Mask order released'],
          ],
        },
      },
      { h: 'What protects the date' },
      {
        bullets: [
          'Signoff decks, correlation and triage tooling proven on Turn 2 before the FFN database exists (ESO-01, ESO-02)',
          'ECO-only discipline from FFN: every change through the ECO board with an impact statement',
          'Buffer left between database handoff (11/13) and Design Freeze (11/23): 10 days, one full signoff iteration',
        ],
      },
    ],
  },
  {
    key: 'risk-aon-leakage',
    kind: 'risk',
    closed: '2026-09-18',
    at: '2026-09-08 16:00',
    step: 'EPD-09:7',
    text:
      `Always-on domain leakage 2.3 µA at 25 °C on the Turn 2 database — target 1.5 µA deep sleep.

- Cause: the sensor hub and its retention flops are mostly SVT
- Impact: deep-sleep current is the number the coin-cell design-ins are sold on

Owner: Ben Carter, with Owen Gallagher (PMU).`,
  },
  {
    key: 'risk-aon-leakage-closed',
    kind: 'reply',
    at: '2026-09-18 15:40',
    parent: 'risk-aon-leakage',
    text: `Closed: HVT swap on the always-on domain outside the wake path.

- 14.2 k cells swapped; wake-path timing still met with 11% margin
- AON leakage 1.42 µA at 25 °C; total deep sleep 1.46 µA with retention on — inside the 1.5 µA target
- Carried into the FFN run as a placement constraint`,
  },
  {
    key: 'risk-fabric-timing',
    kind: 'risk',
    at: '2026-09-17 18:30',
    step: 'EPD-13:8',
    meeting: 'pnr-0915',
    text:
      `Setup timing on the FFN placement — 120 MHz fabric target at risk.

- SSG 0.72 V / −40 °C: WNS −61 ps, TNS −6.8 ns, 1,480 endpoints (Turn 2 was −17 ps)
- Paths: NoC arbiter → PE inputs; the arbiter grew 6.1% and its paths now cross two tile rows
- Constraint: LVT swap is limited by the always-on leakage just recovered

Plan: useful skew on the arbiter clock → pipeline-aware placement → LVT only on the top 300 paths.
Owner: Yuki Tanaka.`,
  },
  {
    key: 'turn2-closure-risk',
    kind: 'update',
    at: '2026-09-23 17:00',
    step: 'EPD-09:8',
    text:
      `Turn 2 closure risk statement for the final turn (retrospective on the N2 database).

- Timing: −17 ps / 212 endpoints
- Route: 312 DRC after route
- Dynamic IR: 7.4% worst
- All inside what the final turn plan assumed

Not exercised by Turn 2: the arbiter fix (now the worst timing) and concurrent eMRAM writes during a fabric burst (now the worst IR).`,
  },
  {
    key: 'risk-mram-ir',
    kind: 'risk',
    at: '2026-09-22 12:10',
    step: 'EPD-13:5',
    meeting: 'pnr-0922',
    text:
      `Dynamic IR drop 11.2% at eMRAM banks 2 and 3 on the FFN placement — budget 8%.

- When: all four banks write while the fabric runs a burst
- Why now: the vectorless run never hit it; the FFN W7 activity vectors do
- Impact: eMRAM write margin falls off below 0.74 V at the macro

Options:
1. Extra M8/M9 straps and decap over the bank channel
2. Throttle concurrent bank writes in emram_ctrl (an ECO)
3. Both

Owner: Ben Carter, with Hana Yoshida and Kenji Mori (foundry).`,
  },
  {
    key: 'place-done',
    kind: 'update',
    at: '2026-09-25 18:50',
    step: 'EPD-13:2',
    text:
      `Final placement done on the FFN.

- At SSG 0.72 V / −40 °C, with useful skew on the arbiter clock and pipeline-aware placement:
  WNS −61 → −38 ps · TNS −6.8 → −2.9 ns · endpoints 1,480 → 604
- Utilization 69.2%, no block above 72%

Next: final CTS. LVT on the top 300 paths is held back until after CTS, so the leakage cost is spent only where CTS does not recover it.`,
  },
  {
    key: 'dryrun',
    kind: 'update',
    at: '2026-09-25 16:20',
    step: 'ESO-01:2',
    text:
      `Signoff dry run on the Turn 2 database — all decks run end to end.

- STA: 27 MCMM views in 9.5 h
- DRC / LVS / antenna: 14 h
- EM/IR: 11 h

Found and fixed:
- Stale LVS rule file (v1.3 → v1.4 from the foundry)
- Missing low-voltage 0.6 V corner in the EM run

Triage dashboard is live — ready for the FFN database the day it lands.`,
  },
  {
    key: 'risk-atpg-volume',
    kind: 'risk',
    at: '2026-09-24 14:25',
    step: 'EDFT-10:6',
    text:
      `ATPG pattern set is 1.34× the vector memory of the production tester configuration.

- Coverage met: stuck-at 99.1%, transition 93.6% (target 92%), cell-aware 84%

Options:
1. Raise compression from 60× to 100× (a DFT ECO, re-verify)
2. Drop the lowest-yield cell-aware patterns
3. Split into two loads (+18% test time)

Pattern release (EDFT-10 step 8) moves to 10/16 at the latest.
Owner: Kevin Tran.`,
  },
  {
    key: 'risk-mram-ir-options',
    kind: 'reply',
    at: '2026-09-26 11:30',
    parent: 'risk-mram-ir',
    text:
      `First mitigation run: 11.2% → 9.4% — still above the 8% budget.

- Applied: extra M9 straps over banks 2–3, +180 pF decap in the bank channel
- Foundry (Kenji Mori): the macro is characterised to 8% only

Proposal for Tuesday:
- Add a write throttle in emram_ctrl — max two banks writing during a fabric burst (a 4-gate ECO plus one CSR)
- Expected to take it under 7%
- Firmware impact: none for the SDK; the throttle is transparent`,
  },
  {
    key: 'note-qor-tracker',
    kind: 'note',
    at: '2026-09-25 19:00',
    stageId: 'physicalDesignEmb',
    text: 'PnR QoR tracker — by turn',
    blocks: [
      { p: 'Worst corner for setup is SSG 0.72 V / −40 °C (120 MHz fabric); for hold FFG 0.88 V / 125 °C. IR is dynamic, vector-based where vectors exist.' },
      {
        table: {
          head: ['Turn', 'Date', 'Netlist', 'Setup WNS / TNS', 'Violating endpoints', 'Hold (FFG)', 'DRC after route', 'Dynamic IR worst', 'AON leakage'],
          rows: [
            ['Turn 1', '08/21', 'N1', '−142 ps / −38.6 ns', '6,420', '−41 ps', '4,870', '9.1%', '2.6 µA'],
            ['Turn 2', '09/18', 'N2', '−17 ps / −0.9 ns', '212', '−6 ps', '312', '7.4%', '1.42 µA'],
            ['Final — place', '09/17', 'FFN', '−61 ps / −6.8 ns', '1,480', 'n/a', 'n/a', '11.2%', '1.42 µA'],
            ['Final — place, useful skew', '09/25', 'FFN', '−38 ps / −2.9 ns', '604', 'n/a', 'n/a', '9.4%', '1.44 µA'],
            ['Target at handoff', '11/13', 'FFN', '≥ 0 / 0', '0', '≥ 0', '0 (or waived)', '≤ 8%', '≤ 1.5 µA'],
          ],
        },
      },
    ],
  },

  /* ---- the rest of the programme this week ---- */
  {
    key: 'compiler-alpha',
    kind: 'update',
    at: '2026-09-14 17:00',
    stageId: 'compiler',
    text:
      `Compiler Alpha released on plan: cmp-0.9.0-alpha.

- 42 of 45 reference kernels compile and match the simulator
- The 3 misses are dynamic-shape ONNX ops, deferred to beta
- Mapper runtime down from 11 min to 3.5 min on the largest model

Going to the four early-access partners with the Playground next week.`,
  },
  {
    key: 'playground',
    kind: 'update',
    at: '2026-09-24 18:10',
    stageId: 'virtualPlatform',
    text:
      `Playground launch readiness.

- Browser compile → run → energy loop working on the FFN-level cycle model
- Energy numbers within 6% of the FPGA-measured reference on W3 and W7
- Load test at 200 concurrent compiles: passed

Launch review with Rachel Kim and Chris Donovan on 09/28.`,
  },
  {
    key: 'atpg-coverage',
    kind: 'update',
    at: '2026-09-18 17:30',
    step: 'EDFT-10:7',
    text: `Coverage closed against the EDFT-02 targets on the FFN.

- Stuck-at: 99.1% (target 98.5%)
- Transition: 93.6% (target 92%)
- Cell-aware: 84% (goal, no target)

Untestable faults justified in the coverage report — 0.4%, in the eMRAM wrapper boundary.`,
  },
];

/* ---------- meetings ---------- */

export const E2_SERIES: readonly ScenarioSeries[] = [
  {
    key: 'core',
    title: 'E2 Core Team Weekly',
    purpose: 'Programme status against the plan by stage, milestones in the next 8 weeks, risks and decisions that need the core team, and actions review.',
    type: 'program_review',
    attendees: CORE_TEAM,
    freq: 'weekly',
    weekdays: [4],
    startDate: '2025-08-21',
    time: '09:00',
    durationMinutes: 60,
    agendaTemplate: ['Milestones and schedule against the plan', 'Stage status — exceptions only', 'Risks and decisions', 'Actions review'],
    location: 'Pittsburgh HQ, Allegheny room / Zoom',
    stage: 'physicalDesignEmb',
    links: [
      { type: 'milestone', ref: 'designFreezeEmb' },
      { type: 'milestone', ref: 'tapeoutBeolMtoEmb' },
    ],
  },
  {
    key: 'pnr',
    title: 'E2 PnR Weekly',
    purpose: 'Physical design by turn and block — timing, route, power / IR and DFT — the ECOs coming in, and what signoff needs next.',
    type: 'working_group',
    attendees: [...PD_TEAM, 'Nikhil Rao', 'Hannah Scott', 'Olivia Park', 'Kevin Tran', 'Tariq Aziz', 'Hana Yoshida'],
    freq: 'weekly',
    weekdays: [2],
    startDate: '2026-05-26',
    time: '10:00',
    durationMinutes: 60,
    agendaTemplate: ['QoR by block and turn', 'Timing, route and IR', 'ECOs in flight', 'DFT and signoff needs', 'Risks and actions'],
    location: 'Zoom',
    stage: 'physicalDesignEmb',
    links: [
      { type: 'stage', ref: 'physicalDesignEmb' },
      { type: 'milestone', ref: 'pdDatabaseHandoffEmb' },
    ],
  },
  {
    key: 'tor',
    title: 'E2 Tapeout Readiness Review',
    purpose: 'Every input the MTO depends on, owner by owner, from Design Freeze back: signoff, DFT patterns, boot ROM, package, test program and the mask order.',
    type: 'readiness_review',
    attendees: ['Mark Ellison', 'Olivia Park', 'Alex Morgan', 'Kevin Tran', 'Grace Liu', 'Tom Becker', 'Wei Zhang', 'Arjun Mehta'],
    freq: 'weekly',
    weekdays: [5],
    startDate: '2026-10-02',
    time: '14:00',
    durationMinutes: 45,
    agendaTemplate: ['Readiness by input', 'Open items blocking Design Freeze', 'Mask order and foundry slot'],
    location: 'Zoom',
    stage: 'tapeoutEmb',
    links: [{ type: 'milestone', ref: 'tapeoutBeolMtoEmb' }],
  },
];

export const E2_MEETINGS: readonly ScenarioMeeting[] = [
  {
    key: 'ffn-slip',
    title: 'FFN Slip Review — NoC Arbiter Deadlock',
    type: 'design_review',
    purpose: 'Decide whether the FFN holds for the arbiter fix or goes out on time with the fix as a post-FFN ECO, and what it costs either way.',
    attendees: ['Mark Ellison', 'Ethan Brooks', 'Ravi Kumar', 'Meera Iyer', 'Irene Wu', 'Nikhil Rao', 'Alex Morgan', 'Olivia Park', 'Jonas Weber'],
    location: 'Zoom',
    stage: 'synthesisEmb',
    links: [
      { type: 'risk', ref: 'risk-ffn-late' },
      { type: 'milestone', ref: 'ffnReleaseEmb' },
    ],
    date: '2026-08-27',
    time: '13:00',
    durationMinutes: 75,
    status: 'completed',
    minutes:
      'Root cause and fix confirmed (noc_arb credit return, ~2.4 k gates). Holding the FFN costs 2.5 weeks up front; a post-FFN ECO in all 576 tiles would reopen the final turn and signoff and puts Design Freeze at risk. Held. Recovery plan to protect Design Freeze to be brought to the core team on 09/03.',
    agenda: [
      {
        title: 'Root cause and the fix',
        presenter: 'Ravi Kumar',
        minutes: 20,
        notes: 'Late credit return when a write-back and a read retry hit the same port in one cycle. ~120 lines in noc_arb, ~2.4 k gates. Formal reproduces in 38 cycles once the retry assumption is relaxed.',
        outcome: 'info',
        links: [{ type: 'step', ref: 'FPV-05:3' }],
      },
      {
        title: 'Option A — hold the FFN; option B — FFN on time, fix as ECO',
        presenter: 'Alex Morgan',
        minutes: 30,
        notes: 'A: FFN 09/11, final turn starts 1 week late. B: FFN 08/26, but a functional ECO in 576 tiles after placement — re-place the tile, re-close timing, repeat signoff runs; estimated 3–4 weeks of rework landing on top of the final turn.',
        outcome: 'decision',
      },
      {
        title: 'Verification needed before FFN',
        presenter: 'Meera Iyer',
        minutes: 15,
        notes: 'Full regression, arbiter formal re-proof, 72 h soak on FPGA with W7 and W3.',
        outcome: 'action',
      },
    ],
    decisions: [
      {
        title: 'Hold the FFN for the NoC arbiter fix; FFN re-planned to 09/11',
        description: 'The FFN is released with the fix in RTL rather than on time with the fix as a post-FFN ECO. Design Freeze (11/23) and MTO (01/18/2027) are to be held by a recovery plan.',
        rationale: 'A functional ECO in every tile after placement costs more than the 2.5 weeks and lands on the critical path twice — in the final turn and in signoff.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Mark Ellison',
        scope: 'FFN date',
        agenda: 1,
        links: [
          { type: 'risk', ref: 'risk-ffn-late' },
          { type: 'milestone', ref: 'ffnReleaseEmb' },
        ],
      },
    ],
    actions: [
      {
        description: 'Merge the arbiter fix and the new assertion set; tag the RTL release',
        owner: 'Ravi Kumar',
        due: '2026-09-01',
        priority: 'critical',
        status: 'done',
        type: 'support',
        agenda: 0,
        evidence: 'rtl-2026.09.01 tagged; change record ECO-117.',
        verifiedBy: 'Ethan Brooks',
        completed: '2026-09-01',
      },
      {
        description: 'Full regression, arbiter formal re-proof and 72 h FPGA soak on the fixed RTL',
        owner: 'Meera Iyer',
        contributors: ['Irene Wu', 'Jonas Weber', 'Emily Novak'],
        due: '2026-09-10',
        priority: 'critical',
        status: 'done',
        type: 'support',
        agenda: 2,
        evidence: 'Regression 0 new failures (09/04); proofs all passing; 72 h soak clean on W7 and W3 (09/10).',
        verifiedBy: '@me',
        completed: '2026-09-10',
        links: [{ type: 'step', ref: 'FPV-04:4' }],
      },
      {
        description: 'Bring a recovery plan that holds Design Freeze to the core team on 09/03',
        owner: '@me',
        contributors: ['Alex Morgan', 'Olivia Park'],
        due: '2026-09-03',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        evidence: 'Presented and approved at the core team on 09/03.',
        verifiedBy: 'Mark Ellison',
        completed: '2026-09-03',
      },
    ],
  },
  {
    key: 'core-0903',
    series: 'core',
    date: '2026-09-03',
    time: '09:00',
    status: 'completed',
    minutes: 'Recovery plan approved: signoff dry run and correlation on Turn 2, one iteration fewer on the final database, PD handoff 11/13, 10-day buffer before Design Freeze kept. Compiler alpha on track for 09/14. EVT board layout started.',
    agenda: [
      {
        title: 'FFN recovery plan',
        presenter: '@me',
        minutes: 25,
        notes: 'Final turn starts 09/14 (1 week late). Dry run moves to Turn 2 now; correlation done before the FFN database; PD handoff 11/08 → 11/13. Design Freeze 11/23 and MTO 01/18 unchanged.',
        outcome: 'decision',
        links: [{ type: 'milestone', ref: 'designFreezeEmb' }],
      },
      {
        title: 'Compiler alpha and Playground',
        presenter: 'Marcus Chen',
        minutes: 10,
        notes: 'Alpha 09/14 on plan; 3 dynamic-shape ONNX ops deferred to beta.',
        outcome: 'info',
        links: [{ type: 'milestone', ref: 'compilerAlpha' }],
      },
      { title: 'Actions review', presenter: '@me', minutes: 10, outcome: 'info' },
    ],
    decisions: [
      {
        title: 'Recover the FFN slip inside signoff; hold Design Freeze and MTO',
        description: 'Signoff runs its dry run and deck correlation on the Turn 2 database from 09/07, so the final database needs one iteration fewer. PD database handoff moves from 11/08 to 11/13; Design Freeze stays 11/23.',
        rationale: 'The decks and correlation are the part of signoff that does not need the final database; proving them early removes the first iteration from the critical path.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Mark Ellison',
        scope: 'Schedule — signoff',
        agenda: 0,
        links: [
          { type: 'stage', ref: 'signoffEmb' },
          { type: 'milestone', ref: 'designFreezeEmb' },
        ],
      },
    ],
    actions: [
      {
        description: 'Run the signoff dry run on the Turn 2 database and publish the flow findings',
        owner: 'Olivia Park',
        contributors: ['Aisha Rahman', 'Yuki Tanaka'],
        due: '2026-09-30',
        priority: 'high',
        status: 'in_progress',
        type: 'support',
        agenda: 0,
        links: [{ type: 'step', ref: 'ESO-01:2' }],
      },
    ],
  },
  {
    key: 'pnr-0915',
    series: 'pnr',
    date: '2026-09-15',
    time: '10:00',
    status: 'completed',
    minutes: 'FFN taken in, +1.8% instances; floorplan and PDN unchanged. ECO-only discipline from today. First placement results expected 09/17; timing risk expected on the arbiter.',
    agenda: [
      {
        title: 'FFN intake — delta against N2',
        presenter: 'Alex Morgan',
        minutes: 20,
        notes: '+1.8% chip; noc_arb +6.1%, emram_ctrl +4.2%, aon_hub +3.0%. Max block utilization 72%.',
        outcome: 'info',
        links: [{ type: 'step', ref: 'EPD-13:1' }],
      },
      {
        title: 'ECO board for the final turn',
        presenter: '@me',
        minutes: 10,
        notes: 'Every change after FFN needs an impact statement from PD, DV and signoff before approval. Ethan Brooks chairs; TPM owns the log.',
        outcome: 'decision',
      },
      { title: 'Always-on leakage after the HVT swap', presenter: 'Ben Carter', minutes: 10, notes: 'Swap in progress on Turn 2; result by 09/18.', outcome: 'info' },
    ],
    decisions: [
      {
        title: 'ECO-only change discipline from the FFN',
        description: 'After 09/11 the netlist changes only through ECOs approved by the ECO board, each with a PD, DV and signoff impact statement.',
        rationale: 'The final turn cannot absorb unassessed changes; an unassessed functional ECO is the most likely cause of a Design Freeze slip.',
        status: 'approved',
        owner: 'Ethan Brooks',
        approvedBy: '@me',
        scope: 'Change control',
        agenda: 1,
        links: [{ type: 'step', ref: 'EPD-13:3' }],
      },
    ],
    actions: [
      {
        description: 'Report first-placement timing on the FFN, worst paths by block',
        owner: 'Yuki Tanaka',
        due: '2026-09-17',
        priority: 'high',
        status: 'done',
        type: 'support',
        evidence: 'WNS −61 ps at SSG 0.72 V / −40 °C, arbiter → PE paths; risk raised.',
        verifiedBy: 'Alex Morgan',
        completed: '2026-09-17',
        links: [{ type: 'risk', ref: 'risk-fabric-timing' }],
      },
    ],
  },
  {
    key: 'core-0917',
    series: 'core',
    date: '2026-09-17',
    time: '09:00',
    status: 'completed',
    minutes: 'FFN out 09/11, final turn running. New timing risk on the arbiter paths. Compiler alpha shipped 09/14. Early-access agreements: 3 of 4 signed.',
    agenda: [
      { title: 'Milestones — FFN done, Design Freeze on track', presenter: '@me', minutes: 15, outcome: 'info', links: [{ type: 'milestone', ref: 'ffnReleaseEmb' }] },
      { title: 'Fabric setup timing after FFN', presenter: 'Alex Morgan', minutes: 15, notes: 'WNS −61 ps; plan: useful skew, pipeline-aware placement, then targeted LVT.', outcome: 'risk', links: [{ type: 'risk', ref: 'risk-fabric-timing' }] },
      { title: 'Early access', presenter: 'Chris Donovan', minutes: 10, notes: '3 of 4 partner agreements signed; the fourth in legal review.', outcome: 'info' },
    ],
    actions: [
      {
        description: 'Close the fourth early-access agreement before the Playground launch',
        owner: 'Chris Donovan',
        due: '2026-09-28',
        priority: 'normal',
        status: 'in_progress',
        type: 'standalone',
        links: [{ type: 'deliverable', ref: 'earlyAccess:1' }],
      },
    ],
  },
  {
    key: 'pnr-0922',
    series: 'pnr',
    date: '2026-09-22',
    time: '10:00',
    status: 'completed',
    minutes: 'IR drop at eMRAM banks 2–3 found with the W7 vectors: 11.2% against 8%. Risk raised. PDN mitigation run first; throttle ECO to be assessed in parallel. Timing: useful skew showing −61 → −40 ps in trials.',
    agenda: [
      {
        title: 'Dynamic IR with the FFN vectors',
        presenter: 'Ben Carter',
        minutes: 20,
        notes: '11.2% at banks 2–3 with all four banks writing during a fabric burst. Vectorless did not see it.',
        outcome: 'risk',
        links: [{ type: 'risk', ref: 'risk-mram-ir' }],
      },
      { title: 'Timing — useful skew trials', presenter: 'Yuki Tanaka', minutes: 15, notes: 'Arbiter clock skewed +35 ps: −61 → −40 ps in trial.', outcome: 'info' },
      { title: 'DFT — scan reorder and ATPG', presenter: 'Kevin Tran', minutes: 10, notes: 'Coverage met; pattern volume above tester memory. Options to the next core team.', outcome: 'risk' },
    ],
    decisions: [
      {
        title: 'Mitigate eMRAM IR in the PDN first; assess a write-throttle ECO in parallel',
        description: 'Straps and decap over the bank channel go into the final turn now. The emram_ctrl throttle is assessed as an ECO with its DV and firmware impact, for the ECO board on 09/29.',
        rationale: 'The PDN change costs nothing in function; the throttle is a functional change and needs the ECO board.',
        status: 'approved',
        owner: 'Alex Morgan',
        approvedBy: '@me',
        scope: 'Power integrity',
        agenda: 0,
        links: [{ type: 'risk', ref: 'risk-mram-ir' }],
      },
    ],
    actions: [
      {
        description: 'Run the PDN mitigation (M9 straps, bank-channel decap) and re-run dynamic IR with the W7 vectors',
        owner: 'Ben Carter',
        due: '2026-09-26',
        priority: 'critical',
        status: 'done',
        type: 'support',
        evidence: '11.2% → 9.4%; still above the 8% budget.',
        verifiedBy: 'Alex Morgan',
        completed: '2026-09-26',
        links: [{ type: 'step', ref: 'EPD-13:5' }],
      },
      {
        description: 'Assess the emram_ctrl write-throttle ECO — gates, DV plan, firmware impact — for the ECO board',
        owner: 'Hana Yoshida',
        contributors: ['Ravi Kumar', 'Meera Iyer', 'Grace Liu'],
        due: '2026-09-29',
        priority: 'critical',
        status: 'in_progress',
        type: 'support',
        impact: 'milestone',
        impactNote: 'If the IR does not close by final CTS (10/09), final route starts late and database handoff (11/13) is at risk.',
        links: [{ type: 'risk', ref: 'risk-mram-ir' }],
      },
      {
        description: 'Confirm with the foundry whether the eMRAM macro can be characterised to 10% IR for this node',
        owner: 'Hana Yoshida',
        contributors: ['Kenji Mori'],
        due: '2026-09-25',
        priority: 'high',
        status: 'blocked',
        type: 'support',
        blocker: 'Foundry characterisation team has not answered; escalated through the foundry account manager on 09/25.',
        escalation: '2026-09-25',
        links: [{ type: 'risk', ref: 'risk-mram-ir' }],
      },
      {
        description: 'Run the ECO board on the write-throttle ECO on 09/29 with the PD, DV and signoff impact statements',
        owner: '@me',
        contributors: ['Ethan Brooks', 'Hana Yoshida'],
        due: '2026-09-29',
        priority: 'high',
        status: 'open',
        type: 'standalone',
        links: [{ type: 'risk', ref: 'risk-mram-ir' }],
      },
      {
        description: 'Bring the ATPG pattern-volume options with test-time and tester-cost impact to the core team',
        owner: 'Kevin Tran',
        contributors: ['Tariq Aziz', 'Wei Zhang'],
        due: '2026-10-01',
        priority: 'high',
        status: 'open',
        type: 'support',
        links: [{ type: 'risk', ref: 'risk-atpg-volume' }],
      },
    ],
  },
  {
    key: 'core-0924',
    series: 'core',
    date: '2026-09-24',
    time: '09:00',
    status: 'completed',
    minutes: 'Final turn on plan to placement (09/25). Two new risks: eMRAM IR and ATPG volume. Playground launch review 09/28. EVB debug documentation re-dated to 10/02 — waits on the final pinout.',
    agenda: [
      { title: 'Final turn status', presenter: 'Alex Morgan', minutes: 15, notes: 'Placement completes 09/25; timing −40 ps with useful skew.', outcome: 'info' },
      { title: 'New risks — eMRAM IR, ATPG volume', presenter: '@me', minutes: 20, outcome: 'risk', links: [{ type: 'risk', ref: 'risk-mram-ir' }, { type: 'risk', ref: 'risk-atpg-volume' }] },
      { title: 'Playground launch readiness', presenter: 'Sofia Russo', minutes: 10, notes: 'Load test passed; energy within 6% of FPGA reference.', outcome: 'info', links: [{ type: 'milestone', ref: 'playgroundLaunch' }] },
    ],
    actions: [
      {
        description: 'Report the schedule impact of the two open PD risks on the EPD-D8 handoff (11/13) and Design Freeze (11/23) to Mark Ellison',
        owner: '@me',
        due: '2026-10-01',
        priority: 'high',
        status: 'in_progress',
        type: 'standalone',
        impact: 'milestone',
        impactNote: 'No slip yet: 10 days of buffer between handoff and Design Freeze.',
        links: [
          { type: 'milestone', ref: 'designFreezeEmb' },
          { type: 'deliverable', ref: 'physicalDesignEmb:7' },
        ],
      },
      {
        description: 'Publish the debug and trace access documentation for the EVB once the FFN pinout is frozen',
        owner: 'Luis Herrera',
        due: '2026-10-02',
        priority: 'normal',
        status: 'open',
        type: 'support',
        links: [{ type: 'deliverable', ref: 'validationHardwareEmb:1' }],
      },
    ],
  },
  {
    key: 'pnr-0929',
    series: 'pnr',
    date: '2026-09-29',
    time: '10:00',
    status: 'scheduled',
    agenda: [
      { title: 'Final CTS — first results', presenter: 'Yuki Tanaka', minutes: 15, links: [{ type: 'step', ref: 'EPD-13:4' }] },
      { title: 'eMRAM IR — throttle ECO for the ECO board', presenter: 'Hana Yoshida', minutes: 20, links: [{ type: 'risk', ref: 'risk-mram-ir' }] },
      { title: 'Signoff dry run findings', presenter: 'Olivia Park', minutes: 10, links: [{ type: 'step', ref: 'ESO-01:2' }] },
      { title: 'Risks and actions', presenter: '@me', minutes: 10 },
    ],
  },
  {
    key: 'core-1001',
    series: 'core',
    date: '2026-10-01',
    time: '09:00',
    status: 'scheduled',
    agenda: [
      { title: 'Milestones — Design Freeze 11/23, MTO 01/18', presenter: '@me', minutes: 10 },
      { title: 'ATPG pattern volume — options and decision', presenter: 'Kevin Tran', minutes: 20, links: [{ type: 'risk', ref: 'risk-atpg-volume' }] },
      { title: 'eMRAM IR — ECO board outcome', presenter: 'Alex Morgan', minutes: 10, links: [{ type: 'risk', ref: 'risk-mram-ir' }] },
      { title: 'Actions review', presenter: '@me', minutes: 10 },
    ],
  },
  {
    key: 'tor-1002',
    series: 'tor',
    date: '2026-10-02',
    time: '14:00',
    status: 'scheduled',
    agenda: [
      { title: 'Readiness by input — signoff, DFT, boot ROM, package, test, masks', presenter: '@me', minutes: 25 },
      { title: 'Mask order and foundry slot for 01/18', presenter: 'Arjun Mehta', minutes: 10, links: [{ type: 'milestone', ref: 'tapeoutBeolMtoEmb' }] },
      { title: 'Open items blocking Design Freeze', presenter: 'Olivia Park', minutes: 10, links: [{ type: 'milestone', ref: 'designFreezeEmb' }] },
    ],
  },
];

export const E2_SCENARIO: Scenario = {
  program: {
    id: E2_ID,
    name: E2_NAME,
    kickoff: E2_KICKOFF,
    costPerManMonth: 18000,
    today: E2_TODAY,
    now: '2026-09-27 20:00',
    timeZone: 'America/New_York',
    emailDomain: 'e2-program.example',
    phoneStart: 100,
    phonePrefix: '+1 412 555 0',
  },
  template: {
    id: EMBEDDED_PROFILE.id,
    name: EMBEDDED_PROFILE.label,
    stages: E2_PLAN,
    windows: {},
    create: false,
  },
  actual: {
    overrides: E2_ACTUAL,
    windows: ACTUAL_WINDOWS,
  },
  doneStages: E2_PLAN.map((s) => s.key),
  doneDeliverablesBeforeToday: true,
  leaders: E2_LEADERS,
  contacts: E2_CONTACTS,
  steps: E2_STEPS,
  deliverables: E2_DELIVERABLES,
  posts: E2_POSTS,
  series: E2_SERIES,
  meetings: E2_MEETINGS,
};
