/**
 * /data/scheduleProfiles.ts
 * The built-in profile: 23 stages, generated from docs/stage-template-v2.json.
 * It is the seed for the `Profile` / `ProfileStage` rows and stays immutable —
 * editing a program's stages forks a copy (see /lib/profiles.ts). StageOverride
 * remains the only per-program schedule mutation surface (CLAUDE.md).
 */
import { journeyData } from './journey';
import type { LifecyclePhase, MilestoneDef, ScheduleProfile, StageId } from './types';

/** Chronological order of the built-in stages. */
export const STAGE_ORDER = [
  'productDefinition',
  'architecture',
  'technology',
  'pdk',
  'ipReadiness',
  'amsIp',
  'testChip',
  'rtl',
  'verification',
  'dft',
  'synthesis',
  'physicalDesign',
  'signoff',
  'tapeout',
  'fabrication',
  'packageDesign',
  'packageTestVehicle',
  'chipPackageCoVerification',
  'packaging',
  'validationHardware',
  'testDevelopment',
  'bringup',
  'qualification',
] as const satisfies readonly StageId[];

/**
 * Baselines of the built-in stages, in weeks from kickoff. The span is 132
 * weeks: a new architecture on a leading node with 2.5D packaging, benchmarked
 * against reported schedule anchors in docs/stage-template-v2.html.
 */
const BASELINES: Record<string, { startOffsetWeeks: number; durationWeeks: number }> = {
  productDefinition: { startOffsetWeeks: 0, durationWeeks: 8 },
  architecture: { startOffsetWeeks: 6, durationWeeks: 18 },
  technology: { startOffsetWeeks: 0, durationWeeks: 14 },
  pdk: { startOffsetWeeks: 8, durationWeeks: 36 },
  ipReadiness: { startOffsetWeeks: 4, durationWeeks: 22 },
  amsIp: { startOffsetWeeks: 18, durationWeeks: 42 },
  testChip: { startOffsetWeeks: 22, durationWeeks: 40 },
  rtl: { startOffsetWeeks: 20, durationWeeks: 32 },
  verification: { startOffsetWeeks: 26, durationWeeks: 40 },
  dft: { startOffsetWeeks: 18, durationWeeks: 40 },
  synthesis: { startOffsetWeeks: 42, durationWeeks: 24 },
  physicalDesign: { startOffsetWeeks: 46, durationWeeks: 30 },
  signoff: { startOffsetWeeks: 62, durationWeeks: 16 },
  tapeout: { startOffsetWeeks: 78, durationWeeks: 8 },
  fabrication: { startOffsetWeeks: 79, durationWeeks: 19 },
  packageDesign: { startOffsetWeeks: 24, durationWeeks: 52 },
  packageTestVehicle: { startOffsetWeeks: 36, durationWeeks: 52 },
  chipPackageCoVerification: { startOffsetWeeks: 50, durationWeeks: 26 },
  packaging: { startOffsetWeeks: 98, durationWeeks: 8 },
  validationHardware: { startOffsetWeeks: 52, durationWeeks: 38 },
  testDevelopment: { startOffsetWeeks: 54, durationWeeks: 42 },
  bringup: { startOffsetWeeks: 102, durationWeeks: 18 },
  qualification: { startOffsetWeeks: 106, durationWeeks: 26 },
};

/**
 * The checkpoints a TPM is held to — fifteen of them, one per decision the
 * program cannot walk back. Engineering runs on many more gates than these
 * (DFT architecture, co-verification signoff, package validation); they belong
 * to the stage that owns them, not to the program's checkpoint list.
 */
export const milestoneDefs = [
  { id: "archFreeze", label: "Arch Freeze", anchor: { stage: "architecture", at: "end" } },
  { id: "pdk10Release", label: "PDK 1.0 Release", anchor: { stage: "pdk", at: "end" } },
  { id: "ipPlanFreeze", label: "IP Plan Freeze", anchor: { stage: "ipReadiness", at: "end" } },
  { id: "amsMacroHandoff", label: "AMS Macro Handoff", anchor: { stage: "amsIp", at: "end" } },
  { id: "testChipSilicon", label: "Test Chip Silicon", anchor: { stage: "testChip", at: "end" } },
  { id: "rtlFreeze", label: "RTL Freeze", anchor: { stage: "rtl", at: "end" } },
  { id: "dvClosure", label: "DV Closure", anchor: { stage: "verification", at: "end" } },
  { id: "ffnRelease", label: "FFN Release", anchor: { stage: "synthesis", at: "end" } },
  { id: "designFreeze", label: "Design Freeze", anchor: { stage: "signoff", at: "end" } },
  { id: "tapeoutBeolMto", label: "Tapeout (BEOL MTO)", anchor: { stage: "tapeout", at: "end" }, major: true },
  { id: "firstSilicon", label: "First Silicon", anchor: { stage: "fabrication", at: "end" }, major: true },
  { id: "packageDesignFreeze", label: "Package Design Freeze", anchor: { stage: "packageDesign", at: "end" } },
  { id: "evbReady", label: "EVB Ready", anchor: { stage: "validationHardware", at: "end" } },
  { id: "probeCardReady", label: "Probe Card Ready", anchor: { stage: "testDevelopment", at: "end" } },
  { id: "massProduction", label: "Mass Production", anchor: { stage: "qualification", at: "end" }, major: true },
] satisfies readonly MilestoneDef[];

/**
 * The roadmap's bands. A stage names the one it sits under. `enable` carries the
 * workstreams that must exist before design can start — technology selection,
 * PDK, IP readiness, custom IP, test chip.
 */
export const lifecyclePhases = [
  { id: 'define',       label: 'Define' },
  { id: 'enable',       label: 'Technology & IP Enablement' },
  { id: 'designVerify', label: 'Design & Verify' },
  { id: 'implement',    label: 'Implement' },
  { id: 'manufacture',  label: 'Manufacture' },
  { id: 'integrate',    label: 'Integrate' },
  { id: 'validateRamp', label: 'Validate & Ramp' },
] satisfies readonly LifecyclePhase[];

/** Which band each built-in stage sits under. */
const PHASE_OF: Record<string, string> = {
  productDefinition: 'define',
  architecture: 'define',
  technology: 'enable',
  pdk: 'enable',
  ipReadiness: 'enable',
  amsIp: 'enable',
  testChip: 'enable',
  rtl: 'designVerify',
  verification: 'designVerify',
  dft: 'designVerify',
  synthesis: 'implement',
  physicalDesign: 'implement',
  signoff: 'implement',
  tapeout: 'manufacture',
  fabrication: 'manufacture',
  packageDesign: 'integrate',
  packageTestVehicle: 'integrate',
  chipPackageCoVerification: 'integrate',
  packaging: 'integrate',
  validationHardware: 'validateRamp',
  testDevelopment: 'validateRamp',
  bringup: 'validateRamp',
  qualification: 'validateRamp',
};

export const phaseById = (id: string): LifecyclePhase =>
  lifecyclePhases.find((p) => p.id === id) ?? lifecyclePhases[0];

/** Stage → the milestone anchored to its end, if any. */
export const stageMilestone: Record<string, MilestoneDef> = {};
for (const m of milestoneDefs) {
  if (m.anchor.at === 'end') stageMilestone[m.anchor.stage] = m;
}

/** The one profile that ships with the app; every other profile is forked. */
export const BUILTIN_PROFILE: ScheduleProfile = {
  id: 'typicalSoC',
  label: 'Typical SoC',
  builtin: true,
  template: true,
  stages: STAGE_ORDER.map((key, i) => {
    const content = journeyData.find((s) => s.id === key)!;
    return {
      key,
      order: i,
      title: content.title,
      shortTitle: content.shortTitle,
      phaseId: PHASE_OF[key],
      baseKey: key,
      ...BASELINES[key],
    };
  }),
};

export const scheduleProfiles = { typicalSoC: BUILTIN_PROFILE };
export type ProfileId = string;
