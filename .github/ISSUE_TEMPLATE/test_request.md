---
name: Test Coverage Request
about: Request tests for a new page, feature, or user flow
labels: [enhancement, test-coverage]
---

## What needs testing?

<!-- Describe the page, feature, or user flow that needs new test coverage -->

## URL or page path

`https://www.echonets.com/`

## Suggested test type(s)

- [ ] `@smoke` — basic load check
- [ ] `@navigation` — link / routing check
- [ ] `@forms` — form field and validation check
- [ ] `@functional` — business feature check
- [ ] `@visual` — screenshot regression
- [ ] `@responsive` — viewport layout check

## Why is this important?

<!-- What could break without this coverage? Is this a high-traffic page, a conversion path, etc.? -->

## Acceptance criteria

- [ ] Test file exists at `tests/<suite>/<name>.spec.ts`
- [ ] Page object class exists at `src/pages/<name>.page.ts`
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run test:smoke` still passes after the new tests are added
- [ ] ...
