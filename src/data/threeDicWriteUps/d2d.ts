import type { ActivityWriteUp } from '../activityDetailTypes';

/** Die-to-die interface and IP readiness — the link the dies exist on either side of. */
export const D2D_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'D2D-01': {
    criticalPath: true,
    purpose: [
      'Choose <b>the interface the dies will talk over</b>—UCIe, BoW or a custom link—and the profile within it, against the bandwidth, latency and power budget the partitioning set and the bonding pitch the process can deliver.',
      'Every later D2D activity is drawn against this choice: the PHY IP that can be bought, the protocol that runs over it, the bump map both dies are floorplanned to and the test access that reaches it. Reversing it after the IP is committed costs a quarter and usually a vendor relationship, which is why it closes in the first six weeks of the stage.',
    ],
    flowNote:
      'Steps 1 and 2 run in sequence because the budget comparison is meaningless until each option is also checked against the pitch BOND-01 selected—an advanced-package UCIe profile at a hybrid-bond pitch is a different proposition from the same profile on micro-bumps. Step 3 runs alongside step 2 so the ecosystem cost is on the table before the decision in step 4, not argued afterwards.',
    consumes: [
      'Die-to-die bandwidth and power budget from PART-02',
      'Interface contract and die list from PART-05',
      'Bonding scheme and pitch constraints from BOND-01',
      'System interface and protocol choices from ARCH-03',
      'IP requirement definition from IPR-01',
    ],
    rel: {
      'D2D-D1':
        '<b>Interface standard selection record.</b> Written and signed here, with the options it was chosen over and the constraints each one failed.',
      'D2D-D2':
        '<b>D2D PHY IP commitment and schedule.</b> The selected standard and profile are what the IP shortlist is drawn against, so the vendor evaluation cannot start in earnest until this record exists.',
    },
    risks: [
      '<b>Interface chosen before the bonding pitch is known.</b> A standard profile that assumes a bump pitch the process cannot hold forces a reselection after IP evaluation has already started.',
      '<b>Budget compared on headline bandwidth only.</b> Latency, beachfront and power per bit decide whether the partition works; raw Gb/s per lane rarely does.',
      '<b>Custom interface picked for margin without costing the ecosystem.</b> Every verification IP, compliance suite and test pattern then has to be built in-house and maintained for the life of the product.',
      '<b>Profile left open inside the standard.</b> Standard and advanced package profiles differ in lane count, pitch and reach, and the bump map cannot be drawn until one is chosen.',
      '<b>Decision owned by one die team.</b> The interface is shared, and a choice made for one die’s convenience surfaces as the other die’s floorplan problem.',
    ],
    roles: [
      { r: 'Interface architect', d: 'Owns the comparison and the selection record' },
      { r: 'System architect', d: 'Holds the bandwidth and latency budget the choice must meet' },
      { r: 'Packaging technologist', d: 'Confirms pitch and reach against the bonding scheme' },
      { r: 'IP manager', d: 'Ecosystem, vendor availability and licensing cost of each option' },
      { r: 'Chief architect', d: 'Approves the selection' },
    ],
    effort: [
      ['Option comparison against the budget', 1.5],
      ['Pitch and profile compatibility', 1],
      ['Ecosystem and interoperability costing', 0.75],
      ['Selection review and record', 0.75],
    ],
    entry: [
      'Die-to-die bandwidth and power budget available from PART-02',
      'Bonding scheme selected in BOND-01',
      'Candidate die split agreed well enough to count links',
    ],
    exit: [
      'Standard and profile selected, with the rejected options and why',
      'Selection checked against the bonding pitch, not assumed',
      'Record signed by both die owners and the package team',
    ],
    dependsOn: ['PART-02', 'BOND-01', 'ARCH-03'],
    dependsNote: null,
    feedsInto: ['D2D-02', 'D2D-03', 'D2D-04'],
    measuredBy: [
      'Weeks from partition freeze to interface selection',
      'Budget margin of the selected profile at the chosen pitch',
      'Reselections after IP evaluation started',
    ],
    links: {
      dependsOn: ['ARCH-03', 'IPR-01', 'PART-02', 'PART-05', 'BOND-01'],
      feedsInto: ['D2D-02', 'D2D-03', 'D2D-04', 'D2D-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['UCIe', 'BoW', 'D2D', 'PHY', 'HB'],
  },

  'D2D-02': {
    criticalPath: true,
    purpose: [
      'Evaluate the <b>D2D PHY IP</b> available for the selected profile and commit to a vendor whose silicon evidence, deliverable set and delivery schedule the program can actually build on.',
      'The PHY is the part of the interface nobody on the program designs, so its maturity sets the ceiling on everything above it. A vendor with test-chip data at another pitch or another node is a promise, not evidence, and this activity exists to tell the two apart before the purchase order is signed.',
    ],
    flowNote:
      'Step 1 narrows the field to vendors that support the profile D2D-01 selected. Steps 2 and 3 then run together: silicon evidence and the deliverable set are reviewed in parallel because a strong silicon story with no timing views or test collateral is as unusable as the reverse. Step 4 is the commitment and the schedule, and it is the longest step because the delivery milestones have to line up with RTL integration and the physical design floorplan.',
    consumes: [
      'Interface standard selection record from D2D-01',
      'IP vendor evaluation criteria from IPR-04',
      'Silicon-proven and node readiness assessment from IPR-05',
      'Bond pitch and alignment capability from BOND-03',
      'IP integration schedule constraints from IPR-09',
    ],
    rel: {
      'D2D-D2':
        '<b>D2D PHY IP commitment and schedule.</b> Produced here: the selected vendor, the delivery drops and the dates the program is holding them to.',
      'D2D-D6':
        '<b>Interface compliance and interop report.</b> The vendor’s models and compliance collateral committed here are what the interoperability runs in D2D-06 are executed against.',
    },
    risks: [
      '<b>Silicon evidence at a different pitch or node.</b> PHY behavior at a hybrid-bond pitch does not follow from micro-bump results, and the gap is found at bring-up.',
      '<b>Deliverable set reviewed after commitment.</b> Missing LEF, timing views or BIST collateral turns into a change order and a schedule slip once the vendor is locked in.',
      '<b>Schedule accepted as quoted.</b> Vendor dates that do not line up with RTL integration or the floorplan push the gap onto the program, not the vendor.',
      '<b>Single-source with no fallback.</b> A vendor that slips or exits leaves no path short of reselecting the interface.',
      '<b>Test and repair hooks assumed.</b> Lane repair and IEEE 1838 access have to be in the PHY, and a PHY without them forces D2D-05 into workarounds.',
    ],
    roles: [
      { r: 'IP manager', d: 'Owns the evaluation, the commitment and the schedule' },
      { r: 'Interface architect', d: 'Technical fit against the selected profile' },
      { r: 'Analog and PHY lead', d: 'Reviews the silicon evidence and the characterization data' },
      { r: 'DFT architect', d: 'Checks BIST, repair and test access collateral' },
      { r: 'Program manager', d: 'Approves the commitment and holds the delivery dates' },
    ],
    effort: [
      ['Vendor shortlist', 1],
      ['Silicon evidence review', 1.5],
      ['Deliverable set review', 1.5],
      ['Commercial commitment and schedule', 2],
    ],
    entry: [
      'Interface standard and profile selected in D2D-01',
      'Bonding pitch capability available from BOND-03',
      'IP vendor evaluation criteria agreed in IPR-04',
    ],
    exit: [
      'Vendor committed with silicon evidence at a comparable pitch and node',
      'Deliverable set checked, gaps written into the contract',
      'IP delivery milestones placed on the program schedule',
    ],
    dependsOn: ['D2D-01', 'IPR-04', 'IPR-05'],
    dependsNote: null,
    feedsInto: ['D2D-03', 'D2D-05', 'D2D-06'],
    measuredBy: [
      'IP drops delivered against the committed dates',
      'Deliverable gaps found after commitment',
      'Silicon evidence pitch and node against the program’s',
    ],
    links: {
      dependsOn: ['IPR-04', 'IPR-05', 'IPR-09', 'D2D-01', 'BOND-03'],
      feedsInto: ['D2D-03', 'D2D-05', 'D2D-06', 'RTL-07'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['PHY', 'D2D', 'IP', 'LEF', 'BIST', 'IEEE 1838'],
  },

  'D2D-03': {
    criticalPath: true,
    purpose: [
      'Define the <b>link layer and protocol</b> that run over the PHY—framing, flow control, retry and error handling—and freeze them early enough for both die teams to implement the same thing.',
      'Bandwidth is a PHY property; whether the partition works at the latency the architecture assumed is a protocol property. Retry buffers, CRC and replay add latency and area on both dies, and this activity is where that cost is measured under load rather than taken from a datasheet.',
    ],
    flowNote:
      'Steps 1 and 2 are sequential because retry and error detection are defined on the framing, not independently of it. Step 3, the latency model under load, runs alongside step 2 so the retry scheme is sized against real traffic rather than the average. Step 4 freezes the protocol and hands it to both die teams, and it takes five weeks because every open question from either die has to be closed in one document.',
    consumes: [
      'Interface standard selection record from D2D-01',
      'PHY IP capabilities and vendor link layer options from D2D-02',
      'Die-to-die traffic matrix and latency budget from PART-02',
      'Dataflow and memory hierarchy definition from ARCH-04',
      'System performance model from ARCH-01',
    ],
    rel: {
      'D2D-D3':
        '<b>Link layer and protocol specification.</b> Produced and frozen here, as the single specification both die teams implement.',
      'D2D-D6':
        '<b>Interface compliance and interop report.</b> The protocol frozen here is the reference the compliance suite in D2D-06 verifies each die’s implementation against.',
    },
    risks: [
      '<b>Retry sized on average traffic.</b> Burst load exhausts the replay buffer and the link stalls exactly when the workload needs it.',
      '<b>Latency cost of the protocol left out of the budget.</b> The partition was costed on PHY latency, and framing plus retry quietly breaks the architecture’s assumption.',
      '<b>Each die implements its own reading of the spec.</b> Ambiguities resolved differently on either side only surface when two dies are bonded.',
      '<b>Error handling defined for the link but not the system.</b> An uncorrectable error needs a defined behavior above the link, or the first field failure has no owner.',
      '<b>Protocol frozen before the traffic model is stable.</b> A late change to the workload reopens the retry and flow-control sizing on both dies.',
    ],
    roles: [
      { r: 'Link architect', d: 'Owns the link layer and the protocol specification' },
      { r: 'System architect', d: 'Traffic model and latency budget' },
      { r: 'RTL leads for each die', d: 'Implementation feasibility and area cost' },
      { r: 'Verification lead', d: 'Checkable properties and compliance hooks' },
      { r: 'Interface architect', d: 'Approves the frozen specification' },
    ],
    effort: [
      ['Framing and flow control', 1.5],
      ['Retry and error handling', 2],
      ['Latency modeling under load', 1.5],
      ['Specification and die team review', 3],
    ],
    entry: [
      'Interface standard and profile selected in D2D-01',
      'PHY vendor committed in D2D-02',
      'Die-to-die traffic matrix available from PART-02',
    ],
    exit: [
      'Framing, flow control, retry and error handling specified in one document',
      'Protocol latency under burst load inside the architecture budget',
      'Specification accepted by both die RTL teams',
    ],
    dependsOn: ['D2D-01', 'D2D-02', 'PART-02'],
    dependsNote: null,
    feedsInto: ['D2D-06', 'RTL-05', 'DV-01'],
    measuredBy: [
      'Protocol latency under burst load against the budget',
      'Specification changes after freeze',
      'Open questions from either die team at freeze',
    ],
    links: {
      dependsOn: ['ARCH-01', 'ARCH-04', 'PART-02', 'D2D-01', 'D2D-02'],
      feedsInto: ['D2D-06', 'RTL-05', 'DV-01', '3DI-03'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['D2D', 'PHY', 'ECC', 'RTL'],
  },

  'D2D-04': {
    criticalPath: true,
    purpose: [
      'Draw and freeze the <b>inter-die bump map</b>—signal, power, ground and the redundant bumps the repair scheme spends—so both dies are floorplanned to the same grid.',
      'The bump map is the one drawing both die teams and the bonding process all have to agree on, and it is the one that cannot move once physical design has closed around it. Redundancy is added here rather than later because a spare that is not in the map cannot be spent by the repair mechanism in D2D-05.',
    ],
    flowNote:
      'Step 1 lays out the map from the interface lanes and the power needs. Step 2 adds the redundant bumps the repair scheme needs, and step 3 runs alongside it to check the growing map against the alignment budget from BOND-03—redundancy that pushes pitch beyond what the bonder can hold is not redundancy. Step 4 freezes the map across both dies and is the longest because it is a negotiation with each floorplan, not a sign-off.',
    consumes: [
      'Interface standard and lane count from D2D-01',
      'Bond pitch and alignment capability statement from BOND-03',
      'TSV and backside process rules from BOND-02',
      'Chip-level floorplan and bump planning from ARCH-08',
      'Stack thermal and power budget from PART-03',
    ],
    rel: {
      'D2D-D4':
        '<b>Frozen inter-die bump map.</b> Drawn, checked against the alignment budget and frozen here across both dies.',
      'D2D-D5':
        '<b>D2D test and repair architecture.</b> The redundant bumps placed in this map are the spares the repair and lane-remap mechanism in D2D-05 can spend.',
    },
    risks: [
      '<b>Bump map reopened after floorplan.</b> Both dies’ physical design has closed around the grid, and a moved bump reopens placement on each.',
      '<b>Redundancy added without a repair mechanism to spend it.</b> Spares that no logic can switch to cost area and buy nothing.',
      '<b>Map checked against nominal pitch rather than the alignment budget.</b> Overlay error at the edge of the die turns into opens that the vehicle then finds.',
      '<b>Power bumps sized for average current.</b> The stack’s peak current through a thin power grid is what drives the IR drop 3DI-02 then cannot close.',
      '<b>Map drawn for one die’s floorplan.</b> The other die inherits a mirror-image problem it had no voice in.',
    ],
    roles: [
      { r: 'Package and bump engineer', d: 'Owns the map and its freeze' },
      { r: 'Physical design leads for each die', d: 'Floorplan fit on both sides' },
      { r: 'Assembly process engineer', d: 'Alignment budget and bondability' },
      { r: 'Power delivery engineer', d: 'Power and ground bump allocation' },
      { r: 'Interface architect', d: 'Approves the frozen map' },
    ],
    effort: [
      ['Bump map layout', 2],
      ['Redundancy allocation', 1.5],
      ['Alignment budget check', 1],
      ['Cross-die freeze and review', 2.5],
    ],
    entry: [
      'Interface standard and lane count fixed in D2D-01',
      'Bond pitch and alignment capability statement from BOND-03',
      'Early floorplans available for both dies',
    ],
    exit: [
      'One bump map frozen and accepted by both die physical design teams',
      'Redundant bumps placed and mapped to the repair scheme',
      'Map checked against the alignment budget, not nominal pitch',
    ],
    dependsOn: ['D2D-01', 'BOND-03', 'ARCH-08'],
    dependsNote: null,
    feedsInto: ['D2D-05', '3DI-01', 'PD-04', 'DCTV-02'],
    measuredBy: [
      'Bump map revisions after freeze',
      'Alignment margin at the worst-case bump',
      'Redundant bumps per lane against the repair budget',
    ],
    links: {
      dependsOn: ['ARCH-08', 'PART-03', 'BOND-02', 'BOND-03', 'D2D-01'],
      feedsInto: ['D2D-05', '3DI-01', '3DI-02', 'PD-04', 'DCTV-02'],
      runsWith: ['PKGD-02'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['TSV', 'D2D', 'KOZ', 'HB'],
  },

  'D2D-05': {
    criticalPath: false,
    purpose: [
      'Define <b>how the link is tested and repaired</b> once it is buried inside a stack: die-level access through an IEEE 1838 wrapper, the ports that reach a die with no direct tester contact, and the lane repair that spends the redundant bumps.',
      'Before bonding each die can be probed; after bonding only one of them can. Test access that was not designed for the stacked state leaves the second die unreachable, and a failed lane with no repair mechanism scraps an assembled stack of known-good dies.',
    ],
    flowNote:
      'Step 1 defines what each die must expose for test in the stacked state, and step 2 adopts the IEEE 1838 wrapper and port structure to deliver it. Step 3 runs alongside step 2 because the repair and lane remap mechanism shares the same access path and cannot be designed separately. Step 4 is a review with test development rather than a formality: it is where MDT-01 and KGD-02 confirm they can use what was designed.',
    consumes: [
      'Frozen inter-die bump map with redundant bumps from D2D-04',
      'PHY BIST and repair collateral from D2D-02',
      'DFT architecture and test strategy from DFT-01',
      'TAP, boundary scan and IJTAG architecture from DFT-03',
      'Repair and redundancy budget from PART-04',
    ],
    rel: {
      'D2D-D5':
        '<b>D2D test and repair architecture.</b> Defined here: the die wrappers, the stacked access ports and the lane repair mechanism, reviewed with test development.',
    },
    risks: [
      '<b>Test access designed for a die that is no longer reachable once bonded.</b> The buried die has no probe contact, and without a serial or parallel port through its neighbor it cannot be tested at all.',
      '<b>Repair mechanism with no spares to spend.</b> Lane remap logic is designed, but the redundant bumps were never placed in the map.',
      '<b>Wrapper added to one die only.</b> IEEE 1838 access only works when every die in the stack carries a compliant wrapper.',
      '<b>Repair decided at test but not stored.</b> A lane remap that is not written to fuses is lost at the next power cycle.',
      '<b>Test development not consulted.</b> An architecture the ATE flow cannot drive is redesigned during bring-up.',
    ],
    roles: [
      { r: 'DFT architect', d: 'Owns the test and repair architecture' },
      { r: 'Test architect', d: 'Post-bond test access requirements' },
      { r: 'Interface architect', d: 'PHY repair and lane remap hooks' },
      { r: 'Package and bump engineer', d: 'Redundant bump allocation' },
      { r: 'Test development lead', d: 'Approves the architecture as usable on the ATE' },
    ],
    effort: [
      ['Die-level test access definition', 1.5],
      ['IEEE 1838 wrapper and ports', 2],
      ['Lane repair and remap', 1.5],
      ['Review with test development', 2],
    ],
    entry: [
      'Bump map with redundant bumps frozen in D2D-04',
      'PHY vendor BIST and repair collateral available from D2D-02',
      'DFT architecture defined in DFT-01',
    ],
    exit: [
      'Every die in the stack reachable for test after bonding',
      'Lane repair mapped to the redundant bumps and stored persistently',
      'Architecture accepted by test development for the post-bond flow',
    ],
    dependsOn: ['D2D-04', 'DFT-01', 'DFT-03'],
    dependsNote: null,
    feedsInto: ['MDT-01', 'MDT-02', 'KGD-02'],
    measuredBy: [
      'Dies reachable for test after bonding against dies in the stack',
      'Redundant lanes the repair mechanism can use',
      'Architecture changes requested during bring-up',
    ],
    links: {
      dependsOn: ['DFT-01', 'DFT-03', 'PART-04', 'D2D-02', 'D2D-04'],
      feedsInto: ['MDT-01', 'MDT-02', 'KGD-02', 'DFT-07'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['IEEE 1838', 'DFT', 'IJTAG', 'BIST', 'ATE', 'KGD'],
  },

  'D2D-06': {
    criticalPath: false,
    purpose: [
      'Verify that <b>both dies implement the same interface</b>: a compliance suite against the protocol specification, and interoperability runs against the vendor’s PHY model, before either die tapes out.',
      'Each die can pass its own verification and still fail to talk to the other. Compliance is the only check that is run against the interface rather than a die, and it has to be run on the delivered IP and RTL, not on a behavioral model that shares the spec author’s assumptions.',
    ],
    flowNote:
      'Step 1 builds the compliance suite from the frozen protocol. Step 2 runs it against each die’s link implementation, and step 3 runs alongside it against the vendor PHY model so protocol and PHY issues are separated early. Step 4 closes the interface with a report both die teams and the IP vendor sign, and every open item carries an owner and a date.',
    consumes: [
      'Link layer and protocol specification from D2D-03',
      'PHY IP models and compliance collateral from D2D-02',
      'UVM environment and VIP from DV-02',
      'Chip-level scenario tests from DV-08',
      'Third-party IP integration status from RTL-07',
    ],
    rel: {
      'D2D-D6':
        '<b>Interface compliance and interop report.</b> Produced here: compliance and interoperability results for both dies, with every open item owned and dated.',
    },
    risks: [
      '<b>Compliance run against a model rather than the delivered IP.</b> The model agrees with the spec by construction, and the real PHY does not.',
      '<b>Each die verified alone.</b> Two dies that each pass can still disagree on an ambiguity neither suite covered.',
      '<b>Error and retry paths not exercised.</b> Clean-link compliance says nothing about behavior under the bit errors the retry scheme exists for.',
      '<b>Suite built by the spec author.</b> The same reading of the specification goes into the design and the check, and the disagreement is invisible.',
      '<b>Report closes with open items and no owners.</b> The gaps then surface at stack bring-up, where they cost a bonded unit to debug.',
    ],
    roles: [
      { r: 'Verification lead', d: 'Owns the compliance suite and the report' },
      { r: 'Link architect', d: 'Specification interpretation and disposition' },
      { r: 'DV engineers for each die', d: 'Run the suite against their implementation' },
      { r: 'IP vendor application engineer', d: 'PHY model and interoperability support' },
      { r: 'Interface architect', d: 'Approves the interface as closed' },
    ],
    effort: [
      ['Compliance suite build', 2],
      ['Protocol verification per die', 2.5],
      ['Interoperability against the vendor model', 1.5],
      ['Report and closure', 2],
    ],
    entry: [
      'Protocol specification frozen in D2D-03',
      'PHY models delivered by the vendor committed in D2D-02',
      'Link RTL available from both die teams',
    ],
    exit: [
      'Both dies pass the same compliance suite, including error and retry paths',
      'Interoperability verified against the delivered vendor model',
      'Report signed with every open item owned and dated',
    ],
    dependsOn: ['D2D-03', 'D2D-02', 'DV-02'],
    dependsNote: null,
    feedsInto: ['MDT-02', '3DI-06'],
    measuredBy: [
      'Compliance tests passing on both dies',
      'Interoperability issues found after the report',
      'Open items at interface closure',
    ],
    links: {
      dependsOn: ['DV-02', 'RTL-07', 'D2D-02', 'D2D-03'],
      feedsInto: ['MDT-02', '3DI-06'],
      runsWith: ['DV-08'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['UVM', 'VIP', 'PHY', 'RTL', 'DV'],
  },
};
