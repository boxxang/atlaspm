/**
 * SDBG — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const SDBG_GLOSSARY: CpoGlossary = {
  'Metal ECO': {
    full: 'Metal-only engineering change order',
    group: 'process',
    note: 'A silicon fix confined to the metal layers, usually rewiring pre-placed spare cells, so it can be finished on wafers held before metallization. Faster and cheaper than a new mask set, but only possible if the fix fits the spares and wafers were held.',
  },
  'Full-mask re-spin': {
    full: 'Full-mask re-spin',
    group: 'process',
    note: 'A new stepping that changes base layers and therefore needs new masks from the bottom up and new wafer starts. Months longer than a metal ECO, and more of the qualification has to be repeated.',
  },
  'Optical FA': {
    full: 'Optical failure analysis',
    group: 'qual',
    note: 'Failure analysis of photonic ICs, optical sources and fiber attach: loss mapping along waveguides, coupler and facet inspection, near-field imaging and optical source degradation analysis. Fewer labs do it than silicon FA, so its capacity is often the bottleneck.',
  },
  'Test screen': {
    full: 'Test screen',
    group: 'test',
    note: 'A test added at sort, final or system-level test to reject parts showing a known defect. It contains a problem without fixing it, at a cost in yield and test time.',
  },
  'Delta qualification': {
    full: 'Delta qualification',
    group: 'qual',
    note: 'Requalification limited to the stress tests a change can affect, with the remaining results carried over from the previous qualification. It needs a written argument for every test that is not rerun.',
  },
};
