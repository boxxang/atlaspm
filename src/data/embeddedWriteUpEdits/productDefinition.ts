import type { WriteUpEdit } from './types';

/** DEF: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const DEF_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'DEF-01': {
    consumes: [
      'Customer RFI / RFQ responses',
      'Previous-generation field feedback and known issues',
      'Market forecasts, segment sizing and sales pipeline volumes',
      'Competitor MCU, DSP and edge NPU specifications and public benchmarks',
      'Toolchain, RTOS and board expectations from the customers’ existing designs',
    ],
    rel: {
      'DEF-D2':
        '<b>Target specification — energy, performance, area and KPI table.</b> Each ranked requirement becomes a KPI line that <code>DEF-05</code> converts into a number. A target that cannot be traced back to a requirement is a target no customer asked for.',
    },
    terms: ['TAT', 'PPA', 'KPI', 'ASP', 'PRD', 'RFI', 'RFQ', 'ID', 'MCU', 'DSP', 'NPU', 'RTOS'],
  },

  'DEF-02': {
    flowNote:
      'Normalization runs in parallel because it is time-consuming and independent of data collection. Vendors quote microamps per megahertz, sleep current and inference energy at different voltages, clocks, temperatures and memory configurations, and none of the published figures are comparable until they have been restated as energy per task on a common workload at a stated voltage, clock and duty cycle.',
    consumes: [
      'Competitor datasheets, disclosures and conference material',
      'Public benchmark results — EEMBC CoreMark and ULPMark, published inference energy',
      'Foundry process roadmaps and node timing',
      'Analyst forecasts for competitor launches',
      'Competitive insights from sales and customer engagement',
    ],
    terms: ['ASP', 'MCU', 'DSP', 'NPU'],
  },

  'DEF-03': {
    consumes: [
      'Product requirements from DEF-01',
      'Customer models, code and sensor traces, where permitted by NDA',
      'Incumbent MCU and DSP boards for the baseline runs',
      'Public models and benchmark workloads',
      'Expected deployment mix and duty cycle by target segment',
    ],
    rel: {
      'DEF-D2':
        '<b>Target specification — energy, performance, area and KPI table.</b> This activity derives the KPI half of the deliverable; <code>DEF-05</code> derives the energy, performance and area half. The two are published as a single table.',
    },
    risks: [
      '<b>Workloads that do not represent real customer usage</b>',
      '<b>Limited access to customer models and code due to NDA restrictions</b>',
      '<b>Duty cycle based on estimates rather than measured deployments</b>',
      '<b>Undefined precision and quantization policy</b>',
      '<b>KPIs without clearly defined operating conditions — voltage, temperature and duty cycle</b>',
    ],
    roles: [
      { r: 'Workload architect', d: 'Owns the workload suite and the KPI derivation' },
      { r: 'Embedded applications engineer', d: 'Workload capture, baseline runs with current measurement and the precision study' },
      { r: 'Systems analyst', d: 'Deployment mix, duty cycle and sensitivity analysis' },
      { r: 'Customer engagement', d: 'Obtains customer models and code and confirms they are representative' },
      { r: 'Architecture and compiler liaison', d: 'Accepts the handoff and confirms the suite can be compiled and modeled' },
    ],
    effortLabels: [
      'Workload capture and baseline runs',
      'KPI derivation',
      'Sensitivity study',
      'Precision and quantization policy',
      'Suite packaging and handoff',
    ],
    entry: [
      'Requirement register at v0.9 or better',
      'Lab access to incumbent MCU and DSP boards with current measurement',
      'NDA coverage for any customer-supplied model or code',
    ],
    exit: [
      'Each KPI is linked to a defined workload and test conditions, including duty cycle',
      'Workload suite runs end to end on the incumbent baseline boards',
      'The architecture and compiler teams confirm the workloads are ready for modeling and compilation.',
    ],
    measuredBy: [
      'KPIs traceable to a workload',
      'Workloads with a measured energy baseline',
      'Spread between the sensitivity study and the eventual ARCH-01 model',
    ],
    terms: ['PPA', 'KPI', 'PRD', 'NDA', 'INT8', 'ML', 'MCU', 'DSP'],
  },

  'DEF-04': {
    purpose: [
      '<b>Define the on-die memory the target workloads need — eMRAM for code and model weights, SRAM for working data — and the peripheral, debug and boot interfaces, and translate them into a pin and package budget.</b>',
      'These decisions directly affect die area, package and product cost. eMRAM and SRAM are among the largest area lines on the die, and the peripheral and GPIO count sets the pin count, which decides whether the part fits a QFN or needs an FC-CSP or WLCSP. Defining these requirements early reduces the risk of costly changes later in the program.',
    ],
    flowNote:
      'Step 5 is the step that creates the commitment. A peripheral list does not constrain any downstream team. The same list expressed as a pin count and a package option constrains the pad ring, the package choice, the EVK and the cost model at the same time.',
    consumes: [
      'Workload suite and KPI targets from DEF-03',
      'Capacity, retention and interface requirements from the product requirements',
      'eMRAM macro sizes and availability on the candidate nodes',
      'Peripheral sets and pin-outs of the incumbent MCUs customers design with',
      'Pin counts and body sizes for QFN, FC-CSP and WLCSP options',
    ],
    rel: {
      'DEF-D1':
        '<b>Product requirements document.</b> Memory capacity, peripheral counts and interfaces enter the PRD as numbered requirements rather than as qualitative statements.',
      'DEF-D2':
        '<b>Target specification.</b> Memory capacities become KPI lines, and the pin budget becomes an area and package constraint on the energy, performance and area half of the table.',
    },
    risks: [
      '<b>Memory sized for today’s models rather than those customers will deploy over the product’s life</b>',
      '<b>Code, data and model capacity treated as one number</b>',
      '<b>eMRAM read bandwidth and wake latency not checked against the workloads</b>',
      '<b>Peripheral set defined without a pin and package budget</b>',
      '<b>Pin multiplexing deferred without clear assumptions</b>',
    ],
    roles: [
      { r: 'Memory systems architect', d: 'Owns memory sizing and the capacity table' },
      { r: 'Interface architect', d: 'Selects the peripherals and the debug, programming and boot interfaces' },
      { r: 'Workload analyst', d: 'Extracts code, data and model size from the workload suite' },
      { r: 'Package liaison', d: 'Confirms the pin budget fits a package option' },
      { r: 'Architecture liaison', d: 'Carries the requirement into ARCH-03 and ARCH-04' },
    ],
    effortLabels: ['Memory demand and sizing', 'Peripheral and interface definition', 'Pin budget translation and review'],
    entry: [
      'Workload suite available from DEF-03',
      'Requirement register carries capacity, retention and interface requirements',
      'eMRAM macro options indicated for the candidate nodes',
    ],
    exit: [
      'Code, data and model capacity is defined for each workload, with retention needs per operating mode',
      'eMRAM and SRAM capacity, peripheral counts and interfaces are defined with clear rationale.',
      'Package team confirms the pin budget fits a package option',
    ],
    measuredBy: [
      'Capacity headroom against the largest workload',
      'Pin budget against the selected package’s pin count',
      'Peripheral changes still open at architecture freeze',
    ],
    terms: ['KPI', 'PRD', 'SRAM', 'eMRAM', 'QFN', 'FC-CSP', 'WLCSP', 'EVK', 'MCU'],
  },

  'DEF-05': {
    purpose: [
      '<b>Translate the KPI targets into clock, energy, current and die-area budgets for each operating mode, and allocate them to each block</b>',
      'Program-level targets only become actionable when they are assigned to specific owners. For example, a battery-life target at a stated duty cycle should be broken down into active energy per task and sleep and deep-sleep current, by domain and by block. This makes budget overruns visible early, when the design can still be adjusted without impacting the product or requiring a respin.',
    ],
    consumes: [
      'KPI targets from DEF-03',
      'Block list and IP reuse plan from the architecture definition',
      'Node PPA and leakage data from TECH-04',
      'Previous-generation energy, leakage and area data',
      'Battery, supply range and duty-cycle assumptions from the product requirements',
    ],
    rel: {
      'DEF-D2':
        '<b>Target specification — energy, performance, area and KPI table.</b> This activity defines the energy, performance and area targets. <code>DEF-03</code> defines the KPI targets, and both are combined into a single target specification.',
      'DEF-D3':
        '<b>Product cost and margin model.</b> The die area budget sets the die per wafer, and with the package it is the largest input to the cost model.',
    },
    risks: [
      'Energy and clock targets that exceed realistic process capability',
      'Sleep and deep-sleep current budgets set at room temperature rather than at maximum temperature',
      'Area budgets that do not account for IP reuse',
      'Budgets without clear owners',
      'Targets finalized before the DEF-07 feasibility assessment',
    ],
    roles: [
      { r: 'PPA lead', d: 'Owns the budget tree and its allocation' },
      { r: 'Architect', d: 'Supplies clock and cycles-per-task assumptions and the block list' },
      { r: 'Power analyst', d: 'Decomposes the energy and current budgets and sets the voltage and Vt strategy' },
      { r: 'Physical design liaison', d: 'Confirms the clock and area targets are achievable on the node' },
      { r: 'Stage lead', d: 'Arbitrates when two blocks contest the same budget' },
    ],
    effortLabels: [
      'Clock and energy budgets',
      'Die area budget',
      'Node sensitivity',
      'Per-block allocation',
      'Review and arbitration',
    ],
    exit: [
      'Clock, energy, current and area targets include clearly defined assumptions — voltage, temperature and duty cycle',
      'Each block has an allocated budget and a clear owner',
      'Architecture and physical design approve the targets.',
    ],
    terms: ['PPA', 'KPI', 'IP'],
  },

  'DEF-06': {
    flowNote:
      'The sensitivity analysis in step 7 is not optional. On a mature-node part in a small package, cost is dominated by die area, the eMRAM process adder and test time — eMRAM trim adds tester seconds to every die — and at this point in the program all three are assumptions rather than quoted prices.',
    consumes: [
      'Die area budget from DEF-05',
      'Wafer, mask and NRE cost estimate from TECH-06',
      'Package options from the product requirements — QFN, FC-CSP or WLCSP',
      'eMRAM process adder and trim-time estimate',
      'Volume forecast and target ASP',
    ],
    risks: [
      '<b>Yield assumptions that ignore the eMRAM module’s own defect density</b>',
      '<b>Package costs underestimated in the overall cost model</b>',
      '<b>Test costs without clear test-time and eMRAM trim-time assumptions</b>',
      '<b>ASP based on a single-point estimate</b>',
      '<b>Die area estimates without sufficient margin</b>',
    ],
    roles: [
      { r: 'Product cost analyst', d: 'Owns the cost model and its assumptions' },
      { r: 'Yield engineer', d: 'Supplies defect density and yield curves per node, with the eMRAM module' },
      { r: 'Package cost liaison', d: 'Supplies leadframe, substrate and assembly pricing per package option' },
      { r: 'Test engineering liaison', d: 'Supplies test time, eMRAM trim time and tester rate assumptions' },
      { r: 'Finance partner', d: 'Owns volume, ASP and margin treatment' },
    ],
    terms: ['PPA', 'KPI', 'NRE', 'ASP', 'DFT', 'eMRAM', 'QFN', 'FC-CSP', 'WLCSP'],
  },

  'DEF-07': {
    flowNote:
      'The concession list is the part of the deliverable that actually gets used. A binary verdict gives the decision review nothing to act on. A list stating "this node, with the deep-sleep current target met at 85 °C but not at 105 °C, and the ADC licensed rather than designed internally" gives the review a decision it can make.',
    rel: {
      'DEF-D6':
        '<b>Kickoff Go / No-Go decision record.</b> A No-Go finding from this activity is the only mechanism in the stage that can stop the program, and it has to reach the decision review without being edited.',
    },
    risks: [
      '<b>Feasibility assessed after the node has been selected.</b>',
      '<b>Optimistic assessment at the boundary.</b>',
      '<b>eMRAM and IP availability taken from the roadmap rather than a qualified release.</b>',
      '<b>Sleep current checked at room temperature rather than at maximum temperature.</b>',
      '<b>Required tradeoffs identified without their impact being quantified</b>',
    ],
    roles: [
      { r: 'Feasibility lead', d: 'Owns the verdict and the concession list' },
      { r: 'PPA analyst', d: 'Assesses achievability per node against the DEF-05 targets' },
      { r: 'IP strategist', d: 'Assesses eMRAM and IP availability and porting status per node' },
      { r: 'Package and power liaison', d: 'Assesses package fit and sleep current at maximum temperature' },
      { r: 'Stage lead', d: 'Carries the verdict into the gate review' },
    ],
    effortLabels: [
      'Energy and area achievability per node',
      'IP and cost checks',
      'Package and sleep-current feasibility',
      'Concession list and verdict',
    ],
    terms: ['PPA', 'DTCO', 'IP', 'eMRAM'],
  },

  'DEF-08': {
    flowNote:
      'The supplier lead-time overlay runs in parallel and changes more dates than the internal plan does. The eMRAM macro release, the probe card and the leadframe tooling each carry months of lead time, they are ordered against dates this activity sets, and once ordered they are outside the program’s control.',
    consumes: [
      'Program milestones and stage baselines',
      'Effort estimates by activity, including the compiler, SDK and EVK',
      'Available engineering capacity and existing program commitments',
      'Supplier lead times — eMRAM macro, IP, masks, probe card, leadframe and EVK parts',
      'Required tradeoffs from DEF-07',
    ],
    risks: [
      '<b>Staffing needs that exceed available engineering capacity</b>',
      '<b>Program baselines used without adjusting for actual scope</b>',
      '<b>Compiler, SDK and EVK work left out of the plan or treated as post-silicon work</b>',
      '<b>Supplier lead times not included in the program schedule</b>',
      '<b>Schedule buffers concentrated only at the end of the program</b>',
      '<b>Critical path not derived from actual task dependencies</b>',
    ],
    roles: [
      { r: 'Program manager', d: 'Owns the schedule, the buffers and the critical path' },
      { r: 'Resource manager', d: 'Owns capacity, the headcount curve and the hiring plan' },
      { r: 'Discipline leads', d: 'Confirm the effort roll-up for their own stages, compiler, SDK and EVK included' },
      { r: 'Procurement liaison', d: 'Supplies supplier lead times and order-by dates' },
      { r: 'Finance partner', d: 'Converts effort into budget' },
    ],
    terms: ['IP', 'eMRAM', 'SDK', 'EVK'],
  },

  'DEF-09': {
    purpose: [
      'Bring together the feasibility assessment, product cost model, and program plan <b>into a clear business case for the funding decision.</b> Provide a recommended decision supported by both the expected outcome and downside scenarios.',
      'This activity consolidates the analysis completed during product definition rather than creating new analysis. The business case should clearly show the expected return, the required investment — including the compiler, SDK and EVK that a new architecture cannot be sold without — the key risks, and the downside impact so decision-makers can make an informed Go / No-Go decision.',
    ],
    risks: [
      '<b>Business case based only on the expected scenario</b>',
      '<b>Compiler, SDK and EVK cost left out of the investment</b>',
      '<b>Approval conditions not formally documented</b>',
      '<b>Unresolved concerns or dissenting views not recorded</b>',
      '<b>Feasibility tradeoffs or risks understated during the funding review</b>',
      '<b>Go / No-Go decision authority not clearly defined</b>',
    ],
    terms: ['NRE', 'SDK', 'EVK'],
  },
};
