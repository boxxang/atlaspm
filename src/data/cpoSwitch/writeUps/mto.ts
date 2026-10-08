/**
 * MTO — Tapeout & Mask Release, written up.
 */
import type { CpoWriteUps } from '../types';

export const MTO_WRITE_UPS: CpoWriteUps = {
  'MTO-01': {
    criticalPath: true,
    purpose: [
      'Hand the Switch SoC to its foundry: <b>intake accepted, tapeout checklist complete, mask data preparation reviewed and the mask set released</b>, with the first lots started at the priority the schedule needs.',
      'The largest mask set in the program is also the most expensive to get wrong. Foundry intake rejects for format, layer mapping or rule-deck revision are routine; what matters is that they are cleared within the slot, and that someone reviews the mask data preparation output on the critical layers rather than assuming the foundry will catch every problem.',
    ],
    flowNote:
      'Step 1 submits the GDS and clears intake rejections, with the checklist completed in parallel in step 2. Step 3 reviews mask data preparation, step 4 approves the reticle and mask order while step 5 confirms the first-lot start alongside it, and step 6 releases the mask set.',
    consumes: [
      'Switch SoC final GDS and signoff report from SGNO-01',
      'Final equivalence and DFT signoff from SGNO-07',
      'Security signoff record from SGNO-08',
      'Go decision for the Switch SoC from SGNO-10',
      'Foundry slot and mask order reservation from the foundry agreement in TRDY-01',
    ],
    rel: {
      'MTO-D1': '<b>Switch SoC mask release record and foundry handoff checklist.</b> Produced here; it records the database identifier the foundry accepted and the date masks were released.',
      'MTO-D5': '<b>Tapeout archive and silicon configuration baseline.</b> The accepted database and mask revision become the Switch SoC entry in the baseline.',
    },
    risks: [
      '<b>Intake rejection late in the slot.</b> A format or layer-map rejection arrives after the cutoff and the slot moves by weeks.',
      '<b>Mask data preparation not reviewed.</b> An OPC or fill anomaly on a critical layer reaches the wafers because nobody looked at the job output.',
      '<b>Wrong database submitted.</b> The GDS uploaded is not the one every signoff report quotes.',
      '<b>Frame content forgotten.</b> Process monitor or scribe structures the program needs for correlation are missing from the reticle.',
      '<b>First-lot priority not secured.</b> The lots start at standard priority and first silicon slips by weeks.',
    ],
    roles: [
      { r: 'Physical design', d: 'Owns the Switch SoC tapeout submission' },
      { r: 'Foundry interface engineer', d: 'Intake checks, checklist and mask data review' },
      { r: 'Technology and foundry manager', d: 'Mask order, slot and lot priority with the foundry' },
      { r: 'Configuration manager', d: 'Confirms the submitted database identifier' },
      { r: 'Program TPM', d: 'Tracks the tapeout against the slot and escalates rejections' },
    ],
    effort: [
      ['Submission and intake resolution', 3],
      ['Tapeout checklist', 1.5],
      ['Mask data preparation review', 3],
      ['Reticle and mask order approval', 1.5],
      ['Lot start and release record', 1],
    ],
    entry: [
      'Go decision for the Switch SoC recorded in SGNO-10',
      'Final GDS released with its database identifier',
      'Mask slot confirmed by the foundry',
    ],
    exit: [
      'Foundry intake accepts the database with zero open rejections',
      'Mask data preparation results on every critical layer reviewed and signed by the foundry interface engineer',
      'Mask set released and first lots started on the committed date',
    ],
    dependsOn: ['SGNO-01', 'SGNO-07', 'SGNO-10'],
    dependsNote: null,
    feedsInto: ['WFAB-01', 'MTO-05'],
    measuredBy: [
      'Foundry intake rejections and days to clear',
      'Tapeout date against the reserved slot',
      'Critical layers with a reviewed mask data preparation job',
    ],
    links: {
      dependsOn: ['SGNO-01', 'SGNO-07', 'SGNO-08', 'SGNO-10'],
      feedsInto: ['WFAB-01', 'MTO-05'],
      runsWith: ['MTO-02'],
      revisedBy: ['SDBG-05'],
      feedsBackInto: [],
    },
    terms: ['GDS', 'OPC', 'MDP', 'Tapeout checklist'],
  },
  'MTO-02': {
    criticalPath: true,
    purpose: [
      'Tape out the I/O die — <b>its own mask set, separate from the Switch SoC</b> — with the analog-specific checklist items closed and the die-to-die test structures placed for characterization.',
      'The analog checklist is where I/O tapeouts go wrong quietly: matching-sensitive devices, ESD structures and test structures for characterization need foundry acknowledgement that the digital checklist does not ask for.',
    ],
    flowNote:
      'Step 1 prepares the I/O die database and step 2 submits it to intake, with the analog checklist items closed in parallel in step 3. Step 4 reviews mask data preparation on the analog-critical layers and step 5 releases.',
    consumes: [
      'I/O die signoff report and final GDS from SGNO-02',
      'Go decision for the I/O die from SGNO-10',
      'Die-to-die interface revision confirmed against the Switch SoC tapeout in MTO-01',
      'Foundry analog tapeout checklist',
      'Characterization test structure list from SerDes design',
    ],
    rel: {
      'MTO-D2': '<b>I/O die tapeout record.</b> Produced here; it records the I/O die revision, its mask set and the die-to-die interface revision it was taped out against.',
      'MTO-D5': '<b>Tapeout archive and silicon configuration baseline.</b> The I/O revision taped out is recorded in the baseline.',
    },
    risks: [
      '<b>Stale database submitted.</b> The I/O die GDS sent to the foundry is not the revision signed off in SGNO-02.',
      '<b>Analog layers not reviewed.</b> Mask data preparation alters a matched structure and nobody checks.',
      '<b>Test structures dropped.</b> Characterization structures are removed for area and the I/O cannot be correlated.',
      '<b>Separate die slot missed.</b> A standalone I/O die tapes out later than the switch and delays the package.',
      '<b>ESD structure change.</b> A foundry-requested ESD change is accepted without rerunning performance.',
    ],
    roles: [
      { r: 'SerDes and high-speed I/O', d: 'Owns the I/O die tapeout' },
      { r: 'Physical design lead', d: 'Prepares the I/O die tapeout database and reticle frame' },
      { r: 'Foundry interface engineer', d: 'Intake and analog checklist' },
      { r: 'Analog layout designer', d: 'Reviews analog-critical mask data' },
      { r: 'Configuration manager', d: 'Records the revision taped out' },
    ],
    effort: [
      ['Database preparation', 1],
      ['Intake and checklist', 1.5],
      ['Mask data review', 1],
      ['Release record', 0.5],
    ],
    entry: [
      'I/O die signed off in SGNO-02 with a go decision in SGNO-10',
      'Die-to-die interface revision matched to the Switch SoC tapeout',
      'Analog checklist items listed by the foundry',
    ],
    exit: [
      'Foundry intake accepts the I/O die database with zero open rejections',
      'Every analog checklist item acknowledged by the foundry',
      'Tapeout record states the I/O revision and the mask set it went on',
    ],
    dependsOn: ['SGNO-02', 'SGNO-10'],
    dependsNote: null,
    feedsInto: ['WFAB-02', 'MTO-05'],
    measuredBy: [
      'Intake rejections for the I/O die database',
      'Analog checklist items open at submission',
      'Tapeout date against the Switch SoC tapeout',
    ],
    links: {
      dependsOn: ['SGNO-02', 'SGNO-10'],
      feedsInto: ['WFAB-02', 'MTO-05'],
      runsWith: ['MTO-01'],
      revisedBy: ['SDBG-05'],
      feedsBackInto: [],
    },
    terms: ['SerDes', 'GDS', 'ESD'],
  },
  'MTO-03': {
    criticalPath: false,
    purpose: [
      'Release the <b>bridge or interposer and the silicon capacitors</b> to their foundry, with the metal stack and capacitor process options confirmed and the release timed against substrate tooling and the first assembly.',
      'These parts are needed at assembly, not at bring-up, so their release can trail the dies by a week — but no further, because bridge wafers and substrates must both be in hand when the known-good dies are.',
    ],
    flowNote:
      'Step 1 submits the databases and step 2 closes the checklist, with the release date checked against substrate tooling and assembly in parallel in step 3. Step 4 releases the mask orders.',
    consumes: [
      'Bridge / interposer and silicon capacitor signoff from SGNO-05',
      'Multi-die package signoff from SGNO-06',
      'Go decision from SGNO-10',
      'Substrate tooling date from the substrate release in SGNO-11',
      'First assembly date from PKGA-02',
    ],
    rel: {
      'MTO-D3': '<b>Bridge / interposer and silicon capacitor mask release record.</b> Produced here.',
      'MTO-D5': '<b>Tapeout archive and silicon configuration baseline.</b> The bridge and capacitor revisions are recorded in the baseline.',
    },
    risks: [
      '<b>Released before package signoff.</b> The bridge goes out before cross-die timing has confirmed its channels.',
      '<b>Released too late.</b> Bridge wafers arrive after the known-good dies and assembly waits.',
      '<b>Metal stack mismatch.</b> The option ordered differs from the one signed off.',
      '<b>Capacitor option not ordered.</b> The capacitor process module is omitted from the order.',
      '<b>Low priority at the foundry.</b> Small mask sets queue behind larger customers.',
    ],
    roles: [
      { r: 'Packaging', d: 'Owns the bridge and capacitor release' },
      { r: 'Foundry interface engineer', d: 'Intake and checklist' },
      { r: 'Technology and foundry manager', d: 'Mask order and priority' },
      { r: 'Manufacturing planner', d: 'Aligns release to assembly' },
      { r: 'Configuration manager', d: 'Records the revisions released' },
    ],
    effort: [
      ['Submission and intake', 0.5],
      ['Checklist and options', 0.5],
      ['Schedule alignment', 0.5],
      ['Release', 0.5],
    ],
    entry: [
      'Bridge and capacitors signed off in SGNO-05',
      'Multi-die package signoff complete in SGNO-06',
      'First assembly date set in the build plan',
    ],
    exit: [
      'Foundry intake accepts both databases with zero open rejections',
      'Ordered metal stack and capacitor options match the signed-off ones',
      'Committed wafer-out date precedes the first assembly start with at least two weeks margin',
    ],
    dependsOn: ['SGNO-05', 'SGNO-06', 'SGNO-10'],
    dependsNote: null,
    feedsInto: ['WFAB-05', 'MTO-05'],
    measuredBy: [
      'Intake rejections',
      'Wafer-out date against the first assembly',
      'Option mismatches found at order review',
    ],
    links: {
      dependsOn: ['SGNO-05', 'SGNO-06', 'SGNO-10'],
      feedsInto: ['WFAB-05', 'MTO-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Bridge', 'Interposer', 'Si capacitor'],
  },
  'MTO-04': {
    criticalPath: true,
    purpose: [
      'Plan the wave 2 wafers before they start: <b>Switch SoC and I/O die first wafer starts sized from the known-good-die yield assumption, corner and skew lot splits for characterization, engineering lot hold points before metal and a reserve for re-spin and qualification</b>.',
      'A co-packaged switch multiplies die yields: a main package needs a good Switch SoC, a good I/O die, a good bridge and several known-good optical engines. Starts sized for one die’s yield leave the first builds short. The optical silicon was planned in OTO-03 with its own splits; this plan sizes the wave 2 dies to the same build matrix, so the two waves arrive as matched kits.',
    ],
    flowNote:
      'Step 1 sizes the starts and step 2 defines the corner and skew splits. Step 3 plans engineering lot holds while step 4 reserves wafers alongside it, and step 5 releases the plan.',
    consumes: [
      'Wave 2 go decision from SGNO-10',
      'Engineering build matrix and quantities from PKGA-02',
      'Production test strategy and yield assumptions from TINF-01',
      'Long-lead material plan from TRDY-10',
      'Optical silicon wafer start plan from OTO-03',
    ],
    rel: {
      'MTO-D4': '<b>Switch SoC and I/O die wafer start plan with lot splits and engineering lot strategy.</b> Produced here; wave 2 fabrication, characterization and qualification draw their wafers from it.',
    },
    risks: [
      '<b>Starts sized for one die.</b> Compound yield across the dies in a main package leaves the first builds short of complete kits.',
      '<b>No corner lots.</b> All wafers run at nominal and characterization cannot bound process variation.',
      '<b>No engineering lot hold.</b> A bug a metal fix would cure needs a full re-spin because no wafers were held before metal.',
      '<b>Waves sized apart.</b> Wave 2 starts are sized without the optical engine yield, so dies wait for engines or engines for dies.',
      '<b>Splits not labelled.</b> Split wafers are not tracked to the dies they produce and the data cannot be separated.',
    ],
    roles: [
      { r: 'Manufacturing and NPI', d: 'Owns the wave 2 wafer start plan' },
      { r: 'Technology and foundry manager', d: 'Agrees splits and holds with the digital foundry' },
      { r: 'Validation lead', d: 'Defines the corners characterization needs' },
      { r: 'Reliability engineer', d: 'Qualification wafer needs' },
      { r: 'Program TPM', d: 'Approves the plan against the build schedule and the wave 1 plan' },
    ],
    effort: [
      ['Start sizing and compound yield', 1],
      ['Corner and skew splits', 1],
      ['Engineering lot holds and reserve', 0.5],
      ['Plan release', 0.5],
    ],
    entry: [
      'Wave 2 go decision recorded in SGNO-10',
      'Engineering build matrix available in draft from PKGA-02',
      'Optical silicon start plan released in OTO-03',
    ],
    exit: [
      'Planned good Switch SoC and I/O die kits cover every first build at the assumed compound yield with at least 30 percent margin',
      'Corner and skew lots defined for every wave 2 die that characterization or qualification needs',
      'Engineering lot hold points and wafer reserve confirmed by the foundry in writing',
    ],
    dependsOn: ['SGNO-10', 'TINF-01', 'OTO-03'],
    dependsNote: 'Needs the build matrix in draft; the matrix itself is finished in PKGA-02 against this plan.',
    feedsInto: ['WFAB-01', 'WFAB-02', 'WFAB-05', 'PKGA-02'],
    measuredBy: [
      'Planned good kits against first-build need',
      'Corner lots defined per die',
      'Wafers held before metal per die',
    ],
    links: {
      dependsOn: ['SGNO-10', 'TINF-01', 'TRDY-10', 'OTO-03'],
      feedsInto: ['WFAB-01', 'WFAB-02', 'WFAB-05', 'PKGA-02', 'CHAR-01', 'RELQ-01'],
      runsWith: ['PKGA-02'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Lot split', 'Corner lot', 'KGD', 'Compound yield'],
  },
  'MTO-05': {
    criticalPath: false,
    purpose: [
      'Archive every wave 2 database and freeze <b>the silicon configuration baseline across both waves</b> — the Switch SoC, the I/O die and the bridge from this wave, joined to the electrical and photonic IC baseline wave 1 recorded, with the substrates, the patterns and the boot ROM revision — so that debug, a stepping and the production release can be traced back to exactly what was built.',
      'An archive is only useful if it can be restored. Proving it by reproducing one signoff run costs a day now; discovering missing constraints or tool versions during a stepping costs weeks.',
    ],
    flowNote:
      'Step 1 archives each wave 2 database and step 2 joins the wave 1 baseline and records the whole, with a restore test run in parallel in step 3. Step 4 releases the baseline under change control.',
    consumes: [
      'Switch SoC mask release record from MTO-01',
      'I/O die tapeout record from MTO-02',
      'Bridge and capacitor release record from MTO-03',
      'Wave 1 archive and optical silicon configuration baseline from OTO-04',
      'Wave 2 readiness decision package from SGNO-10',
    ],
    rel: {
      'MTO-D5': '<b>Tapeout archive and silicon configuration baseline across both waves.</b> Produced here; the production release package and every stepping are traced against it.',
    },
    risks: [
      '<b>Archive incomplete.</b> Constraints, rule-deck revisions or tool versions are missing and a signoff cannot be reproduced.',
      '<b>Waves baselined apart.</b> The wave 1 and wave 2 baselines are never joined, so no single record says which dies make a product.',
      '<b>Restore never tested.</b> The archive is discovered to be unreadable when a stepping needs it.',
      '<b>Baseline drift.</b> A metal ECO on held wafers is not recorded as a new baseline.',
      '<b>Ownership lost.</b> The archive has no owner once the tapeout team moves on.',
    ],
    roles: [
      { r: 'Program management', d: 'Owns the archive and configuration baseline' },
      { r: 'Configuration manager', d: 'Records and controls the baseline' },
      { r: 'Design methodology engineer', d: 'Archives flows and tool versions' },
      { r: 'Physical design lead', d: 'Runs the restore test' },
      { r: 'Quality lead', d: 'Approves the baseline under change control' },
    ],
    effort: [
      ['Database archive', 1],
      ['Baseline record across both waves', 1],
      ['Restore test', 0.5],
      ['Release', 0.5],
    ],
    entry: [
      'Every wave 2 die taped out or released',
      'Wave 1 baseline released in OTO-04',
      'Archive storage and retention policy agreed',
    ],
    exit: [
      'Archive holds GDS, netlists, constraints, rule-deck revisions and tool versions for every die of both waves',
      'One signoff run reproduced from the restored archive with identical results',
      'Baseline released under change control and signed by quality',
    ],
    dependsOn: ['MTO-01', 'MTO-02', 'MTO-03', 'OTO-04'],
    dependsNote: 'Closes the stage: it waits for every die of both waves to be released.',
    feedsInto: ['SDBG-05', 'RAMP-01'],
    measuredBy: [
      'Dies with a complete archive',
      'Restore test result',
      'Baseline items without a revision',
    ],
    links: {
      dependsOn: ['MTO-01', 'MTO-02', 'MTO-03', 'OTO-04', 'SGNO-10'],
      feedsInto: ['SDBG-05', 'RAMP-01', 'WFAB-07'],
      runsWith: ['MTO-04'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['GDS', 'ECN', 'Stepping'],
  },
};
