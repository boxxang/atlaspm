import type { ActivityWriteUp } from '../activityDetailTypes';

export const EVKL_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'EVKL-01': {
    criticalPath: true,
    purpose: [
      'Prove the EVT boards against their requirements now that real silicon sits on them, and turn what fails into <b>a DVT change list that is closed before the next build is ordered</b>.',
      'EVK-04 proved the board without silicon, which settles power, programming and most of the headers but not the thing the kit is sold on: whether the current sensing resolves a sleep current and an active burst on the same rail, with a real part drawing it. This is the first time that is measured, and anything found later costs a build.',
    ],
    flowNote:
      'Step 1 validates every interface against the requirements, and step 2 checks measurement accuracy across the current range on the same boards. Step 3 runs alongside step 2, because the SDK and example regression needs working interfaces rather than a finished accuracy study, and step 4 folds all three into the report and the change list.',
    consumes: [
      'EVT boards built with engineering samples from EVK-05',
      'EVK product requirements from EVK-01',
      'SDK Beta and its examples from SDK-06',
      'Errata list with workarounds from EBU-07',
      'Proto board verification results from EVK-04',
    ],
    rel: {
      'EVKL-D1':
        '<b>EVT validation report and DVT change list.</b> The EVT results are measured and the changes the DVT build must carry are listed and released here.',
    },
    risks: [
      '<b>Board faults and silicon errata confused.</b> A header that misbehaves may be the board or the part, and a change list written before the errata are read fixes the wrong one.',
      '<b>Accuracy checked only at mid-range.</b> The claim is sleep current, and a shunt and amplifier that read well at milliamps can be meaningless at the microamp end.',
      '<b>Regression run on the bring-up boards instead.</b> The EVK has its own pin mux, clocks and power paths, and examples that pass on the EVB can still fail on the kit.',
      '<b>Shield compatibility claimed, not tested.</b> Arduino UNO and MKR headers invite third-party shields, and a voltage or pin conflict found by a customer is a support case.',
      '<b>Change list left open-ended.</b> Every late addition moves the DVT build, and the DVT build is what the certification slot is booked against.',
    ],
    roles: [
      { r: 'Board design engineer', d: 'Owns the validation and the DVT change list' },
      { r: 'Measurement engineer', d: 'Current sensing accuracy across the range' },
      { r: 'SDK engineer', d: 'Runs the SDK and example regression on EVT' },
      { r: 'Bring-up engineer', d: 'Separates board faults from silicon errata' },
      { r: 'EVK product manager', d: 'Approves the change list against the requirements' },
    ],
    effort: [
      ['Interface validation', 0.75],
      ['Measurement accuracy study', 0.5],
      ['SDK and example regression', 0.5],
      ['Report and change list', 0.25],
    ],
    entry: [
      'EVT boards built and powered from EVK-05',
      'SDK Beta running on first silicon from SDK-06',
      'Reference instruments calibrated for the current range under test',
    ],
    exit: [
      'Every requirement in EVK-D1 marked pass, fail or waived',
      'Measurement accuracy stated at each current range, sleep included',
      'DVT change list agreed and closed to new entries',
    ],
    dependsOn: ['EVK-05', 'EVK-01', 'SDK-06', 'EBU-07'],
    dependsNote:
      'The SDK Beta and the errata arrive while EVT validation is already running; interface checks start on the boards the day they are built, and the regression waits for SDK-06.',
    feedsInto: ['EVKL-02', 'EAP-05', 'CREL-05'],
    measuredBy: [
      'Requirements passing on EVT against total',
      'Measured current error at the sleep range against the requirement',
      'Changes added to the DVT list after it was closed',
    ],
    links: {
      dependsOn: ['EVK-01', 'EVK-05', 'SDK-06'],
      feedsInto: ['EVKL-02', 'EAP-05', 'CREL-05'],
      runsWith: ['EBU-07'],
      revisedBy: ['EVK-04'],
      feedsBackInto: [],
    },
    terms: ['EVT', 'DVT', 'EVK', 'SDK'],
  },
  'EVKL-02': {
    criticalPath: true,
    purpose: [
      'Build the <b>DVT boards with every EVT change in them</b>, prove the fixes and the environmental margins, and find out early whether the kit will pass emissions.',
      'DVT is the last build where the design can change cheaply. The certification lab tests the DVT board, the production line builds from its files, and a fix that misses DVT either goes through the lab twice or ships as a rework instruction.',
    ],
    flowNote:
      'Step 1 builds the boards with the change list applied, and step 2 validates the fixes and the margins across temperature and supply. Step 3 runs alongside step 2 because an EMC pre-scan needs a built board, not a validated one, and its answer is needed before the accredited lab date; step 4 releases the report.',
    consumes: [
      'EVT validation report and DVT change list from EVKL-01',
      'EVK layout database from EVK-03',
      'Engineering samples allocated in EASSY-05',
      'EVK schematics and BOM from EVK-02',
      'Customer sample release package from EBU-10',
    ],
    rel: {
      'EVKL-D2':
        '<b>DVT boards, validated.</b> The boards are built with the EVT changes, validated and released here as the design certification and production will use.',
    },
    risks: [
      '<b>EMC pre-scan skipped to save a week.</b> A radiated emissions failure found at the accredited lab costs a slot, a fix and a rebooking that can run to weeks.',
      '<b>Samples for DVT not allocated.</b> The first lot is spoken for by bring-up, qualification and partners, and a DVT build short of parts validates too few boards to mean anything.',
      '<b>Margins tested at room temperature only.</b> Oscillators, regulators and the sensing amplifiers drift, and a kit that works on the bench can fail on a customer’s cold lab floor.',
      '<b>Fixes verified by inspection.</b> A change that was made is not the same as a change that works, and each item on the list needs a measurement against it.',
      '<b>Late changes slipped in without the list.</b> An untracked change on DVT is one the certification report and the production BOM do not know about.',
    ],
    roles: [
      { r: 'Board design engineer', d: 'Owns the DVT build and its validation' },
      { r: 'EMC engineer', d: 'Runs the pre-scan and reads it against the limits' },
      { r: 'PCB layout engineer', d: 'Implements the layout changes from the list' },
      { r: 'Contract manufacturer liaison', d: 'Builds the DVT lot and reports build issues' },
      { r: 'EVK product manager', d: 'Approves the DVT boards for certification' },
    ],
    effort: [
      ['DVT build with the changes', 0.75],
      ['Fix and margin validation', 1],
      ['EMC pre-scan', 0.5],
      ['DVT report', 0.25],
    ],
    entry: [
      'DVT change list closed in EVKL-01',
      'Layout changes released from the EVK-03 database',
      'Engineering samples allocated for the DVT lot',
    ],
    exit: [
      'Every change on the list verified by measurement on DVT',
      'Margins shown across temperature and the 1.8–5.5 V supply range',
      'EMC pre-scan passed or the failures fixed before the lab date',
    ],
    dependsOn: ['EVKL-01', 'EVK-03', 'EASSY-05'],
    dependsNote: null,
    feedsInto: ['EVKL-03', 'EVKL-04'],
    measuredBy: [
      'DVT change list items verified against total',
      'Pre-scan margin to the emissions limit',
      'DVT boards passing validation against boards built',
    ],
    links: {
      dependsOn: ['EVKL-01', 'EVK-03', 'EASSY-05'],
      feedsInto: ['EVKL-03', 'EVKL-04'],
      runsWith: [],
      revisedBy: ['EBU-10'],
      feedsBackInto: [],
    },
    terms: ['DVT', 'EMC', 'EVK', 'BOM'],
  },
  'EVKL-03': {
    criticalPath: true,
    purpose: [
      'Take the DVT board through <b>FCC, CE and UKCA with an accredited lab</b>, fix whatever fails, and file the declarations the kit needs to be sold in the United States, the EU and the UK.',
      'A distributor will not list an unmarked kit, and the certification is on the board, not the chip. The chip-level compliance in EMP-09 covers magnetic immunity and materials; this covers what the whole kit radiates and tolerates, with its USB cable and headers.',
    ],
    flowNote:
      'Step 1 books the lab, which in practice happened when the DVT build was scheduled, and step 2 runs the emissions and immunity tests. Step 3 fixes and retests any failures, step 4 files the FCC, CE and UKCA declarations on the passing results, and step 5 releases the record.',
    consumes: [
      'DVT boards, validated, from EVKL-02',
      'EMC pre-scan results from EVKL-02',
      'Magnetic immunity specification from MRAM-04',
      'Compliance certificates for the chip from EMP-09',
      'EVK product requirements with target markets from EVK-01',
    ],
    rel: {
      'EVKL-D3':
        '<b>EMC and safety certification — FCC, CE, UKCA.</b> The tests are run, the failures closed and the declarations filed here.',
    },
    risks: [
      '<b>Lab slot booked after DVT passes.</b> Accredited lab queues run weeks, and waiting for a clean board to book one puts the queue on the critical path.',
      '<b>Tested without the cable and shields customers use.</b> Emissions change with the USB cable and whatever is plugged into the headers, and the test set-up must be the documented configuration.',
      '<b>Immunity tested with the part asleep.</b> ESD and radiated immunity must be run in the active and sleep modes, because a wake event under disturbance is where a low-power part misbehaves.',
      '<b>Fix changes the board after the test.</b> A ferrite or layout change to pass emissions must reach the production BOM, or PVT builds a board that was never certified.',
      '<b>Declarations filed for fewer markets than the launch.</b> A kit certified for the US and EU cannot be shipped by a distributor into the UK without UKCA.',
    ],
    roles: [
      { r: 'Compliance engineer', d: 'Owns the certification plan and the declarations' },
      { r: 'Accredited test lab', d: 'Runs the emissions and immunity tests' },
      { r: 'EMC engineer', d: 'Diagnoses failures and designs the fixes' },
      { r: 'Board design engineer', d: 'Implements fixes on the board and BOM' },
      { r: 'Quality manager', d: 'Approves the declarations and the record' },
    ],
    effort: [
      ['Lab booking and test plan', 0.25],
      ['Emissions and immunity testing', 0.75],
      ['Fixes and retest', 0.5],
      ['Declarations and record', 0.5],
    ],
    entry: [
      'Accredited lab slot booked when the DVT build was scheduled',
      'DVT boards validated in EVKL-02 with a pre-scan result',
      'Test configuration agreed, including cable and operating modes',
    ],
    exit: [
      'Emissions and immunity passed in the documented configuration',
      'Every fix carried into the production BOM',
      'FCC, CE and UKCA declarations filed and on record',
    ],
    dependsOn: ['EVKL-02', 'EMP-09'],
    dependsNote: null,
    feedsInto: ['EVKL-04', 'EVKL-05'],
    measuredBy: [
      'Test passes at first attempt against total tests',
      'Weeks from DVT release to filed declarations',
      'Markets covered by a declaration against launch markets',
    ],
    links: {
      dependsOn: ['EVKL-02'],
      feedsInto: ['EVKL-04', 'EVKL-05'],
      runsWith: ['EMP-09'],
      revisedBy: ['MRAM-04'],
      feedsBackInto: [],
    },
    terms: ['FCC', 'CE marking', 'UKCA', 'EMC', 'ESD'],
  },
  'EVKL-04': {
    criticalPath: true,
    purpose: [
      'Build the <b>PVT lot on the production line with the production fixture</b>, prove the yield and the end-of-line test, and release the EVK to production.',
      'EVT and DVT were built by engineers who knew the board. PVT is built by the line that will build every kit a customer buys, from the released BOM, tested on the fixture the line will use, so it is the first time the yield means anything.',
    ],
    flowNote:
      'Step 1 releases the production BOM and the end-of-line test fixture, and step 2 builds the PVT lot on the production line. Step 3 runs alongside the build, verifying the yield and the fixture on each board as it comes off the line rather than after the lot, and step 4 releases the EVK to production.',
    consumes: [
      'DVT boards, validated, from EVKL-02',
      'Certification fixes carried into the BOM from EVKL-03',
      'Ramp plan and supply commitment from EMP-08',
      'EVK schematics and BOM from EVK-02',
      'Production test program release for the chip from EMP-07',
    ],
    rel: {
      'EVKL-D4':
        '<b>PVT build and production release.</b> The PVT lot is built, its yield and fixture proven and the EVK released to production here.',
    },
    risks: [
      '<b>Fixture designed after the PVT build.</b> Without the end-of-line fixture on the line, PVT proves assembly yield but not test yield, and the first production lot is the real PVT.',
      '<b>Processors for the kits not in the supply plan.</b> Mass production of the chip is later than the kit, so PVT and launch stock come from qualified lots that must be allocated in writing.',
      '<b>Fixture misses the current sensing.</b> A kit sold on measured energy must have its sensing calibrated or checked at end of line, or every unit ships with an unverified claim.',
      '<b>Long-lead parts ordered at PVT quantity only.</b> Launch stock needs the production quantity, and board parts on long lead times do not wait for the PVT result.',
      '<b>Certification fixes missing from the production BOM.</b> The line builds what the BOM says, and a change applied by hand at the lab is lost.',
    ],
    roles: [
      { r: 'Manufacturing engineer', d: 'Owns the PVT build and the production release' },
      { r: 'Test fixture engineer', d: 'Designs and qualifies the end-of-line fixture' },
      { r: 'Contract manufacturer', d: 'Builds the PVT lot on the production line' },
      { r: 'Supply chain manager', d: 'Processor allocation and long-lead parts' },
      { r: 'Quality engineer', d: 'Approves the PVT yield and the release' },
    ],
    effort: [
      ['Production BOM and fixture release', 0.75],
      ['PVT build on the production line', 0.75],
      ['Yield and end-of-line test verification', 0.75],
      ['Production release', 0.25],
    ],
    entry: [
      'DVT boards validated in EVKL-02',
      'Certification fixes in the released BOM',
      'Processors for the PVT lot allocated from qualified lots',
    ],
    exit: [
      'PVT yield at or above the production target',
      'Every PVT board tested on the end-of-line fixture, sensing included',
      'EVK released to production with launch stock on order',
    ],
    dependsOn: ['EVKL-02', 'EVKL-03', 'EMP-08'],
    dependsNote:
      'PVT starts before certification closes, on the understanding that any EVKL-03 fix is a BOM change the line can absorb; a layout change found at the lab would reset the build.',
    feedsInto: ['EVKL-05'],
    measuredBy: [
      'PVT build yield against target',
      'End-of-line test escapes found in launch stock',
      'Fixture test time per board against the line plan',
    ],
    links: {
      dependsOn: ['EVKL-02', 'EMP-08'],
      feedsInto: ['EVKL-05'],
      runsWith: ['EVKL-03'],
      revisedBy: ['EMP-07'],
      feedsBackInto: [],
    },
    terms: ['PVT (build)', 'EVK', 'BOM', 'PCB'],
  },
  'EVKL-05': {
    criticalPath: true,
    purpose: [
      'Put the kit <b>in a distributor’s catalogue with the software, documentation and field engineers behind it</b>: pricing, channel, box contents, product pages, and trained FAEs on the day it goes on sale.',
      'The EVK is the first thing most customers ever touch, and a kit launched on a compiler still in beta turns every first impression into a support case. That is why EVK GA follows Compiler and SDK 1.0 GA in CREL-05, rather than racing it.',
    ],
    flowNote:
      'Step 1 sets pricing and the distribution channel, since distributor stocking lead time sets everything else, and step 2 prepares the box contents, quick-start card and product pages. Step 3 trains the FAEs alongside step 2, because they need the kit and the pages rather than the launch, and step 4 launches.',
    consumes: [
      'PVT build and production release from EVKL-04',
      'FCC, CE and UKCA declarations from EVKL-03',
      'Compiler and SDK 1.0 GA release from CREL-05',
      'Published benchmark and energy results from CREL-04',
      'Datasheet and product documentation from EMP-11',
    ],
    rel: {
      'EVKL-D5':
        '<b>EVK launch package — distribution, product pages, documentation.</b> The pricing, channel, box contents, pages and trained FAEs are assembled and the kit launched here.',
    },
    risks: [
      '<b>Launch ahead of software GA.</b> A kit whose quick-start installs a beta compiler is judged on the beta, and the first reviews set the architecture’s reputation.',
      '<b>Distributor stock not aligned to the date.</b> A launch with no stock on the shelf, or stock with no launch, both waste the one announcement the kit gets.',
      '<b>Energy claims on the product page not from silicon.</b> Every number on the page must trace to CREL-D3, or the first customer with a current probe disproves it.',
      '<b>FAEs trained on slides, not the kit.</b> The first support calls are about installation and measurement, and only engineers who have done both can answer them.',
      '<b>Quick-start that assumes the Playground account.</b> Out of the box, a customer must reach a measured energy number on their own desk with no prior sign-up.',
    ],
    roles: [
      { r: 'EVK product manager', d: 'Owns pricing, channel and the launch' },
      { r: 'Distribution manager', d: 'Stocking, listing and lead times with distributors' },
      { r: 'Technical writer', d: 'Quick-start card, user guide and product pages' },
      { r: 'FAE lead', d: 'Trains the field engineers on the kit' },
      { r: 'Marketing director', d: 'Approves the launch and the claims made in it' },
    ],
    effort: [
      ['Pricing and distribution channel', 0.5],
      ['Box contents and quick-start', 0.5],
      ['Product pages and documentation', 0.5],
      ['FAE training and launch', 0.5],
    ],
    entry: [
      'EVK released to production in EVKL-04',
      'Certification declarations filed in EVKL-03',
      'Compiler and SDK 1.0 GA released in CREL-05',
    ],
    exit: [
      'Kit listed and in stock at the launch distributors',
      'Every claim on the product pages traced to silicon results',
      'FAEs trained hands-on with the production kit',
    ],
    dependsOn: ['EVKL-04', 'EVKL-03', 'CREL-05', 'CREL-04'],
    dependsNote:
      'CREL-05 releases 1.0 at week 116, the same week this activity starts; launch preparation runs on the release candidate, and the launch itself does not go ahead on anything short of GA.',
    feedsInto: ['EAP-06'],
    measuredBy: [
      'Weeks between Compiler and SDK 1.0 GA and EVK GA',
      'Units in distributor stock on launch day against the plan',
      'Time from unboxing to a first measured energy number',
    ],
    links: {
      dependsOn: ['EVKL-03', 'EVKL-04', 'CREL-05'],
      feedsInto: ['EAP-06'],
      runsWith: ['EMP-11'],
      revisedBy: ['CREL-04'],
      feedsBackInto: [],
    },
    terms: ['EVK', 'FAE', 'SDK', 'PVT (build)'],
  },
};
