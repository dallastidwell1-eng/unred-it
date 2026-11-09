// Loads a post's comments from Reddit's .json pages (D-047).

import {
  type CommentSort,
  type MoreNode,
  parseMoreChildren,
  parseThreadPage,
  type ThreadItem,
} from './comments';
import type { Post } from './reddit-data';

export type FetchJson = (path: string) => Promise<unknown>;

/** Reddit answers at most this many ids per /api/morechildren call. */
export const MORE_BATCH = 100;

/** One comment's thread, as a comment link opens it (D-027). */
export interface CommentFocus {
  commentId: string;
  /** Parent comments to show above it (Reddit's ?context=N). */
  context: number;
}

/**
 * The thread page, or one comment's own branch when `commentId` is given,
 * with `context` parent comments above it.
 */
export function threadJsonPath(
  postId: string,
  sort: CommentSort,
  commentId?: string,
  context = 0,
): string {
  const query = new URLSearchParams({ raw_json: '1', limit: '200', sort });
  if (commentId && context > 0) {
    query.set('context', String(context));
  }
  const branch = commentId ? `_/${commentId}/` : '';
  return `/comments/${postId}/${branch}.json?${query.toString()}`;
}

/** One post by its ID, for a post address opened directly (D-027). */
export async function loadPost(fetchJson: FetchJson, postId: string): Promise<Post> {
  const query = new URLSearchParams({ raw_json: '1', limit: '1' });
  return parseThreadPage(await fetchJson(`/comments/${postId}/.json?${query.toString()}`)).post;
}

export function moreChildrenPath(linkFullname: string, ids: string[], sort: CommentSort): string {
  const query = new URLSearchParams({
    api_type: 'json',
    raw_json: '1',
    link_id: linkFullname,
    children: ids.join(','),
    sort,
  });
  return `/api/morechildren.json?${query.toString()}`;
}

export async function loadThread(
  fetchJson: FetchJson,
  post: Post,
  sort: CommentSort,
  focus?: CommentFocus,
): Promise<ThreadItem[]> {
  const path = threadJsonPath(post.id, sort, focus?.commentId, focus?.context);
  return parseThreadPage(await fetchJson(path)).comments;
}

/**
 * What a "more" stub stands for. "Continue this thread" stubs (no ids) load
 * the parent comment's own branch; others ask /api/morechildren, 100 ids at a
 * time, leaving a new stub for the rest.
 */
export async function loadMoreItems(
  fetchJson: FetchJson,
  post: Post,
  more: MoreNode,
  sort: CommentSort,
): Promise<ThreadItem[]> {
  if (more.children.length === 0) {
    const parentId = more.parentFullname.replace(/^t1_/, '');
    const page = parseThreadPage(await fetchJson(threadJsonPath(post.id, sort, parentId)));
    const parent = page.comments[0];
    return parent?.kind === 'comment' ? parent.replies : [];
  }
  const ids = more.children.slice(0, MORE_BATCH);
  const rest = more.children.slice(MORE_BATCH);
  const loaded = parseMoreChildren(await fetchJson(moreChildrenPath(post.fullname, ids, sort)));
  if (rest.length === 0) {
    return loaded;
  }
  return [
    ...loaded,
    {
      ...more,
      id: `${more.id}+${String(MORE_BATCH)}`,
      children: rest,
      count: Math.max(rest.length, more.count - ids.length),
    },
  ];
}
