---
apply: manually
---

# General Style Guide

## Purpose

Enforce consistent, maintainable style for all code and files in this project.  
See [TypeScript Instructions](typescript-summary.md) for strict typing rules.

## React & Component Style

- Export explicit prop and return types for all components/hooks.
- Prefer function components; avoid class components.
- Type all event handlers.
- Separate validation, transformation, and side-effects into dedicated functions.

## File & Module Organization

- File length ≤200 lines; split large files by feature/domain.
- Avoid dumping grounds (e.g., `utils.ts`); prefer small, named modules.
- Avoid barrel files; prefer explicit imports.
- Use type-only imports for all type imports.
- Mark constants with `as const` for literal types.
- Prefer named exports; avoid default exports to aid tree-shaking and refactors.

_Last updated: 2025-10-05_
