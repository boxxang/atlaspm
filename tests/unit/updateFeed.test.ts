import { describe, expect, it } from 'vitest';
import { isFeedPost, threads, whenSaid } from '@/lib/updateFeed';

const d = (iso: string) => new Date(`${iso}T00:00:00`);

interface P {
  id: string;
  kind: string;
  parentId: string | null;
  createdAt: Date;
  editedAt: Date | null;
}

const post = (id: string, on: string, over: Partial<P> = {}): P => ({
  id,
  kind: 'update',
  parentId: null,
  createdAt: d(on),
  editedAt: null,
  ...over,
});

const reply = (id: string, parentId: string, on: string, over: Partial<P> = {}): P =>
  post(id, on, { kind: 'reply', parentId, ...over });

/* Everything written in the app is a post, which is the point — but a
   key-info note is a page kept on a stage, not a thing said on a day. */
describe('isFeedPost', () => {
  it('carries what was said about the work', () => {
    for (const kind of ['update', 'risk', 'handover', 'reply']) {
      expect(isFeedPost({ kind })).toBe(true);
    }
  });

  it('leaves a key-info note out', () => {
    expect(isFeedPost({ kind: 'note' })).toBe(false);
  });

  /* A kind this has never heard of is more likely a new way of saying
     something than a new kind of page, so it is carried. */
  it('carries a kind it does not know', () => {
    expect(isFeedPost({ kind: 'decision' })).toBe(true);
  });
});

describe('whenSaid', () => {
  it('is when it was written, or when it was last changed', () => {
    expect(whenSaid(post('a', '2024-01-01'))).toEqual(d('2024-01-01'));
    expect(whenSaid(post('a', '2024-01-01', { editedAt: d('2024-02-01') }))).toEqual(d('2024-02-01'));
  });
});

describe('threads', () => {
  it('gives one row per post that started a thread', () => {
    const rows = threads([post('a', '2024-01-01'), post('b', '2024-01-02')]);
    expect(rows.map((t) => t.root.id)).toEqual(['b', 'a']);
    expect(rows.every((t) => t.replies.length === 0)).toBe(true);
    expect(rows[0].latest).toBeNull();
  });

  /* A reply alone says nothing you can place — "Closed." with no sign of what
     was closed — so it belongs to the post it answers. */
  it('folds a reply into the post it answers, rather than listing it', () => {
    const rows = threads([post('a', '2024-01-01'), reply('c1', 'a', '2024-01-05')]);
    expect(rows).toHaveLength(1);
    expect(rows[0].root.id).toBe('a');
    expect(rows[0].replies.map((r) => r.id)).toEqual(['c1']);
  });

  /* What "updates" means to somebody scanning for what moved. */
  it('raises a thread to when it was last spoken in', () => {
    const rows = threads([
      post('old', '2024-01-01'),
      reply('c1', 'old', '2024-06-01'),
      post('new', '2024-03-01'),
    ]);
    expect(rows.map((t) => t.root.id)).toEqual(['old', 'new']);
    expect(rows[0].at).toEqual(d('2024-06-01'));
  });

  it('reads the replies in the order they were written, newest last', () => {
    const rows = threads([
      post('a', '2024-01-01'),
      reply('c2', 'a', '2024-03-01'),
      reply('c1', 'a', '2024-02-01'),
    ]);
    expect(rows[0].replies.map((r) => r.id)).toEqual(['c1', 'c2']);
    expect(rows[0].latest?.id).toBe('c2');
  });

  it('hangs a reply to a reply off the post that started the thread', () => {
    const rows = threads([
      post('a', '2024-01-01'),
      reply('c1', 'a', '2024-02-01'),
      reply('c2', 'c1', '2024-03-01'),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].replies.map((r) => r.id)).toEqual(['c1', 'c2']);
  });

  /* A note is a page; what was said on it belongs to the page, not the feed. */
  it('leaves out a note and everything said on it', () => {
    const rows = threads([
      post('n', '2024-01-01', { kind: 'note' }),
      reply('c1', 'n', '2024-02-01'),
      post('a', '2024-01-02'),
    ]);
    expect(rows.map((t) => t.root.id)).toEqual(['a']);
  });

  it('leaves out a reply whose parent is not there', () => {
    expect(threads([reply('c1', 'gone', '2024-01-01')])).toEqual([]);
  });

  it('does not hang on a parentId that loops', () => {
    const a = reply('a', 'b', '2024-01-01');
    const b = reply('b', 'a', '2024-01-02');
    expect(() => threads([a, b])).not.toThrow();
    expect(threads([a, b])).toEqual([]);
  });

  it('sorts a thread by its last word, edits included', () => {
    const rows = threads([
      post('a', '2024-01-01'),
      post('b', '2024-01-02'),
      reply('c1', 'a', '2024-01-03', { editedAt: d('2024-05-01') }),
    ]);
    expect(rows[0].root.id).toBe('a');
    expect(rows[0].at).toEqual(d('2024-05-01'));
  });
});
