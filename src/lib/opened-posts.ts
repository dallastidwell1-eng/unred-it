// The posts the user opened in the reader, for "Hide posts I have opened"
// (D-065). Only post IDs, newest first, capped, in the extension's synced
// storage: they stay on the user's own devices (D-004, D-039; on Android,
// on the phone only, D-066).

import type { StorageAreaLike } from './settings';

export const OPENED_KEY = 'openedPosts';

/**
 * Keep this many. A post ID is about 7 letters, so 500 of them take about
 * 5 KB, under Firefox Sync's 8 KB per stored item.
 */
export const OPENED_MAX = 500;

const POST_ID = /^[a-z0-9]{1,13}$/;

/** A stored list: post IDs only, no repeats, capped. */
export function parseOpened(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const ids = value.filter(
    (item): item is string => typeof item === 'string' && POST_ID.test(item),
  );
  return [...new Set(ids)].slice(0, OPENED_MAX);
}

/** The list with this post first; the oldest drop off past the cap. */
export function withOpened(list: readonly string[], id: string): string[] {
  return [id, ...list.filter((item) => item !== id)].slice(0, OPENED_MAX);
}

export interface OpenedStore {
  load(): Promise<string[]>;
  add(id: string): Promise<void>;
}

export function storageOpenedStore(area: StorageAreaLike): OpenedStore {
  const load = async () => parseOpened((await area.get(OPENED_KEY))[OPENED_KEY]);
  return {
    load,
    async add(id) {
      if (!POST_ID.test(id)) {
        return;
      }
      const list = await load();
      if (list[0] === id) {
        return;
      }
      await area.set({ [OPENED_KEY]: withOpened(list, id) });
    },
  };
}
