# Contributing to Echo Networks QA

This guide covers how to write, update, and review tests in this Playwright + TypeScript framework.
Read this before opening any PR that touches `src/pages/`, `tests/`, or `site.config.json`.

---

## Development Setup

```bash
# Clone and install
git clone <repo-url>
cd echo_networks_QA_Agentic_Solution
npm install

# Install Playwright browsers (required once per machine)
npx playwright install

# Confirm TypeScript compiles
npx tsc --noEmit

# Run smoke tests to confirm the site is reachable
npm run test:smoke
```

### Recommended VS Code extensions

- Playwright Test for VS Code (`ms-playwright.playwright`)
- ESLint (`dbaeumer.vscode-eslint`)

---

## How to Write a Test

### Step 1 — Read `site.config.json`

Always start here. The `url` field is your base URL. Feature flags (`hasContactForm`, `skipVisual`, etc.) determine which test suites apply.

### Step 2 — Inspect the live site

Open `https://www.echonets.com/` in a browser (or use `WebFetch` in Claude Code) to inspect the real DOM before writing selectors. Never write selectors against guessed or placeholder HTML.

### Step 3 — Create or update a page object

Every page or section needs a class in `src/pages/`. Check whether one already exists before creating a new file.

```typescript
// src/pages/pricing.page.ts
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { SiteConfig } from '@types/site-config.types';

export class PricingPage extends BasePage {
  readonly heading: Locator;
  readonly planCards: Locator;
  readonly ctaButtons: Locator;

  constructor(page: Page, config: SiteConfig) {
    super(page, config);
    this.heading = page.locator('h1').first();
    this.planCards = page.locator('[class*="plan"], [class*="pricing-card"]');
    this.ctaButtons = this.planCards.locator('a, button').filter({
      hasText: /get started|choose|try free/i,
    });
  }

  async navigateToPricing(): Promise<void> {
    await this.page.goto(`${this.url}/pricing`, { waitUntil: 'domcontentloaded' });
  }
}
```

**Page object rules:**

| Rule | Example |
|------|---------|
| Extend `BasePage` | `extends BasePage` |
| All locators are `readonly Locator` | `readonly planCards: Locator;` |
| Methods are user actions (verbs) | `clickCTA()`, `openMenu()`, `fillNameField()` |
| **No `expect()` inside page objects** | Put assertions in the test file |
| Navigate via `this.url`, not a hardcoded string | `${this.url}/pricing` |

### Step 4 — Register the page object in the fixture

Add the new page object to `src/fixtures/site.fixture.ts` so tests can use it:

```typescript
// In site.fixture.ts — add your page to the fixture type and setup
pricingPage: new PricingPage(page, siteConfig),
```

### Step 5 — Write the test file

```typescript
// tests/functional/pricing-page.spec.ts
import { test, expect } from '@fixtures/site.fixture';

test.describe('Pricing page @functional', () => {
  test.beforeEach(async ({ pricingPage }) => {
    await pricingPage.navigateToPricing();
  });

  test('pricing page loads and shows plan tiers @functional', async ({ pricingPage }) => {
    await expect(pricingPage.heading).toBeVisible();
    expect(await pricingPage.planCards.count()).toBeGreaterThan(0);
  });

  test('each plan has a visible CTA @functional', async ({ pricingPage }) => {
    await expect(pricingPage.ctaButtons.first()).toBeVisible();
  });
});
```

### Step 6 — Verify TypeScript and run the test

```bash
npx tsc --noEmit        # Must pass with zero errors
npm run test:smoke      # Must pass before opening a PR
```

---

## Test Suite Tags

Tag every test with at least one suite tag. A test may carry multiple tags.

| Tag | Directory | What to test |
|-----|-----------|-------------|
| `@smoke` | `tests/smoke/` | Site loads, HTTPS, page title present, no blocking JS errors |
| `@navigation` | `tests/navigation/` | Nav links work, routing is correct, no 404s |
| `@forms` | `tests/forms/` | Fields accept input, labels are present, validation fires — **never submit** |
| `@functional` | `tests/functional/` | CTAs, accordions, modals, pricing tiers, video, search |
| `@visual` | `tests/visual/` | Screenshot regression with `toHaveScreenshot()` |
| `@responsive` | `tests/responsive/` | Layout at 390 px, 768 px, 1280 px — no horizontal overflow |

---

## Rules — Do Not Violate These

- **Never submit a form.** No `.submit()`, no clicking submit buttons, no pressing Enter on a `<form>`.
- **Never create an account or enter credentials** (unless `auth.required: true` in config).
- **Never hardcode the base URL.** Use `baseURL` from Playwright config or `this.url` / `siteConfig.url`.
- **Never put `expect()` inside a page object method.**
- **Never use `page.waitForTimeout()`.** Use Playwright auto-waiting or `waitForSelector`.
- **Never use `any` type** without a JSDoc comment justifying it.
- **Never commit `test.only` or `test.skip`** without a comment explaining why.

---

## Selector Best Practices

Prefer selectors in this order:

1. `getByRole()` / `getByLabel()` — most stable, accessibility-first
2. `getByText()` — stable when text is unlikely to change
3. `data-testid` attributes — excellent when available
4. Semantic HTML (`h1`, `nav`, `main`, `footer`)
5. `[class*="partial-name"]` — acceptable for consistent BEM-like class patterns
6. `.class-name` or `#id` — only when no better option exists

Avoid fragile selectors: `nth-child`, long chains like `div > div > span`, or selectors that depend on element order.

---

## Visual Regression Tests

When adding or modifying `@visual` tests:

1. Run `npm run baseline` to capture the initial baseline
2. Review every screenshot in `__snapshots__/` before committing
3. Commit the baseline files — they are the reference for future runs

When a visual test fails after an intentional design change:

```bash
npm run baseline    # Capture new baselines
git add __snapshots__/
git commit -m "chore: update visual baselines after homepage redesign"
```

---

## Pull Request Checklist

Before opening a PR:

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run test:smoke` passes (site reachable and healthy)
- [ ] All new tests are tagged with at least one suite tag
- [ ] New page objects extend `BasePage` and use `readonly Locator` properties
- [ ] No hardcoded base URLs in test files
- [ ] No form submissions
- [ ] No `page.waitForTimeout()` calls
- [ ] No `test.only` or uncommitted `test.skip` without a comment
- [ ] Visual baselines reviewed and committed if `@visual` tests changed
- [ ] PR description filled out using the template

---

## CI Pipeline

GitHub Actions (`.github/workflows/playwright.yml`) runs on every PR:

- **PR check:** Smoke tests only (`@smoke` on `chromium-desktop`) — fast feedback
- **Push to `main`:** Full suite (all six tags, all three browser projects)

Smoke tests must pass before merging. The full suite results are uploaded as build artifacts.
