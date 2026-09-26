import type { ActivityWriteUp } from '../activityDetailTypes';

export const FCD_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'FCD-01': {
    criticalPath: true,
    purpose: [
      'Fix <b>the workloads the part will be judged on</b>—sensor fusion, filtering, always-on inference and control loops—ported to portable C/C++ and reference models, measured on the MCUs and DSPs customers use today, and frozen with the rules that score them.',
      'Every later trade-off in this stage is argued in energy per task against this suite, so a suite built from convenient kernels produces a fabric tuned for kernels. The baselines matter as much as the code: a claim of ten times better means nothing until the incumbent part has been measured on the same task, at the same duty cycle, with the same meter.',
    ],
    flowNote:
      'Step 1 collects the workloads by segment and step 2 ports them to portable sources. Step 3 measures the incumbents alongside the porting, because the reference boards can run the first ported workloads while the rest are still being written. Step 4 sets the targets once both the code and the baselines exist, and step 5 freezes the suite and its scoring rules.',
    consumes: [
      'Customer and market requirements from EDEF-01',
      'Incumbent parts and their published figures from EDEF-02',
      'Workload definition and KPI targets from EDEF-03',
      'Memory and peripheral requirements from EDEF-04',
      'Energy, performance and area targets from EDEF-05',
    ],
    rel: {
      'FCD-D1':
        '<b>Embedded workload and benchmark suite with energy baselines.</b> The suite, its incumbent baselines and its scoring rules are assembled and frozen here.',
      'FCD-D5':
        '<b>Cycle and energy model with accuracy bounds.</b> The model is exercised and judged on this suite, so its results are only as representative as the workloads in it.',
    },
    risks: [
      '<b>Showcase kernels instead of customer code.</b> A suite of hand-picked loops makes the fabric look good and says nothing about the firmware a customer actually brings.',
      '<b>Baselines measured at a different operating point.</b> Comparing the new part at its best mode against an incumbent at its default clock inflates every claim that follows.',
      '<b>Duty cycle left out.</b> Most of an embedded part’s life is asleep, and a suite that scores only active energy hides the sleep and wake costs that set battery life.',
      '<b>Reference models the compiler will never see.</b> Models picked from a public zoo rather than from target customers leave operator coverage gaps that surface at onboarding.',
      '<b>Suite reopened after the freeze.</b> Adding a workload in week fifteen moves every score and reopens the ISA review in FCD-02.',
    ],
    roles: [
      { r: 'Applications architect', d: 'Owns the suite, the targets and the scoring rules' },
      { r: 'Field applications engineer', d: 'Brings real customer workloads and duty cycles' },
      { r: 'Embedded software engineer', d: 'Ports each workload to portable C/C++' },
      { r: 'Lab measurement engineer', d: 'Energy and latency on the incumbent boards' },
      { r: 'Product manager', d: 'Approves the suite as the basis of the product claims' },
    ],
    effort: [
      ['Workload collection by segment', 0.75],
      ['Porting to portable C/C++ and reference models', 1.25],
      ['Incumbent energy and latency measurement', 1.25],
      ['Targets, scoring rules and freeze', 0.75],
    ],
    entry: [
      'Workload definition and KPI targets drafted in EDEF-03',
      'Target customer segments named in EDEF-01',
      'Incumbent evaluation boards and a calibrated current meter in the lab',
    ],
    exit: [
      'Every workload ported, running on an incumbent and carrying a measured baseline',
      'An energy-per-task and duty-cycle target set for each workload',
      'Suite and scoring rules frozen and released to architecture and compiler',
    ],
    dependsOn: ['EDEF-01', 'EDEF-03', 'EDEF-05'],
    dependsNote: null,
    feedsInto: ['FCD-02', 'FCD-03', 'FCD-05', 'CMP-01', 'EARCH-01'],
    measuredBy: [
      'Workloads traceable to a named customer or segment against total',
      'Workloads with a measured incumbent baseline against total',
      'Changes to the suite after the freeze',
    ],
    links: {
      dependsOn: ['EDEF-01', 'EDEF-02', 'EDEF-03', 'EDEF-04', 'EDEF-05'],
      feedsInto: ['FCD-02', 'FCD-03', 'FCD-05', 'CMP-01', 'EARCH-01'],
      runsWith: [],
      revisedBy: ['EAP-04'],
      feedsBackInto: [],
    },
    terms: ['KPI', 'MCU', 'DSP', 'LiteRT', 'ONNX'],
  },
  'FCD-02': {
    criticalPath: true,
    purpose: [
      'Define <b>what a processing element does and how the fabric is built from them</b>: the operations and datatypes, the size of the tile array and its operand network, how control flow and loops run spatially, and the small scalar path that boots the part and handles everything the fabric should not.',
      'On a statically scheduled dataflow fabric every operation left in the ISA costs area and leakage in every tile, whether or not the compiler ever emits it. The ISA is therefore written against the benchmark kernels from FCD-01 and trimmed to them, with the compiler architect in the room, rather than grown from a wish list.',
    ],
    flowNote:
      'Steps 1 to 3 run in sequence because each constrains the next: the operations set the tile size, and the tile and network set what control flow can cost. Step 4 defines the scalar control path alongside step 3, since boot, interrupts and debug do not depend on the fabric’s loop semantics. Step 5 reviews the whole ISA against the kernels, and step 6 releases it.',
    consumes: [
      'Frozen benchmark suite and energy targets from FCD-01',
      'Energy, performance and area targets from EDEF-05',
      'Process option and cell flavour from ETECH-05',
      'System partitioning between fabric, scalar path and peripherals from EARCH-02',
      'Compiler pass pipeline and infrastructure choice from CMP-01',
    ],
    rel: {
      'FCD-D2':
        '<b>Fabric ISA specification.</b> The operations, datatypes, array sizing, control semantics and scalar path are defined and released here.',
      'FCD-D4':
        '<b>Compiler–hardware contract.</b> The contract is written against this ISA, so every operation and guarantee in it has to exist here first.',
    },
    risks: [
      '<b>Operations added for a benchmark no customer runs.</b> Each one costs area and leakage in every tile, and the compiler may never find a use for it in ordinary code.',
      '<b>Array sized before the compiler can fill it.</b> A larger fabric only saves energy if the mapper can place real loops across it, and that is not known until CMP-04 has run the kernels.',
      '<b>Configuration memory undersized.</b> A kernel that does not fit must be reconfigured mid-loop, and the reconfiguration energy wipes out the gain the fabric was chosen for.',
      '<b>Scalar control path under-specified.</b> The fabric takes the attention, and boot, interrupt latency and debug are left to be settled during RTL.',
      '<b>Datatype set frozen without the model import view.</b> If INT8 and the accumulation width do not match what CMP-05 needs, every model pays a conversion cost.',
    ],
    roles: [
      { r: 'Chief architect', d: 'Owns the ISA and every trade-off in it' },
      { r: 'Compiler architect', d: 'Confirms the compiler can use each operation' },
      { r: 'Fabric microarchitect', d: 'Tile, operand network and configuration memory sizing' },
      { r: 'Scalar core architect', d: 'Boot, interrupts, peripherals and debug on the control path' },
      { r: 'Architecture review board', d: 'Approves the ISA for release' },
    ],
    effort: [
      ['Operations, datatypes and precision', 1.5],
      ['Tile array, network and configuration memory sizing', 2],
      ['Control flow, predication and loop semantics', 1.5],
      ['Scalar control path definition', 1.25],
      ['Kernel coverage review and release', 1.75],
    ],
    entry: [
      'Benchmark suite frozen in FCD-01',
      'Process option agreed in ETECH-05',
      'Compiler architect assigned and attending the ISA reviews',
    ],
    exit: [
      'Every operation traced to at least one benchmark kernel that uses it',
      'Tile array, network and configuration memory sized with the area and leakage cost stated',
      'Fabric ISA specification released under change control',
    ],
    dependsOn: ['FCD-01', 'ETECH-05', 'EARCH-02', 'CMP-01'],
    dependsNote: null,
    feedsInto: ['FCD-03', 'FCD-04', 'FCD-05', 'EARCH-04', 'CMP-02'],
    measuredBy: [
      'Operations with a kernel that uses them against total operations',
      'Fabric area and leakage estimate against the budget',
      'ISA changes requested after release',
    ],
    links: {
      dependsOn: ['FCD-01', 'EDEF-05', 'ETECH-05'],
      feedsInto: ['FCD-03', 'FCD-04', 'FCD-05', 'EARCH-04', 'EARCH-07', 'CMP-02'],
      runsWith: ['EARCH-02', 'CMP-01'],
      revisedBy: ['FCD-06'],
      feedsBackInto: [],
    },
    terms: ['ISA', 'PPA', 'RTL', 'INT8'],
  },
  'FCD-03': {
    criticalPath: true,
    purpose: [
      'Decide <b>where every byte lives and what it costs to reach it</b>: the split between eMRAM, SRAM banks and storage local to the fabric, the energy and latency of each access by distance, and the placement rules the compiler applies to the loads on the critical path.',
      'On a part sold on energy per task, moving data costs more than computing on it, so the memory model is as much a compiler input as a hardware one. It also sets how fast the part wakes: code and coefficients held in eMRAM survive deep sleep without being reloaded, and the read bandwidth from eMRAM decides how soon the fabric is running after a wake.',
    ],
    flowNote:
      'Step 1 partitions the memory and step 2 models the cost of each access from it. Step 3 turns that model into placement rules, and step 4 sets the eMRAM bandwidth and wake budget alongside it, because the power and eMRAM teams need that number before the rules are finished. Step 5 releases the model.',
    consumes: [
      'Working-set and footprint of each benchmark from FCD-01',
      'Tile array and fabric-local storage sizing from FCD-02',
      'Memory and peripheral requirements from EDEF-04',
      'eMRAM macro candidates and configurations from MRAM-01',
      'SRAM compiler instances and their energy data from EPDK-05',
    ],
    rel: {
      'FCD-D3':
        '<b>Memory access and placement model.</b> The partition, the access cost map and the placement rules are defined and released here.',
      'FCD-D4':
        '<b>Compiler–hardware contract.</b> The placement rules become an obligation of the compiler in the contract, so they have to be rules it can apply.',
    },
    risks: [
      '<b>Placement rules the compiler cannot apply.</b> A rule that needs whole-program knowledge the scheduler does not have stays on paper while the energy claims assume it.',
      '<b>eMRAM read energy taken from the datasheet typical.</b> Execution from eMRAM is read-dominated, and a worst-corner read cost can double the energy of a workload that runs from it.',
      '<b>Wake budget not agreed with the power manager.</b> If the always-on domain cannot hold the pointers and state the fabric expects, every wake starts with a reload.',
      '<b>SRAM retention cost ignored.</b> Banks kept alive in sleep leak at every hour of battery life, and the partition has to say which are retained and which are not.',
      '<b>Access costs modelled only at the nominal voltage.</b> The part runs across efficiency and performance modes, and the ranking of memories by cost can change between them.',
    ],
    roles: [
      { r: 'Memory architect', d: 'Owns the partition, the access model and the rules' },
      { r: 'Compiler architect', d: 'Confirms each placement rule can be applied' },
      { r: 'Memory IP lead', d: 'eMRAM macro configuration and read characteristics' },
      { r: 'Power architect', d: 'Retention and wake budget in the sleep modes' },
      { r: 'Chief architect', d: 'Approves the model for release' },
    ],
    effort: [
      ['Memory partition across eMRAM, SRAM and fabric-local', 0.75],
      ['Access energy and latency model', 1.5],
      ['Compiler placement rules', 1.5],
      ['eMRAM bandwidth and wake budget', 0.75],
      ['Review and release', 0.5],
    ],
    entry: [
      'Tile array sizing drafted in FCD-02',
      'eMRAM macro candidates shortlisted in MRAM-01',
      'Benchmark working sets measured in FCD-01',
    ],
    exit: [
      'Access energy and latency stated for every memory and port distance',
      'Each placement rule accepted by the compiler architect as implementable',
      'eMRAM bandwidth and wake budget agreed with the power and eMRAM owners',
    ],
    dependsOn: ['FCD-01', 'FCD-02', 'MRAM-01', 'EPDK-05'],
    dependsNote: null,
    feedsInto: ['FCD-04', 'FCD-05', 'MRAM-02', 'EARCH-04', 'CMP-04'],
    measuredBy: [
      'Benchmark energy spent on data movement against the model',
      'Placement rules implemented in the scheduler against total',
      'Wake-to-first-instruction time against the budget',
    ],
    links: {
      dependsOn: ['FCD-01', 'FCD-02', 'EDEF-04'],
      feedsInto: ['FCD-04', 'FCD-05', 'MRAM-02', 'EARCH-04', 'CMP-04'],
      runsWith: ['MRAM-01', 'EPDK-05', 'PMU-01'],
      revisedBy: ['FCD-06'],
      feedsBackInto: [],
    },
    terms: ['eMRAM', 'SRAM', 'XIP'],
  },
  'FCD-04': {
    criticalPath: true,
    purpose: [
      'Write down and sign <b>the contract between the silicon and the compiler</b>: the dataflow IR the compiler lowers to, the configuration binary and its loader, the scheduling guarantees the hardware must honour, the debug and energy-counter hooks, and the ABI with the scalar core.',
      'A statically scheduled fabric has no hardware to paper over a mismatch: if the compiler assumes a latency the silicon does not deliver, the program is wrong rather than slow. The contract is what lets the RTL team and the compiler team work for a year in parallel and meet on the first FPGA image, and it is signed by both leads for that reason.',
    ],
    flowNote:
      'Step 1 defines the IR and step 2 the configuration format it compiles to; step 3 then states what timing the hardware guarantees for that format. Step 4 defines the debug and energy hooks alongside step 3 because they touch the format but not the guarantees. Step 5 agrees the ABI with the scalar core, and step 6 has both teams sign.',
    consumes: [
      'Fabric ISA and configuration memory sizing from FCD-02',
      'Placement rules from FCD-03',
      'Compiler pass pipeline and GCC/Clang compatibility specification from CMP-01',
      'Dataflow and memory hierarchy definition from EARCH-04',
      'Security architecture — who may load a configuration — from EARCH-05',
    ],
    rel: {
      'FCD-D4':
        '<b>Compiler–hardware contract.</b> The IR, format, guarantees, hooks and ABI are specified and signed here.',
      'FCD-D6':
        '<b>Fabric and compiler co-design freeze package.</b> The signed contract is the centre of the freeze package, and the freeze is what puts it under change control.',
    },
    risks: [
      '<b>Latency guarantees written as typical values.</b> A static schedule built on a typical latency fails silently on the corner where the hardware is slower.',
      '<b>Configuration format with no version field.</b> The first format change after tapeout then breaks every binary already in the field.',
      '<b>Debug hooks dropped for area.</b> Without breakpoints and per-region energy counters on the fabric, the debugger and profiler in CMP-06 can only guess.',
      '<b>ABI settled late.</b> Calls between scalar code and fabric regions are in every program, and an ABI change after the front end is built touches all of them.',
      '<b>Contract signed by one side.</b> A contract the RTL lead has not signed is a compiler wish list, and the first FPGA image will show it.',
    ],
    roles: [
      { r: 'Compiler architect', d: 'Owns the contract and drafts every section' },
      { r: 'Chief architect', d: 'Signs for the hardware side' },
      { r: 'RTL design lead', d: 'Confirms each guarantee can be built and verified' },
      { r: 'Debug and tools lead', d: 'Breakpoint, trace and energy-counter hooks' },
      { r: 'Security architect', d: 'Authentication of configuration binaries at load' },
    ],
    effort: [
      ['Dataflow IR as an MLIR dialect', 1.5],
      ['Configuration binary format and loader', 1.5],
      ['Static scheduling guarantees', 1],
      ['Debug and energy-counter hooks', 1],
      ['ABI, review and signature', 1],
    ],
    entry: [
      'Fabric ISA drafted in FCD-02',
      'Compiler pass pipeline defined in CMP-01',
      'Placement rules drafted in FCD-03',
    ],
    exit: [
      'Every scheduling guarantee stated at the worst corner, with how it is verified',
      'Configuration format versioned and its loader specified',
      'Contract signed by the compiler architect and the chief architect',
    ],
    dependsOn: ['FCD-02', 'FCD-03', 'CMP-01'],
    dependsNote: null,
    feedsInto: ['FCD-06', 'CMP-02', 'CMP-04', 'CMP-06', 'ERTL-01', 'VP-01'],
    measuredBy: [
      'Open contract items at the co-design freeze',
      'Contract changes after RTL starts',
      'Mismatches between compiler and RTL found on the first FPGA image',
    ],
    links: {
      dependsOn: ['FCD-02', 'FCD-03', 'CMP-01'],
      feedsInto: ['FCD-06', 'CMP-02', 'CMP-04', 'CMP-06', 'ERTL-01', 'VP-01'],
      runsWith: ['EARCH-04', 'EARCH-05'],
      revisedBy: ['FCD-06'],
      feedsBackInto: [],
    },
    terms: ['MLIR', 'ABI', 'ISA', 'JTAG'],
  },
  'FCD-05': {
    criticalPath: true,
    purpose: [
      'Build <b>the cycle and energy model every claim about the part rests on</b>: a cycle-level model of the fabric and its memories, energy per operation and per access from the library data, the benchmark suite run through it with the compiler prototype, and a plan to correlate it against RTL, the FPGA prototype and silicon.',
      'Until silicon exists, every energy-per-task figure on a slide comes from this model, so its accuracy has to be stated rather than assumed. The correlation plan is written now, with bounds the model must meet at each stage, so that a gap found on the FPGA or on first silicon is a measured error with an owner and not a surprise.',
    ],
    flowNote:
      'Step 1 builds the cycle model and step 2 attaches energy to it. Step 3 runs the benchmark suite through the model and the compiler prototype, and step 4 plans correlation alongside, because the plan depends on what the model covers rather than on its first results. Step 5 releases the model with its accuracy bounds.',
    consumes: [
      'Benchmark suite and targets from FCD-01',
      'Fabric ISA and array sizing from FCD-02',
      'Memory access cost map from FCD-03',
      'Standard cell energy and leakage data from EPDK-03',
      'Early compiler front end for the benchmark kernels from CMP-02',
    ],
    rel: {
      'FCD-D5':
        '<b>Cycle and energy model with accuracy bounds.</b> The model, its energy table, its benchmark results and its correlation plan are built and released here.',
      'FCD-D6':
        '<b>Fabric and compiler co-design freeze package.</b> The architecture is scored against the targets using this model, so the freeze is only as sound as its accuracy bounds.',
    },
    risks: [
      '<b>Energy claims resting on an uncorrelated model.</b> Figures quoted to customers before the model has met RTL become commitments the silicon may not keep.',
      '<b>Leakage left out.</b> Active energy dominates the benchmarks but leakage dominates battery life, and a model without it ranks the architectures wrongly.',
      '<b>Compiler prototype results read as final.</b> An early mapper places poorly, and blaming the fabric for it leads to hardware changes the compiler would have made unnecessary.',
      '<b>No accuracy bound per stage.</b> Without a stated tolerance at RTL, FPGA and silicon, nobody can say when a gap is large enough to act on.',
      '<b>Model forked by each team.</b> Architecture, compiler and power each tune a private copy, and the numbers stop agreeing within a month.',
    ],
    roles: [
      { r: 'Performance architect', d: 'Owns the model, its bounds and the correlation plan' },
      { r: 'Modelling engineer', d: 'Cycle-level fabric and memory model' },
      { r: 'Power analysis engineer', d: 'Energy per operation and access from library data' },
      { r: 'Compiler engineer', d: 'Runs the benchmarks through the compiler prototype' },
      { r: 'Chief architect', d: 'Approves the model and its bounds for the freeze' },
    ],
    effort: [
      ['Cycle-level fabric and memory model', 2],
      ['Energy table from library data', 1.25],
      ['Benchmark runs with the compiler prototype', 1.5],
      ['Correlation plan across RTL, FPGA and silicon', 0.75],
      ['Accuracy bounds and release', 0.5],
    ],
    entry: [
      'Benchmark suite frozen in FCD-01',
      'Fabric ISA drafted in FCD-02',
      'Library energy and leakage data available from EPDK-03',
    ],
    exit: [
      'Every benchmark run through the model with energy and cycles reported',
      'Accuracy bound stated for each correlation stage',
      'One released model shared by architecture, compiler and power',
    ],
    dependsOn: ['FCD-01', 'FCD-02', 'FCD-03', 'EPDK-03'],
    dependsNote: null,
    feedsInto: ['FCD-06', 'CMP-03', 'PMU-06', 'EDV-10', 'CREL-01'],
    measuredBy: [
      'Model error against RTL simulation on the benchmark suite',
      'Benchmarks meeting their energy target in the model',
      'Correlation checkpoints met on time',
    ],
    links: {
      dependsOn: ['FCD-01', 'FCD-02', 'FCD-03', 'EPDK-03'],
      feedsInto: ['FCD-06', 'CMP-03', 'PMU-06', 'EDV-10', 'CREL-01'],
      runsWith: ['EARCH-01', 'CMP-02'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['RTL', 'FPGA', 'PPA'],
  },
  'FCD-06': {
    criticalPath: true,
    purpose: [
      'Score the architecture against the benchmark targets and <b>freeze the fabric, the memory model and the compiler contract together</b>, with every trade-off between compiler complexity and hardware area closed and recorded.',
      'The three are frozen as one because each is written in terms of the others: an ISA change moves the contract, and a placement rule change moves the energy model. Freezing them separately lets one reopen the others after RTL has started, which on a dataflow part means the silicon ships with features the compiler never uses.',
    ],
    flowNote:
      'Step 1 scores the architecture in the model against the targets, and step 2 closes the open trade-offs the score exposes. Step 3 records each decision alongside step 2, as it is made, rather than reconstructing the reasoning afterwards. Step 4 freezes all three artefacts in a single review.',
    consumes: [
      'Benchmark scoring rules and targets from FCD-01',
      'Fabric ISA specification from FCD-02',
      'Memory access and placement model from FCD-03',
      'Signed compiler–hardware contract from FCD-04',
      'Benchmark results and accuracy bounds from FCD-05',
    ],
    rel: {
      'FCD-D6':
        '<b>Fabric and compiler co-design freeze package.</b> The scorecard, the decision record and the frozen ISA, model and contract are assembled and released here.',
    },
    risks: [
      '<b>Contract reopened after RTL starts.</b> A freeze that allows ‘small’ changes invites them, and each one lands in the RTL and the compiler at the same time.',
      '<b>Targets missed and the freeze held anyway.</b> Freezing an architecture that misses its energy targets in the model moves the problem to silicon, where it costs a respin.',
      '<b>Trade-offs closed without the compiler team.</b> Area saved by pushing work into the compiler is only saved if the compiler can do it by the alpha.',
      '<b>Decisions not recorded.</b> Without what each choice was made over, the same debate is reopened by every new engineer.',
      '<b>Freeze out of step with the architecture freeze.</b> If EARCH-07 freezes the rest of the chip on an older fabric definition, the two specifications disagree from day one.',
    ],
    roles: [
      { r: 'Chief architect', d: 'Owns the review and the freeze' },
      { r: 'Compiler architect', d: 'Signs the compiler side of every trade-off' },
      { r: 'Performance architect', d: 'Presents the scorecard and its accuracy' },
      { r: 'Program manager', d: 'Change control from the freeze onward' },
      { r: 'VP of engineering', d: 'Approves the freeze' },
    ],
    effort: [
      ['Scorecard against the benchmark targets', 0.75],
      ['Trade-off closure', 1],
      ['Decision record', 0.5],
      ['Freeze review and package', 0.75],
    ],
    entry: [
      'ISA, placement model and contract released from FCD-02, FCD-03 and FCD-04',
      'Model released with accuracy bounds from FCD-05',
      'Compiler and hardware leads available for the review',
    ],
    exit: [
      'Every benchmark target met in the model or its miss accepted in writing',
      'No open trade-off between compiler and hardware',
      'ISA, placement model and contract frozen together under change control',
    ],
    dependsOn: ['FCD-01', 'FCD-02', 'FCD-03', 'FCD-04', 'FCD-05'],
    dependsNote:
      'The freeze is the convergence point of the stage — it consumes every other FCD activity and cannot close before the slowest of them.',
    feedsInto: ['EARCH-07', 'ERTL-01', 'CMP-02', 'CMP-04', 'VP-01', 'EDV-01'],
    measuredBy: [
      'Benchmark targets met in the model at freeze',
      'Change requests against the freeze package after RTL starts',
      'Freeze date against plan',
    ],
    links: {
      dependsOn: ['FCD-01', 'FCD-02', 'FCD-03', 'FCD-04', 'FCD-05'],
      feedsInto: ['EARCH-07', 'ERTL-01', 'CMP-02', 'CMP-04', 'VP-01', 'EDV-01'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['ISA', 'MLIR', 'RTL'],
  },
};
