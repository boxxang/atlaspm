import type { WriteUpEdit } from './types';

/** RTL: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const RTL_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'RTL-01': {
    purpose: [
      'Complete the <b>microarchitecture specification for every block</b>—the processing element and fabric tile, the scalar control path, the system bus, the peripherals, interfaces, control and register map—to the level of detail an implementer can write code against without inventing anything.',
      '<code>ARCH-10</code> started these inside architecture; this finishes them. The distinction matters: a block whose specification is still being written while its RTL is being written produces code that documents itself, and the specification then follows the code instead of leading it. For the fabric tile it matters twice, because whatever the tile specification leaves undefined is replicated in every tile.',
    ],
    consumes: [
      'Architecture specification and block chapters from ARCH-07',
      'Microarchitecture drafts from ARCH-10 and the fabric ISA from FCD-02',
      'PPA budgets per block from ARCH-09',
      'Verification strategy from DV-01',
      'Interface definitions from ARCH-03',
    ],
    roles: [
      { r: 'Block owners', d: 'Author their block’s specification' },
      { r: 'RTL lead', d: 'Owns the entry gate and specification quality' },
      { r: 'Interconnect architect', d: 'Arbitrates shared system bus and fabric interface definitions' },
      { r: 'Verification leads', d: 'Observability and checkability requirements' },
      { r: 'Chief architect', d: 'Resolves conflicts against the architecture specification' },
    ],
    terms: ['PPA', 'RTL', 'DV', 'ISA'],
  },

  'RTL-02': {
    flowNote:
      'Most of the activity’s window is step 7, which is maintenance rather than construction. A CI system that is not maintained degrades into one everyone ignores, and an ignored red build is worse than no build at all.',
  },

  'RTL-03': {
    flowNote:
      'Step 3 runs for most of the stage and is a standing meeting rather than a task. Its discipline is impact assessment: a change that looks like an afternoon in one block can invalidate a month of verification, and a change to the fabric that touches the FCD-04 contract also invalidates compiler work, so the board exists to make that cost visible before the change is approved.',
    consumes: [
      'Change requests from every source — architecture, compiler, verification, synthesis, IP',
      'Verification status from DV-04',
      'Trial synthesis and PPA status from RTL-08',
      'Lint and CDC closure status from RTL-09',
      'Freeze criteria from the program plan',
    ],
  },

  'RTL-04': {
    consumes: [
      'Block specifications from RTL-01',
      'Address map intent from ARCH-07',
      'Boot ROM and HAL requirements from SDK-01 and SDK-02',
      'Security and lifecycle access rules from ARCH-05',
      'Verification model requirements from DV-01',
    ],
  },

  'RTL-05': {
    purpose: [
      'Write the <b>synthesisable logic for every block</b>, to a coding standard that survives lint, CDC, synthesis and gate-level simulation without rework.',
      'This is the largest activity in the stage, and its weight is uneven. The processing element and fabric tile are designed once, to a very high standard, and replicated across the array—a defect there is a defect in every tile—while the scalar control path, the system bus and the peripherals are smaller and more conventional. It is also the activity most exposed to specification churn: every change upstream lands here, multiplied by the number of blocks that inherit it.',
    ],
    flowNote:
      'Step 6 is fixing rather than writing, and it is the honest half of RTL. First-pass code is written in step 2; what makes it correct is the loop against block-level verification, and shortening that loop is where schedule pressure does the most damage.',
    risks: [
      '<b>Specification churn arriving mid-implementation.</b> Every upstream change lands here multiplied by the blocks affected, which is why <code>RTL-03</code> exists.',
      '<b>Coding standard imposed after code exists.</b> Retrofitting a standard across months of written code is a project nobody schedules and everyone half-does.',
      '<b>Assertions treated as verification’s job.</b> Assertions written by the implementer capture intent; written by someone else they capture observed behavior.',
      '<b>Blocks declared complete without verification feedback.</b> First-pass code is not correct code, and a block frozen before its verification loop closes freezes its bugs.',
      '<b>Configurability added everywhere.</b> Parameterization nobody uses multiplies the verification space at no benefit, and the cost lands on <code>DV-05</code>.',
    ],
  },

  'RTL-06': {
    purpose: [
      'Implement the <b>clock, reset and power intent</b> the architecture defined—the always-on domain, power-gated domains, isolation, retention, crossing synchronisers and the power management controller—and produce a UPF file the tools accept.',
      'Power intent is where architecture becomes an obligation on every downstream tool. Synthesis inserts isolation cells from it, verification checks against it, and physical design implements it. On a part sold on sleep current and battery life, an intent file that is wrong or incomplete propagates the same error into all three and into the product’s headline number.',
    ],
    consumes: [
      'Power, clock and operating-mode architecture from ARCH-06 and PMU-01',
      'Always-on domain and wake sources from PMU-04',
      'Crossing inventory from ARCH-06',
      'Block list and hierarchy from RTL-01',
      'UPF methodology from PDK-08',
      'Library low-power cell availability from PDK-03',
    ],
    risks: [
      '<b>UPF written as a document.</b> Intent that has never been elaborated in synthesis is intent whose errors are found by the first person who runs the flow.',
      '<b>Crossings implemented without reference to the inventory.</b> A synchroniser strategy chosen per crossing by each designer produces inconsistency CDC will flag hundreds of times.',
      '<b>Retention strategy decided late.</b> Retention cells cost area and leakage and change the physical implementation; adding them after floorplan is expensive.',
      '<b>Wake path crossing a powered-down domain.</b> A wake source whose logic, synchroniser or clock sits outside the always-on domain works in every test that starts awake and never wakes the part from deep sleep.',
      '<b>Reset sequencing implemented from the block view.</b> Reset order is a chip-level property, and blocks each releasing in their own order produces a boot that works in simulation and not in silicon.',
      '<b>Intent reviewed only by its author.</b> Synthesis, verification and physical design each consume it differently, and each has to confirm it works for them.',
    ],
  },

  'RTL-07': {
    purpose: [
      'Bring every third-party, foundry and internal IP into the design—the eMRAM macro and its controller, the PMU and oscillator macros, the scalar core and the peripherals—with <b>wrappers, glue, configuration and version control</b>, and prove each one behaves as its documentation claims.',
      'IP integration fails at the boundary rather than in the block. An eMRAM macro that meets its specification and a controller that meets its specification can still disagree about reset ordering, trim loading or when a write has completed, and the disagreement is found here or it is found in the lab.',
    ],
    consumes: [
      'IP deliveries against the schedule from IPR-09',
      'Acceptance checklists from IPR-07',
      'PMU and oscillator macros and behavioural models from PMU-05',
      'eMRAM macro views from MRAM-05',
      'Block RTL from RTL-05',
      'Integration requirements from the architecture specification',
    ],
    roles: [
      { r: 'IP integration lead', d: 'Owns integration, inspection and the manifest' },
      { r: 'Integration engineers', d: 'Wrappers, glue and configuration' },
      { r: 'Verification engineers', d: 'Boundary and sequencing verification' },
      { r: 'Analog and eMRAM integration engineer', d: 'PMU, oscillator and eMRAM macro integration and co-simulation' },
      { r: 'Procurement liaison', d: 'Vendor escalation on delivery and quality issues' },
    ],
    effortLabels: [
      'Wrapper and glue implementation',
      'Boundary and sequencing verification',
      'PMU and eMRAM macro integration',
      'Configuration and tie-off',
      'Incoming inspection',
      'Version manifest and reporting',
    ],
    terms: ['IP', 'eMRAM', 'RTL'],
  },

  'RTL-10': {
    consumes: [
      'Block RTL releases from RTL-05',
      'Integrated IP from RTL-07',
      'Power and clock intent from RTL-06',
      'Register map from RTL-04',
      'Boot ROM image and boot flow from SDK-01',
      'Top-level architecture from ARCH-07',
    ],
    risks: [
      '<b>Connectivity checked by inspection.</b> A pin multiplexer across seventy-odd GPIO and the peripherals behind them is too many connections to review; automated connectivity checking is the only reliable method.',
      '<b>Integration started before blocks are stable.</b> Integrating moving blocks produces defects that are re-found every time a block updates.',
      '<b>Address map assembled from block documentation.</b> Generated maps agree with the code; hand-assembled maps agree with the documentation, which is a different thing.',
      '<b>First boot deferred.</b> The boot path exercises reset, clocking, configuration, the eMRAM and the fabric together, and delaying it delays every defect that only appears in combination.',
      '<b>Clock and reset distribution treated as a wiring task.</b> It carries the crossing inventory from <code>ARCH-06</code> and the CDC obligations that follow from it.',
    ],
    effortLabels: [
      'System bus and fabric interface integration',
      'Chip-level smoke tests and boot',
      'Connectivity checking',
      'Clock and reset distribution',
      'Address map assembly',
      'Issue closure and release',
    ],
    terms: ['IP', 'RTL', 'CDC', 'ROM'],
  },
};
