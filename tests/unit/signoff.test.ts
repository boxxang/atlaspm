import { describe, expect, it } from 'vitest';
import {
  consistencyWarning,
  emptySignoff,
  entryOf,
  approversOf,
  confirmEntry,
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
 * A gate confirmed item by item: the rules the sign-off workbook applies, as
 * the page applies them. Written before the page, and in the workbook's own
 * scenarios — a blank sign-off, a fully confirmed one, one failing item, one
 * unsupported confirmation.
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
  status: 'Pass',
  waiverId: '',
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

  it('names the first thing to fix, in the workbook’s order', () => {
    expect(flagOf({ ...good, evidence: ' ' }, [])).toBe('Evidence missing');
    expect(flagOf({ ...good, status: 'Waived' }, [], 0, 'C-01')).toBe('No waiver for this item');
    expect(flagOf({ ...good, status: 'Fail' }, [])).toBe('Confirmed without a passing status');
    expect(flagOf({ ...good, status: 'Open' }, [])).toBe('Confirmed without a passing status');
    expect(flagOf({ ...good, confirmedBy: '' }, [])).toBe('Confirmed by missing');
    /* an item still being worked on names nobody */
    expect(flagOf({ ...good, lead: 'Under review', confirmedBy: '', confirmedOn: '' }, [])).toBe('');
    expect(flagOf({ ...good, confirmedOn: '' }, [])).toBe('Date missing');
  });

  /* the page names no waiver on the item: the register links the waiver to it */
  it('takes a waived item as covered by a waiver raised against it', () => {
    const waived = { ...good, status: 'Waived' as const };
    const w = { id: 'W-07', itemId: 'C-01', rule: '', justification: '', risk: '', condition: '', approvedBy: 'Signoff lead', approvedOn: '' };
    expect(flagOf(waived, [], 0, 'C-01')).toBe('No waiver for this item');
    expect(flagOf(waived, [w], 0, 'C-02')).toBe('No waiver for this item');
    expect(flagOf(waived, [w], 0, 'C-01')).toBe('');
    /* an entry saved when the item named its waiver still counts */
    expect(flagOf({ ...waived, waiverId: 'W-07' }, [{ ...w, itemId: '' }], 0, 'C-01')).toBe('');
  });
});

describe('the suggested outcome', () => {
  it('is In review on a blank sign-off', () => {
    const s = summarize(ITEMS, emptySignoff());
    expect(s).toMatchObject({ total: 3, open: 3, notUpdated: 3, review: 0, confirmed: 0, flagged: 0, progress: 0 });
    expect(s.outcome).toBe('In review');
  });

  it('is Ready once every item is confirmed on its evidence', () => {
    const s = summarize(ITEMS, allConfirmed());
    expect(s).toMatchObject({ confirmed: 3, pass: 3, progress: 1, flagged: 0 });
    expect(s.outcome).toBe('Ready to sign off');
  });

  it('is Not ready on a failing item or a blocking issue', () => {
    const fail = allConfirmed();
    fail.items['C-01'] = { ...good, status: 'Fail', lead: 'Under review' };
    expect(summarize(ITEMS, fail)).toMatchObject({ review: 1, outcome: 'Not ready — blocking items' });

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
    unapproved.items['C-01'] = { ...good, status: 'Waived' };
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

describe('an item moves Not updated → Under review → Confirmed', () => {
  it('starts Not updated, and reads entries saved under the old names', () => {
    expect(entryOf(emptySignoff(), 'C-01').lead).toBe('Not updated');
    const s = emptySignoff();
    s.items['C-01'] = { ...good, lead: 'Pending' as never };
    s.items['C-02'] = { ...good, lead: 'Rejected' as never };
    expect(entryOf(s, 'C-01').lead).toBe('Not updated');
    expect(entryOf(s, 'C-02').lead).toBe('Under review');
  });

  it('passes the evidence when confirmed, unless it was waived or not applicable', () => {
    const review = { ...good, status: 'Open' as const, lead: 'Under review' as const, confirmedBy: '', confirmedOn: '' };
    expect(confirmEntry(review, 'Tomas Rivera', '2027-05-16')).toMatchObject({
      lead: 'Confirmed', status: 'Pass', confirmedBy: 'Tomas Rivera', confirmedOn: '2027-05-16',
    });
    expect(confirmEntry({ ...review, status: 'Waived' }, 'T', '2027-05-16').status).toBe('Waived');
    expect(confirmEntry({ ...review, status: 'N/A' }, 'T', '2027-05-16').status).toBe('N/A');
    expect(confirmEntry({ ...review, status: 'Fail' }, 'T', '2027-05-16').status).toBe('Pass');
  });

  it('goes back to Not updated on reopening, keeping what was recorded', () => {
    const r = reopenEntry(good);
    expect(r).toMatchObject({ lead: 'Not updated', status: 'Open', confirmedBy: '', confirmedOn: '' });
    expect(r.result).toBe(good.result);
    expect(r.evidence).toBe(good.evidence);
  });

  it('is confirmed by the stage lead or the TPM', () => {
    expect(approversOf('Tomas Rivera', 'Sangwook Park')).toEqual(['Tomas Rivera', 'Sangwook Park']);
    expect(approversOf('', 'Sangwook Park')).toEqual(['Sangwook Park']);
    expect(approversOf('Sangwook Park', 'Sangwook Park')).toEqual(['Sangwook Park']);
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
