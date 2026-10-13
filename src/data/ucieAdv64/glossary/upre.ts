/**
 * UPRE — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UPRE_GLOSSARY: UcieGlossary = {
  'Release notes': {
    full: 'Release notes',
    group: 'ip',
    note: 'The document shipped with every IP release that lists what changed since the previous one, the known issues and limitations, and what a licensee must update in their own design.',
  },
  'Integration guide': {
    full: 'Integration guide',
    group: 'ip',
    note: 'The licensee’s design manual for the IP: interface timing and sequencing, placement and bump rules, power delivery requirements, register programming and bring-up — the document most customer questions should already be answered in.',
  },
  'Early-access release': {
    full: 'Early-access release',
    group: 'ip',
    note: 'A pre-silicon release given to a small set of licensees so they can start integrating early, with a stated list of limitations and a direct feedback channel to the IP team.',
  },
  Licensee: {
    full: 'Licensee',
    group: 'program',
    note: 'A customer that has licensed the IP and integrates it into their own SoC; their entitlement decides which views and releases they receive.',
  },
};
