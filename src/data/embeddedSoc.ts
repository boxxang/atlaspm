/**
 * /data/embeddedSoc.ts — the Embedded SoC template.
 *
 * An ultra-low-power, general-purpose embedded processor sold with its own
 * compiler, SDK and evaluation kit — modelled on the class of part Efficient
 * Computer's Electron E1 represents: a spatial dataflow fabric of tiled
 * processing elements, a small scalar control path, megabytes of embedded MRAM
 * and SRAM on a mature node, a power manager that runs from a battery or a
 * 1.8–5.5 V supply and sleeps most of the time, and a toolchain that compiles
 * ordinary C, C++ and LiteRT / ONNX models onto the fabric.
 *
 * A programme like this ships three products, not one: the silicon, the
 * compiler and SDK that make it programmable, and the EVK that lets a customer
 * try it before they design it in. The last two are what win the socket, and
 * they have to exist before the silicon does — which is why the template
 * carries them as stages with checkpoints of their own rather than as a line
 * in bring-up.
 *
 * Three kinds of stage:
 *
 *  - inherited unchanged from the SoC flow by key: IP readiness and tapeout;
 *  - derived from the SoC flow (/data/embeddedSocDerived), at embedded scale
 *    and with the steps that name the wrong product rewritten
 *    (/data/embeddedSocEdits): definition, architecture, foundry, PDK, RTL,
 *    verification, DFT, synthesis, physical design, signoff, the bring-up
 *    board, test development, bring-up, fabrication and qualification;
 *  - authored here: the fabric and compiler co-design, eMRAM, the power
 *    manager, FPGA prototype verification, the package and its assembly, the
 *    compiler, the virtual platform and Playground, the SDK, the software
 *    release, the EVK, and early access.
 *
 * Written here rather than in journey.ts because that file and the activity
 * modules beside it are generated. Held to the same invariants as the 3DIC
 * stages — see tests/unit/embeddedSoc.test.ts.
 */
import type { ActivityStepEntry } from './activitySteps';
import {
  EMBEDDED_DERIVED,
  EMBEDDED_DERIVED_DURATION,
  EMBEDDED_DERIVED_STAGES,
} from './embeddedSocDerived';
import { journeyData } from './journey';
import { BASELINES, PHASE_OF, stageMilestone } from './scheduleProfiles';
import type { JourneyStage, MilestoneDef, ProfileStageDef, ScheduleProfile } from './types';

/** An authored stage's content: journey's shape, with the aligned arrays required. */
export type EmbeddedStage = JourneyStage &
  Required<Pick<JourneyStage, 'engineeringStart' | 'deliverableFrom' | 'deliverableWeek'>>;

/**
 * The SoC stages an embedded programme runs exactly as the SoC one does: IP
 * readiness and tapeout say nothing an embedded programme would word
 * differently. Everything else it shares with the SoC flow is derived.
 */
export const EMBEDDED_INHERITED_KEYS = ['ipReadiness', 'tapeout'] as const;

/** The stages written for this template, in the order they start. */
export const EMBEDDED_STAGE_KEYS = [
  'fabricCodesign',
  'compiler',
  'emram',
  'pmu',
  'virtualPlatform',
  'fpgaVerification',
  'sdk',
  'packageEmb',
  'earlyAccess',
  'evkDesign',
  'assemblyEmb',
  'softwareRelease',
  'evkLaunch',
] as const;

/** Where each stage sits in an embedded programme, in weeks from kickoff. */
export const EMBEDDED_BASELINES: Record<string, { startOffsetWeeks: number; durationWeeks: number }> = {
  /* The front of the programme is the SoC's: requirements, foundry and IP
     decisions, and the architecture, run as they do anywhere. */
  productDefinitionEmb: BASELINES.productDefinition,
  technologyEmb: BASELINES.technology,
  ipReadiness: BASELINES.ipReadiness,
  architectureEmb: BASELINES.architecture,
  /* The fabric and the compiler are one design: what the hardware leaves out
     the compiler has to do, and the contract between them closes before RTL
     is written against it. */
  fabricCodesign: { startOffsetWeeks: 4, durationWeeks: 16 },
  /* The compiler starts as soon as the contract has a draft, and its alpha
     ships inside the Playground — before tapeout, so customers write code for
     silicon that does not exist yet. */
  compiler: { startOffsetWeeks: 8, durationWeeks: 48 },
  pdkEmb: { startOffsetWeeks: 8, durationWeeks: EMBEDDED_DERIVED_DURATION.pdkEmb },
  /* The eMRAM and power-manager macros land in the floorplan at week 44, so
     their views are released before it and their signoff runs alongside. */
  emram: { startOffsetWeeks: 10, durationWeeks: 36 },
  pmu: { startOffsetWeeks: 12, durationWeeks: 36 },
  virtualPlatform: { startOffsetWeeks: 16, durationWeeks: 42 },
  /* Planned with the DV plan, run on every RTL drop, and signed off on the
     final RTL before the tapeout Go / No-Go. */
  fpgaVerification: { startOffsetWeeks: 24, durationWeeks: 40 },
  /* Scan architecture starts with the RTL and its patterns close on the final
     netlist and the reordered chains, before the design freezes. */
  dftEmb: { startOffsetWeeks: 19, durationWeeks: EMBEDDED_DERIVED_DURATION.dftEmb },
  rtlEmb: { startOffsetWeeks: 20, durationWeeks: EMBEDDED_DERIVED_DURATION.rtlEmb },
  /* The boot ROM is silicon: the SDK starts early enough to freeze it with the
     RTL, and runs until the SDK has been proven on first silicon. */
  sdk: { startOffsetWeeks: 24, durationWeeks: 80 },
  verificationEmb: { startOffsetWeeks: 24, durationWeeks: EMBEDDED_DERIVED_DURATION.verificationEmb },
  /* The pin-out freezes before the floorplan places the pad ring. */
  packageEmb: { startOffsetWeeks: 28, durationWeeks: 26 },
  synthesisEmb: { startOffsetWeeks: 36, durationWeeks: EMBEDDED_DERIVED_DURATION.synthesisEmb },
  /* Early access opens once there is a compiler to hand partners, and closes
     on the first design-win, at mass production. */
  earlyAccess: { startOffsetWeeks: 40, durationWeeks: 86 },
  physicalDesignEmb: { startOffsetWeeks: 40, durationWeeks: EMBEDDED_DERIVED_DURATION.physicalDesignEmb },
  validationHardwareEmb: {
    startOffsetWeeks: 44,
    durationWeeks: EMBEDDED_DERIVED_DURATION.validationHardwareEmb,
  },
  testDevelopmentEmb: { startOffsetWeeks: 46, durationWeeks: EMBEDDED_DERIVED_DURATION.testDevelopmentEmb },
  signoffEmb: { startOffsetWeeks: 54, durationWeeks: EMBEDDED_DERIVED_DURATION.signoffEmb },
  /* The EVK is designed and proven without silicon, so the first packaged
     samples go straight onto EVT boards. */
  evkDesign: { startOffsetWeeks: 56, durationWeeks: 44 },
  /* Tapeout and fabrication are the SoC's chain at its length, moved: the mask
     shop and the fab run to the node, not to the size of the design. */
  tapeout: { startOffsetWeeks: 66, durationWeeks: BASELINES.tapeout.durationWeeks },
  fabricationEmb: { startOffsetWeeks: 70, durationWeeks: BASELINES.fabrication.durationWeeks },
  /* Tooling is built while the wafers are in the fab; the line runs when they
     ship. */
  assemblyEmb: { startOffsetWeeks: 70, durationWeeks: 26 },
  softwareRelease: { startOffsetWeeks: 92, durationWeeks: 24 },
  /* Bring-up starts on the first assembled units. */
  bringupEmb: { startOffsetWeeks: 96, durationWeeks: EMBEDDED_DERIVED_DURATION.bringupEmb },
  qualificationEmb: { startOffsetWeeks: 100, durationWeeks: BASELINES.qualification.durationWeeks },
  evkLaunch: { startOffsetWeeks: 100, durationWeeks: 22 },
};

/** Which band each stage sits under. */
const PHASE_OF_EMBEDDED: Record<string, string> = {
  ...PHASE_OF,
  ...Object.fromEntries(EMBEDDED_DERIVED.map((d) => [d.key, PHASE_OF[d.base]])),
  fabricCodesign: 'define',
  emram: 'enable',
  pmu: 'enable',
  fpgaVerification: 'designVerify',
  packageEmb: 'integrate',
  assemblyEmb: 'integrate',
  compiler: 'platform',
  virtualPlatform: 'platform',
  sdk: 'platform',
  softwareRelease: 'platform',
  evkDesign: 'platform',
  evkLaunch: 'platform',
  earlyAccess: 'platform',
};

/* ---------- checkpoints ---------- */

/**
 * The derived stages close on the checkpoint their SoC counterpart closes on,
 * under an id of their own — a milestone belongs to a stage, and the embedded
 * RTL stage is not the SoC one.
 */
const DERIVED_MILESTONES: MilestoneDef[] = EMBEDDED_DERIVED.map((d) => {
  const soc = stageMilestone[d.base];
  return {
    id: `${soc.id}Emb`,
    label: soc.label,
    anchor: { stage: d.key, at: 'end' as const },
    /* First Silicon and Mass Production stay what the countdowns count to */
    ...(soc.major ? { major: true } : {}),
  };
});

export const EMBEDDED_MILESTONES: readonly MilestoneDef[] = [
  { id: 'fabricContractFreeze', label: 'Fabric & Compiler Contract Freeze', anchor: { stage: 'fabricCodesign', at: 'end' } },
  { id: 'compilerAlpha', label: 'Compiler Alpha', anchor: { stage: 'compiler', at: 'end' } },
  { id: 'emramSignoff', label: 'eMRAM Integration Signoff', anchor: { stage: 'emram', at: 'end' } },
  { id: 'pmuSignoff', label: 'PMU & Always-On Signoff', anchor: { stage: 'pmu', at: 'end' } },
  {
    id: 'playgroundLaunch',
    label: 'Developer Playground Launch',
    anchor: { stage: 'virtualPlatform', at: 'end' },
    major: true,
  },
  {
    id: 'fpgaVerificationSignoff',
    label: 'FPGA Verification Signoff',
    anchor: { stage: 'fpgaVerification', at: 'end' },
  },
  { id: 'sdkBeta', label: 'SDK Beta on Silicon', anchor: { stage: 'sdk', at: 'end' } },
  { id: 'packageFreezeEmb', label: 'Package Design Freeze', anchor: { stage: 'packageEmb', at: 'end' } },
  { id: 'firstDesignWin', label: 'First Customer Design-Win', anchor: { stage: 'earlyAccess', at: 'end' } },
  { id: 'evkEvtReady', label: 'EVK EVT Ready', anchor: { stage: 'evkDesign', at: 'end' } },
  { id: 'engineeringSamples', label: 'Engineering Samples Assembled', anchor: { stage: 'assemblyEmb', at: 'end' } },
  {
    id: 'softwareGa',
    label: 'Compiler & SDK 1.0 GA',
    anchor: { stage: 'softwareRelease', at: 'end' },
    major: true,
  },
  { id: 'evkGa', label: 'EVK General Availability', anchor: { stage: 'evkLaunch', at: 'end' }, major: true },
  ...DERIVED_MILESTONES,
];

/* ---------- activities ---------- */

/** One output per step, in step order, as every other template's activities. */
const act = (
  st: string,
  w: [number, number],
  ro: string,
  s: ActivityStepEntry['s'],
  o: string[],
  r: ActivityStepEntry['r'],
): ActivityStepEntry => ({ st, w, s, o, ob: o.map((_, i) => i + 1), r, ro });

/**
 * Keyed by reference, grouped by stage and in the order each stage runs them —
 * the stage's aligned arrays are positions into this order.
 */
export const EMBEDDED_ACTIVITIES: Record<string, ActivityStepEntry> = {
  /* --- compute fabric and compiler co-design --- */
  'FCD-01': act(
    'fabricCodesign',
    [0, 5],
    'Applications architect',
    [
      [1, 'Collect the target workloads — sensor fusion, DSP, always-on inference, control loops', 1],
      [2, 'Port each workload to portable C/C++ and reference LiteRT / ONNX models', 1.5],
      [3, 'Measure energy and latency on the incumbent MCUs and DSPs', 1.5, 1],
      [4, 'Set the energy-per-operation and duty-cycle target for each workload', 1],
      [5, 'Freeze the benchmark suite and its scoring rules', 0.5],
    ],
    [
      'Target workload list by application segment',
      'Portable C/C++ and model sources for each workload',
      'Incumbent MCU and DSP energy and latency baselines',
      'Energy and duty-cycle targets per workload',
      'Benchmark suite and scoring rules, frozen',
    ],
    [['FCD-D1', 'produces'], ['FCD-D5', 'feeds']],
  ),
  'FCD-02': act(
    'fabricCodesign',
    [2, 9],
    'Chief architect',
    [
      [1, 'Define the processing-element operations, datatypes and precision', 1.5],
      [2, 'Size the tile array, the operand network and the configuration memory', 1.5],
      [3, 'Define control flow, predication and loop handling on the fabric', 1.5],
      [4, 'Define the scalar control path — boot, interrupts, peripherals, debug', 1, 1],
      [5, 'Review the ISA against the benchmark kernels and trim what they never use', 1],
      [6, 'Release the fabric ISA specification', 0.5],
    ],
    [
      'Processing-element operation and datatype list',
      'Tile array, network and configuration memory sizing',
      'Fabric control-flow and loop semantics',
      'Scalar control path definition',
      'Kernel coverage review of the ISA',
      'Fabric ISA specification, released',
    ],
    [['FCD-D2', 'produces'], ['FCD-D4', 'feeds']],
  ),
  'FCD-03': act(
    'fabricCodesign',
    [4, 10],
    'Memory architect',
    [
      [1, 'Partition on-chip memory between eMRAM, SRAM banks and fabric-local storage', 1],
      [2, 'Model access energy and latency by distance from each memory port', 1.5],
      [3, 'Define the placement rules the compiler applies to critical-path loads', 1.5],
      [4, 'Set the eMRAM read bandwidth and the wake-from-retention budget', 1, 1],
      [5, 'Release the memory access and placement model', 0.5],
    ],
    [
      'On-chip memory partition — eMRAM, SRAM, fabric-local',
      'Access energy and latency map by memory port distance',
      'Compiler data placement rules for critical-path loads',
      'eMRAM read bandwidth and wake budget',
      'Memory access and placement model, released',
    ],
    [['FCD-D3', 'produces'], ['FCD-D4', 'feeds']],
  ),
  'FCD-04': act(
    'fabricCodesign',
    [6, 13],
    'Compiler architect',
    [
      [1, 'Define the dataflow IR the compiler lowers to, as an MLIR dialect', 1.5],
      [2, 'Specify the configuration binary format and its loader', 1.5],
      [3, 'Define the static scheduling guarantees the hardware must honour', 1],
      [4, 'Define the debug hooks — breakpoints, trace, energy counters per region', 1, 1],
      [5, 'Agree the ABI and calling convention with the scalar core', 1],
      [6, 'Sign the contract between the hardware and compiler teams', 0.5],
    ],
    [
      'Dataflow IR definition (MLIR dialect)',
      'Configuration binary format and loader specification',
      'Static scheduling guarantees',
      'Debug and energy-counter hook definition',
      'ABI and calling convention',
      'Compiler–hardware contract, signed',
    ],
    [['FCD-D4', 'produces'], ['FCD-D6', 'feeds']],
  ),
  'FCD-05': act(
    'fabricCodesign',
    [8, 14],
    'Performance architect',
    [
      [1, 'Build the cycle-level model of the fabric and its memories', 2],
      [2, 'Attach per-operation and per-access energy from the library data', 1.5],
      [3, 'Run the benchmark suite through the model and the compiler prototype', 1.5],
      [4, 'Plan correlation against RTL simulation, the FPGA prototype and silicon', 1, 1],
      [5, 'Release the model with its accuracy bounds', 0.5],
    ],
    [
      'Cycle-level fabric and memory model',
      'Per-operation and per-access energy table',
      'Benchmark results from the model and compiler prototype',
      'Model correlation plan — RTL, FPGA, silicon',
      'Cycle and energy model with accuracy bounds',
    ],
    [['FCD-D5', 'produces'], ['FCD-D6', 'feeds']],
  ),
  'FCD-06': act(
    'fabricCodesign',
    [12, 16],
    'Chief architect',
    [
      [1, 'Score the architecture against the benchmark targets', 1],
      [2, 'Close the open trade-offs between compiler complexity and hardware area', 1],
      [3, 'Record each decision and what it was chosen over', 0.5, 1],
      [4, 'Freeze the fabric, the memory model and the compiler contract together', 1],
    ],
    [
      'Architecture scorecard against the benchmark targets',
      'Compiler–hardware trade-off dispositions',
      'Co-design decision record',
      'Fabric and compiler co-design freeze package',
    ],
    [['FCD-D6', 'produces']],
  ),

  /* --- compiler toolchain --- */
  'CMP-01': act(
    'compiler',
    [0, 6],
    'Compiler architect',
    [
      [1, 'Choose the infrastructure — LLVM, MLIR and the Clang driver', 1],
      [2, 'Define the pass pipeline from C/C++ to fabric configuration', 1.5],
      [3, 'Define drop-in GCC/Clang compatibility — flags, linker scripts, pragmas', 1],
      [4, 'Set the alpha, beta and 1.0 release criteria', 1, 1],
      [5, 'Release the compiler architecture and release plan', 0.5],
    ],
    [
      'Compiler infrastructure decision',
      'Pass pipeline from source to fabric configuration',
      'GCC/Clang compatibility specification',
      'Alpha, beta and 1.0 release criteria',
      'Compiler architecture and release plan',
    ],
    [['CMP-D1', 'produces']],
  ),
  'CMP-02': act(
    'compiler',
    [4, 24],
    'Compiler engineer',
    [
      [1, 'Bring up the Clang front end and the target description', 3],
      [2, 'Lower LLVM IR into the dataflow dialect', 5],
      [3, 'Extract the loops and regions that run spatially on the fabric', 5],
      [4, 'Keep scalar and control code on the scalar path', 3, 1],
      [5, 'Pass the benchmark kernels through the front end', 2],
    ],
    [
      'Clang front end and target description',
      'LLVM IR to dataflow dialect lowering',
      'Spatial region extraction pass',
      'Scalar path code generation',
      'Front end passing the benchmark kernels',
    ],
    [['CMP-D2', 'produces']],
  ),
  'CMP-03': act(
    'compiler',
    [8, 30],
    'Simulation engineer',
    [
      [1, 'Build the instruction-accurate functional simulator', 5],
      [2, 'Add the cycle-level fabric and memory timing', 6],
      [3, 'Attach the energy model from FCD-05', 3],
      [4, 'Correlate the simulator against RTL simulation', 4, 1],
      [5, 'Release the simulator with its accuracy bounds', 1],
    ],
    [
      'Functional simulator',
      'Cycle-level fabric and memory timing model',
      'Energy reporting in the simulator',
      'Simulator-to-RTL correlation report',
      'Simulator release with accuracy bounds',
    ],
    [['CMP-D3', 'produces']],
  ),
  'CMP-04': act(
    'compiler',
    [10, 36],
    'Compiler engineer',
    [
      [1, 'Map the dataflow graphs onto processing elements', 6],
      [2, 'Route operands over the fabric network', 5],
      [3, 'Schedule statically, applying the placement rules from FCD-03', 5],
      [4, 'Emit the configuration binary in the contract format', 4],
      [5, 'Bring compile time down to minutes on the benchmark suite', 3, 1],
      [6, 'Release the fabric back end', 1],
    ],
    [
      'Processing-element mapper',
      'Operand router',
      'Static scheduler with memory placement',
      'Configuration binary emitter',
      'Compile-time report on the benchmark suite',
      'Fabric back end, released',
    ],
    [['CMP-D4', 'produces']],
  ),
  'CMP-05': act(
    'compiler',
    [20, 42],
    'ML compiler engineer',
    [
      [1, 'Import LiteRT and ONNX graphs into MLIR', 4],
      [2, 'Quantise and legalise the operators for INT8 on the fabric', 4],
      [3, 'Fuse operators and plan memory for always-on inference', 5],
      [4, 'Validate accuracy against the reference runtimes', 3, 1],
      [5, 'Release the model import path', 1],
    ],
    [
      'LiteRT and ONNX importers',
      'INT8 quantisation and operator legalisation',
      'Operator fusion and memory plan',
      'Accuracy validation against the reference runtimes',
      'Model import path, released',
    ],
    [['CMP-D5', 'produces']],
  ),
  'CMP-06': act(
    'compiler',
    [24, 44],
    'Tools engineer',
    [
      [1, 'Integrate GDB-compatible debugging over JTAG', 4],
      [2, 'Map source lines to fabric regions for breakpoints and trace', 4],
      [3, 'Report energy by code region from the simulator', 3, 1],
      [4, 'Package the tools for the Playground and the desktop', 2],
      [5, 'Release the debugger and the energy profiler', 1],
    ],
    [
      'GDB-compatible debug over JTAG',
      'Source-to-fabric region mapping for debug',
      'Per-region energy report',
      'Tool packages for Playground and desktop',
      'Debugger and energy profiler, released',
    ],
    [['CMP-D6', 'produces'], ['CMP-D7', 'feeds']],
  ),
  'CMP-07': act(
    'compiler',
    [40, 48],
    'Compiler architect',
    [
      [1, 'Run the regression suite — conformance, benchmarks, models', 2],
      [2, 'Triage and fix the alpha blockers', 3],
      [3, 'Write the release notes and the known limitations', 1, 1],
      [4, 'Release the Compiler Alpha', 0.5],
    ],
    [
      'Alpha regression results',
      'Alpha blocker fixes',
      'Release notes and known limitations',
      'Compiler Alpha release',
    ],
    [['CMP-D7', 'produces']],
  ),

  /* --- embedded MRAM --- */
  'MRAM-01': act(
    'emram',
    [0, 6],
    'Memory IP lead',
    [
      [1, 'Compare the foundry eMRAM options — density, read latency, write energy', 1.5],
      [2, 'Split code and data between eMRAM and SRAM', 1],
      [3, 'Set the instance sizes, word width and bank count', 1],
      [4, 'Review the macro’s qualification status on the chosen node', 1, 1],
      [5, 'Sign the macro licence and its delivery schedule', 1],
      [6, 'Issue the configuration record', 0.5],
    ],
    [
      'eMRAM option comparison',
      'Code and data split between eMRAM and SRAM',
      'eMRAM instance configuration',
      'Macro qualification status review',
      'Macro licence and delivery schedule',
      'eMRAM macro selection and configuration record',
    ],
    [['MRAM-D1', 'produces']],
  ),
  'MRAM-02': act(
    'emram',
    [4, 14],
    'Memory design lead',
    [
      [1, 'Specify the read path, wait states and prefetch', 1.5],
      [2, 'Choose the ECC scheme against the end-of-life bit-error rate', 1.5],
      [3, 'Define write-verify, program pulses and write-energy management', 1.5],
      [4, 'Define reference trim and where it is stored', 1, 1],
      [5, 'Specify power-down, retention and wake behaviour', 1],
      [6, 'Release the controller specification', 0.5],
    ],
    [
      'Read path and prefetch specification',
      'ECC scheme and bit-error-rate budget',
      'Write-verify and write-energy specification',
      'Reference trim and storage definition',
      'Power-down and wake behaviour',
      'eMRAM controller, ECC and trim specification',
    ],
    [['MRAM-D2', 'produces'], ['MRAM-D6', 'feeds']],
  ),
  'MRAM-03': act(
    'emram',
    [6, 18],
    'Reliability engineer',
    [
      [1, 'Set retention targets per temperature grade', 1],
      [2, 'Set write-endurance targets per region — code, data, logging', 1],
      [3, 'Plan data survival through solder reflow for pre-programmed parts', 1.5],
      [4, 'Define the stress tests and sample sizes for qualification', 1.5, 1],
      [5, 'Agree the plan against the foundry’s macro qualification data', 1],
    ],
    [
      'Retention targets per temperature grade',
      'Write-endurance targets per region',
      'Solder-reflow data survival plan',
      'eMRAM stress test and sample plan',
      'Retention, endurance and reflow plan',
    ],
    [['MRAM-D3', 'produces']],
  ),
  'MRAM-04': act(
    'emram',
    [8, 20],
    'Reliability engineer',
    [
      [1, 'Collect the magnetic field exposure of the target applications', 1],
      [2, 'Obtain the macro’s magnetic immunity data in standby and active', 1],
      [3, 'Assess package-level shielding options and their cost', 1.5, 1],
      [4, 'Set the immunity specification and the customer guidance', 1],
    ],
    [
      'Application magnetic field exposure survey',
      'Macro magnetic immunity data',
      'Shielding option assessment',
      'Magnetic immunity specification and guidance',
    ],
    [['MRAM-D4', 'produces']],
  ),
  'MRAM-05': act(
    'emram',
    [12, 28],
    'Memory IP lead',
    [
      [1, 'Receive the macro views and check them against the PDK version', 1],
      [2, 'Integrate the macro and controller in RTL and the behavioural models', 2],
      [3, 'Place the macro in the floorplan with its keep-out and supply requirements', 1.5],
      [4, 'Verify the timing and power views across the signoff corners', 1.5, 1],
      [5, 'Release the qualified macro views to physical design', 0.5],
    ],
    [
      'Macro view check against the PDK',
      'Integrated eMRAM and controller RTL',
      'eMRAM floorplan placement and keep-outs',
      'Timing and power view verification',
      'eMRAM hard macro views, released',
    ],
    [['MRAM-D5', 'produces']],
  ),
  'MRAM-06': act(
    'emram',
    [16, 30],
    'Test engineer',
    [
      [1, 'Define the MBIST algorithms for the eMRAM failure modes', 1.5],
      [2, 'Define the redundancy and repair allocation', 1],
      [3, 'Define trim at wafer sort and its test-time budget', 1.5],
      [4, 'Plan the retention bake and read-disturb screens', 1, 1],
      [5, 'Release the eMRAM test flow to test development', 0.5],
    ],
    [
      'eMRAM MBIST algorithm set',
      'Redundancy and repair allocation',
      'Sort-time trim flow and budget',
      'Retention bake and read-disturb screens',
      'eMRAM test, repair and trim flow',
    ],
    [['MRAM-D6', 'produces']],
  ),
  'MRAM-07': act(
    'emram',
    [30, 36],
    'Memory IP lead',
    [
      [1, 'Review post-layout timing and IR drop at the macro pins', 1],
      [2, 'Confirm the reliability rules — EM, keep-outs, magnetic guidance', 1],
      [3, 'Close the open waivers with the macro vendor', 1, 1],
      [4, 'Sign off the eMRAM integration', 0.5],
    ],
    [
      'Post-layout macro timing and IR review',
      'eMRAM reliability rule check',
      'Macro vendor waiver closure',
      'eMRAM integration signoff',
    ],
    [['MRAM-D7', 'produces']],
  ),

  /* --- power management, clocks and always-on --- */
  'PMU-01': act(
    'pmu',
    [0, 6],
    'Power architect',
    [
      [1, 'Define the supply range and input sources — battery, USB, external', 1],
      [2, 'Define the operating modes — performance, efficiency, low power, sleep, deep sleep', 1.5],
      [3, 'Partition the power domains and what each mode keeps on', 1.5],
      [4, 'Set the leakage and wake-latency targets per mode', 1, 1],
      [5, 'Release the power architecture specification', 0.5],
    ],
    [
      'Supply range and input source definition',
      'Operating mode definition',
      'Power domain partition by mode',
      'Leakage and wake-latency targets',
      'Power architecture and mode specification',
    ],
    [['PMU-D1', 'produces'], ['PMU-D6', 'feeds']],
  ),
  'PMU-02': act(
    'pmu',
    [4, 18],
    'Analog design lead',
    [
      [1, 'Specify the always-on low-frequency oscillator and its accuracy', 1],
      [2, 'Specify the high-frequency RC oscillator and its trim', 1.5],
      [3, 'Integrate the crystal oscillator and PLL IP', 2],
      [4, 'Define clock switching and fail-safe behaviour', 1.5, 1],
      [5, 'Release the clock source design', 0.5],
    ],
    [
      'Low-frequency oscillator specification',
      'RC oscillator specification and trim',
      'Crystal oscillator and PLL integration',
      'Clock switching and fail-safe definition',
      'Clock source design, released',
    ],
    [['PMU-D3', 'produces'], ['PMU-D5', 'feeds']],
  ),
  'PMU-03': act(
    'pmu',
    [4, 20],
    'Analog design lead',
    [
      [1, 'Choose LDO or buck per domain against efficiency at light load', 1.5],
      [2, 'Design the regulators and their compensation', 4],
      [3, 'Design power-on reset and brown-out detection', 2, 1],
      [4, 'Simulate line and load transients across the 1.8–5.5 V range', 2],
      [5, 'Review the design and release the schematics', 1],
    ],
    [
      'Regulator topology per domain',
      'Regulator schematics',
      'Power-on reset and brown-out schematics',
      'Line and load transient results',
      'Regulator, POR and brown-out design, released',
    ],
    [['PMU-D2', 'produces'], ['PMU-D5', 'feeds']],
  ),
  'PMU-04': act(
    'pmu',
    [6, 16],
    'SoC architect',
    [
      [1, 'Define what the always-on domain holds — RTC, wake logic, retention registers', 1.5],
      [2, 'Define the wake sources — GPIO, timers, comparators, serial activity', 1],
      [3, 'Define state retention and restore across deep sleep', 1.5],
      [4, 'Specify isolation and level shifting between domains', 1.5, 1],
      [5, 'Release the always-on specification to RTL', 0.5],
    ],
    [
      'Always-on domain content',
      'Wake source list',
      'Retention and restore sequence',
      'Isolation and level-shifter specification',
      'Always-on domain and wake source specification',
    ],
    [['PMU-D4', 'produces']],
  ),
  'PMU-05': act(
    'pmu',
    [16, 32],
    'Analog layout lead',
    [
      [1, 'Lay out the regulators, references and oscillators', 4],
      [2, 'Run DRC, LVS and post-layout extraction', 2],
      [3, 'Re-verify performance on the extracted views across corners', 2, 1],
      [4, 'Generate the abstract, timing and behavioural views', 1.5],
      [5, 'Release the analog hard macros to physical design', 0.5],
    ],
    [
      'Analog block layouts',
      'Clean DRC, LVS and extraction',
      'Post-layout performance results',
      'Abstract, timing and behavioural views',
      'Analog hard macros with views, released',
    ],
    [['PMU-D5', 'produces']],
  ),
  'PMU-06': act(
    'pmu',
    [18, 32],
    'Power architect',
    [
      [1, 'Build the mixed-signal model of each mode transition', 2],
      [2, 'Simulate entry and exit of every sleep mode with the firmware sequence', 2],
      [3, 'Estimate the energy of each mode against the workload duty cycles', 1.5, 1],
      [4, 'Reconcile the energy budget with the fabric model from FCD-05', 1],
      [5, 'Release the verified energy budget', 0.5],
    ],
    [
      'Mixed-signal mode transition model',
      'Sleep entry and exit simulation results',
      'Energy per mode against duty cycles',
      'Energy budget reconciliation with the fabric model',
      'System energy budget per mode, verified',
    ],
    [['PMU-D6', 'produces']],
  ),
  'PMU-07': act(
    'pmu',
    [32, 36],
    'Analog design lead',
    [
      [1, 'Review reliability — EM, ESD on the supply pins, latch-up', 1],
      [2, 'Confirm the macros in the top-level signoff runs', 1],
      [3, 'Close the analog waivers', 0.5, 1],
      [4, 'Sign off the power manager and always-on domain', 0.5],
    ],
    [
      'Analog reliability review',
      'Top-level signoff confirmation for the analog macros',
      'Analog waiver closure',
      'PMU and always-on signoff',
    ],
    [['PMU-D7', 'produces']],
  ),

  /* --- virtual platform and developer playground --- */
  'VP-01': act(
    'virtualPlatform',
    [0, 16],
    'Virtual platform engineer',
    [
      [1, 'Model the scalar core, memory map and interrupt controller', 3],
      [2, 'Model the peripherals — GPIO, timers, UART, SPI, I2C', 4],
      [3, 'Integrate the fabric simulator from CMP-03', 3],
      [4, 'Boot the SDK’s first examples and the benchmark suite', 2, 1],
      [5, 'Release the virtual platform', 1],
    ],
    [
      'Scalar core, memory map and interrupt model',
      'Peripheral models',
      'Fabric simulator integration',
      'Examples and benchmarks running on the platform',
      'SoC virtual platform, released',
    ],
    [['VP-D1', 'produces']],
  ),
  'VP-02': act(
    'virtualPlatform',
    [16, 32],
    'Prototyping engineer',
    [
      [1, 'Take each verified FPGA image from FPV-03 with its known issues', 1],
      [2, 'Package the image with the board set-up and flashing guide', 2],
      [3, 'Distribute the prototype boards to the SDK, compiler and early-access teams', 3],
      [4, 'Route the bugs software finds into the FPV-05 tracker', 3, 1],
      [5, 'Release the prototype to the software teams', 1],
    ],
    [
      'Verified FPGA image intake per RTL drop',
      'Image package with set-up and flashing guide',
      'Prototype board distribution record',
      'Software-found bugs in the FPGA tracker',
      'FPGA prototype, released to software',
    ],
    [['VP-D2', 'produces']],
  ),
  'VP-03': act(
    'virtualPlatform',
    [18, 38],
    'Developer platform lead',
    [
      [1, 'Build the browser editor and job service around the compiler', 5],
      [2, 'Run compiled code on the simulator in the cloud', 4],
      [3, 'Show cycle and energy reports per code region', 3],
      [4, 'Add sample projects and tutorials', 3, 1],
      [5, 'Harden security, quotas and account sign-up', 2],
      [6, 'Open the Playground to beta users', 1],
    ],
    [
      'Browser editor and compile job service',
      'Cloud simulation back end',
      'Per-region cycle and energy reports',
      'Sample projects and tutorials',
      'Security, quota and sign-up hardening',
      'Developer Playground beta',
    ],
    [['VP-D3', 'produces']],
  ),
  'VP-04': act(
    'virtualPlatform',
    [24, 38],
    'Tools engineer',
    [
      [1, 'Turn per-region energy into battery-lifetime estimates', 3],
      [2, 'Model duty cycles, sleep modes and wake sources', 3],
      [3, 'Correlate the estimates against the PMU energy budget', 2, 1],
      [4, 'Release the energy profiler and lifetime modeller', 1],
    ],
    [
      'Battery-lifetime estimator',
      'Duty-cycle and sleep-mode model',
      'Correlation against the PMU energy budget',
      'Energy profiler and lifetime modeller, released',
    ],
    [['VP-D4', 'produces']],
  ),
  'VP-05': act(
    'virtualPlatform',
    [38, 42],
    'Developer platform lead',
    [
      [1, 'Run the launch checklist — documentation, samples, support channels', 1],
      [2, 'Load-test the service', 1, 1],
      [3, 'Decide go or no-go and announce', 0.5],
    ],
    [
      'Launch checklist, complete',
      'Service load-test results',
      'Playground launch decision and announcement',
    ],
    [['VP-D5', 'produces']],
  ),

  /* --- FPGA prototype verification --- */
  'FPV-01': act(
    'fpgaVerification',
    [0, 6],
    'FPGA verification lead',
    [
      [1, 'Split the verification scope between simulation, emulation and the FPGA prototype, feature by feature', 1.5],
      [2, 'List what only the FPGA can prove — real peripherals, boot, long runs, compiled workloads at speed', 1],
      [3, 'Write the test list with owners and the RTL drop each test needs', 1.5],
      [4, 'Set the coverage targets and the exit criteria for signoff', 1, 1],
      [5, 'Review the plan with DV, firmware and the compiler team', 1],
    ],
    [
      'Verification scope split by feature and method',
      'FPGA-only verification targets',
      'FPGA test list with owners and RTL drops',
      'Coverage targets and signoff exit criteria',
      'FPGA verification plan, reviewed',
    ],
    [['FPV-D1', 'produces']],
  ),
  'FPV-02': act(
    'fpgaVerification',
    [2, 8],
    'Prototyping engineer',
    [
      [1, 'Size the design against FPGA capacity and choose the platform', 1.5],
      [2, 'Decide the fabric configuration that fits — the full array or a reduced tile count', 1.5],
      [3, 'Plan the clock scaling and peripheral timing at prototype speed', 1, 1],
      [4, 'Replace the PMU, oscillators and eMRAM with FPGA models and stubs', 2],
      [5, 'Record what the prototype cannot show — power gating, analog behaviour, silicon timing', 1],
      [6, 'Release the platform plan', 0.5],
    ],
    [
      'FPGA capacity estimate and platform choice',
      'Prototype fabric configuration',
      'Prototype clock and peripheral timing plan',
      'PMU, oscillator and eMRAM models for the FPGA',
      'Coverage gaps the FPGA cannot close, with their owners',
      'FPGA platform, capacity and model plan',
    ],
    [['FPV-D2', 'produces'], ['FPV-D1', 'feeds']],
  ),
  'FPV-03': act(
    'fpgaVerification',
    [8, 22],
    'Prototyping engineer',
    [
      [1, 'Synthesise and place each RTL drop onto the FPGA', 4],
      [2, 'Close FPGA timing at the prototype clock', 3],
      [3, 'Boot the ROM image and run the smoke tests', 2],
      [4, 'Tag each image with its RTL drop and known issues', 1, 1],
      [5, 'Release the verified image to the test and software teams', 1],
    ],
    [
      'FPGA build per RTL drop',
      'FPGA timing closure report',
      'Boot and smoke-test results per image',
      'Image tag with RTL drop and known issues',
      'FPGA images per RTL drop, smoke-tested',
    ],
    [['FPV-D3', 'produces']],
  ),
  'FPV-04': act(
    'fpgaVerification',
    [10, 36],
    'FPGA verification lead',
    [
      [1, 'Test the peripherals against real sensors, radios and Arduino shields', 6],
      [2, 'Verify every boot path — eMRAM, UART, SPI flash, JTAG, secure boot', 4],
      [3, 'Run the compiler-generated workloads and check the results against the simulator', 6],
      [4, 'Run randomised and long-duration soak tests for stability', 6, 1],
      [5, 'Run the SDK driver and RTOS regression on the prototype', 4, 1],
      [6, 'Report the results against the test list', 2],
    ],
    [
      'Peripheral interoperability results with real devices',
      'Boot path verification results',
      'Compiled workload results against the simulator',
      'Soak and stability test results',
      'SDK driver and RTOS regression on the prototype',
      'FPGA verification results against the test list',
    ],
    [['FPV-D4', 'produces'], ['FPV-D6', 'feeds']],
  ),
  'FPV-05': act(
    'fpgaVerification',
    [10, 38],
    'FPGA verification lead',
    [
      [1, 'Triage every failure into RTL, compiler, firmware or platform', 4],
      [2, 'Track the bug burn-down with DV in one tracker', 4, 1],
      [3, 'Rerun the regression on each new RTL drop and ECO', 8],
      [4, 'Report escape trends and open issues every week', 4, 1],
      [5, 'Publish the regression dashboard', 1],
    ],
    [
      'Failure triage by owner',
      'Shared bug burn-down with DV',
      'Regression results per RTL drop and ECO',
      'Weekly escape and open-issue report',
      'FPGA bug tracker and regression dashboard',
    ],
    [['FPV-D5', 'produces'], ['FPV-D6', 'feeds']],
  ),
  'FPV-06': act(
    'fpgaVerification',
    [38, 40],
    'FPGA verification lead',
    [
      [1, 'Run the full regression on the final RTL', 1],
      [2, 'Check the results against the exit criteria', 0.5],
      [3, 'Disposition the open issues with a waiver or a fix plan', 0.5, 1],
      [4, 'Sign off and feed the tapeout Go / No-Go', 0.5],
    ],
    [
      'Full regression on the final RTL',
      'Exit criteria check',
      'Open issue dispositions',
      'FPGA verification signoff report',
    ],
    [['FPV-D6', 'produces']],
  ),

  /* --- SDK, boot ROM, HAL and RTOS --- */
  'SDK-01': act(
    'sdk',
    [0, 20],
    'Firmware lead',
    [
      [1, 'Define the boot modes — eMRAM, UART, SPI flash, JTAG', 2],
      [2, 'Write the boot ROM and its image format', 5],
      [3, 'Add image authentication and debug lock', 4, 1],
      [4, 'Verify the ROM in RTL simulation and on the FPGA', 5],
      [5, 'Freeze the ROM code with the RTL', 1],
    ],
    [
      'Boot mode definition',
      'Boot ROM code and image format',
      'Image authentication and debug lock',
      'ROM verification results in simulation and FPGA',
      'Boot ROM code, frozen for tapeout',
    ],
    [['SDK-D1', 'produces']],
  ),
  'SDK-02': act(
    'sdk',
    [8, 48],
    'Firmware engineer',
    [
      [1, 'Define the HAL API and the coding standard', 3],
      [2, 'Write the drivers for GPIO, timers, UART, SPI, I2C and ADC', 12],
      [3, 'Write the power-mode and wake-source drivers', 6],
      [4, 'Test the drivers on the virtual platform and the FPGA', 10, 1],
      [5, 'Release the HAL to early access', 2],
    ],
    [
      'HAL API and coding standard',
      'Peripheral drivers',
      'Power-mode and wake-source drivers',
      'Driver test results on platform and FPGA',
      'HAL and peripheral drivers, released',
    ],
    [['SDK-D2', 'produces']],
  ),
  'SDK-03': act(
    'sdk',
    [20, 56],
    'Firmware engineer',
    [
      [1, 'Port Zephyr and FreeRTOS to the scalar core', 8],
      [2, 'Integrate tickless idle with the sleep modes', 5],
      [3, 'Write the board support package for the EVK', 5],
      [4, 'Offload RTOS tasks to the fabric through the compiler', 6, 1],
      [5, 'Release the RTOS ports', 2],
    ],
    [
      'Zephyr and FreeRTOS ports',
      'Tickless idle with sleep-mode integration',
      'EVK board support package',
      'Fabric offload from RTOS tasks',
      'RTOS ports and board support packages, released',
    ],
    [['SDK-D3', 'produces']],
  ),
  'SDK-04': act(
    'sdk',
    [24, 64],
    'Applications engineer',
    [
      [1, 'Pick the kernels — FFT, FIR, matrix, convolution, image filters', 3],
      [2, 'Hand-optimise each kernel for the fabric', 14],
      [3, 'Wrap the ML runtime around the compiled models', 8],
      [4, 'Benchmark each kernel against the incumbent MCUs', 6, 1],
      [5, 'Release the libraries', 2],
    ],
    [
      'Kernel selection',
      'Fabric-optimised kernels',
      'ML runtime for compiled models',
      'Kernel benchmark results',
      'DSP, image and ML libraries, released',
    ],
    [['SDK-D4', 'produces']],
  ),
  'SDK-05': act(
    'sdk',
    [40, 76],
    'Technical writer',
    [
      [1, 'Write the quick-start and toolchain installation guides', 4],
      [2, 'Write the reference manual and API documentation', 10],
      [3, 'Build an example application for each target segment', 8, 1],
      [4, 'Publish the documentation portal', 4],
      [5, 'Review the documentation with early-access users', 3],
    ],
    [
      'Quick-start and installation guides',
      'Reference manual and API documentation',
      'Example applications per segment',
      'Documentation portal, published',
      'Documentation review with early-access users',
    ],
    [['SDK-D5', 'produces']],
  ),
  'SDK-06': act(
    'sdk',
    [72, 80],
    'Firmware lead',
    [
      [1, 'Bring the SDK up on first silicon with the bring-up team', 2],
      [2, 'Rerun the driver and library test suites on silicon', 2],
      [3, 'Fix silicon-specific issues and document the errata workarounds', 2, 1],
      [4, 'Release the SDK Beta', 0.5],
    ],
    [
      'SDK running on first silicon',
      'Driver and library results on silicon',
      'Silicon fixes and errata workarounds',
      'SDK Beta, validated on first silicon',
    ],
    [['SDK-D6', 'produces']],
  ),

  /* --- package design --- */
  'EPKG-01': act(
    'packageEmb',
    [0, 6],
    'Package architect',
    [
      [1, 'Consolidate the package requirements — I/O count, supply pins, footprint, cost', 1],
      [2, 'Compare the QFN, FC-CSP and WLCSP options', 1.5],
      [3, 'Check the EVK and customer board constraints', 1, 1],
      [4, 'Cost each option against the product cost model', 1],
      [5, 'Select the package and record the choice', 0.5],
    ],
    [
      'Package requirement summary',
      'QFN, FC-CSP and WLCSP comparison',
      'Board constraint review',
      'Package cost comparison',
      'Package selection record',
    ],
    [['EPKG-D1', 'produces']],
  ),
  'EPKG-02': act(
    'packageEmb',
    [4, 12],
    'Package architect',
    [
      [1, 'Assign the GPIOs, serial interfaces and debug pins', 1.5],
      [2, 'Place the supply and ground pins against the regulator topology', 1],
      [3, 'Plan the pad ring and bond pads with physical design', 1.5],
      [4, 'Review the pin-out with the EVK and applications teams', 1, 1],
      [5, 'Freeze the pin-out', 0.5],
    ],
    [
      'Signal pin assignment',
      'Supply and ground pin plan',
      'Pad ring and bond pad plan',
      'Pin-out review with EVK and applications',
      'Pin-out, pad ring and lead map, frozen',
    ],
    [['EPKG-D2', 'produces'], ['EPKG-D3', 'feeds']],
  ),
  'EPKG-03': act(
    'packageEmb',
    [10, 20],
    'Package designer',
    [
      [1, 'Design the leadframe or substrate routing', 3],
      [2, 'Draw the wire-bond diagram or bump map', 1.5],
      [3, 'Run package DRC against the supplier rules', 1],
      [4, 'Release the package design database', 0.5],
    ],
    [
      'Leadframe or substrate routing',
      'Wire-bond diagram or bump map',
      'Package DRC report',
      'Leadframe or substrate design database',
    ],
    [['EPKG-D3', 'produces']],
  ),
  'EPKG-04': act(
    'packageEmb',
    [12, 22],
    'SI/PI engineer',
    [
      [1, 'Extract the package parasitics per pin', 1.5],
      [2, 'Simulate supply noise on the always-on and eMRAM supplies', 1.5],
      [3, 'Model thermal resistance in the highest-power mode', 1, 1],
      [4, 'Release the package models to the board and signoff teams', 0.5],
    ],
    [
      'Package parasitics per pin',
      'Supply noise results on sensitive rails',
      'Package thermal model',
      'Package electrical and thermal models, released',
    ],
    [['EPKG-D4', 'produces']],
  ),
  'EPKG-05': act(
    'packageEmb',
    [12, 22],
    'Supply chain manager',
    [
      [1, 'Screen the OSATs for the package and the volume', 1],
      [2, 'Define the assembly flow and its test insertions', 1.5],
      [3, 'Agree capacity, lead times and pricing', 1.5, 1],
      [4, 'Select the OSAT and issue the assembly specification', 0.5],
    ],
    [
      'OSAT screening',
      'Assembly flow and test insertions',
      'OSAT capacity, lead time and pricing',
      'OSAT selection and assembly specification',
    ],
    [['EPKG-D5', 'produces']],
  ),
  'EPKG-06': act(
    'packageEmb',
    [22, 26],
    'Package architect',
    [
      [1, 'Review the design against the pad ring and the signoff inputs', 1],
      [2, 'Close the open package DRC and supplier comments', 1],
      [3, 'Release the tooling orders to the leadframe or substrate supplier', 1, 1],
      [4, 'Freeze the package design', 0.5],
    ],
    [
      'Package review against pad ring and signoff inputs',
      'Package DRC and supplier comment closure',
      'Tooling purchase orders',
      'Package design freeze and tooling release',
    ],
    [['EPKG-D6', 'produces']],
  ),

  /* --- early access and customer design-in --- */
  'EAP-01': act(
    'earlyAccess',
    [0, 8],
    'Product marketing lead',
    [
      [1, 'Pick the target segments and the lighthouse accounts', 2],
      [2, 'Define what early access gives — tools, samples, support', 1.5],
      [3, 'Define the entry criteria and the success measures', 1, 1],
      [4, 'Release the programme charter', 0.5],
    ],
    [
      'Target segments and lighthouse accounts',
      'Early-access offer definition',
      'Entry criteria and success measures',
      'Early access programme charter',
    ],
    [['EAP-D1', 'produces']],
  ),
  'EAP-02': act(
    'earlyAccess',
    [6, 18],
    'Business development lead',
    [
      [1, 'Brief the candidate accounts under NDA', 3],
      [2, 'Qualify each against the programme criteria', 2],
      [3, 'Negotiate the early-access agreements', 4, 1],
      [4, 'Sign the agreements', 1],
    ],
    [
      'Candidate account briefings',
      'Account qualification against the criteria',
      'Negotiated agreement terms',
      'Signed early-access agreements',
    ],
    [['EAP-D2', 'produces']],
  ),
  'EAP-03': act(
    'earlyAccess',
    [18, 44],
    'Field applications engineer',
    [
      [1, 'Onboard the partners onto the Playground and the compiler', 3],
      [2, 'Port each partner’s workload to the fabric', 8],
      [3, 'Estimate energy and battery life against their current parts', 4],
      [4, 'Hold regular technical reviews with each partner', 6, 1],
      [5, 'Record the onboarding outcomes', 1],
    ],
    [
      'Partner Playground and compiler accounts',
      'Partner workloads ported to the fabric',
      'Energy and battery-life estimates per partner',
      'Partner technical review minutes',
      'Pre-silicon onboarding record',
    ],
    [['EAP-D3', 'produces']],
  ),
  'EAP-04': act(
    'earlyAccess',
    [18, 80],
    'Product manager',
    [
      [1, 'Capture every partner issue in one tracker', 3],
      [2, 'Triage each into compiler, SDK, silicon errata or documentation', 6],
      [3, 'Feed the priorities into the release plans', 6, 1],
      [4, 'Report closure back to each partner', 3],
      [5, 'Issue the feedback log', 1],
    ],
    [
      'Partner issue tracker',
      'Issue triage by product area',
      'Release plan priorities from partner feedback',
      'Closure reports to partners',
      'Customer feedback log',
    ],
    [['EAP-D5', 'produces']],
  ),
  'EAP-05': act(
    'earlyAccess',
    [60, 72],
    'Field applications engineer',
    [
      [1, 'Allocate engineering samples and EVT boards to the partners', 1],
      [2, 'Ship them with the SDK Beta and the errata', 1],
      [3, 'Support the first power-on at each partner', 3, 1],
      [4, 'Record which partner holds which units', 0.5],
    ],
    [
      'Sample and EVT board allocation',
      'Shipments with SDK Beta and errata',
      'First power-on support reports',
      'Partner unit register',
    ],
    [['EAP-D4', 'produces']],
  ),
  'EAP-06': act(
    'earlyAccess',
    [70, 86],
    'Field applications engineer',
    [
      [1, 'Review each partner’s schematic and firmware', 4],
      [2, 'Support their prototypes through to production intent', 6],
      [3, 'Agree forecasts and production pricing', 3, 1],
      [4, 'Record the first design-win', 1],
    ],
    [
      'Partner schematic and firmware reviews',
      'Partner prototype support record',
      'Forecasts and production pricing',
      'First design-win record',
    ],
    [['EAP-D6', 'produces']],
  ),

  /* --- EVK design and EVT build --- */
  'EVK-01': act(
    'evkDesign',
    [0, 6],
    'EVK product manager',
    [
      [1, 'Collect what developers need — Arduino UNO and MKR headers, GPIO access, USB', 1],
      [2, 'Define the energy instrumentation — current sensors and shunts on each rail', 1.5],
      [3, 'Define the power options — battery, USB, external supply', 1],
      [4, 'Set the cost, volume and certification targets', 1, 1],
      [5, 'Release the EVK requirements', 0.5],
    ],
    [
      'Developer interface requirements',
      'Energy instrumentation requirements',
      'Power option requirements',
      'EVK cost, volume and certification targets',
      'EVK product requirements',
    ],
    [['EVK-D1', 'produces']],
  ),
  'EVK-02': act(
    'evkDesign',
    [4, 16],
    'Board design engineer',
    [
      [1, 'Design the power tree and the source selection', 2],
      [2, 'Design the current sensing on each processor rail', 2],
      [3, 'Design the on-board programmer, USB and JTAG debug', 2],
      [4, 'Route the GPIOs to the Arduino and processor headers, with boot-mode switches', 2, 1],
      [5, 'Review the schematic and freeze the BOM against lead times', 1.5],
    ],
    [
      'Power tree and source selection schematic',
      'Current sensing schematic',
      'Programmer, USB and JTAG schematic',
      'Header and boot-mode switch schematic',
      'EVK schematics and BOM',
    ],
    [['EVK-D2', 'produces']],
  ),
  'EVK-03': act(
    'evkDesign',
    [14, 26],
    'PCB designer',
    [
      [1, 'Plan the stack-up and floorplan the board', 2],
      [2, 'Route with a low-noise layout on the sense paths', 4],
      [3, 'Simulate power integrity on the processor supplies', 2, 1],
      [4, 'Run the DFM review with the board house', 1],
      [5, 'Release the layout for fabrication', 0.5],
    ],
    [
      'Stack-up and board floorplan',
      'Low-noise sense-path routing',
      'Board power integrity results',
      'DFM review record',
      'EVK layout database, released',
    ],
    [['EVK-D3', 'produces']],
  ),
  'EVK-04': act(
    'evkDesign',
    [26, 38],
    'Board design engineer',
    [
      [1, 'Fabricate and assemble the proto boards', 4],
      [2, 'Bring up power, programmer and USB with no processor fitted', 2],
      [3, 'Calibrate the current sensors against a reference meter', 2, 1],
      [4, 'Fix the proto issues for the EVT revision', 2],
      [5, 'Release the proto bring-up report', 0.5],
    ],
    [
      'Assembled proto boards',
      'Proto bring-up without silicon',
      'Current sensor calibration data',
      'EVT revision change list',
      'Proto boards, verified without silicon',
    ],
    [['EVK-D4', 'produces']],
  ),
  'EVK-05': act(
    'evkDesign',
    [40, 44],
    'Board design engineer',
    [
      [1, 'Fit engineering samples to the EVT boards', 1],
      [2, 'Program the first firmware and run the SDK examples', 1.5],
      [3, 'Measure sleep and active currents against the datasheet targets', 1, 1],
      [4, 'Release the EVT boards to the software and early-access teams', 0.5],
    ],
    [
      'EVT boards with engineering samples fitted',
      'SDK examples running on EVT',
      'Sleep and active current measurements',
      'EVT boards built with engineering samples',
    ],
    [['EVK-D5', 'produces']],
  ),

  /* --- assembly and engineering samples --- */
  'EASSY-01': act(
    'assemblyEmb',
    [0, 14],
    'Package engineer',
    [
      [1, 'Release the frozen package drawings to the supplier', 0.5],
      [2, 'Build and inspect the first leadframe or substrate lots', 6],
      [3, 'Build the bond, mold and trim-form tooling', 5, 1],
      [4, 'Qualify the tooling on dummy dice', 2],
      [5, 'Release the tooling and materials to the OSAT line', 0.5],
    ],
    [
      'Package drawings released to the supplier',
      'First leadframe or substrate lots',
      'Bond, mold and trim-form tooling',
      'Tooling qualification on dummy dice',
      'Assembly tooling and materials, qualified',
    ],
    [['EASSY-D1', 'produces'], ['EASSY-D3', 'feeds']],
  ),
  'EASSY-02': act(
    'assemblyEmb',
    [19, 22],
    'Test engineer',
    [
      [1, 'Receive the first wafers and set up the prober', 0.5],
      [2, 'Sort against the engineering limits, including eMRAM trim', 1.5],
      [3, 'Review the wafer maps and disposition the marginal die', 1],
      [4, 'Bank the good die with traceability', 0.5],
    ],
    [
      'Prober set up for the first wafers',
      'First-lot sort data with eMRAM trim',
      'Wafer map review and dispositions',
      'First-lot wafer sort results and die bank',
    ],
    [['EASSY-D2', 'produces'], ['EASSY-D3', 'feeds']],
  ),
  'EASSY-03': act(
    'assemblyEmb',
    [21, 25],
    'Package engineer',
    [
      [1, 'Backgrind and dice the wafers', 0.5],
      [2, 'Attach the die and wire-bond it, or flip-chip attach', 1],
      [3, 'Mold, mark and singulate', 1],
      [4, 'Run the package open/short and continuity test', 0.5, 1],
      [5, 'Release the assembled engineering lot', 0.5],
    ],
    [
      'Thinned and diced wafers',
      'Attached and bonded die',
      'Molded, marked and singulated units',
      'Open/short and continuity results',
      'Engineering sample lot, assembled',
    ],
    [['EASSY-D3', 'produces']],
  ),
  'EASSY-04': act(
    'assemblyEmb',
    [22, 26],
    'Quality engineer',
    [
      [1, 'X-ray the wire bonds and inspect for voids', 0.5],
      [2, 'Run acoustic microscopy on the molded units', 0.5],
      [3, 'Build the yield pareto by process step', 1],
      [4, 'Agree the corrective actions with the OSAT', 1, 1],
      [5, 'Issue the assembly yield report', 0.5],
    ],
    [
      'Wire-bond X-ray and void inspection',
      'Acoustic microscopy results',
      'Assembly yield pareto',
      'OSAT corrective action list',
      'Assembly inspection and yield report',
    ],
    [['EASSY-D4', 'produces']],
  ),
  'EASSY-05': act(
    'assemblyEmb',
    [23, 26],
    'Program manager',
    [
      [1, 'Collect the demand from bring-up, EVK, qualification and early access', 0.5],
      [2, 'Allocate the units by priority and lot', 0.5],
      [3, 'Ship the allocated units with traceability', 1],
      [4, 'Release the allocation record', 0.5],
    ],
    [
      'Unit demand by consumer',
      'Unit allocation by priority and lot',
      'Allocated unit shipments',
      'Unit allocation plan and record',
    ],
    [['EASSY-D5', 'produces']],
  ),

  /* --- silicon correlation and software 1.0 --- */
  'CREL-01': act(
    'softwareRelease',
    [4, 14],
    'Performance architect',
    [
      [1, 'Plan the correlation workloads and the measurement set-up', 1],
      [2, 'Measure cycles and energy per code region on silicon', 3],
      [3, 'Compare with the simulator and the energy profiler', 2],
      [4, 'Recalibrate the models and the lifetime modeller', 2, 1],
      [5, 'Issue the correlation report', 1],
    ],
    [
      'Correlation workload and measurement plan',
      'Silicon cycle and energy measurements',
      'Model-to-silicon comparison',
      'Recalibrated models and lifetime modeller',
      'Silicon correlation report',
    ],
    [['CREL-D1', 'produces']],
  ),
  'CREL-02': act(
    'softwareRelease',
    [6, 16],
    'Compiler architect',
    [
      [1, 'Run the regression suite on silicon through the bring-up boards', 2],
      [2, 'Tune the scheduling against the measured timing', 3],
      [3, 'Close the beta blockers', 3, 1],
      [4, 'Release the Compiler Beta', 0.5],
    ],
    [
      'Regression results on silicon',
      'Scheduler tuning from measured timing',
      'Beta blocker fixes',
      'Compiler Beta on silicon',
    ],
    [['CREL-D2', 'produces']],
  ),
  'CREL-03': act(
    'softwareRelease',
    [8, 20],
    'Release manager',
    [
      [1, 'Set the versioning, support window and deprecation policy', 1],
      [2, 'Automate the builds, signing and installers for each host OS', 4],
      [3, 'Set up the issue tracker and the customer support flow', 2, 1],
      [4, 'Document the long-term support process', 1],
    ],
    [
      'Versioning and support policy',
      'Automated builds, signing and installers',
      'Issue tracker and support flow',
      'Release engineering and long-term support process',
    ],
    [['CREL-D4', 'produces']],
  ),
  'CREL-04': act(
    'softwareRelease',
    [10, 18],
    'Applications engineer',
    [
      [1, 'Run the benchmark suite on silicon at each operating point', 2],
      [2, 'Compare against the incumbent MCUs and DSPs', 2],
      [3, 'Have the results reviewed for publication', 1.5, 1],
      [4, 'Publish the benchmark and energy results', 0.5],
    ],
    [
      'Silicon benchmark runs per operating point',
      'Comparison against incumbent parts',
      'Publication review record',
      'Benchmark and energy results on silicon, published',
    ],
    [['CREL-D3', 'produces']],
  ),
  'CREL-05': act(
    'softwareRelease',
    [18, 24],
    'Release manager',
    [
      [1, 'Run the GA regression across the compiler, the SDK and the EVK', 2],
      [2, 'Review the GA criteria and the open issues', 1],
      [3, 'Finish the release notes and the migration guide', 1, 1],
      [4, 'Release Compiler and SDK 1.0', 1],
    ],
    [
      'GA regression results',
      'GA criteria review',
      'Release notes and migration guide',
      'Compiler and SDK 1.0 GA release',
    ],
    [['CREL-D5', 'produces']],
  ),

  /* --- EVK validation, certification and launch --- */
  'EVKL-01': act(
    'evkLaunch',
    [0, 6],
    'Board design engineer',
    [
      [1, 'Validate every interface against the requirements', 2],
      [2, 'Check measurement accuracy across the current range', 1.5],
      [3, 'Run the SDK and example regression on EVT', 1.5, 1],
      [4, 'Issue the EVT report and the DVT change list', 0.5],
    ],
    [
      'Interface validation results',
      'Measurement accuracy results',
      'SDK and example regression on EVT',
      'EVT validation report and DVT change list',
    ],
    [['EVKL-D1', 'produces']],
  ),
  'EVKL-02': act(
    'evkLaunch',
    [6, 12],
    'Board design engineer',
    [
      [1, 'Build the DVT boards with the changes', 2],
      [2, 'Validate the fixes and the environmental margins', 2],
      [3, 'Run an EMC pre-scan', 1, 1],
      [4, 'Release the DVT report', 0.5],
    ],
    ['DVT boards with the EVT changes', 'DVT fix and margin validation', 'EMC pre-scan results', 'DVT boards, validated'],
    [['EVKL-D2', 'produces']],
  ),
  'EVKL-03': act(
    'evkLaunch',
    [10, 18],
    'Compliance engineer',
    [
      [1, 'Book the accredited test lab', 0.5],
      [2, 'Test radiated and conducted emissions and immunity', 3],
      [3, 'Fix and retest any failures', 2],
      [4, 'File the FCC, CE and UKCA declarations', 1.5],
      [5, 'Release the certification record', 0.5],
    ],
    [
      'Test lab booking',
      'Emissions and immunity test results',
      'Failure fixes and retest results',
      'FCC, CE and UKCA declarations',
      'EMC and safety certification record',
    ],
    [['EVKL-D3', 'produces']],
  ),
  'EVKL-04': act(
    'evkLaunch',
    [12, 20],
    'Manufacturing engineer',
    [
      [1, 'Release the production BOM and the end-of-line test fixture', 1.5],
      [2, 'Build the PVT lot on the production line', 3],
      [3, 'Verify the yield and the end-of-line test', 2, 1],
      [4, 'Release the EVK to production', 0.5],
    ],
    [
      'Production BOM and test fixture',
      'PVT lot built on the production line',
      'PVT yield and end-of-line test results',
      'PVT build and production release',
    ],
    [['EVKL-D4', 'produces']],
  ),
  'EVKL-05': act(
    'evkLaunch',
    [16, 22],
    'EVK product manager',
    [
      [1, 'Set the pricing and the distribution channel', 1],
      [2, 'Prepare the box contents, quick-start card and product pages', 2],
      [3, 'Train the field application engineers', 1, 1],
      [4, 'Launch the EVK for general availability', 1],
    ],
    [
      'Pricing and distribution channel',
      'Box contents, quick-start card and product pages',
      'FAE training',
      'EVK launch package',
    ],
    [['EVKL-D5', 'produces']],
  ),
};

export const EMBEDDED_ACTIVITY_TITLES: Record<string, string> = {
  'FCD-01': 'Embedded Workload Suite and Energy Baselines',
  'FCD-02': 'Processing Element and Fabric ISA Definition',
  'FCD-03': 'Memory Hierarchy and Data Placement Model',
  'FCD-04': 'Compiler–Hardware Contract and Configuration Format',
  'FCD-05': 'Cycle and Energy Model with Correlation Plan',
  'FCD-06': 'Co-Design Review and Architecture Freeze',
  'CMP-01': 'Compiler Architecture and Release Plan',
  'CMP-02': 'Front End and Dataflow Extraction',
  'CMP-03': 'Functional and Cycle-Level Simulator',
  'CMP-04': 'Placement, Routing and Static Scheduling',
  'CMP-05': 'ML Model Import — LiteRT and ONNX',
  'CMP-06': 'Debugger and Energy Profiler Integration',
  'CMP-07': 'Compiler Alpha Release',
  'MRAM-01': 'eMRAM Macro Selection and Configuration',
  'MRAM-02': 'eMRAM Controller, ECC and Trim Architecture',
  'MRAM-03': 'Retention, Endurance and Reflow Survival Plan',
  'MRAM-04': 'Magnetic Immunity and Shielding Assessment',
  'MRAM-05': 'Macro Integration and View Qualification',
  'MRAM-06': 'eMRAM Test, Repair and Trim Flow',
  'MRAM-07': 'eMRAM Integration Signoff',
  'PMU-01': 'Power Architecture and Operating Mode Definition',
  'PMU-02': 'Clock Sources and PLL',
  'PMU-03': 'Regulator, Power-On Reset and Brown-Out Design',
  'PMU-04': 'Always-On Domain and Wake Sources',
  'PMU-05': 'Analog Layout, Extraction and Macro Views',
  'PMU-06': 'Mode Transition and Energy Budget Verification',
  'PMU-07': 'PMU and Always-On Signoff',
  'VP-01': 'SoC Virtual Platform',
  'VP-02': 'FPGA Prototype Release to Software Teams',
  'VP-03': 'Developer Playground',
  'VP-04': 'Energy Profiler and Lifetime Modeller',
  'VP-05': 'Playground Launch Readiness',
  'FPV-01': 'FPGA Verification Plan and Exit Criteria',
  'FPV-02': 'FPGA Platform, Capacity and Model Plan',
  'FPV-03': 'FPGA Bring-Up per RTL Drop',
  'FPV-04': 'FPGA Verification Execution',
  'FPV-05': 'Bug Tracking and Regression per Drop',
  'FPV-06': 'FPGA Verification Signoff',
  'SDK-01': 'Boot ROM and Secure Boot',
  'SDK-02': 'HAL and Peripheral Drivers',
  'SDK-03': 'RTOS Ports and Board Support Packages',
  'SDK-04': 'DSP, Image and ML Libraries',
  'SDK-05': 'Examples, Documentation and Developer Portal',
  'SDK-06': 'Silicon Port and SDK Beta',
  'EPKG-01': 'Package Selection — QFN, FC-CSP or WLCSP',
  'EPKG-02': 'Pin-Out, Pad Ring and Lead Map',
  'EPKG-03': 'Leadframe or Substrate Design',
  'EPKG-04': 'Package Electrical and Thermal Modelling',
  'EPKG-05': 'OSAT Selection and Assembly Flow',
  'EPKG-06': 'Package Design Freeze and Tooling Release',
  'EAP-01': 'Early Access Programme Definition',
  'EAP-02': 'Partner Selection and Agreements',
  'EAP-03': 'Pre-Silicon Onboarding on the Playground',
  'EAP-04': 'Customer Feedback Loop into Compiler, SDK and Silicon',
  'EAP-05': 'Engineering Sample and EVK Seeding',
  'EAP-06': 'Design-In Support and First Design-Win',
  'EVK-01': 'EVK Requirements',
  'EVK-02': 'EVK Schematic and BOM',
  'EVK-03': 'EVK PCB Layout and Measurement Accuracy',
  'EVK-04': 'Proto Build and Board Bring-Up without Silicon',
  'EVK-05': 'EVT Build with Engineering Samples',
  'EASSY-01': 'Leadframe, Substrate and Tooling Build',
  'EASSY-02': 'First-Lot Wafer Sort and Die Bank',
  'EASSY-03': 'Engineering Lot Assembly',
  'EASSY-04': 'Assembly Inspection and Yield Review',
  'EASSY-05': 'Unit Allocation for Bring-Up, EVK and Customers',
  'CREL-01': 'Model-to-Silicon Correlation',
  'CREL-02': 'Compiler Beta on Silicon',
  'CREL-03': 'Release Engineering and Long-Term Support',
  'CREL-04': 'Silicon Benchmarks and Energy Results',
  'CREL-05': 'Compiler and SDK 1.0 General Availability',
  'EVKL-01': 'EVT Validation',
  'EVKL-02': 'DVT Build and Validation',
  'EVKL-03': 'EMC and Safety Certification',
  'EVKL-04': 'PVT Build and Production Release',
  'EVKL-05': 'EVK Launch and Distribution',
};

/* ---------- stage content ---------- */

const leaderOf = (name: string, short: string, line: string, mail: string) => ({
  name,
  short,
  phone: `+1 (408) 555-${line}`,
  email: mail,
});

const refsOf = (stage: string) => Object.keys(EMBEDDED_ACTIVITIES).filter((r) => EMBEDDED_ACTIVITIES[r].st === stage);

/**
 * A stage's aligned arrays, taken from its activities rather than typed a
 * second time: the titles, windows and starts are the activities', so the two
 * cannot disagree. Man-months are authored per activity and passed in.
 */
const aligned = (stage: string, effort: number[]) => {
  const refs = refsOf(stage);
  return {
    engineeringView: refs.map((r) => EMBEDDED_ACTIVITY_TITLES[r]),
    engineeringTat: refs.map((r) => EMBEDDED_ACTIVITIES[r].w[1] - EMBEDDED_ACTIVITIES[r].w[0]),
    engineeringStart: refs.map((r) => EMBEDDED_ACTIVITIES[r].w[0]),
    engineeringEffort: effort,
  };
};

export const EMBEDDED_STAGES: readonly EmbeddedStage[] = [
  {
    id: 'fabricCodesign',
    stage: 30,
    title: 'Compute Fabric & Compiler Co-Design',
    shortTitle: 'FCD',
    tagline: 'The hardware and the compiler are one design.',
    description:
      'Decide what the processing fabric does in hardware and what the compiler does for it, against the workloads the part is sold on. A spatial dataflow processor is only as efficient as the compiler that maps code onto it, so the ISA, the memory placement model and the compiler contract are frozen together — before RTL is written against any of them.',
    activities: ['Benchmark suite', 'Fabric ISA', 'Memory placement', 'Compiler contract', 'Energy model', 'Co-design freeze'],
    deliverables: [
      'Embedded workload and benchmark suite with energy baselines',
      'Fabric ISA specification',
      'Memory access and placement model',
      'Compiler–hardware contract',
      'Cycle and energy model with accuracy bounds',
      'Fabric and compiler co-design freeze package',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [5, 9, 10, 13, 14, 16],
    ...aligned('fabricCodesign', [4, 8, 5, 6, 6, 3]),
    risks: ['Contract reopened after RTL starts', 'Benchmarks unrepresentative', 'Energy model uncorrelated'],
    potentialRisks: [
      'ISA features added for a benchmark no customer runs',
      'Compiler team not in the room when the fabric is sized',
      'Energy claims resting on a model nobody has correlated',
      'Memory placement rules the compiler cannot actually apply',
      'Scalar control path under-specified because the fabric took the attention',
    ],
    leader: leaderOf('Daniel Okafor', 'D. Okafor', '0412', 'daniel.okafor@example.com'),
    collaboration: ['Architecture', 'Compiler', 'Applications', 'Physical design'],
    tools: ['Cycle-level model', 'MLIR', 'Benchmark harness', 'Energy model'],
    programView: ['Co-design freeze date', 'Benchmark targets vs model', 'Contract open items'],
    perspective:
      'On a dataflow part the compiler is half the architecture. Freeze the contract with both teams signing it, or the silicon ships with features the compiler never uses and the compiler ships waiting for features the silicon never got.',
  },
  {
    id: 'compiler',
    stage: 31,
    title: 'Compiler Toolchain Development',
    shortTitle: 'CMP',
    tagline: 'Ordinary C in, a configured fabric out.',
    description:
      'Build the compiler that makes the part programmable: a drop-in replacement for GCC and Clang, built on LLVM and MLIR, that turns C, C++ and LiteRT / ONNX models into statically scheduled dataflow on the fabric — with a simulator to run it before silicon, a debugger and a per-region energy profiler. Its alpha ships in the Playground, before tapeout.',
    activities: ['Front end', 'Simulator', 'Mapper and scheduler', 'Model import', 'Debug and profiling', 'Alpha release'],
    deliverables: [
      'Compiler architecture and release plan',
      'Front end and dataflow extraction on LLVM and MLIR',
      'Functional and cycle-level simulator',
      'Fabric mapper, router and static scheduler',
      'LiteRT and ONNX model import path',
      'Debugger and energy profiler',
      'Compiler Alpha release with regression suite',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [6, 24, 30, 36, 42, 44, 48],
    ...aligned('compiler', [4, 20, 18, 30, 16, 12, 6]),
    risks: ['Mapper quality below the energy claims', 'Compile time in hours', 'Model coverage gaps'],
    potentialRisks: [
      'Benchmarks hand-tuned while ordinary code maps poorly',
      'GCC/Clang compatibility assumed rather than tested against real builds',
      'Simulator accuracy never stated, so energy numbers cannot be trusted',
      'Operator coverage for customer models discovered at onboarding',
      'Alpha date held by cutting the regression rather than the scope',
    ],
    leader: leaderOf('Priya Raman', 'P. Raman', '0428', 'priya.raman@example.com'),
    collaboration: ['Architecture', 'SDK', 'Developer platform', 'Applications'],
    tools: ['LLVM', 'MLIR', 'Clang', 'GDB', 'Simulator'],
    programView: ['Compiler Alpha date', 'Benchmark energy vs target', 'Model operator coverage', 'Compile time trend'],
    perspective:
      'Customers judge a new architecture by the first afternoon with its compiler. Track energy on ordinary code, not just the showcase kernels.',
  },
  {
    id: 'emram',
    stage: 32,
    title: 'Embedded MRAM Integration',
    shortTitle: 'MRAM',
    tagline: 'Non-volatile memory that has to survive solder, magnets and ten years.',
    description:
      'Select, configure and integrate the foundry’s embedded MRAM macro: the controller, ECC and trim around it, the retention and endurance it must hold, whether pre-programmed data survives solder reflow, its immunity to magnetic fields, and the test, repair and trim flow that screens it at sort.',
    activities: ['Macro selection', 'Controller and ECC', 'Retention plan', 'Magnetic immunity', 'Integration', 'Test and trim', 'Signoff'],
    deliverables: [
      'eMRAM macro selection and configuration record',
      'eMRAM controller, ECC and trim specification',
      'Retention, endurance and reflow survival plan',
      'Magnetic immunity specification and customer guidance',
      'eMRAM hard macro views, released',
      'eMRAM test, repair and trim flow',
      'eMRAM integration signoff',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [6, 14, 18, 20, 28, 30, 36],
    ...aligned('emram', [3, 8, 4, 2, 7, 5, 2]),
    risks: ['Reflow data loss', 'Macro views late', 'Magnetic sensitivity'],
    potentialRisks: [
      'Customers pre-program parts and the data does not survive reflow',
      'ECC sized for time-zero error rates rather than end of life',
      'Trim time at sort blowing the test cost model',
      'Magnetic immunity never specified to customers',
      'Macro qualified on a different flavour of the node',
    ],
    leader: leaderOf('Mei Lin Tan', 'M. Tan', '0433', 'meilin.tan@example.com'),
    collaboration: ['Foundry', 'Memory IP vendor', 'Reliability', 'Test'],
    tools: ['Memory compiler views', 'Reliability models', 'MBIST'],
    programView: ['Macro view delivery', 'Retention and reflow plan status', 'Trim test time vs budget'],
    perspective:
      'Ask the reflow question on day one. A customer who programs parts before assembly and loses the data after it is a customer you do not get back.',
  },
  {
    id: 'pmu',
    stage: 33,
    title: 'Power Management, Clocks & Always-On',
    shortTitle: 'PMU',
    tagline: 'A part that sleeps well is a part that sells.',
    description:
      'Design the power manager that lets the part run from a coin cell, USB or a 1.8–5.5 V rail: the operating and sleep modes, the regulators, power-on reset and brown-out, the oscillators and PLL, the always-on domain and its wake sources — and prove the energy of every mode against the duty cycles customers actually run.',
    activities: ['Power architecture', 'Clock sources', 'Regulators', 'Always-on domain', 'Analog layout', 'Energy budget', 'Signoff'],
    deliverables: [
      'Power architecture and operating mode specification',
      'Regulator, power-on reset and brown-out design',
      'Clock source design — oscillators and PLL',
      'Always-on domain and wake source specification',
      'Analog hard macros with views, released',
      'System energy budget per mode, verified',
      'PMU and always-on signoff',
    ],
    deliverableFrom: [0, 2, 1, 3, 4, 5, 6],
    deliverableWeek: [6, 20, 18, 16, 32, 32, 36],
    ...aligned('pmu', [3, 8, 10, 4, 8, 5, 2]),
    risks: ['Sleep current above target', 'Brown-out corruption', 'Wake latency'],
    potentialRisks: [
      'Deep-sleep leakage measured only at room temperature',
      'Regulator efficiency optimised at full load, not the light load it lives at',
      'Brown-out during an eMRAM write left undefined',
      'Wake sources promised in marketing but not wired to the always-on domain',
      'Energy budget never reconciled with the fabric model',
    ],
    leader: leaderOf('Rafael Costa', 'R. Costa', '0447', 'rafael.costa@example.com'),
    collaboration: ['Analog', 'Architecture', 'Firmware', 'Physical design'],
    tools: ['Analog simulation', 'Mixed-signal simulation', 'Power models'],
    programView: ['Sleep current vs target', 'Analog macro delivery', 'Energy budget per mode'],
    perspective:
      'Battery life is decided by the sleep current, not the active efficiency. Put the deep-sleep number on the programme dashboard from the first week.',
  },
  {
    id: 'virtualPlatform',
    stage: 34,
    title: 'Virtual Platform & Developer Playground',
    shortTitle: 'VP',
    tagline: 'Customers write code before the silicon exists.',
    description:
      'Give software and customers something to run on long before first silicon: a virtual platform of the SoC, the verified FPGA prototype of each RTL drop in the software teams’ hands, and a browser Playground where anyone can compile code, run it on the simulator and see its energy by region — with a lifetime modeller that turns that into battery life.',
    activities: ['Virtual platform', 'FPGA release to software', 'Playground', 'Energy profiler', 'Launch'],
    deliverables: [
      'SoC virtual platform for software development',
      'FPGA prototype, released to the software teams',
      'Developer Playground — browser compile, run and energy report',
      'Energy profiler and lifetime modeller',
      'Playground launch readiness review',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [16, 32, 38, 38, 42],
    ...aligned('virtualPlatform', [10, 12, 14, 6, 2]),
    risks: ['Platform drifts from RTL', 'Playground energy numbers disputed', 'Launch before the compiler is ready'],
    potentialRisks: [
      'Virtual platform not updated after RTL changes',
      'Software teams working on an FPGA image older than the RTL',
      'Energy estimates shown to customers without accuracy bounds',
      'Cloud service security and cost not planned',
      'Playground launched with no support channel behind it',
    ],
    leader: leaderOf('Hannah Weiss', 'H. Weiss', '0451', 'hannah.weiss@example.com'),
    collaboration: ['Compiler', 'SDK', 'RTL', 'Marketing'],
    tools: ['Virtual platform', 'FPGA prototyping', 'Cloud service', 'Energy profiler'],
    programView: ['Playground launch date', 'Active developer accounts', 'Prototype RTL drop currency'],
    perspective:
      'The Playground is the first datasheet most customers will read. Launch it when the numbers are defensible, not when marketing needs a date.',
  },
  {
    id: 'fpgaVerification',
    stage: 42,
    title: 'FPGA Prototype Verification',
    shortTitle: 'FPV',
    tagline: 'What only real hardware at speed can prove, before tapeout.',
    description:
      'Plan and run verification on an FPGA prototype of the SoC: what it proves that simulation and emulation cannot — real sensors and shields on the peripherals, every boot path, compiler-generated workloads at speed, soak runs for stability — and what it cannot, since the power manager, oscillators and eMRAM are models on the FPGA. Built from every RTL drop, regressed on every ECO, and signed off on the final RTL as an input to the tapeout Go / No-Go.',
    activities: ['Verification plan', 'Platform and models', 'Bring-up per drop', 'Verification runs', 'Bug tracking and regression', 'Signoff'],
    deliverables: [
      'FPGA verification plan — scope split, test list, exit criteria',
      'FPGA platform, capacity and model plan',
      'FPGA images per RTL drop, smoke-tested',
      'FPGA verification results — peripherals, boot, workloads, soak',
      'FPGA bug tracker and regression dashboard',
      'FPGA verification signoff report',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [6, 8, 22, 36, 38, 40],
    ...aligned('fpgaVerification', [3, 3, 8, 14, 8, 1.5]),
    risks: ['Prototype lags the RTL', 'Design does not fit the FPGA', 'Signoff without the final RTL'],
    potentialRisks: [
      'FPGA scope never agreed with DV, so both or neither verify a feature',
      'The fabric reduced to fit the FPGA and nobody records what that leaves unverified',
      'Power-mode transitions assumed verified because the prototype boots',
      'Regression run on an image two drops old',
      'FPGA bugs tracked apart from the DV tracker and never counted at tapeout',
    ],
    leader: leaderOf('Victor Lindqvist', 'V. Lindqvist', '0458', 'victor.lindqvist@example.com'),
    collaboration: ['Verification', 'RTL', 'Firmware', 'Compiler'],
    tools: ['FPGA prototyping platform', 'FPGA synthesis', 'Logic analyzer', 'Regression CI'],
    programView: ['FPGA verification signoff date', 'Test list pass rate', 'Open FPGA bugs by owner', 'Image currency vs RTL drop'],
    perspective:
      'An FPGA prototype that boots proves little. Hold it to a test list and exit criteria like any other verification, and state in writing what it cannot show.',
  },
  {
    id: 'sdk',
    stage: 35,
    title: 'SDK, Boot ROM, HAL & RTOS',
    shortTitle: 'SDK',
    tagline: 'Everything a customer needs to get from hello-world to product.',
    description:
      'Write the software a customer builds on: the boot ROM — which is silicon, and freezes with the RTL — the hardware abstraction layer and drivers, Zephyr and FreeRTOS ports with tickless idle, hand-optimised DSP, image and ML libraries, the examples and documentation portal, and the port onto first silicon that makes the SDK Beta.',
    activities: ['Boot ROM', 'HAL and drivers', 'RTOS ports', 'Libraries', 'Documentation', 'Silicon port'],
    deliverables: [
      'Boot ROM code, frozen for tapeout',
      'Hardware abstraction layer and peripheral drivers',
      'RTOS ports and board support packages',
      'DSP, image and ML libraries optimised for the fabric',
      'Examples, documentation portal and quick-start guides',
      'SDK Beta, validated on first silicon',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [20, 48, 56, 64, 76, 80],
    ...aligned('sdk', [8, 20, 16, 18, 10, 4]),
    risks: ['Boot ROM bug in silicon', 'Driver coverage gaps', 'Documentation lagging the tools'],
    potentialRisks: [
      'Boot ROM frozen before it has run on the FPGA',
      'Secure boot keys and debug lock policy undecided at ROM freeze',
      'Drivers written against the virtual platform and never re-tested on silicon',
      'RTOS power management fighting the hardware sleep modes',
      'Examples that compile but do not demonstrate the energy advantage',
    ],
    leader: leaderOf('Kenji Watanabe', 'K. Watanabe', '0463', 'kenji.watanabe@example.com'),
    collaboration: ['Compiler', 'RTL', 'Bring-up', 'Applications'],
    tools: ['Zephyr', 'FreeRTOS', 'CI', 'Documentation portal'],
    programView: ['Boot ROM freeze vs RTL freeze', 'Driver coverage', 'SDK Beta date'],
    perspective:
      'The boot ROM is the one piece of software you cannot patch. Treat its freeze as a silicon milestone, with the same review as the RTL.',
  },
  {
    id: 'packageEmb',
    stage: 36,
    title: 'Package Design (QFN / FC-CSP)',
    shortTitle: 'EPKG',
    tagline: 'A small, cheap package with the right pins in the right places.',
    description:
      'Choose and design the package an embedded part lives in — QFN, FC-CSP or WLCSP — against cost, footprint and the boards it goes on: the pin-out and pad ring, the leadframe or substrate, the electrical and thermal models the board teams need, and the OSAT that will build it.',
    activities: ['Package selection', 'Pin-out', 'Leadframe or substrate', 'Models', 'OSAT', 'Design freeze'],
    deliverables: [
      'Package selection record',
      'Pin-out, pad ring and lead map',
      'Leadframe or substrate design database',
      'Package electrical and thermal models',
      'OSAT selection and assembly specification',
      'Package design freeze and tooling release',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [6, 12, 20, 22, 22, 26],
    ...aligned('packageEmb', [2, 3, 4, 3, 2, 1.5]),
    risks: ['Pin-out churn', 'Supply noise on sensitive rails', 'OSAT capacity'],
    potentialRisks: [
      'Pin-out changed after the EVK schematic started',
      'eMRAM and always-on supplies sharing noisy pins',
      'Package cost left out of the product cost model',
      'OSAT capacity booked for engineering lots but not for ramp',
    ],
    leader: leaderOf('Lucas Moreau', 'L. Moreau', '0472', 'lucas.moreau@example.com'),
    collaboration: ['Physical design', 'EVK', 'OSAT', 'Applications'],
    tools: ['Package design', 'Parasitic extraction', 'Thermal model'],
    programView: ['Pin-out freeze', 'Package design freeze', 'OSAT commitment'],
    perspective:
      'On an embedded part the pin-out is a customer interface. Freeze it with the EVK and application engineers in the review, not after.',
  },
  {
    id: 'earlyAccess',
    stage: 37,
    title: 'Early Access & Customer Design-In',
    shortTitle: 'EAP',
    tagline: 'The first customers help finish the product.',
    description:
      'Run the early-access programme that turns a new architecture into design-wins: pick the lighthouse accounts, sign them, onboard them on the Playground before silicon, seed them with samples and EVT boards, route their feedback into the compiler, SDK and errata, and support their designs through to the first design-win.',
    activities: ['Programme charter', 'Agreements', 'Pre-silicon onboarding', 'Feedback loop', 'Seeding', 'Design-in'],
    deliverables: [
      'Early access programme charter and target accounts',
      'Signed early-access agreements',
      'Pre-silicon onboarding record',
      'Engineering samples and EVT boards seeded to partners',
      'Customer feedback log into compiler, SDK and silicon',
      'Design-in support record and first design-win',
    ],
    deliverableFrom: [0, 1, 2, 4, 3, 5],
    deliverableWeek: [8, 18, 44, 72, 80, 86],
    ...aligned('earlyAccess', [3, 4, 10, 6, 3, 8]),
    risks: ['Partners stall before silicon', 'Feedback not acted on', 'No design-win at MP'],
    potentialRisks: [
      'Partners picked for their logo rather than a workload the part wins',
      'Onboarding depends on a compiler feature not yet in the alpha',
      'Feedback collected but never reaching the release plans',
      'Samples shipped without errata or a support contact',
      'Design-in support staffed by the same engineers doing bring-up',
    ],
    leader: leaderOf('Sarah Kim', 'S. Kim', '0485', 'sarah.kim@example.com'),
    collaboration: ['Marketing', 'Field applications', 'Compiler', 'SDK'],
    tools: ['CRM', 'Issue tracker', 'Playground'],
    programView: ['Active partners', 'Partner workloads ported', 'Feedback closure rate', 'Design-win pipeline'],
    perspective:
      'A new architecture is sold one ported workload at a time. Measure the programme by workloads running, not by agreements signed.',
  },
  {
    id: 'evkDesign',
    stage: 38,
    title: 'EVK Design & EVT Build',
    shortTitle: 'EVK',
    tagline: 'A board that measures its own energy.',
    description:
      'Design the evaluation kit customers will buy: Arduino UNO and MKR headers, GPIO access, battery, USB and external power, an on-board programmer and JTAG, and current sensing on every processor rail so the energy advantage can be measured on the desk. Proven without silicon on proto boards, so the first engineering samples go straight onto EVT.',
    activities: ['Requirements', 'Schematic', 'Layout', 'Proto bring-up', 'EVT build'],
    deliverables: [
      'EVK product requirements',
      'EVK schematics and BOM',
      'EVK layout database',
      'Proto boards, verified without silicon',
      'EVT boards built with engineering samples',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [6, 16, 26, 38, 44],
    ...aligned('evkDesign', [2, 4, 4, 3, 2]),
    risks: ['EVT waits on silicon and boards together', 'Measurement accuracy', 'Component lead times'],
    potentialRisks: [
      'Current sensing that cannot resolve sleep currents',
      'Board bring-up left until silicon arrives',
      'Long-lead parts not ordered at schematic freeze',
      'Arduino shield compatibility claimed but not tested',
    ],
    leader: leaderOf('Tom Becker', 'T. Becker', '0491', 'tom.becker@example.com'),
    collaboration: ['Board design', 'SDK', 'Package', 'Marketing'],
    tools: ['Schematic capture', 'PCB layout', 'Current measurement'],
    programView: ['EVT date', 'Proto bring-up status', 'Measurement accuracy'],
    perspective:
      'The EVK is where the energy claim is either proven on a customer’s desk or not. Its measurement accuracy is a product requirement, not a board detail.',
  },
  {
    id: 'assemblyEmb',
    stage: 39,
    title: 'Assembly & Engineering Samples',
    shortTitle: 'EASSY',
    tagline: 'From wafers to units on boards in six weeks.',
    description:
      'Build the tooling while the wafers are in the fab, then sort the first lot — trimming the eMRAM as it goes — and assemble the engineering samples, inspect them, and allocate them to bring-up, the EVK, qualification and the early-access partners.',
    activities: ['Tooling build', 'First-lot sort', 'Engineering lot', 'Inspection', 'Unit allocation'],
    deliverables: [
      'Assembly tooling and materials, qualified',
      'First-lot wafer sort results and die bank',
      'Engineering sample lot, assembled',
      'Assembly inspection and yield report',
      'Unit allocation plan and record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [14, 22, 25, 26, 26],
    ...aligned('assemblyEmb', [3, 1.5, 2, 1.5, 1]),
    risks: ['Tooling not ready at wafer-out', 'Sort limits immature', 'Units over-committed'],
    potentialRisks: [
      'Leadframe or substrate ordered after wafer-out',
      'eMRAM trim at sort not yet debugged on the first lot',
      'More units promised to partners than the first lot yields',
      'No traceability from unit back to wafer and die',
    ],
    leader: leaderOf('Jae-won Seo', 'J. Seo', '0496', 'jaewon.seo@example.com'),
    collaboration: ['OSAT', 'Test', 'Bring-up', 'Early access'],
    tools: ['Wafer prober', 'X-ray', 'Acoustic microscopy'],
    programView: ['Engineering sample date', 'Assembly yield', 'Unit allocation'],
    perspective:
      'Engineering samples are the scarcest thing in the programme for six weeks. Allocate them in writing before they exist.',
  },
  {
    id: 'softwareRelease',
    stage: 40,
    title: 'Silicon Correlation & Software 1.0',
    shortTitle: 'CREL',
    tagline: 'The numbers on the website are measured on silicon.',
    description:
      'Correlate the simulator, the energy profiler and the lifetime modeller with silicon, move the compiler to beta on real parts, publish benchmark and energy results measured on silicon, put release engineering and long-term support in place, and release Compiler and SDK 1.0.',
    activities: ['Correlation', 'Compiler Beta', 'Release engineering', 'Benchmarks', '1.0 GA'],
    deliverables: [
      'Silicon correlation report — cycles, energy, lifetime',
      'Compiler Beta on silicon',
      'Benchmark and energy results on silicon, published',
      'Release engineering and long-term support process',
      'Compiler and SDK 1.0 General Availability release',
    ],
    deliverableFrom: [0, 1, 3, 2, 4],
    deliverableWeek: [14, 16, 18, 20, 24],
    ...aligned('softwareRelease', [4, 8, 4, 4, 3]),
    risks: ['Models disagree with silicon', 'GA slips behind the EVK', 'Support process missing at GA'],
    potentialRisks: [
      'Pre-silicon energy claims not revisited after correlation',
      'Benchmarks published before the review',
      'Installers and signing not automated for every host OS',
      'No stated support window for early adopters',
    ],
    leader: leaderOf('Priya Raman', 'P. Raman', '0428', 'priya.raman@example.com'),
    collaboration: ['Compiler', 'SDK', 'Bring-up', 'Marketing'],
    tools: ['Energy measurement', 'CI', 'Release tooling'],
    programView: ['Correlation error', 'Compiler Beta date', '1.0 GA date'],
    perspective:
      'Correlate before you publish. A pre-silicon energy number that silicon does not reproduce costs more credibility than a conservative one ever earns.',
  },
  {
    id: 'evkLaunch',
    stage: 41,
    title: 'EVK Validation, Certification & Launch',
    shortTitle: 'EVKL',
    tagline: 'From EVT on a bench to a kit in a distributor’s catalogue.',
    description:
      'Validate the EVT boards, fix what they found in DVT, certify the kit for FCC, CE and UKCA, build it on the production line in PVT, and launch it through distribution with the box contents, documentation and trained field engineers behind it.',
    activities: ['EVT validation', 'DVT', 'Certification', 'PVT', 'Launch'],
    deliverables: [
      'EVT validation report and DVT change list',
      'DVT boards, validated',
      'EMC and safety certification — FCC, CE, UKCA',
      'PVT build and production release',
      'EVK launch package — distribution, product pages, documentation',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [6, 12, 18, 20, 22],
    ...aligned('evkLaunch', [2, 2.5, 2, 2.5, 2]),
    risks: ['EMC failure', 'PVT yield', 'Launch without software GA'],
    potentialRisks: [
      'Certification lab not booked until DVT is done',
      'Production test fixture designed after the PVT build',
      'EVK launched on a compiler still in beta',
      'Distributor stock not aligned with the launch date',
    ],
    leader: leaderOf('Tom Becker', 'T. Becker', '0491', 'tom.becker@example.com'),
    collaboration: ['Board design', 'Compliance', 'Manufacturing', 'Marketing'],
    tools: ['EMC test lab', 'Production test fixture'],
    programView: ['EVK GA date', 'Certification status', 'PVT yield'],
    perspective:
      'Book the certification lab when the DVT build is scheduled, not when it passes. Lab slots are the long pole nobody plans for.',
  },
];

/* ---------- deliverable references ---------- */

/** Each authored deliverable's reference tag: MRAM-D2 is the eMRAM stage's second. */
export const EMBEDDED_DELIVERABLES: Record<string, string> = Object.fromEntries(
  EMBEDDED_STAGES.flatMap((s) => s.deliverables.map((title, i) => [`${s.shortTitle}-D${i + 1}`, title])),
);

/* ---------- the profile ---------- */

const titleOf = (key: string): { title: string; shortTitle: string } => {
  const own =
    EMBEDDED_STAGES.find((s) => s.id === key) ??
    EMBEDDED_DERIVED_STAGES.find((s) => s.id === key) ??
    journeyData.find((s) => s.id === key)!;
  return { title: own.title, shortTitle: own.shortTitle };
};

const ALL_KEYS: readonly string[] = [
  ...EMBEDDED_INHERITED_KEYS,
  ...EMBEDDED_DERIVED.map((d) => d.key),
  ...EMBEDDED_STAGE_KEYS,
];

/**
 * The inherited, derived and authored stages, ordered by when they start — the
 * order is the chart's y-axis, so a reader scanning down reads the programme
 * forwards. Each stage shows its own content: inherited ones point at the SoC
 * stage by key, and the rest at content written or derived for this template.
 */
export const EMBEDDED_PROFILE: ScheduleProfile = {
  id: 'embeddedSoc',
  label: 'Embedded SoC',
  builtin: true,
  template: true,
  stages: [...ALL_KEYS]
    .sort((a, b) => EMBEDDED_BASELINES[a].startOffsetWeeks - EMBEDDED_BASELINES[b].startOffsetWeeks)
    .map(
      (key, order): ProfileStageDef => ({
        key,
        order,
        ...titleOf(key),
        phaseId: PHASE_OF_EMBEDDED[key],
        baseKey: key,
        ...EMBEDDED_BASELINES[key],
      }),
    ),
};
