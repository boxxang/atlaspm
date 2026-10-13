/**
 * UCHN — Channel Specification & Bump Map Co-Design. Weeks 16–70; closes on Channel Spec Met.
 */
import type { UcieStageModule } from '../types';

export const UCHN: UcieStageModule = {
  content: {
    tagline: 'Specify the channel the PHY promises to work over, freeze the bump map early, and prove both on real package routes.',
    description:
      'Define the package channel the PHY is specified against — voltage transfer function loss and crosstalk judged against an eye mask, as the specification states short die-to-die channels, plus skew — for silicon bridge, silicon interposer and RDL interposer routes at the agreed bump pitch and the short Advanced package reach — and derive the bump and routing rules that meet it. The bump map and channel specification are frozen early, under change control, because the electrical PHY layout and the test chip top level are drawn to them. Reference channel layouts are drawn for each package type, then extracted and simulated at 64 GT/s with the specification’s reference transmitter and receiver loads, the power delivery network is sized against the noise of all lanes switching together, customer channel guidelines, a reference package design and a channel compliance kit — behavioral transmitter and receiver models with the transfer-function flow and the eye mask — are written so licensees can sign off their own channels, and the measurement plan that will correlate the test vehicle’s channels with their models is prepared. The stage closes when the reference and test vehicle channels are shown to meet the specification and the final macro’s post-layout pad loading stays within the loads it assumes.',
    activities: [
      'Channel specification',
      'Bump and routing rules',
      'Bump map and channel freeze',
      'Channel extraction and SI',
      'PDN and PI',
      'Customer channel guidelines',
      'Test vehicle correlation plan',
      'Channel specification review',
    ],
    deliverables: [
      'Channel specification — voltage transfer function loss, crosstalk, reach and eye mask per package type',
      'Bump and routing design rules for bridge, interposer and RDL packages',
      'Frozen bump map and channel specification under change control',
      'Package channel extraction and SI simulation report',
      'Power delivery network and PI analysis report',
      'Customer channel guidelines, reference package design and channel compliance kit',
      'Test vehicle channel correlation plan',
      'Channel specification compliance record',
      'Reference channel layouts for bridge, silicon interposer and RDL interposer packages',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7, 1],
    deliverableWeek: [10, 16, 20, 36, 38, 48, 50, 54, 16],
    engineeringEffort: [5, 6, 2, 10, 8, 6, 3, 1],
    risks: [
      'Crosstalk between densely routed lanes, not loss, limits 64 GT/s on fine-pitch routes, and a specification that bounds loss alone would pass channels that fail the eye mask',
      'The bump map changes after the freeze and both the electrical PHY layout and the test chip top level are redrawn',
    ],
    potentialRisks: [
      'Return path and ground bump ratio set for density, leaving too little shielding at 64 GT/s',
      'Supply noise from all lanes switching together adds jitter the timing budget did not allow for',
      'RDL interposer routes modeled with idealized dielectric loss and found worse when measured',
      'Customer guidelines written for the test vehicle stack-up only, not the packages customers will build',
      'No de-embedding structures on the test vehicle, so measured channels cannot be compared with their models',
    ],
    leader: { name: 'Mei-Ling Cho', short: 'M. Cho', phone: '+1 (408) 555-0613', email: 'mei-ling.cho@example.com' },
    collaboration: ['SI/PI', 'Packaging', 'Analog and mixed-signal', 'Analog layout', 'Test chip integration', 'Customer engineering', 'Validation'],
    tools: ['Three-dimensional electromagnetic field solver', 'Channel and link simulator with behavioral transmitter and receiver models', 'Power delivery network analysis tool', 'Package routing and bump planning tool'],
    programView: [
      'Channel margin at 64 GT/s per package type against the specification',
      'Bump map changes after freeze',
      'Supply noise against budget on the transmitter, receiver and clocking supplies',
      'Customer guideline and reference design status',
    ],
    perspective:
      'A die-to-die PHY is only as good as the worst channel a customer will build for it. The channel specification is the contract between the IP and every package it will ever sit on, so write it as numbers a customer can check, and freeze the bump map before anyone draws to it.',
  },
  steps: {
    'UCHN-01': {
      s: [
        [1, 'Define the channel parameters the PHY is specified against — voltage transfer function loss and crosstalk with the driver and receiver loads, and skew', 2],
        [2, 'Model representative channels on silicon bridge, silicon interposer and RDL interposer at the reference bump pitch', 3],
        [3, 'Set transfer-function loss and crosstalk limits and the eye mask at 64 GT/s that leave the transmitter and receiver budgets their margin', 2],
        [4, 'Agree the reach the IP supports for each package type with architecture and product management', 1.5],
        [5, 'Release the channel specification', 0.5],
      ],
      o: [
        'Channel parameter definitions in transfer-function terms',
        'Representative channel models per package type',
        'Transfer-function loss and crosstalk limits and eye mask at 64 GT/s',
        'Supported reach per package type',
        'Channel specification',
      ],
      r: [['UCHN-D1', 'produces'], ['UCHN-D3', 'feeds']],
    },
    'UCHN-02': {
      s: [
        [1, 'Derive routing rules — layer use, width, spacing and shielding — for each package type from the channel limits', 3],
        [2, 'Define bump rules — signal-to-ground ratio, return path and power bump placement — for the module', 3],
        [3, 'Check the rules against each package partner’s design rules and assembly constraints', 2, 1],
        [4, 'Draw reference channel layouts on the bridge, the silicon interposer and the RDL interposer — a representative lane group at the longest supported reach, with its shielding — as extractable databases, and confirm they meet the channel specification', 3],
        [5, 'Release the bump and routing design rules', 1],
      ],
      o: [
        'Routing rules per package type',
        'Bump rules for signal, ground and power',
        'Rule check against package partner rules',
        'Reference channel layouts per package type meeting the channel specification',
        'Bump and routing design rules',
      ],
      r: [['UCHN-D2', 'produces'], ['UCHN-D9', 'produces'], ['UCHN-D3', 'feeds']],
    },
    'UCHN-03': {
      s: [
        [1, 'Reconcile the bump map concept with the routing rules, the macro floorplan, the redundant lanes for repair and the interoperability partner’s mated bump map', 1.5],
        [2, 'Close open items with the layout, test chip and package teams', 1],
        [3, 'Hold the bump map and channel specification freeze review', 1],
        [4, 'Release the frozen bump map and channel specification under change control', 0.5],
      ],
      o: [
        'Reconciled bump map',
        'Closed open items',
        'Freeze review minutes',
        'Frozen bump map and channel specification under change control',
      ],
      r: [['UCHN-D3', 'produces']],
    },
    'UCHN-04': {
      s: [
        [1, 'Extract the reference channel layouts of each package type as multi-port network models', 4],
        [2, 'Compute transfer-function loss and crosstalk with the specification’s reference transmitter and receiver loads and check the eye against the mask at 64 GT/s', 6],
        [3, 'Sweep reach, routing layer and pitch to find where the channel limits bind', 4, 1],
        [4, 'Hand channel models to link margin simulation and to the release channel models', 2],
        [5, 'Rerun with the bump field of the macro floorplan and update the margins', 5],
        [6, 'Release the channel extraction and SI simulation report', 1],
      ],
      o: [
        'Extracted multi-port channel models',
        'Eye and crosstalk results at 64 GT/s',
        'Reach, layer and pitch sensitivity sweep',
        'Channel models handed to link margin and release',
        'Margins on the macro floorplan’s bump field',
        'Package channel extraction and SI simulation report',
      ],
      r: [['UCHN-D4', 'produces'], ['UCHN-D8', 'feeds']],
    },
    'UCHN-05': {
      s: [
        [1, 'Define supply domains and target impedance for the transmitter, receiver and clocking supplies', 3],
        [2, 'Model the package and die power delivery network from the partners’ plane and decoupling options and a die grid estimate, with bump, decoupling and plane parasitics', 5],
        [3, 'Simulate supply noise from all lanes switching together and its effect on jitter', 5],
        [4, 'Size on-die and package decoupling and update the power bump allocation', 3, 1],
        [5, 'Release the PDN and PI analysis report', 1],
      ],
      o: [
        'Supply domains and target impedance',
        'Package and die power delivery network model',
        'Supply noise and jitter impact results',
        'Decoupling sizing and power bump allocation',
        'Power delivery network and PI analysis report',
      ],
      r: [['UCHN-D5', 'produces'], ['UCHN-D8', 'feeds']],
    },
    'UCHN-06': {
      s: [
        [1, 'Write channel guidelines for each package type — routing, layer use, shielding and reach', 5],
        [2, 'Build a reference package design for the macro from the reference channel layouts, with its channel models', 6],
        [3, 'Package the channel compliance kit — behavioral transmitter and receiver models, the transfer-function flow, the eye mask and a checking script', 3, 1],
        [4, 'Add power delivery guidelines and decoupling recommendations', 2, 1],
        [5, 'Review the guidelines and the kit with early-access customers and package partners', 3],
        [6, 'Release the customer channel guidelines, reference design and channel compliance kit', 1],
      ],
      o: [
        'Channel guidelines per package type',
        'Reference package design with channel models',
        'Channel compliance kit',
        'Power delivery guidelines',
        'Customer and partner review comments resolved',
        'Customer channel guidelines, reference package design and channel compliance kit',
      ],
      r: [['UCHN-D6', 'produces'], ['UPRE-D5', 'feeds']],
    },
    'UCHN-07': {
      s: [
        [1, 'Define which test vehicle channels are measured and how — loss, crosstalk and eye on each lane', 3],
        [2, 'Specify the on-package, bridge, interposer and on-board measurement and de-embedding structures and hand them to the test vehicle package, bridge and interposer, and board designs', 3, 1],
        [3, 'Plan de-embedding of probe, board and fixture effects', 3, 1],
        [4, 'Define the correlation criteria between measured and simulated channels', 2],
        [5, 'Release the test vehicle channel correlation plan', 1],
      ],
      o: [
        'Channel measurement list and methods',
        'Measurement structure specification',
        'De-embedding plan',
        'Correlation criteria',
        'Test vehicle channel correlation plan',
      ],
      r: [['UCHN-D7', 'produces']],
    },
    'UCHN-08': {
      s: [
        [1, 'Recheck the reference and test vehicle channels against the channel specification, confirm the final macro’s post-layout pad loading stays within the loads the specification assumes, and check the post-layout supply droop', 1.5],
        [2, 'Review margins, waivers and open items with the PHY and package teams', 1],
        [3, 'Record the channel specification compliance decision', 1],
      ],
      o: [
        'Final channel and pad loading check against the specification',
        'Reviewed margins and waivers',
        'Channel specification compliance record',
      ],
      r: [['UCHN-D8', 'produces']],
    },
  },
};
