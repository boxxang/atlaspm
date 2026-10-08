/**
 * PKGA — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const PKGA_GLOSSARY: CpoGlossary = {
  'Build matrix': {
    full: 'Engineering build matrix',
    group: 'program',
    note: 'The table of split conditions an engineering build runs — die corners, attach recipes, material bins — and how many units of each go to bring-up, characterization, reliability and failure analysis.',
  },
  Underfill: {
    full: 'Underfill',
    group: 'pkg',
    note: 'The adhesive flowed under attached die or bridges and cured, to share thermal-mechanical stress across the joints. Voids in it become crack sites under temperature cycling.',
  },
  Traveler: {
    full: 'Assembly traveler',
    group: 'process',
    note: 'The record that follows a unit through every assembly and test step — its split, material lots, recipes, inspection results and dispositions — so any later failure can be traced back to how it was built.',
  },
  'Fiber egress': {
    full: 'Fiber egress',
    group: 'pkg',
    note: 'The path by which the optical engines’ fibers leave the main package for the front panel — the routing, bend radius, strain relief and the mechanical exit through the lid or frame. It is designed with the package because its clearances constrain lid, thermal solution and board.',
  },
};
