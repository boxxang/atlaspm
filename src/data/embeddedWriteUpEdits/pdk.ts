import type { WriteUpEdit } from './types';

/** PDK: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const PDK_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'PDK-01': {
    purpose: [
      'Track what the foundry ships, version by version, and turn each release into a delta the program can act on—what changed, what it costs, and whether anything already done has to be redone.',
      'On a mature node the base PDK is in production and moves slowly. What still moves is the eMRAM module and the low-leakage content around it—macro views, device models, retention and leakage corners—and those have to be on the same version as everything else the design is built from.',
    ],
    flowNote:
      'Step 7 runs until tapeout and is the activity most likely to be dropped when the team is busy. It is also the only artifact that tells the program which of its assumptions have quietly expired.',
    risks: [
      'PDK updates adopted without impact analysis',
      'Different teams using different PDK versions',
      'eMRAM module content—macro views, models, rule deck—trailing the base PDK version',
      'Signoff assumptions changed without updating downstream flows',
      'Open PDK gaps not tied to program milestones',
    ],
  },

  'PDK-02': {
    purpose: [
      'Read the design rule manual as a constraint on this design rather than as a document—identify which restricted rules bite, dispose of every recommended rule, and get the exceptions requested early.',
      'Restricted and recommended rules are where a node’s real density lives. A design that adopts every recommended rule is safe and large; one that ignores them is dense and fails DFM. On this process the eMRAM module adds its own layers and keep-out rules over the macro, and those constrain the routing above the array.',
    ],
    consumes: [
      'Design rule manual for the selected node and flavor, including the eMRAM module rules',
      'Previous-node DRM for comparison',
      'Floorplan intent from ARCH-08',
      'Analog and eMRAM macro intent from PMU-01 and MRAM-01',
      'Foundry exception request process',
    ],
  },

  'PDK-03': {
    purpose: [
      'Choose the standard cell libraries the design will be built from and qualify them rather than assume them—track height, Vt menu, retention and always-on cells, and the timing and leakage models every downstream tool will trust.',
      'Library selection is a PPA decision disguised as a procurement one. For a part judged on sleep current, the Vt menu and the low-leakage variants set the battery life; retention flops, isolation, level-shifter and always-on cells decide whether the sleep modes can be built at all; track height sets density.',
    ],
    consumes: [
      'Flavor sheet from TECH-05',
      'DTCO findings from TECH-04',
      'PDK release under tracking from PDK-01',
      'PPA and leakage budgets from ARCH-09',
      'Foundry library release notes and characterization data',
    ],
    entry: [
      'Flavor sheet agreed by TECH-05',
      'Library release available under the design agreement',
      'PPA and leakage budgets available from ARCH-09',
    ],
  },

  'PDK-05': {
    purpose: [
      'Get the memory compiler licensed, evaluate what it can produce, and generate the SRAM and register-file instances the design asked for—with every view a downstream tool needs.',
      'On this part the SRAM sits beside the eMRAM, and every fabric tile carries small local memories that are replicated across the array, so one instance’s area and leakage is multiplied many times over. What the compiler can generate is a hard boundary on the architecture: a configuration outside its range is not a compiler setting, it is a change to the memory map.',
    ],
    flowNote:
      'Step 3 is the one with a schedule consequence. A capability gap found here goes back to the memory placement model in FCD-03 and the hierarchy in ARCH-04 while the memory map can still move; found at instance generation, it is a block redesign.',
    consumes: [
      'Memory hierarchy and capacity requirements from ARCH-04',
      'Memory access and placement model from FCD-03',
      'Compiler license terms from TECH-03',
      'PDK version under tracking from PDK-01',
      'BISR and repair architecture intent from DFT-05',
      'Block memory budgets from ARCH-09',
    ],
    rel: {
      'PDK-D4':
        '<b>Memory PPA gap analysis against block budgets.</b> The capability screen is where the gap first appears; <code>PDK-09</code> quantifies it.',
    },
    risks: [
      'Architecture assumes memory configurations the compiler cannot generate',
      'Aspect ratio and floorplan constraints ignored during instance selection',
      'Compiler views incomplete for synthesis, STA, or physical design',
      'Vmin, retention voltage or sleep-mode leakage assumed without characterization',
      'Unsupported instances discovered after block design begins',
    ],
    exit: [
      'Required SRAM and register-file configurations are mapped to available compilers',
      'Critical memory instances can be generated with complete implementation views',
      'Compiler gaps are returned to the architecture as memory-map changes, with owners',
    ],
  },

  'PDK-06': {
    purpose: [
      'Qualify the IO, ESD and latch-up collateral—the library that sits at the die edge and decides whether the part survives handling, and whether its GPIO and serial interfaces meet their electrical specifications across the supply range.',
      'IO qualification is unglamorous and it is where parts die. An ESD strategy chosen late constrains the pad ring after the pin-out is fixed with the package; a 5 V-tolerant pad assumed rather than checked fails at the customer’s board; a latch-up rule missed produces a part that fails qualification for reasons no functional test would ever find.',
    ],
    flowNote:
      'The ESD strategy in step 2 has to precede pad ring layout, which in turn precedes the pin-out and lead map in EPKG-02. Late ESD is a pad ring change, and on a QFN or FC-CSP a pad ring change is a package change.',
    consumes: [
      'Interface and GPIO list from ARCH-03',
      'Pad ring plan from ARCH-08',
      'Foundry IO library and ESD rule set',
      'Latch-up and reliability requirements from the qualification plan',
      'Package and board ESD requirements',
    ],
    risks: [
      'I/O voltage support assumed from nominal library descriptions',
      'ESD requirements checked independently of the package and pad ring',
      'Latch-up constraints discovered during late physical verification',
      'Required implementation or reliability views missing at integration',
      'I/O placement constraints not reflected in early floorplanning',
    ],
    roles: [
      { r: 'IO library engineer', d: 'Owns the selection and the qualification record' },
      { r: 'ESD engineer', d: 'Strategy, clamps and rail topology' },
      { r: 'Reliability engineer', d: 'Latch-up and guard ring requirements' },
      { r: 'Physical design liaison', d: 'Pad ring and area implications' },
      { r: 'Package liaison', d: 'Pin-out, supply pins and IO models for package modelling' },
    ],
    entry: [
      'Interface list available from ARCH-03',
      'Pad ring plan drafted in ARCH-08',
      'Foundry IO library and ESD rules released',
    ],
    terms: ['STA', 'IO', 'ESD', 'QFN', 'FC-CSP'],
  },

  'PDK-07': {
    purpose: [
      'Decide which tool at which version each flow step runs on, qualify that combination on the node, and freeze it—so that a result from one team means the same thing as a result from another.',
      'Tool versions are a correctness question, not an IT one. Even on a mature node, extraction, timing and physical verification need foundry-certified versions, the eMRAM and analog macros arrive with views generated by particular tool releases, and mixing versions across teams produces disagreements that consume weeks before anyone suspects the tools rather than the design.',
    ],
    flowNote:
      'Steps 4 and 5 catch what per-tool qualification cannot. Each tool can be certified on the node and still disagree with the next one about a database format or a parasitic convention, and only a cross-tool check finds it.',
  },

  'PDK-08': {
    purpose: [
      'Take the foundry’s reference flow, adapt it into a methodology this design can run, and prove it on a representative block before the whole team depends on it.',
      'A reference flow is a starting point written for a generic design. This one has a fabric tile replicated across the array, eMRAM and analog PMU hard macros, an always-on domain with retention and power gating, and sleep modes the reference never contemplated.',
    ],
    flowNote:
      'The pilot in step 5 is the step under most pressure to be skipped. The fabric tile is the natural pilot—small, replicated, and the block whose power and area matter most—and a flow that has never been run end to end on it is a flow whose first user is doing the debugging on the critical path.',
  },

  'PDK-09': {
    purpose: [
      'Measure what the generated instances deliver—density, Vmin, access time, leakage and retention voltage—and set it against the budget each block was allocated.',
      'This is the activity that decides whether the memory plan holds. The compiler produces an instance that meets the specification; the question here is whether it meets the <b>budget</b>, and on a part judged on sleep current, leakage and retention voltage matter as much as area and access time.',
    ],
    flowNote:
      'The gap analysis is quantified rather than described on purpose. "The compiler misses the budget" starts an argument; "the retained SRAM bank misses its leakage budget by 14%, which is a measurable share of deep-sleep current and of battery life" starts a decision.',
    rel: {
      'PDK-D4':
        '<b>Memory PPA gap analysis against block budgets.</b> The gap analysis itself; what does not close goes back to the block budget in <code>ARCH-09</code> or the memory map in <code>FCD-03</code>.',
    },
    risks: [
      'Memory PPA assessed only at nominal conditions',
      'Compiler marketing data used without instance-level characterization',
      'Vmin and retention-voltage gaps ignored until low-power validation',
      'Area and aspect-ratio impact separated from timing analysis',
      'Memory gap found too late to move data between SRAM and eMRAM',
    ],
    effortLabels: [
      'Vmin and access time characterization',
      'Density measurement',
      'Gap analysis',
      'Leakage, retention and dynamic power measurement',
    ],
    exit: [
      'Critical memory instances are characterized against block PPA targets',
      'Timing, density, Vmin, leakage and retention gaps are quantified',
      'Instances that miss budget are escalated with a proposed change to the budget or the memory map',
    ],
    measuredBy: [
      'Instances characterized against those released',
      'Gap quantified in die area and sleep current',
      'Weeks of runway left to change the memory map',
    ],
    terms: ['PPA', 'DTCO', 'SRAM', 'Vmin', 'eMRAM'],
  },

  'PDK-12': {
    purpose: [
      'Agree with the foundry exactly which corners and derates signoff will be run at—PVT combinations including the hot leakage corner and the retention voltage, the operating modes, and the OCV, AOCV or POCV methodology—and write it down before anyone closes timing against it.',
      'A corner set is a contract. Sign off at corners the foundry does not recognize and the foundry will not accept the result; sign off at more corners than necessary and every closure iteration costs runtime and license capacity the program has not budgeted for.',
    ],
    flowNote:
      'Step 4 exists because corner count multiplies. Nine corners across the performance, efficiency and retention modes is twenty-seven signoff runs per iteration, and the compute plan in PDK-10 is sized against whatever number this activity settles on.',
    consumes: [
      'Operating modes, supply range and retention voltage from ARCH-06 and PMU-01',
      'Library characterization corners from PDK-03',
      'IO and ESD conditions from PDK-06',
      'Foundry signoff requirements and recommended derates',
      'Runtime and license capacity constraints',
    ],
    entry: [
      'Operating modes and supply range defined by ARCH-06',
      'Library characterization corners known from PDK-03',
      'Foundry signoff requirements available',
    ],
  },
};
