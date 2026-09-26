import type { WriteUpEdit } from './types';

/** SO: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const SO_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'SO-01': {
    flowNote:
      'Step 3 sizes the signoff campaign. On a die this small one corner runs in hours, but a low-power part carries more corners than most—the retention voltage, hot leakage, low-voltage sleep and the test modes—and knowing the product of the two before the final turn is what lets the schedule be built rather than discovered.',
  },

  'SO-03': {
    flowNote:
      'Step 6 covers the modes that are easy to forget and expensive to miss. Scan shift, at-speed capture, the retention voltage and the always-on domain on its slow clock each have their own timing, and a design signed off only in its active modes produces parts that fail at ATE or fail to wake.',
  },

  'SO-04': {
    purpose: [
      'Run <b>full-chip physical verification</b>—DRC, LVS, antenna, density—to clean, on the database that will become masks.',
      'Physical verification is binary and unforgiving: the foundry will not accept a database with violations it has not waived. The die is small and the runs take hours, but the eMRAM, the analog macros and the pad ring each bring rules of their own, and the last hundred violations are the ones that need a human.',
    ],
    consumes: [
      'Final database from EPD-13 and EPD-10',
      'Verification decks from EPDK-04',
      'Macro layouts and abstracts from MRAM-05 and PMU-05',
      'Chip finishing from EPD-14',
      'Foundry rule set from EPDK-02',
    ],
    risks: [
      '<b>LVS mismatch traced late.</b> Full-chip mismatches take days to localize, and they are frequently caused by macro views rather than by the design.',
      '<b>Runs started too late.</b> Each full-chip run takes hours and each fix another run, and the iteration count is what sets the schedule rather than any single run.',
      '<b>Antenna fixes needing space that is gone.</b> Diodes and layer jumps need room, and a fully routed design has none.',
      '<b>Waivers assumed acceptable.</b> Foundry waivers are granted case by case, and a design that assumes one will be granted may not tape out.',
      '<b>Verification on a database that then changes.</b> Any ECO after a clean run invalidates it, and every re-run costs time the tapeout date does not have.',
    ],
  },

  'SO-05': {
    purpose: [
      'Sign off <b>electromigration and IR drop</b>—static and dynamic, with real switching, from the regulator outputs through the grid—because a design that meets timing and fails EM will not survive its warranty.',
      'EM and IR are reliability and performance at once. IR drop consumes timing margin the STA assumed; EM limits how long the part will work. Both are analyzed on the final database with real activity, and both can send routing back for changes that reopen timing.',
    ],
    consumes: [
      'Final database from EPD-13',
      'PDN from EPD-03',
      'Switching activity from EDV-07 and ESYN-09',
      'Regulator output impedance and load limits from PMU-03',
      'Package electrical model from EPKG-04',
      'EM rules from EPDK-02',
    ],
    risks: [
      '<b>IR not back-annotated into timing.</b> The design is then signed off at a supply voltage it never sees, and the margin was never real.',
      '<b>Dynamic IR analyzed with uniform activity.</b> Real switching is bursty and local, and uniform assumptions understate the worst case—the wake transition, when a whole domain switches on at once, most of all.',
      '<b>Package effects excluded.</b> Die-only IR is optimistic; the number that matters includes the package inductance <code>EPKG-04</code> models.',
      '<b>Signal EM at the hot corner overlooked.</b> Clock and high-toggle nets at the industrial hot corner carry real EM exposure, and checking only power misses them.',
      '<b>EM fixes reopening timing.</b> Widening wires changes delay, and a fix applied after timing signoff invalidates it.',
    ],
    roles: [
      { r: 'EM/IR signoff lead', d: 'Owns EM and IR analysis and closure' },
      { r: 'Power integrity engineers', d: 'Static and dynamic IR analysis' },
      { r: 'Reliability engineer', d: 'EM limits and lifetime interpretation' },
      { r: 'Timing engineer', d: 'IR-aware timing reconciliation' },
      { r: 'Package engineer', d: 'Package resistance and inductance for IR' },
    ],
    entry: [
      'Final database available from EPD-13',
      'Realistic switching activity available from EDV-07',
      'Package electrical model available from EPKG-04',
    ],
  },

  'SO-08': {
    purpose: [
      'Sign off <b>signal integrity</b>—crosstalk delay, noise, glitch—on the final database, confirm the numbers the timing signoff assumed, and reconcile signoff leakage against the sleep-current budget.',
      'Crosstalk is timing. Coupling between adjacent nets changes delay in both directions and can inject glitches that propagate as functional failures. The analysis is separate from STA and its results feed straight back into it, which makes the two inseparable at signoff. Leakage is the sleep current, and sleep current is the battery life the product is sold on.',
    ],
    consumes: [
      'Final database and extraction from EPD-13',
      'Crosstalk fixes from EPD-12',
      'Timing analysis from ESO-03',
      'Noise rules and thresholds from EPDK-02',
      'PI results from ESO-05',
      'Sleep-current budget per mode from PMU-06',
    ],
    risks: [
      '<b>Crosstalk reported and not reconciled with timing.</b> Two separate reports means the design is signed off against timing that excludes coupling.',
      '<b>Glitch analysis omitted.</b> Noise on a static net can propagate as a functional failure that no timing analysis would show.',
      '<b>Leakage signed off at typical.</b> Sleep current is set by leakage at the hot corner, and a design whose signoff leakage was read at typical ships with a battery-life figure it cannot meet.',
      '<b>Fixes applied after timing signoff.</b> Spacing and shielding change delay, and a late fix invalidates the timing it was meant to protect.',
      '<b>Thresholds set by tool default.</b> Noise thresholds are a library and technology property, and defaults are either optimistic or unnecessarily punitive.',
    ],
    roles: [
      { r: 'SI signoff engineer', d: 'Owns crosstalk and noise signoff' },
      { r: 'STA engineer', d: 'Timing reconciliation with crosstalk delay' },
      { r: 'Routing engineers', d: 'Spacing and shielding fixes' },
      { r: 'Library engineer', d: 'Noise thresholds and leakage characterization at the hot corner' },
      { r: 'Signoff lead', d: 'Closure, reporting and the leakage reconciliation' },
    ],
    measuredBy: [
      'Crosstalk delay against the timing budget',
      'Glitch violations at freeze',
      'Signoff leakage at the hot corner against the sleep-current budget',
    ],
  },

  'SO-10': {
    purpose: [
      'Run <b>gate-level simulation with the final SDF</b>—the last dynamic check that the design behaves correctly with real timing on the database being taped out.',
      'Static timing analysis proves paths meet constraints; it does not prove the design works. Simulating with final timing catches what STA structurally cannot—race conditions, reset and wake behavior under real delays, and any place where the constraints described a design different from the one built.',
    ],
    flowNote:
      'Step 3 is the check most likely to find something. Power-on reset, brown-out recovery and wake from deep sleep depend on relative delays across the die and on the always-on domain handing control back correctly, and a sequence that works with estimated timing can fail with the real numbers—a failure that would otherwise appear at first power-on, or as a part that never wakes.',
    consumes: [
      'Final database and SDF from EPD-13 and EPD-05',
      'Gate-level environment from EDV-11',
      'Test patterns and modes from EDFT-11',
      'Timing signoff results from ESO-03',
      'Power intent from ESYN-10',
      'Boot ROM image from SDK-01, run from reset',
    ],
    risks: [
      '<b>Skipped because STA is clean.</b> They answer different questions, and the failures gate-level simulation finds are invisible to static analysis.',
      '<b>Run on an earlier database.</b> A simulation against pre-final timing says nothing about the database being taped out.',
      '<b>Reset and wake simulation omitted.</b> Reset ordering and wake from sleep under real delays are common silicon failures and among the cheapest to catch here.',
      '<b>X failures forced away.</b> Initializing signals to make the simulation run hides exactly the uninitialized state that will fail at power-on.',
      '<b>Runtime prohibiting meaningful scenarios.</b> Full-timing simulation is slow, and a scenario set trimmed to fit may exclude the case that matters.',
    ],
    exit: [
      'Simulated against the final SDF, not an earlier one',
      'Reset, wake from sleep and boot from ROM simulated with real delays',
      'X failures fixed rather than forced',
    ],
    terms: ['STA', 'DFT', 'SDF', 'POR', 'BOR', 'ROM'],
  },

  'SO-11': {
    purpose: [
      'Run the <b>waiver review board</b>—every violation that survives signoff, examined, owned and either fixed or accepted—and assemble the Design Freeze package.',
      'Every design tapes out with waivers. What distinguishes a controlled tapeout from a hopeful one is whether each waiver was understood, quantified and signed, or simply ran out of time. This board is where that distinction is made, and its package is what the Go / No-Go decision reads.',
    ],
  },
};
