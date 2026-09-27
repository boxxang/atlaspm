/**
 * /lib/people.ts — resolving an item's owner to an email address.
 *
 * Item.owner is free text ("M. Bianchi"), while addresses live on Leader and
 * Contact rows keyed by full name. Until people are first-class rows (the
 * Person/Assignment normalisation), matching is a best-effort lookup over the
 * program's own directory: exact name, the short form the app generates from a
 * name, and a surname fallback.
 *
 * Pure: no DOM.
 */
import type { Contact, Leader, StageId } from '@/data/types';

/** The short form the app writes when saving a leader: "Grace Park" → "G. Park". */
export const shortForm = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : name.trim();
};

const key = (s: string) => s.trim().toLowerCase();
const surname = (s: string) => key(s).split(/\s+/).slice(1).join(' ');

export interface Directory {
  /** owner string (lowercased) → email */
  byName: Map<string, string>;
  bySurname: Map<string, string>;
}

export function buildDirectory(
  leaders: Record<StageId, Leader>,
  contacts: Record<StageId, Contact[]>,
): Directory {
  const byName = new Map<string, string>();
  const bySurname = new Map<string, string>();
  const add = (name: string, email: string) => {
    if (!name || !email) return;
    for (const form of [name, shortForm(name)]) {
      if (!byName.has(key(form))) byName.set(key(form), email);
    }
    const sn = surname(name);
    if (sn && !bySurname.has(sn)) bySurname.set(sn, email);
  };

  for (const id of new Set([...Object.keys(leaders), ...Object.keys(contacts)])) {
    const l = leaders[id];
    if (l) {
      add(l.name, l.email);
      if (l.short && l.email && !byName.has(key(l.short))) byName.set(key(l.short), l.email);
    }
    for (const c of contacts[id] ?? []) add(c.name, c.email);
  }
  return { byName, bySurname };
}

/** null when the directory holds nobody by that name — the draft opens with an
 *  empty To rather than guessing wrong. */
export function resolveEmail(dir: Directory, owner: string): string | null {
  if (!owner?.trim()) return null;
  return dir.byName.get(key(owner)) ?? dir.bySurname.get(surname(owner)) ?? null;
}

/** A member of the programme team, as a picker offers them. */
export interface TeamMember {
  name: string;
  role: string;
  stageId: StageId;
}

/**
 * Everyone on the programme, once each, with the given stage's people first —
 * the list a field that names a person picks from. A person on two stages is
 * listed under the first that names them, in the order given; a name nobody
 * filled in is nobody.
 */
export function teamRoster(
  stageOrder: readonly StageId[],
  leaders: Record<StageId, Leader>,
  contacts: Record<StageId, Contact[]>,
  first?: StageId,
  leadRole = 'Stage lead',
): TeamMember[] {
  const order = first ? [first, ...stageOrder.filter((s) => s !== first)] : [...stageOrder];
  const seen = new Set<string>();
  const out: TeamMember[] = [];
  const add = (name: string, role: string, stageId: StageId) => {
    if (!name.trim() || seen.has(key(name))) return;
    seen.add(key(name));
    out.push({ name: name.trim(), role, stageId });
  };
  for (const id of order) {
    const l = leaders[id];
    if (l?.name) add(l.name, leadRole, id);
    for (const c of contacts[id] ?? []) add(c.name, c.role, id);
  }
  return out;
}
