import { resolve } from 'node:path';
import { defineConfig } from 'wxt';

// Bundled fonts (D-051), copied from their npm packages into the extension.
const FONT_FILES: [string, string][] = [
  ['@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'fonts/inter-latin.woff2'],
  [
    '@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2',
    'fonts/inter-latin-ext.woff2',
  ],
  [
    '@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2',
    'fonts/inter-tight-latin.woff2',
  ],
];

// Unred It build configuration. Decisions: D-004 (Firefox, AMO), D-005 (WXT),
// D-045 (add-on ID), D-046 (Manifest V3).
export default defineConfig({
  srcDir: 'src',
  // Explicit imports only: every file says where its names come from.
  imports: false,
  manifestVersion: 3,
  hooks: {
    'build:publicAssets': (_wxt, files) => {
      for (const [from, to] of FONT_FILES) {
        files.push({ absoluteSrc: resolve('node_modules', from), relativeDest: to });
      }
    },
  },
  // The sources zip is for AMO reviewers (OQ-001): only what builds the extension.
  zip: {
    excludeSources: [
      'handoff/**',
      'design/**',
      'references/**',
      'scripts/sign.mjs',
      'dev-preview/**',
      '.claude/**',
      '.github/**',
      'CLAUDE.md',
    ],
  },
  manifest: {
    name: 'Unred It',
    description: 'A clean, single-column reader for old.reddit.com, in your own logged-in browser.',
    icons: {
      48: 'icon.svg',
      96: 'icon.svg',
      128: 'icon.svg',
    },
    permissions: ['storage'],
    // Reddit hosts only. D-027 sends every reddit.com link to our reader.
    host_permissions: [
      'https://old.reddit.com/*',
      'https://www.reddit.com/*',
      'https://reddit.com/*',
      // Reddit's own video host, for videos with sound (D-054).
      'https://v.redd.it/*',
    ],
    // Firefox refuses a content script's fetch of the extension's own files
    // unless they are listed here ("NetworkError", owner test session 003).
    // Only the fonts, only for old.reddit.com. Each install has its own random
    // moz-extension address, so pages cannot use this to detect the add-on.
    web_accessible_resources: [
      {
        resources: ['fonts/*'],
        matches: ['https://old.reddit.com/*'],
      },
    ],
    browser_specific_settings: {
      gecko: {
        id: 'unred-it@praxisdesignworks',
        strict_min_version: '140.0',
        data_collection_permissions: {
          required: ['none'],
        },
      },
      gecko_android: {
        strict_min_version: '142.0',
      },
    },
  },
});
