# Auth Infrastructure Layer

This layer contains the **technical implementations** for authentication and session management. It provides concrete
implementations of application contracts, handles external dependencies, and manages technical concerns like database
access, cryptography, and JWT operations.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Directory Structure](#directory-structure)
- [Key Components](#key-components)
- [Composition Root](#composition-root-composition)
- [Session Infrastructure](#session-infrastructure)
- [Persistence Layer](#persistence-layer)
- [Security Implementations](#security-implementations)

---

## Overview

The infrastructure layer is the **outermost layer** in Clean Architecture. It:

- **Implements application contracts**: Provides concrete implementations of repository and service interfaces
- **Manages external dependencies**: Database connections, JWT libraries, cryptography
- **Handles technical concerns**: Connection pooling, error translation, logging
- **Provides composition root**: Wires all dependencies together via Dependency Injection

**Key Principle**: Infrastructure depends on application contracts, but application never depends on infrastructure
implementations.

---

## Architecture Principles

### 1. **Adapter Pattern**

Infrastructure adapters implement application contracts:

```typescript
// Application defines the contract
export interface SessionStoreContract {
  get(): Promise<Result<string | null, AppError>>;
  set(token: string, expiresAtMs: number): Promise<Result<void, AppError>>;
}

// Infrastructure provides the adapter
export class SessionCookieStoreAdapter implements SessionStoreContract {
  async get(): Promise<Result<string | null, AppError>> {
    // Next.js cookies() implementation
  }
}
```

### 2. **Strategy Pattern**

Swap implementations without changing application code:

```typescript
// JWT crypto strategy can be swapped
export interface SessionJwtCryptoStrategy {
  sign(claims: SessionJwtClaimsTransport): Promise<Result<string, AppError>>;
  verify(token: string): Promise<Result<SessionJwtClaimsTransport, AppError>>;
}

// Current: jose library
// Future: Could swap to jsonwebtoken, auth0, etc.
```

### 3. **Factory Pattern**

Factories create fully-wired instances:

```typescript
export function sessionServiceFactory(
    logger: LoggingClientContract,
    requestId: string,
): SessionServiceContract {
    const codec = new SessionTokenCodecAdapter(/* ... */);
    const tokenService = new SessionTokenService(codec);
    const store = new SessionCookieStoreAdapter();

    return new SessionService({
        logger,
        sessionStore: store,
        sessionTokenService: tokenService,
    });
}
```

### 4. **Repository Pattern**

Repositories encapsulate data access:

```typescript
// Repository coordinates DAL calls and mapping
export class AuthUserRepository {
  async findByEmail(
    query: AuthUserLookupQuery,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    const rowResult = await getUserByEmailDal(
      this.db,
      query.email,
      this.logger,
    );
    if (!rowResult.ok) return rowResult;

    return Ok(rowResult.value ? toAuthUserEntity(rowResult.value) : null);
  }
}
```

---

## Directory Structure

```text
infrastructure/
├── auth-transaction.logger.ts      # Transaction-scoped logger (flat — no logging/ folder)
│
├── composition/                    # Dependency Injection
│   ├── auth.composition.ts         # Main composition root
│   └── factories/                  # Factory functions
│       ├── auth-user/              # Auth user factories
│       │   ├── auth-tx-deps.factory.ts
│       │   ├── auth-unit-of-work.factory.ts
│       │   ├── demo-user-use-case.factory.ts
│       │   ├── login-use-case.factory.ts
│       │   └── signup-use-case.factory.ts
│       ├── crypto/                 # Crypto service factories
│       │   ├── password-generator.factory.ts
│       │   └── password-hasher.factory.ts
│       └── session/                # Session service factories
│           ├── session-cookie-store.factory.ts
│           ├── session-service.factory.ts
│           ├── session-token-codec.factory.ts
│           └── session-token-service.factory.ts
│
├── crypto/                         # Cryptography implementations
│   ├── auth-crypto.config.ts       #   (flat — no config/ folder)
│   ├── password-hasher.adapter.ts  #   (flat — no adapters/ folder)
│   └── services/
│       ├── bcrypt-password.service.ts
│       └── password-generator.service.ts
│
├── persistence/                    # Database access
│   └── auth-user/
│       ├── auth-user.repository.ts # Repository impl (flat — no repositories/ folder)
│       ├── adapters/               # Repository adapters
│       │   ├── auth-unit-of-work.adapter.ts
│       │   └── auth-user-repository.adapter.ts
│       ├── dal/                    # Data Access Layer (raw queries)
│       │   ├── get-user-by-email.dal.ts
│       │   ├── increment-demo-user-counter.dal.ts
│       │   └── insert-user.dal.ts
│       └── mappers/                # Database row → Domain entity
│           ├── pg-unique-violation-to-signup-conflict-error.mapper.ts
│           └── to-auth-user-entity.mapper.ts
│
└── session/                        # Session infrastructure
    ├── jwt-to-session-token-claims-dto.mapper.ts   # JWT → DTO (flat — no mappers/ folder)
    ├── session-jwt-crypto.strategy.ts              # JWT strategy (flat — no strategies/ folder)
    ├── session-token-claims.schema.ts              # Zod schema for the JWT claims
    ├── to-session-cookie-max-age-seconds.helper.ts # cookie max-age helper (flat — no helpers/ folder)
    ├── adapters/                   # Session adapters
    │   ├── session-cookie-store.adapter.ts
    │   └── session-token-codec.adapter.ts
    ├── config/                     # Session configuration
    │   ├── session-cookie-options.config.ts
    │   ├── session-jwt.constants.ts
    │   └── session-token.constants.ts
    ├── services/                   # Session services
    │   ├── jose-session-jwt-crypto.service.ts
    │   ├── session-token.service.ts
    │   └── session.service.ts
    └── types/                      # Infrastructure types
        ├── session-cookie.constants.ts
        ├── session-jwt-claims.transport.ts
        └── session-jwt-verify-options.transport.ts
```

---

## Key Components

### **Composition Root** (`composition/`)

The composition root is where **all dependencies are wired together**. It's the only place that knows about concrete
implementations.

**Responsibilities:**

- Create logger with request context
- Initialize database connection
- Wire repositories, services, and use cases
- Expose high-level workflows for presentation layer

**Example:**

```typescript
export async function makeAuthComposition(): Promise<AuthComposition> {
  const requestId = crypto.randomUUID();
  const logger = defaultLogger.withRequest(requestId);
  const db = getAppDb();

  const sessionService = sessionServiceFactory(logger, requestId);
  const loginUseCase = loginUseCaseFactory(db, logger, requestId);

  return {
    workflows: {
      login: (input) => loginWorkflow(input, { loginUseCase, sessionService }),
      // ... other workflows
    },
  };
}
```

### **Factories** (`composition/factories/`)

Factories encapsulate the creation logic for complex objects:

**Benefits:**

- Centralized dependency wiring
- Easy to test (can inject mocks)
- Clear dependency graph
- Consistent initialization

**Example:**

```typescript
export function loginUseCaseFactory(
  db: AppDatabase,
  logger: LoggingClientContract,
  requestId: string,
): LoginUseCase {
  const repo = new AuthUserRepositoryAdapter(
    new AuthUserRepository(db, logger, requestId),
  );
  const hasher = new PasswordHasherAdapter(new BcryptPasswordService());

  return new LoginUseCase(repo, hasher, logger);
}
```

---

## Session Infrastructure

### **Session Token Flow**

```text
SessionService
  └─ EstablishSessionUseCase
      ├─ SessionTokenService.issue()
      │   └─ SessionTokenCodecAdapter.encode()
      │       └─ JoseSessionJwtCryptoService.sign()
      └─ SessionCookieStoreAdapter.set()
```

### **Components**

#### **SessionService** (`services/session.service.ts`)

Facade over session use cases. Delegates to:

- `EstablishSessionUseCase` - Create new session
- `ReadSessionUseCase` - Read current session
- `RotateSessionUseCase` - Rotate session token
- `TerminateSessionUseCase` - End session
- `RequireSessionUseCase` - Verify session exists

#### **SessionTokenService** (`services/session-token.service.ts`)

Handles token issuance and validation:

- Issues JWT with claims (`sub` (user id), `role`, `sid`, `jti`, `iat`, `exp`, `nbf`)
- Validates token signature and claims
- Enforces semantic checks (exp > iat, nbf <= iat, etc.)

#### **SessionTokenCodecAdapter** (`adapters/session-token-codec.adapter.ts`)

Encodes/decodes JWT tokens using the crypto strategy:

- Delegates to `JoseSessionJwtCryptoService`
- Translates jose errors to `AppError`

#### **JoseSessionJwtCryptoService** (`services/jose-session-jwt-crypto.service.ts`)

Concrete JWT implementation using jose library:

- Signs tokens with HS256 algorithm
- Verifies signatures
- Handles key management

#### **SessionCookieStoreAdapter** (`adapters/session-cookie-store.adapter.ts`)

Manages HTTP-only secure cookies:

- Uses Next.js `cookies()` API
- Sets cookie with proper security flags
- Handles cookie expiration

---

## Persistence Layer

### **Data Access Layer (DAL)**

The DAL contains **raw database queries** using Drizzle ORM:

**Responsibilities:**

- Execute SQL queries
- Handle database errors
- Log operations
- Return raw database rows

**Example:**

```typescript
export async function getUserByEmailDal(
  db: AppDatabase,
  email: string,
  logger: LoggingClientContract,
): Promise<Result<UserRow | null, AppError>> {
  return await executeDalResult(
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
  );
}
```

### **Repositories**

Repositories coordinate DAL calls and map results:

**Responsibilities:**

- Call DAL functions
- Map database rows to domain entities
- Handle repository-level errors
- Provide high-level data access methods

**Example:**

```typescript
export class AuthUserRepository {
  async findByEmail(
    query: AuthUserLookupQuery,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    const rowResult = await getUserByEmailDal(
      this.db,
      query.email,
      this.logger,
    );
    if (!rowResult.ok) return rowResult;

    const row = rowResult.value;
    return Ok(row ? toAuthUserEntity(row) : null);
  }
}
```

### **Repository Adapters**

Adapters expose repositories through application contracts:

**Why?** Allows future flexibility (e.g., caching layer, multiple data sources)

```typescript
export class AuthUserRepositoryAdapter implements AuthUserRepositoryContract {
  constructor(private authUsers: AuthUserRepository) {}

  findByEmail(
    query: AuthUserLookupQuery,
  ): Promise<Result<AuthUserEntity | null, AppError>> {
    return this.authUsers.findByEmail(query);
  }
}
```

### **Mappers**

Infrastructure mappers convert database rows to domain entities:

```typescript
export function toAuthUserEntity(row: UserRow): AuthUserEntity {
  return {
    id: toUserId(row.id), // String → Branded UserId
    email: row.email,
    username: row.username,
    password: toHash(row.password), // String → Branded Hash
    role: parseUserRole(row.role), // String → UserRole enum
  };
}
```

---

## Security Implementations

### **Password Hashing** (`crypto/`)

#### **BcryptPasswordService**

Concrete implementation using bcrypt:

- Hash passwords with env-configured salt rounds (`AUTH_BCRYPT_SALT_ROUNDS`)
- Compare plaintext with hash
- Returns `Result<boolean, AppError>`

#### **PasswordHasherAdapter**

Implements `PasswordHasherContract`:

- Delegates to `BcryptPasswordService`
- Translates errors to `AppError`

### **JWT Signing** (`session/`)

#### **JoseSessionJwtCryptoService**

Concrete JWT implementation:

- Algorithm: HS256 (HMAC with SHA-256)
- Secret: From environment variable `SESSION_SECRET`
- Claims: `sub` (user id), `role`, `sid`, `jti`, `iat`, `exp`, `nbf`
- Expiration: 15 minutes per token, slid forward by rotation (see below)

**Security Features:**

- HTTP-only cookies (prevents XSS)
- Secure flag (HTTPS only in production)
- SameSite=Strict (CSRF protection; current default)
- Short-lived tokens (15 minutes), rotated up to a 30-day absolute ceiling
- Signature verification on every request

---

## Configuration

### **Environment Variables**

```bash
# Session JWT signing secret (required)
SESSION_SECRET=your-secret-key-here

# Bcrypt cost factor (required — schema enforces a positive int, no default)
AUTH_BCRYPT_SALT_ROUNDS=10

# Database connection (required)
DATABASE_URL=postgresql://...
```

### **Constants**

- **Session duration**: 15 minutes (`SESSION_DURATION_SEC` = 900s) — lifetime of a freshly issued token
- **Refresh threshold**: 2 minutes (`SESSION_REFRESH_THRESHOLD_SEC`) — the "approaching expiry" rotation window
- **Max absolute lifetime**: 30 days (`MAX_ABSOLUTE_SESSION_SEC`) — hard ceiling on age via `iat`, even with rotation
- **Clock tolerance**: 5 seconds (`SESSION_TOKEN_CLOCK_TOLERANCE_SEC`)
- **Bcrypt rounds**: env-configured via `AUTH_BCRYPT_SALT_ROUNDS` (required; e.g. 10)

> The full session state machine and these numbers are in the
> [session-lifecycle diagram](../../../../docs/diagrams/session-lifecycle.md).

---

## Error Handling

### **Error Translation**

Infrastructure errors are translated to `AppError`:

```typescript
// Database error → AppError
try {
  const result = await db.query(...);
} catch (error) {
  if (isPgUniqueViolation(error)) {
    return Err(makeAppError('conflict', { ... }));
  }
  return Err(makeAppError('database', { ... }));
}
```

### **Error Wrapping**

Use `executeDalResult()` to wrap DAL operations:

```typescript
return await executeDalResult(
  async () => {
    // Database operation
  },
  { entity: "user", operation: "findByEmail" },
  logger,
);
```

---

## Testing Strategy

### **Unit Tests**

Test individual services and adapters:

```typescript
describe("BcryptPasswordService", () => {
  it("should hash password", async () => {
    const service = new BcryptPasswordService();
    const result = await service.hash("password123");
    expect(result.ok).toBe(true);
  });
});
```

### **Integration Tests**

Test with real database (test container):

```typescript
describe("AuthUserRepository", () => {
    it("should find user by email", async () => {
        const repo = new AuthUserRepository(testDb, logger, requestId);
        const result = await repo.findByEmail({email: "test@example.com"});
        expect(result.ok).toBe(true);
    });
});
```

### **What to Test**

- ✅ Service implementations (password hashing, JWT signing)
- ✅ Repository operations (CRUD)
- ✅ Error translation (database errors → AppError)
- ✅ Adapter delegation
- ✅ Factory wiring

---

## Related Documentation

- **[Application Layer](../application/README.md)**: Contracts that infrastructure implements
- **[Session Lifecycle](../../../../docs/diagrams/session-lifecycle.md)**: Session state machine (diagram)
- **[Error Handling](../../../../docs/diagrams/error-handling-flow.md)**: Error handling flow (diagram)

---

## Quick Reference

### **Adding a New Repository**

1. Create DAL functions in `persistence/{subdomain}/dal/`
2. Create repository in `persistence/{subdomain}/repositories/`
3. Create adapter in `persistence/{subdomain}/adapters/`
4. Add mapper in `persistence/{subdomain}/mappers/`
5. Create factory in `composition/factories/{subdomain}/`
6. Wire in composition root

### **Adding a New Service**

1. Create service in appropriate folder (`crypto/`, `session/`)
2. Create adapter (if needed)
3. Create factory in `composition/factories/`
4. Wire in composition root

### **Common Patterns**

**DAL Pattern:**

```typescript
export async function myDal(
  db: AppDatabase,
  params: Params,
  logger: LoggingClientContract,
): Promise<Result<Row, AppError>> {
  return await executeDalResult(
    async () => {
      // Raw query here
    },
    { entity: "entity-name", operation: "operation-name" },
    logger,
  );
}
```

**Repository Pattern:**

```typescript
export class MyRepository {
  async myMethod(input: InputDto): Promise<Result<Entity, AppError>> {
    const rowResult = await myDal(this.db, input, this.logger);
    if (!rowResult.ok) return rowResult;

    return Ok(toEntity(rowResult.value));
  }
}
```

**Factory Pattern:**

```typescript
export function myServiceFactory(
  logger: LoggingClientContract,
  requestId: string,
): MyServiceContract {
  const dependency = new Dependency();
  return new MyService(dependency, logger);
}
```

---

## Best Practices

1. **Never import from application**: Infrastructure implements contracts, never imports use cases
2. **Use factories**: Centralize dependency wiring
3. **Translate errors**: Convert technical errors to `AppError`
4. **Log operations**: Use structured logging for observability
5. **Use adapters**: Keep flexibility to swap implementations
6. **Test with real dependencies**: Integration tests with test database
7. **Secure by default**: HTTP-only cookies, signature verification, short expiration

---

## Maintenance

### **When to Update This Layer**

- Changing database schema
- Swapping external libraries (e.g., bcrypt → argon2)
- Adding new data sources
- Modifying JWT strategy
- Updating security configurations

### **Breaking Changes**

Changes to adapters or services that implement application contracts are breaking changes. Coordinate with:

- **Application layer**: Defines contracts
- **Tests**: May need to update mocks

---

**Last Updated**: 2026-06-24\
**Maintainer**: Auth Module Team
