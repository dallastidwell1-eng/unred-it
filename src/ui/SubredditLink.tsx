// "r/name" as a real link to that subreddit, wherever a subreddit is named
// (owner, session 003). A plain click opens the subreddit in the reader;
// Ctrl/middle click opens it in a new tab as usual.

import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { isPlainClick } from './clicks';

/** Opens another reader page. App provides it; the default is a normal page load. */
export const OpenPageContext = createContext<(path: string) => void>((path) => {
  window.location.assign(path);
});

export function SubredditLink({ name }: { name: string }) {
  const openPage = useContext(OpenPageContext);
  const path = `/r/${name}/`;
  return (
    <a
      class="sub-link"
      href={path}
      onClick={(event) => {
        if (isPlainClick(event)) {
          event.preventDefault();
          event.stopPropagation();
          openPage(path);
        }
      }}
    >
      r/{name}
    </a>
  );
}
