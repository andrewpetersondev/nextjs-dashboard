---
apply: always
---

# Markdown Documentation Instructions

## Purpose

Ensure all markdown docs are accurate, consistent, and follow project standards.

---

## General Rules

- Use clear, descriptive headings and section titles.
- Keep files ≤200 lines; split by topic if needed.
- Use standard markdown syntax; avoid custom extensions.
- Format with biome; run `pnpm biome check <file>` before merging.
- Validate all code snippets for correctness and compatibility.

---

## Structure & Content

- Start with a summary or purpose section.
- Organize content by topic; use bullet points and numbered lists for clarity.
- Reference related instruction files and modules where relevant.
- Document update date and author in the footer.

---

## Review Checklist

- Confirm formatting and linting with biome.
- Validate links and references to code and instruction files.
- Ensure style, structure, and naming follow [Coding Style Instructions](./coding-style.md).
- Check for outdated patterns or obsolete references.
- Document changes in the file header.

---

## Responsibilities

- Assign a maintainer for documentation review.
- All contributors must update relevant docs when making code changes.
- Use pull requests for doc updates; require review from at least one maintainer.

---

## References

- [Coding Style Instructions](./coding-style.md)
- [TypeScript Instructions](./coding-style.md)
- [Result & Error Instructions](./result-error.md)
- [Structure & Architecture](./structure-architecture.md)

---

_Last updated: YYYY-MM-DD_
