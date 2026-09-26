import type { WriteUpEdit } from './types';

/** DV: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const DV_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'DV-01': {
    purpose: [
      'Write the plan that says <b>what will be verified, how, and how anyone will know it is done</b>—feature by feature, with a coverage model behind each claim, and with the split between simulation, formal and the FPGA prototype stated per feature.',
      'Verification is the largest line of effort in the design phase, and without a plan it is some two hundred and forty man-months of activity with no definition of completion. The coverage model is what turns "we tested it" into a measurable statement, and the features nobody writes into the plan are the features nobody verifies.',
    ],
    consumes: [
      'Architecture specification from ARCH-07',
      'Block specifications from RTL-01',
      'Register map from RTL-04',
      'Compiler–hardware contract from FCD-04',
      'Scope split with the FPGA prototype, agreed with FPV-01',
      'IP verification collateral requirements from IPR-07',
      'Compute capacity model from PDK-10',
    ],
  },

  'DV-02': {
    purpose: [
      'Build the <b>verification environment</b>—UVM agents, scoreboards, reference models, sequences, VIP integration—that every test in the program will run inside.',
      'The environment is infrastructure with a long lead time and no visible output until it works. The effort buys agents for the system bus and each serial peripheral, a scoreboard for the fabric that checks against the compiler’s functional simulator rather than a second hand-written model, and reusable sequences. Testbench bring-up running late is the single most common reason verification starts late, and it starts late invisibly.',
    ],
    consumes: [
      'Verification plan from DV-01',
      'Block and interface specifications from RTL-01',
      'Register description source from RTL-04',
      'Functional simulator from CMP-03, as the fabric reference model',
      'VIP licences from IPR-06',
      'Methodology standards and reuse libraries',
    ],
  },

  'DV-04': {
    risks: [
      '<b>Bugs deferred without risk assessment.</b> An unassessed open bug at tapeout is a risk nobody quantified being accepted by nobody in particular.',
      '<b>Severity assigned by the finder.</b> Consistent severity requires a board; without one, the same defect is critical in one block and minor in another.',
      '<b>Bug rate still rising at closure.</b> A find rate that has not turned over means the design has more defects than have been found, whatever the coverage says.',
      '<b>No escape analysis.</b> The process that let a bug survive to the end of the stage will let the next one survive too.',
      '<b>Errata list assembled after tapeout.</b> Bring-up needs the known-issue list on day one, and assembling it later means debugging problems that were already known.',
    ],
    flowNote:
      'Step 6 is the loop that improves the process rather than the design. Asking why a bug found in the last weeks was not found in the first usually points at a missing coverage point or an untested mode—often a sleep mode or a wake source—and fixing that finds the next one earlier.',
    consumes: [
      'Defects from every DV activity and from the FPGA prototype in FPV-05',
      'Coverage and closure status from DV-07',
      'Change control decisions from RTL-03',
      'Silicon debug capability from DFT-04',
      'Tapeout criteria from the program plan',
    ],
    effortLabels: [
      'Continuous triage and disposition',
      'Open bug list and risk statement',
      'Deferred bug risk assessment',
      'Trend analysis',
      'Escape analysis',
      'DV closure statement',
    ],
  },

  'DV-05': {
    purpose: [
      'Verify every block against its specification with <b>constrained-random and directed testing</b>, and drive each one to its coverage closure criteria.',
      'The largest activity in the stage, spread across every block in the design, and its weight falls unevenly: the processing element and fabric tile carry most of it, because a defect there is replicated in every tile, and the configurations the compiler emits are the stimulus that matters most. This is where most bugs are found and most verification time is spent, and its efficiency is set almost entirely by decisions taken in <code>DV-01</code> and <code>DV-02</code>.',
    ],
  },

  'DV-08': {
    consumes: [
      'Top-level RTL from RTL-10',
      'Block signoffs from DV-05',
      'Workload suite from DEF-03, compiled by CMP-04',
      'Operating modes, sleep states and wake sources from ARCH-06 and PMU-04',
      'Chip-level coverage model from DV-01',
    ],
    risks: [
      '<b>Started too late because blocks are not ready.</b> Chip-level defects take longest to find and fix, and compressing the window pushes them into silicon.',
      '<b>Scenarios written by verification alone.</b> Realistic use comes from the workload suite, the compiler and the SDK; invented scenarios test what verification imagined.',
      '<b>Deadlock and arbitration untested.</b> These fail only under contention, which random block-level stimulus does not create.',
      '<b>Power transitions verified functionally only.</b> Retention, isolation and wake across a real sleep entry and exit are where low-power designs actually fail.',
      '<b>Simulation too slow to run meaningful scenarios.</b> If a boot takes a day, the scenario set shrinks to what fits, and the long scenarios belong on the FPGA prototype in <code>FPV-04</code>.',
    ],
    flowNote:
      'Step 7 runs the DEF-03 workloads as the compiler actually emits them, the same workloads ARCH-01 and FCD-05 modelled. Running them in simulation is slow and worth it: it is the only place before silicon where the design, the compiler, the model and the product’s actual intent are compared against each other.',
    terms: ['RTL', 'DV'],
  },

  'DV-09': {
    purpose: [
      'Verify the <b>boundary between the analog and eMRAM macros and the digital design</b>—control interfaces, trim and calibration sequences, power-on reset, brown-out and startup ordering—with the analog represented by models correlated to its circuits.',
      'Analog blocks fail where they meet digital. A PLL that locks perfectly and a controller that sequences perfectly can still disagree about when lock is valid; a regulator and a power-on reset can disagree about when the supply is good. Co-simulation is where those disagreements appear, and the alternative is finding them at bring-up with an oscilloscope.',
    ],
    flowNote:
      'Step 2 decides whether any of this is meaningful. Verification against a behavioural model that does not match the circuit proves the digital side works with a fiction, and the model checks the analog team runs in PMU-05 and PMU-06 are what make the model a proxy rather than a guess.',
    consumes: [
      'PMU and oscillator behavioural models from PMU-05',
      'eMRAM macro model and trim interface from MRAM-05',
      'Integrated analog and eMRAM macros from RTL-07',
      'Startup, brown-out and wake sequencing requirements from PMU-03 and PMU-04',
      'Verification environment from DV-02',
    ],
    risks: [
      '<b>Models never correlated.</b> Digital passes against a fiction, and the mismatch reaches silicon as a bring-up failure nobody predicted.',
      '<b>Calibration sequences untested from the digital side.</b> A trim or calibration that works when the analog engineer drives it manually is first exercised by firmware at bring-up.',
      '<b>Ready and lock signaling assumed.</b> When a lock or supply-good signal becomes valid is a contract; each side assuming a different answer produces intermittent boot and wake failures.',
      '<b>Degraded modes unverified.</b> What the digital side does when a PLL fails to lock or the supply browns out is behavior that only matters in the field, where it matters a great deal.',
      '<b>Co-simulation too slow to regress.</b> Run once and never again, it cannot catch a later change on either side.',
    ],
    entry: [
      'Behavioural models released by PMU-05 and MRAM-05',
      'Analog and eMRAM macros integrated in RTL-07',
      'Co-simulation tools available and qualified',
    ],
    terms: ['PLL', 'AMS', 'POR', 'eMRAM', 'RTL', 'DV'],
  },

  'DV-10': {
    purpose: [
      'Verify the design <b>against its power intent</b>—isolation, retention, level shifting, power sequencing, sleep entry and wake—because none of it is visible in a normal functional simulation.',
      'A design that passes every functional test can still corrupt state on a power-down, drive an isolated domain, or fail to retain what it needed. On this part the sleep modes are the product: a retention flop that loses state or a wake source outside the always-on domain turns a battery-life claim into a reset. Low-power verification simulates the domains actually powering down, and it is the only place these failures appear before silicon.',
    ],
    consumes: [
      'UPF power intent from RTL-06',
      'Operating modes and sleep states from ARCH-06 and PMU-01',
      'Always-on domain and wake sources from PMU-04',
      'Verification environment from DV-02',
      'Power management controller RTL from RTL-06',
      'Low-power tool support from PDK-07',
    ],
    risks: [
      '<b>Only static checking performed.</b> Structural UPF checks find missing cells; only simulation finds a design that corrupts state when the domain actually goes down.',
      '<b>Retention verified for the intended state only.</b> What is not retained matters as much as what is, and a design that retains too little fails on resume.',
      '<b>Wake tested from one sleep mode only.</b> Each wake source has to bring the part out of every mode it is specified for, deep sleep included, and the path that differs is the one left untested.',
      '<b>Power sequences tested in isolation.</b> The failure is usually a sleep request arriving during activity, not a clean idle transition.',
      '<b>Power-aware simulation excluded from regression.</b> It is slow, so it gets run once; a later RTL change then breaks it silently.',
      '<b>UPF used for verification differing from synthesis.</b> Two versions of the intent means verifying one design and building another.',
    ],
    exit: [
      'Domains simulated powering down, not only statically checked',
      'Retention verified for both what is kept and what is not',
      'Every wake source verified from every sleep mode it is specified for',
      'Power-aware tests running in the regular regression',
    ],
  },

  'DV-11': {
    purpose: [
      'Check that the design <b>actually delivers the energy and performance the architecture promised</b>—cycles per task, fabric utilization, memory accesses and the energy they imply—against the same workloads <code>ARCH-01</code> and <code>FCD-05</code> modelled.',
      'Functional correctness and efficiency are separate questions, and passing every test says nothing about the second. A design that computes correctly but spends 40% more energy per task than modelled misses the KPI the product is sold on, and finding that in silicon leaves no options.',
    ],
    consumes: [
      'FPGA prototype and its workload runs from FPV-04',
      'Compiled workloads from CMP-04',
      'Workload suite from DEF-03',
      'Performance model and predictions from ARCH-01',
      'Cycle and energy model from FCD-05',
      'Chip-level environment from DV-08',
      'KPI targets from DEF-03',
    ],
    rel: {
      'DV-D8':
        '<b>DV closure signoff package.</b> Energy and performance evidence is part of tapeout readiness—functional closure alone does not say the product meets its energy-per-task and battery-life KPIs.',
    },
    risks: [
      '<b>Energy treated as a bring-up activity.</b> Discovered in silicon, an energy or cycle shortfall has no remaining fix except software and marketing.',
      '<b>Measured only on hand-written kernels.</b> Kernels exercise the fabric; workloads as the compiler emits them exercise the product, and only the second predicts battery life.',
      '<b>Model and RTL disagreement left unresolved.</b> Whichever is wrong, not knowing which means every downstream projection is unreliable.',
      '<b>Bottlenecks found without root cause.</b> Knowing a task costs too much is not actionable; knowing which stall or memory access dominates is.',
      '<b>No time left to act.</b> Findings that arrive after RTL freeze can only be documented, not fixed.',
    ],
    roles: [
      { r: 'Performance verification lead', d: 'Owns measurement and correlation' },
      { r: 'Performance architect', d: 'Model comparison and reconciliation' },
      { r: 'FPGA prototyping engineers', d: 'Workload execution at usable speed' },
      { r: 'Fabric designers', d: 'Bottleneck root cause' },
      { r: 'Chief architect', d: 'Decides between design change and model correction' },
    ],
    effortLabels: [
      'Cycle, utilization and access measurement',
      'Workload execution',
      'Bottleneck analysis',
      'Model correlation',
      'Latency analysis',
      'Findings and reconciliation',
    ],
    entry: [
      'FPGA prototype running the workloads in FPV-04',
      'Chip-level environment available from DV-08',
      'Performance and energy model predictions available from ARCH-01 and FCD-05',
    ],
    measuredBy: [
      'Measured cycles and estimated energy per task against modelled',
      'Bottlenecks with an identified root cause',
      'Weeks between findings and RTL freeze',
    ],
    terms: ['KPI', 'RTL', 'DV', 'FPGA'],
  },
};
