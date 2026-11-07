// The comments view (layout-spec 5.5): full screen over the feed or the post.
// Threads fold with a marker on the thread line (D-026).

import { useEffect, useRef, useState } from 'preact/hooks';
import {
  type CommentNode,
  type CommentSort,
  type MoreNode,
  replaceMore,
  replyCount,
  SORT_LABELS,
  type ThreadItem,
  updateComment,
} from '../lib/comments';
import { formatAge, formatCount } from '../lib/format';
import type { Post, VoteDirection } from '../lib/reddit-data';
import { applyVote, directionFor, type VoteButton } from '../lib/vote';
import { VoteBar } from './ContentLayer';
import { BackIcon, DownIcon, UpIcon } from './icons';
import { PostText } from './PostMedia';
import { useDialogKeys } from './useDialogKeys';

/** What the comments view needs from Reddit (or from the preview's samples). */
export interface CommentsSource {
  loadThread(post: Post, sort: CommentSort): Promise<ThreadItem[]>;
  loadMore(post: Post, more: MoreNode, sort: CommentSort): Promise<ThreadItem[]>;
  vote?: (fullname: string, dir: VoteDirection) => Promise<void>;
}

interface ThreadActions {
  now: number;
  canVote: boolean;
  vote(comment: CommentNode, pressed: VoteButton): Promise<void>;
  loadMore(more: MoreNode): Promise<void>;
}

function message(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function MoreItem({ more, actions }: { more: MoreNode; actions: ThreadActions }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const label =
    more.children.length === 0
      ? 'Continue this thread'
      : `Load ${String(more.count)} more ${more.count === 1 ? 'reply' : 'replies'}`;
  return (
    <li class="more">
      <button
        type="button"
        class="more-button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError('');
          actions.loadMore(more).catch((cause: unknown) => {
            setError(message(cause));
            setBusy(false);
          });
        }}
      >
        {busy ? 'Loading…' : label}
      </button>
      {error && (
        <p class="action-error" role="alert">
          Could not load: {error}
        </p>
      )}
    </li>
  );
}

function CommentItem({ comment, actions }: { comment: CommentNode; actions: ThreadActions }) {
  const [folded, setFolded] = useState(comment.collapsed);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const hidden = replyCount(comment);
  const vote = comment.likes === true ? 'up' : comment.likes === false ? 'down' : '';

  const press = (pressed: VoteButton) => {
    if (busy) {
      return;
    }
    setBusy(true);
    setError('');
    actions
      .vote(comment, pressed)
      .catch((cause: unknown) => {
        setError(message(cause));
      })
      .finally(() => {
        setBusy(false);
      });
  };

  return (
    <li class={`comment${folded ? ' folded' : ''}`}>
      <div class="comment-head">
        <button
          type="button"
          class="fold"
          aria-expanded={!folded}
          aria-label={`${folded ? 'Show' : 'Hide'} comment by ${comment.author}`}
          onClick={() => {
            setFolded((f) => !f);
          }}
        >
          <span class="fold-ring" aria-hidden="true">
            {folded ? '+' : '−'}
          </span>
        </button>
        <span class={`comment-author${comment.isSubmitter ? ' op' : ''}`}>
          {comment.author}
          {comment.isSubmitter && <span class="sr-only"> (post author)</span>}
        </span>
        {comment.distinguished === 'moderator' && <span class="tag">MOD</span>}
        {comment.distinguished === 'admin' && <span class="tag">ADMIN</span>}
        {comment.stickied && <span class="tag">Pinned</span>}
        <span class="dot-sep" aria-hidden="true" />
        <span>{formatAge(comment.createdUtc, actions.now)}</span>
        <span class="dot-sep" aria-hidden="true" />
        <span class={`comment-points ${vote}`}>
          {comment.scoreHidden ? 'score hidden' : `${formatCount(comment.score)} points`}
        </span>
        {folded && hidden > 0 && (
          <>
            <span class="dot-sep" aria-hidden="true" />
            <span>
              {hidden} {hidden === 1 ? 'reply' : 'replies'} hidden
            </span>
          </>
        )}
      </div>
      {!folded && (
        <div class="comment-content">
          <PostText html={comment.bodyHtml} className="comment-text" />
          {actions.canVote && (
            <div class={`comment-actions vote-group ${vote}`}>
              <button
                type="button"
                class="icon-button small vote-up"
                aria-label={comment.likes === true ? 'Remove upvote' : 'Upvote'}
                aria-pressed={comment.likes === true}
                onClick={() => {
                  press('up');
                }}
              >
                <UpIcon size={18} />
              </button>
              <button
                type="button"
                class="icon-button small vote-down"
                aria-label={comment.likes === false ? 'Remove downvote' : 'Downvote'}
                aria-pressed={comment.likes === false}
                onClick={() => {
                  press('down');
                }}
              >
                <DownIcon size={18} />
              </button>
            </div>
          )}
          {error && (
            <p class="action-error" role="alert">
              Vote not sent: {error}
            </p>
          )}
          {comment.replies.length > 0 && <Thread items={comment.replies} actions={actions} />}
        </div>
      )}
    </li>
  );
}

function Thread({ items, actions }: { items: ThreadItem[]; actions: ThreadActions }) {
  return (
    <ul class="replies">
      {items.map((item) =>
        item.kind === 'comment' ? (
          <CommentItem key={item.fullname} comment={item} actions={actions} />
        ) : (
          <MoreItem key={`more-${item.id}`} more={item} actions={actions} />
        ),
      )}
    </ul>
  );
}

export function CommentsView({
  post,
  now,
  backLabel,
  active,
  source,
  onClose,
  onVotePost,
}: {
  post: Post;
  now: number;
  backLabel: string;
  active: boolean;
  source: CommentsSource;
  onClose: () => void;
  onVotePost?: (pressed: VoteButton) => Promise<void>;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<CommentSort>('confidence');
  const [items, setItems] = useState<ThreadItem[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useDialogKeys(panel, active, onClose);

  useEffect(() => {
    panel.current?.focus();
  }, []);

  useEffect(() => {
    let current = true;
    setItems(null);
    setError('');
    source
      .loadThread(post, sort)
      .then((loaded) => {
        if (current) {
          setItems(loaded);
        }
      })
      .catch((cause: unknown) => {
        if (current) {
          setError(message(cause));
        }
      });
    return () => {
      current = false;
    };
  }, [post.fullname, sort, attempt, source]);

  const actions: ThreadActions = {
    now,
    canVote: Boolean(source.vote),
    async vote(comment, pressed) {
      if (!source.vote) {
        return;
      }
      const dir = directionFor(comment.likes, pressed);
      setItems((list) =>
        list ? updateComment(list, comment.fullname, (c) => applyVote(c, dir)) : list,
      );
      try {
        await source.vote(comment.fullname, dir);
      } catch (cause) {
        setItems((list) =>
          list
            ? updateComment(list, comment.fullname, (c) => ({
                ...c,
                likes: comment.likes,
                score: comment.score,
              }))
            : list,
        );
        throw cause;
      }
    },
    async loadMore(more) {
      const loaded = await source.loadMore(post, more, sort);
      setItems((list) => (list ? replaceMore(list, more.id, loaded) : list));
    },
  };

  return (
    <div
      class="comments-view"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comments-title"
      tabIndex={-1}
      ref={panel}
    >
      <div class="comments-head">
        <button class="back" type="button" onClick={onClose}>
          <BackIcon />
          {backLabel}
        </button>
      </div>
      <div class="comments-scroll">
        <div class="comments-column">
          <div class="comments-summary">
            <div class="meta">
              {post.over18 && <span class="tag">NSFW</span>}
              <span>r/{post.subreddit}</span>
              <span class="dot-sep" aria-hidden="true" />
              <span>u/{post.author}</span>
              <span class="dot-sep" aria-hidden="true" />
              <span>{formatAge(post.createdUtc, now)}</span>
            </div>
            <h2 id="comments-title" class="comments-title">
              {post.title}
            </h2>
            <div class="summary-actions">
              <VoteBar post={post} onVote={onVotePost} />
            </div>
          </div>
          <div class="sort-bar">
            <label class="sort-label">
              <span class="sr-only">Sort comments by</span>
              <select
                class="sort-select"
                value={sort}
                onChange={(event) => {
                  setSort(event.currentTarget.value as CommentSort);
                }}
              >
                {(Object.keys(SORT_LABELS) as CommentSort[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
            <span class="sort-count">
              {formatCount(post.numComments)} {post.numComments === 1 ? 'comment' : 'comments'}
            </span>
          </div>
          <div aria-live="polite">
            {!items && !error && <p class="status">Loading comments…</p>}
            {error && (
              <div class="status">
                <p>Could not load the comments: {error}</p>
                <button
                  class="button"
                  type="button"
                  onClick={() => {
                    setAttempt((a) => a + 1);
                  }}
                >
                  Try again
                </button>
              </div>
            )}
            {items?.length === 0 && <p class="status">No comments yet.</p>}
          </div>
          {items && items.length > 0 && (
            <div class="comment-list">
              <Thread items={items} actions={actions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
