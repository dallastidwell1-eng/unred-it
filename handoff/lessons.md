# Binding lessons

Rules learned from mistakes or surprises. Each one binds every later session. Each entry is a `### L-##: rule` heading (three `#`), then its Source and Rule lines. The snapshot counts these headings; L-00 below is the format example and is not counted.

### L-00: example, the rule in one line
Source: session NNN, date, and what happened.
Rule: what to do from now on.

### L-01: Append new decisions at the end of decisions.md
Source: session 001, 2026-11-06: new decisions were inserted by anchoring an edit on an existing heading, which placed them above it; D-030 ended up last and D-041 above D-040. Found and fixed at the close of the design work.
Rule: add every new D-### (and OQ-###, L-##) after the last entry in its file, then check the order with a quick script (headings must run in sequence).

### L-02: Do not write files through bash heredocs that contain apostrophes
Source: session 001, 2026-11-06: a bash heredoc containing apostrophes failed to parse in the Bash tool, so nothing was written.
Rule: write and edit files with the editor tools (Write, Edit), not shell heredocs.

### L-03: Edit code with the Edit tool, not scripted find-and-replace
Source: session 002, 2026-11-06: two scripted edits went wrong. A Python edit turned "\n" inside a TypeScript string into a real line break (broken file), and Python's str.replace removed a line in two places instead of one (a component lost its variable). Lint caught both before any test.
Rule: change source files with the Edit tool, which needs one exact, unique match. Scripted edits only for mechanical changes that are checked right after (grep or lint).

### L-04: The developer preview is not old.reddit.com on a phone
Source: session 004, 2026-11-09: card view passed every 375 px check in the preview, but the owner's phone showed the whole reader tiny, because the preview page has a viewport tag and old.reddit.com's pages do not. Found only by the signed build on the phone.
Rule: for anything that depends on the page around the reader (viewport, fonts, Reddit's own scripts and markup) or on the device (share menu, clipboard, touch), the preview proves nothing; ask the owner to test the built add-on, on the phone when layout or touch is involved, and say so in the log.
