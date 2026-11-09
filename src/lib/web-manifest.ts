// Reddit's web app manifest (the "app settings" file old.reddit.com points
// to) sets theme_color and background_color to white, and Firefox for
// Android colors the bars around a home-screen shortcut from it (owner's
// phone test, session 005). D-069: the add-on changes those two colors, and
// nothing else, to the reader's background.

/** The manifest old.reddit.com links to, and other manifests on Reddit's static host. */
export const MANIFEST_URLS = ['https://www.redditstatic.com/*/manifest.json'];

/**
 * The manifest text with both colors set to `color`. Text that is not a JSON
 * object comes back unchanged, so a change at Reddit can never break the page.
 */
export function recolorManifest(text: string, color: string): string {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return text;
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return text;
  }
  return JSON.stringify({ ...data, theme_color: color, background_color: color });
}
