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
  'Export classification': {
    full: 'Export classification',
    group: 'program',
    note: 'The determination of which export-control category each part of a release falls under, which decides the countries and recipients it may be shipped to and the licences a shipment needs.',
  },
  'Licensee entitlement': {
    full: 'Licensee entitlement',
    group: 'program',
    note: 'What a licensee’s agreement lets them receive — which release levels, which views and which configurations — checked before every distribution so no one receives files their agreement does not cover.',
  },
  'Mission profile': {
    full: 'Mission profile',
    group: 'qual',
    note: 'The operating conditions a design is signed off for — temperature, voltage, activity and lifetime — that electromigration and aging checks assume. A licensee whose product runs beyond it has to redo those checks.',
  },
};
