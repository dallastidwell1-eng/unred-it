// Developer preview of the reader with sample data, outside Firefox and Reddit.
// Run: npx vite serve dev-preview. Add ?theme=dark or ?theme=light to force a theme.
// Not part of the extension build.

import '@fontsource-variable/inter';
import '@fontsource-variable/inter-tight';
import type { FeedPage, Post } from '../src/lib/reddit-data';
import type { FeedSource } from '../src/ui/App';
import { mountReader } from '../src/ui/mount';

const NOW_S = Date.now() / 1000;

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
    createdUtc: NOW_S - 3600 * 10,
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

const source: FeedSource = {
  title: 'Home',
  redditUrl: '#',
  async load(after): Promise<FeedPage> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return after ? { posts: PAGE_2, after: null } : { posts: PAGE_1, after: 'page2' };
  },
};

const theme = new URLSearchParams(window.location.search).get('theme');
const host = mountReader(document.body, source, 'Preview with sample data', 'open');
if (theme === 'dark' || theme === 'light') {
  host.dataset.theme = theme;
}
