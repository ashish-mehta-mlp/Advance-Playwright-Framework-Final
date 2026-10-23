---
name: ai-slop
description: Review the proposed repository diff for unreviewed generated code, unused or dead code, invented APIs/dependencies, boilerplate or copied blocks, and tests that assert nothing. Run before any pull request.
---

# Gate: ai-slop

**Question:** “Was this generated, skimmed, and shipped?”

## Purpose

Catch code that looks complete but has not been checked against this TypeScript + Playwright repository, its actual APIs, and its demonstrated test conventions.

## When to run

Run against the complete proposed diff before every PR, after the implementation and tests are complete. Rerun after addressing findings. This gate is required even when changes were hand-written.

## Checklist

1. Read the full diff and trace each new or modified behavior to its call sites and relevant existing implementation.
2. Check imports, variables, parameters, branches, helpers, comments, and files for unused, unreachable, or dead code. Confirm every new dependency exists in `package.json` and is actually needed; do not trust generated package or API names without checking installed declarations, existing usage, or official docs.
3. Compare Playwright calls and options to the installed `@playwright/test` API and the project’s configuration. Flag invented methods, unsupported options, nonexistent modules, and unexplained version assumptions.
4. Look for generic boilerplate, generated TODOs/placeholders, redundant comments that restate code, and copied blocks that should instead reuse an existing fixture, page object, `ApiHelper`, `UtilElementLocator`, or logger.
5. Inspect each added/changed test: it must execute the behavior under test and make at least one meaningful `expect` assertion (or equivalent explicit failure condition) tied to the expected outcome. Setup-only tests and assertions that merely check truthiness of constants are not evidence.
6. Check that assertions are specific enough to fail when the behavior regresses; a passing test must establish an observable result, not merely that an action did not throw.
7. Run only relevant available checks if needed to resolve a finding. This repository has no npm scripts or `tsconfig.json`; do not report those as available checks.

## Pass/fail criteria

- **PASS** only if every changed block was reviewed, APIs/packages are verified, no unexplained dead/unused/generated residue remains, and changed tests assert the intended observable behavior.
- **FAIL** if any such issue remains, an API/package is unverified, or a test can pass without checking the requirement. List evidence by file and line; fix and rerun before PR.
- If uncertainty cannot be resolved from the repository or authoritative dependency documentation, report **FAIL — UNVERIFIED**, not a guessed pass.

## Violation and fix examples

**Violation — test performs actions but makes no assertion:**

```ts
await loginPage.open();
await loginPage.loginAs(username, password);
```

**Fix — assert an outcome using the framework’s Playwright assertion convention:**

```ts
await loginPage.loginAs(username, password);
await expect(page).toHaveURL(/inventory/);
```

**Violation — invent a page helper or add a new package without checking whether it exists or is needed.**

**Fix — verify the installed Playwright/API surface and first reuse the existing page object, fixture, or helper; add a dependency only when a real requirement cannot be met by current packages.**

## Required PR report format

```text
ai-slop: PASS | FAIL
Evidence: <file:line(s), or “diff reviewed; no findings”>
Findings: <none, or numbered issue(s) and their disposition>
Fixes/re-run: <change and rerun result, or “not applicable”>
```
