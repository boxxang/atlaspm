/**
 * NPI — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const NPI_GLOSSARY: CpoGlossary = {
  'Golden unit': {
    full: 'Golden unit',
    group: 'test',
    note: 'A fully characterized reference unit held under custody and used to correlate testers, optical power meters and calibration stations across sites; it is recharacterized on a fixed interval and retired when it drifts.',
  },
  Cpk: {
    full: 'Process capability index',
    group: 'process',
    note: 'How far a process parameter’s distribution sits inside its limits, in units of three standard deviations; a low value means the process will produce out-of-limit units even when centered.',
  },
  'Gauge R&R': {
    full: 'Gauge repeatability and reproducibility',
    group: 'test',
    note: 'A study of how much of a measurement’s spread comes from the test station and its operators rather than from the unit; if it consumes too much of the tolerance, good units fail and bad units pass.',
  },
  'Second source': {
    full: 'Second source',
    group: 'program',
    note: 'An alternative qualified supplier for a part or process; only counted once it has built units that correlate with the primary source.',
  },
  FMEA: {
    full: 'Failure mode and effects analysis',
    group: 'qual',
    note: 'A structured review of how each process step or design element can fail, how severe the effect is, how often it happens and how likely it is to be detected; the high-risk items become controls in the control plan.',
  },
  PPAP: {
    full: 'Production part approval process',
    group: 'qual',
    note: 'The package a supplier submits to show its production-tooled process makes parts that meet every requirement at rate — dimensional results, material data, process flow, FMEA and control plan.',
  },
};
