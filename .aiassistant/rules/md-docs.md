---
apply: off
patterns: src/**/*.md, docs/**/*.md
---

# Markdown Docs

## Purpose

- Keep docs minimal and accurate.

## Rules

- Update docs alongside code changes.
- Use standard Markdown; avoid custom syntax.
- Prefer bullets and short sections.
- Ensure examples/snippets are valid.
- Auto-format with Prettier.

## Low‑Token Playbook (Docs)

- Summarize diffs instead of restating whole files; link to code paths.
- Request only the sections that changed when asking the assistant to review.
- Batch multiple small doc updates into one edit.
