// The rebuilt reader (M4). For now: top bar and the compact feed with
// endless scrolling. Content layer, comments and picker come next.

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { FeedPage, Post } from '../lib/reddit-data';
import type { VoteDirection } from '../lib/reddit-data';
import { applyVote, directionFor, type VoteButton } from '../lib/vote';
import { ContentLayer } from './ContentLayer';
import { ChevronDownIcon } from './icons';
import { FeedRow } from './FeedRow';

/** Where the feed comes from: Reddit in the extension, a fixture in the preview. */
export interface FeedSource {
  /** "Home" or "r/name". */
  title: string;
  /** Reddit's own page for this feed (the escape hatch). */
  redditUrl: string;
  load(after: string | null): Promise<FeedPage>;
  /** Sends a vote as the logged-in user. Missing where voting is not possible. */
  vote?: (fullname: string, dir: VoteDirection) => Promise<void>;
}

type Status = 'loading' | 'idle' | 'error' | 'end';

/**
 * Our marker in history.state while a post is open, so Back closes it.
 * `session` is new on every page load: history entries survive a reload, and
 * entries from an earlier load must not reopen a post.
 */
interface LayerState {
  unredLayer: string;
  session: string;
}

const SESSION = crypto.randomUUID();

function isOurLayerState(value: unknown): value is LayerState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const state = value as Partial<LayerState>;
  return typeof state.unredLayer === 'string' && state.session === SESSION;
}

export function App({ source, note }: { source: FeedSource; note?: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const after = useRef<string | null>(null);
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const [now] = useState(() => Date.now());
  const [openPost, setOpenPost] = useState<Post | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const postsRef = useRef<Post[]>([]);
  postsRef.current = posts;

  const open = useCallback((post: Post, from: HTMLElement) => {
    opener.current = from;
    setOpenPost(post);
    // A history entry, so the browser's Back button closes the post (layout-spec 8).
    window.history.pushState(
      { unredLayer: post.fullname, session: SESSION } satisfies LayerState,
      '',
    );
  }, []);

  const close = useCallback(() => {
    if (isOurLayerState(window.history.state)) {
      window.history.back(); // the popstate handler closes it
    } else {
      setOpenPost(null);
    }
  }, []);

  /** Shows the vote at once, sends it, and puts the post back if Reddit says no. */
  const vote = useCallback(
    async (post: Post, pressed: VoteButton) => {
      if (!source.vote) {
        return;
      }
      const updated = applyVote(post, directionFor(post.likes, pressed));
      const show = (next: Post) => {
        setPosts((list) => list.map((p) => (p.fullname === next.fullname ? next : p)));
        setOpenPost((open) => (open?.fullname === next.fullname ? next : open));
      };
      show(updated);
      try {
        await source.vote(post.fullname, directionFor(post.likes, pressed));
      } catch (error) {
        show(post);
        throw error;
      }
    },
    [source],
  );

  // Back and Forward open and close the layer.
  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const state: unknown = event.state;
      setOpenPost(
        isOurLayerState(state)
          ? (postsRef.current.find((p) => p.fullname === state.unredLayer) ?? null)
          : null,
      );
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // While a post is open the page under it does not scroll; on close, focus
  // goes back to the post that opened it.
  useEffect(() => {
    if (!openPost) {
      opener.current?.focus();
      return;
    }
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [openPost]);

  const loadMore = useCallback(async () => {
    if (busy.current) {
      return;
    }
    busy.current = true;
    setStatus('loading');
    try {
      const page = await source.load(after.current);
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

  return (
    <div class="app">
      <header class="topbar">
        <button class="picker" type="button" aria-label={`${source.title}, choose a feed`}>
          {source.title}
          <ChevronDownIcon />
        </button>
      </header>
      <main>
        <h1 class="sr-only">{source.title}</h1>
        <ul class="feed">
          {posts.map((post) => (
            <FeedRow key={post.fullname} post={post} now={now} onOpen={open} />
          ))}
        </ul>
        <div ref={sentinel} aria-live="polite">
          {status === 'loading' && <p class="status">Loading…</p>}
          {status === 'end' && <p class="status">You have reached the end.</p>}
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
      {openPost && (
        <ContentLayer
          post={openPost}
          now={now}
          onClose={close}
          onVote={source.vote ? (pressed) => vote(openPost, pressed) : undefined}
        />
      )}
    </div>
  );
}
