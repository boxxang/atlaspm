/**
 * SORT — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const SORT_GLOSSARY: CpoGlossary = {
  'Die bank': {
    full: 'Die bank',
    group: 'process',
    note: 'Controlled inventory of singulated, sorted dies waiting for assembly, tracked per die to its wafer, position, bin and test data. Multi-die packages are built by pulling matched kits from it.',
  },
  'Wafer-level optical test': {
    full: 'Wafer-level optical test',
    group: 'test',
    note: 'Measuring photonic IC performance before dicing by coupling light through test couplers with an optical probe. Probe alignment and polarization add their own loss variation, so every wafer is calibrated against reference structures.',
  },
};
