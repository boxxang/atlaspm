import type { ActivityWriteUp } from '../activityDetailTypes';

/** Product stack bonding — STK-01 to STK-04. */
export const STK_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'STK-01': {
    criticalPath: true,
    purpose: [
      'Bond the product: <b>known-good top and bottom dies joined face to face by hybrid bonding</b>, in the recipe and process window the daisy chain vehicle froze, and annealed into stacks the rest of the flow can build on.',
      'Every die that reaches this run has already cost a mask set, a wafer and a sort insertion, and a hybrid bond cannot be reworked. A bond that fails here scraps two good dies at once, so the run is held to the window DCTV-07 measured rather than to what the bonder can be made to do on the day.',
    ],
    flowNote:
      'Step 1 checks the recipe against the frozen window before any product die is committed, and step 2 runs alongside it, turning the binning plan into the pairing and sequence the bonder will follow. Step 3 prepares and activates both surfaces, and step 4 bonds and anneals them without delay, because an activated surface left waiting collects the particles and moisture that become voids.',
    consumes: [
      'Frozen 3D assembly process window from DCTV-07',
      'Known-good dies released by KGD-04',
      'Die matching and pairing rules from KGD-03',
      'Bonding scheme and its constraints from BOND-01',
      'Bond pitch and alignment capability from BOND-03',
    ],
    rel: {
      'STK-D1':
        '<b>Bonded product stack lots.</b> The lots are bonded and annealed here, from the pairing the binning plan set.',
      'STK-D4':
        '<b>Stack release record for package assembly.</b> Each released stack traces back to the pairing and bond record written in this run.',
    },
    risks: [
      '<b>Recipe drifted from the frozen window.</b> A bonder retuned for throughput runs outside the conditions the vehicle proved, and the yield learning no longer applies.',
      '<b>Surfaces left waiting after activation.</b> Queue time between plasma activation and bonding is where particles and moisture turn into voids at the interface.',
      '<b>Pairing ignored under schedule pressure.</b> Bonding whatever dies are to hand discards the binning that was paid for and pairs fast dies with slow ones.',
      '<b>Bonding started before both dies’ sort data is in.</b> A top die whose results arrive after the bond is committed can no longer be screened out.',
      '<b>Anneal profile treated as fixed.</b> The anneal sets the copper bond strength and the thermal budget the stack spends, and it has to match what BOND-05 allowed.',
    ],
    roles: [
      { r: 'Stack integration engineer', d: 'Owns the bonding run and the recipe it runs to' },
      { r: 'Packaging technologist', d: 'Holds the run to the frozen process window' },
      { r: 'Yield engineer', d: 'Die pairing and bond sequence from the binning plan' },
      { r: 'Foundry bonding engineer', d: 'Surface preparation, activation and bonder operation' },
      { r: 'Product engineering lead', d: 'Approves the run to proceed on product dies' },
    ],
    effort: [
      ['Recipe and window check', 1],
      ['Pairing and bond sequence', 1],
      ['Surface preparation and activation', 1.5],
      ['Bonding and anneal', 2.5],
    ],
    entry: [
      'Process window frozen and signed off in DCTV-07',
      'Known-good dies of both types released by KGD-04',
      'Pairing rules published from KGD-03',
    ],
    exit: [
      'Every planned pairing bonded and annealed, or dispositioned with a reason',
      'Bond conditions recorded per lot against the frozen window',
      'Bonded lots handed to post-bond inspection with their pairing records',
    ],
    dependsOn: ['DCTV-07', 'KGD-03', 'KGD-04'],
    dependsNote: null,
    feedsInto: ['STK-02', 'STK-03'],
    measuredBy: [
      'Bond yield against the yield the vehicle measured',
      'Lots run inside the frozen window against lots run',
      'Queue time between activation and bond',
    ],
    links: {
      dependsOn: ['DCTV-07', 'KGD-03', 'KGD-04', 'BOND-01', 'BOND-03'],
      feedsInto: ['STK-02', 'STK-03', 'STK-04'],
      runsWith: [],
      revisedBy: ['BOND-05'],
      feedsBackInto: [],
    },
    terms: ['HB', 'F2F', 'D2W', 'KGD', 'DCTV'],
  },

  'STK-02': {
    criticalPath: false,
    purpose: [
      'Inspect every bonded stack <b>for voids, delamination, misalignment and bond defects</b> before any more value is added to it, and disposition each one against limits agreed in advance.',
      'After this point the bottom die is thinned and redistributed and the stack goes into a package, and none of that makes a bad bond better. A void found now scraps a stack; a void found at final test scraps a package, an interposer and a slot on the line as well.',
    ],
    flowNote:
      'Step 1 scans every stack acoustically, and step 2 runs alongside it on the same lots, measuring overlay by infrared through the silicon. Step 3 follows with X-ray on the stacks and sites the first two flagged, and step 4 dispositions each stack against the limits, so nothing moves to backside processing without a decision recorded against it.',
    consumes: [
      'Bonded product stack lots from STK-01',
      'Void and overlay limits proven on the vehicle in DCTV-04',
      'Bond alignment budget from BOND-03',
      'Inter-die bump map and its redundancy from D2D-04',
      'Bond interface reliability requirements from BOND-05',
    ],
    rel: {
      'STK-D2':
        '<b>Post-bond inspection report.</b> The report is written here: acoustic, infrared and X-ray results, and the disposition of every stack.',
    },
    risks: [
      '<b>Limits set after the results are in.</b> A threshold chosen once the distribution is known is chosen to pass the lot, not to protect the stack.',
      '<b>Sampling where every stack should be scanned.</b> Voids cluster by lot and by position on the bonder, and a sample misses exactly the clusters that matter.',
      '<b>Overlay judged against the drawn pitch rather than the redundancy.</b> A misalignment the redundant bumps can absorb is not a reject, and one they cannot absorb is.',
      '<b>Acoustic resolution coarser than the bond pitch.</b> A scan that cannot resolve a void the size of a bond pad reports a clean interface that is not.',
      '<b>Rejects not fed back to the bonding run.</b> A void pattern that points at a chuck, a slot or a queue time has to reach STK-01 while the run is still going.',
    ],
    roles: [
      { r: 'Stack quality engineer', d: 'Owns the inspection plan, the limits and the disposition' },
      { r: 'Metrology engineer', d: 'CSAM and infrared overlay measurement' },
      { r: 'Failure analysis engineer', d: 'X-ray and cross-section of flagged sites' },
      { r: 'Stack integration engineer', d: 'Takes the findings back into the bonding run' },
      { r: 'Quality manager', d: 'Approves the disposition of each lot' },
    ],
    effort: [
      ['Acoustic scanning', 1],
      ['Overlay metrology', 0.5],
      ['X-ray and defect review', 0.75],
      ['Disposition and reporting', 0.75],
    ],
    entry: [
      'Bonded lots delivered from STK-01 with their pairing records',
      'Void, overlay and defect limits agreed before inspection starts',
      'Inspection tools correlated on the vehicle stacks',
    ],
    exit: [
      'Every stack scanned and dispositioned against the agreed limits',
      'Defect patterns traced to the bonding run and reported back',
      'Only accepted stacks released to backside processing',
    ],
    dependsOn: ['STK-01'],
    dependsNote: null,
    feedsInto: ['STK-03', 'STK-04'],
    measuredBy: [
      'Stacks dispositioned against stacks bonded',
      'Post-bond escapes found later at package test',
      'Time from bond to disposition per lot',
    ],
    links: {
      dependsOn: ['STK-01', 'DCTV-04', 'BOND-03', 'D2D-04'],
      feedsInto: ['STK-03', 'STK-04'],
      runsWith: [],
      revisedBy: ['BOND-05'],
      feedsBackInto: ['STK-01'],
    },
    terms: ['CSAM', 'TSV', 'CTE'],
  },

  'STK-03': {
    criticalPath: true,
    purpose: [
      'Thin the bottom die from the back <b>until its TSVs are exposed</b>, passivate the new surface, and build the backside redistribution and bumps the stack will be attached to the package by.',
      'The TSVs were formed in the bottom die’s front end and have been buried since; the stack only becomes connectable when they are revealed. Grinding a bonded stack to a few tens of microns puts the whole bond interface under stress, and a reveal that stops short or overshoots cannot be recovered.',
    ],
    flowNote:
      'The steps run in strict sequence, because each works on the surface the one before it left. Step 1 grinds and polishes to the reveal target, step 2 exposes and passivates the TSVs, and step 3 builds the RDL and bumps. Step 4 measures TSV resistance and bump coplanarity before release, so an open via or a warped wafer is found here rather than at die attach.',
    consumes: [
      'Stacks accepted by post-bond inspection in STK-02',
      'TSV and backside process rules from BOND-02',
      'Thinning, handling and carrier flow from BOND-04',
      'Package bump map and backside RDL rules from BOND-06',
      'Warpage and stress limits from 3DI-05',
    ],
    rel: {
      'STK-D3':
        '<b>Backside-processed stack wafers.</b> The thinning, reveal, redistribution and bumping are done and measured here.',
      'STK-D4':
        '<b>Stack release record for package assembly.</b> TSV resistance and bump coplanarity measured here are part of what each stack is released on.',
    },
    risks: [
      '<b>Reveal depth set from the nominal TSV height.</b> TSV height varies across the wafer, and a single grind target leaves some vias buried and others over-exposed.',
      '<b>Thickness variation not measured before reveal.</b> The carrier and bond layer add to the stack’s total thickness variation, and the reveal inherits all of it.',
      '<b>Backside copper contamination.</b> Copper smeared during the reveal diffuses into the thinned silicon unless it is removed and passivated at once.',
      '<b>Warpage after thinning ignored until die attach.</b> A thin stack bows with the CTE mismatch of its bond layer, and bumps that are coplanar on the carrier are not after debond.',
      '<b>Electrical check left to package test.</b> An open TSV found after assembly has already consumed a substrate and an interposer site.',
    ],
    roles: [
      { r: 'Backside process engineer', d: 'Owns thinning, reveal, passivation and RDL' },
      { r: 'Process integration engineer', d: 'Reveal target and TSV process rules' },
      { r: 'Metrology engineer', d: 'Thickness, coplanarity and TSV resistance measurement' },
      { r: 'Package mechanical engineer', d: 'Warpage limits for the thinned stack' },
      { r: 'Foundry process manager', d: 'Approves release of the backside-processed wafers' },
    ],
    effort: [
      ['Thinning to the reveal target', 1.5],
      ['TSV reveal and passivation', 1.5],
      ['Backside RDL and bumping', 2],
      ['TSV resistance and coplanarity measurement', 1],
    ],
    entry: [
      'Stacks accepted by post-bond inspection in STK-02',
      'Reveal target and TSV height distribution known for each lot',
      'Backside RDL and bump rules released from BOND-06',
    ],
    exit: [
      'TSVs revealed within the depth window across every wafer',
      'Backside RDL and bumps built and measured for coplanarity',
      'TSV resistance measured and within limits before release',
    ],
    dependsOn: ['STK-02', 'BOND-02', 'BOND-04'],
    dependsNote: null,
    feedsInto: ['STK-04', 'ASSY-05'],
    measuredBy: [
      'TSVs revealed within the depth window against TSVs measured',
      'Bump coplanarity against the die attach limit',
      'Wafers lost to breakage or contamination during thinning',
    ],
    links: {
      dependsOn: ['STK-02', 'BOND-02', 'BOND-04', 'BOND-06'],
      feedsInto: ['STK-04', 'ASSY-05'],
      runsWith: [],
      revisedBy: ['3DI-05'],
      feedsBackInto: [],
    },
    terms: ['TSV', 'RDL', 'CTE', 'CMP'],
  },

  'STK-04': {
    criticalPath: true,
    purpose: [
      'Dice the processed wafers into stacks, <b>tie every stack to the two dies it was built from</b>, sort the stacks for assembly on their post-bond results, and release the good ones to package assembly.',
      'A stack that fails at bring-up or in the field has to be traced to a top die, a bottom die, a bond lot and a backside lot, or the failure cannot be attributed and the escape analysis in MDT-05 has nothing to work with. That record is cheapest to make at the moment the wafer becomes stacks.',
    ],
    flowNote:
      'Step 1 dices the wafers, and step 2 runs alongside, linking each stack position to both dies’ wafer maps before the wafer frame is gone. Step 3 sorts the singulated stacks on the inspection and backside results, and step 4 releases the good ones to die attach with their records, so assembly receives stacks it can build on rather than a tray to sort.',
    consumes: [
      'Backside-processed stack wafers from STK-03',
      'Post-bond inspection disposition from STK-02',
      'Wafer-to-stack traceability map from KGD-04',
      'Pairing record from the bonding run in STK-01',
      'Die attach readiness from ASSY-05',
    ],
    rel: {
      'STK-D4':
        '<b>Stack release record for package assembly.</b> The release is made here, each stack carrying its top die, bottom die and process lots.',
    },
    risks: [
      '<b>Traceability lost at dicing.</b> Once the frame is removed a stack position cannot be recovered, and every later failure becomes unattributable.',
      '<b>Dicing damage at the bond interface.</b> Chipping along the saw street can start delamination that no inspection before dicing could have seen.',
      '<b>Stacks released on bond results alone.</b> A stack with a good bond and an open TSV is not a good stack, and the backside data has to be part of the sort.',
      '<b>Release quantity planned against dies rather than stacks.</b> Bond and backside losses compound, and assembly slots booked on die counts go unfilled.',
      '<b>No hold for lots still under review.</b> A lot with an open inspection finding released by default reaches die attach before the finding is closed.',
    ],
    roles: [
      { r: 'Operations planner', d: 'Owns the release plan and the stack records' },
      { r: 'OSAT process engineer', d: 'Dicing and singulation of the bonded wafers' },
      { r: 'Yield engineer', d: 'Sort rules from the inspection and backside results' },
      { r: 'Test engineer', d: 'Links stack records to the post-bond test flow' },
      { r: 'Supply chain manager', d: 'Approves the release to package assembly' },
    ],
    effort: [
      ['Dicing and singulation', 0.75],
      ['Stack-to-die traceability', 0.75],
      ['Stack sort for assembly', 0.75],
      ['Release and handoff', 0.75],
    ],
    entry: [
      'Backside-processed wafers measured and released by STK-03',
      'Every stack dispositioned by STK-02',
      'Die attach capacity booked in ASSY-05',
    ],
    exit: [
      'Every released stack traceable to its top die, bottom die and process lots',
      'Stacks sorted on bond and backside results together',
      'Release quantity reconciled against the assembly plan',
    ],
    dependsOn: ['STK-03', 'STK-02', 'KGD-04'],
    dependsNote: null,
    feedsInto: ['ASSY-05', 'MDT-02'],
    measuredBy: [
      'Released stacks with a complete die and lot record',
      'Stacks released against dies bonded',
      'Dicing losses against stacks singulated',
    ],
    links: {
      dependsOn: ['STK-03', 'STK-02', 'STK-01', 'KGD-04'],
      feedsInto: ['ASSY-05', 'MDT-02', 'MDT-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['KGS', 'KGD', 'OSAT'],
  },
};
