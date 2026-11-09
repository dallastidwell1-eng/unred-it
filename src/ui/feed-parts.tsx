// Pieces shared by the compact row (FeedRow) and the card (FeedCard).

import { formatCount } from '../lib/format';
import type { Post } from '../lib/reddit-data';
import { isPlainClick } from './clicks';
import { DownIcon, UpIcon } from './icons';

export type Opener = (post: Post, opener: HTMLElement) => void;

/**
 * Click handlers for links to a post: a plain click opens the view in the
 * reader; a middle click or Ctrl+click keeps the browser's own behavior.
 */
export function feedClicks(post: Post, onOpen: Opener, onOpenComments: Opener) {
  return {
    open: (event: MouseEvent) => {
      if (isPlainClick(event)) {
        event.preventDefault();
        onOpen(post, event.currentTarget as HTMLElement);
      }
    },
    openComments: (event: MouseEvent) => {
      if (isPlainClick(event)) {
        event.preventDefault();
        onOpenComments(post, event.currentTarget as HTMLElement);
      }
    },
  };
}

/** The score with the user's own vote shown (color spec, rules 4 and 5). Read-only (D-022). */
export function FeedScore({ post, iconSize }: { post: Post; iconSize?: number }) {
  const vote = post.likes === true ? 'up' : post.likes === false ? 'down' : '';
  const voteLabel = vote === 'up' ? ', you upvoted' : vote === 'down' ? ', you downvoted' : '';
  return (
    <span class={`score ${vote}`}>
      {vote === 'down' ? <DownIcon size={iconSize} /> : <UpIcon size={iconSize} />}
      <span class="sr-only">Score </span>
      {formatCount(post.score)}
      <span class="sr-only">{voteLabel}</span>
    </span>
  );
}
