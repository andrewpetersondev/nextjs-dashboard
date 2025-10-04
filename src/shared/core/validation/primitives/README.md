# Primitive Validators

This folder contains basic, generic validation utilities for numbers, UUIDs, and value checks. All code is strictly
isomorphic, tree-shakable, and side-effect free.

## Contents

- Number validation.
- UUID validation.
- Generic value checks.

## Guidelines

- Only generic primitive validation logic; no business/domain-specific checks.
- All exports have explicit parameter and return types.
- Treat inputs as immutable; avoid in-place mutations.
- Use type-only imports; avoid barrel files.
- Document all public functions/types with TSDoc.

## How to Extend

- Add new primitive validators only if they are generic and reusable.
- For business/domain-specific validation, use `shared/domain`.

## References

- [Coding Style Instructions](../../../.github/instructions/coding-style.instructions.md)
- [TypeScript Instructions](../../../.github/instructions/typescript.instructions.md)
