import { describe, expect, it } from 'vitest';
import { journeyData } from '@/data/journey';
import {
  fromLines,
  isEmptyOverride,
  normaliseOverride,
  resolveStageDetail,
  toLines,
} from '@/lib/stageDetail';

const pd = journeyData.find((s) => s.id === 'productDefinition')!;

describe('resolving stage detail', () => {
  it('falls back to the shared stage text when nothing is overridden', () => {
    const r = resolveStageDetail(pd, null);
    expect(r.description).toBe(pd.description);
    expect(r.engineeringView).toEqual([...pd.engineeringView]);
    expect(r.tools).toEqual([...pd.tools]);
    expect(r.overridden.size).toBe(0);
  });

  it('takes an overridden field and leaves the rest on the default', () => {
    const r = resolveStageDetail(pd, { description: 'Our own framing of this stage.' });
    expect(r.description).toBe('Our own framing of this stage.');
    expect(r.programView).toEqual([...pd.programView]);
    expect([...r.overridden]).toEqual(['description']);
  });

  it('reads list fields as one item per line, ignoring blank lines', () => {
    const r = resolveStageDetail(pd, { engineeringView: 'First\n\n  Second  \nThird\n' });
    expect(r.engineeringView).toEqual(['First', 'Second', 'Third']);
    expect(r.overridden.has('engineeringView')).toBe(true);
  });

  it('treats an empty or whitespace override as no override', () => {
    const r = resolveStageDetail(pd, { description: '   ', tools: '\n\n' });
    expect(r.description).toBe(pd.description);
    expect(r.tools).toEqual([...pd.tools]);
    expect(r.overridden.size).toBe(0);
  });
});

describe('normalising what the form submits', () => {
  /* The form carries the stage text only: the engineering list and its
     man-months are edited in their own table and pass through untouched. */
  const blank = {
    description: '',
    programView: '',
    tools: '',
    collaboration: '',
  };

  it('clears a field that was emptied rather than storing emptiness', () => {
    const o = normaliseOverride({ ...blank, description: '   ' }, pd);
    expect(o.description).toBeNull();
    expect(isEmptyOverride(o)).toBe(true);
  });

  it('tidies list input before storing it', () => {
    const o = normaliseOverride({ ...blank, tools: '  A \n\n B \n' }, pd);
    expect(o.tools).toBe('A\nB');
    expect(isEmptyOverride(o)).toBe(false);
  });

  it('stores nothing for a field left on the shared default', () => {
    // the editor is seeded with resolved values, so an untouched field arrives
    // holding the shared text — it must not be frozen as an override
    const seeded = {
      description: pd.description,
      programView: fromLines(pd.programView),
      tools: fromLines(pd.tools),
      collaboration: fromLines(pd.collaboration),
    };
    expect(isEmptyOverride(normaliseOverride(seeded, pd))).toBe(true);

    const edited = normaliseOverride({ ...seeded, description: 'Ours' }, pd);
    expect(edited.description).toBe('Ours');
    expect(edited.engineeringView).toBeNull();
    expect(edited.tools).toBeNull();
    expect(resolveStageDetail(pd, edited).overridden.size).toBe(1);
  });

  it('carries the engineering list through untouched', () => {
    /* The regression this pass fixed: saving the text form used to write back
       the list as it was when the form opened, wiping anything added to the
       table in between. */
    const live = 'Live one\nLive two';
    const o = normaliseOverride(
      { ...blank, description: 'Ours', engineeringView: live, engineeringEffort: '2\n3' },
      pd,
    );
    expect(o.engineeringView).toBe(live);
    expect(o.engineeringEffort).toBe('2\n3');
    expect(resolveStageDetail(pd, o).engineeringView).toEqual(['Live one', 'Live two']);

    // and an untouched list stays untouched — null, not a frozen copy
    const none = normaliseOverride({ ...blank, description: 'Ours' }, pd);
    expect(none.engineeringView).toBeNull();
    expect(resolveStageDetail(pd, none).engineeringView).toEqual([...pd.engineeringView]);
  });

  it('round-trips through resolve', () => {
    const o = normaliseOverride(
      { ...blank, description: 'Custom', programView: 'One\nTwo' },
      pd,
    );
    const r = resolveStageDetail(pd, o);
    expect(r.description).toBe('Custom');
    expect(r.programView).toEqual(['One', 'Two']);
    expect(r.engineeringView).toEqual([...pd.engineeringView]);
  });
});

describe('line helpers', () => {
  it('splits and joins symmetrically', () => {
    expect(toLines('a\nb')).toEqual(['a', 'b']);
    expect(fromLines(['a', 'b'])).toBe('a\nb');
    expect(toLines(fromLines(['a', 'b']))).toEqual(['a', 'b']);
    expect(toLines('')).toEqual([]);
  });
});

describe('the engineering list is a board, not a text field', () => {
  it('null inherits the shared activities', () => {
    expect(resolveStageDetail(pd, null).engineeringView).toEqual([...pd.engineeringView]);
    expect(resolveStageDetail(pd, {}).engineeringView).toEqual([...pd.engineeringView]);
  });

  it('an empty string means the program emptied it, not that it wants defaults', () => {
    const r = resolveStageDetail(pd, { engineeringView: '' });
    expect(r.engineeringView).toEqual([]);
    expect(r.manMonths).toBe(0);
    expect(r.overridden.has('engineeringView')).toBe(true);
  });

  it('keeps the row alive for an emptied list', () => {
    expect(isEmptyOverride({ engineeringView: '' })).toBe(false);
    expect(isEmptyOverride({ engineeringView: null })).toBe(true);
    expect(isEmptyOverride({})).toBe(true);
  });
});
