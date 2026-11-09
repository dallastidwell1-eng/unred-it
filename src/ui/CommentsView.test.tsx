// @vitest-environment happy-dom
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CommentNode, ThreadItem } from '../lib/comments';
import type { Post } from '../lib/reddit-data';
import type { CommentFocus } from '../lib/thread-loader';
import { CommentsView } from './CommentsView';

const post = {
  fullname: 't3_p',
  id: 'p',
  title: 'A post',
  subreddit: 'books',
  author: 'someone',
  score: 1,
  numComments: 2,
  permalink: '/r/books/comments/p/a_post/',
  url: '',
  likes: null,
  createdUtc: 0,
  isSelf: true,
  domain: 'self.books',
  over18: false,
  stickied: false,
  thumbnailUrl: null,
  selftextHtml: null,
  postHint: 'self',
  previewImage: null,
  isVideo: false,
  isGallery: false,
  video: null,
  gallery: null,
} satisfies Post;

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

afterEach(() => {
  if (box) {
    render(null, box);
    box.remove();
    box = null;
  }
});

describe('CommentsView opened from a comment link (D-027)', () => {
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
        <CommentsView
          post={post}
          now={0}
          backLabel="Feed"
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
