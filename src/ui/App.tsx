// The rebuilt reader (M4): top bar, the compact feed with endless scrolling,
// and views stacked over it: an opened post (content layer) and comments.
// The feed stays mounted underneath, so its place never changes (D-021).

import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { CommentSort, MoreNode, ThreadItem } from '../lib/comments';
import { searchPath, type SearchInfo } from '../lib/feed-route';
import type { Account } from '../lib/reddit-client';
import type { Community, FeedPage, Post, VoteDirection } from '../lib/reddit-data';
import { currentFeed, type Subreddit } from '../lib/subreddits';
import { applyVote, directionFor, type VoteButton } from '../lib/vote';
import { isPlainClick } from './clicks';
import { CommentsView } from './CommentsView';
import { ContentLayer } from './ContentLayer';
import { FeedPicker } from './FeedPicker';
import { FeedRow } from './FeedRow';
import { SearchCommunities } from './SearchCommunities';
import { OpenPageContext, SubredditLink } from './SubredditLink';
import { TopBar } from './TopBar';

/** Where the data comes from: Reddit in the extension, samples in the preview. */
export interface FeedSource {
  /** "Home", "Popular", "All" or "r/name". */
  title: string;
  /** The page path of this feed, for example "/" or "/r/books/top/". */
  path: string;
  /** Reddit's own page for this feed (the escape hatch). */
  redditUrl: string;
  load(after: string | null): Promise<FeedPage>;
  loadThread(post: Post, sort: CommentSort): Promise<ThreadItem[]>;
  loadMore(post: Post, more: MoreNode, sort: CommentSort): Promise<ThreadItem[]>;
  /** Sends a vote as the logged-in user. Missing where voting is not possible. */
  vote?: (fullname: string, dir: VoteDirection) => Promise<void>;
  /** The user's subscribed subreddits, sorted. Missing where they cannot be read. */
  loadSubreddits?: () => Promise<Subreddit[]>;
  /** Opens another reader page (feed or search). Default: the browser loads it. */
  openFeed?: (path: string) => void;
  /** The search this page shows, on a search page (D-058). */
  search?: SearchInfo | null;
  /** The logged-in user for the account button; null when logged out. */
  loadAccount?: () => Promise<Account | null>;
}

type Status = 'loading' | 'idle' | 'error' | 'end';

/** One view over the feed. The picker has no post, so its fullname is empty. */
interface Overlay {
  kind: 'post' | 'comments' | 'picker';
  fullname: string;
}

/**
 * Our marker in history.state: the open views, so Back closes the top one.
 * `session` is new on every page load: history entries survive a reload, and
 * entries from an earlier load must not reopen anything.
 */
interface NavState {
  unredSession: string;
  overlays: Overlay[];
}

const SESSION = crypto.randomUUID();

function isOurState(value: unknown): value is NavState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const state = value as Partial<NavState>;
  return state.unredSession === SESSION && Array.isArray(state.overlays);
}

export function App({ source, note }: { source: FeedSource; note?: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  /** A search's matching subreddits and users, shown above its posts. */
  const [communities, setCommunities] = useState<Community[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const after = useRef<string | null>(null);
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const [now] = useState(() => Date.now());
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const overlaysRef = useRef<Overlay[]>([]);
  overlaysRef.current = overlays;
  /** The element that opened each view, to give focus back when it closes. */
  const openers = useRef<(HTMLElement | null)[]>([]);
  const previousDepth = useRef(0);

  const push = useCallback((overlay: Overlay, from: HTMLElement) => {
    const next = [...overlaysRef.current, overlay];
    openers.current[next.length - 1] = from;
    setOverlays(next);
    // A history entry, so the browser's Back button closes it (layout-spec 8).
    window.history.pushState({ unredSession: SESSION, overlays: next } satisfies NavState, '');
  }, []);

  const openPost = useCallback(
    (post: Post, from: HTMLElement) => {
      push({ kind: 'post', fullname: post.fullname }, from);
    },
    [push],
  );

  const openComments = useCallback(
    (post: Post, from: HTMLElement) => {
      push({ kind: 'comments', fullname: post.fullname }, from);
    },
    [push],
  );

  const closeTop = useCallback(() => {
    if (isOurState(window.history.state) && window.history.state.overlays.length > 0) {
      window.history.back(); // the popstate handler closes it
    } else {
      setOverlays((list) => list.slice(0, -1));
    }
  }, []);

  const pickerOpen = overlays.at(-1)?.kind === 'picker';

  const togglePicker = useCallback(
    (event: MouseEvent) => {
      if (overlaysRef.current.at(-1)?.kind === 'picker') {
        closeTop();
      } else if (overlaysRef.current.length === 0) {
        push({ kind: 'picker', fullname: '' }, event.currentTarget as HTMLElement);
      }
    },
    [push, closeTop],
  );

  /** Loads another reader page; `replace` puts it in place of this history entry. */
  const go = useCallback(
    (path: string, replace: boolean) => {
      if (source.openFeed) {
        source.openFeed(path);
      } else if (replace) {
        window.location.replace(path);
      } else {
        window.location.assign(path);
      }
    },
    [source],
  );

  /**
   * Opens the chosen feed. The new page takes the picker's place in history,
   * so Back from it returns to this feed with the picker closed.
   */
  const chooseFeed = useCallback(
    (path: string) => {
      setOverlays([]);
      go(path, true);
    },
    [go],
  );

  // The logged-in user for the account button; read once per page load.
  const [account, setAccount] = useState<Account | null | undefined>(
    source.loadAccount ? undefined : null,
  );
  useEffect(() => {
    let live = true;
    source
      .loadAccount?.()
      .then((user) => {
        if (live) setAccount(user);
      })
      .catch(() => {
        if (live) setAccount(null);
      });
    return () => {
      live = false;
    };
  }, [source]);

  // A new search looks in the subreddit on screen; from Home, Popular, All or
  // a search of all Reddit it looks everywhere (D-058).
  const feed = currentFeed(source.path);
  const searchIn = source.search
    ? source.search.subreddit
    : feed !== null && typeof feed === 'object'
      ? feed.name
      : null;

  // Subscriptions are read once per page load, when the picker first opens.
  const subscriptions = useRef<Promise<Subreddit[]> | null>(null);
  const loadSubreddits = useMemo(() => {
    const load = source.loadSubreddits;
    if (!load) {
      return undefined;
    }
    return () => {
      subscriptions.current ??= load().catch((cause: unknown) => {
        subscriptions.current = null; // the next try asks Reddit again
        throw cause;
      });
      return subscriptions.current;
    };
  }, [source]);

  // Back and Forward close and reopen views. A page brought back from the
  // browser's memory (Back after choosing another feed) shows what its
  // history entry says, so a picker left open there is closed.
  useEffect(() => {
    const sync = (state: unknown) => {
      setOverlays(isOurState(state) ? state.overlays : []);
    };
    const onPop = (event: PopStateEvent) => {
      sync(event.state);
    };
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        sync(window.history.state);
      }
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('pageshow', onShow);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('pageshow', onShow);
    };
  }, []);

  // While a view is open the page under it does not scroll. When one closes,
  // focus goes back to whatever opened it.
  useEffect(() => {
    const depth = overlays.length;
    if (depth < previousDepth.current) {
      openers.current[depth]?.focus();
    }
    previousDepth.current = depth;
    if (depth === 0) {
      return;
    }
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [overlays]);

  /** Shows the vote at once, sends it, and puts the post back if Reddit says no. */
  const vote = useCallback(
    async (post: Post, pressed: VoteButton) => {
      if (!source.vote) {
        return;
      }
      const dir = directionFor(post.likes, pressed);
      const show = (next: Post) => {
        setPosts((list) => list.map((p) => (p.fullname === next.fullname ? next : p)));
      };
      show(applyVote(post, dir));
      try {
        await source.vote(post.fullname, dir);
      } catch (cause) {
        show(post);
        throw cause;
      }
    },
    [source],
  );

  const loadMore = useCallback(async () => {
    if (busy.current) {
      return;
    }
    busy.current = true;
    setStatus('loading');
    try {
      const page = await source.load(after.current);
      if (page.communities) {
        setCommunities(page.communities);
      }
      const seen = new Set<string>();
      setPosts((previous) => {
        previous.forEach((p) => seen.add(p.fullname));
        return [...previous, ...page.posts.filter((p) => !seen.has(p.fullname))];
      });
      after.current = page.after;
      setStatus(page.after ? 'idle' : 'end');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus('error');
    } finally {
      busy.current = false;
    }
  }, [source]);

  useEffect(() => {
    void loadMore();
  }, [loadMore]);

  // Load the next page when the end of the list comes near.
  useEffect(() => {
    const target = sentinel.current;
    if (!target || status !== 'idle') {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: '800px 0px' },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [status, loadMore]);

  /** Opens another reader page as a new history entry (subreddit links). */
  const openPage = useCallback(
    (path: string) => {
      go(path, false);
    },
    [go],
  );

  const postFor = (fullname: string) => posts.find((p) => p.fullname === fullname);
  const voteFor = (post: Post) =>
    source.vote ? (pressed: VoteButton) => vote(post, pressed) : undefined;

  return (
    <OpenPageContext.Provider value={openPage}>
      <div class="app">
        <TopBar
          title={source.title}
          pickerOpen={pickerOpen}
          onPickerClick={togglePicker}
          search={source.search ?? null}
          searchIn={searchIn}
          onSearch={(path) => {
            go(path, false);
          }}
          account={account}
          pinned={overlays.length > 0}
        />
        <main>
          <h1 class="sr-only">{source.title}</h1>
          {source.search && (
            <div class="search-head">
              <p>
                Results for <strong>“{source.search.query}”</strong>
                {source.search.subreddit && (
                  <>
                    {' in '}
                    <SubredditLink name={source.search.subreddit} />
                  </>
                )}
              </p>
              {source.search.subreddit && (
                <a
                  href={searchPath(source.search.query, null)}
                  onClick={(event) => {
                    if (isPlainClick(event)) {
                      event.preventDefault();
                      go(event.currentTarget.getAttribute('href') ?? '/', false);
                    }
                  }}
                >
                  Search all of Reddit
                </a>
              )}
            </div>
          )}
          <SearchCommunities
            items={communities}
            hasPosts={posts.length > 0}
            onOpen={(path) => {
              go(path, false);
            }}
          />
          <ul class="feed">
            {posts.map((post) => (
              <FeedRow
                key={post.fullname}
                post={post}
                now={now}
                onOpen={openPost}
                onOpenComments={openComments}
              />
            ))}
          </ul>
          <div ref={sentinel} aria-live="polite">
            {status === 'loading' && <p class="status">Loading…</p>}
            {status === 'end' && (
              <p class="status">
                {posts.length > 0
                  ? 'You have reached the end.'
                  : source.search
                    ? 'Nothing found.'
                    : 'No posts here.'}
              </p>
            )}
            {status === 'error' && (
              <div class="status">
                <p>Could not load the feed: {error}</p>
                <button class="button" type="button" onClick={() => void loadMore()}>
                  Try again
                </button>
              </div>
            )}
          </div>
        </main>
        <footer class="footer">
          <a href={source.redditUrl}>Open Reddit's own page</a>
          {note && <p>{note}</p>}
        </footer>
        {overlays.map((overlay, index) => {
          const active = index === overlays.length - 1;
          const key = `${overlay.kind}-${overlay.fullname}-${String(index)}`;
          if (overlay.kind === 'picker') {
            return (
              <FeedPicker
                key={key}
                current={currentFeed(source.path)}
                loadSubreddits={loadSubreddits}
                onChoose={chooseFeed}
                onClose={closeTop}
                active={active}
              />
            );
          }
          const post = postFor(overlay.fullname);
          if (!post) {
            return null;
          }
          if (overlay.kind === 'post') {
            return (
              <ContentLayer
                key={key}
                post={post}
                now={now}
                active={active}
                onClose={closeTop}
                onVote={voteFor(post)}
                onOpenComments={(from) => {
                  openComments(post, from);
                }}
              />
            );
          }
          return (
            <CommentsView
              key={key}
              post={post}
              now={now}
              active={active}
              backLabel={overlays[index - 1]?.kind === 'post' ? 'Post' : 'Feed'}
              source={source}
              onClose={closeTop}
              onVotePost={voteFor(post)}
            />
          );
        })}
      </div>
    </OpenPageContext.Provider>
  );
}
