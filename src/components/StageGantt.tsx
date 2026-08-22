'use client';

import { useMemo } from 'react';
import type { StageId } from '@/data/types';
import { activityRowId, deliverableRowId } from '@/lib/rowIds';
import { addWeeks, fmtDate, fmtMD, fmtW } from '@/lib/schedule';
import { resolveStageDetail } from '@/lib/stageDetail';
import { useAppStore } from '@/store/useAppStore';

/**
 * One stage on a timeline: what the engineering list is doing, and when the
 * artefacts it produces are due.
 *
 * The engineering table records how long each activity takes (its TAT) but not
 * when it starts — a stage has never been asked to hold start dates, and
 * asking for them now would be asking for a project plan per stage. So the
 * starts are derived, by the one rule the list already implies:
 *
 *   the list is a sequence, so the k-th of n activities starts k/n of the way
 *   into the stage and runs for its own TAT; anything still running at the
 *   gate is cut off there.
 *
 * Every duration on the chart is therefore real and every start is a
 * consequence of the order someone put the list in. An activity recorded as
 * continuous — a negative TAT, like CI and change control — runs the stage.
 *
 * The deliverables below need no rule at all: they carry their own due dates.
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
        /* No year on the labels: a stage is months wide, so eight of them
           share about three hundred pixels and "Jan ’26" runs into February.
           Which years these are is stated once, in the caption above. */
        label: cursor.toLocaleDateString('en-US', { month: 'short' }),
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

  const rows = useMemo(() => {
    if (!detail || !st || !geometry) return [];
    const n = detail.engineeringView.length;
    return detail.engineeringView.map((label, i) => {
      const tat = detail.engineeringTat[i] ?? 0;
      const continuous = tat < 0;
      const from = continuous ? st.start : addWeeks(st.start, (st.durationWeeks * i) / n);
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
      };
    });
  }, [detail, st, geometry, stage]);

  if (!stage || !st || !geometry) return null;
  const { pct, months, todayPct, todayIn, gatePct } = geometry;

  return (
    <div className="sg" data-stage-gantt={stageId}>
      <div className="sg-cap">
        <span className="cap">Stage timeline</span>
        <span className="note">
          {fmtDate(st.start)} → {fmtDate(st.end)} · {fmtW(st.durationWeeks)} · starts are the
          list&rsquo;s order, durations are its TATs
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
          <div className="sg-row" key={r.id} data-sg-act={r.id}>
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
              >
                </span>
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

        {/* The artefacts the work above is for. These need no rule: the dates
            are the ones the deliverables table already holds. */}
        {deliverables.map((d, i) => (
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
