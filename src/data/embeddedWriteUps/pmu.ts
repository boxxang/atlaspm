import type { ActivityWriteUp } from '../activityDetailTypes';

export const PMU_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'PMU-01': {
    criticalPath: true,
    purpose: [
      'Define the <b>supplies the part runs from and the modes it runs in</b>: battery, USB or a 1.8–5.5 V rail in; performance, efficiency, low power, sleep and deep sleep out; and which power domains each mode keeps alive.',
      'Battery life on this part is decided mostly by what it draws while it is doing nothing. The mode table written here fixes the leakage and wake-latency targets every analog block, the always-on domain and the firmware are later held to, so it has to be written against the duty cycles customers run rather than against the peak workload.',
    ],
    flowNote:
      'Step 1 fixes the supply range and sources, and step 2 defines the modes those sources have to support. Step 3 partitions the power domains by mode, and step 4 runs alongside it because each domain’s leakage and wake-latency target is set as the domain is drawn. Step 5 releases the specification.',
    consumes: [
      'Energy, performance and area targets from EDEF-05',
      'Supply, battery and interface requirements from EDEF-04',
      'Workload duty cycles and energy baselines from FCD-01',
      'Power, clock and operating mode architecture from EARCH-06',
      'Process flavour and its leakage from ETECH-05',
    ],
    rel: {
      'PMU-D1':
        '<b>Power architecture and operating mode specification.</b> The supply range, modes, domains and per-mode targets are defined and released here.',
      'PMU-D6':
        '<b>System energy budget per mode, verified.</b> The per-mode leakage and wake targets set here are the budget the verification is checked against.',
    },
    risks: [
      '<b>Modes defined around the peak workload.</b> A part that spends most of its life asleep is sold on its sleep current, and a mode table built for performance leaves that number unowned.',
      '<b>Deep-sleep leakage targeted only at room temperature.</b> Leakage roughly doubles every few tens of degrees, and the battery-life claim at the hot corner is where customers test it.',
      '<b>Coin-cell source impedance ignored.</b> A coin cell cannot deliver a large current step, and a mode entry that draws one browns the part out.',
      '<b>Domains partitioned without the always-on content.</b> Whatever has to stay awake in deep sleep sets its floor current, and it is decided in PMU-04 against this partition.',
      '<b>Wake latency set without the firmware.</b> A latency target that ignores clock start-up and state restore is met by the hardware and missed by the product.',
    ],
    roles: [
      { r: 'Power architect', d: 'Owns the supply range, modes and domain partition' },
      { r: 'Analog design lead', d: 'What the regulators and oscillators can deliver per mode' },
      { r: 'SoC architect', d: 'Always-on content and domain boundaries' },
      { r: 'Applications architect', d: 'Customer duty cycles the modes must serve' },
      { r: 'Firmware lead', d: 'Mode entry and exit sequences and wake latency' },
    ],
    effort: [
      ['Supply range and sources', 0.5],
      ['Operating mode definition', 0.75],
      ['Power domain partition', 0.75],
      ['Leakage and wake-latency targets', 0.5],
      ['Specification release', 0.5],
    ],
    entry: [
      'Energy and KPI targets set in EDEF-05',
      'Workload duty cycles available from FCD-01',
      'Process flavour chosen in ETECH-05',
    ],
    exit: [
      'Every mode defined with the domains it keeps on',
      'Leakage and wake-latency target set per mode and temperature',
      'Specification released to analog design, architecture and firmware',
    ],
    dependsOn: ['EDEF-05', 'EDEF-04', 'FCD-01', 'ETECH-05'],
    dependsNote: null,
    feedsInto: ['PMU-02', 'PMU-03', 'PMU-04', 'PMU-06', 'EARCH-06'],
    measuredBy: [
      'Modes with a leakage and wake-latency target at every temperature',
      'Battery-life estimate against the product target',
      'Changes to the mode table after release',
    ],
    links: {
      dependsOn: ['EDEF-04', 'EDEF-05', 'FCD-01', 'ETECH-05'],
      feedsInto: ['PMU-02', 'PMU-03', 'PMU-04', 'PMU-06'],
      runsWith: ['EARCH-06'],
      revisedBy: [],
      feedsBackInto: ['EARCH-06'],
    },
    terms: ['KPI', 'UPF', 'PVT'],
  },
  'PMU-02': {
    criticalPath: true,
    purpose: [
      'Design the <b>clock sources the part runs and wakes on</b>: the always-on low-frequency oscillator, the trimmed high-frequency RC oscillator, the crystal oscillator and PLL, and the rules for switching between them.',
      'Every mode draws on a different clock. Deep sleep keeps only the low-frequency oscillator running, wake has to start on the RC oscillator because a crystal takes milliseconds to settle, and performance mode needs the PLL. Accuracy, start-up time and current are traded differently for each, and the wake latency the product promises is set here.',
    ],
    flowNote:
      'Step 1 specifies the low-frequency oscillator, and step 2 the high-frequency RC oscillator and its trim. Step 3 integrates the crystal oscillator and PLL, and step 4 runs alongside it because the switching and fail-safe rules depend on which sources exist rather than on how they are built. Step 5 releases the design.',
    consumes: [
      'Operating modes and wake-latency targets from PMU-01',
      'Clock architecture from EARCH-06',
      'PLL and crystal oscillator IP selected in EIPR-04',
      'Peripheral and interface clock requirements from EARCH-03',
      'Timekeeping accuracy requirements from EDEF-04',
    ],
    rel: {
      'PMU-D3':
        '<b>Clock source design — oscillators and PLL.</b> The oscillators, PLL integration and switching rules are designed and released here.',
      'PMU-D5':
        '<b>Analog hard macros with views, released.</b> The oscillator designs released here are laid out and turned into macros in PMU-05.',
    },
    risks: [
      '<b>Wake latency set by crystal start-up.</b> A crystal oscillator can take milliseconds to settle, and a wake that waits for it misses every latency target.',
      '<b>RC oscillator trim not budgeted at sort.</b> An untrimmed RC oscillator can be off by tens of percent, too far for serial interfaces that need a baud rate within a few percent.',
      '<b>Low-frequency oscillator current underestimated.</b> It runs for the whole life of the part, so a few hundred nanoamps more is a visible share of the deep-sleep budget.',
      '<b>No fail-safe on crystal loss.</b> A missing or failed crystal leaves the part without a clock unless a detector switches it to the RC oscillator.',
      '<b>PLL lock time omitted from the mode transitions.</b> Performance mode entry then takes longer than the firmware assumes, and the transition model in PMU-06 is wrong.',
    ],
    roles: [
      { r: 'Analog design lead', d: 'Owns the oscillator and PLL design and release' },
      { r: 'Power architect', d: 'Current and start-up budget per mode' },
      { r: 'IP integration lead', d: 'Crystal oscillator and PLL IP deliverables' },
      { r: 'Test engineer', d: 'RC oscillator trim at sort and its test time' },
      { r: 'Firmware engineer', d: 'Clock switching sequence and fail-safe handling' },
    ],
    effort: [
      ['Low-frequency oscillator', 1],
      ['RC oscillator and trim', 2],
      ['Crystal oscillator and PLL integration', 2.5],
      ['Clock switching and fail-safe', 2],
      ['Design review and release', 0.5],
    ],
    entry: [
      'Mode table and wake-latency targets released from PMU-01',
      'Clock architecture defined in EARCH-06',
      'PLL and crystal oscillator IP selected',
    ],
    exit: [
      'Accuracy, start-up time and current specified per clock source',
      'Switching and fail-safe behaviour defined for every mode transition',
      'Clock source design released for layout',
    ],
    dependsOn: ['PMU-01', 'EARCH-06', 'EIPR-04'],
    dependsNote: null,
    feedsInto: ['PMU-05', 'PMU-06', 'ERTL-06', 'SDK-01', 'EDFT-06'],
    measuredBy: [
      'Wake-to-run latency on the RC oscillator against target',
      'RC oscillator accuracy after trim across temperature',
      'Low-frequency oscillator current against the deep-sleep budget',
    ],
    links: {
      dependsOn: ['PMU-01', 'EARCH-06', 'EIPR-04'],
      feedsInto: ['PMU-05', 'PMU-06', 'ERTL-06', 'SDK-01', 'EDFT-06'],
      runsWith: ['PMU-03'],
      revisedBy: ['EARCH-03'],
      feedsBackInto: [],
    },
    terms: ['PLL', 'VCO', 'RTC', 'AMS'],
  },
  'PMU-03': {
    criticalPath: true,
    purpose: [
      'Design the <b>regulators, power-on reset and brown-out detection</b> that turn a 1.8–5.5 V input into clean core and memory supplies, start the part reliably and stop it safely when the supply falls.',
      'A buck converter is efficient at full load and wasteful at the microamps a sleeping part draws, while an LDO costs its dropout at every load and is poor from a 5 V input. The choice per domain and per mode sets both active efficiency and sleep current, and the brown-out design decides whether a falling battery corrupts the eMRAM.',
    ],
    flowNote:
      'Step 1 chooses LDO or buck per domain against light-load efficiency, and step 2 designs the regulators and their compensation. Step 3 runs alongside step 2 because power-on reset and brown-out share references with the regulators and are designed against the same supply range. Step 4 simulates transients across 1.8–5.5 V, and step 5 reviews and releases.',
    consumes: [
      'Supply range, modes and domain partition from PMU-01',
      'Brown-out behaviour required during eMRAM writes from MRAM-02',
      'Per-domain current estimates from the energy model in FCD-05',
      'I/O and ESD library for the supply pins from EPDK-06',
      'Process devices and signoff corners from EPDK-11',
    ],
    rel: {
      'PMU-D2':
        '<b>Regulator, power-on reset and brown-out design.</b> The regulator topology, POR and brown-out detection are designed, simulated and released here.',
      'PMU-D5':
        '<b>Analog hard macros with views, released.</b> The regulator and reset schematics released here are laid out and turned into macros in PMU-05.',
    },
    risks: [
      '<b>Regulator efficiency optimised at full load.</b> The part lives at light load, and a buck without a pulse-skipping or LDO fallback wastes more in quiescent current than the fabric uses.',
      '<b>Brown-out during an eMRAM write left undefined.</b> The detector must trip early enough for a write in progress to finish or abort cleanly before the supply leaves the valid range.',
      '<b>POR glitches on a slow-rising supply.</b> A coin cell or a soft-start USB source ramps slowly, and a reset released twice leaves the always-on state inconsistent.',
      '<b>Transients simulated only at nominal input.</b> Load steps at 1.8 V and line steps at 5.5 V stress different loops, and the corner neither was checked at is where the part resets.',
      '<b>Quiescent current of the reference not counted.</b> The bandgap and brown-out comparator run in deep sleep, and their current sets a floor no other savings can get under.',
    ],
    roles: [
      { r: 'Analog design lead', d: 'Owns the regulator, POR and brown-out design' },
      { r: 'Power architect', d: 'Topology per domain against the mode table' },
      { r: 'Memory design lead', d: 'Hold-up needed to finish an eMRAM write' },
      { r: 'AMS verification engineer', d: 'Transient and start-up simulation coverage' },
      { r: 'Reliability signoff engineer', d: 'ESD and latch-up on the supply pins' },
    ],
    effort: [
      ['Topology choice per domain', 1.5],
      ['Regulator design and compensation', 3.5],
      ['POR and brown-out design', 2],
      ['Line and load transients across 1.8–5.5 V', 2],
      ['Design review and release', 1],
    ],
    entry: [
      'Supply range and mode table released from PMU-01',
      'Current estimates per domain available from FCD-05',
      'Brown-out write behaviour defined in MRAM-02',
    ],
    exit: [
      'Efficiency at light and full load shown per domain and mode',
      'POR and brown-out thresholds proven across supply ramps and corners',
      'Schematics reviewed and released for layout',
    ],
    dependsOn: ['PMU-01', 'MRAM-02', 'FCD-05', 'EPDK-06'],
    dependsNote: null,
    feedsInto: ['PMU-05', 'PMU-06', 'EDV-08', 'EEVB-03'],
    measuredBy: [
      'Regulator efficiency at the sleep and active loads',
      'Deep-sleep quiescent current of references and detectors',
      'Brown-out cases with a defined outcome for an eMRAM write',
    ],
    links: {
      dependsOn: ['PMU-01', 'FCD-05', 'EPDK-06'],
      feedsInto: ['PMU-05', 'PMU-06', 'EDV-08', 'EEVB-03'],
      runsWith: ['PMU-02'],
      revisedBy: ['MRAM-02', 'EPDK-11'],
      feedsBackInto: [],
    },
    terms: ['LDO', 'POR', 'BOR', 'PSRR', 'eMRAM'],
  },
  'PMU-04': {
    criticalPath: true,
    purpose: [
      'Define the <b>always-on domain and what can wake the part</b>: the real-time clock, wake logic and retention registers that stay powered, the sources that end a sleep, and how state is kept and restored across deep sleep.',
      'Everything in the always-on domain draws current for the life of the product, so its content is the floor of the sleep budget. The eMRAM changes the trade: state that would need retention SRAM on another part can be written to non-volatile memory, costing write energy at entry instead of leakage for the whole sleep.',
    ],
    flowNote:
      'Step 1 defines what the always-on domain holds, and step 2 lists the wake sources that must reach it. Step 3 defines retention and restore, and step 4 runs alongside it because the isolation and level-shifting cells sit on exactly the boundaries retention defines. Step 5 releases the specification to RTL.',
    consumes: [
      'Mode table and domain partition from PMU-01',
      'Clock sources available in sleep from PMU-02',
      'Peripheral and interface selection from EARCH-03',
      'eMRAM power-down and wake behaviour from MRAM-02',
      'Security state that must survive sleep from EARCH-05',
    ],
    rel: {
      'PMU-D4':
        '<b>Always-on domain and wake source specification.</b> The always-on content, wake sources, retention and isolation are defined and released here.',
    },
    risks: [
      '<b>Wake sources promised but not wired to the always-on domain.</b> A GPIO or serial wake listed in the product brief that sits in a powered-down domain cannot wake anything.',
      '<b>Too much kept always on.</b> Each register and comparator added for convenience adds leakage to every hour of sleep.',
      '<b>Retention and restore sequence left to firmware.</b> Without a hardware-defined order the restore races the first interrupt after wake.',
      '<b>Missing isolation on a domain boundary.</b> An unisolated output floating from a powered-off domain draws crowbar current into the always-on logic.',
      '<b>eMRAM chosen for sleep state without its write energy.</b> Saving state to eMRAM before every short sleep can cost more than the leakage it avoids.',
    ],
    roles: [
      { r: 'SoC architect', d: 'Owns always-on content, wake sources and retention' },
      { r: 'Power architect', d: 'Leakage floor of the always-on domain' },
      { r: 'Low-power implementation lead', d: 'Isolation, level shifting and power intent' },
      { r: 'Firmware lead', d: 'Sleep entry and wake restore sequence' },
      { r: 'Interface architect', d: 'Peripheral wake sources and their signalling' },
    ],
    effort: [
      ['Always-on domain content', 1],
      ['Wake source definition', 0.75],
      ['Retention and restore sequence', 1],
      ['Isolation and level shifting', 1],
      ['Release to RTL', 0.25],
    ],
    entry: [
      'Mode table released from PMU-01',
      'Peripheral set selected in EARCH-03',
      'Sleep clock sources defined in PMU-02',
    ],
    exit: [
      'Every wake source traced to logic in the always-on domain',
      'Retention and restore sequence defined in hardware order',
      'Isolation and level-shifting cells specified on every boundary',
    ],
    dependsOn: ['PMU-01', 'PMU-02', 'EARCH-03', 'MRAM-02'],
    dependsNote: null,
    feedsInto: ['ERTL-06', 'ERTL-04', 'PMU-06', 'SDK-02', 'EDV-09'],
    measuredBy: [
      'Always-on domain leakage against the deep-sleep budget',
      'Wake sources in the product brief traced to always-on logic',
      'Specification changes after release to RTL',
    ],
    links: {
      dependsOn: ['PMU-01', 'PMU-02', 'EARCH-03'],
      feedsInto: ['ERTL-06', 'ERTL-04', 'PMU-06', 'SDK-02', 'EDV-09'],
      runsWith: [],
      revisedBy: ['MRAM-02', 'EARCH-05'],
      feedsBackInto: [],
    },
    terms: ['RTC', 'UPF', 'eMRAM', 'SRAM'],
  },
  'PMU-05': {
    criticalPath: true,
    purpose: [
      'Turn the regulator, reference and oscillator schematics into <b>laid-out, verified analog hard macros</b> with the abstract, timing and behavioural views the rest of the chip is built and verified with.',
      'Analog performance is decided as much by layout as by schematic: matching, parasitic resistance on the supply paths and coupling into the references all move the numbers. The macros are verified again on their extracted views, because a regulator that met its specification in schematic and misses it in layout is found either here or on silicon.',
    ],
    flowNote:
      'Step 1 lays out the regulators, references and oscillators, and step 2 runs DRC, LVS and extraction on them. Step 3 runs alongside step 2 block by block, re-verifying each macro on its extracted view as soon as it is clean. Step 4 generates the views, and step 5 releases the macros to physical design.',
    consumes: [
      'Regulator, POR and brown-out schematics from PMU-03',
      'Clock source design from PMU-02',
      'Floorplan and pad ring placement from EARCH-08',
      'Signoff decks and extraction version from EPDK-04',
      'I/O and ESD library for the supply pins from EPDK-06',
    ],
    rel: {
      'PMU-D5':
        '<b>Analog hard macros with views, released.</b> The macros are laid out, verified on extracted views and released with their views here.',
    },
    risks: [
      '<b>Macros released on schematic performance.</b> Supply-path resistance and coupling in layout shift regulator and oscillator behaviour, and only extracted simulation shows by how much.',
      '<b>Behavioural models that do not match the layout.</b> Mixed-signal verification in EDV-08 then proves a model rather than the macro.',
      '<b>Placement not agreed with the floorplan.</b> A regulator placed far from its load or next to switching logic loses the margin it was designed with.',
      '<b>Abstract views missing blockages.</b> Physical design routes over sensitive references, and the coupling appears only at signoff.',
      '<b>Layout finishes late in the stage.</b> Physical design starts floorplanning in week 44, and a macro released after that is placed as a placeholder.',
    ],
    roles: [
      { r: 'Analog layout lead', d: 'Owns layout, verification and macro release' },
      { r: 'Analog design lead', d: 'Post-layout performance review and sign-off' },
      { r: 'Physical architect', d: 'Macro placement and supply connection in the floorplan' },
      { r: 'AMS verification engineer', d: 'Behavioural models consistent with the layout' },
      { r: 'CAD methodology engineer', d: 'Signoff deck and extraction versions' },
    ],
    effort: [
      ['Analog block layout', 3.5],
      ['DRC, LVS and extraction', 1.5],
      ['Post-layout re-verification', 1.5],
      ['Abstract, timing and behavioural views', 1],
      ['Release to physical design', 0.5],
    ],
    entry: [
      'Regulator and reset schematics released from PMU-03',
      'Clock source design released from PMU-02',
      'Signoff decks frozen in EPDK-04',
    ],
    exit: [
      'Every macro DRC and LVS clean on the frozen decks',
      'Post-layout performance within specification across corners',
      'Abstract, timing and behavioural views released to physical design',
    ],
    dependsOn: ['PMU-03', 'PMU-02', 'EARCH-08', 'EPDK-04'],
    dependsNote: null,
    feedsInto: ['EPD-02', 'EPD-03', 'EDV-08', 'PMU-07'],
    measuredBy: [
      'Macros released against the physical design floorplan date',
      'Post-layout performance deltas against schematic',
      'View defects found after release',
    ],
    links: {
      dependsOn: ['PMU-02', 'PMU-03', 'EARCH-08', 'EPDK-04'],
      feedsInto: ['EPD-02', 'EPD-03', 'EDV-08', 'PMU-07'],
      runsWith: [],
      revisedBy: ['EPDK-06'],
      feedsBackInto: [],
    },
    terms: ['DRC', 'LVS', 'LEF', 'AMS', 'CDL'],
  },
  'PMU-06': {
    criticalPath: false,
    purpose: [
      'Prove the <b>energy of every mode and every transition between them</b> against the duty cycles customers run, and reconcile the result with the fabric energy model so the battery-life claim has one number behind it.',
      'A sleep mode that draws little but takes a long, expensive wake can lose to a lighter sleep, and only simulating entry and exit with the real firmware sequence shows which. The verified budget is what the energy profiler and lifetime modeller are calibrated on before silicon exists.',
    ],
    flowNote:
      'Step 1 builds the mixed-signal model of each transition, and step 2 simulates sleep entry and exit with the firmware sequence. Step 3 runs alongside step 2, estimating energy per mode against the duty cycles as each transition result arrives. Step 4 reconciles the budget with the fabric model, and step 5 releases it.',
    consumes: [
      'Mode table and per-mode targets from PMU-01',
      'Regulator and brown-out design from PMU-03',
      'Always-on domain and wake specification from PMU-04',
      'Cycle and energy model from FCD-05',
      'Low-power verification results from EDV-09',
    ],
    rel: {
      'PMU-D6':
        '<b>System energy budget per mode, verified.</b> The energy per mode and per transition is simulated, reconciled with the fabric model and released here.',
    },
    risks: [
      '<b>Energy budget never reconciled with the fabric model.</b> The PMU and the compiler then quote different battery lives for the same workload.',
      '<b>Transitions simulated without the firmware sequence.</b> Hardware-only entry and exit miss the time the core spends saving and restoring state.',
      '<b>Duty cycles taken from one application.</b> A sensor node and a keyword-spotting device sleep and wake in different rhythms, and the budget has to hold for the ones sold into.',
      '<b>Wake energy left out of the per-mode figures.</b> A deep-sleep current that looks excellent hides a wake cost that dominates short sleeps.',
      '<b>Budget verified at typical corner only.</b> Leakage at the hot corner can move deep-sleep energy several-fold.',
    ],
    roles: [
      { r: 'Power architect', d: 'Owns the budget and its reconciliation' },
      { r: 'AMS verification engineer', d: 'Mixed-signal transition models and simulation' },
      { r: 'Performance architect', d: 'Fabric energy model the budget reconciles to' },
      { r: 'Firmware engineer', d: 'Sleep entry and exit sequence used in simulation' },
      { r: 'Tools engineer', d: 'Budget carried into the energy profiler' },
    ],
    effort: [
      ['Mixed-signal transition model', 1.5],
      ['Sleep entry and exit simulation', 1.5],
      ['Energy per mode against duty cycles', 1],
      ['Reconciliation with the fabric model', 0.75],
      ['Budget release', 0.25],
    ],
    entry: [
      'Regulator design released from PMU-03',
      'Always-on specification released from PMU-04',
      'Energy model with accuracy bounds available from FCD-05',
    ],
    exit: [
      'Every mode and transition simulated with the firmware sequence',
      'Energy per mode stated across temperature for the reference duty cycles',
      'Budget reconciled with the fabric model within its accuracy bounds',
    ],
    dependsOn: ['PMU-01', 'PMU-03', 'PMU-04', 'FCD-05', 'EDV-09'],
    dependsNote: null,
    feedsInto: ['VP-04', 'EDV-10', 'PMU-07', 'EVK-01'],
    measuredBy: [
      'Battery life from the budget against the product target',
      'Difference between the PMU budget and the fabric model',
      'Transitions simulated with firmware against total',
    ],
    links: {
      dependsOn: ['PMU-01', 'PMU-03', 'PMU-04', 'FCD-05'],
      feedsInto: ['VP-04', 'EDV-10', 'PMU-07', 'EVK-01'],
      runsWith: ['EDV-09'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['AMS', 'UPF', 'PVT', 'KPI'],
  },
  'PMU-07': {
    criticalPath: true,
    purpose: [
      'Sign off the <b>power manager and always-on domain as part of the chip</b>: reliability on the supply pins, the analog macros inside the top-level runs, and every analog waiver closed or accepted.',
      'The macros were verified alone in PMU-05. What has to be signed here is that they still hold inside the chip — ESD on the supply pins, latch-up near the regulators, EM on the high-current paths — before physical design builds the signoff database on them.',
    ],
    flowNote:
      'Step 1 reviews reliability on the supply pins and regulator paths, and step 2 confirms the macros in the top-level runs. Step 3 runs alongside step 2 because most analog waivers are raised and closed in those same runs, and step 4 signs the power manager off.',
    consumes: [
      'Analog hard macros and views from PMU-05',
      'Verified energy budget per mode from PMU-06',
      'Mixed-signal co-simulation results from EDV-08',
      'Early power network and IR analysis from EPD-03',
      'Flow setup and first top-level runs from EPD-01',
    ],
    rel: {
      'PMU-D7':
        '<b>PMU and always-on signoff.</b> The reliability review, top-level confirmation and waiver closure are recorded and signed here.',
    },
    risks: [
      '<b>Signoff on the first top-level runs taken as final.</b> The final signoff runs come later in ESO, and a change to the macros or their surroundings has to reopen this signoff.',
      '<b>ESD on supply pins checked only at library level.</b> The regulator’s own devices sit on the pin, and the path through them is not in the library qualification.',
      '<b>Latch-up spacing near the regulators waived.</b> High-current output devices beside core logic are exactly where latch-up occurs.',
      '<b>Analog waivers closed without a condition.</b> A waiver accepted for this layout silently carries into the next revision.',
      '<b>Sleep current not re-checked after integration.</b> Leakage paths added at the top level raise the deep-sleep number the macro met on its own.',
    ],
    roles: [
      { r: 'Analog design lead', d: 'Owns the signoff and the analog waiver list' },
      { r: 'Reliability signoff engineer', d: 'ESD, latch-up and EM on the supply paths' },
      { r: 'Power delivery engineer', d: 'Macro connection to the chip power network' },
      { r: 'Power architect', d: 'Sleep current confirmed at the top level' },
      { r: 'Physical design lead', d: 'Macros in the top-level runs' },
    ],
    effort: [
      ['Reliability review', 0.75],
      ['Top-level confirmation', 0.5],
      ['Analog waiver closure', 0.5],
      ['Signoff record', 0.25],
    ],
    entry: [
      'Macros released from PMU-05',
      'Energy budget verified in PMU-06',
      'First top-level runs available from EPD-01 and EPD-03',
    ],
    exit: [
      'ESD, latch-up and EM clean or waived with a condition',
      'Macros confirmed in the top-level runs',
      'Signoff recorded with the conditions for reopening it',
    ],
    dependsOn: ['PMU-05', 'PMU-06', 'EDV-08', 'EPD-01', 'EPD-03'],
    dependsNote:
      'The signoff at week 48 is taken on the first top-level runs, before the final physical design turn. ESO-05 and ESO-06 repeat the analog checks on the final database, and a change to a macro or its surroundings after this point reopens it.',
    feedsInto: ['ESO-05', 'ESO-06', 'EBU-02', 'EBU-03'],
    measuredBy: [
      'Analog waivers open at signoff',
      'Deep-sleep current at the top level against the macro-level figure',
      'Signoff reopened by later layout changes',
    ],
    links: {
      dependsOn: ['PMU-05', 'PMU-06', 'EDV-08', 'EPD-01'],
      feedsInto: ['ESO-05', 'ESO-06', 'EBU-02', 'EBU-03'],
      runsWith: ['EPD-03'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['ESD', 'EM', 'LDO', 'EM/IR'],
  },
};
