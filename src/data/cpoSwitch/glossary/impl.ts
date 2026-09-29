/**
 * IMPL — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const IMPL_GLOSSARY: CpoGlossary = {
  PEX: {
    full: 'Parasitic Extraction',
    group: 'tool',
    note: 'Computing the resistance and capacitance the drawn layout adds to every net, so a circuit can be resimulated as built rather than as drawn in the schematic.',
  },
  'Optical DRC': {
    full: 'Optical design rule check',
    group: 'verif',
    note: 'The photonics process rule check: bend radius, waveguide width and spacing, curved-geometry and coupler rules. Curved shapes produce false errors on grid-based checkers, so waivers need a foundry-agreed method rather than bulk approval.',
  },
  'Grating coupler': {
    full: 'Grating coupler',
    group: 'design',
    note: 'A periodic structure etched into a waveguide that couples light vertically in and out of the photonic IC. It makes wafer-level optical probing possible, at the cost of wavelength sensitivity and more loss than an edge coupler.',
  },
  'Bump map': {
    full: 'Bump and microbump map',
    group: 'pkg',
    note: 'The coordinates and net assignment of every bump on a die. Each die, the bridge, the package substrate and the probe card all carry a copy, and every copy has to agree.',
  },
  Warpage: {
    full: 'Package warpage',
    group: 'pkg',
    note: 'Out-of-plane bending of the package from mismatched thermal expansion between die, substrate and mold. It decides bump joint yield at reflow and, in a co-packaged switch, whether fiber alignment holds.',
  },
  'Design-in kit': {
    full: 'Customer design-in kit',
    group: 'program',
    note: 'What a customer needs to design the part into their own system before silicon: reference board files, electrical, optical and thermal models, a hardware design guide and the sample schedule.',
  },
};
