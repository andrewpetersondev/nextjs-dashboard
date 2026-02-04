### Complete Login Flow Analysis: UI → Database → UI

I've traced the entire login process through your auth module. Here's the comprehensive flow with organizational
improvements and identified gaps.

---

## 📊 Complete Login Flow Diagram

### **Forward Flow: UI → Database**

```
┌─────────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ 1. login.action.ts (Server Action)                                  │
│    ├─ Validates FormData against LoginRequestSchema                 │
│    ├─ Calls makeAuthComposition() for DI                            │
│    └─ Invokes auth.workflows.login(input)                           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER - WORKFLOWS                                        │
├─────────────────────────────────────────────────────────────────────┤
│ 2. login.workflow.ts                                                 │
│    ├─ Orchestrates authentication + session establishment           │
│    ├─ Calls loginUseCase.execute(input)                             │
│    └─ Calls establishSessionForAuthUserWorkflow(authResult)         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER - USE CASES (Commands)                             │
├─────────────────────────────────────────────────────────────────────┤
│ 3. login.use-case.ts (LoginUseCase)                                 │
│    ├─ Calls repo.findByEmail({ email })                             │
│    ├─ Calls hasher.compare(password, user.password)                 │
│    └─ Maps to AuthenticatedUserDto via toAuthenticatedUserDto()     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER - ADAPTERS                                      │
├─────────────────────────────────────────────────────────────────────┤
│ 4. auth-user-repository.adapter.ts                                  │
│    └─ Delegates to authUsers.findByEmail(query)                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER - REPOSITORIES                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 5. auth-user.repository.ts                                           │
│    ├─ Calls getUserByEmailDal(db, email, logger)                    │
│    └─ Maps UserRow to AuthUserEntity via toAuthUserEntity()         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER - DAL (Data Access Layer)                       │
├─────────────────────────────────────────────────────────────────────┤
│ 6. get-user-by-email.dal.ts                                          │
│    ├─ Executes Drizzle ORM query: db.select().from(users)           │
│    ├─ WHERE eq(users.email, email)                                  │
│    └─ Returns UserRow | null wrapped in Result                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE                                                             │
├─────────────────────────────────────────────────────────────────────┤
│ 7. PostgreSQL users table                                            │
│    └─ Returns user record with hashed password                      │
└─────────────────────────────────────────────────────────────────────┘
```

### **Return Flow: Database → UI**

```
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE → DAL                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ UserRow { id, email, username, password, role }                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE - MAPPER                                              │
├─────────────────────────────────────────────────────────────────────┤
│ toAuthUserEntity(row) → AuthUserEntity                               │
│ ├─ Converts id to branded UserId                                    │
│ ├─ Converts password to Hash type                                   │
│ └─ Parses role to UserRole enum                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION - MAPPER                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ toAuthenticatedUserDto(entity) → AuthenticatedUserDto                │
│ └─ Strips password hash (security boundary)                         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION - SESSION WORKFLOW                                       │
├─────────────────────────────────────────────────────────────────────┤
│ establishSessionForAuthUserWorkflow()                                │
│ ├─ Maps to SessionPrincipalDto via toSessionPrincipal()             │
│ └─ Calls sessionService.establish(principal)                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION - SESSION USE CASE                                       │
├─────────────────────────────────────────────────────────────────────┤
│ EstablishSessionUseCase.execute()                                    │
│ ├─ Calls sessionTokenService.issue({ userId, role })                │
│ ├─ Generates JWT with exp, iat, nbf claims                          │
│ └─ Calls setSessionCookieAndLogHelper() to set cookie               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE - SESSION TOKEN SERVICE                               │
├─────────────────────────────────────────────────────────────────────┤
│ SessionTokenService.issue()                                          │
│ ├─ Creates JWT claims (userId, role, exp, iat, nbf)                 │
│ ├─ Calls codec.encode() → SessionTokenCodecAdapter                  │
│ └─ Uses jose library to sign JWT                                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE - SESSION STORE                                       │
├─────────────────────────────────────────────────────────────────────┤
│ SessionCookieStoreAdapter.set()                                      │
│ └─ Sets HTTP-only secure cookie via Next.js cookies()               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PRESENTATION - SERVER ACTION RESPONSE                                │
├─────────────────────────────────────────────────────────────────────┤
│ login.action.ts                                                      │
│ ├─ On success: revalidatePath() + redirect()                        │
│ └─ On error: toLoginFormResult() → FormResult with field errors     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ UI COMPONENT                                                         │
├─────────────────────────────────────────────────────────────────────┤
│ login-form.tsx (React component)                                     │
│ └─ Displays errors or redirects to dashboard                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Key Data Transformations

| Layer                   | Input Type             | Output Type            | Mapper/Function               |
|-------------------------|------------------------|------------------------|-------------------------------|
| **DAL → Repository**    | `UserRow`              | `AuthUserEntity`       | `toAuthUserEntity()`          |
| **Use Case → Workflow** | `AuthUserEntity`       | `AuthenticatedUserDto` | `toAuthenticatedUserDto()`    |
| **Workflow → Session**  | `AuthenticatedUserDto` | `SessionPrincipalDto`  | `toSessionPrincipal()`        |
| **Session → Token**     | `SessionPrincipalDto`  | `IssuedTokenDto`       | `SessionTokenService.issue()` |
| **Error → UI**          | `AppError`             | `FormResult<never>`    | `toLoginFormResult()`         |

---

## 🚨 Identified Organizational Gaps

### **Gap 1: Missing Flow Documentation** ⚠️ HIGH PRIORITY

**Issue:** No visual documentation of the complete login flow exists in the codebase.

**Impact:**

- New developers struggle to understand the full authentication flow
- Difficult to identify where to add new features (e.g., 2FA, rate limiting)
- Hard to debug issues that span multiple layers

**Recommendation:**

```
src/modules/auth/notes/
├── flowcharts.md                    # EXISTS
├── sequence-diagrams.md             # EXISTS
└── flows/                           # NEW: Add detailed flow docs
    ├── login-flow.md                # Complete login flow
    ├── signup-flow.md               # Complete signup flow
    ├── session-lifecycle.md         # Session creation/rotation/termination
    └── data-transformations.md      # All mapper chains
```

---

### **Gap 2: Mapper Chain Not Obvious** ⚠️ MEDIUM PRIORITY

**Issue:** Data passes through 4+ mappers, but the chain isn't documented or co-located.

**Current Mapper Locations:**

```
infrastructure/persistence/auth-user/mappers/
└── to-auth-user-entity.mapper.ts           # UserRow → AuthUserEntity

application/auth-user/mappers/
├── to-authenticated-user.mapper.ts         # AuthUserEntity → AuthenticatedUserDto
└── pg-unique-violation-to-signup-conflict-error.mapper.ts

application/session/mappers/
├── to-session-principal.mapper.ts          # AuthenticatedUserDto → SessionPrincipalDto
└── to-session-token-claims-dto.mapper.ts

presentation/authn/mappers/
└── auth-form-error.mapper.ts               # AppError → FormResult
```

**Problem:** Mappers are scattered across 4 different folders, making it hard to trace data flow.

**Recommendation:** Add a mapper index/registry:

```typescript
// NEW FILE: src/modules/auth/application/shared/mappers/mapper-chains.ts

/**
 * Documents the complete data transformation chains in the auth module.
 *
 * This file serves as a reference for understanding how data flows and
 * transforms between layers.
 */

export const AUTH_MAPPER_CHAINS = {
    login: {
        forward: [
            "UserRow → AuthUserEntity (toAuthUserEntity)",
            "AuthUserEntity → AuthenticatedUserDto (toAuthenticatedUserDto)",
            "AuthenticatedUserDto → SessionPrincipalDto (toSessionPrincipal)",
            "SessionPrincipalDto → IssuedTokenDto (SessionTokenService.issue)",
        ],
        error: ["AppError → FormResult (toLoginFormResult)"],
    },
    // ... other flows
} as const;
```

---

### **Gap 3: No Explicit Boundary Validation** ✅ FIXED

**Status:** Fixed. Added `validateAuthUserEntity` calls in `AuthUserRepository`.

**Issue:** Data crosses layer boundaries without explicit validation at each boundary.

**Current Flow:**

```
FormData → LoginRequestDto (validated) → Use Case → Repository → DAL
```

**Missing Validations:**

- ✅ **Presentation → Application:** LoginRequestSchema validates input
- ✅ **Application → Domain:** `validateAuthUserEntity` is called in `AuthUserRepository` after mapping
- ❌ **Domain → Infrastructure:** No validation before DAL operations
- ✅ **Infrastructure → Application:** Validated via repository boundary checks

**Recommendation:** Add boundary validators:

```typescript
// NEW: application/auth-user/validators/auth-user-entity.validator.ts
export function validateAuthUserEntity(
    entity: AuthUserEntity
): Result<AuthUserEntity, AppError> {
    // Validate domain invariants
    if (!entity.email.includes('@')) {
        return Err(makeAppError('validation', {...}));
    }
    return Ok(entity);
}
```

---

### **Gap 4: Session Token Flow Not Clear** ⚠️ MEDIUM PRIORITY

**Issue:** Session token creation involves 3 services but the orchestration isn't obvious.

**Current Structure:**

```
SessionService
  └─ EstablishSessionUseCase
      ├─ SessionTokenService.issue()
      │   └─ SessionTokenCodecAdapter.encode()
      │       └─ JoseSessionJwtCryptoService.sign()
      └─ SessionCookieStoreAdapter.set()
```

**Problem:**

- 4 levels of indirection
- Hard to understand what each layer does
- Difficult to add features like token refresh, blacklisting

**Recommendation:** Add a session flow diagram and simplify:

```
application/session/
└── README.md                        # NEW: Document session architecture
    ├─ Token issuance flow
    ├─ Token validation flow
    ├─ Cookie management
    └─ Security considerations
```

---

### **Gap 5: Error Handling Path Not Documented** ⚠️ HIGH PRIORITY

**Issue:** Errors can originate from 6+ different layers, but the error handling strategy isn't documented.

**Error Sources:**

1. **DAL Layer:** Database errors (connection, constraint violations)
2. **Repository Layer:** Mapping errors
3. **Use Case Layer:** Business logic errors (invalid credentials)
4. **Workflow Layer:** Orchestration errors
5. **Session Layer:** Token/cookie errors
6. **Presentation Layer:** Validation errors

**Current Error Flow:**

```
DAL Error → executeDalResult() → Result<T, AppError>
  → Repository → Result<T, AppError>
  → Use Case → Result<T, AppError>
  → Workflow → Result<T, AppError>
  → Server Action → toLoginFormResult() → FormResult
```

**Missing:**

- No documentation of which errors can occur at each layer
- No error recovery strategies documented
- No error logging strategy documented

**Recommendation:** Create error handling documentation:

```
src/modules/auth/notes/
└── error-handling.md                # NEW: Complete error handling guide
    ├─ Error types by layer
    ├─ Error transformation rules
    ├─ Error recovery strategies
    ├─ Logging requirements
    └─ Security considerations (don't leak info)
```

---

### **Gap 6: Missing Observability Touchpoints** ⚠️ LOW PRIORITY

**Issue:** Logging exists but performance tracking is inconsistent.

**Current Logging:**

- ✅ Server Action: PerformanceTracker + structured logging
- ✅ DAL: Operation logging
- ❌ Use Case: No performance tracking
- ❌ Repository: No performance tracking
- ❌ Session Service: No performance tracking

**Recommendation:** Add consistent performance tracking:

```typescript
// Use Case example
export class LoginUseCase {
    async execute(input: LoginRequestDto): Promise<Result<>> {
        const tracker = new PerformanceTracker();

        const userResult = await tracker.measure('repo.findByEmail', () =>
            this.repo.findByEmail({email: input.email})
        );

        const passwordResult = await tracker.measure('hasher.compare', () =>
            this.hasher.compare(input.password, user.password)
        );

        this.logger.operation('info', 'Login use case completed', {
            duration: tracker.getTotalDuration(),
            timings: tracker.getAllTimings(),
        });
    }
}
```

---

### **Gap 7: No Integration Test for Complete Flow** ⚠️ HIGH PRIORITY

**Issue:** No test that validates the entire login flow from action to database and back.

**Missing Tests:**

- ❌ End-to-end login flow test
- ❌ Error propagation test (DB error → UI error)
- ❌ Session establishment test
- ❌ Cookie setting test

**Recommendation:** Add integration tests:

```typescript
// NEW: src/modules/auth/__tests__/integration/login-flow.test.ts

describe("Login Flow Integration", () => {
    it("should complete full login flow: action → db → session → cookie", async () => {
        // 1. Setup test database with user
        // 2. Call loginAction with FormData
        // 3. Verify database query was made
        // 4. Verify password was checked
        // 5. Verify session token was created
        // 6. Verify cookie was set
        // 7. Verify redirect occurred
    });

    it("should propagate DB errors to UI correctly", async () => {
        // Test error flow
    });
});
```

---

## ✅ Organizational Improvements

### **Improvement 1: Add Flow Documentation Folder**

```
src/modules/auth/notes/
├── flowcharts.md
├── sequence-diagrams.md
└── flows/                           # NEW
    ├── README.md                    # Overview of all flows
    ├── login-flow.md                # Detailed login flow (like this doc)
    ├── signup-flow.md
    ├── session-lifecycle.md
    ├── data-transformations.md      # All mapper chains
    └── error-handling.md            # Error flow documentation
```

### **Improvement 2: Add Layer README Files**

Each major layer should have a README explaining its responsibilities:

```
application/
├── README.md                        # NEW: Application layer overview
├── auth-user/
│   ├── README.md                    # NEW: Auth user subdomain
│   ├── commands/
│   │   └── README.md                # NEW: Command pattern explanation
│   └── workflows/
│       └── README.md                # EXISTS: Keep and enhance
└── session/
    └── README.md                    # NEW: Session subdomain

infrastructure/
├── README.md                        # NEW: Infrastructure layer overview
├── persistence/
│   └── README.md                    # NEW: Persistence patterns
└── session/
    └── README.md                    # NEW: Session infrastructure

presentation/
└── README.md                        # NEW: Presentation layer overview
```

### **Improvement 3: Add Mapper Registry**

Create a central registry that documents all mappers and their purposes:

```typescript
// NEW: application/shared/mappers/mapper-registry.ts

export const MAPPER_REGISTRY = {
    // Infrastructure → Domain
    "UserRow → AuthUserEntity": {
        file: "infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper.ts",
        purpose: "Converts database row to domain entity with branded types",
        security: "Includes password hash (sensitive)",
    },

    // Domain → Application
    "AuthUserEntity → AuthenticatedUserDto": {
        file: "application/auth-user/mappers/to-authenticated-user.mapper.ts",
        purpose: "Strips sensitive data (password) for application layer",
        security: "Removes password hash (security boundary)",
    },

    // Application → Application (Session)
    "AuthenticatedUserDto → SessionPrincipalDto": {
        file: "application/session/mappers/to-session-principal.mapper.ts",
        purpose: "Extracts only session-relevant data (id, role)",
        security: "Minimal data for JWT claims",
    },

    // Application → Presentation
    "AppError → FormResult": {
        file: "presentation/authn/mappers/auth-form-error.mapper.ts",
        purpose: "Converts domain errors to UI-friendly form errors",
        security: "Prevents credential enumeration attacks",
    },
} as const;
```

### **Improvement 4: Add Architecture Decision Records (ADRs)**

Document key architectural decisions:

```
src/modules/auth/notes/adr/
├── 001-use-result-type-for-error-handling.md
├── 002-separate-commands-and-queries.md
├── 003-use-branded-types-for-ids.md
├── 004-strip-passwords-at-application-boundary.md
├── 005-use-jwt-for-session-tokens.md
└── 006-prevent-credential-enumeration.md
```

### **Improvement 5: Reorganize Mappers by Flow**

Group mappers by the flow they support rather than by layer:

**Current:**

```
application/auth-user/mappers/
├── to-authenticated-user.mapper.ts
└── pg-unique-violation-to-signup-conflict-error.mapper.ts

application/session/mappers/
├── to-session-principal.mapper.ts
└── to-session-token-claims-dto.mapper.ts
```

**Proposed:**

```
application/shared/mappers/
├── flows/                           # NEW: Group by flow
│   ├── login/
│   │   ├── to-authenticated-user.mapper.ts
│   │   ├── to-session-principal.mapper.ts
│   │   └── to-login-form-result.mapper.ts
│   ├── signup/
│   │   ├── to-authenticated-user.mapper.ts
│   │   ├── to-session-principal.mapper.ts
│   │   ├── to-signup-form-result.mapper.ts
│   │   └── pg-unique-violation-to-signup-conflict-error.mapper.ts
│   └── session/
│       ├── to-session-token-claims-dto.mapper.ts
│       └── jwt-to-session-token-claims-dto.mapper.ts
└── mapper-registry.ts               # Central registry
```

**Pros:**

- ✅ Easy to see all transformations for a specific flow
- ✅ Reduces cognitive load when working on a feature
- ✅ Makes it obvious if mappers are duplicated

**Cons:**

- ⚠️ Some mappers are shared between flows (need to decide on placement)
- ⚠️ Requires refactoring imports

**Alternative (Less Disruptive):**
Keep current structure but add a `mapper-registry.ts` that documents the flow chains.

---

## 🎯 Recommended Action Plan

### **Phase 1: Documentation (Immediate - Low Risk)**

1. ✅ **Create flow documentation**
    - Add `notes/flows/login-flow.md` (based on this analysis)
    - Add `notes/flows/data-transformations.md`
    - Add `notes/flows/error-handling.md`

2. ✅ **Add mapper registry**
    - Create `application/shared/mappers/mapper-registry.ts`
    - Document all mapper chains

3. ✅ **Add layer README files**
    - `application/README.md`
    - `infrastructure/README.md`
    - `presentation/README.md`

**Estimated Effort:** 4-6 hours  
**Risk:** None (documentation only)

---

### **Phase 2: Observability (Short-term - Low Risk)**

4. ✅ **Add performance tracking to use cases**
    - Add `PerformanceTracker` to `LoginUseCase`
    - Add `PerformanceTracker` to `EstablishSessionUseCase`
    - Log timings for each major operation

5. ✅ **Add boundary logging**
    - Log when data crosses layer boundaries
    - Log mapper transformations (at debug level)

**Estimated Effort:** 2-3 hours  
**Risk:** Low (additive changes only)

---

### **Phase 3: Testing (Medium-term - Medium Risk)**

6. ✅ **Add integration tests**
    - Create `__tests__/integration/login-flow.test.ts`
    - Test complete flow from action to database
    - Test error propagation

7. ✅ **Add mapper tests**
    - Test each mapper in isolation
    - Test mapper chains

**Estimated Effort:** 8-12 hours  
**Risk:** Medium (requires test infrastructure setup)

---

### **Phase 4: Refactoring (Long-term - Higher Risk)**

8. ⚠️ **Consider mapper reorganization**
    - Evaluate grouping mappers by flow
    - Refactor if team agrees it improves clarity

9. ⚠️ **Add boundary validators**
    - Add validation at layer boundaries
    - Ensure domain invariants are enforced

**Estimated Effort:** 16-24 hours  
**Risk:** High (requires careful refactoring and testing)

---

## 📋 Summary of Findings

### **What's Working Well ✅**

1. **Clear layer separation:** Presentation → Application → Domain → Infrastructure
2. **Consistent Result type usage:** Errors propagate cleanly through layers
3. **Security-conscious design:** Password stripping, credential enumeration prevention
4. **Structured logging:** Good logging at action and DAL layers
5. **Dependency injection:** Clean composition root with factories

### **What Needs Improvement ⚠️**

1. **Flow documentation:** No visual documentation of complete flows
2. **Mapper visibility:** Hard to trace data transformations across layers
3. **Error handling docs:** Error flow not documented
4. **Integration tests:** No tests for complete flows
5. **Performance tracking:** Inconsistent across layers
6. **Boundary validation:** No explicit validation at layer boundaries

### **Priority Improvements**

| Priority   | Improvement              | Effort | Risk   | Impact |
|------------|--------------------------|--------|--------|--------|
| **HIGH**   | Add flow documentation   | 4-6h   | None   | High   |
| **HIGH**   | Add integration tests    | 8-12h  | Medium | High   |
| **MEDIUM** | Add mapper registry      | 2h     | None   | Medium |
| **MEDIUM** | Add performance tracking | 2-3h   | Low    | Medium |
| **LOW**    | Add boundary validators  | 16-24h | High   | Medium |

---

## 🎓 Key Insights from Flow Analysis

### **1. Data Transformation Chain is Long but Necessary**

The login flow involves 4 mapper transformations:

```
UserRow → AuthUserEntity → AuthenticatedUserDto → SessionPrincipalDto → JWT
```

**Why this is good:**

- Each transformation serves a clear purpose (security, layer isolation)
- Password is stripped at the right boundary (domain → application)
- JWT contains minimal data (principle of least privilege)

**Improvement:** Document this chain explicitly so developers understand why each step exists.

---

### **2. Error Handling is Consistent but Undocumented**

All layers use `Result<T, AppError>` consistently, which is excellent. However:

- No documentation of which errors can occur at each layer
- No guide for adding new error types
- Security implications (credential enumeration) not documented

**Improvement:** Add error handling documentation with examples.

---

### **3. Session Establishment is Complex**

Session creation involves:

```
SessionService → EstablishSessionUseCase → SessionTokenService →
SessionTokenCodecAdapter → JoseSessionJwtCryptoService → SessionCookieStoreAdapter
```

**Why this is complex:**

- JWT signing (crypto)
- Cookie setting (HTTP)
- Logging and error handling at each step

**Improvement:** Add a session architecture diagram showing all components and their responsibilities.

---

### **4. The Composition Root is Well-Designed**

The `makeAuthComposition()` function cleanly wires all dependencies:

- Per-request logger with context
- Database connection
- All use cases and workflows
- Session service

**This is excellent!** No improvements needed here.

---

## 🔗 Related Files Reference

For quick navigation, here are all the files involved in the login flow:

### **Presentation Layer**

- `presentation/authn/actions/login.action.ts` - Entry point
- `presentation/authn/mappers/auth-form-error.mapper.ts` - Error mapping

### **Application Layer**

- `application/auth-user/workflows/login.workflow.ts` - Orchestration
- `application/auth-user/commands/login.use-case.ts` - Business logic
- `application/auth-user/mappers/to-authenticated-user.mapper.ts` - DTO mapping
- `application/session/workflows/establish-session-for-auth-user.workflow.ts` - Session orchestration
- `application/session/commands/establish-session.use-case.ts` - Session creation
- `application/session/mappers/to-session-principal.mapper.ts` - Session mapping

### **Infrastructure Layer**

- `infrastructure/composition/auth.composition.ts` - DI container
- `infrastructure/persistence/auth-user/adapters/auth-user-repository.adapter.ts` - Repository adapter
- `infrastructure/persistence/auth-user/repositories/auth-user.repository.ts` - Repository implementation
- `infrastructure/persistence/auth-user/dal/get-user-by-email.dal.ts` - Database query
- `infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper.ts` - Entity mapping
- `infrastructure/session/services/session.service.ts` - Session service
- `infrastructure/session/services/session-token.service.ts` - Token service
- `infrastructure/session/adapters/session-cookie-store.adapter.ts` - Cookie management

---

## 🚀 Next Steps

1. **Review this analysis** with your team
2. **Prioritize improvements** based on your current needs
3. **Start with Phase 1** (documentation) - low risk, high value
4. **Create issues/tickets** for each improvement
5. **Implement incrementally** to avoid disruption

Would you like me to:

- Create detailed documentation for any specific flow?
- Generate the mapper registry file?
- Write integration test examples?
- Create ADR templates?
