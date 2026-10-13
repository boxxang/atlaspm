/**
 * UARC — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UARC_GLOSSARY: UcieGlossary = {
  'Timing budget': {
    full: 'Unit-interval timing budget',
    group: 'design',
    note: 'The split of one bit time between transmit jitter, channel effects, receiver sampling uncertainty and margin. At 64 GT/s it is a few tens of picoseconds, and each part has an owner.',
  },
};
