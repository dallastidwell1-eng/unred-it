# To do (agreed, not scheduled)

Milestones in order. Each has a "done when" check. The approval gates in D-009 apply throughout.
Revised 2026-11-06 (session 001) after the design interview (D-014 to D-030).

- **M1 Project foundation + data spike.** WXT + TypeScript scaffold (Firefox target; permissions limited to reddit.com hosts), linting, formatting, type-check, unit tests, README, license (OQ-008), .gitignore. Public GitHub repository with a CI check (lint, type-check, build); push only with approval. **Spike (OQ-011):** from old.reddit.com in the logged-in browser, read a feed, a post and its comments as data, and send one vote and undo it.
  Done when: `npm run build` makes a Firefox package with no errors; it loads as a temporary add-on in desktop Firefox; the spike shows a feed drawn from Reddit's data and a vote that registers on Reddit; CI passes on GitHub; OQ-011 is answered.
- **M2 Works on the phone.** The owner creates the Mozilla (AMO) developer account and signing keys and holds them (D-007). Resolve OQ-002. Produce a signed private test build of the spike.
  Done when: the owner installs it on Firefox for Android from file, and the spike feed shows and a vote registers on his phone.
- **M3 Visual design spec. DONE 2026-11-06 (session 001, D-042).** Turn D-014 to D-030 into mock-ups and a written spec: type, colors (light and dark), spacing, compact row, stacked card, top bar, content layer, comments view with thread markers, settings page, account page; logo and name styling for "Unred It" (OQ-004). Answer OQ-012.
  Done when: the owner approves the mock-ups on desktop and phone sizes, and the spec is in `design/`.
  Progress (session 001, 2026-11-06): mock-ups built (design/mockups/, canvas https://claude.ai/artifact/4bvBsLEsHSjXSeseQziTmt); layout and interactions liked; colors final (D-035, design/color-spec.md); wordmark and icon final (D-036, D-037, design/brand/); account page settled (D-038 to D-040); layout and type spec written (design/layout-spec.md, D-041). Signed off by the owner, including the [P] proposals.
- **M4 Core reading experience.** Feed (compact and card), top bar (subreddit picker, search, account link with unread dot), content layer, link preview, comments view with collapsible thread lines, keep-your-place with working Back, all reddit.com links opening in the extension, light/dark following the device. No promoted posts or ads are drawn.
  Done when: the owner signs off on desktop and phone, and a checklist of known promo types shows none.
- **M5 Actions inside posts.** Vote, save, reply/comment, share in the content layer and comments view (D-022).
  Done when: each action works on desktop and phone and shows on Reddit itself.
- **M6 Settings page, filters, sync.** Separate extension settings page: theme override, view (compact/card), filters (subreddit, keyword, NSFW, seen posts). Settings sync through Firefox Sync (D-028).
  Done when: each setting and filter works on both devices and follows the user from PC to phone.
- **M7 Account page and extras.** Account page per D-038 to D-040: rebuilt Inbox (read, reply, mark read, new private messages), Saved, History (posts opened, capped, synced via Firefox), own Posts and Comments; "Reddit account settings" opens Reddit's page in a new tab. Clear-history control on the settings page. Confirm Firefox's storage.sync quota before sizing History (D-039; about 100 KB per MDN, unverified). Then extras such as keyboard navigation, inline media and the owner's new ideas.
  Done when: agreed per feature.
- **M8 First public (listed) release on AMO.** Store listing text (moved here from OQ-004), icon PNG sizes from design/brand/icon.svg, screenshots, "collects no data" statement, source-code submission (OQ-001), trademark/name check (OQ-010). Install for Lauren on her phone and PC (OQ-003).
  Done when: both users install with "Add to Firefox" and get updates automatically.

Handoff settings (owner approval needed to change handoff/config.json):
- Proposed: turn on the rules reminder with the D-009 approval gates and the D-007 credentials rule.
- Live checks: none needed now. Reconsider at M8 (for example, the AMO listing status).
