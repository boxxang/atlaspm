import { describe, expect, it } from 'vitest';
import { activityRevision, BUILTIN_ACTIVITY_REVISION } from '@/lib/builtinProfile';
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles } from '@/data/activityIndex';

/**
 * Whether the stored built-in profile is still the one the code describes.
 *
 * It used to be answered by counting: 259 rows stored, 259 rows in the code,
 * therefore up to date. Renumbering the activities broke that in the one way a
 * count cannot see — every reference kept its spelling and changed its meaning,
 * so the count matched, the check passed, and the database kept rows whose
 * titles and windows belonged to different activities.
 *
 * A digest over the rows answers it properly and still costs nothing on the
 * read path, which is what the count was protecting.
 */
const rows = (over: { ref: string; title: string; order: number; windowFrom: number }[]) =>
  over.map((r) => ({ stageKey: 'a', windowTo: r.windowFrom + 1, baseRef: r.ref, ...r }));

const BASE = rows([
  { ref: 'A-01', title: 'First', order: 0, windowFrom: 0 },
  { ref: 'A-02', title: 'Second', order: 1, windowFrom: 2 },
]);

describe('the built-in profile’s revision', () => {
  it('is the same for the same rows', () => {
    expect(activityRevision(BASE)).toBe(activityRevision(rows([
      { ref: 'A-01', title: 'First', order: 0, windowFrom: 0 },
      { ref: 'A-02', title: 'Second', order: 1, windowFrom: 2 },
    ])));
  });

  /* The case the count missed: same rows, same number of them, two titles
     swapped between references. */
  it('changes when two activities trade titles', () => {
    const swapped = rows([
      { ref: 'A-01', title: 'Second', order: 0, windowFrom: 0 },
      { ref: 'A-02', title: 'First', order: 1, windowFrom: 2 },
    ]);
    expect(activityRevision(swapped)).not.toBe(activityRevision(BASE));
  });

  it('changes when a window moves', () => {
    const moved = rows([
      { ref: 'A-01', title: 'First', order: 0, windowFrom: 1 },
      { ref: 'A-02', title: 'Second', order: 1, windowFrom: 2 },
    ]);
    expect(activityRevision(moved)).not.toBe(activityRevision(BASE));
  });

  it('changes when the order changes, even with the same rows in it', () => {
    const reordered = rows([
      { ref: 'A-01', title: 'First', order: 1, windowFrom: 0 },
      { ref: 'A-02', title: 'Second', order: 0, windowFrom: 2 },
    ]);
    expect(activityRevision(reordered)).not.toBe(activityRevision(BASE));
  });

  it('changes when a row is added', () => {
    expect(activityRevision([...BASE, ...rows([{ ref: 'A-03', title: 'Third', order: 2, windowFrom: 4 }])]))
      .not.toBe(activityRevision(BASE));
  });

  /* Short enough to store and compare on every render, which is the whole
     reason the old check counted instead. */
  it('is a short string: the row count, then the digest', () => {
    expect(BUILTIN_ACTIVITY_REVISION).toMatch(/^[0-9a-z]+-[0-9a-z]+$/);
    expect(BUILTIN_ACTIVITY_REVISION.length).toBeLessThanOrEqual(32);
    /* 259 activities, in base 36 */
    expect(BUILTIN_ACTIVITY_REVISION.split('-')[0]).toBe((259).toString(36));
  });
});

describe('the built-in activities the revision covers', () => {
  it('is every activity the template runs, titled as the index titles it', () => {
    const refs = Object.keys(activitySteps);
    expect(refs).toHaveLength(259);
    for (const ref of refs) expect(detailActivityTitles[ref]).toBeTruthy();
  });
});
