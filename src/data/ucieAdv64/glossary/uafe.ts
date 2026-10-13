/**
 * UAFE — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UAFE_GLOSSARY: UcieGlossary = {
  Sampler: {
    full: 'Sampler',
    group: 'design',
    note: 'The receiver circuit that decides, at one clock edge, whether a bit is a one or a zero. Its regeneration time and input offset set how much of the unit interval it consumes.',
  },
  'Offset calibration': {
    full: 'Receiver offset calibration',
    group: 'design',
    note: 'Measuring and cancelling each sampler’s input offset from device mismatch, per lane, so the decision threshold sits in the middle of the eye.',
  },
  'Duty-cycle correction': {
    full: 'Duty-cycle correction',
    group: 'design',
    note: 'Adjusting a clock so its high and low halves are equal. With data launched and sampled on both edges, duty-cycle error shortens every other bit.',
  },
  'Phase adjustment': {
    full: 'Sampling phase adjustment',
    group: 'design',
    note: 'Moving the receive clock edge in small steps so it lands in the center of each lane’s eye; training searches it and runtime recalibration nudges it.',
  },
  'Bandgap reference': {
    full: 'Bandgap voltage reference',
    group: 'design',
    note: 'A circuit that produces a voltage nearly independent of temperature and supply, from which the module’s bias currents and regulated supplies are derived.',
  },
};
