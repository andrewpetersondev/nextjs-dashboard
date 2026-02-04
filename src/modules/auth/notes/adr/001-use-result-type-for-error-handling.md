# ADR 001: Use Result Type for Error Handling

## Status

Accepted
 
## Context

Traditional error handling in TypeScript often relies on `try-catch` blocks and throwing exceptions. However, exceptions
are often "invisible" in type signatures, leading to unhandled runtime errors and making it difficult to trace error
propagation across layers (Presentation, Application, Domain, Infrastructure).

In the Auth module, errors can originate from multiple sources (database, validation, crypto, session) and need to be
handled consistently or mapped to UI-friendly messages.

## Decision

We will use a functional approach to error handling by using a `Result<T, E>` type (specifically `Ok<T>` and `Err<E>`)
instead of throwing exceptions for expected domain and infrastructure errors.

- All Use Cases, Repositories, and DAL functions must return a `Result` type.
- Errors are represented by the `AppError` entity, which provides structure (cause, message, metadata).
- `safeExecute` utility should be used at boundaries to catch unexpected exceptions and convert them into
  `Err(AppError)`.
- Use `if (!result.ok)` patterns to handle errors explicitly.

## Consequences

### Positive

- **Type Safety**: Errors are part of the function signature, making them impossible to ignore.
- **Explicit Flow**: The control flow for error paths is as clear as the success paths.
- **Improved Traceability**: Errors can be enriched with context as they bubble up through the layers.
- **Consistency**: All layers use the same mechanism for communicating failure.

### Negative

- **Verbosity**: Requires more boilerplate code (explicit checks) compared to `try-catch`.
- **Learning Curve**: Developers familiar with exceptions may need time to adapt to the functional `Result` pattern.
- **Nesting**: Deep chains of operations can lead to nested `if` statements if not handled with monadic utilities (
  though we prefer explicit checks for clarity in this project).
