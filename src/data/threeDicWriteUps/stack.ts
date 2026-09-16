import type { ActivityWriteUp } from '../activityDetailTypes';

/** 3D Stack Integration & Signoff — close the stack as one part, not two good dies. */
export const STACK_WRITE_UPS: Record<string, ActivityWriteUp> = {
  '3DI-01': {
    criticalPath: true,
    purpose: [
      'Draw <b>one floorplan for the stack</b>—TSV fields, bump fields and keep-outs placed so that what lands on one die meets what leaves the other—before either die’s floorplan is closed on its own.',
      'Each die team can close a floorplan that is correct for its own die and wrong for the stack. A TSV field under a macro, a bump that misses its partner by a pitch, a keep-out nobody reserved: none of them shows up in a single-die check, and all of them are found at assembly DRC if they are not found here.',
    ],
    flowNote:
      'Step 1 places the TSV fields against each die’s floorplan while step 3 reserves the keep-outs the bonding process requires alongside it, because a TSV field and its KOZ are one decision. Step 2 aligns the bump map across the dies on top of that placement, and step 4 is long on purpose: every die owner has to accept the result, and a floorplan one owner has not seen is not frozen.',
    consumes: [
      'Frozen partition and die list from PART-05',
      'Frozen inter-die bump map from D2D-04',
      'TSV keep-out and backside rules from BOND-02',
      '3D design rule deck from BOND-06',
      'Each die’s floorplan and macro placement from PD-02',
    ],
    rel: {
      '3DI-D1':
        '<b>3D floorplan with aligned bump and TSV fields.</b> The floorplan is produced and reviewed here, and it is the reference every other stack analysis is run against.',
      '3DI-D2':
        '<b>Stack power delivery and IR report.</b> The power TSV fields placed here are the ones the stacked PDN model is built through.',
    },
    risks: [
      '<b>TSV fields placed after macros are fixed.</b> The field then goes where there is room rather than where power and signals need it, and IR and routing pay for it.',
      '<b>Keep-outs sized from a generic rule.</b> The KOZ has to come from the stress data of the selected bonding process, or devices near the TSVs shift in ways no library models.',
      '<b>Bump alignment checked in one orientation.</b> A F2B stack mirrors one die against the other, and a map that looks aligned in the drawing can be mirrored wrong in the bond.',
      '<b>A die owner skipped at review.</b> The owner who did not sign discovers the constraint during their own closure and reopens the floorplan for everyone.',
      '<b>Floorplan frozen before the bump map is.</b> If D2D-04 is still moving, the alignment done here is alignment to a map that will change.',
    ],
    roles: [
      { r: 'Physical design lead', d: 'Owns the stack floorplan and its alignment' },
      { r: 'Die physical design owners', d: 'Accept the TSV fields and keep-outs on their die' },
      { r: 'Package and bump engineer', d: 'Bump map and pitch constraints across the bond' },
      { r: 'Process integration engineer', d: 'Keep-out and TSV placement rules from the process' },
      { r: 'Chief architect', d: 'Approves the stack floorplan against the partition' },
    ],
    effort: [
      ['TSV field placement', 2.5],
      ['Cross-die bump alignment', 2],
      ['Keep-out reservation', 1.5],
      ['Die owner reviews and iteration', 3],
    ],
    entry: [
      'Partition and die list frozen in PART-05',
      'Inter-die bump map frozen or near freeze in D2D-04',
      'TSV keep-out rules available from BOND-02',
    ],
    exit: [
      'Every TSV field and its keep-out placed on every die',
      'Bump alignment verified across the bond in the real stacking orientation',
      'Every die owner has accepted the floorplan',
    ],
    dependsOn: ['PART-05', 'D2D-04', 'BOND-02', 'PD-02'],
    dependsNote: null,
    feedsInto: ['3DI-02', '3DI-03', '3DI-04', '3DI-05'],
    measuredBy: [
      'Bump misalignments found at assembly DRC after freeze',
      'Floorplan reopenings requested by a die owner',
      'Keep-out violations found in 3DI-06',
    ],
    links: {
      dependsOn: ['PART-05', 'D2D-04', 'BOND-02', 'BOND-06', 'PD-02'],
      feedsInto: ['3DI-02', '3DI-03', '3DI-04', '3DI-05', '3DI-06'],
      runsWith: ['PD-04'],
      revisedBy: ['DCTV-07'],
      feedsBackInto: [],
    },
    terms: ['TSV', 'KOZ', 'F2B', 'PDN', 'IR', 'DRC'],
  },

  '3DI-02': {
    criticalPath: true,
    purpose: [
      'Analyze <b>power delivery through the whole stack</b>—package, bottom die, TSVs, bond and top die—as one network, and size the TSVs and straps so the die furthest from the package still gets its voltage.',
      'A die analyzed alone is analyzed with an ideal supply at its pins. In a stack, the top die’s supply has already crossed the bottom die’s grid and a field of TSVs, and the drop along that path is exactly what single-die IR signoff leaves out.',
    ],
    flowNote:
      'Step 1 builds the stacked model through the TSVs, and step 2 analyzes IR drop across the dies together on it. Step 3 runs alongside step 2 because TSV count and strap width are what the analysis keeps asking to change. Step 4 closes the network against the budget, and it is where the argument between TSV area and IR margin is settled rather than deferred.',
    consumes: [
      '3D floorplan with power TSV fields from 3DI-01',
      'Stack thermal and power budget from PART-03',
      'Each die’s PDN design and early IR from PD-03',
      'TSV resistance and density rules from BOND-02',
      'Package PDN model from PKGD-10',
    ],
    rel: {
      '3DI-D2':
        '<b>Stack power delivery and IR report.</b> The report is produced here, with the TSV count and strap sizing it was closed on.',
      '3DI-D6':
        '<b>3D stack signoff package.</b> Stack IR closure is one of the analyses the signoff package has to contain rather than assume.',
    },
    risks: [
      '<b>TSVs modeled as ideal wires.</b> TSV resistance and the bond interface resistance are small per via and large across a supply current, and ignoring them hides the drop at the top die.',
      '<b>Static IR only.</b> The top die’s switching current flows through the bottom die’s grid, so a dynamic analysis is the one that finds the coupled droop.',
      '<b>Budget split without the other die’s load.</b> A bottom die that closes its IR at its own load fails once the top die’s current is added to its grid.',
      '<b>TSV count fixed for area before analysis.</b> Adding power TSVs after the floorplan is frozen costs a floorplan reopening, not an ECO.',
      '<b>No correlation to the package model.</b> The stack PDN is only as good as the package inductance underneath it, and a model from a previous package undercounts it.',
    ],
    roles: [
      { r: 'Power delivery engineer', d: 'Owns the stacked PDN model and IR closure' },
      { r: 'Die physical design owners', d: 'Grid and strap changes on each die' },
      { r: 'Package power integrity engineer', d: 'Package PDN model under the stack' },
      { r: 'Physical design lead', d: 'TSV field changes against the floorplan' },
      { r: 'Signoff lead', d: 'Approves the IR closure for stack signoff' },
    ],
    effort: [
      ['Stacked PDN model build', 2],
      ['Static and dynamic IR analysis', 2.5],
      ['TSV and strap sizing', 1.5],
      ['Closure and reporting', 2],
    ],
    entry: [
      '3D floorplan with power TSV fields available from 3DI-01',
      'Per-die power maps from the stack budget in PART-03',
      'TSV and bond resistance characterized from BOND-02',
    ],
    exit: [
      'IR drop at every die within budget under static and dynamic analysis',
      'TSV count and strap widths agreed by every die owner',
      'Package PDN model correlated to the one used in analysis',
    ],
    dependsOn: ['3DI-01', 'PART-03', 'PD-03', 'BOND-02'],
    dependsNote: null,
    feedsInto: ['3DI-06', 'SO-05'],
    measuredBy: [
      'Worst-case IR drop at the top die against budget',
      'Power TSVs added after floorplan freeze',
      'IR violations found in signoff that the stack analysis missed',
    ],
    links: {
      dependsOn: ['3DI-01', 'PART-03', 'PD-03', 'BOND-02', 'PKGD-10'],
      feedsInto: ['3DI-06', 'SO-05'],
      runsWith: ['SIPI-05'],
      revisedBy: ['PD-11'],
      feedsBackInto: [],
    },
    terms: ['PDN', 'IR', 'TSV', 'EM/IR'],
  },

  '3DI-03': {
    criticalPath: true,
    purpose: [
      'Close <b>timing on the paths that cross the bond</b>—launched on one die, captured on the other—with a budget both dies agree to and an analysis that sees both at once.',
      'Each die team closes timing against the budget it was given, and if both assume the favorable corner for the other die, both close and the stack does not. Inter-die paths are short in length and long in assumptions: two processes, two PVT spreads and a bond interface between them.',
    ],
    flowNote:
      'Step 1 builds the inter-die timing model and step 2 budgets the die-to-die paths across both dies. Step 3 runs alongside step 2 because the corner analysis is what tells whether the budget is achievable. Step 4 is the longest: closure is iterative, and it ends with a published budget each die signs off against rather than a report nobody reads.',
    consumes: [
      '3D floorplan with aligned bump fields from 3DI-01',
      'Link layer and protocol latency from D2D-03',
      'D2D PHY IP timing models from D2D-02',
      'Die-to-die bandwidth and latency budget from PART-02',
      'Each die’s MCMM timing closure state from PD-06',
    ],
    rel: {
      '3DI-D3':
        '<b>Inter-die timing closure report.</b> The report is produced here, with the budget each die was closed against.',
      '3DI-D6':
        '<b>3D stack signoff package.</b> Inter-die timing is the part of stack signoff that neither die’s own STA can supply.',
    },
    risks: [
      '<b>Each die closed on the other’s best corner.</b> The combined path only fails when both dies are slow together, which is the corner nobody ran.',
      '<b>Bond interface parasitics left out.</b> The bump or hybrid bond adds capacitance and resistance that belong in the extraction, not in a margin guess.',
      '<b>Correlated variation treated as independent.</b> Dies from different wafers do not track each other, and OCV derates built for one die do not describe two.',
      '<b>Budget published once and never revisited.</b> As each die closes, the budget has to move to where the slack actually is, or one die over-closes while the other fails.',
      '<b>Clocking across the bond assumed synchronous.</b> A forwarded or source-synchronous clock has its own skew budget, and it needs its own analysis.',
    ],
    roles: [
      { r: 'Timing lead', d: 'Owns the inter-die timing model and closure' },
      { r: 'Die timing owners', d: 'Close their side of each inter-die path' },
      { r: 'Link architect', d: 'Clocking and latency across the interface' },
      { r: 'Extraction engineer', d: 'Bond interface and TSV parasitics' },
      { r: 'Signoff lead', d: 'Approves the inter-die budget for stack signoff' },
    ],
    effort: [
      ['Inter-die timing model and extraction', 2.5],
      ['Path budgeting across dies', 2],
      ['Stack corner analysis', 2.5],
      ['Closure iterations and budget publication', 3],
    ],
    entry: [
      '3D floorplan and bump alignment available from 3DI-01',
      'Interface timing models delivered with the PHY IP from D2D-02',
      'Each die at a first timing turn in PD-06',
    ],
    exit: [
      'Every inter-die path closed at the combined corners of both dies',
      'Bond interface parasitics included in the extraction',
      'Budget published and accepted by every die timing owner',
    ],
    dependsOn: ['3DI-01', 'D2D-03', 'D2D-02', 'PD-06'],
    dependsNote: null,
    feedsInto: ['3DI-06', 'SO-11'],
    measuredBy: [
      'Worst inter-die slack at combined slow corners',
      'Budget revisions after first publication',
      'Inter-die paths found failing in multi-die signoff STA',
    ],
    links: {
      dependsOn: ['3DI-01', 'D2D-03', 'D2D-02', 'PART-02', 'PD-06'],
      feedsInto: ['3DI-06', 'SO-11'],
      runsWith: ['SO-03'],
      revisedBy: ['PD-11'],
      feedsBackInto: [],
    },
    terms: ['STA', 'PVT', 'OCV', 'MCMM', 'D2D'],
  },

  '3DI-04': {
    criticalPath: false,
    purpose: [
      'Simulate <b>heat through the assembled stack</b> under real workloads, and find the limit each die imposes on the other before the system team designs cooling around a number that is wrong.',
      'In a stack, the die away from the heat sink has to push its heat through the other die, and the hotspot of one sits on top of the circuits of the other. The thermal design point is a property of the stack and its workloads, not of either die’s power number.',
    ],
    flowNote:
      'Step 1 assembles the thermal model of the stack, including the bond layer and TIM. Step 2 runs the workload power maps through it, and step 3 runs alongside to extract the limit each die imposes on the other. Step 4 takes the longest because the design point has to be agreed with the system team, and that negotiation decides package and cooling.',
    consumes: [
      '3D floorplan and hotspot locations from 3DI-01',
      'Stack thermal and power budget from PART-03',
      'Package thermal model from PKGD-06',
      'Chip power models per mode from PD-10',
      'Workload power scenarios from the architecture team',
    ],
    rel: {
      '3DI-D4':
        '<b>Stack thermal simulation report.</b> The report and the thermal design point it supports are produced here.',
      '3DI-D5':
        '<b>Warpage and stress co-analysis report.</b> The temperature fields simulated here are the loads the warpage and stress analysis is run with.',
    },
    risks: [
      '<b>Average power used instead of workload maps.</b> Stack hotspots come from where power lands, and a uniform power density hides the stacked hotspot that sets the limit.',
      '<b>Bond layer thermal resistance guessed.</b> The interface between dies is thin and matters, and its conductivity should come from the process data, not a handbook value.',
      '<b>Die temperature limits taken from single-die specs.</b> Memory or analog on the cooler die may have tighter limits than logic on the hotter one, and that is the limit that binds.',
      '<b>Design point agreed without the system team.</b> A thermal budget the enclosure cannot achieve is a throttling plan, not a design point.',
      '<b>No correlation path planned.</b> The model should be checkable against thermal data from the vehicle or first silicon, or its errors are never found.',
    ],
    roles: [
      { r: 'Thermal engineer', d: 'Owns the stack thermal model and report' },
      { r: 'Package thermal engineer', d: 'Package, TIM and lid model' },
      { r: 'Power architect', d: 'Workload power maps per die' },
      { r: 'System thermal engineer', d: 'Cooling solution and system boundary conditions' },
      { r: 'Chief architect', d: 'Approves the thermal design point' },
    ],
    effort: [
      ['Stack thermal model build', 2],
      ['Workload simulation', 2.5],
      ['Per-die limit extraction', 1.5],
      ['Design point agreement', 2],
    ],
    entry: [
      'Hotspot locations known from the 3D floorplan in 3DI-01',
      'Chip power models available from PD-10',
      'Package thermal model available from PKGD-06',
    ],
    exit: [
      'Junction temperature of every die within limit at the agreed workloads',
      'Thermal design point agreed with the system team',
      'Temperature fields handed to the warpage and stress analysis',
    ],
    dependsOn: ['3DI-01', 'PART-03', 'PKGD-06', 'PD-10'],
    dependsNote: null,
    feedsInto: ['3DI-05', '3DI-06'],
    measuredBy: [
      'Peak junction temperature against limit per die',
      'Model error against measured thermal data',
      'Changes to the cooling solution after the design point was agreed',
    ],
    links: {
      dependsOn: ['3DI-01', 'PART-03', 'PKGD-06', 'PD-10'],
      feedsInto: ['3DI-05', '3DI-06'],
      runsWith: ['SIPI-10'],
      revisedBy: ['DCTV-06'],
      feedsBackInto: [],
    },
    terms: ['TIM', 'CPM', '3DIC'],
  },

  '3DI-05': {
    criticalPath: false,
    purpose: [
      'Analyze <b>warpage and stress on the assembled stack</b> through the reflow profile and in use, and correlate the result to what the daisy chain vehicle actually measured.',
      'A thinned die bonded to another behaves nothing like either die alone. CTE mismatch bends the stack at reflow, loads the bond interface and stresses devices around the TSVs, and the numbers that matter are the ones the assembly line and the bond will see.',
    ],
    flowNote:
      'Steps 1 and 2 model the stack through reflow and analyze stress at the bond interface and the TSVs. Step 3 runs alongside step 2 because the model is only credible once it is checked against the vehicle measurements. Step 4 closes warpage and stress against the assembly process window, which is the window the product is actually built in.',
    consumes: [
      'Temperature fields and design point from 3DI-04',
      'Bond reliability and thermal budget plan from BOND-05',
      'Package warpage simulation from PKGD-06',
      'Continuity and resistance data from DCTV-05',
      'Frozen 3D assembly process window from DCTV-07',
    ],
    rel: {
      '3DI-D5':
        '<b>Warpage and stress co-analysis report.</b> The report is produced here, correlated to the vehicle and closed against the assembly window.',
      '3DI-D6':
        '<b>3D stack signoff package.</b> Stress around the TSVs and at the bond is a signoff item, because it changes both device behavior and bond reliability.',
    },
    risks: [
      '<b>Model never correlated to the vehicle.</b> A warpage simulation that has not been compared to measurement is a guess with a colorful plot.',
      '<b>Material properties at room temperature only.</b> Underfill and mold compounds change modulus sharply around their glass transition, which is inside the reflow profile.',
      '<b>Die thickness taken as nominal.</b> Thinning variation changes stiffness, and the thin end of the distribution is the one that warps.',
      '<b>Stress checked at the bond, not near devices.</b> Stress near TSVs shifts transistor behavior, and the KOZ is only safe if the analysis confirms it.',
      '<b>Closed against a window the line does not run.</b> If the assembly window moved after DCTV-07, the analysis has to move with it.',
    ],
    roles: [
      { r: 'Package mechanical engineer', d: 'Owns the warpage and stress analysis' },
      { r: 'Reliability engineer', d: 'Bond and TSV failure criteria' },
      { r: 'Package engineer', d: 'Vehicle measurements and correlation' },
      { r: 'OSAT process engineer', d: 'Reflow profile and assembly window' },
      { r: 'Package architect', d: 'Approves closure against the assembly window' },
    ],
    effort: [
      ['Reflow warpage modeling', 2],
      ['Bond and TSV stress analysis', 2],
      ['Vehicle correlation', 1.5],
      ['Closure against the assembly window', 1.5],
    ],
    entry: [
      'Temperature fields available from 3DI-04',
      'Vehicle measurements available from DCTV-05',
      'Material properties characterized across the reflow profile',
    ],
    exit: [
      'Warpage within the assembly window at every point of the reflow profile',
      'Model correlated to the vehicle measurements within an agreed error',
      'Stress near TSVs confirmed inside the keep-out assumption',
    ],
    dependsOn: ['3DI-04', 'BOND-05', 'PKGD-06'],
    dependsNote: null,
    feedsInto: ['3DI-06'],
    measuredBy: [
      'Simulated against measured warpage error',
      'Peak bond interface stress against the reliability limit',
      'Assembly yield loss attributed to warpage',
    ],
    links: {
      dependsOn: ['3DI-04', 'BOND-05', 'PKGD-06'],
      feedsInto: ['3DI-06'],
      runsWith: ['PTV-09'],
      revisedBy: ['DCTV-05', 'DCTV-07'],
      feedsBackInto: [],
    },
    terms: ['CTE', 'TSV', 'KOZ', 'DCTV'],
  },

  '3DI-06': {
    criticalPath: true,
    purpose: [
      'Sign the <b>stack off as one part</b>—multi-die timing on the assembled netlists, assembly and 3D design rules, and every waiver with a reason—so mask release depends on a signoff of what will actually be built.',
      'Two dies that each passed signoff are not a signed-off stack. The checks that matter here are the ones that only exist across the bond: inter-die timing, cross-die connectivity, keep-outs and assembly rules, and a waiver list that both die owners and the package owner have seen.',
    ],
    flowNote:
      'Step 1 runs multi-die static timing on the assembled netlists and step 2 runs the assembly and 3D rule checks. Step 3 runs alongside step 2 because waivers arrive as the checks do. Step 4 is the signoff itself, and it is only as strong as the analyses from 3DI-02 through 3DI-05 that it collects.',
    consumes: [
      'Stack power delivery and IR report from 3DI-02',
      'Inter-die timing closure report from 3DI-03',
      'Stack thermal simulation report from 3DI-04',
      'Warpage and stress co-analysis report from 3DI-05',
      '3D design rule deck from BOND-06',
    ],
    rel: {
      '3DI-D6':
        '<b>3D stack signoff package.</b> The package is produced and signed here, and mask release for the stack waits on it.',
    },
    risks: [
      '<b>Stack signed off by addition.</b> Two single-die signoffs plus a floorplan review is not a signoff, and the cross-die errors are exactly what it misses.',
      '<b>Assembly DRC run after database release.</b> A bump or keep-out violation found then costs a mask respin rather than an ECO.',
      '<b>Waivers approved per die.</b> A waiver that is harmless on one die can be the failure mechanism across the bond, so the stack waiver list needs a stack reviewer.',
      '<b>Final netlists not the ones analyzed.</b> Multi-die STA on a netlist one drop behind signs off a stack that will not be taped out.',
      '<b>Connectivity across the bond not checked.</b> A mirrored or shifted bump that passes each die’s LVS is still an open in the stack.',
    ],
    roles: [
      { r: 'Signoff lead', d: 'Owns the stack signoff package' },
      { r: 'Timing lead', d: 'Multi-die STA results' },
      { r: 'Physical verification engineer', d: 'Assembly DRC and cross-die connectivity' },
      { r: 'Package architect', d: 'Package and assembly rule compliance' },
      { r: 'Program TPM', d: 'Approves stack signoff for mask release' },
    ],
    effort: [
      ['Multi-die static timing', 2.5],
      ['Assembly and 3D rule checks', 2],
      ['Cross-die connectivity verification', 1.5],
      ['Waiver review', 1],
      ['Signoff package assembly and review', 2],
    ],
    entry: [
      'Stack analyses from 3DI-02 through 3DI-05 closed',
      'Final netlists and databases for every die available',
      'Released 3D design rule deck from BOND-06',
    ],
    exit: [
      'Multi-die STA clean at the combined corners on the final netlists',
      'Assembly DRC and cross-die connectivity clean or waived with reasons',
      'Waiver list reviewed by every die owner and the package owner',
    ],
    dependsOn: ['3DI-02', '3DI-03', '3DI-04', '3DI-05', 'BOND-06', 'SO-04'],
    dependsNote:
      'Stack signoff collects the four stack analyses and the per-die physical verification; it cannot start meaningfully until all of them have a closed result.',
    feedsInto: ['TO-03', 'TO-05'],
    measuredBy: [
      'Cross-die violations found after stack signoff',
      'Open waivers at mask release',
      'Weeks between stack signoff and the tapeout decision',
    ],
    links: {
      dependsOn: ['3DI-01', '3DI-02', '3DI-03', '3DI-04', '3DI-05', 'BOND-06', 'SO-03', 'SO-04'],
      feedsInto: ['TO-03', 'TO-05', 'MDT-01'],
      runsWith: ['SO-11'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['STA', 'DRC', 'LVS', 'KOZ', 'ECO'],
  },
};
