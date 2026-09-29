/**
 * PCTL — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const PCTL_GLOSSARY: CpoGlossary = {
  IMS: {
    full: 'Integrated master schedule',
    group: 'program',
    note: 'The single program schedule built from every workstream’s plan, with cross-workstream handoffs and the critical path; the schedule every gate review reads.',
  },
  Waiver: {
    full: 'Freeze waiver',
    group: 'program',
    note: 'A recorded, approved exception that lets a gate pass with an item still open, naming its owner and the later gate by which it must close.',
  },
  'Configuration item': {
    full: 'Configuration item',
    group: 'program',
    note: 'Anything placed under version control and baselined — a design database, firmware image, test program, calibration table or bill of materials — so each build can be tied to exactly what it used.',
  },
};
