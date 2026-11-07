# START HERE: reddit

Next session: 003
To start: open a fresh chat in this project and paste `handoff/kickoffs/session-003-start-prompt.md`.
Last closed: session 002 (2026-11-06), M1 done, M2 prepared, M4 well under way.

## Current state
- Product: "Unred It", a Firefox extension (TypeScript + WXT, Manifest V3, Preact) that rebuilds old.reddit.com into a clean, single-column reader in the user's own logged-in browser. No Reddit API keys, no server (D-002, D-047). For the owner, later his wife Lauren; AMO listing at M8.
- Code: public repo https://github.com/dallastidwell1-eng/unred-it (branch master, CI green at 222a91f). `npm run check` runs format, lint, type-check, 84 tests, build and Mozilla's add-on lint. Add-on ID `unred-it@praxisdesignworks` (D-045). The local branch `backup/pre-public-2026-11-06` holds the pre-public history; never push it (D-048).
- Built and owner-tested in Firefox desktop (M4 progress in `handoff/todo.md`): rebuilt feed with endless scroll on feed pages; opened post over the feed (cleaned text, images, galleries, videos with sound, link cards); voting on posts and comments; comments view with folding threads, load more, sort, and the post at the top. Back/Esc close one view at a time.
- M2 is prepared (sign script, `docs/releasing.md`, reproducible sources zip) and waits for the owner's AMO account and keys.
- Plan: 57 decisions in `handoff/decisions.md`; milestones in `handoff/todo.md`; 6 open questions in `handoff/open-questions.md`. Design: `design/` (layout-spec 5.4 updated for D-054 to D-056).
- Developer preview with sample data: `dev-preview/`, started from the browser pane as "reader-preview" (`.claude/launch.json`).

## Single next step
Session 003: M4 feed picker (layout-spec 5.6) (run-book: `handoff/kickoffs/session-003-kickoff.md`).

## Waiting on the owner
- Report the temporary "Font: …" line at the bottom of the feed, so it can be removed.
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
