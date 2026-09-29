/**
 * SARC — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const SARC_GLOSSARY: CpoGlossary = {
  'Shared buffer': {
    full: 'Shared packet buffer',
    group: 'design',
    note: 'On-die packet memory pooled across ports and queues rather than statically split, so bursts on a few ports can use capacity idle elsewhere. Usually the largest block on a switch die.',
  },
  'Lane map': {
    full: 'SerDes-to-fiber lane map',
    group: 'iface',
    note: 'The controlled table tracing each switch SerDes lane through the electrical IC, photonic IC and wavelength to a fiber and front-panel port, with spare lanes marked. Firmware, package, test and calibration all read it.',
  },
  'Power tree': {
    full: 'Power distribution tree',
    group: 'design',
    note: 'Every supply rail from the board input through each regulator to its loads, with voltage, tolerance and current per rail; the basis for VRM sizing and sequencing.',
  },
  'Anti-rollback': {
    full: 'Firmware anti-rollback protection',
    group: 'design',
    note: 'A monotonic counter, usually in fuses, that stops older and possibly vulnerable firmware from being loaded once a newer version has been accepted.',
  },
  'Partition freeze': {
    full: 'Architecture partition freeze',
    group: 'program',
    note: 'The gate after which the split of function across dies, optical engines, package and board is under change control; changes then cost substrate, die-to-die or engine redesign.',
  },
};
