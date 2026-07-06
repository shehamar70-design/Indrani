# 39 — TEAM HANDOVER AND CONTINUITY

## Purpose
This file explains how work moves safely between people, AI agents, and departments without losing context, quality, or ownership.

## Scope
This file covers:
- task handover
- department handover
- agent handover
- documentation handover
- continuity planning
- onboarding and offboarding
- keeping the project alive after changes
- preserving decisions and dependencies

## Core Principle
A handover is not complete until the next owner can continue without guessing.

## Handover Types

### Task Handover
Used when one person or agent finishes a ticket and another continues the work.

Must include:
- what was done
- what changed
- what remains
- why it was done
- what is blocked
- what files were touched
- what should happen next

### Department Handover
Used when responsibility moves between departments.

Must include:
- current state of the department
- known risks
- ownership
- dependencies
- outstanding decisions
- next milestones

### Agent Handover
Used when a builder agent hands work to another builder agent or AI head.

Must include:
- execution state
- files modified
- tests run
- failures found
- unresolved issues
- links to relevant docs

### Human Handover
Used when human ownership changes or someone joins/leaves.

Must include:
- domain responsibility
- decision authority
- current priorities
- pending approvals
- known constraints
- historical context

## Continuity Rules
- Every completed task must leave a trail.
- Every major decision must be documented.
- Every important dependency must be visible.
- Every unresolved issue must be explicitly listed.
- No one should need memory to continue the project.
- The documentation should always show the next step.

## What Must Be Preserved During Handover
- original intent
- domain ownership
- current status
- dependencies
- test results
- known bugs
- limitations
- future tasks
- decision history

## Handover Checklist
Before handing off:
- the latest files are updated
- the current state is written down
- the next step is clear
- blockers are listed
- ownership is visible
- relevant links are attached
- no hidden assumption remains

After receiving handover:
- read the docs first
- inspect the current state
- verify the dependencies
- confirm the next step
- ask only if something is genuinely unclear

## Continuity Checklist
For long-term continuity:
- keep files organized
- keep ownership clear
- keep research fresh
- keep decisions logged
- keep the system easy to resume
- keep updates incremental and safe

## Safe Transfer Pattern
1. Read the relevant documentation.
2. Review the current implementation or file state.
3. Confirm what is finished and what is not.
4. Validate the dependencies.
5. Take ownership of the next step.
6. Update the docs after the change.

## What Not To Do
- do not pass work with hidden assumptions
- do not leave incomplete notes
- do not rely on chat memory alone
- do not mix unrelated departments in one handover
- do not skip testing before transfer

## Practical Continuity Template
Every handover note should include:
- summary
- files changed
- current state
- risks
- blockers
- next step
- owner
- deadline or priority

## Related Files
- 37_CIVILIZATION_HUMAN_TEAM.md
- 38_CIVILIZATION_AI_HEADS.md
- 40_PROJECT_GOVERNANCE_AND_SOP.md
- 10_ARCHITECTURE_BUILD_ORDER.md