# 25 — User Guide: Aapko Step-by-Step Kya Karna Hai

> Yeh file AAPKE liye hai (phone se kaam karne wale user ke liye). Har step exact order mein. Claude Code sab build karega — aap sirf yeh steps follow karo.

---

## STEP 0 — Ek baar ka setup (Codespaces, jo aapke paas already hai)

1. GitHub par ek **naya repo** banao: `akash-platform` (private).
2. Us repo se **Codespace kholo** (phone browser se bhi chalta hai — aap already yeh kar chuke ho).
3. Terminal mein Claude Code check karo: `claude --version` (aapke screenshot mein v2.1.198 chal raha hai — theek hai).
4. Yeh **docs/ folder** (37 files) repo mein daalo:
   - Sabse aasan: is v0 chat se "Download ZIP" ya GitHub push karke files repo mein le jao, `docs/` folder root par ho.
5. Terminal mein MCP servers add karo (docs/20 §2 se copy karo):
   ```bash
   claude mcp add context7 -- npx -y @upstash/context7-mcp
   claude mcp add playwright -- npx -y @playwright/mcp@latest
   claude mcp add github -- npx -y @modelcontextprotocol/server-github
   ```
6. `claude` chala kar `/mcp` type karo — teeno connected dikhne chahiye.

## STEP 1 — Bootstrap (pehli baar, ek baar)

1. `claude` kholo.
2. `docs/24_MASTER_PROMPT.md` kholo, prompt block copy karo, Claude mein paste karo.
3. Claude repo bootstrap karega (CLAUDE.md, STATE.md, skeleton, commit).
4. Jab Claude bole "ready for Phase 1" — Step 2 par jao.

## STEP 2 — Har phase ka loop (yeh baar-baar repeat hoga)

```
A. Shift+Tab (do baar) → plan mode
B. docs/22 ka prompt paste karo + phase ka naam likho
C. Claude plan dega → padho → sawal poochho → "approved" bolo
D. docs/23 ka execution prompt paste karo
E. Claude banata jayega, commit karta jayega
F. Kaam khatam / thakna ho → "wrap up" bolo
G. Claude STATE.md update karke push karega
```

## STEP 3 — Agli session (kal, parson, kabhi bhi)

Bas itna type karo:
```
Read STATE.md and continue from where we left off.
```
Claude sab yaad kar lega (STATE.md + DECISIONS.md + docs/ se).

## Phase order (docs/36 roadmap)

1. **Phase 1** — Foundation: data layer (safeFetch), auth, design tokens
2. **Phase 2** — News site: homepage, articles, markets hub, search
3. **Phase 3** — Terminal core: command line, quotes, charts, layout grid
4. **Phase 4** — Terminal features: watchlists, alerts, calendar, futures/FX
5. **Phase 5** — Media: TV page, podcasts, newsletters, Hindi content
6. **Phase 6** — Polish: motion, performance, full audit

## Common situations (cheat sheet)

| Problem | Kya karo |
|---|---|
| Claude permission maange | Command padho; plan ke andar hai to approve |
| Preview mein kuch toota | Bata do: "homepage par ticker overlap ho raha hai mobile pe" |
| Claude slow/confused lage | Commit ke baad `/compact` |
| Session crash ho gaya | Naya `claude` → "Read STATE.md and continue" |
| Naya idea aaya | Pehle bolo "add to backlog in STATE.md" — beech mein direction mat badlo |
| API key chahiye (Finnhub/FRED free) | Website par free signup → key ko `.env.local` mein daalo — CHAT MEIN KEY PASTE MAT KARO |
| Kuch delete karne ko bole | "why?" poochho pehle |

## Kya KABHI mat karo

- Chat mein API keys/passwords paste mat karo — sirf `.env.local` mein
- Plan approve kiye bina execution shuru mat karwao
- Ek saath do phases mat chalwao
- "Sab kuch ek saath bana do" mat bolo — phase order follow karo (quality isi se aati hai)

## Free API keys jo aapko khud banani hain (sab free)

| Service | Kahan se | Kis phase mein chahiye |
|---|---|---|
| Neon (database) | neon.tech — free tier | Phase 1 |
| Finnhub | finnhub.io — free 60 req/min | Phase 1 (secondary source) |
| FRED | fred.stlouisfed.org/docs/api — free | Phase 4 (economic calendar) |
| Yahoo Finance | koi key nahi chahiye | — |
| Binance public API | koi key nahi chahiye | — |
