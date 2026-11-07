# Session Handoff Protocol: reddit

**Purpose.** Every session ends cleanly, and the next session starts with zero loss: no lost context, instructions, decisions, open questions or state. A fresh session with no memory of the last one must be able to continue from this folder alone.

This file is the authority for how sessions start and end in this project. The `handoff` plugin carries it out: `/handoff:start` opens a session, `/handoff:handoff` closes it, and its hooks help in between.

## 1. Rules that never change
1. **One chat is one session.** Each session has a three-digit number (`NNN`) and starts as a fresh chat, not a resumed one. If a clearly new piece of work begins in the middle of a session, say so and offer to hand off.
2. **This folder is the only memory.** Everything that must survive goes into a file here and is committed. Do not rely on the chat or on anything "remembered".
3. **Write as you go.** After each finished step, add a line to this session's log. Record decisions, questions and lessons when they happen, not only at the end. A crash or a lost connection then loses at most one step.
4. **One current-state document.** `handoff/START_HERE.md` is the only place that says where the work stands now. It stays under its size limit so the start hook can load it whole.
5. **Verify, then say so.** Say that something is done only after a check shows it. A command that "should have worked" is not verification.
6. **Read live facts live.** Take Git state and outside-system facts from the commands that report them, never from a document. Documents are claims; the systems are the evidence.
7. **Read the clock before you write a time.** Never estimate a time.
8. **No automatic compaction.** The plugin blocks it and `.claude/settings.json` turns it off. The owner watches the context and closes the session in time. A compaction keeps a summary, not the detail.
9. **No session ends without the handoff.** If time is short, use `/handoff:handoff emergency`.

## 2. The files
- `handoff/START_HERE.md`: the current state, `Next session: NNN`, the single next step, what waits on the owner, the top lessons, and the snapshot taken at the last close.
- `handoff/sessions/NNN_YYYY-MM-DD_topic.md`: one log per session, created at the start, updated after every step, completed at the close.
- `handoff/kickoffs/session-NNN-kickoff.md` and `session-NNN-start-prompt.md`: the next session's run-book and the message the owner pastes to open it. Written at the close of the session before.
- `handoff/templates/`: the templates for the three files above. Edit them to suit this project; the lint checks each log and kickoff against the headings in its template.
- `handoff/config.json`: the modules that are on, Git autosave, live checks and the rules reminder.
- `handoff/_state/`: local state of the hooks (autosave log, last compaction). Never committed.
- `handoff/decisions.md`: every lasting decision, numbered `D-###`, dated, with who decided.
- `handoff/open-questions.md`: every unsettled question, numbered `OQ-###`, with `Status: open` or `Status: closed` and, when closed, the answer, its source and the date.
- `handoff/lessons.md`: binding lessons, numbered `L-##`, each with where it came from.
- `handoff/todo.md`: work that is agreed but not scheduled yet.
- The lint scans the project for text shaped like a secret value. Never write a secret value into a handoff file; record names, IDs and last-4 hints only.

## 3. The hooks (a safety net, not a replacement for the start and close)
- **SessionStart** loads `START_HERE.md`, live Git facts and warnings (open session, automatic compaction on) into every new, resumed, cleared or compacted session.
- **UserPromptSubmit** adds the rules reminder to every message, when that module is on.
- **PreCompact** blocks automatic compaction. A manual `/compact` still runs and is recorded in the open session log.
- **Stop** and **SessionEnd** commit every change after every turn (`autosave (turn): <time>`). They push only when `git.push` is on and a remote named `origin` exists.

## 4. Start of a session (`/handoff:start NNN`)
The owner pastes the start prompt; its first line is `/handoff:start NNN`. Claude may load the start skill for it (the start skill is the one the owner lets Claude call, and only when asked to open a session); the close and the setup stay the owner's to start.
Read CLAUDE.md, START_HERE, the kickoff and the previous log. Run the snapshot check and explain every DIFFERENT or UNREAD line. Do the kickoff's other checks. Open the session log. Report in three lines and wait for the owner's go.

## 5. Close of a session (`/handoff:handoff`)
Close when the planned work is done, when the owner says stop, or when a clearly new piece of work begins. The owner decides when; the owner watches the context.
Park the work, sync any mirrored document, update the running files, carry every finding, judgment call and follow-through forward into a file a later session will read (an item left only in an old log is lost), complete the log, write the next kickoff and start prompt, rewrite START_HERE, update CLAUDE.md only if a standing rule changed, then take and check the snapshot once every file is written, lint until `RESULT: HANDOFF COMPLETE`, commit `[handoff] session NNN: <summary>`, report in at most five lines, and stop.

## 6. Emergency close (`/handoff:handoff emergency`)
Write an `EMERGENCY HANDOFF` block at the top of the session log and of START_HERE: exactly where work stopped, anything unsaved or unverified, and the next step. Commit. The next session finishes the close before any new work.
