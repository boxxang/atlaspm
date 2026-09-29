/**
 * PON — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const PON_GLOSSARY: CpoGlossary = {
  'Power sequencing': {
    full: 'Power sequencing',
    group: 'design',
    note: 'The order and timing in which supply rails ramp up and down. A multi-die package has rails whose order protects interfaces between dies; getting it wrong can stress or latch an I/O on first power.',
  },
  'Link training': {
    full: 'Link training',
    group: 'iface',
    note: 'The handshake in which the two ends of a serial link adapt equalization and settle on a working state before carrying data. A link that trains is not yet proven: its bit error rate still has to be measured.',
  },
  'Anomaly register': {
    full: 'Silicon anomaly register',
    group: 'program',
    note: 'The single list of every deviation seen on silicon, with its unit, conditions, data, reproduction status, owner and disposition. It is what the silicon debug board and the stepping decision are run from.',
  },
};
