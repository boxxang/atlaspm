/**
 * /data/scheduleProfiles.ts
 * Baseline profiles are immutable code — StageOverride is the only schedule
 * mutation surface (see CLAUDE.md). Ported 1:1 from the prototype.
 */
import type { LifecyclePhase, MilestoneDef, ScheduleProfile, StageId } from './types';

/** Chronological stage order — drives the ripple in applyDateEdit(). */
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

export type ProfileId = keyof typeof scheduleProfiles;

export const scheduleProfiles = {
  typicalSoC: {
    id: "typicalSoC",
    label: "Typical SoC",
    stages: {
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
    },
  },
} satisfies Record<string, ScheduleProfile>;
export const milestoneDefs = [
  { id: "archFreeze",     label: "Arch Freeze",     anchor: { stage: "architecture",  at: "end" } },
  { id: "rtlFreeze",      label: "RTL Freeze",      anchor: { stage: "rtl",           at: "end" } },
  { id: "dvClosure",      label: "DV Closure",      anchor: { stage: "verification",  at: "end" } },
  { id: "designFreeze",   label: "Design Freeze",   anchor: { stage: "signoff",       at: "end" } },
  { id: "tapeout",        label: "Tapeout",         anchor: { stage: "tapeout",       at: "end" }, major: true },
  { id: "firstSilicon",   label: "First Silicon",   anchor: { stage: "fabrication",   at: "end" }, major: true },
  { id: "massProduction", label: "Mass Production", anchor: { stage: "qualification", at: "end" }, major: true },
] satisfies readonly MilestoneDef[];
export const lifecyclePhases = [
  { id: "define",       label: "Define",          stages: ["productDefinition", "architecture"] },
  { id: "designVerify", label: "Design & Verify", stages: ["rtl", "verification"] },
  { id: "implement",    label: "Implement",       stages: ["synthesis", "physicalDesign", "signoff"] },
  { id: "manufacture",  label: "Manufacture",     stages: ["tapeout", "fabrication"] },
  { id: "integrate",    label: "Integrate",       stages: ["packaging"] },
  { id: "validateRamp", label: "Validate & Ramp", stages: ["bringup", "qualification"] },
] satisfies readonly LifecyclePhase[];
/** Stage → the milestone anchored to its end, if any. */
export const stageMilestone: Partial<Record<StageId, MilestoneDef>> = {};
for (const m of milestoneDefs) {
  if (m.anchor.at === 'end') stageMilestone[m.anchor.stage] = m;
}

/** Stage → its lifecycle phase, plus that phase's index. */
export const phaseOfStage = {} as Record<StageId, LifecyclePhase & { index: number }>;
lifecyclePhases.forEach((p, index) => {
  for (const s of p.stages) phaseOfStage[s] = { ...p, index };
});
