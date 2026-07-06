---
description: Typecheck + lint + smoke-test the current change
---

Verify the current change:

1. Run `pnpm exec tsc --noEmit` — report any type errors.
2. Run `pnpm lint` — report any lint errors.
3. Start the dev server (`pnpm dev`) if not already running, and confirm the page(s) affected by the last change render without console errors (use browser tools or curl the route and check the HTTP status + rendered HTML).
4. Report pass/fail for each step. If any step fails, fix it before declaring the change done.
