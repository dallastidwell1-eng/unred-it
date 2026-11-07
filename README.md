# Unred It

A Firefox extension that turns old.reddit.com into a clean, single-column reader, inside your own logged-in browser.

- No Reddit API keys, no server, no data collection. Everything runs in your browser, on your own Reddit session.
- Firefox desktop and Firefox for Android.
- Status: early development. Not yet on addons.mozilla.org.

## Build from source (also for AMO reviewers)

The extension is TypeScript, bundled by WXT and Vite. To make an identical copy of the submitted build:

- Operating system: any (developed on Windows 11; CI builds on Ubuntu).
- Node.js 24 (developed with 24.13.0; the AMO default 24.14.0 also works) and npm 11 (comes with Node).
- All other tools are dev dependencies at the exact versions in `package-lock.json`. Nothing is downloaded at build time.

```bash
npm ci
npm run build
```

The extension is written to `.output/firefox-mv3/`. `npm run zip` makes the same build as the zip file sent to AMO.

## Try it in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on...** and choose `.output/firefox-mv3/manifest.json`.
3. Open https://old.reddit.com/. A small "unred it" badge shows in the lower-right corner.

A temporary add-on stays loaded until Firefox restarts.

## Scripts

| Command            | What it does                                                |
| ------------------ | ----------------------------------------------------------- |
| `npm run build`    | Builds the Firefox (Manifest V3) extension.                 |
| `npm run dev`      | Builds on every change and opens a fresh Firefox profile.   |
| `npm run zip`      | Makes the zip files for addons.mozilla.org.                 |
| `npm run lint`     | ESLint with type-aware TypeScript rules.                    |
| `npm run lint:amo` | Mozilla's add-on linter (the checks AMO runs) on the build. |
| `npm run compile`  | TypeScript type check.                                      |
| `npm run format`   | Formats the code with Prettier.                             |
| `npm run test`     | Unit tests (Vitest).                                        |
| `npm run check`    | Everything above that CI runs, in order.                    |

## Project layout

- `src/entrypoints/`: extension entry points (content scripts).
- `src/lib/`: shared code, with unit tests beside it (`*.test.ts`).
- `public/`: files copied into the extension as-is (icon).
- `design/`: the approved visual design (layout, colors, brand).
- `handoff/`: the project's decision and session record.

## License

MIT. See [LICENSE](LICENSE).

Unred It is not affiliated with or endorsed by Reddit, Inc.
