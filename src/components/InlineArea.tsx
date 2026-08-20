'use client';

import { useEffect, useRef, useState } from 'react';
import { journeyData } from '@/data/journey';
import type { StageId } from '@/data/types';
import { formatManMonths } from '@/lib/effort';
import {
  fromLines,
  normaliseOverride,
  resolveStageDetail,
  type ResolvedStageDetail,
} from '@/lib/stageDetail';
import { useAppStore, type InlineState } from '@/store/useAppStore';
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

/**
 * The engineering side is a table rather than a list: each line carries the
 * man-months it takes, and their sum is what the stage costs in effort. That
 * total is what the gantt bars and the program's cost estimate are built on.
 */
/**
 * The engineering activities are a board of their own: add a line, rename it,
 * give it man-months, delete it. That is why the pencil form no longer carries
 * an "engineering view" textarea — this is where the list is managed.
 */
function EngineeringTable({
  stageId,
  detail,
  editing,
}: {
  stageId: StageId;
  detail: ResolvedStageDetail;
  /** Outside edit mode the table is a read-out, not a form. */
  editing: boolean;
}) {
  const setLines = useAppStore((st) => st.setEngineeringLines);
  const [draft, setDraft] = useState('');
  const [draftMm, setDraftMm] = useState('');

  const lines = detail.engineeringView.map((label, i) => ({
    label,
    manMonths: detail.engineeringEffort[i] ?? 0,
  }));
  const write = (next: { label: string; manMonths: number }[]) => setLines(stageId, next);

  const add = () => {
    const label = draft.trim();
    if (!label) return;
    const n = Number.parseFloat(draftMm);
    write([...lines, { label, manMonths: Number.isFinite(n) && n >= 0 ? n : 0 }]);
    setDraft('');
    setDraftMm('');
  };

  return (
    <>
      <div className={`mm-cols${editing ? '' : ' read'}`}>
        <span>Engineering activity</span>
        <span>M/M</span>
        {editing && <span />}
      </div>
      <ul className={`mm-list${editing ? '' : ' read'}`}>
        {lines.map((line, i) => (
          <li key={`${i}-${line.label}`}>
            {editing ? (
              <input
                className="mm-t"
                data-mm-label={i}
                value={line.label}
                aria-label={`Engineering activity ${i + 1}`}
                onChange={(e) =>
                  write(lines.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))
                }
              />
            ) : (
              <span className="mm-t read" data-mm-label-text={i}>
                {line.label}
              </span>
            )}
            {editing ? (
              <input
                type="number"
                className="mm-input"
                data-mm={i}
                min="0"
                step="0.5"
                inputMode="decimal"
                aria-label={`Man-months for ${line.label}`}
                value={line.manMonths || ''}
                placeholder="0"
                onChange={(e) => {
                  const n = Number.parseFloat(e.target.value);
                  write(
                    lines.map((l, j) =>
                      j === i ? { ...l, manMonths: Number.isFinite(n) && n >= 0 ? n : 0 } : l,
                    ),
                  );
                }}
              />
            ) : (
              <span className="mm-input read" data-mm-text={i}>
                {line.manMonths || '—'}
              </span>
            )}
            {editing && (
              <button
                data-mm-del={i}
                aria-label={`Delete ${line.label}`}
                onClick={() => write(lines.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            )}
          </li>
        ))}
        {lines.length === 0 && <li className="mm-empty">No engineering activities yet.</li>}
      </ul>
      {editing && (
      <div className="mm-add">
        <input
          className="mm-new"
          placeholder="New engineering activity…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <input
          type="number"
          className="mm-new-mm"
          min="0"
          step="0.5"
          placeholder="M/M"
          aria-label="Man-months for the new activity"
          value={draftMm}
          onChange={(e) => setDraftMm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button data-mm-add onClick={add}>
          + Add
        </button>
      </div>
      )}
      <div className="mm-total">
        <span className="k">Stage effort</span>
        <span className="v" data-stage-mm>
          {formatManMonths(detail.manMonths)}
        </span>
      </div>
    </>
  );
}

/** Engineering | Program — the two readings of the same stage. */
function ViewToggle({
  stageId,
  detail,
  editing,
}: {
  stageId: StageId;
  detail: ResolvedStageDetail;
  editing: boolean;
}) {
  const [view, setView] = useState<'eng' | 'prog'>('eng');
  return (
    <div>
      <div className="sheet-head">
      <div className="view-toggle" role="group">
        <button aria-pressed={view === 'eng'} data-view="eng" onClick={() => setView('eng')}>
          Engineering
        </button>
        <button aria-pressed={view === 'prog'} data-view="prog" onClick={() => setView('prog')}>
          Program
        </button>
      </div>
      </div>
      <div className="view-pane enter" data-pane="eng" hidden={view !== 'eng'} key={`eng-${view}`}>
        <EngineeringTable stageId={stageId} detail={detail} editing={editing} />
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
  engineeringEffort,
  onDone,
}: {
  stageId: StageId;
  detail: ResolvedStageDetail;
  /** Carried through untouched: effort is edited in the table, not here. */
  engineeringEffort: string | null;
  onDone: () => void;
}) {
  const save = useAppStore((st) => st.saveStageDetail);
  const [f, setF] = useState({
    description: detail.description,
    /* the engineering list is managed in its own table, not here */
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
            save(stageId, normaliseOverride({ ...f, engineeringEffort }, stageOf(stageId)));
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

function StageDetail({ stageId }: { stageId: StageId }) {
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
            title="Edit this stage — text, engineering activities and deliverables"
            aria-label="Edit this stage"
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
        <StageDetailEditor
          stageId={stageId}
          detail={detail}
          engineeringEffort={override?.engineeringEffort ?? null}
          onDone={() => setEditing(false)}
        />
      ) : (
        <p className="sheet-what">{detail.description}</p>
      )}

      <div className="sheet-grid">
        <ViewToggle stageId={stageId} detail={detail} editing={editing} />
        <div className="sheet-side">
          <Deliverables stageId={stageId} editing={editing} />
        </div>
      </div>
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
      {state.kind === 'stage' && <StageDetail stageId={stageId} />}
      {state.kind === 'potential' && <PotentialRisks stageId={stageId} />}
      {state.kind === 'leader' && <LeaderEditor stageId={stageId} />}
    </div>
  );
}
