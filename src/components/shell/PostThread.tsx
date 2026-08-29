'use client';

import { useState } from 'react';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { attachmentUrl, formatBytes } from '@/lib/attachments';
import { fmtDT } from '@/lib/schedule';
import type { ProgramPost } from '@/lib/projectState';
import { uid, useAppStore } from '@/store/useAppStore';
import { Avatar, IconClip } from './icons';
import { useProgramWork } from './useProgramWork';

/** Which post is open for editing or for the question asked before deleting. */
type Mode = { id: string; kind: 'edit' | 'delete' } | null;

/**
 * A thread: posts, the replies under them, and a box to add another.
 *
 * One component for every place the app posts — updates on a step, risks, notes
 * on a stage's key-info board, deliverable handovers — because they are one
 * shape. The prototype made that the point: how a risk was closed is the reply
 * thread under it, and a board that renders headlines only has thrown away the
 * part worth reading.
 *
 * The markup is the prototype's: an avatar beside every post and every reply, a
 * `.who` line carrying the name, the step it is about, the timestamp and the
 * hover actions, and `.txt` under it. Replies do not nest — a reply's parent is
 * always a top-level post — and the reply box appears when Reply is pressed
 * rather than sitting open under every post, so a long thread stays readable.
 *
 * Delete asks first. It is the one action here that cannot be undone, and the
 * others are one click precisely because this one is not.
 */
export function PostThread({
  posts,
  target,
  placeholder,
  /** Offer a "this is a risk" tick — only meaningful on a step. */
  allowRisk = false,
  /** Offer the step picker the mockup puts on an activity's composer. */
  steps,
  /** The step this thread is already about — shown as a chip, not a choice. */
  fixedStep,
  /** Show which step each post is about — an activity's thread does, a step's does not. */
  showStep = false,
  emptyText,
}: {
  posts: ProgramPost[];
  /** Where a new post lands. Replies override the kind and set parentId. */
  target: {
    kind: string;
    activityRef?: string | null;
    stepN?: number | null;
    stageId?: string | null;
    deliverableId?: string | null;
  };
  placeholder: string;
  allowRisk?: boolean;
  steps?: readonly { n: number; text: string }[];
  fixedStep?: number | null;
  showStep?: boolean;
  emptyText: string;
}) {
  const savePost = useAppStore((s) => s.savePost);
  const all = useAppStore((s) => s.posts);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  /* One at a time, as the prototype does: opening the editor on a second post
     closes the first, so there is never more than one half-finished edit. */
  const [mode, setMode] = useState<Mode>(null);
  /* Which flagged posts are still open, resolved once for the thread rather
     than per post — the answer is a property of the programme, not of a row. */
  const { risks } = useProgramWork();
  const live = new Set(risks.map((r) => r.postId));

  const tops = posts
    .filter((p) => !p.parentId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const repliesTo = (id: string) =>
    all
      .filter((p) => p.parentId === id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <div className="thread">
      {tops.length === 0 ? (
        <p className="mono-note" style={{ marginBottom: 14 }}>
          {emptyText}
        </p>
      ) : (
        tops.map((p) => (
          <Post
            key={p.id}
            post={p}
            showStep={showStep}
            live={live.has(p.id)}
            mode={mode}
            setMode={setMode}
            replies={repliesTo(p.id)}
            replying={replyTo === p.id}
            onReply={() => setReplyTo(p.id)}
            onReplyDone={() => setReplyTo(null)}
          />
        ))
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Avatar name={RISK_AUTHOR} />
        <Composer
          placeholder={placeholder}
          allowRisk={allowRisk}
          steps={steps}
          fixedStep={fixedStep}
          onPost={(text, risk, stepN) =>
            savePost({
              ...target,
              id: uid(),
              /* ticking "risk" changes what the post is, not where it lives */
              kind: risk ? 'risk' : target.kind,
              stepN: stepN ?? target.stepN ?? null,
              text,
              author: RISK_AUTHOR,
            })
          }
        />
      </div>
    </div>
  );
}

function Post({
  post,
  replies,
  showStep,
  live,
  mode,
  setMode,
  replying,
  onReply,
  onReplyDone,
}: {
  post: ProgramPost;
  replies: ProgramPost[];
  showStep: boolean;
  live: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
  replying: boolean;
  onReply: () => void;
  onReplyDone: () => void;
}) {
  const savePost = useAppStore((s) => s.savePost);

  return (
    <div className="post" data-post={post.id}>
      <Avatar name={post.author} />
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <WhoLine
          post={post}
          showStep={showStep}
          live={live}
          mode={mode}
          setMode={setMode}
          onReply={onReply}
        />
        <PostBody post={post} mode={mode} setMode={setMode} />
        {showStep && live && <RiskLine />}
        {(replies.length > 0 || replying) && (
          <div className="replies">
            {replies.map((r) => (
              <div className="reply" key={r.id}>
                <Avatar name={r.author} small />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <WhoLine post={r} showStep={false} live={false} mode={mode} setMode={setMode} />
                  <PostBody post={r} mode={mode} setMode={setMode} />
                </div>
              </div>
            ))}
            {replying && (
              <div className="reply">
                <Avatar name={RISK_AUTHOR} small />
                <Composer
                  placeholder="Reply — what moved, and what closed it…"
                  submitLabel="Reply"
                  onCancel={onReplyDone}
                  onPost={(text) => {
                    savePost({
                      id: uid(),
                      kind: 'reply',
                      text,
                      author: RISK_AUTHOR,
                      parentId: post.id,
                    });
                    onReplyDone();
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** The name line: who, what it is about, when, and the actions that hover in. */
function WhoLine({
  post,
  showStep,
  live,
  mode,
  setMode,
  onReply,
}: {
  post: ProgramPost;
  showStep: boolean;
  live: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
  onReply?: () => void;
}) {
  const busy = mode?.id === post.id;
  return (
    <div className="who">
      <b style={{ fontSize: post.parentId ? 12.5 : 13 }}>{post.author}</b>
      {showStep && post.stepN != null && (
        <span className={live ? 'pill risk' : 'pill acc'} style={{ fontSize: 10.5 }}>
          STEP {post.stepN}
        </span>
      )}
      {post.kind === 'risk' &&
        (live ? (
          showStep ? null : (
            <span className="pill risk" style={{ fontSize: 10.5 }}>
              RISK
            </span>
          )
        ) : (
          <span
            className="pill"
            style={{ fontSize: 10.5 }}
            title="the step it was flagged on has been handed over"
          >
            RISK · CLEARED
          </span>
        ))}
      <span className="num" style={{ fontSize: post.parentId ? 11 : 11.5, color: 'var(--ink-3)' }}>
        {fmtDT(post.createdAt)}
      </span>
      {post.editedAt && <span className="edited">edited</span>}
      {!busy && (
        <>
          <span style={{ flexGrow: 1 }} />
          <span className="acts">
            {onReply && (
              <button type="button" onClick={onReply}>
                Reply
              </button>
            )}
            <button type="button" onClick={() => setMode({ id: post.id, kind: 'edit' })}>
              Edit
            </button>
            <button
              type="button"
              className="del"
              onClick={() => setMode({ id: post.id, kind: 'delete' })}
            >
              Delete
            </button>
          </span>
        </>
      )}
    </div>
  );
}

/**
 * The text, or whatever has replaced it: the editor, or the question asked
 * before anything is thrown away.
 */
function PostBody({
  post,
  mode,
  setMode,
}: {
  post: ProgramPost;
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const editPost = useAppStore((s) => s.editPost);
  const deletePost = useAppStore((s) => s.deletePost);
  const here = mode?.id === post.id ? mode.kind : null;
  const stop = () => setMode(null);
  const [draft, setDraft] = useState(post.text);

  if (here === 'edit') {
    return (
      <div className="composer" style={{ marginTop: 6 }}>
        <textarea
          value={draft}
          aria-label="Edit post"
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />
        <div className="bar">
          <span style={{ flexGrow: 1 }} />
          <button type="button" className="btn sm" onClick={stop}>
            Cancel
          </button>
          <button
            type="button"
            className="btn pri sm"
            disabled={!draft.trim()}
            onClick={() => {
              editPost(post.id, draft.trim());
              stop();
            }}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  if (here === 'delete') {
    return (
      <div className="delconf">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c5303a" strokeWidth="2">
          <path d="M12 9v4M12 17h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        Delete this update?
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={stop}>
          Keep
        </button>
        <button
          type="button"
          className="btn sm dng"
          onClick={() => {
            deletePost(post.id);
            stop();
          }}
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="txt">{post.text}</div>
      {post.attachments.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {post.attachments.map((a) => (
            <a
              key={a.id}
              className="clip"
              href={attachmentUrl(a.id)}
              target="_blank"
              rel="noreferrer"
              title={`${a.filename} · ${formatBytes(a.size)}`}
            >
              <IconClip />
              {a.filename}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

const RiskLine = () => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 6,
      fontSize: 11.5,
      color: 'var(--risk-ink)',
    }}
  >
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e5484d" strokeWidth="2">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
    Flagged as a risk on this step
  </div>
);

function Composer({
  placeholder,
  onPost,
  onCancel,
  allowRisk = false,
  steps,
  fixedStep,
  submitLabel = 'Post',
}: {
  placeholder: string;
  onPost: (text: string, risk: boolean, stepN: number | null) => void;
  onCancel?: () => void;
  allowRisk?: boolean;
  steps?: readonly { n: number; text: string }[];
  fixedStep?: number | null;
  submitLabel?: string;
}) {
  const [text, setText] = useState('');
  const [risk, setRisk] = useState(false);
  const [stepN, setStepN] = useState('');

  const post = () => {
    if (!text.trim()) return;
    onPost(text.trim(), risk, stepN ? Number(stepN) : null);
    setText('');
    setRisk(false);
  };

  return (
    <div className="composer">
      <textarea
        value={text}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) post();
          if (e.key === 'Escape' && onCancel) onCancel();
        }}
      />
      <div className="bar">
        {fixedStep != null && <span className="stepsel">Step {fixedStep}</span>}
        {steps && (
          <select
            className="stepsel"
            style={{ minWidth: 0, flexShrink: 1 }}
            value={stepN}
            aria-label="Which step this is about"
            onChange={(e) => setStepN(e.target.value)}
          >
            <option value="">No step</option>
            {steps.map((s) => (
              <option key={s.n} value={s.n}>
                Step {s.n} · {s.text.slice(0, 34)}
              </option>
            ))}
          </select>
        )}
        {allowRisk && (
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--ink-2)' }}
          >
            <input type="checkbox" checked={risk} onChange={(e) => setRisk(e.target.checked)} />
            risk
          </label>
        )}
        {onCancel && (
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>⌘↵ posts · esc cancels</span>
        )}
        <span style={{ flexGrow: 1 }} />
        {onCancel && (
          <button type="button" className="btn sm" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="button" className="btn pri sm" disabled={!text.trim()} onClick={post}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
