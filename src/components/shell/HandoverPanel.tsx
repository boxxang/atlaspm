'use client';

import { useMemo } from 'react';
import { useProgramActivities } from './useProgramActivities';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { attachmentUrl, formatBytes } from '@/lib/attachments';
import { deliverableStep, handoverComplete } from '@/lib/deliverableStatus';
import type { ProgramPost } from '@/lib/projectState';
import { fmtDate, fmtDT, fromISO, toISO } from '@/lib/schedule';
import { uid, useAppStore } from '@/store/useAppStore';
import { Avatar, IconFile, IconPlus } from './icons';
import { useDeliverableRefs } from './useDeliverableRefs';

/**
 * Handing a key deliverable over.
 *
 * One post, not three controls: a body saying what was handed over, the
 * artefacts themselves, and the date it was accepted. All three, or the
 * deliverable is not complete — the prototype's point being that "complete"
 * should mean the thing exists and somebody said so, rather than that a box was
 * ticked. The date field stays disabled until the first two are there, so the
 * rule is visible before it is enforced.
 *
 * It opens inline under the row it belongs to, as the mockup opens it: the row
 * is the title, so the card does not repeat it, and the rest of the list stays
 * on screen around it.
 *
 * Comments hang off the handover like any other reply, so the argument about
 * whether it was really finished lives with the claim that it was.
 *
 * The card is keyed on the deliverable where it is rendered, so picking a
 * different one remounts it. The draft body is local state seeded from what is
 * stored, and syncing that from a prop in an effect is how you get a card that
 * throws away what somebody was halfway through typing.
 */
export function HandoverPanel({
  stageId,
  deliverableId,
  projectId,
}: {
  stageId: string;
  deliverableId: string;
  projectId: string;
}) {
  const activitySteps = useProgramActivities();
  /* Which activity hands over which deliverable — the programme's own list,
     since a template can change it. */
  const producers = useMemo(
    () =>
      Object.keys(activitySteps).map((ref) => ({
        ref,
        produces: activitySteps[ref].r.map(([id]) => id),
        stepCount: activitySteps[ref].s.length,
      })),
    [activitySteps],
  );

  const deliverable = useAppStore((s) => s.deliverables)[stageId]?.find(
    (d) => d.id === deliverableId,
  );
  const posts = useAppStore((s) => s.posts);
  const savePost = useAppStore((s) => s.savePost);
  const editPost = useAppStore((s) => s.editPost);
  const deletePost = useAppStore((s) => s.deletePost);
  const attachToHandover = useAppStore((s) => s.attachToHandover);
  const detachFromHandover = useAppStore((s) => s.detachFromHandover);
  const syncHandoverDone = useAppStore((s) => s.syncHandoverDone);
  const refOf = useDeliverableRefs();

  const handover = posts.find((p) => p.deliverableId === deliverableId && p.kind === 'handover');
  const [draft, setDraft] = useState(handover?.text ?? '');
  /* The date is a draft too. Attaching a file has to create the record before
     the file can hang off it, and if that write also carried the body the card
     would flip out of the editor mid-sentence. So nothing anybody typed is
     stored until Post — the record an attachment creates has an empty body,
     which is exactly what "not posted yet" means here. */
  const [dateDraft, setDateDraft] = useState<string>('');
  const [problems, setProblems] = useState<string[]>([]);
  /* null while the handover reads as posted; 'edit' reopens it, 'delete' asks. */
  const [mode, setMode] = useState<'edit' | 'delete' | null>(null);
  const [commenting, setCommenting] = useState(false);
  /* Which comment is open for editing, or being asked about before deletion.
     One at a time, as everywhere else a post can be edited. */
  const [comment, setComment] = useState<{ id: string; kind: 'edit' | 'delete' } | null>(null);
  const file = useRef<HTMLInputElement>(null);

  if (!deliverable) return null;

  const files = handover?.attachments ?? [];
  const ref = refOf.get(deliverableId) ?? null;
  const step = deliverableStep(ref, producers);
  const replies = posts
    .filter((p) => p.parentId === handover?.id)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  /* Attaching a file creates the record before anything has been written, so an
     empty body still means "not posted yet" and keeps the editor open. */
  const editing = !handover || !handover.text || mode === 'edit';

  /* The post has to exist before a file can hang off it. */
  const ensureRecord = (): string => {
    if (handover) return handover.id;
    const id = uid();
    savePost({ id, kind: 'handover', text: '', author: RISK_AUTHOR, deliverableId, doneAt: null });
    return id;
  };
  const commit = () => {
    const at = dateDraft ? fromISO(dateDraft) : null;
    if (handover) editPost(handover.id, draft.trim(), at);
    else
      savePost({
        id: uid(),
        kind: 'handover',
        text: draft.trim(),
        author: RISK_AUTHOR,
        deliverableId,
        doneAt: at,
      });
    /* The deliverable's flag is derived from the handover, so it is recomputed
       here rather than set — posting is the only thing that can change it. */
    syncHandoverDone(stageId, deliverableId);
    setMode(null);
  };

  const canDate = !!(draft.trim() && files.length);

  return (
    <div className="delivwrap">
      <div className="delivcard" data-handover={deliverableId}>
        <div className="notecard-hd">
          {ref && <span className="ref">{ref}</span>}
          <span className="cap">Handover</span>
          <span style={{ flexGrow: 1 }} />
          {step && (
            <Link
              className="btn sm"
              href={`/p/${projectId}/stage/${stageId}/activity?step=${step.act}:${step.n}`}
            >
              Open {step.act} step {step.n} →
            </Link>
          )}
          {handover && !editing && (
            <>
              <button
                type="button"
                className="btn sm"
                onClick={() => {
                  setDraft(handover.text);
                  setDateDraft(handover.doneAt ? toISO(handover.doneAt) : '');
                  setMode('edit');
                }}
              >
                Edit
              </button>
              <button type="button" className="btn sm dng" onClick={() => setMode('delete')}>
                Delete
              </button>
            </>
          )}
        </div>

        <div className="notecard-body">
          {mode === 'delete' ? (
            <div className="delconf">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c5303a"
                strokeWidth="2"
              >
                <path d="M12 9v4M12 17h.01" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              Delete this handover, its attachments and its comments?
              <span style={{ flexGrow: 1 }} />
              <button type="button" className="btn sm" onClick={() => setMode(null)}>
                Keep
              </button>
              <button
                type="button"
                className="btn sm dng"
                onClick={() => {
                  if (handover) deletePost(handover.id);
                  setDraft('');
                  setMode(null);
                }}
              >
                Delete
              </button>
            </div>
          ) : editing ? (
            <>
              <textarea
                className="notebody"
                style={{ minHeight: 104 }}
                value={draft}
                aria-label="What was handed over"
                placeholder="What was handed over, and who accepted it…"
                onChange={(e) => setDraft(e.target.value)}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  marginTop: 10,
                  flexWrap: 'wrap',
                }}
              >
                <button type="button" className="btn sm" onClick={() => file.current?.click()}>
                  <IconPlus />
                  File
                </button>
                <input
                  ref={file}
                  type="file"
                  multiple
                  className="visually-hidden"
                  aria-label="Attach an artefact"
                  onChange={async (e) => {
                    const picked = e.target.files;
                    if (!picked?.length) return;
                    const id = ensureRecord();
                    setProblems(await attachToHandover(stageId, deliverableId, id, picked));
                    e.target.value = '';
                  }}
                />
                <span style={{ flexGrow: 1 }} />
                <span
                  style={{ fontSize: 11.5, color: canDate ? 'var(--ink-2)' : 'var(--ink-4)' }}
                >
                  Completed on
                </span>
                <input
                  type="date"
                  className="dateinp"
                  aria-label="Completed on"
                  disabled={!canDate}
                  title={
                    canDate
                      ? 'leave empty to record the handover without closing it'
                      : 'needs a body and an attachment first'
                  }
                  value={dateDraft}
                  onChange={(e) => setDateDraft(e.target.value)}
                />
                {handover?.text && (
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => {
                      setDraft(handover.text);
                      setDateDraft(handover.doneAt ? toISO(handover.doneAt) : '');
                      setMode(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  className="btn pri sm"
                  disabled={!draft.trim()}
                  onClick={commit}
                >
                  {handover?.text ? 'Save' : 'Post'}
                </button>
              </div>

              {files.length > 0 ? (
                <div className="noteatt">
                  {files.map((a) => (
                    <Artefact
                      key={a.id}
                      file={a}
                      when={handover?.createdAt ?? null}
                      onRemove={() => detachFromHandover(stageId, deliverableId, a.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="mono-note" style={{ marginTop: 11 }}>
                  Attach the file or link that <b>is</b> this deliverable — a handover with
                  nothing handed over cannot be completed.
                </p>
              )}
              {problems.map((p) => (
                <p className="mono-note late" key={p}>
                  {p}
                </p>
              ))}
            </>
          ) : (
            handover && (
              <div className="post">
                <Avatar name={handover.author} />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div className="who">
                    <b style={{ fontSize: 13 }}>{handover.author}</b>
                    <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                      {fmtDT(handover.createdAt)}
                    </span>
                    {handover.editedAt && <span className="edited">edited</span>}
                    {handoverComplete(handover) && handover.doneAt && (
                      <span
                        className="pill"
                        style={{
                          fontSize: 10.5,
                          background: 'var(--ok-soft)',
                          color: 'var(--ok)',
                          fontWeight: 600,
                        }}
                      >
                        Completed {fmtDate(handover.doneAt)}
                      </span>
                    )}
                  </div>
                  <div className="txt" style={{ whiteSpace: 'pre-wrap' }}>
                    {handover.text}
                  </div>
                  {files.length > 0 && (
                    <div className="noteatt" style={{ marginTop: 12, paddingTop: 11 }}>
                      {files.map((a) => (
                        <Artefact
                          key={a.id}
                          file={a}
                          when={handover.createdAt}
                          onRemove={() => detachFromHandover(stageId, deliverableId, a.id)}
                        />
                      ))}
                    </div>
                  )}

                  <div className="replies xreplies">
                    {replies.map((r) => (
                      <Reply
                        key={r.id}
                        reply={r}
                        editing={comment?.id === r.id ? comment.kind : null}
                        onEdit={() => setComment({ id: r.id, kind: 'edit' })}
                        onDelete={() => setComment({ id: r.id, kind: 'delete' })}
                        onStop={() => setComment(null)}
                      />
                    ))}
                    {commenting ? (
                      <div className="reply">
                        <Avatar name={RISK_AUTHOR} small />
                        <Comment
                          onCancel={() => setCommenting(false)}
                          onPost={(text) => {
                            savePost({
                              id: uid(),
                              kind: 'reply',
                              text,
                              author: RISK_AUTHOR,
                              parentId: handover.id,
                            });
                            setCommenting(false);
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="addreply"
                        onClick={() => setCommenting(true)}
                      >
                        + Comment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * One comment on a handover.
 *
 * It takes the same three actions every other post takes — read, correct,
 * remove — because it is the same thing. A comment that can only be deleted
 * makes a typo permanent or makes the argument disappear, and neither is what
 * somebody reaching for it wants.
 */
function Reply({
  reply,
  editing,
  onEdit,
  onDelete,
  onStop,
}: {
  reply: ProgramPost;
  editing: 'edit' | 'delete' | null;
  onEdit: () => void;
  onDelete: () => void;
  onStop: () => void;
}) {
  const editPost = useAppStore((s) => s.editPost);
  const deletePost = useAppStore((s) => s.deletePost);
  const [draft, setDraft] = useState(reply.text);

  return (
    <div className="reply" data-comment={reply.id}>
      <Avatar name={reply.author} small />
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        {editing !== 'edit' && (
          <div className="who">
            <b style={{ fontSize: 12.5 }}>{reply.author}</b>
            <span className="num" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              {fmtDT(reply.createdAt)}
            </span>
            {reply.editedAt && <span className="edited">edited</span>}
            {editing === null && (
              <>
                <span style={{ flexGrow: 1 }} />
                <span className="acts">
                  <button type="button" onClick={onEdit}>
                    Edit
                  </button>
                  <button type="button" className="del" onClick={onDelete}>
                    Delete
                  </button>
                </span>
              </>
            )}
          </div>
        )}

        {editing === 'edit' ? (
          <div className="composer">
            <textarea
              value={draft}
              aria-label="Edit comment"
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setDraft(reply.text);
                  onStop();
                }
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && draft.trim()) {
                  editPost(reply.id, draft.trim());
                  onStop();
                }
              }}
            />
            <div className="bar">
              <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>⌘↵ saves · esc cancels</span>
              <span style={{ flexGrow: 1 }} />
              <button
                type="button"
                className="btn sm"
                onClick={() => {
                  setDraft(reply.text);
                  onStop();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn pri sm"
                disabled={!draft.trim()}
                onClick={() => {
                  editPost(reply.id, draft.trim());
                  onStop();
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : editing === 'delete' ? (
          <div className="delconf">
            Delete this comment?
            <span style={{ flexGrow: 1 }} />
            <button type="button" className="btn sm" onClick={onStop}>
              Keep
            </button>
            <button
              type="button"
              className="btn sm dng"
              onClick={() => {
                deletePost(reply.id);
                onStop();
              }}
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="txt">{reply.text}</div>
        )}
      </div>
    </div>
  );
}

/** One artefact row: what it is, how big, when it arrived, and a way to remove it. */
function Artefact({
  file,
  when,
  onRemove,
}: {
  file: { id: string; filename: string; size: number };
  when: Date | null;
  onRemove: () => void;
}) {
  return (
    <div className="att">
      <span className="ic">
        <IconFile />
      </span>
      <span style={{ flexGrow: 1, minWidth: 0 }}>
        <a
          className="ell"
          style={{ display: 'block', fontSize: 12.5, fontWeight: 500 }}
          href={attachmentUrl(file.id)}
          target="_blank"
          rel="noreferrer"
        >
          {file.filename}
        </a>
        <span
          className="num"
          style={{ fontSize: 11, color: 'var(--ink-4)', display: 'block', marginTop: 2 }}
        >
          File · {formatBytes(file.size)}
          {when ? ` · ${fmtDT(when)}` : ''}
        </span>
      </span>
      <button
        type="button"
        className="x"
        title="Remove"
        aria-label={`Remove ${file.filename}`}
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  );
}

function Comment({
  onPost,
  onCancel,
}: {
  onPost: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState('');
  return (
    <div className="composer" style={{ flexGrow: 1 }}>
      <textarea
        value={text}
        placeholder="Comment on this handover…"
        aria-label="Comment on this handover"
        onChange={(e) => setText(e.target.value)}
      />
      <div className="bar">
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn pri sm"
          disabled={!text.trim()}
          onClick={() => onPost(text.trim())}
        >
          Comment
        </button>
      </div>
    </div>
  );
}
