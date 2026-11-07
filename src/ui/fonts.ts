// Loads the bundled Inter fonts (D-051) into the page's font set, so the
// reader's shadow root can use them. The files ship inside the extension
// (copied by the build:publicAssets hook in wxt.config.ts); nothing is fetched
// from the web. If loading fails, the system-font fallback stays in place.

import { browser } from 'wxt/browser';

interface FontFile {
  family: string;
  path: string;
  unicodeRange: string;
}

// Unicode ranges as published by Fontsource for these subsets.
const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

export const FONT_FILES: FontFile[] = [
  { family: 'Inter', path: '/fonts/inter-latin.woff2', unicodeRange: LATIN },
  { family: 'Inter', path: '/fonts/inter-latin-ext.woff2', unicodeRange: LATIN_EXT },
  { family: 'Inter Tight', path: '/fonts/inter-tight-latin.woff2', unicodeRange: LATIN },
];

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
