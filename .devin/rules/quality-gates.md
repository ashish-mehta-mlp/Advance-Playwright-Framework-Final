---
trigger: always_on
description: Apply the four mandatory repository quality gates before proposing a pull request.
---

Before raising a PR, read root `AGENTS.md` and execute all four canonical gate checklists against the complete proposed diff:

- `.agents/skills/ai-slop/SKILL.md`
- `.agents/skills/ponytail/SKILL.md`
- `.agents/skills/over-engineering/SKILL.md`
- `.agents/skills/framework-patterns/SKILL.md`

Their criteria and exact PR report formats are authoritative. Fix findings, rerun affected gates, and report each gate in the PR. Do not claim a pass unless the checklist was completed.
