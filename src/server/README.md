# Server Folder

This folder contains all server-side modules, logic, and integrations for the project. Code here is intended for Node.js
execution only and must not be imported into client/UI modules.

## Structure

- `auth/`: Authentication logic, session management, and user authorization.
- `config/`: Server-specific configuration and environment helpers.
- `customers/`, `invoices/`, `revenues/`, `users/`: Feature-specific server logic, repositories, and data access.
- `db/`: Database connection, schema, and migration helpers.
- `errors/`: Server error handling, normalization, and guards.
- `events/`: Event handling and dispatching.
- `forms/`: Server-side form validation and processing.
- `logging/`: Structured logging utilities for server operations.
- `repository/`: Data repositories and persistence logic.

## Guidelines

- Only server-side logic belongs here; do not include client/UI code.
- All exports must have explicit parameter and return types.
- Treat inputs as immutable; avoid in-place mutations.
- Use type-only imports and avoid barrel files.
- Document all public functions/types with TSDoc.
- Follow strict TypeScript and coding style instructions.

## How to Extend

- Add new modules only if they are server-specific and reusable.
- For shared logic, use `shared/`; for UI, use `ui/`.

## References

- [Coding Style Instructions](../../.github/instructions/coding-style.instructions.md)
- [TypeScript Instructions](../../.github/instructions/typescript.instructions.md)
