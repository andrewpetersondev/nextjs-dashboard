---
apply: by file patterns
patterns: src/modules/**/*.ts
---

# Clean Architecture Standards

Rules for maintaining strict architectural boundaries and ensuring business logic remains independent of frameworks and drivers.

## Core Principles

1.  **Strict Dependency Rule**: Source code dependencies must point only inwards.

- `Domain` knows NOTHING about `Application`, `Infrastructure`, or `Presentation`.
- `Application` knows NOTHING about `Infrastructure` or `Presentation`.

2.  **Persistence Ignorance**: The Domain layer must not contain database-specific logic or know how data is stored.
3.  **Library Independence**: Domain entities and core business logic must remain pure TypeScript. Avoid third-party library dependencies (including Zod) in domain entities and policies.
4.  **Framework Isolation**: `domain/` and `application/` must never import from `next/*`, `react`, or any DB-specific libraries (Drizzle, Prisma, etc.).
5.  **Testability**: Business rules must be testable in isolation using mocks for Ports (Contracts). Use Cases should be verifiable using pure Vitest without a browser or database.

## Layer Responsibilities & Mapping

| Layer            | Responsibility             | Contents                                                                                     |
| :--------------- | :------------------------- | :------------------------------------------------------------------------------------------- |
| `domain`         | Enterprise Business Rules  | Entities (interfaces), Value Objects, Policies (pure functions).                             |
| `application`    | Application Business Rules | Use Cases, Workflows, DTOs, Contracts (Ports), Schemas (Zod), Mappers, Helpers.              |
| `infrastructure` | Technical Details          | Repository Implementations, Adapters, DAL, Mappers (row ↔ entity), Framework-specific logic. |
| `presentation`   | Delivery Mechanism         | UI Components, Server Actions, Form Validation, Transport types.                             |

## Dependency Constraints & Boundaries

### Domain Layer Rules

**Purpose**: Define the **what** of your business—entities and rules—without any side-effect concerns.

- **Allowed Imports**:
  - Primitives and TypeScript utilities
  - Shared domain types (`@/shared/domain/`)
- **Forbidden Imports**:
  - Application layer (DTOs, schemas, use cases, contracts)
  - Infrastructure implementations
  - Zod, Drizzle, Next.js, React

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

- **Policies** (`policies/`): Pure functions encoding invariants.

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

- ❌ **Repository/Service Contracts** (move to `application/contracts/`)
- ❌ **Zod schemas** (move to `application/schemas/`)
- ❌ **DTOs** (move to `application/dtos/`)

### Application Layer Rules

**Purpose**: Define **application-specific business rules** and orchestrate domain logic to fulfill use cases.

- **Allowed Imports**:
  - Domain layer (entities, policies)
  - Shared utilities (`@/shared/`)
  - Zod for schema validation
- **Forbidden Imports**:
  - Infrastructure implementations (classes, concrete adapters)
  - Database libraries (Drizzle, Prisma)
  - Presentation layer

**What Belongs Here**:

- **Use Cases** (`use-cases/`): Single-responsibility business operations.
- **Contracts** (`contracts/`): Interfaces defining dependencies (Ports) for repositories and services.
- **Workflows** (`use-cases/`): Multi-step orchestrations.

- **Use Cases** (`use-cases/`): Single-responsibility business operations

  ```typescript
  // ✅ Good: Depends on contracts, not implementations
  export class LoginUseCase {
    private readonly userRepo: AuthUserRepositoryContract;
    private readonly hasher: PasswordHasherContract;
    private readonly logger: LoggerContract;

    constructor(
      userRepo: AuthUserRepositoryContract,
      hasher: PasswordHasherContract,
      logger: LoggerContract,
    ) {
      this.userRepo = userRepo;
      this.hasher = hasher;
      this.logger = logger;
    }

    async execute(
      input: LoginRequestDto,
    ): Promise<Result<AuthUserEntity, AppError>> {
      // Orchestration logic only
    }
  }
  ```

- **Contracts** (`contracts/`): Interfaces defining dependencies (Ports) for repositories and services.

  ```typescript
  // ✅ Good: Consolidate all Ports here
  export interface AuthUserRepositoryContract {
    findByEmail(
      query: AuthUserLookupQueryDto,
    ): Promise<Result<AuthUserEntity | null, AppError>>;
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

- **Repositories** (`repositories/`): Concrete persistence implementations.
  - Use the `.repository.ts` suffix.
  - Handle direct DAL coordination and technology-specific logic (e.g., Drizzle).

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

- **Services** (`services/`): Concrete technical logic implementations.
  - Use the `.service.ts` suffix for implementations (e.g., `bcrypt-password.service.ts`).

- **Adapters** (`adapters/`): Structural bridges between contracts and implementations.
  - Use the `.adapter.ts` suffix.
  - Responsibilities: satisfy the contract, delegate to the concrete implementation, and provide a stable boundary for the Application layer to consume.

  ```typescript
  // ✅ Good: Structural bridge satisfied by an implementation
  export class AuthUserRepositoryAdapter implements AuthUserRepositoryContract {
    constructor(private readonly repo: AuthUserRepository) {}
    // ... delegation ...
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

- **Factories** (`factories/`): Wire up dependencies and construct use cases.
  - Factories are responsible for instantiating the **Bridge (Adapter)** and injecting the **Implementation** into it.
  - **Explicit Wiring Rule**: Dependencies must be instantiated separately before being passed to the constructor. Avoid nested instantiation.

    ```typescript
    // ✅ Good: Explicit wiring and assignment
    export function loginUseCaseFactory(
      db: AppDatabase,
      logger: Logger,
    ): LoginUseCase {
      const repo = new AuthUserRepository(db, logger);
      const repoContract: AuthUserRepositoryContract =
        new AuthUserRepositoryAdapter(repo);

      const service = new BcryptPasswordService();
      const hasher = new BcryptPasswordHasherAdapter(service);

      return new LoginUseCase(repoContract, hasher, logger);
    }

    // ❌ Bad: Nested instantiation makes it harder to debug/trace wiring
    export function makeLoginUseCase(
      db: AppDatabase,
      logger: Logger,
    ): LoginUseCase {
      return new LoginUseCase(
        new AuthUserRepositoryAdapter(new AuthUserRepository(db, logger)),
        new BcryptHasherAdapter(new BcryptPasswordService()),
        logger,
      );
    }
    ```

**Additional Rule: Ports vs Infrastructure Seams**

Infrastructure may define internal interfaces for implementation flexibility (e.g., swapping JWT libraries).
These are **Infrastructure seams** and must not be labeled as Application/Domain Ports.

- ✅ Allowed: `infrastructure/**/strategies/*.strategy.ts` used only by Infrastructure code
- ✅ Allowed: Infrastructure services implementing Infrastructure strategies
- ❌ Avoid: Naming Infrastructure-only seams as `*.contract.ts` / `*Contract` (misleads dependency ownership)

Sanity checks:

- If `domain/**` or `application/**` imports the interface → it’s a **Port** → it belongs in `domain/**` or `application/contracts/`.
- If the interface is referenced only by `infrastructure/**` files → it’s an **Infrastructure seam** → use `Strategy/Provider/Client` naming and keep it in Infrastructure.

## Constructor Standards

To maintain consistency and avoid implicit behavior, all classes must use explicit property assignment in the constructor.

- **No Parameter Properties**: Avoid using `private readonly prop: Type` inside the constructor argument list.
- **Explicit Assignment**: Define the property in the class body and assign it in the constructor body.

```typescript
// ✅ Good: Explicit assignment
export class BcryptPasswordHasherAdapter implements PasswordHasherContract {
  private readonly service: BcryptPasswordService;

  constructor(service: BcryptPasswordService) {
    this.service = service;
  }
}

// ❌ Bad: Shorthand parameter properties
export class BcryptPasswordHasherAdapter implements PasswordHasherContract {
  constructor(private readonly service: BcryptPasswordService) {}
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

```

Presentation → Application → Domain ← Infrastructure
    ↓              ↓           ↓           ↓
Transport     →   DTO    →   Entity  ←   Row
```

1. **Domain entities never leave the application boundary** — map to DTOs before returning to presentation.
2. **Database rows never enter use cases** — map to entities in repositories.
3. **DTOs are the stable boundary** between presentation and application.

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
  private readonly hasher: PasswordHasherContract;
  private readonly uow: UnitOfWorkContract;
  private readonly emailService: EmailServiceContract;

  constructor(
    hasher: PasswordHasherContract,
    uow: UnitOfWorkContract,
    emailService: EmailServiceContract,
  ) {
    this.hasher = hasher;
    this.uow = uow;
    this.emailService = emailService;
  }

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
  application/
  infrastructure/
  presentation/
```
