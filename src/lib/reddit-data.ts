// Reads Reddit's own .json pages (the same data old.reddit.com shows) into
// small typed objects. Pure functions: no network, no DOM. OQ-011 spike.

export interface Post {
  /** Reddit "fullname", for example "t3_abc123". Used for votes. */
  fullname: string;
  id: string;
  title: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  permalink: string;
  url: string;
  /** true = upvoted by the user, false = downvoted, null = no vote. */
  likes: boolean | null;
  /** Seconds since 1970 (UTC). */
  createdUtc: number;
  isSelf: boolean;
  /** For example "i.redd.it" or "self.AskHistorians". */
  domain: string;
  over18: boolean;
  stickied: boolean;
  /** A real https thumbnail image, or null (text, NSFW, spoiler, default). */
  thumbnailUrl: string | null;
}

/** One page of a feed and the cursor for the next page (null at the end). */
export interface FeedPage {
  posts: Post[];
  after: string | null;
}

export interface Comment {
  fullname: string;
  author: string;
  body: string;
  score: number;
  depth: number;
}

export interface Thread {
  post: Post;
  comments: Comment[];
}

export interface Me {
  name: string;
  /** Reddit's anti-forgery token for this session. Never log or store it. */
  modhash: string;
}

export type VoteDirection = 1 | 0 | -1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function str(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function num(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** The `data.children` array of a Listing, or an error. */
function listingChildren(json: unknown): unknown[] {
  if (!isRecord(json) || json.kind !== 'Listing' || !isRecord(json.data)) {
    throw new Error('Not a Reddit Listing');
  }
  const children = json.data.children;
  if (!Array.isArray(children)) {
    throw new Error('Listing has no children');
  }
  return children;
}

function toPost(data: Record<string, unknown>): Post {
  const likes = data.likes;
  return {
    fullname: str(data, 'name'),
    id: str(data, 'id'),
    title: str(data, 'title'),
    subreddit: str(data, 'subreddit'),
    author: str(data, 'author'),
    score: num(data, 'score'),
    numComments: num(data, 'num_comments'),
    permalink: str(data, 'permalink'),
    url: str(data, 'url'),
    likes: typeof likes === 'boolean' ? likes : null,
    createdUtc: num(data, 'created_utc'),
    isSelf: data.is_self === true,
    domain: str(data, 'domain'),
    over18: data.over_18 === true,
    stickied: data.stickied === true,
    thumbnailUrl: thumbnailFrom(str(data, 'thumbnail')),
  };
}

/** Reddit puts words like "self", "nsfw" or "default" in `thumbnail` when there is no image. */
function thumbnailFrom(value: string): string | null {
  return value.startsWith('https://') ? value : null;
}

/** A feed page with its "after" cursor. */
export function parseFeedPage(json: unknown): FeedPage {
  const posts = parseListing(json);
  const data = isRecord(json) && isRecord(json.data) ? json.data : {};
  const after = typeof data.after === 'string' && data.after ? data.after : null;
  return { posts, after };
}

/** Posts from a feed page, for example `/.json` or `/r/firefox/.json`. */
export function parseListing(json: unknown): Post[] {
  const posts: Post[] = [];
  for (const child of listingChildren(json)) {
    if (isRecord(child) && child.kind === 't3' && isRecord(child.data)) {
      posts.push(toPost(child.data));
    }
  }
  return posts;
}

function collectComments(children: unknown[], out: Comment[]): void {
  for (const child of children) {
    if (!isRecord(child) || child.kind !== 't1' || !isRecord(child.data)) {
      continue; // "more" stubs and anything unknown are skipped
    }
    const data = child.data;
    out.push({
      fullname: str(data, 'name'),
      author: str(data, 'author'),
      body: str(data, 'body'),
      score: num(data, 'score'),
      depth: num(data, 'depth'),
    });
    if (isRecord(data.replies)) {
      collectComments(listingChildren(data.replies), out);
    }
  }
}

/** A post page, for example `/r/x/comments/abc123/.json`: [post listing, comment listing]. */
export function parseThread(json: unknown): Thread {
  if (!Array.isArray(json) || json.length < 2) {
    throw new Error('Not a Reddit thread');
  }
  const [postListing, commentListing] = json as [unknown, unknown];
  const posts = parseListing(postListing);
  const post = posts[0];
  if (!post) {
    throw new Error('Thread has no post');
  }
  const comments: Comment[] = [];
  collectComments(listingChildren(commentListing), comments);
  return { post, comments };
}

/** The logged-in user from `/api/me.json`, or null when logged out. */
export function parseMe(json: unknown): Me | null {
  if (!isRecord(json) || !isRecord(json.data)) {
    return null;
  }
  const name = str(json.data, 'name');
  const modhash = str(json.data, 'modhash');
  return name && modhash ? { name, modhash } : null;
}

/** The post ID ("abc123") from a Reddit post URL or a "t3_" fullname, or null. */
export function postIdFrom(input: string): string | null {
  const text = input.trim();
  const fullname = /^t3_([a-z0-9]+)$/i.exec(text);
  if (fullname?.[1]) {
    return fullname[1].toLowerCase();
  }
  try {
    const { hostname, pathname } = new URL(text);
    if (hostname !== 'reddit.com' && !hostname.endsWith('.reddit.com')) {
      return null;
    }
    const match = /\/comments\/([a-z0-9]+)(\/|$)/i.exec(pathname);
    return match?.[1] ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

/** The form body old.reddit.com sends to `/api/vote`. */
export function voteBody(fullname: string, dir: VoteDirection, modhash: string): string {
  return new URLSearchParams({ id: fullname, dir: String(dir), uh: modhash }).toString();
}
