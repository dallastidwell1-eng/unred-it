import { describe, expect, it } from 'vitest';
import { isOldRedditPage } from './marker';

describe('isOldRedditPage', () => {
  it('accepts old.reddit.com pages', () => {
    expect(isOldRedditPage('https://old.reddit.com/')).toBe(true);
    expect(isOldRedditPage('https://old.reddit.com/r/firefox/comments/abc/x/')).toBe(true);
  });

  it('rejects other hosts and plain http', () => {
    expect(isOldRedditPage('https://www.reddit.com/')).toBe(false);
    expect(isOldRedditPage('https://old.reddit.com.evil.example/')).toBe(false);
    expect(isOldRedditPage('http://old.reddit.com/')).toBe(false);
  });

  it('rejects text that is not a URL', () => {
    expect(isOldRedditPage('not a url')).toBe(false);
  });
});
