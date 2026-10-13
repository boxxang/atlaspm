/**
 * UBUP — Silicon Bring-Up. Weeks 96–104; closes on First Link-up.
 */
import type { UcieStageModule } from '../types';

export const UBUP: UcieStageModule = {
  content: {
    tagline: 'Two dies on one package, one sideband message at a time, until the 64 GT/s mainband carries data.',
    description:
      'Take the first assembled test vehicles from the dock to a working link in eight weeks. Power the two test chip dies up rail by rail against the sequencing the integration guide promises customers, bring the sideband up and read the registers through it, then train the mainband — MBINIT with its lane, clock, valid and track checks and repair detection, then MBTRAIN at 64 GT/s — until LINKINIT hands an active link to the test logic and data moves across the advanced package. Every step is run against the post-silicon test plan written in verification and the margin predictions from mixed-signal simulation, so the first silicon numbers are compared with what the design team said they would be, not read in isolation. The stage closes on first link-up: an active link carrying PRBS and Flit traffic, with the open issues triaged.',
    activities: ['Power-on', 'Sideband link-up', 'Mainband training', 'First link-up', 'Plan and predictions', 'First link-up review'],
    deliverables: [
      'Power-on and supply sequencing record with rail currents per die',
      'Sideband link-up and register access log',
      'Mainband training log with per-lane MBINIT and MBTRAIN results',
      'First link-up and basic data transfer record at 64 GT/s',
      'Bring-up results against the pre-silicon test plan and margin predictions',
      'First link-up decision record and open-issue list',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [1, 3, 5, 7, 8, 8],
    engineeringEffort: [2, 3, 4, 4, 5, 1],
    risks: [
      'Mainband training fails on first silicon and the cause cannot be separated between the analog front-end, the training logic, the package and the board',
      'Bring-up runs on the lab’s own scripts rather than the pre-silicon test plan, so the silicon cannot be compared with what was predicted',
    ],
    potentialRisks: [
      'Supply sequencing on the evaluation board differs from the sequence the integration guide gives customers, so a power-up issue is found but not recognized',
      'Sideband comes up only with a slowed clock, and nobody records that the default setting would not have worked',
      'Lane repair triggered silently on the first parts, masking a bump or assembly defect the reliability units will also carry',
      'Too few assembled units to separate a die problem from a package or board problem by swapping parts',
      'Debug visibility limited to the sideband, so a training hang in the mainband leaves no trace of the state it stopped in',
    ],
    leader: { name: 'Mariana Okonkwo', short: 'M. Okonkwo', phone: '+1 (408) 555-0661', email: 'mariana.okonkwo@example.com' },
    collaboration: ['Validation', 'Board and lab hardware', 'Analog and mixed-signal', 'RTL design', 'Design verification', 'Test chip integration', 'Packaging'],
    tools: ['Bench power supplies with per-rail current logging', 'High-bandwidth oscilloscope and probing station', 'Lab automation and register access scripts over the sideband', 'Bring-up issue tracker'],
    programView: [
      'Training state reached per unit and per module',
      'Lanes trained without repair against lanes repaired',
      'Bring-up issues open, bucketed by die, package, board or lab',
      'Days from first samples to first link-up',
    ],
    perspective:
      'First link-up is a diagnosis exercise more than a test. A die-to-die link that will not train could be any of the two dies, the bumps, the bridge or interposer, the board or the script — bring it up in the order that splits those apart, and write down every workaround, because each one is a question the characterization and the integration guide will have to answer.',
  },
  steps: {
    'UBUP-01': {
      s: [
        [1, 'Inspect the assembled test vehicles and boards and check rail impedances before power is applied', 0.25],
        [2, 'Apply the supplies in the documented sequence on one unit and log rail currents against the power model', 0.25],
        [3, 'Check the reference clock, resets and the die temperature sensors on both dies', 0.25, 1],
        [4, 'Repeat on the first units and release the power-on and sequencing record', 0.5],
      ],
      o: [
        'Pre-power inspection and rail impedance check',
        'First-unit rail current log against the power model',
        'Reference clock, reset and temperature sensor check',
        'Power-on and supply sequencing record with rail currents per die',
      ],
      r: [['UBUP-D1', 'produces'], ['UBUP-D6', 'feeds']],
    },
    'UBUP-02': {
      s: [
        [1, 'Run sideband initialization between the two dies and capture the sideband message exchange', 0.5],
        [2, 'Read and write the PHY and Adapter registers on both dies through the sideband', 0.5],
        [3, 'Check sideband timing margin by sweeping its clock and recording where messages fail', 0.5, 1],
        [4, 'Exercise the manageability and firmware download paths on the sideband', 0.5],
        [5, 'Release the sideband link-up and register access log', 0.5],
      ],
      o: [
        'Sideband initialization capture between the two dies',
        'Register read and write results on both dies',
        'Sideband timing margin sweep',
        'Manageability and firmware download check on the sideband',
        'Sideband link-up and register access log',
      ],
      r: [['UBUP-D2', 'produces'], ['UBUP-D6', 'feeds']],
    },
    'UBUP-03': {
      s: [
        [1, 'Run MBINIT at a low speed and record the parameter exchange, clock, valid and track checks', 0.75],
        [2, 'Read the lane test results and any lane repair or reversal the dies applied', 0.5],
        [3, 'Run MBTRAIN at 64 GT/s and log the voltage and timing centering result per lane', 1],
        [4, 'Capture the training state machine trace on any unit that stops short of LINKINIT', 0.5, 1],
        [5, 'Release the mainband training log with per-lane results', 0.75],
      ],
      o: [
        'Low-speed MBINIT parameter exchange and lane check record',
        'Lane test results with repair and reversal flags',
        'Per-lane MBTRAIN centering results at 64 GT/s',
        'Training trace for units that did not reach LINKINIT',
        'Mainband training log with per-lane MBINIT and MBTRAIN results',
      ],
      r: [['UBUP-D3', 'produces'], ['UBUP-D5', 'feeds']],
    },
    'UBUP-04': {
      s: [
        [1, 'Bring the link through LINKINIT to the active state and hold it under idle traffic', 0.5],
        [2, 'Run PRBS on every lane in Raw mode and record error counts over a fixed interval', 1],
        [3, 'Send Flit traffic through the Adapter with CRC and retry enabled and count retries', 1, 1],
        [4, 'Release the first link-up and data transfer record', 0.5],
      ],
      o: [
        'Active link held under idle traffic',
        'Per-lane PRBS error counts in Raw mode',
        'Flit traffic result with CRC error and retry counts',
        'First link-up and basic data transfer record at 64 GT/s',
      ],
      r: [['UBUP-D4', 'produces'], ['UBUP-D6', 'feeds']],
    },
    'UBUP-05': {
      s: [
        [1, 'Map each bring-up result onto the post-silicon test plan item it answers', 1],
        [2, 'Compare first-unit training margins with the predicted link margin distribution', 1.5],
        [3, 'Bucket every deviation as die, package, board, lab or prediction and open issues', 1, 1],
        [4, 'Agree with the characterization team which deviations change the corner matrix', 1],
        [5, 'Release the bring-up results against the plan and predictions', 1],
      ],
      o: [
        'Bring-up results mapped to the test plan',
        'First-unit margins against predicted distribution',
        'Deviation buckets and issue list',
        'Agreed changes to the characterization corner matrix',
        'Bring-up results against the pre-silicon test plan and margin predictions',
      ],
      r: [['UBUP-D5', 'produces'], ['UBUP-D6', 'feeds']],
    },
    'UBUP-06': {
      s: [
        [1, 'Collect the power-on, sideband, training and data transfer records for every unit', 0.25],
        [2, 'Review open issues and workarounds and decide which block characterization', 0.5],
        [3, 'Record the first link-up decision with the open-issue list and owners', 0.25],
      ],
      o: [
        'Collected bring-up records per unit',
        'Issue and workaround review with blocking decisions',
        'First link-up decision record and open-issue list',
      ],
      r: [['UBUP-D6', 'produces']],
    },
  },
};
