// An author's name as a link to their profile on old.reddit.com (D-068).
// Profiles are not rebuilt, so the link is an ordinary one: Reddit's own
// profile page opens in the same tab (Ctrl or middle click: a new tab).
// "[deleted]" and other names that cannot be accounts stay plain text.

import type { ComponentChildren } from 'preact';

/** Reddit usernames: 3 to 20 letters, digits, "_" or "-". */
const USERNAME = /^[A-Za-z0-9_-]{3,20}$/;

export function profilePath(name: string): string | null {
  return USERNAME.test(name) ? `/user/${name}/` : null;
}

export function UserLink({
  name,
  className,
  children,
}: {
  name: string;
  className?: string;
  /** What the link shows; default "u/name". */
  children?: ComponentChildren;
}) {
  const path = profilePath(name);
  const shown = children ?? `u/${name}`;
  if (!path) {
    return <span class={className}>{shown}</span>;
  }
  return (
    <a
      class={className ? `user-link ${className}` : 'user-link'}
      href={path}
      onClick={(event) => {
        // The click is the link's own; it must not also open or fold what is around it.
        event.stopPropagation();
      }}
    >
      {shown}
    </a>
  );
}
