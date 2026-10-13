/**
 * USGN — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const USGN_GLOSSARY: UcieGlossary = {
  'Antenna check': {
    full: 'Antenna rule check',
    group: 'verif',
    note: 'A physical verification check that long metal connected only to a transistor gate during manufacturing cannot collect enough charge to damage the gate oxide.',
  },
  'Device aging': {
    full: 'Device aging',
    group: 'qual',
    note: 'The slow drift of transistor threshold and drive over years of voltage, temperature and switching. In a PHY it appears as offset and delay drift that calibration must keep absorbing to end of life.',
  },
};
