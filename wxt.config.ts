import { defineConfig } from 'wxt';

// Unred It build configuration. Decisions: D-004 (Firefox, AMO), D-005 (WXT),
// D-045 (add-on ID), D-046 (Manifest V3).
export default defineConfig({
  srcDir: 'src',
  // Explicit imports only: every file says where its names come from.
  imports: false,
  manifestVersion: 3,
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
