import { describe, expect, it } from 'vitest';
import { postRoute, redirectTarget, toReaderUrl } from './reddit-links';

describe('postRoute', () => {
  it('reads a post address with or without a subreddit and slug', () => {
    expect(postRoute('/r/AskHistorians/comments/Abc123/pirate_ships/')).toEqual({
      postId: 'abc123',
      subreddit: 'AskHistorians',
      commentId: null,
      context: 0,
    });
    expect(postRoute('/comments/abc123')).toEqual({
      postId: 'abc123',
      subreddit: null,
      commentId: null,
      context: 0,
    });
  });

  it('reads a comment link and its context', () => {
    expect(postRoute('/r/books/comments/abc123/dune/xyz789/', '?context=3')).toEqual({
      postId: 'abc123',
      subreddit: 'books',
      commentId: 'xyz789',
      context: 3,
    });
    expect(postRoute('/r/books/comments/abc123/_/xyz789', '?context=99')?.context).toBe(8);
    expect(postRoute('/r/books/comments/abc123/dune/', '?context=3')?.context).toBe(0);
  });

  it('is null for other pages', () => {
    expect(postRoute('/')).toBeNull();
    expect(postRoute('/r/books/')).toBeNull();
    expect(postRoute('/r/books/comments/')).toBeNull();
    expect(postRoute('/r/books/comments/abc/slug/c1/extra/')).toBeNull();
    expect(postRoute('/user/someone/comments/')).toBeNull();
    expect(postRoute('/r/books/comments/<bad>/')).toBeNull();
  });
});

describe('toReaderUrl', () => {
  it('sends every Reddit page host to old.reddit.com, keeping path, query and hash', () => {
    expect(toReaderUrl('https://www.reddit.com/r/books/comments/abc/dune/?sort=top#c')).toBe(
      'https://old.reddit.com/r/books/comments/abc/dune/?sort=top#c',
    );
    expect(toReaderUrl('https://new.reddit.com/r/books/')).toBe('https://old.reddit.com/r/books/');
    expect(toReaderUrl('http://reddit.com/r/books')).toBe('https://old.reddit.com/r/books');
    expect(toReaderUrl('https://np.reddit.com/r/x/')).toBe('https://old.reddit.com/r/x/');
    expect(toReaderUrl('https://old.reddit.com/r/x/')).toBe('https://old.reddit.com/r/x/');
    expect(toReaderUrl('/r/x/wiki')).toBe('https://old.reddit.com/r/x/wiki');
  });

  it('opens redd.it short links as the post', () => {
    expect(toReaderUrl('https://redd.it/AbC123')).toBe('https://old.reddit.com/comments/abc123/');
  });

  it('leaves pictures, videos, other services and other sites alone', () => {
    expect(toReaderUrl('https://i.redd.it/pic.jpg')).toBeNull();
    expect(toReaderUrl('https://v.redd.it/abc')).toBeNull();
    expect(toReaderUrl('https://preview.reddit.com/x.png')).toBeNull();
    expect(toReaderUrl('https://chat.reddit.com/')).toBeNull();
    expect(toReaderUrl('https://example.com/reddit.com')).toBeNull();
    expect(toReaderUrl('https://notreddit.com/')).toBeNull();
    expect(toReaderUrl('javascript:alert(1)')).toBeNull();
  });
});

describe('redirectTarget', () => {
  it('sends www.reddit.com pages to old.reddit.com', () => {
    expect(redirectTarget('/r/books/comments/abc/dune/', '?context=3', '')).toBe(
      'https://old.reddit.com/r/books/comments/abc/dune/?context=3',
    );
    expect(redirectTarget('/', '', '')).toBe('https://old.reddit.com/');
  });

  it('keeps pages old.reddit.com does not have, share links and ?unred=off', () => {
    expect(redirectTarget('/media', '?url=x', '')).toBeNull();
    expect(redirectTarget('/settings/account', '', '')).toBeNull();
    expect(redirectTarget('/login/', '', '')).toBeNull();
    expect(redirectTarget('/chat', '', '')).toBeNull();
    expect(redirectTarget('/r/books/s/AbCdEf', '', '')).toBeNull();
    expect(redirectTarget('/r/books/', '?unred=off', '')).toBeNull();
  });
});
