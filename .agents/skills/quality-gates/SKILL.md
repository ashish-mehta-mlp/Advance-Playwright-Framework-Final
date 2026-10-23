---
name: quality-gates
description: Run all four repository-mandated quality gates on the complete proposed diff before raising a pull request.
---

Before any PR, read root `AGENTS.md` and all four canonical skills. Apply each complete checklist, fix findings, rerun affected gates, and include each skill's exact report format in the PR. Never claim a gate passed unless it was actually reviewed.

- `ai-slop`: `.agents/skills/ai-slop/SKILL.md`
- `ponytail`: `.agents/skills/ponytail/SKILL.md`
- `over-engineering`: `.agents/skills/over-engineering/SKILL.md`
- `framework-patterns`: `.agents/skills/framework-patterns/SKILL.md`
