---
name: over-engineering
description: Review new helpers, base classes, fixtures, and configuration layers for real callers, premature generalization, or needless indirection. Run before any pull request.
---

# Gate: over-engineering

**Question:** “How many callers does this abstraction have?”

## Purpose

Keep the framework’s existing abstractions small and evidence-based. `BasePage` deliberately shares only page, locator utility, scoped logger, and navigation; page-specific locators remain with each page object. Fixtures are lazy and shared where test setup is genuinely reusable.

## When to run

Run against the complete proposed diff before every PR whenever it adds or changes a helper, base class, wrapper, fixture, factory, generic type, config layer, or abstraction. Also run the gate for other diffs and report a pass if none were added.

## Checklist

1. Inventory each abstraction introduced or expanded, its public surface, and every actual production/test caller in the repository. Count call sites; do not count declarations, examples in comments, or hypothetical future callers.
2. For each abstraction with fewer than two real callers, require a concrete explanation of why centralization is needed now (for example, a stable framework boundary or essential resource lifecycle). Otherwise recommend inlining it at its one call site.
3. For abstractions with two or more callers, verify that they share a real invariant/behavior rather than merely similar-looking lines, and that the abstraction is simpler than the duplicated code.
4. Check for one-use base classes, pass-through wrappers, forwarding functions, configurable options with one value, framework-within-framework layers, speculative plugin points, and generic APIs built for hypothetical reuse.
5. Prefer established structures: a page-specific locator belongs in its page object; cross-test setup belongs in the existing fixture file only when it is truly shared; API requests can reuse `ApiHelper`; common element actions can reuse `UtilElementLocator`.
6. Review the justification in the PR report. “Could be reused later,” “cleaner,” or “best practice” alone is not sufficient. Do not demand abstraction merely to remove a small amount of repetition.

## Pass/fail criteria

- **PASS** if no needless abstraction is introduced, or every new abstraction is justified by actual callers or an essential concrete boundary, and its complexity is lower than the alternative.
- **FAIL** for an abstraction with fewer than two real callers and no specific justification, hypothetical generalization, or indirection that makes the established flow harder to follow.
- A single caller is not automatically wrong: it may pass only with an explicit, concrete justification recorded in the PR report.

## Violation and fix examples

**Violation — create a generic one-call wrapper for a single Playwright assertion:**

```ts
async function assertInventoryVisible(page: Page): Promise<void> {
    await expect(page.locator('[data-test="inventory-list"]')).toBeVisible();
}
```

**Fix — keep the one-use assertion at its test/page-object call site, or make it a page-object method only if it represents that page’s meaningful reusable behavior.**

**Violation — add an `AbstractPageFactoryProvider` used only to instantiate one `LoginPage`.**

**Fix — construct `LoginPage` directly in the existing fixture, following `src/fixtures/test-base.ts`.**

## Required PR report format

```text
over-engineering: PASS | FAIL
Abstractions reviewed: <name and real caller count, or “none added”>
Justifications: <specific reasons for single-caller abstractions, or “not applicable”>
Findings/disposition: <none, or issue(s), fix, and rerun result>
```
