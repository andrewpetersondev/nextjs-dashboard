# Phase 1

## 1.1 Result Pattern (core overview)

Goal: predictable, type-safe success/error handling without throwing exceptions in core logic. Keep control-flow explicit and composable; convert to boundary shapes only at the edges.

What you get

- A tiny, immutable Result<T, E> union (Ok | Err)
- Composable helpers: map, chain, mapError, bimap
- Pattern matching: match/fold; side-effects: tap/tapError
- Async guards: tryCatch, fromPromise
- Collections: all

Why it matters

- Eliminates ad‑hoc throws inside core logic
- Standard shape for success/failure across lib and features
- Fewer branches; easier composition and testing
- Aligns with error system and validation (1.2, 1.3)

---

Where is the code?

- Implementation: docs/lib/refactor-strategy/code/result.ts
- Import path in app code: src/lib/core/result (via your project's tsconfig path aliases)
- This page focuses on concepts. For full details, read the source (it’s small) and the inline JSDoc.

---

API surface (quick reference)

- Types
  - Result<T, E = Error>
- Constructors
  - Ok<T>(data: T): Result<T, never>
  - Err<E>(error: E): Result<never, E>
- Narrowing & unwrapping
  - isOk, isErr, unwrap
- Transformations
  - map, chain, mapError, bimap
- Matching
  - match (aka fold)
- Side-effects
  - tap, tapError
- Async helpers
  - tryCatch, fromPromise
- Collections
  - all

Notes

- Shapes are readonly; payloads live in data (Ok) or error (Err).
- Plain TypeScript unions (no classes) keep it light and tree‑shakeable.
- Use domain errors for E wherever possible.

---

Mental model (at a glance)

[Ok]
| data -> map/chain -> more Ok
| side‑effects via tap
[Err]
| error flows unchanged through map/chain
| transform with mapError/bimap
Stop early: all(...) returns the first Err it sees

---

Tiny example (only for orientation)

```ts
import { Err, isOk, Ok, Result } from "./result.base";
import { match } from "./result.match";

function parseIntSafe(s: string): Result<number, string> {
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) ? Err("NaN") : Ok(n);
}

const r = parseIntSafe("42");
const msg = match(
  r,
  (v) => `ok:${v}`,
  (e) => `err:${e}`,
);
if (isOk(r)) console.log(r.data);
```

For more patterns (composition, async, collections), see the code comments in result.ts.

---

Interop guidance

- Use domain errors for E:
  - Validation: Result<T, ValidationError>
  - Data access/services: Result<T, NotFoundError | ConflictError>
- Boundaries (e.g., server actions): convert Result<T, unknown> to your boundary type (e.g., ActionResult) in a small adapter. Keep conversion out of core logic.
- Unknown exceptions at boundaries should be normalized via error helpers (see 1.2).

---

Migration checklist

- Throw -> Err
  - Replace `throw new X()` in core with `return Err(new X(...))`
- try/catch -> tryCatch/fromPromise
  - Synchronous blocks: tryCatch(fn, mapError?)
  - Awaited calls: fromPromise(promise, mapError?)
- Nullable -> Result
  - Replace `T | null` with `Result<T, NotFoundError>` (or specific)
- Booleans -> Result
  - Replace boolean flags with `Result<void, ValidationError>` to carry context

---

Anti‑patterns to avoid

- Creating a Result and immediately throwing unwrap errors; prefer match/isOk/isErr.
- Mixing throwing and Result returns from the same function.
- Hiding raw exceptions inside Result; map to meaningful domain errors at edges.

---

Testing tips

- Transformations preserve error branch; success branch transforms correctly
- tryCatch/fromPromise return Err on thrown/rejected and Ok on success
- all short‑circuits on first Err
- unwrap returns data for Ok and throws on Err (use sparingly at boundaries)

---

What about ActionResult?

- Use a tiny adapter at boundaries (server actions/forms) to map Result into ActionResult<T>.
- Keep the adapter out of core; keep the shape consistent (success, message, errors, data).
- See Phase 1.2 and 1.3 for error normalization and validation shaping.

---

Acceptance for this section

- Result core implemented and exported
- Helpers available: map, chain, mapError, bimap, match/fold, tap/tapError
- Async guards: tryCatch, fromPromise
- Collections: all
- Brief tests for happy/erroneous paths and short‑circuit semantics

Next: integrate with the enhanced error system (1.2) and validation framework (1.3) for a unified boundary strategy.
