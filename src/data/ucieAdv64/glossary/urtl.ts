/**
 * URTL — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const URTL_GLOSSARY: UcieGlossary = {
  Lint: {
    full: 'RTL lint',
    group: 'verif',
    note: 'Static checks of RTL against coding and structural rules — undriven signals, width mismatches, latches, unsafe constructs — run before simulation and synthesis so they do not find the same bugs later and slower.',
  },
  Scrambling: {
    full: 'Scrambling',
    group: 'iface',
    note: 'XORing the data on each lane with a pseudo-random sequence both dies generate in step, so long runs of identical bits and repeating patterns do not reach the channel. The descrambler undoes it at the receiver.',
  },
  'Retry buffer': {
    full: 'Retry buffer',
    group: 'design',
    note: 'The memory in the D2D Adapter that holds transmitted Flits until the partner acknowledges them, so any Flit that fails CRC can be replayed. It must cover the full round trip of the link.',
  },
  'Clock gating': {
    full: 'Clock gating',
    group: 'design',
    note: 'Stopping the clock to logic that is idle, to save dynamic power. In a PHY it has to be sequenced with the link’s power states so no data or state is lost.',
  },
  'Link power states': {
    full: 'Link power states (L1 and L2)',
    group: 'iface',
    note: 'The low-power states a UCIe link enters when idle: L1 keeps enough state for a fast exit back to active, L2 powers down more and exits more slowly. Entry and exit are handshakes between both dies.',
  },
  'Multi-module striping': {
    full: 'Multi-module striping',
    group: 'iface',
    note: 'Spreading Flits across two or more UCIe modules that a licensee aggregates for bandwidth, and keeping them in order across the modules’ separate lanes, skew and retrains.',
  },
};
