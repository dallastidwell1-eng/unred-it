// Every reddit.com link opens in the reader (D-027). Pure functions that
// say which addresses are posts, turn any Reddit link into its
// old.reddit.com address, and decide which www.reddit.com pages to send there.

export const OLD_REDDIT = 'https://old.reddit.com';

/** A post page, optionally pointing at one comment ("permalink"). */
export interface PostRoute {
  postId: string;
  /** The subreddit in the address, if any. */
  subreddit: string | null;
  /** The comment the address points at, if any. */
  commentId: string | null;
  /** How many parent comments to show above it (Reddit's ?context=N). */
  context: number;
}

const ID = /^[a-z0-9]{1,12}$/i;

/**
 * /r/name/comments/id[/slug[/commentId]] or /comments/id[/slug[/commentId]].
 * Null for anything else.
 */
export function postRoute(pathname: string, search = ''): PostRoute | null {
  const parts = pathname.split('/').filter(Boolean);
  let subreddit: string | null = null;
  if (parts[0] === 'r' && parts[1]) {
    subreddit = parts[1];
    parts.splice(0, 2);
  }
  if (parts[0] !== 'comments' || !parts[1] || !ID.test(parts[1]) || parts.length > 4) {
    return null;
  }
  const comment = parts[3];
  const commentId = comment && ID.test(comment) ? comment.toLowerCase() : null;
  const context = Number(new URLSearchParams(search).get('context') ?? '0');
  return {
    postId: parts[1].toLowerCase(),
    subreddit,
    commentId,
    context: commentId && Number.isInteger(context) ? Math.min(Math.max(context, 0), 8) : 0,
  };
}

function isRedditHost(hostname: string): boolean {
  return hostname === 'reddit.com' || hostname.endsWith('.reddit.com');
}

/** Hosts that are not pages: pictures, videos, and Reddit's own services. */
const NOT_PAGES = new Set([
  'i.reddit.com',
  'v.reddit.com',
  'preview.reddit.com',
  'external-preview.reddit.com',
  'styles.reddit.com',
  'mod.reddit.com',
  'chat.reddit.com',
  'ads.reddit.com',
  'support.reddit.com',
]);

/**
 * The old.reddit.com address for a link to a Reddit page (www, new, np, m,
 * old or bare reddit.com, and redd.it short links), so it opens in the
 * reader. Null for links that are not Reddit pages.
 */
export function toReaderUrl(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href, OLD_REDDIT);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host === 'redd.it') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && ID.test(id) ? `${OLD_REDDIT}/comments/${id.toLowerCase()}/` : null;
  }
  if (!isRedditHost(host) || NOT_PAGES.has(host)) {
    return null;
  }
  return `${OLD_REDDIT}${url.pathname}${url.search}${url.hash}`;
}

/**
 * Pages of www.reddit.com that stay there: things old.reddit.com does not
 * have, share links that www.reddit.com must first turn into a real address,
 * and Reddit's sign-in and account pages.
 */
const STAY_ON_WWW = [
  /^\/media\b/,
  /^\/settings\b/,
  /^\/chat\b/,
  /^\/notifications\b/,
  /^\/login\b/,
  /^\/register\b/,
  /^\/account\b/,
  /^\/password\b/,
  /^\/verification\b/,
  /^\/premium\b/,
  /^\/coins\b/,
  /^\/avatar\b/,
  /^\/answers\b/,
  /^\/poll\b/,
  /^\/appeal\b/,
  /^\/svc\b/,
  /^\/api\b/,
  /^\/mod\b/,
  /^\/r\/[^/]+\/s\//, // share links: www.reddit.com resolves them first
];

/** Where a www.reddit.com page should go instead, or null to stay. */
export function redirectTarget(pathname: string, search: string, hash: string): string | null {
  if (new URLSearchParams(search).get('unred') === 'off') {
    return null;
  }
  if (STAY_ON_WWW.some((rule) => rule.test(pathname))) {
    return null;
  }
  return `${OLD_REDDIT}${pathname}${search}${hash}`;
}
