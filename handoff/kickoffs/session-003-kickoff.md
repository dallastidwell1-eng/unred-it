# Session 003: M4 feed picker

Posture: build session; Claude builds and checks in the preview, the owner approves gates and tests in his Firefox; one thing at a time.
Written at the close of session 002 (2026-11-06). Read with handoff/START_HERE.md.

## Session-start check
1. Read CLAUDE.md, handoff/START_HERE.md, this kickoff, and the log of session 002 (handoff/sessions/002_2026-11-06_m1-project-foundation-and-data-spike.md).
2. Run the snapshot check. Every line should read MATCH; explain any DIFFERENT or UNREAD line before other work.
3. Other checks:
   - `node -v` (v24.x), `npm -v`, `gh auth status` (logged in as dallastidwell1-eng).
   - `git remote -v` shows origin git@github.com:dallastidwell1-eng/unred-it.git; `git status` clean; `git log origin/master..master` empty (everything was pushed at 222a91f).
   - `gh run list --repo dallastidwell1-eng/unred-it --limit 1` shows the last CI run green.
   - `npm ci` (if node_modules is missing) and `npm run check` exit 0 (84 tests; web-ext lint 0 errors, 1 known warning about innerHTML in Preact).
4. Open this session's log.
5. Report to the owner in three lines and wait for the go.

## Where we are
- M1 is done; M2 is prepared and waits for the owner's AMO account and keys; M4 is in progress (todo.md lists what is built and the order of the rest).
- The reader runs on old.reddit.com feed pages only (front page, sorts, subreddits): src/entrypoints/reader.content.ts mounts src/ui/App.tsx in a closed shadow root. Views over the feed (post, comments) are a stack kept in history.state, so Back closes one at a time.
- Reddit data: src/lib/reddit-data.ts, comments.ts, thread-loader.ts, feed-route.ts; actions through src/lib/reddit-client.ts (form plus modhash, D-047). The FeedSource interface in App.tsx is what the extension and the preview each supply.
- Design: design/layout-spec.md section 5.6 (subreddit picker) and 5.1 (top bar); colors in design/color-spec.md; all tokens in src/ui/tokens.ts; styles in src/ui/reader.css.
- Developer preview with sample data: `dev-preview/` (start it with the browser pane's preview_start, name "reader-preview", port 5199; add ?theme=dark or ?theme=light). Its shadow root is open so layout can be measured. The pane's screenshots can be stale or cropped: measure in the page when in doubt.
- The owner tests by reloading the temporary add-on in about:debugging (file `.output/firefox-mv3/manifest.json` after `npm run build`).

## What this session does
1. **Feed picker (layout-spec 5.6).** The "Home ⌄" button in the top bar opens a sheet that drops down under the bar (radius 0 0 16 16, max height 660 px on a phone, scrim behind, 180 ms drop, Esc / scrim / Back close it, focus moves in and returns). Inside: a 44 px filter field; Home / Popular / All chips (36 px, full radius, the current one in blue); "Your subreddits": 48 px rows with a 28 px letter avatar, filtered as you type. Subscriptions come from `/subreddits/mine/subscriber.json?raw_json=1&limit=100` (follow `after` for more), parsed and unit-tested in src/lib. Choosing a feed opens it in the reader (going to `/`, `/r/popular/`, `/r/all/` or `/r/<name>/`; a normal page load is acceptable because the reader takes over every feed page; say so to the owner if you choose it). Done when: unit tests for the parser and filter pass, `npm run check` passes, the preview shows the sheet correctly at 375 px and 1280 px in dark and light, and the owner confirms it in his Firefox.
2. **Then, if time allows, in the order of todo.md M4:** top bar search, account button with unread dot, bar hiding on scroll (5.1); then all reddit.com links in the reader (D-027). Ask the owner before starting each.
3. Push to GitHub only with the owner's approval each time (D-009); check before each push: `hk scan`, `npm run check`, and no personal names or usernames in the outgoing diff.
- Deliverable: the feed picker works in the owner's Firefox and is pushed with green CI.

## Binding lessons
- L-01 Append new decisions, questions and lessons at the end of their file; check the order.
- L-02 Write files with the editor tools, not bash heredocs with apostrophes.
- L-03 Edit code with the Edit tool, not scripted find-and-replace.

## Owner follow-throughs
- Report the temporary "Font: …" line at the bottom of the feed (then remove it; todo M4 clean-up).
- Approve each push (D-009) and any new package.
- Not needed this session: the AMO account and keys (M2), OQ-014 (before M8).

## Scope
In: M4 feed picker; further M4 pieces only with the owner's go.
Out: M2 signing (needs the owner's keys), M5 save/reply/share, settings (M6), entering any credential (D-007).
When the deliverable is done, the owner runs /handoff:handoff, which writes session 004's kickoff and start prompt, commits, and stops. Do not prompt the owner to run it.
