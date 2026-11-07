import { defineContentScript } from 'wxt/utils/define-content-script';
import { isOldRedditPage, showMarker } from '../lib/marker';

export default defineContentScript({
  matches: ['https://old.reddit.com/*'],
  runAt: 'document_idle',
  main() {
    if (isOldRedditPage(window.location.href)) {
      showMarker(document);
    }
  },
});
