---
description: Full validation — Biome + Markdown + typegen + typecheck + migration drift + knip + unit/integration + e2e (report-only)
allowed-tools: Bash(pnpm check)
disallowed-tools: Edit, Write, NotebookEdit
---

Run `pnpm check`. This is the **full** gate — it runs the knip dead-code gate plus the unit +
integration lanes and the Cypress e2e
suite on top of what `/check-fast` covers, so it takes minutes, and the integration and e2e lanes need
`.env.test.local` to be present. A fresh worktree does not have it (it is untracked); if it is missing the run fails at
startup — report that as a setup gap, not a code failure, and do not retry.

Report all failures with file paths and line numbers. Do not attempt to fix anything — just report.
