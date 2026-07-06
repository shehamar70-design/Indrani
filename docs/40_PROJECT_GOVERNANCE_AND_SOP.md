# 40 — PROJECT GOVERNANCE AND SOP

## Purpose
This file defines how Project Indrani is governed, how work is approved, how files are maintained, and how long-term discipline is preserved.

## Scope
This file covers:
- governance model
- standards of work
- approval rules
- naming rules
- documentation rules
- file creation rules
- update rules
- quality rules
- change control
- release discipline
- maintenance discipline
- issue triage
- escalation rules
- long-term operating procedure

## Core Principle
Good governance prevents confusion, duplication, and accidental degradation of the project.

## Governance Model
- Human owners set direction.
- AI heads manage domain-level quality.
- Builder agents execute tasks.
- QA verifies.
- Documentation preserves the result.
- Governance decides what is allowed to change.

## Standard Operating Procedures (SOPs)

### 1. Before Starting Work
- read the relevant files
- check current ownership
- confirm the goal
- identify dependencies
- identify risk
- identify what counts as success

### 2. Before Changing Files
- confirm the file belongs to your scope
- check for overlap with other departments
- ensure the change is consistent with the current documentation
- note any risk to handover or continuity

### 3. While Working
- make small, safe changes
- avoid unnecessary refactors
- preserve good existing work
- add missing information instead of replacing everything
- keep related docs updated

### 4. Before Closing Work
- verify the result
- make sure nothing broke
- update related files
- write the handover note
- list next steps and limitations

## Naming Rules
- Use numbered files for order.
- Use clear, department-specific names.
- Keep names short but descriptive.
- If a file grows too large, split it.
- If two files overlap heavily, merge them carefully.

## Documentation Rules
Every important file should answer:
- what is this?
- why does it exist?
- who owns it?
- what depends on it?
- what comes next?

Every new file should include:
- purpose
- scope
- dependencies
- content
- related files
- usage guidance

## Change Management
When changing the system:
- explain why the change is needed
- check impact on related files
- update the roadmap if necessary
- preserve the best of the old work
- do not silently remove important context

## Review and Approval Rules
- high-risk changes need explicit approval
- ownership changes need documentation
- new departments need a file
- major file merges need a reason
- unclear work should stop and be clarified

## Quality Rules
A document or file is complete only if it is:
- accurate
- organized
- readable
- specific
- useful later
- easy to hand over
- consistent with the rest of the system

## Maintenance Rules
- review docs when the product changes
- update continuity notes after major work
- keep the roadmap current
- remove duplication
- keep the file system usable over time

## Incident / Escalation Rules
If a serious issue appears:
1. pause the current change
2. document the issue
3. identify the owner
4. identify the impact
5. resolve or escalate
6. update the docs after the fix

## Long-Term Operating Procedure
The project should always be runnable, maintainable, and understandable by a new person reading the docs first.

That means:
- no hidden ownership
- no undocumented exceptions
- no orphaned files
- no silent changes
- no missing handover notes

## Related Files
- 37_CIVILIZATION_HUMAN_TEAM.md
- 38_CIVILIZATION_AI_HEADS.md
- 39_TEAM_HANDOVER_AND_CONTINUITY.md
- 10_ARCHITECTURE_BUILD_ORDER.md