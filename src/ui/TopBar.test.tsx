// @vitest-environment happy-dom
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SearchInfo } from '../lib/feed-route';
import type { Account } from '../lib/reddit-client';
import type { FeedView } from '../lib/view-setting';
import { TopBar } from './TopBar';

let box: HTMLDivElement | null = null;

function show(
  options: {
    search?: SearchInfo | null;
    searchIn?: string | null;
    account?: Account | null;
    pinned?: boolean;
    view?: FeedView;
    onViewToggle?: () => void;
  } = {},
) {
  const onSearch = vi.fn();
  const element = document.createElement('div');
  box = element;
  document.body.append(element);
  void act(() => {
    render(
      <TopBar
        title="r/books"
        pickerOpen={false}
        onPickerClick={vi.fn()}
        search={options.search ?? null}
        searchIn={options.searchIn ?? null}
        onSearch={onSearch}
        account={options.account === undefined ? { name: 'reader', unread: 0 } : options.account}
        pinned={options.pinned ?? false}
        view={options.view}
        onViewToggle={options.onViewToggle}
      />,
      element,
    );
  });
  return { box: element, onSearch };
}

function typeAndSubmit(element: HTMLElement, text: string) {
  const input = element.querySelector<HTMLInputElement>('#search-input');
  void act(() => {
    if (input) {
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  element.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
}

function scrollTo(y: number) {
  void act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
    window.dispatchEvent(new Event('scroll'));
  });
}

afterEach(() => {
  if (box) {
    render(null, box);
    box.remove();
    box = null;
  }
  scrollTo(0);
});

describe('TopBar search (D-058)', () => {
  it('searches the subreddit on screen', () => {
    const { box, onSearch } = show({ searchIn: 'books' });
    expect(box.querySelector<HTMLInputElement>('#search-input')?.placeholder).toBe(
      'Search r/books',
    );
    typeAndSubmit(box, ' dune ');
    expect(onSearch).toHaveBeenCalledWith('/r/books/search?q=dune&restrict_sr=on');
  });

  it('searches all of Reddit when no subreddit is on screen, and ignores an empty search', () => {
    const { box, onSearch } = show();
    typeAndSubmit(box, '   ');
    expect(onSearch).not.toHaveBeenCalled();
    typeAndSubmit(box, 'cast iron');
    expect(onSearch).toHaveBeenCalledWith('/search?q=cast+iron');
  });

  it('shows the words of the search on a results page', () => {
    const { box } = show({ search: { query: 'dune', subreddit: 'books' }, searchIn: 'books' });
    expect(box.querySelector<HTMLInputElement>('#search-input')?.value).toBe('dune');
  });

  it('opens the phone search field from its button, "/" and closes it on Esc and Cancel', () => {
    const { box } = show();
    const bar = () => box.querySelector('.topbar')?.className;
    void act(() => {
      box.querySelector<HTMLButtonElement>('.search-open')?.click();
    });
    expect(bar()).toContain('searching');
    void act(() => {
      box
        .querySelector('#search-input')
        ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(bar()).not.toContain('searching');
    void act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', cancelable: true }));
    });
    expect(bar()).toContain('searching');
    void act(() => {
      box.querySelector<HTMLButtonElement>('.search-cancel')?.click();
    });
    expect(bar()).not.toContain('searching');
  });

  it('leaves "/" alone while a view is open', () => {
    const { box } = show({ pinned: true });
    const event = new KeyboardEvent('keydown', { key: '/', cancelable: true });
    void act(() => {
      window.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(false);
    expect(box.querySelector('.topbar')?.className).not.toContain('searching');
  });

  it('lets "/" type a slash inside a text field', () => {
    const { box } = show();
    const field = document.createElement('textarea');
    box.append(field);
    const event = new KeyboardEvent('keydown', { key: '/', cancelable: true, bubbles: true });
    void act(() => {
      field.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(false);
    expect(box.querySelector('.topbar')?.className).not.toContain('searching');
  });
});

describe('TopBar account button (D-029, D-059)', () => {
  it('links to the profile and shows the unread dot with a count in its name', () => {
    const { box } = show({ account: { name: 'reader', unread: 3 } });
    const link = box.querySelector<HTMLAnchorElement>('.account');
    expect(link?.getAttribute('href')).toBe('/user/reader/');
    expect(link?.getAttribute('aria-label')).toBe('Your profile, u/reader, 3 unread');
    expect(link?.textContent).toBe('R');
    expect(box.querySelector('.unread-dot')).not.toBeNull();
  });

  it('shows no dot when nothing is unread', () => {
    const { box } = show({ account: { name: 'reader', unread: 0 } });
    expect(box.querySelector('.unread-dot')).toBeNull();
    expect(box.querySelector('.account')?.getAttribute('aria-label')).toBe(
      'Your profile, u/reader',
    );
  });

  it('offers Log in when logged out', () => {
    const { box } = show({ account: null });
    const link = box.querySelector<HTMLAnchorElement>('.account.signin');
    expect(link?.textContent).toBe('Log in');
    expect(link?.getAttribute('href')).toBe('/login');
  });
});

describe('TopBar hiding (5.1)', () => {
  it('hides on scrolling down past the top, and returns on scrolling up', () => {
    const { box } = show();
    const hidden = () => box.querySelector('.topbar')?.classList.contains('hidden');
    scrollTo(60);
    expect(hidden()).toBe(false); // still near the top
    scrollTo(400);
    expect(hidden()).toBe(true);
    scrollTo(402);
    expect(hidden()).toBe(true); // a tiny move changes nothing
    scrollTo(300);
    expect(hidden()).toBe(false);
  });

  it('stays visible while a view is open over the feed', () => {
    const { box } = show({ pinned: true });
    scrollTo(500);
    expect(box.querySelector('.topbar')?.classList.contains('hidden')).toBe(false);
  });
});

describe('TopBar view button (D-061)', () => {
  it('is not shown without a way to save the view', () => {
    const { box } = show();
    expect(box.querySelector('.view-toggle')).toBeNull();
  });

  it('names the view it switches to, and switches on click', () => {
    const onViewToggle = vi.fn();
    const { box } = show({ view: 'compact', onViewToggle });
    const button = box.querySelector<HTMLButtonElement>('.view-toggle');
    expect(button?.getAttribute('aria-label')).toBe('Switch to card view');
    button?.click();
    expect(onViewToggle).toHaveBeenCalledTimes(1);
  });

  it('offers compact while cards are shown', () => {
    const { box } = show({ view: 'card', onViewToggle: vi.fn() });
    expect(box.querySelector('.view-toggle')?.getAttribute('aria-label')).toBe(
      'Switch to compact view',
    );
  });
});
