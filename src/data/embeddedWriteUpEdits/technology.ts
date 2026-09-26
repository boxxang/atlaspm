import type { WriteUpEdit } from './types';

/** TECH: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const TECH_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'TECH-01': {
    purpose: [
      'Narrow the field of foundries and nodes to a short-list the program can evaluate — mature nodes that offer embedded MRAM, ultra-low-leakage devices and the I/O voltages the product needs — and record why the others were dropped.',
      'Completing this work early provides a clear basis for downstream design decisions and reduces late rework, schedule risk, and integration issues.',
    ],
    roles: [
      { r: 'Technology strategist', d: 'Owns the screen, the short-list and the selection proposal' },
      { r: 'Foundry relationship manager', d: 'Engagement and information requests' },
      { r: 'Program manager', d: 'Availability windows against the program schedule' },
      { r: 'Compliance liaison', d: 'Export control and supply-continuity screen' },
      { r: 'Chief architect', d: 'Confirms the criteria reflect what the product needs' },
    ],
    terms: ['PPA', 'PDK', 'IP', 'eMRAM'],
  },

  'TECH-02': {
    purpose: [
      'Establish where each candidate node, and its embedded MRAM option in particular, is on its maturity curve — risk production timing, defect density trend, yield learning rate, qualified products — and turn that into a risk assessment the program plans against.',
      'On a mature node the logic process is rarely the problem; the eMRAM module added to it often is younger, with less yield learning, fewer qualified products and retention and endurance data still accumulating. An option chosen too early gives the program the foundry’s learning curve as a yield and qualification problem, and the schedule to absorb it was never in the plan.',
    ],
    terms: ['PPA', 'NDA', 'DTCO', 'eMRAM'],
  },

  'TECH-03': {
    purpose: [
      'Put the legal frame in place that everything technical depends on—NDA, design agreement, PDK and library licensing, the eMRAM macro and foundry IP frame, and liability terms—and execute it.',
      'This is the longest activity in the stage at eight weeks and one of the smallest at 1.6 M/M, which is exactly the shape it should have: the elapsed time belongs to two legal departments and almost none of the work belongs to the program. It is on the critical path anyway, because production PDK access, memory compilers, the eMRAM macro and foundry IP all sit behind the design agreement.',
    ],
    terms: ['M/M', 'NDA', 'PDK', 'DTCO', 'IP', 'IO', 'CAD', 'eMRAM'],
  },

  'TECH-04': {
    purpose: [
      'Measure the candidate nodes against this product’s targets rather than against the foundry’s brochure—density, active energy per operation, leakage at maximum temperature, SRAM Vmin and retention voltage, and routing resource, on circuits that resemble the design.',
      'Completing this work early provides a clear basis for downstream design decisions and reduces late rework, schedule risk, and integration issues.',
    ],
    flowNote:
      'Three of the seven steps run in parallel because they use different data and different people—the comparison against targets, the DTCO studies and the sensitivity sweep are separable. What cannot be parallelized is step 7: the summary needs all three to have landed.',
    effortLabels: [
      'Density and frequency studies',
      'Leakage and SRAM characterization',
      'Node comparison',
      'Congestion proxy study',
      'Findings and node ranking',
    ],
  },

  'TECH-05': {
    purpose: [
      'Choose the flavor of the node, not just the node—the low-power process variant, the multi-Vt menu with its ultra-low-leakage devices, the metal stack, the embedded MRAM module, and the 5 V-tolerant I/O and analog options the product needs.',
      'A node name is not a specification. Two programs on the same node with different flavor sheets get different density, different leakage and different cost, and on a part sold on sleep current the difference is larger than most architectural decisions.',
    ],
    flowNote:
      'The last step is signature time rather than engineering time. The sheet is a contractual artifact: once agreed it governs what the PDK contains and what the wafer costs, and changing it later reopens both.',
    consumes: [
      'Short-list from TECH-01',
      'PPA targets from DEF-05',
      'DTCO findings as they emerge from TECH-04',
      'Die size and pad-limit direction from ARCH-02',
      'Analog peripheral and I/O voltage requirements from ARCH-03',
    ],
    roles: [
      { r: 'Technology strategist', d: 'Owns the flavor sheet and its agreement' },
      { r: 'Library and CAD lead', d: 'Multi-Vt menu and library implications' },
      { r: 'Physical design liaison', d: 'Metal stack and routing resource' },
      { r: 'Analog lead', d: 'Power manager, oscillator, ADC and 5 V I/O requirements' },
      { r: 'Foundry technical account manager', d: 'Availability of each option on the node' },
    ],
    effortLabels: [
      'Flavor and Vt studies',
      'Metal stack selection',
      'eMRAM, analog and I/O adder evaluation',
      'Sheet agreement',
    ],
    measuredBy: [
      'Options on the sheet against those the design actually uses',
      'Sheet amendments raised after agreement',
      'Routing layers against what the congestion study called for',
    ],
    terms: ['PPA', 'NRE', 'PDK', 'DTCO', 'CAD', 'eMRAM'],
  },

  'TECH-06': {
    purpose: [
      'Put a price on the technology—wafers at the forecast volume, the mask set, the NRE, the MPW shuttle, the eMRAM module adder and every other adder the flavor sheet carries—and hand it to the cost model as quotations rather than estimates.',
      'Completing this work early provides a clear basis for downstream design decisions and reduces late rework, schedule risk, and integration issues.',
    ],
    terms: ['PPA', 'NRE', 'MPW', 'eMRAM'],
  },

  'TECH-07': {
    flowNote:
      'Steps 4 and 5 look like details and behave like insurance. Hot-lot priority is what takes weeks out of the engineering lot’s cycle through FAB-06, and it is only available to programs that negotiated it before they needed it.',
  },

  'TECH-08': {
    purpose: [
      'Decide, deliberately, whether the program accepts single-source risk—and if it does not, what dual-sourcing or migration readiness would cost in area, schedule and IP.',
      'Most programs built on embedded MRAM end up single-source, because few foundries offer it on a given node and no two offer the same macro, and that is a defensible answer. What is not defensible is arriving there by default.',
    ],
    risks: [
      'Second source assumed to be a simple database port, when the eMRAM macro, its trim and its qualification differ by foundry',
      'IP portability accepted without checking vendor and node support',
      'Qualification and package changes excluded from migration planning',
      'Contingency cost ignored in the business case',
      'Backup strategy defined without clear trigger conditions',
    ],
    roles: [
      { r: 'Technology strategist', d: 'Owns the sourcing decision proposal' },
      { r: 'IP strategist', d: 'Portability of the IP bill of materials, eMRAM macro included' },
      { r: 'Physical design liaison', d: 'Design rule and library delta impact' },
      { r: 'Procurement lead', d: 'Capacity and commercial viability of an alternative' },
      { r: 'Program manager', d: 'Carries the accepted exposure into the risk register' },
    ],
    effortLabels: [
      'Migration cost and schedule estimate',
      'Second-source viability screen',
      'IP portability and rule delta',
      'Sourcing strategy',
    ],
    terms: ['IP', 'RTL', 'eMRAM'],
  },

  'TECH-09': {
    purpose: [
      'Open the backend supply chain early—OSAT capability and capacity for QFN, FC-CSP and WLCSP, leadframe and substrate suppliers, wafer sort and final test capacity, and the foundry-to-OSAT logistics model—so package design starts against real constraints.',
      'On a small-package part the backend is not exotic, but it is still a second supply chain with its own lead times, its own capacity and its own qualification, and eMRAM adds constraints of its own: the assembly reflow profile and any magnetic exposure in handling must stay inside what the memory survives. A program that starts asking at <code>EPKG-05</code> is asking late.',
    ],
    flowNote:
      'Step 7 should settle one argument before it happens. When a packaged unit fails, whether the die or the assembly is responsible is a contractual question, and settling it while nobody has lost money is far easier than settling it afterwards.',
    consumes: [
      'Package options from the product requirements',
      'Selected foundry and node from TECH-01',
      'Volume and ramp profile from the business case',
      'OSAT, leadframe and substrate supplier capability data',
      'Wafer sort capability, including eMRAM trim, at the foundry or the OSAT',
    ],
    rel: {
      'TECH-D5':
        '<b>Wafer, mask and NRE cost sheet.</b> Leadframe, assembly and test pricing is the backend half of the technology cost, and the cost model needs both.',
      'TECH-D1':
        '<b>Technology selection report.</b> Wafer sort with eMRAM trim, and the logistics from fab to OSAT, depend on the foundry chosen, so backend capability belongs in the selection record.',
    },
    risks: [
      'OSAT engagement started after the package is fixed',
      'Leadframe or substrate lead times omitted from early schedule planning',
      'Supplier capability assumed from generic technology claims',
      'Backend capacity risk evaluated only after wafer capacity is secured',
      'Package and test dependencies not reflected in the program schedule',
    ],
    roles: [
      { r: 'Backend supply chain lead', d: 'Owns the OSAT, leadframe and substrate engagement' },
      { r: 'Package architect', d: 'States the capability the package will need' },
      { r: 'Procurement lead', d: 'Capacity indication and commercial engagement' },
      { r: 'Quality liaison', d: 'Die quality responsibility and failure ownership' },
      { r: 'Operations planner', d: 'Logistics, transit and customs model' },
    ],
    entry: [
      'Package options stated in the product requirements',
      'Foundry selected, so sort and logistics options are known',
      'Volume and ramp profile available',
    ],
    measuredBy: [
      'OSAT capacity indicated against the ramp requirement',
      'Weeks between backend engagement and package selection',
      'Leadframe and substrate lead time against the wafer-out date',
    ],
    terms: ['NRE', 'OSAT', 'QFN', 'FC-CSP', 'WLCSP', 'eMRAM'],
  },
};
