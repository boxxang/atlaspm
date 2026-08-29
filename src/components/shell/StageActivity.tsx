'use client';

import { fmtDate } from '@/lib/schedule';
import { isStepLate, type ResolvedStep } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { useStageSteps, type StageActivity as Activity } from './useStageSteps';

/**
 * A stage's activities, and the steps inside the one that is open.
 *
 * The prototype opens an activity in place rather than on its own page: the row
 * stays where it is and its steps appear indented under it, while the rest of
 * the table dims. That indent and that dimming are the whole point — an open
 * activity has to be somewhere you can see the rest of the stage around.
 */
export function StageActivityTab({ stageId }: { stageId: string }) {
  const activities = useStageSteps(stageId);
  const selection = useRailStore((s) => s.selection);
  const select = useRailStore((s) => s.select);

  /* Which activity is open: the one selected, or the one the selected step
     belongs to — picking a step must not close the block it is in. */
  const openRef =
    selection.kind === 'activity' ? selection.act : selection.kind === 'step' ? selection.act : null;

  if (!activities.length) {
    return <p className="pview-todo">No activities are written up for this stage.</p>;
  }

  return (
    <table className={openRef ? 'ptable pacts dimmed' : 'ptable pacts'}>
      <thead>
        <tr>
          <th>Ref</th>
          <th>Activity</th>
          <th className="num">Steps</th>
          <th>Delivers</th>
          <th className="num">Ends</th>
          <th>Lead role</th>
        </tr>
      </thead>
      <tbody>
        {activities.map((a) => (
          <ActivityRows key={a.ref} a={a} open={a.ref === openRef} onOpen={select} />
        ))}
      </tbody>
    </table>
  );
}

function ActivityRows({
  a,
  open,
  onOpen,
}: {
  a: Activity;
  open: boolean;
  onOpen: (s: { kind: 'activity'; act: string }) => void;
}) {
  const last = a.steps[a.steps.length - 1];
  return (
    <>
      {/* The whole row opens it, which is what the prototype settled on — the
          caret alone was a small target for the one thing every row is for. The
          button stays as the focusable, announcing control. */}
      <tr
        className={open ? 'pact open' : 'pact'}
        data-act={a.ref}
        onClick={() => onOpen({ kind: 'activity', act: a.ref })}
      >
        <td>
          <button
            type="button"
            className="pact-open"
            onClick={(e) => {
              e.stopPropagation();
              onOpen({ kind: 'activity', act: a.ref });
            }}
            aria-expanded={open}
            aria-label={`${open ? 'Close' : 'Open'} ${a.ref}`}
          >
            <span className="pact-caret" aria-hidden="true">
              {open ? '⌄' : '›'}
            </span>
            <span className="pref">{a.ref}</span>
          </button>
        </td>
        <th scope="row">{a.title}</th>
        <td className="num">
          <StepPips steps={a.steps} />
          <span className={a.state.done === a.state.total ? 'pdone all' : 'pdone'}>
            {a.state.done}/{a.state.total}
          </span>
        </td>
        <td>
          {a.delivers.length ? (
            a.delivers.map(([ref]) => (
              <span className="pref soft" key={ref}>
                {ref}
              </span>
            ))
          ) : (
            <span className="pmuted">—</span>
          )}
        </td>
        <td className="num">{last ? fmtDate(last.due) : '—'}</td>
        <td className="prole">{a.activity.role || '—'}</td>
      </tr>
      {open && (
        <tr className="pstepblock-row">
          <td colSpan={6}>
            <StepBlock a={a} />
          </td>
        </tr>
      )}
    </>
  );
}

/** The run of steps as a bar of pips — done, running, late, not started. */
function StepPips({ steps }: { steps: readonly ResolvedStep[] }) {
  const today = useAppStore((s) => s.today);
  return (
    <span className="ppips" aria-hidden="true">
      {steps.map((s) => (
        <i key={s.n} className={`ppip ${pipTone(s, today)}`} />
      ))}
    </span>
  );
}

const pipTone = (s: ResolvedStep, today: Date) =>
  s.done ? 'done' : isStepLate(s, today) ? 'late' : today >= s.start ? 'run' : 'future';

function StepBlock({ a }: { a: Activity }) {
  const today = useAppStore((s) => s.today);
  const setStepState = useAppStore((s) => s.setStepState);
  const selection = useRailStore((s) => s.selection);
  const select = useRailStore((s) => s.select);
  const parallel = a.steps.filter((s) => s.par).length;

  return (
    <div className="pstepblock">
      <div className="pstepblock-cap">
        <span className="pref">{a.ref}</span>
        <span>
          {a.steps.length} steps
          {parallel > 0 && `, ${parallel} run in parallel`}
        </span>
      </div>
      <table className="ptable psteps">
        <thead>
          <tr>
            <th className="pcheck-col">
              <span className="visually-hidden">Done</span>
            </th>
            <th className="num">#</th>
            <th>Step</th>
            <th>Hands over</th>
            <th>Status</th>
            <th className="num">Due</th>
            <th className="num">Completed</th>
          </tr>
        </thead>
        <tbody>
          {a.steps.map((s) => {
            const picked = selection.kind === 'step' && selection.act === a.ref && selection.n === s.n;
            const late = isStepLate(s, today);
            return (
              <tr
                key={s.n}
                className={picked ? 'pstep picked' : 'pstep'}
                data-step={`${a.ref}:${s.n}`}
                onClick={() => select({ kind: 'step', act: a.ref, n: s.n })}
              >
                <td className="pcheck-col">
                  <input
                    type="checkbox"
                    checked={s.done}
                    aria-label={`Step ${s.n} done`}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setStepState(a.ref, s.n, {
                        done: e.target.checked,
                        doneAt: e.target.checked ? new Date() : null,
                      })
                    }
                  />
                </td>
                <td className="num">{s.n}</td>
                <th scope="row" className={s.par ? 'pstep-t par' : 'pstep-t'}>
                  {s.par && (
                    <span className="ppar" title="Runs alongside the step before it">
                      ⇥
                    </span>
                  )}
                  {s.text}
                </th>
                <td className="pout">
                  {(a.outputs.get(s.n) ?? []).join(' · ') || <span className="pmuted">—</span>}
                </td>
                <td>
                  <StatusPill step={s} late={late} today={today} />
                </td>
                <td className={late ? 'num late' : 'num'}>{fmtDate(s.due)}</td>
                <td className="num">{s.doneAt ? fmtDate(s.doneAt) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({
  step,
  late,
  today,
}: {
  step: ResolvedStep;
  late: boolean;
  today: Date;
}) {
  if (step.done) return <span className="ppill ok">Completed</span>;
  if (late) return <span className="ppill risk">Overdue</span>;
  if (today >= step.start) return <span className="ppill run">In progress</span>;
  return <span className="ppill">Not started</span>;
}
