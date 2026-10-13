/**
 * UAMS — Mixed-Signal Verification & Link Margin. Weeks 34–60; closes on Link
 * Margin Review.
 */
import type { UcieStageModule } from '../types';

export const UAMS: UcieStageModule = {
  content: {
    tagline: 'Prove the analog and the logic train together over a real channel, and predict the margin silicon will show.',
    description:
      'Join the Electrical PHY and the Logical PHY in one simulation. Behavioral models of the TX, RX, PLL and clocking and of the on-die sensors are built from the circuits and validated against them, then co-simulated with the training, recalibration and lane-management RTL so that MBINIT and MBTRAIN converge on analog behavior rather than on ideal switches, and recalibration fires on the sensor thresholds it will see on silicon. The same models run with extracted package channel models across the bump pitch range, with and without receiver termination where the package type allows the choice, to compute link margin at 64 GT/s, and across PVT corners and Monte Carlo mismatch to turn single margins into distributions. The stage ends by writing down what silicon should show — margin predictions per lane and corner and the measurement plan that will check them — and holding the link margin review that says the design has enough.',
    activities: [
      'Behavioral models',
      'Mixed-signal co-simulation',
      'Training with analog models',
      'Link margin with channel',
      'Statistical link margin',
      'Model-to-circuit correlation',
      'Silicon margin predictions',
      'Link margin review',
    ],
    deliverables: [
      'Electrical PHY behavioral model set with its validation plan',
      'Mixed-signal co-simulation regression and results',
      'Link training co-simulation report with analog models in the loop',
      'Link margin report with package channel models across the bump pitch range',
      'Statistical link margin report across PVT corners and Monte Carlo',
      'Behavioral model to transistor-level correlation report',
      'Silicon margin predictions and measurement plan',
      'Link margin review decision record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7],
    deliverableWeek: [6, 18, 20, 22, 22, 22, 24, 26],
    engineeringEffort: [5.5, 9.5, 8.5, 7, 5.5, 4, 3.5, 1.5],
    risks: [
      'Behavioral models that agree with the circuits at nominal and diverge at the corners, so the margin report is optimistic exactly where it matters',
      'Link margin computed on a channel model of one package type while customers integrate on another',
    ],
    potentialRisks: [
      'Co-simulation too slow to run full training sequences, so training is verified only on shortened sequences',
      'Monte Carlo statistics from too few samples to say anything about the tail the BER target lives in',
      'Calibration and training codes in the models drifting from the analog control register specification',
      'Margin predictions written without stating corner, channel and temperature, so silicon cannot be compared with them',
      'Link margin review held after layout has started changing the circuits the models were built from',
    ],
    leader: { name: 'Tobias Lindgren', short: 'T. Lindgren', phone: '+1 (408) 555-0612', email: 'tobias.lindgren@example.com' },
    collaboration: ['Mixed-signal verification', 'Analog and mixed-signal', 'RTL design', 'SI/PI', 'Design verification', 'Validation'],
    tools: ['Mixed-signal co-simulation environment', 'Behavioral and real-number modeling language', 'Statistical link analysis tools', 'Package channel extraction and S-parameter models'],
    programView: [
      'Worst-case link margin at 64 GT/s against target, by package type',
      'Training scenarios converged in co-simulation against the plan',
      'Model-to-circuit correlation error per block',
      'Margin predictions published for every corner silicon will measure',
    ],
    perspective:
      'The value of this stage is the prediction, not the pass. A margin report that says “passes” cannot be checked; one that says “this lane, this corner, this many picoseconds” can — and when silicon disagrees, it tells the program which model was wrong.',
  },
  steps: {
    'UAMS-01': {
      s: [
        [1, 'Define the model set, the abstraction per block and the accuracy each must hold', 1],
        [2, 'Build behavioral models of the TX driver, RX front-end and sampler, PLL and clocking, and the sensors from the schematics', 3],
        [3, 'Model the calibration and training controls exactly as the register specification defines them', 1.5, 1],
        [4, 'Write the model validation plan — which metrics, which corners, which tolerance', 1],
        [5, 'Release the behavioral model set with its validation plan', 1],
      ],
      o: [
        'Model set and accuracy targets',
        'Behavioral models of TX, RX, PLL, clocking and sensors',
        'Calibration and training controls modeled to the specification',
        'Model validation plan',
        'Electrical PHY behavioral model set with its validation plan',
      ],
      r: [['UAMS-D1', 'produces'], ['UAMS-D6', 'feeds']],
    },
    'UAMS-02': {
      s: [
        [1, 'Assemble the co-simulation bench — Logical PHY RTL with the Electrical PHY models for a full module', 3],
        [2, 'Run power-up, reset and calibration sequences through the analog models', 3],
        [3, 'Run data transfer with scrambling, deskew and lane mapping over the analog models', 3, 1],
        [4, 'Run lane repair and lane reversal with analog faults injected on bumps', 3],
        [5, 'Put the scenarios into a nightly regression and triage failures with RTL and analog owners', 3],
        [6, 'Release the co-simulation regression and results', 1],
      ],
      o: [
        'Full-module co-simulation bench',
        'Power-up, reset and calibration results',
        'Data transfer results over analog models',
        'Lane repair and reversal results with bump faults',
        'Nightly co-simulation regression with triage log',
        'Mixed-signal co-simulation regression and results',
      ],
      r: [['UAMS-D2', 'produces'], ['UAMS-D8', 'feeds']],
    },
    'UAMS-03': {
      s: [
        [1, 'Run sideband initialization and the mainband initialization sequence with analog models', 3],
        [2, 'Run mainband training — voltage and timing centering — and check convergence per lane', 4],
        [3, 'Run lane repair onto redundant lanes and speed fallback when lanes fail training, and the transition to training error beyond repair', 3, 1],
        [4, 'Run runtime recalibration triggered by the modeled temperature and voltage sensor thresholds under drift', 3],
        [5, 'Run retrain and training-error entry and exit', 2],
        [6, 'Release the training co-simulation report', 1],
      ],
      o: [
        'Sideband and mainband initialization results',
        'Training convergence per lane',
        'Lane repair, speed fallback and training-error results',
        'Sensor-triggered runtime recalibration results under drift',
        'Retrain and training-error results',
        'Link training co-simulation report with analog models in the loop',
      ],
      r: [['UAMS-D3', 'produces'], ['UAMS-D8', 'feeds']],
    },
    'UAMS-04': {
      s: [
        [1, 'Collect extracted channel models for each supported package type and the bump pitch extremes', 2],
        [2, 'Build the link model — TX model, channel, RX model and clock path — per lane', 3],
        [3, 'Compute timing and voltage margin at 64 GT/s per lane and package type, including crosstalk, with and without receiver termination where the choice exists', 4],
        [4, 'Find the worst lanes and their aggressors and feed the results to bump map and routing', 2, 1],
        [5, 'Compute margin with supply noise from the power delivery analysis', 2],
        [6, 'Release the link margin report', 1],
      ],
      o: [
        'Channel models per package type and pitch extreme',
        'Per-lane link model',
        'Timing and voltage margin per lane and package',
        'Worst-lane and aggressor list for bump map feedback',
        'Margin with supply noise',
        'Link margin report with package channel models across the bump pitch range',
      ],
      r: [['UAMS-D4', 'produces'], ['UAMS-D5', 'feeds']],
    },
    'UAMS-05': {
      s: [
        [1, 'Set the statistical plan — corners, temperature points and sample counts tied to the BER target', 2],
        [2, 'Run link margin across the PVT corners with the worst channel', 4],
        [3, 'Run Monte Carlo mismatch on the link model and fit the margin distribution', 4, 1],
        [4, 'Extrapolate the distribution to the BER target and compute the yield of lanes meeting margin', 3],
        [5, 'Release the statistical link margin report', 1],
      ],
      o: [
        'Statistical plan',
        'Link margin across PVT corners',
        'Margin distribution from Monte Carlo',
        'Extrapolated margin at the BER target and lane yield',
        'Statistical link margin report across PVT corners and Monte Carlo',
      ],
      r: [['UAMS-D5', 'produces'], ['UAMS-D7', 'feeds']],
    },
    'UAMS-06': {
      s: [
        [1, 'Run the validation plan metrics on the behavioral models and on the transistor-level circuits', 3],
        [2, 'Compare at every corner in the plan and record the error per metric', 3],
        [3, 'Fix the models that exceed tolerance and re-run', 2, 1],
        [4, 'Release the correlation report with the remaining error per block', 1],
      ],
      o: [
        'Model and circuit results on the plan metrics',
        'Error per metric and corner',
        'Corrected models within tolerance',
        'Behavioral model to transistor-level correlation report',
      ],
      r: [['UAMS-D6', 'produces'], ['UAMS-D8', 'feeds']],
    },
    'UAMS-07': {
      s: [
        [1, 'Write margin predictions per lane, corner, package type and temperature in the form silicon will measure them', 2],
        [2, 'Write the silicon measurement plan — which test, which setting, which pass threshold — for each prediction', 2],
        [3, 'Map each prediction to the on-die margining and PRBS functions that can measure it', 1, 1],
        [4, 'Release the predictions and plan to bring-up, characterization and the test vehicle team', 1],
      ],
      o: [
        'Margin predictions per lane, corner and package',
        'Silicon measurement plan',
        'Prediction-to-measurement-function map',
        'Silicon margin predictions and measurement plan',
      ],
      r: [['UAMS-D7', 'produces'], ['UAMS-D8', 'feeds']],
    },
    'UAMS-08': {
      s: [
        [1, 'Collect the co-simulation, training, link margin, statistics and correlation reports', 1],
        [2, 'Review eye height and width at the target BER and the Monte Carlo yield against the agreed pass thresholds, per package type', 1.5],
        [3, 'Record design changes required and the margin carried into layout', 0.5, 1],
        [4, 'Hold the link margin review and record the pass or fail decision per package type', 1],
      ],
      o: [
        'Collected margin evidence',
        'Eye and yield review against the agreed thresholds per package',
        'Required changes and carried margin',
        'Link margin review decision record',
      ],
      r: [['UAMS-D8', 'produces']],
    },
  },
};
