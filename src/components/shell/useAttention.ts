'use client';

import { useProgramActivities } from './useProgramActivities';
import { useMemo } from 'react';
import { attention, type AttentionRow } from '@/lib/attention';
import { deliverableStep, producersOf } from '@/lib/deliverableStatus';
import { useAppStore } from '@/store/useAppStore';
import { useDeliverableRefs } from './useDeliverableRefs';
import { useProgramWork } from './useProgramWork';

/**
 * What needs answering today, ranked.
 *
 * The ladder itself is `/lib/attention.ts` and is tested there; this is the
 * join it needs — which deliverable carries which reference, and which step
 * hands it over — plus the stage ends that decide what closes before tapeout.
 */
export function useAttention(limit: number): AttentionRow[] {
  const activitySteps = useProgramActivities();
  const { overdue, upcoming, risks } = useProgramWork();
  const deliverables = useAppStore((s) => s.deliverables);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);
  const refOf = useDeliverableRefs();

  return useMemo(() => {
    /* The reference each row carries, from the one resolver every table
       uses. A title alone cannot answer it: the Embedded SoC template keeps
       the SoC wording under its own prefixes, so "FFN — final full netlist"
       is SYN-D8 in one programme and ESYN-D8 in another, and a map from title
       to reference sent an SoC row to a step its programme does not have. */
    const producers = producersOf(activitySteps);

    const rows = Object.entries(deliverables).flatMap(([stageId, list]) =>
      list.map((d) => {
        const ref = refOf.get(d.id) ?? null;
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
      limit,
    });
  }, [activitySteps, overdue, upcoming, risks, deliverables, schedule, today, limit, refOf]);
}
