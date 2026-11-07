# Design references: 5 styles, 15 sites

Purpose: give the owner real sites to screenshot and mark up (likes and dislikes) for the design interview (M3, D-012). These are references for ideas only. We do not copy any site's look.

Guiding rule (owner, session 001): "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." Extremely clean, no clutter, nothing extra. The user can switch between card and compact views.

How to use:
1. Open each site in a desktop browser **and** on your Android phone; both matter.
2. Look at three things on each: the **list/feed**, **one item opened** (an article, post or thread), and **dark mode** if it has one.
3. Take screenshots, mark them up (circle what you like, cross out what you don't, add a word or two), and save them in `references/` at the project root.
4. You do not need an account on any of these. Where a site asks you to sign up, look at the public pages only.

## Style 1: Ultra-minimal list
Text rows, very dense, almost no decoration. Closest to "nothing left to take away".

| Site | What to look at |
|---|---|
| [Hacker News](https://news.ycombinator.com) | The extreme of minimal: one line per post, plain comment threads. |
| [Lobsters](https://lobste.rs) | Similar to Hacker News but a little more refined: tags, spacing, threaded comments. |
| [Tildes](https://tildes.net) | A Reddit-like community site designed to be calm and clutter-free, with several built-in themes, including dark ones. The closest analog to what we're building. |

## Style 2: Reading-first (editorial)
Large, comfortable type, generous whitespace, one column. Best for long posts and comment reading.

| Site | What to look at |
|---|---|
| [Medium](https://medium.com) | Open any article: typography, line width, how little is on screen. |
| [Substack](https://substack.com) | Open any post: the reading view, and how comments sit under it. |
| [Ghost demo](https://demo.ghost.io) | Ghost's default theme: a clean blog with a card home page and a calm article page. |

## Style 3: Visual cards and grid
Image-led cards, roomy, browsing by picture. Relevant to the "card" view for image subreddits.

| Site | What to look at |
|---|---|
| [Are.na](https://www.are.na) | Minimal visual blocks, very little interface, quiet colors. |
| [Dribbble](https://dribbble.com/shots) | A polished card grid: card shape, hover and preview behavior. |
| [Unsplash](https://unsplash.com) | Image grid with almost no chrome; how a photo opens. |

## Style 4: Conversation and threads
Built around discussions and replies. Relevant to comment pages, which are most of Reddit.

| Site | What to look at |
|---|---|
| [Bluesky](https://bsky.app) | Feed of posts and how a thread of replies opens; clean light and dark modes. |
| [Discourse Meta](https://meta.discourse.org) | Forum topic list and long threaded discussions; quoting and replying. |
| [Mastodon](https://mastodon.social/explore) | Public explore feed; post layout and actions kept small. |

## Style 5: App-like (modern reader / tool)
Feels like a polished app rather than a web page: side navigation, soft surfaces, refined dark mode.

| Site | What to look at |
|---|---|
| [Feedbin](https://feedbin.com) | A clean feed reader: list on one side, reading pane on the other. |
| [Reeder](https://reederapp.com) | Screenshots of a well-regarded reading app: typography, motion, calm design. |
| [Linear](https://linear.app) | Very refined dark interface: spacing, contrast, small details. |

## Checked
All 15 sites responded on 2026-11-06. Medium and Unsplash block automated checks but open normally in a browser.

## Owner feedback (2026-11-06, session 001)
- **Style 1 (HN, Lobsters, Tildes):** rejected. Dated and clunky; "2003 internet".
- **Style 2:** Medium "not bad, not great". Markup (`references/Screenshot 2026-11-06 184427.png`): keep the top bar ends (menu, logo, search left; write, notifications, avatar right); cross out the left nav, the promo banner and the right rail. Substack: rejected. Ghost demo: needed sign-up, not reviewed.
- **Style 3:** Are.na close for the card view; Unsplash modern; Dribbble dated. All three are grids, but Reddit is best as a single stack of cards or rows. The owner never uses cards; Lauren sometimes does.
- **Style 4:** Bluesky rejected: the three-column layout with a scrolling middle is "too much happening". Discourse: much better than most. Mastodon: best of the three for style and feel (clean, big easy-to-read fonts), except for its multi-panel layout.
- **Style 5:** Feedbin and Reeder needed login, not reviewed. Linear: liked, "a foundational style".
- **Wanted:** one clean panel that scrolls; click into a post for its content or its comments, depending on where you click.

Decisions drawn from this: D-017 to D-019 in handoff/decisions.md.
