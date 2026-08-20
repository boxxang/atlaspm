'use client';

import type { StageId } from '@/data/types';
import { shortForm } from '@/lib/people';
import { useAppStore } from '@/store/useAppStore';

export interface OwnerChoice {
  /** What gets stored on the item — the short form the app writes elsewhere. */
  value: string;
  label: string;
  group: 'leader' | 'contact';
}

/**
 * Who can own something in this stage: the stage leader and the engineering
 * contacts recorded against it. Stored as the short form ("M. Bianchi"), which
 * is what the seed and the leader editor already write, so the boards stay
 * consistent and lib/people.ts can still resolve an address from it.
 */
export function useOwnerChoices(stageId: StageId): OwnerChoice[] {
  const leader = useAppStore((s) => s.leaders[stageId]);
  const contacts = useAppStore((s) => s.contacts[stageId]);

  const choices: OwnerChoice[] = [];
  const seen = new Set<string>();
  const push = (name: string, group: OwnerChoice['group']) => {
    const value = shortForm(name);
    if (!value || seen.has(value)) return;
    seen.add(value);
    choices.push({ value, label: `${name} (${value})`, group });
  };

  if (leader?.name) push(leader.name, 'leader');
  for (const c of contacts ?? []) push(c.name, 'contact');
  return choices;
}

/**
 * A dropdown rather than a text field, so owners come from the people actually
 * recorded on the stage. A value that predates the contact list — or whose
 * contact has since been deleted — stays selectable rather than being silently
 * rewritten.
 */
export function OwnerSelect({
  stageId,
  value,
  onChange,
  className = 'ie-owner',
}: {
  stageId: StageId;
  value: string;
  onChange: (owner: string) => void;
  className?: string;
}) {
  const choices = useOwnerChoices(stageId);
  const known = choices.some((c) => c.value === value);
  const leaders = choices.filter((c) => c.group === 'leader');
  const contacts = choices.filter((c) => c.group === 'contact');

  return (
    <select
      className={className}
      value={value}
      aria-label="Owner"
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">— Unassigned</option>
      {value && !known && <option value={value}>{value} — not in this stage&rsquo;s contacts</option>}
      {leaders.length > 0 && (
        <optgroup label="Stage leader">
          {leaders.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </optgroup>
      )}
      {contacts.length > 0 && (
        <optgroup label="Engineering contacts">
          {contacts.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </optgroup>
      )}
      {choices.length === 0 && (
        <option value="" disabled>
          Add engineering contacts to this stage first
        </option>
      )}
    </select>
  );
}
