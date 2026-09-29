/**
 * RAMP — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const RAMP_GLOSSARY: CpoGlossary = {
  SPC: {
    full: 'Statistical process control',
    group: 'process',
    note: 'Charting critical process and test parameters against control limits derived from the process itself, so a shift is caught before units fail their specification limits.',
  },
  OCAP: {
    full: 'Out-of-control action plan',
    group: 'process',
    note: 'The written response to a control chart alarm: what to hold, who decides, what to check and how held material is released.',
  },
  SBOM: {
    full: 'Software bill of materials',
    group: 'program',
    note: 'The list of every software component and version in a firmware or software release, used to find which releases are affected by a newly disclosed vulnerability.',
  },
  'Anti-rollback': {
    full: 'Anti-rollback protection',
    group: 'design',
    note: 'A monotonic counter, usually held in fuses, that makes the boot chain refuse any signed image older than the minimum allowed version, so a device cannot be downgraded to a vulnerable release.',
  },
};
