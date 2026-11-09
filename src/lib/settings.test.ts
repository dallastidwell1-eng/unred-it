import { describe, expect, it, vi } from 'vitest';
import {
  addEntry,
  cleanSubredditName,
  cleanWord,
  DEFAULT_SETTINGS,
  MAX_LIST,
  parseList,
  parseTheme,
  removeEntry,
  storageSettingsStore,
  type StorageAreaLike,
} from './settings';
import {
  OPENED_KEY,
  OPENED_MAX,
  parseOpened,
  storageOpenedStore,
  withOpened,
} from './opened-posts';
import { parseView, VIEW_KEY } from './view-setting';

type Listener = (changes: Record<string, { newValue?: unknown }>) => void;

function fakeArea(initial: Record<string, unknown> = {}) {
  const items = { ...initial };
  const listeners = new Set<Listener>();
  const set = vi.fn((next: Record<string, unknown>) => {
    Object.assign(items, next);
    return Promise.resolve();
  });
  const area: StorageAreaLike = {
    get: (keys: string | string[]) => {
      const found: Record<string, unknown> = {};
      for (const key of Array.isArray(keys) ? keys : [keys]) {
        if (key in items) {
          found[key] = items[key];
        }
      }
      return Promise.resolve(found);
    },
    set,
    onChanged: {
      addListener: (listener) => listeners.add(listener),
      removeListener: (listener) => listeners.delete(listener),
    },
  };
  const change = (changes: Record<string, { newValue?: unknown }>) => {
    listeners.forEach((listener) => {
      listener(changes);
    });
  };
  return { area, items, listeners, change, set };
}

describe('parsing stored values', () => {
  it('accepts the two views and falls back to compact', () => {
    expect(parseView('card')).toBe('card');
    expect(parseView('compact')).toBe('compact');
    expect(parseView(undefined)).toBe('compact');
    expect(parseView('grid')).toBe('compact');
  });

  it('accepts the three themes and falls back to the device', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme('blue')).toBe('device');
    expect(parseTheme(undefined)).toBe('device');
  });

  it('keeps only non-empty strings in a list, without repeats, capped', () => {
    expect(parseList(['books', ' ', 3, 'Books', 'news '])).toEqual(['books', 'news']);
    expect(parseList('books')).toEqual([]);
    expect(parseList(Array.from({ length: MAX_LIST + 5 }, (_, i) => `s${String(i)}`))).toHaveLength(
      MAX_LIST,
    );
  });
});

describe('cleaning what the user types', () => {
  it('takes a subreddit name with or without r/', () => {
    expect(cleanSubredditName('r/Books')).toBe('Books');
    expect(cleanSubredditName(' /r/books/ ')).toBe('books');
    expect(cleanSubredditName('AskHistorians')).toBe('AskHistorians');
  });

  it('refuses what cannot be a subreddit name', () => {
    expect(cleanSubredditName('')).toBeNull();
    expect(cleanSubredditName('a')).toBeNull();
    expect(cleanSubredditName('two words')).toBeNull();
    expect(cleanSubredditName('_under')).toBeNull();
    expect(cleanSubredditName('x'.repeat(22))).toBeNull();
  });

  it('tidies a word or phrase', () => {
    expect(cleanWord('  spoiler ')).toBe('spoiler');
    expect(cleanWord('season   finale')).toBe('season finale');
    expect(cleanWord('   ')).toBeNull();
    expect(cleanWord('x'.repeat(60))).toHaveLength(40);
  });

  it('adds without repeats in any letter case, and removes', () => {
    expect(addEntry(['books'], 'news')).toEqual(['books', 'news']);
    expect(addEntry(['books'], 'BOOKS')).toEqual(['books']);
    expect(removeEntry(['books', 'news'], 'books')).toEqual(['news']);
  });
});

describe('storageSettingsStore', () => {
  it('loads the defaults when nothing is saved', async () => {
    expect(await storageSettingsStore(fakeArea().area).load()).toEqual(DEFAULT_SETTINGS);
  });

  it('loads saved settings, including the view saved before M6', async () => {
    const fake = fakeArea({
      [VIEW_KEY]: 'card',
      theme: 'dark',
      hiddenSubreddits: ['politics'],
      hiddenWords: ['spoiler'],
      hideOpened: true,
    });
    expect(await storageSettingsStore(fake.area).load()).toEqual({
      theme: 'dark',
      view: 'card',
      hiddenSubreddits: ['politics'],
      hiddenWords: ['spoiler'],
      hideOpened: true,
    });
  });

  it('saves each setting under its own key, and only the ones given', async () => {
    const fake = fakeArea({ theme: 'light' });
    await storageSettingsStore(fake.area).save({ view: 'card', hiddenWords: ['a'] });
    expect(fake.items).toEqual({ theme: 'light', [VIEW_KEY]: 'card', hiddenWords: ['a'] });
  });

  it('reports changed settings only, until stopped', () => {
    const fake = fakeArea();
    const seen = vi.fn();
    const stop = storageSettingsStore(fake.area).watch(seen);
    fake.change({ [OPENED_KEY]: { newValue: ['abc'] } });
    fake.change({ theme: { newValue: 'dark' }, [VIEW_KEY]: { newValue: 'card' } });
    fake.change({ hideOpened: {} }); // removed: back to the default
    expect(seen.mock.calls).toEqual([[{ theme: 'dark', view: 'card' }], [{ hideOpened: false }]]);
    stop();
    expect(fake.listeners.size).toBe(0);
  });
});

describe('opened posts', () => {
  it('keeps post IDs only, without repeats, capped', () => {
    expect(parseOpened(['abc', 'abc', 'T3_x', 7, 'def'])).toEqual(['abc', 'def']);
    expect(parseOpened(null)).toEqual([]);
    const many = Array.from({ length: OPENED_MAX + 3 }, (_, i) => `p${String(i)}`);
    expect(parseOpened(many)).toHaveLength(OPENED_MAX);
  });

  it('puts the newest first and drops the oldest past the cap', () => {
    expect(withOpened(['b', 'a'], 'a')).toEqual(['a', 'b']);
    const full = Array.from({ length: OPENED_MAX }, (_, i) => `p${String(i)}`);
    const next = withOpened(full, 'new');
    expect(next).toHaveLength(OPENED_MAX);
    expect(next[0]).toBe('new');
    expect(next).not.toContain(`p${String(OPENED_MAX - 1)}`);
  });

  it('stores an opened post once, newest first', async () => {
    const fake = fakeArea({ [OPENED_KEY]: ['old'] });
    const store = storageOpenedStore(fake.area);
    await store.add('abc');
    await store.add('abc');
    await store.add('not an id');
    expect(await store.load()).toEqual(['abc', 'old']);
    expect(fake.set).toHaveBeenCalledTimes(1);
  });
});
