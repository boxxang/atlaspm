import type { WriteUpEdit } from './types';

/** DFT: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const DFT_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'DFT-01': {
    flowNote:
      'Step 3 is a cost decision disguised as an architecture one. Compression ratio sets pattern volume, pattern volume sets tester memory and test time, and test time is a per-unit cost for the life of the product—on a part that sells for a few dollars, a visible share of it.',
    consumes: [
      'Design hierarchy and partitioning from ARCH-02',
      'Coverage and test-time targets from DFT-02',
      'Memory list, SRAM and eMRAM, and BISR intent from ARCH-04 and MRAM-01',
      'Power domains and always-on logic from ARCH-06',
      'Test platform constraints from TEST-02',
      'Debug access requirements from ARCH-05',
    ],
    risks: [
      '<b>Architecture decided after synthesis starts.</b> Scan insertion and constraints depend on it; deciding late means re-running both.',
      '<b>Compression ratio chosen without the test cost model.</b> Ratio trades pattern volume against silicon area, and only <code>TEST-03</code>’s cost model says which side to favor.',
      '<b>Tile replication not exploited.</b> The fabric is one tile repeated across the array; a hierarchical scheme that tests the tile once and broadcasts its patterns to every copy keeps pattern volume small, and flat scan throws that away.',
      '<b>Test modes defined without the security architecture.</b> Every test mode is an access path, and <code>ARCH-05</code> has to lock the ones that should not exist in production.',
      '<b>Architecture written and not reviewed by test engineering.</b> A scheme that is elegant in design and unrunnable on the chosen ATE is discovered at <code>TEST-08</code>.',
    ],
    terms: ['DFT', 'BISR', 'ATE', 'eMRAM'],
  },

  'DFT-03': {
    risks: [
      '<b>Debug access designed out for security.</b> A part that cannot be debugged in the field is a part whose first field failure has no diagnostic path.',
      '<b>Lockdown untested.</b> The lifecycle transition that locks the TAP is the one nobody exercises, because exercising it makes the part undebuggable.',
      '<b>Description files generated late.</b> BSDL and ICL are consumed by board test and ATE; generating them near tapeout leaves no time to validate them.',
      '<b>Access network verified only in functional mode.</b> The network exists to work when the design does not, and that is the mode that needs proving.',
      '<b>Pin budget for debug not reserved.</b> Debug and trace need pins, and on a QFN whose pins are already shared with GPIO, a pin-out fixed without them means debug through a narrow channel.',
    ],
    entry: [
      'DFT architecture available from DFT-01',
      'Security lockdown policy defined by ARCH-05',
      'Pin budget known from ARCH-08 and the pin-out from EPKG-02',
    ],
    terms: ['DFT', 'JTAG', 'IJTAG', 'ICL', 'PDL', 'BSDL', 'TAP', 'ATE', 'QFN'],
  },

  'DFT-04': {
    consumes: [
      'Debug requirements from validation and BU-05',
      'Debugger and energy profiler requirements from CMP-06',
      'Access network from DFT-03',
      'Scan infrastructure from DFT-08',
      'Pin budget from ARCH-08 and the pin-out from EPKG-02',
      'Security lockdown policy from ARCH-05',
    ],
    risks: [
      '<b>Debug traded away for area.</b> The saving is small and the cost is paid at bring-up, in weeks, by a different team.',
      '<b>Requirements collected from design rather than validation.</b> The people who will debug the silicon know what they need to see; the people who built it usually assume it works.',
      '<b>Trace bandwidth inadequate.</b> A trace port too narrow to capture the event of interest produces a debug capability that cannot answer the question.',
      '<b>Debug lost in sleep.</b> A debug session that drops whenever the part enters deep sleep cannot observe the wake failures that matter most, so the debug path has to hold the part awake or survive the power-down.',
      '<b>Debug infrastructure unverified.</b> It is used first when the chip is misbehaving, which is the worst moment to discover the debug path is broken.',
      '<b>No documentation.</b> A capability the lab does not know exists is a capability that was not built.',
    ],
    entry: [
      'Debug requirements collected from validation and the compiler debugger team',
      'Access network architecture from DFT-03',
      'Pin budget known from ARCH-08',
    ],
  },

  'DFT-05': {
    purpose: [
      'Architect <b>memory test and repair</b>—MBIST engines, BIRA analysis, BISR repair and the fuse path—for a design whose memories are SRAM, eMRAM and the small local memories replicated in every fabric tile.',
      'The arrays cannot be tested by scan. MBIST is how they are tested and repair is how the yield is recovered, and the eMRAM does not behave like SRAM: its test runs write-verify and trim loops, and its repair works alongside its ECC. For the eMRAM both have to be designed jointly with <code>MRAM-06</code>, because the macro provides the spares, the ECC and the trim registers and this activity provides the engine that uses them.',
    ],
    flowNote:
      'Step 6 is the joint decision with the eMRAM team in MRAM-06 and the memory compiler owner. Both sides can specify an internally consistent repair scheme that the other cannot implement, and writing the interface together is the only reliable way to avoid it.',
    consumes: [
      'SRAM instances from PDK-05 and eMRAM macro views from MRAM-05',
      'eMRAM redundancy, ECC and trim scheme from MRAM-02 and MRAM-06',
      'Fuse map and lifecycle from ARCH-05',
      'Coverage targets from DFT-02',
      'Repair yield expectations from the yield model',
    ],
    risks: [
      '<b>Repair interface specified separately from the array.</b> Two consistent specifications that disagree, found at pattern generation when both are frozen.',
      '<b>Algorithms chosen without the failure modes.</b> March algorithms differ in what they catch, and eMRAM fails in ways SRAM does not—write errors, read disturb, marginal resistance—so a default SRAM choice misses the defect modes this array actually exhibits.',
      '<b>Fuse capacity insufficient.</b> Repair data has to be stored, and an allocation made without counting the worst-case repair set produces unrepairable parts.',
      '<b>MBIST runtime unbudgeted.</b> eMRAM test, with its write-verify and trim loops, runs far slower than SRAM test and can dominate test time, and it is often costed after the architecture is fixed.',
      '<b>Repair not verified end to end.</b> A repair path proven in pieces and never exercised from failure through analysis to fuse blow fails at production test.',
    ],
    roles: [
      { r: 'DFT memory lead', d: 'Owns MBIST, BIRA and BISR architecture' },
      { r: 'eMRAM and memory IP engineers', d: 'Redundancy, ECC and repair interface' },
      { r: 'Fuse and lifecycle engineer', d: 'Fuse path and capacity' },
      { r: 'Test engineering liaison', d: 'MBIST runtime and repair flow at ATE' },
      { r: 'Verification engineer', d: 'Repair path end-to-end verification' },
    ],
    entry: [
      'Memory inventory available from PDK-05',
      'eMRAM repair and trim scheme from MRAM-06 in progress',
      'Fuse map and lifecycle model from ARCH-05',
    ],
    terms: ['DFT', 'MBIST', 'BIRA', 'BISR', 'SRAM', 'eMRAM', 'ECC', 'ATE'],
  },

  'DFT-06': {
    purpose: [
      'Design the <b>on-chip clock controllers</b> that generate at-speed test clocks—because transition-fault testing needs launch-capture pulses from the clocks the part actually runs on.',
      'Stuck-at testing runs slowly and catches static defects. Timing-related defects escape it even at the modest clock rates of an embedded part, and catching them needs launch-capture pulses at functional speed from the on-chip PLL. The tester cannot produce them with the right timing relationship to the logic, so the chip has to produce them for itself.',
    ],
    risks: [
      '<b>At-speed test not supported on every domain.</b> Coverage then has a hole exactly where the fastest logic is, which is where transition defects concentrate.',
      '<b>Cross-domain paths untested at speed.</b> These are among the most timing-marginal paths in the design and the hardest to cover.',
      '<b>OCC interaction with the PLL unverified.</b> A controller that cannot get a clean clock from the PLL in test mode produces patterns that fail on good silicon.',
      '<b>Power during at-speed test ignored.</b> Scan shift followed by at-speed capture creates switching activity far above functional, on a power grid sized for a low-power part, and the IR drop can cause failures on good parts.',
      '<b>OCC inserted late.</b> It sits in the clock path, so adding it after clock tree synthesis means redoing the tree.',
    ],
  },

  'DFT-07': {
    purpose: [
      'Build the <b>fuse and identity infrastructure</b>—eFuse arrays, chip ID, repair storage, trim storage, lifecycle state—that repair, trim, traceability and security all depend on.',
      'Fuses are written once and read forever. They store memory repair, trim values for the regulators, oscillators and eMRAM reference, chip identity and lifecycle state, and every one of those consumers has its own requirements. Some data can live in a protected eMRAM region instead, but not what the eMRAM needs in order to read itself: its own repair and trim have to be readable before it is. Getting the capacity or the read path wrong produces parts that cannot be repaired, trimmed, identified or secured.',
    ],
    consumes: [
      'Repair storage requirement from DFT-05 and MRAM-06',
      'Trim requirements from PMU-03 and MRAM-02',
      'Lifecycle and security states from ARCH-05',
      'Traceability requirements from MP-12',
      'eFuse capability from PDK-02',
    ],
    risks: [
      '<b>Capacity sized to the average repair need.</b> Repair need is a distribution, and the parts needing most repair are exactly the ones the allocation fails.',
      '<b>Programming path untested.</b> Fuses are one-time; a programming path that does not work correctly produces parts that are permanently wrong.',
      '<b>Fuse read timing in the boot path unconsidered.</b> Repair and trim values have to be distributed before the logic that uses them is released from reset.',
      '<b>Trim reload on wake not designed.</b> Shadow registers in a domain that powers down lose their trim and repair values, and a wake path that does not reload them runs the regulators and the eMRAM untrimmed.',
      '<b>Traceability scheme designed late.</b> Chip identity is needed for yield analysis and field returns, and retrofitting it means parts that cannot be traced.',
      '<b>Lifecycle encoding without a test path.</b> A lifecycle transition that cannot be exercised in test is a transition whose correctness is unknown until the field.',
    ],
    terms: ['DFT', 'MBIST', 'BISR', 'JTAG', 'IJTAG', 'ID', 'eMRAM'],
  },
};
