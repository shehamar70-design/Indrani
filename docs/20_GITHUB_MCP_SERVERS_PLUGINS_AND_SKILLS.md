# 20 — GitHub, MCP Servers, Plugins & Skills for Claude Code

> Exact setup so Claude Code has the best tooling before writing a single line of app code.

---

## 1. Claude Code slash commands you will use constantly

| Command | What it does |
|---|---|
| `/init` | Creates CLAUDE.md from the repo (run ONCE at start) |
| `/model` | Switch model (keep Opus for architecture, Sonnet for bulk coding) |
| `/plan` | Enter plan mode — Claude proposes before editing |
| `/compact` | Compress context when conversation gets long |
| `/clear` | Fresh context (use between phases; CLAUDE.md persists) |
| `/agents` | Manage subagents |
| `/mcp` | Manage MCP servers |
| `/permissions` | Control what Claude can do without asking |
| `/resume` | Resume a previous session |

## 2. MCP servers to install (in order of usefulness)

Run these in the Codespaces terminal (NOT inside the Claude prompt):

```bash
# 1. Context7 — up-to-date library docs (Next.js, Drizzle, Better Auth, Recharts)
claude mcp add context7 -- npx -y @upstash/context7-mcp

# 2. Playwright — Claude can open a browser, click, screenshot, verify UI
claude mcp add playwright -- npx -y @playwright/mcp@latest

# 3. GitHub — issues, PRs, repo management (needs GITHUB_TOKEN or gh auth)
claude mcp add github -- npx -y @modelcontextprotocol/server-github

# 4. Memory — persistent knowledge graph across sessions (optional but useful)
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
```

Verify with `/mcp` inside Claude Code.

## 3. Plugins / marketplaces (optional, check current state on GitHub first)

Claude Code has a plugin system (`/plugin`). Useful community marketplaces to evaluate:
- `anthropics/claude-code` — official repo; check `plugins` docs and release notes
- Community skill collections on GitHub (search "claude code skills" / "claude plugins marketplace"); vet before installing — only add what you actually need

Rule: install at most 2–3 plugins. Every plugin adds context overhead.

## 4. Custom skills to create in your repo

Create these under `.claude/skills/` (each is a folder with `SKILL.md`):

```
.claude/skills/
├── data-provider/SKILL.md   # patterns for adding new market data providers to safeFetch chain
├── terminal-function/SKILL.md # how to add a new terminal command (registry, panel, shortcuts)
└── news-section/SKILL.md    # how to add a new news vertical (route, RSS feed, section page)
```

Each SKILL.md: frontmatter with `name` + `description`, then step-by-step instructions with file paths and code patterns from this project.

## 5. Custom slash commands

Create `.claude/commands/`:

```
.claude/commands/
├── audit.md      # runs the bug audit checklist from doc 19
├── new-func.md   # scaffold a new terminal function ($ARGUMENTS = function code)
└── verify.md     # tsc + lint + smoke test the current change
```

Example `.claude/commands/verify.md`:
```md
Run `pnpm exec tsc --noEmit`, then lint, then start dev server and confirm
the page(s) affected by the last change render without console errors.
Report pass/fail for each step.
```

## 6. Subagents (`/agents` → create)

| Agent | Role | Tools |
|---|---|---|
| `researcher` | Reads docs/, searches web, never edits code | Read, Grep, WebSearch |
| `builder` | Implements features from specs | all edit tools |
| `reviewer` | Reviews diffs against docs 18 & 19 checklists | Read, Grep, Bash(readonly) |

## 7. GitHub workflow

1. `gh auth login` once (Codespaces usually pre-authenticated)
2. Branch per phase: `phase-1-foundation`, `phase-2-news`, ...
3. Commit after every working feature: `git add -A && git commit -m "feat: ticker tape strip"`
4. Push at end of each session: `git push -u origin <branch>`
5. Merge to main only after the phase passes the doc-19 audit

## 8. CLAUDE.md rules (project root)

Keep CLAUDE.md under ~150 lines. It must contain: tech stack, folder map, the REAL-DATA rule, fallback-chain rule, security rules (doc 18 summary), and "read docs/NN before implementing area NN". Details live in docs/, not CLAUDE.md.
