# 07 — TERMINAL: LAYOUT, COMMANDS AND SHORTCUTS (SPEC)

Route: `/terminal` (client-heavy app shell, auth-gated for persistence features; read-only functions work logged out).

## 1. Shell layout

```
components/terminal/
  terminal-shell.tsx     — grid: command bar / panels / status bar
  command-bar.tsx        — input + GO + suggestions dropdown
  panel.tsx              — panel frame: title, security context, function body, close/maximize
  panel-grid.tsx         — layout presets (1 / 2 / 2x2 / 3-col), active panel state
  status-bar.tsx         — connection dot, data freshness, market session (pre/open/post/closed), IST+ET clocks, alert count
  function-registry.ts   — maps codes → component + metadata
  command-parser.ts      — parses input into {symbol?, function, args}
```

- Theme: forced dark (`.terminal-dark` scope). Colors per doc 15: background near-black `#0a0a0c`, amber `#ff9800` command/emphasis, green `#00c853` up, red `#ff1744` down, cyan links.
- Panel state in a `TerminalProvider` (React context): `panels: [{id, function, symbol, args}]`, `activePanel`, `layout`. Persist per-user layout to DB when signed in (fallback: sessionStorage for guests).

## 2. Command grammar

```
COMMAND      := [SYMBOL] FUNCTION [ARGS] | SYMBOL | FUNCTION
SYMBOL       := ticker (AAPL, RELIANCE.NS, BTC-USD, EURUSD=X, CL=F, ^NSEI)
FUNCTION     := DES|GP|GIP|TOP|N|WEI|MOST|ECO|EQS|FA|FXC|CTM|W|PORT|ALRT|BQ|HP|RV|SECF|HELP|SET
ARGS         := function-specific (e.g. GP 1Y, ECO US, N crypto)
```

Resolution rules (in order):
1. Exact function code → run in active panel (keeps panel's current symbol if function needs one).
2. `SYMBOL FUNCTION` → set panel symbol + run function.
3. Bare known symbol → run `DES symbol`.
4. Unknown → SECF search results dropdown with fuzzy matches.

Command bar UX: history (up/down arrows), autosuggest while typing (functions first, then symbols with live mini-quotes), amber text on black, blinking block cursor.

## 3. Keyboard shortcuts (full map)

| Key | Action |
|---|---|
| `Ctrl+K` or `` ` `` | Focus command line |
| `Enter` | Execute (GO) |
| `Esc` | Clear input / close overlay / deselect |
| `Alt+1..4` | Focus panel N |
| `Ctrl+←/→` | Cycle active panel |
| `Alt+L` | Cycle layout preset |
| `Alt+W` | Close active panel's function (panel shows launcher) |
| `Alt+M` | Maximize/restore active panel |
| `?` (empty command line) | HELP overlay |
| `/` (news site) | Focus site search |
| `g` then `t` | Go to TOP in active panel (quick-nav) |
| `.` | Repeat last command |

Implement via a single `useTerminalHotkeys` hook; guard against firing inside inputs; respect `isComposing` for IME.

## 4. Panel behaviors

- Title bar: function code (amber), symbol + name, data age ("• 4s"), refresh, maximize, close.
- Every function body handles 4 states: loading (skeleton), live (data), stale (amber border + "data delayed" tag when cache older than threshold), unavailable (clean message + retry — never fake numbers).
- Deep-linking: `/terminal?fn=GP&s=AAPL&range=1Y` opens with that state; every panel change updates the URL (replaceState).

## 5. HELP overlay

- Full-screen overlay: searchable function directory (code, name, description, example), keyboard map, "getting started" 5-step tour. Data from `function-registry.ts` so it never goes out of sync.

## 6. Acceptance checklist

- [ ] Full session possible without mouse.
- [ ] `AAPL GP 1Y` works; `RELIANCE.NS` works; `WEI` works with no symbol.
- [ ] URL reflects state; refresh restores panels.
- [ ] Guest mode: read-only functions work; W/PORT/ALRT prompt sign-in.
- [ ] Unknown input never errors — always lands in SECF suggestions.
