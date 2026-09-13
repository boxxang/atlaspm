'use client';

import { useState } from 'react';
import { Avatar, IconPlus } from '../shell/icons';

export interface PersonDraft {
  name: string;
  optional: boolean;
}

/**
 * A list of people: the programme's names offered as you type, anyone else
 * accepted as typed. Attendees can be marked optional; the chip says which in
 * words, so the list reads the same without its colours.
 */
export function PeopleField({
  value,
  onChange,
  people,
  label,
  allowOptional = false,
}: {
  value: readonly PersonDraft[];
  onChange: (list: PersonDraft[]) => void;
  people: readonly string[];
  label: string;
  allowOptional?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const listId = `people-${label.replace(/\W+/g, '-').toLowerCase()}`;

  const add = () => {
    const name = draft.trim();
    if (!name) return;
    setDraft('');
    if (value.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    onChange([...value, { name, optional: false }]);
  };

  return (
    <div className="mt-people" data-people={label}>
      {value.length > 0 && (
        <div className="mt-people-list">
          {value.map((p) => (
            <span key={p.name} className="mt-person" data-attendee={p.name}>
              <Avatar name={p.name} small />
              <span>{p.name}</span>
              {allowOptional && (
                <button
                  type="button"
                  className={p.optional ? 'chip' : 'chip on'}
                  aria-pressed={!p.optional}
                  title="Required or optional"
                  onClick={() =>
                    onChange(value.map((x) => (x.name === p.name ? { ...x, optional: !x.optional } : x)))
                  }
                >
                  {p.optional ? 'Optional' : 'Required'}
                </button>
              )}
              <button
                type="button"
                className="x"
                aria-label={`Remove ${p.name}`}
                onClick={() => onChange(value.filter((x) => x.name !== p.name))}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 7, width: '100%' }}>
        <input
          className="lnkin"
          list={listId}
          aria-label={label}
          placeholder="Add a name"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <datalist id={listId}>
          {people.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        <button type="button" className="btn sm" disabled={!draft.trim()} onClick={add}>
          <IconPlus />
          Add
        </button>
      </div>
    </div>
  );
}
