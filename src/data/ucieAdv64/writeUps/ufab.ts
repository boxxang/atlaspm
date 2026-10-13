/**
 * UFAB — Fab, Sort & Assembly to Silicon in Hand, written up.
 */
import type { UcieWriteUps } from '../types';

export const UFAB_WRITE_UPS: UcieWriteUps = {
  'UFAB-01': {
    criticalPath: true,
    purpose: [
      'Track the <b>test chip wafers through the foundry</b> against the committed cycle time and the planned process splits: confirm starts and priority, follow the lots through front-end and back-end processing and through wafer bumping of the fine-pitch microbumps, review in-line excursions and process monitor data on the PHY’s critical devices, and receive the wafers with each split condition confirmed.',
      'Shuttle wafers share their run with other customers, so the program has little leverage on the schedule and must see a slip early. The process monitor data matters as much as the date: it is what tells characterization later whether a margin shortfall is the design or the wafer.',
    ],
    flowNote:
      'Step 1 confirms starts and splits. Step 2 tracks the lots and step 3 the wafer bumping, while step 4 reviews excursions and process monitors in parallel. Step 5 receives the bumped wafers and step 6 releases the record.',
    consumes: [
      'Tapeout database release record from UTPO-04',
      'Mask, shuttle slot and lot plan confirmation from UTPO-03',
      'Configuration baseline from UTPO-05',
      'Process node and critical device list from UTEC-01',
      'Foundry committed cycle time',
    ],
    rel: {
      'UFAB-D1': '<b>Test chip wafer-out record with process monitor data and split confirmation.</b> Produced here.',
      'UFAB-D2': '<b>Wafer sort maps and known-good-die list with allocation by use.</b> The wafer-out record and splits go to sort with the wafers.',
    },
    risks: [
      '<b>Slip seen late.</b> Shuttle position is not tracked weekly and the slip appears at wafer out.',
      '<b>Excursion accepted silently.</b> An in-line excursion on a critical layer is dispositioned without program visibility.',
      '<b>Split lost.</b> Split wafers are not tracked to their condition.',
      '<b>Monitor data missing.</b> Process monitor data does not arrive with the wafers.',
      '<b>Priority lapses.</b> Shuttle lots lose priority during a capacity crunch.',
    ],
    roles: [
      { r: 'Technology and foundry', d: 'Owns wafer fabrication tracking' },
      { r: 'Foundry customer engineer', d: 'Reports lot position and excursions' },
      { r: 'Analog designer', d: 'Reviews monitor data on critical devices' },
      { r: 'Validation lead', d: 'Confirms the splits needed for characterization' },
      { r: 'Program manager', d: 'Escalates slips' },
    ],
    effort: [
      ['Lot tracking', 1],
      ['Excursion and monitor review', 0.5],
      ['Wafer receipt and release', 0.5],
    ],
    entry: [
      'Database released and accepted in UTPO-04',
      'Lot plan with splits confirmed in UTPO-03',
      'Committed cycle time received',
    ],
    exit: [
      'Wafers out within one week of the committed date, or the slip escalated with a recovery plan',
      'Every wafer’s split condition confirmed by the foundry',
      'Process monitor data received and reviewed for the PHY’s critical devices',
    ],
    dependsOn: ['UTPO-04', 'UTPO-03'],
    dependsNote: null,
    feedsInto: ['UFAB-02'],
    measuredBy: [
      'Projected wafer out against commitment, weekly',
      'Excursions open on critical layers',
      'Wafers with confirmed split conditions',
    ],
    links: {
      dependsOn: ['UTPO-04', 'UTPO-03', 'UTPO-05', 'UTEC-01'],
      feedsInto: ['UFAB-02'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['WAT', 'PCM', 'Lot split', 'MPW'],
  },
  'UFAB-02': {
    criticalPath: true,
    purpose: [
      'Sort the test chip wafers and select <b>known-good dies</b>: load the program and verify fine-pitch probe contact, run scan, BIST, PRBS loopback and supply tests on every wafer, and allocate known-good dies to test vehicle assembly, reliability and customer evaluation.',
      'Every test vehicle needs two good dies, so a sort escape costs both of them and the package. Allocation matters as well: the best dies are tempting for bring-up, but characterization needs dies from every split, and reliability needs its own.',
    ],
    flowNote:
      'Step 1 verifies probe contact. Step 2 sorts every wafer while step 3 selects and allocates known-good dies to each variant beside it, and step 4 releases the maps and list.',
    consumes: [
      'Test chip wafers and wafer-out record from UFAB-01',
      'ATE load board, probe card and sort program from UTVP-04',
      'Lot plan with process splits from UTPO-03',
      'Scan and ATPG patterns from UDFT-02',
      'BIST and built-in lane test from UDFT-05',
    ],
    rel: {
      'UFAB-D2': '<b>Wafer sort maps and known-good-die list with allocation by use.</b> Produced here.',
      'UFAB-D3': '<b>Assembled two-die test vehicles with assembly travelers and inspection records.</b> Only allocated known-good dies are assembled.',
    },
    risks: [
      '<b>Contact read as failure.</b> Probe contact problems bin good dies as failures.',
      '<b>Escapes into assembly.</b> A die with a weak lane passes structural tests and spoils a test vehicle.',
      '<b>Splits unbalanced.</b> All known-good dies come from one split and corners cannot be characterized.',
      '<b>No reliability allocation.</b> Reliability gets the leftovers rather than a planned sample.',
      '<b>Data not traced.</b> Die positions are not recorded and assemblies cannot be traced to wafers.',
    ],
    roles: [
      { r: 'Test engineering', d: 'Owns wafer sort and known-good-die selection' },
      { r: 'Probe card engineer', d: 'Verifies contact' },
      { r: 'DFT engineer', d: 'Diagnoses scan and BIST failures' },
      { r: 'Validation lead', d: 'Approves allocation across splits' },
      { r: 'Reliability engineer', d: 'Confirms the reliability sample' },
    ],
    effort: [
      ['Contact verification', 0.5],
      ['Wafer sort', 1.5],
      ['Selection and allocation', 0.5],
      ['Release', 0.5],
    ],
    entry: [
      'Wafers received in UFAB-01',
      'Sort program and probe card released in UTVP-04',
      'Allocation plan agreed across validation, reliability and customer engineering',
    ],
    exit: [
      'Every wafer sorted with contact verified on reference dies',
      'Known-good dies allocated across splits per the plan',
      'Wafer maps and die positions recorded for traceability',
    ],
    dependsOn: ['UFAB-01', 'UTVP-04'],
    dependsNote: null,
    feedsInto: ['UFAB-03'],
    measuredBy: [
      'Sort yield per wafer and split',
      'Known-good dies against assembly needs',
      'Probe contact retest rate',
    ],
    links: {
      dependsOn: ['UFAB-01', 'UTVP-04', 'UTPO-03', 'UDFT-02', 'UDFT-05'],
      feedsInto: ['UFAB-03'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['KGD', 'ATE', 'Probe card', 'BIST', 'PRBS'],
  },
  'UFAB-03': {
    criticalPath: true,
    purpose: [
      'Assemble <b>every test vehicle variant</b> — the bridge build, the interposer build, the reversed-orientation build and the build with the interoperability partner’s die: kit known-good dies with their package material, assemble with the assembly partner, inspect with X-ray and acoustic microscopy, screen every unit on the package final test program at time zero, and release each assembly with its traveler and test result.',
      'Fine-pitch die-to-die bumps are where assembly defects hide: a marginal joint may still connect and simply degrade a lane that lane repair then quietly replaces. Inspection data and travelers let characterization tell a repaired lane caused by assembly from one caused by the PHY.',
    ],
    flowNote:
      'Step 1 kits the dies and material per variant. Step 2 assembles the test vehicles while step 3 inspects them in parallel. Step 4 screens every unit at time zero and step 5 releases them with travelers and results.',
    consumes: [
      'Known-good-die list and allocation from UFAB-02',
      'Received substrates, bridges, interposers and partner dies from UTVP-02',
      'Test vehicle package designs per variant from UTVP-01',
      'Package final test program from UTVP-09',
      'Package partner assembly constraints from UTEC-04',
    ],
    rel: {
      'UFAB-D3': '<b>Assembled test vehicles for every variant with travelers, inspection records and package final test results.</b> Produced here.',
      'UFAB-D4': '<b>Evaluation boards with test vehicles mounted and inspected.</b> Only inspected assemblies are mounted.',
    },
    risks: [
      '<b>Marginal joints.</b> Bumps that connect weakly degrade lanes and are masked by lane repair.',
      '<b>Warpage.</b> Assembly warpage on the interposer stresses the die-to-die bumps.',
      '<b>Underfill voids.</b> Voids under the bridge region go undetected.',
      '<b>Yield below plan.</b> Too few good assemblies of each variant for all uses, and the interposer or partner-die build is the one cut.',
      '<b>Travelers missing.</b> Assembly conditions are not recorded per unit.',
    ],
    roles: [
      { r: 'Packaging', d: 'Owns test vehicle assembly' },
      { r: 'Assembly partner engineer', d: 'Runs the assembly line' },
      { r: 'Failure analysis engineer', d: 'Reads X-ray and acoustic images' },
      { r: 'Quality engineer', d: 'Maintains travelers' },
      { r: 'Validation lead', d: 'Confirms assemblies per use' },
    ],
    effort: [
      ['Kitting', 0.5],
      ['Assembly of every variant', 2],
      ['Inspection', 0.5],
      ['Time-zero final test', 0.6],
      ['Release', 0.4],
    ],
    entry: [
      'Known-good dies allocated in UFAB-02',
      'Package material and partner dies received in UTVP-02, and the package final test program released in UTVP-09',
      'Assembly line slot booked',
    ],
    exit: [
      'Every assembly inspected with X-ray and acoustic microscopy and its result recorded',
      'Assemblies released with travelers naming wafer, die position and assembly conditions',
      'Every unit screened at time zero, with good assemblies of every variant available for every planned use',
    ],
    dependsOn: ['UFAB-02', 'UTVP-02', 'UTVP-09'],
    dependsNote: 'Assembly of the six-week variant set starts at week 91 as the first known-good dies come off sort, and ends at week 97.',
    feedsInto: ['UFAB-04'],
    measuredBy: [
      'Assembly yield',
      'Inspection rejects by defect type',
      'Assemblies with complete travelers',
    ],
    links: {
      dependsOn: ['UFAB-02', 'UTVP-02', 'UTVP-01', 'UTVP-09', 'UTEC-04'],
      feedsInto: ['UFAB-04', 'URLQ-02', 'URLQ-04'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Test vehicle', 'KGD', 'CSAM', 'Underfill', 'Traveler', 'Lane repair'],
  },
  'UFAB-04': {
    criticalPath: false,
    purpose: [
      'Build the <b>evaluation boards with silicon</b>: mount the test vehicles, inspect the joints, check every supply for shorts without powering the PHY, run a low-voltage continuity check, and release each board with its unit serials.',
      'The first power-on belongs in bring-up, on a known-good board. Finding a supply short or a bad joint here, at low voltage, protects the scarce assemblies from being damaged by a board fault.',
    ],
    flowNote:
      'Step 1 mounts the test vehicles, step 2 inspects joints and checks for shorts, step 3 runs a low-voltage continuity check and step 4 releases the boards.',
    consumes: [
      'Assembled test vehicles from UFAB-03',
      'Evaluation boards from UTVP-03',
      'Test vehicle footprint from UTVP-01',
      'Supply domain ranges from UREQ-08',
      'Board assembly procedure',
    ],
    rel: {
      'UFAB-D4': '<b>Evaluation boards with test vehicles mounted and inspected.</b> Produced here.',
      'UFAB-D5': '<b>First samples receipt and lab allocation record.</b> Released boards are what the lab receives.',
    },
    risks: [
      '<b>Short on a supply.</b> A board fault damages a test vehicle at first power.',
      '<b>Joint defects.</b> Board joints fail intermittently and look like link errors.',
      '<b>Serials not recorded.</b> Boards and units cannot be matched later.',
      '<b>Socket damage.</b> Repeated insertion damages scarce assemblies.',
      '<b>Mixed revisions.</b> Board revisions differ across units.',
    ],
    roles: [
      { r: 'Board and lab hardware', d: 'Owns board assembly and inspection' },
      { r: 'Lab technician', d: 'Runs short and continuity checks' },
      { r: 'Packaging engineer', d: 'Advises on handling of assemblies' },
      { r: 'Quality engineer', d: 'Records serials' },
      { r: 'Validation engineer', d: 'Accepts boards for the lab' },
    ],
    effort: [
      ['Mounting', 0.5],
      ['Inspection and short checks', 0.5],
      ['Continuity check', 0.5],
      ['Release', 0.5],
    ],
    entry: [
      'Assemblies released in UFAB-03',
      'Boards passed bare-board tests in UTVP-03',
      'Handling procedure for assemblies agreed',
    ],
    exit: [
      'No supply shorts on any released board',
      'Continuity confirmed on every supply domain at low voltage',
      'Board and unit serials recorded together',
    ],
    dependsOn: ['UFAB-03', 'UTVP-03'],
    dependsNote: null,
    feedsInto: ['UFAB-05'],
    measuredBy: [
      'Boards released against assemblies received',
      'Shorts or joint defects found',
      'Boards with recorded serials',
    ],
    links: {
      dependsOn: ['UFAB-03', 'UTVP-03', 'UTVP-01', 'UREQ-08'],
      feedsInto: ['UFAB-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['EVB', 'Test vehicle', 'Traveler'],
  },
  'UFAB-05': {
    criticalPath: true,
    purpose: [
      'Receive the <b>first samples into the lab</b>: boards and units with their travelers, records checked against the configuration baseline and the split map, units allocated to bring-up, characterization, compliance and reliability, and silicon in hand recorded with the first units handed to bring-up.',
      'Allocation decided now saves arguments later. If characterization, compliance and reliability each know which units are theirs and which splits those units represent, nobody spends the first silicon weeks negotiating hardware.',
    ],
    flowNote:
      'Step 1 receives the boards and units, step 2 checks records against the baseline, step 3 allocates units by use and step 4 records silicon in hand.',
    consumes: [
      'Evaluation boards with mounted units from UFAB-04',
      'Lab station readiness from UTVP-05',
      'Hardware readiness decision from UTVP-07',
      'Bring-up plan and test programs from UTVP-06',
      'Configuration baseline from UTPO-05',
    ],
    rel: {
      'UFAB-D5': '<b>First samples receipt and lab allocation record.</b> Produced here; it closes the Silicon in Hand gate.',
    },
    risks: [
      '<b>Units unallocated.</b> Bring-up absorbs every unit and characterization has none.',
      '<b>Baseline mismatch.</b> A unit’s records do not match the taped-out revision.',
      '<b>Splits unknown.</b> Units arrive without their split condition.',
      '<b>Lab not ready.</b> Stations are booked or automation is incomplete.',
      '<b>Handover unclear.</b> Nobody owns the first unit on the day it arrives.',
    ],
    roles: [
      { r: 'Validation', d: 'Owns lab receipt and allocation' },
      { r: 'Lab technician', d: 'Receives and logs units' },
      { r: 'Configuration manager', d: 'Checks records against the baseline' },
      { r: 'Reliability engineer', d: 'Takes the reliability allocation' },
      { r: 'Compliance engineer', d: 'Takes the compliance allocation' },
    ],
    effort: [
      ['Receipt', 0.25],
      ['Record check', 0.25],
      ['Allocation', 0.25],
      ['Handover', 0.25],
    ],
    entry: [
      'Boards released in UFAB-04',
      'Hardware readiness recorded in UTVP-07',
      'Allocation plan agreed',
    ],
    exit: [
      'Every received unit logged with wafer, split, assembly and board serial',
      'Units allocated to bring-up, characterization, compliance and reliability per plan',
      'First units handed to bring-up with silicon in hand recorded',
    ],
    dependsOn: ['UFAB-04', 'UTVP-07'],
    dependsNote: null,
    feedsInto: ['UBUP-01', 'UCHR-01', 'URLQ-01'],
    measuredBy: [
      'Units received and logged',
      'Units allocated per use against plan',
      'Days from boards released to first power-on',
    ],
    links: {
      dependsOn: ['UFAB-04', 'UTVP-05', 'UTVP-07', 'UTVP-06', 'UTPO-05'],
      feedsInto: ['UBUP-01', 'UCHR-01', 'URLQ-01', 'UCMP-01'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Test vehicle', 'Lot split', 'Traveler'],
  },
};
