'use client';

import { useState } from 'react';
import type { Contact, StageId } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';

const BLANK = { name: '', role: '', email: '', phone: '' };

function ContactForm({
  contact,
  onSave,
  onCancel,
}: {
  contact: Contact | null;
  onSave: (c: Omit<Contact, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState(contact ? { ...contact } : { ...BLANK });
  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="c-row editing" data-cid={contact?.id ?? ''}>
      <span>
        <input className="cf-name" placeholder="Name" value={f.name} onChange={set('name')} autoFocus />
      </span>
      <span>
        <input className="cf-role" placeholder="Responsibility" value={f.role} onChange={set('role')} />
      </span>
      <span>
        <input className="cf-email" type="email" placeholder="email@example.com" value={f.email} onChange={set('email')} />
      </span>
      <span>
        <input className="cf-phone" placeholder="+1 (000) 000-0000" value={f.phone} onChange={set('phone')} />
      </span>
      <span className="c-acts">
        <button
          data-c-save
          onClick={() => {
            if (!f.name.trim()) return;
            onSave({
              ...(contact ? { id: contact.id } : {}),
              name: f.name.trim(),
              role: f.role.trim(),
              email: f.email.trim(),
              phone: f.phone.trim(),
            });
          }}
        >
          Save
        </button>
        <button data-c-cancel onClick={onCancel}>
          ✕
        </button>
      </span>
    </div>
  );
}

export function Contacts({ stageId, editId }: { stageId: StageId; editId: string | null }) {
  const team = useAppStore((s) => s.contacts[stageId]);
  const save = useAppStore((s) => s.saveContact);
  const del = useAppStore((s) => s.deleteContact);
  const openInline = useAppStore((s) => s.openInline);
  const setEdit = (id: string | null) => openInline(stageId, 'stage', id);

  const commit = (c: Omit<Contact, 'id'> & { id?: string }) => {
    save(stageId, c);
    setEdit(null);
  };

  return (
    <div className="contacts-sec">
      <div className="c-head">
        <span className="cap">Engineering Contacts</span>
        <span className="note" style={{ fontSize: '.66em', color: 'var(--ink-3)' }}>
          {team.length} member{team.length === 1 ? '' : 's'}
        </span>
        <span className="spacer" />
        <button className="board-btn" data-c-add onClick={() => setEdit('new')}>
          + Add Member
        </button>
      </div>
      <div className="c-cols">
        <span>Name</span>
        <span>Responsibility</span>
        <span>Email</span>
        <span>Phone</span>
        <span />
      </div>
      {team.map((c) =>
        c.id === editId ? (
          <ContactForm contact={c} onSave={commit} onCancel={() => setEdit(null)} key={c.id} />
        ) : (
          <div className="c-row" key={c.id}>
            <span className="c-name">{c.name}</span>
            <span>{c.role}</span>
            <span className="mono">{c.email}</span>
            <span className="mono">{c.phone}</span>
            <span className="c-acts">
              <button data-c-edit={c.id} onClick={() => setEdit(c.id)}>
                Edit
              </button>
              <button data-c-del={c.id} onClick={() => del(stageId, c.id)}>
                ✕
              </button>
            </span>
          </div>
        ),
      )}
      {editId === 'new' && (
        <ContactForm contact={null} onSave={commit} onCancel={() => setEdit(null)} />
      )}
    </div>
  );
}
