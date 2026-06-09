---
description: Auto-fix Biome lint + format issues, then report what remains
allowed-tools: Bash(pnpm biome:lint:fix), Bash(pnpm biome:lint)
disallowed-tools: Edit, Write, NotebookEdit
---

Run `pnpm biome:lint:fix` to apply Biome's safe lint fixes and formatting (this writes files via Biome). Then run `pnpm biome:lint` to surface anything still failing — those need `--unsafe` or a manual fix and are out of scope here. Report what was auto-fixed and what remains, grouped by file. Do not hand-edit files — only the fix script writes.
