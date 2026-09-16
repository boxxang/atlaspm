import type { ActivityWriteUp } from '../activityDetailTypes';

/** TSV and hybrid bond process enablement — BOND-01 to BOND-06. */
export const BOND_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'BOND-01': {
    criticalPath: true,
    purpose: [
      'Decide <b>how the dies in the stack are joined</b>—micro-bump with thermo-compression bonding, or hybrid bonding—and write down the constraints that choice puts on everything designed after it.',
      'The bonding scheme sets the pitch, and the pitch sets how many die-to-die connections the partition can have, how the bump map is drawn and which rule deck the design is held to. It is chosen at week twelve of the program because the interface and the stack floorplan cannot start until it is known.',
    ],
    flowNote:
      'Steps 1 and 2 gather what the foundry and OSAT can actually run and compare the two families on it. Step 3 runs alongside the comparison, holding each option against the bandwidth and pitch the partition needs, so an option that looks attractive on cost but cannot carry the traffic is dropped before step 4 selects.',
    consumes: [
      'Stack topology decision from PART-01',
      'Die-to-die bandwidth and bump budget from PART-02',
      'Stack yield and KGD economics from PART-04',
      'Foundry and OSAT capability roadmaps from TECH-09',
      'Package architecture direction from PKGD-01',
    ],
    rel: {
      'BOND-D1':
        '<b>Bonding scheme selection record.</b> The record is written here, with the options rejected and the reason each was rejected.',
      'BOND-D3':
        '<b>Bond pitch and alignment capability statement.</b> The selected scheme defines which capability data BOND-03 has to collect and qualify.',
    },
    risks: [
      '<b>Hybrid bonding chosen at a pitch the line has not demonstrated.</b> A roadmap pitch is not a capability, and the design will be drawn to whatever number is written down here.',
      '<b>Selection made on bond pitch alone.</b> Hybrid bonding also demands surface planarity, particle control and a D2W or W2W flow, and each of those has a yield and throughput cost.',
      '<b>Yield model ignored.</b> W2W bonding stacks bad dies with good ones; the choice has to be checked against the KGD economics, not only the interconnect density.',
      '<b>OSAT and foundry split unclear.</b> When nobody owns the bond step outright, the qualification and the failure analysis both fall between the two.',
      '<b>Decision reopened after the bump map starts.</b> Changing scheme after D2D-04 has begun redraws the map and the rule deck, and resets the interface schedule.',
    ],
    roles: [
      { r: 'Packaging technologist', d: 'Owns the comparison and the selection record' },
      { r: 'Chief architect', d: 'Holds the options to the partition and bandwidth need' },
      { r: 'Foundry integration lead', d: 'Hybrid bonding and TSV capability evidence' },
      { r: 'OSAT liaison', d: 'Micro-bump and thermo-compression bonding capability' },
      { r: 'Program director', d: 'Approves the scheme and the constraints it brings' },
    ],
    effort: [
      ['Capability data collection', 1],
      ['Option comparison', 1.5],
      ['Fit against the partition', 0.75],
      ['Selection and record', 0.75],
    ],
    entry: [
      'Stack topology chosen in PART-01',
      'Bandwidth and bump budget drafted in PART-02',
      'Foundry and OSAT bonding options available under NDA',
    ],
    exit: [
      'One bonding scheme selected, with the pitch the design may assume',
      'Rejected options recorded with the reason for each',
      'Foundry and OSAT ownership of the bond step agreed',
    ],
    dependsOn: ['PART-01', 'PART-02', 'TECH-09'],
    dependsNote: null,
    feedsInto: ['BOND-02', 'BOND-03', 'D2D-01'],
    measuredBy: [
      'Weeks from partition decision to bonding scheme selection',
      'Assumed pitch against the pitch demonstrated on the line',
      'Scheme changes after the bump map started',
    ],
    links: {
      dependsOn: ['PART-01', 'PART-02', 'TECH-09'],
      feedsInto: ['BOND-02', 'BOND-03', 'BOND-04', 'D2D-01'],
      runsWith: ['PART-04'],
      revisedBy: [],
      feedsBackInto: ['PART-05'],
    },
    terms: ['HB', 'TCB', 'W2W', 'D2W', 'KGD', 'OSAT', 'TSV'],
  },
  'BOND-02': {
    criticalPath: true,
    purpose: [
      'Turn the foundry’s TSV and backside process into <b>rules the floorplan can be held to</b>: TSV diameter, pitch and keep-out, backside redistribution and pad rules, and the points where the process hands over between foundry and OSAT.',
      'A TSV is not a via. It displaces devices around it, it stresses the silicon it passes through and it needs a backside process after thinning. If the keep-out arrives after the floorplan is frozen, the floorplan is redone, which is why these rules have to be in hand while 3D integration is still placing TSV fields.',
    ],
    flowNote:
      'Step 1 receives the rules and step 2 immediately tests the keep-out against the floorplan the partition assumed, because that is where a surprise costs most. Step 3 sets the backside RDL and pad rules alongside, and step 4 closes on the split points with the foundry, which takes longest because it is a negotiation as much as a specification.',
    consumes: [
      'Bonding scheme selection from BOND-01',
      'Foundry process options from TECH-05',
      'Partition floorplan assumptions from PART-05',
      'Chip-level floorplan and bump planning from ARCH-08',
      'Design rule disposition practice from PDK-02',
    ],
    rel: {
      'BOND-D2':
        '<b>TSV and backside process rule set.</b> The rule set is compiled, checked against the floorplan and agreed with the foundry here.',
      'BOND-D6':
        '<b>3D design rule deck, released.</b> Every TSV and backside rule agreed here has to become a check in the deck BOND-06 releases.',
    },
    risks: [
      '<b>TSV keep-out larger than the floorplan assumed.</b> Standard cells and macros near each TSV field move, and the area budget of the die grows.',
      '<b>Keep-out rules arriving after floorplan freeze.</b> The TSV fields are placed in 3DI-01, and a late rule means placing them twice.',
      '<b>Backside rules owned by nobody.</b> The foundry thinks the OSAT owns the backside redistribution; the OSAT thinks the foundry does.',
      '<b>Split points left informal.</b> A wafer that changes hands without an agreed specification becomes a dispute at the first excursion.',
      '<b>TSV stress effects on devices ignored.</b> Mobility shifts near a TSV change timing, and nobody characterizes them unless the rules say they must be.',
    ],
    roles: [
      { r: 'Process integration engineer', d: 'Owns the rule set and the split points' },
      { r: 'Physical design lead', d: 'Checks the keep-outs against the floorplan' },
      { r: 'Foundry integration lead', d: 'TSV and backside process definition' },
      { r: 'OSAT liaison', d: 'Backside and bonding handover requirements' },
      { r: 'Packaging technologist', d: 'Approves the rule set for design use' },
    ],
    effort: [
      ['Rule intake and review', 1.5],
      ['Keep-out impact on the floorplan', 2],
      ['Backside RDL and pad rules', 1.5],
      ['Split point agreement', 2],
    ],
    entry: [
      'Bonding scheme selected in BOND-01',
      'Foundry TSV and backside rules released under NDA',
      'Partition floorplan assumptions available',
    ],
    exit: [
      'TSV keep-out checked against the floorplan and its area impact stated',
      'Backside RDL and pad rules issued',
      'Foundry and OSAT split points agreed in writing',
    ],
    dependsOn: ['BOND-01', 'TECH-05', 'PART-05'],
    dependsNote: null,
    feedsInto: ['BOND-06', '3DI-01'],
    measuredBy: [
      'Keep-out area against the floorplan assumption',
      'Rule changes after 3D floorplan start',
      'Open split-point items at rule set release',
    ],
    links: {
      dependsOn: ['BOND-01', 'TECH-05', 'PART-05'],
      feedsInto: ['BOND-06', '3DI-01', 'BOND-04'],
      runsWith: ['BOND-03'],
      revisedBy: ['PDK-02'],
      feedsBackInto: [],
    },
    terms: ['TSV', 'KOZ', 'RDL', 'OSAT'],
  },
  'BOND-03': {
    criticalPath: false,
    purpose: [
      'Establish <b>the bonding pitch and placement accuracy the design may count on</b>, from measured overlay and alignment data rather than from equipment brochures.',
      'Every bump on a die-to-die interface has to land on its partner. The alignment budget decides the pad size, the pitch and how much redundancy the bump map needs, so the capability statement is an input to D2D-04 and to the rule deck rather than a report filed after the fact.',
    ],
    flowNote:
      'Step 1 collects overlay and pitch data from the bonders that will run the product. Step 2 turns it into an alignment budget, and step 3 runs alongside to check that budget against the bump density the map needs. Step 4 is the agreement itself, and it takes the longest because the capability usually has to be demonstrated on the line before it is signed.',
    consumes: [
      'Bonding scheme selection from BOND-01',
      'Inter-die bump count from PART-02',
      'Draft bump density from D2D-04',
      'OSAT assembly process direction from PKGD-08',
      'Bonder and metrology data from the foundry and OSAT',
    ],
    rel: {
      'BOND-D3':
        '<b>Bond pitch and alignment capability statement.</b> The statement is measured, budgeted and agreed with the bonding line here.',
      'BOND-D6':
        '<b>3D design rule deck, released.</b> The pitch and pad rules in the deck come from the capability agreed here.',
    },
    risks: [
      '<b>Capability quoted from a tool specification.</b> A bonder that can align to a micron in a demo does not do it across a wafer, a shift and a lot.',
      '<b>Alignment measured on flat monitor wafers.</b> Thinned and warped product wafers align worse, and the budget has to include that.',
      '<b>Budget set without the bump map.</b> A pitch that suits the average density fails in the densest region of the interface.',
      '<b>Overlay drift not tracked over time.</b> The capability degrades between calibrations, and the statement has to say how often it is re-measured.',
      '<b>No margin left for the redundancy scheme.</b> Repair lanes need bumps too, and a map drawn to the limit has nowhere to put them.',
    ],
    roles: [
      { r: 'Assembly process engineer', d: 'Owns the capability data and the statement' },
      { r: 'Package and bump engineer', d: 'Holds the budget to the bump map density' },
      { r: 'Metrology engineer', d: 'Overlay and alignment measurement' },
      { r: 'OSAT liaison', d: 'Line demonstration on the production bonders' },
      { r: 'Packaging technologist', d: 'Approves the capability the design may assume' },
    ],
    effort: [
      ['Capability data collection', 1.5],
      ['Alignment budget', 1.5],
      ['Density check against the map', 1],
      ['Line demonstration and agreement', 2],
    ],
    entry: [
      'Bonding scheme selected in BOND-01',
      'Target bump count known from PART-02',
      'Production bonders identified at the foundry or OSAT',
    ],
    exit: [
      'Pitch and alignment budget stated from measured data',
      'Budget checked against the densest region of the bump map',
      'Capability agreed with the bonding line owner',
    ],
    dependsOn: ['BOND-01', 'PART-02'],
    dependsNote: null,
    feedsInto: ['D2D-04', 'BOND-06'],
    measuredBy: [
      'Measured alignment against the budget the design assumed',
      'Bump map density margin at the agreed pitch',
      'Capability revisions after the bump map froze',
    ],
    links: {
      dependsOn: ['BOND-01', 'PART-02', 'PKGD-08'],
      feedsInto: ['D2D-04', 'BOND-06', 'DCTV-02'],
      runsWith: ['BOND-02'],
      revisedBy: ['D2D-04'],
      feedsBackInto: [],
    },
    terms: ['HB', 'TCB', 'OSAT', 'D2D'],
  },
  'BOND-04': {
    criticalPath: false,
    purpose: [
      'Define <b>how the wafers are thinned, carried and debonded</b> without breaking them or losing the flatness that bonding depends on.',
      'A wafer thinned to reveal its TSVs is fragile, bowed and bonded to a temporary carrier that has to come off cleanly. The thinning target, the carrier adhesive and the debond step all spend part of the thermal budget and all affect yield, so the flow is defined and qualified before any product wafer reaches it.',
    ],
    flowNote:
      'Step 1 sets the target thickness and the carrier flow from the TSV depth. Step 2 assesses what can go wrong at that thickness, and step 3 runs alongside to set the bow and warpage limits the handling equipment can accept. Step 4 qualifies debond and clean on monitor wafers, which is the longest step because it is the only one that produces evidence rather than a plan.',
    consumes: [
      'TSV depth and backside rules from BOND-02',
      'Bonding scheme selection from BOND-01',
      'Thermal and warpage predictions from PKGD-06',
      'OSAT handling capability from PKGD-08',
      'Carrier and adhesive options from the foundry and OSAT',
    ],
    rel: {
      'BOND-D4':
        '<b>Thinning and handling flow definition.</b> The flow is defined, its limits are set and its debond step is qualified here.',
      'BOND-D5':
        '<b>Bond reliability and thermal budget plan.</b> Carrier bonding and debond temperatures are part of the thermal budget BOND-05 has to allocate.',
    },
    risks: [
      '<b>Flow qualified on monitor wafers only.</b> Patterned product wafers with TSVs bow differently, and the first product lot finds the difference.',
      '<b>Carrier adhesive temperature below a later process step.</b> The adhesive softens or outgasses, and the thinned wafer shifts on its carrier.',
      '<b>Bow limit set by the thinning tool rather than the bonder.</b> A wafer that survives thinning can still be too warped to align.',
      '<b>Edge chipping not inspected.</b> Cracks that start at the wafer edge propagate during debond and take whole wafers.',
      '<b>Handling between sites not planned.</b> Thinned wafers shipped on carriers need their own containers, limits and incoming inspection.',
    ],
    roles: [
      { r: 'Wafer process engineer', d: 'Owns the thinning and carrier flow' },
      { r: 'Process integration engineer', d: 'Aligns the flow with the TSV reveal' },
      { r: 'Package mechanical engineer', d: 'Bow and warpage limits' },
      { r: 'OSAT liaison', d: 'Handling and shipping between sites' },
      { r: 'Packaging technologist', d: 'Approves the flow for product use' },
    ],
    effort: [
      ['Thinning target and carrier flow', 1.5],
      ['Handling risk assessment', 1],
      ['Bow and warpage limits', 1],
      ['Debond and clean qualification', 2.5],
    ],
    entry: [
      'TSV depth and reveal process known from BOND-02',
      'Carrier and adhesive candidates identified',
      'Monitor wafers available for qualification',
    ],
    exit: [
      'Target thickness, carrier and adhesive fixed',
      'Bow and warpage limits agreed with the bonding line',
      'Debond and clean qualified with breakage rate recorded',
    ],
    dependsOn: ['BOND-02', 'BOND-01'],
    dependsNote: null,
    feedsInto: ['BOND-05', 'KGD-04'],
    measuredBy: [
      'Wafer breakage rate through debond',
      'Bow at the bonder against the agreed limit',
      'Handling excursions on the first vehicle lots',
    ],
    links: {
      dependsOn: ['BOND-02', 'BOND-01'],
      feedsInto: ['BOND-05', 'KGD-04', 'DCTV-03'],
      runsWith: [],
      revisedBy: ['PKGD-06'],
      feedsBackInto: [],
    },
    terms: ['TSV', 'OSAT', 'CTE'],
  },
  'BOND-05': {
    criticalPath: false,
    purpose: [
      'Set <b>what the bond interface has to survive and how much heat assembly may spend</b> getting there, before the vehicle is built to test it.',
      'The bond interface fails by cracking, voiding and interdiffusion, and each process step after bonding adds thermal exposure that brings those failures closer. A thermal budget that is not allocated explicitly is spent twice—once by the design assuming it, once by the line using it—so the plan divides it between steps.',
    ],
    flowNote:
      'Step 1 states the reliability requirements from the product mission profile. Step 2 plans the stress matrix that will prove them, and step 3 runs alongside to allocate the thermal budget across bonding, anneal, underfill and reflow. Step 4 reviews both with the foundry and OSAT, because each of them spends part of that budget.',
    consumes: [
      'Bonding scheme selection from BOND-01',
      'Carrier and debond temperatures from BOND-04',
      'Stack thermal and power budget from PART-03',
      'Qualification strategy and mission profile from MP-01',
      'Chip-package interaction risk from PTV-08',
    ],
    rel: {
      'BOND-D5':
        '<b>Bond reliability and thermal budget plan.</b> The requirements, the stress matrix and the thermal budget allocation are written and agreed here.',
    },
    risks: [
      '<b>Thermal budget spent twice.</b> Design assumes an anneal the line never planned for, or the line adds a reflow the budget never had.',
      '<b>Stress matrix copied from a 2.5D package.</b> A hybrid bond interface fails differently from a solder joint and needs its own conditions.',
      '<b>Temperature cycling planned without preconditioning.</b> Moisture soak and reflow are what open a marginal bond, and skipping them flatters the result.',
      '<b>No readout plan by bond level.</b> A failed stack that cannot be traced to a bond level teaches nothing about the process.',
      '<b>Plan agreed after the vehicle is designed.</b> The vehicle has to carry the structures the stress matrix needs, which is why the plan comes first.',
    ],
    roles: [
      { r: 'Reliability engineer', d: 'Owns the requirements and the stress matrix' },
      { r: 'Packaging technologist', d: 'Thermal budget allocation across the flow' },
      { r: 'Foundry integration lead', d: 'Bonding and anneal thermal exposure' },
      { r: 'OSAT liaison', d: 'Underfill and reflow thermal exposure' },
      { r: 'Quality manager', d: 'Approves the reliability plan' },
    ],
    effort: [
      ['Reliability requirements', 1],
      ['Stress matrix plan', 2],
      ['Thermal budget allocation', 1.5],
      ['Foundry and OSAT review', 1.5],
    ],
    entry: [
      'Bonding scheme and thinning flow defined',
      'Product mission profile available',
      'Process steps after bonding listed with their temperatures',
    ],
    exit: [
      'Reliability requirements and stress matrix agreed',
      'Thermal budget allocated to each process step with an owner',
      'Structures the vehicle must carry passed to the DCTV scope',
    ],
    dependsOn: ['BOND-01', 'BOND-04', 'PART-03'],
    dependsNote: null,
    feedsInto: ['DCTV-01', 'DCTV-06'],
    measuredBy: [
      'Thermal budget allocated against the total available',
      'Stress conditions covered by the vehicle plan',
      'Budget overruns found during vehicle assembly',
    ],
    links: {
      dependsOn: ['BOND-01', 'BOND-04', 'PART-03'],
      feedsInto: ['DCTV-01', 'DCTV-06', '3DI-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['HB', 'TCT', 'CTE', 'DCTV', 'OSAT', 'JEDEC'],
  },
  'BOND-06': {
    criticalPath: true,
    purpose: [
      'Assemble and release <b>the 3D design rule deck</b>: the TSV, backside, bond pitch and assembly rules turned into checks the design teams run on every database.',
      'Rules that live in a document are applied by whoever remembers them. The deck is what makes the bonding process enforceable in the stack floorplan and in multi-die signoff, and it has to be released before 3D integration draws the database it will be checked against.',
    ],
    flowNote:
      'Step 1 codes the process rules from BOND-02 and BOND-03 into the deck. Step 2 adds the assembly and bonding checks that span both dies, and step 3 runs alongside, exercising the deck on the partition floorplan so false errors are found before designers see them. Step 4 releases the deck with its version control and waiver process.',
    consumes: [
      'TSV and backside process rule set from BOND-02',
      'Bond pitch and alignment capability from BOND-03',
      'Partition floorplan from PART-05',
      'Signoff deck version control from PDK-04',
      'Design rule disposition practice from PDK-02',
    ],
    rel: {
      'BOND-D6':
        '<b>3D design rule deck, released.</b> The deck is built, validated on a real floorplan and released to the design teams here.',
    },
    risks: [
      '<b>Deck released late to the design teams.</b> The 3D floorplan is drawn without it and every violation is found at signoff.',
      '<b>Cross-die checks missing.</b> A single-die deck cannot see a bump that is misaligned with its partner on the other die.',
      '<b>Deck never run on a real database.</b> False errors flood the first design run and teams learn to ignore the deck.',
      '<b>No version control against the process rules.</b> A rule change at the foundry does not reach the deck, and signoff runs against yesterday’s process.',
      '<b>Waiver process undefined.</b> Designers waive violations informally and the assembly line inherits the risk.',
    ],
    roles: [
      { r: 'DFM engineer', d: 'Owns the deck and its release' },
      { r: 'Process integration engineer', d: 'TSV and backside rule intent' },
      { r: 'Physical design lead', d: 'Runs the deck on the floorplan and reports false errors' },
      { r: 'Signoff lead', d: 'Integrates the deck into multi-die signoff' },
      { r: 'Packaging technologist', d: 'Approves the deck for release' },
    ],
    effort: [
      ['Process rule coding', 1.5],
      ['Assembly and cross-die checks', 1.25],
      ['Deck validation on the floorplan', 1.25],
      ['Release and version control', 1],
    ],
    entry: [
      'TSV and backside rule set agreed in BOND-02',
      'Bond pitch capability agreed in BOND-03',
      'Partition floorplan available for deck validation',
    ],
    exit: [
      'Deck released under version control with a change log',
      'Cross-die and assembly checks included and validated',
      'False error rate on the partition floorplan resolved',
    ],
    dependsOn: ['BOND-02', 'BOND-03', 'PART-05'],
    dependsNote: null,
    feedsInto: ['3DI-01', '3DI-06', 'DCTV-02'],
    measuredBy: [
      'Weeks between deck release and 3D floorplan start',
      'False errors per run on the validation floorplan',
      'Deck revisions after release',
    ],
    links: {
      dependsOn: ['BOND-02', 'BOND-03', 'PART-05', 'PDK-04'],
      feedsInto: ['3DI-01', '3DI-06', 'DCTV-02'],
      runsWith: [],
      revisedBy: ['DCTV-07'],
      feedsBackInto: [],
    },
    terms: ['DRC', 'DFM', 'TSV', 'RDL', 'PDK'],
  },
};
