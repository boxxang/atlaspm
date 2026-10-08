/**
 * WFAB — Wafer Fabrication. Weeks 102–122; closes on First Silicon. The wave 1
 * optical silicon starts at week 102, the wave 2 dies at week 108.
 */
import type { CpoStageModule } from '../types';

export const WFAB: CpoStageModule = {
  content: {
    tagline: 'Several foundries, one first-silicon date — track every lot, and have everything else on the dock when the wafers come out.',
    description:
      'Track the wafers of every die through its own foundry, in two waves. The electrical IC and the photonic IC, with in-line optical monitoring of waveguide loss, ring resonance and coupler efficiency, start in week 102 from the wave 1 tapeout, and the photonic IC’s longer process — with its bumping, through-oxide-via reveal and bond-surface preparation after wafer out — sets the optical engine path; the Switch SoC, the I/O die — its own die, on its own process, mask set and lots — and the bridge or interposer and silicon capacitors start in week 108 from wave 2, with their bumps put on in-line at each foundry’s back end, and the bridge lots start when their masks are released in week 111. Engineering lots are held and released at the planned metal layers, in-line excursions are dispositioned with each foundry, and the optical sources, fiber assemblies and substrates for the first build are chased, received and inspected so assembly is not waiting on material. The stage closes on first silicon: wafer acceptance data reviewed against limits and the lot split targets, and wafers released to sort.',
    activities: ['Switch SoC fab', 'I/O die fab', 'EIC fab', 'PIC fab and optical monitors', 'Bridge and Si capacitor fab', 'First-build material', 'Wafer acceptance', 'PIC bumping and bond prep'],
    deliverables: [
      'Switch SoC lot tracking and wafer-out record',
      'I/O die lot tracking and wafer-out record with SerDes device monitors',
      'Electrical IC wafer lot and parametric record',
      'Photonic IC in-line optical monitor report',
      'Bridge / interposer and silicon capacitor wafer lot record',
      'First-build material receipt and incoming inspection record',
      'Wafer acceptance review and first silicon release record',
      'Photonic IC bumped, via-revealed and bond-ready wafer record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7],
    deliverableWeek: [20, 18, 12, 15, 20, 20, 20, 18],
    engineeringEffort: [6, 4, 4, 8, 3, 6, 4, 4],
    risks: [
      'One foundry’s cycle time slips and the first build waits for the slowest die',
      'Photonic process drift discovered only at sort because in-line optical data was not reviewed',
    ],
    potentialRisks: [
      'Lots tracked by weekly email rather than against committed cycle time, so a slip is seen only when wafer out is missed',
      'Engineering lot hold point passed without a decision, so the metal fix option is lost by default',
      'Photonic in-line monitor data received but not compared against the link budget assumptions',
      'Substrates or optical sources arrive after the known-good dies, and the first package build waits on material',
      'Photonic wafer post-fab processing — bumping, through-oxide-via reveal, bond-surface preparation — left off the plan, so wafer test and the engine build wait on it',
      'Wafer acceptance limits set by the foundry alone, with no link to the corners the lot splits were meant to hit',
    ],
    leader: { name: 'Hannah Lindqvist', short: 'H. Lindqvist', phone: '+1 (408) 555-0513', email: 'hannah.lindqvist@example.com' },
    collaboration: ['Technology and foundry', 'Photonics', 'Packaging', 'Supply chain', 'Laser and optical source', 'Manufacturing and NPI', 'Quality'],
    tools: ['Foundry lot tracking portal', 'Wafer acceptance and parametric data analysis', 'In-line optical monitor data analysis', 'Supplier delivery tracking', 'Incoming inspection system'],
    programView: [
      'Lot position and projected wafer out per die against commitment',
      'In-line excursions open per foundry',
      'Photonic waveguide loss from in-line monitors against budget',
      'First-build material on hand against the assembly start',
    ],
    perspective:
      'First silicon is the date the slowest of five wafer flows and three suppliers delivers. Track every lot and every material order on the same weekly chart — the critical path moves between them without anybody announcing it.',
  },
  steps: {
    'WFAB-01': {
      s: [
        [1, 'Confirm Switch SoC lot starts, split assignments and hot-lot priority with the foundry', 0.5],
        [2, 'Track lots through front-end and middle-of-line processing against committed cycle time', 5],
        [3, 'Review in-line metrology and defect excursions with the foundry', 3, 1],
        [4, 'Hold engineering lots at the planned metal layer and record the release or metal fix decision', 1],
        [5, 'Track back-end-of-line processing and in-line bumping at the foundry back end to wafer out', 5],
        [6, 'Accept the lots on WAT data and release the wafers to sort', 0.5],
      ],
      o: [
        'Confirmed lot start and split record',
        'Weekly lot position against cycle time',
        'In-line excursion disposition log',
        'Engineering lot hold decision record',
        'Back-end lot tracking record',
        'Switch SoC lot tracking and wafer-out record',
      ],
      r: [['WFAB-D1', 'produces'], ['WFAB-D7', 'feeds']],
    },
    'WFAB-02': {
      s: [
        [1, 'Confirm I/O die lot starts, split assignments and priority with its foundry', 0.5],
        [2, 'Track front-end and middle-of-line processing against committed cycle time', 4.5],
        [3, 'Review in-line metrology, defect excursions and SerDes device monitors', 3, 1],
        [4, 'Hold engineering lots at the planned metal layer and record the release or metal fix decision', 1],
        [5, 'Track back-end-of-line processing and in-line bumping at the foundry back end to wafer out', 5],
        [6, 'Accept the lots on WAT and SerDes device parametric data and release the wafers to sort', 0.5],
      ],
      o: [
        'Confirmed I/O die lot start and split record',
        'Weekly I/O die lot position against cycle time',
        'I/O die excursion and device monitor review',
        'I/O die engineering lot hold decision record',
        'I/O die back-end lot tracking record',
        'I/O die lot tracking and wafer-out record with SerDes device monitors',
      ],
      r: [['WFAB-D2', 'produces'], ['WFAB-D7', 'feeds']],
    },
    'WFAB-03': {
      s: [
        [1, 'Confirm electrical IC lot starts and split assignments', 0.5],
        [2, 'Track lots through the analog process and the in-line back-end finish of the bond pads or microbumps the stack bonds to, against committed cycle time', 8],
        [3, 'Review in-line excursions and device parametric monitors', 3, 1],
        [4, 'Accept the lots on WAT data and release the wafers to sort', 0.5],
      ],
      o: [
        'Confirmed electrical IC lot start record',
        'Weekly lot position against cycle time',
        'Device parametric monitor review',
        'Electrical IC wafer lot and parametric record',
      ],
      r: [['WFAB-D3', 'produces'], ['WFAB-D7', 'feeds']],
    },
    'WFAB-04': {
      s: [
        [1, 'Confirm photonic lot starts and process split assignments with the foundry', 0.5],
        [2, 'Track waveguide definition and review critical dimension and film thickness metrology', 5],
        [3, 'Measure in-line optical monitors — propagation loss, ring resonance and coupler efficiency', 3, 1],
        [4, 'Disposition lots outside the optical window — continue, hold or scrap', 1],
        [5, 'Track the detector, doping, heater, metallization and pad modules to wafer out', 8],
        [6, 'Accept the lots on WAT and in-line optical data and release the wafers to bumping and via reveal with the monitor report', 0.5],
      ],
      o: [
        'Confirmed photonic lot and split record',
        'Waveguide critical dimension and thickness data',
        'In-line optical monitor measurements per lot',
        'Out-of-window lot disposition record',
        'Back-end photonic lot tracking record',
        'Photonic IC in-line optical monitor report',
      ],
      r: [['WFAB-D4', 'produces'], ['WFAB-D7', 'feeds']],
    },
    'WFAB-05': {
      s: [
        [1, 'Confirm bridge / interposer and capacitor lot starts against the released bridge masks', 0.5],
        [2, 'Track bridge and capacitor lots through the process against cycle time', 7],
        [3, 'Review capacitor density and leakage monitor data', 2, 1],
        [4, 'Receive wafer out and WAT data and schedule thinning and dicing to finish before die attach', 1],
      ],
      o: [
        'Confirmed bridge and capacitor lot start record',
        'Weekly lot position against cycle time',
        'Capacitor density and leakage review',
        'Bridge / interposer and silicon capacitor wafer lot record',
      ],
      r: [['WFAB-D5', 'produces'], ['WFAB-D6', 'informs'], ['WFAB-D7', 'feeds']],
    },
    'WFAB-06': {
      s: [
        [1, 'Confirm orders and delivery dates for optical sources, fiber assemblies, substrates, lids and thermal materials', 1],
        [2, 'Track substrate fabrication from tooling release to delivery', 10],
        [3, 'Track optical source builds and burn-in at the supplier', 8, 1],
        [4, 'Run incoming inspection on substrates — warpage, flatness and electrical open / short test', 2],
        [5, 'Run incoming inspection on optical sources and fiber assemblies — output power, wavelength and end-face', 2, 1],
        [6, 'Kit the first-build material and release it to assembly', 1],
      ],
      o: [
        'Confirmed first-build order and delivery schedule',
        'Substrate fabrication tracking record',
        'Optical source build and burn-in tracking record',
        'Substrate incoming inspection results',
        'Optical source and fiber assembly incoming inspection results',
        'First-build material receipt and incoming inspection record',
      ],
      r: [['WFAB-D6', 'produces']],
    },
    'WFAB-07': {
      s: [
        [1, 'Collect WAT and process control monitor data per die and lot from every foundry', 1],
        [2, 'Compare parametrics against acceptance limits and the lot split corner targets', 1.5],
        [3, 'Disposition out-of-limit wafers with the foundries', 1, 1],
        [4, 'Confirm wafer shipment, probe-ready packing and traceability records', 1],
        [5, 'Hold the wafer acceptance review across every die and declare first silicon', 0.5],
      ],
      o: [
        'Consolidated WAT and PCM data per die and lot',
        'Parametric comparison against limits and split targets',
        'Out-of-limit wafer disposition record',
        'Shipment and traceability confirmation',
        'Wafer acceptance review and first silicon release record',
      ],
      r: [['WFAB-D7', 'produces']],
    },
    'WFAB-08': {
      s: [
        [1, 'Receive the accepted photonic wafers and the monitor report at the bump and post-fab line', 0.5],
        [2, 'Thin the wafers and reveal the through-oxide vias, then check via resistance on monitor structures', 1],
        [3, 'Put down the bump or hybrid-bond pad finish and the under-bump metallization on the bond side', 0.5, 1],
        [4, 'Prepare and inspect the bond surface — planarity, roughness and pad recess against the stack design rules', 0.5],
        [5, 'Inspect for edge-coupler and waveguide damage from post-fab handling and record wafer maps', 0.5],
        [6, 'Release the bond-ready photonic wafers to wafer-level optical test', 0.5],
      ],
      o: [
        'Photonic wafers received at the post-fab line',
        'Thinned wafers with via resistance results',
        'Bond pad finish and under-bump metallization record',
        'Bond surface inspection results',
        'Post-fab optical damage inspection and wafer maps',
        'Photonic IC bumped, via-revealed and bond-ready wafer record',
      ],
      r: [['WFAB-D8', 'produces'], ['WFAB-D7', 'feeds']],
    },
  },
};
