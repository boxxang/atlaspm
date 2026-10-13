/**
 * UFND — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UFND_GLOSSARY: UcieGlossary = {
  'Foundation IP': {
    full: 'Foundation IP',
    group: 'ip',
    note: 'The basic blocks a PHY is built on rather than designs itself — reference PLLs or DLLs, ESD and I/O cells, standard cells and memories — each with its own silicon status on the node.',
  },
  'Memory compiler': {
    full: 'Memory compiler',
    group: 'tool',
    note: 'A generator that produces memory instances of a chosen size and configuration with their views. The D2D Adapter’s retry buffer is one.',
  },
  Regression: {
    full: 'Regression',
    group: 'verif',
    note: 'The automated suite of tests rerun on every change so that a fix in one place is seen to break nothing elsewhere.',
  },
};
