/**
 * UREQ — IP Requirements. Weeks 4–14; closes on Requirements Baseline.
 */
import type { UcieStageModule } from '../types';

export const UREQ: UcieStageModule = {
  content: {
    tagline: 'Turn customer needs into numbers the PHY can be designed, verified and measured against.',
    description:
      'Fix what the IP must be before anyone draws it. The UCIe revision that defines 64 GT/s is chosen as the target, with the options the IP supports: the x64 Advanced module, how many modules a customer may stack, and Raw, Streaming and Flit modes at the FDI. The PPA targets — bandwidth per millimeter of shoreline, energy per bit, area and latency — are set against the competitive matrix; the package technologies and bump pitch range the IP must work on are agreed with packaging; customer integration constraints — metal stack, macro orientation, power domains and test access — are captured; and link reliability, sideband, manageability, low-power, electrical, compliance and interoperability targets are written as values with a verification method. The stage closes when every requirement traces to a customer need and to the activity that will prove it.',
    activities: [
      'Revision and features',
      'PPA targets',
      'Package and bump pitch',
      'Customer integration',
      'Link reliability',
      'Sideband and low power',
      'Compliance targets',
      'Electrical PHY',
      'Traceability and baseline',
    ],
    deliverables: [
      'Target UCIe revision and feature selection matrix — speed, module, mode and option support',
      'PPA target sheet — bandwidth density, energy per bit, area and latency',
      'Supported package technology and bump pitch matrix',
      'Customer integration requirements — metal stack, orientation, power domains and test access',
      'Link reliability targets — BER, CRC and retry, and lane repair coverage',
      'Sideband, manageability and low-power state requirements',
      'Compliance and interoperability target plan',
      'Electrical PHY requirements — supplies, clocking inputs, ESD and operating range',
      'Requirements traceability matrix and requirements baseline',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    deliverableWeek: [4, 6, 6, 7, 7, 8, 8, 7, 10],
    engineeringEffort: [3, 3, 2, 2, 2, 2, 2, 2, 2],
    risks: [
      'Requirements written as aspirations — "best-in-class energy per bit" — with no value the margin review or silicon can be held to',
      'Package and bump pitch range left wide open, so the bump map and channel cannot be designed for any one of them',
    ],
    potentialRisks: [
      'Every optional feature of the specification marked as required, inflating the logical PHY and its verification',
      'Customer integration constraints captured from one customer’s metal stack and not checked against the others',
      'Compliance targets assume a compliance program and test equipment that do not yet exist for 64 GT/s',
      'Electrical requirements copied from a lower-speed PHY without revisiting supply noise and ESD limits at 64 GT/s',
      'Requirements baseline released without a change control path, so customer requests reopen it silently',
    ],
    leader: { name: 'Tobias Lindqvist', short: 'T. Lindqvist', phone: '+1 (408) 555-0602', email: 'tobias.lindqvist@example.com' },
    collaboration: ['IP architecture', 'Product management', 'Analog and mixed-signal', 'Packaging', 'Customer engineering', 'Compliance and interoperability', 'Program management'],
    tools: ['Requirements management and traceability database', 'Specification document control system', 'PPA estimation spreadsheet model', 'Customer feedback tracker'],
    programView: [
      'Requirements with a numeric target and a verification method',
      'Requirements traced to a customer need',
      'Open requirement questions per customer',
      'Baseline release against plan',
    ],
    perspective:
      'A die-to-die PHY is measured by a few numbers customers compare and a long tail of features they assume. Make the few numbers exact and the long tail explicit — each optional feature either in, with a test, or out, with a reason — and the architecture has something firm to freeze against.',
  },
  steps: {
    'UREQ-01': {
      s: [
        [1, 'Choose the UCIe revision that defines 64 GT/s as the target and list the options it opens', 1],
        [2, 'Select the module configuration — x64 Advanced module and the number of modules a customer may stack', 1],
        [3, 'Decide FDI mode support — Flit modes, Streaming and Raw, including continuous transmission in Raw mode', 1, 1],
        [4, 'Decide the lower speeds the IP must also train at for fallback and interoperability', 1],
        [5, 'Release the revision and feature selection matrix', 1],
      ],
      o: [
        'Target revision with its option list',
        'Module configuration and stacking limits',
        'FDI mode support decision',
        'Supported speed list with fallback rules',
        'Target UCIe revision and feature selection matrix — speed, module, mode and option support',
      ],
      r: [['UREQ-D1', 'produces'], ['UREQ-D9', 'feeds']],
    },
    'UREQ-02': {
      s: [
        [1, 'Derive bandwidth per millimeter of shoreline from customer die edges and the module configuration', 1],
        [2, 'Set the energy-per-bit target at 64 GT/s with the conditions it is measured under', 1.5],
        [3, 'Set the area and shoreline targets per module including the sideband and redundant lanes', 1, 1],
        [4, 'Set the FDI-to-bump latency target in each mode', 1],
        [5, 'Release the PPA target sheet with targets against the competitive matrix', 1],
      ],
      o: [
        'Shoreline bandwidth density target',
        'Energy-per-bit target with measurement conditions',
        'Area and shoreline per module target',
        'Latency target per mode',
        'PPA target sheet — bandwidth density, energy per bit, area and latency',
      ],
      r: [['UREQ-D2', 'produces'], ['UREQ-D9', 'feeds']],
    },
    'UREQ-03': {
      s: [
        [1, 'List the advanced package technologies customers use — silicon bridge, silicon interposer and RDL interposer', 1],
        [2, 'Agree the bump pitch range the IP supports within the Advanced package range of roughly 25 to 55 micrometers', 1.5],
        [3, 'Record the channel reach each package type needs within the short Advanced package reach', 1, 1],
        [4, 'Release the package technology and bump pitch matrix', 1.5],
      ],
      o: [
        'Customer package technology list',
        'Supported bump pitch range',
        'Channel reach needs per package type',
        'Supported package technology and bump pitch matrix',
      ],
      r: [['UREQ-D3', 'produces'], ['UREQ-D9', 'feeds']],
    },
    'UREQ-04': {
      s: [
        [1, 'Collect customer metal stacks and the layers they allow a hard macro to use', 1],
        [2, 'Capture macro orientation, die-edge placement and stacking of modules on a die', 1],
        [3, 'Capture power domains, supply voltages and isolation the customer SoC provides', 1, 1],
        [4, 'Capture test access, scan and ATE interfaces the customer test flow expects', 1],
        [5, 'Release the customer integration requirements', 1],
      ],
      o: [
        'Customer metal stack and layer constraints',
        'Orientation and placement constraints',
        'Power domain and supply constraints',
        'Customer test access expectations',
        'Customer integration requirements — metal stack, orientation, power domains and test access',
      ],
      r: [['UREQ-D4', 'produces'], ['UREQ-D9', 'feeds']],
    },
    'UREQ-05': {
      s: [
        [1, 'Set the raw BER target the PHY must meet at 64 GT/s from the target revision', 1],
        [2, 'Set the post-CRC and retry error-rate goals and the retry latency budget at the FDI', 1.5],
        [3, 'Set lane repair coverage — which lanes are repairable and how many failed bumps a module tolerates', 1, 1],
        [4, 'Release the link reliability targets with a verification method for each', 1.5],
      ],
      o: [
        'Raw BER target at 64 GT/s',
        'Post-retry error goals and retry latency budget',
        'Lane repair coverage targets',
        'Link reliability targets — BER, CRC and retry, and lane repair coverage',
      ],
      r: [['UREQ-D5', 'produces'], ['UREQ-D9', 'feeds']],
    },
    'UREQ-06': {
      s: [
        [1, 'Define sideband requirements — register access, message types and the extended sideband reach the revision allows', 1],
        [2, 'Define manageability requirements — early firmware download and priority sideband packets', 1.5],
        [3, 'Define low-power state requirements — L1 and L2 entry and exit latency and residual power', 1, 1],
        [4, 'Define runtime recalibration requirements — how often, how long and with what traffic impact', 1],
        [5, 'Release the sideband, manageability and low-power requirements', 1],
      ],
      o: [
        'Sideband requirements',
        'Manageability requirements',
        'Low-power state requirements',
        'Runtime recalibration requirements',
        'Sideband, manageability and low-power state requirements',
      ],
      r: [['UREQ-D6', 'produces'], ['UREQ-D9', 'feeds']],
    },
    'UREQ-07': {
      s: [
        [1, 'Identify the compliance tests the target revision defines for the electrical and logical layers', 1.5],
        [2, 'Set interoperability targets — which other UCIe dies or test platforms the IP must link with', 1.5],
        [3, 'Check compliance test equipment and program availability for 64 GT/s', 1, 1],
        [4, 'Release the compliance and interoperability target plan', 1],
      ],
      o: [
        'Compliance test list by layer',
        'Interoperability partner targets',
        'Compliance equipment availability assessment',
        'Compliance and interoperability target plan',
      ],
      r: [['UREQ-D7', 'produces'], ['UREQ-D9', 'feeds']],
    },
    'UREQ-08': {
      s: [
        [1, 'Set supply voltages, tolerances and noise limits for the transmit, receive and clocking circuits', 1.5],
        [2, 'Set clocking inputs — reference clock, frequency plan and jitter allowed at the PHY', 1],
        [3, 'Set ESD and latch-up targets for fine-pitch bumps and their handling in assembly', 1, 1],
        [4, 'Set the temperature and voltage operating range and the corners signoff must cover', 1],
        [5, 'Release the electrical PHY requirements', 1],
      ],
      o: [
        'Supply and noise requirements',
        'Clocking input requirements',
        'ESD and latch-up targets',
        'Operating range and signoff corners',
        'Electrical PHY requirements — supplies, clocking inputs, ESD and operating range',
      ],
      r: [['UREQ-D8', 'produces'], ['UREQ-D9', 'feeds']],
    },
    'UREQ-09': {
      s: [
        [1, 'Trace every requirement to a customer need and to the activity and test that will prove it', 1],
        [2, 'Resolve conflicts between PPA, feature and integration requirements with product management', 1],
        [3, 'Hold the requirements baseline review and place the baseline under change control', 1],
      ],
      o: [
        'Traceability matrix with verification owners',
        'Resolved requirement conflict log',
        'Requirements traceability matrix and requirements baseline',
      ],
      r: [['UREQ-D9', 'produces']],
    },
  },
};
