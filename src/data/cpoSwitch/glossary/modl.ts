/**
 * MODL — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const MODL_GLOSSARY: CpoGlossary = {
  'IBIS-AMI': {
    full: 'I/O Buffer Information Specification — Algorithmic Modeling Interface',
    group: 'tool',
    note: 'The portable model format SerDes providers ship so a channel simulator can run their transmitter and receiver equalization without seeing the design. Link margins predicted before silicon are only as good as these models.',
  },
  'S-parameters': {
    full: 'Scattering parameters',
    group: 'verif',
    note: 'The frequency-domain description of how a channel — package, bridge, board, connector — transmits and reflects signals. Extracted from layout or measured, they are the channel half of every link simulation.',
  },
  'Virtual platform': {
    full: 'Virtual platform',
    group: 'tool',
    note: 'A software model of the hardware, register-accurate but not cycle-accurate, fast enough to boot firmware and run the SDK long before silicon exists.',
  },
  'Model correlation': {
    full: 'Model-to-silicon correlation',
    group: 'verif',
    note: 'Comparing a model’s predictions with measured hardware against a stated accuracy target, and refitting the model where it misses. A model that was never correlated is an assumption with a user interface.',
  },
};
