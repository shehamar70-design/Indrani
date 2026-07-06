# 24 — Master Prompt (First message to Claude Code, one time only)

> This is the very FIRST thing you paste into Claude Code after setup (docs/25 §Setup). It bootstraps the whole project.

---

## The prompt

```
You are the sole orchestrator and builder of "Akash" — a Bloomberg-quality
financial news website + terminal, built with Next.js. All specs live in
the docs/ folder of this repo. You manage everything end-to-end: reading
specs, planning, asking me questions, building, testing, committing, and
maintaining continuity files.

FIRST, do this setup (no app code yet):

1. Read docs/00_RESEARCH_OVERVIEW.md — it indexes all 37 docs.
2. Read docs/01 (vision), docs/12 (data sources), docs/18 (security +
   real-data rules), docs/21 (continuity protocol), docs/36 (roadmap).
3. Create CLAUDE.md at repo root (max 150 lines) containing:
   - Tech stack summary (from docs/01 §stack)
   - Folder map
   - The REAL DATA rule and fallback-chain rule (from docs/18) verbatim
   - Security rules summary (docs/18 §1)
   - Session protocol (docs/21 §3)
   - "Before implementing any area, read its docs/NN file"
4. Create STATE.md and DECISIONS.md per docs/21 templates.
5. Set up the project skeleton per docs/01: Next.js App Router, TypeScript,
   Tailwind, pnpm. Install nothing beyond what docs/01 lists.
6. Set up .claude/ folder per docs/20: commands (verify, audit, new-func)
   and the three subagents (researcher, builder, reviewer).
7. Verify MCP servers are connected (/mcp) — I will have added them per
   docs/20 §2 before this message.
8. Run the dev server, confirm the default page loads.
9. Commit everything: "chore: project bootstrap".
10. Update STATE.md → "Phase 1 ready" and STOP.

Then tell me you're ready for Phase 1 planning. I will start plan mode
with the docs/22 prompt.

Hard rules that apply forever:
- Real data only, never fabricated numbers (docs/18 §2)
- Free APIs only unless I explicitly approve a paid one
- Ask me when specs are ambiguous — never improvise architecture
- Hinglish or English replies are both fine; keep summaries short
```

## What happens next (the full lifecycle)

```
You paste MASTER PROMPT (this doc)     → Claude bootstraps repo
You paste PLAN MODE prompt (docs/22)   → Claude plans Phase 1
You say "approved"                     → paste EXECUTION prompt (docs/23)
Claude builds Phase 1                  → commits, updates STATE.md
"wrap up" → next session: "Read STATE.md and continue" → repeat per phase
```

## If Claude Code already has a project open (not empty repo)

Prepend this line to the prompt:
```
The repo already contains files. Inventory them first and reuse what fits
the docs/ specs; list anything that conflicts before deleting.
```
