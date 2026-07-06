# 23 — Execution Mode Prompt

> Use this AFTER a plan is approved (docs/22). It governs how Claude Code builds.

---

## The prompt (paste after saying "approved")

```
EXECUTION MODE. The approved plan is our contract. Rules:

1. Work in the exact order from the plan. One feature at a time.
2. After each feature: run `pnpm exec tsc --noEmit`, fix errors, then verify
   the page in the browser (Playwright MCP or dev server) before moving on.
3. REAL DATA ONLY. Every number on screen comes from the safeFetch fallback
   chain (docs/18). If a source fails, show the stale/unavailable state —
   never invent a value.
4. Security rules from docs/18 §1 are absolute: env vars for keys, Zod
   validation, userId scoping on all user data.
5. Commit after every working feature:
   git add -A && git commit -m "feat: <what>"
6. If you hit something not covered by the plan or the docs:
   STOP and ask me. Do not improvise architecture.
7. If a task turns out bigger than planned, tell me and propose a split.
8. At the end of the session (or when I say "wrap up"):
   - Update STATE.md (current status, next steps, known issues)
   - Append new decisions to DECISIONS.md
   - Commit and push.

Begin with item 1 of the plan.
```

## During execution — how YOU (user) supervise from a phone

| Situation | What to type |
|---|---|
| Claude asks permission for a command | Read it; if it matches the plan, approve. `rm`, `curl` to unknown hosts, force-push → deny and ask why |
| Long silence / big output | "status?" — Claude summarizes progress |
| Something looks wrong in preview | Describe it: "ticker strip overlaps the nav on mobile" |
| Want to stop | "wrap up" — triggers rule 8 |
| Context getting long / slow | "/compact" after a commit |
| Claude goes off-plan | "stop — that's not in the plan. Go back to item N" |

## Verification loop Claude must follow per feature

```
write code → tsc → lint → open page in browser → check states
(loading/live/stale/unavailable) → mobile 375px check → commit
```

## Escalation rules for Claude

- 2 failed attempts at the same bug → stop, explain the situation, present 2 options
- A dependency needs installing → install with pnpm FIRST, then import
- A data source is dead (e.g. Yahoo endpoint changed) → switch to secondary, log it in docs/27, tell the user
- Anything requiring a paid account/key → ask the user, never sign up for anything

## Session-end checklist (rule 8 expanded)

- [ ] STATE.md updated with: phase %, done list, in-progress, next, known issues
- [ ] DECISIONS.md appended (if any decisions made)
- [ ] docs/27 appended (if any source quirks found)
- [ ] `git push` done — work is safe on GitHub
- [ ] One-paragraph summary to the user
