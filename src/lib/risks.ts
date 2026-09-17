/**
 * /lib/risks.ts — a risk is a flag on a step.
 *
 * It used to be a row of its own: Item(kind:'risk'), entered on a board, with
 * no connection to the work it was about. The prototype settled that a risk is
 * something somebody says while doing a step, so it is a post with a flag on
 * it.
 *
 * It stops being open when somebody closes it, saying in the thread how it was
 * answered. Finishing the step used to close it, which conflated two things: a
 * step can be handed over with its risk still live, and a risk can be answered
 * while the work goes on. The post stays in the thread either way, with the
 * closing note under it; it just stops counting.
 *
 * Everything that used to count risks — the sidebar, the overview, the stage
 * badge, the timeline colours — reads this one derivation, so they cannot
 * disagree about how many there are.
 *
 * Pure: no DOM, no database.
 */
import type { StageId } from '@/data/types';

/** A post as this module needs it. `kind` is the database's own discriminator. */
export interface RiskCandidate {
  id: string;
  kind: string;
  text: string;
  author: string;
  createdAt: Date;
  editedAt: Date | null;
  /** When it was closed, for a risk; the reply under it says how. */
  doneAt: Date | null;
  /** The post this one answers, for a reply. */
  parentId: string | null;
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

/** Open until somebody closes it — nothing else answers a risk. */
export const isRiskOpen = (p: RiskCandidate): boolean =>
  p.kind === 'risk' && !!p.activityRef && !p.doneAt;

/**
 * Every open risk, newest word first.
 *
 * `stageOf` maps an activity ref to the stage it runs in — the join the caller
 * already has, passed in rather than reached for, so this stays pure data.
 */
const latest = (a: Date, b: Date | undefined) => (b && b > a ? b : a);

export function openRisks(
  posts: readonly RiskCandidate[],
  stageOf: Readonly<Record<string, StageId>>,
): DerivedRisk[] {
  /* The last word in each thread, so "nothing said in twelve days" counts the
     answers as well as the question. */
  const lastReply = new Map<string, Date>();
  for (const p of posts) {
    if (!p.parentId) continue;
    const at = p.editedAt ?? p.createdAt;
    const prev = lastReply.get(p.parentId);
    if (!prev || at > prev) lastReply.set(p.parentId, at);
  }
  const out: DerivedRisk[] = [];
  for (const p of posts) {
    if (!isRiskOpen(p)) continue;
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
      updatedAt: latest(p.editedAt ?? p.createdAt, lastReply.get(p.id)),
    });
  }
  return out.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export const risksByStage = (risks: readonly DerivedRisk[], stageId: StageId): DerivedRisk[] =>
  risks.filter((r) => r.stageId === stageId);

/** A stage is risk-red while it holds at least one open risk. */
export const stageIsRisky = (risks: readonly DerivedRisk[], stageId: StageId): boolean =>
  risks.some((r) => r.stageId === stageId);
