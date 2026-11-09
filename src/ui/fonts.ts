// Loads the bundled Inter fonts (D-051) into the page's font set, so the
// reader's shadow root can use them. The files ship inside the extension
// (copied by the build:publicAssets hook in wxt.config.ts); nothing is fetched
// from the web. If loading fails, the system-font fallback stays in place.

import { browser } from 'wxt/browser';
import { FONT_FILES } from './fonts-list';

/** Returns true when every font loaded. */
export async function loadFonts(): Promise<boolean> {
  const results = await Promise.allSettled(
    FONT_FILES.map(async (file) => {
      // getURL's type only lists files WXT knows about; these come from the hook.
      const url = browser.runtime.getURL(file.path as '/');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${file.path}: HTTP ${String(response.status)}`);
      }
      const face = new FontFace(file.family, await response.arrayBuffer(), {
        weight: '100 900',
        style: 'normal',
        display: 'swap',
        unicodeRange: file.unicodeRange,
      });
      await face.load();
      document.fonts.add(face);
    }),
  );
  const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  for (const failure of failed) {
    console.warn('Unred It: font not loaded', failure.reason);
  }
  return failed.length === 0;
}
