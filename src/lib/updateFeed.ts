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
