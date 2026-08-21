'use client';

import { useState } from 'react';
import type { StageId } from '@/data/types';
import { fmtDate, fromISO, toISO } from '@/lib/schedule';
import { deliverableRowId } from '@/lib/rowIds';
import { useAppStore } from '@/store/useAppStore';
import { ColGrip } from './ColGrip';
import { useWrapped } from '@/store/wrapStore';
import { WrapToggle } from './WrapToggle';

/**
 * Ticking a deliverable off is day-to-day work, so the checkbox is always live.
 * Changing a due date, adding a line or removing one changes what the stage
 * owes, so those wait for this table's own edit mode — independent of the
 * stage text and of the engineering list, which each have their own.
 */
export function Deliverables({ stageId }: { stageId: StageId }) {
  const [editing, setEditing] = useState(false);
  const wrapped = useWrapped('deliverables');
  const list = useAppStore((s) => s.deliverables[stageId]);
  /* The row IDs are the template's — DEF-D1 — so a review can name a line. */
  const shortTitle = useAppStore((s) => s.stages.find((st) => st.id === stageId)?.shortTitle ?? '');
  const today = useAppStore((s) => s.today);
  const toggle = useAppStore((s) => s.toggleDeliverable);
  const setDue = useAppStore((s) => s.setDeliverableDue);
  const setCompleted = useAppStore((s) => s.setDeliverableCompleted);
  const add = useAppStore((s) => s.addDeliverable);
  const del = useAppStore((s) => s.deleteDeliverable);
  const [title, setTitle] = useState('');
  const [due, setDueDraft] = useState('');
  /* A deliverable with no date is a real answer, but rarely the intended one —
     so it is asked about once rather than saved silently. */
  const [askTbd, setAskTbd] = useState(false);
  const done = list.filter((d) => d.done).length;

  const write = (dueDate: Date | null) => {
    add(stageId, title.trim(), dueDate);
    setTitle('');
    setDueDraft('');
    setAskTbd(false);
  };

  const submit = () => {
    if (!title.trim()) return;
    if (!due) {
      setAskTbd(true);
      return;
    }
    write(fromISO(due));
  };

  return (
    <>
      <div className="sheet-head">
        <span className="cap">
          Key Deliverables
          <span className="dlv-note">
            {done} / {list.length} complete
          </span>
        </span>
        <WrapToggle boardKey="deliverables" />
        <button
          className="tbl-edit"
          data-dlv-edit
          aria-pressed={editing}
          title={editing ? 'Done editing the deliverables' : 'Edit the deliverables'}
          onClick={() => {
            setEditing((v) => !v);
            setAskTbd(false);
          }}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>
      <div className="dlv-cols">
        <span>ID</span>
        <span>
          Deliverable
          <ColGrip col="--dlv-due" dir={-1} cell={2} />
        </span>
        <span>
          Due
          <ColGrip col="--dlv-comp" dir={-1} cell={3} />
        </span>
        <span>Completed</span>
        <span />
      </div>
      <ul className={`dlv-list${wrapped ? ' wrapped' : ''}`}>
        {list.map((d, i) => (
          <li key={d.id}>
            <span className="row-id" data-dlv-id={d.id}>
              {deliverableRowId(shortTitle, i)}
            </span>
            <label>
              {/* Ticking something off is day-to-day work, so it is done from
                  the page. Un-ticking it is a correction to a record — that
                  belongs in edit mode, with the completion date beside it. */}
              <input
                type="checkbox"
                data-dlv-check={d.id}
                checked={d.done}
                disabled={d.done && !editing}
                title={
                  d.done && !editing
                    ? 'Completed — open Edit to change it'
                    : 'Mark complete, stamping today'
                }
                onChange={(e) => toggle(stageId, d.id, e.target.checked)}
              />
              <span className={`dlv-t${d.done ? ' done' : ''}`}>{d.title}</span>
            </label>
            {editing ? (
              <input
                type="date"
                className={`dlv-due${!d.done && d.due && d.due < today ? ' overdue' : ''}`}
                data-dlv-due={d.id}
                value={d.due ? toISO(d.due) : ''}
                title="Target due date"
                onChange={(e) =>
                  setDue(stageId, d.id, e.target.value ? fromISO(e.target.value) : null)
                }
              />
            ) : (
              <span
                className={`dlv-due read${!d.done && d.due && d.due < today ? ' overdue' : ''}`}
                data-dlv-due-text={d.id}
              >
                {d.due ? fmtDate(d.due) : 'TBD'}
              </span>
            )}
            {/* The checkbox stamps the completion date; edit mode corrects it,
                because a thing is often ticked off some days after it was done. */}
            {editing && d.done ? (
              <input
                type="date"
                className="dlv-comp-edit"
                data-comp-edit={d.id}
                aria-label={`Completed date for ${d.title}`}
                value={d.completedAt ? toISO(d.completedAt) : ''}
                onChange={(e) =>
                  setCompleted(stageId, d.id, e.target.value ? fromISO(e.target.value) : null)
                }
              />
            ) : (
              <span className="dlv-comp" data-comp={d.id}>
                {d.completedAt ? fmtDate(d.completedAt) : '—'}
              </span>
            )}
            {editing ? (
              <button
                data-dlv-del={d.id}
                aria-label="Delete deliverable"
                onClick={() => del(stageId, d.id)}
              >
                ✕
              </button>
            ) : (
              <span />
            )}
          </li>
        ))}
      </ul>
      {editing && (
      <div className="dlv-add">
        <input
          className="dlv-input"
          placeholder="New deliverable…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <input
          type="date"
          className="dlv-due dlv-input-due"
          title="Target due date"
          style={{ maxWidth: '9.5rem' }}
          value={due}
          onChange={(e) => setDueDraft(e.target.value)}
        />
        <button data-dlv-add onClick={submit}>
          + Add
        </button>
      </div>
      )}
      {editing && askTbd && (
        <div className="dlv-tbd" role="alert">
          <span>
            No due date for &ldquo;{title.trim()}&rdquo;. Add it as <strong>TBD</strong>? The date
            can be filled in here later.
          </span>
          <button data-dlv-tbd-ok onClick={() => write(null)}>
            Add as TBD
          </button>
          <button data-dlv-tbd-cancel onClick={() => setAskTbd(false)}>
            Pick a date
          </button>
        </div>
      )}
    </>
  );
}
