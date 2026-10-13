/**
 * URLQ — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const URLQ_GLOSSARY: UcieGlossary = {
  'Read point': {
    full: 'Reliability read point',
    group: 'qual',
    note: 'A scheduled pause in a stress test where units are taken out and re-measured. Measuring margin and BER at each one, rather than only pass or fail, shows drift long before failure.',
  },
  'Acceleration factor': {
    full: 'Acceleration factor',
    group: 'qual',
    note: 'How much faster a stress condition ages a part than normal use, from a model of the wear-out mechanism. It turns stress hours into a lifetime estimate, and is only as good as the mechanism it assumes.',
  },
};
