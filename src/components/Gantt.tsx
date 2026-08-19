'use client';

import { useMemo } from 'react';
import { journeyData } from '@/data/journey';
import { STAGE_ORDER } from '@/data/scheduleProfiles';
import type { StageId } from '@/data/types';
import { hasOpenRisks } from '@/lib/derive';
import { DAY, addWeeks, fmtDate, fmtDateShort, fmtW, type Schedule } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';

/** Geometry shared by the mini roadmap gantt and the dashboard gantt. */
export function useGanttGeometry(schedule: Schedule, kickoff: Date, today: Date) {
  return useMemo(() => {
    const minWeek = Math.min(0, ...STAGE_ORDER.map((id) => schedule.stages[id].startOffsetWeeks));
    const total = schedule.totalWeeks - minWeek + 2;
    const origin = addWeeks(kickoff, minWeek);
    const end = addWeeks(origin, total);
    const months: { pct: number; label: string; index: number }[] = [];
    const cursor = new Date(origin.getFullYear(), origin.getMonth() + 1, 1);
    let mIdx = 0;
    while (cursor < end) {
      const wk = (cursor.getTime() - origin.getTime()) / (7 * DAY);
      months.push({
        pct: (wk / total) * 100,
        label:
          cursor.toLocaleDateString('en-US', { month: 'short' }) +
          (cursor.getMonth() === 0 ? ' ’' + String(cursor.getFullYear()).slice(2) : ''),
        index: mIdx,
      });
      cursor.setMonth(cursor.getMonth() + 1);
      mIdx++;
    }
    const todayWk = (today.getTime() - origin.getTime()) / (7 * DAY);
    return {
      minWeek,
      total,
      months,
      todayPct: (todayWk / total) * 100,
      todayVisible: todayWk >= 0 && todayWk <= total,
    };
  }, [schedule, kickoff, today]);
}

export function Gantt({
  id,
  short = false,
  onHoverStage,
}: {
  id?: string;
  /** Mini variant: short row labels, every other month, no checkpoints. */
  short?: boolean;
  onHoverStage?: (index: number) => void;
}) {
  const schedule = useAppStore((s) => s.schedule);
  const kickoff = useAppStore((s) => s.kickoff);
  const today = useAppStore((s) => s.today);
  const content = useAppStore((s) => s.content);
  const currentStage = useAppStore((s) => s.currentStage);
  const { minWeek, total, months, todayPct, todayVisible } = useGanttGeometry(
    schedule,
    kickoff,
    today,
  );

  /* checkpoints live on their own stage's row (full gantt only) */
  const msByStage: Partial<Record<StageId, Schedule['milestones']>> = {};
  if (!short) {
    for (const m of schedule.milestones) {
      (msByStage[m.anchor.stage] ??= []).push(m);
    }
  }

  return (
    <div className={`gantt${short ? ' mini' : ''}`} id={id}>
      <div className="g-months">
        {months
          .filter((m) => !short || m.index % 2 === 0)
          .map((m) => (
            <span className="g-month" key={m.index} style={{ left: `${m.pct}%` }}>
              {m.label}
            </span>
          ))}
      </div>
      <div className="g-body">
        <div className="g-gridlines">
          {months.map((m) => (
            <span className="g-gridline" key={m.index} style={{ left: `${m.pct}%` }} />
          ))}
          {todayVisible && (
            <>
              <span className="g-today" style={{ left: `${todayPct}%` }} />
              <span className="g-today-label" style={{ left: `${todayPct}%` }}>
                Today
              </span>
            </>
          )}
        </div>
        {journeyData.map((s, i) => {
          const st = schedule.stages[s.id];
          const left = ((st.startOffsetWeeks - minWeek) / total) * 100;
          const width = (st.durationWeeks / total) * 100;
          /* past portion of the bar renders gray; future keeps its color */
          const pastFrac = Math.min(
            Math.max(
              (today.getTime() - st.start.getTime()) / (st.end.getTime() - st.start.getTime()),
              0,
            ),
            1,
          );
          const risky = hasOpenRisks(content, s.id);
          /* risk color wins over past-gray — an open risk must stay visible */
          const showPast = pastFrac > 0 && !risky;
          return (
            <div
              className={`g-row${i === currentStage ? ' current' : ''}`}
              data-index={i}
              key={s.id}
            >
              <span className="g-row-label" title={s.title}>
                {short ? s.shortTitle : s.title}
              </span>
              <span className="g-row-track">
                <span
                  className={`g-bar${risky ? ' risky' : ''}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  data-index={i}
                  data-tip={`${s.title}${risky ? ' ⚠' : ''}|${fmtDate(st.start)} → ${fmtDate(st.end)} · ${fmtW(st.durationWeeks)}`}
                  onPointerOver={onHoverStage ? () => onHoverStage(i) : undefined}
                >
                  {showPast && (
                    <span className="past-seg" style={{ width: `${(pastFrac * 100).toFixed(1)}%` }} />
                  )}
                </span>
                {(msByStage[s.id] ?? []).map((m) => {
                  const pct = ((m.week - minWeek) / total) * 100;
                  /* near the right edge the label hangs to the left */
                  const flip = pct > 78;
                  const tip = `${m.label}|${fmtDate(m.date)}`;
                  return (
                    <span key={m.id}>
                      <span
                        className={`g-msdot${m.major ? ' major' : ''}`}
                        style={{ left: `${pct}%` }}
                        data-tip={tip}
                      />
                      <span
                        className={`g-cp${m.major ? ' major' : ''}${flip ? ' flip' : ''}`}
                        style={{ left: `${pct}%` }}
                        data-tip={tip}
                      >
                        {m.label} · {fmtDateShort(m.date)}
                      </span>
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
