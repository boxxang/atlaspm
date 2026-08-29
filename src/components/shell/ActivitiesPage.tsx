'use client';

import Link from 'next/link';
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles } from '@/data/activityIndex';
import { fmtDate } from '@/lib/schedule';
import { activityState, fromStepIndex, isStepLate, resolveSteps } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';

/**
 * Every activity of the programme, grouped by the stage that runs it.
 *
 * Grouped rather than given a stage column, the way the deliverables board is:
 * a heading once per stage reads better than the same word repeated down
 * fifteen rows, and it puts the stage's activities where you can see them as a
 * set.
 */
export function ActivitiesPage({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const stepStates = useAppStore((s) => s.stepStates);
  const today = useAppStore((s) => s.today);

  const groups = stages
    .map((stage) => {
      const span = schedule.stages[stage.id];
      const rows = Object.keys(activitySteps)
        .filter((ref) => activitySteps[ref].st === stage.id)
        .map((ref) => {
          const activity = fromStepIndex(ref, activitySteps[ref]);
          const steps = span ? resolveSteps(span.start, activity, stepStates) : [];
          return {
            ref,
            title: detailActivityTitles[ref] ?? ref,
            role: activity.role,
            steps,
            state: activityState(steps, today),
            late: steps.filter((s) => isStepLate(s, today)).length,
            ends: steps.length ? steps[steps.length - 1].due : null,
          };
        });
      return { stage, rows };
    })
    .filter((g) => g.rows.length > 0);

  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">Activities</h1>
        <span className="pview-count">{total}</span>
      </header>

      <div className="pview-body">
        <table className="ptable pboard" data-board>
          <thead>
            <tr>
              <th className="mid">Ref</th>
              <th className="pwrapcol">Activity</th>
              <th className="mid num">Steps</th>
              <th className="mid num">Late</th>
              <th className="mid num">Ends</th>
              <th>Lead role</th>
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.stage.id}>
              <tr className="ptable-group">
                <th colSpan={6} scope="colgroup">
                  <Link href={`/p/${projectId}/stage/${g.stage.id}/activity`}>
                    {g.stage.title}
                  </Link>
                  <span className="pview-count">{g.rows.length}</span>
                </th>
              </tr>
              {g.rows.map((r) => (
                <tr key={r.ref} data-activity={r.ref}>
                  <td className="mid">
                    <Link className="ref" href={`/p/${projectId}/activity/${r.ref}`}>
                      {r.ref}
                    </Link>
                  </td>
                  <th scope="row" className="pwrap pwrapcol">
                    {r.title}
                  </th>
                  <td className="mid num">
                    <span
                      className={r.state.done === r.state.total ? 'num done-all' : 'num'}
                      data-done={`${r.state.done}/${r.state.total}`}
                      data-all={r.state.done === r.state.total ? '' : undefined}
                    >
                      {r.state.done}/{r.state.total}
                    </span>
                  </td>
                  <td className="mid num">
                    {r.late ? <span className="late">{r.late}</span> : <span className="muted">—</span>}
                  </td>
                  <td className="mid num">{r.ends ? fmtDate(r.ends) : '—'}</td>
                  <td className="soft">{r.role || '—'}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </>
  );
}
