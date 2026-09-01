import type { ProfileStageDef } from '@/data/types';

/**
 * The four edits a stage list takes, as pure functions.
 *
 * Order and dates are two different things and this is where that is kept
 * true: `order` is the position on the chart's y-axis, and moving a row
 * changes it without touching a single date. What reschedules a stage is
 * retiming it, and nothing else.
 *
 * Removing a stage leaves its window behind as a gap, which is the same rule
 * `pickStages` follows: the offsets are the template's claim about what has to
 * happen when, and work does not move earlier because you stopped tracking the
 * work before it.
 *
 * Pure: no DOM, no database.
 */
export class StageEditError extends Error {}

/** Position is the order, always — so the list and the chart cannot disagree. */
const renumber = (stages: readonly ProfileStageDef[]): ProfileStageDef[] =>
  stages.map((s, order) => ({ ...s, order }));

const find = (stages: readonly ProfileStageDef[], key: string): ProfileStageDef => {
  const found = stages.find((s) => s.key === key);
  if (!found) throw new StageEditError(`No such stage: ${key}`);
  return found;
};

/** `new-1`, `new-2`, … — never reusing a key the list already carries. */
const freshKey = (stages: readonly ProfileStageDef[]): string => {
  const taken = new Set(stages.map((s) => s.key));
  for (let n = 1; ; n++) if (!taken.has(`new-${n}`)) return `new-${n}`;
};

export function addStage(stages: readonly ProfileStageDef[], at: number): ProfileStageDef[] {
  const where = Math.max(0, Math.min(at, stages.length));
  const before = stages[where - 1];
  const added: ProfileStageDef = {
    key: freshKey(stages),
    order: where,
    title: 'New stage',
    shortTitle: 'NEW',
    /* A stage belongs to a lifecycle band, and the one above it is the best
       guess available; the first stage of all falls back to the first band. */
    phaseId: before?.phaseId ?? 'define',
    /* Points at no built-in stage, so it shows no inherited text or drawing. */
    baseKey: null,
    startOffsetWeeks: before ? before.startOffsetWeeks + before.durationWeeks : 0,
    durationWeeks: 4,
  };
  return renumber([...stages.slice(0, where), added, ...stages.slice(where)]);
}

export function removeStage(
  stages: readonly ProfileStageDef[],
  key: string,
): ProfileStageDef[] {
  find(stages, key);
  if (stages.length <= 1) throw new StageEditError('A template needs at least one stage.');
  return renumber(stages.filter((s) => s.key !== key));
}

export function moveStage(
  stages: readonly ProfileStageDef[],
  key: string,
  to: number,
): ProfileStageDef[] {
  const moving = find(stages, key);
  const rest = stages.filter((s) => s.key !== key);
  const where = Math.max(0, Math.min(to, rest.length));
  return renumber([...rest.slice(0, where), moving, ...rest.slice(where)]);
}

export function retimeStage(
  stages: readonly ProfileStageDef[],
  key: string,
  patch: { startOffsetWeeks?: number; durationWeeks?: number },
): ProfileStageDef[] {
  find(stages, key);
  const start = patch.startOffsetWeeks;
  const dur = patch.durationWeeks;
  if (start !== undefined && (!Number.isFinite(start) || start < 0)) {
    throw new StageEditError('A stage cannot start before the programme does.');
  }
  if (dur !== undefined && (!Number.isFinite(dur) || dur <= 0)) {
    throw new StageEditError('A stage needs a length.');
  }
  return stages.map((s) => (s.key === key ? { ...s, ...patch } : s));
}
