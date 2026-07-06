# 14 — AI ASSISTANT "ASKB" (DEFERRED — SPEC KEPT READY)

**Status: NOT in MVP.** Per project decision, Claude Code handles all orchestration during the build; ASKB is a later product feature. Build this ONLY when explicitly scheduled (doc 36 roadmap, Phase 6+).

## 1. Important security note

Any previously circulated API endpoint/key for this assistant is **unofficial/leaked and must never be used**. When built, ASKB uses the **Vercel AI Gateway** (official, `AI_GATEWAY_API_KEY` or zero-config on Vercel) with the AI SDK. No hardcoded keys, ever.

## 2. Product spec (for later)

- Terminal function `ASKB` — a chat panel inside the terminal + a compact "Ask AKASH" entry on quote pages.
- Capabilities: explain a symbol's day move (grounded in fetched real quotes + headlines), summarize a news cluster, explain a terminal function, screen suggestions ("show me large-cap gainers" → runs EQS with filters).
- **Grounding rule**: every factual market claim must come from tool calls into the existing data layer (`getQuote`, `getNews`, `getCalendar`) and be cited inline ("NIFTY 50: 24,312.4, +0.8% — Yahoo, 12s ago"). If tools return UNAVAILABLE, the model must say the data is unavailable. No unverifiable numbers.
- Implementation shape: AI SDK `streamText` + tools in `app/api/askb/route.ts`; model via AI Gateway (pick a current model from the gateway list at build time); streaming UI with tool-call transparency ("fetching AAPL quote...").
- Rate limits: per-user daily cap; auth required.

## 3. Acceptance (when built)

- [ ] Zero uncited market numbers in responses.
- [ ] Tools reuse the doc-12 data chain exclusively.
- [ ] Streams, cancellable, mobile-friendly panel.
- [ ] Official AI Gateway only; key server-side only.
