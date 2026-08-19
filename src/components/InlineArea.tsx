'use client';

import { useEffect, useRef, useState } from 'react';
import { journeyData } from '@/data/journey';
import type { StageId } from '@/data/types';
import {
  fromLines,
  normaliseOverride,
  resolveStageDetail,
  type ResolvedStageDetail,
} from '@/lib/stageDetail';
import { useAppStore, type InlineState } from '@/store/useAppStore';
import { Contacts } from './Contacts';
import { Deliverables } from './Deliverables';

const stageOf = (id: StageId) => journeyData.find((s) => s.id === id)!;

function InlineHead({
  title,
  meta,
  onClose,
}: {
  title: string;
  meta: string;
  onClose: () => void;
}) {
  return (
    <div className="inline-head">
      <h3>{title}</h3>
      <span className="meta">{meta}</span>
      <button className="inline-close" onClick={onClose}>
        ✕ CLOSE
      </button>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 6.5l3 3" />
    </svg>
  );
}

/** Engineering | Program — the two readings of the same stage. */
function ViewToggle({ detail }: { detail: ResolvedStageDetail }) {
  const [view, setView] = useState<'eng' | 'prog'>('eng');
  return (
    <div>
      <div className="view-toggle" role="group">
        <button aria-pressed={view === 'eng'} data-view="eng" onClick={() => setView('eng')}>
          Engineering
        </button>
        <button aria-pressed={view === 'prog'} data-view="prog" onClick={() => setView('prog')}>
          Program
        </button>
      </div>
      <div className="view-pane enter" data-pane="eng" hidden={view !== 'eng'} key={`eng-${view}`}>
        <ul className="view-list">
          {detail.engineeringView.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <div className="view-foot">
          <span className="cap">Tools</span>
          <span className="mono">{detail.tools.join(' · ')}</span>
        </div>
      </div>
      <div className="view-pane enter" data-pane="prog" hidden={view !== 'prog'} key={`prog-${view}`}>
        <ul className="view-list">
          {detail.programView.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <div className="view-foot">
          <span className="cap">Teams</span>
          <span className="mono">{detail.collaboration.join(' · ')}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * The stage text is shared code; a program edits its own copy. Clearing a field
 * restores the shared default rather than freezing a copy of it, which is why
 * the form starts blank-means-default and offers "Restore defaults".
 */
function StageDetailEditor({
  stageId,
  detail,
  onDone,
}: {
  stageId: StageId;
  detail: ResolvedStageDetail;
  onDone: () => void;
}) {
  const save = useAppStore((st) => st.saveStageDetail);
  const [f, setF] = useState({
    description: detail.description,
    engineeringView: fromLines(detail.engineeringView),
    programView: fromLines(detail.programView),
    tools: fromLines(detail.tools),
    collaboration: fromLines(detail.collaboration),
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="sd-edit">
      <label className="sd-field">
        <span className="k">What happens in this stage</span>
        <textarea className="sd-description" value={f.description} onChange={set('description')} autoFocus />
      </label>
      <div className="sd-cols">
        <label className="sd-field">
          <span className="k">Engineering view — one per line</span>
          <textarea className="sd-eng" value={f.engineeringView} onChange={set('engineeringView')} />
        </label>
        <label className="sd-field">
          <span className="k">Program view — one per line</span>
          <textarea className="sd-prog" value={f.programView} onChange={set('programView')} />
        </label>
        <label className="sd-field">
          <span className="k">Tools — one per line</span>
          <textarea className="sd-tools" value={f.tools} onChange={set('tools')} />
        </label>
        <label className="sd-field">
          <span className="k">Teams — one per line</span>
          <textarea className="sd-teams" value={f.collaboration} onChange={set('collaboration')} />
        </label>
      </div>
      <div className="sd-acts">
        <button
          data-sd-save
          onClick={() => {
            save(stageId, normaliseOverride(f, stageOf(stageId)));
            onDone();
          }}
        >
          Save
        </button>
        <button data-sd-cancel onClick={onDone}>
          Cancel
        </button>
        <span className="spacer" />
        <button
          data-sd-restore
          title="Drop this program's edits and use the shared stage text"
          onClick={() => {
            save(stageId, {});
            onDone();
          }}
        >
          Restore defaults
        </button>
      </div>
      <p className="session-note">
        Edits apply to this program only. An empty field falls back to the shared stage text.
      </p>
    </div>
  );
}

function StageDetail({ stageId, editContact }: { stageId: StageId; editContact: string | null }) {
  const s = stageOf(stageId);
  const close = useAppStore((st) => st.closeInline);
  const override = useAppStore((st) => st.stageDetails[stageId]);
  const detail = resolveStageDetail(s, override);
  const [editing, setEditing] = useState(false);

  return (
    <>
      <div className="inline-head">
        <h3>Stage Details</h3>
        <span className="meta">{s.title}</span>
        {detail.overridden.size > 0 && (
          <span className="sd-flag" title="This program has edited the stage text">
            EDITED
          </span>
        )}
        {!editing && (
          <button
            className="sd-pencil"
            data-sd-edit
            title="Edit this stage's text"
            aria-label="Edit this stage's text"
            onClick={() => setEditing(true)}
          >
            <PencilIcon />
          </button>
        )}
        <button className="inline-close" onClick={() => close(stageId)}>
          ✕ CLOSE
        </button>
      </div>

      {editing ? (
        <StageDetailEditor stageId={stageId} detail={detail} onDone={() => setEditing(false)} />
      ) : (
        <p className="sheet-what">{detail.description}</p>
      )}

      <div className="sheet-grid">
        <ViewToggle detail={detail} />
        <div className="sheet-side">
          <Deliverables stageId={stageId} />
        </div>
      </div>
      <Contacts stageId={stageId} editId={editContact} />
    </>
  );
}

/** PM must-check library — anything here can be adopted onto the risk board. */
function PotentialRisks({ stageId }: { stageId: StageId }) {
  const s = stageOf(stageId);
  const risks = useAppStore((st) => st.content[stageId].risks);
  const adopt = useAppStore((st) => st.adoptPotentialRisk);
  const close = useAppStore((st) => st.closeInline);
  const existing = new Set(risks.map((r) => r.title));
  return (
    <>
      <InlineHead
        title="Potential Risks"
        meta={`${s.title} — PM checklist · add any to the risk board`}
        onClose={() => close(stageId)}
      />
      <div className="pr-list">
        {s.potentialRisks.map((t, i) => (
          <div className="pr-row" key={t}>
            <span className="t">{t}</span>
            <button
              className="pr-add"
              data-pr-index={i}
              disabled={existing.has(t)}
              onClick={() => adopt(stageId, t)}
            >
              {existing.has(t) ? 'Added' : '+ Track'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function LeaderEditor({ stageId }: { stageId: StageId }) {
  const l = useAppStore((st) => st.leaders[stageId]);
  const save = useAppStore((st) => st.saveLeader);
  const close = useAppStore((st) => st.closeInline);
  const [f, setF] = useState({ name: l.name, phone: l.phone, email: l.email });
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <InlineHead title="Stage Leader" meta={stageOf(stageId).title} onClose={() => close(stageId)} />
      <div className="item-editor">
        <div className="ie-field">
          <span className="cap">Name</span>
          <input
            className="ie-l-name"
            value={f.name}
            ref={nameRef}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </div>
        <div className="ie-field">
          <span className="cap">Phone</span>
          <input
            className="ie-l-phone"
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
          />
        </div>
        <div className="ie-field">
          <span className="cap">Email</span>
          <input
            className="ie-l-email"
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
          />
        </div>
        <div className="ie-actions">
          <button
            data-leader-save
            onClick={() => {
              if (!f.name.trim()) return nameRef.current?.focus();
              save(stageId, { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() });
              close(stageId);
            }}
          >
            Save
          </button>
        </div>
        <p className="session-note">
          Entries live in this browser session (prototype) — persistence arrives with the
          production build.
        </p>
      </div>
    </>
  );
}

export function InlineArea({
  stageId,
  state,
  scroll = true,
}: {
  stageId: StageId;
  state: InlineState;
  scroll?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scroll) return;
    const el = ref.current;
    requestAnimationFrame(() => el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    // Scroll on open only, not on every keystroke inside the sheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId, state.kind]);

  return (
    <div className="inline-area" data-kind={state.kind} ref={ref}>
      {state.kind === 'stage' && <StageDetail stageId={stageId} editContact={state.editContact} />}
      {state.kind === 'potential' && <PotentialRisks stageId={stageId} />}
      {state.kind === 'leader' && <LeaderEditor stageId={stageId} />}
    </div>
  );
}
