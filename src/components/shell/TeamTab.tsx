'use client';

import { useState } from 'react';
import type { Contact } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';

/**
 * Who is on a stage: its lead, and everyone else working on it.
 *
 * The lead is a person like any other and is listed with them, because the
 * question the tab answers is "who do I talk to" and a separate box for the
 * lead makes that two questions. The lead is the stage's own field, though, so
 * it is marked rather than duplicated — and it cannot be deleted from here,
 * only renamed.
 *
 * This is the list the step owner picker reads, so somebody added here can be
 * put on a step immediately.
 */
export function TeamTab({ stageId }: { stageId: string }) {
  const contacts = useAppStore((s) => s.contacts)[stageId] ?? [];
  const leader = useAppStore((s) => s.leaders)[stageId];
  const saveContact = useAppStore((s) => s.saveContact);
  const deleteContact = useAppStore((s) => s.deleteContact);
  const saveLeader = useAppStore((s) => s.saveLeader);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="pteam">
      <table className="ptable pboard">
        <thead>
          <tr>
            <th className="pwrapcol">Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Phone</th>
            <th className="mid">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {leader?.name && editing !== 'leader' && (
            <tr data-person="leader">
              <th scope="row" className="pwrap pwrapcol">
                {leader.name}
                <span className="ppill">Lead</span>
              </th>
              <td className="prole">Stage lead</td>
              <td className="prole">{leader.email || '—'}</td>
              <td className="prole">{leader.phone || '—'}</td>
              <td className="mid">
                <button type="button" className="ppost-act" onClick={() => setEditing('leader')}>
                  Edit
                </button>
              </td>
            </tr>
          )}
          {editing === 'leader' && leader && (
            <PersonRow
              person={{ id: 'leader', name: leader.name, role: 'Stage lead', email: leader.email, phone: leader.phone }}
              lockRole
              onCancel={() => setEditing(null)}
              onSave={(p) => {
                saveLeader(stageId, { name: p.name, email: p.email, phone: p.phone });
                setEditing(null);
              }}
            />
          )}

          {contacts.map((c) =>
            editing === c.id ? (
              <PersonRow
                key={c.id}
                person={c}
                onCancel={() => setEditing(null)}
                onSave={(p) => {
                  saveContact(stageId, { ...p, id: c.id });
                  setEditing(null);
                }}
              />
            ) : (
              <tr key={c.id} data-person={c.id}>
                <th scope="row" className="pwrap pwrapcol">
                  {c.name}
                </th>
                <td className="prole">{c.role || '—'}</td>
                <td className="prole">{c.email || '—'}</td>
                <td className="prole">{c.phone || '—'}</td>
                <td className="mid">
                  <button type="button" className="ppost-act" onClick={() => setEditing(c.id)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ppost-act"
                    onClick={() => deleteContact(stageId, c.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ),
          )}

          {editing === 'new' ? (
            <PersonRow
              person={{ id: 'new', name: '', role: '', email: '', phone: '' }}
              onCancel={() => setEditing(null)}
              onSave={(p) => {
                saveContact(stageId, p);
                setEditing(null);
              }}
            />
          ) : (
            <tr>
              <td colSpan={5}>
                <button type="button" className="pbtn tiny" onClick={() => setEditing('new')}>
                  + Add someone
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PersonRow({
  person,
  onSave,
  onCancel,
  lockRole = false,
}: {
  person: Contact;
  onSave: (p: Omit<Contact, 'id'>) => void;
  onCancel: () => void;
  /** The stage lead's role is what they are, not a field. */
  lockRole?: boolean;
}) {
  const [draft, setDraft] = useState({
    name: person.name,
    role: person.role,
    email: person.email,
    phone: person.phone,
  });
  const set = (k: keyof typeof draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <tr className="pperson-edit">
      <td>
        <input value={draft.name} onChange={set('name')} aria-label="Name" placeholder="Name" />
      </td>
      <td>
        <input
          value={draft.role}
          onChange={set('role')}
          aria-label="Role"
          placeholder="Role"
          disabled={lockRole}
        />
      </td>
      <td>
        <input value={draft.email} onChange={set('email')} aria-label="Email" placeholder="Email" />
      </td>
      <td>
        <input value={draft.phone} onChange={set('phone')} aria-label="Phone" placeholder="Phone" />
      </td>
      <td className="mid">
        <button
          type="button"
          className="pbtn tiny"
          disabled={!draft.name.trim()}
          onClick={() => onSave({ ...draft, name: draft.name.trim() })}
        >
          Save
        </button>
        <button type="button" className="ppost-act" onClick={onCancel}>
          Cancel
        </button>
      </td>
    </tr>
  );
}
