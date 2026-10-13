/**
 * UAMS — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UAMS_GLOSSARY: UcieGlossary = {
  'Behavioral model': {
    full: 'Behavioral model',
    group: 'verif',
    note: 'A fast model of an analog block that reproduces its behavior at its ports — swing, gain, offset, jitter, settling — without simulating its transistors, so full training sequences can run against it.',
  },
  'Mixed-signal co-simulation': {
    full: 'Mixed-signal co-simulation',
    group: 'verif',
    note: 'Simulating digital RTL and analog models together in one run, so the logic drives and reads the analog as it will on silicon.',
  },
  'Link margin': {
    full: 'Link margin',
    group: 'verif',
    note: 'How much timing and voltage the link has left at the receiver beyond what it needs to meet its error-rate target — computed per lane, per channel and per corner.',
  },
};
