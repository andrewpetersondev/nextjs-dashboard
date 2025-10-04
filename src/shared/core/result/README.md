# Result Utilities

Strict, composable utilities for modeling operation results, error handling, and functional composition in TypeScript.
Designed for Next.js server and shared code, following strict TypeScript and coding style rules.

## Modules

- `result.ts`: Core `Result<T, E>` type and constructors (`Ok`, `Err`). Discriminated union with `ok` flag.
- `result-async.ts`: Async helpers for wrapping promises and async thunks in `Result`.
- `result-collect.ts`, `result-collect-iter.ts`: Aggregate multiple results into a single result, supporting both eager
  and lazy collection.
- `result-map.ts`, `result-map-async.ts`: Map over result values synchronously or asynchronously. Includes error mapping
  and identity-preserving variants.
- `result-match.ts`: Pattern matching utilities for handling result cases, including safe unwrapping.
- `result-sync.ts`: Synchronous helpers for try/catch and predicate-based result creation.
- `result-tap.ts`, `result-tap-async.ts`: Side-effect utilities for Ok/Err branches, with safe variants for error
  normalization.
- `result-transform.ts`, `result-transform-async.ts`: Transform result values or errors, including flatMap chaining.
- `error.ts`: Shared error types (`AppError`, `ErrorLike`) and normalization utilities.

## Key Features

- **Discriminated Unions:** All results use `{ ok: true, value } | { ok: false, error }` for strict type safety.
- **Error Normalization:** Unknown errors are mapped to a safe, JSON-serializable `AppError` shape.
- **Immutability:** Inputs and outputs are treated as immutable; readonly arrays/tuples are used.
- **TypeScript Strictness:** All exports have explicit types; generics are constrained.
- **Async Support:** Helpers for wrapping async functions and promises, with custom error mapping.
- **Aggregation:** Collect multiple results, short-circuiting on first error.
- **Side-Effects:** Tap utilities for Ok/Err branches, with safe error handling.

## Usage Examples

### Basic Result

```typescript
import {Ok, Err, type Result} from './result';

function parseNumber(input: string): Result<number, string> {
    const n = Number(input);
    return isNaN(n) ? Err('Invalid number') : Ok(n);
}
```

### Async Wrapping

```typescript
import {fromPromise} from './result-async';

const result = await fromPromise(fetchData(), (e) => ({message: 'Fetch failed', ...e}));
```

### Aggregation

```typescript
import {collectAll} from './result-collect';

const results: Result<number, string>[] = [Ok(1), Ok(2), Err('fail')];
const aggregated = collectAll(results); // Err('fail')
```

### Error Normalization

```typescript
import {normalizeUnknownError} from './error';

try {
    // risky code
} catch (e) {
    const safeError = normalizeUnknownError(e);
}
```

## Conventions

- Functions are single-purpose and ≤50 lines.
- Parameters ≤4; use options object for optional params.
- No in-place mutations; treat inputs as immutable.
- Type-only imports for types.
- Errors are normalized and safe for client consumption.
- See `WEAKNESSES.md` for known limitations.

## Testing

- Use explicit types in tests.
- Prefer narrow fixtures and discriminated unions.
- Use `@ts-expect-error` for intentional type failures.

