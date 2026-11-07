import { describe, expect, it } from 'vitest';
import { feedJsonPath, feedTitle, isFeedPath, readerTurnedOff } from './feed-route';
import { formatAge, formatCount } from './format';
import { parseFeedPage } from './reddit-data';

describe('isFeedPath', () => {
  it('accepts the front page, its sorts and subreddits', () => {
    for (const path of ['/', '/hot/', '/new', '/top/', '/r/firefox/', '/r/firefox/new/']) {
      expect(isFeedPath(path), path).toBe(true);
    }
  });

  it('rejects posts, users, settings and unknown pages', () => {
    for (const path of [
      '/r/firefox/comments/abc/x/',
      '/user/someone/',
      '/prefs/',
      '/message/inbox/',
      '/r/firefox/wiki/',
      '/r/',
      '/submit',
    ]) {
      expect(isFeedPath(path), path).toBe(false);
    }
  });
});

describe('feedTitle', () => {
  it('names the feed', () => {
    expect(feedTitle('/')).toBe('Home');
    expect(feedTitle('/top/')).toBe('Home');
    expect(feedTitle('/r/firefox/new/')).toBe('r/firefox');
    expect(feedTitle('/r/popular/')).toBe('Popular');
    expect(feedTitle('/r/All/top/')).toBe('All');
  });
});

describe('feedJsonPath', () => {
  it('builds the .json address with plain text and a page size', () => {
    expect(feedJsonPath('/', '', null)).toBe('/.json?raw_json=1&limit=25');
    expect(feedJsonPath('/r/firefox/', '', null)).toBe('/r/firefox/.json?raw_json=1&limit=25');
  });

  it('keeps the time range, drops old paging, adds the cursor', () => {
    expect(feedJsonPath('/top/', '?t=week&count=25&after=t3_old&unred=on', 't3_new')).toBe(
      '/top/.json?t=week&raw_json=1&limit=25&after=t3_new',
    );
  });
});

describe('readerTurnedOff', () => {
  it('reads ?unred=off', () => {
    expect(readerTurnedOff('?unred=off')).toBe(true);
    expect(readerTurnedOff('?t=week')).toBe(false);
  });
});

describe('parseFeedPage', () => {
  const child = (data: Record<string, unknown>) => ({ kind: 't3', data });

  it('reads the cursor and the new post fields', () => {
    const page = parseFeedPage({
      kind: 'Listing',
      data: {
        after: 't3_next',
        children: [
          child({
            name: 't3_a',
            created_utc: 1700000000,
            is_self: true,
            domain: 'self.firefox',
            over_18: false,
            stickied: true,
            thumbnail: 'self',
          }),
          child({ name: 't3_b', thumbnail: 'https://b.thumbs.redditmedia.com/x.jpg' }),
          child({ name: 't3_c', thumbnail: 'nsfw', over_18: true }),
        ],
      },
    });
    expect(page.after).toBe('t3_next');
    expect(page.posts.map((p) => p.thumbnailUrl)).toEqual([
      null,
      'https://b.thumbs.redditmedia.com/x.jpg',
      null,
    ]);
    expect(page.posts[0]).toMatchObject({
      createdUtc: 1700000000,
      isSelf: true,
      domain: 'self.firefox',
      stickied: true,
    });
    expect(page.posts[2]?.over18).toBe(true);
  });

  it('reads the text, hint and a display-size preview image', () => {
    const img = (width: number) => ({
      url: `https://preview.redd.it/a.jpg?width=${String(width)}`,
      width,
      height: width / 2,
    });
    const page = parseFeedPage({
      kind: 'Listing',
      data: {
        children: [
          child({
            name: 't3_a',
            selftext_html: '<p>hi</p>',
            post_hint: 'image',
            preview: {
              images: [{ source: img(3000), resolutions: [img(320), img(640), img(1080)] }],
            },
          }),
          child({ name: 't3_b', preview: { images: [{ source: img(800), resolutions: [] }] } }),
          child({ name: 't3_c', is_video: true, is_gallery: false }),
        ],
      },
    });
    const [a, b, c] = page.posts;
    expect(a?.selftextHtml).toBe('<p>hi</p>');
    expect(a?.postHint).toBe('image');
    expect(a?.previewImage?.width).toBe(1080);
    expect(b?.previewImage?.width).toBe(800);
    expect(c?.previewImage).toBeNull();
    expect(c?.selftextHtml).toBeNull();
    expect(c?.isVideo).toBe(true);
  });

  it('returns a null cursor at the end of the feed', () => {
    expect(parseFeedPage({ kind: 'Listing', data: { children: [], after: null } }).after).toBe(
      null,
    );
  });
});

describe('formatAge', () => {
  const now = 1_700_000_000_000;
  const ago = (seconds: number) => now / 1000 - seconds;
  it('uses short units', () => {
    expect(formatAge(ago(30), now)).toBe('now');
    expect(formatAge(ago(5 * 60), now)).toBe('5m');
    expect(formatAge(ago(3 * 3600), now)).toBe('3h');
    expect(formatAge(ago(2 * 86400), now)).toBe('2d');
    expect(formatAge(ago(65 * 86400), now)).toBe('2mo');
    expect(formatAge(ago(400 * 86400), now)).toBe('1y');
  });

  it('never shows a negative age', () => {
    expect(formatAge(ago(-100), now)).toBe('now');
  });
});

describe('formatCount', () => {
  it('shortens large numbers like Reddit does', () => {
    expect(formatCount(999)).toBe('999');
    expect(formatCount(1000)).toBe('1k');
    expect(formatCount(1234)).toBe('1.2k');
    expect(formatCount(16400)).toBe('16.4k');
    expect(formatCount(312_400)).toBe('312k');
    expect(formatCount(1_500_000)).toBe('1.5m');
    expect(formatCount(-1500)).toBe('-1.5k');
  });
});
