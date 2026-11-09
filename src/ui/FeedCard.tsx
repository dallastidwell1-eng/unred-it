// One feed card (layout-spec 5.3, D-019): meta line, title,
// then a picture, a two-line excerpt or a link chip, and a footer with the
// score and the comment count. Same behavior as a compact row: the content
// opens the post, the comment count opens the comments; no actions (D-022).

import { useMemo } from 'preact/hooks';
import { cardContent } from '../lib/card';
import { formatAge, formatCount } from '../lib/format';
import type { Post } from '../lib/reddit-data';
import { feedClicks, FeedScore, type Opener } from './feed-parts';
import { CommentIcon, GalleryIcon, LinkIcon, PlayIcon } from './icons';
import { SubredditLink } from './SubredditLink';

/** One parser for all cards; parsing builds an inert document only. */
let parser: DOMParser | null = null;

export function FeedCard({
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
  const content = useMemo(() => cardContent(post, (parser ??= new DOMParser())), [post]);

  return (
    <li class="card" data-fullname={post.fullname}>
      <div class="meta card-meta">
        {post.stickied && <span class="tag">Pinned</span>}
        {post.over18 && <span class="tag">NSFW</span>}
        <SubredditLink name={post.subreddit} />
        <span class="dot-sep" aria-hidden="true" />
        <span>{formatAge(post.createdUtc, now)}</span>
      </div>
      {/* The title is the one tab stop; the picture, excerpt and chip are
          mouse/touch shortcuts to the same post. */}
      <a class="card-title" href={href} onClick={open}>
        {post.title}
      </a>
      {content.kind === 'image' && (
        <a class="card-image" href={href} tabIndex={-1} aria-hidden="true" onClick={open}>
          <img
            src={content.url}
            width={content.width}
            height={content.height}
            alt=""
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
          />
          {content.video && (
            <span class="card-play">
              <PlayIcon size={22} />
            </span>
          )}
          {content.galleryCount > 1 && (
            <span class="card-badge">
              <GalleryIcon />
              {content.galleryCount}
            </span>
          )}
        </a>
      )}
      {content.kind === 'text' && (
        <a class="card-excerpt" href={href} tabIndex={-1} onClick={open}>
          {content.excerpt}
        </a>
      )}
      {content.kind === 'link' && (
        <a class="card-link" href={href} tabIndex={-1} onClick={open}>
          <LinkIcon size={16} />
          <span class="card-domain">{content.domain}</span>
        </a>
      )}
      <div class="meta card-foot">
        <FeedScore post={post} iconSize={14} />
        <a class="comments" href={href} onClick={openComments}>
          <CommentIcon size={15} />
          {formatCount(post.numComments)}
          <span class="sr-only"> comments</span>
        </a>
      </div>
    </li>
  );
}
