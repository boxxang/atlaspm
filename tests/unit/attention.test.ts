import { describe, expect, it } from 'vitest';
import {
  ATTN_BAND,
  ATTN_MTO,
  NEXT_UP,
  attention,
  type AttentionInput,
} from '@/lib/attention';
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
    // the risk has gone unanswered for over a year; it still sits below due-soon
    expect(rows.map((r) => r.tag)).toEqual(['Due soon', 'Stale risk']);
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
     something today needs, though it does turn up under Coming up next when
     nothing else does — as Next up, which is a different claim. */
  it('does not call a deliverable more than three weeks away due soon', () => {
    const rows = attention(
      input({
        overdue: [overdue()],
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

  it('ignores a risk that was answered this week', () => {
    expect(attention(input({ risks: [risk({ updatedAt: d('2025-05-28') })] }))).toEqual([]);
  });

  it('caps nothing — every overdue step is on the list', () => {
    const many = Array.from({ length: 17 }, (_, i) =>
      overdue({ id: `od:A-${i}:1`, act: `A-${i}`, due: d('2025-05-01') }),
    );
    expect(attention(input({ overdue: many })).length).toBe(17);
  });
});

describe('one row per thing', () => {
  it('keeps the louder reason when a step is both overdue and carrying a stale risk', () => {
    const rows = attention(
      input({
        overdue: [overdue({ stepN: 2 })],
        risks: [risk({ updatedAt: d('2024-01-01') })],
      }),
    );
    // different keys — a risk is keyed on the post, not the step — so both show,
    // but the overdue row is unambiguously first
    expect(rows[0].tag).toBe('Overdue');
    expect(rows.length).toBe(2);
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
describe('when nothing is overdue and no risk is unanswered', () => {
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

  /* And the moment one of them is inside the three-week horizon it is Due
     soon, which is a band — so this is not the empty case at all. */
  it('is not reached when a deliverable is already due soon', () => {
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
    expect(rows.map((r) => r.tag)).toEqual(['Due soon']);
  });

  it('stops at seven — a morning\'s work, not the whole plan', () => {
    const many = Array.from({ length: 30 }, (_, i) => step(i + 1, `step ${i + 1}`));
    const rows = attention(input({ upcoming: many }));
    expect(rows).toHaveLength(NEXT_UP);
    expect(rows.at(-1)!.title).toBe(`step ${NEXT_UP}`);
  });

  /* The moment anything is actually wrong, the fallback gets out of the way:
     one overdue step outranks every date in the future. */
  it('gives way as soon as there is something wrong', () => {
    const rows = attention(
      input({ overdue: [overdue()], upcoming: [step(1, 'tomorrow'), step(2, 'the day after')] }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].tag).toBe('Overdue');
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
