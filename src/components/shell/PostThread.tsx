'use client';

import { useState } from 'react';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { attachmentUrl, formatBytes } from '@/lib/attachments';
import { fmtDT } from '@/lib/schedule';
import type { ProgramPost } from '@/lib/projectState';
import { uid, useAppStore } from '@/store/useAppStore';

/**
 * A thread: posts, the replies under them, and a box to add another.
 *
 * One component for every place the app posts — updates on a step, risks, notes
 * on a stage's key-info board, deliverable handovers — because they are one
 * shape. The prototype made that the point: how a risk was closed is the reply
 * thread under it, and a board that renders headlines only has thrown away the
 * part worth reading.
 *
 * Replies do not nest. A reply's parent is always a top-level post, so there is
 * one indent and no argument about the second.
 */
export function PostThread({
  posts,
  target,
  placeholder,
  /** Offer a "this is a risk" tick — only meaningful on a step. */
  allowRisk = false,
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
  emptyText: string;
}) {
  const savePost = useAppStore((s) => s.savePost);
  const all = useAppStore((s) => s.posts);

  const tops = posts
    .filter((p) => !p.parentId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const repliesTo = (id: string) =>
    all
      .filter((p) => p.parentId === id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <div className="pthread">
      <Composer
        placeholder={placeholder}
        allowRisk={allowRisk}
        onPost={(text, risk) =>
          savePost({
            ...target,
            id: uid(),
            /* ticking "risk" changes what the post is, not where it lives */
            kind: risk ? 'risk' : target.kind,
            text,
            author: RISK_AUTHOR,
          })
        }
      />

      {tops.length === 0 ? (
        <p className="prail-hint">{emptyText}</p>
      ) : (
        <ul className="pposts">
          {tops.map((p) => (
            <li key={p.id}>
              <Post post={p} />
              <ul className="preplies">
                {repliesTo(p.id).map((r) => (
                  <li key={r.id}>
                    <Post post={r} />
                  </li>
                ))}
              </ul>
              <Composer
                small
                placeholder="Reply…"
                onPost={(text) =>
                  savePost({ id: uid(), kind: 'reply', text, author: RISK_AUTHOR, parentId: p.id })
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Post({ post }: { post: ProgramPost }) {
  const editPost = useAppStore((s) => s.editPost);
  const deletePost = useAppStore((s) => s.deletePost);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);

  if (editing) {
    return (
      <div className="ppost editing">
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} aria-label="Edit post" />
        <div className="ppost-acts">
          <button
            type="button"
            className="pbtn tiny"
            disabled={!draft.trim()}
            onClick={() => {
              editPost(post.id, draft.trim());
              setEditing(false);
            }}
          >
            Save
          </button>
          <button
            type="button"
            className="pbtn tiny"
            onClick={() => {
              setDraft(post.text);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ppost" data-post={post.id}>
      <div className="ppost-head">
        {post.kind === 'risk' && <span className="ppill risk">Risk</span>}
        <span className="ppost-who">{post.author}</span>
        <span className="ppost-when">{fmtDT(post.createdAt)}</span>
        {post.editedAt && <span className="ppost-when">· edited</span>}
        <span className="pview-spacer" />
        <button type="button" className="ppost-act" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button type="button" className="ppost-act" onClick={() => deletePost(post.id)}>
          Delete
        </button>
      </div>
      <p className="ppost-text">{post.text}</p>
      {post.attachments.length > 0 && (
        <ul className="prail-atts">
          {post.attachments.map((a) => (
            <li key={a.id}>
              <a href={attachmentUrl(a.id)} target="_blank" rel="noreferrer">
                {a.filename}
              </a>
              <span className="prail-hint">{formatBytes(a.size)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Composer({
  placeholder,
  onPost,
  allowRisk = false,
  small = false,
}: {
  placeholder: string;
  onPost: (text: string, risk: boolean) => void;
  allowRisk?: boolean;
  small?: boolean;
}) {
  const [text, setText] = useState('');
  const [risk, setRisk] = useState(false);

  const post = () => {
    if (!text.trim()) return;
    onPost(text.trim(), risk);
    setText('');
    setRisk(false);
  };

  return (
    <div className={small ? 'pcomposer small' : 'pcomposer'}>
      <textarea
        value={text}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={small ? 1 : 2}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="pcomposer-acts">
        {allowRisk && (
          <label className="pcomposer-risk">
            <input type="checkbox" checked={risk} onChange={(e) => setRisk(e.target.checked)} />
            risk
          </label>
        )}
        <button type="button" className="pbtn tiny" disabled={!text.trim()} onClick={post}>
          Post
        </button>
      </div>
    </div>
  );
}
