/**
 * SGNO — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const SGNO_GLOSSARY: CpoGlossary = {
  'Fuse map': {
    full: 'Fuse map',
    group: 'design',
    note: 'The allocation of one-time-programmable fuses to keys, lifecycle states, trim values and feature enables, with the order they are blown in. An ordering mistake can leave a window in which the device is provisioned but not yet locked.',
  },
  'Debug lock': {
    full: 'Debug lock',
    group: 'design',
    note: 'The hardware control that closes JTAG, scan and debug ports as the device moves from development to production lifecycle states, and reopens them only through an authenticated unlock.',
  },
  'Tapeout checklist': {
    full: 'Foundry tapeout checklist',
    group: 'program',
    note: 'The list of checks, rule-deck revisions, waivers and data formats a foundry requires before it accepts a database. Each foundry and each process has its own, and the photonics and bridge foundries rarely match the digital one.',
  },
};
