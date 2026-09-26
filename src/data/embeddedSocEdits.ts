/**
 * /data/embeddedSocEdits.ts — where the embedded flow says something different
 * from the SoC flow it is derived from.
 *
 * The SoC template is a leading-node AI accelerator on a 2.5D package: LLM
 * workloads and tokens per second, HBM and PCIe, an interposer and a bump
 * field, voltage regulator modules and a cooling solution. An embedded
 * processor on a mature node with embedded MRAM does the same work in the same
 * order, but it is sized in energy per task and sleep current, it has a pad
 * ring and a QFN rather than bumps and a substrate, and it has eMRAM to trim,
 * qualify and prove through reflow. So the derived stages keep the SoC
 * activities and rewrite the steps that name the wrong product.
 *
 * Keyed by the SoC reference and step number, so each edit names exactly the
 * step it replaces; a test holds every key to a step the SoC flow still has.
 * `t` is the step, `o` what it hands over. References in the text are written
 * as SoC references (DEF-03) and move onto the embedded ones (EDEF-03) with
 * everything else.
 */
import type { JourneyStage } from './types';

export interface StepEdit {
  t?: string;
  o?: string;
}

export interface ActivityEdit {
  title?: string;
  steps?: Record<number, StepEdit>;
}

export interface StageEdit {
  /** Activity edits, by SoC reference. */
  activities?: Record<string, ActivityEdit>;
  /** Deliverable titles, by the SoC deliverable's 1-based position. */
  deliverables?: Record<number, string>;
  /** Stage text the embedded flow words differently. */
  stage?: Partial<
    Pick<
      JourneyStage,
      'tagline' | 'description' | 'activities' | 'risks' | 'potentialRisks' | 'collaboration' | 'tools' | 'programView'
    >
  >;
}

export const EMBEDDED_EDITS: Record<string, StageEdit> = {
  /* ---------------------------------------------------------------- DEF */
  productDefinition: {
    stage: {
      description:
        'Fix what the product must achieve — the workloads it is sold on, the energy per task and the battery life, the unit cost, and the compiler, SDK and EVK it ships with — and the technical, cost and schedule boundaries the program will be held to. Nothing downstream is negotiable if this is vague.',
      activities: ['Market requirements analysis', 'Energy and KPI targets', 'Cost target modeling', 'Feasibility study'],
      risks: ['Specification instability', 'Energy targets without duty cycles', 'eMRAM node availability'],
      potentialRisks: [
        'Requirements not signed off by all stakeholders',
        'Battery-life claims made without a stated duty cycle',
        'Candidate nodes whose embedded MRAM is not yet qualified',
        'Competitive window shifts during definition',
        'Compiler, SDK and EVK left out of the budget and staffing plan',
        'Third-party IP licensing terms still open',
      ],
      collaboration: ['Product', 'Architecture', 'Software', 'Program Management', 'Foundry'],
    },
    deliverables: {
      2: 'Target specification — energy, performance, area and KPI table',
    },
    activities: {
      'DEF-02': {
        steps: {
          1: {
            t: 'Identify the incumbent MCUs, DSPs and edge NPUs and their expected launch timing',
            o: 'Competitor list — MCUs, DSPs and edge NPUs — with expected launch timing',
          },
          3: {
            t: 'Normalize the benchmarks to energy per task at a stated voltage, clock and duty cycle',
            o: 'Comparable energy and performance data under stated conditions',
          },
        },
      },
      'DEF-03': {
        steps: {
          2: {
            t: 'Capture the embedded workloads — sensor fusion, DSP, keyword spotting, vision, control loops',
            o: 'Representative workloads for each use case',
          },
          3: {
            t: 'Run the workloads on incumbent MCUs and DSPs for a baseline',
            o: 'Baseline energy and latency measurements',
          },
          4: {
            t: 'Define the KPIs — energy per inference, latency, active and sleep current, battery life',
            o: 'KPI targets and measurement conditions for each workload',
          },
          5: {
            t: 'Define the precision and quantization policy — INT8, INT16, FP32',
            o: 'Precision and quantization policy',
          },
          7: {
            t: 'Package the workload suite and hand it to architecture and the compiler team',
            o: 'Models, sources and execution harness ready for architecture and compiler modeling',
          },
        },
      },
      'DEF-04': {
        title: 'Memory, Peripheral and Interface Requirements',
        steps: {
          1: {
            t: 'Determine code, data and model memory demand from the DEF-03 workloads',
            o: 'Memory demand by workload — code, data and model',
          },
          2: {
            t: 'Size the on-die eMRAM and SRAM — capacity, banks and retention',
            o: 'On-die eMRAM and SRAM capacity and organization',
          },
          3: {
            t: 'Define the peripheral set — GPIO count, UART, SPI, I2C, I2S, ADC, timers',
            o: 'Peripheral and GPIO requirements',
          },
          4: {
            t: 'Define the debug, programming and boot interfaces — JTAG, USB, serial boot',
            o: 'Debug, programming and boot interface requirements',
          },
          5: {
            t: 'Translate the interface requirements into a pin and package budget',
            o: 'Pin and package budget',
          },
          6: {
            t: 'Review the requirements with the architecture, package and EVK teams',
            o: 'Approved memory, peripheral and pin requirements',
          },
        },
      },
      'DEF-05': {
        title: 'Energy, Performance and Area Target Definition',
        steps: {
          1: {
            t: 'Define the clock targets from the KPIs for each operating mode',
            o: 'Clock targets by operating mode',
          },
          2: {
            t: 'Break down the energy budget — active, sleep and deep sleep, by domain, against the battery',
            o: 'Energy and current budget by mode and domain',
          },
          4: {
            t: 'Define the operating voltage range, the retention voltage and the Vt strategy for leakage',
            o: 'Operating and retention voltage, and Vt strategy',
          },
        },
      },
      'DEF-06': {
        steps: {
          4: {
            t: 'Estimate the package cost for each option — QFN, FC-CSP or WLCSP',
            o: 'Package cost by option',
          },
          5: {
            t: 'Estimate wafer sort and final test, including eMRAM trim time',
            o: 'Test cost with its test-time and trim-time assumptions',
          },
        },
      },
      'DEF-07': {
        steps: {
          1: {
            t: 'Confirm the candidate process nodes with embedded MRAM with the technology team',
            o: 'Candidate node shortlist with eMRAM availability',
          },
          2: {
            t: 'Evaluate feasibility for each node — density, active energy and leakage',
            o: 'Energy, performance and leakage feasibility by node',
          },
          3: {
            t: 'Assess IP availability for each node — eMRAM, power management, oscillators, peripherals',
            o: 'IP readiness assessment by node',
          },
          5: {
            t: 'Evaluate package feasibility and sleep current at maximum temperature',
            o: 'Package and sleep-current feasibility by node',
          },
        },
      },
      'DEF-08': {
        steps: {
          5: {
            t: 'Add external lead times — eMRAM macro, IP, masks, leadframe and EVK parts',
            o: 'External lead times and required order dates',
          },
        },
      },
      'DEF-09': {
        steps: {
          1: {
            t: 'Build the financial model — NRE, the compiler, SDK and EVK cost, revenue and breakeven',
            o: 'Financial model and expected product economics',
          },
        },
      },
    },
  },

  /* --------------------------------------------------------------- ARCH */
  architecture: {
    stage: {
      description:
        'Turn requirements into a system architecture and make the decisions — the scalar subsystem around the fabric, the memory map, the peripherals, the operating modes, security — that every downstream team inherits. The fabric itself and its contract with the compiler are decided alongside, in FCD.',
      potentialRisks: [
        'Architecture not validated against key workloads',
        'eMRAM read bandwidth or wake latency short of what the workloads need',
        'Peripheral set chosen without the EVK and applications teams',
        'PPA budget allocation not agreed across blocks',
        'Feature creep channels left open after freeze',
        'Security architecture decided too late to implement',
      ],
    },
    deliverables: {
      4: 'Chip-level block diagram with pin and pad budget',
    },
    activities: {
      'ARCH-01': {
        steps: {
          2: {
            t: 'Build the baseline system model — scalar core, fabric, memories and system bus',
            o: 'Baseline system performance model',
          },
          4: {
            t: 'Correlate the model with the FCD-05 fabric model and incumbent MCU measurements',
            o: 'Model correlation results and error range',
          },
          5: {
            t: 'Explore architecture options — tile count, SRAM and eMRAM capacity, bus width',
            o: 'Performance impact across architecture options',
          },
          6: {
            t: 'Evaluate the system bus and interconnect options',
            o: 'Interconnect performance comparison',
          },
          7: {
            t: 'Integrate power estimates and evaluate energy per task in each mode',
            o: 'Energy per task and sleep power projections',
          },
        },
      },
      'ARCH-02': {
        steps: {
          2: {
            t: 'Check the die size against the pad-limited floor and the cost target',
            o: 'Die size and pad-limit assessment',
          },
          3: {
            t: 'Develop the partitioning options — fabric, scalar subsystem, always-on domain, peripherals',
            o: 'Candidate partitioning options',
          },
          5: {
            t: 'Evaluate what crosses into the always-on domain and what it costs in leakage',
            o: 'Always-on boundary requirements',
          },
          7: {
            t: 'Evaluate the test implications of each partition — eMRAM, analog, fabric',
            o: 'Test impact assessment',
          },
        },
      },
      'ARCH-03': {
        title: 'Peripheral and Interface Selection',
        steps: {
          3: {
            t: 'Select the serial peripherals — UART, SPI, I2C, I2S — and their counts',
            o: 'Serial peripheral selection',
          },
          4: {
            t: 'Select the analog peripherals — ADC, comparators, temperature sensor',
            o: 'Analog peripheral selection',
          },
          5: {
            t: 'Select the debug and programming interfaces — JTAG and USB',
            o: 'Debug and programming interface selection',
          },
        },
      },
      'ARCH-04': {
        steps: {
          1: {
            t: 'Define how data moves for each workload class between the fabric, SRAM and eMRAM',
            o: 'Dataflow definition by workload class',
          },
          4: {
            t: 'Define the eMRAM read path, wait states and execute-in-place policy',
            o: 'eMRAM read path and execute-in-place policy',
          },
          6: {
            t: 'Define the DMA and data-movement requirements for sensors and peripherals',
            o: 'DMA and data-movement requirements',
          },
        },
      },
      'ARCH-06': {
        title: 'Power, Clock, and Operating Mode Architecture',
        steps: {
          2: {
            t: 'Define the voltage rails and the on-chip regulators from a 1.8–5.5 V input',
            o: 'Voltage rail and regulator architecture',
          },
          3: {
            t: 'Define the operating modes and the transitions between them — performance, efficiency, sleep, deep sleep',
            o: 'Operating modes and transition policy',
          },
        },
      },
      'ARCH-08': {
        title: 'Chip-Level Floorplan and Pad Ring Planning',
        steps: {
          2: { t: 'Plan the pad ring and the I/O placement', o: 'Pad ring and I/O placement plan' },
          3: { t: 'Define the pad count, pitch and power-to-signal ratio', o: 'Pad ring definition' },
          4: { t: 'Allocate the signal pads per peripheral and GPIO', o: 'Signal and power pad allocation' },
          5: { t: 'Define the supply pad budget against the regulator topology', o: 'Supply pad budget' },
          7: { t: 'Publish the block diagram and the pad budget', o: 'Published block diagram and pad budget' },
        },
      },
      'ARCH-10': {
        steps: {
          4: {
            t: 'Define the block interfaces and protocols against the system bus',
            o: 'Block interface and protocol definitions',
          },
        },
      },
    },
  },

  /* --------------------------------------------------------------- TECH */
  technology: {
    stage: {
      description:
        'Choose the foundry, the node and the process flavour — a mature node with embedded MRAM and low-leakage devices — and convert that choice into signed commercial and capacity commitments. Everything in IP, PDK and library land is downstream of this decision.',
    },
    activities: {
      'TECH-01': {
        steps: {
          4: {
            t: 'Compare PPA, leakage, eMRAM availability, cost, capacity and ecosystem readiness',
            o: 'Comparable foundry and node assessment',
          },
        },
      },
      'TECH-05': {
        steps: {
          4: {
            t: 'Assess the embedded MRAM option, ultra-low-leakage devices and 5 V-tolerant I/O',
            o: 'eMRAM, low-leakage and high-voltage I/O feasibility',
          },
        },
      },
      'TECH-06': {
        steps: {
          2: {
            t: 'Collect wafer, mask, NRE, MPW, eMRAM adder and volume pricing',
            o: 'Foundry cost inputs',
          },
        },
      },
      'TECH-09': {
        steps: {
          3: {
            t: 'Assess assembly capability for QFN, FC-CSP and WLCSP, and test capability',
            o: 'Supplier capability assessment',
          },
        },
      },
    },
  },

  /* ---------------------------------------------------------------- PDK */
  pdk: {
    stage: {
      description:
        'Get the design kit, the libraries, the tools and the signoff conditions to a state the program can build on. A production PDK on a mature node, but one with embedded MRAM and low-leakage libraries whose views and corners still have to be qualified together.',
      potentialRisks: [
        'eMRAM macro views on a PDK version other than the design’s',
        'Low-leakage and retention corners missing from the signoff set',
        'Memory compiler instances never checked against block budgets',
        'Signoff corners not agreed with the foundry',
        'Tool versions drifting between teams',
        'Compute and license capacity assumed rather than booked',
      ],
    },
    deliverables: {
      4: 'Memory PPA gap analysis against block budgets',
    },
    activities: {
      'PDK-06': {
        steps: {
          1: {
            t: 'Map interface and voltage requirements, including 5 V-tolerant GPIO, to available I/O cells',
            o: 'I/O requirement-to-library mapping',
          },
          3: {
            t: 'Check package, pad ring, placement and power-domain compatibility',
            o: 'I/O physical integration assessment',
          },
        },
      },
      'PDK-09': {
        steps: {
          5: { o: 'Instances that miss their budget, with escalation' },
          6: {
            t: 'Review results with the architecture, PDK and eMRAM teams',
            o: 'Memory PPA disposition',
          },
        },
      },
      'PDK-12': {
        steps: {
          1: {
            t: 'Collect the operating conditions — including the retention voltage and hot leakage — and foundry signoff guidance',
            o: 'Signoff condition requirements',
          },
        },
      },
    },
  },

  /* ---------------------------------------------------------------- RTL */
  rtl: {
    stage: {
      description:
        'Implement the architecture in synthesisable logic, integrate the IP, eMRAM and power-management macros the program delivers, and hold the design under change control until freeze.',
    },
    activities: {
      'RTL-01': {
        steps: {
          4: {
            t: 'Detail block interfaces and protocols against the system bus',
            o: 'Interface and protocol detail per block',
          },
        },
      },
      'RTL-07': {
        steps: {
          6: {
            t: 'Integrate the PMU, oscillator and eMRAM macros with their behavioural models',
            o: 'Integrated analog and eMRAM macros with behavioural models',
          },
        },
      },
      'RTL-10': {
        steps: {
          2: { t: 'Integrate the system bus and the fabric interface', o: 'Integrated system bus and fabric interface' },
          6: { t: 'Integrate the boot ROM and the boot paths', o: 'Integrated boot ROM and boot paths' },
        },
      },
    },
  },

  /* ----------------------------------------------------------------- DV */
  verification: {
    stage: {
      activities: ['UVM testbench', 'Regression & coverage', 'Formal', 'Low-power'],
      potentialRisks: [
        'Verification plan has coverage holes vs spec',
        'Testbench bring-up slower than planned',
        'Regression compute capacity shortfall',
        'Coverage closure criteria not agreed',
        'Late RTL churn invalidating test content',
        'Sleep modes and wake paths verified at RTL but never with the analog models',
      ],
      tools: ['UVM', 'Simulation', 'Formal', 'Coverage analysis'],
    },
    activities: {
      'DV-01': {
        steps: {
          2: {
            t: 'Assign a verification strategy per feature — simulation, formal, emulation or the FPGA prototype',
            o: 'Verification strategy per feature',
          },
        },
      },
      'DV-08': {
        steps: {
          5: {
            t: 'Test every sleep mode entry, retention and wake source',
            o: 'Power mode transition results',
          },
          7: {
            t: 'Run compiler-generated workloads from the DEF-03 suite',
            o: 'Compiled workload scenarios in the testbench',
          },
        },
      },
      'DV-09': {
        steps: {
          4: {
            t: 'Verify the trim and calibration sequences — oscillators, regulators, eMRAM reference',
            o: 'Trim and calibration sequence results',
          },
        },
      },
      'DV-11': {
        title: 'Performance and Energy Validation Against the Architecture Model',
        steps: {
          2: {
            t: 'Execute the workloads in simulation and on the FPGA prototype',
            o: 'Workload execution results',
          },
          3: {
            t: 'Measure cycles, fabric utilization and memory accesses against the model',
            o: 'Cycle, utilization and access measurements',
          },
          6: {
            t: 'Correlate the results against the ARCH-01 and FCD-05 models',
            o: 'Model correlation results',
          },
        },
      },
    },
  },

  /* ---------------------------------------------------------------- DFT */
  dft: {
    activities: {
      'DFT-05': {
        steps: {
          3: {
            t: 'Select the test algorithms per memory type — SRAM and eMRAM',
            o: 'Algorithm selection per memory type',
          },
        },
      },
    },
  },

  /* ----------------------------------------------------------------- PD */
  physicalDesign: {
    stage: {
      potentialRisks: [
        'Flow setup starting without an N0 netlist',
        'Floorplan not converged before placement starts',
        'Power delivery network margin unproven',
        'Late ECO storm consuming closure schedule',
        'Tool license / compute capacity bottlenecks',
        'Pad ring or pin-out changing after the floorplan freeze',
      ],
      programView: [
        'Design Freeze trajectory',
        'Turn-by-turn QoR tracking',
        'ECO budget & change control',
        'Signoff readiness reviews',
        'Pad ring and pin-out checkpoints',
      ],
    },
    activities: {
      'PD-02': {
        steps: {
          2: {
            t: 'Place the macros — eMRAM, SRAM, the power manager and oscillators',
            o: 'Macro placement',
          },
        },
      },
    },
  },

  /* ----------------------------------------------------------------- SO */
  signoff: {
    activities: {
      'SO-08': {
        steps: {
          5: {
            t: 'Reconcile power integrity and signoff leakage against the sleep-current budget',
            o: 'Power integrity and leakage signoff reconciliation',
          },
        },
      },
    },
  },

  /* ---------------------------------------------------------------- EVB */
  validationHardware: {
    stage: {
      potentialRisks: [
        'Boards not ready when silicon arrives',
        'Rev A respin not budgeted in the schedule',
        'Debug access (JTAG / trace) designed out for cost',
        'Lab equipment and staffing not reserved',
        'Current measurement unable to resolve sleep currents',
      ],
      collaboration: ['Validation', 'Board design', 'Software', 'Firmware', 'Design'],
      tools: ['Schematic capture', 'PCB layout', 'Power integrity simulation', 'Lab instrumentation'],
    },
    activities: {
      'EVB-02': {
        steps: {
          2: {
            t: 'Design the power tree — battery, USB and bench inputs — and the rail switching',
            o: 'Power tree and rail switching schematic',
          },
          4: {
            t: 'Design the USB, programmer and peripheral connector schematic',
            o: 'USB, programmer and peripheral connectors',
          },
        },
      },
      'EVB-03': {
        title: 'Power Supplies, Current Measurement, and Bring-Up',
        steps: {
          1: { t: 'Derive the supply requirement across the 1.8–5.5 V input range', o: 'Supply requirement' },
          2: { t: 'Select and design the supplies and rail switching', o: 'Supply design' },
          3: {
            t: 'Design current measurement from sleep microamps to active milliamps',
            o: 'Current measurement design',
          },
        },
      },
      'EVB-04': {
        steps: {
          4: { t: 'Design the socket probe access and test points', o: 'Probe access and test point design' },
        },
      },
      'EVB-05': {
        title: 'PCB Layout with Low-Noise Measurement and PI Simulation',
        steps: {
          3: { t: 'Simulate supply noise on the analog and eMRAM rails', o: 'Supply noise results on sensitive rails' },
          4: { t: 'Route the clock, USB and measurement paths', o: 'Routed clock, USB and measurement paths' },
          7: { t: 'Apply the mechanical and socket layout constraints', o: 'Mechanical constraint compliance' },
        },
      },
      'EVB-09': {
        title: 'Minimum Firmware and Host Tools for Power-On',
        steps: {
          3: {
            t: 'Build the USB programmer and serial console host tools',
            o: 'Programmer and console host tools',
          },
        },
      },
      'EVB-10': {
        steps: {
          5: { t: 'Check the socket fit and actuation', o: 'Socket fit check' },
          6: { t: 'Validate the GPIO, serial and USB loopbacks', o: 'Interface loopback validation results' },
        },
      },
    },
  },

  /* --------------------------------------------------------------- TEST */
  testDevelopment: {
    activities: {
      'TEST-04': {
        steps: {
          1: {
            t: 'Extract the probe card requirement and pad map',
            o: 'Probe card requirement and pad map',
          },
        },
      },
      'TEST-06': {
        steps: {
          6: {
            t: 'Develop the functional, memory BIST and eMRAM trim content',
            o: 'Functional, BIST and eMRAM trim content',
          },
        },
      },
      'TEST-07': {
        steps: {
          3: { t: 'Develop the active and sleep current test content', o: 'Active and sleep current test content' },
          6: {
            t: 'Develop the interface, eMRAM and analog test content',
            o: 'Interface, eMRAM and analog test content',
          },
        },
      },
    },
  },

  /* ----------------------------------------------------------------- BU */
  bringup: {
    stage: {
      description:
        'Find out what the silicon actually does. Power on, prove every sleep mode and wake source, characterise the margins and the currents, debug what does not match, and decide whether the program respins.',
      activities: ['Lab bring-up', 'Power modes', 'Characterization', 'Respin decision'],
    },
    deliverables: {
      4: 'Characterisation data set — V/F/T shmoo with active and sleep current',
    },
    activities: {
      'BU-02': {
        steps: {
          4: {
            t: 'Profile the rail currents in every operating and sleep mode',
            o: 'Current profile by operating and sleep mode',
          },
        },
      },
      'BU-04': {
        steps: {
          6: {
            t: 'Run the functional smoke tests, including eMRAM read, write and retention',
            o: 'Functional and eMRAM smoke test results',
          },
        },
      },
      'BU-08': {
        steps: {
          3: {
            t: 'Measure active and sleep current across the sweep',
            o: 'Active and sleep current across the sweep',
          },
        },
      },
      'BU-10': {
        steps: {
          3: { t: 'Measure energy per workload on the bring-up board', o: 'Energy per workload measurements' },
        },
      },
    },
  },

  /* ---------------------------------------------------------------- FAB */
  fabrication: {
    stage: {
      description:
        'Masks are cut and wafers are processed. The program has almost no levers here — only hot-lot priority, WIP visibility and an honest wafer-out forecast. On a mature node the mask set takes weeks rather than months; the time goes to the hot-lot cycle and to the embedded MRAM module steps, which add their own layers and their own excursions.',
    },
  },

  /* ----------------------------------------------------------------- MP */
  qualification: {
    stage: {
      description:
        'Prove reliability to standard — including the embedded MRAM’s retention, endurance and survival through reflow — drive yield to the cost model, release the production test program, and commit to a ramp the supply chain can actually hold.',
    },
    activities: {
      'MP-03': {
        steps: {
          6: {
            t: 'Execute temperature cycle, HTS and the eMRAM data-retention bake',
            o: 'Temperature cycle, HTS and eMRAM retention results',
          },
          7: {
            t: 'Run eMRAM write-endurance cycling and analyze the stress failures',
            o: 'eMRAM endurance results and stress failure analyses',
          },
        },
      },
      'MP-06': {
        steps: {
          1: {
            t: 'Run MSL preconditioning and check that pre-programmed eMRAM data survives reflow',
            o: 'MSL classification and eMRAM reflow survival',
          },
        },
      },
      'MP-08': {
        steps: {
          2: {
            t: 'Commit the wafer, leadframe or substrate, and EVK component supply',
            o: 'Wafer, package material and EVK component supply commitments',
          },
        },
      },
      'MP-09': {
        title: 'Compliance and Certification (Magnetic Immunity, RoHS/REACH, Safety)',
        steps: {
          2: {
            t: 'Characterize magnetic immunity against the published eMRAM guidance',
            o: 'Magnetic immunity characterization results',
          },
        },
      },
    },
  },
};
