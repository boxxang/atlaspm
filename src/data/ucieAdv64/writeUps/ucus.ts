/**
 * UCUS — Customer Integration Support & Sustaining, written up.
 */
import type { UcieWriteUps } from '../types';

export const UCUS_WRITE_UPS: UcieWriteUps = {
  'UCUS-01': {
    criticalPath: false,
    purpose: [
      'Review <b>each licensee’s integration of the PHY</b> from v0.5 onward: an integration kickoff on package type, die orientation, module count and schedule, then reviews of their floorplan and macro placement, their bump map and package routing against the channel guidelines, their power delivery and decoupling against the PHY requirements, and their extracted channel and link margin with the released models.',
      'At 64 GT/s on a bridge or interposer, the IP’s margin is spent in the customer’s package as much as in this team’s circuits. Reviewing the customer’s actual floorplan, bump map and extraction — not a summary slide — is what catches a channel that will not close while it can still be redrawn.',
    ],
    flowNote:
      'Step 1 holds the kickoff and step 2 reviews floorplan and placement while step 3 reviews bump map and routing in parallel. Step 4 reviews power delivery, step 5 the channel and link margin, and step 6 closes the findings.',
    consumes: [
      'v0.5 release and preliminary integration guide from UPRE-02',
      'Early-access feedback and customer list from UPRE-03',
      'Customer channel guidelines and reference design from UCHN-06',
      'Bump map concept and module floorplan from UARC-09',
      'Licensee floorplans, bump maps and package extractions',
    ],
    rel: {
      'UCUS-D1': '<b>Customer integration review records — floorplan, bump map, power and channel.</b> Produced here per licensee.',
      'UCUS-D2': '<b>SoC-level signoff support reports per licensee.</b> Findings left open at review are tracked into signoff support.',
    },
    risks: [
      '<b>Review on slides.</b> The customer presents a summary and the real bump map is never seen.',
      '<b>Channel outside guidelines.</b> A licensee’s package routing exceeds the guideline reach or crosstalk and nobody flags it.',
      '<b>Orientation surprise.</b> A licensee places the macro in an orientation the abstracts do not cover.',
      '<b>Findings unowned.</b> Review findings are recorded but have no owner on the customer side.',
      '<b>Too many at once.</b> Several licensees reach review together and reviews are cut short.',
    ],
    roles: [
      { r: 'Customer engineering', d: 'Owns integration reviews with each licensee' },
      { r: 'SI/PI engineer', d: 'Bump map, routing and channel review' },
      { r: 'Physical design engineer', d: 'Floorplan and placement review' },
      { r: 'Analog and mixed-signal designer', d: 'Power delivery and supply noise review' },
      { r: 'Licensee integration lead', d: 'Provides the design data and owns customer-side fixes' },
    ],
    effort: [
      ['Kickoffs', 2.2],
      ['Floorplan and placement reviews', 5.3],
      ['Bump map and routing reviews', 5.2],
      ['Power delivery reviews', 3.8],
      ['Channel and link margin reviews', 4.5],
      ['Finding closure', 1.5],
    ],
    entry: [
      'v0.5 released to the licensee from UPRE-02',
      'Channel guidelines available from UCHN-06',
      'Licensee floorplan or package plan available for review',
    ],
    exit: [
      'Every licensee reviewed on floorplan, bump map, power delivery and channel before their SoC signoff starts',
      'Every licensee channel shown within the channel guidelines or a deviation agreed with SI/PI',
      'Every review finding closed or carried into signoff support with an owner',
    ],
    dependsOn: ['UPRE-02', 'UPRE-03', 'UCHN-06'],
    dependsNote: 'Customer support starts with v0.5: there is nothing to integrate before it.',
    feedsInto: ['UCUS-02', 'UCUS-04'],
    measuredBy: [
      'Licensees reviewed against licensees integrating',
      'Review findings open and their age',
      'Licensee channels outside the guidelines',
    ],
    links: {
      dependsOn: ['UPRE-02', 'UPRE-03', 'UCHN-06', 'UARC-09'],
      feedsInto: ['UCUS-02', 'UCUS-03', 'UCUS-04', 'UCUS-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Licensee', 'Bump pitch', 'Silicon bridge', 'Silicon interposer', 'RDL interposer', 'Integration guide'],
  },
  'UCUS-02': {
    criticalPath: false,
    purpose: [
      'Support each licensee’s <b>SoC-level signoff with the PHY inside it</b>: timing at the hard macro boundary with the released Liberty libraries, EM/IR and power signoff with the PHY power models, physical verification of the macro in their database, and SoC-level link simulation with the channel models on their final package — then review their results and confirm the PHY is integrated as specified.',
      'A licensee’s signoff is the first time the macro is checked inside a database this team does not own, with tools and decks configured by someone else. Most failures here are integration mismatches — a corner not run, an abstract read in the wrong orientation, a model used outside its range — and each one is cheaper to find together than after the customer’s tapeout.',
    ],
    flowNote:
      'Step 1 supports boundary timing while step 2 supports EM/IR and power in parallel. Step 3 supports physical verification, step 4 SoC-level link simulation, and step 5 reviews the results.',
    consumes: [
      'Customer integration review records from UCUS-01',
      'v0.9 release and decision from UPRE-08',
      'Physical views from UPRE-04',
      'Channel, timing and power models from UPRE-05',
      'Licensee signoff databases and reports',
    ],
    rel: {
      'UCUS-D2': '<b>SoC-level signoff support reports per licensee.</b> Produced here.',
    },
    risks: [
      '<b>Older release.</b> A licensee signs off against v0.5 views rather than v0.9 or GA.',
      '<b>Corners skipped.</b> Boundary timing is run at fewer corners than the Liberty libraries provide.',
      '<b>Deck mismatch.</b> The customer’s physical verification deck flags the macro for rules it was not built to.',
      '<b>Model misuse.</b> Channel models are used on a package beyond their stated validity range.',
      '<b>Signoff waived by the customer.</b> The licensee waives a PHY violation without telling this team.',
    ],
    roles: [
      { r: 'Customer engineering', d: 'Owns SoC-level signoff support' },
      { r: 'Timing engineer', d: 'Boundary timing support' },
      { r: 'Physical design engineer', d: 'Physical verification of the macro in the licensee database' },
      { r: 'SI/PI engineer', d: 'SoC-level link simulation and power support' },
      { r: 'Licensee signoff lead', d: 'Runs the SoC signoff and shares results' },
    ],
    effort: [
      ['Boundary timing support', 6.9],
      ['EM/IR and power support', 5.3],
      ['Physical verification support', 6.1],
      ['Link simulation support', 6.1],
      ['Results review', 3.1],
    ],
    entry: [
      'v0.9 released from UPRE-08',
      'Licensee integration reviewed in UCUS-01',
      'Licensee signoff database shared under the support agreement',
    ],
    exit: [
      'Licensee boundary timing, EM/IR, physical verification and link simulation results reviewed by this team',
      'Every PHY-related signoff violation closed or its waiver agreed in writing',
      'Licensee confirmed signing off against the current supported release',
    ],
    dependsOn: ['UCUS-01', 'UPRE-08', 'UPRE-04', 'UPRE-05'],
    dependsNote: null,
    feedsInto: ['UCUS-04', 'UCUS-05'],
    measuredBy: [
      'Licensees supported through signoff',
      'PHY-related signoff violations found and closed',
      'Licensees on the current release',
    ],
    links: {
      dependsOn: ['UCUS-01', 'UPRE-08', 'UPRE-04', 'UPRE-05'],
      feedsInto: ['UCUS-04', 'UCUS-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Signoff', 'Liberty', 'EM/IR', 'IBIS-AMI', 'Hard macro', 'Abstract'],
  },
  'UCUS-03': {
    criticalPath: false,
    purpose: [
      'Build the <b>knowledge base licensees answer themselves from</b>: the release documents and a first FAQ, every recurring question turned into an FAQ entry, application notes for recurring integration and bring-up topics, and the whole set kept consistent with the integration guide and the errata at each release.',
      'The cost of supporting a PHY IP grows with the number of licensees unless answers are written once. A question answered by email helps one customer; the same answer in the knowledge base, consistent with the guide, helps every customer after.',
    ],
    flowNote:
      'Step 1 sets up the knowledge base and step 2 answers questions and grows the FAQ while step 3 publishes application notes in parallel. Step 4 keeps the set consistent at each release and step 5 hands it to sustaining.',
    consumes: [
      'Integration guide and application notes from UPRE-06',
      'v0.5 release package from UPRE-02',
      'Integration review findings from UCUS-01',
      'Customer issues and their dispositions from UCUS-04',
      'GA release package and errata from UGA-03',
    ],
    rel: {
      'UCUS-D3': '<b>Customer documentation set — FAQ and knowledge base.</b> Produced here.',
    },
    risks: [
      '<b>Answers by email.</b> Questions are answered privately and never reach the FAQ.',
      '<b>Drift from the guide.</b> FAQ answers contradict an updated integration guide.',
      '<b>Errata not linked.</b> Known issues are in the errata but the FAQ still describes the old behavior.',
      '<b>Unsearchable.</b> The knowledge base grows but licensees cannot find answers.',
      '<b>Notes never published.</b> Application notes are drafted but wait for a release that slips.',
    ],
    roles: [
      { r: 'Technical documentation', d: 'Owns the knowledge base and FAQ' },
      { r: 'Customer engineer', d: 'Brings recurring questions' },
      { r: 'Field application engineer', d: 'Bring-up and integration topics' },
      { r: 'IP architect', d: 'Technical review of answers' },
      { r: 'Quality engineer', d: 'Consistency with the release documents' },
    ],
    effort: [
      ['Knowledge base setup', 1.5],
      ['FAQ from questions', 3.7],
      ['Application notes', 3],
      ['Release consistency updates', 1.9],
      ['Handover', 0.4],
    ],
    entry: [
      'Integration guide released with v0.9 from UPRE-06',
      'Customer question channel open',
      'Issue tracker live in UCUS-04',
    ],
    exit: [
      'Every question asked by more than one licensee answered in the FAQ',
      'Knowledge base reviewed for consistency with the integration guide and errata at every release',
      'Documentation set handed to sustaining with an owner',
    ],
    dependsOn: ['UPRE-06', 'UPRE-02', 'UCUS-01'],
    dependsNote: null,
    feedsInto: ['UCUS-05'],
    measuredBy: [
      'Questions answered from the knowledge base against new questions filed',
      'FAQ entries added per release',
      'Inconsistencies found at release review',
    ],
    links: {
      dependsOn: ['UPRE-06', 'UPRE-02', 'UCUS-01', 'UCUS-04', 'UGA-03'],
      feedsInto: ['UCUS-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Knowledge base', 'Integration guide', 'Errata', 'Licensee'],
  },
  'UCUS-04': {
    criticalPath: false,
    purpose: [
      'Handle <b>every customer issue to a root cause</b>: a tracker with severity, owner and response targets; each issue reproduced in the reference environment and root-caused; a workaround, a document change or an ECO decided for each; ECOs implemented, verified and released as patch releases and queued for the next main release; issues closed with the licensee and trends reported to engineering.',
      'Customer issues on an IP arrive in other people’s designs and tools, so the first job is always to reproduce them here. An ECO fixed for one licensee and not merged into the main release splits the installed base, so every patch is queued for the next release by default.',
    ],
    flowNote:
      'Step 1 sets up the tracker and step 2 reproduces and root-causes issues while step 3 decides dispositions in parallel. Step 4 releases ECOs as patches and queues them, and step 5 closes issues and reports trends.',
    consumes: [
      'Customer integration review records from UCUS-01',
      'v0.9 release and decision from UPRE-08',
      'Early-access feedback log from UPRE-03',
      'Licensee issue reports with design data',
      'Reference integration and simulation environment',
    ],
    rel: {
      'UCUS-D4': '<b>Customer issue and ECO log with patch releases.</b> Produced here.',
      'UCUS-D3': '<b>Customer documentation set — FAQ and knowledge base.</b> Issues closed by a document change or workaround become FAQ entries.',
    },
    risks: [
      '<b>Not reproduced.</b> An issue is closed as customer error without being reproduced.',
      '<b>Patch not merged.</b> An ECO released to one licensee never reaches the main release.',
      '<b>Severity mis-set.</b> A link-down issue in a customer’s silicon waits behind documentation questions.',
      '<b>ECO unverified.</b> A fix is released without the regression the original release passed.',
      '<b>No trend view.</b> Repeated issues in the same block are never fed back to engineering.',
    ],
    roles: [
      { r: 'Customer engineering', d: 'Owns customer issues and ECO releases' },
      { r: 'RTL design engineer', d: 'Root cause and fixes in the digital design' },
      { r: 'Analog and mixed-signal designer', d: 'Root cause in the electrical PHY' },
      { r: 'Verification engineer', d: 'Regression on every ECO' },
      { r: 'Quality engineer', d: 'Patch release QA and trend reporting' },
    ],
    effort: [
      ['Tracker setup', 0.8],
      ['Reproduction and root cause', 7.5],
      ['Disposition', 2.2],
      ['ECO implementation and release', 6],
      ['Closure and trends', 1.5],
    ],
    entry: [
      'Issue tracker live with severity and response targets',
      'Reference environment able to run each released version',
      'v0.9 released from UPRE-08',
    ],
    exit: [
      'Every issue reproduced or shown to be outside the IP with evidence',
      'Every ECO released as a patch is queued in the next main release',
      'Issues closed within their severity response targets',
    ],
    dependsOn: ['UCUS-01', 'UPRE-08', 'UPRE-03'],
    dependsNote: null,
    feedsInto: ['UCUS-03', 'UCUS-05', 'UGA-03'],
    measuredBy: [
      'Open issues by severity and age',
      'Issues closed within their response target',
      'ECOs released and merged',
    ],
    links: {
      dependsOn: ['UCUS-01', 'UPRE-08', 'UPRE-03'],
      feedsInto: ['UCUS-03', 'UCUS-05', 'UGA-03'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['ECO', 'Errata', 'Release notes', 'Licensee'],
  },
  'UCUS-05': {
    criticalPath: false,
    purpose: [
      'Hand the IP to <b>sustaining</b>: review the open issues, ECOs and customer commitments, agree the sustaining support model with its staffing and response targets, and hand over the issue tracker, the knowledge base and the release archive with an owner for each.',
      'Development engineers move to the next speed grade after GA; licensees are still taping out on this one. The handover is only complete when every open commitment has a named owner in sustaining and nothing depends on someone remembering it.',
    ],
    flowNote:
      'Step 1 reviews open issues and commitments and step 2 agrees the support model. Step 3 hands over the tracker, knowledge base and archive, and step 4 records the decision.',
    consumes: [
      'Customer issue and ECO log from UCUS-04',
      'SoC-level signoff support status from UCUS-02',
      'Customer documentation set from UCUS-03',
      'GA approval decision from UGA-05',
      'Integration review records from UCUS-01',
    ],
    rel: {
      'UCUS-D5': '<b>Sustaining handover package and support model.</b> Produced here; it closes the stage.',
    },
    risks: [
      '<b>Open issues orphaned.</b> Severe issues are handed over without a named owner.',
      '<b>Commitments lost.</b> Promises to licensees exist only in development engineers’ email.',
      '<b>Archive incomplete.</b> A release cannot be rebuilt from the archive sustaining receives.',
      '<b>Understaffed sustaining.</b> The support model assumes fewer licensees than are integrating.',
      '<b>Reference environment lost.</b> Sustaining cannot reproduce issues on old releases.',
    ],
    roles: [
      { r: 'Quality', d: 'Owns the sustaining handover review' },
      { r: 'Customer engineering lead', d: 'Presents open issues and commitments' },
      { r: 'Sustaining engineering lead', d: 'Accepts the handover' },
      { r: 'IP program manager', d: 'Closes the development program' },
      { r: 'Product manager', d: 'Approves the support model' },
    ],
    effort: [
      ['Open issue review', 0.3],
      ['Support model', 0.4],
      ['Handover', 0.4],
      ['Decision record', 0.4],
    ],
    entry: [
      'IP GA declared in UGA-05',
      'Issue and ECO log current in UCUS-04',
      'Sustaining team named',
    ],
    exit: [
      'Every open issue and customer commitment has a named owner in sustaining',
      'Every release rebuilt successfully from the handed-over archive',
      'Support model with staffing and response targets signed by sustaining and product management',
    ],
    dependsOn: ['UCUS-01', 'UCUS-02', 'UCUS-03', 'UCUS-04', 'UGA-05'],
    dependsNote: null,
    feedsInto: [],
    measuredBy: [
      'Open issues at handover by severity',
      'Commitments with a sustaining owner',
      'Releases rebuilt from the archive',
    ],
    links: {
      dependsOn: ['UCUS-01', 'UCUS-02', 'UCUS-03', 'UCUS-04', 'UGA-05'],
      feedsInto: [],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['GA', 'Release package', 'Knowledge base'],
  },
};
