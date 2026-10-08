/**
 * /data/cpoSwitch.ts — the CPO Network Switch System template.
 *
 * An end-to-end program for a switch whose optics are co-packaged with the
 * switching silicon: the switch ASIC and the high-speed I/O silicon beside
 * it, the electrical and photonic ICs of the optical engines, the optical
 * source, the bridge or interposer and silicon capacitors, the advanced
 * package and its fiber, the board, the cooling, the firmware and software,
 * and the factory that assembles, calibrates and tests it — from concept to
 * production and sustaining.
 *
 * Stages are the lifecycle, not the parts (see /data/cpoSwitch/skeleton):
 * each closes on a gate every workstream reaches together, and the
 * components run as parallel activities inside them. The skeleton fixes the
 * stages, weeks, gates, activity titles, owners and windows; each stage
 * module under /data/cpoSwitch/stages writes the steps, outputs,
 * deliverables and prose; this module puts the two together in the shape
 * every other template has. Authored by hand, generic, held to the same
 * invariants as the other templates — see tests/unit/cpoSwitch.test.ts.
 */
import type { ActivityStepEntry } from './activitySteps';
import { CPO_SKELETON, type CpoItem, type CpoStageSkeleton } from './cpoSwitch/skeleton';
import type { CpoStageModule } from './cpoSwitch/types';
import { CPO_STAGE_MODULES } from './cpoSwitch/stages';
import type { JourneyStage, MilestoneDef, ProfileStageDef, ScheduleProfile } from './types';

export { CPO_SKELETON };

/** A CPO stage's content: journey's shape, with the aligned arrays required. */
export type CpoStage = JourneyStage &
  Required<Pick<JourneyStage, 'engineeringStart' | 'deliverableFrom' | 'deliverableWeek'>>;

export const CPO_PROFILE_ID = 'cpoSwitch';

/** Stage numbers on the roadmap, after every other template's. */
const STAGE_NUMBER_BASE = 100;

const moduleOf = (s: CpoStageSkeleton): CpoStageModule | undefined => CPO_STAGE_MODULES[s.prefix];

/** An activity entry, plus the item it is work on — what an item filter reads. */
export type CpoActivityEntry = ActivityStepEntry & { item: CpoItem };

/** Every activity, in stage order and, inside a stage, in the order it runs them. */
export const CPO_ACTIVITIES: Record<string, CpoActivityEntry> = Object.fromEntries(
  CPO_SKELETON.flatMap((st) =>
    st.activities.map((sk): [string, CpoActivityEntry] => {
      const steps = moduleOf(st)?.steps[sk.ref];
      const o = steps?.o ?? [];
      return [
        sk.ref,
        {
          st: st.key,
          w: sk.w,
          s: steps?.s ?? [],
          o,
          ob: o.map((_, i) => i + 1),
          r: steps?.r ?? [],
          ro: sk.owner,
          item: sk.item,
        },
      ];
    }),
  ),
);

export const CPO_ACTIVITY_TITLES: Record<string, string> = Object.fromEntries(
  CPO_SKELETON.flatMap((st) => st.activities.map((sk) => [sk.ref, sk.title])),
);

export const CPO_STAGES: readonly CpoStage[] = CPO_SKELETON.map((st, i): CpoStage => {
  const c = moduleOf(st)?.content;
  return {
    id: st.key,
    stage: STAGE_NUMBER_BASE + i + 1,
    title: st.title,
    shortTitle: st.prefix,
    tagline: c?.tagline ?? '',
    description: c?.description ?? '',
    activities: c?.activities ?? [],
    deliverables: c?.deliverables ?? [],
    risks: c?.risks ?? [],
    potentialRisks: c?.potentialRisks ?? [],
    leader: c?.leader ?? { name: '', short: '', phone: '', email: '' },
    collaboration: c?.collaboration ?? [],
    tools: c?.tools ?? [],
    engineeringView: st.activities.map((a) => a.title),
    engineeringTat: st.activities.map((a) => a.w[1] - a.w[0]),
    engineeringEffort: c?.engineeringEffort ?? st.activities.map(() => 0),
    engineeringStart: st.activities.map((a) => a.w[0]),
    deliverableFrom: c?.deliverableFrom ?? [],
    deliverableWeek: c?.deliverableWeek ?? [],
    programView: c?.programView ?? [],
    perspective: c?.perspective ?? '',
  };
});

/** Each deliverable's reference tag: SARC-D3 is the architecture stage's third. */
export const CPO_DELIVERABLES: Record<string, string> = Object.fromEntries(
  CPO_STAGES.flatMap((s) => s.deliverables.map((title, i) => [`${s.shortTitle}-D${i + 1}`, title])),
);

/** One gate per stage, at its end — the dates the program is held to. */
export const CPO_MILESTONES: readonly MilestoneDef[] = CPO_SKELETON.map((st) => ({
  id: st.gate.id,
  label: st.gate.label,
  anchor: { stage: st.key, at: 'end' as const },
  ...(st.gate.major ? { major: true } : {}),
}));

/** The stages whose ends the countdowns read: tapeout, first silicon, production release. */
export const CPO_COUNTDOWN_KEYS = {
  tapeout: 'cpoTapeout',
  firstSilicon: 'cpoFabrication',
  production: 'cpoRamp',
} as const;

/**
 * The stages ordered by when they start — the order is the chart's y-axis, so
 * a reader scanning down reads the program forwards.
 */
export const CPO_PROFILE: ScheduleProfile = {
  id: CPO_PROFILE_ID,
  label: 'CPO Network Switch System',
  builtin: true,
  template: true,
  stages: [...CPO_SKELETON]
    .sort((x, y) => x.start - y.start || CPO_SKELETON.indexOf(x) - CPO_SKELETON.indexOf(y))
    .map(
      (st, order): ProfileStageDef => ({
        key: st.key,
        order,
        title: st.title,
        shortTitle: st.prefix,
        phaseId: st.band,
        baseKey: st.key,
        startOffsetWeeks: st.start,
        durationWeeks: st.dur,
      }),
    ),
};
