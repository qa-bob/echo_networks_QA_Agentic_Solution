# SKILLS.md — Claude Code Skills Reference

Skills are slash commands that Claude Code can invoke in this project.
Each skill is a Markdown file in `.claude/commands/` with step-by-step instructions
Claude follows to complete the task.

Invoke any skill by typing its name in the Claude Code prompt:

```
/generate-full-suite
/analyze-site
/run-smoke
/update-baseline
/generate-report
```

---

## Skill Reference

### `/generate-full-suite`

**File:** `.claude/commands/generate-full-suite.md`

Analyzes the live site defined in `site.config.json` and generates a complete test suite:

1. Invokes the `site-analyzer` sub-agent to crawl the live site
2. Updates `site.config.json` with all discovered nav items and feature flags
3. Creates/updates Page Object Model classes in `src/pages/` — one per discovered page
4. Generates test files for all six suites (`@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`)
5. Runs `npx tsc --noEmit` and `npm run test:smoke` to verify the output

**When to use:** Onboarding to a new site, or after a major redesign that invalidates existing selectors.

---

### `/analyze-site`

**File:** `.claude/commands/analyze-site.md`

Crawls the URL in `site.config.json` and produces:

- A fully populated `site.config.json` with all fields completed
- A report of discovered pages, nav items, forms, and interactive elements
- An issues checklist (missing meta tags, no HTTPS, broken links, missing `<h1>`, etc.)

**When to use:** Before generating tests for the first time, or to verify the config is still accurate after a site update. Accepts an optional URL argument: `/analyze-site https://example.com`.

---

### `/run-smoke`

**File:** `.claude/commands/run-smoke.md`

Runs `npm run test:smoke` and displays a formatted pass/fail summary table. For any failure, it shows the error message and a suggested fix.

**When to use:** Quick health check after a site change, before opening a PR, or when debugging CI failures.

---

### `/update-baseline`

**File:** `.claude/commands/update-baseline.md`

Runs `npm run baseline` (`playwright test --grep @visual --update-snapshots`) and lists all updated baseline files for review. Reminds you to inspect screenshots before committing.

**When to use:** After an intentional design change, viewport config update, or when onboarding a new site for the first time (initial baseline capture).

---

### `/generate-report`

**File:** `.claude/commands/generate-report.md`

Parses `test-results/results.json` and displays a structured summary:

- Per-suite pass rates
- All failed tests with error messages
- Flaky test identification
- Suggested next steps (fix broken links, re-run flaky tests, update baselines)

**When to use:** After a full `npm test` run to understand results before opening a PR or filing issues.

---

## Sub-agents

Sub-agents are specialized AI assistants that Claude Code delegates tasks to.
They run in their own context window with a focused system prompt.

| Agent | File | Purpose |
|-------|------|---------|
| `site-analyzer` | `.claude/agents/site-analyzer.md` | Crawl the live site → produce `site.config.json` |
| `test-generator` | `.claude/agents/test-generator.md` | Generate site-specific Playwright tests from config |

The `site-analyzer` agent is invoked automatically by `/generate-full-suite` and `/analyze-site`.
The `test-generator` agent is invoked by `/generate-full-suite` to write the actual test files.

---

## How to Add a New Skill

1. Create `.claude/commands/<skill-name>.md`
2. Add YAML frontmatter at the top:

   ```yaml
   ---
   description: One-line description (Claude uses this for auto-invocation)
   invocation: user
   ---
   ```

   `invocation: user` means the skill only runs when you invoke it explicitly.
   `invocation: auto` means Claude may invoke it automatically when relevant.
   `invocation: both` allows both.

3. Write the skill body:
   - What the skill does (numbered steps)
   - Expected output format
   - Edge cases and how to handle them

4. Add the skill to the table in `CLAUDE.md` under **Slash Commands**
5. Document it in this file under the Skill Reference section

---

## How to Add a New Sub-agent

1. Create `.claude/agents/<agent-name>.md`
2. Add YAML frontmatter:

   ```yaml
   ---
   name: agent-name
   description: What this agent does (Claude uses this to decide when to delegate)
   ---
   ```

3. Write the agent body:
   - Role and capabilities
   - Inputs (required and optional)
   - Step-by-step instructions
   - Output format
   - Edge cases

4. Document it in this file under the Sub-agents table

---

## Rules Directory

Path-scoped rules in `.claude/rules/` load automatically when Claude works with matching files.
They enforce conventions without requiring them in every prompt.

| File | Applies to | What it enforces |
|------|-----------|-----------------|
| `.claude/rules/testing.md` | `tests/**/*.spec.ts` | Import from fixture, tagging, no hardcoded URLs, no form submit |
| `.claude/rules/page-objects.md` | `src/pages/**/*.ts` | Extend BasePage, readonly Locator, no assertions, typed properties |
