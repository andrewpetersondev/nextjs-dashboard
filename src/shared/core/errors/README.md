# Errors Module

This folder contains generic, reusable error modeling and handling utilities for the project. All code is strictly
isomorphic, tree-shakable, and side-effect free.

## Structure

- `base-error.ts`, `domain-error.ts`: Base error types and domain error modeling.
- `error-codes.ts`, `error-messages.ts`: Generic error codes and messages.
- `error-factory.ts`: Error creation utilities.
- `error-logger.ts`, `error-logger.types.ts`, `error-logger.utils.ts`: Structured error logging.
- `error-redaction.*`: Error redaction handlers, constants, types, and utilities.
- `error-types.ts`: Generic error type definitions.
- `guards/`: Type guards for error shapes.
- `mappers/`: Utilities for mapping errors to API-safe responses.

## Guidelines

- Only generic error handling logic belongs here. No business/domain-specific error types or messages.
- All exports must have explicit parameter and return types.
- Treat inputs as immutable; avoid in-place mutations.
- Use type-only imports and avoid barrel files.
- Document all public functions/types with TSDoc.
- Never leak internal details or PII in error responses.

## How to Extend

- Add new error utilities only if they are generic and reusable.
- For business/domain-specific error handling, use `shared/domain`.

## References

- [Coding Style Instructions](../../../.github/instructions/coding-style.instructions.md)
- [TypeScript Instructions](../../../.github/instructions/typescript.instructions.md)
