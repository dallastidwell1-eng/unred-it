// Sharing a post (D-063): the normal Reddit address, through the device's
// share menu where there is one, otherwise copied to the clipboard.

/** The address anyone can open: https://www.reddit.com plus the post's path. */
export function shareUrl(permalink: string): string {
  const path = permalink.startsWith('/') ? permalink : `/${permalink}`;
  return `https://www.reddit.com${path}`;
}

/** What happened, for the short note under the buttons. */
export type ShareResult = 'shared' | 'cancelled' | 'copied' | 'failed';

/** The browser features sharing uses (passed in so tests can supply them). */
export interface ShareTools {
  share?: (data: ShareData) => Promise<void>;
  copy?: (text: string) => Promise<void>;
}

/**
 * Opens the share menu if the device has one; if not, or if it fails for
 * any reason other than the user closing it, copies the link.
 */
export async function shareLink(
  title: string,
  url: string,
  tools: ShareTools,
): Promise<ShareResult> {
  if (tools.share) {
    try {
      await tools.share({ title, url });
      return 'shared';
    } catch (cause) {
      // The page's DOMException is not an Error of the extension's own world
      // in Firefox, so the name is checked, not instanceof.
      const name = typeof cause === 'object' && cause !== null && 'name' in cause ? cause.name : '';
      if (name === 'AbortError') {
        return 'cancelled';
      }
    }
  }
  if (tools.copy) {
    try {
      await tools.copy(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
  return 'failed';
}

/** The tools this browser has. Firefox desktop has no share menu. */
export function browserShareTools(): ShareTools {
  const tools: ShareTools = {};
  if ('share' in navigator) {
    tools.share = (data) => navigator.share(data);
  }
  if ('clipboard' in navigator) {
    tools.copy = (text) => navigator.clipboard.writeText(text);
  }
  return tools;
}
