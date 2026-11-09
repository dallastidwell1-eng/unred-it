// The rebuilt reader (M4) on old.reddit.com feed pages, post searches
// (D-058) and post or comment addresses (D-027). Other pages (profiles,
// wikis, settings), and any page opened with ?unred=off, keep Reddit's own
// view for now.

import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';
import {
  feedJsonPath,
  feedTitle,
  isFeedPath,
  isSearchPath,
  readerTurnedOff,
  searchInfo,
} from '../lib/feed-route';
import { loadSearchPage } from '../lib/search-page';
import { createRedditClient } from '../lib/reddit-client';
import { parseFeedPage } from '../lib/reddit-data';
import { loadSubscriptions } from '../lib/subreddits';
import { postRoute } from '../lib/reddit-links';
import { loadMoreItems, loadPost, loadThread } from '../lib/thread-loader';
import type { FeedSource } from '../ui/App';
import { loadFonts } from '../ui/fonts';
import { mountReader, READER_TAG } from '../ui/mount';
import { themes } from '../ui/tokens';
import { fitToScreenWidth } from '../ui/viewport';
import { READER_ON_CLASS } from '../lib/constants';
import { DEFAULT_VIEW, storageViewStore, type FeedView, type ViewStore } from '../lib/view-setting';

/** Hides Reddit's page under the reader. Added before Reddit's page draws. */
function pageCss(): string {
  return `
html.${READER_ON_CLASS}, html.${READER_ON_CLASS} body {
  margin: 0 !important; padding: 0 !important;
  background: ${themes.light.bg} !important;
}
@media (prefers-color-scheme: dark) {
  html.${READER_ON_CLASS}, html.${READER_ON_CLASS} body { background: ${themes.dark.bg} !important; }
}
html.${READER_ON_CLASS} body > :not(${READER_TAG}) { display: none !important; }
`;
}

/** GET a Reddit .json address as the logged-in user. */
async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Reddit answered HTTP ${String(response.status)}`);
  }
  return response.json();
}

/** GET a Reddit page's HTML as the logged-in user (search results, D-058). */
async function fetchText(path: string): Promise<string> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { Accept: 'text/html' },
  });
  if (!response.ok) {
    throw new Error(`Reddit answered HTTP ${String(response.status)}`);
  }
  return response.text();
}

function redditSource(view: FeedView, viewStore: ViewStore): FeedSource {
  const { pathname, search } = window.location;
  const off = new URLSearchParams(search);
  off.set('unred', 'off');
  const client = createRedditClient((url, init) => fetch(url, init));
  // A post page shows its comments over the post's subreddit feed (D-027).
  const direct = postRoute(pathname, search);
  const feedPath = direct ? (direct.subreddit ? `/r/${direct.subreddit}/` : '/') : pathname;
  const feedSearch = direct ? '' : search;
  return {
    vote: (fullname, dir) => client.vote(fullname, dir),
    save: (fullname, saved) => client.save(fullname, saved),
    comment: (parentFullname, text) => client.comment(parentFullname, text),
    loadAccount: () => client.account(),
    loadSubreddits: () => loadSubscriptions(fetchJson),
    title: feedTitle(feedPath),
    path: feedPath,
    search: searchInfo(feedPath, feedSearch),
    redditUrl: `${pathname}?${off.toString()}`,
    direct,
    loadPost: (postId) => loadPost(fetchJson, postId),
    view,
    viewStore,
    async load(after) {
      // Reddit blocks /search.json; search pages are read from their HTML.
      if (isSearchPath(feedPath)) {
        return loadSearchPage(fetchText, fetchJson, feedPath, feedSearch, after);
      }
      return parseFeedPage(await fetchJson(feedJsonPath(feedPath, feedSearch, after)));
    },
    loadThread: (post, sort, focus) => loadThread(fetchJson, post, sort, focus),
    loadMore: (post, more, sort) => loadMoreItems(fetchJson, post, more, sort),
  };
}

function whenBodyReady(run: () => void): void {
  // At document_start the body may not exist yet, whatever the DOM types say.
  const body = document.body as HTMLElement | null;
  if (body) {
    run();
  } else {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  }
}

export default defineContentScript({
  matches: ['https://old.reddit.com/*'],
  runAt: 'document_start',
  main() {
    const { pathname, search } = window.location;
    const readerPage =
      isFeedPath(pathname) ||
      searchInfo(pathname, search) !== null ||
      postRoute(pathname, search) !== null;
    if (!readerPage || readerTurnedOff(search)) {
      return;
    }
    const style = document.createElement('style');
    style.textContent = pageCss();
    document.documentElement.append(style);
    document.documentElement.classList.add(READER_ON_CLASS);
    // Phones: lay the page out at the screen's width, not as a shrunken
    // desktop page. Again once the head exists, in case Reddit adds its own.
    fitToScreenWidth(document);

    // The fonts are local files, so waiting for them is short and avoids a
    // visible font swap.
    const fontsLoaded = loadFonts().catch(() => false);
    // The saved view is read at the same time, so the feed is drawn in it
    // from the start (no switch from compact to cards on load).
    // The setting lives in Firefox Sync storage (D-061, D-028).
    const viewStore = storageViewStore(browser.storage.sync);
    const viewLoaded = viewStore.load().catch(() => DEFAULT_VIEW);
    whenBodyReady(() => {
      fitToScreenWidth(document);
      void Promise.all([viewLoaded, fontsLoaded]).then(([view]) => {
        mountReader(document.body, redditSource(view, viewStore));
      });
    });
  },
});
