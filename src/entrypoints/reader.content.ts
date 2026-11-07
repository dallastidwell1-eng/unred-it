// The rebuilt reader (M4) on old.reddit.com feed pages. Other pages, and any
// page opened with ?unred=off, keep Reddit's own view for now.

import { defineContentScript } from 'wxt/utils/define-content-script';
import { feedJsonPath, feedTitle, isFeedPath, readerTurnedOff } from '../lib/feed-route';
import { parseFeedPage } from '../lib/reddit-data';
import type { FeedSource } from '../ui/App';
import { loadFonts } from '../ui/fonts';
import { mountReader, READER_TAG } from '../ui/mount';
import { themes } from '../ui/tokens';
import { SPIKE_HASH } from '../spike/spike-panel';

export const READER_ON_CLASS = 'unred-it-on';

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

function redditSource(): FeedSource {
  const { pathname, search } = window.location;
  const off = new URLSearchParams(search);
  off.set('unred', 'off');
  return {
    title: feedTitle(pathname),
    redditUrl: `${pathname}?${off.toString()}`,
    async load(after) {
      const response = await fetch(feedJsonPath(pathname, search, after), {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Reddit answered HTTP ${String(response.status)}`);
      }
      return parseFeedPage(await response.json());
    },
  };
}

function whenBodyReady(run: () => void): void {
  if (document.body) {
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

    const fontsLoaded = loadFonts();
    whenBodyReady(() => {
      const host = mountReader(document.body, redditSource());
      void fontsLoaded.then((ok) => {
        // Temporary M4 check for the owner's test: is Inter in use?
        host.dataset.fonts = ok ? 'inter' : 'system';
      });
    });
  },
});
