import type { WriteUpEdit } from './types';

/** SYN: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const SYN_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'SYN-01': {
    purpose: [
      'Write the <b>constraints the whole implementation is optimized and signed off against</b>—clocks, generated clocks, IO timing, exceptions, test modes, and the always-on domain on its slow clock—and validate them rather than assume them.',
      'Constraints are the specification synthesis and physical design actually read. A missing clock definition produces a design optimized for a path nobody cares about; a wrong false path produces one that closes in the tool and fails in silicon. Every hour spent validating them here saves days at <code>EPD-05</code>.',
    ],
    consumes: [
      'Clock architecture and operating modes from EARCH-06',
      'Interface timing requirements from EARCH-03',
      'Corner and mode definition from EPDK-11',
      'DFT test modes from EDFT-01',
      'RTL hierarchy from ERTL-10',
    ],
    risks: [
      '<b>Unconstrained paths reported as clean.</b> A path with no constraint is a path the tool ignores, and it appears in the report as no violation at all.',
      '<b>Exceptions written to close timing.</b> A false path added because the path would not close is a silicon failure being converted into a green report.',
      '<b>Constraints diverging between synthesis and signoff.</b> Two constraint sets means optimizing against one and being judged against the other.',
      '<b>Test mode constraints written late.</b> Scan shift and at-speed modes have their own timing, and a design closed only in functional mode fails at ATE.',
      '<b>IO constraints assumed from the peripheral specification.</b> Actual budgets come from the pad cells qualified in <code>EPDK-06</code> and the package and board load modelled in <code>EPKG-04</code>, at the IO supply voltage the pin runs at, not from the protocol document.',
    ],
    entry: [
      'Clock architecture and operating modes fixed by EARCH-06',
      'Corner and mode definition available from EPDK-11',
      'RTL hierarchy stable enough to constrain',
    ],
    terms: ['RTL', 'SDC', 'QoR', 'IO', 'DFT', 'ATE'],
  },

  'SYN-03': {
    risks: [
      '<b>QoR reported in absolute terms.</b> Numbers with no budget reference cannot be acted on, and everyone forms their own opinion of whether they are acceptable.',
      '<b>No escalation rule.</b> Divergence noticed and not escalated becomes a surprise at the final turn, when there is nothing left to do about it.',
      '<b>Reports not normalized across drops.</b> More RTL in a later drop makes the trend meaningless unless the comparison accounts for it.',
      '<b>Power reported at nominal only.</b> The numbers that matter are active energy at the efficiency-mode operating point and leakage at the hot corner that sets sleep current, and nominal understates both.',
      '<b>Reporting stopping between drops.</b> The interesting question is whether a block is improving, and that needs data between releases as well as at them.',
    ],
  },

  'SYN-04': {
    purpose: [
      'Hand each netlist to physical design as a <b>complete, accepted package</b>—netlist, constraints, UPF, DFT collateral, abstracts—and review the QoR delta together rather than throwing results over a wall.',
      'The handoff is where two teams either share a picture of the design or maintain two. Three man-months across the stage buys a structured package and a joint review per drop, and it prevents the pattern where physical design spends a week discovering what synthesis already knew.',
    ],
  },

  'SYN-05': {
    consumes: [
      'RTL in whatever state exists from ERTL-05',
      'Macro list and abstracts from MRAM-05 and PMU-05',
      'Constraints from ESYN-01',
      'Flow setup requirements from EPD-01',
      'Hierarchy from EARCH-02',
    ],
    entry: [
      'Enough RTL exists to elaborate a representative hierarchy',
      'Macro abstracts available from MRAM-05 and PMU-05',
      'PD flow setup ready to receive a netlist',
    ],
  },

  'SYN-07': {
    purpose: [
      'Synthesize <b>with the floorplan in the loop</b>—physical-aware mapping, congestion feedback, placement-driven restructuring—so the netlist that reaches physical design is already routable.',
      'Logic synthesis without physical information optimizes for a wire model that does not exist. On this die the risk is congestion more than wire delay: the interconnect between the fabric\'s processing elements is wire-dense by design, and the correction happens either here or as weeks of congestion work at <code>EPD-09</code>.',
    ],
    risks: [
      '<b>Floorplan too immature to synthesize against.</b> Physical-aware synthesis against a floorplan that then changes produces optimization for a layout that never exists.',
      '<b>Congestion feedback one-directional.</b> Synthesis restructures and physical design re-places; without both, each optimizes against the other\'s stale result.',
      '<b>Runtime cost not justified.</b> Physical-aware flows are slower, and without the QoR comparison nobody knows whether the extra hours bought anything.',
      '<b>Restructuring breaking hierarchy.</b> Aggressive cross-boundary optimization improves QoR and makes the netlist harder to close hierarchically and harder to equivalence-check.',
      '<b>Blockages not modelled.</b> The eMRAM, SRAM and analog macros and their keep-out regions take a large share of a small die, and synthesis blind to them produces logic that cannot be placed where it assumed.',
    ],
  },

  'SYN-09': {
    risks: [
      '<b>Optimization driven by default activity.</b> Uniform switching assumptions produce gating where it saves nothing and none where it would.',
      '<b>Clock gating efficiency unmeasured.</b> Gates inserted without measuring how often they actually gate cost area and leakage for no benefit.',
      '<b>Vt mix skewed to low-Vt for timing.</b> Leakage grows non-linearly, and a design closed on low-Vt everywhere blows the sleep-current budget the battery life depends on.',
      '<b>Power measured at the wrong operating point.</b> The numbers that matter are active energy at the efficiency-mode operating point the product mostly runs at and leakage at the hot corner in sleep, not either one at nominal.',
      '<b>Optimization deferred to the final turn.</b> Power changes timing; a design closed on timing and then power-optimized has to be re-closed.',
    ],
    exit: [
      'Optimization driven by real activity data, not defaults',
      'Clock gating efficiency measured, not assumed',
      'Power reported at the operating points the product uses, leakage at the hot sleep corner',
    ],
    measuredBy: [
      'Dynamic power against budget',
      'Clock gating efficiency',
      'Leakage at the hot corner against the sleep-current budget from PMU-06',
    ],
    terms: ['PPA', 'QoR', 'UPF'],
  },

  'SYN-10': {
    consumes: [
      'UPF from ERTL-06',
      'Low-power cells from EPDK-03',
      'Power domain definition from EARCH-06 and the always-on domain from PMU-04',
      'Mapped netlist from ESYN-02',
      'Low-power flow from EPDK-08',
    ],
  },

  'SYN-11': {
    flowNote:
      'Step 6 is the honest part. A drop released with "timing is converging" tells nobody anything; one released with "forty paths in two blocks remain, all in the fabric tile\'s interconnect, requiring a restructure or a frequency concession in performance mode" gives the program a decision.',
  },
};
