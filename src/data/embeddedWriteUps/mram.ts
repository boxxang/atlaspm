import type { ActivityWriteUp } from '../activityDetailTypes';

export const MRAM_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'MRAM-01': {
    criticalPath: true,
    purpose: [
      'Choose the <b>eMRAM macro the part is built around and fix its configuration</b>: which of the foundry’s offerings, how much of it, how wide and in how many banks, and which code and data live in it rather than in SRAM.',
      'On a mature-node embedded part the eMRAM is the flash replacement, so its read latency sets how fast code can execute in place, its write energy sets what logging costs, and its variant decides whether data survives solder. Those are fixed by the macro chosen here, and every later activity in the stage inherits them.',
    ],
    flowNote:
      'Step 1 compares the foundry options, and step 2 splits code and data between eMRAM and SRAM because the split decides how much eMRAM is needed. Step 3 sizes the instances from that split, and step 4 runs alongside it, since a size the macro is not qualified for on this node is not an option. Step 5 signs the licence and step 6 issues the record.',
    consumes: [
      'Process option and flavour agreed with the foundry in ETECH-05',
      'Memory capacity and non-volatile storage requirements from EDEF-04',
      'Memory hierarchy and data placement model from FCD-03',
      'IP vendor evaluation and selection from EIPR-04',
      'Silicon-proven status of the macro on the node from EIPR-05',
    ],
    rel: {
      'MRAM-D1':
        '<b>eMRAM macro selection and configuration record.</b> The macro, its variant, instance sizes and the code and data split are decided and recorded here.',
    },
    risks: [
      '<b>The low-retention variant chosen for its speed.</b> Foundries offer eMRAM tuned for fast writes or for long retention, and the fast one does not keep pre-programmed data through reflow.',
      '<b>Read latency taken from the datasheet at typical.</b> At the slow corner and low supply the access time can need an extra wait state, and code executing in place pays it on every fetch.',
      '<b>Code and data split decided before the compiler has a view.</b> Configuration binaries for the fabric are large, and if they do not fit in eMRAM the boot and wake path changes shape.',
      '<b>Macro qualified on a different flavour of the node.</b> A macro proven on the standard flavour is not proven on the low-leakage one, and requalification runs longer than this stage.',
      '<b>Licence delivery dates not tied to the integration plan.</b> Views that arrive after RTL integration starts leave ERTL-07 working against placeholders.',
    ],
    roles: [
      { r: 'Memory IP lead', d: 'Owns the selection, the configuration and the record' },
      { r: 'Memory architect', d: 'Code and data placement across eMRAM and SRAM' },
      { r: 'Foundry memory liaison', d: 'Variants, qualification status and roadmap on the node' },
      { r: 'Compiler architect', d: 'Size and placement of fabric configuration binaries' },
      { r: 'Procurement lead', d: 'Licence terms and committed delivery dates' },
    ],
    effort: [
      ['Foundry option comparison', 1],
      ['Code and data split', 0.5],
      ['Instance sizing and banking', 0.5],
      ['Qualification status review', 0.5],
      ['Licence and record', 0.5],
    ],
    entry: [
      'Process flavour agreed with the foundry in ETECH-05',
      'Memory placement model drafted in FCD-03',
      'Candidate macros shortlisted in EIPR-04',
    ],
    exit: [
      'Macro variant chosen with its retention and reflow capability stated',
      'Instance sizes and bank count fixed against the code and data split',
      'Licence signed with view delivery dates in the programme plan',
    ],
    dependsOn: ['ETECH-05', 'EDEF-04', 'FCD-03', 'EIPR-04'],
    dependsNote: null,
    feedsInto: ['MRAM-02', 'MRAM-03', 'MRAM-05', 'EARCH-04'],
    measuredBy: [
      'Macro options compared on read latency, write energy and retention',
      'eMRAM capacity margin over the placement model',
      'Days between the committed and actual view delivery',
    ],
    links: {
      dependsOn: ['ETECH-05', 'EDEF-04', 'FCD-03', 'EIPR-04'],
      feedsInto: ['MRAM-02', 'MRAM-03', 'MRAM-05', 'EARCH-04'],
      runsWith: ['EIPR-05'],
      revisedBy: ['EIPR-06'],
      feedsBackInto: ['FCD-03'],
    },
    terms: ['eMRAM', 'SRAM', 'XIP', 'IP'],
  },
  'MRAM-02': {
    criticalPath: true,
    purpose: [
      'Specify the <b>controller that makes the eMRAM macro a usable memory</b>: the read path and its wait states, the ECC, the write-verify loop, the reference trim and how the macro powers down and wakes.',
      'The raw macro is a resistance array with a small read margin and a write that does not always take. Whether the part meets its ten-year data integrity target is decided here, by an ECC sized against the end-of-life bit-error rate and a write scheme that verifies what it wrote, not by the macro alone.',
    ],
    flowNote:
      'Step 1 specifies the read path, and step 2 sizes the ECC against the end-of-life error rate the read path will see. Step 3 defines write-verify and pulse control, and step 4 runs alongside it because the reference trim sets both the read margin and the verify threshold. Step 5 adds power-down and wake behaviour, and step 6 releases the specification.',
    consumes: [
      'eMRAM macro selection and configuration record from MRAM-01',
      'Retention and endurance targets per region from MRAM-03',
      'Power, clock and operating mode architecture from EARCH-06',
      'Dataflow and memory hierarchy definition from EARCH-04',
      'Security and safety requirements from EARCH-05',
    ],
    rel: {
      'MRAM-D2':
        '<b>eMRAM controller, ECC and trim specification.</b> The read path, ECC, write-verify, trim storage and power-down behaviour are specified and released here.',
      'MRAM-D6':
        '<b>eMRAM test, repair and trim flow.</b> The trim storage and ECC defined here are what the sort flow has to program and screen.',
    },
    risks: [
      '<b>ECC sized for time-zero error rates.</b> Bit errors rise with temperature, read disturb and age, and a single-error-correcting code that is ample at sort can be overrun at end of life.',
      '<b>Trim stored where it cannot be read without trim.</b> Reference trim kept in the eMRAM itself needs a default that reads reliably across corners, or the part cannot boot to load it.',
      '<b>Write-verify loop left unbounded.</b> A retry count with no ceiling turns a weak bit into a write that never finishes, and the firmware sees a hang rather than an error.',
      '<b>Wait states fixed for the slow corner only.</b> Performance mode then runs slower than it needs to, and the energy per task target is missed on code fetch.',
      '<b>Brown-out during a write left undefined.</b> A write interrupted by a falling supply leaves a word half written, and without a defined abort the ECC cannot tell it from a failure.',
    ],
    roles: [
      { r: 'Memory design lead', d: 'Owns the controller specification end to end' },
      { r: 'Memory IP lead', d: 'Macro timing, pulse and trim parameters from the vendor' },
      { r: 'Reliability engineer', d: 'End-of-life bit-error rate the ECC must cover' },
      { r: 'Power architect', d: 'Power-down, wake and brown-out behaviour' },
      { r: 'Firmware lead', d: 'Boot-time trim load and the error reporting firmware sees' },
    ],
    effort: [
      ['Read path, wait states and prefetch', 1.5],
      ['ECC scheme and error-rate budget', 2],
      ['Write-verify and write energy', 1.5],
      ['Reference trim and storage', 1.5],
      ['Power-down and wake behaviour', 1],
      ['Specification release', 0.5],
    ],
    entry: [
      'Macro and configuration recorded in MRAM-01',
      'Operating modes defined in EARCH-06',
      'Vendor bit-error-rate data available per temperature',
    ],
    exit: [
      'ECC shown to meet the integrity target at the end-of-life error rate',
      'Wait states defined per operating mode and corner',
      'Trim storage, brown-out write behaviour and wake sequence specified',
    ],
    dependsOn: ['MRAM-01', 'EARCH-06', 'EARCH-04'],
    dependsNote: null,
    feedsInto: ['MRAM-05', 'MRAM-06', 'ERTL-07', 'SDK-01', 'EDFT-05'],
    measuredBy: [
      'ECC correction margin at the end-of-life bit-error rate',
      'Controller specification open issues at release',
      'Read wait states per mode against the architecture assumption',
    ],
    links: {
      dependsOn: ['MRAM-01', 'EARCH-04', 'EARCH-06'],
      feedsInto: ['MRAM-05', 'MRAM-06', 'ERTL-07', 'SDK-01', 'EDFT-05'],
      runsWith: ['MRAM-03'],
      revisedBy: ['EARCH-05'],
      feedsBackInto: ['PMU-03'],
    },
    terms: ['ECC', 'BER', 'eMRAM', 'OTP', 'BOR'],
  },
  'MRAM-03': {
    criticalPath: false,
    purpose: [
      'Set the <b>retention, endurance and reflow survival the eMRAM must hold</b> for each temperature grade and each use of the memory, and plan the stress tests that will prove it.',
      'Retention falls steeply with temperature, endurance differs between code that is written a few times and logs that are written every minute, and data written at test has to survive a 260 °C reflow. Each target is a customer promise, and the plan exists so that none of them is made without data behind it.',
    ],
    flowNote:
      'Step 1 sets retention per temperature grade, and step 2 sets endurance per region because the two trade against each other in the macro. Step 3 plans reflow survival for pre-programmed parts, and step 4 runs alongside it, defining the stresses and sample sizes while the targets are still fresh. Step 5 agrees the whole plan against the foundry’s qualification data.',
    consumes: [
      'eMRAM macro variant and configuration from MRAM-01',
      'Temperature grades and product lifetime from EDEF-01',
      'Code, data and logging placement from FCD-03',
      'Foundry macro qualification data reviewed in EIPR-05',
      'Qualification standards expected by the target markets from EDEF-04',
    ],
    rel: {
      'MRAM-D3':
        '<b>Retention, endurance and reflow survival plan.</b> The targets per grade and region, and the stresses that prove them, are set here.',
    },
    risks: [
      '<b>Pre-programmed data lost in solder reflow.</b> Customers program parts before assembly, and a variant that does not survive three reflow passes loses them after it.',
      '<b>Retention quoted at one temperature for every grade.</b> Ten years at 85 °C says little about 125 °C, and an industrial or automotive grade needs its own number.',
      '<b>Endurance assumed uniform across the array.</b> A logging region written every second exhausts a budget a code region never touches, and without per-region targets there is no case for wear levelling.',
      '<b>Sample sizes too small to support the claim.</b> A handful of parts through bake proves nothing at the failure rates customers expect, and qualification then has to be rerun.',
      '<b>Plan written without the foundry’s data.</b> Targets that exceed what the macro was qualified to cannot be proven by this programme alone.',
    ],
    roles: [
      { r: 'Reliability engineer', d: 'Owns the targets, the stresses and the sample plan' },
      { r: 'Memory IP lead', d: 'Macro variant limits and vendor qualification data' },
      { r: 'Product manager', d: 'Temperature grades and lifetime promised to customers' },
      { r: 'Firmware lead', d: 'Write rates per region and the case for wear levelling' },
      { r: 'Quality engineer', d: 'Statistical basis for the sample sizes' },
    ],
    effort: [
      ['Retention targets per grade', 0.75],
      ['Endurance targets per region', 0.75],
      ['Reflow survival plan', 1],
      ['Stress tests and sample sizes', 1],
      ['Foundry alignment', 0.5],
    ],
    entry: [
      'Macro variant chosen in MRAM-01',
      'Temperature grades and lifetime fixed in EDEF-01',
      'Foundry qualification data received',
    ],
    exit: [
      'Retention target stated for every temperature grade',
      'Endurance target stated for every region with its write rate',
      'Reflow survival and stress plan agreed with the foundry',
    ],
    dependsOn: ['MRAM-01', 'EDEF-01', 'EIPR-05'],
    dependsNote: null,
    feedsInto: ['MRAM-02', 'MRAM-06', 'EMP-01', 'EMP-03'],
    measuredBy: [
      'Customer-facing targets backed by foundry or programme data',
      'Temperature grades with a stated retention target',
      'Reflow passes survived in the foundry data against the plan',
    ],
    links: {
      dependsOn: ['MRAM-01', 'EDEF-01', 'EIPR-05'],
      feedsInto: ['MRAM-06', 'EMP-01', 'EMP-03'],
      runsWith: ['MRAM-02'],
      revisedBy: ['FCD-03'],
      feedsBackInto: ['MRAM-02'],
    },
    terms: ['eMRAM', 'JEDEC', 'AEC', 'HTS'],
  },
  'MRAM-04': {
    criticalPath: false,
    purpose: [
      'Decide <b>how much magnetic field the part tolerates and what customers are told about it</b>: the fields in the target applications, the macro’s immunity in standby and in use, and whether the package needs a shield.',
      'MRAM stores data in magnetic orientation, so a strong enough field near the part can flip bits, and immunity during a write is lower than in standby. Flash customers never had to ask the question, so the part has to answer it in the datasheet before a design-in finds it in the field.',
    ],
    flowNote:
      'Step 1 surveys the fields the target applications expose the part to, and step 2 obtains the macro’s immunity data. Step 3 runs alongside step 2 because shielding options and their cost can be priced without waiting for the final immunity numbers, and step 4 sets the specification once both are in.',
    consumes: [
      'Target applications and end-use environments from EDEF-01',
      'eMRAM macro variant from MRAM-01',
      'Package candidates from EPKG-01',
      'Product cost model from EDEF-06',
      'Compliance expectations of the target markets from EDEF-04',
    ],
    rel: {
      'MRAM-D4':
        '<b>Magnetic immunity specification and customer guidance.</b> The field limits and the design-in guidance for customers are set and released here.',
    },
    risks: [
      '<b>Immunity never specified to customers.</b> A wearable with a magnetic clasp or a board beside a speaker finds the limit for the programme.',
      '<b>Only standby immunity measured.</b> A field that does nothing to stored data can corrupt a write in progress, and the specification must state both.',
      '<b>Shield added late to the package.</b> A shield changes the package outline and cost, and decided after EPKG-03 it reopens the leadframe or substrate design.',
      '<b>Field sources surveyed only for the lead application.</b> Wireless charging coils, motors and hearing aids each produce different fields, and the guidance must cover the markets sold into.',
      '<b>Immunity data taken at room temperature.</b> Thermal stability falls as temperature rises, so the tolerable field is lowest at the hot corner.',
    ],
    roles: [
      { r: 'Reliability engineer', d: 'Owns the immunity specification and its test basis' },
      { r: 'Memory IP lead', d: 'Macro immunity data in standby and active' },
      { r: 'Package architect', d: 'Shielding options and their effect on the package' },
      { r: 'Applications engineer', d: 'Field sources in the target applications' },
      { r: 'Technical writer', d: 'Customer guidance in the datasheet and application notes' },
    ],
    effort: [
      ['Application field survey', 0.5],
      ['Macro immunity data', 0.5],
      ['Shielding assessment', 0.5],
      ['Specification and guidance', 0.5],
    ],
    entry: [
      'Macro variant chosen in MRAM-01',
      'Target applications listed in EDEF-01',
      'Package candidates known from EPKG-01',
    ],
    exit: [
      'Field limits stated for standby and for active operation',
      'Shield decision recorded with its cost',
      'Customer guidance drafted for the datasheet',
    ],
    dependsOn: ['MRAM-01', 'EDEF-01', 'EPKG-01'],
    dependsNote:
      'The package is chosen in EPKG-01 from week 28, after this activity starts, so the shielding assessment prices options for each package candidate rather than for one package.',
    feedsInto: ['EPKG-03', 'EMP-09', 'EMP-11', 'MRAM-07'],
    measuredBy: [
      'Target application field sources covered by the specification',
      'Immunity margin at the hot corner against the stated limit',
      'Customer guidance published before the first design-in',
    ],
    links: {
      dependsOn: ['MRAM-01', 'EDEF-01'],
      feedsInto: ['EPKG-03', 'EMP-09', 'EMP-11', 'MRAM-07'],
      runsWith: ['EPKG-01'],
      revisedBy: ['EDEF-06'],
      feedsBackInto: [],
    },
    terms: ['MRAM', 'eMRAM', 'FIT'],
  },
  'MRAM-05': {
    criticalPath: true,
    purpose: [
      'Bring the <b>eMRAM macro and its controller into the design as qualified views</b>: checked against the PDK, integrated in RTL and the behavioural models, placed in the floorplan and verified across the signoff corners.',
      'A macro arrives as a set of views from a vendor, and each one can be for the wrong PDK version, missing a corner or inconsistent with the others. Physical design cannot start placement on views nobody has checked, so this activity is where the macro stops being a licence and becomes a block the chip can be built with.',
    ],
    flowNote:
      'Step 1 checks the delivered views against the PDK version, and step 2 integrates the macro and controller in RTL. Step 3 places the macro with its keep-outs and supplies, and step 4 runs alongside it, verifying the timing and power views across corners while placement settles. Step 5 releases the qualified views.',
    consumes: [
      'Macro licence and delivery schedule from MRAM-01',
      'Controller, ECC and trim specification from MRAM-02',
      'PDK version and change notices from EPDK-01',
      'Signoff corner definition from EPDK-11',
      'Chip-level floorplan and pad ring plan from EARCH-08',
    ],
    rel: {
      'MRAM-D5':
        '<b>eMRAM hard macro views, released.</b> The views are checked, integrated, placed and released to physical design here.',
    },
    risks: [
      '<b>Macro views late from the vendor.</b> Integration then runs on a placeholder, and the real views arrive with pin and timing changes RTL and physical design both have to absorb.',
      '<b>Views on an older PDK version.</b> A macro characterised on a superseded PDK fails DRC or misses timing on the current one, and the fix is a vendor redelivery.',
      '<b>Corners missing from the timing views.</b> A .lib without the low-voltage or hot corner leaves signoff silently unable to check the case that matters.',
      '<b>Keep-out and supply rules treated as advice.</b> Routing over the array or sharing its supply with noisy logic erodes the read margin the ECC was sized against.',
      '<b>Behavioural model out of step with the controller.</b> Verification against a model that returns data a cycle early passes tests the silicon fails.',
    ],
    roles: [
      { r: 'Memory IP lead', d: 'Owns view qualification and release' },
      { r: 'IP integration lead', d: 'RTL integration and version manifest' },
      { r: 'Physical architect', d: 'Macro placement, keep-outs and supply' },
      { r: 'Signoff methodology lead', d: 'Timing and power views across the corners' },
      { r: 'Verification architect', d: 'Behavioural model accuracy against the controller' },
    ],
    effort: [
      ['View check against the PDK', 1],
      ['RTL and behavioural model integration', 2],
      ['Floorplan placement and keep-outs', 1.5],
      ['Timing and power view verification', 2],
      ['Release to physical design', 0.5],
    ],
    entry: [
      'Macro views delivered by the vendor',
      'Controller specification released from MRAM-02',
      'Signoff corners defined in EPDK-11',
    ],
    exit: [
      'Every view checked against the current PDK version',
      'Timing and power views complete for every signoff corner',
      'Macro placed with keep-outs and supply agreed with physical design',
    ],
    dependsOn: ['MRAM-01', 'MRAM-02', 'EPDK-01', 'EPDK-11', 'EARCH-08'],
    dependsNote: null,
    feedsInto: ['ERTL-07', 'EDV-02', 'EPD-01', 'EPD-02', 'MRAM-07'],
    measuredBy: [
      'Views delivered against the licence schedule',
      'Signoff corners covered by the timing and power views',
      'View defects found after release to physical design',
    ],
    links: {
      dependsOn: ['MRAM-01', 'MRAM-02', 'EPDK-01', 'EPDK-11', 'EARCH-08'],
      feedsInto: ['ERTL-07', 'EDV-02', 'EPD-01', 'EPD-02', 'MRAM-07'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['PDK', 'LEF', '.lib', 'KOZ', 'DRC'],
  },
  'MRAM-06': {
    criticalPath: true,
    purpose: [
      'Define <b>how every eMRAM instance is tested, repaired and trimmed at sort</b>: the MBIST algorithms for its failure modes, the redundancy allocation, the per-die trim and the screens for weak retention and read disturb.',
      'MRAM fails differently from SRAM: bits drift under bake, flip under repeated reads and need a reference trimmed per die before they read reliably. A test flow borrowed from SRAM misses those modes, and one that covers them without a test-time budget can break the cost model on its own.',
    ],
    flowNote:
      'Step 1 defines the MBIST algorithms, and step 2 allocates redundancy against the faults they find. Step 3 defines trim at sort with its time budget, and step 4 runs alongside it because the bake and read-disturb screens share the same insertions and have to be costed together. Step 5 releases the flow to test development.',
    consumes: [
      'Controller, ECC and trim specification from MRAM-02',
      'Retention and endurance stress plan from MRAM-03',
      'MBIST and repair architecture from EDFT-05',
      'eFuse and memory repair infrastructure from EDFT-07',
      'Test coverage and test-time targets from EDFT-02',
    ],
    rel: {
      'MRAM-D6':
        '<b>eMRAM test, repair and trim flow.</b> The algorithms, repair allocation, trim and screens are defined and released to test development here.',
    },
    risks: [
      '<b>Trim time at sort blows the test cost model.</b> A per-die reference search across every bank can take longer than the rest of sort, and nobody costs it until the program runs.',
      '<b>SRAM march algorithms reused unchanged.</b> They find stuck bits but not the read-disturb and weak-retention modes specific to MRAM.',
      '<b>Retention bake screen left out to save time.</b> Weak bits pass a cold read at sort and fail in the field after the first months at temperature.',
      '<b>Repair budget spent at sort, none left for ECC.</b> A die repaired to its limit and shipped relies on ECC for every later failure, which the end-of-life error budget did not assume.',
      '<b>Trim result stored where the flow cannot verify it.</b> A trim value written without a read-back check ships parts that read with the default reference.',
    ],
    roles: [
      { r: 'Test engineer', d: 'Owns the flow, its insertions and its time budget' },
      { r: 'DFT memory lead', d: 'MBIST controller and repair architecture' },
      { r: 'Memory IP lead', d: 'Macro failure modes and the vendor’s test guidance' },
      { r: 'Reliability engineer', d: 'Bake and read-disturb screen conditions' },
      { r: 'Product engineering', d: 'Test cost against the cost model' },
    ],
    effort: [
      ['MBIST algorithm definition', 1.25],
      ['Redundancy and repair allocation', 1],
      ['Sort-time trim and budget', 1.25],
      ['Bake and read-disturb screens', 1],
      ['Release to test development', 0.5],
    ],
    entry: [
      'Controller and trim specification released from MRAM-02',
      'MBIST architecture defined in EDFT-05',
      'Stress plan available from MRAM-03',
    ],
    exit: [
      'Every eMRAM failure mode mapped to an algorithm or screen',
      'Trim time per die within the sort budget',
      'Flow released to test development with its repair allocation',
    ],
    dependsOn: ['MRAM-02', 'MRAM-03', 'EDFT-05', 'EDFT-07'],
    dependsNote: null,
    feedsInto: ['EDFT-08', 'ETEST-01', 'ETEST-06', 'MRAM-07'],
    measuredBy: [
      'eMRAM failure modes covered by the flow',
      'Sort time per die for eMRAM test and trim against budget',
      'Repair capacity left after sort on first-lot wafers',
    ],
    links: {
      dependsOn: ['MRAM-02', 'MRAM-03', 'EDFT-05', 'EDFT-07'],
      feedsInto: ['EDFT-08', 'ETEST-01', 'ETEST-06', 'MRAM-07'],
      runsWith: [],
      revisedBy: ['EDFT-02'],
      feedsBackInto: ['EDFT-05'],
    },
    terms: ['MBIST', 'BIRA', 'BISR', 'ATE', 'eMRAM'],
  },
  'MRAM-07': {
    criticalPath: true,
    purpose: [
      'Sign off the <b>eMRAM as integrated, not just as delivered</b>: timing and IR drop at the macro pins in the chip layout, the reliability rules around it, and every waiver still open with the vendor.',
      'The macro was qualified by the vendor in its own test environment. What has to be signed here is that it still meets its margins inside this floorplan, on this supply network, with these keep-outs, and that the customer guidance from the stage is complete.',
    ],
    flowNote:
      'Step 1 reviews timing and IR drop at the macro pins, and step 2 confirms the reliability rules. Step 3 runs alongside step 2 because the vendor waivers are mostly about the same rules and are closed in the same review, and step 4 signs the integration off.',
    consumes: [
      'Released eMRAM views and placement from MRAM-05',
      'eMRAM test, repair and trim flow from MRAM-06',
      'Magnetic immunity specification from MRAM-04',
      'Early power network and IR analysis from EPD-03',
      'Flow setup and trial placement on the N0 netlist from EPD-01',
    ],
    rel: {
      'MRAM-D7':
        '<b>eMRAM integration signoff.</b> The integration is reviewed, the vendor waivers are closed and the signoff is recorded here.',
    },
    risks: [
      '<b>Signoff on a trial layout treated as final.</b> The review runs before the final physical design turn, so a later floorplan change has to reopen it.',
      '<b>IR drop at the macro pins above the vendor limit.</b> The array draws its largest current during a write, and a supply that droops then reduces write margin across the corner.',
      '<b>Vendor waivers accepted without a limit.</b> A waiver without a stated condition becomes permanent, and the next vendor release cannot be checked against it.',
      '<b>Electromigration on the write supply unchecked.</b> Write currents are high and bursty, and average-current EM checks understate them.',
      '<b>Magnetic guidance not carried into the documentation.</b> The specification exists, but the datasheet goes out without it.',
    ],
    roles: [
      { r: 'Memory IP lead', d: 'Owns the signoff and the vendor waiver list' },
      { r: 'Power delivery engineer', d: 'IR drop and EM at the macro supply pins' },
      { r: 'Timing closure lead', d: 'Macro pin timing in the chip layout' },
      { r: 'Reliability engineer', d: 'Keep-out, EM and magnetic rules' },
      { r: 'Memory IP vendor liaison', d: 'Waiver disposition on the vendor side' },
    ],
    effort: [
      ['Post-layout timing and IR review', 0.75],
      ['Reliability rule check', 0.5],
      ['Vendor waiver closure', 0.5],
      ['Signoff record', 0.25],
    ],
    entry: [
      'Views released and placed in MRAM-05',
      'Trial placement and early IR results from EPD-01 and EPD-03',
      'Test flow released from MRAM-06',
    ],
    exit: [
      'Macro pin timing and IR drop within the vendor limits',
      'Every vendor waiver closed or accepted with its condition',
      'Signoff recorded with the conditions for reopening it',
    ],
    dependsOn: ['MRAM-05', 'MRAM-06', 'MRAM-04', 'EPD-01', 'EPD-03'],
    dependsNote:
      'The signoff at week 46 is taken on the trial placement and early IR results, before the final physical design turn. ESO-03 and ESO-05 repeat the macro checks on the final database, and a change to the macro’s placement or supply after this point reopens it.',
    feedsInto: ['ESO-03', 'ESO-05', 'EMP-11'],
    measuredBy: [
      'Macro pin timing slack and IR margin at signoff',
      'Vendor waivers open at signoff',
      'Signoff reopened by later layout changes',
    ],
    links: {
      dependsOn: ['MRAM-05', 'MRAM-06', 'MRAM-04', 'EPD-01'],
      feedsInto: ['ESO-03', 'ESO-05', 'EMP-11'],
      runsWith: ['EPD-03'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['EM', 'IR', 'KOZ', 'EM/IR'],
  },
};
