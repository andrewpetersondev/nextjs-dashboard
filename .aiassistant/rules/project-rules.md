---
apply: always
---

# Project Rules & Activation Schema

## Purpose

1. Define governance for AI rule files and the activation schema used by this project.
2. Centralize shared guidance; other rule files must only add deltas and link here.

## Precedence

- Top-level governance for all rule files; domain-specific rules must link here and only add deltas.
- Authoring and hygiene conventions are defined below (Authoring Rules).

## Activation Schema (Frontmatter)

1. apply: one of [always | manually | off].
2. patterns: optional array of glob patterns enabling auto-activation when matching file paths.
3. exclude: optional array of glob patterns to prevent activation (takes precedence over patterns).
4. tasks: optional array of task labels to activate on specific work items.
5. Do not use vendor-specific features like "by model decision".

Notes:

- Activation metadata is advisory; you can still toggle rules explicitly.
- Prefer patterns/tasks for credit efficiency to avoid broad, unnecessary activations.

## Governance Rules

1. Each rule file must include: Title, Purpose, Audience, Precedence links, Rules (numbered), Changelog, Last updated (ISO).
2. Avoid duplication: centralize shared guidance here; cross-link elsewhere.
3. Use “must/must not” language; make rules atomic and testable.
4. Keep files ≤ 200 lines and domain-focused; split if scope grows.
5. Update Changelog and Last updated on every edit; add status if deprecating.

## Authoring Rules

- Frontmatter:
  - apply: one of [always | manually | off] (default: manually)
  - patterns/exclude/tasks: narrow activation by file globs or task labels
- Structure:
  - Sections in order: Title → Purpose → Audience → Precedence → Rules → References (optional) → Changelog → Low‑Token Playbook → Last updated
- Style:
  - Use numbered rules with “must/must not” language
  - Keep examples short and reference real code paths
  - Avoid vendor-specific instructions; keep rules model/tool agnostic
- Maintenance:
  - Bump Last updated (ISO) and add a Changelog entry with owner on each edit
  - Prefer editing this file for shared guidance rather than duplicating text in other rules

## Low‑Token Playbook (Global)

- Activate rules narrowly: use patterns/tasks; avoid apply: always unless essential.
- Batch changes per file/feature and request a single edit; avoid iterative micro-prompts.
- Prefer structural tools: get_file_structure, search_project, rename_element; avoid opening entire files.
- Ask for exact paths, symbols, and line ranges to minimize back‑and‑forth.
