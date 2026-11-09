// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { loadSearchPage, parseSearchHtml, searchHtmlPath } from './search-page';

// Shaped like old.reddit.com's search page: subreddit results first (with
// their own "next" link), then post results with data-fullname.
const PAGE = `
<div class="search-result-group">
  <div class="search-result search-result-subreddit" data-fullname="t5_2ssp3">
    <a class="search-title" href="https://old.reddit.com/r/AskHistorians/">AskHistorians</a>
    <a class="option" href="#">leave</a>
    <a class="search-subreddit-link" href="https://old.reddit.com/r/AskHistorians/">r/AskHistorians</a>
    <div class="search-result-body"><p>The Portal for
      Public History.</p></div>
    <a href="https://old.reddit.com/r/AskHistorians/search?restrict_sr=on">search within</a>
  </div>
  <div class="search-result search-result-subreddit" data-fullname="t5_abc">
    <a class="search-subreddit-link" href="https://old.reddit.com/user/askhistorians/">u/askhistorians</a>
  </div>
  <div class="search-result search-result-subreddit" data-fullname="t5_def">
    <a class="search-subreddit-link" href="/r/u_somebody/">u/somebody</a>
  </div>
  <div class="search-result search-result-subreddit" data-fullname="t5_ghi">
    <a class="search-subreddit-link" href="/r/askhistorians_NSFW/">r/askhistorians_NSFW</a>
  </div>
  <footer class="nextprev">view more: <a href="https://old.reddit.com/search?q=x&amp;type=sr&amp;after=t5_2ssp3" rel="nofollow next">next ›</a></footer>
</div>
<div class="search-result-group">
  <div class="search-result search-result-link" data-fullname="t3_aaa111">
    <header><a class="search-title may-blank" href="https://old.reddit.com/r/AskHistorians/comments/aaa111/pirate_ships/">Were they on pirate ships?</a></header>
    <div class="search-result-meta">
      <span class="search-score">2,270 points</span>
      <a class="search-comments may-blank" href="https://old.reddit.com/r/AskHistorians/comments/aaa111/pirate_ships/">68 comments</a>
      submitted <span class="search-time"><time datetime="2026-11-05T10:00:00+00:00">1 day ago</time></span>
      by <span class="search-author"><a class="author" href="#">someone</a></span>
      <span>to <a class="search-subreddit-link may-blank" href="https://old.reddit.com/r/AskHistorians/">r/AskHistorians</a></span>
    </div>
    <div class="search-result-body"><p>See also <a href="https://old.reddit.com/r/AskHistorians/comments/zzz999/other/">this thread</a>.</p></div>
  </div>
  <div class="search-result search-result-link" data-fullname="t3_bbb222">
    <header><a class="search-title may-blank" href="https://old.reddit.com/r/books/comments/bbb222/dune/">Dune</a></header>
    <div class="search-result-meta">
      <span class="search-score">1 point</span>
      <a class="search-comments may-blank" href="https://old.reddit.com/r/books/comments/bbb222/dune/">no comments</a>
    </div>
    <div class="search-result-footer"><a class="search-link may-blank" href="https://example.com/dune">example.com</a></div>
  </div>
  <footer class="nextprev">view more: <a href="https://old.reddit.com/search?q=x&amp;count=25&amp;after=t3_bbb222" rel="nofollow next">next ›</a></footer>
</div>`;

const listing = (names: string[]) => ({
  kind: 'Listing',
  data: {
    after: null,
    children: names.map((name) => ({
      kind: 't3',
      data: { name, id: name.slice(3), title: `Full ${name}`, preview: {} },
    })),
  },
});

describe('searchHtmlPath', () => {
  it('keeps the search, drops old paging and our switch, adds the cursor', () => {
    expect(
      searchHtmlPath('/r/books/search', '?q=dune&restrict_sr=on&count=25&unred=on', 't3_x'),
    ).toBe('/r/books/search?q=dune&restrict_sr=on&after=t3_x');
    expect(searchHtmlPath('/search', '?q=dune', null)).toBe('/search?q=dune');
  });
});

describe('parseSearchHtml', () => {
  it('leaves out promoted (paid) results, M4 promo checklist', () => {
    const promo = `
      <div class="search-result search-result-link promotedlink" data-fullname="t3_ad0001">
        <a class="search-title" href="/r/ads/comments/ad0001/buy/">Buy this</a>
      </div>
      <div class="search-result search-result-link" data-promoted="true" data-fullname="t3_ad0002">
        <a class="search-title" href="/r/ads/comments/ad0002/buy/">Buy that</a>
      </div>`;
    const { hits } = parseSearchHtml(promo + PAGE);
    expect(hits.map((hit) => hit.fullname)).toEqual(['t3_aaa111', 't3_bbb222']);
  });

  it('leaves out promoted results in the older markup too', () => {
    const old = `
      <div class="promotedlink"><a class="search-title" href="/r/ads/comments/ad0003/x/">Ad</a></div>
      <div class="search-result"><a class="search-title" href="/r/books/comments/ccc333/y/">Real</a></div>`;
    expect(parseSearchHtml(old).hits.map((hit) => hit.fullname)).toEqual(['t3_ccc333']);
  });

  it('finds the posts in order, without subreddits or links inside post text', () => {
    const { hits } = parseSearchHtml(PAGE);
    expect(hits.map((hit) => hit.fullname)).toEqual(['t3_aaa111', 't3_bbb222']);
  });

  it('reads what the page shows about each post', () => {
    const [first, second] = parseSearchHtml(PAGE).hits;
    expect(first?.data).toMatchObject({
      title: 'Were they on pirate ships?',
      subreddit: 'AskHistorians',
      author: 'someone',
      score: 2270,
      num_comments: 68,
      permalink: '/r/AskHistorians/comments/aaa111/pirate_ships/',
      is_self: true,
      created_utc: Date.parse('2026-11-05T10:00:00Z') / 1000,
    });
    expect(second?.data).toMatchObject({
      score: 1,
      num_comments: 0,
      url: 'https://example.com/dune',
      is_self: false,
    });
  });

  it('reads the subreddit and user results, users told apart from subreddits', () => {
    expect(parseSearchHtml(PAGE).communities).toEqual([
      { kind: 'subreddit', name: 'AskHistorians', description: 'The Portal for Public History.' },
      { kind: 'user', name: 'askhistorians', description: '' },
      { kind: 'user', name: 'somebody', description: '' },
      { kind: 'subreddit', name: 'askhistorians_NSFW', description: '' },
    ]);
  });

  it('takes the posts cursor, not the subreddit list cursor', () => {
    expect(parseSearchHtml(PAGE).after).toBe('t3_bbb222');
  });

  it('falls back to title links when result blocks have no data-fullname', () => {
    const html =
      '<div class="search-result"><a class="search-title" href="/r/a/comments/ccc333/x/">X</a></div>';
    expect(parseSearchHtml(html).hits.map((hit) => hit.fullname)).toEqual(['t3_ccc333']);
  });

  it('finds nothing on a page with no results', () => {
    expect(parseSearchHtml('<p>there doesn’t seem to be anything here</p>')).toEqual({
      hits: [],
      after: null,
      communities: [],
    });
  });
});

describe('loadSearchPage', () => {
  it('loads the full posts from /by_id/ in the search order', async () => {
    const fetchJson = vi.fn((path: string) => {
      expect(path).toBe('/by_id/t3_aaa111,t3_bbb222.json?raw_json=1');
      return Promise.resolve(listing(['t3_bbb222', 't3_aaa111'])); // any order
    });
    const page = await loadSearchPage(
      () => Promise.resolve(PAGE),
      fetchJson,
      '/search',
      '?q=x',
      null,
    );
    expect(page.posts.map((post) => post.title)).toEqual(['Full t3_aaa111', 'Full t3_bbb222']);
    expect(page.after).toBe('t3_bbb222');
    expect(page.communities).toHaveLength(4);
  });

  it('gives subreddits and users with the first page only', async () => {
    const page = await loadSearchPage(
      () => Promise.resolve(PAGE),
      () => Promise.resolve(listing([])),
      '/search',
      '?q=x',
      't3_previous',
    );
    expect(page.communities).toBeUndefined();
  });

  it('uses the search page rows when /by_id/ is refused', async () => {
    const page = await loadSearchPage(
      () => Promise.resolve(PAGE),
      () => Promise.reject(new Error('HTTP 403')),
      '/search',
      '?q=x',
      null,
    );
    expect(page.posts.map((post) => post.title)).toEqual(['Were they on pirate ships?', 'Dune']);
    expect(page.posts[0]?.subreddit).toBe('AskHistorians');
  });

  it('asks for nothing more when the search found nothing', async () => {
    const fetchJson = vi.fn();
    const page = await loadSearchPage(
      () => Promise.resolve('<p>nothing</p>'),
      fetchJson,
      '/search',
      '?q=x',
      null,
    );
    expect(page).toEqual({ posts: [], after: null, communities: [] });
    expect(fetchJson).not.toHaveBeenCalled();
  });

  it('reports a failed search page', async () => {
    await expect(
      loadSearchPage(() => Promise.reject(new Error('HTTP 500')), vi.fn(), '/search', '?q=x', null),
    ).rejects.toThrow('HTTP 500');
  });
});
