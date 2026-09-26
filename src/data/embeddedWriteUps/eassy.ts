import type { ActivityWriteUp } from '../activityDetailTypes';

export const EASSY_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'EASSY-01': {
    criticalPath: false,
    purpose: [
      'Build <b>the leadframes or substrates and the assembly tooling while the wafers are in the fab</b>, and qualify them on dummy dice, so the OSAT line is ready the day the first wafers are sorted.',
      'The fab takes about four months from wafer start to shipment, and the package tooling takes most of that too. Running the two in parallel is the only way the first engineering samples arrive weeks rather than months after first silicon, and it only works if the tooling is proven on dummy dice before a real wafer is committed to it.',
    ],
    flowNote:
      'Step 1 releases the frozen drawings, and step 2 builds and inspects the first leadframe or substrate lots. Step 3 builds the bond, mold and trim-form tooling alongside them, because the two come from different suppliers and neither needs the other until qualification; step 4 qualifies the whole set on dummy dice, and step 5 releases it to the OSAT line.',
    consumes: [
      'Package design freeze and tooling orders from EPKG-06',
      'Leadframe or substrate design database from EPKG-03',
      'OSAT selection and assembly specification from EPKG-05',
      'Fab schedule and expected wafer out date from EFAB-02',
      'Final package test board readiness from ETEST-05',
    ],
    rel: {
      'EASSY-D1':
        '<b>Assembly tooling and materials, qualified.</b> The leadframes or substrates and the tooling are built, qualified on dummy dice and released here.',
      'EASSY-D3':
        '<b>Engineering sample lot, assembled.</b> The engineering lot is assembled on the tooling and materials qualified here.',
    },
    risks: [
      '<b>Tooling qualified on the drawing, not on dice.</b> A mold or trim-form tool that has never run a strip hides its problems until it runs the first real one.',
      '<b>First leadframe or substrate lot accepted without inspection.</b> Plating, flatness and dimensional faults on the first lot become bond and mold failures on the engineering samples.',
      '<b>Tooling finished late against the fab.</b> Wafers that wait at the OSAT for tooling waste the weeks the parallel build was meant to save.',
      '<b>Dummy dice that do not represent the real die.</b> A dummy of the wrong size or thickness qualifies a process the real die will not see.',
      '<b>Materials not matched to the assembly specification.</b> Mold compound and die attach chosen by the OSAT by default may not meet the eMRAM thermal limits written into the specification.',
    ],
    roles: [
      { r: 'Package engineer', d: 'Owns the tooling build, qualification and release' },
      { r: 'Supply chain manager', d: 'Supplier delivery against the fab out date' },
      { r: 'OSAT process engineer', d: 'Runs the dummy-dice qualification on the line' },
      { r: 'Quality engineer', d: 'Incoming inspection of leadframe or substrate lots' },
      { r: 'Program manager', d: 'Keeps tooling and fab dates in step' },
    ],
    effort: [
      ['Drawing release to the supplier', 0.25],
      ['First leadframe or substrate lots and inspection', 1],
      ['Bond, mold and trim-form tooling', 1],
      ['Dummy-dice qualification', 0.5],
      ['Release to the OSAT line', 0.25],
    ],
    entry: [
      'Package design frozen and tooling ordered in EPKG-06',
      'OSAT selected and assembly specification issued in EPKG-05',
      'Wafer start confirmed, fixing the date tooling must be ready',
    ],
    exit: [
      'First leadframe or substrate lots inspected and accepted',
      'Tooling qualified on dummy dice with no open findings',
      'Tooling and materials released to the OSAT line ahead of the first wafers',
    ],
    dependsOn: ['EPKG-06', 'EPKG-05', 'EPKG-03'],
    dependsNote:
      'Runs in parallel with wafer processing in EFAB-06 and EFAB-07; the date it must finish is set by the wafer shipment in EFAB-10, not by the stage.',
    feedsInto: ['EASSY-03'],
    measuredBy: [
      'Tooling ready date against the wafer shipment date',
      'Dummy-dice qualification findings open at release',
      'Incoming leadframe or substrate lot rejects',
    ],
    links: {
      dependsOn: ['EPKG-06', 'EPKG-05', 'EPKG-03'],
      feedsInto: ['EASSY-03'],
      runsWith: ['EFAB-06', 'EFAB-07'],
      revisedBy: ['EASSY-04'],
      feedsBackInto: [],
    },
    terms: ['OSAT', 'QFN', 'FC-CSP', 'eMRAM'],
  },
  'EASSY-02': {
    criticalPath: true,
    purpose: [
      'Sort <b>the first wafers against engineering limits, trim the eMRAM</b>, review the maps and bank the good die with traceability, so the first engineering lot is built from die that are known to work.',
      'First-lot sort is not a production screen: the limits are engineering limits, the program is new and the tester is still being correlated. What matters is that no die goes to assembly without its eMRAM trimmed and verified, that marginal die are dispositioned by a person rather than a bin, and that every banked die can be traced back to its wafer position when bring-up finds something.',
    ],
    flowNote:
      'The four steps run in sequence on each wafer: the prober is set up, the wafer is sorted with the eMRAM trim, the map is reviewed and the marginal die dispositioned, and the good die are banked. Later wafers overlap earlier ones, but no step is started on a wafer before the one before it has finished.',
    consumes: [
      'First wafers from EFAB-10',
      'Wafer acceptance and lot disposition from EFAB-09',
      'Wafer sort program from ETEST-06',
      'Qualified probe card from ETEST-04',
      'eMRAM test, repair and trim flow from MRAM-06',
    ],
    rel: {
      'EASSY-D2':
        '<b>First-lot wafer sort results and die bank.</b> The sort data, the dispositions and the banked die are produced here.',
      'EASSY-D3':
        '<b>Engineering sample lot, assembled.</b> The engineering lot is built only from the die banked here.',
    },
    risks: [
      '<b>eMRAM trim values written but not verified.</b> A trim that does not read back correctly after power cycling makes the die fail in ways bring-up will blame on the design.',
      '<b>Limits set too tight on a new program.</b> Engineering limits that reject good die starve the first lot, while limits too loose bank die that waste bring-up time.',
      '<b>Marginal die binned automatically.</b> The first lot is where a systematic issue shows up, and marginal die need a person to look at the map before they are scrapped or kept.',
      '<b>Traceability lost at the die bank.</b> A failing unit in bring-up that cannot be traced to its wafer and position cannot be correlated with sort or inline data.',
      '<b>Sort data not loaded into the yield database.</b> The first-lot data is the baseline yield learning starts from, and data left on the tester is lost.',
    ],
    roles: [
      { r: 'Test engineer', d: 'Owns the sort, the trim and the die bank' },
      { r: 'Product engineering', d: 'Dispositions the marginal die' },
      { r: 'Memory IP lead', d: 'eMRAM trim results and their acceptance' },
      { r: 'Yield engineer', d: 'Wafer map review and baseline yield' },
      { r: 'Test data engineer', d: 'Loads sort data with traceability' },
    ],
    effort: [
      ['Prober set-up for the first wafers', 0.25],
      ['Sort with eMRAM trim', 0.5],
      ['Wafer map review and disposition', 0.5],
      ['Die bank with traceability', 0.25],
    ],
    entry: [
      'First wafers received from EFAB-10',
      'Sort program released from ETEST-06',
      'eMRAM trim flow released from MRAM-06',
    ],
    exit: [
      'Every die sorted, with eMRAM trim programmed and verified',
      'Marginal die dispositioned by product engineering',
      'Good die banked with wafer and position traceability',
    ],
    dependsOn: ['EFAB-10', 'EFAB-09', 'ETEST-06', 'ETEST-04', 'MRAM-06'],
    dependsNote: null,
    feedsInto: ['EASSY-03', 'EASSY-05', 'EMP-02'],
    measuredBy: [
      'First-lot sort yield against the plan',
      'eMRAM trim pass rate on first read-back',
      'Banked die traceable to wafer and position',
    ],
    links: {
      dependsOn: ['EFAB-10', 'EFAB-09', 'ETEST-06', 'ETEST-04', 'MRAM-06'],
      feedsInto: ['EASSY-03', 'EASSY-05', 'EMP-02'],
      runsWith: [],
      revisedBy: ['ETEST-11'],
      feedsBackInto: [],
    },
    terms: ['eMRAM', 'ATE', 'STDF', 'WAT'],
  },
  'EASSY-03': {
    criticalPath: true,
    purpose: [
      'Assemble <b>the first engineering sample lot</b>—backgrind, dice, attach, wire-bond or flip-chip attach, mold, mark and singulate—and check every unit for opens and shorts before it leaves the line.',
      'This is the first time the real die meets the real package, and the lot has to serve bring-up, the EVK, qualification and early customers at once. The work is ordinary assembly, but on a new part it is run with the OSAT’s engineers on the line, because the first lot is where bond parameters are tuned and where an eMRAM part sees its first mold cure.',
    ],
    flowNote:
      'Steps 1 to 3 are the assembly flow itself and run in order. Step 4 runs alongside singulation, because open/short is checked on strips as they come off the line rather than on the whole lot at the end, and step 5 releases the lot once every unit has a result.',
    consumes: [
      'Banked good die from EASSY-02',
      'Qualified tooling and materials from EASSY-01',
      'Assembly specification from EPKG-05',
      'Wire-bond diagram or ball map from EPKG-03',
      'eMRAM reflow and thermal limits from MRAM-03',
    ],
    rel: {
      'EASSY-D3':
        '<b>Engineering sample lot, assembled.</b> The lot is assembled, checked for opens and shorts and released here.',
    },
    risks: [
      '<b>Bond parameters carried over from the dummy dice.</b> Real bond pads on the real die metal stack can need different settings, and the first strips are where it shows.',
      '<b>Mold cure outside the eMRAM limit.</b> A cure profile chosen by the OSAT by default can shift the trim written at sort, and the units then fail in bring-up for a reason no one looks for.',
      '<b>Backgrind stress on a thin die.</b> Thinning for a low-profile package can crack or warp the die, and the damage appears as intermittent failures later.',
      '<b>Open/short run only at the end.</b> A systematic bond fault found after the whole lot is molded costs the lot; found on the first strip it costs a strip.',
      '<b>Units mixed between wafers.</b> Without wafer traceability carried through assembly, a failure cannot be tied back to the sort data that explains it.',
    ],
    roles: [
      { r: 'Package engineer', d: 'Owns the lot and its release' },
      { r: 'OSAT process engineer', d: 'Runs and tunes the assembly line' },
      { r: 'Test engineer', d: 'Open/short and continuity results' },
      { r: 'Reliability engineer', d: 'Cure and thermal limits for eMRAM' },
      { r: 'Program manager', d: 'Tracks the lot against the sample date' },
    ],
    effort: [
      ['Backgrind and dicing', 0.25],
      ['Die attach and wire-bond or flip-chip attach', 0.75],
      ['Mold, mark and singulate', 0.5],
      ['Open/short and continuity test', 0.25],
      ['Lot release', 0.25],
    ],
    entry: [
      'Good die banked in EASSY-02',
      'Tooling and materials released from EASSY-01',
      'OSAT line reserved for the engineering lot',
    ],
    exit: [
      'Every unit assembled with wafer traceability carried through',
      'Open/short and continuity results for every unit',
      'Engineering lot released to inspection and allocation',
    ],
    dependsOn: ['EASSY-02', 'EASSY-01', 'EPKG-05'],
    dependsNote: null,
    feedsInto: ['EASSY-04', 'EASSY-05', 'EMP-06'],
    measuredBy: [
      'Assembly yield at open/short',
      'Lot cycle time from die bank to release',
      'Units traceable to wafer and position',
    ],
    links: {
      dependsOn: ['EASSY-02', 'EASSY-01', 'EPKG-05'],
      feedsInto: ['EASSY-04', 'EASSY-05', 'EMP-06'],
      runsWith: [],
      revisedBy: ['EASSY-04'],
      feedsBackInto: [],
    },
    terms: ['OSAT', 'QFN', 'eMRAM', 'MSL'],
  },
  'EASSY-04': {
    criticalPath: true,
    purpose: [
      'Inspect <b>what assembly did to the part</b>—X-ray on the wire bonds and voids, acoustic microscopy on the molded units—build the yield pareto by process step and agree the corrective actions with the OSAT.',
      'Units that pass open/short can still carry delamination, voids or swept wires that fail in qualification or in a customer’s reflow. Samples do not ship until inspection has cleared them, which is why this activity sits on the path to the engineering sample checkpoint rather than beside it.',
    ],
    flowNote:
      'Steps 1 and 2 inspect the units, and step 3 builds the yield pareto from their results and the open/short data. Step 4 runs alongside the pareto, because corrective actions for a finding already understood are agreed with the OSAT without waiting for the full report, and step 5 issues the report.',
    consumes: [
      'Assembled engineering lot from EASSY-03',
      'Open/short and continuity results from EASSY-03',
      'Assembly specification and acceptance criteria from EPKG-05',
      'First-lot sort data from EASSY-02',
      'Incoming leadframe or substrate inspection from EASSY-01',
    ],
    rel: {
      'EASSY-D4':
        '<b>Assembly inspection and yield report.</b> The inspection results, the yield pareto and the agreed corrective actions are issued here.',
    },
    risks: [
      '<b>Sample size too small to see a systematic fault.</b> A handful of units inspected clears the lot, and the fault appears at qualification on the next.',
      '<b>Delamination read as acceptable on the first lot.</b> Acoustic findings waved through for schedule return as moisture-sensitivity failures when the package is qualified.',
      '<b>Yield losses not split by step.</b> A single assembly yield number cannot tell the OSAT which step to fix.',
      '<b>Corrective actions agreed but not dated.</b> The next lot runs on the same line with the same fault if the actions have no owner or date.',
      '<b>Die-level failures blamed on assembly.</b> Without the sort data beside the assembly data, a die defect is filed as an assembly loss and hidden from yield learning.',
    ],
    roles: [
      { r: 'Quality engineer', d: 'Owns the inspection, the report and the actions' },
      { r: 'Package engineer', d: 'Interprets the findings against the package design' },
      { r: 'OSAT process engineer', d: 'Agrees and implements the corrective actions' },
      { r: 'Failure analysis engineer', d: 'Cross-sections units the inspection flags' },
      { r: 'Package reliability engineer', d: 'Judges findings against qualification risk' },
    ],
    effort: [
      ['Wire-bond X-ray and void inspection', 0.25],
      ['Acoustic microscopy', 0.25],
      ['Yield pareto by process step', 0.5],
      ['OSAT corrective actions', 0.25],
      ['Yield report', 0.25],
    ],
    entry: [
      'Engineering lot released from EASSY-03',
      'Inspection sample plan agreed with the OSAT',
      'Acceptance criteria defined in the assembly specification',
    ],
    exit: [
      'Inspected units within the acceptance criteria',
      'Yield losses attributed by process step',
      'Corrective actions agreed with owners and dates',
    ],
    dependsOn: ['EASSY-03', 'EPKG-05'],
    dependsNote: null,
    feedsInto: ['EASSY-05', 'EMP-06', 'EMP-02', 'EASSY-01'],
    measuredBy: [
      'Units with acoustic or X-ray findings against the sample',
      'Assembly yield by process step',
      'Corrective actions closed before the next lot',
    ],
    links: {
      dependsOn: ['EASSY-03', 'EPKG-05'],
      feedsInto: ['EASSY-05', 'EMP-06', 'EMP-02'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: ['EASSY-01'],
    },
    terms: ['CSAM', 'OSAT', 'FA', 'MSL'],
  },
  'EASSY-05': {
    criticalPath: true,
    purpose: [
      'Decide <b>who gets the first engineering samples, in what order and from which lot</b>—bring-up, the EVK, qualification and early-access customers—and ship them with traceability.',
      'The first lot is always smaller than the demand for it. Bring-up needs units first because every other user depends on what it finds; qualification needs a statistically useful count from known lots; the EVK and early customers need enough to keep the design-in schedule. Allocation is a programme decision, taken once and written down, so that each team plans against what it will actually receive.',
    ],
    flowNote:
      'The four steps run in sequence: demand is collected from every consumer, the units are allocated by priority and lot, the allocated units are shipped, and the record is released. Allocation cannot start before the demand is in, and nothing ships before it is allocated.',
    consumes: [
      'Engineering lot and unit count from EASSY-03',
      'Inspection and yield results from EASSY-04',
      'Die bank and wafer traceability from EASSY-02',
      'eMRAM reliability sample needs from MRAM-03',
      'Early-access partner list from EAP-02',
    ],
    rel: {
      'EASSY-D5':
        '<b>Unit allocation plan and record.</b> The allocation is decided, the units shipped and the record kept here.',
    },
    risks: [
      '<b>Bring-up starved for early-access units.</b> Customer units shipped before bring-up has confirmed basic function make the programme’s first silicon problems into the customer’s.',
      '<b>Qualification given units from a mixed lot.</b> Stress results from units that are not traceable to known lots cannot be used for qualification.',
      '<b>Allocation made informally.</b> Units handed out on request vanish into desks, and the next lot is planned against a count nobody believes.',
      '<b>EVK build left without samples.</b> The EVT build is scheduled against this lot, and a shortfall moves the EVK and every early customer waiting on it.',
      '<b>No reserve held for failure analysis.</b> A lot allocated to the last unit leaves nothing to cross-section when bring-up finds a problem.',
    ],
    roles: [
      { r: 'Program manager', d: 'Owns the allocation and its record' },
      { r: 'Bring-up lead', d: 'Unit count and timing for bring-up' },
      { r: 'Board design engineer', d: 'Units needed for the EVT build' },
      { r: 'Reliability engineer', d: 'Qualification sample count and lot rules' },
      { r: 'Field applications engineer', d: 'Early-access customer demand' },
    ],
    effort: [
      ['Demand collection', 0.25],
      ['Allocation by priority and lot', 0.25],
      ['Shipment with traceability', 0.25],
      ['Allocation record', 0.25],
    ],
    entry: [
      'Engineering lot released from EASSY-03',
      'Inspection results available from EASSY-04',
      'Demand submitted by bring-up, EVK, qualification and early access',
    ],
    exit: [
      'Every unit allocated by priority, lot and consumer',
      'Allocated units shipped with traceability',
      'Allocation record released with a reserve held for failure analysis',
    ],
    dependsOn: ['EASSY-03', 'EASSY-04', 'EASSY-02'],
    dependsNote: null,
    feedsInto: ['EBU-01', 'EVK-05', 'EMP-03', 'EAP-05'],
    measuredBy: [
      'Units delivered to each consumer against the plan',
      'Units traceable to lot and wafer after shipment',
      'Days from lot release to bring-up receipt',
    ],
    links: {
      dependsOn: ['EASSY-03', 'EASSY-04', 'EASSY-02'],
      feedsInto: ['EBU-01', 'EVK-05', 'EMP-03', 'EAP-05'],
      runsWith: [],
      revisedBy: ['EMP-01'],
      feedsBackInto: [],
    },
    terms: ['EVK', 'EVB', 'FAE', 'FA'],
  },
};
