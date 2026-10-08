/**
 * OTO — Tapeout Wave 1 — Photonic IC & Electrical IC. Weeks 98–104; closes on
 * Tapeout — Optical Engine Silicon.
 */
import type { CpoStageModule } from '../types';

export const OTO: CpoStageModule = {
  content: {
    tagline: 'Wave 1: the photonic and electrical ICs tape out six weeks ahead of the rest, because the optical engines are the longest road to the first package.',
    description:
      'The first of two tapeout waves. The photonic IC and the electrical IC go to their foundries about six weeks before the Switch SoC and the I/O die, because their path to the first package build is the longer one: photonic fabrication runs several weeks longer than the digital process, and the optical engines built from these dies must then be stacked, attached to their engine substrate, fiber-coupled, tested and passed as known good before the main package can take them. Each die goes through its own foundry’s intake checks, checklist and mask data review; the electrical IC decides between a dedicated mask set and a multi-project wafer against the optical engine count the first builds need, and the photonic IC places its in-line optical monitors and agrees its process splits. Manufacturing sizes the optical silicon wafer starts from the optical engine build matrix and the stack yield, and the program archives the wave 1 databases as a baseline that wave 2 later joins. The stage closes when both optical silicon dies have been accepted and their masks ordered.',
    activities: ['EIC tapeout', 'PIC tapeout', 'Optical silicon wafer start plan', 'Wave 1 archive and baseline'],
    deliverables: [
      'Electrical IC tapeout record and mask order',
      'Photonic IC tapeout record with in-line monitor structures',
      'Optical silicon wafer start plan with process splits and engineering lot strategy',
      'Wave 1 tapeout archive and optical silicon configuration baseline',
    ],
    deliverableFrom: [0, 1, 2, 3],
    deliverableWeek: [4, 4, 5, 6],
    engineeringEffort: [3, 4, 3, 2],
    risks: [
      'Wave 1 held back to tape out with the Switch SoC, so the longest path to the first package build starts six weeks late',
      'Optical silicon starts sized for die yield alone, leaving the stacking line short of matched electrical and photonic kits',
    ],
    potentialRisks: [
      'Photonics foundry intake rejecting a layer map or waiver late in the week, costing the slot',
      'Electrical IC put on a multi-project wafer that cannot carry corner lots or yield enough dies for the engine builds',
      'Bond pad maps on the two dies not cross-checked before they leave, so the stack cannot be built from what comes back',
      'In-line optical monitor structures missing, so fabrication problems surface only at wafer-level optical test',
      'Wave 1 baseline never joined to wave 2, so no single record says which optical silicon goes with which switch silicon',
    ],
    leader: { name: 'Ingrid Halvorsen', short: 'I. Halvorsen', phone: '+1 (408) 555-0524', email: 'ingrid.halvorsen@example.com' },
    collaboration: ['Photonics', 'Analog and mixed-signal', 'Technology and foundry', 'Manufacturing and NPI', 'Packaging', 'Program management'],
    tools: ['Foundry data transfer and intake portal', 'Photonic mask data preparation viewer', 'Wafer start and lot planning system', 'Configuration management and design archive'],
    programView: [
      'Wave 1 tapeout date against week 98 and against the wave 2 date',
      'Foundry intake rejections per optical silicon die',
      'Optical silicon starts against the optical engine build matrix',
      'Wave 1 baseline released and restorable',
    ],
    perspective:
      'Tape out what takes longest first. The photonic IC’s fabrication and the optical engine build behind it set the first package date, so six weeks gained here are six weeks on the critical path — and six weeks lost waiting for the Switch SoC are six weeks nobody can recover later.',
  },
  steps: {
    'OTO-01': {
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
      r: [['OTO-D1', 'produces'], ['OTO-D3', 'informs'], ['OTO-D4', 'feeds']],
    },
    'OTO-02': {
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
      r: [['OTO-D2', 'produces'], ['OTO-D3', 'informs'], ['OTO-D4', 'feeds']],
    },
    'OTO-03': {
      s: [
        [1, 'Size electrical IC and photonic IC first wafer starts from the optical engine build matrix and the stack yield assumption', 1],
        [2, 'Define photonic process splits for waveguide loss, modulator efficiency and ring resonance with the foundry', 1.5],
        [3, 'Define electrical IC corner lots for driver and TIA characterization', 1, 1],
        [4, 'Plan engineering lot holds and the wafer reserve for re-spin, qualification and stack process learning', 1],
        [5, 'Agree hot-lot priority with both foundries so optical engine stacking can start on the earliest wafers', 0.5, 1],
        [6, 'Release the optical silicon wafer start plan', 0.5],
      ],
      o: [
        'Electrical IC and photonic IC start quantities matched to the engine build matrix',
        'Photonic process split matrix agreed with the foundry',
        'Electrical IC corner lot plan',
        'Engineering lot hold and wafer reserve plan',
        'Hot-lot priority confirmation from both foundries',
        'Optical silicon wafer start plan with process splits and engineering lot strategy',
      ],
      r: [['OTO-D3', 'produces']],
    },
    'OTO-04': {
      s: [
        [1, 'Archive the electrical IC and photonic IC final layouts, netlists, rule-deck and PDK revisions and tool versions', 1],
        [2, 'Record the wave 1 configuration baseline — both dies, the photonic layer map and the process split table', 0.5],
        [3, 'Restore the photonic archive and reproduce the optical rule check to prove it complete', 0.5, 1],
        [4, 'Release the wave 1 baseline under change control for wave 2 to join', 0.5],
      ],
      o: [
        'Wave 1 tapeout archive per die',
        'Wave 1 configuration baseline record',
        'Archive restore and optical rule check reproduction result',
        'Wave 1 tapeout archive and optical silicon configuration baseline',
      ],
      r: [['OTO-D4', 'produces']],
    },
  },
};
