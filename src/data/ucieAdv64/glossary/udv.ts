/**
 * UDV — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UDV_GLOSSARY: UcieGlossary = {
  'Functional coverage': {
    full: 'Functional coverage',
    group: 'verif',
    note: 'User-defined points that record which features, states, transitions and combinations a regression actually exercised — the measure verification is closed against, as opposed to which lines of code ran.',
  },
  'Constrained-random stimulus': {
    full: 'Constrained-random stimulus',
    group: 'verif',
    note: 'Test traffic and partner behavior drawn at random within legal limits, so a regression reaches orderings and combinations no one thought to write as a directed test.',
  },
  'Error injection': {
    full: 'Error injection',
    group: 'verif',
    note: 'Deliberately corrupting bits, dropping lanes or faulting bumps in the testbench to prove detection, retry, repair and escalation behave as specified.',
  },
};
