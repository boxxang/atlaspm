/**
 * The UCIe and IP-development terms many stages share. Generic: no vendor,
 * product or specification revision.
 */
import type { UcieGlossary } from '../types';

export const CORE_GLOSSARY: UcieGlossary = {
  FDI: {
    full: 'Flit-Aware Die-to-Die Interface',
    group: 'iface',
    note: 'The boundary between the Protocol Layer and the D2D Adapter. The customer’s protocol controller sits above it; this IP starts below it.',
  },
  RDI: {
    full: 'Raw Die-to-Die Interface',
    group: 'iface',
    note: 'The boundary between the D2D Adapter and the Physical Layer. Exposed when a customer brings their own adapter, so it is specified and verified as an interface of its own.',
  },
  AFE: {
    full: 'Analog Front-End',
    group: 'design',
    note: 'The Electrical PHY’s analog circuits — transmit drivers, receive front-ends and samplers, clocking, bias and ESD — that put bits onto the bumps and take them off.',
  },
  'UCIe-A': {
    full: 'UCIe Advanced package',
    group: 'iface',
    note: 'The UCIe option for fine-pitch advanced packages — silicon bridge, silicon interposer or RDL interposer — with wide modules of many lanes over short channels and redundant lanes for repair.',
  },
  'UCIe-S': {
    full: 'UCIe Standard package',
    group: 'iface',
    note: 'The UCIe option for organic substrates with coarser bump pitch, narrower modules and longer reach. Out of scope here except where a shared block must not preclude it.',
  },
  SBINIT: {
    full: 'Sideband Initialization',
    group: 'iface',
    note: 'The first link training state: the two dies find each other on the sideband before anything is sent on the mainband.',
  },
  MBINIT: {
    full: 'Mainband Initialization',
    group: 'iface',
    note: 'The training state that brings up the mainband: parameter exchange, lane and clock checks, lane repair and lane reversal detection.',
  },
  MBTRAIN: {
    full: 'Mainband Training',
    group: 'iface',
    note: 'The training state that tunes the mainband at the target speed — voltage and timing centering and speed negotiation. On an Advanced package a failing lane is repaired onto a redundant lane and the link may fall back to a lower speed; width degrade is a Standard package mechanism.',
  },
  LINKINIT: {
    full: 'Link Initialization',
    group: 'iface',
    note: 'The state where the Adapter and the Physical Layer finish bringing the link up and hand it to the protocol as active.',
  },
  PHYRETRAIN: {
    full: 'Physical Layer Retrain',
    group: 'iface',
    note: 'The state that retrains an active link — after errors, a parameter change or a request — without tearing the link down to sideband initialization.',
  },
  TRAINERROR: {
    full: 'Training Error',
    group: 'iface',
    note: 'The state a link falls into when training fails or a fatal error is detected; the link leaves it only through a defined reset path.',
  },
  Flit: {
    full: 'Flow-control unit',
    group: 'iface',
    note: 'The fixed-size unit the D2D Adapter carries, with its CRC, in the Flit modes. Raw mode passes protocol data through without the Adapter’s Flit framing.',
  },
  CRC: {
    full: 'Cyclic Redundancy Check',
    group: 'iface',
    note: 'The code the D2D Adapter appends to each Flit so the receiver can detect corruption and ask for a retry.',
  },
  Retry: {
    full: 'Link-level retry',
    group: 'iface',
    note: 'The D2D Adapter’s replay of Flits that failed CRC, from a retry buffer, so that an occasional bit error never reaches the protocol.',
  },
  'Raw mode': {
    full: 'Raw format',
    group: 'iface',
    note: 'A UCIe Flit format choice in which the Adapter passes the protocol’s data straight through without its own CRC and retry — used when the protocol brings its own, or for continuous streams. A format, not a protocol: a streaming protocol can run over it.',
  },
  'Streaming mode': {
    full: 'Streaming protocol',
    group: 'iface',
    note: 'Carrying a user-defined protocol over UCIe rather than one of the standard protocols. A protocol, not a format: it can use the Raw format or one of the Adapter’s Flit formats.',
  },
  Sideband: {
    full: 'Sideband',
    group: 'iface',
    note: 'The slow, always-available link beside the mainband that carries training, register access, manageability and error messages, and comes up first.',
  },
  Mainband: {
    full: 'Mainband',
    group: 'iface',
    note: 'The high-speed data lanes of a UCIe module, with their forwarded clock, valid and track signals.',
  },
  'Forwarded clock': {
    full: 'Forwarded clock',
    group: 'iface',
    note: 'The clock the transmitter sends beside its data lanes so the receiver samples with the same clock that launched the data, which removes most of the jitter budget a recovered clock would need.',
  },
  'Lane repair': {
    full: 'Lane repair',
    group: 'iface',
    note: 'Remapping a failed data, clock, valid or track lane onto a redundant lane — the answer to fine-pitch bumps that do not all connect.',
  },
  'Lane reversal': {
    full: 'Lane reversal',
    group: 'iface',
    note: 'Detecting and undoing a module wired lane 0 to lane N−1, so the same macro works whichever way the two dies face each other.',
  },
  Deskew: {
    full: 'Deskew',
    group: 'iface',
    note: 'Aligning lanes whose bits arrive at slightly different times so a whole word is sampled together.',
  },
  'Runtime recalibration': {
    full: 'Runtime recalibration',
    group: 'iface',
    note: 'Re-tuning a link’s timing and voltage while it carries traffic or with minimal interruption, to follow temperature and voltage drift without a full retrain.',
  },
  'Bump pitch': {
    full: 'Bump pitch',
    group: 'pkg',
    note: 'The center-to-center spacing of the die’s bumps. UCIe Advanced packages run at fine pitches, which sets how many lanes fit per millimeter of die edge.',
  },
  Shoreline: {
    full: 'Shoreline',
    group: 'design',
    note: 'The length of die edge a die-to-die interface occupies. Bandwidth per millimeter of shoreline is the density figure customers compare.',
  },
  'Energy per bit': {
    full: 'Energy per bit',
    group: 'design',
    note: 'Link power divided by data rate, usually in picojoules per bit — the efficiency figure a die-to-die PHY is sold on.',
  },
  'Silicon bridge': {
    full: 'Silicon bridge',
    group: 'pkg',
    note: 'A small piece of silicon with fine wiring embedded in or placed on a package substrate under the edges of two dies, carrying their die-to-die lanes without a full interposer.',
  },
  'Silicon interposer': {
    full: 'Silicon interposer',
    group: 'pkg',
    note: 'A passive silicon die under all the dies of a package, with fine-pitch wiring between them and through-silicon vias down to the substrate.',
  },
  'RDL interposer': {
    full: 'Redistribution-layer interposer',
    group: 'pkg',
    note: 'An interposer built from organic redistribution layers rather than silicon — coarser wiring and different loss, at lower cost and larger size.',
  },
  'Test chip': {
    full: 'Test chip',
    group: 'test',
    note: 'A chip built to prove an IP on silicon: the IP plus pattern generators, checkers and test logic, taped out on its own or on a shuttle.',
  },
  'Test vehicle': {
    full: 'Test vehicle',
    group: 'test',
    note: 'The package, substrate and board a test chip is assembled on so the IP can be measured in a realistic channel — here, two dies on an advanced package.',
  },
  'Hard macro': {
    full: 'Hard macro',
    group: 'ip',
    note: 'An IP block delivered as fixed layout with its abstract, timing and power views, which the customer places rather than re-implements.',
  },
  'Production release': {
    full: 'Production release',
    group: 'program',
    note: 'The release at which an IP is supported for production use by any licensee, backed by silicon data and complete deliverables — what some vendors call general availability.',
  },
  Liberty: {
    full: 'Liberty timing and power library',
    group: 'tool',
    note: 'The standard text format for a block’s timing, power and pin data that the customer’s implementation and signoff tools read.',
  },
  'Monte Carlo': {
    full: 'Monte Carlo simulation',
    group: 'verif',
    note: 'Repeating a circuit simulation over randomly drawn device mismatch and process variation to find the spread of a result rather than a single corner.',
  },
  DLL: {
    full: 'Delay-Locked Loop',
    group: 'design',
    note: 'A loop that aligns a clock’s delay to a reference — used to place sampling phases precisely against the forwarded clock.',
  },
  Equalization: {
    full: 'Equalization',
    group: 'design',
    note: 'Shaping the transmitted or received signal to undo the channel’s loss and reflections, so the eye is open where it is sampled.',
  },
  'Eye margin': {
    full: 'Eye margin',
    group: 'test',
    note: 'How far the sampling point can move in time or voltage before errors appear — measured per lane, and the first silicon number compared with simulation.',
  },
  Compliance: {
    full: 'Compliance testing',
    group: 'test',
    note: 'Testing an implementation against the specification’s defined tests and limits, as distinct from proving it works with one particular partner.',
  },
  Interoperability: {
    full: 'Interoperability testing',
    group: 'test',
    note: 'Linking an implementation with another party’s implementation of the same standard and showing they train and carry traffic together.',
  },
  Signoff: {
    full: 'Signoff',
    group: 'verif',
    note: 'The final timing, power, reliability and physical checks a design must pass, on the final database, before it is released.',
  },
  Abstract: {
    full: 'Abstract view',
    group: 'tool',
    note: 'The outline, pins and blockages of a hard macro that a customer’s place-and-route tool reads instead of the full layout.',
  },
  'Release package': {
    full: 'IP release package',
    group: 'ip',
    note: 'Everything a licensee receives at a release: RTL or views, models, constraints, scripts, documents and the release notes and QA record that say what each is.',
  },
  VTF: {
    full: 'Voltage Transfer Function',
    group: 'iface',
    note: 'How UCIe specifies a short die-to-die channel: the ratio of received to transmitted voltage with the driver and receiver loads included, and the crosstalk the same way, judged against an eye mask rather than with S-parameters alone.',
  },
  'Eye mask': {
    full: 'Eye mask',
    group: 'iface',
    note: 'The region of the received eye that must stay open at the sampling point for a channel and its transmitter and receiver to be compliant.',
  },
  'Reference die': {
    full: 'Reference die',
    group: 'test',
    note: 'A known-good UCIe die on a known-good bridge or interposer that a device under test links to for compliance testing; the tests run over the sideband using the dies’ own margining, BER and skew measurement.',
  },
  'Channel compliance kit': {
    full: 'Channel compliance kit',
    group: 'ip',
    note: 'What a licensee needs to sign off their own die-to-die channel: behavioral transmitter and receiver models, the transfer-function and crosstalk flow, the eye mask and a script that checks the result.',
  },
  'Termination': {
    full: 'Receiver termination',
    group: 'design',
    note: 'A resistive load at the receiver that controls reflections. Short Advanced-package lanes can run unterminated at lower speeds; whether the highest speeds need it sets swing, power and pad loading.',
  },
};
