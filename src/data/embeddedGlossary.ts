/**
 * /data/embeddedGlossary.ts — the terms the Embedded SoC write-ups use that
 * neither the SoC glossary nor the 3DIC one explains.
 *
 * Small and client-safe, like the other glossaries: a write-up offers to
 * explain a term by its key. PVT is already Process-Voltage-Temperature, so
 * the production build of the EVK is "PVT (build)", the way the ESD model sits
 * beside the memory as "HBM (ESD)".
 */
export const EMBEDDED_GLOSSARY: Record<string, { full: string; group: string; note: string }> = {
  ABI: {
    full: 'Application Binary Interface',
    group: 'design',
    note: 'How compiled code calls functions, passes arguments and lays out data. The contract that lets the compiler, the SDK libraries and customer code link together.',
  },
  BOR: {
    full: 'Brown-Out Reset',
    group: 'design',
    note: 'A reset asserted when the supply sags below a safe level, so the part stops cleanly instead of running — or writing non-volatile memory — on a voltage it cannot trust.',
  },
  'CE marking': {
    full: 'Conformité Européenne marking',
    group: 'qual',
    note: 'The declaration that a product sold in the EU meets its EMC and safety directives. Required on an evaluation kit sold through distribution.',
  },
  DMA: {
    full: 'Direct Memory Access',
    group: 'design',
    note: 'Hardware that moves data between peripherals and memory without the processor, so sensor data arrives while the core sleeps.',
  },
  DSP: {
    full: 'Digital Signal Processing / Processor',
    group: 'design',
    note: 'Filtering, transforms and similar arithmetic on sampled signals — and the class of processor built for it that an embedded part is usually compared against.',
  },
  DVT: {
    full: 'Design Verification Test (build)',
    group: 'program',
    note: 'The second hardware build of a board or kit, with the EVT fixes in, used to prove the design meets its requirements and passes pre-compliance.',
  },
  eMRAM: {
    full: 'Embedded Magnetoresistive RAM',
    group: 'ip',
    note: 'Non-volatile memory built into the logic process, storing bits in magnetic tunnel junctions. Replaces embedded flash on mature nodes; its retention, endurance, reflow survival and magnetic immunity have to be qualified.',
  },
  EVK: {
    full: 'Evaluation Kit',
    group: 'program',
    note: 'The board, software and documentation a customer buys to try the part before designing it in. For a new architecture, often the first product anyone touches.',
  },
  EVT: {
    full: 'Engineering Validation Test (build)',
    group: 'program',
    note: 'The first build of a board or kit with real parts on it, used to find what the design gets wrong before it is fixed for DVT.',
  },
  FAE: {
    full: 'Field Application Engineer',
    group: 'program',
    note: 'The engineer who supports customers designing the part in — porting their code, reviewing their schematics, debugging their prototypes.',
  },
  'FC-CSP': {
    full: 'Flip-Chip Chip-Scale Package',
    group: 'pkg',
    note: 'A package barely larger than the die, with the die flipped onto a small substrate. More I/O and better electrical performance than a leadframe package, at more cost.',
  },
  FCC: {
    full: 'Federal Communications Commission (certification)',
    group: 'qual',
    note: 'US authorisation that an electronic product’s emissions are within limits. An EVK sold in the US needs it.',
  },
  GDB: {
    full: 'GNU Debugger',
    group: 'tool',
    note: 'The standard source-level debugger. A toolchain that speaks its protocol works with the IDEs and probes developers already use.',
  },
  HAL: {
    full: 'Hardware Abstraction Layer',
    group: 'tool',
    note: 'The driver layer that gives application code one API over the peripherals, so code survives a change of part or silicon revision.',
  },
  ISA: {
    full: 'Instruction Set Architecture',
    group: 'design',
    note: 'What the hardware promises the compiler it can execute. On a dataflow fabric, the operations, datatypes and control semantics each processing element supports.',
  },
  LiteRT: {
    full: 'LiteRT (formerly TensorFlow Lite)',
    group: 'tool',
    note: 'A runtime and model format for running trained neural networks on small devices. A model the compiler imports rather than one the customer re-writes.',
  },
  LLVM: {
    full: 'LLVM compiler infrastructure',
    group: 'tool',
    note: 'The open compiler framework Clang is built on. Building a compiler on it inherits the language front ends, optimisations and tool compatibility customers expect.',
  },
  LTS: {
    full: 'Long-Term Support',
    group: 'program',
    note: 'A software release kept supported with fixes for a stated period, so a customer’s product can ship on it without chasing every new version.',
  },
  MCU: {
    full: 'Microcontroller Unit',
    group: 'design',
    note: 'A small processor with memory and peripherals on one chip — the incumbent an embedded compute part is measured against for energy, cost and ease of use.',
  },
  MLIR: {
    full: 'Multi-Level Intermediate Representation',
    group: 'tool',
    note: 'A compiler framework for building domain-specific intermediate representations. Where a dataflow compiler expresses the graph it maps onto the fabric.',
  },
  MRAM: {
    full: 'Magnetoresistive Random-Access Memory',
    group: 'ip',
    note: 'Memory that stores a bit in the magnetic orientation of a tunnel junction. Non-volatile, fast to read, with write energy and endurance that shape how it is used.',
  },
  NPU: {
    full: 'Neural Processing Unit',
    group: 'design',
    note: 'An accelerator built for neural-network inference. The edge NPUs are the competition for always-on inference workloads.',
  },
  ONNX: {
    full: 'Open Neural Network Exchange',
    group: 'tool',
    note: 'An open format for trained models, so a network trained in one framework can be imported by another toolchain.',
  },
  POR: {
    full: 'Power-On Reset',
    group: 'design',
    note: 'The reset that holds the part until its supplies are valid at start-up, so it begins from a known state.',
  },
  'PVT (build)': {
    full: 'Production Validation Test (build)',
    group: 'program',
    note: 'The build of a board or kit on the production line, with the production BOM and test fixture, that proves the line can make it. Not Process-Voltage-Temperature.',
  },
  QFN: {
    full: 'Quad Flat No-lead package',
    group: 'pkg',
    note: 'A low-cost leadframe package with pads underneath its edges. The default for a small, low-power part whose pin count it can carry.',
  },
  RTC: {
    full: 'Real-Time Clock',
    group: 'design',
    note: 'A low-power timer running from a slow oscillator in the always-on domain, keeping time and waking the part while everything else is off.',
  },
  RTOS: {
    full: 'Real-Time Operating System',
    group: 'tool',
    note: 'A small operating system with deterministic scheduling — Zephyr and FreeRTOS are the ones embedded customers expect a new part to support.',
  },
  SDK: {
    full: 'Software Development Kit',
    group: 'tool',
    note: 'The drivers, libraries, examples, build tools and documentation a customer programs the part with.',
  },
  SoC: {
    full: 'System on Chip',
    group: 'design',
    note: 'A chip integrating a processor with its memories, peripherals and interfaces.',
  },
  UKCA: {
    full: 'UK Conformity Assessed marking',
    group: 'qual',
    note: 'The UK counterpart of CE marking for products sold in Great Britain.',
  },
  WLCSP: {
    full: 'Wafer-Level Chip-Scale Package',
    group: 'pkg',
    note: 'A package made on the wafer itself — solder balls on the die — for the smallest footprint. Handling and board reliability are the trade.',
  },
  XIP: {
    full: 'Execute In Place',
    group: 'design',
    note: 'Running code directly from non-volatile memory rather than copying it into RAM first. On eMRAM, a question of read latency, wait states and energy.',
  },
};
