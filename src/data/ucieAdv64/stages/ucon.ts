/**
 * UCON — IP Concept & Business Case. Weeks 0–8; closes on IP Program Go.
 */
import type { UcieStageModule } from '../types';

export const UCON: UcieStageModule = {
  content: {
    tagline: 'Decide which die-to-die PHY customers will license, at what price, before anyone designs one.',
    description:
      'Establish why the company should build a 64 GT/s die-to-die PHY for UCIe Advanced packages, and for whom. Product management captures which SoC and chiplet customers need it, on which package types and processes, and what bandwidth density and energy per bit would make them license rather than build their own; it maps competing die-to-die PHY offerings, builds the business case and the licensing and pricing model, and places the IP on the roadmap so later speed grades and process ports can reuse it. Program management turns that into a plan with a test chip budget, staffing and partners. The stage closes on a go / no-go that commits the program to a new architecture on a new process.',
    activities: ['Market and customer needs', 'Competitive landscape', 'Business case and pricing', 'Roadmap position', 'Program plan', 'Go / no-go'],
    deliverables: [
      'Market and customer requirements brief — target SoCs, package types and bandwidth needs',
      'Competitive die-to-die PHY IP landscape and differentiation matrix',
      'IP business case with licensing and pricing model',
      'IP roadmap position and derivative plan — speed grades, processes and ports',
      'IP program plan — schedule, staffing, test chip budget and partners',
      'IP program go / no-go decision package',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [4, 4, 6, 6, 7, 8],
    engineeringEffort: [3.5, 2, 2, 1.5, 2, 1],
    risks: [
      'Customer demand captured as interest in "UCIe" rather than as a package type, process and bandwidth a customer will commit a design to',
      'Business case assumes design wins on processes the program cannot port to in time',
    ],
    potentialRisks: [
      'Lead customers plan to build their own die-to-die PHY, so the addressable market is smaller than the interest suggests',
      'Pricing set against a competitor’s list price without the cost of the support a first-generation 64 GT/s PHY will need',
      'Roadmap commits to a 64 GT/s derivative before the first generation has silicon data',
      'Test chip and test vehicle cost left out of the business case and found at the shuttle booking',
      'Go / no-go held on schedule rather than on whether the bandwidth density target is reachable on the chosen process',
    ],
    leader: { name: 'Mira Castellanos', short: 'M. Castellanos', phone: '+1 (408) 555-0601', email: 'mira.castellanos@example.com' },
    collaboration: ['Product management', 'Program management', 'IP architecture', 'Customer engineering', 'Technology and foundry', 'Quality'],
    tools: ['Customer relationship and opportunity tracking system', 'Business case and pricing spreadsheet model', 'Program planning and resource tool', 'Competitive intelligence repository'],
    programView: [
      'Named customer opportunities by package type and process',
      'Business case net present value against the go threshold',
      'Program plan headcount against the approved budget',
      'Open go / no-go actions and their owners',
    ],
    perspective:
      'An interface IP succeeds when customers stop asking whether it works and start asking when they can tape out with it. The concept stage decides which customers those are; every later trade in bandwidth, power and area should trace to their designs, not to a datasheet comparison.',
  },
  steps: {
    'UCON-01': {
      s: [
        [1, 'Identify target customers and the SoCs, chiplets and package types they plan for die-to-die links', 1],
        [2, 'Interview lead customers on bandwidth, energy per bit, shoreline and latency needs', 1.5],
        [3, 'Capture process nodes, package technologies and schedules each customer is committed to', 1, 1],
        [4, 'Rank the needs and release the market and customer requirements brief', 1.5],
      ],
      o: [
        'Target customer and design list',
        'Customer interview notes with quantified needs',
        'Customer process, package and schedule map',
        'Market and customer requirements brief — target SoCs, package types and bandwidth needs',
      ],
      r: [['UCON-D1', 'produces'], ['UCON-D3', 'feeds']],
    },
    'UCON-02': {
      s: [
        [1, 'Collect public data on competing die-to-die PHY IP — speeds, package types, processes and silicon status', 1.5],
        [2, 'Compare bandwidth density, energy per bit, area and supported features against the customer needs', 1],
        [3, 'Identify where the program can differentiate and where it must reach parity', 1],
        [4, 'Release the landscape and differentiation matrix', 0.5],
      ],
      o: [
        'Competing die-to-die PHY offering inventory',
        'Side-by-side metric comparison against customer needs',
        'Differentiation and parity list',
        'Competitive die-to-die PHY IP landscape and differentiation matrix',
      ],
      r: [['UCON-D2', 'produces'], ['UCON-D3', 'feeds']],
    },
    'UCON-03': {
      s: [
        [1, 'Size the addressable market from the named opportunities and their timing', 1],
        [2, 'Model development cost including test chip, test vehicle, shuttle and support staffing', 1],
        [3, 'Define the licensing model — license fee, per-design or per-unit terms and support tiers', 1, 1],
        [4, 'Set the price against the competitive matrix and compute the business case', 1],
        [5, 'Release the business case and pricing model', 0.5],
      ],
      o: [
        'Addressable market estimate by year',
        'Development and support cost model',
        'Licensing model with support tiers',
        'Pricing and business case calculation',
        'IP business case with licensing and pricing model',
      ],
      r: [['UCON-D3', 'produces'], ['UCON-D6', 'feeds']],
    },
    'UCON-04': {
      s: [
        [1, 'Place the 64 GT/s Advanced package PHY in the die-to-die IP roadmap beside existing speed grades', 1],
        [2, 'Plan the processes and package types the IP will be ported to after the first one', 1.5],
        [3, 'Define which blocks must be reusable across derivatives and which are process-specific', 1],
        [4, 'Release the roadmap position and derivative plan', 0.5],
      ],
      o: [
        'Roadmap position against existing speed grades',
        'Process and package port plan',
        'Reusable and process-specific block split',
        'IP roadmap position and derivative plan — speed grades, processes and ports',
      ],
      r: [['UCON-D4', 'produces'], ['UCON-D6', 'feeds']],
    },
    'UCON-05': {
      s: [
        [1, 'Build the integrated schedule from kickoff through test chip, silicon validation and GA', 1],
        [2, 'Plan staffing by function — architecture, analog, digital, verification, layout, test and customer engineering', 1],
        [3, 'Budget the test chip, test vehicle, boards, lab equipment and shuttle slots', 1, 1],
        [4, 'Identify partners — foundry, package and assembly partner, test house — and their commitments', 1],
        [5, 'Release the program plan', 0.5],
      ],
      o: [
        'Integrated schedule to GA',
        'Staffing plan by function',
        'Test chip and lab hardware budget',
        'Partner list with commitments needed',
        'IP program plan — schedule, staffing, test chip budget and partners',
      ],
      r: [['UCON-D5', 'produces'], ['UCON-D6', 'feeds']],
    },
    'UCON-06': {
      s: [
        [1, 'Assess program risks — 64 GT/s circuit feasibility, process maturity, package availability and staffing', 0.5],
        [2, 'Assemble the decision package from the requirements, business case, roadmap and plan', 0.5],
        [3, 'Hold the go / no-go review with executive sponsors and record the decision and conditions', 1],
      ],
      o: [
        'Program risk register with mitigations',
        'Go / no-go decision package draft',
        'IP program go / no-go decision package',
      ],
      r: [['UCON-D6', 'produces']],
    },
  },
};
