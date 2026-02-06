# Session Lifecycle Flow

This document describes the complete lifecycle of user sessions in the authentication module, from creation through
validation, rotation, and termination.

## 🎯 Overview

Sessions in this application use **JWT-based stateless authentication** with the following characteristics:

- **Storage**: HTTP-only, secure cookies
- **Token Type**: JWT (JSON Web Tokens) signed with HS256
- **Duration**: Configurable (default: session-based)
- **Rotation**: Automatic on certain operations
- **Validation**: On every protected route access

## 📊 Session Lifecycle Stages

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SESSION ESTABLISHMENT                                         │
│    User logs in or signs up                                      │
│    → Generate JWT with user claims                               │
│    → Set HTTP-only secure cookie                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SESSION VALIDATION                                            │
│    User accesses protected route                                 │
│    → Read cookie                                                 │
│    → Verify JWT signature                                        │
│    → Validate claims (exp, iat, nbf)                             │
│    → Extract user identity                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. SESSION ROTATION (Optional)                                   │
│    Session nearing expiration or security event                  │
│    → Issue new JWT with updated expiration                       │
│    → Replace cookie with new token                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. SESSION TERMINATION                                           │
│    User logs out or session expires                              │
│    → Delete session cookie                                       │
│    → Redirect to login                                           │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Stage 1: Session Establishment

### Entry Points

- Login successful (`login.workflow.ts`)
- Signup successful (`signup.workflow.ts`)
- Demo user creation (`create-demo-user.workflow.ts`)

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW LAYER                                                   │
│ establishSessionForAuthUserWorkflow()                            │
│ ├─ Input: AuthenticatedUserDto                                   │
│ └─ Maps to SessionPrincipalDto                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                                │
│ SessionService.establish()                                       │
│ └─ Delegates to EstablishSessionUseCase                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ USE CASE LAYER                                                   │
│ EstablishSessionUseCase.execute()                                │
│ ├─ Calls SessionTokenService.issue()                             │
│ └─ Calls SessionStore.set()                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER                                             │
│ SessionTokenService.issue()                                      │
│ ├─ Creates JWT claims (userId, role, exp, iat, nbf)             │
│ ├─ Calls SessionTokenCodecAdapter.encode()                       │
│ │   └─ Uses jose library to sign JWT                            │
│ └─ Returns IssuedTokenDto { token, expiresAtMs }                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ COOKIE STORAGE                                                   │
│ SessionCookieStoreAdapter.set()                                  │
│ ├─ Sets cookie via Next.js cookies() API                        │
│ ├─ Options: httpOnly, secure, sameSite                          │
│ └─ Max-Age calculated from expiration                            │
└─────────────────────────────────────────────────────────────────┘
```

### JWT Claims Structure

```typescript
{
  // Standard JWT claims
  exp: number; // Expiration time (Unix timestamp)
  iat: number; // Issued at (Unix timestamp)
  nbf: number; // Not before (Unix timestamp)

  // Application-specific claims
  userId: string; // User ID (branded type converted to string)
  role: UserRole; // User role (admin, user, etc.)
}
```

### Cookie Configuration

```typescript
{
  name: "session",           // Cookie name
  httpOnly: true,            // Prevents JavaScript access
  secure: true,              // HTTPS only (production)
  sameSite: "strict",       // CSRF protection (current default)
  path: "/",                 // Available site-wide
  maxAge: SESSION_DURATION_SEC  // Session duration in seconds
}
```

### Key Files

- `application/session/workflows/establish-session-for-auth-user.workflow.ts`
- `application/session/commands/establish-session.use-case.ts`
- `infrastructure/session/services/session-token.service.ts`
- `infrastructure/session/adapters/session-cookie-store.adapter.ts`

---

## ✅ Stage 2: Session Validation

### Entry Points

- Middleware on protected routes
- `SessionService.read()` or `SessionService.verify()`

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE / ROUTE HANDLER                                       │
│ Calls SessionService.read() or verify()                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                                │
│ ReadSessionUseCase.execute()                                     │
│ ├─ Calls readSessionTokenHelper()                                │
│ └─ Validates and extracts claims                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ HELPER LAYER                                                     │
│ readSessionTokenHelper()                                         │
│ ├─ Calls SessionStore.get() to read cookie                       │
│ ├─ Calls SessionTokenService.decode()                            │
│ └─ Calls SessionTokenService.validate()                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER                                             │
│ SessionTokenService.decode()                                     │
│ ├─ Calls SessionTokenCodecAdapter.decode()                       │
│ │   └─ Uses jose library to verify signature                    │
│ └─ Returns JWTPayload                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ VALIDATION LAYER                                                 │
│ SessionTokenService.validate()                                   │
│ ├─ Maps JWTPayload → SessionTokenClaimsDto                       │
│ ├─ Validates schema (Zod)                                        │
│ ├─ Validates semantics:                                          │
│ │   • exp > now (not expired)                                    │
│ │   • iat <= now (not issued in future)                          │
│ │   • nbf <= now (token is active)                               │
│ │   • exp > iat (expiration after issuance)                      │
│ │   • Clock tolerance: ±5 seconds                                │
│ └─ Returns SessionTokenClaimsDto                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Validation Checks

#### 1. Signature Verification

- JWT signature verified using secret key
- Prevents token tampering
- Fails if signature invalid

#### 2. Schema Validation (Zod)

```typescript
SessionTokenClaimsSchema = z.object({
  exp: z.number().int().positive(),
  iat: z.number().int().positive(),
  nbf: z.number().int().positive(),
  userId: z.string().min(1),
  role: UserRoleSchema,
});
```

#### 3. Semantic Validation

```typescript
// Clock tolerance for distributed systems
const CLOCK_TOLERANCE_SEC = 5;

// Checks:
1. iat <= now + CLOCK_TOLERANCE  // Not issued in future
2. nbf <= now + CLOCK_TOLERANCE  // Token is active
3. exp > now                     // Not expired
4. exp > iat                     // Expiration after issuance
5. nbf <= iat                    // Not-before before/at issuance
```

### Possible Outcomes

| Outcome                       | Reason                        | Action                      |
|-------------------------------|-------------------------------|-----------------------------|
| **Success**                   | Valid session                 | Continue to protected route |
| **session_not_found**         | No cookie present             | Redirect to login           |
| **jwt_invalid**               | Signature verification failed | Redirect to login           |
| **jwt_expired**               | Token past expiration         | Redirect to login           |
| **jwt_malformed**             | Invalid JWT structure         | Redirect to login           |
| **session_invalid_claims**    | Schema validation failed      | Redirect to login           |
| **session_invalid_semantics** | Semantic validation failed    | Redirect to login           |

### Key Files

- `application/session/queries/read-session.use-case.ts`
- `application/session/queries/require-session.use-case.ts`
- `application/shared/helpers/read-session-token.helper.ts`
- `infrastructure/session/services/session-token.service.ts`

---

## 🔄 Stage 3: Session Rotation

### When to Rotate

1. **Time-based**: Session nearing expiration (e.g., 80% of lifetime)
2. **Security events**: Password change, role change, privilege escalation
3. **Explicit request**: User-initiated refresh

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ TRIGGER                                                          │
│ Middleware detects session nearing expiration                    │
│ OR explicit rotation request                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                                │
│ SessionService.rotate()                                          │
│ └─ Delegates to RotateSessionUseCase                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ USE CASE LAYER                                                   │
│ RotateSessionUseCase.execute()                                   │
│ ├─ Reads current session (validation)                            │
│ ├─ Extracts current claims                                       │
│ ├─ Calls SessionTokenService.issueRotated()                      │
│ └─ Updates cookie with new token                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER                                             │
│ SessionTokenService.issueRotated()                               │
│ ├─ Creates new JWT with same userId/role                         │
│ ├─ Updates exp, iat, nbf to current time                         │
│ ├─ Signs new token                                               │
│ └─ Returns new IssuedTokenDto                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ COOKIE STORAGE                                                   │
│ SessionCookieStoreAdapter.set()                                  │
│ └─ Replaces existing cookie with new token                       │
└─────────────────────────────────────────────────────────────────┘
```

### Rotation Strategy

**Current Implementation**: Manual rotation (on-demand)

**Potential Enhancements**:

- Automatic rotation on every request (sliding sessions)
- Rotation threshold (e.g., rotate if < 20% lifetime remaining)
- Token families with refresh tokens

### Key Files

- `application/session/commands/rotate-session.use-case.ts`
- `infrastructure/session/services/session-token.service.ts`

---

## 🚪 Stage 4: Session Termination

### Termination Reasons

```typescript
type TerminateSessionReason =
  | "user_logout" // User clicked logout
  | "session_expired" // Token expired naturally
  | "session_invalid" // Token validation failed
  | "security_event" // Password change, account locked, etc.
  | "admin_action"; // Admin terminated session
```

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ TRIGGER                                                          │
│ User clicks logout OR session validation fails                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                               │
│ logout.action.ts (Server Action)                                 │
│ └─ Calls logoutWorkflow()                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ WORKFLOW LAYER                                                   │
│ logoutWorkflow()                                                 │
│ └─ Calls SessionService.terminate(reason)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                                │
│ SessionService.terminate()                                       │
│ └─ Delegates to TerminateSessionUseCase                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ USE CASE LAYER                                                   │
│ TerminateSessionUseCase.execute()                                │
│ ├─ Logs termination reason                                       │
│ ├─ Calls SessionStore.delete()                                   │
│ └─ Returns success                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ COOKIE STORAGE                                                   │
│ SessionCookieStoreAdapter.delete()                               │
│ ├─ Sets cookie with empty value                                  │
│ ├─ Sets maxAge to 0 (immediate expiration)                       │
│ └─ Browser removes cookie                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ REDIRECT                                                         │
│ Server Action redirects to login page                            │
└─────────────────────────────────────────────────────────────────┘
```

### Cleanup Operations

1. **Cookie Deletion**: Set cookie with maxAge=0
2. **Logging**: Record termination reason and timestamp
3. **Redirect**: Send user to login page
4. **Optional**: Invalidate token in blacklist (if using token blacklist)

### Key Files

- `presentation/authn/actions/logout.action.ts`
- `application/session/workflows/logout.workflow.ts`
- `application/session/commands/terminate-session.use-case.ts`
- `infrastructure/session/adapters/session-cookie-store.adapter.ts`

---

## 🔒 Security Considerations

### 1. Token Security

**HTTP-Only Cookies**:

- ✅ Prevents XSS attacks (JavaScript cannot access)
- ✅ Automatically sent with requests
- ⚠️ Vulnerable to CSRF (mitigated by SameSite)

**Secure Flag**:

- ✅ HTTPS-only transmission
- ✅ Prevents man-in-the-middle attacks

**SameSite Attribute**:

- ✅ `lax`: Prevents CSRF on POST requests
- ✅ Allows navigation from external sites

### 2. Token Expiration

**Short-Lived Tokens**:

- Reduces window of opportunity for stolen tokens
- Requires more frequent re-authentication
- Balance between security and UX

**Clock Tolerance**:

- Accounts for clock skew between servers
- Default: ±5 seconds
- Prevents false rejections

### 3. Signature Verification

**HS256 Algorithm**:

- Symmetric key signing
- Fast and secure for server-to-server
- Secret key must be protected

**Key Rotation**:

- Periodic secret key rotation recommended
- Requires invalidating all existing sessions
- Plan for graceful key rotation

### 4. Claims Validation

**Required Claims**:

- `exp`: Prevents indefinite token validity
- `iat`: Prevents token replay attacks
- `nbf`: Prevents premature token use
- `userId`: Identifies the user
- `role`: Authorizes actions

**Semantic Checks**:

- Ensures logical consistency of claims
- Prevents malformed tokens
- Catches clock synchronization issues

---

## 📊 Session Lifecycle Policies

### Session Duration

```typescript
// Default configuration
SESSION_DURATION_SEC = 7 * 24 * 60 * 60; // 7 days

// Can be configured per environment:
// - Development: Longer (less re-auth)
// - Production: Shorter (more secure)
```

### Rotation Policy

**Current**: Manual rotation only

**Recommended**:

- Rotate on every request (sliding sessions)
- Or rotate when < 20% lifetime remaining
- Or rotate after sensitive operations

### Termination Policy

**Automatic Termination**:

- Token expiration (enforced by JWT exp claim)
- Invalid signature
- Failed validation

**Manual Termination**:

- User logout
- Admin action
- Security event (password change, etc.)

---

## 🔍 Debugging Session Issues

### Common Issues

#### Issue 1: "Session not found"

**Possible Causes**:

- Cookie not set (check browser DevTools)
- Cookie expired
- Cookie domain mismatch
- Cookie path mismatch

**Debug Steps**:

1. Check browser cookies in DevTools
2. Verify cookie name matches configuration
3. Check cookie expiration time
4. Verify domain and path settings

#### Issue 2: "Invalid session"

**Possible Causes**:

- JWT signature verification failed
- Secret key mismatch
- Token tampered with

**Debug Steps**:

1. Verify secret key is consistent across servers
2. Check JWT structure at jwt.io
3. Review logs for signature verification errors

#### Issue 3: "Session expired"

**Possible Causes**:

- Token past expiration time
- Clock skew between servers
- Session duration too short

**Debug Steps**:

1. Check exp claim in JWT
2. Compare server times
3. Adjust clock tolerance if needed
4. Consider longer session duration

#### Issue 4: "Session invalid semantics"

**Possible Causes**:

- iat in future (clock skew)
- nbf in future (clock skew)
- exp before iat (malformed token)

**Debug Steps**:

1. Check server clock synchronization
2. Verify NTP is running
3. Increase clock tolerance temporarily
4. Review token issuance logic

---

## 📈 Performance Considerations

### Token Size

**Current JWT Size**: ~200-300 bytes

- Minimal claims (userId, role, exp, iat, nbf)
- Compact encoding
- Efficient transmission

**Optimization**:

- ✅ Don't include unnecessary claims
- ✅ Use short claim names
- ❌ Don't store large objects in JWT

### Validation Performance

**Fast Path**:

- Signature verification: ~1ms
- Schema validation: <1ms
- Semantic validation: <1ms
- **Total**: ~2-3ms per request

**Optimization**:

- ✅ Cache public keys (if using RS256)
- ✅ Use efficient JWT library (jose)
- ❌ Don't validate on every function call

### Cookie Operations

**Read**: Very fast (synchronous)
**Write**: Fast (synchronous)
**Delete**: Fast (synchronous)

**Optimization**:

- ✅ Minimize cookie writes
- ✅ Use appropriate maxAge
- ❌ Don't set cookies on every request

---

## 🔗 Related Documentation

- **[login-flow.md](./login-flow.md)** - How sessions are established during login
- **[error-handling.md](./error-handling.md)** - Session error handling
- **[data-transformations.md](./data-transformations.md)** - Session data mappers

### Related Files

**Application Layer**:

- `application/session/commands/establish-session.use-case.ts`
- `application/session/commands/rotate-session.use-case.ts`
- `application/session/commands/terminate-session.use-case.ts`
- `application/session/queries/read-session.use-case.ts`
- `application/session/queries/require-session.use-case.ts`

**Infrastructure Layer**:

- `infrastructure/session/services/session.service.ts`
- `infrastructure/session/services/session-token.service.ts`
- `infrastructure/session/adapters/session-cookie-store.adapter.ts`
- `infrastructure/session/adapters/session-token-codec.adapter.ts`

**Configuration**:

- `domain/shared/constants/session-config.constants.ts`
- `infrastructure/session/config/session-token.constants.ts`

---

**Last Updated**: 2026-02-01  
**Maintained By**: Auth Module Team
