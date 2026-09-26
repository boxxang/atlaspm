import type { ActivityWriteUp } from '../activityDetailTypes';

export const CMP_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'CMP-01': {
    criticalPath: true,
    purpose: [
      'Set <b>how the compiler is built and what each release has to prove</b>: LLVM, MLIR and the Clang driver as the infrastructure, the pass pipeline from C/C++ to a fabric configuration, what drop-in compatibility with GCC and Clang means in flags, linker scripts and pragmas, and the criteria for alpha, beta and 1.0.',
      'The customer does not buy a fabric, they buy the afternoon it takes to get their existing firmware running on it. That makes drop-in compatibility a product requirement rather than a nicety, and it makes the release criteria the only defence against an alpha that compiles the benchmarks and nothing else.',
    ],
    flowNote:
      'Step 1 fixes the infrastructure and step 2 builds the pass pipeline on it. Step 3 defines the compatibility surface, and step 4 sets the release criteria alongside it, because both are read from the same customer requirements and neither depends on the other. Step 5 releases the plan.',
    consumes: [
      'Customer toolchain and build-system requirements from EDEF-01',
      'Incumbent toolchains and what customers expect of them from EDEF-02',
      'Workload definition and KPI targets from EDEF-03',
      'Benchmark suite and reference models from FCD-01',
      'Early fabric ISA drafts from FCD-02',
    ],
    rel: {
      'CMP-D1':
        '<b>Compiler architecture and release plan.</b> The infrastructure, pass pipeline, compatibility surface and release criteria are defined and released here.',
    },
    risks: [
      '<b>Compatibility assumed rather than specified.</b> ‘Drop-in for GCC’ means nothing until the flags, attributes, inline assembly and linker scripts that customer builds use are listed and tested.',
      '<b>Pass pipeline designed before the ISA settles.</b> A pipeline built around a fabric that changes at the co-design freeze has to be restructured mid-build.',
      '<b>Release criteria written around the benchmarks.</b> An alpha gate that only counts showcase kernels lets the compiler ship without handling ordinary firmware.',
      '<b>LLVM version not pinned.</b> Tracking the upstream head costs a merge every few weeks, and not tracking it strands the compiler on an old base.',
      '<b>Scalar path treated as an afterthought.</b> Most customer code runs on the scalar core, and a pipeline that only plans for the fabric leaves it with a poor back end.',
    ],
    roles: [
      { r: 'Compiler architect', d: 'Owns the architecture and the release plan' },
      { r: 'Compiler engineer', d: 'Pass pipeline design and LLVM integration' },
      { r: 'Applications engineer', d: 'Customer build systems and compatibility cases' },
      { r: 'Chief architect', d: 'Consistency with the fabric ISA being defined' },
      { r: 'Product manager', d: 'Approves the release criteria' },
    ],
    effort: [
      ['Infrastructure choice — LLVM, MLIR, Clang', 0.75],
      ['Pass pipeline from source to configuration', 1.25],
      ['GCC/Clang compatibility specification', 1],
      ['Alpha, beta and 1.0 release criteria', 0.5],
      ['Review and release', 0.5],
    ],
    entry: [
      'Benchmark suite in progress in FCD-01',
      'Customer segments and toolchain expectations from EDEF-01',
      'Compiler architect and first engineers staffed',
    ],
    exit: [
      'Compatibility surface listed and tied to real customer builds',
      'Release criteria for alpha, beta and 1.0 agreed with product management',
      'Architecture and release plan released to the compiler team and co-design',
    ],
    dependsOn: ['EDEF-01', 'FCD-01'],
    dependsNote: null,
    feedsInto: ['CMP-02', 'CMP-03', 'CMP-07', 'FCD-04'],
    measuredBy: [
      'Customer build cases covered by the compatibility specification',
      'Release criteria that can be tested automatically against total',
      'Pass pipeline changes after the co-design freeze',
    ],
    links: {
      dependsOn: ['EDEF-01', 'EDEF-02', 'EDEF-03', 'FCD-01'],
      feedsInto: ['CMP-02', 'CMP-03', 'CMP-04', 'CMP-07', 'FCD-04'],
      runsWith: ['FCD-02'],
      revisedBy: ['FCD-06'],
      feedsBackInto: [],
    },
    terms: ['LLVM', 'MLIR', 'ABI'],
  },
  'CMP-02': {
    criticalPath: true,
    purpose: [
      'Build <b>the front end that takes ordinary C and C++ and finds the parts worth running on the fabric</b>: Clang and the target description, the lowering of LLVM IR into the dataflow dialect, the pass that extracts loops and regions to run spatially, and the scalar code generation for everything else.',
      'The extraction pass decides how much of a program benefits from the fabric at all. A region left on the scalar path runs correctly but at scalar energy, so the fraction of runtime the front end extracts on real code, not the benchmark kernels, is the number that sets how much of the energy claim a customer ever sees.',
    ],
    flowNote:
      'Step 1 brings up Clang and the target, and step 2 lowers LLVM IR into the dataflow dialect. Step 3 extracts the spatial regions, and step 4 builds scalar code generation alongside it, because the scalar path takes whatever step 3 leaves and the two can be developed against the same IR. Step 5 passes the benchmark kernels through the front end.',
    consumes: [
      'Pass pipeline and compatibility specification from CMP-01',
      'Fabric ISA specification from FCD-02',
      'Dataflow IR dialect and ABI from FCD-04',
      'Benchmark kernels from FCD-01',
      'Frozen co-design package from FCD-06',
    ],
    rel: {
      'CMP-D2':
        '<b>Front end and dataflow extraction on LLVM and MLIR.</b> The Clang front end, the lowering, the region extraction and the scalar code generation are built and released here.',
    },
    risks: [
      '<b>Extraction tuned to the benchmarks.</b> Hand-shaped kernels extract cleanly, while customer code with pointers, function calls and irregular loops stays on the scalar path.',
      '<b>Aliasing handled conservatively.</b> Without good alias analysis most loops look unsafe to spread across the fabric, and the extracted fraction collapses on real code.',
      '<b>Scalar code quality neglected.</b> Startup, drivers and control code run on the scalar core, and a weak scalar back end makes the whole part look slow.',
      '<b>Dialect drifting from the contract.</b> Front-end engineers extend the IR for convenience, and the back end and hardware stop agreeing on its meaning.',
      '<b>Customer build flags failing at the driver.</b> A front end that rejects a common flag or attribute fails the first build and never gets to the fabric.',
    ],
    roles: [
      { r: 'Compiler engineer', d: 'Owns the front end, the lowering and the extraction' },
      { r: 'Compiler architect', d: 'IR design and consistency with the contract' },
      { r: 'Scalar back-end engineer', d: 'Code generation for the scalar path' },
      { r: 'Applications engineer', d: 'Real customer code for extraction testing' },
      { r: 'Compiler lead', d: 'Approves each front-end release' },
    ],
    effort: [
      ['Clang front end and target description', 4],
      ['LLVM IR to dataflow dialect lowering', 6],
      ['Spatial region extraction', 6],
      ['Scalar path code generation', 2.5],
      ['Benchmark kernel bring-through', 1.5],
    ],
    entry: [
      'Compiler architecture released from CMP-01',
      'Dataflow IR and ABI signed in FCD-04',
      'Benchmark kernels available from FCD-01',
    ],
    exit: [
      'Every benchmark kernel compiled with its fabric regions extracted',
      'Scalar code passing the conformance suite',
      'Extracted fraction of runtime reported on a set of customer code, not only the kernels',
    ],
    dependsOn: ['CMP-01', 'FCD-02', 'FCD-04'],
    dependsNote: null,
    feedsInto: ['CMP-04', 'CMP-05', 'CMP-06', 'SDK-01'],
    measuredBy: [
      'Fraction of runtime extracted to the fabric on customer code',
      'Conformance suite pass rate on the scalar path',
      'Customer builds that compile without source changes',
    ],
    links: {
      dependsOn: ['CMP-01', 'FCD-01', 'FCD-02', 'FCD-04'],
      feedsInto: ['CMP-04', 'CMP-05', 'CMP-06', 'SDK-01'],
      runsWith: ['CMP-03', 'FCD-05'],
      revisedBy: ['FCD-06'],
      feedsBackInto: [],
    },
    terms: ['LLVM', 'MLIR', 'ISA', 'ABI'],
  },
  'CMP-03': {
    criticalPath: true,
    purpose: [
      'Build <b>the simulator that runs compiled programs before any silicon exists</b>: instruction-accurate for the scalar path and the fabric, with cycle-level timing of the fabric and its memories, energy from the model in FCD-05, and a stated accuracy against RTL simulation.',
      'The simulator is the execution engine behind the virtual platform, the Playground and the energy profiler, so every pre-silicon number a customer sees comes out of it. An energy figure from a simulator whose error against RTL has never been measured cannot be trusted, and saying so on the release is part of the deliverable.',
    ],
    flowNote:
      'Step 1 builds the functional simulator and step 2 adds cycle-level timing to it; step 3 attaches the energy model once cycles exist to hang it on. Step 4 correlates against RTL alongside step 3, because timing can be checked against RTL as soon as it exists. Step 5 releases the simulator with its bounds.',
    consumes: [
      'Pass pipeline and release plan from CMP-01',
      'Fabric ISA specification from FCD-02',
      'Configuration binary format from FCD-04',
      'Cycle and energy model from FCD-05',
      'Block RTL releases for correlation from ERTL-05',
    ],
    rel: {
      'CMP-D3':
        '<b>Functional and cycle-level simulator.</b> The simulator, its timing and energy reporting and its correlation against RTL are built and released here.',
    },
    risks: [
      '<b>Accuracy never stated.</b> A simulator released without a measured error against RTL turns every energy figure in the Playground into an estimate nobody can defend.',
      '<b>Correlated only on the benchmarks.</b> The kernels exercise the paths the model was tuned on, and the error on ordinary code can be several times larger.',
      '<b>Too slow for the Playground.</b> A cycle-level run that takes minutes per second of device time makes the browser experience unusable.',
      '<b>Energy model copied rather than linked.</b> When FCD-05 updates its energy table the simulator keeps the old one, and the two start giving different answers.',
      '<b>Scalar path modelled loosely.</b> Interrupts and wake from sleep run on the scalar core, and a simulator that skips them misreports duty-cycled energy.',
    ],
    roles: [
      { r: 'Simulation engineer', d: 'Owns the simulator and its accuracy' },
      { r: 'Performance architect', d: 'Energy model and correlation targets' },
      { r: 'RTL design lead', d: 'RTL releases and waveforms for correlation' },
      { r: 'Virtual platform engineer', d: 'Integration into the SoC virtual platform' },
      { r: 'Compiler architect', d: 'Approves the simulator release' },
    ],
    effort: [
      ['Instruction-accurate functional simulator', 5],
      ['Cycle-level fabric and memory timing', 5.5],
      ['Energy reporting from the model', 2.5],
      ['Correlation against RTL simulation', 4],
      ['Accuracy bounds and release', 1],
    ],
    entry: [
      'Fabric ISA released from FCD-02',
      'Configuration format specified in FCD-04',
      'Cycle and energy model released from FCD-05',
    ],
    exit: [
      'Cycle and energy error against RTL measured and within the FCD-05 bounds',
      'Simulation speed sufficient for interactive use in the Playground',
      'Simulator released with its accuracy stated on every energy report',
    ],
    dependsOn: ['CMP-01', 'FCD-04', 'FCD-05', 'ERTL-05'],
    dependsNote: null,
    feedsInto: ['CMP-04', 'CMP-06', 'VP-01', 'VP-03', 'CREL-01'],
    measuredBy: [
      'Cycle error against RTL on the benchmark suite',
      'Energy error against RTL-based power analysis',
      'Simulated cycles per second',
    ],
    links: {
      dependsOn: ['CMP-01', 'FCD-02', 'FCD-04', 'FCD-05'],
      feedsInto: ['CMP-04', 'CMP-06', 'VP-01', 'VP-03', 'CREL-01'],
      runsWith: ['CMP-02', 'ERTL-05'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['RTL', 'ISA', 'FPGA'],
  },
  'CMP-04': {
    criticalPath: true,
    purpose: [
      'Build <b>the back end that turns dataflow graphs into a configured fabric</b>: mapping operations onto processing elements, routing operands between them, scheduling statically under the placement rules from FCD-03, and emitting the configuration binary in the contract format.',
      'This is where the energy claim is won or lost. The fabric saves energy only when operands travel short distances and memory accesses land where the placement model says they should, and a mapper that produces a legal but spread-out configuration gives up most of the gain. It also has to do so in minutes, because a developer will not wait an hour to see whether a change helped.',
    ],
    flowNote:
      'Steps 1 to 4 run in sequence because each consumes the one before: placement, then routing over the placement, then a schedule over the routes, then the binary. Step 5 brings compile time down alongside step 4, since the time is spent in placement and routing, which exist by then. Step 6 releases the back end.',
    consumes: [
      'Dataflow graphs from the front end in CMP-02',
      'Fabric ISA, array and network sizing from FCD-02',
      'Placement rules for critical-path loads from FCD-03',
      'Configuration format and scheduling guarantees from FCD-04',
      'Cycle-level simulator to measure each schedule from CMP-03',
    ],
    rel: {
      'CMP-D4':
        '<b>Fabric mapper, router and static scheduler.</b> The mapper, router, scheduler and binary emitter are built and released here.',
    },
    risks: [
      '<b>Mapper quality below the energy claims.</b> A legal configuration with long operand routes can use most of the energy the fabric was meant to save.',
      '<b>Compile time in hours.</b> Placement and routing are search problems, and without a time budget they grow until nobody iterates on their code.',
      '<b>Placement rules not applied.</b> If the scheduler cannot honour the FCD-03 rules on real programs, the memory energy in the model is never achieved.',
      '<b>Binary emitted from a stale contract.</b> A format change not reflected in the emitter produces configurations the FPGA image loads and runs wrongly.',
      '<b>Hand-tuned benchmarks mask poor general results.</b> Special cases for the showcase kernels make the scores look right while ordinary code maps poorly.',
    ],
    roles: [
      { r: 'Compiler engineer', d: 'Owns the mapper, router, scheduler and emitter' },
      { r: 'Compiler architect', d: 'Back-end design and contract compliance' },
      { r: 'Memory architect', d: 'Placement rules and their effect on energy' },
      { r: 'Simulation engineer', d: 'Cycle and energy measurement of each schedule' },
      { r: 'Compiler lead', d: 'Approves the back-end release' },
    ],
    effort: [
      ['Processing-element mapper', 8],
      ['Operand router', 6],
      ['Static scheduler with memory placement', 6],
      ['Configuration binary emitter', 3.5],
      ['Compile-time reduction', 5],
      ['Release and regression', 1.5],
    ],
    entry: [
      'Front end producing dataflow graphs from CMP-02',
      'Contract frozen in the FCD-06 co-design package',
      'Simulator timing available from CMP-03',
    ],
    exit: [
      'Every benchmark compiled, run in the simulator and within its energy target or explained',
      'Compile time within minutes on the whole benchmark suite',
      'Configuration binaries loaded and run correctly on the FPGA prototype',
    ],
    dependsOn: ['CMP-02', 'FCD-03', 'FCD-04', 'CMP-03'],
    dependsNote: null,
    feedsInto: ['CMP-05', 'CMP-06', 'CMP-07', 'VP-03', 'SDK-04', 'FPV-04'],
    measuredBy: [
      'Benchmark energy per task against the model target',
      'Compile time on the benchmark suite',
      'Operand route length per operation, trended per release',
    ],
    links: {
      dependsOn: ['CMP-02', 'FCD-02', 'FCD-03', 'FCD-04', 'FCD-06'],
      feedsInto: ['CMP-05', 'CMP-06', 'CMP-07', 'VP-03', 'SDK-04', 'FPV-04'],
      runsWith: ['CMP-03'],
      revisedBy: ['FPV-04'],
      feedsBackInto: [],
    },
    terms: ['MLIR', 'SRAM', 'FPGA'],
  },
  'CMP-05': {
    criticalPath: false,
    purpose: [
      'Build <b>the path from a trained LiteRT or ONNX model to the fabric</b>: importers into MLIR, INT8 quantisation and operator legalisation, fusion and a memory plan sized for always-on inference, and accuracy checked against the reference runtimes.',
      'Customers arrive with a model, not with C, and they judge the part on whether it runs unmodified at the accuracy they trained it to. Operator coverage is the first thing they test; a missing operator found at onboarding costs an early-access partner, so coverage is measured against the models they actually use.',
    ],
    flowNote:
      'Step 1 imports the graphs and step 2 quantises and legalises them for the fabric. Step 3 fuses operators and plans memory, and step 4 validates accuracy alongside it, because accuracy is checked on each fused graph as it is produced rather than at the end. Step 5 releases the import path.',
    consumes: [
      'Dataflow front end and MLIR infrastructure from CMP-02',
      'Fabric mapper and scheduler from CMP-04',
      'Datatypes and precision of the fabric from FCD-02',
      'Reference models from the benchmark suite in FCD-01',
      'Simulator for accuracy and energy runs from CMP-03',
    ],
    rel: {
      'CMP-D5':
        '<b>LiteRT and ONNX model import path.</b> The importers, quantisation, fusion and accuracy validation are built and released here.',
    },
    risks: [
      '<b>Operator coverage gaps found at onboarding.</b> A partner’s model that fails to import is a lost evaluation, and it is usually one uncommon operator.',
      '<b>Quantisation accuracy loss unmeasured.</b> INT8 without a per-model accuracy check ships models that run fast and answer wrongly.',
      '<b>Memory plan exceeding on-chip storage.</b> Weights and activations that do not fit force traffic to slower memory and break the always-on energy budget.',
      '<b>Coverage measured on a public model zoo.</b> Popular vision models import cleanly while the keyword and sensor models customers run do not.',
      '<b>Importers pinned to an old format version.</b> Customers export from current tools, and a lagging importer rejects their files.',
    ],
    roles: [
      { r: 'ML compiler engineer', d: 'Owns the importers, quantisation and fusion' },
      { r: 'Compiler engineer', d: 'Hand-off from the import path into the back end' },
      { r: 'Applications engineer', d: 'Customer models and accuracy targets' },
      { r: 'ML engineer', d: 'Reference runtimes and accuracy validation' },
      { r: 'Compiler architect', d: 'Approves the import path release' },
    ],
    effort: [
      ['LiteRT and ONNX importers', 3.5],
      ['INT8 quantisation and operator legalisation', 4],
      ['Operator fusion and memory planning', 4.5],
      ['Accuracy validation against reference runtimes', 3],
      ['Release', 1],
    ],
    entry: [
      'Front end released from CMP-02',
      'Back end mapping benchmark kernels in CMP-04',
      'Target customer models collected',
    ],
    exit: [
      'Every target model imported and compiled without manual edits',
      'Accuracy within the agreed tolerance of the reference runtime per model',
      'Import path released with its operator coverage list',
    ],
    dependsOn: ['CMP-02', 'CMP-04', 'FCD-02'],
    dependsNote: null,
    feedsInto: ['CMP-07', 'SDK-04', 'VP-03', 'EAP-03'],
    measuredBy: [
      'Operator coverage on target customer models',
      'Accuracy loss after quantisation per model',
      'Inference energy per model against the target',
    ],
    links: {
      dependsOn: ['CMP-02', 'CMP-04', 'FCD-01', 'FCD-02'],
      feedsInto: ['CMP-07', 'SDK-04', 'VP-03', 'EAP-03'],
      runsWith: ['CMP-03'],
      revisedBy: ['EAP-04'],
      feedsBackInto: [],
    },
    terms: ['LiteRT', 'ONNX', 'INT8', 'ML'],
  },
  'CMP-06': {
    criticalPath: false,
    purpose: [
      'Give developers <b>a debugger and an energy profiler that understand the fabric</b>: GDB-compatible debugging over JTAG, breakpoints and trace mapped from source lines to fabric regions, and energy reported per code region, packaged for the Playground and the desktop.',
      'On a spatial part a source line does not execute at one address, so an ordinary debugger has nothing to stop on. The mapping from source to fabric regions is what makes the part debuggable at all, and the per-region energy report is what lets a developer see where the battery goes — the metric the part is sold on.',
    ],
    flowNote:
      'Step 1 brings up GDB over JTAG and step 2 maps source to fabric regions for it. Step 3 builds the per-region energy report alongside step 2, because it uses the same region mapping from the simulator side. Step 4 packages the tools and step 5 releases them.',
    consumes: [
      'Debug and energy-counter hooks from FCD-04',
      'JTAG and debug access architecture from EDFT-03',
      'Trace and observability architecture from EDFT-04',
      'Per-region energy from the simulator in CMP-03',
      'Region and schedule information from the back end in CMP-04',
    ],
    rel: {
      'CMP-D6':
        '<b>Debugger and energy profiler.</b> The debugger, the source-to-region mapping and the energy report are built and released here.',
      'CMP-D7':
        '<b>Compiler Alpha release with regression suite.</b> The alpha ships with the debugger and profiler, so its release needs these tools passing their own tests.',
    },
    risks: [
      '<b>Source mapping lost in optimisation.</b> Aggressive fusion and scheduling leave lines with no region to break on, and developers lose trust in the debugger.',
      '<b>Energy per region only from the simulator.</b> Without the on-chip counters in the FCD-04 contract, the profiler cannot report on silicon or the FPGA.',
      '<b>JTAG access differing from the DFT plan.</b> If the debug port the tools assume is not what EDFT-03 builds, the tools fail at first silicon.',
      '<b>Playground packaging late.</b> The browser tools depend on this release, and a slip here moves the Playground launch.',
      '<b>Profiler disagreeing with the bench meter.</b> A per-region report that does not sum to the measured total on the EVK is not believed.',
    ],
    roles: [
      { r: 'Tools engineer', d: 'Owns the debugger, profiler and packaging' },
      { r: 'Compiler engineer', d: 'Debug information and source-to-region mapping' },
      { r: 'DFT debug lead', d: 'JTAG and trace access on the silicon' },
      { r: 'Developer platform lead', d: 'Integration into the Playground' },
      { r: 'Compiler architect', d: 'Approves the tools release' },
    ],
    effort: [
      ['GDB-compatible debug over JTAG', 3.5],
      ['Source-to-fabric region mapping', 3.5],
      ['Per-region energy report', 2.5],
      ['Packaging for Playground and desktop', 1.5],
      ['Release', 1],
    ],
    entry: [
      'Debug hooks signed in the FCD-04 contract',
      'Debug access architecture defined in EDFT-03',
      'Simulator with energy reporting available from CMP-03',
    ],
    exit: [
      'Breakpoints and single-step working on fabric regions in the simulator and on the FPGA',
      'Per-region energy summing to the simulator total within tolerance',
      'Tools packaged for the Playground and the desktop and released',
    ],
    dependsOn: ['FCD-04', 'EDFT-03', 'CMP-03', 'CMP-04'],
    dependsNote: null,
    feedsInto: ['CMP-07', 'VP-03', 'VP-04', 'FPV-04'],
    measuredBy: [
      'Source lines with a breakpoint location after optimisation',
      'Per-region energy total against the whole-program figure',
      'Debug sessions failing on the FPGA prototype',
    ],
    links: {
      dependsOn: ['FCD-04', 'EDFT-03', 'EDFT-04', 'CMP-03', 'CMP-04'],
      feedsInto: ['CMP-07', 'VP-03', 'VP-04', 'FPV-04'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['GDB', 'JTAG', 'SDK'],
  },
  'CMP-07': {
    criticalPath: true,
    purpose: [
      'Run the full regression—conformance, benchmarks and models—fix what blocks the alpha, and <b>release the Compiler Alpha with its known limitations written down</b>, ready for the Playground and the first early-access partners.',
      'The alpha is the first time anyone outside the team compiles their own code for the part, and it ships before tapeout. That makes it the last cheap chance to learn what ordinary code does on the fabric, but only if it is released honestly: an alpha date held by trimming the regression rather than the scope ships the problems to customers.',
    ],
    flowNote:
      'Step 1 runs the regression and step 2 fixes the blockers it finds. Step 3 writes the release notes alongside step 2, because each fix or deferral is a line in the known limitations. Step 4 releases the alpha once the criteria from CMP-01 are met.',
    consumes: [
      'Alpha release criteria from CMP-01',
      'Fabric back end from CMP-04',
      'LiteRT and ONNX import path from CMP-05',
      'Debugger and energy profiler from CMP-06',
      'Benchmark and workload runs on the FPGA prototype from FPV-04',
    ],
    rel: {
      'CMP-D7':
        '<b>Compiler Alpha release with regression suite.</b> The regression is run, the blockers fixed and the alpha released here.',
    },
    risks: [
      '<b>Alpha date held by cutting the regression.</b> Tests removed to make the date leave regressions that partners find first.',
      '<b>Known limitations understated.</b> A partner who meets an undocumented gap stops trusting the rest of the toolchain.',
      '<b>Results only in the simulator.</b> An alpha never run on the FPGA prototype can compile binaries the hardware executes differently.',
      '<b>Blockers disputed at the gate.</b> Without the CMP-01 criteria applied as written, every blocker is argued down to a limitation.',
      '<b>No rollback path.</b> The Playground takes the release directly, and a bad alpha without a previous build to return to stops every onboarding session.',
    ],
    roles: [
      { r: 'Compiler architect', d: 'Owns the release and the go decision' },
      { r: 'Compiler engineer', d: 'Blocker triage and fixes' },
      { r: 'Release engineer', d: 'Regression infrastructure and packaging' },
      { r: 'Developer platform lead', d: 'Takes the alpha into the Playground' },
      { r: 'Product manager', d: 'Approves the release and its limitations' },
    ],
    effort: [
      ['Regression — conformance, benchmarks, models', 1.5],
      ['Blocker triage and fixes', 3],
      ['Release notes and known limitations', 1],
      ['Release', 0.5],
    ],
    entry: [
      'Back end, model import and tools released from CMP-04, CMP-05 and CMP-06',
      'Regression suite running nightly',
      'FPGA prototype images available from FPV-04',
    ],
    exit: [
      'Every alpha criterion from CMP-01 met or waived in writing',
      'Benchmarks run on the FPGA prototype with results matching the simulator within bounds',
      'Alpha released with release notes and known limitations',
    ],
    dependsOn: ['CMP-01', 'CMP-04', 'CMP-05', 'CMP-06', 'FPV-04'],
    dependsNote:
      'The alpha is the convergence point of the stage — it needs every other CMP deliverable and a prototype to run on, and cannot close before the slowest of them.',
    feedsInto: ['VP-03', 'VP-05', 'EAP-03', 'SDK-04', 'CREL-02'],
    measuredBy: [
      'Regression pass rate at release',
      'Open alpha blockers at the gate',
      'Alpha release date against plan',
    ],
    links: {
      dependsOn: ['CMP-01', 'CMP-04', 'CMP-05', 'CMP-06'],
      feedsInto: ['VP-03', 'VP-05', 'EAP-03', 'SDK-04', 'CREL-02'],
      runsWith: ['FPV-04'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['LLVM', 'SDK', 'FPGA'],
  },
};
