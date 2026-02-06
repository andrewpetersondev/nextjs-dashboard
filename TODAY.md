### Complete Login Flow Analysis: UI → Database → UI

I've traced the entire login process through your auth module. Here's the comprehensive flow with organizational
improvements and identified gaps.

---

### **Gap 3: No Explicit Boundary Validation** ⚠️ PARTIALLY ADDRESSED

**Status:** Partially addressed. `validateAuthUserEntity` is now called in `AuthUserRepository` after mapping (
application → domain boundary), but there is still no explicit “final gate” validation immediately before
persistence/DAL operations (domain → infrastructure).

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

**Current validator (exists):**

```typescript
// src/modules/auth/application/auth-user/validators/auth-user-entity.validator.ts
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

**Next step (optional, higher risk):** add explicit validation right before DAL writes/reads in the infrastructure
boundary.

---

### **Gap 4: Session Token Flow Not Clear** ✅ FIXED

**Status:** Fixed. Session token issuance/validation + cookie responsibilities are now documented.

**Current Structure:**

```
SessionService
  └─ EstablishSessionUseCase
      ├─ SessionTokenService.issue()
      │   └─ SessionTokenCodecAdapter.encode()
      │       └─ JoseSessionJwtCryptoService.sign()
      └─ SessionCookieStoreAdapter.set()
```

**Docs added (current references):**

- `src/modules/auth/application/session/README.md`
- `src/modules/auth/notes/flows/session-lifecycle.md`
- `src/modules/auth/notes/sequence-diagrams.md`

---

### **Gap 5: Error Handling Path Not Documented** ✅ FIXED

**Status:** Fixed. Error sources, transformation rules, and security considerations are documented.

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

**Docs added (current reference):**

- `src/modules/auth/notes/flows/error-handling.md`

---

### **Gap 6: Missing Observability Touchpoints** ✅ FIXED

**Status:** Fixed. Performance tracking is now present across the critical path.

**Issue:** Logging exists but performance tracking is inconsistent.

**Current logging/metrics touchpoints (high level):**

- ✅ Presentation actions: `PerformanceTracker` + structured logging
- ✅ Use cases: `PerformanceTracker` in `LoginUseCase` and `EstablishSessionUseCase`
- ✅ DAL: operation logging

**Note:** Repository-level timing can still be added later if you want finer-grained spans.

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

### **Gap 7: No Integration Test for Complete Flow** ✅ FIXED

**Status:** Fixed. Integration coverage exists for the major auth flows.

**Integration tests (current):**

- `src/modules/auth/__tests__/integration/error-propagation.test.ts`
- `src/modules/auth/__tests__/integration/login-flow.test.ts`
- `src/modules/auth/__tests__/integration/session-rotation.test.ts`
- `src/modules/auth/__tests__/integration/signup-flow.test.ts`

**Next useful additions:** cookie assertions (if not already covered) and a regression test for credential enumeration.

---

## ✅ Organizational Improvements

### **Improvement 1: Add Flow Documentation Folder**

```
src/modules/auth/notes/
├── adr/
├── flowcharts.md
├── flows/
│   ├── README.md
│   ├── data-transformations.md
│   ├── error-handling.md
│   ├── login-flow.md
│   ├── session-lifecycle.md
│   └── signup-flow.md
└── sequence-diagrams.md
```

### **Improvement 2: Add Layer README Files**

Each major layer should have a README explaining its responsibilities:

```
src/modules/auth/application/
├── README.md
├── auth-user/
│   └── README.md
├── session/
│   └── README.md
└── shared/
    └── README.md

src/modules/auth/domain/
└── README.md

src/modules/auth/infrastructure/
├── README.md
├── persistence/
│   └── README.md
└── session/
    └── README.md

src/modules/auth/presentation/
└── README.md
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
├── flows/                           # PROPOSED: Group by flow
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
    - `src/modules/auth/notes/flows/login-flow.md`
    - `src/modules/auth/notes/flows/data-transformations.md`
    - `src/modules/auth/notes/flows/error-handling.md`

2. ✅ **Add mapper registry**
    - `src/modules/auth/application/shared/mappers/mapper-registry.ts`
    - (Optional) `src/modules/auth/application/shared/mappers/mapper-chains.ts`

3. ✅ **Add layer README files**
    - `src/modules/auth/application/README.md`
    - `src/modules/auth/domain/README.md`
    - `src/modules/auth/infrastructure/README.md`
    - `src/modules/auth/infrastructure/persistence/README.md`
    - `src/modules/auth/infrastructure/session/README.md`
    - `src/modules/auth/presentation/README.md`

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
    - `src/modules/auth/__tests__/integration/error-propagation.test.ts`
    - `src/modules/auth/__tests__/integration/login-flow.test.ts`
    - `src/modules/auth/__tests__/integration/session-rotation.test.ts`
    - `src/modules/auth/__tests__/integration/signup-flow.test.ts`

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

1. **Domain → infrastructure validation:** still no explicit “final gate” validation immediately before persistence/DAL
   operations (beyond existing boundary checks).
2. **Mapper organization:** optional refactor to group mappers by flow (higher-risk; only if the team agrees the import
   churn is worth it).
3. **Finer-grained tracing:** repository-level spans (optional) if you want more detailed timings than
   action/use-case/DAL.

### **Priority Improvements**

| Priority   | Improvement                            | Effort | Risk | Impact |
|------------|----------------------------------------|--------|------|--------|
| **HIGH**   | Add domain → infrastructure validators | 16-24h | High | Medium |
| **MEDIUM** | Add repository-level spans (optional)  | 2-4h   | Low  | Low    |
| **LOW**    | Consider mapper reorganization         | 16-24h | High | Medium |

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
