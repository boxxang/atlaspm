'use client';

import Link from 'next/link';
import { lifecyclePhases } from '@/data/scheduleProfiles';
import { fmtDate } from '@/lib/schedule';
import { stageDoneAt } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from './icons';
import { useProgramWork } from './useProgramWork';

/**
 * Every stage of the programme, grouped by lifecycle phase.
 *
 * COMPLETE is the day the stage's last step was actually handed over — and only
 * once every step is done. A stage with one step still open is not complete,
 * whatever the calendar says, so it reads "—" and DUE turns red instead.
 */
const COLS = { gridTemplateColumns: '34px 54px 1fr 96px 78px 76px 76px 82px 104px' };

export function StagesList({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const deliverables = useAppStore((s) => s.deliverables);
  const leaders = useAppStore((s) => s.leaders);
  const today = useAppStore((s) => s.today);
  const { steps, risks } = useProgramWork();

  const byStage = new Map<string, typeof steps>();
  for (const s of steps) {
    const list = byStage.get(s.stageId);
    if (list) list.push(s);
    else byStage.set(s.stageId, [s]);
  }

  const groups = lifecyclePhases
    .map((phase) => ({ phase, rows: stages.filter((s) => s.phaseId === phase.id) }))
    .filter((g) => g.rows.length > 0);

  return (
    <>
      <div className="hd">
        <h1>Stages</h1>
        <span className="pill">{stages.length}</span>
        <span style={{ flexGrow: 1 }} />
        <Link className="btn sm" href={`/p/${projectId}/timeline`}>
          Timeline
        </Link>
      </div>

      <div className="thead" style={COLS}>
        <span>#</span>
        <span>CODE</span>
        <span>STAGE</span>
        <span>STEPS</span>
        <span>DELIVERS</span>
        <span>STARTS</span>
        <span>DUE</span>
        <span>COMPLETE</span>
        <span>LEAD</span>
      </div>

      {groups.map((g) => (
        <div key={g.phase.id}>
          <div className="groupbar" style={{ cursor: 'default' }}>
            <b>{g.phase.label}</b>
            <span className="pill">{g.rows.length}</span>
          </div>
          {g.rows.map((s) => {
            const span = schedule.stages[s.id];
            const mine = byStage.get(s.id) ?? [];
            const done = mine.filter((x) => x.done).length;
            const dl = deliverables[s.id] ?? [];
            const dd = dl.filter((d) => d.done).length;
            const rk = risks.some((r) => r.stageId === s.id);
            const lead = leaders[s.id]?.name;
            const finished = stageDoneAt(mine);
            const overrun = !finished && !!span && span.end < today;
            return (
              <Link
                key={s.id}
                className={rk ? 'trow rk' : 'trow'}
                href={`/p/${projectId}/stage/${s.id}/activity`}
                data-stage={s.id}
                style={COLS}
              >
                <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
                  {s.stage}
                </span>
                <span className="pill" style={{ fontSize: 10.5, justifySelf: 'start' }}>
                  {s.shortTitle}
                </span>
                <span
                  className="wrapcell"
                  style={{ display: 'flex', alignItems: 'center', gap: 7, lineHeight: 1.4 }}
                >
                  {rk && <span className="dot" style={{ background: 'var(--risk)' }} />}
                  {s.title}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="bar" style={{ width: 44 }}>
                    <i
                      style={{
                        width: `${mine.length ? ((done / mine.length) * 100).toFixed(0) : 0}%`,
                        background: rk ? 'var(--risk)' : 'var(--st-run)',
                      }}
                    />
                  </span>
                  <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>
                    {done}/{mine.length}
                  </span>
                </span>
                <span className="num" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                  {dd}/{dl.length} del
                </span>
                <span className="num" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                  {span ? fmtDate(span.start) : '—'}
                </span>
                <span
                  className="num"
                  style={{
                    fontSize: 12,
                    fontWeight: overrun ? 600 : 400,
                    color: overrun ? 'var(--risk)' : 'var(--ink-2)',
                  }}
                >
                  {span ? fmtDate(span.end) : '—'}
                </span>
                <span
                  className="num"
                  style={{ fontSize: 12, color: finished ? 'var(--ink-2)' : 'var(--ink-4)' }}
                >
                  {finished ? fmtDate(finished) : '—'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  {lead ? (
                    <>
                      <Avatar name={lead} small />
                      <span className="ell" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
                        {lead}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>Unassigned</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
