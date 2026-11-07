import { describe, expect, it } from 'vitest';
import {
  type CommentNode,
  parseMoreChildren,
  parseThreadPage,
  replaceMore,
  replyCount,
  updateComment,
} from './comments';

const t1 = (id: string, data: Record<string, unknown> = {}) => ({
  kind: 't1',
  data: {
    name: `t1_${id}`,
    id,
    author: `user_${id}`,
    body_html: `<div class="md"><p>${id}</p></div>`,
    score: 5,
    created_utc: 1,
    depth: 0,
    parent_id: 't3_post',
    permalink: `/r/x/comments/post/t/${id}/`,
    replies: '',
    ...data,
  },
});

const listing = (items: unknown[]) => ({ kind: 'Listing', data: { children: items } });

const page = [
  listing([{ kind: 't3', data: { name: 't3_post', id: 'post', title: 'Post' } }]),
  listing([
    t1('a', {
      is_submitter: true,
      likes: true,
      replies: listing([
        t1('b', { depth: 1, parent_id: 't1_a' }),
        {
          kind: 'more',
          data: {
            id: 'm1',
            name: 't1_m1',
            parent_id: 't1_a',
            count: 4,
            depth: 1,
            children: ['c', 'd'],
          },
        },
      ]),
    }),
    t1('e', { collapsed: true, score_hidden: true, distinguished: 'moderator', stickied: true }),
  ]),
];

describe('parseThreadPage', () => {
  it('reads the post and the comment tree', () => {
    const { post, comments } = parseThreadPage(page);
    expect(post.title).toBe('Post');
    expect(comments).toHaveLength(2);
    const a = comments[0] as CommentNode;
    expect(a).toMatchObject({ fullname: 't1_a', isSubmitter: true, likes: true, depth: 0 });
    expect(a.replies.map((r) => r.kind)).toEqual(['comment', 'more']);
    expect(a.replies[1]).toMatchObject({ kind: 'more', count: 4, children: ['c', 'd'] });
    expect(comments[1]).toMatchObject({
      collapsed: true,
      scoreHidden: true,
      distinguished: 'moderator',
      stickied: true,
    });
  });

  it('counts replies, including the ones not loaded yet', () => {
    const a = parseThreadPage(page).comments[0] as CommentNode;
    expect(replyCount(a)).toBe(5); // b + 4 more
  });

  it('rejects something that is not a thread', () => {
    expect(() => parseThreadPage({})).toThrow('Not a Reddit thread');
  });
});

describe('parseMoreChildren and replaceMore', () => {
  it('rebuilds the branches and swaps them in for the stub', () => {
    const loaded = parseMoreChildren({
      json: {
        errors: [],
        data: {
          things: [
            t1('c', { depth: 1, parent_id: 't1_a' }),
            t1('f', { depth: 2, parent_id: 't1_c' }),
            t1('d', { depth: 1, parent_id: 't1_a' }),
          ],
        },
      },
    });
    expect(loaded.map((i) => (i as CommentNode).id)).toEqual(['c', 'd']);
    expect((loaded[0] as CommentNode).replies.map((i) => (i as CommentNode).id)).toEqual(['f']);

    const { comments } = parseThreadPage(page);
    const next = replaceMore(comments, 'm1', loaded);
    const a = next[0] as CommentNode;
    expect(a.replies.map((i) => (i as CommentNode).id)).toEqual(['b', 'c', 'd']);
    // The original tree is not changed.
    expect((comments[0] as CommentNode).replies[1]?.kind).toBe('more');
  });

  it('gives an empty list for an empty or odd answer', () => {
    expect(parseMoreChildren({})).toEqual([]);
  });
});

describe('updateComment', () => {
  it('changes one nested comment without touching the rest', () => {
    const { comments } = parseThreadPage(page);
    const next = updateComment(comments, 't1_b', (c) => ({ ...c, score: 99 }));
    const b = (next[0] as CommentNode).replies[0] as CommentNode;
    expect(b.score).toBe(99);
    expect(((comments[0] as CommentNode).replies[0] as CommentNode).score).toBe(5);
    expect(next[1]).toBe(comments[1]);
  });
});
