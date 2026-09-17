/**
 * /data/threeDic.ts — the 3DIC template: a stacked-die programme.
 *
 * A 3DIC programme runs everything an SoC programme runs and then the work a
 * stack adds: deciding where to cut the design, the interface the dies talk
 * over, the bonding process they are joined by, a daisy chain vehicle that
 * proves the assembly before product silicon exists, the stack's own
 * integration and signoff, sorting dies good enough to stack, and testing a
 * part whose dies can only be reached through each other.
 *
 * Written here rather than in journey.ts because that file and the activity
 * modules beside it are generated from the authoring corpus and are not edited
 * by hand. The stages below carry their own content in the same shape and are
 * held to the same invariants — see tests/unit/threeDic.test.ts.
 *
 * The SoC stages are inherited by key, so a 3DIC programme shows the same
 * write-ups for the work the two share, and only the stack stages are new.
 */
import type { ActivityStepEntry } from './activitySteps';
import { journeyData } from './journey';
import { BASELINES, PHASE_OF, STAGE_ORDER } from './scheduleProfiles';
import { TOP_DIE_SPLIT, TOP_DIE_STAGES } from './threeDicTopDie';
import type { JourneyStage, MilestoneDef, ProfileStageDef, ScheduleProfile } from './types';

/** The SoC stages a 3DIC programme still runs, unchanged. */
const SOC_STAGE_KEYS: readonly string[] = STAGE_ORDER;

/** Which band each stage sits under — the SoC ones, plus the stack's own. */
const PHASE_OF_3DIC: Record<string, string> = {
  ...PHASE_OF,
  /* Where the design is cut is an architecture decision. */
  chipletPartitioning: 'define',
  /* Bonding and the die-to-die interface are enablement: they have to exist
     before the design that depends on them starts. */
  tsvHybridBond: 'enable',
  d2dInterface: 'enable',
  /* The vehicle belongs with the other package work it validates. */
  dctv: 'integrate',
  /* The stack is closed alongside each die's physical design and signoff. */
  threeDIntegration: 'implement',
  /* Sorting is a manufacturing step; testing the assembled stack is ramp. */
  kgdSort: 'manufacture',
  /* Bonding the product is a manufacturing run, between sort and assembly. */
  stackBonding: 'manufacture',
  multiDieTest: 'validateRamp',
};

/** A stack stage's content: journey's shape, with the aligned arrays required. */
export type ThreeDicStage = JourneyStage &
  Required<Pick<JourneyStage, 'engineeringStart' | 'deliverableFrom' | 'deliverableWeek'>>;

/** The stages a stack adds to the SoC flow, in the order they start. */
export const THREE_DIC_STAGE_KEYS = [
  'chipletPartitioning',
  'tsvHybridBond',
  'd2dInterface',
  'dctv',
  'threeDIntegration',
  'kgdSort',
  'stackBonding',
  'multiDieTest',
] as const;

/** Start and length of each stack stage, in weeks from kickoff. */
export const THREE_DIC_BASELINES: Record<string, { startOffsetWeeks: number; durationWeeks: number }> = {
  /* Partitioning is an architecture decision: it decides the shape of the RTL,
     so it closes before the RTL it decides. */
  chipletPartitioning: { startOffsetWeeks: 8, durationWeeks: 14 },
  /* The bonding scheme is chosen before the stack is designed around it, and
     the design rules it produces are what 3D integration builds on. */
  tsvHybridBond: { startOffsetWeeks: 12, durationWeeks: 28 },
  /* The die-to-die interface follows the partitioning that creates it and has
     to be frozen before physical design closes around its bump map. */
  d2dInterface: { startOffsetWeeks: 16, durationWeeks: 30 },
  /* The vehicle exists to be measured before the product is assembled — its
     process window is what the first product build runs to. */
  dctv: { startOffsetWeeks: 30, durationWeeks: 34 },
  /* The stack's own floorplan, power, timing, thermal and warpage work, run
     alongside each die's physical design — and its signoff, which waits for
     both dies' signoff and gates both tapeouts. */
  threeDIntegration: { startOffsetWeeks: 46, durationWeeks: 40 },
  /* Dies are sorted before they are stacked: the criteria and the sort program
     are written while the wafers are in the fab, the binning starts when the
     bottom die's wafers ship, and the release follows the top die's. */
  kgdSort: { startOffsetWeeks: 102, durationWeeks: 16 },
  /* Known-good dies are bonded into stacks, and the bottom die's TSVs revealed
     from the back, before the package takes the stack. */
  stackBonding: { startOffsetWeeks: 116, durationWeeks: 8 },
  /* And tested once they are, through each other: the strategy is set before
     bonding, and the link is brought up on the first bonded stacks. */
  multiDieTest: { startOffsetWeeks: 114, durationWeeks: 30 },
};

/**
 * Where the SoC stages run in a 3DIC program. They are the bottom die, and a
 * bottom die waits on the stack: its floorplan follows the 3D floorplan, its
 * tapeout follows the stack signoff, and everything after fabrication waits on
 * dies being sorted and bonded. Moved, never stretched — a stretched stage
 * keeps its activities and ends in weeks of nothing.
 */
const SOC_IN_3DIC: Record<string, { startOffsetWeeks: number; durationWeeks: number }> = {
  ...BASELINES,
  physicalDesign: { startOffsetWeeks: 50, durationWeeks: 30 },
  signoff: { startOffsetWeeks: 66, durationWeeks: 16 },
  tapeout: { startOffsetWeeks: 86, durationWeeks: 8 },
  fabrication: { startOffsetWeeks: 90, durationWeeks: 19 },
  testDevelopment: { startOffsetWeeks: 62, durationWeeks: 42 },
  packaging: { startOffsetWeeks: 99, durationWeeks: 31 },
  bringup: { startOffsetWeeks: 129, durationWeeks: 18 },
  qualification: { startOffsetWeeks: 133, durationWeeks: 26 },
};

/** The top die runs two weeks behind the bottom one, which carries the TSVs. */
const TOP_DIE_BASELINES: Record<string, { startOffsetWeeks: number; durationWeeks: number }> = {
  dftTop: { startOffsetWeeks: 20, durationWeeks: 60 },
  synthesisTop: { startOffsetWeeks: 44, durationWeeks: 24 },
  physicalDesignTop: { startOffsetWeeks: 52, durationWeeks: 30 },
  signoffTop: { startOffsetWeeks: 68, durationWeeks: 16 },
  tapeoutTop: { startOffsetWeeks: 88, durationWeeks: 8 },
  fabricationTop: { startOffsetWeeks: 92, durationWeeks: 19 },
  testDevelopmentTop: { startOffsetWeeks: 64, durationWeeks: 42 },
};

export const THREE_DIC_MILESTONES: readonly MilestoneDef[] = [
  { id: 'partitionFreeze', label: 'Partition Freeze', anchor: { stage: 'chipletPartitioning', at: 'end' } },
  { id: 'bondProcessReady', label: 'Bond Process Ready', anchor: { stage: 'tsvHybridBond', at: 'end' } },
  { id: 'd2dInterfaceFreeze', label: 'D2D Interface Freeze', anchor: { stage: 'd2dInterface', at: 'end' } },
  { id: 'dctvAssemblySignoff', label: 'DCTV Assembly Signoff', anchor: { stage: 'dctv', at: 'end' }, major: true },
  { id: 'stackSignoff', label: '3D Stack Signoff', anchor: { stage: 'threeDIntegration', at: 'end' } },
  { id: 'kgdReady', label: 'KGD Ready', anchor: { stage: 'kgdSort', at: 'end' } },
  { id: 'stackBonded', label: 'Stack Bonded', anchor: { stage: 'stackBonding', at: 'end' }, major: true },
  { id: 'knownGoodStack', label: 'Known Good Stack', anchor: { stage: 'multiDieTest', at: 'end' } },
  { id: 'topDieTapeout', label: 'Top Die Tapeout', anchor: { stage: 'tapeoutTop', at: 'end' }, major: true },
  {
    id: 'topDieFirstSilicon',
    label: 'Top Die First Silicon',
    anchor: { stage: 'fabricationTop', at: 'end' },
    major: true,
  },
];

/* ---------- activities ---------- */

/**
 * One output per step, as every SoC activity has: a step hands something over
 * or it is not a step. So the outputs are listed in step order and the step
 * each one comes from is its position.
 */
const act = (
  st: string,
  w: [number, number],
  ro: string,
  s: ActivityStepEntry['s'],
  o: string[],
  r: ActivityStepEntry['r'],
): ActivityStepEntry => ({ st, w, s, o, ob: o.map((_, i) => i + 1), r, ro });

/**
 * Keyed by reference, grouped by stage and in the order each stage runs them —
 * the stage's aligned arrays are positions into this order.
 */
export const THREE_DIC_ACTIVITIES: Record<string, ActivityStepEntry> = {
  /* --- 3D architecture and chiplet partitioning --- */
  'PART-01': act(
    'chipletPartitioning',
    [0, 5],
    'Chief architect',
    [
      [1, 'Draw the candidate die splits against the product blocks', 1],
      [2, 'Model bandwidth and latency across each split', 1.5],
      [3, 'Cost each split — die size, yield, mask set, assembly', 1, 1],
      [4, 'Screen each split for thermal feasibility', 1],
      [5, 'Choose the stack topology and record what it was chosen over', 1.5],
    ],
    [
      'Candidate die split options',
      'Bandwidth and latency model per split',
      'Cost comparison of the candidate splits',
      'Thermal feasibility screen of each split',
      'Stack topology decision record',
    ],
    [['PART-D1', 'produces'], ['PART-D5', 'feeds']],
  ),
  'PART-02': act(
    'chipletPartitioning',
    [2, 7],
    'System architect',
    [
      [1, 'Derive the die-to-die traffic from the workload models', 1.5],
      [2, 'Set the bandwidth, latency and coherency budget per link', 1.5],
      [3, 'Estimate the interface power at the target bandwidth', 1, 1],
      [4, 'Reconcile the budget with the floorplan-level bump count', 2],
    ],
    [
      'Die-to-die traffic matrix',
      'Per-link bandwidth, latency and coherency budget',
      'Interface power estimate at target bandwidth',
      'Die-to-die bandwidth and power budget',
    ],
    [['PART-D2', 'produces'], ['PART-D5', 'feeds']],
  ),
  'PART-03': act(
    'chipletPartitioning',
    [4, 9],
    'Thermal architect',
    [
      [1, 'Build the stack thermal model from the topology', 1.5],
      [2, 'Place the power maps of each die in the stack', 1],
      [3, 'Find the hotspots the stacking creates', 1.5, 1],
      [4, 'Set the per-die power ceiling and the cooling assumption', 2],
    ],
    [
      'Stack thermal model',
      'Per-die power maps placed in the stack',
      'Stack hotspot list',
      'Stack thermal and power budget',
    ],
    [['PART-D3', 'produces'], ['PART-D5', 'feeds']],
  ),
  'PART-04': act(
    'chipletPartitioning',
    [5, 10],
    'Product engineering',
    [
      [1, 'Model compound yield across the dies in the stack', 1.5],
      [2, 'Price the loss of stacking a bad die against sorting for it', 1.5],
      [3, 'Set the known-good-die criteria the programme will hold to', 1, 1],
      [4, 'Agree the repair and redundancy budget with design', 2],
    ],
    [
      'Compound stack yield model',
      'Stack-a-bad-die versus sort cost trade-off',
      'Draft known-good-die criteria',
      'Stack yield and KGD economics',
    ],
    [['PART-D4', 'produces'], ['PART-D5', 'feeds']],
  ),
  'PART-05': act(
    'chipletPartitioning',
    [9, 14],
    'Chief architect',
    [
      [1, 'Freeze the partition and the die list', 1],
      [2, 'Write the interface contract between the dies', 2],
      [3, 'Agree the contract with each die owner', 1, 1],
      [4, 'Release the partition to RTL and physical design', 2],
    ],
    [
      'Frozen partition and die list',
      'Inter-die interface contract',
      'Die owner sign-off on the contract',
      'Partition freeze package',
    ],
    [['PART-D5', 'produces']],
  ),

  /* --- TSV and hybrid bond process enablement --- */
  'BOND-01': act(
    'tsvHybridBond',
    [0, 6],
    'Packaging technologist',
    [
      [1, 'Collect the foundry and OSAT bonding options', 1],
      [2, 'Compare micro-bump against hybrid bonding for this stack', 2],
      [3, 'Check each option against the bandwidth and pitch the design needs', 1.5, 1],
      [4, 'Select the bonding scheme and record the constraints it brings', 3],
    ],
    [
      'Foundry and OSAT bonding option list',
      'Micro-bump versus hybrid bonding comparison',
      'Pitch and bandwidth fit check per option',
      'Bonding scheme selection record',
    ],
    [['BOND-D1', 'produces'], ['BOND-D3', 'feeds']],
  ),
  'BOND-02': act(
    'tsvHybridBond',
    [4, 12],
    'Process integration engineer',
    [
      [1, 'Take in the TSV and backside process rules from the foundry', 1.5],
      [2, 'Check the TSV keep-out against the floorplan assumptions', 2],
      [3, 'Set the backside redistribution and pad rules', 2, 1],
      [4, 'Agree the process split points with the foundry', 4.5],
    ],
    [
      'Foundry TSV and backside rules, received',
      'TSV keep-out impact on the floorplan',
      'Backside RDL and pad rules',
      'TSV and backside process rule set',
    ],
    [['BOND-D2', 'produces'], ['BOND-D6', 'feeds']],
  ),
  'BOND-03': act(
    'tsvHybridBond',
    [8, 16],
    'Assembly process engineer',
    [
      [1, 'Collect the bond pitch and overlay capability data', 1.5],
      [2, 'Set the alignment and placement accuracy budget', 2],
      [3, 'Check the capability against the bump map density', 2, 1],
      [4, 'Agree the bonding capability the design may assume', 4.5],
    ],
    [
      'Bond pitch and overlay capability data',
      'Alignment and placement accuracy budget',
      'Capability check against bump map density',
      'Bond pitch and alignment capability statement',
    ],
    [['BOND-D3', 'produces'], ['BOND-D6', 'feeds']],
  ),
  'BOND-04': act(
    'tsvHybridBond',
    [12, 20],
    'Wafer process engineer',
    [
      [1, 'Define the thinning target and the carrier flow', 2],
      [2, 'Assess wafer handling risk at the thinned thickness', 2],
      [3, 'Set the bow and warpage limits for handling', 2, 1],
      [4, 'Qualify the debond and clean steps on monitor wafers', 4],
    ],
    [
      'Thinning target and carrier flow',
      'Thinned wafer handling risk assessment',
      'Bow and warpage handling limits',
      'Thinning and handling flow definition',
    ],
    [['BOND-D4', 'produces'], ['BOND-D5', 'informs']],
  ),
  'BOND-05': act(
    'tsvHybridBond',
    [16, 24],
    'Reliability engineer',
    [
      [1, 'Define the bond interface reliability requirements', 1.5],
      [2, 'Plan the stress matrix for the bond interface', 2],
      [3, 'Set the thermal budget the stack may spend in assembly', 2, 1],
      [4, 'Review the reliability plan with the foundry and OSAT', 4.5],
    ],
    [
      'Bond interface reliability requirements',
      'Bond interface stress matrix',
      'Assembly thermal budget',
      'Bond reliability and thermal budget plan',
    ],
    [['BOND-D5', 'produces']],
  ),
  'BOND-06': act(
    'tsvHybridBond',
    [20, 28],
    'DFM engineer',
    [
      [1, 'Assemble the 3D design rule deck from the process rules', 2],
      [2, 'Add the assembly and bonding checks to the deck', 2],
      [3, 'Run the deck against the partitioning floorplan', 2, 1],
      [4, 'Release the 3D rule deck to the design teams', 4],
    ],
    [
      'Draft 3D design rule deck',
      'Assembly and bonding checks in the deck',
      'Deck run results on the partition floorplan',
      '3D design rule deck, released',
    ],
    [['BOND-D6', 'produces']],
  ),

  /* --- die-to-die interface and IP readiness --- */
  'D2D-01': act(
    'd2dInterface',
    [0, 6],
    'Interface architect',
    [
      [1, 'Compare UCIe, BoW and a custom interface against the budget', 2],
      [2, 'Check each against the bonding pitch that was selected', 1.5],
      [3, 'Assess the ecosystem and interoperability cost of each', 1.5, 1],
      [4, 'Select the interface standard and the profile within it', 2.5],
    ],
    [
      'Interface option comparison against the budget',
      'Bonding pitch compatibility check',
      'Ecosystem and interoperability cost assessment',
      'Interface standard selection record',
    ],
    [['D2D-D1', 'produces'], ['D2D-D2', 'feeds']],
  ),
  'D2D-02': act(
    'd2dInterface',
    [4, 12],
    'IP manager',
    [
      [1, 'Shortlist the D2D PHY IP against the selected profile', 2],
      [2, 'Review each vendor’s silicon evidence at this pitch', 2],
      [3, 'Check the deliverable set — models, views, test collateral', 2, 1],
      [4, 'Commit the vendor and place the IP schedule on the plan', 4],
    ],
    [
      'D2D PHY IP shortlist',
      'Vendor silicon evidence review',
      'IP deliverable set checklist',
      'D2D PHY IP commitment and schedule',
    ],
    [['D2D-D2', 'produces'], ['D2D-D6', 'feeds']],
  ),
  'D2D-03': act(
    'd2dInterface',
    [8, 18],
    'Link architect',
    [
      [1, 'Define the link layer framing and flow control', 2.5],
      [2, 'Define the retry, error detection and correction scheme', 2.5],
      [3, 'Model the latency the protocol adds under load', 2, 1],
      [4, 'Freeze the protocol and hand it to the die teams', 5],
    ],
    [
      'Link layer framing and flow control definition',
      'Retry, error detection and correction scheme',
      'Protocol latency model under load',
      'Link layer and protocol specification',
    ],
    [['D2D-D3', 'produces'], ['D2D-D6', 'feeds']],
  ),
  'D2D-04': act(
    'd2dInterface',
    [12, 22],
    'Package and bump engineer',
    [
      [1, 'Draw the bump map from the interface and power needs', 3],
      [2, 'Add the redundancy the repair scheme requires', 2],
      [3, 'Check the map against the bonding alignment budget', 2, 1],
      [4, 'Freeze the bump map across both dies', 5],
    ],
    [
      'Draft inter-die bump map',
      'Redundant bump allocation',
      'Bump map check against the alignment budget',
      'Frozen inter-die bump map',
    ],
    [['D2D-D4', 'produces'], ['D2D-D5', 'feeds']],
  ),
  'D2D-05': act(
    'd2dInterface',
    [16, 26],
    'DFT architect',
    [
      [1, 'Define the die-level test access for a stacked part', 2.5],
      [2, 'Adopt the IEEE 1838 wrapper and port structure', 2.5],
      [3, 'Define the link repair and lane remap mechanism', 2, 1],
      [4, 'Review the test and repair architecture with test development', 5],
    ],
    [
      'Die-level test access definition',
      'IEEE 1838 wrapper and port structure',
      'Lane repair and remap mechanism',
      'D2D test and repair architecture',
    ],
    [['D2D-D5', 'produces']],
  ),
  'D2D-06': act(
    'd2dInterface',
    [20, 30],
    'Verification lead',
    [
      [1, 'Build the interface compliance test suite', 3],
      [2, 'Verify the link against the protocol specification', 3],
      [3, 'Run interoperability checks against the vendor model', 2, 1],
      [4, 'Report compliance and close the interface', 4],
    ],
    [
      'Interface compliance test suite',
      'Protocol verification results',
      'Interoperability results against the vendor model',
      'Interface compliance and interop report',
    ],
    [['D2D-D6', 'produces']],
  ),

  /* --- daisy chain test vehicle --- */
  'DCTV-01': act(
    'dctv',
    [0, 6],
    'Package engineer',
    [
      [1, 'State what the daisy chain vehicle has to prove', 1],
      [2, 'Segment the chains so a failure names the bond level it is at', 1.5],
      [3, 'Set the continuity and contact resistance limits', 1.5, 1],
      [4, 'Agree the sample plan and the build quantity with the OSAT', 1.5],
      [5, 'Review the vehicle scope and release it', 2],
    ],
    [
      'Vehicle objectives',
      'Chain segmentation plan by bond level',
      'Continuity and contact resistance limits',
      'Sample plan and build quantity',
      'DCTV scope and coverage matrix',
    ],
    [['DCTV-D1', 'produces'], ['DCTV-D2', 'feeds']],
  ),
  'DCTV-02': act(
    'dctv',
    [4, 14],
    'Package design engineer',
    [
      [1, 'Design the daisy chain dies at the product bump pitch', 3],
      [2, 'Design the interposer and substrate chains to match', 3],
      [3, 'Add the probe pads and the measurement structures', 2, 1],
      [4, 'Check the vehicle against the 3D design rule deck', 2],
      [5, 'Release the daisy chain design database', 2],
    ],
    [
      'Daisy chain die layouts',
      'Interposer and substrate chain layouts',
      'Probe pad and measurement structure placement',
      '3D rule deck check results on the vehicle',
      'Daisy chain vehicle design database',
    ],
    [['DCTV-D2', 'produces'], ['DCTV-D3', 'feeds']],
  ),
  'DCTV-03': act(
    'dctv',
    [10, 22],
    'Test vehicle program manager',
    [
      [1, 'Order the vehicle mask tooling', 2],
      [2, 'Track the vehicle wafer build at the foundry', 5],
      [3, 'Build the interposer and substrate lots in parallel', 4, 1],
      [4, 'Inspect and release the vehicle material to assembly', 3],
    ],
    [
      'Vehicle mask tooling order',
      'Vehicle wafers out of fab',
      'Interposer and substrate lots',
      'Built vehicle lots with travelers',
    ],
    [['DCTV-D3', 'produces'], ['DCTV-D4', 'feeds']],
  ),
  'DCTV-04': act(
    'dctv',
    [18, 28],
    'OSAT process engineer',
    [
      [1, 'Define the assembly DOE across bond force, temperature and time', 2],
      [2, 'Run the bonding splits on the vehicle lots', 3],
      [3, 'Inspect the bonded stacks by X-ray and acoustic imaging', 2, 1],
      [4, 'Record the assembly yield of each split', 2],
      [5, 'Review the DOE result with the design and process teams', 3],
    ],
    [
      'Assembly DOE matrix',
      'Bonded vehicle stacks by split',
      'X-ray and CSAM inspection results',
      'Assembly yield by split',
      'Assembly DOE result on the vehicle',
    ],
    [['DCTV-D4', 'produces'], ['DCTV-D7', 'feeds']],
  ),
  'DCTV-05': act(
    'dctv',
    [22, 30],
    'Package test engineer',
    [
      [1, 'Set up the daisy chain continuity measurement', 1.5],
      [2, 'Measure continuity across every chain segment', 2],
      [3, 'Measure contact resistance against the limit', 2, 1],
      [4, 'Locate the opens and shorts to a bond level', 2],
      [5, 'Report continuity and resistance against the criteria', 2.5],
    ],
    [
      'Continuity measurement setup and correlation',
      'Chain continuity map',
      'Contact resistance distribution',
      'Open and short locations by bond level',
      'Continuity and contact resistance data',
    ],
    [['DCTV-D5', 'produces'], ['DCTV-D7', 'feeds']],
  ),
  'DCTV-06': act(
    'dctv',
    [24, 32],
    'Reliability engineer',
    [
      [1, 'Precondition the assembled vehicles', 1.5],
      [2, 'Run temperature cycling on the vehicle population', 3],
      [3, 'Re-measure the chains at each readout', 2, 1],
      [4, 'Analyse the failures by bond level and location', 2],
      [5, 'Report the reliability of the bond interface', 1.5],
    ],
    [
      'Preconditioned vehicle population',
      'Temperature cycling readout log',
      'Chain resistance drift by readout',
      'Failure analysis by bond level and location',
      'Vehicle reliability report',
    ],
    [['DCTV-D6', 'produces'], ['DCTV-D8', 'feeds']],
  ),
  'DCTV-07': act(
    'dctv',
    [28, 34],
    'Package engineer',
    [
      [1, 'Correlate assembly yield against the DOE parameters', 2],
      [2, 'Choose the process window the product will be built in', 1.5],
      [3, 'Feed the failures back into the bump map and rule deck', 1.5, 1],
      [4, 'Freeze the 3D assembly process window', 1],
      [5, 'Sign the vehicle off as the gate for product assembly', 1.5],
    ],
    [
      'Assembly yield learning report',
      'Chosen product process window',
      'Bump map and rule deck change requests',
      'Frozen 3D assembly process window',
      'Vehicle signoff for product assembly',
    ],
    [['DCTV-D7', 'produces'], ['DCTV-D8', 'produces']],
  ),

  /* --- 3D stack integration and signoff --- */
  '3DI-01': act(
    'threeDIntegration',
    [0, 8],
    'Physical design lead',
    [
      [1, 'Place the TSV fields against each die’s floorplan', 2],
      [2, 'Align the bump map across the stacked dies', 2],
      [3, 'Reserve the keep-outs the bonding process requires', 2, 1],
      [4, 'Review the 3D floorplan with every die owner', 4],
    ],
    [
      'TSV field placement per die',
      'Cross-die bump alignment',
      'Bonding keep-out reservations',
      '3D floorplan with aligned bump and TSV fields',
    ],
    [['3DI-D1', 'produces'], ['3DI-D2', 'feeds']],
  ),
  '3DI-02': act(
    'threeDIntegration',
    [4, 12],
    'Power delivery engineer',
    [
      [1, 'Build the stacked power delivery model through the TSVs', 2],
      [2, 'Analyse IR drop across the dies together', 2.5],
      [3, 'Size the TSV count and strap width for the load', 2, 1],
      [4, 'Close the stack power delivery against the budget', 3.5],
    ],
    [
      'Stacked power delivery model through the TSVs',
      'Stack IR drop analysis',
      'TSV count and strap sizing',
      'Stack power delivery and IR report',
    ],
    [['3DI-D2', 'produces'], ['3DI-D6', 'feeds']],
  ),
  '3DI-03': act(
    'threeDIntegration',
    [8, 18],
    'Timing lead',
    [
      [1, 'Build the inter-die timing model for the links', 2.5],
      [2, 'Budget the die-to-die path across both dies', 2.5],
      [3, 'Analyse timing across the stack corners', 2.5, 1],
      [4, 'Close the inter-die timing and publish the budget', 5],
    ],
    [
      'Inter-die timing model',
      'Die-to-die path budget',
      'Stack corner timing analysis',
      'Inter-die timing closure report',
    ],
    [['3DI-D3', 'produces'], ['3DI-D6', 'feeds']],
  ),
  '3DI-04': act(
    'threeDIntegration',
    [10, 20],
    'Thermal engineer',
    [
      [1, 'Assemble the thermal model of the assembled stack', 2.5],
      [2, 'Simulate the workload power maps through the stack', 3],
      [3, 'Find the thermal limit each die imposes on the others', 2, 1],
      [4, 'Agree the thermal design point with the system team', 4.5],
    ],
    [
      'Assembled stack thermal model',
      'Workload thermal maps through the stack',
      'Per-die thermal limits',
      'Stack thermal simulation report',
    ],
    [['3DI-D4', 'produces'], ['3DI-D5', 'feeds']],
  ),
  '3DI-05': act(
    'threeDIntegration',
    [12, 22],
    'Package mechanical engineer',
    [
      [1, 'Model warpage of the stack through the reflow profile', 3],
      [2, 'Analyse stress at the bond interface and the TSVs', 3],
      [3, 'Check the result against the vehicle measurements', 2, 1],
      [4, 'Close warpage and stress against the assembly window', 4],
    ],
    [
      'Reflow warpage model',
      'Bond interface and TSV stress analysis',
      'Correlation to the vehicle measurements',
      'Warpage and stress co-analysis report',
    ],
    [['3DI-D5', 'produces'], ['3DI-D6', 'feeds']],
  ),
  '3DI-06': act(
    'threeDIntegration',
    [30, 40],
    'Signoff lead',
    [
      [1, 'Run multi-die static timing on the assembled netlists', 2.5],
      [2, 'Run the assembly and 3D design rule checks', 2],
      [3, 'Collect the stack signoff waivers and their reasons', 1.5, 1],
      [4, 'Sign the stack off for mask release', 3.5],
    ],
    [
      'Multi-die static timing results',
      'Assembly and 3D DRC results',
      'Stack signoff waiver list',
      '3D stack signoff package',
    ],
    [['3DI-D6', 'produces']],
  ),

  /* --- known-good-die and stack sort --- */
  'KGD-01': act(
    'kgdSort',
    [0, 5],
    'Product engineering',
    [
      [1, 'Turn the yield economics into known-good-die criteria', 1.5],
      [2, 'Define the sort flow that proves each criterion', 1.5],
      [3, 'Agree the criteria with the stacking partner', 1, 1],
      [4, 'Release the KGD definition to test development', 2],
    ],
    [
      'Draft KGD criteria from the yield economics',
      'KGD sort flow',
      'Stacking partner agreement on the criteria',
      'Known-good-die criteria',
    ],
    [['KGD-D1', 'produces'], ['KGD-D2', 'feeds']],
  ),
  'KGD-02': act(
    'kgdSort',
    [3, 9],
    'Test engineer',
    [
      [1, 'Extend the wafer sort program to the KGD criteria', 2],
      [2, 'Add the D2D link tests reachable before bonding', 2],
      [3, 'Set the limits and guard bands for stacking', 1.5, 1],
      [4, 'Release the sort program for the stacking lots', 2],
    ],
    [
      'Sort program extended to the KGD criteria',
      'Pre-bond D2D link tests',
      'Stacking limits and guard bands',
      'Wafer sort program for stacking',
    ],
    [['KGD-D2', 'produces'], ['KGD-D3', 'feeds']],
  ),
  'KGD-03': act(
    'kgdSort',
    [6, 12],
    'Yield engineer',
    [
      [1, 'Build the die-matching rules for stack pairing', 2],
      [2, 'Bin the dies by the parameters the stack cares about', 2],
      [3, 'Model the compound yield of the pairing rules', 1.5, 1],
      [4, 'Release the pairing and binning plan to assembly', 2],
    ],
    [
      'Die-matching rules',
      'Parametric die bins',
      'Compound yield model of the pairing rules',
      'Die matching and binning plan',
    ],
    [['KGD-D3', 'produces'], ['KGD-D4', 'feeds']],
  ),
  'KGD-04': act(
    'kgdSort',
    [9, 16],
    'Operations planner',
    [
      [1, 'Plan the thinned wafer handling to the OSAT', 2],
      [2, 'Set the traceability from wafer map to stacked unit', 2],
      [3, 'Agree the carrier logistics and storage limits', 1.5, 1],
      [4, 'Release the known-good dies to assembly', 3],
    ],
    [
      'Thinned wafer handling plan',
      'Wafer-to-stack traceability map',
      'Carrier logistics and storage limits',
      'Known-good die release record',
    ],
    [['KGD-D4', 'produces']],
  ),

  /* --- product stack bonding --- */
  'STK-01': act(
    'stackBonding',
    [0, 3],
    'Stack integration engineer',
    [
      [1, 'Confirm the bond recipe against the frozen process window', 0.5],
      [2, 'Plan the die pairing and bond sequence from the binning plan', 0.5, 1],
      [3, 'Prepare and plasma-activate the bonding surfaces of both dies', 0.5],
      [4, 'Bond the known-good dies and run the bond anneal', 1.5],
    ],
    ['Bond recipe checked against the process window', 'Die pairing and bond sequence', 'Activated bonding surfaces on both dies', 'Bonded stack lots'],
    [['STK-D1', 'produces'], ['STK-D4', 'feeds']],
  ),
  'STK-02': act(
    'stackBonding',
    [2, 4],
    'Stack quality engineer',
    [
      [1, 'Scan the bonded stacks by CSAM for voids and delamination', 0.75],
      [2, 'Measure bond overlay and alignment by IR metrology', 0.5, 1],
      [3, 'X-ray the stacks for bond and TSV defects', 0.5],
      [4, 'Disposition the stacks against the inspection limits', 0.75],
    ],
    ['CSAM void and delamination map', 'Bond overlay measurements', 'X-ray defect results', 'Post-bond inspection disposition'],
    [['STK-D2', 'produces']],
  ),
  'STK-03': act(
    'stackBonding',
    [3, 7],
    'Backside process engineer',
    [
      [1, 'Thin the bottom die substrate to the TSV reveal target', 1],
      [2, 'Reveal the TSVs and passivate the backside', 1],
      [3, 'Form the backside RDL and the package bumps', 1.5],
      [4, 'Measure TSV resistance and bump coplanarity', 0.5],
    ],
    ['Thinned bottom die at the reveal target', 'Revealed and passivated TSVs', 'Backside RDL and package bumps', 'TSV resistance and bump coplanarity data'],
    [['STK-D3', 'produces'], ['STK-D4', 'feeds']],
  ),
  'STK-04': act(
    'stackBonding',
    [6, 8],
    'Operations planner',
    [
      [1, 'Dice the bonded wafers into stacks', 0.5],
      [2, 'Link each stack to its top and bottom die records', 0.5, 1],
      [3, 'Sort the stacks for assembly on the post-bond results', 0.5],
      [4, 'Release the known-good stacks to package assembly', 1],
    ],
    ['Singulated stacks', 'Stack-to-die traceability records', 'Stack sort for assembly', 'Released stacks for package assembly'],
    [['STK-D4', 'produces']],
  ),

  /* --- multi-die test and repair --- */
  'MDT-01': act(
    'multiDieTest',
    [0, 8],
    'Test architect',
    [
      [1, 'Define what is tested before, during and after bonding', 2],
      [2, 'Plan the test access into dies reachable only through others', 2.5],
      [3, 'Set the coverage each insertion has to reach', 2, 1],
      [4, 'Review the post-bond test strategy and release it', 3.5],
    ],
    [
      'Pre-, mid- and post-bond test insertion plan',
      'Buried-die test access plan',
      'Coverage target per insertion',
      'Post-bond test strategy',
    ],
    [['MDT-D1', 'produces'], ['MDT-D3', 'feeds']],
  ),
  'MDT-02': act(
    'multiDieTest',
    [6, 16],
    'DFT engineer',
    [
      [1, 'Bring up the die-to-die link BIST on the stack', 3],
      [2, 'Exercise the lane repair and remap mechanism', 2.5],
      [3, 'Measure the link margin across voltage and temperature', 2.5, 1],
      [4, 'Report the link BIST and repair readiness', 4.5],
    ],
    [
      'Link BIST bring-up results',
      'Lane repair and remap validation',
      'Link margin across voltage and temperature',
      'D2D BIST and repair bring-up report',
    ],
    [['MDT-D2', 'produces'], ['MDT-D5', 'feeds']],
  ),
  'MDT-03': act(
    'multiDieTest',
    [12, 22],
    'Test engineer',
    [
      [1, 'Port each die’s ATPG patterns to the stacked access path', 3],
      [2, 'Reduce the pattern volume against the tester memory', 2.5],
      [3, 'Debug the patterns on the first assembled stacks', 3, 1],
      [4, 'Release the stack-level pattern set', 4.5],
    ],
    [
      'Stack-access ATPG patterns, ported',
      'Pattern set within tester memory',
      'Pattern debug log from the first stacks',
      'Stack-level pattern set',
    ],
    [['MDT-D3', 'produces'], ['MDT-D4', 'feeds']],
  ),
  'MDT-04': act(
    'multiDieTest',
    [18, 26],
    'Product engineering',
    [
      [1, 'Define what makes an assembled stack known good', 2],
      [2, 'Set the binning rules for the stacked part', 2],
      [3, 'Decide what is repaired and what is scrapped', 1.5, 1],
      [4, 'Release the known-good-stack criteria to production', 4],
    ],
    [
      'Known-good-stack definition',
      'Binning rules for the stacked part',
      'Repair-or-scrap disposition rules',
      'Known-good-stack criteria',
    ],
    [['MDT-D4', 'produces'], ['MDT-D5', 'feeds']],
  ),
  'MDT-05': act(
    'multiDieTest',
    [22, 30],
    'Quality engineer',
    [
      [1, 'Analyse the escapes the stacked flow lets through', 2.5],
      [2, 'Attribute each escape to a die, a bond or the flow', 2],
      [3, 'Measure the repair yield against the redundancy budget', 2, 1],
      [4, 'Feed the analysis back into the test and assembly flows', 3.5],
    ],
    [
      'Test escape analysis',
      'Escape attribution by die, bond and flow',
      'Repair yield against the redundancy budget',
      'Test escape and repair yield analysis',
    ],
    [['MDT-D5', 'produces']],
  ),
};

export const THREE_DIC_ACTIVITY_TITLES: Record<string, string> = {
  'PART-01': 'Stack Topology and Partitioning Study',
  'PART-02': 'Die-to-Die Bandwidth and Power Budget',
  'PART-03': 'Stack Thermal and Power Delivery Budget',
  'PART-04': 'Known-Good-Die and Yield Economics',
  'PART-05': 'Partition Freeze and Interface Contract',
  'BOND-01': 'Bonding Scheme Selection — Micro-Bump or Hybrid',
  'BOND-02': 'TSV and Backside Process Rules',
  'BOND-03': 'Bond Pitch, Overlay and Alignment Capability',
  'BOND-04': 'Wafer Thinning, Handling and Carrier Flow',
  'BOND-05': 'Bond Interface Reliability and Thermal Budget',
  'BOND-06': '3D Design Rule Deck and DFM Release',
  'D2D-01': 'Die-to-Die Interface Standard Selection',
  'D2D-02': 'D2D PHY IP Evaluation and Vendor Commitment',
  'D2D-03': 'Link Layer, Protocol and Retry Architecture',
  'D2D-04': 'Inter-Die Bump Map, Redundancy and Repair',
  'D2D-05': 'D2D Test and Repair Architecture (IEEE 1838)',
  'D2D-06': 'Interface Compliance and Interoperability Verification',
  'DCTV-01': 'DCTV Scope and Chain Topology Definition',
  'DCTV-02': 'Daisy Chain Die and Interposer Design',
  'DCTV-03': 'Vehicle Mask Tooling and Wafer Build',
  'DCTV-04': 'OSAT Assembly DOE on the Daisy Chain Vehicle',
  'DCTV-05': 'Daisy Chain Continuity and Contact Resistance Test',
  'DCTV-06': 'Thermal Cycling and Bond Reliability on the Vehicle',
  'DCTV-07': 'Assembly Yield Learning and Process Window Freeze',
  '3DI-01': '3D Floorplan, TSV and Bump Alignment',
  '3DI-02': 'Stack Power Delivery and IR Closure',
  '3DI-03': 'Inter-Die Timing Budget and Closure',
  '3DI-04': 'Stack Thermal Co-Simulation',
  '3DI-05': 'Warpage and Stress Co-Analysis',
  '3DI-06': 'Multi-Die Signoff and Assembly DRC',
  'KGD-01': 'Known-Good-Die Criteria and Sort Flow',
  'KGD-02': 'Wafer Sort Program for Stacking',
  'KGD-03': 'Die Matching and Binning for Stack Pairing',
  'KGD-04': 'Thinned Wafer Handling and Die Release',
  'STK-01': 'Product Hybrid Bonding Run on Known-Good Dies',
  'STK-02': 'Post-Bond Inspection and Overlay Verification',
  'STK-03': 'Backside Thinning, TSV Reveal and Backside RDL',
  'STK-04': 'Stack Singulation, Traceability and Release to Assembly',
  'MDT-01': 'Post-Bond Test Strategy and Access Plan',
  'MDT-02': 'D2D Link BIST and Repair Bring-Up',
  'MDT-03': 'Stack-Level ATPG and Pattern Porting',
  'MDT-04': 'Known-Good-Stack Criteria and Binning',
  'MDT-05': 'Test Escape and Repair Yield Analysis',
};

/* ---------- stage content ---------- */

const leaderOf = (name: string, short: string, line: string, mail: string) => ({
  name,
  short,
  phone: `+1 (408) 555-${line}`,
  email: mail,
});

export const THREE_DIC_STAGES: readonly ThreeDicStage[] = [
  {
    id: 'chipletPartitioning',
    stage: 24,
    title: '3D Architecture & Chiplet Partitioning',
    shortTitle: 'PART',
    tagline: 'Decide where the design is cut, before anything is drawn.',
    description:
      'Choose the stack topology and where the product is split into dies. Everything downstream — the interface, the bump map, the thermal ceiling, the yield model — follows from this, and it is the one decision a 3DIC programme cannot revisit cheaply.',
    activities: ['Topology study', 'D2D budget', 'Thermal budget', 'Yield economics', 'Partition freeze'],
    deliverables: [
      'Stack topology decision record',
      'Die-to-die bandwidth and power budget',
      'Stack thermal and power budget',
      'Stack yield and KGD economics',
      'Partition freeze package with the inter-die interface contract',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [5, 7, 9, 10, 14],
    engineeringView: [
      'Stack Topology and Partitioning Study',
      'Die-to-Die Bandwidth and Power Budget',
      'Stack Thermal and Power Delivery Budget',
      'Known-Good-Die and Yield Economics',
      'Partition Freeze and Interface Contract',
    ],
    engineeringTat: [5, 5, 5, 5, 5],
    engineeringEffort: [6, 5, 5, 4, 5],
    engineeringStart: [0, 2, 4, 5, 9],
    risks: ['Partition reopened late', 'Bandwidth budget unfunded', 'Thermal ceiling discovered after floorplan'],
    potentialRisks: [
      'Partitioning chosen on die cost alone, with no thermal screen',
      'Interface contract agreed verbally and never written down',
      'Yield economics assuming a KGD screen nobody has built',
      'A split that needs more bumps than the bonding pitch allows',
    ],
    leader: leaderOf('Hyun-woo Jang', 'H. Jang', '0311', 'hyunwoo.jang@example.com'),
    collaboration: ['Architecture', 'Package', 'Product engineering', 'Thermal'],
    tools: ['System models', 'Yield models', 'Thermal solver'],
    programView: ['Partition freeze date', 'Die list and owners', 'Interface contract status'],
    perspective: 'A short engineering or program-management insight will appear here.',
  },
  {
    id: 'tsvHybridBond',
    stage: 25,
    title: 'TSV & Hybrid Bond Process Enablement',
    shortTitle: 'BOND',
    tagline: 'Fix how the dies are joined, and what that costs the design.',
    description:
      'Select the bonding scheme and turn the foundry and OSAT capability into rules the design can be held to: TSV and backside rules, bond pitch and alignment, thinning and handling, the thermal budget assembly may spend, and the 3D rule deck that enforces all of it.',
    activities: ['Bonding scheme', 'TSV rules', 'Alignment capability', 'Thinning flow', 'Reliability plan', '3D rule deck'],
    deliverables: [
      'Bonding scheme selection record',
      'TSV and backside process rule set',
      'Bond pitch and alignment capability statement',
      'Thinning and handling flow definition',
      'Bond reliability and thermal budget plan',
      '3D design rule deck, released',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [6, 12, 16, 20, 24, 28],
    engineeringView: [
      'Bonding Scheme Selection — Micro-Bump or Hybrid',
      'TSV and Backside Process Rules',
      'Bond Pitch, Overlay and Alignment Capability',
      'Wafer Thinning, Handling and Carrier Flow',
      'Bond Interface Reliability and Thermal Budget',
      '3D Design Rule Deck and DFM Release',
    ],
    engineeringTat: [6, 8, 8, 8, 8, 8],
    engineeringEffort: [4, 7, 6, 6, 6, 5],
    engineeringStart: [0, 4, 8, 12, 16, 20],
    risks: ['Bonding capability below the design assumption', 'Rule deck late to the design teams'],
    potentialRisks: [
      'Hybrid bonding assumed at a pitch the line has not demonstrated',
      'TSV keep-outs arriving after the floorplan is frozen',
      'Thinned wafer handling qualified on monitors only',
      'Assembly thermal budget spent twice — once by design, once by the line',
    ],
    leader: leaderOf('Marta Feld', 'M. Feld', '0342', 'marta.feld@example.com'),
    collaboration: ['Foundry', 'OSAT', 'Package', 'Reliability'],
    tools: ['Process rule decks', 'Metrology', 'Bond aligners'],
    programView: ['Bonding scheme decision', 'Rule deck release date', 'Capability versus design need'],
    perspective: 'A short engineering or program-management insight will appear here.',
  },
  {
    id: 'd2dInterface',
    stage: 26,
    title: 'Die-to-Die Interface & IP Readiness',
    shortTitle: 'D2D',
    tagline: 'The link the dies exist on either side of.',
    description:
      'Select the interface, commit the PHY IP, fix the protocol, freeze the bump map both dies are drawn to, and define how the link is tested and repaired once it is buried inside a stack.',
    activities: ['Standard selection', 'PHY IP', 'Protocol', 'Bump map', 'Test and repair', 'Compliance'],
    deliverables: [
      'Interface standard selection record',
      'D2D PHY IP commitment and schedule',
      'Link layer and protocol specification',
      'Frozen inter-die bump map',
      'D2D test and repair architecture',
      'Interface compliance and interop report',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [6, 12, 18, 22, 26, 30],
    engineeringView: [
      'Die-to-Die Interface Standard Selection',
      'D2D PHY IP Evaluation and Vendor Commitment',
      'Link Layer, Protocol and Retry Architecture',
      'Inter-Die Bump Map, Redundancy and Repair',
      'D2D Test and Repair Architecture (IEEE 1838)',
      'Interface Compliance and Interoperability Verification',
    ],
    engineeringTat: [6, 8, 10, 10, 10, 10],
    engineeringEffort: [4, 6, 8, 7, 7, 8],
    engineeringStart: [0, 4, 8, 12, 16, 20],
    risks: ['Bump map reopened after floorplan', 'PHY IP silicon evidence thin at this pitch'],
    potentialRisks: [
      'Interface chosen before the bonding pitch is known',
      'Redundancy budget agreed without a repair mechanism to spend it',
      'Compliance run against a model rather than the delivered IP',
      'Test access designed for a die that is no longer reachable once bonded',
    ],
    leader: leaderOf('Tomás Vega', 'T. Vega', '0377', 'tomas.vega@example.com'),
    collaboration: ['Architecture', 'IP vendors', 'DFT', 'Package'],
    tools: ['Link models', 'Compliance suites', 'Bump map tools'],
    programView: ['Interface freeze date', 'IP commitment status', 'Bump map status'],
    perspective: 'A short engineering or program-management insight will appear here.',
  },
  {
    id: 'dctv',
    stage: 27,
    title: 'DCTV — Daisy Chain Test Vehicle',
    shortTitle: 'DCTV',
    tagline: 'Prove the stack can be assembled before the product exists.',
    description:
      'Build and measure a daisy chain vehicle: dummy dies and interposer whose bumps and TSVs are wired into chains, assembled through the real process, then measured for continuity and resistance and stressed. It is how a programme learns its assembly yield and freezes a process window before product silicon is committed to it.',
    activities: ['Scope and chains', 'Vehicle design', 'Build', 'Assembly DOE', 'Continuity test', 'Reliability', 'Process window'],
    deliverables: [
      'DCTV scope and coverage matrix',
      'Daisy chain vehicle design database',
      'Built vehicle lots with travelers',
      'Assembly DOE result on the vehicle',
      'Continuity and contact resistance data',
      'Vehicle reliability report',
      'Assembly yield learning report',
      'Frozen 3D assembly process window',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 6],
    deliverableWeek: [6, 14, 22, 28, 30, 32, 31, 34],
    engineeringView: [
      'DCTV Scope and Chain Topology Definition',
      'Daisy Chain Die and Interposer Design',
      'Vehicle Mask Tooling and Wafer Build',
      'OSAT Assembly DOE on the Daisy Chain Vehicle',
      'Daisy Chain Continuity and Contact Resistance Test',
      'Thermal Cycling and Bond Reliability on the Vehicle',
      'Assembly Yield Learning and Process Window Freeze',
    ],
    engineeringTat: [6, 10, 12, 10, 8, 8, 6],
    engineeringEffort: [4, 9, 7, 10, 6, 7, 5],
    engineeringStart: [0, 4, 10, 18, 22, 24, 28],
    risks: ['Vehicle results after product wafer-out', 'Chains too coarse to locate a failure'],
    potentialRisks: [
      'Vehicle built at a pitch the product does not use',
      'Continuity measured once, with no thermal cycling behind it',
      'Process window frozen on a single assembly split',
      'Failures located to the stack but not to a bond level',
      'Vehicle schedule planned without the OSAT line time to run it',
    ],
    leader: leaderOf('Sofia Lindqvist', 'S. Lindqvist', '0408', 'sofia.lindqvist@example.com'),
    collaboration: ['Package', 'OSAT', 'Reliability', 'Test'],
    tools: ['Daisy chain probers', 'X-ray / CSAM', 'Thermal cycling chambers'],
    programView: ['Vehicle build date', 'Assembly yield learning', 'Process window freeze date'],
    perspective: 'A short engineering or program-management insight will appear here.',
  },
  {
    id: 'threeDIntegration',
    stage: 28,
    title: '3D Stack Integration & Signoff',
    shortTitle: '3DI',
    tagline: 'Close the stack as one part, not two good dies.',
    description:
      'Bring the dies together as a stack: aligned floorplans and TSV fields, power delivered through the stack, timing budgeted across the link, and thermal, warpage and stress analysed on the assembly the vehicle measured. It closes on a signoff the mask release depends on.',
    activities: ['3D floorplan', 'Stack PDN', 'Inter-die timing', 'Thermal', 'Warpage and stress', 'Multi-die signoff'],
    deliverables: [
      '3D floorplan with aligned bump and TSV fields',
      'Stack power delivery and IR report',
      'Inter-die timing closure report',
      'Stack thermal simulation report',
      'Warpage and stress co-analysis report',
      '3D stack signoff package',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [8, 12, 18, 20, 22, 40],
    engineeringView: [
      '3D Floorplan, TSV and Bump Alignment',
      'Stack Power Delivery and IR Closure',
      'Inter-Die Timing Budget and Closure',
      'Stack Thermal Co-Simulation',
      'Warpage and Stress Co-Analysis',
      'Multi-Die Signoff and Assembly DRC',
    ],
    engineeringTat: [8, 8, 10, 10, 10, 10],
    engineeringEffort: [9, 8, 10, 8, 7, 9],
    engineeringStart: [0, 4, 8, 10, 12, 30],
    risks: ['Inter-die timing closed on one die’s assumptions', 'Thermal limit found after floorplan freeze'],
    potentialRisks: [
      'Each die signed off alone and the stack signed off by addition',
      'Warpage modelled but never correlated to the vehicle',
      'IR analysed per die, with the TSV path assumed ideal',
      'Assembly DRC run after the database is released',
    ],
    leader: leaderOf('Priya Raman', 'P. Raman', '0433', 'priya.raman@example.com'),
    collaboration: ['Physical design', 'Signoff', 'Package', 'Thermal'],
    tools: ['Multi-die STA', '3D extraction', 'Thermal and warpage solvers'],
    programView: ['Stack signoff date', 'Inter-die timing status', 'Thermal design point'],
    perspective: 'A short engineering or program-management insight will appear here.',
  },
  {
    id: 'kgdSort',
    stage: 29,
    title: 'Known-Good-Die & Stack Sort',
    shortTitle: 'KGD',
    tagline: 'Only good dies go into a stack.',
    description:
      'Turn the yield economics into criteria, prove them at wafer sort, pair and bin the dies the stack will be built from, and get thinned wafers to the assembly line with their traceability intact.',
    activities: ['KGD criteria', 'Sort program', 'Matching and binning', 'Handling and release'],
    deliverables: [
      'Known-good-die criteria',
      'Wafer sort program for stacking',
      'Die matching and binning plan',
      'Known-good die release record',
    ],
    deliverableFrom: [0, 1, 2, 3],
    deliverableWeek: [5, 9, 12, 16],
    engineeringView: [
      'Known-Good-Die Criteria and Sort Flow',
      'Wafer Sort Program for Stacking',
      'Die Matching and Binning for Stack Pairing',
      'Thinned Wafer Handling and Die Release',
    ],
    engineeringTat: [5, 6, 6, 7],
    engineeringEffort: [4, 6, 5, 4],
    engineeringStart: [0, 3, 6, 9],
    risks: ['KGD screen weaker than the stack assumes', 'Traceability lost at the thinning step'],
    potentialRisks: [
      'KGD criteria written after the sort program is frozen',
      'Pairing rules that no binning data supports',
      'Stacking a die that was never tested at the stack’s corner',
    ],
    leader: leaderOf('Daniel Oyelaran', 'D. Oyelaran', '0461', 'daniel.oyelaran@example.com'),
    collaboration: ['Test', 'Yield', 'Operations', 'OSAT'],
    tools: ['Wafer sort', 'Yield database', 'Traceability systems'],
    programView: ['KGD readiness', 'Sort program release', 'Die availability for assembly'],
    perspective: 'A short engineering or program-management insight will appear here.',
  },
  {
    id: 'stackBonding',
    stage: 30,
    title: 'Product Stack Bonding',
    shortTitle: 'STK',
    tagline: 'Join the dies that sorted good, and prove the joint before it is packaged.',
    description:
      'Bond the product: known-good top and bottom dies joined in the process window the vehicle froze, inspected for voids and overlay, thinned to reveal the bottom die’s TSVs, given their backside redistribution and bumps, and released to package assembly as stacks that can be traced back to both dies.',
    activities: ['Bonding run', 'Post-bond inspection', 'Backside and TSV reveal', 'Release to assembly'],
    deliverables: [
      'Bonded product stack lots',
      'Post-bond inspection report',
      'Backside-processed stack wafers',
      'Stack release record for package assembly',
    ],
    deliverableFrom: [0, 1, 2, 3],
    deliverableWeek: [3, 4, 7, 8],
    engineeringView: [
      'Product Hybrid Bonding Run on Known-Good Dies',
      'Post-Bond Inspection and Overlay Verification',
      'Backside Thinning, TSV Reveal and Backside RDL',
      'Stack Singulation, Traceability and Release to Assembly',
    ],
    engineeringTat: [3, 2, 4, 2],
    engineeringEffort: [6, 3, 6, 3],
    engineeringStart: [0, 2, 3, 6],
    risks: ['Bond yield below the vehicle’s', 'TSV reveal damage found after RDL'],
    potentialRisks: [
      'Bonding run started before both dies’ KGD data is in',
      'Surface contamination between activation and bond',
      'Voids found by CSAM with no rule for what to scrap',
      'Traceability from stack to die lost at dicing',
    ],
    leader: leaderOf('Ji-won Seo', 'J. Seo', '0519', 'jiwon.seo@example.com'),
    collaboration: ['Foundry', 'OSAT', 'Product engineering', 'Quality'],
    tools: ['Hybrid bonders', 'CSAM, X-ray and IR metrology', 'Backside grind and CMP'],
    programView: ['Stack bonding yield', 'Stacks released to assembly', 'Post-bond inspection escapes'],
    perspective: 'A short engineering or program-management insight will appear here.',
  },
  {
    id: 'multiDieTest',
    stage: 31,
    title: 'Multi-Die Test & Repair',
    shortTitle: 'MDT',
    tagline: 'Test a part whose dies can only be reached through each other.',
    description:
      'Test the assembled stack: what is tested before, during and after bonding, how a buried die is reached, how the link is exercised and repaired, and what makes a stack known good rather than merely assembled.',
    activities: ['Post-bond strategy', 'Link BIST and repair', 'Stack ATPG', 'Known-good stack', 'Escape analysis'],
    deliverables: [
      'Post-bond test strategy',
      'D2D BIST and repair bring-up report',
      'Stack-level pattern set',
      'Known-good-stack criteria',
      'Test escape and repair yield analysis',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [8, 16, 22, 26, 30],
    engineeringView: [
      'Post-Bond Test Strategy and Access Plan',
      'D2D Link BIST and Repair Bring-Up',
      'Stack-Level ATPG and Pattern Porting',
      'Known-Good-Stack Criteria and Binning',
      'Test Escape and Repair Yield Analysis',
    ],
    engineeringTat: [8, 10, 10, 8, 8],
    engineeringEffort: [6, 9, 9, 5, 6],
    engineeringStart: [0, 6, 12, 18, 22],
    risks: ['No access to a buried die', 'Repair budget spent before volume'],
    potentialRisks: [
      'Post-bond test planned after the stack is designed',
      'Link BIST that cannot run at the speed the link ships at',
      'Escapes attributed to the stack with no way to name the die',
    ],
    leader: leaderOf('Grace Abara', 'G. Abara', '0492', 'grace.abara@example.com'),
    collaboration: ['Test development', 'DFT', 'Product engineering', 'Quality'],
    tools: ['ATE', 'BIST engines', 'Yield analysis'],
    programView: ['Post-bond test readiness', 'Known-good-stack yield', 'Repair yield'],
    perspective: 'A short engineering or program-management insight will appear here.',
  },
];

/* ---------- deliverable references and terms ---------- */

/**
 * Each stack deliverable's reference tag, keyed the way /lib/rowIds numbers a
 * row: PART-D1 is the first deliverable of the stage whose short title is PART.
 *
 * Derived from the stage lists rather than written out a second time, so the
 * catalogue the tags are matched against is the list the rows are seeded from
 * and the two cannot word a deliverable differently.
 */
export const THREE_DIC_DELIVERABLES: Record<string, string> = Object.fromEntries(
  THREE_DIC_STAGES.flatMap((s) => s.deliverables.map((title, i) => [`${s.shortTitle}-D${i + 1}`, title])),
);

/**
 * The terms the stack write-ups use that the SoC glossary does not explain.
 * TSV, KGD, UCIe, D2D, CSAM and the rest are already there and are not repeated.
 */
export const THREE_DIC_GLOSSARY: Record<string, { full: string; group: string; note: string }> = {
  '3DIC': {
    full: 'Three-Dimensional Integrated Circuit',
    group: 'pkg',
    note: 'Dies stacked vertically and joined through bonds and TSVs, rather than placed side by side on an interposer.',
  },
  BoW: {
    full: 'Bunch of Wires',
    group: 'iface',
    note: 'An open, parallel die-to-die interface from the OCP ODSA group. Simple and low power, with less ecosystem than UCIe.',
  },
  CTE: {
    full: 'Coefficient of Thermal Expansion',
    group: 'pkg',
    note: 'How much a material grows with temperature. Mismatch between die, bond and substrate is what warps a stack and cracks its joints.',
  },
  D2W: {
    full: 'Die-to-Wafer bonding',
    group: 'process',
    note: 'Singulated known-good dies bonded onto a wafer. Lets a bad die be kept out of the stack, at the cost of throughput and alignment.',
  },
  DCTV: {
    full: 'Daisy Chain Test Vehicle',
    group: 'pkg',
    note: 'Dummy dies and interposer whose bumps and TSVs are wired in series, assembled through the real process so continuity and resistance prove the assembly before product silicon exists.',
  },
  F2B: {
    full: 'Face-to-Back',
    group: 'process',
    note: 'A stacking orientation where the front of one die bonds to the thinned back of the other, so signals cross through TSVs.',
  },
  F2F: {
    full: 'Face-to-Face',
    group: 'process',
    note: 'A stacking orientation where the two dies bond front to front. The shortest inter-die path, but only one die can reach the package without TSVs.',
  },
  HB: {
    full: 'Hybrid Bonding',
    group: 'process',
    note: 'A direct copper-to-copper and oxide-to-oxide bond with no solder. Pitches under ten microns, and a surface that has to be nearly perfect.',
  },
  'IEEE 1838': {
    full: 'IEEE Standard for Test Access Architecture for Three-Dimensional Stacked ICs',
    group: 'test',
    note: 'The die wrapper and serial and parallel ports that let a tester reach a die buried inside a stack.',
  },
  KGS: {
    full: 'Known Good Stack',
    group: 'test',
    note: 'An assembled stack that has passed the tests proving its dies and the bonds between them. What ships, rather than dies that were good before bonding.',
  },
  KOZ: {
    full: 'Keep-Out Zone',
    group: 'design',
    note: 'The area around a TSV or bond feature where devices may not be placed, because the stress it causes shifts their behaviour.',
  },
  TCB: {
    full: 'Thermo-Compression Bonding',
    group: 'process',
    note: 'Bonding micro-bumps with heat and force applied through the die. Finer pitch than mass reflow, and slower.',
  },
  TCT: {
    full: 'Temperature Cycling Test',
    group: 'qual',
    note: 'Repeated swings between temperature extremes. The stress that finds a weak bond, because every cycle works the CTE mismatch.',
  },
  W2W: {
    full: 'Wafer-to-Wafer bonding',
    group: 'process',
    note: 'Whole wafers bonded before singulation. The best alignment and throughput, but a bad die on either wafer is stacked regardless.',
  },
};

/* ---------- the profile ---------- */

const stackStage = (key: string, order: number): ProfileStageDef => {
  const content = THREE_DIC_STAGES.find((s) => s.id === key)!;
  return {
    key,
    order,
    title: content.title,
    shortTitle: content.shortTitle,
    phaseId: PHASE_OF_3DIC[key],
    baseKey: key,
    ...THREE_DIC_BASELINES[key],
  };
};

const SPLIT_BASES = new Set<string>(TOP_DIE_SPLIT.map((s) => s.base));

const socStage = (key: string, order: number): ProfileStageDef => {
  const content = journeyData.find((s) => s.id === key)!;
  return {
    key,
    order,
    title: SPLIT_BASES.has(key) ? `${content.title} — Bottom Die` : content.title,
    shortTitle: content.shortTitle,
    phaseId: PHASE_OF_3DIC[key],
    baseKey: key,
    ...SOC_IN_3DIC[key],
  };
};

const topDieStage = (key: string, order: number): ProfileStageDef => {
  const split = TOP_DIE_SPLIT.find((s) => s.key === key)!;
  const content = TOP_DIE_STAGES.find((s) => s.id === key)!;
  return {
    key,
    order,
    title: content.title,
    shortTitle: content.shortTitle,
    phaseId: PHASE_OF[split.base],
    baseKey: key,
    ...TOP_DIE_BASELINES[key],
  };
};

/**
 * The SoC stages as the bottom die, the top die's, and the stack's own, ordered
 * by when they start — the order is the chart's y-axis, so a reader scanning
 * down reads the program forwards. The seven stages done once per chip carry
 * "— Bottom Die" here and nowhere else; an SoC program's titles are its own.
 */
export const THREE_DIC_PROFILE: ScheduleProfile = {
  id: 'threeDic',
  label: '3DIC (stacked die)',
  builtin: true,
  template: true,
  stages: [
    ...SOC_STAGE_KEYS.map((key) => ({ key, kind: 'soc' as const, ...SOC_IN_3DIC[key] })),
    ...TOP_DIE_SPLIT.map(({ key }) => ({ key, kind: 'top' as const, ...TOP_DIE_BASELINES[key] })),
    ...THREE_DIC_STAGE_KEYS.map((key) => ({ key, kind: 'stack' as const, ...THREE_DIC_BASELINES[key] })),
  ]
    .sort((a, b) => a.startOffsetWeeks - b.startOffsetWeeks)
    .map(({ key, kind }, order) =>
      kind === 'soc' ? socStage(key, order) : kind === 'top' ? topDieStage(key, order) : stackStage(key, order),
    ),
};
