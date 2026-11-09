// Every reddit.com link opens in the reader (D-027): a www.reddit.com or
// reddit.com page is sent to the same address on old.reddit.com, where the
// reader takes over. Pages old.reddit.com does not have stay (see
// redirectTarget), and ?unred=off keeps any page as Reddit made it.

import { defineContentScript } from 'wxt/utils/define-content-script';
import { redirectTarget } from '../lib/reddit-links';

/** Do not send the same address again within this time (ms). */
const LOOP_WINDOW = 15_000;
const KEY = 'unred-it:sent-to-old';

/**
 * True if this address was sent to old.reddit.com moments ago, which means
 * old.reddit.com sent it back: stay, instead of bouncing for ever.
 */
function bouncedBack(address: string): boolean {
  try {
    const raw = sessionStorage.getItem(KEY);
    const last = raw ? (JSON.parse(raw) as { address?: unknown; at?: unknown }) : null;
    const recent = typeof last?.at === 'number' && Date.now() - last.at < LOOP_WINDOW;
    if (recent && last.address === address) {
      return true;
    }
    sessionStorage.setItem(KEY, JSON.stringify({ address, at: Date.now() }));
  } catch {
    // Storage blocked: the referrer check below still prevents most loops.
  }
  return false;
}

export default defineContentScript({
  matches: ['https://www.reddit.com/*', 'https://reddit.com/*'],
  runAt: 'document_start',
  main() {
    const { pathname, search, hash } = window.location;
    const target = redirectTarget(pathname, search, hash);
    if (!target) {
      return;
    }
    // Arrived here from old.reddit.com: Reddit sent the user over on purpose.
    if (document.referrer.startsWith('https://old.reddit.com/')) {
      return;
    }
    if (bouncedBack(target)) {
      return;
    }
    window.location.replace(target);
  },
});
