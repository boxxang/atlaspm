'use client';

import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { fmtDate } from '@/lib/schedule';
import { lifecyclePhases } from '@/data/scheduleProfiles';

/**
 * Every stage of the programme, in the order it runs them, grouped by
 * lifecycle phase.
 *
 * The prototype's version of this table has a COMPLETE column beside STARTS and
 * DUE — the day a stage's last step was actually handed over. That column is
 * missing here on purpose: it is derived from step state, which does not reach
 * the browser until the stage page ships. Showing an empty column would read as
 * "nothing is finished" rather than "not counted yet".
 */
export function StagesList({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const leaders = useAppStore((s) => s.leaders);
  const select = useRailStore((s) => s.select);

  /* Walked in profile order, so the phase headings come out chronological and a
     phase with no stages on this profile never gets a heading. */
  const groups = lifecyclePhases.map((phase) => ({
    phase,
    rows: stages.filter((s) => s.phaseId === phase.id),
  })).filter((g) => g.rows.length > 0);

  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">Stages</h1>
        <span className="pview-count">{stages.length}</span>
      </header>

      <div className="pview-body">
        <table className="ptable">
          <thead>
            <tr>
              <th className="num">#</th>
              <th>Code</th>
              <th>Stage</th>
              <th className="num">Starts</th>
              <th className="num">Due</th>
              <th>Lead</th>
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.phase.id}>
              <tr className="ptable-group">
                <th colSpan={6} scope="colgroup">
                  {g.phase.label}
                  <span className="pview-count">{g.rows.length}</span>
                </th>
              </tr>
              {g.rows.map((s) => {
                const span = schedule.stages[s.id];
                return (
                  <tr key={s.id} onMouseDown={() => select({ kind: 'stage', stageId: s.id })}>
                    <td className="num">{s.stage}</td>
                    <td>
                      <span className="pcode">{s.shortTitle}</span>
                    </td>
                    <th scope="row">
                      <Link href={`/p/${projectId}/stage/${s.id}`}>{s.title}</Link>
                    </th>
                    <td className="num">{span ? fmtDate(span.start) : '—'}</td>
                    <td className="num">{span ? fmtDate(span.end) : '—'}</td>
                    <td>{leaders[s.id]?.name ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
    </>
  );
}
