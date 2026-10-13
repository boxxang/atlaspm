/**
 * UREQ — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UREQ_GLOSSARY: UcieGlossary = {
  'Power domain': {
    full: 'Power domain',
    group: 'design',
    note: 'A region of a chip on its own supply that can be switched or scaled independently; the PHY’s domains must map onto those the customer SoC provides.',
  },
  Manageability: {
    full: 'Manageability',
    group: 'iface',
    note: 'The sideband features that let system software configure, monitor and update the link — register access, firmware download and priority messages — without the mainband.',
  },
  'Low-power states': {
    full: 'Link low-power states',
    group: 'iface',
    note: 'The L1 and L2 states a die-to-die link enters to save power when idle, with their entry and exit sequences and the latency to return to active.',
  },
};
