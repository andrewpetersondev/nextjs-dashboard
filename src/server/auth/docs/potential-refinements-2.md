I'll detail concrete refinements for each of those five areas, aligned with best practices.

---

## 1. Extract Error Mapping Logic

**Problem**: `toFormError()` is duplicated in both `login.action.ts` and `signup.action.ts`

```typescript
// Current (repeated in both actions)
if (!sessionResult.ok) {
  return toFormError<LoginField>({
    failureMessage:
      sessionResult.error.message || "Login failed. Please try again.",
    fieldErrors:
      sessionResult.error.details?.fieldErrors ??
      createEmptyDenseFieldErrorMap<LoginField, string>(fields),
    fields,
    raw,
  });
}
```

**Refinement**: Create an action-level result adapter

```typescript
import "server-only";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";
import type { FormResult } from "@/shared/forms/core/types";
import { toFormError } from "@/shared/forms/state/mappers/result-to-form.mapper";
import { createEmptyDenseFieldErrorMap } from "@/shared/forms/validation/error-map";

/**
 * Converts a service Result to a FormResult for action responses.
 * Centralizes error mapping logic so actions don't repeat it.
 *
 * @typeParam TField - The union of form field names
 * @typeParam TPayload - The success payload type
 * @param result - Result from service operation
 * @param params - Configuration with fields and raw form data
 * @returns FormResult ready for client consumption
 */
export function mapAuthResultToFormResult<TField extends string, TPayload>(
  result: Result<TPayload, AppError>,
  params: {
    readonly fields: readonly TField[];
    readonly raw: Record<string, unknown>;
    readonly failureMessage?: string;
    readonly redactFields?: readonly TField[];
  },
): FormResult<never> {
  const {
    fields,
    raw,
    failureMessage = "Operation failed. Please try again.",
    redactFields = ["password" as TField],
  } = params;

  if (result.ok) {
    // Success case should have been handled by action before calling this
    // This is defensive; actions redirect on success
    throw new Error(
      "mapAuthResultToFormResult called with successful result; should not reach here",
    );
  }

  const fieldErrors =
    result.error.details?.fieldErrors ??
    createEmptyDenseFieldErrorMap<TField, string>(fields);

  return toFormError<TField>({
    failureMessage: result.error.message || failureMessage,
    fieldErrors,
    fields,
    raw,
    redactFields,
  });
}
```

**Usage in actions**:

```typescript
// login.action.ts
export async function loginAction(
  _prevState: FormResult<LoginField>,
  formData: FormData,
): Promise<FormResult<LoginField>> {
  const raw = extractFormDataFields<LoginField>(formData, fields);

  // ... validation ...

  const service = createAuthUserService(getAppDb());
  const sessionResult = await executeAuthPipeline(
    input,
    service.login.bind(service),
  );

  if (!sessionResult.ok) {
    return mapAuthResultToFormResult(sessionResult, {
      fields,
      raw,
      failureMessage: "Login failed. Please try again.",
    });
  }

  // ... redirect ...
}
```

**Why this works**:

- ✅ Single source of truth for error→form mapping
- ✅ Testable in isolation
- ✅ Reduces action code by ~12 lines each
- ✅ Reusable across all auth actions (logout, demo-user, etc.)

---

## 2. Consolidate Field Constants

**Problem**: `LOGIN_FIELDS_LIST` and `SIGNUP_FIELDS_LIST` are defined separately but follow same pattern

**Refinement**: Create a centralized auth fields configuration

```typescript
import type { LoginField, SignupField } from "@/features/auth/lib/auth.schema";

/**
 * Canonical field definitions for all auth forms.
 * Single source of truth for form field configurations.
 */
export const AUTH_FORM_FIELDS = {
  login: {
    list: ["email", "password"] as const satisfies readonly LoginField[],
    redactable: ["password"] as const satisfies readonly LoginField[],
  },
  signup: {
    list: [
      "email",
      "username",
      "password",
    ] as const satisfies readonly SignupField[],
    redactable: ["password"] as const satisfies readonly SignupField[],
  },
} as const;

/**
 * Helper to get field list with type safety
 */
export function getAuthFormFields<T extends keyof typeof AUTH_FORM_FIELDS>(
  form: T,
) {
  return AUTH_FORM_FIELDS[form];
}
```

**Usage in actions**:

```typescript
// login.action.ts
import { AUTH_FORM_FIELDS } from "@/features/auth/lib/auth-fields.constants";

export async function loginAction(
  _prevState: FormResult<LoginField>,
  formData: FormData,
): Promise<FormResult<LoginField>> {
  const fields = AUTH_FORM_FIELDS.login.list;
  const raw = extractFormDataFields<LoginField>(formData, fields);

  // ... rest of action ...

  if (!sessionResult.ok) {
    return mapAuthResultToFormResult(sessionResult, {
      fields,
      raw,
      redactFields: AUTH_FORM_FIELDS.login.redactable,
    });
  }
}
```

**Why this works**:

- ✅ Single source for all field definitions
- ✅ Includes both field list AND redactable fields
- ✅ Type-safe via `satisfies`
- ✅ Easy to add new form types (mfa, password-reset, etc.)
- ✅ Metadata stays with schema, not scattered across actions

---

## 3. Session Error Enrichment

**Problem**: `establish-session.action.ts` returns generic `AppError` without `fieldErrors`

**Current**:

```typescript
export async function establishSessionAction(
  user: SessionUser,
): Promise<Result<SessionUser, AppError>> {
  // ... if error, returns plain AppError without fieldErrors
  return Err<AppError>(res.error);
}
```

**Refinement**: Enrich session errors with context-aware fieldErrors

```typescript
import "server-only";
import type { SessionUser } from "@/features/auth/sessions/session-action.types";
import { LOGGER_CONTEXT_SESSION } from "@/server/auth/domain/constants/session.constants";
import { toUnexpectedAppError } from "@/server/auth/domain/errors/app-error.factories";
import { toFormAwareError } from "@/server/auth/domain/errors/form-errors.factory";
import { setSessionToken } from "@/server/auth/domain/session/core/session";
import { serverLogger } from "@/server/logging/serverLogger";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { tryCatchAsync } from "@/shared/core/result/async/result-async";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Establishes a session for a user by setting JWT cookie.
 * Enriches session errors with fieldErrors for consistent error handling in actions.
 *
 * @param user - The user object containing `id` and `role`.
 * @returns A Result indicating success or session establishment failure.
 */
export async function establishSessionAction(
  user: SessionUser,
): Promise<Result<SessionUser, AppError>> {
  const res = await tryCatchAsync(async () => {
    await setSessionToken(user.id, user.role);
    return true as const;
  }, toUnexpectedAppError);

  const mapped: Result<SessionUser, AppError> = res.ok
    ? Ok(user)
    : Err<AppError>(res.error);

  if (!mapped.ok) {
    // Enrich session errors with form-aware fieldErrors for consistent UI handling
    const enriched = toFormAwareError(mapped.error, {
      fields: ["email", "password"] as const,
    });

    serverLogger.error(
      {
        context: LOGGER_CONTEXT_SESSION,
        error: { message: enriched.message, name: "AuthSessionError" },
      },
      "Failed to establish session",
    );

    return Err(enriched);
  }

  return mapped;
}
```

**Why this works**:

- ✅ Session errors now have `fieldErrors` like domain errors
- ✅ Actions receive consistent error structure
- ✅ Defensive: if session fails, client still gets actionable error
- ✅ Maps to auth fields (email/password) as context for UI

---

## 4. Metadata Coordination

**Problem**: Error messages split between two files:

- `auth-error.logging.ts` — `AUTH_MESSAGES` (general auth messages)
- `form-errors.factory.ts` — `FIELD_ERROR_MAP` (field-specific messages)

**Issue**: `"invalid_credentials"` could map differently in each place

**Refinement**: Unified error catalog with explicit field mapping

```typescript
import "server-only";

/**
 * Canonical catalog of all auth errors.
 * Single source of truth for error codes, messages, and field mappings.
 * Prevents duplication and inconsistency between app-error.metadata and form-errors.factory.
 */

export const AUTH_ERROR_CATALOG = {
  INVALID_CREDENTIALS: {
    code: "invalid_credentials" as const,
    message: "Invalid email or password",
    fields: ["email", "password"] as const,
    httpStatus: 401,
  },
  EMAIL_CONFLICT: {
    code: "email_conflict" as const,
    message: "Email already in use",
    field: "email" as const,
    httpStatus: 409,
  },
  USERNAME_CONFLICT: {
    code: "username_conflict" as const,
    message: "Username already in use",
    field: "username" as const,
    httpStatus: 409,
  },
  MISSING_FIELDS: {
    code: "missing_fields" as const,
    message: "Missing required fields",
    fields: ["email", "username", "password"] as const,
    httpStatus: 422,
  },
  VALIDATION_ERROR: {
    code: "validation_error" as const,
    message: "Invalid data provided",
    fields: ["email", "username", "password"] as const,
    httpStatus: 422,
  },
  UNEXPECTED_ERROR: {
    code: "unexpected" as const,
    message: "Unexpected error occurred",
    httpStatus: 500,
  },
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CATALOG)[keyof typeof AUTH_ERROR_CATALOG]["code"];

/**
 * Extract field list from error catalog entry
 */
export function getFieldsForError(errorCode: AuthErrorCode): readonly string[] {
  const entry = Object.values(AUTH_ERROR_CATALOG).find(
    (e) => e.code === errorCode,
  );
  return entry && "fields" in entry
    ? entry.fields
    : entry && "field" in entry
      ? [entry.field]
      : [];
}

/**
 * Extract message from error catalog entry
 */
export function getMessageForError(errorCode: AuthErrorCode): string {
  const entry = Object.values(AUTH_ERROR_CATALOG).find(
    (e) => e.code === errorCode,
  );
  return entry?.message ?? AUTH_ERROR_CATALOG.UNEXPECTED_ERROR.message;
}
```

**Update form-errors.factory.ts to use catalog**:

```typescript
import {
  AUTH_ERROR_CATALOG,
  type AuthErrorCode,
} from "@/server/auth/domain/errors/error-catalog";

// Derived from catalog, not manually defined
const FIELD_ERROR_MAP = Object.fromEntries(
  Object.values(AUTH_ERROR_CATALOG)
    .filter((e) => "field" in e && e.code !== "missing_fields")
    .map((e) => [
      e.code,
      {
        field: "field" in e ? e.field : e.fields[0],
        message: e.message,
      },
    ]),
) as const;
```

**Why this works**:

- ✅ Single source of truth for all auth errors
- ✅ Prevents inconsistency (same message everywhere)
- ✅ Includes HTTP status for API responses
- ✅ Field mappings explicit and documented
- ✅ Easy to add new errors (add one entry, derived everywhere)
- ✅ Queryable: `getFieldsForError()`, `getMessageForError()`

---

## 5. Result Boundary Clarity

**Problem**: Actions work with `Result<SessionUser, AppError>` internally but return `FormResult<LoginField>` to clients — type boundary unclear

**Refinement**: Explicit action return type with clear contract

```typescript
/**
 * Success payload for login action
 */
export interface LoginActionSuccess {
  /** User was authenticated; session established; redirecting */
  readonly authenticated: true;
}

/**
 * Failure payload for login action (validation/auth errors)
 */
export interface LoginActionFailure {
  readonly fieldErrors: DenseFieldErrorMap<LoginField, string>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<LoginField, string>;
}

/**
 * Explicit action boundary: never succeeds to client (redirects on success)
 * Only returns on validation or auth failure
 */
export type LoginActionResult = Result<
  LoginActionSuccess | never,
  LoginActionFailure & AppError
>;
```

**Usage**:

```typescript
export async function loginAction(
  _prevState: LoginActionResult,
  formData: FormData,
): Promise<LoginActionResult> {
  const raw = extractFormDataFields<LoginField>(formData, fields);

  const validated = await validateForm(formData, LoginSchema, fields, {
    loggerContext: AUTH_ACTION_CONTEXTS.LOGIN,
  });

  if (!validated.ok) {
    return mapAuthResultToFormResult(validated, { fields, raw });
  }

  const service = createAuthUserService(getAppDb());
  const sessionResult = await executeAuthPipeline(
    validated.value,
    service.login.bind(service),
  );

  if (!sessionResult.ok) {
    return mapAuthResultToFormResult(sessionResult, {
      fields,
      raw,
      failureMessage: "Login failed. Please try again.",
    });
  }

  // Success: never returns (redirects)
  (await cookies()).set("login-success", "true", {
    httpOnly: true,
    maxAge: 10,
    sameSite: "lax",
  });

  revalidatePath(ROUTES.DASHBOARD.ROOT);
  redirect(ROUTES.DASHBOARD.ROOT); // ← Never returns
}
```

**Why this works**:

- ✅ Action boundary is explicit: `LoginActionResult`
- ✅ Clients know: success = redirect (no return), failure = FormResult
- ✅ Type-safe: can't accidentally return success
- ✅ Distinguishes domain `Result` from action `Result`
- ✅ Integrates with Client Component's `useFormState()` hook

---

## Summary: Refinements By Layer

| Refinement                      | Layer              | Benefit                                  |
| ------------------------------- | ------------------ | ---------------------------------------- |
| **Extract error mapping**       | Action → Mapper    | DRY, testable, reusable                  |
| **Consolidate field constants** | Schema → Constants | Single source, includes metadata         |
| **Session error enrichment**    | Action → Domain    | Consistent error structure               |
| **Metadata coordination**       | Domain → Catalog   | Single source, queryable, prevents drift |
| **Result boundary clarity**     | Action signature   | Explicit contract, type safety           |

---

## Implementation Order

1. **Start with #4 (Metadata Catalog)** — Foundation for other changes
2. **Then #2 (Field Constants)** — Use catalog for field definitions
3. **Then #1 (Extract Mapping)** — Use field constants
4. **Then #3 (Session Enrichment)** — Use catalog
5. **Finally #5 (Result Boundary)** — Document the flow

This creates a coherent, DRY, maintainable auth error architecture aligned with **domain-driven design** and **railway-oriented programming** best practices.
