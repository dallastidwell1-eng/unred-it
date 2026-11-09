// The extension's options page (D-064), opened from Firefox's add-on settings.

import { browser } from 'wxt/browser';
import { DEFAULT_SETTINGS, storageSettingsStore } from '../../lib/settings';
import { mountOptions } from '../../ui/OptionsPage';

const store = storageSettingsStore(browser.storage.sync);
const settings = await store.load().catch(() => DEFAULT_SETTINGS);
const root = document.getElementById('settings-root');
if (root) {
  mountOptions(root, settings, store, {
    version: browser.runtime.getManifest().version,
    // getURL's type only lists files WXT knows about; the fonts come from the build hook.
    fontUrl: (path) => browser.runtime.getURL(path as '/'),
  });
}
