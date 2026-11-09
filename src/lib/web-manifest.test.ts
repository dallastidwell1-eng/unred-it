import { describe, expect, it } from 'vitest';
import { recolorManifest } from './web-manifest';

describe('recolorManifest (D-069)', () => {
  it('sets both colors and keeps everything else', () => {
    const reddit = JSON.stringify({
      name: 'Reddit',
      start_url: 'https://www.reddit.com/',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'minimal-ui',
      icons: [{ src: './android-icon-192x192.png', sizes: '192x192' }],
    });
    const out = JSON.parse(recolorManifest(reddit, '#1A1A1A')) as Record<string, unknown>;
    expect(out).toEqual({
      name: 'Reddit',
      start_url: 'https://www.reddit.com/',
      theme_color: '#1A1A1A',
      background_color: '#1A1A1A',
      display: 'minimal-ui',
      icons: [{ src: './android-icon-192x192.png', sizes: '192x192' }],
    });
  });

  it('adds the colors to a manifest that has none', () => {
    expect(JSON.parse(recolorManifest('{"name":"R"}', '#FAFAFA'))).toEqual({
      name: 'R',
      theme_color: '#FAFAFA',
      background_color: '#FAFAFA',
    });
  });

  it('leaves anything that is not a JSON object unchanged', () => {
    expect(recolorManifest('<html>error</html>', '#1A1A1A')).toBe('<html>error</html>');
    expect(recolorManifest('[1,2]', '#1A1A1A')).toBe('[1,2]');
    expect(recolorManifest('', '#1A1A1A')).toBe('');
  });
});
