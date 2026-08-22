'use client';

import { useEffect, useRef, useState } from 'react';
import type { StageId } from '@/data/types';
import { formatManMonths, formatTat } from '@/lib/effort';
import { activityRowId } from '@/lib/rowIds';
import {
  fromLines,
  normaliseOverride,
  resolveStageDetail,
  type ResolvedStageDetail,
} from '@/lib/stageDetail';
import { useAppStore, type InlineState } from '@/store/useAppStore';
import { Deliverables } from './Deliverables';
import { useWrapped } from '@/store/wrapStore';
import { WrapToggle } from './WrapToggle';
import { ColGrip } from './ColGrip';
import { StageGantt } from './StageGantt';

/** The stage as this program's profile defines it, text and all. */
const useStage = (id: StageId) =>
  useAppStore((s) => s.stages.find((st) => st.id === id))!;

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
  shortTitle,
  detail,
  editing,
}: {
  stageId: StageId;
  /** Prefix of the row IDs — DEF-01, PKGD-11. */
  shortTitle: string;
  detail: ResolvedStageDetail;
  /** Owned by the pane header, so the switch sits on the same row as the
      deliverables' one and the two tables line up. */
  editing: boolean;
}) {
  const setLines = useAppStore((st) => st.setEngineeringLines);
  const wrapped = useWrapped('engineering');
  const [draft, setDraft] = useState('');
  const [draftMm, setDraftMm] = useState('');
  const [draftTat, setDraftTat] = useState('');

  const lines = detail.engineeringView.map((label, i) => ({
    label,
    manMonths: detail.engineeringEffort[i] ?? 0,
    tatWeeks: detail.engineeringTat[i] ?? 0,
  }));
  const write = (next: { label: string; manMonths: number; tatWeeks: number }[]) =>
    setLines(stageId, next);

  const add = () => {
    const label = draft.trim();
    if (!label) return;
    const mm = Number.parseFloat(draftMm);
    const tat = Number.parseFloat(draftTat);
    write([
      ...lines,
      {
        label,
        manMonths: Number.isFinite(mm) && mm >= 0 ? mm : 0,
        tatWeeks: Number.isFinite(tat) ? tat : 0,
      },
    ]);
    setDraft('');
    setDraftMm('');
    setDraftTat('');
  };

  return (
    <>
      <div className={`mm-cols${editing ? '' : ' read'}`}>
        <span>ID</span>
        <span>
          Activity
          <ColGrip col="--mm-tat" dir={-1} cell={2} min={34} />
        </span>
        <span>
          TAT
          <ColGrip col="--mm-mm" dir={-1} cell={3} min={34} />
        </span>
        <span>M/M</span>
        {editing && <span />}
      </div>
      <ul className={`mm-list${editing ? '' : ' read'}${wrapped ? ' wrapped' : ''}`}>
        {lines.map((line, i) => (
          <li key={`${i}-${line.label}`}>
            <span className="row-id" data-act-id={i}>
              {activityRowId(shortTitle, i)}
            </span>
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
                className="mm-input tat"
                data-tat={i}
                step="0.5"
                inputMode="decimal"
                aria-label={`Turn-around weeks for ${line.label}`}
                title="Elapsed weeks; a negative value marks an activity that runs continuously"
                value={line.tatWeeks || ''}
                placeholder="0"
                onChange={(e) => {
                  const n = Number.parseFloat(e.target.value);
                  write(
                    lines.map((l, j) =>
                      j === i ? { ...l, tatWeeks: Number.isFinite(n) ? n : 0 } : l,
                    ),
                  );
                }}
              />
            ) : (
              <span className="mm-input tat read" data-tat-text={i}>
                {formatTat(line.tatWeeks)}
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
          className="mm-new-tat"
          step="0.5"
          placeholder="TAT"
          aria-label="Turn-around weeks for the new activity"
          value={draftTat}
          onChange={(e) => setDraftTat(e.target.value)}
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

/** Bars on a timeline — the mark for reading a table as a schedule. */
function ChartIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <g fill="currentColor">
        <rect x="2" y="3" width="9" height="2.4" rx="1.2" />
        <rect x="5" y="6.8" width="9" height="2.4" rx="1.2" />
        <rect x="3.5" y="10.6" width="7" height="2.4" rx="1.2" />
      </g>
    </svg>
  );
}

/** Engineering | Program — the two readings of the same stage. */
function ViewToggle({
  stageId,
  shortTitle,
  detail,
}: {
  stageId: StageId;
  shortTitle: string;
  detail: ResolvedStageDetail;
}) {
  const [view, setView] = useState<'eng' | 'prog'>('eng');
  /* The engineering list has its own edit mode, independent of the stage text
     and of the deliverables; its switch lives up here so both tables carry
     exactly one header row and their columns line up. */
  const [editing, setEditing] = useState(false);
  /* A first look at reading a stage as a timeline rather than as two tables.
     One stage for now — it is a question about whether the derived starts are
     worth having, and one stage answers that as well as twenty-three would. */
  const [chart, setChart] = useState(false);
  const timeline = stageId === 'rtl';
  /* Three grid items, not one column: the chart spans both columns between
     the header row and the tables, so it is read at the width of the stage
     rather than at half of it. */
  return (
    <>
      <div className="sh sh-head sh-l">
      <div className="sheet-head">
        <div className="view-toggle" role="group">
          <button aria-pressed={view === 'eng'} data-view="eng" onClick={() => setView('eng')}>
            Engineering
          </button>
          <button aria-pressed={view === 'prog'} data-view="prog" onClick={() => setView('prog')}>
            Program
          </button>
        </div>
        {view === 'eng' && timeline && (
          <button
            className="tbl-icon"
            data-stage-chart
            aria-pressed={chart}
            title={chart ? 'Hide the stage timeline' : 'Show the stage timeline'}
            aria-label={chart ? 'Hide the stage timeline' : 'Show the stage timeline'}
            onClick={() => setChart((v) => !v)}
          >
            <ChartIcon />
          </button>
        )}
        {view === 'eng' && <WrapToggle boardKey="engineering" />}
        {view === 'eng' && (
          <button
            className="tbl-edit"
            data-mm-edit
            aria-pressed={editing}
            title={editing ? 'Done editing the engineering list' : 'Edit the engineering list'}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>
      </div>

      {timeline && chart && (
        <div className="sh sh-chart">
          <StageGantt stageId={stageId} />
        </div>
      )}

      <div className="sh sh-body sh-l">
      <div className="view-pane enter" data-pane="eng" hidden={view !== 'eng'} key={`eng-${view}`}>
        <EngineeringTable
            stageId={stageId}
            shortTitle={shortTitle}
            detail={detail}
            editing={editing}
          />
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
    </>
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
  const stage = useStage(stageId);
  const save = useAppStore((st) => st.saveStageDetail);
  const [f, setF] = useState({
    description: detail.description,
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
            /* the engineering list and its man-months belong to their own
               table — read them live rather than from a snapshot taken when
               this form opened, which is how an edit there used to vanish */
            const live = useAppStore.getState().stageDetails[stageId];
            save(
              stageId,
              normaliseOverride(
                {
                  ...f,
                  engineeringView: live?.engineeringView ?? null,
                  engineeringEffort: live?.engineeringEffort ?? null,
                },
                stage,
              ),
            );
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
  const s = useStage(stageId);
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
            title="Edit this stage's description"
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
        <StageDetailEditor stageId={stageId} detail={detail} onDone={() => setEditing(false)} />
      ) : (
        <p className="sheet-what">{detail.description}</p>
      )}

      <div className="sheet-grid">
        <ViewToggle stageId={stageId} shortTitle={s.shortTitle} detail={detail} />
        <Deliverables stageId={stageId} />
      </div>
    </>
  );
}

function LeaderEditor({ stageId }: { stageId: StageId }) {
  const stage = useStage(stageId);
  const l = useAppStore((st) => st.leaders[stageId]);
  const save = useAppStore((st) => st.saveLeader);
  const close = useAppStore((st) => st.closeInline);
  const [f, setF] = useState({ name: l.name, phone: l.phone, email: l.email });
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <InlineHead title="Stage Leader" meta={stage.title} onClose={() => close(stageId)} />
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
      {state.kind === 'leader' && <LeaderEditor stageId={stageId} />}
    </div>
  );
}
