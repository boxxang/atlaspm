/**
 * OESD — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const OESD_GLOSSARY: CpoGlossary = {
  'Hybrid bonding': {
    full: 'Hybrid bonding',
    group: 'pkg',
    note: 'Joining two dies face to face by bonding their dielectric and copper pads directly, without solder bumps. It allows pad pitches far finer than microbumps and very short, low-parasitic connections, at the cost of demanding surface flatness, cleanliness and alignment.',
  },
  'Through-oxide via': {
    full: 'Through-oxide via',
    group: 'pkg',
    note: 'A vertical connection through the oxide and thinned substrate of a die, used here to carry power and control from a stack down to the engine substrate. Its pitch and placement are fixed with the bond pad map.',
  },
  'Engine substrate': {
    full: 'Optical engine substrate',
    group: 'pkg',
    note: 'The small substrate or carrier an optical engine stack is mounted on: it routes power, control and high-speed lanes from the stack to the main package, holds the fiber block and conducts heat to the cold plate.',
  },
  KGOE: {
    full: 'Known-good optical engine',
    group: 'test',
    note: 'An optical engine — electrical IC stacked on photonic IC, on its substrate, with fiber attached — that has passed engine-level electrical and optical test and its bin limits, and may be mounted on a main package. The engine-level counterpart of a known-good die.',
  },
  'V-groove': {
    full: 'V-groove',
    group: 'pkg',
    note: 'A precisely etched groove that seats a fiber passively at the right height and position against a coupler. It trades some coupling loss for faster, alignment-free assembly.',
  },
  'Edge coupler': {
    full: 'Edge coupler',
    group: 'design',
    note: 'A photonic IC structure that couples light in or out through the die edge into a fiber or fiber array, with a tapered mode converter. Broadband and polarization-tolerant, but it needs a polished facet and tight alignment.',
  },
  'Thermal crosstalk': {
    full: 'Thermal crosstalk',
    group: 'design',
    note: 'Heat from one channel’s heater or circuit reaching a neighbouring channel and shifting its resonance. In a stacked optical engine it also flows through the electrical IC and the substrate, so it is analyzed for the stack, not the photonic IC alone.',
  },
  'Assembly design kit': {
    full: 'Assembly design kit',
    group: 'process',
    note: 'The assembly partner’s process limits written as rules a designer can check — pad pitch and size, keep-outs, fiducials, warpage and bond line limits — the assembly counterpart of a foundry design kit.',
  },
  'Cross-die LVS': {
    full: 'Cross-die layout-versus-schematic',
    group: 'verif',
    note: 'Connectivity checking across two or more stacked dies and their substrate as one assembly, so a pad on one die is proven to land on the right pad of the other. Each die passing its own LVS does not prove this.',
  },
};
