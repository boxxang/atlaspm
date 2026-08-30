'use client';

import { useSearchParams } from 'next/navigation';
import { Fragment, useState } from 'react';
import { fmtDate } from '@/lib/schedule';
import { isStepLate, type ResolvedStep } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { Chevron, ctVar, CTHead, type Col } from './ctable';
import { CheckBox } from './icons';
import { useProgramWork } from './useProgramWork';
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
  /* which activity the URL asked for, and whether the rail has caught up */
  const wantAct = useSearchParams().get('act');
  const openAct = selection.kind === 'activity' ? selection.act : null;

  /* Expanding and selecting are two things, as the mockup has them: the chevron
     opens the steps and leaves the rail alone, the rest of the row does both.
     One control doing only the second means you cannot read a step list without
     losing the panel you were reading.

     A link that names a step or an activity — the Timeline's rows, the
     Overview's, the risk card's "Open step" — opens the block it is in. A step
     cannot be shown otherwise, and an activity arrived at from elsewhere should
     be open on arrival rather than needing a second click. It is adjusted
     during render rather than in an effect, which would paint the closed block
     first and then open it.

     Keyed on the arriving reference, not on the selection: the row click below
     selects an activity too, and reacting to that would make the toggle unable
     to close what it just opened. */
  const arriving =
    selection.kind === 'step' ? selection.act : wantAct && wantAct === openAct ? wantAct : null;
  const [expanded, setExpanded] = useState<string | null>(arriving);
  const [lastArriving, setLastArriving] = useState<string | null>(arriving);
  if (arriving && arriving !== lastArriving) {
    setLastArriving(arriving);
    setExpanded(arriving);
  }
  const shown = expanded;
  const toggle = (ref: string) => setExpanded(expanded === ref ? null : ref);

  if (!activities.length) {
    return <div className="empty">No activities are written up for this stage.</div>;
  }

  return (
    <div
      className={shown ? 'ctable focused' : 'ctable'}
      data-acts
      data-focused={shown ? '' : undefined}
      style={{ ['--ct' as string]: ctVar(COLS) }}
    >
      <CTHead cols={COLS} />
      {activities.map((a) => {
        const open = a.ref === shown;
        const last = a.steps[a.steps.length - 1];
        const risky = a.steps.some((s) => isStepLate(s, today));
        const done = a.state.total > 0 && a.state.done >= a.state.total;
        return (
          <Fragment key={a.ref}>
            <button
              type="button"
              className={
                'trow' +
                (risky ? ' rk' : '') +
                (selection.kind === 'activity' && selection.act === a.ref ? ' on' : '') +
                (open ? ' open' : '')
              }
              data-act={a.ref}
              onClick={() => {
                select({ kind: 'activity', act: a.ref });
                toggle(a.ref);
              }}
              aria-expanded={open}
            >
              <span
                style={{ display: 'inline-flex' }}
                data-exp={a.ref}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(a.ref);
                }}
              >
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
          </Fragment>
        );
      })}
    </div>
  );
}

/** The run of steps as a bar of segments — done, running now, still ahead. */
export function Segments({ steps }: { steps: readonly ResolvedStep[] }) {
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

/**
 * The steps inside an open activity.
 *
 * One table, as the mockup draws it: the STEP column's own header carries the
 * activity's ref and how many steps there are, so there is no caption row above
 * it repeating what the row you just clicked already said. POSTS is on the end
 * because a step nobody has written about and a step with an argument on it
 * should not look alike.
 */
const STEP_COLS: Col[] = [
  ['pad', 6, ''],
  ['cb', 18, ''],
  ['n', 22, '#'],
  ['step', null, 'STEP'],
  ['status', 106, 'STATUS'],
  ['output', 212, 'OUTPUT'],
  ['due', 90, 'DUE'],
  ['done', 96, 'COMPLETED'],
  ['posts', 44, 'POSTS'],
];

function StepBlock({ a }: { a: Activity }) {
  const today = useAppStore((s) => s.today);
  const setStepState = useAppStore((s) => s.setStepState);
  const selection = useRailStore((s) => s.selection);
  const select = useRailStore((s) => s.select);
  const posts = useAppStore((s) => s.posts);
  const { risks } = useProgramWork();
  const parallel = a.steps.filter((s) => s.par).length;
  const last = a.steps.length;
  const firstRef = a.delivers[0]?.[0] ?? null;

  const cols: Col[] = STEP_COLS.map((c) =>
    c[0] === 'step'
      ? [
          c[0],
          c[1],
          `${a.ref} — ${a.steps.length} steps${parallel ? `, ${parallel} run in parallel` : ''}`,
        ]
      : c,
  );

  return (
    <div className="stepwrap">
      <div className="ctable stepbox" data-stepblock style={{ ['--ct' as string]: ctVar(cols) }}>
        <CTHead cols={cols} cls="steprow hdr" />
        {a.steps.map((s, i) => {
          const picked = selection.kind === 'step' && selection.act === a.ref && selection.n === s.n;
          const late = isStepLate(s, today);
          const risky = risks.some((r) => r.act === a.ref && r.stepN === s.n);
          const now = !s.done && today >= s.start && today <= s.end;
          const mine = posts.filter(
            (p) => p.activityRef === a.ref && p.stepN === s.n && !p.parentId,
          ).length;
          const out = a.outputs.get(s.n) ?? [];
          return (
            <div
              key={s.n}
              className={
                'steprow stepclick' +
                (risky ? ' rk' : now ? ' now' : '') +
                (i === last - 1 ? ' last' : '') +
                (picked ? ' sel' : '')
              }
              data-step={`${a.ref}:${s.n}`}
              onClick={() => select({ kind: 'step', act: a.ref, n: s.n })}
            >
              <span />
              <CheckBox
                on={s.done}
                label={`Step ${s.n} done`}
                onToggle={(next) =>
                  setStepState(a.ref, s.n, { done: next, doneAt: next ? new Date() : null })
                }
              />
              <span
                className="num"
                style={{
                  fontSize: 11,
                  color: now ? 'var(--accent)' : risky ? 'var(--risk-ink)' : 'var(--ink-3)',
                  fontWeight: now || risky ? 700 : 400,
                }}
              >
                {s.n}
              </span>
              <span
                className="ell"
                style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}
              >
                <span
                  className={s.par ? 'par ell' : 'ell'}
                  style={s.done ? { color: 'var(--ink-2)' } : undefined}
                >
                  {s.text}
                </span>
                {risky && (
                  <span className="pill risk" style={{ fontSize: 10.5, flexShrink: 0 }}>
                    RISK FLAGGED
                  </span>
                )}
                {s.n === last && firstRef && (
                  <span className="pill acc" style={{ fontSize: 10.5, flexShrink: 0 }}>
                    TICKS {firstRef}
                  </span>
                )}
              </span>
              <span
                style={{
                  justifySelf: 'start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <StatusPill step={s} late={late} today={today} />
                {now && s.pct > 0 && (
                  <span
                    className="num"
                    style={{ fontSize: 10.5, color: 'var(--accent)', fontWeight: 600 }}
                  >
                    {s.pct}%
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--ink-2)',
                  lineHeight: 1.35,
                  padding: '5px 0',
                  minWidth: 0,
                }}
              >
                {out.join(' · ')}
              </span>
              <span
                className="num"
                data-due
                style={{
                  fontSize: 12,
                  fontWeight: late ? 600 : 400,
                  color: late ? 'var(--risk)' : now ? 'var(--ink)' : 'var(--ink-3)',
                }}
              >
                {fmtDate(s.due)}
                {s.dueSet && (
                  <span title="edited from the schedule baseline" style={{ color: 'var(--accent)' }}>
                    {' '}
                    *
                  </span>
                )}
              </span>
              <span
                className="num"
                data-completed
                style={{ fontSize: 12, color: s.doneAt ? 'var(--ink-2)' : 'var(--ink-4)' }}
              >
                {s.doneAt ? fmtDate(s.doneAt) : '—'}
              </span>
              <span
                className="r num"
                style={{
                  fontSize: 11,
                  color: mine ? (risky ? 'var(--risk-ink)' : 'var(--ink-2)') : 'var(--ink-4)',
                  fontWeight: mine && risky ? 700 : 400,
                }}
              >
                {mine || '—'}
              </span>
            </div>
          );
        })}
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
