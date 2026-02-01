# Data Transformations in Auth Module

This document provides a comprehensive reference for all data transformations (mappers) in the authentication module, explaining what they do, why they exist, and where they're used.

## 🎯 Purpose of Data Transformations

Data transformations serve several critical purposes:

1. **Layer Isolation**: Each layer has its own data representation
2. **Security Boundaries**: Strip sensitive data when crossing boundaries
3. **Type Safety**: Convert between branded types and primitives
4. **Error Mapping**: Transform technical errors to user-friendly messages
5. **Data Shaping**: Adapt data structures for specific use cases

## 📊 Transformation Overview by Layer

```
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE (Raw Data)                                              │
│ UserRow { id: string, email: string, password: string, ... }    │
└─────────────────────────────────────────────────────────────────┘
                              ↓ toAuthUserEntity()
┌─────────────────────────────────────────────────────────────────┐
│ DOMAIN (Rich Entities)                                           │
│ AuthUserEntity { id: UserId, password: Hash, ... }              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ toAuthenticatedUserDto()
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION (DTOs - No Sensitive Data)                           │
│ AuthenticatedUserDto { id: UserId, email, username, role }      │
└─────────────────────────────────────────────────────────────────┘
                              ↓ toSessionPrincipal()
┌─────────────────────────────────────────────────────────────────┐
│ SESSION (Minimal Claims)                                         │
│ SessionPrincipalDto { id: UserId, role }                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓ SessionTokenService.issue()
┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE (JWT Token)                                       │
│ IssuedTokenDto { token: string, expiresAtMs: number }           │
└─────────────────────────────────────────────────────────────────┘
```

## 🔍 Complete Mapper Reference

### Infrastructure → Domain Mappers

#### 1. `toAuthUserEntity()`

**File**: `infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper.ts`

**Purpose**: Convert database row to domain entity with branded types

**Transformation**:

- `UserRow` → `AuthUserEntity`
- Adds type safety with branded types
- Preserves all data including password hash

**Example**:

```typescript
// Input: UserRow
{
  id: "123",
  email: "user@example.com",
  username: "johndoe",
  password: "$2b$10$...",  // bcrypt hash
  role: "user"
}

// Output: AuthUserEntity
{
  id: UserId("123"),           // Branded type
  email: "user@example.com",
  username: "johndoe",
  password: Hash("$2b$10$..."), // Branded type
  role: UserRole.USER          // Enum
}
```

**Security**: Includes password hash (needed for authentication)

**Used In**: Login flow, Signup flow

---

### Domain → Application Mappers

#### 2. `toAuthenticatedUserDto()`

**File**: `application/shared/mappers/flows/login/to-authenticated-user.mapper.ts`

**Purpose**: Strip sensitive data (password) for application layer

**Transformation**:

- `AuthUserEntity` → `AuthenticatedUserDto`
- **REMOVES password hash** (security boundary)
- Keeps user identity and role

**Example**:

```typescript
// Input: AuthUserEntity
{
  id: UserId("123"),
  email: "user@example.com",
  username: "johndoe",
  password: Hash("$2b$10$..."),  // SENSITIVE
  role: UserRole.USER
}

// Output: AuthenticatedUserDto
{
  id: UserId("123"),
  email: "user@example.com",
  username: "johndoe",
  role: UserRole.USER
  // password: REMOVED ✅
}
```

**Security**: Critical security boundary - password never leaves infrastructure layer

**Used In**: Login flow, Signup flow, Demo user flow

---

### Application → Application Mappers

#### 3. `toSessionPrincipal()`

**File**: `application/shared/mappers/flows/login/to-session-principal.mapper.ts`

**Purpose**: Extract minimal data needed for session/JWT

**Transformation**:

- `AuthenticatedUserDto` → `SessionPrincipalDto`
- Keeps only ID and role
- Removes email and username (not needed in JWT)

**Example**:

```typescript
// Input: AuthenticatedUserDto
{
  id: UserId("123"),
  email: "user@example.com",
  username: "johndoe",
  role: UserRole.USER
}

// Output: SessionPrincipalDto
{
  id: UserId("123"),
  role: UserRole.USER
  // email, username: REMOVED (not needed in JWT)
}
```

**Security**: Minimizes JWT payload size and data exposure

**Used In**: Login flow, Signup flow, Demo user flow

---

#### 4. `toSessionTokenClaimsDto()`

**File**: `application/session/mappers/to-session-token-claims-dto.mapper.ts`

**Purpose**: Map session token claims to DTO

**Transformation**:

- Internal claims → `SessionTokenClaimsDto`
- Validates and normalizes token claims

**Used In**: Session validation flow

---

### Infrastructure → Application Mappers

#### 5. `jwtToSessionTokenClaimsDto()`

**File**: `infrastructure/session/mappers/jwt-to-session-token-claims-dto.mapper.ts`

**Purpose**: Convert JWT payload to session token claims DTO

**Transformation**:

- `JWTPayload` → `SessionTokenClaimsDto`
- Validates JWT structure
- Extracts standard and custom claims

**Example**:

```typescript
// Input: JWTPayload (from jose library)
{
  exp: 1704067200,
  iat: 1703462400,
  nbf: 1703462400,
  userId: "123",
  role: "user"
}

// Output: SessionTokenClaimsDto
{
  exp: 1704067200,
  iat: 1703462400,
  nbf: 1703462400,
  userId: "123",
  role: UserRole.USER
}
```

**Security**: Validates JWT structure and claims

**Used In**: Session validation flow

---

### Application → Presentation Mappers (Error Handling)

#### 6. `toLoginFormResult()`

**File**: `application/shared/mappers/flows/login/to-login-form-result.mapper.ts`

**Purpose**: Convert domain errors to UI-friendly login form errors

**Transformation**:

- `AppError` → `FormResult<never>`
- Maps technical errors to user messages
- **Prevents credential enumeration**

**Example**:

```typescript
// Input: AppError
{
  key: "user_not_found",
  message: "No user found with email: user@example.com"
}

// Output: FormResult
{
  success: false,
  errors: {
    _form: ["Invalid email or password"]  // Generic message
  }
}

// Same output for "invalid_password" error
```

**Security**: Critical for preventing credential enumeration attacks

**Used In**: Login flow

---

#### 7. `toSignupFormResult()`

**File**: `application/shared/mappers/flows/signup/to-signup-form-result.mapper.ts`

**Purpose**: Convert domain errors to UI-friendly signup form errors

**Transformation**:

- `AppError` → `FormResult<never>`
- Maps errors to field-specific messages
- Provides actionable feedback

**Example**:

```typescript
// Input: AppError
{
  key: "email_already_exists",
  metadata: { field: "email" }
}

// Output: FormResult
{
  success: false,
  errors: {
    email: ["This email is already registered"]
  }
}
```

**Security**: Provides useful feedback without leaking sensitive info

**Used In**: Signup flow

---

#### 8. `mapGenericAuthError()`

**File**: `application/shared/mappers/flows/login/map-generic-auth.error.ts`

**Purpose**: Map generic authentication errors

**Transformation**:

- `AppError` → Generic error message
- Normalizes error responses

**Used In**: Login flow, Signup flow

---

### Infrastructure → Application Mappers (Error Handling)

#### 9. `pgUniqueViolationToSignupConflictError()`

**File**: `application/shared/mappers/flows/signup/pg-unique-violation-to-signup-conflict-error.mapper.ts`

**Purpose**: Convert Postgres unique violation to signup conflict error

**Transformation**:

- `PostgresError` (code 23505) → `AppError`
- Identifies which field caused the conflict
- Prevents database error leakage

**Example**:

```typescript
// Input: PostgresError
{
  code: "23505",
  constraint: "users_email_key",
  detail: "Key (email)=(user@example.com) already exists."
}

// Output: AppError
{
  key: "email_already_exists",
  message: "This email is already registered",
  metadata: { field: "email" }
}
```

**Security**: Sanitizes database errors before exposing to users

**Used In**: Signup flow

---

## 🔐 Security Boundaries

### Boundary 1: Infrastructure → Domain

**Location**: `toAuthUserEntity()`

**What Crosses**: All data including password hash

**Why**: Domain layer needs password hash for authentication logic

**Security**: Password hash is still protected (not plain text)

---

### Boundary 2: Domain → Application (CRITICAL)

**Location**: `toAuthenticatedUserDto()`

**What Crosses**: User identity (ID, email, username, role)

**What's Blocked**: Password hash

**Why**: Application layer doesn't need password hash after authentication

**Security**: This is the most critical security boundary - password never leaves infrastructure/domain layers

---

### Boundary 3: Application → Session

**Location**: `toSessionPrincipal()`

**What Crosses**: User ID and role only

**What's Blocked**: Email, username

**Why**: JWT should contain minimal data

**Security**: Reduces JWT size and limits data exposure if token is compromised

---

### Boundary 4: Application → Presentation

**Location**: Error mappers (`toLoginFormResult`, `toSignupFormResult`)

**What Crosses**: User-friendly error messages

**What's Blocked**: Technical details, stack traces, database errors

**Why**: Users don't need technical details

**Security**: Prevents information leakage and credential enumeration

---

## 📋 Mapper Usage by Flow

### Login Flow

1. `toAuthUserEntity()` - Database → Domain
2. `toAuthenticatedUserDto()` - Domain → Application
3. `toSessionPrincipal()` - Application → Session
4. `SessionTokenService.issue()` - Session → JWT
5. `toLoginFormResult()` - Error handling

### Signup Flow

1. `toAuthUserEntity()` - Database → Domain
2. `toAuthenticatedUserDto()` - Domain → Application
3. `toSessionPrincipal()` - Application → Session
4. `SessionTokenService.issue()` - Session → JWT
5. `pgUniqueViolationToSignupConflictError()` - DB error handling
6. `toSignupFormResult()` - Error handling

### Session Validation Flow

1. `jwtToSessionTokenClaimsDto()` - JWT → Claims
2. `toSessionTokenClaimsDto()` - Claims normalization

---

## 🎨 Mapper Design Patterns

### Pattern 1: Simple Property Mapping

```typescript
export function toAuthenticatedUserDto(
  entity: AuthUserEntity,
): AuthenticatedUserDto {
  return {
    id: entity.id,
    email: entity.email,
    username: entity.username,
    role: entity.role,
    // password intentionally omitted
  };
}
```

**When to Use**: Straightforward transformations without complex logic

---

### Pattern 2: Type Conversion

```typescript
export function toAuthUserEntity(row: UserRow): AuthUserEntity {
  return {
    id: toUserId(row.id), // string → UserId
    email: row.email,
    username: row.username,
    password: toHash(row.password), // string → Hash
    role: parseUserRole(row.role), // string → UserRole
  };
}
```

**When to Use**: Converting between branded types and primitives

---

### Pattern 3: Conditional Error Mapping

```typescript
export function toLoginFormResult(
  error: AppError,
  input: LoginRequestDto,
): FormResult<never> {
  // Prevent credential enumeration
  if (error.key === "user_not_found" || error.key === "invalid_password") {
    return {
      success: false,
      errors: { _form: ["Invalid email or password"] },
    };
  }

  // Generic error
  return {
    success: false,
    errors: { _form: ["An error occurred. Please try again."] },
  };
}
```

**When to Use**: Error transformations with security considerations

---

### Pattern 4: Database Error Inspection

```typescript
export function pgUniqueViolationToSignupConflictError(
  error: AppError
): AppError | null {
  const pgError = error.cause as PostgresError;

  if (pgError.code !== "23505") {
    return null; // Not a unique violation
  }

  if (pgError.constraint === "users_email_key") {
    return makeAppError("email_already_exists", { ... });
  }

  if (pgError.constraint === "users_username_key") {
    return makeAppError("username_already_exists", { ... });
  }

  return null;
}
```

**When to Use**: Transforming infrastructure errors to domain errors

---

## 🔗 Related Documentation

- **[mapper-registry.ts](../../application/shared/mappers/mapper-registry.ts)** - Complete mapper registry
- **[mapper-chains.ts](../../application/shared/mappers/mapper-chains.ts)** - Transformation chains by flow
- **[login-flow.md](./login-flow.md)** - Login flow with transformations
- **[signup-flow.md](./signup-flow.md)** - Signup flow with transformations
- **[error-handling.md](./error-handling.md)** - Error transformation details

---

## 📊 Quick Reference Table

| Mapper                                     | Input                  | Output                  | Security Impact             |
| ------------------------------------------ | ---------------------- | ----------------------- | --------------------------- |
| `toAuthUserEntity()`                       | `UserRow`              | `AuthUserEntity`        | Includes password hash      |
| `toAuthenticatedUserDto()`                 | `AuthUserEntity`       | `AuthenticatedUserDto`  | **Strips password hash** ✅ |
| `toSessionPrincipal()`                     | `AuthenticatedUserDto` | `SessionPrincipalDto`   | Minimizes JWT data          |
| `jwtToSessionTokenClaimsDto()`             | `JWTPayload`           | `SessionTokenClaimsDto` | Validates JWT structure     |
| `toLoginFormResult()`                      | `AppError`             | `FormResult`            | **Prevents enumeration** ✅ |
| `toSignupFormResult()`                     | `AppError`             | `FormResult`            | User-friendly messages      |
| `pgUniqueViolationToSignupConflictError()` | `PostgresError`        | `AppError`              | **Sanitizes DB errors** ✅  |

---

**Last Updated**: 2026-02-01  
**Maintained By**: Auth Module Team
