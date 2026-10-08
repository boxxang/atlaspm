/**
 * TRDY — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const TRDY_GLOSSARY: CpoGlossary = {
  'Compact model': {
    full: 'Compact device model',
    group: 'tool',
    note: 'A fast parameterized model of a device — a transistor, a modulator, a photodetector — that circuit simulators use. In a photonic PDK it is only as good as its last correlation to measured wafers.',
  },
  'Second source': {
    full: 'Second source',
    group: 'program',
    note: 'A second qualified supplier for the same part, able to ship to the same specification. Where one cannot be qualified in time, buffer stock and a written acceptance of the single-source risk stand in for it.',
  },
  'Capacity reservation': {
    full: 'Capacity reservation',
    group: 'program',
    note: 'A contractual commitment from a supplier to hold wafer, substrate, assembly or component capacity for the program on stated dates, usually against a forecast and a financial commitment.',
  },
  'Long-lead item': {
    full: 'Long-lead item',
    group: 'program',
    note: 'A material or piece of equipment whose lead time is long enough that it must be ordered before the design that uses it is final — substrates, optical sources, fiber assemblies, probe cards and sockets are typical.',
  },
  FTO: {
    full: 'Freedom to Operate',
    group: 'program',
    note: 'A legal opinion that the product can be made and sold without infringing third-party patents, reached by mapping the design against a patent landscape and resolving each exposure by design-around, licence or accepted risk.',
  },
  'Process qualification run': {
    full: 'Process qualification run',
    group: 'process',
    note: 'A set of lots built on the production process and line with the production recipe to show each step meets its yield and capability targets before product material is committed to it.',
  },
};
