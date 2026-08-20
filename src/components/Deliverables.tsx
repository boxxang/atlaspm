'use client';

import { useState } from 'react';
import type { StageId } from '@/data/types';
import { fmtDT, fmtDate, fromISO, toISO } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { ColGrip } from './ColGrip';

/**
 * Ticking a deliverable off is day-to-day work, so the checkbox is always live.
 * Changing a due date, adding a line or removing one changes what the stage
 * owes, so those wait for edit mode.
 */
export function Deliverables({
  stageId,
  editing = false,
}: {
  stageId: StageId;
  editing?: boolean;
}) {
  const list = useAppStore((s) => s.deliverables[stageId]);
  const today = useAppStore((s) => s.today);
  const toggle = useAppStore((s) => s.toggleDeliverable);
  const setDue = useAppStore((s) => s.setDeliverableDue);
  const add = useAppStore((s) => s.addDeliverable);
  const del = useAppStore((s) => s.deleteDeliverable);
  const [title, setTitle] = useState('');
  const [due, setDueDraft] = useState('');
  const done = list.filter((d) => d.done).length;

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    add(stageId, t, due ? fromISO(due) : null);
    setTitle('');
    setDueDraft('');
  };

  return (
    <>
      <span className="cap">
        Key Deliverables
        <span className="dlv-note">
          {done} / {list.length} complete
        </span>
      </span>
      <div className="dlv-cols">
        <span>
          Deliverable
          <ColGrip col="--dlv-due" dir={-1} cell={1} />
        </span>
        <span>
          Due
          <ColGrip col="--dlv-comp" dir={-1} cell={2} />
        </span>
        <span>Completed</span>
        <span />
      </div>
      <ul className="dlv-list">
        {list.map((d) => (
          <li key={d.id}>
            <label>
              <input
                type="checkbox"
                data-dlv-check={d.id}
                checked={d.done}
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
                {d.due ? fmtDate(d.due) : '—'}
              </span>
            )}
            {/* completion timestamp is automatic */}
            <span className="dlv-comp" data-comp={d.id}>
              {d.completedAt ? fmtDT(d.completedAt) : '—'}
            </span>
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
    </>
  );
}
