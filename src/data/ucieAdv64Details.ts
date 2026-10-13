/**
 * /data/ucieAdv64Details.ts — the UCIe Advanced 64G Die-to-Die PHY IP
 * activities, written up.
 *
 * Server-only in practice, like /data/cpoSwitchDetails.ts: the page that shows
 * one write-up reads it here, and the browser is never handed the prose. Where
 * the activity runs, its steps, what each step hands over and the deliverables
 * it relates to come from the activity entry, so the page and the stage table
 * cannot describe the same activity differently.
 */
import type { ActivityDetail } from './activityDetailTypes';
import { UCIE_ACTIVITIES } from './ucieAdv64';
import { UCIE_WRITE_UPS } from './ucieAdv64/writeUps';

export { UCIE_WRITE_UPS };

/** The written-up detail for a UCIe activity, if one exists. */
export function ucieDetail(id: string): ActivityDetail | undefined {
  const a = UCIE_ACTIVITIES[id];
  const w = UCIE_WRITE_UPS[id];
  if (!a || !w) return undefined;
  return {
    ...w,
    stage: a.st,
    window: a.w,
    steps: a.s.map(([n, text, tat, par]) => ({ n, text, tat, lane: par ? 'par' : 'main' })),
    produces: a.o,
    producedBy: a.ob,
    rel: a.r.map(([ref, rel]) => ({ id: ref, rel, text: w.rel[ref] ?? '' })),
  };
}
