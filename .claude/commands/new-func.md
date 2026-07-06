---
description: Scaffold a new Indrani Terminal function code ($ARGUMENTS = function code, e.g. GP)
---

Scaffold the new terminal function `$ARGUMENTS`:

1. Read `docs/07_TERMINAL_LAYOUT_COMMANDS_AND_SHORTCUTS.md` and the docs file covering this function's area (08 market data/charts/screeners, 09 watchlists/alerts/portfolio, 30 news, 31 calendar, 32 FX/futures/commodities).
2. Register the function code in the terminal command registry (parser + autocomplete entry with description and argument signature).
3. Create the panel component for it, following the existing panel pattern (dark terminal theme, keyboard navigation, loading/live/stale/unavailable states).
4. Wire data through the `lib/data` chain only — never call a provider directly from the component.
5. Add the function to HELP output and any relevant keyboard shortcuts.
6. Run /verify and confirm the function works end-to-end by keyboard alone (type the code in the command line → panel opens with real data).
