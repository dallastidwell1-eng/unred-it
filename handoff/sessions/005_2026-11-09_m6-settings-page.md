# Session 005: m6 settings page

Status: in progress
Date: 2026-11-09 · Started 11:30 · Closed HH:MM
Chat: Claude desktop app (Code tab), Claude Opus 5.5 (claude-opus-5-5)
Kickoff: handoff/kickoffs/session-005-kickoff.md

## Start check
- `hk status`: next_session_number 5, no log left in progress. `hk check`: ALL MATCH (fp_config 984bd33a2180, decisions 63, open questions 6, lessons 4, base commit 0be1396 in HEAD f78ddda's history; working tree clean).
- Tools: node v24.13.0, npm 11.6.2, gh logged in as dallastidwell1-eng (ssh). origin is git@github.com:dallastidwell1-eng/unred-it.git; `git status` clean.
- `git log origin/master..master`: f78ddda (session 004 handoff) and 0be1396 (autosave), both after 1d28637, as the kickoff expected.
- Last CI run 42672748599 at 1d28637: success.
- `npm run check`: exit 0; 198 tests pass; AMO lint 0 errors, 1 known warning. package.json version 0.1.3.
- Nothing in START_HERE or the kickoff turned out wrong.

## Goal
Build the M6 settings page (theme, compact/card view, filters, synced through Firefox Sync), owner-tested in Firefox desktop and on the phone, and pushed with green CI. Design questions to the owner first.

## What was done
<One numbered line per finished step, added as you go: the time (read the clock), what, which file or system, and how it was checked.>
1. 11:31 Start check run and recorded (above). Checked: hk status, hk check ALL MATCH, npm run check exit 0.
2. 12:38 Owner answered the M6 questions (AskUserQuestion): Settings from both a top-bar gear and Firefox's add-on menu; no NSFW filter ("Just show them. We don't care"); hide lists on mixed feeds and search, not a subreddit opened on purpose; hide posts I opened. Recorded D-064 and D-065 (appended at the end of handoff/decisions.md; order checked).
3. 12:48 Settings built. New: src/lib/settings.ts (one key per setting in browser.storage.sync; the view keeps `feedView`), src/lib/filters.ts (hidden subreddits except a subreddit opened on purpose or searched inside; hidden words as whole words in any case; opened posts out of feeds, not search), src/lib/opened-posts.ts (post IDs, newest first, capped at 500), src/ui/SettingsPage.tsx (panel plus the view over the feed), src/ui/OptionsPage.tsx and src/entrypoints/options/ (Firefox's add-on settings, options_ui in its own tab), src/ui/fonts-list.ts (font list split out of fonts.ts). Changed: App.tsx (settings state followed in every tab; theme on the reader and on <html> as data-unred-theme; filters applied to the feed; posts opened on this page stay until the next load; Settings overlay), TopBar.tsx (gear in place of the view button; CardsIcon and RowsIcon removed, GearIcon and CloseIcon added), reader.content.ts (reads settings and opened posts before drawing; page background follows a chosen theme), reader.css (settings styles), tokens.ts (--knob-off), dev-preview (settings through the real stores over localStorage; ?page=options). Checked: 17 new unit tests (settings, opened posts, filters; top bar gear); npm run check exit 0, 215 tests, AMO lint 0 errors and 2 warnings (the known Preact innerHTML line, now once in reader.js and once in the options chunk; none in our code). Preview at 375 px dark and light and 1280 px light and dark: the gear opens Settings with focus inside, Esc closes it and focus returns to the gear; theme Light overrides a dark device and Dark a light one, on the reader and the page; Cards switches the feed; a hidden subreddit and word leave Home and search, r/aviation opened on purpose still shows its post; an opened post stays in place, is gone from Home after a reload, and still shows in search; a wrong subreddit name and a repeat each show a message; removing a chip returns focus to the field; no console errors.
4. 12:48 Found that Firefox for Android does not sync add-on storage (MDN storage.sync page; Mozilla bug 1625257 REOPENED, no fix planned, checked through a web-fetch subagent). Opened OQ-015; owner chose "Set each device"; recorded D-066 (changes D-028) and closed OQ-015. The Settings note now says computers sync when Add-ons is ticked in Firefox's Sync settings and that Firefox for Android keeps its own settings.
5. 12:53 Version 0.1.4 (package.json, package-lock.json; built manifest says 0.1.4). layout-spec 5.8 and todo M6 and M8 notes updated. npm run check exit 0 (215 tests). Waiting for the owner's tests: Firefox desktop (reload the temporary add-on), the phone (sign 0.1.4), and PC-to-PC sync only if a second computer is at hand.
6. 14:52 Owner tested 0.1.4 in Firefox and on the phone: "All worked". The owner's PC then crashed; the chat was resumed. Checked after the resume: HEAD 24a999c (the M6 commit), working tree clean, session log intact through line 5. M6 marked DONE in todo.md. PC-to-PC sync was not tested (no second computer named); it rests on Firefox Sync's documented behavior (D-066).
7. 14:54 Pre-push checks: hk scan clean; npm run check exit 0 (215 tests, AMO lint 0 errors, 2 known Preact warnings); no personal names in the outgoing src, dev-preview, docs, design, package.json or wxt.config.ts changes (three "manif" hits are the word "manifest"). Five local commits (0bd7254, 24a999c, 185061e, f78ddda, 0be1396). Waiting for the owner's push approval (D-009).
8. 14:55 Owner approved the push ("Yes, push"). Pushed 1d28637..24d17ec to origin/master (six commits: the five named plus autosave 24d17ec, which holds only log line 7). CI run 42706888837 at 24d17ec: success (job "Format, lint, type-check, test, build, AMO lint", 48 s). GitHub showed a notice that the ubuntu-latest runner label moves to Ubuntu 26 from 2026-10-19; this run passed on it, so no change is needed now. Deliverable done: the settings page works in the owner's Firefox and on the phone and is pushed with green CI; settings sync between computers only (D-066).
9. 15:29 Owner after the M6 test: "Yes, show NSFW pictures"; "That's fine" (Text size stays unbuilt); "u/name should be a link"; and a phone finding with two screenshots: opened from a home-screen shortcut, Firefox for Android draws a white bar at the top (page title and address) and a white system bar at the bottom, while in Firefox itself both are dark. Recorded D-067 (NSFW card pictures) and D-068 (author links). Research on the white bars (web search plus a web-fetch subagent): the add-on "Twitter PWA colors fixer" fixes the same white bars for Twitter's home-screen app by rewriting the site's web app manifest (webRequest filterResponseData on manifest.json, renaming theme_color); its author says Firefox for Android ignores a page's theme-color tag and defaults to white. Not confirmed from a Mozilla source, and Claude cannot open reddit.com to see whether old.reddit.com has a manifest. Built the cheap step first: src/ui/theme-color.ts puts a theme-color tag on the page that follows the reader's theme (one per color scheme for Device). Also: src/lib/card.ts shows NSFW pictures where Reddit sends a thumbnail; src/ui/UserLink.tsx links u/name on the post page and each comment's author to /user/name/ ("[deleted]" stays plain). Version 0.1.5. Checked: 6 new or changed unit tests (card NSFW both ways, theme-color, UserLink); npm run check exit 0, 221 tests, AMO lint 0 errors and the 2 known warnings; preview at 375 px dark: the NSFW sample card shows its picture, the post page shows u/someone and every comment author as links to /user/name/ with the OP blue kept and no change in look, the theme-color tags are #FAFAFA and #1A1A1A by color scheme on Device and one #FAFAFA on Light; no console errors. layout-spec 5.3 and 5.5 updated. Waiting for the owner's phone test of 0.1.5, including the home-screen shortcut (removed and added again).
10. 15:53 Signing 0.1.5 first failed with AMO "JWT iat (issued at time) is invalid": the PC clock was about 11 s ahead of addons.mozilla.org and google.com (HTTP Date headers) after the crash; the owner re-synced the Windows clock himself and signed. Owner's phone test of 0.1.5: "NSFW opens in cards just fine"; "White bars are still there": the theme-color tag does not change Firefox for Android's bars around a home-screen shortcut, as the Twitter fixer's author said. Next step depends on whether old.reddit.com has a web app manifest (asked the owner to look in the page source on the PC).
11. 15:56 Owner found in the page source: <link rel="manifest" href="//www.redditstatic.com/desktop2x/img/favicon/manifest.json"/>. Read that public file with curl: "theme_color": "#ffffff", "background_color": "#ffffff", "display": "minimal-ui" (the cause of the white bars and of the title-and-address bar). Owner approved the manifest fix with its new permissions; MDN (through the web-fetch subagent) says filterResponseData in MV3 needs webRequest, webRequestBlocking and, from Firefox 110, webRequestFilterResponse, plus the host permission; this is three permissions, not the two first told to the owner. Recorded D-069. Built: src/lib/web-manifest.ts (recolorManifest: both colors to the reader's background, anything not a JSON object unchanged), src/entrypoints/background.ts (onBeforeRequest blocking listener on https://www.redditstatic.com/*/manifest.json; collects all chunks, rewrites at the end, passes the original through on any error), wxt.config.ts (the three permissions and www.redditstatic.com). Version 0.1.6. Checked: 3 new unit tests; npm run check exit 0, 224 tests, AMO lint 0 errors and the 2 known warnings; built manifest lists exactly storage, webRequest, webRequestBlocking, webRequestFilterResponse and the five hosts, with background.js. Not checkable in the preview (no background script there) or on the PC's home screen; the PC can show the changed file by opening its address with the add-on loaded.

## Decisions
<D-### numbers added to handoff/decisions.md this session, one line each; or "none".>

## Verification
<What was checked at close and how: which snapshot lines changed as expected, what the owner confirmed. A command that "should have worked" is not verification.>

## Found along the way
<Problems or facts found that were not the goal; or "none".>

## Judgment calls
<Choices made without asking the owner, each with the reason, so the owner can overrule them; or "none".>

## State at close
<Filled by the snapshot command at close.>

## Open questions
<OQ-### numbers opened or closed this session; or "none".>

## Owner follow-throughs
<What the owner owes: reviews, logins, answers, manual steps; or "none".>

## Lessons
<New binding lessons added to handoff/lessons.md; or "none".>

## Next
<The single next step, stated so that a fresh session can start it without asking. Name the next session number and its kickoff file.>
