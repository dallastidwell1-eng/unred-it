// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { cleanRedditHtml, safeHref } from './sanitize';

function clean(html: string): HTMLDivElement {
  const box = document.createElement('div');
  box.append(cleanRedditHtml(html, document, new DOMParser()));
  return box;
}

describe('cleanRedditHtml', () => {
  it("keeps Reddit's normal formatting and drops the wrapper", () => {
    const box = clean(
      '<!-- SC_OFF --><div class="md"><p>Hello <strong>bold</strong> and <em>it</em></p>' +
        '<ul><li>one</li></ul><blockquote><p>quote</p></blockquote>' +
        '<pre><code>x = 1</code></pre></div><!-- SC_ON -->',
    );
    expect(box.innerHTML).toBe(
      '<p>Hello <strong>bold</strong> and <em>it</em></p><ul><li>one</li></ul>' +
        '<blockquote><p>quote</p></blockquote><pre><code>x = 1</code></pre>',
    );
  });

  it('removes scripts, styles, frames and images with their content', () => {
    const box = clean(
      '<p>a</p><script>alert(1)</script><style>p{}</style><iframe src="about:blank"></iframe>' +
        '<img src="x" onerror="alert(1)"><svg><script>alert(2)</script></svg>',
    );
    expect(box.innerHTML).toBe('<p>a</p>');
  });

  it('removes event handlers, styles and classes', () => {
    const box = clean('<p onclick="alert(1)" style="color:red" class="x" id="y">a</p>');
    expect(box.innerHTML).toBe('<p>a</p>');
  });

  it('blocks javascript: and data: links but keeps the text', () => {
    const box = clean(
      '<a href="javascript:alert(1)">x</a><a href=" JaVaScRiPt:alert(1)">y</a>' +
        '<a href="data:text/html,hi">z</a>',
    );
    expect(box.querySelectorAll('[href]')).toHaveLength(0);
    expect(box.textContent).toBe('xyz');
  });

  it('makes Reddit-relative links absolute and opens outside links in a new tab', () => {
    const box = clean('<a href="/r/firefox">sub</a><a href="https://example.com/a">ext</a>');
    const [inside, outside] = Array.from(box.querySelectorAll('a'));
    expect(inside?.getAttribute('href')).toBe('https://old.reddit.com/r/firefox');
    expect(inside?.hasAttribute('target')).toBe(false);
    expect(outside?.getAttribute('target')).toBe('_blank');
    expect(outside?.getAttribute('rel')).toBe('noopener noreferrer nofollow');
  });

  it('keeps spoilers as our own class', () => {
    const box = clean('<p><span class="md-spoiler-text">secret</span></p>');
    expect(box.innerHTML).toBe('<p><span class="spoiler">secret</span></p>');
  });

  it('unwraps unknown tags and keeps their text', () => {
    const box = clean('<p><font color="red">x</font><marquee>y</marquee></p>');
    expect(box.innerHTML).toBe('<p>xy</p>');
  });

  it('keeps a valid list start and table alignment, drops bad values', () => {
    const box = clean(
      '<ol start="3"><li>c</li></ol><ol start="x"><li>d</li></ol>' +
        '<table><tr><td align="center">1</td><td align="evil">2</td></tr></table>',
    );
    expect(box.querySelector('ol')?.getAttribute('start')).toBe('3');
    expect(box.querySelectorAll('ol')[1]?.hasAttribute('start')).toBe(false);
    const cells = box.querySelectorAll('td');
    expect(cells[0]?.getAttribute('align')).toBe('center');
    expect(cells[1]?.hasAttribute('align')).toBe(false);
  });

  it('treats escaped text as text', () => {
    const box = clean('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
    expect(box.querySelector('script')).toBeNull();
    expect(box.textContent).toBe('<script>alert(1)</script>');
  });
});

describe('safeHref', () => {
  it('accepts web links only', () => {
    expect(safeHref('https://example.com/')).toBe('https://example.com/');
    expect(safeHref('http://example.com/')).toBe('http://example.com/');
    expect(safeHref('/u/someone')).toBe('https://old.reddit.com/u/someone');
    expect(safeHref('mailto:a@b.c')).toBeNull();
    expect(safeHref('')).toBeNull();
  });
});
