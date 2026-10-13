/**
 * UDFT — terms its write-ups use that no other glossary explains.
 */
import type { UcieGlossary } from '../types';

export const UDFT_GLOSSARY: UcieGlossary = {
  'Fault coverage': {
    full: 'Fault coverage',
    group: 'test',
    note: 'The share of modeled faults — stuck-at, transition and others — that the test patterns would detect. The figure a scan and ATPG plan is held to.',
  },
  'At-speed test': {
    full: 'At-speed test',
    group: 'test',
    note: 'Testing logic or a link at its mission clock rate rather than a slow test clock, so timing defects show up. Transition fault patterns are the digital form of it.',
  },
  Margining: {
    full: 'Lane margining',
    group: 'test',
    note: 'Moving a receiver’s sampling phase and reference voltage away from their trained values in steps, counting errors at each step, to measure how much margin a lane has. Built into the PHY so it works on the tester, in the lab and in a customer’s system.',
  },
  'Trace buffer': {
    full: 'Trace buffer',
    group: 'test',
    note: 'An on-chip memory that records a history of internal states or events, read out after a failure so the sequence that led to it can be reconstructed.',
  },
};
