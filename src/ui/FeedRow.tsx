// One compact feed row (layout-spec 5.2). No actions in the feed (D-022).

import { formatAge, formatCount } from '../lib/format';
import type { Post } from '../lib/reddit-data';
import { feedClicks, FeedScore, type Opener } from './feed-parts';
import { CommentIcon, LinesIcon, LinkIcon } from './icons';
import { SubredditLink } from './SubredditLink';

export function FeedRow({
  post,
  now,
  onOpen,
  onOpenComments,
}: {
  post: Post;
  now: number;
  onOpen: Opener;
  onOpenComments: Opener;
}) {
  const href = post.permalink;
  const { open, openComments } = feedClicks(post, onOpen, onOpenComments);

  return (
    <li class="row" data-fullname={post.fullname}>
      {/* The title is the one tab stop; the thumbnail is a mouse/touch shortcut. */}
      <a class="thumb" href={href} tabIndex={-1} aria-hidden="true" onClick={open}>
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
          />
        ) : post.isSelf ? (
          <LinesIcon />
        ) : (
          <LinkIcon />
        )}
      </a>
      <div class="text">
        <a class="title" href={href} onClick={open}>
          {post.title}
        </a>
        <div class="meta">
          {post.stickied && <span class="tag">Pinned</span>}
          {post.over18 && <span class="tag">NSFW</span>}
          <SubredditLink name={post.subreddit} />
          <span class="dot-sep" aria-hidden="true" />
          <span>{formatAge(post.createdUtc, now)}</span>
          <span class="dot-sep" aria-hidden="true" />
          <FeedScore post={post} />
          <span class="dot-sep" aria-hidden="true" />
          <a class="comments" href={href} onClick={openComments}>
            <CommentIcon />
            {formatCount(post.numComments)}
            <span class="sr-only"> comments</span>
          </a>
        </div>
      </div>
    </li>
  );
}
