# Phase 1: Foundation Infrastructure ( Result Pattern, Error Handling, & Validation ) (Days 1-3)

Start with the absolute core utilities that everything else depends on.

## 1.1 Result Pattern (`src/lib/core/`)

[result pattern](1-1-result-pattern.md)

## 1.2 Enhanced Error System (`src/lib/errors/`)

[enhanced error system](1-2-error-handling.md)

## 1.3 Validation Framework (`src/lib/validation/`)

[validation framework](1-3-validation-framework.md)

---

## Acceptance checklist (ship these by end of Phase 1)

- [ ] src/lib/core/result.ts with Result, Ok/Err, helpers (map, chain, etc.) and toActionResult adapter
- [ ] src/lib/errors/error.base.ts with BaseError
- [ ] src/lib/errors/domain.errors.ts with ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, DatabaseError, CacheError, CryptoError
- [ ] src/lib/errors/error.helper.ts with asAppError, errorToResult, safeTry, safeFromPromise, errorToHttp
- [ ] src/lib/validation core: Validator interface, compose, asValidator
- [ ] Primitive validators: StringValidator with required/min/max
- [ ] Zod adapter: ZodValidator, validateWithZod, zodToFieldErrors
- [ ] Action adapters: toActionResult and toActionValidationResult for server actions/route handlers
- [ ] Basic tests or sandboxes for happy/invalid paths and field error mapping

## Suggested file scaffold

- src/lib/core/result.ts
- src/lib/errors/error.base.ts
- src/lib/errors/domain.errors.ts
- src/lib/errors/error.helper.ts
- src/lib/validation/index.ts (export Validator, compose, asValidator)
- src/lib/validation/primitive/string.validator.ts
- src/lib/validation/zod.ts (ZodValidator, validateWithZod, zodToFieldErrors)
- src/lib/types/action-result.ts (ActionResult shape used by adapters)

## Next.js integration tips

- Use toActionResult and toActionValidationResult in server actions and route handlers to keep return shapes consistent.
- Map unknown exceptions via errorToHttp when responding from route handlers to prevent leaking stack traces.
- Prefer zod schemas at the boundary; use primitive validators for simple local checks.
