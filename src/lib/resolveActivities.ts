import type { ActivityStepEntry, DeliverableRelation, StepTuple } from '@/data/activitySteps';

/**
 * A profile's activities, resolved into the map the app already reads.
 *
 * Eleven modules read `Record<ref, ActivityStepEntry>` and none of them should
 * have to know where it came from, so this returns exactly that shape. What
 * changes is where the rows come from: a programme's own profile rather than a
 * module constant shared by every programme.
 *
 * An activity is inherited or owned. Inherited means `baseRef` names a built-in
 * activity, and its steps, outputs, deliverable relations and role come from
 * the generated library — which is why editing a template does not require
 * moving a megabyte of authored prose into the database first. Owned means the
 * activity was added, or its steps were edited, and it carries them itself.
 *
 * Either way the stage and the window come from the row, because moving an
 * activity to another stage or re-timing it is exactly what editing is.
 *
 * Pure: no DOM, no database.
 */
export interface ActivityRow {
  ref: string;
  stageKey: string;
  order: number;
  title: string;
  windowFrom: number;
  windowTo: number;
  baseRef: string | null;
  steps: { n: number; text: string; tat: number; lane: string }[];
}

const NO_OUTPUTS: string[] = [];
const NO_PRODUCERS: number[] = [];
const NO_RELATIONS: [string, DeliverableRelation][] = [];

/** Renumbered 1..n on the way out: a gap in step numbers is not a step. */
const ownSteps = (rows: ActivityRow['steps']): StepTuple[] =>
  [...rows]
    .sort((a, b) => a.n - b.n)
    .map((s, i) =>
      s.lane === 'par'
        ? ([i + 1, s.text, s.tat, 1] as StepTuple)
        : ([i + 1, s.text, s.tat] as StepTuple),
    );

/**
 * What a profile with no activity rows of its own runs.
 *
 * A profile created before activities were stored has stages and nothing else.
 * Rather than showing it as a programme with empty stages, it falls back to
 * every built-in activity belonging to a stage it actually runs — which is
 * what it was showing before the rows existed, since the list was then a
 * constant shared by everyone.
 *
 * A read-time fallback rather than a migration: it is correct for a profile
 * that has not been touched since, and the moment somebody edits one, the rows
 * that edit writes take over.
 */
export function inheritedActivities(
  stageKeys: readonly string[],
  library: Record<string, ActivityStepEntry>,
): ActivityRow[] {
  const runs = new Set(stageKeys);
  return Object.entries(library)
    .filter(([, a]) => runs.has(a.st))
    .map(([ref, a], order) => ({
      ref,
      stageKey: a.st,
      order,
      title: '',
      windowFrom: a.w[0],
      windowTo: a.w[1],
      baseRef: ref,
      steps: [],
    }));
}

export function resolveActivities(
  rows: readonly ActivityRow[],
  library: Record<string, ActivityStepEntry>,
): Record<string, ActivityStepEntry> {
  const out: Record<string, ActivityStepEntry> = {};
  for (const row of [...rows].sort((a, b) => a.order - b.order)) {
    /* A baseRef the library has lost is a template that outlived its content.
       It resolves to an activity with no steps rather than throwing: one stale
       row must not take a whole programme down. */
    const base = row.baseRef ? library[row.baseRef] : undefined;
    out[row.ref] = {
      st: row.stageKey,
      w: [row.windowFrom, row.windowTo],
      s: base ? base.s : ownSteps(row.steps),
      o: base ? base.o : NO_OUTPUTS,
      ob: base ? base.ob : NO_PRODUCERS,
      r: base ? base.r : NO_RELATIONS,
      ro: base ? base.ro : '',
    };
  }
  return out;
}

/** Titles, with the row's own winning — renaming an activity is an edit. */
export function resolvedTitles(
  rows: readonly ActivityRow[],
  library: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of [...rows].sort((a, b) => a.order - b.order)) {
    out[row.ref] = row.title || library[row.baseRef ?? row.ref] || row.ref;
  }
  return out;
}
