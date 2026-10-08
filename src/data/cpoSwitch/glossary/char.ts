/**
 * CHAR — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const CHAR_GLOSSARY: CpoGlossary = {
  'Corner lot': {
    full: 'Corner lot',
    group: 'process',
    note: 'Wafers deliberately processed toward the fast, slow or skewed edges of the process window so characterization measures the parts that are hardest to make work, not only the typical ones.',
  },
  'Jitter tolerance': {
    full: 'Jitter tolerance',
    group: 'test',
    note: 'The amount of sinusoidal and random jitter a receiver can absorb at a stated error rate, swept across jitter frequency. It shows how much timing margin a lane really has.',
  },
  'Extinction ratio': {
    full: 'Extinction ratio',
    group: 'test',
    note: 'The ratio of optical power in the one level to the zero level of a modulated signal. Too low and the receiver cannot tell the levels apart; pushing it higher costs driver swing and power.',
  },
  TDECQ: {
    full: 'Transmitter and Dispersion Eye Closure Quaternary',
    group: 'test',
    note: 'A measure of how much a multi-level optical transmitter closes the eye relative to an ideal one, after a reference equalizer. The usual figure of merit for optical transmit quality in the applicable Ethernet specifications.',
  },
  'Receiver sensitivity': {
    full: 'Receiver sensitivity',
    group: 'test',
    note: 'The lowest optical power at which a receiver still meets the target error rate. The gap between it and the power actually delivered is the receive margin of the link.',
  },
  'Dark current': {
    full: 'Dark current',
    group: 'test',
    note: 'The current a photodetector passes with no light on it. It sets a noise floor for the receiver and rises steeply with temperature, so it is characterized across the case temperature range rather than at room temperature.',
  },
};
