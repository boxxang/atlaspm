/**
 * UCUS — Customer Integration Support & Sustaining. Weeks 56–140; closes on
 * Sustaining Handover.
 */
import type { UcieStageModule } from '../types';

export const UCUS: UcieStageModule = {
  content: {
    tagline: 'Carry every licensee from the first v0.5 simulation to a signed-off SoC, and hand the IP to sustaining with nothing open.',
    description:
      'A die-to-die PHY is only proven when it works in other people’s chips. From the v0.5 release onward, customer engineering reviews each licensee’s integration — floorplan and macro placement, bump map and package routing, power delivery and decoupling, and their extracted channels and link margin — against the integration guide and channel guidelines. After v0.9 it supports their SoC-level signoff: timing at the macro boundary, EM/IR and power, physical verification of the macro in their database, and link simulation with the released models. A knowledge base and FAQ grow from the questions customers ask, and every customer issue is reproduced in the reference environment, root-caused and closed by a workaround, a document change or an ECO. Errata are published and patch releases go out with their own QA and a notification to every affected licensee; requests for variants and ports — another metal stack, orientation, module count, bump pitch or package type — are evaluated and decided rather than accepted ad hoc; and once the test chip links up, licensees still in SoC signoff receive early silicon briefs under NDA instead of waiting for production release. The stage runs past production release and closes when the support model, the issue tracker, the knowledge base and the release archive are handed to sustaining.',
    activities: ['Integration reviews', 'SoC signoff support', 'Documentation and FAQ', 'Issues and ECOs', 'Sustaining handover', 'Errata and patch releases', 'Variant and porting requests', 'Early silicon briefs'],
    deliverables: [
      'Customer integration review records — floorplan, bump map, power and channel',
      'SoC-level signoff support reports per licensee',
      'Customer documentation set — FAQ and knowledge base',
      'Customer issue and ECO log with patch releases',
      'Sustaining handover package and support model',
      'Errata list, patch releases and licensee notification record',
      'Variant and porting request evaluations with decisions',
      'Early silicon data briefs and preliminary characterization drop for licensees',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7],
    deliverableWeek: [60, 72, 80, 80, 84, 80, 80, 62],
    engineeringEffort: [22.5, 27.5, 10.5, 18, 1.5, 8, 4, 3],
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
      'Licensees taping out SoCs during the months between v0.9 and production release with no silicon data at all',
      'A variant promised to one customer that needs new views the release structure cannot carry',
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
    'UCUS-06': {
      s: [
        [1, 'Set up the errata process — entry format, severity, workaround, affected releases and the licensee notification list', 2],
        [2, 'Turn confirmed issues and silicon findings into errata entries with workarounds and the releases they affect', 20],
        [3, 'Build patch releases on the v0.9 line with their own release QA and release notes', 20, 1],
        [4, 'Notify every affected licensee of each erratum and patch and record the acknowledgement', 10, 1],
        [5, 'Hand the errata list and patch history to sustaining', 4],
      ],
      o: [
        'Errata process and notification list',
        'Errata entries with workarounds',
        'QA-passed patch releases with release notes',
        'Licensee notification and acknowledgement record',
        'Errata list, patch releases and licensee notification record',
      ],
      r: [['UCUS-D6', 'produces'], ['UCUS-D3', 'feeds']],
    },
    'UCUS-07': {
      s: [
        [1, 'Set up an intake for variant and porting requests with the evaluation criteria and the product owner', 2],
        [2, 'Evaluate each request — metal stack, orientation, module count, bump pitch or package type — for engineering impact on the macro, the views and the channel kit', 30],
        [3, 'Estimate the cost, the schedule and the new views and signoff each accepted variant would need', 15, 1],
        [4, 'Decide each request with product management as accepted, deferred to the roadmap or declined, and record it', 20],
        [5, 'Hand open requests and roadmap decisions to sustaining and the next IP generation', 4],
      ],
      o: [
        'Request intake and evaluation criteria',
        'Engineering impact assessment per request',
        'Cost, schedule and deliverable estimates',
        'Recorded decision per request',
        'Variant and porting request evaluations with decisions',
      ],
      r: [['UCUS-D7', 'produces']],
    },
    'UCUS-08': {
      s: [
        [1, 'Agree the brief content, the entitled recipients and the NDA scope with product management', 1],
        [2, 'Write the early silicon brief — first link-up, training behavior and first margins against the pre-silicon predictions', 2],
        [3, 'Run release QA on the brief and release it to entitled licensees in SoC signoff', 1],
        [4, 'Prepare a preliminary characterization drop — margins, BER and energy per bit so far, with their test conditions', 4],
        [5, 'Run release QA on the drop and release it, marked as preliminary', 1],
        [6, 'Collect licensee questions on the data and route them to validation and customer engineering', 1, 1],
      ],
      o: [
        'Brief content, recipients and NDA scope',
        'Early silicon brief',
        'QA-passed brief release',
        'Preliminary characterization drop',
        'Early silicon data briefs and preliminary characterization drop for licensees',
        'Licensee question log on early silicon data',
      ],
      r: [['UCUS-D8', 'produces'], ['UCUS-D2', 'feeds']],
    },
  },
};
