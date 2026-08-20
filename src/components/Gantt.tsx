'use client';

import { useMemo } from 'react';
import type { Stage, StageId } from '@/data/types';
import { hasOpenRisks } from '@/lib/derive';
import { formatManMonthsShort } from '@/lib/effort';
import { resolveStageDetail } from '@/lib/stageDetail';
import { DAY, addWeeks, fmtDate, fmtDateShort, fmtMD, fmtW, type Schedule } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';

/** Geometry shared by the mini roadmap gantt and the dashboard gantt. */
/** A window onto the schedule, in weeks from kickoff — used to zoom in. */
export interface GanttZoom {
  minWeek: number;
  total: number;
}

export function useGanttGeometry(
  schedule: Schedule,
  kickoff: Date,
  today: Date,
  /** Extra weeks past the end, to park checkpoint labels in. */
  tailWeeks = 0,
  /** Draw this window instead of the whole program. */
  zoom?: GanttZoom,
) {
  return useMemo(() => {
    const minWeek =
      zoom?.minWeek ??
      Math.min(0, ...Object.values(schedule.stages).map((st) => st.startOffsetWeeks));
    const total = zoom ? zoom.total : schedule.totalWeeks - minWeek + 2 + tailWeeks;
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
  }, [schedule, kickoff, today, tailWeeks, zoom]);
}

export function Gantt({
  id,
  short = false,
  folded = false,
  zoom,
  onSelectStage,
}: {
  id?: string;
  /** Mini variant: short row labels, no checkpoints. */
  short?: boolean;
  /**
   * Folded down to the open stage alone. Its row grows, and its deliverables
   * are drawn on the bar as dated markers.
   */
  folded?: boolean;
  /** Zoomed window, so one stage can be read at the scale of one stage. */
  zoom?: GanttZoom;
  /** Makes each row a target that opens its stage below. */
  onSelectStage?: (index: number | null) => void;
}) {
  const schedule = useAppStore((s) => s.schedule);
  const kickoff = useAppStore((s) => s.kickoff);
  const today = useAppStore((s) => s.today);
  const content = useAppStore((s) => s.content);
  const currentStage = useAppStore((s) => s.currentStage);
  /* the program's own stages, in its profile's order */
  const stages = useAppStore((s) => s.stages);
  /* While dates are staged, the saved schedule is drawn underneath as a dashed
     outline so both can be read off the same axis. */
  const draftOverrides = useAppStore((s) => s.draftOverrides);
  const committed = useAppStore((s) => s.committedSchedule);
  const ghost = draftOverrides ? committed : null;
  const stageDetails = useAppStore((s) => s.stageDetails);
  const deliverables = useAppStore((s) => s.deliverables);
  /* what each stage takes in man-months, read off its engineering table */
  const effort = useMemo(
    () =>
      Object.fromEntries(
        stages.map((s: Stage) => [s.id, resolveStageDetail(s, stageDetails[s.id]).manMonths]),
      ) as Record<StageId, number>,
    [stages, stageDetails],
  );
  /* Every milestone sits at a stage's end, so the room to its right is always
     free — the chart is given trailing weeks so a label always has somewhere to
     go without being flipped back over the bar it belongs to. */
  const { minWeek, total, months, todayPct, todayVisible } = useGanttGeometry(
    schedule,
    kickoff,
    today,
    short ? 0 : 14,
    zoom,
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
      {/* every month, so the axis still reads as a calendar once the chart
          folds down to a single stage */}
      <div className="g-months">
        {months.map((m) => (
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
        {stages.map((s, i) => {
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
          const was = ghost?.stages[s.id];
          const moved =
            was && (was.start.getTime() !== st.start.getTime() || was.end.getTime() !== st.end.getTime());
          /* risk color wins over past-gray — an open risk must stay visible */
          const showPast = pastFrac > 0 && !risky;
          return (
            <div
              className={`g-row${i === currentStage ? ' current' : ''}`}
              data-index={i}
              data-stage={s.id}
              key={s.id}
              role={onSelectStage ? 'tab' : undefined}
              aria-selected={onSelectStage ? i === currentStage : undefined}
            >
              {/* A hit target over the whole row rather than only the bar: a
                  one-week stage is a few pixels wide. It carries the bar's
                  tooltip so hovering anywhere on the row still explains it. */}
              {onSelectStage && (
                <button
                  className="g-row-hit"
                  data-select-stage={s.id}
                  aria-label={`${s.title} — ${fmtDate(st.start)} to ${fmtDate(st.end)}`}
                  data-tip={`${s.title}${risky ? ' ⚠' : ''}|${fmtDate(st.start)} → ${fmtDate(st.end)} · ${fmtW(st.durationWeeks)}`}
                  onClick={() => onSelectStage(i)}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
                    e.preventDefault();
                    const next = Math.min(
                      Math.max(i + (e.key === 'ArrowDown' ? 1 : -1), 0),
                      stages.length - 1,
                    );
                    document
                      .querySelector<HTMLButtonElement>(
                        `.g-row[data-index="${next}"] .g-row-hit`,
                      )
                      ?.focus();
                  }}
                />
              )}
              <span className="g-row-label" title={s.title}>
                {short ? `${String(s.stage).padStart(2, '0')}.${s.shortTitle}` : s.title}
              </span>
              <span className="g-row-track">
                {moved && was && (
                  <span
                    className="g-bar ghost"
                    aria-hidden="true"
                    data-ghost-index={i}
                    style={{
                      left: `${((was.startOffsetWeeks - minWeek) / total) * 100}%`,
                      width: `${(was.durationWeeks / total) * 100}%`,
                    }}
                  />
                )}
                <span
                  className={`g-bar${risky ? ' risky' : ''}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  data-index={i}
                  data-tip={
                    onSelectStage
                      ? undefined
                      : `${s.title}${risky ? ' ⚠' : ''}|${fmtDate(st.start)} → ${fmtDate(st.end)} · ${fmtW(st.durationWeeks)}`
                  }
                >
                  {showPast && (
                    <span className="past-seg" style={{ width: `${(pastFrac * 100).toFixed(1)}%` }} />
                  )}
                  {/* wide bars carry the figure; narrow ones let it sit outside */}
                  {!short && effort[s.id] > 0 && (
                    <span className="g-bar-mm">{formatManMonthsShort(effort[s.id])}</span>
                  )}
                </span>
                {short && effort[s.id] > 0 && (
                  <span
                    className="g-mm-tag"
                    data-stage-mm={s.id}
                    style={{ left: `${left + width}%` }}
                  >
                    {formatManMonthsShort(effort[s.id])}
                  </span>
                )}
                {/* Folded down to one stage, the row has the height to carry
                    that stage's deliverables: one marker each, placed on its
                    due date, so moving a date moves the marker. */}
                {folded &&
                  i === currentStage &&
                  (deliverables[s.id] ?? [])
                    /* A finished deliverable is marked on the day it was
                       finished, not the day it was due — the marker moves when
                       the box is ticked, which is the point of ticking it. */
                    .map((d) => ({ d, when: d.done ? d.completedAt ?? d.due : d.due }))
                    .filter((x) => x.when)
                    .map(({ d, when }, di) => {
                      const wk = (when!.getTime() - kickoff.getTime()) / (7 * DAY);
                      const pct = Math.min(Math.max(((wk - minWeek) / total) * 100, 0), 100);
                      return (
                        <span
                          key={d.id}
                          className={`g-dlv${d.done ? ' done' : ''}`}
                          data-dlv={d.id}
                          /* names alternate above and below the bar: stage
                             deliverables cluster, and stacked labels are
                             unreadable */
                          data-row={di % 2}
                          style={{ left: `${pct}%` }}
                          data-tip={
                            d.done
                              ? `${d.title}|Completed ${fmtDate(when!)}${
                                  d.due ? ` · due ${fmtDate(d.due)}` : ''
                                }`
                              : `${d.title}|Due ${fmtDate(when!)}`
                          }
                        >
                          <span className="g-dlv-name">{d.title}</span>
                          <span className="g-dlv-dot">
                            <span className="g-dlv-date">{fmtMD(when!)}</span>
                          </span>
                        </span>
                      );
                    })}
                {(msByStage[s.id] ?? []).map((m) => {
                  const pct = ((m.week - minWeek) / total) * 100;
                  const wasMs = ghost?.milestones.find((x) => x.id === m.id);
                  const msMoved = wasMs && wasMs.week !== m.week;
                  const tip = `${m.label}|${fmtDate(m.date)}`;
                  return (
                    <span key={m.id}>
                      {msMoved && wasMs && (
                        <span
                          className={`g-msdot ghost${m.major ? ' major' : ''}`}
                          aria-hidden="true"
                          data-ghost-ms={m.id}
                          style={{ left: `${((wasMs.week - minWeek) / total) * 100}%` }}
                        />
                      )}
                      <span
                        className={`g-msdot${m.major ? ' major' : ''}`}
                        style={{ left: `${pct}%` }}
                        data-tip={tip}
                      />
                      <span
                        className={`g-cp${m.major ? ' major' : ''}`}
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
