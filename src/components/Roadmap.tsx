'use client';

import { useMemo, useRef, useState } from 'react';
import { fmtDate, fmtMD, fromISO, toISO } from '@/lib/schedule';
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
/** Per-browser, like the display settings — see /lib/displaySettings.ts. */
const PIN_KEY = 'atlaspm.roadmap.pinned.v1';

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <path
        d="M9.6 1.2 14.8 6.4l-1.4 1.4-1-1-2.6 2.6.2 3.2-1.3 1.3-3-3-3.4 3.4-.9-.9 3.4-3.4-3-3L3.1 5.7l3.2.2 2.6-2.6-1-1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Roadmap() {
  const schedule = useAppStore((s) => s.schedule);
  const kickoff = useAppStore((s) => s.kickoff);
  const today = useAppStore((s) => s.today);
  const currentStage = useAppStore((s) => s.currentStage);
  const stages = useAppStore((s) => s.stages);
  const setKickoff = useAppStore((s) => s.setKickoff);
  /* Kickoff is a date like the milestones are, so it is edited where it is
     drawn rather than from a field in the toolbar. */
  const [editingKickoff, setEditingKickoff] = useState(false);
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
  /* Pinned, the chart stays open whatever the pointer does. It is a per-browser
     preference like the display settings, so it survives a reload. */
  /* Read once on mount rather than in an effect: the roadmap renders only
     after the store has hydrated, so there is no server render to mismatch. */
  const [pinned, setPinned] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(PIN_KEY) === '1',
  );
  const togglePin = () =>
    setPinned((was) => {
      const next = !was;
      localStorage.setItem(PIN_KEY, next ? '1' : '0');
      if (next) setFolded(false);
      return next;
    });
  const ref = useRef<HTMLElement>(null);
  /* derived rather than synced: with nothing open there is nothing to fold to */
  const isFolded = folded && currentStage !== null && !pinned;

  const onLeave = (e: React.PointerEvent) => {
    if (currentStage === null || pinned) return;
    const rect = ref.current?.getBoundingClientRect();
    if (rect && e.clientY >= rect.bottom - 1) setFolded(true);
  };

  const pctOfWeek = (week: number) => ((week - minWeek) / total) * 100;

  /* Folded, the chart is about one stage, so it is drawn at the scale of one
     stage: the bar takes ~70% of the width and sits in the middle, and the
     months come along at the same scale. The axis above stays whole-program —
     one reads the flow, the other reads the detail. */
  const zoom = useMemo(() => {
    if (!isFolded || currentStage === null) return undefined;
    const st = schedule.stages[stages[currentStage]?.id];
    if (!st) return undefined;
    const span = Math.max(st.durationWeeks, 0.5);
    const window = span / 0.7;
    return { minWeek: st.startOffsetWeeks - (window - span) / 2, total: window };
  }, [isFolded, currentStage, schedule, stages]);

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
     apart — so labels alternate between two rows. A date already behind us is
     drawn filled, one still ahead hollow: the axis reads as a progress bar. */
  const marks = schedule.milestones.map((m, i) => ({
    ...m,
    pct: pctOfWeek(m.week),
    row: i % 2,
    past: m.date <= today,
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
            {/* Kickoff is the first mark on the axis — the program starts
                somewhere, and that date has to be visible and editable. */}
            <span key="kickoff">
              <span
                className={`rm-ms-label kickoff${kickoff <= today ? ' past' : ''}`}
                style={{ left: `${pctOfWeek(0)}%` }}
                data-row={1}
                data-ms-label="kickoff"
              >
                Kick-off
              </span>
              <button
                className={`rm-ms kickoff${kickoff <= today ? ' past' : ''}`}
                style={{ left: `${pctOfWeek(0)}%` }}
                data-tip={`Kick-off|${fmtDate(kickoff)} · click to change`}
                data-msid="kickoff"
                aria-label={`Kick-off ${fmtDate(kickoff)} — change`}
                onClick={() => setEditingKickoff((v) => !v)}
              >
                <span className="rm-ms-date">{fmtMD(kickoff)}</span>
              </button>
              {editingKickoff && (
                <span className="rm-kickoff-edit" style={{ left: `${pctOfWeek(0)}%` }}>
                  <input
                    type="date"
                    id="kickoff-input"
                    autoFocus
                    value={toISO(kickoff)}
                    aria-label="Kickoff date"
                    onChange={(e) => e.target.value && setKickoff(fromISO(e.target.value))}
                    onBlur={() => setEditingKickoff(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingKickoff(false)}
                  />
                </span>
              )}
            </span>
            {marks.map((m) => (
              <span key={m.id}>
                <span
                  className={`rm-ms-label${m.major ? ' major' : ''}${m.past ? ' past' : ''}`}
                  style={{ left: `${m.pct}%` }}
                  data-row={m.row}
                  data-ms-label={m.id}
                >
                  {m.label}
                </span>
                {/* the date rides inside the diamond rather than waiting for
                    a hover — the axis is read at a glance */}
                <span
                  className={`rm-ms${m.major ? ' major' : ''}${m.past ? ' past' : ''}`}
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
          <span className="spacer" />
          {/* Pinned, the whole chart stays put; unpinned, it folds to the open
              stage as soon as the pointer moves past it. */}
          <button
            id="rm-pin"
            data-pin
            aria-pressed={pinned}
            title={
              pinned
                ? 'Unpin — the chart folds to the open stage again'
                : 'Pin the chart open — it will not fold away'
            }
            aria-label={pinned ? 'Unpin the chart' : 'Pin the chart open'}
            onClick={togglePin}
          >
            <PinIcon />
          </button>
        </div>
        <Gantt id="rm-gantt" short folded={isFolded} zoom={zoom} onSelectStage={selectStage} />
      </div>
    </section>
  );
}
