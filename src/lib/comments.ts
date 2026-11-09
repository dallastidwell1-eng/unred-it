// A post's comments as a tree, from Reddit's thread .json and from
// /api/morechildren (for "load more replies"). Pure functions.

import { parseListing, type Post } from './reddit-data';

export interface CommentNode {
  kind: 'comment';
  /** "t1_abc"; used for votes and as the parent of replies. */
  fullname: string;
  id: string;
  author: string;
  /** Reddit's HTML for the text (clean it before showing it, D-052). */
  bodyHtml: string;
  score: number;
  scoreHidden: boolean;
  likes: boolean | null;
  /** Saved by the user (D-063). */
  saved: boolean;
  createdUtc: number;
  depth: number;
  /** Written by the post's author. */
  isSubmitter: boolean;
  /** "moderator", "admin" or "" */
  distinguished: string;
  stickied: boolean;
  /** Reddit already folds this one (for example, a low score). */
  collapsed: boolean;
  /** Direct link to this comment on Reddit, for example "/r/x/comments/abc/t/def/". */
  permalink: string;
  replies: ThreadItem[];
}

/** A "load more replies" stub, or a "continue this thread" link (no children). */
export interface MoreNode {
  kind: 'more';
  /** Stub's own id, unique in the tree. */
  id: string;
  parentFullname: string;
  count: number;
  /** Comment ids to ask /api/morechildren for. Empty means "continue this thread". */
  children: string[];
  depth: number;
}

export type ThreadItem = CommentNode | MoreNode;

export interface ThreadPage {
  post: Post;
  comments: ThreadItem[];
}

export type CommentSort = 'confidence' | 'top' | 'new' | 'controversial' | 'old' | 'qa';

export const SORT_LABELS: Record<CommentSort, string> = {
  confidence: 'Best',
  top: 'Top',
  new: 'New',
  controversial: 'Controversial',
  old: 'Old',
  qa: 'Q&A',
};

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

function children(listing: unknown): unknown[] {
  if (!isRecord(listing) || !isRecord(listing.data) || !Array.isArray(listing.data.children)) {
    return [];
  }
  return listing.data.children;
}

/** One t1 or more thing (from a listing or from morechildren), without replies attached. */
export function parseThing(thing: unknown): ThreadItem | null {
  if (!isRecord(thing) || !isRecord(thing.data)) {
    return null;
  }
  const data = thing.data;
  if (thing.kind === 'more') {
    const ids = Array.isArray(data.children)
      ? data.children.filter((c): c is string => typeof c === 'string')
      : [];
    return {
      kind: 'more',
      id: str(data, 'id') || str(data, 'name'),
      parentFullname: str(data, 'parent_id'),
      count: num(data, 'count'),
      children: ids,
      depth: num(data, 'depth'),
    };
  }
  if (thing.kind !== 't1') {
    return null;
  }
  const likes = data.likes;
  return {
    kind: 'comment',
    fullname: str(data, 'name'),
    id: str(data, 'id'),
    author: str(data, 'author'),
    bodyHtml: str(data, 'body_html'),
    score: num(data, 'score'),
    scoreHidden: data.score_hidden === true,
    likes: typeof likes === 'boolean' ? likes : null,
    saved: data.saved === true,
    createdUtc: num(data, 'created_utc'),
    depth: num(data, 'depth'),
    isSubmitter: data.is_submitter === true,
    distinguished: str(data, 'distinguished'),
    stickied: data.stickied === true,
    collapsed: data.collapsed === true,
    permalink: str(data, 'permalink'),
    replies: isRecord(data.replies) ? parseCommentListing(data.replies) : [],
  };
}

/** A comment listing with its nested replies. */
export function parseCommentListing(listing: unknown): ThreadItem[] {
  return children(listing)
    .map(parseThing)
    .filter((item): item is ThreadItem => item !== null);
}

/** A post page (`/comments/<id>/.json`): [post listing, comment listing]. */
export function parseThreadPage(json: unknown): ThreadPage {
  if (!Array.isArray(json) || json.length < 2) {
    throw new Error('Not a Reddit thread');
  }
  const post = parseListing(json[0])[0];
  if (!post) {
    throw new Error('Thread has no post');
  }
  return { post, comments: parseCommentListing(json[1]) };
}

/**
 * /api/morechildren answers with a flat list; each thing names its parent.
 * Rebuilds the branches. Things whose parent is not in the list belong at
 * the level of the stub that asked for them.
 */
export function parseMoreChildren(json: unknown): ThreadItem[] {
  const things =
    isRecord(json) &&
    isRecord(json.json) &&
    isRecord(json.json.data) &&
    Array.isArray(json.json.data.things)
      ? json.json.data.things
      : [];
  const parents = new Map<string, string>();
  const items: ThreadItem[] = [];
  for (const thing of things) {
    const item = parseThing(thing);
    if (!item) {
      continue;
    }
    const parent = isRecord(thing) && isRecord(thing.data) ? str(thing.data, 'parent_id') : '';
    parents.set(item.kind === 'comment' ? item.fullname : `more:${item.id}`, parent);
    items.push(item);
  }
  const byName = new Map<string, CommentNode>();
  for (const item of items) {
    if (item.kind === 'comment') {
      byName.set(item.fullname, item);
    }
  }
  const top: ThreadItem[] = [];
  for (const item of items) {
    const key = item.kind === 'comment' ? item.fullname : `more:${item.id}`;
    const parent = byName.get(parents.get(key) ?? '');
    if (parent) {
      parent.replies.push(item);
    } else {
      top.push(item);
    }
  }
  return top;
}

/** Replaces a "load more" stub with what it loaded. */
export function replaceMore(
  items: ThreadItem[],
  moreId: string,
  loaded: ThreadItem[],
): ThreadItem[] {
  const out: ThreadItem[] = [];
  for (const item of items) {
    if (item.kind === 'more' && item.id === moreId) {
      out.push(...loaded);
    } else if (item.kind === 'comment' && item.replies.length > 0) {
      out.push({ ...item, replies: replaceMore(item.replies, moreId, loaded) });
    } else {
      out.push(item);
    }
  }
  return out;
}

/** Applies a change to one comment anywhere in the tree. */
export function updateComment(
  items: ThreadItem[],
  fullname: string,
  change: (comment: CommentNode) => CommentNode,
): ThreadItem[] {
  return items.map((item) => {
    if (item.kind !== 'comment') {
      return item;
    }
    if (item.fullname === fullname) {
      return change(item);
    }
    return item.replies.length > 0
      ? { ...item, replies: updateComment(item.replies, fullname, change) }
      : item;
  });
}

/** How many replies sit under a comment (loaded ones plus "more" counts). */
export function replyCount(comment: CommentNode): number {
  let total = 0;
  for (const item of comment.replies) {
    total += item.kind === 'comment' ? 1 + replyCount(item) : item.count;
  }
  return total;
}

/**
 * Puts a new comment first under its parent: a reply under that comment, a
 * comment on the post (its parent is the post, not in the tree) at the top.
 */
export function addComment(
  items: ThreadItem[],
  parentFullname: string,
  added: CommentNode,
): ThreadItem[] {
  if (parentFullname.startsWith('t3_')) {
    return [added, ...items];
  }
  return updateComment(items, parentFullname, (parent) => ({
    ...parent,
    replies: [added, ...parent.replies],
  }));
}

/** Undoes Reddit's HTML escaping (&lt;div&gt;), in case an answer comes escaped. */
export function unescapeHtml(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * The new comment in /api/comment's answer:
 * {"json": {"errors": [], "data": {"things": [{"kind": "t1", "data": {...}}]}}}.
 */
export function parsePostedComment(json: unknown): CommentNode {
  const things =
    isRecord(json) &&
    isRecord(json.json) &&
    isRecord(json.json.data) &&
    Array.isArray(json.json.data.things)
      ? json.json.data.things
      : [];
  const item = parseThing(things[0]);
  if (item?.kind !== 'comment') {
    throw new Error('Reddit did not send the new comment back');
  }
  // Without raw_json the HTML comes escaped; the comment must show as text.
  const bodyHtml = item.bodyHtml.startsWith('&lt;') ? unescapeHtml(item.bodyHtml) : item.bodyHtml;
  return { ...item, bodyHtml, replies: [] };
}
