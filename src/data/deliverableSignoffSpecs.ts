/**
 * /data/deliverableSignoffSpecs.ts — what each gate's sign-off records beyond
 * what its write-up already says: the baseline it is taken against, the checks
 * with their targets, and the sheet only that gate has.
 *
 * The rest of a sign-off — entry and exit criteria, failure modes, roles,
 * receiving activities — comes from the write-up of the activity that produces
 * the deliverable (see /lib/signoffDefinition.ts). The Excel workbook and the
 * in-app sign-off are both built from the two together.
 */

export interface SignoffSpec {
  /** What the signoff is taken against: each a row to name a version or tag. */
  baseline: string[];
  /** The checks recorded, each [check, target or limit]. */
  checks: [string, string][];
  /** A section only this deliverable carries. */
  extra?: { heading: string; intro: string; columns: string[]; rows: number };
}

export const SIGNOFF_SPECS: Record<string, SignoffSpec> = {
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

