# AGENTS.md — AI Agent Instructions

This file provides instructions for any AI coding agent working in this repository.
It is cross-tool compatible and imported by `CLAUDE.md` so Claude Code receives these
instructions automatically alongside any Claude-specific additions.

---

## Repository Purpose

This is a **Playwright + TypeScript regression test suite** for the website defined in
`site.config.json`. The current target is a B2B company website at `https://www.echonets.com/`.

Tests cover every discoverable public feature **without** account creation, login, or
form submission.

---

## Architecture: Page Object Model (POM) + OOP

Every page or section of the site has its own class in `src/pages/`. All classes
extend `BasePage` from `src/pages/base.page.ts`.

```
BasePage               ← always extend this
  └── HomePage         src/pages/home.page.ts
  └── NavigationPage   src/pages/navigation.page.ts
  └── ContactFormPage  src/pages/contact.page.ts
  └── <NewPage>        src/pages/<kebab-name>.page.ts  (one file per new page)
```

### Page Object Rules

- Properties must be **`readonly Locator`** — typed, stable, declared on the class
- Methods represent **user actions only**: `clickCTA()`, `openMobileMenu()`, `fillField()`
- **No `expect()` or assertions inside page objects** — all assertions go in test files
- Constructor signature: `constructor(page: Page, config: SiteConfig)`
- Call `super(page, config)` as the first line of every constructor
- Access `baseURL` via `this.url` (inherited from `BasePage`) — never hardcode

### Example Page Object

```typescript
// src/pages/services.page.ts
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { SiteConfig } from '@types/site-config.types';

export class ServicesPage extends BasePage {
  readonly heading: Locator;
  readonly serviceCards: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.heading = page.locator('h1').first();
    this.serviceCards = page.locator('[class*="service"], [class*="card"]');
  }

  async navigateToServices(): Promise<void> {
    await this.page.goto(`${this.url}/services`, { waitUntil: 'domcontentloaded' });
  }
}
```

---

## Test File Conventions

- **Import** via the custom fixture: `import { test, expect } from '@fixtures/site.fixture'`
- **Tag** every `test()` with at least one of: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`
- **File naming**: `tests/<suite>/<kebab-description>.spec.ts`
- One `describe` block per page or feature area
- No `page.waitForTimeout()` — use Playwright auto-waiting or `waitForSelector`

### Example Test

```typescript
// tests/functional/services.spec.ts
import { test, expect } from '@fixtures/site.fixture';

test.describe('Services page @functional', () => {
  test.beforeEach(async ({ servicesPage }) => {
    await servicesPage.navigateToServices();
  });

  test('services page loads and shows service cards @functional', async ({ servicesPage }) => {
    await expect(servicesPage.heading).toBeVisible();
    expect(await servicesPage.serviceCards.count()).toBeGreaterThan(0);
  });
});
```

---

## TypeScript Rules

- Strict mode is enabled — **no implicit `any`**
- All properties and parameters must be explicitly typed
- Verify with `npx tsc --noEmit` before finalizing any change

---

## Key Files — Read These Before Editing

| File | Read before… |
|------|-------------|
| `site.config.json` | Writing any test or selector — it defines the target URL and flags |
| `src/pages/base.page.ts` | Creating a new page object class |
| `src/fixtures/site.fixture.ts` | Writing a new test file |
| `playwright.config.ts` | Changing timeouts, reporters, or browser projects |
| `src/types/site-config.types.ts` | Using `SiteConfig` in page objects or tests |

---

## Before Writing Tests or Selectors

1. Read `site.config.json` to get the URL and all feature flags
2. Fetch or navigate to the live site to inspect real DOM structure
3. Write selectors based on actual HTML attributes — no generic placeholders
4. Prefer `role`, `label`, `aria-*`, and `data-testid` selectors over class names

---

## Absolute Constraints

These rules must never be violated:

- **Never submit any form** — test field interaction and validation only
- **Never create accounts, log in, or enter real credentials** (unless `auth.required: true` in config)
- **Never hardcode the base URL** in test files — use `baseURL` from config or `siteConfig.url`
- **Never put `expect()`** inside page object classes
- **Never use `page.waitForTimeout()`** for arbitrary delays
- **Never use `any` type** without an explicit JSDoc justification comment
- **Never leave `test.only`** in committed code without a comment explaining why

---

## Available Scripts

```bash
npm test                  # Run all tests
npm run test:smoke        # @smoke only
npm run test:navigation   # @navigation only
npm run test:forms        # @forms only
npm run test:visual       # @visual only
npm run test:responsive   # @responsive only
npm run baseline          # Update visual snapshots
npm run typecheck         # npx tsc --noEmit
npm run lint              # ESLint
```

---

## Claude Code Skills (Slash Commands)

| Command | What it does |
|---------|-------------|
| `/generate-full-suite` | Analyze site + generate all POM classes + test files |
| `/analyze-site` | Crawl site, report structure, produce `site.config.json` |
| `/run-smoke` | Run smoke tests, display formatted pass/fail summary |
| `/update-baseline` | Capture new visual regression baselines |
| `/generate-report` | Parse test results, display structured summary |
