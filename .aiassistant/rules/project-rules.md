---
apply: manually
---

# Project Rules & Activation Schema

## Purpose

1. Define governance for AI rule files and the activation schema used by this project.
2. Centralize shared guidance; other rule files must only add deltas and link here.

## Audience

- Rule authors, reviewers, maintainers.

## Precedence

- This file sits below always-on.md and above domain-specific rules.
- See: .junie/guidelines.md for authoring and hygiene conventions.

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

## Changelog

- 2025-10-16: Introduced activation schema and governance notes (owner: Junie).

## Last updated

2025-10-16
