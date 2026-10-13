/**
 * UGA — General Availability Release, written up.
 */
import type { UcieWriteUps } from '../types';

export const UGA_WRITE_UPS: UcieWriteUps = {
  'UGA-01': {
    criticalPath: true,
    purpose: [
      'Roll the <b>silicon results up against the datasheet</b>: gather the characterization, compliance and reliability results with their test conditions and sample counts, map each to the datasheet parameter and the pre-silicon prediction it replaces, and agree for every parameter that missed its target whether the datasheet changes, an erratum is written or a fix is planned.',
      'Silicon validation produces hundreds of measurements in three stages’ reports; the release needs one answer per datasheet parameter. The rollup is that join, and it is where a missed target becomes a deliberate decision rather than a number nobody carried across.',
    ],
    flowNote:
      'Step 1 gathers the results and step 2 maps them to parameters and predictions. Step 3 dispositions the misses and step 4 releases the rollup.',
    consumes: [
      'Characterization report from UCHR-10',
      'Measurement-to-simulation correlation from UCHR-09',
      'Compliance results from UCMP-05',
      'Reliability report from URLQ-05',
      'v0.9 datasheet and release record from UPRE-08',
    ],
    rel: {
      'UGA-D1': '<b>Silicon data rollup — measured results mapped to every datasheet parameter and prediction.</b> Produced here.',
      'UGA-D2': '<b>Silicon report and characterization summary for licensees.</b> The rollup is the data the report summarizes.',
    },
    risks: [
      '<b>Parameters unmapped.</b> Some datasheet parameters have no measurement and keep their pre-silicon value silently.',
      '<b>Conditions lost.</b> Results are quoted without the voltage, temperature and channel they were taken at.',
      '<b>Misses argued away.</b> A parameter that missed target is redefined rather than dispositioned.',
      '<b>Late results.</b> Reliability or compliance data arrives after the rollup closes.',
      '<b>Small samples.</b> A parameter is quoted from a handful of parts as if it were a distribution.',
    ],
    roles: [
      { r: 'Customer engineering', d: 'Owns the rollup and its mapping to the datasheet' },
      { r: 'Validation lead', d: 'Characterization results and conditions' },
      { r: 'Compliance engineer', d: 'Compliance and interoperability results' },
      { r: 'Reliability engineer', d: 'Reliability results' },
      { r: 'Product manager', d: 'Decides datasheet changes for missed targets' },
    ],
    effort: [
      ['Result collection', 1],
      ['Parameter mapping', 1.5],
      ['Miss disposition', 1],
      ['Release', 0.5],
    ],
    entry: [
      'Characterization report reviewed in UCHR-10',
      'Compliance and reliability results drafted in UCMP-05 and URLQ-05',
      'v0.9 datasheet available from UPRE-08',
    ],
    exit: [
      'Every datasheet parameter mapped to a measurement or marked as not measured',
      'Every missed target dispositioned as a datasheet change, an erratum or a planned fix',
      'Rollup released to documentation and the silicon report',
    ],
    dependsOn: ['UCHR-10', 'UCMP-05', 'URLQ-05', 'UPRE-08'],
    dependsNote: 'The rollup starts on the characterization report and takes compliance and reliability results as they close.',
    feedsInto: ['UGA-02', 'UGA-03'],
    measuredBy: [
      'Datasheet parameters with measured data',
      'Missed targets and their disposition',
      'Days from the last silicon result to rollup release',
    ],
    links: {
      dependsOn: ['UCHR-10', 'UCHR-09', 'UCMP-05', 'URLQ-05', 'UPRE-08'],
      feedsInto: ['UGA-02', 'UGA-03', 'UGA-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['GA', 'Eye margin', 'BER', 'Energy per bit'],
  },
  'UGA-02': {
    criticalPath: false,
    purpose: [
      'Write the <b>silicon report licensees read</b>: eye margin, BER, energy per bit and PVT shmoo across lanes and corners; lane repair, lane reversal, runtime recalibration and low-power behavior on silicon; compliance, interoperability and reliability; and the measurement-to-simulation correlation with a description of the test vehicle channel the data was taken on.',
      'Licensees decide whether to commit a production SoC on this report. It has to show distributions rather than best lanes, and it has to say what channel produced the data, because a customer’s bridge or interposer will not be the test vehicle’s.',
    ],
    flowNote:
      'Step 1 summarizes electrical performance while step 2 summarizes link features in parallel. Step 3 adds compliance, interoperability and reliability, step 4 the correlation and channel description, and step 5 releases the report.',
    consumes: [
      'Silicon data rollup from UGA-01',
      'Characterization report from UCHR-10',
      'Measurement-to-simulation correlation from UCHR-09',
      'Compliance results from UCMP-05',
      'Reliability report from URLQ-05',
    ],
    rel: {
      'UGA-D2': '<b>Silicon report and characterization summary for licensees.</b> Produced here.',
      'UGA-D3': '<b>GA release package — views, models and documents updated to silicon.</b> The silicon report is part of the GA package.',
    },
    risks: [
      '<b>Best-lane reporting.</b> Margins are quoted from the best lane or part rather than the distribution.',
      '<b>Channel undefined.</b> Results are shown without the test vehicle channel they depend on.',
      '<b>Correlation omitted.</b> Licensees cannot tell how far to trust the models for their own channels.',
      '<b>Feature behavior missing.</b> Lane repair and recalibration behavior are not shown, only data rate results.',
      '<b>Report and rollup disagree.</b> Numbers are copied by hand and drift from the rollup.',
    ],
    roles: [
      { r: 'Validation', d: 'Owns the silicon report' },
      { r: 'Customer engineer', d: 'Shapes the report for licensees' },
      { r: 'SI/PI engineer', d: 'Test vehicle channel description and correlation' },
      { r: 'Mixed-signal verification engineer', d: 'Measurement-to-simulation correlation' },
      { r: 'Quality engineer', d: 'Report review and release' },
    ],
    effort: [
      ['Electrical performance summary', 2],
      ['Link feature summary', 1],
      ['Compliance and reliability summary', 1],
      ['Correlation and channel', 1],
      ['Review and release', 1],
    ],
    entry: [
      'Silicon data rollup in progress in UGA-01',
      'Characterization report reviewed in UCHR-10',
      'Correlation results available from UCHR-09',
    ],
    exit: [
      'Every electrical result shown as a distribution across lanes, parts and corners',
      'Test vehicle channel described with its measured loss and crosstalk',
      'Report numbers generated from the rollup data with no hand-copied values',
    ],
    dependsOn: ['UGA-01', 'UCHR-10', 'UCHR-09'],
    dependsNote: null,
    feedsInto: ['UGA-03', 'UGA-05'],
    measuredBy: [
      'Report sections complete',
      'Results shown as distributions',
      'Review findings open',
    ],
    links: {
      dependsOn: ['UGA-01', 'UCHR-10', 'UCHR-09', 'UCMP-05', 'URLQ-05'],
      feedsInto: ['UGA-03', 'UGA-04', 'UGA-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Silicon report', 'Eye margin', 'BER', 'Lane repair', 'Lane reversal', 'Runtime recalibration', 'Test vehicle'],
  },
  'UGA-03': {
    criticalPath: true,
    purpose: [
      'Build the <b>GA release package</b>: the datasheet, integration guide and application notes updated to measured silicon; timing, power and channel models updated where silicon correlation moved them; every fix and ECO released to customers since v0.9 folded in; and the package rebuilt with GA version tags against the final deliverable checklist.',
      'GA is the package licensees will tape out production silicon against, possibly years later. It must contain everything any one customer received as a patch since v0.9, so the GA baseline is the same for everyone.',
    ],
    flowNote:
      'Step 1 updates the documents while step 2 updates the models in parallel. Step 3 folds in post-v0.9 fixes, step 4 rebuilds and tags the package and step 5 hands it to release QA.',
    consumes: [
      'Silicon data rollup from UGA-01',
      'Silicon report from UGA-02',
      'v0.9 release package and decision from UPRE-08',
      'Customer fixes and ECOs since v0.9 from UCUS-04',
      'v0.9 integration guide and application notes from UPRE-06',
    ],
    rel: {
      'UGA-D3': '<b>GA release package — views, models and documents updated to silicon.</b> Produced here.',
      'UGA-D4': '<b>GA release QA record, release notes and errata.</b> The rebuilt package is what GA QA checks.',
    },
    risks: [
      '<b>Patches left out.</b> A fix released to one customer after v0.9 is missing from GA.',
      '<b>Models frozen at v0.9.</b> Silicon correlation moved a model and the release keeps the old one.',
      '<b>Documents half-updated.</b> The datasheet changes but the integration guide still quotes pre-silicon values.',
      '<b>Tagging error.</b> A file keeps its v0.9 tag and customers cannot tell which version they hold.',
      '<b>Scope creep.</b> New features are added at GA without the QA and silicon evidence the rest has.',
    ],
    roles: [
      { r: 'Technical documentation', d: 'Owns the GA release package' },
      { r: 'SI/PI engineer', d: 'Channel model updates' },
      { r: 'Customer engineer', d: 'Post-v0.9 fixes and ECO list' },
      { r: 'Physical design engineer', d: 'View updates for any ECO' },
      { r: 'CAD engineer', d: 'Package rebuild and version tagging' },
    ],
    effort: [
      ['Document updates', 2.5],
      ['Model updates', 2],
      ['Fix and ECO merge', 2],
      ['Package rebuild and handoff', 1.5],
    ],
    entry: [
      'Silicon data rollup released from UGA-01',
      'Post-v0.9 fix and ECO list current in UCUS-04',
      'Final deliverable checklist from the release definition',
    ],
    exit: [
      'Every fix and ECO released since v0.9 present in the GA package',
      'Every document value that silicon measured updated to the measured value',
      'Every file in the package carries the GA version tag',
    ],
    dependsOn: ['UGA-01', 'UGA-02', 'UPRE-08', 'UCUS-04'],
    dependsNote: null,
    feedsInto: ['UGA-04'],
    measuredBy: [
      'Post-v0.9 fixes merged against released',
      'Document values updated to silicon',
      'Files carrying the GA tag',
    ],
    links: {
      dependsOn: ['UGA-01', 'UGA-02', 'UPRE-08', 'UCUS-04', 'UPRE-06'],
      feedsInto: ['UGA-04', 'UGA-05', 'UCUS-03'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Release package', 'GA', 'ECO', 'IBIS-AMI', 'Integration guide'],
  },
  'UGA-04': {
    criticalPath: true,
    purpose: [
      'Run <b>release QA on the GA package</b> with the same checklist and sanity flows as v0.9, re-run on every view and model whether or not it changed, write the GA release notes and the errata with their workarounds, and close or waive every finding with its customer impact.',
      'A GA package is mostly unchanged files with a few critical updates, which is exactly when a stale file slips through. Re-running every sanity flow, not only on changed files, is what keeps the GA baseline trustworthy.',
    ],
    flowNote:
      'Step 1 runs the checklist while step 2 re-runs the sanity flows in parallel. Step 3 writes the release notes and errata and step 4 closes or waives the findings.',
    consumes: [
      'GA release package from UGA-03',
      'Silicon report from UGA-02',
      'Release QA procedure and v0.9 QA record from UPRE-07',
      'Errata and workarounds from customer issue handling',
      'Sanity flow environments',
    ],
    rel: {
      'UGA-D4': '<b>GA release QA record, release notes and errata.</b> Produced here.',
      'UGA-D5': '<b>GA approval decision record.</b> The QA record is an input to the GA decision.',
    },
    risks: [
      '<b>Changed files only.</b> Sanity flows are run on updated files and a broken unchanged one ships.',
      '<b>Errata incomplete.</b> Silicon issues known to customer engineering are not in the errata.',
      '<b>Workarounds untested.</b> Errata workarounds are written but never tried.',
      '<b>QA squeezed.</b> QA starts late because the package rebuild ran over.',
      '<b>Waivers without impact.</b> Findings are waived with no statement of what customers will see.',
    ],
    roles: [
      { r: 'Quality', d: 'Owns GA release QA' },
      { r: 'CAD engineer', d: 'Sanity flow execution' },
      { r: 'Customer engineer', d: 'Errata and workarounds' },
      { r: 'Technical writer', d: 'GA release notes' },
      { r: 'Validation engineer', d: 'Confirms errata against silicon' },
    ],
    effort: [
      ['Checklist QA', 1],
      ['Sanity flows', 1],
      ['Release notes and errata', 0.5],
      ['Finding closure', 0.5],
    ],
    entry: [
      'GA package handed over from UGA-03',
      'QA procedure from UPRE-07 in force',
      'Errata list current',
    ],
    exit: [
      'Every view and model passes its sanity flow',
      'Every known silicon issue listed in the errata with a tested workaround or a stated none',
      'Every QA finding closed or waived with a customer impact statement',
    ],
    dependsOn: ['UGA-03', 'UGA-02', 'UPRE-07'],
    dependsNote: null,
    feedsInto: ['UGA-05'],
    measuredBy: [
      'QA findings found and closed',
      'Errata with tested workarounds',
      'Sanity flows passed',
    ],
    links: {
      dependsOn: ['UGA-03', 'UGA-02', 'UPRE-07'],
      feedsInto: ['UGA-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Release notes', 'Errata', 'Release package'],
  },
  'UGA-05': {
    criticalPath: true,
    purpose: [
      'Decide <b>general availability</b>: review the silicon-proven verdict, the characterization report, the compliance results and the GA QA record against the GA criteria, review the open errata and customer issues with their workarounds, record the decision with any conditions, and publish the GA package to every licensee.',
      'GA tells licensees the IP is fit for production silicon. It is taken on three independent results — characterization, compliance and reliability — and the release QA, so that no one result can carry the decision alone.',
    ],
    flowNote:
      'Step 1 reviews the evidence against the GA criteria and step 2 the open errata and issues. Step 3 decides and step 4 publishes.',
    consumes: [
      'Characterization report from UCHR-10',
      'Compliance results review from UCMP-05',
      'Silicon-proven decision from URLQ-06',
      'GA release QA record and errata from UGA-04',
      'Silicon data rollup from UGA-01',
    ],
    rel: {
      'UGA-D5': '<b>GA approval decision record.</b> Produced here; it closes the IP GA gate.',
    },
    risks: [
      '<b>Decided on one result.</b> GA is declared on characterization alone with compliance or reliability open.',
      '<b>Conditions unstated.</b> GA is granted with restrictions nobody writes down.',
      '<b>Open issues ignored.</b> A severe customer issue is open at GA without a workaround.',
      '<b>Criteria moved.</b> The GA criteria are relaxed in the review to fit the results.',
      '<b>Publication partial.</b> Some licensees are not notified of GA.',
    ],
    roles: [
      { r: 'Program management', d: 'Owns the GA decision review' },
      { r: 'Product manager', d: 'Approves GA and its conditions' },
      { r: 'Quality manager', d: 'Presents silicon-proven status and QA' },
      { r: 'Validation lead', d: 'Presents characterization and compliance' },
      { r: 'Customer engineering lead', d: 'Presents open issues and publishes the release' },
    ],
    effort: [
      ['Evidence review', 0.5],
      ['Errata and issue review', 0.5],
      ['Decision', 0.5],
      ['Publication', 0.5],
    ],
    entry: [
      'Silicon-proven decision recorded in URLQ-06',
      'Compliance results reviewed in UCMP-05',
      'GA QA record complete from UGA-04',
    ],
    exit: [
      'Characterization, compliance and reliability each recorded as passed against the GA criteria',
      'GA decision recorded with any conditions and the open errata it accepts',
      'GA package published to every licensee',
    ],
    dependsOn: ['UCHR-10', 'UCMP-05', 'URLQ-06', 'UGA-04'],
    dependsNote: 'GA consumes all three silicon validation results — characterization, compliance and the silicon-proven verdict — and cannot close before the last of them.',
    feedsInto: ['UCUS-05'],
    measuredBy: [
      'GA date against plan',
      'GA conditions recorded',
      'Licensees notified',
    ],
    links: {
      dependsOn: ['UCHR-10', 'UCMP-05', 'URLQ-06', 'UGA-04', 'UGA-01', 'UGA-02', 'UGA-03'],
      feedsInto: ['UCUS-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['GA', 'Errata', 'Compliance', 'Licensee'],
  },
};
