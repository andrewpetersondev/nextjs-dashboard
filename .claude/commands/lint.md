---
description: Biome lint + format check (report-only)
allowed-tools: Bash(pnpm biome:lint && pnpm biome:format:check), Bash(pnpm biome:lint), Bash(pnpm biome:format:check)
disallowed-tools: Edit, Write, NotebookEdit
---

Run `pnpm biome:lint && pnpm biome:format:check`. Report all issues grouped by file. Do not auto-fix — just report. (To apply fixes, use `/fix`.)
