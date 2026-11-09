// The feed view (compact rows or cards), saved per person in the extension's
// synced storage (D-061, D-028). The first setting of the M6 settings page
// (D-024); until then a temporary button in the top bar changes it.

export type FeedView = 'compact' | 'card';

/** The storage key. M6 keeps it, so a saved choice carries over. */
export const VIEW_KEY = 'feedView';

/** Compact is the default (D-019: the owner's view). */
export const DEFAULT_VIEW: FeedView = 'compact';

/** Anything stored that is not a known view counts as the default. */
export function parseView(value: unknown): FeedView {
  return value === 'card' || value === 'compact' ? value : DEFAULT_VIEW;
}

export function otherView(view: FeedView): FeedView {
  return view === 'card' ? 'compact' : 'card';
}

/** Reads, saves and watches the view. */
export interface ViewStore {
  load(): Promise<FeedView>;
  save(view: FeedView): Promise<void>;
  /** Calls `onChange` when another tab or device changes the view. Returns "stop". */
  watch(onChange: (view: FeedView) => void): () => void;
}

/** The part of browser.storage.sync (a StorageArea) that this file uses. */
export interface StorageAreaLike {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  onChanged: {
    addListener(listener: (changes: Record<string, { newValue?: unknown }>) => void): void;
    removeListener(listener: (changes: Record<string, { newValue?: unknown }>) => void): void;
  };
}

export function storageViewStore(area: StorageAreaLike): ViewStore {
  return {
    async load() {
      const items = await area.get(VIEW_KEY);
      return parseView(items[VIEW_KEY]);
    },
    save(view) {
      return area.set({ [VIEW_KEY]: view });
    },
    watch(onChange) {
      const listener = (changes: Record<string, { newValue?: unknown }>) => {
        const change = changes[VIEW_KEY];
        if (change) {
          onChange(parseView(change.newValue));
        }
      };
      area.onChanged.addListener(listener);
      return () => {
        area.onChanged.removeListener(listener);
      };
    },
  };
}
