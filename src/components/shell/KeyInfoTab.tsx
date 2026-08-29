'use client';

import { useRef, useState } from 'react';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { attachmentUrl, formatBytes } from '@/lib/attachments';
import { fmtDate, fmtDT } from '@/lib/schedule';
import type { ProgramPost } from '@/lib/projectState';
import { uid, useAppStore } from '@/store/useAppStore';
import { ctVar, CTHead, type Col } from './ctable';
import { Avatar, IconClip, IconEmptyList, IconFile, IconPlus } from './icons';

/**
 * A stage's key-info board.
 *
 * What a TPM has to know and what the programme learned along the way, written
 * down where it can be found again. It is not a list of tasks and has no owner
 * or due date — only who posted it and when.
 *
 * A board rather than a feed, which is the mockup's judgement and the right
 * one: a note is looked up months later by a title somebody half-remembers, so
 * the titles have to be readable as a list and the list has to be filterable.
 * The note itself opens under its row.
 *
 * A note is still one post. Its first line is the title — the thing the list
 * shows and the filter searches — and the rest is the body. That keeps notes,
 * updates, risks and handovers one shape rather than four.
 */
const COLS: Col[] = [
  ['ic', 18, ''],
  ['title', null, 'NOTE'],
  ['files', 62, 'FILES'],
  ['who', 160, 'POSTED BY'],
  ['when', 92, 'WHEN'],
];

const titleOf = (text: string) => text.split('\n')[0].trim();
const bodyOf = (text: string) => text.split('\n').slice(1).join('\n').trim();
const joinNote = (title: string, body: string) =>
  body.trim() ? `${title.trim()}\n${body.trim()}` : title.trim();

export function KeyInfoTab({ stageId }: { stageId: string }) {
  const posts = useAppStore((s) => s.posts);
  const deletePost = useAppStore((s) => s.deletePost);
  const notes = posts
    .filter((p) => p.stageId === stageId && p.kind === 'note')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  /* 'new' writes a note that does not exist yet; an id edits the one it names. */
  const [editing, setEditing] = useState<string | null>(null);

  const needle = filter.trim().toLowerCase();
  const shown = needle ? notes.filter((n) => n.text.toLowerCase().includes(needle)) : notes;

  return (
    <>
      <div className="filterbar">
        <input
          className="lnkin"
          style={{ width: 270, flexGrow: 0 }}
          placeholder="Filter these notes…"
          aria-label="Filter these notes"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          type="button"
          className="btn pri sm"
          data-note-new
          onClick={() => {
            setEditing('new');
            setOpen(null);
          }}
        >
          <IconPlus light />
          New note
        </button>
        <span style={{ flexGrow: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {notes.length} note{notes.length === 1 ? '' : 's'} · what this program has taught so far
        </span>
      </div>

      {editing === 'new' && (
        <div style={{ padding: '14px 20px 2px' }}>
          <NoteEditor
            note={null}
            onCancel={() => setEditing(null)}
            onSave={(title, body) => {
              const id = uid();
              useAppStore.getState().savePost({
                id,
                kind: 'note',
                text: joinNote(title, body),
                author: RISK_AUTHOR,
                stageId,
              });
              setEditing(null);
              setOpen(id);
            }}
          />
        </div>
      )}

      {shown.length === 0 ? (
        <div className="empty">
          <IconEmptyList />
          <p className="mono-note" style={{ maxWidth: '52ch' }}>
            {needle
              ? 'No note here says that.'
              : 'Nothing recorded yet. This is where what you learn about the program goes — a foundry answer, a decision and its reason, a number somebody will ask for again.'}
          </p>
        </div>
      ) : (
        <div
          className={open ? 'ctable focused' : 'ctable'}
          data-board
          style={{ ['--ct' as string]: ctVar(COLS) }}
        >
          <CTHead cols={COLS} />
          {shown.map((n) => {
            const isOpen = open === n.id;
            return (
              <div key={n.id} style={{ display: 'contents' }}>
                <button
                  type="button"
                  className={isOpen ? 'trow open' : 'trow'}
                  data-note={n.id}
                  style={{ alignItems: 'start', paddingTop: 10, paddingBottom: 10 }}
                  onClick={() => {
                    setOpen(isOpen ? null : n.id);
                    setEditing(null);
                  }}
                >
                  <span style={{ marginTop: 3, display: 'inline-flex' }}>
                    <IconFile />
                  </span>
                  <span style={{ minWidth: 0, fontWeight: 550, lineHeight: 1.45, textAlign: 'left' }}>
                    {titleOf(n.text)}
                  </span>
                  <span style={{ justifySelf: 'start', marginTop: 2 }}>
                    {n.attachments.length ? (
                      <span className="clip">
                        <IconClip />
                        {n.attachments.length}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>—</span>
                    )}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      minWidth: 0,
                      marginTop: 1,
                    }}
                  >
                    <Avatar name={n.author} small />
                    <span className="ell" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                      {n.author}
                    </span>
                  </span>
                  <span
                    className="num"
                    style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}
                  >
                    {fmtDate(n.editedAt ?? n.createdAt)}
                  </span>
                </button>
                {isOpen && (
                  <div className="notewrap">
                    {editing === n.id ? (
                      <NoteEditor
                        note={n}
                        onCancel={() => setEditing(null)}
                        onSave={(title, body) => {
                          useAppStore.getState().editPost(n.id, joinNote(title, body));
                          setEditing(null);
                        }}
                      />
                    ) : (
                      <NoteCard
                        note={n}
                        onEdit={() => setEditing(n.id)}
                        onDelete={() => {
                          deletePost(n.id);
                          setOpen(null);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/** One note, opened: who wrote it, what it says, and what came with it. */
function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: ProgramPost;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const attachToPost = useAppStore((s) => s.attachToPost);
  const detachFromPost = useAppStore((s) => s.detachFromPost);
  const [problems, setProblems] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const body = bodyOf(note.text);

  return (
    <div className="notecard">
      <div className="notecard-hd">
        <Avatar name={note.author} small />
        <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>Posted by {note.author}</span>
        <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
          {fmtDT(note.createdAt)}
        </span>
        {note.editedAt && <span className="edited">edited {fmtDT(note.editedAt)}</span>}
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="btn sm" onClick={() => file.current?.click()}>
          <IconPlus />
          File
        </button>
        <button type="button" className="btn sm dng" onClick={() => setAsking(true)}>
          Delete
        </button>
      </div>
      <div className="notecard-body">
        <input
          ref={file}
          type="file"
          multiple
          className="visually-hidden"
          aria-label="Attach a file to this note"
          onChange={async (e) => {
            const picked = e.target.files;
            if (!picked?.length) return;
            setProblems(await attachToPost(note.id, picked));
            e.target.value = '';
          }}
        />
        {asking ? (
          <div className="delconf">
            Delete this note and everything attached to it?
            <span style={{ flexGrow: 1 }} />
            <button type="button" className="btn sm" onClick={() => setAsking(false)}>
              Keep
            </button>
            <button type="button" className="btn sm dng" onClick={onDelete}>
              Delete
            </button>
          </div>
        ) : (
          <div className="noteprose-wrap">
            <div className="noteprose">
              {body ? (
                <div className="noteprose-text">{body}</div>
              ) : (
                <p className="mono-note">
                  The title is the whole of this note so far. Edit to add what is behind it — the
                  numbers, the source, the decision it came from.
                </p>
              )}
            </div>
          </div>
        )}
        {note.attachments.length > 0 && (
          <div className="noteatt">
            <div className="cap" style={{ marginBottom: 9 }}>
              Attachments{' '}
              <span className="pill" style={{ fontSize: 10.5 }}>
                {note.attachments.length}
              </span>
            </div>
            {note.attachments.map((a) => (
              <div className="att" key={a.id}>
                <span className="ic">
                  <IconFile />
                </span>
                <span style={{ flexGrow: 1, minWidth: 0 }}>
                  <a
                    className="ell"
                    style={{ display: 'block', fontSize: 12.5, fontWeight: 500 }}
                    href={attachmentUrl(a.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {a.filename}
                  </a>
                  <span
                    className="num"
                    style={{ fontSize: 11, color: 'var(--ink-4)', display: 'block', marginTop: 2 }}
                  >
                    File · {formatBytes(a.size)}
                  </span>
                </span>
                <button
                  type="button"
                  className="x"
                  title="Remove"
                  aria-label={`Remove ${a.filename}`}
                  onClick={() => detachFromPost(note.id, a.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {problems.map((p) => (
          <p className="mono-note late" key={p}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Writing one. The title is a field of its own because it is what the list
 * shows and the filter searches — burying it in the first line of a textarea
 * would work and would not look like it mattered.
 */
function NoteEditor({
  note,
  onSave,
  onCancel,
}: {
  note: ProgramPost | null;
  onSave: (title: string, body: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(note ? titleOf(note.text) : '');
  const [body, setBody] = useState(note ? bodyOf(note.text) : '');

  return (
    <div className="notecard">
      <div className="notecard-hd">
        <input
          className="lnkin"
          style={{ fontSize: 14.5, fontWeight: 600 }}
          autoComplete="off"
          autoFocus
          placeholder="A title someone will search for"
          aria-label="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="notecard-body">
        <textarea
          className="notebody"
          placeholder="What you learned, and where it came from. Numbers, decisions and the reason behind them — the things you will be asked for again."
          aria-label="Note"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && title.trim()) onSave(title, body);
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div style={{ display: 'flex', gap: 7, marginTop: 11, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>⌘↵ saves · esc cancels</span>
          <span style={{ flexGrow: 1 }} />
          <button type="button" className="btn sm" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn pri sm"
            /* a note needs a title to be found by */
            disabled={!title.trim()}
            onClick={() => onSave(title, body)}
          >
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}
