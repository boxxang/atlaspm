/**
 * UPRE — Pre-Silicon Releases — v0.5 & v0.9. Weeks 52–78; closes on v0.9 Release.
 */
import type { UcieStageModule } from '../types';

export const UPRE: UcieStageModule = {
  content: {
    tagline: 'Put the IP in licensees’ hands twice before silicon: frozen RTL to start integrating, signed-off views to finish.',
    description:
      'Customers integrating a die-to-die PHY cannot wait for silicon: their SoC floorplans, bump maps, power grids and package channels are drawn while this IP is still being proven. This stage releases the IP in two pre-silicon steps. v0.5 follows the RTL freeze and carries the D2D Adapter, Logical PHY and sideband RTL, behavioral models of the Electrical PHY and a preliminary integration guide, so early-access customers can connect the FDI or RDI, simulate link training in their own flow and place the macro. v0.9 follows hard macro signoff and carries the physical views (GDS, LEF abstract, Liberty libraries), timing, power and IBIS-AMI or equivalent channel models, and the full integration guide and application notes. Each release passes the same release QA against a deliverable checklist, and early-access feedback is folded in between the two. The stage closes when v0.9 is decided and distributed.',
    activities: [
      'Release structure and QA',
      'v0.5 release',
      'Early-access onboarding',
      'Physical views',
      'Timing, power and channel models',
      'Integration guide',
      'v0.9 release QA',
      'v0.9 decision',
    ],
    deliverables: [
      'Release package structure, deliverable checklist and release QA procedure',
      'v0.5 release package — RTL, behavioral models and preliminary integration guide',
      'Early-access customer feedback log and change requests',
      'Hard macro physical views — GDS, LEF abstract and Liberty timing and power libraries',
      'IBIS-AMI or equivalent channel models with timing and power models',
      'Integration guide and application notes for the v0.9 release',
      'v0.9 release QA record and release notes',
      'v0.9 release decision record and licensee distribution list',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7],
    deliverableWeek: [4, 8, 20, 24, 24, 24, 25, 26],
    engineeringEffort: [3, 10, 8, 6, 8, 10, 3, 2],
    risks: [
      'A v0.9 view set that does not match the signed-off database, so a customer’s signoff passes against something that will not be built',
      'Early-access customers integrating to the preliminary guide and building in assumptions v0.9 changes',
    ],
    potentialRisks: [
      'v0.5 released before the RTL is lint- and CDC-clean, so the first customer impression is a compile failure',
      'Behavioral models that train in simulation where the real circuit would not, hiding link-training bugs from the customer',
      'Liberty libraries generated for fewer corners than customers sign off at',
      'Channel models whose validity range is not stated, used by a customer for a channel longer than they were built for',
      'Feedback from early-access customers logged but never triaged, so v0.9 ships the same integration problems',
      'Release QA run as a checklist of file names rather than by reading views into the tools customers use',
    ],
    leader: { name: 'Priya Natarajan', short: 'P. Natarajan', phone: '+1 (408) 555-0661', email: 'priya.natarajan@example.com' },
    collaboration: ['Customer engineering', 'Technical documentation', 'Physical design', 'SI/PI', 'Quality', 'RTL design', 'Mixed-signal verification'],
    tools: ['Release configuration management and version tagging', 'Secure customer file distribution portal', 'View and model consistency checkers', 'Customer issue and feedback tracker'],
    programView: [
      'v0.5 and v0.9 release dates against the RTL freeze and hard macro signoff',
      'Deliverable checklist items complete and QA-passed per release',
      'Early-access customers onboarded and integrating',
      'Open customer change requests and their target release',
    ],
    perspective:
      'An IP release is judged by the customer’s first hour with it. A package that reads cleanly into their tools, with a guide that answers the questions they would otherwise file as issues, buys more schedule than any engineering shortcut — so release QA reads every view the way a customer will.',
  },
  steps: {
    'UPRE-01': {
      s: [
        [1, 'Define the release package structure — directories, views, models, scripts and documents per release level', 1],
        [2, 'Write the deliverable checklist for v0.5, v0.9 and GA against the customer integration requirements', 1],
        [3, 'Define the release QA procedure — file integrity, view consistency, model sanity runs and document review', 1],
        [4, 'Set up release configuration management, version tagging and secure customer distribution', 0.5, 1],
        [5, 'Approve the structure, checklist and QA procedure with engineering and customer engineering', 0.5],
      ],
      o: [
        'Release package directory and naming structure',
        'Deliverable checklist per release level',
        'Release QA procedure',
        'Release tagging and distribution setup',
        'Release package structure, deliverable checklist and release QA procedure',
      ],
      r: [['UPRE-D1', 'produces'], ['UPRE-D7', 'feeds']],
    },
    'UPRE-02': {
      s: [
        [1, 'Collect the frozen D2D Adapter, Logical PHY and sideband RTL with its register map and configuration parameters', 1],
        [2, 'Package the Electrical PHY behavioral models with the RTL so customers can simulate link training end to end', 1.5],
        [3, 'Write the preliminary integration guide — FDI and RDI signals, clocks and resets, power domains and the macro outline', 2],
        [4, 'Run release QA on the v0.5 package — clean compile, lint report and a smoke simulation through link-up', 1],
        [5, 'Release v0.5 to early-access customers with release notes and known limitations', 0.5],
      ],
      o: [
        'Frozen RTL and register map bundle',
        'Behavioral model and simulation kit',
        'Preliminary integration guide',
        'v0.5 release QA record',
        'v0.5 release package — RTL, behavioral models and preliminary integration guide',
      ],
      r: [['UPRE-D2', 'produces'], ['UPRE-D3', 'feeds']],
    },
    'UPRE-03': {
      s: [
        [1, 'Select early-access customers and agree their integration scope, package type and schedule', 2],
        [2, 'Onboard each customer on v0.5 — kickoff, environment setup and a first link-training simulation in their flow', 3],
        [3, 'Hold integration working sessions on the FDI or RDI connection, macro placement and power domains', 4],
        [4, 'Log feedback and change requests and triage each into a v0.9 fix, a document change or a deferral', 2, 1],
        [5, 'Feed accepted changes to design and documentation and confirm the outcome with each customer', 3],
      ],
      o: [
        'Early-access customer list and integration scopes',
        'Customer onboarding records with first simulations passing',
        'Integration session notes and action items',
        'Triaged feedback and change request list',
        'Early-access customer feedback log and change requests',
      ],
      r: [['UPRE-D3', 'produces'], ['UPRE-D6', 'feeds']],
    },
    'UPRE-04': {
      s: [
        [1, 'Stream out the signed-off GDS of the hard macros and compare it with the signoff database', 1],
        [2, 'Generate and check the LEF abstract — pins, blockages, bump locations and orientation variants', 1],
        [3, 'Generate Liberty timing and power libraries across the supported corners and validate them against signoff timing', 1.5],
        [4, 'Run view-consistency checks across GDS, LEF, Liberty and the netlist', 0.5],
      ],
      o: [
        'Hard macro GDS matched to signoff',
        'Checked LEF abstract with orientation variants',
        'Validated Liberty libraries per corner',
        'Hard macro physical views — GDS, LEF abstract and Liberty timing and power libraries',
      ],
      r: [['UPRE-D4', 'produces'], ['UPRE-D7', 'feeds']],
    },
    'UPRE-05': {
      s: [
        [1, 'Build IBIS-AMI or equivalent TX and RX channel models from post-layout simulation', 3],
        [2, 'Correlate the channel models with the post-layout link margin simulation on the reference channels', 2],
        [3, 'Package timing models and power models — static, dynamic and per low-power state — for SoC integration', 2, 1],
        [4, 'Exercise the models in a customer-style channel and power simulation and document their validity range', 2],
        [5, 'Release the model set with its validity range and correlation report', 1],
      ],
      o: [
        'TX and RX channel models',
        'Model-to-post-layout correlation results',
        'Timing and power model set',
        'Model validity range and usage notes',
        'IBIS-AMI or equivalent channel models with timing and power models',
      ],
      r: [['UPRE-D5', 'produces'], ['UPRE-D7', 'feeds']],
    },
    'UPRE-06': {
      s: [
        [1, 'Expand the integration guide with final FDI and RDI timing, clocking and reset sequencing', 3],
        [2, 'Write macro placement and bump map rules for silicon bridge, silicon interposer and RDL interposer packages', 3],
        [3, 'Write power delivery, decoupling and supply noise requirements for the PHY', 2, 1],
        [4, 'Write application notes on channel design, lane repair, register programming and bring-up', 4],
        [5, 'Fold in early-access feedback and review the documents with design and customer engineering', 2],
        [6, 'Release the integration guide and application notes for v0.9', 1],
      ],
      o: [
        'Interface timing and sequencing chapters',
        'Placement and bump map rules per package type',
        'Power delivery and supply noise requirements',
        'Application notes',
        'Reviewed documents with feedback folded in',
        'Integration guide and application notes for the v0.9 release',
      ],
      r: [['UPRE-D6', 'produces'], ['UPRE-D7', 'feeds']],
    },
    'UPRE-07': {
      s: [
        [1, 'Run the release QA checklist on every v0.9 deliverable — integrity, versions and view consistency', 1],
        [2, 'Run sanity flows — model compiles, abstract import, library read-in and a channel model simulation', 1],
        [3, 'Write the release notes, known issues and the QA record', 0.5],
        [4, 'Close or waive every QA finding with an owner and a customer impact statement', 0.5],
      ],
      o: [
        'v0.9 checklist results',
        'Sanity flow results',
        'Release notes and known issues',
        'v0.9 release QA record and release notes',
      ],
      r: [['UPRE-D7', 'produces'], ['UPRE-D8', 'feeds']],
    },
    'UPRE-08': {
      s: [
        [1, 'Review signoff status, the QA record and open issues against the v0.9 release criteria', 0.5],
        [2, 'Confirm every criterion is met or record the waiver with its customer impact', 0.5],
        [3, 'Decide go or no-go for v0.9 and record the decision', 0.5],
        [4, 'Distribute v0.9 to licensees and announce the release', 0.5],
      ],
      o: [
        'v0.9 criteria review',
        'Criteria status with waivers',
        'v0.9 go or no-go decision',
        'v0.9 release decision record and licensee distribution list',
      ],
      r: [['UPRE-D8', 'produces']],
    },
  },
};
