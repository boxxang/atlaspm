import type { WriteUpEdit } from './types';

/** ARCH: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const ARCH_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'ARCH-01': {
    flowNote:
      'Correlation sits early on purpose. A model that has never been checked against the FCD-05 fabric model and against measured incumbent silicon produces numbers, not answers, and every sweep run before correlation has to be re-run afterwards.',
    consumes: [
      'Workload suite and KPI targets from DEF-03',
      'Energy, performance and area targets from DEF-05',
      'Memory, peripheral and interface requirements from DEF-04',
      'Cycle and energy model of the fabric from FCD-05',
      'Measured energy and cycles on incumbent MCUs from DEF-03',
      'Process and library characterization data from PDK-03',
    ],
    rel: {
      'ARCH-D5':
        '<b>Block partitioning and PPA budget table.</b> The sweeps are what decide tile count and SRAM and eMRAM capacity before <code>ARCH-02</code> draws the boundaries.',
    },
    risks: [
      'Performance model not correlated with the fabric model or with measured data',
      'Model detail level not matched to the decisions being evaluated',
      'Architecture analysis based on unrepresentative workloads',
      'Energy estimates integrated too late in the modeling process, on a product sold on energy per task',
      'Model accuracy and confidence range not clearly defined',
    ],
    roles: [
      { r: 'Performance architect', d: 'Owns the model, its fidelity and its confidence statement' },
      { r: 'Modeling engineers', d: 'Model construction, sweeps and the regression harness' },
      { r: 'Workload analyst', d: 'Suite integration and result interpretation' },
      { r: 'Power modeling engineer', d: 'Energy overlay and energy-per-task projection by operating mode' },
      { r: 'Correlation engineer', d: 'Incumbent-silicon measurement and correlation with the FCD-05 model' },
    ],
    effortLabels: [
      'Model construction',
      'Design-space exploration',
      'Energy model overlay',
      'System bus and interconnect studies',
      'Bottleneck and sensitivity analysis',
      'Model correlation',
      'Handoff and regression harness',
    ],
    entry: [
      'Workload suite delivered and runnable from DEF-03',
      'Energy, performance and area targets published by DEF-05',
      'Incumbent MCU measurements available, and a first FCD-05 fabric model to correlate against',
    ],
    exit: [
      'Performance model is correlated to the FCD-05 fabric model and to measured incumbent data with a defined error range',
      'Key architecture decisions are supported by simulation and sensitivity analysis',
      'Regression environment is ready for reuse in later stages',
    ],
    measuredBy: [
      'Correlation error against the FCD-05 model and incumbent measurements',
      'Architectural decisions supported by a sweep',
      'Model re-run turnaround once a parameter changes',
    ],
    terms: ['M/M', 'PPA', 'KPI', 'SRAM', 'RTL', 'MCU', 'eMRAM'],
  },

  'ARCH-02': {
    purpose: [
      '<b>Define how the fabric, the scalar subsystem, the memories, the peripherals and the always-on domain are partitioned on the die, and what crosses each boundary.</b>',
      'The partitioning decision drives the power domains, the leakage left powered in deep sleep, the test strategy, the die size against its pad-limited floor, and product cost. Making this decision before Architecture Freeze avoids major redesign of the die, the power intent and the test solution later in the program.',
    ],
    flowNote:
      'Boundary definition takes three of the eight weeks because it is the part that gets skipped. Deciding "the always-on domain holds the RTC and the wake logic" is quick; deciding exactly which signals cross into it, and what each costs in leakage and retention, is the work that makes the decision real.',
    consumes: [
      'Architecture exploration results from ARCH-01',
      'Product cost and yield model from DEF-06',
      'Process options and die-size constraints from TECH-05',
      'Package options and pin budget from DEF-04',
      'Test strategy assumptions from DFT-01',
    ],
    rel: {
      'ARCH-D5':
        '<b>Block partitioning and PPA budget table.</b> The deliverable defines the block boundaries and power-domain assignments. <code>ARCH-09</code> adds the PPA budgets for each block.',
      'ARCH-D4':
        '<b>Chip-level block diagram with pin and pad budget.</b> <code>ARCH-08</code> draws what this activity decides.',
    },
    risks: [
      'Always-on domain sized without counting its leakage in deep sleep',
      'Partition boundaries defined without bandwidth and latency requirements',
      'Die size checked against the cost target but not against the pad-limited floor',
      'Test implications for eMRAM, analog and the fabric evaluated too late',
      'Partitioning decision documented without clear decision rationale',
    ],
    roles: [
      { r: 'Chief architect', d: 'Owns the partitioning decision and its record' },
      { r: 'Physical architect', d: 'Die size, pad limit and floorplan feasibility' },
      { r: 'Cost and yield analyst', d: 'Candidate comparison against the DEF-06 model' },
      { r: 'Interconnect architect', d: 'Boundary traffic, bandwidth and latency' },
      { r: 'DFT liaison', d: 'Test strategy implications for eMRAM, analog and the fabric' },
    ],
    effortLabels: [
      'Candidate construction',
      'Boundary definition',
      'Yield and cost comparison',
      'Always-on boundary study',
      'Test implication review',
      'Decision record',
    ],
    entry: [
      'First design-space results available from ARCH-01',
      'Cost model usable for candidate comparison',
      'Node and process options confirmed by TECH-05',
    ],
    exit: [
      'System partitioning is selected with key alternatives evaluated',
      'Each partition boundary has defined bandwidth and latency requirements',
      'Test, leakage, yield, and cost impacts are evaluated for the selected partitioning',
    ],
    terms: ['PPA', 'DFT', 'eMRAM', 'RTC'],
  },

  'ARCH-03': {
    purpose: [
      '<b>Select the peripherals and external interfaces the product needs</b> — GPIO, UART, SPI, I2C, I2S, timers, the ADC and comparators, and the USB and JTAG ports for programming and debug — with their counts and versions. Translate each selection into clear controller and PHY requirements for IP planning and sourcing.',
      '<b>Peripheral decisions depend on the customers’ existing designs and on IP availability.</b> A peripheral set customers cannot port their code and boards to, or one that depends on IP not yet available on the node, introduces design-in and schedule risk later in the program.',
    ],
    flowNote:
      'The handoff in step 7 is what makes this activity urgent rather than merely important. IPR-04 cannot evaluate an ADC or USB PHY vendor against a specification nobody has chosen, and analog IP lead times run to a quarter.',
    consumes: [
      'Peripheral, GPIO and debug interface requirements from DEF-04',
      'System partitioning from ARCH-02',
      'Protocol version maturity and expected finalization timing',
      'Peripheral, USB and ADC IP vendor catalogues',
      'Analog and USB PHY availability on the candidate node from TECH-04',
    ],
    rel: {
      'ARCH-D4':
        '<b>Chip-level block diagram with pin and pad budget.</b> Peripheral counts and pin multiplexing are what <code>ARCH-08</code> allocates pads against.',
    },
    risks: [
      'Protocol version selected before the standard is sufficiently mature',
      'USB PHY and ADC availability on the target process node not confirmed',
      'Compliance and interoperability requirements defined too late',
      'Peripheral counts set without a pin-multiplexing plan against the package pin count',
      'Peripheral set chosen without the EVK and applications teams',
    ],
    roles: [
      { r: 'Interface architect', d: 'Owns the selections and the definition document' },
      { r: 'Standards liaison', d: 'Revision status, ratification timing and compliance' },
      { r: 'IP strategist', d: 'Turns requirements into vendor evaluation criteria' },
      { r: 'Analog and PHY specialist', d: 'ADC and USB PHY feasibility on the selected node' },
      { r: 'Physical architect', d: 'Pad and area cost of the peripheral set' },
    ],
    entry: [
      'Peripheral requirements available from DEF-04',
      'Partitioning decided by ARCH-02',
      'Peripheral and analog IP catalogues accessible under NDA',
    ],
    terms: ['NDA', 'IP', 'PHY', 'JTAG', 'EVK'],
  },

  'ARCH-04': {
    purpose: [
      '<b>Define how data moves through the system and how the memory hierarchy is organized for the target workloads</b>, including SRAM capacity and banking, the eMRAM read path, and how data reaches the fabric’s processing elements.',
      '<b>Memory architecture has a direct impact on energy per task.</b> On a part sold on energy, moving a word costs more than computing on it; matching the dataflow and memory hierarchy to workload access and reuse patterns keeps the fabric fed while minimizing data movement and the energy it costs.',
    ],
    consumes: [
      'Workloads and data reuse analysis from DEF-03',
      'Memory, peripheral and interface requirements from DEF-04',
      'Architecture exploration results from ARCH-01',
      'System partitioning from ARCH-02',
      'Memory access and placement model from FCD-03',
      'Memory compiler capabilities from PDK-05 and eMRAM macro options from MRAM-01',
    ],
    rel: {
      'ARCH-D6':
        '<b>Architecture specification.</b> This activity defines the dataflow and memory hierarchy section of <code>ARCH-D6</code>, including SRAM organization and the eMRAM read path. <code>ARCH-07</code> integrates it into the final architecture specification.',
      'ARCH-D5':
        '<b>Block partitioning and PPA budget table.</b> SRAM and eMRAM capacity are the largest area lines in the budget, and they are decided here.',
    },
    risks: [
      'SRAM capacity based on average rather than workload-specific data reuse',
      'SRAM capacity defined without considering banking and bandwidth requirements',
      'Memory architecture based on unverified memory compiler or eMRAM macro capabilities',
      'A single dataflow applied across all workload classes',
      'eMRAM wait states and execute-in-place policy defined without the compiler team',
    ],
    roles: [
      { r: 'Memory systems architect', d: 'Owns the hierarchy and its specification' },
      { r: 'Dataflow architect', d: 'Dataflow selection and compute-memory matching' },
      { r: 'Performance modeling engineer', d: 'Hierarchy sweeps in the ARCH-01 model' },
      { r: 'Memory IP liaison', d: 'Memory compiler and eMRAM macro feasibility' },
      { r: 'Workload analyst', d: 'Reuse distance and access-pattern analysis' },
    ],
    effortLabels: [
      'SRAM capacity and organization',
      'Dataflow selection',
      'Hierarchy simulation',
      'eMRAM read path and execute-in-place',
      'Cache, scratchpad and DMA policy',
      'Specification and handoff',
    ],
    exit: [
      'Memory capacity and bandwidth are validated against target workloads through simulation',
      'Dataflow is defined for each workload class with key tradeoffs documented',
      'Memory requirements are defined and handed off to the PDK, eMRAM and compiler teams',
    ],
    measuredBy: [
      'Data-movement energy per task in simulation against the budget',
      'SRAM and eMRAM area against the ARCH-09 allocation',
      'Hierarchy changes raised after RTL freeze',
    ],
    terms: ['PPA', 'PDK', 'IP', 'SRAM', 'RTL', 'eMRAM', 'XIP', 'DMA'],
  },

  'ARCH-05': {
    effortLabels: [
      'Boot chain and root of trust',
      'Threat model and asset inventory',
      'Fuse map and lifecycle states',
      'Debug lockdown negotiation',
      'Cryptographic engine requirement',
      'Review',
    ],
  },

  'ARCH-06': {
    purpose: [
      '<b>Define the power and clock architecture for the product,</b> including power and clock domains, the voltage rails and on-chip regulators, the operating modes — performance, efficiency, sleep and deep sleep — and the transitions between them, clock-domain crossings, and reset structure. Capture the initial power intent in UPF for implementation and verification.',
      '<b>These decisions directly affect both physical implementation and verification.</b> Defining power-domain boundaries and power intent early ensures that isolation, level shifting, retention, clock/reset crossings, and verification requirements are handled consistently across downstream teams.',
    ],
    consumes: [
      'Energy and current budgets by mode and domain from DEF-05',
      'Block definitions and system partitioning from ARCH-02',
      'Operating mode and wake-latency requirements derived from the target workloads',
      'Standard-cell, power-management, and I/O capabilities from PDK-03',
      'Power architecture and operating mode definition from PMU-01',
    ],
    rel: {
      'ARCH-D2':
        '<b>Power / clock / reset architecture and UPF intent.</b> The deliverable defines the power domains, clock and reset structure, the operating modes with their voltage and clock points, and the initial UPF intent used by implementation and verification tools.',
    },
    risks: [
      'Power domains defined without clear power-management requirements',
      'Clock-domain crossings not fully identified',
      'Operating modes defined without wake latency and transition energy validated',
      'UPF intent created after RTL implementation has already started',
      'Reset sequencing not defined before implementation and verification',
    ],
    effortLabels: [
      'Power domain partitioning',
      'UPF intent draft',
      'Clock domain architecture',
      'Operating mode definition',
      'Reset and power management controller',
      'Review',
    ],
    terms: ['PPA', 'RTL', 'PDN', 'IO', 'UPF', 'CDC', 'LDO'],
  },

  'ARCH-07': {
    consumes: [
      'Outputs from all preceding ARCH activities',
      'Fabric and compiler co-design freeze package from FCD-06',
      'Performance model results from ARCH-01',
      'PPA budget table from ARCH-09',
      'Required tradeoffs from DEF-07',
      'Open architecture issues and risks',
    ],
    roles: [
      { r: 'Chief architect', d: 'Owns the specification and the freeze proposal' },
      { r: 'Section authors', d: 'Architecture leads writing their own chapters' },
      { r: 'Technical editor', d: 'Consistency, traceability and structure' },
      { r: 'Downstream leads', d: 'RTL, DV, DFT, PD, compiler and firmware readiness review' },
      { r: 'Program manager', d: 'Open-issue disposition and the gate record' },
    ],
  },

  'ARCH-08': {
    purpose: [
      'Define the initial chip-level physical architecture, including block placement intent, the eMRAM and analog macro locations, the pad ring and I/O planning, and the pin and pad budget.',
      'The floorplan and pad budget connect architecture decisions to package and physical-design constraints. On a small die with dozens of GPIO, the pad ring can set the die size rather than the logic. Early validation reduces the risk of late I/O, power-delivery, or package changes.',
    ],
    flowNote:
      'The power-to-signal ratio in step 3 is the number that decides the argument. On a pad-limited die every supply pad displaces a GPIO, the regulator topology decides how many supply pads there are, and the signal budget is what is left over rather than what was asked for.',
    consumes: [
      'Partitioning and boundaries from ARCH-02',
      'Memory hierarchy and eMRAM and SRAM macro sizes from ARCH-04',
      'Peripheral and GPIO counts from ARCH-03',
      'Supply rails and regulator topology from ARCH-06',
      'Package options — QFN, FC-CSP or WLCSP — from the DEF-04 pin and package budget',
    ],
    rel: {
      'ARCH-D4':
        'The deliverable defines the chip-level block placement intent and the pin and pad budget used by physical design and package teams.',
    },
    risks: [
      'Peripheral and GPIO counts finalized before the pad ring is checked',
      'Supply and ground pad requirements underestimated',
      'Placement intent defined without routing feasibility',
      'Package feasibility based on generic rather than selected technology assumptions',
      'eMRAM, oscillator and analog macro placement left unresolved against noise and the pad ring',
    ],
    roles: [
      { r: 'Physical architect', d: 'Owns the placement intent and the pad ring' },
      { r: 'IO architect', d: 'Pad ring organization, I/O cells and 5 V-tolerant GPIO' },
      { r: 'Power delivery engineer', d: 'Supply pad budget against the regulator topology' },
      { r: 'Package design liaison', d: 'Feasibility against the QFN leadframe or the CSP ball map' },
      { r: 'Chief architect', d: 'Arbitrates GPIO count against the pad budget' },
    ],
    effortLabels: [
      'Pad ring definition and allocation',
      'Placement intent',
      'Supply pad budget',
      'Package feasibility check',
      'Publication',
    ],
    entry: [
      'Partitioning decided by ARCH-02',
      'Peripheral and GPIO counts available from ARCH-03',
      'Package candidates known from DEF-04',
    ],
    exit: [
      'Pad ring and power-to-signal allocation are defined',
      'Each peripheral has allocated pads accepted by the package team',
      'Physical design confirms that the placement intent is feasible',
    ],
    measuredBy: [
      'Signal pads allocated against those requested',
      'Power-to-signal ratio against the regulator topology’s requirement',
      'Pad ring revisions after Architecture Freeze',
    ],
    terms: ['PPA', 'IO', 'eMRAM', 'SRAM', 'QFN', 'FC-CSP', 'WLCSP'],
  },

  'ARCH-09': {
    risks: [
      'PPA budgets allocated without implementation margin',
      'Leakage budgets not set for the blocks that stay powered in sleep',
      'Block budgets not accepted by their owners',
      'Budget changes without formal change control',
      'Block-level totals not reconciled to DEF-05 targets',
      'Timing budgets defined too broadly to expose block-level closure risk',
    ],
    exit: [
      'Each block has accepted area, active energy, leakage and timing budgets',
      'Implementation margin is explicitly reserved',
      'Budget change-control rules are defined and agreed',
    ],
  },

  'ARCH-10': {
    consumes: [
      'Architecture specification chapters from ARCH-07',
      'Partitioning and boundaries from ARCH-02',
      'Memory hierarchy specification from ARCH-04',
      'Fabric ISA and compiler–hardware contract from FCD-02 and FCD-04',
      'PPA budget per block from ARCH-09',
      'Verification strategy intent from DV-01',
    ],
  },
};
