// Phone layout for the reader. old.reddit.com's pages carry no viewport tag,
// so a phone browser lays them out about 980 px wide and shrinks them to fit,
// and Firefox enlarges long text ("font inflation"). The reader is built for
// the screen's own width, so it says so (owner's phone test, session 004).

export const VIEWPORT_CONTENT = 'width=device-width, initial-scale=1';

/**
 * Makes the page's only viewport tag ours. Call it again once the page's
 * head exists: it moves our tag into the head and removes any other viewport
 * tag the page has added since.
 */
export function fitToScreenWidth(doc: Document): void {
  const tags = Array.from(doc.querySelectorAll('meta[name="viewport"]'));
  const ours =
    tags.find((tag) => tag.getAttribute('content') === VIEWPORT_CONTENT) ??
    doc.createElement('meta');
  for (const tag of tags) {
    if (tag !== ours) {
      tag.remove();
    }
  }
  ours.setAttribute('name', 'viewport');
  ours.setAttribute('content', VIEWPORT_CONTENT);
  // At document_start the head may not exist yet: the root element holds the
  // tag until then.
  const parent = (doc.head as HTMLHeadElement | null) ?? doc.documentElement;
  if (ours.parentNode !== parent) {
    parent.prepend(ours);
  }
}
