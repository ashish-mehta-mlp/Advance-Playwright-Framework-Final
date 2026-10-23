---
name: ponytail
description: Detect new logging, reporting, or tracking that duplicates details already captured by the framework Winston logger or Playwright/custom reporters. Run before any pull request.
---

# Gate: ponytail

**Question:** “Does anything else in the run already record this?”

## Definition

Flag any new logging, reporting, or tracking that duplicates what the existing logger or reporter already captures.

## Purpose

Prevent redundant instrumentation and competing records. This framework already has a scoped Winston logger (`src/utils/Logger.ts`), Playwright HTML/list reporters, and `src/utils/CustomReporter.ts`, which captures test outcomes, steps, stdout/stderr, attachments, screenshots, videos, traces, and run summaries.

## When to run

Run against the complete proposed diff before every PR, especially when changes add logs, reports, attachments, metrics, test-step output, history, or run metadata. Rerun after changes.

## Checklist

1. Identify every new or changed log line, output sink, reporter, attachment, run snapshot, metric, history file, or tracking field.
2. For each item, search the existing logger, Playwright config/reporters, and custom reporter for the same event or data.
3. Decide whether the addition is materially distinct and needed to make the behavior observable. A new format or destination alone is not a distinct signal.
4. Prefer existing `createLogger(scope)`, `test.step`/`visualStep`, test attachments, and reporter data over another logger, file, console stream, or counter.
5. If new capture is necessary, explain the uncovered use case and why the current logger/reporter cannot represent it. Ensure secrets and sensitive values are not recorded.

## Pass/fail criteria

- **PASS** when there is no new instrumentation, or every new signal is demonstrably distinct, needed, and does not repeat existing captured data.
- **FAIL** when a new log, report, metric, or tracking field repeats an existing signal without a clearly documented user-facing need. Identify both capture sites and recommend the existing framework facility.
- A different filename, message wording, timestamp, or output format does not by itself justify duplication.

## Violation and fix examples

**Violation — an additional console logger duplicates the scoped Winston log and captured reporter stdout:**

```ts
console.log(`Checkout completed for ${orderId}`);
```

**Fix — use the existing scoped logger; the reporter already collects test output:**

```ts
const log = createLogger('checkout');
log.info(`Checkout completed for ${orderId}`);
```

**Violation — add a second test-results JSON history that repeats the custom reporter’s run summary without a consumer requirement.**

**Fix — use the existing custom reporter output, or describe the distinct consumer/data need and extend the reporter’s existing output model instead of introducing another tracker.**

## Required PR report format

```text
ponytail: PASS | FAIL
Evidence: <file:line(s), or “no duplicate instrumentation found”>
Existing capture: <logger/reporter destination, or “not applicable”>
Findings/disposition: <none, or duplicate and fix/accepted rationale>
```
