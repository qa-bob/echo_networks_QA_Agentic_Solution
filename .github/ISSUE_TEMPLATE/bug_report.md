---
name: Test Failure Bug Report
about: Report a test that is failing unexpectedly
labels: [bug, test-failure]
---

## Failing test

**Test name:**
**File:** `tests/<suite>/<file>.spec.ts`
**Suite tag:** `@smoke` / `@navigation` / `@forms` / `@functional` / `@visual` / `@responsive`

## Error message

```
Paste the full error message here
```

## Browser project

- [ ] `chromium-desktop`
- [ ] `mobile-chrome`
- [ ] `tablet`

## Steps to reproduce

```bash
# Example:
npm run test:smoke
# or
npx playwright test tests/smoke/site-availability.spec.ts --project=chromium-desktop
```

## Expected behaviour

<!-- What should have happened? -->

## Actual behaviour

<!-- What actually happened? -->

## Site URL at time of failure

`https://www.echonets.com/`

## Additional context

<!-- Trace file, screenshot, video, or anything else from `test-results/` -->
