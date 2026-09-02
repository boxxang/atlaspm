import type { Contact, Leader } from '@/data/types';

/**
 * What saving one row of a stage's team does.
 *
 * A stage's people come from two places: `Leader`, which is the stage's own
 * field and holds exactly one person, and `Contact`, which is a list. The team
 * table shows them as one list because "who is on this stage" is one question,
 * and the Responsibility column is where the two are told apart — choosing
 * `Stage leader` writes the stage's field, anything else writes a contact.
 *
 * That makes one gesture able to move a person between two tables, which is
 * why the arithmetic lives here rather than in the form. Naming a new lead is
 * also un-naming the old one, and the old one must not simply vanish: a team
 * page that loses a name, an email and a phone number without being asked is
 * worse than one that cannot edit at all.
 *
 * Pure: no DOM, no database. The caller applies the plan through the store.
 */

/** The one wording, shared by the table's lead row and the dropdown. */
export const LEAD_ROLE = 'Stage leader';

export interface PersonDraft {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface TeamPlan {
  /** The stage's lead field, when this save changes it. Absent means leave it. */
  leader?: { name: string; email: string; phone: string };
  /** Contacts to write. Without an id, a row that does not exist yet. */
  contacts: ({ id?: string } & Omit<Contact, 'id'>)[];
  /** Contacts to drop — someone who has just become the stage's own field. */
  removeContacts: string[];
}

/** The id the table gives the synthesised lead row; never a contact's id. */
const LEAD_ROW = 'leader';

export function planTeamEdit(input: {
  leader: Leader | undefined;
  /** The row being saved. `lead` is what it was, not what it is becoming. */
  row: { id: string; lead: boolean };
  draft: PersonDraft;
  /** What the Responsibility dropdown says now. */
  asLead: boolean;
}): TeamPlan {
  const { leader, row, draft, asLead } = input;
  const plan: TeamPlan = { contacts: [], removeContacts: [] };

  if (asLead) {
    plan.leader = { name: draft.name, email: draft.email, phone: draft.phone };
    /* Already the lead: this is a correction, not a handover, so nobody
       stands down and nothing joins or leaves the list. */
    if (row.lead) return plan;

    /* Promoted out of the list: a person shown twice is two people to whoever
       reads the table. A row that was never saved has nothing to remove. */
    if (row.id !== 'new') plan.removeContacts.push(row.id);

    if (leader?.name.trim()) {
      plan.contacts.push({
        name: leader.name,
        /* Blank rather than a guess: "Stage leader" has stopped being true of
           them and nothing else is known. The field is there to be filled in. */
        role: '',
        email: leader.email,
        phone: leader.phone,
      });
    }
    return plan;
  }

  /* Standing down: the stage's field empties and they carry on as a member.
     This is the only way a stage loses its lead, and it does not lose them. */
  if (row.lead) {
    plan.leader = { name: '', email: '', phone: '' };
    plan.contacts.push({ ...draft });
    return plan;
  }

  plan.contacts.push(row.id === 'new' || row.id === LEAD_ROW ? { ...draft } : { id: row.id, ...draft });
  return plan;
}
