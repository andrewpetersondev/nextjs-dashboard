# Domain-Level Validation Primitives

This folder contains generic domain-level validation primitives, such as enums and periods, without business-specific
logic. All code is strictly isomorphic, tree-shakable, and side-effect free.

## Contents

- Generic enum validation.
- Generic period validation.

## Guidelines

- Only generic domain primitives; no business/domain-specific checks.
- All exports have explicit parameter and return types.
- Treat inputs as immutable; avoid in-place mutations.
- Use type-only imports; avoid barrel files.
- Document all public functions/types with TSDoc.

## How to Extend

- Add new domain primitives only if they are generic and reusable.
- For business/domain-specific validation, use `shared/domain`.

## References

- [Coding Style Instructions](../../../.github/instructions/coding-style.instructions.md)
- [TypeScript Instructions](../../../.github/instructions/typescript.instructions.md)
