import { describe, expect, it } from 'vitest';
import {
  consistencyWarning,
  emptySignoff,
  entryOf,
  flagOf,
  nextId,
  parseSignoff,
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
    expect(flagOf({ ...good, lead: 'Rejected' }, [])).toBe('Comment required');
    expect(flagOf({ ...good, status: 'Fail' }, [])).toBe('Confirmed without a passing status');
    expect(flagOf({ ...good, status: 'Open' }, [])).toBe('Confirmed without a passing status');
    expect(flagOf({ ...good, confirmedBy: '' }, [])).toBe('Confirmed by missing');
    expect(flagOf({ ...good, lead: 'Rejected', comment: 'stale report', confirmedBy: ' ' }, [])).toBe('Confirmed by missing');
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
    expect(s).toMatchObject({ total: 3, open: 3, pending: 3, confirmed: 0, flagged: 0, progress: 0 });
    expect(s.outcome).toBe('In review');
  });

  it('is Ready once every item is confirmed on its evidence', () => {
    const s = summarize(ITEMS, allConfirmed());
    expect(s).toMatchObject({ confirmed: 3, pass: 3, progress: 1, flagged: 0 });
    expect(s.outcome).toBe('Ready to sign off');
  });

  it('is Not ready on a failing item, a rejection or a blocking issue', () => {
    const fail = allConfirmed();
    fail.items['C-01'] = { ...good, status: 'Fail', lead: 'Pending' };
    expect(summarize(ITEMS, fail).outcome).toBe('Not ready — blocking items');

    const rejected = allConfirmed();
    rejected.items['C-01'] = { ...good, lead: 'Rejected', comment: 'report is from turn 2' };
    expect(summarize(ITEMS, rejected).outcome).toBe('Not ready — blocking items');

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
