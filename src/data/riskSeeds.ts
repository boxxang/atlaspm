/**
 * The risks a seeded programme is carrying, one per stage.
 *
 * A risk is a flag on a step now, so these are not board entries somebody typed
 * in the abstract — each one is raised on the step where the work actually
 * stopped, and it closes when that step is handed over.
 *
 * Which stages are stuck depends on when the seed runs (the kickoff is relative
 * to the day), so there is one written for every stage rather than a fixed list
 * of six. Each is the sentence a TPM would put in the thread: what is wrong,
 * and what it costs if it stays wrong.
 *
 * Pure content. Not generated — these are written, unlike the activity
 * write-ups, because they are about this programme rather than about the
 * template.
 */
export const riskSeeds: Record<string, string> = {
  productDefinition:
    'Two lead customers have not signed off the workload list, so the KPI targets the PPA budget is built on are still provisional. If they move after architecture freeze the whole budget reopens.',
  architecture:
    'The NoC bandwidth model assumes a memory controller latency nobody has measured. If it comes back 15% worse the partitioning has to change, and that lands after RTL has started.',
  technology:
    'The foundry has not confirmed capacity for our mask slot. The fallback node changes the PPA case and the cost model, and we cannot hold both plans past the design freeze.',
  pdk: 'PDK 2.1 has slipped a month. We are running 2.0 decks and three of the DRC rules we depend on are known to change in 2.1, so some of the checking done now will have to be redone.',
  ipReadiness:
    'The PCIe PHY vendor will not commit to a silicon-proven release before RTL freeze. The soft-IP fallback costs area and power we have not budgeted.',
  amsIp:
    'SerDes closure at the hot corner needs a CTLE respin. There is no room for one before the macro handoff, so integration would start against a macro we expect to change.',
  testChip:
    'The MPW shuttle date moved two weeks. The test chip results now arrive after the point where they could still change the design, which makes the shuttle a measurement rather than a decision.',
  rtl: 'Two blocks are still built against an interface spec that has since been revised. The mismatch will not surface until integration, which is the most expensive place to find it.',
  verification:
    'Coverage closure is behind on the coherency subsystem, and there are no directed tests for the hazard cases. We would be signing off on a coverage number that does not cover the hard part.',
  dft: 'Scan compression is below target and the pattern count will not fit the tester time budget. Either the compression improves or the per-unit test cost goes up.',
  synthesis:
    'The netlist is missing its timing budget on the two clock domains that cross the fabric boundary. The fix is either a floorplan change or a pipeline stage, and both are expensive this late.',
  physicalDesign:
    'Crosstalk on the high-speed routes is worse than the model predicted. The fix is spacing, and the floorplan has no room for it without moving a macro.',
  signoff:
    'IR drop at the worst-case corner is over budget. The PDN change that fixes it reaches back into the floorplan, so this is not a signoff-local problem.',
  tapeout:
    'The mask order needs a frozen database and two ECOs are still open against the final turn. Every day they stay open is a day the mask slot is at risk.',
  fabrication:
    'The wafer start is committed, but the foundry has flagged a chamber requalification that could add two weeks. We have no float between fab out and the bring-up window.',
  packageDesign:
    'The substrate needs one more layer than the assembly house quoted. Both the cost model and the lead time move, and the lead time is the one that hurts.',
  packageTestVehicle:
    'The CPI test vehicle has not been built, so the warpage numbers the assembly window is based on are simulation only. If measurement disagrees, the window moves.',
  chipPackageCoVerification:
    'The package model and the die model disagree at the interface. The co-simulation cannot be trusted until they are aligned, and everything downstream is reading its results.',
  packaging:
    'Assembly capacity for the first build is not booked, and the window we want overlaps a planned shutdown. Booking late means taking whatever slot is left.',
  validationHardware:
    'The EVB boards are late from the contract manufacturer. Silicon is not moving, so the whole delay comes out of the validation window.',
  testDevelopment:
    'ATE program development is behind on the analog blocks and tester time is booked from a fixed date. Unused tester time is paid for either way.',
  bringup:
    'Bring-up assumes a working debug path, and the JTAG chain was never validated on the test chip. If it is broken on first silicon we are debugging blind.',
  qualification:
    'HTOL slots are shared with another programme. Losing the slot pushes qualification past the ramp date, and the ramp date is the one customers were given.',
};

/** Who raises them in the seeded programme — the TPM whose tool this is. */
export const RISK_AUTHOR = 'Sangwook Park';
