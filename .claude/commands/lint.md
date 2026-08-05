---
description: Lint + format check — Biome + Markdown (report-only)
allowed-tools: Bash(pnpm lint)
disallowed-tools: Edit, Write, NotebookEdit
---

Run `pnpm lint`. It runs Biome (`biome check` — lint, formatting, and import order in one pass, so a
separate `biome format` is redundant) and then the Markdown pair (markdownlint-cli2, then dprint).

It deliberately runs **both halves even when the first fails**, so a Biome error never hides Markdown
issues — the exit code is still non-zero if either half failed. Report all issues grouped by file.

Do not auto-fix — just report. (To apply fixes, use `/fix`.)
