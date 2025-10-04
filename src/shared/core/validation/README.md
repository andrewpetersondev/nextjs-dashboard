# Validation Module

This folder contains generic, reusable validation utilities for the project. All code is strictly isomorphic,
tree-shakable, and side-effect free.

## Structure

- `primitives/`: Basic validators for numbers, UUIDs, and generic value checks.
- `composition/`: Utilities for composing and branding validation logic.
- `domain/`: Generic domain-level primitives (e.g., enums, periods) without business-specific logic.

## Guidelines

- Only generic validation logic belongs here. No business/domain-specific checks.
- All exports must have explicit parameter and return types.
- Treat inputs as immutable; avoid in-place mutations.
- Use type-only imports and avoid barrel files.
- Document all public functions/types with TSDoc.

## How to Extend

- Add new validators only if they are generic and reusable.
- For business/domain-specific validation, use `shared/domain`.

## References

- [Coding Style Instructions](../../../.github/instructions/coding-style.instructions.md)
- [TypeScript Instructions](../../../.github/instructions/typescript.instructions.md)
