import type { ActivityWriteUp } from '../activityDetailTypes';

/** 3D architecture and chiplet partitioning — PART-01 to PART-05. */
export const PART_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'PART-01': {
    criticalPath: true,
    purpose: [
      'Decide <b>how many dies the product is, and how they are stacked</b>—which blocks sit on which die, whether the stack is face-to-face or face-to-back, and whether memory or logic sits nearest the heat sink.',
      'It is the one choice a 3DIC program cannot revisit cheaply. The interface, the bonding pitch, the thermal ceiling, the yield model and the test access all follow from it, so it is made first, on system models rather than on a floorplan, and it is written down with the options it was chosen over.',
    ],
    flowNote:
      'Step 1 draws the candidate splits, and steps 2 and 3 run side by side on the same candidates: bandwidth and latency on one lane, cost on the other, because a split that is cheap and starves the link is no answer. Step 4 screens what survives for heat before step 5 chooses, so the decision record names a split that is affordable, fast enough and coolable at once.',
    consumes: [
      'Workload definition and KPI targets from DEF-03',
      'PPA targets from DEF-05',
      'System-level performance models from ARCH-01',
      'Candidate process nodes and wafer cost from TECH-06',
      'Bonding options the foundry and OSAT can offer today',
    ],
    rel: {
      'PART-D1':
        '<b>Stack topology decision record.</b> The record is written here, with the splits that were rejected and the reason each one lost.',
      'PART-D5':
        '<b>Partition freeze package with the inter-die interface contract.</b> The freeze packages this topology; nothing in the contract can be written until the dies it connects are named.',
    },
    risks: [
      '<b>Split chosen on die cost alone.</b> The cheapest partition often crosses the hottest traffic or stacks two hot dies, and the cost is paid later in the link and the cooling.',
      '<b>Topology decided before the bonding options are known.</b> A face-to-face stack at a pitch the line cannot bond is a decision that has to be taken again.',
      '<b>Memory placement treated as a detail.</b> Whether memory sits above or below logic sets the thermal path and the TSV count, and it belongs in this record.',
      '<b>Rejected options not written down.</b> Without them the question is reopened every time a downstream team meets a constraint.',
      '<b>Too many candidates carried to the end.</b> Modelling six splits in depth leaves none modelled well; the screen has to cut early.',
    ],
    roles: [
      { r: 'Chief architect', d: 'Owns the candidate splits and the decision' },
      { r: 'System architect', d: 'Bandwidth and latency modelling per split' },
      { r: 'Thermal architect', d: 'Thermal feasibility screen' },
      { r: 'Package architect', d: 'Bonding and assembly realism for each topology' },
      { r: 'Program director', d: 'Approves the topology and its cost' },
    ],
    effort: [
      ['Candidate splits', 1],
      ['Bandwidth and latency modelling', 1.5],
      ['Cost modelling', 1],
      ['Thermal screen', 1],
      ['Decision and record', 1.5],
    ],
    entry: [
      'Workloads and KPI targets agreed in DEF-03',
      'System performance models running in ARCH-01',
      'At least two bonding options available to model against',
    ],
    exit: [
      'One topology chosen, with the dies and their contents named',
      'Rejected splits recorded with the reason each lost',
      'Thermal feasibility screened before the choice, not after',
    ],
    dependsOn: ['DEF-03', 'DEF-05', 'ARCH-01'],
    dependsNote: null,
    feedsInto: ['PART-02', 'PART-03', 'PART-04', 'PART-05', 'BOND-01'],
    measuredBy: [
      'Topology changes after the decision record is signed',
      'Candidate splits screened against those modelled in depth',
      'Downstream constraints traced to a recorded trade-off',
    ],
    links: {
      dependsOn: ['DEF-03', 'DEF-05', 'ARCH-01', 'TECH-06'],
      feedsInto: ['PART-02', 'PART-03', 'PART-04', 'PART-05', 'BOND-01', 'ARCH-02'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['3DIC', 'F2F', 'F2B', 'TSV', 'PPA'],
  },

  'PART-02': {
    criticalPath: false,
    purpose: [
      'Turn the chosen split into <b>a bandwidth, latency and power budget for every die-to-die link</b>, so the interface is selected against a number rather than a preference.',
      'The partition moved traffic that used to stay on one die onto a link between two. How much traffic, how bursty and how latency-sensitive decides whether the stack needs a UCIe-class parallel link, a simpler BoW-style one, or more bumps than the bonding pitch allows—and this activity is where that is found out.',
    ],
    flowNote:
      'Step 1 derives the traffic from the workload models, and step 2 turns it into a per-link budget. Step 3 runs alongside, pricing the power of that bandwidth, because a budget nobody can afford to power is not a budget. Step 4 reconciles the result with the bump count the floorplan can hold, which is where most first budgets turn out to be too generous.',
    consumes: [
      'Stack topology from PART-01',
      'Workload traces and performance models from ARCH-01',
      'Dataflow and memory hierarchy from ARCH-04',
      'Candidate interface options and their shoreline density',
      'Early floorplan-level bump pitch assumption from ARCH-08',
    ],
    rel: {
      'PART-D2':
        '<b>Die-to-die bandwidth and power budget.</b> The budget is set and reconciled here, per link and per direction.',
      'PART-D5':
        '<b>Partition freeze package with the inter-die interface contract.</b> The interface contract quotes this budget as the requirement each die has to meet.',
    },
    risks: [
      '<b>Budget set on average traffic.</b> The link is sized by its bursts and its tail latency, not by the mean the workload model reports.',
      '<b>Power left out of the budget.</b> A link that meets bandwidth at a power the thermal budget cannot absorb moves the problem into PART-03.',
      '<b>Bump count not reconciled.</b> A budget that needs more signal bumps than the shoreline holds is discovered at the bump map, when it is expensive.',
      '<b>Coherency ignored.</b> Cache-coherent traffic across the split has latency needs a plain streaming link will not meet.',
      '<b>No margin for the second workload.</b> A budget fitted exactly to today’s benchmark leaves nothing for the one the customer adds next year.',
    ],
    roles: [
      { r: 'System architect', d: 'Owns the traffic model and the budget' },
      { r: 'Interface architect', d: 'Maps the budget onto candidate interfaces' },
      { r: 'Performance modelling engineer', d: 'Workload traces and burst analysis' },
      { r: 'Physical design lead', d: 'Bump count and shoreline reality' },
      { r: 'Chief architect', d: 'Approves the budget' },
    ],
    effort: [
      ['Traffic derivation', 1.5],
      ['Per-link budget', 1.5],
      ['Interface power estimate', 1],
      ['Bump count reconciliation', 1],
    ],
    entry: [
      'Topology chosen in PART-01',
      'Workload models producing traces across the split',
      'A floorplan-level bump pitch assumption available',
    ],
    exit: [
      'A bandwidth, latency and power figure for every link and direction',
      'Budget reconciled with the bump count the floorplan can hold',
      'Headroom stated, not implied',
    ],
    dependsOn: ['PART-01', 'ARCH-01', 'ARCH-04'],
    dependsNote: null,
    feedsInto: ['PART-05', 'D2D-01', 'PART-03'],
    measuredBy: [
      'Measured link utilization against the budget at bring-up',
      'Budget revisions after the interface is selected',
      'Bump count needed against bump count reserved',
    ],
    links: {
      dependsOn: ['PART-01', 'ARCH-01', 'ARCH-04', 'ARCH-08'],
      feedsInto: ['PART-05', 'D2D-01', 'D2D-04'],
      runsWith: ['PART-03'],
      revisedBy: [],
      feedsBackInto: ['PART-03'],
    },
    terms: ['D2D', 'UCIe', 'BoW', 'PHY'],
  },

  'PART-03': {
    criticalPath: true,
    purpose: [
      'Find out <b>whether the stack can be cooled</b>, and set the power each die may burn, before a floorplan fixes where the heat is.',
      'Stacking puts one die’s heat through another. A hotspot on the bottom die now has to cross a bond layer and a second die to reach the heat sink, and the die in between inherits a temperature it did not generate. The per-die power ceiling written here is the thermal contract every later analysis is checked against.',
    ],
    flowNote:
      'Step 1 builds the thermal model from the chosen topology, and step 2 places each die’s power map in it. Step 3 runs alongside to find the hotspots the stacking creates—usually where two dies’ hot blocks overlap. Step 4 sets the ceiling and the cooling assumption; it takes longest because the system team has to agree the cooling it implies.',
    consumes: [
      'Stack topology from PART-01',
      'Power, clock and DVFS architecture from ARCH-06',
      'Block power estimates from ARCH-09',
      'Package architecture and heat path from PKGD-01',
      'Die-to-die interface power from PART-02',
    ],
    rel: {
      'PART-D3':
        '<b>Stack thermal and power budget.</b> The per-die power ceiling and the cooling assumption behind it are set here.',
      'PART-D5':
        '<b>Partition freeze package with the inter-die interface contract.</b> The freeze carries the power ceiling each die owner signs up to.',
    },
    risks: [
      '<b>Dies modelled one at a time.</b> Each die is fine alone; the problem only exists when one heats the other through the bond.',
      '<b>Bond layer thermal resistance assumed ideal.</b> Hybrid bond and micro-bump layers conduct very differently, and the difference sets the lower die’s temperature.',
      '<b>Cooling assumption never agreed.</b> A ceiling computed for a cold plate the system does not have is a number nobody holds.',
      '<b>Hotspot overlap found after floorplan.</b> Moving a hot block off another die’s hot block is free now and a re-floorplan later.',
      '<b>Memory temperature limits missed.</b> A memory die stacked over logic has a lower limit than the logic, and it sets the budget.',
    ],
    roles: [
      { r: 'Thermal architect', d: 'Owns the stack thermal model and the ceiling' },
      { r: 'Chief architect', d: 'Block placement across the dies' },
      { r: 'Power architect', d: 'Per-die power maps and DVFS states' },
      { r: 'Package thermal engineer', d: 'Bond layer and heat path properties' },
      { r: 'System architect', d: 'Approves the cooling assumption' },
    ],
    effort: [
      ['Thermal model build', 1.5],
      ['Power map placement', 1],
      ['Hotspot analysis', 1],
      ['Ceiling and cooling agreement', 1.5],
    ],
    entry: [
      'Topology chosen in PART-01',
      'Block-level power estimates available',
      'Package heat path direction known from PKGD-01',
    ],
    exit: [
      'Power ceiling set per die, per operating mode',
      'Cooling assumption agreed with the system team',
      'Overlapping hotspots resolved or recorded as constraints on the floorplan',
    ],
    dependsOn: ['PART-01', 'ARCH-06', 'ARCH-09'],
    dependsNote: null,
    feedsInto: ['PART-05', '3DI-04'],
    measuredBy: [
      'Junction temperature at the design point against the ceiling',
      'Thermal limits found after this budget was set',
      'Correlation of the model to the stack thermal simulation',
    ],
    links: {
      dependsOn: ['PART-01', 'ARCH-06', 'ARCH-09', 'PKGD-01'],
      feedsInto: ['PART-05', '3DI-04', 'PKGD-06'],
      runsWith: ['PART-02'],
      revisedBy: ['PART-02'],
      feedsBackInto: [],
    },
    terms: ['3DIC', 'HB', 'DVFS', 'TIM'],
  },

  'PART-04': {
    criticalPath: false,
    purpose: [
      'Work out <b>what the stack yields and what it costs to keep bad dies out of it</b>, so the partition is priced on assembled units rather than on wafers.',
      'A stack’s yield is the product of every die’s yield and every bond’s. One bad die scraps the good ones bonded to it, which makes sort coverage, repair and the choice between wafer-to-wafer and die-to-wafer bonding economic questions before they are engineering ones.',
    ],
    flowNote:
      'Step 1 models compound yield across the dies and bonds, and step 2 prices stacking a bad die against sorting for it. Step 3 runs alongside to draft the KGD criteria the price implies. Step 4 takes longest: agreeing a repair and redundancy budget means design gives up area for spare lanes, and that has to be argued rather than assumed.',
    consumes: [
      'Stack topology from PART-01',
      'Product cost and margin model from DEF-06',
      'Wafer, mask and NRE cost from TECH-06',
      'Defect density and yield learning curve for the node',
      'Bonding yield data from the foundry and OSAT',
    ],
    rel: {
      'PART-D4':
        '<b>Stack yield and KGD economics.</b> The compound yield model and the cost of sorting against stacking are produced here.',
      'PART-D5':
        '<b>Partition freeze package with the inter-die interface contract.</b> The freeze commits to the repair budget and KGD criteria priced here.',
    },
    risks: [
      '<b>Yield multiplied without the bond.</b> A model of die yields alone misses the bonding loss, which on hybrid bonding can dominate.',
      '<b>A KGD screen assumed that nobody has built.</b> Criteria that need tests wafer sort cannot run are economics on paper.',
      '<b>Wafer-to-wafer chosen for throughput alone.</b> W2W stacks bad dies regardless, and at low die yield it is the expensive option.',
      '<b>Repair budget left to design later.</b> Spare lanes and bumps have to be in the bump map, and the bump map freezes soon.',
      '<b>Yield taken at maturity.</b> The first year’s units are built on the early yield curve, and the margin model has to survive them.',
    ],
    roles: [
      { r: 'Product engineering', d: 'Owns the yield model and the economics' },
      { r: 'Yield engineer', d: 'Defect density and bonding loss inputs' },
      { r: 'Test architect', d: 'What sort can actually screen' },
      { r: 'Finance partner', d: 'Unit cost and margin impact' },
      { r: 'Chief architect', d: 'Approves the repair budget' },
    ],
    effort: [
      ['Compound yield model', 1],
      ['Sort versus stack pricing', 1],
      ['KGD criteria draft', 1],
      ['Repair budget agreement', 1],
    ],
    entry: [
      'Topology chosen in PART-01',
      'Node defect density and wafer cost available',
      'Bonding yield assumption from the foundry or OSAT',
    ],
    exit: [
      'Compound yield modelled across dies and bonds, early and mature',
      'Bonding approach priced — wafer-to-wafer against die-to-wafer',
      'Repair and redundancy budget agreed with design',
    ],
    dependsOn: ['PART-01', 'DEF-06', 'TECH-06'],
    dependsNote: null,
    feedsInto: ['PART-05', 'KGD-01', 'D2D-04'],
    measuredBy: [
      'Assembled stack yield against the model',
      'Unit cost at ramp against the margin model',
      'Repair lanes used against lanes budgeted',
    ],
    links: {
      dependsOn: ['PART-01', 'DEF-06', 'TECH-06'],
      feedsInto: ['PART-05', 'KGD-01', 'D2D-04', 'BOND-01'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['KGD', 'W2W', 'D2W', 'NRE'],
  },

  'PART-05': {
    criticalPath: true,
    purpose: [
      'Freeze <b>the partition and the contract between the dies</b>, and release both to the teams that will design to them.',
      'Until this point each die owner can move a block across the split. After it, the die list, the signals and power that cross each boundary, the budgets and the ownership of the interface are fixed in writing, and a change goes through change control. RTL and physical design start from this package, not from the architecture slides.',
    ],
    flowNote:
      'Step 1 freezes the partition and names the dies. Step 2 writes the contract—every crossing signal, budget and ownership line—and is the longest step because it is the first time the boundary is written exactly. Step 3 runs alongside to get each die owner’s agreement while the contract is still being drafted, so step 4 releases a document nobody is surprised by.',
    consumes: [
      'Stack topology decision record from PART-01',
      'Die-to-die bandwidth and power budget from PART-02',
      'Stack thermal and power budget from PART-03',
      'Stack yield and KGD economics from PART-04',
      'System architecture partitioning from ARCH-02',
    ],
    rel: {
      'PART-D5':
        '<b>Partition freeze package with the inter-die interface contract.</b> The package is assembled, agreed and released here, and it is what the partition freeze milestone signs.',
    },
    risks: [
      '<b>Contract agreed verbally.</b> A boundary that exists only in meetings moves every time a die owner meets a constraint.',
      '<b>Freeze declared with open budgets.</b> A contract with a to-be-determined power or latency figure is not frozen, and the RTL built on it will be redone.',
      '<b>Test and repair left out of the contract.</b> The wrapper, spare lanes and access ports cross the boundary too, and omitting them costs bumps later.',
      '<b>No change control behind the freeze.</b> Without a path for changes, the freeze is either ignored or blocks a necessary fix.',
      '<b>Released to RTL but not to physical design.</b> The bump map and TSV fields start from the same contract, and a late release there costs the most.',
    ],
    roles: [
      { r: 'Chief architect', d: 'Owns the freeze and the contract' },
      { r: 'Die owners', d: 'Agree the boundary their die designs to' },
      { r: 'Interface architect', d: 'Crossing signals, protocol and ownership' },
      { r: 'DFT architect', d: 'Test access and repair across the boundary' },
      { r: 'Program director', d: 'Approves the freeze' },
    ],
    effort: [
      ['Partition freeze', 1],
      ['Interface contract', 2],
      ['Die owner agreement', 1],
      ['Release and change control', 1],
    ],
    entry: [
      'Topology, bandwidth, thermal and yield budgets from PART-01 through PART-04',
      'System architecture partitioning available from ARCH-02',
      'Each die has a named owner',
    ],
    exit: [
      'Die list frozen, with contents and owners',
      'Interface contract signed by every die owner, with no open budgets',
      'Change control in place before release to RTL and physical design',
    ],
    dependsOn: ['PART-01', 'PART-02', 'PART-03', 'PART-04', 'ARCH-02'],
    dependsNote:
      'The freeze is the convergence point of the stage — it consumes every other PART activity and cannot close before the slowest of them.',
    feedsInto: ['D2D-01', 'D2D-04', '3DI-01', 'RTL-01', 'ARCH-07'],
    measuredBy: [
      'Contract changes after freeze, and their cause',
      'Weeks from freeze to RTL and floorplan start',
      'Open items at freeze',
    ],
    links: {
      dependsOn: ['PART-01', 'PART-02', 'PART-03', 'PART-04', 'ARCH-02'],
      feedsInto: ['D2D-01', 'D2D-04', 'D2D-05', '3DI-01', 'RTL-01', 'ARCH-07', 'PD-02'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['D2D', 'RTL', 'DFT', 'TSV'],
  },
};
