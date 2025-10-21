---
apply: off
---

# Focus Template (Attach and fill in)

Purpose

- Provide a lightweight, reusable template to guide tightly scoped reviews or proposals without writing code.

How to use

- Duplicate this file when you need a focused analysis. Set apply: manually and tailor the sections below.
- Narrow scope using patterns or tasks in the frontmatter when applicable.

Objectives (edit these)

- <Describe the specific goal of the focus, e.g., improve structure and naming for a module>

Scope (edit this)

- <Path or glob to limit analysis, e.g., src/server/auth/>

Constraints

- Do not modify code; only propose structure and naming changes unless explicitly allowed.
- Keep proposals minimal, incremental, and reversible.
- Avoid references outside the declared scope unless strictly necessary.

Output Format

- Proposed folder structure (tree).
- Rename suggestions: old → new with 1‑line rationale each.
- Extraction suggestions: source → target file path with brief justification.
- Risks or trade‑offs (if any).
- Short checklist to implement changes safely.

Things to Avoid

- No behavioral changes unless the focus explicitly includes them.
- No framework or library upgrades.
- No barrel files, index files, or re-exports.

Precedence

- See: project-rules.md (governance, activation)
- See: structure-summary.md (architecture and boundaries)
- See: typescript-rules.md (coding/style constraints)

Low‑Token Playbook (Focus)

- Ask for current file structure with get_file_structure before proposing moves.
- Batch suggestions in one response; avoid iterative micro-updates.
- Reference exact paths and keep examples minimal.
