'use client';

import { useMemo } from 'react';
import { ME } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';

/**
 * Everyone the programme knows by name: each stage's lead and contacts, and
 * the TPM whose tool this is.
 *
 * The same directory the Team pages list and the step panel's owner picker
 * offers. People are names in this app rather than rows, so a meeting names
 * them the same way — and a name typed that is not in the list is kept, the
 * way a guest from a supplier would be.
 */
export function usePeople(): string[] {
  const leaders = useAppStore((s) => s.leaders);
  const contacts = useAppStore((s) => s.contacts);
  return useMemo(() => {
    const names = new Set<string>([ME]);
    for (const l of Object.values(leaders)) if (l?.name) names.add(l.name);
    for (const list of Object.values(contacts)) for (const c of list) if (c.name) names.add(c.name);
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [leaders, contacts]);
}
