// The feed filters (M6, D-065): hidden subreddits, hidden words, and posts the
// user has opened. Pure functions; the reader applies them to every feed and
// search page it draws.

import type { SearchInfo } from './feed-route';
import type { Post } from './reddit-data';

export interface FilterRules {
  hiddenSubreddits: readonly string[];
  hiddenWords: readonly string[];
  hideOpened: boolean;
  /** Post IDs (without "t3_") the user opened before this page was loaded. */
  opened: ReadonlySet<string>;
}

/** What the page on screen is, for the filters' exceptions. */
export interface FeedPlace {
  /** Subreddits this page was opened for on purpose (lower case). Never hidden here. */
  ownSubreddits: string[];
  /** A search page: posts already opened still show (D-065). */
  isSearch: boolean;
}

/**
 * The page's place from its path. "/r/books/" and "/r/books+history/new/" are
 * opened on purpose; Home, Popular and All are not. A search inside a
 * subreddit counts as that subreddit.
 */
export function feedPlace(path: string, search: SearchInfo | null): FeedPlace {
  if (search) {
    return {
      ownSubreddits: search.subreddit ? [search.subreddit.toLowerCase()] : [],
      isSearch: true,
    };
  }
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'r' || !parts[1]) {
    return { ownSubreddits: [], isSearch: false };
  }
  const names = parts[1]
    .toLowerCase()
    .split('+')
    .filter((name) => name !== '' && name !== 'popular' && name !== 'all');
  return { ownSubreddits: names, isSearch: false };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matches a title holding the word or phrase as whole words, in any letter
 * case: "cat" matches "My cat" and "CAT!", not "category".
 */
export function wordMatcher(word: string): RegExp | null {
  const parts = word.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (parts.length === 0) {
    return null;
  }
  return new RegExp(`(?<![\\p{L}\\p{N}_])${parts.join('\\s+')}(?![\\p{L}\\p{N}_])`, 'iu');
}

/** Returns a test that is true for the posts to show. */
export function postFilter(rules: FilterRules, place: FeedPlace): (post: Post) => boolean {
  const own = new Set(place.ownSubreddits);
  const hiddenSubs = new Set(
    rules.hiddenSubreddits.map((name) => name.toLowerCase()).filter((name) => !own.has(name)),
  );
  const matchers = rules.hiddenWords
    .map(wordMatcher)
    .filter((matcher): matcher is RegExp => matcher !== null);
  const hideOpened = rules.hideOpened && !place.isSearch;
  return (post) => {
    if (hiddenSubs.has(post.subreddit.toLowerCase())) {
      return false;
    }
    if (matchers.some((matcher) => matcher.test(post.title))) {
      return false;
    }
    if (hideOpened && rules.opened.has(post.id)) {
      return false;
    }
    return true;
  };
}
