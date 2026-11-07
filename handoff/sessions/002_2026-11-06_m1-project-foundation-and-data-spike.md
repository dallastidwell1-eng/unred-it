# Session 002: M1 project foundation and data spike

Status: in progress
Date: 2026-11-06 · Started 20:58 · Closed HH:MM
Chat: Claude desktop app (Code tab), Opus 5.5 (claude-opus-5-5)
Kickoff: handoff/kickoffs/session-002-kickoff.md

## Start check
- `hk status`: next_session_number = 2, matches the start prompt. No log was left in progress.
- `hk check`: ALL MATCH (fp_config, decisions 42, open_questions 8, lessons 2, base_commit c5d5fb8 in the history of HEAD c2e8611). Working tree clean.
- Tools: Node v24.13.0, npm 11.6.2, git 2.53.0, gh logged in as dallastidwell1-eng (protocol ssh). Firefox 159.0 at `C:\Program Files\Mozilla Firefox\firefox.exe`. `git remote -v`: none, as expected.
- Nothing in START_HERE or the kickoff found wrong.

## Goal
Milestone M1: the WXT + TypeScript extension foundation (license, approved packages, extension ID, scaffold, visible marker on old.reddit.com), the data spike that answers OQ-011 (read and vote from the logged-in browser), and the public GitHub repository with passing CI.

## What was done
1. 20:58 Session opened; start check done (see Start check). Checked by `hk status`, `hk check` and the tool version commands.
2. 21:04 Owner chose MIT. Closed OQ-008, recorded D-043 (appended at the end of decisions.md; `grep` shows D-043 last, 7 open questions). Checked current npm versions for the M1 package list: typescript-eslint 8.72.1 supports TypeScript only below 6.1.0, so TypeScript 7.0.2 (latest) cannot be used yet; TypeScript 6.0.3 is the newest that fits. WXT 0.21.5 needs vite as a peer (8.3.6 fits).
3. 21:06 Owner approved the package list (D-044), chose add-on ID `unred-it@praxisdesignworks` (D-045) and copyright "Dallas Tidwell". Web search on MV2 vs MV3 for Firefox (Extension Workshop migration guide; Mozilla Add-ons blog 2024-05-14) and WXT defaults (wxt.dev: Firefox defaults to MV2).
4. 21:13 Scaffold done (M1 step 4): package.json, wxt.config.ts (MV3, D-046; srcDir src, explicit imports, storage + 3 https reddit hosts, gecko id, min Firefox 140 / Android 142, data_collection none), tsconfig (strict), eslint.config.js (strictTypeChecked), Prettier, vitest.config.ts (WxtVitest), src/lib/marker.ts + 3 tests, src/entrypoints/old-reddit.content.ts, public/icon.svg (copy of design/brand/icon.svg), README.md, LICENSE (MIT, Dallas Tidwell), .gitignore build entries. Checked: `npm run check` exit 0 (format, lint on 6 files, tsc, 3/3 tests, build 5.33 kB, web-ext lint 0 errors 0 warnings 0 notices).
5. 21:20 Visible marker (M1 step 5): owner loaded `.output/firefox-mv3/manifest.json` as a temporary add-on in his normal, logged-in Firefox and saw the "unred it" badge at the lower right of old.reddit.com (owner's screenshot: front page, logged in; "nice work"). Claude could not start Firefox from the sandbox ("Access is denied"); the owner loaded it by hand.
6. 21:22 Spike code written (M1 step 6, not yet run): src/lib/reddit-data.ts (parsers for feed, thread, /api/me, post ID from URL, vote form body; 10 new unit tests) and a temporary test panel, src/spike/spike-panel.ts + src/entrypoints/spike.content.ts, shown only at old.reddit.com/#unred-spike. It tries two request modes (the content script's own fetch, and Firefox's content.fetch as the page), never shows the modhash, and asks for a confirm before each vote. Checked: `npm run check` exit 0 (13/13 tests, build 15.59 kB, web-ext lint 0/0/0).
7. 21:28 Spike run by the owner at 21:26 to 21:27 in his logged-in Firefox 159 (pasted log): "page" mode (content.fetch) not available; "extension" mode logged in (modhash present, 50 chars); front page 10 posts read (590 ms); a post the owner chose read with 13 of 13 comments, depth kept; upvote HTTP 200, likes null to true; undo HTTP 200, likes true to null. Rate-limit headers only on the vote replies (remaining about 1997, reset about 180 s). Closed OQ-011 (reads and votes; saves and comments untested), recorded D-047. Reddit's terms could not be read: WebFetch refuses redditinc.com, the help-center wiki returned 403, and the built-in browser blocks redditinc.com; a web search found only third-party blogs. Opened OQ-014 for the owner. Removed the owner's Reddit username from this log (the repository will be public).

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
