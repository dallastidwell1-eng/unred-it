# Session 002: M1 project foundation and data spike

Status: closed
Date: 2026-11-06 · Started 20:58 · Closed 23:46
Chat: Claude desktop app (Code tab), Opus 5.5 (claude-opus-5-5)
Kickoff: handoff/kickoffs/session-002-kickoff.md

## Start check
- `hk status`: next_session_number = 2, matches the start prompt. No log was left in progress.
- `hk check`: ALL MATCH (fp_config, decisions 42, open_questions 8, lessons 2, base_commit c5d5fb8 in the history of HEAD c2e8611). Working tree clean.
- Tools: Node v24.13.0, npm 11.6.2, git 2.53.0, gh logged in as dallastidwell1-eng (protocol ssh). Firefox 159.0 at `C:\Program Files\Mozilla Firefox\firefox.exe`. `git remote -v`: none, as expected.
- Nothing in START_HERE or the kickoff found wrong.

## Goal
Milestone M1: the WXT + TypeScript extension foundation (license, approved packages, extension ID, scaffold, visible marker on old.reddit.com), the data spike that answers OQ-011 (read and vote from the logged-in browser), and the public GitHub repository with passing CI.
Scope change (owner, 21:46): with M1 done, the owner said to keep going ("Prep M2, then M4"): M2 preparation that needs no keys (OQ-001, OQ-002, signing script, account steps), then M4 groundwork.

## What was done
1. 20:58 Session opened; start check done (see Start check). Checked by `hk status`, `hk check` and the tool version commands.
2. 21:04 Owner chose MIT. Closed OQ-008, recorded D-043 (appended at the end of decisions.md; `grep` shows D-043 last, 7 open questions). Checked current npm versions for the M1 package list: typescript-eslint 8.72.1 supports TypeScript only below 6.1.0, so TypeScript 7.0.2 (latest) cannot be used yet; TypeScript 6.0.3 is the newest that fits. WXT 0.21.5 needs vite as a peer (8.3.6 fits).
3. 21:06 Owner approved the package list (D-044), chose add-on ID `unred-it@praxisdesignworks` (D-045) and copyright "Dallas Tidwell". Web search on MV2 vs MV3 for Firefox (Extension Workshop migration guide; Mozilla Add-ons blog 2024-05-14) and WXT defaults (wxt.dev: Firefox defaults to MV2).
4. 21:13 Scaffold done (M1 step 4): package.json, wxt.config.ts (MV3, D-046; srcDir src, explicit imports, storage + 3 https reddit hosts, gecko id, min Firefox 140 / Android 142, data_collection none), tsconfig (strict), eslint.config.js (strictTypeChecked), Prettier, vitest.config.ts (WxtVitest), src/lib/marker.ts + 3 tests, src/entrypoints/old-reddit.content.ts, public/icon.svg (copy of design/brand/icon.svg), README.md, LICENSE (MIT, Dallas Tidwell), .gitignore build entries. Checked: `npm run check` exit 0 (format, lint on 6 files, tsc, 3/3 tests, build 5.33 kB, web-ext lint 0 errors 0 warnings 0 notices).
5. 21:20 Visible marker (M1 step 5): owner loaded `.output/firefox-mv3/manifest.json` as a temporary add-on in his normal, logged-in Firefox and saw the "unred it" badge at the lower right of old.reddit.com (owner's screenshot: front page, logged in; "nice work"). Claude could not start Firefox from the sandbox ("Access is denied"); the owner loaded it by hand.
6. 21:22 Spike code written (M1 step 6, not yet run): src/lib/reddit-data.ts (parsers for feed, thread, /api/me, post ID from URL, vote form body; 10 new unit tests) and a temporary test panel, src/spike/spike-panel.ts + src/entrypoints/spike.content.ts, shown only at old.reddit.com/#unred-spike. It tries two request modes (the content script's own fetch, and Firefox's content.fetch as the page), never shows the modhash, and asks for a confirm before each vote. Checked: `npm run check` exit 0 (13/13 tests, build 15.59 kB, web-ext lint 0/0/0).
7. 21:28 Spike run by the owner at 21:26 to 21:27 in his logged-in Firefox 159 (pasted log): "page" mode (content.fetch) not available; "extension" mode logged in (modhash present, 50 chars); front page 10 posts read (590 ms); a post the owner chose read with 13 of 13 comments, depth kept; upvote HTTP 200, likes null to true; undo HTTP 200, likes true to null. Rate-limit headers only on the vote replies (remaining about 1997, reset about 180 s). Closed OQ-011 (reads and votes; saves and comments untested), recorded D-047. Reddit's terms could not be read: WebFetch refuses redditinc.com, the help-center wiki returned 403, and the built-in browser blocks redditinc.com; a web search found only third-party blogs. Opened OQ-014 for the owner. Removed the owner's Reddit username from this log (the repository will be public).
8. 21:33 GitHub (M1 step 7). Owner approved (D-009) and chose a fresh public history (D-048). Wrote .github/workflows/ci.yml (npm ci + `npm run check` on Node 24; actions pinned to SHAs looked up with `gh api`: checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2). Kept the old history in local branch `backup/pre-public-2026-11-06`; git-ignored references/; made an orphan commit 1b606a6 and renamed it to master, then c4cd2d9 added .gitattributes (LF). The first commit was made with `core.hooksPath=/dev/null` by mistake; `.git/hooks` has no active hooks, so nothing was skipped, and the second commit ran normally. Checked before push: `npm run check` exit 0, `hk scan` no secret-shaped text, `git ls-files references` empty, username in no tracked file. Created https://github.com/dallastidwell1-eng/unred-it (public) with `gh repo create` and pushed master. CI run 42338960168 passed in 1m1s (job "Format, lint, type-check, test, build, AMO lint"; artifact unred-it-firefox-mv3 uploaded); one notice only: ubuntu-latest moves to Ubuntu 26 from 2026-10-19 (no action needed). Checked with `gh run watch --exit-status` (exit 0) and `gh run view`.
9. 21:37 Owner confirmed by eye that the upvote appeared and then disappeared on the post on Reddit itself ("Yes, saw it"), after re-running spike steps 4 and 5. With CI green (step 8), every M1 "Done when" item in todo.md is met.
10. 21:46 Owner: never ask him to run the handoff (saved to Claude's memory, no-handoff-prompts); chose "Prep M2, then M4". Web-fetch agent read 8 Extension Workshop pages for OQ-001 and OQ-002.
11. 21:51 M2 prep done (no keys involved): wxt.config.ts zip.excludeSources; scripts/sign.mjs + npm scripts sign:unlisted / sign:listed (D-049); docs/releasing.md (owner's AMO account, keys per terminal with Read-Host -MaskInput, signing, Android install from file); README reviewer build steps. Closed OQ-001; OQ-002 partly answered, owner to confirm at first upload. Checked: sign script exits 2 with a clear message when keys or channel are missing; `npm ci` + `npm run check` exit 0; the sources zip, extracted to the scratchpad, rebuilt with `npm ci` + `npm run build` to an identical .output/firefox-mv3 (`diff -r`).
12. 21:53 M4 groundwork: design tokens. src/ui/tokens.ts holds every color (dark Deep, light Paper), type role, spacing, radius, breakpoint and motion value from design/color-spec.md and design/layout-spec.md, and builds the theme CSS (follows the device; data-theme override, D-024). src/lib/contrast.ts computes WCAG contrast. src/ui/tokens.test.ts re-checks every contrast promise in color-spec.md (16 text pairs at 4.5:1 or better, light unread dot at 3:1) and rule 1 (neutral greys). Checked: `npm run check` exit 0, 34/34 tests.
13. 21:58 Owner approved Preact (D-050) and bundled Inter / Inter Tight fonts (D-051); installed preact 11.2.0, @fontsource-variable/inter and inter-tight 5.3.0.
14. 22:07 M4 start: rebuilt compact feed. reader.content.ts (document_start) takes over old.reddit.com feed pages (front page, sorts, subreddits; not with ?unred=off or #unred-spike), hides Reddit's page and mounts Preact in a closed shadow root (src/ui/mount.tsx, App.tsx, FeedRow.tsx, icons.tsx, reader.css); fonts copied into the build by a build:publicAssets hook and loaded with FontFace (src/ui/fonts.ts); feed data from <path>/.json?raw_json=1&limit=25 with the after cursor (src/lib/feed-route.ts), endless scroll; shared constants moved to src/lib/constants.ts so the reader does not bundle the spike. Fixed a theme bug found while building (:host[data-theme] must be :host([data-theme])). Dev preview: dev-preview/ with sample data, served by .claude/launch.json (reader-preview). Checked: `npm run check` exit 0 (46/46 tests; AMO lint 0 errors, 1 warning: innerHTML inside Preact's runtime, which our code never uses); visual check in the built-in browser at 375 px dark and light, and 1280 px dark: layout, thumbnail slots, vote colors (dark text color, light chips with charcoal text) and endless scroll match layout-spec 5.2. Not checked yet: real Reddit data and the bundled fonts inside Firefox (owner test). `hk check`: 3 DIFFERENT, all expected: decisions 42 to 51, open questions 8 to 6, and base_commit not in HEAD's history because of the fresh public history (D-048; the old commits are in backup/pre-public-2026-11-06).
15. 22:11 Owner tested the reloaded build in his Firefox on old.reddit.com: "Yes, it works" (rebuilt feed loads with real Reddit data). The footer font line was not reported back.
16. 22:12 Owner chose: own allow-list HTML cleaner (D-052), happy-dom for DOM tests (D-053), push now. Pushed 6 commits (checked first: `hk scan` clean, owner's username in 0 outgoing diffs); CI run 42341701653 passed in 46 s.
17. 22:14 src/lib/sanitize.ts: DOMParser plus an allow-list rebuilt with createElement (no innerHTML); 10 tests (scripts, handlers, javascript:/data: links, relative links, spoilers, unknown tags, list start and table align). Post gains selftextHtml, postHint, previewImage (display size up to 1080 px), isVideo, isGallery; 1 more test.
18. 22:18 M4 content layer: src/ui/ContentLayer.tsx opens a post over the live feed (dialog, focus moves in, Tab stays inside, Esc / Feed button / scrim / browser Back close it, focus returns to the post, page scroll locked while open); text posts cleaned (D-052), images shown, links as a card with "Open article" in a new tab, video and gallery hand off to Reddit; score and comment link in the action bar (vote, save and share are M5). Found and fixed: history entries survive a reload, so Back reopened stale posts; each page load now tags its entries with its own ID. Checked: 5 ContentLayer tests (happy-dom); preview at 375 px and 1280 px, dark and light (layout measured: panel 375 px, text 335 px at x = 20 on phone; 760 px panel 40 px from the top on desktop); scripted run of open, Esc, Back, Forward, scrim, Feed button, link card and video button all as expected; `npm run check` exit 0 (62/62 tests, AMO lint 0 errors, 1 known warning).
19. 22:40 Owner tested the content layer on real posts (4 screenshots): pictures load; videos do not play (handed to Reddit); galleries do not show; link and video previews are cropped to a wide strip. Owner chose hls.js for videos with sound (D-054) and Previous/Next buttons for galleries on phone and PC, no swipe (D-055); recorded D-056 (media keeps its own shape; changes layout-spec 5.4).
20. 22:59 Media in the content layer: Post gains video (secure_media / media reddit_video, the GIF-style preview clip, or a crosspost's) and gallery (gallery_data + media_metadata, display size up to 1080 px, animated pictures as MP4), 7 new tests. src/ui/PostMedia.tsx: VideoPlayer (GIF-style and silent clips as plain MP4; others through hls.js light with no worker; on a fatal stream error it falls back to the silent MP4 with a note and a Play on Reddit link), Gallery (one picture at a time, 44 px Previous/Next buttons, counter, caption, frame keeps the tallest picture's shape so the buttons do not jump), link card and image posts at their own proportions. Added host permission https://v.redd.it/* and a type file for hls.js/light. Checked: 69/69 tests (gallery buttons, counter, caption, frame shape); preview gallery measured at 1280 x 900 (frame 630 px = 70vh, tall picture 420 x 630, buttons below); `npm run check` exit 0 (AMO lint: 0 errors, the same 1 warning). reader.js is now 407 kB because of hls.js. Not checked: video playback in Firefox (Claude's browser is not Firefox and has no Reddit session).
21. 23:08 Owner test: galleries work; the video played (through hls.js) but with no sound; Firefox showed its no-audio speaker icon. Cause: hls.js's light build leaves out alternate-audio tracks (hls.js README), which Reddit uses for sound. Switched to the full build (import 'hls.js'), removed the light-build type file, updated D-054. Checked: `npm run check` exit 0 (69/69; AMO lint 0 errors, 1 known warning); reader.js 623 kB. Sound not yet confirmed by the owner.
22. 23:13 Owner test: video sound works (hls.js full build confirmed). Owner asked for working votes and a seek bar on GIFs (D-057). Built: src/lib/vote.ts (directionFor, applyVote), src/lib/reddit-client.ts (vote with cached modhash, one retry after 403, Reddit refusal and HTTP errors reported); VoteBar in the content layer (44 px Upvote/Downvote buttons with aria-pressed, score between them, instant update, revert plus "Vote not sent" message on failure; feed row updates too); player controls on GIF-style clips and animated gallery items. Checked: 5 new tests (74/74); preview run: instant update, up/down/undo, refused vote reverts with message, feed score follows; computed colors dark up #E2C98A, down #E5736B, light chip #E8C04A with #222 text and 3 x 8 px padding; `npm run check` exit 0. Two scripted-edit slips found by lint and fixed; recorded lesson L-03. Not checked: a real vote from the reader in Firefox (owner test).
23. 23:19 Owner tested in Firefox: "Yes, both work" (real upvote/downvote from the reader, and seeking in a GIF-style clip).
24. 23:21 Owner approved the push (pushed 1b2fc92; checks first: username 0, `hk scan` clean, `npm run check` ok; CI run 42346699376 passed in 1 min 10 s). Font footer line: owner did not look; the line stays. Owner chose the comments view next.
25. 23:28 M4 comments view (layout-spec 5.5, D-026): src/lib/comments.ts (comment tree, more stubs, morechildren rebuild, replaceMore, updateComment, replyCount; 6 tests), src/lib/thread-loader.ts (thread and branch addresses, morechildren in batches of 100 with a stub for the rest, "continue this thread" loads the parent's branch; 4 tests), src/ui/CommentsView.tsx (full-screen view, post summary with voting, sort menu Best/Top/New/Controversial/Old/Q&A, fold markers on 1 px thread lines with N replies hidden, OP name in blue, MOD/ADMIN/Pinned tags, score hidden, comment voting with revert on failure, load more), useDialogKeys.ts (only the top view answers Esc and keeps Tab inside), clicks.ts (shared plain-click rule). App now keeps a stack of views (post, comments) in history.state, so Back closes one view at a time and reopens them on Forward; focus returns to the opener. Comment links in the feed and the post open the view. Checked: `npm run check` exit 0 (84/84; AMO lint 0 errors, 1 known warning); preview at 1280 px (screenshot) and 375 px (measured: text at 38 px, fold marker at 16 px, thread line at 23 px, 22 px per level, no sideways scroll); scripted run of fold/unfold, load more, continue thread, comment vote, sort change, Esc and Back through post then comments. Not checked: real Reddit threads in Firefox (owner test).
26. 23:34 Owner tested the comments view on real threads: "Works nicely!"; asked for the post up top. Chose "Both": the subreddit, author, age and title now sit in the comments view's top bar beside the back button (title clamped to 2 lines), and the post itself (picture, video, gallery, text or link card) shows above the vote row and sort bar. The opened post's video pauses when the comments cover it. Checked: `npm run check` exit 0 (84/84); preview at 1280 px (screenshot) and 375 px (measured: bar 69 px with a 2-line clamped title, post text at the 16 px gutter, no sideways scroll).
27. 23:36 Owner checked the new comments page top in Firefox: "Looks right".
28. 23:37 Owner: push now and end the session here; next M4 piece is the feed picker (layout-spec 5.6), for the next session.
29. 23:38 Pushed 222a91f (checks first: username 0, `hk scan` clean, `npm run check` ok). CI run 42347832164 passed in 31 s.

30. 23:43 Close (/handoff:handoff): todo.md updated (M2 prep and spike removal, M4 progress and order of the rest, M5 voting done, M8 pre-submission items); OQ-012/OQ-013 put back in order (left from session 001); layout-spec 5.4 updated for D-054 to D-056; session 003 kickoff and start prompt written; START_HERE rewritten.

## Decisions
- D-043 License: MIT (closes OQ-008).
- D-044 M1 dev packages approved (wxt, vite, typescript 6.0, eslint, @eslint/js, typescript-eslint, prettier, vitest, web-ext).
- D-045 Add-on ID `unred-it@praxisdesignworks`; LICENSE copyright "Dallas Tidwell".
- D-046 Manifest V3 for Firefox (min Firefox 140 desktop, 142 Android).
- D-047 Data path: content script fetches Reddit's .json pages and posts to Reddit's form endpoints with the modhash.
- D-048 Public repository with a fresh history; references/ local only; old history in a local backup branch.
- D-049 Signing runs on the owner's machine with the owner's keys (scripts/sign.mjs).
- D-050 UI library: Preact.
- D-051 Fonts bundled: Inter and Inter Tight.
- D-052 Post/comment HTML cleaned by our own allow-list.
- D-053 happy-dom for DOM unit tests.
- D-054 Videos play in the reader; hls.js (full build) for sound; host permission v.redd.it.
- D-055 Galleries: one picture at a time, Previous/Next buttons, no swipe.
- D-056 Media keeps its own shape (changes layout-spec 5.4).
- D-057 Voting moved into M4's content layer and comments; GIF clips show player controls.

## Verification
Snapshot taken 2026-11-06 23:45, compared with the session 001 close (20:52):
- decisions: expected 42 + 15 (D-043 to D-057) = 57 → snapshot shows 57. Order checked by script: D-000 to D-057 with no gap.
- open_questions: expected 8 − 3 closed (OQ-008, OQ-011, OQ-001) + 1 opened (OQ-014) = 6 → snapshot shows 6. Order checked: OQ-000 to OQ-014 in sequence (OQ-012/013 fixed at close).
- lessons: expected 2 + 1 (L-03) = 3 → snapshot shows 3.
- fp_config: this session did not change CLAUDE.md, .claude/settings.json, handoff/config.json or the templates (it added .claude/launch.json, which is not fingerprinted) → unchanged at 984bd33a2180, as expected.
- base_commit 47f7582 is the 23:38 autosave, as expected (the close commit comes after). The commit history was replaced by a fresh one (D-048), so session 001's base c5d5fb8 is only in `backup/pre-public-2026-11-06`; this close snapshot is the new baseline for session 003.
- working_tree 7 changed = the close edits (session log, START_HERE, todo, open-questions, layout-spec, the two session-003 kickoff files); committed in the close commit.
- GitHub: master at 222a91f pushed, CI run 42347832164 green (`gh run watch --exit-status` exit 0). The autosave and close commits after it are local (push is off; pushing needs the owner, D-009).
- The owner confirmed in his Firefox: marker, spike read and vote (seen on Reddit), rebuilt feed, content layer, galleries, video with sound, voting on posts and comments, GIF seek bar, comments view and its new top ("Looks right").
- Not verified: the bundled Inter font in Firefox (owner has not reported the footer line); everything on the phone (needs M2); OQ-014 (Reddit's terms).

## Found along the way
Each item names where it is carried forward.
- typescript-eslint 8 supports TypeScript only below 6.1, so TypeScript 7 cannot be used yet. Carried: D-044.
- Firefox's `content.fetch` is not reachable from a WXT content script; the content script's own fetch with host permission works and sends the user's cookies. Carried: OQ-011 answer, D-047.
- Reddit's rate-limit headers appear on /api/vote replies (about 2,000 per window, reset about 180 s), not on .json reads. Carried: OQ-011 answer.
- Claude's tools cannot read redditinc.com or the Reddit help center (WebFetch refuses, 403, browser blocks). Carried: OQ-014 (owner).
- The owner's Reddit username was in one local autosave commit; the public repo was started from a fresh history. Carried: D-048; backup branch `backup/pre-public-2026-11-06` named in START_HERE.
- `npm audit`: 14+ low/moderate warnings, all in dev tools (addons-linter, eslint's minimatch), none shipped. Carried: todo M8.
- web-ext lint gives one warning: innerHTML inside Preact's runtime (a feature our code never uses). Carried: todo M8 (reviewer note).
- hls.js light build has no alternate-audio, so Reddit videos were silent; the full build fixed it (reader.js about 620 kB). Carried: D-054, todo M8 (size).
- History entries survive a reload, so Back reopened old posts; fixed with a per-page-load ID. No follow-up needed.
- In a shadow root, host conditions need `:host([attr])`, not `:host[attr]`. Fixed in tokens.ts; no follow-up needed.
- WXT's public folder is the project root's `public/`, not `src/public/`. Fixed; no follow-up needed.
- The built-in browser's screenshots often show a stale, half-faded frame and its phone emulation crops the right edge; measurements in the page are reliable. No follow-up needed (method note, kept in this log).
- Extension Workshop pages do not say whether one add-on ID can hold listed and unlisted versions. Carried: OQ-002 (owner confirms at the first upload).
- Mozilla's docs: Android installs a signed .xpi via Settings > About Firefox (tap logo 5 times) > Install Extension from File. Carried: docs/releasing.md.
- Two scripted edits broke code (a "\n" turned into a line break; str.replace removed two copies). Carried: lesson L-03.
- OQ-012 and OQ-013 were out of order in open-questions.md (from session 001). Fixed at close; no follow-up needed.

## Judgment calls
Each item names where it is carried forward; the owner can overrule any.
- Manifest V3 instead of WXT's Firefox default V2. Carried: D-046.
- Host permissions https only, for old., www. and bare reddit.com (plus v.redd.it later, approved). Carried: wxt.config.ts, D-046, D-054.
- The reader takes over only feed pages for now (front page, sorts, subreddits); post and other pages keep Reddit's view until D-027 is built. Carried: todo M4 item (3).
- Closed shadow root for the reader (open only in the developer preview). Carried: src/ui/mount.tsx comment; no follow-up needed.
- Fonts loaded with FontFace from the extension's own files (no web_accessible_resources). Carried: D-051; footer font check in todo M4 clean-up.
- Sign script always uploads the sources zip, even for unlisted builds. Carried: D-049, OQ-001 answer.
- Votes show at once and revert if Reddit refuses; the modhash is fetched again once after a 403. Carried: D-057.
- Comments: load 200 at first, "more" in batches of 100; indentation stops growing after 6 levels on a phone. Carried: src/lib/thread-loader.ts and reader.css; no follow-up needed unless the owner wants it changed.
- The gallery frame keeps the tallest picture's shape so the buttons never move, with no grey background (D-056). Carried: D-055, D-056.
- The post's video pauses when the comments cover it. No follow-up needed.
- A developer preview with sample data (dev-preview/, .claude/launch.json "reader-preview") for Claude's own visual checks. Carried: session 003 kickoff.

## State at close
<!-- SNAPSHOT START -->
```
taken_at: 2026-11-06 23:45 -0700
branch: master
base_commit: 47f758258d9f
base_subject: autosave (turn): 2026-11-06 23:38
working_tree: 7 changed
fp_config: 984bd33a2180 (6 files)
decisions: 57
open_questions: 6
lessons: 3
autosave_last: 2026-11-06 23:38:23 turn head=47f7582 push=off
```
<!-- SNAPSHOT END -->

## Open questions
Closed: OQ-008 (MIT, D-043), OQ-011 (reads and votes work, D-047), OQ-001 (AMO source rules met, D-049). Opened: OQ-014 (Reddit's terms; owner). Partly answered, still open: OQ-002 (confirm at the first upload). Still open from session 001: OQ-003, OQ-006, OQ-009, OQ-010. Open now: 6.

## Owner follow-throughs
Each item names where it is carried forward.
- Create the Mozilla (AMO) developer account and API keys, keep them yourself; then run `npm run sign:unlisted` per docs/releasing.md. Carried: todo M2, START_HERE.
- Read Reddit's Data API Terms and Developer Terms (or paste them) for OQ-014, before M8. Carried: OQ-014, START_HERE.
- Look at the bottom of the feed and report the "Font: …" line, so it can be removed. Carried: todo M4 clean-up, session 003 kickoff.
- Approve each future push to GitHub (D-009). Carried: D-009, session 003 kickoff.
- When convenient: OQ-003 (Lauren's PC browser), OQ-006 (plan if old.reddit.com goes away); decide on the handoff rules reminder. Carried: open-questions.md, todo.md, START_HERE.

## Lessons
- L-03 Edit code with the Edit tool, not scripted find-and-replace.

## Next
Session 003: continue M4 with the feed picker (layout-spec 5.6): the "Home ⌄" button opens a sheet with a filter field, Home / Popular / All chips and the user's subscribed subreddits, and switching feeds stays inside the reader. Kickoff: handoff/kickoffs/session-003-kickoff.md; start prompt: handoff/kickoffs/session-003-start-prompt.md.
