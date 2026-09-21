import { describe, expect, it } from 'vitest';
import { feedPosts, isFeedPost } from '@/lib/updateFeed';

/* Everything written in the app is a post, which is the point — but the
   Updates feed is a record of what has been said about the work, and a
   key-info note is a page kept on a stage rather than a thing said on a day. */
describe('isFeedPost', () => {
  it('carries what was said about the work', () => {
    for (const kind of ['update', 'risk', 'handover', 'reply']) {
      expect(isFeedPost({ kind })).toBe(true);
    }
  });

  it('leaves a key-info note out', () => {
    expect(isFeedPost({ kind: 'note' })).toBe(false);
  });

  /* A kind this predicate has never heard of is more likely a new way of
     saying something than a new kind of page, so it is carried. */
  it('carries a kind it does not know', () => {
    expect(isFeedPost({ kind: 'decision' })).toBe(true);
  });
});

describe('feedPosts', () => {
  const posts = [
    { id: 'a', kind: 'update' },
    { id: 'b', kind: 'note' },
    { id: 'c', kind: 'risk' },
    { id: 'd', kind: 'note' },
    { id: 'e', kind: 'reply' },
  ];

  it('keeps the order it was given, minus the notes', () => {
    expect(feedPosts(posts).map((p) => p.id)).toEqual(['a', 'c', 'e']);
  });

  it('does not touch what it was given', () => {
    feedPosts(posts);
    expect(posts).toHaveLength(5);
  });
});
