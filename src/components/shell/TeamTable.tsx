'use client';

import { useState } from 'react';
import type { Contact, Leader } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, IconPlus } from './icons';

/**
 * Who is on a stage.
 *
 * Everyone wears their initials on a colour drawn from their name, because the
 * question this answers is "who do I talk to" and a name alone is slower to
 * find in a list of seventy-three than a face-shaped thing is.
 *
 * The stage lead is listed with everyone else, marked by a tint and a bolder
 * name rather than lifted into a box of their own — a separate box makes one
 * question into two. The lead is the stage's own field, so it can be corrected
 * here but not removed.
 */
const COLS = { gridTemplateColumns: '26px 1fr 220px 200px 140px 64px' };

export interface Person {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  lead: boolean;
}

/** The stage's people: its lead first, then everyone added to it. */
export function peopleOf(leader: Leader | undefined, contacts: readonly Contact[]): Person[] {
  const out: Person[] = [];
  if (leader?.name)
    out.push({
      id: 'leader',
      name: leader.name,
      role: 'Stage leader',
      email: leader.email,
      phone: leader.phone,
      lead: true,
    });
  for (const c of contacts)
    out.push({ id: c.id, name: c.name, role: c.role, email: c.email, phone: c.phone, lead: false });
  return out;
}

export function TeamTable({ stageId }: { stageId: string }) {
  const contacts = useAppStore((s) => s.contacts)[stageId] ?? [];
  const leader = useAppStore((s) => s.leaders)[stageId];
  const saveContact = useAppStore((s) => s.saveContact);
  const deleteContact = useAppStore((s) => s.deleteContact);
  const saveLeader = useAppStore((s) => s.saveLeader);
  const [editing, setEditing] = useState<string | null>(null);

  const people = peopleOf(leader, contacts);

  const save = (p: Person, draft: Omit<Person, 'id' | 'lead'>) => {
    if (p.lead) saveLeader(stageId, { name: draft.name, email: draft.email, phone: draft.phone });
    else if (p.id === 'new') saveContact(stageId, { ...draft });
    else saveContact(stageId, { ...draft, id: p.id });
    setEditing(null);
  };

  return (
    <>
      <div className="thead" style={{ ...COLS, marginTop: 10 }}>
        <span />
        <span>NAME</span>
        <span>RESPONSIBILITY</span>
        <span>EMAIL</span>
        <span>PHONE</span>
        <span />
      </div>

      {people.map((p) =>
        editing === p.id ? (
          <PersonForm
            key={p.id}
            person={p}
            onCancel={() => setEditing(null)}
            onSave={(d) => save(p, d)}
            onRemove={p.lead ? undefined : () => {
              deleteContact(stageId, p.id);
              setEditing(null);
            }}
          />
        ) : (
          <div
            key={p.id}
            className="trow feedrow"
            data-person={p.id}
            style={{ ...COLS, background: p.lead ? 'var(--accent-wash)' : undefined }}
          >
            <Avatar name={p.name} />
            <span className="ell" style={p.lead ? { fontWeight: 600 } : undefined}>
              {p.name}
            </span>
            <span className="ell" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
              {p.role}
            </span>
            <span className="ell" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
              {p.email}
            </span>
            <span className="num" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
              {p.phone}
            </span>
            <span className="acts" style={{ justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditing(p.id)}>
                Edit
              </button>
            </span>
          </div>
        ),
      )}

      {editing === 'new' ? (
        <PersonForm
          person={{ id: 'new', name: '', role: '', email: '', phone: '', lead: false }}
          onCancel={() => setEditing(null)}
          onSave={(d) => save({ id: 'new', lead: false, ...d }, d)}
        />
      ) : (
        <button
          type="button"
          className="trow"
          style={{ gridTemplateColumns: '26px 1fr', color: 'var(--ink-4)' }}
          data-add-person={stageId}
          onClick={() => setEditing('new')}
        >
          <span
            style={{
              display: 'inline-flex',
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: '1.5px dashed var(--line-strong)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconPlus />
          </span>
          <span style={{ fontSize: 13 }}>Add someone to this stage</span>
        </button>
      )}
    </>
  );
}

function PersonForm({
  person,
  onSave,
  onCancel,
  onRemove,
}: {
  person: Person;
  onSave: (p: Omit<Person, 'id' | 'lead'>) => void;
  onCancel: () => void;
  onRemove?: () => void;
}) {
  const [d, setD] = useState({
    name: person.name,
    role: person.role,
    email: person.email,
    phone: person.phone,
  });
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setD((v) => ({ ...v, [k]: e.target.value }));

  return (
    <>
      <div className="trow" style={{ ...COLS, background: 'var(--sunken)' }}>
        {person.name ? <Avatar name={person.name} /> : <span />}
        <input className="lnkin" aria-label="Name" placeholder="Name" value={d.name} onChange={set('name')} />
        <input
          className="lnkin"
          aria-label="Responsibility"
          placeholder="Responsibility"
          value={d.role}
          onChange={set('role')}
          /* the lead's responsibility is what they are, not a field */
          disabled={person.lead}
        />
        <input className="lnkin" aria-label="Email" placeholder="Email" value={d.email} onChange={set('email')} />
        <input className="lnkin" aria-label="Phone" placeholder="Phone" value={d.phone} onChange={set('phone')} />
        <span style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
          <button className="btn sm" type="button" onClick={onCancel} aria-label="Cancel">
            ✕
          </button>
          <button
            className="btn pri sm"
            type="button"
            disabled={!d.name.trim()}
            onClick={() => onSave({ ...d, name: d.name.trim() })}
          >
            Save
          </button>
        </span>
      </div>
      {onRemove && (
        <div
          className="trow"
          style={{ gridTemplateColumns: '26px 1fr', background: 'var(--sunken)', minHeight: 30 }}
        >
          <span />
          <span>
            <button
              type="button"
              style={{ fontSize: 11.5, color: 'var(--risk-ink)' }}
              onClick={onRemove}
            >
              Remove from this stage
            </button>
          </span>
        </div>
      )}
    </>
  );
}
