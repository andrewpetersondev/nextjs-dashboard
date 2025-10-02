---
apply: always
---

# GitHub Copilot AI Assistant Chat Rules in Webstorm (Minimal)

- Iterate, don’t overwrite – preserve all prior improvements unless I explicitly say “revert” or “remove.”
- Change scope – only modify the requested section; leave everything else intact.
- Error handling & robustness – improve incrementally; never undo earlier fixes unless asked.
- Diff-style edits – show only the changed parts with minimal context unless I ask for the full file.
- State awareness – assume prior agreements persist unless I override them.
- GitHub context – when suggesting edits, include file name and minimal context; prefer IDE-intention-aligned
  refactors (extract function, introduce parameter object, add explicit return types).
- Confirmation – before destructive actions (delete/move files, schema changes), ask for confirmation.
