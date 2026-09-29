/**
 * TINF — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const TINF_GLOSSARY: CpoGlossary = {
  'Probe card': {
    full: 'Probe card',
    group: 'test',
    note: 'The custom fixture that contacts every pad or bump of a die on the wafer and connects it to the tester. Designed from the bump map, it is a long-lead part that must be ordered well before tapeout.',
  },
  'Load board': {
    full: 'Load board',
    group: 'test',
    note: 'The tester interface board that carries the socket, power delivery and loopback channels for package and final test. For a co-packaged part it must also leave room for the fiber.',
  },
  'Guard band': {
    full: 'Guard band',
    group: 'test',
    note: 'The margin by which a production test limit is set tighter than the specification, to cover measurement uncertainty and drift. Too wide wastes yield; too narrow lets marginal parts escape.',
  },
  'Active alignment': {
    full: 'Active alignment',
    group: 'process',
    note: 'Aligning a fiber or lens to the photonic IC while light is on and coupled power is measured, then fixing it in place. Accurate, but its cycle time and adhesive cure shrinkage set assembly cost and yield.',
  },
  MES: {
    full: 'Manufacturing Execution System',
    group: 'process',
    note: 'The factory system that tracks each lot and unit through every process and test step, and records what was done to it, where and with which recipe.',
  },
  'Burn-in': {
    full: 'Burn-in',
    group: 'test',
    note: 'Operating a part at elevated current and temperature for a set time before use, so weak units fail in the factory rather than in the field. For optical sources it is the main screen for infant failures.',
  },
  ICT: {
    full: 'In-Circuit Test',
    group: 'test',
    note: 'Electrical test of an assembled board — opens, shorts, component values and orientation — through fixture probes or boundary scan, before the expensive package is mounted.',
  },
  'Run-in': {
    full: 'Run-in',
    group: 'test',
    note: 'Operating a finished system for a set period, often under load and temperature, before final test and shipment, to expose early failures at the system level.',
  },
};
