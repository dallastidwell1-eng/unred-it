// The extension's options page (D-064): the same settings as the reader's
// Settings view, in a page of its own, opened from Firefox's add-on settings.
// Works with no Reddit page open. Changes save at once and every open reader
// tab follows them.

import { render } from 'preact';
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import type { Settings, SettingsStore } from '../lib/settings';
import { FONT_FILES } from './fonts-list';
import readerCss from './reader.css?inline';
import { SettingsPanel } from './SettingsPage';
import { fonts, themeCss } from './tokens';

function OptionsPage({
  initial,
  store,
  version,
}: {
  initial: Settings;
  store: SettingsStore;
  version?: string;
}) {
  const [settings, setSettings] = useState(initial);

  useEffect(
    () =>
      store.watch((changes) => {
        setSettings((current) => ({ ...current, ...changes }));
      }),
    [store],
  );

  // The chosen theme (D-024); "device" follows the browser.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'device') {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = settings.theme;
    }
  }, [settings.theme]);

  return (
    <main class="settings-column options-page">
      <h1 class="settings-title">Unred It settings</h1>
      <SettingsPanel
        settings={settings}
        version={version}
        onChange={(changes) => {
          setSettings((current) => ({ ...current, ...changes }));
          store.save(changes).catch(() => undefined);
        }}
      />
    </main>
  );
}

/** The page's styles: theme colors on <html>, the bundled fonts, the reader's styles. */
function pageCss(fontUrl?: (path: string) => string): string {
  // The developer preview loads the fonts its own way and passes no fontUrl.
  const faces = (fontUrl ? FONT_FILES : []).map(
    (file) =>
      `@font-face { font-family: "${file.family}"; src: url("${fontUrl?.(file.path) ?? ''}") format("woff2"); font-weight: 100 900; font-style: normal; font-display: swap; unicode-range: ${file.unicodeRange}; }`,
  );
  return [
    ...faces,
    themeCss(':root'),
    `:root { --font-ui: ${fonts.ui}; --font-wordmark: ${fonts.wordmark}; }`,
    `html, body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font-ui); font-size: 16px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }`,
    readerCss,
    `.options-page { padding-top: 28px; }`,
  ].join('\n');
}

export function mountOptions(
  parent: HTMLElement,
  settings: Settings,
  store: SettingsStore,
  options: { version?: string; fontUrl?: (path: string) => string },
): void {
  const style = document.createElement('style');
  style.textContent = pageCss(options.fontUrl);
  document.head.append(style);
  render(<OptionsPage initial={settings} store={store} version={options.version} />, parent);
}
