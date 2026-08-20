'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { saveProjectStages } from '@/app/actions';
import { lifecyclePhases, stageMilestone } from '@/data/scheduleProfiles';
import type { ProfileSummary } from '@/data/types';
import { defaultShortTitle, forkName } from '@/lib/stages';
import { useAppStore } from '@/store/useAppStore';

interface Row {
  key: string;
  title: string;
  shortTitle: string;
  phaseId: string;
  baseKey: string | null;
  /** Weeks, held as text so a half-typed number does not snap back. */
  start: string;
  duration: string;
}

const newKey = () =>
  'stg_' +
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 8)
    : Math.random().toString(36).slice(2, 10));

/**
 * The stages a program runs on.
 *
 * A profile is a list of stages, so this edits the profile — and because a
 * built-in or shared profile belongs to more than this program, saving forks a
 * named copy and moves only this program to it. A profile this program is the
 * only user of is edited in place, which is also where renaming happens.
 *
 * Stage keys never change, so the boards, deliverables, contacts and leader of
 * a stage travel with it through a fork. Deleting a stage takes its content
 * with it, and the counts are on the confirm.
 */
export function StageEditor({
  profiles,
  onClose,
}: {
  profiles: readonly ProfileSummary[];
  onClose: () => void;
}) {
  const router = useRouter();
  const projectId = useAppStore((s) => s.projectId);
  const profile = useAppStore((s) => s.profile);
  const stages = useAppStore((s) => s.stages);
  const content = useAppStore((s) => s.content);
  const deliverables = useAppStore((s) => s.deliverables);
  const contacts = useAppStore((s) => s.contacts);

  const mine = profiles.find((p) => p.id === profile.id);
  /* Editing in place is only safe when nothing else runs on this profile. */
  const forks = profile.builtin || (mine ? mine.projectCount > 1 : true);

  const [rows, setRows] = useState<Row[]>(() =>
    stages.map((s) => ({
      key: s.id,
      title: s.title,
      shortTitle: s.shortTitle,
      phaseId: s.phaseId,
      baseKey: s.vizKey,
      start: String(s.baseline.startOffsetWeeks),
      duration: String(s.baseline.durationWeeks),
    })),
  );
  const [name, setName] = useState(() =>
    forks ? forkName(profile.label, profiles.map((p) => p.label)) : profile.label,
  );
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const patch = (key: string, field: keyof Row, value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const move = (i: number, by: number) =>
    setRows((rs) => {
      const j = i + by;
      if (j < 0 || j >= rs.length) return rs;
      const next = [...rs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const addStage = () => {
    const last = rows[rows.length - 1];
    const after = last ? Number(last.start) + Number(last.duration) : 0;
    setRows((rs) => [
      ...rs,
      {
        key: newKey(),
        title: '',
        shortTitle: '',
        phaseId: lifecyclePhases[lifecyclePhases.length - 1].id,
        baseKey: null,
        start: String(Number.isFinite(after) ? after : 0),
        duration: '4',
      },
    ]);
  };

  /** What a stage would take with it — shown on the delete confirm. */
  const weight = (key: string) => {
    const c = content[key];
    return {
      items: c ? c.keyinfo.length + c.activities.length + c.risks.length : 0,
      deliverables: deliverables[key]?.length ?? 0,
      contacts: contacts[key]?.length ?? 0,
    };
  };

  const save = () => {
    const parsed = rows.map((r) => ({
      key: r.key,
      title: r.title.trim(),
      shortTitle: r.shortTitle.trim() || defaultShortTitle(r.title),
      phaseId: r.phaseId,
      baseKey: r.baseKey,
      startOffsetWeeks: Number(r.start),
      durationWeeks: Number(r.duration),
    }));
    const bad = parsed.find(
      (p) =>
        !p.title ||
        !Number.isFinite(p.startOffsetWeeks) ||
        !Number.isFinite(p.durationWeeks) ||
        p.startOffsetWeeks < 0 ||
        p.durationWeeks < 1 / 7,
    );
    if (bad) {
      setError(
        bad.title
          ? `${bad.title} needs a start of 0 weeks or more and a duration of at least a day.`
          : 'Every stage needs a title.',
      );
      return;
    }
    if (!name.trim()) {
      setError('Give the profile a name.');
      return;
    }
    setError('');
    start(async () => {
      try {
        await saveProjectStages({
          projectId,
          newProfileId: 'prof_' + newKey().slice(4),
          profileName: name,
          stages: parsed,
        });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save the stages.');
      }
    });
  };

  return (
    <div id="stage-editor" role="dialog" aria-modal="true" aria-labelledby="se-title">
      <div id="se-scrim" onClick={onClose} />
      <div className="se-win">
        <div className="se-head">
          <h3 id="se-title">Stages</h3>
          <span className="meta">{profile.label}</span>
          <span className="spacer" />
          <button id="se-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="se-body">
          <label className="se-name">
            <span className="k">Profile name</span>
            <input
              className="se-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Typical SoC (copy)"
            />
          </label>
          <p className="se-note" data-forks={forks ? 'yes' : 'no'}>
            {forks
              ? `Saving writes a new profile and moves ${'this program'} to it. Programs on ${profile.label} keep the schedule they have.`
              : 'This profile is used by this program alone, so saving edits it in place.'}
          </p>

          <div className="se-cols">
            <span>Order</span>
            <span>Stage</span>
            <span>Legend</span>
            <span>Band</span>
            <span>Start (w)</span>
            <span>Length (w)</span>
            <span />
          </div>

          <ul className="se-list">
            {rows.map((r, i) => {
              const ms = stageMilestone[r.key];
              const w = weight(r.key);
              const holds = w.items + w.deliverables + w.contacts;
              return (
                <li className="se-row" key={r.key} data-stage={r.key}>
                  <span className="se-move">
                    <button
                      data-up
                      disabled={i === 0}
                      aria-label={`Move ${r.title} up`}
                      onClick={() => move(i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      data-down
                      disabled={i === rows.length - 1}
                      aria-label={`Move ${r.title} down`}
                      onClick={() => move(i, 1)}
                    >
                      ↓
                    </button>
                  </span>
                  <input
                    className="se-title-input"
                    value={r.title}
                    placeholder="Stage name"
                    onChange={(e) => patch(r.key, 'title', e.target.value)}
                  />
                  <input
                    className="se-short"
                    value={r.shortTitle}
                    placeholder={defaultShortTitle(r.title)}
                    onChange={(e) => patch(r.key, 'shortTitle', e.target.value)}
                  />
                  <select
                    className="se-band"
                    value={r.phaseId}
                    onChange={(e) => patch(r.key, 'phaseId', e.target.value)}
                  >
                    {lifecyclePhases.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className="se-start"
                    type="number"
                    min={0}
                    step={1}
                    value={r.start}
                    onChange={(e) => patch(r.key, 'start', e.target.value)}
                  />
                  <input
                    className="se-dur"
                    type="number"
                    min={0.5}
                    step={1}
                    value={r.duration}
                    onChange={(e) => patch(r.key, 'duration', e.target.value)}
                  />
                  <span className="se-del">
                    <button
                      data-del-stage
                      disabled={!!ms || rows.length === 1}
                      title={
                        ms
                          ? `${r.title} carries the ${ms.label} milestone`
                          : rows.length === 1
                            ? 'A program needs at least one stage'
                            : `Remove ${r.title}`
                      }
                      onClick={() =>
                        holds
                          ? setConfirming(r.key)
                          : setRows((rs) => rs.filter((x) => x.key !== r.key))
                      }
                    >
                      ✕
                    </button>
                  </span>

                  {confirming === r.key && (
                    <div className="se-confirm">
                      <span>
                        Remove {r.title}? {w.items} board {w.items === 1 ? 'entry' : 'entries'},{' '}
                        {w.deliverables} deliverable{w.deliverables === 1 ? '' : 's'} and{' '}
                        {w.contacts} contact{w.contacts === 1 ? '' : 's'} go with it.
                      </span>
                      <button
                        data-confirm-del
                        onClick={() => {
                          setRows((rs) => rs.filter((x) => x.key !== r.key));
                          setConfirming(null);
                        }}
                      >
                        Remove
                      </button>
                      <button data-cancel-del onClick={() => setConfirming(null)}>
                        Keep
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <button className="se-add" data-add-stage onClick={addStage}>
            + Add stage
          </button>
        </div>

        <div className="se-foot">
          {error && <p className="err" data-se-error>{error}</p>}
          <span className="spacer" />
          <button data-save-stages disabled={pending} onClick={save}>
            {pending ? 'Saving…' : forks ? 'Save as new profile' : 'Save'}
          </button>
          <button data-cancel-stages onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
