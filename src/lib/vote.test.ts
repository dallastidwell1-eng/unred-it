import { describe, expect, it, vi } from 'vitest';
import { createRedditClient, type FetchLike } from './reddit-client';
import type { Post } from './reddit-data';
import { applyVote, directionFor } from './vote';

const base = { score: 10, likes: null } as unknown as Post;

describe('directionFor', () => {
  it('turns an arrow on, switches sides, and turns it off', () => {
    expect(directionFor(null, 'up')).toBe(1);
    expect(directionFor(null, 'down')).toBe(-1);
    expect(directionFor(true, 'up')).toBe(0);
    expect(directionFor(false, 'down')).toBe(0);
    expect(directionFor(true, 'down')).toBe(-1);
    expect(directionFor(false, 'up')).toBe(1);
  });
});

describe('applyVote', () => {
  it('moves the score with the vote', () => {
    const up = applyVote(base, 1);
    expect(up).toMatchObject({ likes: true, score: 11 });
    const down = applyVote(up, -1);
    expect(down).toMatchObject({ likes: false, score: 9 });
    expect(applyVote(down, 0)).toMatchObject({ likes: null, score: 10 });
  });
});

function reply(status: number, body: unknown): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
}

describe('createRedditClient.vote', () => {
  const me = { kind: 't2', data: { name: 'me', modhash: 'mh1' } };

  it('sends the form with the modhash and asks for it only once', async () => {
    const fetchFn = vi.fn<FetchLike>(async (url) =>
      Promise.resolve(url === '/api/me.json' ? reply(200, me) : reply(200, {})),
    );
    const client = createRedditClient(fetchFn);
    await client.vote('t3_a', 1);
    await client.vote('t3_a', 0);
    const calls = fetchFn.mock.calls.map(([url, init]) => [url, init?.body]);
    expect(calls).toEqual([
      ['/api/me.json', undefined],
      ['/api/vote', 'id=t3_a&dir=1&uh=mh1'],
      ['/api/vote', 'id=t3_a&dir=0&uh=mh1'],
    ]);
  });

  it('fetches a fresh modhash once after a 403', async () => {
    let meCalls = 0;
    let voteCalls = 0;
    const fetchFn = vi.fn<FetchLike>(async (url) => {
      if (url === '/api/me.json') {
        meCalls += 1;
        return Promise.resolve(
          reply(200, { data: { name: 'me', modhash: `mh${String(meCalls)}` } }),
        );
      }
      voteCalls += 1;
      return Promise.resolve(voteCalls === 1 ? reply(403, '') : reply(200, {}));
    });
    await createRedditClient(fetchFn).vote('t3_a', 1);
    expect(fetchFn.mock.calls.at(-1)?.[1]?.body).toBe('id=t3_a&dir=1&uh=mh2');
  });

  it('reports a logged-out user, a refusal and an HTTP error', async () => {
    const loggedOut = createRedditClient(async () => Promise.resolve(reply(200, {})));
    await expect(loggedOut.vote('t3_a', 1)).rejects.toThrow('Log in to Reddit first.');

    const refusing = createRedditClient(async (url) =>
      Promise.resolve(
        url === '/api/me.json'
          ? reply(200, me)
          : reply(200, { json: { errors: [['TOO_OLD', 'that is too old to vote on']] } }),
      ),
    );
    await expect(refusing.vote('t3_a', 1)).rejects.toThrow('Reddit refused: TOO_OLD');

    const failing = createRedditClient(async (url) =>
      Promise.resolve(url === '/api/me.json' ? reply(200, me) : reply(500, '')),
    );
    await expect(failing.vote('t3_a', 1)).rejects.toThrow('HTTP 500');
  });
});

describe('createRedditClient.account', () => {
  it('gives the name and unread count, and shares the one /api/me request with voting', async () => {
    const me = { kind: 't2', data: { name: 'me', modhash: 'mh1', inbox_count: 2 } };
    const fetchFn = vi.fn<FetchLike>((url) =>
      Promise.resolve(url === '/api/me.json' ? reply(200, me) : reply(200, {})),
    );
    const client = createRedditClient(fetchFn);
    expect(await client.account()).toEqual({ name: 'me', unread: 2 });
    await client.vote('t3_a', 1);
    expect(fetchFn.mock.calls.filter(([url]) => url === '/api/me.json')).toHaveLength(1);
  });

  it('returns null when logged out or when Reddit fails', async () => {
    const loggedOut = createRedditClient(async () => Promise.resolve(reply(200, {})));
    expect(await loggedOut.account()).toBeNull();
    const failing = createRedditClient(async () => Promise.resolve(reply(503, '')));
    expect(await failing.account()).toBeNull();
  });
});
