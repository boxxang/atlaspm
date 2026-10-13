/**
 * UCHN — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UCHN_GLOSSARY: UcieGlossary = {
  'Insertion loss': {
    full: 'Insertion loss',
    group: 'pkg',
    note: 'How much of a signal’s amplitude the channel loses between transmitter and receiver, rising with frequency and length — the first limit on reach at 64 GT/s.',
  },
  Crosstalk: {
    full: 'Crosstalk',
    group: 'pkg',
    note: 'Signal coupled from neighbouring lanes. Fine-pitch, densely routed die-to-die channels are limited as much by crosstalk as by loss.',
  },
  'Channel model': {
    full: 'Channel model',
    group: 'pkg',
    note: 'A frequency-domain multi-port description of the package route between two dies, from extraction or measurement, that link simulation runs signals through.',
  },
  'Target impedance': {
    full: 'Target impedance',
    group: 'pkg',
    note: 'The highest impedance the power delivery network may present across frequency so that supply noise stays inside its budget when the lanes switch together.',
  },
  'Reference design': {
    full: 'Reference package design',
    group: 'pkg',
    note: 'A worked package layout, with its channel models, that shows a customer one way of routing the macro that meets the channel specification.',
  },
};
