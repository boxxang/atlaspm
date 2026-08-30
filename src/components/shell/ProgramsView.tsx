'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useSyncExternalStore, useTransition } from 'react';
import { createProject, deleteProject } from '@/app/actions';
import { activitySteps } from '@/data/activitySteps';
import { BUILTIN_PROFILE, lifecyclePhases, stageMilestone } from '@/data/scheduleProfiles';
import type { ProfileSummary } from '@/data/types';
import { requiredStages } from '@/lib/customProfile';
import { estimateCost } from '@/lib/effort';
import type { ProjectSummary } from '@/lib/queries';
import { computeSchedule, fmtDate, fromISO, startOfDay, toISO } from '@/lib/schedule';
import { fromStepIndex, plannedSteps } from '@/lib/steps';
import {
  Avatar,
  IconEmptyList,
  IconFilter,
  IconPlus,
  IconSearch,
  IconSort,
  IconTick,
} from './icons';

/**
 * The programs screen: a table, not a grid of cards.
 *
 * This is where a TPM holding several tape-outs starts the day, so it is a
 * table sorted by whichever program is closest to its mask order — and it reads
 * the same at one program as at twenty, which a card grid does not.
 *
 * Every figure on a row is one the program's own screens also show, computed
 * the same way: risks flagged on open steps, steps past their date. A row that
 * disagreed with the program it opens would be worse than no row at all.
 */
const ME = 'Sangwook Park';

export function ProgramsView({
  projects,
  profiles,
}: {
  projects: ProjectSummary[];
  profiles: ProfileSummary[];
}) {
  const [picked, setPicked] = useState(projects[0]?.id ?? null);
  const selected = projects.find((p) => p.id === picked) ?? projects[0] ?? null;

  return (
    <div id="app">
      <div id="main">
        <div className="hd">
          <span className="mark">A</span>
          <h1 style={{ marginLeft: 2 }}>AtlasPM</h1>
          <div className="search" style={{ margin: '0 0 0 14px', width: 320 }}>
            <IconSearch />
            <span style={{ flexGrow: 1 }}>Search programs, stages, risks…</span>
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>⌘K</span>
          </div>
          <span style={{ flexGrow: 1 }} />
          <Avatar name={ME} />
        </div>

        <div className="body">
          <div className="scroll" id="view">
            <ProgramTable projects={projects} picked={picked} onPick={setPicked} profiles={profiles} />
          </div>
          {selected && <ProgramPeek project={selected} />}
        </div>
      </div>
    </div>
  );
}

const COLS = { gridTemplateColumns: '30px 1fr 140px 116px 100px 62px 62px 92px 96px' };

function ProgramTable({
  projects,
  picked,
  onPick,
  profiles,
}: {
  projects: ProjectSummary[];
  picked: string | null;
  onPick: (id: string) => void;
  profiles: ProfileSummary[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div
        style={{
          height: 56,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
        }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.02em' }}>Programs</h2>
        <span className="pill">{projects.length}</span>
        <span style={{ flexGrow: 1 }} />
        <button className="btn sm" type="button">
          <IconFilter />
          Filter
        </button>
        <button className="btn sm" type="button">
          <IconSort />
          Sort: Tapeout
        </button>
        <button className="btn pri sm" type="button" data-new-project onClick={() => setAdding(true)}>
          <IconPlus light />
          New program
        </button>
      </div>

      <div
        className="thead"
        style={{ ...COLS, background: 'var(--sunken)', borderTop: '1px solid var(--line)' }}
      >
        <span />
        <span>PROGRAM</span>
        <span>IN FLIGHT NOW</span>
        <span>PROGRESS</span>
        <span>TAPEOUT</span>
        <span className="r">RISKS</span>
        <span className="r">LATE</span>
        <span className="r">EFFORT</span>
        <span className="r">EST. COST</span>
      </div>

      {projects.map((p) => (
        <ProgramRow key={p.id} p={p} on={p.id === picked} onPick={() => onPick(p.id)} />
      ))}

      {adding ? (
        <NewProgramRow profiles={profiles} onClose={() => setAdding(false)} />
      ) : (
        <button
          type="button"
          className="trow"
          style={{ gridTemplateColumns: '30px 1fr', color: 'var(--ink-4)', minHeight: 52 }}
          data-new-project-row
          onClick={() => setAdding(true)}
        >
          <span
            style={{
              display: 'inline-flex',
              width: 26,
              height: 26,
              borderRadius: 7,
              border: '1.5px dashed var(--line-strong)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconPlus />
          </span>
          <span style={{ fontSize: 13.5 }}>
            New program — name it, set an expected kickoff, pick a template
          </span>
        </button>
      )}

      {projects.length <= 1 && (
        <div className="empty" style={{ paddingTop: 44 }}>
          <IconEmptyList />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>
            {projects.length === 1 ? 'One program so far' : 'No programs yet'}
          </div>
          <p className="mono-note" style={{ maxWidth: '46ch' }}>
            This list is where a TPM holding several tape-outs starts the day — sorted by whichever
            one is closest to its mask order. It reads the same at one program and at twenty.
          </p>
        </div>
      )}
    </>
  );
}

/** Today, from the browser's clock — never the server's. */
function useToday(): Date | null {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return useMemo(() => (mounted ? startOfDay(new Date()) : null), [mounted]);
}

function useProgramFigures(p: ProjectSummary) {
  const today = useToday();
  const schedule = useMemo(
    () => computeSchedule(p.kickoff, p.profile, p.overrides),
    [p.kickoff, p.profile, p.overrides],
  );

  /* Overdue means a step past its date with nothing handed over — the rule the
     program's own screens use, so a row and the program it opens agree. It is
     counted here rather than in the query because lateness needs the viewer's
     clock. */
  const overdue = useMemo(() => {
    if (!today) return 0;
    const done = new Set(p.doneSteps);
    let n = 0;
    for (const [ref, a] of Object.entries(activitySteps)) {
      const span = schedule.stages[a.st];
      if (!span) continue;
      for (const step of plannedSteps(span.start, fromStepIndex(ref, a))) {
        if (step.end < today && !done.has(`${ref}:${step.n}`)) n++;
      }
    }
    return n;
  }, [today, p.doneSteps, schedule]);

  const inFlight = useMemo(
    () =>
      today
        ? p.profile.stages
            .map((s) => s.key)
            .filter((k) => {
              const span = schedule.stages[k];
              return span && span.start <= today && today <= span.end;
            })
        : [],
    [today, p.profile.stages, schedule],
  );

  return { today, schedule, overdue, inFlight };
}

function ProgramRow({ p, on, onPick }: { p: ProjectSummary; on: boolean; onPick: () => void }) {
  const { today, schedule, overdue, inFlight } = useProgramFigures(p);
  const shortOf = (key: string) => p.profile.stages.find((s) => s.key === key)?.shortTitle ?? key;
  const risky = new Set(p.riskyStages);
  const pct = p.deliverablesTotal
    ? Math.round((p.deliverablesDone / p.deliverablesTotal) * 100)
    : 0;
  const days = today ? Math.round((schedule.tapeout.getTime() - today.getTime()) / 864e5) : null;

  return (
    <Link
      href={`/p/${p.id}/overview`}
      className={on ? 'trow on' : 'trow'}
      style={{ ...COLS, minHeight: 58 }}
      data-program={p.id}
      onMouseEnter={onPick}
    >
      <span className="mark" style={{ width: 26, height: 26 }}>
        {p.name.slice(0, 1).toUpperCase()}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <b style={{ fontSize: 14.5 }}>{p.name}</b>
          {p.edited && (
            <span className="pill warn" style={{ fontSize: 10.5 }}>
              Edited
            </span>
          )}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {p.profile.label} · {p.profile.stages.length} stages · kickoff {fmtDate(p.kickoff)}
        </span>
      </span>
      <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* a stage carrying an open risk is drawn as one here too */}
        {inFlight.slice(0, 2).map((k) => (
          <span
            className={risky.has(k) ? 'pill risk' : 'pill'}
            style={{ fontSize: 10 }}
            key={k}
          >
            {shortOf(k)}
          </span>
        ))}
        {inFlight.length > 2 && (
          <span className="pill" style={{ fontSize: 10 }}>
            +{inFlight.length - 2}
          </span>
        )}
      </span>
      <span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <b className="num" style={{ fontSize: 14 }}>
            {pct}%
          </b>
          <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            {p.deliverablesDone}/{p.deliverablesTotal}
          </span>
        </span>
        <span className="bar" style={{ marginTop: 5, display: 'block' }}>
          <i style={{ width: `${pct}%` }} />
        </span>
      </span>
      <span>
        <b className="num" style={{ fontSize: 13.5, display: 'block' }}>
          {days === null ? '—' : days >= 0 ? `D−${days}` : `D+${Math.abs(days)}`}
        </b>
        <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
          {fmtDate(schedule.tapeout)}
        </span>
      </span>
      <span className="r num" style={{ fontSize: 14, fontWeight: 600, color: 'var(--risk)' }}>
        {p.openRisks}
      </span>
      <span
        className="r num"
        style={{ fontSize: 14, fontWeight: 600, color: overdue ? 'var(--risk)' : 'var(--ink-4)' }}
      >
        {overdue}
      </span>
      <span className="r num" style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
        {Math.round(p.manMonths).toLocaleString()}{' '}
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>M/M</span>
      </span>
      <span className="r num" style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
        {p.costPerManMonth
          ? `$${(estimateCost(p.manMonths, p.costPerManMonth) / 1e6).toFixed(1)}M`
          : '—'}
      </span>
    </Link>
  );
}

/** Read a program before entering it. */
function ProgramPeek({ project }: { project: ProjectSummary }) {
  const { today, schedule, overdue } = useProgramFigures(project);
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const spans = project.profile.stages.map((s) => schedule.stages[s.key]).filter(Boolean);
  const first = spans.length ? Math.min(...spans.map((s) => s.start.getTime())) : 0;
  const last = spans.length ? Math.max(...spans.map((s) => s.end.getTime())) : 1;
  const at = (t: number) => ((t - first) / (last - first)) * 100;
  const riskyStages = new Set(project.riskyStages);
  const week = today
    ? Math.max(1, Math.round((today.getTime() - project.kickoff.getTime()) / 864e5 / 7))
    : 1;
  const total = Math.round((last - first) / 864e5 / 7);

  return (
    <aside id="peek" aria-label="Program preview" style={{ background: 'var(--sunken)' }}>
      <div className="prev-sec" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mark" style={{ width: 30, height: 30, borderRadius: 8, fontSize: 13 }}>
            {project.name.slice(0, 1).toUpperCase()}
          </span>
          <span style={{ flexGrow: 1 }}>
            <b style={{ fontSize: 16, letterSpacing: '-.015em', display: 'block' }}>
              {project.name}
            </b>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              Week {week} of {total}
            </span>
          </span>
        </div>
        <Link
          className="btn pri"
          href={`/p/${project.id}/overview`}
          style={{
            width: '100%',
            justifyContent: 'center',
            height: 32,
            marginTop: 14,
            fontSize: 13,
            fontWeight: 550,
          }}
        >
          Open program
        </Link>
      </div>

      <div className="prev-sec">
        <div className="cap" style={{ marginBottom: 12 }}>
          Next checkpoints
        </div>
        {schedule.milestones
          .filter((m) => (today ? m.date > today : true))
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 3)
          .map((m) => (
            <div
              key={m.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  transform: 'rotate(45deg)',
                  flexShrink: 0,
                  ...(m.major
                    ? { background: 'var(--accent)' }
                    : { border: '1.5px solid var(--ink-3)' }),
                }}
              />
              <span
                className="ell"
                style={{ flexGrow: 1, fontSize: 13, fontWeight: m.major ? 600 : undefined }}
              >
                {m.label}
              </span>
              <span className={m.major ? 'pill num acc' : 'pill num'} style={{ fontSize: 11 }}>
                {today
                  ? `D−${Math.max(0, Math.round((m.date.getTime() - today.getTime()) / 864e5))}`
                  : ''}
              </span>
            </div>
          ))}
      </div>

      <div className="prev-sec">
        <div className="cap" style={{ marginBottom: 12 }}>
          Needs attention
        </div>
        <PeekLine dot="var(--risk)" label="Open risks" n={project.openRisks} tone="var(--risk)" />
        <PeekLine
          dot="var(--risk)"
          label="Past target date"
          n={overdue}
          tone={overdue ? 'var(--risk)' : 'var(--ink-2)'}
        />
        <PeekLine
          dot="var(--warn)"
          label="Risks with no update in 7 days"
          n={project.staleRisks}
          tone="var(--ink-2)"
        />
      </div>

      <div style={{ padding: '16px 20px', flexGrow: 1 }}>
        <div className="cap" style={{ marginBottom: 12 }}>
          Schedule
        </div>
        <div style={{ position: 'relative' }}>
          {today && (
            <div className="today-line" style={{ left: `${at(today.getTime())}%`, bottom: 14 }} />
          )}
          {project.profile.stages.map((s) => {
            const span = schedule.stages[s.key];
            if (!span) return null;
            const past = today ? today > span.end : false;
            const future = today ? today < span.start : false;
            const risky = riskyStages.has(s.key);
            return (
              <div key={s.key} style={{ position: 'relative', height: 8, marginBottom: 3 }}>
                <i
                  style={{
                    position: 'absolute',
                    left: `${at(span.start.getTime())}%`,
                    width: `${at(span.end.getTime()) - at(span.start.getTime())}%`,
                    height: 5,
                    borderRadius: 3,
                    display: 'block',
                    background: past
                      ? 'var(--st-done)'
                      : future
                        ? 'var(--st-future)'
                        : risky
                          ? 'var(--st-risk)'
                          : 'var(--st-run)',
                  }}
                />
              </div>
            );
          })}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              color: 'var(--ink-4)',
              marginTop: 5,
            }}
          >
            <span>{shortDate(new Date(first))}</span>
            <span>Today</span>
            <span>{shortDate(new Date(last))}</span>
          </div>
        </div>
        <Link
          href={`/p/${project.id}/timeline`}
          style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, marginTop: 12, display: 'inline-block' }}
        >
          All {project.profile.stages.length} stages →
        </Link>
      </div>

      <div className="prev-sec" style={{ borderTop: '1px solid var(--line)', borderBottom: 'none' }}>
        {confirming ? (
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-2)', flexGrow: 1 }}>
              Delete {project.name} and everything in it?
            </span>
            <button
              className="btn sm dng"
              type="button"
              data-confirm-del
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await deleteProject(project.id);
                  setConfirming(false);
                  router.refresh();
                })
              }
            >
              {pending ? 'Deleting…' : 'Delete'}
            </button>
            <button className="btn sm" type="button" data-cancel-del onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button
            className="btn sm"
            type="button"
            data-del-project={project.id}
            onClick={() => setConfirming(true)}
          >
            Delete program
          </button>
        )}
      </div>
    </aside>
  );
}

/** MM/DD/YY — the form the prototype uses at the ends of a date axis. */
const shortDate = (d: Date) => `${fmtDate(d).slice(0, 6)}${String(d.getFullYear()).slice(2)}`;

function PeekLine({ dot, label, n, tone }: { dot: string; label: string; n: number; tone: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
      <span className="dot" style={{ background: dot }} />
      <span style={{ flexGrow: 1, fontSize: 13 }}>{label}</span>
      <span className="num" style={{ fontSize: 13, fontWeight: 600, color: tone }}>
        {n}
      </span>
    </div>
  );
}

/**
 * The value the template picker carries for "the built-in stages, but not all
 * of them". It is not a profile — the profile is made at Create, out of what
 * was ticked — so it needs a value no profile can have.
 */
const CUSTOM = 'custom:';

function NewProgramRow({
  profiles,
  onClose,
}: {
  profiles: readonly ProfileSummary[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [kickoff, setKickoff] = useState(toISO(new Date()));
  const [choice, setChoice] = useState(profiles[0]?.id ?? '');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const customising = choice.startsWith(CUSTOM);
  const baseId = customising ? choice.slice(CUSTOM.length) : choice;
  /* Which stages a customised program runs. Everything, until somebody says
     otherwise — a program that starts with nothing ticked would make the reader
     build it from scratch to answer a question they did not ask. */
  const [keep, setKeep] = useState<Set<string>>(
    () => new Set(BUILTIN_PROFILE.stages.map((s) => s.key)),
  );
  const locked = requiredStages(BUILTIN_PROFILE.stages, stageMilestone);

  const submit = () => {
    if (!name.trim()) return setError('Give the program a name.');
    if (!kickoff) return setError('Pick an expected kickoff date.');
    if (customising && keep.size === 0) return setError('Pick at least one stage.');
    setError('');
    const id = `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 7)}`;
    start(async () => {
      try {
        await createProject({
          id,
          name: name.trim(),
          kickoff: fromISO(kickoff),
          profileId: baseId,
          stageKeys: customising ? [...keep] : undefined,
        });
        router.push(`/p/${id}/overview`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not create the program.');
      }
    });
  };

  return (
    <div
      className="trow"
      data-new-program-form
      style={{ gridTemplateColumns: '30px 1fr', minHeight: 52, gap: 11 }}
    >
      <span />
      <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="pf-name dateinp"
          autoFocus
          placeholder="Program name"
          aria-label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: 180 }}
        />
        <input
          className="pf-kickoff dateinp"
          type="date"
          aria-label="Kickoff"
          value={kickoff}
          onChange={(e) => setKickoff(e.target.value)}
        />
        <select
          className="pf-profile dateinp"
          aria-label="Template"
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
        >
          {profiles.map((p) => [
            <option key={p.id} value={p.id}>
              {p.label}
            </option>,
            /* Only the built-in profile can be customised: it is the one whose
               stages the app knows how to draw and write up. */
            p.builtin ? (
              <option key={`${CUSTOM}${p.id}`} value={`${CUSTOM}${p.id}`}>
                {p.label} (Customized)
              </option>
            ) : null,
          ])}
        </select>
        <button className="btn pri sm" type="button" data-create disabled={pending} onClick={submit}>
          {pending ? 'Creating…' : 'Create'}
        </button>
        <button className="btn sm" type="button" onClick={onClose}>
          Cancel
        </button>
        {error && (
          <span className="err" style={{ fontSize: 12, color: 'var(--risk)' }}>
            {error}
          </span>
        )}
        {customising && (
          <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            {keep.size} of {BUILTIN_PROFILE.stages.length} stages
          </span>
        )}
      </span>

      {customising && (
        <StagePicker
          keep={keep}
          locked={locked}
          onToggle={(key, on) =>
            setKeep((prev) => {
              const next = new Set(prev);
              if (on) next.add(key);
              else next.delete(key);
              return next;
            })
          }
          onAll={(on) =>
            setKeep(on ? new Set(BUILTIN_PROFILE.stages.map((s) => s.key)) : new Set(locked))
          }
        />
      )}
    </div>
  );
}

/**
 * Which of the template's stages the new program runs.
 *
 * Grouped by phase and ticked to start with, because the answer for most
 * programs is "all of them" and the ones being asked about are the handful a
 * particular chip does not do — no test chip, no package of its own, no EVB.
 *
 * The stages a milestone hangs off cannot be unticked. Tapeout, First Silicon
 * and Mass Production are what the whole schedule counts down to, and a program
 * that dropped the stage carrying one would have nothing to count down to.
 */
function StagePicker({
  keep,
  locked,
  onToggle,
  onAll,
}: {
  keep: ReadonlySet<string>;
  locked: ReadonlySet<string>;
  onToggle: (key: string, on: boolean) => void;
  onAll: (on: boolean) => void;
}) {
  const all = keep.size === BUILTIN_PROFILE.stages.length;
  return (
    <div className="stagepick" data-stage-picker>
      <div className="stagepick-hd">
        <span className="cap">Stages this program runs</span>
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" data-pick-all onClick={() => onAll(!all)}>
          {all ? 'Clear optional' : 'Select all'}
        </button>
      </div>

      {lifecyclePhases.map(({ id, label }) => {
        const mine = BUILTIN_PROFILE.stages.filter((s) => s.phaseId === id);
        if (!mine.length) return null;
        return (
          <div key={id}>
            <div className="groupbar" style={{ cursor: 'default' }}>
              <b>{label}</b>
              <span className="pill" style={{ fontSize: 10.5 }}>
                {mine.filter((s) => keep.has(s.key)).length}/{mine.length}
              </span>
            </div>
            {mine.map((st) => {
              const on = keep.has(st.key);
              const fixed = locked.has(st.key);
              return (
                <button
                  type="button"
                  key={st.key}
                  className="stagepick-row"
                  role="checkbox"
                  aria-checked={on}
                  aria-disabled={fixed || undefined}
                  data-pick={st.key}
                  data-on={on ? '' : undefined}
                  title={fixed ? `${st.title} carries a checkpoint and has to stay` : undefined}
                  onClick={() => !fixed && onToggle(st.key, !on)}
                >
                  {/* the whole row is the control, so the box is only the
                      drawing of it and takes no click of its own */}
                  <span className={on ? 'cb on' : 'cb'} aria-hidden="true">
                    {on && <IconTick />}
                  </span>
                  <span className="pill" style={{ fontSize: 10.5, width: 46, textAlign: 'center' }}>
                    {st.shortTitle}
                  </span>
                  <span
                    className="ell"
                    style={{ fontSize: 13, color: on ? undefined : 'var(--ink-4)' }}
                  >
                    {st.title}
                  </span>
                  {/* what closing this stage marks. The three the countdowns
                      read are locked on; the rest leave with their stage. */}
                  {stageMilestone[st.key] && (
                    <span className={fixed ? 'pill acc' : 'pill'} style={{ fontSize: 10 }}>
                      {stageMilestone[st.key].label}
                    </span>
                  )}
                  <span style={{ flexGrow: 1 }} />
                  <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
                    {st.durationWeeks}w
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
