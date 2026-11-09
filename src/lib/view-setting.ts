// The feed view (compact rows or cards), saved per person in the extension's
// synced storage (D-061, D-028). One of the settings in settings.ts; it keeps
// its own storage key from before the settings page (M6), so a saved choice
// carries over.

export type FeedView = 'compact' | 'card';

/** The storage key. */
export const VIEW_KEY = 'feedView';

/** Compact is the default (D-019: the owner's view). */
export const DEFAULT_VIEW: FeedView = 'compact';

/** Anything stored that is not a known view counts as the default. */
export function parseView(value: unknown): FeedView {
  return value === 'card' || value === 'compact' ? value : DEFAULT_VIEW;
}
