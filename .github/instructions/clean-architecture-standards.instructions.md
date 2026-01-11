# Clean Architecture Standards

Rules for maintaining strict architectural boundaries and ensuring business logic remains independent of frameworks and drivers.

## Core Principles

1.  **Strict Dependency Rule**: Source code dependencies must point only inwards.

- `Domain` knows NOTHING about `Application`, `Infrastructure`, or `Presentation`.
- `Application` knows NOTHING about `Infrastructure` or `Presentation`.

2.  **Persistence Ignorance**: The Domain layer must not contain database-specific logic or know how data is stored.
3.  **Library Independence**: Domain entities and core business logic must remain pure TypeScript. Avoid third-party library dependencies (including Zod) in domain entities and policies.
4.  **Framework Isolation**: `domain/` and `application/` must never import from `next/*`, `react`, or any DB-specific libraries (Drizzle, Prisma, etc.).
5.  **Testability**: Business rules must be testable in isolation using mocks for contracts. Use Cases should be verifiable using pure Vitest without a browser or database.

## Layer Responsibilities & Mapping

| Layer            | Responsibility             | Contents                                                                                     |
| :--------------- | :------------------------- | :------------------------------------------------------------------------------------------- |
| `domain`         | Enterprise Business Rules  | Entities (interfaces only), Value Objects, Policies (pure functions), Repository Contracts.  |
| `application`    | Application Business Rules | Use Cases, Workflows, DTOs, Service Contracts (Ports), Schemas (Zod), Mappers, Helpers.      |
| `infrastructure` | Technical Details          | Repository Implementations, Adapters, DAL, Mappers (row ↔ entity), Framework-specific logic. |
| `presentation`   | Delivery Mechanism         | UI Components, Server Actions, Form Validation, Transport types.                             |

## Dependency Constraints & Boundaries

### Domain Layer Rules

**Purpose**: Define the **what** of your business—entities, rules, and required capabilities—without any **how**.

- **Allowed Imports**:
  - Primitives and TypeScript utilities
  - Shared domain types (`@/shared/domain/`)
  - Value objects and branded types from shared
  - **Nothing else**
- **Forbidden Imports**:
  - Application layer (DTOs, schemas, use cases)
  - Infrastructure implementations
  - Zod, Drizzle, Next.js, React
  - Any third-party libraries (except type-only imports if unavoidable)

**What Belongs Here**:

- **Entities** (`entities/`): Pure TypeScript interfaces representing core business concepts

  ```typescript
  // ✅ Good: Pure interface
  export interface UserEntity {
    readonly id: UserId;
    readonly email: string;
    readonly username: string;
    readonly role: UserRole;
  }
  ```

- **Policies** (`policies/`): Pure functions encoding business rules and invariants

  ```typescript
  // ✅ Good: Pure business logic
  export function validatePasswordStrength(password: string): boolean {
    return password.length >= 8 && /[A-Z]/.test(password);
  }

  export function canUserAccessResource(
    user: UserEntity,
    resource: ResourceEntity,
  ): boolean {
    return user.role === "admin" || resource.ownerId === user.id;
  }
  ```

- **Repository Contracts** (`repositories/`): Interfaces defining data access needs

  ```typescript
  // ✅ Good: Contract accepts/returns entities
  export interface UserRepositoryContract {
    findById(id: UserId): Promise<Result<UserEntity | null, AppError>>;
    save(user: UserEntity): Promise<Result<void, AppError>>;
  }
  ```

- **Service Contracts** (`services/`): Interfaces for capabilities requiring side effects
  ```typescript
  // ✅ Good: Defines capability, not implementation
  export interface PasswordHasherContract {
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
  }
  ```

**What Does NOT Belong Here**:

- ❌ Zod schemas (move to `application/schemas/`)
- ❌ DTOs (move to `application/dtos/`)
- ❌ Mappers that reference DTOs (move to `application/mappers/`)
- ❌ Any implementation logic (move to `infrastructure/`)

### Application Layer Rules

**Purpose**: Define **application-specific business rules** and orchestrate domain logic to fulfill use cases.

- **Allowed Imports**:
  - Domain layer (entities, policies, contracts)
  - Shared utilities (`@/shared/`)
  - Zod for schema validation
  - Type-only imports from infrastructure (for dependency injection)
- **Forbidden Imports**:
  - Infrastructure implementations (classes, concrete adapters)
  - Database libraries (Drizzle, Prisma)
  - Framework code (Next.js, React) except types
  - Presentation layer

**What Belongs Here**:

- **Use Cases** (`use-cases/`): Single-responsibility business operations

  ```typescript
  // ✅ Good: Depends on contracts, not implementations
  export class LoginUseCase {
    constructor(
      private readonly userRepo: UserRepositoryContract,
      private readonly hasher: PasswordHasherContract,
      private readonly logger: LoggerContract,
    ) {}

    async execute(
      input: LoginRequestDto,
    ): Promise<Result<UserEntity, AppError>> {
      // Orchestration logic only
    }
  }
  ```

- **Workflows** (`use-cases/`): Multi-step orchestrations coordinating use cases

  ```typescript
  // ✅ Good: Composes use cases and handles cross-cutting concerns
  export async function loginWorkflow(
    input: LoginRequestDto,
    deps: LoginDependencies,
  ): Promise<Result<SessionPrincipalDto, AppError>> {
    // Coordinate login + session establishment + error mapping
  }
  ```

- **DTOs** (`dtos/`): Immutable data transfer objects for boundaries

  ```typescript
  // ✅ Good: Simple, readonly interface
  export interface LoginRequestDto {
    readonly email: string;
    readonly password: string;
  }
  ```

- **Schemas** (`schemas/`): Zod validation schemas for input/output

  ```typescript
  // ✅ Good: Application-level validation
  export const LoginRequestSchema = z.strictObject({
    email: EmailSchema,
    password: PasswordSchema,
  });

  export type LoginRequestDto = z.output<typeof LoginRequestSchema>;
  ```

- **Mappers** (`mappers/`): Transform domain entities to/from DTOs

  ```typescript
  // ✅ Good: Pure transformation function
  export function toUserDto(entity: UserEntity): UserDto {
    return {
      id: entity.id,
      email: entity.email,
      username: entity.username,
    };
  }
  ```

- **Helpers** (`helpers/`): Reusable orchestration logic
  ```typescript
  // ✅ Good: Stateless coordination that doesn't warrant a full use case
  export async function readSessionTokenHelper(
    deps: SessionDependencies,
  ): Promise<Result<SessionToken | null, AppError>> {
    // Coordinate token reading and validation
  }
  ```

**What Does NOT Belong Here**:

- ❌ Direct database queries (move to `infrastructure/dal/`)
- ❌ Concrete adapter implementations (move to `infrastructure/adapters/`)
- ❌ Database row mapping (move to `infrastructure/mappers/`)
- ❌ Framework-specific code (move to `presentation/` or `infrastructure/`)

### Infrastructure Layer Rules

**Purpose**: Provide concrete implementations of contracts using specific technologies.

- **Allowed Imports**: Everything (implements contracts from domain/application)
- **Responsibility**: Translate between external systems and domain/application

**What Belongs Here**:

- **Repositories** (`repositories/`): Implement repository contracts

  ```typescript
  // ✅ Good: Implements contract, coordinates DAL + mappers
  export class UserRepository implements UserRepositoryContract {
    async findById(id: UserId): Promise<Result<UserEntity | null, AppError>> {
      const rowResult = await getUserByIdDal(this.db, id, this.logger);
      if (!rowResult.ok) return rowResult;

      const entity = rowResult.value ? toUserEntity(rowResult.value) : null;
      return Ok(entity);
    }
  }
  ```

- **Adapters** (`adapters/`): Implement service contracts

  ```typescript
  // ✅ Good: Implements contract with specific technology
  export class BcryptHasherAdapter implements PasswordHasherContract {
    async hash(plain: string): Promise<string> {
      return bcrypt.hash(plain, 10);
    }
  }
  ```

- **DAL** (`dal/`): Raw database queries wrapped in Result types

  ```typescript
  // ✅ Good: Low-level database access
  export async function getUserByIdDal(
    db: Database,
    id: UserId,
    logger: LoggerContract,
  ): Promise<Result<UserRow | null, AppError>> {
    return executeDalResult(
      async () => {
        const [row] = await db.select().from(users).where(eq(users.id, id));
        return row ?? null;
      },
      { operation: "getUserById" },
      logger,
    );
  }
  ```

- **Mappers** (`mappers/`): Convert database rows to domain entities

  ```typescript
  // ✅ Good: Infrastructure-to-domain translation
  export function toUserEntity(row: UserRow): UserEntity {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      role: row.role,
    };
  }
  ```

- **Factories** (`factories/`): Wire up dependencies and construct use cases
  ```typescript
  // ✅ Good: Dependency injection wiring
  export function makeLoginUseCase(): LoginUseCase {
    return new LoginUseCase(
      new UserRepository(db, logger),
      new BcryptHasherAdapter(),
      logger,
    );
  }
  ```

### Presentation Layer Rules

**Purpose**: Adapt application layer to the delivery mechanism (web UI, API, CLI, etc.).

- **Allowed Imports**:
  - Application layer (use cases, DTOs, schemas)
  - Shared UI utilities
  - React, Next.js, framework code
- **Forbidden Imports**:
  - Domain entities directly (use DTOs)
  - Infrastructure implementations
  - Database code

**What Belongs Here**:

- **Server Actions** (`actions/`): Thin adapters between forms and use cases

  ```typescript
  // ✅ Good: Extract, validate, call use case, map result
  export async function loginAction(
    prevState: unknown,
    formData: FormData,
  ): Promise<FormResult<LoginField>> {
    const input = extractFormData(formData);
    const validated = validateForm(input, LoginRequestSchema);
    if (!validated.ok) return validated;

    const useCase = makeLoginUseCase();
    const result = await useCase.execute(validated.value);

    return result.ok ? redirect("/dashboard") : toFormError(result.error);
  }
  ```

- **Components** (`components/`): React UI components
- **Transport Types** (`*.transport.ts`): Wire format for forms/APIs
  ```typescript
  // ✅ Good: UI-specific type definitions
  export type LoginTransport = z.input<typeof LoginRequestSchema>;
  export type LoginField = keyof LoginTransport;
  ```

## Boundary Crossing & Data Flow

### Data Flow Direction

```

Presentation → Application → Domain ← Infrastructure
    ↓              ↓           ↓           ↓
Transport     →   DTO    →   Entity  ←   Row
```

**Key Rules**:

1. **Domain entities never leave the application boundary** — always map to DTOs before returning to presentation
2. **Database rows never enter use cases** — always map to entities in repositories
3. **DTOs are the stable boundary** — presentation and application communicate via DTOs

### Mapping Responsibility Matrix

| From → To            | Layer          | Location                      | Example                     |
| :------------------- | :------------- | :---------------------------- | :-------------------------- |
| Transport → DTO      | Presentation   | Server actions                | `extractFormData()`         |
| DTO → Entity         | Application    | Use cases / helpers           | `toEntity(dto)`             |
| Entity → DTO         | Application    | `application/mappers/`        | `toDto(entity)`             |
| Row → Entity         | Infrastructure | `infrastructure/mappers/`     | `toEntity(row)`             |
| Entity → Row         | Infrastructure | `infrastructure/mappers/`     | `toRow(entity)`             |
| DTO → Transport      | Presentation   | Components / action responses | `toFormResult(dto)`         |
| Error → Form Error   | Presentation   | Server actions                | `toFormError(appError)`     |
| DB Error → App Error | Infrastructure | DAL error handlers            | `normalizePgError(dbError)` |

## Transaction & Persistence Rules

### Unit of Work Pattern

**Contract Placement**: `application/contracts/unit-of-work.contract.ts`

**Pattern**:

```typescript
// ✅ Good: Use case owns transaction boundary
export class CreateUserUseCase {
  async execute(input: CreateUserDto): Promise<Result<UserDto, AppError>> {
    // 1. Perform side effects BEFORE transaction
    const passwordHash = await this.hasher.hash(input.password);

    // 2. Execute transaction
    const result = await this.uow.withTransaction(async (tx) => {
      const userResult = await tx.users.create({
        ...input,
        password: passwordHash,
      });
      if (!userResult.ok) return userResult;

      const roleResult = await tx.roles.assignDefault(userResult.value.id);
      if (!roleResult.ok) return roleResult;

      return Ok(userResult.value);
    });

    // 3. Perform side effects AFTER transaction
    if (result.ok) {
      await this.emailService.sendWelcome(result.value.email);
    }

    return result;
  }
}
```

### Side-Effect Isolation

**Never inside transactions**:

- ❌ Password hashing (computationally expensive)
- ❌ HTTP requests / external API calls
- ❌ Cookie manipulation
- ❌ Email sending
- ❌ File system operations
- ❌ Token generation (if involves external calls)

**Always outside transactions**:

- ✅ Expensive computations
- ✅ External I/O
- ✅ Non-critical operations

### Repository Transaction Handling

- **Repositories receive transaction context** from Unit of Work
- **Repositories NEVER expose** `begin()`, `commit()`, `rollback()`
- **Single method calls are atomic** within the transaction scope

## Policies vs. Services vs. Helpers

### Decision Matrix

| Concern                                         | Pattern      | Location                       |
| :---------------------------------------------- | :----------- | :----------------------------- |
| Pure business rule with no side effects         | **Policy**   | `domain/policies/`             |
| Capability requiring side effects (hash, store) | **Service**  | Contract in `domain/services/` |
| Orchestration logic reused across use cases     | **Helper**   | `application/helpers/`         |
| Single business operation exposed to UI         | **Use Case** | `application/use-cases/`       |
| Multi-step coordination of use cases            | **Workflow** | `application/use-cases/`       |

### Policies (`.policy.ts`)

**Nature**: Pure functions, no side effects, highly testable

```typescript
// ✅ Good: Pure business logic
export function calculateDiscount(
  user: UserEntity,
  product: ProductEntity,
): number {
  if (user.role === "premium") return product.price * 0.2;
  if (product.category === "sale") return product.price * 0.1;
  return 0;
}

export function canUserDeletePost(user: UserEntity, post: PostEntity): boolean {
  return user.id === post.authorId || user.role === "admin";
}
```

### Service Contracts (`.contract.ts`)

**Nature**: Interfaces defining capabilities with side effects

```typescript
// ✅ Good: Defines capability without implementation
export interface EmailServiceContract {
  send(
    to: string,
    subject: string,
    body: string,
  ): Promise<Result<void, AppError>>;
}

export interface CacheServiceContract {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
}
```

### Helpers (`.helper.ts`)

**Nature**: Stateless orchestration reused across multiple use cases

```typescript
// ✅ Good: Reusable coordination logic
export async function validateAndRefreshSessionHelper(
  deps: SessionDependencies,
): Promise<Result<SessionPrincipal, AppError>> {
  const tokenResult = await deps.sessionStore.get();
  if (!tokenResult.ok) return tokenResult;

  const decodedResult = await deps.tokenService.decode(tokenResult.value);
  if (!decodedResult.ok) {
    await deps.sessionStore.delete();
    return decodedResult;
  }

  return Ok(decodedResult.value);
}
```

**When to use helpers vs. use cases**:

- **Use Case**: Exposed to presentation layer, represents a complete business capability
- **Helper**: Internal to application layer, reusable building block

## Schema and Validation Placement

### ❌ Current Anti-Pattern (Domain Schemas)

```typescript
// ❌ Bad: Zod in domain layer
// domain/schemas/auth-user.schema.ts
import { z } from "zod"; // Violates library independence

export const LoginSchema = z.strictObject({
  email: EmailSchema,
  password: PasswordSchema,
});
```

### ✅ Correct Pattern (Application Schemas)

```typescript
// ✅ Good: Zod in application layer
// application/schemas/login-request.schema.ts
import { z } from "zod";

export const LoginRequestSchema = z.strictObject({
  email: EmailSchema,
  password: PasswordSchema,
});

export type LoginRequestDto = z.output<typeof LoginRequestSchema>;
```

**Rule**: Zod schemas belong in the **application layer** because:

1. Validation is an application concern, not a domain concern
2. Domain should remain library-independent
3. Schemas define the boundary between presentation and application

## Screaming Architecture

### File Organization

```

auth/
  domain/
    entities/
      user.entity.ts
      session.entity.ts
    policies/
      password-validation.policy.ts
      session-lifecycle.policy.ts
      authorization.policy.ts
    repositories/
      user-repository.contract.ts
      session-repository.contract.ts
    services/
      password-hasher.contract.ts
      token-generator.contract.ts

  application/
    contracts/
      session-service.contract.ts
      unit-of-work.contract.ts
    dtos/
      login-request.dto.ts
      authenticated-user.dto.ts
      session-principal.dto.ts
    schemas/
      login-request.schema.ts
      signup-request.schema.ts
    mappers/
      user-entity-to-dto.mapper.ts
    helpers/
      session-validation.helper.ts
    use-cases/
      login.use-case.ts
      login.workflow.ts
      signup.use-case.ts
      get-session.use-case.ts

  infrastructure/
    adapters/
      bcrypt-hasher.adapter.ts
      jwt-token.adapter.ts
      cookie-session.adapter.ts
    dal/
      get-user-by-email.dal.ts
      insert-user.dal.ts
    mappers/
      user-row-to-entity.mapper.ts
      pg-error.mapper.ts
    repositories/
      user.repository.ts
    factories/
      login-use-case.factory.ts

  presentation/
    actions/
      login.action.ts
      logout.action.ts
    components/
      login-form.tsx
    *.transport.ts
```

### Naming Rules

- **One concept per file**: `login.use-case.ts`, not `auth-use-cases.ts`
- **Descriptive names**: File names should describe what they do
- **Consistent suffixes**: Use suffixes from naming-conventions.md
- **No barrel files**: Avoid `index.ts` re-exports

## Migration Strategy

To align existing code with these rules:

1. **Move Zod schemas** from `domain/schemas/` to `application/schemas/`
2. **Move DTO mappers** from `domain/policies/` to `application/mappers/`
3. **Keep pure business logic** in `domain/policies/`
4. **Extract validation policies** from schemas into pure functions
5. **Update imports** to respect dependency direction

## Why These Rules Matter

- **Maintainability**: Clear boundaries make code easier to understand and modify
- **Testability**: Pure domain logic is trivial to test without mocks
- **Flexibility**: Swap infrastructure (database, framework) without touching business logic
- **Team Scaling**: New developers understand where code belongs
- **Refactoring Safety**: Changes in one layer don't cascade to others
