---
apply: always
---

# Markdown Documentation Instructions

## Purpose

Ensure all markdown docs are accurate, consistent, and follow project standards.

## General Rules

- Use clear, descriptive headings and section titles.
- Start each doc with a summary or purpose section.
- Use standard markdown syntax; avoid custom extensions.
- Organize content by topic, using bullet or numbered lists for clarity.
- All snippets must be valid and compatible (test/copy-paste where possible).
- Format with prettier; IDE should auto-format on save.

## Structure & Content

- Start with a summary or purpose section.
- Organize content by topic; use bullet points and numbered lists for clarity.
- Reference relevant instruction files and modules where needed.
- Include clear linking to any related rule or doc files.
- Document footer includes last updated date.
- Cross-reference related topics via inline markdown links.

## Review Checklist

- Confirm formatting and linting with biome.
- Validate links and references to code and instruction files.
- Ensure style, structure, and naming follow [Coding Style Instructions](./coding-style.md).
- Check for outdated patterns or obsolete references.
- Document changes in the file header.
- Run docs:lint and docs:links in CI; fix any broken links before merge.

## Ownership & Cadence

- Each doc has an owner and must include:
    - Summary, Owner, Last updated.
- Quarterly review required; stale docs must be updated or archived.

_Last updated: 2025-10-05_
