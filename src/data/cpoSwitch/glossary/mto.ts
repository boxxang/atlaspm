/**
 * MTO — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const MTO_GLOSSARY: CpoGlossary = {
  'Lot split': {
    full: 'Lot split',
    group: 'process',
    note: 'Wafers in one lot deliberately run with different process settings — a critical dimension, an implant, an etch time — so the design’s sensitivity to that parameter can be measured on real silicon.',
  },
  'Corner lot': {
    full: 'Corner and skew lot',
    group: 'process',
    note: 'Wafers the foundry targets at the fast, slow or skewed edges of the process window. Characterization uses them to show the design meets specification across manufacturing variation, not only at nominal.',
  },
  'Compound yield': {
    full: 'Compound (multi-die) yield',
    group: 'program',
    note: 'The yield of a package that needs every one of its dies to be good: the product of the individual die yields and the assembly yield. With a switch die, I/O silicon, several optical engines and a bridge, small per-die losses multiply into a large package loss.',
  },
};
