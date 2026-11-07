# Session 002: M1 project foundation and data spike

Posture: first build session; Claude builds, the owner approves gates and tests; one thing at a time.
Written at the close of session 001 (2026-11-06). Read with handoff/START_HERE.md.

## Session-start check
1. Read CLAUDE.md, handoff/START_HERE.md, this kickoff, and the log of session 001 (handoff/sessions/001_2026-11-06_agree-the-project-plan.md).
2. Run the snapshot check. Every line should read MATCH; explain any DIFFERENT or UNREAD line before other work.
3. Other checks:
   - `node -v` (expect v24.x), `npm -v`, `git --version`, `gh auth status` (expect logged in as dallastidwell1-eng).
   - Firefox desktop is installed at `C:\Program Files\Mozilla Firefox\firefox.exe` (seen 2026-11-06).
   - `git remote -v` (expect none yet).
4. Open this session's log.
5. Report to the owner in three lines and wait for the go.

## Where we are
- The plan and the visual design are done: 42 decisions in handoff/decisions.md; milestones in handoff/todo.md (M3 already DONE, D-042).
- The product: "Unred It", a Firefox extension (TypeScript + WXT) that rebuilds the old.reddit.com experience in the user's own logged-in browser. No Reddit API keys, no server (D-002, D-004, D-005).
- Design references for later milestones: design/layout-spec.md, design/color-spec.md, design/brand/ (icon.svg), design/mockups/ (canvas: https://claude.ai/artifact/4bvBsLEsHSjXSeseQziTmt, private to the owner).
- No project code exists yet. The repository root holds handoff/, design/, references/, CLAUDE.md, .claude/, .gitignore. Git is local only; no remote.
- The biggest risk is OQ-011: whether the extension can read feeds, posts and comments as data and send votes from the logged-in browser. Many later decisions (D-021, D-022, D-038 to D-040) depend on it.

## What this session does
Milestone M1 in handoff/todo.md. In order:
1. **License.** Ask the owner to answer OQ-008 (default MIT). Done when OQ-008 is closed.
2. **Package approval (D-009).** List every package M1 needs, with one line each on why (WXT is already approved; expected: typescript, eslint with typescript-eslint, prettier, vitest; nothing else unless needed). Ask once. Done when the owner approves the list; record it as a decision.
3. **Extension ID.** Propose a Firefox add-on ID (gecko id), for example `unred-it@<owner-chosen-domain-or-name>`. It cannot change after the AMO listing, so get the owner's OK. Do not use the owner's email address unless he says so. Record as a decision.
4. **Scaffold.** WXT + TypeScript project in the repository root, Firefox target. Pick Manifest V2 or V3 from current WXT and AMO guidance; record the choice as a decision. Permissions: storage, and host access only to reddit.com hosts (old., www., bare) because D-027 redirects all Reddit links. Add lint, format, type-check, unit-test scripts, a README, the LICENSE, and .gitignore entries for build output and node_modules. Done when `npm run build` makes a Firefox package with no errors and lint, type-check and tests pass.
5. **Visible marker.** A content script that shows a small "Unred It" marker on old.reddit.com. Done when the owner loads the build as a temporary add-on in his normal Firefox profile (about:debugging > This Firefox > Load Temporary Add-on) and sees the marker. Note: WXT's dev runner opens a fresh profile that is not logged in to Reddit; use the owner's profile for anything that needs his login.
6. **Data spike (OQ-011).** From the content script on old.reddit.com, in the logged-in browser: read the front page feed as data, read one post and its comments as data, then send one upvote and undo it. Ask the owner to name the post to vote on before sending anything (it acts on his account). Record what worked, any limits or errors, and whether this counts as Data API use under Reddit's terms. Done when OQ-011 is closed with the evidence, and the owner sees the vote appear and disappear on Reddit.
7. **GitHub (D-006, D-009).** With the owner's approval: create the public repository under dallastidwell1-eng, add a CI workflow (lint, type-check, test, build), and push. Done when CI passes on GitHub.
- Deliverable: M1's "Done when" in handoff/todo.md is met, and OQ-011 is answered. If the spike fails, stop and record the fallback (D-021's restyle path) for the owner to decide.

## Binding lessons
- L-01 Append new decisions, questions and lessons at the end of their file; check the order.
- L-02 Write files with the editor tools, not bash heredocs with apostrophes.

## Owner follow-throughs
- Answer OQ-008 (license) at the start.
- Approve the package list, the extension ID, the vote target, and the GitHub repo creation and push (D-009).
- Be logged in to Reddit in normal Firefox desktop for steps 5 and 6.
- Not needed yet: the Mozilla (AMO) developer account and keys (M2).

## Scope
In: M1 only (foundation, marker, data spike, GitHub repo and CI).
Out: AMO account, signing or uploads (M2); the phone (M2); building the real design (M4 onward); entering any credential or key (D-007).
When the deliverable is done, the owner runs /handoff:handoff, which writes session 003's kickoff and start prompt, commits, and stops.
