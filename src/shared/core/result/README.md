# Result pattern

A small, type-safe success/error wrapper used across the codebase to make
failure explicit in return types instead of relying on `throw` / `try`-`catch`.

## Philosophy

`Result<TValue, TError>` is a discriminated union of `Ok` (success) and `Err`
(failure). Callers narrow on the `ok` flag, which forces the error case to be
handled:

- **Exhaustiveness** — TypeScript makes you check `ok` before reaching `.value`
  or `.error`.
- **Discoverability** — a function's return type states which errors it can
  produce.
- **Safety** — no unhandled exceptions from forgotten `catch` blocks.

## API

This module deliberately exposes a minimal surface. There is no barrel file —
import directly from the specific module:

| Import                            | From                                | Purpose                                                           |
| --------------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `Ok`, `Err`, `unwrapOrNull`       | `@/shared/core/result/result`       | Construct results; non-throwing unwrap to `value \| null`.        |
| `Result`, `OkResult`, `ErrResult` | `@/shared/core/result/result.dto`   | Types.                                                            |
| `safeExecute`                     | `@/shared/core/result/safe-execute` | Run an async thunk, converting thrown values into a logged `Err`. |

### Creating and reading results

```ts
import { makeUnexpectedError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";

const success = Ok(42);
const failure = Err(makeUnexpectedError(cause, { message: "Something failed" }));

// Narrow on the `ok` discriminant — there are no isOk/isErr helpers.
if (result.ok) {
  // result.value is available here
} else {
  // result.error is available here (always an AppError)
}
```

> `Err` accepts an `AppError` instance (a class built via the error factories in
> `@/shared/core/errors`), **not** a plain `{ code, message }` object.

### safeExecute

```ts
import { safeExecute } from "@/shared/core/result/safe-execute";

const result = await safeExecute(() => myDomainOperation(), {
  logger,
  message: "Failed to fetch user data",
  operation: "GetUserData",
});
```

A resolved `Ok`/`Err` is returned verbatim with no logging. A _thrown_ `AppError`
is logged and returned as-is; any other thrown value is normalized to an
`unexpected` `AppError` and logged.

## Tooling

- `pnpm biome:check` — lint/format diagnostics.
- `pnpm typecheck` — TypeScript checks.
