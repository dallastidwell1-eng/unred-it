# Session 001: Agree the project plan

Posture: planning only, with the owner; one thing at a time; no code yet.
Written at setup (session 000, `/handoff:init`, 2026-11-06). Read with handoff/START_HERE.md.

## Session-start check
1. Read CLAUDE.md, handoff/START_HERE.md, and this kickoff. Session 000 was the setup only; it has no session log. Its only record is the Git commit `[handoff] init`.
2. Run the snapshot check. Every line should read MATCH; explain any DIFFERENT or UNREAD line before other work. (The first check may have no earlier snapshot to compare against; say so if that is the case.)
3. Other checks: none. No tool logins, outside documents, or live checks are set up.
4. Open this session's log.
5. Report to the owner in three lines and wait for the go.

## Where we are
- The folder `C:\AI_Node\reddit` holds only the handoff setup: `handoff/`, `CLAUDE.md`, `.claude/settings.json`, `.gitignore`. No project code exists yet.
- The owner said the project is code kept in Git. Nothing else about it is known: not its purpose, language, or whether it uses the Reddit API.
- Git is local, inside this folder. No remote. Autosave commits after each turn and never pushes.
- Modules on: decisions, open questions, lessons, to-do, secret scan. Off: live checks, rules reminder, doc mirror.
- Automatic compaction is off for this project.

## What this session does
1. Ask the owner what the project is and what it must do. Done when its purpose is written as one paragraph in this session's log.
2. Agree the scope: what is in, what is out. Done when each choice is recorded as a decision (`D-###`) in handoff/decisions.md.
3. Agree the technical stack (language, main libraries, how it talks to Reddit if it does, where credentials live). Done when recorded as decisions; anything not settled goes to handoff/open-questions.md as `OQ-###`.
4. Break the work into first milestones. Done when handoff/todo.md lists them in order, each with a check for "done".
5. Ask whether the project needs live checks (for example a Reddit app's status) or a rules reminder (for example "posting to Reddit needs the owner's approval"). If yes, record it as a to-do to turn on; do not change handoff/config.json without the owner's approval.

Deliverable: an agreed plan held in handoff/decisions.md, handoff/open-questions.md and handoff/todo.md, which session 002 can start building from.

## Binding lessons
None yet.

## Owner follow-throughs
- Know (or decide in the session) what the project is for.
- If it will use the Reddit API: credentials stay out of the repository. The owner keeps them; the secret scan blocks commits that look like keys.

## Scope
In: purpose, scope, stack, milestones, open questions.
Out: writing project code, creating Reddit apps or accounts, posting anything to Reddit.
When the deliverable is done, the owner runs /handoff:handoff, which writes session 002's kickoff and start prompt, commits, and stops.
