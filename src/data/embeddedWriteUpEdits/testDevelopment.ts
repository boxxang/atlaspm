import type { WriteUpEdit } from './types';

/** TEST: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const TEST_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'TEST-01': {
    purpose: [
      'Decide <b>what will be tested, where, and to what defect level</b>—the plan every other activity in the stage implements.',
      'Test is where quality is bought and where cost per unit is set, and the two trade directly. The plan is the document where that trade is made explicitly: a DPPM target implies coverage, coverage implies content, content implies test time, and test time is money on every unit ever shipped—on a part that sells for a few dollars, a visible share of its cost.',
    ],
    consumes: [
      'Product requirements and quality target from DEF-01',
      'DFT coverage from DFT-10 and memory test from DFT-05',
      'eMRAM test, repair and trim flow from MRAM-06',
      'Package pin-out from EPKG-02',
      'Quality and reliability requirement from MP-01',
      'Cost target from DEF-06',
    ],
    risks: [
      '<b>Coverage chosen without a DPPM target.</b> There is then no way to say whether the test is sufficient, only whether it is thorough.',
      '<b>Test time not budgeted at plan time.</b> Content accumulates and the cost per unit is discovered at production readiness when it is expensive to change.',
      '<b>Burn-in and eMRAM retention screening decided late.</b> Both are capital and cycle-time commitments—a retention bake between insertions changes the whole flow—and reversing them after qualification planning is expensive.',
      '<b>Sort and final coverage overlapping without intent.</b> Testing the same thing twice costs money on every unit and often happens by accretion.',
      '<b>DFT coverage assumed rather than measured.</b> The plan then promises a DPPM the actual pattern set cannot deliver.',
    ],
    entry: [
      'DFT coverage results available from DFT-10 and DFT-05',
      'eMRAM test and trim flow available from MRAM-06',
      'Quality target defined',
    ],
    terms: ['DFT', 'DPPM', 'eMRAM'],
  },
  'TEST-02': {
    consumes: [
      'Test plan and flow architecture from TEST-01',
      'Pin count and package from EPKG-01 and EPKG-02',
      'Available ATE platforms and their capability',
      'Test capacity and capital budget',
      'Production volume forecast from DEF-01',
    ],
    risks: [
      '<b>Tester time not booked ahead.</b> Capacity is shared, and a program without commitments waits behind programs with them.',
      '<b>Instruments short of the current-measurement floor.</b> Sleep and deep-sleep current cannot be measured at the resolution the datasheet claims, and the shortfall is discovered when the program is written.',
      '<b>Pin count insufficient for parallel sites.</b> Multi-site conversion later becomes impossible, and test cost stays where it started.',
      '<b>Platform chosen on capital cost alone.</b> Cost per tested unit depends on throughput and site count as much as on the tester’s price.',
      '<b>Development capacity not separated from production.</b> Program debug then competes with the ramp it is meant to enable.',
    ],
    entry: [
      'Test plan available from TEST-01',
      'Pin count and current-measurement requirement known',
      'Capital budget and capacity forecast available',
    ],
    exit: [
      'Development, characterization and production slots all booked',
      'Instrument set resolving the sleep-current floor and the analog trims',
      'Pin count supporting the planned multi-site conversion',
    ],
    measuredBy: [
      'Tester slots committed against the plan',
      'Instrument capability against the current-measurement and trim requirement',
      'Cost per tested unit against target',
    ],
  },
  'TEST-03': {
    purpose: [
      'Reduce <b>test time and test cost per unit</b>—an activity that starts early, because content is far cheaper to not write than to remove.',
      'Test time is paid on every unit for the product’s whole life. A second saved at final test on a million units is real money, and on this part the largest contributors are rarely the logic patterns: eMRAM array test and trim, and the settling time a microamp current measurement needs, dominate—and both can be designed for at plan time far more cheaply than after the program is written and qualified.',
    ],
    terms: ['DPPM', 'eMRAM'],
  },
  'TEST-04': {
    purpose: [
      'Design, fabricate and qualify the <b>probe card</b>—the physical interface between the tester and the wafer, and the longest lead time in the stage.',
      'Nothing can be sorted without it, and sort gates assembly. Weeks of design and fabrication sit in front of the first wafer, which means the card has to be committed against a pad map that is frozen far earlier than most people expect.',
    ],
    flowNote:
      'Step 4’s weeks are pure vendor lead time and cannot be compressed. Step 1’s pad map therefore has to be frozen months before sort, which is well before most people believe the pad ring is stable—and the site count the card is built for is fixed at the same moment.',
    consumes: [
      'Pad ring and pad map from PD-16 and EPKG-02',
      'Test plan and sort content from TEST-01',
      'ATE platform and interface from TEST-02',
      'Wafer sort touchdown plan',
      'Probe card vendor capability',
    ],
    risks: [
      '<b>Pad map changing after card release.</b> The card’s fabrication weeks are lost, and sort—and therefore assembly—moves by that much.',
      '<b>Contact resistance out of specification.</b> Marginal contact produces failures that look like silicon defects and corrupts the whole sort yield.',
      '<b>Planarity insufficient across the touchdown area.</b> Some probes contact and some do not, and the pattern is subtle enough to be missed.',
      '<b>No spare card.</b> A damaged card with a replacement measured in weeks stops sort entirely, and cards are damaged routinely.',
      '<b>Touchdown life below the wafer volume.</b> Card degradation then appears as a yield trend that gets chased as a process problem.',
    ],
    roles: [
      { r: 'Probe engineer', d: 'Owns the card and its qualification' },
      { r: 'Test engineer', d: 'Requirement and tester interface' },
      { r: 'Physical design', d: 'Pad map freeze and change control' },
      { r: 'Probe card vendor', d: 'Design and fabrication' },
      { r: 'Operations planner', d: 'Spare strategy and lead time' },
    ],
    effortLabels: [
      'Probe card design',
      'Qualification',
      'Requirement and pad map',
      'Contact analysis',
      'Touchdown strategy',
      'Spare plan',
    ],
    entry: [
      'Pad map frozen from PD-16 and EPKG-02',
      'ATE platform selected in TEST-02',
      'Vendor capacity booked against the lead time',
    ],
  },
  'TEST-05': {
    purpose: [
      'Design, build and bring up the <b>load board and socket</b>—the package-level equivalent of the probe card, and what every final-test and characterization measurement passes through.',
      'The load board carries the tester’s signals and supplies to the package and returns its currents to the measurement instruments. For this part the demanding path is not speed but leakage: a board, socket or relay that leaks nanoamps corrupts a sleep current measured in microamps, and the board’s own contribution has to be small enough that what is measured is the silicon.',
    ],
    flowNote:
      'Step 5 is routinely underestimated, and on this part in the opposite direction from a large one. The difficulty is not delivering current but measuring very little of it: relays, decoupling and socket leakage all sit in the measurement path, and a load board that leaks produces sleep-current failures indistinguishable from silicon leakage.',
    consumes: [
      'Package outline and pin-out from EPKG-01 and EPKG-02',
      'Test plan and final content from TEST-01',
      'ATE platform interface from TEST-02',
      'Operating modes and current limits from PMU-01',
      'Socket vendor capability',
    ],
    rel: {
      'TEST-D2':
        '<b>Qualified probe card and load board.</b> The load board half of the deliverable—the socketed, low-leakage board brought up on the tester with its correlation fixture.',
    },
    risks: [
      '<b>Leakage in the load board measurement path.</b> It produces sleep-current failures that look exactly like silicon leakage and consume weeks of debug.',
      '<b>Socket insertion life below the test volume.</b> Contact degrades, yield trends downward, and the cause is looked for in the process.',
      '<b>Board noise consuming the measurement margin.</b> The analog and current tests then fail on the board rather than on the part.',
      '<b>Socket selected before the package is dimensioned.</b> A socket that does not fit the finished package is discovered very late.',
      '<b>No correlation fixture.</b> ATE and bench results then cannot be reconciled, and both are distrusted.',
    ],
    roles: [
      { r: 'Test hardware engineer', d: 'Owns the load board' },
      { r: 'Analog test engineer', d: 'Low-leakage measurement paths and supply decoupling' },
      { r: 'Test engineer', d: 'Tester interface and bring-up' },
      { r: 'Package engineer', d: 'Socket and package dimensional fit' },
      { r: 'Socket vendor', d: 'Contact design and insertion life' },
    ],
    effortLabels: [
      'Load board design',
      'Tester bring-up',
      'Fabrication and assembly',
      'Supply and measurement path design',
      'Socket analysis',
      'Release',
    ],
    entry: [
      'Package pin-out from EPKG-02',
      'ATE platform selected in TEST-02',
      'Operating modes and current limits known from PMU-01',
    ],
    exit: [
      'Measurement path leakage small against the sleep-current limit',
      'Socket insertion life above the planned test volume',
      'Board noise small against the analog measurement margin',
    ],
    measuredBy: [
      'Measurement path leakage against the sleep-current limit',
      'Socket life against test volume',
      'Board noise against measurement margin',
    ],
    terms: ['ATE'],
  },
  'TEST-06': {
    purpose: [
      'Write the <b>wafer sort test program</b>—the screen that decides which die are worth assembling into a package.',
      'On this part sort is also where the eMRAM is tested, repaired and trimmed, and where the power manager’s references are trimmed. A die let through costs only a package and a final-test insertion, but a die whose trim is wrong or whose repair was never applied passes the logic tests and fails later in ways that are expensive to diagnose—so sort’s content is set by what only sort can do.',
    ],
    flowNote:
      'Step 7 is where the program’s economics are set. Limits too tight throw away good die; too loose and packages are built on bad ones. The guard bands should come from measurement uncertainty and the cost of an escape, not from convention—and the trim values step 6 writes have to be recorded per die, because they are what a later retention or accuracy question is traced back to.',
    consumes: [
      'Test plan and coverage matrix from TEST-01',
      'ATE patterns from TEST-08',
      'Probe card from TEST-04',
      'Memory BIST from DFT-05',
      'eMRAM test, repair and trim flow from MRAM-06',
    ],
    rel: {
      'TEST-D7':
        '<b>Wafer sort and final test programs, release-tagged.</b> The sort half of the deliverable—the debugged wafer sort program, with the eMRAM trim and repair it writes and guard bands set against the cost of an escape rather than convention.',
    },
    risks: [
      '<b>Guard bands set by convention.</b> The limits should be derived from the cost of an escape and the measurement uncertainty.',
      '<b>eMRAM trim and repair not verified at sort.</b> A die trimmed wrong or with its repairs unapplied passes the logic tests and fails retention or endurance later, at many times the price.',
      '<b>Program debugged only in simulation.</b> Tester behavior differs from the model, and the difference is found on the first wafer.',
      '<b>Wafer map output not matching the assembly requirement.</b> Die selection at assembly depends on the map format, and a mismatch stops assembly.',
      '<b>Test time growing without check.</b> Sort time multiplies across every wafer ever run, and eMRAM array test in particular accretes silently.',
    ],
    roles: [
      { r: 'Test engineer', d: 'Owns the sort program' },
      { r: 'DFT engineer', d: 'Scan, BIST and eMRAM trim content integration' },
      { r: 'Product engineering', d: 'Limits, guard bands and binning' },
      { r: 'Yield engineer', d: 'Parametric monitors and map output' },
      { r: 'Assembly liaison', d: 'Wafer map format and die selection criteria' },
    ],
    effortLabels: [
      'Scan and structural integration',
      'Functional, BIST and eMRAM trim',
      'DC and continuity',
      'Integration and debug',
      'Parametric development',
      'Binning and limits',
    ],
    exit: [
      'Guard bands derived from escape cost and measurement uncertainty',
      'eMRAM trimmed, repaired and verified on every passing die',
      'Wafer map format agreed with assembly',
    ],
    terms: ['DFT', 'BIST', 'ATE', 'DPPM', 'eMRAM'],
  },
  'TEST-07': {
    purpose: [
      'Write the <b>final test program</b> that runs on the assembled package—at temperature, in every operating and sleep mode, across every interface the product ships with.',
      'Final test is the last screen before a customer sees the part. It exercises what sort could not: the packaged pins, active and sleep current measured through the package, the power manager’s mode transitions and wake sources, and the eMRAM contents after assembly.',
    ],
    flowNote:
      'Step 3 is where this product differs most from a performance part. Sleep and deep-sleep current are the figures it is sold on; measuring microamps on a tester takes settling time, careful ranging and a quiet load board, and it is the content most likely to be both slow and wrong.',
    consumes: [
      'Test plan from TEST-01',
      'Load board from TEST-05',
      'ATE patterns from TEST-08',
      'Operating modes and wake sources from PMU-01 and PMU-04',
      'eMRAM retention and trim checks from MRAM-06',
    ],
    rel: {
      'TEST-D7':
        '<b>Wafer sort and final test programs, release-tagged.</b> The final-test half of the deliverable—the debugged package test program that exercises the packaged pins, the active and sleep currents, the power modes and the eMRAM.',
    },
    risks: [
      '<b>Sleep-current content insufficient.</b> A part whose deep-sleep current is out of specification works perfectly and ships, and the customer finds it as a battery that dies early.',
      '<b>Content not run at temperature.</b> Leakage and sleep current rise steeply at the hot corner and timing marginality appears there too; testing only at room temperature misses both.',
      '<b>Binning content added late.</b> Grading is how the product line is built, and retrofitting it changes the flow and its cost.',
      '<b>Test time not tracked against the cost model.</b> Current measurement settling and eMRAM checks grow final test time quietly.',
      '<b>Program debugged without real assembled units.</b> The first units are precious, and the program has to be ready when they exist.',
    ],
    roles: [
      { r: 'Test engineer', d: 'Owns the final test program' },
      { r: 'Product engineering', d: 'Binning, grading and limits' },
      { r: 'Analog test engineer', d: 'Current, power manager and eMRAM content' },
      { r: 'Thermal engineer', d: 'Temperature-dependent content' },
      { r: 'Yield engineer', d: 'Failure classification from final test' },
    ],
    effortLabels: [
      'At-speed functional',
      'Interface, eMRAM and analog content',
      'DC and continuity',
      'Integration and debug',
      'Active and sleep current',
      'Binning and limits',
    ],
    exit: [
      'Active and sleep current measured in every mode at the datasheet’s resolution',
      'Content run across the temperature range',
      'Test time inside the cost model’s allowance',
    ],
    terms: ['ATE', 'DPPM', 'eMRAM'],
  },
  'TEST-08': {
    consumes: [
      'ATPG patterns from DFT-10 and their tester format conversion from DFT-11',
      'Compression architecture from DFT-09',
      'ATE platform and memory depth from TEST-02',
      'Timing constraints from SO-04',
      'Tester timing model',
    ],
    entry: [
      'ATPG patterns released from DFT-10',
      'ATE platform and memory depth known from TEST-02',
      'Tester timing model available',
    ],
  },
  'TEST-09': {
    purpose: [
      'Build the <b>characterization content</b>—shmoos, corners, parametric sweeps, current in every power mode, datasheet parameter measurement—that turns silicon into a specified product.',
      'Production test asks whether a part passes. Characterization asks what the part actually does across voltage, frequency and temperature—and, for this part, across every power mode, from active current per MHz to deep-sleep current and wake-up time—over a statistically meaningful sample. Every number in the datasheet comes from here, and so do the guard bands production test uses.',
    ],
    consumes: [
      'Datasheet parameter list and energy targets from DEF-05',
      'System energy budget per mode from PMU-06',
      'Qualification requirements from MP-01',
      'Test plan from TEST-01',
      'Load board and correlation fixture from TEST-05',
      'Lab instrumentation from EVB-08',
    ],
    risks: [
      '<b>Sample size too small for the claim.</b> A datasheet parameter from a handful of units is a number without confidence behind it.',
      '<b>Corners not spanning the qualification range.</b> Qualification then stresses conditions characterization never measured.',
      '<b>Sweeps not automated, and current not swept with temperature.</b> Manual shmoo consumes engineer-weeks per corner and the corners get quietly reduced—and sleep current, which rises steeply with temperature, is the parameter that suffers most.',
      '<b>Datasheet parameters not traceable to a measurement.</b> A customer question then has no answer.',
      '<b>Analysis pipeline built after the data.</b> Data is collected in a format nobody can analyze, and the campaign is re-run.',
    ],
    entry: [
      'Datasheet parameter list from DEF-05',
      'Qualification conditions from MP-01',
      'Correlation fixture from TEST-05',
    ],
  },
  'TEST-10': {
    flowNote:
      'Step 3 is the piece that is hardest to add later. A unit’s test result is only useful if it can be joined to its wafer position, the eMRAM trim and repair it received at sort, its assembly lot and its bring-up history, and those keys have to be carried from the beginning.',
  },
  'TEST-11': {
    consumes: [
      'Final test results from TEST-07',
      'Bench measurements from BU-10',
      'System-level results on the EVK from EVKL-01',
      'Measurement uncertainty from TEST-09',
      'Load board and correlation fixture from TEST-05',
    ],
  },
};
