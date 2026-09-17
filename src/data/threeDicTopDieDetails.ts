/**
 * /data/threeDicTopDieDetails.ts — the top die's write-ups.
 *
 * Server-only, like the write-ups it derives from: each is the SoC write-up of
 * the activity it mirrors, with every reference to a split stage moved onto
 * the top die — its relations, its connections and the IDs in its prose — and
 * its effort at the top die's share.
 */
import type { ActivityDetail } from './activityDetailTypes';
import { activityDetail } from './activityDetails';
import { TOP_DIE_ACTIVITIES, TOP_DIE_SHARE, baseRefOf, toTopRef } from './threeDicTopDie';

const all = (xs: readonly string[]) => xs.map(toTopRef);

export const topDieDetail = (id: string): ActivityDetail | undefined => {
  const top = TOP_DIE_ACTIVITIES[id];
  const base = top ? activityDetail(baseRefOf(id)) : undefined;
  if (!top || !base) return undefined;
  return {
    ...base,
    stage: top.st,
    purpose: all(base.purpose),
    flowNote: toTopRef(base.flowNote),
    consumes: all(base.consumes),
    rel: base.rel.map((r) => ({ ...r, id: toTopRef(r.id), text: toTopRef(r.text) })),
    risks: all(base.risks),
    effort: base.effort.map(([label, mm]) => [label, mm * TOP_DIE_SHARE]),
    entry: all(base.entry),
    exit: all(base.exit),
    dependsOn: all(base.dependsOn),
    dependsNote: base.dependsNote && toTopRef(base.dependsNote),
    feedsInto: all(base.feedsInto),
    measuredBy: all(base.measuredBy),
    links: {
      dependsOn: all(base.links.dependsOn),
      feedsInto: all(base.links.feedsInto),
      runsWith: all(base.links.runsWith),
      revisedBy: all(base.links.revisedBy),
      feedsBackInto: all(base.links.feedsBackInto),
    },
  };
};
