/**
 * OEB — Optical Engine Stack Build & Known-Good Optical Engines. Weeks
 * 120–140; closes on Known-Good Optical Engines Ready.
 */
import type { CpoStageModule } from '../types';

export const OEB: CpoStageModule = {
  content: {
    tagline: 'Build the optical engines as a product of their own, and send the main package only engines already proven good.',
    description:
      'The optical engine is a sub-product with its own build line, its own test and its own known-good gate, standing between photonic and electrical IC sort and the main package that mounts it. Plan the engine build against the main package build matrix and kit it as the known-good photonic and electrical dies are released from sort, then build: stack each electrical IC onto its photonic IC and inspect the bond, attach the stack to the engine substrate and underfill it, actively align and attach the fiber or coupler block and record coupling loss per lane, and test every engine electrically and optically on its own fixture. Early engines are brought up standalone on an engine evaluation board so the calibration flow and the models meet real silicon before the system does. The test distributions set the known-good optical engine criteria and bins, failing engines are reworked, held or scrapped by policy, and the passing ones are banked with their genealogy and released in kits. Because the photonic fab is the longest in the program, this stage sits on the critical path: the main package first build waits on the engines, not on the Switch SoC. It closes when enough known-good engines for the first build are banked and the readiness review says go.',
    activities: [
      'Engine build plan and kit',
      'EIC-on-PIC stacking',
      'Engine substrate attach',
      'Fiber attach',
      'Engine-level test and yield',
      'Engine standalone bring-up',
      'Known-good engine criteria',
      'Engine inventory and release',
      'Known-good engine review',
    ],
    deliverables: [
      'Optical engine build plan, build matrix and kit readiness checklist',
      'Stacked electrical-IC-on-photonic-IC engines with bond inspection record',
      'Engine substrate attach record with warpage and continuity per engine',
      'Optical engine and fiber attach build record with per-lane coupling loss',
      'Optical engine-level test results and engine yield tracker',
      'Optical engine standalone bring-up report from the engine evaluation board',
      'Known-good optical engine criteria and bin definitions',
      'Optical engine inventory, rework and scrap log and release to main package assembly',
      'Known-good optical engine readiness decision record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    deliverableWeek: [6, 10, 12, 15, 18, 20, 19, 20, 20],
    engineeringEffort: [3, 6, 4, 8, 6, 8, 4, 3, 2],
    risks: [
      'Stack bond or fiber attach yield on product dies below the test vehicle, so too few known-good engines reach the first build',
      'Known-good engine limits set loosely to protect the schedule, and failing engines scrap good main packages',
      'Engine test fixtures not correlated to the main package optical test, so an engine bin means nothing downstream',
    ],
    potentialRisks: [
      'Photonic and electrical IC kits paired without bins, so a slow electrical IC is stacked on the best photonic die',
      'Engine substrates or fiber arrays arriving after the known-good dies, idling the stacking line',
      'Bond inspection run on a sample only, so a misaligned stack is found at engine test after the fiber is attached',
      'Coupling loss measured once after cure and not after the last engine thermal step',
      'Rework of fiber attach allowed without a limit on attempts, so reworked engines fail early in reliability',
      'Engine genealogy lost at banking, so a main package failure cannot be joined to its photonic wafer, stack and attach',
      'Standalone bring-up started so late that calibration problems surface first in system optical bring-up',
    ],
    leader: { name: 'Sofia Brandt', short: 'S. Brandt', phone: '+1 (408) 555-0531', email: 'sofia.brandt@example.com' },
    collaboration: ['Packaging', 'Optical engineering', 'Photonics', 'Test engineering', 'Manufacturing and NPI', 'Analog and mixed-signal', 'Quality'],
    tools: [
      'Die-to-substrate bonder with alignment metrology',
      'Active alignment and fiber attach station',
      'Acoustic and X-ray inspection',
      'Optical engine test fixture with calibrated optical instruments',
      'Manufacturing execution and genealogy system',
    ],
    programView: [
      'Known-good engines banked against the first-build kit count',
      'Stack bond yield and fiber attach yield per build split',
      'Per-lane coupling loss distribution against the budget',
      'Engine test yield by photonic wafer and electrical IC lot',
      'Weeks of float between known-good engines and main package mounting',
    ],
    perspective:
      'Treat the optical engine as a product with a customer — the main package — and hold it to a known-good gate as strict as the dies get. An engine mounted on a main package takes the Switch SoC, the I/O die and the substrate with it when it fails, so every week spent screening engines here is cheaper than any week spent on a scrapped package later.',
  },
  steps: {
    'OEB-01': {
      s: [
        [1, 'Define what the first engine build must deliver — engines per main package split, spares, reliability and failure analysis units', 1],
        [2, 'Define engine splits — photonic and electrical IC bins, bond recipe, underfill and fiber attach variants', 1.5],
        [3, 'Confirm engine substrates, fiber arrays, underfill and fixtures on hand against the kit list', 1.5, 1],
        [4, 'Book stacking, attach and engine test capacity with the assembly partner', 1],
        [5, 'Release the engine build plan, build matrix and kit readiness checklist', 0.5],
      ],
      o: [
        'Engine build objectives and quantities',
        'Engine split condition definition',
        'Engine material on hand against the kit list',
        'Stacking, attach and test capacity booked',
        'Optical engine build plan, build matrix and kit readiness checklist',
      ],
      r: [['OEB-D1', 'produces'], ['OEB-D2', 'feeds']],
    },
    'OEB-02': {
      s: [
        [1, 'Receive the electrical and photonic IC known-good-die kits from sort with their bins and traceability', 0.5],
        [2, 'Prepare the bond surfaces — clean, activate or flux per the released stack process', 0.5],
        [3, 'Align and bond each electrical IC onto its photonic IC at the stack pitch', 1.5],
        [4, 'Inspect every bond — acoustic imaging, X-ray, alignment offset and through-connection continuity', 1],
        [5, 'Release the stacks with their bond inspection record and hold or scrap failures per the rework policy', 0.5],
      ],
      o: [
        'Known-good-die kits received with bins',
        'Bond surfaces prepared',
        'Electrical ICs bonded onto photonic ICs',
        'Bond inspection results per stack',
        'Stacked engines with bond inspection record',
      ],
      r: [['OEB-D2', 'produces'], ['OEB-D5', 'feeds']],
    },
    'OEB-03': {
      s: [
        [1, 'Attach each stack to its engine substrate and reflow', 1],
        [2, 'Underfill the stack and the substrate joint and cure', 0.5],
        [3, 'Inspect by acoustic imaging and measure engine warpage and coplanarity', 0.5],
        [4, 'Check electrical continuity from the engine substrate pads through to the electrical IC', 0.5, 1],
        [5, 'Release substrate-attached engines to fiber attach with their attach record', 0.5],
      ],
      o: [
        'Stacks attached to engine substrates',
        'Underfill cured',
        'Acoustic, warpage and coplanarity results per engine',
        'Substrate-to-electrical IC continuity per engine',
        'Engine substrate attach record',
      ],
      r: [['OEB-D3', 'produces'], ['OEB-D4', 'feeds']],
    },
    'OEB-04': {
      s: [
        [1, 'Load substrate-attached engines in the active alignment station with their pre-attach optical data', 0.5],
        [2, 'Actively align and attach the fiber array or coupler block and cure', 1.5],
        [3, 'Measure coupling loss per lane after cure and after the final engine thermal step', 1],
        [4, 'Inspect and clean every fiber end face to the handling standard and log the result', 0.5, 1],
        [5, 'Release fiber-attached engines to engine-level test with their per-lane coupling loss record', 0.5],
      ],
      o: [
        'Engines loaded with pre-attach optical data',
        'Fiber arrays aligned, attached and cured',
        'Per-lane coupling loss after cure and thermal steps',
        'End-face inspection log per fiber',
        'Optical engine and fiber attach build record',
      ],
      r: [['OEB-D4', 'produces'], ['OEB-D5', 'feeds']],
    },
    'OEB-05': {
      s: [
        [1, 'Mount fiber-attached engines on the engine test fixture', 0.5],
        [2, 'Measure per-lane insertion loss, responsivity, modulator bandwidth, extinction ratio and heater efficiency', 2],
        [3, 'Run electrical IC functional and stack continuity checks through the engine fixture', 1, 1],
        [4, 'Apply the engine-level limits and record a bin per engine', 0.5],
        [5, 'Track engine yield by photonic wafer, electrical IC lot, stack bond and attach step', 1],
        [6, 'Release the engine-level test results and yield tracker', 0.5],
      ],
      o: [
        'Engines mounted on the engine test fixture',
        'Per-lane engine optical measurements',
        'Electrical IC functional and continuity results',
        'Engine bins per engine',
        'Engine yield by source and step',
        'Optical engine-level test results and yield tracker',
      ],
      r: [['OEB-D5', 'produces'], ['OEB-D7', 'feeds']],
    },
    'OEB-06': {
      s: [
        [1, 'Mount the first tested engines on engine evaluation boards', 0.5],
        [2, 'Bias the electrical IC and photonic IC and tune heaters with bench control and the bring-up firmware', 1.5],
        [3, 'Close optical loopback on each engine and measure per-lane BER with bench PRBS', 1.5],
        [4, 'Run the calibration algorithms on the engine and compare with the models', 1.5, 1],
        [5, 'Sweep engine behavior across temperature on the evaluation board', 1.5],
        [6, 'Release the standalone engine bring-up report to system optical bring-up', 1],
      ],
      o: [
        'Optical engines on engine evaluation boards',
        'Bias and heater tuning settings per lane',
        'Engine-level optical loopback BER per lane',
        'Calibration algorithm results against models',
        'Engine behavior across temperature',
        'Optical engine standalone bring-up report',
      ],
      r: [['OEB-D6', 'produces'], ['OEB-D7', 'informs']],
    },
    'OEB-07': {
      s: [
        [1, 'Set known-good engine limits from the engine test distributions, the link budget and the main package yield model', 1],
        [2, 'Define engine bins — per-lane loss, responsivity, modulation, heater range and electrical IC function', 1],
        [3, 'Correlate engine test with standalone bring-up on a sample of engines', 1, 1],
        [4, 'Compute main package compound yield with engines included and set the escape target', 1],
        [5, 'Release the known-good optical engine criteria and bin definitions', 0.5],
      ],
      o: [
        'Known-good engine limits',
        'Engine bin definitions',
        'Engine test to bring-up correlation',
        'Main package compound yield with escape target',
        'Known-good optical engine criteria and bin definitions',
      ],
      r: [['OEB-D7', 'produces'], ['OEB-D8', 'feeds']],
    },
    'OEB-08': {
      s: [
        [1, 'Bank tested engines by bin with genealogy to photonic wafer, electrical IC lot, stack and fiber attach', 1],
        [2, 'Disposition failing engines — rework fiber attach where the policy allows, hold for failure analysis or scrap', 1, 1],
        [3, 'Match known-good engines into main package kits by the build matrix', 1],
        [4, 'Reconcile engine inventory against the main package build plan and flag shortfalls', 0.5],
        [5, 'Release the known-good engine kits to main package assembly', 0.5],
      ],
      o: [
        'Banked engines with genealogy',
        'Rework, hold and scrap log',
        'Engine kits matched to main package splits',
        'Engine inventory reconciliation and shortfall list',
        'Known-good engine kits released to main package assembly',
      ],
      r: [['OEB-D8', 'produces'], ['OEB-D9', 'feeds']],
    },
    'OEB-09': {
      s: [
        [1, 'Review engine build yield, test results and bins against the known-good criteria', 0.5],
        [2, 'Review standalone bring-up results and open engine anomalies', 0.5, 1],
        [3, 'Confirm the known-good engine count against the main package first-build kits', 0.5],
        [4, 'Record the known-good optical engine go decision for main package mounting', 0.5],
      ],
      o: [
        'Engine yield and bin review',
        'Standalone bring-up and anomaly review',
        'Engine count against first-build kits',
        'Known-good optical engine readiness decision record',
      ],
      r: [['OEB-D9', 'produces']],
    },
  },
};
