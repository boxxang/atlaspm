import type { MilestoneDef, ProfileStageDef } from '@/data/types';

/**
 * Starting a program on a subset of a template's stages.
 *
 * A program that does not build a test chip, or has no package work of its own,
 * should not carry eight stages it will never open. The stages it does run are
 * the template's, unchanged — this only decides which of them come along.
 *
 * Three rules, and they are the whole of it:
 *
 * The three major checkpoints stay. Tapeout, First Silicon and Mass Production
 * are what every countdown on every screen is counting down to, and a program
 * that dropped the stage carrying one would have nothing to count to. The
 * lesser checkpoints leave with their stage, which is right: a program with no
 * test chip has no Test Chip Silicon date, and should not pretend to.
 *
 * The offsets between the kept stages are the template's assertion about what
 * has to happen before what — RTL freezes before signoff whether or not there
 * is a test chip in between — so they survive untouched. Dropping a stage
 * therefore leaves a gap where its window was, which is right: the work after
 * it does not move earlier because you stopped tracking the work before it.
 *
 * But kickoff has to mean kickoff. If the earliest kept stage began twelve
 * weeks in, the whole run shifts back so that it begins at week zero. That is
 * the one adjustment, and it moves every kept stage by the same amount, so it
 * changes when the program starts and nothing about its shape.
 */
export class StageChoiceError extends Error {}

export function pickStages(
  base: readonly ProfileStageDef[],
  keep: readonly string[],
  milestoneOf: Readonly<Record<string, MilestoneDef>>,
): ProfileStageDef[] {
  const wanted = new Set(keep);

  const unknown = [...wanted].filter((k) => !base.some((s) => s.key === k));
  if (unknown.length) throw new StageChoiceError(`No such stage: ${unknown.join(', ')}`);

  const kept = base.filter((s) => wanted.has(s.key));
  if (!kept.length) throw new StageChoiceError('A program needs at least one stage.');

  for (const s of base) {
    const ms = milestoneOf[s.key];
    if (ms?.major && !wanted.has(s.key)) {
      throw new StageChoiceError(`${s.title} carries ${ms.label} and has to stay.`);
    }
  }

  const shift = Math.min(...kept.map((s) => s.startOffsetWeeks));
  return kept.map((s, order) => ({
    ...s,
    order,
    startOffsetWeeks: s.startOffsetWeeks - shift,
  }));
}

/**
 * The stages a chooser must leave ticked. Only the three carrying a major
 * checkpoint: locking all fifteen that carry any checkpoint would leave eight
 * stages to choose between, which is not a choice worth offering.
 */
export const requiredStages = (
  base: readonly ProfileStageDef[],
  milestoneOf: Readonly<Record<string, MilestoneDef>>,
): Set<string> => new Set(base.filter((s) => milestoneOf[s.key]?.major).map((s) => s.key));

/**
 * Where week zero falls when the date somebody typed is not the program's
 * start but the start of a stage partway through it.
 *
 * A program is not always planned from its own beginning. "Physical Design
 * starts in March" is the fixed point on a great many programs — the rest of
 * the plan is read backwards and forwards from it — and being made to convert
 * that into a kickoff date by hand is how a schedule ends up a week out.
 *
 * So the anchor stage's start is pinned to the date given, and the kickoff is
 * derived: everything before the anchor lands earlier, everything after it
 * later, and every offset stays as the template wrote it. Anchoring on the
 * first stage gives back the date unchanged, which is the ordinary case.
 */
export function kickoffForAnchor(
  stages: readonly ProfileStageDef[],
  anchorKey: string,
  anchorStarts: Date,
): Date {
  const anchor = stages.find((s) => s.key === anchorKey);
  if (!anchor) throw new StageChoiceError(`No such stage: ${anchorKey}`);
  const out = new Date(anchorStarts);
  out.setDate(out.getDate() - Math.round(anchor.startOffsetWeeks * 7));
  return out;
}
