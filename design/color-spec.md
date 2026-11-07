# Unred It: color specification (final)

Approved by the owner on 2026-11-06 (session 001). Decisions: D-031 to D-035 in `handoff/decisions.md`.
Reference board: "FINAL colors: Deep and Paper" on the mock-up canvas. Sources: `design/mockups/`.

## Rules

1. Grounds, surfaces, lines and text are neutral grey only (R = G = B). Do not tint them.
2. Use only grey, blue, brass and red. Do not use brown.
3. Each color has one job:
   - Grey: grounds, surfaces, lines, all text.
   - Blue: actions only (buttons, links, active tab, selected controls, switches, OP name).
   - Brass: upvote only.
   - Red: downvote, unread dot, unread counts, the "red" in the wordmark.
4. Dark mode shows a vote as a colored arrow and colored score. No chip.
5. Light mode shows a vote as a filled chip with charcoal text. The arrow has the chip color.
6. Theme follows the device setting. The user can override it on the settings page (D-024).

## Dark mode: Deep

| Token | Value | Use |
|---|---|---|
| bg | `#1A1A1A` | Page ground |
| surface | `#212121` | Cards, sheets, picker panel |
| raised | `#282828` | Avatar, raised controls |
| line | `#2A2A2A` | Hairline dividers |
| line2 | `#363636` | Thread lines, input borders |
| marker | `#545454` | Thread fold-marker ring |
| text | `#E6E6E6` | Primary text |
| muted | `#BDBDBD` | Secondary text, icons |
| faint | `#A8A8A8` | Meta lines (subreddit, age) |
| blue | `#8FB0E6` | Actions; text on blue is `#1A1A1A` |
| up | `#E2C98A` | Upvote arrow and score (pale brass) |
| down | `#E5736B` | Downvote arrow and score (brick) |
| dot | `#E5736B` | Unread dot and counts |
| scrim | `rgba(0,0,0,0.5)` | Behind the content layer |

## Light mode: Paper

| Token | Value | Use |
|---|---|---|
| bg | `#FAFAFA` | Page ground |
| surface | `#FFFFFF` | Cards, sheets |
| raised | `#F0F0F0` | Avatar, segmented-control track |
| line | `#E8E8E8` | Hairline dividers |
| line2 | `#D6D6D6` | Thread lines, input borders |
| marker | `#A8A8A8` | Thread fold-marker ring |
| text | `#222222` | Primary text |
| muted | `#4D4D4D` | Secondary text, icons |
| faint | `#5E5E5E` | Meta lines |
| blue | `#3A5F98` | Actions; text on blue is `#FFFFFF` |
| upChip | `#E8C04A` | Upvote chip fill and arrow (bright brass); chip text `#222222` |
| downChip | `#F2605D` | Downvote chip fill and arrow (bright red); chip text `#222222` |
| dot | `#C2413A` | Unread dot and counts |
| scrim | `rgba(0,0,0,0.25)` | Behind the content layer |

## Image placeholders

Neutral grey or grey-blue only. Dark: `#3A3C40`, `#2B3340`, `#33363B`, `#2E3540`. Light: `#D8DADD`, `#D2D9E2`, `#DFE1E4`, `#D6DCE3`.

## Contrast (WCAG 2.x, checked by script in session 001)

| Pair | Ratio | Needs |
|---|---|---|
| Dark text on Deep | 13.9:1 | 4.5:1 |
| Dark faint on raised (worst case) | above 4.5:1 | 4.5:1 |
| Pale brass on Deep | 10.7:1 | 4.5:1 (text) |
| Brick on Deep | 5.8:1 | 4.5:1 (text) |
| Blue `#8FB0E6` on Deep | 7.9:1 | 4.5:1 |
| Light text on Paper | 15.2:1 | 4.5:1 |
| Charcoal on bright brass chip | 9.1:1 | 4.5:1 |
| Charcoal on bright red chip | 5.0:1 | 4.5:1 |
| Blue `#3A5F98` on Paper | 6.2:1 | 4.5:1 |
| White on blue `#3A5F98` | 6.4:1 | 4.5:1 |
| Unread dot `#C2413A` on Paper | above 3:1 | 3:1 (graphic) |

Note: the light-mode vote arrows (bright brass, bright red) are below 3:1 against Paper. That is acceptable because the chip next to each arrow carries the same state, and the chip text passes 4.5:1. Do not use the arrow alone to show a vote in light mode.
