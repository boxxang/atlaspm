import type { ActivityWriteUp } from '../activityDetailTypes';

export const EVK_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'EVK-01': {
    criticalPath: false,
    purpose: [
      'Write down <b>what the EVK has to do for a developer</b>: Arduino UNO and MKR headers, GPIO and USB access, current sensing on every processor rail, battery, USB and external power, and the cost, volume and certification it has to meet.',
      'For a part sold on energy per task and sleep current, the EVK is the first place a customer measures the claim. That makes it a measurement instrument as much as a development board, and the requirements have to say how accurately each rail is measured and across what range—from deep-sleep microamps to active milliamps—before a schematic is drawn.',
    ],
    flowNote:
      'Steps 1 to 3 define the developer interface, the energy instrumentation and the power options in turn, each building on the one before. Step 4 sets the cost, volume and certification targets alongside the power options, because those targets constrain which sources and connectors are affordable, and step 5 releases the requirements.',
    consumes: [
      'Customer and market requirements from EDEF-01',
      'Energy, sleep-current and KPI targets from EDEF-05',
      'Power domains and operating modes from PMU-01',
      'Package and pin-out frozen in EPKG-06',
      'Early access programme definition from EAP-01',
    ],
    rel: {
      'EVK-D1':
        '<b>EVK product requirements.</b> The requirements are written, agreed and released here.',
    },
    risks: [
      '<b>Measurement range not specified.</b> A current sensor sized for active mode reads nothing useful in deep sleep, and the one number the part is sold on cannot be shown on its own board.',
      '<b>Arduino compatibility assumed rather than specified.</b> UNO and MKR headers differ in voltage and pin function, and a board that is compatible in shape only frustrates developers with existing shields.',
      '<b>Validation board requirements copied across.</b> The EVB serves the lab and can be large and expensive; the EVK serves customers and cannot.',
      '<b>Certification left out of the targets.</b> A board sold to customers needs CE, FCC and UKCA marking, and design choices that make that hard are made at schematic.',
      '<b>Cost target set without a volume.</b> The BOM cost of an EVK depends heavily on build quantity, and a target without one cannot be checked.',
    ],
    roles: [
      { r: 'EVK product manager', d: 'Owns the requirements and their release' },
      { r: 'Board design engineer', d: 'Feasibility of each requirement on the board' },
      { r: 'Applications engineer', d: 'What developers need to evaluate the part' },
      { r: 'Power architect', d: 'Rails to be measured and the ranges on each' },
      { r: 'Compliance engineer', d: 'Certification targets for the markets the EVK ships to' },
    ],
    effort: [
      ['Developer interface requirements', 0.5],
      ['Energy instrumentation requirements', 0.5],
      ['Power option requirements', 0.25],
      ['Cost, volume and certification targets', 0.5],
      ['Requirements release', 0.25],
    ],
    entry: [
      'Package and pin-out frozen in EPKG-06',
      'Operating modes and rails defined in PMU-01',
      'Energy and sleep-current targets released from EDEF-05',
    ],
    exit: [
      'Measurement range and accuracy set for every processor rail',
      'Header, power and debug requirements agreed with applications',
      'Requirements released with cost, volume and certification targets',
    ],
    dependsOn: ['EPKG-06', 'PMU-01', 'EDEF-05'],
    dependsNote: null,
    feedsInto: ['EVK-02', 'EVKL-03', 'EVKL-05'],
    measuredBy: [
      'Requirements changed after release',
      'Rails with a specified measurement range against rails on the part',
      'Target BOM cost against the volume assumed',
    ],
    links: {
      dependsOn: ['EPKG-06', 'PMU-01', 'EDEF-05'],
      feedsInto: ['EVK-02', 'EVKL-03', 'EVKL-05'],
      runsWith: [],
      revisedBy: ['EAP-04'],
      feedsBackInto: [],
    },
    terms: ['EVK', 'CE marking', 'FCC', 'UKCA', 'BOM'],
  },
  'EVK-02': {
    criticalPath: false,
    purpose: [
      'Draw <b>the EVK schematic and freeze its BOM</b>: the power tree and source selection, the current sensing on every processor rail, the on-board programmer with USB and JTAG, and the headers and boot-mode switches.',
      'Most of the EVK’s value is in the current sensing, and most of its risk is in how the sources are selected. A battery, a USB port and an external supply have to be switched without back-feeding each other or the processor, and the sensing has to sit in each rail without adding a drop that changes what it measures.',
    ],
    flowNote:
      'Steps 1 to 3 design the power tree, the current sensing and the programmer in order, because the sense points sit in the rails the power tree defines and the programmer shares its USB power. Step 4 routes the GPIOs to the headers alongside the programmer, since the two touch different parts of the schematic, and step 5 reviews the whole and freezes the BOM against lead times.',
    consumes: [
      'EVK product requirements from EVK-01',
      'Pin-out, pad ring and lead map from EPKG-02',
      'Package footprint and drawings from EPKG-06',
      'Current measurement design from the validation board in EEVB-03',
      'Regulator and supply requirements from PMU-03',
    ],
    rel: {
      'EVK-D2':
        '<b>EVK schematics and BOM.</b> The schematic is drawn and reviewed, and the BOM frozen against lead times, here.',
    },
    risks: [
      '<b>Sense resistors sized for one range.</b> A single shunt cannot measure deep sleep and active mode on the same rail, and range switching has to be in the schematic.',
      '<b>Back-feeding between power sources.</b> A USB port powering the battery, or the programmer powering the processor through its I/O, corrupts sleep-current readings and can damage the part.',
      '<b>Programmer isolation left out.</b> A debug probe that leaks current into the processor rails adds to every measurement taken while it is connected.',
      '<b>Long-lead parts in the BOM.</b> Current-sense amplifiers and precision references can sit on long lead times, and the proto build waits for them.',
      '<b>Boot-mode straps disagree with the boot ROM.</b> Switches wired to the wrong state or pin leave the board unable to boot from the source the SDK expects.',
    ],
    roles: [
      { r: 'Board design engineer', d: 'Owns the schematic and the BOM' },
      { r: 'Power engineer', d: 'Power tree, source selection and sensing' },
      { r: 'Firmware lead', d: 'Boot-mode straps and programmer interface' },
      { r: 'Component engineer', d: 'Part selection and lead-time check' },
      { r: 'EVK product manager', d: 'Accepts the schematic against the requirements' },
    ],
    effort: [
      ['Power tree and source selection', 0.75],
      ['Current sensing on processor rails', 1],
      ['Programmer, USB and JTAG', 0.75],
      ['Headers and boot-mode switches', 0.75],
      ['Schematic review and BOM freeze', 0.75],
    ],
    entry: [
      'EVK requirements released from EVK-01',
      'Pin-out and package footprint frozen in EPKG-06',
      'Validation board sensing design available from EEVB-03',
    ],
    exit: [
      'Schematic reviewed against the requirements and the pin-out',
      'Every processor rail sensed across the required range',
      'BOM frozen with lead times inside the proto build date',
    ],
    dependsOn: ['EVK-01', 'EPKG-06', 'EPKG-02', 'EEVB-03'],
    dependsNote: null,
    feedsInto: ['EVK-03', 'EVK-04', 'SDK-03'],
    measuredBy: [
      'Schematic changes after BOM freeze',
      'BOM lines with lead time beyond the build date',
      'Rails with sensing against rails in the requirements',
    ],
    links: {
      dependsOn: ['EVK-01', 'EPKG-06', 'EPKG-02', 'EEVB-03'],
      feedsInto: ['EVK-03', 'EVK-04', 'SDK-03'],
      runsWith: [],
      revisedBy: ['EVKL-01'],
      feedsBackInto: [],
    },
    terms: ['BOM', 'JTAG', 'LDO', 'EVK'],
  },
  'EVK-03': {
    criticalPath: false,
    purpose: [
      'Lay the EVK out <b>so it measures what the part draws and nothing else</b>: stack-up and board floorplan, low-noise routing on the sense paths, power integrity on the processor supplies, and a DFM review before release.',
      'A current measurement in the microamp range is spoiled by leakage, ground offsets and noise picked up by the sense traces. The layout is where the board earns its accuracy, and it is also where the processor’s own supply noise is set, since the package models from EPKG-04 only hold if the board decoupling is what they assumed.',
    ],
    flowNote:
      'Step 1 sets the stack-up and floorplan, and step 2 routes the board with the sense paths first. Step 3 simulates power integrity alongside the routing, because the supply planes are fixed early and the results can move decoupling before the routing is finished; step 4 runs the DFM review, and step 5 releases the layout.',
    consumes: [
      'EVK schematics and BOM from EVK-02',
      'Package electrical models from EPKG-04',
      'Low-noise measurement layout from the validation board in EEVB-05',
      'Package footprint and drawings from EPKG-06',
      'Certification targets from EVK-01',
    ],
    rel: {
      'EVK-D3':
        '<b>EVK layout database.</b> The layout is routed, simulated, reviewed for manufacture and released here.',
    },
    risks: [
      '<b>Sense traces routed near switching nets.</b> Kelvin connections that pass a regulator or the USB lines pick up noise that looks like current.',
      '<b>Board leakage on the sleep-current path.</b> Flux residue, solder mask choices and trace spacing add leakage comparable to the deep-sleep current being measured.',
      '<b>Decoupling moved for routing convenience.</b> Capacitors placed away from the package pins undo the supply noise margin the package models assumed.',
      '<b>Layout reviewed without the board house.</b> A stack-up or via structure the board house cannot build is found when the first quote comes back.',
      '<b>Emissions not considered in the layout.</b> USB and switching regulator layouts that fail emissions testing reach certification in EVKL-03 as a respin.',
    ],
    roles: [
      { r: 'PCB designer', d: 'Owns the layout and its release' },
      { r: 'Board design engineer', d: 'Critical nets and layout constraints' },
      { r: 'SI/PI engineer', d: 'Board power integrity on the processor supplies' },
      { r: 'Board house engineer', d: 'Stack-up and DFM review' },
      { r: 'Compliance engineer', d: 'Layout practice for emissions and safety' },
    ],
    effort: [
      ['Stack-up and board floorplan', 0.5],
      ['Low-noise routing on the sense paths', 2],
      ['Board power integrity simulation', 0.75],
      ['DFM review with the board house', 0.5],
      ['Layout release', 0.25],
    ],
    entry: [
      'Schematic and BOM frozen in EVK-02',
      'Package electrical models released from EPKG-04',
      'Stack-up agreed with the board house',
    ],
    exit: [
      'Sense paths routed to the low-noise rules',
      'Power integrity on the processor supplies within the package model limits',
      'Layout released for fabrication with the DFM review closed',
    ],
    dependsOn: ['EVK-02', 'EPKG-04', 'EEVB-05'],
    dependsNote: null,
    feedsInto: ['EVK-04', 'EVKL-03'],
    measuredBy: [
      'Board leakage on the sleep-current path against the budget',
      'DFM findings open at release',
      'Supply noise on the processor rails against the limit',
    ],
    links: {
      dependsOn: ['EVK-02', 'EPKG-04', 'EEVB-05'],
      feedsInto: ['EVK-04', 'EVKL-03'],
      runsWith: [],
      revisedBy: ['EVK-04'],
      feedsBackInto: [],
    },
    terms: ['PCB', 'PI', 'DFM', 'EMC'],
  },
  'EVK-04': {
    criticalPath: false,
    purpose: [
      'Build the proto boards and <b>prove everything on them that does not need the processor</b>—power, programmer, USB and current sensing—before any silicon exists, and fix what is found in the EVT revision.',
      'Silicon arrives late and in small numbers, and every hour spent on an EVK power or sensing fault after it arrives is an hour taken from the samples. Bringing the board up with the processor site empty, and calibrating the sensors against a reference meter, means that when a sample is fitted, anything wrong is the silicon or the software, not the board.',
    ],
    flowNote:
      'Step 1 builds the boards and step 2 brings up power, the programmer and USB with no processor fitted. Step 3 calibrates the current sensors alongside step 2, on boards whose supplies are already up, and step 4 turns the findings of both into the EVT revision before step 5 releases the report.',
    consumes: [
      'EVK layout database from EVK-03',
      'EVK schematics and BOM from EVK-02',
      'Programmer firmware and board support from SDK-03',
      'Board bring-up method from the validation board in EEVB-09',
      'Calibration ranges from the EVK requirements in EVK-01',
    ],
    rel: {
      'EVK-D4':
        '<b>Proto boards, verified without silicon.</b> The proto boards are built, brought up with the processor site empty and calibrated here.',
    },
    risks: [
      '<b>Bring-up stops at power-good.</b> Rails that come up are not rails that sequence correctly under load, and a dummy load on the processor site is needed to prove it.',
      '<b>Calibration done at one current.</b> A sensor calibrated in active mode can be off by a large fraction in deep sleep, where the product claim lives.',
      '<b>Proto fixes left as wires.</b> Rework that makes the proto board work but is not captured in the EVT change list reappears on every EVT board.',
      '<b>Too few proto boards built.</b> Bring-up, calibration and software each need boards, and sharing one serialises the work.',
      '<b>Programmer firmware not ready.</b> Without it the programmer cannot be proven, and the first time it runs is with a sample fitted.',
    ],
    roles: [
      { r: 'Board design engineer', d: 'Owns the proto build and bring-up' },
      { r: 'Test technician', d: 'Assembly checks and bench measurements' },
      { r: 'Power engineer', d: 'Sequencing and calibration of the sensing' },
      { r: 'Firmware engineer', d: 'Programmer firmware and host tools' },
      { r: 'PCB designer', d: 'Layout changes for the EVT revision' },
    ],
    effort: [
      ['Proto fabrication and assembly', 0.5],
      ['Bring-up without silicon', 1],
      ['Current sensor calibration', 0.75],
      ['EVT revision fixes', 0.5],
      ['Bring-up report', 0.25],
    ],
    entry: [
      'Layout released from EVK-03',
      'Long-lead BOM parts received',
      'Programmer firmware available for the proto build',
    ],
    exit: [
      'Power, programmer and USB working with the processor site empty',
      'Current sensors calibrated across the full range on every rail',
      'EVT change list released with every proto fix captured',
    ],
    dependsOn: ['EVK-03', 'EVK-02', 'SDK-03'],
    dependsNote: null,
    feedsInto: ['EVK-05', 'EVKL-01'],
    measuredBy: [
      'Sensor error against the reference meter at each range',
      'Proto issues open at EVT release',
      'Boards available to software before silicon',
    ],
    links: {
      dependsOn: ['EVK-03', 'EVK-02', 'SDK-03'],
      feedsInto: ['EVK-05', 'EVKL-01'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: ['EVK-03'],
    },
    terms: ['PCB', 'EVT', 'EVK', 'SDK'],
  },
  'EVK-05': {
    criticalPath: true,
    purpose: [
      'Fit <b>the first engineering samples to the EVT boards</b>, program the first firmware, run the SDK examples and measure sleep and active currents against the datasheet targets, then release the boards to software and early access.',
      'This is the first time the product a customer will buy—part, board and software together—runs as one. The current measurements taken here are the first silicon evidence for the energy claims, and they have to be taken on calibrated boards, so a number that disagrees with the target is about the part rather than the instrument.',
    ],
    flowNote:
      'Step 1 fits the samples and step 2 programs the firmware and runs the SDK examples. Step 3 measures currents alongside the examples, because each example is also a known operating mode to measure, and step 4 releases the boards once both are done.',
    consumes: [
      'Engineering samples allocated in EASSY-05',
      'Proto bring-up and sensor calibration from EVK-04',
      'Silicon port of the SDK from SDK-06',
      'SDK examples from SDK-05',
      'Sleep and active current targets from EDEF-05',
    ],
    rel: {
      'EVK-D5':
        '<b>EVT boards built with engineering samples.</b> The EVT boards are built with samples fitted, measured and released here.',
    },
    risks: [
      '<b>Samples fitted before bring-up has powered one.</b> A part with a sequencing or reset problem damaged on the EVK costs a scarce sample, and the bring-up lab should go first.',
      '<b>Currents measured with the debugger attached.</b> The probe’s leakage is added to every sleep-current reading and the part looks worse than it is.',
      '<b>Measurements not correlated with the bring-up lab.</b> The EVK and the validation board disagree, and the argument about which is right delays the release.',
      '<b>eMRAM trim disturbed by board reflow.</b> Soldering the samples reheats the part, and the eMRAM contents have to be checked after assembly, not assumed.',
      '<b>Boards released to early access with known faults.</b> A customer’s first impression of the part is the EVK, and an unlisted fault is read as a silicon problem.',
    ],
    roles: [
      { r: 'Board design engineer', d: 'Owns the EVT build and the release' },
      { r: 'Firmware lead', d: 'First firmware and SDK examples on the boards' },
      { r: 'Power engineer', d: 'Sleep and active current measurements' },
      { r: 'Bring-up lead', d: 'Correlation with the bring-up lab' },
      { r: 'Field applications engineer', d: 'Receives boards for early-access customers' },
    ],
    effort: [
      ['Sample fitting on EVT boards', 0.25],
      ['First firmware and SDK examples', 0.75],
      ['Sleep and active current measurement', 0.75],
      ['Release to software and early access', 0.25],
    ],
    entry: [
      'Engineering samples received from EASSY-05',
      'Proto boards verified without silicon in EVK-04',
      'First power-on of the part completed in bring-up',
    ],
    exit: [
      'SDK examples running on the EVT boards',
      'Sleep and active currents measured against the datasheet targets',
      'EVT boards released to software and early access with a known-issues list',
    ],
    dependsOn: ['EASSY-05', 'EVK-04', 'SDK-06', 'EBU-02'],
    dependsNote:
      'Runs alongside the silicon port in SDK-06 and after first power-on in EBU-02, so the firmware on the first boards is whatever bring-up has proven that week.',
    feedsInto: ['EVKL-01', 'EAP-05', 'CREL-04'],
    measuredBy: [
      'EVT boards released against the plan',
      'Measured sleep current against the datasheet target',
      'SDK examples passing on EVT boards',
    ],
    links: {
      dependsOn: ['EASSY-05', 'EVK-04'],
      feedsInto: ['EVKL-01', 'EAP-05', 'CREL-04'],
      runsWith: ['SDK-06', 'EBU-02'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['EVT', 'SDK', 'eMRAM', 'EVK'],
  },
};
