/**
 * UFND — Foundation IP & Design Environment. Weeks 8–22; closes on Design
 * Kickoff Ready.
 */
import type { UcieStageModule } from '../types';

export const UFND: UcieStageModule = {
  content: {
    tagline: 'Have the blocks, libraries, flows and verification IP in place the day circuit and RTL design start.',
    description:
      'Source or schedule the foundation blocks the PHY is built on — the reference PLL or DLL, ESD and I/O cells — and qualify the standard cells and memory compilers the D2D Adapter and Logical PHY need, including the retry buffer. Bring up the digital implementation flow on a reference block, the analog and mixed-signal flow for corner, Monte Carlo, extraction and reliability checks, and the co-simulation flow that runs analog models with RTL. Qualify a UCIe verification IP that models training, sideband, Flit and Raw modes and the 64 GT/s features, and set up the repositories, regression and release tagging every IP release will be rebuilt from. The stage closes on a design kickoff readiness review.',
    activities: [
      'Foundation IP',
      'Cells and memories',
      'Digital flow',
      'Analog and mixed-signal flow',
      'Verification IP',
      'Design environment',
      'Kickoff readiness',
    ],
    deliverables: [
      'Foundation IP sourcing plan — PLL or DLL, ESD and I/O cells',
      'Standard cell, memory and retry buffer memory compiler readiness report',
      'Digital implementation flow qualified on the selected node',
      'Analog and mixed-signal flow qualified for simulation, extraction and reliability checks',
      'UCIe verification IP qualification report',
      'Design and verification environment with regression and release tagging',
      'Design kickoff readiness record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [8, 8, 10, 10, 10, 12, 14],
    engineeringEffort: [6, 3, 4, 4, 3, 3, 1],
    risks: [
      'A sourced PLL or DLL misses the jitter the 64 GT/s timing budget allows, and is found only after the clocking design depends on it',
      'Verification IP lags the specification features the IP targets, so whole areas of training and sideband are verified against the team’s own reading',
    ],
    potentialRisks: [
      'Memory compiler without the retry buffer’s port configuration or test features on the node',
      'Mixed-signal co-simulation flow not ready, so analog and RTL are first run together at the link margin stage',
      'Flow script and tool versions not frozen, so the v0.9 views cannot be regenerated identically',
      'ESD cells qualified for a different bump structure than the fine-pitch microbumps used here',
      'No release tagging, so a customer issue cannot be traced back to the exact database it was found on',
    ],
    leader: { name: 'Lukas Brenner', short: 'L. Brenner', phone: '+1 (408) 555-0612', email: 'lukas.brenner@example.com' },
    collaboration: ['Design methodology and CAD', 'Analog and mixed-signal', 'Physical design', 'Design verification', 'Technology and foundry', 'RTL design'],
    tools: ['Implementation and signoff flow scripts', 'Circuit simulator and extraction flow', 'Mixed-signal co-simulation environment', 'Revision control, regression and issue tracking systems'],
    programView: [
      'Foundation blocks with silicon status and delivery dates',
      'Flows qualified on a reference block — digital, analog, mixed-signal',
      'Verification IP feature coverage against the target feature set',
      'Kickoff readiness items open',
    ],
    perspective:
      'Every week the flows are not ready is a week the circuit and RTL teams design against something that will change under them. A reference block taken all the way through each flow is worth more than any number of checklists saying the flow is installed.',
  },
  steps: {
    'UFND-01': {
      s: [
        [1, 'List the foundation blocks the PHY needs — reference PLL or DLL, ESD cells, I/O and bump cells', 1],
        [2, 'Decide build or source for each block, with its silicon status on the selected node', 1.5],
        [3, 'Evaluate sourced blocks for jitter, area, supply and ESD robustness against the PHY budget', 2.5],
        [4, 'Agree delivery dates and view sets so each block arrives before circuit design needs it', 1.5],
        [5, 'Release the foundation IP sourcing plan', 0.5],
      ],
      o: [
        'Foundation block list',
        'Build or source decision per block',
        'Evaluation of sourced blocks against the PHY budget',
        'Agreed delivery dates and view sets',
        'Foundation IP sourcing plan',
      ],
      r: [['UFND-D1', 'produces'], ['UFND-D7', 'feeds']],
    },
    'UFND-02': {
      s: [
        [1, 'Select standard cell libraries — track height, threshold variants and clock cells — for the adapter and logical PHY', 1.5],
        [2, 'Confirm library corners and timing at the clock frequency the adapter runs at', 2],
        [3, 'Size the retry buffer and other memories and choose memory compiler configurations', 1.5, 1],
        [4, 'Check memory compiler maturity, redundancy and built-in self-test options on the node', 1.5],
        [5, 'Release the standard cell, memory and memory compiler readiness report', 0.5],
      ],
      o: [
        'Selected standard cell libraries',
        'Library corner and timing confirmation',
        'Memory sizes and compiler configurations',
        'Memory compiler maturity and test option check',
        'Standard cell, memory and memory compiler readiness report',
      ],
      r: [['UFND-D2', 'produces'], ['UFND-D7', 'feeds']],
    },
    'UFND-03': {
      s: [
        [1, 'Set up synthesis, place-and-route and signoff scripts on the selected node and libraries', 2],
        [2, 'Take a reference block through the flow to timing, power and physical verification closure', 3],
        [3, 'Define the hard macro abstract and model generation flow used for customer views', 1.5, 1],
        [4, 'Document the flow and freeze tool and script versions for the program', 1],
        [5, 'Release the qualified digital implementation flow', 0.5],
      ],
      o: [
        'Implementation and signoff scripts',
        'Reference block closed through the flow',
        'Abstract and model generation flow',
        'Flow documentation with frozen versions',
        'Digital implementation flow qualified on the node',
      ],
      r: [['UFND-D3', 'produces'], ['UFND-D7', 'feeds']],
    },
    'UFND-04': {
      s: [
        [1, 'Set up schematic capture, simulation, corner and Monte Carlo infrastructure on the PDK', 2],
        [2, 'Set up parasitic extraction and post-layout simulation for the high-speed nets', 2],
        [3, 'Enable electromigration, IR drop, aging and ESD checks for the analog blocks', 1.5, 1],
        [4, 'Set up the co-simulation flow that runs analog models with the logical PHY RTL', 2],
        [5, 'Release the qualified analog and mixed-signal flow', 0.5],
      ],
      o: [
        'Simulation, corner and Monte Carlo infrastructure',
        'Extraction and post-layout simulation flow',
        'Analog reliability check flow',
        'Mixed-signal co-simulation flow',
        'Analog and mixed-signal flow qualified for the PHY',
      ],
      r: [['UFND-D4', 'produces'], ['UFND-D7', 'feeds']],
    },
    'UFND-05': {
      s: [
        [1, 'Define what the verification IP must model — training states, sideband, Flit and Raw modes and error injection', 1.5],
        [2, 'Evaluate verification IP options against the target feature set, including the 64 GT/s features', 2],
        [3, 'Qualify the chosen verification IP on a reference test bench with its protocol checks enabled', 2.5],
        [4, 'Agree the update schedule with specification changes and record known limitations', 1],
        [5, 'Release the verification IP qualification report', 0.5],
      ],
      o: [
        'Verification IP requirements',
        'Verification IP evaluation against the feature set',
        'Qualified verification IP on a reference test bench',
        'Update schedule and known limitation list',
        'UCIe verification IP qualification report',
      ],
      r: [['UFND-D5', 'produces'], ['UFND-D7', 'feeds']],
    },
    'UFND-06': {
      s: [
        [1, 'Set up repositories, branching rules and configuration management for RTL, schematics, layout and documents', 1.5],
        [2, 'Set up the regression system, compute capacity and nightly runs', 2],
        [3, 'Set up issue tracking and traceability links from requirements to tests', 1.5, 1],
        [4, 'Define release tagging so every IP release can be rebuilt from its configuration', 1.5],
        [5, 'Release the design and verification environment', 0.5],
      ],
      o: [
        'Repositories and configuration management rules',
        'Regression system with nightly runs',
        'Issue tracking with requirement traceability',
        'Release tagging procedure',
        'Design and verification environment with regression and release tagging',
      ],
      r: [['UFND-D6', 'produces'], ['UFND-D7', 'feeds']],
    },
    'UFND-07': {
      s: [
        [1, 'Check each foundation item against the design kickoff criteria', 0.5],
        [2, 'Hold the design kickoff readiness review with the circuit, RTL and verification leads', 0.5],
        [3, 'Record the readiness decision with open items, owners and dates', 0.5],
      ],
      o: [
        'Kickoff criteria checklist status',
        'Kickoff readiness review minutes',
        'Design kickoff readiness record',
      ],
      r: [['UFND-D7', 'produces']],
    },
  },
};
