# Echo Networks — QA Agentic Solution

Playwright + TypeScript regression test suite for [Echo Networks](https://www.echonets.com/) — a Phoenix-based uptime monitoring company. Tests cover every discoverable feature of the public website without form submission, account creation, or authentication.

---

## Quick Start

```bash
# 1. Install Node.js dependencies
npm install

# 2. Install Playwright browsers (required once)
npx playwright install

# 3. Verify TypeScript compiles
npx tsc --noEmit

# 4. Run smoke tests
npm run test:smoke

# 5. Open the HTML report
npm run report
```

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18.x |
| npm | 9.x |
| Playwright | 1.44.0 (installed via `package.json`) |

---

## Project Purpose

This repository implements a **Page Object Model (POM)** + **Object-Oriented Programming (OOP)** test automation framework targeting `https://www.echonets.com/`. It is structured for agentic execution by Claude Code while remaining fully operable by human engineers.

**Test objectives:**

- Verify every publicly accessible page loads without critical errors
- Confirm all navigation links route correctly and return non-4xx status codes
- Validate form fields, labels, and client-side validation without submitting
- Detect visual regressions across desktop, tablet, and mobile viewports
- Confirm responsive layout at all three standard breakpoints

---

## Test Categories

| Tag | npm Script | What it covers |
|-----|-----------|----------------|
| `@smoke` | `npm run test:smoke` | Site loads, HTTPS, title present, no blocking JS errors |
| `@navigation` | `npm run test:navigation` | Nav links, routing, active states, no 404s |
| `@forms` | `npm run test:forms` | Field interactions, labels, validation — never submit |
| `@functional` | `npm test` | CTAs, accordions, pricing tiers, video players, modals |
| `@visual` | `npm run test:visual` | Screenshot regression with `toHaveScreenshot()` |
| `@responsive` | `npm run test:responsive` | Layout at 390 px, 768 px, 1280 px — no horizontal overflow |

```bash
# Run a specific suite
npm run test:smoke
npm run test:navigation
npm run test:forms
npm run test:visual
npm run test:responsive

# Run with visible browser
npm run test:headed

# Update visual baselines after intentional design changes
npm run baseline

# Check TypeScript
npm run typecheck

# Lint
npm run lint
```

---

## Architecture

All tests follow the **Page Object Model** pattern with **OOP inheritance**.

```
BasePage  ← src/pages/base.page.ts
  ├── HomePage         src/pages/home.page.ts
  ├── NavigationPage   src/pages/navigation.page.ts
  ├── ContactFormPage  src/pages/contact.page.ts
  └── <DiscoveredPage> src/pages/<name>.page.ts   (one per new page)
```

**Key rules:**

| Rule | Why |
|------|-----|
| Every page class extends `BasePage` | Shared navigation, screenshot, and console-error helpers |
| All locators are `readonly Locator` class properties | Stable, typed, discoverable |
| Methods represent user actions only | `clickCTA()`, `openMobileMenu()`, `fillNameField()` |
| No `expect()` inside page objects | Assertions belong in test files, not page objects |
| Tests import via the custom fixture | `import { test, expect } from '@fixtures/site.fixture'` |
| No hardcoded URLs | Always use `baseURL` from Playwright config or `siteConfig.url` |

---

## Project Structure

```
echo_networks_QA_Agentic_Solution/
├── site.config.json              # Target URL + feature flags (hasContactForm, skipVisual…)
├── playwright.config.ts          # Browser projects, timeouts, reporters
├── global-setup.ts               # Pre-run reachability check
├── AGENTS.md                     # Cross-tool AI agent instructions (imported by CLAUDE.md)
├── SKILLS.md                     # Available Claude Code skills reference
├── CLAUDE.md                     # Claude Code project instructions
├── src/
│   ├── pages/                    # Page Object Model classes
│   │   ├── base.page.ts          # BasePage — all pages extend this
│   │   ├── home.page.ts
│   │   ├── navigation.page.ts
│   │   └── contact.page.ts
│   ├── fixtures/
│   │   └── site.fixture.ts       # Custom Playwright fixtures
│   ├── utils/
│   │   ├── link-checker.ts       # HTTP link status helper
│   │   └── visual-helper.ts      # Screenshot utilities
│   └── types/
│       └── site-config.types.ts  # TypeScript interfaces for site.config.json
├── tests/
│   ├── smoke/                    # @smoke tests
│   ├── navigation/               # @navigation tests
│   ├── forms/                    # @forms tests
│   ├── functional/               # @functional tests
│   ├── visual/                   # @visual tests
│   └── responsive/               # @responsive tests
├── .github/
│   ├── CONTRIBUTING.md           # Full contributor guide
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── workflows/
│   │   └── playwright.yml        # GitHub Actions CI pipeline
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── test_request.md
├── .claude/
│   ├── agents/                   # Sub-agent definitions
│   │   ├── site-analyzer.md
│   │   └── test-generator.md
│   ├── commands/                 # Slash command / skill definitions
│   │   ├── generate-full-suite.md
│   │   ├── analyze-site.md
│   │   ├── run-smoke.md
│   │   ├── update-baseline.md
│   │   └── generate-report.md
│   ├── hooks/
│   │   └── pre-test.sh           # Site reachability check before test runs
│   ├── rules/
│   │   ├── testing.md            # Rules applied to tests/**/*.spec.ts
│   │   └── page-objects.md       # Rules applied to src/pages/**/*.ts
│   └── settings.json             # Hook wiring + allowed commands
└── __snapshots__/                # Visual regression baselines (commit these)
```

---

## Claude Code Integration

This repo is optimized for **Claude Code** agentic execution. See `CLAUDE.md` for full instructions Claude follows automatically.

### Available Skills (Slash Commands)

| Command | Description |
|---------|-------------|
| `/generate-full-suite` | Analyze the live site and generate all POM classes + tests |
| `/analyze-site` | Inspect site structure and report pages, forms, and elements |
| `/run-smoke` | Run smoke tests and display a formatted pass/fail report |
| `/update-baseline` | Refresh visual regression baseline screenshots |
| `/generate-report` | Parse test results and display a structured summary |

See `SKILLS.md` for full descriptions and usage notes.

### Sub-agents

| Agent | Purpose |
|-------|---------|
| `site-analyzer` | Crawls the live site, produces a populated `site.config.json` |
| `test-generator` | Generates site-specific Playwright test files from `site.config.json` |

### Hooks

The `.claude/hooks/pre-test.sh` script runs automatically before any `npm test` or `npx playwright` command. It checks whether the target site is reachable and warns (but does not block) if the site is down. Hook wiring is in `.claude/settings.json`.

---

## Configuration

| File | Purpose |
|------|---------|
| `site.config.json` | Target URL, company name, feature flags |
| `playwright.config.ts` | Browser projects, timeouts, reporters, snapshot paths |
| `.claude/settings.json` | Hook wiring, allowed commands |
| `CLAUDE.md` | Claude Code instructions (imports `AGENTS.md`) |

To point the framework at a different site, update `site.config.json`:

```json
{
  "name": "Company Name",
  "url": "https://example.com",
  "hasContactForm": true,
  "expectedNavItems": ["Home", "About", "Services", "Contact"],
  "viewports": ["desktop", "mobile", "tablet"],
  "skipVisual": false,
  "skipForms": false,
  "auth": { "required": false, "loginUrl": "", "username": "", "password": "" }
}
```

---

## CI

Tests run automatically on every PR and push via `.github/workflows/playwright.yml`.

- **PRs:** Smoke tests only (fast feedback, Chromium desktop)
- **Pushes to `main`:** Full suite (all tags, all three browser projects)

Smoke tests must pass before merging.

---

## Contributing

See [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) for the full contributor guide including:

- How to write page objects and tests
- Test tagging requirements
- TypeScript conventions
- PR checklist

---

*Target: [https://www.echonets.com/](https://www.echonets.com/) — Echo Networks, Phoenix AZ*
