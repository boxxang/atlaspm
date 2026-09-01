'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { deleteProfile, duplicateProfile, saveProfileStages } from '@/app/actions';
import { lifecyclePhases } from '@/data/scheduleProfiles';
import type { ProfileStageDef } from '@/data/types';
import { uid } from '@/store/useAppStore';
import { addStage, moveStage, removeStage, retimeStage } from '@/lib/profileEdit';
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
  ['phase', 156, 'BAND'],
  ['start', 90, 'STARTS wk'],
  ['dur', 82, 'WEEKS'],
  ['acts', 150, ''],
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
    setErr('');
    setPending(true);
    try {
      await saveProfileStages({
        profileId,
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
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</span>
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
          disabled={pending || !stages}
          onClick={submit}
        >
          {pending ? 'Saving…' : 'Save template'}
        </button>
      </div>
    </dialog>
  );
}
