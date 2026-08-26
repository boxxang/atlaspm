import { describe, expect, it } from 'vitest';
import { parseRich } from '@/lib/activityRefs';

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
