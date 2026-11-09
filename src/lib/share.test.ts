import { describe, expect, it, vi } from 'vitest';
import { shareLink, shareUrl } from './share';

describe('shareUrl', () => {
  it('gives the normal Reddit address', () => {
    expect(shareUrl('/r/books/comments/abc/dune/')).toBe(
      'https://www.reddit.com/r/books/comments/abc/dune/',
    );
    expect(shareUrl('r/books/comments/abc/dune/')).toBe(
      'https://www.reddit.com/r/books/comments/abc/dune/',
    );
  });
});

describe('shareLink', () => {
  const url = 'https://www.reddit.com/r/books/comments/abc/dune/';

  it('uses the share menu when there is one', async () => {
    const share = vi.fn(() => Promise.resolve());
    const copy = vi.fn(() => Promise.resolve());
    expect(await shareLink('Dune', url, { share, copy })).toBe('shared');
    expect(share).toHaveBeenCalledWith({ title: 'Dune', url });
    expect(copy).not.toHaveBeenCalled();
  });

  it('does nothing more when the user closes the menu', async () => {
    const closed = Object.assign(new Error('closed'), { name: 'AbortError' });
    const copy = vi.fn(() => Promise.resolve());
    expect(await shareLink('Dune', url, { share: () => Promise.reject(closed), copy })).toBe(
      'cancelled',
    );
    expect(copy).not.toHaveBeenCalled();
  });

  it("knows a closed menu even when the error is not the extension's own Error", async () => {
    // In Firefox the page's DOMException fails instanceof Error in a content script.
    const closed = { name: 'AbortError', message: 'closed' };
    const copy = vi.fn(() => Promise.resolve());
    expect(
      await shareLink('Dune', url, {
        share: () => Promise.reject(closed as unknown as Error),
        copy,
      }),
    ).toBe('cancelled');
    expect(copy).not.toHaveBeenCalled();
  });

  it('copies the link when there is no share menu, or it fails', async () => {
    const copy = vi.fn(() => Promise.resolve());
    expect(await shareLink('Dune', url, { copy })).toBe('copied');
    expect(
      await shareLink('Dune', url, { share: () => Promise.reject(new Error('no')), copy }),
    ).toBe('copied');
    expect(copy).toHaveBeenCalledWith(url);
  });

  it('reports a failure when nothing works', async () => {
    expect(await shareLink('Dune', url, { copy: () => Promise.reject(new Error('no')) })).toBe(
      'failed',
    );
    expect(await shareLink('Dune', url, {})).toBe('failed');
  });
});
