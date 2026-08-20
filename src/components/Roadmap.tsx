'use client';

import { useMemo, useRef, useState } from 'react';
import { fmtDate, fmtMD } from '@/lib/schedule';
import { stageBands } from '@/lib/stages';
import { useAppStore } from '@/store/useAppStore';
import { Gantt, useGanttGeometry } from './Gantt';

/**
 * The roadmap is one date axis read twice.
 *
 * Across the top: the lifecycle phases and the milestone diamonds, positioned
 * by date. Down the side: the twelve stages, as bars on the concurrency chart.
 * Both share the geometry from useGanttGeometry and the same left gutter, so a
 * diamond sits exactly above the bar end it marks.
 *
 * Picking a bar opens that stage below; picking it again closes it.
 */
export function Roadmap() {
  const schedule = useAppStore((s) => s.schedule);
  const kickoff = useAppStore((s) => s.kickoff);
  const today = useAppStore((s) => s.today);
  const currentStage = useAppStore((s) => s.currentStage);
  const stages = useAppStore((s) => s.stages);
  const selectStage = useAppStore((s) => s.selectStage);
  const { minWeek, total, todayPct, todayVisible } = useGanttGeometry(schedule, kickoff, today);

  /**
   * Once a stage is open, the chart is reference rather than navigation, so it
   * folds when the pointer moves past it into the page and unfolds when the
   * pointer comes back. What survives the fold is the date axis — bands,
   * milestones, months — and the open stage with the stage either side of it,
   * grown tall enough to carry its deliverables. Only downward exits collapse
   * it: leaving upward means going to the toolbar, not to the stage.
   */
  const [folded, setFolded] = useState(false);
  const ref = useRef<HTMLElement>(null);
  /* derived rather than synced: with nothing open there is nothing to fold to */
  const isFolded = folded && currentStage !== null;

  const onLeave = (e: React.PointerEvent) => {
    if (currentStage === null) return;
    const rect = ref.current?.getBoundingClientRect();
    if (rect && e.clientY >= rect.bottom - 1) setFolded(true);
  };

  const pctOfWeek = (week: number) => ((week - minWeek) / total) * 100;

  /**
   * Phases overlap in time — stages are concurrent by design — so a phase band
   * cannot be its own span without covering its neighbours. Each band instead
   * runs from where its phase starts to where the next one does, which is what
   * a band above a date axis actually communicates: the program enters Define
   * here, Design & Verify here.
   */
  const bands = useMemo(() => {
    const phases = stageBands(stages);
    const starts = phases.map((p) =>
      Math.min(...p.stages.map((id) => schedule.stages[id]?.startOffsetWeeks ?? 0)),
    );
    return phases.map((p, i) => {
      const from = pctOfWeek(starts[i]);
      const to = i + 1 < starts.length ? pctOfWeek(starts[i + 1]) : 100;
      /* a band can appear twice — a stage added under Implement after
         Manufacture opens a second Implement band, which is what the chart
         should show rather than one band spanning both */
      return { id: p.id, key: `${p.id}-${i}`, label: p.label, left: from, width: Math.max(to - from, 0) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, stages, minWeek, total]);

  /* Seven milestones on one axis collide — Design Freeze and Tapeout are a week
     apart — so labels alternate between two rows. */
  const marks = schedule.milestones.map((m, i) => ({
    ...m,
    pct: pctOfWeek(m.week),
    row: i % 2,
  }));

  const currentPhase = currentStage === null ? null : stages[currentStage]?.phaseId ?? null;

  return (
    <section
      id="roadmap"
      aria-label="Development roadmap"
      ref={ref}
      className={isFolded ? 'folded' : undefined}
      onPointerEnter={() => setFolded(false)}
      onPointerLeave={onLeave}
    >
      <div className="rm-scroll">
        <div id="rm-axis">
          <div id="rm-regions">
            {bands.map((b) => (
              <div
                className={`rm-region${b.id === currentPhase ? ' current' : ''}`}
                data-phase={b.id}
                style={{ left: `${b.left}%`, width: `${b.width}%` }}
                key={b.key}
              >
                <span>{b.label}</span>
              </div>
            ))}
          </div>

          <div id="rm-line-wrap">
            {marks.map((m) => (
              <span key={m.id}>
                <span
                  className={`rm-ms-label${m.major ? ' major' : ''}`}
                  style={{ left: `${m.pct}%` }}
                  data-row={m.row}
                  data-ms-label={m.id}
                >
                  {m.label}
                </span>
                {/* the date rides inside the diamond rather than waiting for
                    a hover — the axis is read at a glance */}
                <span
                  className={`rm-ms${m.major ? ' major' : ''}`}
                  style={{ left: `${m.pct}%` }}
                  data-tip={`${m.label}|${fmtDate(m.date)}`}
                  data-msid={m.id}
                >
                  <span className="rm-ms-date">{fmtMD(m.date)}</span>
                </span>
              </span>
            ))}
            <div id="rm-line" />
            {todayVisible && (
              <div id="rm-today" style={{ left: `${todayPct}%` }}>
                <span className="ty-lbl">TODAY</span>
                <span className="ty-tick" />
              </div>
            )}
          </div>
        </div>

        <div id="rm-gantt-cap">
          <span className="cap">Concurrency</span>
          <span className="note">stages overlap by design — select a bar to open it</span>
        </div>
        <Gantt id="rm-gantt" short folded={isFolded} onSelectStage={selectStage} />
      </div>
    </section>
  );
}
