'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  deleteProfile,
  duplicateProfile,
  saveProfileStages,
  saveTemplateActivities,
} from '@/app/actions';
import { activitySteps as activityLibrary } from '@/data/activitySteps';
import { lifecyclePhases } from '@/data/scheduleProfiles';
import type { ProfileStageDef } from '@/data/types';
import { uid } from '@/store/useAppStore';
import {
  addStage,
  assertPrefixes,
  duplicatePrefixes,
  moveStage,
  normalizePrefix,
  removeStage,
  retimeStage,
  setStagePrefix,
} from '@/lib/profileEdit';
import { ctVar, CTHead, type Col } from './ctable';
import { IconPlus } from './icons';

/**
 * Templates: the stage lists a program can be started from.
 *
 * The built-in one offers Duplicate and nothing else. It is the baseline the
 * schedule was verified against, and a baseline that can be edited in place is
 * not one — so the read-only rule is visible here rather than only enforced on
 * the server once a write has already been attempted.
 */
export interface TemplateRow {
  id: string;
  label: string;
  builtin: boolean;
  stageCount: number;
  projectCount: number;
}

const COLS: Col[] = [
  ['name', null, 'TEMPLATE'],
  ['stages', 92, 'STAGES'],
  ['programs', 100, 'PROGRAMS'],
  ['acts', 260, ''],
];

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function TemplatesView({ profiles }: { profiles: TemplateRow[] }) {
  const router = useRouter();
  const [copying, setCopying] = useState<TemplateRow | null>(null);
  const [editing, setEditing] = useState<{ id: string; label: string } | null>(null);
  const [asking, setAsking] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const remove = async (id: string) => {
    setErr('');
    try {
      await deleteProfile(id);
      setAsking(null);
      router.refresh();
    } catch (e) {
      setErr(message(e));
    }
  };

  return (
    <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="filterbar">
        {/* The other half of the Templates button on the programs list: a screen
            you can reach and not leave is a screen people stop opening. */}
        <Link href="/" className="crumb" data-go-programs>
          ‹ Programs
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 640, margin: 0 }}>Templates</h1>
        <span style={{ flexGrow: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          The stage lists a program can be started from
        </span>
      </div>

      {err && (
        <span className="err" style={{ fontSize: 12.5, color: 'var(--risk)' }}>
          {err}
        </span>
      )}

      <div className="ctable" style={{ ['--ct' as string]: ctVar(COLS) }}>
        <CTHead cols={COLS} />
        {profiles.map((p) => (
          <div className="trow" key={p.id} data-template={p.id}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span className="wrapcell" style={{ fontWeight: 530 }}>
                {p.label}
              </span>
              {p.builtin && (
                <span className="pill" style={{ fontSize: 10.5 }}>
                  Built-in
                </span>
              )}
            </span>
            <span className="num">{p.stageCount}</span>
            <span className="num">{p.projectCount || '—'}</span>
            <span style={{ display: 'flex', gap: 7, justifySelf: 'end' }}>
              <button
                type="button"
                className="btn sm"
                data-duplicate
                onClick={() => {
                  setErr('');
                  setCopying(p);
                }}
              >
                Duplicate
              </button>
              {!p.builtin && (
                <button
                  type="button"
                  className="btn sm"
                  data-edit-template
                  onClick={() => {
                    setErr('');
                    setEditing({ id: p.id, label: p.label });
                  }}
                >
                  Edit
                </button>
              )}
              {!p.builtin &&
                (asking === p.id ? (
                  <>
                    <button type="button" className="btn sm" onClick={() => setAsking(null)}>
                      Keep
                    </button>
                    <button
                      type="button"
                      className="btn sm dng"
                      data-tpl-delete
                      onClick={() => remove(p.id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn sm dng"
                    data-tpl-ask
                    onClick={() => setAsking(p.id)}
                  >
                    Delete
                  </button>
                ))}
            </span>
          </div>
        ))}
      </div>

      {copying && (
        <NameDialog
          source={copying}
          onClose={() => setCopying(null)}
          onDone={() => {
            setCopying(null);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <StageDialog
          profileId={editing.id}
          label={editing.label}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/** Escape and the backdrop close it; the browser handles the focus trap. */
function useModal(box: React.RefObject<HTMLDialogElement | null>, onClose: () => void) {
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
  }, [box, onClose]);
}

/** Naming the copy. The name is what puts it in the pickers, so it is required. */
function NameDialog({
  source,
  onClose,
  onDone,
}: {
  source: TemplateRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const box = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(`${source.label} (copy)`);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);
  useModal(box, onClose);

  const submit = async () => {
    setErr('');
    setPending(true);
    try {
      await duplicateProfile({ sourceId: source.id, newId: uid(), name });
      onDone();
    } catch (e) {
      setErr(message(e));
      setPending(false);
    }
  };

  return (
    <dialog className="dlg" ref={box} data-copy-dialog aria-label="Duplicate template">
      <div className="dlg-hd">
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>Duplicate {source.label}</span>
      </div>
      <div className="dlg-body">
        <label className="dlg-field">
          <span className="dlg-label">Name</span>
          <span className="dlg-hint">
            What this template is called in the pickers. Two templates may not share a
            name.
          </span>
          <span className="dlg-control">
            <input
              className="lnkin"
              style={{ flexGrow: 1 }}
              autoFocus
              autoComplete="off"
              data-tpl-name
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </span>
        </label>
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
          data-tpl-save
          disabled={pending || !name.trim()}
          onClick={submit}
        >
          {pending ? 'Copying…' : 'Duplicate'}
        </button>
      </div>
    </dialog>
  );
}

const STAGE_COLS: Col[] = [
  ['title', null, 'STAGE'],
  ['prefix', 92, 'PREFIX'],
  ['phase', 140, 'BAND'],
  ['start', 84, 'STARTS wk'],
  ['dur', 76, 'WEEKS'],
  ['acts', 250, ''],
];

/**
 * Editing a template's stages.
 *
 * Order is the y-axis; only the two number fields move a date. Every change
 * goes through the pure functions in /lib/profileEdit so the rule holds in one
 * place rather than in each handler.
 */
function StageDialog({
  profileId,
  label,
  onClose,
  onDone,
}: {
  profileId: string;
  label: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const box = useRef<HTMLDialogElement>(null);
  const [stages, setStages] = useState<ProfileStageDef[] | null>(null);
  /* Renaming and re-staging are one act of editing this template, so they share
     a form and a save rather than being two screens with two buttons. */
  const [name, setName] = useState(label);
  const [acts, setActs] = useState<{ stageKey: string; shortTitle: string } | null>(null);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);
  useModal(box, onClose);

  useEffect(() => {
    let live = true;
    fetch(`/api/profiles/${profileId}/stages`)
      .then((r) => r.json())
      .then((rows: ProfileStageDef[]) => {
        if (live) setStages(rows);
      })
      .catch((e) => {
        if (live) setErr(message(e));
      });
    return () => {
      live = false;
    };
  }, [profileId]);

  /* Derived, not stored: the message a save would refuse with, computed on
     every keystroke so the field says so before the button is reached. */
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
    if (prefixErr) {
      setErr(prefixErr);
      return;
    }
    setErr('');
    setPending(true);
    try {
      await saveProfileStages({
        profileId,
        name,
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
      onDone();
    } catch (e) {
      setErr(message(e));
      setPending(false);
    }
  };

  return (
    <dialog
      className="dlg"
      style={{ width: 'min(980px, calc(100vw - 32px))' }}
      ref={box}
      data-stage-dialog
      aria-label={`Stages of ${label}`}
    >
      <div className="dlg-hd">
        <input
          className="lnkin"
          style={{ fontWeight: 600, fontSize: 13.5, flexGrow: 1, maxWidth: 380 }}
          aria-label="Template name"
          autoComplete="off"
          data-tpl-rename
          value={name}
          onChange={(e) => {
            setErr('');
            setName(e.target.value);
          }}
        />
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="dlg-body">
        {!stages ? (
          <p className="mono-note">Reading the template…</p>
        ) : (
          <div className="ctable" style={{ ['--ct' as string]: ctVar(STAGE_COLS) }}>
            <CTHead cols={STAGE_COLS} />
            {stages.map((st, i) => (
              <div className="trow" key={st.key} data-stage-row={st.key}>
                <input
                  className="lnkin"
                  data-stage-title
                  value={st.title}
                  onChange={(e) =>
                    edit((cur) =>
                      cur.map((x) => (x.key === st.key ? { ...x, title: e.target.value } : x)),
                    )
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
                  onChange={(e) =>
                    edit((cur) => setStagePrefix(cur, st.key, e.target.value))
                  }
                  style={
                    clashing.has(normalizePrefix(st.shortTitle)) || !st.shortTitle
                      ? { color: 'var(--risk)', borderColor: 'var(--risk)' }
                      : undefined
                  }
                />
                <select
                  className="lnkin"
                  data-stage-phase
                  value={st.phaseId}
                  onChange={(e) =>
                    edit((cur) =>
                      cur.map((x) => (x.key === st.key ? { ...x, phaseId: e.target.value } : x)),
                    )
                  }
                >
                  {lifecyclePhases.map((ph) => (
                    <option key={ph.id} value={ph.id}>
                      {ph.label}
                    </option>
                  ))}
                </select>
                <input
                  className="lnkin num"
                  type="number"
                  min={0}
                  step={1}
                  data-stage-start
                  value={st.startOffsetWeeks}
                  onChange={(e) =>
                    edit((cur) =>
                      retimeStage(cur, st.key, { startOffsetWeeks: Number(e.target.value) }),
                    )
                  }
                />
                <input
                  className="lnkin num"
                  type="number"
                  min={1}
                  step={1}
                  data-stage-dur
                  value={st.durationWeeks}
                  onChange={(e) =>
                    edit((cur) =>
                      retimeStage(cur, st.key, { durationWeeks: Number(e.target.value) }),
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
                  <button
                    type="button"
                    className="btn sm dng"
                    data-del-stage
                    onClick={() => edit((cur) => removeStage(cur, st.key))}
                  >
                    Remove
                  </button>
                </span>
              </div>
            ))}
            <div className="trow">
              <button
                type="button"
                className="btn sm"
                data-add-stage
                onClick={() => edit((cur) => addStage(cur, cur.length))}
              >
                <IconPlus />
                Add a stage
              </button>
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
          data-tpl-save
          disabled={pending || !stages || !name.trim() || !!prefixErr}
          onClick={submit}
        >
          {pending ? 'Saving…' : 'Save template'}
        </button>
      </div>
      {acts && (
        <ActivityDialog
          profileId={profileId}
          stageKey={acts.stageKey}
          shortTitle={acts.shortTitle}
          onClose={() => setActs(null)}
        />
      )}
    </dialog>
  );
}

interface EditActivity {
  ref: string;
  title: string;
  windowFrom: number;
  windowTo: number;
  baseRef: string | null;
  steps: { n: number; text: string; tat: number; lane: string }[];
}

const ACT_COLS: Col[] = [
  ['title', null, 'ACTIVITY'],
  ['ref', 96, 'REF'],
  ['from', 84, 'FROM wk'],
  ['to', 76, 'TO wk'],
  ['acts', 190, ''],
];

/**
 * The activities inside one stage of a template, and the steps inside them.
 *
 * An activity is inherited or owned. Opening its steps copies the library's
 * onto the row and drops its baseRef — the materialise rule, applied the moment
 * somebody starts editing rather than when they save, so what is on screen is
 * what will be stored.
 *
 * A reference is an identity, not a position. An added activity takes the next
 * number this stage has never used, and a deleted one's number is never
 * reissued: recorded work is keyed on the string.
 */
function ActivityDialog({
  profileId,
  stageKey,
  shortTitle,
  onClose,
}: {
  profileId: string;
  stageKey: string;
  shortTitle: string;
  onClose: () => void;
}) {
  const box = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState<EditActivity[] | null>(null);
  const [openSteps, setOpenSteps] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);
  useModal(box, onClose);

  useEffect(() => {
    let live = true;
    fetch(`/api/profiles/${profileId}/activities?stage=${encodeURIComponent(stageKey)}`)
      .then((r) => r.json())
      .then((got: EditActivity[]) => {
        if (live) setRows(got.map((a) => ({ ...a, steps: a.steps ?? [] })));
      })
      .catch((e) => live && setErr(message(e)));
    return () => {
      live = false;
    };
  }, [profileId, stageKey]);

  /* The next number this stage has never used. Reissuing a deleted one would
     point somebody's recorded work at different work. */
  const freshRef = (cur: EditActivity[]) => {
    const used = cur
      .map((a) => Number(a.ref.split('-').pop()))
      .filter((n) => Number.isFinite(n)) as number[];
    const next = (used.length ? Math.max(...used) : 0) + 1;
    return `${shortTitle}-${String(next).padStart(2, '0')}`;
  };

  /* Materialise: an activity whose steps are being edited stops inheriting and
     owns every one of them from here on. */
  const materialise = (a: EditActivity, library: readonly (readonly [number, string, number, number?])[]) =>
    a.baseRef
      ? {
          ...a,
          baseRef: null,
          steps: library.map((s, i) => ({
            n: i + 1,
            text: String(s[1]),
            tat: Number(s[2]),
            lane: s[3] ? 'par' : 'main',
          })),
        }
      : a;

  const libraryFor = (a: EditActivity) =>
    a.baseRef ? (activityLibrary[a.baseRef]?.s ?? []) : [];

  const edit = (fn: (cur: EditActivity[]) => EditActivity[]) => {
    setErr('');
    setRows((cur) => {
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
    if (!rows) return;
    setErr('');
    setPending(true);
    try {
      await saveTemplateActivities({ profileId, stageKey, activities: rows });
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
        <button type="button" className="btn sm" onClick={onClose}>
          Close
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
                  <input
                    className="lnkin"
                    data-act-title
                    value={a.title}
                    onChange={(e) =>
                      edit((cur) =>
                        cur.map((x) => (x.ref === a.ref ? { ...x, title: e.target.value } : x)),
                      )
                    }
                  />
                  <span className="pill" style={{ fontSize: 10.5, justifySelf: 'start' }}>
                    {a.ref}
                  </span>
                  <input
                    className="lnkin num"
                    type="number"
                    min={0}
                    step={1}
                    data-act-from
                    value={a.windowFrom}
                    onChange={(e) =>
                      edit((cur) =>
                        cur.map((x) =>
                          x.ref === a.ref ? { ...x, windowFrom: Number(e.target.value) } : x,
                        ),
                      )
                    }
                  />
                  <input
                    className="lnkin num"
                    type="number"
                    min={1}
                    step={1}
                    data-act-to
                    value={a.windowTo}
                    onChange={(e) =>
                      edit((cur) =>
                        cur.map((x) =>
                          x.ref === a.ref ? { ...x, windowTo: Number(e.target.value) } : x,
                        ),
                      )
                    }
                  />
                  <span style={{ display: 'flex', gap: 5, justifySelf: 'end' }}>
                    <button
                      type="button"
                      className="btn sm"
                      data-edit-steps
                      onClick={() => {
                        edit((cur) =>
                          cur.map((x) => (x.ref === a.ref ? materialise(x, libraryFor(x)) : x)),
                        );
                        setOpenSteps(openSteps === a.ref ? null : a.ref);
                      }}
                    >
                      {openSteps === a.ref ? 'Hide steps' : `Steps (${
                        a.baseRef ? libraryFor(a).length : a.steps.length
                      })`}
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
                          value={st.text}
                          onChange={(e) =>
                            edit((cur) =>
                              cur.map((x) =>
                                x.ref === a.ref
                                  ? {
                                      ...x,
                                      steps: x.steps.map((y) =>
                                        y.n === st.n ? { ...y, text: e.target.value } : y,
                                      ),
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                        <input
                          className="lnkin num"
                          type="number"
                          min={0}
                          step={0.5}
                          data-step-tat
                          value={st.tat}
                          onChange={(e) =>
                            edit((cur) =>
                              cur.map((x) =>
                                x.ref === a.ref
                                  ? {
                                      ...x,
                                      steps: x.steps.map((y) =>
                                        y.n === st.n ? { ...y, tat: Number(e.target.value) } : y,
                                      ),
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                        <select
                          className="lnkin"
                          data-step-lane
                          value={st.lane}
                          onChange={(e) =>
                            edit((cur) =>
                              cur.map((x) =>
                                x.ref === a.ref
                                  ? {
                                      ...x,
                                      steps: x.steps.map((y) =>
                                        y.n === st.n ? { ...y, lane: e.target.value } : y,
                                      ),
                                    }
                                  : x,
                              ),
                            )
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
                            edit((cur) =>
                              cur.map((x) =>
                                x.ref === a.ref
                                  ? { ...x, steps: x.steps.filter((y) => y.n !== st.n) }
                                  : x,
                              ),
                            )
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
                          edit((cur) =>
                            cur.map((x) =>
                              x.ref === a.ref
                                ? {
                                    ...x,
                                    steps: [
                                      ...x.steps,
                                      {
                                        n: (x.steps.at(-1)?.n ?? 0) + 1,
                                        text: 'New step',
                                        tat: 1,
                                        lane: 'main',
                                      },
                                    ],
                                  }
                                : x,
                            ),
                          )
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
                      windowTo: 4,
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
          data-tpl-save
          disabled={pending || !rows}
          onClick={submit}
        >
          {pending ? 'Saving…' : 'Save activities'}
        </button>
      </div>
    </dialog>
  );
}
