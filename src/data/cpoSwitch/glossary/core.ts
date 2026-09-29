/**
 * The core co-packaged-optics vocabulary every CPO stage uses. Terms only one
 * stage needs live in that stage's glossary file beside this one.
 */
import type { CpoGlossary } from '../types';

export const CORE_GLOSSARY: CpoGlossary = {
  CPO: {
    full: 'Co-Packaged Optics',
    group: 'pkg',
    note: 'Optical engines placed in the same package as the switching silicon, so the electrical path to the optics is millimetres rather than a board trace to a front-panel module.',
  },
  PIC: {
    full: 'Photonic Integrated Circuit',
    group: 'design',
    note: 'The optical chip: waveguides, modulators, photodetectors, multiplexers and couplers fabricated on a photonics process.',
  },
  EIC: {
    full: 'Electrical Integrated Circuit',
    group: 'design',
    note: 'The electronic chip beside the photonic IC that drives its modulators and amplifies its photodetector currents — drivers, transimpedance amplifiers, bias and control.',
  },
  TIA: {
    full: 'Transimpedance Amplifier',
    group: 'design',
    note: 'The receiver front end that turns a photodetector current into a voltage the SerDes can sample. Its noise and bandwidth set the receiver sensitivity.',
  },
  'Optical engine': {
    full: 'Optical engine',
    group: 'pkg',
    note: 'The assembly of an electrical IC, a photonic IC and its fiber interface that converts between electrical lanes and optical channels.',
  },
  'Optical source': {
    full: 'Optical source (laser)',
    group: 'design',
    note: 'The laser that supplies light to the photonic IC — integrated, attached or external. Its power, wavelength stability and reliability often dominate the optical link budget and the field failure rate.',
  },
  WDM: {
    full: 'Wavelength-Division Multiplexing',
    group: 'design',
    note: 'Carrying several optical channels on different wavelengths in one fiber. It sets the wavelength plan, the multiplexer design and how tightly each channel must be tuned.',
  },
  FEC: {
    full: 'Forward Error Correction',
    group: 'design',
    note: 'Redundancy added to a link so the receiver corrects errors itself. The pre-correction error rate the link must meet, and the latency the code adds, are budgeted with it.',
  },
  'Link budget': {
    full: 'Optical link budget',
    group: 'design',
    note: 'The accounting of optical power from source to receiver — coupling, waveguide, modulator and connector losses against receiver sensitivity — with the margin left for temperature, aging and manufacturing spread.',
  },
  'Coupling loss': {
    full: 'Optical coupling loss',
    group: 'pkg',
    note: 'Light lost where the fiber meets the photonic IC or the source meets the chip. Alignment tolerance, mode mismatch and assembly shift all show up here.',
  },
  'Fiber attach': {
    full: 'Fiber attach',
    group: 'pkg',
    note: 'Aligning and fixing fibers to the photonic IC — actively, while measuring light, or passively against mechanical features — and holding that alignment through reflow, cycling and handling.',
  },
  ICD: {
    full: 'Interface Control Document',
    group: 'program',
    note: 'The agreed, versioned definition of an interface between two subsystems or teams: signals, budgets, tolerances, owners. Changes go through the interface change board.',
  },
  'Interface freeze': {
    full: 'Interface freeze',
    group: 'program',
    note: 'The point after which an interface changes only through change control with an impact assessment on both sides of it.',
  },
  Bridge: {
    full: 'Silicon bridge',
    group: 'pkg',
    note: 'A small piece of silicon embedded in the package that carries dense die-to-die wiring under the edges of neighbouring dies, instead of a full interposer.',
  },
  Interposer: {
    full: 'Interposer',
    group: 'pkg',
    note: 'A silicon or organic layer between the dies and the substrate that carries fine-pitch wiring between dies and routes signals and power down to the substrate.',
  },
  'Si capacitor': {
    full: 'Silicon capacitor',
    group: 'pkg',
    note: 'A high-density capacitor built on silicon and placed in or on the package close to the die, to hold the supply steady against fast current steps.',
  },
  PRBS: {
    full: 'Pseudo-Random Bit Sequence',
    group: 'test',
    note: 'A known pattern sent across a link so the receiver can count errors without real traffic. Used in bring-up, characterization and production test.',
  },
  Loopback: {
    full: 'Loopback',
    group: 'test',
    note: 'Returning a link’s transmitted signal to its own receiver — electrically or optically — so it can be tested without a partner device.',
  },
  SLT: {
    full: 'System-Level Test',
    group: 'test',
    note: 'Testing a packaged part in a system-like environment running real traffic and firmware, to catch defects structural tests miss.',
  },
  Calibration: {
    full: 'Factory calibration',
    group: 'test',
    note: 'Per-unit tuning measured at manufacture — bias points, heater settings, wavelength and power targets — and stored with the part so it runs at its operating point in the field.',
  },
  NPI: {
    full: 'New Product Introduction',
    group: 'program',
    note: 'Taking a design through engineering, validation and pilot builds into a production line that can build it at yield and volume.',
  },
  PRR: {
    full: 'Production Readiness Review',
    group: 'program',
    note: 'The gate at which manufacturing, test, quality and supply confirm the product can be released to volume production.',
  },
  RMA: {
    full: 'Return Material Authorization',
    group: 'qual',
    note: 'The process by which a failed unit comes back from the field for analysis and replacement, and the data it produces.',
  },
  ECN: {
    full: 'Engineering Change Notice',
    group: 'program',
    note: 'The controlled record of a change to a released design or document, with its reason, scope and approval.',
  },
  Stepping: {
    full: 'Silicon stepping',
    group: 'process',
    note: 'A revision of a die — a metal-layer change or a full re-spin — that fixes defects found in earlier silicon. Production ships on the stepping that qualifies.',
  },
  'Power per bit': {
    full: 'Power per bit',
    group: 'design',
    note: 'System power divided by bandwidth — the headline efficiency figure for a switch and the main argument for co-packaging the optics.',
  },
  'Traffic manager': {
    full: 'Traffic manager',
    group: 'design',
    note: 'The switch function that queues, schedules and shapes packets across the shared buffer — where congestion, fairness and latency under load are decided.',
  },
  Telemetry: {
    full: 'Telemetry',
    group: 'design',
    note: 'Counters, histograms and events a switch reports about its traffic, links and health — including per-lane optical power and temperature — for operators to monitor.',
  },
  'Root of trust': {
    full: 'Hardware root of trust',
    group: 'design',
    note: 'The immutable starting point for secure boot — boot code and keys the rest of the firmware chain is verified against.',
  },
  'Laser safety': {
    full: 'Laser safety classification',
    group: 'qual',
    note: 'The classification and controls that keep optical power exposed at a connector or during service within safe limits.',
  },
};
