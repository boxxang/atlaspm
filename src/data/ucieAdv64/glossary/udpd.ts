/**
 * UDPD — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UDPD_GLOSSARY: UcieGlossary = {
  'Timing closure': {
    full: 'Timing closure',
    group: 'design',
    note: 'Iterating placement, sizing and routing until every path meets its setup and hold requirement in every corner and mode, with no violations left unexplained.',
  },
  Hardening: {
    full: 'Macro hardening',
    group: 'design',
    note: 'Turning synthesizable logic into a fixed-layout block with its abstract, timing and power views, so a customer places it as a hard macro rather than implementing it again.',
  },
  'Netlist hand-off': {
    full: 'Netlist hand-off',
    group: 'design',
    note: 'Releasing one recorded netlist revision to every downstream consumer — gate-level simulation, place and route, signoff — so all of them check the same design.',
  },
};
