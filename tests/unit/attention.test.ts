import { describe, expect, it } from 'vitest';
import { ATTN_BAND, ATTN_MTO, ATTN_LIMIT, attention, type AttentionInput } from '@/lib/attention';
import type { OverdueStep } from '@/lib/steps';
import type { DerivedRisk } from '@/lib/risks';

const d = (iso: string) => new Date(`${iso}T00:00:00`);
const TODAY = d('2025-06-01');

const overdue = (over: Partial<OverdueStep> = {}): OverdueStep => ({
  id: 'od:DEF-01:1',
  act: 'DEF-01',
  stepN: 1,
  stageId: 'def',
  title: 'Collect customer requirements',
  owner: 'Jiwon Ahn',
  role: 'Product Manager',
  due: d('2025-05-21'),
  ...over,
});

const risk = (over: Partial<DerivedRisk> = {}): DerivedRisk => ({
  id: 'sr:p1',
  postId: 'p1',
  stageId: 'def',
  title: 'PDK 2.1 slipped a month',
  owner: 'Sangwook Park',
  act: 'DEF-01',
  stepN: 2,
  updatedAt: d('2025-04-01'),
  ...over,
});

const input = (over: Partial<AttentionInput> = {}): AttentionInput => ({
  today: TODAY,
  overdue: [],
  deliverables: [],
  risks: [],
  stageEnds: { def: d('2025-08-01'), rtl: d('2026-08-01') },
  tapeout: d('2025-12-01'),
  ...over,
});

describe('the bands', () => {
  it('never lets a due-soon deliverable outrank something already overdue', () => {
    const rows = attention(
      input({
        overdue: [overdue({ due: d('2025-05-31') })],
        deliverables: [
          {
            id: 'D1',
            title: 'PRD',
            stageId: 'def',
            due: d('2025-06-02'),
            done: false,
            ref: 'DEF-D1',
            step: { act: 'DEF-01', n: 6 },
          },
        ],
      }),
    );
    expect(rows.map((r) => r.tag)).toEqual(['Overdue', 'Due soon']);
  });

  it('never lets the tapeout bonus promote a row out of its band', () => {
    const rows = attention(
      input({
        deliverables: [
          {
            id: 'D1',
            title: 'closes before tapeout',
            stageId: 'def',
            due: d('2025-06-20'),
            done: false,
            ref: null,
            step: null,
          },
        ],
        risks: [risk({ updatedAt: d('2024-01-01') })],
      }),
    );
    /* the deliverable closes before tapeout and the risk does not, and the
       risk still comes first: the bonus orders inside a band, never across */
    expect(rows.map((r) => r.tag)).toEqual(['Stale risk', 'Due soon']);
    expect(rows[1].blocks).toBe(true);
  });

  it('orders inside a band by how late, and gives closing before tapeout the edge', () => {
    const rows = attention(
      input({
        overdue: [
          overdue({ id: 'od:RTL-01:1', act: 'RTL-01', stageId: 'rtl', due: d('2025-05-20') }),
          overdue({ due: d('2025-05-21') }),
        ],
      }),
    );
    // rtl closes after tapeout, so no bonus: 12 days late vs 11 + 300
    expect(rows[0].ref).toBe('DEF-01');
    expect(rows[0].score).toBe(ATTN_BAND.overdue + 11 + ATTN_MTO);
    expect(rows[1].score).toBe(ATTN_BAND.overdue + 12);
  });
});

describe('what each row says', () => {
  it('says how far past due a step is, in days', () => {
    const [row] = attention(input({ overdue: [overdue()] }));
    expect(row).toMatchObject({
      tag: 'Overdue',
      type: 'Step',
      why: '11 days past due',
      step: { act: 'DEF-01', n: 1 },
      ref: 'DEF-01',
      owner: 'Jiwon Ahn',
      blocks: true,
    });
  });

  it('says "1 day" rather than "1 days"', () => {
    const [row] = attention(input({ overdue: [overdue({ due: d('2025-05-31') })] }));
    expect(row.why).toBe('1 day past due');
  });

  it('says "due today" on the day', () => {
    const [row] = attention(
      input({
        deliverables: [
          { id: 'D1', title: 'PRD', stageId: 'def', due: TODAY, done: false, ref: null, step: null },
        ],
      }),
    );
    expect(row).toMatchObject({ tag: 'Due soon', why: 'due today', type: 'Deliverable' });
  });

  it('sends a deliverable to the step that hands it over', () => {
    const [row] = attention(
      input({
        deliverables: [
          {
            id: 'D1',
            title: 'PRD',
            stageId: 'def',
            due: d('2025-06-03'),
            done: false,
            ref: 'DEF-D1',
            step: { act: 'DEF-01', n: 6 },
          },
        ],
      }),
    );
    expect(row.step).toEqual({ act: 'DEF-01', n: 6 });
    expect(row.deliverableId).toBe('D1');
  });

  it('files a risk as a step, because it is answered on one', () => {
    const [row] = attention(input({ risks: [risk()] }));
    expect(row).toMatchObject({
      tag: 'Stale risk',
      type: 'Step',
      why: 'no update in 61 days',
      step: { act: 'DEF-01', n: 2 },
    });
  });
});

describe('what it leaves out', () => {
  /* Three weeks is the horizon for "due soon". Beyond it a deliverable is not
     something today needs — it appears lower down as Next up, which is a
     different claim, so the band is what this checks. */
  it('does not call a deliverable more than three weeks away due soon', () => {
    const rows = attention(
      input({
        overdue: [overdue()],
        limit: 1,
        deliverables: [
          {
            id: 'D1',
            title: 'PRD',
            stageId: 'def',
            due: d('2025-06-23'),
            done: false,
            ref: null,
            step: null,
          },
        ],
      }),
    );
    expect(rows.map((r) => r.type)).toEqual(['Step']);
  });

  it('ignores one already handed over, and one with no date at all', () => {
    const base = { title: 'PRD', stageId: 'def', ref: null, step: null };
    const rows = attention(
      input({
        deliverables: [
          { ...base, id: 'D1', due: d('2025-05-01'), done: true },
          { ...base, id: 'D2', due: null, done: false },
        ],
      }),
    );
    expect(rows).toEqual([]);
  });

  /* A risk answered this week is still open, and still the most useful thing
     on the screen. Only the wording changes: Risk, not Stale risk. */
  it('lists a risk answered this week, saying when it was raised', () => {
    const rows = attention(input({ risks: [risk({ updatedAt: d('2025-05-28') })] }));
    expect(rows.map((r) => r.tag)).toEqual(['Risk']);
    expect(rows[0].why).toBe('raised 4 days ago');
  });

  it('says so when nobody has answered one in a week', () => {
    const rows = attention(input({ risks: [risk({ updatedAt: d('2025-05-01') })] }));
    expect(rows.map((r) => r.tag)).toEqual(['Stale risk']);
    expect(rows[0].why).toBe('no update in 31 days');
  });

  it('caps nothing that is wrong — every overdue step is on the list', () => {
    const many = Array.from({ length: 17 }, (_, i) =>
      overdue({ id: `od:A-${i}:1`, act: `A-${i}`, due: d('2025-05-01') }),
    );
    expect(attention(input({ overdue: many })).length).toBe(17);
  });
});

describe('one row per thing', () => {
  /* A step that is both flagged and late is one row, filed as the risk — the
     flag is a person's judgement about work still running, and the date having
     passed is arithmetic. The row says both. */
  it('files a step that is both flagged and overdue as the risk', () => {
    const rows = attention(
      input({
        overdue: [overdue({ stepN: 2, due: d('2025-05-22') })],
        risks: [risk({ stepN: 2, updatedAt: d('2024-01-01') })],
      }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].tag).toBe('Stale risk');
    expect(rows[0].why).toContain('10 days past due');
    expect(rows[0].step).toEqual({ act: 'DEF-01', n: 2 });
  });

  /* An overdue step nobody flagged stays Overdue. */
  it('leaves an unflagged overdue step as overdue', () => {
    const rows = attention(
      input({
        overdue: [overdue({ stepN: 9 })],
        /* answered yesterday, so it reads Risk rather than Stale risk */
        risks: [risk({ stepN: 2, updatedAt: d('2025-05-31') })],
      }),
    );
    expect(rows.map((r) => r.tag)).toEqual(['Risk', 'Overdue']);
    expect(rows[1].step).toEqual({ act: 'DEF-01', n: 9 });
  });

  it('collapses two claims on the same deliverable to the worse one', () => {
    const deliv = {
      id: 'D1',
      title: 'PRD',
      stageId: 'def',
      due: d('2025-05-01'),
      done: false,
      ref: null,
      step: null,
    };
    const rows = attention(input({ deliverables: [deliv, { ...deliv, due: d('2025-06-02') }] }));
    expect(rows.length).toBe(1);
    expect(rows[0].tag).toBe('Overdue');
  });
});

describe('closing before tapeout', () => {
  it('is false for a stage that closes after it', () => {
    const [row] = attention(input({ overdue: [overdue({ stageId: 'rtl' })] }));
    expect(row.blocks).toBe(false);
  });

  it('is false for a stage that has already closed', () => {
    const [row] = attention(
      input({ overdue: [overdue({ stageId: 'def' })], stageEnds: { def: d('2025-01-01') } }),
    );
    expect(row.blocks).toBe(false);
  });

  it('is false when the programme has no tapeout date', () => {
    const [row] = attention(input({ overdue: [overdue()], tapeout: null }));
    expect(row.blocks).toBe(false);
  });
});

/**
 * A program with nothing wrong with it — one just started, or one on top of
 * its work — used to get an empty panel headed "Needs you today". Silence is
 * not an answer to that question; the work coming up is.
 */
describe('topping the list up with what is coming', () => {
  const soon = (n: number) => new Date(TODAY.getTime() + n * 864e5);
  const step = (n: number, title: string) =>
    overdue({ id: `up:A:${n}`, act: 'A', stepN: n, title, due: soon(n) });

  it('falls back to the nearest dates ahead, soonest first', () => {
    const rows = attention(
      input({ upcoming: [step(9, 'later'), step(2, 'sooner'), step(5, 'middle')] }),
    );
    expect(rows.map((r) => r.title)).toEqual(['sooner', 'middle', 'later']);
    expect(rows.every((r) => r.tag === 'Next up')).toBe(true);
    expect(rows[0].why).toBe('due in 2 days');
  });

  /* A deliverable inside three weeks is Due soon, which is one of the three
     bands — so the fallback only meets deliverables beyond that horizon, and
     it puts them in the same order as the steps. */
  it('takes steps and deliverables together, in one order', () => {
    const rows = attention(
      input({
        upcoming: [step(25, 'a step in 25 days'), step(40, 'a step in 40 days')],
        deliverables: [
          {
            id: 'D1',
            title: 'a deliverable in 30 days',
            stageId: 'def',
            due: soon(30),
            done: false,
            ref: 'DEF-D1',
            step: null,
          },
        ],
      }),
    );
    expect(rows.map((r) => r.type)).toEqual(['Step', 'Deliverable', 'Step']);
    expect(rows[1].title).toBe('a deliverable in 30 days');
  });

  /* Bands first, always: a deliverable due in three days outranks a step due
     tomorrow, because one is a commitment and the other is a plan. */
  it('keeps every band above everything merely coming', () => {
    const rows = attention(
      input({
        upcoming: [step(1, 'a step tomorrow')],
        deliverables: [
          {
            id: 'D1',
            title: 'a deliverable in three days',
            stageId: 'def',
            due: soon(3),
            done: false,
            ref: null,
            step: null,
          },
        ],
      }),
    );
    expect(rows.map((r) => r.tag)).toEqual(['Due soon', 'Next up']);
  });

  it('fills to the limit and no further', () => {
    const many = Array.from({ length: 30 }, (_, i) => step(i + 1, `step ${i + 1}`));
    const rows = attention(input({ upcoming: many }));
    expect(rows).toHaveLength(ATTN_LIMIT);
    expect(rows.at(-1)!.title).toBe(`step ${ATTN_LIMIT}`);

    expect(attention(input({ upcoming: many, limit: 5 }))).toHaveLength(5);
    expect(attention(input({ upcoming: many, limit: 20 }))).toHaveLength(20);
  });

  /* The case this exists for: one late step answered the question in two
     seconds and then left the panel blank for the rest of the day. */
  it('sits under whatever is wrong rather than replacing it', () => {
    const many = Array.from({ length: 30 }, (_, i) => step(i + 1, `step ${i + 1}`));
    const rows = attention(input({ overdue: [overdue()], upcoming: many }));
    expect(rows).toHaveLength(ATTN_LIMIT);
    expect(rows[0].tag).toBe('Overdue');
    expect(rows.slice(1).every((r) => r.tag === 'Next up')).toBe(true);
  });

  /* And when there is more wrong than the list is long, none of the room goes
     to work that is merely coming: the whole list is what is wrong. */
  it('gives no room to the future when the present has filled the list', () => {
    const lots = Array.from({ length: 14 }, (_, i) =>
      overdue({ id: `od:A:${i}`, act: 'A', stepN: i, due: d('2025-05-01') }),
    );
    const rows = attention(input({ overdue: lots, upcoming: [step(1, 'tomorrow')] }));
    expect(rows).toHaveLength(14);
    expect(rows.every((r) => r.tag === 'Overdue')).toBe(true);
  });

  /* A deliverable inside three weeks is already in the list as Due soon. It
     must not turn up again below as Next up. */
  it('never says the same thing twice', () => {
    const deliverable = {
      id: 'D1',
      title: 'PRD',
      stageId: 'def' as const,
      due: soon(3),
      done: false,
      ref: null,
      step: null,
    };
    const rows = attention(input({ deliverables: [deliverable], upcoming: [step(9, 'a step')] }));
    expect(rows.filter((r) => r.key === 'd:D1')).toHaveLength(1);
    expect(rows.map((r) => r.tag)).toEqual(['Due soon', 'Next up']);
  });

  it('says nothing at all when there is nothing ahead either', () => {
    expect(attention(input())).toEqual([]);
    expect(attention(input({ upcoming: [] }))).toEqual([]);
  });

  /* It ranks by date, not by score — every row is in the same band. */
  it('scores them all alike, so the order is the calendar', () => {
    const rows = attention(input({ upcoming: [step(1, 'a'), step(4, 'b')] }));
    expect(new Set(rows.map((r) => r.score))).toEqual(new Set([ATTN_BAND.next]));
  });
});
