'use client';

import { useEffect, useState } from 'react';
import type { Deliverable, StageId } from '@/data/types';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { AttachmentList, AttachmentPicker, AttachmentProblems } from './Attachments';

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
  onClose,
}: {
  stageId: StageId;
  deliverable: Deliverable;
  onClose: () => void;
}) {
  const save = useAppStore((s) => s.saveDeliverableRecord);
  const attach = useAppStore((s) => s.attachToDeliverable);
  const detach = useAppStore((s) => s.detachFromDeliverable);
  const [note, setNote] = useState(deliverable.note);
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
          <button className="dr-close" data-dr-close aria-label="Close" onClick={onClose}>
            ESC ✕
          </button>
        </div>

        <h3 className="dr-title">{deliverable.title}</h3>
        <div className="dr-meta">
          <span>Due {deliverable.due ? fmtDate(deliverable.due) : 'TBD'}</span>
          {deliverable.done && deliverable.completedAt && (
            <span className="dr-done">Delivered {fmtDate(deliverable.completedAt)}</span>
          )}
        </div>

        <label className="dr-label" htmlFor="dr-note">
          Development history
        </label>
        <textarea
          id="dr-note"
          className="dr-note"
          data-dr-note
          rows={7}
          placeholder="How this was built, what changed on the way, what a reviewer should know."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="dr-files">
          <span className="cap">Artefact</span>
          <AttachmentList files={files} onRemove={(id) => detach(stageId, deliverable.id, id)} />
          {!files.length && (
            <p className="dr-hint" data-dr-empty>
              Nothing attached yet — a deliverable is marked complete by its artefact, not by a
              tick.
            </p>
          )}
          <AttachmentPicker
            label="Attach artefact"
            onPick={async (picked) =>
              setProblems(await attach(stageId, deliverable.id, picked))
            }
          />
          <AttachmentProblems problems={problems} />
        </div>

        <div className="dr-foot">
          <span className="dr-hint">
            {files.length
              ? 'Saving files this record and marks the deliverable complete.'
              : 'Saving with nothing attached leaves the deliverable open.'}
          </span>
          <button className="board-btn" data-dr-cancel onClick={onClose}>
            Cancel
          </button>
          <button
            className="board-btn primary"
            data-dr-save
            onClick={() => {
              save(stageId, deliverable.id, note);
              onClose();
            }}
          >
            Save record
          </button>
        </div>
      </div>
    </>
  );
}
