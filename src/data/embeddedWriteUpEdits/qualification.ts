import type { WriteUpEdit } from './types';

/** MP: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const MP_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'MP-01': {
    consumes: [
      'Product requirements and quality target from DEF-01',
      'Application and use conditions from DEF-05',
      'Retention, endurance and reflow survival plan from MRAM-03',
      'Magnetic immunity specification from MRAM-04',
      'Customer qualification requirements',
      'Package construction from EPKG-06',
      'Unit availability from EASSY-05',
    ],
    risks: [
      '<b>Chamber capacity booked late.</b> Stress duration is fixed and capacity is shared, so a late booking moves mass production directly.',
      '<b>Sample sizes below the confidence the claim needs.</b> A reliability claim from too few units does not support the specification.',
      '<b>Customer requirements collected after the plan.</b> A customer-specific stress discovered later restarts a months-long campaign.',
      '<b>Three lots not planned.</b> Standards generally require multiple production lots, and a single-lot qualification is not accepted.',
      '<b>Use conditions assumed rather than specified.</b> The acceleration factors depend on them, and wrong conditions make the whole campaign non-representative.',
      '<b>eMRAM stresses planned as an afterthought.</b> Data-retention bake, write endurance and reflow survival are not in a logic-only stress matrix, and they are the first things a customer storing code in the part will ask for.',
    ],
    exit: [
      'Chamber capacity booked against the full stress duration',
      'Sample sizes supporting the reliability claim',
      'eMRAM retention, endurance and reflow survival in the stress matrix',
      'Customer-specific requirements included before release',
    ],
    terms: ['HTOL', 'JEDEC', 'AEC', 'eMRAM'],
  },
  'MP-02': {
    flowNote:
      'Step 5 is the split that decides who acts. Die yield, assembly yield and test yield have different owners and different fixes, and a combined number tells none of them what to do. On this part die yield splits once more—logic yield, and eMRAM yield before and after repair—because the two have different causes and different fixes.',
    consumes: [
      'Test data infrastructure from TEST-10',
      'Fab yield data from FAB-02',
      'Assembly yield from EASSY-04',
      'Bring-up failure analysis from BU-05',
      'Cost model from DEF-06',
    ],
    entry: [
      'Test data infrastructure running from TEST-10',
      'Fab and assembly yield data flowing',
      'Cost model available from DEF-06',
    ],
    terms: ['eMRAM'],
  },
  'MP-03': {
    purpose: [
      'Run the <b>reliability stresses</b>—HTOL, high-temperature storage, temperature cycling, uHAST, THB, and the eMRAM data-retention bake and write-endurance cycling—that demonstrate the silicon and its stored data survive their specified life.',
      'This is eighteen weeks of mostly waiting, and it is the longest fixed-duration item between first silicon and mass production. HTOL alone is a thousand hours and the retention bake runs as long; neither can be shortened, only started earlier or run in parallel, and endurance cycling to the specified write count takes weeks of its own per lot.',
    ],
    consumes: [
      'Qualification plan from MP-01',
      'Retention, endurance and reflow survival plan from MRAM-03',
      'Qualification units from EASSY-05',
      'Pre-stress characterization from TEST-09',
      'Chamber capacity from MP-01',
      'Failure analysis capability',
    ],
    risks: [
      '<b>Campaign started late.</b> The duration is fixed, so every week of delay is a week of mass production delay, one for one.',
      '<b>No pre-stress characterization.</b> Drift cannot be measured without a baseline, and a failure cannot be distinguished from a part that was always marginal.',
      '<b>Interim readouts skipped.</b> Failures then arrive only at the end, with no time left to respond before the ramp.',
      '<b>eMRAM bit errors read only as pass or fail.</b> Retention loss and endurance wear are distributions; the bit-error count at each readout is what predicts the fail rate the datasheet has to state.',
      '<b>Stress failures not analyzed.</b> A failure without a mechanism cannot be judged as systematic or as a one-off, and the distinction decides the ramp.',
      '<b>Units insufficient for the full matrix.</b> A stress dropped for lack of units is a gap in the qualification the customer will find.',
    ],
    roles: [
      { r: 'Reliability engineer', d: 'Owns the stress campaign' },
      { r: 'Test engineer', d: 'Pre-stress, readout and eMRAM bit-error measurement' },
      { r: 'Failure analysis engineer', d: 'Stress failure mechanisms' },
      { r: 'Quality engineer', d: 'Acceptance against the standard' },
      { r: 'Lab technician', d: 'Chamber operation and readout scheduling' },
    ],
    effortLabels: [
      'HTOL execution',
      'Temperature cycle, HTS and eMRAM retention bake',
      'Readout and analysis',
      'uHAST and THB',
      'Interim readouts',
      'eMRAM endurance and failure analysis',
    ],
    exit: [
      'Pre-stress baseline recorded for every unit',
      'Interim readouts taken at the planned intervals',
      'eMRAM retention and endurance demonstrated to the specified retention life and write count',
      'Every stress failure analyzed to a mechanism',
    ],
    measuredBy: [
      'Campaign start against plan',
      'Failures per stress against the acceptance criterion',
      'eMRAM bit errors after retention bake and endurance cycling',
      'Failures analyzed to a mechanism',
    ],
    terms: ['HTOL', 'HTS', 'THB', 'uHAST', 'eMRAM'],
  },
  'MP-04': {
    purpose: [
      'Qualify the part’s <b>ESD and latch-up robustness</b>—human-body and charged-device discharge (HBM, CDM) and latch-up immunity—the handling-survival properties every downstream user depends on.',
      'ESD failures happen in assembly lines, in labs and in the field, and they are almost never traced back to the part that could not take them. The classification levels are what tell a customer’s manufacturing engineer how to handle the device.',
    ],
    flowNote:
      'Step 3’s pin classification is where a small package still bites. With dozens of GPIO sharing supply and ground groups, a pin combination assumed to share protection that does not is the untested path a field event finds. CDM scales with package capacitance, so on a package this small it is rarely the binding level—which is exactly why it is easy to under-test.',
    consumes: [
      'I/O and ESD library qualification from PDK-06',
      'ESD and latch-up verification from SO-06',
      'Package construction from EPKG-06',
      'Qualification plan from MP-01',
      'Qualification units from EASSY-05',
      'ESD test laboratory capability',
    ],
    risks: [
      '<b>CDM assumed easy because the package is small.</b> A small package stores less charge, but a weak protection path on one pin fails regardless, and a customer’s automated handling will find it.',
      '<b>ESD failures not analyzed.</b> Which pin and which protection element failed is what makes the result actionable for a fix.',
      '<b>Latch-up tested only at room temperature.</b> Latch-up susceptibility increases with temperature, and the hot corner is the real test.',
      '<b>Classification below what customer assembly requires.</b> A part that cannot survive a customer’s line is a part they cannot buy.',
      '<b>Pin classification incomplete.</b> Untested pin combinations are unqualified pins, and there is no assumption to fall back on.',
    ],
  },
  'MP-05': {
    purpose: [
      'Validate the design across <b>process corners</b> using split lots—material deliberately fabricated at the edges of the process window.',
      'Production silicon spans the process distribution, and the units bring-up characterized came from one lot near its center. Split lots produce the fast and slow corners on purpose, which is the only way to know whether the design’s margin survives the population it will actually be built from. On this part the fast corner matters as much for leakage as for timing—it sets the sleep-current tail—and the eMRAM module’s own process window moves write margin and retention.',
    ],
    terms: ['Shmoo', 'eMRAM'],
  },
  'MP-06': {
    purpose: [
      'Qualify the <b>package</b>—moisture sensitivity and eMRAM data survival through reflow, board-level reliability, drop and bend—on a QFN or chip-scale package that customers solder to their own boards.',
      'The silicon’s reliability is a well-understood function of process and use conditions. The package’s depends on how it is built and how the customer mounts it: the solder joints and exposed pad of a QFN, or the small joints of a chip-scale package on a thin board, set board-level life. On this part reflow is also a stress on the eMRAM—data programmed before assembly has to survive the solder profile.',
    ],
    flowNote:
      'Step 1 is the one peculiar to this product. Customers either program code into the eMRAM before mounting or buy the part pre-programmed, and MSL preconditioning with a data check before and after reflow is what proves both work. Step 3 then turns the rest of the campaign into a predictive model rather than a single data point, so the next package variant can be assessed without repeating twelve weeks of testing.',
    consumes: [
      'Qualification plan from MP-01',
      'Package units from EASSY-05',
      'Reflow survival plan from MRAM-03',
      'Package construction from EPKG-06',
      'Package thermal and mechanical model from EPKG-04',
      'Board-level test capability',
    ],
    risks: [
      '<b>MSL classification worse than the assembly process needs.</b> A high moisture sensitivity forces bake-and-handle procedures on every customer line.',
      '<b>Board-level reliability short of the application requirement.</b> The joints, not the die, then set the product’s life.',
      '<b>eMRAM data lost through reflow.</b> Code programmed before assembly that does not survive the solder profile forces every customer to program after mounting, which changes their manufacturing flow.',
      '<b>Warpage measured only before stress.</b> The interesting change is what stress does to it, and that requires measurement through the campaign.',
      '<b>Failures attributed to the package without analysis.</b> A die-attach failure and a solder joint failure need different fixes and look similar from outside.',
    ],
    roles: [
      { r: 'Package reliability engineer', d: 'Owns package qualification' },
      { r: 'Package engineer', d: 'Construction and failure mechanism' },
      { r: 'Materials engineer', d: 'Solder joint and die-attach behavior' },
      { r: 'Quality engineer', d: 'Standard compliance and acceptance' },
      { r: 'Failure analysis engineer', d: 'Package failure localization' },
    ],
    effortLabels: [
      'Board-level reliability',
      'Drop and bend testing',
      'MSL preconditioning and eMRAM reflow check',
      'Readout and acoustic imaging',
      'Joint reliability correlation',
      'Warpage tracking',
    ],
    entry: [
      'Qualification plan from MP-01',
      'Package units available from EASSY-05',
      'Reflow survival plan available from MRAM-03',
    ],
    exit: [
      'MSL classification compatible with customer assembly',
      'Board-level life meeting the application requirement',
      'eMRAM data retained through the qualified reflow profile',
    ],
    measuredBy: [
      'MSL level achieved',
      'Board-level cycles to failure against requirement',
      'eMRAM bit errors after reflow',
      'Correlation between measured and modelled joint life',
    ],
    terms: ['MSL', 'QFN', 'eMRAM'],
  },
  'MP-08': {
    purpose: [
      'Commit the <b>supply chain and the ramp</b>—wafers, leadframes or substrates, assembly and test capacity, and the EVK’s components—against a demand forecast, with the lead times and second sources that make the commitment real.',
      'A ramp is a chain of commitments made months before the volume they serve. Mature-node capacity is shared with every long-lived industrial and automotive part on the same process, eMRAM-capable capacity is narrower than the base process, and the EVK needs its own components on the shelf when the part launches. Any one of them short stops the ramp, and none of them can be fixed quickly.',
    ],
    consumes: [
      'Demand forecast from DEF-01 and product marketing',
      'Yield model from MP-02',
      'Test throughput from MP-10',
      'Package material supply and OSAT from EPKG-05',
      'EVK production release from EVKL-04',
    ],
    risks: [
      '<b>Mature-node capacity assumed plentiful.</b> These nodes are loaded with long-lived parts and eMRAM-capable capacity is narrower still; a start plan without committed capacity is a hope.',
      '<b>Package material lead time underestimated.</b> Leadframes and chip-scale substrates are ordinary until an allocation hits, and the buffer has to reflect that.',
      '<b>Ramp planned against an optimistic yield.</b> Volume commitments then require more wafer starts than were booked.',
      '<b>No second source anywhere in the chain.</b> Every single-source node is a single point of failure for the whole product.',
      '<b>Capacity committed before the readiness review.</b> A conditional readiness outcome then meets an unconditional supply commitment.',
    ],
    terms: ['OSAT', 'EVK'],
  },
  'MP-09': {
    purpose: [
      'Obtain the <b>compliance and certification</b> the product cannot ship without—magnetic immunity against the published eMRAM guidance, EMC and safety, materials declarations and export classification.',
      'These are gates rather than engineering activities: without RoHS and REACH declarations, an export classification and a measured magnetic immunity figure, the product cannot be sold into most markets—or designed in next to a motor, a speaker or a magnetic latch—regardless of how well it works.',
    ],
    flowNote:
      'Step 2 is the one peculiar to this part. eMRAM stores bits in magnetic tunnel junctions, and an external field strong enough can disturb them; the immunity has to be measured on silicon in standby, read and write, compared with the guidance MRAM-04 published to customers, and the guidance corrected if the silicon disagrees.',
    consumes: [
      'Magnetic immunity specification and customer guidance from MRAM-04',
      'Materials declarations from the supply chain',
      'Package construction from EPKG-06',
      'Applicable regulatory requirements',
      'EMC and safety results on the reference design from EVKL-03',
    ],
    risks: [
      '<b>Magnetic immunity characterized in one mode only.</b> Standby, read and write respond differently to a field, and a figure measured in standby overstates the part’s immunity while it is writing.',
      '<b>Materials declarations not collected from suppliers.</b> Every component in the package needs one, and collecting them takes months.',
      '<b>Compliance failure discovered at formal testing.</b> Pre-compliance testing exists precisely so that formal testing is a confirmation.',
      '<b>Export classification left late.</b> Even a low-power processor with security features and ML libraries needs a classification, and it determines which markets exist.',
      '<b>Certification scope assessed for one region.</b> Requirements differ by market, and a missing certification closes a region entirely.',
    ],
    roles: [
      { r: 'Compliance engineer', d: 'Owns certification and declarations' },
      { r: 'Reliability engineer', d: 'Magnetic immunity characterization and remediation' },
      { r: 'Regulatory affairs', d: 'Standards applicability and export classification' },
      { r: 'Supply chain', d: 'Supplier materials declarations' },
      { r: 'Product marketing', d: 'Target markets and their requirements' },
    ],
    effortLabels: [
      'Magnetic immunity characterization',
      'EMC and safety testing',
      'Materials compliance',
      'Certificate issue and registration',
      'Failure remediation',
      'Documentation and export',
    ],
    entry: [
      'Magnetic immunity specification available from MRAM-04',
      'Package construction and materials known from EPKG-06',
      'Target markets defined',
    ],
    exit: [
      'Magnetic immunity measured on silicon and published',
      'Materials declarations collected for every component',
      'Export classification completed before shipment',
    ],
    measuredBy: [
      'Certifications obtained against required',
      'Magnetic immunity measured against the published guidance',
      'Markets open at launch',
    ],
    terms: ['EMC', 'RoHS', 'REACH', 'eMRAM'],
  },
  'MP-10': {
    risks: [
      '<b>Site-to-site bias undetected.</b> It appears as a yield difference and is investigated as a process problem for weeks.',
      '<b>Pin count insufficient for the site count.</b> The tester configuration from <code>TEST-02</code> bounds this, and it cannot be changed now.',
      '<b>Parallel current measurement not isolated.</b> A site measuring microamp sleep current next to one running at full activity picks up its noise, and the result is site-dependent current failures.',
      '<b>Conversion done after the ramp starts.</b> Capital is then committed at single-site throughput and cannot be recovered.',
      '<b>Time reduction changing coverage.</b> Any content change after MP-07 requires re-qualification, which is expensive at this point.',
    ],
    exit: [
      'Site-to-site bias measured and within tolerance',
      'Current measurement isolated between sites',
      'Conversion complete before capital is committed to the ramp',
    ],
  },
  'MP-11': {
    consumes: [
      'Characterization data from TEST-09 and BU-08',
      'Errata list from BU-09',
      'Performance and energy results from BU-10 and CREL-04',
      'Compliance classifications and magnetic immunity from MP-09',
      'Programming model from RTL-04, with the SDK documentation from SDK-05',
    ],
  },
};
