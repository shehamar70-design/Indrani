# Bloomberg.com Public News Site — Mobile (375px) Layout & Design Patterns

**Primary source:** archived homepage HTML, Wayback snapshot `20250601210736` of
`https://www.bloomberg.com/` (the live "Phoenix" front-end, `pageId: phoenix-americas`).
All component/class names below are lifted verbatim from that markup, so they are concrete
and buildable. Secondary sources cited at the end.

> Key structural insight: Bloomberg's homepage is a **stack of self-contained "lineup" modules**
> (`type: lineup_content`), each with its own `variation`. On mobile these do **not** collapse
> into a flat link list — each module keeps its identity (card carousel, 4-up grid, audio player,
> newsletter card) and stacks vertically. The page is composed of **Zones → Columns → Modules**;
> the top zone is literally named `"Above the Fold"` with a `"righty"` layout.

---

## 1. HERO / LEAD MODULE

- The lead slot is a module `id: lede_1` inside the `"Above the Fold"` zone, using
  **`variation: "two_col_lede"`** (`featured` and `text_over_image_dark` variants also exist).
- Structure: one **dominant lead story** + a stacked column of **secondary stories**
  (`StoryBlock_secondaryStory__umGlh`, 69 instances sitewide). On mobile the two columns
  reflow to a single column: big lead image + headline first, then the secondary headlines as a
  compact list beneath it.
- Headline system uses two sizes: **`Headline_phoenix__Dvz0u`** (large lead, 123 uses) and
  **`Headline_small__k_tTz`** (secondary/card, 103 uses).
- Lead stories carry a **`storyBlockSummary`** (dek/subhead, `StoryBlock_storyBlockSummary__tB7BK`,
  16 uses) — a 1–2 line summary under the headline. Real example dek observed:
  *"The strikes come as…"* appended after the Ukraine headline.
- **Overline / kicker labels** are a first-class element: **`OptionalEyebrow_optionalEyebrow__mNUnT`**
  (38 component uses, 53 total). Eyebrows seen: `Review`, `Weekend Essay`, `Weekend Interview`,
  `The Big Take`, `Bloomberg Opinion`, and an **author eyebrow** (`Opinion` + author name, e.g.
  `Opinion / John Authers`). Media eyebrows double as format+duration: `Listen (16:34)`,
  `Watch (1:45)`, `Listen (54:44)`.

---

## 2. CARD & GRID LAYOUTS

Bloomberg never uses a plain stacked link list — confirmed. The building blocks:

- **StoryBlock** (`StoryBlock_storyBlock__ja_vR`, 86 uses): the atomic unit — linked image
  (`Media_linkedImage__1R4j5`) + eyebrow + headline (+ optional summary). `Media_image__n9qKY`
  (98 uses) with a **gradient overlay** (`Media_gradient__OQE8M`) and an
  `Media_imageOverlayLink__Mu66J` so the whole image is tappable.
- **Card** (`Card_card__P_N28` + `Card_small__7qQqv`, 28 uses): boxed variant used inside
  carousels; `Card_mediaFromCard` puts the image at top, `Card_cardStoryBlock` holds
  eyebrow+headline below. Cards animate (`styles_animatedCard__GleBs`).
- **`gridModule_gridModule___HgOM`** (34 uses) with `VariantBase_gridModuleWithHeader__84xnO` —
  a grid that ships with its own header band (see §8).
- **4-across topic rail**: **`LineupContent4Up_item__8HDQH`** (28 uses), variation `"4_up"` /
  `"4_up_video"`. Four story blocks in a row on desktop; on mobile these become a
  **horizontal-scroll carousel** (`LineupContentCarouselCards`) or a 2×2. Note
  `LineupContent4Up_bottomOfFour` / `bottomOfTwo` classes = responsive breakpoint variants.
- **Topic module** (`LineupContentTopic_card__GC7Fp`, variation `"topic"` / `"topic_stories"`):
  one hero card + a secondary list, grouped under a single topic header.

**Full module variation vocabulary** (from JSON `variation` fields — these are the concrete
grid patterns to replicate):
`two_col_lede`, `featured`, `text_over_image_dark`, `2_up`, `4_up`, `4_up_video`,
`topic` / `topic_stories`, `carousel_cards`, `carousel_basic`, `carousel_3_up_video`,
`carousel_magazine`, `magazine`, `magazine_grid`, `weekend_landscape`, `opinion`,
`linked_image`, `latest_filtered`, `audio`, `podcast_player`, `user_watchlist`.

This is the "asymmetric, section-changes-day-to-day" modular system Code and Theory built —
the same template flexibly renders emphasis without new page types.

---

## 3. TICKER STRIP (top markets bar)

- Implemented as **`SecurityPill`** components (`media-ui-SecurityPill_*`), each rendering
  **name → price → change** in one pill:
  `S&P 500` · `sized-price` (`media-ui-SizedPrice`) `5,911.69` · `SecurityPill_priceChange` delta.
- **Change indicator**: `media-ui-Change_default-*` (32 uses) with an **arrow glyph + percent**:
  literal values captured — `Arrow Down 0.01%`, `Arrow Down 0.32%`, `Arrow Up 0.14%`,
  `Arrow Up 0.64%`. Color-coded up/down (green/red) via the Change component.
- **Symbols present in the strip** (indices + FX + commodities + crypto + rates):
  `S&P 500`, `Nasdaq`, `Dow`, `Russell`, `FTSE`, `DAX`, `Nikkei`, `Hang Seng`, `Euro`,
  `Crude` / `WTI`, `Brent`, `Gold`, `Bitcoin`, `US 10-Year`.
- On mobile the pill row is a **horizontal-scroll strip** (overflow-x) so all symbols remain
  swipeable without wrapping. Format per pill: **short name, not exchange code** (public site
  uses `S&P 500`, not the Terminal's `SPX <INDEX>`).

---

## 4. INLINE NEWSLETTER SIGNUP CARDS

- **`Card_newsletterCard__b3_4R`** (14 uses) — a boxed card rendered **inline within the feed**,
  inside `LineupContentCarouselCards_card`. So newsletters appear as cards in the same carousels
  as stories, not only in a footer.
- Anatomy: eyebrow **`Newsletter: <Name>`** (e.g. `Newsletter: CFO Briefing`,
  `Newsletter: Balance of Power`, `Newsletter: Economics Daily`, `Newsletter: Washington Edition`,
  `Newsletter: The Brink`, `Newsletter: Tech In Depth`, `Newsletter: Working Capital`,
  `Newsletter: Business of Space`) → then a **`Headline_small`** teasing a related story
  (e.g. "Record CFO Turnover Is a Sign of the Times") → CTA to subscribe. The word "newsletter"
  appears **169×** in the page — newsletters are threaded throughout, not siloed.
- Buildable takeaway: a distinctly-styled boxed card (border/tint background to separate it from
  editorial cards), eyebrow label `Newsletter: X`, a hook headline, and a subscribe CTA — dropped
  **between story cards** every few modules.

---

## 5. "STORIES FOR YOU" / PERSONALIZATION

- Dedicated module **`title: "Stories for You"`**, `type: lineup_content`, **`variation: "4_up"`**,
  `nextItemOffset: 20` — i.e. a personalized 4-up rail with load-more paging
  (`tracking.title: "Stories For You"`).
- A **`user_watchlist`** module (`variation: "user_watchlist"`, `id: sub_hub_watchlist`,
  `type: story_list`) — a personalized markets watchlist block.
- `Follow` affordances present (6 `Follow` / 11 `follow`). No separate "Your News" panel string in
  this snapshot — personalization surfaces as the **Stories for You rail + watchlist**, driven by
  followed topics.

---

## 6. VIDEO CAROUSELS

- `Carousel` appears **122×**; video-specific variations **`4_up_video`** and
  **`carousel_3_up_video`**. Video cards carry a **play affordance with runtime**:
  `PlayIconWithDuration_playIconWithDuration__CiPux` (`playIcon` + `icon` + `duration`, 17 sets) —
  a play triangle badge overlaid on the thumbnail with the clip length (e.g. `Watch (1:45)`).
- `Bloomberg Originals` is a named module header feeding these video rails. On mobile these are
  **horizontal swipe carousels** of 16:9 thumbnails, each with play badge + eyebrow + headline.

---

## 7. INLINE AUDIO PLAYER

- Two audio surfaces: module **`variation: "audio"`** and **`variation: "podcast_player"`**.
- **"Bloomberg News Now"** (`News Now` ×7, `Bloomberg Radio` ×8): the prominent inline player for
  a ~5-minute newsroom audio summary (matches Bloomberg Media's Feb-2024 homepage announcement).
- Audio story blocks reuse the **`Listen (mm:ss)`** eyebrow + `PlayIcon` pattern, so audio items
  look consistent with video/story cards but with a listen/duration badge.
- Header band grouping audio+video: module title **"Listen, Watch and Catch Up"**.

---

## 8. SUB-NAV PILLS & SECTION BANDS

- **Module header** = section band: `ModuleHeader_ModuleHeader__yI3XP` (18) with
  `ModuleHeader_title__eAyEi`. Titles observed (each starts a band): `Markets`, `Technology`,
  `Economics`, `Politics`, `Wealth`, `Green`, `Pursuits`, `CityLab`, `Industries`, `Explainers`,
  `Work & Life`, `Bloomberg Businessweek`, `Bloomberg Originals`, `Bloomberg en Español`,
  `Markets Magazine`, `Space`, `Listen, Watch and Catch Up`.
- **Sub-nav pills** under a section header: **`ModuleHeader_navItem__t9e8Q`** (23) — a horizontal
  row of topic links beneath the band title. Real examples:
  - Markets → `ETFs | Crypto | Deals | AI | Cybersecurity | Screentime`
  - Regions → `UK | Europe | Middle East | Asia`
  - Green → `New Energy | Greener Living | ESG Investing`
  - Economics → `Inflation & Prices | Indicators | Central Banks`
  These are the tappable **pill rail** directly under each section heading — mobile scrolls them
  horizontally.

---

## 9. TYPOGRAPHY, COLOR, DIVIDERS

- **Headlines are sans-serif**, not serif — no `serif`/`Georgia`/`Playfair` references in the
  markup; Bloomberg uses its proprietary **AvenirNext / BW Haas**-style sans across headline sizes
  (`Headline_phoenix` large, `Headline_small`). Distinct headline hierarchy by size class, not by
  font family.
- **Eyebrows/kickers** are the primary color/semantic accents: red for breaking (Code and Theory
  documents the "bold red headline" breaking pattern), and format-colored labels for
  Opinion/Newsletter/Listen/Watch.
- **Section bands** separate content: each `ModuleHeader` title + optional pill rail acts as the
  visual divider between stacked modules; `VariantBase_headerSiblingContainer__3nEJ6` binds a
  header to the grid directly below it.
- **Media treatment**: images use a bottom **gradient scrim** (`Media_gradient`) so overlaid text
  (in `text_over_image_dark`) stays legible.
- **Lazy loading** everywhere (`styles_lazy___9s4S`, 102 uses) — modules below the fold defer,
  important for the long mobile stack.

---

## 10. BUILDABLE SUMMARY (for the redesign)

1. Compose the homepage as a **vertical stack of typed modules**, each self-contained, never a
   flat link list. Give each module a `variation` so one template yields many layouts.
2. **Hero** = `two_col_lede`: big lead image + phoenix headline + dek, plus a secondary-story
   list; collapses to single column on mobile.
3. Every card = **image (tap-whole-card) + eyebrow/kicker + headline (+ optional dek)**. Eyebrows
   encode section, format (`Listen 16:34` / `Watch 1:45`), or `Newsletter: X`.
4. **Horizontal-scroll carousels** for 4-up topic rails, video rails, and card rails on mobile.
5. **Ticker strip** = swipeable row of name+price+arrow%+color pills (indices, FX, commodities,
   crypto, rates), short names not exchange codes.
6. **Inline newsletter cards** and **inline audio ("News Now") player** interleaved between story
   modules.
7. **Personalization**: a `Stories for You` 4-up rail + a `user_watchlist` block.
8. **Section bands** = title + horizontal **pill sub-nav**; sans-serif headline hierarchy by size.

---

## Sources

- Archived homepage HTML — Wayback `20250601210736`:
  https://web.archive.org/web/20250601210736/https://www.bloomberg.com/ (component/class names,
  variations, ticker symbols, module titles all extracted from this markup)
- Archived Markets page — Wayback `20250602161949`:
  https://web.archive.org/web/20250602161949/https://www.bloomberg.com/markets
- Bloomberg Media — [How We're Keeping Our Audience First… (Feb 2024 homepage redesign: breaking
  banner, cross-platform modules, News Now 5-min audio player)](https://www.bloombergmedia.com/press/how-were-keeping-our-audience-first-by-creating-a-homepage-designed-for-them/)
- Code and Theory — [Bloomberg Business case study (modular flexible system, recirculation next to
  every story, red breaking headline)](https://www.codeandtheory.com/things-we-make/bloomberg-business)
- Jordan Crone — [Bloomberg.com's redesign: the good, the bad and the meh (hover subheads, template
  flexibility, "busy" critique)](https://medium.com/@jordantheleast/bloomberg-com-s-redesign-the-good-the-bad-and-the-meh-c16bfa6b8ece)
- Nieman Lab — [Bloomberg Business' new look](https://www.niemanlab.org/2015/01/bloomberg-business-new-look-has-made-a-splash-but-dont-just-call-it-a-redesign/)
