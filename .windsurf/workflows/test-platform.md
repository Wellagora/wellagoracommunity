---
description: Run full platform technical test suite (TS check, build, unit tests, console errors)
---

## Platform Technical Test

// turbo
1. Run TypeScript check: `npx tsc --noEmit` in the project root

// turbo
2. Run production build: `npm run build` in the project root

// turbo
3. Run unit tests: `npx vitest run` in the project root

4. Start dev server if not running: `npm run dev` (non-blocking)

5. Report results summary:
   - TS errors: count
   - Build: pass/fail
   - Test results: passed/failed/total
   - Bundle size from build output
