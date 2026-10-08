/**
 * ICD — terms its write-ups use that no other glossary explains.
 */
import type { CpoGlossary } from '../types';

export const ICD_GLOSSARY: CpoGlossary = {
  'Interface register': {
    full: 'Program interface register',
    group: 'program',
    note: 'The controlled list of every interface in the product, each with its category, both owners, its ICD, current version and maturity level; the index the change control board works from.',
  },
  CCB: {
    full: 'Change control board',
    group: 'program',
    note: 'The cross-functional board that approves, rejects or defers every change to a baselined interface or requirement after assessing its impact on both sides.',
  },
  'Register map': {
    full: 'Hardware register map',
    group: 'iface',
    note: 'The addresses, fields and access rules of every register firmware can reach, generated from one source into RTL, firmware headers and documentation so they cannot diverge.',
  },
  'Ball map': {
    full: 'Package ball map',
    group: 'pkg',
    note: 'The assignment of every package-to-board solder ball to a signal, power or ground net; the board layout and package routing are both built to it.',
  },
  Genealogy: {
    full: 'Unit genealogy',
    group: 'process',
    note: 'The record linking a finished unit to the wafers, dies, lots, optical engines, optical source and process steps it was built from, carried across every factory site.',
  },
  'Host lane': {
    full: 'Host lane',
    group: 'iface',
    note: 'One electrical lane between the I/O die and an optical engine, carrying one optical lane’s data. Its position in the lane map ties an I/O die SerDes, a package route, an engine pad and a fiber together.',
  },
  'Bond pad map': {
    full: 'Stack bond pad map',
    group: 'pkg',
    note: 'The shared assignment of every pad at the bond between two stacked dies — signal, power, ground and through-connections — with pitch and position. Both dies are laid out to it, so a change on one side is a change on both.',
  },
  RIN: {
    full: 'Relative intensity noise',
    group: 'design',
    note: 'Fluctuation of a laser’s optical power relative to its average, in dB per hertz. It adds to receiver noise on every lane the source feeds and is budgeted like any other link impairment.',
  },
  'PM fiber': {
    full: 'Polarization-maintaining fiber',
    group: 'design',
    note: 'Fiber that holds the polarization of the light launched into it. Used between an external optical source and a photonic IC whose couplers and modulators accept one polarization only.',
  },
};
