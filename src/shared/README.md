# Shared Folder

This folder contains generic, reusable modules and utilities for both server and client code. All code is designed to be
isomorphic, tree-shakable, and side-effect free unless otherwise noted.

## Structure

- `config/`: Environment and configuration helpers.
- `core/`: Generic types, error/result modeling, validation, and branding utilities.
- `domain/`: Domain-specific types, brands, and validators.
- `forms/`: Shared form logic, errors, field types, and mapping.
- `http/`: HTTP header utilities and types.
- `i18n/`: Internationalization helpers and locale data.
- `logging/`: Logging utilities and types.
- `money/`: Currency conversion and money types.
- `routes/`: Shared route definitions.
- `ui/`: UI tokens, classes, and pagination helpers.
- `utils/`: Generic array, date, object, and string utilities.

## Guidelines

- Only generic or domain-level logic belongs here; avoid feature-specific or business logic outside `domain/`.
- All exports must have explicit parameter and return types.
- Treat inputs as immutable; avoid in-place mutations.
- Use type-only imports and avoid barrel files.
- Document all public functions/types with TSDoc.
- Follow strict TypeScript and coding style instructions.

## How to Extend

- Add new modules only if they are generic, reusable, and isomorphic.
- For business/domain-specific logic, use `shared/domain`.

## References

- [Coding Style Instructions](../../.github/instructions/coding-style.instructions.md)
- [TypeScript Instructions](../../.github/instructions/typescript.instructions.md)
