# Auth Infrastructure Review

**Date:** November 25, 2025  
**Scope:** `/src/server/auth/infrastructure`

---

## Executive Summary

The auth infrastructure layer demonstrates solid architectural patterns with good separation of concerns. However, there are several areas requiring improvement around error handling, consistency, type safety, and optimization.

**Overall Grade:** B+ (Good foundation with room for improvement)

---

## 1. Critical Issues (Must Fix)

### 1.1 Incorrect Error Construction in SessionJwtAdapter

**File:** `session-jwt.adapter.ts:66`

```typescript
throw new Error("Failed to sign session token", err as Error);
```

**Problem:** The `Error` constructor doesn't accept a second parameter. This will either cause a runtime error or silently fail to include the cause.

**Impact:** Loss of error context, making debugging difficult.

**Fix:**

```typescript
throw new Error("Failed to sign session token", { cause: err });
```

### 1.2 Missing Error Handling for Bcrypt Operations

**File:** `password-hasher-bcrypt.adapter.ts`

**Problem:** The `hash()` and `compare()` methods don't wrap bcrypt errors. If bcrypt throws (e.g., invalid input, system issues), the raw error propagates without normalization.

**Impact:** Inconsistent error handling across the application; external library errors leak to higher layers.

**Fix:** Add try-catch blocks that normalize bcrypt errors to AppError:

```typescript
async hash(raw: string): Promise<PasswordHash> {
  try {
    const hashed = await hashWithSaltRounds(raw);
    return asPasswordHash(hashed);
  } catch (err) {
    throw makeAppError("encryption", {
      cause: err,
      message: "Failed to hash password",
    });
  }
}
```

---

## 2. High Priority Issues

### 2.1 Inconsistent Singleton Pattern

**Files:**

- `session-cookie.adapter.ts` (exports singleton)
- `session-jwt.adapter.ts` (exports singleton)
- `password-hasher-bcrypt.adapter.ts` (no singleton)

**Problem:** Some adapters export singleton instances, others don't. This creates inconsistent usage patterns.

**Impact:**

- Confusion about instantiation patterns
- Potential for accidental multiple instantiations
- Harder to mock in tests

**Recommendation:** Choose one pattern:

- **Option A:** All adapters export singletons (simpler)
- **Option B:** No singletons, use factory functions (more flexible)

### 2.2 Transaction Logging Overhead

**File:** `auth-user.repository.ts`

**Problem:** Every transaction creates a `TransactionLogger` instance with UUID generation even when requestId is provided.

**Impact:** Unnecessary object allocation and UUID generation on every transaction.

**Fix:** Only generate UUID if needed, or make TransactionLogger lighter:

```typescript
const transactionId = this.requestId || randomUUID();
```

### 2.3 Exported Utility Functions Not Used Internally

**File:** `password-hasher-bcrypt.adapter.ts`

**Problem:** `hashWithSaltRounds` and `compareHash` are exported but the adapter class doesn't use them internally, creating duplicate logic paths.

**Impact:** Maintenance burden, potential for divergence.

**Fix:** Either:

1. Make the class use these functions internally, or
2. Remove exports if they're not used elsewhere

---

## 3. Medium Priority Issues

### 3.1 Missing Type Guards for Database Transactions

**File:** `auth-user.repository.ts:58`

```typescript
const dbWithTx = this.db as AppDatabase & {
  transaction<R>(scope: (tx: AppDatabase) => Promise<R>): Promise<R>;
};
```

**Problem:** Type assertion assumes transaction support exists. No runtime check.

**Impact:** Potential runtime errors if db doesn't support transactions.

**Recommendation:** Add a type guard or check:

```typescript
if (!("transaction" in this.db)) {
  throw new Error("Database does not support transactions");
}
```

### 3.2 DAL Error Payload Builder Has Default Fallback

**File:** `execute-dal.ts:12-33`

**Problem:** The `buildDalErrorPayload` function has a default case that uses `insertUser` error format, which may be misleading for other operations.

**Impact:** Incorrect error metadata for unhandled operation types.

**Fix:** Use a generic error payload or throw:

```typescript
default:
  return AuthLog.dal.generic.error(error, { operation: op, ...identifiers });
```

### 3.3 Redundant Logging Comments

**File:** `session-jwt.adapter.ts:63`

```typescript
// Removed redundant logging
```

**Problem:** Comment about removed code should not remain in production code.

**Impact:** Code noise.

**Fix:** Remove the comment.

### 3.4 SessionJwtAdapter.decode Swallows All Errors

**File:** `session-jwt.adapter.ts:77-89`

**Problem:** All JWT verification errors are logged as warnings and return `undefined`. This includes both expected (expired tokens) and unexpected (configuration errors) failures.

**Impact:** Configuration issues may go unnoticed; all failures look the same.

**Recommendation:** Differentiate between expected and unexpected errors:

```typescript
try {
  // ... verification
} catch (error: unknown) {
  if (isExpectedJwtError(error)) {
    logger.debug("JWT verification failed (expected)", { error });
  } else {
    logger.error("JWT verification failed (unexpected)", { error });
  }
  return undefined;
}
```

---

## 4. Code Quality & Consistency

### 4.1 Inconsistent Use of Readonly

**Observation:** Some classes mark all properties as `readonly` (good), others don't consistently apply it.

**Files:**

- ✅ `AuthUserRepositoryImpl` - consistent readonly
- ❌ `BcryptPasswordHasherAdapter` - no properties (N/A)
- ❌ `SessionCookieAdapter` - no properties (N/A)

**Recommendation:** Continue using `readonly` for class properties that shouldn't change after construction.

### 4.2 Constructor Parameter Order Inconsistency

**File:** `auth-user.repository.ts:28-34`

**Problem:** Constructor has optional parameters (logger, requestId) but they're not consistently positioned.

**Current:**

```typescript
constructor(db: AppDatabase, logger?: LoggingClientContract, requestId?: string)
```

**Better practice:** Group related parameters:

```typescript
constructor(
  db: AppDatabase,
  options?: {
    logger?: LoggingClientContract;
    requestId?: string;
  }
)
```

### 4.3 Missing JSDoc for Public Methods

**Files:** Multiple

**Problem:** Some adapter methods lack documentation:

- `SessionCookieAdapter.get/set/delete` - missing docs
- `SessionJwtAdapter.encode/decode` - missing docs

**Impact:** Harder to understand contract without reading implementation.

---

## 5. Performance & Optimization

### 5.1 Repeated Key Encoding Check

**File:** `session-jwt.adapter.ts:14-30`

**Problem:** `getEncodedKey()` is called on every encode/decode operation, performing checks each time.

**Current Impact:** Minimal (checks are fast), but could be optimized.

**Optimization:** Make it a class property initialized once:

```typescript
private readonly encodedKey: Uint8Array;

constructor() {
  this.encodedKey = this.initializeKey();
}
```

### 5.2 Verify Options Rebuilt Every Time

**File:** `session-jwt.adapter.ts:32-38`

**Problem:** `buildVerifyOptions()` is called for every decode, creating a new object each time.

**Impact:** Minor memory churn.

**Optimization:** Build once and cache:

```typescript
private readonly verifyOptions = this.buildVerifyOptions();
```

---

## 6. Security Considerations

### 6.1 ✅ Salt Rounds Configuration

**File:** `password-hasher-bcrypt.adapter.ts`

**Status:** Good - uses constant from domain layer (10 rounds is reasonable for 2025).

### 6.2 ✅ Session Secret Validation

**File:** `session-jwt.adapter.ts:23-27`

**Status:** Good - validates minimum key length.

**Enhancement:** Consider adding entropy check for weak secrets (e.g., repeated characters).

### 6.3 ⚠️ Missing Rate Limiting Context

**Observation:** Infrastructure layer has no hooks for rate limiting failed login attempts.

**Impact:** Must be handled elsewhere (hopefully in application layer).

**Recommendation:** Verify rate limiting exists in the application/API layer.

---

## 7. Testing Considerations

### 7.1 Singleton Pattern Hampers Testing

**Issue:** Exported singletons (`sessionCookieAdapter`, `sessionJwtAdapter`) are harder to mock.

**Impact:** Tests must either:

1. Mock the entire module
2. Use the real implementation (not ideal for unit tests)

**Recommendation:** Export factory functions or use dependency injection consistently.

### 7.2 Missing Integration Test Helpers

**Observation:** No test utilities for:

- Creating test sessions
- Mocking cookie store
- Generating test JWTs

**Impact:** Higher barriers to writing integration tests.

---

## 8. Architecture & Design Patterns

### 8.1 ✅ Good Port-Adapter Pattern

**Observation:** Clean separation between ports and adapters.

**Files:**

- Ports: `auth-user-repository.port.ts`, `password-hasher.port.ts`
- Adapters: Implementation files

**Strength:** Easy to swap implementations, test in isolation.

### 8.2 ✅ Good Transaction Pattern

**File:** `auth-user.repository.ts:48-82`

**Strength:** Clean transaction boundary with proper logging and error handling.

### 8.3 ⚠️ Thin Adapter May Be Unnecessary

**File:** `auth-user-repository.adapter.ts`

**Observation:** The adapter is extremely thin—it just delegates to the repository.

**Question:** Does this layer add value?

**Options:**

1. Keep it for consistency with other adapters
2. Remove it and use repository directly
3. Add validation/transformation logic here if needed

**Current verdict:** Keep it for now—maintains consistent architecture.

### 8.4 ✅ Excellent DAL Separation

**Files:** `dal/*.dal.ts`

**Strength:** Clear separation between repository logic and database operations. Each DAL function has single responsibility.

---

## 9. Documentation & Naming

### 9.1 ✅ Good File Organization

**Structure:**

```
infrastructure/
├── adapters/          # Port implementations
├── repository/        # Domain repositories
│   └── dal/          # Data access layer
```

**Strength:** Clear, intuitive structure.

### 9.2 ⚠️ Naming Inconsistency: "Adapter" vs "Impl"

**Observation:**

- `AuthUserRepositoryAdapter` wraps `AuthUserRepositoryImpl`
- Other adapters don't have this distinction

**Confusion:** Why does repository need both Adapter and Impl?

**Clarification needed:** Document the distinction or consolidate.

### 9.3 Missing Architecture Decision Records (ADRs)

**Gap:** No documentation explaining:

- Why both Adapter and Impl for repository
- Why singletons for some adapters
- Transaction strategy choices

**Impact:** Future maintainers will have to reverse-engineer decisions.

---

## 10. Recommended Action Items

### Priority 1 (Critical - Fix Immediately)

1. ✅ Fix `Error` constructor in `session-jwt.adapter.ts:66`
2. ✅ Add error handling to bcrypt adapter methods
3. ✅ Add runtime check for transaction support

### Priority 2 (High - Fix This Sprint)

4. ✅ Standardize singleton pattern across all adapters
5. ✅ Optimize transaction logger instantiation
6. ✅ Fix DAL error payload default case
7. ✅ Remove or internalize exported bcrypt utility functions

### Priority 3 (Medium - Next Sprint)

8. Add JSDoc to all public adapter methods
9. Differentiate expected vs unexpected JWT errors
10. Cache verify options in SessionJwtAdapter
11. Refactor repository constructor to use options object

### Priority 4 (Low - Future Improvements)

12. Add test utilities for session/JWT handling
13. Create ADRs for key architectural decisions
14. Consider entropy validation for session secrets
15. Remove code comments about removed code

---

## 11. Positive Highlights

### What's Working Well

1. ✅ **Clean Architecture**: Excellent port-adapter pattern
2. ✅ **Separation of Concerns**: DAL, Repository, and Adapters are distinct
3. ✅ **Error Handling Foundation**: Good use of AppError and normalization
4. ✅ **Logging Infrastructure**: Comprehensive logging with context
5. ✅ **Type Safety**: Strong TypeScript usage throughout
6. ✅ **Server-Only Guards**: Proper use of "server-only" imports
7. ✅ **Transaction Support**: Clean transaction boundaries

---

## Conclusion

The auth infrastructure is well-architected with good separation of concerns and strong typing. The main issues are:

1. **Error handling inconsistencies** - needs standardization
2. **Performance micro-optimizations** - minor impact but easy fixes
3. **Documentation gaps** - ADRs and JSDoc needed
4. **Testing friction** - singleton pattern makes mocking harder

**Overall Recommendation:** Address Priority 1 and 2 items, then continue with current architecture. The foundation is solid.

---

## Appendix: File Summary

| File                                | LOC | Issues   | Grade |
| ----------------------------------- | --- | -------- | ----- |
| `auth-user-repository.adapter.ts`   | 40  | 1 minor  | A-    |
| `password-hasher-bcrypt.adapter.ts` | 35  | 3 medium | B     |
| `session-cookie.adapter.ts`         | 30  | 2 minor  | A-    |
| `session-jwt.adapter.ts`            | 92  | 4 medium | B+    |
| `auth-user.repository.ts`           | 143 | 2 medium | A-    |
| `demo-user-counter.ts`              | 67  | 1 minor  | A     |
| `execute-dal.ts`                    | 62  | 2 minor  | A-    |
| `get-user-by-email.dal.ts`          | 48  | 0        | A     |
| `insert-user.dal.ts`                | 58  | 0        | A     |

**Total:** ~575 LOC across 9 files
