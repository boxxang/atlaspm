'use client';

import { fmtDate } from '@/lib/schedule';
import { isStepLate, type ResolvedStep } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { Chevron, ctVar, CTHead, type Col } from './ctable';
import { useStageSteps, type StageActivity as Activity } from './useStageSteps';

/**
 * A stage's activities, and the steps inside the one that is open.
 *
 * The prototype opens an activity in place rather than on its own page: the row
 * stays where it is and its steps appear indented under it, while the rest of
 * the table dims. That indent and that dimming are the whole point — an open
 * activity has to be somewhere you can see the rest of the stage around.
 */
const COLS: Col[] = [
  ['chk', 16, ''],
  ['ref', 72, 'REF'],
  ['title', null, 'ACTIVITY'],
  ['steps', 128, 'STEPS'],
  ['delivers', 92, 'DELIVERS'],
  ['ends', 80, 'ENDS'],
  ['lead', 148, 'LEAD ROLE'],
];

export function StageActivityTab({ stageId }: { stageId: string }) {
  const activities = useStageSteps(stageId);
  const selection = useRailStore((s) => s.selection);
  const select = useRailStore((s) => s.select);
  const today = useAppStore((s) => s.today);

  /* Which activity is open: the one selected, or the one the selected step
     belongs to — picking a step must not close the block it is in. */
  const openRef =
    selection.kind === 'activity' ? selection.act : selection.kind === 'step' ? selection.act : null;

  if (!activities.length) {
    return <div className="empty">No activities are written up for this stage.</div>;
  }

  return (
    <div
      className={openRef ? 'ctable focused' : 'ctable'}
      data-acts
      data-focused={openRef ? '' : undefined}
      style={{ ['--ct' as string]: ctVar(COLS) }}
    >
      <CTHead cols={COLS} />
      {activities.map((a) => {
        const open = a.ref === openRef;
        const last = a.steps[a.steps.length - 1];
        const risky = a.steps.some((s) => isStepLate(s, today));
        const done = a.state.total > 0 && a.state.done >= a.state.total;
        return (
          <div key={a.ref} style={{ display: 'contents' }}>
            <button
              type="button"
              className={
                'trow' +
                (risky ? ' rk' : '') +
                (selection.kind === 'activity' && selection.act === a.ref ? ' on' : '') +
                (open ? ' open' : '')
              }
              data-act={a.ref}
              onClick={() => select({ kind: 'activity', act: a.ref })}
              aria-expanded={open}
            >
              <span style={{ display: 'inline-flex' }}>
                <Chevron open={open} />
              </span>
              <span className="ref" style={{ justifySelf: 'start' }}>
                {a.ref}
              </span>
              <span
                className="ell"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  color: done ? 'var(--ink-2)' : undefined,
                  fontWeight: risky ? 600 : undefined,
                }}
              >
                {risky && <span className="dot" style={{ background: 'var(--risk)' }} />}
                {a.title}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Segments steps={a.steps} />
                <StateChip a={a} />
              </span>
              <span style={{ justifySelf: 'start', minWidth: 0 }}>
                {a.delivers[0] && (
                  <span className="pill" style={{ fontSize: 10.5 }}>
                    {a.delivers[0][0]}
                  </span>
                )}
              </span>
              <span className="num" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
                {last ? fmtDate(last.due) : '—'}
              </span>
              <span className="ell" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                {a.activity.role}
              </span>
            </button>
            {open && <StepBlock a={a} />}
          </div>
        );
      })}
    </div>
  );
}

/** The run of steps as a bar of segments — done, running now, still ahead. */
function Segments({ steps }: { steps: readonly ResolvedStep[] }) {
  const today = useAppStore((s) => s.today);
  const current = steps.findIndex((s) => !s.done && today >= s.start);
  return (
    <span className="seg">
      {steps.map((s, i) => (
        <i key={s.n} className={s.done ? 'd' : i === current ? 'now' : ''} />
      ))}
    </span>
  );
}

function StateChip({ a }: { a: Activity }) {
  const today = useAppStore((s) => s.today);
  const risky = a.steps.some((s) => isStepLate(s, today));
  const text = `${a.state.done}/${a.state.total}`;
  if (a.state.phase === 'done')
    return (
      <span
        className="num"
        data-done={text}
        data-all
        style={{ fontSize: 11.5, color: 'var(--ok)', fontWeight: 600 }}
      >
        {text}
      </span>
    );
  if (a.state.phase === 'future')
    return (
      <span className="num" data-done={text} style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
        {text}
      </span>
    );
  return (
    <span
      className="num"
      data-done={text}
      style={{
        fontSize: 11.5,
        color: risky ? 'var(--risk)' : 'var(--ink-2)',
        fontWeight: risky ? 600 : 400,
      }}
    >
      {text}
    </span>
  );
}

const STEP_COLS: Col[] = [
  ['chk', 26, ''],
  ['n', 26, '#'],
  ['title', null, 'STEP'],
  ['out', 210, 'HANDS OVER'],
  ['status', 92, 'STATUS'],
  ['due', 84, 'DUE'],
  ['done', 84, 'COMPLETED'],
];

function StepBlock({ a }: { a: Activity }) {
  const today = useAppStore((s) => s.today);
  const setStepState = useAppStore((s) => s.setStepState);
  const selection = useRailStore((s) => s.selection);
  const select = useRailStore((s) => s.select);
  const parallel = a.steps.filter((s) => s.par).length;

  return (
    <div className="stepwrap">
      <div className="stepbox" data-stepblock>
        <div className="steprow" data-stepblock-cap>
          <span className="ref">{a.ref}</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            {a.steps.length} steps
            {parallel > 0 && `, ${parallel} run in parallel`}
          </span>
        </div>
        <div className="ctable" style={{ ['--ct' as string]: ctVar(STEP_COLS) }}>
          <CTHead cols={STEP_COLS} />
          {a.steps.map((s) => {
            const picked =
              selection.kind === 'step' && selection.act === a.ref && selection.n === s.n;
            const late = isStepLate(s, today);
            return (
              <button
                type="button"
                key={s.n}
                className={picked ? 'trow stepsel' : 'trow'}
                data-step={`${a.ref}:${s.n}`}
                onClick={() => select({ kind: 'step', act: a.ref, n: s.n })}
              >
                <span style={{ display: 'inline-flex' }}>
                  <input
                    type="checkbox"
                    className="cb"
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
                </span>
                <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  {s.n}
                </span>
                <span
                  className="ell"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left' }}
                >
                  {s.par && (
                    <span className="par" title="Runs alongside the step before it">
                      ⇥
                    </span>
                  )}
                  {s.text}
                </span>
                <span className="ell" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                  {(a.outputs.get(s.n) ?? []).join(' · ') || '—'}
                </span>
                <span style={{ justifySelf: 'start' }}>
                  <StatusPill step={s} late={late} today={today} />
                </span>
                <span
                  className="num"
                  data-due
                  style={{
                    fontSize: 12,
                    color: late ? 'var(--risk)' : 'var(--ink-2)',
                    fontWeight: late ? 600 : 400,
                  }}
                >
                  {fmtDate(s.due)}
                </span>
                <span className="num" data-completed style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  {s.doneAt ? fmtDate(s.doneAt) : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ step, late, today }: { step: ResolvedStep; late: boolean; today: Date }) {
  if (step.done)
    return (
      <span className="pill ok" style={{ fontSize: 10.5 }}>
        Completed
      </span>
    );
  if (late)
    return (
      <span className="pill risk" style={{ fontSize: 10.5 }}>
        Overdue
      </span>
    );
  if (today >= step.start)
    return (
      <span className="pill acc" style={{ fontSize: 10.5 }}>
        In progress
      </span>
    );
  return (
    <span className="pill" style={{ fontSize: 10.5 }}>
      Not started
    </span>
  );
}
