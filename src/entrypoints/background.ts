// The add-on's background script. Its one job (D-069): when Firefox loads
// Reddit's web app manifest, change its two colors from white to the
// reader's background, so a home-screen shortcut on Firefox for Android has
// dark (or light) bars instead of white ones. Nothing else in the file, and
// no other request, is read or changed.

import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { DEFAULT_SETTINGS, storageSettingsStore, type ThemeChoice } from '../lib/settings';
import { MANIFEST_URLS, recolorManifest } from '../lib/web-manifest';
import { themes } from '../ui/tokens';

/** Firefox's response filter (webRequest.filterResponseData); not in the shared browser types. */
interface StreamFilter {
  ondata: ((event: { data: ArrayBuffer }) => void) | null;
  onstop: (() => void) | null;
  onerror: (() => void) | null;
  write(data: ArrayBuffer | Uint8Array): void;
  close(): void;
}

interface FirefoxWebRequest {
  filterResponseData(requestId: string): StreamFilter;
}

/** The reader's background for the theme chosen in Settings; "device": the device's mode now. */
function colorFor(theme: ThemeChoice): string {
  if (theme === 'light' || theme === 'dark') {
    return themes[theme].bg;
  }
  return globalThis.matchMedia('(prefers-color-scheme: light)').matches
    ? themes.light.bg
    : themes.dark.bg;
}

function joined(chunks: ArrayBuffer[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(new Uint8Array(chunk), at);
    at += chunk.byteLength;
  }
  return bytes;
}

export default defineBackground(() => {
  const settings = storageSettingsStore(browser.storage.sync);
  const webRequest = browser.webRequest as unknown as FirefoxWebRequest;

  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      const filter = webRequest.filterResponseData(details.requestId);
      const chunks: ArrayBuffer[] = [];
      filter.ondata = (event) => {
        chunks.push(event.data);
      };
      filter.onstop = () => {
        const original = joined(chunks);
        void settings
          .load()
          .catch(() => DEFAULT_SETTINGS)
          .then((current) => {
            const text = new TextDecoder().decode(original);
            filter.write(new TextEncoder().encode(recolorManifest(text, colorFor(current.theme))));
          })
          .catch(() => {
            // Anything unexpected: Reddit's file goes through unchanged.
            filter.write(original);
          })
          .finally(() => {
            filter.close();
          });
      };
      return {};
    },
    { urls: MANIFEST_URLS },
    ['blocking'],
  );
});
