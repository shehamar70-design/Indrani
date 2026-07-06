---
description: Run the docs/19 bug audit checklist against the current build
---

Run the bug audit from `docs/19_TESTING_QA_AND_BUG_AUDIT.md`:

1. Read `docs/19_TESTING_QA_AND_BUG_AUDIT.md` in full.
2. Execute its checklist against the current build ($ARGUMENTS may scope the audit to a specific area or phase; default is the whole current phase).
3. Also grep for docs/18 §1 security violations: hardcoded keys, unvalidated route inputs, user-data queries missing `userId` scoping, unsanitized `dangerouslySetInnerHTML`.
4. Verify the REAL-DATA rule: no fabricated numbers, every market-data component handles loading/live/stale/unavailable.
5. Report findings as a pass/fail table with file:line references, most severe first. Do not fix anything unless asked.
