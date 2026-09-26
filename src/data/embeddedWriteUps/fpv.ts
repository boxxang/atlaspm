import type { ActivityWriteUp } from '../activityDetailTypes';

export const FPV_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'FPV-01': {
    criticalPath: false,
    purpose: [
      'Decide, feature by feature, <b>what the FPGA prototype is there to prove that simulation and emulation cannot</b>, and write that down as a test list with owners, the RTL drop each test needs and the exit criteria signoff will be judged on.',
      'Without a scope split the FPGA team re-runs what DV already covers at a thousand times the speed and a tenth of the visibility, and the things only a prototype can show—real sensors on real pins, every boot path, compiled workloads for hours, the SDK on real RTL—are left to first silicon. The plan is written beside the DV verification plan so the two agree on who proves what.',
    ],
    flowNote:
      'Step 1 splits the scope with DV, and step 2 lists what only the FPGA can prove from that split. Step 3 turns the list into tests with owners and RTL drops, and step 4 sets the coverage targets and exit criteria alongside it, because a test with no exit criterion is not yet a test. Step 5 reviews the whole plan with DV, firmware and the compiler team.',
    consumes: [
      'Verification plan and coverage model from EDV-01',
      'Architecture specification from EARCH-07',
      'Embedded workload suite and energy baselines from FCD-01',
      'Boot mode definition from SDK-01',
      'RTL release schedule from ERTL-02',
    ],
    rel: {
      'FPV-D1':
        '<b>FPGA verification plan — scope split, test list, exit criteria.</b> The scope split, the test list and the exit criteria are written and reviewed here.',
    },
    risks: [
      '<b>Scope copied from the DV plan.</b> The FPGA then repeats block-level tests it is poor at and skips the system tests it is uniquely good at.',
      '<b>Exit criteria set after the results.</b> Criteria written once the numbers are known describe what happened rather than what was needed, and signoff means nothing.',
      '<b>Tests not tied to an RTL drop.</b> A test scheduled for a feature that arrives in a later drop fails for months and hides the failures that matter.',
      '<b>Firmware and compiler not in the review.</b> The boot and workload tests are theirs to define, and a plan written without them tests the wrong paths.',
      '<b>No list of what the FPGA cannot show.</b> Power gating, analog behaviour and silicon timing fall between the FPGA and simulation unless someone owns each gap.',
    ],
    roles: [
      { r: 'FPGA verification lead', d: 'Owns the plan, the test list and the exit criteria' },
      { r: 'Verification lead', d: 'Agrees the scope split with the DV plan' },
      { r: 'Firmware lead', d: 'Defines the boot and driver tests' },
      { r: 'Compiler architect', d: 'Defines the compiled workload tests' },
      { r: 'Chief architect', d: 'Approves the plan as covering the architecture' },
    ],
    effort: [
      ['Scope split with simulation and emulation', 0.75],
      ['FPGA-only verification targets', 0.5],
      ['Test list with owners and RTL drops', 0.75],
      ['Coverage targets and exit criteria', 0.5],
      ['Plan review', 0.5],
    ],
    entry: [
      'DV verification plan in draft from EDV-01',
      'Architecture specification released from EARCH-07',
      'RTL drop schedule published from ERTL-02',
    ],
    exit: [
      'Every feature assigned to simulation, emulation or FPGA with a reason',
      'Every FPGA test has an owner, an RTL drop and an exit criterion',
      'Plan reviewed and accepted by DV, firmware and the compiler team',
    ],
    dependsOn: ['EDV-01', 'EARCH-07', 'FCD-01'],
    dependsNote:
      'The DV plan in EDV-01 is written over the same weeks, so the scope split is agreed between the two leads rather than taken from a finished document.',
    feedsInto: ['FPV-02', 'FPV-03', 'FPV-04', 'FPV-06'],
    measuredBy: [
      'FPGA tests with an owner, drop and exit criterion against total',
      'Features assigned to no verification method',
      'Tests added after the plan review because a gap was found late',
    ],
    links: {
      dependsOn: ['EARCH-07', 'FCD-01'],
      feedsInto: ['FPV-03', 'FPV-04', 'FPV-06'],
      runsWith: ['EDV-01', 'FPV-02'],
      revisedBy: ['ERTL-03'],
      feedsBackInto: ['FPV-02'],
    },
    terms: ['FPGA', 'DV', 'RTL', 'SDK'],
  },
  'FPV-02': {
    criticalPath: false,
    purpose: [
      'Decide <b>what the prototype is physically built from and what it pretends to be</b>: the FPGA platform, how much of the fabric fits, the clock it runs at, and the models that stand in for the PMU, the oscillators and the eMRAM.',
      'A fabric of tiled processing elements rarely fits one FPGA at full size, and the analog parts of the chip cannot be prototyped at all. Every one of those compromises changes what a passing test means, so the plan records each substitution beside the coverage it costs and names who closes that gap instead.',
    ],
    flowNote:
      'Step 1 sizes the design and chooses the platform, and step 2 decides the fabric configuration that fits it. Step 3 plans clock scaling and peripheral timing alongside step 2, since both follow from the platform. Step 4 builds the stand-in models, step 5 records what the prototype cannot show, and step 6 releases the plan.',
    consumes: [
      'FPGA test list and scope split from FPV-01',
      'Fabric ISA and tile count from FCD-02',
      'Power architecture and operating modes from PMU-01',
      'eMRAM controller, ECC and trim specification from MRAM-02',
      'Power, clock and mode architecture from EARCH-06',
    ],
    rel: {
      'FPV-D2':
        '<b>FPGA platform, capacity and model plan.</b> The platform, fabric configuration and stand-in models are chosen and released here.',
      'FPV-D1':
        '<b>FPGA verification plan — scope split, test list, exit criteria.</b> The coverage gaps the prototype cannot close are fed back into the plan so each has an owner.',
    },
    risks: [
      '<b>Reduced fabric that hides real bugs.</b> A tile count cut to fit can remove the corner cases in routing and scheduling that only a full array exercises, and the compiler tests must be told which configuration they ran on.',
      '<b>eMRAM model that never fails.</b> An SRAM standing in for eMRAM has no write latency, no ECC events and no trim, so boot and data-retention paths pass that silicon will stress.',
      '<b>PMU stub that makes every mode transition instant.</b> Sleep entry and wake-up sequencing is where firmware races live, and a stub that skips the delays hides them.',
      '<b>Peripheral timing scaled wrongly.</b> At a reduced clock, UART baud rates and sensor protocols must still meet the device on the other end, or the interoperability tests test nothing.',
      '<b>Platform chosen too small.</b> Capacity estimated from an early RTL drop is overtaken by the full design, and a mid-programme platform change costs weeks of rebuild.',
    ],
    roles: [
      { r: 'Prototyping engineer', d: 'Owns the platform, the capacity estimate and the models' },
      { r: 'FPGA verification lead', d: 'Checks the plan against the test list' },
      { r: 'Power architect', d: 'Defines what the PMU and oscillator models must behave like' },
      { r: 'Memory IP lead', d: 'Defines the eMRAM model and what it cannot represent' },
      { r: 'Chief architect', d: 'Approves the fabric configuration used on the prototype' },
    ],
    effort: [
      ['Capacity estimate and platform choice', 0.75],
      ['Prototype fabric configuration', 0.5],
      ['Clock and peripheral timing plan', 0.4],
      ['PMU, oscillator and eMRAM models', 0.85],
      ['Coverage gaps and their owners', 0.3],
      ['Plan release', 0.2],
    ],
    entry: [
      'FPGA test list drafted in FPV-01',
      'Fabric tile count fixed in FCD-02',
      'Operating modes defined in PMU-01',
    ],
    exit: [
      'Platform ordered with capacity margin for the full RTL',
      'Every analog or memory block replaced by a documented model',
      'Every coverage gap the FPGA cannot close assigned to another method and owner',
    ],
    dependsOn: ['FPV-01', 'FCD-02', 'PMU-01', 'MRAM-02'],
    dependsNote: null,
    feedsInto: ['FPV-03', 'VP-02', 'FPV-01'],
    measuredBy: [
      'FPGA utilisation of the full design against the platform capacity',
      'Coverage gaps with an owner outside the FPGA against total',
      'Failures on silicon traced to a model the prototype used',
    ],
    links: {
      dependsOn: ['FCD-02', 'PMU-01', 'MRAM-02'],
      feedsInto: ['FPV-03', 'VP-02'],
      runsWith: ['FPV-01'],
      revisedBy: ['EARCH-06'],
      feedsBackInto: ['FPV-01'],
    },
    terms: ['FPGA', 'eMRAM', 'ECC', 'PLL'],
  },
  'FPV-03': {
    criticalPath: true,
    purpose: [
      'Turn <b>every RTL drop into a working FPGA image within days</b>: synthesised, placed, timed at the prototype clock, booted from the ROM image and smoke-tested before anyone else sees it.',
      'The prototype is only useful if it tracks the RTL closely. An image three drops old verifies a chip that no longer exists, and a broken image handed to the software teams costs every one of them a day. The build is scripted from the same CI release as DV, so each image carries its drop tag and known issues.',
    ],
    flowNote:
      'Step 1 builds each drop onto the FPGA and step 2 closes timing at the prototype clock; they repeat for every drop. Step 3 boots the ROM and runs the smoke tests, and step 4 tags the image alongside it so the known issues found in step 3 go out with it. Step 5 releases the image to verification and software.',
    consumes: [
      'Tagged RTL releases from ERTL-02',
      'Block and top-level RTL from ERTL-10',
      'FPGA platform, capacity and model plan from FPV-02',
      'Boot ROM image under development from SDK-01',
      'Smoke-test list from FPV-01',
    ],
    rel: {
      'FPV-D3':
        '<b>FPGA images per RTL drop, smoke-tested.</b> Each image is built, timed, smoke-tested and tagged here.',
    },
    risks: [
      '<b>FPGA build time longer than the drop interval.</b> Place and route on a large device takes a day or more, and without incremental flows the prototype falls permanently behind the RTL.',
      '<b>FPGA-only RTL edits that never reach the real RTL.</b> Fixes made to get an image working are lost, and the next drop fails the same way.',
      '<b>Timing closed by lowering the clock each drop.</b> Peripheral and software timing assumptions drift, and tests that passed on the last image fail for reasons that are not bugs.',
      '<b>Smoke test too thin.</b> An image that boots but has a broken interrupt controller is released and wastes the software teams’ week.',
      '<b>Image and drop not tagged together.</b> A bug found on the prototype cannot be traced to the RTL that caused it.',
    ],
    roles: [
      { r: 'Prototyping engineer', d: 'Owns the build, timing closure and release of each image' },
      { r: 'Chip integration lead', d: 'Delivers each RTL drop in a form the FPGA flow can take' },
      { r: 'Configuration and release manager', d: 'Tags the drop the image is built from' },
      { r: 'Firmware lead', d: 'Supplies the ROM image and confirms the boot' },
      { r: 'FPGA verification lead', d: 'Approves each image for release' },
    ],
    effort: [
      ['FPGA build per RTL drop', 3],
      ['Timing closure at the prototype clock', 2],
      ['Boot and smoke tests', 1.5],
      ['Image tagging and known issues', 0.75],
      ['Release per drop', 0.75],
    ],
    entry: [
      'First integrated RTL drop tagged in ERTL-02',
      'Platform and models ready from FPV-02',
      'First ROM image booting in simulation from SDK-01',
    ],
    exit: [
      'Every RTL drop built, booted and smoke-tested',
      'Each image tagged with its drop and known issues',
      'Images released to FPV-04 and VP-02 within the agreed turnaround',
    ],
    dependsOn: ['ERTL-02', 'ERTL-10', 'FPV-02', 'SDK-01'],
    dependsNote:
      'The first drops arrive before chip-level integration in ERTL-10 is complete, so early images carry the subsystems that are integrated and say which are missing.',
    feedsInto: ['FPV-04', 'VP-02', 'FPV-05'],
    measuredBy: [
      'Days from an RTL drop to a released image',
      'Images released that failed their first use downstream',
      'Prototype clock achieved against the plan',
    ],
    links: {
      dependsOn: ['ERTL-02', 'ERTL-10', 'FPV-02', 'SDK-01'],
      feedsInto: ['FPV-04', 'VP-02', 'FPV-05'],
      runsWith: [],
      revisedBy: ['ERTL-03'],
      feedsBackInto: ['ERTL-05'],
    },
    terms: ['FPGA', 'RTL', 'ROM', 'CI'],
  },
  'FPV-04': {
    criticalPath: true,
    purpose: [
      'Run the FPGA test list on every image: <b>real sensors and shields on the pins, every boot path, compiled workloads checked against the simulator, and soak runs measured in days</b>, alongside the SDK driver and RTOS regression.',
      'These are the tests a simulator cannot run in the time a programme has. A peripheral that meets its protocol in simulation still has to talk to a sensor with its own interpretation of the standard, and a scheduler bug in the compiler that shows once in ten million cycles only appears when workloads run for hours. The results are what the FPGA signoff is judged on.',
    ],
    flowNote:
      'Steps 1 to 3 run the peripheral, boot and workload tests on each image as its features arrive. Step 4 runs soak tests alongside step 3 on spare boards because they need wall-clock time rather than attention, and step 5 runs the SDK regression alongside it for the same reason. Step 6 reports every result against the test list.',
    consumes: [
      'Smoke-tested FPGA images from FPV-03',
      'FPGA test list and exit criteria from FPV-01',
      'Compiled workloads from the fabric scheduler in CMP-04',
      'Simulator reference results from CMP-03',
      'HAL, drivers and boot modes from SDK-02 and SDK-01',
    ],
    rel: {
      'FPV-D4':
        '<b>FPGA verification results — peripherals, boot, workloads, soak.</b> Every test on the list is run and reported here.',
      'FPV-D6':
        '<b>FPGA verification signoff report.</b> The results are the evidence the signoff is judged on.',
    },
    risks: [
      '<b>Workload results compared only for crashes.</b> A compiled kernel that finishes with the wrong answer is the most expensive bug the fabric can have, so every run is checked bit-for-bit against the simulator.',
      '<b>Boot paths tested only from the default source.</b> UART, SPI flash, JTAG and secure boot each run different ROM code, and a boot path first exercised on silicon is a respin risk because the ROM cannot be patched.',
      '<b>Only well-behaved sensors used.</b> Interoperability failures come from devices that stretch clocks or bend the protocol, so the test bench includes the awkward parts customers will actually use.',
      '<b>Soak runs abandoned when a board is needed elsewhere.</b> Long-duration results are the ones that find rare bugs, and they are the first to lose their hardware.',
      '<b>Failures on the prototype blamed on the prototype.</b> A failure explained away as an FPGA model artefact is sometimes a real bug, and each one needs a triage record in FPV-05.',
    ],
    roles: [
      { r: 'FPGA verification lead', d: 'Owns the execution and the results against the test list' },
      { r: 'Prototyping engineer', d: 'Keeps the images and boards running' },
      { r: 'Firmware engineer', d: 'Runs the boot, driver and RTOS tests' },
      { r: 'Compiler engineer', d: 'Supplies workloads and checks results against the simulator' },
      { r: 'Verification lead', d: 'Approves the results as evidence alongside DV coverage' },
    ],
    effort: [
      ['Peripheral tests with real devices', 3],
      ['Boot path verification', 2],
      ['Compiled workloads against the simulator', 3.5],
      ['Soak and stability tests', 2.5],
      ['SDK driver and RTOS regression', 2],
      ['Results reporting', 1],
    ],
    entry: [
      'First smoke-tested image released from FPV-03',
      'Test list and exit criteria agreed in FPV-01',
      'Compiled workloads available from CMP-04',
    ],
    exit: [
      'Every test on the list run on the final image with a recorded result',
      'Every boot path booted on the prototype',
      'Compiled workloads match the simulator bit-for-bit, and soak runs meet their duration',
    ],
    dependsOn: ['FPV-03', 'FPV-01', 'CMP-04', 'CMP-03', 'SDK-02'],
    dependsNote: null,
    feedsInto: ['FPV-05', 'FPV-06', 'CMP-04'],
    measuredBy: [
      'Tests passed on the current image against the test list',
      'Workload mismatches against the simulator found per drop',
      'Soak hours accumulated without an unexplained failure',
    ],
    links: {
      dependsOn: ['FPV-03', 'FPV-01', 'CMP-04', 'CMP-03', 'SDK-02'],
      feedsInto: ['FPV-05', 'FPV-06'],
      runsWith: ['FPV-05', 'VP-02'],
      revisedBy: ['SDK-01'],
      feedsBackInto: ['CMP-04', 'SDK-03'],
    },
    terms: ['FPGA', 'RTOS', 'HAL', 'JTAG', 'SDK'],
  },
  'FPV-05': {
    criticalPath: true,
    purpose: [
      'Give every prototype failure <b>an owner, a tracker entry and a regression that proves the fix</b>, and share one burn-down with DV so the programme sees a single count of open bugs rather than two.',
      'A failure on the FPGA can be in the RTL, the compiler, the firmware or the prototype itself, and until it is triaged nobody fixes it. Rerunning the regression on every drop and ECO is what turns a list of fixes into evidence that nothing broke, and the weekly escape trend is what the tapeout decision reads.',
    ],
    flowNote:
      'Step 1 triages every failure as it is found, and step 2 tracks the burn-down with DV alongside it in the same tracker. Step 3 reruns the regression on each new drop and ECO for the whole stage, and step 4 reports escapes and open issues weekly alongside it. Step 5 publishes the dashboard.',
    consumes: [
      'Test failures from FPV-04',
      'Software-found bugs from the prototype users in VP-02',
      'Bug triage and disposition board from EDV-03',
      'Change control and ECO decisions from ERTL-03',
      'Tagged images per drop from FPV-03',
    ],
    rel: {
      'FPV-D5':
        '<b>FPGA bug tracker and regression dashboard.</b> The tracker, the regression per drop and the dashboard are owned here.',
      'FPV-D6':
        '<b>FPGA verification signoff report.</b> The open-issue list and escape trend are what signoff dispositions.',
    },
    risks: [
      '<b>Two trackers, two counts.</b> DV and the FPGA team each report a burn-down, the same bug appears in both or neither, and the tapeout review cannot tell how many bugs are open.',
      '<b>Failures left in platform triage.</b> Bugs parked as FPGA artefacts are never reproduced in simulation and sometimes turn out to be RTL.',
      '<b>Regression skipped on small ECOs.</b> A one-line fix breaks something unrelated, and the prototype that would have caught it was not rerun.',
      '<b>Escape trend not reported.</b> Bugs found on the FPGA that DV missed are a measure of DV coverage, and without the trend nobody adds the missing tests.',
      '<b>Compiler and firmware bugs mixed with RTL bugs.</b> The RTL bug count looks worse than it is, and the software bugs lose their owners.',
    ],
    roles: [
      { r: 'FPGA verification lead', d: 'Owns triage, the tracker and the regression dashboard' },
      { r: 'Verification lead', d: 'Shares the burn-down and runs the DV side of triage' },
      { r: 'Block designers', d: 'Own and fix the RTL bugs assigned to them' },
      { r: 'Compiler architect', d: 'Owns the compiler bugs the prototype finds' },
      { r: 'Program manager', d: 'Approves the open-issue report that feeds tapeout' },
    ],
    effort: [
      ['Failure triage by owner', 1.75],
      ['Shared burn-down with DV', 1.5],
      ['Regression per RTL drop and ECO', 3],
      ['Weekly escape and open-issue report', 1.25],
      ['Regression dashboard', 0.5],
    ],
    entry: [
      'Tracker shared with the DV board in EDV-03',
      'First FPGA test results from FPV-04',
      'Regression suite defined from the test list in FPV-01',
    ],
    exit: [
      'Every failure triaged to RTL, compiler, firmware or platform with an owner',
      'Regression rerun on every drop and ECO with results published',
      'Open issues and escape trend reported weekly to the tapeout review',
    ],
    dependsOn: ['FPV-04', 'EDV-03', 'ERTL-03'],
    dependsNote: null,
    feedsInto: ['FPV-06', 'ETO-04', 'EDV-03'],
    measuredBy: [
      'Median days from failure to triage owner',
      'FPGA-found bugs that DV had not found, per drop',
      'Drops and ECOs with a full regression run against total',
    ],
    links: {
      dependsOn: ['FPV-04', 'ERTL-03'],
      feedsInto: ['FPV-06', 'ETO-04'],
      runsWith: ['EDV-03'],
      revisedBy: [],
      feedsBackInto: ['EDV-03', 'ERTL-05'],
    },
    terms: ['FPGA', 'DV', 'ECO', 'RTL'],
  },
  'FPV-06': {
    criticalPath: true,
    purpose: [
      'Run the full regression on the final RTL and <b>sign off the FPGA verification against the exit criteria set at the start</b>, so the tapeout Go / No-Go in ETO-05 reads a result rather than an opinion.',
      'The signoff is short because the work behind it is not. Every open issue leaves this activity either fixed or carried with a waiver and a plan—a silicon workaround, an SDK change or an errata entry—and the report says which of the FPGA’s known blind spots were closed elsewhere.',
    ],
    flowNote:
      'Step 1 runs the full regression on the final RTL, and step 2 checks the results against the exit criteria. Step 3 dispositions the open issues alongside step 2, since the check and the dispositions are read together. Step 4 signs off and hands the report to the tapeout decision.',
    consumes: [
      'FPGA verification results from FPV-04',
      'Bug tracker and regression dashboard from FPV-05',
      'Exit criteria from FPV-01',
      'Final tagged RTL including ECOs from ERTL-02',
      'DV closure status from EDV-06',
    ],
    rel: {
      'FPV-D6':
        '<b>FPGA verification signoff report.</b> The regression, the criteria check and the open-issue dispositions are signed off here.',
    },
    risks: [
      '<b>Regression run on an RTL that is not the tapeout RTL.</b> A late ECO lands after the run, and the signoff certifies a design that is not the one going to mask.',
      '<b>Exit criteria renegotiated at the end.</b> Criteria lowered to meet the date make the signoff decorative and move the risk to first silicon.',
      '<b>Open issues waived without a workaround.</b> A waiver needs a silicon, SDK or errata plan with an owner, or it is a bug accepted blind.',
      '<b>Blind spots not restated.</b> The report must repeat what the FPGA could not show, so the tapeout review does not read FPGA signoff as proof of power gating or analog behaviour.',
      '<b>Signoff too close to the Go / No-Go.</b> Two weeks leave no time to fix anything the final regression finds, so the final run starts as soon as the last ECO lands.',
    ],
    roles: [
      { r: 'FPGA verification lead', d: 'Owns the final regression and the signoff report' },
      { r: 'Verification lead', d: 'Confirms the FPGA and DV signoffs agree on open issues' },
      { r: 'Firmware lead', d: 'Signs the boot and SDK results and any software workarounds' },
      { r: 'Chief architect', d: 'Accepts the waivers and their workarounds' },
      { r: 'Program manager', d: 'Approves the signoff into the tapeout checklist' },
    ],
    effort: [
      ['Full regression on the final RTL', 0.6],
      ['Exit criteria check', 0.3],
      ['Open issue dispositions', 0.35],
      ['Signoff report', 0.25],
    ],
    entry: [
      'Final RTL with all ECOs tagged in ERTL-02',
      'Every test on the list run in FPV-04',
      'Open-issue list current in FPV-05',
    ],
    exit: [
      'Full regression passed on the tapeout RTL',
      'Every exit criterion met or waived with a workaround and owner',
      'Signoff report entered in the tapeout checklist before the Go / No-Go',
    ],
    dependsOn: ['FPV-04', 'FPV-05', 'EDV-06'],
    dependsNote: null,
    feedsInto: ['ETO-03', 'ETO-04', 'ETO-05'],
    measuredBy: [
      'Exit criteria met without waiver against total',
      'Open issues carried into tapeout with a workaround',
      'First-silicon bugs that the FPGA test list covered',
    ],
    links: {
      dependsOn: ['FPV-04', 'FPV-05', 'EDV-06'],
      feedsInto: ['ETO-03', 'ETO-04', 'ETO-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: ['EBU-07'],
    },
    terms: ['FPGA', 'RTL', 'ECO', 'SDK'],
  },
};
