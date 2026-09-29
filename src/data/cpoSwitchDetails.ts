/**
 * /data/cpoSwitchDetails.ts — the CPO Network Switch System activities,
 * written up.
 *
 * Server-only in practice, like /data/activityDetails.ts: the page that shows
 * one write-up reads it here, and the browser is never handed the prose. The
 * prose is authored per stage under /data/cpoSwitch/writeUps; where the
 * activity runs, its steps, what each step hands over and the deliverables it
 * relates to come from the activity entry, so the page and the stage table
 * cannot describe the same activity differently.
 */
import type { ActivityDetail } from './activityDetailTypes';
import { CPO_ACTIVITIES } from './cpoSwitch';
import { CPO_WRITE_UPS } from './cpoSwitch/writeUps';

export { CPO_WRITE_UPS };

/** The written-up detail for a CPO activity, if one exists. */
export function cpoDetail(id: string): ActivityDetail | undefined {
  const a = CPO_ACTIVITIES[id];
  const w = CPO_WRITE_UPS[id];
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
