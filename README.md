# Advanced Playwright + TypeScript Framework

A Playwright Test automation project written in TypeScript. It brings together browser-based UI tests, REST API coverage, reusable page objects and fixtures, schema validation, and generated test data.

## Project overview

The test suite is organized into three Playwright projects:

- **chromium** — UI login and end-to-end checkout tests.
- **api** — REST API tests, including CRUD flows, negative cases, JSONPath, and JSON Schema validation.
- **ai** — AI-assisted test-data generation examples.

The shared configuration is in `playwright.config.ts`. It configures environment-based URLs, a 60-second default test timeout (longer for AI tests), parallel execution, and HTML, list, and custom reporting.

## Tech stack

- Node.js and npm
- TypeScript and Playwright Test
- Faker for test data generation
- AJV and AJV formats for JSON Schema validation
- JSONPath Plus for JSON response queries
- Winston for logging
- Allure Playwright and Playwright HTML reporting
- GitHub Actions for CI

## Folder structure

```text
.
├── .github/
│   └── workflows/       GitHub Actions workflow
├── docs/                Framework documentation
├── rules/               Project rules and guidance
├── src/
│   ├── api/              API client modules
│   ├── config/           Environment and credential helpers
│   ├── fixtures/         Reusable UI and API test fixtures
│   ├── pages/            Page Object Model classes
│   ├── testdata/         Test data and JSON schemas
│   ├── tests/
│   │   ├── aiTest/       AI-assisted test examples
│   │   ├── apisTests/    API, JSONPath, and schema tests
│   │   ├── End2End/      UI end-to-end tests
│   │   └── Login/        Login tests
│   └── utils/            API, data, logging, validation, and reporting utilities
├── tests/                Additional/example tests
├── playwright.config.ts  Playwright projects and shared settings
├── package.json         Dependencies
└── package-lock.json    Locked dependency versions
```

Generated output directories such as `playwright-report/`, `test-results/`, `reports/`, and `tta-report/` may be created or updated by test runs.

## Prerequisites

- Node.js LTS and npm
- Git, to clone the repository
- Chromium and its system dependencies (installed with Playwright below)

## Installation

From the project root, install dependencies and the browser required by the UI tests:

```bash
npm ci
npx playwright install chromium
```

On Linux CI or a fresh Linux machine, install browser system dependencies as well:

```bash
npx playwright install --with-deps chromium
```

## Environment variables

The Playwright configuration loads environment variables from a local `.env` file and allows shell or CI values to take precedence. Create a local `.env` file in the project root or configure the variables in your shell/CI secret store. Use placeholders in local templates, and replace them privately with the appropriate values; **do not commit real credentials or API keys**.

```dotenv
# Select an environment and optionally override its URL
TTA_ENV=<ENVIRONMENT_NAME>
BASE_URL=<YOUR_BASE_URL>
QA_BASE_URL=<YOUR_QA_BASE_URL>
DEV_BASE_URL=<YOUR_DEV_BASE_URL>
STG_BASE_URL=<YOUR_STAGING_BASE_URL>
PROD_BASE_URL=<YOUR_PRODUCTION_BASE_URL>
API_BASE_URL=<YOUR_API_BASE_URL>

# UI test account
STANDARD_USER=<YOUR_TEST_USERNAME>
TTA_SECRET=<YOUR_TEST_PASSWORD>

# Optional AI test settings
GROQ_API_KEY=<YOUR_GROQ_API_KEY>
GROQ_MODEL=<YOUR_GROQ_MODEL>
```

`BASE_URL` takes precedence over `TTA_ENV` and the environment-specific URL variables. Supported `TTA_ENV` names are `qa`, `dev`, `local`, `stg`, `stage`, `staging`, `prod`, `production`, and `api`. If no URL override is supplied, the configuration uses its built-in defaults. AI test configuration is only needed when running AI-assisted tests. The custom reporter can also detect provider keys through `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY`; keep those secrets in your local environment or CI secrets if applicable.

## Running tests

Run the full configured suite:

```bash
npx playwright test
```

Run only one test file:

```bash
npx playwright test src/tests/End2End/e2e.spec.ts
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

Run a test in Playwright's interactive debug mode:

```bash
npx playwright test --debug
```

To debug one file, add its path, for example:

```bash
npx playwright test src/tests/Login/Login.spec.ts --debug
```

Run a particular Playwright project if needed:

```bash
npx playwright test --project=api
npx playwright test --project=chromium
```

## HTML report

The HTML reporter is enabled in the Playwright configuration. After a test run, open the generated report with:

```bash
npx playwright show-report
```

The report is written to `playwright-report/`.

## CI/CD

The workflow at `.github/workflows/playwright.yml` runs on pushes and pull requests targeting `main` or `master`. GitHub Actions uses an Ubuntu runner and the latest Node.js LTS, runs `npm ci`, installs Playwright browsers and system dependencies, and runs `npx playwright test`. The workflow uploads `playwright-report/` as an artifact even when the job is cancelled, with a 30-day retention period.
