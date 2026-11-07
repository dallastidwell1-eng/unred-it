// One compact feed row (layout-spec 5.2). No actions in the feed (D-022).

import { formatAge, formatCount } from '../lib/format';
import type { Post } from '../lib/reddit-data';
import { isPlainClick } from './clicks';
import { CommentIcon, DownIcon, LinesIcon, LinkIcon, UpIcon } from './icons';

export function FeedRow({
  post,
  now,
  onOpen,
  onOpenComments,
}: {
  post: Post;
  now: number;
  onOpen: (post: Post, opener: HTMLElement) => void;
  onOpenComments: (post: Post, opener: HTMLElement) => void;
}) {
  const href = post.permalink;
  const open = (event: MouseEvent) => {
    if (isPlainClick(event)) {
      event.preventDefault();
      onOpen(post, event.currentTarget as HTMLElement);
    }
  };
  const openComments = (event: MouseEvent) => {
    if (isPlainClick(event)) {
      event.preventDefault();
      onOpenComments(post, event.currentTarget as HTMLElement);
    }
  };
  const vote = post.likes === true ? 'up' : post.likes === false ? 'down' : '';
  const voteLabel = vote === 'up' ? ', you upvoted' : vote === 'down' ? ', you downvoted' : '';

  return (
    <li class="row">
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
          <span>r/{post.subreddit}</span>
          <span class="dot-sep" aria-hidden="true" />
          <span>{formatAge(post.createdUtc, now)}</span>
          <span class="dot-sep" aria-hidden="true" />
          <span class={`score ${vote}`}>
            {vote === 'down' ? <DownIcon /> : <UpIcon />}
            <span class="sr-only">Score </span>
            {formatCount(post.score)}
            <span class="sr-only">{voteLabel}</span>
          </span>
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
