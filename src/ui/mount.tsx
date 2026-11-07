// Puts the reader on the page inside a closed shadow root, so Reddit's own
// CSS cannot reach it and its CSS cannot reach Reddit.

import { render } from 'preact';
import { fonts, themeCss } from './tokens';
import { App, type FeedSource } from './App';
import readerCss from './reader.css?inline';

export const READER_TAG = 'unred-it-reader';

export function mountReader(
  parent: HTMLElement,
  source: FeedSource,
  note?: string,
  /** 'open' only in the developer preview, so its layout can be inspected. */
  shadowMode: ShadowRootMode = 'closed',
): HTMLElement {
  const host = document.createElement(READER_TAG);
  const shadow = host.attachShadow({ mode: shadowMode });
  const style = document.createElement('style');
  style.textContent = [
    themeCss(':host'),
    `:host { --font-ui: ${fonts.ui}; --font-wordmark: ${fonts.wordmark}; }`,
    readerCss,
  ].join('\n');
  const root = document.createElement('div');
  shadow.append(style, root);
  parent.append(host);
  render(<App source={source} note={note} />, root);
  return host;
}
