import type { WriteUpEdit } from './types';

/** PD: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const PD_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'PD-01': {
    flowNote:
      'Step 6 is what makes the schedule credible. A flow that runs correctly and takes twelve hours per iteration sets a closure cadence nobody planned for, and knowing that number now is what lets EPDK-10 buy capacity before it is needed.',
    risks: [
      '<b>Flow setup on the first real netlist.</b> Every flow problem then costs a turn, and the turns are the schedule.',
      '<b>MMMC scenarios incomplete.</b> A corner or mode missing from the setup—the retention voltage, the hot leakage corner, the always-on domain on its slow clock—is one the design is never closed at, and it is found at <code>ESO-03</code>.',
      '<b>Runtime not measured.</b> A flow that works and takes a full day per iteration produces a closure schedule nobody planned, discovered when closure starts.',
      '<b>Tile flow deferred.</b> The fabric is an array of identical tiles, and the flow that hardens one tile and abuts it into the array has to be proven on N0, not built under pressure.',
      '<b>Capacity assumed rather than booked.</b> The flow\'s peak concurrency is known here, and licences take weeks to procure.',
    ],
  },

  'PD-02': {
    flowNote:
      'Step 2 is where this die is won or lost. The eMRAM, the SRAM banks, the regulators and the oscillators have to sit where their access paths are short, their supplies and keep-outs are respected and the analog blocks are away from switching noise—and moving one late moves everything around it, the pad ring included.',
    consumes: [
      'Floorplan intent and pad ring plan from EARCH-08',
      'Pin-out and pad ring from EPKG-02',
      'Macro abstracts from MRAM-05, PMU-05 and EPDK-05',
      'Partitioning from EARCH-02',
      'Netlist from ESYN-08',
      'Area budgets from EARCH-09',
    ],
    risks: [
      '<b>Macro placement not congestion-aware.</b> Macros placed for access and not for the logic between them produce routing congestion that cannot be fixed at <code>EPD-07</code>.',
      '<b>Floorplan changed after turn 1.</b> Clock trees, power grid and routing are all built on it, and all of them are invalidated.',
      '<b>Utilization set too high.</b> A dense floorplan closes area and cannot be routed or timing-closed, and the discovery comes after weeks of work.',
      '<b>Pad ring moving after the floorplan freeze.</b> A pin-out change from <code>EPKG-02</code> after freeze moves IO cells, supply pads and the routing behind them, and every turn built on the old ring is invalidated.',
      '<b>Partitions that do not match the design hierarchy.</b> Closing blocks that cut across logical boundaries makes timing budgets and equivalence checking harder for no gain.',
    ],
    roles: [
      { r: 'Floorplan owner', d: 'Owns partitions, macro placement and the freeze' },
      { r: 'Physical design engineers', d: 'Area planning, pins and blockages' },
      { r: 'Architecture liaison', d: 'Confirms the floorplan matches the intent' },
      { r: 'Package liaison', d: 'Pad ring and pin-out alignment with EPKG-02' },
      { r: 'Synthesis liaison', d: 'Congestion feedback into physical-aware synthesis' },
    ],
    entry: [
      'Floorplan intent and pad ring plan from EARCH-08',
      'Macro abstracts available from MRAM-05 and PMU-05',
      'Flow running from EPD-01',
    ],
  },

  'PD-03': {
    purpose: [
      'Build the <b>power delivery network</b>—grid topology per power domain, straps, switches, decap—fed from the on-chip regulators, and prove by early IR analysis that it can actually feed the die in every operating mode.',
      'The PDN is built early because everything routes around it. Grid density trades directly against routing resource: too sparse and IR drop eats timing margin, too dense and there is nothing left to route with. Getting it wrong is discovered at <code>ESO-05</code>, when the fix is a metal change across the whole die.',
    ],
    consumes: [
      'Power budget per domain and mode from EARCH-09',
      'Power domain definition from EARCH-06 and ESYN-10',
      'Regulator outputs and the always-on supply from PMU-03',
      'Floorplan from EPD-02',
      'Supply pad and rail assignment from EPKG-02',
      'Power estimates from ESYN-09',
    ],
    risks: [
      '<b>Grid density traded against routing without analysis.</b> Both constraints are real, and choosing by feel produces either IR problems or congestion.',
      '<b>IR analyzed only statically.</b> Dynamic IR under real switching is worse, and with the package inductance <code>EPKG-04</code> models it is worse again.',
      '<b>Decap placed where there is room.</b> Decoupling works where the current is drawn, not where the floorplan left space.',
      '<b>Power switches sized without the sleep budget.</b> Too few starve the fabric in performance mode; too many leak in sleep, and the in-rush current on wake can trip the brown-out detector.',
      '<b>PDN frozen before power numbers are real.</b> A grid designed against estimates and fed a design that draws more is a grid that fails at signoff.',
    ],
    roles: [
      { r: 'Power delivery engineer', d: 'Owns the PDN and its analysis' },
      { r: 'Physical design engineers', d: 'Grid implementation and decap placement' },
      { r: 'Power architect', d: 'Domain topology, switch strategy and regulator loading' },
      { r: 'Package liaison', d: 'Supply pad count and package inductance from EPKG-04' },
      { r: 'Floorplan owner', d: 'Area for switches, straps and decap' },
    ],
    entry: [
      'Floorplan available from EPD-02',
      'Power budgets per domain from EARCH-09',
      'Supply pad and rail assignment progressing in EPKG-02',
    ],
    terms: ['MCMM', 'IR', 'PDN', 'BOR'],
  },

  'PD-05': {
    risks: [
      '<b>Turn 1 expected to close.</b> It will not, and treating the gap as a crisis rather than as data produces panic instead of a plan.',
      '<b>Feedback not specific.</b> "Congestion is high" changes nothing; "the fabric tile is over 90% utilization around the interconnect between processing elements in three regions and needs restructuring" changes the next drop.',
      '<b>Turn run on an incomplete netlist.</b> A baseline missing blocks understates the difficulty and misleads the closure plan.',
      '<b>Congestion mitigated locally.</b> Fixing congestion by rip-up and reroute hides a structural problem that only synthesis or floorplan can solve.',
      '<b>Clock tree built before the floorplan is stable.</b> A CTS on a floorplan that then changes is work thrown away.',
    ],
  },

  'PD-06': {
    purpose: [
      'Close <b>timing across every corner and every mode</b>—setup, hold, cross-corner, cross-mode—and drive the violation burn-down that decides the tapeout date.',
      'Seventeen weeks and twenty-seven man-months, the largest activity in the stage. Multi-corner multi-mode closure on a low-power part is a long grind across more modes than most—performance, efficiency, sleep, retention and test—and its burn-down curve is the single best predictor the program has of whether it will tape out on time.',
    ],
  },

  'PD-07': {
    purpose: [
      'Build and refine the <b>clock trees</b> across turns—skew, insertion delay, jitter budget, power—for a design whose clocks run from the PLL in its active modes and from a slow oscillator in the always-on domain.',
      'Clock tree synthesis is rebuilt every turn and improved each time. Skew directly buys or costs timing margin; insertion delay costs power and OCV; and cross-domain paths need a defined phase relationship that only a deliberately built tree provides. It is one of the few areas where a good result is worth several percent of frequency and of active power.',
    ],
    risks: [
      '<b>Clock power ignored.</b> On a low-power part the clock network is often the largest single consumer of active power, and a tree optimized only for skew is paid for on every cycle.',
      '<b>Useful skew applied without a plan.</b> It buys margin and complicates every subsequent ECO, because moving one path\'s timing moves its neighbors\'.',
      '<b>Cross-domain phase relationship undefined.</b> Paths between domains—the always-on domain\'s slow clock into the main clock among them—cannot be closed reliably, and the failure appears as intermittent silicon behavior.',
      '<b>Insertion delay allowed to grow.</b> Deep trees increase OCV derate and jitter accumulation, consuming the margin the skew balancing bought.',
      '<b>Tree quality not checked.</b> Clock DRC violations—transition, capacitance, pulse width—degrade the tree in ways timing analysis reports as margin loss without explaining.',
    ],
  },

  'PD-08': {
    purpose: [
      'Route the design and drive it to <b>DRC clean</b>—global, detailed, antenna, via optimization—across every turn, on a die where routing resource is the scarcest commodity.',
      'Routing is where the floorplan, the synthesis and the power grid are all judged. Thirteen weeks and eighteen man-months buys convergence on a mature-node metal stack with few routing layers, where the fabric\'s interconnect makes congestion structural rather than local and every layer is contested between signals, clocks and the power grid.',
    ],
    flowNote:
      'Step 6 is iterative and asymptotic even on a mature node. The last few hundred violations—usually around the eMRAM, the analog macros and the pad ring, each with rules of its own—take as long as the first ten thousand, and they are the ones that need manual attention.',
  },

  'PD-12': {
    purpose: [
      'Close the <b>blocks independently and assemble them into a top level</b> that meets timing across their boundaries—a fabric tile hardened once and abutted into the array, and the control, memory and peripheral logic closed around it.',
      'Hierarchy here is about repetition more than size. A tile closed once and replicated converges faster and more predictably than an array closed flat, at the cost of boundary budgets that have to be right: a tile that closes internally and misses its boundary budget fails at every one of its copies.',
    ],
    risks: [
      '<b>Block models disagreeing with flat analysis.</b> The top level is then closed against an abstraction that does not represent the block.',
      '<b>Interface budgets set late.</b> Blocks close internally and fail at their boundaries, and the fix requires reopening blocks that were declared done.',
      '<b>Tile abutment not planned.</b> Tiles connect by abutment rather than by top-level routing, and a pin or rail mismatch at the tile edge repeats across the whole array.',
      '<b>Blocks closed to different criteria.</b> Without an enforced standard, each block closes to what its owner considered sufficient, and the top level inherits the weakest.',
      '<b>Top-level assembly left to the end.</b> Assembly finds interface problems, and finding them after the final turn leaves no time to fix them.',
    ],
  },

  'PD-14': {
    purpose: [
      'Fix what the routing did to the electricals—<b>crosstalk, noise, electromigration, dynamic IR</b>—before signoff has to reject the design for them.',
      'Signal and power integrity problems are created by routing and found by analysis. Crosstalk between adjacent nets, noise coupled into the oscillators, the regulator references and the eMRAM read path, EM in high-current wires and dynamic IR under real switching are all consequences of physical decisions, and fixing them means changing routing that was closed for timing.',
    ],
    consumes: [
      'Routed database from EPD-07',
      'PDN from EPD-03',
      'Switching activity from ESYN-09 and EDV-07',
      'Signoff SI/PI methodology from ESO-08',
      'Package electrical model from EPKG-04',
    ],
    risks: [
      '<b>SI analyzed after timing closes.</b> Crosstalk delay is timing, and closing without it means closing against numbers that will move.',
      '<b>Signal EM at the hot corner overlooked.</b> Clock and high-toggle nets at the industrial hot corner carry EM exposure too, and they are usually the ones nobody checks.',
      '<b>Dynamic IR analyzed with uniform activity.</b> Real switching is bursty and localized, and uniform assumptions understate the worst case badly.',
      '<b>Fixes applied without re-timing.</b> Shielding and spacing change delay, and a fix that breaks timing has moved the problem rather than solved it.',
      '<b>Package effects excluded.</b> Die-only dynamic IR is optimistic; <code>EPKG-04</code> with package inductance is the number signoff will use.',
    ],
    roles: [
      { r: 'SI/PI engineer', d: 'Owns crosstalk, noise, EM and IR analysis' },
      { r: 'Routing engineers', d: 'Apply spacing, shielding and width fixes' },
      { r: 'Power delivery engineer', d: 'PDN adjustments for dynamic IR' },
      { r: 'Timing engineer', d: 'Re-timing after SI fixes' },
      { r: 'Analog layout liaison', d: 'Noise sensitivity of the oscillators, regulators and eMRAM read path' },
    ],
  },

  'PD-15': {
    purpose: [
      'Run the <b>final turn on the FFN and close it completely</b>—timing, power, DRC, LVS—with no functional change admitted and no next turn to fall back on.',
      'Everything the stage has done is preparation for this. Twenty-five man-months over nine weeks, on a frozen netlist, closing every corner and every mode to signoff standard. The discipline that matters is refusing functional change: an ECO that alters behavior restarts verification, and there is no schedule for that.',
    ],
  },

  'PD-16': {
    consumes: [
      'Routed database from EPD-07 and EPD-13',
      'Seal ring and frame rules from EPDK-02',
      'Fill and density rules from the DRM',
      'Analog and eMRAM fill exclusions from PMU-05 and MRAM-05',
      'Die identification requirements from EMP-12',
    ],
    risks: [
      '<b>Timing signed off before fill.</b> The taped-out database has fill and the signed-off one did not, which is a signoff against a different design.',
      '<b>Fill applied over analog matching structures.</b> It disturbs the parasitics <code>PMU-05</code> tuned, and the damage is invisible until silicon characterization.',
      '<b>Seal ring area not reserved.</b> Discovered late, it forces the die edge inward and moves the pad ring.',
      '<b>Die identification omitted.</b> Traceability at yield analysis and field return depends on being able to identify the die, and it cannot be added later.',
      '<b>Finishing treated as a checkbox.</b> Each step changes the physical database, and each needs verification against what was closed.',
    ],
  },
};
