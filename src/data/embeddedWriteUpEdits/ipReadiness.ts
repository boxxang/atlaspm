import type { WriteUpEdit } from './types';

/** IPR: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const IPR_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'IPR-01': {
    roles: [
      { r: 'IP strategist', d: 'Owns the bill of materials and its traceability' },
      { r: 'Chief architect', d: 'Confirms the block list and its interfaces' },
      { r: 'Interface architect', d: 'Peripheral, USB PHY and analog IP identification' },
      { r: 'CAD and library lead', d: 'Foundry IP — memory compilers, the eMRAM macro, IO, cells' },
      { r: 'Program manager', d: 'Carries the bill into procurement planning' },
    ],
    terms: ['IP', 'PHY', 'IO', 'CAD', 'eMRAM'],
  },

  'IPR-03': {
    purpose: [
      'Take each line of the bill and decide, with a reason, whether it is made, bought or reused—and record what the rejected options would have cost.',
      'Make/buy is a schedule decision more than a cost one. Designing the ADC or the USB PHY internally is cheaper on paper and costs months of analog design; buying it costs a license and a vendor dependency.',
    ],
    flowNote:
      'Step 3 is the check that changes answers. A make decision assumes engineers who are also assigned to the regulators in PMU-03 and the PLL in PMU-02; capacity, not capability, is what usually decides.',
    consumes: [
      'IP bill of materials from IPR-01',
      'Reuse classification from IPR-02',
      'Analog design capacity and schedule from the PMU plan',
      'Sourcing strategy direction from TECH-08',
      'Cost model assumptions from DEF-06',
    ],
    roles: [
      { r: 'IP strategist', d: 'Owns the decisions and their record' },
      { r: 'Chief architect', d: 'Differentiation screen — what is the product’s own value' },
      { r: 'Analog design lead', d: 'Internal capacity for make candidates' },
      { r: 'Procurement lead', d: 'Buy-side cost and vendor landscape' },
      { r: 'Program manager', d: 'Schedule impact and capacity commitment' },
    ],
    entry: [
      'Bill of materials complete from IPR-01',
      'Reuse classification available from IPR-02',
      'Analog design capacity known from the PMU plan',
    ],
    terms: ['IP', 'PLL', 'PHY'],
  },

  'IPR-04': {
    purpose: [
      'Run a real evaluation of the vendors behind every buy decision—technical capability, deliverable quality, support model and track record—rather than choosing from a datasheet.',
      'An analog IP vendor — the USB PHY, the ADC — is a months-long dependency. What matters is less the block’s peak specification than whether the deliverables arrive complete, whether the support engineer answers, and whether the last three customers taped out on schedule.',
    ],
  },

  'IPR-05': {
    purpose: [
      'Establish, for each bought and reused block, whether it has run in silicon on this node and this process option—and if not, what it would take to get it there.',
      '"Silicon-proven" is the most abused phrase in IP procurement. It can mean proven on a different node, on a different process option, at a different temperature grade, or in a test chip that was never characterized. For the eMRAM macro it has to mean retention, endurance and reflow data on this node’s module.',
    ],
    roles: [
      { r: 'IP strategist', d: 'Owns the evidence standard and the readiness report' },
      { r: 'Technical evaluators', d: 'Evidence assessment per block' },
      { r: 'Analog design lead', d: 'Analog block and PHY evidence interpretation' },
      { r: 'Silicon validation liaison', d: 'Errata review and characterization data reading' },
      { r: 'Procurement lead', d: 'Uses findings as negotiating position before signature' },
    ],
    terms: ['PO', 'IP', 'PHY', 'eMRAM'],
  },

  'IPR-06': {
    purpose: [
      'Turn selections into executed licences and purchase orders with committed delivery dates, including the deliverable checklist as a contractual schedule.',
      'Twelve weeks for 3.5 M/M—this is the stage’s longest activity and among its smallest in effort, because the elapsed time belongs to two legal departments and a procurement process. It is on the critical path regardless: nothing arrives until it executes, and <code>RTL-07</code> has integration windows that assume it did.',
    ],
  },

  'IPR-08': {
    flowNote:
      'Step 3 decides who absorbs the risk. Vendor-executed hardening is on a schedule the program cannot influence; internally executed hardening competes with PMU-03 for the same analog engineers. Both are real answers and neither is free.',
    consumes: [
      'Readiness report and gap list from IPR-05',
      'Reuse classification from IPR-02',
      'Make / buy decisions from IPR-03',
      'Analog design capacity from the PMU plan',
      'Integration window requirements from RTL and PD',
    ],
    roles: [
      { r: 'IP strategist', d: 'Owns the hardening plan' },
      { r: 'Analog design lead', d: 'Internal capacity and analog porting scope' },
      { r: 'Verification lead', d: 'Re-verification scope and collateral' },
      { r: 'Vendor technical contacts', d: 'Vendor-executed hardening scope and schedule' },
      { r: 'Program manager', d: 'Dates, owners and integration window alignment' },
    ],
    entry: [
      'Readiness report available from IPR-05',
      'Analog design capacity known from the PMU plan',
      'Integration windows known from RTL and PD planning',
    ],
    measuredBy: [
      'Unproven blocks with a dated plan',
      'Internal hardening committed against analog design capacity',
      'Hardening completed against plan',
    ],
    terms: ['IP', 'PLL', 'PHY', 'RTL', 'DV'],
  },

  'IPR-09': {
    purpose: [
      'Line up every IP delivery date against the window that needs it—RTL integration, synthesis, floorplan—and surface the mismatches while they can still be fixed.',
      'An IP schedule is only meaningful against the design schedule. An analog macro delivered in week 40 is late for <code>RTL-07</code>, whose integration window closes at week 38, and early for the <code>PD-02</code> floorplan at week 44; what counts as late depends on which view, for which consumer.',
    ],
  },

  'IPR-10': {
    roles: [
      { r: 'IP strategist', d: 'Owns the register and the contingency plan' },
      { r: 'Program manager', d: 'Critical dependency identification and triggers' },
      { r: 'Procurement lead', d: 'Second-source viability and commercial options' },
      { r: 'Analog design lead', d: 'Internal fallback feasibility and capacity' },
      { r: 'Chief architect', d: 'Confirms which failures actually stop the program' },
    ],
    terms: ['IP', 'RTL'],
  },
};
