'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { renameProject, saveProjectActivities, saveProjectStages, setKickoff } from '@/app/actions';
import { ALL_ACTIVITIES as activityLibrary } from '@/data/builtins';
import { BUILTIN_STAGE_LIBRARY } from '@/data/builtins';
import { lifecyclePhases, stageMilestone } from '@/data/scheduleProfiles';
import type { ProfileStageDef } from '@/data/types';
import {
  addBuiltinStage,
  addStage,
  addableStages,
  assertPrefixes,
  duplicatePrefixes,
  moveStage,
  normalizePrefix,
  prefixCharsOk,
  removeStage,
  retimeStageByDate,
  setStagePrefix,
  stageWindow,
} from '@/lib/profileEdit';
import { fromISO, toISO } from '@/lib/schedule';
import { uid } from '@/store/useAppStore';
import { ctVar, CTHead, type Col } from './ctable';
import { IconPlus } from './icons';

/**
 * Editing a program after it exists: its name, the day it starts from, and the
 * plan it runs.
 *
 * The plan is the program's own — a copy taken from a template at creation —
 * so everything here lands on this program and on nothing else. Editing a
 * program still sharing a profile (the built-in one) forks it first, which the
 * server does.
 *
 * Nothing reschedules itself. Adding a stage puts it after the one above it
 * and leaves every other date alone; removing one leaves the gap where its
 * window was; the dates are typed. That is the same rule the template editor
 * follows, and the reason the dates are fields rather than a drag.
 */
const STAGE_COLS: Col[] = [
  ['title', null, 'STAGE'],
  ['prefix', 84, 'PREFIX'],
  ['phase', 132, 'BAND'],
  ['start', 122, 'STARTS'],
  ['end', 122, 'ENDS'],
  ['tat', 62, 'TAT (W)'],
  ['acts', 250, ''],
];

const ACT_COLS: Col[] = [
  ['ref', 92, 'REF'],
  ['title', null, 'ACTIVITY'],
  ['from', 74, 'FROM (W)'],
  ['to', 74, 'TO (W)'],
  ['acts', 210, ''],
];

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

interface StageUsage {
  items: number;
  deliverables: number;
  notes: number;
  people: number;
  details: number;
}

interface EditActivity {
  ref: string;
  title: string;
  windowFrom: number;
  windowTo: number;
  baseRef: string | null;
  steps: { n: number; text: string; tat: number; lane: string }[];
}

/** What a stage would take with it, in the words the confirmation uses. */
const holdings = (u: StageUsage | undefined): string[] => {
  if (!u) return [];
  const say = (n: number, one: string) => (n ? `${n} ${one}${n === 1 ? '' : 's'}` : '');
  return [
    say(u.deliverables, 'deliverable'),
    say(u.items, 'board item'),
    say(u.notes, 'note'),
    say(u.people, 'person'),
  ].filter(Boolean);
};

export function EditProgramDialog({
  projectId,
  profileId,
  name: current,
  kickoff: kickoffAt,
  onClose,
  onSaved,
}: {
  projectId: string;
  profileId: string;
  name: string;
  kickoff: Date;
  onClose: () => void;
  onSaved: () => void;
}) {
  const box = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(current);
  const [kickoff, setKickoffDate] = useState<Date>(kickoffAt);
  const [stages, setStages] = useState<ProfileStageDef[] | null>(null);
  const [usage, setUsage] = useState<Record<string, StageUsage>>({});
  const [removing, setRemoving] = useState<string | null>(null);
  const [acts, setActs] = useState<{ stageKey: string; shortTitle: string } | null>(null);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);

  /* Escape and the backdrop close it; the browser handles the focus trap. */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', cancel);
    return () => el.removeEventListener('cancel', cancel);
  }, [onClose]);

  /* Read on opening, so the dialog shows what is stored rather than whatever
     the list was rendered with. */
  useEffect(() => {
    let live = true;
    fetch(`/api/profiles/${profileId}/stages`)
      .then((r) => r.json())
      .then((rows: ProfileStageDef[]) => live && setStages(rows))
      .catch((e) => live && setErr(message(e)));
    fetch(`/api/projects/${projectId}/stage-usage`)
      .then((r) => r.json())
      .then((got: Record<string, StageUsage>) => live && setUsage(got))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [profileId, projectId]);

  let prefixErr = '';
  if (stages) {
    try {
      assertPrefixes(stages);
    } catch (e) {
      prefixErr = message(e);
    }
  }
  const clashing = new Set(stages ? duplicatePrefixes(stages) : []);

  const edit = (fn: (s: readonly ProfileStageDef[]) => ProfileStageDef[]) => {
    setErr('');
    setStages((cur) => {
      if (!cur) return cur;
      try {
        return fn(cur);
      } catch (e) {
        setErr(message(e));
        return cur;
      }
    });
  };

  const submit = async () => {
    if (!stages) return;
    if (!name.trim()) return setErr('Give the program a name.');
    if (prefixErr) return setErr(prefixErr);
    setErr('');
    setPending(true);
    try {
      if (name.trim() !== current) await renameProject(projectId, name.trim());
      if (kickoff.getTime() !== kickoffAt.getTime()) await setKickoff(projectId, kickoff);
      await saveProjectStages({
        projectId,
        newProfileId: uid(),
        stages: stages.map((st) => ({
          key: st.key,
          title: st.title,
          shortTitle: st.shortTitle,
          phaseId: st.phaseId,
          baseKey: st.baseKey,
          startOffsetWeeks: st.startOffsetWeeks,
          durationWeeks: st.durationWeeks,
        })),
      });
      onSaved();
    } catch (e) {
      setErr(message(e));
      setPending(false);
    }
  };

  const gone = removing ? stages?.find((s) => s.key === removing) : null;
  /* The stages the app ships that this programme does not run. */
  const canAdd = addableStages(stages ?? [], BUILTIN_STAGE_LIBRARY);

  return (
    <dialog
      className="dlg"
      style={{ width: 'min(1160px, calc(100vw - 32px))' }}
      ref={box}
      data-edit-program-dialog
      aria-label={`Edit ${current}`}
    >
      <div className="dlg-hd">
        <span className="mark">{current.slice(0, 1).toUpperCase()}</span>
        <b style={{ fontSize: 14.5 }}>Edit program</b>
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="dlg-body">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 6 }}>
          <label className="dlg-field" style={{ flexGrow: 1, minWidth: 260 }}>
            <span className="dlg-label">Program name</span>
            <input
              className="ep-name lnkin"
              aria-label="Program name"
              autoComplete="off"
              value={name}
              onChange={(e) => {
                setErr('');
                setName(e.target.value);
              }}
            />
            <span className="dlg-hint">What this chip is called inside the company.</span>
          </label>
          <label className="dlg-field" style={{ width: 220 }}>
            <span className="dlg-label">Kickoff</span>
            <input
              className="ep-kickoff lnkin num"
              type="date"
              aria-label="Kickoff"
              value={toISO(kickoff)}
              onChange={(e) => {
                const d = fromISO(e.target.value);
                if (!Number.isNaN(d.getTime())) setKickoffDate(d);
              }}
            />
            <span className="dlg-hint">
              Week zero. Every stage keeps its weeks, so moving this moves the whole plan with it.
            </span>
          </label>
        </div>

        {gone && (
          <div className="delconf" style={{ marginBottom: 10 }} data-stage-usage>
            <span style={{ flexGrow: 1 }}>
              Remove {gone.title}
              {holdings(usage[gone.key]).length
                ? ` and the ${holdings(usage[gone.key]).join(', ')} on it?`
                : '? Nothing is recorded on it yet.'}
            </span>
            <button type="button" className="btn sm" onClick={() => setRemoving(null)}>
              Keep
            </button>
            <button
              type="button"
              className="btn sm dng"
              data-confirm-del-stage
              onClick={() => {
                edit((cur) => removeStage(cur, gone.key));
                setRemoving(null);
              }}
            >
              Remove
            </button>
          </div>
        )}

        {!stages ? (
          <p className="mono-note">Reading the program…</p>
        ) : (
          <div className="ctable" style={{ ['--ct' as string]: ctVar(STAGE_COLS) }}>
            <CTHead cols={STAGE_COLS} />
            {stages.map((st, i) => (
              <div className="trow" key={st.key} data-stage-row={st.key}>
                <input
                  className="lnkin"
                  data-stage-title
                  aria-label={`Title of ${st.title}`}
                  value={st.title}
                  onChange={(e) =>
                    edit((cur) => cur.map((x) => (x.key === st.key ? { ...x, title: e.target.value } : x)))
                  }
                />
                <input
                  className="lnkin"
                  data-stage-prefix
                  aria-label={`Prefix of ${st.title}`}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={6}
                  value={st.shortTitle}
                  onChange={(e) => {
                    const composing = (e.nativeEvent as InputEvent).isComposing === true;
                    edit((cur) => setStagePrefix(cur, st.key, e.target.value, composing));
                  }}
                  style={
                    !prefixCharsOk(st.shortTitle) || clashing.has(normalizePrefix(st.shortTitle))
                      ? { color: 'var(--risk)', borderColor: 'var(--risk)' }
                      : undefined
                  }
                />
                <select
                  className="lnkin"
                  data-stage-phase
                  aria-label={`Band of ${st.title}`}
                  value={st.phaseId}
                  onChange={(e) =>
                    edit((cur) => cur.map((x) => (x.key === st.key ? { ...x, phaseId: e.target.value } : x)))
                  }
                >
                  {lifecyclePhases.map((ph) => (
                    <option key={ph.id} value={ph.id}>
                      {ph.label}
                    </option>
                  ))}
                </select>
                {/* Dates out, weeks in: what is stored is still the offset and
                    the duration, and only this stage's. */}
                <input
                  className="lnkin num"
                  type="date"
                  aria-label={`${st.title} starts`}
                  data-stage-start
                  value={toISO(stageWindow(kickoff, st).start)}
                  onChange={(e) =>
                    edit((cur) => retimeStageByDate(cur, st.key, kickoff, { start: fromISO(e.target.value) }))
                  }
                />
                <input
                  className="lnkin num"
                  type="date"
                  aria-label={`${st.title} ends`}
                  data-stage-end
                  value={toISO(stageWindow(kickoff, st).end)}
                  onChange={(e) =>
                    edit((cur) => retimeStageByDate(cur, st.key, kickoff, { end: fromISO(e.target.value) }))
                  }
                />
                <input
                  className="lnkin num"
                  type="number"
                  min={1}
                  step={1}
                  aria-label={`${st.title} TAT in weeks`}
                  data-stage-tat
                  value={st.durationWeeks}
                  onChange={(e) =>
                    edit((cur) =>
                      retimeStageByDate(cur, st.key, kickoff, { durationWeeks: Number(e.target.value) }),
                    )
                  }
                />
                <span style={{ display: 'flex', gap: 5, justifySelf: 'end' }}>
                  <button
                    type="button"
                    className="btn sm"
                    data-edit-activities
                    onClick={() => setActs({ stageKey: st.key, shortTitle: st.shortTitle })}
                  >
                    Activities
                  </button>
                  <button
                    type="button"
                    className="btn sm"
                    data-move-up
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => edit((cur) => moveStage(cur, st.key, i - 1))}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn sm"
                    data-move-down
                    aria-label="Move down"
                    disabled={i === stages.length - 1}
                    onClick={() => edit((cur) => moveStage(cur, st.key, i + 1))}
                  >
                    ↓
                  </button>
                  {/* A stage carrying a checkpoint cannot leave without taking
                      Tapeout, First Silicon or Production with it — the server
                      refuses it, so the button says so rather than letting the
                      row vanish and the save fail. */}
                  <button
                    type="button"
                    className="btn sm dng"
                    data-del-stage
                    onClick={() => {
                      const ms = stageMilestone[st.baseKey ?? st.key];
                      if (ms) {
                        setRemoving(null);
                        setErr(`${st.title} carries the ${ms.label} checkpoint and cannot be removed.`);
                        return;
                      }
                      setErr('');
                      setRemoving(st.key);
                    }}
                  >
                    Remove
                  </button>
                </span>
              </div>
            ))}
            <div className="trow">
              <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn sm"
                  data-add-stage
                  onClick={() => edit((cur) => addStage(cur, cur.length))}
                >
                  <IconPlus />
                  New stage
                </button>
                {/* and the ones the app ships: a stage removed by mistake comes
                    back with its content, activities, deliverables and dates */}
                <select
                  className="lnkin"
                  data-add-builtin
                  aria-label="Add a stage the app ships"
                  value=""
                  disabled={!canAdd.length}
                  onChange={(e) => {
                    const pick = canAdd.find((x) => x.key === e.target.value);
                    if (pick) edit((cur) => addBuiltinStage(cur, pick));
                  }}
                >
                  <option value="">
                    {canAdd.length ? 'Add an existing stage…' : 'Every stage is already here'}
                  </option>
                  {canAdd.map((x) => (
                    <option key={x.key} value={x.key}>
                      {x.shortTitle} · {x.title}
                    </option>
                  ))}
                </select>
              </span>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <div className="dlg-foot">
        {(err || prefixErr) && (
          <span className="err" style={{ fontSize: 12, color: 'var(--risk)' }}>
            {err || prefixErr}
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn pri sm"
          data-save-program
          disabled={pending || !stages}
          onClick={submit}
        >
          {pending ? 'Saving…' : 'Save program'}
        </button>
      </div>

      {acts && (
        <ProgramActivityDialog
          projectId={projectId}
          stageKey={acts.stageKey}
          shortTitle={acts.shortTitle}
          onClose={() => setActs(null)}
        />
      )}
    </dialog>
  );
}

/**
 * The activities inside one stage of one program, and the steps inside them.
 *
 * Saved on its own rather than with the stage list: an activity edit is a
 * write to the program's plan, and holding it until the stage form is
 * submitted would make Cancel mean two different things.
 */
function ProgramActivityDialog({
  projectId,
  stageKey,
  shortTitle,
  onClose,
}: {
  projectId: string;
  stageKey: string;
  shortTitle: string;
  onClose: () => void;
}) {
  const box = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState<EditActivity[] | null>(null);
  const [openSteps, setOpenSteps] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', cancel);
    return () => el.removeEventListener('cancel', cancel);
  }, [onClose]);

  useEffect(() => {
    let live = true;
    fetch(`/api/projects/${projectId}/activities?stage=${encodeURIComponent(stageKey)}`)
      .then((r) => r.json())
      .then((got: EditActivity[]) => live && setRows(got.map((a) => ({ ...a, steps: a.steps ?? [] }))))
      .catch((e) => live && setErr(message(e)));
    return () => {
      live = false;
    };
  }, [projectId, stageKey]);

  /* The next number this stage has never used. Reissuing a deleted one would
     point somebody's recorded work at different work. */
  const freshRef = (cur: EditActivity[]) => {
    const used = cur
      .map((a) => Number(a.ref.split('-').pop()))
      .filter((n) => Number.isFinite(n)) as number[];
    return `${shortTitle}-${String((used.length ? Math.max(...used) : 0) + 1).padStart(2, '0')}`;
  };

  /* Materialise: an activity whose steps are being edited stops inheriting and
     owns every one of them from here on. */
  const materialise = (a: EditActivity) =>
    a.baseRef
      ? {
          ...a,
          baseRef: null,
          steps: (activityLibrary[a.baseRef]?.s ?? []).map((s, i) => ({
            n: i + 1,
            text: String(s[1]),
            tat: Number(s[2]),
            lane: s[3] ? 'par' : 'main',
          })),
        }
      : a;

  const stepCount = (a: EditActivity) =>
    a.baseRef ? (activityLibrary[a.baseRef]?.s.length ?? 0) : a.steps.length;

  const edit = (fn: (cur: EditActivity[]) => EditActivity[]) => {
    setErr('');
    setRows((cur) => (cur ? fn(cur) : cur));
  };
  const patch = (ref: string, fn: (a: EditActivity) => EditActivity) =>
    edit((cur) => cur.map((x) => (x.ref === ref ? fn(x) : x)));

  const submit = async () => {
    if (!rows) return;
    setErr('');
    setPending(true);
    try {
      await saveProjectActivities({ projectId, newProfileId: uid(), stageKey, activities: rows });
      onClose();
    } catch (e) {
      setErr(message(e));
      setPending(false);
    }
  };

  return (
    <dialog
      className="dlg"
      style={{ width: 'min(1000px, calc(100vw - 32px))' }}
      ref={box}
      data-act-dialog
      aria-label={`Activities of ${shortTitle}`}
    >
      <div className="dlg-hd">
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{shortTitle} · activities</span>
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="dlg-body">
        {!rows ? (
          <p className="mono-note">Reading the stage…</p>
        ) : (
          <div className="ctable" style={{ ['--ct' as string]: ctVar(ACT_COLS) }}>
            <CTHead cols={ACT_COLS} />
            {rows.map((a) => (
              <Fragment key={a.ref}>
                <div className="trow" data-activity-row={a.ref}>
                  <span className="ref">{a.ref}</span>
                  <input
                    className="lnkin"
                    data-act-title
                    aria-label={`Title of ${a.ref}`}
                    value={a.title}
                    onChange={(e) => patch(a.ref, (x) => ({ ...x, title: e.target.value }))}
                  />
                  <input
                    className="lnkin num"
                    type="number"
                    min={0}
                    step={0.5}
                    data-act-from
                    aria-label={`${a.ref} starts in week`}
                    value={a.windowFrom}
                    onChange={(e) => patch(a.ref, (x) => ({ ...x, windowFrom: Number(e.target.value) }))}
                  />
                  <input
                    className="lnkin num"
                    type="number"
                    min={0}
                    step={0.5}
                    data-act-to
                    aria-label={`${a.ref} ends in week`}
                    value={a.windowTo}
                    onChange={(e) => patch(a.ref, (x) => ({ ...x, windowTo: Number(e.target.value) }))}
                  />
                  <span style={{ display: 'flex', gap: 5, justifySelf: 'end' }}>
                    <button
                      type="button"
                      className="btn sm"
                      data-edit-steps
                      onClick={() => {
                        patch(a.ref, materialise);
                        setOpenSteps(openSteps === a.ref ? null : a.ref);
                      }}
                    >
                      {openSteps === a.ref ? 'Hide steps' : `Steps (${stepCount(a)})`}
                    </button>
                    <button
                      type="button"
                      className="btn sm dng"
                      data-del-activity
                      onClick={() => edit((cur) => cur.filter((x) => x.ref !== a.ref))}
                    >
                      Remove
                    </button>
                  </span>
                </div>
                {openSteps === a.ref && (
                  <div className="entrysteps">
                    {a.steps.map((st, i) => (
                      <div className="steprow-edit" key={st.n} data-step-row={String(st.n)}>
                        <span className="num" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                          {i + 1}
                        </span>
                        <input
                          className="lnkin"
                          data-step-text
                          aria-label={`Step ${i + 1} of ${a.ref}`}
                          value={st.text}
                          onChange={(e) =>
                            patch(a.ref, (x) => ({
                              ...x,
                              steps: x.steps.map((y) => (y.n === st.n ? { ...y, text: e.target.value } : y)),
                            }))
                          }
                        />
                        <input
                          className="lnkin num"
                          type="number"
                          min={0}
                          step={0.5}
                          data-step-tat
                          aria-label={`TAT of step ${i + 1}`}
                          value={st.tat}
                          onChange={(e) =>
                            patch(a.ref, (x) => ({
                              ...x,
                              steps: x.steps.map((y) =>
                                y.n === st.n ? { ...y, tat: Number(e.target.value) } : y,
                              ),
                            }))
                          }
                        />
                        <select
                          className="lnkin"
                          data-step-lane
                          aria-label={`When step ${i + 1} runs`}
                          value={st.lane}
                          onChange={(e) =>
                            patch(a.ref, (x) => ({
                              ...x,
                              steps: x.steps.map((y) =>
                                y.n === st.n ? { ...y, lane: e.target.value } : y,
                              ),
                            }))
                          }
                        >
                          <option value="main">after the last</option>
                          <option value="par">alongside it</option>
                        </select>
                        <button
                          type="button"
                          className="btn sm dng"
                          data-del-step
                          onClick={() =>
                            patch(a.ref, (x) => ({ ...x, steps: x.steps.filter((y) => y.n !== st.n) }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="steprow-edit">
                      <span />
                      <button
                        type="button"
                        className="btn sm"
                        data-add-step
                        onClick={() =>
                          patch(a.ref, (x) => ({
                            ...x,
                            steps: [
                              ...x.steps,
                              { n: (x.steps.at(-1)?.n ?? 0) + 1, text: 'New step', tat: 1, lane: 'main' },
                            ],
                          }))
                        }
                      >
                        <IconPlus />
                        Add a step
                      </button>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
            <div className="trow">
              <button
                type="button"
                className="btn sm"
                data-add-activity
                onClick={() =>
                  edit((cur) => [
                    ...cur,
                    {
                      ref: freshRef(cur),
                      title: 'New activity',
                      windowFrom: 0,
                      windowTo: 2,
                      baseRef: null,
                      steps: [{ n: 1, text: 'New step', tat: 1, lane: 'main' }],
                    },
                  ])
                }
              >
                <IconPlus />
                Add an activity
              </button>
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>
      <div className="dlg-foot">
        {err && (
          <span className="err" style={{ fontSize: 12, color: 'var(--risk)' }}>
            {err}
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn pri sm"
          data-save-activities
          disabled={pending || !rows}
          onClick={submit}
        >
          {pending ? 'Saving…' : 'Save activities'}
        </button>
      </div>
    </dialog>
  );
}
