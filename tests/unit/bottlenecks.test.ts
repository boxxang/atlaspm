import { describe, expect, it } from 'vitest';
import { bottleneckSummary, findBottlenecks, type BottleneckInput } from '@/lib/bottlenecks';
import type { Deliverable, Stage } from '@/data/types';
import type { Schedule } from '@/lib/schedule';

/**
 * A bottleneck is an activity the rest of the programme is waiting on. Three
 * things have to be true, and each is checked here on its own:
 *
 *  - it is provably late. The engineering table carries no completion state,
 *    so the only evidence is a Key Deliverable it owns that is past its due
 *    date and not done. An activity that owns nothing cannot be a source.
 *  - something waits on it. `feedsInto` is followed all the way, not one hop,
 *    and it is not acyclic — an activity can feed one that feeds back.
 *  - the waiting work has not started yet. Work already under way is exposed
 *    differently and is not what unblocking this would release.
 */

const day = 24 * 60 * 60 * 1000;
const at = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const TODAY = at('2026-03-01');

/** A stage with three activities and whatever deliverables the test hangs on it. */
function stage(
  id: string,
  short: string,
  opts: {
    view?: string[];
    tat?: number[];
    effort?: number[];
    start?: number[];
    from?: number[];
  } = {},
): Stage {
  return {
    id,
    stage: 1,
    title: `${short} stage`,
    shortTitle: short,
    engineeringView: opts.view ?? ['One', 'Two', 'Three'],
    engineeringTat: opts.tat ?? [2, 2, 2],
    engineeringEffort: opts.effort ?? [10, 20, 30],
    engineeringStart: opts.start ?? [0, 2, 4],
    deliverableFrom: opts.from,
    /* resolveStageDetail reads the whole stage, so the stub carries the rest */
    description: '',
    programView: [],
    tools: [],
    collaboration: [],
    phaseId: 'p',
    vizKey: null,
    baseline: { startOffsetWeeks: 0, durationWeeks: 6 },
  } as unknown as Stage;
}

const dlv = (id: string, due: string | null, done: boolean): Deliverable =>
  ({ id, title: `${id} artefact`, due: due ? at(due) : null, done, completedAt: null }) as Deliverable;

/** Both stages start on the same day, so weeks-in are directly comparable. */
const schedule = (ids: string[], start = at('2026-01-01')): Schedule =>
  ({
    stages: Object.fromEntries(
      ids.map((id) => [
        id,
        { start, end: new Date(start.getTime() + 42 * day), startOffsetWeeks: 0, durationWeeks: 6 },
      ]),
    ),
  }) as unknown as Schedule;

/** One stage, its first activity owning one deliverable that is two weeks overdue. */
function base(over: Partial<BottleneckInput> = {}): BottleneckInput {
  return {
    stages: [stage('a', 'A', { from: [0] })],
    stageDetails: {},
    schedule: schedule(['a']),
    deliverables: { a: [dlv('a1', '2026-02-15', false)] },
    today: TODAY,
    feeds: { 'A-01': ['A-02'] },
    manMonths: {},
    critical: [],
    titles: {},
    ...over,
  };
}

describe('finding what the programme is waiting on', () => {
  it('names the activity whose deliverable is overdue', () => {
    const [b, ...rest] = findBottlenecks(base());
    expect(rest).toEqual([]);
    expect(b.id).toBe('A-01');
    expect(b.stageId).toBe('a');
    expect(b.lateDays).toBe(14);
    expect(b.lateDeliverables.map((d) => d.id)).toEqual(['a1']);
  });

  it('says nothing when the overdue deliverable has been delivered', () => {
    expect(findBottlenecks(base({ deliverables: { a: [dlv('a1', '2026-02-15', true)] } }))).toEqual(
      [],
    );
  });

  it('says nothing when the deliverable is not due yet', () => {
    expect(findBottlenecks(base({ deliverables: { a: [dlv('a1', '2026-04-01', false)] } }))).toEqual(
      [],
    );
  });

  /* A deliverable with no date is not a promise, so missing it is not a fact. */
  it('says nothing about a deliverable that was never given a date', () => {
    expect(findBottlenecks(base({ deliverables: { a: [dlv('a1', null, false)] } }))).toEqual([]);
  });

  /* The stage's map from deliverable to activity is what makes a source. */
  it('cannot name a source in a stage that does not say which activity delivers what', () => {
    expect(findBottlenecks(base({ stages: [stage('a', 'A')] }))).toEqual([]);
  });

  it('leaves out a late activity that nothing waits on', () => {
    expect(findBottlenecks(base({ feeds: {} }))).toEqual([]);
  });

  it('takes the worst of several overdue deliverables as the delay', () => {
    const b = findBottlenecks(
      base({
        stages: [stage('a', 'A', { from: [0, 0] })],
        deliverables: { a: [dlv('a1', '2026-02-15', false), dlv('a2', '2026-01-15', false)] },
      }),
    );
    expect(b[0].lateDays).toBe(45);
    expect(b[0].lateDeliverables).toHaveLength(2);
  });
});

describe('how far the wait reaches', () => {
  const three = { stages: [stage('a', 'A', { from: [0] })], feeds: { 'A-01': ['A-02'], 'A-02': ['A-03'] } };

  it('follows the chain all the way, not one hop', () => {
    const [b] = findBottlenecks(base(three));
    expect(b.direct).toBe(1);
    expect(b.downstream.map((d) => d.id).sort()).toEqual(['A-02', 'A-03']);
  });

  it('walks a cycle once instead of for ever', () => {
    const [b] = findBottlenecks(
      base({ ...three, feeds: { 'A-01': ['A-02'], 'A-02': ['A-03'], 'A-03': ['A-01', 'A-02'] } }),
    );
    expect(b.downstream.map((d) => d.id).sort()).toEqual(['A-02', 'A-03']);
  });

  it('never counts the late activity among the things waiting on it', () => {
    const [b] = findBottlenecks(base({ ...three, feeds: { 'A-01': ['A-01', 'A-02'] } }));
    expect(b.downstream.map((d) => d.id)).toEqual(['A-02']);
  });

  it('counts the stages the wait spreads into', () => {
    const [b] = findBottlenecks(
      base({
        stages: [stage('a', 'A', { from: [0] }), stage('b', 'B')],
        schedule: schedule(['a', 'b'], at('2026-02-20')),
        deliverables: { a: [dlv('a1', '2026-02-15', false)], b: [] },
        feeds: { 'A-01': ['A-02', 'B-01'], 'B-01': ['B-02'] },
      }),
    );
    expect(b.downstream).toHaveLength(3);
    /* B-01 sits at week 0 of a stage that started before today, so it is
       already running; the wait still reaches both stages through B-02 */
    expect(b.waiting).toBe(2);
    expect(b.stagesTouched).toBe(2);
  });

  /* An activity nobody wrote up — a stage someone added — is not a place work
     is waiting, because there is no record of anything depending on it. */
  it('ignores a downstream ID the template does not have', () => {
    const [b] = findBottlenecks(base({ feeds: { 'A-01': ['A-02', 'ZZZ-09'] } }));
    expect(b.downstream.map((d) => d.id)).toEqual(['A-02']);
  });
});

describe('the size of what is stuck', () => {
  it('counts the effort of downstream work that has not started', () => {
    /* stage starts 2026-01-01; A-02 starts week 2, A-03 week 4 — both before
       today, so both are already under way and neither is held up. */
    const [b] = findBottlenecks(base({ feeds: { 'A-01': ['A-02', 'A-03'] } }));
    expect(b.manMonthsAtRisk).toBe(0);
  });

  it('counts it once the work is still ahead of today', () => {
    const [b] = findBottlenecks(
      base({
        schedule: schedule(['a'], at('2026-02-20')),
        feeds: { 'A-01': ['A-02', 'A-03'] },
      }),
    );
    /* A-02 starts week 2 (03-06) and A-03 week 4 (03-20), both after today */
    expect(b.manMonthsAtRisk).toBe(50);
    expect(b.firstBlockedStart).toEqual(at('2026-03-06'));
  });

  it('marks how much of the waiting work moves the programme', () => {
    const [b] = findBottlenecks(
      base({
        schedule: schedule(['a'], at('2026-02-20')),
        feeds: { 'A-01': ['A-02', 'A-03'] },
        critical: ['A-03'],
      }),
    );
    expect(b.criticalDownstream).toBe(1);
  });

  /*
   * Every figure on a row answers the same question — what unblocking this
   * would release — so work already under way counts towards none of them,
   * however far downstream it sits.
   */
  it('leaves work already under way out of every figure on the row', () => {
    const [b] = findBottlenecks(
      base({
        stages: [stage('a', 'A', { from: [0] }), stage('b', 'B')],
        /* stage A began in January, so A-02 and A-03 are already running;
           only B's activities are still ahead of today */
        schedule: {
          stages: {
            a: { start: at('2026-01-01'), end: at('2026-02-12'), startOffsetWeeks: 0, durationWeeks: 6 },
            b: { start: at('2026-03-05'), end: at('2026-04-16'), startOffsetWeeks: 0, durationWeeks: 6 },
          },
        } as unknown as Schedule,
        deliverables: { a: [dlv('a1', '2026-02-15', false)], b: [] },
        feeds: { 'A-01': ['A-02', 'B-01'], 'B-01': ['B-02'] },
        critical: ['A-02', 'B-01'],
      }),
    );
    expect(b.downstream).toHaveLength(3);
    /* A-02 is downstream and shown, but it started — so it is in none of these */
    expect(b.waiting).toBe(2);
    expect(b.stagesTouched).toBe(1);
    expect(b.criticalDownstream).toBe(1);
    expect(b.downstream.find((d) => d.id === 'A-02')!.waiting).toBe(false);
  });
});

describe('the order they are read in', () => {
  it('puts the largest amount of held-up work first', () => {
    const found = findBottlenecks(
      base({
        stages: [
          stage('a', 'A', { from: [0], effort: [10, 20, 30] }),
          stage('b', 'B', { from: [0], effort: [10, 5, 5] }),
        ],
        schedule: schedule(['a', 'b'], at('2026-02-20')),
        deliverables: {
          a: [dlv('a1', '2026-02-25', false)],
          b: [dlv('b1', '2026-01-01', false)],
        },
        feeds: { 'A-01': ['A-02', 'A-03'], 'B-01': ['B-02'] },
      }),
    );
    expect(found.map((b) => b.id)).toEqual(['A-01', 'B-01']);
    /* B-01 is far later, so lateness alone would have reversed these */
    expect(found[0].lateDays).toBeLessThan(found[1].lateDays);
  });

  it('breaks a tie on how late the activity is', () => {
    const found = findBottlenecks(
      base({
        stages: [
          stage('a', 'A', { from: [0], effort: [10, 20, 30] }),
          stage('b', 'B', { from: [0], effort: [10, 20, 30] }),
        ],
        schedule: schedule(['a', 'b'], at('2026-02-20')),
        deliverables: {
          a: [dlv('a1', '2026-02-25', false)],
          b: [dlv('b1', '2026-01-01', false)],
        },
        feeds: { 'A-01': ['A-02'], 'B-01': ['B-02'] },
      }),
    );
    expect(found.map((b) => b.id)).toEqual(['B-01', 'A-01']);
  });
});

describe('the line the panel opens with', () => {
  it('counts work held by more than one bottleneck once', () => {
    const input = base({
      stages: [stage('a', 'A', { from: [0, 1], effort: [10, 20, 30] })],
      schedule: schedule(['a'], at('2026-02-20')),
      deliverables: { a: [dlv('a1', '2026-02-15', false), dlv('a2', '2026-02-15', false)] },
      /* both late activities feed the same third one */
      feeds: { 'A-01': ['A-03'], 'A-02': ['A-03'] },
    });
    const list = findBottlenecks(input);
    expect(list).toHaveLength(2);
    expect(list[0].manMonthsAtRisk + list[1].manMonthsAtRisk).toBe(60);

    const s = bottleneckSummary(list);
    expect(s.count).toBe(2);
    expect(s.activities).toBe(1);
    expect(s.manMonths).toBe(30);
    expect(s.stages).toBe(1);
  });

  it('counts nothing when nothing is waiting', () => {
    expect(bottleneckSummary([])).toEqual({ count: 0, activities: 0, manMonths: 0, stages: 0 });
  });
});
