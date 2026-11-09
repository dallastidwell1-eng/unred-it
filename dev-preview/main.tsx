// Developer preview of the reader with sample data, outside Firefox and Reddit.
// Run: npx vite serve dev-preview. ?theme=dark|light|device and ?view=card|compact
// set those settings; ?page=options shows the extension's options page.
// Not part of the extension build.

import '@fontsource-variable/inter';
import '@fontsource-variable/inter-tight';
import type { CommentNode, ThreadItem } from '../src/lib/comments';
import { feedTitle, searchInfo } from '../src/lib/feed-route';
import { postRoute } from '../src/lib/reddit-links';
import type { Community, FeedPage, Post } from '../src/lib/reddit-data';
import { sortSubreddits, type Subreddit } from '../src/lib/subreddits';
import { storageOpenedStore } from '../src/lib/opened-posts';
import {
  parseTheme,
  storageSettingsStore,
  type Settings,
  type StorageAreaLike,
} from '../src/lib/settings';
import { parseView } from '../src/lib/view-setting';
import type { FeedSource } from '../src/ui/App';
import { mountReader } from '../src/ui/mount';
import { mountOptions } from '../src/ui/OptionsPage';

const NOW_S = Date.now() / 1000;

// ?feed=/r/books/ (or a search such as /search?q=pan) pretends to be that
// page; ?subs=none|error shows the picker's empty and error states;
// ?account=none shows the logged-out bar, ?account=read one with no unread.
const params = new URLSearchParams(window.location.search);
const PAGE = new URL(params.get('feed') ?? '/', window.location.origin);
// A post address such as /r/books/comments/sample3/x/c2/ opens that sample
// post's comments over r/books (D-027).
const DIRECT = postRoute(PAGE.pathname, PAGE.search);
const FEED = DIRECT ? (DIRECT.subreddit ? `/r/${DIRECT.subreddit}/` : '/') : PAGE.pathname;
const SEARCH = DIRECT ? null : searchInfo(PAGE.pathname, PAGE.search);

const SAMPLE_SUBS: Subreddit[] = sortSubreddits(
  [
    'AskHistorians',
    'astrophotography',
    'books',
    'Cooking',
    'DIY',
    'firefox',
    'gardening',
    'LandscapePhotography',
    'linux',
    'NoStupidQuestions',
    'photography',
    'science',
    'space',
    'technology',
    'todayilearned',
    'woodworking',
    'worldnews',
    'zerowaste',
  ].map((name) => ({ name, over18: false })),
);

function tile(color: string, label: string, width = 128, height = 128): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${String(width)}" height="${String(height)}"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="52%" font-size="20" text-anchor="middle" fill="#888" font-family="sans-serif">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const SAMPLE_TEXT =
  '<!-- SC_OFF --><div class="md"><p>Here is a text post with <strong>bold</strong>, <em>italic</em> and a <a href="https://example.com/">link</a>.</p>' +
  '<blockquote><p>A quoted line from another comment.</p></blockquote>' +
  '<ul><li>First point</li><li>Second point with <code>inline code</code></li></ul>' +
  '<pre><code>const answer = 42;</code></pre>' +
  '<p>The ending is a <span class="md-spoiler-text">hidden spoiler</span>.</p>' +
  '<script>alert("this must never run")</script><p onclick="alert(1)">Last paragraph.</p></div><!-- SC_ON -->';

let counter = 0;
function post(partial: Partial<Post>): Post {
  counter += 1;
  return {
    fullname: `t3_sample${String(counter)}`,
    id: `sample${String(counter)}`,
    title: 'Sample post',
    subreddit: 'firefox',
    author: 'someone',
    score: 120,
    numComments: 14,
    permalink: '#',
    url: '#',
    likes: null,
    saved: false,
    createdUtc: NOW_S - 3600 * 3,
    isSelf: false,
    domain: 'example.com',
    over18: false,
    stickied: false,
    thumbnailUrl: null,
    selftextHtml: null,
    postHint: '',
    previewImage: null,
    isVideo: false,
    isGallery: false,
    video: null,
    gallery: null,
    ...partial,
  };
}

const PAGE_1: Post[] = [
  post({
    title: 'Weekly thread: share what you are reading this week',
    subreddit: 'books',
    stickied: true,
    isSelf: true,
    score: 87,
    numComments: 312,
    createdUtc: NOW_S - 86400 * 2,
  }),
  post({
    title: 'A cargo plane with no windows, photographed at sunrise',
    subreddit: 'aviation',
    score: 993,
    numComments: 53,
    thumbnailUrl: tile('#3A3C40', 'img'),
    postHint: 'image',
    previewImage: { url: tile('#3A3C40', 'image 1080 x 720', 1080, 720), width: 1080, height: 720 },
    createdUtc: NOW_S - 3600 * 5,
  }),
  post({
    title:
      'As an exercise in method, if a fictional history were real, how would historians separate the facts from the legends?',
    subreddit: 'AskHistorians',
    isSelf: true,
    score: 405,
    numComments: 8,
    likes: true,
    selftextHtml: SAMPLE_TEXT,
    createdUtc: NOW_S - 3600 * 8,
  }),
  post({
    title: 'Why is toasting a bagel considered a faux pas in some cities?',
    subreddit: 'NoStupidQuestions',
    isSelf: true,
    score: 921,
    numComments: 701,
    likes: false,
  }),
  post({
    title: 'The long road to a faster, quieter browser engine',
    subreddit: 'technology',
    score: 16_400,
    numComments: 995,
    domain: 'example.org',
    url: 'https://example.org/article',
    postHint: 'link',
    previewImage: { url: tile('#2E3540', 'article image', 640, 336), width: 640, height: 336 },
    createdUtc: NOW_S - 3600 * 9,
  }),
  post({
    title: 'Under the bridge, late autumn (video)',
    subreddit: 'pics',
    isVideo: true,
    postHint: 'hosted:video',
    score: 208,
    numComments: 6,
    thumbnailUrl: tile('#2B3340', 'img'),
    previewImage: { url: tile('#2B3340', 'video frame', 1280, 720), width: 1280, height: 720 },
    createdUtc: NOW_S - 3600 * 10,
  }),
  post({
    title: 'A gallery of three pictures',
    subreddit: 'photography',
    isGallery: true,
    score: 77,
    numComments: 3,
    thumbnailUrl: tile('#3A3C40', 'img'),
    gallery: [
      {
        url: tile('#3A3C40', 'picture 1 (wide)', 1080, 720),
        width: 1080,
        height: 720,
        caption: 'A wide one',
        isVideo: false,
      },
      {
        url: tile('#2B3340', 'picture 2 (tall)', 720, 1080),
        width: 720,
        height: 1080,
        caption: '',
        isVideo: false,
      },
      {
        url: tile('#33363B', 'picture 3', 1000, 1000),
        width: 1000,
        height: 1000,
        caption: 'Square',
        isVideo: false,
      },
    ],
  }),
  post({
    title: 'Sensitive post example',
    subreddit: 'example',
    over18: true,
    score: 218,
    numComments: 5,
    createdUtc: NOW_S - 3600 * 11,
  }),
];

const PAGE_2: Post[] = Array.from({ length: 6 }, (_, i) =>
  post({
    title: `Second page post ${String(i + 1)}: loaded by endless scrolling`,
    subreddit: 'test',
    score: 50 + i * 37,
    numComments: i * 4,
    createdUtc: NOW_S - 3600 * (12 + i),
    thumbnailUrl: i % 2 ? tile('#33363B', String(i + 1)) : null,
  }),
);

let commentCounter = 0;
function comment(
  author: string,
  html: string,
  partial: Partial<CommentNode> = {},
  replies: ThreadItem[] = [],
): CommentNode {
  commentCounter += 1;
  const id = `c${String(commentCounter)}`;
  return {
    kind: 'comment',
    fullname: `t1_${id}`,
    id,
    author,
    bodyHtml: `<div class="md">${html}</div>`,
    score: 12,
    scoreHidden: false,
    likes: null,
    saved: false,
    createdUtc: NOW_S - 3600 * 2,
    depth: 0,
    isSubmitter: false,
    distinguished: '',
    stickied: false,
    collapsed: false,
    permalink: '#',
    replies,
    ...partial,
  };
}

function sampleThread(): ThreadItem[] {
  commentCounter = 0;
  return [
    comment('helpful_mod', '<p>Please keep the discussion civil. Rule 2 applies.</p>', {
      distinguished: 'moderator',
      stickied: true,
      score: 1,
    }),
    comment(
      'first_reader',
      '<p>This is the top comment. It has <strong>formatting</strong>, a <a href="https://example.com">link</a>, and a quote:</p><blockquote><p>Quoted text from the post.</p></blockquote>',
      { score: 1234, likes: true },
      [
        comment(
          'someone',
          '<p>The post author answers here; their name shows in blue.</p>',
          { isSubmitter: true, depth: 1, score: 456 },
          [
            comment('third_level', '<p>A reply two levels deep.</p>', { depth: 2, score: 88 }, [
              {
                kind: 'more',
                id: 'deep',
                parentFullname: 't1_c5',
                count: 0,
                children: [],
                depth: 3,
              },
            ]),
          ],
        ),
        comment('another_voice', '<p>A second reply to the top comment.</p>', {
          depth: 1,
          score: 31,
          likes: false,
        }),
        {
          kind: 'more',
          id: 'more1',
          parentFullname: 't1_c2',
          count: 7,
          children: ['x1', 'x2'],
          depth: 1,
        },
      ],
    ),
    comment(
      'low_score',
      '<p>Reddit already folded this one because of its score.</p>',
      { collapsed: true, score: -9 },
      [comment('hidden_reply', '<p>Hidden with its parent.</p>', { depth: 1 })],
    ),
    comment('last_word', '<p>A short last comment.</p>', { score: 3, scoreHidden: true }),
  ];
}

/** The comment with this id and its replies, searched through the sample thread. */
function findComment(items: ThreadItem[], id: string): CommentNode | null {
  for (const item of items) {
    if (item.kind !== 'comment') {
      continue;
    }
    if (item.id === id) {
      return item;
    }
    const inside = findComment(item.replies, id);
    if (inside) {
      return inside;
    }
  }
  return null;
}

const source: FeedSource = {
  async loadThread(_post, _sort, focus) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const thread = sampleThread();
    const found = focus ? findComment(thread, focus.commentId) : null;
    return found ? [{ ...found, depth: 0 }] : thread;
  },
  direct: DIRECT,
  async loadPost(postId) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const found = [...PAGE_1, ...PAGE_2].find((p) => p.id === postId);
    if (!found) {
      throw new Error('HTTP 404 (sample)');
    }
    return found;
  },
  async loadMore(_post, more) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const depth = more.depth;
    return [
      comment('loaded_later', `<p>Loaded by "${more.id}".</p>`, { depth }),
      comment('loaded_too', '<p>One more loaded reply.</p>', { depth }),
    ];
  },
  // A pretend vote: one sample post shows what a refused vote looks like.
  async vote(fullname) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (fullname === 't3_sample4') {
      throw new Error('Reddit refused: TOO_OLD (sample)');
    }
  },
  // Pretend save, comment and reply (D-063). Saving sample post 4 is refused,
  // and a comment that says "fail" is refused, to show the error states.
  async save(fullname) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (fullname === 't3_sample4') {
      throw new Error('Reddit refused: TOO_OLD (sample)');
    }
  },
  async comment(_parent, text) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (text.trim().toLowerCase() === 'fail') {
      throw new Error('Reddit refused: RATELIMIT (sample)');
    }
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const paragraphs = escaped
      .split(/\n{2,}/)
      .map((part) => `<p>${part}</p>`)
      .join('');
    return comment('sample_reader', paragraphs, { score: 1, likes: true, createdUtc: NOW_S });
  },
  title: feedTitle(FEED),
  path: FEED,
  search: SEARCH,
  async loadAccount() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const mode = params.get('account');
    if (mode === 'none') {
      return null;
    }
    return { name: 'sample_reader', unread: mode === 'read' ? 0 : 2 };
  },
  async loadSubreddits() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (params.get('subs') === 'error') {
      throw new Error('HTTP 403 (sample)');
    }
    return params.get('subs') === 'none' ? [] : SAMPLE_SUBS;
  },
  // The preview has no Reddit pages: it reloads itself showing the new feed's name.
  openFeed(path) {
    params.set('feed', path);
    window.location.replace(`?${params.toString()}`);
  },
  redditUrl: '#',
  async load(after): Promise<FeedPage> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (SEARCH) {
      // A pretend search: sample posts whose title holds the words.
      const words = SEARCH.query.toLowerCase();
      const hits = [...PAGE_1, ...PAGE_2].filter((p) => p.title.toLowerCase().includes(words));
      const communities: Community[] = [
        { kind: 'subreddit', name: 'AskHistorians', description: 'The Portal for Public History.' },
        { kind: 'subreddit', name: 'askhistorians_NSFW', description: '' },
        { kind: 'user', name: 'askhistorians', description: '' },
      ];
      return { posts: hits, after: null, communities: words === 'zzz' ? [] : communities };
    }
    return after ? { posts: PAGE_2, after: null } : { posts: PAGE_1, after: 'page2' };
  },
};

// The settings (M6) in this page's localStorage, standing in for Firefox Sync
// storage (browser.storage.sync) through the real stores. A change shows in
// this tab and in other preview tabs. ?view=card|compact and
// ?theme=dark|light|device set those settings on load.
type Changes = Record<string, { newValue?: unknown }>;
const PREFIX = 'unred:';
const listeners = new Set<(changes: Changes) => void>();
const previewArea: StorageAreaLike = {
  get(keys) {
    const found: Record<string, unknown> = {};
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw !== null) {
        found[key] = JSON.parse(raw) as unknown;
      }
    }
    return Promise.resolve(found);
  },
  set(items) {
    const changes: Changes = {};
    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      changes[key] = { newValue: value };
    }
    listeners.forEach((listener) => {
      listener(changes);
    });
    return Promise.resolve();
  },
  onChanged: {
    addListener: (listener) => listeners.add(listener),
    removeListener: (listener) => listeners.delete(listener),
  },
};
window.addEventListener('storage', (event) => {
  if (event.key?.startsWith(PREFIX)) {
    const value = event.newValue === null ? undefined : (JSON.parse(event.newValue) as unknown);
    listeners.forEach((listener) => {
      listener({ [event.key?.slice(PREFIX.length) ?? '']: { newValue: value } });
    });
  }
});

const settingsStore = storageSettingsStore(previewArea);
const asked: Partial<Settings> = {};
if (params.get('view')) {
  asked.view = parseView(params.get('view'));
}
if (params.get('theme')) {
  asked.theme = parseTheme(params.get('theme'));
}
await settingsStore.save(asked);

if (params.get('page') === 'options') {
  // The extension's options page (D-064), as Firefox's add-on settings open it.
  mountOptions(document.body, await settingsStore.load(), settingsStore, { version: '0.0.0' });
} else {
  source.settings = await settingsStore.load();
  source.settingsStore = settingsStore;
  source.openedStore = storageOpenedStore(previewArea);
  source.opened = await source.openedStore.load();
  source.version = '0.0.0 (preview)';
  mountReader(document.body, source, 'Preview with sample data', 'open');
}
