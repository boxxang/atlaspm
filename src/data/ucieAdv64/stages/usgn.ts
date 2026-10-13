/**
 * USGN — Hard Macro Signoff for Tapeout & v0.9. Weeks 62–72; closes on Hard Macro Signoff.
 */
import type { UcieStageModule } from '../types';

export const USGN: UcieStageModule = {
  content: {
    tagline: 'Sign the PHY off as a macro other people will drop into their own SoCs, not just as a block that works on our test chip.',
    description:
      'Close timing, power integrity, physical verification, ESD and latch-up, aging and a timing-annotated gate-level simulation on the final databases of the digital hard macro and the Electrical PHY, then check that what ships as abstracts, Liberty models and bump maps matches the layout bit for bit. A die-to-die PHY at 64 GT/s is signed off twice over: once as silicon that has to meet its own timing and electromigration limits, and once as an IP whose views a licensee will trust without seeing the layout. The stage closes two weeks before the test chip database is released, on a signoff review that also takes the verification sign-off, the link margin review, the post-layout margin and the channel specification compliance into account, and releases the macro to test chip signoff, to tapeout and to the v0.9 release.',
    activities: ['Static timing', 'EM and IR', 'DRC, LVS, antenna', 'ESD and latch-up', 'Aging and reliability', 'Macro integration checks', 'Signoff review', 'Timing-annotated GLS and final ATPG'],
    deliverables: [
      'Hard macro static timing signoff report across corners, modes and on-chip variation',
      'PHY macro EM and IR drop signoff report with current-density and supply-droop maps',
      'Hard macro physical verification report — DRC, LVS and antenna clean or waived',
      'ESD and latch-up verification report for every bump and supply domain',
      'Aging and reliability verification report — device aging and interconnect lifetime',
      'Hard macro integration check report — abstracts, Liberty models and bump map against the layout',
      'Hard macro signoff decision record and release authorization',
      'Timing-annotated gate-level simulation report on the signoff netlist',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7],
    deliverableWeek: [7, 7, 8, 8, 8, 8, 10, 8],
    engineeringEffort: [6, 4, 4, 2.5, 2.5, 2, 1, 2],
    risks: [
      'Timing closed on the macro alone, with interface budgets that no customer floorplan can meet once the macro is placed at a die edge',
      'IR drop at 64 GT/s activity closing only because the analysis assumed a cleaner supply than a customer package will deliver',
    ],
    potentialRisks: [
      'Abstracts or Liberty models generated from a database one revision older than the signed-off layout',
      'ESD verified per cell but not on the bump-to-clamp paths of the full macro, so a fine-pitch bump escapes protection',
      'Aging margins taken from generic device models while the sampler offset drift dominates at end of life',
      'Antenna and density waivers accepted for the test chip that a licensee’s foundry flow will reject',
      'Bump map in the macro and bump map in the integration guide edited separately and drifting apart',
    ],
    leader: { name: 'Renata Kowalczyk', short: 'R. Kowalczyk', phone: '+1 (408) 555-0631', email: 'renata.kowalczyk@example.com' },
    collaboration: ['Physical design', 'Analog and mixed-signal', 'Analog layout', 'Reliability', 'SI/PI', 'Customer engineering', 'Program management'],
    tools: ['Static timing analysis', 'Power integrity and electromigration analysis', 'Physical verification', 'ESD and latch-up rule checking', 'Device aging simulation'],
    programView: [
      'Open timing, EM/IR, DRC and LVS violations per macro against the signoff date',
      'Waivers raised, reviewed and approved',
      'Mismatches found between delivered views and layout',
      'Days from final database to signoff decision',
    ],
    perspective:
      'An IP is signed off for the customer who will never see its layout. Every number in the signoff reports has to hold in their floorplan, their package and their corners, so the checks that compare views with layout matter as much as the checks that compare layout with rules.',
  },
  steps: {
    'USGN-01': {
      s: [
        [1, 'Load the final digital hard macro netlist, parasitics and constraints for every corner and mode', 0.5],
        [2, 'Run timing across corners with on-chip variation and the 64 GT/s interface clocks', 2],
        [3, 'Close the macro-boundary budgets to the FDI and to the Electrical PHY with interface margins', 1.5, 1],
        [4, 'Fix remaining violations with engineering changes and re-run to convergence, rechecking the Electrical PHY boundary on its post-layout timing models', 2.5],
        [5, 'Check timing in the test and low-power modes', 1, 1],
        [6, 'Release the static timing signoff report', 0.5],
      ],
      o: [
        'Signoff timing setup for every corner and mode',
        'Corner-by-corner timing results with variation',
        'Closed macro-boundary interface budgets',
        'Converged timing after the final changes',
        'Test and low-power mode timing results',
        'Hard macro static timing signoff report',
      ],
      r: [['USGN-D1', 'produces'], ['USGN-D7', 'feeds']],
    },
    'USGN-02': {
      s: [
        [1, 'Build the activity vectors for the full 64-lane module at 64 GT/s, including training and PRBS patterns', 1],
        [2, 'Run static and dynamic IR drop on the TX, RX, clocking and digital supplies', 2],
        [3, 'Run electromigration on signal, clock and power nets at the mission profile', 2, 1],
        [4, 'Fix hot spots with grid and decoupling changes in the macro', 2],
        [5, 'Release the EM and IR drop signoff report with the supply assumptions stated for integrators', 1],
      ],
      o: [
        'Worst-case activity vectors for the module',
        'Static and dynamic IR drop maps per supply',
        'Electromigration results per net class',
        'Grid and decoupling fixes closing the hot spots',
        'PHY macro EM and IR drop signoff report',
      ],
      r: [['USGN-D2', 'produces'], ['USGN-D7', 'feeds']],
    },
    'USGN-03': {
      s: [
        [1, 'Stream out the merged macro database with the bump layer and markers', 0.5],
        [2, 'Run DRC, including fine-pitch bump and microbump rules, and density checks', 2],
        [3, 'Run LVS of the full macro, analog and digital together', 1.5, 1],
        [4, 'Run antenna checks and fix or justify each violation', 1.5],
        [5, 'Review the waiver list with the foundry rules owner and record each decision', 1.5],
        [6, 'Release the physical verification report', 1],
      ],
      o: [
        'Merged macro database for verification',
        'DRC and density results',
        'Full-macro LVS results',
        'Antenna results with fixes and justifications',
        'Reviewed waiver list with decisions',
        'Hard macro physical verification report',
      ],
      r: [['USGN-D3', 'produces'], ['USGN-D7', 'feeds']],
    },
    'USGN-04': {
      s: [
        [1, 'Trace every bump to its clamp and verify the discharge paths for each supply domain', 2],
        [2, 'Check clamp sizing and resistance against the ESD targets for fine-pitch die-to-die bumps', 1.5, 1],
        [3, 'Run latch-up rule checks on guard rings and well ties across the analog and digital boundary', 2],
        [4, 'Review the results with the Electrical PHY designers and fix or waive', 1.5],
        [5, 'Release the ESD and latch-up verification report', 0.5],
      ],
      o: [
        'Bump-to-clamp discharge path check per domain',
        'Clamp sizing and resistance check results',
        'Latch-up rule check results',
        'Reviewed ESD and latch-up fixes and waivers',
        'ESD and latch-up verification report',
      ],
      r: [['USGN-D4', 'produces'], ['USGN-D7', 'feeds']],
    },
    'USGN-05': {
      s: [
        [1, 'Define the mission profile — temperature, voltage, activity and lifetime — that licensees will assume', 1],
        [2, 'Simulate device aging on the TX driver, RX sampler and clocking paths', 2.5],
        [3, 'Check interconnect lifetime on the highest-current signal and supply nets', 1.5, 1],
        [4, 'Confirm calibration ranges cover end-of-life drift with margin', 1.5],
        [5, 'Release the aging and reliability verification report', 1],
      ],
      o: [
        'Stated mission profile for the IP',
        'End-of-life circuit performance from aging simulation',
        'Interconnect lifetime results',
        'Calibration range coverage at end of life',
        'Aging and reliability verification report',
      ],
      r: [['USGN-D5', 'produces'], ['USGN-D7', 'feeds']],
    },
    'USGN-06': {
      s: [
        [1, 'Regenerate the abstracts, Liberty models and bump map from the signed-off databases', 1],
        [2, 'Compare pins, blockages and bump coordinates in the views against the layout', 1.5],
        [3, 'Check the Liberty timing and power against the signoff timing and power results', 1.5, 1],
        [4, 'Place the macro in a reference die floorplan and run a trial integration', 1.5],
        [5, 'Release the integration check report', 1],
      ],
      o: [
        'Regenerated abstracts, models and bump map',
        'View-to-layout comparison results',
        'Liberty-to-signoff correlation',
        'Trial integration result in a reference floorplan',
        'Hard macro integration check report',
      ],
      r: [['USGN-D6', 'produces'], ['USGN-D7', 'feeds']],
    },
    'USGN-07': {
      s: [
        [1, 'Collect every signoff report, the timing-annotated simulation and final ATPG coverage, the post-layout margin, the channel compliance, and post-layout energy per bit, area and latency against the PPA targets and budgets, against the signoff checklist', 0.5],
        [2, 'Review open waivers and residual risks with design, layout, reliability and customer engineering', 0.5],
        [3, 'Decide signoff and record the conditions the release and the test chip carry', 0.5],
        [4, 'Authorize the macro for test chip signoff, tapeout and the v0.9 release', 0.5],
      ],
      o: [
        'Signoff checklist with every report attached',
        'Reviewed waiver and residual risk register',
        'Signoff decision with recorded conditions',
        'Hard macro signoff decision record and release authorization',
      ],
      r: [['USGN-D7', 'produces']],
    },
    'USGN-08': {
      s: [
        [1, 'Back-annotate the signed-off netlist with delays extracted from the final parasitics at the fast and slow corners', 1],
        [2, 'Run link training, mainband traffic and retry scenarios through the annotated adapter and logical PHY netlist', 2.5],
        [3, 'Run reset, low-power entry and exit and clock-domain crossing scenarios with timing annotation', 1.5, 1],
        [4, 'Generate the final scan and ATPG patterns on the signoff netlist with every ECO merged, and report stuck-at and transition coverage against the targets set in DFT planning', 2.5, 1],
        [5, 'Run the final scan patterns and the built-in tests at speed on the annotated netlist', 1.5],
        [6, 'Triage every mismatch against the static timing exceptions and close or waive it', 1],
        [7, 'Release the timing-annotated gate-level simulation report, and the final patterns and coverage report to sort, package test and the release', 0.5],
      ],
      o: [
        'Delay-annotated signoff netlist at the fast and slow corners',
        'Annotated training, traffic and retry results',
        'Annotated reset, low-power and crossing results',
        'Final scan and ATPG patterns with stuck-at and transition coverage against target',
        'At-speed results of the final patterns on the annotated netlist',
        'Mismatch triage against the timing exceptions',
        'Timing-annotated gate-level simulation report on the signoff netlist',
      ],
      r: [['USGN-D8', 'produces'], ['USGN-D7', 'feeds']],
    },
  },
};
