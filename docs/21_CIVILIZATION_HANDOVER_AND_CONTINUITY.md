# 21 — Civilization: Handover & Continuity

> How work survives across Claude Code sessions, context resets, and days/weeks of building. This replaces the "human team / AI heads" model with a simple, practical continuity system — Claude Code is the single orchestrator.

---

## 1. The continuity problem

Claude Code sessions end, context gets compacted, and you (the user) work from a phone. The system below guarantees zero knowledge loss between sessions.

## 2. The three continuity files (Claude Code maintains these)

```
STATE.md        # current phase, current task, what's done, what's next, known issues
DECISIONS.md    # every architectural decision + why (append-only log)
docs/27_SOURCE_NOTES_AND_LIMITATIONS.md  # data-source quirks discovered while building
```

### STATE.md format (keep under 80 lines, overwrite each session)
```md
# STATE — updated 2026-07-02 14:30
## Phase: 2 (News site) — 60% complete
## Done
- Ticker tape strip (live Yahoo data, 15s refresh)
- Homepage hero + top news rail
## In progress
- Article page (components built, needs related-articles rail)
## Next
- Markets hub page (docs/33)
## Known issues
- Yahoo crumb sometimes 401s → retry logic in place, monitor
## Commands to resume
pnpm dev  # then open http://localhost:3000
```

## 3. Session protocol

### Session START (every time)
1. Claude reads: `CLAUDE.md` → `STATE.md` → the docs file for the current task
2. Claude states in one paragraph: where we are, what it will do this session
3. User confirms or redirects

### Session END (or when context feels heavy)
1. Claude updates `STATE.md`
2. Claude appends any new decisions to `DECISIONS.md`
3. Commit + push: `git add -A && git commit -m "wip: <summary>" && git push`
4. User can run `/compact` or start fresh next time — nothing is lost

## 4. Department model (simplified)

The original spec had 100+ human roles and AI heads. In practice, Claude Code plays all roles via subagents (doc 20 §6). Map:

| Original "department" | Now handled by |
|---|---|
| Research / editorial | `researcher` subagent + docs/02–05 |
| Engineering | `builder` subagent (main loop) |
| QA / audit | `reviewer` subagent + docs/19 checklist |
| Data desk | docs/12 + docs/18 fallback rules |
| Design | docs/15–16 (fixed design system, no debate) |

Do NOT build an actual multi-agent org. One orchestrator (Claude Code) + 3 subagents + these docs = the whole civilization.

## 5. Handover to a brand-new session/machine

If everything is lost except the git repo:
1. Clone repo → `pnpm install` → copy `.env.example` to `.env.local`, fill secrets
2. `claude` → `/init` is NOT needed (CLAUDE.md exists) → say: "Read STATE.md and continue"
3. That's it. All knowledge is in the repo.

## 6. Rules

- STATE.md is updated EVERY session end — no exceptions.
- DECISIONS.md is append-only. Never rewrite history.
- If Claude is unsure whether something was decided before, it greps DECISIONS.md before asking the user.
- Docs in `docs/` are the spec of record. If code and docs conflict, docs win — or update the doc deliberately and log it in DECISIONS.md.
