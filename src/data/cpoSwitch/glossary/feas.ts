/**
 * FEAS — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const FEAS_GLOSSARY: CpoGlossary = {
  'Extinction ratio': {
    full: 'Extinction ratio',
    group: 'design',
    note: 'The ratio of optical power in the one level to the zero level of a modulated signal. Too low and the receiver cannot tell the levels apart; raising it usually costs modulator drive swing or insertion loss.',
  },
  Responsivity: {
    full: 'Photodetector responsivity',
    group: 'design',
    note: 'Photocurrent per unit of optical power, in amperes per watt. With the TIA noise it sets the receiver sensitivity, and it moves with wavelength and temperature.',
  },
  'Alignment tolerance': {
    full: 'Optical alignment tolerance',
    group: 'pkg',
    note: 'How far a fiber or source can move from its optimum position before coupling loss rises by a stated amount, commonly 1 dB. It decides whether passive placement is good enough or active alignment is needed, and how much warpage and creep the attach can absorb.',
  },
  Warpage: {
    full: 'Package warpage',
    group: 'pkg',
    note: 'The out-of-plane bow of a substrate or assembled package across temperature, driven by CTE mismatch between die, bridge, substrate and lid. In a co-packaged optics package it also moves the optical engines relative to their fibers.',
  },
  'Scanning acoustic microscopy': {
    full: 'Scanning acoustic microscopy',
    group: 'test',
    note: 'Non-destructive inspection that images voids, delamination and non-wet bonds inside a stack or under an underfill by reflecting ultrasound off the internal interfaces.',
  },
};
