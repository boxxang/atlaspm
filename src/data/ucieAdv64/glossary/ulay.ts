/**
 * ULAY — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const ULAY_GLOSSARY: UcieGlossary = {
  'Parasitic extraction': {
    full: 'Parasitic extraction',
    group: 'tool',
    note: 'Computing the resistance, capacitance and coupling of the drawn wires and devices so a circuit can be re-simulated as laid out rather than as drawn.',
  },
  'Post-layout simulation': {
    full: 'Post-layout simulation',
    group: 'verif',
    note: 'Simulating a circuit with its extracted parasitics. Margin lost between the schematic and the post-layout result is what layout consumed.',
  },
  'Common-centroid layout': {
    full: 'Common-centroid layout',
    group: 'design',
    note: 'Arranging matched devices symmetrically around a shared center so process gradients across the die affect them equally.',
  },
  'Macro assembly': {
    full: 'Hard macro assembly',
    group: 'design',
    note: 'Joining the analog blocks, the digital hard macro, the bump map and the power grid into the single fixed layout a customer places.',
  },
};
