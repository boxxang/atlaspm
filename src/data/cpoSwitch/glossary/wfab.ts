/**
 * WFAB — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const WFAB_GLOSSARY: CpoGlossary = {
  'In-line optical monitor': {
    full: 'In-line optical monitor structure',
    group: 'process',
    note: 'Test structures in the photonic reticle frame — waveguide loss spirals, ring resonators, coupler test sites — measured optically while wafers are still in the fab, so a process shift is seen before the wafers reach sort.',
  },
  'Hot lot': {
    full: 'Hot lot',
    group: 'process',
    note: 'A lot the foundry runs at elevated priority, skipping queues at each tool. It shortens cycle time for first silicon at a premium, and the priority has to be renegotiated when capacity is tight.',
  },
};
