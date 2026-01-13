# Naming Conventions & Organization

Standardized naming to ensure predictability, discoverability, and easy refactoring.

**Goals**:

- Make intent obvious from names (especially at boundaries)
- Keep imports predictable (deep imports are encouraged)
- Reduce "synonym drift" (`map*` vs `to*` vs `convert*`)
- Make tests mirror the unit they validate
- Prevent naming ambiguity and drift through redundant but clear naming

---

## Core Naming Principles

1. **Intentional Over Generic**: Names should reveal use case context, not just data structure

- ✅ `AuthenticatedUserDto` (reveals it's for authenticated users)
- ❌ `UserDto` (too generic, invites drift across different contexts)

2. **Redundancy for Clarity**: Include suffixes in both type names AND filenames

- ✅ `LoginRequestDto` in `login-request.dto.ts`
- ❌ `LoginRequest` in `login.dto.ts`

3. **Consumer-Centric Naming**: Use Cases and Workflows depend on "Services" or "Repositories"

- Avoid implementation-leaky words like "Adapter", "Cookie", "Pg" in Application layer dependency names
- ✅ `sessionService: SessionServiceContract`
- ❌ `sessionAdapter: SessionAdapterContract`

4. **Reusability Signal**: Contract naming should signal scope

- **Generic contracts** (reusable across modules): `PasswordHasherContract`, `EmailSenderContract`
- **Domain-specific contracts** (single module): `SessionTokenServiceContract`, `AuthUserRepositoryContract`

5. **Domain-Aligned Verbs**: Method names in contracts match business language

- ✅ `session.terminate()` (business language)
- ❌ `session.deleteCookie()` (implementation detail)

---

## File and Folder Naming

### Files

- **Format**: Use **kebab-case** always
- **Matching**: Filename must match the **primary export**
  - `to-user-dto.ts` exports `toUserDto`
  - `login-request.dto.ts` exports `LoginRequestDto`
  - `password-validation.policy.ts` exports `validatePassword` (and related functions)
- **One Concept Per File**: Avoid dumping grounds like `*.types.ts` or `utils.ts`

### Folders

- **Format**: Use **plural nouns** for collections
  - ✅ `entities/`, `policies/`, `factories/`, `helpers/`, `contracts/`
  - ❌ `entity/`, `policy/`, `util/`
- **Grouping**: Organize by type/role, not by feature within a layer

```
application/
contracts/       # Not application/session/contracts/
dtos/
helpers/
use-cases/
```

---

## Boundary-Explicit Suffixes

Use suffixes to indicate architectural role and prevent "dumping ground" files.

### Suffix Reference Table

| Suffix           | Meaning                                     | Layer/Boundary         | Example Type Name           | Example File Name                 |
| :--------------- | :------------------------------------------ | :--------------------- | :-------------------------- | :-------------------------------- |
| `.entity.ts`     | Domain object with identity                 | Domain                 | `UserEntity`                | `user.entity.ts`                  |
| `.value.ts`      | Value object / Branded primitive            | Domain / Shared        | `Email`, `UserId`           | `email.value.ts`                  |
| `.policy.ts`     | Pure business rules/logic (no side effects) | Domain                 | N/A (exports functions)     | `password-validation.policy.ts`   |
| `.schema.ts`     | Zod validation schema                       | Application            | `LoginRequestSchema`        | `login-request.schema.ts`         |
| `.dto.ts`        | Data transfer object (boundary crossing)    | Application            | `LoginRequestDto`           | `login-request.dto.ts`            |
| `.helper.ts`     | Stateless orchestration logic               | Application            | N/A (exports functions)     | `read-session-token.helper.ts`    |
| `.transport.ts`  | Wire/HTTP/Cookie-only shape                 | Presentation           | `LoginTransport`            | `login.transport.ts`              |
| `.view.ts`       | Server → Client UI shape                    | Presentation           | `UserProfileView`           | `user-profile.view.ts`            |
| `.contract.ts`   | Dependency boundary interface (Port)        | Domain / Application   | `PasswordHasherContract`    | `password-hasher.contract.ts`     |
| `.adapter.ts`    | Structural Bridge (delegates/wraps)         | Infrastructure         | `AuthUserRepositoryAdapter` | `auth-user-repository.adapter.ts` |
| `.repository.ts` | Concrete Persistence Implementation         | Infrastructure         | `AuthUserRepository`        | `auth-user.repository.ts`         |
| `.service.ts`    | Concrete Logic Implementation               | Infrastructure         | `BcryptPasswordHasher`      | `bcrypt-password.service.ts`      |
| `.dal.ts`        | Raw data access logic                       | Infrastructure         | N/A (exports functions)     | `get-user-by-email.dal.ts`        |
| `.mapper.ts`     | Data translation between layers             | All (context-specific) | N/A (exports functions)     | `user-row-to-entity.mapper.ts`    |
| `.factory.ts`    | Dependency injection / Wiring               | Infrastructure         | N/A (exports functions)     | `login-use-case.factory.ts`       |
| `.record.ts`     | Database row shape (from Drizzle schema)    | Infrastructure         | `UserRow`                   | `user.record.ts`                  |
| `.use-case.ts`   | Single business capability                  | Application            | `LoginUseCase` (class)      | `login.use-case.ts`               |
| `.workflow.ts`   | Multi-step orchestration                    | Application            | N/A (exports functions)     | `login.workflow.ts`               |
| `.action.ts`     | Next.js Server Action                       | Presentation           | N/A (exports functions)     | `login.action.ts`                 |
| `.event.ts`      | Domain or system event                      | Domain / Application   | `UserCreatedEvent`          | `user-created.event.ts`           |

### Hard Rules

- **No `*.types.ts` files** — Always use a specific suffix that reveals the type's role
- **Suffix redundancy required** — Type name and file name should both include the suffix
  - ✅ `LoginRequestDto` in `login-request.dto.ts`
  - ❌ `LoginRequest` in `login-request.dto.ts` (missing suffix in type name)
  - ❌ `LoginRequestDto` in `login-request.ts` (missing suffix in file name)

---

## Identifying Implementations vs. Bridges

To prevent naming collisions and clarify intent:

1. **Implementations** should be named after the technology or specific role:

- ✅ `auth-user.repository.ts` (Class: `AuthUserRepository`)
- ✅ `bcrypt-password.service.ts` (Class: `BcryptPasswordService`)

2. **Bridges (Adapters)** should be named after the Contract they satisfy:

- ✅ `auth-user-repository.adapter.ts` (Satisfies `AuthUserRepositoryContract`)
- ✅ `password-hasher.adapter.ts` (Satisfies `PasswordHasherContract`)

---

## DTO Naming Guidelines

**Rule**: DTOs should be named after their **use case context**, not the entity they represent.

### Intentional vs Generic Naming

| Context                    | ✅ Good (Intentional)  | ❌ Bad (Generic) | Why                           |
| :------------------------- | :--------------------- | :--------------- | :---------------------------- |
| Login input                | `LoginRequestDto`      | `UserDto`        | Reveals it's for login        |
| Authenticated user output  | `AuthenticatedUserDto` | `UserDto`        | Shows it excludes password    |
| User lookup query          | `UserLookupQueryDto`   | `UserQueryDto`   | Specific to lookup operation  |
| Session principal identity | `SessionPrincipalDto`  | `UserDto`        | Minimal identity for sessions |
| Public user profile        | `PublicUserProfileDto` | `UserDto`        | Public-facing subset          |

### DTO Naming Patterns

| Pattern                    | Usage                                         | Example                |
| :------------------------- | :-------------------------------------------- | :--------------------- |
| `{Action}RequestDto`       | Input to a use case                           | `LoginRequestDto`      |
| `{Action}ResponseDto`      | Output from a use case (when specific needed) | `LoginResponseDto`     |
| `{Context}{Entity}Dto`     | Entity subset for specific context            | `AuthenticatedUserDto` |
| `{Entity}{Action}QueryDto` | Query parameters for repository methods       | `UserLookupQueryDto`   |
| `{Entity}{Role}Dto`        | Entity subset based on role/visibility        | `PublicUserProfileDto` |

### When to Use Generic Names

Only use generic entity-based DTO names (`UserDto`) when:

1. The DTO truly represents the canonical, stable representation across ALL contexts
2. It's used in multiple unrelated use cases
3. There's no ambiguity about which subset/variation is meant

**Guidance**: Prefer specific names. Generic names invite drift.

---

## Mapper Placement & Naming

Mappers convert data between architectural boundaries. Placement depends on **what they convert**.

### Mapper Placement Rules

| Conversion              | Layer          | Location                         | Naming Pattern                     | Example                           |
| :---------------------- | :------------- | :------------------------------- | :--------------------------------- | :-------------------------------- |
| Transport → DTO         | Presentation   | Inline in actions (rarely files) | N/A                                | `extractFormData(formData)`       |
| DTO → Entity            | Application    | `application/mappers/`           | `to-{entity}.mapper.ts`            | `to-user-entity.mapper.ts`        |
| Entity → DTO            | Application    | `application/mappers/`           | `to-{dto}.mapper.ts`               | `to-authenticated-user.mapper.ts` |
| Row → Entity            | Infrastructure | `infrastructure/mappers/`        | `{entity}-row-to-entity.mapper.ts` | `user-row-to-entity.mapper.ts`    |
| Entity → Row            | Infrastructure | `infrastructure/mappers/`        | `{entity}-to-row.mapper.ts`        | `user-entity-to-row.mapper.ts`    |
| Error → Domain Error    | Infrastructure | `infrastructure/mappers/`        | `{source}-error.mapper.ts`         | `pg-error.mapper.ts`              |
| Domain Error → UI Error | Presentation   | `presentation/` or helpers       | `to-{ui-type}.mapper.ts`           | `to-form-error.mapper.ts`         |

### Mapper Function Naming

Follow the standard verb vocabulary (see below).

```typescript
// ✅ Good: Clear transformation direction
export function toUserEntity(dto: CreateUserDto): UserEntity { ... }
export function toAuthenticatedUserDto(entity: UserEntity): AuthenticatedUserDto { ... }
export function toUserRow(entity: UserEntity): InsertUser { ... }

// ❌ Bad: Ambiguous or verbose
export function mapUser(dto: CreateUserDto): UserEntity { ... }
export function convertDtoToEntity(dto: CreateUserDto): UserEntity { ... }
```

### Special Case: Pure Mapping in Policies

**Question**: When can mappers live in `domain/policies/`?

**Answer**: Only when the mapping **encodes business semantics**, not just structural transformation.

```typescript
// ✅ Good: Belongs in domain/policies/ (encodes business rule: "omit password")
export function toAuthenticatedUserDto(
  entity: AuthUserEntity,
): AuthenticatedUserDto {
  const { password, ...safe } = entity;
  return safe; // Business rule: never expose password
}

// ❌ Bad: Belongs in infrastructure/mappers/ (structural only)
export function toUserEntity(row: UserRow): UserEntity {
  return {
    id: toUserId(row.id),
    email: row.email,
    username: row.username,
  };
}
```

**Guideline**: If the mapper could change based on business requirements (e.g., "also omit email for guests"), it's a policy. If it's purely structural, it's a mapper.

---

## Policy Naming

Policies contain pure business logic with no side effects.

### File Naming Patterns

| Pattern                       | Usage                                       | Example                                |
| :---------------------------- | :------------------------------------------ | :------------------------------------- |
| `{domain-concept}.policy.ts`  | Multiple related rules for a domain concept | `password.policy.ts`                   |
| `{specific-rule}.policy.ts`   | Single-purpose, standalone policy           | `validate-password-strength.policy.ts` |
| `{action}-{entity}.policy.ts` | Policy governing a specific action          | `evaluate-session-lifecycle.policy.ts` |

### Recommendation

- **Multi-function files**: Use domain concept naming (`session.policy.ts`, `authorization.policy.ts`)
  - Group related rules together
  - Easier to discover all rules for a concept

- **Single-function files**: Use specific rule naming when:
  - The policy is complex enough to warrant its own file
  - It's referenced across multiple other policies
  - You want to highlight its importance in the architecture

```typescript
// ✅ Good: Multiple related rules grouped by concept
// password.policy.ts
export function validatePasswordStrength(password: string): boolean { ... }
export function requiresPasswordChange(lastChanged: Date): boolean { ... }
export function makeRandomPassword(length: number): string { ... }

// ✅ Also Good: Single important rule with clear name
// evaluate-session-lifecycle.policy.ts
export function evaluateSessionLifecyclePolicy(session: SessionEntity): Decision { ... }
```

---

## Function Naming: Verb Vocabulary

Reduce synonym drift by sticking to these standard verbs.

### Standard Verb Table

| Verb         | Usage                                           | Returns            | Side Effects | Example                     |
| :----------- | :---------------------------------------------- | :----------------- | :----------- | :-------------------------- |
| `toX`        | Pure mapping/transformation                     | Transformed value  | None         | `toUserDto(entity)`         |
| `fromX`      | Reverse transformation (when `to` is ambiguous) | Transformed value  | None         | `fromJson(string)`          |
| `normalizeX` | Convert foreign/unsafe input to canonical shape | Normalized value   | None         | `normalizePgError(err)`     |
| `extractX`   | Pull info from unknown/complex values           | Value or undefined | None         | `extractMetadata(error)`    |
| `makeX`      | Simple factory/constructor                      | New object         | None         | `makeAppError(key)`         |
| `createX`    | Complex factory (use for DI factories)          | New object         | Possible     | `createUserUseCase()`       |
| `buildX`     | Builder pattern (accumulates state)             | Builder or value   | None         | `buildQuery().where()...`   |
| `isX`        | Type guard                                      | Boolean            | None         | `isAppError(err)`           |
| `hasX`       | Capability/metadata check                       | Boolean            | None         | `hasMetadata(error)`        |
| `canX`       | Authorization/permission check                  | Boolean            | None         | `canUserDelete(user, post)` |
| `shouldX`    | Business rule decision                          | Boolean            | None         | `shouldRotateSession(s)`    |
| `getX`       | Safe access (may return undefined)              | Value or undefined | None         | `getFieldErrors(result)`    |
| `findX`      | Search operation (may return null)              | Value or null      | Possible     | `findUserById(id)`          |
| `fetchX`     | Remote/async retrieval                          | Value or error     | Yes          | `fetchFromApi(url)`         |
| `validateX`  | Validation logic                                | Boolean or errors  | None         | `validatePassword(pw)`      |
| `evaluateX`  | Complex business rule evaluation                | Decision object    | None         | `evaluateSessionPolicy(s)`  |
| `calculateX` | Computation/derivation                          | Computed value     | None         | `calculateDiscount(user)`   |
| `generateX`  | Produce new value (may have randomness)         | Generated value    | Possible     | `generateToken()`           |

### Verbs to Avoid

| ❌ Avoid     | ✅ Use Instead | Reason              |
| :----------- | :------------- | :------------------ |
| `mapX`       | `toX`          | Ambiguous direction |
| `convertX`   | `toX`          | Verbose             |
| `transformX` | `toX`          | Verbose             |
| `parseX`     | `fromX`, `toX` | Overloaded meaning  |
| `processX`   | Specific verb  | Vague               |
| `handleX`    | Specific verb  | Vague               |
| `doX`        | Specific verb  | Redundant           |

### Naming Examples

```typescript
// ✅ Good: Clear, standard verbs
export function toUserDto(entity: UserEntity): UserDto { ... }
export function isAuthenticated(user: UserEntity | null): boolean { ... }
export function canDeletePost(user: UserEntity, post: PostEntity): boolean { ... }
export function makeAppError(key: string, metadata?: Metadata): AppError { ... }
export function evaluateSessionLifecycle(session: SessionEntity): Decision { ... }
export function normalizeDbError(error: unknown): AppError { ... }

// ❌ Bad: Non-standard or vague verbs
export function mapUserToDto(entity: UserEntity): UserDto { ... }
export function convertUserEntity(entity: UserEntity): UserDto { ... }
export function processSession(session: SessionEntity): Decision { ... }
export function handleError(error: unknown): AppError { ... }
```

---

## Contract vs Adapter Naming

### Contracts (Interfaces)

**Location**: `domain/services/` or `application/contracts/`

**Naming**:

- File: `{capability}.contract.ts`
- Type: `{Capability}Contract`
- Consumer-centric names that hide implementation details

**Generic vs Domain-Specific**:

```typescript
// ✅ Good: Generic contract (reusable across modules)
// password-hasher.contract.ts
export interface PasswordHasherContract {
  hash(password: string): Promise<Hash>;
  compare(password: string, hash: Hash): Promise<boolean>;
}

// ✅ Good: Domain-specific contract (single module)
// session-token-service.contract.ts
export interface SessionTokenServiceContract {
  issue(request: IssueTokenRequest): Promise<Result<IssueTokenDto, AppError>>;
  decode(token: string): Promise<Result<SessionTokenClaims, AppError>>;
}
```

### Adapters (Implementations)

**Location**: `infrastructure/adapters/`

**Naming**:

- File: `{technology}-{capability}.adapter.ts`
- Class: `{Technology}{Capability}Adapter`
- Implementation-revealing names

```typescript
// ✅ Good: Technology in adapter name
// bcrypt-hasher.adapter.ts
export class BcryptHasherAdapter implements PasswordHasherContract { ... }

// cookie-session.adapter.ts
export class CookieSessionAdapter implements SessionStoreContract { ... }

// jwt-token.adapter.ts
export class JwtTokenAdapter implements SessionTokenServiceContract { ... }
```

### Dependency Injection Naming

In use cases and workflows, **use the contract name** (without "Contract" suffix):

```typescript
// ✅ Good: Consumer-centric dependency names
export class LoginUseCase {
  constructor(
    private readonly userRepo: UserRepositoryContract,
    private readonly hasher: PasswordHasherContract,
    private readonly logger: LoggerContract,
  ) {}
}

// ❌ Bad: Implementation-leaky names
export class LoginUseCase {
  constructor(
    private readonly userAdapter: UserRepositoryContract,
    private readonly bcryptHasher: PasswordHasherContract,
    private readonly pgRepo: UserRepositoryContract,
  ) {}
}
```

---

## Repository Naming

### Repository Contracts

**Location**:

- `domain/repositories/` (when working with entities)
- `application/contracts/` (when working with DTOs or use-case-specific)

**Naming**:

```typescript
// ✅ Domain repository (entity-focused)
// domain/repositories/user-repository.contract.ts
export interface UserRepositoryContract {
  findById(id: UserId): Promise<Result<UserEntity | null, AppError>>;
  save(user: UserEntity): Promise<Result<void, AppError>>;
}

// ✅ Application repository (DTO/use-case-focused)
// application/contracts/auth-user-repository.contract.ts
export interface AuthUserRepositoryContract {
  login(
    query: UserLookupQueryDto,
  ): Promise<Result<AuthUserEntity | null, AppError>>;
  signup(request: SignupRequestDto): Promise<Result<AuthUserEntity, AppError>>;
}
```

### Repository Implementations

**Location**: `infrastructure/repositories/`

**Naming**:

- File: `{entity}.repository.ts`
- Class: `{Entity}Repository` (implements `{Entity}RepositoryContract`)

```typescript
// ✅ Good
// infrastructure/repositories/user.repository.ts
export class UserRepository implements UserRepositoryContract {
  constructor(
    private readonly db: Database,
    private readonly logger: LoggerContract,
  ) {}

  async findById(id: UserId): Promise<Result<UserEntity | null, AppError>> {
    const rowResult = await getUserByIdDal(this.db, id, this.logger);
    if (!rowResult.ok) return rowResult;

    return Ok(rowResult.value ? toUserEntity(rowResult.value) : null);
  }
}
```

---

## Use Case and Workflow Naming

### Use Cases

**Location**: `application/use-cases/`

**Naming**:

- File: `{action}.use-case.ts`
- Class: `{Action}UseCase`
- Action should be a verb in base form

```typescript
// ✅ Good
// login.use-case.ts
export class LoginUseCase { ... }

// create-user.use-case.ts
export class CreateUserUseCase { ... }

// refresh-session.use-case.ts
export class RefreshSessionUseCase { ... }
```

### Workflows

**Location**: `application/use-cases/` (collocated with use cases)

**Naming**:

- File: `{action}.workflow.ts`
- Function: `{action}Workflow`

```typescript
// ✅ Good
// login.workflow.ts
export async function loginWorkflow(
  input: LoginRequestDto,
  deps: LoginDependencies,
): Promise<Result<SessionPrincipalDto, AppError>> { ... }
```

**Use Case vs Workflow**:

- **Use Case**: Single business capability, exposed to presentation layer
- **Workflow**: Orchestrates multiple use cases/services, handles cross-cutting concerns (error mapping, transactions)

---

## Helper Naming

**Location**: `application/helpers/` or module-specific `helpers/`

**Naming**:

- File: `{verb}-{noun}.helper.ts` (kebab-case)
- Function: `{verb}{Noun}Helper` (camelCase)

```typescript
// ✅ Good
// read-session-token.helper.ts
export async function readSessionTokenHelper(
  deps: SessionDependencies,
): Promise<Result<SessionToken, AppError>> { ... }

// validate-and-refresh-session.helper.ts
export async function validateAndRefreshSessionHelper(
  deps: SessionDependencies,
): Promise<Result<SessionPrincipal, AppError>> { ... }

// make-auth-use-case-logger.helper.ts
export function makeAuthUseCaseLoggerHelper(
  logger: LoggerContract,
  useCase: string,
): LoggerContract { ... }
```

**When to Use Helpers**:

- Reusable logic shared across multiple use cases
- Doesn't warrant a full use case (not exposed to presentation layer)
- Simplifies orchestration in workflows

---

## DAL Naming

**Location**: `infrastructure/dal/` or `infrastructure/persistence/dal/`

**Naming**:

- File: `{verb}-{entity}-{specifics}.dal.ts`
- Function: `{verb}{Entity}{Specifics}Dal`
- Use explicit action verbs

```typescript
// ✅ Good: Clear CRUD operations
// get-user-by-id.dal.ts
export async function getUserByIdDal(
  db: Database,
  id: UserId,
  logger: LoggerContract,
): Promise<Result<UserRow | null, AppError>> { ... }

// get-user-by-email.dal.ts
export async function getUserByEmailDal(...): Promise<...> { ... }

// insert-user.dal.ts
export async function insertUserDal(...): Promise<...> { ... }

// update-user-email.dal.ts
export async function updateUserEmailDal(...): Promise<...> { ... }

// delete-user.dal.ts
export async function deleteUserDal(...): Promise<...> { ... }
```

**DAL Verb Vocabulary**:

- `get{Entity}By{Field}` — Single record retrieval
- `find{Entities}By{Criteria}` — Multi-record query
- `list{Entities}` — Get all or paginated list
- `insert{Entity}` — Create new record
- `update{Entity}{Field}` — Partial update
- `save{Entity}` — Full update/upsert
- `delete{Entity}` — Hard delete
- `archive{Entity}` — Soft delete

---

## Type Naming

### General Rules

- **Format**: PascalCase always
- **Suffix Inclusion**: Always include the suffix
  - ✅ `LoginRequestDto`, `UserEntity`, `PasswordHasherContract`
  - ❌ `LoginRequest`, `User`, `PasswordHasher`

### Interface vs Type Alias

- **Interfaces**: Use for contracts and extendable structures

  ```typescript
  export interface PasswordHasherContract { ... }
  export interface UserEntity { ... }
  ```

- **Type Aliases**: Use for unions, intersections, utility types, and DTOs
  ```typescript
  export type AuthenticatedUserDto = Readonly<Omit<UserEntity, "password">>;
  export type SessionLifecycleAction = "continue" | "rotate" | "terminate";
  export type Result<T, E> = Ok<T> | Err<E>;
  ```

### Technology/Integration Scoping

When a type is tied to a specific external system, include the technology name:

```typescript
// ✅ Good: Technology prefix for integration-specific types
export interface PgErrorMetadata { ... }
export interface StripePaymentIntent { ... }
export interface JwtTokenClaims { ... }

// ✅ Good: Generic for domain concepts
export interface ErrorMetadata { ... }
export interface PaymentIntent { ... }
export interface TokenClaims { ... }
```

---

## Test File Naming

**Rule**: Test files must mirror the file they test.

```

src/
  modules/
    auth/
      domain/
        policies/
          password.policy.ts
          password.policy.test.ts  ✅
          __tests__/
            password.policy.test.ts  ✅ (alternative, if many tests)
```

**Naming Pattern**: `{filename}.test.ts` or `{filename}.spec.ts`

**Organization**:

- **Co-located**: Place test file next to source file (preferred for small tests)
- \***\*tests** folder\*\*: Use for suites with multiple test files or fixtures

---

## Constant and Token Naming

### Constants

**Location**: Module-level `constants/` folder or inline in files

**Naming**:

- File: `{domain}-{type}.constants.ts`
- Export: `SCREAMING_SNAKE_CASE`

```typescript
// ✅ Good
// auth-session.constants.ts
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// routes.constants.ts
export const ROUTES = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
  },
  dashboard: {
    root: "/dashboard",
  },
} as const;
```

### Dependency Injection Tokens

**Location**: Module root or `constants/`

**Naming**:

- File: `{module}.tokens.ts`
- Export: `SCREAMING_SNAKE_CASE`

```typescript
// ✅ Good
// auth.tokens.ts
export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");
export const PASSWORD_HASHER = Symbol("PASSWORD_HASHER");
export const SESSION_SERVICE = Symbol("SESSION_SERVICE");
```

---

## Practical Examples

### Example: Login Flow Naming

```

modules/auth/
  domain/
    entities/
      user.entity.ts              → UserEntity
      session.entity.ts           → SessionEntity
    policies/
      password.policy.ts          → validatePassword(), makeRandomPassword()
      authorization.policy.ts     → canUserAccess(), evaluatePermissions()
    repositories/
      user-repository.contract.ts → UserRepositoryContract
    services/
      password-hasher.contract.ts → PasswordHasherContract

  application/
    dtos/
      login-request.dto.ts        → LoginRequestDto
      authenticated-user.dto.ts   → AuthenticatedUserDto
      session-principal.dto.ts    → SessionPrincipalDto
    schemas/
      login-request.schema.ts     → LoginRequestSchema
    mappers/
      to-authenticated-user.mapper.ts → toAuthenticatedUserDto()
    helpers/
      read-session-token.helper.ts    → readSessionTokenHelper()
    use-cases/
      login.use-case.ts           → LoginUseCase
      login.workflow.ts           → loginWorkflow()

  infrastructure/
    adapters/
      auth-user-repository.adapter.ts → AuthUserRepositoryAdapter
      bcrypt-hasher.adapter.ts    → BcryptHasherAdapter
      cookie-session.adapter.ts   → CookieSessionAdapter
    repositories/
        drizzle/
          auth-user.repository.ts   → AuthUserRepository
    services/
       bcrypt-password.service.ts  → BcryptPasswordService
    dal/
      get-user-by-email.dal.ts    → getUserByEmailDal()
      insert-user.dal.ts          → insertUserDal()
    mappers/
      user-row-to-entity.mapper.ts → toUserEntity()
      pg-error.mapper.ts           → normalizePgError()
    factories/
      login-use-case.factory.ts   → makeLoginUseCase()

  presentation/
    actions/
      login.action.ts             → loginAction()
    components/
      login-form.tsx              → LoginForm
    login.transport.ts            → LoginTransport, LoginField
```

---

## Migration Checklist

To align existing code with these conventions:

- [ ] Rename generic DTOs to intentional names (`UserDto` → `AuthenticatedUserDto`)
- [ ] Add suffix redundancy to type names (`LoginRequest` → `LoginRequestDto`)
- [ ] Move entity→DTO mappers from `domain/policies/` to `application/mappers/`
- [ ] Keep only business-semantic mappers in policies
- [ ] Rename contracts to consumer-centric names (`CookieSessionContract` → `SessionStoreContract`)
- [ ] Update dependency injection to use contract names without tech details
- [ ] Standardize mapper naming with `to` prefix
- [ ] Ensure all files use kebab-case
- [ ] Remove `*.types.ts` dumping grounds
- [ ] Add technology prefixes to integration-specific types (`PgError`, `JwtClaims`)

---

## Summary

These naming conventions create a **predictable, searchable codebase** where:

1. **Intent is obvious** from file and type names
2. **Architectural role** is clear from suffixes
3. **Drift is prevented** through intentional, redundant naming
4. **Synonym confusion** is eliminated with standard verbs
5. **Boundaries are explicit** through consumer-centric naming
