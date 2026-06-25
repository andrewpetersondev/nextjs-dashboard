# Auth Application Layer

This layer contains the **business logic and use cases** for authentication and session management. It orchestrates
domain rules and coordinates infrastructure services without depending on implementation details.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Directory Structure](#directory-structure)
- [Key Concepts](#key-concepts)
- [Subdomains](#subdomains)
- [Workflows vs Use Cases](#workflows-vs-use-cases)
- [Error Handling](#error-handling)
- [Testing Strategy](#testing-strategy)

---

## Overview

The application layer serves as the **orchestration layer** between the presentation layer (UI/API) and the
domain/infrastructure layers. It:

- **Defines use cases**: Encapsulates business operations (login, signup, session management)
- **Orchestrates workflows**: Coordinates multiple use cases for complex operations
- **Enforces contracts**: Defines interfaces for infrastructure services
- **Maps data**: Transforms between domain entities and DTOs
- **Handles errors**: Converts technical errors to application-level errors

---

## Architecture Principles

### 1. **Dependency Inversion**

The application layer defines **contracts** (interfaces) that infrastructure implements:

```typescript
// Application defines the contract
export interface AuthUserRepositoryContract {
    findByEmail(
        query: AuthUserLookupQuery,
    ): Promise<Result<AuthUserEntity | null, AppError>>;
}

// Infrastructure implements it
export class AuthUserRepository implements AuthUserRepositoryContract {
    // Implementation details...
}
```

### 2. **CQRS Pattern**

Commands (writes) and queries (reads) are separated:

- **Commands**: `commands/` folder (e.g., `login.use-case.ts`, `signup.use-case.ts`)
- **Queries**: `queries/` folder (e.g., `read-session.use-case.ts`)

### 3. **Result Type for Error Handling**

All use cases return `Result<T, AppError>` instead of throwing exceptions:

```typescript
async
execute(input
:
LoginRequestDto
):
Promise < Result < AuthenticatedUserDto, AppError >> {
    // Returns Ok(data) or Err(error)
}
```

### 4. **Security by Design**

- Passwords are stripped at the domain → application boundary
- Credential enumeration is prevented in error messages
- Minimal data is included in session tokens

---

## Directory Structure

```text
application/
├── auth-user/                      # Auth user subdomain
│   ├── auth-error.factory.ts       # Auth error factory (flat file — no errors/ folder)
│   ├── commands/                   # Write operations (login, signup, create-demo-user)
│   ├── contracts/                  # Interfaces for infrastructure
│   │   ├── repositories/           # Repository contracts
│   │   └── services/               # Service contracts (password hashing, generation)
│   ├── dtos/                       # Data Transfer Objects
│   │   ├── requests/               # Input DTOs
│   │   └── responses/              # Output DTOs
│   ├── validators/                 # Input / entity validators
│   └── workflows/                  # Multi-use-case orchestration
│
├── session/                        # Session subdomain
│   ├── builders/                   # Complex DTO builders
│   ├── commands/                   # Write operations (establish, rotate, terminate)
│   ├── contracts/                  # Session service contracts
│   ├── dtos/                       # Session DTOs
│   │   ├── requests/               # Input DTOs
│   │   └── responses/              # Output DTOs
│   ├── mappers/                    # Session-specific mappers
│   ├── queries/                    # Read operations (read, require)
│   └── workflows/                  # Session workflows
│
└── shared/                         # Shared application concerns
    ├── helpers/                    # Cookie / authorization / session-cleanup helpers
    ├── logging/                    # Logging utilities
    └── mappers/                    # Cross-subdomain mappers
        └── flows/                  # Mappers organized by flow
            └── login/              # Login flow mappers (to-authenticated-user, to-session-principal)
```

---

## Key Concepts

### **Use Cases**

Encapsulate a single business operation. Each use case:

- Has a single responsibility
- Returns `Result<T, AppError>`
- Uses `safeExecute()` to catch unexpected errors
- Logs operations for observability

**Example:**

```typescript
export class LoginUseCase {
    async execute(
        input: LoginRequestDto,
    ): Promise<Result<AuthenticatedUserDto, AppError>> {
        return safeExecute(
            async () => {
                // 1. Find user by email
                // 2. Verify password
                // 3. Return authenticated user DTO
            },
            {logger, operation: "login"},
        );
    }
}
```

### **Workflows**

Orchestrate multiple use cases for complex operations:

```typescript
export async function loginWorkflow(
    input: LoginRequestDto,
    deps: { loginUseCase: LoginUseCase; sessionService: SessionServiceContract },
): Promise<Result<SessionPrincipalDto, AppError>> {
    // 1. Authenticate user (loginUseCase)
    // 2. Establish session (sessionService)
    return await establishSessionForAuthUserWorkflow(authResult, {
        sessionService,
    });
}
```

### **Contracts (Interfaces)**

Define what the application needs from infrastructure:

- **Repository contracts**: Data access (e.g., `AuthUserRepositoryContract`)
- **Service contracts**: External services (e.g., `PasswordHasherContract`, `SessionServiceContract`)

### **DTOs (Data Transfer Objects)**

Immutable data structures for layer boundaries:

- **Request DTOs**: Input validation (e.g., `LoginRequestDto`)
- **Response DTOs**: Output data (e.g., `AuthenticatedUserDto`)

### **Mappers**

Transform data between layers:

- **Domain → Application**: Strip sensitive data (e.g., remove password hash)
- **Application → Presentation**: Convert errors to UI-friendly messages
- **Application → Application**: Transform between subdomains (e.g., `AuthenticatedUserDto` → `SessionPrincipalDto`)

---

## Subdomains

### **auth-user/**

Handles user authentication and registration:

- **Commands**: `login.use-case.ts`, `signup.use-case.ts`, `create-demo-user.use-case.ts`
- **Workflows**: `login.workflow.ts`, `signup.workflow.ts`, `create-demo-user.workflow.ts`
- **Key contracts**: `AuthUserRepositoryContract`, `PasswordHasherContract`

### **session/**

Manages user sessions (JWT-based):

- **Commands**: `establish-session.use-case.ts`, `rotate-session.use-case.ts`, `terminate-session.use-case.ts`
- **Queries**: `read-session.use-case.ts`, `require-session.use-case.ts`
- **Workflows**: `establish-session-for-auth-user.workflow.ts`, `logout.workflow.ts`
- **Key contracts**: `SessionServiceContract`, `SessionStoreContract`, `SessionTokenServiceContract`

### **shared/**

Cross-cutting concerns:

- **Helpers**: Cookie operations, authorization, session cleanup
- **Logging**: Auth-specific logging utilities
- **Mappers**: Organized by flow under `flows/` — currently `login/` (signup reuses these)

---

## Workflows vs Use Cases

| Aspect           | Use Case                           | Workflow                                           |
| ---------------- | ---------------------------------- | -------------------------------------------------- |
| **Scope**        | Single business operation          | Orchestrates multiple use cases                    |
| **Dependencies** | Infrastructure contracts           | Use cases + services                               |
| **Example**      | `LoginUseCase` (authenticate user) | `loginWorkflow` (authenticate + establish session) |
| **Location**     | `commands/` or `queries/`          | `workflows/`                                       |
| **Reusability**  | High (used by workflows)           | Medium (specific orchestration)                    |

**When to use:**

- **Use Case**: Single, focused operation (e.g., verify password, create user)
- **Workflow**: Multi-step process (e.g., login = authenticate + create session)

---

## Error Handling

### **Error Flow**

```text
Infrastructure Error → AppError → Use Case → Workflow → Presentation
```

### **Error Types**

1. **Validation errors**: Invalid input (e.g., missing email)
2. **Business logic errors**: Domain rule violations (e.g., invalid credentials)
3. **Infrastructure errors**: Database failures, external service errors
4. **Unexpected errors**: Caught by `safeExecute()` and wrapped in `AppError`

### **Security Considerations**

- **Credential enumeration prevention**: Don't reveal if email exists
- **Error sanitization**: Don't leak database details to UI
- **Consistent error messages**: Use generic messages for authentication failures

**Example:**

```typescript
// ❌ BAD: Reveals if email exists
if (!user) return Err(makeError("user_not_found"));

// ✅ GOOD: Generic message
if (!user || !passwordMatch) return Err(makeError("invalid_credentials"));
```

---

## Testing Strategy

### **Unit Tests**

Test use cases in isolation with mocked dependencies:

```typescript
describe("LoginUseCase", () => {
    it("should return authenticated user on valid credentials", async () => {
        const mockRepo = {findByEmail: jest.fn().mockResolvedValue(Ok(mockUser))};
        const useCase = new LoginUseCase(mockRepo, mockHasher, mockLogger);

        const result = await useCase.execute({
            email: "test@example.com",
            password: "password",
        });

        expect(result.ok).toBe(true);
    });
});
```

### **Integration Tests**

Test workflows with real infrastructure (test database):

```typescript
describe("loginWorkflow", () => {
  it("should complete full login flow", async () => {
    // Test with real DB, real password hashing, real session creation
  });
});
```

### **What to Test**

- ✅ Happy path (successful operations)
- ✅ Error paths (invalid input, business rule violations)
- ✅ Edge cases (empty strings, null values, boundary conditions)
- ✅ Security (credential enumeration, password stripping)

---

## Related Documentation

- **[Flow Diagrams](../../../../docs/diagrams/auth-login-flow.md)**: Login, signup & session flows (diagram)
- **[Error Handling](../../../../docs/diagrams/error-handling-flow.md)**: Error handling flow (diagram)

---

## Quick Reference

### **Adding a New Use Case**

1. Create use case file in `commands/` or `queries/`
2. Define input/output DTOs in `dtos/`
3. Add validation schema in `schemas/` (if needed)
4. Implement use case with `safeExecute()`
5. Add factory in `infrastructure/composition/factories/`
6. Wire in `auth.composition.ts`
7. Add tests

### **Adding a New Workflow**

1. Create workflow file in `workflows/`
2. Identify required use cases and services
3. Orchestrate use cases in workflow function
4. Add to composition root
5. Call from presentation layer (Server Action)

### **Common Patterns**

**Use Case Pattern:**

```typescript
export class MyUseCase {
    constructor(private deps: Dependencies) {}

    execute(input: InputDto): Promise<Result<OutputDto, AppError>> {
        return safeExecute(
            async () => {
                // Business logic here
            },
            {logger, operation: "my-operation"},
        );
    }
}
```

**Workflow Pattern:**

```typescript
export async function myWorkflow(
    input: InputDto,
    deps: { useCase1: UseCase1; service: ServiceContract },
): Promise<Result<OutputDto, AppError>> {
    const result1 = await deps.useCase1.execute(input);
    if (!result1.ok) return Err(result1.error);

    return await deps.service.doSomething(result1.value);
}
```

---

## Best Practices

1. **Keep use cases focused**: One responsibility per use case
2. **Use Result type**: Never throw exceptions from use cases
3. **Log operations**: Use structured logging for observability
4. **Validate at boundaries**: Use Zod schemas for input validation
5. **Strip sensitive data**: Remove passwords when crossing boundaries
6. **Prevent credential enumeration**: Use generic error messages
7. **Test thoroughly**: Unit tests for use cases, integration tests for workflows
8. **Document flows**: Update flow documentation when adding features

---

## Maintenance

### **When to Update This Layer**

- Adding new authentication methods (e.g., OAuth, 2FA)
- Changing session management strategy
- Adding new user operations (e.g., password reset)
- Modifying error handling strategy

### **Breaking Changes**

Changes to contracts or DTOs are breaking changes. Coordinate with:

- **Infrastructure layer**: Implements contracts
- **Presentation layer**: Consumes workflows and DTOs
- **Domain layer**: Provides entities and policies

---

**Last Updated**: 2026-06-24\
**Maintainer**: Auth Module Team
