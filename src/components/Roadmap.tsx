'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { fromISO, toISO } from '@/lib/schedule';
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
  /* the bands share the chart's geometry, so a band edge lands on a bar edge */
  const { minWeek, total } = useGanttGeometry(schedule, kickoff, today);

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

  /* Unfolding is bound to movement, not to pointerenter: a browser fires the
     boundary events again whenever layout puts a different element under a
     pointer that never moved, so a chart that changes height under the pointer
     re-enters itself. Coming back to the chart is a movement; growing is not. */
  const onMove = () => {
    if (folded) setFolded(false);
  };

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
    /* Stage order is not date order once a profile interleaves packaging with
       design, so the bands are laid out by when they start. Without that a
       band can run backwards over its neighbour and the two labels overprint. */
    const phases = stageBands(stages)
      .map((p) => ({
        ...p,
        start: Math.min(...p.stages.map((id) => schedule.stages[id]?.startOffsetWeeks ?? 0)),
      }))
      .sort((a, b) => a.start - b.start);
    const starts = phases.map((p) => p.start);
    return phases.map((p, i) => {
      const from = pctOfWeek(starts[i]);
      const to = i + 1 < starts.length ? pctOfWeek(Math.max(starts[i + 1], starts[i])) : 100;
      /* a band can appear twice — a stage added under Implement after
         Manufacture opens a second Implement band, which is what the chart
         should show rather than one band spanning both */
      return { id: p.id, key: `${p.id}-${i}`, label: p.label, left: from, width: Math.max(to - from, 0) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, stages, minWeek, total]);

  /**
   * --rm-h is what the page below has to clear when something is scrolled to,
   * since this header is sticky.
   *
   * It deliberately does NOT correct the scroll position to match the fold.
   * Doing that pulled the page down under a pointer that had just left the
   * chart, which put the pointer back inside it: unfold, correct, leave, fold —
   * the flicker. Folding moves the page up and away from the pointer instead.
   */
  const heightRef = useRef(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    heightRef.current = el.offsetHeight;
    document.documentElement.style.setProperty('--rm-h', `${heightRef.current}px`);
  }, [isFolded]);

  const currentPhase = currentStage === null ? null : stages[currentStage]?.phaseId ?? null;

  return (
    <section
      id="roadmap"
      aria-label="Development roadmap"
      ref={ref}
      className={isFolded ? 'folded' : undefined}
      onPointerMove={onMove}
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
        <Gantt
          id="rm-gantt"
          short
          folded={isFolded}
          zoom={zoom}
          kickoff={{ date: kickoff, onEdit: () => setEditingKickoff((v) => !v) }}
          onSelectStage={selectStage}
        />
        {editingKickoff && (
          <span className="rm-kickoff-edit">
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
      </div>
    </section>
  );
}
