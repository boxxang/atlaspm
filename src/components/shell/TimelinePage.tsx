'use client';

import { useRouter } from 'next/navigation';
import { useLayoutEffect, useRef, useState } from 'react';
import { lifecyclePhases } from '@/data/scheduleProfiles';
import { formatManMonths } from '@/lib/effort';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { Chevron } from './ctable';
import { IconFilter } from './icons';
import { useProgramWork } from './useProgramWork';
import { useStageSteps } from './useStageSteps';

/**
 * The program in time: one bar per stage, grouped by phase, with the checkpoint
 * that lands at the end of a stage riding on that stage's own bar.
 *
 * The prototype moved the checkpoints there for a reason. Floating in a band of
 * their own they were a row of diamonds nobody could attribute; on the bar, the
 * date explains itself — this stage closing is what that checkpoint is. The
 * diamond carries its own MM/DD, so a reader never has to trace down a column
 * to find out when it is.
 *
 * Row height is a setting because 23 stages at a comfortable height is a lot of
 * scrolling, and the same chart is read two ways: "where are we" wants
 * everything on one screen, "what is happening in March" wants room to read the
 * labels. The bar grows with the row, so the tall setting is not hairlines
 * floating in space.
 *
 * Opening a stage adds its activities under it on the same axis, rather than
 * navigating away: what a stage's bar is made of is the question the chart
 * raises, and it should be answered where it is asked.
 */
const ROWS = {
  compact: { row: 21, bar: 7, dia: 23, diaFont: 7.5 },
  normal: { row: 26, bar: 10, dia: 27, diaFont: 8 },
  tall: { row: 38, bar: 17, dia: 34, diaFont: 9.5 },
} as const;
type RowSize = keyof typeof ROWS;
const SIZE_LABEL: Record<RowSize, string> = { compact: 'S', normal: 'M', tall: 'L' };

const pad = (n: number) => String(n).padStart(2, '0');
const monthDay = (d: Date) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
const dday = (d: Date, today: Date) => {
  const n = Math.round((d.getTime() - today.getTime()) / 864e5);
  return n >= 0 ? `D−${n}` : `D+${Math.abs(n)}`;
};

export function TimelinePage({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);
  const edited = useAppStore((s) => s.edited);
  const resetSchedule = useAppStore((s) => s.resetSchedule);
  const { risks } = useProgramWork();
  const [size, setSize] = useState<RowSize>('normal');
  const [open, setOpen] = useState<string | null>(null);
  const chart = useRef<HTMLDivElement>(null);

  /* A bar that ends near the right edge would write its checkpoint off the
     chart, so that one writes leftwards instead, back over its own bar. It is
     measured after the browser has drawn it, because a label's width is not
     knowable before that — and re-measured on resize and on a row-height
     change, which move every label at once. */
  useLayoutEffect(() => {
    const fit = () => {
      const box = chart.current;
      if (!box) return;
      for (const el of box.querySelectorAll<HTMLElement>('.tl-tail')) {
        el.classList.remove('flip');
        const lane = el.parentElement;
        if (lane && el.offsetLeft + el.offsetWidth > lane.clientWidth) el.classList.add('flip');
      }
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  });

  const spans = stages.map((s) => schedule.stages[s.id]).filter(Boolean);
  if (!spans.length) return <p className="mono-note">This program has no stages.</p>;
  const start = new Date(Math.min(...spans.map((s) => s.start.getTime())));
  const end = new Date(Math.max(...spans.map((s) => s.end.getTime())));
  const total = end.getTime() - start.getTime();
  const at = (d: Date) => ((d.getTime() - start.getTime()) / total) * 100;
  const todayPct = at(today);
  const inWindow = today >= start && today <= end;

  const riskyStages = new Set(risks.map((r) => r.stageId));
  const risksOn = (id: string) => risks.filter((r) => r.stageId === id).length;
  /* By the stage the checkpoint is anchored to, never by the date. Three
     stages can close on the same day — Physical Design, Package & Substrate
     Design and Chip-Package-System Co-Verification all do — and matching on
     the date put Package Design Freeze on the first of them. */
  const cpOf = (id: string) => schedule.milestones.find((m) => m.anchor.stage === id);

  const barColour = (id: string) => {
    const sp = schedule.stages[id];
    if (!sp) return 'var(--st-future)';
    if (today > sp.end) return 'var(--st-done)';
    if (today < sp.start) return 'var(--st-future)';
    return riskyStages.has(id) ? 'var(--st-risk)' : 'var(--st-run)';
  };

  const m = ROWS[size];
  /* the lane starts 330px in and ends 20px short of the right edge */
  const guideAt = (pct: number) => `calc(330px + (100% - 350px) * ${pct / 100})`;

  return (
    <>
      <div className="hd">
        <h1>Timeline</h1>
        <span className="pill">{stages.length} stages</span>
        <span className="pill" style={{ marginLeft: 6 }}>
          {schedule.milestones.length} checkpoints
        </span>
        <span style={{ flexGrow: 1 }} />
        <button className="btn sm" type="button">
          <IconFilter />
          Filter
        </button>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Rows</span>
        <div className="seg-ctl">
          {(Object.keys(ROWS) as RowSize[]).map((k) => (
            <button
              key={k}
              type="button"
              className={size === k ? 'on' : undefined}
              data-rowh={k}
              aria-pressed={size === k}
              title={`${k} rows`}
              onClick={() => setSize(k)}
            >
              {SIZE_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="ptl-scroll">
        {/* the sizes go on .tl itself: the stylesheet declares its defaults
            there, and a value inherited from the wrapper would lose to them */}
        <div
          className="tl"
          data-timeline
          ref={chart}
          style={
            {
              ['--tlh']: `${m.row}px`,
              ['--tlb']: `${m.bar}px`,
              ['--dia']: `${m.dia}px`,
              ['--diaf']: `${m.diaFont}px`,
            } as React.CSSProperties
          }
        >
          <div style={{ borderBottom: '1px solid var(--line-strong)' }}>
            <div className="tl-grid">
              <div style={{ padding: '8px 0 6px 20px', display: 'flex', alignItems: 'flex-end' }}>
                <span className="cap">Stage</span>
              </div>
              <div style={{ position: 'relative', marginRight: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    borderTop: '1px solid var(--line-soft)',
                    position: 'relative',
                  }}
                >
                  {inWindow && (
                    <div
                      className="num"
                      style={{
                        position: 'absolute',
                        left: `${todayPct.toFixed(2)}%`,
                        transform: 'translateX(-50%)',
                        top: 3,
                        fontSize: 10.5,
                        color: '#fff',
                        background: 'var(--accent)',
                        padding: '1px 7px',
                        borderRadius: 4,
                        fontWeight: 600,
                        zIndex: 2,
                      }}
                    >
                      Today
                    </div>
                  )}
                  <Scale start={start} end={end} at={at} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            {/* the years are the frame the whole chart is read against */}
            {schedule.milestones
              .filter((cp) => cp.major)
              .map((cp) => (
                <div key={cp.id} className="ms-guide" style={{ left: guideAt(at(cp.date)) }} />
              ))}
            {inWindow && <div className="today-line" style={{ left: guideAt(todayPct) }} />}

            {lifecyclePhases.map(({ id: pid, label: plabel }) => {
              const mine = stages.filter((s) => s.phaseId === pid);
              if (!mine.length) return null;
              const atRisk = mine.filter((s) => riskyStages.has(s.id)).length;
              return (
                <div key={pid}>
                  <div className="tl-ph">
                    <span
                      style={{
                        paddingLeft: 20,
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: 'var(--ink-2)',
                      }}
                    >
                      {plabel}
                      <span className="pill" style={{ marginLeft: 7, fontSize: 10.5 }}>
                        {mine.length}
                      </span>
                      {atRisk > 0 && (
                        <span className="pill risk" style={{ marginLeft: 5, fontSize: 10.5 }}>
                          {atRisk} at risk
                        </span>
                      )}
                    </span>
                    <span />
                  </div>
                  {mine.map((s) => {
                    const sp = schedule.stages[s.id];
                    if (!sp) return null;
                    const running = today >= sp.start && today <= sp.end;
                    const isOpen = open === s.id;
                    const l = at(sp.start);
                    const w = Math.max(0.3, at(sp.end) - l);
                    const cp = cpOf(s.id);
                    const rkn = risksOn(s.id);
                    return (
                      <div key={s.id}>
                        <button
                          type="button"
                          className={isOpen ? 'tl-row on' : 'tl-row'}
                          data-tl={s.id}
                          onClick={() => setOpen(isOpen ? null : s.id)}
                        >
                          <span className="tl-name">
                            <span
                              className="pill"
                              style={{
                                fontSize: 10.5,
                                width: 44,
                                textAlign: 'center',
                                background: isOpen ? 'var(--line)' : undefined,
                              }}
                            >
                              {s.shortTitle}
                            </span>
                            <span
                              className="ell"
                              style={{
                                fontSize: 12.5,
                                color: running || isOpen ? 'var(--ink)' : 'var(--ink-2)',
                                fontWeight: running || isOpen ? 600 : 400,
                              }}
                            >
                              {s.title}
                            </span>
                          </span>
                          <span className="tl-lane">
                            <i
                              className="tl-bar"
                              style={{
                                left: `${l.toFixed(2)}%`,
                                width: `${w.toFixed(2)}%`,
                                background: barColour(s.id),
                              }}
                            />
                            {(cp || rkn > 0) && (
                              <span
                                className="tl-tail"
                                style={{ left: `calc(${(l + w).toFixed(2)}% + 9px)` }}
                              >
                                {cp && (
                                  <span className={cp.major ? 'ms-chip major' : 'ms-chip'}>
                                    <i className="dia">
                                      <b>{monthDay(cp.date)}</b>
                                    </i>
                                    {cp.label}
                                    <b className="dd">{dday(cp.date, today)}</b>
                                  </span>
                                )}
                                {rkn > 0 && (
                                  <span className="rk-chip">
                                    {rkn} risk{rkn > 1 ? 's' : ''}
                                  </span>
                                )}
                              </span>
                            )}
                          </span>
                        </button>
                        {isOpen && (
                          <StageBreakdown
                            stageId={s.id}
                            projectId={projectId}
                            title={s.title}
                            weeks={sp.durationWeeks}
                            from={sp.start}
                            to={sp.end}
                            at={at}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="tl-legend">
            <Legend colour="var(--st-done)" label="Complete" />
            <Legend colour="var(--st-run)" label="In flight" />
            <Legend colour="var(--st-risk)" label="In flight, open risk" />
            <Legend colour="var(--st-future)" label="Not started" />
            <span
              style={{
                width: 9,
                height: 9,
                transform: 'rotate(45deg)',
                background: 'var(--accent)',
                marginLeft: 6,
              }}
            />
            <span style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>Major checkpoint</span>
            <span
              style={{
                width: 8,
                height: 8,
                transform: 'rotate(45deg)',
                border: '1.5px solid var(--ink-3)',
              }}
            />
            <span style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>Checkpoint</span>
            <span style={{ flexGrow: 1 }} />
            {edited && (
              <button type="button" className="pill warn" onClick={() => resetSchedule()}>
                Schedule has manual date edits — reset
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * One row per engineering activity of the stage, on the same axis as the bars
 * above — which is the point: an activity that runs past its stage's own bar is
 * visible as soon as the two are drawn against the same scale.
 */
function StageBreakdown({
  stageId,
  projectId,
  title,
  weeks,
  from,
  to,
  at,
}: {
  stageId: string;
  projectId: string;
  title: string;
  weeks: number;
  from: Date;
  to: Date;
  at: (d: Date) => number;
}) {
  const activities = useStageSteps(stageId);
  const router = useRouter();
  const stages = useAppStore((s) => s.stages);
  const stage = stages.find((s) => s.id === stageId);
  const mm = stage ? stage.engineeringEffort.reduce((n, e) => n + e, 0) : 0;
  const steps = activities.flatMap((a) => a.steps);
  const done = steps.filter((s) => s.done).length;

  if (!activities.length) {
    return (
      <div className="tl-head">
        <span className="nm">
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            No activities written for this stage.
          </span>
        </span>
        <span />
      </div>
    );
  }

  return (
    <>
      <div className="tl-head">
        <span className="nm">
          <Chevron open />
          <b style={{ fontSize: 11.5, color: 'var(--accent-hov)' }}>
            {activities.length} activities
          </b>
          <span className="num" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {done}/{steps.length} steps · {formatManMonths(mm).replace(' MM', '')} M/M
          </span>
        </span>
        <span
          style={{
            position: 'relative',
            height: 28,
            marginRight: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <span className="num" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {fmtDate(from)} → {fmtDate(to)} · {weeks}w
          </span>
          <button
            type="button"
            className="btn sm"
            style={{ height: 22, fontSize: 11.5, marginLeft: 10 }}
            onClick={() => router.push(`/p/${projectId}/stage/${stageId}/activity`)}
          >
            Open stage
          </button>
        </span>
      </div>

      {activities.map((a) => {
        const first = a.steps[0];
        const last = a.steps[a.steps.length - 1];
        if (!first || !last) return null;
        const l = at(first.start);
        const w = Math.max(0.3, at(last.end) - l);
        const colour =
          a.state.phase === 'done'
            ? 'var(--st-done)'
            : a.state.phase === 'run'
              ? 'var(--st-run)'
              : 'var(--st-future)';
        return (
          <button
            type="button"
            key={a.ref}
            className="tl-sub"
            data-tl-act={a.ref}
            title={`Open ${a.ref} in ${title}`}
            /* to the stage's Activity tab with this activity open, which is
               where the work is — not to the write-up, which is prose */
            onClick={() =>
              router.push(`/p/${projectId}/stage/${stageId}/activity?act=${a.ref}`)
            }
          >
            <span className="nm">
              <span style={{ width: 4, flexShrink: 0 }} />
              <span className="ref" style={{ fontSize: 10.5, padding: '1px 6px', flexShrink: 0 }}>
                {a.ref}
              </span>
              <span
                className="ell"
                style={{
                  fontSize: 12.5,
                  color: a.state.phase === 'future' ? 'var(--ink-3)' : 'var(--ink-2)',
                }}
              >
                {a.title}
              </span>
            </span>
            <span className="lane">
              <i
                className="b"
                style={{ left: `${l.toFixed(2)}%`, width: `${w.toFixed(2)}%`, background: colour }}
              />
              <span
                className="num"
                style={{
                  position: 'absolute',
                  left: `calc(${(l + w).toFixed(2)}% + 7px)`,
                  top: 6,
                  fontSize: 10,
                  color: 'var(--ink-4)',
                  whiteSpace: 'nowrap',
                }}
              >
                {a.state.done}/{a.state.total}
              </span>
            </span>
          </button>
        );
      })}
    </>
  );
}

const Legend = ({ colour, label }: { colour: string; label: string }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-2)' }}>
    <span style={{ width: 12, height: 6, borderRadius: 3, background: colour }} />
    {label}
  </span>
);

/**
 * The scale across the top: years for a whole program, months once the window
 * is short enough for them to be readable. Years carry weight rather than
 * sitting in the same grey as everything else — they are the frame.
 */
function Scale({ start, end, at }: { start: Date; end: Date; at: (d: Date) => number }) {
  const months = (end.getTime() - start.getTime()) / 864e5 / 30.44;
  const cells: { grow: number; label: string }[] = [];

  if (months > 30) {
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      const a = Math.max(0, at(new Date(y, 0, 1)));
      const b = Math.min(100, at(new Date(y + 1, 0, 1)));
      if (b <= 0 || a >= 100) continue;
      cells.push({ grow: b - a, label: String(y) });
    }
  } else {
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let c = new Date(start.getFullYear(), start.getMonth(), 1);
    while (c <= end) {
      const next = new Date(c.getFullYear(), c.getMonth() + 1, 1);
      const a = Math.max(0, at(c));
      const b = Math.min(100, at(next));
      if (b > 0 && a < 100) {
        cells.push({
          grow: b - a,
          label: MON[c.getMonth()] + (c.getMonth() === 0 ? ` '${String(c.getFullYear()).slice(2)}` : ''),
        });
      }
      c = next;
    }
  }

  const big = months > 30;
  return (
    <>
      {cells.map((c) => (
        <div
          key={c.label}
          style={{
            flexGrow: Math.max(1, c.grow),
            flexBasis: 0,
            fontSize: big ? 14 : 11.5,
            fontWeight: big ? 700 : 500,
            letterSpacing: big ? '-.01em' : 0,
            color: big ? 'var(--ink-2)' : 'var(--ink-3)',
            padding: big ? '6px 0 6px 9px' : '5px 0 5px 6px',
            borderRight: '1px solid var(--line)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {c.label}
        </div>
      ))}
    </>
  );
}
