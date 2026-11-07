// OQ-011 data spike (M1, session 002). Temporary: M2 runs it on the phone; remove it after M2.
// A test panel on old.reddit.com, shown only when the address ends in
// #unred-spike. Every network action needs a click; votes also need a confirm.
// The session's modhash (anti-forgery token) is never shown, logged or stored.

import {
  type Me,
  parseListing,
  parseMe,
  parseThread,
  type Post,
  postIdFrom,
  voteBody,
  type VoteDirection,
} from '../lib/reddit-data';

export const SPIKE_HASH = '#unred-spike';
const PANEL_ID = 'unred-it-spike';

type Mode = 'extension' | 'page';
type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

interface PageWindow {
  fetch: FetchFn;
}

interface Reply {
  status: number;
  json: unknown;
  ms: number;
  rate: string;
}

function hasFetch(value: unknown): value is PageWindow {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { fetch?: unknown }).fetch === 'function'
  );
}

/**
 * "extension": the content script's own fetch (Firefox runs it with the
 * extension's rights). "page": Firefox's content.fetch, which sends the
 * request as the page itself, like old.reddit.com's own scripts.
 */
function fetcher(mode: Mode): FetchFn | null {
  if (mode === 'extension') {
    return (url, init) => fetch(url, { credentials: 'include', ...init });
  }
  const page = (globalThis as { content?: unknown }).content;
  if (!hasFetch(page)) {
    return null;
  }
  return (url, init) => page.fetch(url, init);
}

async function request(mode: Mode, path: string, init?: RequestInit): Promise<Reply> {
  const run = fetcher(mode);
  if (!run) {
    throw new Error(`fetch mode "${mode}" is not available here`);
  }
  const url = new URL(path, window.location.origin).toString();
  const started = performance.now();
  const response = await run(url, init);
  const text = await response.text();
  const ms = Math.round(performance.now() - started);
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  const rate = ['used', 'remaining', 'reset']
    .map((name) => `${name}=${response.headers.get(`x-ratelimit-${name}`) ?? '-'}`)
    .join(' ');
  return { status: response.status, json, ms, rate };
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text = '',
  style: Partial<CSSStyleDeclaration> = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.textContent = text;
  Object.assign(node.style, style);
  return node;
}

class SpikePanel {
  private readonly root: HTMLElement;
  private readonly log: HTMLPreElement;
  private readonly target: HTMLInputElement;
  private me: Me | null = null;
  private mode: Mode = 'page';
  private feed: Post[] = [];

  constructor() {
    this.root = el('div', '', {
      position: 'fixed',
      top: '12px',
      right: '12px',
      width: '460px',
      maxHeight: '90vh',
      overflow: 'auto',
      zIndex: '2147483647',
      background: '#1A1A1A',
      color: '#EDEDED',
      font: '13px/1.4 system-ui, sans-serif',
      padding: '12px',
      borderRadius: '10px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    });
    this.root.id = PANEL_ID;
    this.root.append(el('strong', 'Unred It data spike (OQ-011)'));

    this.target = el('input', '', {
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
      margin: '8px 0',
      padding: '6px',
    });
    this.target.placeholder = 'Post to vote on: paste its URL';

    const buttons = el('div', '', { display: 'flex', flexWrap: 'wrap', gap: '6px' });
    const actions: [string, () => Promise<void>][] = [
      ['1 Who am I', () => this.whoAmI()],
      ['2 Read front page', () => this.readFeed()],
      ['3 Read post + comments', () => this.readThread()],
      ['4 Upvote target', () => this.vote(1)],
      ['5 Undo vote', () => this.vote(0)],
      ['Copy log', () => this.copyLog()],
    ];
    for (const [label, action] of actions) {
      const button = el('button', label, { padding: '4px 8px', cursor: 'pointer' });
      button.type = 'button';
      button.addEventListener('click', () => {
        void this.guard(label, action);
      });
      buttons.append(button);
    }

    this.log = el('pre', '', {
      whiteSpace: 'pre-wrap',
      font: '12px/1.4 ui-monospace, monospace',
      marginTop: '8px',
    });
    this.root.append(this.target, buttons, this.log);
    document.body.append(this.root);
    this.write(`Page: ${window.location.href}`);
    this.write(`Browser: ${navigator.userAgent}`);
  }

  private write(line: string): void {
    this.log.textContent += `${line}\n`;
  }

  private async guard(label: string, action: () => Promise<void>): Promise<void> {
    this.write(`\n== ${label} (${new Date().toLocaleTimeString()})`);
    try {
      await action();
    } catch (error) {
      this.write(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async whoAmI(): Promise<void> {
    let chosen: Mode | null = null;
    for (const mode of ['page', 'extension'] as const) {
      try {
        const reply = await request(mode, '/api/me.json');
        const me = parseMe(reply.json);
        this.write(
          `${mode}: HTTP ${String(reply.status)}, ${String(reply.ms)} ms, ` +
            (me
              ? `logged in as u/${me.name}, modhash present (${String(me.modhash.length)} chars)`
              : 'NOT logged in'),
        );
        if (me && !chosen) {
          chosen = mode;
          this.me = me;
        }
      } catch (error) {
        this.write(`${mode}: failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (chosen) {
      this.mode = chosen;
      this.write(`Using "${chosen}" mode for the next steps.`);
    } else {
      this.write('No mode is logged in. Votes cannot work.');
    }
  }

  private async readFeed(): Promise<void> {
    const reply = await request(this.mode, '/.json?limit=10');
    this.write(`${this.mode}: HTTP ${String(reply.status)}, ${String(reply.ms)} ms, ${reply.rate}`);
    this.feed = parseListing(reply.json);
    this.write(`${String(this.feed.length)} posts read as data. First 3:`);
    for (const post of this.feed.slice(0, 3)) {
      this.write(
        `- [${String(post.score)}] ${post.title} (r/${post.subreddit}, ` +
          `${String(post.numComments)} comments, your vote: ${String(post.likes)})`,
      );
    }
  }

  private targetId(): string | null {
    return postIdFrom(this.target.value);
  }

  private async readPost(id: string): Promise<{ post: Post; commentCount: number; depth: number }> {
    const reply = await request(this.mode, `/comments/${id}/.json?limit=50`);
    this.write(`${this.mode}: HTTP ${String(reply.status)}, ${String(reply.ms)} ms, ${reply.rate}`);
    const thread = parseThread(reply.json);
    const depth = thread.comments.reduce((max, c) => Math.max(max, c.depth), 0);
    for (const comment of thread.comments.slice(0, 3)) {
      const snippet = comment.body.replace(/\s+/g, ' ').slice(0, 70);
      this.write(`  ${'  '.repeat(comment.depth)}u/${comment.author}: ${snippet}`);
    }
    return { post: thread.post, commentCount: thread.comments.length, depth };
  }

  private async readThread(): Promise<void> {
    const id = this.targetId() ?? this.feed[0]?.id ?? null;
    if (!id) {
      this.write('Paste a post URL, or run step 2 first.');
      return;
    }
    const { post, commentCount, depth } = await this.readPost(id);
    this.write(
      `Post "${post.title}" in r/${post.subreddit}: score ${String(post.score)}, ` +
        `your vote ${String(post.likes)}. ${String(commentCount)} comments read ` +
        `(Reddit says ${String(post.numComments)} in all), deepest level ${String(depth)}.`,
    );
  }

  private async vote(dir: VoteDirection): Promise<void> {
    if (!this.me) {
      this.write('Run step 1 first.');
      return;
    }
    const id = this.targetId();
    if (!id) {
      this.write('Paste the URL of the post the owner chose.');
      return;
    }
    const before = (await this.readPost(id)).post;
    const verb = dir === 1 ? 'UPVOTE' : 'REMOVE YOUR VOTE ON';
    const ok = window.confirm(
      `${verb} this post as u/${this.me.name}?\n\n"${before.title}"\nr/${before.subreddit}`,
    );
    if (!ok) {
      this.write('Cancelled. Nothing was sent.');
      return;
    }
    const reply = await request(this.mode, '/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: voteBody(before.fullname, dir, this.me.modhash),
    });
    this.write(
      `vote dir=${String(dir)}: HTTP ${String(reply.status)}, ${String(reply.ms)} ms, ` +
        `reply ${JSON.stringify(reply.json)}, ${reply.rate}`,
    );
    const after = (await this.readPost(id)).post;
    this.write(
      `Your vote before: ${String(before.likes)}, after: ${String(after.likes)}. ` +
        `Score before ${String(before.score)}, after ${String(after.score)} (Reddit may fuzz scores).`,
    );
  }

  private async copyLog(): Promise<void> {
    await navigator.clipboard.writeText(this.log.textContent);
    this.write('Log copied to the clipboard.');
  }
}

/** Shows the panel when the address ends in #unred-spike. */
export function startSpike(): void {
  const check = (): void => {
    if (window.location.hash === SPIKE_HASH && !document.getElementById(PANEL_ID)) {
      new SpikePanel();
    }
  };
  check();
  window.addEventListener('hashchange', check);
}
