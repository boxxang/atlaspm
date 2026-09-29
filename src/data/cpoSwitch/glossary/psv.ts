/**
 * PSV — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const PSV_GLOSSARY: CpoGlossary = {
  Emulation: {
    full: 'Hardware emulation',
    group: 'verif',
    note: 'Running the RTL on a dedicated hardware system thousands of times faster than simulation, fast enough to boot firmware and pass real traffic before silicon.',
  },
  'Virtual platform': {
    full: 'Virtual platform',
    group: 'verif',
    note: 'A fast software model of the chip and board, register-accurate but not cycle-accurate, on which firmware and software are written and tested before RTL is stable.',
  },
  'Formal verification': {
    full: 'Formal property verification',
    group: 'verif',
    note: 'Mathematically proving that a property holds for every input sequence, rather than sampling behaviour with tests. Best on control logic, arbiters and protocols.',
  },
  RNM: {
    full: 'Real-Number Model',
    group: 'verif',
    note: 'An event-driven model of an analog block that passes real-valued signals, fast enough for mixed-signal regression but only as accurate as its correlation to the transistor-level design.',
  },
  'Link co-simulation': {
    full: 'End-to-end link co-simulation',
    group: 'verif',
    note: 'Simulating one lane from the transmitting SerDes through the package, electrical IC, photonic IC, fiber and back to a receiver, using each owner’s model, to estimate BER and margin against the budget.',
  },
  'Coverage closure': {
    full: 'Coverage closure',
    group: 'verif',
    note: 'The point at which every coverage target in the verification plan is hit or waived with a reason. Only as good as the plan it measures.',
  },
};
