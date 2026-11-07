<!-- HANDOFF START -->
## Session handoff (handoff plugin)
This project uses the session handoff protocol in `handoff/PROTOCOL.md`.
- One chat is one numbered session. The owner opens each one by pasting its start prompt (first line `/handoff:start NNN`; load the handoff:start skill for it) and closes it with `/handoff:handoff`. Only the owner closes a session; do not propose the handoff unless asked.
- The engine is not on PATH. The SessionStart hook prints its exact command (`ENGINE: bash ".../hk.sh"`).
- `handoff/START_HERE.md` is the only current-state document. The SessionStart hook loads it.
- After each finished step, add a line to the open session log in `handoff/sessions/`.
- Automatic compaction is off and blocked. After any manual compaction, re-read the session log and the files you were editing before you continue.
<!-- HANDOFF END -->
