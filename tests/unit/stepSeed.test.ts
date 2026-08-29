import { describe, expect, it } from 'vitest';
import { activitySteps } from '@/data/activitySteps';
import { BUILTIN_PROFILE, STAGE_ORDER } from '@/data/scheduleProfiles';
import { addWeeks, computeSchedule, startOfDay } from '@/lib/schedule';
import { fromStepIndex, plannedSteps, type ActivitySteps } from '@/lib/steps';
import { pickStalls, seedStepStates, STALL_DEPTH } from '@/lib/stepSeed';
import type { DetailStep } from '@/data/activityDetailTypes';

const d = (iso: string) => new Date(`${iso}T00:00:00`);

const step = (n: number, tat: number): DetailStep => ({ n, text: `step ${n}`, tat, lane: 'main' });

const act = (ref: string, stageId: string, steps: DetailStep[]): ActivitySteps => ({
  ref,
  stageId,
  window: [0, 20],
  steps,
  role: '',
});

describe('seeding a programme that has been running', () => {
  /* One stage, in flight: four steps of one week each from 01/01, so the first
     two have closed by 20/01 and the last two have not. */
  const stages = [{ id: 'a', start: d('2025-01-01'), end: d('2025-06-01') }];
  const today = d('2025-01-20');

  it('finishes the work whose window has closed, on the day the plan said', () => {
    const done = seedStepStates({
      stages,
      activities: [act('A-01', 'a', [step(1, 1), step(2, 1), step(3, 1), step(4, 1)])],
      today,
      stallActivities: 0,
    });
    expect(done.map((x) => x.stepN)).toEqual([1, 2]);
    expect(done[0].doneAt).toEqual(d('2025-01-08'));
    expect(done[1].doneAt).toEqual(d('2025-01-15'));
  });

  it('leaves nothing finished in a stage that has not started', () => {
    const done = seedStepStates({
      stages: [{ id: 'a', start: d('2026-01-01'), end: d('2026-06-01') }],
      activities: [act('A-01', 'a', [step(1, 1), step(2, 1)])],
      today,
      stallActivities: 0,
    });
    expect(done).toEqual([]);
  });

  it('ignores an activity whose stage the programme does not run', () => {
    const done = seedStepStates({
      stages,
      activities: [act('Z-01', 'gone', [step(1, 1)])],
      today,
      stallActivities: 0,
    });
    expect(done).toEqual([]);
  });
});

describe('where the work is stuck', () => {
  const stages = [
    { id: 'a', start: d('2025-01-01'), end: d('2025-06-01') },
    { id: 'b', start: d('2025-01-01'), end: d('2025-06-01') },
    /* not in flight: it closed before today */
    { id: 'past', start: d('2024-01-01'), end: d('2024-06-01') },
  ];
  const today = d('2025-01-20');
  const four = [step(1, 1), step(2, 1), step(3, 1), step(4, 1)];

  it('stalls one activity per stage in flight, and none in a stage that is not', () => {
    const stalls = pickStalls({
      stages,
      activities: [
        act('A-01', 'a', four),
        act('B-01', 'b', four),
        act('P-01', 'past', four),
      ],
      today,
    });
    expect(stalls).toEqual(['A-01', 'B-01']);
  });

  it('takes one from the middle, not the top of the table', () => {
    const stalls = pickStalls({
      stages: [stages[0]],
      activities: [act('A-01', 'a', four), act('A-02', 'a', four), act('A-03', 'a', four)],
      today,
    });
    expect(stalls).toEqual(['A-02']);
  });

  it('only considers an activity genuinely mid-run', () => {
    const stalls = pickStalls({
      stages: [stages[0]],
      /* finished: every step closed before today */
      activities: [
        act('DONE-01', 'a', [step(1, 1), step(2, 1)]),
        /* not begun: every step still ahead */
        act('SOON-01', 'a', [step(1, 40), step(2, 1)]),
      ],
      today,
    });
    expect(stalls).toEqual([]);
  });

  it('stops at the limit it is given', () => {
    expect(
      pickStalls({
        stages,
        activities: [act('A-01', 'a', four), act('B-01', 'b', four)],
        today,
        stallActivities: 1,
      }),
    ).toEqual(['A-01']);
  });

  it('leaves the last finished steps of a stalled activity open, and no others', () => {
    const done = seedStepStates({
      stages: [stages[0]],
      activities: [act('A-01', 'a', four)],
      /* steps 1-3 have closed, step 4 ends today: genuinely mid-run, so it can
         stall. Two deep leaves 2 and 3 open and 1 finished. */
      today: d('2025-01-29'),
      stallActivities: 1,
      stallDepth: 2,
    });
    expect(done.map((x) => x.stepN)).toEqual([1]);
  });

  it('does not stall an activity that has already finished', () => {
    const stalls = pickStalls({
      stages: [stages[0]],
      activities: [act('A-01', 'a', four)],
      today: d('2025-01-30'),
    });
    expect(stalls).toEqual([]);
  });

  it('stalls nothing when asked for no stalls', () => {
    const done = seedStepStates({
      stages: [stages[0]],
      activities: [act('A-01', 'a', four)],
      today: d('2025-01-30'),
      stallActivities: 0,
    });
    expect(done.map((x) => x.stepN)).toEqual([1, 2, 3, 4]);
  });

  /* This is the shape the prototype had to be fixed into: an activity stops,
     and everything before where it stopped is finished. Step 1 open while 2 to
     8 are complete is not something that happens. */
  it('stalls an activity at its own frontier, never in the middle of a finished run', () => {
    const activities = [act('A-01', 'a', four)];
    const done = seedStepStates({
      stages: [stages[0]],
      activities,
      today: d('2025-01-29'),
      stallActivities: 1,
    });
    const doneNumbers = new Set(done.map((x) => x.stepN));
    const pattern = plannedSteps(stages[0].start, activities[0])
      .map((s) => (doneNumbers.has(s.n) ? 'D' : 'o'))
      .join('');
    expect(pattern).toMatch(/^D*o*$/);
  });
});

describe('the seeded programme, on its real schedule', () => {
  /* Exactly what prisma/seedProject.ts builds: kickoff 66 weeks back, so the
     programme is half way through its 132-week baseline. */
  const today = startOfDay(new Date());
  const schedule = computeSchedule(addWeeks(today, -66), BUILTIN_PROFILE, {});
  const stages = STAGE_ORDER.map((id) => ({
    id,
    start: schedule.stages[id].start,
    end: schedule.stages[id].end,
  }));
  const activities = Object.keys(activitySteps).map((ref) =>
    fromStepIndex(ref, activitySteps[ref]),
  );
  const done = seedStepStates({ stages, activities, today });
  const doneKeys = new Set(done.map((x) => `${x.activityRef}:${x.stepN}`));

  const closed = activities.flatMap((a) => {
    const span = schedule.stages[a.stageId];
    return span
      ? plannedSteps(span.start, a)
          .filter((s) => s.end < today)
          .map((s) => `${a.ref}:${s.n}`)
      : [];
  });

  it('leaves a handful of steps late, not hundreds and not none', () => {
    const late = closed.filter((k) => !doneKeys.has(k));
    expect(late.length).toBeGreaterThan(0);
    expect(late.length).toBeLessThanOrEqual(STALL_DEPTH * 6);
  });

  it('spreads them across stages rather than sinking one', () => {
    const stalls = pickStalls({ stages, activities, today });
    const stalledStages = new Set(
      stalls.map((ref) => activities.find((a) => a.ref === ref)!.stageId),
    );
    expect(stalledStages.size).toBe(stalls.length);
    expect(stalls.length).toBeGreaterThan(1);
  });

  it('never leaves an open step behind a finished one, anywhere', () => {
    for (const a of activities) {
      const span = schedule.stages[a.stageId];
      if (!span) continue;
      const pattern = plannedSteps(span.start, a)
        .map((s) => (doneKeys.has(`${a.ref}:${s.n}`) ? 'D' : 'o'))
        .join('');
      expect(pattern, `${a.ref} runs ${pattern}`).toMatch(/^D*o*$/);
    }
  });

  it('has finished a serious amount of the programme', () => {
    expect(done.length).toBeGreaterThan(100);
    expect(done.length).toBeLessThan(1649);
  });
});
