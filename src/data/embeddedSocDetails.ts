/**
 * /data/embeddedSocDetails.ts — the Embedded SoC's activities, written up.
 *
 * Server-only in practice, like /data/activityDetails.ts: the page that shows
 * one write-up reads it here, and the browser is never handed the prose.
 *
 * Two kinds, as the stages are:
 *
 *  - An authored activity (FCD-02, CMP-04, EVK-03 …) has a write-up of its
 *    own under /data/embeddedWriteUps, composed the way the 3DIC ones are.
 *  - A derived activity (EDEF-03, EPD-06 …) is the SoC write-up of the
 *    activity it derives from, with the fields the embedded programme words
 *    differently replaced (/data/embeddedWriteUpEdits), every reference moved
 *    onto the embedded programme (/data/embeddedWriteUpRefs), and its effort
 *    scaled to the man-months the embedded stage gives it.
 *
 * Either way, where the activity runs, its steps, what each step hands over
 * and which deliverables it relates to come from the activity entry — so the
 * page and the stage table cannot describe the same activity differently.
 */
import type { ActivityDetail, ActivityWriteUp, DetailEffort } from './activityDetailTypes';
import type { ActivityStepEntry } from './activitySteps';
import { activityDetail } from './activityDetails';
import { EMBEDDED_ACTIVITIES, EMBEDDED_STAGES } from './embeddedSoc';
import {
  EMBEDDED_DERIVED_ACTIVITIES,
  EMBEDDED_DERIVED_STAGES,
  socRefOf,
} from './embeddedSocDerived';
import { EMBEDDED_WRITE_UP_EDITS } from './embeddedWriteUpEdits';
import { toEmbeddedProse, toEmbeddedRefs } from './embeddedWriteUpRefs';
import { EMBEDDED_WRITE_UPS } from './embeddedWriteUps';

export { EMBEDDED_WRITE_UPS };

/** Terms the SoC write-ups offer that name hardware an embedded part lacks. */
const FOREIGN_TERMS = new Set([
  'HBM',
  'HBM3',
  'HBM3E',
  'PCIe',
  'CXL',
  'UCIe',
  'SerDes',
  'D2D',
  'CoWoS',
  'LLM',
  'FP8',
  'NoC',
  'VRM',
  'EUV',
  'MLPerf',
  'HPC',
  'CPM',
  'CPS',
  'SIPI',
  'PTV',
  'MTV',
  'TTV',
  'TIM',
]);

const fromEntry = (a: ActivityStepEntry) => ({
  stage: a.st,
  window: a.w,
  steps: a.s.map(([n, text, tat, par]) => ({ n, text, tat, lane: par ? ('par' as const) : ('main' as const) })),
  produces: a.o,
  producedBy: a.ob,
});

/** The man-months a stage gives one of its activities. */
const stageEffort = (id: string): number | undefined => {
  const a = EMBEDDED_DERIVED_ACTIVITIES[id] ?? EMBEDDED_ACTIVITIES[id];
  if (!a) return undefined;
  const stage = [...EMBEDDED_DERIVED_STAGES, ...EMBEDDED_STAGES].find((s) => s.id === a.st)!;
  const refs = Object.keys({ ...EMBEDDED_DERIVED_ACTIVITIES, ...EMBEDDED_ACTIVITIES }).filter(
    (r) => (EMBEDDED_DERIVED_ACTIVITIES[r] ?? EMBEDDED_ACTIVITIES[r]).st === a.st,
  );
  return stage.engineeringEffort[refs.indexOf(id)];
};

/**
 * The SoC split of an activity's man-months, scaled to the embedded figure.
 * Rounded to hundredths, with the rounding left on the largest line, so the
 * lines still add to exactly what the stage says.
 */
const scaleEffort = (effort: DetailEffort[], labels: string[] | undefined, total: number): DetailEffort[] => {
  const sum = effort.reduce((t, [, mm]) => t + mm, 0);
  const out: DetailEffort[] = effort.map(([label, mm], i) => [
    labels?.[i] ?? label,
    Math.round(((mm * total) / sum) * 100) / 100,
  ]);
  const drift = Math.round((total - out.reduce((t, [, mm]) => t + mm, 0)) * 100) / 100;
  if (drift) {
    const big = out.reduce((b, e, i) => (e[1] > out[b][1] ? i : b), 0);
    out[big] = [out[big][0], Math.round((out[big][1] + drift) * 100) / 100];
  }
  return out;
};

const derived = (id: string): ActivityDetail | undefined => {
  const a = EMBEDDED_DERIVED_ACTIVITIES[id];
  const socRef = a && socRefOf(id);
  const soc = socRef ? activityDetail(socRef) : undefined;
  if (!a || !socRef || !soc) return undefined;
  const e = EMBEDDED_WRITE_UP_EDITS[socRef] ?? {};
  /* the SoC corpus carries the odd stray space; the page prints what it gets */
  const tidy = (x: string) => toEmbeddedProse(x.replace(/\s+/g, ' ').replace(/ <\/b>/g, '</b>').trim());
  const prose = (xs: readonly string[]) => xs.map(tidy);
  const refs = (xs: readonly string[]) => toEmbeddedRefs(xs, id);
  return {
    ...fromEntry(a),
    criticalPath: soc.criticalPath,
    purpose: prose(e.purpose ?? soc.purpose),
    flowNote: tidy(e.flowNote ?? soc.flowNote),
    consumes: prose(e.consumes ?? soc.consumes),
    rel: a.r.map(([dref, rel]) => {
      const socD = socRefOf(dref)!;
      const text = e.rel?.[socD] ?? soc.rel.find((r) => r.id === socD)?.text ?? '';
      return { id: dref, rel, text: tidy(text) };
    }),
    risks: prose(e.risks ?? soc.risks),
    roles: (e.roles ?? soc.roles).map((r) => ({ r: tidy(r.r), d: tidy(r.d) })),
    effort: scaleEffort(
      soc.effort.map(([l, mm]) => [tidy(l), mm]),
      e.effortLabels,
      stageEffort(id)!,
    ),
    entry: prose(e.entry ?? soc.entry),
    exit: prose(e.exit ?? soc.exit),
    dependsOn: refs(soc.dependsOn),
    dependsNote: (e.dependsNote === undefined ? soc.dependsNote : e.dependsNote)
      ? tidy((e.dependsNote ?? soc.dependsNote)!)
      : null,
    feedsInto: refs(soc.feedsInto),
    measuredBy: prose(e.measuredBy ?? soc.measuredBy),
    links: {
      dependsOn: refs(soc.links.dependsOn),
      feedsInto: refs(soc.links.feedsInto),
      runsWith: refs(soc.links.runsWith),
      revisedBy: refs(soc.links.revisedBy),
      feedsBackInto: refs(soc.links.feedsBackInto),
    },
    terms: (e.terms ?? soc.terms).filter((t) => !FOREIGN_TERMS.has(t)),
  };
};

const authored = (id: string): ActivityDetail | undefined => {
  const a = EMBEDDED_ACTIVITIES[id];
  const w: ActivityWriteUp | undefined = EMBEDDED_WRITE_UPS[id];
  if (!a || !w) return undefined;
  return {
    ...w,
    ...fromEntry(a),
    rel: a.r.map(([ref, rel]) => ({ id: ref, rel, text: w.rel[ref] ?? '' })),
  };
};

/** The written-up detail for an Embedded SoC activity, if one exists. */
export const embeddedDetail = (id: string): ActivityDetail | undefined => authored(id) ?? derived(id);
