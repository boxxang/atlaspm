import type { WriteUpEdit } from './types';

/** BU: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const BU_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'BU-02': {
    consumes: [
      'Mounted units from BU-01',
      'Power subsystem, protection and current measurement from EVB-03',
      'Power-on reset, brown-out and operating mode specification from PMU-01 and PMU-03',
      'Expected current per mode from PMU-06',
      'Lab instrumentation from EVB-08',
    ],
    risks: [
      '<b>Power applied without current limits.</b> A short then destroys the unit instead of revealing itself.',
      '<b>Sequencing not verified against the specification.</b> A wrong power-up order or brown-out threshold damages or confuses the part, and the fault is the platform’s, not the silicon’s.',
      '<b>Currents not profiled in every mode.</b> The first real active and sleep current data is available at exactly this moment, and a part that powers up but will not reach its sleep floor has already told the program something important.',
      '<b>Multiple units powered before the first is understood.</b> A systematic fault then takes several units instead of one.',
      '<b>Anomalies pushed past to reach the next milestone.</b> Something unexplained at power-on rarely stays harmless.',
    ],
    entry: [
      'Units mounted from BU-01',
      'Power subsystem validated in EVB-03',
      'Expected current per mode from PMU-06',
    ],
    exit: [
      'Current limits in place before first application',
      'Active and sleep currents profiled against expectation in every mode',
      'No unexplained anomaly carried into the next milestone',
    ],
    measuredBy: [
      'Units surviving first power-on',
      'Active and sleep current against the per-mode energy budget',
      'Anomalies resolved before proceeding',
    ],
  },
  'BU-03': {
    purpose: [
      'Validate <b>reset, clocking and PLL lock</b>—the oscillators, the PLL and the reset domains everything else depends on, and the layer where a fault masquerades as a fault somewhere else.',
      'A PLL that locks unreliably, an oscillator that starts slowly or a reset domain released in the wrong order produces symptoms all over the chip: boot failures, peripheral timing errors, wake-ups that hang, sporadic functional errors. Clearing this layer first means the failures found later are real.',
    ],
    flowNote:
      'Step 5’s jitter and stability measurement is easy to skip because the part appears to work without it. It matters because the oscillators set wake-up time and the real-time clock’s accuracy, and an oscillator that drifts or starts slowly explains a class of sleep and wake failures that would otherwise be chased in the power manager.',
    consumes: [
      'Powered units from BU-02',
      'PLL and oscillator specifications from PMU-02',
      'Clock and operating mode architecture from ARCH-06',
      'Reset and power intent from RTL-06',
      'Clock instrumentation from EVB-08',
    ],
    risks: [
      '<b>PLL lock validated only at nominal.</b> The lock range matters because shmoo and characterization will operate outside nominal.',
      '<b>Reset domain release order not verified.</b> The resulting failures appear anywhere on the chip and are attributed to the wrong block.',
      '<b>Oscillator start-up and stability unmeasured.</b> Wake-up time and RTC accuracy depend on them, and the problem is then debugged inside the power manager.',
      '<b>Clock tree assumed correct because the part boots.</b> A misconfigured divider is compatible with booting and incompatible with performance.',
      '<b>Clock quality measured through the board without accounting for it.</b> The board contributes jitter and its contribution has to be separated.',
    ],
    roles: [
      { r: 'Bring-up engineer', d: 'Owns clocking and reset validation' },
      { r: 'AMS engineer', d: 'PLL, oscillator and lock behavior' },
      { r: 'Design engineer', d: 'Clock tree and reset architecture' },
      { r: 'Characterization engineer', d: 'Jitter and oscillator measurement' },
      { r: 'Validation engineer', d: 'Instrumentation and data capture' },
    ],
    effortLabels: [
      'PLL lock validation',
      'Clock tree verification',
      'Reset sequence verification',
      'Jitter and oscillator stability',
      'Reference validation',
    ],
    entry: [
      'Units powered and healthy from BU-02',
      'PLL and oscillator specification from PMU-02',
      'Clock instrumentation available from EVB-08',
    ],
    exit: [
      'PLL lock verified across the full operating range',
      'Reset domain release order confirmed against the architecture',
      'Jitter and oscillator start-up measured with the board’s contribution separated',
    ],
    measuredBy: [
      'PLL lock range achieved against specification',
      'Oscillator start-up time and stability against specification',
      'Reset-related failures found later',
    ],
    terms: ['PLL', 'AMS', 'RTC'],
  },
  'BU-04': {
    purpose: [
      '<b>Boot the part</b>—ROM, firmware load, register access, first functional response—and confirm that the design does what it was written to do.',
      'First boot is the milestone that turns a powered die into a working processor. It is also the point at which the design, the boot ROM, the first compiled program on the fabric, the board and the host tools are all exercised together for the first time, which is why it is the milestone most likely to expose an integration assumption nobody wrote down.',
    ],
    consumes: [
      'Clocking-validated units from BU-03',
      'Host enablement from EVB-09',
      'Boot ROM and firmware from SDK-01',
      'Register map from RTL-04',
      'Debug access from EVB-04',
    ],
    entry: [
      'Clocking and reset validated in BU-03',
      'Host enablement validated in EVB-09',
      'Boot ROM and firmware available from SDK-01',
    ],
  },
  'BU-05': {
    flowNote:
      'Step 3 is the highest-leverage step in the activity. An anomaly reproduced in simulation can be examined with full visibility and unlimited retries, which is an environment no amount of silicon debug can match. On this product the compiler is a third suspect beside the design and the board: a statically scheduled program that misbehaves may be a compiler bug, and the cycle-level simulator from CMP-03 is how the two are separated.',
    consumes: [
      'Anomalies from every bring-up activity',
      'DFT and trace access from DFT-04 and EVB-04',
      'Simulation and emulation environments from FPV-03 and DV-12',
      'Design database and RTL from RTL-02',
      'FA laboratory capability',
    ],
  },
  'BU-08': {
    purpose: [
      '<b>Shmoo the part</b> across voltage, frequency and temperature—the measurement that establishes how much margin the design actually has, and what it draws while it has it.',
      'Every operating condition the product will be specified at comes out of this. The shmoo shows where the part stops working, and the distance between that boundary and the nominal operating point is the margin the datasheet, the guard bands and the qualification plan all depend on. On this part the shmoo carries a second surface as well—active and sleep current across the same sweep—because the lowest voltage the part runs at is also where its energy per task is lowest.',
    ],
    consumes: [
      'Booted units from BU-04',
      'Sweep automation from EVB-08',
      'Temperature forcing from the lab setup in EVB-08',
      'Rail sweep and current measurement from EVB-03',
      'Characterization content from TEST-09',
    ],
    risks: [
      '<b>Shmoo on a single unit.</b> The result describes that unit and is used as if it described the population.',
      '<b>Room temperature only.</b> The hot and cold corners are where the margin is smallest, where sleep current is highest, and where qualification will operate.',
      '<b>Manual sweeps.</b> The corner count then gets reduced to fit the available engineer time, silently.',
      '<b>Temperature not settled inside the sweep.</b> Sleep current rises steeply with temperature, and a hot-corner reading taken before the die has settled maps the forcing system rather than the silicon.',
      '<b>Margin measured but not fed into guard bands.</b> The data exists and production test still uses convention.',
    ],
    roles: [
      { r: 'Characterization engineer', d: 'Owns the shmoo campaign' },
      { r: 'Validation engineer', d: 'Automation and data capture' },
      { r: 'Product engineering', d: 'Margin interpretation and guard bands' },
      { r: 'Thermal engineer', d: 'Temperature forcing and settling checks' },
      { r: 'Design engineer', d: 'Failure mode interpretation at the boundaries' },
    ],
    effortLabels: [
      'Temperature-extended shmoo',
      'Voltage-frequency shmoo',
      'Margin extraction',
      'Active and sleep current measurement',
      'Unit-to-unit variation',
      'Automation setup',
    ],
    entry: [
      'Units functional from BU-04',
      'Sweep automation working from EVB-08',
      'Temperature forcing available on the bench',
    ],
    exit: [
      'Shmoo across a fleet, not a single unit',
      'Temperature corners included, not only room',
      'No reading taken before the temperature has settled',
    ],
    measuredBy: [
      'Margin at the worst corner',
      'Sleep current at the hot corner against specification',
      'Units in the shmoo sample',
      'Corners measured against planned',
    ],
  },
  'BU-10': {
    purpose: [
      'Measure <b>real performance and energy per task against the architecture model</b>—the check on whether the product does what it was sold as doing.',
      'The whole program was justified by an energy projection: energy per task, and battery life at a stated duty cycle. This is where that projection meets a physical part running real workloads built by the real compiler, and any gap has to be attributed: to the model, to the design, to the compiler’s placement and schedule, or to the software driving it.',
    ],
    consumes: [
      'Functional units from BU-04',
      'Cycle and energy model from FCD-05',
      'Workload suite and energy baselines from FCD-01',
      'Active and sleep current measurement from BU-08',
      'Compiler build from CMP-07',
      'Lab instrumentation from EVB-08',
    ],
    risks: [
      '<b>Performance measured on unrepresentative workloads.</b> A benchmark that is not what customers run produces a number that does not predict their experience.',
      '<b>Gap reported without attribution.</b> Nobody can act on it, and the next program repeats the modeling error.',
      '<b>Compiler or software limiting the measurement.</b> An immature schedule or placement understates the silicon, and the difference has to be established rather than assumed.',
      '<b>Energy measured without the duty cycle.</b> Energy per task and sleep current together set battery life, and an active-power figure alone misleads.',
      '<b>Measured at a single operating point.</b> Real deployment spans voltages, modes and temperatures, and energy at nominal is not the whole picture.',
    ],
    roles: [
      { r: 'Performance engineer', d: 'Owns measurement and attribution' },
      { r: 'Architect', d: 'Model comparison and gap interpretation' },
      { r: 'Validation software engineer', d: 'Workload execution and compiler effects' },
      { r: 'Design engineer', d: 'Bottleneck root cause' },
      { r: 'Product marketing', d: 'Workload representativeness' },
    ],
    effortLabels: [
      'Performance measurement',
      'Model comparison',
      'Gap analysis',
      'Bottleneck profiling',
      'Energy per task measurement',
      'Benchmark setup',
    ],
    entry: [
      'Units booted and eMRAM smoke-tested in BU-04',
      'Cycle and energy model available from FCD-05',
      'Workload suite defined in FCD-01',
    ],
    exit: [
      'Every material gap attributed to a cause',
      'Energy per task measured alongside cycles',
      'The compiler’s and software’s contribution to the measurement established',
    ],
    measuredBy: [
      'Cycles per workload against the model',
      'Energy per task against the target',
      'Gaps attributed against gaps found',
    ],
    terms: ['eMRAM'],
  },
  'BU-11': {
    flowNote:
      'Step 2 is bounded by physics rather than by will. A metal fix can only change routing layers, and whether the required change fits inside them is a question with a factual answer that has to be established before the decision is framed. On this process the eMRAM module sits between metal layers, so a metal fix whose layers touch it reopens the eMRAM qualification.',
    consumes: [
      'Errata list and severity from BU-09',
      'Root causes from BU-05',
      'Margin and current data from BU-08',
      'Performance and energy gaps from BU-10',
      'Mask and fab cost from TECH-06',
    ],
    terms: ['eMRAM'],
  },
  'BU-12': {
    purpose: [
      'Get <b>samples to customers</b> with everything they need to use them—screened units, documentation, errata, and a channel to report back.',
      'Customer samples start the evaluation cycle that decides design wins, and they start it months before mass production. What ships with the unit—and, for an embedded part, the EVK, the SDK and the compiler it is used with—determines whether the customer’s first week is productive or spent rediscovering issues the program already knows about.',
    ],
    consumes: [
      'Allocated sample units from EASSY-05',
      'Errata list from BU-09',
      'Decision record from BU-11',
      'Preliminary datasheet from MP-11',
      'EVT boards from EVK-05 and the SDK beta from SDK-06',
      'Early-access customer commitments from EAP-05',
    ],
    terms: ['EVK', 'SDK'],
  },
};
