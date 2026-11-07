// Voting rules, as old.reddit.com does them. Pure functions.

import type { Post, VoteDirection } from './reddit-data';

export type VoteButton = 'up' | 'down';

/** Pressing the arrow that is already on removes the vote. */
export function directionFor(likes: boolean | null, pressed: VoteButton): VoteDirection {
  if (pressed === 'up') {
    return likes === true ? 0 : 1;
  }
  return likes === false ? 0 : -1;
}

function value(likes: boolean | null): number {
  return likes === true ? 1 : likes === false ? -1 : 0;
}

/** The post as it looks after the vote: new arrow state and score moved to match. */
export function applyVote<T extends Pick<Post, 'likes' | 'score'>>(item: T, dir: VoteDirection): T {
  const likes = dir === 1 ? true : dir === -1 ? false : null;
  return { ...item, likes, score: item.score - value(item.likes) + value(likes) };
}
