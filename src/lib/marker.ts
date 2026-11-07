// The M1 "it is running" marker: a small badge on old.reddit.com pages.
// Colors come from design/color-spec.md (Deep ground, brick red accent).

export const MARKER_ID = 'unred-it-marker';

/** True when the URL is a page the marker should appear on. */
export function isOldRedditPage(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && hostname === 'old.reddit.com';
  } catch {
    return false;
  }
}

/** Adds the marker to the page once. Returns the marker element. */
export function showMarker(doc: Document): HTMLElement {
  const existing = doc.getElementById(MARKER_ID);
  if (existing) {
    return existing;
  }

  const marker = doc.createElement('div');
  marker.id = MARKER_ID;
  marker.setAttribute('role', 'status');
  marker.setAttribute('aria-label', 'Unred It is running');
  marker.title = 'Unred It is running';
  Object.assign(marker.style, {
    position: 'fixed',
    right: '12px',
    bottom: '12px',
    zIndex: '2147483647',
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#1A1A1A',
    color: '#EDEDED',
    font: '600 13px/1 system-ui, sans-serif',
    letterSpacing: '-0.02em',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
    pointerEvents: 'none',
  });

  const before = doc.createTextNode('un');
  const red = doc.createElement('span');
  red.textContent = 'red';
  red.style.color = '#E5736B';
  const after = doc.createTextNode(' it');
  marker.append(before, red, after);

  doc.body.append(marker);
  return marker;
}
