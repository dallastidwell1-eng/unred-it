// OQ-011 data spike (M1). Temporary: remove before M2.
import { defineContentScript } from 'wxt/utils/define-content-script';
import { startSpike } from '../spike/spike-panel';

export default defineContentScript({
  matches: ['https://old.reddit.com/*'],
  runAt: 'document_idle',
  main() {
    startSpike();
  },
});
