import { describe, expect, it, vi } from 'vitest';
import type { CommentNode, MoreNode } from './comments';
import type { Post } from './reddit-data';
import { type FetchJson, loadMoreItems, moreChildrenPath, threadJsonPath } from './thread-loader';

const post = { id: 'post', fullname: 't3_post' } as Post;

describe('paths', () => {
  it('builds the thread address, with an optional branch', () => {
    expect(threadJsonPath('post', 'top')).toBe(
      '/comments/post/.json?raw_json=1&limit=200&sort=top',
    );
    expect(threadJsonPath('post', 'new', 'abc')).toBe(
      '/comments/post/_/abc/.json?raw_json=1&limit=200&sort=new',
    );
  });

  it('builds the morechildren address', () => {
    expect(moreChildrenPath('t3_post', ['a', 'b'], 'confidence')).toBe(
      '/api/morechildren.json?api_type=json&raw_json=1&link_id=t3_post&children=a%2Cb&sort=confidence',
    );
  });
});

const t1 = (id: string, parent: string) => ({
  kind: 't1',
  data: { name: `t1_${id}`, id, parent_id: parent, replies: '' },
});

describe('loadMoreItems', () => {
  it('asks for at most 100 ids and leaves a stub for the rest', async () => {
    const ids = Array.from({ length: 130 }, (_, i) => `c${String(i)}`);
    const more: MoreNode = {
      kind: 'more',
      id: 'm',
      parentFullname: 't1_p',
      count: 140,
      children: ids,
      depth: 1,
    };
    const fetchJson = vi.fn<FetchJson>(async () =>
      Promise.resolve({ json: { data: { things: [t1('c0', 't1_p')] } } }),
    );
    const items = await loadMoreItems(fetchJson, post, more, 'confidence');
    const asked = new URL(`https://x${String(fetchJson.mock.calls[0]?.[0])}`).searchParams
      .get('children')
      ?.split(',');
    expect(asked).toHaveLength(100);
    expect(items[0]).toMatchObject({ kind: 'comment', fullname: 't1_c0' });
    expect(items[1]).toMatchObject({ kind: 'more', id: 'm+100', count: 40 });
    expect((items[1] as MoreNode).children).toHaveLength(30);
  });

  it('loads the parent branch for "continue this thread"', async () => {
    const more: MoreNode = {
      kind: 'more',
      id: '_',
      parentFullname: 't1_deep',
      count: 0,
      children: [],
      depth: 10,
    };
    const listing = (children: unknown[]) => ({ kind: 'Listing', data: { children } });
    const fetchJson = vi.fn<FetchJson>(async () =>
      Promise.resolve([
        listing([{ kind: 't3', data: { name: 't3_post', id: 'post' } }]),
        listing([
          {
            kind: 't1',
            data: { name: 't1_deep', id: 'deep', replies: listing([t1('next', 't1_deep')]) },
          },
        ]),
      ]),
    );
    const items = await loadMoreItems(fetchJson, post, more, 'top');
    expect(fetchJson.mock.calls[0]?.[0]).toContain('/comments/post/_/deep/.json');
    expect((items[0] as CommentNode).fullname).toBe('t1_next');
  });
});
