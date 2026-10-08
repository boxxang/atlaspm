/**
 * OEB — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const OEB_GLOSSARY: CpoGlossary = {
  'Bond inspection': {
    full: 'Bond inspection',
    group: 'process',
    note: 'Checking every die-on-die bond after stacking — acoustic imaging for voids, X-ray for bridging and alignment offset, and an electrical continuity test through the bonded pads — before the stack goes on to a step that would hide a bad bond.',
  },
  Rework: {
    full: 'Rework',
    group: 'process',
    note: 'Repeating or undoing an assembly step on a failing unit — on an optical engine, typically removing and re-attaching the fiber — under a written policy that limits the attempts and the steps it may apply to, because reworked units carry more reliability risk.',
  },
};
