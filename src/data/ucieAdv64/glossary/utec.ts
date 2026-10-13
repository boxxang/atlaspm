/**
 * UTEC — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UTEC_GLOSSARY: UcieGlossary = {
  'Metal stack': {
    full: 'Metal stack',
    group: 'process',
    note: 'The set of interconnect layers a process offers — their number, thickness and pitch. A hard macro is drawn on one stack, so a customer on a different stack may need it re-laid out.',
  },
  'Device model': {
    full: 'Device model',
    group: 'process',
    note: 'The foundry’s simulation model of a transistor or passive across process, voltage and temperature. At 64 GT/s its accuracy for parasitic capacitance and resistance decides whether simulation predicts silicon.',
  },
  'Package design rules': {
    full: 'Package design rules',
    group: 'pkg',
    note: 'A package partner’s minimum widths, spacings, layer counts, via structures and assembly keep-outs. The macro’s bump map and die edge must satisfy the most restrictive partner it supports.',
  },
  Shuttle: {
    full: 'Shuttle run',
    group: 'process',
    note: 'A wafer run shared by several designs on a fixed foundry schedule. Cheaper than a dedicated run, but the tapeout date is the foundry’s, not the program’s.',
  },
};
