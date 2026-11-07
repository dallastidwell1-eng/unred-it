// @vitest-environment happy-dom
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenPageContext, SubredditLink } from './SubredditLink';

let box: HTMLDivElement | null = null;

afterEach(() => {
  if (box) {
    render(null, box);
    box.remove();
    box = null;
  }
});

describe('SubredditLink', () => {
  it('is a real link that opens the subreddit in the reader on a plain click', () => {
    const openPage = vi.fn();
    const outer = vi.fn();
    const element = document.createElement('div');
    box = element;
    document.body.append(element);
    void act(() => {
      render(
        <OpenPageContext.Provider value={openPage}>
          <div onClick={outer}>
            <SubredditLink name="AskHistorians" />
          </div>
        </OpenPageContext.Provider>,
        element,
      );
    });
    const link = element.querySelector<HTMLAnchorElement>('a.sub-link');
    expect(link?.textContent).toBe('r/AskHistorians');
    expect(link?.getAttribute('href')).toBe('/r/AskHistorians/');

    link?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
    );
    expect(openPage).not.toHaveBeenCalled(); // Ctrl+click: the browser opens a new tab

    link?.click();
    expect(openPage).toHaveBeenCalledWith('/r/AskHistorians/');
    expect(outer).toHaveBeenCalledTimes(1); // only the Ctrl+click reached the row
  });
});
