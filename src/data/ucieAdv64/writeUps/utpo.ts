/**
 * UTPO — Test Chip Tapeout, written up.
 */
import type { UcieWriteUps } from '../types';

export const UTPO_WRITE_UPS: UcieWriteUps = {
  'UTPO-01': {
    criticalPath: true,
    purpose: [
      'Walk the <b>tapeout checklist</b> against every signoff report, accept each open waiver with its owner and decide how it is disclosed to licensees, confirm the release deliverables the tapeout database must also produce, and sign the checklist that database release waits on.',
      'For an IP program the tapeout checklist has a second reader: a waiver accepted for the test chip is a fact about the released macro too. Recording here which waivers the v0.9 release must disclose keeps the test chip and the product telling the same story.',
    ],
    flowNote:
      'Step 1 walks the checklist. Step 2 reviews waivers while step 3 traces release deliverables in parallel, and step 4 signs the checklist.',
    consumes: [
      'Hard macro signoff decision record from USGN-07',
      'Test chip readiness decision from UTCI-06',
      'Test chip signoff report from UTCI-05',
      'Hard macro physical verification waivers from USGN-03',
      'Release package structure from UPRE-01',
    ],
    rel: {
      'UTPO-D1': '<b>Signed tapeout checklist with the accepted waiver list.</b> Produced here.',
      'UTPO-D4': '<b>Tapeout database release record with foundry intake acceptance.</b> The database is not released until the checklist is signed.',
    },
    risks: [
      '<b>Checklist by memory.</b> Items are ticked from status meetings rather than from the reports.',
      '<b>Waivers not disclosed.</b> A waiver accepted for the test chip never reaches the v0.9 release notes.',
      '<b>Release views forgotten.</b> A view the release needs is not generated from the tapeout database.',
      '<b>Owners missing.</b> Waivers are accepted without a named owner for the silicon follow-up.',
      '<b>Signed under pressure.</b> The checklist is signed with open items to keep the shuttle date.',
    ],
    roles: [
      { r: 'Program management', d: 'Owns the tapeout checklist' },
      { r: 'Signoff manager', d: 'Confirms every report is final' },
      { r: 'Test chip integration lead', d: 'Confirms test chip items' },
      { r: 'Customer engineering lead', d: 'Decides waiver disclosure to licensees' },
      { r: 'Quality engineer', d: 'Audits the checklist' },
    ],
    effort: [
      ['Checklist walk', 0.25],
      ['Waiver review', 0.25],
      ['Release deliverable trace', 0.25],
      ['Sign-off', 0.25],
    ],
    entry: [
      'Hard macro signoff decision recorded in USGN-07',
      'Test chip readiness decision recorded in UTCI-06',
      'Release package structure defined in UPRE-01',
    ],
    exit: [
      'Every checklist item closed with a reference to its report',
      'Every waiver accepted with an owner and a disclosure decision',
      'Checklist signed before database submission',
    ],
    dependsOn: ['USGN-07', 'UTCI-06', 'UTCI-05'],
    dependsNote: null,
    feedsInto: ['UTPO-03', 'UTPO-04', 'UTPO-05'],
    measuredBy: [
      'Checklist items open at the deadline',
      'Waivers without owners (target none)',
      'Waivers marked for disclosure',
    ],
    links: {
      dependsOn: ['USGN-07', 'UTCI-06', 'UTCI-05', 'USGN-03', 'UPRE-01'],
      feedsInto: ['UTPO-03', 'UTPO-04', 'UTPO-05'],
      runsWith: ['UTPO-02'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Waiver', 'Signoff', 'Release package', 'Test chip'],
  },
  'UTPO-02': {
    criticalPath: true,
    purpose: [
      'Run the <b>full-chip final checks</b> on the test chip database as it will be submitted: merge fill and markers, run DRC, LVS and density on the whole chip, and resolve or waive what remains.',
      'The final merge adds fill and foundry markers that were not in any earlier run. Checking the exact submission database, not the last signoff run, is what keeps an intake rejection or a fill problem near the analog blocks from costing the shuttle slot.',
    ],
    flowNote:
      'Step 1 merges the final database. Step 2 runs full-chip DRC, LVS and density and step 3 resolves the last violations and releases the report.',
    consumes: [
      'Test chip signoff report and final database from UTCI-05',
      'Hard macro physical verification report from USGN-03',
      'Physical verification decks and flow from UFND-04',
      'Foundry fill and marker requirements',
      'Package partner bump-layer rules from UTEC-04',
    ],
    rel: {
      'UTPO-D2': '<b>Full-chip final DRC, LVS and density report on the tapeout database.</b> Produced here.',
      'UTPO-D4': '<b>Tapeout database release record with foundry intake acceptance.</b> The checked database is the one submitted.',
    },
    risks: [
      '<b>Fill near analog.</b> Final fill lands in keep-outs around matched structures.',
      '<b>Markers wrong.</b> Missing or misplaced foundry markers trigger an intake rejection.',
      '<b>Different database submitted.</b> The submitted file is not the one checked.',
      '<b>Density outside limits.</b> Local density violations appear only on the merged chip.',
      '<b>Runtime squeeze.</b> Full-chip runs take longer than the window allows.',
    ],
    roles: [
      { r: 'Physical design', d: 'Owns the full-chip final checks' },
      { r: 'Analog layout lead', d: 'Reviews fill around analog structures' },
      { r: 'Foundry interface engineer', d: 'Confirms markers and fill rules' },
      { r: 'Design methodology engineer', d: 'Runs the full-chip flows' },
      { r: 'Test chip integration lead', d: 'Approves final changes' },
    ],
    effort: [
      ['Merge', 0.5],
      ['Full-chip checks', 1],
      ['Resolution and report', 0.5],
    ],
    entry: [
      'Test chip signoff database released in UTCI-05',
      'Foundry fill and marker requirements received',
      'Decks at the signoff revision',
    ],
    exit: [
      'Full-chip DRC and LVS clean or waived with foundry acceptance',
      'No fill inside analog keep-outs',
      'Checked file checksum recorded for submission',
    ],
    dependsOn: ['UTCI-05', 'USGN-03'],
    dependsNote: null,
    feedsInto: ['UTPO-04'],
    measuredBy: [
      'Final violations open',
      'Full-chip run time',
      'Checksum match between checked and submitted database',
    ],
    links: {
      dependsOn: ['UTCI-05', 'USGN-03', 'UFND-04', 'UTEC-04'],
      feedsInto: ['UTPO-04'],
      runsWith: ['UTPO-01'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['DRC', 'LVS', 'GDS', 'Test chip'],
  },
  'UTPO-03': {
    criticalPath: false,
    purpose: [
      'Confirm the <b>mask set, shuttle slot and lot plan</b> with the foundry: the slot and die count, a lot plan with process splits so characterization can separate PHY margin from process position, and the mask order and reticle placement.',
      'A die-to-die PHY’s timing margin moves with the process. A lot plan without splits leaves characterization able to say how this silicon behaves but not how the IP will behave at the process corners licensees will see.',
    ],
    flowNote:
      'Step 1 confirms the slot and die count. Step 2 defines the lot plan with splits, step 3 approves the masks and reticle placement and step 4 records the confirmation.',
    consumes: [
      'Test chip shuttle and fab slot plan from UTEC-05',
      'Signed tapeout checklist from UTPO-01',
      'Process node and metal stack from UTEC-01',
      'Die needs for sort, assembly, reliability and evaluation samples',
      'Foundry shuttle schedule',
    ],
    rel: {
      'UTPO-D3': '<b>Mask set, shuttle slot and lot plan confirmation from the foundry.</b> Produced here.',
      'UTPO-D5': '<b>Tapeout archive and configuration baseline for the test chip and the PHY macros.</b> The lot plan is part of the baseline.',
    },
    risks: [
      '<b>No process splits.</b> All wafers run at nominal and corner behavior is unknown.',
      '<b>Too few dies.</b> The die count cannot cover sort loss, two-die assemblies, reliability and evaluation samples.',
      '<b>Slot lost.</b> A late confirmation lets the shuttle slot go to another customer.',
      '<b>Reticle placement.</b> The test chip lands at a reticle position with atypical variation.',
      '<b>Split mix-up.</b> Split wafers are not tracked to their condition.',
    ],
    roles: [
      { r: 'Technology and foundry', d: 'Owns the shuttle, mask and lot confirmation' },
      { r: 'Validation lead', d: 'Defines the splits characterization needs' },
      { r: 'Reliability engineer', d: 'Sizes the reliability die needs' },
      { r: 'Customer engineering lead', d: 'Sizes evaluation sample needs' },
      { r: 'Program manager', d: 'Approves the cost of splits' },
    ],
    effort: [
      ['Slot and die count', 0.25],
      ['Lot plan with splits', 0.5],
      ['Mask approval and record', 0.25],
    ],
    entry: [
      'Shuttle slot reserved in UTEC-05',
      'Die needs collected from validation, reliability and customer engineering',
      'Checklist under way in UTPO-01',
    ],
    exit: [
      'Shuttle slot and die count confirmed in writing by the foundry',
      'Lot plan includes the process splits characterization asked for',
      'Mask order approved',
    ],
    dependsOn: ['UTEC-05', 'UTPO-01'],
    dependsNote: null,
    feedsInto: ['UTPO-04', 'UFAB-01'],
    measuredBy: [
      'Splits in the lot plan against the request',
      'Die count against total needs',
      'Confirmation date against the shuttle deadline',
    ],
    links: {
      dependsOn: ['UTEC-05', 'UTPO-01', 'UTEC-01'],
      feedsInto: ['UTPO-04', 'UTPO-05', 'UFAB-01'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['MPW', 'Lot split', 'Corner lot', 'Test chip'],
  },
  'UTPO-04': {
    criticalPath: true,
    purpose: [
      'Release the <b>tapeout database</b> to the foundry: submit it through the intake checks, resolve rejections the same day, review the foundry’s data preparation on the PHY layers, and record the release and its acceptance.',
      'Only the database the hard macro signoff authorized and the full-chip checks verified may go. The release record names that database by checksum, which is the link between the silicon that comes back and every report that claims to describe it.',
    ],
    flowNote:
      'Step 1 submits the database, step 2 resolves intake rejections, step 3 reviews data preparation on the PHY layers and step 4 records the release.',
    consumes: [
      'Hard macro signoff decision record from USGN-07',
      'Test chip signoff report and database from UTCI-05',
      'Signed tapeout checklist from UTPO-01',
      'Full-chip final check report from UTPO-02',
      'Mask, shuttle and lot confirmation from UTPO-03',
    ],
    rel: {
      'UTPO-D4': '<b>Tapeout database release record with foundry intake acceptance.</b> Produced here; it closes the Tapeout gate.',
      'UTPO-D5': '<b>Tapeout archive and configuration baseline for the test chip and the PHY macros.</b> The released database is archived as the baseline.',
    },
    risks: [
      '<b>Late intake rejection.</b> A rejection at the end of the week costs the slot.',
      '<b>Unauthorized database.</b> A database other than the signed-off one is submitted.',
      '<b>Data preparation unchecked.</b> Foundry data preparation alters the PHY layers unnoticed.',
      '<b>No acceptance record.</b> The release is not confirmed in writing.',
      '<b>Checksum not recorded.</b> The silicon cannot be tied to a database later.',
    ],
    roles: [
      { r: 'Physical design', d: 'Owns database release and foundry handoff' },
      { r: 'Foundry interface engineer', d: 'Handles intake and data preparation' },
      { r: 'Analog layout lead', d: 'Reviews data preparation on the PHY layers' },
      { r: 'Configuration manager', d: 'Records the checksum and revision' },
      { r: 'Program manager', d: 'Announces tapeout' },
    ],
    effort: [
      ['Submission', 0.25],
      ['Intake resolution', 0.25],
      ['Data preparation review', 0.25],
      ['Release record', 0.25],
    ],
    entry: [
      'Hard macro signoff decision recorded in USGN-07',
      'Checklist signed in UTPO-01',
      'Full-chip final checks clean in UTPO-02',
    ],
    exit: [
      'Foundry intake acceptance received in writing',
      'Submitted database checksum identical to the checked database',
      'Data preparation on the PHY layers reviewed and approved',
    ],
    dependsOn: ['USGN-07', 'UTCI-05', 'UTPO-01', 'UTPO-02'],
    dependsNote: null,
    feedsInto: ['UTPO-05', 'UFAB-01'],
    measuredBy: [
      'Intake rejections and time to resolve',
      'Release date against the shuttle deadline',
      'Checksum match (yes or no)',
    ],
    links: {
      dependsOn: ['USGN-07', 'UTCI-05', 'UTPO-01', 'UTPO-02', 'UTPO-03'],
      feedsInto: ['UTPO-05', 'UFAB-01'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['GDS', 'Signoff', 'Hard macro', 'Test chip'],
  },
  'UTPO-05': {
    criticalPath: false,
    purpose: [
      'Archive the <b>tapeout configuration baseline</b>: the PHY macro and test chip databases, scripts and signoff runs, recorded as one baseline with the release revision they correspond to, and proven by restoring one signoff run from the archive.',
      'Every silicon finding for the next year — a margin shortfall, a training failure, a customer question — will be traced back to this baseline. An archive that cannot reproduce its own signoff runs turns each of those investigations into guesswork about which database was really built.',
    ],
    flowNote:
      'Step 1 archives the databases and runs. Step 2 records the baseline while step 3 restores a run from the archive in parallel, and step 4 releases the archive.',
    consumes: [
      'Tapeout database release record from UTPO-04',
      'Test chip signoff database from UTCI-05',
      'Hard macro signoff decision record from USGN-07',
      'Signed tapeout checklist from UTPO-01',
      'Release package structure from UPRE-01',
    ],
    rel: {
      'UTPO-D5': '<b>Tapeout archive and configuration baseline for the test chip and the PHY macros.</b> Produced here.',
    },
    risks: [
      '<b>Archive incomplete.</b> Scripts or tool settings are missing and runs cannot be reproduced.',
      '<b>Two baselines.</b> The test chip and the release record different macro revisions.',
      '<b>Restore untested.</b> The archive is never restored until it is needed.',
      '<b>Lot plan not archived.</b> Split conditions are lost and characterization cannot interpret corners.',
      '<b>Access lost.</b> Archive permissions lapse when the team moves on.',
    ],
    roles: [
      { r: 'Program management', d: 'Owns the tapeout archive and baseline' },
      { r: 'Configuration manager', d: 'Records revisions and checksums' },
      { r: 'Design methodology engineer', d: 'Proves a restore reproduces a run' },
      { r: 'Physical design lead', d: 'Supplies databases and runs' },
      { r: 'Customer engineering lead', d: 'Confirms the release revision mapping' },
    ],
    effort: [
      ['Archive', 0.25],
      ['Baseline record', 0.25],
      ['Restore test', 0.25],
      ['Release', 0.25],
    ],
    entry: [
      'Database released in UTPO-04',
      'Release revision named in USGN-07',
      'Archive storage allocated',
    ],
    exit: [
      'Archive holds databases, scripts, tool versions and signoff runs for the test chip and both macros',
      'One signoff run restored from the archive and reproduced',
      'Baseline records the release revision the silicon represents',
    ],
    dependsOn: ['UTPO-04', 'UTPO-01'],
    dependsNote: null,
    feedsInto: ['UGA-03'],
    measuredBy: [
      'Archive completeness against the checklist',
      'Restore reproduces signoff (yes or no)',
      'Baselines recorded per database (target one)',
    ],
    links: {
      dependsOn: ['UTPO-04', 'UTPO-01', 'UTCI-05', 'USGN-07', 'UPRE-01'],
      feedsInto: ['UGA-03'],
      runsWith: ['UTPO-03'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Signoff', 'Hard macro', 'Release package'],
  },
};
