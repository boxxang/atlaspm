'use client';

import Link from 'next/link';
import { fmtDate } from '@/lib/schedule';
import { isStepLate } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';
import { useProgramWork } from './useProgramWork';
import { useStageSteps } from './useStageSteps';

/**
 * Every activity of the programme, grouped by the stage that runs it.
 *
 * Grouped rather than given a stage column: the bar above each block already
 * says the stage, so a column repeating it says the same thing twice — and the
 * room it frees turns into the lead role, which nothing else was saying.
 */
const COLS = { gridTemplateColumns: '66px 1fr 116px 84px 84px 150px' };

export function ActivitiesPage({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  return (
    <>
      <div className="hd">
        <h1>Activities</h1>
        <Count />
        <span style={{ flexGrow: 1 }} />
        <Steps />
      </div>
      {stages.map((s) => (
        <StageBlock key={s.id} stageId={s.id} projectId={projectId} />
      ))}
    </>
  );
}

function Count() {
  const { steps } = useProgramWork();
  const acts = new Set(steps.map((s) => s.act)).size;
  return <span className="pill">{acts}</span>;
}

function Steps() {
  const { steps } = useProgramWork();
  return (
    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
      {steps.length.toLocaleString()} steps across 23 stages
    </span>
  );
}

function StageBlock({ stageId, projectId }: { stageId: string; projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const today = useAppStore((s) => s.today);
  const rows = useStageSteps(stageId);
  const stage = stages.find((s) => s.id === stageId);
  if (!stage || rows.length === 0) return null;

  const done = rows.filter((a) => a.state.phase === 'done').length;
  const risky = rows.filter((a) => a.steps.some((s) => isStepLate(s, today))).length;
  const mm = stage.engineeringEffort.reduce((n, e) => n + e, 0);

  return (
    <div>
      <div className="groupbar" style={{ cursor: 'default' }}>
        <b>{stage.title}</b>
        <span className="pill" style={{ fontSize: 10.5 }}>
          {stage.shortTitle}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {done}/{rows.length}
        </span>
        {risky > 0 && (
          <span className="pill risk" style={{ fontSize: 10.5 }}>
            {risky} at risk
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
          {Math.round(mm).toLocaleString()} M/M
        </span>
      </div>

      <div className="thead" style={COLS}>
        <span>REF</span>
        <span>ACTIVITY</span>
        <span>STEPS</span>
        <span>STARTS</span>
        <span>ENDS</span>
        <span>LEAD ROLE</span>
      </div>

      {rows.map((a) => {
        const late = a.steps.some((s) => isStepLate(s, today));
        const first = a.steps[0];
        const last = a.steps[a.steps.length - 1];
        return (
          <Link
            key={a.ref}
            className={late ? 'trow rk' : 'trow'}
            href={`/p/${projectId}/activity/${a.ref}`}
            data-activity={a.ref}
            style={COLS}
          >
            <span className="ref" style={{ justifySelf: 'start' }}>
              {a.ref}
            </span>
            <span className="ell">{a.title}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="seg">
                {a.steps.map((s) => (
                  <i key={s.n} className={s.done ? 'd' : ''} />
                ))}
              </span>
              <span
                className="num"
                data-done={`${a.state.done}/${a.state.total}`}
                data-all={a.state.done === a.state.total ? '' : undefined}
                style={{
                  fontSize: 11.5,
                  color:
                    a.state.done === a.state.total
                      ? 'var(--ok)'
                      : late
                        ? 'var(--risk)'
                        : 'var(--ink-2)',
                  fontWeight: a.state.done === a.state.total || late ? 600 : 400,
                }}
              >
                {a.state.done}/{a.state.total}
              </span>
            </span>
            <span className="num" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
              {first ? fmtDate(first.start) : '—'}
            </span>
            <span className="num" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
              {last ? fmtDate(last.due) : '—'}
            </span>
            <span className="ell" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {a.activity.role}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
