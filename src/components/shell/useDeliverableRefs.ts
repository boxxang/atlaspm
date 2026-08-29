'use client';

import { useMemo } from 'react';
import { detailDeliverables } from '@/data/activityIndex';
import { activitySteps } from '@/data/activitySteps';
import { deliverableRefs } from '@/lib/deliverableRefs';
import { useAppStore } from '@/store/useAppStore';

/* Which stage a reference's prefix belongs to: PD-D6 is Physical Design's,
   because PD-01 is. Built once — the activity index never changes. */
const STAGE_OF_PREFIX: Record<string, string> = {};
for (const [ref, a] of Object.entries(activitySteps)) STAGE_OF_PREFIX[ref.split('-')[0]] = a.st;

/**
 * Every key deliverable's reference tag, resolved once for the whole program.
 *
 * The matching is fuzzy inside a stage (see /lib/deliverableRefs), so it has to
 * see every row at once — a tag is claimed by one deliverable and no other.
 * Resolving it per row, per table, would let two tables disagree about which
 * row owns TECH-D2.
 */
export function useDeliverableRefs(): Map<string, string> {
  const deliverables = useAppStore((s) => s.deliverables);
  return useMemo(() => {
    const rows = Object.entries(deliverables).flatMap(([stageId, list]) =>
      list.map((d) => ({ id: d.id, title: d.title, stageId })),
    );
    return deliverableRefs(rows, detailDeliverables, STAGE_OF_PREFIX);
  }, [deliverables]);
}
