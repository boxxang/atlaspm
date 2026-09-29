/**
 * CON — Concept & Product Planning. Weeks 0–10; closes on Program Go / No-Go.
 */
import type { CpoStageModule } from '../types';

export const CON: CpoStageModule = {
  content: {
    tagline: 'Decide what the switch is for before anyone decides how to build it.',
    description:
      'Turn market pull into a product concept a company can commit to: which customers and network tiers the switch serves, the aggregate bandwidth and port configuration it offers, the power per bit and cost that make co-packaged optics worth the integration risk over pluggable modules, and the program — schedule, people, partners and money — needed to deliver it. The stage closes on a go / no-go decision taken against a written business case and an explicit risk register.',
    activities: ['Market needs', 'Landscape', 'Product concept', 'Business case', 'Program plan', 'Go / No-Go'],
    deliverables: [
      'Market requirements document',
      'Competitive and technology landscape assessment',
      'Product concept brief — bandwidth, ports, power per bit, form factor',
      'Business case and cost-of-goods model',
      'Program plan — schedule, resources, budget and partners',
      'Program go / no-go decision package',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [4, 4, 7, 8, 9, 10],
    engineeringEffort: [3, 2, 4, 3, 3, 1.5],
    risks: ['Concept chosen before the optics trade-off is understood', 'Business case built on an unvalidated power per bit'],
    potentialRisks: [
      'Customer requirements gathered from one lead account and generalized to a market',
      'Co-packaged optics chosen for novelty rather than a measured system-level advantage',
      'Cost model missing the optical source, fiber assembly and calibration test time',
      'Program plan that assumes every external supplier is ready when silicon is',
      'Go decision taken with the top technical risks unowned',
    ],
    leader: { name: 'Elena Marsh', short: 'E. Marsh', phone: '+1 (408) 555-0501', email: 'elena.marsh@example.com' },
    collaboration: ['Product management', 'System architecture', 'Finance', 'Program management', 'Supply chain'],
    tools: ['Market model', 'Cost-of-goods model', 'Program schedule', 'Risk register'],
    programView: ['Go / No-Go date', 'Target bandwidth and power per bit', 'Program budget', 'Top program risks'],
    perspective:
      'A co-packaged optics switch carries more integration risk than any single chip in it. Write down the system-level advantage the program is betting on — power per bit, density, cost — in numbers, so every later gate can check the bet is still paying.',
  },
  steps: {
    'CON-01': {
      s: [
        [1, 'Identify target customer segments and network tiers', 1],
        [2, 'Interview lead customers on bandwidth, radix, power and serviceability needs', 1.5, 1],
        [3, 'Consolidate needs into ranked market requirements', 1],
        [4, 'Release the market requirements document', 0.5],
      ],
      o: [
        'Target segment and network tier list',
        'Customer interview record',
        'Ranked market requirements',
        'Market requirements document',
      ],
      r: [['CON-D1', 'produces'], ['CON-D3', 'feeds']],
    },
    'CON-02': {
      s: [
        [1, 'Survey switching silicon, optical interconnect and packaging technology trends', 1],
        [2, 'Compare co-packaged, near-packaged and pluggable optics at system level', 1.5, 1],
        [3, 'Map ecosystem and supplier maturity for each optical and packaging option', 1],
        [4, 'Publish the landscape assessment with its technology bets', 0.5],
      ],
      o: [
        'Technology trend survey',
        'Optics architecture comparison at system level',
        'Ecosystem and supplier maturity map',
        'Competitive and technology landscape assessment',
      ],
      r: [['CON-D2', 'produces'], ['CON-D3', 'feeds']],
    },
    'CON-03': {
      s: [
        [1, 'Frame candidate bandwidth, radix and port configurations', 1],
        [2, 'Estimate power per bit and density for each candidate against pluggable optics', 1.5],
        [3, 'Define form factor, cooling envelope and serviceability assumptions', 1, 1],
        [4, 'Select the product concept and record what it was chosen over', 1],
        [5, 'Release the product concept brief', 0.5],
      ],
      o: [
        'Candidate configuration list',
        'Power-per-bit and density estimates per candidate',
        'Form factor, cooling and serviceability assumptions',
        'Concept selection record',
        'Product concept brief',
      ],
      r: [['CON-D3', 'produces'], ['CON-D4', 'feeds']],
    },
    'CON-04': {
      s: [
        [1, 'Build the cost-of-goods model — silicon, photonics, optical source, package, fiber, board, test', 1.5],
        [2, 'Model volume, pricing and total cost of ownership for the target customers', 1, 1],
        [3, 'Estimate development cost, NRE and payback', 1],
        [4, 'Run sensitivity on yield, optical source cost and test time', 1],
        [5, 'Release the business case', 0.5],
      ],
      o: [
        'Cost-of-goods model by subsystem',
        'Volume, pricing and total cost of ownership model',
        'Development cost, NRE and payback estimate',
        'Sensitivity analysis',
        'Business case and cost-of-goods model',
      ],
      r: [['CON-D4', 'produces'], ['CON-D6', 'feeds']],
    },
    'CON-05': {
      s: [
        [1, 'Draft the milestone plan from concept to production release', 1],
        [2, 'Estimate staffing by discipline and the external partners required', 1, 1],
        [3, 'Identify long-lead suppliers and the decisions they force early', 1],
        [4, 'Build the budget and its phasing', 1],
        [5, 'Release the program plan', 0.5],
      ],
      o: [
        'Milestone plan',
        'Staffing and partner plan',
        'Long-lead supplier and early-decision list',
        'Budget and phasing',
        'Program plan',
      ],
      r: [['CON-D5', 'produces'], ['CON-D6', 'feeds']],
    },
    'CON-06': {
      s: [
        [1, 'Build the program risk register with owners and mitigations', 1],
        [2, 'Assemble the go / no-go package — concept, business case, plan and risks', 0.5],
        [3, 'Hold the go / no-go review and record the decision and its conditions', 0.5],
      ],
      o: ['Program risk register', 'Go / no-go review package', 'Go / no-go decision record'],
      r: [['CON-D6', 'produces']],
    },
  },
};
