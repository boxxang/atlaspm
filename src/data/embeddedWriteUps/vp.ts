import type { ActivityWriteUp } from '../activityDetailTypes';

export const VP_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'VP-01': {
    criticalPath: false,
    purpose: [
      'Build a <b>software model of the whole chip that firmware can boot on</b>—the scalar core, the memory map, the interrupt controller, every peripheral and the fabric simulator from CMP-03—so the SDK and the compiler have a target a year before there is silicon to run on.',
      'The model is judged by one thing: whether code that runs on it runs unchanged on the FPGA and later on silicon. It therefore follows the register map and the memory map exactly, and is loosely timed everywhere except the fabric, where cycle counts come from the simulator the compiler team already trusts.',
    ],
    flowNote:
      'Steps 1 and 2 build the scalar side of the chip from the architecture and the register map, core first because the peripherals hang off its interrupt model. Step 3 plugs the fabric simulator into that memory map, and step 4 runs alongside it, booting the first SDK examples as soon as the scalar side answers. Step 5 releases the platform once both sides run the benchmark suite together.',
    consumes: [
      'Fabric ISA and processing element behaviour from FCD-02',
      'Functional and cycle-level fabric simulator from CMP-03',
      'Peripheral set and interface choices from EARCH-03',
      'Register map and generated headers from ERTL-04',
      'Embedded workload and benchmark suite from FCD-01',
    ],
    rel: {
      'VP-D1':
        '<b>SoC virtual platform for software development.</b> The platform is modelled, integrated with the fabric simulator and released to the software teams here.',
    },
    risks: [
      '<b>The model drifts from the register map.</b> A peripheral modelled from an early draft lets drivers pass that fail on the FPGA, so the models are regenerated from the RDL rather than typed by hand.',
      '<b>Fabric timing and scalar timing mixed carelessly.</b> A loosely timed core driving a cycle-accurate fabric reports energy and latency that neither side would produce alone, and the reports have to say which numbers are modelled and which are estimated.',
      '<b>Released before the interrupt model is right.</b> Wake-up and sleep behaviour is where embedded firmware breaks, and a platform that fires interrupts idealistically hides the race conditions the drivers will meet on silicon.',
      '<b>No version link to the RTL drop.</b> Software teams cannot tell which chip behaviour the platform represents, and a bug found on it cannot be traced to a hardware change.',
      '<b>Performance so slow nobody uses it.</b> If booting an RTOS takes minutes, the firmware team waits for the FPGA instead and the platform delivers none of its schedule benefit.',
    ],
    roles: [
      { r: 'Virtual platform engineer', d: 'Owns the models, their integration and the release' },
      { r: 'Simulation engineer', d: 'Supplies and supports the fabric simulator' },
      { r: 'Register map owner', d: 'Keeps the platform aligned with the generated register map' },
      { r: 'Firmware lead', d: 'First user, and judge of whether the platform is usable' },
      { r: 'Chief architect', d: 'Approves the platform as a faithful model of the chip' },
    ],
    effort: [
      ['Scalar core, memory map and interrupt model', 2.5],
      ['Peripheral models', 3],
      ['Fabric simulator integration', 2.5],
      ['SDK examples and benchmark bring-up', 1.25],
      ['Release and versioning', 0.75],
    ],
    entry: [
      'Fabric simulator available from CMP-03 in a callable form',
      'Peripheral set agreed in EARCH-03',
      'Draft register map published from ERTL-04',
    ],
    exit: [
      'First SDK examples and the benchmark suite run on the platform',
      'Every peripheral model generated from the current register map',
      'Platform released and versioned against an RTL drop',
    ],
    dependsOn: ['FCD-02', 'CMP-03', 'EARCH-03', 'ERTL-04'],
    dependsNote:
      'The register map from ERTL-04 settles part-way through this activity, so the peripheral models are built against the draft and regenerated when it is released.',
    feedsInto: ['VP-03', 'VP-04', 'SDK-02', 'SDK-03'],
    measuredBy: [
      'Peripheral models regenerated from the released register map against total',
      'Firmware that runs on the platform and fails on the FPGA',
      'Time to boot an RTOS image on the platform',
    ],
    links: {
      dependsOn: ['FCD-02', 'CMP-03', 'EARCH-03', 'ERTL-04'],
      feedsInto: ['VP-03', 'VP-04', 'SDK-02', 'SDK-03'],
      runsWith: [],
      revisedBy: ['ERTL-03'],
      feedsBackInto: ['FCD-05'],
    },
    terms: ['SoC', 'ISA', 'SDK', 'RDL', 'RTOS'],
  },
  'VP-02': {
    criticalPath: false,
    purpose: [
      'Turn each verified FPGA image into <b>a prototype the software teams can actually use</b>: a board, a flashing guide, the known issues of that RTL drop, and a route back for the bugs they find.',
      'The FPGA prototype is the first place firmware meets real RTL, real peripherals and real timing relationships, and it is where most driver and boot bugs are found. That value is only realised if the images reach the SDK, compiler and early-access teams quickly, with enough context that a failure is reported as a hardware bug rather than worked around in software.',
    ],
    flowNote:
      'Step 1 takes each image only after FPV-03 has smoke-tested it, and step 2 packages it with the set-up guide. Step 3 distributes the boards, and step 4 runs alongside it for the life of the activity, routing every software-found failure into the FPV-05 tracker. Step 5 releases each prototype drop once the teams have it running.',
    consumes: [
      'Smoke-tested FPGA images per RTL drop from FPV-03',
      'FPGA platform and model plan from FPV-02',
      'Known-issue list per drop from FPV-05',
      'Boot ROM image from SDK-01',
      'Board and user list agreed with the early-access partners in EAP-02',
    ],
    rel: {
      'VP-D2':
        '<b>FPGA prototype, released to the software teams.</b> The images are packaged, distributed and supported here.',
    },
    risks: [
      '<b>Unverified images handed out.</b> An image that fails its smoke test costs every software team a day of debugging the platform instead of their code.',
      '<b>Known issues not shipped with the image.</b> Teams rediscover and work around the same hardware bugs, and the workarounds survive into the SDK after the bug is fixed.',
      '<b>Bugs reported in chat instead of the tracker.</b> Software-found hardware bugs never reach DV, and the RTL is frozen with them still in it.',
      '<b>Too few boards for the teams that need them.</b> The compiler and SDK teams queue for the same prototype and the benefit of early hardware is lost to scheduling.',
      '<b>Prototype mistaken for silicon.</b> The FPGA runs at a fraction of the target clock with modelled PMU and eMRAM, and timing or energy conclusions drawn from it are wrong.',
    ],
    roles: [
      { r: 'Prototyping engineer', d: 'Owns the packaging, distribution and support of each image' },
      { r: 'FPGA verification lead', d: 'Releases only images that passed their smoke tests' },
      { r: 'Firmware lead', d: 'Represents the SDK team as the main user' },
      { r: 'Compiler architect', d: 'Represents the compiler team running workloads on the prototype' },
      { r: 'Developer platform lead', d: 'Approves the release to the software teams' },
    ],
    effort: [
      ['Image intake per RTL drop', 1.5],
      ['Packaging and set-up guides', 2.5],
      ['Board distribution and support', 4],
      ['Bug routing into the FPGA tracker', 3],
      ['Release per drop', 1],
    ],
    entry: [
      'First smoke-tested image released from FPV-03',
      'Prototype boards procured for each receiving team',
      'Bug tracker from FPV-05 open to the software teams',
    ],
    exit: [
      'Every receiving team running the current image',
      'Known issues published with every image',
      'Software-found bugs recorded in the FPGA tracker with an owner',
    ],
    dependsOn: ['FPV-03', 'FPV-02', 'SDK-01'],
    dependsNote: null,
    feedsInto: ['SDK-02', 'SDK-03', 'CMP-04', 'FPV-05'],
    measuredBy: [
      'Days from a verified image to the software teams running it',
      'Hardware bugs found by software on the prototype',
      'Image releases shipped with a known-issue list',
    ],
    links: {
      dependsOn: ['FPV-03', 'FPV-02', 'SDK-01'],
      feedsInto: ['SDK-02', 'SDK-03', 'CMP-04'],
      runsWith: ['FPV-04'],
      revisedBy: [],
      feedsBackInto: ['FPV-05'],
    },
    terms: ['FPGA', 'RTL', 'SDK', 'eMRAM'],
  },
  'VP-03': {
    criticalPath: true,
    purpose: [
      'Build the <b>browser Playground where a developer writes C or a model, compiles it for the fabric, runs it on the simulator in the cloud and sees the energy it costs</b>, region by region, without installing anything or owning a board.',
      'For a new architecture the hardest sale is the first hour: an engineer who has used the same MCU toolchain for ten years will not install an unfamiliar compiler to test a claim. The Playground is how the energy-per-task claim is tested by customers before silicon exists, and its launch is a programme checkpoint because the early-access programme is built on it.',
    ],
    flowNote:
      'Step 1 wraps the compiler in a job service, and step 2 runs its output on the simulator in the cloud; the two come first because nothing else can be shown without them. Step 3 adds the per-region cycle and energy reports, and step 4 writes the sample projects alongside it so they exercise the reports as they appear. Step 5 hardens security and quotas before step 6 opens the beta.',
    consumes: [
      'Compiler front end and scheduler builds from CMP-04',
      'Functional and cycle-level simulator from CMP-03',
      'Debugger and energy profiler hooks from CMP-06',
      'Cycle and energy model with accuracy bounds from FCD-05',
      'Virtual platform for the scalar side from VP-01',
    ],
    rel: {
      'VP-D3':
        '<b>Developer Playground — browser compile, run and energy report.</b> The Playground is built, hardened and opened to beta users here.',
    },
    risks: [
      '<b>Energy numbers shown without their accuracy.</b> A developer who sees a single figure treats it as a datasheet value, and a model error becomes a broken customer promise when silicon arrives.',
      '<b>Built on a compiler that changes every week.</b> Sample projects break between compiler drops, and the Playground pins a compiler version per project so users see stable results.',
      '<b>Customer code handled carelessly.</b> Users upload proprietary code and models, and the service needs isolation, retention rules and sign-up terms before anyone outside the company uses it.',
      '<b>Simulation cost not budgeted.</b> Cycle-level runs in the cloud cost real money per job, and without quotas a few heavy users consume the budget.',
      '<b>A demo, not a tool.</b> If the Playground cannot import a real project or export the compiled result, developers try one sample and leave.',
    ],
    roles: [
      { r: 'Developer platform lead', d: 'Owns the Playground, its service and its beta' },
      { r: 'Compiler architect', d: 'Compiler versioning and the job interface' },
      { r: 'Simulation engineer', d: 'Runs the simulator as a cloud back end' },
      { r: 'Security architect', d: 'Isolation and handling of customer code' },
      { r: 'Product marketing lead', d: 'Approves the beta for users outside the company' },
    ],
    effort: [
      ['Browser editor and compile job service', 4],
      ['Cloud simulation back end', 3.5],
      ['Per-region cycle and energy reports', 2.5],
      ['Sample projects and tutorials', 2],
      ['Security, quota and sign-up hardening', 1.5],
      ['Beta opening', 0.5],
    ],
    entry: [
      'Compiler builds producing runnable fabric configurations from CMP-04',
      'Simulator callable as a batch job from CMP-03',
      'Energy model with stated accuracy bounds from FCD-05',
    ],
    exit: [
      'A sample project compiles, runs and reports energy per region in the browser',
      'Security, quota and data handling reviewed and signed off',
      'Beta users onboarded and able to run their own code',
    ],
    dependsOn: ['CMP-04', 'CMP-03', 'CMP-06', 'VP-01'],
    dependsNote:
      'The Playground is built on pre-alpha compiler drops and moves to the Compiler Alpha from CMP-07 before launch.',
    feedsInto: ['VP-05', 'EAP-03', 'SDK-05'],
    measuredBy: [
      'Median time from sign-up to a first energy report',
      'Compile and run jobs that fail for reasons other than user code',
      'Beta users who run their own code rather than only samples',
    ],
    links: {
      dependsOn: ['CMP-04', 'CMP-03', 'CMP-06', 'VP-01'],
      feedsInto: ['VP-05', 'EAP-03', 'SDK-05'],
      runsWith: ['VP-04'],
      revisedBy: ['CMP-07', 'FCD-05'],
      feedsBackInto: ['CMP-06'],
    },
    terms: ['LLVM', 'MLIR', 'LiteRT', 'ONNX', 'MCU'],
  },
  'VP-04': {
    criticalPath: true,
    purpose: [
      'Turn per-region energy into <b>the number an embedded customer actually buys on: how long the battery lasts</b>, by modelling the duty cycle, the sleep modes and the wake sources around the code the Playground has compiled.',
      'Energy per inference or per filter pass tells a developer little until it is combined with how often the device wakes, how long it sleeps and what sleep costs. The modeller does that arithmetic from the PMU energy budget, so the lifetime estimate a customer sees is anchored to the power architecture rather than to a spreadsheet of guesses.',
    ],
    flowNote:
      'Step 1 converts region energy into lifetime, and step 2 adds the duty-cycle and sleep-mode model that lifetime depends on. Step 3 runs alongside step 2, correlating the estimates against the PMU budget as the mode model takes shape, so a disagreement is found while it is still cheap. Step 4 releases the profiler into the Playground.',
    consumes: [
      'Per-region cycle and energy reports from VP-03',
      'Power architecture and operating modes from PMU-01',
      'Verified system energy budget per mode from PMU-06',
      'Always-on domain and wake sources from PMU-04',
      'Energy profiler integration from CMP-06',
    ],
    rel: {
      'VP-D4':
        '<b>Energy profiler and lifetime modeller.</b> The lifetime model is built, correlated against the PMU budget and released here.',
    },
    risks: [
      '<b>Sleep current taken from the target, not the design.</b> Battery life in a duty-cycled device is dominated by sleep, and a modeller that uses the specification value rather than the verified budget flatters every estimate.',
      '<b>Wake-up energy ignored.</b> Oscillator start-up and eMRAM wake cost more than the task for short, frequent wakes, and leaving them out overstates lifetime most for the applications that care most.',
      '<b>Battery modelled as an ideal charge store.</b> Coin cells lose capacity at pulse currents and low temperature, and the model has to say which battery assumptions it makes.',
      '<b>No plan to correlate against silicon.</b> The estimates become marketing claims unless CREL-01 checks them on real parts and the modeller is corrected.',
      '<b>Released separately from the Playground.</b> A lifetime tool that does not read the compiled code is used once and forgotten.',
    ],
    roles: [
      { r: 'Tools engineer', d: 'Owns the profiler, the lifetime model and its release' },
      { r: 'Power architect', d: 'Supplies the mode definitions and the energy budget' },
      { r: 'Performance architect', d: 'Energy model accuracy and correlation' },
      { r: 'Applications engineer', d: 'Realistic duty cycles for the target segments' },
      { r: 'Developer platform lead', d: 'Approves the release into the Playground' },
    ],
    effort: [
      ['Battery-lifetime estimator', 2],
      ['Duty-cycle and sleep-mode model', 2],
      ['Correlation against the PMU energy budget', 1.25],
      ['Release into the Playground', 0.75],
    ],
    entry: [
      'Per-region energy reports running in VP-03',
      'Operating modes defined in PMU-01',
      'Energy budget per mode available from PMU-06',
    ],
    exit: [
      'Lifetime estimates within the stated bound of the PMU budget for the reference duty cycles',
      'Battery and sleep assumptions shown with every estimate',
      'Profiler and modeller released inside the Playground',
    ],
    dependsOn: ['VP-03', 'PMU-01', 'PMU-06', 'CMP-06'],
    dependsNote: null,
    feedsInto: ['VP-05', 'EAP-03', 'CREL-01'],
    measuredBy: [
      'Lifetime estimate error against the PMU budget for the reference duty cycles',
      'Estimate error against silicon once CREL-01 reports',
      'Playground sessions that open the lifetime view',
    ],
    links: {
      dependsOn: ['PMU-01', 'PMU-06', 'CMP-06'],
      feedsInto: ['VP-05', 'EAP-03', 'CREL-01'],
      runsWith: ['VP-03'],
      revisedBy: ['PMU-04'],
      feedsBackInto: [],
    },
    terms: ['eMRAM', 'RTC', 'KPI', 'MCU'],
  },
  'VP-05': {
    criticalPath: true,
    purpose: [
      'Decide whether the Playground is <b>ready to be opened to the public</b>, on a checklist rather than a date: documentation, samples, support channels, and a service that holds up under the load a launch brings.',
      'The launch closes the stage and opens pre-silicon onboarding in EAP-03, so it is a programme checkpoint. A launch that fails in public costs more than a launch two weeks late, and the go or no-go is taken on the load-test results and the open-issue list, not on the announcement calendar.',
    ],
    flowNote:
      'Step 1 runs the launch checklist, and step 2 load-tests the service alongside it because the two find different failures and neither waits for the other. Step 3 takes the go or no-go on both results together and makes the announcement.',
    consumes: [
      'Developer Playground beta and its user feedback from VP-03',
      'Energy profiler and lifetime modeller from VP-04',
      'Compiler Alpha release from CMP-07',
      'Early-access programme charter and target accounts from EAP-01',
      'Signed early-access agreements from EAP-02',
    ],
    rel: {
      'VP-D5':
        '<b>Playground launch readiness review.</b> The checklist, the load test and the launch decision are recorded here.',
    },
    risks: [
      '<b>Launched on a compiler that is not the Alpha.</b> Users onboard on one version and are moved to another within weeks, and every sample they wrote breaks.',
      '<b>Load tested with toy jobs.</b> Real users compile real models, and a service that handled a thousand hello-world jobs falls over on fifty model imports.',
      '<b>No support channel staffed at launch.</b> The first questions go unanswered for days and the developers who came to try the part leave.',
      '<b>Energy claims published without their bounds.</b> Launch material quotes the best number the Playground ever showed, and silicon is measured against it.',
      '<b>Date held against the checklist.</b> A launch forced to its announced date with open blockers turns a schedule slip into a public quality problem.',
    ],
    roles: [
      { r: 'Developer platform lead', d: 'Owns the checklist and the launch decision' },
      { r: 'Site reliability engineer', d: 'Load test and service readiness' },
      { r: 'Technical writer', d: 'Documentation and tutorials at launch' },
      { r: 'Field applications engineer', d: 'Support channel and first-user onboarding' },
      { r: 'Product marketing lead', d: 'Approves the launch and the announcement' },
    ],
    effort: [
      ['Launch checklist', 0.75],
      ['Service load test', 0.75],
      ['Go / no-go decision and announcement', 0.5],
    ],
    entry: [
      'Playground beta running with outside users from VP-03',
      'Compiler Alpha released from CMP-07',
      'Early-access partners signed in EAP-02',
    ],
    exit: [
      'Launch checklist complete with no open blocker',
      'Service load-tested at the expected launch traffic with real workloads',
      'Go or no-go recorded and the launch announced',
    ],
    dependsOn: ['VP-03', 'VP-04', 'CMP-07', 'EAP-02'],
    dependsNote: null,
    feedsInto: ['EAP-03', 'EAP-04'],
    measuredBy: [
      'Checklist items closed at the decision against total',
      'Service availability in the first month after launch',
      'Sign-ups converted to early-access onboarding in EAP-03',
    ],
    links: {
      dependsOn: ['VP-03', 'VP-04', 'CMP-07', 'EAP-02'],
      feedsInto: ['EAP-03', 'EAP-04'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['SDK', 'FAE', 'KPI'],
  },
};
