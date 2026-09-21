/**
 * /lib/updateFeed.ts — what the Updates feed is a list of.
 *
 * Everything written in the app is a post: a step update, a risk, a handover,
 * a reply, and a key-info note. One shape, which is the point.
 *
 * Two rules turn that into a feed.
 *
 * **A key-info note is not an update.** It is a page kept on a stage, looked up
 * months later by a title somebody half-remembers, and it carries a whole
 * document where an update carries a sentence. In a feed it drowns what it is
 * mixed into.
 *
 * **A reply is not a row.** It belongs to the post it answers, and alone it
 * says nothing you can place: "Closed. 75 wafers started on 04/15" with no
 * stage, no activity and no sign of what was closed. So the feed lists threads,
 * and a thread rises when anybody says anything in it.
 *
 * Both rules live here because three screens read them — the nav's count, the
 * programme's Updates page and the overview's recent list — and a badge that
 * disagrees with the page behind it is worse than no badge.
 *
 * Pure: no DOM, no store.
 */

/** The kinds the feed does not carry as a row of their own. */
const NOT_AN_UPDATE = new Set(['note']);

/**
 * Whether a post can head a thread.
 *
 * A kind this has never heard of is carried: a new kind is more likely a new
 * way of saying something than a new kind of page.
 */
export const isFeedPost = (p: { kind: string }): boolean => !NOT_AN_UPDATE.has(p.kind);

interface ThreadPost {
  id: string;
  kind: string;
  parentId: string | null;
  createdAt: Date;
  editedAt: Date | null;
}

/** When a post last said something — an edit is the post speaking again. */
export const whenSaid = (p: ThreadPost): Date => p.editedAt ?? p.createdAt;

export interface FeedThread<T> {
  root: T;
  /** oldest first, the way a thread is read */
  replies: T[];
  /** the one a collapsed row shows */
  latest: T | null;
  /** when anybody last said anything in it, which is what the feed sorts on */
  at: Date;
}

/** How far a parentId chain is followed before it is treated as broken. */
const MAX_HOPS = 64;

/**
 * The post a reply ultimately hangs from, or null if the chain leads nowhere.
 * Threads are shallow; the hop limit is for a parentId that loops.
 */
function rootOf<T extends ThreadPost>(p: T, byId: Record<string, T>): T | null {
  let at: T = p;
  for (let hops = 0; hops < MAX_HOPS; hops++) {
    if (!at.parentId) return at;
    const up = byId[at.parentId];
    if (!up || up.id === at.id) return null;
    at = up;
  }
  return null;
}

/**
 * Posts as the feed lists them: one thread per post that started one, the
 * thread spoken in most recently first.
 *
 * A thread whose root is not a feed post — a comment on a key-info note — goes
 * with its root. A note is a page, and what was said on it belongs to the page.
 */
export function threads<T extends ThreadPost>(posts: readonly T[]): FeedThread<T>[] {
  const byId: Record<string, T> = {};
  for (const p of posts) byId[p.id] = p;

  const roots: T[] = [];
  const kids: Record<string, T[]> = {};
  for (const p of posts) {
    if (!p.parentId) {
      if (isFeedPost(p)) roots.push(p);
      continue;
    }
    const root = rootOf(p, byId);
    if (!root || !isFeedPost(root)) continue;
    (kids[root.id] ??= []).push(p);
  }

  return roots
    .map((root) => {
      const replies = (kids[root.id] ?? []).sort(
        (a, b) => whenSaid(a).getTime() - whenSaid(b).getTime(),
      );
      const latest = replies.length ? replies[replies.length - 1] : null;
      return { root, replies, latest, at: latest ? whenSaid(latest) : whenSaid(root) };
    })
    .sort((a, b) => b.at.getTime() - a.at.getTime());
}
