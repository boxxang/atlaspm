/**
 * REQ — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const REQ_GLOSSARY: CpoGlossary = {
  'Pre-FEC BER': {
    full: 'Pre-FEC bit error ratio',
    group: 'verif',
    note: 'The raw bit error ratio a link must reach before forward error correction; the FEC then brings it to the post-FEC target. Optical and electrical budgets are written against the pre-FEC figure, so a specification must say which one it means.',
  },
  'Reach class': {
    full: 'Optical reach class',
    group: 'iface',
    note: 'A named distance band the optical ports support, defined with its fiber type and connector count; each class has its own link budget.',
  },
  Radix: {
    full: 'Switch radix',
    group: 'design',
    note: 'The number of ports a switch exposes at a given port speed. Higher radix flattens the network but multiplies SerDes, optical lanes and fibers.',
  },
  'Threat model': {
    full: 'Product threat model',
    group: 'design',
    note: 'A ranked list of the assets, adversaries and attack surfaces of the product, used to derive security requirements and show every threat has a control or an accepted risk.',
  },
  RAS: {
    full: 'Reliability, availability and serviceability',
    group: 'design',
    note: 'The features that detect, correct, log and contain faults — error correction, lane sparing, graceful degradation, field replacement — so a failure costs a lane rather than a switch.',
  },
  'Traceability matrix': {
    full: 'Requirements traceability matrix',
    group: 'program',
    note: 'A table linking each requirement to its parent customer need and to the verification method and activity that will prove it; the baseline every later review reports against.',
  },
};
