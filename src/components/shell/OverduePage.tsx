'use client';

import Link from 'next/link';
import { detailActivityTitles } from '@/data/activityIndex';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { useProgramWork } from './useProgramWork';

/**
 * Every step past its due date with nothing handed over.
 *
 * Overdue means steps, and only steps. A key deliverable past its date is
 * Delayed — a different word for a different thing, said where deliverables are
 * listed. Counting both under one word made the same figure mean two things on
 * two screens.
 *
 * Soonest-due first, so the list reads in the order the work fell over. No stage
 * column: the activity reference already says which stage.
 */
export function OverduePage({ projectId }: { projectId: string }) {
  const { overdue } = useProgramWork();
  const today = useAppStore((s) => s.today);

  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">Overdue</h1>
        <span className="pview-count">{overdue.length}</span>
        <span className="grow" />
        <span className="pview-note">
          A step past its date with nothing handed over. Oldest first.
        </span>
      </header>

      <div className="pview-body">
        {overdue.length === 0 ? (
          <p className="mono-note">Nothing is late. Every step past its date has been handed over.</p>
        ) : (
          <table className="ptable pboard" data-board>
            <thead>
              <tr>
                <th className="mid">Activity</th>
                <th className="mid pnarrow">Step</th>
                <th className="pwrapcol">What’s late</th>
                <th className="mid">Status</th>
                <th className="mid num">Due</th>
                <th className="mid num">Late by</th>
                <th className="mid">Owner</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((o) => (
                <tr key={o.id} data-overdue={`${o.act}:${o.stepN}`}>
                  <td className="mid">
                    <Link
                      className="ref"
                      href={`/p/${projectId}/stage/${o.stageId}/activity`}
                      title={detailActivityTitles[o.act] ?? o.act}
                    >
                      {o.act}
                    </Link>
                  </td>
                  <td className="mid num pnarrow">{o.stepN}</td>
                  <th scope="row" className="pwrap pwrapcol">
                    {o.title}
                  </th>
                  <td className="mid">
                    <span className="pill risk">Overdue</span>
                  </td>
                  <td className="mid num late">{fmtDate(o.due)}</td>
                  <td className="mid num late">{daysSince(o.due, today)} days</td>
                  <td className="mid">
                    {o.owner || <span className="muted">Unassigned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

const DAY = 864e5;
const daysSince = (d: Date, today: Date) =>
  Math.max(0, Math.round((today.getTime() - d.getTime()) / DAY));
