## Summary

<!-- One paragraph: what changed and why -->

## Changes

- [ ] New page object(s) in `src/pages/`
- [ ] New test file(s) in `tests/<suite>/`
- [ ] Updated existing tests or page objects
- [ ] Updated `site.config.json`
- [ ] Updated visual baselines (`__snapshots__/`)
- [ ] Config / tooling / docs only (no test logic changes)

## Pre-merge checklist

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run test:smoke` passes locally
- [ ] All new tests tagged with at least one suite tag (`@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`)
- [ ] No hardcoded base URLs in test files
- [ ] No form submissions in tests
- [ ] No `page.waitForTimeout()` calls
- [ ] No committed `test.only`
- [ ] Visual baselines reviewed and committed (if `@visual` tests changed)

## Test evidence

<!-- Paste a snippet of the test run output, or describe what you manually verified -->

```
Paste npm run test:smoke output here
```

## Related issues

Closes #
