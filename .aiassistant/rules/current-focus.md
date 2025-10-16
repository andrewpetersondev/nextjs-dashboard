---
apply: manually
---

# Current Focus

Objectives

- Propose an improved folder/module structure for src/server/auth following professional, domain-oriented conventions.
- Recommend renames for code constructs (interfaces, types, constants, functions, classes, files) to align with clear, consistent, industry-standard naming.
- When helpful, suggest extracting constructs into new files/folders to improve cohesion and separation of concerns.

Scope

- Only analyze and propose changes for: src/server/auth/

Constraints

- Do not modify code; only propose structure and naming changes.
- Keep proposals minimal, incremental, and reversible.
- Avoid references to non‑scoped files unless strictly necessary.

Output Format

- Suggested folder structure (tree).
- Rename suggestions: old → new with 1‑line rationale each.
- Extraction suggestions: source → target file path with brief justification.
- Risks or trade‑offs (if any).
- Short checklist to implement changes safely.

Things to Avoid

- No behavioral changes.
- No framework or library upgrades.
- No cross‑feature refactors beyond src/server/auth/.
- No barrel files.
- No index files.
- No re-exports.

Last updated: 2025-10-15
