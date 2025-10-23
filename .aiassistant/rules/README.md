---
apply: off
---

# JetBrains AI Rules Index

Purpose

- Provide a quick index of rule files, when to attach them, and global activation guidance to maximize value while minimizing credit usage.

Activation Guidance

- Prefer manual activation with narrow patterns/tasks. Avoid apply: always unless the rule is small and universally useful.
- Attach only what you need for the current change (e.g., typescript-rules.md when touching .ts/.tsx, forms.md when working on actions/forms).
- Use structural tools (get_file_structure, search_project, rename_element) instead of opening large files.

Rule Catalog

- typescript-rules.md: Strict TS authoring rules. Attach when editing exported APIs/components.
- structure-summary.md: Layering/import boundaries. Attach for refactors or file moves.
- security-baseline.md: Logging/redaction/serialization. Attach for anything that logs, throws, or returns errors/results.
- results.md: Result<T, E> usage patterns. Attach for service/action logic.
- errors.md: Error modeling and adapters. Attach at boundaries and logging.
- error-classes.md: Class and error class patterns with examples. Attach when designing/adjusting types.
- forms.md: Form validation and adapters to UI. Attach for actions that process FormData.
- layers.md: Layer responsibilities and adapter rules. Attach during architecture work.
- testing-rules.md: Testing conventions (Vitest/Cypress). Attach when writing or refactoring tests.
- nextjs-performance-caching.md: Next.js data fetching/caching rules. Attach when tuning performance and data flows.
- accessibility-a11y.md: Accessibility rules. Attach when changing UI components or forms.
- md-docs.md: Documentation conventions. Attach for docs edits.

Low‑Token Playbook (Global)

- Batch: Plan and request grouped edits; avoid iterative micro-prompts.
- Target: Reference exact paths/symbols/line ranges to reduce back-and-forth.
- Tools: Prefer get_file_structure/search_project/rename_element; avoid open_entire_file.
- Output: Ask for diffs or specific sections, not full files, when reviewing.

Deprecations

- always-on.md removed (2025-10-16). Its contents were extracted and redistributed as follows:
  - Governance and activation schema → project-rules.md
  - Coding/style constraints for TS → typescript-rules.md
  - Architecture/layering highlights → structure-summary.md and layers.md
  - Security/logging/serialization cautions → security-baseline.md
  - Error/Result/Form adapter guidance → errors.md, results.md, and forms.md
- current-focus.md converted into a reusable focus template with apply: off (2025-10-16).

Last updated: 2025-10-16
