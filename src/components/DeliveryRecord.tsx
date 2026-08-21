'use client';

import { useEffect, useState } from 'react';
import type { Deliverable, StageId } from '@/data/types';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { AttachmentList, AttachmentPicker, AttachmentProblems } from './Attachments';

/** The pencil every table in this app uses for "open this for changes". */
function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path
        d="M11.4 1.8 14.2 4.6 5.4 13.4 2 14l.6-3.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A deliverable's record: how the thing came to be, and the thing itself.
 *
 * Ticking a box says a deliverable is done; a file says what was delivered.
 * So the tick is not a control any more — it is what this window leaves
 * behind. Filing a record with an artefact marks the deliverable complete;
 * filing one with nothing attached clears it again.
 *
 * The same window reads the record back afterwards, which is the other half of
 * the point: months later the question is never "was it ticked" but "what was
 * delivered, and what happened on the way".
 */
export function DeliveryRecord({
  stageId,
  deliverable,
  startEditing = false,
  onClose,
}: {
  stageId: StageId;
  deliverable: Deliverable;
  /**
   * A filed deliverable opens as what it is — a record — and is changed only
   * once you say so, with the pencil. An open one has nothing to read yet, so
   * it opens ready to be filled in; and the table's own Edit button opens
   * everything ready to be changed, title included.
   */
  startEditing?: boolean;
  onClose: () => void;
}) {
  const save = useAppStore((s) => s.saveDeliverableRecord);
  const rename = useAppStore((s) => s.renameDeliverable);
  const attach = useAppStore((s) => s.attachToDeliverable);
  const detach = useAppStore((s) => s.detachFromDeliverable);
  const [editing, setEditing] = useState(startEditing || !deliverable.done);
  const [note, setNote] = useState(deliverable.note);
  const [title, setTitle] = useState(deliverable.title);
  const [problems, setProblems] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const files = deliverable.attachments;

  return (
    <>
      <div className="dr-scrim" onClick={onClose} />
      <div
        className="dr-win"
        role="dialog"
        aria-modal="true"
        aria-label={`Delivery record — ${deliverable.title}`}
        data-dr={deliverable.id}
      >
        <div className="dr-head">
          <span className="cap">Delivery record</span>
          <span className="spacer" />
          {!editing && (
            <button
              className="dr-edit"
              data-dr-edit
              title="Edit this record"
              aria-label="Edit this record"
              onClick={() => setEditing(true)}
            >
              <PencilIcon />
            </button>
          )}
          <button className="dr-close" data-dr-close aria-label="Close" onClick={onClose}>
            ESC ✕
          </button>
        </div>

        {editing ? (
          <input
            className="dr-title-input"
            data-dr-title
            aria-label="Deliverable title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <h3 className="dr-title">{deliverable.title}</h3>
        )}
        <div className="dr-meta">
          <span>Due {deliverable.due ? fmtDate(deliverable.due) : 'TBD'}</span>
          {deliverable.done && deliverable.completedAt && (
            <span className="dr-done">Delivered {fmtDate(deliverable.completedAt)}</span>
          )}
        </div>

        <span className="dr-label">Development history</span>
        {editing ? (
          <textarea
            id="dr-note"
            className="dr-note"
            data-dr-note
            rows={7}
            placeholder="How this was built, what changed on the way, what a reviewer should know."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        ) : (
          <p className={`dr-note read${deliverable.note ? '' : ' empty'}`} data-dr-note-text>
            {deliverable.note || 'No history was written when this was filed.'}
          </p>
        )}

        <div className="dr-files">
          <span className="cap">Artefact</span>
          <AttachmentList
            files={files}
            onRemove={editing ? (id) => detach(stageId, deliverable.id, id) : undefined}
          />
          {!files.length && (
            <p className="dr-hint" data-dr-empty>
              Nothing attached yet — a deliverable is marked complete by its artefact, not by a
              tick.
            </p>
          )}
          {editing && (
            <>
              <AttachmentPicker
                label="Attach artefact"
                onPick={async (picked) =>
                  setProblems(await attach(stageId, deliverable.id, picked))
                }
              />
              <AttachmentProblems problems={problems} />
            </>
          )}
        </div>

        <div className="dr-foot">
          <span className="dr-hint">
            {!editing
              ? 'Filed. The pencil above reopens it for changes.'
              : files.length
                ? 'Saving files this record and marks the deliverable complete.'
                : 'Saving with nothing attached leaves the deliverable open.'}
          </span>
          <button className="board-btn" data-dr-cancel onClick={onClose}>
            {editing ? 'Cancel' : 'Close'}
          </button>
          {editing && (
            <button
              className="board-btn primary"
              data-dr-save
              onClick={() => {
                const named = title.trim();
                if (named && named !== deliverable.title) rename(stageId, deliverable.id, named);
                save(stageId, deliverable.id, note);
                onClose();
              }}
            >
              Save record
            </button>
          )}
        </div>
      </div>
    </>
  );
}
