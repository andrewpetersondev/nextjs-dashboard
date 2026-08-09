# Naming Conventions & Organization

Standardized naming to ensure predictability, discoverability, and easy refactoring.

## Core Naming Principles

1. **Intentional Over Generic**: Names reveal context. `AuthenticatedUserDto` over `UserDto`.
2. **Redundancy for Clarity**: Include suffixes in both type names AND filenames.

- ✅ `LoginRequestDto` in `login-request.dto.ts`

1. **Consumer-Centric Naming**: Use Cases depend on "Contracts".
   - Avoid tech-leaky words like "Adapter" or "Pg" in Application layer dependency names.

- ✅ `sessionService: SessionServiceContract`

1. **Contract Location**:
   - Side-effect contracts (Repositories/Services) live in `application/contracts/`.
   - Domain remains 100% side-effect free logic.

2. **Port vs Infrastructure Seam (Anti-Drift Rule)**:
   - Use `*.contract.ts` / `*Contract` **only** for **Ports** that are imported by `domain/**` or `application/**`.
   - If an interface/type is used **only inside** `infrastructure/**`, it is **not** a Port. Prefer an explicit
     Infrastructure seam name like:
     - `*.strategy.ts` / `*Strategy`
     - `*.provider.ts` / `*Provider`
     - `*.client.ts` / `*Client`
   - Heuristic: if the only references are Infrastructure files (e.g., an Infrastructure adapter + an Infrastructure
     service), naming it `*Contract` is misleading and will cause “naming drift”.

---

## Boundary-Explicit Suffixes

Use suffixes to indicate architectural role and prevent "dumping ground" files.

### Suffix Reference Table

| Suffix           | Meaning                                          | Layer/Boundary         | Example Type Name           | Example File Name                 |
| :--------------- | :----------------------------------------------- | :--------------------- | :-------------------------- | :-------------------------------- |
| `.entity.ts`     | Domain object with identity                      | Domain                 | `UserEntity`                | `user.entity.ts`                  |
| `.brand.ts`      | One branded primitive — its symbol and type      | Domain / Shared        | `UserId`                    | `user-id.brand.ts`                |
| `.value.ts`      | Value object, or a brand plus its converters     | Domain / Shared        | `Hash`                      | `hashing.value.ts`                |
| `.policy.ts`     | Pure business rules/logic (no side effects)      | Domain                 | N/A (exports functions)     | `password.policy.ts`              |
| `.schema.ts`     | Zod validation schema                            | Application            | `LoginFormSchema`           | `login.form.schema.ts`            |
| `.dto.ts`        | Data transfer object (boundary crossing)         | Application            | `AuthUserCreateDto`         | `auth-user-create.dto.ts`         |
| `.command.ts`    | A use case's input — the request half of the DTO | Application            | `LoginCommand`              | `login.command.ts`                |
| `.validator.ts`  | Reusable validation over an entity or DTO        | Application / Domain   | N/A (exports functions)     | `auth-user-entity.validator.ts`   |
| `.guard.ts`      | Type guard, or a presentation access check       | Varies (see below)     | N/A (exports predicates)    | `form-result.guard.ts`            |
| `.helper.ts`     | Stateless orchestration logic                    | Application            | N/A (exports functions)     | `read-session-token.helper.ts`    |
| `.utils.ts`      | Small pure helpers with no boundary role         | `src/shared/**` only   | N/A (exports functions)     | `form-data.utils.ts`              |
| `.transport.ts`  | Wire/HTTP/Cookie-only shape                      | Presentation           | `LoginTransport`            | `login.transport.ts`              |
| `.contract.ts`   | Dependency boundary interface (Port)             | Application            | `PasswordHasherContract`    | `password-hasher.contract.ts`     |
| `.strategy.ts`   | Infrastructure-internal interface/seam           | Infrastructure         | `SessionJwtCryptoStrategy`  | `session-jwt-crypto.strategy.ts`  |
| `.adapter.ts`    | Structural Bridge (delegates/wraps)              | Infrastructure         | `AuthUserRepositoryAdapter` | `auth-user-repository.adapter.ts` |
| `.repository.ts` | Concrete Persistence Implementation              | Infrastructure         | `AuthUserRepository`        | `auth-user.repository.ts`         |
| `.service.ts`    | Concrete Logic Implementation                    | Infrastructure         | `BcryptPasswordHasher`      | `bcrypt-password.service.ts`      |
| `.dal.ts`        | Raw data access logic                            | Infrastructure         | N/A (exports functions)     | `get-user-by-email.dal.ts`        |
| `.mapper.ts`     | One conversion, named for what it produces       | All (context-specific) | N/A (exports functions)     | `to-auth-user-entity.mapper.ts`   |
| `.mappers.ts`    | Plural — the converters belonging to one type    | Domain                 | N/A (exports functions)     | `user-id.mappers.ts`              |
| `.factory.ts`    | Dependency injection / Wiring                    | Infrastructure         | N/A (exports functions)     | `login-use-case.factory.ts`       |
| `.use-case.ts`   | Single business capability                       | Application            | `LoginUseCase` (class)      | `login.use-case.ts`               |
| `.workflow.ts`   | Multi-step orchestration                         | Application            | N/A (exports functions)     | `login.workflow.ts`               |
| `.action.ts`     | Next.js Server Action                            | Presentation           | N/A (exports functions)     | `login.action.ts`                 |
| `.atom.tsx`      | Smallest reusable UI primitive                   | `src/ui/**`            | `ButtonAtom`                | `button.atom.tsx`                 |
| `.molecule.tsx`  | UI composed from atoms                           | `src/ui/**`            | `PageHeaderMolecule`        | `page-header.molecule.tsx`        |
| `.types.ts`      | Type-only companion module — **constrained**     | Any                    | N/A (types only)            | `revenue.types.ts`                |
| `.constants.ts`  | Frozen literal values                            | Any                    | `USER_ROLES`                | `schema.constants.ts`             |
| `.tokens.ts`     | Named literals reused across a surface           | Presentation / UI      | `LOGIN_HEADING`             | `auth.tokens.ts`                  |

The last three carry rules too long for a cell — see [Hard Rules](#hard-rules) for the
`.types.ts` anti-dumping-ground constraints, and
[Constant and Token Naming](#constant-and-token-naming) for the other two. The row is the
pointer; the section is the rule.

**This table is the vocabulary, not an inventory.** Every suffix above is in use; a row with no
instances is a claim the codebase does not back, so it gets removed rather than left as
aspiration. Suffixes appearing once or twice (`.wrapper.tsx`, `.inspector.ts`, `.builder.ts`,
`.config.ts`, `.deps.ts`, `.skeletons.tsx`) are deliberately not listed — they are local
descriptions, not conventions, and promoting them here would invite cargo-culting. Add a row when
a third instance appears and the suffix has started to mean something.

Three suffixes were removed on 2026-08-09 after a census found zero instances of each. Don't
reintroduce them without a file to point at:

- **`.record.ts`** (database row shape) — not needed. Row types are _inferred_ from the Drizzle
  schema and exported beside it: `export type UserRow = typeof users.$inferSelect` in
  `database/schema/users.ts`. Hand-writing a row shape would let it drift from the table.
- **`.view.ts`** (server → client UI shape) — the role is real, but `.transport.ts` and `.dto.ts`
  cover it today. Reach for one of those, or make the case for `.view.ts` with a concrete file.
- **`.event.ts`** (domain/system event) — no event bus, no domain events. It belongs here the day
  one exists, not before.

Two honest edges:

- **`.brand.ts` vs `.value.ts` overlap.** Both can declare a branded primitive. In practice
  `.brand.ts` is the narrow one — a symbol and the type it brands, nothing else — while
  `.value.ts` carries a value object or bundles a brand with its converters (`hashing.value.ts`
  exports both `Hash` and `toHash`). If you are only declaring the type, reach for `.brand.ts`.
- **`.guard.ts` spans two ideas.** Two of the three are type guards (`form-result.guard.ts`,
  `zod.guard.ts`); `session-access.guard.ts` is a presentation-layer authorization check. Both
  read as "guard" and the layer disambiguates, so this is recorded rather than legislated.

### Hard Rules

- **Avoid generic suffixes when a boundary-specific suffix is accurate**
  - Prefer `.dto.ts`, `.schema.ts`, `.contract.ts`, `.constants.ts`, `.tokens.ts`, etc. when they reflect the file’s
    role.

- **`*.types.ts` is allowed, but only under strict constraints (Anti-Dumping-Ground Rule)**\
  Use `*.types.ts` only when the file is a **type-only companion module** that does _not_ represent a boundary object.

  **Allowed for `*.types.ts`:**
  - The file exports **only** `type` / `interface` declarations (no runtime exports).
  - The types are **structural** or **utility** in nature (e.g., helper generics, internal shapes, reusable type-level
    helpers).
  - The file is **dependency-light**:
    - It may import other **type-only** modules.
    - It must not import runtime modules (anything that would generate JS).
  - The file should be **narrowly scoped**:
    - Prefer placing them under a `types/` folder (e.g., `forms/core/types/...`).

  **Not allowed for `*.types.ts`:**
  - DTOs, transports, views, schemas, ports/contracts.
  - “Everything type-related for this feature/capability” mega-files.
  - Runtime values (constants, functions, classes).

  **If you’re tempted to put runtime exports in a `*.types.ts` file, it’s a sign the file name is wrong.**

- **Suffix redundancy required for boundary objects**
  - ✅ `LoginRequestDto` in `login-request.dto.ts`
  - ✅ `PasswordHasherContract` in `password-hasher.contract.ts`
  - ❌ `LoginRequest` in `login-request.dto.ts` (missing suffix in type name)
  - ❌ `LoginRequestDto` in `login-request.ts` (missing suffix in file name)

---

## Implementation vs. Bridges

1. **Implementations**: Named after technology or role.

- ✅ `bcrypt-password.service.ts` (Class: `BcryptPasswordService`)

1. **Bridges (Adapters)**: Named after the Contract they satisfy.

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
export function toUserEntity(dto: CreateUserDto): UserEntity {
    // ...
}

export function toAuthenticatedUserDto(
    entity: UserEntity,
): AuthenticatedUserDto {
    // ...
}

export function toUserRow(entity: UserEntity): InsertUser {
    // ...
}
```

```typescript
// ❌ Bad: Ambiguous
export function mapUser(dto: CreateUserDto): UserEntity {
    // ...
}
```

### Singular `.mapper.ts` vs plural `.mappers.ts`

The placement table above covers the singular form: one conversion across a layer boundary, in a
`mappers/` folder, filed under the verb-first name of what it produces —
`to-auth-user-entity.mapper.ts`.

The plural is a different shape and lives in `domain/`: it is named **subject-first, after the
type**, and holds that type's own converters — `user-id.mappers.ts` exports `toUserId` and
`toUserIdResult`. Four of the five are branded-primitive constructors (`customer-id`,
`invoice-id`, `user-id`, `period`), which is the case worth recognizing: converting _into_ a brand
belongs to the brand, not to a layer crossing.

Choose by the question the filename answers. "Which conversion is this?" → singular, verb-first.
"Where do this type's converters live?" → plural, subject-first. Do not use the plural merely
because a file happens to export two functions.

> `logging.mappers.ts` (infrastructure, `toSafeErrorShape`) is the one file that fits neither
> description. It is a single boundary conversion and would read better as
> `to-safe-error-shape.mapper.ts`; left alone for now, noted so it is not copied.

### Special Case: Pure Mapping in Policies

**Question**: When can mappers live in `domain/policies/`?

**Answer**: Only when the mapping **encodes business semantics**, not just structural transformation.

```typescript
// ✅ Good: Belongs in domain/policies/ (encodes business rule: "omit password")
export function toAuthenticatedUserDto(
    entity: AuthUserEntity,
): AuthenticatedUserDto {
    const {password, ...safe} = entity;
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

**Guideline**: If the mapper could change based on business requirements (e.g., "also omit email for guests"), it's a
policy. If it's purely structural, it's a mapper.

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
export function validatePasswordStrength(password: string): boolean {
    // ...
}

export function requiresPasswordChange(lastChanged: Date): boolean {
    // ...
}

export function makeRandomPassword(length: number): string {
    // ...
}

// ✅ Also Good: Single important rule with clear name
// evaluate-session-lifecycle.policy.ts
export function evaluateSessionLifecyclePolicy(
    session: SessionEntity,
): Decision {
    // ...
}
```

---

## Function Naming: Verb Vocabulary

Reduce synonym drift by sticking to these standard verbs.

### Standard Verb Table

| Verb             | Usage                                           | Returns            | Side Effects | Example                     |
| :--------------- | :---------------------------------------------- | :----------------- | :----------- | :-------------------------- |
| `toX`            | Pure mapping/transformation                     | Transformed value  | None         | `toUserDto(entity)`         |
| `fromX`          | Reverse transformation (when `to` is ambiguous) | Transformed value  | None         | `fromJson(string)`          |
| `normalizeX`     | Convert foreign/unsafe input to canonical shape | Normalized value   | None         | `normalizePgError(err)`     |
| `extractX`       | Pull info from unknown/complex values           | Value or undefined | None         | `extractMetadata(error)`    |
| `makeX`          | Simple factory/constructor                      | New object         | None         | `makeAppError(key)`         |
| `{thing}Factory` | Complex factory (use for DI factories)          | New object         | Possible     | `userUseCaseFactory()`      |
| `buildX`         | Builder pattern (accumulates state)             | Builder or value   | None         | `buildQuery().where()...`   |
| `isX`            | Type guard                                      | Boolean            | None         | `isAppError(err)`           |
| `hasX`           | Capability/metadata check                       | Boolean            | None         | `hasMetadata(error)`        |
| `canX`           | Authorization/permission check                  | Boolean            | None         | `canUserDelete(user, post)` |
| `shouldX`        | Business rule decision                          | Boolean            | None         | `shouldRotateSession(s)`    |
| `getX`           | Safe access (may return undefined)              | Value or undefined | None         | `getFieldErrors(result)`    |
| `findX`          | Search operation (may return null)              | Value or null      | Possible     | `findUserById(id)`          |
| `fetchX`         | Remote/async retrieval                          | Value or error     | Yes          | `fetchFromApi(url)`         |
| `validateX`      | Validation logic                                | Boolean or errors  | None         | `validatePassword(pw)`      |
| `evaluateX`      | Complex business rule evaluation                | Decision object    | None         | `evaluateSessionPolicy(s)`  |
| `calculateX`     | Computation/derivation                          | Computed value     | None         | `calculateDiscount(user)`   |
| `generateX`      | Produce new value (may have randomness)         | Generated value    | Possible     | `generateToken()`           |

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
export function toUserDto(entity: UserEntity): UserDto {
    // ...
}

export function isAuthenticated(user: UserEntity | null): boolean {
    // ...
}

export function canDeletePost(user: UserEntity, post: PostEntity): boolean {
    // ...
}

export function makeAppError(key: string, metadata?: Metadata): AppError {
    // ...
}

export function evaluateSessionLifecycle(session: SessionEntity): Decision {
    // ...
}

export function normalizeDbError(error: unknown): AppError {
    // ...
}

// ❌ Bad: Non-standard or vague verbs
export function mapUserToDto(entity: UserEntity): UserDto {
    // ...
}

export function convertUserEntity(entity: UserEntity): UserDto {
    // ...
}

export function processSession(session: SessionEntity): Decision {
    // ...
}

export function handleError(error: unknown): AppError {
    // ...
}
```

---

## Contract vs Adapter Naming

### Contracts (Interfaces)

**Location**: `application/contracts/`

**Meaning**: A Contract is a **Port** owned by the inner layers (Domain/Application) and implemented by Infrastructure.

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

### Strategies (Infrastructure seams)

**Location**: `infrastructure/**/strategies/` (or another clearly Infrastructure-only folder)

**Meaning**: A Strategy is an **internal Infrastructure seam** used to swap technical mechanisms (libraries, algorithms)
without claiming to be an Application/Domain Port.

**Naming**:

- File: `{capability}.strategy.ts`
- Type: `{Capability}Strategy`
- Infrastructure-internal names that reveal technical concern

```typescript
// ✅ Good: Infrastructure-only seam for swapping JWT libraries
// infrastructure/strategies/session-jwt-crypto.strategy.ts
export interface SessionJwtCryptoStrategy {
    sign(payload: Record<string, unknown>, expiresInMs: number): Promise<string>;

    verify(token: string): Promise<Record<string, unknown> | null>;
}

// ✅ Good: Infrastructure-only seam for swapping storage backends
// infrastructure/strategies/file-storage.strategy.ts
export interface FileStorageStrategy {
    upload(key: string, data: Buffer): Promise<string>;

    download(key: string): Promise<Buffer | null>;
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
export class BcryptHasherAdapter implements PasswordHasherContract {
    // ...
}

// cookie-session.adapter.ts
export class CookieSessionAdapter implements SessionStoreContract {
    // ...
}

// jwt-token.adapter.ts
export class JwtTokenAdapter implements SessionTokenServiceContract {
    // ...
}
```

### Dependency Injection Naming

In use cases and workflows, **use the contract name** (without "Contract" suffix):

```typescript
// ✅ Good: Consumer-centric dependency names
export class LoginUseCase {
    private readonly userRepo: UserRepositoryContract;
    private readonly hasher: PasswordHasherContract;
    private readonly logger: LoggerContract;

    constructor(
        userRepo: UserRepositoryContract,
        hasher: PasswordHasherContract,
        logger: LoggerContract,
    ) {
        this.userRepo = userRepo;
        this.hasher = hasher;
        this.logger = logger;
    }
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

**Location**: `application/contracts/`

All repository contracts live in the application layer. Contracts imply side effects (I/O), so placing them in domain
would violate domain purity.

**Naming**:

```typescript
// ✅ Good: Entity-focused repository contract
// application/contracts/user-repository.contract.ts
export interface UserRepositoryContract {
    findById(id: UserId): Promise<Result<UserEntity | null, AppError>>;

    save(user: UserEntity): Promise<Result<void, AppError>>;
}

// ✅ Good: Use-case-focused repository contract
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
    private readonly db: Database;
    private readonly logger: LoggerContract;

    constructor(db: Database, logger: LoggerContract) {
        this.db = db;
        this.logger = logger;
    }

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
export class LoginUseCase {
    // ...
}

// create-user.use-case.ts
export class CreateUserUseCase {
    // ...
}

// refresh-session.use-case.ts
export class RefreshSessionUseCase {
    // ...
}
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
): Promise<Result<SessionPrincipalDto, AppError>> {
    // ...
}
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
): Promise<Result<SessionToken, AppError>> {
    // ...
}
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
export async function getUserByEmailDal(...): Promise<Result<UserRow | null, AppError>> { ... }

// insert-user.dal.ts
export async function insertUserDal(...): Promise<Result<UserRow, AppError>> { ... }

// update-user-email.dal.ts
export async function updateUserEmailDal(...): Promise<Result<UserRow, AppError>> { ... }

// delete-user.dal.ts
export async function deleteUserDal(...): Promise<Result<void, AppError>> { ... }
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
export interface PgErrorMetadata {...}

export interface StripePaymentIntent {...}

export interface JwtTokenClaims {...}

// ✅ Good: Generic for domain concepts
export interface ErrorMetadata {...}

export interface PaymentIntent {...}

export interface TokenClaims {...}
```

---

## Test File Naming

**Rule**: Test files must mirror the file they test.

```text
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
- **`__tests__` folder**: Use for suites with multiple test files or fixtures

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

### Tokens

**There are no dependency-injection tokens in this codebase, and `.tokens.ts` is not where you
would put them.** Dependencies are wired by explicit factories and a composition root
(`auth.composition.ts`) — see [Dependency Injection Naming](#dependency-injection-naming) and
`.factory.ts` above. Nothing resolves a service by symbol, so there is no registry to key.

What `.tokens.ts` actually holds is **named literals reused across one surface** — the values you
want written down once so a rename is a single edit and a typo is a type error:

**Location**: beside the surface that consumes them (`presentation/constants/`, `ui/styles/`)

**Naming**:

- File: `{surface}.tokens.ts`
- Export: `SCREAMING_SNAKE_CASE`

```typescript
// ✅ Good
// auth.tokens.ts — copy shared by the auth screens
export const LOGIN_HEADING = "Log in to your account" as const;
export const SIGNUP_HEADING = "Sign up for an account" as const;

// icons.tokens.ts — a class string several components must agree on
export const INPUT_ICON_CLASS = "...";
```

Prefer `.constants.ts` when the values are domain facts rather than presentation choices
(`USER_ROLES`, `INVOICE_STATUSES`). The dividing line is whether changing the value is a design
decision or a business one.

---

## Folder Organization (Modular Clean Architecture)

```text
modules/{feature}/
domain/
entities/
policies/
application/
contracts/       # Ports (Contracts) live here
dtos/
use-cases/
mappers/
infrastructure/
repositories/    # Concrete implementations
adapters/        # Bridges to Ports
strategies/      # Infrastructure seams (internal)
factories/       # DI wiring
presentation/
actions/         # Server Actions
components/      # UI
```
