// Upvote, score, downvote for an opened post (layout-spec 5.4; colors:
// color-spec rules 4 and 5). Shown under the post's content on the post page
// (D-062). Votes are sent with the user's own login (D-057).

import { useState } from 'preact/hooks';
import { formatCount } from '../lib/format';
import type { Post } from '../lib/reddit-data';
import type { VoteButton } from '../lib/vote';
import { DownIcon, UpIcon } from './icons';

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
