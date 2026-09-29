/**
 * SORT — Wafer Sort & Known-Good-Die, written up.
 */
import type { CpoWriteUps } from '../types';

export const SORT_WRITE_UPS: CpoWriteUps = {
  'SORT-01': {
    criticalPath: true,
    purpose: [
      'Bring up <b>electrical wafer sort on first silicon</b> for the switch ASIC, the I/O silicon and the electrical ICs — probe contact, structural and parametric tests, SerDes loopback and PRBS, driver and TIA checks, and trim, fuse and key programming — and sort the first lots across the corner splits.',
      'First silicon and a first sort program meet for the first time here, and failures are as likely to be the program, the probe card or the patterns as the silicon. The discipline is to separate them quickly: contact first, then structural, then at-speed, with every failure bucketed before anyone concludes the die is bad.',
    ],
    flowNote:
      'Step 1 verifies probe contact. Step 2 debugs the structural and parametric tests, with SerDes and electrical IC tests brought up in parallel in step 3. Step 4 programs trims, fuses and keys, step 5 sorts the first lots and step 6 releases the program and data.',
    consumes: [
      'First silicon wafers released from WFAB-06',
      'Probe cards and electrical sort hardware from TINF-02',
      'Production test programs from TINF-06',
      'Production test pattern delivery package from SGNO-07',
      'Key provisioning and fuse programming flow from SGNO-08',
    ],
    rel: {
      'SORT-D1': '<b>Electrical wafer sort program release and first-lot sort data.</b> Produced here; the first-lot data is what the known-good-die limits are set from.',
      'SORT-D3': '<b>Known-good-die screening specification and bin definitions.</b> First-lot distributions per test feed the limits.',
    },
    risks: [
      '<b>Program debug on the critical path.</b> The sort program is debugged for weeks on first silicon and the first build starts without known-good dies.',
      '<b>Probe card contact problems.</b> Planarity or bump contact issues read as die failures and good dies are binned out.',
      '<b>Pattern mismatch.</b> Patterns do not match the taped-out netlist and every die fails scan.',
      '<b>Insecure provisioning.</b> Keys are programmed through an open debug path on a tester outside the secure flow.',
      '<b>Corner lots unsorted.</b> Only nominal wafers are sorted and the corner data characterization needs is missing.',
    ],
    roles: [
      { r: 'Test engineering', d: 'Owns electrical sort bring-up and the sort program' },
      { r: 'Probe card engineer', d: 'Contact, planarity and continuity' },
      { r: 'DFT engineer', d: 'Scan and BIST failure diagnosis' },
      { r: 'SerDes engineer', d: 'Loopback and PRBS test bring-up' },
      { r: 'Security engineer', d: 'Confirms the provisioning flow at sort' },
    ],
    effort: [
      ['Probe card verification', 1],
      ['Structural and parametric debug', 3.5],
      ['SerDes and electrical IC tests', 2.5],
      ['Trim, fuse and key programming', 1],
      ['First-lot sort and release', 2],
    ],
    entry: [
      'Wafers released to sort in WFAB-06',
      'Probe cards received and verified on the tester in TINF-02',
      'Sort program and patterns loaded from TINF-06 and SGNO-07',
    ],
    exit: [
      'Contact yield above 99 percent on the probe card qualification wafer',
      'Every sort test failure on the first lots bucketed as die, program, pattern or hardware',
      'Sort program released and first-lot data for every corner split loaded in the manufacturing data system',
    ],
    dependsOn: ['WFAB-06', 'TINF-02', 'TINF-06', 'SGNO-07'],
    dependsNote: null,
    feedsInto: ['SORT-03', 'SORT-04'],
    measuredBy: [
      'First-pass sort yield per die per lot',
      'Failures bucketed as program or hardware rather than die',
      'Test time per wafer against the cost model',
    ],
    links: {
      dependsOn: ['WFAB-06', 'TINF-02', 'TINF-06', 'SGNO-07', 'WFAB-01', 'WFAB-02'],
      feedsInto: ['SORT-03', 'SORT-04', 'CHAR-01'],
      runsWith: ['SORT-02'],
      revisedBy: [],
      feedsBackInto: ['TINF-06'],
    },
    terms: ['KGD', 'ATE', 'ATPG', 'MBIST', 'PRBS', 'Loopback', 'OTP'],
  },
  'SORT-02': {
    criticalPath: true,
    purpose: [
      'Test the photonic IC <b>optically at wafer level</b> — waveguide and coupler loss, detector responsivity and dark current, modulator efficiency and ring resonance with heater tuning range — through test couplers on a calibrated optical probe, and produce wafer maps that bin every die.',
      'Wafer-level optical test is younger than electrical sort and its main error source is the probe: fiber-to-coupler alignment and polarization move insertion loss by more than the die-to-die spread. Calibrating against reference structures on every wafer, and correlating with the in-line monitors, is what makes the bins mean something.',
    ],
    flowNote:
      'Step 1 aligns and calibrates the probe. Step 2 measures loss, responsivity and dark current while step 3 measures modulators and resonances in parallel. Step 4 correlates with the in-line monitors, step 5 generates wafer maps and step 6 releases the results.',
    consumes: [
      'Photonic IC wafers released from WFAB-06',
      'In-line optical monitor report from WFAB-03',
      'Optical wafer probe and fixtures from TINF-03',
      'Factory calibration process and limits from TINF-07',
      'Test coupler positions and reference structures from MTO-04',
    ],
    rel: {
      'SORT-D2': '<b>Photonic IC wafer-level optical test results and wafer maps.</b> Produced here.',
      'SORT-D3': '<b>Known-good-die screening specification and bin definitions.</b> Optical distributions per parameter feed the photonic limits.',
    },
    risks: [
      '<b>Probe variation binned as die variation.</b> Uncalibrated alignment loss moves dies across the limit.',
      '<b>Test couplers unrepresentative.</b> Grating couplers used for test do not predict the edge or fiber coupling used in the package.',
      '<b>Resonance measured without tuning.</b> Rings off-resonance at room temperature are failed although heaters could tune them.',
      '<b>Test time too long.</b> Wavelength sweeps per channel push optical test time past the cost model.',
      '<b>No reference die.</b> Drift of the optical setup across a lot goes undetected.',
    ],
    roles: [
      { r: 'Photonics', d: 'Owns photonic wafer-level optical test' },
      { r: 'Optical test engineer', d: 'Probe alignment, calibration and measurement' },
      { r: 'Photonic device engineer', d: 'Interprets loss, responsivity and resonance data' },
      { r: 'Test engineering lead', d: 'Test time and integration with the manufacturing data system' },
      { r: 'Photonics foundry liaison', d: 'Correlation with in-line monitors and splits' },
    ],
    effort: [
      ['Probe alignment and calibration', 1.5],
      ['Loss and detector measurement', 2],
      ['Modulator and resonance measurement', 2],
      ['Correlation to in-line monitors', 1],
      ['Wafer maps and release', 1.5],
    ],
    entry: [
      'Photonic wafers released in WFAB-06 with the in-line monitor report',
      'Optical probe qualified on reference wafers in TINF-03',
      'Optical test limits drafted from the link budget',
    ],
    exit: [
      'Probe insertion loss repeatability within 0.3 dB on reference structures across every wafer tested',
      'Every die binned on loss, responsivity, modulation and tunable resonance',
      'Wafer-level results correlated with in-line monitors per lot and released with wafer maps',
    ],
    dependsOn: ['WFAB-06', 'WFAB-03', 'TINF-03'],
    dependsNote: null,
    feedsInto: ['SORT-03', 'SORT-04'],
    measuredBy: [
      'Photonic die yield per wafer and per split',
      'Probe repeatability on reference structures',
      'Optical test time per wafer',
    ],
    links: {
      dependsOn: ['WFAB-06', 'WFAB-03', 'TINF-03', 'TINF-07'],
      feedsInto: ['SORT-03', 'SORT-04', 'CHAR-03'],
      runsWith: ['SORT-01'],
      revisedBy: [],
      feedsBackInto: ['TINF-07'],
    },
    terms: ['PIC', 'Wafer-level optical test', 'Grating coupler', 'Coupling loss', 'Calibration'],
  },
  'SORT-03': {
    criticalPath: true,
    purpose: [
      'Turn first-lot sort data into <b>known-good-die screening criteria</b> — limits per die set from the distributions, the link budget and the package yield model, bins and outlier screens, correlation to bench characterization and across testers, and the compound yield those screens imply.',
      'In a multi-die package each escape costs the good dies assembled beside it, so the right limit balances die yield against package scrap, not die yield alone. Correlation is what justifies the limit: a sort test that does not predict package or system behaviour screens the wrong thing.',
    ],
    flowNote:
      'Step 1 sets limits and step 2 defines bins and screens, with correlation to bench and across testers run in parallel in step 3. Step 4 computes compound yield and step 5 releases the specification and report.',
    consumes: [
      'First-lot electrical sort data from SORT-01',
      'Photonic wafer-level optical test results from SORT-02',
      'Production test strategy and coverage plan from TINF-01',
      'DFT, known-good-die and production test architecture from SARC-10',
      'Optical link budget allocations from MODL-04',
    ],
    rel: {
      'SORT-D3': '<b>Known-good-die screening specification and bin definitions.</b> Produced here; the die bank releases only dies that meet it.',
      'SORT-D4': '<b>Sort correlation and compound yield report.</b> Produced here; the first package yield target is set from it.',
      'SORT-D5': '<b>Die bank inventory and known-good-die release to assembly.</b> Bins decide which dies enter the bank.',
    },
    risks: [
      '<b>Limits from one lot.</b> Limits fitted to the first lot’s distribution fail the next lot at a different corner.',
      '<b>Screens set per die.</b> Each die team optimizes its own yield and the package pays for the escapes.',
      '<b>No correlation.</b> Sort tests are not checked against bench results and a die that passes sort fails in the package.',
      '<b>Outlier screens absent.</b> Dies inside limits but far from the population pass and fail early in the field.',
      '<b>Tester-to-tester offset.</b> Two testers bin the same die differently.',
    ],
    roles: [
      { r: 'Test engineering', d: 'Owns known-good-die criteria and correlation' },
      { r: 'Product engineer', d: 'Distributions, outlier screens and yield model' },
      { r: 'Photonics lead', d: 'Optical limits against the link budget' },
      { r: 'Reliability engineer', d: 'Stress screens and early-life escape targets' },
      { r: 'Manufacturing and NPI lead', d: 'Approves the compound yield target' },
    ],
    effort: [
      ['Limit setting', 1.5],
      ['Bins and outlier screens', 1.5],
      ['Correlation', 1.5],
      ['Compound yield model', 1],
      ['Specification and report', 0.5],
    ],
    entry: [
      'First-lot sort data for every die type loaded in the manufacturing data system',
      'Bench characterization available on sampled dies',
      'Package yield model agreed with manufacturing',
    ],
    exit: [
      'Limits for every die type traced to the distribution, the link budget or the yield model',
      'Sort-to-bench correlation above the agreed threshold on every screened parameter',
      'Compound yield estimate for the first build and the screening specification signed by test engineering and NPI',
    ],
    dependsOn: ['SORT-01', 'SORT-02', 'TINF-01'],
    dependsNote: null,
    feedsInto: ['SORT-04', 'PKGA-06'],
    measuredBy: [
      'Known-good-die yield per die type',
      'Correlation coefficient sort to bench per screened parameter',
      'Projected compound package yield',
    ],
    links: {
      dependsOn: ['SORT-01', 'SORT-02', 'TINF-01', 'SARC-10'],
      feedsInto: ['SORT-04', 'PKGA-06', 'NPI-05'],
      runsWith: [],
      revisedBy: ['PKGA-06'],
      feedsBackInto: [],
    },
    terms: ['KGD', 'Compound yield', 'STDF', 'DPPM', 'Shmoo'],
  },
  'SORT-04': {
    criticalPath: true,
    purpose: [
      'Bank the known-good dies with <b>per-die traceability</b>, match them into kits by the build matrix — switch, I/O, electrical and photonic ICs and bridge — and release the kits to the first package build.',
      'A die bank that tracks dies only by lot cannot answer the question every package failure will ask: which wafer, which position, which bin, which sort data. And a kit missing one die type holds the whole build while the others wait.',
    ],
    flowNote:
      'Step 1 singulates and banks the dies. Step 2 matches kits while step 3 reconciles inventory in parallel. Step 4 releases the kits.',
    consumes: [
      'Known-good-die screening specification from SORT-03',
      'Electrical sort data from SORT-01',
      'Photonic wafer maps from SORT-02',
      'Engineering build matrix from PKGA-02',
      'Traceability and die bank infrastructure from TINF-10',
    ],
    rel: {
      'SORT-D5': '<b>Die bank inventory and known-good-die release to assembly.</b> Produced here; it closes the Known-Good-Die Ready gate.',
    },
    risks: [
      '<b>Traceability lost at singulation.</b> Dies are picked without wafer position and cannot be joined to sort data later.',
      '<b>Kit short one die type.</b> Photonic or electrical IC shortfall holds every kit.',
      '<b>Wrong bin picked.</b> A die from a failing bin is picked into the bank.',
      '<b>Handling damage.</b> Photonic facets or microbumps are damaged in pick and pack.',
      '<b>Inventory not reconciled.</b> The build plan assumes dies that are not in the bank.',
    ],
    roles: [
      { r: 'Manufacturing and NPI', d: 'Owns the die bank and release to assembly' },
      { r: 'Test engineering lead', d: 'Confirms bin-to-bank rules' },
      { r: 'Assembly engineer', d: 'Die handling and packing for assembly' },
      { r: 'Quality engineer', d: 'Traceability audit' },
      { r: 'Program TPM', d: 'Tracks kits against the first build' },
    ],
    effort: [
      ['Singulation, pick and bank', 1.5],
      ['Kit matching', 0.5],
      ['Inventory reconciliation', 0.5],
      ['Release', 0.5],
    ],
    entry: [
      'Screening specification released in SORT-03',
      'Build matrix available from PKGA-02',
      'Die bank inventory system live',
    ],
    exit: [
      'Every banked die traceable to wafer, position, bin and sort data',
      'Complete kits for the first build matched and verified against the build matrix',
      'Kits released to assembly on or before the first die attach date',
    ],
    dependsOn: ['SORT-01', 'SORT-02', 'SORT-03', 'PKGA-02'],
    dependsNote: 'The gate of the stage: sort and screening both feed it.',
    feedsInto: ['PKGA-03', 'PKGA-04'],
    measuredBy: [
      'Complete kits released against the build matrix',
      'Banked dies with full traceability',
      'Kit shortfalls by die type',
    ],
    links: {
      dependsOn: ['SORT-01', 'SORT-02', 'SORT-03', 'PKGA-02', 'TINF-10'],
      feedsInto: ['PKGA-03', 'PKGA-04', 'PKGA-06'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['KGD', 'Die bank'],
  },
};
