/**
 * /data/scheduleProfiles.ts
 * The built-in profile, ported 1:1 from the prototype. It is the seed for the
 * `Profile` / `ProfileStage` rows and stays immutable — editing a program's
 * stages forks a copy (see /lib/profiles.ts). StageOverride remains the only
 * per-program schedule mutation surface (CLAUDE.md).
 */
import { journeyData } from './journey';
import type { LifecyclePhase, MilestoneDef, ScheduleProfile, StageId } from './types';

/** Chronological order of the built-in stages. */
export const STAGE_ORDER = [
  'productDefinition',
  'architecture',
  'rtl',
  'verification',
  'synthesis',
  'physicalDesign',
  'signoff',
  'tapeout',
  'fabrication',
  'packaging',
  'bringup',
  'qualification',
] as const satisfies readonly StageId[];

/** Baselines of the built-in stages, in weeks from kickoff. */
const BASELINES: Record<string, { startOffsetWeeks: number; durationWeeks: number }> = {
  productDefinition: { startOffsetWeeks: 0,  durationWeeks: 4  },
  architecture:      { startOffsetWeeks: 3,  durationWeeks: 6  },
  rtl:               { startOffsetWeeks: 7,  durationWeeks: 12 },
  verification:      { startOffsetWeeks: 10, durationWeeks: 16 },
  synthesis:         { startOffsetWeeks: 20, durationWeeks: 4  },
  physicalDesign:    { startOffsetWeeks: 22, durationWeeks: 12 },
  signoff:           { startOffsetWeeks: 31, durationWeeks: 6  },
  tapeout:           { startOffsetWeeks: 37, durationWeeks: 1  },
  fabrication:       { startOffsetWeeks: 38, durationWeeks: 8  },
  packaging:         { startOffsetWeeks: 46, durationWeeks: 4  },
  bringup:           { startOffsetWeeks: 50, durationWeeks: 6  },
  qualification:     { startOffsetWeeks: 54, durationWeeks: 12 },
};

export const milestoneDefs = [
  { id: "archFreeze",     label: "Arch Freeze",     anchor: { stage: "architecture",  at: "end" } },
  { id: "rtlFreeze",      label: "RTL Freeze",      anchor: { stage: "rtl",           at: "end" } },
  { id: "dvClosure",      label: "DV Closure",      anchor: { stage: "verification",  at: "end" } },
  { id: "designFreeze",   label: "Design Freeze",   anchor: { stage: "signoff",       at: "end" } },
  { id: "tapeout",        label: "Tapeout",         anchor: { stage: "tapeout",       at: "end" }, major: true },
  { id: "firstSilicon",   label: "First Silicon",   anchor: { stage: "fabrication",   at: "end" }, major: true },
  { id: "massProduction", label: "Mass Production", anchor: { stage: "qualification", at: "end" }, major: true },
] satisfies readonly MilestoneDef[];

/** The roadmap's bands. A stage names the one it sits under. */
export const lifecyclePhases = [
  { id: "define",       label: "Define" },
  { id: "designVerify", label: "Design & Verify" },
  { id: "implement",    label: "Implement" },
  { id: "manufacture",  label: "Manufacture" },
  { id: "integrate",    label: "Integrate" },
  { id: "validateRamp", label: "Validate & Ramp" },
] satisfies readonly LifecyclePhase[];

/** Which band each built-in stage sits under. */
const PHASE_OF: Record<string, string> = {
  productDefinition: 'define',
  architecture: 'define',
  rtl: 'designVerify',
  verification: 'designVerify',
  synthesis: 'implement',
  physicalDesign: 'implement',
  signoff: 'implement',
  tapeout: 'manufacture',
  fabrication: 'manufacture',
  packaging: 'integrate',
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
