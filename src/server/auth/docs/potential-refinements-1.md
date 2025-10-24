Yes, **removing `FormResult` and using `Result` directly makes excellent sense** and aligns with industry best practices. Let me detail why and what refinements follow:

---

## Why This Is the Right Move

### 1. **Eliminates Unnecessary Type Wrapping**

```typescript
// Before: Double-wrapped
FormResult<TPayload> = Result<FormSuccess<TPayload>, AppError>;

// After: Single, clear type
Result<FormSuccess<TPayload>, AppError>;
```

`FormResult` is just an alias that adds cognitive overhead without semantic benefit.

### 2. **Aligns with Railway-Oriented Programming (ROP)**

Industry standard pattern: **single discriminated union** for all operations, not domain-specific variants.

### 3. **Reduces Boilerplate & Adapter Functions**

- `mapResultToFormResult()` becomes unnecessary
- Actions don't need special mapping logic
- Consistency across all Result-producing operations (services, validators, actions)

### 4. **Improves Composability**

Direct `Result` chaining via `flatMap()`, `map()`, `pipeAsync()` without intermediate conversion layers.

---

## Recommended Refinements (Best Practice)

### **Refinement 1: Standardize on a Single Result Return Type**

**For all operations** (services, validators, actions, repositories):

```typescript
// Unified across the entire codebase
type Operation<T> = Promise<Result<T, AppError>>;

// OR in your case (since AppError is the standard error):
type AuthOperation<T> = Promise<Result<T, AppError>>;
```

**Why**: Single, predictable return type across all layers eliminates mental context-switching.

---

### **Refinement 2: Create a Response Success Type Hierarchy**

Instead of generic `FormSuccess<TPayload>`, use **explicit domain types**:

```typescript
// shared/core/result/result-types.ts

/** Marker for successful operations */
export interface OperationSuccess<T> {
  readonly data: T;
  readonly message?: string;
}

/** Session establishment success */
export interface SessionSuccess {
  readonly user: SessionUser;
  readonly sessionToken?: string;
}

/** Signup/login success */
export interface AuthSuccess {
  readonly user: AuthUserTransport;
  readonly message?: string;
}

// Usage in actions:
type LoginResult = Result<AuthSuccess, AppError>;
```

**Why**:

- Explicit success payloads are self-documenting
- Callers know exactly what `result.value` contains
- Better IDE intellisense

---

### **Refinement 3: Create Action Response Mappers**

Replace `mapResultToFormResult()` with **domain-aware mappers**:

```typescript
// server/auth/application/mappers/auth-result.mapper.ts

export function toActionResponse<TField extends string>(
  result: Result<AuthSuccess, AppError>,
  params: {
    fields: readonly TField[];
    raw: Record<string, unknown>;
    redactFields?: readonly TField[];
  },
): Result<AuthSuccess, AppError> {
  // If error lacks fieldErrors, enrich it
  if (!result.ok && !result.error.details?.fieldErrors) {
    return Err({
      ...result.error,
      details: makeAppErrorDetails({
        fieldErrors: createEmptyDenseFieldErrorMap(params.fields),
      }),
    });
  }
  return result;
}

// Usage in action:
const response = toActionResponse(sessionResult, { fields, raw });

if (!response.ok) {
  return response; // Client consumes directly, knows it has AppError with fieldErrors
}
```

**Why**:

- Mapper responsibility is clear (enrich errors for UI, not convert types)
- Return type is still `Result`, not a separate type
- Clients handle single union type

---

### **Refinement 4: Standardize Action Signatures**

```typescript
// All server actions follow this pattern:
export async function loginAction(
  _prevState: Result<AuthSuccess, AppError> | null,
  formData: FormData,
): Promise<Result<AuthSuccess | null, AppError>> {
  // Validation
  const validated = await validateFormGeneric(...);
  if (!validated.ok) return validated; // Already Result<never, AppError>

  // Service call
  const result = await executeAuthPipeline(...);

  // Enrich with UI-safe errors
  return toActionResponse(result, { fields, raw });
}
```

**Why**:

- Predictable signature for all actions
- No special `FormResult` type in the action signature
- Clients know they always get `Result`

---

### **Refinement 5: Migrate validateFormGeneric() Return Type**

Currently returns `FormResult<TIn>`, should return plain `Result`:

```typescript
// Before
export async function validateFormGeneric<TIn, TFieldNames extends keyof TIn & string>(
  formData: FormData,
  schema: z.ZodType<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateOptions<TIn, TFieldNames> = {},
): Promise<FormResult<TIn>> { ... }

// After
export async function validateFormGeneric<TIn, TFieldNames extends keyof TIn & string>(
  formData: FormData,
  schema: z.ZodType<TIn>,
  allowedFields?: readonly TFieldNames[],
  options: ValidateOptions<TIn, TFieldNames> = {},
): Promise<Result<TIn, AppError>> { ... }
```

**Why**: Removes the last vestiges of the special-case type

---

### **Refinement 6: Enrich AppError at Source, Not in Actions**

Your service layer already does `toFormAwareError()` — **lean into this**:

```typescript
// In AuthUserService.login/signup - already correct!
catch (err: unknown) {
  const appError = mapRepoErrorToAppResult<AuthUserTransport>(err, context);
  return appError.ok
    ? appError
    : Err(
        toFormAwareError(appError.error, {
          fields: ["email", "password"] as const,
        }),
      );
}

// In action - now just pass through:
const sessionResult = await executeAuthPipeline(input, service.login.bind(service));

if (!sessionResult.ok) {
  // Error ALREADY has fieldErrors from service
  // No manual mapping needed
  return sessionResult;
}
```

**Why**: Single responsibility — service enriches for form UI, action just orchestrates

---

### **Refinement 7: Consolidate Error Metadata**

Move all form-field error mappings to **one source**:

```typescript
// server/auth/domain/errors/form-error-mappings.ts
// Single place where "email_conflict" → field + message lives

export const FORM_ERROR_MAPPINGS = {
  email_conflict: {
    field: "email" as const,
    message: "Email already in use",
  },
  // ...
} as const;

export type FormErrorCode = keyof typeof FORM_ERROR_MAPPINGS;

// Then toFormAwareError() uses this
// AND form-errors.factory.ts uses this
// NO duplication between auth-error.logging.ts and form-errors.factory.ts
```

**Why**: Single source of truth, easier maintenance

---

## Migration Checklist

```typescript
✓ Remove @types/FormSuccess if unused
✓ Replace all FormResult<T> → Result<T, AppError>
✓ Delete mapResultToFormResult()
✓ Update validateFormGeneric() return type
✓ Update all action signatures
✓ Create toActionResponse() mapper
✓ Consolidate form error mappings
✓ Update tests to use Result union directly
✓ Remove FormResult from exports in shared/forms/core/types.ts
```

---

## Industry Alignment

| Pattern             | Your Current          | Recommended                | Industry Practice                   |
| ------------------- | --------------------- | -------------------------- | ----------------------------------- |
| **Result union**    | Nested types          | Single `Result<T, E>`      | ✅ Standard (Rust, TypeScript libs) |
| **Form errors**     | Separate `FormResult` | Part of `AppError.details` | ✅ Error enrichment model           |
| **Action response** | Manual mapping        | Pass-through `Result`      | ✅ Minimal adaptation               |
| **Error source**    | Action layer          | Service layer              | ✅ Domain owns enrichment           |
| **Type wrapping**   | Double alias          | Single type                | ✅ DRY principle                    |

---

## Final Summary

**Removing `FormResult` is the right call** because:

1. **Eliminates cognitive load** — one union type, not two
2. **Improves composability** — direct `Result` chaining works everywhere
3. **Reduces adapter functions** — no need for `mapResultToFormResult`
4. **Aligns with ROP** — industry-standard error handling pattern
5. **Simplifies action signatures** — predictable, testable interfaces

The refinements above take it further by **establishing a consistent Result-first architecture across all layers**, which is what mature TypeScript/Node.js projects do (e.g., fp-ts, neverthrow, Hono).
