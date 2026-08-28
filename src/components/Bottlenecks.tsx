'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { activityFeeds, criticalPathActivities, detailActivityTitles } from '@/data/activityIndex';
import { bottleneckSummary, findBottlenecks, type Bottleneck } from '@/lib/bottlenecks';
import { fmtDate } from '@/lib/schedule';
import { dday } from '@/lib/derive';

/**
 * Where the programme is stuck.
 *
 * Every figure on a row is a fact the reader can go and check: which
 * deliverable is late and by how long, which activities feed off it, when the
 * first of them was due to start. There is no health score, because the first
 * question a score gets in a review is how it was arrived at, and answering
 * that costs more than the ranking is worth.
 *
 * The reference each row opens with is the same one the engineering table
 * prints, so it leads to the write-up already at that address.
 */
export function Bottlenecks() {
  const projectId = useAppStore((s) => s.projectId);
  const stages = useAppStore((s) => s.stages);
  const stageDetails = useAppStore((s) => s.stageDetails);
  const schedule = useAppStore((s) => s.schedule);
  const deliverables = useAppStore((s) => s.deliverables);
  const today = useAppStore((s) => s.today);
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(
    () =>
      findBottlenecks({
        stages,
        stageDetails,
        schedule,
        deliverables,
        today,
        feeds: activityFeeds,
        manMonths: {},
        critical: criticalPathActivities,
        titles: detailActivityTitles,
      }),
    [stages, stageDetails, schedule, deliverables, today],
  );

  const total = bottleneckSummary(list);
  const shortOf = (stageId: string) => stages.find((s) => s.id === stageId)?.shortTitle ?? stageId;

  return (
    <section id="bottlenecks" className="dash-panel" aria-label="Bottlenecks">
      <div className="dash-head-row">
        <span className="cap">Where the program is stuck</span>
        <span className="spacer" />
        <span className="note" data-bn-summary>
          {list.length
            ? `${total.activities} activities waiting · ${Math.round(total.manMonths)} MM · ${total.stages} stages`
            : 'nothing overdue is holding work up'}
        </span>
      </div>

      {list.length ? (
        <>
          <div className="bn-head" aria-hidden="true">
            <span>Ref</span>
            <span>
              Overdue activity
              <em>and the stage it sits in</em>
            </span>
            <span>
              Late by
              <em>its own deliverable</em>
            </span>
            <span>
              Work waiting
              <em>downstream, not yet started</em>
            </span>
            <span>
              Effort held
              <em>man-months of that work</em>
            </span>
            <span>
              First blocked
              <em>when it should have begun</em>
            </span>
            <span />
          </div>
          <ul className="bn-list">
            {list.map((b) => (
              <Row
                key={b.id}
                b={b}
                projectId={projectId}
                shortOf={shortOf}
                today={today}
                open={open === b.id}
                onToggle={() => setOpen(open === b.id ? null : b.id)}
              />
            ))}
          </ul>
        </>
      ) : (
        <p className="dash-empty">
          Nothing that is overdue has work waiting behind it. A late deliverable with nothing
          downstream is counted under Overdue Activities rather than here.
        </p>
      )}
    </section>
  );
}

function Row({
  b,
  projectId,
  shortOf,
  today,
  open,
  onToggle,
}: {
  b: Bottleneck;
  projectId: string;
  shortOf: (id: string) => string;
  today: Date;
  open: boolean;
  onToggle: () => void;
}) {
  /* The wait is easier to read as the stages it lands in than as a list. */
  const downstream = b.downstream;
  const byStage = useMemo(() => {
    const map = new Map<string, typeof downstream>();
    for (const d of downstream) map.set(d.stageId, [...(map.get(d.stageId) ?? []), d]);
    return [...map.entries()];
  }, [downstream]);

  return (
    <li className="bn" data-bn={b.id}>
      <div className="bn-row">
        <Link className="bn-id" href={`/p/${projectId}/activity/${b.id}`} title={b.title}>
          {b.id}
        </Link>
        <span className="bn-t">
          <b>{b.title}</b>
          <em>{b.stageTitle}</em>
        </span>
        <span className="bn-late">
          late {b.lateDays}d
          <em>{b.lateDeliverables.length} deliverable{b.lateDeliverables.length === 1 ? '' : 's'}</em>
        </span>
        <span className="bn-n">
          {b.waiting} waiting
          <em>
            {b.direct} direct · {b.stagesTouched} stage{b.stagesTouched === 1 ? '' : 's'}
          </em>
        </span>
        <span className="bn-mm">
          {Math.round(b.manMonthsAtRisk)} MM
          <em>{b.criticalDownstream} on critical path</em>
        </span>
        <span className="bn-when">
          {b.firstBlockedStart ? fmtDate(b.firstBlockedStart) : '—'}
          <em>{b.firstBlockedStart ? dday(b.firstBlockedStart, today) : 'nothing scheduled'}</em>
        </span>
        <button className="bn-more" aria-expanded={open} onClick={onToggle}>
          {open ? '−' : '+'}
        </button>
      </div>

      {open && (
        <div className="bn-open">
          <p className="bn-why">
            {b.lateDeliverables.map((d) => (
              <span key={d.id}>
                <b>{d.title}</b> was due {fmtDate(d.due)}, {d.days} days ago.
              </span>
            ))}
          </p>
          {byStage.map(([stageId, list]) => (
            <div className="bn-stage" key={stageId}>
              <span className="bn-stage-k">{shortOf(stageId)}</span>
              <span className="bn-chips">
                {list.map((d) => (
                  <Link
                    className={`bn-chip${d.waiting ? '' : ' started'}${d.critical ? ' crit' : ''}`}
                    key={d.id}
                    href={`/p/${projectId}/activity/${d.id}`}
                    title={`${d.title}${d.start ? ` — starts ${fmtDate(d.start)}` : ''}${
                      d.waiting ? '' : ' (already under way)'
                    }`}
                  >
                    {d.id}
                  </Link>
                ))}
              </span>
            </div>
          ))}
          <p className="bn-key">
            Solid is waiting on this. Faded has already started, so unblocking this does not
            release it. A dot marks the critical path.
          </p>
        </div>
      )}
    </li>
  );
}
