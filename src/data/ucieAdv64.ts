/**
 * /data/ucieAdv64.ts — the UCIe Advanced 64G Die-to-Die PHY IP template.
 *
 * An IP program rather than a chip program: a die-to-die PHY for UCIe
 * Advanced packages at 64 GT/s — D2D Adapter, Logical PHY and sideband,
 * Electrical PHY, bumps and channel — proven on a test chip and released to
 * the customers who integrate it, from concept to production release and
 * sustaining.
 *
 * Built the way the CPO template is (see /data/cpoSwitch): the skeleton fixes
 * the stages, weeks, gates, activity titles, owners, windows and items; each
 * stage module under /data/ucieAdv64/stages writes the steps, outputs,
 * deliverables and prose; this module puts the two together in the shape
 * every other template has. Authored by hand, generic, held to the same
 * invariants — see tests/unit/ucieAdv64.test.ts.
 */
import type { ActivityStepEntry } from './activitySteps';
import { UCIE_SKELETON, type UcieItem, type UcieStageSkeleton } from './ucieAdv64/skeleton';
import type { UcieStageModule } from './ucieAdv64/types';
import { UCIE_STAGE_MODULES } from './ucieAdv64/stages';
import type { JourneyStage, MilestoneDef, ProfileStageDef, ScheduleProfile } from './types';

export { UCIE_SKELETON };

/** A UCIe stage's content: journey's shape, with the aligned arrays required. */
export type UcieStage = JourneyStage &
  Required<Pick<JourneyStage, 'engineeringStart' | 'deliverableFrom' | 'deliverableWeek'>>;

export const UCIE_PROFILE_ID = 'ucieAdv64';

/** Stage numbers on the roadmap, after every other template's. */
const STAGE_NUMBER_BASE = 200;

const moduleOf = (s: UcieStageSkeleton): UcieStageModule | undefined => UCIE_STAGE_MODULES[s.prefix];

/** An activity entry, plus the block it is work on — what an item filter reads. */
export type UcieActivityEntry = ActivityStepEntry & { item: UcieItem };

/** Every activity, in stage order and, inside a stage, in the order it runs them. */
export const UCIE_ACTIVITIES: Record<string, UcieActivityEntry> = Object.fromEntries(
  UCIE_SKELETON.flatMap((st) =>
    st.activities.map((sk): [string, UcieActivityEntry] => {
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

export const UCIE_ACTIVITY_TITLES: Record<string, string> = Object.fromEntries(
  UCIE_SKELETON.flatMap((st) => st.activities.map((sk) => [sk.ref, sk.title])),
);

export const UCIE_STAGES: readonly UcieStage[] = UCIE_SKELETON.map((st, i): UcieStage => {
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

/** Each deliverable's reference tag: UARC-D3 is the architecture stage's third. */
export const UCIE_DELIVERABLES: Record<string, string> = Object.fromEntries(
  UCIE_STAGES.flatMap((s) => s.deliverables.map((title, i) => [`${s.shortTitle}-D${i + 1}`, title])),
);

/** One gate per stage, at its end — the dates the program is held to. */
export const UCIE_MILESTONES: readonly MilestoneDef[] = UCIE_SKELETON.map((st) => ({
  id: st.gate.id,
  label: st.gate.label,
  anchor: { stage: st.key, at: 'end' as const },
  ...(st.gate.major ? { major: true } : {}),
}));

/**
 * The stages whose ends the countdowns read. An IP program has no production:
 * its third date is production release, read under the shared key.
 */
export const UCIE_COUNTDOWN_KEYS = {
  tapeout: 'ucieTapeout',
  firstSilicon: 'ucieFab',
  production: 'ucieGa',
} as const;

/**
 * The stages ordered by when they start — the order is the chart's y-axis, so
 * a reader scanning down reads the program forwards.
 */
export const UCIE_PROFILE: ScheduleProfile = {
  id: UCIE_PROFILE_ID,
  label: 'UCIe Advanced 64G Die-to-Die PHY IP',
  builtin: true,
  template: true,
  stages: [...UCIE_SKELETON]
    .sort((x, y) => x.start - y.start || UCIE_SKELETON.indexOf(x) - UCIE_SKELETON.indexOf(y))
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
