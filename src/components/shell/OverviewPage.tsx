'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { activitySteps } from '@/data/activitySteps';
import { estimateCost } from '@/lib/effort';
import { fmtDate, fmtDT } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { ATTN_LIMIT, ATTN_LIMITS } from '@/lib/attention';
import { Avatar, IconMail } from './icons';
import { useAttention } from './useAttention';
import { useRowLimit } from './useRowLimit';
import { useProgramWork } from './useProgramWork';

/**
 * Where the programme is, on one screen.
 *
 * Four things in the order a TPM reads them: the figures, what needs answering
 * today, when the checkpoints land, and who is doing what right now. The
 * schedule sits beside the smaller cards rather than under them, because it is
 * the one that rewards a wide look.
 */
export function OverviewPage({ projectId }: { projectId: string }) {
  const { overdue, risks } = useProgramWork();
  const deliverables = useAppStore((s) => s.deliverables);
  const schedule = useAppStore((s) => s.schedule);
  const stages = useAppStore((s) => s.stages);
  const kickoff = useAppStore((s) => s.kickoff);
  const today = useAppStore((s) => s.today);

  const allDeliv = Object.values(deliverables).flat();
  const doneDeliv = allDeliv.filter((d) => d.done).length;
  const progress = allDeliv.length ? Math.round((doneDeliv / allDeliv.length) * 100) : 0;
  /* A program that does not run Tapeout has no tapeout date, and the stat says
     so rather than counting down to the end of whatever its last stage is. */
  const days = schedule.tapeout
    ? Math.round((schedule.tapeout.getTime() - today.getTime()) / 864e5)
    : null;
  const mm = stages.reduce((n, s) => n + s.engineeringEffort.reduce((a, e) => a + e, 0), 0);

  const spans = stages.map((s) => schedule.stages[s.id]).filter(Boolean);
  const first = spans.length ? Math.min(...spans.map((s) => s.start.getTime())) : 0;
  const last = spans.length ? Math.max(...spans.map((s) => s.end.getTime())) : 1;
  const week = Math.max(1, Math.round((today.getTime() - kickoff.getTime()) / 864e5 / 7));
  const total = Math.round((last - first) / 864e5 / 7);
  const riskStages = new Set(risks.map((r) => r.stageId)).size;

  return (
    <>
      <div className="hd">
        <h1>Overview</h1>
        <span className="pill">
          Week {week} of {total}
        </span>
        <span style={{ flexGrow: 1 }} />
        <button className="btn sm" type="button">
          <IconMail />
          Email summary
        </button>
      </div>

      <div style={{ padding: '18px 20px 40px' }}>
        <div
          className="card"
          style={{ display: 'flex', alignItems: 'center', padding: '13px 0 13px 18px', flexWrap: 'wrap' }}
        >
          <Stat k="Progress" v={`${progress}%`} s={`${doneDeliv} of ${allDeliv.length} deliverables`} />
          <Stat
            k="Tapeout"
            v={days === null ? 'None' : days >= 0 ? `D−${days}` : `D+${Math.abs(days)}`}
            s={schedule.tapeout ? fmtDate(schedule.tapeout) : 'no tapeout on this program'}
          />
          <Stat k="Open risks" v={String(risks.length)} s={`across ${riskStages} stages`} tone />
          <Stat k="Overdue" v={String(overdue.length)} s="past target date" tone={overdue.length > 0} />
          <CostStat manMonths={mm} />
        </div>

        <NeedsYouToday projectId={projectId} />

        <div className="ov-cols">
          <ScheduleCard projectId={projectId} first={first} last={last} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <InFlight projectId={projectId} />
            <EffortCard projectId={projectId} />
            <RecentUpdates projectId={projectId} />
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ k, v, s, tone }: { k: string; v: string; s: string; tone?: boolean }) {
  return (
    <div style={{ padding: '0 18px 0 0', marginRight: 18, borderRight: '1px solid var(--line)' }}>
      <div className="subcap" style={tone ? { color: 'var(--risk-ink)' } : undefined}>
        {k}
      </div>
      <div
        className="num"
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: '-.02em',
          marginTop: 3,
          color: tone ? 'var(--risk)' : undefined,
        }}
      >
        {v}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{s}</div>
    </div>
  );
}

/**
 * The estimated cost, and the rate behind it.
 *
 * The rate is the one figure on this bar that is somebody's assumption rather
 * than something the program's own data says, so it is the one that has to be
 * changeable from where it is read. It was asked for once at creation and
 * could never be revisited, which is how a program ends up quoting a number
 * nobody believes any more.
 */
function CostStat({ manMonths }: { manMonths: number }) {
  const rate = useAppStore((s) => s.costPerManMonth);
  const currency = useAppStore((s) => s.currency);
  const setCostRate = useAppStore((s) => s.setCostRate);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(rate));
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const save = () => {
    const n = Number(draft);
    setCostRate(Number.isFinite(n) && n >= 0 ? n : 0, currency);
    setOpen(false);
  };

  return (
    <div className="menu" ref={box} style={{ paddingRight: 18 }}>
      <button
        type="button"
        className="coststat"
        data-edit-rate
        aria-expanded={open}
        title={rate ? `${rate.toLocaleString()} per man-month — click to change` : 'Set a rate'}
        onClick={() => {
          setDraft(String(rate));
          setOpen((o) => !o);
        }}
      >
        <span className="subcap">Estimated cost</span>
        <span
          className="num"
          style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', marginTop: 3 }}
        >
          {rate ? `$${(estimateCost(manMonths, rate) / 1e6).toFixed(1)}M` : '—'}
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>
          {Math.round(manMonths).toLocaleString()} M/M
          {rate ? ` · $${rate.toLocaleString()}/MM` : ' · no rate set'}
        </span>
      </button>

      {/* right-aligned: the cost is the last stat on the bar, so a popover
          hanging off its left edge runs off the screen */}
      {open && (
        <div className="menu-pop" data-rate-pop style={{ minWidth: 268, padding: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>Cost per man-month</div>
          <p className="mono-note" style={{ margin: '3px 0 9px', maxWidth: '38ch' }}>
            A fully-loaded engineering rate. The program&rsquo;s{' '}
            {Math.round(manMonths).toLocaleString()} M/M are multiplied by it; zero leaves the
            figure blank.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <input
              className="lnkin"
              type="number"
              min={0}
              step={500}
              autoFocus
              aria-label="Cost per man-month"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save();
              }}
            />
            <button type="button" className="btn pri sm" data-save-rate onClick={save}>
              Save
            </button>
          </div>
          <p className="mono-note" style={{ marginTop: 8 }} data-rate-preview>
            {Number(draft) > 0
              ? `≈ $${(estimateCost(manMonths, Number(draft)) / 1e6).toFixed(1)}M`
              : 'no cost estimate'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * How many rows the panel shows before it scrolls.
 *
 * A reader's preference, not the program's, so it is remembered in the browser
 * and offered where it applies rather than buried in a settings screen. The
 * list still scrolls past the number — the setting decides how much is worth
 * seeing without scrolling, not how much exists.
 */
function RowLimit({
  limit,
  shown,
  total,
  onChoose,
}: {
  limit: number;
  shown: number;
  total: number;
  onChoose: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <span className="menu" ref={box} style={{ display: 'inline-flex' }}>
      <button
        type="button"
        className={open ? 'btn sm on' : 'btn sm'}
        data-row-limit
        aria-expanded={open}
        title="How many rows to show"
        onClick={() => setOpen((o) => !o)}
      >
        Top {limit}
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8b8f98"
          strokeWidth="2.6"
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="menu-pop" data-limit-pop>
          {ATTN_LIMITS.map((n) => (
            <button
              key={n}
              type="button"
              className="mi"
              data-limit={n}
              aria-current={n === limit || undefined}
              onClick={() => {
                onChoose(n);
                setOpen(false);
              }}
            >
              <span style={{ width: 13, flexShrink: 0, color: 'var(--accent)' }}>
                {n === limit ? '✓' : ''}
              </span>
              <span>
                Top {n}
                <span className="d">
                  {n === ATTN_LIMIT ? 'the default' : `${n} rows before it scrolls`}
                </span>
              </span>
            </button>
          ))}
          <p className="mono-note" style={{ padding: '6px 9px 2px' }}>
            {shown < total
              ? `Showing ${shown} of ${total}. The rest are under All overdue and All risks.`
              : `Showing all ${shown}.`}
          </p>
        </div>
      )}
    </span>
  );
}

/**
 * The list the screen exists for.
 *
 * Every row goes somewhere: a step to the step, a deliverable to the step that
 * hands it over. And it is all of it — there used to be a per-tag cap, which
 * meant that with seventeen things overdue thirteen were missing from the one
 * list that says what to answer. It scrolls instead.
 */
function NeedsYouToday({ projectId }: { projectId: string }) {
  const [limit, setLimit] = useRowLimit();
  /* Everything, so the header can say how much there is; the panel shows the
     first `limit` of it. Anything left out is one click away under All
     overdue, and the count says how much that is. */
  const all = useAttention(limit);
  const rows = all.slice(0, limit);
  /* Nothing is actually wrong: every row is work coming up, so the heading
     should not claim otherwise. */
  const nextUp = rows.length > 0 && rows.every((r) => r.tag === 'Next up');
  const wrong = all.filter((r) => r.tag !== 'Next up').length;
  const stages = useAppStore((s) => s.stages);
  const router = useRouter();

  const open = (row: (typeof rows)[number]) => {
    const stage = stages.find((s) => s.id === row.stageId);
    if (!stage) return;
    const base = `/p/${projectId}/stage/${stage.id}`;
    router.push(
      row.step
        ? `${base}/activity?step=${row.step.act}:${row.step.n}`
        : `${base}/deliverables?deliverable=${row.deliverableId ?? ''}`,
    );
  };

  return (
    <div className="card" style={{ marginTop: 16, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '13px 18px',
          borderBottom: '1px solid var(--line-soft)',
          flexWrap: 'wrap',
        }}
      >
        {/* The heading says which list this is. With nothing overdue and no
            risk unanswered the panel is not empty — it is the next seven dates,
            and calling that "needs you today" would be crying wolf. */}
        <b style={{ fontSize: 14 }}>{nextUp ? 'Coming up next' : 'Needs you today'}</b>
        {/* the count is what is wrong, not how many rows there are: the rest
            of the list is work coming up, and counting it as trouble would be
            crying wolf. */}
        <span className={wrong ? 'pill risk' : 'pill'} data-attn-count>
          {wrong > rows.length ? `${rows.length} of ${wrong}` : wrong || rows.length}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {nextUp
            ? 'nothing is overdue and no risk is unanswered — the nearest dates ahead, in the order they fall'
            : 'overdue, then due inside three weeks, then risks nobody has answered, then what is coming — worst first'}
        </span>
        <span style={{ flexGrow: 1 }} />
        <RowLimit limit={limit} onChoose={setLimit} shown={rows.length} total={all.length} />
        <Link className="btn sm" href={`/p/${projectId}/risks`}>
          All risks
        </Link>
        <Link className="btn sm" href={`/p/${projectId}/overdue`}>
          All overdue
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="empty" style={{ padding: 34 }}>
          <p className="mono-note">
            Nothing is past due, due inside three weeks, or sitting unanswered.
          </p>
        </div>
      ) : (
        <>
          <div className="attn hdr">
            <span>STATUS</span>
            <span>TYPE</span>
            <span>ITEM</span>
            <span>TIMING</span>
            <span>TAG</span>
            <span>OWNER</span>
          </div>
          <div className="attn-list">
            {rows.map((r) => (
              <button
                type="button"
                className="attn"
                key={r.key}
                data-attn={r.key}
                data-tag={r.tag}
                onClick={() => open(r)}
              >
                <span style={{ justifySelf: 'start', marginTop: 1 }}>
                  <span
                    className={
                      r.tag === 'Overdue' ? 'pill risk' : r.tag === 'Next up' ? 'pill' : 'pill warn'
                    }
                    style={{ fontSize: 10.5 }}
                  >
                    {r.tag}
                  </span>
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{r.type}</span>
                <span style={{ minWidth: 0, fontSize: 13.5, fontWeight: 550, lineHeight: 1.45 }}>
                  {r.title}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    marginTop: 2,
                    fontWeight: r.tag === 'Overdue' ? 600 : 400,
                    color: r.tag === 'Overdue' ? 'var(--risk)' : 'var(--ink-2)',
                  }}
                >
                  {r.why}
                </span>
                <span style={{ justifySelf: 'start', marginTop: 1 }}>
                  {r.ref ? (
                    <span className="ref">{r.ref}</span>
                  ) : (
                    <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>—</span>
                  )}
                </span>
                <span
                  style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, marginTop: 1 }}
                >
                  {r.owner ? (
                    <>
                      <Avatar name={r.owner} small />
                      <span className="ell" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                        {r.owner}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Unassigned</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The checkpoint list, positioned in time.
 *
 * Each row carries the stage that lands it, so the date explains itself — a
 * band of diamonds floating on their own is a row nobody can attribute.
 */
function ScheduleCard({
  projectId,
  first,
  last,
}: {
  projectId: string;
  first: number;
  last: number;
}) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);
  const { risks } = useProgramWork();
  const risky = new Set(risks.map((r) => r.stageId));

  const at = (t: number) => ((t - first) / (last - first)) * 100;
  const todayAt = Math.max(0, Math.min(100, at(today.getTime())));
  const rows = [...schedule.milestones]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((m) => {
      /* The stage the checkpoint hangs off, by its anchor. Matching on the date
         attributed it to whichever stage happened to close first that day —
         and three of them close together. */
      const stage = stages.find((s) => s.id === m.anchor.stage);
      return { m, stage, passed: m.date < today, risky: !!stage && risky.has(stage.id) };
    });

  const years: number[] = [];
  for (let y = new Date(first).getFullYear(); y <= new Date(last).getFullYear(); y++) {
    const a = at(new Date(y, 0, 1).getTime());
    if (a >= 0 && a <= 100) years.push(y);
  }

  return (
    <div className="card" style={{ padding: '14px 18px 16px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 14 }}>Schedule</b>
        <span className="pill">{rows.length} checkpoints</span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          each one lands at the end of the stage beside it
        </span>
        <span style={{ flexGrow: 1 }} />
        <Link className="btn sm" href={`/p/${projectId}/timeline`}>
          Open timeline
        </Link>
      </div>

      <div style={{ position: 'relative' }}>
        <div className="ms-hdrow">
          <span className="cap">Checkpoint</span>
          <span style={{ position: 'relative', height: 14 }}>
            {years.map((y) => (
              <span
                key={y}
                style={{
                  position: 'absolute',
                  left: `${at(new Date(y, 0, 1).getTime())}%`,
                  bottom: 0,
                  fontSize: 10.5,
                  color: 'var(--ink-4)',
                  borderLeft: '1px solid var(--line)',
                  paddingLeft: 5,
                }}
              >
                {y}
              </span>
            ))}
          </span>
          <span className="cap r">Date</span>
          <span className="cap r">Countdown</span>
        </div>

        <div style={{ position: 'relative' }}>
          {/* one vertical line for today, drawn over the whole run of rows: the
              Today split says where the past stops, this says where it is on
              every bar at once */}
          <div
            className="today-line"
            style={{ left: `calc(206px + 10px + (100% - 216px - 156px) * ${todayAt / 100})` }}
          />
          {rows.map((r, i) => {
            const span = r.stage ? schedule.stages[r.stage.id] : null;
            const l = span ? at(span.start.getTime()) : Math.max(0, at(r.m.date.getTime()) - 1);
            const w = span ? at(span.end.getTime()) - l : 1;
            const colour = r.passed ? 'var(--st-done)' : r.risky ? 'var(--risk)' : 'var(--st-run)';
            const days = Math.round((r.m.date.getTime() - today.getTime()) / 864e5);
            /* the line where the past stops and the rest of the programme starts */
            const splitHere = i > 0 && rows[i - 1].passed && !r.passed;
            return (
              <div key={r.m.id} style={{ display: 'contents' }}>
                {splitHere && (
                  <div className="ms-hdrow ms-split">
                    <span className="cap" style={{ color: 'var(--accent)' }}>
                      Today
                    </span>
                    <span style={{ height: 1, background: 'var(--accent)', opacity: 0.35 }} />
                    <span />
                    <span />
                  </div>
                )}
                <Link
                  className="ms-row"
                  href={
                    r.stage
                      ? `/p/${projectId}/stage/${r.stage.id}/activity`
                      : `/p/${projectId}/timeline`
                  }
                  data-checkpoint={r.m.id}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        transform: 'rotate(45deg)',
                        flexShrink: 0,
                        ...(r.m.major
                          ? { background: r.passed ? 'var(--ink-3)' : 'var(--accent)' }
                          : { border: `1.5px solid ${r.passed ? 'var(--ink-4)' : 'var(--ink-2)'}` }),
                      }}
                    />
                    <span
                      className="ell"
                      style={{
                        fontSize: 13,
                        fontWeight: r.m.major ? 600 : undefined,
                        color: r.passed ? 'var(--ink-3)' : undefined,
                      }}
                    >
                      {r.m.label}
                    </span>
                    {r.stage && (
                      <span className="pill" style={{ fontSize: 10 }}>
                        {r.stage.shortTitle}
                      </span>
                    )}
                  </span>
                  <span style={{ position: 'relative', height: 20 }}>
                    <i
                      style={{
                        position: 'absolute',
                        left: `${l.toFixed(2)}%`,
                        width: `${w.toFixed(2)}%`,
                        top: 8,
                        height: 4,
                        borderRadius: 2,
                        background: colour,
                        opacity: r.passed ? 0.5 : 1,
                        display: 'block',
                      }}
                    />
                    <i
                      style={{
                        position: 'absolute',
                        left: `calc(${at(r.m.date.getTime()).toFixed(2)}% - 5px)`,
                        top: 5,
                        width: 10,
                        height: 10,
                        transform: 'rotate(45deg)',
                        display: 'block',
                        ...(r.m.major
                          ? { background: r.passed ? 'var(--ink-3)' : 'var(--accent)' }
                          : {
                              background: 'var(--bg)',
                              border: `1.5px solid ${r.passed ? 'var(--ink-4)' : 'var(--ink)'}`,
                            }),
                      }}
                    />
                    {r.risky && !r.passed && (
                      <i
                        style={{
                          position: 'absolute',
                          left: `calc(${at(r.m.date.getTime()).toFixed(2)}% + 10px)`,
                          top: 6,
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--risk)',
                          display: 'block',
                        }}
                      />
                    )}
                  </span>
                  <span
                    className="num r"
                    style={{ fontSize: 12, color: r.passed ? 'var(--ink-4)' : 'var(--ink-2)' }}
                  >
                    {fmtDate(r.m.date)}
                  </span>
                  <span className="r">
                    <span
                      className={r.m.major && !r.passed ? 'pill num acc' : 'pill num'}
                      style={{ fontSize: 11 }}
                    >
                      {r.passed ? 'done' : `D−${Math.max(0, days)}`}
                    </span>
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** The stages running today, how far into their window each is, and their risks. */
function InFlight({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);
  const { risks } = useProgramWork();

  const running = stages.filter((s) => {
    const span = schedule.stages[s.id];
    return span && span.start <= today && today <= span.end;
  });

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-hd">
        <b style={{ fontSize: 13.5 }}>In flight today</b>
        <span className="pill">{running.length}</span>
      </div>
      {running.map((s) => {
        const span = schedule.stages[s.id];
        const through = Math.min(
          100,
          Math.max(
            0,
            ((today.getTime() - span.start.getTime()) /
              (span.end.getTime() - span.start.getTime())) *
              100,
          ),
        );
        const rk = risks.filter((r) => r.stageId === s.id).length;
        return (
          <Link
            className="trow"
            key={s.id}
            href={`/p/${projectId}/stage/${s.id}/activity`}
            style={{ gridTemplateColumns: '52px 1fr 46px 30px', minHeight: 34, padding: '0 16px' }}
          >
            <span className="pill" style={{ fontSize: 10.5, justifySelf: 'start' }}>
              {s.shortTitle}
            </span>
            <span className="ell" style={{ fontSize: 13 }}>
              {s.title}
            </span>
            <span className="bar">
              <i
                style={{
                  width: `${through.toFixed(0)}%`,
                  background: rk ? 'var(--risk)' : 'var(--st-run)',
                }}
              />
            </span>
            <span
              className="r num"
              style={{
                fontSize: 11.5,
                color: rk ? 'var(--risk)' : 'var(--ink-4)',
                fontWeight: rk ? 600 : 400,
              }}
            >
              {rk || '—'}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Where the man-months go, heaviest first. */
function EffortCard({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const { risks } = useProgramWork();
  const risky = new Set(risks.map((r) => r.stageId));

  const all = stages.map((s) => ({ s, mm: s.engineeringEffort.reduce((n, e) => n + e, 0) }));
  const total = all.reduce((n, r) => n + r.mm, 0);
  const rows = [...all].sort((a, b) => b.mm - a.mm).slice(0, 5);
  const max = rows[0]?.mm ?? 1;

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-hd">
        <b style={{ fontSize: 13.5 }}>Where the effort goes</b>
        <span style={{ flexGrow: 1 }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {Math.round(total).toLocaleString()} M/M
        </span>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {rows.map((r) => (
          <div key={r.s.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12.5,
                marginBottom: 5,
              }}
            >
              <span className="ell">{r.s.title}</span>
              <span className="num" style={{ color: 'var(--ink-3)' }}>
                {Math.round(r.mm).toLocaleString()}
              </span>
            </div>
            <span className="bar" style={{ display: 'block' }}>
              <i
                style={{
                  width: `${((r.mm / max) * 100).toFixed(0)}%`,
                  background: risky.has(r.s.id) ? 'var(--risk)' : 'var(--st-run)',
                }}
              />
            </span>
          </div>
        ))}
        <Link
          href={`/p/${projectId}/stages`}
          style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}
        >
          All {stages.length} stages →
        </Link>
      </div>
    </div>
  );
}

/** The last few things anybody said, wherever they said them. */
function RecentUpdates({ projectId }: { projectId: string }) {
  const posts = useAppStore((s) => s.posts);
  const content = useAppStore((s) => s.content);
  const stages = useAppStore((s) => s.stages);

  const stageOfAct = (ref: string | null) => (ref ? (activitySteps[ref]?.st ?? null) : null);
  const fromPosts = posts.map((p) => ({
    id: p.id,
    at: p.editedAt ?? p.createdAt,
    who: p.author,
    text: p.text,
    stageId: p.stageId ?? stageOfAct(p.activityRef),
    stepN: p.stepN,
    risk: p.kind === 'risk',
  }));
  const fromItems = Object.entries(content).flatMap(([id, c]) =>
    (['keyinfo', 'activities', 'risks'] as const).flatMap((k) =>
      c[k].flatMap((it) =>
        it.updates.map((u) => ({
          id: u.id,
          at: u.date,
          who: it.owner,
          text: u.text,
          stageId: id,
          stepN: null as number | null,
          risk: k === 'risks',
        })),
      ),
    ),
  );
  const all = [...fromPosts, ...fromItems].sort((a, b) => b.at.getTime() - a.at.getTime());
  const shortOf = (id: string | null) => stages.find((s) => s.id === id)?.shortTitle;

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-hd">
        <b style={{ fontSize: 13.5 }}>Recent updates</b>
        <span className="pill">{all.length}</span>
        <span style={{ flexGrow: 1 }} />
        <Link className="btn sm" href={`/p/${projectId}/updates`}>
          See all
        </Link>
      </div>
      {all.slice(0, 4).map((p) => (
        <div key={p.id} className="ovfeed">
          <Avatar name={p.who || '—'} />
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 13 }}>{p.who || '—'}</b>
              {shortOf(p.stageId) && (
                <span className="pill" style={{ fontSize: 10.5 }}>
                  {shortOf(p.stageId)}
                </span>
              )}
              {p.stepN != null && (
                <span className="pill acc" style={{ fontSize: 10.5 }}>
                  STEP {p.stepN}
                </span>
              )}
              <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                {fmtDT(p.at)}
              </span>
              {p.risk && <span className="dot" style={{ background: 'var(--risk)' }} />}
            </div>
            <div className="ell2" style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 1, lineHeight: 1.45 }}>
              {p.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
