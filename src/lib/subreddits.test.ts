import { describe, expect, it } from 'vitest';
import {
  avatarLetter,
  avatarTone,
  currentFeed,
  feedPathFor,
  filterSubreddits,
  loadSubscriptions,
  MAX_SUBSCRIPTION_PAGES,
  parseSubredditPage,
  type Subreddit,
  subscriptionsJsonPath,
  typedSubredditName,
} from './subreddits';

function t5(data: Record<string, unknown>) {
  return { kind: 't5', data };
}

function listing(children: unknown[], after: string | null = null) {
  return { kind: 'Listing', data: { children, after } };
}

const subs = (...names: string[]): Subreddit[] => names.map((name) => ({ name, over18: false }));

describe('subscriptionsJsonPath', () => {
  it('asks for 100 at a time with plain text, and adds the cursor', () => {
    expect(subscriptionsJsonPath(null)).toBe(
      '/subreddits/mine/subscriber.json?raw_json=1&limit=100',
    );
    expect(subscriptionsJsonPath('t5_abc')).toBe(
      '/subreddits/mine/subscriber.json?raw_json=1&limit=100&after=t5_abc',
    );
  });
});

describe('parseSubredditPage', () => {
  it('reads names, the NSFW flag and the cursor', () => {
    const page = parseSubredditPage(
      listing(
        [
          t5({ display_name: 'AskHistorians', subreddit_type: 'public', over18: false }),
          t5({ display_name: 'example_nsfw', subreddit_type: 'restricted', over18: true }),
        ],
        't5_next',
      ),
    );
    expect(page.subreddits).toEqual([
      { name: 'AskHistorians', over18: false },
      { name: 'example_nsfw', over18: true },
    ]);
    expect(page.after).toBe('t5_next');
  });

  it('leaves out followed user profiles, other kinds and bad names', () => {
    const page = parseSubredditPage(
      listing([
        t5({ display_name: 'u_someone', subreddit_type: 'user' }),
        { kind: 't3', data: { display_name: 'notasub' } },
        t5({ display_name: '<script>' }),
        t5({}),
        t5({ display_name: 'books', subreddit_type: 'public' }),
      ]),
    );
    expect(page.subreddits.map((s) => s.name)).toEqual(['books']);
    expect(page.after).toBeNull();
  });

  it('refuses something that is not a Listing', () => {
    expect(() => parseSubredditPage({ error: 403 })).toThrow('Not a Reddit Listing');
    expect(() => parseSubredditPage('<html>')).toThrow();
  });
});

describe('loadSubscriptions', () => {
  it('follows the cursor, drops repeats and sorts without regard to case', async () => {
    const pages: Record<string, unknown> = {
      [subscriptionsJsonPath(null)]: listing(
        [t5({ display_name: 'zerowaste' }), t5({ display_name: 'Cooking' })],
        't5_2',
      ),
      [subscriptionsJsonPath('t5_2')]: listing([
        t5({ display_name: 'askhistorians' }),
        t5({ display_name: 'cooking' }),
        t5({ display_name: 'DIY' }),
      ]),
    };
    const asked: string[] = [];
    const result = await loadSubscriptions((path) => {
      asked.push(path);
      return Promise.resolve(pages[path]);
    });
    expect(asked).toHaveLength(2);
    expect(result.map((s) => s.name)).toEqual(['askhistorians', 'cooking', 'DIY', 'zerowaste']);
  });

  it('stops after the page limit even if Reddit keeps sending a cursor', async () => {
    let calls = 0;
    await loadSubscriptions(() => {
      calls += 1;
      return Promise.resolve(listing([t5({ display_name: `sub${String(calls)}x` })], 'more'));
    });
    expect(calls).toBe(MAX_SUBSCRIPTION_PAGES);
  });

  it('passes a failed request on to the caller', async () => {
    await expect(loadSubscriptions(() => Promise.reject(new Error('HTTP 403')))).rejects.toThrow(
      'HTTP 403',
    );
  });
});

describe('filterSubreddits', () => {
  const list = subs('AskHistorians', 'astrophotography', 'Cooking', 'DIY', 'LandscapePhotography');

  it('returns the whole list for an empty filter', () => {
    expect(filterSubreddits(list, '  ')).toBe(list);
  });

  it('ignores case and puts names that start with the text first', () => {
    expect(filterSubreddits(list, 'PHOTO').map((s) => s.name)).toEqual([
      'astrophotography',
      'LandscapePhotography',
    ]);
    expect(filterSubreddits(list, 'a').map((s) => s.name)).toEqual([
      'AskHistorians',
      'astrophotography',
      'LandscapePhotography',
    ]);
  });

  it('accepts a leading r/ or /r/ and a trailing slash', () => {
    expect(filterSubreddits(list, 'r/coo').map((s) => s.name)).toEqual(['Cooking']);
    expect(filterSubreddits(list, '/r/diy/').map((s) => s.name)).toEqual(['DIY']);
  });

  it('returns nothing when no name matches', () => {
    expect(filterSubreddits(list, 'woodworking')).toEqual([]);
  });
});

describe('typedSubredditName', () => {
  it('accepts a name with or without r/', () => {
    expect(typedSubredditName('woodworking')).toBe('woodworking');
    expect(typedSubredditName(' r/Wood_Working ')).toBe('Wood_Working');
    expect(typedSubredditName('/r/aww/')).toBe('aww');
  });

  it('refuses text that cannot be a subreddit name', () => {
    expect(typedSubredditName('')).toBeNull();
    expect(typedSubredditName('a')).toBeNull();
    expect(typedSubredditName('two words')).toBeNull();
    expect(typedSubredditName('../../api')).toBeNull();
    expect(typedSubredditName('_under')).toBeNull();
    expect(typedSubredditName('x'.repeat(22))).toBeNull();
  });
});

describe('feedPathFor and currentFeed', () => {
  it('maps each choice to its old.reddit.com path', () => {
    expect(feedPathFor('home')).toBe('/');
    expect(feedPathFor('popular')).toBe('/r/popular/');
    expect(feedPathFor('all')).toBe('/r/all/');
    expect(feedPathFor({ name: 'DIY', over18: false })).toBe('/r/DIY/');
  });

  it('tells which feed a page shows', () => {
    expect(currentFeed('/')).toBe('home');
    expect(currentFeed('/top/')).toBe('home');
    expect(currentFeed('/r/popular/')).toBe('popular');
    expect(currentFeed('/r/All/new/')).toBe('all');
    expect(currentFeed('/r/DIY/top/')).toEqual({ name: 'DIY' });
    expect(currentFeed('/search')).toBeNull();
    expect(currentFeed('/r/DIY/search')).toEqual({ name: 'DIY' });
  });
});

describe('avatar', () => {
  it('uses the first letter, upper case', () => {
    expect(avatarLetter('askhistorians')).toBe('A');
    expect(avatarLetter('2007scape')).toBe('2');
  });

  it('gives each name the same tone every time, within range', () => {
    expect(avatarTone('Cooking', 4)).toBe(avatarTone('cooking', 4));
    for (const name of ['a', 'books', 'DIY', 'zerowaste', 'LandscapePhotography']) {
      const tone = avatarTone(name, 4);
      expect(tone).toBeGreaterThanOrEqual(1);
      expect(tone).toBeLessThanOrEqual(4);
    }
  });
});
