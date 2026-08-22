'use client';

import { useMemo } from 'react';
import type { StageId } from '@/data/types';
import { activityRowId, deliverableRowId } from '@/lib/rowIds';
import { addWeeks, fmtDate, fmtMD, fmtW } from '@/lib/schedule';
import { resolveStageDetail } from '@/lib/stageDetail';
import { useAppStore } from '@/store/useAppStore';

/**
 * One stage on a timeline: what the engineering list is doing, and the
 * artefacts that work produces.
 *
 * The stage states its plan — `engineeringStart`, weeks from the stage start
 * to each activity's own start — and the engineering table has always stated
 * how long each takes. So both ends of every bar are recorded rather than
 * guessed. A stage that has not been given a plan falls back to the order of
 * its list, which is a guess and reads as one: the note above the chart says
 * which of the two is being drawn.
 *
 * An activity recorded as continuous — a negative TAT, like CI and change
 * control — runs the stage.
 *
 * A deliverable is drawn on the bar of the activity that produces it, at its
 * own due date, because that is the thing a stage timeline is asked to show:
 * not that an artefact is due, but what has to finish for it to exist.
 */
export function StageGantt({ stageId }: { stageId: StageId }) {
  const stage = useAppStore((s) => s.stages.find((st) => st.id === stageId));
  const st = useAppStore((s) => s.schedule.stages[stageId]);
  const details = useAppStore((s) => s.stageDetails[stageId]);
  const deliverables = useAppStore((s) => s.deliverables[stageId] ?? []);
  const today = useAppStore((s) => s.today);

  const detail = useMemo(
    () => (stage ? resolveStageDetail(stage, details) : null),
    [stage, details],
  );

  const geometry = useMemo(() => {
    if (!st) return null;
    const start = st.start.getTime();
    const end = st.end.getTime();
    const span = end - start;
    /* A tail past the gate, so every bar has somewhere to put its duration.
       The gate itself is drawn, so the stage still ends visibly where it
       ends — the roadmap carries trailing weeks for its labels the same way. */
    const axis = span * 1.14;
    const pct = (t: number) => ((t - start) / axis) * 100;
    const gatePct = pct(end);

    /* Every first-of-month inside the stage, for the axis behind the bars. */
    const months: { pct: number; label: string; key: number }[] = [];
    const cursor = new Date(st.start.getFullYear(), st.start.getMonth() + 1, 1);
    while (cursor.getTime() < start + axis) {
      months.push({
        pct: pct(cursor.getTime()),
        /* January carries its year, the way the roadmap's axis does — a
           stage that crosses a new year should say so on the axis rather than
           only in the caption. */
        label:
          cursor.toLocaleDateString('en-US', { month: 'short' }) +
          (cursor.getMonth() === 0 ? ` ’${String(cursor.getFullYear()).slice(2)}` : ''),
        key: cursor.getTime(),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    const t = today.getTime();
    return {
      start,
      end,
      span,
      pct,
      gatePct,
      months,
      todayPct: pct(t),
      todayIn: t >= start && t <= end,
    };
  }, [st, today]);

  /** Which activity each deliverable hangs off, and where its diamond goes. */
  const marksByActivity = useMemo(() => {
    const from = stage?.deliverableFrom;
    const by = new Map<number, { id: string; title: string; d: (typeof deliverables)[number] }[]>();
    if (!from) return by;
    deliverables.forEach((d, i) => {
      const act = from[i];
      if (act === undefined) return;
      const list = by.get(act) ?? [];
      list.push({ id: deliverableRowId(stage?.shortTitle ?? '', i), title: d.title, d });
      by.set(act, list);
    });
    return by;
  }, [deliverables, stage]);

  const rows = useMemo(() => {
    if (!detail || !st || !geometry) return [];
    const n = detail.engineeringView.length;
    const plan = stage?.engineeringStart;
    return detail.engineeringView.map((label, i) => {
      const tat = detail.engineeringTat[i] ?? 0;
      const continuous = tat < 0;
      /* the stage's own plan where it has one, its list's order where it does
         not — see the note this component opens with */
      const startWeek = plan?.[i] ?? (st.durationWeeks * i) / n;
      const from = continuous ? st.start : addWeeks(st.start, startWeek);
      const raw = continuous ? st.end : addWeeks(from, tat);
      const to = raw.getTime() > geometry.end ? st.end : raw;
      return {
        id: activityRowId(stage?.shortTitle ?? '', i),
        label,
        from,
        to,
        continuous,
        weeks: Math.abs(tat),
        clipped: raw.getTime() > geometry.end,
        manMonths: detail.engineeringEffort[i] ?? 0,
        marks: marksByActivity.get(i) ?? [],
      };
    });
  }, [detail, st, geometry, stage, marksByActivity]);

  if (!stage || !st || !geometry) return null;
  const { pct, months, todayPct, todayIn, gatePct } = geometry;

  return (
    <div className="sg" data-stage-gantt={stageId}>
      <div className="sg-cap">
        <span className="cap">Stage timeline</span>
        <span className="note">
          {fmtDate(st.start)} → {fmtDate(st.end)} · {fmtW(st.durationWeeks)} ·{' '}
          {stage.engineeringStart
            ? 'the stage’s own plan'
            : 'starts derived from the list’s order'}
        </span>
      </div>

      <div className="sg-months">
        {/* a month whose name would run off the end is not named */}
        {months
          .filter((m) => m.pct < 92)
          .map((m) => (
            <span className="sg-month" key={m.key} style={{ left: `${m.pct}%` }}>
              {m.label}
            </span>
          ))}
        {todayIn && (
          <span className="sg-today-cap" style={{ left: `${todayPct}%` }}>
            Today {fmtMD(today)}
          </span>
        )}
      </div>

      <div className="sg-plot">
        <div className="sg-grid">
          {months.map((m) => (
            <span className="sg-line" key={m.key} style={{ left: `${m.pct}%` }} />
          ))}
          {/* where the stage closes, which is where its last artefact is due */}
          <span className="sg-gate" style={{ left: `${gatePct}%` }} data-sg-gate />
          {todayIn && <span className="sg-today" style={{ left: `${todayPct}%` }} />}
        </div>

        {rows.map((r) => (
          <div
            className={`sg-row${r.marks.length ? ' has-mark' : ''}`}
            key={r.id}
            data-sg-act={r.id}
          >
            <span className="sg-id">{r.id}</span>
            <span className="sg-name" title={r.label}>
              {r.label}
            </span>
            <span className="sg-track">
              <span
                className={`sg-bar${r.continuous ? ' cont' : ''}`}
                style={{
                  left: `${pct(r.from.getTime())}%`,
                  width: `${pct(r.to.getTime()) - pct(r.from.getTime())}%`,
                }}
                data-tip={`${r.label}|${fmtDate(r.from)} → ${fmtDate(r.to)} · ${
                  r.continuous ? 'continuous' : fmtW(r.weeks)
                }${r.clipped ? ', cut at the gate' : ''} · ${r.manMonths} MM`}
              />
              {/* The artefacts this work produces, on the row of the work that
                  produces them, at their own due dates. Siblings of the bar
                  rather than children of it: inside it a percentage would be a
                  percentage of the bar, and every diamond would land wherever
                  its bar happened to start. */}
              {r.marks.map((mk) => (
                <span
                  key={mk.d.id}
                  className={`sg-dot on-bar${mk.d.done ? ' done' : ''}`}
                  style={{
                    left: `${Math.min(Math.max(pct((mk.d.due ?? st.end).getTime()), 0), 100)}%`,
                  }}
                  data-sg-dlv={mk.d.id}
                  data-sg-on={r.id}
                  data-tip={`${mk.id} · ${mk.title}|${mk.d.done ? 'Delivered' : 'Due'} ${fmtDate(
                    mk.d.done && mk.d.completedAt ? mk.d.completedAt : (mk.d.due ?? st.end),
                  )}`}
                />
              ))}
              {/* The duration reads beside the bar, not on it: a pale bar is a
                  poor background for text, and at these widths the text was
                  wider than what it labelled. Bars ending at the gate have no
                  room to their right, so theirs reads to the left. */}
              <span className="sg-bar-t" style={{ left: `${pct(r.to.getTime())}%` }}>
                {/* the same word the engineering table uses for these */}
                {r.continuous ? 'cont.' : fmtW(r.weeks)}
              </span>
            </span>
          </div>
        ))}

        {/* A stage that does not say which activity produces what still shows
            its artefacts — on rows of their own, below the work. */}
        {!stage.deliverableFrom &&
          deliverables.map((d, i) => (
            <div className="sg-row dlv" key={d.id} data-sg-dlv={d.id}>
              <span className="sg-id">{deliverableRowId(stage.shortTitle, i)}</span>
              <span className="sg-name" title={d.title}>
                {d.title}
              </span>
              <span className="sg-track">
                {d.due && (
                  <span
                    className={`sg-dot${d.done ? ' done' : ''}`}
                    style={{ left: `${Math.min(Math.max(pct(d.due.getTime()), 0), 100)}%` }}
                    data-tip={`${d.title}|${d.done ? 'Delivered' : 'Due'} ${fmtDate(
                      d.done && d.completedAt ? d.completedAt : d.due,
                    )}`}
                  />
                )}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
