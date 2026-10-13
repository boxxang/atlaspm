/**
 * UCMP — Compliance & Interop Proof. Weeks 110–126; closes on Compliance
 * Pass.
 */
import type { UcieStageModule } from '../types';

export const UCMP: UcieStageModule = {
  content: {
    tagline: 'Pass the specification’s own tests against a reference die at 64 GT/s, then train and carry traffic with a partner’s UCIe die.',
    description:
      'Prove the IP against the standard rather than against itself. On an Advanced package the die-to-die bumps never reach a pin, so compliance is not probed: the device under test is linked to a known-good reference die over a known-good bridge or interposer, and compliance software drives the tests over the sideband using the dies’ own margining, BER counters and lane-to-lane skew measurement, and checks transmitter equalization. The protocol side — sideband messages, the training state sequence, lane repair and reversal handshakes, error handling and retrain, low-power states and Flit format and protocol negotiation — is exercised through the compliance control registers the RTL carries for this: test and NOP Flit injection, link-state request injection and retry injection. Interoperability uses the partner die secured at technology selection and built into the shared test vehicle, and shows the two dies train from either side, carry traffic and recover from errors together. The stage closes on a compliance results review that records what passed, what was waived and why — the evidence a licensee asks for before choosing the IP.',
    activities: ['Plan and setup', 'Electrical compliance', 'Training and protocol compliance', 'Interoperability', 'Results review'],
    deliverables: [
      'Compliance test plan and reference-die test setup record',
      'Electrical compliance test results at 64 GT/s against the reference die',
      'Link training and protocol compliance test results',
      'Interoperability test report with the partner die',
      'Compliance results summary and compliance pass record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [3, 10, 11, 14, 16],
    engineeringEffort: [2, 6, 6, 8, 1.5],
    risks: [
      'The reference die or the partner die arrives late or on a package variant that does not mate, so compliance and interoperability are shown only between two copies of the same IP',
      'A compliance failure found this late needs a silicon change, and the respin decision taken at first link-up did not allow for it',
    ],
    potentialRisks: [
      'Compliance tests run on the most favorable units only, so a marginal unit’s failure is never seen',
      'On-die margining read without the calibration done in characterization, so compliance margins are quoted in uncalibrated steps',
      'Compliance control registers incomplete in silicon, so some protocol tests cannot be driven and are waived by default',
      'Training compliance checked only from one die as initiator',
      'Waivers granted without recording which requirement they cover and why',
      'Pre-silicon compliance scenarios not reused, so silicon testing starts from an incomplete list',
    ],
    leader: { name: 'Leonie Tanaka', short: 'L. Tanaka', phone: '+1 (408) 555-0663', email: 'leonie.tanaka@example.com' },
    collaboration: ['Compliance and interoperability', 'Validation', 'RTL design', 'DFT', 'Analog and mixed-signal', 'Packaging', 'Customer engineering'],
    tools: ['Compliance software driving the dies over the sideband', 'Sideband and training protocol capture', 'Lab automation for margining and BER sweeps', 'Requirement-to-result tracking'],
    programView: [
      'Compliance requirements tested, passed and waived',
      'Reference-die and partner-die links trained and traffic hours run',
      'Open compliance failures and their path to closure',
    ],
    perspective:
      'Licensees buy a die-to-die PHY to connect to dies they do not control. A compliance pass against a reference die is necessary, but a link with another party’s die is what convinces them — and on an advanced package that partner has to be on the test vehicle from its design, not invited when silicon arrives.',
  },
  steps: {
    'UCMP-01': {
      s: [
        [1, 'Map every compliance requirement for an Advanced module at 64 GT/s to a test, the register controls it drives and a pass criterion', 1],
        [2, 'Carry over the compliance scenarios run in pre-silicon verification as the protocol test set', 0.5],
        [3, 'Confirm the reference die and partner die units secured at technology selection and their sites on the test vehicle variants', 0.5, 1],
        [4, 'Prove the sideband-driven test setup on a known-good unit linked to the reference die and release the plan', 1],
      ],
      o: [
        'Compliance requirement-to-test mapping with register controls',
        'Protocol test set carried over from pre-silicon scenarios',
        'Reference and partner die units confirmed on the test vehicle',
        'Compliance test plan and reference-die test setup record',
      ],
      r: [['UCMP-D1', 'produces'], ['UCMP-D5', 'feeds']],
    },
    'UCMP-02': {
      s: [
        [1, 'Link the device under test to the reference die over a known-good bridge or interposer and confirm the sideband control path', 1],
        [2, 'Measure per-lane voltage and timing margin with the on-die margining, driven over the sideband by the compliance software', 2],
        [3, 'Measure per-lane BER and lane-to-lane skew at 64 GT/s against the compliance limits', 2, 1],
        [4, 'Check the transmitter equalization settings and their effect on the margin the reference die receives', 1.5],
        [5, 'Repeat on the worst-case units from characterization and on each package variant', 1.5],
        [6, 'Release the electrical compliance results', 0.5],
      ],
      o: [
        'Device under test linked to the reference die with sideband control',
        'Per-lane margins driven over the sideband',
        'Per-lane BER and lane-to-lane skew against limits',
        'Transmitter equalization check against received margin',
        'Worst-case unit and package variant results',
        'Electrical compliance test results at 64 GT/s against the reference die',
      ],
      r: [['UCMP-D2', 'produces'], ['UCMP-D5', 'feeds']],
    },
    'UCMP-03': {
      s: [
        [1, 'Run sideband message and register access compliance tests from both dies', 1.5],
        [2, 'Run the training state sequence tests through SBINIT, MBINIT, MBTRAIN and LINKINIT against the reference die', 2],
        [3, 'Inject test and NOP Flits, link-state requests and retries through the compliance control registers and check each response', 2, 1],
        [4, 'Test lane repair and reversal handshakes, error and retrain behavior, low-power entry and exit and Flit format and protocol negotiation', 2],
        [5, 'Release the training and protocol compliance results', 1],
      ],
      o: [
        'Sideband and register access compliance results',
        'Training state sequence compliance results',
        'Injected Flit, link-state and retry responses',
        'Repair, reversal, retrain, low-power and negotiation results',
        'Link training and protocol compliance test results',
      ],
      r: [['UCMP-D3', 'produces'], ['UCMP-D5', 'feeds']],
    },
    'UCMP-04': {
      s: [
        [1, 'Bring up the link with the partner die on the shared test vehicle from either side as initiator', 2],
        [2, 'Run Flit format and Raw format traffic across the partner link and count errors and retries', 3],
        [3, 'Inject errors and force retrains and confirm both dies recover', 2, 1],
        [4, 'Exercise low-power entry and exit across the partner link', 1.5],
        [5, 'Release the interoperability report', 1.5],
      ],
      o: [
        'Partner link bring-up from either initiator',
        'Partner link traffic results with errors and retries',
        'Joint error and retrain recovery results',
        'Partner link low-power results',
        'Interoperability test report with the partner die',
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
