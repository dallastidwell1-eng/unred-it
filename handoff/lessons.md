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
