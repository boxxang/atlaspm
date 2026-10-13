/**
 * UTEC — Process & Package Selection. Weeks 6–20; closes on Technology Selected.
 */
import type { UcieStageModule } from '../types';

export const UTEC: UcieStageModule = {
  content: {
    tagline: 'Pick the node, the metal stack and the package pitches the PHY will live on — before a single circuit is drawn.',
    description:
      'Choose the process node and metal stack the PHY is designed on, judge whether the PDK and its device models are mature enough to design 64 GT/s transmit, receive and clocking circuits against, and agree with the package partners which UCIe Advanced package technologies — silicon bridge, silicon interposer and RDL interposer — the macro supports and at what bump pitch within the Advanced package range. The partners’ design rules and assembly constraints are turned into constraints on the bump map and die edge, and a shuttle or dedicated run is reserved for the test chip at a date the signoff plan can meet, with the bridge and interposer tapeout slot for the test vehicle and a mask or slot option for a respin. An interoperability partner is secured now, while there is still time to mate its bump map with the test chip on a shared test vehicle. The stage closes when every choice is recorded with its open risks in a technology selection decision the architecture freeze can build on.',
    activities: [
      'Process and metal stack',
      'PDK and device models',
      'Package technology and bump pitch',
      'Package partner rules',
      'Shuttle and fab slots',
      'Technology selection review',
      'Interoperability partner',
    ],
    deliverables: [
      'Process node and metal stack selection memo',
      'PDK maturity assessment and device model readiness report for 64 GT/s circuits',
      'Package technology and bump pitch agreement — bridge, interposer and RDL options',
      'Package partner design rule set and assembly constraint summary',
      'Test chip shuttle and fab slot reservation plan',
      'Technology risk register and technology selection decision record',
      'Interoperability partner agreement with mated bump map requirements and known-good partner die supply',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [6, 8, 10, 12, 12, 14, 14],
    engineeringEffort: [4, 3, 4, 3, 1.5, 1.5, 2],
    risks: [
      'Device models on an early PDK under-predict parasitics, so circuits that close in simulation miss 64 GT/s on silicon',
      'A bump pitch agreed with one package partner does not route on another, narrowing the customers the IP can serve',
    ],
    potentialRisks: [
      'Metal stack chosen for the test chip differs from the stacks customers use, so the hard macro needs a re-layout per customer',
      'Aging and self-heating models missing at selection time, leaving reliability signoff on estimates',
      'Shuttle date fixed before the signoff plan is credible, forcing either a rushed signoff or a missed slot',
      'Package partner rules still at draft revision when the bump map concept is drawn',
      'RDL interposer support promised without loss data at 64 GT/s over the reach customers need',
      'Interoperability partner found only after silicon, when its die can no longer share the test vehicle',
    ],
    leader: { name: 'Priya Raman', short: 'P. Raman', phone: '+1 (408) 555-0611', email: 'priya.raman@example.com' },
    collaboration: ['Technology and foundry', 'Packaging', 'Analog and mixed-signal', 'SI/PI', 'Product management', 'Program management'],
    tools: ['PDK and device model release tracker', 'Circuit simulator with corner and Monte Carlo support', 'Package pathfinding and routing estimator', 'Risk register'],
    programView: [
      'Technology decisions closed against plan — node, stack, PDK, package and slot',
      'Open technology risks by severity',
      'PDK and model maturity level against the circuit design start',
      'Package types and bump pitches supported against the customer list',
    ],
    perspective:
      'A die-to-die PHY is sold on how it behaves on other people’s dies and packages. Every technology choice here narrows or widens the set of customers who can use it, so make them with the integration requirements open on the table, not only the test chip.',
  },
  steps: {
    'UTEC-01': {
      s: [
        [1, 'Short-list process nodes that meet the transmit, receive and clocking speed needs at 64 GT/s', 1.5],
        [2, 'Compare metal stacks for macro routing, the bump layer and the stacks customers named in the integration requirements', 1.5, 1],
        [3, 'Check device availability — thin and thick oxide, high-speed and low-leakage variants, and precision passives', 1],
        [4, 'Weigh the node and stack options against area, power, cost and customer adoption', 1.5],
        [5, 'Issue the process node and metal stack selection memo', 0.5],
      ],
      o: [
        'Short-list of candidate process nodes',
        'Metal stack comparison against customer stacks',
        'Device and passive availability check',
        'Weighted node and stack comparison',
        'Process node and metal stack selection memo',
      ],
      r: [['UTEC-D1', 'produces'], ['UTEC-D6', 'feeds']],
    },
    'UTEC-02': {
      s: [
        [1, 'Review the PDK release level, model maturity and the planned model updates', 1],
        [2, 'Check device models for high-frequency accuracy — capacitance, gate resistance and corner coverage', 2],
        [3, 'Check aging, self-heating and electromigration models needed for reliability signoff', 1.5, 1],
        [4, 'Run reference circuits — a ring oscillator, an inverter chain and a sampler — across corners to expose model gaps', 1.5],
        [5, 'Release the PDK maturity and model readiness report with each gap and its owner', 0.5],
      ],
      o: [
        'PDK release level and model update schedule',
        'High-frequency device model accuracy check',
        'Reliability model coverage check',
        'Reference circuit results across corners',
        'PDK maturity and device model readiness report',
      ],
      r: [['UTEC-D2', 'produces'], ['UTEC-D6', 'feeds']],
    },
    'UTEC-03': {
      s: [
        [1, 'Map the package types customers will use — silicon bridge, silicon interposer and RDL interposer — to their bump pitch and routing density', 2],
        [2, 'Estimate shoreline bandwidth for each package type at candidate pitches within the Advanced package range', 1.5],
        [3, 'Agree the bump pitch range the macro supports and the reference pitch for the test vehicle', 2],
        [4, 'Check microbump, underfill and assembly yield data for each pitch with the package partners', 1.5, 1],
        [5, 'Release the package technology and bump pitch agreement', 1],
      ],
      o: [
        'Package type to bump pitch and routing density map',
        'Shoreline bandwidth estimate per package type',
        'Supported bump pitch range and reference pitch',
        'Microbump and assembly yield data per pitch',
        'Package technology and bump pitch agreement',
      ],
      r: [['UTEC-D3', 'produces'], ['UTEC-D6', 'feeds']],
    },
    'UTEC-04': {
      s: [
        [1, 'Collect each package partner’s design rules for line width, spacing, layer count and via structures, and the stack-ups with dielectric and metal material properties per layer', 2],
        [2, 'Collect assembly constraints — die thickness, keep-outs, underfill flow and warpage limits', 1.5, 1],
        [3, 'Translate the rules into constraints on the macro bump map and the die edge', 2],
        [4, 'Review the constraints with the channel and layout teams and log open questions with the partners', 1.5],
        [5, 'Release the package partner design rule set and assembly constraint summary', 1],
      ],
      o: [
        'Package partner design rule collection',
        'Assembly constraint list per partner',
        'Bump map and die edge constraints',
        'Reviewed constraints with open partner questions',
        'Package partner design rule set and assembly constraint summary',
      ],
      r: [['UTEC-D4', 'produces'], ['UTEC-D6', 'feeds']],
    },
    'UTEC-05': {
      s: [
        [1, 'Survey shuttle and dedicated-run options on the selected node with their tapeout dates', 1.5],
        [2, 'Size the test chip area and die count for the two-die test vehicle, loopback parts and reliability lots', 1.5],
        [3, 'Align the tapeout date with planned hard macro signoff and reserve a slot with a fallback', 1.5],
        [4, 'Book the bridge and interposer tapeout slot for the test vehicle, and a mask and slot option for a metal fix or respin', 1],
        [5, 'Release the shuttle and fab slot reservation plan', 0.5],
      ],
      o: [
        'Shuttle and dedicated-run option list',
        'Test chip area and die count estimate',
        'Reserved slot and fallback date',
        'Bridge and interposer slot and respin option',
        'Test chip shuttle and fab slot reservation plan',
      ],
      r: [['UTEC-D5', 'produces'], ['UTEC-D6', 'feeds']],
    },
    'UTEC-06': {
      s: [
        [1, 'Consolidate the process, PDK, package and fab slot findings into one technology risk register', 1.5],
        [2, 'Score each risk for likelihood and its impact on circuit performance, schedule and customer adoption', 1],
        [3, 'Hold the technology selection review and record the decision with its open risks', 1],
        [4, 'Release the technology selection decision record', 0.5],
      ],
      o: [
        'Consolidated technology risk register',
        'Scored risks with owners',
        'Technology selection review minutes',
        'Technology risk register and technology selection decision record',
      ],
      r: [['UTEC-D6', 'produces']],
    },
    'UTEC-07': {
      s: [
        [1, 'Shortlist partner dies or a reference die with a UCIe Advanced interface that can sit on the same bridge or interposer as the test chip', 1],
        [2, 'Agree the exchange — silicon, bump map, sideband settings and test access — under an interoperability agreement', 1.5],
        [3, 'Mate the bump maps and module orientation of the two dies for a shared test vehicle', 1.5, 1],
        [4, 'Agree known-good die supply and delivery dates for the partner die ahead of test vehicle assembly', 1],
        [5, 'Release the interoperability partner agreement and mated bump map requirements', 1],
      ],
      o: [
        'Partner and reference die shortlist',
        'Signed interoperability exchange terms',
        'Mated bump map and orientation requirements',
        'Partner known-good die supply plan',
        'Interoperability partner agreement with mated bump map requirements and known-good partner die supply',
      ],
      r: [['UTEC-D7', 'produces'], ['UTEC-D6', 'feeds']],
    },
  },
};
