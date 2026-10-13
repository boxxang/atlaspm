/**
 * UCUS — Customer Integration Support & Sustaining. Weeks 56–140; closes on
 * Sustaining Handover.
 */
import type { UcieStageModule } from '../types';

export const UCUS: UcieStageModule = {
  content: {
    tagline: 'Carry every licensee from the first v0.5 simulation to a signed-off SoC, and hand the IP to sustaining with nothing open.',
    description:
      'A die-to-die PHY is only proven when it works in other people’s chips. From the v0.5 release onward, customer engineering reviews each licensee’s integration — floorplan and macro placement, bump map and package routing, power delivery and decoupling, and their extracted channels and link margin — against the integration guide and channel guidelines. After v0.9 it supports their SoC-level signoff: timing at the macro boundary, EM/IR and power, physical verification of the macro in their database, and link simulation with the released models. A knowledge base and FAQ grow from the questions customers ask, and every customer issue is reproduced in the reference environment, root-caused and closed by a workaround, a document change or an ECO released as a patch and folded into the next release. The stage runs past GA and closes when the support model, the issue tracker, the knowledge base and the release archive are handed to sustaining.',
    activities: ['Integration reviews', 'SoC signoff support', 'Documentation and FAQ', 'Issues and ECOs', 'Sustaining handover'],
    deliverables: [
      'Customer integration review records — floorplan, bump map, power and channel',
      'SoC-level signoff support reports per licensee',
      'Customer documentation set — FAQ and knowledge base',
      'Customer issue and ECO log with patch releases',
      'Sustaining handover package and support model',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [60, 72, 80, 80, 84],
    engineeringEffort: [30, 36, 14, 24, 2],
    risks: [
      'A licensee’s package channel exceeds the channel guidelines and is found only when their link margin simulation fails at SoC signoff',
      'Customer ECOs released as one-off patches that never reach the main release, so licensees diverge',
    ],
    potentialRisks: [
      'Integration reviews held on slides rather than on the customer’s actual floorplan, bump map and extraction',
      'Customer engineering staffed for early access and overwhelmed when several licensees reach signoff together',
      'Issues closed with a workaround nobody documents, so the next licensee files the same issue',
      'Customer signoff run with an older release than the one supported',
      'Sustaining handed over with open severe issues and no owner for them',
      'Knowledge base answers drifting from the integration guide as each is updated separately',
    ],
    leader: { name: 'Elena Okonkwo', short: 'E. Okonkwo', phone: '+1 (408) 555-0663', email: 'elena.okonkwo@example.com' },
    collaboration: ['Customer engineering', 'Technical documentation', 'SI/PI', 'Physical design', 'RTL design', 'Quality', 'Product management'],
    tools: ['Customer issue tracker with severity and response targets', 'Customer knowledge base and FAQ portal', 'Reference integration and simulation environment', 'Secure customer file distribution portal'],
    programView: [
      'Licensees by integration phase — onboarding, reviews, signoff, tapeout',
      'Open customer issues by severity and age',
      'ECOs released and merged into the main release',
      'Questions answered from the knowledge base against new questions filed',
    ],
    perspective:
      'Every customer issue is either a defect, a gap in the documents or a gap in the review. Closing the issue is not enough; closing the gap that let it happen is what makes the tenth licensee cheaper to support than the first.',
  },
  steps: {
    'UCUS-01': {
      s: [
        [1, 'Hold the integration kickoff with each licensee — package type, die orientation, module count and schedule', 4],
        [2, 'Review the licensee floorplan and macro placement against the integration guide', 12],
        [3, 'Review the bump map and package routing against the channel guidelines', 12, 1],
        [4, 'Review power delivery, decoupling and supply noise against the PHY requirements', 10],
        [5, 'Review the licensee’s extracted channel and link margin results with the released models', 14],
        [6, 'Record review findings and close each with the licensee', 8],
      ],
      o: [
        'Integration kickoff record per licensee',
        'Floorplan and placement review findings',
        'Bump map and routing review findings',
        'Power delivery review findings',
        'Channel and link margin review findings',
        'Customer integration review records — floorplan, bump map, power and channel',
      ],
      r: [['UCUS-D1', 'produces'], ['UCUS-D2', 'feeds']],
    },
    'UCUS-02': {
      s: [
        [1, 'Support licensee timing signoff at the hard macro boundary with the released Liberty libraries', 10],
        [2, 'Support licensee EM/IR and power signoff with the PHY power models', 10, 1],
        [3, 'Support physical verification of the macro inside the licensee database — DRC, LVS and density', 10],
        [4, 'Support licensee SoC-level link simulation with the channel models on their final package', 12],
        [5, 'Review the licensee signoff results and confirm the PHY is integrated as specified', 8],
      ],
      o: [
        'Boundary timing signoff support record',
        'EM/IR and power signoff support record',
        'Macro physical verification support record',
        'SoC-level link simulation review',
        'SoC-level signoff support reports per licensee',
      ],
      r: [['UCUS-D2', 'produces']],
    },
    'UCUS-03': {
      s: [
        [1, 'Set up the customer knowledge base with the release documents and a first FAQ', 6],
        [2, 'Answer licensee questions and turn recurring ones into FAQ entries', 30],
        [3, 'Publish application notes for recurring integration and bring-up topics', 20, 1],
        [4, 'Update the knowledge base at each release and keep it consistent with the guide and errata', 20],
        [5, 'Hand the documentation set to sustaining', 4],
      ],
      o: [
        'Knowledge base with first FAQ',
        'FAQ entries from recurring questions',
        'Additional application notes',
        'Knowledge base updated per release',
        'Customer documentation set — FAQ and knowledge base',
      ],
      r: [['UCUS-D3', 'produces']],
    },
    'UCUS-04': {
      s: [
        [1, 'Set up the customer issue tracker with severity, owner and response targets', 2],
        [2, 'Reproduce each customer issue in the reference environment and find its root cause', 24],
        [3, 'Decide a workaround, a document change or an ECO for each confirmed issue', 8, 1],
        [4, 'Implement, verify and release ECOs as patch releases and queue them for the next main release', 20],
        [5, 'Close issues with the licensee and report trends to engineering', 6],
      ],
      o: [
        'Customer issue tracker with response targets',
        'Reproduced issues with root causes',
        'Issue dispositions',
        'Released and queued ECO patches',
        'Customer issue and ECO log with patch releases',
      ],
      r: [['UCUS-D4', 'produces'], ['UCUS-D3', 'feeds']],
    },
    'UCUS-05': {
      s: [
        [1, 'Review open issues, ECOs and customer commitments', 1],
        [2, 'Agree the sustaining support model, staffing and response targets', 1],
        [3, 'Hand over the issue tracker, knowledge base and release archive', 1],
        [4, 'Record the sustaining handover decision', 0.5],
      ],
      o: [
        'Open issue and commitment review',
        'Sustaining support model',
        'Handed-over tracker, knowledge base and archive',
        'Sustaining handover package and support model',
      ],
      r: [['UCUS-D5', 'produces']],
    },
  },
};
