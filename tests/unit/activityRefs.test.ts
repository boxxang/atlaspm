import { describe, expect, it } from 'vitest';
import { parseRich } from '@/lib/activityRefs';
import {
  detailActivityTitles,
  hasActivityDetail,
  writtenActivities,
} from '@/data/activityIndex';
import { activityDetails } from '@/data/activityDetails';
import { journeyData } from '@/data/journey';
import { activityRowId } from '@/lib/rowIds';

/**
 * A write-up names other activities in its prose — "PPA targets from DEF-03".
 * The reader wants to follow that, so the ID has to come out of the string as
 * something the page can turn into a link. The strings also carry a little
 * markup (<b>, <code>), and an ID sits inside it as often as beside it.
 */
describe('activity references in a write-up', () => {
  it('splits an ID out of plain prose', () => {
    expect(parseRich('PPA targets from DEF-03')).toEqual([
      { kind: 'text', text: 'PPA targets from ' },
      { kind: 'ref', id: 'DEF-03' },
    ]);
  });

  it('finds every ID, not just the first', () => {
    const nodes = parseRich('DEF-02 and ARCH-01 both feed it');
    expect(nodes.filter((n) => n.kind === 'ref')).toEqual([
      { kind: 'ref', id: 'DEF-02' },
      { kind: 'ref', id: 'ARCH-01' },
    ]);
  });

  it('keeps the markup and reaches the ID inside it', () => {
    expect(parseRich('This activity defines <code>DEF-02</code>.')).toEqual([
      { kind: 'text', text: 'This activity defines ' },
      { kind: 'tag', tag: 'code', children: [{ kind: 'ref', id: 'DEF-02' }] },
      { kind: 'text', text: '.' },
    ]);
  });

  it('nests one tag inside another', () => {
    expect(parseRich('<b>A <code>B</code></b>')).toEqual([
      {
        kind: 'tag',
        tag: 'b',
        children: [
          { kind: 'text', text: 'A ' },
          { kind: 'tag', tag: 'code', children: [{ kind: 'text', text: 'B' }] },
        ],
      },
    ]);
  });

  /* A deliverable is not an activity and has no page of its own. */
  it('leaves deliverable IDs alone', () => {
    expect(parseRich('recorded in DEF-D1')).toEqual([
      { kind: 'text', text: 'recorded in DEF-D1' },
    ]);
  });

  it('does not take a lower-cased word or a bare number for an ID', () => {
    expect(parseRich('PCIe-16 lanes over 4 weeks')).toEqual([
      { kind: 'text', text: 'PCIe-16 lanes over 4 weeks' },
    ]);
  });

  it('decodes the entities the strings are written with', () => {
    expect(parseRich('cost &amp; margin')).toEqual([
      { kind: 'text', text: 'cost & margin' },
    ]);
  });

  /* Content is authored by hand; a stray tag must not lose the sentence. */
  it('keeps the text when a tag is never closed', () => {
    expect(parseRich('<b>unclosed')).toEqual([
      { kind: 'tag', tag: 'b', children: [{ kind: 'text', text: 'unclosed' }] },
    ]);
  });

  it('passes a tag it does not know through as text', () => {
    expect(parseRich('a <i>b</i>')).toEqual([{ kind: 'text', text: 'a <i>b</i>' }]);
  });

  it('returns nothing for an empty string', () => {
    expect(parseRich('')).toEqual([]);
  });
});

describe('which activities open a page', () => {
  it('knows the written ones and refuses everything else', () => {
    expect(writtenActivities).toHaveLength(259);
    expect(hasActivityDetail('DEF-01')).toBe(true);
    expect(hasActivityDetail('MP-12')).toBe(true);
    /* the shape of a row ID, but no row has it */
    expect(hasActivityDetail('DEF-99')).toBe(false);
    expect(hasActivityDetail('ZZZ-01')).toBe(false);
    /* a deliverable is not an activity */
    expect(hasActivityDetail('DEF-D1')).toBe(false);
  });

  it('lists them in the order the programme runs them', () => {
    expect(writtenActivities[0]).toBe('DEF-01');
    expect(writtenActivities[writtenActivities.length - 1]).toBe('MP-12');
  });
});

/**
 * The engineering table prints a row's title from the profile; the page that
 * row opens prints the same title, because it reads that same table. The index
 * used for tooltips and chips is a third copy. If they drift, a chip promises
 * one activity and the page delivers another.
 */
describe('the table, the index and the write-ups name the same activities', () => {
  it('gives every row of every stage a write-up', () => {
    const rows = journeyData.flatMap((s) =>
      s.engineeringView.map((_, i) => activityRowId(s.shortTitle, i)),
    );
    expect(rows).toHaveLength(259);
    expect(rows.filter((id) => !hasActivityDetail(id))).toEqual([]);
  });

  it('titles the index exactly as the profile titles the row', () => {
    const drift = journeyData.flatMap((s) =>
      s.engineeringView
        .map((title, i) => ({ id: activityRowId(s.shortTitle, i), title }))
        .filter(({ id, title }) => detailActivityTitles[id] !== title),
    );
    expect(drift).toEqual([]);
  });

  it('files every write-up under a stage the profile has', () => {
    const stages = new Set(journeyData.map((s) => s.id));
    const orphans = writtenActivities.filter((id) => !stages.has(activityDetails[id].stage));
    expect(orphans).toEqual([]);
  });
});

/**
 * The steps table prints an activity's outputs against the step that yields
 * them, by step number. An output naming a number no step has is not a
 * rendering bug that shows the wrong thing — it shows nothing at all, and the
 * output disappears from the page in silence. The port repairs these; this is
 * what says so.
 */
describe('every output names a step that exists', () => {
  it('leaves no output stranded off the end of the steps', () => {
    const stranded = writtenActivities.flatMap((id) => {
      const d = activityDetails[id];
      const ns = new Set(d.steps.map((s) => s.n));
      return d.producedBy
        .map((n, i) => ({ id, n, out: d.produces[i] }))
        .filter((x) => !ns.has(x.n));
    });
    expect(stranded).toEqual([]);
  });

  it('names a producing step for every output, and no more', () => {
    const ragged = writtenActivities
      .map((id) => ({ id, ...activityDetails[id] }))
      .filter((d) => d.produces.length !== d.producedBy.length);
    expect(ragged.map((d) => d.id)).toEqual([]);
  });
});

/**
 * What a step adds is printed beside it. A blank one draws an empty line where
 * an output should be, and untrimmed text pushes the column off its baseline —
 * both were in the authoring document and both are cleaned at the port.
 */
describe('what a step adds is printed, so it has to be printable', () => {
  it('gives every output some text', () => {
    const blank = writtenActivities.flatMap((id) =>
      activityDetails[id].produces.filter((p) => !p.trim()).map(() => id),
    );
    expect(blank).toEqual([]);
  });

  it('leaves no step or output padded with whitespace', () => {
    const padded = writtenActivities.flatMap((id) => {
      const d = activityDetails[id];
      return [...d.steps.map((s) => s.text), ...d.produces]
        .filter((t) => t !== t.trim() || /\s{2,}|\n/.test(t))
        .map((t) => `${id}: ${JSON.stringify(t)}`);
    });
    expect(padded).toEqual([]);
  });

  it('gives every step something to show in the column', () => {
    const silent = writtenActivities.flatMap((id) => {
      const d = activityDetails[id];
      const has = new Set(d.producedBy);
      return d.steps.filter((s) => !has.has(s.n)).map((s) => `${id} step ${s.n}`);
    });
    expect(silent).toEqual([]);
  });
});
