import { describe, expect, it } from 'vitest';
import { parseListing, parseMe, parseThread, postIdFrom, voteBody } from './reddit-data';

const postData = {
  name: 't3_abc123',
  id: 'abc123',
  title: 'Hello',
  subreddit: 'firefox',
  author: 'someone',
  score: 42,
  num_comments: 3,
  permalink: '/r/firefox/comments/abc123/hello/',
  url: 'https://example.com/',
  likes: true,
};

const listing = {
  kind: 'Listing',
  data: { children: [{ kind: 't3', data: postData }], after: null },
};

describe('parseListing', () => {
  it('reads posts from a feed', () => {
    const [post] = parseListing(listing);
    expect(post).toMatchObject({
      fullname: 't3_abc123',
      id: 'abc123',
      title: 'Hello',
      subreddit: 'firefox',
      author: 'someone',
      score: 42,
      numComments: 3,
      permalink: '/r/firefox/comments/abc123/hello/',
      url: 'https://example.com/',
      likes: true,
    });
  });

  it('treats a missing vote as null', () => {
    const noVote = {
      kind: 'Listing',
      data: { children: [{ kind: 't3', data: { ...postData, likes: null } }] },
    };
    expect(parseListing(noVote)[0]?.likes).toBeNull();
  });

  it('rejects something that is not a listing', () => {
    expect(() => parseListing({ error: 429 })).toThrow('Not a Reddit Listing');
  });
});

describe('parseThread', () => {
  it('reads the post and flattens nested comments with depth', () => {
    const comments = {
      kind: 'Listing',
      data: {
        children: [
          {
            kind: 't1',
            data: {
              name: 't1_c1',
              author: 'a',
              body: 'top',
              score: 5,
              depth: 0,
              replies: {
                kind: 'Listing',
                data: {
                  children: [
                    {
                      kind: 't1',
                      data: { name: 't1_c2', author: 'b', body: 'reply', score: 1, depth: 1 },
                    },
                    { kind: 'more', data: { count: 7 } },
                  ],
                },
              },
            },
          },
        ],
      },
    };
    const thread = parseThread([listing, comments]);
    expect(thread.post.title).toBe('Hello');
    expect(thread.comments.map((c) => [c.fullname, c.depth])).toEqual([
      ['t1_c1', 0],
      ['t1_c2', 1],
    ]);
  });

  it('rejects a non-thread', () => {
    expect(() => parseThread(listing)).toThrow('Not a Reddit thread');
  });
});

describe('parseMe', () => {
  it('reads the logged-in user', () => {
    expect(parseMe({ kind: 't2', data: { name: 'me', modhash: 'xyz' } })).toEqual({
      name: 'me',
      modhash: 'xyz',
      unread: 0,
    });
  });

  it('reads the unread count for the dot', () => {
    const me = (data: Record<string, unknown>) =>
      parseMe({ data: { name: 'me', modhash: 'xyz', ...data } })?.unread;
    expect(me({ inbox_count: 3, has_mail: true })).toBe(3);
    expect(me({ inbox_count: 0, has_mail: true })).toBe(1);
    expect(me({ inbox_count: 0, has_mail: false })).toBe(0);
    expect(me({ inbox_count: 'lots' })).toBe(0);
  });

  it('returns null when logged out', () => {
    expect(parseMe({})).toBeNull();
    expect(parseMe({ data: { name: 'me', modhash: '' } })).toBeNull();
  });
});

describe('postIdFrom', () => {
  it('reads old, www and short-form post URLs', () => {
    expect(postIdFrom('https://old.reddit.com/r/firefox/comments/AbC123/hello/')).toBe('abc123');
    expect(postIdFrom('https://www.reddit.com/r/firefox/comments/abc123')).toBe('abc123');
    expect(postIdFrom(' t3_abc123 ')).toBe('abc123');
  });

  it('rejects other sites and non-post pages', () => {
    expect(postIdFrom('https://evil.example/r/x/comments/abc123/')).toBeNull();
    expect(postIdFrom('https://old.reddit.com/r/firefox/')).toBeNull();
    expect(postIdFrom('hello')).toBeNull();
  });
});

describe('voteBody', () => {
  it('builds the form old.reddit.com sends', () => {
    expect(voteBody('t3_abc123', 1, 'hash')).toBe('id=t3_abc123&dir=1&uh=hash');
    expect(voteBody('t3_abc123', 0, 'hash')).toBe('id=t3_abc123&dir=0&uh=hash');
  });
});
