'use client';

import { useProgramActivities } from './useProgramActivities';
import { useMemo } from 'react';
import { detailDeliverables } from '@/data/activityIndex';
import { deliverableRefs } from '@/lib/deliverableRefs';
import { useAppStore } from '@/store/useAppStore';

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
  const activitySteps = useProgramActivities();
  /* Which stage a reference's prefix belongs to: PD-D6 is Physical Design's,
     because PD-01 is. Per programme now, since which activities exist is the
     programme's own list. */
  const stageOfPrefix = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [ref, a] of Object.entries(activitySteps)) m[ref.split('-')[0]] = a.st;
    return m;
  }, [activitySteps]);
  return useMemo(() => {
    const rows = Object.entries(deliverables).flatMap(([stageId, list]) =>
      list.map((d) => ({ id: d.id, title: d.title, stageId })),
    );
    return deliverableRefs(rows, detailDeliverables, stageOfPrefix);
  }, [deliverables, stageOfPrefix]);
}
