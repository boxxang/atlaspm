/**
 * tools/ucieFlow/analysis.ts — the UCIe Advanced 64G PHY IP template read as
 * a program flow (see tools/flowLib/flow.ts), plus the gate closers and
 * hand-offs this template is held to.
 *
 * The unit tests hold the template to what these find
 * (tests/unit/ucieAdv64.test.ts), and `npx tsx tools/ucieFlow/report.ts`
 * prints the same findings for the flow verification report.
 */
import { UCIE_ACTIVITIES, UCIE_SKELETON, UCIE_STAGES } from '../../src/data/ucieAdv64';
import { UCIE_WRITE_UPS } from '../../src/data/ucieAdv64/writeUps';
import { makeFlow } from '../flowLib/flow';

export type { PathStep } from '../flowLib/flow';

export const {
  stageOfRef,
  absStart,
  absEnd,
  stageByKey,
  stageEnd,
  ALL_REFS,
  predecessorsOf,
  edges,
  successorsOf,
  namedProducers,
  isolated,
  edgeKind,
  edgeSlack,
  chainSlack,
  ownerPeaks,
  deliverableUse,
  cpm,
} = makeFlow({ skeleton: UCIE_SKELETON, activities: UCIE_ACTIVITIES, stages: UCIE_STAGES, writeUps: UCIE_WRITE_UPS });

/** Everything an activity waits on, directly or through what it waits on. */
export const upstreamOf = (ref: string): Set<string> => {
  const out = new Set<string>();
  const stack = [...predecessorsOf(ref)];
  while (stack.length) {
    const x = stack.pop()!;
    if (out.has(x)) continue;
    out.add(x);
    stack.push(...predecessorsOf(x));
  }
  return out;
};

/** The activity that closes each stage's gate: a review or decision, or the event that is the gate. */
export const GATE_CLOSERS: Record<string, string> = {
  ucieConcept: 'UCON-06',
  ucieRequirements: 'UREQ-09',
  ucieArchitecture: 'UARC-12',
  ucieTechnology: 'UTEC-06',
  ucieFoundation: 'UFND-07',
  ucieAfe: 'UAFE-09',
  ucieRtl: 'URTL-10',
  ucieDft: 'UDFT-08',
  ucieDv: 'UDV-12',
  ucieAms: 'UAMS-08',
  ucieDigitalPd: 'UDPD-07',
  ucieLayout: 'ULAY-07',
  ucieSignoff: 'USGN-07',
  ucieChannel: 'UCHN-08',
  ucieTestChip: 'UTCI-06',
  ucieTestVehicle: 'UTVP-07',
  ucieTapeout: 'UTPO-04',
  ucieFab: 'UFAB-05',
  ucieBringup: 'UBUP-06',
  ucieCharacterization: 'UCHR-10',
  ucieCompliance: 'UCMP-05',
  ucieReliability: 'URLQ-06',
  uciePreSilicon: 'UPRE-08',
  ucieGa: 'UGA-05',
  ucieCustomer: 'UCUS-05',
};

/** The path the program is planned around, stage by stage, and the activities that carry it. */
export const SPINE: { stage: string; refs: string[] }[] = [
  { stage: 'ucieRequirements', refs: ['UREQ-09'] },
  { stage: 'ucieArchitecture', refs: ['UARC-12'] },
  { stage: 'ucieAfe', refs: ['UAFE-09'] },
  { stage: 'ucieRtl', refs: ['URTL-10'] },
  { stage: 'ucieDv', refs: ['UDV-12'] },
  { stage: 'ucieAms', refs: ['UAMS-08'] },
  { stage: 'ucieSignoff', refs: ['USGN-07'] },
  { stage: 'ucieTestChip', refs: ['UTCI-06'] },
  { stage: 'ucieTapeout', refs: ['UTPO-04'] },
  { stage: 'ucieFab', refs: ['UFAB-05'] },
  { stage: 'ucieBringup', refs: ['UBUP-06'] },
  { stage: 'ucieCharacterization', refs: ['UCHR-10'] },
  { stage: 'ucieCompliance', refs: ['UCMP-05'] },
  { stage: 'ucieReliability', refs: ['URLQ-06'] },
  { stage: 'ucieGa', refs: ['UGA-05'] },
];
