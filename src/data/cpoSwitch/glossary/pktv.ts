/**
 * PKTV — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const PKTV_GLOSSARY: CpoGlossary = {
  Coplanarity: {
    full: 'Coplanarity',
    group: 'pkg',
    note: 'How far the contact points of a surface — bumps, lands or a mounting site — depart from a common plane. On a co-packaged switch it is measured at each optical engine site, because an engine mounted on a site that is not flat tilts its fiber and loses coupling.',
  },
  'Shadow moiré': {
    full: 'Shadow moiré warpage measurement',
    group: 'test',
    note: 'An optical method that measures the out-of-plane shape of a package or substrate from the fringe pattern a grating casts on it, while the part is taken through a reflow temperature profile. It shows the shape the package has when the joints form, not only at room temperature.',
  },
  'Thermal test die': {
    full: 'Thermal test die',
    group: 'test',
    note: 'A die with patterned heaters and temperature sensors laid out to reproduce a product die’s power map and hot spots, so a package and cooling solution can be characterized before the product die exists.',
  },
  'Process window': {
    full: 'Assembly process window',
    group: 'process',
    note: 'The range of each assembly setting — attach profile, underfill, lid attach, engine mounting — inside which yield, voiding, warpage and coupling stay within their limits, with margin. Frozen from a DOE on vehicles and then held by the production line.',
  },
  'Coupling shift': {
    full: 'Optical coupling shift',
    group: 'pkg',
    note: 'The change in fiber-to-chip coupling loss caused by a later process step — reflow, underfill cure, lid attach or board mount — as the engine and its fiber move relative to each other. Measured per step on vehicles so the budget can hold it.',
  },
};
