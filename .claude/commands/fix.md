---
description: Auto-fix Biome + Markdown lint/format issues, then report what remains
allowed-tools: Bash(pnpm biome:lint:fix), Bash(pnpm biome:lint), Bash(pnpm md:fix), Bash(pnpm md:check)
disallowed-tools: Edit, Write, NotebookEdit
---

Run `pnpm biome:lint:fix` to apply Biome's safe lint fixes and formatting, then `pnpm md:fix` to apply markdownlint autofixes followed by dprint formatting (dprint runs last so it has final say on whitespace). Markdown writes go through those tools, not by hand. Then run `pnpm biome:lint` and `pnpm md:check` to surface anything still failing — those need `--unsafe` or a manual fix and are out of scope here. Report what was auto-fixed and what remains, grouped by file. Do not hand-edit files — only the fix scripts write.
