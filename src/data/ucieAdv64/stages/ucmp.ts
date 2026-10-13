/**
 * UCMP — Compliance & Interoperability. Weeks 108–124; closes on Compliance
 * Pass.
 */
import type { UcieStageModule } from '../types';

export const UCMP: UcieStageModule = {
  content: {
    tagline: 'Pass the specification’s own tests at 64 GT/s, then train and carry traffic with someone else’s UCIe die.',
    description:
      'Prove the IP against the standard rather than against itself. Compliance testing covers the electrical requirements the specification sets for an Advanced package module at 64 GT/s and the link training and protocol behavior — sideband messages, the training state sequence, lane repair and reversal handshakes, error handling and retrain — using the compliance scenarios already run in pre-silicon verification as the starting set. Interoperability takes the test chip to a link with another party’s UCIe die on a shared test vehicle and shows the two train from either side, carry Flit and Raw traffic and recover from errors together. The stage closes on a compliance results review that records what passed, what was waived and why — the evidence a licensee asks for before choosing the IP.',
    activities: ['Plan and setup', 'Electrical compliance', 'Training and protocol compliance', 'Interoperability', 'Results review'],
    deliverables: [
      'Compliance test plan and test setup record',
      'Electrical compliance test results at 64 GT/s',
      'Link training and protocol compliance test results',
      'Interoperability test report with partner dies',
      'Compliance results summary and compliance pass record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [3, 10, 11, 14, 16],
    engineeringEffort: [2, 6, 6, 8, 1.5],
    risks: [
      'No partner die is available on a compatible advanced package in time, so interoperability is shown only between two copies of the same IP',
      'A compliance failure found this late needs a silicon change that cannot reach the GA release',
    ],
    potentialRisks: [
      'Compliance tests run on the most favorable units only, so a marginal unit’s failure is never seen',
      'Electrical compliance measured through the test vehicle’s fixture without de-embedding, failing good silicon',
      'Training compliance checked only from one die as initiator',
      'Waivers granted without recording which requirement they cover and why',
      'Pre-silicon compliance scenarios not reused, so silicon testing starts from an incomplete list',
    ],
    leader: { name: 'Leonie Tanaka', short: 'L. Tanaka', phone: '+1 (408) 555-0663', email: 'leonie.tanaka@example.com' },
    collaboration: ['Compliance and interoperability', 'Validation', 'RTL design', 'Analog and mixed-signal', 'Packaging', 'Customer engineering'],
    tools: ['Compliance test scripts mapped to specification requirements', 'Sideband and training protocol capture', 'Lab automation for electrical compliance sweeps', 'Requirement-to-result tracking'],
    programView: [
      'Compliance requirements tested, passed and waived',
      'Interoperability partners linked and traffic hours run',
      'Open compliance failures and their path to closure',
    ],
    perspective:
      'Licensees buy a die-to-die PHY to connect to dies they do not control. A compliance pass against the specification is necessary, but a link with another party’s die is what convinces them — plan the partner and the shared test vehicle at the start of the program, not when silicon arrives.',
  },
  steps: {
    'UCMP-01': {
      s: [
        [1, 'Map every compliance requirement for an Advanced module at 64 GT/s to a test and pass criterion', 1],
        [2, 'Carry over the compliance scenarios run in pre-silicon verification as the protocol test set', 0.5],
        [3, 'Arrange partner dies and the shared test vehicle for interoperability', 1, 1],
        [4, 'Prove the test setup on a known-good unit and release the plan', 1],
      ],
      o: [
        'Compliance requirement-to-test mapping',
        'Protocol test set carried over from pre-silicon scenarios',
        'Partner die and shared test vehicle arrangement',
        'Compliance test plan and test setup record',
      ],
      r: [['UCMP-D1', 'produces'], ['UCMP-D5', 'feeds']],
    },
    'UCMP-02': {
      s: [
        [1, 'Measure transmitter electrical parameters per lane against the compliance limits', 2.5],
        [2, 'Measure receiver tolerance with stressed signals through the loopback modes', 2.5],
        [3, 'De-embed fixture contributions and re-check lanes near the limits', 1, 1],
        [4, 'Repeat on the worst-case units from characterization', 1.5],
        [5, 'Release the electrical compliance results', 1],
      ],
      o: [
        'Transmitter parameters per lane against limits',
        'Receiver tolerance results through loopback',
        'De-embedded results for lanes near limits',
        'Worst-case unit results',
        'Electrical compliance test results at 64 GT/s',
      ],
      r: [['UCMP-D2', 'produces'], ['UCMP-D5', 'feeds']],
    },
    'UCMP-03': {
      s: [
        [1, 'Run sideband message and register access compliance tests from both dies', 1.5],
        [2, 'Run the training state sequence tests through SBINIT, MBINIT, MBTRAIN and LINKINIT', 2],
        [3, 'Test lane repair and reversal handshakes and error and retrain behavior', 2, 1],
        [4, 'Test low-power entry and exit and Raw and Flit mode negotiation', 1.5],
        [5, 'Release the training and protocol compliance results', 1],
      ],
      o: [
        'Sideband and register access compliance results',
        'Training state sequence compliance results',
        'Repair, reversal, error and retrain behavior results',
        'Low-power and mode negotiation results',
        'Link training and protocol compliance test results',
      ],
      r: [['UCMP-D3', 'produces'], ['UCMP-D5', 'feeds']],
    },
    'UCMP-04': {
      s: [
        [1, 'Bring up the link with each partner die from either side as initiator', 2],
        [2, 'Run Flit and Raw mode traffic across the partner link and count errors and retries', 3],
        [3, 'Inject errors and force retrains and confirm both dies recover', 2, 1],
        [4, 'Exercise low-power entry and exit across the partner link', 1.5],
        [5, 'Release the interoperability report', 1.5],
      ],
      o: [
        'Partner link bring-up from either initiator',
        'Partner link traffic results with errors and retries',
        'Joint error and retrain recovery results',
        'Partner link low-power results',
        'Interoperability test report with partner dies',
      ],
      r: [['UCMP-D4', 'produces'], ['UCMP-D5', 'feeds']],
    },
    'UCMP-05': {
      s: [
        [1, 'Collect compliance and interoperability results against the requirement mapping', 1],
        [2, 'Review failures and waivers with design and customer engineering', 1],
        [3, 'Record the compliance pass decision and release the summary', 1],
      ],
      o: [
        'Results collected against requirements',
        'Failure and waiver review record',
        'Compliance results summary and compliance pass record',
      ],
      r: [['UCMP-D5', 'produces']],
    },
  },
};
