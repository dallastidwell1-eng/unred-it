# START HERE: reddit

Next session: 005
To start: open a fresh chat in this project and paste `handoff/kickoffs/session-005-start-prompt.md`.
Last closed: session 004 (2026-11-09), M2, M4 and M5 done: card view, promo checklist, phone builds, one post page, save/share/comment/reply.

## Current state
- Product: "Unred It", a Firefox extension (TypeScript + WXT, Manifest V3, Preact) that rebuilds old.reddit.com into a clean, single-column reader in the user's own logged-in browser. No Reddit API keys, no server (D-002, D-047). For the owner, later his wife Lauren; AMO listing at M8.
- Code: public repo https://github.com/dallastidwell1-eng/unred-it (branch master, CI green at 1d28637). `npm run check` runs format, lint, type-check, 198 tests, build and Mozilla's add-on lint. Add-on ID `unred-it@praxisdesignworks` (D-045). Never push the local branch `backup/pre-public-2026-11-06` (D-048).
- Done (handoff/todo.md): M1 to M5. Owner-tested on Firefox desktop and Firefox for Android: compact and card feeds (D-061, temporary view button until M6); one post page with content on top and comments underneath (D-062); voting, save (posts and comments), share, comment and reply (D-063); feed picker; search in the reader (D-058, D-060); account button (profile until M7, D-059); every reddit.com link opens in the reader (D-027); no ads (docs/promo-checklist.md); light/dark follows Firefox's theme; phone layout via a viewport tag.
- Phone builds: the owner signs unlisted builds in his own PowerShell window (docs/releasing.md); last signed 0.1.3, so the next needs 0.1.4 or higher.
- Plan: 63 decisions in `handoff/decisions.md`; milestones in `handoff/todo.md`; 6 open questions in `handoff/open-questions.md`. Design: `design/`.
- Developer preview with sample data: `dev-preview/`, started from the browser pane as "reader-preview" (`.claude/launch.json`). It is not the phone (L-04).

## Single next step
Session 005: M6 settings page (theme, compact/card view, filters, Firefox Sync), first asking the owner how the page is reached before M7 (run-book: `handoff/kickoffs/session-005-kickoff.md`).

## Waiting on the owner
- Keep the AMO account and API keys yourself (D-007); sign each phone build per `docs/releasing.md`.
- Before M8: OQ-014, read (or paste) Reddit's Data API Terms and Developer Terms; Claude's tools cannot open them.
- Approve each push and each new package (D-009).
- When convenient: OQ-003 (Lauren's PC browser), OQ-006 (plan if old.reddit.com goes away); whether to turn on the handoff rules reminder (todo.md).
- The mock-up canvas is private: https://claude.ai/artifact/4bvBsLEsHSjXSeseQziTmt

## Top binding lessons
- L-01 Append new decisions, questions and lessons at the end of their file; check the order.
- L-02 Write files with the editor tools, not bash heredocs with apostrophes.
- L-03 Edit code with the Edit tool, not scripted find-and-replace.
- L-04 The developer preview is not old.reddit.com on a phone; test page- and device-dependent things in the built add-on.

## Snapshot at the last close
<!-- SNAPSHOT START -->
```
taken_at: 2026-11-09 11:28 -0700
branch: master
base_commit: 0be139607e59
base_subject: autosave (turn): 2026-11-09 11:20
working_tree: 8 changed
fp_config: 984bd33a2180 (6 files)
decisions: 63
open_questions: 6
lessons: 4
autosave_last: 2026-11-09 11:22:45 turn head=0be1396 push=off
```
<!-- SNAPSHOT END -->
