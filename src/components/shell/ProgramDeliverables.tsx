'use client';

import Link from 'next/link';
import { deliverableStatus } from '@/lib/deliverableStatus';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';

/**
 * Every key deliverable on the programme, grouped by the stage that owns it.
 *
 * Grouped rather than given a stage column: a heading once beats the same word
 * repeated down nine rows, and it puts a stage's deliverables where they can be
 * read as a set. Completing one happens on its stage, where the handover is.
 */
export function ProgramDeliverables({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const deliverables = useAppStore((s) => s.deliverables);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);

  const groups = stages
    .map((s) => ({ stage: s, rows: deliverables[s.id] ?? [] }))
    .filter((g) => g.rows.length > 0);
  const all = groups.flatMap((g) => g.rows);
  const done = all.filter((d) => d.done).length;

  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">Deliverables</h1>
        <span className="pview-count">
          {done}/{all.length}
        </span>
        <span className="pview-spacer" />
        <span className="pview-note">
          Completed by a handover — a body, an artefact and the date it was accepted.
        </span>
      </header>

      <div className="pview-body">
        <table className="ptable pboard">
          <thead>
            <tr>
              <th className="pwrapcol">Key deliverable</th>
              <th className="mid">Status</th>
              <th className="mid num">Due</th>
              <th className="mid num">Completed</th>
            </tr>
          </thead>
          {groups.map((g) => {
            const span = schedule.stages[g.stage.id];
            return (
              <tbody key={g.stage.id}>
                <tr className="ptable-group">
                  <th colSpan={4} scope="colgroup">
                    <Link href={`/p/${projectId}/stage/${g.stage.id}/deliverables`}>
                      {g.stage.title}
                    </Link>
                    <span className="pview-count">
                      {g.rows.filter((d) => d.done).length}/{g.rows.length}
                    </span>
                  </th>
                </tr>
                {g.rows.map((d) => {
                  /* Started once the stage has: which activity produces it is a
                     stage-page question, and this list is about dates. */
                  const status = deliverableStatus(
                    d,
                    today,
                    !!span && today >= span.start,
                  );
                  return (
                    <tr key={d.id} data-deliverable={d.id}>
                      <th scope="row" className="pwrap pwrapcol">
                        <Link
                          href={`/p/${projectId}/stage/${g.stage.id}/deliverables?deliverable=${d.id}`}
                        >
                          {d.title}
                        </Link>
                      </th>
                      <td className="mid">
                        <span
                          className={`ppill ${
                            status.kind === 'done'
                              ? 'ok'
                              : status.kind === 'late'
                                ? 'risk'
                                : status.kind === 'run'
                                  ? 'run'
                                  : ''
                          }`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className={status.kind === 'late' ? 'mid num late' : 'mid num'}>
                        {d.due ? fmtDate(d.due) : '—'}
                      </td>
                      <td className="mid num">{d.completedAt ? fmtDate(d.completedAt) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            );
          })}
        </table>
      </div>
    </>
  );
}
