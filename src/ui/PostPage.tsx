// The post page (D-062, layout-spec 5.4 and 5.5): one full-screen page over
// the feed that scrolls as one: the post's content and vote bar on top, then
// the sort bar and the comments. Threads fold with a marker on the thread
// line (D-026). Save, share, comment and reply happen here (D-063). The feed
// stays mounted underneath (D-021).

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  addComment,
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
import type { CommentFocus } from '../lib/thread-loader';
import { applyVote, directionFor, type VoteButton } from '../lib/vote';
import { BackIcon, DownIcon, UpIcon } from './icons';
import { PostMedia, PostText } from './PostMedia';
import { PostTools } from './PostTools';
import { SubredditLink } from './SubredditLink';
import { useDialogKeys } from './useDialogKeys';
import { VoteBar } from './VoteBar';

/** Where the post page opens: at the post, or scrolled to its comments. */
export type PostPageStart = 'post' | 'comments';

/** The user moving the page themselves: stop keeping the comments at the top. */
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

/** What the post page needs from Reddit (or from the preview's samples). */
export interface CommentsSource {
  loadThread(post: Post, sort: CommentSort, focus?: CommentFocus): Promise<ThreadItem[]>;
  loadMore(post: Post, more: MoreNode, sort: CommentSort): Promise<ThreadItem[]>;
  vote?: (fullname: string, dir: VoteDirection) => Promise<void>;
  /** Saves (true) or unsaves (false) a post or comment (D-063). */
  save?: (fullname: string, saved: boolean) => Promise<void>;
  /** Posts a comment or reply; Reddit sends the new comment back (D-063). */
  comment?: (parentFullname: string, text: string) => Promise<CommentNode>;
}

interface ThreadActions {
  now: number;
  canVote: boolean;
  canSave: boolean;
  canReply: boolean;
  /** The comment a comment link pointed at, drawn highlighted. */
  focusId?: string;
  /** Where the one open writing box is: a comment's fullname, or null. */
  replyTo: string | null;
  openReply(fullname: string): void;
  closeReply: () => void;
  postReply(parentFullname: string, text: string): Promise<void>;
  vote(comment: CommentNode, pressed: VoteButton): Promise<void>;
  save(comment: CommentNode): Promise<void>;
  loadMore(more: MoreNode): Promise<void>;
}

function message(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/**
 * The writing box for a comment or a reply, in place (D-063). Esc closes an
 * empty box; with text in it, Esc does nothing, so nothing typed is lost.
 * Ctrl+Enter (or Cmd+Enter) posts.
 */
function CommentBox({
  label,
  onPost,
  onCancel,
}: {
  label: string;
  onPost: (text: string) => Promise<void>;
  onCancel: () => void;
}) {
  const field = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    field.current?.focus();
  }, []);

  const send = () => {
    if (!text.trim() || busy) {
      return;
    }
    setBusy(true);
    setError('');
    onPost(text).catch((cause: unknown) => {
      setError(message(cause));
      setBusy(false);
    });
  };

  return (
    <div class="comment-box">
      <textarea
        ref={field}
        class="comment-field"
        aria-label={label}
        placeholder={label}
        rows={4}
        value={text}
        disabled={busy}
        onInput={(event) => {
          setText(event.currentTarget.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            // The page would close on Esc; inside the box it only closes the box.
            event.preventDefault();
            event.stopPropagation();
            if (!text.trim()) {
              onCancel();
            }
          } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            send();
          }
        }}
      />
      {error && (
        <p class="action-error" role="alert">
          Not posted: {error}
        </p>
      )}
      <div class="comment-box-bar">
        <span class="comment-box-hint">Reddit formatting (markdown) works.</span>
        <button type="button" class="text-button" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" class="post-button" disabled={busy || !text.trim()} onClick={send}>
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  );
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

  /** Runs one vote or save at a time; a refusal shows under the comment. */
  const run = (action: () => Promise<void>, failure: string) => {
    if (busy) {
      return;
    }
    setBusy(true);
    setError('');
    action()
      .catch((cause: unknown) => {
        setError(`${failure}: ${message(cause)}`);
      })
      .finally(() => {
        setBusy(false);
      });
  };
  const press = (pressed: VoteButton) => {
    run(() => actions.vote(comment, pressed), 'Vote not sent');
  };
  const hasActions = actions.canVote || actions.canReply || actions.canSave;
  const replying = actions.replyTo === comment.fullname;

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
          <PostText
            html={comment.bodyHtml}
            className={comment.id === actions.focusId ? 'comment-text focused' : 'comment-text'}
          />
          {hasActions && (
            <div class={`comment-actions vote-group ${vote}`}>
              {actions.canVote && (
                <>
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
                </>
              )}
              {actions.canReply && (
                <button
                  type="button"
                  class="comment-action reply"
                  aria-expanded={replying}
                  onClick={() => {
                    if (replying) {
                      actions.closeReply();
                    } else {
                      actions.openReply(comment.fullname);
                    }
                  }}
                >
                  Reply
                </button>
              )}
              {actions.canSave && (
                <button
                  type="button"
                  class={comment.saved ? 'comment-action save saved' : 'comment-action save'}
                  aria-pressed={comment.saved}
                  onClick={() => {
                    run(() => actions.save(comment), 'Not saved');
                  }}
                >
                  {comment.saved ? 'Saved' : 'Save'}
                </button>
              )}
            </div>
          )}
          {error && (
            <p class="action-error" role="alert">
              {error}
            </p>
          )}
          {replying && (
            <CommentBox
              label={`Reply to ${comment.author}`}
              onPost={(text) => actions.postReply(comment.fullname, text)}
              onCancel={actions.closeReply}
            />
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

export function PostPage({
  post,
  now,
  active,
  source,
  onClose,
  onVotePost,
  onSavePost,
  focus,
  start = 'post',
}: {
  /** Opened from a comment link: show that comment's thread first (D-027). */
  focus?: CommentFocus;
  post: Post;
  now: number;
  active: boolean;
  source: CommentsSource;
  onClose: () => void;
  onVotePost?: (pressed: VoteButton) => Promise<void>;
  /** Saves or unsaves the post (D-063). Missing: the Save button is disabled. */
  onSavePost?: () => Promise<void>;
  /** "comments" opens the page scrolled to the comments (D-062). Default: the post. */
  start?: PostPageStart;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const sortBar = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<CommentSort>('confidence');
  const [items, setItems] = useState<ThreadItem[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  /** The one open writing box: the post's fullname (new comment) or a comment's. */
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useDialogKeys(panel, active, onClose);

  useEffect(() => {
    panel.current?.focus();
  }, []);

  // Opened from a comment count or a comment link: start at the comments.
  // Pictures above may still be loading and grow; the page keeps the comments
  // at the top until the user scrolls or touches it.
  // Until the comments arrive the page may be too short to scroll, so it
  // aligns again when they do, and whenever the column changes height.
  const startAtComments = start === 'comments' || Boolean(focus);
  const keepAligned = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const box = scroller.current;
    const bar = sortBar.current;
    const content = column.current;
    if (!startAtComments || !box || !bar || !content) {
      return;
    }
    const align = () => {
      box.scrollTop += bar.getBoundingClientRect().top - box.getBoundingClientRect().top;
    };
    keepAligned.current = align;
    align();
    const resized = new ResizeObserver(align);
    resized.observe(content);
    const stop = () => {
      keepAligned.current = null;
      resized.disconnect();
      for (const type of USER_SCROLL_EVENTS) {
        box.removeEventListener(type, stop);
      }
    };
    for (const type of USER_SCROLL_EVENTS) {
      box.addEventListener(type, stop, { passive: true });
    }
    return stop;
  }, [startAtComments]);

  // A comment link shows that comment's thread until "View all comments".
  const [showAll, setShowAll] = useState(false);
  const focusing = Boolean(focus) && !showAll;

  useEffect(() => {
    let current = true;
    setItems(null);
    setError('');
    source
      .loadThread(post, sort, focusing ? focus : undefined)
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
  }, [post.fullname, sort, attempt, source, focusing, focus]);

  // The comments arrived (or failed): keep them at the top if asked to. A
  // plain effect, so it runs after each comment's text is filled in.
  useEffect(() => {
    keepAligned.current?.();
  }, [items, error]);

  const actions: ThreadActions = {
    now,
    canVote: Boolean(source.vote),
    canSave: Boolean(source.save),
    canReply: Boolean(source.comment),
    focusId: focusing ? focus?.commentId : undefined,
    replyTo,
    openReply: setReplyTo,
    closeReply: () => {
      setReplyTo(null);
    },
    async postReply(parentFullname, text) {
      if (!source.comment) {
        return;
      }
      const added = await source.comment(parentFullname, text);
      setItems((list) => addComment(list ?? [], parentFullname, added));
      setReplyTo(null);
    },
    async save(comment) {
      if (!source.save) {
        return;
      }
      const saved = !comment.saved;
      const mark = (value: boolean) => {
        setItems((list) =>
          list ? updateComment(list, comment.fullname, (c) => ({ ...c, saved: value })) : list,
        );
      };
      mark(saved);
      try {
        await source.save(comment.fullname, saved);
      } catch (cause) {
        mark(comment.saved);
        throw cause;
      }
    },
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
      {/* The bar carries the post's name, so the comments start high (owner,
          session 002). At the top of the page the whole title shows; scrolled
          down, it shrinks to two lines (D-062). */}
      <div class={scrolled ? 'comments-head scrolled' : 'comments-head'}>
        <button class="back" type="button" onClick={onClose}>
          <BackIcon />
          Feed
        </button>
        <div class="head-title">
          <div class="meta">
            {post.over18 && <span class="tag">NSFW</span>}
            <SubredditLink name={post.subreddit} />
            <span class="dot-sep" aria-hidden="true" />
            <span>u/{post.author}</span>
            <span class="dot-sep" aria-hidden="true" />
            <span>{formatAge(post.createdUtc, now)}</span>
          </div>
          <h2 id="comments-title" class="comments-title">
            {post.title}
          </h2>
        </div>
      </div>
      <div
        class="comments-scroll"
        ref={scroller}
        onScroll={(event) => {
          // Two thresholds, so the bar does not flicker between sizes.
          const top = event.currentTarget.scrollTop;
          setScrolled((was) => (was ? top > 4 : top > 24));
        }}
      >
        <div class="comments-column" ref={column}>
          <div class="comments-summary">
            {/* The post itself: picture, gallery, video, text or link card. */}
            <PostMedia post={post} />
            <div class="summary-actions">
              <VoteBar post={post} onVote={onVotePost} />
              <PostTools post={post} onSave={onSavePost} />
            </div>
          </div>
          <div class="sort-bar" ref={sortBar}>
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
            <div class="sort-end">
              <span class="sort-count">
                {formatCount(post.numComments)} {post.numComments === 1 ? 'comment' : 'comments'}
              </span>
              {actions.canReply && (
                <button
                  type="button"
                  class="comment-button"
                  aria-expanded={replyTo === post.fullname}
                  onClick={() => {
                    setReplyTo(replyTo === post.fullname ? null : post.fullname);
                  }}
                >
                  Comment
                </button>
              )}
            </div>
          </div>
          {replyTo === post.fullname && (
            <div class="comment-box-top">
              <CommentBox
                label="Write a comment"
                onPost={(text) => actions.postReply(post.fullname, text)}
                onCancel={actions.closeReply}
              />
            </div>
          )}
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
          {focusing && (
            <div class="focus-note">
              <p>You are viewing one comment’s thread.</p>
              <button
                class="focus-all"
                type="button"
                onClick={() => {
                  setShowAll(true);
                }}
              >
                View all comments
              </button>
            </div>
          )}
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
