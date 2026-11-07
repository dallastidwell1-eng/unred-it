// Cleans Reddit's post and comment HTML (selftext_html, body_html) with an
// allow-list (D-052). The browser parses the text into an inert document
// (scripts never run there); we then rebuild only safe parts with
// createElement. No innerHTML anywhere.

/** Tags kept as they are (their allowed attributes are listed in ATTRIBUTES). */
const KEEP = new Set([
  'p',
  'br',
  'hr',
  'em',
  'strong',
  'del',
  's',
  'sup',
  'sub',
  'code',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
]);

/** Tags removed together with everything inside them. */
const DROP = new Set([
  'script',
  'style',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'img',
  'picture',
  'video',
  'audio',
  'source',
  'track',
  'svg',
  'math',
  'template',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'noscript',
  'link',
  'meta',
  'base',
  'head',
  'title',
]);

const ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title'],
  ol: ['start'],
  th: ['align'],
  td: ['align'],
};

/** Reddit's own address for relative links like "/r/firefox". */
const REDDIT_ORIGIN = 'https://old.reddit.com';

/** A safe absolute link, or null for javascript:, data: and anything odd. */
export function safeHref(href: string): string | null {
  const text = href.trim();
  if (!text) {
    return null;
  }
  try {
    const url = new URL(text, REDDIT_ORIGIN);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

function isRedditHost(href: string): boolean {
  const { hostname } = new URL(href);
  return hostname === 'reddit.com' || hostname.endsWith('.reddit.com');
}

function copyChildren(from: Node, to: Node, doc: Document): void {
  for (const child of Array.from(from.childNodes)) {
    const clean = cleanNode(child, doc);
    if (clean) {
      to.appendChild(clean);
    }
  }
}

function cleanNode(node: Node, doc: Document): Node | null {
  if (node.nodeType === 3) {
    return doc.createTextNode(node.textContent ?? '');
  }
  if (node.nodeType !== 1) {
    return null; // comments and anything else
  }
  const source = node as Element;
  const tag = source.tagName.toLowerCase();

  if (DROP.has(tag)) {
    return null;
  }

  // Reddit marks spoilers with <span class="md-spoiler-text">.
  if (tag === 'span' && source.classList.contains('md-spoiler-text')) {
    const spoiler = doc.createElement('span');
    spoiler.className = 'spoiler';
    copyChildren(source, spoiler, doc);
    return spoiler;
  }

  if (!KEEP.has(tag)) {
    // Unknown or wrapper tags (div, span, font, ...): keep only their content.
    const fragment = doc.createDocumentFragment();
    copyChildren(source, fragment, doc);
    return fragment;
  }

  const clean = doc.createElement(tag);
  for (const name of ATTRIBUTES[tag] ?? []) {
    const value = source.getAttribute(name);
    if (value === null) {
      continue;
    }
    if (name === 'href') {
      const href = safeHref(value);
      if (href) {
        clean.setAttribute('href', href);
        if (!isRedditHost(href)) {
          clean.setAttribute('target', '_blank');
          clean.setAttribute('rel', 'noopener noreferrer nofollow');
        }
      }
    } else if (name === 'start') {
      if (/^\d{1,6}$/.test(value)) {
        clean.setAttribute('start', value);
      }
    } else if (name === 'align') {
      if (['left', 'right', 'center'].includes(value)) {
        clean.setAttribute('align', value);
      }
    } else {
      clean.setAttribute(name, value.slice(0, 300));
    }
  }
  copyChildren(source, clean, doc);
  return clean;
}

/**
 * Turns Reddit's HTML into a clean fragment owned by `doc`, ready to append.
 * `parser` is the browser's DOMParser (passed in so tests can supply one).
 */
export function cleanRedditHtml(html: string, doc: Document, parser: DOMParser): DocumentFragment {
  const inert = parser.parseFromString(html, 'text/html');
  const fragment = doc.createDocumentFragment();
  copyChildren(inert.body, fragment, doc);
  return fragment;
}
