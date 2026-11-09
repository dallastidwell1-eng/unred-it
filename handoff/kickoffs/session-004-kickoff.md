# Session 004: M4 card view

Posture: build session; Claude builds and checks in the preview, the owner approves gates and tests in his Firefox; one thing at a time.
Written at the close of session 003. Read with handoff/START_HERE.md.

## Session-start check
1. Read CLAUDE.md, handoff/START_HERE.md, this kickoff, and the log of session 003 (handoff/sessions/003_2026-11-06_m4-feed-picker.md).
2. Run the snapshot check. Every line should read MATCH; explain any DIFFERENT or UNREAD line before other work.
3. Other checks:
   - `node -v` (v24.x), `npm -v`, `gh auth status` (logged in as dallastidwell1-eng).
   - `git remote -v` shows origin git@github.com:dallastidwell1-eng/unred-it.git; `git status` clean. `git log origin/master..master` lists only local autosave and handoff commits made after 951efc6 (push is off; they go out with the next approved push).
   - `gh run list --repo dallastidwell1-eng/unred-it --limit 1` shows the last CI run green (run 42640052752 at 951efc6).
   - `npm run check` exits 0 (154 tests; AMO lint 0 errors, 1 known warning about innerHTML in Preact).
4. Open this session's log.
5. Report to the owner in three lines and wait for the go.

## Where we are
- M4 progress and the order of what is left: handoff/todo.md (M4). Built and owner-tested: compact feed, opened post, comments, voting, feed picker, top bar with search (D-058, D-060), account button (D-059), subreddit links, every reddit.com link in the reader (D-027).
- Feed row: src/ui/FeedRow.tsx; feed list and views: src/ui/App.tsx; styles: src/ui/reader.css; tokens: src/ui/tokens.ts; colors: design/color-spec.md.
- Card design: design/layout-spec.md 5.3 and the "card" view of design/mockups/Main.dc.html (props `view: card`; see the `isCard` branch). D-019: cards are Lauren's view; the owner uses compact.
- Developer preview with sample data: `dev-preview/` (browser pane preview_start "reader-preview"; ?theme=dark|light; ?feed= for other pages). Its shadow root is open so layout can be measured. The pane draws no animation frames and fires no scroll or focus events of its own: finish animations and dispatch events when checking.
- The owner tests by reloading the temporary add-on in about:debugging (`.output/firefox-mv3/manifest.json` after `npm run build`). Claude's browser cannot open reddit.com.

## What this session does
1. **Ask the owner first:** how to switch between compact and card before the settings page exists (M6, D-024, D-028). Options to offer: a small switch in the top bar or account area for now, or a stored preference with a temporary control that M6 replaces. Record the answer as a decision.
2. **Card view (layout-spec 5.3).** One column, 12 px from the screen edges and 12 px apart, never a grid; radius 14, 1 px border, surface fill; meta line on top (14 px top padding), title 18/600, then one of: image 220 px high at full card width, a two-line text excerpt, or a link chip; footer with score and comment-count button, 12 px padding. Same behavior as compact rows: content opens the content layer, comments open the comments view, subreddit names are links, no vote/save/reply in the feed (D-022). Unit tests for any new pure logic (for example the text excerpt). Done when: `npm run check` passes, the preview shows cards correctly at 375 px and 1280 px in dark and light, and the owner confirms it in his Firefox.
3. **Then, if time allows, with the owner's go:** the promoted-posts checklist (todo M4 item 2): list known promo and ad types on old.reddit.com, confirm the reader draws none (the .json feeds carry no ads; check for `promoted` or `is_ad`-style fields and stickied ads).
4. Push only with the owner's approval each time (D-009); check before each push: `hk scan`, `npm run check`, and no personal names or the owner's Reddit username in the outgoing diff.
- Deliverable: card view works in the owner's Firefox and is pushed with green CI.

## Binding lessons
- L-01 Append new decisions, questions and lessons at the end of their file; check the order.
- L-02 Write files with the editor tools, not bash heredocs with apostrophes.
- L-03 Edit code with the Edit tool, not scripted find-and-replace.

## Owner follow-throughs
- Approve each push (D-009) and any new package.
- Not needed this session: the AMO account and keys (M2, needed for the phone check), OQ-014 (before M8).

## Scope
In: M4 card view and its view switch; the promo checklist only with the owner's go.
Out: M2 signing (needs the owner's keys), M5 save/reply/share, the settings page (M6), profiles and the account page (M7), entering any credential (D-007).
When the deliverable is done, the owner runs /handoff:handoff, which writes session 005's kickoff and start prompt, commits, and stops. Do not prompt the owner to run it.
