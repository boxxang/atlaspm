import type { ActivityWriteUp } from '../activityDetailTypes';

export const SDK_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'SDK-01': {
    criticalPath: true,
    purpose: [
      'Write, verify and freeze the <b>boot ROM—the only software that ships inside the silicon and can never be patched</b>—with its boot modes, its image format, image authentication and the debug lock, in time to be frozen with the RTL.',
      'Every other piece of the SDK can be fixed with a download. A ROM bug is fixed with a mask change or lived with for the life of the part, and a boot path that fails on silicon can leave a customer unable to program the device at all. So the ROM is verified in RTL simulation and on the FPGA on every boot path, and its freeze date is the RTL Freeze, not a date of its own.',
    ],
    flowNote:
      'Step 1 defines the boot modes, and step 2 writes the ROM and the image format it reads. Step 3 adds authentication and the debug lock alongside step 2, since both change the image format. Step 4 verifies the ROM in simulation and on the FPGA images as they arrive, and step 5 freezes it with the RTL.',
    consumes: [
      'Security and safety architecture from EARCH-05',
      'eMRAM controller, ECC and trim specification from MRAM-02',
      'Register map and generated headers from ERTL-04',
      'JTAG and debug access architecture from EDFT-03',
      'Smoke-tested FPGA images from FPV-03',
    ],
    rel: {
      'SDK-D1':
        '<b>Boot ROM code, frozen for tapeout.</b> The ROM is written, verified on every boot path and frozen here.',
    },
    risks: [
      '<b>A boot path not verified before freeze.</b> The ROM cannot be patched, so a UART or SPI flash boot that fails on silicon is a mask change or a permanent erratum.',
      '<b>eMRAM boot written against the ideal memory.</b> The ROM reads eMRAM before trim and ECC are fully set up, and a ROM that assumes clean reads fails on marginal parts.',
      '<b>No recovery path.</b> If the image in eMRAM is corrupted and every other boot source is locked, the part cannot be reprogrammed, and the ROM must always leave one authenticated way back in.',
      '<b>Debug lock that cannot be unlocked for failure analysis.</b> Returned parts become impossible to debug, so the lock needs a controlled unlock path agreed with product engineering.',
      '<b>ROM frozen after the RTL.</b> A ROM change after RTL Freeze reopens synthesis and equivalence, so the ROM freeze is scheduled against the RTL Freeze rather than behind it.',
    ],
    roles: [
      { r: 'Firmware lead', d: 'Owns the ROM, its boot modes and the freeze' },
      { r: 'Security architect', d: 'Image authentication and the debug lock' },
      { r: 'Memory IP lead', d: 'eMRAM read sequence at boot before trim' },
      { r: 'FPGA verification lead', d: 'Runs every boot path on the prototype' },
      { r: 'Chief architect', d: 'Approves the frozen ROM for tapeout' },
    ],
    effort: [
      ['Boot mode definition', 0.75],
      ['ROM code and image format', 2.5],
      ['Authentication and debug lock', 1.75],
      ['Verification in simulation and on the FPGA', 2.5],
      ['Freeze with the RTL', 0.5],
    ],
    entry: [
      'Security architecture agreed in EARCH-05',
      'eMRAM controller specified in MRAM-02',
      'Register map for the boot peripherals published from ERTL-04',
    ],
    exit: [
      'Every boot mode booted in RTL simulation and on the FPGA',
      'Authenticated boot and debug lock verified, including the recovery path',
      'ROM code frozen and delivered into the RTL Freeze package',
    ],
    dependsOn: ['EARCH-05', 'MRAM-02', 'ERTL-04', 'EDFT-03'],
    dependsNote:
      'FPGA images from FPV-03 arrive from week 32, eight weeks into this activity, so boot-path verification on hardware has twelve weeks before the ROM freezes with the RTL.',
    feedsInto: ['FPV-03', 'ERTL-10', 'EBU-04', 'SDK-02'],
    measuredBy: [
      'Boot paths verified on the FPGA against total',
      'ROM changes after the freeze',
      'Boot failures on first silicon attributed to the ROM',
    ],
    links: {
      dependsOn: ['EARCH-05', 'MRAM-02', 'ERTL-04', 'EDFT-03'],
      feedsInto: ['FPV-03', 'ERTL-10', 'EBU-04', 'SDK-02'],
      runsWith: ['FPV-04'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['ROM', 'eMRAM', 'JTAG', 'ECC', 'RTL'],
  },
  'SDK-02': {
    criticalPath: false,
    purpose: [
      'Define the <b>hardware abstraction layer and write the drivers</b> for every peripheral and for the power modes and wake sources, tested on the virtual platform and the FPGA long before silicon.',
      'On an ultra-low-power part the drivers decide the battery life as much as the silicon does: a driver that leaves a clock running or polls instead of sleeping throws away the sleep current the PMU was designed for. The HAL is therefore judged on energy as well as function, and the power-mode drivers are written by the same team as the peripheral drivers so the two agree on who turns what off.',
    ],
    flowNote:
      'Step 1 fixes the HAL API and coding standard before any driver is written. Steps 2 and 3 write the peripheral and power-mode drivers, and step 4 tests them alongside on the virtual platform and each FPGA image, so a driver is tested in the week it is written. Step 5 releases the HAL to early access.',
    consumes: [
      'Register map and generated headers from ERTL-04',
      'SoC virtual platform from VP-01',
      'FPGA prototype releases from VP-02',
      'Always-on domain and wake sources from PMU-04',
      'Boot ROM image format from SDK-01',
    ],
    rel: {
      'SDK-D2':
        '<b>Hardware abstraction layer and peripheral drivers.</b> The HAL and every driver are written, tested and released here.',
    },
    risks: [
      '<b>Drivers that waste the sleep current.</b> A driver that holds a clock request or a peripheral enabled keeps the chip out of deep sleep, and the lifetime the Playground promised is not delivered.',
      '<b>HAL API changed after early access.</b> Customer code written against the first release breaks, and the partners stop trusting the SDK.',
      '<b>Tested only on the virtual platform.</b> The platform models registers faithfully but not timing, and interrupt races appear only on the FPGA or on silicon.',
      '<b>Headers edited by hand.</b> Driver headers drift from the register map, and a register moved in the RTL is written to the wrong address.',
      '<b>ADC and analog peripherals driven from models.</b> The FPGA cannot show real analog behaviour, so the ADC driver keeps a silicon test list for SDK-06.',
    ],
    roles: [
      { r: 'Firmware engineer', d: 'Owns the HAL and the drivers' },
      { r: 'Firmware lead', d: 'API design and the coding standard' },
      { r: 'Register map owner', d: 'Generated headers the drivers build on' },
      { r: 'Power architect', d: 'Defines the power-mode and wake behaviour the drivers implement' },
      { r: 'Field applications engineer', d: 'Approves the release to early-access partners' },
    ],
    effort: [
      ['HAL API and coding standard', 1.5],
      ['Peripheral drivers', 8],
      ['Power-mode and wake-source drivers', 4],
      ['Driver testing on platform and FPGA', 5.5],
      ['Release to early access', 1],
    ],
    entry: [
      'Register map and headers generated from ERTL-04',
      'Virtual platform released from VP-01',
      'Wake sources specified in PMU-04',
    ],
    exit: [
      'Every peripheral and power mode has a driver passing its tests on the FPGA',
      'HAL API documented and frozen for early access',
      'Drivers shown to reach deep sleep with no clock left requested',
    ],
    dependsOn: ['ERTL-04', 'VP-01', 'VP-02', 'PMU-04'],
    dependsNote: null,
    feedsInto: ['SDK-03', 'SDK-04', 'FPV-04', 'EAP-03'],
    measuredBy: [
      'Drivers passing their tests on the current FPGA image against total',
      'HAL API changes after the early-access release',
      'Sleep current reached with the drivers against the PMU budget',
    ],
    links: {
      dependsOn: ['ERTL-04', 'VP-01', 'VP-02', 'PMU-04'],
      feedsInto: ['SDK-03', 'SDK-04', 'FPV-04', 'EAP-03'],
      runsWith: [],
      revisedBy: ['EAP-04', 'SDK-01'],
      feedsBackInto: ['ERTL-04'],
    },
    terms: ['HAL', 'SDK', 'DMA', 'FPGA'],
  },
  'SDK-03': {
    criticalPath: false,
    purpose: [
      'Port <b>Zephyr and FreeRTOS</b> to the scalar core, integrate tickless idle with the chip’s sleep modes, write the EVK board support package, and let RTOS tasks hand work to the fabric through the compiler.',
      'Embedded customers do not adopt a processor, they adopt a processor their RTOS already runs on. The port is only credible if the RTOS sleeps as deeply as the hardware allows—an RTOS that wakes on every tick spends the battery the architecture saved—and if a task can call a fabric kernel as easily as a function.',
    ],
    flowNote:
      'Step 1 ports both kernels to the scalar core, and step 2 ties tickless idle to the sleep modes once the port boots. Step 3 writes the EVK board support package from the EVK schematic, and step 4 runs alongside it, building the fabric offload from RTOS tasks with the compiler team. Step 5 releases the ports.',
    consumes: [
      'HAL and power-mode drivers from SDK-02',
      'Power architecture and operating modes from PMU-01',
      'EVK schematic and BOM from EVK-02',
      'Fabric scheduler and calling convention from CMP-04',
      'FPGA prototype releases from VP-02',
    ],
    rel: {
      'SDK-D3':
        '<b>RTOS ports and board support packages.</b> The Zephyr and FreeRTOS ports and the EVK board support package are built and released here.',
    },
    risks: [
      '<b>Tickless idle that never reaches deep sleep.</b> A periodic timer left armed keeps the system in light sleep, and measured battery life falls short of every estimate.',
      '<b>Fabric offload that blocks the scheduler.</b> A task waiting on the fabric must yield, or one kernel call stalls every other task in the system.',
      '<b>Port kept out of upstream.</b> A fork of Zephyr maintained privately falls behind with every release, and customers must choose between the chip and a current RTOS.',
      '<b>BSP written against a board that changes.</b> The EVK schematic moves until layout, so the BSP is built from the pin map and updated with each schematic revision.',
      '<b>Context switch cost not measured.</b> Saving fabric state on a context switch can cost more energy than the task, and the offload design must say when it is not worth it.',
    ],
    roles: [
      { r: 'Firmware engineer', d: 'Owns the RTOS ports and the board support packages' },
      { r: 'Firmware lead', d: 'Upstream strategy and review of the ports' },
      { r: 'Compiler engineer', d: 'Fabric offload interface from RTOS tasks' },
      { r: 'Board design engineer', d: 'EVK pin map and board revisions for the BSP' },
      { r: 'Power architect', d: 'Approves the sleep-mode integration against the energy budget' },
    ],
    effort: [
      ['Zephyr and FreeRTOS ports', 5],
      ['Tickless idle and sleep modes', 3.5],
      ['EVK board support package', 2.5],
      ['Fabric offload from RTOS tasks', 3.5],
      ['Release', 1.5],
    ],
    entry: [
      'HAL and power-mode drivers passing on the FPGA from SDK-02',
      'Fabric calling convention agreed with CMP-04',
      'EVK pin map drafted in EVK-02',
    ],
    exit: [
      'Both RTOS kernels boot and pass their test suites on the FPGA',
      'Tickless idle reaches the deepest sleep mode the application allows',
      'EVK board support package and fabric offload released',
    ],
    dependsOn: ['SDK-02', 'PMU-01', 'EVK-02', 'CMP-04'],
    dependsNote:
      'The EVK schematic from EVK-02 starts in week 60, sixteen weeks after this activity, so the ports are brought up on the FPGA boards first and the EVK board support package follows.',
    feedsInto: ['SDK-05', 'SDK-06', 'EVK-04', 'FPV-04'],
    measuredBy: [
      'RTOS test suite pass rate on the current FPGA image',
      'Idle current with the RTOS running against the deep-sleep budget',
      'Patches accepted upstream against those submitted',
    ],
    links: {
      dependsOn: ['SDK-02', 'PMU-01', 'EVK-02', 'CMP-04'],
      feedsInto: ['SDK-05', 'SDK-06', 'EVK-04'],
      runsWith: ['SDK-04'],
      revisedBy: ['CMP-07'],
      feedsBackInto: ['FPV-04'],
    },
    terms: ['RTOS', 'BSP', 'EVK', 'RTC'],
  },
  'SDK-04': {
    criticalPath: false,
    purpose: [
      'Build the <b>DSP, image and ML libraries that make the energy claim real</b>: FFT, filters, matrix and convolution kernels hand-optimised for the fabric, and a runtime for compiled LiteRT and ONNX models, each benchmarked against the incumbent MCUs.',
      'Customers judge the part on their own workloads, and most of those workloads are a handful of standard kernels. If the library FFT is slower or hungrier than the one on the MCU they already use, no architecture slide recovers the sale. The benchmarks are run the same way on both parts and published with the method, because they will be checked.',
    ],
    flowNote:
      'Step 1 picks the kernels from the workload suite, and step 2 optimises each for the fabric. Step 3 wraps the ML runtime around the compiled models once the import path exists, and step 4 benchmarks each kernel alongside it as each is finished, so a kernel that loses is reworked before release. Step 5 releases the libraries.',
    consumes: [
      'Embedded workload suite and energy baselines from FCD-01',
      'Competitive benchmarks of the incumbent MCUs from EDEF-02',
      'LiteRT and ONNX model import path from CMP-05',
      'Fabric scheduler and placement from CMP-04',
      'HAL and peripheral drivers from SDK-02',
    ],
    rel: {
      'SDK-D4':
        '<b>DSP, image and ML libraries optimised for the fabric.</b> The kernels and the ML runtime are optimised, benchmarked and released here.',
    },
    risks: [
      '<b>Benchmarks run unfairly.</b> Comparing a hand-tuned fabric kernel with an unoptimised incumbent build is found out the first time a customer reruns it, and the credibility of every other number goes with it.',
      '<b>Hand optimisation the compiler cannot follow.</b> Kernels tuned around compiler weaknesses break with every compiler release, so the fixes go back into the compiler where they can.',
      '<b>ML runtime tied to one model format version.</b> LiteRT and ONNX move quickly, and a runtime that supports one operator set is out of date by launch.',
      '<b>Energy measured on the simulator only.</b> Library energy figures are model numbers until CREL-04 repeats them on silicon, and they are published with that caveat.',
      '<b>Kernels chosen by the team rather than the customers.</b> The library optimises what was interesting to build, and the kernels customers actually call remain slow.',
    ],
    roles: [
      { r: 'Applications engineer', d: 'Owns the kernels, the runtime and the benchmarks' },
      { r: 'ML compiler engineer', d: 'Model import path the runtime sits on' },
      { r: 'Compiler engineer', d: 'Takes kernel optimisations back into the compiler' },
      { r: 'Workload architect', d: 'Checks the kernel selection against the workload suite' },
      { r: 'Product marketing lead', d: 'Approves the benchmark method and publication' },
    ],
    effort: [
      ['Kernel selection', 1],
      ['Fabric-optimised kernels', 8],
      ['ML runtime for compiled models', 4.5],
      ['Benchmarks against the incumbent MCUs', 3.5],
      ['Release', 1],
    ],
    entry: [
      'Workload suite and baselines released from FCD-01',
      'Compiler producing scheduled kernels from CMP-04',
      'Model import path in development in CMP-05',
    ],
    exit: [
      'Every selected kernel optimised and benchmarked against the incumbents',
      'ML runtime running the reference models from the workload suite',
      'Libraries released with the benchmark method documented',
    ],
    dependsOn: ['FCD-01', 'CMP-04', 'CMP-05', 'SDK-02'],
    dependsNote: null,
    feedsInto: ['SDK-05', 'SDK-06', 'CREL-04', 'CMP-04'],
    measuredBy: [
      'Energy per kernel against the best incumbent MCU',
      'Kernels whose results match the reference implementation bit-for-bit or within tolerance',
      'Reference models from the workload suite running on the runtime',
    ],
    links: {
      dependsOn: ['FCD-01', 'CMP-04', 'CMP-05', 'SDK-02'],
      feedsInto: ['SDK-05', 'SDK-06', 'CREL-04'],
      runsWith: ['SDK-03'],
      revisedBy: ['CMP-07', 'EAP-04'],
      feedsBackInto: ['CMP-04'],
    },
    terms: ['DSP', 'ML', 'LiteRT', 'ONNX', 'MCU'],
  },
  'SDK-05': {
    criticalPath: false,
    purpose: [
      'Write <b>the documentation a developer reads before deciding whether the part is worth their time</b>: quick-start and installation guides, the reference manual and API documentation, an example application for each target segment, and a portal that holds them.',
      'For a new architecture with its own compiler, the documentation is part of the product. An engineer evaluating the part will try the quick-start on a Friday afternoon, and if it fails they will not come back. So every guide is run from a clean machine and reviewed by early-access users before it is published.',
    ],
    flowNote:
      'Step 1 writes the quick-start and installation guides first because every other document assumes them. Step 2 writes the reference manual and API documentation, and step 3 builds the example applications alongside it, since each example is also a test of the reference. Step 4 publishes the portal, and step 5 reviews it with early-access users.',
    consumes: [
      'HAL and peripheral drivers from SDK-02',
      'RTOS ports and board support packages from SDK-03',
      'DSP, image and ML libraries from SDK-04',
      'Playground sample projects and tutorials from VP-03',
      'Pre-silicon onboarding feedback from EAP-03',
    ],
    rel: {
      'SDK-D5':
        '<b>Examples, documentation portal and quick-start guides.</b> The guides, the reference, the examples and the portal are written and published here.',
    },
    risks: [
      '<b>Quick-start not tested from a clean machine.</b> It works on the writer’s laptop with a dozen tools already installed and fails for every new user.',
      '<b>API documentation written by hand.</b> It drifts from the headers with every release, and generated reference with written explanations is the only kind that stays true.',
      '<b>Examples that only run on the simulator.</b> An example that cannot be moved to the EVK unchanged teaches the user a workflow they cannot ship.',
      '<b>Energy claims in examples without method.</b> Every energy number in the documentation will be measured by a customer, so each states how it was measured.',
      '<b>Written for the team, not the customer.</b> Documentation that assumes knowledge of the fabric loses the embedded engineer who knows only C and an RTOS.',
    ],
    roles: [
      { r: 'Technical writer', d: 'Owns the guides, the reference and the portal' },
      { r: 'Firmware engineer', d: 'Technical accuracy of the HAL and RTOS material' },
      { r: 'Applications engineer', d: 'Builds and maintains the example applications' },
      { r: 'Developer platform lead', d: 'Portal hosting and its link to the Playground' },
      { r: 'Field applications engineer', d: 'Approves the documentation after the early-access review' },
    ],
    effort: [
      ['Quick-start and installation guides', 1.5],
      ['Reference manual and API documentation', 3.5],
      ['Example applications per segment', 2.5],
      ['Documentation portal', 1.5],
      ['Early-access review', 1],
    ],
    entry: [
      'HAL API frozen for early access in SDK-02',
      'RTOS ports released from SDK-03',
      'Early-access partners onboarding in EAP-03',
    ],
    exit: [
      'Quick-start passed from a clean machine on each supported host',
      'API reference generated from the released headers',
      'Portal published and reviewed by early-access users with findings closed',
    ],
    dependsOn: ['SDK-02', 'SDK-03', 'SDK-04', 'EAP-03'],
    dependsNote: null,
    feedsInto: ['SDK-06', 'EMP-11', 'EVKL-05', 'CREL-05'],
    measuredBy: [
      'Time for a new user to complete the quick-start',
      'Examples that build and run unchanged on the current SDK',
      'Documentation issues raised by early-access users and closed',
    ],
    links: {
      dependsOn: ['SDK-02', 'SDK-03', 'SDK-04'],
      feedsInto: ['SDK-06', 'EMP-11', 'EVKL-05', 'CREL-05'],
      runsWith: ['EAP-03'],
      revisedBy: ['EAP-04'],
      feedsBackInto: [],
    },
    terms: ['SDK', 'HAL', 'EVK', 'RTOS'],
  },
  'SDK-06': {
    criticalPath: true,
    purpose: [
      'Bring the SDK up on <b>first silicon and release it as a Beta validated on real parts</b>: the drivers and libraries rerun on silicon, silicon-specific issues fixed, and every erratum given a workaround the SDK carries.',
      'Everything before this ran on models. The Beta is the first release whose claims are measured, and it gates the EVK engineering samples going to partners and the Compiler and SDK 1.0 release. Its closing checkpoint is SDK Beta on Silicon, so the port is staffed to start the day bring-up boots the part, not after bring-up finishes.',
    ],
    flowNote:
      'Step 1 brings the SDK up on silicon with the bring-up team as soon as the part boots. Step 2 reruns the driver and library suites, and step 3 fixes the silicon-specific issues and writes errata workarounds alongside it, feeding each back to the errata list as it is found. Step 4 releases the Beta.',
    consumes: [
      'Booting silicon and first firmware load from EBU-04',
      'Units allocated for SDK bring-up from EASSY-05',
      'EVT boards with engineering samples from EVK-05',
      'Driver, RTOS and library test suites from SDK-02, SDK-03 and SDK-04',
      'Errata list from EBU-07',
    ],
    rel: {
      'SDK-D6':
        '<b>SDK Beta, validated on first silicon.</b> The SDK is ported to silicon, validated and released as a Beta here.',
    },
    risks: [
      '<b>Silicon bugs fixed silently in drivers.</b> A workaround with no erratum hides a hardware bug from the respin decision and from customers writing their own drivers.',
      '<b>Too few units for software.</b> Bring-up and characterisation take the first parts, and the SDK team validates on one board while partners wait.',
      '<b>Analog peripherals first tested here.</b> ADC and clock behaviour could not be shown on the FPGA, and those drivers carry the most silicon risk.',
      '<b>Sleep current measured for the first time.</b> If deep sleep on silicon misses the budget, the SDK gets the blame until the measurement proves otherwise.',
      '<b>Beta released on one silicon corner.</b> Drivers tuned on a fast part fail on a slow one, so the Beta is validated on parts from more than one wafer.',
    ],
    roles: [
      { r: 'Firmware lead', d: 'Owns the silicon port and the Beta release' },
      { r: 'Bring-up lead', d: 'Shares the first booted parts and the bring-up bench' },
      { r: 'Firmware engineer', d: 'Reruns and fixes the drivers and RTOS on silicon' },
      { r: 'Product engineering', d: 'Records errata and agrees each workaround' },
      { r: 'Release manager', d: 'Approves the Beta release' },
    ],
    effort: [
      ['SDK bring-up on first silicon', 1.25],
      ['Driver and library suites on silicon', 1.25],
      ['Silicon fixes and errata workarounds', 1.25],
      ['Beta release', 0.25],
    ],
    entry: [
      'Silicon booting and loading firmware in EBU-04',
      'Units allocated to software in EASSY-05',
      'Driver, RTOS and library suites passing on the FPGA',
    ],
    exit: [
      'Driver and library suites passed on silicon from more than one wafer',
      'Every silicon issue fixed or carried as an erratum with a workaround',
      'SDK Beta released to the early-access partners',
    ],
    dependsOn: ['EBU-04', 'EASSY-05', 'EVK-05', 'SDK-04'],
    dependsNote:
      'This activity overlaps bring-up in EBU-04 on purpose, so it competes with bring-up for the first units and the allocation in EASSY-05 has to reserve parts for software.',
    feedsInto: ['CREL-02', 'CREL-05', 'EAP-05', 'EBU-07'],
    measuredBy: [
      'Driver and library tests passing on silicon against the FPGA baseline',
      'Silicon issues found with an erratum and workaround',
      'Weeks from first boot to the Beta release',
    ],
    links: {
      dependsOn: ['EBU-04', 'EASSY-05', 'EVK-05', 'SDK-04'],
      feedsInto: ['CREL-02', 'CREL-05', 'EAP-05'],
      runsWith: ['EBU-05'],
      revisedBy: ['EBU-07'],
      feedsBackInto: ['EBU-07'],
    },
    terms: ['SDK', 'EVK', 'EVT', 'RTOS'],
  },
};
