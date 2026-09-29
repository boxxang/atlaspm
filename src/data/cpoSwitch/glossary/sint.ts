/**
 * SINT — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const SINT_GLOSSARY: CpoGlossary = {
  'Line rate': {
    full: 'Line rate',
    group: 'iface',
    note: 'The full signalling rate of a port. Traffic at line rate with zero loss is the test that a switch forwards what its ports can carry, rather than what a reduced test rate allows.',
  },
  'Traffic generator': {
    full: 'Network traffic generator and analyzer',
    group: 'tool',
    note: 'Test equipment that sends packets at controlled rates, sizes and patterns into a switch and checks what comes out — loss, order, latency and errors — per port.',
  },
  'Network OS': {
    full: 'Network operating system',
    group: 'tool',
    note: 'The operating system a switch runs in the field. It programs the switching silicon through the SDK and a switch abstraction layer, and carries the management plane operators use.',
  },
};
