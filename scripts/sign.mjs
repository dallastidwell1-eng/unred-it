// Signs the Firefox build on addons.mozilla.org (AMO) with the owner's own API keys.
//
// Usage (the owner runs this; D-007: Claude never handles the keys):
//   npm run sign:unlisted   -> a signed .xpi for installing from file (phone tests, M2)
//   npm run sign:listed     -> submits a public listing version (M8; needs owner approval, D-009)
//
// The keys are read from the environment variables WEB_EXT_API_KEY and
// WEB_EXT_API_SECRET, which web-ext reads itself. This script never prints them.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const channel = process.argv[2];

if (channel !== 'unlisted' && channel !== 'listed') {
  console.error('Usage: node scripts/sign.mjs <unlisted|listed>');
  process.exit(2);
}

const missing = ['WEB_EXT_API_KEY', 'WEB_EXT_API_SECRET'].filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing ${missing.join(' and ')}. Set them in this terminal first.`);
  console.error('See docs/releasing.md, "Set your keys for one terminal session".');
  process.exit(2);
}

const { name, version } = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

/** Runs a command; stops the whole script if it fails. */
function run(label, command, args, options = {}) {
  console.log(`\n== ${label}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', ...options });
  if (result.status !== 0) {
    console.error(`\n${label} failed (exit ${String(result.status)}). Nothing more was sent.`);
    process.exit(result.status ?? 1);
  }
}

const bin = (relative) => path.join(root, 'node_modules', relative);

// 1. Every check CI runs, so a broken build is never sent to AMO.
//    (shell: true lets Windows find npm.cmd; the arguments are fixed text.)
run('Checks (npm run check)', 'npm', ['run', 'check'], { shell: true });

// 2. The extension zip and the sources zip for reviewers.
run('Zip (wxt zip)', process.execPath, [bin('wxt/bin/wxt.mjs'), 'zip', '-b', 'firefox']);

const sources = path.join(root, '.output', `${name}-${version}-sources.zip`);
if (!existsSync(sources)) {
  console.error(`Sources zip not found: ${sources}`);
  process.exit(1);
}

// 3. Sign. web-ext reads the keys from the environment.
const signArgs = [
  bin('web-ext/bin/web-ext.js'),
  'sign',
  '--channel',
  channel,
  '--source-dir',
  path.join(root, '.output', 'firefox-mv3'),
  '--upload-source-code',
  sources,
  '--artifacts-dir',
  path.join(root, 'web-ext-artifacts'),
];
if (channel === 'listed') {
  const metadata = path.join(root, 'amo-metadata.json');
  if (existsSync(metadata)) {
    signArgs.push('--amo-metadata', metadata);
  }
}
run(`Sign version ${version} (${channel})`, process.execPath, signArgs);

console.log(`\nDone. Signed files are in ${path.join(root, 'web-ext-artifacts')}.`);
