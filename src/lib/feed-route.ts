// Which old.reddit.com pages are feeds the reader rebuilds, and the .json
// address for each page of a feed. Pure functions.

const SORTS = ['hot', 'new', 'rising', 'top', 'controversial', 'best'];

/** Front page, a sort of it, or a subreddit (with an optional sort). */
export function isFeedPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return true;
  }
  if (parts.length === 1) {
    return SORTS.includes(parts[0] ?? '');
  }
  if (parts[0] === 'r' && parts[1]) {
    return parts.length === 2 || (parts.length === 3 && SORTS.includes(parts[2] ?? ''));
  }
  return false;
}

/** A search of the user's words, in one subreddit or (subreddit null) all of Reddit. */
export interface SearchInfo {
  query: string;
  subreddit: string | null;
}

/** "/search" or "/r/name/search". */
export function isSearchPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  return (
    (parts.length === 1 && parts[0] === 'search') ||
    (parts.length === 3 && parts[0] === 'r' && !!parts[1] && parts[2] === 'search')
  );
}

/**
 * The search a page shows, or null if it is not a search of posts (D-058).
 * On old.reddit.com, /r/name/search looks in that subreddit only with
 * restrict_sr=on; without it, it searches all of Reddit.
 */
export function searchInfo(pathname: string, search: string): SearchInfo | null {
  if (!isSearchPath(pathname)) {
    return null;
  }
  const query = new URLSearchParams(search);
  const words = (query.get('q') ?? '').trim();
  const type = query.get('type');
  if (!words || (type && type !== 'link')) {
    return null; // an empty search, or a search for subreddits or users
  }
  const parts = pathname.split('/').filter(Boolean);
  const restricted = query.get('restrict_sr') === 'on' || query.get('restrict_sr') === '1';
  return { query: words, subreddit: parts[0] === 'r' && restricted ? (parts[1] ?? null) : null };
}

/** The old.reddit.com address that searches for the words. */
export function searchPath(words: string, subreddit: string | null): string {
  const query = new URLSearchParams({ q: words.trim() });
  if (subreddit) {
    query.set('restrict_sr', 'on');
    return `/r/${subreddit}/search?${query.toString()}`;
  }
  return `/search?${query.toString()}`;
}

/** Short title for the top bar: "Home", "Popular", "All", "Search" or "r/name". */
export function feedTitle(pathname: string): string {
  if (isSearchPath(pathname)) {
    return 'Search';
  }
  const parts = pathname.split('/').filter(Boolean);
  const name = parts[0] === 'r' ? parts[1] : undefined;
  if (!name) {
    return 'Home';
  }
  const fixed: Record<string, string> = { popular: 'Popular', all: 'All' };
  return fixed[name.toLowerCase()] ?? `r/${name}`;
}

/**
 * The .json address for a feed page. Keeps the page's own query (for example
 * the "t=week" time range of a top sort), and adds the paging cursor.
 */
export function feedJsonPath(pathname: string, search: string, after: string | null): string {
  const path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const query = new URLSearchParams(search);
  query.delete('after');
  query.delete('before');
  query.delete('count');
  query.delete('unred');
  query.set('raw_json', '1'); // plain text instead of HTML-escaped (&amp;)
  query.set('limit', '25');
  if (after) {
    query.set('after', after);
  }
  // Search uses Reddit's documented form, /search.json; feeds use /.json.
  const json = isSearchPath(pathname) ? `${path}.json` : `${path || ''}/.json`;
  return `${json}?${query.toString()}`;
}

/** True when the user asked for Reddit's own page (?unred=off). */
export function readerTurnedOff(search: string): boolean {
  return new URLSearchParams(search).get('unred') === 'off';
}
