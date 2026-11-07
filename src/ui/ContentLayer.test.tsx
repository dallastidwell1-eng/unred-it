// @vitest-environment happy-dom
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Post } from '../lib/reddit-data';
import { ContentLayer } from './ContentLayer';

function post(partial: Partial<Post>): Post {
  return {
    fullname: 't3_a',
    id: 'a',
    title: 'A title',
    subreddit: 'test',
    author: 'someone',
    score: 10,
    numComments: 2,
    permalink: '/r/test/comments/a/a_title/',
    url: 'https://example.com/story',
    likes: null,
    createdUtc: 0,
    isSelf: false,
    domain: 'example.com',
    over18: false,
    stickied: false,
    thumbnailUrl: null,
    selftextHtml: null,
    postHint: 'link',
    previewImage: null,
    isVideo: false,
    isGallery: false,
    ...partial,
  };
}

let box: HTMLDivElement | null = null;

function show(p: Post, onClose = vi.fn()) {
  box = document.createElement('div');
  document.body.append(box);
  void act(() => {
    render(<ContentLayer post={p} now={0} onClose={onClose} />, box as HTMLDivElement);
  });
  return { box, onClose };
}

afterEach(() => {
  if (box) {
    render(null, box);
    box.remove();
    box = null;
  }
});

describe('ContentLayer', () => {
  it('is a labelled dialog and takes focus', () => {
    const { box } = show(post({}));
    const dialog = box.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(box.querySelector('#layer-title')?.textContent).toBe('A title');
    expect(document.activeElement).toBe(dialog);
  });

  it('shows a text post cleaned, without scripts or handlers', () => {
    const { box } = show(
      post({
        isSelf: true,
        selftextHtml: '<div class="md"><p onclick="x()">Hi</p><script>bad()</script></div>',
      }),
    );
    const text = box.querySelector('.post-text');
    expect(text?.innerHTML).toBe('<p>Hi</p>');
  });

  it('links an outside article in a new tab', () => {
    const { box } = show(post({}));
    const button = box.querySelector<HTMLAnchorElement>('.open-button');
    expect(button?.getAttribute('href')).toBe('https://example.com/story');
    expect(button?.target).toBe('_blank');
    expect(button?.rel).toContain('noopener');
  });

  it('never links a javascript: address', () => {
    const { box } = show(post({ url: 'javascript:alert(1)' }));
    expect(box.querySelector('.open-button')).toBeNull();
  });

  it('closes on Esc, the Feed button and the scrim', () => {
    const { box, onClose } = show(post({}));
    void act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    box.querySelector<HTMLButtonElement>('.back')?.click();
    box.querySelector<HTMLDivElement>('.scrim')?.click();
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
