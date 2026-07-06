# Indrani — Project Instructions for Claude Code

**Product name is "Indrani".** Some older docs say "AKASH" — treat every "AKASH" reference as "Indrani". This file + `docs/` are the spec of record.

Indrani is a two-surface financial platform:
1. **Indrani News** — public, Bloomberg.com-class financial news site.
2. **Indrani Terminal** — keyboard-first, Bloomberg-Terminal-class workspace at `/terminal`.

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4, package manager **pnpm**, deployed on Vercel.
- Data: Yahoo Finance (`yahoo-finance2`, primary) → Finnhub → Binance (crypto) → FRED (macro) → RSS news. Real data only.
- Auth: Better Auth on Neon Postgres (Drizzle ORM).
- Node 22. Dev server: `pnpm dev` → http://localhost:3000

## Folder map

```
app/            # App Router routes (news site public routes; /terminal app)
public/         # static assets
docs/           # THE SPEC OF RECORD — files 00–43, read before building
lib/data/       # (planned, docs/12) providers/, chain.ts, cache.ts, batch.ts, safe-fetch.ts
.claude/        # commands (verify, audit, new-func) + agents (researcher, builder, reviewer)
STATE.md        # current phase/task/next/issues — updated EVERY session end
DECISIONS.md    # append-only architectural decision log
```

**Before implementing any area, read its `docs/NN` file first.** Build order lives in `docs/36_DOCUMENTATION_ROADMAP.md`. If code and docs conflict, docs win — or update the doc deliberately and log it in DECISIONS.md.

## REAL-DATA rule + fallback chain (verbatim from docs/18 §2)

**Never show fake data as real. Never invent numbers.** For every data area:

```
primary source → secondary source → cached copy (marked "delayed") → "unavailable" state
```

- If primary fails/times out (>3s), automatically try secondary.
- If both fail, serve cache but visually mark it: "Delayed — as of 10:42 AM".
- If no cache exists, render an explicit unavailable state. NEVER placeholder numbers.
- If two sources disagree on a value, prefer the most recently updated; log the discrepancy.
- Circuit breaker: after 5 consecutive failures for a source, skip it for 60s.

Every UI component that renders market data must handle: `loading`, `live`, `stale`, `unavailable`. Every provider call goes through `safeFetch` (docs/18 §3). Free APIs only unless the user explicitly approves a paid one.

## Security rules (summary of docs/18 §1 — read full doc before touching auth/API)

- All API keys in env vars; never hardcoded, never shipped to the client. External API calls happen only in Route Handlers / Server Actions. `.env.local` gitignored; keep `.env.example` current.
- Every API route validates input with Zod. Tickers must match `^[A-Z0-9.^=\-]{1,12}$`. Search queries: max 100 chars, HTML stripped. Parameterized queries only (Drizzle).
- Better Auth built-in scrypt hashing; session cookies httpOnly/secure/sameSite=lax. Every user-data query filters by session `userId` (Neon has no RLS). Rate-limit auth: 5 attempts / 15 min per IP.
- Security headers in next config: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. No unsanitized `dangerouslySetInnerHTML` (sanitize RSS HTML). External links get `rel="noopener noreferrer"`.

## Session protocol (docs/21)

**Session START:** read `CLAUDE.md` → `STATE.md` → the docs file for the current task; state in one paragraph where we are and what this session will do; user confirms.

**Session END (or when context feels heavy):** update `STATE.md` (≤80 lines, overwrite); append new decisions to `DECISIONS.md` (append-only, never rewrite); `git add -A && git commit -m "wip: <summary>"` (+ push when a remote exists).

If unsure whether something was decided before, grep `DECISIONS.md` before asking the user.

## Working rules

- Real data only, never fabricated numbers (docs/18 §2). Ask the user when specs are ambiguous — never improvise architecture.
- Phases are sequential (docs/36); plan mode → approval → execution → audit → STATE.md. Branch per phase.
- Design intent: visually stunning and premium, rich animated data viz, tasteful 3D/motion with `prefers-reduced-motion` fallbacks — always within the docs/17 performance budget and docs/15–16 design/motion rules.
- Legal: Bloomberg-*inspired*; never copy Bloomberg logos, trademarks, article text, or proprietary data.
