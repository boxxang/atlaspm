/**
 * /data/threeDicDetails.ts — the 3DIC activities, written up.
 *
 * Server-only in practice, like /data/activityDetails.ts: the page that shows
 * one write-up reads it here, and the browser is never handed the prose.
 *
 * Each write-up is prose authored per stage under /data/threeDicWriteUps, and
 * the rest of an ActivityDetail — where it runs, its steps, what they hand over
 * and the deliverables it relates to — comes from the activity entry itself, so
 * the page and the stage table cannot describe the same activity differently.
 */
import type { ActivityDetail, ActivityWriteUp } from './activityDetailTypes';
import { THREE_DIC_ACTIVITIES } from './threeDic';
import { BOND_WRITE_UPS } from './threeDicWriteUps/bond';
import { D2D_WRITE_UPS } from './threeDicWriteUps/d2d';
import { DCTV_WRITE_UPS } from './threeDicWriteUps/dctv';
import { KGD_WRITE_UPS } from './threeDicWriteUps/kgd';
import { MDT_WRITE_UPS } from './threeDicWriteUps/mdt';
import { PART_WRITE_UPS } from './threeDicWriteUps/part';
import { STACK_WRITE_UPS } from './threeDicWriteUps/stack';
import { STK_WRITE_UPS } from './threeDicWriteUps/stk';

export const THREE_DIC_WRITE_UPS: Record<string, ActivityWriteUp> = {
  ...PART_WRITE_UPS,
  ...BOND_WRITE_UPS,
  ...D2D_WRITE_UPS,
  ...DCTV_WRITE_UPS,
  ...STACK_WRITE_UPS,
  ...KGD_WRITE_UPS,
  ...STK_WRITE_UPS,
  ...MDT_WRITE_UPS,
};

const compose = (id: string): ActivityDetail | undefined => {
  const a = THREE_DIC_ACTIVITIES[id];
  const w = THREE_DIC_WRITE_UPS[id];
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
};

/** The written-up detail for a 3DIC activity, if one exists. */
export const threeDicDetail = (id: string): ActivityDetail | undefined => compose(id);
