/**
 * UCHR — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UCHR_GLOSSARY: UcieGlossary = {
  'Bathtub curve': {
    full: 'Bathtub curve',
    group: 'test',
    note: 'Error rate plotted against the sampling point’s position across the eye. Its steep walls let a measured curve be extrapolated to error rates too low to count directly in lab time.',
  },
  'BER confidence level': {
    full: 'BER confidence level',
    group: 'test',
    note: 'How sure a measurement is that the true error rate is below a target, given how many bits were sent and how many errors were seen. Without it a short error-free run proves very little.',
  },
};
