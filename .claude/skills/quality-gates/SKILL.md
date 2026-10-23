---
name: quality-gates
description: Run all four repository-mandated AI code quality gates on the complete proposed diff before raising a pull request.
---

# Pull-request quality gates

Before any PR, read root `AGENTS.md` and all four canonical skills below. Apply every checklist to the complete proposed diff, fix findings, rerun affected gates, and include each skill's exact PR report format in the PR. A skill invocation is not a passing result; only report what was actually reviewed.

- `../../../.agents/skills/ai-slop/SKILL.md`
- `../../../.agents/skills/ponytail/SKILL.md`
- `../../../.agents/skills/over-engineering/SKILL.md`
- `../../../.agents/skills/framework-patterns/SKILL.md`
