// The page's theme-color tag, so a browser that colors its own bars from it
// (for example a page opened from a phone's home screen) matches the reader's
// background instead of white (owner's phone test, session 005). Follows the
// theme chosen in Settings (D-024): "device" gives one tag per color scheme.

import type { ThemeChoice } from '../lib/settings';
import { themes } from './tokens';

/** Marks the tags this file added, so they can be replaced. */
const OURS = 'data-unred-theme-color';

export function setThemeColor(doc: Document, theme: ThemeChoice): void {
  const head = doc.head as HTMLHeadElement | null;
  if (!head) {
    return;
  }
  // Ours replace any the page had: only one color can apply.
  head.querySelectorAll('meta[name="theme-color"]').forEach((tag) => {
    tag.remove();
  });
  const add = (color: string, media?: string) => {
    const tag = doc.createElement('meta');
    tag.setAttribute('name', 'theme-color');
    tag.setAttribute('content', color);
    if (media) {
      tag.setAttribute('media', media);
    }
    tag.setAttribute(OURS, '');
    head.append(tag);
  };
  if (theme === 'device') {
    add(themes.light.bg, '(prefers-color-scheme: light)');
    add(themes.dark.bg, '(prefers-color-scheme: dark)');
  } else {
    add(themes[theme].bg);
  }
}
