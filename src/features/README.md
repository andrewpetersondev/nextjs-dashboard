# Features Folder

This folder contains feature-specific modules, including UI components, domain types, and business logic for each
application feature. Code here is intended for feature isolation and reusability within the app.

## Structure

- `auth/`: Authentication UI, logic, and session management.
- `customers/`: Customer-related components, types, and utilities.
- `invoices/`: Invoice UI, hooks, and domain logic.
- `revenues/`: Revenue feature components, domain, DTOs, and utilities.
- `users/`: User management UI and logic.

## Guidelines

- Only feature-specific logic and UI belong here; do not include shared/core/server code.
- All exports must have explicit parameter and return types.
- Treat inputs as immutable; avoid in-place mutations.
- Use type-only imports and avoid barrel files.
- Document all public functions/types with TSDoc.
- Follow strict TypeScript and coding style instructions.

## How to Extend

- Add new features as separate folders with clear boundaries.
- For shared logic, use `shared/`; for server-side code, use `server/`.

## References

- [Coding Style Instructions](../../.github/instructions/coding-style.instructions.md)
- [TypeScript Instructions](../../.github/instructions/typescript.instructions.md)
