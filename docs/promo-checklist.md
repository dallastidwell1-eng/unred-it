# Promoted posts and ads: checklist

M4 is done only when the reader draws no promoted posts and no ads
(handoff/todo.md, M4). This file lists every kind of ad or paid post that
old.reddit.com shows, how the reader keeps each one out, and how it was
checked.

## How the reader avoids ads

1. **It builds its own page from Reddit's data, not from Reddit's page.**
   Feeds come from the `.json` post lists (for example `/r/books/.json`),
   threads from `/comments/<id>.json`, and search results from the search
   page's post IDs, then `/by_id/<ids>.json` (D-060). old.reddit.com adds its
   ads to its own page separately, so these lists normally hold no ads.
2. **Reddit's own page is hidden.** On every page the reader takes over,
   every element of Reddit's page except the reader is hidden
   (`src/entrypoints/reader.content.ts`, `pageCss`). Sidebar boxes, banners
   and anything else Reddit puts on its page are never visible.
3. **A safety net for paid posts.** If Reddit ever puts a paid post into a
   post list, the reader leaves it out:
   - In the `.json` lists (`isPromoted` in `src/lib/reddit-data.ts`): a post
     with `promoted: true`, or any text in `promoted_by`,
     `adserver_click_url` or `adserver_imp_pixel`. A post with only
     `is_created_from_ads_ui: true` is kept, because that field names the
     tool that made the post, and such posts also appear unpaid.
   - On the search page (`src/lib/search-page.ts`): a result marked
     `promotedlink` or `data-promoted="true"`.

   Reddit does not document these names, and they were not checked against
   a live ad (the developer's tools cannot open reddit.com). They are the ad
   markers known from Reddit's data and old.reddit.com's page. The filter
   needs only one of them, so one missing marker does not let an ad through.
   If an ad is ever seen in the reader, its post data shows which marker to
   add.

## Checklist

| #   | What old.reddit.com shows                                             | Where                          | In the reader                                                                   | How it was checked                                                         |
| --- | --------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Promoted post between feed posts (labeled "promoted")                 | Home, Popular, All, subreddits | Not drawn: the feed comes from the `.json` list; paid posts are filtered (3)    | Unit test `parseFeedPage` leaves out promoted posts; owner test in Firefox |
| 2   | Promoted post above a comment thread                                  | Post pages                     | Not drawn: the comments view is built from `/comments/<id>.json`                | Owner test in Firefox                                                      |
| 3   | Sidebar ad box                                                        | Every page with a sidebar      | Not drawn: the reader has no sidebar; Reddit's page is hidden (2)               | Owner test in Firefox                                                      |
| 4   | Reddit's own promotions (Premium, coins, app banners, "trending" bar) | Top, sidebar, banners          | Not drawn: part of Reddit's hidden page (2)                                     | Owner test in Firefox                                                      |
| 5   | Promoted result on the search page                                    | Search pages                   | Not drawn: results marked as promoted are skipped (3)                           | Unit tests in `search-page.test.ts`; owner test in Firefox                 |
| 6   | Posts pinned by moderators                                            | Top of a subreddit             | Shown on purpose, marked "Pinned": these are the subreddit's own posts, not ads | Preview sample data                                                        |

## Known limit

The reader hides Reddit's page but does not stop it. Reddit's own page still
loads underneath, with its scripts, so it may still fetch its ads in the
background; they are never shown. Stopping Reddit's page from loading is not
part of M4.

## Owner test in Firefox

With the add-on loaded, open each page below and look for any post or box
that says "promoted", "sponsored" or "ad":

1. Home (old.reddit.com), Popular and All, scrolling down past three or four
   pages of posts.
2. Two or three subreddits you read.
3. A post's comments.
4. A search, for example "firefox".
5. To compare, open the same Home page with Reddit's own view: the reader's
   "Open Reddit's own page" link at the bottom of the feed. Reddit's page may
   show promoted posts there (unless an ad blocker hides them); the reader
   should show none.

Result (session 004, 2026-11-09): see handoff/sessions/004_2026-11-09_m4-card-view.md.
