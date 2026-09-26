import type { WriteUpEdit } from './types';

/** TO: the SoC write-ups, where the embedded programme says otherwise. Keyed by SoC reference. */
export const TO_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  'TO-01': {
    purpose: [
      'Assemble the <b>final GDSII or OASIS database</b> from the closed design—every block, every macro, the boot ROM contents, every layer—and verify that the layer map the foundry will read matches the one the design was built with.',
      'This is a mechanical activity with no tolerance for error. A layer misassigned in the stream-out produces masks that are wrong in a way no verification would have caught, because the design was correct and the translation was not.',
    ],
    consumes: [
      'Frozen signoff database from EPD-13 and EPD-10',
      'Hard macro GDS from MRAM-05 and PMU-05',
      'Boot ROM image frozen by SDK-01',
      'Foundry layer map and stream-out rules',
      'Chip finishing from EPD-14',
      'Signoff clean status from ESO-04',
    ],
    risks: [
      '<b>Layer map mismatch.</b> A misassigned layer produces masks that are wrong in a way no design verification would have found.',
      '<b>Macro GDS from the wrong version.</b> An abstract that matched and a layout that did not is discovered at LVS, or worse, not at all.',
      '<b>Stream-out from an unfrozen database.</b> The design has to stop moving before it is streamed, or the streamed version is not the signed-off one.',
      '<b>No checksum.</b> Without one, the question "is this the database we signed off" has no answer.',
      '<b>ROM contents not the frozen boot ROM.</b> The boot code goes into the masks; a ROM image merged from anything but the <code>SDK-01</code> release tag is a bug no later software can reach.',
    ],
    exit: [
      'Layer map verified against the foundry\'s definition, not the internal one',
      'Every macro GDS and the boot ROM image traced to its released version',
      'Database checksummed and recorded',
    ],
    measuredBy: [
      'Layer map discrepancies found',
      'Macro versions and the ROM image traced to release',
      'Stream-out reruns required',
    ],
    terms: ['IP', 'LVS', 'GDS', 'OASIS', 'CAD', 'GDSII', 'ROM'],
  },

  'TO-02': {
    risks: [
      '<b>Skipped because signoff was clean.</b> Signoff checked a different database, and the difference between them is exactly what this run exists to catch.',
      '<b>Run on the signoff database rather than the released one.</b> That repeats the earlier check and proves nothing new.',
      '<b>Compute capacity unavailable.</b> A full-chip run on this die takes hours rather than days, and it still has to be scheduled, not requested on the day.',
      '<b>New violations discovered with no time to fix.</b> Which is why <code>ESO-04</code> has to close cleanly rather than nearly.',
      '<b>Checksums not compared.</b> Verifying one file and releasing another is a documented failure mode with a trivial defense.',
    ],
  },

  'TO-03': {
    consumes: [
      'Signoff results from ESO-03 through ESO-10',
      'DFT signoff from EDFT-11',
      'DV closure from EDV-03',
      'FPGA verification signoff from FPV-06',
      'Boot ROM freeze from SDK-01',
      'Verification results from ETO-02',
      'Waiver dispositions from ESO-11',
    ],
    risks: [
      '<b>Entries ticked without evidence.</b> A checklist of assertions is a ritual, and it produces confidence rather than information.',
      '<b>Signoff by proxy.</b> An entry signed by someone other than the accountable owner has moved the signature without moving the accountability.',
      '<b>Checklist assembled at tapeout.</b> It should be maintained across the program; assembling it in the last week means discovering gaps with no time to close them.',
      '<b>Domains missing from the checklist.</b> Test, package, FPGA verification and boot ROM entries are easy to omit from a design-centred checklist and expensive to miss—the boot ROM goes into the masks with everything else.',
      '<b>Gaps escalated too late.</b> An unsigned entry three days before the Go / No-Go is a decision the meeting cannot take.',
    ],
    roles: [
      { r: 'Program manager', d: 'Owns the checklist and the signoff matrix' },
      { r: 'Domain owners', d: 'Sign their own entries with evidence' },
      { r: 'Signoff lead', d: 'Design-side evidence' },
      { r: 'DFT and test leads', d: 'Test-side entries' },
      { r: 'FPGA verification and firmware leads', d: 'FPGA signoff and boot ROM freeze entries' },
    ],
  },

  'TO-04': {
    flowNote:
      'Step 3 is what gives the Go / No-Go meeting something to decide. An item with a mitigation—a test screen, a workaround in the SDK or the compiler, a bin split—is a different decision from one without, and identifying which is which is this activity\'s contribution.',
    consumes: [
      'Open bug list and risk statement from EDV-03',
      'Open FPGA findings from FPV-05 and FPV-06',
      'Waiver register from ESO-11',
      'Test coverage gaps from EDFT-10',
      'Package and assembly open items from EPKG-06',
      'Program risk register',
    ],
    entry: [
      'Bug and waiver lists available from EDV-03 and ESO-11',
      'FPGA findings available from FPV-05, and test and package open items collected',
      'Risk classification scheme agreed',
    ],
  },

  'TO-05': {
    purpose: [
      'Hold the <b>Go / No-Go decision</b>—the moment the program commits a mask set and the five months to first engineering samples to the design as it stands.',
      'Half a week of activity and under a man-month, preceded by the preparation in ETO-03 and ETO-04. That ratio is correct: a gate argued in the room rather than before it is a gate whose outcome depends on who attended. The meeting exists to take a decision, record its conditions and name who owns them.',
    ],
    consumes: [
      'Tapeout checklist from ETO-03',
      'Risk acceptance record from ETO-04',
      'Verification results from ETO-02',
      'FPGA verification signoff from FPV-06',
      'Frozen boot ROM from SDK-01',
      'Foundry readiness from ETECH-07',
      'Program schedule position from EDEF-08',
    ],
    entry: [
      'Checklist complete with signatures from ETO-03',
      'Risk acceptance record available from ETO-04',
      'FPGA verification signed off in FPV-06 and the boot ROM frozen in SDK-01',
      'Decision pack circulated in advance',
    ],
  },

  'TO-07': {
    consumes: [
      'Released database from ETO-01',
      'Late findings from the FPGA prototype, verification and signoff',
      'Spare cell and metal-only strategy from EPD-08',
      'Go / No-Go conditions from ETO-05',
      'Equivalence methodology from ESO-09',
    ],
  },

  'TO-08': {
    purpose: [
      'Confirm the <b>FEOL mask order</b> and get a mask shop schedule the program can plan wafer start against.',
      'Under a man-month of administration that fixes a date the whole downstream schedule hangs on. Mask writing takes weeks, and knowing when the FEOL set will be ready is what tells <code>EFAB-05</code> when wafers can start.',
    ],
  },

  'TO-10': {
    purpose: [
      'Prepare and release the <b>back-end layer data</b>—the second mask tapeout, and the moment the design is fully committed to silicon.',
      'BEOL release is the real tapeout. After it nothing about the design can change without a new mask set, and the milestone the program has been working toward for more than seventy weeks is this submission being accepted.',
    ],
  },
};
