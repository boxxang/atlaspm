/**
 * UTVP — Test Vehicle, Boards & Lab Preparation. Weeks 50–92; closes on
 * Hardware Ready.
 */
import type { UcieStageModule } from '../types';

export const UTVP: UcieStageModule = {
  content: {
    tagline: 'Everything silicon will need on the day it arrives — package, substrate, boards, tester and lab — ordered and proven before it does.',
    description:
      'Design the test vehicle that puts two test chips on an advanced package with the die-to-die channel routed on a silicon bridge or interposer to the frozen channel rules, and procure its substrate and bridge or interposer through their long lead times. Design and build the evaluation boards with clean, separately measurable supplies; build the ATE load board, the fine-pitch probe card and the wafer sort program; equip and automate the lab stations; and turn the pre-silicon test plan and margin predictions into an ordered bring-up plan and test programs. The stage closes when every item is ready before silicon is in hand, so the first week of silicon is spent on the PHY, not on the hardware around it.',
    activities: ['Test vehicle package', 'Substrate and interposer', 'Evaluation boards', 'ATE and probe card', 'Lab stations', 'Bring-up plan and programs', 'Hardware readiness'],
    deliverables: [
      'Test vehicle package design database — die placement, die-to-die channel routing and substrate stack-up',
      'Received test vehicle substrates and bridges or interposers with incoming inspection records',
      'Evaluation boards fabricated, bare-board tested and powered without silicon',
      'ATE load board, fine-pitch probe card and debugged wafer sort program',
      'Lab station readiness record with measurement automation',
      'Silicon bring-up plan and test programs with expected values from the margin predictions',
      'Hardware readiness decision record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [14, 34, 30, 34, 38, 38, 42],
    engineeringEffort: [6, 4, 8, 8, 6, 6, 1],
    risks: [
      'Bridge or interposer lead time longer than wafer fabrication, so the dies wait for a package to go into',
      'A fine-pitch probe card that does not contact reliably, so known-good dies cannot be selected before assembly',
    ],
    potentialRisks: [
      'Test vehicle channel routed differently from the reference design the release documents',
      'Evaluation board supplies shared between PHY domains, so energy per bit cannot be measured per domain',
      'Lab automation written against a register map that changed at test chip signoff',
      'Bring-up plan with no expected values, so nobody knows whether a first measurement is good',
      'Thermal forcing and instruments booked for another program in the weeks silicon arrives',
    ],
    leader: { name: 'Mireille Okonkwo', short: 'M. Okonkwo', phone: '+1 (408) 555-0633', email: 'mireille.okonkwo@example.com' },
    collaboration: ['Packaging', 'SI/PI', 'Board and lab hardware', 'Test engineering', 'Validation', 'Test chip integration', 'Mixed-signal verification'],
    tools: ['Package and interposer layout', 'Board schematic capture and layout', 'Signal and power integrity simulation', 'Automatic test equipment', 'Lab automation framework'],
    programView: [
      'Long-lead items against the silicon-in-hand date',
      'Substrate and interposer supplier milestones',
      'Boards, probe card and load board built and tested',
      'Bring-up plan steps with expected values',
    ],
    perspective:
      'Silicon arrives on a date nobody can move; the hardware around it arrives on dates the program can. Treat every long-lead item as if it were on the critical path, because the week silicon spends waiting for a package or a probe card is a week the GA date loses.',
  },
  steps: {
    'UTVP-01': {
      s: [
        [1, 'Define die placement, spacing and die-to-die channel lengths on the advanced package', 2],
        [2, 'Route the die-to-die channel on the bridge or interposer to the frozen channel rules', 4],
        [3, 'Design the substrate stack-up, power delivery and breakout to the board', 3, 1],
        [4, 'Run SI and PI checks of the test vehicle channel against the channel specification', 3],
        [5, 'Release the package design database to the substrate and interposer suppliers', 1],
      ],
      o: [
        'Die placement and channel length definition',
        'Die-to-die channel routing on the bridge or interposer',
        'Substrate stack-up, power delivery and breakout',
        'Test vehicle SI and PI check results',
        'Test vehicle package design database',
      ],
      r: [['UTVP-D1', 'produces'], ['UTVP-D2', 'feeds']],
    },
    'UTVP-02': {
      s: [
        [1, 'Place substrate and bridge or interposer orders with confirmed lead times', 2],
        [2, 'Track fabrication and resolve the suppliers’ engineering queries', 16],
        [3, 'Plan the assembly flow and kits with the assembly partner', 3, 1],
        [4, 'Receive and inspect substrates and interposers against the drawings', 3],
        [5, 'Release received material to assembly', 1],
      ],
      o: [
        'Placed orders with confirmed lead times',
        'Supplier fabrication tracking and resolved queries',
        'Assembly flow and kit plan',
        'Incoming inspection records',
        'Received test vehicle substrates and bridges or interposers',
      ],
      r: [['UTVP-D2', 'produces'], ['UTVP-D7', 'feeds']],
    },
    'UTVP-03': {
      s: [
        [1, 'Design schematics for supplies, clocks, control access and instrument connections', 4],
        [2, 'Lay out the board with a separately measurable supply for each PHY domain', 6],
        [3, 'Design the socket or direct-mount option for the test vehicle', 3, 1],
        [4, 'Fabricate the boards and run bare-board tests', 8],
        [5, 'Bring the boards up without silicon — supplies, clocks and controller', 3],
        [6, 'Release the boards to the lab', 1],
      ],
      o: [
        'Evaluation board schematics',
        'Board layout with per-domain supplies',
        'Socket or direct-mount design',
        'Fabricated boards with bare-board test results',
        'Boards powered and verified without silicon',
        'Evaluation boards released to the lab',
      ],
      r: [['UTVP-D3', 'produces'], ['UTVP-D7', 'feeds']],
    },
    'UTVP-04': {
      s: [
        [1, 'Define wafer sort and package test content with the DFT and test chip teams', 3],
        [2, 'Design the fine-pitch probe card and the ATE load board', 6],
        [3, 'Develop the sort program — scan, BIST, PRBS loopback and supply checks', 8, 1],
        [4, 'Fabricate and verify the probe card and the load board', 10],
        [5, 'Debug the sort program on the tester with correlation units', 3],
        [6, 'Release the ATE hardware and the sort program', 1],
      ],
      o: [
        'Wafer sort and package test content',
        'Probe card and load board designs',
        'Sort program draft',
        'Verified probe card and load board',
        'Debugged sort program',
        'ATE load board, probe card and sort program release',
      ],
      r: [['UTVP-D4', 'produces'], ['UTVP-D7', 'feeds']],
    },
    'UTVP-05': {
      s: [
        [1, 'List the instruments — oscilloscopes, bit error rate testers, thermal forcing and power analyzers', 2],
        [2, 'Procure or reserve the instruments and lab stations for the silicon weeks', 8],
        [3, 'Write automation for register access, parameter sweeps and data logging', 10, 1],
        [4, 'Validate each station on an evaluation board without silicon', 4],
        [5, 'Release the lab station readiness record', 1],
      ],
      o: [
        'Instrument list per measurement',
        'Reserved instruments and stations',
        'Measurement automation scripts',
        'Stations validated on evaluation boards',
        'Lab station readiness record',
      ],
      r: [['UTVP-D5', 'produces'], ['UTVP-D7', 'feeds']],
    },
    'UTVP-06': {
      s: [
        [1, 'Turn the post-silicon test plan into ordered bring-up steps with pass criteria', 4],
        [2, 'Attach the margin predictions as expected values to each characterization test', 3],
        [3, 'Write test programs and scripts against the final test chip register map', 6, 1],
        [4, 'Dry-run the plan on a simulation of the test chip', 4],
        [5, 'Release the bring-up plan and test programs', 1],
      ],
      o: [
        'Ordered bring-up steps with pass criteria',
        'Expected values for each characterization test',
        'Test programs and scripts',
        'Dry-run results on simulation',
        'Silicon bring-up plan and test programs',
      ],
      r: [['UTVP-D6', 'produces'], ['UTVP-D7', 'feeds']],
    },
    'UTVP-07': {
      s: [
        [1, 'Check every hardware item against the silicon-in-hand date', 1],
        [2, 'Confirm the plan, programs and stations against the final test chip database', 1],
        [3, 'Hold the readiness review and record open items with owners', 1],
      ],
      o: [
        'Hardware status against the silicon date',
        'Consistency check of plan, programs and stations with the database',
        'Hardware readiness decision record',
      ],
      r: [['UTVP-D7', 'produces']],
    },
  },
};
