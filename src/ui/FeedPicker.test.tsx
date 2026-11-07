// @vitest-environment happy-dom
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FixedFeed, Subreddit } from '../lib/subreddits';
import { FeedPicker } from './FeedPicker';

const SUBS: Subreddit[] = ['AskHistorians', 'astrophotography', 'books', 'Cooking'].map((name) => ({
  name,
  over18: false,
}));

let box: HTMLDivElement | null = null;

/** Lets pending promises (the pretend Reddit answer) settle. */
const settle = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

async function show(
  options: {
    current?: FixedFeed | { name: string };
    load?: () => Promise<Subreddit[]>;
  } = {},
) {
  const onChoose = vi.fn();
  const onClose = vi.fn();
  const element = document.createElement('div');
  box = element;
  document.body.append(element);
  await act(async () => {
    render(
      <FeedPicker
        current={options.current ?? 'home'}
        loadSubreddits={options.load ?? (() => Promise.resolve(SUBS))}
        onChoose={onChoose}
        onClose={onClose}
      />,
      element,
    );
    await settle();
  });
  return { box: element, onChoose, onClose };
}

async function type(element: HTMLElement, text: string) {
  const input = element.querySelector<HTMLInputElement>('#feed-filter');
  if (!input) {
    throw new Error('no filter field');
  }
  await act(() => {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

const rowNames = (element: HTMLElement) =>
  Array.from(element.querySelectorAll('.sub-row')).map((row) => row.textContent);

afterEach(() => {
  if (box) {
    render(null, box);
    box.remove();
    box = null;
  }
});

describe('FeedPicker', () => {
  it('is a labelled dialog with the filter focused', async () => {
    const { box } = await show();
    const dialog = box.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-label')).toBe('Choose a feed');
    expect(document.activeElement?.id).toBe('feed-filter');
  });

  it('shows the three fixed feeds with the current one marked', async () => {
    const { box } = await show({ current: 'popular' });
    const chips = Array.from(box.querySelectorAll<HTMLAnchorElement>('.chip'));
    expect(chips.map((chip) => [chip.textContent, chip.getAttribute('href')])).toEqual([
      ['Home', '/'],
      ['Popular', '/r/popular/'],
      ['All', '/r/all/'],
    ]);
    expect(chips.map((chip) => chip.getAttribute('aria-current'))).toEqual([null, 'page', null]);
  });

  it('lists the subscriptions and marks the current subreddit', async () => {
    const { box } = await show({ current: { name: 'BOOKS' } });
    expect(rowNames(box)).toEqual([
      'Ar/AskHistorians',
      'Ar/astrophotography',
      'Br/books',
      'Cr/Cooking',
    ]);
    expect(box.querySelector('[aria-current="page"]')?.textContent).toBe('Br/books');
    expect(box.querySelectorAll('.chip[aria-current]')).toHaveLength(0);
  });

  it('filters as you type and offers to go to a typed name', async () => {
    const { box } = await show();
    await type(box, 'as');
    expect(rowNames(box)).toEqual(['Ar/AskHistorians', 'Ar/astrophotography', 'Go to r/as']);
    expect(box.querySelector('.sub-row.default')?.textContent).toBe('Ar/AskHistorians');
    await type(box, 'r/books');
    expect(rowNames(box)).toEqual(['Br/books']);
  });

  it('opens the first row on Enter', async () => {
    const { box, onChoose } = await show();
    await type(box, 'photo');
    box.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(onChoose).toHaveBeenCalledWith('/r/astrophotography/');
    await type(box, 'woodworking');
    box.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(onChoose).toHaveBeenLastCalledWith('/r/woodworking/');
  });

  it('does nothing on Enter with an empty filter', async () => {
    const { box, onChoose } = await show();
    box.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(onChoose).not.toHaveBeenCalled();
  });

  it('opens a feed on a plain click, and leaves Ctrl+click to the browser', async () => {
    const { box, onChoose } = await show();
    const all = box.querySelectorAll<HTMLAnchorElement>('.chip')[2];
    all?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
    expect(onChoose).not.toHaveBeenCalled();
    all?.click();
    expect(onChoose).toHaveBeenCalledWith('/r/all/');
  });

  it('shows an error with a working Try again', async () => {
    const load = vi
      .fn<() => Promise<Subreddit[]>>()
      .mockRejectedValueOnce(new Error('HTTP 403'))
      .mockResolvedValueOnce(SUBS);
    const { box } = await show({ load });
    expect(box.querySelector('.sheet-note')?.textContent).toContain('Could not load');
    await act(async () => {
      box.querySelector<HTMLButtonElement>('.sheet-note button')?.click();
      await settle();
    });
    await act(settle); // the retry starts after the click's render
    expect(load).toHaveBeenCalledTimes(2);
    expect(rowNames(box)).toHaveLength(4);
  });

  it('says so when the user has no subscriptions', async () => {
    const { box } = await show({ load: () => Promise.resolve([]) });
    expect(box.querySelector('.sheet-note')?.textContent).toBe(
      'You have not joined any subreddits yet.',
    );
  });

  it('closes on Esc and on the scrim', async () => {
    const { box, onClose } = await show();
    await act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    box.querySelector<HTMLDivElement>('.picker-scrim')?.click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
