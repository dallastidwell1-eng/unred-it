// The rebuilt reader (M4) on old.reddit.com feed pages. Other pages, and any
// page opened with ?unred=off, keep Reddit's own view for now.

import { defineContentScript } from 'wxt/utils/define-content-script';
import { feedJsonPath, feedTitle, isFeedPath, readerTurnedOff } from '../lib/feed-route';
import { createRedditClient } from '../lib/reddit-client';
import { parseFeedPage } from '../lib/reddit-data';
import { loadMoreItems, loadThread } from '../lib/thread-loader';
import type { FeedSource } from '../ui/App';
import { loadFonts } from '../ui/fonts';
import { mountReader, READER_TAG } from '../ui/mount';
import { themes } from '../ui/tokens';
import { READER_ON_CLASS, SPIKE_HASH } from '../lib/constants';

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

function redditSource(): FeedSource {
  const { pathname, search } = window.location;
  const off = new URLSearchParams(search);
  off.set('unred', 'off');
  const client = createRedditClient((url, init) => fetch(url, init));
  return {
    vote: (fullname, dir) => client.vote(fullname, dir),
    title: feedTitle(pathname),
    redditUrl: `${pathname}?${off.toString()}`,
    async load(after) {
      return parseFeedPage(await fetchJson(feedJsonPath(pathname, search, after)));
    },
    loadThread: (post, sort) => loadThread(fetchJson, post, sort),
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
    const { pathname, search, hash } = window.location;
    if (!isFeedPath(pathname) || readerTurnedOff(search) || hash === SPIKE_HASH) {
      return;
    }
    const style = document.createElement('style');
    style.textContent = pageCss();
    document.documentElement.append(style);
    document.documentElement.classList.add(READER_ON_CLASS);

    // The fonts are local files, so waiting for them is short and avoids a
    // visible font swap.
    const fontsLoaded = loadFonts().catch(() => false);
    whenBodyReady(() => {
      void fontsLoaded.then((ok) => {
        // Temporary M4 note for the owner's test: which font is in use.
        const note = ok ? 'Font: Inter' : 'Font: system (Inter did not load)';
        mountReader(document.body, redditSource(), note);
      });
    });
  },
});
