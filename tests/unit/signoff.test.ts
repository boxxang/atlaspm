import { describe, expect, it } from 'vitest';
import {
  approversOf,
  checklistCompletedOn,
  confirmEntry,
  consistencyWarning,
  emptySignoff,
  entryOf,
  flagOf,
  nextId,
  parseSignoff,
  reopenEntry,
  summarize,
  type ItemEntry,
  type SignoffItem,
  type SignoffState,
} from '@/lib/signoff';

/**
 * A gate confirmed item by item. The owner brings each item's evidence from
 * Not updated to Under review; the stage lead or the TPM confirms it, which
 * confirms the evidence with it; reopening sends both back to the start.
 */
const ITEMS: SignoffItem[] = [
  { id: 'B-01', section: 'Baseline', item: 'Final database', target: 'Recorded' },
  { id: 'C-01', section: 'Checks', item: 'Static timing', target: 'Signed off' },
  { id: 'X-01', section: 'Exit criteria', item: 'Every waiver signed', target: 'Met' },
];

const good: ItemEntry = {
  result: 'ok',
  evidence: 'sta/final/summary.rpt',
  evidenceOwner: 'Timing lead',
  status: 'Confirmed',
  lead: 'Confirmed',
  comment: '',
  confirmedBy: 'Tomas Rivera',
  confirmedOn: '2027-05-16',
};

const allConfirmed = (): SignoffState => {
  const s = emptySignoff();
  for (const it of ITEMS) s.items[it.id] = { ...good };
  return s;
};

describe('a row is flagged when its evidence does not support it', () => {
  it('flags nothing on a blank row, and nothing on a supported confirmation', () => {
    expect(flagOf(entryOf(emptySignoff(), 'C-01'), [])).toBe('');
    expect(flagOf(good, [])).toBe('');
  });

  it('names the first thing to fix', () => {
    expect(flagOf({ ...good, evidence: ' ' }, [])).toBe('Evidence missing');
    expect(flagOf({ ...good, confirmedBy: '' }, [])).toBe('Confirmed by missing');
    expect(flagOf({ ...good, confirmedOn: '' }, [])).toBe('Date missing');
    /* an item still being worked on names nobody */
    expect(flagOf({ ...good, lead: 'Under review', status: 'Under review', confirmedBy: '', confirmedOn: '' }, [])).toBe('');
  });
});

describe('the suggested outcome', () => {
  it('is In review on a blank sign-off', () => {
    const s = summarize(ITEMS, emptySignoff());
    expect(s).toMatchObject({ total: 3, pending: 3, review: 0, confirmed: 0, flagged: 0, progress: 0 });
    expect(s).toMatchObject({ evidence: { 'Not updated': 3, 'Under review': 0, Confirmed: 0 } });
    expect(s.outcome).toBe('In review');
  });

  it('is Ready once every item is confirmed on its evidence', () => {
    const s = summarize(ITEMS, allConfirmed());
    expect(s).toMatchObject({ confirmed: 3, progress: 1, flagged: 0 });
    expect(s.outcome).toBe('Ready to sign off');
  });

  it('is Not ready on a blocking issue', () => {
    const issue = allConfirmed();
    issue.issues.push({ id: 'I-01', description: 'IR hotspot', itemId: 'C-01', severity: 'High', owner: '', due: '', status: 'Open', disposition: '' });
    expect(summarize(ITEMS, issue)).toMatchObject({ blocking: 1, outcome: 'Not ready — blocking items' });
    issue.issues[0].status = 'Closed';
    expect(summarize(ITEMS, issue).outcome).toBe('Ready to sign off');
  });

  it('stays In review while a row is unsupported or a waiver unapproved', () => {
    const noEvidence = allConfirmed();
    noEvidence.items['B-01'] = { ...good, evidence: '' };
    expect(summarize(ITEMS, noEvidence)).toMatchObject({ flagged: 1, outcome: 'In review' });

    const unapproved = allConfirmed();
    unapproved.waivers.push({ id: 'W-01', itemId: 'C-01', rule: 'hold at ff', justification: '', risk: '', condition: '', approvedBy: '', approvedOn: '' });
    expect(summarize(ITEMS, unapproved)).toMatchObject({ unapproved: 1, outcome: 'In review' });
    unapproved.waivers[0].approvedBy = 'Signoff lead';
    expect(summarize(ITEMS, unapproved).outcome).toBe('Ready to sign off');
  });

  it('warns when the lead signs off against the counts', () => {
    const s = emptySignoff();
    s.decision.decision = 'Signed off';
    expect(consistencyWarning(s, summarize(ITEMS, s).outcome)).toMatch(/not ready/);
    const ok = allConfirmed();
    ok.decision.decision = 'Signed off';
    expect(consistencyWarning(ok, summarize(ITEMS, ok).outcome)).toBe('');
  });
});

describe('the checklist closes its deliverable at 100%', () => {
  it('is complete on the day of the last confirmation, and not before', () => {
    const s = allConfirmed();
    s.items['C-01'] = { ...good, confirmedOn: '2027-05-20' };
    expect(checklistCompletedOn(ITEMS, s)).toBe('2027-05-20');
    s.items['X-01'] = reopenEntry(good);
    expect(checklistCompletedOn(ITEMS, s)).toBe('');
    expect(checklistCompletedOn([], emptySignoff())).toBe('');
  });

  it('takes an undated confirmation as complete, dated by the others', () => {
    const s = allConfirmed();
    s.items['C-01'] = { ...good, confirmedOn: '' };
    expect(checklistCompletedOn(ITEMS, s)).toBe('2027-05-16');
    for (const it of ITEMS) s.items[it.id] = { ...good, confirmedOn: '' };
    expect(checklistCompletedOn(ITEMS, s, '2027-06-01')).toBe('2027-06-01');
  });
});

describe('an item moves Pending → Under review → Confirmed', () => {
  it('starts Pending with its evidence Not updated', () => {
    const e = entryOf(emptySignoff(), 'C-01');
    expect([e.lead, e.status]).toEqual(['Pending', 'Not updated']);
  });

  it('reads entries saved under the earlier names', () => {
    const s = emptySignoff();
    const old = (lead: string, status: string) => ({ ...good, lead, status }) as never;
    s.items['A'] = old('Not updated', 'Open');
    s.items['B'] = old('Rejected', 'Fail');
    s.items['C'] = old('Confirmed', 'Pass');
    s.items['D'] = old('Under review', 'Waived');
    expect([entryOf(s, 'A').lead, entryOf(s, 'A').status]).toEqual(['Pending', 'Not updated']);
    expect([entryOf(s, 'B').lead, entryOf(s, 'B').status]).toEqual(['Under review', 'Under review']);
    expect([entryOf(s, 'C').lead, entryOf(s, 'C').status]).toEqual(['Confirmed', 'Confirmed']);
    expect([entryOf(s, 'D').lead, entryOf(s, 'D').status]).toEqual(['Under review', 'Under review']);
  });

  it('confirms the evidence with the item', () => {
    const review = { ...good, status: 'Under review' as const, lead: 'Under review' as const, confirmedBy: '', confirmedOn: '' };
    expect(confirmEntry(review, 'Tomas Rivera', '2027-05-16')).toMatchObject({
      lead: 'Confirmed', status: 'Confirmed', confirmedBy: 'Tomas Rivera', confirmedOn: '2027-05-16',
    });
  });

  it('goes back to Pending and Not updated on reopening, keeping what was recorded', () => {
    const r = reopenEntry(good);
    expect(r).toMatchObject({ lead: 'Pending', status: 'Not updated', confirmedBy: '', confirmedOn: '' });
    expect(r.result).toBe(good.result);
    expect(r.evidence).toBe(good.evidence);
  });

  it('is confirmed by the stage lead or the TPM', () => {
    expect(approversOf('Tomas Rivera', 'Sangwook Park')).toEqual(['Tomas Rivera', 'Sangwook Park']);
    expect(approversOf('', 'Sangwook Park')).toEqual(['Sangwook Park']);
    expect(approversOf('Sangwook Park', 'Sangwook Park')).toEqual(['Sangwook Park']);
  });
});

describe('every gate with a workbook is a checklist in the app', () => {
  it('resolves each of them to its items', async () => {
    const { DELIVERABLE_TEMPLATES, signoffInApp } = await import('@/data/deliverableTemplates');
    const { signoffDefinition } = await import('@/lib/signoffDefinition');
    const refs = Object.keys(DELIVERABLE_TEMPLATES);
    expect(refs).toHaveLength(8);
    for (const ref of refs) {
      expect(signoffInApp(ref)).toBe(true);
      const def = signoffDefinition(ref);
      expect(def?.items.length, ref).toBeGreaterThan(5);
      expect(new Set(def!.items.map((i) => i.id)).size, ref).toBe(def!.items.length);
    }
  });
});

describe('what is stored', () => {
  it('reads back what it wrote, and starts afresh on anything else', () => {
    const s = allConfirmed();
    s.doc.version = '1.0';
    expect(parseSignoff(JSON.stringify(s))).toEqual(s);
    expect(parseSignoff(null)).toEqual(emptySignoff());
    expect(parseSignoff('not json')).toEqual(emptySignoff());
    expect(parseSignoff(JSON.stringify({ v: 2 }))).toEqual(emptySignoff());
  });

  it('numbers new register rows after the highest', () => {
    expect(nextId('W', [])).toBe('W-01');
    expect(nextId('W', [{ id: 'W-01' }, { id: 'W-04' }])).toBe('W-05');
  });
});

describe('who can be named', () => {
  it('offers the programme team once each, the stage’s own people first', async () => {
    const { teamRoster } = await import('@/lib/people');
    const leaders = {
      rtl: { name: 'Minho Lee', short: 'M. Lee', phone: '', email: '' },
      signoff: { name: 'Tomas Rivera', short: 'T. Rivera', phone: '', email: '' },
    };
    const contacts = {
      rtl: [{ id: 'c1', name: 'Priya Raman', role: 'Compiler lead', email: '', phone: '' }],
      signoff: [
        { id: 'c2', name: 'Grace Park', role: 'PD lead', email: '', phone: '' },
        { id: 'c3', name: 'priya raman', role: 'duplicate', email: '', phone: '' },
        { id: 'c4', name: ' ', role: 'nobody', email: '', phone: '' },
      ],
    };
    const roster = teamRoster(['rtl', 'signoff'], leaders, contacts, 'signoff');
    expect(roster.map((m) => [m.name, m.role, m.stageId])).toEqual([
      ['Tomas Rivera', 'Stage lead', 'signoff'],
      ['Grace Park', 'PD lead', 'signoff'],
      ['priya raman', 'duplicate', 'signoff'],
      ['Minho Lee', 'Stage lead', 'rtl'],
    ]);
  });
});

describe('evidence can be a file', () => {
  it('takes an attached file as evidence for a confirmation', () => {
    const noText = { ...good, evidence: '' };
    expect(flagOf(noText, [])).toBe('Evidence missing');
    expect(flagOf(noText, [], 1)).toBe('');
    const s = allConfirmed();
    s.items['C-01'] = noText;
    expect(summarize(ITEMS, s).outcome).toBe('In review');
    expect(summarize(ITEMS, s, { 'C-01': 2 }).outcome).toBe('Ready to sign off');
  });
});

describe('the TPM is on every team', () => {
  it('lists the default members first, on the programme rather than a stage', async () => {
    const { teamRoster } = await import('@/lib/people');
    const { PROGRAM_DEFAULT_TEAM, PROGRAM_TPM } = await import('@/data/programTeam');
    const roster = teamRoster(['signoff'], {}, {}, 'signoff', 'Stage lead', PROGRAM_DEFAULT_TEAM);
    expect(roster).toEqual([{ name: PROGRAM_TPM.name, role: PROGRAM_TPM.role, stageId: '' }]);
    /* and is not listed twice when a Team tab names them as well */
    const twice = teamRoster(['signoff'], {}, { signoff: [{ id: 'c', name: PROGRAM_TPM.name, role: 'x', email: '', phone: '' }] }, 'signoff', 'Stage lead', PROGRAM_DEFAULT_TEAM);
    expect(twice).toHaveLength(1);
  });
});

describe('column widths', () => {
  it('reads what was stored, leniently, and clamps to each minimum', async () => {
    const { readWidths, gridTemplate, tableMinWidth, clampWidth } = await import('@/lib/columnWidths');
    const cols = [
      { key: 'ref', label: 'REF', width: 70, min: 56 },
      { key: 'item', label: 'ITEM', width: 360, min: 200, grow: true },
    ];
    expect(readWidths(cols, null)).toEqual({ ref: 70, item: 360 });
    expect(readWidths(cols, '{"ref":20,"item":400,"gone":9}')).toEqual({ ref: 56, item: 400 });
    expect(readWidths(cols, 'nonsense')).toEqual({ ref: 70, item: 360 });
    expect(gridTemplate(cols, { ref: 70, item: 360 })).toBe('70px minmax(360px, 1fr)');
    expect(tableMinWidth(cols, { ref: 70, item: 360 }, 10)).toBe(440);
    expect(clampWidth(cols[0], NaN)).toBe(70);
  });
});

describe('dragging a column boundary', () => {
  it('moves the boundary with the pointer: the column left of it gains what the right one gives', async () => {
    const { dragBoundary } = await import('@/lib/columnWidths');
    const cols = [
      { key: 'ref', label: 'REF', width: 60, min: 50 },
      { key: 'item', label: 'ITEM', width: 200, min: 150, grow: true },
      { key: 'a', label: 'A', width: 100, min: 80 },
      { key: 'b', label: 'B', width: 100, min: 80 },
    ];
    const stored = { ref: 60, item: 200, a: 100, b: 100 };
    const shown = { ref: 60, item: 340, a: 100, b: 100 };
    /* between two fixed columns */
    expect(dragBoundary(cols, stored, shown, 2, 15)).toEqual({ ref: 60, item: 200, a: 115, b: 85 });
    /* never below a minimum, on either side */
    expect(dragBoundary(cols, stored, shown, 2, 60)).toEqual({ ref: 60, item: 200, a: 120, b: 80 });
    expect(dragBoundary(cols, stored, shown, 2, -60)).toEqual({ ref: 60, item: 200, a: 80, b: 120 });
    /* beside the growing column, it is held at what it shows */
    expect(dragBoundary(cols, stored, shown, 1, 40)).toEqual({ ref: 60, item: 360, a: 80, b: 100 });
    expect(dragBoundary(cols, stored, shown, 1, -40)).toEqual({ ref: 60, item: 300, a: 140, b: 100 });
    /* the last column has no boundary on its right */
    expect(dragBoundary(cols, stored, shown, 3, 20)).toEqual(stored);
  });
});
