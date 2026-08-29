'use client';

import Link from 'next/link';
import { useState } from 'react';
import { activitySteps } from '@/data/activitySteps';
import { fmtDate } from '@/lib/schedule';
import { fromStepIndex, isStepLate, resolveSteps } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';
import { useProgramWork } from './useProgramWork';

/**
 * The programme in time: one bar per stage, with the checkpoints that land at
 * the end of a stage riding on that stage's own bar.
 *
 * The prototype moved them there for a reason. Floating in a band of their own
 * they were a row of diamonds nobody could attribute; on the bar, the date
 * explains itself — this stage closing is what that checkpoint is.
 *
 * Row height is a setting because 23 stages at a comfortable height is a lot of
 * scrolling, and the same chart is read two ways: "where are we" wants everything
 * on one screen, "what is happening in March" wants room to read the labels.
 */
const ROW_HEIGHTS = [
  { id: 'tight', label: 'Tight', px: 22 },
  { id: 'normal', label: 'Normal', px: 30 },
  { id: 'roomy', label: 'Roomy', px: 40 },
] as const;

export function TimelinePage({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const stepStates = useAppStore((s) => s.stepStates);
  const today = useAppStore((s) => s.today);
  const { risks } = useProgramWork();
  const [height, setHeight] = useState<(typeof ROW_HEIGHTS)[number]['id']>('normal');

  const rowPx = ROW_HEIGHTS.find((h) => h.id === height)!.px;

  const spans = stages.map((s) => schedule.stages[s.id]).filter(Boolean);
  if (!spans.length) return <p className="mono-note">This program has no stages.</p>;
  const start = new Date(Math.min(...spans.map((s) => s.start.getTime())));
  const end = new Date(Math.max(...spans.map((s) => s.end.getTime())));
  const span = end.getTime() - start.getTime();
  const at = (d: Date) => ((d.getTime() - start.getTime()) / span) * 100;

  const riskyStages = new Set(risks.map((r) => r.stageId));

  /* A checkpoint belongs to the stage whose end it lands on, so it can ride
     that stage's bar instead of floating in a band of its own. */
  const checkpointOf = (stageId: string) =>
    schedule.milestones.find(
      (m) => m.date.getTime() === schedule.stages[stageId]?.end.getTime(),
    );

  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">Timeline</h1>
        <span className="pview-count">{stages.length} stages</span>
        <span className="grow" />
        <span className="ptl-setting">
          <span className="pfact-cap">Row height</span>
          {ROW_HEIGHTS.map((h) => (
            <button
              key={h.id}
              type="button"
              className="btn sm"
              aria-pressed={h.id === height}
              onClick={() => setHeight(h.id)}
            >
              {h.label}
            </button>
          ))}
        </span>
      </header>

      <div className="pview-body">
        <div className="ptl" style={{ ['--tl-row' as string]: `${rowPx}px` }}>
          <div className="ptl-years">
            {years(start, end).map((y) => (
              <span key={y.year} className="ptl-year" style={{ left: `${at(y.at)}%` }}>
                {y.year}
              </span>
            ))}
            <span className="ptl-today" style={{ left: `${at(today)}%` }}>
              <b>Today</b>
            </span>
          </div>

          <ul className="ptl-rows">
            {stages.map((s) => {
              const sp = schedule.stages[s.id];
              if (!sp) return null;
              const refs = Object.keys(activitySteps).filter((r) => activitySteps[r].st === s.id);
              const all = refs.flatMap((r) =>
                resolveSteps(sp.start, fromStepIndex(r, activitySteps[r]), stepStates),
              );
              const done = all.filter((x) => x.done).length;
              const late = all.filter((x) => isStepLate(x, today)).length;
              const pct = all.length ? Math.round((done / all.length) * 100) : 0;
              const cp = checkpointOf(s.id);
              const risky = riskyStages.has(s.id);
              return (
                <li key={s.id} className="ptl-row">
                  <Link className="ptl-name" href={`/p/${projectId}/stage/${s.id}/activity`}>
                    <span className="pcode">{s.shortTitle}</span>
                    <span className="ell">{s.title}</span>
                  </Link>
                  <span className="ptl-track">
                    <span
                      className={risky ? 'ptl-bar risky' : 'ptl-bar'}
                      style={{ left: `${at(sp.start)}%`, width: `${at(sp.end) - at(sp.start)}%` }}
                      title={`${fmtDate(sp.start)} → ${fmtDate(sp.end)}`}
                    >
                      <i style={{ width: `${pct}%` }} />
                    </span>
                    {cp && (
                      <span className="ptl-cp" style={{ left: `${at(cp.date)}%` }}>
                        <b className={cp.major ? 'ptl-dia major' : 'ptl-dia'} />
                        <span className="ptl-cp-label">
                          {cp.label}
                          <span className="ptl-cp-date">{fmtDate(cp.date)}</span>
                        </span>
                      </span>
                    )}
                    <span className="ptl-now" style={{ left: `${at(today)}%` }} />
                  </span>
                  <span className="ptl-tail">
                    <span className="ptl-n">
                      {done}/{all.length}
                    </span>
                    {late > 0 && <span className="ptl-late">{late} late</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

/** January of every year the programme touches, for the scale above the bars. */
function years(start: Date, end: Date): { year: number; at: Date }[] {
  const out: { year: number; at: Date }[] = [];
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    const at = new Date(y, 0, 1);
    if (at >= start && at <= end) out.push({ year: y, at });
  }
  return out;
}
