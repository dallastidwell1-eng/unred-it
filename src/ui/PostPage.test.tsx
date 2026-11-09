// @vitest-environment happy-dom
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CommentNode, ThreadItem } from '../lib/comments';
import type { Post } from '../lib/reddit-data';
import type { CommentFocus } from '../lib/thread-loader';
import { PostPage, type PostPageStart } from './PostPage';

function makePost(partial: Partial<Post> = {}): Post {
  return {
    fullname: 't3_p',
    id: 'p',
    title: 'A post',
    subreddit: 'books',
    author: 'someone',
    score: 1,
    numComments: 2,
    permalink: '/r/books/comments/p/a_post/',
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
    video: null,
    gallery: null,
    ...partial,
  };
}

const post = makePost({ isSelf: true, url: '', domain: 'self.books', postHint: 'self' });

function comment(id: string): CommentNode {
  return {
    kind: 'comment',
    fullname: `t1_${id}`,
    id,
    author: `author_${id}`,
    bodyHtml: `<p>Comment ${id}</p>`,
    score: 1,
    scoreHidden: false,
    likes: null,
    createdUtc: 0,
    depth: 0,
    isSubmitter: false,
    distinguished: '',
    stickied: false,
    collapsed: false,
    permalink: '#',
    replies: [],
  };
}

let box: HTMLDivElement | null = null;

const settle = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

/** Draws the post page with two sample comments. */
function show(p: Post, options: { start?: PostPageStart; onClose?: () => void } = {}) {
  const onClose = options.onClose ?? vi.fn();
  const element = document.createElement('div');
  box = element;
  document.body.append(element);
  void act(() => {
    render(
      <PostPage
        post={p}
        now={0}
        active
        source={{
          loadThread: () => Promise.resolve([comment('c1'), comment('c2')]),
          loadMore: vi.fn(),
        }}
        onClose={onClose}
        start={options.start}
      />,
      element,
    );
  });
  return { box: element, onClose };
}

afterEach(() => {
  if (box) {
    render(null, box);
    box.remove();
    box = null;
  }
});

describe('PostPage: one page, content on top, comments underneath (D-062)', () => {
  it('is a labelled dialog and takes focus', () => {
    const { box } = show(makePost());
    const dialog = box.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(box.querySelector('#comments-title')?.textContent).toBe('A post');
    expect(document.activeElement).toBe(dialog);
  });

  it('shows the content, then the vote bar, then the sort bar and comments, in one scroll', async () => {
    const { box } = show(makePost());
    await act(settle);
    const scroll = box.querySelector('.comments-scroll');
    const order = Array.from(
      scroll?.querySelectorAll('.link-card, .vote-group, .sort-bar, .comment') ?? [],
    ).map((element) => element.classList[0]);
    expect(order).toEqual(['link-card', 'vote-group', 'sort-bar', 'comment', 'comment']);
  });

  it('has one way back: the Feed button', () => {
    const { box } = show(makePost());
    expect(box.querySelector('.back')?.textContent).toBe('Feed');
  });

  it('closes on Esc and the Feed button', () => {
    const { box, onClose } = show(makePost());
    void act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    box.querySelector<HTMLButtonElement>('.back')?.click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('shows a text post cleaned, without scripts or handlers', () => {
    const { box } = show(
      makePost({
        isSelf: true,
        selftextHtml: '<div class="md"><p onclick="x()">Hi</p><script>bad()</script></div>',
      }),
    );
    expect(box.querySelector('.post-text')?.innerHTML).toBe('<p>Hi</p>');
  });

  it('links an outside article in a new tab', () => {
    const { box } = show(makePost());
    const button = box.querySelector<HTMLAnchorElement>('.open-button');
    expect(button?.getAttribute('href')).toBe('https://example.com/story');
    expect(button?.target).toBe('_blank');
    expect(button?.rel).toContain('noopener');
  });

  it('never links a javascript: address', () => {
    const { box } = show(makePost({ url: 'javascript:alert(1)' }));
    expect(box.querySelector('.open-button')).toBeNull();
  });
});

describe('PostPage gallery', () => {
  const pic = (n: number, height = 100) => ({
    url: `https://i.redd.it/${String(n)}.jpg`,
    width: 100,
    height,
    caption: n === 2 ? 'Second' : '',
    isVideo: false,
  });

  it('shows one picture at a time with working buttons and a counter', () => {
    const { box } = show(makePost({ isGallery: true, gallery: [pic(1), pic(2, 300), pic(3)] }));
    const count = () => box.querySelector('.gallery-count')?.textContent;
    const src = () => box.querySelector('.gallery-frame img')?.getAttribute('src');
    const [previous, next] = Array.from(box.querySelectorAll<HTMLButtonElement>('.gallery-button'));
    expect(count()).toBe('1 / 3');
    expect(previous?.disabled).toBe(true);
    void act(() => {
      next?.click();
    });
    expect(count()).toBe('2 / 3');
    expect(src()).toBe('https://i.redd.it/2.jpg');
    expect(box.querySelector('.gallery-caption')?.textContent).toBe('Second');
    void act(() => {
      next?.click();
    });
    expect(next?.disabled).toBe(true);
    // The frame keeps the tallest picture's shape (100 x 300).
    expect(box.querySelector<HTMLElement>('.gallery-frame')?.style.aspectRatio).toBe('100 / 300');
  });
});

describe('PostPage opened from a comment link (D-027)', () => {
  it("shows that comment's thread first, then all comments on request", async () => {
    const loadThread = vi.fn(
      (_post: Post, _sort: string, focus?: CommentFocus): Promise<ThreadItem[]> =>
        Promise.resolve(focus ? [comment('c2')] : [comment('c1'), comment('c2')]),
    );
    const element = document.createElement('div');
    box = element;
    document.body.append(element);
    await act(async () => {
      render(
        <PostPage
          post={post}
          now={0}
          active
          source={{ loadThread, loadMore: vi.fn() }}
          onClose={vi.fn()}
          focus={{ commentId: 'c2', context: 2 }}
        />,
        element,
      );
      await settle();
    });
    await act(settle); // the comments arrive after the first render
    expect(loadThread).toHaveBeenLastCalledWith(post, 'confidence', {
      commentId: 'c2',
      context: 2,
    });
    expect(element.querySelector('.focus-note')?.textContent).toContain('one comment');
    expect(element.querySelector('.comment-text.focused')).not.toBeNull();

    await act(async () => {
      element.querySelector<HTMLButtonElement>('.focus-all')?.click();
      await settle();
    });
    await act(settle);
    expect(loadThread).toHaveBeenLastCalledWith(post, 'confidence', undefined);
    expect(element.querySelector('.focus-note')).toBeNull();
    expect(element.querySelectorAll('.comment')).toHaveLength(2);
    expect(element.querySelector('.comment-text.focused')).toBeNull();
  });
});
