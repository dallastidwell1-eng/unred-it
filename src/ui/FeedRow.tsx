// One compact feed row (layout-spec 5.2). No actions in the feed (D-022).

import { formatAge, formatCount } from '../lib/format';
import type { Post } from '../lib/reddit-data';
import { CommentIcon, DownIcon, LinesIcon, LinkIcon, UpIcon } from './icons';

/** A plain left click opens the layer; Ctrl/Cmd/Shift/middle clicks keep the browser's own behavior. */
function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
}

export function FeedRow({
  post,
  now,
  onOpen,
}: {
  post: Post;
  now: number;
  onOpen: (post: Post, opener: HTMLElement) => void;
}) {
  const href = post.permalink;
  const open = (event: MouseEvent) => {
    if (isPlainClick(event)) {
      event.preventDefault();
      onOpen(post, event.currentTarget as HTMLElement);
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
          <a class="comments" href={href}>
            <CommentIcon />
            {formatCount(post.numComments)}
            <span class="sr-only"> comments</span>
          </a>
        </div>
      </div>
    </li>
  );
}
