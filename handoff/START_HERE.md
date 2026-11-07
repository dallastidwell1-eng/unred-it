# START HERE: reddit

Next session: 002
To start: open a fresh chat in this project and paste `handoff/kickoffs/session-002-start-prompt.md`.
Last closed: session 001 (2026-11-06), plan agreed and visual design (M3) done.

## Current state
- Product: "Unred It", a Firefox extension (TypeScript + WXT) that rebuilds old.reddit.com into a clean, single-column reader in the user's own logged-in browser. For the owner, later his wife Lauren. No Reddit API keys, no server. Listed on addons.mozilla.org later (M8).
- Plan: 42 decisions in `handoff/decisions.md`; milestones M1 to M8 in `handoff/todo.md`; 8 open questions in `handoff/open-questions.md`.
- Design is done and approved (M3, D-042): `design/layout-spec.md`, `design/color-spec.md`, `design/brand/` (icon.svg), `design/mockups/`. Canvas (private to the owner): https://claude.ai/artifact/4bvBsLEsHSjXSeseQziTmt
- No project code yet. Git is local only (no remote). Node 24, git, gh (logged in as dallastidwell1-eng) and Firefox desktop are on the PC.
- Biggest open risk: OQ-011, whether the extension can read Reddit data and vote from the logged-in browser.

## Single next step
Session 002: milestone M1, the project foundation and the data spike that answers OQ-011 (run-book: `handoff/kickoffs/session-002-kickoff.md`).

## Waiting on the owner
- OQ-008: license for the public repo (MIT default); needed at the start of session 002.
- Approvals in session 002 (D-009): dev packages, extension ID, the post to test-vote on, GitHub repo creation and push.
- Before M2: create a Mozilla (AMO) developer account and signing keys; keep them yourself (D-007).
- When convenient: OQ-003 (Lauren's PC browser), OQ-006 (plan if old.reddit.com goes away).
- Decide whether to turn on the handoff rules reminder for the D-009 approval gates (todo.md).
- The mock-up canvas is private; share it from its Share menu if others need to see it.

## Top binding lessons
- L-01 Append new decisions, questions and lessons at the end of their file; check the order.
- L-02 Write files with the editor tools, not bash heredocs with apostrophes.

## Snapshot at the last close
<!-- SNAPSHOT START -->
```
taken_at: 2026-11-06 20:52 -0700
branch: master
base_commit: c5d5fb877e74
base_subject: autosave (turn): 2026-11-06 20:36
working_tree: 6 changed
fp_config: 984bd33a2180 (6 files)
decisions: 42
open_questions: 8
lessons: 2
autosave_last: 2026-11-06 20:47:40 turn head=c5d5fb8 push=off
```
<!-- SNAPSHOT END -->

