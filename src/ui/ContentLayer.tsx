// The content layer (layout-spec 5.4): an opened post over the live feed.
// The feed stays mounted underneath, so its place never changes (D-021).
// Voting is here (D-057); saving and sharing come in M5.

import { useEffect, useRef, useState } from 'preact/hooks';
import { formatAge, formatCount } from '../lib/format';
import type { Post } from '../lib/reddit-data';
import type { VoteButton } from '../lib/vote';
import { isPlainClick } from './clicks';
import { BackIcon, CommentIcon, DownIcon, UpIcon } from './icons';
import { PostMedia } from './PostMedia';
import { SubredditLink } from './SubredditLink';
import { useDialogKeys } from './useDialogKeys';

const REDDIT = 'https://old.reddit.com';

/** Upvote, score, downvote (layout-spec 5.4; colors: color-spec rules 4 and 5). */
export function VoteBar({
  post,
  onVote,
}: {
  post: Post;
  onVote?: (pressed: VoteButton) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const vote = post.likes === true ? 'up' : post.likes === false ? 'down' : '';
  const press = (pressed: VoteButton) => {
    if (!onVote || busy) {
      return;
    }
    setBusy(true);
    setError('');
    onVote(pressed)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        setBusy(false);
      });
  };

  return (
    <>
      <div class={`vote-group ${vote}`}>
        <button
          type="button"
          class="icon-button vote-up"
          aria-label={post.likes === true ? 'Remove upvote' : 'Upvote'}
          aria-pressed={post.likes === true}
          disabled={!onVote}
          onClick={() => {
            press('up');
          }}
        >
          <UpIcon size={20} />
        </button>
        <span class="vote-score">
          <span class="sr-only">Score </span>
          {formatCount(post.score)}
        </span>
        <button
          type="button"
          class="icon-button vote-down"
          aria-label={post.likes === false ? 'Remove downvote' : 'Downvote'}
          aria-pressed={post.likes === false}
          disabled={!onVote}
          onClick={() => {
            press('down');
          }}
        >
          <DownIcon size={20} />
        </button>
      </div>
      {error && (
        <p class="action-error" role="alert">
          Vote not sent: {error}
        </p>
      )}
    </>
  );
}

export function ContentLayer({
  post,
  now,
  onClose,
  onVote,
  active = true,
  onOpenComments,
}: {
  post: Post;
  now: number;
  onClose: () => void;
  onVote?: (pressed: VoteButton) => Promise<void>;
  /** Only the dialog on top answers Esc and keeps Tab inside. */
  active?: boolean;
  onOpenComments?: (opener: HTMLElement) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  // Move focus into the dialog when it opens (layout-spec 8).
  useEffect(() => {
    panel.current?.focus();
  }, [post.fullname]);

  useDialogKeys(panel, active, onClose);

  // When the comments cover this post, its video stops, so two never play at once.
  useEffect(() => {
    if (!active) {
      panel.current?.querySelectorAll('video').forEach((video) => {
        video.pause();
      });
    }
  }, [active]);

  return (
    <div class="layer-root">
      <div class="scrim" onClick={onClose} />
      <div
        class="layer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="layer-title"
        tabIndex={-1}
        ref={panel}
      >
        <div class="handle" aria-hidden="true" />
        <div class="layer-head">
          <button class="back" type="button" onClick={onClose}>
            <BackIcon />
            Feed
          </button>
        </div>
        <div class="layer-scroll">
          <article class="layer-body">
            <div class="meta">
              {post.over18 && <span class="tag">NSFW</span>}
              <SubredditLink name={post.subreddit} />
              <span class="dot-sep" aria-hidden="true" />
              <span>u/{post.author}</span>
              <span class="dot-sep" aria-hidden="true" />
              <span>{formatAge(post.createdUtc, now)}</span>
            </div>
            <h2 id="layer-title" class="layer-title">
              {post.title}
            </h2>
            <PostMedia post={post} />
          </article>
          <div class="action-bar">
            <VoteBar post={post} onVote={onVote} />
            <a
              class="action-link"
              href={`${REDDIT}${post.permalink}`}
              onClick={(event) => {
                if (onOpenComments && isPlainClick(event)) {
                  event.preventDefault();
                  onOpenComments(event.currentTarget);
                }
              }}
            >
              <CommentIcon size={18} />
              {formatCount(post.numComments)}
              <span class="sr-only"> comments</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
