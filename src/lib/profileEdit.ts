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

/**
 * The prefix every reference in the stage is built from.
 *
 * `DEF-01` is the first activity of the stage whose prefix is `DEF`, so the
 * prefix is stored in the shape a reference can carry it: upper case, letters
 * and digits only, short enough to read beside a title. A hyphen is what
 * separates the prefix from the number, so it cannot be part of one.
 */
const PREFIX_MAX = 6;

export const normalizePrefix = (raw: string): string =>
  raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, PREFIX_MAX);

/** `NEW`, `NEW2`, … — an added stage must not arrive already clashing. */
const freshPrefix = (stages: readonly ProfileStageDef[]): string => {
  const taken = new Set(stages.map((s) => normalizePrefix(s.shortTitle)));
  if (!taken.has('NEW')) return 'NEW';
  for (let n = 2; ; n++) if (!taken.has(`NEW${n}`)) return `NEW${n}`;
};

/**
 * Set one stage's prefix.
 *
 * It does not refuse a clash, on purpose: a prefix is typed a letter at a
 * time, and a field that rejects the keystroke that momentarily collides
 * cannot be edited at all. `duplicatePrefixes` reports the clash while it is
 * being typed and `assertPrefixes` refuses it on save.
 */
export function setStagePrefix(
  stages: readonly ProfileStageDef[],
  key: string,
  raw: string,
): ProfileStageDef[] {
  find(stages, key);
  const shortTitle = normalizePrefix(raw);
  return stages.map((s) => (s.key === key ? { ...s, shortTitle } : s));
}

/** The prefixes carried by more than one stage. Blanks are a different fault. */
export function duplicatePrefixes(stages: readonly { shortTitle: string }[]): string[] {
  const seen = new Map<string, number>();
  for (const s of stages) {
    const p = normalizePrefix(s.shortTitle);
    if (p) seen.set(p, (seen.get(p) ?? 0) + 1);
  }
  return [...seen].filter(([, n]) => n > 1).map(([p]) => p);
}

/** What a save has to be able to say yes to. */
export function assertPrefixes(
  stages: readonly { title: string; shortTitle: string }[],
): void {
  const blank = stages.find((s) => !normalizePrefix(s.shortTitle));
  if (blank) {
    throw new StageEditError(`"${blank.title}" needs a prefix — it is what DEF-01 is made of.`);
  }
  const dup = duplicatePrefixes(stages);
  if (dup.length) {
    throw new StageEditError(
      `Two stages share the prefix ${dup.join(', ')}. A reference has to name one activity.`,
    );
  }
}

/**
 * The reference renames a set of prefix changes implies.
 *
 * A stage's prefix and an activity's number are two identities, and changing
 * the first must leave the second alone: `NEW-04` becomes `CUS-04`, keeping
 * the gap where `NEW-03` was deleted. A row the old prefix does not own is not
 * renamed — it was named by hand, and guessing at it would be worse than
 * leaving it.
 *
 * `profileId + ref` is unique, so a rename onto a live reference would fail in
 * the database with nothing useful to say. It fails here instead.
 */
export function refRenames(
  activities: readonly { ref: string; stageKey: string }[],
  changes: readonly { stageKey: string; from: string; to: string }[],
): { from: string; to: string }[] {
  const moves = new Map(
    changes
      .map((c) => ({
        stageKey: c.stageKey,
        from: normalizePrefix(c.from),
        to: normalizePrefix(c.to),
      }))
      .filter((c) => c.from && c.to && c.from !== c.to)
      .map((c) => [c.stageKey, c] as const),
  );
  if (!moves.size) return [];

  const renames: { from: string; to: string }[] = [];
  for (const a of activities) {
    const move = moves.get(a.stageKey);
    if (!move) continue;
    const head = `${move.from}-`;
    if (!a.ref.startsWith(head)) continue;
    renames.push({ from: a.ref, to: `${move.to}-${a.ref.slice(head.length)}` });
  }

  const freed = new Set(renames.map((r) => r.from));
  const after = new Set(activities.map((a) => a.ref).filter((ref) => !freed.has(ref)));
  for (const r of renames) {
    if (after.has(r.to)) {
      throw new StageEditError(`${r.to} already names another activity in this template.`);
    }
    after.add(r.to);
  }
  return renames;
}

export function addStage(stages: readonly ProfileStageDef[], at: number): ProfileStageDef[] {
  const where = Math.max(0, Math.min(at, stages.length));
  const before = stages[where - 1];
  const added: ProfileStageDef = {
    key: freshKey(stages),
    order: where,
    title: 'New stage',
    shortTitle: freshPrefix(stages),
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
