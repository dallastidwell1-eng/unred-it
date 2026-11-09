# Unred It: layout and type specification

Written 2026-11-06 (session 001) from the approved mock-ups in `design/mockups/` (canvas: https://claude.ai/artifact/4bvBsLEsHSjXSeseQziTmt).
Companion files: `color-spec.md` (all colors), `brand/README.md` (icon and wordmark).
Decisions: D-014 to D-040 in `handoff/decisions.md`.

Each value is marked:
- **[M]** measured from the approved mock-ups.
- **[P]** proposed in this spec; the mock-ups do not show it. The owner can change these.

All sizes are CSS pixels at 100% zoom. "Phone" means a viewport under 768 px wide.

---

## 1. Principles

1. Remove anything that does not earn its place (D-014).
2. One column, one scroll. No side rails, no banners (D-017).
3. Hierarchy comes from type weight and tone, not boxes and borders (D-018).
4. Every control has a touch target of at least 44 x 44 px, even if the visible shape is smaller.
5. Opening a post or comments never reloads the feed (D-021).

## 2. Type

Typeface: **Inter** for all interface text **[M]**. **Inter Tight** only for the wordmark (D-036).
Use tabular numbers for scores and counts (`font-variant-numeric: tabular-nums`) **[P]**.

| Role | Phone | Desktop | Weight | Line height | Where |
|---|---|---|---|---|---|
| Post title in feed (compact) | 16 | 17 | 500 | 1.38 | Feed rows **[M]** |
| Post title in feed (card) | 18 | 18 | 600 | 1.30 | Card view **[M]** |
| Post title in content layer | 22 | 26 | 600 | 1.28 / 1.25 | Opened post **[M]** |
| Post title in comments view | 19 | 22 **[P]** | 600 | 1.30 | Comments header **[M]** |
| Post body text | 17 | 17 | 400 | 1.60 | Text posts **[M]** |
| Comment body | 16 | 16 | 400 | 1.50 | Comments **[M]** |
| Top-bar title ("Home") | 17 | 16 | 600 | 1 | Top bar **[M]** |
| Page heading | 22 | 22 | 600 | 1.2 | Settings, account **[M]** |
| Section label | 12 | 12 | 600, uppercase, +0.06em | 1.2 | Settings, picker **[M]** |
| Meta line (subreddit, age, score) | 13 | 13 | 400 | 1.3 | Feed, post, comments **[M]** |
| Comment author | 13 | 13 | 600 | 1.3 | Comments **[M]** |
| Buttons and controls | 14–15 | 14 | 500–600 | 1 | Everywhere **[M]** |
| Badge / count | 11 | 11 | 700 | 1 | Inbox count **[M]** |

Letter-spacing: titles -0.005em to -0.02em (larger text, tighter) **[M]**. Body: 0.
"Large text" setting (D-024 settings page): scale every size above by 1.125 **[P]**.

## 3. Spacing and shape

Base unit: 4 px. Common steps: 4, 6, 8, 10, 12, 14, 16, 20, 24 **[M]**.
Side gutter on phone: 16 px **[M]**.

| Radius | Use |
|---|---|
| 7–8 px | Thumbnails (phone 8), vote chips (7), small buttons **[M]** |
| 9–10 px | Inputs, segmented controls, primary buttons **[M]** |
| 12 px | Images inside a post, preview cards **[M]** |
| 14 px | Cards, link-preview card **[M]** |
| 16 px | Top corners of the content layer, picker sheet **[M]** |
| Full | Avatars, unread dot, chips in the picker, switches **[M]** |

Dividers: 1 px hairline in `line` color. Thread lines and input borders: 1 px in `line2` **[M]**.

## 4. Layout and breakpoints

| Viewport | Feed column | Top bar | Content layer |
|---|---|---|---|
| Phone, under 768 px | Full width | 52 px high | Full width, starts 12 px from the top, slides up **[M]** |
| Tablet, 768–1023 px | Max 680 px, centered **[P]** | 56 px | Centered panel, max 720 px, starts 32 px from the top **[P]** |
| Desktop, 1024 px and over | Max 720 px, centered **[M]** | 56 px; search field 520 px in the center column **[M]** | Centered panel 760 px wide, starts 40 px from the top **[M]** |

The content layer covers the feed with a scrim (see color spec). The feed stays mounted underneath, so its scroll position does not change **[M]**.

## 5. Components

### 5.1 Top bar **[M]**
- Height: 52 px (phone), 56 px (desktop). Bottom hairline.
- Left: subreddit picker button ("Home" + chevron), 44 px target.
- Right (phone): search icon button 44 x 44, account button 44 x 44.
- Center (desktop): search field 38 px high with a "/" shortcut hint.
- Account: 28 px avatar circle (30 on desktop); unread dot 9 px at the top-right with a 2 px ring in the ground color.
- Behavior: hides when scrolling down, shows when scrolling up **[P]**.

### 5.2 Compact feed row **[M]**
- Padding: 14 px top/bottom, 16 px sides (desktop: 16 px top/bottom, 4 px sides inside the 720 column).
- Thumbnail: 52 x 52 (desktop 64 x 64), radius 8 (desktop 9), on the left, gap 12 px (desktop 16) to the text.
- Every row keeps the thumbnail slot. Text posts show a quiet "lines" glyph; link posts a "link" glyph.
- Title, then meta line 5–6 px below: subreddit · age · ↑ score · comment-count button.
- No vote, save, reply or share in the feed (D-022).
- Tap targets: thumbnail and title open the content layer; the comment count opens comments. The comment-count button has 14 px vertical / 10 px horizontal invisible padding to reach 44 px.

### 5.3 Card (Lauren's view) **[M]**
- Stacked in one column, 12 px from the screen edges and 12 px apart. Never a grid.
- Radius 14, 1 px border, `surface` fill.
- Meta line on top (14 px top padding), title 18/600, then one of: image 220 px high (full card width), two-line text excerpt, or a link chip.
- Footer: score and comment-count button, 12 px padding.

### 5.4 Post content (top of the post page) **[M]**
D-062 replaced the separate content layer: an opened post is one page (5.5) with this content at its top, then the vote row, the sort bar and the comments. The drag handle, the layer's own header and its action bar are gone. The content:
  - Image: radius 12, full width (300 px tall placeholder on phone; real images use their own ratio, max height 70% of the viewport **[P]**).
  - Text: body style.
  - Link: preview card (radius 14) with image (at its own proportions, capped at 70% of the viewport height; D-056 replaced the fixed 170 px), source, title, summary, and one full-width "Open article" button 44 px high that opens a new tab (D-025).
  - Image posts show without side bars; galleries show one picture at a time with Previous/Next buttons and a counter (D-055); Reddit videos play in place, with sound (D-054).
- Vote display: see color spec section "Rules" 4 and 5. Score chip padding 3 x 8 px, radius 7.

### 5.5 Post page (content and comments) **[M]**
- Full screen over the feed; scrolls as one page (D-062). Header 52 px with a "Feed" back button, the meta line and the title. At the top of the page the whole title shows; scrolled down, it shrinks to two lines.
- Then the post content (5.4) and the vote/save/share row (48 px; save and share come in M5).
- Opened from a post's title, picture, excerpt or link chip: starts at the top. Opened from its comment count or a comment link: starts with the sort bar at the top.
- Sort bar: 44 px, "Best" dropdown, comment count, "Comment" button (32 px high).
- Comment indent step: 22 px per level. First level starts 16 px from the edge.
- Thread line: 1 px, `line2`, at x = (comment's left edge + 7 px), running the full height of its children.
- Fold marker: 16 px circle with a 1 px `marker` ring, on top of the thread line at the comment's header, in a 44 x 44 target. Minus sign when open, plus sign when folded (D-026).
- Folded branch shows "N replies hidden" in the meta style.
- Comment: header (author, age, points) 24 px min; body 4 px below; action row (up, down, Reply) with 40 px targets.

### 5.6 Subreddit picker **[M]**
- Drops down under the top bar as a sheet (radius 0 0 16 16), max height 660 px on phone, with a scrim behind.
- Filter field 44 px high, then Home / Popular / All chips (36 px high, full radius; the selected chip uses blue), then "Your subreddits": 48 px rows with a 28 px letter avatar.

### 5.7 Account page **[M]** (D-038 to D-040)
- Header 52 px with back button; profile row with 52 px avatar.
- Tabs: Inbox (with count badge), Saved, History, Comments, Posts. 44 px high; the active tab has a 2 px blue underline. Tabs scroll sideways if they do not fit.
- Inbox bar: unread count on the left, "New message" button (36 px, blue fill) on the right.
- Items: 8 px unread dot (red) or empty slot, meta line, then text; unread text weight 500, read 400 in `muted`.
- Footer links (48 px rows): "Unred It settings" (in-app), "Reddit account settings" (new tab, with an external-link icon).

### 5.8 Settings page **[M]**
- Heading, then sections separated by a hairline and 20 px: Appearance, Filters, (sync and about note).
- Segmented controls: 38 px segments inside a 3 px track (44 px total), radius 10/8. Selected segment has a light shadow.
- Chips for hidden subreddits and words: 32 px, full radius, with a 28 px remove button.
- Text inputs: 44 px, radius 10, 1 px `line2` border.
- Switches: 46 x 28 px, 22 px knob; "on" uses blue.
- Add **[P]**: "Clear history" button in a History section (D-039).

## 6. Icons **[M]**
- Line icons on a 24 px grid, stroke 2 px (2.25 for small arrows), round caps and joins.
- Sizes: 16 (small, meta), 18 (actions), 20 (navigation, votes).
- Icon-only buttons always have an accessible name (`aria-label`).

## 7. Motion **[P]**
- Content layer: slides up 24 px and fades in over 200 ms, ease-out; closes in 160 ms.
- Comments view: slides in from the right over 220 ms.
- Picker sheet: drops down over 180 ms.
- Fold/unfold: height change over 150 ms.
- If the user has "reduce motion" turned on (`prefers-reduced-motion`), use a plain fade of 100 ms or no animation.

## 8. Accessibility **[P]** (plus the contrast checks in `color-spec.md`)
- Keyboard focus: 2 px outline in blue with a 2 px offset, on every interactive element. Never remove it.
- Esc closes the content layer, comments view and picker; Back does the same.
- The content layer and picker are dialogs: move focus into them on open and return it to the item that opened them on close.
- Use real buttons and links (not clickable divs), and give every icon-only button a label.
- Text must reflow at 200% zoom without sideways scrolling on the page.

## 9. Not in this spec
- Keyboard shortcuts beyond Esc and "/" for search (M7 extras).
- Exact image and video player behavior (M4 build detail).
- Store listing graphics (M8).
