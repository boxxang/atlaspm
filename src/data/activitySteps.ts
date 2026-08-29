/**
 * Every activity's steps, compactly — 1649 of them across 257 activities.
 *
 * The third data module, and the one the browser holds. A step carries state
 * now (done, percent, owner, due, completed, outputs, posts), and that is
 * answered in the browser, so the browser has to know what the steps are. It
 * may not have /data/activityDetails.ts: that is a megabyte of prose the server
 * reads one write-up of at a time.
 *
 * Tuples rather than objects. At 1649 steps the four key names of
 * {n, text, tat, lane} cost more than the content does, so a step is
 * [n, text, weeks] and the flag is appended only where it is true.
 *
 * Generated from the same authoring document. Not edited by hand.
 */

/** [number, what it is, weeks it takes, 1 if it runs alongside the step before]. */
export type StepTuple = [number, string, number] | [number, string, number, 1];

/** How an activity stands to a key deliverable: it owns it, or it contributes. */
export type DeliverableRelation = 'produces' | 'feeds' | 'informs' | 'gates';

export interface ActivityStepEntry {
  /** The stage that runs it. */
  st: string;
  /** [from, to] in weeks from the stage start. */
  w: [number, number];
  s: StepTuple[];
  /** What each step hands over, in step order. */
  o: string[];
  /** Index-aligned to `o`: which step yields each output. */
  ob: number[];
  /** The key deliverables it relates to: [reference, how]. */
  r: [string, DeliverableRelation][];
  /** The role that owns it — what a step with nobody on it falls back to. */
  ro: string;
}

/** Keyed by activity reference, in template order. */
export const activitySteps: Record<string, ActivityStepEntry> = {
 "DEF-01": {
  "st": "productDefinition",
  "w": [
   0,
   4
  ],
  "s": [
   [
    1,
    "Identify stakeholders and plan interviews",
    0.5
   ],
   [
    2,
    "Conduct anchor-customer interviews - two accounts, six sessions",
    1.5
   ],
   [
    3,
    "Analyze market, analyst, and segment data",
    1,
    1
   ],
   [
    4,
    "Consolidate and prioritize product requirements",
    1
   ],
   [
    5,
    "Resolve conflicts and set priorities- must-have, should-have, nice-to-have",
    0.5
   ],
   [
    6,
    "Link product requirements to KPIs and PPA targets",
    0.5,
    1
   ],
   [
    7,
    "Review and baseline product requirements",
    0.5
   ]
  ],
  "o": [
   "Stakeholder map and interview schedule",
   "Customer needs and feedback by account",
   "Market outlook and target segment sizing",
   "Product requirements- ID, owner, priority, and acceptance criteria",
   "Priority decisions and deferred requirements log",
   "Priority ranking record",
   "Requirement-to-KPI and PPA traceability",
   "Approved product requirements baseline"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   5,
   6,
   7
  ],
  "r": [
   [
    "DEF-D1",
    "produces"
   ],
   [
    "DEF-D2",
    "feeds"
   ],
   [
    "DEF-D3",
    "informs"
   ],
   [
    "DEF-D4",
    "feeds"
   ],
   [
    "DEF-D6",
    "gates"
   ]
  ],
  "ro": "Requirements lead"
 },
 "DEF-02": {
  "st": "productDefinition",
  "w": [
   1,
   6
  ],
  "s": [
   [
    1,
    "Define key use cases from product requirements",
    0.5
   ],
   [
    2,
    "Capture workload traces for LLM, vision, and recommendation",
    1.5
   ],
   [
    3,
    "Run workloads on previous-generation silicon for baseline",
    1,
    1
   ],
   [
    4,
    "Define KPIs — TOPS, TOPS/W, tokens/s, TTFT, batch scaling",
    1.5
   ],
   [
    5,
    "Define precision and quantization policy — INT8, FP8, mixed",
    1,
    1
   ],
   [
    6,
    "Analyze KPI sensitivity to architecture choices",
    1
   ],
   [
    7,
    "Package workload suite and hand off to architecture",
    0.5
   ]
  ],
  "o": [
   "Prioritized use cases with expected workloads mix",
   "Representative workload traces for each use case",
   "Baseline performance measurements",
   "KPI targets and measurement conditions for each workload",
   "Precision and quantization policy",
   "KPI sensitivity by architectural parameter",
   "Models, traces, and execution harness ready for architecture modeling"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DEF-D2",
    "produces"
   ],
   [
    "DEF-D1",
    "feeds"
   ],
   [
    "DEF-D4",
    "feeds"
   ]
  ],
  "ro": "Workload architect"
 },
 "DEF-03": {
  "st": "productDefinition",
  "w": [
   3,
   7
  ],
  "s": [
   [
    1,
    "Define frequency target from KPIs and expected IPC",
    0.75
   ],
   [
    2,
    "Break down the power envelope - board, package, die, and domain level",
    1
   ],
   [
    3,
    "Allocate die area based on block list and IP reuse",
    1
   ],
   [
    4,
    "Defince initial operating voltage and multi-Vt strategy",
    0.5,
    1
   ],
   [
    5,
    "Evaluate PPA sensitivity across candidate nodes",
    0.75,
    1
   ],
   [
    6,
    "Allocate PPA budgets to each block and assign owners",
    0.75
   ],
   [
    7,
    "Review PPA targets with architecture and physical design",
    0.5
   ]
  ],
  "o": [
   "Frequency target with the IPC assumption",
   "Power budget from board to domain level",
   "Die area budget by block",
   "Operating voltage and multi-Vt strategy",
   "PPA sensitivity by candidate node",
   "Per-block PPA budget with owners",
   "Approved PPA targets and review record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DEF-D2",
    "produces"
   ],
   [
    "DEF-D4",
    "feeds"
   ],
   [
    "DEF-D3",
    "informs"
   ]
  ],
  "ro": "PPA lead"
 },
 "DEF-04": {
  "st": "productDefinition",
  "w": [
   3,
   7
  ],
  "s": [
   [
    1,
    "Estimate die area from the block list and IP reuse plan",
    0.75
   ],
   [
    2,
    "Calculate wafer cost and gross die per wafer for each candidate node",
    0.5
   ],
   [
    3,
    "Estimate yield using defect density for each candidate node",
    1
   ],
   [
    4,
    "Estimate package and substrate cost - interposer, substrate, and HBM",
    0.75,
    1
   ],
   [
    5,
    "Estimate wafer sort and final test",
    0.5,
    1
   ],
   [
    6,
    "Calculate unit cost and margin at a forecast volume",
    1
   ],
   [
    7,
    "Analyze sensitivities to the three largest cost drivers",
    0.75
   ]
  ],
  "o": [
   "Die area estimate with expected range",
   "Wafer cost and gross die per wafer by node",
   "Yield model and expected yield by node",
   "Package and substrate cost breakdown",
   "Test cost with its test-time assumption",
   "Product cost model and margin at the forecast volume",
   "Margin roll-up at the forecast volume",
   "Cost ceiling statement for the design",
   "Sensitivity analysis and impact range"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6,
   6,
   7
  ],
  "r": [
   [
    "DEF-D3",
    "produces"
   ],
   [
    "DEF-D4",
    "feeds"
   ],
   [
    "DEF-D6",
    "gates"
   ]
  ],
  "ro": "Product cost analyst"
 },
 "DEF-05": {
  "st": "productDefinition",
  "w": [
   2,
   5
  ],
  "s": [
   [
    1,
    "Determine bandwidth demand from DEF-02 workloads",
    0.75
   ],
   [
    2,
    "Size the memory hierarchy - on-die SRAM, HBM capacity, stacks, and channels.",
    1
   ],
   [
    3,
    "Size the host interface - PCIe/CXL generation and lane count",
    0.5,
    1
   ],
   [
    4,
    "Define Die-to-die interface requirement for chiplet option",
    0.5,
    1
   ],
   [
    5,
    "Translate interface requirements into pin and bump budgets",
    0.75
   ],
   [
    6,
    "Review requirements with architecture and package teams",
    0.5
   ]
  ],
  "o": [
   "Bandwidth requirements by workload and memory hierarchy level",
   "Memory configuration — capacity, stacks, and channels",
   "Host interface configuration — generation and lane count",
   "Die-to-die interface requirement",
   "Pin and bump budget",
   "Approved memory, interface and bump requirements"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "DEF-D1",
    "feeds"
   ],
   [
    "DEF-D2",
    "feeds"
   ]
  ],
  "ro": "Memory systems architect"
 },
 "DEF-06": {
  "st": "productDefinition",
  "w": [
   0,
   4
  ],
  "s": [
   [
    1,
    "Identify target competitor and expected launch timing",
    0.5
   ],
   [
    2,
    "Collect public benchmarks, specifications, and public product information",
    1
   ],
   [
    3,
    "Normalize benchmark data and comparison conditions",
    1,
    1
   ],
   [
    4,
    "Project competitor capabilities to our target launch window",
    1
   ],
   [
    5,
    "Compare our product targets against expected competitors",
    1
   ],
   [
    6,
    "Review gaps with product and sales teams",
    0.5
   ]
  ],
  "o": [
   "Target competitor list with expected launch timing",
   "Competitor benchmark and specification data",
   "Comparable benchmark data with clearly defined conditions",
   "Expected competitor performance and capabilities at launch",
   "Prioritized performance and capability gaps",
   "Competitive gaps to feed into DEF-01 product requirements"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "DEF-D1",
    "feeds"
   ],
   [
    "DEF-D3",
    "informs"
   ]
  ],
  "ro": "Product marketing lead"
 },
 "DEF-07": {
  "st": "productDefinition",
  "w": [
   4,
   8
  ],
  "s": [
   [
    1,
    "Confirm candidate process nodes with the technology team",
    0.5
   ],
   [
    2,
    "Evaluate PPA feasibility for each node - density, frequency, and leakage",
    1.25
   ],
   [
    3,
    "Assess IP availability and readiness for each node",
    0.75,
    1
   ],
   [
    4,
    "Re-run the product cost model for each node",
    0.5,
    1
   ],
   [
    5,
    "Evaluate package and thermal feasibility at target power",
    0.75
   ],
   [
    6,
    "Identify required tradeoffs and their impact for each node",
    0.75
   ],
   [
    7,
    "Determine feasibility and recommend a path forward",
    0.75
   ]
  ],
  "o": [
   "Candidate process node shortlist",
   "PPA feasibility assessment by node",
   "IP readiness assessment by node",
   "Product cost and margin by node",
   "Package and thermal feasibility by node",
   "Required tradeoffs and impact by node",
   "Feasibility decision and recommended path"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DEF-D4",
    "produces"
   ],
   [
    "DEF-D6",
    "gates"
   ]
  ],
  "ro": "Feasibility lead"
 },
 "DEF-08": {
  "st": "productDefinition",
  "w": [
   4,
   8
  ],
  "s": [
   [
    1,
    "Select the program profile and set the kickoff date",
    0.5
   ],
   [
    2,
    "Adjust stage baseline for the program scope",
    0.75
   ],
   [
    3,
    "Estimate engineering effort by stage and discipline",
    1
   ],
   [
    4,
    "Compare staffing needs against available capacity",
    1
   ],
   [
    5,
    "Add external lead times — substrate, probe card, IP, and shuttle",
    0.75,
    1
   ],
   [
    6,
    "Identify the critical path and define schedule buffers",
    0.75
   ],
   [
    7,
    "Review and commit the program schedule",
    0.5,
    1
   ]
  ],
  "o": [
   "Program profile with committed kickoff date",
   "Program schedule with stage boundaries and milestones",
   "Engineering effort by stage and discipline",
   "Staffing plan with identified resource gaps",
   "External lead times and required order dates",
   "Critical path and schedule buffers",
   "Approved program schedule and resource plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DEF-D5",
    "produces"
   ],
   [
    "DEF-D6",
    "gates"
   ]
  ],
  "ro": "Program manager"
 },
 "DEF-09": {
  "st": "productDefinition",
  "w": [
   5,
   8
  ],
  "s": [
   [
    1,
    "Build the financial model - NRE, operating cost, revenue, and breakeven",
    1
   ],
   [
    2,
    "Evaluate expected, downside, and upside scenarios",
    0.75,
    1
   ],
   [
    3,
    "Summary key program risks and mitigation plans",
    0.5
   ],
   [
    4,
    "Define recommendation and required funding",
    0.5
   ],
   [
    5,
    "Prepare executive review package",
    0.75
   ],
   [
    6,
    "Conduct the Go / No-Go review and record the decision",
    0.25
   ]
  ],
  "o": [
   "Financial model and expected product economics",
   "Financial impact across key scenarios",
   "Key risks and mitigation actions",
   "Recommended path and funding request",
   "Business case for funding review",
   "Go / No-Go decision, conditions, and action owners"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "DEF-D6",
    "produces"
   ],
   [
    "DEF-D5",
    "feeds"
   ]
  ],
  "ro": "Program manager"
 },
 "ARCH-01": {
  "st": "architecture",
  "w": [
   0,
   14
  ],
  "s": [
   [
    1,
    "Define the performance model scope, detail level, and key assumptions",
    1
   ],
   [
    2,
    "Build the baseline system model — compute, memory, and interconnect",
    2.5
   ],
   [
    3,
    "Integrate the DEF-02 workload suite",
    1,
    1
   ],
   [
    4,
    "Correlate the model with previous-generation silicon",
    1.5
   ],
   [
    5,
    "Explore architecture options — compute clusters, SRAM capacity, HBM channels",
    3
   ],
   [
    6,
    "Evaluate interconnect and NoC topology options",
    2,
    1
   ],
   [
    7,
    "Integrate power estimates and evaluate performance efficiency",
    2
   ],
   [
    8,
    "Identify system bottlenecks and performance limits",
    1.5,
    1
   ],
   [
    9,
    "Evaluate sensitivity and model confidence",
    3
   ],
   [
    10,
    "Package the model and regression environment for reuse",
    1
   ]
  ],
  "o": [
   "Performance model scope and modeling assumptions",
   "Baseline system performance model",
   "Workloads integrated into the performance model",
   "Model correlation results and error range",
   "Performance impact across architecture options",
   "Interconnect and NoC performance comparison",
   "Power and TOPS/W projections",
   "Bottleneck and roofline analysis",
   "Sensitivity results and model confidence range",
   "Performance model, source, and regression environment"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "r": [
   [
    "ARCH-D2",
    "produces"
   ],
   [
    "ARCH-D1",
    "feeds"
   ],
   [
    "ARCH-D3",
    "feeds"
   ]
  ],
  "ro": "Performance architect"
 },
 "ARCH-02": {
  "st": "architecture",
  "w": [
   2,
   10
  ],
  "s": [
   [
    1,
    "Define functional blocks and system hierarchy",
    1
   ],
   [
    2,
    "Check die size against reticle and process constraints",
    0.5
   ],
   [
    3,
    "Develop monolithic and chiplet architecture options",
    2
   ],
   [
    4,
    "Compare yield and cost across architecture options using DEF-04 model",
    1.5,
    1
   ],
   [
    5,
    "Evaluate Die-to-die interface requirements for chiplet options",
    1,
    1
   ],
   [
    6,
    "Define partition boundaries and what crosses each boundary",
    3
   ],
   [
    7,
    "Evaluate known-good-die and test implications",
    1,
    1
   ],
   [
    8,
    "Select and document the system and die partitioning",
    1.5
   ]
  ],
  "o": [
   "Block definitions and system hierarchy",
   "Die size and reticle feasibility",
   "Candidate partitioning options",
   "Yield and cost comparison by option",
   "Die-to-die bandwidth, latency, and interface requirements",
   "Partition boundaries with signals, bandwidth, and latency requirements",
   "KGD and test impact assessment",
   "Selected partitioning and decision rationale"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "ARCH-D3",
    "produces"
   ],
   [
    "ARCH-D1",
    "feeds"
   ],
   [
    "ARCH-D6",
    "feeds"
   ]
  ],
  "ro": "Chief architect"
 },
 "ARCH-03": {
  "st": "architecture",
  "w": [
   4,
   12
  ],
  "s": [
   [
    1,
    "Define the dataflow for each workload class based on data reuse and movement - weight-stationary, output-stationary, or hybrid.",
    1.5
   ],
   [
    2,
    "Size on-die SRAM based on workload data reuse",
    2
   ],
   [
    3,
    "Define SRAM banking, ports, and bandwidth",
    1.5,
    1
   ],
   [
    4,
    "Define HBM channels and address interleaving",
    1.5
   ],
   [
    5,
    "Define cache and scratchpad usage",
    1,
    1
   ],
   [
    6,
    "Define prefetch and data-movement requirements",
    1,
    1
   ],
   [
    7,
    "Validate the memory hierarchy using the ARCH-01 performance model",
    2
   ],
   [
    8,
    "Finalize the memory hierarchy and handoff requirements",
    1
   ]
  ],
  "o": [
   "Dataflow definition by workload class",
   "SRAM capacity requirements with workload-based justification",
   "SRAM organization and bandwidth requirements",
   "HBM channel configuration and interleaving scheme",
   "Cache and scratchpad policy",
   "Prefetch and data-movement engine requirements",
   "Memory hierarchy performance and bottleneck analysis",
   "Memory hierarchy section of ARCH-D1 and memory requirements for downstream teams"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "ARCH-D1",
    "produces"
   ],
   [
    "ARCH-D3",
    "feeds"
   ],
   [
    "ARCH-D2",
    "feeds"
   ]
  ],
  "ro": "Memory systems architect"
 },
 "ARCH-04": {
  "st": "architecture",
  "w": [
   3,
   9
  ],
  "s": [
   [
    1,
    "Consolidate interface requirements from DEF-05",
    0.5
   ],
   [
    2,
    "Review protocol version maturity and expected finalization timing",
    1
   ],
   [
    3,
    "Select host interfaces — PCIe generation and CXL profile",
    1.5
   ],
   [
    4,
    "Select HBM generation and define controller requirements",
    1,
    1
   ],
   [
    5,
    "Select the die-to-die interface for chiplet architectures (if the chipset option is survived.)",
    1,
    1
   ],
   [
    6,
    "Define compliance and interoperability requirements",
    1,
    1
   ],
   [
    7,
    "Define controller and PHY requirements for IP selection and sourcing",
    1
   ],
   [
    8,
    "Finalize and review the interface definition",
    2
   ]
  ],
  "o": [
   "Interface requirements for selection",
   "Protocol maturity and timing assessment",
   "Host interface selection and protocol versions",
   "HBM selection and controller requirements",
   "Die-to-die interface selection and requirements",
   "Compliance and interoperability requirements",
   "Controller and PHY requirements",
   "ARCH-D4 Interface and Protocol Definition Document"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "ARCH-D4",
    "produces"
   ],
   [
    "ARCH-D1",
    "feeds"
   ],
   [
    "ARCH-D6",
    "feeds"
   ]
  ],
  "ro": "Interface architect"
 },
 "ARCH-05": {
  "st": "architecture",
  "w": [
   7,
   14
  ],
  "s": [
   [
    1,
    "Define power domains based on the system partitioning",
    1.5
   ],
   [
    2,
    "Define voltage rails and regulator architecture",
    1
   ],
   [
    3,
    "Define DVFS operating points and control policy",
    1.5,
    1
   ],
   [
    4,
    "Define clock domains and clock-domain crossings",
    1.5
   ],
   [
    5,
    "Define reset architecture and sequencing",
    1,
    1
   ],
   [
    6,
    "Define power management controller requirements",
    1,
    1
   ],
   [
    7,
    "Create and validate the initial UPF intent",
    2
   ],
   [
    8,
    "Review the architecture with physical design and verification",
    1
   ]
  ],
  "o": [
   "Power domain definitions and boundary map",
   "Voltage rail and regulator architecture",
   "DVFS operating points and control policy",
   "Clock domain architecture and CDC requirements",
   "Reset architecture and sequencing requirements",
   "Power management controller requirements",
   "Initial UPF intent validated in target tools",
   "Approved power, clock, and reset architecture"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "ARCH-D5",
    "produces"
   ],
   [
    "ARCH-D1",
    "feeds"
   ],
   [
    "ARCH-D3",
    "feeds"
   ]
  ],
  "ro": "Power architect"
 },
 "ARCH-06": {
  "st": "architecture",
  "w": [
   12,
   16
  ],
  "s": [
   [
    1,
    "Reconcile DEF-03 PPA targets with the finalized ARCH-02 block list",
    0.75
   ],
   [
    2,
    "Allocate die area to each block using the floorplan intent",
    1
   ],
   [
    3,
    "Allocate power by block and power domain",
    1
   ],
   [
    4,
    "Define frequency and timing budgets by block and clock domain",
    0.75,
    1
   ],
   [
    5,
    "Reserve margin for implementation growth and ECOs",
    0.5,
    1
   ],
   [
    6,
    "Assign owners and obtain budget acceptance",
    0.75
   ],
   [
    7,
    "Publish the PPA budgets and change-control rules",
    0.5
   ]
  ],
  "o": [
   "Reconciliation note against the DEF-03 targets",
   "Per-block area allocation",
   "Per-block and per-domain power allocation",
   "Per-block area, power and timing budget",
   "Margin reservation record",
   "Owner acceptance sheet per block",
   "Change-control rule for budget movement"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "ARCH-D3",
    "produces"
   ],
   [
    "ARCH-D1",
    "feeds"
   ],
   [
    "ARCH-D7",
    "gates"
   ]
  ],
  "ro": "PPA lead"
 },
 "ARCH-07": {
  "st": "architecture",
  "w": [
   6,
   12
  ],
  "s": [
   [
    1,
    "Define and document threat model and asset inventory",
    1
   ],
   [
    2,
    "Define secure boot chain and immutable ROM",
    1.5
   ],
   [
    3,
    "Select root of trust and key storage",
    1,
    1
   ],
   [
    4,
    "Define fuse map, chip identity and lifecycle state",
    1
   ],
   [
    5,
    "Debug and test access lockdown policy, with DFT",
    1,
    1
   ],
   [
    6,
    "Define and document cryptographic accelerator requirement",
    0.75,
    1
   ],
   [
    7,
    "Review and approve the security architecture",
    2.5
   ]
  ],
  "o": [
   "Threat model and asset inventory",
   "Secure boot chain specification",
   "Root of trust and key storage architecture",
   "Fuse map and lifecycle state definition",
   "Debug lockdown policy",
   "Cryptographic accelerator requirement",
   "Security architecture note and review record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "ARCH-D1",
    "produces"
   ],
   [
    "ARCH-D5",
    "feeds"
   ]
  ],
  "ro": "Security architect"
 },
 "ARCH-08": {
  "st": "architecture",
  "w": [
   10,
   15
  ],
  "s": [
   [
    1,
    "Place block intent from the partitioning and the hierarchy",
    1
   ],
   [
    2,
    "Place iO ring and PHY plan",
    1
   ],
   [
    3,
    "Define bump field — pitch, count, power-to-signal ratio",
    1.5
   ],
   [
    4,
    "Allocate signal bump per interface",
    0.75,
    1
   ],
   [
    5,
    "Define and document power delivery bump budget against the power envelope",
    1,
    1
   ],
   [
    6,
    "Define package feasibility check with package design",
    0.75,
    1
   ],
   [
    7,
    "Define and document block diagram and bump budget publication",
    1.5
   ]
  ],
  "o": [
   "Chip-level block diagram with placement intent",
   "IO ring and PHY placement plan",
   "Bump field definition and map",
   "Signal and power bump allocation",
   "Power delivery bump budget",
   "Package feasibility assessment result",
   "Published block diagram and bump budget"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "ARCH-D6",
    "produces"
   ],
   [
    "ARCH-D1",
    "feeds"
   ],
   [
    "ARCH-D3",
    "feeds"
   ]
  ],
  "ro": "Physical architect"
 },
 "ARCH-09": {
  "st": "architecture",
  "w": [
   9,
   18
  ],
  "s": [
   [
    1,
    "Define structure and section ownership assignment",
    0.5
   ],
   [
    2,
    "Define and document section authoring across the architecture team",
    3.5
   ],
   [
    3,
    "Define and document consistency pass — every number traced to its source activity",
    1.5,
    1
   ],
   [
    4,
    "Define and document open-issue register and disposition",
    1,
    1
   ],
   [
    5,
    "Review internal technical , two rounds",
    2
   ],
   [
    6,
    "Review downstream readiness with RTL, DV, DFT and physical design",
    1.5
   ],
   [
    7,
    "Define and document freeze package assembly",
    1,
    1
   ],
   [
    8,
    "Define and document architecture Freeze gate",
    1.5
   ]
  ],
  "o": [
   "Specification structure with section owners",
   "Architecture specification",
   "Consistency and traceability record",
   "Open-issue register with disposition per item",
   "Internal technical review findings, two rounds",
   "Downstream readiness review findings",
   "Architecture Freeze package and decision record",
   "Architecture Freeze gate decision"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "ARCH-D1",
    "produces"
   ],
   [
    "ARCH-D7",
    "produces"
   ],
   [
    "ARCH-D2",
    "feeds"
   ]
  ],
  "ro": "Chief architect"
 },
 "ARCH-10": {
  "st": "architecture",
  "w": [
   12,
   18
  ],
  "s": [
   [
    1,
    "Define block template and review cadence",
    0.5
   ],
   [
    2,
    "Define and document block owner assignment and kickoff",
    0.5
   ],
   [
    3,
    "Define pipeline and datapath per block",
    2
   ],
   [
    4,
    "Define block interface and protocol against the NoC",
    1.5,
    1
   ],
   [
    5,
    "Define and document control, configuration and register map, first pass",
    1.5,
    1
   ],
   [
    6,
    "Verify hook and observability requirement, with DV",
    1,
    1
   ],
   [
    7,
    "Review microarchitecture , first round",
    1.5
   ],
   [
    8,
    "Implement handoff to RTL",
    1.5
   ]
  ],
  "o": [
   "Microarchitecture specification per block",
   "Block owner assignment and kickoff record",
   "Per-block pipeline and datapath definition",
   "Block interface and protocol definitions",
   "Register map first pass, per block",
   "Verification hook and observability requirements",
   "First-round microarchitecture review findings",
   "RTL implementation handoff package"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "ARCH-D1",
    "feeds"
   ],
   [
    "ARCH-D3",
    "feeds"
   ],
   [
    "ARCH-D7",
    "gates"
   ]
  ],
  "ro": "Block architects"
 },
 "TECH-01": {
  "st": "technology",
  "w": [
   0,
   5
  ],
  "s": [
   [
    1,
    "Define evaluation criteria from product, PPA, cost, and schedule requirements",
    0.75
   ],
   [
    2,
    "Build the initial list of candidate foundries and process nodes",
    0.5
   ],
   [
    3,
    "Screen candidates for basic technical and schedule feasibility",
    1.5
   ],
   [
    4,
    "Compare PPA, maturity, cost, capacity, and ecosystem readiness",
    0.5,
    1
   ],
   [
    5,
    "Review key risks and dependencies for each shortlisted option",
    0.75,
    1
   ],
   [
    6,
    "Select the preferred foundry and process node",
    1
   ],
   [
    7,
    "Review and approve the technology selection",
    1.25
   ]
  ],
  "o": [
   "Foundry and node evaluation criteria",
   "Candidate foundry and node list",
   "Qualified candidate shortlist",
   "Comparable foundry and node assessment",
   "Risk and dependency assessment by option",
   "Technology selection and decision rationale",
   "Approved foundry and process node selection"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "TECH-D1",
    "produces"
   ],
   [
    "TECH-D6",
    "feeds"
   ]
  ],
  "ro": "Technology strategist"
 },
 "TECH-02": {
  "st": "technology",
  "w": [
   4,
   9
  ],
  "s": [
   [
    1,
    "Review available process options and device flavors",
    1
   ],
   [
    2,
    "Map product PPA and architecture needs to available options",
    1
   ],
   [
    3,
    "Evaluate performance, leakage, density, and cost tradeoffs",
    0.75,
    1
   ],
   [
    4,
    "Assess optional features such as backside PDN, RF, or HV where applicable",
    0.5,
    1
   ],
   [
    5,
    "Confirm library, IP, rule, and EDA support for the preferred configuration",
    1
   ],
   [
    6,
    "Select the process configuration for the program",
    0.5,
    1
   ]
  ],
  "o": [
   "Process option and device-flavor inventory",
   "Requirement-to-process-option mapping",
   "Process option tradeoff assessment",
   "Optional-feature feasibility and impact",
   "Design-enablement readiness by option",
   "Selected process option and flavor set"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TECH-D2",
    "produces"
   ],
   [
    "TECH-D3",
    "feeds"
   ],
   [
    "TECH-D1",
    "feeds"
   ]
  ],
  "ro": "Technology strategist"
 },
 "TECH-03": {
  "st": "technology",
  "w": [
   3,
   10
  ],
  "s": [
   [
    1,
    "Define representative blocks and benchmark conditions",
    0.75
   ],
   [
    2,
    "Collect process, library, and interconnect characterization inputs",
    1.5
   ],
   [
    3,
    "Estimate or implement baseline PPA for each candidate configuration",
    1.5
   ],
   [
    4,
    "Compare density, frequency, leakage, and power against product targets",
    1.25,
    1
   ],
   [
    5,
    "Run DTCO studies on the largest PPA gaps",
    1.25,
    1
   ],
   [
    6,
    "Evaluate sensitivity to key design and process assumptions",
    1,
    1
   ],
   [
    7,
    "Summarize expected PPA capability and remaining risks",
    1.5
   ]
  ],
  "o": [
   "Benchmark scope and common assumptions",
   "Qualified benchmark inputs",
   "Baseline PPA results by configuration",
   "PPA gap assessment",
   "DTCO improvement opportunities",
   "PPA sensitivity assessment",
   "Process PPA and DTCO assessment"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "TECH-D1",
    "feeds"
   ],
   [
    "TECH-D6",
    "feeds"
   ],
   [
    "TECH-D2",
    "feeds"
   ]
  ],
  "ro": "DTCO lead"
 },
 "TECH-04": {
  "st": "technology",
  "w": [
   5,
   11
  ],
  "s": [
   [
    1,
    "Define the pricing scope and required quotation items",
    0.5
   ],
   [
    2,
    "Collect wafer, mask, NRE, MPW, and volume pricing",
    2
   ],
   [
    3,
    "Normalize quotations to common volume and schedule assumptions",
    1.5,
    1
   ],
   [
    4,
    "Identify one-time and recurring cost drivers",
    0.5,
    1
   ],
   [
    5,
    "Review commercial assumptions and sensitivity with product finance",
    0.5,
    1
   ],
   [
    6,
    "Release cost inputs to the product cost model",
    2.5
   ]
  ],
  "o": [
   "Foundry pricing request scope",
   "Foundry cost inputs",
   "Comparable cost basis",
   "Cost-driver breakdown",
   "Validated cost assumptions",
   "Approved wafer, mask, and NRE cost sheet"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TECH-D3",
    "produces"
   ],
   [
    "TECH-D1",
    "feeds"
   ]
  ],
  "ro": "Procurement lead"
 },
 "TECH-05": {
  "st": "technology",
  "w": [
   8,
   13
  ],
  "s": [
   [
    1,
    "Translate the program schedule into required tapeout and wafer-start windows",
    0.5
   ],
   [
    2,
    "Review foundry slot availability and capacity outlook",
    1.5
   ],
   [
    3,
    "Identify conflicts between program demand and available capacity",
    1
   ],
   [
    4,
    "Evaluate priority, hot-lot, or alternate scheduling options where needed",
    1,
    1
   ],
   [
    5,
    "Secure the required tapeout slot and capacity commitment",
    0.75,
    1
   ],
   [
    6,
    "Integrate confirmed foundry dates into the program schedule",
    2
   ]
  ],
  "o": [
   "Required foundry schedule",
   "Foundry availability assessment",
   "Capacity and schedule gap list",
   "Schedule mitigation options",
   "Foundry commitment record",
   "Updated program schedule and dependencies"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TECH-D5",
    "produces"
   ],
   [
    "TECH-D3",
    "informs"
   ]
  ],
  "ro": "Foundry relationship manager"
 },
 "TECH-06": {
  "st": "technology",
  "w": [
   2,
   10
  ],
  "s": [
   [
    1,
    "Identify required legal and commercial agreements",
    1
   ],
   [
    2,
    "Execute the NDA required for technical data exchange",
    1
   ],
   [
    3,
    "Review foundry design-agreement terms and design-data rights",
    1.5,
    1
   ],
   [
    4,
    "Align IP licensing and third-party usage terms",
    2.5
   ],
   [
    5,
    "Resolve commercial and legal exceptions",
    1.5,
    1
   ],
   [
    6,
    "Execute the required foundry agreements",
    1,
    1
   ]
  ],
  "o": [
   "Agreement and access checklist",
   "Executed NDA",
   "Design agreement issues and required changes",
   "IP licensing framework",
   "Closed legal and commercial issue list",
   "Executed design agreement and legal package"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TECH-D4",
    "produces"
   ],
   [
    "TECH-D5",
    "feeds"
   ]
  ],
  "ro": "Legal counsel"
 },
 "TECH-07": {
  "st": "technology",
  "w": [
   1,
   5
  ],
  "s": [
   [
    1,
    "Map program milestones to foundry roadmap milestones",
    1
   ],
   [
    2,
    "Review process maturity, model readiness, and risk-production timing",
    1
   ],
   [
    3,
    "Assess yield-learning and manufacturing-readiness risk",
    1,
    1
   ],
   [
    4,
    "Identify schedule dependencies on future foundry releases",
    0.75,
    1
   ],
   [
    5,
    "Define mitigation for readiness gaps",
    2
   ],
   [
    6,
    "Align the program schedule with confirmed foundry milestones",
    0
   ]
  ],
  "o": [
   "Program-to-foundry milestone map",
   "Technology maturity assessment",
   "Production-readiness risk assessment",
   "Foundry-dependent schedule items",
   "Technology-readiness mitigation plan",
   "Updated roadmap and schedule alignment"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TECH-D6",
    "produces"
   ],
   [
    "TECH-D1",
    "feeds"
   ]
  ],
  "ro": "Technology strategist"
 },
 "TECH-08": {
  "st": "technology",
  "w": [
   9,
   13
  ],
  "s": [
   [
    1,
    "Define the business and supply reasons for a second source or migration path",
    1
   ],
   [
    2,
    "Identify technically credible alternative nodes or foundries",
    1.25
   ],
   [
    3,
    "Compare IP, library, design-rule, and architecture compatibility",
    0.75,
    1
   ],
   [
    4,
    "Estimate redesign, validation, qualification, cost, and schedule impact",
    0.75,
    1
   ],
   [
    5,
    "Evaluate whether the contingency provides sufficient business value",
    1.75
   ],
   [
    6,
    "Define the selected contingency strategy and trigger conditions",
    0
   ]
  ],
  "o": [
   "Second-source and migration objectives",
   "Alternative technology options",
   "Portability gap assessment",
   "Migration impact estimate",
   "Second-source feasibility assessment",
   "Second-source and migration strategy"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TECH-D1",
    "feeds"
   ],
   [
    "TECH-D6",
    "feeds"
   ]
  ],
  "ro": "Technology strategist"
 },
 "TECH-09": {
  "st": "technology",
  "w": [
   9,
   14
  ],
  "s": [
   [
    1,
    "Define backend manufacturing and package capability requirements",
    0.75
   ],
   [
    2,
    "Identify candidate OSAT and backend suppliers",
    1.5
   ],
   [
    3,
    "Assess assembly, substrate, interposer, and test capability",
    1,
    1
   ],
   [
    4,
    "Review capacity, lead times, and supply-chain constraints",
    1,
    1
   ],
   [
    5,
    "Identify capability and schedule gaps",
    0.75,
    1
   ],
   [
    6,
    "Align supplier assumptions with package and program schedules",
    1.5
   ],
   [
    7,
    "Define follow-up actions and supplier engagement plan",
    1.25
   ]
  ],
  "o": [
   "OSAT and backend requirements",
   "Candidate supplier list",
   "Supplier capability assessment",
   "Backend capacity and lead-time assessment",
   "OSAT and supply-chain gap list",
   "Backend schedule and dependency alignment",
   "OSAT and backend action plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "TECH-D5",
    "feeds"
   ],
   [
    "TECH-D3",
    "informs"
   ],
   [
    "TECH-D1",
    "feeds"
   ]
  ],
  "ro": "Backend supply chain lead"
 },
 "PDK-01": {
  "st": "pdk",
  "w": [
   0,
   34
  ],
  "s": [
   [
    1,
    "Build the PDK release roadmap for the program",
    1
   ],
   [
    2,
    "Track changes in design rules, models, extraction, and signoff content",
    4
   ],
   [
    3,
    "Assess the impact of each major PDK update on active design work",
    3,
    1
   ],
   [
    4,
    "Identify gaps that block library, IP, implementation, or signoff work",
    5
   ],
   [
    5,
    "Align PDK adoption points with program milestones",
    6,
    1
   ],
   [
    6,
    "Review readiness and open issues with the foundry and design teams",
    4
   ],
   [
    7,
    "Maintain version history and release decisions through tapeout",
    3,
    1
   ]
  ],
  "o": [
   "PDK release timeline and maturity map",
   "PDK delta summary by release",
   "Design and schedule impact assessment",
   "PDK blocking-gap list",
   "PDK adoption plan by milestone",
   "PDK readiness status and action list",
   "Controlled PDK version history"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "PDK-D1",
    "produces"
   ],
   [
    "PDK-D2",
    "feeds"
   ],
   [
    "PDK-D8",
    "gates"
   ]
  ],
  "ro": "PDK owner"
 },
 "PDK-02": {
  "st": "pdk",
  "w": [
   1,
   7
  ],
  "s": [
   [
    1,
    "Review the design rule manual and foundry guidance",
    1
   ],
   [
    2,
    "Identify restricted, recommended, and high-risk rules",
    1.5
   ],
   [
    3,
    "Assess product impact for routing, density, macros, and reliability",
    1.5
   ],
   [
    4,
    "Define required design practices and exceptions",
    1,
    1
   ],
   [
    5,
    "Review critical rules with physical design, IP, and foundry teams",
    1,
    1
   ]
  ],
  "o": [
   "Design rule review baseline",
   "Rule classification",
   "Product-specific rule impact",
   "Rule disposition and design guidance",
   "Approved rule disposition"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "PDK-D1",
    "feeds"
   ],
   [
    "PDK-D5",
    "feeds"
   ]
  ],
  "ro": "CAD methodology lead"
 },
 "PDK-03": {
  "st": "pdk",
  "w": [
   4,
   12
  ],
  "s": [
   [
    1,
    "Inventory available standard cell libraries and variants",
    1
   ],
   [
    2,
    "Compare track height, Vt, density, timing, and leakage tradeoffs",
    1.5
   ],
   [
    3,
    "Check support for multi-bit, isolation, level-shifter, retention, and power cells",
    1.5,
    1
   ],
   [
    4,
    "Verify required .lib, LEF, GDS, and related views",
    2
   ],
   [
    5,
    "Run representative implementation checks where needed",
    1.5,
    1
   ],
   [
    6,
    "Select and release the qualified library set",
    2,
    1
   ]
  ],
  "o": [
   "Library option inventory",
   "Library PPA comparison",
   "Low-power and specialty-cell readiness",
   "Library view completeness",
   "Library qualification results",
   "Qualified standard cell library list"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PDK-D2",
    "produces"
   ],
   [
    "PDK-D1",
    "feeds"
   ],
   [
    "PDK-D6",
    "feeds"
   ]
  ],
  "ro": "Library lead"
 },
 "PDK-04": {
  "st": "pdk",
  "w": [
   6,
   15
  ],
  "s": [
   [
    1,
    "Collect memory requirements from architecture and block planning",
    0.5
   ],
   [
    2,
    "Inventory available memory compilers and supported configurations",
    1
   ],
   [
    3,
    "Map required depth, width, ports, voltage, and aspect ratio to compiler options",
    1.5
   ],
   [
    4,
    "Generate representative memory instances and views",
    2.5
   ],
   [
    5,
    "Review PPA, physical constraints, and operating limits",
    1.5,
    1
   ],
   [
    6,
    "Identify unsupported instances and escalation needs",
    1.5,
    1
   ],
   [
    7,
    "Release the planned memory instance set to downstream teams",
    3.5
   ]
  ],
  "o": [
   "Memory instance requirement set",
   "Memory compiler capability matrix",
   "Requirement-to-compiler mapping",
   "Representative compiled memory set",
   "Memory compiler feasibility assessment",
   "Compiler gap list",
   "Memory compiler and instance plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "PDK-D2",
    "produces"
   ],
   [
    "PDK-D3",
    "feeds"
   ],
   [
    "PDK-D1",
    "feeds"
   ]
  ],
  "ro": "Memory library engineer"
 },
 "PDK-05": {
  "st": "pdk",
  "w": [
   14,
   20
  ],
  "s": [
   [
    1,
    "Select representative and critical compiled memory instances",
    0.5
   ],
   [
    2,
    "Collect timing, power, leakage, area, and Vmin data",
    1.5
   ],
   [
    3,
    "Compare each instance against block-level budgets",
    1.5
   ],
   [
    4,
    "Evaluate sensitivity to size, aspect ratio, Vt, and operating conditions",
    1,
    1
   ],
   [
    5,
    "Identify instances that cannot meet the required budget",
    1,
    1
   ],
   [
    6,
    "Review results with architecture, PDK, and AMS teams",
    2.5
   ]
  ],
  "o": [
   "Memory characterization scope",
   "Memory PPA data set",
   "Memory PPA gap analysis",
   "Memory configuration sensitivity",
   "Custom-memory candidate list",
   "Memory PPA disposition"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PDK-D3",
    "produces"
   ],
   [
    "PDK-D2",
    "feeds"
   ]
  ],
  "ro": "Memory characterization engineer"
 },
 "PDK-06": {
  "st": "pdk",
  "w": [
   19,
   23
  ],
  "s": [
   [
    1,
    "Review memory gaps that cannot be closed with standard compiler options",
    0.5
   ],
   [
    2,
    "Estimate achievable PPA benefit from custom or pushed-rule development",
    1
   ],
   [
    3,
    "Assess design, verification, foundry, and schedule effort",
    1
   ],
   [
    4,
    "Confirm pushed-rule feasibility and approval path with the foundry",
    0.75,
    1
   ],
   [
    5,
    "Select standard, custom, or pushed-rule disposition for each instance",
    0.75,
    1
   ],
   [
    6,
    "Integrate approved custom-memory work into AMS and program schedules",
    1.5
   ]
  ],
  "o": [
   "Custom-memory candidate list",
   "Expected custom-memory benefit",
   "Custom-memory development impact",
   "Foundry feasibility and approval plan",
   "Memory implementation decision",
   "Custom-memory scope and schedule"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PDK-D3",
    "produces"
   ],
   [
    "PDK-D1",
    "gates"
   ]
  ],
  "ro": "PDK owner"
 },
 "PDK-07": {
  "st": "pdk",
  "w": [
   8,
   14
  ],
  "s": [
   [
    1,
    "Map interface and voltage requirements to available I/O cells",
    0.5
   ],
   [
    2,
    "Review ESD and latch-up protection options and limits",
    1.5
   ],
   [
    3,
    "Check package, bump, placement, and power-domain compatibility",
    1.5
   ],
   [
    4,
    "Verify required logical, timing, LEF, GDS, CDL, and reliability views",
    1,
    1
   ],
   [
    5,
    "Resolve unsupported interfaces or protection gaps",
    1,
    1
   ],
   [
    6,
    "Release the qualified I/O, ESD, and latch-up library set",
    2.5
   ]
  ],
  "o": [
   "I/O requirement-to-library mapping",
   "Protection-cell capability assessment",
   "I/O physical integration assessment",
   "I/O library view completeness",
   "I/O and protection gap disposition",
   "Qualified I/O and protection library list"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PDK-D2",
    "produces"
   ],
   [
    "PDK-D6",
    "feeds"
   ]
  ],
  "ro": "IO library engineer"
 },
 "PDK-08": {
  "st": "pdk",
  "w": [
   10,
   20
  ],
  "s": [
   [
    1,
    "Define the required EDA tool chain and use cases",
    1
   ],
   [
    2,
    "Review foundry-supported versions and required patches",
    1
   ],
   [
    3,
    "Install and configure candidate tool versions with the target PDK",
    2.5
   ],
   [
    4,
    "Run representative synthesis, P&R, STA, PV, extraction, and EM/IR tests",
    2,
    1
   ],
   [
    5,
    "Resolve compatibility, runtime, and result-correlation issues",
    2,
    1
   ],
   [
    6,
    "Freeze and release the approved tool-version matrix",
    1.5,
    1
   ]
  ],
  "o": [
   "EDA qualification scope",
   "Candidate tool-version matrix",
   "Qualified test environment",
   "Cross-flow qualification results",
   "Tool issue and patch disposition",
   "Qualified EDA tool and version baseline"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PDK-D4",
    "produces"
   ],
   [
    "PDK-D5",
    "feeds"
   ],
   [
    "PDK-D7",
    "feeds"
   ]
  ],
  "ro": "CAD tools lead"
 },
 "PDK-09": {
  "st": "pdk",
  "w": [
   12,
   22
  ],
  "s": [
   [
    1,
    "Bring up the foundry reference flow in the internal environment",
    1
   ],
   [
    2,
    "Validate major tool stages, inputs, outputs, and handoffs",
    1.5
   ],
   [
    3,
    "Adapt scripts and settings to program-specific methodology",
    2.5
   ],
   [
    4,
    "Add checks, automation, reporting, and reproducibility requirements",
    2,
    1
   ],
   [
    5,
    "Run end-to-end regression on a representative design",
    1.5,
    1
   ],
   [
    6,
    "Document methodology, known limitations, and usage guidance",
    2,
    1
   ],
   [
    7,
    "Release the internal reference flow to design teams",
    2
   ]
  ],
  "o": [
   "Working foundry reference flow",
   "Reference-flow validation results",
   "Program-specific flow configuration",
   "Internal flow enhancements",
   "Reference-flow regression results",
   "Internal methodology guide",
   "Released reference-flow baseline"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "PDK-D5",
    "produces"
   ],
   [
    "PDK-D8",
    "feeds"
   ],
   [
    "PDK-D1",
    "feeds"
   ]
  ],
  "ro": "Methodology lead"
 },
 "PDK-10": {
  "st": "pdk",
  "w": [
   6,
   12
  ],
  "s": [
   [
    1,
    "Inventory required signoff decks and technology files",
    1
   ],
   [
    2,
    "Map each deck to its PDK and tool compatibility requirements",
    1
   ],
   [
    3,
    "Baseline the approved DRC, LVS, extraction, and QRC versions",
    1.5,
    1
   ],
   [
    4,
    "Regression-test major deck updates on representative designs",
    1.5
   ],
   [
    5,
    "Assess the impact of rule or extraction changes on active designs",
    1,
    1
   ],
   [
    6,
    "Release approved updates with version history and usage notes",
    2.5
   ]
  ],
  "o": [
   "Signoff-deck inventory",
   "Deck compatibility matrix",
   "Controlled signoff-deck baseline",
   "Deck-update regression results",
   "Deck delta impact assessment",
   "Signoff-deck release history"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PDK-D5",
    "feeds"
   ],
   [
    "PDK-D8",
    "feeds"
   ],
   [
    "PDK-D1",
    "feeds"
   ]
  ],
  "ro": "CAD methodology engineer"
 },
 "PDK-11": {
  "st": "pdk",
  "w": [
   20,
   26
  ],
  "s": [
   [
    1,
    "Collect product operating conditions and foundry signoff guidance",
    1
   ],
   [
    2,
    "Define candidate PVT and RC corner combinations",
    1.5
   ],
   [
    3,
    "Select OCV, AOCV, or POCV methodology and required derates",
    1.5,
    1
   ],
   [
    4,
    "Evaluate coverage, pessimism, and runtime tradeoffs",
    2
   ],
   [
    5,
    "Align the signoff methodology with the foundry and STA teams",
    1.5
   ],
   [
    6,
    "Release the approved corner and derate definition",
    1,
    1
   ]
  ],
  "o": [
   "Signoff condition requirements",
   "Candidate corner set",
   "Variation and derate strategy",
   "Corner-set tradeoff assessment",
   "Foundry-aligned signoff assumptions",
   "Signoff corner and derate baseline"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PDK-D6",
    "produces"
   ],
   [
    "PDK-D7",
    "feeds"
   ]
  ],
  "ro": "Signoff methodology lead"
 },
 "PDK-12": {
  "st": "pdk",
  "w": [
   16,
   22
  ],
  "s": [
   [
    1,
    "Estimate compute demand by tool, stage, and program phase",
    1.5
   ],
   [
    2,
    "Estimate EDA license demand during peak concurrent usage",
    1.5
   ],
   [
    3,
    "Estimate working, checkpoint, regression, and archive storage needs",
    0.75,
    1
   ],
   [
    4,
    "Compare demand against available infrastructure",
    1.5
   ],
   [
    5,
    "Define procurement, reservation, or scheduling actions for gaps",
    1,
    1
   ],
   [
    6,
    "Align infrastructure readiness with the program schedule",
    1.5
   ]
  ],
  "o": [
   "Compute demand forecast",
   "License demand forecast",
   "Storage demand forecast",
   "Infrastructure capacity gap analysis",
   "Capacity mitigation plan",
   "Compute, license, and storage capacity plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PDK-D7",
    "produces"
   ],
   [
    "PDK-D4",
    "feeds"
   ]
  ],
  "ro": "CAD infrastructure lead"
 },
 "PDK-13": {
  "st": "pdk",
  "w": [
   24,
   32
  ],
  "s": [
   [
    1,
    "Assemble the approved PDK, libraries, tools, decks, and flow configuration",
    1
   ],
   [
    2,
    "Define release manifests, paths, environment variables, and access controls",
    2
   ],
   [
    3,
    "Run end-to-end regression on representative designs",
    1.5,
    1
   ],
   [
    4,
    "Resolve version, compatibility, and reproducibility issues",
    2
   ],
   [
    5,
    "Document release notes, known limitations, and change history",
    1.5,
    1
   ],
   [
    6,
    "Release the qualified environment to program teams",
    1.5,
    1
   ],
   [
    7,
    "Maintain regression and controlled updates through tapeout",
    3
   ]
  ],
  "o": [
   "Golden environment candidate",
   "Environment configuration baseline",
   "Golden environment regression results",
   "Environment issue disposition",
   "Golden environment release notes",
   "Golden design environment release",
   "Golden environment change-control history"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "PDK-D8",
    "produces"
   ],
   [
    "PDK-D1",
    "gates"
   ],
   [
    "PDK-D5",
    "feeds"
   ]
  ],
  "ro": "Methodology lead"
 },
 "IPR-01": {
  "st": "ipReadiness",
  "w": [
   0,
   5
  ],
  "s": [
   [
    1,
    "Identify all IP blocks required by the architecture",
    1
   ],
   [
    2,
    "Define functional and performance requirements for each IP",
    1.5
   ],
   [
    3,
    "Define interface, clock, reset, power, and configuration requirements",
    0.75,
    1
   ],
   [
    4,
    "Define process-node, PVT, reliability, and qualification requirements",
    0.75,
    1
   ],
   [
    5,
    "Define required views, models, documentation, and delivery dates",
    1.5
   ],
   [
    6,
    "Review and baseline the IP requirement set",
    1
   ]
  ],
  "o": [
   "Complete IP block inventory",
   "Functional and performance requirement set",
   "IP integration requirements",
   "Technology and qualification requirements",
   "IP deliverable and schedule requirements",
   "Approved IP requirement baseline"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "IPR-D1",
    "produces"
   ],
   [
    "IPR-D3",
    "feeds"
   ]
  ],
  "ro": "IP strategist"
 },
 "IPR-02": {
  "st": "ipReadiness",
  "w": [
   1,
   5
  ],
  "s": [
   [
    1,
    "Search the internal inventory against the required IP list",
    0.75
   ],
   [
    2,
    "Confirm functional and interface fit for each candidate",
    1.25
   ],
   [
    3,
    "Check node, process-option, library, and tool compatibility",
    1,
    1
   ],
   [
    4,
    "Review available views, documentation, silicon history, and known issues",
    0.75,
    1
   ],
   [
    5,
    "Classify each candidate as reusable, reusable with work, or not reusable",
    2
   ]
  ],
  "o": [
   "Internal reuse candidate list",
   "Functional reuse assessment",
   "Technology compatibility assessment",
   "IP maturity and deliverable assessment",
   "Internal IP reuse disposition"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "IPR-D1",
    "feeds"
   ],
   [
    "IPR-D3",
    "feeds"
   ]
  ],
  "ro": "IP strategist"
 },
 "IPR-03": {
  "st": "ipReadiness",
  "w": [
   5,
   10
  ],
  "s": [
   [
    1,
    "Define common make / buy / reuse evaluation criteria",
    0.75
   ],
   [
    2,
    "Assess internal reuse options and required modification effort",
    1
   ],
   [
    3,
    "Estimate in-house development effort, schedule, and risk",
    1,
    1
   ],
   [
    4,
    "Assess external sourcing availability, cost, maturity, and schedule",
    1.5
   ],
   [
    5,
    "Compare options against program priorities and dependencies",
    0.75,
    1
   ],
   [
    6,
    "Select and record the sourcing path for each IP",
    1.75
   ]
  ],
  "o": [
   "IP sourcing decision criteria",
   "Reuse option assessment",
   "Make option assessment",
   "Buy option assessment",
   "IP sourcing tradeoff matrix",
   "Make / buy / reuse decision record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "IPR-D1",
    "produces"
   ],
   [
    "IPR-D7",
    "feeds"
   ]
  ],
  "ro": "IP strategist"
 },
 "IPR-04": {
  "st": "ipReadiness",
  "w": [
   6,
   15
  ],
  "s": [
   [
    1,
    "Prepare the RFI / RFQ package from the approved IP requirements",
    0.75
   ],
   [
    2,
    "Identify qualified candidate vendors",
    2
   ],
   [
    3,
    "Review technical compliance against the requirement set",
    2.5
   ],
   [
    4,
    "Evaluate node readiness, deliverables, support, and delivery schedule",
    1.5,
    1
   ],
   [
    5,
    "Compare commercial terms and total integration impact",
    1,
    1
   ],
   [
    6,
    "Resolve critical gaps through vendor clarification or technical review",
    1.75,
    1
   ],
   [
    7,
    "Select the preferred vendor and record the rationale",
    3.75
   ]
  ],
  "o": [
   "Vendor RFI / RFQ package",
   "Vendor candidate list",
   "Technical compliance matrix",
   "Vendor readiness assessment",
   "Commercial and program-impact comparison",
   "Closed vendor clarification list",
   "Vendor selection recommendation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "IPR-D2",
    "produces"
   ],
   [
    "IPR-D5",
    "feeds"
   ],
   [
    "IPR-D3",
    "feeds"
   ]
  ],
  "ro": "IP strategist"
 },
 "IPR-05": {
  "st": "ipReadiness",
  "w": [
   8,
   15
  ],
  "s": [
   [
    1,
    "Define the evidence required to claim silicon-proven status",
    0.75
   ],
   [
    2,
    "Collect silicon, test-chip, production, and qualification evidence",
    1.5
   ],
   [
    3,
    "Compare proven configuration against the program's node and process options",
    1.5
   ],
   [
    4,
    "Review known silicon issues, errata, and field history",
    1,
    1
   ],
   [
    5,
    "Assess remaining technical and schedule risk",
    1,
    1
   ],
   [
    6,
    "Define validation actions for IP not proven on the exact configuration",
    1.25
   ],
   [
    7,
    "Record the readiness status for each selected IP",
    2
   ]
  ],
  "o": [
   "Silicon-proven acceptance criteria",
   "IP silicon evidence package",
   "Configuration delta assessment",
   "Silicon quality assessment",
   "Node-readiness risk rating",
   "Risk-reduction plan",
   "IP silicon-proven status matrix"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "IPR-D3",
    "produces"
   ],
   [
    "IPR-D7",
    "feeds"
   ],
   [
    "IPR-D6",
    "feeds"
   ]
  ],
  "ro": "IP strategist"
 },
 "IPR-06": {
  "st": "ipReadiness",
  "w": [
   11,
   18
  ],
  "s": [
   [
    1,
    "Define the required deliverables by IP type and integration flow",
    1
   ],
   [
    2,
    "Map each deliverable to its downstream consumer and required date",
    1.5
   ],
   [
    3,
    "Review vendor or internal delivery manifests against the checklist",
    1,
    1
   ],
   [
    4,
    "Validate format, version, and tool compatibility for critical views",
    1,
    1
   ],
   [
    5,
    "Identify missing collateral and required corrective actions",
    1.5
   ],
   [
    6,
    "Agree delivery content and dates with the IP owner or vendor",
    2,
    1
   ],
   [
    7,
    "Track integration readiness through delivery",
    3
   ]
  ],
  "o": [
   "IP deliverable checklist template",
   "Deliverable-to-integration mapping",
   "IP deliverable gap assessment",
   "Deliverable compatibility results",
   "IP deliverable action list",
   "Committed IP deliverable plan",
   "IP integration-readiness status"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "IPR-D4",
    "produces"
   ],
   [
    "IPR-D5",
    "feeds"
   ]
  ],
  "ro": "IP integration lead"
 },
 "IPR-07": {
  "st": "ipReadiness",
  "w": [
   10,
   22
  ],
  "s": [
   [
    1,
    "Define required license scope, usage rights, and support terms",
    1.5
   ],
   [
    2,
    "Review vendor quotation and commercial structure",
    2.5
   ],
   [
    3,
    "Negotiate license, support, liability, and delivery terms",
    2
   ],
   [
    4,
    "Resolve legal, procurement, finance, and security requirements",
    1,
    1
   ],
   [
    5,
    "Confirm final deliverable scope and committed dates",
    1.5,
    1
   ],
   [
    6,
    "Issue the purchase order or equivalent authorization",
    1.5,
    1
   ],
   [
    7,
    "Complete license execution and access setup",
    3.5
   ],
   [
    8,
    "Record commercial obligations and renewal or support milestones",
    2.5
   ]
  ],
  "o": [
   "IP licensing requirement set",
   "Commercial term assessment",
   "Negotiated IP agreement",
   "Closed commercial approval items",
   "Contractual delivery schedule",
   "Executed procurement commitment",
   "Active IP license and access",
   "IP commercial obligation register"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "IPR-D5",
    "produces"
   ],
   [
    "IPR-D6",
    "feeds"
   ],
   [
    "IPR-D4",
    "gates"
   ]
  ],
  "ro": "Procurement lead"
 },
 "IPR-08": {
  "st": "ipReadiness",
  "w": [
   14,
   19
  ],
  "s": [
   [
    1,
    "Identify IP requiring porting, re-characterization, or hardening",
    0.5
   ],
   [
    2,
    "Define technology and implementation deltas from the source IP",
    1.5
   ],
   [
    3,
    "Define design, characterization, verification, and signoff work",
    1,
    1
   ],
   [
    4,
    "Assign ownership and estimate engineering effort",
    1.25
   ],
   [
    5,
    "Build the development and validation schedule",
    0.75,
    1
   ],
   [
    6,
    "Review readiness against the required integration date",
    1.75
   ]
  ],
  "o": [
   "Porting and hardening candidate list",
   "Porting delta assessment",
   "Porting work breakdown",
   "Porting resource plan",
   "Porting and hardening schedule",
   "Approved porting plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "IPR-D3",
    "feeds"
   ],
   [
    "IPR-D6",
    "feeds"
   ]
  ],
  "ro": "IP strategist"
 },
 "IPR-09": {
  "st": "ipReadiness",
  "w": [
   17,
   21
  ],
  "s": [
   [
    1,
    "Collect need-by dates from all downstream integration teams",
    0.75
   ],
   [
    2,
    "Map required IP views and maturity levels to each need-by date",
    1
   ],
   [
    3,
    "Overlay vendor, internal, and porting delivery commitments",
    1.25
   ],
   [
    4,
    "Identify gaps between committed delivery and integration need",
    0.75,
    1
   ],
   [
    5,
    "Define recovery, early-access, or staged-delivery actions",
    1
   ],
   [
    6,
    "Baseline and track the IP schedule against program milestones",
    0.75,
    1
   ]
  ],
  "o": [
   "IP integration need-by schedule",
   "IP view-to-milestone mapping",
   "Integrated IP delivery schedule",
   "IP schedule gap list",
   "IP schedule recovery plan",
   "Controlled IP delivery schedule"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "IPR-D6",
    "produces"
   ],
   [
    "IPR-D7",
    "feeds"
   ]
  ],
  "ro": "Program manager"
 },
 "IPR-10": {
  "st": "ipReadiness",
  "w": [
   18,
   22
  ],
  "s": [
   [
    1,
    "Define common IP maturity and risk-rating criteria",
    1
   ],
   [
    2,
    "Rate each critical IP for technical, maturity, delivery, and supplier risk",
    1
   ],
   [
    3,
    "Identify IP whose failure can affect tapeout or launch",
    0.75,
    1
   ],
   [
    4,
    "Evaluate second-source, internal, or architecture fallback options",
    0.75,
    1
   ],
   [
    5,
    "Define mitigation actions, triggers, owners, and decision dates",
    2
   ]
  ],
  "o": [
   "IP risk-rating framework",
   "IP maturity risk matrix",
   "Critical IP watch list",
   "IP contingency options",
   "IP contingency plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "IPR-D7",
    "produces"
   ],
   [
    "IPR-D3",
    "feeds"
   ]
  ],
  "ro": "IP strategist"
 },
 "AMS-01": {
  "st": "amsIp",
  "w": [
   0,
   6
  ],
  "s": [
   [
    1,
    "Identify all custom analog, mixed-signal, and memory blocks",
    0.5
   ],
   [
    2,
    "Extract functional and electrical requirements for each block",
    1.5
   ],
   [
    3,
    "Allocate power, area, performance, and noise budgets",
    2
   ],
   [
    4,
    "Define interfaces, supplies, clocks, resets, and control requirements",
    1,
    1
   ],
   [
    5,
    "Define PVT, reliability, and verification coverage",
    1,
    1
   ],
   [
    6,
    "Review and baseline the AMS specifications and budgets",
    2
   ]
  ],
  "o": [
   "AMS IP inventory",
   "AMS functional and electrical specifications",
   "AMS PPA and noise budgets",
   "AMS integration requirements",
   "AMS verification requirements",
   "Approved AMS specification and budget baseline"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "AMS-D1",
    "produces"
   ],
   [
    "AMS-D8",
    "feeds"
   ]
  ],
  "ro": "AMS architect"
 },
 "AMS-02": {
  "st": "amsIp",
  "w": [
   4,
   30
  ],
  "s": [
   [
    1,
    "Define the PLL / clock-generator architecture from the frequency plan",
    2
   ],
   [
    2,
    "Select oscillator, divider, phase detector, charge-pump, and loop-filter implementation",
    2
   ],
   [
    3,
    "Design and simulate the core loop at nominal conditions",
    4
   ],
   [
    4,
    "Close frequency range, jitter, phase noise, and lock behavior across PVT",
    4
   ],
   [
    5,
    "Analyze supply noise, reference noise, and spur sensitivity",
    3,
    1
   ],
   [
    6,
    "Run Monte Carlo and mismatch verification",
    3,
    1
   ],
   [
    7,
    "Define calibration, trim, test, and debug features",
    6
   ],
   [
    8,
    "Complete layout-aware and extracted verification",
    5
   ],
   [
    9,
    "Generate behavioral and integration models",
    3,
    1
   ],
   [
    10,
    "Release the closed PLL / clock-generator macro",
    3
   ]
  ],
  "o": [
   "PLL architecture and loop requirements",
   "Circuit architecture definition",
   "Baseline PLL design",
   "PVT performance results",
   "Noise and spur sensitivity assessment",
   "Variation robustness results",
   "PLL calibration and test requirements",
   "Post-layout PLL verification",
   "PLL integration model set",
   "Qualified PLL / clock-generator design"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "r": [
   [
    "AMS-D1",
    "feeds"
   ],
   [
    "AMS-D2",
    "feeds"
   ],
   [
    "AMS-D5",
    "feeds"
   ]
  ],
  "ro": "PLL circuit designer"
 },
 "AMS-03": {
  "st": "amsIp",
  "w": [
   4,
   38
  ],
  "s": [
   [
    1,
    "Define the target channel, data rate, BER, jitter, and compliance requirements",
    2
   ],
   [
    2,
    "Select the PHY architecture or establish the vendor-hardening baseline",
    3
   ],
   [
    3,
    "Develop or adapt TX, RX, clocking, equalization, and calibration circuits",
    4,
    1
   ],
   [
    4,
    "Integrate package and channel models into link analysis",
    7
   ],
   [
    5,
    "Verify eye, jitter, BER, and equalization margin across PVT",
    5,
    1
   ],
   [
    6,
    "Run variation and calibration-range analysis",
    6
   ],
   [
    7,
    "Close power, area, bump, and floorplan constraints",
    8
   ],
   [
    8,
    "Verify test, loopback, training, and debug features",
    6
   ],
   [
    9,
    "Complete extracted or vendor-hardening signoff",
    4,
    1
   ],
   [
    10,
    "Release integration models, views, and constraints",
    2
   ]
  ],
  "o": [
   "PHY electrical requirement baseline",
   "PHY implementation architecture",
   "PHY circuit implementation",
   "End-to-end channel model",
   "PHY performance results",
   "PHY variation robustness assessment",
   "PHY physical integration requirements",
   "PHY test and debug coverage",
   "Qualified PHY implementation",
   "PHY integration package"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "r": [
   [
    "AMS-D2",
    "produces"
   ],
   [
    "AMS-D5",
    "feeds"
   ],
   [
    "AMS-D8",
    "feeds"
   ]
  ],
  "ro": "SerDes and PHY lead"
 },
 "AMS-04": {
  "st": "amsIp",
  "w": [
   6,
   26
  ],
  "s": [
   [
    1,
    "Define rail, load, accuracy, noise, transient, and startup requirements",
    1.5
   ],
   [
    2,
    "Select LDO, reference, monitor, and regulator architectures",
    3.5
   ],
   [
    3,
    "Design the core regulation and reference circuits",
    5
   ],
   [
    4,
    "Verify DC accuracy, PSRR, noise, stability, and transient response",
    3,
    1
   ],
   [
    5,
    "Verify startup, shutdown, sequencing, and fault behavior",
    2.5,
    1
   ],
   [
    6,
    "Run PVT and Monte Carlo verification",
    4
   ],
   [
    7,
    "Define trim, test, monitor, and debug features",
    4
   ],
   [
    8,
    "Release qualified macros and integration views",
    2
   ]
  ],
  "o": [
   "Power-management electrical requirements",
   "Analog power-management architecture",
   "Baseline power-management design",
   "Electrical performance results",
   "Power-state behavior results",
   "Variation robustness results",
   "Power-management test and trim requirements",
   "Analog power-management macro set"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "AMS-D2",
    "feeds"
   ],
   [
    "AMS-D5",
    "feeds"
   ],
   [
    "AMS-D7",
    "feeds"
   ]
  ],
  "ro": "Power management circuit designer"
 },
 "AMS-05": {
  "st": "amsIp",
  "w": [
   2,
   12
  ],
  "s": [
   [
    1,
    "Define capacity, width, ports, bandwidth, Vmin, and PPA targets",
    0.75
   ],
   [
    2,
    "Evaluate available bitcell and pushed-rule options",
    1.75
   ],
   [
    3,
    "Define row, column, banking, and mux organization",
    2
   ],
   [
    4,
    "Define wordline, bitline, precharge, sensing, and write architecture",
    2
   ],
   [
    5,
    "Define replica, tracking, and internal timing strategy",
    1.75,
    1
   ],
   [
    6,
    "Estimate area, delay, power, and margin for candidate organizations",
    1.5,
    1
   ],
   [
    7,
    "Select the preferred custom SRAM architecture",
    3.5
   ],
   [
    8,
    "Hand off architecture constraints to circuit and layout design",
    1.5,
    1
   ]
  ],
  "o": [
   "Custom SRAM requirement baseline",
   "Bitcell option assessment",
   "Array organization",
   "Memory periphery architecture",
   "SRAM timing architecture",
   "SRAM architecture tradeoff results",
   "Custom SRAM architecture decision",
   "Custom SRAM design requirements"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "AMS-D3",
    "produces"
   ],
   [
    "AMS-D1",
    "feeds"
   ]
  ],
  "ro": "Memory circuit architect"
 },
 "AMS-06": {
  "st": "amsIp",
  "w": [
   10,
   20
  ],
  "s": [
   [
    1,
    "Identify the dominant read and write Vmin limitations",
    1
   ],
   [
    2,
    "Evaluate candidate assist techniques for the selected bitcell and array",
    2
   ],
   [
    3,
    "Design wordline, bitline, supply, or timing assist circuits as required",
    2,
    1
   ],
   [
    4,
    "Optimize assist strength and timing across PVT",
    2,
    1
   ],
   [
    5,
    "Run statistical read, write, and hold margin analysis",
    2
   ],
   [
    6,
    "Verify reliability, disturb, and recovery behavior",
    2
   ],
   [
    7,
    "Release the selected assist scheme and control requirements",
    3
   ]
  ],
  "o": [
   "SRAM Vmin limitation analysis",
   "Assist option tradeoff",
   "SRAM assist circuit implementation",
   "Assist operating-range definition",
   "Assist Vmin and yield results",
   "Assist reliability assessment",
   "Qualified SRAM assist design"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "AMS-D3",
    "feeds"
   ],
   [
    "AMS-D2",
    "feeds"
   ]
  ],
  "ro": "Memory circuit designer"
 },
 "AMS-07": {
  "st": "amsIp",
  "w": [
   18,
   34
  ],
  "s": [
   [
    1,
    "Define array floorplan, tiling, power, and pin architecture",
    2
   ],
   [
    2,
    "Implement bitcell tiling and array routing",
    4
   ],
   [
    3,
    "Implement periphery with matching and critical-parasitic constraints",
    3.5
   ],
   [
    4,
    "Integrate assist, replica, and timing circuits",
    2,
    1
   ],
   [
    5,
    "Run DRC, LVS, antenna, density, and manufacturability checks",
    5,
    1
   ],
   [
    6,
    "Review pushed-rule violations and exceptions with the foundry",
    3
   ],
   [
    7,
    "Close parasitic-driven layout issues against circuit targets",
    2
   ],
   [
    8,
    "Release the physically verified macro layout",
    1.5
   ]
  ],
  "o": [
   "Custom SRAM layout plan",
   "SRAM core-array layout",
   "SRAM periphery layout",
   "Complete custom SRAM layout",
   "Physical verification results",
   "Foundry rule disposition",
   "Layout optimization results",
   "Custom SRAM layout release"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "AMS-D6",
    "produces"
   ],
   [
    "AMS-D3",
    "feeds"
   ]
  ],
  "ro": "Memory layout lead"
 },
 "AMS-08": {
  "st": "amsIp",
  "w": [
   20,
   30
  ],
  "s": [
   [
    1,
    "Define target failure probability and array-level yield requirement",
    1.5
   ],
   [
    2,
    "Identify dominant read, write, and hold failure mechanisms",
    2
   ],
   [
    3,
    "Build the required Monte Carlo or importance-sampling methodology",
    3
   ],
   [
    4,
    "Characterize bitcell and critical periphery variation",
    2,
    1
   ],
   [
    5,
    "Project read, write, and hold Vmin distributions to target array size",
    1.5,
    1
   ],
   [
    6,
    "Evaluate assist and design sensitivity on yield",
    2
   ],
   [
    7,
    "Set the signoff margin and report confidence",
    1.5
   ]
  ],
  "o": [
   "SRAM statistical acceptance criteria",
   "Statistical failure-mode model",
   "Statistical simulation methodology",
   "Variation characterization results",
   "Array-level Vmin distribution",
   "Yield sensitivity results",
   "SRAM statistical margin and yield report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "AMS-D3",
    "produces"
   ],
   [
    "AMS-D2",
    "feeds"
   ]
  ],
  "ro": "Statistical analysis engineer"
 },
 "AMS-09": {
  "st": "amsIp",
  "w": [
   16,
   22
  ],
  "s": [
   [
    1,
    "Define repair coverage and spare-resource targets",
    1
   ],
   [
    2,
    "Select row, column, or hybrid redundancy architecture",
    1.5
   ],
   [
    3,
    "Define repair address encoding and storage format",
    1.25
   ],
   [
    4,
    "Integrate memory repair controls with MBIST / BISR",
    1,
    1
   ],
   [
    5,
    "Verify repair loading, application, and boot sequencing",
    1,
    1
   ],
   [
    6,
    "Run fault-injection scenarios through detection and repair",
    2.25
   ]
  ],
  "o": [
   "Memory redundancy requirements",
   "Redundancy architecture",
   "Repair encoding specification",
   "BISR integration interface",
   "Repair-sequence verification",
   "Memory repair verification results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "AMS-D3",
    "feeds"
   ],
   [
    "AMS-D8",
    "feeds"
   ]
  ],
  "ro": "Memory circuit designer"
 },
 "AMS-10": {
  "st": "amsIp",
  "w": [
   28,
   38
  ],
  "s": [
   [
    1,
    "Define the required characterization corners, arcs, and view set",
    1
   ],
   [
    2,
    "Run extracted timing and power characterization",
    3
   ],
   [
    3,
    "Generate Liberty and functional simulation models",
    2,
    1
   ],
   [
    4,
    "Generate LEF, GDS, CDL / SPICE, and required physical views",
    1.5,
    1
   ],
   [
    5,
    "Generate test, DFT, and integration collateral",
    1.5,
    1
   ],
   [
    6,
    "Run cross-view consistency and downstream tool checks",
    2
   ],
   [
    7,
    "Release the compiler-equivalent memory package",
    4
   ]
  ],
  "o": [
   "Custom-memory characterization plan",
   "Memory timing and power data",
   "Timing and functional views",
   "Physical and circuit views",
   "Memory integration collateral",
   "Custom-memory view qualification results",
   "Qualified custom-memory release"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "AMS-D4",
    "produces"
   ],
   [
    "AMS-D5",
    "feeds"
   ]
  ],
  "ro": "Memory characterization engineer"
 },
 "AMS-11": {
  "st": "amsIp",
  "w": [
   6,
   22
  ],
  "s": [
   [
    1,
    "Select the circuit topology and device operating points",
    1.5
   ],
   [
    2,
    "Implement the transistor-level schematic",
    3
   ],
   [
    3,
    "Verify nominal DC, AC, transient, noise, and functional behavior",
    3.5
   ],
   [
    4,
    "Run required PVT corner simulations",
    3
   ],
   [
    5,
    "Run Monte Carlo and mismatch analysis on critical metrics",
    2.5,
    1
   ],
   [
    6,
    "Verify startup, calibration, trim, and fault behavior where applicable",
    2.5,
    1
   ],
   [
    7,
    "Release layout constraints and the pre-layout design baseline",
    5
   ]
  ],
  "o": [
   "AMS circuit architecture",
   "AMS schematic design",
   "Baseline pre-layout results",
   "PVT verification results",
   "Variation and mismatch results",
   "Control and robustness results",
   "Layout-ready AMS schematic"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "AMS-D1",
    "feeds"
   ],
   [
    "AMS-D2",
    "feeds"
   ]
  ],
  "ro": "Analog design leads"
 },
 "AMS-12": {
  "st": "amsIp",
  "w": [
   20,
   38
  ],
  "s": [
   [
    1,
    "Define device placement, matching, shielding, and routing constraints",
    2
   ],
   [
    2,
    "Place matched and sensitive devices",
    4
   ],
   [
    3,
    "Route signal, bias, clock, and supply networks",
    3
   ],
   [
    4,
    "Complete guard rings, shielding, taps, and reliability structures",
    3,
    1
   ],
   [
    5,
    "Run DRC, LVS, and antenna checks",
    2.5,
    1
   ],
   [
    6,
    "Insert required density fill and recheck sensitive parasitics",
    4
   ],
   [
    7,
    "Review layout against electrical and integration constraints",
    3
   ],
   [
    8,
    "Release the extracted-verification layout baseline",
    2
   ]
  ],
  "o": [
   "AMS layout plan",
   "Critical device placement",
   "AMS custom routing",
   "Layout protection structures",
   "Physical verification results",
   "Fill-compliant layout",
   "Layout quality review",
   "Physically verified AMS layout"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "AMS-D6",
    "produces"
   ],
   [
    "AMS-D5",
    "feeds"
   ]
  ],
  "ro": "Analog layout lead"
 },
 "AMS-13": {
  "st": "amsIp",
  "w": [
   22,
   38
  ],
  "s": [
   [
    1,
    "Extract the layout with the qualified parasitic setup",
    1.5
   ],
   [
    2,
    "Correlate extracted nominal results against the pre-layout baseline",
    3
   ],
   [
    3,
    "Run required PVT simulations on the extracted design",
    4
   ],
   [
    4,
    "Run Monte Carlo or mismatch analysis on critical metrics",
    3,
    1
   ],
   [
    5,
    "Analyze coupling, RC, and layout-dependent performance loss",
    2,
    1
   ],
   [
    6,
    "Iterate circuit or layout where margins are insufficient",
    4.5
   ],
   [
    7,
    "Release the final extracted verification report",
    3
   ]
  ],
  "o": [
   "Extracted AMS netlist",
   "Pre / post-layout correlation",
   "Extracted PVT results",
   "Post-layout statistical results",
   "Parasitic impact assessment",
   "Post-layout closure actions",
   "Post-layout AMS signoff results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "AMS-D2",
    "produces"
   ],
   [
    "AMS-D1",
    "feeds"
   ]
  ],
  "ro": "Analog design leads"
 },
 "AMS-14": {
  "st": "amsIp",
  "w": [
   28,
   38
  ],
  "s": [
   [
    1,
    "Define the applicable reliability checks and mission profile",
    1
   ],
   [
    2,
    "Check device voltage, current, and operating-area limits",
    2.5
   ],
   [
    3,
    "Run EM / IR analysis on critical supply and high-current paths",
    1.5,
    1
   ],
   [
    4,
    "Evaluate aging and lifetime degradation on sensitive circuits",
    2.5
   ],
   [
    5,
    "Verify ESD protection paths and clamp assumptions",
    2,
    1
   ],
   [
    6,
    "Review latch-up spacing, taps, guard rings, and injection risks",
    1.5,
    1
   ],
   [
    7,
    "Close reliability violations and release the assessment",
    4
   ]
  ],
  "o": [
   "AMS reliability verification plan",
   "Device stress results",
   "AMS EM / IR results",
   "Aging assessment",
   "ESD verification results",
   "Latch-up assessment",
   "AMS reliability closure record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "AMS-D7",
    "produces"
   ],
   [
    "AMS-D8",
    "feeds"
   ]
  ],
  "ro": "Reliability engineer"
 },
 "AMS-15": {
  "st": "amsIp",
  "w": [
   32,
   40
  ],
  "s": [
   [
    1,
    "Define the required hard-macro view set and release manifest",
    1
   ],
   [
    2,
    "Generate LEF and physical abstracts",
    1.5
   ],
   [
    3,
    "Generate timing and power models",
    1.5
   ],
   [
    4,
    "Generate GDS, CDL / SPICE, and LVS collateral",
    2,
    1
   ],
   [
    5,
    "Generate behavioral or functional models where required",
    1.5,
    1
   ],
   [
    6,
    "Document placement, supply, clock, pin, and usage constraints",
    1.5,
    1
   ],
   [
    7,
    "Run cross-view and downstream tool consistency checks",
    2
   ],
   [
    8,
    "Release the version-controlled hard-macro package",
    2
   ]
  ],
  "o": [
   "AMS macro release requirements",
   "AMS physical abstract",
   "AMS timing and power views",
   "AMS circuit and signoff views",
   "AMS simulation models",
   "AMS integration guide",
   "AMS macro qualification results",
   "Qualified AMS hard-macro release"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "AMS-D5",
    "produces"
   ],
   [
    "AMS-D4",
    "feeds"
   ],
   [
    "AMS-D2",
    "feeds"
   ]
  ],
  "ro": "AMS integration lead"
 },
 "AMS-16": {
  "st": "amsIp",
  "w": [
   26,
   42
  ],
  "s": [
   [
    1,
    "Define AMS–digital integration scenarios and abstraction levels",
    2
   ],
   [
    2,
    "Integrate behavioral or real-number AMS models with the RTL environment",
    2.5
   ],
   [
    3,
    "Verify clocks, resets, controls, status, and data interfaces",
    3
   ],
   [
    4,
    "Verify startup, calibration, trim, and mode transitions",
    2.5,
    1
   ],
   [
    5,
    "Verify relevant power-state and supply sequencing behavior",
    5,
    1
   ],
   [
    6,
    "Correlate behavioral models against transistor-level or extracted results",
    3
   ],
   [
    7,
    "Close integration issues and release models for regression",
    5.5
   ]
  ],
  "o": [
   "AMS integration verification plan",
   "AMS–digital simulation environment",
   "AMS interface verification results",
   "AMS control-sequence results",
   "AMS power-state integration results",
   "AMS model correlation",
   "Qualified AMS integration model set"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "AMS-D8",
    "produces"
   ],
   [
    "AMS-D1",
    "feeds"
   ]
  ],
  "ro": "AMS verification engineer"
 },
 "TC-01": {
  "st": "testChip",
  "w": [
   0,
   5
  ],
  "s": [
   [
    1,
    "Define the production decisions the test chip must support",
    1
   ],
   [
    2,
    "Select and prioritize the risks that require silicon evidence",
    1.5
   ],
   [
    3,
    "Confirm that silicon results will arrive before the corresponding decisions",
    1,
    1
   ],
   [
    4,
    "Select the test structures and measurements for each risk",
    1
   ],
   [
    5,
    "Close the shuttle die-area and cost budget",
    0.75,
    1
   ],
   [
    6,
    "Baseline the test-chip specification and risk coverage matrix",
    1.5
   ]
  ],
  "o": [
   "Production decision and test-chip objective statement",
   "Prioritized silicon-risk list",
   "Schedule feasibility assessment",
   "Risk-to-structure and measurement mapping",
   "Shuttle die-area and cost budget",
   "Test chip specification and risk coverage matrix"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TC-D1",
    "produces"
   ],
   [
    "TC-D5",
    "feeds"
   ]
  ],
  "ro": "Test chip lead"
 },
 "TC-02": {
  "st": "testChip",
  "w": [
   2,
   14
  ],
  "s": [
   [
    1,
    "Define the IP / circuits to be included and their target configurations",
    1
   ],
   [
    2,
    "Design DUT wrappers, controls, and access paths",
    3
   ],
   [
    3,
    "Define ring-oscillator and process-monitor arrays",
    2,
    1
   ],
   [
    4,
    "Design measurement and PCM structures",
    3
   ],
   [
    5,
    "Assemble the reusable test-structure library",
    2,
    1
   ],
   [
    6,
    "Integrate the top level and close pad assignment",
    2.5
   ],
   [
    7,
    "Define the pad ring, ESD, and external measurement interfaces",
    1.5,
    1
   ],
   [
    8,
    "Verify all access paths and measurement modes",
    2.5
   ]
  ],
  "o": [
   "Test-chip content and target-configuration definition",
   "DUT wrapper and access architecture",
   "Ring-oscillator and process-monitor array definition",
   "Measurement and PCM structure set",
   "Assembled test-structure library",
   "Integrated top-level netlist and pad assignment",
   "Pad-ring / ESD and measurement-interface definition",
   "Access-path and measurement-mode verification results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TC-D2",
    "feeds"
   ],
   [
    "TC-D1",
    "feeds"
   ]
  ],
  "ro": "Test chip design lead"
 },
 "TC-03": {
  "st": "testChip",
  "w": [
   5,
   9
  ],
  "s": [
   [
    1,
    "Review MPW calendars and identify viable shuttle windows",
    1
   ],
   [
    2,
    "Confirm foundry or broker pricing and process-option eligibility",
    0.75,
    1
   ],
   [
    3,
    "Book the shuttle against the production decision timeline",
    1
   ],
   [
    4,
    "Collect data-format, layer, and submission requirements",
    0.75,
    1
   ],
   [
    5,
    "Build the backward-planned submission schedule and checklist",
    2
   ]
  ],
  "o": [
   "Viable MPW shuttle options",
   "Foundry / broker pricing and eligibility record",
   "Confirmed MPW slot",
   "Submission requirement record",
   "Backward-planned submission schedule and checklist"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "TC-D2",
    "feeds"
   ]
  ],
  "ro": "Program manager"
 },
 "TC-04": {
  "st": "testChip",
  "w": [
   12,
   24
  ],
  "s": [
   [
    1,
    "Define the floorplan and place the measurement structures",
    1.5
   ],
   [
    2,
    "Place and route the integrated test-chip design",
    2.5
   ],
   [
    3,
    "Implement the measurement-grade power delivery network",
    2,
    1
   ],
   [
    4,
    "Close timing on access and control paths",
    2.5
   ],
   [
    5,
    "Complete fill, seal-ring, and shuttle-frame requirements",
    1.5,
    1
   ],
   [
    6,
    "Close DRC, antenna, density, and required physical checks",
    3
   ],
   [
    7,
    "Close LVS and final netlist consistency",
    1.5,
    1
   ],
   [
    8,
    "Assemble the final GDS / OASIS and submit to the shuttle",
    2.5
   ]
  ],
  "o": [
   "Test-chip floorplan and structure placement",
   "Placed-and-routed shuttle database",
   "Measurement-grade PDN",
   "Timing closure on access and control paths",
   "Fill / seal-ring / frame compliance record",
   "Physical-verification closure reports",
   "LVS closure record",
   "Submitted shuttle GDS / OASIS package"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TC-D2",
    "produces"
   ],
   [
    "TC-D3",
    "feeds"
   ]
  ],
  "ro": "Test chip physical lead"
 },
 "TC-05": {
  "st": "testChip",
  "w": [
   22,
   38
  ],
  "s": [
   [
    1,
    "Confirm shuttle data acceptance and fabrication start",
    1
   ],
   [
    2,
    "Track shuttle mask fabrication",
    4
   ],
   [
    3,
    "Track WIP and communicate schedule changes",
    2,
    1
   ],
   [
    4,
    "Track wafer processing through completion",
    8
   ],
   [
    5,
    "Review e-test and PCM data as soon as released",
    1.5,
    1
   ],
   [
    6,
    "Coordinate dicing, packaging, sample quantity, and delivery",
    3
   ]
  ],
  "o": [
   "Accepted shuttle submission and wafer-start confirmation",
   "Mask fabrication status",
   "WIP and schedule status record",
   "Processed test-chip wafers",
   "E-test / PCM review findings",
   "Packaged parts and delivery record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TC-D3",
    "feeds"
   ]
  ],
  "ro": "Program manager"
 },
 "TC-06": {
  "st": "testChip",
  "w": [
   24,
   33
  ],
  "s": [
   [
    1,
    "Translate the coverage matrix into measurement and lab requirements",
    1
   ],
   [
    2,
    "Design the board for supplies, bias, clocks, and measurement paths",
    2.5
   ],
   [
    3,
    "Select and order the socket or probe solution",
    1.5,
    1
   ],
   [
    4,
    "Fabricate and assemble the test boards",
    2.5
   ],
   [
    5,
    "Develop measurement automation and data-capture scripts",
    1.5,
    1
   ],
   [
    6,
    "Bring up the board and qualify the instrument setup",
    3
   ]
  ],
  "o": [
   "Measurement and lab requirement specification",
   "Test-chip board design",
   "Socket / probe solution and lead-time commitment",
   "Fabricated and assembled boards",
   "Measurement automation and capture scripts",
   "Board bring-up and qualified instrument setup"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TC-D3",
    "feeds"
   ]
  ],
  "ro": "Characterization engineer"
 },
 "TC-07": {
  "st": "testChip",
  "w": [
   28,
   40
  ],
  "s": [
   [
    1,
    "Perform incoming inspection and basic functionality checks",
    1.5
   ],
   [
    2,
    "Characterize the selected IP and circuits across the planned matrix",
    3
   ],
   [
    3,
    "Measure ring-oscillator frequency, leakage, and monitor structures",
    2.5,
    1
   ],
   [
    4,
    "Extract PCM and device parameters",
    3
   ],
   [
    5,
    "Set up corner-by-corner correlation against simulation",
    2,
    1
   ],
   [
    6,
    "Analyze across-wafer and lot-to-lot variation",
    2
   ],
   [
    7,
    "Investigate outliers and unexpected behavior",
    1.5,
    1
   ],
   [
    8,
    "Compile the silicon-to-model correlation results with uncertainty",
    2.5
   ]
  ],
  "o": [
   "Incoming inspection and functionality results",
   "Selected IP / circuit characterization data",
   "Ring-oscillator / leakage / monitor measurements",
   "Extracted PCM and device parameters",
   "Simulation-correlation setup",
   "Variation analysis",
   "Outlier and failure-analysis findings",
   "Silicon-to-model correlation report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TC-D3",
    "produces"
   ],
   [
    "TC-D4",
    "produces"
   ]
  ],
  "ro": "Characterization engineer"
 },
 "TC-08": {
  "st": "testChip",
  "w": [
   34,
   40
  ],
  "s": [
   [
    1,
    "Quantify where silicon and pre-silicon models disagree",
    1
   ],
   [
    2,
    "Define model-correction and re-characterization actions",
    1.5
   ],
   [
    3,
    "Propose design-rule and methodology updates",
    1,
    1
   ],
   [
    4,
    "Make quantified production margin decisions",
    1.5
   ],
   [
    5,
    "Raise required production design changes through change control",
    1,
    1
   ],
   [
    6,
    "Publish the guidance and track adoption to closure",
    2
   ]
  ],
  "o": [
   "Correlation gap analysis",
   "Model-correction and re-characterization actions",
   "Methodology / rule update proposals",
   "Production margin decisions",
   "Production design change requests",
   "Guidance publication and adoption-closure record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TC-D5",
    "produces"
   ],
   [
    "TC-D4",
    "feeds"
   ]
  ],
  "ro": "Test chip lead"
 },
 "RTL-01": {
  "st": "rtl",
  "w": [
   0,
   10
  ],
  "s": [
   [
    1,
    "Plan specification completion and assign block owners",
    1
   ],
   [
    2,
    "Write the pipeline and datapath detail for each block",
    3
   ],
   [
    3,
    "Specify control logic and state machines",
    2.5,
    1
   ],
   [
    4,
    "Detail block interfaces and protocols against the NoC",
    2.5
   ],
   [
    5,
    "Define exception, error and corner-case behavior",
    2,
    1
   ],
   [
    6,
    "Define verification hooks and observability requirements with DV",
    1.5,
    1
   ],
   [
    7,
    "Review each specification and run the implementation entry gate",
    3.5
   ]
  ],
  "o": [
   "Specification completion plan and block-owner assignments",
   "Per-block pipeline and datapath detail",
   "Control and state machine definitions",
   "Interface and protocol detail per block",
   "Exception and corner-case behavior definitions",
   "Verification hook and observability requirements",
   "Reviewed specifications with implementation entry gate records"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "RTL-D1",
    "feeds"
   ],
   [
    "RTL-D7",
    "gates"
   ]
  ],
  "ro": "Block owners"
 },
 "RTL-02": {
  "st": "rtl",
  "w": [
   4,
   28
  ],
  "s": [
   [
    1,
    "Set the coding standard, directory structure and naming conventions",
    1.5
   ],
   [
    2,
    "Implement first-pass RTL for each block",
    9
   ],
   [
    3,
    "Insert block-level self-checking and assertions",
    4,
    1
   ],
   [
    4,
    "Review block RTL against its specification",
    3.5
   ],
   [
    5,
    "Implement parameterization and configuration options",
    3,
    1
   ],
   [
    6,
    "Fix and refine blocks against block-level verification results",
    7
   ],
   [
    7,
    "Refine block PPA against trial synthesis feedback",
    4,
    1
   ],
   [
    8,
    "Freeze blocks and tag the release",
    3
   ]
  ],
  "o": [
   "Coding standard and repository structure",
   "First-pass block RTL",
   "Embedded assertions and self-checking",
   "Block RTL review findings",
   "Parameterized and configurable block RTL",
   "Fixed and refined block RTL",
   "Block-level PPA refinement record",
   "Block RTL source, tagged",
   "Frozen block configuration set",
   "Compiled block review records",
   "Block release tags with known issues"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   8,
   8,
   8
  ],
  "r": [
   [
    "RTL-D1",
    "produces"
   ],
   [
    "RTL-D4",
    "feeds"
   ]
  ],
  "ro": "Block designers"
 },
 "RTL-03": {
  "st": "rtl",
  "w": [
   8,
   24
  ],
  "s": [
   [
    1,
    "Receive each IP delivery and inspect it against the acceptance checklist",
    1.5
   ],
   [
    2,
    "Build the integration environment and wrapper framework",
    2
   ],
   [
    3,
    "Implement wrappers and glue logic per IP",
    5
   ],
   [
    4,
    "Configure, tie off and set parameters for each IP",
    3,
    1
   ],
   [
    5,
    "Verify boundary and reset sequencing per IP",
    4
   ],
   [
    6,
    "Integrate AMS macros with their behavioural models",
    3.5,
    1
   ],
   [
    7,
    "Build the IP version manifest and handle vendor updates",
    2.5,
    1
   ],
   [
    8,
    "Compile the integration report and escalate issues to vendors",
    3.5
   ]
  ],
  "o": [
   "Incoming inspection records per delivery",
   "Integration environment and wrapper framework",
   "IP wrappers and glue logic",
   "Per-IP configuration and tie-off records",
   "Boundary and reset sequencing verification results",
   "Integrated AMS macros with behavioural models",
   "IP version manifest",
   "Integration report and vendor issue log"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "RTL-D6",
    "produces"
   ],
   [
    "RTL-D1",
    "feeds"
   ]
  ],
  "ro": "IP integration lead"
 },
 "RTL-04": {
  "st": "rtl",
  "w": [
   16,
   28
  ],
  "s": [
   [
    1,
    "Define the top-level hierarchy and connectivity",
    1.5
   ],
   [
    2,
    "Integrate the NoC and interconnect",
    3
   ],
   [
    3,
    "Implement clock and reset distribution",
    2.5,
    1
   ],
   [
    4,
    "Assemble the address map and configuration space",
    2,
    1
   ],
   [
    5,
    "Elaborate the top level and run automated connectivity checks",
    2.5
   ],
   [
    6,
    "Integrate the boot and bring-up path",
    2.5,
    1
   ],
   [
    7,
    "Run chip-level smoke tests and the first boot in simulation",
    2.5
   ],
   [
    8,
    "Close integration issues and release the top level",
    2.5
   ]
  ],
  "o": [
   "Top-level hierarchy and connectivity definition",
   "Integrated NoC and interconnect",
   "Implemented clock and reset distribution",
   "Assembled address map and configuration space",
   "Elaborated top level with connectivity check results",
   "Integrated boot and bring-up path",
   "Chip-level smoke test results",
   "Top-level RTL release"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "RTL-D1",
    "produces"
   ],
   [
    "RTL-D7",
    "feeds"
   ]
  ],
  "ro": "Chip integration lead"
 },
 "RTL-05": {
  "st": "rtl",
  "w": [
   6,
   16
  ],
  "s": [
   [
    1,
    "Implement power domain boundaries against the ARCH-05 definition",
    2
   ],
   [
    2,
    "Implement the isolation, level-shifter and retention strategy",
    2.5
   ],
   [
    3,
    "Implement CDC synchronisers against the crossing inventory",
    2,
    1
   ],
   [
    4,
    "Implement reset sequencing and synchronization",
    1.5,
    1
   ],
   [
    5,
    "Author the UPF and check tool acceptance in synthesis",
    2.5
   ],
   [
    6,
    "Implement the power management controller RTL",
    2,
    1
   ],
   [
    7,
    "Review the intent with synthesis, verification and physical design",
    3
   ]
  ],
  "o": [
   "Implemented power domain boundaries",
   "Implemented isolation, level shifters and retention",
   "Synchroniser coverage against the crossing inventory",
   "Implemented CDC synchronisers",
   "Reset sequencing logic",
   "UPF power intent file, tool-accepted",
   "Power management controller RTL",
   "Power intent review record"
  ],
  "ob": [
   1,
   2,
   3,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "RTL-D5",
    "produces"
   ],
   [
    "RTL-D4",
    "feeds"
   ]
  ],
  "ro": "Low-power implementation lead"
 },
 "RTL-06": {
  "st": "rtl",
  "w": [
   12,
   28
  ],
  "s": [
   [
    1,
    "Define the lint, CDC and RDC methodology and rule sets",
    1.5
   ],
   [
    2,
    "Close lint at block level",
    3.5
   ],
   [
    3,
    "Close CDC at block level",
    3.5,
    1
   ],
   [
    4,
    "Close CDC at chip level against the crossing inventory",
    4
   ],
   [
    5,
    "Close RDC and analyze reset domains",
    3,
    1
   ],
   [
    6,
    "Review and disposition every waiver",
    3
   ],
   [
    7,
    "Report closure and set up the closure regression",
    4
   ]
  ],
  "o": [
   "Lint, CDC and RDC rule sets",
   "Block-level lint closure record",
   "Block-level CDC closure record",
   "Chip-level CDC closure results",
   "Crossing inventory reconciliation",
   "RDC closure record and reset domain analysis",
   "Waiver list with dispositions and signatures",
   "Closure regression in the CI flow"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "RTL-D4",
    "produces"
   ],
   [
    "RTL-D7",
    "gates"
   ]
  ],
  "ro": "RTL quality lead"
 },
 "RTL-07": {
  "st": "rtl",
  "w": [
   4,
   12
  ],
  "s": [
   [
    1,
    "Select the register description language and generation tooling",
    1
   ],
   [
    2,
    "Allocate the address map across blocks",
    1.5
   ],
   [
    3,
    "Define registers per block",
    2.5
   ],
   [
    4,
    "Specify access policies, reset values and side effects",
    1.5,
    1
   ],
   [
    5,
    "Build the generation flow for RTL, headers, documentation and the UVM model",
    2,
    1
   ],
   [
    6,
    "Run the software review of the map",
    1.5,
    1
   ],
   [
    7,
    "Release the map under change control",
    3
   ]
  ],
  "o": [
   "Register description source",
   "Address map allocation",
   "Per-block register definitions",
   "Access policy and side-effect specification",
   "Generated RTL, headers, documentation and UVM model",
   "Software review record",
   "Released register map with change control"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "RTL-D2",
    "produces"
   ],
   [
    "RTL-D1",
    "feeds"
   ]
  ],
  "ro": "Register map owner"
 },
 "RTL-08": {
  "st": "rtl",
  "w": [
   10,
   22
  ],
  "s": [
   [
    1,
    "Set up the trial synthesis flow and bootstrap constraints",
    1.5
   ],
   [
    2,
    "Run per-block trial synthesis and establish QoR baselines",
    3
   ],
   [
    3,
    "Deliver timing feedback to block owners",
    2.5,
    1
   ],
   [
    4,
    "Track area against the ARCH-06 budgets",
    2
   ],
   [
    5,
    "Feed back power and clock-gating effectiveness to block owners",
    2,
    1
   ],
   [
    6,
    "Flag congestion and routability early indications",
    2,
    1
   ],
   [
    7,
    "Operate the recurring trial synthesis cadence and reporting",
    5.5
   ]
  ],
  "o": [
   "Trial synthesis flow and constraints",
   "Per-block QoR baselines",
   "Timing feedback reports to block owners",
   "Area tracking against the ARCH-06 budgets",
   "Power and clock-gating effectiveness reports",
   "Congestion and routability indications",
   "Trial synthesis cadence and reporting record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "RTL-D1",
    "feeds"
   ],
   [
    "RTL-D7",
    "feeds"
   ]
  ],
  "ro": "Synthesis engineer"
 },
 "RTL-09": {
  "st": "rtl",
  "w": [
   2,
   32
  ],
  "s": [
   [
    1,
    "Set up the build system and dependency management",
    2.5
   ],
   [
    2,
    "Stand up continuous integration with per-commit checks",
    3
   ],
   [
    3,
    "Define and schedule the nightly regression",
    2.5,
    1
   ],
   [
    4,
    "Establish release tagging and the version manifest process",
    2
   ],
   [
    5,
    "Manage compute and license capacity for regressions",
    2,
    1
   ],
   [
    6,
    "Build the failure triage and notification workflow",
    2.5,
    1
   ],
   [
    7,
    "Operate and maintain the machinery across the stage",
    22.5
   ]
  ],
  "o": [
   "Build system and dependency management",
   "Continuous integration with per-commit checks",
   "Nightly regression suite and schedule",
   "Release tagging and version manifests",
   "Compute and license capacity management record",
   "Failure triage and notification workflow",
   "Regression operation and maintenance log"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "RTL-D3",
    "produces"
   ],
   [
    "RTL-D1",
    "feeds"
   ]
  ],
  "ro": "Configuration and release manager"
 },
 "RTL-10": {
  "st": "rtl",
  "w": [
   2,
   32
  ],
  "s": [
   [
    1,
    "Define the change control process and ECO board charter",
    1.5
   ],
   [
    2,
    "Build the change request intake and impact assessment workflow",
    2
   ],
   [
    3,
    "Operate the ECO board and record decisions",
    20
   ],
   [
    4,
    "Track approved changes across blocks, verification and synthesis",
    3,
    1
   ],
   [
    5,
    "Define freeze criteria and track readiness against them",
    2.5,
    1
   ],
   [
    6,
    "Assemble the RTL Freeze package",
    3
   ],
   [
    7,
    "Declare freeze and publish the post-freeze exception policy",
    3.5
   ]
  ],
  "o": [
   "Change control process and ECO board charter",
   "Change request log with impact assessments",
   "ECO board decision records",
   "Change tracking record across blocks, verification and synthesis",
   "Freeze criteria and readiness tracking",
   "RTL Freeze package and declaration",
   "Freeze declaration with its exception policy"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "RTL-D7",
    "produces"
   ],
   [
    "RTL-D1",
    "gates"
   ]
  ],
  "ro": "Program manager"
 },
 "DV-01": {
  "st": "verification",
  "w": [
   0,
   8
  ],
  "s": [
   [
    1,
    "Extract the feature list from the architecture and block specifications",
    1.5
   ],
   [
    2,
    "Assign a verification strategy per feature — simulation, formal or emulation",
    1.5
   ],
   [
    3,
    "Define the coverage model — functional, code and assertion",
    2
   ],
   [
    4,
    "Define closure criteria and signoff per block and at chip level",
    1,
    1
   ],
   [
    5,
    "Model the resource, compute and schedule demand",
    1,
    1
   ],
   [
    6,
    "Review the verification plan with design and architecture",
    3
   ]
  ],
  "o": [
   "Feature list extracted from the specifications",
   "Verification strategy per feature",
   "Coverage model — functional, code and assertion",
   "Closure criteria per block and at chip level",
   "Resource and schedule model",
   "Reviewed verification plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "DV-D1",
    "produces"
   ],
   [
    "DV-D8",
    "gates"
   ]
  ],
  "ro": "Verification lead"
 },
 "DV-02": {
  "st": "verification",
  "w": [
   4,
   18
  ],
  "s": [
   [
    1,
    "Define the environment architecture and reuse strategy",
    1.5
   ],
   [
    2,
    "Develop UVM agents for each interface",
    4
   ],
   [
    3,
    "Integrate and configure third-party VIP",
    3,
    1
   ],
   [
    4,
    "Develop scoreboards and reference models",
    4
   ],
   [
    5,
    "Build the sequence library and stimulus infrastructure",
    3,
    1
   ],
   [
    6,
    "Integrate the register model generated from the RDL source",
    2,
    1
   ],
   [
    7,
    "Bring the environment up on the first real block",
    2.5
   ],
   [
    8,
    "Release the environment with its documentation",
    2
   ]
  ],
  "o": [
   "Environment architecture and reuse strategy",
   "UVM agents per interface",
   "Integrated third-party VIP",
   "Scoreboards and reference models",
   "Sequence library",
   "Integrated register model from the RDL source",
   "Environment bring-up results on the first block",
   "Released environment with documentation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "DV-D2",
    "produces"
   ],
   [
    "DV-D1",
    "feeds"
   ]
  ],
  "ro": "Verification architect"
 },
 "DV-03": {
  "st": "verification",
  "w": [
   8,
   38
  ],
  "s": [
   [
    1,
    "Instantiate per-block testbenches from the shared environment",
    2.5
   ],
   [
    2,
    "Develop directed tests for specified behavior",
    5
   ],
   [
    3,
    "Develop constrained-random stimulus and tune the constraints",
    6
   ],
   [
    4,
    "Write and bind assertions",
    4,
    1
   ],
   [
    5,
    "Run corner-case and error-injection testing",
    5
   ],
   [
    6,
    "Analyze coverage and close holes per block",
    6
   ],
   [
    7,
    "Run the debug and bug reporting loop with block owners",
    8,
    1
   ],
   [
    8,
    "Close each block against the DV-01 criteria and sign off",
    5.5
   ]
  ],
  "o": [
   "Per-block testbenches and test suites",
   "Directed test suite for specified behavior",
   "Constrained-random test suite with tuned constraints",
   "Bound assertion set",
   "Corner-case and error-injection results",
   "Coverage analysis and hole closure records",
   "Bug reports and debug log with block owners",
   "Assertions bound to block interfaces",
   "Per-block closure evidence package"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   8
  ],
  "r": [
   [
    "DV-D2",
    "feeds"
   ],
   [
    "DV-D3",
    "feeds"
   ],
   [
    "DV-D8",
    "feeds"
   ]
  ],
  "ro": "Block verification owners"
 },
 "DV-04": {
  "st": "verification",
  "w": [
   14,
   36
  ],
  "s": [
   [
    1,
    "Assemble the chip-level verification environment",
    2.5
   ],
   [
    2,
    "Develop boot and configuration scenarios",
    3
   ],
   [
    3,
    "Test end-to-end data paths and data integrity",
    4
   ],
   [
    4,
    "Stress the interconnect for arbitration and deadlock under contention",
    3.5,
    1
   ],
   [
    5,
    "Test power state transitions and DVFS scenarios",
    3,
    1
   ],
   [
    6,
    "Inject errors and verify recovery at system level",
    3.5
   ],
   [
    7,
    "Run realistic workload scenarios from the DEF-02 suite",
    3.5,
    1
   ],
   [
    8,
    "Close chip-level coverage and sign off",
    9
   ]
  ],
  "o": [
   "Chip-level verification environment",
   "Boot and configuration scenarios",
   "End-to-end data integrity results",
   "Interconnect stress and deadlock findings",
   "Power transition scenario results",
   "System-level error injection and recovery results",
   "Realistic workload scenarios in the testbench",
   "Chip-level coverage closure and signoff record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "DV-D8",
    "feeds"
   ],
   [
    "DV-D3",
    "feeds"
   ]
  ],
  "ro": "Chip verification lead"
 },
 "DV-05": {
  "st": "verification",
  "w": [
   10,
   26
  ],
  "s": [
   [
    1,
    "Select formal targets where proof beats simulation",
    1.5
   ],
   [
    2,
    "Write property specifications per target",
    3
   ],
   [
    3,
    "Prove connectivity and structural properties at chip level",
    2.5,
    1
   ],
   [
    4,
    "Prove control logic and arbiter properties",
    3.5
   ],
   [
    5,
    "Prove security and isolation properties",
    2.5,
    1
   ],
   [
    6,
    "Review assumptions and check for over-constraint",
    2.5
   ],
   [
    7,
    "Close proofs, state bounded results and report",
    5.5
   ]
  ],
  "o": [
   "Formal target list with rationale",
   "Property specifications per target",
   "Connectivity and structural proof results",
   "Control and arbiter proof results",
   "Security property proof results",
   "Assumption review and over-constraint findings",
   "Assumption list and proof closure report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DV-D4",
    "produces"
   ],
   [
    "DV-D8",
    "feeds"
   ]
  ],
  "ro": "Formal verification lead"
 },
 "DV-06": {
  "st": "verification",
  "w": [
   18,
   28
  ],
  "s": [
   [
    1,
    "Set up the UPF-aware simulation environment",
    1.5
   ],
   [
    2,
    "Run static UPF structural checks",
    1.5
   ],
   [
    3,
    "Verify isolation and level shifters",
    2
   ],
   [
    4,
    "Verify retention and state restoration through real power-down cycles",
    2,
    1
   ],
   [
    5,
    "Verify power sequencing and the power management controller",
    2,
    1
   ],
   [
    6,
    "Integrate power-aware tests into the standing regression",
    1.5,
    1
   ],
   [
    7,
    "Close low-power coverage and report",
    5
   ]
  ],
  "o": [
   "UPF-aware simulation environment",
   "Static UPF structural check results",
   "Isolation and level shifter verification results",
   "Retention verification results",
   "Power sequencing verification results",
   "Power-aware tests in the standing regression",
   "Low-power coverage report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DV-D5",
    "produces"
   ],
   [
    "DV-D3",
    "feeds"
   ]
  ],
  "ro": "Low-power verification engineer"
 },
 "DV-07": {
  "st": "verification",
  "w": [
   16,
   28
  ],
  "s": [
   [
    1,
    "Build the co-simulation environment and integrate the models",
    2
   ],
   [
    2,
    "Review model fidelity against the AMS characterization results",
    2
   ],
   [
    3,
    "Verify the control and configuration interfaces",
    2.5
   ],
   [
    4,
    "Verify calibration and training sequences from the digital side",
    2.5,
    1
   ],
   [
    5,
    "Verify startup, lock and ready signaling",
    2,
    1
   ],
   [
    6,
    "Verify analog fault and degraded-mode behavior",
    1.5,
    1
   ],
   [
    7,
    "Close co-simulation and report the findings",
    5.5
   ]
  ],
  "o": [
   "AMS co-simulation environment",
   "Model fidelity review findings",
   "Control and configuration interface results",
   "Calibration and training sequence results",
   "Startup and ready-signaling results",
   "Analog fault and degraded-mode results",
   "Co-simulation findings report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DV-D2",
    "feeds"
   ],
   [
    "DV-D8",
    "feeds"
   ]
  ],
  "ro": "AMS verification engineer"
 },
 "DV-08": {
  "st": "verification",
  "w": [
   6,
   26
  ],
  "s": [
   [
    1,
    "Select the platform and size the capacity",
    2
   ],
   [
    2,
    "Partition the design across the platform",
    3.5
   ],
   [
    3,
    "Model memories and interfaces on the platform",
    3,
    1
   ],
   [
    4,
    "Bring the platform up to first boot",
    4
   ],
   [
    5,
    "Build the debug and visibility infrastructure",
    3,
    1
   ],
   [
    6,
    "Tune performance and throughput",
    2.5,
    1
   ],
   [
    7,
    "Execute long scenarios and workloads",
    8
   ],
   [
    8,
    "Hand the platform over to firmware and validation",
    2.5
   ]
  ],
  "o": [
   "Platform selection and capacity plan",
   "Design partitioning for the platform",
   "Memory and interface models",
   "Working emulation platform with boot",
   "Debug and visibility infrastructure",
   "Performance and throughput tuning record",
   "Long-scenario and workload results",
   "Platform handover package to firmware and validation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "DV-D6",
    "produces"
   ],
   [
    "DV-D3",
    "feeds"
   ]
  ],
  "ro": "Emulation lead"
 },
 "DV-09": {
  "st": "verification",
  "w": [
   22,
   34
  ],
  "s": [
   [
    1,
    "Build performance measurement infrastructure into the testbench",
    1.5
   ],
   [
    2,
    "Execute the workloads on emulation and simulation",
    3
   ],
   [
    3,
    "Measure bandwidth and utilization against the model predictions",
    2.5
   ],
   [
    4,
    "Analyze latency and queueing behavior",
    2,
    1
   ],
   [
    5,
    "Identify bottlenecks and establish root causes",
    2.5,
    1
   ],
   [
    6,
    "Correlate results against the ARCH-01 performance model",
    2.5
   ],
   [
    7,
    "Report findings, recommendations and model reconciliation",
    2.5
   ]
  ],
  "o": [
   "Performance measurement infrastructure",
   "Workload execution results",
   "Bandwidth, utilization and latency measurements",
   "Latency and queueing analysis results",
   "Bottleneck analysis with root causes",
   "Model correlation results",
   "Findings and recommendations"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DV-D8",
    "feeds"
   ],
   [
    "DV-D6",
    "feeds"
   ]
  ],
  "ro": "Performance verification lead"
 },
 "DV-10": {
  "st": "verification",
  "w": [
   12,
   38
  ],
  "s": [
   [
    1,
    "Define and tier the regression suites",
    2
   ],
   [
    2,
    "Build the regression infrastructure and manage capacity",
    2.5
   ],
   [
    3,
    "Establish the failure triage process with ownership",
    2.5,
    1
   ],
   [
    4,
    "Collect, merge and report coverage",
    3
   ],
   [
    5,
    "Analyze coverage holes and target tests at them",
    5
   ],
   [
    6,
    "Stabilize the regression and eliminate flaky tests",
    4,
    1
   ],
   [
    7,
    "Publish the dashboard and track closure",
    4,
    1
   ],
   [
    8,
    "Drive coverage to closure and assemble the signoff",
    13.5
   ]
  ],
  "o": [
   "Tiered regression suites",
   "Regression infrastructure and capacity plan",
   "Failure triage process with ownership",
   "Merged coverage reporting",
   "Hole analysis and targeted test list",
   "Regression stability and flake elimination record",
   "Published coverage dashboard",
   "Assembled DV closure signoff package"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "DV-D3",
    "produces"
   ],
   [
    "DV-D8",
    "produces"
   ]
  ],
  "ro": "Regression owner"
 },
 "DV-11": {
  "st": "verification",
  "w": [
   28,
   38
  ],
  "s": [
   [
    1,
    "Build the gate-level environment and bring the netlist up",
    1.5
   ],
   [
    2,
    "Run zero-delay functional gate-level simulation",
    2
   ],
   [
    3,
    "Analyze X-propagation and reset initialization",
    2
   ],
   [
    4,
    "Run SDF back-annotated timing simulation",
    2.5,
    1
   ],
   [
    5,
    "Simulate DFT and scan modes",
    2,
    1
   ],
   [
    6,
    "Run power-aware gate-level simulation",
    1.5,
    1
   ],
   [
    7,
    "Debug failures and close the findings",
    4.5
   ]
  ],
  "o": [
   "Gate-level environment with the netlist brought up",
   "Functional gate-level results",
   "X-propagation and reset initialization findings",
   "SDF timing-annotated simulation results",
   "Scan and DFT mode simulation results",
   "Power-aware gate-level simulation results",
   "Gate-level simulation report",
   "Failure debug and closure record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   7
  ],
  "r": [
   [
    "DV-D7",
    "produces"
   ],
   [
    "DV-D8",
    "feeds"
   ]
  ],
  "ro": "Gate-level simulation lead"
 },
 "DV-12": {
  "st": "verification",
  "w": [
   6,
   40
  ],
  "s": [
   [
    1,
    "Define bug tracking, severity and the triage process",
    1.5
   ],
   [
    2,
    "Charter the disposition board and set its membership",
    1
   ],
   [
    3,
    "Run continuous triage and disposition",
    22
   ],
   [
    4,
    "Analyze bug rate and closure trends",
    4,
    1
   ],
   [
    5,
    "Assess the risk of every deferred bug",
    4,
    1
   ],
   [
    6,
    "Run escape analysis on late-found defects",
    3,
    1
   ],
   [
    7,
    "Compile the open bug list and risk statement for tapeout",
    5
   ],
   [
    8,
    "Issue the DV closure recommendation",
    4.5
   ]
  ],
  "o": [
   "Bug tracking and triage process",
   "Disposition board charter and membership",
   "Triage and disposition log",
   "Bug rate and closure trend analysis",
   "Deferred bug risk assessments",
   "Escape analysis findings",
   "Open bug list and risk statement",
   "DV closure recommendation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "DV-D8",
    "feeds"
   ],
   [
    "DV-D3",
    "feeds"
   ]
  ],
  "ro": "Verification lead"
 },
 "DFT-01": {
  "st": "dft",
  "w": [
   0,
   8
  ],
  "s": [
   [
    1,
    "Define the test strategy — what is tested where and how",
    1.5
   ],
   [
    2,
    "Define the scan architecture and chain organization",
    2
   ],
   [
    3,
    "Select the compression architecture and ratio against the cost model",
    1.5
   ],
   [
    4,
    "Partition hierarchical DFT against the design hierarchy",
    1.5,
    1
   ],
   [
    5,
    "Define the test modes and mode control",
    1.5,
    1
   ],
   [
    6,
    "Write the architecture specification and run its review",
    3
   ]
  ],
  "o": [
   "Test strategy statement",
   "Scan architecture and chain organization",
   "Compression architecture and ratio",
   "Hierarchical DFT partitioning",
   "Test mode definition",
   "DFT architecture specification"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "DFT-D1",
    "produces"
   ],
   [
    "DFT-D7",
    "gates"
   ]
  ],
  "ro": "DFT architect"
 },
 "DFT-02": {
  "st": "dft",
  "w": [
   2,
   7
  ],
  "s": [
   [
    1,
    "Translate the DPPM quality target into required coverage",
    1
   ],
   [
    2,
    "Derive the test time budget from the product cost model",
    1
   ],
   [
    3,
    "Select the fault models — stuck-at, transition, cell-aware",
    1,
    1
   ],
   [
    4,
    "Set coverage targets per fault model and per block class",
    1,
    1
   ],
   [
    5,
    "Negotiate the targets and record the agreement",
    3
   ]
  ],
  "o": [
   "Coverage target derived from the DPPM requirement",
   "Test time budget",
   "Fault model selection",
   "Per-block-class coverage targets",
   "Agreed target record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "DFT-D1",
    "feeds"
   ],
   [
    "DFT-D4",
    "feeds"
   ]
  ],
  "ro": "DFT architect"
 },
 "DFT-03": {
  "st": "dft",
  "w": [
   6,
   16
  ],
  "s": [
   [
    1,
    "Inventory the memories and set a test requirement per instance",
    1.5
   ],
   [
    2,
    "Architect MBIST and allocate the engines",
    2.5
   ],
   [
    3,
    "Select test algorithms per memory type",
    1.5,
    1
   ],
   [
    4,
    "Architect the BIRA and repair analysis",
    2
   ],
   [
    5,
    "Integrate BISR and the fuse path with ARCH-07",
    2,
    1
   ],
   [
    6,
    "Agree the repair interface jointly with the memory designers",
    1.5,
    1
   ],
   [
    7,
    "Insert and integrate the MBIST logic",
    2.5
   ],
   [
    8,
    "Verify the architecture and release its specification",
    1.5
   ]
  ],
  "o": [
   "Memory inventory with test requirements",
   "MBIST architecture and engine allocation",
   "Algorithm selection per memory type",
   "BIRA and BISR architecture",
   "Fuse path integration",
   "Repair interface agreement with the memory designers",
   "MBIST insertion and verification results",
   "Verified MBIST architecture specification"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "DFT-D2",
    "produces"
   ],
   [
    "DFT-D1",
    "feeds"
   ]
  ],
  "ro": "DFT memory lead"
 },
 "DFT-04": {
  "st": "dft",
  "w": [
   4,
   12
  ],
  "s": [
   [
    1,
    "Define the access architecture — TAP and IJTAG network topology",
    1.5
   ],
   [
    2,
    "Implement boundary scan per IEEE 1149.1",
    1.5
   ],
   [
    3,
    "Build the IJTAG instrument network and its description files",
    2,
    1
   ],
   [
    4,
    "Define the debug and trace access paths",
    1.5,
    1
   ],
   [
    5,
    "Integrate security lockdown per lifecycle state",
    1.5
   ],
   [
    6,
    "Verify the access network and generate the description files",
    3.5
   ]
  ],
  "o": [
   "TAP and IJTAG network architecture",
   "Boundary scan implementation",
   "Instrument network with ICL and PDL descriptions",
   "BSDL description files",
   "Debug and trace access paths",
   "Lifecycle-state lockdown integration",
   "Access network verification results and description files"
  ],
  "ob": [
   1,
   2,
   3,
   2,
   4,
   5,
   6
  ],
  "r": [
   [
    "DFT-D3",
    "produces"
   ],
   [
    "DFT-D1",
    "feeds"
   ]
  ],
  "ro": "DFT access lead"
 },
 "DFT-05": {
  "st": "dft",
  "w": [
   8,
   15
  ],
  "s": [
   [
    1,
    "Establish the at-speed test requirement per clock domain",
    1
   ],
   [
    2,
    "Architect the OCC and its PLL interface",
    1.5
   ],
   [
    3,
    "Design launch-capture sequencing and pulse control",
    1.5
   ],
   [
    4,
    "Define the multi-domain and cross-domain at-speed strategy",
    1.5,
    1
   ],
   [
    5,
    "Insert and integrate the OCC logic",
    1.5,
    1
   ],
   [
    6,
    "Verify at-speed clocking across the domains",
    3
   ]
  ],
  "o": [
   "At-speed test requirements per domain",
   "OCC architecture and PLL interface",
   "Launch-capture sequencing control",
   "Cross-domain at-speed strategy",
   "Inserted and verified OCC logic",
   "At-speed clocking verification results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "DFT-D1",
    "feeds"
   ],
   [
    "DFT-D4",
    "feeds"
   ]
  ],
  "ro": "DFT engineer, at-speed"
 },
 "DFT-06": {
  "st": "dft",
  "w": [
   14,
   24
  ],
  "s": [
   [
    1,
    "Set up and configure scan insertion",
    1.5
   ],
   [
    2,
    "Insert and stitch the scan chains",
    2
   ],
   [
    3,
    "Insert the compression logic",
    1.5,
    1
   ],
   [
    4,
    "Insert test points for coverage improvement",
    1.5,
    1
   ],
   [
    5,
    "Analyze DFT DRC and close the violations",
    3
   ],
   [
    6,
    "Verify scan chain integrity in simulation",
    1.5,
    1
   ],
   [
    7,
    "Sign off insertion and hand off the netlist",
    3.5
   ]
  ],
  "o": [
   "Scan insertion configuration",
   "Stitched scan chains",
   "Inserted compression logic",
   "Test points for coverage improvement",
   "DFT DRC clean results",
   "Scan chain integrity verification results",
   "Scan-inserted netlist"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DFT-D5",
    "produces"
   ],
   [
    "DFT-D4",
    "feeds"
   ]
  ],
  "ro": "DFT implementation engineer"
 },
 "DFT-07": {
  "st": "dft",
  "w": [
   22,
   38
  ],
  "s": [
   [
    1,
    "Set up ATPG, constraints and test mode configuration",
    2
   ],
   [
    2,
    "Generate stuck-at patterns and analyze coverage",
    3
   ],
   [
    3,
    "Generate transition and at-speed patterns",
    3.5
   ],
   [
    4,
    "Generate cell-aware patterns",
    2.5,
    1
   ],
   [
    5,
    "Analyze untestable faults and justify the coverage",
    2.5,
    1
   ],
   [
    6,
    "Reduce and compact the pattern volume",
    3
   ],
   [
    7,
    "Close coverage against the DFT-02 targets",
    2,
    1
   ],
   [
    8,
    "Assemble and release the pattern sets",
    4.5
   ]
  ],
  "o": [
   "ATPG setup and constraints",
   "Stuck-at pattern set with coverage analysis",
   "Transition and at-speed pattern set",
   "Cell-aware pattern set",
   "Untestable fault analysis",
   "Compacted pattern volumes",
   "Coverage report against targets",
   "Released pattern sets"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "DFT-D4",
    "produces"
   ],
   [
    "DFT-D7",
    "feeds"
   ]
  ],
  "ro": "ATPG engineer"
 },
 "DFT-08": {
  "st": "dft",
  "w": [
   28,
   38
  ],
  "s": [
   [
    1,
    "Set up the pattern simulation environment",
    1.5
   ],
   [
    2,
    "Validate patterns in zero-delay gate-level simulation",
    2
   ],
   [
    3,
    "Simulate patterns with SDF timing annotation",
    2,
    1
   ],
   [
    4,
    "Debug pattern failures and regenerate the affected sets",
    2.5
   ],
   [
    5,
    "Convert patterns to STIL and WGL formats",
    1.5,
    1
   ],
   [
    6,
    "Validate tester format and timing sets against the ATE",
    1.5,
    1
   ],
   [
    7,
    "Release the patterns and sign the DFT tapeout entry",
    4
   ]
  ],
  "o": [
   "Pattern simulation environment",
   "Zero-delay validation results",
   "Timing-annotated pattern simulation results",
   "Regenerated patterns for failures",
   "STIL and WGL format files",
   "Tester format validation results",
   "Released ATE-ready pattern set"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DFT-D6",
    "produces"
   ],
   [
    "DFT-D7",
    "produces"
   ]
  ],
  "ro": "DFT validation engineer"
 },
 "DFT-09": {
  "st": "dft",
  "w": [
   16,
   26
  ],
  "s": [
   [
    1,
    "Analyze chain routing feasibility against the floorplan",
    1.5
   ],
   [
    2,
    "Align the compression network topology to the physical partitions",
    2
   ],
   [
    3,
    "Define the chain ordering and reordering strategy",
    1.5,
    1
   ],
   [
    4,
    "Assess the congestion impact of the test network",
    1.5,
    1
   ],
   [
    5,
    "Confirm test clock distribution feasibility",
    1.5,
    1
   ],
   [
    6,
    "Agree the physical DFT plan with physical design",
    6.5
   ]
  ],
  "o": [
   "Chain routing feasibility findings",
   "Compression topology aligned to physical partitions",
   "Chain ordering and reordering strategy",
   "Congestion impact assessment",
   "Test clock distribution plan",
   "Agreed physical DFT plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "DFT-D1",
    "feeds"
   ],
   [
    "DFT-D5",
    "feeds"
   ]
  ],
  "ro": "DFT physical lead"
 },
 "DFT-10": {
  "st": "dft",
  "w": [
   12,
   18
  ],
  "s": [
   [
    1,
    "Inventory the fuse consumers — repair, trim, ID, lifecycle, security",
    1
   ],
   [
    2,
    "Allocate capacity against the worst-case need",
    1
   ],
   [
    3,
    "Integrate the eFuse array and its programming path",
    1.5,
    1
   ],
   [
    4,
    "Design the fuse read, shadow register and distribution logic",
    1.5
   ],
   [
    5,
    "Define the chip identity and traceability scheme",
    1,
    1
   ],
   [
    6,
    "Agree the lifecycle state encoding with ARCH-07",
    1,
    1
   ],
   [
    7,
    "Verify the fuse infrastructure end to end",
    2.5
   ]
  ],
  "o": [
   "Fuse consumer inventory",
   "Capacity allocation with worst-case margin",
   "eFuse array integration and programming path",
   "Fuse read and distribution logic",
   "Chip identity scheme",
   "Lifecycle state encoding agreed with the security architecture",
   "Verified fuse infrastructure"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "DFT-D2",
    "feeds"
   ],
   [
    "DFT-D3",
    "feeds"
   ]
  ],
  "ro": "Fuse and infrastructure engineer"
 },
 "DFT-11": {
  "st": "dft",
  "w": [
   6,
   14
  ],
  "s": [
   [
    1,
    "Collect debug requirements from validation and design",
    1
   ],
   [
    2,
    "Architect the observability — trace, triggers, snapshot",
    2
   ],
   [
    3,
    "Budget the trace ports and bandwidth",
    1,
    1
   ],
   [
    4,
    "Design the trigger and cross-trigger network",
    1.5,
    1
   ],
   [
    5,
    "Implement internal state snapshot and scan dump capability",
    1.5
   ],
   [
    6,
    "Verify the debug infrastructure and document it for the lab",
    3.5
   ]
  ],
  "o": [
   "Debug requirement list",
   "Observability architecture",
   "Trace port and bandwidth budget",
   "Trigger and cross-trigger network",
   "Scan dump and snapshot capability",
   "Debug infrastructure documentation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "DFT-D3",
    "feeds"
   ],
   [
    "DFT-D1",
    "feeds"
   ]
  ],
  "ro": "DFT debug lead"
 },
 "SYN-01": {
  "st": "synthesis",
  "w": [
   0,
   8
  ],
  "s": [
   [
    1,
    "Enumerate the modes and corners against the operating conditions",
    1.5
   ],
   [
    2,
    "Define clocks and generated clocks across the design",
    2
   ],
   [
    3,
    "Specify exceptions, false paths and multicycle paths",
    1.5,
    1
   ],
   [
    4,
    "Write the IO and interface timing constraints",
    2
   ],
   [
    5,
    "Write the test mode and scan constraints",
    1.5,
    1
   ],
   [
    6,
    "Validate the constraints with quality checking tools",
    2.5
   ]
  ],
  "o": [
   "Mode and corner enumeration",
   "Clock and generated clock definitions",
   "Exception and multicycle specification",
   "IO and interface constraints",
   "Test mode constraints",
   "Constraint validation reports"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SYN-D4",
    "produces"
   ],
   [
    "SYN-D5",
    "feeds"
   ]
  ],
  "ro": "Constraints lead"
 },
 "SYN-02": {
  "st": "synthesis",
  "w": [
   2,
   10
  ],
  "s": [
   [
    1,
    "Select the library and mapping strategy",
    1.5
   ],
   [
    2,
    "Run baseline mapping and optimization",
    2.5
   ],
   [
    3,
    "Optimize datapath and arithmetic structures",
    1.5,
    1
   ],
   [
    4,
    "Configure multi-bit banking and useful skew",
    2
   ],
   [
    5,
    "Recover area on non-critical paths",
    1.5,
    1
   ],
   [
    6,
    "Analyze QoR and iterate the optimization",
    2
   ]
  ],
  "o": [
   "Mapping strategy and library configuration",
   "Baseline mapped netlist",
   "Datapath optimization results",
   "Multi-bit and useful skew configuration",
   "Area recovery results",
   "QoR analysis per iteration"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SYN-D5",
    "feeds"
   ],
   [
    "SYN-D2",
    "feeds"
   ]
  ],
  "ro": "Synthesis lead"
 },
 "SYN-03": {
  "st": "synthesis",
  "w": [
   3,
   7
  ],
  "s": [
   [
    1,
    "Define the N0 scope — what must be representative, what may be stubbed",
    1
   ],
   [
    2,
    "Black-box and stub the incomplete blocks",
    1
   ],
   [
    3,
    "Bootstrap the constraints for N0",
    1,
    1
   ],
   [
    4,
    "Elaborate the netlist and run structural sanity checks",
    1
   ],
   [
    5,
    "Release N0 and hand it over to physical design",
    1
   ]
  ],
  "o": [
   "N0 scope definition — representative versus stubbed",
   "Stub and black-box strategy record",
   "Black-boxed and stubbed netlist",
   "Bootstrap constraint set",
   "Structural sanity check results",
   "Released N0 netlist with a stated limitation list"
  ],
  "ob": [
   1,
   2,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "SYN-D1",
    "produces"
   ],
   [
    "SYN-D8",
    "feeds"
   ]
  ],
  "ro": "Synthesis lead"
 },
 "SYN-04": {
  "st": "synthesis",
  "w": [
   6,
   13
  ],
  "s": [
   [
    1,
    "Set up the physical-aware flow with the floorplan",
    1.5
   ],
   [
    2,
    "Run floorplan-aware mapping and optimization",
    2
   ],
   [
    3,
    "Model macros and blockages in placement",
    1.5,
    1
   ],
   [
    4,
    "Run the congestion feedback loop with physical design",
    2
   ],
   [
    5,
    "Restructure logic in the congested regions",
    1.5,
    1
   ],
   [
    6,
    "Compare QoR against the non-physical synthesis result",
    1.5
   ]
  ],
  "o": [
   "Physical-aware synthesis flow",
   "Floorplan-aware mapped netlist",
   "Macro and blockage aware placement",
   "Congestion feedback findings",
   "Restructured logic in congested regions",
   "QoR comparison against non-physical synthesis"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SYN-D5",
    "feeds"
   ],
   [
    "SYN-D8",
    "feeds"
   ]
  ],
  "ro": "Synthesis engineers"
 },
 "SYN-05": {
  "st": "synthesis",
  "w": [
   8,
   13
  ],
  "s": [
   [
    1,
    "Take in the RTL drop and review the delta against N0",
    1
   ],
   [
    2,
    "Run synthesis and close at block level",
    1.5
   ],
   [
    3,
    "Incorporate the physical design feedback",
    1,
    1
   ],
   [
    4,
    "Analyze the QoR delta against the N0 baseline",
    1.5
   ],
   [
    5,
    "Compile the issue list for the next drop",
    1,
    1
   ],
   [
    6,
    "Release N1 and hand it off to physical design",
    1
   ]
  ],
  "o": [
   "RTL drop intake and delta review",
   "Block-level synthesis closure",
   "Physical design feedback incorporation record",
   "QoR delta analysis against N0",
   "Issue list carried to N2",
   "N1 netlist",
   "Handoff package for PD turn 1"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6
  ],
  "r": [
   [
    "SYN-D2",
    "produces"
   ],
   [
    "SYN-D5",
    "feeds"
   ]
  ],
  "ro": "Synthesis lead"
 },
 "SYN-06": {
  "st": "synthesis",
  "w": [
   9,
   16
  ],
  "s": [
   [
    1,
    "Establish the power analysis baseline and identify hot spots",
    1.5
   ],
   [
    2,
    "Insert clock gating and analyze its efficiency",
    2
   ],
   [
    3,
    "Optimize the Vt mix for leakage",
    1.5,
    1
   ],
   [
    4,
    "Implement operand isolation and datapath gating",
    2
   ],
   [
    5,
    "Re-optimize with real switching activity data",
    1.5,
    1
   ],
   [
    6,
    "Report power QoR against the budget",
    1.5
   ]
  ],
  "o": [
   "Power analysis baseline and hot spots",
   "Clock gating insertion and efficiency report",
   "Vt mix optimization results",
   "Operand isolation implementation",
   "Activity-driven optimization results",
   "Power QoR against budget"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SYN-D5",
    "feeds"
   ],
   [
    "SYN-D7",
    "feeds"
   ]
  ],
  "ro": "Power optimization engineer"
 },
 "SYN-07": {
  "st": "synthesis",
  "w": [
   10,
   15
  ],
  "s": [
   [
    1,
    "Ingest and elaborate the UPF in the synthesis flow",
    1
   ],
   [
    2,
    "Infer and insert isolation cells and level shifters",
    1.5
   ],
   [
    3,
    "Handle always-on and feed-through paths",
    1,
    1
   ],
   [
    4,
    "Insert retention cells and their control",
    1.5
   ],
   [
    5,
    "Check UPF-to-netlist consistency",
    1,
    1
   ],
   [
    6,
    "Write the power intent implementation report",
    1
   ]
  ],
  "o": [
   "Elaborated UPF in the synthesis flow",
   "Inserted isolation and level shifter cells",
   "Always-on path implementation",
   "Retention cell insertion and control logic",
   "UPF-netlist consistency results",
   "Power intent implementation report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SYN-D7",
    "produces"
   ],
   [
    "SYN-D6",
    "feeds"
   ]
  ],
  "ro": "Low-power synthesis engineer"
 },
 "SYN-08": {
  "st": "synthesis",
  "w": [
   14,
   19
  ],
  "s": [
   [
    1,
    "Take in the RTL and ECO changes since N1",
    1
   ],
   [
    2,
    "Run full synthesis with all optimizations enabled",
    1.5
   ],
   [
    3,
    "Assess the impact of late RTL changes",
    1,
    1
   ],
   [
    4,
    "Check congestion and timing convergence",
    1.5
   ],
   [
    5,
    "Incorporate the turn-1 feedback from physical design",
    1,
    1
   ],
   [
    6,
    "Release N2 with a closure risk statement",
    1
   ]
  ],
  "o": [
   "RTL and ECO intake record since N1",
   "N2 netlist with full optimization",
   "Late change impact assessment",
   "Congestion and timing convergence analysis",
   "Turn-1 feedback incorporation record",
   "Closure risk statement"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SYN-D2",
    "produces"
   ],
   [
    "SYN-D5",
    "feeds"
   ]
  ],
  "ro": "Synthesis lead"
 },
 "SYN-09": {
  "st": "synthesis",
  "w": [
   19,
   23
  ],
  "s": [
   [
    1,
    "Confirm RTL freeze and take the final intake",
    0.75
   ],
   [
    2,
    "Run the final synthesis",
    1.25
   ],
   [
    3,
    "Freeze the constraint set",
    1,
    1
   ],
   [
    4,
    "Verify final equivalence and UPF consistency",
    1
   ],
   [
    5,
    "Assemble the handoff package for the final turn",
    0.75,
    1
   ],
   [
    6,
    "Release the FFN and declare functional freeze",
    1
   ]
  ],
  "o": [
   "RTL freeze confirmation",
   "Final synthesis run and netlist",
   "Frozen constraint set",
   "Final equivalence and UPF consistency results",
   "Handoff package for the final turn",
   "FFN release with functional freeze declaration"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SYN-D3",
    "produces"
   ],
   [
    "SYN-D4",
    "gates"
   ],
   [
    "SYN-D8",
    "feeds"
   ]
  ],
  "ro": "Synthesis lead"
 },
 "SYN-10": {
  "st": "synthesis",
  "w": [
   4,
   24
  ],
  "s": [
   [
    1,
    "Set up the equivalence methodology and tools",
    1.5
   ],
   [
    2,
    "Check block-level equivalence per drop",
    2
   ],
   [
    3,
    "Handle black-boxes and constraints for incomplete drops",
    2,
    1
   ],
   [
    4,
    "Check chip-level equivalence per drop",
    3
   ],
   [
    5,
    "Configure DFT and clock gating transformation handling",
    2,
    1
   ],
   [
    6,
    "Debug and resolve the non-equivalences",
    2.5
   ],
   [
    7,
    "Report equivalence results per drop",
    2,
    1
   ],
   [
    8,
    "Run continuous checking across the drop sequence",
    11
   ]
  ],
  "o": [
   "Equivalence methodology and setup",
   "Per-drop block-level equivalence results",
   "Black-box and constraint handling record",
   "Chip-level equivalence results per drop",
   "DFT and clock gating handling configuration",
   "Non-equivalence debug records",
   "Per-drop equivalence reports",
   "Equivalence checking log across the drop sequence"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "SYN-D6",
    "produces"
   ],
   [
    "SYN-D3",
    "gates"
   ]
  ],
  "ro": "Equivalence engineer"
 },
 "SYN-11": {
  "st": "synthesis",
  "w": [
   2,
   24
  ],
  "s": [
   [
    1,
    "Build the reporting framework and ingest the budgets",
    1.5
   ],
   [
    2,
    "Report and analyze timing per drop",
    2
   ],
   [
    3,
    "Compare against budget and apply the escalation rules",
    2,
    1
   ],
   [
    4,
    "Report area and power per drop",
    2
   ],
   [
    5,
    "Analyze trends across the drop sequence",
    2,
    1
   ],
   [
    6,
    "Run continuous reporting across the stage",
    16.5
   ]
  ],
  "o": [
   "Reporting framework with budget ingestion",
   "Per-drop timing reports",
   "Budget comparison per block",
   "Escalation records",
   "Per-drop area and power reports",
   "Trend analysis across drops",
   "Reporting log across the stage"
  ],
  "ob": [
   1,
   2,
   3,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SYN-D5",
    "produces"
   ],
   [
    "SYN-D2",
    "feeds"
   ]
  ],
  "ro": "PPA reporting engineer"
 },
 "SYN-12": {
  "st": "synthesis",
  "w": [
   2,
   24
  ],
  "s": [
   [
    1,
    "Define the handoff package contents and format",
    1
   ],
   [
    2,
    "Assemble the package for each drop",
    1.5
   ],
   [
    3,
    "Agree acceptance criteria with physical design",
    1.5,
    1
   ],
   [
    4,
    "Review the QoR delta with physical design per drop",
    1.5
   ],
   [
    5,
    "Track issues between drops",
    1.5,
    1
   ],
   [
    6,
    "Run the continuous handoff across the drop sequence",
    18
   ]
  ],
  "o": [
   "Handoff package definition and format",
   "Per-drop handoff package",
   "Acceptance criteria agreed with PD",
   "QoR delta review records",
   "Issue tracking between drops",
   "Handoff log across the drop sequence"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SYN-D8",
    "produces"
   ],
   [
    "SYN-D2",
    "feeds"
   ]
  ],
  "ro": "Synthesis lead"
 },
 "PD-01": {
  "st": "physicalDesign",
  "w": [
   0,
   7
  ],
  "s": [
   [
    1,
    "Define the flow scope and build the script framework",
    1.5
   ],
   [
    2,
    "Build the MMMC environment across corners and modes",
    2
   ],
   [
    3,
    "Integrate the scripts, decks and libraries",
    1.5,
    1
   ],
   [
    4,
    "Run N0 through the flow end to end",
    2
   ],
   [
    5,
    "Define the hierarchical and block-level flows",
    1.5,
    1
   ],
   [
    6,
    "Measure the runtime baseline and assess capacity",
    1.5
   ]
  ],
  "o": [
   "Physical design script framework",
   "MMMC environment across corners and modes",
   "Integrated decks and libraries",
   "N0 end-to-end run results",
   "Hierarchical flow definition",
   "Runtime baseline and capacity assessment"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PD-D1",
    "produces"
   ],
   [
    "PD-D5",
    "feeds"
   ]
  ],
  "ro": "Physical design flow lead"
 },
 "PD-02": {
  "st": "physicalDesign",
  "w": [
   5,
   14
  ],
  "s": [
   [
    1,
    "Define the partitions against the design hierarchy",
    2
   ],
   [
    2,
    "Place the macros — memories, PHYs, analog",
    2.5
   ],
   [
    3,
    "Plan standard cell area and set utilization targets",
    2,
    1
   ],
   [
    4,
    "Plan the block boundaries and pin placement",
    2
   ],
   [
    5,
    "Define the keep-outs, blockages and halos",
    1.5,
    1
   ],
   [
    6,
    "Review the floorplan and freeze it",
    2.5
   ]
  ],
  "o": [
   "Partition definition",
   "Macro placement",
   "Area and utilization plan",
   "Block boundaries and pin placement",
   "Keep-out and blockage definition",
   "Frozen floorplan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PD-D4",
    "produces"
   ],
   [
    "PD-D2",
    "feeds"
   ]
  ],
  "ro": "Floorplan owner"
 },
 "PD-03": {
  "st": "physicalDesign",
  "w": [
   6,
   14
  ],
  "s": [
   [
    1,
    "Define the PDN topology and grid per domain",
    1.5
   ],
   [
    2,
    "Implement the grid and insert the straps",
    2
   ],
   [
    3,
    "Plan the power switches and always-on regions",
    1.5,
    1
   ],
   [
    4,
    "Run early static IR analysis on the placed design",
    2
   ],
   [
    5,
    "Plan and place the decap",
    1.5,
    1
   ],
   [
    6,
    "Refine the PDN and freeze it",
    2.5
   ]
  ],
  "o": [
   "PDN topology and grid definition",
   "Implemented grid and straps",
   "Power switch and always-on plan",
   "Early static IR analysis results",
   "Decap plan",
   "Frozen PDN specification"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PD-D4",
    "produces"
   ],
   [
    "PD-D5",
    "feeds"
   ]
  ],
  "ro": "Power delivery engineer"
 },
 "PD-04": {
  "st": "physicalDesign",
  "w": [
   6,
   14
  ],
  "s": [
   [
    1,
    "Ingest the bump map from the architecture budget",
    1.5
   ],
   [
    2,
    "Plan the RDL and redistribution",
    2
   ],
   [
    3,
    "Assign the power bumps and rails",
    1.5,
    1
   ],
   [
    4,
    "Iterate the co-design with package design",
    2
   ],
   [
    5,
    "Plan the signal escape with the substrate",
    1.5,
    1
   ],
   [
    6,
    "Freeze the bump map and release the interface files",
    2.5
   ]
  ],
  "o": [
   "Ingested bump map",
   "RDL and redistribution plan",
   "Bump map with signal and power assignment",
   "Power bump and rail assignment",
   "Package co-design iteration record",
   "Signal escape plan with the substrate",
   "Frozen bump map and package interface files"
  ],
  "ob": [
   1,
   2,
   3,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PD-D7",
    "produces"
   ],
   [
    "PD-D4",
    "feeds"
   ]
  ],
  "ro": "Bump and RDL owner"
 },
 "PD-05": {
  "st": "physicalDesign",
  "w": [
   8,
   16
  ],
  "s": [
   [
    1,
    "Take in N1 and set up the turn",
    1
   ],
   [
    2,
    "Place and optimize the design",
    2
   ],
   [
    3,
    "Analyze congestion and apply mitigation",
    1.5,
    1
   ],
   [
    4,
    "Synthesize the first-pass clock trees",
    2
   ],
   [
    5,
    "Analyze timing and run the first ECO round",
    1.5,
    1
   ],
   [
    6,
    "Run the first full route",
    2
   ],
   [
    7,
    "Analyze power on the placed and routed design",
    1.5,
    1
   ],
   [
    8,
    "Establish the QoR baseline and feed findings back to synthesis",
    1
   ]
  ],
  "o": [
   "N1 intake and turn setup",
   "Placed and optimized N1 database",
   "Congestion analysis and mitigation results",
   "First-pass clock trees",
   "First-round timing analysis and ECOs",
   "First full route",
   "Turn 1 placed and routed database",
   "Turn-1 power analysis results",
   "QoR baseline",
   "Feedback list to synthesis and RTL"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   7,
   8,
   8
  ],
  "r": [
   [
    "PD-D2",
    "produces"
   ],
   [
    "PD-D5",
    "feeds"
   ]
  ],
  "ro": "Physical design turn lead"
 },
 "PD-06": {
  "st": "physicalDesign",
  "w": [
   14,
   22
  ],
  "s": [
   [
    1,
    "Take in N2 and assess the delta against turn 1",
    1
   ],
   [
    2,
    "Place with congestion mitigation",
    2
   ],
   [
    3,
    "Restructure congestion hot spots with synthesis",
    1.5,
    1
   ],
   [
    4,
    "Refine the clock trees",
    2
   ],
   [
    5,
    "Converge timing through ECO rounds",
    1.5,
    1
   ],
   [
    6,
    "Converge the route",
    2
   ],
   [
    7,
    "Converge power and IR",
    1.5,
    1
   ],
   [
    8,
    "Quantify the closure risk for the final turn",
    1
   ]
  ],
  "o": [
   "N2 intake and delta assessment",
   "Placement with congestion mitigation",
   "Congestion mitigation and restructuring results",
   "Refined clock trees",
   "Timing convergence and ECO record",
   "Converged route",
   "Power and IR convergence results",
   "Turn 2 placed and routed database",
   "Closure risk quantification"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   8
  ],
  "r": [
   [
    "PD-D2",
    "produces"
   ],
   [
    "PD-D5",
    "feeds"
   ]
  ],
  "ro": "Physical design turn lead"
 },
 "PD-07": {
  "st": "physicalDesign",
  "w": [
   10,
   22
  ],
  "s": [
   [
    1,
    "Plan the clock architecture implementation",
    1.5
   ],
   [
    2,
    "Synthesize the clock trees per domain",
    2.5
   ],
   [
    3,
    "Optimize clock power",
    2,
    1
   ],
   [
    4,
    "Balance skew and insertion delay",
    2.5
   ],
   [
    5,
    "Manage the jitter and OCV budgets",
    2,
    1
   ],
   [
    6,
    "Handle cross-domain relationships and useful skew",
    2.5
   ],
   [
    7,
    "Run clock DRC and quality checks",
    2,
    1
   ],
   [
    8,
    "Refine the trees continuously across turns",
    3
   ]
  ],
  "o": [
   "Clock architecture implementation plan",
   "Per-domain clock tree build configuration",
   "Synthesized clock trees per domain",
   "Clock power optimization results",
   "Skew and insertion delay results",
   "Jitter and OCV budget records",
   "Cross-domain and useful skew handling",
   "Clock DRC and quality reports",
   "Clock tree refinement record across turns"
  ],
  "ob": [
   1,
   2,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "PD-D5",
    "feeds"
   ],
   [
    "PD-D2",
    "feeds"
   ]
  ],
  "ro": "Clock tree engineer"
 },
 "PD-08": {
  "st": "physicalDesign",
  "w": [
   12,
   28
  ],
  "s": [
   [
    1,
    "Define the routing strategy and layer plan",
    1.5
   ],
   [
    2,
    "Run global routing and assess congestion",
    3
   ],
   [
    3,
    "Run congestion-driven rip-up and reroute",
    2.5,
    1
   ],
   [
    4,
    "Run detailed routing",
    3.5
   ],
   [
    5,
    "Optimize antennas and vias",
    2.5,
    1
   ],
   [
    6,
    "Converge DRC to clean",
    4
   ],
   [
    7,
    "Check routing quality and manufacturability",
    2.5,
    1
   ],
   [
    8,
    "Route continuously across turns",
    4
   ]
  ],
  "o": [
   "Routing strategy and layer plan",
   "Global routing and congestion assessment",
   "Congestion resolution records",
   "Globally and detail-routed database",
   "Antenna and via optimization results",
   "DRC convergence results",
   "Routing quality and manufacturability findings",
   "Routing record across turns"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "PD-D6",
    "produces"
   ],
   [
    "PD-D3",
    "feeds"
   ]
  ],
  "ro": "Routing lead"
 },
 "PD-09": {
  "st": "physicalDesign",
  "w": [
   8,
   30
  ],
  "s": [
   [
    1,
    "Set up timing and define the MMMC scenarios",
    1.5
   ],
   [
    2,
    "Close setup timing",
    3
   ],
   [
    3,
    "Track and report the violation burn-down",
    3,
    1
   ],
   [
    4,
    "Close hold timing",
    3
   ],
   [
    5,
    "Generate and apply timing ECOs",
    3,
    1
   ],
   [
    6,
    "Converge across corners and modes",
    3.5
   ],
   [
    7,
    "Correlate against the signoff timing flow",
    3,
    1
   ],
   [
    8,
    "Run continuous closure across turns",
    11
   ]
  ],
  "o": [
   "MMMC timing scenarios",
   "Setup timing closure results",
   "Violation burn-down tracking",
   "Hold timing closure results",
   "Timing ECOs",
   "Cross-corner convergence results",
   "Signoff correlation findings",
   "Closure record across turns"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "PD-D5",
    "produces"
   ],
   [
    "PD-D3",
    "feeds"
   ]
  ],
  "ro": "Timing closure lead"
 },
 "PD-10": {
  "st": "physicalDesign",
  "w": [
   16,
   26
  ],
  "s": [
   [
    1,
    "Set up SI and run the crosstalk analysis",
    1.5
   ],
   [
    2,
    "Fix crosstalk — spacing, shielding, buffer sizing",
    2.5
   ],
   [
    3,
    "Analyze noise and glitches",
    2,
    1
   ],
   [
    4,
    "Analyze and fix electromigration",
    2.5
   ],
   [
    5,
    "Iterate dynamic IR with the PDN",
    2,
    1
   ],
   [
    6,
    "Iterate SI and PI to closure",
    3.5
   ]
  ],
  "o": [
   "SI setup and crosstalk analysis",
   "Crosstalk fixes — spacing, shielding, sizing",
   "Noise and glitch analysis results",
   "Post-fix crosstalk re-analysis results",
   "EM analysis and routing fixes",
   "Dynamic IR results and PDN adjustments",
   "SI and PI closure records"
  ],
  "ob": [
   1,
   2,
   3,
   2,
   4,
   5,
   6
  ],
  "r": [
   [
    "PD-D6",
    "feeds"
   ],
   [
    "PD-D5",
    "feeds"
   ]
  ],
  "ro": "SI/PI engineer"
 },
 "PD-11": {
  "st": "physicalDesign",
  "w": [
   14,
   19
  ],
  "s": [
   [
    1,
    "Define the power model requirements with SIPI",
    1
   ],
   [
    2,
    "Extract the CPM per domain and operating mode",
    1.5
   ],
   [
    3,
    "Select the switching scenarios for the extraction",
    1,
    1
   ],
   [
    4,
    "Validate the model against internal IR analysis",
    1.5
   ],
   [
    5,
    "Hand the model off under version control",
    1
   ]
  ],
  "o": [
   "Power model requirement definition",
   "Chip power model per domain and mode",
   "Switching scenario selection record",
   "Model validation against internal IR",
   "Versioned model handoff"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "PD-D4",
    "feeds"
   ],
   [
    "PD-D7",
    "feeds"
   ]
  ],
  "ro": "Power modeling engineer"
 },
 "PD-12": {
  "st": "physicalDesign",
  "w": [
   16,
   22
  ],
  "s": [
   [
    1,
    "Analyze the physical scan chains and their routing cost",
    1
   ],
   [
    2,
    "Reorder the chains for routing efficiency",
    1.5
   ],
   [
    3,
    "Preserve the diagnosis mapping through the reorder",
    1,
    1
   ],
   [
    4,
    "Route and shield the test paths DFT-aware",
    1.5
   ],
   [
    5,
    "Route the test clocks and manage their skew",
    1,
    1
   ],
   [
    6,
    "Verify the chains after the reorder",
    2
   ]
  ],
  "o": [
   "Chain routing cost analysis",
   "Reordered scan chains",
   "Diagnosis mapping record",
   "DFT-aware routing and shielding",
   "Test clock routing",
   "Post-reorder chain verification results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PD-D6",
    "feeds"
   ],
   [
    "PD-D3",
    "feeds"
   ]
  ],
  "ro": "DFT physical engineer"
 },
 "PD-13": {
  "st": "physicalDesign",
  "w": [
   19,
   30
  ],
  "s": [
   [
    1,
    "Take in the FFN and assess the delta against N2",
    1
   ],
   [
    2,
    "Place the final netlist",
    2
   ],
   [
    3,
    "Enforce ECO-only change discipline and gatekeeping",
    1.5,
    1
   ],
   [
    4,
    "Synthesize the final clock trees",
    2
   ],
   [
    5,
    "Converge power and IR finally",
    2,
    1
   ],
   [
    6,
    "Run the final routing",
    2.5
   ],
   [
    7,
    "Converge DRC and LVS",
    2,
    1
   ],
   [
    8,
    "Close final timing across all corners and modes",
    2
   ],
   [
    9,
    "Report closure and disposition the remaining violations",
    1.5,
    1
   ],
   [
    10,
    "Freeze the database and hand it to signoff",
    1.5
   ]
  ],
  "o": [
   "FFN intake and delta assessment",
   "Placement on the final netlist",
   "ECO discipline records",
   "Final clock tree",
   "Final power and IR convergence results",
   "Final placed, clocked and routed database",
   "DRC and LVS clean results",
   "Final timing closure across corners and modes",
   "Closure report with remaining-violation disposition",
   "Frozen signoff-ready database"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "r": [
   [
    "PD-D3",
    "produces"
   ],
   [
    "PD-D5",
    "feeds"
   ]
  ],
  "ro": "Physical design lead"
 },
 "PD-14": {
  "st": "physicalDesign",
  "w": [
   12,
   30
  ],
  "s": [
   [
    1,
    "Set up the ECO flow and methodology",
    1.5
   ],
   [
    2,
    "Build the functional ECO implementation capability",
    2.5
   ],
   [
    3,
    "Assess and track the impact of each ECO",
    2,
    1
   ],
   [
    4,
    "Implement the timing ECOs",
    2.5
   ],
   [
    5,
    "Establish the spare cell and metal-only ECO strategy",
    2,
    1
   ],
   [
    6,
    "Operate the ECO machinery continuously across turns",
    11.5
   ]
  ],
  "o": [
   "ECO flow and methodology",
   "Functional ECO implementation capability",
   "Impact assessment and tracking records",
   "Timing ECO implementation",
   "Spare cell and metal-only strategy",
   "ECO log across turns"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PD-D8",
    "produces"
   ],
   [
    "PD-D3",
    "feeds"
   ]
  ],
  "ro": "ECO lead"
 },
 "PD-15": {
  "st": "physicalDesign",
  "w": [
   24,
   29
  ],
  "s": [
   [
    1,
    "Implement the seal ring and die edge",
    1
   ],
   [
    2,
    "Apply metal fill to density compliance",
    1
   ],
   [
    3,
    "Analyze the fill impact on timing and extraction",
    1,
    1
   ],
   [
    4,
    "Place alignment marks, logos and die identification",
    1.5
   ],
   [
    5,
    "Apply dummy fill and meet CMP compliance",
    1,
    1
   ],
   [
    6,
    "Verify the finishing against the closed database",
    1.5
   ]
  ],
  "o": [
   "Seal ring and die edge implementation",
   "Metal fill meeting density rules",
   "Fill timing impact analysis",
   "Alignment marks and die identification",
   "Dummy and CMP compliance",
   "Finishing verification results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PD-D3",
    "feeds"
   ],
   [
    "PD-D6",
    "feeds"
   ]
  ],
  "ro": "Chip finishing engineer"
 },
 "PD-16": {
  "st": "physicalDesign",
  "w": [
   14,
   28
  ],
  "s": [
   [
    1,
    "Define the block closure criteria and handoff",
    1.5
   ],
   [
    2,
    "Close the blocks at block level",
    3
   ],
   [
    3,
    "Set inter-block timing budgets and close the interfaces",
    2.5,
    1
   ],
   [
    4,
    "Generate the block abstracts and timing models",
    3
   ],
   [
    5,
    "Manage top-level routing and feedthroughs",
    2.5,
    1
   ],
   [
    6,
    "Assemble the top level",
    3
   ],
   [
    7,
    "Correlate hierarchical timing — block model against flat",
    2,
    1
   ],
   [
    8,
    "Verify the top-level integration",
    3.5
   ]
  ],
  "o": [
   "Block closure criteria",
   "Block-level closure results",
   "Inter-block timing budgets",
   "Block abstracts and timing models",
   "Top-level routing and feedthroughs",
   "Assembled top level",
   "Hierarchical timing correlation results",
   "Assembled and verified top level"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "PD-D9",
    "produces"
   ],
   [
    "PD-D3",
    "feeds"
   ]
  ],
  "ro": "Hierarchical closure lead"
 },
 "SO-01": {
  "st": "signoff",
  "w": [
   0,
   6
  ],
  "s": [
   [
    1,
    "Assemble the signoff flow and integrate the decks",
    1.5
   ],
   [
    2,
    "Run the dry run on the turn 2 database",
    2
   ],
   [
    3,
    "Measure runtime and capacity",
    1,
    1
   ],
   [
    4,
    "Build the violation triage process and tooling",
    1,
    1
   ],
   [
    5,
    "Resolve the flow issues and record the rehearsal findings",
    2.5
   ]
  ],
  "o": [
   "Assembled signoff flow with integrated decks",
   "Dry run results on turn 2",
   "Runtime and capacity measurements",
   "Violation triage process and tooling",
   "Rehearsal findings and flow fixes"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "SO-D7",
    "feeds"
   ],
   [
    "SO-D1",
    "feeds"
   ]
  ],
  "ro": "Signoff lead"
 },
 "SO-02": {
  "st": "signoff",
  "w": [
   5,
   15
  ],
  "s": [
   [
    1,
    "Set up signoff STA on the final database",
    1.5
   ],
   [
    2,
    "Analyze setup timing across all corners and modes",
    2.5
   ],
   [
    3,
    "Analyze hold timing across all corners and modes",
    2,
    1
   ],
   [
    4,
    "Triage violations and classify root causes",
    2.5
   ],
   [
    5,
    "Iterate ECOs with physical design",
    2,
    1
   ],
   [
    6,
    "Sign off cross-mode and test-mode timing",
    2,
    1
   ],
   [
    7,
    "Close timing signoff and disposition the waivers",
    3.5
   ]
  ],
  "o": [
   "Signoff STA setup",
   "Setup timing analysis across corners and modes",
   "Hold timing analysis across corners and modes",
   "Violation triage with root causes",
   "ECO requests to physical design",
   "Test-mode timing signoff",
   "Timing signoff reports and waiver list"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "SO-D1",
    "produces"
   ],
   [
    "SO-D7",
    "feeds"
   ]
  ],
  "ro": "STA signoff lead"
 },
 "SO-03": {
  "st": "signoff",
  "w": [
   6,
   15
  ],
  "s": [
   [
    1,
    "Set up full-chip DRC and the hierarchical run strategy",
    1.5
   ],
   [
    2,
    "Execute full-chip DRC and triage the violations",
    3
   ],
   [
    3,
    "Verify and fix antennas",
    2,
    1
   ],
   [
    4,
    "Execute LVS and debug the mismatches",
    2.5
   ],
   [
    5,
    "Verify density and fill",
    1.5,
    1
   ],
   [
    6,
    "Close physical verification and prepare the waivers",
    2
   ]
  ],
  "o": [
   "DRC run strategy and results",
   "Full-chip DRC results with triaged violations",
   "Antenna verification and fixes",
   "LVS results and mismatch resolution",
   "Density and fill verification",
   "Physical verification clean reports and waiver candidates"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SO-D2",
    "produces"
   ],
   [
    "SO-D7",
    "feeds"
   ]
  ],
  "ro": "Physical verification lead"
 },
 "SO-04": {
  "st": "signoff",
  "w": [
   7,
   15
  ],
  "s": [
   [
    1,
    "Set up EM/IR and define the activity scenarios",
    1.5
   ],
   [
    2,
    "Analyze and close static IR drop",
    2
   ],
   [
    3,
    "Analyze dynamic IR under realistic switching",
    2,
    1
   ],
   [
    4,
    "Analyze electromigration on power and signal nets",
    2
   ],
   [
    5,
    "Assess the IR-aware timing impact",
    1.5,
    1
   ],
   [
    6,
    "Close EM/IR and disposition the waivers",
    2.5
   ]
  ],
  "o": [
   "EM/IR setup and activity scenarios",
   "Static IR analysis and closure",
   "Dynamic IR results under real switching",
   "EM analysis on power and signal nets",
   "IR-aware timing impact assessment",
   "EM/IR signoff reports"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SO-D3",
    "produces"
   ],
   [
    "SO-D1",
    "feeds"
   ]
  ],
  "ro": "EM/IR signoff lead"
 },
 "SO-05": {
  "st": "signoff",
  "w": [
   9,
   15
  ],
  "s": [
   [
    1,
    "Set up SI signoff and extract the coupling",
    1
   ],
   [
    2,
    "Analyze crosstalk delay and its timing impact",
    1.5
   ],
   [
    3,
    "Analyze noise and glitches",
    1.5,
    1
   ],
   [
    4,
    "Run victim-aggressor analysis on the critical nets",
    1.5
   ],
   [
    5,
    "Reconcile the power integrity signoff",
    1,
    1
   ],
   [
    6,
    "Close SI signoff and report",
    2
   ]
  ],
  "o": [
   "SI signoff setup and coupling extraction",
   "Crosstalk delay analysis and timing impact",
   "Noise and glitch analysis results",
   "Victim-aggressor findings on critical nets",
   "Power integrity signoff reconciliation",
   "SI signoff report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SO-D3",
    "produces"
   ],
   [
    "SO-D1",
    "feeds"
   ]
  ],
  "ro": "SI signoff engineer"
 },
 "SO-06": {
  "st": "signoff",
  "w": [
   11,
   15
  ],
  "s": [
   [
    1,
    "Take in the SIPI results and confirm the scope",
    0.75
   ],
   [
    2,
    "Reconcile die-only against system-level IR",
    1.25
   ],
   [
    3,
    "Review channel compliance against the interface budgets",
    1,
    1
   ],
   [
    4,
    "Review the power-aware timing correlation",
    1,
    1
   ],
   [
    5,
    "Review the co-verification signoff and disposition the criteria",
    2
   ]
  ],
  "o": [
   "SIPI result intake record",
   "Die-only against system-level reconciliation",
   "Channel compliance review findings",
   "Power-aware timing correlation review",
   "Co-verification signoff disposition"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "SO-D3",
    "feeds"
   ],
   [
    "SO-D7",
    "feeds"
   ]
  ],
  "ro": "Signoff lead"
 },
 "SO-07": {
  "st": "signoff",
  "w": [
   8,
   14
  ],
  "s": [
   [
    1,
    "Collect the reliability requirements and set up the rules",
    1
   ],
   [
    2,
    "Verify ESD paths through the full chip",
    1.5
   ],
   [
    3,
    "Verify latch-up structures and guard rings",
    1.5,
    1
   ],
   [
    4,
    "Estimate the soft error rate and FIT",
    1.5,
    1
   ],
   [
    5,
    "Close reliability and disposition the waivers",
    3.5
   ]
  ],
  "o": [
   "Reliability requirements and rule setup",
   "Full-chip ESD path verification results",
   "Latch-up and guard ring verification",
   "Soft error rate and FIT estimate",
   "Reliability signoff report and waivers"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "SO-D4",
    "produces"
   ],
   [
    "SO-D7",
    "feeds"
   ]
  ],
  "ro": "Reliability signoff engineer"
 },
 "SO-08": {
  "st": "signoff",
  "w": [
   8,
   14
  ],
  "s": [
   [
    1,
    "Set up the DFM decks and confirm the model versions",
    1
   ],
   [
    2,
    "Detect and analyze lithography hotspots",
    1.5
   ],
   [
    3,
    "Simulate CMP and density",
    1.5,
    1
   ],
   [
    4,
    "Score recommended rule compliance",
    1.5,
    1
   ],
   [
    5,
    "Fix the hotspots and close DFM",
    3.5
   ]
  ],
  "o": [
   "DFM deck setup and model versions",
   "Litho hotspot analysis results",
   "CMP and density simulation results",
   "Recommended rule compliance score",
   "Hotspot fixes and DFM closure report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "SO-D5",
    "produces"
   ],
   [
    "SO-D2",
    "feeds"
   ]
  ],
  "ro": "DFM engineer"
 },
 "SO-09": {
  "st": "signoff",
  "w": [
   10,
   15
  ],
  "s": [
   [
    1,
    "Set up final equivalence against the FFN and the RTL",
    1
   ],
   [
    2,
    "Prove RTL to final netlist equivalence",
    1.5
   ],
   [
    3,
    "Reconcile every difference against the ECO log",
    1,
    1
   ],
   [
    4,
    "Confirm netlist to layout consistency",
    1,
    1
   ],
   [
    5,
    "Resolve the non-equivalences and issue the final report",
    2.5
   ]
  ],
  "o": [
   "Final equivalence setup",
   "RTL to final netlist equivalence results",
   "ECO reconciliation record",
   "Netlist to layout consistency confirmation",
   "Final equivalence report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "SO-D6",
    "produces"
   ],
   [
    "SO-D7",
    "gates"
   ]
  ],
  "ro": "Equivalence engineer"
 },
 "SO-10": {
  "st": "signoff",
  "w": [
   10,
   16
  ],
  "s": [
   [
    1,
    "Take in and classify waivers across all signoff domains",
    1
   ],
   [
    2,
    "Establish root cause and quantify risk per waiver",
    1.5
   ],
   [
    3,
    "Align and submit the foundry waivers",
    1.5,
    1
   ],
   [
    4,
    "Run the board review and disposition each waiver",
    1.5
   ],
   [
    5,
    "Write the residual risk statement",
    1,
    1
   ],
   [
    6,
    "Assemble the signoff summary and Design Freeze package",
    2
   ]
  ],
  "o": [
   "Classified waiver intake across signoff domains",
   "Root cause and risk quantification per waiver",
   "Consolidated waiver register",
   "Foundry waiver submissions and responses",
   "Board disposition records",
   "Residual risk statement",
   "Signoff summary and Design Freeze package"
  ],
  "ob": [
   1,
   2,
   1,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SO-D7",
    "produces"
   ],
   [
    "SO-D1",
    "feeds"
   ]
  ],
  "ro": "Signoff lead"
 },
 "SO-11": {
  "st": "signoff",
  "w": [
   10,
   15
  ],
  "s": [
   [
    1,
    "Generate the final SDF and set up the simulation",
    1
   ],
   [
    2,
    "Run timing-annotated functional simulation",
    1.5
   ],
   [
    3,
    "Simulate the reset and initialization sequences",
    1,
    1
   ],
   [
    4,
    "Simulate the test modes with final timing",
    1,
    1
   ],
   [
    5,
    "Debug the failures and report the signoff",
    2.5
   ]
  ],
  "o": [
   "Final SDF and simulation setup",
   "Timing-annotated functional simulation results",
   "Reset and initialization results",
   "Test mode simulation results",
   "Gate-level signoff report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "SO-D7",
    "feeds"
   ],
   [
    "SO-D1",
    "feeds"
   ]
  ],
  "ro": "Gate-level simulation engineer"
 },
 "SO-12": {
  "st": "signoff",
  "w": [
   2,
   7
  ],
  "s": [
   [
    1,
    "Define the correlation methodology and select reference cases",
    1
   ],
   [
    2,
    "Correlate the implementation tool against the signoff tool",
    1.5
   ],
   [
    3,
    "Correlate against the foundry decks and derates",
    1,
    1
   ],
   [
    4,
    "Correlate extraction and parasitics",
    1,
    1
   ],
   [
    5,
    "Publish the correlation findings and margin guidance",
    2.5
   ]
  ],
  "o": [
   "Correlation methodology and reference cases",
   "Implementation to signoff correlation results",
   "Foundry deck and derate correlation",
   "Extraction and parasitic correlation",
   "Margin guidance for physical design"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "SO-D1",
    "feeds"
   ],
   [
    "SO-D7",
    "feeds"
   ]
  ],
  "ro": "Signoff methodology engineer"
 },
 "TO-01": {
  "st": "tapeout",
  "w": [
   0,
   2
  ],
  "s": [
   [
    1,
    "Take in the closure database and check its provenance",
    0.5
   ],
   [
    2,
    "Stream out the GDSII / OASIS from the closed database",
    0.75
   ],
   [
    3,
    "Merge the macro and hard IP GDS",
    0.5,
    1
   ],
   [
    4,
    "Verify the layer map against the foundry definition",
    0.75
   ]
  ],
  "o": [
   "Database checksum and provenance record",
   "Streamed GDSII / OASIS database",
   "Merged macro and hard IP GDS",
   "Layer-verified merged database",
   "Layer map verification record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   4
  ],
  "r": [
   [
    "TO-D1",
    "produces"
   ],
   [
    "TO-D2",
    "feeds"
   ]
  ],
  "ro": "Tapeout engineer"
 },
 "TO-02": {
  "st": "tapeout",
  "w": [
   0,
   2
  ],
  "s": [
   [
    1,
    "Set up verification on the released database",
    0.5
   ],
   [
    2,
    "Re-run full-chip DRC",
    0.75
   ],
   [
    3,
    "Re-check density and fill",
    0.5,
    1
   ],
   [
    4,
    "Re-run LVS and antenna",
    0.75
   ],
   [
    5,
    "Confirm the checksums against the released database",
    0.5,
    1
   ]
  ],
  "o": [
   "Verification setup on the released database",
   "Full-chip DRC re-run results",
   "Density and fill confirmation",
   "LVS and antenna re-run results",
   "Checksum confirmation record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "TO-D1",
    "feeds"
   ],
   [
    "TO-D2",
    "feeds"
   ]
  ],
  "ro": "Physical verification engineer"
 },
 "TO-03": {
  "st": "tapeout",
  "w": [
   0,
   3
  ],
  "s": [
   [
    1,
    "Assemble the checklist per domain",
    0.75
   ],
   [
    2,
    "Collect the evidence for each item",
    1
   ],
   [
    3,
    "Chase the gaps and escalate them",
    0.75,
    1
   ],
   [
    4,
    "Collect the owner signoffs",
    1.25
   ]
  ],
  "o": [
   "Assembled tapeout checklist",
   "Evidence attached per item",
   "Gap and escalation log",
   "Owner signoff matrix"
  ],
  "ob": [
   1,
   2,
   3,
   4
  ],
  "r": [
   [
    "TO-D2",
    "produces"
   ],
   [
    "TO-D4",
    "gates"
   ]
  ],
  "ro": "Program manager"
 },
 "TO-04": {
  "st": "tapeout",
  "w": [
   1,
   3
  ],
  "s": [
   [
    1,
    "Consolidate open items across design, verification and test",
    0.5
   ],
   [
    2,
    "Classify each risk and assess its consequence",
    0.75
   ],
   [
    3,
    "Identify mitigation options per item",
    0.5,
    1
   ],
   [
    4,
    "Accept each risk and assign its owner",
    0.75
   ]
  ],
  "o": [
   "Consolidated open item list",
   "Risk classification with consequences",
   "Mitigation options per item",
   "Risk acceptance record with named owners"
  ],
  "ob": [
   1,
   2,
   3,
   4
  ],
  "r": [
   [
    "TO-D3",
    "produces"
   ],
   [
    "TO-D4",
    "feeds"
   ]
  ],
  "ro": "Program manager"
 },
 "TO-05": {
  "st": "tapeout",
  "w": [
   1.5,
   2
  ],
  "s": [
   [
    1,
    "Present the decision pack — checklist, risks, readiness",
    0.2
   ],
   [
    2,
    "Take the decision and capture conditions and dissent",
    0.2
   ],
   [
    3,
    "Issue the minutes and assign the conditions",
    0.1
   ]
  ],
  "o": [
   "Decision pack",
   "Go / No-Go decision with conditions",
   "Dissent record",
   "Minutes and condition assignments"
  ],
  "ob": [
   1,
   2,
   2,
   3
  ],
  "r": [
   [
    "TO-D4",
    "produces"
   ],
   [
    "TO-D5",
    "gates"
   ]
  ],
  "ro": "Executive sponsor"
 },
 "TO-06": {
  "st": "tapeout",
  "w": [
   2,
   3.5
  ],
  "s": [
   [
    1,
    "Select the FEOL layers and prepare the data",
    0.5
   ],
   [
    2,
    "Hand off mask data preparation — fracture, OPC scope",
    0.5
   ],
   [
    3,
    "Submit to the foundry and confirm acceptance",
    0.5
   ]
  ],
  "o": [
   "FEOL layer data set",
   "Mask data preparation handoff package",
   "Submission record and foundry acceptance"
  ],
  "ob": [
   1,
   2,
   3
  ],
  "r": [
   [
    "TO-D5",
    "produces"
   ],
   [
    "TO-D1",
    "feeds"
   ]
  ],
  "ro": "Tapeout engineer"
 },
 "TO-07": {
  "st": "tapeout",
  "w": [
   3,
   4
  ],
  "s": [
   [
    1,
    "Confirm the mask order and purchase authorization",
    0.4
   ],
   [
    2,
    "Confirm the mask shop schedule",
    0.3
   ],
   [
    3,
    "Communicate the delivery date to the program",
    0.3
   ]
  ],
  "o": [
   "Confirmed mask order",
   "Mask shop schedule with completion date",
   "Delivery date communication to the program"
  ],
  "ob": [
   1,
   2,
   3
  ],
  "r": [
   [
    "TO-D5",
    "feeds"
   ],
   [
    "TO-D8",
    "feeds"
   ]
  ],
  "ro": "Procurement"
 },
 "TO-08": {
  "st": "tapeout",
  "w": [
   2,
   6
  ],
  "s": [
   [
    1,
    "Set the fix window scope and admission rules",
    0.5
   ],
   [
    2,
    "Implement the metal-layer ECOs",
    1.5
   ],
   [
    3,
    "Prioritize the fixes and assess their risk",
    1,
    1
   ],
   [
    4,
    "Verify each ECO",
    1
   ],
   [
    5,
    "Run equivalence and consistency checks per fix",
    1,
    1
   ],
   [
    6,
    "Close the window and freeze the BEOL database",
    1
   ]
  ],
  "o": [
   "Fix window scope and admission rules",
   "Implemented metal-layer ECOs",
   "Fix prioritization and risk record",
   "Per-fix verification results",
   "Per-fix equivalence and consistency results",
   "Frozen BEOL database"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TO-D6",
    "produces"
   ],
   [
    "TO-D7",
    "feeds"
   ]
  ],
  "ro": "Physical design lead"
 },
 "TO-09": {
  "st": "tapeout",
  "w": [
   3.5,
   6
  ],
  "s": [
   [
    1,
    "Decide the re-verification scope from what the fixes touched",
    0.5
   ],
   [
    2,
    "Verify DRC and antenna on the metal stack",
    1
   ],
   [
    3,
    "Confirm the timing impact of the applied fixes",
    0.75,
    1
   ],
   [
    4,
    "Re-check LVS and density",
    1
   ]
  ],
  "o": [
   "Re-verification scope decision",
   "DRC and antenna results on the metal stack",
   "Timing impact confirmation",
   "LVS and density re-check results"
  ],
  "ob": [
   1,
   2,
   3,
   4
  ],
  "r": [
   [
    "TO-D7",
    "feeds"
   ],
   [
    "TO-D6",
    "feeds"
   ]
  ],
  "ro": "Physical verification engineer"
 },
 "TO-10": {
  "st": "tapeout",
  "w": [
   6,
   7.5
  ],
  "s": [
   [
    1,
    "Prepare the BEOL layer data from the re-verified database",
    0.5
   ],
   [
    2,
    "Hand off mask data preparation",
    0.5
   ],
   [
    3,
    "Submit to the foundry and confirm acceptance",
    0.5
   ]
  ],
  "o": [
   "BEOL layer data set",
   "Mask data preparation handoff package",
   "Submission record and foundry acceptance"
  ],
  "ob": [
   1,
   2,
   3
  ],
  "r": [
   [
    "TO-D7",
    "produces"
   ],
   [
    "TO-D6",
    "feeds"
   ]
  ],
  "ro": "Tapeout engineer"
 },
 "TO-11": {
  "st": "tapeout",
  "w": [
   7,
   8
  ],
  "s": [
   [
    1,
    "Confirm the BEOL mask order",
    0.4
   ],
   [
    2,
    "Track the full mask set to completion",
    0.3
   ],
   [
    3,
    "Communicate mask availability to fabrication",
    0.3
   ]
  ],
  "o": [
   "Confirmed BEOL mask order",
   "Full mask set completion tracking",
   "Mask availability communication to fabrication"
  ],
  "ob": [
   1,
   2,
   3
  ],
  "r": [
   [
    "TO-D8",
    "produces"
   ],
   [
    "TO-D7",
    "feeds"
   ]
  ],
  "ro": "Procurement"
 },
 "FAB-01": {
  "st": "fabrication",
  "w": [
   0,
   7
  ],
  "s": [
   [
    1,
    "Confirm mask data acceptance and mask data preparation",
    1
   ],
   [
    2,
    "Track FEOL mask writing",
    3
   ],
   [
    3,
    "Prepare pellicles and handling",
    1.5,
    1
   ],
   [
    4,
    "Review mask inspection and defect repair results",
    2
   ],
   [
    5,
    "Disposition mask defects and take remake decisions",
    1,
    1
   ],
   [
    6,
    "Qualify the mask set and release it to the line",
    1
   ]
  ],
  "o": [
   "Mask data preparation acceptance",
   "Written FEOL mask set",
   "Pellicle and handling preparation record",
   "Inspection results per layer",
   "Defect disposition decisions",
   "Qualified mask set released to the line"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "FAB-D1",
    "produces"
   ],
   [
    "FAB-D5",
    "feeds"
   ]
  ],
  "ro": "Foundry liaison"
 },
 "FAB-02": {
  "st": "fabrication",
  "w": [
   7,
   8
  ],
  "s": [
   [
    1,
    "Authorize wafer start and define the lots",
    0.4
   ],
   [
    2,
    "Decide the starting material and lot split strategy",
    0.3
   ],
   [
    3,
    "Confirm the start and communicate the schedule",
    0.3
   ]
  ],
  "o": [
   "Wafer start authorization",
   "Lot definition with split strategy",
   "Start confirmation and schedule communication"
  ],
  "ob": [
   1,
   2,
   3
  ],
  "r": [
   [
    "FAB-D2",
    "feeds"
   ],
   [
    "FAB-D5",
    "feeds"
   ]
  ],
  "ro": "Operations planner"
 },
 "FAB-03": {
  "st": "fabrication",
  "w": [
   4,
   10
  ],
  "s": [
   [
    1,
    "Confirm BEOL mask data acceptance and preparation",
    0.5
   ],
   [
    2,
    "Track BEOL mask writing",
    2.5
   ],
   [
    3,
    "Disposition defects on the inspected layers",
    1.5,
    1
   ],
   [
    4,
    "Track inspection and qualification",
    2
   ],
   [
    5,
    "Release the masks to the line ahead of metallization",
    1
   ]
  ],
  "o": [
   "BEOL mask data acceptance",
   "Written BEOL mask set",
   "Qualified BEOL mask set",
   "Inspection and defect disposition results",
   "BEOL mask inspection and qualification results",
   "BEOL masks released to the line"
  ],
  "ob": [
   1,
   2,
   4,
   3,
   4,
   5
  ],
  "r": [
   [
    "FAB-D1",
    "produces"
   ],
   [
    "FAB-D5",
    "feeds"
   ]
  ],
  "ro": "Foundry liaison"
 },
 "FAB-04": {
  "st": "fabrication",
  "w": [
   7,
   15
  ],
  "s": [
   [
    1,
    "Confirm lot release and front-end entry",
    1
   ],
   [
    2,
    "Track the wafers through transistor formation",
    3
   ],
   [
    3,
    "Monitor inline data at the front-end critical steps",
    2,
    1
   ],
   [
    4,
    "Track the wafers through contact and local interconnect",
    3
   ],
   [
    5,
    "Respond to excursions and disposition the lots",
    1.5,
    1
   ],
   [
    6,
    "Confirm front-end exit and hand off to the back end",
    1
   ]
  ],
  "o": [
   "Lot release and front-end entry confirmation",
   "Wafers through transistor formation",
   "Inline monitoring findings at critical steps",
   "Wafers through contact and local interconnect",
   "Excursion responses and lot dispositions",
   "Front-end-complete wafers",
   "Front-end exit confirmation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6
  ],
  "r": [
   [
    "FAB-D2",
    "feeds"
   ],
   [
    "FAB-D3",
    "feeds"
   ]
  ],
  "ro": "Foundry liaison"
 },
 "FAB-05": {
  "st": "fabrication",
  "w": [
   14,
   19
  ],
  "s": [
   [
    1,
    "Confirm back-end entry and BEOL mask availability",
    0.5
   ],
   [
    2,
    "Track the wafers through metallization and via formation",
    2
   ],
   [
    3,
    "Monitor back-end inline data",
    1.5,
    1
   ],
   [
    4,
    "Track the wafers through top metal and passivation",
    1.5
   ],
   [
    5,
    "Confirm wafer completion and lot exit",
    1
   ]
  ],
  "o": [
   "Back-end entry and mask availability confirmation",
   "Wafers through metallization and via formation",
   "Back-end inline monitoring findings",
   "Wafers through top metal and passivation",
   "Completed engineering-lot wafers",
   "Wafer count confirmation against the downstream requirement",
   "Lot exit confirmation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   5,
   5
  ],
  "r": [
   [
    "FAB-D2",
    "produces"
   ],
   [
    "FAB-D3",
    "feeds"
   ]
  ],
  "ro": "Foundry liaison"
 },
 "FAB-06": {
  "st": "fabrication",
  "w": [
   5,
   19
  ],
  "s": [
   [
    1,
    "Build the monitoring plan and select the critical steps",
    1
   ],
   [
    2,
    "Review the inline metrology data",
    2
   ],
   [
    3,
    "Detect excursions and escalate them",
    2,
    1
   ],
   [
    4,
    "Review and classify the defect inspection results",
    2
   ],
   [
    5,
    "Build the defect Pareto and attribute sources",
    2,
    1
   ],
   [
    6,
    "Monitor continuously across the lot",
    9
   ]
  ],
  "o": [
   "Monitoring plan with critical step selection",
   "Inline metrology review findings",
   "Excursion detections and escalations",
   "Reviewed and classified defect inspection results",
   "Defect Pareto",
   "Source attribution findings",
   "Inline monitoring log across the lot"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   5,
   6
  ],
  "r": [
   [
    "FAB-D3",
    "produces"
   ],
   [
    "FAB-D4",
    "feeds"
   ]
  ],
  "ro": "Yield engineer"
 },
 "FAB-07": {
  "st": "fabrication",
  "w": [
   15,
   18
  ],
  "s": [
   [
    1,
    "Confirm the PCM structure and parameter list",
    0.5
   ],
   [
    2,
    "Collect and review the e-test data",
    1
   ],
   [
    3,
    "Analyze across-wafer and lot-to-lot variability",
    1,
    1
   ],
   [
    4,
    "Compare the parameters against target and model",
    1.5
   ]
  ],
  "o": [
   "PCM parameter list and structures",
   "E-test data review",
   "Across-wafer and lot variability analysis",
   "Parameter comparison against model and target"
  ],
  "ob": [
   1,
   2,
   3,
   4
  ],
  "r": [
   [
    "FAB-D3",
    "produces"
   ],
   [
    "FAB-D4",
    "feeds"
   ]
  ],
  "ro": "Device engineer"
 },
 "FAB-08": {
  "st": "fabrication",
  "w": [
   16,
   19
  ],
  "s": [
   [
    1,
    "Confirm the acceptance criteria with the foundry",
    0.5
   ],
   [
    2,
    "Execute WAT and review the data",
    1
   ],
   [
    3,
    "Escalate out-of-specification results with the foundry",
    0.75,
    1
   ],
   [
    4,
    "Take the lot disposition and release decision",
    1.5
   ]
  ],
  "o": [
   "Confirmed acceptance criteria",
   "WAT execution results",
   "Out-of-specification escalation record",
   "Lot disposition and release decision"
  ],
  "ob": [
   1,
   2,
   3,
   4
  ],
  "r": [
   [
    "FAB-D4",
    "produces"
   ],
   [
    "FAB-D2",
    "gates"
   ]
  ],
  "ro": "Product engineering"
 },
 "FAB-09": {
  "st": "fabrication",
  "w": [
   1,
   19
  ],
  "s": [
   [
    1,
    "Set up WIP tracking and the reporting cadence",
    1
   ],
   [
    2,
    "Manage the hot-lot priority",
    2
   ],
   [
    3,
    "Escalate schedule deviations",
    2,
    1
   ],
   [
    4,
    "Maintain the wafer-out forecast",
    2
   ],
   [
    5,
    "Communicate the forecast to downstream stages",
    2,
    1
   ],
   [
    6,
    "Track continuously across the run",
    13
   ]
  ],
  "o": [
   "WIP tracking and reporting cadence",
   "Hot-lot priority management record",
   "Schedule deviation escalations",
   "Wafer-out forecast, maintained",
   "Forecast communications to downstream stages",
   "WIP tracking log across the run"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "FAB-D5",
    "produces"
   ],
   [
    "FAB-D6",
    "feeds"
   ]
  ],
  "ro": "Program manager"
 },
 "FAB-10": {
  "st": "fabrication",
  "w": [
   17,
   19
  ],
  "s": [
   [
    1,
    "Plan the shipment and prepare the documentation",
    0.5
   ],
   [
    2,
    "Handle customs and export control",
    0.75
   ],
   [
    3,
    "Deliver to sort and assembly and declare First Silicon",
    0.75
   ]
  ],
  "o": [
   "Shipment plan and documentation",
   "Customs and export clearance",
   "Delivery confirmation to sort and assembly",
   "First Silicon availability notice"
  ],
  "ob": [
   1,
   2,
   3,
   3
  ],
  "r": [
   [
    "FAB-D6",
    "produces"
   ],
   [
    "FAB-D2",
    "feeds"
   ]
  ],
  "ro": "Operations planner"
 },
 "PKGD-01": {
  "st": "packageDesign",
  "w": [
   0,
   8
  ],
  "s": [
   [
    1,
    "Consolidate the package requirements — die size, power, interfaces, thermal",
    1.5
   ],
   [
    2,
    "Define the architecture options — interposer, bridge, organic",
    2
   ],
   [
    3,
    "Screen capability and capacity per option",
    1.5,
    1
   ],
   [
    4,
    "Study substrate construction and layer count",
    2
   ],
   [
    5,
    "Compare cost per option with the DEF-04 model",
    1.5,
    1
   ],
   [
    6,
    "Select the architecture and issue its specification",
    2.5
   ]
  ],
  "o": [
   "Package requirement consolidation",
   "Defined package architecture options",
   "Capability assessment per option",
   "Capacity screen per option",
   "Substrate construction study",
   "Cost comparison",
   "Package architecture specification"
  ],
  "ob": [
   1,
   2,
   3,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PKGD-D1",
    "produces"
   ],
   [
    "PKGD-D7",
    "feeds"
   ]
  ],
  "ro": "Package architect"
 },
 "PKGD-02": {
  "st": "packageDesign",
  "w": [
   8,
   18
  ],
  "s": [
   [
    1,
    "Define the bump pitch and field against the architecture",
    2
   ],
   [
    2,
    "Derive the power-to-signal ratio from the power envelope",
    1.5
   ],
   [
    3,
    "Assign signal bumps per interface",
    2,
    1
   ],
   [
    4,
    "Check escape feasibility against the substrate",
    2
   ],
   [
    5,
    "Iterate die-side placement with physical design",
    2,
    1
   ],
   [
    6,
    "Converge the bump map and hand it off",
    4.5
   ]
  ],
  "o": [
   "Bump pitch and field definition",
   "Power-to-signal ratio",
   "Signal bump assignment per interface",
   "Escape feasibility findings",
   "Die-side placement iteration record",
   "Converged bump map"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PKGD-D2",
    "produces"
   ],
   [
    "PKGD-D4",
    "feeds"
   ]
  ],
  "ro": "Package designer"
 },
 "PKGD-03": {
  "st": "packageDesign",
  "w": [
   16,
   30
  ],
  "s": [
   [
    1,
    "Plan the interposer layer stack and routing resource",
    2
   ],
   [
    2,
    "Route the HBM channels with length management",
    4
   ],
   [
    3,
    "Route the die-to-die and remaining signals",
    3,
    1
   ],
   [
    4,
    "Design the power and ground distribution on the interposer",
    3
   ],
   [
    5,
    "Route the RDL and plan the vias",
    2.5,
    1
   ],
   [
    6,
    "Run interposer DRC and manufacturability checks",
    2.5,
    1
   ],
   [
    7,
    "Release the interposer database",
    5
   ]
  ],
  "o": [
   "Interposer layer stack and routing plan",
   "Routed HBM channels with length management",
   "Die-to-die and signal routing",
   "Interposer power distribution",
   "RDL routing and via plan",
   "Interposer DRC and manufacturability results",
   "Released interposer database"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "PKGD-D2",
    "produces"
   ],
   [
    "PKGD-D4",
    "feeds"
   ]
  ],
  "ro": "Interposer designer"
 },
 "PKGD-04": {
  "st": "packageDesign",
  "w": [
   18,
   32
  ],
  "s": [
   [
    1,
    "Define the stack-up and decide the layer count",
    2
   ],
   [
    2,
    "Route the escape from the interposer footprint",
    4
   ],
   [
    3,
    "Design the power and ground planes",
    3,
    1
   ],
   [
    4,
    "Assign the board-side balls and breakout",
    3
   ],
   [
    5,
    "Plan the via structures and drills",
    2.5,
    1
   ],
   [
    6,
    "Run package DRC against the supplier rules",
    2.5,
    1
   ],
   [
    7,
    "Release the substrate database",
    5
   ]
  ],
  "o": [
   "Substrate stack-up and layer count",
   "Escape routing from the interposer",
   "Power and ground plane design",
   "Board-side ball assignment",
   "Via and drill plan",
   "Package DRC results against supplier rules",
   "Released substrate database"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "PKGD-D3",
    "produces"
   ],
   [
    "PKGD-D7",
    "feeds"
   ]
  ],
  "ro": "Substrate designer"
 },
 "PKGD-05": {
  "st": "packageDesign",
  "w": [
   26,
   36
  ],
  "s": [
   [
    1,
    "Allocate the channel budget to the package",
    1.5
   ],
   [
    2,
    "Match lengths and control skew per interface",
    2.5
   ],
   [
    3,
    "Design reference plane continuity and return paths",
    2,
    1
   ],
   [
    4,
    "Design the via structures and manage the stubs",
    2
   ],
   [
    5,
    "Separate and shield against crosstalk",
    2,
    1
   ],
   [
    6,
    "Review the routing against the SI requirements",
    4
   ]
  ],
  "o": [
   "Channel budget allocation to the package",
   "Length-matched routing per interface",
   "Reference plane continuity design",
   "Via structures with managed stubs",
   "Crosstalk separation plan",
   "SI routing review record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PKGD-D4",
    "produces"
   ],
   [
    "PKGD-D3",
    "feeds"
   ]
  ],
  "ro": "SI engineer"
 },
 "PKGD-06": {
  "st": "packageDesign",
  "w": [
   28,
   37
  ],
  "s": [
   [
    1,
    "Define the package PDN topology and plane allocation",
    2
   ],
   [
    2,
    "Design the power via arrays and current capability",
    2
   ],
   [
    3,
    "Place the decoupling capacitor footprints",
    1.5,
    1
   ],
   [
    4,
    "Analyze plane perforation and manage the current paths",
    2
   ],
   [
    5,
    "Design the interposer-to-substrate power transition",
    1.5,
    1
   ],
   [
    6,
    "Hand the PDN design intent to co-verification",
    3
   ]
  ],
  "o": [
   "Package PDN topology and plane allocation",
   "Power via array design",
   "Decoupling footprint placement",
   "Plane perforation and current path analysis",
   "Interposer to substrate power transition design",
   "PDN design intent handoff"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PKGD-D4",
    "produces"
   ],
   [
    "PKGD-D3",
    "feeds"
   ]
  ],
  "ro": "Package power integrity engineer"
 },
 "PKGD-07": {
  "st": "packageDesign",
  "w": [
   20,
   32
  ],
  "s": [
   [
    1,
    "Build the thermal model — die, interposer, substrate, lid",
    2
   ],
   [
    2,
    "Run steady-state thermal simulation and estimate Rjc",
    2.5
   ],
   [
    3,
    "Analyze hotspots and transient thermal behavior",
    2,
    1
   ],
   [
    4,
    "Select the TIM and study interface resistance",
    2,
    1
   ],
   [
    5,
    "Simulate warpage across the reflow profile",
    3
   ],
   [
    6,
    "Analyze mechanical stress and co-planarity",
    2,
    1
   ],
   [
    7,
    "Issue the thermal and mechanical design recommendations",
    4.5
   ]
  ],
  "o": [
   "Thermal model of the package stack",
   "Steady-state thermal results and Rjc estimate",
   "Hotspot and transient analysis",
   "TIM selection and interface study",
   "Warpage simulation across reflow",
   "Mechanical stress and co-planarity results",
   "Thermal and mechanical design recommendations"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "r": [
   [
    "PKGD-D5",
    "produces"
   ],
   [
    "PKGD-D6",
    "feeds"
   ]
  ],
  "ro": "Thermal engineer"
 },
 "PKGD-08": {
  "st": "packageDesign",
  "w": [
   10,
   14
  ],
  "s": [
   [
    1,
    "Identify the package risks the vehicles must cover",
    1
   ],
   [
    2,
    "Define the vehicle type requirements — mechanical, thermal, electrical",
    1.5,
    1
   ],
   [
    3,
    "Specify the measurement conditions and structures",
    1.5
   ],
   [
    4,
    "Hand off the requirements and review the PTV plan",
    1.5
   ]
  ],
  "o": [
   "Package risk list for vehicle coverage",
   "Vehicle type requirements",
   "Measurement conditions and structure specification",
   "Requirement handoff to PTV"
  ],
  "ob": [
   1,
   2,
   3,
   4
  ],
  "r": [
   [
    "PKGD-D6",
    "produces"
   ],
   [
    "PKGD-D5",
    "feeds"
   ]
  ],
  "ro": "Package architect"
 },
 "PKGD-09": {
  "st": "packageDesign",
  "w": [
   22,
   32
  ],
  "s": [
   [
    1,
    "Screen the supplier long-list for capability",
    1.5
   ],
   [
    2,
    "Assess design rule and technology fit",
    2
   ],
   [
    3,
    "Confirm capacity and lead time",
    2,
    1
   ],
   [
    4,
    "Negotiate the commercial terms and pricing",
    2,
    1
   ],
   [
    5,
    "Select the supplier and set the qualification plan",
    2.5
   ],
   [
    6,
    "Place the purchase order and book the lead time",
    4
   ]
  ],
  "o": [
   "Supplier capability screen",
   "Design rule and technology fit assessment",
   "Capacity and lead time confirmation",
   "Commercial terms",
   "Supplier selection and qualification plan",
   "Purchase order with committed lead time"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PKGD-D7",
    "produces"
   ],
   [
    "PKGD-D3",
    "feeds"
   ]
  ],
  "ro": "Backend supply chain lead"
 },
 "PKGD-10": {
  "st": "packageDesign",
  "w": [
   24,
   33
  ],
  "s": [
   [
    1,
    "Screen OSAT capability for the package architecture",
    1.5
   ],
   [
    2,
    "Define the assembly process flow",
    2
   ],
   [
    3,
    "Specify the bonding, underfill and molding parameters",
    2,
    1
   ],
   [
    4,
    "Agree the known-good-die handoff and responsibility model",
    1.5,
    1
   ],
   [
    5,
    "Select the OSAT and commit the capacity",
    2
   ],
   [
    6,
    "Close the assembly agreement and process freeze plan",
    3.5
   ]
  ],
  "o": [
   "OSAT capability screen",
   "Assembly process flow definition",
   "Process parameter specification",
   "Known-good-die responsibility model",
   "OSAT selection and capacity commitment",
   "Assembly agreement"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PKGD-D8",
    "produces"
   ],
   [
    "PKGD-D5",
    "feeds"
   ]
  ],
  "ro": "Backend supply chain lead"
 },
 "PKGD-11": {
  "st": "packageDesign",
  "w": [
   46,
   52
  ],
  "s": [
   [
    1,
    "Review design completeness across interposer and substrate",
    1
   ],
   [
    2,
    "Run final package DRC and supplier rule compliance",
    1.5
   ],
   [
    3,
    "Confirm the electrical intent against the SIPI findings",
    1,
    1
   ],
   [
    4,
    "Release the tooling and manufacturing data",
    1.5
   ],
   [
    5,
    "Run the supplier design review and obtain acceptance",
    1.5,
    1
   ],
   [
    6,
    "Declare the design freeze and release the order",
    2
   ]
  ],
  "o": [
   "Design completeness review record",
   "Final package DRC results",
   "Electrical intent confirmation",
   "Released tooling and manufacturing data",
   "Supplier acceptance record",
   "Package Design Freeze declaration"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PKGD-D9",
    "produces"
   ],
   [
    "PKGD-D7",
    "gates"
   ]
  ],
  "ro": "Package architect"
 },
 "PTV-01": {
  "st": "packageTestVehicle",
  "w": [
   0,
   6
  ],
  "s": [
   [
    1,
    "Take in the risks from package design and previous programs",
    1
   ],
   [
    2,
    "Prioritize the risks against product impact",
    1.5
   ],
   [
    3,
    "Define the evidence that would retire each risk",
    1.5,
    1
   ],
   [
    4,
    "Allocate a vehicle type to each risk",
    1.5
   ],
   [
    5,
    "Check schedule feasibility against the wafer-out gate",
    1,
    1
   ],
   [
    6,
    "Write the vehicle plan and risk coverage matrix",
    2
   ]
  ],
  "o": [
   "Risk intake from package design and previous programs",
   "Package risk list with product impact",
   "Evidence definition per risk",
   "Vehicle type allocation",
   "Schedule feasibility finding",
   "Test vehicle plan and risk coverage matrix"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D1",
    "produces"
   ],
   [
    "PTV-D9",
    "feeds"
   ]
  ],
  "ro": "PTV lead"
 },
 "PTV-02": {
  "st": "packageTestVehicle",
  "w": [
   5,
   14
  ],
  "s": [
   [
    1,
    "Define the mechanical representativeness requirements",
    1.5
   ],
   [
    2,
    "Design the dummy die and die stack",
    2
   ],
   [
    3,
    "Design a bump array representative of the product",
    2,
    1
   ],
   [
    4,
    "Design the interposer and substrate coupons",
    2.5
   ],
   [
    5,
    "Integrate the measurement features — strain, reference marks",
    1.5,
    1
   ],
   [
    6,
    "Release the MTV design",
    3
   ]
  ],
  "o": [
   "Mechanical representativeness requirements",
   "Dummy die and stack design",
   "Representative bump array",
   "Interposer and substrate coupon design",
   "Measurement feature integration",
   "Released MTV design"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D2",
    "produces"
   ],
   [
    "PTV-D4",
    "feeds"
   ]
  ],
  "ro": "Mechanical engineer"
 },
 "PTV-03": {
  "st": "packageTestVehicle",
  "w": [
   5,
   14
  ],
  "s": [
   [
    1,
    "Translate the power map into heater zones",
    1.5
   ],
   [
    2,
    "Design the heater array and its drive requirements",
    2
   ],
   [
    3,
    "Place the RTD and temperature sensors",
    2,
    1
   ],
   [
    4,
    "Integrate the TTV die with the interposer",
    2.5
   ],
   [
    5,
    "Define the sensor calibration approach",
    1.5,
    1
   ],
   [
    6,
    "Release the TTV design",
    3
   ]
  ],
  "o": [
   "Heater zone map from the power distribution",
   "Heater array design and drive requirements",
   "Sensor placement plan",
   "TTV die and interposer integration",
   "Sensor calibration approach",
   "Released TTV design"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D2",
    "produces"
   ],
   [
    "PTV-D6",
    "feeds"
   ]
  ],
  "ro": "Thermal engineer"
 },
 "PTV-04": {
  "st": "packageTestVehicle",
  "w": [
   6,
   14
  ],
  "s": [
   [
    1,
    "Inventory the interconnect levels — bump, TSV, via, ball",
    1
   ],
   [
    2,
    "Design the daisy chain topology and segmentation",
    2
   ],
   [
    3,
    "Design Kelvin structures for resistance measurement",
    1.5,
    1
   ],
   [
    4,
    "Map each chain to its physical location for defect localization",
    1.5
   ],
   [
    5,
    "Design the probe and measurement access",
    1.5,
    1
   ],
   [
    6,
    "Release the daisy-chain vehicle design",
    3.5
   ]
  ],
  "o": [
   "Interconnect level inventory",
   "Daisy chain topology with segmentation",
   "Kelvin resistance structures",
   "Chain-to-location mapping",
   "Probe and measurement access design",
   "Released daisy-chain vehicle design"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D2",
    "produces"
   ],
   [
    "PTV-D3",
    "feeds"
   ]
  ],
  "ro": "Package test engineer"
 },
 "PTV-05": {
  "st": "packageTestVehicle",
  "w": [
   14,
   30
  ],
  "s": [
   [
    1,
    "Plan the vehicle build and define the quantities",
    1.5
   ],
   [
    2,
    "Fabricate the TV die — dummy, TTV and daisy-chain",
    6
   ],
   [
    3,
    "Build the interposer vehicles",
    5,
    1
   ],
   [
    4,
    "Build the substrate vehicles",
    5.5
   ],
   [
    5,
    "Run incoming inspection and qualify the materials",
    2.5,
    1
   ],
   [
    6,
    "Confirm material readiness for assembly",
    3
   ]
  ],
  "o": [
   "Vehicle build plan with quantities",
   "Fabricated TV die",
   "Interposer vehicles",
   "Substrate vehicle build record",
   "Substrate vehicles",
   "Incoming inspection records",
   "Materials ready for assembly"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D3",
    "produces"
   ],
   [
    "PTV-D9",
    "feeds"
   ]
  ],
  "ro": "PTV lead"
 },
 "PTV-06": {
  "st": "packageTestVehicle",
  "w": [
   28,
   39
  ],
  "s": [
   [
    1,
    "Design the DOE across the assembly parameters",
    1.5
   ],
   [
    2,
    "Bond and die-attach across the conditions",
    2.5
   ],
   [
    3,
    "Underfill and cure across the conditions",
    2,
    1
   ],
   [
    4,
    "Mold and attach lids and TIM",
    2
   ],
   [
    5,
    "Inspect inline during assembly — X-ray, CSAM",
    2,
    1
   ],
   [
    6,
    "Maintain assembly travelers with condition traceability",
    2,
    1
   ],
   [
    7,
    "Release the assembled lots to characterization",
    5
   ]
  ],
  "o": [
   "Assembly DOE design",
   "Bonded vehicles across conditions",
   "Underfilled and cured vehicles",
   "Molded and lidded vehicles",
   "Inline inspection results",
   "Assembly travelers with condition traceability",
   "Assembled units across conditions",
   "Assembled lots released to characterization"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   7
  ],
  "r": [
   [
    "PTV-D3",
    "produces"
   ],
   [
    "PTV-D8",
    "feeds"
   ]
  ],
  "ro": "Assembly process engineer"
 },
 "PTV-07": {
  "st": "packageTestVehicle",
  "w": [
   38,
   45
  ],
  "s": [
   [
    1,
    "Set up the measurement — shadow moiré or equivalent",
    1
   ],
   [
    2,
    "Measure the room-temperature baseline across units",
    1.5
   ],
   [
    3,
    "Measure warpage across the reflow profile",
    2
   ],
   [
    4,
    "Measure co-planarity and ball flatness",
    1.5,
    1
   ],
   [
    5,
    "Correlate condition to warpage from the DOE",
    1.5,
    1
   ],
   [
    6,
    "Compare the results against the PKGD-07 simulation",
    2.5
   ]
  ],
  "o": [
   "Measurement setup and method",
   "Room-temperature warpage baseline",
   "Warpage across the reflow profile",
   "Co-planarity and ball flatness results",
   "Condition correlation from the DOE",
   "Simulation comparison"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D4",
    "produces"
   ],
   [
    "PTV-D8",
    "feeds"
   ]
  ],
  "ro": "Mechanical engineer"
 },
 "PTV-08": {
  "st": "packageTestVehicle",
  "w": [
   37,
   48
  ],
  "s": [
   [
    1,
    "Plan the CPI stress evaluation and select the structures",
    1.5
   ],
   [
    2,
    "Apply the thermal cycling stress",
    3
   ],
   [
    3,
    "Inspect bump and BEOL integrity",
    2.5,
    1
   ],
   [
    4,
    "Detect low-k and ULK cracks",
    2.5
   ],
   [
    5,
    "Cross-section and analyze the affected units",
    2,
    1
   ],
   [
    6,
    "Compile the CPI assessment with its design implications",
    4
   ]
  ],
  "o": [
   "CPI evaluation plan and structure selection",
   "Thermal cycling stress results",
   "Bump and BEOL integrity findings",
   "ULK crack detection results",
   "Cross-section and failure analysis",
   "CPI assessment with design implications"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D5",
    "produces"
   ],
   [
    "PTV-D9",
    "feeds"
   ]
  ],
  "ro": "Reliability engineer"
 },
 "PTV-09": {
  "st": "packageTestVehicle",
  "w": [
   38,
   47
  ],
  "s": [
   [
    1,
    "Set up the thermal measurement and calibrate the sensors",
    1.5
   ],
   [
    2,
    "Measure steady-state Rjc and Rja",
    2
   ],
   [
    3,
    "Map hotspots across the heater zones",
    2,
    1
   ],
   [
    4,
    "Study TIM performance and bond line",
    2
   ],
   [
    5,
    "Measure the transient thermal response",
    1.5,
    1
   ],
   [
    6,
    "Correlate the results against the PKGD-07 thermal model",
    3.5
   ]
  ],
  "o": [
   "Thermal measurement setup and calibration",
   "Rjc and Rja measurements",
   "Hotspot maps across zones",
   "TIM performance and bond line results",
   "Transient thermal response",
   "Model correlation results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D6",
    "produces"
   ],
   [
    "PTV-D8",
    "feeds"
   ]
  ],
  "ro": "Thermal engineer"
 },
 "PTV-10": {
  "st": "packageTestVehicle",
  "w": [
   36,
   50
  ],
  "s": [
   [
    1,
    "Plan the board-level tests and design the coupon boards",
    2
   ],
   [
    2,
    "Fabricate the coupon boards and mount the vehicles",
    2.5
   ],
   [
    3,
    "Run temperature cycling to failure",
    4
   ],
   [
    4,
    "Run drop and shock testing",
    2.5,
    1
   ],
   [
    5,
    "Run bend and flex testing",
    2,
    1
   ],
   [
    6,
    "Analyze the failure modes and establish characteristic life",
    5.5
   ]
  ],
  "o": [
   "Board-level test plan and coupon boards",
   "Mounted vehicle assemblies",
   "Temperature cycling results to failure",
   "Drop and shock results",
   "Bend and flex results",
   "Failure mode analysis and characteristic life"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D7",
    "produces"
   ],
   [
    "PTV-D9",
    "feeds"
   ]
  ],
  "ro": "Reliability engineer"
 },
 "PTV-11": {
  "st": "packageTestVehicle",
  "w": [
   39,
   48
  ],
  "s": [
   [
    1,
    "Set up the continuity test and measurement plan",
    1
   ],
   [
    2,
    "Measure chain continuity across the units",
    2
   ],
   [
    3,
    "Measure Kelvin resistance on the interconnects",
    1.5,
    1
   ],
   [
    4,
    "Localize failures from the chain segmentation",
    2
   ],
   [
    5,
    "Correlate condition to yield from the DOE",
    1.5,
    1
   ],
   [
    6,
    "Compile the yield learning and feed it back to the process",
    4
   ]
  ],
  "o": [
   "Continuity test setup and plan",
   "Chain continuity results across units",
   "Kelvin resistance measurements",
   "Failure localization findings",
   "Condition-to-yield correlation",
   "Assembly yield learning and process feedback"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D3",
    "feeds"
   ],
   [
    "PTV-D8",
    "feeds"
   ]
  ],
  "ro": "Package test engineer"
 },
 "PTV-12": {
  "st": "packageTestVehicle",
  "w": [
   45,
   52
  ],
  "s": [
   [
    1,
    "Consolidate the results across all vehicle characterization",
    1
   ],
   [
    2,
    "Assess risk retirement against the coverage matrix",
    1.5
   ],
   [
    3,
    "Issue package design feedback and change requests",
    1.5,
    1
   ],
   [
    4,
    "Define and freeze the assembly process window",
    2
   ],
   [
    5,
    "Write the residual risk statement for unretired items",
    1,
    1
   ],
   [
    6,
    "Declare package validation complete",
    2.5
   ]
  ],
  "o": [
   "Consolidated vehicle results",
   "Risk retirement assessment against the matrix",
   "Package design feedback and change requests",
   "Frozen assembly process window",
   "Residual risk statement",
   "Package validation complete declaration"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "PTV-D8",
    "produces"
   ],
   [
    "PTV-D9",
    "produces"
   ]
  ],
  "ro": "PTV lead"
 },
 "SIPI-01": {
  "st": "chipPackageCoVerification",
  "w": [
   0,
   7
  ],
  "s": [
   [
    1,
    "Define the model requirements with physical design",
    1
   ],
   [
    2,
    "Select the switching scenarios from real workloads",
    1.5
   ],
   [
    3,
    "Decompose by power domain and operating mode",
    1.5,
    1
   ],
   [
    4,
    "Extract and assemble the CPM",
    2
   ],
   [
    5,
    "Validate the model against die-level IR analysis",
    1.5,
    1
   ],
   [
    6,
    "Release the model under version control",
    2.5
   ]
  ],
  "o": [
   "Model requirements and format definition",
   "Switching scenario selection",
   "Domain and mode decomposition",
   "Assembled chip power model",
   "Validation against die-level IR",
   "Per-domain, per-mode model set",
   "Versioned model release"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6
  ],
  "r": [
   [
    "SIPI-D1",
    "produces"
   ],
   [
    "SIPI-D3",
    "feeds"
   ]
  ],
  "ro": "Power modeling engineer"
 },
 "SIPI-02": {
  "st": "chipPackageCoVerification",
  "w": [
   2,
   10
  ],
  "s": [
   [
    1,
    "Define the extraction scope and frequency range",
    1.5
   ],
   [
    2,
    "Extract the interposer model",
    2
   ],
   [
    3,
    "Extract the substrate model",
    2,
    1
   ],
   [
    4,
    "Extract the board and socket models",
    1.5,
    1
   ],
   [
    5,
    "Assemble the PDN network model",
    2
   ],
   [
    6,
    "Validate and correlate the models",
    2.5
   ]
  ],
  "o": [
   "Extraction scope and frequency definition",
   "Interposer electrical model",
   "Substrate electrical model",
   "Board and socket models",
   "Assembled PDN network model",
   "Model validation results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SIPI-D2",
    "produces"
   ],
   [
    "SIPI-D5",
    "feeds"
   ]
  ],
  "ro": "SI/PI extraction engineer"
 },
 "SIPI-03": {
  "st": "chipPackageCoVerification",
  "w": [
   8,
   17
  ],
  "s": [
   [
    1,
    "Derive the impedance targets per domain",
    1.5
   ],
   [
    2,
    "Assemble the combined die-package-board PDN",
    2
   ],
   [
    3,
    "Analyze DC resistance and static drop",
    1.5,
    1
   ],
   [
    4,
    "Analyze AC impedance across frequency",
    2.5
   ],
   [
    5,
    "Identify and analyze the anti-resonances",
    1.5,
    1
   ],
   [
    6,
    "Report the PDN findings and improvement recommendations",
    3
   ]
  ],
  "o": [
   "Impedance targets per domain",
   "Combined PDN model",
   "DC resistance and static drop results",
   "AC impedance across frequency",
   "Anti-resonance analysis",
   "PDN findings and recommendations"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SIPI-D3",
    "produces"
   ],
   [
    "SIPI-D4",
    "feeds"
   ]
  ],
  "ro": "Power integrity engineer"
 },
 "SIPI-04": {
  "st": "chipPackageCoVerification",
  "w": [
   12,
   20
  ],
  "s": [
   [
    1,
    "Select the transient scenarios from the workload profiles",
    1.5
   ],
   [
    2,
    "Run the combined transient simulation with package inductance",
    2.5
   ],
   [
    3,
    "Analyze droop magnitude and duration per domain",
    2
   ],
   [
    4,
    "Compare against the die-only IR results",
    1.5,
    1
   ],
   [
    5,
    "Explore the worst-case scenarios",
    1.5,
    1
   ],
   [
    6,
    "Assess the dynamic IR margin and report the findings",
    2
   ]
  ],
  "o": [
   "Transient scenario selection",
   "Combined transient simulation results",
   "Droop magnitude and duration per domain",
   "Die-only comparison",
   "Worst-case scenario findings",
   "Dynamic IR margin assessment"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SIPI-D3",
    "produces"
   ],
   [
    "SIPI-D7",
    "feeds"
   ]
  ],
  "ro": "Power integrity engineer"
 },
 "SIPI-05": {
  "st": "chipPackageCoVerification",
  "w": [
   14,
   21
  ],
  "s": [
   [
    1,
    "Allocate the frequency bands across the three levels",
    1.5
   ],
   [
    2,
    "Set the on-die decap requirement and cost its area",
    1.5
   ],
   [
    3,
    "Select the package capacitors and their mounting positions",
    1.5,
    1
   ],
   [
    4,
    "Set the board bulk capacitance requirement",
    1,
    1
   ],
   [
    5,
    "Verify the combined impedance with the allocation",
    1.5
   ],
   [
    6,
    "Issue the decap specification and hand it to each level",
    2.5
   ]
  ],
  "o": [
   "Frequency band allocation",
   "On-die decap requirement with area cost",
   "Package capacitor selection and placement",
   "Board bulk capacitance requirement",
   "Combined impedance verification",
   "Decap specification per level"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SIPI-D4",
    "produces"
   ],
   [
    "SIPI-D3",
    "feeds"
   ]
  ],
  "ro": "Power integrity engineer"
 },
 "SIPI-06": {
  "st": "chipPackageCoVerification",
  "w": [
   15,
   20
  ],
  "s": [
   [
    1,
    "Scope the SSN analysis — which interfaces switch together",
    1
   ],
   [
    2,
    "Model the IO ring power and ground network",
    1.5
   ],
   [
    3,
    "Simulate simultaneous switching per interface",
    1.5,
    1
   ],
   [
    4,
    "Analyze ground bounce and reference shift",
    1.5
   ],
   [
    5,
    "Assess mitigations — bump assignment, decoupling",
    1,
    1
   ],
   [
    6,
    "Report the SSN findings and interface impact",
    1
   ]
  ],
  "o": [
   "SSN analysis scope",
   "IO ring power and ground models",
   "Simultaneous switching simulation results",
   "Ground bounce and reference shift analysis",
   "Mitigation assessment",
   "SSN findings per interface"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SIPI-D5",
    "feeds"
   ],
   [
    "SIPI-D3",
    "feeds"
   ]
  ],
  "ro": "SI/PI engineer"
 },
 "SIPI-07": {
  "st": "chipPackageCoVerification",
  "w": [
   8,
   17
  ],
  "s": [
   [
    1,
    "Define the channel topology per interface",
    1.5
   ],
   [
    2,
    "Assemble the end-to-end channels from the extracted models",
    2
   ],
   [
    3,
    "Analyze insertion loss and return loss",
    2
   ],
   [
    4,
    "Analyze near-end and far-end crosstalk",
    2,
    1
   ],
   [
    5,
    "Analyze return paths and discontinuities",
    1.5,
    1
   ],
   [
    6,
    "Characterize each channel against the PHY assumption",
    3.5
   ]
  ],
  "o": [
   "Channel topology per interface",
   "End-to-end channel models",
   "Insertion and return loss results",
   "Crosstalk analysis results",
   "Return path and discontinuity findings",
   "Channel characterization against PHY assumptions"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SIPI-D5",
    "produces"
   ],
   [
    "SIPI-D2",
    "feeds"
   ]
  ],
  "ro": "SI engineer"
 },
 "SIPI-08": {
  "st": "chipPackageCoVerification",
  "w": [
   15,
   23
  ],
  "s": [
   [
    1,
    "Structure the budget and allocate contributions per interface",
    1.5
   ],
   [
    2,
    "Assemble the jitter budget — random, deterministic, correlated",
    2
   ],
   [
    3,
    "Run statistical eye analysis with equalization",
    2,
    1
   ],
   [
    4,
    "Estimate BER and margin against the mask",
    2
   ],
   [
    5,
    "Analyze sensitivity to channel and process variation",
    1.5,
    1
   ],
   [
    6,
    "Close the budget and sign off each interface",
    2.5
   ]
  ],
  "o": [
   "Budget structure and contribution allocation",
   "Assembled jitter budget",
   "Statistical eye analysis results",
   "BER estimation and mask margin",
   "Variation sensitivity analysis",
   "Stated margin per interface against its mask",
   "Interface budget closure records"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6
  ],
  "r": [
   [
    "SIPI-D6",
    "produces"
   ],
   [
    "SIPI-D5",
    "feeds"
   ]
  ],
  "ro": "SI engineer"
 },
 "SIPI-09": {
  "st": "chipPackageCoVerification",
  "w": [
   18,
   23
  ],
  "s": [
   [
    1,
    "Generate the droop map per region and mode",
    1
   ],
   [
    2,
    "Set up voltage-aware timing analysis",
    1.5
   ],
   [
    3,
    "Re-analyze timing with the back-annotated droop",
    1.5,
    1
   ],
   [
    4,
    "Assess the margin impact per timing path group",
    1.5
   ],
   [
    5,
    "Reconcile with the SO-02 signoff margin",
    1.5,
    1
   ],
   [
    6,
    "Report the power-aware timing findings and recommendations",
    1
   ]
  ],
  "o": [
   "Droop map per region and mode",
   "Voltage-aware timing setup",
   "Re-analyzed timing with droop",
   "Margin impact per path group",
   "Reconciliation with signoff margin",
   "Power-aware timing recommendations"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SIPI-D7",
    "produces"
   ],
   [
    "SIPI-D3",
    "feeds"
   ]
  ],
  "ro": "Power integrity engineer"
 },
 "SIPI-10": {
  "st": "chipPackageCoVerification",
  "w": [
   18,
   23
  ],
  "s": [
   [
    1,
    "Define the coupling methodology and iteration scheme",
    1
   ],
   [
    2,
    "Integrate the thermal model with the package model",
    1.5
   ],
   [
    3,
    "Model the leakage-temperature feedback",
    1,
    1
   ],
   [
    4,
    "Iterate the coupled electro-thermal analysis to convergence",
    1.5
   ],
   [
    5,
    "Assess the hotspots and gradients",
    1,
    1
   ],
   [
    6,
    "Compare the findings against the isolated analyses",
    1
   ]
  ],
  "o": [
   "Coupling methodology and iteration scheme",
   "Integrated electro-thermal model",
   "Leakage-temperature feedback model",
   "Coupled analysis results",
   "Hotspot and gradient assessment",
   "Comparison against isolated analyses"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "SIPI-D3",
    "feeds"
   ],
   [
    "SIPI-D7",
    "feeds"
   ]
  ],
  "ro": "Thermal engineer"
 },
 "SIPI-11": {
  "st": "chipPackageCoVerification",
  "w": [
   22,
   26
  ],
  "s": [
   [
    1,
    "Confirm the exit criteria across all analyses",
    0.75
   ],
   [
    2,
    "Consolidate the results and summarize the margins",
    1
   ],
   [
    3,
    "Disposition open items with the die, package and board owners",
    1,
    1
   ],
   [
    4,
    "Run the signoff review with the design and package teams",
    1.25
   ],
   [
    5,
    "Write the residual risk statement",
    0.75,
    1
   ],
   [
    6,
    "Declare the co-verification signoff",
    1
   ]
  ],
  "o": [
   "Confirmed exit criteria",
   "Consolidated results and margin summary",
   "Open item dispositions with owners",
   "Signoff review record with design and package",
   "Residual risk statement",
   "Signed criteria disposition record",
   "Co-verification signoff declaration"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6
  ],
  "r": [
   [
    "SIPI-D8",
    "produces"
   ],
   [
    "SIPI-D6",
    "gates"
   ]
  ],
  "ro": "SI/PI lead"
 },
 "ASSY-01": {
  "st": "packaging",
  "w": [
   0,
   3
  ],
  "s": [
   [
    1,
    "Receive the wafers and set up sort on the probe station",
    0.5
   ],
   [
    2,
    "Execute wafer sort against the KGD criteria",
    1
   ],
   [
    3,
    "Disposition the marginal die",
    0.75,
    1
   ],
   [
    4,
    "Select the known-good die and build the wafer maps",
    1
   ],
   [
    5,
    "Release the die to assembly with traceability",
    0.5
   ]
  ],
  "o": [
   "Wafers received with sort setup complete",
   "Sort execution results",
   "Marginal die disposition record",
   "Known-good-die map per wafer",
   "Die released to assembly with traceability"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "ASSY-D1",
    "feeds"
   ],
   [
    "ASSY-D3",
    "feeds"
   ]
  ],
  "ro": "Product engineering"
 },
 "ASSY-02": {
  "st": "packaging",
  "w": [
   0,
   3
  ],
  "s": [
   [
    1,
    "Confirm HBM procurement and take delivery",
    0.5
   ],
   [
    2,
    "Run incoming inspection against the specification",
    1
   ],
   [
    3,
    "Review the supplier test data",
    0.75,
    1
   ],
   [
    4,
    "Qualify the stacks and release them to assembly",
    1
   ],
   [
    5,
    "Maintain inventory and lot traceability",
    0.5
   ]
  ],
  "o": [
   "Delivered HBM stacks",
   "Incoming inspection results",
   "Supplier test data review",
   "Qualified stacks released to assembly",
   "Inventory and lot traceability record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "ASSY-D1",
    "feeds"
   ],
   [
    "ASSY-D4",
    "feeds"
   ]
  ],
  "ro": "Procurement"
 },
 "ASSY-03": {
  "st": "packaging",
  "w": [
   2,
   5
  ],
  "s": [
   [
    1,
    "Set up the process to the frozen window",
    0.5
   ],
   [
    2,
    "Prepare the micro-bumps and apply flux",
    1
   ],
   [
    3,
    "Monitor the bond parameters during the run",
    0.75,
    1
   ],
   [
    4,
    "Bond the die and stacks by thermo-compression",
    1
   ],
   [
    5,
    "Inspect post-bond and record the travelers",
    0.5
   ]
  ],
  "o": [
   "Process setup record against the frozen window",
   "Prepared micro-bumps",
   "Bond parameter monitoring data",
   "Bonded die and stack assemblies",
   "Post-bond inspection results",
   "Assembly travelers with actual conditions"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   5
  ],
  "r": [
   [
    "ASSY-D2",
    "produces"
   ],
   [
    "ASSY-D1",
    "feeds"
   ]
  ],
  "ro": "OSAT process engineer"
 },
 "ASSY-04": {
  "st": "packaging",
  "w": [
   3,
   6
  ],
  "s": [
   [
    1,
    "Attach the interposer to the substrate",
    0.5
   ],
   [
    2,
    "Dispense and flow the underfill",
    1
   ],
   [
    3,
    "Inspect voids and fillet before cure",
    0.75,
    1
   ],
   [
    4,
    "Cure the underfill and mold the assembly",
    1
   ],
   [
    5,
    "Inspect post-mold",
    0.5
   ]
  ],
  "o": [
   "Interposer-to-substrate attached assemblies",
   "Dispensed and flowed underfill",
   "Void and fillet inspection results",
   "Cured and molded assemblies",
   "Inspected post-mold units",
   "Post-mold inspection results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   5
  ],
  "r": [
   [
    "ASSY-D1",
    "feeds"
   ],
   [
    "ASSY-D4",
    "feeds"
   ]
  ],
  "ro": "OSAT process engineer"
 },
 "ASSY-05": {
  "st": "packaging",
  "w": [
   5,
   7
  ],
  "s": [
   [
    1,
    "Apply the TIM and attach the lid",
    0.5
   ],
   [
    2,
    "Attach the balls and reflow",
    0.75
   ],
   [
    3,
    "Check lid flatness and co-planarity",
    0.5,
    1
   ],
   [
    4,
    "Run final visual and dimensional inspection",
    0.75
   ]
  ],
  "o": [
   "Lidded units with applied TIM",
   "Ball-attached packages",
   "Lid flatness and co-planarity results",
   "Final inspection results",
   "Completed assembled units"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   4
  ],
  "r": [
   [
    "ASSY-D1",
    "produces"
   ],
   [
    "ASSY-D4",
    "feeds"
   ]
  ],
  "ro": "OSAT process engineer"
 },
 "ASSY-06": {
  "st": "packaging",
  "w": [
   3,
   5
  ],
  "s": [
   [
    1,
    "Set the inspection plan and sampling strategy",
    0.5
   ],
   [
    2,
    "X-ray the joints and voids",
    0.75
   ],
   [
    3,
    "Classify and disposition the defects",
    0.5,
    1
   ],
   [
    4,
    "Run acoustic imaging and warpage metrology",
    0.75
   ]
  ],
  "o": [
   "Inspection plan and sampling strategy",
   "X-ray inspection results",
   "Defect classification and disposition",
   "Acoustic imaging and warpage results"
  ],
  "ob": [
   1,
   2,
   3,
   4
  ],
  "r": [
   [
    "ASSY-D4",
    "produces"
   ],
   [
    "ASSY-D3",
    "feeds"
   ]
  ],
  "ro": "Quality engineer"
 },
 "ASSY-07": {
  "st": "packaging",
  "w": [
   3,
   8
  ],
  "s": [
   [
    1,
    "Collect the yield data across process steps",
    0.75
   ],
   [
    2,
    "Build the failure pareto by mode and process step",
    1.25
   ],
   [
    3,
    "Compare against the PTV yield prediction",
    1,
    1
   ],
   [
    4,
    "Run root cause analysis with the OSAT",
    1.5
   ],
   [
    5,
    "Track the corrective actions",
    1,
    1
   ],
   [
    6,
    "Tune the process inside the frozen window",
    1.5
   ]
  ],
  "o": [
   "Yield data by process step",
   "Failure pareto by mode",
   "Comparison against vehicle prediction",
   "Root cause findings",
   "Corrective actions and their tracking",
   "Process tuning record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "ASSY-D3",
    "produces"
   ],
   [
    "ASSY-D2",
    "feeds"
   ]
  ],
  "ro": "Yield engineer"
 },
 "ASSY-08": {
  "st": "packaging",
  "w": [
   6,
   8
  ],
  "s": [
   [
    1,
    "Set up the test and continuity criteria",
    0.5
   ],
   [
    2,
    "Execute the open and short tests",
    0.75
   ],
   [
    3,
    "Screen for marginal resistance",
    0.5,
    1
   ],
   [
    4,
    "Disposition the failures and release the units",
    0.75
   ]
  ],
  "o": [
   "Test setup and criteria",
   "Open and short results per unit",
   "Marginal resistance screening results",
   "Failure disposition and released units"
  ],
  "ob": [
   1,
   2,
   3,
   4
  ],
  "r": [
   [
    "ASSY-D4",
    "produces"
   ],
   [
    "ASSY-D1",
    "gates"
   ]
  ],
  "ro": "Package test engineer"
 },
 "ASSY-09": {
  "st": "packaging",
  "w": [
   5,
   8
  ],
  "s": [
   [
    1,
    "Collect the allocation requirements from each consumer",
    0.5
   ],
   [
    2,
    "Allocate and reserve the units",
    1
   ],
   [
    3,
    "Resolve contention and escalate where needed",
    0.5,
    1
   ],
   [
    4,
    "Build to the allocation across lots",
    1
   ],
   [
    5,
    "Release with traceability per allocation",
    0.5
   ]
  ],
  "o": [
   "Allocation requirements per consumer",
   "Unit allocation and reservation record",
   "Contention resolution decisions",
   "Units built to allocation",
   "Release and traceability per allocation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "ASSY-D5",
    "produces"
   ],
   [
    "ASSY-D1",
    "produces"
   ]
  ],
  "ro": "Program manager"
 },
 "EVB-01": {
  "st": "validationHardware",
  "w": [
   0,
   5
  ],
  "s": [
   [
    1,
    "Collect validation requirements from bring-up, characterization and qual",
    1
   ],
   [
    2,
    "Define the platform topology options — socketed, soldered, mezzanine",
    1
   ],
   [
    3,
    "Assess reuse against existing platforms",
    1,
    1
   ],
   [
    4,
    "Select the topology and record its trade-offs",
    1.5
   ],
   [
    5,
    "Set the quantity and revision plan",
    1,
    1
   ],
   [
    6,
    "Write the platform specification",
    1.5
   ]
  ],
  "o": [
   "Consolidated validation requirements",
   "Platform topology options with trade-offs",
   "Reuse assessment",
   "Topology selection record",
   "Quantity and revision plan",
   "Validation platform specification"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "EVB-D1",
    "produces"
   ],
   [
    "EVB-D3",
    "informs"
   ]
  ],
  "ro": "Validation lead"
 },
 "EVB-02": {
  "st": "validationHardware",
  "w": [
   4,
   14
  ],
  "s": [
   [
    1,
    "Draw the block diagram and partition the interfaces",
    1
   ],
   [
    2,
    "Design the power tree and VRM schematic",
    2.5
   ],
   [
    3,
    "Design the clocking and reference schematic",
    2,
    1
   ],
   [
    4,
    "Design the host interface and connector schematic",
    2.5
   ],
   [
    5,
    "Design the debug and instrumentation headers",
    2,
    1
   ],
   [
    6,
    "Design the socket and DUT interface schematic",
    2
   ],
   [
    7,
    "Build the BOM and check component sourcing",
    1.5,
    1
   ],
   [
    8,
    "Review the schematic and release it to layout",
    2
   ]
  ],
  "o": [
   "Block diagram and interface partition",
   "Power tree and VRM schematic",
   "Clocking and reference schematic",
   "Host interface schematic",
   "Debug and instrumentation headers",
   "Socket and DUT interface",
   "Bill of materials with sourcing status",
   "Reviewed and released schematic"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "EVB-D2",
    "produces"
   ],
   [
    "EVB-D1",
    "informs"
   ]
  ],
  "ro": "Hardware engineer"
 },
 "EVB-03": {
  "st": "validationHardware",
  "w": [
   12,
   24
  ],
  "s": [
   [
    1,
    "Plan the stack-up and impedance",
    1.5
   ],
   [
    2,
    "Place the components and floorplan the board",
    2.5
   ],
   [
    3,
    "Simulate SI on the critical channels during routing",
    2,
    1
   ],
   [
    4,
    "Route the high-speed channels",
    3
   ],
   [
    5,
    "Simulate PI on the board PDN",
    2,
    1
   ],
   [
    6,
    "Lay out the power planes and PDN",
    2.5
   ],
   [
    7,
    "Apply the thermal and mechanical layout constraints",
    2,
    1
   ],
   [
    8,
    "Run DRC, review and release to fabrication",
    2.5
   ]
  ],
  "o": [
   "Stack-up and impedance plan",
   "Placement and floorplan",
   "SI simulation results on critical channels",
   "Routed high-speed channels",
   "PI simulation on the board PDN",
   "Power plane layout",
   "Thermal and mechanical constraint compliance",
   "DRC-clean layout database released to fabrication"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "EVB-D2",
    "produces"
   ],
   [
    "EVB-D3",
    "feeds"
   ]
  ],
  "ro": "PCB layout engineer"
 },
 "EVB-04": {
  "st": "validationHardware",
  "w": [
   23,
   31
  ],
  "s": [
   [
    1,
    "Select the fabrication vendor and release the data",
    1
   ],
   [
    2,
    "Track PCB fabrication",
    3
   ],
   [
    3,
    "Procure the components against their lead times",
    1.5,
    1
   ],
   [
    4,
    "Assemble the boards",
    2.5
   ],
   [
    5,
    "Run first article inspection",
    1,
    1
   ],
   [
    6,
    "Run incoming inspection and accept the boards",
    1.5
   ]
  ],
  "o": [
   "Vendor selection and released fabrication data",
   "Fabricated bare boards",
   "Procured components",
   "Assembled boards",
   "First article inspection result",
   "Incoming inspection and acceptance record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "EVB-D3",
    "produces"
   ],
   [
    "EVB-D2",
    "informs"
   ]
  ],
  "ro": "Hardware engineer"
 },
 "EVB-05": {
  "st": "validationHardware",
  "w": [
   8,
   15
  ],
  "s": [
   [
    1,
    "Derive the power tree requirement from the die and package",
    1
   ],
   [
    2,
    "Select and design the VRMs",
    1.5
   ],
   [
    3,
    "Design the transient response against the SIPI budget",
    1.5,
    1
   ],
   [
    4,
    "Design the telemetry and monitoring",
    1.5
   ],
   [
    5,
    "Design the protection and sequencing",
    1.5,
    1
   ],
   [
    6,
    "Bring up and validate the power subsystem on the board",
    3
   ]
  ],
  "o": [
   "Power tree requirement",
   "VRM design",
   "Transient response design",
   "Telemetry and monitoring capability",
   "Protection and sequencing design",
   "Power bring-up and validation results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "EVB-D2",
    "feeds"
   ],
   [
    "EVB-D4",
    "feeds"
   ]
  ],
  "ro": "Power engineer"
 },
 "EVB-06": {
  "st": "validationHardware",
  "w": [
   10,
   17
  ],
  "s": [
   [
    1,
    "Collect the debug requirements from validation and DFT",
    1
   ],
   [
    2,
    "Design the JTAG and trace pod interfaces",
    1.5
   ],
   [
    3,
    "Design the logic analyser and scope access",
    1.5,
    1
   ],
   [
    4,
    "Design the interposers and probe access",
    1.5
   ],
   [
    5,
    "Integrate the software debug tooling",
    1,
    1
   ],
   [
    6,
    "Validate the debug infrastructure and document it",
    3
   ]
  ],
  "o": [
   "Debug requirements",
   "JTAG and trace pod interface",
   "Logic analyser and scope access",
   "Interposer and probe access design",
   "Software debug tool integration",
   "Debug infrastructure validation results",
   "Debug and trace access documentation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6
  ],
  "r": [
   [
    "EVB-D5",
    "produces"
   ],
   [
    "EVB-D2",
    "feeds"
   ]
  ],
  "ro": "Validation engineer"
 },
 "EVB-07": {
  "st": "validationHardware",
  "w": [
   30,
   37
  ],
  "s": [
   [
    1,
    "Plan the bring-up and fit the dummy parts",
    1
   ],
   [
    2,
    "Bring up the power tree and verify the rails",
    1.5
   ],
   [
    3,
    "Validate the telemetry and protection",
    1.5,
    1
   ],
   [
    4,
    "Validate the clocking and references",
    1.5
   ],
   [
    5,
    "Check the thermal solution fit",
    1.5,
    1
   ],
   [
    6,
    "Validate the interface loopbacks and signals",
    3
   ]
  ],
  "o": [
   "Bring-up plan and fitted dummy parts",
   "Power tree bring-up results",
   "Telemetry and protection validation",
   "Clocking and reference validation",
   "Thermal fit check",
   "Interface loopback and signal validation results",
   "Board bring-up report and known issues"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6
  ],
  "r": [
   [
    "EVB-D4",
    "produces"
   ],
   [
    "EVB-D3",
    "gates"
   ]
  ],
  "ro": "Hardware engineer"
 },
 "EVB-08": {
  "st": "validationHardware",
  "w": [
   16,
   23
  ],
  "s": [
   [
    1,
    "Derive the thermal requirement from the package envelope",
    1
   ],
   [
    2,
    "Select the cooling solution",
    1.5
   ],
   [
    3,
    "Design the airflow and enclosure",
    1.5,
    1
   ],
   [
    4,
    "Design the mounting and interfaces",
    1.5
   ],
   [
    5,
    "Build in temperature control and soak capability",
    1,
    1
   ],
   [
    6,
    "Validate the thermal solution on the platform",
    3
   ]
  ],
  "o": [
   "Thermal requirement",
   "Cooling solution selection",
   "Airflow and enclosure design",
   "Mounting and interface design",
   "Temperature control and soak capability",
   "Thermal validation results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "EVB-D1",
    "feeds"
   ],
   [
    "EVB-D4",
    "feeds"
   ]
  ],
  "ro": "Thermal engineer"
 },
 "EVB-09": {
  "st": "validationHardware",
  "w": [
   24,
   31
  ],
  "s": [
   [
    1,
    "Derive the instrument requirement from the characterization plan",
    1
   ],
   [
    2,
    "Reserve and procure the instruments",
    1.5
   ],
   [
    3,
    "Build the automation and control infrastructure",
    1.5,
    1
   ],
   [
    4,
    "Build and cable the test racks",
    1.5
   ],
   [
    5,
    "Provision the lab space and power",
    1,
    1
   ],
   [
    6,
    "Integrate and calibrate the racks",
    3
   ]
  ],
  "o": [
   "Instrument requirement list",
   "Instrument reservations and procurement",
   "Automation and control infrastructure",
   "Built test racks with cabling",
   "Lab space and power provisioning",
   "Rack integration and calibration record",
   "Lab setup and instrument reservation plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   2
  ],
  "r": [
   [
    "EVB-D6",
    "produces"
   ],
   [
    "EVB-D4",
    "informs"
   ]
  ],
  "ro": "Lab manager"
 },
 "EVB-10": {
  "st": "validationHardware",
  "w": [
   26,
   33
  ],
  "s": [
   [
    1,
    "Define the handoff boundary with the firmware team",
    1
   ],
   [
    2,
    "Write the minimal boot and initialization software",
    1.5
   ],
   [
    3,
    "Build the host driver stub and enumeration",
    1.5,
    1
   ],
   [
    4,
    "Build the register access and diagnostic tooling",
    1.5
   ],
   [
    5,
    "Build the logging and data capture",
    1,
    1
   ],
   [
    6,
    "Validate the host enablement on the platform",
    3
   ]
  ],
  "o": [
   "Handoff boundary definition",
   "Minimal boot and initialization software",
   "Host driver stub and enumeration",
   "Register access and diagnostic tooling",
   "Logging and data capture",
   "Host enablement validation results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "EVB-D4",
    "feeds"
   ],
   [
    "EVB-D5",
    "feeds"
   ]
  ],
  "ro": "Validation software engineer"
 },
 "TEST-01": {
  "st": "testDevelopment",
  "w": [
   0,
   8
  ],
  "s": [
   [
    1,
    "Derive the coverage requirement from the specification and DFT",
    1
   ],
   [
    2,
    "Define the test flow architecture — sort, final, characterization",
    2
   ],
   [
    3,
    "Estimate the tester resources",
    1.5,
    1
   ],
   [
    4,
    "Construct the coverage matrix",
    2
   ],
   [
    5,
    "Derive the DPPM target from the coverage",
    1.5,
    1
   ],
   [
    6,
    "Set the test insertion and binning strategy",
    1.5
   ],
   [
    7,
    "Decide on burn-in and screening",
    1,
    1
   ],
   [
    8,
    "Review the plan and release it",
    1.5
   ]
  ],
  "o": [
   "Coverage requirement",
   "Test flow architecture across insertions",
   "Tester resource estimate",
   "Test coverage matrix",
   "DPPM target derivation",
   "Test insertion and binning strategy",
   "Plan review findings",
   "Burn-in and screening decision",
   "Reviewed and released test plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   8,
   7,
   8
  ],
  "r": [
   [
    "TEST-D1",
    "produces"
   ],
   [
    "TEST-D6",
    "informs"
   ]
  ],
  "ro": "Test architect"
 },
 "TEST-02": {
  "st": "testDevelopment",
  "w": [
   4,
   10
  ],
  "s": [
   [
    1,
    "Derive the tester requirement from the test plan",
    1
   ],
   [
    2,
    "Evaluate the ATE platforms against the requirement",
    1.5
   ],
   [
    3,
    "Analyze the instrument options and pin count",
    1,
    1
   ],
   [
    4,
    "Select and configure the platform",
    1.5
   ],
   [
    5,
    "Build the cost-per-tested-unit model",
    1,
    1
   ],
   [
    6,
    "Book the tester time and commit the capacity",
    2
   ]
  ],
  "o": [
   "Tester requirement specification",
   "ATE platform evaluation",
   "Instrument option and pin-count analysis",
   "Platform selection and configuration",
   "Cost per tested unit model",
   "Tester time bookings across development, characterization and production"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "TEST-D6",
    "feeds"
   ],
   [
    "TEST-D3",
    "informs"
   ]
  ],
  "ro": "Test engineering manager"
 },
 "TEST-03": {
  "st": "testDevelopment",
  "w": [
   10,
   30
  ],
  "s": [
   [
    1,
    "Extract the probe card requirement and bump map",
    2
   ],
   [
    2,
    "Design the probe card",
    3
   ],
   [
    3,
    "Analyze contact resistance and planarity",
    3,
    1
   ],
   [
    4,
    "Track probe card fabrication",
    8
   ],
   [
    5,
    "Define the touchdown life and cleaning strategy",
    3,
    1
   ],
   [
    6,
    "Qualify the card on the tester",
    4
   ],
   [
    7,
    "Set the spare card and repair plan",
    2.5,
    1
   ],
   [
    8,
    "Release the card to wafer sort",
    3
   ]
  ],
  "o": [
   "Probe card requirement and bump map",
   "Probe card design",
   "Contact resistance and planarity analysis",
   "Fabricated probe card",
   "Touchdown life and cleaning strategy",
   "Tester qualification results",
   "Spare card and repair plan",
   "Probe card released to sort"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TEST-D2",
    "produces"
   ],
   [
    "TEST-D3",
    "gates"
   ]
  ],
  "ro": "Probe engineer"
 },
 "TEST-04": {
  "st": "testDevelopment",
  "w": [
   12,
   29
  ],
  "s": [
   [
    1,
    "Define the load board requirement and select the socket",
    2
   ],
   [
    2,
    "Design the load board with signal integrity",
    3.5
   ],
   [
    3,
    "Analyze socket contact and insertion life",
    2.5,
    1
   ],
   [
    4,
    "Track fabrication and assembly",
    5
   ],
   [
    5,
    "Design the power delivery on the load board",
    2.5,
    1
   ],
   [
    6,
    "Bring the board up on the tester",
    3.5
   ],
   [
    7,
    "Design the correlation fixture",
    2,
    1
   ],
   [
    8,
    "Release the board to final test",
    3
   ]
  ],
  "o": [
   "Load board requirement and socket selection",
   "Load board design with SI results",
   "Socket contact and life analysis",
   "Fabricated and assembled load board",
   "Load board power delivery analysis",
   "Load board power delivery design",
   "Tester bring-up results",
   "Correlation fixture",
   "Load board released to final test"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TEST-D2",
    "produces"
   ],
   [
    "TEST-D3",
    "gates"
   ]
  ],
  "ro": "Test hardware engineer"
 },
 "TEST-05": {
  "st": "testDevelopment",
  "w": [
   16,
   32
  ],
  "s": [
   [
    1,
    "Define the sort flow and test list",
    2
   ],
   [
    2,
    "Develop the DC and continuity tests",
    3.5
   ],
   [
    3,
    "Develop the parametric and process monitor tests",
    2.5,
    1
   ],
   [
    4,
    "Integrate the scan and structural content",
    3.5
   ],
   [
    5,
    "Build the binning and wafer map output",
    2.5,
    1
   ],
   [
    6,
    "Develop the functional and memory BIST content",
    3.5
   ],
   [
    7,
    "Set the test limits and guard bands",
    2.5,
    1
   ],
   [
    8,
    "Integrate and debug the program on the tester",
    3.5
   ]
  ],
  "o": [
   "Sort flow and test list",
   "DC and continuity tests",
   "Parametric and monitor tests",
   "Integrated scan and structural content",
   "Binning and wafer map output",
   "Functional and BIST content",
   "Test limits and guard bands",
   "Debugged sort program"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TEST-D3",
    "produces"
   ],
   [
    "TEST-D1",
    "feeds"
   ]
  ],
  "ro": "Test engineer"
 },
 "TEST-06": {
  "st": "testDevelopment",
  "w": [
   20,
   36
  ],
  "s": [
   [
    1,
    "Define the final test flow",
    2
   ],
   [
    2,
    "Develop the package-level DC and continuity content",
    3.5
   ],
   [
    3,
    "Develop the power and thermal test content",
    2.5,
    1
   ],
   [
    4,
    "Develop the at-speed functional content",
    3.5
   ],
   [
    5,
    "Develop the binning and grading content",
    2.5,
    1
   ],
   [
    6,
    "Develop the interface and HBM test content",
    3.5
   ],
   [
    7,
    "Set the final test limits and guard bands",
    2.5,
    1
   ],
   [
    8,
    "Integrate and debug the program",
    3.5
   ]
  ],
  "o": [
   "Final test flow",
   "Package-level DC and continuity content",
   "Power and thermal test content",
   "At-speed functional content",
   "Binning and grading content",
   "Interface and HBM test content",
   "Final test limits and guard bands",
   "Debugged final test program"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TEST-D3",
    "produces"
   ],
   [
    "TEST-D6",
    "feeds"
   ]
  ],
  "ro": "Test engineer"
 },
 "TEST-07": {
  "st": "testDevelopment",
  "w": [
   24,
   36
  ],
  "s": [
   [
    1,
    "Collect the characterization requirement from qualification and marketing",
    1.5
   ],
   [
    2,
    "Build the shmoo and corner content",
    2.5
   ],
   [
    3,
    "Automate the temperature and voltage sweeps",
    2,
    1
   ],
   [
    4,
    "Build the parametric characterization content",
    2.5
   ],
   [
    5,
    "Design the statistical sample plan",
    2,
    1
   ],
   [
    6,
    "Build the datasheet parameter test content",
    2.5
   ],
   [
    7,
    "Build the data analysis and reporting pipeline",
    1.5,
    1
   ],
   [
    8,
    "Integrate the content and set up correlation",
    3
   ]
  ],
  "o": [
   "Characterization requirement",
   "Shmoo and corner content",
   "Sweep automation",
   "Parametric characterization content",
   "Statistical sample plan",
   "Datasheet parameter content",
   "Data analysis and reporting pipeline",
   "Integrated characterization suite"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TEST-D4",
    "produces"
   ],
   [
    "TEST-D6",
    "informs"
   ]
  ],
  "ro": "Characterization engineer"
 },
 "TEST-08": {
  "st": "testDevelopment",
  "w": [
   22,
   32
  ],
  "s": [
   [
    1,
    "Take the ATPG pattern handoff from DFT",
    1.5
   ],
   [
    2,
    "Translate the patterns to the tester format",
    2
   ],
   [
    3,
    "Reduce pattern volume against the memory depth",
    1.5,
    1
   ],
   [
    4,
    "Map the timing and protocols",
    2.5
   ],
   [
    5,
    "Set up compression and streaming",
    1.5,
    1
   ],
   [
    6,
    "Simulate the patterns against the tester model",
    2
   ],
   [
    7,
    "Put the patterns under regression and version control",
    1.5,
    1
   ],
   [
    8,
    "Debug the patterns on silicon or emulation",
    2
   ]
  ],
  "o": [
   "Pattern handoff record",
   "Translated tester-format patterns",
   "Volume and memory reduction",
   "Timing and protocol mapping",
   "Compression and streaming setup",
   "Tester-model simulation results",
   "Pattern regression under version control",
   "Debugged ATE-ready pattern set"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TEST-D5",
    "produces"
   ],
   [
    "TEST-D3",
    "feeds"
   ]
  ],
  "ro": "Test engineer"
 },
 "TEST-09": {
  "st": "testDevelopment",
  "w": [
   8,
   17
  ],
  "s": [
   [
    1,
    "Measure the test time baseline",
    1.5
   ],
   [
    2,
    "Analyze the test time contributors",
    2
   ],
   [
    3,
    "Identify redundant coverage",
    1.5,
    1
   ],
   [
    4,
    "Reduce and reorder the content",
    2
   ],
   [
    5,
    "Build the adaptive and skip-on-fail strategy",
    1.5,
    1
   ],
   [
    6,
    "Assess parallelism and multi-site conversion",
    1.75
   ],
   [
    7,
    "Compute the tester resource cost per unit",
    1.25,
    1
   ],
   [
    8,
    "Update and release the cost model",
    1.75
   ]
  ],
  "o": [
   "Test time baseline",
   "Contributor analysis by test block",
   "Redundant coverage findings",
   "Content reduction and reordering",
   "Adaptive and skip-on-fail strategy",
   "Parallelism and multi-site assessment",
   "Tester resource cost per unit",
   "Cost per unit model"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TEST-D6",
    "produces"
   ],
   [
    "TEST-D1",
    "informs"
   ]
  ],
  "ro": "Test engineer"
 },
 "TEST-10": {
  "st": "testDevelopment",
  "w": [
   32,
   40
  ],
  "s": [
   [
    1,
    "Plan the correlation and select the units",
    1
   ],
   [
    2,
    "Correlate ATE against bench",
    2
   ],
   [
    3,
    "Build the measurement uncertainty budget",
    1.5,
    1
   ],
   [
    4,
    "Correlate ATE against system",
    2
   ],
   [
    5,
    "Designate and retain the golden units",
    1.5,
    1
   ],
   [
    6,
    "Analyze the discrepancies and establish root causes",
    1.5
   ],
   [
    7,
    "Set up the correlation regression",
    1,
    1
   ],
   [
    8,
    "Adjust the guard bands and release",
    1.5
   ]
  ],
  "o": [
   "Correlation plan and unit selection",
   "ATE-to-bench correlation results",
   "Measurement uncertainty budget",
   "ATE-to-system correlation results",
   "Designated golden units",
   "Discrepancy analysis and root causes",
   "Correlation regression",
   "Adjusted guard bands"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TEST-D4",
    "feeds"
   ],
   [
    "TEST-D3",
    "feeds"
   ]
  ],
  "ro": "Product engineering"
 },
 "TEST-11": {
  "st": "testDevelopment",
  "w": [
   26,
   34
  ],
  "s": [
   [
    1,
    "Collect the data requirements from yield, quality and characterization",
    1
   ],
   [
    2,
    "Build the STDF collection and parsing pipeline",
    2
   ],
   [
    3,
    "Define the traceability keys — lot, wafer, unit, assembly",
    1.5,
    1
   ],
   [
    4,
    "Build the yield database and schema",
    2
   ],
   [
    5,
    "Set the retention and archival policy",
    1.5,
    1
   ],
   [
    6,
    "Build the analysis and dashboard layer",
    1.5
   ],
   [
    7,
    "Set up alerting on yield excursions",
    1,
    1
   ],
   [
    8,
    "Deploy the infrastructure and provision access",
    1.5
   ]
  ],
  "o": [
   "Data requirements",
   "STDF collection and parsing pipeline",
   "Traceability key scheme",
   "Yield database and schema",
   "Retention and archival policy",
   "Analysis and dashboard layer",
   "Excursion alerting",
   "Deployed and accessible infrastructure"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "TEST-D7",
    "produces"
   ],
   [
    "TEST-D1",
    "informs"
   ]
  ],
  "ro": "Test data engineer"
 },
 "BU-01": {
  "st": "bringup",
  "w": [
   0,
   1.5
  ],
  "s": [
   [
    1,
    "Receive the samples and run incoming inspection",
    0.5
   ],
   [
    2,
    "Mount the units and check mechanical fit",
    0.5
   ],
   [
    3,
    "Start the unit tracking register and allocation record",
    0.5,
    1
   ],
   [
    4,
    "Complete the pre-power checklist against the board known issues",
    0.5
   ]
  ],
  "o": [
   "Incoming inspection record",
   "Units mounted on boards",
   "Unit tracking and allocation register",
   "Pre-power checklist completion"
  ],
  "ob": [
   1,
   2,
   3,
   4
  ],
  "r": [
   [
    "BU-D1",
    "feeds"
   ],
   [
    "BU-D5",
    "informs"
   ]
  ],
  "ro": "Bring-up lead"
 },
 "BU-02": {
  "st": "bringup",
  "w": [
   1,
   4
  ],
  "s": [
   [
    1,
    "Verify power sequencing against the specification",
    0.5
   ],
   [
    2,
    "Apply first power with current limits in place",
    1
   ],
   [
    3,
    "Triage anomalies from the first application",
    0.75,
    1
   ],
   [
    4,
    "Profile the rail voltages and currents",
    1
   ],
   [
    5,
    "Run the health check and take the go/no-go decision",
    0.5
   ]
  ],
  "o": [
   "Power sequencing verification",
   "First power application record",
   "Anomaly triage findings",
   "Rail voltage and current profiles",
   "Health check and go/no-go decision"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "BU-D1",
    "feeds"
   ],
   [
    "BU-D2",
    "feeds"
   ]
  ],
  "ro": "Bring-up lead"
 },
 "BU-03": {
  "st": "bringup",
  "w": [
   2,
   5
  ],
  "s": [
   [
    1,
    "Validate the reference clocks and inputs",
    0.5
   ],
   [
    2,
    "Verify PLL lock across the frequency range",
    1
   ],
   [
    3,
    "Verify the reset sequence and domain release order",
    0.75,
    1
   ],
   [
    4,
    "Verify the clock tree and domains",
    1
   ],
   [
    5,
    "Measure jitter and stability",
    0.5
   ]
  ],
  "o": [
   "Reference clock validation",
   "PLL lock results across the range",
   "Reset sequence and domain release verification",
   "Clock tree and domain verification",
   "Jitter and stability measurements"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5
  ],
  "r": [
   [
    "BU-D1",
    "feeds"
   ],
   [
    "BU-D2",
    "feeds"
   ]
  ],
  "ro": "Bring-up engineer"
 },
 "BU-04": {
  "st": "bringup",
  "w": [
   4,
   8
  ],
  "s": [
   [
    1,
    "Execute the boot ROM and initialization sequence",
    0.75
   ],
   [
    2,
    "Load the firmware and complete the handoff",
    1.25
   ],
   [
    3,
    "Triage the boot failures",
    1,
    1
   ],
   [
    4,
    "Read registers and confirm device identity",
    1.25
   ],
   [
    5,
    "Publish the first bring-up report and broadcast status",
    1,
    1
   ],
   [
    6,
    "Run the functional smoke tests",
    0.75
   ]
  ],
  "o": [
   "Boot ROM execution record",
   "Firmware load and handoff results",
   "Boot failure triage findings",
   "Register access and identity read",
   "First bring-up report",
   "Functional smoke test results"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "BU-D1",
    "produces"
   ],
   [
    "BU-D4",
    "feeds"
   ]
  ],
  "ro": "Bring-up lead"
 },
 "BU-05": {
  "st": "bringup",
  "w": [
   6,
   14
  ],
  "s": [
   [
    1,
    "Set the interface bring-up order and plan",
    1
   ],
   [
    2,
    "Train the PCIe/CXL links",
    2
   ],
   [
    3,
    "Measure link margins and eyes",
    2,
    1
   ],
   [
    4,
    "Train the HBM interfaces",
    2.5
   ],
   [
    5,
    "Debug the training failures",
    2,
    1
   ],
   [
    6,
    "Bring up the die-to-die interfaces",
    1.5
   ],
   [
    7,
    "Confirm interoperability against host platforms",
    1.5,
    1
   ],
   [
    8,
    "Run the interface stability and compliance suite",
    1
   ]
  ],
  "o": [
   "Interface bring-up order and plan",
   "PCIe/CXL link training results",
   "Link margin and eye measurements",
   "HBM training results",
   "Training failure debug findings",
   "Per-interface training parameter record",
   "Die-to-die interface results",
   "Interoperability results",
   "Interface stability and compliance data"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6,
   7,
   8
  ],
  "r": [
   [
    "BU-D3",
    "produces"
   ],
   [
    "BU-D1",
    "feeds"
   ]
  ],
  "ro": "Interface engineer"
 },
 "BU-06": {
  "st": "bringup",
  "w": [
   8,
   14
  ],
  "s": [
   [
    1,
    "Initialize and configure the memory controller",
    1
   ],
   [
    2,
    "Validate the address map and patterns",
    1.5
   ],
   [
    3,
    "Validate ECC and error handling with injected errors",
    1.5,
    1
   ],
   [
    4,
    "Measure bandwidth against the model",
    1.5
   ],
   [
    5,
    "Check refresh and thermal behavior",
    1.5,
    1
   ],
   [
    6,
    "Characterize latency and efficiency",
    2
   ]
  ],
  "o": [
   "Controller initialization and configuration",
   "Address map and pattern validation",
   "ECC and error handling validation",
   "Bandwidth measurements against the model",
   "Refresh and thermal behavior data",
   "Latency and efficiency characterization"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "BU-D2",
    "feeds"
   ],
   [
    "BU-D3",
    "feeds"
   ]
  ],
  "ro": "Memory engineer"
 },
 "BU-07": {
  "st": "bringup",
  "w": [
   9,
   16
  ],
  "s": [
   [
    1,
    "Plan the shmoo and set up the automation",
    1
   ],
   [
    2,
    "Run the voltage-frequency shmoo at room temperature",
    1.5
   ],
   [
    3,
    "Measure power across the sweep",
    1.5,
    1
   ],
   [
    4,
    "Extend the shmoo across temperature",
    1.5
   ],
   [
    5,
    "Measure unit-to-unit variation across the fleet",
    1.5,
    1
   ],
   [
    6,
    "Analyze the shmoo and extract the margins",
    3
   ]
  ],
  "o": [
   "Shmoo plan and automation",
   "Voltage-frequency shmoo at room",
   "Power measurements across the sweep",
   "Temperature-extended shmoo",
   "Unit-to-unit variation data",
   "Margin extraction and analysis"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "BU-D2",
    "produces"
   ],
   [
    "BU-D1",
    "feeds"
   ]
  ],
  "ro": "Characterization engineer"
 },
 "BU-08": {
  "st": "bringup",
  "w": [
   11,
   17
  ],
  "s": [
   [
    1,
    "Set up the benchmarks and workloads",
    1
   ],
   [
    2,
    "Measure performance across the workloads",
    1.5
   ],
   [
    3,
    "Measure power efficiency",
    1.5,
    1
   ],
   [
    4,
    "Compare against the architecture model",
    1.5
   ],
   [
    5,
    "Profile the bottlenecks",
    1.5,
    1
   ],
   [
    6,
    "Analyze the gaps and attribute their causes",
    2
   ]
  ],
  "o": [
   "Benchmark and workload setup",
   "Performance measurements across workloads",
   "Power efficiency measurements",
   "Comparison against the architecture model",
   "Bottleneck profiling results",
   "Gap analysis and attribution"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "BU-D2",
    "feeds"
   ],
   [
    "BU-D1",
    "feeds"
   ]
  ],
  "ro": "Performance engineer"
 },
 "BU-09": {
  "st": "bringup",
  "w": [
   4,
   14
  ],
  "s": [
   [
    1,
    "Run the anomaly intake and triage process",
    1
   ],
   [
    2,
    "Reproduce and isolate each anomaly",
    2
   ],
   [
    3,
    "Cross-check against simulation and emulation",
    2,
    1
   ],
   [
    4,
    "Extract internal state via DFT and trace",
    2.5
   ],
   [
    5,
    "Escalate to the design team for analysis",
    2,
    1
   ],
   [
    6,
    "Test hypotheses and establish root causes",
    2.5
   ],
   [
    7,
    "Capture the debug knowledge",
    1.5,
    1
   ],
   [
    8,
    "Request failure analysis and disposition the findings",
    2
   ]
  ],
  "o": [
   "Anomaly intake and triage records",
   "Reproduction and isolation results",
   "Simulation and emulation cross-check findings",
   "Extracted internal state",
   "Design-team analysis",
   "Root cause determinations",
   "Debug knowledge base",
   "Failure analysis reports and dispositions"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "BU-D5",
    "produces"
   ],
   [
    "BU-D4",
    "feeds"
   ]
  ],
  "ro": "Silicon debug engineer"
 },
 "BU-10": {
  "st": "bringup",
  "w": [
   10,
   17
  ],
  "s": [
   [
    1,
    "Take in and classify the errata",
    1
   ],
   [
    2,
    "Assess impact and severity",
    1.5
   ],
   [
    3,
    "Determine customer visibility",
    1.5,
    1
   ],
   [
    4,
    "Define and validate the workarounds on silicon",
    1.5
   ],
   [
    5,
    "Provide the fix-versus-document input",
    1,
    1
   ],
   [
    6,
    "Document and release the errata",
    3
   ]
  ],
  "o": [
   "Errata intake and classification",
   "Impact and severity assessment",
   "Customer-visibility determination",
   "Validated workarounds",
   "Fix-versus-document input",
   "Released errata documentation"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "BU-D4",
    "produces"
   ],
   [
    "BU-D6",
    "feeds"
   ]
  ],
  "ro": "Product engineering"
 },
 "BU-11": {
  "st": "bringup",
  "w": [
   13,
   17
  ],
  "s": [
   [
    1,
    "Compile the defect list and scope the fixes",
    0.75
   ],
   [
    2,
    "Assess metal-fix feasibility",
    1
   ],
   [
    3,
    "Scope the full-mask respin",
    0.75,
    1
   ],
   [
    4,
    "Compare cost, schedule and risk",
    1.25
   ],
   [
    5,
    "Take the customer and market impact input",
    0.75,
    1
   ],
   [
    6,
    "Take the decision and record it",
    1
   ]
  ],
  "o": [
   "Defect list and fix scope",
   "Metal-fix feasibility assessment",
   "Full-mask respin scope",
   "Cost, schedule and risk comparison",
   "Customer and market impact assessment",
   "Recorded decision with its rationale"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "BU-D6",
    "produces"
   ],
   [
    "BU-D4",
    "feeds"
   ]
  ],
  "ro": "Program manager"
 },
 "BU-12": {
  "st": "bringup",
  "w": [
   13,
   18
  ],
  "s": [
   [
    1,
    "Set the sample readiness criteria",
    0.75
   ],
   [
    2,
    "Select and screen the sample units",
    1.25
   ],
   [
    3,
    "Assemble the customer documentation and errata pack",
    1,
    1
   ],
   [
    4,
    "Assemble the release package",
    1.5
   ],
   [
    5,
    "Establish the feedback channel",
    1,
    1
   ],
   [
    6,
    "Ship the samples and set up support",
    1.5
   ]
  ],
  "o": [
   "Sample readiness criteria",
   "Screened and selected sample units",
   "Customer documentation and errata pack",
   "Assembled release package",
   "Feedback channel",
   "Shipped samples with support in place"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "BU-D7",
    "produces"
   ],
   [
    "BU-D4",
    "feeds"
   ]
  ],
  "ro": "Product marketing"
 },
 "MP-01": {
  "st": "qualification",
  "w": [
   0,
   6
  ],
  "s": [
   [
    1,
    "Select the applicable standards — JEDEC, AEC and customer",
    1
   ],
   [
    2,
    "Define the stress matrix and sample sizes",
    1.5
   ],
   [
    3,
    "Define the qualification vehicles and lots",
    1,
    1
   ],
   [
    4,
    "Book the lab and chamber capacity",
    1.5
   ],
   [
    5,
    "Collect the customer qualification requirements",
    1,
    1
   ],
   [
    6,
    "Review the plan and release it",
    2
   ]
  ],
  "o": [
   "Applicable standard selection",
   "Stress matrix with sample sizes",
   "Qualification vehicle and lot definition",
   "Chamber and lab bookings",
   "Customer requirement record",
   "Customer-specific stress additions to the plan",
   "Reviewed and released qualification plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   5,
   6
  ],
  "r": [
   [
    "MP-D1",
    "produces"
   ],
   [
    "MP-D5",
    "informs"
   ]
  ],
  "ro": "Reliability engineer"
 },
 "MP-02": {
  "st": "qualification",
  "w": [
   5,
   23
  ],
  "s": [
   [
    1,
    "Prepare the samples and run pre-stress characterization",
    1.5
   ],
   [
    2,
    "Load the stress chambers and start the campaign",
    2
   ],
   [
    3,
    "Execute uHAST and THB",
    3,
    1
   ],
   [
    4,
    "Execute HTOL",
    6
   ],
   [
    5,
    "Take interim readouts at the defined intervals",
    3,
    1
   ],
   [
    6,
    "Execute temperature cycle and HTS",
    4.5
   ],
   [
    7,
    "Analyze the stress failures",
    2.5,
    1
   ],
   [
    8,
    "Take the final readout, analyze and report",
    4
   ]
  ],
  "o": [
   "Pre-stress characterization baseline",
   "Loaded stress campaign",
   "uHAST and THB results",
   "HTOL results",
   "Interim readout data",
   "Temperature cycle and HTS results",
   "Stress failure analyses",
   "Reliability data package"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "MP-D2",
    "produces"
   ],
   [
    "MP-D1",
    "feeds"
   ]
  ],
  "ro": "Reliability engineer"
 },
 "MP-03": {
  "st": "qualification",
  "w": [
   6,
   12
  ],
  "s": [
   [
    1,
    "Write the ESD and latch-up test plan and classify the pins",
    1
   ],
   [
    2,
    "Characterize HBM ESD",
    1.5
   ],
   [
    3,
    "Review the pin classification and protection",
    1,
    1
   ],
   [
    4,
    "Characterize CDM ESD",
    1.5
   ],
   [
    5,
    "Analyze the ESD failures",
    1,
    1
   ],
   [
    6,
    "Run the latch-up test and report",
    2
   ]
  ],
  "o": [
   "ESD and latch-up test plan",
   "HBM ESD classification",
   "Pin classification and protection review",
   "CDM ESD classification",
   "ESD failure analyses",
   "Latch-up test results and report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "r": [
   [
    "MP-D2",
    "feeds"
   ],
   [
    "MP-D8",
    "feeds"
   ]
  ],
  "ro": "ESD engineer"
 },
 "MP-04": {
  "st": "qualification",
  "w": [
   8,
   20
  ],
  "s": [
   [
    1,
    "Run MSL preconditioning and moisture classification",
    1.5
   ],
   [
    2,
    "Run board-level reliability — temperature cycling on board",
    2.5
   ],
   [
    3,
    "Correlate the solder joint reliability model",
    2,
    1
   ],
   [
    4,
    "Run drop and bend testing",
    3
   ],
   [
    5,
    "Track warpage and co-planarity through stress",
    2,
    1
   ],
   [
    6,
    "Run package-level readout and acoustic imaging",
    2.5
   ],
   [
    7,
    "Analyze the package failures",
    1.5,
    1
   ],
   [
    8,
    "Analyze the results and write the qualification report",
    2.5
   ]
  ],
  "o": [
   "MSL classification",
   "Board-level reliability results",
   "Solder joint reliability model correlation",
   "Drop and bend results",
   "Warpage and co-planarity through stress",
   "Package readout and acoustic imaging",
   "Package failure analyses",
   "Package qualification report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "MP-D2",
    "produces"
   ],
   [
    "MP-D1",
    "feeds"
   ]
  ],
  "ro": "Package reliability engineer"
 },
 "MP-05": {
  "st": "qualification",
  "w": [
   2,
   22
  ],
  "s": [
   [
    1,
    "Build the yield data pipeline and establish the baseline",
    2
   ],
   [
    2,
    "Build the failure pareto by bin and failure mode",
    3.5
   ],
   [
    3,
    "Analyze wafer-level spatial signatures",
    3,
    1
   ],
   [
    4,
    "Analyze defects and establish root causes",
    4.5
   ],
   [
    5,
    "Split the yield across assembly and test",
    3,
    1
   ],
   [
    6,
    "Drive corrective actions and yield improvement",
    5
   ],
   [
    7,
    "Detect and respond to excursions",
    3,
    1
   ],
   [
    8,
    "Maintain the yield model against the cost target",
    5
   ]
  ],
  "o": [
   "Yield data pipeline and baseline",
   "Failure pareto by bin and mode",
   "Spatial signature analysis",
   "Defect root causes",
   "Assembly and test yield split",
   "Corrective actions and improvement record",
   "Excursion detection and responses",
   "Yield model against cost target"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "MP-D4",
    "produces"
   ],
   [
    "MP-D5",
    "feeds"
   ]
  ],
  "ro": "Yield engineer"
 },
 "MP-06": {
  "st": "qualification",
  "w": [
   10,
   19
  ],
  "s": [
   [
    1,
    "Freeze the release candidate program",
    1
   ],
   [
    2,
    "Validate the guard bands against characterization",
    2
   ],
   [
    3,
    "Analyze test escapes and over-kill",
    1.5,
    1
   ],
   [
    4,
    "Validate the production flow on volume lots",
    2
   ],
   [
    5,
    "Adjust the limits and re-validate",
    1.5,
    1
   ],
   [
    6,
    "Qualify the program and sign it off",
    2
   ],
   [
    7,
    "Port to the production testers and correlate",
    1.25,
    1
   ],
   [
    8,
    "Release under version control",
    2
   ]
  ],
  "o": [
   "Frozen release candidate",
   "Guard-band validation results",
   "Escape and over-kill analysis",
   "Production flow validation on volume lots",
   "Limit adjustments",
   "Program qualification and signoff",
   "Tester porting and correlation",
   "Released, version-controlled production programs"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "MP-D3",
    "produces"
   ],
   [
    "MP-D5",
    "feeds"
   ]
  ],
  "ro": "Product engineering"
 },
 "MP-07": {
  "st": "qualification",
  "w": [
   14,
   23
  ],
  "s": [
   [
    1,
    "Assess multi-site feasibility on the production hardware",
    1
   ],
   [
    2,
    "Convert the load board and probe card to multi-site",
    2
   ],
   [
    3,
    "Reduce test time on the released content",
    1.5,
    1
   ],
   [
    4,
    "Adapt the programs for parallel sites",
    2
   ],
   [
    5,
    "Analyze site-to-site variation",
    1.5,
    1
   ],
   [
    6,
    "Correlate and validate the multi-site flow",
    2
   ],
   [
    7,
    "Update the throughput and capacity model",
    1.25,
    1
   ],
   [
    8,
    "Release the converted flow",
    2
   ]
  ],
  "o": [
   "Multi-site feasibility assessment",
   "Target site-count decision",
   "Converted multi-site load board and probe card",
   "Test time reduction on released content",
   "Adapted parallel programs",
   "Site-to-site variation analysis",
   "Multi-site correlation and validation",
   "Updated throughput and capacity model",
   "Released converted flow"
  ],
  "ob": [
   1,
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "MP-D3",
    "feeds"
   ],
   [
    "MP-D6",
    "feeds"
   ]
  ],
  "ro": "Test engineer"
 },
 "MP-08": {
  "st": "qualification",
  "w": [
   8,
   17
  ],
  "s": [
   [
    1,
    "Design the split lots across the process corners",
    1
   ],
   [
    2,
    "Fabricate and track the split lots",
    2
   ],
   [
    3,
    "Analyze parametric spread and Cpk",
    1.5,
    1
   ],
   [
    4,
    "Characterize the corners on the split material",
    2
   ],
   [
    5,
    "Assess the design margin at the corners",
    1.5,
    1
   ],
   [
    6,
    "Correlate the corners against the models",
    2
   ],
   [
    7,
    "Recommend the process window",
    1.25,
    1
   ],
   [
    8,
    "Sign off the corners and report",
    2
   ]
  ],
  "o": [
   "Split-lot design",
   "Fabricated and tracked split lots",
   "Parametric spread and Cpk analysis",
   "Corner characterization results",
   "Design margin at the corners",
   "Corner-to-model correlation",
   "Process window recommendation",
   "Corner signoff report"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "MP-D4",
    "feeds"
   ],
   [
    "MP-D1",
    "feeds"
   ]
  ],
  "ro": "Product engineering"
 },
 "MP-09": {
  "st": "qualification",
  "w": [
   18,
   24
  ],
  "s": [
   [
    1,
    "Set the readiness criteria and collect the evidence",
    1
   ],
   [
    2,
    "Hold the cross-functional readiness review",
    1.5
   ],
   [
    3,
    "Establish change control and the document baseline",
    1,
    1
   ],
   [
    4,
    "Close the gaps and track the conditional items",
    1.5
   ],
   [
    5,
    "Escalate the unresolved items",
    1,
    1
   ],
   [
    6,
    "Sign off and establish the PCN process",
    2
   ]
  ],
  "o": [
   "Readiness criteria and collected evidence",
   "Cross-functional review record",
   "Change control and document baseline",
   "Gap closure and conditional item tracking",
   "Escalation record",
   "Signed-off readiness and established PCN process",
   "Mass production release record"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   6
  ],
  "r": [
   [
    "MP-D5",
    "produces"
   ],
   [
    "MP-D9",
    "produces"
   ]
  ],
  "ro": "Program manager"
 },
 "MP-10": {
  "st": "qualification",
  "w": [
   10,
   22
  ],
  "s": [
   [
    1,
    "Confirm the demand forecast and volume commitment",
    1.5
   ],
   [
    2,
    "Commit the wafer, substrate and HBM supply",
    2.5
   ],
   [
    3,
    "Analyze lead times and buffers",
    2,
    1
   ],
   [
    4,
    "Commit the assembly and test capacity",
    2.5
   ],
   [
    5,
    "Compute the cost per unit at volume",
    2,
    1
   ],
   [
    6,
    "Build the ramp plan and build schedule",
    2.5
   ],
   [
    7,
    "Set up logistics and distribution",
    1.5,
    1
   ],
   [
    8,
    "Assess supply chain risk and set the second-source plan",
    3
   ]
  ],
  "o": [
   "Demand forecast and volume commitment",
   "Wafer, substrate and HBM supply commitments",
   "Lead time and buffer analysis",
   "Assembly and test capacity commitments",
   "Cost per unit at volume",
   "Ramp plan and build schedule",
   "Logistics and distribution setup",
   "Supply chain risk and second-source plan"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "MP-D6",
    "produces"
   ],
   [
    "MP-D4",
    "feeds"
   ]
  ],
  "ro": "Operations manager"
 },
 "MP-11": {
  "st": "qualification",
  "w": [
   10,
   22
  ],
  "s": [
   [
    1,
    "Scope the applicable standards and certifications",
    1.5
   ],
   [
    2,
    "Run PCIe/CXL compliance testing at a plugfest",
    2.5
   ],
   [
    3,
    "Remediate the compliance failures",
    2,
    1
   ],
   [
    4,
    "Run EMC and safety testing",
    2.5
   ],
   [
    5,
    "Prepare the documentation and declarations",
    2,
    1
   ],
   [
    6,
    "Close materials compliance — RoHS, REACH, conflict minerals",
    2.5
   ],
   [
    7,
    "Complete the export classification",
    1.5,
    1
   ],
   [
    8,
    "Obtain the certificates and registrations",
    3
   ]
  ],
  "o": [
   "Applicable standards and scope",
   "PCIe/CXL compliance test results",
   "Remediation record",
   "EMC and safety test results",
   "Compliance documentation and declarations",
   "Materials compliance declarations",
   "Export classification",
   "Issued certificates and registrations"
  ],
  "ob": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "MP-D7",
    "produces"
   ],
   [
    "MP-D8",
    "feeds"
   ]
  ],
  "ro": "Compliance engineer"
 },
 "MP-12": {
  "st": "qualification",
  "w": [
   14,
   24
  ],
  "s": [
   [
    1,
    "Set the documentation scope and ownership",
    1.5
   ],
   [
    2,
    "Write the datasheet from the characterization data",
    2
   ],
   [
    3,
    "Trace every parameter to its measurement",
    1.5,
    1
   ],
   [
    4,
    "Write the user guide and programming model",
    2
   ],
   [
    5,
    "Produce the localized and formatted outputs",
    1.5,
    1
   ],
   [
    6,
    "Write the errata and application notes",
    2
   ],
   [
    7,
    "Establish revision and distribution control",
    1.5,
    1
   ],
   [
    8,
    "Run the technical review, approve and release",
    2.5
   ]
  ],
  "o": [
   "Documentation scope and ownership matrix",
   "Reviewed and released documentation set",
   "Datasheet",
   "Parameter traceability record",
   "User guide and programming model documentation",
   "Localized and formatted documentation outputs",
   "Errata and application notes",
   "Revision and distribution control scheme",
   "Approval and release record"
  ],
  "ob": [
   1,
   8,
   2,
   3,
   4,
   5,
   6,
   7,
   8
  ],
  "r": [
   [
    "MP-D8",
    "produces"
   ],
   [
    "MP-D9",
    "feeds"
   ]
  ],
  "ro": "Technical writer"
 }
};

export const stepsOf = (id: string): ActivityStepEntry | undefined => activitySteps[id];

/** The activities a stage runs, in template order. */
export const activitiesOfStage = (stage: string): string[] =>
  Object.keys(activitySteps).filter((id) => activitySteps[id].st === stage);
