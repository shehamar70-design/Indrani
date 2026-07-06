# 22 — Plan Mode Prompt

> Copy-paste this into Claude Code at the START of every phase, BEFORE any code is written. Press Shift+Tab twice (or `/plan`) to enter plan mode first.

---

## The prompt (copy everything inside the block)

```
You are in PLAN MODE. Do not write or edit any code yet.

Context:
- Read CLAUDE.md, STATE.md, and DECISIONS.md first.
- Then read the docs file(s) for the phase I name below.
- This project is "Akash" — a Bloomberg-style news site + terminal, Next.js App Router, real data only (docs/12 + docs/18 rules are absolute).

Your task:
1. Read the relevant docs/NN files for this phase.
2. Produce a concrete implementation plan with:
   a. Exact file list (paths) you will create or modify
   b. Order of implementation (what depends on what)
   c. Data sources used and the fallback chain for each (per docs/18)
   d. What already exists in the codebase that you will reuse
   e. Risks / open questions — ask me now, not mid-build
3. Keep the plan under 60 lines. No code in the plan.
4. Wait for my approval. Do not exit plan mode until I say "approved".

Phase for this session: <PHASE NAME — e.g. "Phase 2: News homepage, docs/03 and docs/33">
```

## How to use (step by step)

1. Open Claude Code in Codespaces terminal: `claude`
2. Press `Shift+Tab` twice until you see "plan mode" (or type `/plan`)
3. Paste the prompt above, replacing `<PHASE NAME>` with the current phase from STATE.md
4. Claude will read docs and propose a plan
5. Read the plan. Push back on anything unclear: "Why X? Use Y instead."
6. When satisfied, say: **"approved — exit plan mode and execute"**
7. Claude switches to execution (docs/23 rules apply automatically via CLAUDE.md)

## Phase names to use (from docs/36 roadmap)

| Phase | Say this |
|---|---|
| 1 | "Phase 1: Foundation — docs/12, docs/13, docs/15" |
| 2 | "Phase 2: News site — docs/03, docs/04, docs/28, docs/33" |
| 3 | "Phase 3: Terminal core — docs/07, docs/08" |
| 4 | "Phase 4: Terminal user features — docs/09, docs/30, docs/31, docs/32" |
| 5 | "Phase 5: Media & Hindi — docs/05, docs/29, docs/34, docs/35" |
| 6 | "Phase 6: Polish & audit — docs/16, docs/17, docs/19" |

## Red flags in a plan (reject and re-plan if you see these)

- Plan invents data or uses hardcoded prices ("mock for now") — violates real-data rule
- Plan skips the fallback chain
- Plan proposes >15 files in one go — split the phase
- Plan doesn't mention reading existing code
- Plan adds a paid API without you asking for it
