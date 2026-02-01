# Error Handling in Auth Module

This document describes how errors are handled, transformed, and propagated through the authentication module layers.

## 🎯 Error Handling Philosophy

The auth module follows these principles:

1. **Type-Safe Errors**: All errors use `Result<T, AppError>` pattern
2. **Layer-Appropriate Errors**: Each layer transforms errors to its abstraction level
3. **Security-First**: Never leak sensitive information in error messages
4. **User-Friendly**: Presentation layer errors are actionable and clear
5. **Traceable**: All errors include context for debugging

## 📊 Error Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE ERROR                                                   │
│ PostgresError, Connection Error, Constraint Violation           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER                                             │
│ Wraps in Result<T, AppError> with infrastructure context        │
│ - database_error                                                 │
│ - connection_failed                                              │
│ - unique_violation (23505)                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ DOMAIN/APPLICATION LAYER                                         │
│ Transforms to business-level errors                              │
│ - user_not_found                                                 │
│ - invalid_password                                               │
│ - email_already_exists                                           │
│ - session_expired                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                               │
│ Transforms to UI-friendly messages                               │
│ - "Invalid email or password" (credential enumeration prevention)│
│ - "This email is already registered"                             │
│ - "Your session has expired. Please log in again."              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔍 Error Types by Layer

### Infrastructure Layer Errors

**Source**: Database, external services, crypto operations

| Error Key          | Cause                                 | Example                          |
| ------------------ | ------------------------------------- | -------------------------------- |
| `database_error`   | Database query failed                 | Connection timeout, syntax error |
| `unique_violation` | Postgres constraint violation (23505) | Duplicate email/username         |
| `crypto_error`     | Hashing/encryption failed             | bcrypt failure                   |
| `jwt_invalid`      | JWT signature verification failed     | Tampered token                   |
| `jwt_expired`      | JWT exp claim exceeded                | Token past expiration            |

**Handling Strategy**: Wrap in `Result<T, AppError>` with infrastructure context

```typescript
// Example: DAL error handling
return await executeDalResult<UserRow | null>(
  async () => {
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return userRow ?? null;
  },
  { entity: "user", identifiers: { email }, operation: "getUserByEmail" },
  logger,
  { operationContext: "auth:dal" },
);
```

### Application Layer Errors

**Source**: Business logic, use cases, workflows

| Error Key             | Cause                       | Security Implication                  |
| --------------------- | --------------------------- | ------------------------------------- |
| `user_not_found`      | No user with given email    | **DO NOT** expose to UI (enumeration) |
| `invalid_password`    | Password doesn't match hash | **DO NOT** expose to UI (enumeration) |
| `invalid_credentials` | Generic auth failure        | Safe to show to UI                    |
| `session_not_found`   | No session cookie present   | Safe to show                          |
| `session_expired`     | Session past expiration     | Safe to show                          |
| `session_invalid`     | Session failed validation   | Safe to show                          |
| `validation_error`    | Input validation failed     | Safe to show with field details       |

**Handling Strategy**: Transform infrastructure errors to business errors

```typescript
// Example: Use case error transformation
const userResult = await this.repo.findByEmail({ email: input.email });

if (!userResult.ok) {
  return userResult; // Propagate infrastructure error
}

const user = userResult.value;

if (!user) {
  // Transform to business error
  return Err(
    AuthErrorFactory.makeCredentialFailure("user_not_found", {
      email: input.email,
    }),
  );
}
```

### Presentation Layer Errors

**Source**: Form validation, user input, error mapping

| Error Type                | User Message                       | Field            |
| ------------------------- | ---------------------------------- | ---------------- |
| `invalid_credentials`     | "Invalid email or password"        | `_form` (global) |
| `email_already_exists`    | "This email is already registered" | `email`          |
| `username_already_exists` | "This username is taken"           | `username`       |
| `validation_error`        | Field-specific message             | Specific field   |
| `session_expired`         | "Your session has expired"         | N/A (redirect)   |

**Handling Strategy**: Map application errors to form-friendly errors

```typescript
// Example: Error to form result mapping
export function toLoginFormResult(
  error: AppError,
  input: LoginRequestDto,
): FormResult<never> {
  // Prevent credential enumeration
  if (error.key === "user_not_found" || error.key === "invalid_password") {
    return {
      data: undefined,
      errors: {
        _form: ["Invalid email or password"],
      },
      success: false,
    };
  }

  // Generic error
  return {
    data: undefined,
    errors: {
      _form: ["An error occurred. Please try again."],
    },
    success: false,
  };
}
```

## 🛡️ Security Considerations

### 1. Credential Enumeration Prevention

**Problem**: Attackers can determine if an email exists by observing different error messages.

**Solution**: Always return the same generic message for authentication failures.

```typescript
// ❌ BAD: Reveals if email exists
if (!user) {
  return "No account found with this email";
}
if (!passwordMatch) {
  return "Incorrect password";
}

// ✅ GOOD: Generic message for both cases
if (!user || !passwordMatch) {
  return "Invalid email or password";
}
```

**Implementation**:

- `user_not_found` → "Invalid email or password"
- `invalid_password` → "Invalid email or password"
- Both map to the same UI message

### 2. Database Error Sanitization

**Problem**: Database errors can leak schema information, table names, or SQL queries.

**Solution**: Never expose raw database errors to users.

```typescript
// ❌ BAD: Exposes database details
return {
  error: 'duplicate key value violates unique constraint "users_email_key"',
};

// ✅ GOOD: User-friendly message
return {
  error: "This email is already registered",
};
```

**Implementation**:

- `pgUniqueViolationToSignupConflictError` mapper
- Checks constraint name to determine which field is duplicate
- Returns field-specific error

### 3. Session Error Handling

**Problem**: Session errors can reveal token structure or validation logic.

**Solution**: Generic session error messages.

```typescript
// All session validation failures map to:
"Your session is invalid. Please log in again." -
  // Specific internal errors (not shown to user):
  jwt_expired -
  jwt_invalid_signature -
  jwt_malformed -
  session_claims_invalid;
```

## 📋 Error Transformation Rules

### Login Flow

| Source Error              | Layer          | Transformed To            | UI Message                  |
| ------------------------- | -------------- | ------------------------- | --------------------------- |
| `database_error`          | Infrastructure | `database_error`          | "Service unavailable"       |
| `user_not_found`          | Application    | `invalid_credentials`     | "Invalid email or password" |
| `invalid_password`        | Application    | `invalid_credentials`     | "Invalid email or password" |
| `crypto_error`            | Infrastructure | `crypto_error`            | "Service unavailable"       |
| `session_creation_failed` | Application    | `session_creation_failed` | "Unable to create session"  |

### Signup Flow

| Source Error                  | Layer          | Transformed To            | UI Message                         |
| ----------------------------- | -------------- | ------------------------- | ---------------------------------- |
| `unique_violation (email)`    | Infrastructure | `email_already_exists`    | "This email is already registered" |
| `unique_violation (username)` | Infrastructure | `username_already_exists` | "This username is taken"           |
| `validation_error`            | Application    | `validation_error`        | Field-specific messages            |
| `password_hash_failed`        | Infrastructure | `crypto_error`            | "Service unavailable"              |

### Session Validation Flow

| Source Error        | Layer          | Transformed To      | UI Message                          |
| ------------------- | -------------- | ------------------- | ----------------------------------- |
| `jwt_expired`       | Infrastructure | `session_expired`   | "Session expired. Please log in."   |
| `jwt_invalid`       | Infrastructure | `session_invalid`   | "Invalid session. Please log in."   |
| `jwt_malformed`     | Infrastructure | `session_invalid`   | "Invalid session. Please log in."   |
| `session_not_found` | Application    | `session_not_found` | "No active session. Please log in." |

## 🔧 Error Handling Patterns

### Pattern 1: Early Return with Result

```typescript
async function someUseCase(): Promise<Result<Data, AppError>> {
  const step1Result = await step1();
  if (!step1Result.ok) {
    return step1Result; // Propagate error
  }

  const step2Result = await step2(step1Result.value);
  if (!step2Result.ok) {
    return step2Result; // Propagate error
  }

  return Ok(finalData);
}
```

### Pattern 2: Error Transformation

```typescript
async function repository(): Promise<Result<Entity, AppError>> {
  const dalResult = await dal();

  if (!dalResult.ok) {
    // Transform infrastructure error to domain error
    const mapped = infrastructureToDomainError(dalResult.error);
    return Err(mapped ?? dalResult.error);
  }

  return Ok(toEntity(dalResult.value));
}
```

### Pattern 3: Safe Execute Wrapper

```typescript
async function useCase(): Promise<Result<Data, AppError>> {
  return safeExecute(
    async () => {
      // Business logic that might throw
      const result = await riskyOperation();
      return Ok(result);
    },
    {
      logger: this.logger,
      message: "Unexpected error in use case",
      operation: "useCaseName",
    },
  );
}
```

### Pattern 4: Error Aggregation

```typescript
function validateMultipleFields(input: Input): Result<Input, AppError> {
  const errors: Record<string, string[]> = {};

  if (!input.email.includes("@")) {
    errors.email = ["Invalid email format"];
  }

  if (input.password.length < 8) {
    errors.password = ["Password must be at least 8 characters"];
  }

  if (Object.keys(errors).length > 0) {
    return Err(makeAppError("validation", { metadata: { errors } }));
  }

  return Ok(input);
}
```

## 📝 Error Logging Strategy

### What to Log

**Infrastructure Layer**:

- ✅ Database errors (full details)
- ✅ Connection failures
- ✅ Crypto operation failures
- ✅ JWT verification failures

**Application Layer**:

- ✅ Business logic errors (with context)
- ✅ Failed authentication attempts (email only, not password)
- ✅ Session validation failures
- ⚠️ User not found (info level, not error)

**Presentation Layer**:

- ✅ Form validation failures (aggregated)
- ✅ Unexpected errors
- ❌ Don't log passwords or tokens

### Log Levels

| Error Type         | Log Level | Reason                     |
| ------------------ | --------- | -------------------------- |
| `database_error`   | `error`   | Infrastructure failure     |
| `user_not_found`   | `info`    | Normal flow (not an error) |
| `invalid_password` | `warn`    | Potential security concern |
| `validation_error` | `info`    | User input issue           |
| `session_expired`  | `info`    | Normal flow                |
| `unexpected_error` | `error`   | System failure             |

### Example Logging

```typescript
// ✅ GOOD: Structured logging with context
logger.operation("warn", "Login failed: invalid password", {
  operationContext: "authentication",
  operationIdentifiers: { userId: user.id },
  operationName: "login.invalid_password",
});

// ❌ BAD: Logs sensitive data
logger.error("Login failed", { email, password }); // Never log passwords!
```

## 🚨 Common Error Scenarios

### Scenario 1: Database Connection Lost

**Flow**:

1. DAL operation fails with connection error
2. `executeDalResult` wraps in `AppError` with `database_error` key
3. Repository propagates error
4. Use case propagates error
5. Workflow propagates error
6. Server Action maps to generic "Service unavailable" message

**User sees**: "Service is temporarily unavailable. Please try again later."

### Scenario 2: Duplicate Email on Signup

**Flow**:

1. DAL insert fails with Postgres error 23505
2. Repository catches and maps to `email_already_exists` via `pgUniqueViolationToSignupConflictError`
3. Use case propagates error
4. Workflow propagates error
5. Server Action maps to field error on email field

**User sees**: Field error on email: "This email is already registered"

### Scenario 3: Invalid Login Credentials

**Flow**:

1. Use case finds user but password doesn't match
2. Use case returns `invalid_password` error
3. Workflow propagates error
4. Server Action maps to generic credentials error via `toLoginFormResult`

**User sees**: "Invalid email or password"

### Scenario 4: Expired Session

**Flow**:

1. JWT decode succeeds but exp claim is past current time
2. `SessionTokenService.validate` returns `session_expired` error
3. Middleware catches and redirects to login
4. Flash message shown to user

**User sees**: "Your session has expired. Please log in again."

## 🔗 Related Files

### Error Factories

- `src/shared/errors/factories/app-error.factory.ts` - Generic error creation
- `src/modules/auth/application/auth-user/errors/auth-error.factory.ts` - Auth-specific errors

### Error Mappers

- `src/modules/auth/application/shared/mappers/flows/login/to-login-form-result.mapper.ts`
- `src/modules/auth/application/shared/mappers/flows/signup/to-signup-form-result.mapper.ts`
- `src/modules/auth/application/shared/mappers/flows/signup/pg-unique-violation-to-signup-conflict-error.mapper.ts`

### Error Handling Utilities

- `src/shared/errors/server/adapters/dal/execute-dal-result.ts` - DAL error wrapper
- `src/shared/results/safe-execute.ts` - Safe execution wrapper

---

**Last Updated**: 2026-02-01  
**Maintained By**: Auth Module Team
