---
apply: always
---

# General Style Guide

Purpose: Enforce consistent, maintainable style for all code and files in this project.  
See [TypeScript Instructions](./typescript.md) for strict typing rules.  
Review [Structure & Architecture](./structure-architecture.md) when available.

---

## Coding Style

- Single-purpose functions; ≤50 lines.
- Parameters ≤4; use options object for optional params.
- Extract predicates/utilities; avoid deep nesting and excessive branching.
- Prefer standard utility types; avoid custom wrappers when not needed.
- All exported symbols must have explicit types.
- Avoid `any` except for isolated, documented test cases.
- Use biome for formatting and linting; sort object's properties by keys.
- Extract magic numbers/strings to named constants.
- Use descriptive names; avoid abbreviations.

---

## React & Component Style

- Export explicit prop and return types for all components/hooks.
- Prefer function components; avoid class components.
- Type all event handlers; avoid implicit `any`.
- Separate validation, transformation, and side-effects into dedicated functions.

---

## File Organization

- File length ≤200 lines; split large files by feature/domain.
- Avoid dumping grounds (e.g., `utils.ts`); prefer small, named modules.
- Avoid barrel files; prefer explicit imports.
- Use type-only imports for all type imports.
- Mark constants with `as const` for literal types.

---

## Module & Project Structure

- Organize modules by feature/domain.
- Treat inputs as immutable; use readonly arrays/tuples.
- Avoid in-place mutations; prefer spreads or `structuredClone`.
- Review all code for type coverage and explicitness before merging.

---

## Tooling

- Use biome for formatting and linting.

---

## Review Checklist

- Confirm strict TypeScript settings and explicit types.
- Validate file/module organization by feature/domain.
- Ensure all code follows style, naming, and immutability rules.
- Reference TypeScript and architecture instructions for additional requirements.
