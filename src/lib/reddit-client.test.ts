import { describe, expect, it, vi } from 'vitest';
import { createRedditClient, type FetchLike } from './reddit-client';

function reply(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

const me = { kind: 't2', data: { name: 'me', modhash: 'mh1' } };

/** A client whose Reddit answers /api/me.json and then `answer` for every action. */
function clientAnswering(answer: unknown) {
  const fetchFn = vi.fn<FetchLike>(async (url) =>
    Promise.resolve(url === '/api/me.json' ? reply(200, me) : reply(200, answer)),
  );
  return { client: createRedditClient(fetchFn), fetchFn };
}

describe('createRedditClient.save (D-063)', () => {
  it('saves and unsaves with the modhash', async () => {
    const { client, fetchFn } = clientAnswering({});
    await client.save('t3_a', true);
    await client.save('t1_b', false);
    const calls = fetchFn.mock.calls.slice(1).map(([url, init]) => [url, init?.body]);
    expect(calls).toEqual([
      ['/api/save', 'id=t3_a&uh=mh1'],
      ['/api/unsave', 'id=t1_b&uh=mh1'],
    ]);
  });
});

describe('createRedditClient.comment (D-063)', () => {
  const posted = {
    json: {
      errors: [],
      data: {
        things: [
          {
            kind: 't1',
            data: {
              name: 't1_new',
              id: 'new',
              author: 'me',
              body_html: '<div class="md"><p>Hello &amp; welcome</p></div>',
              score: 1,
              likes: true,
              parent_id: 't1_b',
            },
          },
        ],
      },
    },
  };

  it('sends the text under its parent and returns the new comment', async () => {
    const { client, fetchFn } = clientAnswering(posted);
    const added = await client.comment('t1_b', 'Hello & welcome');
    const [url, init] = fetchFn.mock.calls[1] ?? [];
    expect(url).toBe('/api/comment?raw_json=1');
    expect(Object.fromEntries(new URLSearchParams(init?.body as string))).toEqual({
      api_type: 'json',
      thing_id: 't1_b',
      text: 'Hello & welcome',
      uh: 'mh1',
    });
    expect(added).toMatchObject({
      fullname: 't1_new',
      author: 'me',
      bodyHtml: '<div class="md"><p>Hello &amp; welcome</p></div>',
      replies: [],
    });
  });

  it('unescapes the text if Reddit sends it escaped', async () => {
    const escaped = structuredClone(posted);
    const thing = escaped.json.data.things[0];
    if (thing) {
      thing.data.body_html = '&lt;div class="md"&gt;&lt;p&gt;Hi&lt;/p&gt;&lt;/div&gt;';
    }
    const { client } = clientAnswering(escaped);
    expect((await client.comment('t3_a', 'Hi')).bodyHtml).toBe('<div class="md"><p>Hi</p></div>');
  });

  it("passes on Reddit's refusal", async () => {
    const { client } = clientAnswering({
      json: { errors: [['RATELIMIT', 'you are doing that too much']] },
    });
    await expect(client.comment('t3_a', 'Hi')).rejects.toThrow('Reddit refused: RATELIMIT');
  });

  it('fails clearly when the answer has no comment', async () => {
    const { client } = clientAnswering({ json: { errors: [], data: { things: [] } } });
    await expect(client.comment('t3_a', 'Hi')).rejects.toThrow('did not send the new comment');
  });
});
