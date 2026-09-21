/**
 * /lib/updateFeed.ts — what counts as an update.
 *
 * Everything anybody writes is a post: a step update, a risk, a handover, a
 * reply, and a key-info note. One shape, which is the point. But the Updates
 * feed is a record of what has been *said about the work*, and a key-info note
 * is not that — it is a page somebody keeps, looked up months later by a title
 * they half-remember. It belongs to its stage, not to a timeline.
 *
 * Left in, a note also drowns the feed it is in: it carries a title and a whole
 * document where an update carries a sentence.
 *
 * One predicate, because three screens read this — the nav's count, the
 * programme's Updates page and the overview's recent list — and a badge that
 * disagrees with the page behind it is worse than no badge.
 *
 * Pure: no DOM, no store.
 */

/** The kinds the feed does not carry. */
const NOT_AN_UPDATE = new Set(['note']);

export const isFeedPost = (p: { kind: string }): boolean => !NOT_AN_UPDATE.has(p.kind);

export const feedPosts = <T extends { kind: string }>(posts: readonly T[]): T[] =>
  posts.filter(isFeedPost);

/* ── what a reply is answering ────────────────────────────── */

/** The fields a reply borrows from the post it answers. */
export interface ReplyContext {
  /** the parent's first line — its title if it has one, its opening line otherwise */
  subject: string;
  stageId: string | null;
  activityRef: string | null;
  stepN: number | null;
}

interface FeedPost {
  id: string;
  kind: string;
  text: string;
  parentId: string | null;
  stageId: string | null;
  activityRef: string | null;
  stepN: number | null;
}

/** Long enough to recognise a post by, short enough to sit on one line. */
const SUBJECT_CHARS = 64;

/**
 * A post's first line, which is the thing people call it by: a note's title is
 * literally its first line, and an update's is the sentence it opens with.
 */
export function firstLine(text: string, max = SUBJECT_CHARS): string {
  const line = (text ?? '').split('\n').find((l) => l.trim()) ?? '';
  const trimmed = line.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

/**
 * What each reply is answering, by reply id.
 *
 * A reply carries no target of its own — its parent holds them — so in a flat
 * feed it arrives with no stage, no activity and nothing saying what it
 * answers: "Closed. 75 wafers started on 04/15" with no way to tell what was
 * closed. It borrows all of that from the post above it.
 *
 * Chains are followed to the post that started the thread, because that is the
 * one the thread is named after, and a reply to a reply should not be labelled
 * with an answer.
 */
export function replyContext(posts: readonly FeedPost[]): Record<string, ReplyContext> {
  const byId: Record<string, FeedPost> = {};
  for (const p of posts) byId[p.id] = p;

  const out: Record<string, ReplyContext> = {};
  for (const p of posts) {
    if (p.kind !== 'reply' || !p.parentId) continue;
    let root = byId[p.parentId];
    /* a thread is short; the guard is for a parentId that loops or is missing */
    for (let hops = 0; root?.parentId && hops < 20; hops++) {
      const next = byId[root.parentId];
      if (!next || next.id === root.id) break;
      root = next;
    }
    if (!root) continue;
    out[p.id] = {
      subject: firstLine(root.text),
      stageId: root.stageId,
      activityRef: root.activityRef,
      stepN: root.stepN,
    };
  }
  return out;
}
