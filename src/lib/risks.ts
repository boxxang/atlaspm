/**
 * /lib/risks.ts — a risk is a flag on a step.
 *
 * It used to be a row of its own: Item(kind:'risk'), entered on a board, with
 * no connection to the work it was about. The prototype settled that a risk is
 * something somebody says while doing a step, so it is a post with a flag on
 * it, and it stops being open when that step is handed over. The post stays in
 * the thread as the record of how it was answered; it just stops counting.
 *
 * Everything that used to count risks — the sidebar, the overview, the stage
 * badge, the timeline colours — reads this one derivation, so they cannot
 * disagree about how many there are.
 *
 * Pure: no DOM, no database.
 */
import type { StageId } from '@/data/types';
import { stepKey } from './steps';

/** A post as this module needs it. `kind` is the database's own discriminator. */
export interface RiskCandidate {
  id: string;
  kind: string;
  text: string;
  author: string;
  createdAt: Date;
  editedAt: Date | null;
  activityRef: string | null;
  stepN: number | null;
}

/** A risk, shaped for the boards that list them. */
export interface DerivedRisk {
  id: string;
  postId: string;
  stageId: StageId;
  title: string;
  owner: string;
  act: string;
  stepN: number | null;
  /** Last time anything was said — what "stale" is measured from. */
  updatedAt: Date;
}

/**
 * Open while the step it is flagged on is still open. A risk with no step to
 * its name stays open, because nothing can close it.
 */
export const isRiskOpen = (p: RiskCandidate, doneSteps: ReadonlySet<string>): boolean =>
  p.kind === 'risk' &&
  !!p.activityRef &&
  (p.stepN == null || !doneSteps.has(stepKey(p.activityRef, p.stepN)));

/**
 * Every open risk, newest word first.
 *
 * `stageOf` maps an activity ref to the stage it runs in — the join the caller
 * already has, passed in rather than reached for, so this stays pure data.
 */
export function openRisks(
  posts: readonly RiskCandidate[],
  doneSteps: ReadonlySet<string>,
  stageOf: Readonly<Record<string, StageId>>,
): DerivedRisk[] {
  const out: DerivedRisk[] = [];
  for (const p of posts) {
    if (!isRiskOpen(p, doneSteps)) continue;
    const stageId = stageOf[p.activityRef as string];
    if (!stageId) continue;
    out.push({
      id: `sr:${p.id}`,
      postId: p.id,
      stageId,
      title: p.text,
      owner: p.author,
      act: p.activityRef as string,
      stepN: p.stepN,
      updatedAt: p.editedAt ?? p.createdAt,
    });
  }
  return out.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export const risksByStage = (risks: readonly DerivedRisk[], stageId: StageId): DerivedRisk[] =>
  risks.filter((r) => r.stageId === stageId);

/** A stage is risk-red while it holds at least one open risk. */
export const stageIsRisky = (risks: readonly DerivedRisk[], stageId: StageId): boolean =>
  risks.some((r) => r.stageId === stageId);
