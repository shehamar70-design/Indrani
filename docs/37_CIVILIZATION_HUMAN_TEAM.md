# 37 — CIVILIZATION: HUMAN TEAM

## Purpose
This file defines the human organization that owns Project Indrani, makes final decisions, reviews major changes, and keeps the project aligned with business, legal, risk, product, and engineering goals.

## Scope
This file covers:
- human roles
- department ownership
- decision authority
- escalation flow
- approval flow
- handover expectations
- how humans work with AI heads and builder agents
- how the project stays understandable when people change

## Core Principle
Humans define the mission, values, legal boundaries, and strategic direction.
AI heads and builder agents execute within that human-governed structure.

## Human Team Structure

### Founder
The founder owns the long-term vision, non-negotiable product direction, and final backstop decisions.

Responsibilities:
- set long-term mission
- approve or reject major strategy changes
- protect the original product intent
- resolve conflicts that cannot be solved lower in the chain
- maintain continuity across major phases

### CEO
The CEO runs the project day-to-day and translates founder vision into execution.

Responsibilities:
- coordinate departments
- manage delivery timelines
- make operational tradeoffs
- keep execution disciplined
- ensure teams remain aligned

### Legal / Compliance
This role protects the project from legal, licensing, and regulatory issues.

Responsibilities:
- approve data usage
- review licensing and content rights
- block risky launches
- define compliance boundaries
- ensure privacy and policy requirements are met

### Risk
This role owns risk review and incident escalation.

Responsibilities:
- track major risks
- evaluate project-level exposure
- define mitigation plans
- escalate unresolved risks
- keep the project from making unsafe decisions

### Engineering Leadership
This role owns technical execution quality.

Responsibilities:
- review architecture
- approve engineering direction
- manage implementation standards
- resolve complex technical conflicts
- define engineering priorities

### Product Leadership
This role owns user-facing product direction.

Responsibilities:
- set product priorities
- define the user experience
- balance scope and value
- ensure the product matches user needs
- protect the product vision

### Data & AI Leadership
This role owns data quality, AI behavior, model routing, and verification discipline.

Responsibilities:
- approve data flow design
- oversee AI behavior
- ensure source quality
- define data reliability standards
- keep AI answers grounded

### Editorial Leadership
This role owns content quality, newsroom discipline, and publishing standards.

Responsibilities:
- review news content
- verify editorial quality
- manage publishing rules
- prevent low-quality or unsourced content
- protect the tone and credibility of the platform

### Finance & Operations
This role owns budgets, vendor spend, and operational planning.

Responsibilities:
- monitor costs
- manage budget approvals
- keep build spend under control
- define operational guardrails
- ensure sustainable execution

### People & Culture
This role owns role definitions, onboarding, retention, and organizational clarity.

Responsibilities:
- document team structure
- define role responsibilities
- preserve organizational clarity
- support onboarding
- maintain continuity when people change

### Research
This role owns exploratory work and deep investigation.

Responsibilities:
- research new ideas
- evaluate alternatives
- document findings
- identify missing opportunities
- support planning without rushing implementation

### Communications / Marketing
This role owns messaging, naming, external tone, and positioning.

Responsibilities:
- protect public-facing language
- keep branding consistent
- review user-visible messaging
- ensure the product is described clearly and credibly

## Ownership Rules
- Every major department must have exactly one clear human owner.
- Human owners make the final approval for their domain.
- Human owners can delegate execution, but not responsibility.
- If ownership is unclear, the task is not ready.

## Escalation Flow
If a decision cannot be resolved locally:
1. Builder agent raises the issue.
2. AI head reviews the issue.
3. Human department owner reviews the issue.
4. CEO resolves if still unresolved.
5. Founder is the final escalation point for mission-level conflicts.

## Approval Flow
Before major changes:
- review the current state
- check dependencies
- check risks
- check impact on News / Terminal / AI / Design / Data
- get sign-off from the relevant human owner
- update documentation after approval

## Handover Expectations
When a task is handed from one person to another:
- state what was done
- state what changed
- state what remains
- state blockers
- state dependencies
- state next step
- leave links to the relevant files

## What Humans Must Always Preserve
- product intent
- legal safety
- technical honesty
- data reliability
- documentation clarity
- continuity between phases

## What Humans Must Never Lose
- who owns what
- why decisions were made
- what is approved
- what is pending
- what is risky
- what should be done next

## Practical Checklist
Before any major release, humans should confirm:
- the correct owner signed off
- the risk is acceptable
- the data source is valid
- the feature matches product vision
- the documentation is updated
- the next handover is clear

## Related Files
- 38_CIVILIZATION_AI_HEADS.md
- 39_TEAM_HANDOVER_AND_CONTINUITY.md
- 40_PROJECT_GOVERNANCE_AND_SOP.md
- 10_ARCHITECTURE_BUILD_ORDER.md