/**
 * ICD — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const ICD_GLOSSARY: CpoGlossary = {
  'Interface register': {
    full: 'Program interface register',
    group: 'program',
    note: 'The controlled list of every interface in the product, each with its category, both owners, its ICD, current version and maturity level; the index the change control board works from.',
  },
  CCB: {
    full: 'Change control board',
    group: 'program',
    note: 'The cross-functional board that approves, rejects or defers every change to a baselined interface or requirement after assessing its impact on both sides.',
  },
  'Register map': {
    full: 'Hardware register map',
    group: 'iface',
    note: 'The addresses, fields and access rules of every register firmware can reach, generated from one source into RTL, firmware headers and documentation so they cannot diverge.',
  },
  'Ball map': {
    full: 'Package ball map',
    group: 'pkg',
    note: 'The assignment of every package-to-board solder ball to a signal, power or ground net; the board layout and package routing are both built to it.',
  },
  Genealogy: {
    full: 'Unit genealogy',
    group: 'process',
    note: 'The record linking a finished unit to the wafers, dies, lots, optical engines, optical source and process steps it was built from, carried across every factory site.',
  },
};
