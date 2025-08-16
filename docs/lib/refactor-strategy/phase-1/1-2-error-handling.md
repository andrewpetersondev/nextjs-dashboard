## 1.2 Enhanced Error System (overview)

A small, consistent error model that pairs with the Result pattern and makes boundary handling predictable.

What you get

- Structured BaseError with machine-friendly code, HTTP status, timestamp, and context
- Domain error subclasses for common categories (validation, not-found, auth, conflicts, infra)
- Helpers to normalize unknown errors, convert to Result, and map to HTTP responses
- Ergonomic wrappers to safely run sync/async code without leaking exceptions

Why it matters

- Removes ad‑hoc error handling and magic strings across the codebase
- Encodes HTTP mapping at the source (statusCode on the error)
- Keeps internal logic throw‑friendly when appropriate, while boundaries remain exception‑safe
- Makes logging/observability simpler via toJSON and structured context

---

Where is the code?

- Base class: docs/lib/refactor-strategy/code/base.error.ts
- Domain errors: docs/lib/refactor-strategy/code/domain.errors.ts
- Helpers: docs/lib/refactor-strategy/code/error-helpers.ts
- Import paths in app code (via tsconfig aliases):
  - src/lib/errors/base.error
  - src/lib/errors/domain.errors
  - src/lib/errors/error-helpers
- This page focuses on concepts. For full details, read the source and inline comments.

---

API surface (quick reference)

- BaseError
  - fields: code, statusCode, message, context, timestamp
  - methods: toJSON()
- Domain errors
  - ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError
  - DatabaseError, CacheError, CryptoError
- Helpers
  - asAppError(e: unknown): BaseError
  - errorToResult<T>(e: unknown): Result<T, BaseError>
  - safeTry<T>(fn: () => T): Result<T, BaseError>
  - safeFromPromise<T>(p: Promise<T>): Promise<Result<T, BaseError>>
  - errorToHttp(e: unknown): { status: number; body: { error: { code; message; context? } } }

Notes

- code is a stable identifier for clients and logs. Keep it consistent.
- statusCode travels with the error so HTTP mapping at the boundary is trivial.
- context carries structured diagnostic data (ids, invariants). Do not include secrets.
- cause is preserved by the BaseError constructor for debuggability.

---

Mental model (at a glance)

[Throw domain errors] in core to stop execution and preserve stack
  | asAppError converts unknown exceptions to a safe BaseError subtype
  | errorToResult wraps unknowns into Result for composition
At boundaries (HTTP/server actions): errorToHttp maps BaseError to stable wire shape

---

Tiny example (only for orientation)

```ts
import { NotFoundError } from "@/lib/errors/domain.errors";
import { errorToHttp } from "@/lib/errors/error-helpers";

export function ensureFound<T>(v: T | null, id: string): T {
  if (v == null) throw new NotFoundError("User not found", { userId: id });
  return v;
}

export function toHttp(e: unknown) {
  const { status, body } = errorToHttp(e);
  return { status, json: body };
}
```

For full definitions and more examples, see the code files listed above.

---

Usage patterns

- In business logic:
  - Throw domain errors to short‑circuit and preserve stack traces.
  - Or return Result<T, BaseError | SpecificError> if you are already in Result land.
- At boundaries (server actions, route handlers):
  - Wrap code in safeFromPromise/safeTry to avoid leaking raw exceptions.
  - Convert to HTTP with errorToHttp or to an ActionResult with your Result adapter.
- Mapping policy:
  - asAppError provides a safe default for unknown exceptions; refine mapping where you have context.

---

Migration checklist

- Generic Error -> Domain error
  - Replace `throw new Error("x")` with a specific domain error and structured context
- try/catch -> safeTry/safeFromPromise
  - Use helpers at boundaries; keep internal code clean
- Custom HTTP mapping -> errorToHttp
  - Remove bespoke status selection logic; rely on BaseError.statusCode
- String/boolean error returns -> Result with BaseError
  - Prefer returning Result<T, BaseError> so callers can map/bimap as needed

---

Anti‑patterns to avoid

- Mixing thrown exceptions and Result returns from the same function. Pick one per layer.
- Using generic Error for domain failures; you lose code/status semantics.
- Storing sensitive information in error context.
- Swallowing errors without logging; rely on toJSON and centralized logging.

---

Testing tips

- BaseError: preserves name, message, code, statusCode, timestamp, context; toJSON serializes correctly
- Domain errors: inherit from BaseError and expose correct code/statusCode
- asAppError: passes through BaseError; wraps Error/unknown as DatabaseError
- safeTry/safeFromPromise: Ok on success, Err on failure; no thrown exceptions
- errorToHttp: status equals error.statusCode; body contains code/message/context

---

Acceptance for this section

- BaseError implemented with code/statusCode/context/cause/timestamp and toJSON
- Domain error subclasses created for validation, not‑found, unauthorized, forbidden, conflict, database, cache, crypto
- Helpers implemented: asAppError, errorToResult, safeTry, safeFromPromise, errorToHttp
- Examples and boundary usage documented; tests cover happy/error paths
