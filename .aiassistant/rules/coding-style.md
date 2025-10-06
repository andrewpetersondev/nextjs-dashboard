---
apply: always
---

# General Style Guide

## Purpose

Enforce consistent, maintainable style for all code and files in this project.  
See [TypeScript Instructions](./typescript.md) for strict typing rules.  
Review [Structure & Architecture](./structure-architecture.md) when available.

## Scope & Audience

- Audience: all engineers and AI contributors.
- Applies to: source files in all layers and test code.
- Contexts: authoring and review; enforced by biome and CI style checks.

## Coding Style

- Single-purpose functions; ≤50 lines.
- Parameters ≤4; use options object for optional params.
- Prefer standard utility types; avoid unnecessary custom wrappers.
- Extract predicates/utilities; avoid deep nesting and excessive branching.
- All exported symbols must have explicit types.
- Avoid `any` except for isolated, documented test cases.
- Use biome for formatting and linting; sort object properties by key.
- Extract magic numbers/strings to named constants.
- Use descriptive names; avoid abbreviations.
- Target cyclomatic complexity ≤10; avoid nesting deeper than 3 levels; refactor into helpers when exceeded.

## React & Component Style

- Export explicit prop and return types for all components/hooks.
- Prefer function components; avoid class components.
- Type all event handlers; avoid implicit `any`.
- Separate validation, transformation, and side-effects into dedicated functions.

## File & Module Organization

- File length ≤200 lines; split large files by feature/domain.
- Avoid dumping grounds (e.g., `utils.ts`); prefer small, named modules.
- Avoid barrel files; prefer explicit imports.
- Use type-only imports for all type imports.
- Mark constants with `as const` for literal types.
- Prefer named exports; avoid default exports to aid tree-shaking and refactors.

## Tooling

- Use biome for formatting and linting typescript files.

## Review Checklist

- Confirm strict TypeScript settings and explicit types.
- Validate file/module organization by feature/domain.
- Ensure all code follows style, naming, and immutability rules.
- Reference TypeScript and architecture instructions for additional requirements.
- Check complexity and nesting constraints; prefer named exports.

_Last updated: 2025-10-05_
