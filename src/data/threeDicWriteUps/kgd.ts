import type { ActivityWriteUp } from '../activityDetailTypes';

export const KGD_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'KGD-01': {
    criticalPath: true,
    purpose: [
      'Turn the stack yield economics into <b>criteria a die has to meet before it is stacked</b>—what is tested, at which corner, to which limit—and a sort flow that proves each one.',
      'On a single-die part an escape at sort is caught at final test and costs one package. In a stack it is caught after bonding and costs every good die it was bonded to, which is why the criteria are set against the compound yield model from PART-04 rather than copied from the SoC sort limits.',
    ],
    flowNote:
      'Step 1 translates the economics into criteria, and step 2 designs the sort flow that proves them; the two are written together because a criterion no insertion can measure is not a criterion. Step 3 runs alongside, because the stacking partner has to accept the definition before anyone builds a program around it, and step 4 releases it to test development.',
    consumes: [
      'Stack yield and KGD economics from PART-04',
      'Post-bond test strategy direction from MDT-01',
      'Pre-bond test access from D2D-05',
      'Wafer sort test plan from TEST-01',
      'Repair and redundancy budget agreed in PART-04',
    ],
    rel: {
      'KGD-D1':
        '<b>Known-good-die criteria.</b> The criteria are defined, agreed with the stacking partner and released here.',
      'KGD-D2':
        '<b>Wafer sort program for stacking.</b> The sort program exists to prove these criteria, so its content follows from them.',
    },
    risks: [
      '<b>Criteria copied from the single-die sort limits.</b> The stack pays for an escape with every die it is bonded to, so limits that were economic for one package are not economic for a stack.',
      '<b>A criterion no pre-bond insertion can measure.</b> Probe cannot reach every interface before bonding, and a criterion that assumes it can is a hope rather than a screen.',
      '<b>Temperature coverage assumed rather than specified.</b> A die sorted only at room temperature is stacked into a part that runs hot, and the escapes appear at the stack corner.',
      '<b>Criteria agreed with design but not with the stacking partner.</b> The partner then applies its own incoming limits, and dies pass one screen and fail the other.',
      '<b>No link to the repair budget.</b> A die with repairable faults is either scrapped needlessly or stacked with a repair margin already spent.',
    ],
    roles: [
      { r: 'Product engineering', d: 'Owns the criteria and the economics behind them' },
      { r: 'Test engineer', d: 'Confirms each criterion can be measured at sort' },
      { r: 'DFT architect', d: 'Pre-bond access and what it can reach' },
      { r: 'Stacking partner liaison', d: 'Incoming limits on the other side of the bond' },
      { r: 'Yield and quality lead', d: 'Approves the criteria against the escape target' },
    ],
    effort: [
      ['Criteria from the yield economics', 1.5],
      ['Sort flow definition', 1],
      ['Partner alignment', 0.75],
      ['Release and review', 0.75],
    ],
    entry: [
      'Stack yield and KGD economics released from PART-04',
      'Pre-bond test access defined in D2D-05',
      'Stacking partner identified',
    ],
    exit: [
      'Every criterion paired with the sort insertion that measures it',
      'Criteria accepted by the stacking partner in writing',
      'Definition released to test development',
    ],
    dependsOn: ['PART-04', 'D2D-05', 'TEST-01'],
    dependsNote: null,
    feedsInto: ['KGD-02', 'KGD-03', 'MDT-04'],
    measuredBy: [
      'Criteria with a measuring insertion against total criteria',
      'Stacked dies later attributed as sort escapes',
      'Scrap rate of dies that would have passed a single-die screen',
    ],
    links: {
      dependsOn: ['PART-04', 'D2D-05', 'TEST-01'],
      feedsInto: ['KGD-02', 'KGD-03', 'MDT-04'],
      runsWith: [],
      revisedBy: ['MDT-01'],
      feedsBackInto: [],
    },
    terms: ['KGD', 'DPPM', 'D2D', 'KGS'],
  },
  'KGD-02': {
    criticalPath: true,
    purpose: [
      'Extend the <b>wafer sort program to the known-good-die criteria</b>: the added tests, the die-to-die link checks that can run before bonding, and the limits and guard bands a stacked die has to clear.',
      'The SoC sort program from TEST-06 was written to decide which dies are worth packaging. This one decides which dies are worth stacking, and the difference is in coverage at corner, in what can be probed on a fine-pitch interface, and in how tightly the limits are guard-banded.',
    ],
    flowNote:
      'Step 1 extends the program to the criteria, and step 2 adds the D2D tests that can run before bonding. Step 3 sets the limits in parallel with step 2 because the guard bands depend on the tester correlation already in hand rather than on the new tests, and step 4 releases the program for the stacking lots.',
    consumes: [
      'Known-good-die criteria from KGD-01',
      'Base wafer sort program from TEST-06',
      'Probe card for the product die from TEST-04',
      'D2D test and repair architecture from D2D-05',
      'Tester correlation data from TEST-11',
    ],
    rel: {
      'KGD-D2':
        '<b>Wafer sort program for stacking.</b> The program is extended, limited and released here.',
      'KGD-D3':
        '<b>Die matching and binning plan.</b> The parametric data the sort program logs is what the dies are binned and paired on.',
    },
    risks: [
      '<b>Probing the bond pads damages them.</b> Hybrid and fine-pitch micro-bump surfaces tolerate little probe scrub, so the sort itself can make a die unstackable.',
      '<b>Link tests limited to what the probe card reaches.</b> Most D2D lanes cannot be contacted at pitch, and the coverage report must say so rather than imply full link coverage.',
      '<b>Guard bands set without correlation.</b> Limits tightened by guesswork scrap good dies, and limits left loose pass the escapes the stack cannot afford.',
      '<b>Parametric data not logged per die.</b> Matching and binning in KGD-03 need the values, not just the bin, and a pass/fail program throws them away.',
      '<b>Test time grows without a cost check.</b> Added corner and link tests can double sort time, and nobody costs that against the escapes they prevent.',
    ],
    roles: [
      { r: 'Test engineer', d: 'Owns the program, its limits and its release' },
      { r: 'DFT engineer', d: 'Pre-bond link BIST and wrapper access' },
      { r: 'Probe card engineer', d: 'Contact at pitch without damaging the bond surface' },
      { r: 'Yield engineer', d: 'Parametric logging needed for binning' },
      { r: 'Product engineering', d: 'Approves the limits against the KGD criteria' },
    ],
    effort: [
      ['Program extension to the criteria', 1.75],
      ['Pre-bond D2D link tests', 1.5],
      ['Limits and guard bands', 1.25],
      ['Probe and bond surface qualification', 0.75],
      ['Release and correlation', 0.75],
    ],
    entry: [
      'Known-good-die criteria released from KGD-01',
      'Base sort program running from TEST-06',
      'Pre-bond test access defined in D2D-05',
    ],
    exit: [
      'Every KGD criterion covered by a test in the program',
      'Probe marks shown not to degrade bond yield',
      'Program released for the stacking lots with per-die parametric logging',
    ],
    dependsOn: ['KGD-01', 'TEST-06', 'TEST-04', 'D2D-05'],
    dependsNote: null,
    feedsInto: ['KGD-03', 'KGD-04', 'MDT-02'],
    measuredBy: [
      'KGD criteria covered by the program against total',
      'Sort escapes found at post-bond test',
      'Sort test time per die against the plan',
    ],
    links: {
      dependsOn: ['KGD-01', 'TEST-04', 'TEST-06', 'D2D-05'],
      feedsInto: ['KGD-03', 'KGD-04', 'MDT-02'],
      runsWith: [],
      revisedBy: ['TEST-11'],
      feedsBackInto: ['MDT-05'],
    },
    terms: ['KGD', 'ATE', 'BIST', 'D2D'],
  },
  'KGD-03': {
    criticalPath: false,
    purpose: [
      'Decide <b>which dies go into a stack together</b>: the matching rules, the parametric bins the dies are sorted into, and the compound yield those rules produce.',
      'A stack runs at the speed and power of its worst die, and its inter-die timing depends on how well the two dies agree. Pairing a fast top die with a slow bottom die wastes the fast one, so matching is how the program turns sort data into stack yield rather than leaving it to chance.',
    ],
    flowNote:
      'Step 1 writes the matching rules from the inter-die timing and power budgets, and step 2 bins the dies on the parameters those rules use. Step 3 models compound yield alongside the binning, because a rule that strands half the inventory in an unmatched bin is not worth keeping, and step 4 releases the plan to assembly.',
    consumes: [
      'Per-die parametric sort data from KGD-02',
      'Known-good-die criteria from KGD-01',
      'Inter-die timing budget from 3DI-03',
      'Stack power delivery margins from 3DI-02',
      'Test data and yield database from TEST-10',
    ],
    rel: {
      'KGD-D3':
        '<b>Die matching and binning plan.</b> The matching rules, the bins and the pairing yield model are released here.',
      'KGD-D4':
        '<b>Known-good die release record.</b> Dies are released to assembly in the pairs and bins this plan defines.',
    },
    risks: [
      '<b>Rules that no binning data supports.</b> Matching on a parameter sort does not log leaves assembly pairing by wafer lot instead.',
      '<b>Inventory stranded in unmatched bins.</b> Tight rules raise stack yield and lower die utilization, and the balance has to be modelled rather than discovered in the warehouse.',
      '<b>W2W flow assumed to allow matching.</b> Wafer-to-wafer bonding pairs whole wafers, so only wafer-level matching is possible and the plan must say which flow it serves.',
      '<b>Bins defined at one temperature.</b> Speed ranks change across temperature, and a pair matched at room temperature can mismatch at the stack corner.',
      '<b>Traceability lost between bin and stack.</b> Without the pairing recorded per unit, a failing stack cannot be traced back to the rule that built it.',
    ],
    roles: [
      { r: 'Yield engineer', d: 'Owns the matching rules and the pairing yield model' },
      { r: 'Timing lead', d: 'Inter-die timing sensitivity to the paired dies' },
      { r: 'Test engineer', d: 'Parametric data available from sort' },
      { r: 'Assembly process engineer', d: 'What pairing the bonding flow can execute' },
      { r: 'Product engineering', d: 'Approves the plan against utilization and yield' },
    ],
    effort: [
      ['Matching rule definition', 1.5],
      ['Parametric binning', 1.25],
      ['Compound yield modeling', 1.25],
      ['Assembly flow alignment and release', 1],
    ],
    entry: [
      'Sort program logging per-die parametrics from KGD-02',
      'Inter-die timing budget available from 3DI-03',
      'Bonding flow chosen, D2W or W2W',
    ],
    exit: [
      'Every matching rule backed by a parameter sort logs',
      'Pairing yield and die utilization modelled together',
      'Plan released to assembly with per-unit pairing traceability',
    ],
    dependsOn: ['KGD-02', 'KGD-01', '3DI-03'],
    dependsNote: null,
    feedsInto: ['KGD-04', 'ASSY-05'],
    measuredBy: [
      'Stack yield of matched against unmatched pairs',
      'Dies stranded in unmatched bins',
      'Stacks traceable to their pairing rule',
    ],
    links: {
      dependsOn: ['KGD-01', 'KGD-02', '3DI-03'],
      feedsInto: ['KGD-04', 'ASSY-05'],
      runsWith: [],
      revisedBy: ['3DI-02', 'TEST-10'],
      feedsBackInto: [],
    },
    terms: ['KGD', 'D2W', 'W2W', 'PVT'],
  },
  'KGD-04': {
    criticalPath: true,
    purpose: [
      'Get <b>thinned, sorted wafers to the assembly line intact and traceable</b>: the handling plan, the map from wafer to stacked unit, the carrier logistics and the release of the dies themselves.',
      'A thinned wafer on a carrier breaks, bows and ages in ways a full-thickness wafer does not, and once dies are stacked their origin is invisible unless it was recorded. This activity is where good dies stop being lost between sort and bond.',
    ],
    flowNote:
      'Step 1 plans the handling from the thinning step to the OSAT, and step 2 sets the traceability that has to travel with it. Step 3 runs alongside, agreeing carrier logistics and storage limits with the OSAT, and step 4 releases the known-good dies against all three.',
    consumes: [
      'Thinning and handling flow definition from BOND-04',
      'Die matching and binning plan from KGD-03',
      'Wafer sort results from KGD-02',
      'Wafer shipment logistics from FAB-10',
      'Frozen 3D assembly process window from DCTV-07',
    ],
    rel: {
      'KGD-D4':
        '<b>Known-good die release record.</b> The dies are released to assembly here, with their handling and traceability attached.',
    },
    risks: [
      '<b>Traceability lost at the thinning step.</b> Wafer maps are keyed to the full-thickness wafer, and a carrier swap without a remap severs the link to sort data.',
      '<b>Thinned wafers stored past their limit.</b> Bond surfaces oxidize and adhesives age, and a queue at the OSAT quietly turns good dies into bond failures.',
      '<b>Handling qualified on monitors only.</b> Product wafers with real topography and TSVs break differently from the blanks the flow was proven on.',
      '<b>Release ahead of the matching plan.</b> Dies shipped before pairing is decided arrive in lots the bonding flow cannot use efficiently.',
      '<b>No disposition for damaged dies.</b> Chipped or cracked dies found at incoming inspection need a rule, or they are either stacked or lost from the count.',
    ],
    roles: [
      { r: 'Operations planner', d: 'Owns the handling plan, logistics and release' },
      { r: 'Wafer process engineer', d: 'Thinned wafer and carrier limits' },
      { r: 'OSAT liaison', d: 'Incoming inspection, storage and queue time' },
      { r: 'Test data engineer', d: 'Wafer map to stacked unit traceability' },
      { r: 'Product engineering', d: 'Approves the release of dies to assembly' },
    ],
    effort: [
      ['Handling plan', 1],
      ['Traceability mapping', 1.25],
      ['Carrier logistics and storage', 0.75],
      ['Release and disposition', 1],
    ],
    entry: [
      'Thinning and handling flow defined in BOND-04',
      'Matching and binning plan released from KGD-03',
      'Assembly process window frozen in DCTV-07',
    ],
    exit: [
      'Every released die traceable from wafer map to stacked unit',
      'Storage and queue time limits agreed and monitored at the OSAT',
      'Known-good dies released with a disposition rule for handling damage',
    ],
    dependsOn: ['BOND-04', 'KGD-03', 'KGD-02', 'FAB-10'],
    dependsNote: null,
    feedsInto: ['ASSY-05', 'MDT-02'],
    measuredBy: [
      'Dies lost or broken between sort and bond',
      'Stacked units traceable to their source wafer and die',
      'Wafers exceeding storage limits before bonding',
    ],
    links: {
      dependsOn: ['BOND-04', 'FAB-10', 'KGD-02', 'KGD-03'],
      feedsInto: ['ASSY-05', 'MDT-02'],
      runsWith: [],
      revisedBy: ['DCTV-07'],
      feedsBackInto: [],
    },
    terms: ['KGD', 'OSAT', 'TSV', 'WIP'],
  },
};
