# Composition Validators

This folder contains utilities for composing and branding generic validation logic. All code is strictly isomorphic,
tree-shakable, and side-effect free.

## Contents

- Compositional helpers for combining primitive validators.
- Branding utilities for type-safe validation.

## Guidelines

- Only generic composition logic; no business/domain-specific checks.
- All exports have explicit parameter and return types.
- Treat inputs as immutable; avoid in-place mutations.
- Use type-only imports; avoid barrel files.
- Document all public functions/types with TSDoc.

## How to Extend

- Add new composition utilities only if they are generic and reusable.
- For domain-specific composition, use `shared/domain`.

## References

- [Coding Style Instructions](../../../.github/instructions/coding-style.instructions.md)
- [TypeScript Instructions](../../../.github/instructions/typescript.instructions.md)
