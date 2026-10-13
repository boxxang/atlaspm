/**
 * URLQ — Reliability Qualification for Silicon-Proven. Weeks 102–128; closes on
 * Silicon-Proven.
 */
import type { UcieStageModule } from '../types';

export const URLQ: UcieStageModule = {
  content: {
    tagline: 'Stress the PHY until its margins move, and only then call it silicon-proven.',
    description:
      'Qualify the hard macro’s reliability on test chip silicon so licensees can rely on it in their own products. High-temperature operating life stress starts after the first link-up, on units screened through the package final test program for their time-zero data, runs on dynamic stress boards with the link exercised at 64 GT/s, and uses read points that re-measure per-lane margin and BER, so wear-out shows as margin drift rather than as a pass or fail count. ESD on the die-to-die bumps is qualified at die or wafer level on test structures and probe pads — assembled microbumps sit under the other die and cannot be zapped — while package-level ESD covers only the external pins, and latch-up is tested on the PHY supplies; and temperature cycling on the advanced-package test vehicle shows the fine-pitch bumps and the bridge or interposer holding — with lane repair counts tracked so a bump that opens under stress is seen even when the link repairs around it. The reliability report states what was stressed, for how long, on how many units from how many lots, and what moved, and the silicon-proven decision weighs it together with characterization and compliance. Silicon-Proven is the claim the production release rests on.',
    activities: ['Reliability plan', 'Operating life stress', 'ESD and latch-up', 'Temperature cycling', 'Reliability report', 'Silicon-proven decision'],
    deliverables: [
      'Reliability qualification plan with stress conditions, sample sizes and read points',
      'Operating life stress results with per-lane margin and BER read points',
      'ESD and latch-up qualification results',
      'Temperature cycling and package-level reliability results with lane repair tracking',
      'Reliability report',
      'Silicon-proven decision record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [2, 22, 10, 22, 24, 26],
    engineeringEffort: [1.5, 6, 3, 5, 2, 1],
    risks: [
      'Stress run with the link idle, so wear-out of the front-end under 64 GT/s switching is never exercised',
      'Bumps open under temperature cycling but lane repair hides them, and the package reliability claim is made on repaired links',
    ],
    potentialRisks: [
      'Too few units per stress leg to support a reliability statement',
      'Read points that only check pass or fail, so slow margin drift is invisible',
      'ESD targets tested at a different level from the one the integration guide promises customers',
      'Test vehicle package differs from the package technologies licensees use, limiting what the cycling results say',
      'Stress boards and sockets not ready when silicon arrives, delaying the start of operating life stress',
      'The silicon-proven claim resting on one shuttle lot without saying so',
    ],
    leader: { name: 'Priya Castellanos', short: 'P. Castellanos', phone: '+1 (408) 555-0664', email: 'priya.castellanos@example.com' },
    collaboration: ['Reliability', 'Quality', 'Validation', 'Analog and mixed-signal', 'Packaging', 'Test engineering'],
    tools: ['Operating life stress ovens with in-situ link exercise', 'ESD and latch-up test systems', 'Temperature cycling chambers', 'Reliability data tracking by unit and read point'],
    programView: [
      'Stress hours accumulated per leg',
      'Units failed or drifted at each read point',
      'Lanes repaired after cycling against before',
      'Open reliability findings',
    ],
    perspective:
      'Licensees take the IP’s reliability on trust and then carry it into their own qualification. Stress it the way they will use it — link running, at speed, read back as margin — and report drift as carefully as failures, because drift is what their products will see first.',
  },
  steps: {
    'URLQ-01': {
      s: [
        [1, 'Set the stress legs, conditions and durations from the reliability targets and the aging analysis', 0.5],
        [2, 'Set sample sizes per leg and select units with known lane repair state', 0.5],
        [3, 'Define read points that re-measure per-lane margin and BER, not only pass or fail', 0.5, 1],
        [4, 'Confirm the stress boards, sockets and package final test program and release the plan', 1],
      ],
      o: [
        'Stress legs with conditions and durations',
        'Sample sizes and unit selection',
        'Read point definitions with margin and BER',
        'Reliability qualification plan with stress conditions, sample sizes and read points',
      ],
      r: [['URLQ-D1', 'produces'], ['URLQ-D5', 'feeds']],
    },
    'URLQ-02': {
      s: [
        [1, 'Screen every stress unit through the package final test program and record its time-zero margin and BER', 1.5],
        [2, 'Run operating life stress on the dynamic stress boards at elevated temperature and voltage with the link exercised at 64 GT/s', 12],
        [3, 'Re-measure per-lane margin and BER at each read point and log drift', 3, 1],
        [4, 'Analyze drift and failures, compute the acceleration and lifetime estimate, and compare the drift extrapolated to end of life with the signoff aging simulation and its calibration range coverage', 3],
        [5, 'Release the operating life stress results', 1],
      ],
      o: [
        'Screened units with time-zero margin and BER',
        'Completed operating life stress hours with link exercise',
        'Per-lane drift at each read point',
        'Drift and failure analysis with lifetime estimate',
        'Operating life stress results with per-lane margin and BER read points',
      ],
      r: [['URLQ-D2', 'produces'], ['URLQ-D5', 'feeds']],
    },
    'URLQ-03': {
      s: [
        [1, 'Test ESD on every die-to-die bump class at die or wafer level, on test structures and probe pads, and on the external pins at package level', 3],
        [2, 'Test latch-up on the PHY supplies and I/O at the specified temperature', 2],
        [3, 'Re-check link function and leakage after each stress', 1.5, 1],
        [4, 'Analyze failures and release the ESD and latch-up results', 2],
      ],
      o: [
        'Die-level ESD results per bump class and package-level results on external pins',
        'Latch-up results on supplies and I/O',
        'Post-stress function and leakage checks',
        'ESD and latch-up qualification results',
      ],
      r: [['URLQ-D3', 'produces'], ['URLQ-D5', 'feeds']],
    },
    'URLQ-04': {
      s: [
        [1, 'Record the time-zero lane repair state and margins of every cycling unit', 1.5],
        [2, 'Run temperature cycling on the advanced-package test vehicles', 12],
        [3, 'Retrain at each read point and log newly repaired lanes and margin change', 3, 1],
        [4, 'Cross-section and inspect failing or newly repaired bump sites', 2.5],
        [5, 'Release the temperature cycling and package-level results', 1.5],
      ],
      o: [
        'Time-zero lane repair state and margins',
        'Completed temperature cycling on test vehicles',
        'Newly repaired lanes and margin change per read point',
        'Bump site cross-sections and inspection findings',
        'Temperature cycling and package-level reliability results with lane repair tracking',
      ],
      r: [['URLQ-D4', 'produces'], ['URLQ-D5', 'feeds']],
    },
    'URLQ-05': {
      s: [
        [1, 'Collect stress results by leg, unit and read point', 1],
        [2, 'State what was stressed, for how long, on how many units from how many lots, what moved, and how the measured drift compares with the signoff aging prediction', 1.5],
        [3, 'Review findings with design and quality and release the report', 1.5],
      ],
      o: [
        'Stress results collected by leg, unit and read point',
        'Stress coverage and drift statements',
        'Reliability report',
      ],
      r: [['URLQ-D5', 'produces'], ['URLQ-D6', 'feeds']],
    },
    'URLQ-06': {
      s: [
        [1, 'Weigh the reliability report with the characterization report and compliance results', 1],
        [2, 'Review open findings and the conditions attached to the claim', 0.5],
        [3, 'Record the silicon-proven decision with the lots and sample counts behind it and its conditions', 0.5],
      ],
      o: [
        'Combined reliability, characterization and compliance view',
        'Open findings and claim conditions',
        'Silicon-proven decision record',
      ],
      r: [['URLQ-D6', 'produces']],
    },
  },
};
