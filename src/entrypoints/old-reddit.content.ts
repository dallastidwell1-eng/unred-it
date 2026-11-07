import { defineContentScript } from 'wxt/utils/define-content-script';
import { READER_ON_CLASS } from '../lib/constants';
import { isOldRedditPage, showMarker } from '../lib/marker';

export default defineContentScript({
  matches: ['https://old.reddit.com/*'],
  runAt: 'document_idle',
  main() {
    // The reader has its own look; the marker is for pages it does not cover yet.
    const readerOn = document.documentElement.classList.contains(READER_ON_CLASS);
    if (isOldRedditPage(window.location.href) && !readerOn) {
      showMarker(document);
    }
  },
});
