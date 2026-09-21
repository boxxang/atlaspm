import { describe, expect, it } from 'vitest';
import { feedPosts, firstLine, isFeedPost, replyContext } from '@/lib/updateFeed';

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

/* A reply carries no target of its own — its parent holds them — so in a flat
   feed it arrives with nothing saying what it answers or where it belongs. */
describe('replyContext', () => {
  const risk = {
    id: 'r1', kind: 'risk', parentId: null,
    text: 'Gate count grew in 9 of 60 blocks at FFN, by 11% on average.\nOwner: Jaehyuk Yoon.',
    stageId: 'physicalDesign', activityRef: 'PD-15', stepN: 1,
  };
  const reply = {
    id: 'c1', kind: 'reply', parentId: 'r1', text: 'Closed at the retrospective.',
    stageId: null, activityRef: null, stepN: null,
  };

  it('names the post a reply is answering, by its first line', () => {
    const ctx = replyContext([risk, reply]);
    expect(ctx.c1.subject).toBe('Gate count grew in 9 of 60 blocks at FFN, by 11% on average.');
  });

  it('borrows where the parent lives, so the reply can be got to', () => {
    const { c1 } = replyContext([risk, reply]);
    expect(c1.stageId).toBe('physicalDesign');
    expect(c1.activityRef).toBe('PD-15');
    expect(c1.stepN).toBe(1);
  });

  /* A thread is named after the post that started it, so a reply to a reply
     should not be labelled with somebody's answer. */
  it('follows a chain up to the post that started the thread', () => {
    const second = { ...reply, id: 'c2', parentId: 'c1', text: 'Agreed.' };
    const ctx = replyContext([risk, reply, second]);
    expect(ctx.c2.subject).toBe(ctx.c1.subject);
    expect(ctx.c2.stepN).toBe(1);
  });

  it('says nothing about a post that is not a reply', () => {
    expect(replyContext([risk, reply])).not.toHaveProperty('r1');
  });

  it('leaves out a reply whose parent is not there', () => {
    expect(replyContext([{ ...reply, parentId: 'gone' }])).toEqual({});
  });

  it('does not hang on a parentId that loops', () => {
    const a = { ...risk, id: 'a', kind: 'reply', parentId: 'b' };
    const b = { ...risk, id: 'b', kind: 'reply', parentId: 'a' };
    expect(() => replyContext([a, b])).not.toThrow();
  });
});

describe('firstLine', () => {
  it('is the first line that says anything', () => {
    expect(firstLine('\n\n  The title  \nthe body')).toBe('The title');
  });

  it('cuts a long one where it can still be recognised', () => {
    const long = 'x'.repeat(200);
    const cut = firstLine(long);
    expect(cut).toHaveLength(64);
    expect(cut.endsWith('…')).toBe(true);
  });

  it('is empty for a post that says nothing', () => {
    expect(firstLine('')).toBe('');
    expect(firstLine('   \n  ')).toBe('');
  });
});
