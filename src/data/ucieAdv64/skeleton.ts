/**
 * /data/ucieAdv64/skeleton.ts — the shape of the UCIe Advanced 64G Die-to-Die
 * PHY IP template: its stages, when each runs, the gate each closes on, and
 * the activities inside each one with their owner, window and item.
 *
 * What this program ships is not a chip. It is an IP release — RTL, hard
 * macros, models, views and documents — that customers integrate into their
 * own SoCs, for UCIe Advanced packages (silicon bridge, silicon interposer,
 * RDL interposer) at 64 GT/s. A test chip on a test vehicle is how the IP is
 * proven, and the program ends at production release with customers
 * already integrating. The scope runs from the FDI down through the D2D
 * Adapter, the Logical PHY and sideband, the Electrical PHY and the bumps and
 * channel; the Protocol Layer above the FDI is the customer's.
 *
 * Stages are the lifecycle, not the blocks: each closes on a gate every
 * workstream reaches together, and the digital, analog, channel, test chip
 * and release workstreams run as parallel activities inside them. The
 * scenario is new development — a new architecture on a new process — about
 * 128 weeks from kickoff to production release. Every week is data here, so a feature upgrade
 * or a port can be a profile with shorter design stages rather than new code.
 *
 * Weeks are from kickoff; activity windows are weeks from their stage's
 * start. Generic throughout: no vendor, foundry, assembly house, tool or
 * product is named, and no specification revision is pinned.
 */

export type UcieBand =
  | 'define'
  | 'enable'
  | 'designVerify'
  | 'implement'
  | 'integrate'
  | 'manufacture'
  | 'siliconValidation'
  | 'ipRelease';

/**
 * What an activity is work on: the D2D Adapter and its FDI and RDI, the
 * Logical PHY with training, sideband and lane management, the Electrical PHY
 * (TX, RX, clocking, bias, ESD), the bumps, package and channel, the test chip
 * and its test vehicle, boards and ATE — or the program itself (planning,
 * product, quality, release, customers).
 */
export const UCIE_ITEMS = ['adapter', 'logicalPhy', 'afe', 'channel', 'testchip', 'program'] as const;
export type UcieItem = (typeof UCIE_ITEMS)[number];

/** The owning functions — one taxonomy for the whole template. */
export const UCIE_OWNERS = [
  'Product management',
  'Program management',
  'IP architecture',
  'RTL design',
  'Design verification',
  'Analog and mixed-signal',
  'Mixed-signal verification',
  'Physical design',
  'Analog layout',
  'DFT',
  'Packaging',
  'SI/PI',
  'Test chip integration',
  'Board and lab hardware',
  'Validation',
  'Test engineering',
  'Reliability',
  'Compliance and interoperability',
  'Customer engineering',
  'Technical documentation',
  'Technology and foundry',
  'Design methodology and CAD',
  'Quality',
] as const;

export interface UcieActivitySkeleton {
  ref: string;
  title: string;
  /** the role that owns it — one of UCIE_OWNERS */
  owner: string;
  /** [from, to] weeks from the stage start */
  w: [number, number];
  /** the block it is work on */
  item: UcieItem;
}

export interface UcieStageSkeleton {
  key: string;
  /** the activity and deliverable prefix, and the short title */
  prefix: string;
  title: string;
  band: UcieBand;
  start: number;
  dur: number;
  gate: { id: string; label: string; major?: boolean };
  activities: UcieActivitySkeleton[];
}

const a = (
  ref: string,
  title: string,
  owner: (typeof UCIE_OWNERS)[number],
  w: [number, number],
  item: UcieItem,
): UcieActivitySkeleton => ({ ref, title, owner, w, item });

export const UCIE_SKELETON: readonly UcieStageSkeleton[] = [
  /* ---------------- define ---------------- */
  {
    key: 'ucieConcept',
    prefix: 'UCON',
    title: 'Business Justification and Program Go Decision',
    band: 'define',
    start: 0,
    dur: 8,
    gate: { id: 'ucieIpProgramGo', label: 'IP Program Go' },
    activities: [
      a('UCON-01', 'Market and Customer Requirements Capture — Chiplet Interconnect Demand, Target SoCs and Package Types', 'Product management', [0, 4], 'program'),
      a('UCON-02', 'Competitive Die-to-Die PHY IP Landscape and Differentiation Analysis', 'Product management', [0, 4], 'program'),
      a('UCON-03', 'Business Case, Licensing and Pricing Model', 'Product management', [2, 6], 'program'),
      a('UCON-04', 'IP Roadmap Position — Speed Grades, Process Nodes and Derivatives', 'Product management', [2, 6], 'program'),
      a('UCON-05', 'Program Plan — Schedule, Resources, Test Chip Budget and Partners', 'Program management', [3, 7], 'program'),
      a('UCON-06', 'Program Risk Assessment and IP Program Go / No-Go Review', 'Program management', [6, 8], 'program'),
    ],
  },
  {
    key: 'ucieRequirements',
    prefix: 'UREQ',
    title: 'Feature Scope & PPA Targets',
    band: 'define',
    start: 4,
    dur: 10,
    gate: { id: 'ucieRequirementsBaseline', label: 'Requirements Baseline' },
    activities: [
      a('UREQ-01', 'Target UCIe Revision and Feature Selection — 64 GT/s, x64 Advanced Module, Module Count, Flit and Raw Formats and Protocol Support', 'IP architecture', [0, 4], 'program'),
      a('UREQ-02', 'PPA Targets — Shoreline Bandwidth Density, Energy per Bit, Area and Latency', 'IP architecture', [1, 6], 'program'),
      a('UREQ-03', 'Supported Package Technologies and Bump Pitch Range — Silicon Bridge, Silicon Interposer and RDL Interposer', 'Packaging', [1, 6], 'channel'),
      a('UREQ-04', 'Customer Integration Requirements — Metal Stack, Macro Orientation, Power Domains and Test Access', 'Customer engineering', [2, 7], 'program'),
      a('UREQ-05', 'Link Reliability Targets — BER, CRC and Retry, and Lane Repair Coverage', 'IP architecture', [2, 7], 'adapter'),
      a('UREQ-06', 'Sideband, Manageability and Low-Power State Requirements', 'IP architecture', [3, 8], 'logicalPhy'),
      a('UREQ-07', 'Compliance and Interoperability Targets', 'Compliance and interoperability', [3, 8], 'program'),
      a('UREQ-08', 'Electrical PHY Requirements — Supplies, Clocking Inputs, ESD Targets and Operating Range', 'Analog and mixed-signal', [2, 7], 'afe'),
      a('UREQ-09', 'Requirements Traceability Matrix and Requirements Baseline Review', 'Program management', [7, 10], 'program'),
    ],
  },
  {
    key: 'ucieArchitecture',
    prefix: 'UARC',
    title: 'Implementation Architecture & Partitioning',
    band: 'define',
    start: 10,
    dur: 12,
    gate: { id: 'ucieArchitectureFreeze', label: 'Architecture Freeze', major: true },
    activities: [
      a('UARC-01', 'IP Partitioning and Interfaces — Adapter, Logical PHY, Electrical PHY, Sideband, FDI, RDI and Register Interface', 'IP architecture', [0, 5], 'adapter'),
      a('UARC-02', 'D2D Adapter Architecture — CRC, Retry, Flit Formats, Raw Mode and Arbitration', 'IP architecture', [2, 8], 'adapter'),
      a('UARC-03', 'Logical PHY Architecture — Lane Mapping, Scrambling, Link Training and Runtime Recalibration', 'IP architecture', [2, 8], 'logicalPhy'),
      a('UARC-04', 'Lane Repair, Lane Reversal and Deskew Scheme', 'IP architecture', [3, 8], 'logicalPhy'),
      a('UARC-05', 'Sideband Architecture — Messages, Register Access, Manageability and Firmware Download', 'IP architecture', [3, 9], 'logicalPhy'),
      a('UARC-06', 'Clocking Architecture — PLL and DLL, Forwarded Clock, Phase Adjustment and the 64 GT/s Timing Budget', 'Analog and mixed-signal', [1, 8], 'afe'),
      a('UARC-07', 'Electrical PHY Architecture — TX and RX Topology, Equalization, Bias and ESD', 'Analog and mixed-signal', [2, 9], 'afe'),
      a('UARC-08', 'Low-Power States and Power Management Architecture', 'IP architecture', [4, 9], 'logicalPhy'),
      a('UARC-09', 'Bump Map Concept and Module Floorplan', 'Packaging', [3, 9], 'channel'),
      a('UARC-10', 'DFT and Debug Strategy — Scan, BIST, PRBS, Loopback and Margining', 'DFT', [4, 10], 'logicalPhy'),
      a('UARC-11', 'Power, Area and Latency Budget Allocation', 'IP architecture', [6, 10], 'program'),
      a('UARC-12', 'Architecture Review and Architecture Freeze', 'IP architecture', [10, 12], 'program'),
    ],
  },

  /* ---------------- enable ---------------- */
  {
    key: 'ucieTechnology',
    prefix: 'UTEC',
    title: 'Process & Package Selection',
    band: 'enable',
    start: 6,
    dur: 14,
    gate: { id: 'ucieTechnologySelected', label: 'Technology Selected' },
    activities: [
      a('UTEC-01', 'Process Node and Metal Stack Selection', 'Technology and foundry', [0, 6], 'afe'),
      a('UTEC-02', 'PDK Maturity and Device Model Readiness for 64 GT/s Circuits', 'Technology and foundry', [2, 8], 'afe'),
      a('UTEC-03', 'Package Technology Selection and Bump Pitch Agreement — Bridge, Interposer and RDL', 'Packaging', [2, 10], 'channel'),
      a('UTEC-04', 'Package Partner Design Rules and Assembly Constraints', 'Packaging', [4, 12], 'channel'),
      a('UTEC-05', 'Test Chip Shuttle and Fab Slot Planning', 'Technology and foundry', [6, 12], 'testchip'),
      a('UTEC-06', 'Technology Risk Assessment and Technology Selection Review', 'Technology and foundry', [10, 14], 'program'),
      a('UTEC-07', 'Interoperability Partner and Reference Die Agreement — Mated Bump Map and Shared Test Vehicle', 'Compliance and interoperability', [8, 14], 'adapter'),
    ],
  },
  {
    key: 'ucieFoundation',
    prefix: 'UFND',
    title: 'Design Readiness — Foundation IP, Flows & VIP',
    band: 'enable',
    start: 8,
    dur: 14,
    gate: { id: 'ucieDesignKickoffReady', label: 'Design Kickoff Ready' },
    activities: [
      a('UFND-01', 'Foundation IP Sourcing — PLL or DLL, ESD and I/O Cells', 'Analog and mixed-signal', [0, 8], 'afe'),
      a('UFND-02', 'Standard Cells, Memories and Retry Buffer Memory Compilers', 'Physical design', [0, 8], 'adapter'),
      a('UFND-03', 'Digital Implementation Flow Readiness', 'Design methodology and CAD', [2, 10], 'adapter'),
      a('UFND-04', 'Analog and Mixed-Signal Flow Readiness — Simulation, Extraction and Reliability Checks', 'Design methodology and CAD', [2, 10], 'afe'),
      a('UFND-05', 'UCIe Verification IP Acquisition and Qualification', 'Design verification', [2, 10], 'adapter'),
      a('UFND-06', 'Design and Verification Environment — Repositories, Regression and Configuration Management', 'Design methodology and CAD', [4, 12], 'program'),
      a('UFND-07', 'Design Kickoff Readiness Review', 'Program management', [12, 14], 'program'),
    ],
  },

  /* ---------------- design & verify ---------------- */
  {
    key: 'ucieAfe',
    prefix: 'UAFE',
    title: 'Electrical PHY Circuits to Circuit Freeze',
    band: 'designVerify',
    start: 18,
    dur: 32,
    gate: { id: 'ucieCircuitFreeze', label: 'Circuit Freeze' },
    activities: [
      a('UAFE-01', 'Circuit Topology Exploration and Feasibility Simulations', 'Analog and mixed-signal', [0, 6], 'afe'),
      a('UAFE-02', 'TX Driver Design — Output Swing, Impedance, Equalization and Duty-Cycle Control', 'Analog and mixed-signal', [4, 24], 'afe'),
      a('UAFE-03', 'RX Front-End and Sampler Design — Gain, Offset Calibration and Sampling Phase', 'Analog and mixed-signal', [4, 24], 'afe'),
      a('UAFE-04', 'Clock Distribution, DLL and Phase Adjustment Design', 'Analog and mixed-signal', [4, 26], 'afe'),
      a('UAFE-05', 'Bias, Reference and Supply Regulation Design', 'Analog and mixed-signal', [6, 24], 'afe'),
      a('UAFE-06', 'ESD Protection and Bump Interface Design', 'Analog and mixed-signal', [6, 22], 'afe'),
      a('UAFE-07', 'Calibration and Training Hooks in the Analog Front-End', 'Analog and mixed-signal', [10, 26], 'afe'),
      a('UAFE-08', 'PVT Corner and Monte Carlo Simulation at 64 GT/s', 'Mixed-signal verification', [14, 28], 'afe'),
      a('UAFE-09', 'Circuit Review and Circuit Freeze', 'Analog and mixed-signal', [28, 32], 'afe'),
      a('UAFE-10', 'PLL Design — Clock Generation, Jitter and Relock from Low-Power States', 'Analog and mixed-signal', [4, 26], 'afe'),
      a('UAFE-11', 'Sideband I/O Circuits — Transmitter, Receiver, Redundant Path and Always-On Supply', 'Analog and mixed-signal', [6, 22], 'afe'),
      a('UAFE-12', 'On-Die Temperature and Voltage Sensors for Runtime Recalibration', 'Analog and mixed-signal', [8, 22], 'afe'),
    ],
  },
  {
    key: 'ucieRtl',
    prefix: 'URTL',
    title: 'Adapter & Logical PHY RTL to RTL Freeze',
    band: 'designVerify',
    start: 20,
    dur: 32,
    gate: { id: 'ucieRtlFreeze', label: 'RTL Freeze' },
    activities: [
      a('URTL-01', 'RTL Coding Guidelines, Block Specifications and Register Map', 'RTL design', [0, 6], 'adapter'),
      a('URTL-02', 'D2D Adapter RTL — CRC, Retry Buffer, Arbitration and Multiplexing', 'RTL design', [2, 22], 'adapter'),
      a('URTL-03', 'Flit Formats, Raw Format, Protocol Negotiation and the FDI', 'RTL design', [4, 24], 'adapter'),
      a('URTL-04', 'Logical PHY RTL — Lane Mapping, Scrambling and Deskew', 'RTL design', [2, 22], 'logicalPhy'),
      a('URTL-05', 'Link Training State Machine — SBINIT, MBINIT, MBTRAIN, LINKINIT, ACTIVE, PHYRETRAIN and TRAINERROR', 'RTL design', [4, 24], 'logicalPhy'),
      a('URTL-06', 'Lane Repair, Lane Reversal and Runtime Recalibration Logic', 'RTL design', [6, 26], 'logicalPhy'),
      a('URTL-07', 'Sideband Controller and Manageability Logic', 'RTL design', [4, 24], 'logicalPhy'),
      a('URTL-08', 'Low-Power State Control — L1 and L2 Entry and Exit', 'RTL design', [8, 26], 'logicalPhy'),
      a('URTL-09', 'Lint, CDC and RDC Clean-Up', 'RTL design', [14, 30], 'adapter'),
      a('URTL-10', 'RTL Freeze Review', 'RTL design', [28, 32], 'adapter'),
    ],
  },
  {
    key: 'ucieDft',
    prefix: 'UDFT',
    title: 'Test, Lane Repair & Debug Hooks',
    band: 'designVerify',
    start: 26,
    dur: 26,
    gate: { id: 'ucieDftFreeze', label: 'DFT Freeze' },
    activities: [
      a('UDFT-01', 'DFT Specification and Test Access Plan', 'DFT', [0, 4], 'logicalPhy'),
      a('UDFT-02', 'Scan Insertion Plan and ATPG Coverage Targets', 'DFT', [2, 18], 'logicalPhy'),
      a('UDFT-03', 'PRBS Generators and Checkers per Lane', 'DFT', [2, 16], 'logicalPhy'),
      a('UDFT-04', 'Loopback Modes — Near-End, Far-End and Analog', 'DFT', [4, 18], 'afe'),
      a('UDFT-05', 'BIST and Built-In Lane Test for Bump Repair', 'DFT', [4, 20], 'logicalPhy'),
      a('UDFT-06', 'Eye and Lane Margining Functions', 'DFT', [6, 20], 'afe'),
      a('UDFT-07', 'Debug Access — Register Snapshots, Trace and Sideband Debug', 'DFT', [8, 22], 'logicalPhy'),
      a('UDFT-08', 'DFT Review and DFT Freeze', 'DFT', [22, 26], 'logicalPhy'),
    ],
  },
  {
    key: 'ucieDv',
    prefix: 'UDV',
    title: 'Protocol & Training Verification Sign-Off',
    band: 'designVerify',
    start: 22,
    dur: 38,
    gate: { id: 'ucieVerificationClosure', label: 'Verification Closure' },
    activities: [
      a('UDV-01', 'Verification Plan and Coverage Model', 'Design verification', [0, 6], 'adapter'),
      a('UDV-02', 'UVM Environment and Verification IP Integration', 'Design verification', [2, 12], 'adapter'),
      a('UDV-03', 'Link Training and State Machine Verification', 'Design verification', [8, 30], 'logicalPhy'),
      a('UDV-04', 'Error Injection, CRC and Retry Verification', 'Design verification', [10, 30], 'adapter'),
      a('UDV-05', 'Lane Repair, Lane Reversal and Deskew Verification', 'Design verification', [10, 30], 'logicalPhy'),
      a('UDV-06', 'Low-Power Entry and Exit Verification', 'Design verification', [14, 32], 'logicalPhy'),
      a('UDV-07', 'Flit Format, Raw Format and Protocol Negotiation Verification', 'Design verification', [12, 32], 'adapter'),
      a('UDV-08', 'Sideband, Register and Manageability Verification', 'Design verification', [12, 30], 'logicalPhy'),
      a('UDV-09', 'Compliance Scenario Verification', 'Design verification', [20, 34], 'adapter'),
      a('UDV-10', 'Gate-Level Simulation and DFT Pattern Verification', 'Design verification', [26, 36], 'logicalPhy'),
      a('UDV-11', 'Coverage Closure and Post-Silicon Test Plan Hand-Off', 'Design verification', [28, 36], 'adapter'),
      a('UDV-12', 'Verification Sign-Off Review', 'Design verification', [34, 38], 'adapter'),
    ],
  },
  {
    key: 'ucieAms',
    prefix: 'UAMS',
    title: 'Link Margin Proof Before Layout',
    band: 'designVerify',
    start: 34,
    dur: 26,
    gate: { id: 'ucieLinkMarginReview', label: 'Link Margin Review' },
    activities: [
      a('UAMS-01', 'Electrical PHY Behavioral Models and Model Validation Plan', 'Mixed-signal verification', [0, 6], 'afe'),
      a('UAMS-02', 'Mixed-Signal Co-Simulation of the Electrical PHY with the Logical PHY RTL', 'Mixed-signal verification', [4, 18], 'afe'),
      a('UAMS-03', 'Link Training with Analog Models in the Loop', 'Mixed-signal verification', [6, 20], 'logicalPhy'),
      a('UAMS-04', 'Link Margin Simulation with Package Channel Models', 'SI/PI', [8, 22], 'channel'),
      a('UAMS-05', 'PVT and Monte Carlo Link Margin Statistics', 'Mixed-signal verification', [10, 22], 'afe'),
      a('UAMS-06', 'Model-to-Circuit Correlation', 'Mixed-signal verification', [12, 22], 'afe'),
      a('UAMS-07', 'Margin Predictions and Silicon Measurement Plan Hand-Off', 'Mixed-signal verification', [18, 24], 'afe'),
      a('UAMS-08', 'Link Margin Review', 'Analog and mixed-signal', [22, 26], 'afe'),
    ],
  },

  /* ---------------- implement ---------------- */
  {
    key: 'ucieDigitalPd',
    prefix: 'UDPD',
    title: 'Digital Hardening & Timing Closure',
    band: 'implement',
    start: 46,
    dur: 20,
    gate: { id: 'ucieDigitalTimingClosure', label: 'Digital Timing Closure' },
    activities: [
      a('UDPD-01', 'Synthesis Trials and Constraints on Pre-Freeze RTL', 'Physical design', [0, 6], 'adapter'),
      a('UDPD-02', 'Final Synthesis and Netlist Release', 'Physical design', [6, 10], 'adapter'),
      a('UDPD-03', 'Digital Floorplan and Power Grid', 'Physical design', [6, 12], 'logicalPhy'),
      a('UDPD-04', 'Place and Route', 'Physical design', [10, 16], 'adapter'),
      a('UDPD-05', 'Timing Closure Across Corners and Modes', 'Physical design', [12, 18], 'adapter'),
      a('UDPD-06', 'Digital Hard Macro Hardening and Abstract Generation', 'Physical design', [16, 20], 'logicalPhy'),
      a('UDPD-07', 'Digital Timing Closure Review', 'Physical design', [18, 20], 'adapter'),
      a('UDPD-08', 'Functional ECO Implementation on the Released Netlist', 'Physical design', [8, 18], 'adapter'),
    ],
  },
  {
    key: 'ucieLayout',
    prefix: 'ULAY',
    title: 'Hard Macro Layout & Assembly',
    band: 'implement',
    start: 44,
    dur: 24,
    gate: { id: 'ucieLayoutComplete', label: 'Layout Complete' },
    activities: [
      a('ULAY-01', 'Electrical PHY Layout Floorplan and Critical-Block Placement', 'Analog layout', [0, 6], 'afe'),
      a('ULAY-02', 'TX, RX, Clocking, PLL and Sideband I/O Layout', 'Analog layout', [6, 16], 'afe'),
      a('ULAY-03', 'Matching, Shielding and Parasitic Control', 'Analog layout', [8, 18], 'afe'),
      a('ULAY-04', 'Bump Map Implementation and PHY Macro Assembly', 'Analog layout', [12, 20], 'channel'),
      a('ULAY-05', 'Post-Layout Extraction and Simulation', 'Mixed-signal verification', [14, 22], 'afe'),
      a('ULAY-06', 'Abstract, Timing and Power Model Generation', 'Analog layout', [18, 22], 'afe'),
      a('ULAY-07', 'Layout Completion Review', 'Analog layout', [22, 24], 'afe'),
    ],
  },
  {
    key: 'ucieSignoff',
    prefix: 'USGN',
    title: 'Hard Macro Signoff for Tapeout & v0.9',
    band: 'implement',
    start: 62,
    dur: 10,
    gate: { id: 'ucieHardMacroSignoff', label: 'Hard Macro Signoff', major: true },
    activities: [
      a('USGN-01', 'Static Timing Signoff', 'Physical design', [0, 7], 'adapter'),
      a('USGN-02', 'EM and IR Drop Signoff', 'Physical design', [0, 7], 'afe'),
      a('USGN-03', 'Physical Verification — DRC, LVS and Antenna', 'Physical design', [1, 8], 'afe'),
      a('USGN-04', 'ESD and Latch-Up Verification', 'Analog and mixed-signal', [1, 8], 'afe'),
      a('USGN-05', 'Aging and Reliability Verification', 'Reliability', [2, 8], 'afe'),
      a('USGN-06', 'Hard Macro Integration Checks — Abstracts, Models and Bump Map Consistency', 'Physical design', [3, 8], 'channel'),
      a('USGN-07', 'Hard Macro Signoff Review', 'Program management', [8, 10], 'program'),
      a('USGN-08', 'Timing-Annotated Gate-Level Simulation on the Signoff Netlist', 'Design verification', [1, 8], 'adapter'),
    ],
  },

  /* ---------------- integrate ---------------- */
  {
    key: 'ucieChannel',
    prefix: 'UCHN',
    title: 'Channel Specification & Bump Map Co-Design',
    band: 'integrate',
    start: 16,
    dur: 54,
    gate: { id: 'ucieChannelSpecMet', label: 'Channel Spec Met' },
    activities: [
      a('UCHN-01', 'Channel Specification — Voltage Transfer Function Loss, Crosstalk, Reach and Eye Mask', 'SI/PI', [0, 10], 'channel'),
      a('UCHN-02', 'Bump and Routing Design Rules for Bridge, Interposer and RDL Packages', 'Packaging', [4, 16], 'channel'),
      a('UCHN-03', 'Bump Map and Channel Specification Freeze', 'SI/PI', [16, 20], 'channel'),
      a('UCHN-04', 'Package Channel Extraction and SI Simulation', 'SI/PI', [16, 36], 'channel'),
      a('UCHN-05', 'Power Delivery Network and PI Analysis', 'SI/PI', [18, 38], 'channel'),
      a('UCHN-06', 'Customer Channel Guidelines and Reference Design', 'SI/PI', [30, 48], 'channel'),
      a('UCHN-07', 'Test Vehicle Channel Correlation Plan', 'SI/PI', [36, 50], 'channel'),
      a('UCHN-08', 'Channel Specification Compliance Review', 'SI/PI', [50, 54], 'channel'),
    ],
  },
  {
    key: 'ucieTestChip',
    prefix: 'UTCI',
    title: 'Test Chip Build for Silicon Proof',
    band: 'integrate',
    start: 48,
    dur: 26,
    gate: { id: 'ucieTestChipReady', label: 'Test Chip Ready' },
    activities: [
      a('UTCI-01', 'Test Chip Architecture — Two-Die Link and Loopback Configurations', 'Test chip integration', [0, 4], 'testchip'),
      a('UTCI-02', 'Test Chip Wrapper, Pattern Generators and Test Logic', 'Test chip integration', [2, 12], 'testchip'),
      a('UTCI-03', 'Test Chip Top-Level Integration — PHY Macros, Pads, Bumps and Power', 'Test chip integration', [6, 18], 'testchip'),
      a('UTCI-04', 'Test Chip Verification — Top-Level Simulation and Connectivity', 'Design verification', [10, 22], 'testchip'),
      a('UTCI-05', 'Test Chip Physical Design and Signoff', 'Physical design', [16, 26], 'testchip'),
      a('UTCI-06', 'Test Chip Readiness Review', 'Program management', [24, 26], 'testchip'),
    ],
  },
  {
    key: 'ucieTestVehicle',
    prefix: 'UTVP',
    title: 'Silicon-Ready Hardware — Test Vehicle, Boards & Lab',
    band: 'integrate',
    start: 50,
    dur: 42,
    gate: { id: 'ucieHardwareReady', label: 'Hardware Ready' },
    activities: [
      a('UTVP-01', 'Test Vehicle Package Design — Bridge and Interposer Variants, a Reversed-Orientation Build and the Partner Die', 'Packaging', [0, 14], 'testchip'),
      a('UTVP-02', 'Substrate Procurement, Bridge and Interposer Fabrication and Partner Die Supply', 'Packaging', [10, 34], 'testchip'),
      a('UTVP-03', 'Evaluation Board Design and Fabrication', 'Board and lab hardware', [6, 30], 'testchip'),
      a('UTVP-04', 'ATE Load Board and Probe Card', 'Test engineering', [8, 34], 'testchip'),
      a('UTVP-05', 'Lab Equipment and Automation Readiness', 'Validation', [14, 38], 'testchip'),
      a('UTVP-06', 'Bring-Up Plan and Test Programs from the Pre-Silicon Test Plan', 'Validation', [20, 38], 'testchip'),
      a('UTVP-07', 'Hardware Readiness Review', 'Validation', [38, 42], 'testchip'),
      a('UTVP-08', 'Bridge and Interposer Design Signoff and Tapeout for the Test Vehicle', 'Packaging', [4, 18], 'testchip'),
      a('UTVP-09', 'Reliability Stress Boards, Sockets and Package Final Test Program', 'Test engineering', [10, 40], 'testchip'),
    ],
  },

  /* ---------------- manufacture ---------------- */
  {
    key: 'ucieTapeout',
    prefix: 'UTPO',
    title: 'Test Chip Tapeout',
    band: 'manufacture',
    start: 72,
    dur: 4,
    gate: { id: 'ucieTapeout', label: 'Tapeout', major: true },
    activities: [
      a('UTPO-01', 'Tapeout Checklist — Signoff Waivers and Deliverable Completeness', 'Program management', [0, 2], 'program'),
      a('UTPO-02', 'Full-Chip Final Checks — DRC, LVS and Density on the Test Chip', 'Physical design', [0, 2], 'testchip'),
      a('UTPO-03', 'Mask, Shuttle and Lot Confirmation', 'Technology and foundry', [1, 4], 'testchip'),
      a('UTPO-04', 'Database Release and Foundry Handoff', 'Physical design', [2, 4], 'testchip'),
      a('UTPO-05', 'Tapeout Archive and Configuration Baseline', 'Program management', [2, 4], 'program'),
    ],
  },
  {
    key: 'ucieFab',
    prefix: 'UFAB',
    title: 'Fab, Sort & Assembly to Silicon in Hand',
    band: 'manufacture',
    start: 76,
    dur: 22,
    gate: { id: 'ucieSiliconInHand', label: 'Silicon in Hand' },
    activities: [
      a('UFAB-01', 'Wafer Fabrication and Wafer Bumping Tracking', 'Technology and foundry', [0, 14], 'testchip'),
      a('UFAB-02', 'Wafer Sort and Known-Good-Die Selection', 'Test engineering', [14, 16], 'testchip'),
      a('UFAB-03', 'Test Vehicle Package Assembly — Every Variant', 'Packaging', [15, 21], 'testchip'),
      a('UFAB-04', 'Board Assembly and Inspection', 'Board and lab hardware', [19, 21], 'testchip'),
      a('UFAB-05', 'First Samples Received in the Lab', 'Validation', [20, 22], 'testchip'),
    ],
  },

  /* ---------------- silicon validation ---------------- */
  {
    key: 'ucieBringup',
    prefix: 'UBUP',
    title: 'Bring-Up to First Link-Up',
    band: 'siliconValidation',
    start: 98,
    dur: 8,
    gate: { id: 'ucieFirstLinkUp', label: 'First Link-up' },
    activities: [
      a('UBUP-01', 'Power-On and Supply Sequencing', 'Validation', [0, 1], 'testchip'),
      a('UBUP-02', 'Sideband Link-Up and Register Access', 'Validation', [1, 3], 'logicalPhy'),
      a('UBUP-03', 'Mainband Training — MBINIT and MBTRAIN', 'Validation', [2, 5], 'logicalPhy'),
      a('UBUP-04', 'First Link-Up and Basic Data Transfer', 'Validation', [4, 7], 'adapter'),
      a('UBUP-05', 'Bring-Up Against the Pre-Silicon Test Plan and Margin Predictions', 'Validation', [3, 8], 'afe'),
      a('UBUP-06', 'First Link-Up Review', 'Validation', [7, 8], 'program'),
      a('UBUP-07', 'Silicon Respin or Metal-Fix Decision', 'Program management', [6, 8], 'program'),
    ],
  },
  {
    key: 'ucieCharacterization',
    prefix: 'UCHR',
    title: 'Silicon Characterization & Model Correlation',
    band: 'siliconValidation',
    start: 102,
    dur: 20,
    gate: { id: 'ucieCharacterizationReport', label: 'Characterization Report' },
    activities: [
      a('UCHR-01', 'Characterization Plan and Corner Matrix', 'Validation', [0, 2], 'afe'),
      a('UCHR-02', 'Eye Margin and Timing Margin per Lane', 'Validation', [2, 12], 'afe'),
      a('UCHR-03', 'BER Measurement at 64 GT/s', 'Validation', [4, 14], 'afe'),
      a('UCHR-04', 'Energy per Bit Measurement', 'Validation', [4, 12], 'afe'),
      a('UCHR-05', 'PVT Shmoo — Voltage, Temperature and Process Splits', 'Validation', [6, 16], 'afe'),
      a('UCHR-06', 'Lane Repair and Lane Reversal on Silicon', 'Validation', [6, 14], 'logicalPhy'),
      a('UCHR-07', 'Runtime Recalibration and Low-Power State Behavior on Silicon', 'Validation', [8, 16], 'logicalPhy'),
      a('UCHR-08', 'Package Channel Correlation on the Test Vehicle', 'SI/PI', [8, 16], 'channel'),
      a('UCHR-09', 'Measurement-to-Simulation Correlation', 'Mixed-signal verification', [12, 18], 'afe'),
      a('UCHR-10', 'Characterization Report Review', 'Validation', [16, 20], 'afe'),
      a('UCHR-11', 'PLL Jitter, Supply Sensitivity and Relock Characterization', 'Validation', [4, 14], 'afe'),
    ],
  },
  {
    key: 'ucieCompliance',
    prefix: 'UCMP',
    title: 'Compliance & Interop Proof',
    band: 'siliconValidation',
    start: 110,
    dur: 16,
    gate: { id: 'ucieCompliancePass', label: 'Compliance Pass' },
    activities: [
      a('UCMP-01', 'Compliance Test Plan and Test Setup', 'Compliance and interoperability', [0, 3], 'program'),
      a('UCMP-02', 'Electrical Compliance Testing Against a Reference Die over the Sideband', 'Compliance and interoperability', [2, 10], 'afe'),
      a('UCMP-03', 'Link Training and Protocol Compliance Testing', 'Compliance and interoperability', [3, 11], 'logicalPhy'),
      a('UCMP-04', 'Interoperability with Other UCIe Dies', 'Compliance and interoperability', [4, 14], 'adapter'),
      a('UCMP-05', 'Compliance Results Review', 'Compliance and interoperability', [13, 16], 'program'),
    ],
  },
  {
    key: 'ucieReliability',
    prefix: 'URLQ',
    title: 'Reliability Qualification for Silicon-Proven',
    band: 'siliconValidation',
    start: 102,
    dur: 26,
    gate: { id: 'ucieSiliconProven', label: 'Silicon-Proven', major: true },
    activities: [
      a('URLQ-01', 'Reliability Qualification Plan', 'Reliability', [0, 2], 'program'),
      a('URLQ-02', 'High-Temperature Operating Life Stress', 'Reliability', [4, 22], 'afe'),
      a('URLQ-03', 'ESD and Latch-Up Qualification', 'Reliability', [2, 10], 'afe'),
      a('URLQ-04', 'Temperature Cycling and Package-Level Reliability on the Test Vehicle', 'Reliability', [4, 22], 'channel'),
      a('URLQ-05', 'Reliability Report', 'Reliability', [20, 24], 'program'),
      a('URLQ-06', 'Silicon-Proven Decision Review', 'Quality', [24, 26], 'program'),
    ],
  },

  /* ---------------- IP release & enablement ---------------- */
  {
    key: 'uciePreSilicon',
    prefix: 'UPRE',
    title: 'Early Licensee Releases — v0.5 & v0.9',
    band: 'ipRelease',
    start: 52,
    dur: 26,
    gate: { id: 'ucieV09Release', label: 'v0.9 Release' },
    activities: [
      a('UPRE-01', 'Release Package Structure, Release QA Process, Export Classification and Licensee Entitlement', 'Technical documentation', [0, 4], 'program'),
      a('UPRE-02', 'v0.5 Release — RTL, Behavioral Models and Preliminary Integration Guide', 'Customer engineering', [2, 8], 'adapter'),
      a('UPRE-03', 'Early-Access Customer Onboarding and Feedback', 'Customer engineering', [6, 20], 'program'),
      a('UPRE-04', 'Physical Views — GDS, LEF and Liberty', 'Physical design', [20, 24], 'afe'),
      a('UPRE-05', 'Timing, Power and Channel Models — Channel Compliance Kit with Behavioral TX and RX Models', 'SI/PI', [16, 24], 'channel'),
      a('UPRE-06', 'Integration Guide and Application Notes', 'Technical documentation', [10, 24], 'program'),
      a('UPRE-07', 'v0.9 Release Package QA', 'Quality', [22, 25], 'program'),
      a('UPRE-08', 'v0.9 Release Decision', 'Customer engineering', [24, 26], 'program'),
      a('UPRE-09', 'v0.5 Release Sign-Off — QA, Entitlement and Distribution', 'Product management', [6, 9], 'program'),
    ],
  },
  {
    key: 'ucieGa',
    prefix: 'UGA',
    title: 'Production Release on Silicon Data',
    band: 'ipRelease',
    start: 120,
    dur: 12,
    gate: { id: 'ucieIpGa', label: 'IP Production Release', major: true },
    activities: [
      a('UGA-01', 'Silicon Data Rollup into the Release Package', 'Customer engineering', [6, 9], 'program'),
      a('UGA-02', 'Silicon Report and Characterization Summary', 'Validation', [4, 9], 'afe'),
      a('UGA-03', 'Final Release Package — Views, Models and Documents Updated to Silicon', 'Technical documentation', [5, 10], 'program'),
      a('UGA-04', 'Production Release QA', 'Quality', [9, 11], 'program'),
      a('UGA-05', 'Production Release Approval Review', 'Program management', [11, 12], 'program'),
    ],
  },
  {
    key: 'ucieCustomer',
    prefix: 'UCUS',
    title: 'Licensee Integration Support & Sustaining',
    band: 'ipRelease',
    start: 56,
    dur: 84,
    gate: { id: 'ucieSustainingHandover', label: 'Sustaining Handover' },
    activities: [
      a('UCUS-01', 'Customer Integration Reviews — Floorplan, Bump Map, Power and Channel', 'Customer engineering', [0, 60], 'program'),
      a('UCUS-02', 'SoC-Level Signoff Support', 'Customer engineering', [20, 72], 'program'),
      a('UCUS-03', 'Documentation, FAQ and Knowledge Base', 'Technical documentation', [6, 80], 'program'),
      a('UCUS-04', 'Customer Issue Tracking and ECO Handling', 'Customer engineering', [20, 80], 'program'),
      a('UCUS-05', 'Sustaining Handover Review', 'Quality', [80, 84], 'program'),
      a('UCUS-06', 'Errata, Patch Releases and Customer Notification', 'Customer engineering', [22, 80], 'program'),
      a('UCUS-07', 'Customer Variant and Porting Request Evaluation', 'Product management', [10, 80], 'program'),
      a('UCUS-08', 'Early Silicon Data Briefs to Licensees', 'Customer engineering', [52, 62], 'program'),
    ],
  },
];
