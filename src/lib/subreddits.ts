// The feed picker's data (layout-spec 5.6): the user's subscribed subreddits
// from Reddit's .json pages (D-047), the filter, and where each choice goes.
// Pure functions plus one loader that takes its fetch function as an argument.

import type { FetchJson } from './thread-loader';

export interface Subreddit {
  /** Without the "r/", for example "AskHistorians". */
  name: string;
  over18: boolean;
}

export interface SubredditPage {
  subreddits: Subreddit[];
  after: string | null;
}

/** The fixed feeds above the user's subreddits. */
export type FixedFeed = 'home' | 'popular' | 'all';

/** Reddit allows 3 to 21 letters, digits and underscores (a few old names are 2). */
const NAME = /^[A-Za-z0-9][A-Za-z0-9_]{1,20}$/;

/** Reddit returns at most 100 per page; stop after this many pages. */
export const MAX_SUBSCRIPTION_PAGES = 10;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The .json address of one page of the user's subscriptions. */
export function subscriptionsJsonPath(after: string | null): string {
  const query = new URLSearchParams({ raw_json: '1', limit: '100' });
  if (after) {
    query.set('after', after);
  }
  return `/subreddits/mine/subscriber.json?${query.toString()}`;
}

/**
 * One page of /subreddits/mine/subscriber.json. User profiles that the user
 * follows are left out: the reader cannot show a profile yet.
 */
export function parseSubredditPage(json: unknown): SubredditPage {
  if (!isRecord(json) || json.kind !== 'Listing' || !isRecord(json.data)) {
    throw new Error('Not a Reddit Listing');
  }
  const children = json.data.children;
  if (!Array.isArray(children)) {
    throw new Error('Listing has no children');
  }
  const subreddits: Subreddit[] = [];
  for (const child of children) {
    if (!isRecord(child) || child.kind !== 't5' || !isRecord(child.data)) {
      continue;
    }
    const data = child.data;
    const name = typeof data.display_name === 'string' ? data.display_name : '';
    if (data.subreddit_type === 'user' || !NAME.test(name)) {
      continue;
    }
    subreddits.push({ name, over18: data.over18 === true });
  }
  const after = json.data.after;
  return { subreddits, after: typeof after === 'string' && after ? after : null };
}

/** Alphabetical, ignoring case, as Reddit's own list shows them. */
export function sortSubreddits(list: Subreddit[]): Subreddit[] {
  return [...list].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true }),
  );
}

/** Every subscription, following Reddit's `after` cursor page by page. */
export async function loadSubscriptions(fetchJson: FetchJson): Promise<Subreddit[]> {
  const seen = new Map<string, Subreddit>();
  let after: string | null = null;
  for (let page = 0; page < MAX_SUBSCRIPTION_PAGES; page += 1) {
    const result = parseSubredditPage(await fetchJson(subscriptionsJsonPath(after)));
    for (const sub of result.subreddits) {
      seen.set(sub.name.toLowerCase(), sub);
    }
    after = result.after;
    if (!after) {
      break;
    }
  }
  return sortSubreddits([...seen.values()]);
}

/** What the user typed, without spaces and a leading "r/" or "/r/". */
function cleanQuery(query: string): string {
  return query
    .trim()
    .replace(/^\/?r\//i, '')
    .replace(/\/$/, '');
}

/**
 * The subreddits that match the filter text, ignoring case. Names that start
 * with the text come first, then names that contain it; each group stays in
 * alphabetical order.
 */
export function filterSubreddits(list: Subreddit[], query: string): Subreddit[] {
  const text = cleanQuery(query).toLowerCase();
  if (!text) {
    return list;
  }
  const starts: Subreddit[] = [];
  const contains: Subreddit[] = [];
  for (const sub of list) {
    const name = sub.name.toLowerCase();
    if (name.startsWith(text)) {
      starts.push(sub);
    } else if (name.includes(text)) {
      contains.push(sub);
    }
  }
  return [...starts, ...contains];
}

/** A subreddit name typed in the filter ("r/Name" or "Name"), or null if it cannot be one. */
export function typedSubredditName(query: string): string | null {
  const text = cleanQuery(query);
  return NAME.test(text) ? text : null;
}

/** The old.reddit.com path for a choice in the picker. */
export function feedPathFor(choice: FixedFeed | Subreddit): string {
  if (choice === 'home') {
    return '/';
  }
  if (choice === 'popular') {
    return '/r/popular/';
  }
  if (choice === 'all') {
    return '/r/all/';
  }
  return `/r/${choice.name}/`;
}

/** Which feed a page path shows: a fixed feed or a subreddit name. */
export function currentFeed(pathname: string): FixedFeed | { name: string } {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'r' || !parts[1]) {
    return 'home';
  }
  const name = parts[1];
  if (name.toLowerCase() === 'popular') {
    return 'popular';
  }
  if (name.toLowerCase() === 'all') {
    return 'all';
  }
  return { name };
}

/** The first letter shown in a subreddit's round avatar. */
export function avatarLetter(name: string): string {
  return name.charAt(0).toUpperCase();
}

/** A stable placeholder tone (1 to `count`) for a name, so each subreddit keeps its color. */
export function avatarTone(name: string, count: number): number {
  let hash = 0;
  for (const char of name.toLowerCase()) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return (hash % count) + 1;
}
