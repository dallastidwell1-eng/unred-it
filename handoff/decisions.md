# Decisions

Every lasting decision, numbered `D-###`, newest last. Each entry is a `### D-###: title` heading (three `#`), then its Date, Decision and Source lines. The snapshot counts these headings; D-000 below is the format example and is not counted.

### D-000: example, short title
Date: YYYY-MM-DD · Decider: who decided (the owner, or Claude as a judgment call)
Decision: what was decided, in one or two sentences.
Source: where it came from: session NNN, a message, a document.

### D-001: Purpose: a personal Reddit skin for the owner, later his wife
Date: 2026-11-06 · Decider: owner
Decision: Build a polished, easy-to-install tool that makes browsing and interacting with Reddit cleaner and better. Users: the owner first, until bugs are fixed and features are added; then his wife. It is not a product for the public. Quality bar: professional, not hacked together; follow best practices.
Source: session 001 interview.

### D-002: Approach: a browser extension that restyles old.reddit.com in the user's own browser
Date: 2026-11-06 · Decider: owner (on Claude's recommendation)
Decision: The app is a skin that runs inside the user's browser on old.reddit.com while the user is logged in to Reddit as normal. Login, voting and commenting use Reddit's own page controls. No Reddit API, no server, no hosting, no handling of Reddit passwords or cookies.
Rejected: (1) Reddit Data API: self-service app creation reportedly closed about 2025-11-11 under the Responsible Builder Policy (OQ-009), and the owner has no existing client ID. (2) A hosted site that uses the owner's Reddit session cookie: the cookie on a server is a security risk, it breaks Reddit's terms, Reddit may block cloud servers, and it is much more code.
Source: session 001 interview.

### D-003: Base site: old.reddit.com
Date: 2026-11-06 · Decider: owner
Decision: The skin sits on top of old.reddit.com (simple, stable HTML), not the new reddit.com.
Source: session 001 interview. Risk tracked in OQ-006.

### D-004: Package: a Firefox extension, listed on addons.mozilla.org (AMO)
Date: 2026-11-06 · Decider: owner (on Claude's recommendation)
Decision: Ship a real Firefox extension, publicly listed on AMO, so users get one-tap "Add to Firefox" and automatic updates on Firefox for Windows/Mac and Firefox for Android. A userscript was rejected (two-step install). Unlisted-only was rejected (Android install needs the hidden "install from file" menu). Chrome/Edge support is deferred (OQ-003). The extension collects no user data.
Source: session 001 interview.

### D-005: Stack: TypeScript, built with WXT
Date: 2026-11-06 · Decider: owner
Decision: Code is TypeScript with a build step, using the WXT extension framework (wxt.dev, built on Vite). WXT can also produce a Chrome/Edge build later from the same code. Node.js 24 is already installed on the owner's PC.
Source: session 001 interview.

### D-006: Source code lives in a public GitHub repository
Date: 2026-11-06 · Decider: owner
Decision: The project is a public GitHub repository under the owner's account (dallastidwell1-eng, logged in with gh on this PC). No secrets ever go in the repository. The public repository also helps with AMO's source-code requirement for bundled code (OQ-001).
Source: session 001 interview.

### D-007: Credentials: the owner holds all security items; Claude never handles them
Date: 2026-11-06 · Decider: owner
Decision: The owner creates and holds the Mozilla (AMO) developer account and its signing API keys, and any other secret. Claude does everything else but never enters, stores or commits credentials. The project uses no Reddit credentials at all (D-002).
Source: session 001 interview.

### D-008: Testing: signed private test builds on the phone
Date: 2026-11-06 · Decider: owner
Decision: Before a public release, each test build is a signed, unlisted (private) .xpi that the owner installs on Firefox for Android through Settings > About Firefox (tap the logo five times) > Install extension from file. On the PC, builds are tested as a temporary add-on or with WXT's dev run. No USB/adb setup.
Source: session 001 interview. Open detail: OQ-002.

### D-009: Owner approval gates
Date: 2026-11-06 · Decider: owner
Decision: Claude must get the owner's explicit approval before: (1) every push to GitHub, (2) every upload of a version to AMO, (3) adding any third-party package (library) to the project. WXT itself is approved (D-005).
Source: session 001 interview.

### D-010: Roles
Date: 2026-11-06 · Decider: owner
Decision: The owner is the architect and designer: he decides, tests and gives feedback. He is technically proficient but does not code. Claude does all build work, short of security items (D-007), and explains in plain language.
Source: session 001 interview.

### D-011: Feature order
Date: 2026-11-06 · Decider: owner
Decision: Order of features: (1) works on the phone, (2) look and dark mode, (3) no ads or promos, (4) filters, (5) more as the owner thinks of them. Reading-flow improvements (collapsible comments, keyboard navigation, inline media) were also wanted. Exact milestones are in todo.md.
Source: session 001 interview.

### D-012: Design is set by its own clarifying interview
Date: 2026-11-06 · Decider: owner
Decision: Before any look-and-feel work, run a dedicated /clarifying-interview on the design, grounded in what is technically possible on old.reddit.com in Firefox desktop and Android.
Source: session 001 interview.

### D-013: Target devices
Date: 2026-11-06 · Decider: owner
Decision: Must work on: the owner's Windows PC browser and Android phone (Firefox); his wife's Android phone (Firefox) and Windows/Mac PC.
Source: session 001 interview.

### D-014: Design principle: subtract until nothing is left to take away
Date: 2026-11-06 · Decider: owner
Decision: The interface must be extremely clean: no clutter, nothing extra. Depth is chosen per screen: rebuild (our own interface from Reddit's data) where that gives the cleanest result; rearrange or restyle where that is enough. Every element must earn its place.
Source: session 001 design interview, round 1.

### D-015: Switchable feed views
Date: 2026-11-06 · Decider: owner
Decision: The user can switch between at least a card view and a compact list view.
Source: session 001 design interview, round 1.

### D-016: Visual direction comes from owner-marked reference screenshots
Date: 2026-11-06 · Decider: owner
Decision: Claude recommended 5 styles with 3 sites each (design/references.md). The owner screenshots and marks up likes and dislikes into references/; the visual design is drawn from that.
Source: session 001 design interview, round 1.

### D-017: Layout: one column, one scroll, no rails
Date: 2026-11-06 · Decider: owner
Decision: A single centered panel that scrolls. No left navigation, no right rail, no banners or promos (the three-column social layout is rejected). Cards, when used, are stacked in the single column, never a grid.
Source: session 001 design interview, reference feedback (Medium markup, Bluesky, Are.na, Unsplash notes).

### D-018: Visual foundation: Linear's restraint plus Mastodon's readability
Date: 2026-11-06 · Decider: owner
Decision: Linear is the foundational style (dark-first, restrained neutrals, one accent, hairline dividers, precise spacing). Text is large and easy to read, as on Mastodon. Nothing that feels dated (Hacker News-style is rejected).
Source: session 001 design interview, reference feedback.

### D-019: Default views per person
Date: 2026-11-06 · Decider: owner
Decision: Compact rows are the owner's view (he will not use cards). Lauren (the owner's wife) sometimes uses cards. The view is a per-user setting (D-015).
Source: session 001 design interview, reference feedback.

### D-020: Navigation: slim top bar
Date: 2026-11-06 · Decider: owner
Decision: One slim top bar holding: a subreddit picker (the user's subscriptions), a search bar, and a link to the account page (history, saved, etc.). No other navigation.
Source: session 001 design interview, round 2.

### D-021: Opening posts keeps the feed alive
Date: 2026-11-06 · Decider: owner
Decision: Clicking a post's content opens it as a layer over the feed. Clicking its comments opens a comments view. Returning from either goes back to the same place in the feed with no reload; the browser Back button works. Consequence: the feed, post and comments views are rebuilt (drawn by the extension from Reddit's data), not just restyled old.reddit.com pages.
Source: session 001 design interview, round 2.

### D-022: Post actions only inside a post
Date: 2026-11-06 · Decider: owner
Decision: The feed shows no vote, save, reply or share controls. These appear only in the opened post (content layer and comments view).
Source: session 001 design interview, round 2.

### D-023: Compact row anatomy
Date: 2026-11-06 · Decider: owner
Decision: Compact rows show a small thumbnail on the left, the title, then one muted line: subreddit, age, score, comment count. No author, flair or link domain in the feed.
Source: session 001 design interview, round 3.

### D-024: Themes and a separate settings page
Date: 2026-11-06 · Decider: owner
Decision: Light and dark themes follow the device setting, with a manual override. All extension settings (theme, view, filters) live on a separate settings page of the extension, reached from the account menu; Reddit's own account page stays for history, saved and so on.
Source: session 001 design interview, round 3.

### D-025: Link posts: preview first, then open
Date: 2026-11-06 · Decider: owner
Decision: Clicking the content of a link post opens the content layer with title, preview image, summary and source, plus one clear "Open article" button that opens a new tab.
Source: session 001 design interview, round 4.

### D-026: Comment threads: collapsible thread lines with a visible marker
Date: 2026-11-06 · Decider: owner
Decision: Thin vertical lines show nesting; each line carries a small, subtle but always-visible "collapse here" marker; tapping it folds that branch. Deep branches show "N more replies" instead of everything.
Source: session 001 design interview, round 4.

### D-027: All Reddit links open in the extension's interface
Date: 2026-11-06 · Decider: owner
Decision: Any reddit.com link (www, new or old) opens in the extension's interface, so there is one consistent Reddit everywhere. Closes OQ-005.
Source: session 001 design interview, round 4.

### D-028: Settings sync through Firefox Sync
Date: 2026-11-06 · Decider: owner
Decision: Each person's extension settings follow them between PC and phone through Firefox Sync (browser.storage.sync) when signed in to a Firefox account. The owner and Lauren keep separate settings. Closes OQ-007.
Source: session 001 design interview, round 5.

### D-029: Unread indicator: a dot on the account link
Date: 2026-11-06 · Decider: owner
Decision: Unread messages and replies show as a small accent dot on the account link in the top bar. The inbox lives in the account page. No separate inbox icon.
Source: session 001 design interview, round 5.

### D-030: Name: Unred It
Date: 2026-11-06 · Decider: owner
Decision: The extension is named "Unred It", a pun on "unread it", "un-Reddit it" and "red". Exact styling (spacing, capitals, logo) is set in the branding work. Note: an existing AMO add-on is named "Unreddit" (shows removed comments); the name and logo should stress the difference (OQ-010).
Source: session 001 design interview, round 5.

### D-031: Color: neutral grounds, color only in the accent
Date: 2026-11-06 · Decider: owner
Decision: Backgrounds, surfaces, lines and text are true neutral greys with no tint (R = G = B). They are softer than stark: no near-black dark mode, no pure-white light mode. Dark and light modes are equally important. Color appears only in a single accent. Rejected: near-black/white grounds with an accent (5 palettes), and tinted soft grounds (5 palettes). Of all tried, the cool "Dusk" was closest. Exact ground levels and accent: open (OQ-013).
Source: session 001, palette reviews.

### D-032: Color family and roles: grey, blue, brass/copper, red; no brown
Date: 2026-11-06 · Decider: owner (roles proposed by Claude)
Decision: Only grey, blue, brass/copper and red are used; no brown anywhere (placeholder image tiles included). Roles: grey for grounds, lines and text; blue for actions, links, selection and downvote; copper or brass for upvote; red only for the unread dot, counts and the "red" in the wordmark. On light grounds the metal colors only the upvote arrow (the score stays charcoal) so it never reads as brown. Exact shades: OQ-013.
Source: session 001, palette review ("Lose the brown. Shades of grey, blue, brass/copper, and red."). Update 2026-11-06: owner asked for "more brass, less copper"; copper dropped, upvote metal is brass (pale, classic or antique; OQ-013). Superseded for votes by D-033: downvote is red, not blue; blue is actions and links only.

### D-033: Vote colors
Date: 2026-11-06 · Decider: owner (light-mode chip treatment by Claude)
Decision: Dark mode: upvote = pale brass #E2C98A (arrow and score), downvote = brick red #E5736B (arrow and score). Light mode: brighter brass and brighter red. Because bright colors are too faint as thin arrows on light grounds, a light-mode vote shows as a filled chip: bright brass #E8C04A or bright red #F2605D, with charcoal #222222 text (9.1:1 and 5.0:1). The unread dot stays brick red. Blue is now for actions and links only.
Source: session 001, owner: "Dark Mode = Brass: Pale for upvote and Red: Brick for downvote. Light mode should be more of a brighter brass for upvote and a brighter red for downvote." Amended by D-034: dark mode uses chips too.

### D-034: Grounds Deep and Paper; vote chips in both modes
Date: 2026-11-06 · Decider: owner
Decision: Dark ground is Deep #1A1A1A; light ground is Paper #FAFAFA (both neutral, D-031). The filled vote chips ("the boxes on Paper") are used in dark mode too: pale brass #E2C98A or brick #E5736B chip with near-black #1A1A1A text (10.7:1 and 5.8:1). Claude read "boxes" as the vote chips; owner to confirm on the Final colors board.
Source: session 001, owner: "Deep and Paper. I like the boxes on Paper. Put those on deep." Superseded in part by D-035: no chips on Deep.

### D-035: Final color palette (approved)
Date: 2026-11-06 · Decider: owner
Decision: The palette is final. Grounds: Deep #1A1A1A (dark) and Paper #FAFAFA (light), neutral grey. Dark mode: no vote chips; pale brass #E2C98A upvote and brick #E5736B downvote as colored arrow and score. Light mode: bright brass #E8C04A and bright red #F2605D vote chips with charcoal text. Blue: dusty, #8FB0E6 (dark) / #3A5F98 (light), for actions only. Unread dot: #E5736B (dark) / #C2413A (light). Full token list and contrast checks: design/color-spec.md. Closes OQ-013.
Source: session 001, owner: "Go back to no boxes on Deep and that's it, final version".

### D-036: Wordmark: lowercase "unred it" with "red" in red
Date: 2026-11-06 · Decider: owner
Decision: The wordmark is lowercase "unred it" in Inter Tight semibold, tight tracking (-0.035em); only "red" is colored red (#E5736B on dark, #C2413A on light); the rest is the text color. The app icon is a separate choice (an upside-down lowercase r in red on black is being explored).
Source: session 001, Brand board, owner chose option #1.

### D-037: App icon: drawn upside-down lowercase r, brick red on Deep
Date: 2026-11-06 · Decider: owner
Decision: The app icon is a drawn (custom stroke, not a font glyph) upside-down lowercase "r" in brick red #E5736B on a Deep #1A1A1A rounded-square tile (corner radius 24 of 100). It reads as an "r" undone, matching the "un-red" pun. Source file: design/brand/icon.svg. Lockup: icon beside the D-036 wordmark.
Source: session 001, Brand board, owner chose version 1 of 4.

### D-038: Account page: hybrid
Date: 2026-11-06 · Decider: owner (on Claude's recommendation)
Decision: Inbox, Saved, History, and the user's own Posts and Comments are rebuilt in Unred It's style and open over the live feed (keeps place, D-021). Rare Reddit account settings (preferences, password, email) open Reddit's own page in a new tab. Closes OQ-012.
Source: session 001, account-page round.

### D-039: History = posts the user opened, kept on the user's devices
Date: 2026-11-06 · Decider: owner
Decision: History lists posts the user opened in Unred It. It is stored by the extension (synced between the user's own devices through Firefox Sync, like settings) and never sent anywhere else, so "collects no data" (D-004) still holds. Firefox Sync storage for an extension is small (about 100 KB total, per MDN; confirm in the build), so the list is capped, for example the last 200 posts. Clear-history control goes on the settings page.
Source: session 001, account-page round.

### D-040: Inbox: full messaging
Date: 2026-11-06 · Decider: owner
Decision: In the Inbox the user can read replies and private messages, reply, mark items read (clears the unread dot), and write new private messages to anyone, all inside Unred It.
Source: session 001, account-page round.

### D-041: Layout and type spec
Date: 2026-11-06 · Decider: owner (approved, including the [P] proposals), written by Claude
Decision: design/layout-spec.md is the build reference for type, spacing, layout, components, icons, motion and accessibility. Values marked [M] are measured from the approved mock-ups; values marked [P] (tablet breakpoint, top bar hiding on scroll, motion timings, focus ring, large-text scale, clear-history control, max image height) are Claude's proposals and can be changed by the owner.
Source: session 001, owner: "Write the layout spec"; approved with "Approve M3".

### D-042: Milestone M3 (visual design) complete
Date: 2026-11-06 · Decider: owner
Decision: M3 is signed off. The design references for the build are: design/mockups/ (canvas https://claude.ai/artifact/4bvBsLEsHSjXSeseQziTmt), design/color-spec.md, design/layout-spec.md and design/brand/. Next milestone in order: M1 (project foundation + data spike, OQ-011), then M2.
Source: session 001, owner: "Approve M3".

### D-043: License: MIT
Date: 2026-11-06 · Decider: owner
Decision: The public repository uses the MIT License. The LICENSE file goes in the repository root with the scaffold (M1). Closes OQ-008.
Source: session 002, owner: "MIT, go".

### D-044: M1 development packages (D-009 approval)
Date: 2026-11-06 · Decider: owner
Decision: Approved dev-only packages (none ship in the extension): wxt 0.21.x, vite 8.x (WXT peer), typescript 6.0.x (typescript-eslint 8 does not support TypeScript 6.1+ or 7 yet), eslint 10, @eslint/js, typescript-eslint 8, prettier 3, vitest 5, web-ext 10 (its lint runs the AMO checks). Any other package needs a new approval.
Source: session 002, owner approved the list ("Approve all").

### D-045: Firefox add-on ID
Date: 2026-11-06 · Decider: owner
Decision: The gecko add-on ID is `unred-it@praxisdesignworks`. It is permanent once the add-on is on AMO. The MIT LICENSE copyright line reads "Dallas Tidwell" (D-043).
Source: session 002, owner chose the ID and the copyright name.

### D-046: Manifest V3 for Firefox
Date: 2026-11-06 · Decider: Claude (judgment call; the kickoff delegated the choice)
Decision: Build with Manifest V3 (WXT `manifestVersion: 3`; WXT's Firefox default is V2). Reasons: V3 is the current standard; Firefox shows V3 host permissions at install since Firefox 127 (desktop) and has a host-permission UI on Android since 128 (Extension Workshop MV3 migration guide; Mozilla Add-ons blog 2024-05-14). Minimum versions: Firefox 140 desktop, 142 Android, because `data_collection_permissions` (set to "none", D-004) needs them. Consequence: the user can revoke host access later, so the extension must check its permissions before it relies on them (M4+). Build output: `.output/firefox-mv3/`.
Source: session 002, step 4 (scaffold); the owner can overrule.

### D-047: Data path: the content script reads Reddit's .json pages and posts to Reddit's own form endpoints
Date: 2026-11-06 · Decider: Claude (from the OQ-011 spike result; the owner can overrule)
Decision: On old.reddit.com the content script uses its own fetch (host permission, credentials included) to read the user's pages as .json (feeds, posts with comments, /api/me.json) and to send actions the way old.reddit.com does (form body plus the session modhash, for example /api/vote). The modhash is held in memory only; it is never shown, logged or stored. D-021's rebuilt views go ahead; the restyle fallback is not needed. Reddit's terms question stays open (OQ-014).
Source: session 002, spike evidence in OQ-011 and the session log.

### D-048: Public repository with a fresh history
Date: 2026-11-06 · Decider: owner (approved creation and push, D-009; chose the fresh history)
Decision: The public repository is https://github.com/dallastidwell1-eng/unred-it (default branch master). It starts from a fresh, single-commit history so that earlier local commits (one held the owner's Reddit username) are not published. references/ (the owner's third-party reference screenshots) stays on the PC only and is git-ignored. The old local history is kept in the local branch `backup/pre-public-2026-11-06`, which is never pushed. CI (.github/workflows/ci.yml) runs `npm run check` on every push to master and on pull requests, with actions pinned to commit SHAs. Text files use LF line endings (.gitattributes).
Source: session 002, owner: "Fresh history" and "Approve: unred-it".
