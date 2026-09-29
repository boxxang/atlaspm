/**
 * CERT — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const CERT_GLOSSARY: CpoGlossary = {
  Plugfest: {
    full: 'Plugfest',
    group: 'test',
    note: 'An industry event where vendors connect their equipment to each other under an agreed test plan. The cheapest way to find interoperability failures with many partners at once, but held on fixed dates.',
  },
  'Secure boot': {
    full: 'Secure boot',
    group: 'design',
    note: 'A boot sequence in which each stage verifies the signature of the next before running it, anchored in the root of trust, so only authenticated firmware can execute.',
  },
  'Rollback protection': {
    full: 'Rollback protection',
    group: 'design',
    note: 'A monotonic version counter, usually held in fuses, that stops an older signed but vulnerable firmware image from being installed after a newer one.',
  },
  'Penetration test': {
    full: 'Penetration test',
    group: 'verif',
    note: 'An authorized attack on the product by independent testers — hardware, firmware and management interfaces — to find weaknesses that requirement-based tests do not.',
  },
  'Early-access program': {
    full: 'Early-access program',
    group: 'program',
    note: 'A controlled release of pre-production systems to selected customers, with known errata and engineering support, so they can qualify the product in their own networks before volume release.',
  },
};
