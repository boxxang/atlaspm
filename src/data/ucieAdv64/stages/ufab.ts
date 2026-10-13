/**
 * UFAB — Fabrication, Sort & Assembly. Weeks 76–98; closes on Silicon in Hand.
 */
import type { UcieStageModule } from '../types';

export const UFAB: UcieStageModule = {
  content: {
    tagline: 'From the shuttle to the lab bench: wafers, known-good dies, two-die test vehicles and boards, tracked as one chain.',
    description:
      'Track the test chip wafers through the foundry and through wafer bumping of the fine-pitch microbumps against the committed cycle time and the planned process splits, sort them on the fine-pitch probe card with scan, BIST, PRBS loopback and supply tests, and select known-good dies for each use. Assemble every test vehicle variant — bridge, interposer, reversed orientation and the build with the partner’s die — over six weeks with the assembly partner, inspect the assemblies, screen every unit on the package final test program at time zero, mount them on the evaluation boards, and receive the first samples into the lab with every unit traced to its wafer, split, variant and assembly. The stage closes on silicon in hand: boards on the bench, allocated to bring-up, characterization, compliance and reliability.',
    activities: ['Wafer fab tracking', 'Wafer sort and KGD', 'Test vehicle assembly', 'Board assembly', 'First samples in the lab'],
    deliverables: [
      'Test chip wafer-out record with process monitor data and split confirmation',
      'Wafer sort maps and known-good-die list with allocation by use',
      'Assembled test vehicles for every variant with travelers, inspection records and package final test results',
      'Evaluation boards with test vehicles mounted and inspected',
      'First samples receipt and lab allocation record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [14, 16, 21, 21, 22],
    engineeringEffort: [2, 3, 4, 2, 1],
    risks: [
      'Two-die assemblies multiply sort escapes: one weak die makes a whole test vehicle useless for characterization',
      'Assembly yield on fine-pitch bumps lower than planned, leaving too few units for characterization, compliance and reliability at once',
    ],
    potentialRisks: [
      'Shuttle cycle time slipping with no early warning because lots are tracked by email',
      'Microbump height or coplanarity out of range after wafer bumping, found only at assembly',
      'Split wafers mislabeled, so corner characterization is attributed to the wrong process condition',
      'Probe contact problems read as die failures and good dies rejected',
      'Assembly warpage or underfill voids on the bridge or interposer degrading lanes that lane repair then hides',
      'Units reaching the lab without travelers, so a failing link cannot be traced to its wafer or assembly',
    ],
    leader: { name: 'Gustavo Lindgren', short: 'G. Lindgren', phone: '+1 (408) 555-0635', email: 'gustavo.lindgren@example.com' },
    collaboration: ['Technology and foundry', 'Test engineering', 'Packaging', 'Board and lab hardware', 'Validation', 'Quality'],
    tools: ['Foundry lot tracking', 'Automatic test equipment with fine-pitch probing', 'Wafer map and test data analysis', 'Assembly inspection — X-ray and acoustic microscopy'],
    programView: [
      'Projected wafer out against the committed date',
      'Sort yield and known-good dies against assembly needs',
      'Test vehicles assembled and passing inspection',
      'Units allocated per use against plan',
    ],
    perspective:
      'Silicon in hand is a chain of four suppliers and three handoffs. Track it as one chain with one owner per link, because the critical path moves between the foundry, the tester, the assembly line and the board shop without anyone announcing it.',
  },
  steps: {
    'UFAB-01': {
      s: [
        [1, 'Confirm lot starts, split assignments and priority with the foundry', 0.5],
        [2, 'Track lots through front-end and back-end processing against the committed cycle time', 9],
        [3, 'Track wafer bumping of the fine-pitch microbumps and review bump height and coplanarity', 2],
        [4, 'Review in-line excursions and process monitor data on the PHY’s critical devices', 4, 1],
        [5, 'Receive the bumped wafers with process monitor data and confirm each split condition', 1],
        [6, 'Release the wafer-out record', 0.5],
      ],
      o: [
        'Confirmed lot starts, splits and priority',
        'Weekly lot position against cycle time',
        'Bumped wafers with bump height and coplanarity data',
        'Excursion and process monitor review',
        'Received bumped wafers with confirmed split conditions',
        'Test chip wafer-out record',
      ],
      r: [['UFAB-D1', 'produces'], ['UFAB-D2', 'feeds']],
    },
    'UFAB-02': {
      s: [
        [1, 'Load the sort program and verify probe contact on the first wafer', 0.5],
        [2, 'Sort every wafer with scan, BIST, PRBS loopback and supply tests', 1],
        [3, 'Select known-good dies and allocate them to each variant, reliability and evaluation', 0.5, 1],
        [4, 'Release the wafer maps and the known-good-die list', 0.5],
      ],
      o: [
        'Verified probe contact on the first wafer',
        'Sort results for every wafer',
        'Known-good-die selection and allocation',
        'Wafer sort maps and known-good-die list',
      ],
      r: [['UFAB-D2', 'produces'], ['UFAB-D3', 'feeds']],
    },
    'UFAB-03': {
      s: [
        [1, 'Kit known-good dies and partner dies with substrates, bridges and interposers per variant', 0.5],
        [2, 'Assemble the bridge, interposer, reversed-orientation and partner-die test vehicles with the assembly partner', 3],
        [3, 'Inspect the assemblies with X-ray and acoustic microscopy', 1, 1],
        [4, 'Screen every unit on the package final test program at time zero', 1.5],
        [5, 'Release the assembled test vehicles with their travelers and final test results', 0.5],
      ],
      o: [
        'Kitted dies and package material per variant',
        'Assembled test vehicles for every variant',
        'Assembly inspection records',
        'Time-zero package final test results per unit',
        'Assembled test vehicles for every variant with travelers, inspection records and package final test results',
      ],
      r: [['UFAB-D3', 'produces'], ['UFAB-D4', 'feeds']],
    },
    'UFAB-04': {
      s: [
        [1, 'Mount the test vehicles on the evaluation boards', 0.5],
        [2, 'Inspect the joints and check supplies for shorts without powering the PHY', 0.5],
        [3, 'Run a low-voltage continuity check on every supply domain', 0.5],
        [4, 'Release the boards with their unit serials', 0.5],
      ],
      o: [
        'Test vehicles mounted on boards',
        'Joint inspection and short check results',
        'Low-voltage continuity check results',
        'Evaluation boards with mounted units released',
      ],
      r: [['UFAB-D4', 'produces'], ['UFAB-D5', 'feeds']],
    },
    'UFAB-05': {
      s: [
        [1, 'Receive boards and units into the lab with their travelers', 0.5],
        [2, 'Check unit records against the configuration baseline and the split map', 0.5],
        [3, 'Allocate units to bring-up, characterization, compliance and reliability', 0.5],
        [4, 'Record silicon in hand and hand the first units to bring-up', 0.5],
      ],
      o: [
        'Received boards and units with travelers',
        'Unit records checked against the baseline',
        'Unit allocation by use',
        'First samples receipt and lab allocation record',
      ],
      r: [['UFAB-D5', 'produces']],
    },
  },
};
