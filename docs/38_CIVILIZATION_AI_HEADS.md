# 38 — CIVILIZATION: AI HEADS

## Purpose
This file defines the permanent AI leadership structure for Project Indrani. These AI Heads own specific domains permanently, keep the project moving, and preserve quality across planning, research, review, and execution.

## Scope
This file covers:
- AI head roles
- domain ownership
- how AI heads differ from builder agents
- how AI heads coordinate with humans
- how AI heads preserve context and continuity
- how AI work should be structured in the project
- how AI handoff works between domains

## Core Principle
AI Heads own domains forever.
Builder agents do not own domains.
Builder agents execute tasks.
AI Heads preserve the product memory and quality over time.

## AI Head Categories

### Coordination Head
Owns sequencing, task ordering, cross-domain dependency management, and workflow coordination.

Responsibilities:
- sequence work across departments
- maintain dependency order
- route tasks to the right owner
- prevent collisions and confusion
- keep build momentum clean

### Architecture Head
Owns system-level design before implementation.

Responsibilities:
- review new systems before code or docs are written
- detect contradictions
- prevent architectural debt
- maintain consistency across layers
- ensure the project fits together coherently

### News Frontend Head
Owns all News UI and presentation structure.

Responsibilities:
- homepage layout
- article presentation
- vertical pages
- visual hierarchy
- mobile reading UX
- premium editorial appearance

### Terminal Frontend Head
Owns the Terminal UI and workspace interactions.

Responsibilities:
- panels
- charts
- command flow
- watchlists
- screeners
- alerts
- portfolio presentation
- density and readability balance

### Backend Head
Owns APIs, data flow, service orchestration, and system behavior.

Responsibilities:
- route design
- data fetching
- persistence
- cache flow
- failure handling
- realtime behavior
- backend correctness

### Database / Data Integrity Head
Owns schema structure, data correctness, and storage rules.

Responsibilities:
- schema clarity
- migrations
- integrity
- provenance
- consistency
- long-term maintainability of stored data

### AI / Copilot Head
Owns AI assistant behavior, answer quality, retrieval discipline, and grounded responses.

Responsibilities:
- context grounding
- source verification
- response quality
- safe fallback behavior
- model routing discipline
- citation integrity

### Security Head
Owns threat review, access protection, safe defaults, and security verification.

Responsibilities:
- security policy
- permission boundaries
- review of sensitive changes
- guardrails
- secure workflows
- failure-safe behavior

### DevOps / Deployment Head
Owns build, deploy, rollback, environments, and release safety.

Responsibilities:
- deployment process
- rollback readiness
- environment integrity
- CI/CD discipline
- release observability

### QA Head
Owns testing discipline and validation.

Responsibilities:
- regression checks
- scenario testing
- issue reproduction
- release validation
- independent review
- quality gates

### Documentation / Memory Head
Owns documentation completeness, continuity, and knowledge preservation.

Responsibilities:
- maintain the docs system
- prevent knowledge loss
- keep handover instructions current
- update guides after changes
- preserve decision history

### Performance Head
Owns speed, perceived responsiveness, cache discipline, and load behavior.

Responsibilities:
- performance budgets
- latency awareness
- fallback behavior
- caching strategy
- graceful degradation
- speed consistency

## AI Heads vs Builder Agents
AI Heads:
- own the domain permanently
- preserve context
- review quality
- guide the build
- make domain decisions

Builder Agents:
- build tasks
- do not own the domain
- are temporary
- must hand over cleanly
- must leave documentation behind

## AI Handoff Flow
1. A task is assigned to an AI Head.
2. The AI Head plans or reviews the task.
3. The AI Head assigns build work to a builder agent.
4. The builder agent executes.
5. QA verifies.
6. The AI Head checks if the result matches the domain standard.
7. The file/documentation is updated.
8. Ownership remains with the AI Head.

## Continuity Rules
- AI Heads never disappear from the project memory.
- Each AI Head must have a clearly documented domain.
- Each AI Head must know what files it owns.
- Each AI Head must know when to escalate to a human owner.
- Each AI Head must preserve the reasoning behind decisions.

## What AI Heads Must Never Do
- silently change scope
- skip verification
- overwrite another domain’s responsibility
- assume old data is still valid
- create confusing overlap without documenting it

## Practical Checklist
Before closing a task, an AI Head should confirm:
- the domain is still coherent
- no dependency is broken
- the human owner can understand the change
- documentation is updated
- next steps are clear

## Related Files
- 37_CIVILIZATION_HUMAN_TEAM.md
- 39_TEAM_HANDOVER_AND_CONTINUITY.md
- 40_PROJECT_GOVERNANCE_AND_SOP.md
- 10_ARCHITECTURE_BUILD_ORDER.md