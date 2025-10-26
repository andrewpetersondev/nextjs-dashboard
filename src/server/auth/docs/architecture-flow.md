I'll examine your login and signup flow to understand the current architecture pattern. Let me trace through the key files.Let me try a different approach to read these files:Based on my examination of your codebase, here's the comprehensive **Current Login/Signup Architecture Pattern**:

## Architecture Flow Diagram

```
USER SUBMITS FORM
       ↓
loginAction() / signupAction() [Server Action - "use server"]
       ├─ extractFormDataFields() → raw form data
       ├─ validateForm() [validate-form.ts]
       │  ├─ resolveCanonicalFieldNames() → get field list from schema
       │  ├─ resolveRawFieldPayload() → extract FormData
       │  ├─ schema.safeParseAsync() → Zod validation
       │  ├─ mapToDenseFieldErrorsFromZod() → dense field errors
       │  └─ Returns: FormResult (either validated data or errors)
       │
       ├─ IF validation fails → return FormResult with fieldErrors [EARLY EXIT]
       │
       ├─ createAuthUserService(db) [Composition Root / Factory Pattern]
       │  ├─ AuthUserRepositoryImpl(db) → actual DB access
       │  ├─ AuthUserRepositoryAdapter() → port adapter
       │  ├─ BcryptPasswordHasherAdapter() → password port
       │  └─ AuthUserService(repoPort, hasherPort) → orchestrator
       │
       ├─ executeAuthPipeline(data, service.login.bind())
       │  ├─ seed = Ok(data)
       │  ├─ auth = flatMapAsync(authHandler) → service.login()/signup()
       │  │  │
       │  │  └─ AuthUserService.login/signup()
       │  │     ├─ repo.login() / repo.signup()
       │  │     ├─ hasher.hash() / hasher.compare()
       │  │     ├─ mapRepoErrorToAppResult() → catch & translate errors
       │  │     ├─ toFormAwareError() → normalize to fieldErrors
       │  │     └─ Returns: Result<AuthUserTransport, AppError>
       │  │
       │  ├─ establishSession = flatMapAsync(establishSessionAction)
       │  │  ├─ setSessionToken() → create JWT cookie
       │  │  ├─ tryCatchAsync() → error handling
       │  │  └─ Returns: Result<SessionUser, AppError>
       │  │
       │  └─ pipeAsync(seed, auth, establishSession) → monadic composition
       │
       ├─ IF sessionResult.error → return FormResult with fieldErrors [MAPPED]
       │  (fieldErrors already in error.details from service layer)
       │
       └─ IF sessionResult.ok → set cookie → revalidatePath() → redirect()
```

---

## Key Components & Responsibilities

| Component                  | File                                   | Responsibility                                        |
| -------------------------- | -------------------------------------- | ----------------------------------------------------- |
| **Action Handler**         | `login.action.ts` / `signup.action.ts` | Orchestrate request flow, error mapping to UI         |
| **Form Validation**        | `@/server/forms/validate-form.ts`      | Zod schema parsing, field error extraction            |
| **Composition Root**       | `auth-user-service.factory.ts`         | DI container, wires ports & adapters                  |
| **Business Logic**         | `auth-user.service.ts`                 | Auth operations: login, signup, credential validation |
| **Error Translation**      | `app-error.mapping.repo.ts`            | Infra errors → `AppError`                             |
| **Form Normalization**     | `form-errors.factory.ts`               | `AppError` → fieldErrors for UI                       |
| **Pipeline Orchestration** | `auth-pipeline.helper.ts`              | Monadic composition: validation → auth → session      |
| **Session Establishment**  | `establish-session.action.ts`          | JWT cookie creation, session persistence              |

---

## Three-Tier Error Handling

### Tier 1: Validation (Client → Server)

```
FormData → Zod Schema → FormResult { fieldErrors, message }
```

### Tier 2: Domain → Application (Repository → Service)

```
DatabaseError / ValidationError / etc.
  → mapRepoErrorToAppResult()
  → AppError { code, message }
  → toFormAwareError()
  → AppError { code, message, details: { fieldErrors } }
```

### Tier 3: Action → UI (Server Action → Client)

```
Result<SessionUser, AppError>
  → toFormError<LoginField>()
  → FormResult { fieldErrors, message, values, raw }
  → Return to form (React Server Component)
```

---

## Design Strengths

✅ **Monadic Composition**: `pipeAsync()` + `flatMapAsync()` enable error short-circuiting  
✅ **Port-Adapter Pattern**: `AuthUserRepositoryPort` & `PasswordHasherPort` ports decouple logic  
✅ **Early Enrichment**: Service layer populates `fieldErrors` immediately (no post-processing)  
✅ **Type Safety**: Generics (`TField extends string`) ensure field names match  
✅ **Immutability**: `Object.freeze()` on error details prevents mutations  
✅ **Server-Only**: `"use server"` + `"server-only"` pragma prevent accidental client execution

---

## Potential Refinements to Consider

1. **Extract error mapping logic**: The `toFormError()` call is repeated in both `loginAction()` and `signupAction()`. Could create a shared wrapper.

2. **Consolidate field constants**: `LOGIN_FIELDS_LIST` and `SIGNUP_FIELDS_LIST` could be centralized for easier maintenance.

3. **Session error enrichment**: `establish-session.action.ts` returns generic `AppError` without `fieldErrors`. Should it use `toFormAwareError()` for consistency?

4. **Metadata coordination**: Error messages in `auth-error.logging.ts` vs. `form-errors.factory.ts` — could unify the single source of truth.

5. **Result<T, E> return type in actions**: Currently actions return `FormResult`, but internally work with `Result<SessionUser, AppError>`. Consider if an intermediate type would clarify the boundary.

Would you like me to detail any specific layer or suggest concrete refinements?
