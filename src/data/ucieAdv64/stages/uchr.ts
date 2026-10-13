/**
 * UCHR — Silicon Characterization. Weeks 100–120; closes on Characterization
 * Report.
 */
import type { UcieStageModule } from '../types';

export const UCHR: UcieStageModule = {
  content: {
    tagline: 'Measure every lane at 64 GT/s across voltage, temperature and process, and hold each number against what was simulated.',
    description:
      'Turn a link that works into data a licensee can design with. Per-lane eye and timing margin from the on-die margining functions, BER at 64 GT/s measured long enough to say something about the target the specification sets, energy per bit across data rates and supplies, and voltage and temperature shmoos on the process split lots. The PHY’s own mechanisms are proven on silicon rather than in simulation: lane repair and lane reversal on deliberately mapped-out lanes and reversed builds, runtime recalibration while the die heats and cools, L1 and L2 entry and exit. The test vehicle channel is measured and correlated with its extracted model, and every result is placed next to the mixed-signal predictions so the models customers receive in the release are corrected by silicon. The stage closes on a reviewed characterization report that the GA release and the customer silicon report are built from.',
    activities: [
      'Plan and corner matrix',
      'Eye and timing margin',
      'BER at 64 GT/s',
      'Energy per bit',
      'PVT shmoo',
      'Repair and reversal',
      'Recalibration and low power',
      'Channel correlation',
      'Measurement to simulation',
      'Report review',
    ],
    deliverables: [
      'Characterization plan and corner matrix',
      'Per-lane eye and timing margin data set',
      'BER measurement report at 64 GT/s with confidence levels',
      'Energy-per-bit measurement report across data rates and supplies',
      'PVT shmoo plots and operating-range summary',
      'Lane repair and lane reversal silicon results',
      'Runtime recalibration and low-power state silicon results',
      'Test vehicle channel correlation report',
      'Measurement-to-simulation correlation report with model updates',
      'Characterization report',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    deliverableWeek: [2, 12, 14, 12, 16, 14, 16, 16, 18, 20],
    engineeringEffort: [2, 8, 8, 4, 8, 5, 5, 4, 6, 2],
    risks: [
      'BER measured over too short a time to support any statement about the target, so the release quotes a number it cannot defend',
      'Silicon disagrees with the mixed-signal models and the release ships the models anyway because the correlation work started too late',
    ],
    potentialRisks: [
      'All characterization done on one module of one unit, so lane-to-lane and unit-to-unit spread is unknown',
      'Process split lots not tracked to units, so the shmoo cannot be read against the corner they were meant to cover',
      'Board and fixture loss not de-embedded, so margins understate what a customer package would see',
      'Lane repair proven only on lanes the firmware chose, never on a deliberately failed lane',
      'Energy per bit quoted at the best operating point while customers run at the worst-case supply',
      'Runtime recalibration exercised at a fixed temperature, so drift tracking is never shown',
    ],
    leader: { name: 'Henrik Adeyemi', short: 'H. Adeyemi', phone: '+1 (408) 555-0662', email: 'henrik.adeyemi@example.com' },
    collaboration: ['Validation', 'Analog and mixed-signal', 'Mixed-signal verification', 'SI/PI', 'RTL design', 'Board and lab hardware', 'Customer engineering'],
    tools: [
      'On-die eye and lane margining read through lab automation',
      'Thermal forcing system for junction temperature control',
      'Programmable supplies with current measurement per rail',
      'Vector network analyzer and time-domain reflectometry for channel measurement',
      'Characterization database and plotting',
    ],
    programView: [
      'Lanes characterized against the corner matrix',
      'BER test hours accumulated at 64 GT/s',
      'Measurements outside the predicted distribution, open and explained',
      'Model updates agreed for the GA release',
    ],
    perspective:
      'A licensee cannot measure this IP before they buy it; they will design their package and their power budget from these numbers. Characterize the worst lane at the worst corner rather than the best lane at room temperature, and write down how long each BER number was measured for.',
  },
  steps: {
    'UCHR-01': {
      s: [
        [1, 'Turn the PPA targets and the agreed bring-up deviations into the parameters to characterize', 0.5],
        [2, 'Build the corner matrix — supplies, temperatures, process split lots, data rates and units', 0.5],
        [3, 'Allocate units and modules per corner and reserve units for reliability and compliance', 0.5, 1],
        [4, 'Set test durations and pass criteria per measurement and release the plan', 1],
      ],
      o: [
        'Characterized parameter list tied to targets',
        'Corner matrix by supply, temperature, split, rate and unit',
        'Unit and module allocation per corner',
        'Characterization plan and corner matrix',
      ],
      r: [['UCHR-D1', 'produces'], ['UCHR-D10', 'feeds']],
    },
    'UCHR-02': {
      s: [
        [1, 'Calibrate the on-die eye margining against a bench measurement on reference lanes', 1],
        [2, 'Sweep voltage and timing margin on every lane of every module at nominal conditions', 3],
        [3, 'Repeat the sweep at the corner matrix supplies and temperatures', 4],
        [4, 'Compute margin spread per lane, module and unit and flag outlier lanes', 1, 1],
        [5, 'Release the per-lane margin data set', 1],
      ],
      o: [
        'On-die margining calibrated against bench measurement',
        'Nominal per-lane voltage and timing margins',
        'Per-lane margins across the corner matrix',
        'Margin spread and outlier lanes',
        'Per-lane eye and timing margin data set',
      ],
      r: [['UCHR-D2', 'produces'], ['UCHR-D9', 'feeds']],
    },
    'UCHR-03': {
      s: [
        [1, 'Set the test time per configuration from the confidence level the BER statement needs', 0.5],
        [2, 'Run long PRBS tests on every lane at 64 GT/s at nominal and worst-case corners', 6],
        [3, 'Measure the post-CRC error and retry rate with Flit traffic on the same units', 3, 1],
        [4, 'Build bathtub curves from the margining data to extrapolate below measured error rates', 2],
        [5, 'Release the BER report with test times and confidence levels', 1.5],
      ],
      o: [
        'Test time per configuration from the required confidence',
        'Long-duration per-lane PRBS error counts',
        'Post-CRC error and retry rates under Flit traffic',
        'Bathtub extrapolation per lane',
        'BER measurement report at 64 GT/s with confidence levels',
      ],
      r: [['UCHR-D3', 'produces'], ['UCHR-D9', 'feeds']],
    },
    'UCHR-04': {
      s: [
        [1, 'Separate PHY supply currents from test chip logic and board loads', 1.5],
        [2, 'Measure active power per module at 64 GT/s and the lower supported rates', 3],
        [3, 'Measure idle, L1 and L2 power and the energy spent entering and leaving them', 2, 1],
        [4, 'Compute energy per bit at nominal and worst-case supply and release the report', 1.5],
      ],
      o: [
        'PHY-only supply current isolation',
        'Active power per module across data rates',
        'Idle and low-power state power with transition energy',
        'Energy-per-bit measurement report across data rates and supplies',
      ],
      r: [['UCHR-D4', 'produces'], ['UCHR-D9', 'feeds']],
    },
    'UCHR-05': {
      s: [
        [1, 'Map units to the process split lots and record the split of every unit', 1],
        [2, 'Shmoo data rate against supply at room, cold and hot junction temperature', 5],
        [3, 'Shmoo training success against supply and temperature on the corner units', 2, 1],
        [4, 'Find the operating-range edge per corner and compare with the specified range', 2],
        [5, 'Release the shmoo plots and operating-range summary', 1],
      ],
      o: [
        'Unit-to-split mapping',
        'Data rate against supply shmoos at three temperatures',
        'Training success shmoos on corner units',
        'Operating-range edge per corner against specification',
        'PVT shmoo plots and operating-range summary',
      ],
      r: [['UCHR-D5', 'produces'], ['UCHR-D10', 'feeds']],
    },
    'UCHR-06': {
      s: [
        [1, 'Force lane failures through test modes and confirm training maps each onto a redundant lane', 2],
        [2, 'Repeat with failures on clock, valid and track lanes and on lanes at the module edges', 2],
        [3, 'Run the reversed-orientation build and confirm lane reversal is detected and undone', 1.5, 1],
        [4, 'Measure margin and BER on repaired and reversed links against unrepaired ones', 2],
        [5, 'Release the lane repair and reversal results', 1],
      ],
      o: [
        'Forced data-lane failures repaired by training',
        'Clock, valid, track and edge-lane repair results',
        'Lane reversal detection on the reversed build',
        'Margins and BER on repaired and reversed links',
        'Lane repair and lane reversal silicon results',
      ],
      r: [['UCHR-D6', 'produces'], ['UCHR-D10', 'feeds']],
    },
    'UCHR-07': {
      s: [
        [1, 'Ramp junction temperature with the link active and log recalibration events and margins', 3],
        [2, 'Step the supply within its range under traffic and confirm recalibration follows', 2],
        [3, 'Cycle L1 and L2 entry and exit and measure exit latency and first-traffic errors', 2, 1],
        [4, 'Force a PHYRETRAIN under traffic and record the interruption', 1],
        [5, 'Release the recalibration and low-power results', 1],
      ],
      o: [
        'Recalibration and margin log across a temperature ramp',
        'Recalibration under supply steps',
        'L1 and L2 cycling with exit latency and errors',
        'PHYRETRAIN interruption under traffic',
        'Runtime recalibration and low-power state silicon results',
      ],
      r: [['UCHR-D7', 'produces'], ['UCHR-D10', 'feeds']],
    },
    'UCHR-08': {
      s: [
        [1, 'Measure test vehicle channel structures — insertion loss, crosstalk and return loss', 3],
        [2, 'Compare the measurements with the extracted channel models', 2],
        [3, 'De-embed board and fixture contributions from the link margins', 1.5, 1],
        [4, 'Update the channel model and release the correlation report', 2],
      ],
      o: [
        'Measured channel structures on the test vehicle',
        'Measured against extracted channel comparison',
        'De-embedded link margins',
        'Test vehicle channel correlation report',
      ],
      r: [['UCHR-D8', 'produces'], ['UCHR-D9', 'feeds']],
    },
    'UCHR-09': {
      s: [
        [1, 'Place measured margins, BER and energy per bit against the predicted distributions', 1.5],
        [2, 'Explain each deviation as model, channel, process split or measurement', 1.5],
        [3, 'Re-run the mixed-signal models with the measured channel and silicon corners', 1.5, 1],
        [4, 'Agree model updates for the GA release and release the correlation report', 2],
      ],
      o: [
        'Measurements against predicted distributions',
        'Deviation explanations by cause',
        'Re-run models with measured channel and corners',
        'Measurement-to-simulation correlation report with model updates',
      ],
      r: [['UCHR-D9', 'produces'], ['UCHR-D10', 'feeds']],
    },
    'UCHR-10': {
      s: [
        [1, 'Assemble the characterization results against the plan and the PPA targets', 1.5],
        [2, 'Review results, open deviations and model updates with design and customer engineering', 1.5],
        [3, 'Release the characterization report', 1],
      ],
      o: [
        'Results assembled against plan and targets',
        'Review record with open deviations',
        'Characterization report',
      ],
      r: [['UCHR-D10', 'produces']],
    },
  },
};
