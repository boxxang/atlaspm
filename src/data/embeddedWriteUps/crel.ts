import type { ActivityWriteUp } from '../activityDetailTypes';

export const CREL_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'CREL-01': {
    criticalPath: false,
    purpose: [
      'Measure cycles and energy per code region on silicon, compare them with what the simulator, the energy profiler and the lifetime modeller predicted, and <b>recalibrate every model customers have been planning with</b>.',
      'Since the Playground opened, partners have sized batteries and chosen operating points from pre-silicon numbers. The correlation plan in FCD-05 set the accuracy bounds those numbers were promised to; this is where silicon says whether they held, and where the Playground stops quoting a model that has not been checked.',
    ],
    flowNote:
      'Step 1 plans the workloads and the measurement set-up, step 2 measures on silicon, and step 3 compares region by region. Step 4 recalibrates the models alongside the comparison, because each region that disagrees is corrected as it is understood rather than after the full set, and step 5 issues the report.',
    consumes: [
      'Cycle and energy model with correlation plan from FCD-05',
      'Functional and cycle-level simulator from CMP-03',
      'Energy profiler and lifetime modeller from VP-04',
      'Characterisation data with active and sleep current from EBU-06',
      'Embedded workload suite and energy baselines from FCD-01',
    ],
    rel: {
      'CREL-D1':
        '<b>Silicon correlation report — cycles, energy, lifetime.</b> The measurements, the comparison and the recalibrated models are reported here.',
    },
    risks: [
      '<b>Measured on the bring-up board’s supply path.</b> The EVB rails and sense resistors differ from the EVK’s, and a correlation made on one does not transfer to the numbers customers will measure on the other.',
      '<b>Energy compared at one operating point.</b> Performance, efficiency, sleep and deep-sleep modes each have their own error, and a model accurate in one mode can be badly wrong in deep sleep.',
      '<b>Only whole-workload totals compared.</b> A total can agree while regions cancel, so the comparison must be per code region or the scheduler tuning in CREL-02 has nothing to aim at.',
      '<b>Models recalibrated but claims not revisited.</b> Every pre-silicon number already given to partners or printed must be checked against the new models.',
      '<b>Silicon from one corner lot.</b> Engineering samples may sit at one process corner, and a model fitted to them alone mispredicts the distribution customers receive.',
    ],
    roles: [
      { r: 'Performance architect', d: 'Owns the correlation and the recalibrated models' },
      { r: 'Measurement engineer', d: 'Energy measurement set-up and its accuracy' },
      { r: 'Simulation engineer', d: 'Simulator recalibration from the silicon data' },
      { r: 'Tools engineer', d: 'Energy profiler and lifetime modeller updates' },
      { r: 'Chief architect', d: 'Approves the report against the accuracy bounds' },
    ],
    effort: [
      ['Correlation plan and set-up', 0.5],
      ['Silicon measurement', 1.5],
      ['Model comparison', 1],
      ['Recalibration and report', 1],
    ],
    entry: [
      'Silicon booting with the workload suite in EBU-04',
      'Measurement set-up accurate to the sleep current range',
      'Accuracy bounds from FCD-05 agreed as the pass criteria',
    ],
    exit: [
      'Cycle and energy error per code region within the stated bounds, or explained',
      'Simulator, energy profiler and lifetime modeller recalibrated and released',
      'Pre-silicon claims already given out listed and rechecked',
    ],
    dependsOn: ['FCD-05', 'EBU-04', 'EBU-06', 'VP-04'],
    dependsNote: null,
    feedsInto: ['CREL-02', 'CREL-04', 'VP-04'],
    measuredBy: [
      'Cycle error per code region against the stated bound',
      'Energy error per operating mode against the stated bound',
      'Lifetime prediction error on the reference battery workloads',
    ],
    links: {
      dependsOn: ['FCD-05', 'EBU-04', 'EBU-06'],
      feedsInto: ['CREL-02', 'CREL-04'],
      runsWith: ['EBU-08'],
      revisedBy: ['VP-04'],
      feedsBackInto: ['VP-04', 'CMP-03'],
    },
    terms: ['SDK', 'EVK', 'KPI', 'Shmoo'],
  },
  'CREL-02': {
    criticalPath: true,
    purpose: [
      'Move the compiler from an alpha that has only ever targeted models to <b>a beta proven on silicon</b>: the regression suite run on real parts, the scheduler tuned to measured timing, and every beta blocker closed.',
      'A statically scheduled fabric depends on the compiler knowing the hardware’s timing exactly. The alpha in CMP-07 knew the simulator’s version of it; any difference silicon shows up in memory latency or configuration time is a scheduling bug, and this is where it is found and fixed.',
    ],
    flowNote:
      'Step 1 runs the regression on silicon through the bring-up boards, and step 2 tunes the scheduling against the timing it measures. Step 3 closes the beta blockers alongside the tuning, since most blockers are either tuning results or unrelated to it, and step 4 releases the beta.',
    consumes: [
      'Compiler Alpha with regression suite from CMP-07',
      'Fabric mapper, router and static scheduler from CMP-04',
      'Silicon booting with firmware load from EBU-04',
      'Errata list with workarounds from EBU-07',
      'Customer feedback log from EAP-04',
    ],
    rel: {
      'CREL-D2':
        '<b>Compiler Beta on silicon.</b> The compiler is regressed and tuned on silicon and the beta is released here.',
    },
    risks: [
      '<b>Regression passes on the simulator but not on silicon.</b> Every such case is either a compiler assumption or an erratum, and triage must tell which before anyone fixes the compiler.',
      '<b>Scheduler tuned to one part.</b> Timing measured on a few engineering samples at one voltage must be margined for the spread, or schedules fail on production parts.',
      '<b>Errata worked around silently in the compiler.</b> A workaround the release notes do not state becomes a behaviour customers cannot reproduce on a fixed part.',
      '<b>Partner blockers not in the beta criteria.</b> Early-access partners are the first users of the beta, and their open issues belong in the blocker list.',
      '<b>Bring-up board time contested.</b> Bring-up, correlation and compiler regression share the same few boards, and the compiler loses unless the time is booked.',
    ],
    roles: [
      { r: 'Compiler architect', d: 'Owns the beta, its criteria and its release' },
      { r: 'Compiler engineer', d: 'Scheduler tuning and blocker fixes' },
      { r: 'Silicon debug engineer', d: 'Separates compiler bugs from silicon errata' },
      { r: 'Test automation engineer', d: 'Runs the regression on the silicon boards' },
      { r: 'Software director', d: 'Approves the beta release' },
    ],
    effort: [
      ['Regression on silicon', 2],
      ['Scheduler tuning to measured timing', 3],
      ['Beta blocker closure', 2.5],
      ['Beta release', 0.5],
    ],
    entry: [
      'Compiler Alpha released in CMP-07',
      'Silicon boots and loads code in EBU-04',
      'Bring-up board time booked for compiler regression',
    ],
    exit: [
      'Regression suite passing on silicon at the beta threshold',
      'Every failure classed as compiler bug or erratum, with errata cross-referenced',
      'Compiler Beta released with notes stating the workarounds it applies',
    ],
    dependsOn: ['CMP-07', 'EBU-04', 'EBU-07', 'CREL-01'],
    dependsNote: null,
    feedsInto: ['CREL-04', 'CREL-05', 'EAP-04'],
    measuredBy: [
      'Regression pass rate on silicon against the simulator',
      'Open beta blockers at release',
      'Scheduling failures traced to timing mismatch',
    ],
    links: {
      dependsOn: ['CMP-07', 'EBU-04'],
      feedsInto: ['CREL-04', 'CREL-05'],
      runsWith: ['EBU-07'],
      revisedBy: ['CREL-01', 'EAP-04'],
      feedsBackInto: ['EAP-04'],
    },
    terms: ['LLVM', 'MLIR', 'ISA', 'SDK'],
  },
  'CREL-03': {
    criticalPath: true,
    purpose: [
      'Put in place <b>the release machinery and the support promise a 1.0 needs</b>: versioning, a stated support window and deprecation policy, automated signed builds and installers for every host OS, and a support flow customers can reach.',
      'A compiler that a customer ships a product with is a compiler they will need fixed years later on the exact version they built with. Without an LTS policy and reproducible builds, that request either cannot be met or forces the customer onto a newer version mid-production.',
    ],
    flowNote:
      'Step 1 sets the policy, which the rest implements, and step 2 automates the builds, signing and installers for each host OS. Step 3 runs alongside step 2 because the issue tracker and support flow depend on the policy rather than the builds, and step 4 documents the process.',
    consumes: [
      'Compiler architecture and release plan from CMP-01',
      'Examples, documentation portal and quick-start guides from SDK-05',
      'Customer feedback log and tracker from EAP-04',
      'SDK Beta release process from SDK-06',
      'Product change notification process from EMP-12',
    ],
    rel: {
      'CREL-D4':
        '<b>Release engineering and long-term support process.</b> The policy, the automated release pipeline and the support flow are set up and documented here.',
    },
    risks: [
      '<b>Installers not automated for every host OS.</b> A manual macOS or Windows build is the one that ships late or unsigned, and customers’ security teams reject unsigned toolchains.',
      '<b>No stated support window for early adopters.</b> Partners who designed in on a beta need to know how long it is supported and how they move to 1.0.',
      '<b>Builds not reproducible.</b> A fix to an LTS version must rebuild the exact compiler a customer shipped with, and that needs pinned dependencies from the start.',
      '<b>Support flow separate from the partner tracker.</b> Early-access issues already live in one tracker, and a second one for GA customers splits the history.',
      '<b>Deprecation policy written after the first break.</b> An ABI or API change without a stated policy is a broken customer build with no warning.',
    ],
    roles: [
      { r: 'Release manager', d: 'Owns the policy, the pipeline and the process' },
      { r: 'Build engineer', d: 'Automated builds, signing and installers' },
      { r: 'Support lead', d: 'Issue tracker and customer support flow' },
      { r: 'Security engineer', d: 'Code-signing keys and their custody' },
      { r: 'Software director', d: 'Approves the support window and policy' },
    ],
    effort: [
      ['Versioning and support policy', 0.5],
      ['Build, signing and installer automation', 2],
      ['Issue tracker and support flow', 1],
      ['Process documentation', 0.5],
    ],
    entry: [
      'Release plan from CMP-01 available',
      'Host OS list agreed for 1.0',
      'Code-signing certificates procured',
    ],
    exit: [
      'Signed installers built automatically for every supported host OS',
      'Support window and deprecation policy published',
      'Customer support flow live and joined to the partner tracker',
    ],
    dependsOn: ['CMP-01', 'SDK-05', 'EAP-04'],
    dependsNote: null,
    feedsInto: ['CREL-05'],
    measuredBy: [
      'Host OS builds produced without manual steps',
      'Time to rebuild a past release bit-for-bit',
      'Customer issues answered within the stated response time',
    ],
    links: {
      dependsOn: ['CMP-01', 'SDK-05'],
      feedsInto: ['CREL-05'],
      runsWith: ['EAP-04'],
      revisedBy: ['EMP-12'],
      feedsBackInto: [],
    },
    terms: ['LTS', 'ABI', 'CI', 'SDK'],
  },
  'CREL-04': {
    criticalPath: false,
    purpose: [
      'Run the benchmark suite on silicon at each operating point, compare it against the incumbent MCUs and DSPs customers would otherwise choose, and <b>publish only what has been reviewed</b>.',
      'A new architecture is judged on its energy per task against parts customers already trust. A pre-silicon number that silicon does not reproduce costs more credibility than a conservative one ever earns, so every published figure is measured on silicon, on a stated set-up, and checked before it leaves the building.',
    ],
    flowNote:
      'Step 1 runs the suite on silicon at each operating point, and step 2 compares against the incumbents. Step 3 starts the publication review alongside the comparison, because method and set-up can be reviewed before the last numbers are in, and step 4 publishes.',
    consumes: [
      'Silicon correlation report from CREL-01',
      'Compiler Beta on silicon from CREL-02',
      'Embedded workload suite and energy baselines from FCD-01',
      'Competitive benchmarking and gap analysis from EDEF-02',
      'DSP, image and ML libraries from SDK-04',
    ],
    rel: {
      'CREL-D3':
        '<b>Benchmark and energy results on silicon, published.</b> The benchmarks are run, compared, reviewed and published here.',
    },
    risks: [
      '<b>Benchmarks published before the review.</b> One number challenged in public forces a retraction that follows the product for years.',
      '<b>Incumbents measured unfairly.</b> A competitor run at a poor operating point or with an old compiler is what a sceptical customer checks first.',
      '<b>Set-up not stated.</b> Energy per task depends on supply voltage, clock source and what was counted, and a result without its set-up cannot be reproduced on an EVK.',
      '<b>Suite chosen to flatter.</b> Workloads the fabric wins on and none it does not invite the question of what was left out.',
      '<b>Numbers measured on an unreleased compiler.</b> A result the shipping compiler cannot reproduce is a claim customers will fail to match.',
    ],
    roles: [
      { r: 'Applications engineer', d: 'Owns the benchmark runs and the comparison' },
      { r: 'Competitive analyst', d: 'Incumbent parts, set-ups and fair operating points' },
      { r: 'Measurement engineer', d: 'Energy measurement method and accuracy' },
      { r: 'Product marketing lead', d: 'Presentation and publication' },
      { r: 'Chief architect', d: 'Approves the results for publication' },
    ],
    effort: [
      ['Silicon benchmark runs', 1.5],
      ['Incumbent comparison', 1.25],
      ['Publication review', 1],
      ['Publication', 0.25],
    ],
    entry: [
      'Models recalibrated in CREL-01',
      'Compiler Beta available on silicon from CREL-02',
      'Incumbent evaluation boards and toolchains in the lab',
    ],
    exit: [
      'Every result stated with its operating point and measurement set-up',
      'Incumbents measured on their own current toolchains',
      'Results reviewed and signed off before publication',
    ],
    dependsOn: ['CREL-01', 'CREL-02', 'FCD-01', 'EDEF-02'],
    dependsNote: null,
    feedsInto: ['EVKL-05', 'EMP-11', 'EAP-06'],
    measuredBy: [
      'Published results reproduced on a production EVK by a third party',
      'Energy per task against the incumbents on the suite',
      'Published figures later corrected',
    ],
    links: {
      dependsOn: ['CREL-01', 'CREL-02'],
      feedsInto: ['EVKL-05', 'EMP-11', 'EAP-06'],
      runsWith: [],
      revisedBy: ['FCD-01', 'EDEF-02'],
      feedsBackInto: [],
    },
    terms: ['MCU', 'DSP', 'EVK', 'KPI'],
  },
  'CREL-05': {
    criticalPath: true,
    purpose: [
      'Release <b>Compiler and SDK 1.0 General Availability</b>: the GA regression across the compiler, the SDK and the EVK, the criteria and open issues reviewed, release notes and a migration guide from the beta.',
      'GA is the version customers ship products with and the one the EVK launches on. EVK GA follows it by design, so a slip here moves the kit, and a 1.0 released with gaps turns every early adopter’s migration into a support case.',
    ],
    flowNote:
      'Step 1 runs the GA regression across the compiler, the SDK and the EVK, and step 2 reviews the criteria and the open issues against it. Step 3 finishes the release notes and migration guide alongside the review, because the notes describe the open issues the review accepts, and step 4 releases 1.0.',
    consumes: [
      'Compiler Beta on silicon from CREL-02',
      'Release engineering and long-term support process from CREL-03',
      'SDK Beta validated on first silicon from SDK-06',
      'EVT validation results from EVKL-01',
      'Errata list with workarounds from EBU-07',
    ],
    rel: {
      'CREL-D5':
        '<b>Compiler and SDK 1.0 General Availability release.</b> The 1.0 release is regressed, reviewed and released here.',
    },
    risks: [
      '<b>GA regression run without the EVK.</b> Customers will run 1.0 on the kit, not on the bring-up board, and board-specific support must be in the regression.',
      '<b>Open issues accepted without release notes.</b> A known issue that is not written down becomes a customer’s discovery.',
      '<b>No migration guide from the beta.</b> Partners designed in on the beta, and a 1.0 that breaks their builds without instructions costs the design-win.',
      '<b>GA criteria relaxed to hold the date.</b> The EVK launch date is not a reason to ship a compiler that fails its own criteria.',
      '<b>Errata not reflected in the SDK.</b> Workarounds must be in the HAL and the compiler at GA, with the errata list referenced in the notes.',
    ],
    roles: [
      { r: 'Release manager', d: 'Owns the GA regression, review and release' },
      { r: 'Compiler architect', d: 'Compiler readiness against the GA criteria' },
      { r: 'Firmware lead', d: 'SDK readiness on silicon and the EVK' },
      { r: 'Technical writer', d: 'Release notes and migration guide' },
      { r: 'Software director', d: 'Approves the 1.0 release' },
    ],
    effort: [
      ['GA regression across compiler, SDK and EVK', 1.25],
      ['GA criteria and open issue review', 0.5],
      ['Release notes and migration guide', 0.5],
      ['1.0 release', 0.75],
    ],
    entry: [
      'Compiler Beta released in CREL-02',
      'Release pipeline and support process in place from CREL-03',
      'SDK Beta validated on first silicon in SDK-06',
    ],
    exit: [
      'GA regression passing on silicon across compiler, SDK and EVK',
      'Every open issue either closed or stated in the release notes',
      'Compiler and SDK 1.0 released with a migration guide from the beta',
    ],
    dependsOn: ['CREL-02', 'CREL-03', 'SDK-06', 'EVKL-01'],
    dependsNote: null,
    feedsInto: ['EVKL-05', 'EAP-06'],
    measuredBy: [
      'GA regression pass rate across compiler, SDK and EVK',
      'Open issues at release against the GA criteria',
      'Weeks between 1.0 GA and EVK GA',
    ],
    links: {
      dependsOn: ['CREL-02', 'CREL-03', 'SDK-06'],
      feedsInto: ['EVKL-05', 'EAP-06'],
      runsWith: ['EVKL-01'],
      revisedBy: ['EBU-07'],
      feedsBackInto: [],
    },
    terms: ['SDK', 'EVK', 'HAL', 'LTS'],
  },
};
