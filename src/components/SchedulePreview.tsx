'use client';

import { useEffect, useRef } from 'react';
import { journeyData } from '@/data/journey';
import { STAGE_ORDER } from '@/data/scheduleProfiles';
import type { StageId } from '@/data/types';
import { DAY, fmtDate, fmtW } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';

const stageOf = (id: StageId) => journeyData.find((s) => s.id === id)!;
/** Whole days between two local-midnight dates, DST included. */
const shiftDays = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / DAY);
const signed = (n: number) => (n > 0 ? `+${n}d` : n < 0 ? `${n}d` : '—');

/**
 * Schedule changes are staged, not saved. This bar shows the saved dates and
 * the proposed ones side by side so the ripple can be checked before it is
 * committed — the roadmap and both gantts already draw the proposal, with the
 * saved schedule ghosted underneath.
 */
export function SchedulePreview() {
  const draftOverrides = useAppStore((s) => s.draftOverrides);
  const proposed = useAppStore((s) => s.schedule);
  const current = useAppStore((s) => s.committedSchedule);
  const apply = useAppStore((s) => s.applyScheduleDraft);
  const discard = useAppStore((s) => s.discardScheduleDraft);
  const barRef = useRef<HTMLDivElement>(null);

  /* The bar is fixed, so the scrollable areas need room to clear it — its
     height depends on how many stages moved, so measure rather than guess. */
  useEffect(() => {
    const el = barRef.current;
    if (!el || !draftOverrides) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty('--sp-h', `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    document.body.classList.add('sched-preview-open');
    return () => {
      ro.disconnect();
      document.body.classList.remove('sched-preview-open');
      root.style.removeProperty('--sp-h');
    };
  }, [draftOverrides]);

  if (!draftOverrides) return null;

  const movedStages = STAGE_ORDER.filter(
    (id) =>
      shiftDays(proposed.stages[id].start, current.stages[id].start) !== 0 ||
      shiftDays(proposed.stages[id].end, current.stages[id].end) !== 0,
  );
  const movedMilestones = proposed.milestones
    .map((m) => {
      const before = current.milestones.find((x) => x.id === m.id)!;
      return { m, before, delta: shiftDays(m.date, before.date) };
    })
    .filter((x) => x.delta !== 0);

  return (
    <div id="sched-preview" role="region" aria-label="Schedule preview" ref={barRef}>
      <div className="sp-inner">
        <div className="sp-lead">
          <span className="sp-tag">Schedule preview</span>
          <span className="sp-note">
            {movedStages.length} stage{movedStages.length === 1 ? '' : 's'} and{' '}
            {movedMilestones.length} milestone{movedMilestones.length === 1 ? '' : 's'} move.
            Nothing is saved yet.
          </span>
        </div>

        <div className="sp-scroll">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Current</th>
                <th>Proposed</th>
                <th>TAT</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
              {movedStages.map((id) => {
                const a = current.stages[id];
                const b = proposed.stages[id];
                return (
                  <tr key={id} data-stage={id}>
                    <td className="sp-name">{stageOf(id).title}</td>
                    <td className="sp-was">
                      {fmtDate(a.start)} → {fmtDate(a.end)}
                    </td>
                    <td className="sp-now">
                      {fmtDate(b.start)} → {fmtDate(b.end)}
                    </td>
                    <td className={a.durationWeeks === b.durationWeeks ? 'sp-was' : 'sp-now'}>
                      {fmtW(a.durationWeeks)}
                      {a.durationWeeks !== b.durationWeeks && ` → ${fmtW(b.durationWeeks)}`}
                    </td>
                    <td className="sp-delta">{signed(shiftDays(b.end, a.end))}</td>
                  </tr>
                );
              })}
              {movedMilestones.map(({ m, before, delta }) => (
                <tr className="sp-ms" key={m.id} data-milestone={m.id}>
                  <td className="sp-name">
                    {m.major ? '◆' : '◇'} {m.label}
                  </td>
                  <td className="sp-was">{fmtDate(before.date)}</td>
                  <td className="sp-now">{fmtDate(m.date)}</td>
                  <td className="sp-was">—</td>
                  <td className="sp-delta">{signed(delta)}</td>
                </tr>
              ))}
              {!movedStages.length && !movedMilestones.length && (
                <tr>
                  <td className="sp-name" colSpan={5}>
                    The proposed dates match the saved schedule.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="sp-acts">
          <button data-discard-schedule onClick={discard}>
            Discard
          </button>
          <button data-apply-schedule onClick={apply}>
            Apply update
          </button>
        </div>
      </div>
    </div>
  );
}
