/**
 * RELQ — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const RELQ_GLOSSARY: CpoGlossary = {
  MTBF: {
    full: 'Mean Time Between Failures',
    group: 'qual',
    note: 'The expected operating time between failures of a repairable system, the reciprocal of its failure rate. Operators use it to plan spares and service; on a co-packaged switch the optical terms dominate it.',
  },
  'Damp heat': {
    full: 'Damp heat test',
    group: 'qual',
    note: 'Long exposure to high temperature and high humidity, used on optical parts to find moisture-driven degradation of facets, coatings, adhesives and optical interfaces.',
  },
  BLR: {
    full: 'Board-Level Reliability',
    group: 'qual',
    note: 'Thermal cycling and mechanical stress of packages mounted on a representative board, with solder joints monitored, to show the package survives on the customer board and not only on its own.',
  },
  'Latch-up': {
    full: 'Latch-up',
    group: 'qual',
    note: 'A parasitic thyristor in CMOS turning on and short-circuiting the supply, triggered by overvoltage or injected current. Qualification shows each pin withstands a specified trigger current.',
  },
  'Fiber retention': {
    full: 'Fiber retention',
    group: 'pkg',
    note: 'The ability of a fiber attach to hold its position and optical coupling under pull and side-load forces from handling, installation and service. Failure is measured as coupling loss change, not only detachment.',
  },
  'Design FMEA': {
    full: 'Design Failure Mode and Effects Analysis',
    group: 'qual',
    note: 'A structured list of the ways the design can fail, their effects and causes, ranked by severity, occurrence and detection. Qualification maps its high-ranked reliability failure modes to stress tests that can accelerate them.',
  },
  'Temperature cycling': {
    full: 'Temperature cycling',
    group: 'test',
    note: 'Repeated swings between cold and hot extremes that fatigue joints and interfaces through mismatched expansion. On an optical engine it stresses the bond between the stacked dies and the fiber coupling, so coupling loss is measured at each readpoint, not only electrical continuity.',
  },
};
