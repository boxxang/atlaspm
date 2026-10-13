/**
 * UCUS — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UCUS_GLOSSARY: UcieGlossary = {
  'Knowledge base': {
    full: 'Customer knowledge base',
    group: 'ip',
    note: 'The searchable collection of FAQ entries, application notes and answered questions licensees read before filing an issue — kept consistent with the integration guide and errata at every release.',
  },
  'Patch release': {
    full: 'Patch release',
    group: 'ip',
    note: 'A release between main releases that carries fixes for known issues, with its own QA, release notes and licensee notification, and is merged into the next main release.',
  },
  'Porting request': {
    full: 'Variant or porting request',
    group: 'ip',
    note: 'A licensee’s request for the IP on another metal stack, orientation, module count, bump pitch or package type — often a new layout, view set and signoff, so it is evaluated and decided rather than accepted ad hoc.',
  },
  'Early silicon brief': {
    full: 'Early silicon brief',
    group: 'ip',
    note: 'A preliminary summary of test chip results shared under NDA with licensees before production release, marked as preliminary, so customers in signoff can weigh silicon evidence before it is final.',
  },
};
