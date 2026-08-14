---
paths:
  - "src/pages/**/*.ts"
---

# Page Object Rules

These rules apply to all files in `src/pages/**/*.ts`.

## Class structure

- Every page object class must extend `BasePage` from `./base.page`
- Constructor signature must be: `constructor(page: Page, config: SiteConfig)`
- First line of every constructor must be `super(page, config)`

## Locators

- All element references must be declared as `readonly Locator` class properties
- No `page.locator()` or `page.getByRole()` calls inside methods — locators go on the class
- All locator properties must have explicit TypeScript types: `readonly heading: Locator;`

## Methods

- Method names must start with an action verb: `click`, `fill`, `open`, `dismiss`, `select`, `navigate`
- Methods represent user actions, not assertions or state checks
- Method return types must be explicit: `async clickCTA(): Promise<void>`

## Assertions

- No `expect()` calls anywhere in page object files
- No `toBeVisible()`, `toHaveText()`, `toBeEnabled()`, or any other Playwright matchers
- Assertions belong in test files in `tests/`

## URLs

- Never hardcode a URL string in a page object
- Use `this.url` (inherited from `BasePage`) for navigation: `await this.page.goto(\`\${this.url}/path\`)`

## TypeScript

- No implicit `any` — all properties, parameters, and return types must be explicitly typed
- Strict null checks apply — handle `null | undefined` cases explicitly
