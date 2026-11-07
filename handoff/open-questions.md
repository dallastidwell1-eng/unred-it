# Open questions

Every unsettled question, numbered `OQ-###`. Each entry is a `### OQ-###: question` heading (three `#`) with a Status line. The snapshot counts lines that read `Status: open`. Close a question by changing its status to closed and adding the answer, its source and the date. OQ-000 below is the format example.

### OQ-000: example, the question in one line
Status: example · Owner: who answers · Opened: date, session NNN
Answer: when closed, the answer, its source and the date.

### OQ-001: What exactly does AMO require for the source code of a bundled (TypeScript/WXT) extension?
Status: open · Owner: Claude to research, before the first AMO upload · Opened: 2026-11-06, session 001
Answer:

### OQ-002: Can one AMO add-on ID hold both unlisted test versions and listed public versions, or do test builds need a separate "beta" add-on ID?
Status: open · Owner: Claude to research, before milestone M2 · Opened: 2026-11-06, session 001
Answer:

### OQ-003: Which browser will the owner's wife use on her PC? Firefox is covered; Chrome or Edge needs a Chrome build and a Chrome Web Store account ($5 one-time fee).
Status: open · Owner: owner · Opened: 2026-11-06, session 001
Answer:

### OQ-004: What is the extension's name and branding (icon, store listing)?
Status: closed · Owner: owner, in the design interview (M3) · Opened: 2026-11-06, session 001
Answer: Name "Unred It" (D-030), wordmark (D-036), app icon (D-037). Owner, session 001, 2026-11-06. Store listing text moves to M8 (todo.md).

### OQ-005: Should links to www.reddit.com redirect automatically to old.reddit.com?
Status: closed · Owner: owner, in the design interview (M3) · Opened: 2026-11-06, session 001
Answer: Yes, always: every reddit.com link opens in the extension's interface. Owner, session 001 design interview, 2026-11-06. See D-027.

### OQ-006: What is the plan if Reddit retires or degrades old.reddit.com?
Status: open · Owner: owner · Opened: 2026-11-06, session 001
Answer:

### OQ-007: Should settings (filters, theme) follow the user across PC and phone through Firefox Sync? Claude's default: yes, using browser.storage.sync.
Status: closed · Owner: owner, in the design interview (M3) · Opened: 2026-11-06, session 001
Answer: Yes, via Firefox Sync, separate per person. Owner, session 001 design interview, 2026-11-06. See D-028.

### OQ-008: Which open-source license for the public repository? Claude's default: MIT.
Status: closed · Owner: owner, in session 002 · Opened: 2026-11-06, session 001
Answer: MIT. Owner, session 002, 2026-11-06 ("MIT, go"). See D-043.

### OQ-009: Is Reddit's self-service API access really closed (reported 2025-11-11, Responsible Builder Policy)? Only secondary sources were found. It does not block the plan (D-002 uses no API); it matters only if the plan ever needs the API.
Status: open · Owner: Claude, only if needed · Opened: 2026-11-06, session 001
Answer:

### OQ-010: Does the name or listing conflict with Reddit's trademark rules or the existing "Unreddit" add-on on AMO?
Status: open · Owner: Claude to research, before M8 (public release) · Opened: 2026-11-06, session 001
Answer:

### OQ-011: Can the extension, running on old.reddit.com in the user's logged-in browser, read feeds, posts and comments as data (Reddit's .json pages) and send votes, saves and comments, reliably and within Reddit's limits?
Status: closed · Owner: Claude, technical spike in M1 · Opened: 2026-11-06, session 001
Answer: Yes for reads and votes. Spike run by the owner in his logged-in Firefox 159 desktop, session 002, 2026-11-06 21:27: the content script's own fetch (with host permission, credentials included) read /api/me.json (logged in, modhash present), the front page /.json (10 posts) and one post with its comments as data (13 of 13 comments, nested depth kept); POST /api/vote with the modhash upvoted the owner-chosen post (likes null to true) and undid it (true to null). Firefox's content.fetch was not reachable from the WXT content script; it is not needed. Reads returned no rate-limit headers; the vote replies did (used 3 to 4, remaining about 1997, reset about 180 s). Saves and comments use the same form-plus-modhash pattern but were not tested (M5/M6). Whether this counts as Data API use under Reddit's terms is not answered: moved to OQ-014. Needed by D-021; D-047 records the data path. (Was in OQ-012 by mistake: the fallback, had this failed, was restyle and rearrange on old.reddit.com pages with reduced "keep your place".)

### OQ-013: Which dark ground (Deep #1A1A1A, Dim #202020, Soft #262626, Softer #2C2C2C), light ground (Paper #FAFAFA, Mist #F3F3F3, Cloud #ECECEC), blue (dusty, steel, navy), brass (pale, classic, antique) and red (brick, signal)? (Revised after D-032; copper dropped.)
Status: closed · Owner: owner, from the color mixer on the mock-up canvas · Opened: 2026-11-06, session 001
Answer: Deep and Paper grounds, dusty blue, pale brass / brick in dark, bright brass / bright red chips in light. Owner approved as final, session 001, 2026-11-06. See D-035 and design/color-spec.md.

### OQ-012: Is the account page (history, saved, inbox) rebuilt in the extension's style, or Reddit's own old.reddit.com page restyled? Claude's default: rebuilt, for consistency.
Status: closed · Owner: owner, in M3 · Opened: 2026-11-06, session 001
Answer: Hybrid: frequent screens rebuilt, rare Reddit settings open Reddit's page in a new tab; History = posts opened; Inbox = full messaging. Owner, session 001, 2026-11-06. See D-038 to D-040.

### OQ-014: Do Reddit's Data API Terms, Developer Terms or User Agreement cover a personal browser extension that reads the logged-in user's own pages as .json and sends the user's own votes (no API key, no OAuth app, no server)? Does it matter for an AMO listing?
Status: open · Owner: owner to read or paste the terms (Claude's fetch tools and browser are blocked from redditinc.com and the Reddit help center); before M8 (public listing) · Opened: 2026-11-06, session 002
Answer:
