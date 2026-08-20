'use client';

import { useState } from 'react';
import { AttachmentList, AttachmentPicker, AttachmentProblems } from './Attachments';
import type { Item, ItemKind, StageId } from '@/data/types';
import { itemDraft } from '@/lib/mailDrafts';
import { resolveEmail } from '@/lib/people';
import { fmtDT, fmtDTFull, fmtDate, toISO } from '@/lib/schedule';
import { KIND_LABELS } from '@/store/modalStore';
import { useAppStore, type ItemFields } from '@/store/useAppStore';
import { useDirectory } from './Board';
import { OwnerSelect } from './OwnerSelect';
import { MailButton } from './MailButton';

/** Status update thread — post, edit in place, delete. */
function StatusUpdates({
  item,
  label,
  editingSuId,
  onEdit,
  onSave,
  onDelete,
  onPost,
  onAttach,
  onDetach,
}: {
  item: Item;
  label: string;
  editingSuId: string | null;
  onEdit: (id: string | null) => void;
  onSave: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onPost: (text: string) => string;
  onAttach: (files: File[], statusUpdateId?: string) => Promise<string[]>;
  onDetach: (attachmentId: string, statusUpdateId?: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [edit, setEdit] = useState('');
  const [pending, setPending] = useState<File[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const updates = [...item.updates].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="su-sec">
      <span className="cap">Status Updates — History</span>
      {updates.length ? (
        updates.map((u) =>
          u.id === editingSuId ? (
            <div className="su-item" key={u.id}>
              {/* editing keeps the original timestamp */}
              <span className="su-date">{fmtDT(u.date)}</span>
              <span className="su-edit-form">
                <textarea
                  className="su-edit-input"
                  value={edit}
                  autoFocus
                  onChange={(e) => setEdit(e.target.value)}
                />
              </span>
              <span className="su-acts" style={{ opacity: 1 }}>
                <button data-su-save={u.id} onClick={() => onSave(u.id, edit.trim())}>
                  Save
                </button>
                <button data-su-cancel onClick={() => onEdit(null)}>
                  Cancel
                </button>
              </span>
            </div>
          ) : (
            <div className="su-item" key={u.id}>
              <span className="su-date">{fmtDT(u.date)}</span>
              {/* .su-text is white-space:pre-wrap, so the attachments live
                  beside it rather than inside it */}
              <span className="su-body">
                <span className="su-text">{u.text}</span>
                <AttachmentList files={u.attachments} onRemove={(id) => onDetach(id, u.id)} />
                <AttachmentPicker
                  label="Attach"
                  onPick={async (files) => setProblems(await onAttach(files, u.id))}
                />
              </span>
              <span className="su-acts">
                <button
                  data-su-edit={u.id}
                  onClick={() => {
                    setEdit(u.text);
                    onEdit(u.id);
                  }}
                >
                  Edit
                </button>
                <button data-su-del={u.id} onClick={() => onDelete(u.id)}>
                  ✕
                </button>
              </span>
            </div>
          ),
        )
      ) : (
        <div className="su-empty">
          No status updates yet — the history of this {label.toLowerCase()} will build up here.
        </div>
      )}
      <div className="su-form">
        <textarea
          className="su-input"
          placeholder="Write a status update…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          data-post
          onClick={async () => {
            const t = draft.trim();
            if (!t) return;
            /* the update has to exist before files can hang off it */
            const suId = onPost(t);
            setDraft('');
            if (pending.length) {
              setProblems(await onAttach(pending, suId));
              setPending([]);
            }
          }}
        >
          Post
        </button>
      </div>
      <div className="su-attach">
        <AttachmentPicker
          label={pending.length ? `${pending.length} file(s) ready` : 'Attach files'}
          onPick={(files) => setPending((prev) => [...prev, ...files])}
        />
        {pending.length > 0 && (
          <>
            <span className="att-pending">
              {pending.map((f) => f.name).join(', ')} — attached when you post
            </span>
            <button className="att-clear" data-clear-pending onClick={() => setPending([])}>
              Clear
            </button>
          </>
        )}
        <AttachmentProblems problems={problems} />
      </div>
    </div>
  );
}

export function ItemView({
  item,
  kind,
  stageId,
  editingSuId,
  onEdit,
  onSuEdit,
  onSuSave,
  onSuDelete,
  onSuPost,
  onAttach,
  onDetach,
}: {
  item: Item;
  kind: ItemKind;
  stageId: StageId;
  editingSuId: string | null;
  onEdit: () => void;
  onSuEdit: (id: string | null) => void;
  onSuSave: (id: string, text: string) => void;
  onSuDelete: (id: string) => void;
  onSuPost: (text: string) => string;
  onAttach: (files: File[], statusUpdateId?: string) => Promise<string[]>;
  onDetach: (attachmentId: string, statusUpdateId?: string) => void;
}) {
  const today = useAppStore((s) => s.today);
  const projectName = useAppStore((s) => s.projectName);
  const dir = useDirectory();
  const [attachProblems, setAttachProblems] = useState<string[]>([]);
  const label = KIND_LABELS[kind];
  const dueOver = !!item.due && item.due < today;

  return (
    <div className="item-view">
      <div className="iv-title">{item.title}</div>
      <div className="iv-meta">
        <span>
          <span className="cap">Owner</span>
          {item.owner || '—'}
        </span>
        <span>
          <span className="cap">Target Due</span>
          <span style={dueOver ? { color: 'var(--risk)', fontWeight: 600 } : undefined}>
            {item.due ? fmtDate(item.due) : '—'}
          </span>
        </span>
        <span>
          <span className="cap">Updated</span>
          {fmtDTFull(item.updated)}
        </span>
      </div>
      <p className={`iv-body${item.body ? '' : ' empty'}`}>
        {item.body || 'No details recorded yet.'}
      </p>
      <div className="iv-attach">
        <AttachmentList files={item.attachments} onRemove={(id) => onDetach(id)} />
        <AttachmentPicker onPick={async (files) => setAttachProblems(await onAttach(files))} />
        <AttachmentProblems problems={attachProblems} />
      </div>
      <div className="iv-actions">
        <button data-edit onClick={onEdit}>
          Edit
        </button>
        <MailButton
          title={`Email ${item.owner || 'the owner'} about this ${label.toLowerCase()}`}
          label="Email owner"
          noRecipientHint="owner not in this program's contacts"
          draft={itemDraft({
            projectName,
            stageId,
            kind,
            item,
            today,
            ownerEmail: resolveEmail(dir, item.owner),
          })}
        />
      </div>
      <StatusUpdates
        item={item}
        label={label}
        editingSuId={editingSuId}
        onEdit={onSuEdit}
        onSave={onSuSave}
        onDelete={onSuDelete}
        onPost={onSuPost}
        onAttach={onAttach}
        onDetach={onDetach}
      />
    </div>
  );
}

export function ItemEditor({
  item,
  kind,
  stageId,
  onSave,
  onDelete,
}: {
  item: Item | null;
  kind: ItemKind;
  stageId: StageId;
  onSave: (f: ItemFields) => void;
  onDelete?: () => void;
}) {
  const label = KIND_LABELS[kind];
  const [f, setF] = useState({
    title: item?.title ?? '',
    owner: item?.owner ?? '',
    due: item?.due ? toISO(item.due) : '',
    body: item?.body ?? '',
  });

  return (
    <div className="item-editor">
      <input
        className="ie-title"
        placeholder={`${label} title`}
        value={f.title}
        autoFocus
        onChange={(e) => setF({ ...f, title: e.target.value })}
      />
      <div className="ie-field">
        <span className="cap">Owner</span>
        <OwnerSelect
          stageId={stageId}
          value={f.owner}
          onChange={(owner) => setF({ ...f, owner })}
        />
      </div>
      <div className="ie-field">
        <span className="cap">Target Due</span>
        <input
          className="ie-due"
          type="date"
          value={f.due}
          onChange={(e) => setF({ ...f, due: e.target.value })}
        />
      </div>
      <textarea
        className="ie-body"
        placeholder="Details — status, owners, next steps, mitigation…"
        value={f.body}
        onChange={(e) => setF({ ...f, body: e.target.value })}
      />
      <div className="ie-actions">
        <button
          data-save
          onClick={() => {
            const title = f.title.trim();
            if (!title) {
              document.querySelector<HTMLInputElement>('.ie-title')?.focus();
              return;
            }
            onSave({
              title,
              owner: f.owner.trim(),
              body: f.body.trim(),
              due: f.due ? fromISOLocal(f.due) : null,
            });
          }}
        >
          Save
        </button>
        {item && (
          <button data-del onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
      <p className="session-note">
        Entries live in this browser session (prototype) — persistence arrives with the
        production build.
      </p>
    </div>
  );
}

const fromISOLocal = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
