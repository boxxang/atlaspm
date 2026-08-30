'use client';

import { useMemo } from 'react';
import { detailDeliverables } from '@/data/activityIndex';
import { activitySteps } from '@/data/activitySteps';
import { attention, type AttentionRow } from '@/lib/attention';
import { deliverableStep } from '@/lib/deliverableStatus';
import { useAppStore } from '@/store/useAppStore';
import { useProgramWork } from './useProgramWork';

/**
 * What needs answering today, ranked.
 *
 * The ladder itself is `/lib/attention.ts` and is tested there; this is the
 * join it needs — which deliverable carries which reference, and which step
 * hands it over — plus the stage ends that decide what closes before tapeout.
 */
export function useAttention(): AttentionRow[] {
  const { overdue, upcoming, risks } = useProgramWork();
  const deliverables = useAppStore((s) => s.deliverables);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);

  return useMemo(() => {
    /* Deliverable titles drift between the two seed lists; references do not,
       so the title is matched back to a reference once here. */
    const refOfTitle = new Map<string, string>();
    for (const [ref, title] of Object.entries(detailDeliverables)) refOfTitle.set(title, ref);

    const producers = Object.keys(activitySteps).map((ref) => ({
      ref,
      produces: activitySteps[ref].r.map(([id]) => id),
      stepCount: activitySteps[ref].s.length,
    }));

    const rows = Object.entries(deliverables).flatMap(([stageId, list]) =>
      list.map((d) => {
        const ref = refOfTitle.get(d.title) ?? null;
        return {
          id: d.id,
          title: d.title,
          stageId,
          due: d.due,
          done: d.done,
          ref,
          step: deliverableStep(ref, producers),
        };
      }),
    );

    const stageEnds: Record<string, Date> = {};
    for (const [id, s] of Object.entries(schedule.stages)) stageEnds[id] = s.end;

    return attention({
      today,
      overdue,
      deliverables: rows,
      risks,
      stageEnds,
      tapeout: schedule.tapeout ?? null,
      upcoming,
    });
  }, [overdue, upcoming, risks, deliverables, schedule, today]);
}
