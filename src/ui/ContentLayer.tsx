// The content layer (layout-spec 5.4): an opened post over the live feed.
// The feed stays mounted underneath, so its place never changes (D-021).
// Voting, saving and sharing come in M5; comments view later in M4.

import { useEffect, useRef } from 'preact/hooks';
import { formatAge, formatCount } from '../lib/format';
import type { Post } from '../lib/reddit-data';
import { BackIcon, CommentIcon, DownIcon, UpIcon } from './icons';
import { PostMedia } from './PostMedia';

const REDDIT = 'https://old.reddit.com';

export function ContentLayer({
  post,
  now,
  onClose,
}: {
  post: Post;
  now: number;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  // Move focus into the dialog when it opens (layout-spec 8).
  useEffect(() => {
    panel.current?.focus();
  }, [post.fullname]);

  // Esc closes; Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const element = panel.current;
      if (!element) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = Array.from(
        element.querySelectorAll<HTMLElement>('a[href], button, [tabindex="0"]'),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      const active = (element.getRootNode() as Document | ShadowRoot).activeElement;
      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && (active === first || active === element)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const vote = post.likes === true ? 'up' : post.likes === false ? 'down' : '';

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
              <span>r/{post.subreddit}</span>
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
            <span class={`score ${vote}`}>
              {vote === 'down' ? <DownIcon size={18} /> : <UpIcon size={18} />}
              <span class="sr-only">Score </span>
              {formatCount(post.score)}
            </span>
            <a class="action-link" href={`${REDDIT}${post.permalink}`}>
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
