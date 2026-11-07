// The feed picker (layout-spec 5.6): a sheet that drops down under the top bar
// with a filter field, Home / Popular / All chips and the user's subscribed
// subreddits. Choosing a feed loads that page; the reader takes it over again.

import { useEffect, useRef, useState } from 'preact/hooks';
import {
  avatarLetter,
  avatarTone,
  feedPathFor,
  filterSubreddits,
  type FixedFeed,
  type Subreddit,
  typedSubredditName,
} from '../lib/subreddits';
import { themes } from './tokens';
import { isPlainClick } from './clicks';
import { ArrowRightIcon, SearchIcon } from './icons';
import { useDialogKeys } from './useDialogKeys';

const FIXED: { feed: FixedFeed; label: string }[] = [
  { feed: 'home', label: 'Home' },
  { feed: 'popular', label: 'Popular' },
  { feed: 'all', label: 'All' },
];

const TONES = themes.dark.placeholders.length;

type Status = 'loading' | 'ready' | 'error';

/** One choice in the list: a subscription, or "go to" a name the user typed. */
interface Row {
  key: string;
  path: string;
  name: string;
  goTo: boolean;
}

function rowsFor(list: Subreddit[], query: string): Row[] {
  const matches = filterSubreddits(list, query);
  const rows: Row[] = matches.map((sub) => ({
    key: sub.name,
    path: feedPathFor(sub),
    name: sub.name,
    goTo: false,
  }));
  const typed = typedSubredditName(query);
  if (typed && !matches.some((sub) => sub.name.toLowerCase() === typed.toLowerCase())) {
    rows.push({ key: `go:${typed}`, path: `/r/${typed}/`, name: typed, goTo: true });
  }
  return rows;
}

export function FeedPicker({
  current,
  loadSubreddits,
  onChoose,
  onClose,
  active = true,
}: {
  /** The feed on screen now, shown as selected. */
  current: FixedFeed | { name: string };
  /** The user's subscriptions; missing where they cannot be read. */
  loadSubreddits?: () => Promise<Subreddit[]>;
  /** Opens the feed at this old.reddit.com path. */
  onChoose: (path: string) => void;
  onClose: () => void;
  active?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [list, setList] = useState<Subreddit[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

  useDialogKeys(panel, active, onClose);

  // Focus moves into the sheet (layout-spec 8). On a touch screen it goes to
  // the sheet itself, so the keyboard does not cover the list straight away.
  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    (touch ? panel.current : input.current)?.focus();
  }, []);

  useEffect(() => {
    if (!loadSubreddits) {
      setStatus('ready');
      return;
    }
    let live = true;
    setStatus('loading');
    loadSubreddits()
      .then((subs) => {
        if (live) {
          setList(subs);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (live) {
          setStatus('error');
        }
      });
    return () => {
      live = false;
    };
  }, [loadSubreddits, attempt]);

  const rows = rowsFor(list, query);
  const filtering = query.trim() !== '';
  const selectedName = typeof current === 'object' ? current.name.toLowerCase() : null;

  const follow = (path: string) => (event: MouseEvent) => {
    if (isPlainClick(event)) {
      event.preventDefault();
      onChoose(path);
    }
  };

  const countText = !filtering
    ? ''
    : rows.length === 0
      ? 'No matches'
      : `${String(rows.length)} ${rows.length === 1 ? 'match' : 'matches'}`;

  return (
    <div class="picker-root">
      <div class="picker-scrim" onClick={onClose} />
      <div
        class="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Choose a feed"
        tabIndex={-1}
        ref={panel}
      >
        <form
          class="sheet-filter"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            // Enter opens the first row, which is drawn as the default.
            const first = rows[0];
            if (filtering && first) {
              onChoose(first.path);
            }
          }}
        >
          <label class="sr-only" for="feed-filter">
            Filter your subreddits, or type a subreddit name
          </label>
          <div class="filter-field">
            <SearchIcon />
            <input
              id="feed-filter"
              ref={input}
              type="text"
              placeholder="Filter or go to r/…"
              autocomplete="off"
              autocapitalize="off"
              spellcheck={false}
              enterkeyhint="go"
              value={query}
              onInput={(event) => {
                setQuery(event.currentTarget.value);
              }}
            />
          </div>
        </form>

        <nav class="chips" aria-label="Feeds">
          {FIXED.map(({ feed, label }) => {
            const selected = current === feed;
            const path = feedPathFor(feed);
            return (
              <a
                key={feed}
                class={selected ? 'chip selected' : 'chip'}
                href={path}
                aria-current={selected ? 'page' : undefined}
                onClick={follow(path)}
              >
                {label}
              </a>
            );
          })}
        </nav>

        <h2 class="section-label" id="subs-label">
          Your subreddits
        </h2>
        <div class="sheet-list">
          {rows.length > 0 && (
            <ul class="sub-list" aria-labelledby="subs-label">
              {rows.map((row, index) => {
                const selected = !row.goTo && row.name.toLowerCase() === selectedName;
                const classes = ['sub-row'];
                if (selected) classes.push('selected');
                if (filtering && index === 0) classes.push('default');
                return (
                  <li key={row.key}>
                    <a
                      class={classes.join(' ')}
                      href={row.path}
                      aria-current={selected ? 'page' : undefined}
                      onClick={follow(row.path)}
                    >
                      {row.goTo ? (
                        <span class="avatar go" aria-hidden="true">
                          <ArrowRightIcon size={16} />
                        </span>
                      ) : (
                        <span
                          class={`avatar tone-${String(avatarTone(row.name, TONES))}`}
                          aria-hidden="true"
                        >
                          {avatarLetter(row.name)}
                        </span>
                      )}
                      <span class="sub-name">
                        {row.goTo ? `Go to r/${row.name}` : `r/${row.name}`}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
          {status === 'loading' && <p class="sheet-note">Loading your subreddits…</p>}
          {status === 'error' && (
            <div class="sheet-note">
              <p>Could not load your subreddits. Are you signed in to Reddit?</p>
              <button
                class="button"
                type="button"
                onClick={() => {
                  setAttempt((n) => n + 1);
                }}
              >
                Try again
              </button>
            </div>
          )}
          {status === 'ready' && list.length === 0 && !filtering && loadSubreddits && (
            <p class="sheet-note">You have not joined any subreddits yet.</p>
          )}
          {status === 'ready' && filtering && rows.length === 0 && (
            <p class="sheet-note">None of your subreddits match.</p>
          )}
        </div>
        <p class="sr-only" aria-live="polite">
          {countText}
        </p>
      </div>
    </div>
  );
}
