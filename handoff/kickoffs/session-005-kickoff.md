# Session 005: M6 settings page

Posture: build session; Claude asks the design questions first, then builds and checks in the preview; the owner approves the gates and tests in his Firefox and on his phone. One thing at a time.
Written at the close of session 004. Read with handoff/START_HERE.md.

## Session-start check
1. Read CLAUDE.md, handoff/START_HERE.md, this kickoff, and the log of session 004 (handoff/sessions/004_2026-11-09_m4-card-view.md).
2. Run the snapshot check. Every line should read MATCH; explain any DIFFERENT or UNREAD line before other work.
3. Other checks:
   - `node -v` (v24.x), `npm -v`, `gh auth status` (logged in as dallastidwell1-eng).
   - `git remote -v` shows origin git@github.com:dallastidwell1-eng/unred-it.git; `git status` clean. `git log origin/master..master` lists only local autosave and handoff commits made after 1d28637 (push is off; they go out with the next approved push).
   - `gh run list --repo dallastidwell1-eng/unred-it --limit 1` shows the last CI run green (run 42672748599 at 1d28637, attempt 2; attempt 1 failed on GitHub's side with no jobs started).
   - `npm run check` exits 0 (198 tests; AMO lint 0 errors, 1 known warning about innerHTML in Preact).
   - `package.json` version is 0.1.3 (the last signed build); the next signing needs 0.1.4 or higher.
4. Open this session's log.
5. Report to the owner in three lines and wait for the go.

## Where we are
- M1 to M5 are done (handoff/todo.md). The reader is owner-tested on Firefox desktop and Firefox for Android (signed unlisted builds 0.1.0 to 0.1.3).
- M6 in handoff/todo.md: a separate extension settings page with a theme override, compact/card view, filters (subreddit, keyword, NSFW, seen posts), all synced through Firefox Sync (D-024, D-028). Done when each setting and filter works on both devices and follows the user from PC to phone.
- Already built: the view setting (D-061; key `feedView` in browser.storage.sync; src/lib/view-setting.ts, with a pattern for a stored value that every open tab follows). The temporary view button in the top bar (src/ui/TopBar.tsx, `.view-toggle`) goes away in M6. The theme follows the browser now (src/ui/tokens.ts: `data-theme="dark"|"light"` on the host already overrides it).
- Design: design/layout-spec.md 5.8 and design/mockups/Settings.dc.html (sections Appearance, Filters, sync and about note; segmented controls, chips for hidden subreddits and words, switches; [P] Clear history, which belongs with M7's History).
- Where a filter applies: feeds and search come through parseFeedPage (src/lib/reddit-data.ts, which already drops paid posts) and are drawn in src/ui/App.tsx. Cards never show NSFW pictures (src/lib/card.ts).
- How it is checked: the developer preview (`dev-preview/`, browser pane preview_start "reader-preview"; ?view=, ?theme=, ?feed=) for layout; the owner's Firefox (about:debugging, reload the temporary add-on from `.output/firefox-mv3/manifest.json`) and his phone (sign per docs/releasing.md) for everything else (L-04). Claude's browser cannot open reddit.com.

## What this session does
1. **Ask the owner first** (AskUserQuestion), then record the answers as decisions:
   - How the settings page is reached before the M7 account page exists. D-024 says from the account menu, but the account button opens the Reddit profile until M7 (D-059). Options to offer: a settings button in the top bar that replaces the temporary view button; the add-on's toolbar button or about:addons "Options" (an extension options page); or both.
   - Whether the page is an extension page (options_ui, its own address) or a view inside the reader. An extension page also works where the reader is not running; a reader view keeps the reader's look and keeps your place (D-021).
   - The filters' exact behavior: hide or blur NSFW posts; whether hidden subreddits and words apply to Home and Popular only or everywhere, including search; what "seen posts" means (opened, or scrolled past) and whether hidden or dimmed.
2. **Build the settings store and page** per the answers and layout-spec 5.8: theme (follow device, light, dark), view (compact, card; reuse `feedView`), then the filters. One synced store, read before the reader draws (as reader.content.ts does for the view), followed by every open tab. Unit tests for the pure filter logic. Done when: `npm run check` passes and the preview shows the page at 375 px and 1280 px in dark and light.
3. **Apply the settings in the reader,** remove the temporary view button, and check that each setting follows from PC to phone through Firefox Sync (needs a signed build, version 0.1.4 or higher, and the owner signed in to Firefox Sync on both).
4. Push only with the owner's approval each time (D-009); check before each push: `hk scan`, `npm run check`, and no personal names or the owner's Reddit username in the outgoing diff.
- Deliverable: the settings page works in the owner's Firefox and on his phone, the settings follow him between them, and it is pushed with green CI.

## Binding lessons
- L-01 Append new decisions, questions and lessons at the end of their file; check the order.
- L-02 Write files with the editor tools, not bash heredocs with apostrophes.
- L-03 Edit code with the Edit tool, not scripted find-and-replace.
- L-04 The developer preview is not old.reddit.com on a phone: page- and device-dependent things need the owner's test of the built add-on.

## Owner follow-throughs
- Answer the step 1 questions.
- Sign each phone build in your own PowerShell window (docs/releasing.md); be signed in to Firefox Sync on the PC and the phone for the sync check.
- Approve each push and any new package (D-009).
- Not needed this session: OQ-014 (before M8).

## Scope
In: M6 (settings page, theme override, view, filters, sync), and the temporary view button's removal.
Out: M7 (account page, History and its Clear button, author links), editing or deleting your own comments, a confirm before closing a page with a draft (todo M5 known gaps; raise only if the owner asks), M8 listing work, entering any credential (D-007).
When the deliverable is done, the owner runs /handoff:handoff, which writes session 006's kickoff and start prompt, commits, and stops. Do not prompt the owner to run it.
