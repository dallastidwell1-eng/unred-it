// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { fitToScreenWidth, VIEWPORT_CONTENT } from './viewport';

const viewportTags = () => Array.from(document.querySelectorAll('meta[name="viewport"]'));

afterEach(() => {
  viewportTags().forEach((tag) => {
    tag.remove();
  });
});

describe('fitToScreenWidth', () => {
  it('adds one device-width viewport tag to the head', () => {
    fitToScreenWidth(document);
    const tags = viewportTags();
    expect(tags).toHaveLength(1);
    expect(tags[0]?.getAttribute('content')).toBe(VIEWPORT_CONTENT);
    expect(tags[0]?.parentNode).toBe(document.head);
  });

  it("replaces the page's own viewport tag", () => {
    const theirs = document.createElement('meta');
    theirs.setAttribute('name', 'viewport');
    theirs.setAttribute('content', 'width=1024');
    document.head.append(theirs);
    fitToScreenWidth(document);
    expect(viewportTags().map((tag) => tag.getAttribute('content'))).toEqual([VIEWPORT_CONTENT]);
  });

  it('can run twice: still one tag', () => {
    fitToScreenWidth(document);
    fitToScreenWidth(document);
    expect(viewportTags()).toHaveLength(1);
  });
});
