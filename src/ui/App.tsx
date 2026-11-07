// The rebuilt reader (M4). For now: top bar and the compact feed with
// endless scrolling. Content layer, comments and picker come next.

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { FeedPage, Post } from '../lib/reddit-data';
import { ChevronDownIcon } from './icons';
import { FeedRow } from './FeedRow';

/** Where the feed comes from: Reddit in the extension, a fixture in the preview. */
export interface FeedSource {
  /** "Home" or "r/name". */
  title: string;
  /** Reddit's own page for this feed (the escape hatch). */
  redditUrl: string;
  load(after: string | null): Promise<FeedPage>;
}

type Status = 'loading' | 'idle' | 'error' | 'end';

export function App({ source, note }: { source: FeedSource; note?: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const after = useRef<string | null>(null);
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const [now] = useState(() => Date.now());

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
            <FeedRow key={post.fullname} post={post} now={now} />
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
    </div>
  );
}
