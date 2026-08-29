import { describe, expect, it } from 'vitest';
import { ATTN_BAND, ATTN_MTO, attention, type AttentionInput } from '@/lib/attention';
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
  it('ignores a deliverable more than three weeks away', () => {
    const rows = attention(
      input({
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
    expect(rows).toEqual([]);
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
