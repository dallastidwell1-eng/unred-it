// The extension's settings (M6, D-024, D-064, D-065): theme, feed view and
// the filters. Each setting has its own key in the extension's synced storage
// (browser.storage.sync), so it follows the user between computers through
// Firefox Sync (D-028), and a change to one setting on one computer never
// overwrites another setting changed on another. Firefox for Android keeps
// this storage on the phone only (D-066).

import { DEFAULT_VIEW, parseView, VIEW_KEY, type FeedView } from './view-setting';

/** "device" follows the browser's light or dark theme (D-024). */
export type ThemeChoice = 'device' | 'light' | 'dark';

export interface Settings {
  theme: ThemeChoice;
  view: FeedView;
  /** Subreddit names as the user typed them, without "r/". */
  hiddenSubreddits: string[];
  /** Words or phrases; a post whose title holds one is hidden. */
  hiddenWords: string[];
  /** Leave posts the user opened out of feeds (D-065). */
  hideOpened: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'device',
  view: DEFAULT_VIEW,
  hiddenSubreddits: [],
  hiddenWords: [],
  hideOpened: false,
};

/** Storage key for each setting. The view keeps its key from before M6 (D-061). */
export const SETTING_KEYS: Record<keyof Settings, string> = {
  theme: 'theme',
  view: VIEW_KEY,
  hiddenSubreddits: 'hiddenSubreddits',
  hiddenWords: 'hiddenWords',
  hideOpened: 'hideOpened',
};

/**
 * At most this many entries per list. Firefox Sync allows 8 KB per stored
 * item; 200 names of up to 21 letters stay well under it.
 */
export const MAX_LIST = 200;

/** A hidden word or phrase is at most this long. */
export const MAX_WORD = 40;

const SUBREDDIT_NAME = /^[A-Za-z0-9][A-Za-z0-9_]{1,20}$/;

export function parseTheme(value: unknown): ThemeChoice {
  return value === 'light' || value === 'dark' ? value : 'device';
}

/** A stored list: only non-empty strings, no repeats (any letter case), capped. */
export function parseList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const list: string[] = [];
  for (const item of value) {
    if (typeof item === 'string' && item.trim() !== '') {
      if (!hasEntry(list, item)) {
        list.push(item.trim());
      }
    }
  }
  return list.slice(0, MAX_LIST);
}

/** Reads one stored value into its setting; unknown values become the default. */
function parseSetting<K extends keyof Settings>(key: K, value: unknown): Settings[K] {
  const parsers: { [P in keyof Settings]: (raw: unknown) => Settings[P] } = {
    theme: parseTheme,
    view: parseView,
    hiddenSubreddits: parseList,
    hiddenWords: parseList,
    hideOpened: (raw) => raw === true,
  };
  return parsers[key](value);
}

/** The settings found in a set of stored items; settings not in it are left out. */
export function settingsFromItems(items: Record<string, unknown>): Partial<Settings> {
  const found: Partial<Settings> = {};
  for (const key of Object.keys(SETTING_KEYS) as (keyof Settings)[]) {
    const storageKey = SETTING_KEYS[key];
    if (storageKey in items) {
      Object.assign(found, { [key]: parseSetting(key, items[storageKey]) });
    }
  }
  return found;
}

/**
 * A subreddit name typed by the user, cleaned: "r/Books", "/r/books/" and
 * "books" all give "Books"/"books". Null when it is not a possible name.
 */
export function cleanSubredditName(input: string): string | null {
  const name = input
    .trim()
    .replace(/^\/?r\//i, '')
    .replace(/\/$/, '');
  return SUBREDDIT_NAME.test(name) ? name : null;
}

/** A hidden word or phrase typed by the user, with its spaces tidied. Null when empty. */
export function cleanWord(input: string): string | null {
  const word = input.trim().replace(/\s+/g, ' ');
  return word === '' ? null : word.slice(0, MAX_WORD).trim();
}

/** True when the list already holds this entry, in any letter case. */
export function hasEntry(list: readonly string[], entry: string): boolean {
  const wanted = entry.trim().toLowerCase();
  return list.some((item) => item.toLowerCase() === wanted);
}

/** The list with the entry added at the end (no repeat, capped). */
export function addEntry(list: readonly string[], entry: string): string[] {
  if (hasEntry(list, entry) || list.length >= MAX_LIST) {
    return [...list];
  }
  return [...list, entry];
}

export function removeEntry(list: readonly string[], entry: string): string[] {
  return list.filter((item) => item !== entry);
}

/** Reads, saves and watches the settings. */
export interface SettingsStore {
  load(): Promise<Settings>;
  /** Saves only the settings given. */
  save(changes: Partial<Settings>): Promise<void>;
  /** Calls `onChange` with the settings that changed, in any tab or on any device. Returns "stop". */
  watch(onChange: (changes: Partial<Settings>) => void): () => void;
}

type StorageChanges = Record<string, { newValue?: unknown }>;

/** The part of a browser.storage area (StorageArea) that the stores use. */
export interface StorageAreaLike {
  get(keys: string | string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  onChanged: {
    addListener(listener: (changes: StorageChanges) => void): void;
    removeListener(listener: (changes: StorageChanges) => void): void;
  };
}

/** The values to store for some settings, under their storage keys. */
export function itemsFromSettings(changes: Partial<Settings>): Record<string, unknown> {
  const items: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(changes)) {
    items[SETTING_KEYS[key as keyof Settings]] = value;
  }
  return items;
}

export function storageSettingsStore(area: StorageAreaLike): SettingsStore {
  return {
    async load() {
      const items = await area.get(Object.values(SETTING_KEYS));
      return { ...DEFAULT_SETTINGS, ...settingsFromItems(items) };
    },
    save(changes) {
      return area.set(itemsFromSettings(changes));
    },
    watch(onChange) {
      const listener = (changes: StorageChanges) => {
        const values: Record<string, unknown> = {};
        for (const [key, change] of Object.entries(changes)) {
          values[key] = change.newValue;
        }
        const found = settingsFromItems(values);
        if (Object.keys(found).length > 0) {
          onChange(found);
        }
      };
      area.onChanged.addListener(listener);
      return () => {
        area.onChanged.removeListener(listener);
      };
    },
  };
}
