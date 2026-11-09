// Search results for the reader (D-058). Reddit blocks /search.json for
// everyone ("blocked by network security", owner test, session 003), but its
// normal search page still works in the user's logged-in browser. So: read
// the post IDs and the "next" cursor from that page's HTML, then load the full
// posts from /by_id/, a normal listing address. If /by_id/ fails too, the
// rows are built from what the search page itself shows.

import { type Community, type FeedPage, parseFeedPage, type Post } from './reddit-data';
import type { FetchJson } from './thread-loader';

export type FetchText = (path: string) => Promise<string>;

/** One post found on the search page, with what the page shows about it. */
export interface SearchHit {
  fullname: string;
  /** Reddit-style post fields read from the HTML, for the fallback row. */
  data: Record<string, unknown>;
}

const FULLNAME = /^t3_[a-z0-9]+$/i;
/** old.reddit.com's markup for a paid post ("promoted"); never shown (M4). */
const PROMOTED = '.promotedlink, [data-promoted="true"]';
/** "/r/name/" or "/user/name/" (nothing after the name). */
const COMMUNITY_PATH = /^\/(r|user)\/([A-Za-z0-9_-]{2,21})\/?$/;

/** The search page address (HTML, not .json), with the paging cursor. */
export function searchHtmlPath(pathname: string, search: string, after: string | null): string {
  const query = new URLSearchParams(search);
  for (const key of ['after', 'before', 'count', 'unred']) {
    query.delete(key);
  }
  if (after) {
    query.set('after', after);
  }
  return `${pathname}?${query.toString()}`;
}

/** The post ID from a Reddit comments address, or null. */
function idFromHref(href: string | null): string | null {
  const match = /\/comments\/([a-z0-9]+)(\/|$)/i.exec(href ?? '');
  return match?.[1] ? match[1].toLowerCase() : null;
}

/** The leading number of a text such as "2,270 points" or "68 comments". */
function leadingNumber(text: string | null | undefined): number {
  const match = /-?[\d,]+/.exec(text ?? '');
  return match ? Number(match[0].replace(/,/g, '')) || 0 : 0;
}

function pathOf(href: string | null | undefined): string {
  if (!href) {
    return '';
  }
  try {
    return new URL(href, 'https://old.reddit.com').pathname;
  } catch {
    return '';
  }
}

/** What one result block shows, in the field names of Reddit's .json. */
function hitData(block: Element, id: string): Record<string, unknown> {
  const titleLink = block.querySelector('a.search-title');
  const commentsLink = block.querySelector('a.search-comments');
  const subreddit = (block.querySelector('a.search-subreddit-link')?.textContent ?? '')
    .trim()
    .replace(/^\/?r\//i, '');
  const time = block.querySelector('time[datetime]')?.getAttribute('datetime');
  const created = time ? Date.parse(time) / 1000 : 0;
  const permalink = pathOf(commentsLink?.getAttribute('href') ?? titleLink?.getAttribute('href'));
  const outside = block.querySelector('a.search-link')?.getAttribute('href') ?? '';
  return {
    name: `t3_${id}`,
    id,
    title: (titleLink?.textContent ?? '').trim(),
    subreddit,
    author: (block.querySelector('a.author')?.textContent ?? '').trim(),
    score: leadingNumber(block.querySelector('.search-score')?.textContent),
    num_comments: leadingNumber(commentsLink?.textContent),
    permalink,
    url: outside || (permalink ? `https://old.reddit.com${permalink}` : ''),
    is_self: !outside,
    created_utc: Number.isFinite(created) ? created : 0,
  };
}

/**
 * The posts on an old.reddit.com search page, in order, and the cursor for
 * the next page. Subreddit and user results are left out.
 */
export function parseSearchHtml(html: string): {
  hits: SearchHit[];
  after: string | null;
  communities: Community[];
} {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const hits: SearchHit[] = [];
  const seen = new Set<string>();
  const add = (id: string | null, block: Element) => {
    if (id && !seen.has(id)) {
      seen.add(id);
      hits.push({ fullname: `t3_${id}`, data: hitData(block, id) });
    }
  };

  const blocks = Array.from(doc.querySelectorAll('[data-fullname]')).filter(
    (el) => FULLNAME.test(el.getAttribute('data-fullname') ?? '') && !el.closest(PROMOTED),
  );
  if (blocks.length > 0) {
    for (const block of blocks) {
      add((block.getAttribute('data-fullname') ?? '').slice(3).toLowerCase(), block);
    }
  } else {
    // Older or changed markup: the result's own title or comments link.
    for (const link of Array.from(doc.querySelectorAll('a.search-title, a.search-comments'))) {
      if (link.closest(PROMOTED)) {
        continue;
      }
      add(
        idFromHref(link.getAttribute('href')),
        link.closest('.search-result') ?? link.parentElement ?? link,
      );
    }
  }

  // Subreddit and user results (t5 blocks): name from the first link to
  // /r/name/ or /user/name/ inside the block.
  const communities: Community[] = [];
  const names = new Set<string>();
  for (const block of Array.from(doc.querySelectorAll('[data-fullname^="t5_"]'))) {
    for (const link of Array.from(block.querySelectorAll('a[href]'))) {
      const match = COMMUNITY_PATH.exec(pathOf(link.getAttribute('href')));
      let name = match?.[2];
      if (!match || !name) {
        continue;
      }
      // A profile can also appear as its own subreddit, r/u_name.
      const profile = match[1] === 'user' || /^u_/i.test(name);
      if (match[1] === 'r' && profile) {
        name = name.slice(2);
      }
      const kind = profile ? 'user' : 'subreddit';
      const key = `${kind}:${name.toLowerCase()}`;
      if (!names.has(key)) {
        names.add(key);
        const body = block.querySelector('.search-result-body')?.textContent ?? '';
        communities.push({ kind, name, description: body.replace(/\s+/g, ' ').trim() });
      }
      break;
    }
  }

  // The posts' "next" link carries after=t3_...; the subreddit list's does not.
  let after: string | null = null;
  for (const link of Array.from(doc.querySelectorAll('a[href*="after=t3_"]'))) {
    const value = new URL(
      link.getAttribute('href') ?? '',
      'https://old.reddit.com',
    ).searchParams.get('after');
    if (value && FULLNAME.test(value)) {
      after = value;
    }
  }
  return { hits, after, communities };
}

/** Rows built only from the search page, when /by_id/ is not available. */
export function postsFromHits(hits: SearchHit[]): Post[] {
  return parseFeedPage({
    kind: 'Listing',
    data: { children: hits.map((hit) => ({ kind: 't3', data: hit.data })), after: null },
  }).posts;
}

/** One page of search results as a feed page. */
export async function loadSearchPage(
  fetchText: FetchText,
  fetchJson: FetchJson,
  pathname: string,
  search: string,
  after: string | null,
): Promise<FeedPage> {
  const {
    hits,
    after: next,
    communities,
  } = parseSearchHtml(await fetchText(searchHtmlPath(pathname, search, after)));
  // Subreddits and users belong above the first page only.
  const extra = after === null ? { communities } : {};
  if (hits.length === 0) {
    return { posts: [], after: null, ...extra };
  }
  const fallback = postsFromHits(hits);
  try {
    const names = hits.map((hit) => hit.fullname).join(',');
    const full = parseFeedPage(await fetchJson(`/by_id/${names}.json?raw_json=1`)).posts;
    const byName = new Map(full.map((post) => [post.fullname, post]));
    return {
      posts: fallback.map((post) => byName.get(post.fullname) ?? post),
      after: next,
      ...extra,
    };
  } catch {
    return { posts: fallback, after: next, ...extra };
  }
}
