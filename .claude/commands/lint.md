---
description: Lint + format check — Biome + Markdown (report-only)
allowed-tools: Bash(pnpm biome:lint), Bash(pnpm md:lint), Bash(pnpm md:format:check)
disallowed-tools: Edit, Write, NotebookEdit
---

Run `pnpm biome:lint` (`biome check` — lint, formatting, and import order in one pass, so a separate
`biome format` run is redundant), then `pnpm md:lint` (markdownlint-cli2) and `pnpm md:format:check`
(dprint). Markdown needs both because linting and formatting are separate tools there, unlike Biome.

Report all issues grouped by file. Do not auto-fix — just report. (To apply fixes, use `/fix`.)
