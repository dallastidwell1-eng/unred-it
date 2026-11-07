// Above a search's posts: the subreddits, then the users, that match
// (owner's request, session 003). A subreddit opens in the reader; a user
// opens Reddit's own profile page for now (profiles are not rebuilt yet).

import type { Community } from '../lib/reddit-data';
import { avatarLetter, avatarTone } from '../lib/subreddits';
import { isPlainClick } from './clicks';
import { themes } from './tokens';

const TONES = themes.dark.placeholders.length;

function Group({
  label,
  id,
  items,
  onOpen,
}: {
  label: string;
  id: string;
  items: Community[];
  onOpen: (path: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby={id}>
      <h2 class="section-label" id={id}>
        {label}
      </h2>
      <ul class="sub-list">
        {items.map((item) => {
          const subreddit = item.kind === 'subreddit';
          const path = subreddit ? `/r/${item.name}/` : `/user/${item.name}/`;
          return (
            <li key={`${item.kind}:${item.name}`}>
              <a
                class="sub-row community-row"
                href={path}
                onClick={(event) => {
                  if (subreddit && isPlainClick(event)) {
                    event.preventDefault();
                    onOpen(path);
                  }
                }}
              >
                <span
                  class={`avatar tone-${String(avatarTone(item.name, TONES))}`}
                  aria-hidden="true"
                >
                  {avatarLetter(item.name)}
                </span>
                <span class="community-text">
                  <span class="sub-name">
                    {subreddit ? 'r/' : 'u/'}
                    {item.name}
                  </span>
                  {item.description && (
                    <span class="community-description">{item.description}</span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SearchCommunities({
  items,
  hasPosts,
  onOpen,
}: {
  items: Community[];
  hasPosts: boolean;
  /** Opens a subreddit in the reader. */
  onOpen: (path: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div class="results">
      <Group
        label="Subreddits"
        id="results-subreddits"
        items={items.filter((item) => item.kind === 'subreddit')}
        onOpen={onOpen}
      />
      <Group
        label="Users"
        id="results-users"
        items={items.filter((item) => item.kind === 'user')}
        onOpen={onOpen}
      />
      {hasPosts && <h2 class="section-label results-posts">Posts</h2>}
    </div>
  );
}
