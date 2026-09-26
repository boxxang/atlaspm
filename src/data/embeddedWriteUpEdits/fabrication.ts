import type { WriteUpEdit } from './types';

/** FAB: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const FAB_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'FAB-01': {
    purpose: [
      'Get the <b>front-end mask set written, inspected and qualified</b>—seven weeks of the mask shop’s calendar that the program can watch but not accelerate.',
      'A mature-node mask set is cheaper and quicker than a leading-node one, but the embedded MRAM module adds layers of its own, and a single mask failing inspection still means a remake measured in weeks. The program’s role is oversight rather than execution: confirm the data was accepted, review inspection results and escalate when a layer slips.',
    ],
    terms: ['FEOL', 'BEOL', 'MDP', 'eMRAM'],
  },
  'FAB-02': {
    purpose: [
      'Track the lots and <b>maintain an honest wafer-out forecast</b>, because ten downstream activities are planning against a date this activity owns.',
      'Assembly, test, bring-up, the EVK build, the early-access customers and qualification all schedule against wafer-out. The forecast will move—fab schedules do—and the program’s exposure is not the movement but the surprise. Four man-months across eighteen weeks buys a date everyone can plan against and early warning when it changes.',
    ],
  },
  'FAB-03': {
    purpose: [
      'Write and qualify the <b>back-end mask set while front-end processing runs</b>—the parallelism the FEOL/BEOL split was designed to create.',
      'This activity is the payoff of the two-stage release. BEOL masks, including the layers of the eMRAM module that sits between the metal layers, are written during the weeks the wafers spend in front-end processing, so the fix window cost the program nothing in schedule as long as these masks are ready when the lots reach metallization.',
    ],
    terms: ['FEOL', 'BEOL', 'eMRAM'],
  },
  'FAB-04': {
    flowNote:
      'Step 1 chooses where to look. Monitoring every step equally wastes attention; selecting the layers and dimensions this design is most sensitive to—critical gate dimensions that set leakage and therefore sleep current, the via layers, and the magnetic tunnel junction stack of the eMRAM module—is what makes the monitoring informative.',
    risks: [
      '<b>Monitoring every step equally.</b> Attention spread evenly finds nothing; the design’s sensitivities decide where to look.',
      '<b>Data reviewed only by the foundry.</b> Process control answers whether the line is in control, not whether this device is affected.',
      '<b>Excursions detected after the affected step.</b> Once the lot has moved on, the response options narrow sharply.',
      '<b>Defects classified but not attributed.</b> Knowing the count without the source gives no basis for a corrective action.',
      '<b>Monitoring stopping at front-end exit.</b> The eMRAM module is built in the back end, and its defects and excursions affect yield and retention as much as any front-end step.',
    ],
    terms: ['WAT', 'PCM', 'DFM', 'eMRAM'],
  },
  'FAB-05': {
    risks: [
      '<b>Start delayed after masks are ready.</b> Every day is a day at the far end of a schedule with no recovery mechanism.',
      '<b>Wafer quantity too small.</b> Bring-up, characterization, qualification, the EVK build and the early-access customers all draw from this lot, and running short means a second lot and a quarter.',
      '<b>No process splits.</b> A single condition gives one data point; splits reveal process sensitivity while there is still time to act on it.',
      '<b>Hot-lot status not invoked.</b> The priority negotiated in <code>TECH-07</code> has to be requested at start, not assumed.',
      '<b>Starting material not specified.</b> Substrate type and specification affect device behavior, and defaulting is how an unexpected variable enters.',
    ],
    exit: [
      'Wafers started within days of mask qualification',
      'Quantity sufficient for bring-up, qual, the EVK build and samples',
      'Hot-lot priority invoked where it was negotiated',
    ],
  },
  'FAB-07': {
    purpose: [
      'Complete the wafers through <b>back-end-of-line processing</b>—metallization, vias, the eMRAM module, top metal, passivation—and finish the lot.',
      'The back end is where the design’s routing becomes physical and, on this process, where the embedded MRAM is built: the magnetic tunnel junction stack sits between metal layers and every step after it spends part of its thermal budget. It is also where the BEOL masks are consumed, which makes it the point at which the FEOL/BEOL split either paid off invisibly or produces a stall that everyone notices.',
    ],
    risks: [
      '<b>BEOL masks not ready at back-end entry.</b> Lots stall mid-process, consuming fab capacity and adding cycle time nobody planned.',
      '<b>Metallization and eMRAM module defects detected late.</b> Back-end defects affect yield directly, and inline detection is what allows a response.',
      '<b>Passivation and top metal treated as routine.</b> They set the bond pad surface the package is assembled onto, and problems here surface at <code>EASSY-03</code>.',
      '<b>Lot completion not confirmed against quantity.</b> Wafers lost during processing reduce the number available downstream, and the count has to be checked rather than assumed.',
      '<b>Process changes between split lots not tracked.</b> If splits were run, which wafer had which condition has to be traceable to the end.',
    ],
    roles: [
      { r: 'Foundry liaison', d: 'Back-end lot status and escalation' },
      { r: 'Device engineer', d: 'Metallization, eMRAM module and inline data interpretation' },
      { r: 'Yield engineer', d: 'Defect response in the back end' },
      { r: 'Operations planner', d: 'Lot tracking and split traceability' },
      { r: 'Package liaison', d: 'Passivation and bond pad readiness' },
    ],
    terms: ['BEOL', 'WAT', 'PCM', 'eMRAM'],
  },
  'FAB-08': {
    purpose: [
      'Read the <b>e-test and PCM data</b>—device parameters measured on structures in the scribe line—and compare them against what the models predicted.',
      'PCM data arrives before packaged parts and answers process questions weeks earlier than the lab can. Threshold voltages, leakage, resistances, capacitances, ring oscillator frequencies and the resistance of the eMRAM test junctions measured on real silicon are the first hard evidence of whether the design’s assumptions about the process were right.',
    ],
    flowNote:
      'Step 4 is where the value is. A threshold voltage 30 mV from target changes timing across the whole design and moves leakage—and with it the sleep current the product is sold on—by a margin that matters. Knowing that before parts arrive lets bring-up be planned around it rather than surprised by it.',
    consumes: [
      'E-test and PCM data from the foundry',
      'Model predictions from PDK-03 and TECH-04',
      'Foundry model-to-silicon correlation for the process and its eMRAM module',
      'Process target specifications',
      'Split lot definitions from FAB-05',
    ],
    risks: [
      '<b>PCM data not reviewed until parts arrive.</b> It answers process questions weeks earlier and costs nothing extra to read.',
      '<b>Comparison against target only.</b> The design was built against models; comparing against the model is what predicts silicon behavior.',
      '<b>Variability ignored.</b> Across-wafer parameter spread predicts the bin distribution and the sleep-current tail, and the mean alone does not.',
      '<b>Split lots analyzed together.</b> If splits were run, aggregating them averages away exactly the information the splits were for.',
      '<b>No link to the foundry’s model correlation.</b> The foundry correlated its models against its own qualification silicon; this data either confirms that correlation for this lot or contradicts it.',
    ],
    terms: ['WAT', 'PCM', 'eMRAM'],
  },
  'FAB-10': {
    risks: [
      '<b>Customs paperwork started at wafer-out.</b> It can be prepared during processing and takes a week if it is not.',
      '<b>Export classification unresolved.</b> Even a low-power embedded processor needs a classification, and an unclassified shipment does not move.',
      '<b>Destination not ready.</b> Wafers arriving at a sort facility with no probe card or no capacity wait there instead of in the fab.',
      '<b>Shipment split without tracking.</b> Lots split across shipments for risk are useful only if which wafers went where is traceable.',
      '<b>Milestone declared at wafer-out rather than at delivery.</b> First Silicon means silicon someone can touch, and declaring it early hides a week of transit.',
    ],
  },
};
