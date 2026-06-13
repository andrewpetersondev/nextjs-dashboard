---
description: Lint + format check — Biome + Markdown (report-only)
allowed-tools: Bash(pnpm biome:lint), Bash(pnpm biome:format:check), Bash(pnpm md:lint), Bash(pnpm md:format:check)
disallowed-tools: Edit, Write, NotebookEdit
---

Run `pnpm biome:lint`, `pnpm biome:format:check`, `pnpm md:lint` (markdownlint-cli2), then `pnpm md:format:check` (dprint). Report all issues grouped by file. Do not auto-fix — just report. (To apply fixes, use `/fix`.)
