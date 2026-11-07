// Actions on Reddit as the logged-in user, sent the way old.reddit.com sends
// them (D-047): a form plus the session's modhash. The modhash is kept in
// memory only; it is never shown, logged or stored.

import { type Me, parseMe, type VoteDirection, voteBody } from './reddit-data';

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** The logged-in user as the top bar shows them (no modhash). */
export interface Account {
  name: string;
  unread: number;
}

export interface RedditClient {
  vote(fullname: string, dir: VoteDirection): Promise<void>;
  /** The logged-in user, or null when logged out or Reddit does not answer. */
  account(): Promise<Account | null>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Reddit's form endpoints answer 200 with {"json": {"errors": [...]}} when they refuse. */
function redditError(json: unknown): string | null {
  if (!isRecord(json) || !isRecord(json.json) || !Array.isArray(json.json.errors)) {
    return null;
  }
  const first: unknown = json.json.errors[0];
  if (Array.isArray(first)) {
    return first.filter((part) => typeof part === 'string').join(': ') || 'refused';
  }
  return null;
}

export function createRedditClient(fetchFn: FetchLike): RedditClient {
  let session: Promise<Me> | null = null;

  async function me(): Promise<Me> {
    session ??= (async () => {
      const response = await fetchFn('/api/me.json', { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Reddit answered HTTP ${String(response.status)}`);
      }
      const user = parseMe(await response.json());
      if (!user) {
        throw new Error('Log in to Reddit to vote.');
      }
      return user;
    })();
    try {
      return await session;
    } catch (error) {
      session = null; // try again next time
      throw error;
    }
  }

  async function post(path: string, body: (modhash: string) => string): Promise<void> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const user = await me();
      const response = await fetchFn(path, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body(user.modhash),
      });
      if (response.status === 403 && attempt === 0) {
        session = null; // the modhash may be stale: fetch a new one once
        continue;
      }
      if (!response.ok) {
        throw new Error(`Reddit answered HTTP ${String(response.status)}`);
      }
      const text = await response.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
      const refused = redditError(json);
      if (refused) {
        throw new Error(`Reddit refused: ${refused}`);
      }
      return;
    }
  }

  return {
    vote(fullname, dir) {
      return post('/api/vote', (modhash) => voteBody(fullname, dir, modhash));
    },
    async account() {
      try {
        const user = await me();
        return { name: user.name, unread: user.unread };
      } catch {
        return null;
      }
    },
  };
}
