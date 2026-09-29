/**
 * DSGN — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const DSGN_GLOSSARY: CpoGlossary = {
  'Microring modulator': {
    full: 'Microring resonator modulator',
    group: 'design',
    note: 'A compact resonant modulator whose wavelength shifts with temperature and process, so it needs a heater and a control loop to stay locked to its channel.',
  },
  'Mach-Zehnder modulator': {
    full: 'Mach-Zehnder interferometric modulator',
    group: 'design',
    note: 'A broadband modulator that splits and recombines light; tolerant of temperature but longer and harder to drive than a resonant one.',
  },
  'Monitor photodiode': {
    full: 'Monitor photodiode',
    group: 'design',
    note: 'An on-chip photodetector that taps a small fraction of the light so firmware can measure power and lock wavelengths. Without enough of them the calibration loops are blind.',
  },
  Microbump: {
    full: 'Microbump',
    group: 'pkg',
    note: 'A fine-pitch solder or copper bump joining a die to a bridge or interposer. Its map is shared by the die, the bridge and the package, so every change is an interface change.',
  },
  'Secure boot': {
    full: 'Secure boot',
    group: 'design',
    note: 'A boot sequence in which immutable ROM code authenticates each firmware image against keys held in fuses before running it.',
  },
  'Design freeze': {
    full: 'Design freeze',
    group: 'program',
    note: 'The point after which RTL, circuit and photonic databases change only through change control, so implementation and signoff work on a stable base.',
  },
  DFMEA: {
    full: 'Design Failure Mode and Effects Analysis',
    group: 'qual',
    note: 'A structured review of how each part of the design can fail, how severe and how likely each failure is, and what action retires it — run at design freeze while fixes are still cheap.',
  },
};
