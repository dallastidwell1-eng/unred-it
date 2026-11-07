// The top bar (layout-spec 5.1): feed picker button, search, account button
// with the unread dot (D-029). On a phone, search is an icon that opens a
// field across the bar; on desktop the field sits in the center. The bar
// hides while scrolling down and comes back on scrolling up.

import { useEffect, useRef, useState } from 'preact/hooks';
import type { Account } from '../lib/reddit-client';
import { searchPath, type SearchInfo } from '../lib/feed-route';
import { ChevronDownIcon, SearchIcon } from './icons';

/** Scrolled less than this (px) since the last change: ignore it. */
const SCROLL_STEP = 6;
/** The bar never hides this close to the top of the page (px). */
const HIDE_AFTER = 120;

/** True when the key press is going into a text field, so "/" types a slash. */
function typingInField(event: KeyboardEvent): boolean {
  const target = event.composedPath()[0];
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function TopBar({
  title,
  pickerOpen,
  onPickerClick,
  search,
  searchIn,
  onSearch,
  account,
  pinned,
}: {
  title: string;
  pickerOpen: boolean;
  onPickerClick: (event: MouseEvent) => void;
  /** The search this page shows, if it is a search page. */
  search: SearchInfo | null;
  /** The subreddit a new search looks in, or null for all of Reddit. */
  searchIn: string | null;
  /** Opens the search results page at this path. */
  onSearch: (path: string) => void;
  /** undefined while loading, null when logged out. */
  account: Account | null | undefined;
  /** A view is open over the feed: the bar stays put and "/" does nothing. */
  pinned: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [words, setWords] = useState(search?.query ?? '');
  /** Phone only: the search field is open across the bar. */
  const [searching, setSearching] = useState(false);
  const [scrolledAway, setScrolledAway] = useState(false);
  const [focusInside, setFocusInside] = useState(false);

  // Hide while scrolling down, show on scrolling up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < SCROLL_STEP) {
        return;
      }
      setScrolledAway(y > last && y > HIDE_AFTER);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // "/" jumps to search (layout-spec 9), unless the user is typing somewhere.
  useEffect(() => {
    if (pinned) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key !== '/' ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        typingInField(event)
      ) {
        return;
      }
      event.preventDefault();
      // Desktop shows the field already; a phone opens it first.
      if (input.current?.offsetParent) {
        input.current.focus();
      } else {
        setSearching(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [pinned]);

  // Phone: the field appears after this render, then takes focus.
  useEffect(() => {
    if (searching) {
      input.current?.focus();
    }
  }, [searching]);

  const closeSearch = () => {
    setSearching(false);
    input.current?.blur();
  };

  const hidden = scrolledAway && !pinned && !searching && !focusInside;
  const label = searchIn ? `Search r/${searchIn}` : 'Search Reddit';
  const classes = ['topbar'];
  if (hidden) classes.push('hidden');
  if (searching) classes.push('searching');

  return (
    <header
      class={classes.join(' ')}
      onFocusCapture={() => {
        setFocusInside(true);
      }}
      onBlurCapture={() => {
        setFocusInside(false);
      }}
    >
      <button
        class="picker"
        type="button"
        aria-label={`${title}, choose a feed`}
        aria-haspopup="dialog"
        aria-expanded={pickerOpen}
        onClick={onPickerClick}
      >
        <span class="picker-title">{title}</span>
        <ChevronDownIcon />
      </button>

      <form
        class="search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (words.trim()) {
            onSearch(searchPath(words, searchIn));
          }
        }}
      >
        <label class="sr-only" for="search-input">
          {label}
        </label>
        <div class="search-field">
          <SearchIcon />
          <input
            id="search-input"
            ref={input}
            type="search"
            placeholder={label}
            autocomplete="off"
            enterkeyhint="search"
            value={words}
            onInput={(event) => {
              setWords(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                closeSearch();
              }
            }}
          />
          {!words && (
            <kbd class="slash-hint" aria-hidden="true">
              /
            </kbd>
          )}
        </div>
        <button class="search-cancel" type="button" onClick={closeSearch}>
          Cancel
        </button>
      </form>

      <button
        class="icon-button search-open"
        type="button"
        aria-label={label}
        onClick={() => {
          setSearching(true);
        }}
      >
        <SearchIcon size={20} />
      </button>

      {account === undefined && <span class="account" aria-hidden="true" />}
      {account === null && (
        <a class="account signin" href="/login">
          Log in
        </a>
      )}
      {account && (
        <a
          class="account"
          href={`/user/${account.name}/`}
          aria-label={
            account.unread > 0
              ? `Your profile, u/${account.name}, ${String(account.unread)} unread`
              : `Your profile, u/${account.name}`
          }
        >
          <span class="avatar-me" aria-hidden="true">
            {account.name.charAt(0).toUpperCase()}
          </span>
          {account.unread > 0 && <span class="unread-dot" aria-hidden="true" />}
        </a>
      )}
    </header>
  );
}
