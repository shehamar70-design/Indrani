# Indrani Homepage News Selection & Ranking — Research Proposal
*(RESEARCHER output, 2026-07-14. No code changes made. Companion sources file: `news-curation-research.md`. All file:line refs verified against repo; live feed tests run 2026-07-14 ~08:40 UTC.)*

---

## 1. Diagnosis — why junk ranks top (verified, file:line)

1. **Top stories = raw recency.** Lead module is literally the 5 newest items (`app/(news)/page.tsx:62`) from a merge sorted only by `publishedAt` (`lib/data/providers/rss.ts:181-182`). No scoring/ranking/clustering code exists anywhere (grep across `lib/`, `app/`, `components/`).
2. **General-news feeds pollute the pool.** ET "top stories" (india), BBC Hindi, CNBC Politics, Guardian Environment (`rss.ts:28,30,34,38`) feed the same homepage merge; the only drop rule is missing title/url (`rss.ts:156`) — hence a local court case can lead the site.
3. **Dedup is exact-match only.** `dedupeItems` keys on exact URL + exact lowercased title (`rss.ts:178-193`); reworded/updated versions of one story all survive as duplicate bulletins.
4. **Missing-date fallback pins junk to top.** Items without parseable pubDate get `new Date()` (`rss.ts:157-161`), ranking them newest.
5. **The fix was anticipated but unbuilt:** docs/12 §5 (Neon `news_items` persistence, 5-min cron) and docs/43 §12b (feed candidates + "dedup/canonicalization skill, doc 41 §5b") — not implemented (`page.tsx:107-108` comment).

## 2. What Bloomberg-class curation actually is (sources in `news-curation-research.md`)

- **Human homepage editors are the core.** Bloomberg's Digital Editor posting (careers.bloomberg.com/job/detail/124256) describes homepage curation as a dedicated role. The Bloomberg Way separates **speed** (First Word bulletins) from **enterprise** features.
- **Best-documented hybrid: NYT** (NiemanLab, Oct 2024): 250+ stories/day → 50-60 homepage slots; ~half algorithm-assisted via a **pool → rank → finish** pipeline with editor pinning and exposure minimums. This is the model Indrani should copy algorithmically.
- **Wires fold updates**: complete replacement versions per update ("write-throughs"); Reuters "UPDATE 1-" numbering convention: **UNVERIFIED** (no free primary doc).
- **Google News**: clusters near-duplicates across sources; ranks on freshness, prominence, originality, authority; clustering patent US9361369B1 uses **earliest pub date as canonical story time**.
- **Techmeme**: link/cluster algorithm + human editors; picks the *best-conveyed version* as the cluster headline, folds the rest under "discussion".
- **Near-dup techniques**: SimHash 64-bit, Hamming ≤3 (Manku et al., WWW'07); MinHash+LSH (Broder '97); sentence-embedding cosine ~0.75–0.9.
- **Decay formulas in production**: HN `(P−1)/(T+2)^1.8`; Reddit `log10(votes)+t/45000`.
- **LLM relevance pass is trivially cheap**: ~1,000 headlines/day ≈ **$1.35/mo (GPT-4o-mini) – $9/mo (Haiku)** at cited July-2026 pricing. Latency irrelevant (async cron, not request path).
- **Image as lead-slot criterion**: documented only as Google Top Stories eligibility (min image size). Publisher-side lead-image mandates: **UNVERIFIED** — but safe as a *gate* (a lead hero without an image renders broken anyway, per docs/02 lead-module anatomy, 02:17-26).

## 3. Feed-level fixes (live-tested 2026-07-14; ~half the junk disappears here)

| Action | Feed | Verified status |
|---|---|---|
| **Add** | Hindu BusinessLine markets `thehindubusinessline.com/markets/feeder/default.rss` | 200, ~60 items, Last-Modified + **304 works**, high volume — poll **5 min** |
| **Keep** | ET Markets `…/markets/rssfeeds/1977021501.cms` (already `rss.ts:29`) | 200, ETag+LM, **304 works** — poll **10 min** |
| **Add** | NDTV Profit `feeds.feedburner.com/ndtvprofit-latest` | 200, fresh; no 304 (always full 20-item fetch) — poll **10 min** |
| **Add** | Livemint `livemint.com/rss/markets` and `/rss/money` | 200, fresh, no validators — poll **15 min** |
| **Add (Reuters substitute)** | Google News RSS query feeds (`news.google.com/rss/search?q=…&hl=en-IN&gl=IN&ceid=IN:en`) | 200, 100 items; Reuters official RSS confirmed dead (301→404) |
| **Do NOT add** | Moneycontrol `/rss/*.xml` | Returns 200 but **content frozen April 2024** — abandoned |
| **UNVERIFIED** | Business Standard `markets-106.rss` | 403 Akamai bot-block from server IP; may differ from residential/Vercel IPs |
| **Dead** | Financial Express feeds | 410 (deliberately disabled) |
| **Demote from homepage pool** | ET top-stories (`rss.ts:28`), BBC Hindi (`:30`), CNBC Politics (`:34`), Guardian Environment (`:38`) | Route to their verticals only (india / hindi / politics / green), never the homepage "all" merge |

**Freshness ceiling:** no tested feed declares a WebSub hub → **polling is the only option**. Use stored ETag/Last-Modified per feed (conditional GET); 5–15 min intervals match docs/43 §12b's "5–15 min polling is normal".

## 4. Proposed staged pipeline (ingest → cluster → score → classify → slot)

**Stage 0 — Ingest (cron, per-feed interval above).** Conditional GET with persisted ETag/Last-Modified. **Drop items with unparseable pubDate** (replaces the `now()` fallback, `rss.ts:157-161`). Normalize; keep existing exact dedup (`rss.ts:178`) as a cheap first pass. Persist to Neon `news_items` (docs/12 §5 — finally implement it).

**Stage 1 — Cluster/fold duplicates.** SimHash over normalized title 4-gram shingles, Hamming ≤3 ⇒ same cluster (embedding cosine ≥0.8 as later upgrade). Cluster canonical time = **earliest** member pubDate (Google patent practice). Displayed version = member from highest-authority source, longest headline as tiebreak (Techmeme practice). Others fold under the cluster (never render as siblings).

**Stage 2 — Relevance classification (two passes).**
- *Pass A (free, sync):* rules — feed category ∈ {markets, economy, crypto, wealth} ⇒ relevant; else keyword/entity match (ticker symbols, Sensex/Nifty/RBI/SEBI/IPO/earnings/rate/rupee…) ⇒ relevant; crime/court/local-city terms without finance entities ⇒ irrelevant.
- *Pass B (optional, async):* small-LLM label {finance-core, finance-adjacent, off-topic} on Pass-A "unsure" items only. Honest cost: ≪$10/mo at ~1k headlines/day (see §2). Recommended but not required for launch.

**Stage 3 — Score (real signals only, no fabrication):**

```
score(cluster) = W_src × R × (1 + 0.6·ln(1 + S)) / (age_hours + 2)^1.8
```
- `W_src` = static per-feed authority weight (e.g., ET Markets/BusinessLine 1.0, Livemint 0.9, NDTV Profit 0.85, Google-News-proxied 0.7) — editorially set, stored in config.
- `R` = relevance ∈ {0 dropped, 0.5 finance-adjacent, 1.0 finance-core}.
- `S` = count of **distinct sources** in cluster (corroboration = importance; this is the closest honest proxy for editorial "big story" judgment).
- Denominator = HN gravity decay (cited).

**Stage 4 — Slot into tiers (docs/02 anatomy, 02:17-26; current tier sizes `page.tsx:62-70`):**
- **Lead (1):** highest-score cluster **with image** and `R=1`; max 1 per source in the lead module (diversity constraint, NYT/Google practice).
- **Secondaries (2-4):** next clusters, ≥2 distinct sources preferred, ≥1 non-markets category for mix.
- **Rail "Latest" (5):** pure reverse-chron **wire**, but post-cluster and `R>0` only — this is where speed lives (Bloomberg First Word analogue).
- **Section bands:** per-category top-scored, unchanged sizes (4 each).
- **Breaking banner:** keep existing keyword+30-min rule (docs/03:11) but require `R=1`.
- Optional editor pin: a single Postgres row overriding the lead (NYT "pinning" practice) — human-in-the-loop, zero fabrication.

## 5. Storage

- **Postgres (Neon, already the stack):**
  - `news_items` (exists in schema intent, docs/12 §5; `lib/db/schema.ts:126`): + `cluster_id`, `relevance`, `simhash BIGINT`, `image_url`.
  - `news_clusters`: `id, canonical_item_id, earliest_published_at, source_count, top_score` (score recomputed on read or by cron — it's cheap arithmetic).
  - `feed_state`: `feed_url PK, etag, last_modified, last_polled_at, fail_count`.
  - `homepage_pins`: `slot, item_id, expires_at` (optional editor override).
- **Redis (Upstash): not required.** 5-min ISR (docs/03:23) + Postgres suffices at this volume; add Redis only if per-request ranking latency ever matters. (Recommendation, not a verified constraint.)

## 6. Staging order (each step independently shippable)

1. Feed swap + route general feeds to verticals + drop bad-date fallback → kills most junk immediately.
2. Persist `news_items` + `feed_state` w/ conditional GET (implements docs/12 §5).
3. SimHash clustering + fold.
4. Rule-based relevance + scoring formula + tier slotting.
5. Optional: LLM pass on unsure items; editor pin row.
