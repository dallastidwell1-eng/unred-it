// What a feed card shows under its title (layout-spec 5.3): one picture, a
// two-line text excerpt, or a link chip; or nothing (a text post with no text).

import type { Post } from './reddit-data';

export type CardContent =
  | {
      kind: 'image';
      url: string;
      width: number;
      height: number;
      /** A video post: the picture is its first frame. */
      video: boolean;
      /** A gallery post: how many pictures it has; 0 otherwise. */
      galleryCount: number;
    }
  | { kind: 'text'; excerpt: string }
  | { kind: 'link'; domain: string }
  | { kind: 'none' };

/** The excerpt is cut near this many characters; CSS shows two lines of it. */
export const EXCERPT_MAX = 280;

/**
 * Picks the card's content. Pictures show only where Reddit itself would show
 * a thumbnail in a feed: not for spoilers or posts with no thumbnail, nor for
 * NSFW posts when the user's Reddit setting hides their thumbnails (Reddit
 * then sends no https thumbnail). NSFW posts with a thumbnail show their
 * picture like any other (D-067).
 */
export function cardContent(post: Post, parser: DOMParser): CardContent {
  const image = cardImage(post);
  if (image) {
    return image;
  }
  if (post.isSelf) {
    const excerpt = post.selftextHtml ? textExcerpt(post.selftextHtml, parser) : '';
    return excerpt ? { kind: 'text', excerpt } : { kind: 'none' };
  }
  return { kind: 'link', domain: post.domain.replace(/^www\./, '') };
}

function cardImage(post: Post): CardContent | null {
  if (post.thumbnailUrl === null) {
    return null;
  }
  const isMedia =
    post.postHint === 'image' ||
    post.postHint === 'hosted:video' ||
    post.video !== null ||
    post.isGallery;
  if (!isMedia) {
    return null;
  }
  const galleryCount = post.gallery?.length ?? 0;
  // A gallery has no preview of its own: use its first still picture.
  const picture = post.previewImage ?? post.gallery?.find((item) => !item.isVideo) ?? null;
  if (!picture) {
    return null;
  }
  return {
    kind: 'image',
    url: picture.url,
    width: picture.width,
    height: picture.height,
    video: post.video !== null || post.postHint === 'hosted:video',
    galleryCount,
  };
}

/** Block elements: their text is kept apart from the next block's with a space. */
const BLOCKS = 'p, li, blockquote, h1, h2, h3, h4, h5, h6, td, th, br, hr';

/**
 * Plain text from Reddit's post HTML, for the card excerpt. The HTML is
 * parsed into an inert document (no scripts run, nothing is shown); only its
 * text comes out. Spoilers become "[spoiler]" so they are never given away;
 * code blocks and tables are left out.
 */
export function textExcerpt(html: string, parser: DOMParser): string {
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('pre, table, script, style, noscript, template').forEach((element) => {
    element.remove();
  });
  doc.querySelectorAll('.md-spoiler-text').forEach((element) => {
    element.replaceWith(doc.createTextNode('[spoiler]'));
  });
  doc.querySelectorAll(BLOCKS).forEach((element) => {
    element.after(doc.createTextNode(' '));
  });
  const text = doc.body.textContent.replace(/\s+/g, ' ').trim();
  return shorten(text, EXCERPT_MAX);
}

/** Cuts the text at a word boundary near `max` characters and adds "…". */
export function shorten(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}
