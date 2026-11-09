import { describe, expect, it } from 'vitest';
import { feedPlace, postFilter, wordMatcher, type FilterRules } from './filters';
import type { Post } from './reddit-data';

function post(id: string, subreddit: string, title: string): Post {
  return { id, fullname: `t3_${id}`, subreddit, title } as Post;
}

const NO_RULES: FilterRules = {
  hiddenSubreddits: [],
  hiddenWords: [],
  hideOpened: false,
  opened: new Set(),
};

function shown(rules: Partial<FilterRules>, place = feedPlace('/', null), posts: Post[] = []) {
  return posts.filter(postFilter({ ...NO_RULES, ...rules }, place)).map((p) => p.id);
}

const POSTS = [
  post('a', 'politics', 'A vote today'),
  post('b', 'books', 'My favorite category of books'),
  post('c', 'Cats', 'My CAT sat on the keyboard!'),
  post('d', 'television', 'Season  finale tonight'),
];

describe('feedPlace', () => {
  it('knows the subreddits a page was opened for', () => {
    expect(feedPlace('/', null)).toEqual({ ownSubreddits: [], isSearch: false });
    expect(feedPlace('/r/popular/', null).ownSubreddits).toEqual([]);
    expect(feedPlace('/r/all/top/', null).ownSubreddits).toEqual([]);
    expect(feedPlace('/r/Books/new/', null).ownSubreddits).toEqual(['books']);
    expect(feedPlace('/r/books+history/', null).ownSubreddits).toEqual(['books', 'history']);
  });

  it('treats a search inside a subreddit as that subreddit', () => {
    expect(feedPlace('/search', { query: 'x', subreddit: null })).toEqual({
      ownSubreddits: [],
      isSearch: true,
    });
    expect(feedPlace('/r/Books/search', { query: 'x', subreddit: 'Books' })).toEqual({
      ownSubreddits: ['books'],
      isSearch: true,
    });
  });
});

describe('wordMatcher', () => {
  it('matches whole words in any letter case', () => {
    const cat = wordMatcher('cat');
    expect(cat?.test('My CAT sat')).toBe(true);
    expect(cat?.test('cat!')).toBe(true);
    expect(cat?.test('category')).toBe(false);
    expect(cat?.test('bobcat')).toBe(false);
  });

  it('matches a phrase across any spaces, and words with symbols', () => {
    expect(wordMatcher('season finale')?.test('Season  finale tonight')).toBe(true);
    expect(wordMatcher('c++')?.test('Learning C++ today')).toBe(true);
    expect(wordMatcher('café')?.test('Le Café du coin')).toBe(true);
    expect(wordMatcher('  ')).toBeNull();
  });
});

describe('postFilter', () => {
  it('shows everything with no rules', () => {
    expect(shown({}, undefined, POSTS)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('hides hidden subreddits in Home, Popular, All and search, in any letter case', () => {
    const rules = { hiddenSubreddits: ['Politics', 'cats'] };
    expect(shown(rules, feedPlace('/', null), POSTS)).toEqual(['b', 'd']);
    expect(shown(rules, feedPlace('/r/popular/', null), POSTS)).toEqual(['b', 'd']);
    expect(shown(rules, feedPlace('/search', { query: 'x', subreddit: null }), POSTS)).toEqual([
      'b',
      'd',
    ]);
  });

  it('still shows a hidden subreddit opened on purpose, or searched inside', () => {
    const rules = { hiddenSubreddits: ['politics', 'cats'] };
    expect(shown(rules, feedPlace('/r/politics/', null), POSTS)).toEqual(['a', 'b', 'd']);
    expect(
      shown(rules, feedPlace('/r/politics/search', { query: 'x', subreddit: 'politics' }), POSTS),
    ).toEqual(['a', 'b', 'd']);
  });

  it('hides titles with a hidden word everywhere, including search', () => {
    const rules = { hiddenWords: ['cat', 'season finale'] };
    expect(shown(rules, feedPlace('/r/cats/', null), POSTS)).toEqual(['a', 'b']);
    expect(shown(rules, feedPlace('/search', { query: 'x', subreddit: null }), POSTS)).toEqual([
      'a',
      'b',
    ]);
  });

  it('hides opened posts in feeds when the switch is on, but not in search', () => {
    const opened = new Set(['a', 'c']);
    expect(shown({ opened }, feedPlace('/', null), POSTS)).toEqual(['a', 'b', 'c', 'd']);
    expect(shown({ opened, hideOpened: true }, feedPlace('/r/cats/', null), POSTS)).toEqual([
      'b',
      'd',
    ]);
    expect(
      shown(
        { opened, hideOpened: true },
        feedPlace('/search', { query: 'x', subreddit: null }),
        POSTS,
      ),
    ).toEqual(['a', 'b', 'c', 'd']);
  });
});
