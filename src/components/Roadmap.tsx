'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { journeyData } from '@/data/journey';
import { lifecyclePhases, milestoneDefs, phaseOfStage } from '@/data/scheduleProfiles';
import { fmtDate, fmtDateShort, fmtW } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { Gantt } from './Gantt';

const N = journeyData.length;

/** Milestone diamonds sit between stations; the terminal one is the station. */
const milestoneMarks = milestoneDefs.map((m) => {
  const i = journeyData.findIndex((s) => s.id === m.anchor.stage);
  const isTerminal = i === N - 1;
  const pct = isTerminal ? 100 : Math.min((i + 0.5) / (N - 1), 0.995) * 100;
  return { ...m, isTerminal, pct, shift: pct > 92 ? 'translateX(-100%)' : 'translateX(-50%)' };
});

export function Roadmap() {
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);
  const currentStage = useAppStore((s) => s.currentStage);
  const selectStage = useAppStore((s) => s.selectStage);

  const lineRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stationsRef = useRef<HTMLDivElement>(null);
  const [progressPx, setProgressPx] = useState(0);
  const [todayLeft, setTodayLeft] = useState<number | null>(null);

  /* The station-line TODAY marker aligns pixel-exact with the gantt's today
     line, and the progress fill tracks the station line's measured width. */
  const measure = useCallback(() => {
    const line = lineRef.current;
    if (line) setProgressPx((line.clientWidth * currentStage) / (N - 1));
    const g = document.querySelector('#rm-gantt .g-today');
    const wrap = wrapRef.current;
    if (!g || !wrap) {
      setTodayLeft(null);
      return;
    }
    const lr = g.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    setTodayLeft(lr.left - wr.left + lr.width / 2);
  }, [currentStage]);

  useLayoutEffect(measure, [measure, schedule, today]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = Math.min(Math.max(currentStage + (e.key === 'ArrowRight' ? 1 : -1), 0), N - 1);
    selectStage(next);
    stationsRef.current
      ?.querySelector<HTMLButtonElement>(`.rm-station[data-index="${next}"]`)
      ?.focus();
  };

  const curPhase = phaseOfStage[journeyData[currentStage].id].id;

  return (
    <section id="roadmap" aria-label="Development roadmap">
      <div className="rm-scroll">
        <div id="rm-regions">
          {lifecyclePhases.map((p) => (
            <div
              className={`rm-region${p.id === curPhase ? ' current' : ''}`}
              data-phase={p.id}
              style={{ flex: p.stages.length }}
              key={p.id}
            >
              {p.label}
            </div>
          ))}
        </div>
        <div id="rm-line-wrap" ref={wrapRef}>
          <div id="rm-line" ref={lineRef} />
          <div id="rm-progress" style={{ width: `${progressPx}px` }} />
          <div
            id="rm-stations"
            role="tablist"
            aria-label="Stages"
            ref={stationsRef}
            onKeyDown={onKeyDown}
          >
            {journeyData.map((s, i) => {
              const st = schedule.stages[s.id];
              return (
                <button
                  className={[
                    'rm-station',
                    s.moment ? 'moment' : '',
                    i === N - 1 ? 'terminal' : '',
                    i === currentStage ? 'selected' : '',
                    st.end < today ? 'past' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="tab"
                  style={{ left: `${(i / (N - 1)) * 100}%` }}
                  data-index={i}
                  data-tip={`${s.title}|${fmtDateShort(st.start)} → ${fmtDateShort(st.end)} · ${fmtW(st.durationWeeks)}`}
                  aria-label={`${String(s.stage).padStart(2, '0')} ${s.shortTitle}, ${fmtDateShort(st.start)} — Stage ${s.stage}: ${s.title}`}
                  key={s.id}
                  onPointerOver={() => selectStage(i)}
                  onClick={() => selectStage(i)}
                  onFocus={() => selectStage(i)}
                >
                  <span className="dot" />
                  <span className="code">
                    {String(s.stage).padStart(2, '0')} {s.shortTitle}
                  </span>
                  {/* Whitespace-only node between flex items renders as nothing,
                      but keeps the visible text readable as "01 DEF 01/21/2026"
                      so the aria-label below can contain it (WCAG 2.5.3). */}
                  {' '}
                  <span className="date" data-role="st-date">
                    {fmtDateShort(st.start)}
                  </span>
                </button>
              );
            })}
            {milestoneMarks.map((m) => {
              const date = schedule.milestones.find((x) => x.id === m.id)?.date;
              return (
                <span key={m.id}>
                  {!m.isTerminal && (
                    <span
                      className={`rm-ms${m.major ? ' major' : ''}`}
                      style={{ left: `${m.pct}%` }}
                      data-tip={`${m.label}|${date ? fmtDate(date) : ''}`}
                      data-msid={m.id}
                    />
                  )}
                  {m.major && (
                    <span
                      className="rm-ms-label"
                      style={{ left: `${m.pct}%`, transform: m.shift }}
                    >
                      {m.label}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          <div id="rm-today" hidden={todayLeft === null} style={{ left: `${todayLeft ?? 0}px` }}>
            <span className="ty-lbl">TODAY</span>
            <span className="ty-tick" />
          </div>
        </div>
        <div id="rm-gantt-cap">
          <span className="cap">Concurrency</span>
          <span className="note">stages overlap by design — hover any bar</span>
        </div>
        <Gantt id="rm-gantt" short onHoverStage={selectStage} />
      </div>
    </section>
  );
}
