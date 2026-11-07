# Session 001: Agree the project plan

Status: closed
Date: 2026-11-06 · Started 18:08 · Closed 20:51
Chat: Claude desktop app (Code tab), Opus 5.5 (claude-opus-5-5)
Kickoff: handoff/kickoffs/session-001-kickoff.md

## Start check
- `hk status`: next_session_number = 1, matches the start prompt. No log was left in progress.
- `hk check`: "FAIL: no snapshot block found in START_HERE.md". Expected: this is the first session and START_HERE says no snapshot exists yet. Nothing to compare.
- Git: one uncommitted file, `handoff/kickoffs/session-001-start-prompt.md`. The owner edited the Deliverable line (interview Dallas with /clarifying-interview; goal: a simple app for browsing and interacting with Reddit). The edit matches the start prompt the owner pasted. Explained.
- Other checks: none set up (kickoff step 3).

## Goal
Interview the owner (Dallas) and agree the project plan: purpose, scope, stack, first milestones. Record it in decisions.md, open-questions.md and todo.md. Planning only; no code.
Scope change (owner, 18:38): the session went on to run the design interview and complete milestone M3 (visual design: mock-ups, colors, brand, layout spec). Still no project code.

## Purpose (kickoff step 1)
The project is a polished, easy-to-install Firefox extension that reskins old.reddit.com for the owner (Dallas) and, once it is stable, his wife. It runs inside the user's own logged-in browser on Windows/Mac PCs and Android phones. It gives a clean look with dark mode, removes ads and promos, adds content filters and improves reading. Login, voting and commenting stay Reddit's own. It uses no Reddit API, no server and no stored credentials. Code is TypeScript built with WXT, kept in a public GitHub repository, and distributed as a listed add-on on addons.mozilla.org. The owner is architect, designer and tester. Claude does all build work except security items.

## What was done
1. 18:10 Session opened; start check done (see Start check). Checked by `hk status` and `git diff`.
2. 18:12 Clarifying interview, round 1: purpose (owner, later wife), platform (web/browser), interaction (log in, vote, comment).
3. 18:15 Web search on Reddit API access: self-service reportedly closed about 2025-11-11 (secondary sources only; OQ-009). Interview round 2: no existing client ID; owner wants "a skin on reddit.com/old.reddit.com".
4. 18:20 Explained browser-skin vs hosted-site trade-offs. Owner chose the browser skin on old.reddit.com; Firefox on Android accepted.
5. 18:24 Round on stack: TypeScript + build; public GitHub repo; order: phone, look/dark, no ads, filters, more. Owner wants an easy-to-install package.
6. 18:27 Web search on Firefox signing/self-distribution (Extension Workshop). Owner chose a listed AMO extension, approval gates (push, AMO upload, new libraries), WXT, signed test files for the phone, and a separate design interview.
7. 18:28 Checked the PC: Node 24.13.0, npm 11.6.2, git 2.53, gh 2.89 logged in as dallastidwell1-eng; adb not installed; no git remote.
8. 18:35 Recorded D-001 to D-013 in decisions.md, OQ-001 to OQ-009 in open-questions.md, milestones M1 to M8 in todo.md. Checked by reading the files back in the editor.
9. 18:38 Owner extended this session to run the M3 design interview early (planning only, still in scope; no code). Explained restyle / rearrange / rebuild. Round 1: minimalism rule, depth per screen, switchable card/compact (D-014, D-015).
10. 18:41 Wrote design/references.md: 5 styles x 3 sites; made design/screens/ for the owner's marked-up screenshots (D-016). All 15 URLs checked with curl: 13 returned 200; Medium 403 and Unsplash 401 (bot blocking, normal in a browser).
11. 18:59 Owner gave per-site feedback and a marked-up Medium screenshot (references/). Owner invoked /expert in web design. Recorded D-017 to D-019; feedback written into design/references.md; screenshot folder changed to references/ (empty design/screens/ removed).
12. 19:00 Round 2: slim top bar, content layer over the feed, keep place without reload, actions only inside posts (D-020 to D-022).
13. 19:02 Rounds 3 to 5: left thumbnail, row details, themes and a separate settings page, link previews, collapsible thread lines with visible marker, all reddit links open in ours, Firefox Sync, unread dot (D-023 to D-029). Closed OQ-005, OQ-007.
14. 19:07 Name: checked about 30 candidates on the AMO search API; owner chose his own pun, "Unred It" (D-030). Found an existing AMO add-on "Unreddit" (OQ-010).
15. 19:09 Checked plan against design answers: added the data spike to M1 (OQ-011), folded ad removal into the core build, rewrote M1 to M8 in todo.md, opened OQ-012. Counts checked with grep: 30 decisions, 10 open and 2 closed questions.
16. 19:18 Owner asked for mock-ups (start of M3). Built a design canvas, https://claude.ai/artifact/4bvBsLEsHSjXSeseQziTmt (private to the owner), with 6 boards: interactive phone prototype (feed compact/card, dark/light via Tweaks, content layer, comments with fold markers, keep-place Back), subreddit picker, account page (rebuilt, Claude's OQ-012 default), settings (light), desktop with post open over the feed, name/icon options. Sources copied to design/mockups/. Each board published successfully; not visually checked by Claude (the canvas type says not to verify unless the owner asks); awaiting owner review.
17. 19:33 Owner loved the mock-ups except the colors. Defined 5 palettes (Indigo Night, Stone & Clay, Pine, Harbor, Graphite & Amber), dark and light; every text and accent color checked at 4.5:1 or better with a contrast script (one downvote color fixed). Added a palette switch to the prototype's Tweaks, a side-by-side Palettes board, and fixed the "Open article" button text contrast. Copied to design/mockups/. Awaiting the owner's pick.
18. 19:38 Owner rejected all 5, including the backgrounds. Short interview: both modes equal; softer grounds (no near-black, no pure white); a gentle shared tint. Replaced with 5 soft palettes (Dusk, Sand, Sage, Mauve, Fog), dark grounds about #1F-#24 and light grounds off-white; all text/accent colors 4.5:1 or better against bg, surface and raised panels (contrast2.js, 0 fails). Updated the prototype palette switch (default Dusk) and the Palettes board. Copied to design/mockups/.
19. 19:44 Owner: tinted grounds are worse; no color in the background; Dusk closest. Recorded D-031 (neutral grounds, color only in the accent) and OQ-013. Replaced palettes with a mixer: 4 neutral dark grounds, 3 neutral light grounds, 5 accents; all 35 combinations checked at 4.5:1 or better (contrast3.js, lowest 4.69). Prototype Tweaks now: accent, darkGround, lightGround. Board rebuilt; copied to design/mockups/.
20. 19:48 Owner: "Lose the brown. Shades of grey, blue, brass/copper, and red." Recorded D-032 with color roles (grey: everything; blue: actions + downvote; copper/brass: upvote; red: unread only) and revised OQ-013. Placeholder image tiles changed from brown to grey/blue-grey. Contrast checked (contrast4.js): blue and dark-mode metal text at 4.5:1 or better, light-mode metal arrows and red dots at 3:1 or better (two metal shades deepened to pass), 0 fails. Prototype Tweaks now: blue, metal, red, darkGround, lightGround. Color board rebuilt; canvas labels updated; copied to design/mockups/.
21. 19:52 Owner: "more brass, less copper". Copper dropped; three brass shades (pale #E2C98A/#8C772C, classic #D6B26A/#957624, antique #C9A35A/#86651F) checked with contrast5.js, 0 fails. Prototype Tweak "brass" (default classic); board and labels updated; D-032 and OQ-013 updated; copied to design/mockups/.
22. 19:57 Owner set vote colors: dark = pale brass up, brick down; light = brighter brass and red. Bright colors fail 3:1 as thin arrows on light grounds, so light-mode votes show as filled chips with charcoal text (contrast6.js: 9.14 and 5.01; dark pale brass 8.62, brick 4.65; 0 fails). Recorded D-033; OQ-013 partly answered (grounds and blue shade still open). Prototype: brass/red Tweaks removed, chips added; board and labels updated; copied to design/mockups/.
23. 20:00 Owner chose Deep #1A1A1A and Paper #FAFAFA and asked for "the boxes on Paper" on Deep (read as the vote chips). Dark chips checked: brass 10.74, brick 5.80 with #1A1A1A text. Recorded D-034; OQ-013 now only the blue shade (dusty shown). Prototype defaults set to Deep/Paper with chips in both modes; new "FINAL colors: Deep and Paper" board added for owner review; copied to design/mockups/. Owner asked to see it before moving on.
24. 20:06 Owner: "Go back to no boxes on Deep and that's it, final version". Removed dark chips (prototype and Final board). Recolored Picker, Account, Settings, Desktop and Brand boards to the final palette (switch and active tab to blue, unread to red, desktop upvote to pale brass, brown tiles to grey); grep confirmed no old colors remain. Wrote design/color-spec.md (tokens, roles, contrast). Recorded D-035; closed OQ-013. Copied all boards to design/mockups/. Counts: 35 decisions, 10 open questions.
25. 20:11 Started logo and name styling (OQ-004). Rebuilt the Brand board: 5 wordmark treatments (pun in red, title case, struck-out "a", unread dot, icon lockup) on Deep and Paper in Inter Tight; 5 app icons (u + dot, ring + dot, u with brass upvote stem, half-red dot, speech bubble + dot) at 112 px on both tiles and at 48/32/16 px. Moved the color row down to make room. Copied to design/mockups/. Awaiting owner's pick.
26. 20:16 Owner chose wordmark #1 (recorded D-036) and asked for an app icon of an upside-down lowercase r in red on black. Rebuilt the Brand board: lockups of the chosen wordmark with the icon on Deep and Paper; 4 turned-r versions (drawn brick on Deep, drawn bright red on true black, Inter Tight bold glyph brick, Inter Tight extra-bold bright red) at 140/48/32/16 px and in a mock browser toolbar. Glyph versions depend on font loading; not visually checked by Claude. Copied to design/mockups/. Awaiting owner's pick.
27. 20:18 Owner chose icon version 1 (drawn, brick on Deep). Recorded D-037; closed OQ-004 (store listing text moved to M8). Saved design/brand/icon.svg and design/brand/README.md (icon and wordmark rules). Checked icon.svg by screenshot in the browser pane: renders as the brick turned r on the Deep tile. Updated todo.md (M3 progress, M8 listing text). Counts: 37 decisions, 9 open questions.
28. 20:23 Account-page round: owner chose hybrid (frequent screens rebuilt, rare Reddit settings in a new tab), History = posts opened (on-device, Firefox Sync, capped because sync storage is about 100 KB per MDN, to confirm in the build), Inbox = full messaging. Recorded D-038 to D-040; closed OQ-012. Account board: added "New message" button and "Reddit account settings" new-tab link; copied to design/mockups/. Updated todo.md (M7 detail, M3 progress). Counts: 40 decisions, 8 open questions.
29. 20:32 Wrote design/layout-spec.md (type scale, spacing, radii, breakpoints, every component, icons, motion, accessibility). Values marked [M] were taken from the mock-up source; [P] marks Claude's proposals (tablet breakpoint, hide-on-scroll top bar, motion timings, focus ring, large-text scale 1.125, clear-history control, max image height). Recorded D-041 (owner sign-off pending). Found and fixed decision order in decisions.md (D-030 had ended up last, D-041 above D-040); a script check confirms D-000 to D-041 run in order. Updated todo.md (M3: awaiting sign-off).
30. 20:35 Owner approved M3, including the [P] proposals. Updated D-041 (owner-approved) and recorded D-042 (M3 complete; next milestone M1 with the data spike, OQ-011). Marked M3 DONE in todo.md. Script check: D-000 to D-042 in order; 8 open questions. Autosave has committed the earlier steps (git shows only decisions.md and todo.md changed).

## Decisions
- D-001 Purpose: personal Reddit skin for the owner, later his wife; polished, best practices.
- D-002 Approach: browser extension on old.reddit.com; no API, no server, no cookies.
- D-003 Base site: old.reddit.com.
- D-004 Package: Firefox extension, listed on AMO.
- D-005 Stack: TypeScript + WXT.
- D-006 Public GitHub repository, no secrets.
- D-007 Owner holds all credentials; Claude never handles them.
- D-008 Phone testing with signed private test builds installed from file.
- D-009 Approval gates: GitHub push, AMO upload, new libraries.
- D-010 Roles: owner architect/designer/tester; Claude builds.
- D-011 Feature order.
- D-012 Design set by a dedicated interview.
- D-013 Target devices.
- D-014 to D-016 Design: subtract principle; switchable views; references drive the visuals.
- D-017 to D-019 One column, no rails; Linear + Mastodon readability; compact for the owner, cards for Lauren.
- D-020 to D-022 Slim top bar; posts open over a live feed; actions only inside posts.
- D-023 to D-029 Row anatomy; themes + separate settings page; link preview; thread collapse markers; all reddit links open in ours; Firefox Sync; unread dot.
- D-030 Name: Unred It.
- D-031 Neutral grounds, color only in the accent.
- D-032 Color family grey, blue, brass, red; no brown; roles (brass replaced copper).
- D-033 Vote colors; light-mode chips.
- D-034 Grounds Deep and Paper (dark chips later removed by D-035).
- D-035 Final palette; design/color-spec.md.
- D-036 Wordmark: lowercase "unred it", "red" in red.
- D-037 App icon: drawn upside-down r, brick on Deep; design/brand/icon.svg.
- D-038 Account page: hybrid.
- D-039 History = posts opened, on the user's devices, capped.
- D-040 Inbox: full messaging.
- D-041 Layout and type spec (design/layout-spec.md), owner-approved.
- D-042 M3 complete; next is M1.

## Verification
Snapshot taken 2026-11-06 20:52 (first snapshot of the project; nothing earlier to compare). Expected vs shown:
- decisions: expected 42 (D-001 to D-042 added this session) → snapshot shows 42. Order checked by script: D-000 to D-042 in sequence.
- open_questions: expected 8 open (13 opened, 5 closed) → snapshot shows 8.
- lessons: expected 2 (L-01, L-02) → snapshot shows 2.
- fp_config: this session did not change CLAUDE.md, .claude/settings.json, handoff/config.json or handoff/templates → `git diff HEAD` on those paths is empty; the fingerprint is recorded as the baseline for session 002.
- base_commit c5d5fb8 is the last autosave (20:36), as expected; working_tree 6 changed = the close edits (START_HERE, lessons, session log, todo, two new session-002 kickoff files), committed in the close commit.
- Design work is in Git: `git ls-files design` lists 14 files (references.md, color-spec.md, layout-spec.md, brand/ 2, mockups/ 9); references/ holds the owner's marked-up screenshot.
- The owner approved: the plan (interview answers), the final palette (D-035), wordmark (D-036), icon (D-037), account page (D-038 to D-040), layout spec and M3 (D-041, D-042).
- Not verified: OQ-011 (the data spike) is untested by design; it is session 002's first risk. The mock-up canvas boards were not visually checked by Claude, except design/brand/icon.svg (screenshot) and the owner's own review on the canvas.

## Found along the way
Each item names where it is carried forward.
- Reddit's self-service API access is reportedly closed (about 2025-11-11); one source says new requests stopped after 2026-10-31. Secondary sources only. Carried: OQ-009, D-002.
- Firefox for Android cannot install a self-hosted extension from a web link; it needs the hidden "Install extension from file" menu (Extension Workshop). Carried: D-004, D-008.
- Chrome on Android does not support extensions; the phone browser must be Firefox. Carried: D-013, D-004.
- An AMO add-on named "Unreddit" (shows removed comments) already exists. Carried: OQ-010, D-030.
- Firefox Sync storage for an extension is small (about 100 KB per MDN, not verified). Carried: D-039, todo M7.
- Bright brass and red are below 3:1 as thin icons on light grounds. Carried: D-033, design/color-spec.md (rule 5 and the note).
- A bash heredoc with apostrophes failed to parse in the Bash tool. Carried: lesson L-02.
- Inserting new decisions by anchoring on an existing heading put them above it; D-030 ended up last. Fixed at step 29. Carried: lesson L-01.
- A turned lowercase r can read at a glance as a hooked "J". Told the owner; he chose it knowingly. No follow-up needed.
- The mock-up canvas is private to the owner's account. Carried: START_HERE "Waiting on the owner" (share it if others need it) and the session 002 kickoff.

## Judgment calls
Each item names where it is carried forward.
- Split the work into milestones M1 to M8; foundation before "phone", design before "look", reading flow after filters. Carried: todo.md.
- Default license MIT, not decided. Carried: OQ-008 (session 002 asks first). Settings sync default became D-028 (closed OQ-007).
- Name and branding deferred to the design interview; since decided. Carried: D-030, D-036, D-037 (OQ-004 closed).
- Every compact row keeps a fixed thumbnail slot so titles align. Carried: design/layout-spec.md 5.2 (owner-approved with M3).
- Read "keep place and not reload" (D-021) as requiring rebuilt views; the data spike is the first risk. Carried: OQ-011, todo M1.
- Folded "no ads" into the core build. Carried: todo M4.
- Light-mode votes shown as chips because bright colors fail 3:1 as thin arrows. Carried: D-033, color-spec.md (owner approved).
- Read "the boxes on Paper" as the vote chips; owner then removed them from Deep. Carried: D-034, D-035. No follow-up.
- Recommended the hybrid account page; owner chose it. Carried: D-038.
- Proposed [P] values in the layout spec; owner approved them. Carried: D-041, layout-spec.md.

## State at close
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

## Open questions
Opened OQ-001 to OQ-013. Closed OQ-004 (D-030, D-036, D-037), OQ-005 (D-027), OQ-007 (D-028), OQ-012 (D-038 to D-040), OQ-013 (D-035). Still open (8): OQ-001, 002, 003, 006, 008, 009, 010, 011.

## Owner follow-throughs
Each item names where it is carried forward.
- Answer OQ-008 (license; MIT default) at the start of session 002, because M1 needs it. Carried: OQ-008, session 002 kickoff, START_HERE.
- Approve the M1 dev packages (D-009) when session 002 lists them. Carried: session 002 kickoff.
- Answer OQ-003 (Lauren's PC browser) and OQ-006 (plan if old.reddit.com goes away) when convenient. Carried: open-questions.md, START_HERE.
- Decide whether to turn on the handoff rules reminder for the D-009 gates. Carried: todo.md, START_HERE.
- Before M2: create a Mozilla (AMO) developer account and signing API keys; keep them yourself. Carried: todo M2, START_HERE.
- Share the mock-up canvas from its Share menu if anyone else needs to see it. Carried: START_HERE.

## Lessons
- L-01 Append new decisions (and questions, lessons) at the end of their file; check the order.
- L-02 Write files with the editor tools, not bash heredocs with apostrophes.

## Next
Session 002 runs milestone M1: the WXT + TypeScript project foundation and the data spike (OQ-011). Kickoff: handoff/kickoffs/session-002-kickoff.md; start prompt: handoff/kickoffs/session-002-start-prompt.md.
