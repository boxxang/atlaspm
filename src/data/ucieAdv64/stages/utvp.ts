/**
 * UTVP — Silicon-Ready Hardware — Test Vehicle, Boards & Lab. Weeks 50–92; closes on
 * Hardware Ready.
 */
import type { UcieStageModule } from '../types';

export const UTVP: UcieStageModule = {
  content: {
    tagline: 'Everything silicon will need on the day it arrives — package, substrate, boards, tester and lab — ordered and proven before it does.',
    description:
      'Design the test vehicle that puts two test chips on an advanced package, in variants: a silicon bridge build and a silicon interposer build, each routed to the frozen channel rules, a reversed-orientation build so lane reversal is proven on real hardware, and a build that mates the test chip with the interoperability partner’s die on a bump map both sides agreed. The bridge and interposer are silicon designs of their own, signed off and taped out here, then fabricated beside the substrates through their long lead times while the partner’s known-good dies are secured. Design and build the evaluation boards with clean, separately measurable supplies; build the ATE load board, the fine-pitch probe card and the wafer sort program; build the reliability stress boards, the sockets for the advanced package and the package final test program reliability units are screened with; equip and automate the lab stations; and turn the pre-silicon test plan and margin predictions into an ordered bring-up plan and test programs. The stage closes when every item is ready before silicon is in hand, so the first week of silicon is spent on the PHY, not on the hardware around it.',
    activities: ['Test vehicle variants', 'Substrate, bridge and partner dies', 'Evaluation boards', 'ATE and probe card', 'Lab stations', 'Bring-up plan and programs', 'Hardware readiness', 'Bridge and interposer tapeout', 'Stress boards and final test'],
    deliverables: [
      'Test vehicle package design databases for the bridge, interposer, reversed-orientation and partner-die builds',
      'Received substrates, bridges, interposers and partner known-good dies with incoming inspection records',
      'Evaluation boards fabricated, bare-board tested and powered without silicon',
      'ATE load board, fine-pitch probe card and debugged wafer sort program',
      'Lab station readiness record with measurement automation',
      'Silicon bring-up plan and test programs with expected values from the margin predictions',
      'Hardware readiness decision record',
      'Bridge and interposer signoff report and tapeout record',
      'Reliability stress boards, advanced-package sockets and package final test program',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    deliverableWeek: [14, 34, 30, 34, 38, 38, 42, 18, 40],
    engineeringEffort: [7, 4, 8, 8, 6, 6, 1, 6, 6],
    risks: [
      'Bridge or interposer treated as a purchase rather than a silicon design, so its signoff and tapeout are discovered after the test chip has taped out',
      'The interoperability partner’s dies arriving without a mated bump map, so interop waits for a second test vehicle',
      'A fine-pitch probe card that does not contact reliably, so known-good dies cannot be selected before assembly',
    ],
    potentialRisks: [
      'Test vehicle channel routed differently from the reference design the release documents',
      'Evaluation board supplies shared between PHY domains, so energy per bit cannot be measured per domain',
      'Lab automation written against a register map that changed at test chip signoff',
      'Bring-up plan with no expected values, so nobody knows whether a first measurement is good',
      'Thermal forcing and instruments booked for another program in the weeks silicon arrives',
      'Reliability stress boards and sockets ordered after silicon, so operating-life stress starts weeks late',
    ],
    leader: { name: 'Mireille Okonkwo', short: 'M. Okonkwo', phone: '+1 (408) 555-0633', email: 'mireille.okonkwo@example.com' },
    collaboration: ['Packaging', 'SI/PI', 'Board and lab hardware', 'Test engineering', 'Validation', 'Test chip integration', 'Mixed-signal verification'],
    tools: ['Package and interposer layout', 'Board schematic capture and layout', 'Signal and power integrity simulation', 'Automatic test equipment', 'Lab automation framework'],
    programView: [
      'Long-lead items against the silicon-in-hand date, the bridge and interposer tapeout first',
      'Substrate and interposer supplier milestones',
      'Boards, probe card and load board built and tested',
      'Bring-up plan steps with expected values',
    ],
    perspective:
      'Silicon arrives on a date nobody can move; the hardware around it arrives on dates the program can. Treat every long-lead item as if it were on the critical path, because the week silicon spends waiting for a package or a probe card is a week the production release date loses.',
  },
  steps: {
    'UTVP-01': {
      s: [
        [1, 'Define the variants — bridge, interposer, reversed orientation and partner die — with die placement and channel lengths for each', 2],
        [2, 'Place the partner die on the bump map agreed with the partner and check the mating against both bump maps', 1.5, 1],
        [3, 'Route the die-to-die channels on the bridge and on the interposer to the frozen channel rules, place the channel measurement structures the correlation plan specifies, and hand the routing to their signoff', 4],
        [4, 'Design the substrate stack-ups, power delivery to the PDN analysis and breakout to the board for every variant, from the test chip die outline and bump plan', 3, 1],
        [5, 'Run SI and PI checks of each variant’s channel against the channel specification', 3],
        [6, 'Release the package design databases to the substrate supplier and the assembly partner', 1],
      ],
      o: [
        'Variant definition with placement and channel lengths',
        'Partner die placement with a checked bump map mating',
        'Bridge and interposer channel routing handed to signoff',
        'Substrate stack-ups, power delivery and breakout per variant',
        'SI and PI check results per variant',
        'Test vehicle package design databases for the bridge, interposer, reversed-orientation and partner-die builds',
      ],
      r: [['UTVP-D1', 'produces'], ['UTVP-D2', 'feeds']],
    },
    'UTVP-02': {
      s: [
        [1, 'Place substrate orders per variant with confirmed lead times', 2],
        [2, 'Track substrate fabrication and the bridge and interposer wafers from their tapeout, and resolve the suppliers’ engineering queries', 16],
        [3, 'Secure the partner’s known-good dies in the agreed quantity and test state', 3, 1],
        [4, 'Plan the assembly flow and kits per variant with the assembly partner', 2, 1],
        [5, 'Receive and inspect substrates, bridges, interposers and partner dies against the drawings', 3],
        [6, 'Release received material to assembly as kits per variant', 1],
      ],
      o: [
        'Placed substrate orders with confirmed lead times',
        'Substrate, bridge and interposer fabrication tracking with resolved queries',
        'Partner known-good dies secured',
        'Assembly flow and kit plan per variant',
        'Incoming inspection records',
        'Received substrates, bridges, interposers and partner known-good dies with incoming inspection records',
      ],
      r: [['UTVP-D2', 'produces'], ['UTVP-D7', 'feeds']],
    },
    'UTVP-03': {
      s: [
        [1, 'Design schematics for supplies, clocks, control access and instrument connections', 4],
        [2, 'Lay out the board with a separately measurable supply for each PHY domain and the on-board measurement structures the correlation plan specifies', 6],
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
        [5, 'Load the final ATPG patterns from signoff and debug the sort program on the tester with correlation units', 3],
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
        [1, 'Check every hardware item, the bridge and interposer, the stress boards and the partner dies against the silicon-in-hand date', 1],
        [2, 'Confirm the plan, programs, stations and mated bump maps against the final test chip database', 1],
        [3, 'Hold the readiness review and record open items with owners', 1],
      ],
      o: [
        'Hardware status against the silicon date',
        'Consistency check of plan, programs and stations with the database',
        'Hardware readiness decision record',
      ],
      r: [['UTVP-D7', 'produces']],
    },
    'UTVP-08': {
      s: [
        [1, 'Take the bridge and interposer routing from the package design and complete their physical design with the power and test structures and the channel measurement and de-embedding structures the correlation plan specifies', 3],
        [2, 'Run DRC, LVS and the through-silicon via and microbump rules on the interposer and the bridge', 3],
        [3, 'Extract the passive channels and confirm them against the channel specification', 2, 1],
        [4, 'Review the databases with the assembly partner and the foundry that builds them', 2],
        [5, 'Confirm the mask or shuttle slot booked in technology planning', 1, 1],
        [6, 'Tape out the bridge and interposer and record the database revisions', 2],
      ],
      o: [
        'Completed bridge and interposer physical design',
        'DRC, LVS and via rule results',
        'Extracted passive channels against the specification',
        'Partner and foundry database review',
        'Confirmed mask or shuttle slot',
        'Bridge and interposer signoff report and tapeout record',
      ],
      r: [['UTVP-D8', 'produces'], ['UTVP-D2', 'feeds']],
    },
    'UTVP-09': {
      s: [
        [1, 'Define the stress conditions with reliability — operating-life with the link running, temperature cycling and the read points', 2],
        [2, 'Design the dynamic stress boards that keep the link training and passing traffic under bias', 6],
        [3, 'Specify and procure sockets for the advanced-package test vehicle', 8, 1],
        [4, 'Develop the package final test program that screens units at time zero before stress', 8],
        [5, 'Fabricate and verify the stress boards with dummy loads', 8],
        [6, 'Debug the final test program on the load board with correlation units', 3],
        [7, 'Release the stress boards, sockets and package final test program', 1],
      ],
      o: [
        'Stress conditions and read points agreed with reliability',
        'Dynamic stress board design',
        'Sockets for the advanced-package test vehicle',
        'Package final test program draft',
        'Verified stress boards',
        'Debugged package final test program',
        'Reliability stress boards, advanced-package sockets and package final test program',
      ],
      r: [['UTVP-D9', 'produces'], ['UTVP-D7', 'feeds']],
    },
  },
};
