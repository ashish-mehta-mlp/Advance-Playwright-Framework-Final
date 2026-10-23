# Playwright + TypeScript Test Framework

## 1. Project overview

This repository contains browser UI, REST API, and AI-assisted test-data-generation examples built with Playwright Test and TypeScript. `playwright.config.ts` separates tests into three projects: `chromium` for UI tests, `api` for HTTP tests, and `ai` for the Groq data-generation test.

**Main technologies:** Node.js, Playwright Test, TypeScript, Faker, Winston, AJV, JSONPath Plus, and dotenv. These packages are listed in `package.json`.

## 2. Key features

- **Page Object Model:** UI page objects extend the small `BasePage` class and keep their own locators in `src/pages/`.
- **Fixtures:** `src/fixtures/` provides page-object fixtures and reusable application states for UI tests, plus API fixtures.
- **Winston logging:** `src/utils/Logger.ts` provides a shared logger and `createLogger(scope)` for scoped output. The default log level is `info`; set `LOG_LEVEL` to change it.
- **Custom HTML reporter:** `src/utils/CustomReporter.ts` writes timestamped Aurionpro-branded reports and an index under `tta-report/`. It includes test status, steps, logs, and available artifacts such as screenshots, videos, and traces.
- **Environment selection:** `TTA_ENV` selects the UI base URL; `BASE_URL` can override it. The API and AI projects use `API_BASE_URL` or their configured fallback.
- **Test labels:** Test names include labels such as `@p0`, `@P0`, `@regression`, and `@e2e`. The current tests do not use an `@smoke` label.
- **Other installed packages:** AJV/AJV Formats validate JSON schemas, JSONPath Plus queries JSON, and Faker supports generated test data.
- **Allure package:** `allure-playwright` is installed, but the checked-in Playwright configuration does not enable an Allure reporter or define an Allure report-generation command.

## 3. Prerequisites

- Node.js LTS with npm.
- VS Code (recommended for editing this TypeScript project).
- Git to clone the repository.

## 4. Installation

From the repository root:

1. Install the dependencies declared in the lockfile:

	```bash
	npm install
	```

2. Install Playwright browsers:

	```bash
	npx playwright install
	```

On Linux, the GitHub Actions workflow installs browsers and their system dependencies with `npx playwright install --with-deps`.

## 5. Environment setup

1. Copy `.env.example` to `.env` in the repository root.

	In PowerShell, run:

	```powershell
	Copy-Item .env.example .env
	```

2. Replace any `YOUR_...` placeholders needed for your run with your own local or CI values. Do not commit `.env`, credentials, or API keys. `.env` is ignored by Git.
3. Leave optional values blank if the corresponding override or feature is not needed. The UI config has built-in URL defaults; the AI test requires a Groq API key.

Variables read by the current source:

| Variable | Purpose |
| --- | --- |
| `TTA_ENV` | Selects the UI environment: `qa` (default), `dev`, `local`, `stg`, `stage`, `staging`, `prod`, `production`, or `api`. |
| `BASE_URL` | Overrides the UI base URL selected by `TTA_ENV`. |
| `QA_BASE_URL`, `DEV_BASE_URL`, `STG_BASE_URL`, `PROD_BASE_URL` | Override the UI URL for the matching environment. |
| `API_BASE_URL` | Sets the base URL used by the API and AI projects. |
| `STANDARD_USER`, `TTA_SECRET` | Optional credential inputs used by `src/config/credentials.ts`; that helper has fallbacks. Some existing tests also read `src/testdata/logintestdata.json` or use test values directly. |
| `GROQ_API_KEY` | Required to run the Groq AI data-generation test. Keep it secret. |
| `GROQ_MODEL` | Optional Groq model override; the test has a built-in default. |
| `ATTACH_SCREENSHOTS` | Set to `true` to enable screenshot capture in the reporter and `visualStep`; otherwise screenshot capture is off. |
| `CHECKOUT_FIRST_NAME`, `CHECKOUT_LAST_NAME`, `CHECKOUT_POSTAL_CODE` | Optional checkout test-data overrides; generated values are used when unset. |
| `LOG_LEVEL` | Sets the Winston log level; defaults to `info`. |
| `TEST_ENV`, `TEST_AUTHOR` | Optional labels used in custom reporter output; the reporter supplies defaults when unset. |

The custom reporter also checks for `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY` before its optional failure-analysis path. Do not put real values in `.env.example` or documentation.

## 6. Folder structure

```text
.
├── .agents/                 Shared Agent Skills, including the quality gates
├── .claude/                 Claude Code project skill entry point
├── .cursor/                 Cursor project rule
├── .devin/                  Devin rules and skill entry point
├── .github/
│   └── workflows/           GitHub Actions workflow
├── .kiro/                   Kiro steering and skill entry point
├── .opencode/               OpenCode skill entry point
├── .windsurf/               Windsurf rules and skill entry point
├── docs/                    Project documentation
├── rules/                   Project rules
├── src/
│   ├── api/                 Booking API client
│   ├── config/              Environment and credential helpers
│   ├── fixtures/            Shared Playwright UI and API fixtures
│   ├── pages/               UI page objects, including BasePage
│   ├── testdata/            Login/booking data and JSON schemas
│   ├── tests/
│   │   ├── aiTest/          AI-assisted data-generation test
│   │   ├── apisTests/       REST API, JSONPath, and schema tests
│   │   ├── End2End/         Browser end-to-end tests
│   │   └── Login/           Login tests
│   └── utils/               API, data, logging, locator, and reporting helpers
├── tests/                   Additional example test directory
├── playwright-report/       Playwright HTML report output
├── reports/runs/            Custom reporter run snapshots
├── tta-report/              Custom Aurionpro HTML reports and artifacts
├── test-results/            Playwright test artifacts
├── playwright.config.ts     Playwright projects and shared configuration
├── eslint.config.mts        ESLint configuration
├── package.json             Dependencies (no npm scripts are defined)
└── package-lock.json        Locked dependency versions
```

The Playwright `testDir` is `src/tests`; the root `tests/` directory is not the configured test directory.

## 7. How to run tests

Run these commands from the repository root. Use forward slashes in test paths, including on Windows.

1. Run all configured projects:

	```bash
	npx playwright test
	```

2. Run one test file (example: the checkout end-to-end test):

	```bash
	npx playwright test src/tests/End2End/e2e.spec.ts --project=chromium
	```

3. Run tests whose title or describe text contains a label such as `@p0`:

	```bash
	npx playwright test --grep "@p0"
	```

	Label capitalization varies in existing tests. No `@smoke` tests are currently defined.

4. Run browser tests in headed mode:

	```bash
	npx playwright test --project=chromium --headed
	```

You can also target a project with `--project=api` or `--project=ai`. The AI project requires `GROQ_API_KEY`.

## 8. How to view reports

- **Custom Aurionpro report:** After a run, open the latest timestamped HTML report in `tta-report/`, or open `tta-report/index.html` for the latest-report link. In PowerShell:

  ```powershell
  Start-Process .\tta-report\index.html
  ```

- **Playwright HTML report:** The configured HTML reporter writes to `playwright-report/`. Open it with:

  ```bash
  npx playwright show-report
  ```

## 9. Code quality

- ESLint is configured in `eslint.config.mts`, but there is no lint script in `package.json`. The direct command `npx eslint src` currently fails because ESLint 10 requires `jiti` to load this TypeScript configuration, and `jiti` is not declared in the dependencies.
- Prettier is not listed as a dependency and no Prettier configuration is present.
- No `tsconfig.json`, `typescript` package, or type-check script is present, so `tsc --noEmit` is not configured for this repository.
- `package.json` currently has no npm scripts.

## 10. CI/CD

GitHub Actions is configured in `.github/workflows/playwright.yml`. On pushes and pull requests targeting `main` or `master`, it uses Ubuntu and Node.js LTS, runs `npm ci`, installs Playwright browsers with system dependencies, and runs `npx playwright test`. It uploads `playwright-report/` as an artifact with 30-day retention. No Jenkinsfile or Jenkins pipeline is present.

The workflow does not define `GROQ_API_KEY`; the AI test requires this variable. Configure it as a GitHub Actions secret if the AI test is expected to pass in CI.

## 11. Contributing and branching

Create a working branch from `main` and open a pull request for review. The repository does not define a required branch naming convention. Before opening a PR, follow the four quality-gate skills referenced in `AGENTS.md` and include their reports. Keep credentials and `.env` files out of commits.

## 12. Troubleshooting

- **“No tests found” on Windows:** Use forward slashes in Playwright paths, for example `src/tests/End2End/e2e.spec.ts`, and check that the path is under `src/tests`.
- **AI test fails because a key is missing:** Set `GROQ_API_KEY` in your local `.env` or CI secret store before running `--project=ai` or the full suite.
- **Browser executable missing:** Run `npx playwright install` after installing npm dependencies.
- **Unexpected target URL:** Check `TTA_ENV` and whether `BASE_URL` is set; `BASE_URL` takes precedence for UI tests. The API and AI projects read `API_BASE_URL` separately.
