/**
 * MTO — Tapeout & Mask Release. Weeks 104–112; closes on Tapeout — All Dies.
 */
import type { CpoStageModule } from '../types';

export const MTO: CpoStageModule = {
  content: {
    tagline: 'Hand every die to its own foundry on its own checklist, and plan the wafers before they start.',
    description:
      'Release each die to the foundry that builds it: the Switch SoC and the I/O die, each as its own tapeout, to the digital foundry, the electrical IC to its analog process, the photonic IC to the photonics foundry and the bridge or interposer and silicon capacitors to theirs — each through that foundry’s intake checks, tapeout checklist and mask data review. Alongside, manufacturing plans the wafer starts, the corner and skew lot splits characterization will need and the engineering lot hold points that keep a metal fix possible, and the program archives every database and freezes the configuration baseline the silicon will be traced back to. The stage closes when every die has been accepted and its masks ordered.',
    activities: ['Switch SoC tapeout', 'I/O die tapeout', 'EIC tapeout', 'PIC tapeout', 'Bridge and Si capacitor release', 'Wafer start plan', 'Archive and baseline'],
    deliverables: [
      'Switch SoC mask release record and foundry handoff checklist',
      'I/O die tapeout record',
      'Electrical IC tapeout record and mask order',
      'Photonic IC tapeout record with in-line monitor structures',
      'Bridge / interposer and silicon capacitor mask release record',
      'Wafer start plan with lot splits and engineering lot strategy',
      'Tapeout archive and silicon configuration baseline',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [4, 4, 4, 4, 7, 6, 8],
    engineeringEffort: [10, 4, 3, 4, 2, 4, 3],
    risks: [
      'A foundry intake rejection late in the week costs the mask slot and weeks of schedule',
      'Lot splits planned for yield only, leaving characterization without the process corners it needs',
    ],
    potentialRisks: [
      'Databases submitted to a foundry in a format, layer map or rule-deck revision its intake does not accept',
      'Mask data preparation results not reviewed, so an OPC or fill problem on a critical layer reaches the wafers',
      'No engineering lot held before metal, so a first-silicon bug that a metal fix would cure costs a full re-spin',
      'Photonic process splits not agreed with the foundry, leaving no wafers to separate a design problem from a process one',
      'Tapeout archive that cannot reproduce a signoff run, so debug and a later stepping start from uncertain data',
    ],
    leader: { name: 'Rafael Ortega', short: 'R. Ortega', phone: '+1 (408) 555-0512', email: 'rafael.ortega@example.com' },
    collaboration: ['Physical design', 'Photonics', 'Analog and mixed-signal', 'Packaging', 'Technology and foundry', 'Manufacturing and NPI', 'Program management'],
    tools: ['Foundry data transfer and intake portal', 'Mask data preparation viewer', 'Wafer start and lot planning system', 'Configuration management and design archive'],
    programView: [
      'Tapeout date per die against its foundry slot',
      'Foundry intake rejections and time to resolve',
      'Wafer starts per die and lot split coverage',
      'Configuration baseline released and restorable',
    ],
    perspective:
      'Tapeout is a week of logistics that decides months of debug. The lot splits and engineering lot holds chosen now are the only tools the program will have when first silicon disagrees with the models — plan them as carefully as the masks.',
  },
  steps: {
    'MTO-01': {
      s: [
        [1, 'Submit the Switch SoC GDS and resolve every foundry intake check rejection', 1],
        [2, 'Complete the foundry tapeout checklist and data transfer form', 0.5, 1],
        [3, 'Review mask data preparation and OPC results on the critical layers with the foundry', 1.5],
        [4, 'Approve the reticle layout, frame and process monitor structures and the mask order', 1],
        [5, 'Confirm the wafer start and hot-lot priority for the first lots', 0.5, 1],
        [6, 'Release the mask set and record the Switch SoC tapeout', 0.5],
      ],
      o: [
        'Foundry intake acceptance for the Switch SoC',
        'Completed foundry tapeout checklist',
        'Mask data preparation review record',
        'Approved reticle layout and mask order',
        'Confirmed first-lot start and priority',
        'Switch SoC mask release record',
      ],
      r: [['MTO-D1', 'produces'], ['MTO-D7', 'feeds']],
    },
    'MTO-02': {
      s: [
        [1, 'Prepare the signed-off I/O die top-level GDS as its own tapeout, with its reticle frame and process monitors', 1],
        [2, 'Submit to foundry intake and resolve rejections', 1],
        [3, 'Complete the analog checklist items — matching, ESD and test structure placement', 1, 1],
        [4, 'Review mask data preparation on the analog-critical layers', 1],
        [5, 'Release the I/O die mask set and record the tapeout', 0.5],
      ],
      o: [
        'I/O die tapeout database with reticle frame',
        'Foundry intake acceptance for the I/O die',
        'Completed analog checklist items',
        'Analog-critical layer mask data review',
        'I/O die tapeout record',
      ],
      r: [['MTO-D2', 'produces'], ['MTO-D7', 'feeds']],
    },
    'MTO-03': {
      s: [
        [1, 'Submit the electrical IC GDS and resolve foundry intake rejections', 1],
        [2, 'Complete the analog foundry checklist and select the mask option set', 1],
        [3, 'Place driver and TIA device test structures in the reticle frame', 1, 1],
        [4, 'Decide a dedicated mask set or a multi-project wafer for the first lots', 0.5],
        [5, 'Release the electrical IC mask order', 0.5],
      ],
      o: [
        'Foundry intake acceptance for the electrical IC',
        'Completed checklist and mask option set',
        'Frame with device test structures',
        'Mask set or shuttle decision record',
        'Electrical IC tapeout record and mask order',
      ],
      r: [['MTO-D3', 'produces'], ['MTO-D7', 'feeds']],
    },
    'MTO-04': {
      s: [
        [1, 'Submit the photonic IC layout to photonics foundry intake and resolve rule and layer-map rejections', 1.5],
        [2, 'Complete the photonics foundry checklist — waivers, process options and layer mapping', 1],
        [3, 'Place in-line optical monitor structures — loss spirals, ring and coupler test sites — in the frame', 1, 1],
        [4, 'Agree waveguide and modulator process splits with the foundry', 1],
        [5, 'Release the photonic IC mask set and record the tapeout', 0.5],
      ],
      o: [
        'Photonics foundry intake acceptance',
        'Completed photonics foundry checklist',
        'Frame with in-line optical monitor structures',
        'Agreed photonic process split table',
        'Photonic IC tapeout record',
      ],
      r: [['MTO-D4', 'produces'], ['MTO-D6', 'informs'], ['MTO-D7', 'feeds']],
    },
    'MTO-05': {
      s: [
        [1, 'Submit the bridge / interposer and capacitor databases to foundry intake', 1],
        [2, 'Complete the checklist and confirm the metal stack and capacitor process options', 1],
        [3, 'Check the release date against substrate tooling and the assembly schedule', 0.5, 1],
        [4, 'Release the bridge and capacitor mask orders', 0.5],
      ],
      o: [
        'Foundry intake acceptance for bridge and capacitors',
        'Confirmed metal stack and process options',
        'Release date aligned with substrate and assembly',
        'Bridge / interposer and silicon capacitor mask release record',
      ],
      r: [['MTO-D5', 'produces'], ['MTO-D7', 'feeds']],
    },
    'MTO-06': {
      s: [
        [1, 'Size first wafer starts per die from the known-good-die yield assumption and the build matrix', 1.5],
        [2, 'Define corner and skew lot splits per die for characterization', 1.5],
        [3, 'Define photonic process splits for waveguide loss and modulator efficiency', 1, 1],
        [4, 'Plan engineering lot hold points before metal for ECO options', 1],
        [5, 'Reserve wafers for re-spin, qualification and correlation', 0.5, 1],
        [6, 'Release the wafer start plan', 0.5],
      ],
      o: [
        'Wafer start quantities per die',
        'Corner and skew lot split matrix',
        'Photonic process split plan',
        'Engineering lot hold plan',
        'Wafer reserve allocation',
        'Wafer start plan with lot splits and engineering lot strategy',
      ],
      r: [['MTO-D6', 'produces']],
    },
    'MTO-07': {
      s: [
        [1, 'Archive every die’s final GDS, netlists, constraints, rule-deck revisions and tool versions', 1.5],
        [2, 'Record the configuration baseline — every die, bridge, substrate, pattern and firmware ROM revision', 1],
        [3, 'Restore the archive and reproduce one signoff run to prove it is complete', 1, 1],
        [4, 'Release the configuration baseline under change control', 0.5],
      ],
      o: [
        'Tapeout archive per die',
        'Silicon configuration baseline record',
        'Archive restore and reproduction result',
        'Tapeout archive and silicon configuration baseline',
      ],
      r: [['MTO-D7', 'produces']],
    },
  },
};
