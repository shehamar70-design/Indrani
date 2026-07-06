# 41_PLUGINS_SKILLS_AND_TOOLING_GUIDE.md — FINAL SETUP KIT

Verified 2026-07-05 against official docs and source repos, not just video claims. This is the complete kit — MCP servers, plugins, skills, agents, and free backup data APIs — organized so nothing is missed and nothing is guessed.

---

## 0. Two Different Worlds — Read This First

Every command below is tagged so you know exactly where to type it:

- 🖥️ **TERMINAL** — plain shell/bash. Runs in your Codespace terminal *before or outside* `claude`. Things like `git clone`, `mkdir`, `ln -s`.
- ⌨️ **CLAUDE CODE** — only works *inside* an active `claude` session. Things like `claude mcp add`, `/plugin install`, `/last30days`.

If you type a ⌨️ command in a plain terminal, it does nothing. If you type a 🖥️ command inside `claude`, it also does nothing (or errors). This mix-up is the single most common setup confusion, so every command from here on carries its tag.

---

## 1. Marketplaces — Register Once, First

The official marketplace is already built in — nothing to do. Two more are worth adding because later sections use them:

```bash
⌨️ /plugin marketplace add anthropics/claude-plugins-community
⌨️ /plugin marketplace add obra/superpowers-marketplace
```
- **claude-plugins-community** — Anthropic-validated third-party plugins beyond the core set (Semgrep, CodeRabbit, CodSpeed live here if you ever want alternates).
- **superpowers-marketplace** — unlocks two bonus plugins from the same trusted author as `superpowers`: `superpowers-chrome` (direct Chrome DevTools Protocol control) and `superpowers-lab` (experimental skills). Not required — just available now if wanted later.

---

## 2. Core Setup — Do This Once, In Order

### 2a. MCP servers (external data, browser, docs, database access)

```bash
⌨️ claude mcp add github -- npx -y @modelcontextprotocol/server-github
⌨️ claude mcp add context7 -- npx -y @upstash/context7-mcp
⌨️ claude mcp add playwright -- npx -y @playwright/mcp@latest
⌨️ claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
⌨️ claude mcp add --transport http neon https://mcp.neon.tech/mcp
```

**Neon is new to this guide** — a genuine gap in the earlier version. Since AKASH's data layer runs on Neon Postgres (doc 12), this lets Claude directly inspect tables, run migrations, and query your actual database using plain English, instead of you hand-writing SQL or guessing at schema state. After adding it, type `/mcp` inside Claude Code, select `neon`, and complete the OAuth sign-in. It auto-creates a temporary branch for schema changes and asks before touching production — safe by default. **Do not** rely on it in production later; Neon's own docs say it's for development/IDE use only.

### 2b. Official plugins

```bash
⌨️ /plugin install frontend-design@claude-plugins-official
⌨️ /plugin install security-guidance@claude-plugins-official
⌨️ /plugin install pr-review-toolkit@claude-plugins-official
⌨️ /plugin install commit-commands@claude-plugins-official
⌨️ /plugin install typescript-lsp@claude-plugins-official
⌨️ /plugin install superpowers@claude-plugins-official
⌨️ /plugin install ralph-loop@claude-plugins-official
```

### 2c. Session memory (not a marketplace plugin — installs differently)

```bash
🖥️ npx claude-mem install
```
Run this in the terminal, not inside `claude`. It registers itself as a plugin automatically; you'll see it listed the next time you run `/plugin` inside Claude Code.

### 2d. Verify everything

```bash
⌨️ /mcp
⌨️ /plugin
```
Every item above should show as connected/enabled. If something's missing, open `/plugin` → Discover tab and search by name.

| Tool | What it does | Why AKASH needs it |
|---|---|---|
| github MCP | Issues, PRs, repo ops | Clean PR history per doc 40 |
| context7 MCP | Live, version-correct docs for Next.js/Drizzle/Better Auth | Stops outdated API calls |
| playwright MCP | Real browser clicks/forms | End-to-end flow testing |
| chrome-devtools MCP | Console/network/perf on a live tab | Catches runtime errors, verifies doc 17 budgets |
| neon MCP | Direct database inspection/migration via natural language | Doc 12's data layer, safe branch-based changes |
| typescript-lsp | Type errors surface after every save, automatically | Your continuous bug-catcher, zero prompting needed |
| security-guidance | Fixes vulnerabilities in the same turn it finds them | Enforces doc 18 automatically |
| pr-review-toolkit | 6 review agents (tests, silent failures, type design, etc.) | Run before closing any phase |
| commit-commands | `/commit`, `/commit-push-pr` | Clean git history |
| superpowers | Forces plan → test-first → implement → review | Reinforces docs 22/23/24's discipline even in long sessions |
| ralph-loop | `/ralph-loop` — iterates fix→test→check until done | Closest match to "test and fix on its own" |
| claude-mem | Remembers prior sessions automatically | Stops re-explaining AKASH's structure every day |

---

## 3. Frontend/Backend/Website Agents (agency-agents)

Confirmed after reading the full 150+ agent roster (126k stars, MIT, actively maintained) — genuinely strong, specific agents exist here for exactly this kind of work. Not all 150+; this is the accurate, evidence-based subset:

```bash
🖥️ git clone https://github.com/msitarzewski/agency-agents.git /tmp/agency-agents
🖥️ mkdir -p ~/.claude/agents
🖥️ ls /tmp/agency-agents/agents/
```
Run `ls` first to see the exact current filenames (they vary slightly by repo version), then copy the ones that match this list:

| Agent | Why it earns a spot |
|---|---|
| Frontend Developer | React/Next.js UI implementation |
| Backend Architect | API design, database architecture |
| Database Optimizer | Schema/query tuning for your Neon setup |
| Software Architect | System design trade-offs each phase |
| Code Reviewer | Second opinion alongside pr-review-toolkit |
| Technical Writer | Keeps doc 36 current as you build |
| UI Designer | Pairs with the frontend-design plugin |
| Accessibility Auditor | WCAG — nothing else in this stack covers it |
| Performance Benchmarker | Structured version of chrome-devtools checks |
| API Tester | Validates your live market-data endpoints |
| Reality Checker | Evidence-based go/no-go gate before shipping a phase |
| Security Architect + Application Security Engineer | Threat-modeling, one level above security-guidance |

```bash
🖥️ cp /tmp/agency-agents/agents/<exact-filename>.md ~/.claude/agents/
🖥️ rm -rf /tmp/agency-agents
```

---

## 4. Ongoing Research Tools

### last30days-skill (Reddit/X/YouTube/TikTok/Instagram/HN/Polymarket research)

```bash
🖥️ git clone https://github.com/mvanhorn/last30days-skill.git ~/last30days-skill
🖥️ mkdir -p ~/.claude/skills
🖥️ ln -s ~/last30days-skill/skills/last30days ~/.claude/skills/last30days
```
Then: `⌨️ /last30days` once, to run its setup wizard. Reddit/HN/Polymarket/GitHub work free immediately; X/YouTube/TikTok/Instagram need extra paid API keys later if you want them. Confirmed Bloomberg itself uses this same pattern natively (built-in Twitter integration + "News Trends" social-sentiment tracking) — see doc 42 Section 4. Example prompts:
```
⌨️ /last30days Bloomberg Terminal complaints and feature requests
⌨️ /last30days sentiment on [ticker] this month across Reddit and X
```

### TinyFish MCP (cloud browser automation) — optional

```bash
⌨️ claude mcp add --transport http tinyfish https://agent.tinyfish.ai/mcp
```
Then `⌨️ /mcp` → select tinyfish → OAuth (needs a free account at agent.tinyfish.ai first). Search/fetch tools are free; full browser automation needs paid credits. Honest take: mostly duplicates Playwright/chrome-devtools for AKASH's purposes — add only if you hit a heavy-JavaScript page plain fetch can't read.

---

## 5. Free Backup APIs (public-apis) — Concrete Picks, Not Just "Check It"

Actually searched the repo's Currency Exchange, Cryptocurrency, and Finance-adjacent categories for AKASH-relevant entries. These are genuine, no-nonsense free backups/supplements to doc 12's primary sources:

| API | Use case | Auth needed |
|---|---|---|
| [Frankfurter](https://www.frankfurter.app/docs) | FX rates + historical time series, ECB-sourced | No |
| [currency-api (fawazahmed0)](https://github.com/fawazahmed0/currency-api) | 150+ currencies, no rate limits | No |
| [CoinGecko](https://www.coingecko.com/api) | Crypto prices — good backup/supplement to Binance for doc 32 | No |
| [CoinCap](https://docs.coincap.io/) | Real-time crypto prices | No |
| [TickerTick](https://github.com/hczhu/TickerTick-API) | Stock news across ~10,000 tickers, includes Reddit-sourced stories | No |

These aren't installable "tools" — just note them in doc 12 as fallback options if a primary source (Finnhub/FRED) ever hits a rate limit or changes terms. `public-apis/public-apis` itself is a 447k-star reference list, not an MCP — nothing to connect, just point Claude Code at it when you need to check for a specific free API: *"Check public-apis/public-apis for a free [X] API."* **New data-source finds (India stock data, etc.) now live in doc 43, not here — this doc stays tooling/skills only.**

---

## 5b. New Finds (2026-07-05 research pass) — Quality-focused skills/tools

Verified via web search, not yet installed. Each tagged with which AKASH doc it improves. Data-source APIs found in this same pass are in **doc 43**, not here — this section is Claude-Code-tooling only.

### Token/cost safety — replaces the "pxpipe" idea (rejected, see Section 9)
```
⌨️ /plugin marketplace add scottconverse/context-mode
⌨️ /plugin install context-mode@scottconverse-context-mode
```
Compresses huge tool outputs (logs, JSON, browser snapshots) into a local sandbox before they hit context — 60-98% token savings, fully local/auditable (no third-party proxy of your API traffic, unlike pxpipe). Verify with `/context-mode:ctx-doctor` after a fresh session.

### Yahoo Finance dev-time querying (Claude Code only — app itself still uses `yahoo-finance2` npm package per doc 12)
```
⌨️ claude mcp add yfinance -- uvx --from git+https://github.com/Alex2Yang97/yahoo-finance-mcp yahoo-finance-mcp
```
Lets me (Claude Code) pull real live Yahoo quotes/fundamentals directly while building/debugging Phase 1-2, without writing throwaway test scripts. No key needed.

### News/RSS pipeline quality (doc 12 §5, doc 27)
**Data Deduplication & Canonicalization skill** — goes beyond doc 12's simple URL/title-hash dedup: semantic grouping, hash-based normalization, source-reputation scoring (picks the best version when the same story runs on Reuters + 3 aggregators), tracks reduction metrics. Directly upgrades the RSS ingestion pipeline's honesty/cleanliness. Search `mcpmarket.com` "data deduplication canonicalization" — if no clean install path is found when you're ready, ask Claude Code to build the same logic from this description; the technique matters more than the specific package.

### SEO + site audit (doc 17 §5, doc 19, doc 28 §SEO)
```
🖥️ git clone https://github.com/AgriciDaniel/claude-seo.git /tmp/claude-seo
```
**claude-seo** — 25 sub-skills covering technical SEO, JSON-LD schema generation (includes `NewsArticle`, `BreadcrumbList`, `WebPage` — exactly what doc 28 needs), Core Web Vitals breakdown (LCP subparts via CrUX), and an AI-crawler-access checker (GPTBot/ClaudeBot/PerplexityBot — relevant since AKASH wants to be citable, not just ranked). Free, MIT. Heavier than needed if you only want one quick audit — see below for a lighter option.

```
⌨️ claude mcp add siteaudit -- npx siteaudit-mcp
```
**SiteAudit MCP** (github.com/vdalhambra/siteaudit-mcp) — lighter one-shot alternative: SEO (meta/schema/sitemap), Lighthouse performance, security headers (doc 18 §1.4 checklist), and WCAG accessibility violations, all in one call, no API key, free tier 100 audits/month. Good fit for the doc 17 §6 "verification ritual" and doc 19 bug audits — ask "Audit localhost:3000 — SEO, performance, security headers, accessibility, prioritized fix list."

Pick claude-seo for deep/ongoing SEO work once the news site is live; pick SiteAudit MCP for quick per-phase checks during Phase 2/6.

### 3D / motion / visual-polish skills (doc 17 §UI, doc 28 §design) — for "make the site as good/perfect as possible"
```
⌨️ /plugin marketplace add freshtechbro/claudedesignskills
⌨️ /plugin install core-3d-animation
```
**core-3d-animation** bundle — Three.js (WebGL 3D), GSAP + ScrollTrigger (scroll-driven animation, timelines, parallax), React Three Fiber, Framer Motion, Babylon.js — 5 skills/9 commands/6 agents, MIT, actively maintained. This is a skill layer, not a replacement for `frontend-design` (already installed) — `frontend-design` covers layout/typography/tokens, this covers motion and 3D specifically. Optional add-ons from the same marketplace if wanted later: `animation-components` (React Spring, Lottie, AOS — lighter-weight motion) and `authoring-motion` (Blender/Spline for custom 3D assets, heavier).

**Honest caution:** more animation ≠ automatically better — over-animating hurts performance and can hurt usability (motion-sickness, distraction from content). Have Claude apply this with restraint: 3–4 purposeful moments (hero section, key transitions), not motion on every element. Always keep a `prefers-reduced-motion` fallback (accessibility, doc 18/WCAG). Test with chrome-devtools/SiteAudit MCP after adding any of this — heavy WebGL + video + scroll effects together is the fastest way to blow doc 17's performance budget.

---

## 6. Phase-by-Phase Tool Map

| Phase moment | Tool | Trigger |
|---|---|---|
| Before coding a feature | superpowers + docs 22 | Auto-activates, asks clarifying questions first |
| While coding | typescript-lsp | Automatic, no prompt needed |
| Feature built | playwright | "Open localhost:3000, log in, add AAPL to watchlist, reload, confirm" |
| Checking for bugs | chrome-devtools | "Check console/network on /terminal for errors" |
| Database work | neon MCP | "Show me the current schema for the watchlist table" |
| Before every commit | security-guidance (auto) + commit-commands | `/commit` |
| End of a phase | pr-review-toolkit | "Review before I close this phase — run all aspects" |
| Full audit before a milestone | Ultra Code (Section 7) | See exact prompt below |
| Bounded overnight task | ralph-loop | `/ralph-loop` on a scoped, well-defined problem |
| Per-phase SEO/perf/a11y check | SiteAudit MCP (Section 5b) | "Audit localhost:3000 — SEO, performance, security, accessibility" |

---

## 7. "Ultra Code" / Dynamic Workflows — Verified Facts

Real Claude Code feature, not hype: `/effort ultracode` (session-wide) or the keyword `ultracode` in a single prompt. Pairs `xhigh` reasoning with automatic multi-agent orchestration — Claude spins up sub-agents with clean context windows to investigate, fix, and verify independently. Only available on models supporting `xhigh` (Opus 4.7/4.8, Fable 5, Mythos 5 — not Sonnet 4.6/Opus 4.6). Resets every new session by design. Token-expensive — use for full-codebase bug hunts and security audits, not routine edits.

```
ultracode: audit everything built in this phase for bugs, security issues, and
doc-18 rule violations. Fan out parallel reviewers, verify each finding
adversarially, then rank by severity with a fix plan.
```

If unavailable on your plan, `pr-review-toolkit` + `security-guidance` cover most of the same ground for free.

---

## 8. CLAUDE.md for Your Repo Root (do once)

Auto-loads every session, no copy-pasting needed:

```markdown
# CLAUDE.md — AKASH

1. Think before coding: state your plan and assumptions first. If ambiguous, ask.
2. Simplicity first: minimum code for the immediate problem, no speculative extras.
3. Surgical changes: touch only what's requested, match existing style.
4. Goal-driven, verified execution: break work into verify-checked steps.
   Never claim something works without evidence (test output, screenshot).
5. Full rules: docs/24_MASTER_PROMPT.md, docs/12 (real-data-only), docs/18 (security).
```

---

## 9. What to Skip — and Why

| Item | Verdict | Reason |
|---|---|---|
| "Illegal skills" (Chinese Grandpa, Weaponized AIs, Methlab, etc.) | Skip | Unofficial, joke-branded, unverified — superpowers + CLAUDE.md above cover the same ideas safely |
| Ponytail's specific % claims | Skip trusting the numbers | Real repo, but stats come from the maintainer's own promo video, not independent benchmark |
| Graphify, Impeccable, Higsfield, NotebookLMPI, n8n MCP | Not needed yet | Solve problems AKASH doesn't have in Phase 1-4 |
| "Clone paid apps locally" as a pattern | Don't apply to AKASH | Fine for personal learning; real legal/IP risk for a product you intend to run |
| Gary Tan's Stack/GStack (23-role team) | Skip | Overlaps with superpowers + your own docs 21/37-40; two competing role systems risks conflicting instructions |
| TestSprite | Optional, later | Legit, but needs signup; Playwright+chrome-devtools+typescript-lsp already cover testing free |
| pxpipe (text-as-image token hack) | **Skip — see doc 43 note** | Routes API traffic through an unofficial third-party proxy (doc 18 violation) and risks OCR misreads of numbers/symbols (doc 12 real-data-only violation). `context-mode` (Section 5b) gets similar savings safely. |

---

## 10. WebMCP — Watch-List Only

Real joint Google/Microsoft W3C draft standard (`navigator.modelContext`), verified independently — but Chrome-only early preview, explicitly not production-ready as of mid-2026. Not a tool for *building* AKASH; a possible *feature* of AKASH's finished site later (letting a user's AI agent call `add_to_watchlist()` directly). Nothing to install now — noted in doc 36 as a Phase 6+/v2 idea.

---

## 11. Web Search & Bloomberg Research

Claude Code has **WebSearch and WebFetch built in by default** — nothing to install, verified directly. It searches and reads pages on its own whenever it needs to, including all public material on Bloomberg Terminal. Full Bloomberg feature research (functions, news structure, design system, criticisms-as-opportunities) is in **doc 42**. One fixed limit, not a tooling gap: the live Bloomberg Terminal itself has no public URL — it's a $24-32k/year closed institutional product, so every Bloomberg-style project works from public material by necessity.

---

## 12. Safety Note

Plugins run with your full user permissions; Anthropic doesn't vet every third-party plugin's ongoing behavior. Stick to what's named here. Before installing anything new you find later, check the actual repo yourself (maintainer, last update, open issues) before it touches a codebase holding real user data.
