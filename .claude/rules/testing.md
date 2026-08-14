---
paths:
  - "tests/**/*.spec.ts"
---

# Test File Rules

These rules apply to all files in `tests/**/*.spec.ts`.

## Imports

- Always import `test` and `expect` from `@fixtures/site.fixture`, not from `@playwright/test` directly

## Tagging

- Every `test()` call must have at least one tag: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, or `@responsive`
- Tags go on the `test.describe` block or the individual `test()` call — both are fine

## URLs and navigation

- Never call `page.goto()` with a hardcoded URL string
- Use `siteConfig.url` from the fixture, or rely on `baseURL` set by Playwright config

## Waiting

- Never call `page.waitForTimeout()` for arbitrary delays
- Use `waitForSelector`, `waitForLoadState`, or Playwright's auto-waiting instead

## Selectors

- Never call `page.locator()` directly in the test body
- All locators must be defined as `readonly Locator` properties on the relevant page object class
- Call page object methods and use page object properties in tests

## Forms

- Never submit a form: no `.submit()`, no clicking submit/send buttons, no `press('Enter')` on an input inside a `<form>`
- Test field interactions and validation UI only

## Maintenance

- `test.only` must not be committed without an inline comment explaining why
- `test.skip` must not be committed without an inline comment with a ticket reference or explanation
