# Repository quality gates

Before raising any pull request, the AI coding assistant that prepared the change must run all four project quality gates against the complete proposed diff. These are review procedures, not a substitute for the project tests or GitHub Actions workflow. Do not claim a gate passed unless its checklist was actually completed.

## Canonical gates

The only authoritative gate definitions are the project skills below. Read each complete `SKILL.md` and apply its exact criteria and PR report format:

1. [ai-slop](.agents/skills/ai-slop/SKILL.md) — review generated changes for correctness, necessity, and real test value.
2. [ponytail](.agents/skills/ponytail/SKILL.md) — detect duplicate logging, reporting, or tracking.
3. [over-engineering](.agents/skills/over-engineering/SKILL.md) — demand evidence for abstractions, based on actual callers.
4. [framework-patterns](.agents/skills/framework-patterns/SKILL.md) — check the established Playwright framework conventions.

Run every gate, even when it appears unrelated; report `PASS` with a concise rationale when it finds no issue. Fix findings and rerun affected gates before opening the PR. If a finding is intentionally accepted, disclose it with rationale; do not label it a pass.

## Confirmed project conventions

- TypeScript + Playwright Test; UI, API, and AI tests use separate projects in `playwright.config.ts`.
- UI tests are in `src/tests/{End2End,Login}`; API and AI tests are in `src/tests/{apisTests,aiTest}`.
- Page objects are in `src/pages`, extend the small `BasePage`, and own their private readonly locators.
- Reusable page objects and prepared application states are provided by fixtures in `src/fixtures`.
- Tests use Playwright `expect` assertions, and meaningful workflows use `test.step` or `visualStep`.
- API tests use Playwright's `request` fixture and the existing `ApiHelper` where suitable.
- Logging goes through the Winston logger (`createLogger(scope)`); `CustomReporter.ts` and Playwright reporters already capture run details, steps, logs, and artifacts.
- Environment values are loaded through `dotenv`/`src/config/env.ts`; `playwright.config.ts` resolves environment URLs and separates chromium, api, and ai projects.
- ESLint uses recommended JavaScript and TypeScript configurations. No `tsconfig.json` or npm scripts are currently defined; do not invent validation commands.

## Tool-specific instruction formats checked

The root `AGENTS.md` and `.agents/skills/<name>/SKILL.md` are the portable source. Thin native entry points are provided for Copilot, Claude Code, Cursor, Windsurf/Devin Desktop, Kiro, Devin, Codex, and OpenCode; each points back to the canonical skill definitions rather than redefining them. Some tools require a discovery copy of the small `quality-gates` launcher skill in their native skill folder; that launcher delegates to the four canonical gate files and contains no second copy of their rules. Check the native entrypoint for the tool in use and follow its required import/reference mechanism.

Official documentation verified on 2026-10-21:

- GitHub Copilot repository instructions/skills: https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot and https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
- Claude Code `CLAUDE.md` imports and project skills: https://code.claude.com/docs/en/memory and https://code.claude.com/docs/en/skills
- Cursor `.cursor/rules/*.mdc`, `AGENTS.md`, and skills: https://cursor.com/docs/context/rules and https://cursor.com/docs/context/skills
- Windsurf/Devin Desktop rules, `AGENTS.md`, and skills: https://docs.devin.ai/desktop/cascade/memories and https://docs.devin.ai/desktop/cascade/skills
- Kiro steering and skills: https://kiro.dev/docs/steering/ and https://kiro.dev/docs/skills/
- Devin `AGENTS.md` and skills: https://docs.devin.ai/onboard-devin/agents-md and https://docs.devin.ai/product-guides/skills
- OpenAI Codex `AGENTS.md` and skills: https://learn.chatgpt.com/docs/agent-configuration/agents-md and https://learn.chatgpt.com/docs/build-skills
- OpenCode rules and skills: https://opencode.ai/docs/rules/ and https://opencode.ai/docs/skills/

The requested tool name “Command Code” could not be matched to an official coding assistant or documentation. Codex is documented and has a native entrypoint here; do not claim “Command Code” compatibility unless the requester identifies the intended tool.
