'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore, useTransition } from 'react';
import { createProject, deleteProject } from '@/app/actions';
import type { ProfileSummary, StageId } from '@/data/types';
import { daysTo, dday, inFlightStageIds } from '@/lib/derive';
import { estimateCost, formatCost, formatManMonths } from '@/lib/effort';
import type { ProjectSummary } from '@/lib/queries';
import { computeSchedule, fmtDate, fromISO, startOfDay, toISO } from '@/lib/schedule';
import { resolveStages } from '@/lib/stages';

/**
 * Anything that needs "today" waits for mount: the server has no business
 * deciding the viewer's date, and rendering it twice would not match. The rest
 * of the card — names, dates, progress — is server-rendered immediately.
 */
const neverChanges = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    neverChanges,
    () => true, // client
    () => false, // server render and the hydration pass
  );
}

/** A readable, collision-safe URL: "atlas-ax2-7f3k9q". */
const makeId = (name: string) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
  const suffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 6)
      : Math.random().toString(36).slice(2, 8);
  return `${slug || 'program'}-${suffix}`;
};

function ProjectCard({ p }: { p: ProjectSummary }) {
  const router = useRouter();
  const mounted = useMounted();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  /* a card reads the program's own profile — stage names and all */
  const stages = resolveStages(p.profile);
  const titleOf = (id: StageId) =>
    stages.find((st) => st.id === id) ?? { title: id, shortTitle: id };
  const schedule = computeSchedule(p.kickoff, p.profile, p.overrides);
  const pct = p.deliverablesTotal
    ? Math.round((p.deliverablesDone / p.deliverablesTotal) * 100)
    : 0;

  const today = mounted ? startOfDay(new Date()) : null;
  const overdue = today ? p.openActivityDues.filter((d) => d < today).length : 0;
  /* Stages are concurrent, so a dozen can be in flight at once. The card names
     the one the program opens on — the lowest bar of them, same rule as the
     store's — rather than the first, which named a stage you never landed on. */
  const inFlight = today ? inFlightStageIds(schedule, today) : [];
  const openStage = inFlight.length ? inFlight[inFlight.length - 1] : null;
  const done = today ? daysTo(schedule.production, today) < 0 : false;

  return (
    <div className="pl-card">
      <Link className="pl-open" href={`/p/${p.id}`} aria-label={`Open ${p.name}`} />

      <div className="pl-title">
        <span className="pl-name">{p.name}</span>
        {p.edited && <span className="pl-flag" title="Schedule has manual date edits">EDITED</span>}
      </div>
      <span className="cap pl-profile">{p.profile.label}</span>

      <div className="pl-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="pl-pct">
        <span className="n">{pct}%</span>
        <span>
          {p.deliverablesDone} / {p.deliverablesTotal} deliverables
        </span>
      </div>

      {/* clock-dependent, so it fills in after mount */}
      <span
        className={`pl-stage${inFlight.length && p.openRisks ? ' risky' : ''}${
          mounted && !inFlight.length ? ' idle' : ''
        }`}
      >
        {!mounted
          ? ' '
          : inFlight.length
            ? `${titleOf(openStage!).shortTitle} · ${titleOf(openStage!).title}`
            : done
              ? 'Complete'
              : 'Not started'}
      </span>

      <div className="pl-facts">
        <div className="pl-fact">
          <span className="k">Kickoff</span>
          <span className="v">{fmtDate(p.kickoff)}</span>
        </div>
        <div className="pl-fact">
          <span className="k">Tapeout</span>
          <span className="v">
            {fmtDate(schedule.tapeout)}
            {today && <span className="muted"> · {dday(schedule.tapeout, today)}</span>}
          </span>
        </div>
        <div className="pl-fact">
          <span className="k">Open Risks</span>
          <span className={`v${p.openRisks ? ' alert' : ' muted'}`}>{p.openRisks}</span>
        </div>
        <div className="pl-fact">
          <span className="k">Overdue</span>
          <span className={`v${overdue ? ' alert' : ' muted'}`}>{mounted ? overdue : '—'}</span>
        </div>
        <div className="pl-fact">
          <span className="k">Effort</span>
          <span className={`v${p.manMonths ? '' : ' muted'}`} data-card-mm>
            {p.manMonths ? formatManMonths(p.manMonths) : '—'}
          </span>
        </div>
        <div className="pl-fact">
          <span className="k">Est. Cost</span>
          <span
            className={`v${p.manMonths && p.costPerManMonth ? '' : ' muted'}`}
            data-card-cost
            title={
              p.costPerManMonth
                ? `${formatManMonths(p.manMonths)} × ${formatCost(p.costPerManMonth, p.currency)} per man-month`
                : 'Set a cost per man-month on the program dashboard'
            }
          >
            {p.manMonths && p.costPerManMonth
              ? formatCost(estimateCost(p.manMonths, p.costPerManMonth), p.currency)
              : '—'}
          </span>
        </div>
      </div>

      {confirming ? (
        <div className="pl-confirm">
          <span>Delete {p.name}?</span>
          <span className="spacer" />
          <span className="pl-acts" style={{ margin: 0 }}>
            <button
              data-confirm-del
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await deleteProject(p.id);
                  setConfirming(false);
                  router.refresh();
                })
              }
            >
              {pending ? 'Deleting…' : 'Delete'}
            </button>
            <button data-cancel-del onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </span>
        </div>
      ) : (
        <div className="pl-acts">
          <button data-del-project={p.id} onClick={() => setConfirming(true)}>
            ✕ Delete
          </button>
        </div>
      )}
    </div>
  );
}

function NewProjectCard({ profiles }: { profiles: readonly ProfileSummary[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [kickoff, setKickoff] = useState('');
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? '');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const begin = () => {
    setName('');
    /* default to today — read at click time, never during a render */
    setKickoff(toISO(startOfDay(new Date())));
    setProfileId(profiles[0]?.id ?? '');
    setError('');
    setOpen(true);
  };

  const submit = () => {
    if (!name.trim()) return setError('Give the program a name.');
    if (!kickoff) return setError('Pick an expected kickoff date.');
    setError('');
    const id = makeId(name);
    start(async () => {
      try {
        await createProject({ id, name: name.trim(), kickoff: fromISO(kickoff), profileId });
        setOpen(false);
        router.push(`/p/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not create the program.');
      }
    });
  };

  if (!open) {
    return (
      <div className="pl-card new">
        <button className="pl-new-btn" data-new-project onClick={begin}>
          <span className="plus">+</span>
          New Program
        </button>
      </div>
    );
  }

  return (
    <div className="pl-card new editing">
      <div className="pl-form">
        <label>
          <span className="k">Program name</span>
          <input
            className="pf-name"
            value={name}
            autoFocus
            placeholder="AtlasAX2"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </label>
        <label>
          <span className="k">Expected kickoff</span>
          <input
            className="pf-kickoff"
            type="date"
            value={kickoff}
            onChange={(e) => setKickoff(e.target.value)}
          />
        </label>
        <label>
          <span className="k">Schedule profile</span>
          <select
            className="pf-profile"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
          >
            {profiles.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
                {o.builtin ? '' : ` — ${o.stageCount} stages`}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="err">{error}</p>}
        <div className="row">
          <button data-create disabled={pending} onClick={submit}>
            {pending ? 'Creating…' : 'Create'}
          </button>
          <button data-cancel-create onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectList({
  projects,
  profiles,
}: {
  projects: ProjectSummary[];
  profiles: ProfileSummary[];
}) {
  return (
    <main id="program-list">
      <div className="pl-head">
        <h1>Programs</h1>
        <span className="count">
          {projects.length} program{projects.length === 1 ? '' : 's'}
        </span>
      </div>
      <p className="pl-sub">
        Milestones are derived from each program&rsquo;s kickoff and its schedule profile — no
        program stores a date it can compute.
      </p>
      <div className="pl-grid">
        {projects.map((p) => (
          <ProjectCard p={p} key={p.id} />
        ))}
        <NewProjectCard profiles={profiles} />
      </div>
    </main>
  );
}
