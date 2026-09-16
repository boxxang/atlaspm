import type { ActivityWriteUp } from '../activityDetailTypes';

/** DCTV — the daisy chain test vehicle, written up activity by activity. */
export const DCTV_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'DCTV-01': {
    criticalPath: true,
    purpose: [
      'Decide <b>what the daisy chain vehicle has to prove</b>—which bond levels, which pitches, which failure modes—and lay the chains out so that a failed measurement names where the stack broke rather than only that it did.',
      'A vehicle scoped loosely is built, assembled and measured and still cannot answer the question the product needs answered. The scope is cheap to change in week two and impossible to change once the vehicle dies are on a mask, so this is where the vehicle earns or loses its value.',
    ],
    flowNote:
      'Step 1 states the questions and step 2 turns them into chain topology, because the segmentation is what makes an open locatable to a bond level. Step 3 sets the continuity and contact resistance limits while the segmentation is being drawn, since a segment that is too long cannot resolve the resistance shift a limit is written for. Step 4 fixes the sample plan and build quantity with the OSAT, and step 5 releases the scope as the coverage matrix the design in DCTV-02 is held to.',
    consumes: [
      'Stack topology and die list from PART-05',
      'Bonding scheme and the constraints it brings from BOND-01',
      'Bond pitch and alignment capability from BOND-03',
      'Package risk list for vehicle coverage from PKGD-03',
      'Assembly failures seen on previous stacked and 2.5D programs',
    ],
    rel: {
      'DCTV-D1':
        '<b>DCTV scope and coverage matrix.</b> Written and released here: every risk the vehicle covers, the chain that measures it and the limit it is judged against.',
      'DCTV-D2':
        '<b>Daisy chain vehicle design database.</b> The design is drawn to the coverage matrix, so a risk the matrix omits is a structure the database never contains.',
    },
    risks: [
      '<b>Vehicle scoped at a pitch the product does not use.</b> Continuity at a relaxed pitch says nothing about the alignment margin the product bump map actually spends.',
      '<b>Chains too long to localize a failure.</b> A single open across thousands of joints proves the assembly failed and gives no hint which bond level to fix.',
      '<b>Limits copied from a 2.5D program.</b> Hybrid bond and TSV resistance distributions differ from micro-bump ones, and a borrowed limit passes marginal joints or fails good ones.',
      '<b>Build quantity sized for continuity only.</b> Temperature cycling, cross-sectioning and the DOE splits all draw on the same population, and a vehicle short of units drops the reliability leg first.',
      '<b>Scope agreed without the OSAT.</b> A sample plan the assembly line cannot run in the booked slot turns into a quiet reduction in coverage.',
    ],
    roles: [
      { r: 'Package engineer', d: 'Owns the scope, the chain topology and the coverage matrix' },
      { r: 'Packaging technologist', d: 'Bond-level failure modes and the pitches worth covering' },
      { r: 'Reliability engineer', d: 'Stress conditions and the population they need' },
      { r: 'OSAT process engineer', d: 'Build quantity and line feasibility of the sample plan' },
      { r: 'Test vehicle program manager', d: 'Approves the scope against schedule and budget' },
    ],
    effort: [
      ['Risk and coverage mapping', 1.25],
      ['Chain segmentation', 1],
      ['Limits and sample plan', 1],
      ['Review and release', 0.75],
    ],
    entry: [
      'Stack topology and die list frozen in PART-05',
      'Bonding scheme selected in BOND-01',
      'Bond pitch and alignment capability statement available from BOND-03',
    ],
    exit: [
      'Every covered risk mapped to a chain and a pass limit',
      'Chains segmented finely enough to name the failing bond level',
      'Sample plan and build quantity agreed with the OSAT',
    ],
    dependsOn: ['PART-05', 'BOND-01', 'BOND-03', 'PKGD-03'],
    dependsNote: null,
    feedsInto: ['DCTV-02', 'DCTV-04', 'DCTV-05', 'DCTV-06'],
    measuredBy: [
      'Stack risks covered by a chain against risks identified',
      'Bond levels a single failed chain can be localized to',
      'Scope changes requested after the vehicle design starts',
    ],
    links: {
      dependsOn: ['PART-05', 'BOND-01', 'BOND-03', 'PKGD-03'],
      feedsInto: ['DCTV-02', 'DCTV-04', 'DCTV-05', 'DCTV-06'],
      runsWith: [],
      revisedBy: ['D2D-04'],
      feedsBackInto: [],
    },
    terms: ['DCTV', 'OSAT', 'TSV', 'HB'],
  },

  'DCTV-02': {
    criticalPath: true,
    purpose: [
      'Draw the <b>daisy chain dies, interposer and substrate chains</b> at the product bump and TSV pitch, with the probe pads and measurement structures the coverage matrix calls for, and release a database the vehicle can be built from.',
      'The vehicle only predicts the product if it is built to the product geometry. Every simplification made here—a relaxed pitch, a missing keep-out, a chain that skips a bond level—is a question the vehicle will later answer for a stack nobody is going to ship.',
    ],
    flowNote:
      'Steps 1 and 2 are drawn against each other: the die chains and the interposer and substrate chains only close into a loop if both sides agree on every joint, so the two designs converge together rather than in sequence. Step 3 adds the probe pads and 4-wire structures alongside the chain routing, step 4 runs the vehicle through the 3D rule deck as a product database would be, and step 5 releases the database to mask tooling.',
    consumes: [
      'DCTV scope and coverage matrix from DCTV-01',
      '3D design rule deck from BOND-06',
      'TSV and backside process rules from BOND-02',
      'Daisy chain structures and lessons from the package vehicle design in PTV-04',
      'Draft inter-die bump map from D2D-04',
    ],
    rel: {
      'DCTV-D2':
        '<b>Daisy chain vehicle design database.</b> Designed, checked and released here as the single database the vehicle masks and substrates are built from.',
      'DCTV-D3':
        '<b>Built vehicle lots with travelers.</b> The build in DCTV-03 follows the released database, so a late database change is a late build.',
    },
    risks: [
      '<b>Vehicle drawn at a relaxed pitch.</b> It assembles well and teaches the program nothing about the alignment budget the product will spend.',
      '<b>Chains that do not close across the bond.</b> A routing mismatch between die and interposer reads as an assembly open on every unit built.',
      '<b>No 4-wire structures.</b> Two-wire chain resistance buries the contact resistance of a single joint under the trace resistance around it.',
      '<b>Rule deck skipped because it is only a vehicle.</b> Keep-out and density violations change bonding behavior, and the vehicle then measures a process the product will not see.',
      '<b>Probe pads placed where the assembled stack hides them.</b> Chains that cannot be reached after bonding can only be measured before it, which is the half nobody needed.',
    ],
    roles: [
      { r: 'Package design engineer', d: 'Owns the vehicle database and its release' },
      { r: 'Package engineer', d: 'Holds the design to the coverage matrix' },
      { r: 'Physical design lead', d: 'Die-side chain layout at the product pitch' },
      { r: 'DFM engineer', d: 'Runs the vehicle through the 3D rule deck' },
      { r: 'Test vehicle program manager', d: 'Approves the database for tooling' },
    ],
    effort: [
      ['Daisy chain die design', 3],
      ['Interposer and substrate chain design', 2.5],
      ['Probe pads and measurement structures', 1.5],
      ['Rule deck checks', 1],
      ['Database release', 1],
    ],
    entry: [
      'Coverage matrix released from DCTV-01',
      'Draft 3D rule deck available from BOND-06',
      'Bump and TSV pitch fixed by the bonding scheme',
    ],
    exit: [
      'Vehicle drawn at the product bump and TSV pitch',
      'Every chain in the coverage matrix closes across the bond and is probeable',
      'Database clean against the 3D rule deck or waived with a reason',
    ],
    dependsOn: ['DCTV-01', 'BOND-02', 'BOND-06'],
    dependsNote: null,
    feedsInto: ['DCTV-03', 'DCTV-05'],
    measuredBy: [
      'Coverage matrix entries implemented in the database',
      'Rule deck violations open at release',
      'Database revisions after tooling was ordered',
    ],
    links: {
      dependsOn: ['DCTV-01', 'BOND-02', 'BOND-06'],
      feedsInto: ['DCTV-03', 'DCTV-05'],
      runsWith: ['PTV-04'],
      revisedBy: ['D2D-04'],
      feedsBackInto: [],
    },
    terms: ['DCTV', 'TSV', 'RDL', 'KOZ', 'DRC'],
  },

  'DCTV-03': {
    criticalPath: true,
    purpose: [
      'Turn the released database into <b>vehicle material the OSAT can assemble</b>: mask tooling ordered, vehicle wafers through the foundry, interposer and substrate lots built in parallel, and everything inspected and released with travelers.',
      'The vehicle is on the program schedule for one reason—its results have to arrive before product assembly is committed. The build is where that margin is most often lost, to a tooling queue, a lot on hold or a substrate that arrives after the wafers.',
    ],
    flowNote:
      'Step 1 orders tooling as soon as the database is released, because mask lead time sets the start of everything else. Step 2 tracks the vehicle wafers through the foundry while step 3 builds the interposer and substrate lots in parallel against the same need date. Step 4 inspects what arrives, reconciles it against the travelers and releases a complete kit to assembly—a kit with one component missing cannot start the DOE.',
    consumes: [
      'Daisy chain vehicle design database from DCTV-02',
      'Substrate and interposer supplier bookings from PKGD-07',
      'Foundry capacity and slot plan from TECH-07',
      'Build quantity and sample plan from DCTV-01',
      'Thinning and handling flow from BOND-04',
    ],
    rel: {
      'DCTV-D3':
        '<b>Built vehicle lots with travelers.</b> Built, inspected and released here, with the traveler that ties every unit back to its wafer, lot and split.',
      'DCTV-D4':
        '<b>Assembly DOE result on the vehicle.</b> The DOE runs on these lots, so every week lost in the build comes out of the DOE window.',
    },
    risks: [
      '<b>Vehicle treated as low priority at the foundry.</b> Engineering lots queue behind production, and a vehicle that loses its slot delays the product decision it exists to inform.',
      '<b>Substrate lead time planned from the die side.</b> Substrates and interposers routinely take longer than the wafers, and the kit is only as early as its latest part.',
      '<b>Travelers kept loosely.</b> A unit that cannot be traced to its wafer and split cannot be attributed in the DOE or the failure analysis.',
      '<b>Incoming inspection skipped to recover schedule.</b> A warped interposer or a contaminated wafer then shows up as an assembly failure and pollutes the yield learning.',
      '<b>Thinned wafers shipped on an unqualified carrier.</b> Breakage in transit shrinks the population before a single unit is bonded.',
    ],
    roles: [
      { r: 'Test vehicle program manager', d: 'Owns the build schedule and the kit release' },
      { r: 'Foundry engineer', d: 'Vehicle wafer lot priority and WIP status' },
      { r: 'Substrate supplier manager', d: 'Interposer and substrate lot delivery' },
      { r: 'Wafer process engineer', d: 'Thinning, carrier and handling of the vehicle wafers' },
      { r: 'Package engineer', d: 'Approves the kit for assembly' },
    ],
    effort: [
      ['Mask tooling and order', 1.5],
      ['Foundry wafer build tracking', 2.5],
      ['Interposer and substrate lots', 2],
      ['Inspection and material release', 1],
    ],
    entry: [
      'Vehicle database released from DCTV-02',
      'Foundry slot and substrate supplier booked',
      'Thinning and carrier flow defined in BOND-04',
    ],
    exit: [
      'Complete vehicle kits released to the OSAT on the planned date',
      'Every unit traceable to its wafer, lot and split',
      'Incoming inspection results recorded against each lot',
    ],
    dependsOn: ['DCTV-02', 'PKGD-07', 'BOND-04'],
    dependsNote: null,
    feedsInto: ['DCTV-04'],
    measuredBy: [
      'Kit release date against plan',
      'Units lost between wafer out and kit release',
      'Units with incomplete traceability',
    ],
    links: {
      dependsOn: ['DCTV-02', 'PKGD-07', 'BOND-04', 'TECH-07'],
      feedsInto: ['DCTV-04'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['OSAT', 'WIP', 'DCTV'],
  },

  'DCTV-04': {
    criticalPath: true,
    purpose: [
      'Run the <b>assembly design of experiments on the vehicle</b>—bond force, temperature and time across splits—inspect every bonded stack by X-ray and acoustic imaging, and record the assembly yield of each split.',
      'This is the first time the stack is assembled through the real process. The DOE is what turns a bonding capability claim into a measured response surface, and the splits it covers bound the process window the product can later be frozen in.',
    ],
    flowNote:
      'Step 1 defines the DOE with the OSAT so the splits bracket the expected window rather than cluster around a guess. Step 2 runs the bonding splits, and step 3 inspects the bonded stacks by X-ray and CSAM while later splits are still running, so a gross problem stops the DOE early instead of consuming the whole population. Step 4 records assembly yield per split against the traveler, and step 5 reviews the result with design and process before the chains are measured.',
    consumes: [
      'Built vehicle lots with travelers from DCTV-03',
      'DCTV scope and sample plan from DCTV-01',
      'Thinning and handling flow from BOND-04',
      'Assembly thermal budget from BOND-05',
      'OSAT assembly process flow from PKGD-08',
    ],
    rel: {
      'DCTV-D4':
        '<b>Assembly DOE result on the vehicle.</b> Designed, run and reviewed here: the yield and inspection response of each bonding split.',
      'DCTV-D7':
        '<b>Assembly yield learning report.</b> The yield by split recorded here is the primary input the learning report correlates against.',
    },
    risks: [
      '<b>Splits clustered around the nominal recipe.</b> The DOE then confirms the starting point and says nothing about how wide the usable window is.',
      '<b>Inspection only at the end of the DOE.</b> A void or misalignment problem found after every split is bonded has already consumed the population.',
      '<b>Thermal budget exceeded by the splits.</b> A high-temperature split that damages the bond interface looks like a process edge when it is a budget violation.',
      '<b>Yield counted per lot rather than per split.</b> Mixed splits in one lot make the response surface unreadable.',
      '<b>DOE run on the line the product will not use.</b> A different bonder or site shifts the window, and the frozen process does not transfer.',
    ],
    roles: [
      { r: 'OSAT process engineer', d: 'Owns the DOE, the bonding splits and the yield record' },
      { r: 'Package engineer', d: 'Holds the DOE to the vehicle scope' },
      { r: 'Packaging technologist', d: 'Bonding physics behind the split choice' },
      { r: 'Failure analysis engineer', d: 'X-ray and CSAM interpretation' },
      { r: 'Test vehicle program manager', d: 'Approves the DOE result for measurement' },
    ],
    effort: [
      ['DOE design', 2],
      ['Bonding splits', 3.5],
      ['X-ray and CSAM inspection', 2],
      ['Yield recording', 1],
      ['DOE review', 1.5],
    ],
    entry: [
      'Complete vehicle kits released from DCTV-03',
      'Bonding line and tool set confirmed as the product line',
      'Assembly thermal budget agreed in BOND-05',
    ],
    exit: [
      'Every planned split bonded and traceable to its units',
      'Inspection result and assembly yield recorded per split',
      'DOE result reviewed with design and process before measurement',
    ],
    dependsOn: ['DCTV-03', 'DCTV-01', 'BOND-04'],
    dependsNote: null,
    feedsInto: ['DCTV-05', 'DCTV-06', 'DCTV-07'],
    measuredBy: [
      'Splits completed against splits planned',
      'Assembly yield spread across the splits',
      'Units lost to handling rather than to a split condition',
    ],
    links: {
      dependsOn: ['DCTV-01', 'DCTV-03', 'BOND-04', 'BOND-05', 'PKGD-08'],
      feedsInto: ['DCTV-05', 'DCTV-06', 'DCTV-07'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['DOE', 'CSAM', 'OSAT', 'TCB', 'HB'],
  },

  'DCTV-05': {
    criticalPath: true,
    purpose: [
      'Measure <b>continuity and contact resistance across every chain segment</b> of the assembled vehicles, and locate each open and short to the bond level it sits at.',
      'Continuity is the vehicle’s primary answer. A yield number alone says the assembly works or does not; a resistance distribution localized by segment says which joint type is marginal, which is the only form of the answer the process window and the bump map can act on.',
    ],
    flowNote:
      'Step 1 sets up and correlates the measurement before any data is taken, because an uncorrelated fixture adds resistance that reads as a bad joint. Steps 2 and 3 measure continuity and 4-wire contact resistance across the same units in one insertion. Step 4 localizes the opens and shorts to a bond level using the chain segmentation from DCTV-01, and step 5 reports both against the limits the scope set.',
    consumes: [
      'Bonded vehicle stacks and DOE splits from DCTV-04',
      'Continuity and contact resistance limits from DCTV-01',
      'Probe pads and chain structures from DCTV-02',
      'Inspection results by split from DCTV-04',
      'Probe and test hardware practice from TEST-04',
    ],
    rel: {
      'DCTV-D5':
        '<b>Continuity and contact resistance data.</b> Measured, localized and reported here, by unit, split and chain segment.',
      'DCTV-D7':
        '<b>Assembly yield learning report.</b> The resistance distributions are what explain the yield differences between splits.',
    },
    risks: [
      '<b>Two-wire measurement used for contact resistance.</b> Trace and probe resistance swamp the joint, and marginal bonds pass.',
      '<b>Fixture not correlated.</b> A systematic offset reads as a process shift and sends the DOE analysis in the wrong direction.',
      '<b>Opens counted but not localized.</b> Without the bond level the failure analysis starts blind and the design feedback is a guess.',
      '<b>Limits applied as pass or fail only.</b> Units inside the limit but in the tail of the distribution are the ones temperature cycling will fail first.',
      '<b>Pre-cycling baseline not kept.</b> Reliability readouts in DCTV-06 cannot show drift without the time-zero resistance of the same chain.',
    ],
    roles: [
      { r: 'Package test engineer', d: 'Owns the measurement and the data set' },
      { r: 'Package engineer', d: 'Interprets results against the coverage matrix' },
      { r: 'Test engineer', d: 'Fixture, probe and measurement correlation' },
      { r: 'Failure analysis engineer', d: 'Physical confirmation of localized failures' },
      { r: 'Test vehicle program manager', d: 'Approves the report for yield learning' },
    ],
    effort: [
      ['Measurement setup and correlation', 1.25],
      ['Continuity measurement', 1.5],
      ['Contact resistance measurement', 1.25],
      ['Failure localization', 1.25],
      ['Reporting', 0.75],
    ],
    entry: [
      'Bonded stacks released from the DOE in DCTV-04',
      'Fixture correlated on known structures',
      'Pass limits and segmentation defined in DCTV-01',
    ],
    exit: [
      'Every chain segment measured on every unit',
      'Every open and short localized to a bond level',
      'Time-zero resistance stored per chain for the reliability readouts',
    ],
    dependsOn: ['DCTV-04', 'DCTV-01'],
    dependsNote: null,
    feedsInto: ['DCTV-07', 'MDT-01'],
    measuredBy: [
      'Chain segments measured against segments built',
      'Failures localized to a bond level against failures found',
      'Measurement repeatability on the correlation units',
    ],
    links: {
      dependsOn: ['DCTV-01', 'DCTV-02', 'DCTV-04'],
      feedsInto: ['DCTV-07', 'MDT-01'],
      runsWith: ['DCTV-06'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['DCTV', 'FA'],
  },

  'DCTV-06': {
    criticalPath: false,
    purpose: [
      'Stress the <b>bond interface on the assembled vehicles</b>—preconditioning, then temperature cycling—and re-measure the chains at each readout to see which joints drift and which fail.',
      'Continuity at time zero proves the stack can be assembled. It does not prove the joints survive the CTE mismatch of a real stack over its life, and a bond that passes assembly and cracks at a few hundred cycles is a field return rather than a yield loss.',
    ],
    flowNote:
      'Step 1 preconditions the population so the stress starts from the state a shipped part is in. Step 2 runs temperature cycling while step 3 re-measures the chains at each readout against the time-zero resistance from DCTV-05, so drift is seen before an open appears. Step 4 analyzes the failures by bond level and location, and step 5 reports the reliability of the bond interface.',
    consumes: [
      'Bonded vehicle population from DCTV-04',
      'Time-zero chain resistance from DCTV-05',
      'Bond reliability and thermal budget plan from BOND-05',
      'Reliability stress practice from MP-03',
      'Warpage and stress predictions from 3DI-05',
    ],
    rel: {
      'DCTV-D6':
        '<b>Vehicle reliability report.</b> Stressed, measured and analyzed here: resistance drift and failures by readout, bond level and location.',
      'DCTV-D8':
        '<b>Frozen 3D assembly process window.</b> A split that assembles well but fails under cycling is excluded from the window, so the freeze waits for these readouts.',
    },
    risks: [
      '<b>Cycling started without preconditioning.</b> Moisture and reflow history change joint behavior, and a population stressed dry overstates reliability.',
      '<b>Readouts reported as opens only.</b> Resistance drift is the early warning, and a report that waits for an open reports late.',
      '<b>Failures not localized.</b> A bond-level failure and a TSV liner crack need different fixes, and an unlocalized count cannot tell them apart.',
      '<b>Population too small per split.</b> Reliability differences between splits disappear into sampling noise and every split looks the same.',
      '<b>Results arriving after the window freeze.</b> The freeze is then made on assembly yield alone, which is exactly the decision this activity exists to prevent.',
    ],
    roles: [
      { r: 'Reliability engineer', d: 'Owns the stress plan, readouts and report' },
      { r: 'Package test engineer', d: 'Chain re-measurement at each readout' },
      { r: 'Failure analysis engineer', d: 'Cross-sections and failure localization' },
      { r: 'Package mechanical engineer', d: 'Correlation of failures to predicted stress' },
      { r: 'Quality engineer', d: 'Approves the reliability conclusions' },
    ],
    effort: [
      ['Preconditioning', 1],
      ['Temperature cycling', 2],
      ['Readout measurements', 1.5],
      ['Failure analysis', 1.75],
      ['Reporting', 0.75],
    ],
    entry: [
      'Bonded population available from the DOE in DCTV-04',
      'Time-zero chain resistance recorded in DCTV-05',
      'Stress conditions agreed in BOND-05',
    ],
    exit: [
      'Planned cycle count reached or failure mechanism established',
      'Drift and failures reported by split, bond level and location',
      'Reliability ranking of the splits delivered before the window freeze',
    ],
    dependsOn: ['DCTV-04', 'DCTV-05'],
    dependsNote: null,
    feedsInto: ['DCTV-07', '3DI-05'],
    measuredBy: [
      'Cycles completed against plan at the freeze date',
      'Failures localized to a mechanism against failures seen',
      'Splits separated by reliability, not only by yield',
    ],
    links: {
      dependsOn: ['DCTV-04', 'BOND-05'],
      feedsInto: ['DCTV-07', '3DI-05', 'MP-03'],
      runsWith: ['DCTV-05'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['TCT', 'CTE', 'TSV', 'FA'],
  },

  'DCTV-07': {
    criticalPath: true,
    purpose: [
      'Turn the vehicle results into <b>a frozen 3D assembly process window</b>: correlate yield against the DOE, choose the window the product will be built in, feed the failures back into the bump map and rule deck, and sign the vehicle off as the gate for product assembly.',
      'Everything else in the stage produces data. This activity produces the decision, and it is the one product assembly waits for—the window the first product stacks are bonded in is exactly as good as the evidence behind this freeze.',
    ],
    flowNote:
      'Step 1 correlates assembly yield against the DOE parameters and produces the learning report. Step 2 chooses the window using yield, resistance and reliability together, and step 3 runs alongside it, turning localized failures into change requests against the bump map and the 3D rule deck. Step 4 freezes the window, and step 5 signs the vehicle off so product assembly can start against it.',
    consumes: [
      'Assembly DOE result from DCTV-04',
      'Continuity and contact resistance data from DCTV-05',
      'Vehicle reliability report from DCTV-06',
      'Frozen inter-die bump map from D2D-04',
      'Released 3D design rule deck from BOND-06',
    ],
    rel: {
      'DCTV-D7':
        '<b>Assembly yield learning report.</b> Written here from the DOE, continuity and reliability data together.',
      'DCTV-D8':
        '<b>Frozen 3D assembly process window.</b> Chosen, frozen and signed off here as the window product assembly is held to.',
    },
    risks: [
      '<b>Window chosen on assembly yield alone.</b> The best-yielding split can be the one that fails cycling, and the product inherits a reliability problem.',
      '<b>Window frozen on a single split.</b> With no measured margin on either side, normal line drift walks the product out of the window.',
      '<b>Failures not fed back into the design.</b> A bump map or rule deck problem the vehicle found is then found again on product stacks.',
      '<b>Signoff given under schedule pressure with data missing.</b> The gate becomes a date rather than a decision.',
      '<b>Window not transferred to the production line recipe.</b> The frozen parameters live in a report and the line runs its own defaults.',
    ],
    roles: [
      { r: 'Package engineer', d: 'Owns the learning report and the window freeze' },
      { r: 'OSAT process engineer', d: 'Transfers the window into the production recipe' },
      { r: 'Reliability engineer', d: 'Reliability evidence behind the chosen window' },
      { r: 'Package and bump engineer', d: 'Acts on bump map change requests' },
      { r: 'Package director', d: 'Approves the vehicle signoff for product assembly' },
    ],
    effort: [
      ['Yield correlation', 1.5],
      ['Process window selection', 1.25],
      ['Design feedback', 1],
      ['Window freeze and signoff', 1.25],
    ],
    entry: [
      'DOE result available from DCTV-04',
      'Continuity data reported in DCTV-05',
      'Reliability readouts reported in DCTV-06',
    ],
    exit: [
      'Process window frozen with measured margin on each parameter',
      'Change requests raised against the bump map and rule deck',
      'Vehicle signed off as the gate for product assembly',
    ],
    dependsOn: ['DCTV-04', 'DCTV-05', 'DCTV-06'],
    dependsNote: null,
    feedsInto: ['3DI-06', 'ASSY-05', 'ASSY-08'],
    measuredBy: [
      'Measured margin on each frozen window parameter',
      'Vehicle failures closed by a design or process change',
      'Product assembly yield in the window against vehicle yield',
    ],
    links: {
      dependsOn: ['DCTV-04', 'DCTV-05', 'DCTV-06'],
      feedsInto: ['3DI-06', 'ASSY-05', 'ASSY-08'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: ['D2D-04', 'BOND-06'],
    },
    terms: ['DCTV', 'DOE', 'OSAT'],
  },
};
