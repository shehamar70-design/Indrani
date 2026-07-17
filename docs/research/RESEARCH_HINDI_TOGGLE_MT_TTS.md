# Research: Global Hindi/English Toggle + MT + Hindi TTS (replaces docs/35 Tier-2 "separate Hindi articles" concept)

RESEARCHER deliverable — 2026-07-14. Per-claim sources; UNVERIFIED flagged. No code.

## Current-state (repo facts, verified by reading)
- docs/35: Tier 1 UI chrome hi toggle (MVP), Tier 2 Hindi RSS aggregation (MVP), Tier 4 MT "NEVER presented as original — if ever added, clearly labeled 'मशीन अनुवाद'". Audio rules: TTS must be labeled "AI-generated audio / एआई-जनित ऑडियो", keyboard accessible, MediaSession, no autoplay; Hindi TTS pronunciation review required (rule 5).
- docs/05: `/hi` mirrors home with Hindi RSS feeds; toggle in UtilityBar via cookie; Devanagari via Noto Sans Devanagari.
- docs/44 (course correction): already anticipates per-article language toggle + Hindi TTS "Listen" + persistent bottom player with 1x/1.5x; open question "Hindi TTS engine — on-device vs API?".
- Scaffold: `lib/i18n.ts` has `t(locale,key)`, `LOCALE_COOKIE="indrani_locale"`, en fallback; `messages/en.json`/`hi.json` (~37 leaf strings); `lib/format.ts` has Indian grouping (`en-IN`) via `opts.indian`.
- docs/18 §2 defines the ordered fallback-chain pattern; docs/17 cache layers: SWR → in-memory LRU/Next data cache → CDN s-maxage+SWR. No Redis in stack; Postgres = Neon (CLAUDE.md).

## A. EN→HI machine translation

| Option | Quality (hi) | Cost | Latency | ToS/serverless fit |
|---|---|---|---|---|
| **Azure Translator F0** | Good commercial NMT | **2M chars/mo free, permanent**; then $10/M. Hard-stops (429/403) at quota — no surprise bills. Throughput cap 2M chars/hr, ~33.3k/min | Low (REST) | Official API; 50k chars/request cap. Sources: [MS Learn service limits](https://learn.microsoft.com/en-us/azure/ai-services/translator/service-limits), [Azure pricing](https://azure.microsoft.com/en-us/pricing/details/translator/), [MS Q&A Dec 2025](https://learn.microsoft.com/en-sg/answers/questions/5662243/character-count-and-cost-estimation-for-azure-tran) |
| **Google Cloud Translation v2/v3** | Best-in-class hi NMT | **500k chars/mo free ($10 credit, Basic+Advanced combined, permanent, no rollover)**; then $20/M. Counts every code point incl. HTML tags; needs billing-enabled project | Low | Official. Sources: [cloud.google.com/translate/pricing](https://cloud.google.com/translate/pricing), [langbly breakdown](https://langbly.com/blog/google-translate-api-pricing-guide/) |
| **LLM (Gemini 2.5 Flash-Lite)** | Very good w/ glossary prompt (Hinglish register controllable — matches docs/35 §4 style) | $0.10/$0.40 per M tokens; free tier exists but Flash-only, ~1k req/day, quotas cut Dec 2025/Apr 2026, **free-tier data may train models** — don't send embargoed content. 2.0 Flash-Lite shut down 2026-06-01 | Medium | Official. Sources: [ai.google.dev pricing](https://ai.google.dev/gemini-api/docs/pricing), [aifreeapi guide](https://www.aifreeapi.com/en/posts/gemini-api-pricing-2026) |
| **LibreTranslate self-hosted (Argos)** | **UNVERIFIED — no en→hi BLEU/COMET found**; anecdotally weaker than commercial for Hindi; direct en→hi model exists (no pivot loss) | Free software + ~$5-10/mo VPS | Medium (CPU) | AGPL server, fine self-hosted. Sources: [argos-translate GitHub](https://github.com/argosopentech/argos-translate/), [LibreTranslate community](https://community.libretranslate.com/c/argos-translate/5) |
| **AI4Bharat IndicTrans2** | Strong Indic-specialist (IN22 benchmarks); en-indic 1B (~2GB fp16, wants T4/L4 GPU) or dist-200M (CPU-capable but slow) | GPU host ~$50+/mo or slow CPU box; **not viable on Vercel serverless** (needs `trust_remote_code`, IndicProcessor, long-running process) | High cold-start | Open weights on HF. Sources: [HF en-indic-dist-200M](https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M), [HF indictrans2 1B cards](https://huggingface.co/ai4bharat/indictrans2-indic-en-1B), [GitHub](https://github.com/AI4Bharat/IndicTrans2) |

**Recommended chain (docs/18 §2 pattern, free-first):**
1. Cache (Postgres) → 2. **Azure Translator F0** (biggest free quota) → 3. **Google Translation v2** (500k/mo) → 4. **Gemini Flash-Lite** (glossary-primed; headlines/summaries only, if 2–3 exhausted) → 5. Serve English + "अनुवाद अनुपलब्ध / translation unavailable" notice. Never block render on a live translation.
- Volume sanity check: ~50 articles/day × ~5k chars ≈ 7.5M chars/mo if every body were translated — exceeds all free tiers combined. Hence: **translate headlines+summaries eagerly at ingest (~150k chars/mo — fits Azure F0 alone); translate bodies lazily on first Hindi request, then cache forever.**
- IndicTrans2 = future self-host upgrade if volume outgrows free tiers; not MVP (GPU + Vercel mismatch).

**Caching (translate once per article):** Postgres (Neon — already in stack; docs/17 has no Redis layer, don't add one). Conceptual schema:
`article_translations(article_id, target_locale, field ∈ {headline, summary, body}, source_hash, engine ∈ {azure, google, gemini}, translated_text, translated_at)` — unique on (article_id, target_locale, field); `source_hash` = hash of source text so edits invalidate; `engine` recorded for label/audit. Layer Next data cache/CDN on top per docs/17.

## B. App Router architecture: cookie vs /hi prefix
- **Google's explicit guidance:** use **separate URLs per language, NOT cookies**; don't auto-redirect by IP; use hreflang; Google detects language from visible content only. Source: [Google Search Central — multi-regional/multilingual](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).
- **Google on MT content (June 2025 clarification — current guidance):** AI/MT translation is **not automatically spam**; the scaled-content-abuse policy bites when translations "provide little to no value." The old robots.txt block-MT guidance was removed June 2025. Reddit indexes tens of millions of AI-translated URLs unpenalized. Risk = scaling *low-quality* MT. Sources: [Search Engine Journal](https://www.searchenginejournal.com/google-removes-robots-txt-guidance-for-blocking-auto-translated-pages/548870/), [gsqi.com analysis](https://www.gsqi.com/marketing-blog/auto-translating-content-google-scaled-content-abuse/), [Search Engine Land — Google statement](https://searchengineland.com/google-comments-on-reddits-use-of-ai-to-translate-its-pages-456908).

**Recommendation — hybrid, two tracks:**
1. **Global toggle = cookie (`LOCALE_COOKIE`, existing), same URL.** MT variants are NOT separately indexed (Googlebot gets default EN at the canonical URL) → zero scaled-content-abuse exposure while MT is unreviewed. Deliberate trade-off: no Hindi SEO for MT pages — acceptable because unreviewed MT is exactly Google's "little value at scale" risk case.
2. **Keep `/hi` prefix (docs/05) for the curated Hindi section** (Hindi RSS, any human-reviewed content) with `hreflang="hi"/"en"/x-default` pairs — the SEO-safe Hindi surface. If MT later gains a human-review pass (Le Monde MTPE model), promote article translations to `/hi/...` URLs + hreflang then.
- **Per-article override composition:** resolve per request: `?lang=hi|en` searchParam (per-article toggle; shareable; wins) → else `LOCALE_COOKIE` → else `DEFAULT_LOCALE`. One server-side `resolveLocale(searchParams, cookies)` used by layout + article page. Article toggle sets only the searchParam (doesn't mutate the cookie); header toggle sets the cookie. `?lang=` variants carry `rel=canonical` to the clean URL (standard param canonicalization) — no noindex needed.
- **Streaming/SSR:** cookies()/searchParams make pages dynamic (article pages already are). First-ever hi view of a body may hit a live API → stream the EN shell, put the translated body behind Suspense; cached translations render server-side instantly. Matches vercel-react-best-practices: dynamic data inside Suspense below a static shell.

## C. Labeling spec (what majors do)
- **Le Monde in English:** DeepL MT + human post-edit (MTPE), disclosed process, translator stylebook, ~4 review passes. Sources: [Arab News](https://www.arabnews.com/node/2058876/media), [DailyAlts](https://dailyalts.com/artificial-intelligence-le-monde-the-iconic-french-paper-now-uses-ai-powered-translation/).
- **Nikkei Asia:** reader-side AI translation into 7 languages incl. Hindi. Source: [Nikkei global services](https://www.nikkei.co.jp/nikkeiinfo/en/global_services/nikkei-inc/new-features-make-nikkei-asia-more-accessible-than-ever.html). Exact badge wording: **UNVERIFIED** (not found).
- **Research (Jan 2026, arXiv):** bare "AI-generated" labels reduce trust; disclosing the human/AI split + progressive disclosure performs better. Source: [arXiv 2601.11072](https://arxiv.org/html/2601.11072v1).

**Spec:** persistent badge under headline/byline whenever body is MT: `⚠ मशीन अनुवाद · Machine translated` + inline `"मूल अंग्रेज़ी देखें / View original (English)"` link (= per-article toggle to `?lang=en`). Expander detail: "Translated automatically by <engine>. Not reviewed by Indrani editors. The English original is authoritative." Also: small "MT" chip on translated headline cards; badge repeated at article footer; spoken as the first sentence of Hindi TTS audio. Curated `/hi` RSS content is never labeled MT (it isn't). Satisfies docs/35 Tier-4 rule verbatim.

## D. Hindi TTS
**Current spec:** docs/35 §3 rules 1–5 (bilingual AI-audio label, no autoplay, MediaSession, keyboard access, pronunciation review before shipping Hindi TTS); docs/34: own TTS audio explicitly NOT MVP, "quality decision" pending; docs/44: per-article toggle + Hindi TTS Listen + bottom player with speed control.

| Option | Coverage/quality (honest) | Cost | Verdict |
|---|---|---|---|
| **Web Speech API (hi-IN)** | iOS: ALL browsers use Safari's engine; needs Apple hi voice (e.g., Lekha) on device; `speak()` requires user gesture. Android Chrome: lists hi-IN even when the voice pack is NOT installed → silent English fallback; some devices report `hi_IN` (underscore). Chrome cuts utterances at ~15s/~200–250 chars → must chunk. Quality device-dependent, mediocre-to-OK | Free, zero infra | **MVP choice**, with honest degradation |
| **edge-tts (unofficial)** | Neural hi-IN voices, good quality | Free but emulates Edge against a Microsoft-internal endpoint; MS blocked the browser method Dec 17 2025 (killed extensions/tts.best); Python lib still works in 2026; legality question to MS unanswered; HN consensus: not for production | **Reject for production** (ToS/continuity risk) |
| **Sarvam Bulbul v2/v3 API** | Vendor claims lowest CER on numerics/code-mixing/Hinglish (our exact register — UNVERIFIED, vendor benchmark); 11 langs; hosted API; ₹1000 free credits; not open-weights | Paid after credits | Phase-2 server-side upgrade |
| **AI4Bharat Indic Parler-TTS / IndicF5** | Open (Apache-2.0); Hindi included; ~0.9B params, consumer-GPU class; IndicF5 = reference-clip voice style | GPU hosting — **not Vercel-serverless viable** | Future self-host only |

Sources: [MDN Web Speech](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API), [web-speech-recommended-voices](https://github.com/HadrienGardeur/web-speech-recommended-voices), [talkr speechSynthesis lessons](https://talkrapp.com/speechSynthesis.html), [edge-tts GitHub](https://github.com/rany2/edge-tts), [MS Q&A legality thread (unanswered)](https://learn.microsoft.com/en-us/answers/questions/2392491/unofficial-edge-tts-api), [HN Dec-2025 block](https://news.ycombinator.com/item?id=42800321), [Sarvam Bulbul docs](https://docs.sarvam.ai/api-reference-docs/models/bulbul), [HF indic-parler-tts](https://huggingface.co/ai4bharat/indic-parler-tts), [HF IndicF5](https://huggingface.co/ai4bharat/IndicF5).

**Recommendation:** browser-side Web Speech API for MVP (EN + HI); server-side later.
- Detection: `getVoices()` + `voiceschanged` listener; match `/hi[-_]IN/i` (fall back to `/^hi\b/`); set `utterance.lang='hi-IN'` regardless; chunk body into ≤200-char sentence utterances (also fixes the Chrome cutoff); one queue controller feeds the docs/44 bottom player (`utterance.rate` = 1x/1.5x speed control).
- Honest fallback chain: hi voice found → Hindi TTS; hi listed but suspect (Android) → play + helper text "अगर आवाज़ अंग्रेज़ी में सुनाई दे, तो फोन Settings में Hindi voice इंस्टॉल करें"; no hi voice → offer EN TTS of the original + explanatory message. Never fake availability.
- Label per docs/35 rule 2 verbatim ("AI-generated audio / एआई-जनित ऑडियो"); no autoplay; MediaSession hooks. Trade-off: browser-side = zero cost, no audio storage, but inconsistent voices and no real audio file; server-side (Sarvam API or self-hosted Parler-TTS) = consistent, cacheable MP3s but cost/GPU — defer behind docs/34's "TTS quality decision" gate and docs/35 rule 5 (pronunciation review first).
- Confirmed: `/home/ubuntu/whisper.cpp` is Whisper = speech-to-text only; irrelevant to TTS.

## UNVERIFIED summary
1. Argos/LibreTranslate en→hi quality — no public BLEU/COMET benchmarks found; anecdote only.
2. Nikkei/El País exact on-page MT badge wording — not found in sources.
3. Web Speech hi-IN voice presence per device — inherently device-dependent; treat `getVoices()` as a hint, not a guarantee.
4. edge-tts legality — Microsoft never answered the public Q&A; risk assessment inferred from the Dec 2025 partial block.
5. Sarvam "lowest CER" claim — vendor's own benchmark, not independently verified.
