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

/** Short title for the top bar: "Home", "Popular", "All" or "r/name". */
export function feedTitle(pathname: string): string {
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
  return `${path || ''}/.json?${query.toString()}`;
}

/** True when the user asked for Reddit's own page (?unred=off). */
export function readerTurnedOff(search: string): boolean {
  return new URLSearchParams(search).get('unred') === 'off';
}
