import type { WriteUpEdit } from './types';

/** EVB: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const EVB_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'EVB-01': {
    purpose: [
      'Decide <b>what the silicon will be validated on</b>—how many platforms, in what configuration, at what quantity—before anyone draws a schematic.',
      'The board is the only way to touch the silicon, and its capability bounds everything bring-up and characterization can do. A platform that cannot reach a rail, cannot resolve a sleep current in microamps, cannot socket a part, or cannot be temperature-soaked closes off measurements that the qualification plan assumes are available.',
    ],
    consumes: [
      'Bring-up requirements from BU-02 through BU-10 planning',
      'Characterization plan from TEST-09',
      'Package pin-out and lead map from EPKG-02',
      'Power architecture and operating modes from PMU-01',
      'Peripheral and interface list from ARCH-03',
    ],
    risks: [
      '<b>Requirements collected from bring-up only.</b> Characterization and qualification also live on this platform, and their needs—soak capability, instrumented rails that resolve sleep current—differ.',
      '<b>Socket versus solder decided late.</b> It changes the board, the mechanical design and the unit consumption, and reversing it costs a board revision.',
      '<b>Quantity underestimated.</b> Boards are the constraint on parallel debug, and a second fabrication run costs two months.',
      '<b>Reuse not assessed.</b> An adaptable existing platform is the cheapest schedule available and it is often never looked for.',
      '<b>Specification written after design started.</b> The board then documents what was built rather than bounding what should be.',
    ],
    entry: [
      'Package pin-out stable enough to plan against',
      'Validation and characterization intent understood',
      'Operating modes and power architecture from PMU-01 available',
    ],
  },
  'EVB-02': {
    purpose: [
      'Design the <b>EVB schematic</b>—power tree, USB and programmer interface, socket, clocking, debug headers—and its bill of materials.',
      'The schematic is where the platform’s capability is fixed. A rail without a sense point cannot be measured, a debug header omitted cannot be added, and a component with a 40-week lead time turns a board schedule into a procurement schedule.',
    ],
    consumes: [
      'Platform specification from EVB-01',
      'Package pin-out and lead map from EPKG-02',
      'Power architecture and operating modes from PMU-01',
      'Peripheral and interface list from ARCH-03',
      'Debug requirements from EVB-04',
    ],
    risks: [
      '<b>Rails without sense points.</b> A rail that cannot be measured cannot be characterized, and the omission is only discovered during bring-up.',
      '<b>Long-lead components found after layout.</b> The substitution then costs a board revision instead of a schematic edit.',
      '<b>Debug headers designed for the debugger nobody uses.</b> The tooling has to be agreed with validation rather than assumed.',
      '<b>Pin map changing after schematic release.</b> The package pin map has to be frozen for the schematic to be worth reviewing.',
      '<b>Power tree sized without the real operating modes.</b> Supplies sized to an early estimate cannot follow the part’s wake transients, and supplies whose own quiescent draw is large swamp the sleep current they are meant to feed.',
    ],
    roles: [
      { r: 'Hardware engineer', d: 'Owns the schematic' },
      { r: 'Power engineer', d: 'Power tree, supply and rail switching design' },
      { r: 'Validation engineer', d: 'Debug and instrumentation requirements' },
      { r: 'Component engineer', d: 'BOM sourcing and lead times' },
      { r: 'Hardware lead', d: 'Schematic review and release' },
    ],
    effortLabels: [
      'Power tree design',
      'USB and programmer interface',
      'Socket interface',
      'Clocking',
      'Review and release',
      'BOM and sourcing',
    ],
    entry: [
      'Platform specification approved from EVB-01',
      'Package pin-out frozen from EPKG-02',
      'Operating modes and power architecture available from PMU-01',
    ],
  },
  'EVB-03': {
    purpose: [
      'Design and bring up the <b>supplies, rail switching and current measurement</b> on the platform—the 1.8–5.5 V inputs the part runs from and the instrumentation that measures what it draws, from sleep microamps to active milliamps.',
      'Characterization of this part is mostly a current measurement. Shmoo needs rails that can be swept, the energy-per-task and sleep-current figures the product is sold on need a measurement chain that resolves microamps without disturbing the rail, and both need protection that trips before a scarce first-silicon part is damaged.',
    ],
    flowNote:
      'Step 3 is the one this product depends on. Covering sleep in the microamps and active operation in the milliamps takes range switching or separate measurement paths, and a shunt sized for active current reads sleep current as noise. Step 5 still protects the units: a sequencing or overcurrent fault on a first-silicon part costs a unit there are very few of, and the protection has to be validated before a real part is ever inserted.',
    consumes: [
      'Power architecture and operating modes from PMU-01',
      'Regulator, power-on reset and brown-out design from PMU-03',
      'System energy budget per mode from PMU-06',
      'Board PDN design from EVB-05',
      'Shmoo range from BU-08 planning',
    ],
    risks: [
      '<b>Rails not sweepable across the shmoo range.</b> Characterization then cannot reach the corners the qualification plan requires.',
      '<b>Protection untested before a real part goes in.</b> A sequencing fault destroys a first-silicon unit, and there are very few of them.',
      '<b>Current measurement unable to resolve sleep current.</b> A chain sized for active current reads the microamp floor as noise, and the product’s headline figure goes unmeasured.',
      '<b>Range switching disturbing the rail.</b> A measurement chain that drops the rail or glitches on a range change during a wake transient causes the brown-out it was meant to observe.',
      '<b>Sequencing not matching the silicon’s requirement.</b> The power-up order and brown-out thresholds come from the design, and getting them wrong is a common first-board fault.',
    ],
    roles: [
      { r: 'Power engineer', d: 'Owns the power subsystem' },
      { r: 'Hardware engineer', d: 'Board integration and bring-up' },
      { r: 'Power architect', d: 'Operating modes, brown-out thresholds and the energy budget per mode' },
      { r: 'Validation engineer', d: 'Shmoo and current measurement requirements' },
      { r: 'Test engineer', d: 'Measurement accuracy needs' },
    ],
    effortLabels: [
      'Supply and rail switching design',
      'Power bring-up',
      'Current measurement design',
      'Wake transient and range switching',
      'Protection and sequencing',
    ],
    entry: [
      'Power architecture and operating modes from PMU-01',
      'Regulator and brown-out thresholds from PMU-03',
      'Shmoo range defined by validation',
    ],
    exit: [
      'Rails sweepable across the full shmoo range and input range',
      'Protection validated before any real part is inserted',
      'Current measured from sleep microamps to active milliamps at the accuracy characterization needs',
    ],
    measuredBy: [
      'Rail sweep range against the shmoo requirement',
      'Protection trip validated before first insertion',
      'Current measurement floor and accuracy against the sleep-current specification',
    ],
    terms: ['BOM', 'PDN', 'EVB', 'Shmoo'],
  },
  'EVB-04': {
    purpose: [
      'Build the <b>debug access</b>—JTAG and trace probes, socket adapters, probe points—because silicon debug is bounded by what can be observed.',
      'When first silicon does something unexpected, the difference between a day and a month is whether the state that explains it can be read out. The DFT infrastructure provides the internal access; this activity provides the physical path to it.',
    ],
    consumes: [
      'Debug and trace architecture from DFT-04',
      'Silicon debug requirements from BU-05 planning',
      'Platform specification from EVB-01',
      'Package pin-out and lead map from EPKG-02',
      'Debug tooling from the DFT flow',
    ],
    risks: [
      '<b>Debug access designed without DFT.</b> The internal observability comes from <code>DFT-04</code>, and the board access has to match what it exposes.',
      '<b>Trace bandwidth insufficient.</b> Trace is only useful if it can keep up with the events being traced, and the bandwidth is a board design parameter.',
      '<b>Probe points unreachable once the socket is closed.</b> The socket lid and the probe access compete for the same physical space around the part.',
      '<b>Debug path unvalidated before silicon.</b> It is then debugged during the emergency it exists to resolve.',
      '<b>Software tooling not integrated.</b> A hardware debug path with no software to drive it is not a debug path.',
    ],
    roles: [
      { r: 'Validation engineer', d: 'Owns debug requirements' },
      { r: 'DFT engineer', d: 'Internal observability and access protocol' },
      { r: 'Hardware engineer', d: 'Board debug interface design' },
      { r: 'Software engineer', d: 'Debug tooling integration' },
      { r: 'Mechanical engineer', d: 'Probe access against the socket' },
    ],
    entry: [
      'DFT debug architecture available from DFT-04',
      'Silicon debug requirements understood',
      'Platform specification from EVB-01',
    ],
  },
  'EVB-05': {
    purpose: [
      'Lay out the PCB with <b>low-noise current measurement and power integrity simulated on the sensitive rails</b>, because a board that measures microamps is itself a precision analog design.',
      'The board is in series with every current and energy measurement bring-up will make. Leakage paths, ground return through the shunt and noise coupled onto the analog and eMRAM rails produce readings that look like silicon behavior, and separating the two costs weeks of debug time that the layout could have avoided.',
    ],
    flowNote:
      'Steps 3 and 5 run against the routing rather than after it. Supply noise simulated after the board is routed produces a report; simulated during, it produces a routing change.',
    consumes: [
      'Released schematic and BOM from EVB-02',
      'Package electrical model from EPKG-04',
      'Package pin-out and lead map from EPKG-02',
      'Supply noise limits for the analog and eMRAM macros from PMU-05 and MRAM-05',
      'Mechanical and socket constraints from EVB-01',
    ],
    risks: [
      '<b>Measurement paths routed like ordinary signals.</b> Careless shunt and Kelvin-sense routing adds leakage and offset that swamp a microamp sleep reading.',
      '<b>Supply noise simulated after routing.</b> The result is a report rather than a design change, and fixing it costs a revision.',
      '<b>Board PDN inadequate for the wake transient.</b> The part moves from microamps to milliamps in microseconds when it wakes, and a board PDN sized without that droops toward brown-out.',
      '<b>Grounding chosen for cost before noise.</b> Digital return currents sharing a path with the analog and measurement grounds appear as noise on exactly the rails being measured.',
      '<b>Mechanical constraints applied last.</b> The socket, the connectors and the probe access need space, and finding that out after routing costs a revision.',
    ],
    roles: [
      { r: 'PCB layout engineer', d: 'Owns the layout' },
      { r: 'SI/PI engineer', d: 'Supply noise and PDN simulation' },
      { r: 'Hardware engineer', d: 'Schematic intent and constraint definition' },
      { r: 'Mechanical engineer', d: 'Socket and mechanical constraints' },
      { r: 'Fabrication liaison', d: 'Stack-up feasibility and DFM' },
    ],
    effortLabels: [
      'Measurement and clock routing',
      'Supply noise simulation',
      'Power plane layout',
      'Placement',
      'PI simulation',
      'DRC and release',
    ],
    entry: [
      'Schematic released from EVB-02',
      'Package electrical model available from EPKG-04',
      'Supply noise limits for the analog and eMRAM rails agreed',
    ],
    exit: [
      'Measurement paths laid out for the sleep-current floor',
      'Supply noise and PI simulated during routing, not after',
      'Mechanical and socket constraints met without a revision',
    ],
    measuredBy: [
      'Supply noise on the analog and eMRAM rails against its limit',
      'Simulation findings resolved in layout',
      'DRC and DFM clean at release',
    ],
    terms: ['BOM', 'DRC', 'DFM', 'PDN', 'PI', 'SI/PI', 'PCB', 'EVB', 'eMRAM'],
  },
  'EVB-07': {
    purpose: [
      'Get the boards <b>fabricated, assembled and inspected</b>—a five-week vendor cycle that is mostly waiting and entirely on the critical path to bring-up.',
      'This is procurement work with an engineering tail. The board has to arrive before silicon does, its quantity has to match the parallel-debug plan, and every board that arrives faulty is a debug station that does not exist.',
    ],
  },
  'EVB-08': {
    purpose: [
      'Reserve the instruments and <b>build the lab racks</b>—because characterization needs equipment that is expensive, shared and booked months ahead.',
      'A source-measure unit or current analyser that resolves nanoamps, a temperature forcing system and a calibrated energy analyser are shared items with a queue in front of them. Discovering during bring-up that the one instrument able to measure deep-sleep current is committed elsewhere for six weeks does not delay the measurement by six weeks—it delays everything downstream of it.',
    ],
    risks: [
      '<b>Instruments booked too late.</b> Precision current and temperature-forcing equipment is shared and queued, and a six-week wait delays everything downstream.',
      '<b>Automation deferred to bring-up.</b> It is then written under time pressure by people who should be debugging silicon.',
      '<b>Racks not calibrated.</b> Measurements from an uncalibrated setup are unusable for characterization and often not questioned.',
      '<b>Lab power or space insufficient.</b> A rack that cannot be powered is a rack that does not exist, and facilities lead times are long.',
      '<b>Instrument resolution above the sleep floor.</b> An ammeter that cannot resolve the deep-sleep current produces a plausible and wrong measurement.',
    ],
    terms: [],
  },
  'EVB-09': {
    purpose: [
      'Provide the <b>minimum host-side software</b> needed to power on and talk to the part—boot, register access, programming, logging—without taking on the SDK.',
      'The boot ROM, HAL and drivers are the SDK team’s work (SDK-01, SDK-02), but silicon cannot be brought up without something on the other end of the USB programmer and the serial console. The boundary matters: this activity delivers exactly enough to reach first register read and no more, and where that line sits should be agreed rather than discovered.',
    ],
    flowNote:
      'Step 1 is the activity’s most valuable hour. Without an explicit boundary, hardware validation writes software the SDK team is also writing, and each assumes the other is doing it.',
    consumes: [
      'Register map from RTL-04',
      'Boot ROM and boot sequence from SDK-01',
      'Debug tooling from EVB-04',
      'HAL and driver scope and schedule from SDK-02',
      'Platform specification from EVB-01',
    ],
    risks: [
      '<b>Boundary with the SDK team left implicit.</b> Either the work is duplicated or nobody does it, and both are discovered at power-on.',
      '<b>Register map drifting from the RTL.</b> A diagnostic tool built against a stale map reads the wrong addresses and reports plausible nonsense.',
      '<b>Scope creeping into the SDK.</b> Minimal enablement becomes a driver project that duplicates the HAL, and the validation team stops validating.',
      '<b>Logging insufficient for post-mortem.</b> A failure that cannot be reconstructed from the log has to be reproduced, which on first silicon may not be possible.',
      '<b>Enablement unvalidated before silicon.</b> Software bugs then present as silicon bugs during the most expensive week of the program.',
    ],
    roles: [
      { r: 'Validation software engineer', d: 'Owns host enablement' },
      { r: 'Firmware liaison', d: 'Boundary with the SDK team and handoff' },
      { r: 'Design engineer', d: 'Register map and boot sequence' },
      { r: 'Validation engineer', d: 'Diagnostic tooling requirements' },
      { r: 'Bring-up lead', d: 'Scope discipline against the SDK' },
    ],
    entry: [
      'Register map available from RTL-04',
      'Boot sequence defined in SDK-01',
      'SDK team’s scope known',
    ],
    exit: [
      'Boundary with the SDK team explicit and agreed',
      'Register access validated against the current map',
      'Enablement validated on the platform before silicon',
    ],
    measuredBy: [
      'Boundary disputes with the SDK team during bring-up',
      'Register map currency against RTL',
      'Bring-up issues later traced to host software',
    ],
    terms: ['RTL', 'SDK', 'HAL'],
  },
  'EVB-10': {
    consumes: [
      'Assembled boards from EVB-07',
      'Power subsystem and current measurement from EVB-03',
      'Debug infrastructure from EVB-04',
      'Dummy parts, precision loads and socket fixtures',
      'Host enablement from EVB-09',
    ],
    risks: [
      '<b>Board bring-up deferred until silicon arrives.</b> Every anomaly then has two candidate causes, and separating them costs days each.',
      '<b>Known issues not documented.</b> The bring-up team then rediscovers each board quirk independently, once per engineer.',
      '<b>Current measurement not checked against known loads.</b> A chain never calibrated against a precision load at the microamp floor reports the board’s own leakage as the silicon’s sleep current.',
      '<b>Only one board brought up.</b> Board-to-board variation is real, and a fleet where only one is characterized is a fleet with unknown members.',
      '<b>Socket fit checked after silicon insertion.</b> A socket that does not seat or actuate cleanly is discovered with an irreplaceable part in it.',
    ],
    roles: [
      { r: 'Hardware engineer', d: 'Owns board bring-up' },
      { r: 'Power engineer', d: 'Rail and protection verification' },
      { r: 'Validation engineer', d: 'Known-issue capture for the bring-up team' },
      { r: 'Characterization engineer', d: 'Current measurement check against known loads' },
      { r: 'Mechanical engineer', d: 'Socket fit and actuation' },
    ],
    effortLabels: [
      'Interface validation',
      'Power bring-up',
      'Clocking validation',
      'Current measurement validation',
      'Socket fit',
    ],
    terms: ['EVB'],
  },
};
