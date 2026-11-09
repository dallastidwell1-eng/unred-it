// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { cardContent, EXCERPT_MAX, shorten, textExcerpt } from './card';
import { parseListing } from './reddit-data';

const parser = new DOMParser();

function one(data: Record<string, unknown>) {
  const [post] = parseListing({
    kind: 'Listing',
    data: { children: [{ kind: 't3', data: { name: 't3_x', title: 'T', ...data } }] },
  });
  if (!post) {
    throw new Error('no post');
  }
  return post;
}

const preview = {
  images: [{ source: { url: 'https://preview.redd.it/a.jpg?s=1', width: 640, height: 480 } }],
};
const thumbnail = 'https://b.thumbs.redditmedia.com/t.jpg';

describe('cardContent', () => {
  it('shows the preview picture of an image post', () => {
    const post = one({ post_hint: 'image', thumbnail, preview, domain: 'i.redd.it' });
    expect(cardContent(post, parser)).toEqual({
      kind: 'image',
      url: 'https://preview.redd.it/a.jpg?s=1',
      width: 640,
      height: 480,
      video: false,
      galleryCount: 0,
    });
  });

  it('marks a Reddit video', () => {
    const post = one({ post_hint: 'hosted:video', is_video: true, thumbnail, preview });
    expect(cardContent(post, parser)).toMatchObject({ kind: 'image', video: true });
  });

  it('never shows a picture for an NSFW post', () => {
    const post = one({
      post_hint: 'image',
      over_18: true,
      thumbnail: 'nsfw',
      preview,
      domain: 'i.redd.it',
    });
    expect(cardContent(post, parser)).toEqual({ kind: 'link', domain: 'i.redd.it' });
  });

  it('shows no picture where Reddit shows no thumbnail (spoilers)', () => {
    const post = one({ post_hint: 'image', thumbnail: 'spoiler', preview, domain: 'i.redd.it' });
    expect(cardContent(post, parser).kind).toBe('link');
  });

  it('uses the first still picture of a gallery and counts its pictures', () => {
    const post = one({
      is_gallery: true,
      thumbnail,
      gallery_data: { items: [{ media_id: 'a' }, { media_id: 'b' }] },
      media_metadata: {
        a: {
          status: 'valid',
          e: 'Image',
          s: { u: 'https://preview.redd.it/a.jpg', x: 800, y: 600 },
        },
        b: {
          status: 'valid',
          e: 'Image',
          s: { u: 'https://preview.redd.it/b.jpg', x: 800, y: 600 },
        },
      },
    });
    const content = cardContent(post, parser);
    expect(content).toMatchObject({ kind: 'image', galleryCount: 2 });
  });

  it('shows a link chip with the site name for a link post', () => {
    const post = one({ post_hint: 'link', thumbnail, preview, domain: 'www.example.com' });
    expect(cardContent(post, parser)).toEqual({ kind: 'link', domain: 'example.com' });
  });

  it('shows an excerpt for a text post, and nothing when it has no text', () => {
    const text = one({
      is_self: true,
      selftext_html: '<div class="md"><p>Hello <strong>there</strong>.</p></div>',
    });
    expect(cardContent(text, parser)).toEqual({ kind: 'text', excerpt: 'Hello there.' });
    expect(cardContent(one({ is_self: true, selftext_html: null }), parser)).toEqual({
      kind: 'none',
    });
  });
});

describe('textExcerpt', () => {
  it('keeps blocks apart and joins the whitespace', () => {
    const html = '<div class="md"><p>First\nline.</p><ul><li>One</li><li>Two</li></ul></div>';
    expect(textExcerpt(html, parser)).toBe('First line. One Two');
  });

  it('hides spoilers and leaves out code blocks and tables', () => {
    const html =
      '<p>It was <span class="md-spoiler-text">the butler</span>.</p>' +
      '<pre><code>x = 1</code></pre><table><tr><td>cell</td></tr></table><p>End.</p>';
    expect(textExcerpt(html, parser)).toBe('It was [spoiler]. End.');
  });

  it('gives text only: tags and scripts never come through', () => {
    const html = '<p>Safe &amp; sound</p><script>alert(1)</script><img src=x onerror="alert(2)">';
    expect(textExcerpt(html, parser)).toBe('Safe & sound');
  });

  it('cuts long text', () => {
    const html = `<p>${'word '.repeat(200)}</p>`;
    const excerpt = textExcerpt(html, parser);
    expect(excerpt.length).toBeLessThanOrEqual(EXCERPT_MAX + 1);
    expect(excerpt.endsWith('word…')).toBe(true);
  });
});

describe('shorten', () => {
  it('leaves short text alone', () => {
    expect(shorten('short', 10)).toBe('short');
  });

  it('cuts at a space when one is near the end, otherwise at the limit', () => {
    expect(shorten('alpha beta gamma', 12)).toBe('alpha beta…');
    expect(shorten('abcdefghijklmnop', 8)).toBe('abcdefgh…');
  });
});
