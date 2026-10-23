---
name: framework-patterns
description: Check proposed code against this repository’s Playwright POM, fixtures, naming, layout, configuration, locators, assertions, logging, and reporting conventions. Run before any pull request.
---

# Gate: framework-patterns

**Question:** “Is this still part of this framework?”

## Purpose

Ensure every change fits the repository’s established TypeScript + Playwright Test architecture rather than introducing a parallel test framework or personal style.

## When to run

Run against the complete proposed diff before every PR, including documentation/configuration-only changes. Rerun after addressing findings.

## Checklist

1. **Layout/names:** UI tests belong in `src/tests/End2End` or `src/tests/Login`; API and AI tests belong in `src/tests/apisTests` and `src/tests/aiTest`. Page objects go in `src/pages`, fixtures in `src/fixtures`, shared test data/schemas in `src/testdata`, and utilities in `src/utils`. Preserve the relevant directory’s existing file naming and capitalization.
2. **POM:** UI behavior belongs in a focused page object, not duplicated in test specs. Extend `BasePage` for shared page scaffolding; keep page-specific locators as `private readonly Locator` members initialized in the page object constructor. Do not add locators to `BasePage` without a genuinely universal use case.
3. **Fixtures:** Use `@playwright/test` fixtures. Reuse or extend `src/fixtures/test-base.ts` for shared page-object/application-state UI setup and the existing API fixtures for shared API state. Request only needed fixtures; avoid global/manual setup that bypasses fixture lifecycle.
4. **Actions, locators, assertions:** Prefer the project’s existing `UtilElementLocator` wrapper for common locator actions and the locator styles already used by the relevant page. Prefer resilient, specific existing `data-test` selectors when available. Use Playwright `expect` assertions against observable behavior; do not use fixed sleeps or weak assertions in place of auto-waiting assertions.
5. **Test organization:** Use `test.describe`/`test`, Playwright’s `request` fixture for API tests, and `expect` from Playwright. Group meaningful flow steps with `test.step` or the existing `visualStep` helper where consistent with nearby tests. Keep tests focused on behavior and attach API response evidence only when useful to the existing reporter.
6. **Logging/reporting:** Use `createLogger(scope)` from `src/utils/Logger.ts`; do not introduce direct or competing logging/reporting when the scoped logger or Playwright/custom reporters suffice. Reuse `visualStep` for screenshot/step capture where appropriate.
7. **Configuration:** Keep environment resolution in the existing dotenv/config path (`src/config/env.ts`, `src/config/credentials.ts`, `playwright.config.ts`). Respect the existing `chromium`, `api`, and `ai` project boundaries, timeouts, and capture options. Do not hardcode secrets or create a parallel config source.
8. **Validation commands:** `package.json` currently defines no scripts and there is no `tsconfig.json`. Run appropriate available Playwright/ESLint checks for the changed area; never claim a nonexistent script or TypeScript compile configuration was run. The GitHub Actions workflow runs `npm ci`, Playwright browser installation, and `npx playwright test`.
9. **Compare:** Read at least one nearby existing implementation before deciding a change is a deviation. If an intentional deviation is required, explain the repository-specific reason and trade-off in the PR report.

## Pass/fail criteria

- **PASS** if all applicable checklist items follow the established pattern, or each deviation is necessary, narrowly scoped, and justified with repository-specific evidence.
- **FAIL** for unexplained folder/naming drift, bypassing appropriate POM/fixtures, speculative base/config layers, locator/assertion patterns inconsistent with this framework, duplicated logging/reporting, or secrets in code/config.
- Do not treat generic familiarity with Playwright as evidence that a new pattern belongs here; compare against actual repository code.

## Violation and fix examples

**Violation — duplicate login actions and selectors in every test:**

```ts
await page.locator('[data-test="username"]').fill(username);
await page.locator('[data-test="password"]').fill(password);
await page.locator('[data-test="login-button"]').click();
```

**Fix — use the established page object and fixture:**

```ts
import { test, expect } from '../../fixtures/test-base';

test('login reaches inventory', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.loginAs(username, password);
    await expect(page).toHaveURL(/inventory/);
});
```

**Violation — put an inventory-only locator on `BasePage`, or add a new env loader beside `src/config/env.ts`.**

**Fix — declare the locator on `InventoryPage` and use the existing environment/configuration path.**

## Required PR report format

```text
framework-patterns: PASS | FAIL
Patterns checked: <applicable POM/fixture/layout/config/locator/assertion/logging conventions>
Evidence: <file:line(s), or “diff follows nearby framework examples”>
Deviations/findings: <none, or each deviation and repository-specific justification/fix>
```
