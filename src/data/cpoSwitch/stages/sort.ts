/**
 * SORT — Wafer Sort & Known-Good-Die. Weeks 114–132; closes on Known-Good-Die Ready.
 * The electrical IC is sorted first (weeks 114–120) and the photonic IC next
 * (120–125), ahead of the Switch SoC and I/O die (122–128).
 */
import type { CpoStageModule } from '../types';

export const SORT: CpoStageModule = {
  content: {
    tagline: 'Every die that goes into a co-packaged switch must be good before it goes in — nothing comes back out.',
    description:
      'Bring up wafer sort on first silicon for each die on its own program and probe card — the Switch SoC, the I/O die with its SerDes and die-to-die PHY tests, and the electrical IC with its driver and TIA tests — and wafer-level optical test for the photonic IC, then turn the first-lot data into known-good-die screening criteria: limits, bins, outlier screens and the correlation that shows a die passing sort will work in the package. Because a package needs every one of its dies to be good, per-die escapes multiply into package loss, so the screens are set against the compound yield model rather than each die alone. The dies arrive in the order their waves left: the electrical IC is sorted first and the photonic IC next, so the optical engine build can start on them, then the Switch SoC and the I/O die. The stage closes when kits of known-good dies are banked, traceable and released to the first package build.',
    activities: ['Switch SoC sort bring-up', 'I/O die sort bring-up', 'EIC sort bring-up', 'PIC optical wafer test', 'KGD criteria and correlation', 'Die bank and release'],
    deliverables: [
      'Switch SoC electrical wafer sort program release and first-lot sort data',
      'I/O die electrical wafer sort program release and first-lot sort data',
      'Electrical IC wafer sort results and wafer maps with trim data',
      'Photonic IC wafer-level optical test results and wafer maps',
      'Known-good-die screening specification and bin definitions',
      'Sort correlation and compound yield report',
      'Die bank inventory and known-good-die release to assembly',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 4, 5],
    deliverableWeek: [14, 14, 6, 11, 16, 16, 18],
    engineeringEffort: [6, 4, 3, 8, 6, 3],
    risks: [
      'Screens too loose, so bad dies are assembled and each escape scraps a package full of good ones',
      'Photonic wafer-level test does not correlate with packaged optical performance',
    ],
    potentialRisks: [
      'Sort program debugged on first silicon for so long that the first package build starts without known-good dies',
      'Limits set from one lot’s distribution and not from the link budget or the package yield model',
      'Optical probe insertion loss uncalibrated, so photonic dies are binned on probe variation rather than die performance',
      'Security provisioning at sort run on an open tester, exposing keys before the device is locked',
      'Die bank without per-die traceability, so a later package failure cannot be joined to its sort data',
    ],
    leader: { name: 'Arjun Mehta', short: 'A. Mehta', phone: '+1 (408) 555-0514', email: 'arjun.mehta@example.com' },
    collaboration: ['Test engineering', 'Photonics', 'Optical engineering', 'Manufacturing and NPI', 'DFT', 'Security', 'Quality'],
    tools: ['Automatic test equipment', 'Wafer prober with optical probe', 'Test data analytics and wafer map viewer', 'Manufacturing execution and die bank inventory system'],
    programView: [
      'Sort yield per die per lot',
      'Known-good dies banked against the first-build kit count',
      'Photonic wafer-level test correlation to reference',
      'Test time per wafer against the cost model',
    ],
    perspective:
      'Known-good die is a yield decision, not a test decision. Set every screen against what an escape costs in a package holding several other good dies, and the right limit is usually tighter than the die team would choose alone.',
  },
  steps: {
    'SORT-01': {
      s: [
        [1, 'Install the Switch SoC probe cards and verify contact, planarity and continuity on the first wafers', 1],
        [2, 'Debug the sort program on first silicon — continuity, leakage, scan, memory BIST and supply currents', 2],
        [3, 'Bring up at-speed scan and the die-to-die PHY loopback on the Switch SoC side', 1.5, 1],
        [4, 'Program trims, fuses and keys through the agreed secure provisioning flow', 1],
        [5, 'Sort the first lots across the corner splits and collect wafer maps and data logs', 1.5],
        [6, 'Release the sort program and first-lot sort data', 0.5],
      ],
      o: [
        'Probe contact and continuity verification',
        'Debugged structural and parametric sort tests',
        'Working at-speed and die-to-die loopback sort tests',
        'Trim, fuse and key programming verified',
        'First-lot wafer maps and data logs',
        'Switch SoC electrical wafer sort program release and first-lot sort data',
      ],
      r: [['SORT-D1', 'produces'], ['SORT-D5', 'feeds']],
    },
    'SORT-02': {
      s: [
        [1, 'Install the I/O die probe cards and verify contact on the fine-pitch die-to-die bumps and the SerDes pads', 1],
        [2, 'Debug structural and parametric tests — continuity, leakage, scan and supply currents', 1.5],
        [3, 'Bring up SerDes internal loopback, PRBS generator and checker and on-die eye margin tests', 2, 1],
        [4, 'Bring up die-to-die PHY loopback and lane-repair tests', 1],
        [5, 'Program trims and fuses and sort the first lots across the corner splits', 1.5],
        [6, 'Release the I/O die sort program and first-lot sort data', 0.5],
      ],
      o: [
        'I/O die probe contact verification',
        'Debugged I/O die structural and parametric tests',
        'Working SerDes loopback, PRBS and eye margin tests',
        'Working die-to-die PHY loopback and lane-repair tests',
        'I/O die first-lot wafer maps with trims programmed',
        'I/O die electrical wafer sort program release and first-lot sort data',
      ],
      r: [['SORT-D2', 'produces'], ['SORT-D5', 'feeds']],
    },
    'SORT-03': {
      s: [
        [1, 'Verify probe contact and the high-frequency probe setup on the driver and TIA pads', 0.5],
        [2, 'Debug DC parametric tests — supply currents, bias references and leakage', 1],
        [3, 'Bring up driver output swing and TIA gain and bandwidth tests at wafer level', 1.5, 1],
        [4, 'Trim bias and control DACs and program fuses per die', 1],
        [5, 'Sort the first lots across the splits and generate wafer maps', 1.5],
        [6, 'Release the electrical IC sort results, wafer maps and trim data', 0.5],
      ],
      o: [
        'Electrical IC probe and high-frequency setup verification',
        'Debugged electrical IC DC parametric tests',
        'Working driver swing and TIA gain and bandwidth tests',
        'Per-die bias and control trim data',
        'Electrical IC first-lot wafer maps',
        'Electrical IC wafer sort results and wafer maps with trim data',
      ],
      r: [['SORT-D3', 'produces'], ['SORT-D5', 'feeds']],
    },
    'SORT-04': {
      s: [
        [1, 'Align the optical probe to the test couplers and calibrate insertion loss against reference structures', 1],
        [2, 'Measure waveguide and coupler loss, detector responsivity and dark current per die', 1.5],
        [3, 'Measure modulator efficiency and ring resonance with the heater tuning range', 2, 1],
        [4, 'Correlate wafer-level results with the in-line optical monitors and split conditions', 1],
        [5, 'Generate wafer maps and per-die optical pass / fail', 1],
        [6, 'Release the optical wafer test results and wafer maps', 0.5],
      ],
      o: [
        'Calibrated optical probe setup',
        'Per-die loss, responsivity and dark current data',
        'Per-die modulator and resonance data',
        'Correlation to in-line monitors and splits',
        'Photonic wafer maps with pass / fail',
        'Photonic IC wafer-level optical test results and wafer maps',
      ],
      r: [['SORT-D4', 'produces'], ['SORT-D5', 'feeds']],
    },
    'SORT-05': {
      s: [
        [1, 'Set known-good-die limits per die from first-lot distributions, the link budget and the package yield model', 1.5],
        [2, 'Define bins and die-level screens — outlier detection and stress screens where required', 1.5],
        [3, 'Correlate sort results with bench characterization on sampled dies and across testers', 1.5, 1],
        [4, 'Compute compound package yield from per-die yield and set escape targets', 1],
        [5, 'Release the screening specification and the correlation and yield report', 1],
      ],
      o: [
        'Known-good-die limits per die',
        'Bin definitions and outlier screens',
        'Sort-to-bench and tester-to-tester correlation',
        'Compound yield estimate with escape targets',
        'Known-good-die screening specification and correlation report',
      ],
      r: [['SORT-D5', 'produces'], ['SORT-D6', 'produces'], ['SORT-D7', 'feeds']],
    },
    'SORT-06': {
      s: [
        [1, 'Singulate, pick and pack known-good dies into the die bank with per-die traceability', 1.5],
        [2, 'Match dies into kits per the build matrix — Switch SoC, I/O die, electrical and photonic ICs and bridge', 1],
        [3, 'Reconcile inventory against the build plan and flag shortfalls', 0.5, 1],
        [4, 'Release the known-good-die kits to assembly', 0.5],
      ],
      o: [
        'Banked known-good dies with traceability',
        'Matched first-build kits',
        'Inventory reconciliation and shortfall list',
        'Die bank inventory and known-good-die release to assembly',
      ],
      r: [['SORT-D7', 'produces']],
    },
  },
};
