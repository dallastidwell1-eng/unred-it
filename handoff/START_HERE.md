# START HERE: reddit

Next session: 004
To start: open a fresh chat in this project and paste `handoff/kickoffs/session-004-start-prompt.md`.
Last closed: session 003 (2026-11-09), M4 feed picker, top bar, search and Reddit links done.

## Current state
- Product: "Unred It", a Firefox extension (TypeScript + WXT, Manifest V3, Preact) that rebuilds old.reddit.com into a clean, single-column reader in the user's own logged-in browser. No Reddit API keys, no server (D-002, D-047). For the owner, later his wife Lauren; AMO listing at M8.
- Code: public repo https://github.com/dallastidwell1-eng/unred-it (branch master, CI green at 951efc6). `npm run check` runs format, lint, type-check, 154 tests, build and Mozilla's add-on lint. Add-on ID `unred-it@praxisdesignworks` (D-045). The local branch `backup/pre-public-2026-11-06` holds the pre-public history; never push it (D-048).
- Built and owner-tested in Firefox desktop (M4 progress in `handoff/todo.md`): compact feed with endless scroll; opened post (text, images, galleries, videos with sound, link cards); voting; comments view; feed picker; top bar with search shown in the reader (Subreddits, Users, Posts; D-058, read from Reddit's search page because search.json is blocked, D-060), account button with unread dot (opens the profile until M7, D-059), bar hides on scroll; subreddit names are links; every reddit.com link opens in the reader, including post and comment addresses and www.reddit.com pages (D-027). Bundled Inter font loads.
- M2 is prepared (sign script, `docs/releasing.md`, reproducible sources zip) and waits for the owner's AMO account and keys.
- Plan: 60 decisions in `handoff/decisions.md`; milestones in `handoff/todo.md`; 6 open questions in `handoff/open-questions.md`. Design: `design/`.
- Developer preview with sample data: `dev-preview/`, started from the browser pane as "reader-preview" (`.claude/launch.json`).

## Single next step
Session 004: M4 card view (layout-spec 5.3), first asking the owner how to switch views before M6 (run-book: `handoff/kickoffs/session-004-kickoff.md`).

## Waiting on the owner
- Before M2: create a Mozilla (AMO) developer account and API keys, keep them yourself (D-007); then sign per `docs/releasing.md`.
- Before M8: OQ-014, read (or paste) Reddit's Data API Terms and Developer Terms; Claude's tools cannot open them.
- Approve each push and each new package (D-009).
- When convenient: OQ-003 (Lauren's PC browser), OQ-006 (plan if old.reddit.com goes away); whether to turn on the handoff rules reminder (todo.md).
- The mock-up canvas is private: https://claude.ai/artifact/4bvBsLEsHSjXSeseQziTmt

## Top binding lessons
- L-01 Append new decisions, questions and lessons at the end of their file; check the order.
- L-02 Write files with the editor tools, not bash heredocs with apostrophes.
- L-03 Edit code with the Edit tool, not scripted find-and-replace.

## Snapshot at the last close
<!-- SNAPSHOT START -->
```
taken_at: 2026-11-09 08:18 -0700
branch: master
base_commit: bfd12cc5d390
base_subject: autosave (turn): 2026-11-09 08:16
working_tree: 5 changed
fp_config: 984bd33a2180 (6 files)
decisions: 60
open_questions: 6
lessons: 3
autosave_last: 2026-11-09 08:16:51 turn head=bfd12cc push=off
```
<!-- SNAPSHOT END -->
