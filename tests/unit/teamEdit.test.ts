import { describe, expect, it } from 'vitest';
import { LEAD_ROLE, planTeamEdit } from '@/lib/teamEdit';
import type { Contact, Leader } from '@/data/types';

const grace: Leader = {
  name: 'Grace Park',
  short: 'G. Park',
  email: 'grace@example.com',
  phone: '+1 (408) 555-0110',
};
const nobody: Leader = { name: '', short: '', email: '', phone: '' };

const daniel: Contact = {
  id: 'c1',
  name: 'Daniel Cho',
  role: 'Floorplan owner',
  email: 'daniel@example.com',
  phone: '+1 (408) 555-0111',
};

const draftOf = (c: Contact) => ({
  name: c.name,
  role: c.role,
  email: c.email,
  phone: c.phone,
});

describe('adding someone with a responsibility of their own', () => {
  it('writes one contact and touches the lead field not at all', () => {
    const plan = planTeamEdit({
      leader: grace,
      row: { id: 'new', lead: false },
      draft: { name: 'Sujin Han', role: 'Timing closure', email: 's@x.com', phone: '555' },
      asLead: false,
    });
    expect(plan.leader).toBeUndefined();
    expect(plan.removeContacts).toEqual([]);
    expect(plan.contacts).toEqual([
      { name: 'Sujin Han', role: 'Timing closure', email: 's@x.com', phone: '555' },
    ]);
  });

  /* An id of its own means an edit; without one the store mints a new row. */
  it('carries the id when an existing member is edited', () => {
    const plan = planTeamEdit({
      leader: grace,
      row: { id: 'c1', lead: false },
      draft: { ...draftOf(daniel), role: 'Placement owner' },
      asLead: false,
    });
    expect(plan.contacts).toEqual([{ id: 'c1', ...draftOf(daniel), role: 'Placement owner' }]);
    expect(plan.leader).toBeUndefined();
  });
});

describe('making someone the stage leader', () => {
  /* A stage has one lead field, so naming a new one is also un-naming the old.
     The outgoing lead stays on the stage — losing a name, an email and a phone
     number silently is not a thing a team page should do — with the
     responsibility blank, because "Stage leader" is no longer true of them and
     nothing else is known yet. */
  it('keeps the outgoing lead on the stage, with the responsibility blank', () => {
    const plan = planTeamEdit({
      leader: grace,
      row: { id: 'new', lead: false },
      draft: { name: 'Sujin Han', role: '', email: 's@x.com', phone: '555' },
      asLead: true,
    });
    expect(plan.leader).toEqual({ name: 'Sujin Han', email: 's@x.com', phone: '555' });
    expect(plan.contacts).toEqual([
      { name: 'Grace Park', role: '', email: 'grace@example.com', phone: '+1 (408) 555-0110' },
    ]);
    expect(plan.removeContacts).toEqual([]);
  });

  /* Promoted from the list, they leave it: the lead is the stage's own field
     and a person listed twice is two people to whoever reads the table. */
  it('takes a member out of the list when they become the lead', () => {
    const plan = planTeamEdit({
      leader: grace,
      row: { id: 'c1', lead: false },
      draft: draftOf(daniel),
      asLead: true,
    });
    expect(plan.leader).toEqual({
      name: 'Daniel Cho',
      email: 'daniel@example.com',
      phone: '+1 (408) 555-0111',
    });
    expect(plan.removeContacts).toEqual(['c1']);
    expect(plan.contacts).toEqual([
      { name: 'Grace Park', role: '', email: 'grace@example.com', phone: '+1 (408) 555-0110' },
    ]);
  });

  it('has nobody to stand down when the stage had no lead', () => {
    const plan = planTeamEdit({
      leader: nobody,
      row: { id: 'c1', lead: false },
      draft: draftOf(daniel),
      asLead: true,
    });
    expect(plan.contacts).toEqual([]);
    expect(plan.removeContacts).toEqual(['c1']);
    expect(plan.leader?.name).toBe('Daniel Cho');
  });

  /* Correcting the lead's own row is not a handover, so nobody stands down. */
  it('corrects the lead in place when the lead is the row being saved', () => {
    const plan = planTeamEdit({
      leader: grace,
      row: { id: 'leader', lead: true },
      draft: { ...draftOf(daniel), name: 'Grace Park-Lee' },
      asLead: true,
    });
    expect(plan.leader?.name).toBe('Grace Park-Lee');
    expect(plan.contacts).toEqual([]);
    expect(plan.removeContacts).toEqual([]);
  });
});

describe('standing the leader down', () => {
  /* The dropdown is how a stage loses its lead as well as how it gains one:
     the stage's lead field empties and they carry on as a member. */
  it('empties the lead field and keeps them as a member', () => {
    const plan = planTeamEdit({
      leader: grace,
      row: { id: 'leader', lead: true },
      draft: {
        name: 'Grace Park',
        role: 'Timing closure',
        email: 'grace@example.com',
        phone: '+1 (408) 555-0110',
      },
      asLead: false,
    });
    expect(plan.leader).toEqual({ name: '', email: '', phone: '' });
    expect(plan.contacts).toEqual([
      {
        name: 'Grace Park',
        role: 'Timing closure',
        email: 'grace@example.com',
        phone: '+1 (408) 555-0110',
      },
    ]);
    expect(plan.removeContacts).toEqual([]);
  });
});

describe('the label the table and the dropdown share', () => {
  /* One constant, because a row reading "Stage leader" while the dropdown
     offers "Stage lead" is two names for one thing. */
  it('is the prototype’s wording', () => {
    expect(LEAD_ROLE).toBe('Stage leader');
  });
});
