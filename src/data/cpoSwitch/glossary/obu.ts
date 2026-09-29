/**
 * OBU — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const OBU_GLOSSARY: CpoGlossary = {
  'Wavelength lock': {
    full: 'Wavelength lock',
    group: 'design',
    note: 'The control loop that keeps each wavelength-selective element of the photonic IC on its channel as temperature and power change, usually by adjusting heater power from a monitor photodiode reading.',
  },
  'Heater tuning': {
    full: 'Heater tuning',
    group: 'design',
    note: 'Setting the power of the on-chip heaters that shift a photonic element onto its wavelength. Heater efficiency sets how much power tuning costs, and neighbouring heaters disturb each other through thermal crosstalk.',
  },
  'Extinction ratio': {
    full: 'Extinction ratio',
    group: 'test',
    note: 'The ratio of optical power in the one and zero levels of a modulated signal. Too low and the receiver loses sensitivity; it is set by modulator bias and drive and traded against insertion loss.',
  },
  OMA: {
    full: 'Optical Modulation Amplitude',
    group: 'test',
    note: 'The difference in optical power between the one and zero levels. Receiver sensitivity and transmitter specifications are usually stated in it, which makes it the natural unit for comparing measured margin with the link budget.',
  },
};
