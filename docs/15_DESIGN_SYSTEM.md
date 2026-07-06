# 15 — DESIGN SYSTEM

Two coordinated surfaces, one system: **News** (editorial, light-first with dark bands) and **Terminal** (forced dark, dense, amber).

## 1. Color tokens (Tailwind v4 `@theme` in globals.css)

### Shared semantic tokens
```
--background / --foreground        news: near-white #fafafa / near-black #111114
--card / --card-foreground
--primary: #111114 (news ink)      --primary-foreground: #fafafa
--accent-up: #00873c (news) | #00c853 (terminal)     up/positive
--accent-down: #d32029 (news) | #ff1744 (terminal)   down/negative
--accent-brand: #2962ff            AKASH blue (links, active states, live badges use down-red)
--muted / --muted-foreground / --border / --ring
--radius: 0.375rem (news) | 0.125rem (terminal — sharp, dense)
```

### Terminal scope `.terminal-dark`
```
--background: #0a0a0c   --foreground: #e6e6e6
--panel: #101014        --panel-border: #26262c
--amber: #ff9800        command line, active panel border, function codes, stale tags
--cyan: #4dd0e1         links/interactive data
--grid-line: #1a1a20
```

Total palette discipline: news = ink black, off-white, brand blue, up-green, down-red. Terminal = near-black, white text, amber, green, red (+cyan links). No purple. No gradients (exception: subtle chart area fills).

## 2. Typography (max 2 families)

- **Display/headlines**: `Newsreader` (serif — Bloomberg-like editorial gravitas) via next/font — weights 500/700, used on news headlines, Big Take, section headers.
- **UI/body/data**: `Inter` — news body, all UI chrome.
- **Terminal data**: `Geist Mono` (or JetBrains Mono) — ALL terminal numbers, command line, tickers, tables. Tabular numerals (`font-variant-numeric: tabular-nums`) mandatory for any number column anywhere.
- Hindi: `Noto Sans Devanagari` mapped into the sans stack for `/hi` (doc 35).
- Scale: news headline 40-56px display, dek 20px, body 18px/1.6; terminal base 13px/1.4, quote-hero 42px mono, table rows 12.5px.

## 3. Signature patterns

- **TickerStrip**: 32px tall, mono font, `SYMBOL  1,234.56  +0.45%` groups, continuous marquee (CSS animation, pauses on hover, respects `prefers-reduced-motion`).
- **Price flash**: on quote update, 300ms background pulse green/red then fade — the "terminal is alive" feel.
- **Data age dot**: green ≤15s, amber ≤5min ("delayed"), red/grey = unavailable. Everywhere real-time data shows.
- **LIVE badge**: red dot + pulse ring, "LIVE" caps, 11px.
- **Panel chrome**: 1px border, function code in amber caps left, symbol white, controls right; active panel = amber border.
- **News cards**: no boxes/shadows — hairline dividers, whitespace, headline-first (Bloomberg style). Images 3:2, subtle hover headline underline.
- **Section headers**: overline caps 12px letter-spaced + rule line.
- **Numbers**: green/red only for change values; levels stay foreground color.

## 4. Spacing & layout

- Tailwind spacing scale only. News container max-w-7xl; article measure ~680px. Terminal is full-viewport, panels gap-px on a grid-line background.
- Flexbox default; CSS Grid for panel grid, stats grids, homepage bands. Mobile-first.

## 5. Components inventory (shadcn base + custom)

shadcn: button, input, dialog, dropdown-menu, tabs, toast/sonner, table, badge, skeleton, tooltip, sheet (mobile nav).
Custom: ticker-strip, quote-chip, price-flash, sparkline, data-age-dot, live-badge, panel, command-bar, stat-grid, story-card, section-band, calendar-row, importance-stars.

## 6. Accessibility

- Never color-only for up/down: always include +/- sign and arrow glyph (▲▼).
- Terminal contrast ≥ 4.5:1 for data text; focus rings visible (amber on dark, blue on light).
- All marquee/pulse animations disabled under `prefers-reduced-motion`.
- Full keyboard support per doc 07; skip-to-content link on news pages.
