// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { setThemeColor } from './theme-color';
import { themes } from './tokens';

function tags() {
  return Array.from(
    document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
  ).map((tag) => [tag.content, tag.getAttribute('media') ?? '']);
}

describe('setThemeColor', () => {
  it('gives one color per scheme when the theme follows the device', () => {
    setThemeColor(document, 'device');
    expect(tags()).toEqual([
      [themes.light.bg, '(prefers-color-scheme: light)'],
      [themes.dark.bg, '(prefers-color-scheme: dark)'],
    ]);
  });

  it('gives the chosen theme only, replacing earlier tags and the page own', () => {
    const page = document.createElement('meta');
    page.name = 'theme-color';
    page.content = '#ffffff';
    document.head.append(page);
    setThemeColor(document, 'dark');
    expect(tags()).toEqual([[themes.dark.bg, '']]);
    setThemeColor(document, 'light');
    expect(tags()).toEqual([[themes.light.bg, '']]);
  });
});
