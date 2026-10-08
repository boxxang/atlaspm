/**
 * OTO — Tapeout Wave 1 — Photonic IC & Electrical IC, written up.
 */
import type { CpoWriteUps } from '../types';

export const OTO_WRITE_UPS: CpoWriteUps = {
  'OTO-01': {
    criticalPath: true,
    purpose: [
      'Tape out the electrical IC to its analog process — <b>intake accepted, checklist and mask options closed, device test structures placed and the choice between a dedicated mask set and a multi-project wafer made</b> for the first lots.',
      'The electrical IC is small, and a shuttle is tempting. The cost is fewer wafers, less control over lot splits and no engineering lot hold — trade-offs that should be decided against the volume of optical engines the first builds need, not against mask cost alone.',
    ],
    flowNote:
      'Step 1 submits and clears intake. Step 2 closes the checklist and mask options while device test structures are placed in parallel in step 3. Step 4 decides mask set or shuttle and step 5 releases the order.',
    consumes: [
      'Electrical IC analog signoff report and GDS from SGNO-03',
      'Wave 1 go decision for the electrical IC from SGNO-09',
      'Optical engine stack interface and bond pad map from ICD-04',
      'Foundry analog checklist and mask option list',
      'Device test structure list from circuit design',
    ],
    rel: {
      'OTO-D1': '<b>Electrical IC tapeout record and mask order.</b> Produced here; it records the mask option set and the shuttle decision.',
      'OTO-D3': '<b>Optical silicon wafer start plan with process splits and engineering lot strategy.</b> The mask set or shuttle decision bounds how many electrical IC wafers the plan can start.',
      'OTO-D4': '<b>Wave 1 tapeout archive and optical silicon configuration baseline.</b> The electrical IC revision is recorded in the baseline.',
    },
    risks: [
      '<b>Shuttle too small.</b> A multi-project wafer yields fewer good dies than the first optical engine builds need.',
      '<b>Mask options wrong.</b> A device option the design depends on is not selected in the mask set.',
      '<b>No device test structures.</b> Driver and TIA devices cannot be characterized separately from the circuit.',
      '<b>Shuttle schedule rules.</b> The shuttle date is fixed and a small slip costs a full cycle.',
      '<b>No splits possible.</b> A shuttle cannot carry the corner lots characterization needs.',
    ],
    roles: [
      { r: 'Analog and mixed-signal', d: 'Owns the electrical IC tapeout' },
      { r: 'Foundry interface engineer', d: 'Intake and analog checklist' },
      { r: 'Technology and foundry manager', d: 'Mask set or shuttle decision and order' },
      { r: 'Manufacturing planner', d: 'Checks die quantity against the build matrix' },
      { r: 'Configuration manager', d: 'Records the revision taped out' },
    ],
    effort: [
      ['Submission and intake', 1],
      ['Checklist and mask options', 1],
      ['Test structures and shuttle decision', 0.5],
      ['Release', 0.5],
    ],
    entry: [
      'Electrical IC signed off in SGNO-03 with a wave 1 go decision in SGNO-09',
      'First-build die quantity estimated',
      'Mask set and shuttle options priced',
    ],
    exit: [
      'Foundry intake accepts the electrical IC database with zero open rejections',
      'Planned die quantity covers the first-build optical engine count with yield margin',
      'Mask order or shuttle booking released and confirmed by the foundry',
    ],
    dependsOn: ['SGNO-03', 'SGNO-09'],
    dependsNote: null,
    feedsInto: ['WFAB-03', 'OTO-03', 'OTO-04'],
    measuredBy: [
      'Intake rejections for the electrical IC',
      'Planned good dies against first-build need',
      'Tapeout date against the booked slot',
    ],
    links: {
      dependsOn: ['SGNO-03', 'SGNO-09', 'ICD-04'],
      feedsInto: ['WFAB-03', 'OTO-03', 'OTO-04', 'SORT-03'],
      runsWith: ['OTO-02'],
      revisedBy: ['SDBG-05'],
      feedsBackInto: [],
    },
    terms: ['EIC', 'MPW', 'GDS'],
  },
  'OTO-02': {
    criticalPath: true,
    purpose: [
      'Tape out the photonic IC to the photonics foundry — <b>intake accepted on its own checklist, waivers and layer mapping closed, in-line optical monitor structures placed and waveguide and modulator process splits agreed</b>.',
      'Photonics foundries run younger processes with more variation, and their intake is stricter about layer mapping and waivers than a digital one. The monitor structures placed now — loss spirals, ring resonators, coupler test sites — are how fabrication and sort will tell a process shift from a design problem.',
    ],
    flowNote:
      'Step 1 submits and clears intake and step 2 closes the checklist, with monitor structures placed in the frame in parallel in step 3. Step 4 agrees process splits with the foundry and step 5 releases.',
    consumes: [
      'Photonic IC signoff report and final layout from SGNO-04',
      'Wave 1 go decision for the photonic IC from SGNO-09',
      'Photonics foundry checklist and process options from TRDY-02',
      'Monitor structure designs from the photonic test vehicle in FEAS-03',
      'Optical wafer probe access requirements from TINF-03',
    ],
    rel: {
      'OTO-D2': '<b>Photonic IC tapeout record with in-line monitor structures.</b> Produced here; it lists the monitor structures and their reticle positions.',
      'OTO-D3': '<b>Optical silicon wafer start plan with process splits and engineering lot strategy.</b> The agreed photonic process splits are part of the plan.',
      'OTO-D4': '<b>Wave 1 tapeout archive and optical silicon configuration baseline.</b> The photonic IC revision and layer map are recorded in the baseline.',
    },
    risks: [
      '<b>Layer mapping error.</b> A design layer maps to the wrong process layer and a whole device type is missing.',
      '<b>No monitor structures.</b> Waveguide loss cannot be measured in line and fabrication problems appear only at sort.',
      '<b>Splits not agreed.</b> All wafers run at nominal and the design margin to process shift is unknown.',
      '<b>Waiver rejected at intake.</b> An internally approved waiver is not accepted by the foundry.',
      '<b>Probe access missing.</b> Test couplers are placed where the optical probe cannot reach them.',
    ],
    roles: [
      { r: 'Photonics', d: 'Owns the photonic IC tapeout' },
      { r: 'Photonics foundry liaison', d: 'Intake, checklist, waivers and splits' },
      { r: 'Photonic layout designer', d: 'Places monitor structures in the frame' },
      { r: 'Optical test engineer', d: 'Confirms probe access to test couplers' },
      { r: 'Configuration manager', d: 'Records the revision and layer map' },
    ],
    effort: [
      ['Submission and intake', 1.5],
      ['Checklist and waivers', 1],
      ['Monitor structures', 0.5],
      ['Process splits and release', 1],
    ],
    entry: [
      'Photonic IC signed off in SGNO-04 with a wave 1 go decision in SGNO-09',
      'Waivers signed by the photonics foundry',
      'Monitor structure library available',
    ],
    exit: [
      'Photonics foundry intake accepts the layout with zero open rejections',
      'In-line monitor structures placed on every reticle for waveguide loss, ring resonance and coupler efficiency',
      'Process split table signed by the foundry and mask set released',
    ],
    dependsOn: ['SGNO-04', 'SGNO-09'],
    dependsNote: null,
    feedsInto: ['WFAB-04', 'OTO-03', 'OTO-04'],
    measuredBy: [
      'Intake rejections for the photonic IC',
      'Monitor structure types per reticle',
      'Wafers in each agreed process split',
    ],
    links: {
      dependsOn: ['SGNO-04', 'SGNO-09'],
      feedsInto: ['WFAB-04', 'OTO-03', 'OTO-04', 'SORT-04'],
      runsWith: ['OTO-01'],
      revisedBy: ['SDBG-05'],
      feedsBackInto: [],
    },
    terms: ['PIC', 'In-line optical monitor', 'Lot split'],
  },
  'OTO-03': {
    criticalPath: true,
    purpose: [
      'Plan the optical silicon wafers before they start: <b>electrical IC and photonic IC first wafer starts sized from the optical engine build matrix and the stack yield, photonic process splits, electrical IC corner lots, engineering lot holds, a reserve for re-spin and stack process learning, and hot-lot priority at both foundries</b>.',
      'An optical engine needs one good photonic IC and one good electrical IC stacked on it, and the stack itself loses some to bonding and coupling, so starts sized for either die alone leave the stacking line short of matched kits. The earliest wafers matter most: they decide when stacking can start, and stacking is on the critical path to the first package build.',
    ],
    flowNote:
      'Step 1 sizes the starts and step 2 agrees the photonic splits, with electrical IC corner lots defined in parallel in step 3. Step 4 plans holds and the reserve while step 5 secures hot-lot priority alongside it, and step 6 releases the plan.',
    consumes: [
      'Wave 1 go decision from SGNO-09',
      'Photonic process split proposal and monitor structures from OTO-02',
      'Electrical IC mask set or shuttle decision from OTO-01',
      'Production test strategy and yield assumptions from TINF-01',
      'Long-lead material plan from TRDY-10',
    ],
    rel: {
      'OTO-D3': '<b>Optical silicon wafer start plan with process splits and engineering lot strategy.</b> Produced here; the optical silicon fabrication, wafer-level optical test and the optical engine build all draw their wafers from it.',
    },
    risks: [
      '<b>Starts sized for one die.</b> Stack and coupling yield are left out and the stacking line runs short of matched kits.',
      '<b>Splits without a purpose.</b> Photonic splits are chosen by the foundry and do not bracket the link budget assumptions.',
      '<b>No reserve for stack learning.</b> Every wafer goes to product builds and the stacking process has nothing to tune on.',
      '<b>Hot-lot priority not agreed.</b> The first wafers queue normally and stacking starts weeks late.',
      '<b>No engineering lot hold.</b> A photonic or electrical fix that a late-layer change would cure needs a full re-spin.',
    ],
    roles: [
      { r: 'Manufacturing and NPI', d: 'Owns the optical silicon wafer start plan' },
      { r: 'Photonics foundry liaison', d: 'Agrees photonic splits, holds and priority' },
      { r: 'Analog design lead', d: 'Defines electrical IC corner lots' },
      { r: 'Packaging engineer', d: 'Stack yield assumption and process learning wafers' },
      { r: 'Program TPM', d: 'Approves the plan against the optical engine build schedule' },
    ],
    effort: [
      ['Start sizing and stack yield', 1],
      ['Photonic splits', 1],
      ['Electrical IC corner lots', 0.5],
      ['Holds, reserve and release', 0.5],
    ],
    entry: [
      'Wave 1 go decision recorded in SGNO-09',
      'Optical engine build matrix available in draft',
      'Yield assumptions agreed per die and for the stack',
    ],
    exit: [
      'Planned good photonic and electrical IC kits cover the first optical engine builds at the assumed stack yield with at least 30 percent margin',
      'Photonic process splits and electrical IC corner lots confirmed by both foundries in writing',
      'Hot-lot priority and engineering lot hold points confirmed for the first lots',
    ],
    dependsOn: ['SGNO-09', 'OTO-02', 'TINF-01'],
    dependsNote: 'Sized from the optical engine build matrix in draft; the main package build matrix in PKGA-02 is planned later against this plan and MTO-04.',
    feedsInto: ['WFAB-03', 'WFAB-04', 'MTO-04'],
    measuredBy: [
      'Planned good optical silicon kits against first-build need',
      'Photonic splits and corner lots defined',
      'Wafers on hot-lot priority',
    ],
    links: {
      dependsOn: ['SGNO-09', 'OTO-01', 'OTO-02', 'TINF-01', 'TRDY-10'],
      feedsInto: ['WFAB-03', 'WFAB-04', 'MTO-04', 'PKGA-02', 'CHAR-01', 'RELQ-01'],
      runsWith: ['OTO-04'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Lot split', 'Corner lot', 'Hot lot', 'Compound yield'],
  },
  'OTO-04': {
    criticalPath: false,
    purpose: [
      'Archive the wave 1 databases and freeze <b>the optical silicon configuration baseline</b> — the electrical IC and the photonic IC final layouts, netlists, rule-deck and PDK revisions, the photonic layer map and the process split table — so wave 2 can join it into one product baseline.',
      'Wave 1 leaves six weeks before wave 2, and the photonic team moves on to the optical engine build. An archive restored and checked now, while the people who made it are in the room, is the one a later stepping of either die will actually be able to use.',
    ],
    flowNote:
      'Step 1 archives both dies and step 2 records the baseline, with a restore and optical rule check reproduction in parallel in step 3. Step 4 releases the baseline under change control for wave 2 to join.',
    consumes: [
      'Electrical IC tapeout record and mask order from OTO-01',
      'Photonic IC tapeout record and process split table from OTO-02',
      'Wave 1 readiness decision package from SGNO-09',
      'Optical silicon wafer start plan from OTO-03',
      'Configuration management system and baseline template',
    ],
    rel: {
      'OTO-D4': '<b>Wave 1 tapeout archive and optical silicon configuration baseline.</b> Produced here; MTO-05 joins it to the wave 2 baseline.',
    },
    risks: [
      '<b>Photonic archive incomplete.</b> The PDK revision or layer map is missing and an optical rule run cannot be reproduced.',
      '<b>Split table lost.</b> Which wafers ran at which photonic condition is not recorded with the baseline.',
      '<b>Restore never tested.</b> The archive is discovered to be unreadable when a stepping needs it.',
      '<b>Never joined.</b> Wave 2 records its own baseline and the product has two that do not reference each other.',
      '<b>Ownership lost.</b> The archive has no owner once the photonic team moves to the optical engine build.',
    ],
    roles: [
      { r: 'Program management', d: 'Owns the wave 1 archive and baseline' },
      { r: 'Configuration manager', d: 'Records and controls the baseline' },
      { r: 'Photonic layout designer', d: 'Archives layouts, layer map and PDK revision' },
      { r: 'Analog layout lead', d: 'Archives the electrical IC database' },
      { r: 'Quality lead', d: 'Approves the baseline under change control' },
    ],
    effort: [
      ['Database archive', 1],
      ['Baseline record', 0.5],
      ['Restore and release', 0.5],
    ],
    entry: [
      'Both optical silicon dies taped out in OTO-01 and OTO-02',
      'Tapeout records carry their database identifiers',
      'Archive storage and retention policy agreed',
    ],
    exit: [
      'Archive holds layouts, netlists, rule-deck and PDK revisions and tool versions for both dies',
      'Optical rule check reproduced from the restored archive with identical results',
      'Wave 1 baseline released under change control and referenced by the wave 2 archive plan',
    ],
    dependsOn: ['OTO-01', 'OTO-02', 'SGNO-09'],
    dependsNote: null,
    feedsInto: ['MTO-05'],
    measuredBy: [
      'Optical silicon dies with a complete archive',
      'Restore test result',
      'Baseline items without a revision',
    ],
    links: {
      dependsOn: ['OTO-01', 'OTO-02', 'SGNO-09', 'OTO-03'],
      feedsInto: ['MTO-05', 'SDBG-05', 'RAMP-01'],
      runsWith: ['OTO-03'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['GDS', 'ECN', 'Stepping'],
  },
};
