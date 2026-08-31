'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { fmtDate } from '@/lib/schedule';
import { useAppStore, type ItemFields } from '@/store/useAppStore';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import type { Item } from '@/data/types';
import { ctVar, CTHead, type Col } from './ctable';
import { Avatar, IconMessage, IconPlus } from './icons';
import { useDeliverableRefs } from './useDeliverableRefs';
import { useStageSteps } from './useStageSteps';

/**
 * The communication board: where the people on this program talk to each other.
 *
 * Not a work list — the Activity tab is the work. This is the thread somebody
 * starts when a decision needs making, an answer is needed from another team,
 * or something happened that the rest of the stage has to know. So the two
 * facts a post is useless without are the ones the table leads with: what it is
 * about, and who raised it.
 *
 * ABOUT is the post's own claim, not a guess. A post can name the activity it
 * concerns and the step of it, and a post about the stage in general says so
 * rather than pretending to a precision it does not have.
 *
 * POSTED BY is who opened the thread, which is not who is carrying the work.
 * Owner answers the second question; this answers the first, and on a board the
 * first is what tells you whom to reply to.
 *
 * Opening a post opens it as a window, because reading a thread is not
 * something to do in a table row: the body is there in full, so are the
 * comments, and edit and delete are behind it rather than on the row where they
 * would be hit while scanning.
 */
const COLS: Col[] = [
  ['chk', 16, ''],
  ['title', null, 'POST'],
  ['about', 132, 'ABOUT'],
  ['by', 132, 'POSTED BY'],
  ['comments', 76, 'COMMENTS'],
  ['due', 84, 'DUE'],
];

type Status = 'all' | 'open' | 'done' | 'late';
const STATUS: { key: Status; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'late', label: 'Past due' },
  { key: 'done', label: 'Done' },
];

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '');
const fromIso = (s: string): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/* One shared empty array, so a stage with no posts keeps the same identity
   between renders and the memo below is not rebuilt on every one. */
const NO_ITEMS: readonly Item[] = [];

/** What a post is about, in the words the board prints. */
const aboutOf = (it: Item): string | null =>
  it.activityRef ? (it.stepN ? `${it.activityRef} · step ${it.stepN}` : it.activityRef) : null;

/** The fields of an existing post, so a save that changes one keeps the rest. */
const fieldsOf = (it: Item): ItemFields => ({
  title: it.title,
  owner: it.owner,
  body: it.body,
  due: it.due,
  deliverableId: it.deliverableId ?? null,
  author: it.author,
  activityRef: it.activityRef ?? null,
  stepN: it.stepN ?? null,
});

export function CommsTab({ stageId }: { stageId: string }) {
  const items = useAppStore((s) => s.content)[stageId]?.activities ?? NO_ITEMS;
  const deliverables = useAppStore((s) => s.deliverables)[stageId] ?? [];
  const today = useAppStore((s) => s.today);
  const saveItem = useAppStore((s) => s.saveItem);
  const activities = useStageSteps(stageId);
  const tagOf = useDeliverableRefs();

  /* 'new' composes a post that does not exist yet; an id opens the one it names */
  const [open, setOpen] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('all');
  const [who, setWho] = useState('');
  const [menu, setMenu] = useState<'status' | 'who' | null>(null);

  const posters = useMemo(
    () => [...new Set(items.map((i) => i.author || i.owner).filter(Boolean))].sort(),
    [items],
  );

  const isLate = (it: Item) => !it.done && !!it.due && it.due < today;
  const shown = items.filter((it) => {
    if (who && (it.author || it.owner) !== who) return false;
    if (status === 'open') return !it.done;
    if (status === 'done') return it.done;
    if (status === 'late') return isLate(it);
    return true;
  });

  const opened = open && open !== 'new' ? (items.find((i) => i.id === open) ?? null) : null;

  if (items.length === 0 && open !== 'new') {
    return (
      <>
        <div className="empty">
          <IconMessage large />
          <p className="mono-note" style={{ maxWidth: '52ch' }}>
            Nothing posted on this stage yet. This is where the people on the program talk to
            each other — a decision that needs making, an answer needed from another team,
            something the rest of the stage has to know.
          </p>
          <button className="btn pri sm" type="button" onClick={() => setOpen('new')} data-add-entry>
            <IconPlus light />
            New post
          </button>
        </div>
        {open === 'new' && (
          <PostWindow
            stageId={stageId}
            item={null}
            deliverables={deliverables}
            activities={activities}
            onClose={() => setOpen(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="filterbar">
        <div className="menu">
          <button
            className="btn sm"
            type="button"
            data-status-filter
            onClick={() => setMenu(menu === 'status' ? null : 'status')}
          >
            Status: {STATUS.find((s) => s.key === status)?.label}
          </button>
          {menu === 'status' && (
            <div className="menu-pop left">
              {STATUS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={'mi' + (s.key === status ? ' on' : '')}
                  data-status={s.key}
                  onClick={() => {
                    setStatus(s.key);
                    setMenu(null);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="menu">
          <button
            className="btn sm"
            type="button"
            data-poster-filter
            onClick={() => setMenu(menu === 'who' ? null : 'who')}
          >
            Posted by: {who || 'Anyone'}
          </button>
          {menu === 'who' && (
            <div className="menu-pop left">
              <button
                type="button"
                className={'mi' + (who === '' ? ' on' : '')}
                onClick={() => {
                  setWho('');
                  setMenu(null);
                }}
              >
                Anyone
              </button>
              {posters.map((o) => (
                <button
                  key={o}
                  type="button"
                  className={'mi' + (o === who ? ' on' : '')}
                  onClick={() => {
                    setWho(o);
                    setMenu(null);
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn pri sm" type="button" data-add-entry onClick={() => setOpen('new')}>
          <IconPlus light />
          New post
        </button>
        <span style={{ flexGrow: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {shown.length === items.length
            ? 'What the people on this stage are asking each other'
            : `${shown.length} of ${items.length} posts`}
        </span>
      </div>

      <div className="ctable" data-board style={{ ['--ct' as string]: ctVar(COLS) }}>
        <CTHead cols={COLS} />
        {shown.map((it) => {
          const late = isLate(it);
          const latest = [...it.updates].sort((a, b) => b.date.getTime() - a.date.getTime())[0];
          const about = aboutOf(it);
          const towards = deliverables.find((d) => d.id === it.deliverableId);
          const ref = towards ? (tagOf.get(towards.id) ?? null) : null;
          return (
            /* A div, not a button: the row carries a checkbox, and a button may
               not sit inside one. Every other table here does the same. */
            <div
              key={it.id}
              className="trow"
              data-item={it.id}
              onClick={() => setOpen(it.id)}
              style={{ alignItems: 'start', paddingTop: 10, paddingBottom: 10 }}
            >
              <span onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="cbx"
                  checked={it.done}
                  aria-label={it.done ? 'Reopen this post' : 'Mark this post settled'}
                  title={it.done ? 'Settled' : late ? 'Past due' : 'Open'}
                  onChange={(e) =>
                    saveItem(stageId, 'activities', it.id, {
                      ...fieldsOf(it),
                      done: e.target.checked,
                    })
                  }
                />
              </span>
              <span style={{ minWidth: 0 }}>
                <span
                  className="wrapcell"
                  style={{
                    display: 'block',
                    fontWeight: 500,
                    textAlign: 'left',
                    lineHeight: 1.4,
                    color: it.done ? 'var(--ink-2)' : undefined,
                  }}
                >
                  {it.title}
                </span>
                {latest ? (
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 3 }}>
                    <IconMessage />
                    <span
                      className="num"
                      style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}
                    >
                      {fmtDate(latest.date)}
                    </span>
                    <span
                      className="wrapcell"
                      style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}
                    >
                      {latest.author ? `${latest.author}: ` : ''}
                      {latest.text}
                    </span>
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: 'var(--ink-4)',
                      marginTop: 3,
                      textAlign: 'left',
                    }}
                  >
                    No replies yet
                  </span>
                )}
              </span>
              <span style={{ justifySelf: 'start', minWidth: 0 }} data-about={about ?? ''}>
                {about ? (
                  <span className="pill acc" style={{ fontSize: 10.5 }}>
                    {about}
                  </span>
                ) : (
                  <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>Stage-wide</span>
                )}
                {ref && (
                  <span
                    className="pill"
                    style={{ fontSize: 10, marginTop: 3 }}
                    title={towards?.title}
                  >
                    {ref}
                  </span>
                )}
              </span>
              <span
                style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}
                data-poster={it.author || it.owner}
              >
                <Avatar name={it.author || it.owner} small />
                <span className="ell" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                  {it.author || it.owner}
                </span>
              </span>
              <span
                className="num"
                style={{ fontSize: 12.5, color: 'var(--ink-3)' }}
                data-comments={it.updates.length}
              >
                {it.updates.length || '—'}
              </span>
              <span
                className="num"
                style={{ fontSize: 12.5, color: late ? 'var(--risk)' : 'var(--ink-2)' }}
              >
                {it.due ? fmtDate(it.due) : '—'}
              </span>
            </div>
          );
        })}

        <div className="trow" data-add-row onClick={() => setOpen('new')} style={{ color: 'var(--ink-4)' }}>
          <span />
          <span style={{ textAlign: 'left' }}>Post something to this stage…</span>
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      {(opened || open === 'new') && (
        <PostWindow
          stageId={stageId}
          item={opened}
          deliverables={deliverables}
          activities={activities}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

/**
 * One post, as a window: what was said, what it is about, who said it, and the
 * conversation under it.
 *
 * Reading is the default and editing is a mode, because a board is read far
 * more often than it is written — opening a thread into a form would put every
 * reader one keystroke from changing what somebody else wrote.
 */
function PostWindow({
  stageId,
  item,
  deliverables,
  activities,
  onClose,
}: {
  stageId: string;
  item: Item | null;
  deliverables: readonly { id: string; title: string }[];
  activities: readonly { ref: string; title: string; steps: readonly { n: number; text: string }[] }[];
  onClose: () => void;
}) {
  const box = useRef<HTMLDialogElement>(null);
  const saveItem = useAppStore((s) => s.saveItem);
  const deleteItem = useAppStore((s) => s.deleteItem);
  const postUpdate = useAppStore((s) => s.postUpdate);
  const saveUpdate = useAppStore((s) => s.saveUpdate);
  const deleteUpdate = useAppStore((s) => s.deleteUpdate);

  const [editing, setEditing] = useState(item === null);
  const [asking, setAsking] = useState(false);
  const [comment, setComment] = useState('');
  const [editComment, setEditComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const [title, setTitle] = useState(item?.title ?? '');
  const [body, setBody] = useState(item?.body ?? '');
  const [owner, setOwner] = useState(item?.owner ?? '');
  const [due, setDue] = useState(iso(item?.due ?? null));
  const [act, setAct] = useState(item?.activityRef ?? '');
  const [stepN, setStepN] = useState(item?.stepN != null ? String(item.stepN) : '');
  const [delivers, setDelivers] = useState(item?.deliverableId ?? '');

  /* Escape and the backdrop close it; the browser handles the focus trap. */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', cancel);
    return () => el.removeEventListener('cancel', cancel);
  }, [onClose]);

  const steps = activities.find((a) => a.ref === act)?.steps ?? [];
  const about = item ? aboutOf(item) : null;

  const commit = () => {
    if (!title.trim()) return;
    saveItem(stageId, 'activities', item?.id ?? null, {
      title: title.trim(),
      owner: owner.trim(),
      body,
      due: fromIso(due),
      deliverableId: delivers || null,
      /* Who raised it is written once. An edit changes what the post says,
         never who is on the hook for having said it. */
      author: item?.author || RISK_AUTHOR,
      activityRef: act || null,
      stepN: act && stepN ? Number(stepN) : null,
    });
    if (item) setEditing(false);
    else onClose();
  };

  const comments = item ? [...item.updates].sort((a, b) => a.date.getTime() - b.date.getTime()) : [];

  return (
    <dialog className="dlg" ref={box} data-post-window aria-label={item ? item.title : 'New post'}>
      <div className="dlg-hd">
        <IconMessage />
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>
          {item ? 'Post' : 'New post'}
        </span>
        {about && (
          <span className="pill acc" style={{ fontSize: 10.5 }}>
            {about}
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose} data-post-close>
          Close
        </button>
      </div>

      <div className="dlg-body">
        {editing ? (
          <>
            <label className="dlg-field">
              <span className="dlg-label">Subject</span>
              <span className="dlg-hint">What somebody scanning the board needs to see.</span>
              <span className="dlg-control">
                <input
                  className="lnkin"
                  style={{ flexGrow: 1, fontWeight: 600 }}
                  autoFocus
                  autoComplete="off"
                  data-entry-title
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </span>
            </label>
            <label className="dlg-field">
              <span className="dlg-label">Post</span>
              <span className="dlg-hint">
                What you are asking, deciding or telling the rest of the stage.
              </span>
              <span className="dlg-control">
                <textarea
                  className="notebody"
                  style={{ minHeight: 96, width: '100%' }}
                  data-entry-body
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </span>
            </label>
            <label className="dlg-field">
              <span className="dlg-label">What it is about</span>
              <span className="dlg-hint">
                The activity this concerns, and the step of it if you know which. Leave it blank
                for something that belongs to the stage rather than to one piece of work.
              </span>
              <span className="dlg-control">
                <select
                  className="lnkin"
                  data-entry-activity
                  value={act}
                  onChange={(e) => {
                    setAct(e.target.value);
                    setStepN('');
                  }}
                >
                  <option value="">Stage-wide</option>
                  {activities.map((a) => (
                    <option key={a.ref} value={a.ref}>
                      {a.ref} — {a.title}
                    </option>
                  ))}
                </select>
                <select
                  className="lnkin"
                  data-entry-step
                  disabled={!act}
                  value={stepN}
                  onChange={(e) => setStepN(e.target.value)}
                >
                  <option value="">Any step</option>
                  {steps.map((s) => (
                    <option key={s.n} value={s.n}>
                      Step {s.n} — {s.text}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="dlg-field">
              <span className="dlg-label">Owner and date</span>
              <span className="dlg-hint">
                Who is on it, and when it needs an answer. A post past its date shows as overdue.
              </span>
              <span className="dlg-control">
                <input
                  className="lnkin"
                  autoComplete="off"
                  placeholder="Who is on it"
                  data-entry-owner
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
                <input
                  className="lnkin"
                  type="date"
                  data-entry-due
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
                <select
                  className="lnkin"
                  data-entry-delivers
                  value={delivers}
                  onChange={(e) => setDelivers(e.target.value)}
                >
                  <option value="">Towards nothing on the list</option>
                  {deliverables.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          </>
        ) : (
          item && (
            <>
              <div className="post-head">
                <Avatar name={item.author || item.owner} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.35 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                    Posted by <b style={{ color: 'var(--ink-2)' }}>{item.author || item.owner}</b>
                    {' · '}
                    {fmtDate(item.updated)}
                    {item.owner && item.owner !== (item.author || item.owner)
                      ? ` · owner ${item.owner}`
                      : ''}
                    {item.due ? ` · due ${fmtDate(item.due)}` : ''}
                  </div>
                </div>
              </div>
              {item.body ? (
                <p className="post-body-txt">{item.body}</p>
              ) : (
                <p className="mono-note" style={{ margin: '10px 0' }}>
                  No detail was written — the subject is the whole post.
                </p>
              )}

              <div className="dlg-field">
                <span className="dlg-label">
                  {comments.length ? `${comments.length} comment${comments.length > 1 ? 's' : ''}` : 'Comments'}
                </span>
                <div className="board-comments">
                  {comments.map((c) => (
                    <div className="board-comment" key={c.id} data-comment={c.id}>
                      <Avatar name={c.author || item.owner} small />
                      <div style={{ minWidth: 0, flexGrow: 1 }}>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                          <b style={{ color: 'var(--ink-2)' }}>{c.author || item.owner}</b>
                          {' · '}
                          {fmtDate(c.date)}
                        </div>
                        {editComment === c.id ? (
                          <>
                            <textarea
                              className="notebody"
                              style={{ minHeight: 56, width: '100%', marginTop: 4 }}
                              data-comment-edit
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                              <button
                                type="button"
                                className="btn sm"
                                onClick={() => setEditComment(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn pri sm"
                                data-comment-save
                                onClick={() => {
                                  saveUpdate(stageId, 'activities', item.id, c.id, commentText);
                                  setEditComment(null);
                                }}
                              >
                                Save
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="post-body-txt" style={{ margin: '3px 0 0' }}>
                              {c.text}
                            </p>
                            <div className="board-comment-acts">
                              <button
                                type="button"
                                data-comment-edit-open
                                onClick={() => {
                                  setEditComment(c.id);
                                  setCommentText(c.text);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="dng"
                                data-comment-delete
                                onClick={() => deleteUpdate(stageId, 'activities', item.id, c.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="board-comment">
                    <Avatar name={RISK_AUTHOR} small />
                    <div style={{ flexGrow: 1 }}>
                      <textarea
                        className="notebody"
                        style={{ minHeight: 58, width: '100%' }}
                        placeholder="Reply to this post…"
                        aria-label="Comment"
                        data-comment-box
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && comment.trim()) {
                            postUpdate(stageId, 'activities', item.id, comment.trim());
                            setComment('');
                          }
                        }}
                      />
                      <div style={{ display: 'flex', gap: 7, marginTop: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>⌘↵ posts</span>
                        <span style={{ flexGrow: 1 }} />
                        <button
                          type="button"
                          className="btn pri sm"
                          data-comment-post
                          disabled={!comment.trim()}
                          onClick={() => {
                            postUpdate(stageId, 'activities', item.id, comment.trim());
                            setComment('');
                          }}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>

      <div className="dlg-foot">
        {item &&
          !editing &&
          (asking ? (
            <>
              <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                Delete this post and its comments?
              </span>
              <button type="button" className="btn sm" onClick={() => setAsking(false)}>
                Keep
              </button>
              <button
                type="button"
                className="btn sm dng"
                data-entry-delete
                onClick={() => {
                  deleteItem(stageId, 'activities', item.id);
                  onClose();
                }}
              >
                Delete
              </button>
            </>
          ) : (
            <button type="button" className="btn sm dng" data-entry-ask onClick={() => setAsking(true)}>
              Delete
            </button>
          ))}
        <span style={{ flexGrow: 1 }} />
        {editing ? (
          <>
            <button
              type="button"
              className="btn sm"
              onClick={() => (item ? setEditing(false) : onClose())}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn pri sm"
              data-entry-save
              disabled={!title.trim()}
              onClick={commit}
            >
              {item ? 'Save post' : 'Post it'}
            </button>
          </>
        ) : (
          <button type="button" className="btn sm" data-entry-edit onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>
    </dialog>
  );
}
