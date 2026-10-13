/**
 * tools/cpoFlow/analysis.ts — the CPO Network Switch System template read as
 * a program flow (see tools/flowLib/flow.ts), plus the gate closers and
 * hand-offs this template is held to.
 *
 * The unit tests hold the template to what these find
 * (tests/unit/cpoSwitch.test.ts), and `npx tsx tools/cpoFlow/report.ts`
 * prints the same findings for the flow verification report.
 */
import { CPO_ACTIVITIES, CPO_SKELETON, CPO_STAGES } from '../../src/data/cpoSwitch';
import { CPO_WRITE_UPS } from '../../src/data/cpoSwitch/writeUps';
import { makeFlow } from '../flowLib/flow';

export type { PathStep } from '../flowLib/flow';

export const {
  stageOfRef,
  absStart,
  absEnd,
  stageByKey,
  stageEnd,
  gateWeek,
  ALL_REFS,
  predecessorsOf,
  edges,
  successorsOf,
  namedProducers,
  isolated,
  edgeKind,
  edgeSlack,
  drivingPath,
  chainSlack,
  slackInto,
  ownerPeaks,
  deliverableUse,
  cpm,
} = makeFlow({ skeleton: CPO_SKELETON, activities: CPO_ACTIVITIES, stages: CPO_STAGES, writeUps: CPO_WRITE_UPS });

/**
 * The activity that closes each stage's gate: a review or decision where the
 * gate is a judgement, the event itself where the gate is one (a tapeout
 * baseline recorded, a first link up, a die bank released).
 */
export const GATE_CLOSERS: Record<string, string> = {
  cpoConcept: 'CON-06',
  cpoRequirements: 'REQ-09',
  cpoArchitecture: 'SARC-12',
  cpoInterfaces: 'ICD-12',
  cpoProgramControl: 'PCTL-07',
  cpoFeasibility: 'FEAS-09',
  cpoReadiness: 'TRDY-11',
  cpoModeling: 'MODL-10',
  cpoDesign: 'DSGN-18',
  cpoPresilicon: 'PSV-11',
  cpoOeStackDesign: 'OESD-07',
  cpoPackageTestVehicle: 'PKTV-09',
  cpoImplementation: 'IMPL-12',
  cpoSignoff: 'SGNO-10',
  cpoTapeoutOptical: 'OTO-04',
  cpoTapeout: 'MTO-05',
  cpoFabrication: 'WFAB-07',
  cpoSort: 'SORT-07',
  cpoOeBuild: 'OEB-09',
  cpoTestInfra: 'TINF-11',
  cpoAssembly: 'PKGA-07',
  cpoPowerOn: 'PON-05',
  cpoOpticalBringup: 'OBU-03',
  cpoSystemIntegration: 'SINT-04',
  cpoCharacterization: 'CHAR-08',
  cpoDebug: 'SDBG-08',
  cpoCompliance: 'CERT-03',
  cpoQualification: 'RELQ-06',
  cpoNpi: 'NPI-08',
  cpoRamp: 'RAMP-07',
  cpoSustaining: 'SUST-07',
};

/** Hand-offs the optical engine split exists to make, producer first. */
export const KEY_HANDOFFS: { what: string; from: string[]; to: string[] }[] = [
  { what: 'Optical engine stack bond interface → photonic and electrical IC layout', from: ['OESD-01'], to: ['IMPL-04', 'IMPL-05'] },
  { what: 'Optical engine stack freeze → photonic and electrical IC signoff', from: ['OESD-07'], to: ['SGNO-03', 'SGNO-04', 'SGNO-12'] },
  { what: 'Photonic and electrical IC sort → known-good die release to the engine build', from: ['SORT-03', 'SORT-04'], to: ['SORT-05'] },
  { what: 'Known-good photonic and electrical dies → optical engine stacking', from: ['SORT-05'], to: ['OEB-02'] },
  { what: 'Known-good optical engines → main package engine mounting', from: ['OEB-09'], to: ['PKGA-04'] },
  { what: 'Known-good Switch SoC and I/O dies → main package die attach', from: ['SORT-07'], to: ['PKGA-03'] },
  { what: 'Substrate tooling release → first-build material', from: ['SGNO-11'], to: ['PKGA-01'] },
  { what: 'Package process window freeze → package signoff, substrate release and the first-build plan', from: ['PKTV-09'], to: ['SGNO-06', 'SGNO-11', 'PKGA-01', 'PKGA-02'] },
  { what: 'Optical engine stack freeze → optical engine package test vehicle', from: ['OESD-07'], to: ['PKTV-05'] },
  { what: 'Engine unit test hardware → optical engine build and test', from: ['TINF-18'], to: ['OEB-02', 'OEB-05'] },
  { what: 'Optical engine standalone bring-up → system optical bring-up', from: ['OEB-06'], to: ['OBU-03'] },
];
