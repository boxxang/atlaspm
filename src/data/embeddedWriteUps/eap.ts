import type { ActivityWriteUp } from '../activityDetailTypes';

export const EAP_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'EAP-01': {
    criticalPath: false,
    purpose: [
      'Decide <b>which customers the programme is for and what early access gives them</b>: the target segments, the lighthouse accounts, the offer of tools, samples and support, and the criteria for getting in and for calling it a success.',
      'A new architecture is sold one ported workload at a time, and the partners chosen now are the ones whose workloads shape the compiler, the SDK libraries and the first design-wins. Picking them for their logo rather than a workload the part wins is the most common way these programmes stall.',
    ],
    flowNote:
      'Step 1 picks the segments and the lighthouse accounts, and step 2 defines what early access offers them. Step 3 sets the entry criteria and the success measures alongside step 2, because what is offered and what is expected in return are negotiated as one, and step 4 releases the charter.',
    consumes: [
      'Customer and market requirements from EDEF-01',
      'Competitive benchmarking and gap analysis from EDEF-02',
      'Embedded workload suite and energy baselines from FCD-01',
      'Compiler architecture and release plan from CMP-01',
      'Developer Playground plan from VP-03',
    ],
    rel: {
      'EAP-D1':
        '<b>Early access programme charter and target accounts.</b> The segments, lighthouse accounts, offer, criteria and success measures are set and released here.',
    },
    risks: [
      '<b>Partners picked for their logo.</b> A famous account with no workload the fabric wins on consumes support and produces no design-win.',
      '<b>Offer promises what the alpha cannot do.</b> Onboarding that depends on a compiler feature not yet in CMP-07 stalls partners before silicon exists.',
      '<b>Success measured by agreements signed.</b> The measure is workloads running and energy estimated, not signatures, and a charter that counts the wrong thing will report success while partners drift.',
      '<b>Too many partners for the FAEs available.</b> Each lighthouse account needs a named engineer, and a list longer than the team spreads support too thin to matter.',
      '<b>No exit for a partner that goes quiet.</b> Without a stated criterion for leaving, inactive partners keep samples and attention that others need.',
    ],
    roles: [
      { r: 'Product marketing lead', d: 'Owns the charter, segments and target accounts' },
      { r: 'Applications architect', d: 'Workloads the fabric wins on per segment' },
      { r: 'Business development lead', d: 'Account access and commercial fit' },
      { r: 'FAE manager', d: 'Support capacity against the account list' },
      { r: 'VP of product', d: 'Approves the charter and the account list' },
    ],
    effort: [
      ['Segments and lighthouse accounts', 1.25],
      ['Early-access offer', 0.75],
      ['Entry criteria and success measures', 0.5],
      ['Charter release', 0.5],
    ],
    entry: [
      'Market requirements released from EDEF-01',
      'Workload suite and energy baselines from FCD-01',
      'Compiler release plan from CMP-01 with alpha scope',
    ],
    exit: [
      'Each lighthouse account paired with the workload it would port',
      'Offer matched to what the alpha and the Playground will support',
      'Charter released with success measured by workloads running',
    ],
    dependsOn: ['EDEF-01', 'EDEF-02', 'FCD-01', 'CMP-01'],
    dependsNote: null,
    feedsInto: ['EAP-02', 'EAP-03'],
    measuredBy: [
      'Target accounts with a named workload against total',
      'Named FAE per lighthouse account',
      'Accounts meeting the entry criteria at signature',
    ],
    links: {
      dependsOn: ['EDEF-01', 'FCD-01', 'CMP-01'],
      feedsInto: ['EAP-02', 'EAP-03'],
      runsWith: [],
      revisedBy: ['EDEF-02', 'VP-03'],
      feedsBackInto: [],
    },
    terms: ['KPI', 'FAE', 'MCU', 'PRD'],
  },
  'EAP-02': {
    criticalPath: false,
    purpose: [
      'Brief the candidate accounts under NDA, qualify each against the charter, and <b>sign early-access agreements that say what each side commits to</b>.',
      'An agreement is how the programme gets a partner’s workload, their engineering time and their feedback, and how the partner gets tools before launch and samples before anyone else. Terms left vague on confidentiality, sample quantities or feedback rights are the ones that stall onboarding later.',
    ],
    flowNote:
      'Step 1 briefs the candidates under NDA, and step 2 qualifies each against the entry criteria. Step 3 negotiates the agreements alongside the qualification, since terms are drafted as soon as an account looks likely rather than after all are scored, and step 4 signs.',
    consumes: [
      'Early access programme charter and target accounts from EAP-01',
      'Product cost and margin model from EDEF-06',
      'Compiler Alpha release scope from CMP-07',
      'Developer Playground scope from VP-03',
      'Customer and market requirements from EDEF-01',
    ],
    rel: {
      'EAP-D2':
        '<b>Signed early-access agreements.</b> The candidates are qualified and the agreements negotiated and signed here.',
    },
    risks: [
      '<b>Architecture disclosed before the NDA.</b> A spatial dataflow fabric is the differentiator, and a briefing given before signature cannot be taken back.',
      '<b>Sample quantities promised beyond the first lot.</b> Units are allocated in EASSY-05 from what the lot yields, and agreements must state that allocation governs.',
      '<b>Feedback rights not granted.</b> Without the right to use a partner’s workload and issues to change the product, the feedback loop in EAP-04 has nothing it may act on.',
      '<b>Pricing committed too early.</b> Production pricing belongs to design-in, and an early-access agreement that fixes it binds the product before its cost is known.',
      '<b>Legal review becomes the long pole.</b> Each partner’s counsel reads the terms separately, and a standard template agreed early is what keeps signatures inside the window.',
    ],
    roles: [
      { r: 'Business development lead', d: 'Owns the briefings, negotiation and signatures' },
      { r: 'Legal counsel', d: 'NDA and agreement terms' },
      { r: 'Product marketing lead', d: 'Qualification against the charter' },
      { r: 'Field applications engineer', d: 'Technical fit of each partner’s workload' },
      { r: 'General manager', d: 'Signs the agreements' },
    ],
    effort: [
      ['Candidate briefings under NDA', 1],
      ['Qualification against the criteria', 0.75],
      ['Agreement negotiation', 1.75],
      ['Signature', 0.5],
    ],
    entry: [
      'Programme charter released in EAP-01',
      'NDA and early-access agreement templates approved by legal',
      'Briefing material cleared for disclosure under NDA',
    ],
    exit: [
      'Every candidate briefed only after NDA signature',
      'Each signed partner qualified against the entry criteria',
      'Agreements signed stating samples, support, feedback rights and confidentiality',
    ],
    dependsOn: ['EAP-01', 'EDEF-06'],
    dependsNote: null,
    feedsInto: ['EAP-03', 'EAP-04'],
    measuredBy: [
      'Agreements signed against the target account list',
      'Weeks from first briefing to signature',
      'Partners signed with a named workload to port',
    ],
    links: {
      dependsOn: ['EAP-01'],
      feedsInto: ['EAP-03', 'EAP-04'],
      runsWith: [],
      revisedBy: ['EDEF-06', 'CMP-07'],
      feedsBackInto: [],
    },
    terms: ['NDA', 'FAE', 'SoC'],
  },
  'EAP-03': {
    criticalPath: false,
    purpose: [
      'Get every partner <b>running their own workload on the fabric before silicon exists</b>: onboarded on the Playground and the compiler alpha, their code ported, and their energy and battery life estimated against the parts they use today.',
      'Nine months of pre-silicon porting is what turns a sample shipment into a first power-on that runs something the partner cares about. It is also the first time the compiler meets code nobody on the team wrote, which is where most of its useful bugs come from.',
    ],
    flowNote:
      'Step 1 onboards the partners, step 2 ports each workload, and step 3 estimates energy and battery life once a port runs. Step 4 holds regular technical reviews alongside steps 2 and 3 for the whole onboarding, because porting problems surface continuously rather than at the end, and step 5 records the outcomes.',
    consumes: [
      'Signed early-access agreements from EAP-02',
      'Developer Playground launch readiness from VP-05',
      'Compiler Alpha with regression suite from CMP-07',
      'Energy profiler and lifetime modeller from VP-04',
      'HAL and peripheral drivers from SDK-02',
    ],
    rel: {
      'EAP-D3':
        '<b>Pre-silicon onboarding record.</b> The partners are onboarded, their workloads ported and estimated, and the outcomes recorded here.',
    },
    risks: [
      '<b>Partners stall before silicon.</b> Without a named FAE and a regular review, a partner with no hardware to hold drifts back to their existing part.',
      '<b>Energy estimates quoted as silicon results.</b> Pre-silicon numbers are model output with stated bounds, and partners must receive them that way until CREL-01 correlates them.',
      '<b>Ports done by the FAEs, not the partner.</b> A partner who never compiled their own code has not learned the toolchain, and design-in will stall on it.',
      '<b>Compiler gaps worked around by hand.</b> Each manual workaround is a compiler issue that belongs in the feedback loop, not a private fix in one partner’s port.',
      '<b>Comparison against a weak incumbent set-up.</b> A battery-life estimate that beats the partner’s part at a poor operating point is disproven the day they measure it.',
    ],
    roles: [
      { r: 'Field applications engineer', d: 'Owns onboarding and the partner reviews' },
      { r: 'Compiler engineer', d: 'Supports ports that hit compiler limits' },
      { r: 'Applications engineer', d: 'Energy and battery-life estimates' },
      { r: 'Developer platform lead', d: 'Playground access and partner accounts' },
      { r: 'Product manager', d: 'Approves the onboarding record' },
    ],
    effort: [
      ['Playground and compiler onboarding', 1.5],
      ['Workload porting support', 4],
      ['Energy and battery-life estimates', 2],
      ['Partner technical reviews', 2],
      ['Onboarding record', 0.5],
    ],
    entry: [
      'Agreements signed in EAP-02',
      'Playground launched to partners from VP-05',
      'Compiler Alpha released in CMP-07',
    ],
    exit: [
      'Each partner’s workload compiling and running on the Playground',
      'Energy and battery-life estimates issued with their model bounds',
      'Every compiler and SDK gap found logged in the feedback tracker',
    ],
    dependsOn: ['EAP-02', 'VP-05', 'CMP-07', 'VP-04'],
    dependsNote:
      'Onboarding starts at the Playground launch; partners on workloads that need the ML import path start later if CMP-05 is still closing in the alpha.',
    feedsInto: ['EAP-04', 'EAP-05', 'SDK-04'],
    measuredBy: [
      'Partner workloads running on the Playground against partners signed',
      'Weeks from agreement to first compiled workload',
      'Partners holding a technical review in the last month',
    ],
    links: {
      dependsOn: ['EAP-02', 'VP-05', 'CMP-07'],
      feedsInto: ['EAP-04', 'EAP-05'],
      runsWith: [],
      revisedBy: ['VP-04', 'CMP-05'],
      feedsBackInto: ['SDK-04'],
    },
    terms: ['FAE', 'LiteRT', 'ONNX', 'MCU'],
  },
  'EAP-04': {
    criticalPath: false,
    purpose: [
      'Route every partner issue into the product that can fix it — <b>compiler, SDK, silicon errata or documentation</b> — feed the priorities into the release plans, and tell each partner what happened to what they reported.',
      'Feedback collected and never acted on is worse than none: partners stop reporting, and the product ships with the problems its first customers already found. This loop runs from the first onboarded workload to the design-win, and its closure rate is the programme’s credibility with the partners.',
    ],
    flowNote:
      'Step 1 captures every issue in one tracker, and step 2 triages each into its product area. Step 3 feeds priorities into the release plans alongside triage, continuously rather than in batches, because the compiler and SDK release on their own cadence; step 4 reports closure to each partner and step 5 issues the log.',
    consumes: [
      'Partner issues from pre-silicon onboarding in EAP-03',
      'Signed agreements with feedback rights from EAP-02',
      'Compiler architecture and release plan from CMP-01',
      'Errata list with workarounds from EBU-07',
      'First power-on reports from partners in EAP-05',
    ],
    rel: {
      'EAP-D5':
        '<b>Customer feedback log into compiler, SDK and silicon.</b> Every partner issue is captured, triaged, prioritised, closed back to the partner and logged here.',
    },
    risks: [
      '<b>Feedback not reaching the release plans.</b> Issues triaged into a list nobody on the compiler or SDK team reads are collected, not acted on.',
      '<b>Silicon issues discovered by partners first.</b> An erratum a partner finds before EBU-07 lists it must go into the errata, with a workaround, the same week.',
      '<b>One partner’s priorities become the roadmap.</b> The loudest partner is not always the representative one, and triage must weigh issues across accounts.',
      '<b>Closure never reported back.</b> A partner who hears nothing after reporting stops reporting, and the loop goes quiet before the design-win.',
      '<b>Partner code in the public tracker.</b> Issues arrive with confidential source attached, and the tracker must keep each partner’s material to their own account.',
    ],
    roles: [
      { r: 'Product manager', d: 'Owns the tracker, triage and the feedback log' },
      { r: 'Compiler architect', d: 'Compiler priorities from partner issues' },
      { r: 'Firmware lead', d: 'SDK and HAL priorities from partner issues' },
      { r: 'Product engineering', d: 'Silicon issues into the errata list' },
      { r: 'Software director', d: 'Approves the priorities in the release plans' },
    ],
    effort: [
      ['Issue capture and tracker', 1],
      ['Triage by product area', 2],
      ['Release plan priorities', 1.75],
      ['Closure reports to partners', 1],
      ['Feedback log', 0.25],
    ],
    entry: [
      'Agreements signed with feedback rights in EAP-02',
      'First partners onboarded in EAP-03',
      'Tracker set up with per-partner confidentiality',
    ],
    exit: [
      'Every partner issue triaged to an owning product area',
      'Priorities reflected in the compiler and SDK release plans',
      'Closure reported to the partner for every resolved issue',
    ],
    dependsOn: ['EAP-03', 'EAP-02'],
    dependsNote: null,
    feedsInto: ['CREL-02', 'CREL-03', 'SDK-04', 'SDK-05', 'EBU-07', 'EMP-11'],
    measuredBy: [
      'Partner issues closed against issues reported',
      'Median days from report to triage',
      'Partner-reported issues fixed in the 1.0 release',
    ],
    links: {
      dependsOn: ['EAP-02', 'EAP-03'],
      feedsInto: ['CREL-02', 'CREL-03', 'SDK-04', 'SDK-05'],
      runsWith: [],
      revisedBy: ['EAP-05', 'EAP-06'],
      feedsBackInto: ['EBU-07', 'EMP-11'],
    },
    terms: ['SDK', 'HAL', 'FAE'],
  },
  'EAP-05': {
    criticalPath: true,
    purpose: [
      'Put <b>engineering samples and EVT boards on each partner’s desk with the SDK Beta and the errata</b>, support the first power-on, and record who holds which units.',
      'This is the moment pre-silicon work is either confirmed or not. A partner who powers up a board, runs the workload they ported on the Playground and measures its energy is a design-in in progress; one who receives a box without errata or a contact is a support case.',
    ],
    flowNote:
      'Step 1 allocates the units, and step 2 ships them with the SDK Beta and the errata. Step 3 supports first power-on alongside the shipments, since each partner powers up as their box arrives rather than all together, and step 4 records which partner holds which units.',
    consumes: [
      'Unit allocation plan and record from EASSY-05',
      'EVT boards built with engineering samples from EVK-05',
      'SDK Beta validated on first silicon from SDK-06',
      'Customer sample release package from EBU-10',
      'Errata list with workarounds from EBU-07',
    ],
    rel: {
      'EAP-D4':
        '<b>Engineering samples and EVT boards seeded to partners.</b> The units are allocated, shipped, powered on and registered here.',
    },
    risks: [
      '<b>Samples shipped without errata or a contact.</b> The first thing a partner hits is either documented or a support case, and the errata list decides which.',
      '<b>More units promised than the first lot yields.</b> Agreements must yield to the allocation in EASSY-05, and the shortfall must be told to partners before the ship date.',
      '<b>First power-on unsupported.</b> Design-in support staffed by the engineers doing bring-up means partners wait while the lab has priority.',
      '<b>Boards shipped before EVT validation.</b> A partner who finds an EVT board fault reports it as a silicon problem, and trust suffers either way.',
      '<b>No register of who holds what.</b> Without it, a unit recall for an erratum or a board fix reaches only some of the affected partners.',
    ],
    roles: [
      { r: 'Field applications engineer', d: 'Owns the seeding and first power-on support' },
      { r: 'Program manager', d: 'Unit allocation against the first lot' },
      { r: 'Logistics coordinator', d: 'Shipments, export control and tracking' },
      { r: 'Bring-up engineer', d: 'Escalations from partner power-on' },
      { r: 'Product manager', d: 'Approves the seeding plan' },
    ],
    effort: [
      ['Unit allocation', 0.5],
      ['Shipment with SDK Beta and errata', 0.75],
      ['First power-on support', 1.5],
      ['Partner unit register', 0.25],
    ],
    entry: [
      'Units allocated to partners in EASSY-05',
      'Customer sample release package approved in EBU-10',
      'SDK Beta released in SDK-06',
    ],
    exit: [
      'Every partner powered on and running their ported workload',
      'Each shipment accompanied by the SDK Beta, the errata and a named contact',
      'Register of units per partner complete and current',
    ],
    dependsOn: ['EASSY-05', 'EVK-05', 'SDK-06', 'EBU-10', 'EVKL-01'],
    dependsNote:
      'Allocation starts at week 100, but shipment waits on the SDK Beta from SDK-06 at week 104 and the sample release package from EBU-10 at week 110; EVT boards go out once EVKL-01 has validated them.',
    feedsInto: ['EAP-06', 'EAP-04'],
    measuredBy: [
      'Partners powered on within two weeks of receipt',
      'Units shipped against units allocated',
      'Partner issues from first power-on found in the errata already',
    ],
    links: {
      dependsOn: ['EASSY-05', 'EVK-05', 'SDK-06', 'EBU-10'],
      feedsInto: ['EAP-06'],
      runsWith: ['EVKL-01'],
      revisedBy: ['EBU-07'],
      feedsBackInto: ['EAP-04'],
    },
    terms: ['EVT', 'EVK', 'SDK', 'FAE'],
  },
  'EAP-06': {
    criticalPath: true,
    purpose: [
      'Support each partner’s design from schematic to production intent, agree forecasts and production pricing, and <b>record the first design-win as the part reaches mass production</b>.',
      'A design-win is a customer committing a product to the part, with a forecast behind it. It is the programme’s proof that the architecture sells, and it lands with mass production because no customer commits volume to a part that has not qualified.',
    ],
    flowNote:
      'Step 1 reviews each partner’s schematic and firmware, and step 2 supports their prototypes through to production intent. Step 3 agrees forecasts and production pricing alongside the prototype work, because commercial terms run on their own calendar, and step 4 records the first design-win.',
    consumes: [
      'Partner units and first power-on results from EAP-05',
      'Compiler and SDK 1.0 GA release from CREL-05',
      'Datasheet and product documentation from EMP-11',
      'Ramp plan and supply commitment from EMP-08',
      'Product cost and margin model from EDEF-06',
    ],
    rel: {
      'EAP-D6':
        '<b>Design-in support record and first design-win.</b> The design reviews, prototype support and commercial terms are recorded and the first design-win declared here.',
    },
    risks: [
      '<b>No design-win at mass production.</b> A part that qualifies with no customer committed is inventory, and the programme’s case rests on this one record.',
      '<b>Schematic reviewed without the datasheet limits.</b> A partner design built on preliminary figures fails at the limits EMP-11 finally publishes.',
      '<b>Firmware still on the beta.</b> A partner going to production on a pre-GA compiler has no LTS path, and must be moved to 1.0 before they freeze.',
      '<b>Forecast accepted without capacity.</b> A committed volume the ramp plan in EMP-08 cannot supply turns the first design-win into the first missed delivery.',
      '<b>Pricing set without the cost model.</b> Production pricing agreed to win the socket must still clear the margin in EDEF-06.',
    ],
    roles: [
      { r: 'Field applications engineer', d: 'Owns design-in support per partner' },
      { r: 'Sales director', d: 'Forecasts, pricing and the design-win commitment' },
      { r: 'Applications engineer', d: 'Schematic and firmware reviews' },
      { r: 'Operations manager', d: 'Forecast against the ramp and supply plan' },
      { r: 'General manager', d: 'Approves production pricing and declares the design-win' },
    ],
    effort: [
      ['Schematic and firmware reviews', 2],
      ['Prototype support to production intent', 3.5],
      ['Forecasts and production pricing', 2],
      ['Design-win record', 0.5],
    ],
    entry: [
      'Partners powered on with units from EAP-05',
      'Compiler and SDK 1.0 GA released in CREL-05',
      'Datasheet limits available from EMP-11',
    ],
    exit: [
      'Partner designs reviewed against the published datasheet limits',
      'Forecast agreed and matched to the ramp plan',
      'First design-win recorded with a production commitment',
    ],
    dependsOn: ['EAP-05', 'CREL-05', 'EMP-11', 'EMP-08', 'EVKL-05'],
    dependsNote: null,
    feedsInto: ['EMP-08', 'EAP-04'],
    measuredBy: [
      'Design-wins at mass production against the charter target',
      'Partner designs reaching production intent',
      'Committed forecast volume against the ramp plan',
    ],
    links: {
      dependsOn: ['EAP-05', 'CREL-05', 'EMP-11'],
      feedsInto: [],
      runsWith: ['EMP-08', 'EVKL-05'],
      revisedBy: ['EDEF-06'],
      feedsBackInto: ['EMP-08', 'EAP-04'],
    },
    terms: ['FAE', 'LTS', 'SDK', 'ASP'],
  },
};
