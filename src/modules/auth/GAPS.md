### What I reviewed (high-signal)

- Signup orchestration: `src/modules/auth/application/auth-user/commands/signup.use-case.ts`
- Login orchestration: `src/modules/auth/application/auth-user/commands/login.use-case.ts`
- Request validation:
    - `src/modules/auth/application/auth-user/schemas/login-request.schema.ts`
    - `src/modules/auth/application/auth-user/schemas/signup-request.schema.ts`
- Session establishment + cookie ops:
    - `src/modules/auth/application/session/commands/establish-session.use-case.ts`
    - `src/modules/auth/application/shared/helpers/session-cookie-ops.helper.ts`
    - `src/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter.ts`
    - `src/modules/auth/infrastructure/session/config/session-cookie-options.config.ts`
    - `src/modules/auth/infrastructure/session/types/session-cookie.constants.ts`
- JWT issuance/validation + crypto:
    - `src/modules/auth/infrastructure/session/services/session-token.service.ts`
    - `src/modules/auth/infrastructure/session/adapters/session-token-codec.adapter.ts`
    - `src/modules/auth/infrastructure/session/services/jose-session-jwt-crypto.service.ts`

### Gaps & weaknesses (alphabetized)

#### Account enumeration & error semantics

- **Risk:** If `tx.authUsers.login(...)` or `tx.authUsers.signup(...)` returns distinguishable errors for “user not
  found” vs “bad password” vs “email already exists”, your UI/API can become an account enumeration oracle.
- **Where it likely manifests:** `login.use-case.ts` and `signup.use-case.ts` bubble repository errors up unchanged.
- **What to verify / fix:**
    - Ensure login failures are indistinguishable externally (same message/status, similar timing).
    - Ensure signup “email already taken” response is considered carefully (it’s UX-helpful but can be abused); at
      minimum add rate limiting.

#### Brute force / credential stuffing protections missing in app layer

- **Risk:** There is no visible rate limiting, IP throttling, user/email throttling, or temporary lockouts around
  login/signup workflows.
- **Impact:** Enables password guessing, credential stuffing, and signup abuse.
- **Where to implement:** The “edge” (route handlers / server actions) or workflow boundary that calls `loginWorkflow`/
  `signupWorkflow` (since use cases are pure-ish).
- **Suggested controls:**
    - Per-IP + per-identifier rate limiting on `login` and `signup`.
    - Optional progressive delays / backoff on repeated failures.
    - Consider CAPTCHA only for suspicious patterns (to avoid hurting normal UX).

#### Email normalization is incomplete

- **What you do now:** `email: z.string().email().toLowerCase()`.
- **Gap:** No `.trim()`.
- **Impact:** `" user@example.com"` vs `"user@example.com"` could bypass uniqueness checks depending on DB
  collation/constraints and app logic.
- **Where:** `login-request.schema.ts`, `signup-request.schema.ts`.
- **Suggested change:** `.trim().toLowerCase()` and ensure the persistence layer also normalizes.

#### Password policy is minimal

- **What you do now:** `password: z.string().min(8)`.
- **Gaps:**
    - No maximum length (DoS-ish risk with very large payloads; also hashing cost amplification).
    - No checks against known-compromised passwords.
    - No strength/entropy requirements.
- **Where:** `login-request.schema.ts`, `signup-request.schema.ts`.
- **Suggested changes:**
    - Add a reasonable max length (commonly 72 for bcrypt, higher for argon2/scrypt, but pick based on your hasher).
    - Add breached-password checks (e.g., Have I Been Pwned k-anonymity) if feasible.
    - If you add “complexity rules”, prefer entropy-based checks over arbitrary character-class rules.

#### Session revocation model appears limited (stateless JWT in cookie)

- **What you have:** HS256 JWT stored in an HttpOnly cookie (`SESSION_COOKIE_NAME = "session"`). Tokens include `sid`
  and `jti` and you have “rotate” capability.
- **Gaps to confirm:**
    - If there is **no server-side session store / denylist keyed by `sid`/`jti`**, you can’t reliably revoke stolen
      tokens before expiry.
    - Logout (`cookie.delete`) only affects the current browser; it doesn’t invalidate a copied token.
- **Where:**
    - Token issuance/validation: `session-token.service.ts`
    - Cookie storage: `session-cookie-store.adapter.ts`
- **Suggested improvements:**
    - Maintain server-side session state keyed by `sid` (or store a hash of `jti`) to support revocation and “log out
      all devices”.
    - Add rotation enforcement (reject reused `jti` if you keep server state).

#### Cookie hardening opportunities

- **What you do well:** `httpOnly: true`, `sameSite: "strict"`, `secure: isProd()`.
- **Gaps/opportunities:**
    - Cookie name is plain `"session"`; you could consider `__Host-session` (requires `Secure`, `Path=/`, and no
      `Domain`) for stronger scoping.
    - No explicit `domain` (this is often good), but verify it matches your deployment needs.
    - Consider whether `SameSite: "strict"` breaks legitimate flows (OAuth, magic links, subdomain redirects). If you
      ever need cross-site POSTs, add CSRF tokens instead of loosening SameSite without thought.
- **Where:** `session-cookie-options.config.ts`, `session-cookie.constants.ts`.

#### JWT verification claims: issuer/audience are optional

- **What you do now:** `JoseSessionJwtCryptoService` will validate `issuer`/`audience` only if provided.
- **Risk:** If you forget to configure these in production (or never set them), you lose an important defense-in-depth
  check.
- **Where:** `jose-session-jwt-crypto.service.ts`.
- **Suggested change:** Make `issuer`/`audience` required in prod (or assert configuration at boot).

#### Missing account lifecycle checks (likely)

- **Risk:** I didn’t see checks for `emailVerified`, `disabled`, `locked`, or `mustRotatePassword` in the login
  orchestration.
- **Where to look next:** Inside `tx.authUsers.login(...)` and the domain entity returned.
- **Suggested:** Enforce lifecycle policies at login and on session establishment.

#### Username policy is permissive / missing normalization

- **What you do now:** `username: z.string().min(3).max(20)`.
- **Gaps:** No `.trim()`, no allowed character set, no normalization (case folding?), no reserved words list.
- **Impact:** user confusion, impersonation risk (`Admin` vs `admin`), potential UI injection depending on where it’s
  rendered.
- **Where:** `signup-request.schema.ts`.

### What looks good already

- **No token leakage in logs** in `setSessionCookieAndLogHelper` (it logs identifiers + expiry, not the token).
- **Session secret length check**: `JoseSessionJwtCryptoService` rejects secrets shorter than 32 chars.
- **Semantic JWT claim validation**: extra checks in `validateSessionTokenClaimsSemantics` beyond schema shape.

### Highest-priority recommendations (short list)

1. Add rate limiting / throttling around login and signup.
2. Normalize inputs consistently (`trim` + casing policy) for email and username.
3. Strengthen password policy (at least max length + breached password checks).
4. Ensure login/signup errors do not enable account enumeration.
5. Decide on session revocation requirements; if you need real revocation, introduce server-side session state keyed by
   `sid`/`jti`.

### One thing I need to confirm to be precise

Do you store sessions **only** in the cookie (stateless JWT), or do you also persist session state server-side (
DB/Redis) keyed by `sid`/`jti`?

- If you tell me where `tx.authUsers.login/signup` and any session persistence live (or let me inspect those files), I
  can point out the enumeration/timing and revocation gaps with much higher confidence.

___

### Key implication of “sessions only in the cookie”

Your current model is a **stateless session**: the server can validate authenticity (signature) and freshness (
exp/iat/nbf), but **cannot revoke** a stolen token before it expires unless you introduce **some server-side state** (
denylist/allowlist, version counter, rotated `jti` tracking, etc.).

That single constraint drives the biggest gaps below.

### Concrete gaps & weaknesses (with file-level evidence)

#### Account/session revocation is effectively impossible (high severity)

- **Why:** Tokens are HS256 JWTs stored in a cookie (`SessionCookieStoreAdapter`), and validation (
  `SessionTokenService.validate`) only checks schema + time semantics. There is no server-side session record keyed by
  `sid`/`jti`.
- **Impact:**
    - Logout only deletes the browser cookie; it **does not invalidate copied tokens**.
    - You can’t do “log out all devices”, forced logout after password reset, or respond to compromise.
    - “Rotate session” can mint a new token, but without tracking used/revoked `jti`s, you **can’t detect replay** of an
      old token.
- **Where:**
    - JWT issuance/validation: `src/modules/auth/infrastructure/session/services/session-token.service.ts`
    - Cookie storage: `src/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter.ts`
- **Mitigations (pick one):**
    - **Best:** introduce server-side session state (DB/Redis) keyed by `sid`, store current `jti`, and reject
      mismatches.
    - **If you refuse server state:** shorten `SESSION_DURATION_SEC` substantially, rotate frequently, and accept that
      true revocation is not achievable.

#### Login enumeration via logs + timing (high severity)

- **Evidence:** `getUserByEmailDal` logs **“User not found”** with `operationIdentifiers: { email }`.
    - File: `src/modules/auth/infrastructure/persistence/auth-user/dal/get-user-by-email.dal.ts` lines `34–40`.
- **Why this matters:**
    - Even if your API response is generic, your logs become a high-quality list of valid/invalid emails.
    - Attackers can also exploit timing differences: “user exists” likely proceeds to password-verify; “not found”
      returns early.
- **Mitigations:**
    - Log *generic* outcomes and avoid logging raw emails on not-found paths (or hash them).
    - Consider a constant-time-ish path: when user not found, still run a dummy hash verify to reduce timing signals (
      rate limiting is still required).

#### Signup enumeration via unique constraint behavior (high severity)

- **Evidence:** Signup maps Postgres unique violations to a conflict error:
    - File: `src/modules/auth/infrastructure/persistence/auth-user/repositories/auth-user.repository.ts` lines
      `127–132`.
- **Why this matters:** If the mapped error message/status differs from other failures, you leak whether an email is
  registered.
- **Mitigations:**
    - Externally return a generic “signup failed” (or “check your email”) message, and rely on email verification flows.
    - At minimum, apply strict rate limiting to signup.

#### PII in auth logs (medium-high)

- **Evidence:**
    - Insert logs `email`, `role`, `userId`, `username` at `insertUserDal` lines `47–51`.
    - Not-found path logs `email` at `getUserByEmailDal` lines `35–39`.
- **Risk:** Increases blast radius of log access and makes credential-stuffing easier.
- **Mitigation:** Redact or hash identifiers in logs (especially on failures), and ensure logs are access-controlled +
  retained minimally.

#### Email normalization inconsistencies can break uniqueness/security assumptions (medium)

- **Evidence:** DAL lookup uses exact equality `eq(users.email, email)`.
    - File: `get-user-by-email.dal.ts` lines `28–33`.
- **Risk:** If any code path forgets to `trim()`/lowercase, you can get duplicate-like accounts or login confusion.
- **Mitigation:** Enforce normalization in **one place** (ideally at persistence boundary + DB constraint/collation
  strategy).

#### Brute force / credential stuffing controls still not visible (high)

- **Evidence:** The DAL/repo paths shown have no throttling, and your use cases don’t apply it.
- **Mitigation:** Add per-IP + per-email rate limiting at the route/server-action boundary, plus optional backoff.

### What looks solid in the attached persistence code

- `AuthUserRepository.signup` performs DTO validation (`validateAuthUserCreateDto`) before hitting the DAL (good
  defensive layering).
- Mapping unique violations to a domain/app error is good *internally*—the key is how it’s surfaced externally.

### Top 5 prioritized fixes (given “cookie-only sessions”)

1. **Add rate limiting** to login + signup (this is your main compensating control for enumeration and brute force).
2. **Reduce enumeration in logs and responses**:
    - Don’t log `email` on not-found; avoid “user not found” messages.
3. **Shorten session TTL** (`SESSION_DURATION_SEC`) if you won’t add server-side session state.
4. **Harden input normalization** (`email.trim().toLowerCase()`, `username.trim()`, and consistent persistence
   normalization).
5. **Strengthen password policy** (max length + breached-password checks at minimum).

### Clarifying question (so I can give exact recommendations, not generic)

Where do `loginWorkflow` / `signupWorkflow` ultimately return their errors (API route handlers, server actions, tRPC,
etc.)? If you point me to the entrypoint file(s), I can tell you exactly whether you currently leak enumeration via
status codes/messages and where best to insert rate limiting.

---

### What your server actions reveal (and why it matters)

You were right: `loginAction` and `signupAction` are the boundaries where workflow errors become **user-visible form
errors** *and* where you’re currently emitting the most sensitive logs.

### Login: good user-facing anti-enumeration, but logs still leak (high)

- **UI mapping is good:** `toLoginFormResult()` returns the same message for both `email` and `password` when
  `error.key === "invalid_credentials"`.
    - File: `src/modules/auth/application/shared/mappers/flows/login/to-login-form-result.mapper.ts` lines `63–68`.
    - This is the correct pattern to prevent “email exists” vs “password wrong” enumeration *in the UI*.
- **But logs still leak valid/invalid email signals:**
    - Your DAL logs **"User not found"** with raw `email`.
        - File: `src/modules/auth/infrastructure/persistence/auth-user/dal/get-user-by-email.dal.ts` lines `34–40`.
    - `loginAction` logs `email` and `ip` on validation success and on authentication failures.
        - File: `src/modules/auth/presentation/authn/actions/login.action.ts` lines `77–82` and `91–96`.

**Why this is a real weakness:** Even if the UI is perfect, your logs become a high-quality enumeration dataset if
exposed (or even internally, they increase risk).

### Signup: you explicitly allow account existence to be revealed (high)

- **Evidence:** `toSignupFormResult()` delegates to `mapGenericAuthError` and the file comment states signup “doesn’t
  require the same unified error message strategy”.
    - File: `src/modules/auth/application/shared/mappers/flows/signup/to-signup-form-result.mapper.ts` lines `14–17`.
- **Additionally:** your repo maps Postgres unique violations to a signup conflict error.
    - File: `src/modules/auth/infrastructure/persistence/auth-user/repositories/auth-user.repository.ts` lines
      `129–132`.

**Risk:** If `mapGenericAuthError` surfaces a distinct field error like “email already exists”, that’s direct account
enumeration.

### Cookie-only sessions: your biggest structural limitation (critical)

Since sessions are only in the cookie (stateless JWT):

- You **cannot revoke** a stolen token before expiry.
- “Logout” only deletes the cookie in that browser.
- Rotation cannot prevent replay of an older token unless you track `jti`/`sid` server-side.

This is not a code bug—it’s an architectural tradeoff. Your compensating controls must be stronger.

### Most important fixes to prioritize (specific to your code)

#### 1) Add rate limiting at the server action boundary (highest ROI)

Do this in:

- `src/modules/auth/presentation/authn/actions/login.action.ts`
- `src/modules/auth/presentation/authn/actions/signup.action.ts`

Because these actions already have `ip` (from `makeAuthComposition()`), they’re the right place to enforce:

- per-`ip` limits
- per-`email` limits (use a normalized form)
- global signup caps

#### 2) Stop logging raw emails/usernames on sensitive paths

Concrete hotspots:

- `getUserByEmailDal`: remove/soften “User not found” logging or hash/redact `email`.
- `loginAction`/`signupAction`: on failure, avoid logging `email`/`username` directly; log a stable hash and a request
  id.

#### 3) Make signup error mapping non-enumerating (or accept it + compensate)

You have two viable stances:

- **Security stance:** unify signup errors too (generic “Unable to sign up” message), and move “email already used” into
  an out-of-band flow (email verification).
- **UX stance:** keep “email already exists”, but then you *must* add strong rate limiting + monitoring, because you’ve
  created an oracle.

Right now you’re in the UX stance by design (per mapper comment), but you’re missing the compensating controls.

#### 4) Shorten JWT session TTL if you won’t add server-side session state

With cookie-only sessions, shorter `SESSION_DURATION_SEC` materially reduces stolen-token impact.

### One targeted question

What is your current `SESSION_DURATION_SEC` value (and do you rotate on every request or only on specific events like
login)?

- If it’s long (hours/days) and rotation is infrequent, cookie-only sessions become much riskier.

If you want, I can propose an exact, minimal set of changes (rate limiter placement + log redaction + signup error
strategy) without touching any deeper domain code.

---

### Demo-focused summary for `src/modules/auth/GAPS.md`

You said to skip security controls. So below is framed as **product/demo gaps, correctness gaps, and maintainability
gaps** (some items still overlap with security, but I’m not recommending “security programs”, just concrete code-level
improvements).

### Concrete gaps (grouped, with file references)

#### 1) Cookie-only sessions have intentional feature limitations

- **No server-side session state** means you can’t do:
    - “Log out all devices”
    - “Invalidate all sessions after password change”
    - “Force logout” for a user
    - Detect/avoid replay of older tokens after “rotation”
- **Where this is baked in:**
    - Token issuance/rotation: `src/modules/auth/infrastructure/session/services/session-token.service.ts` (`issue`
      lines `126–152`, `issueRotated` lines `160–188`)
    - Cookie storage: `src/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter.ts`

#### 2) Session lifetime knobs exist, but the “absolute lifetime” knob is not obviously enforced

- You define:
    - `SESSION_DURATION_SEC = 900` (15m)
    - `SESSION_REFRESH_THRESHOLD_SEC = 120` (2m)
    - `MAX_ABSOLUTE_SESSION_SEC = 2_592_000` (30d)
- **Gap:** From what’s shown, `MAX_ABSOLUTE_SESSION_SEC` is not referenced by `SessionTokenService` (it always sets
  `exp = now + SESSION_DURATION_SEC`). If you intended a true “absolute session lifetime”, it needs explicit enforcement
  somewhere (usually by anchoring an `auth_time`/`session_start` claim and capping refresh).
- **Where:** `src/modules/auth/domain/shared/constants/session-config.constants.ts` lines `4–11`, and
  `src/modules/auth/infrastructure/session/services/session-token.service.ts` line `130`/`164`.

#### 3) Signup error handling strategy is inconsistent with login

- Login has a dedicated mapper for `invalid_credentials` that always returns the same field errors/message.
    - `src/modules/auth/application/shared/mappers/flows/login/to-login-form-result.mapper.ts` lines `59–68`.
- Signup explicitly does *not* do the same unification and just maps generically.
    - `src/modules/auth/application/shared/mappers/flows/signup/to-signup-form-result.mapper.ts` lines `14–17`, `25–30`.
- **Gap (demo/product):** This creates different UX behavior and makes it harder to keep messaging consistent across
  flows.

#### 4) Input normalization is split across layers and incomplete

- DAL lookup is exact equality by whatever `email` string is passed (`eq(users.email, email)`).
    - `src/modules/auth/infrastructure/persistence/auth-user/dal/get-user-by-email.dal.ts` lines `28–33`.
- You already lowercase in the Zod schema (from earlier review), but you don’t consistently `trim()`.
- **Gap (correctness/demo):** subtle user-facing issues like “can’t log in with copied email that includes whitespace”.

#### 5) Logging payloads are very PII-heavy (even for a demo)

- `signupAction` logs `{ email, ip, username }` on failure and `{ email, ip, role, userId }` on success.
    - `src/modules/auth/presentation/authn/actions/signup.action.ts` lines `92–101` and `108–113`.
- `loginAction` logs `{ email, ip }` on failures and success.
    - `src/modules/auth/presentation/authn/actions/login.action.ts` lines `91–96` and `103–108`.
- DAL logs `email` in not-found cases.
    - `src/modules/auth/infrastructure/persistence/auth-user/dal/get-user-by-email.dal.ts` lines `34–39`.
- **Gap (demo/ops):** logs get noisy, harder to share screenshots/log dumps, and harder to keep consistent privacy
  posture.

### Prioritized fixes (demo/product + maintainability first)

1. **Decide what “session rotation” and “absolute session lifetime” should mean in the demo**
    - Either explicitly document “cookie-only JWT; no absolute lifetime enforcement”
    - Or implement minimal absolute-lifetime enforcement via an anchored claim.
2. **Normalize inputs consistently**
    - Add `trim()` alongside `toLowerCase()` for email
    - Add `trim()` for username
    - Consider enforcing normalization at persistence boundary too.
3. **Unify signup and login error mapping conventions**
    - Either keep both “generic” or both “explicit, friendly” but consistent.
4. **Reduce PII in logs (even in demo mode)**
    - Standardize `operationIdentifiers` to prefer `{ requestId, userId }` over `{ email, username }`.
5. **Document cookie-only session tradeoffs explicitly in `GAPS.md`**
    - So future you doesn’t hunt for “why can’t we revoke sessions?”.

### Suggested patches (actionable, file-by-file)

These are phrased as “diff intents” you can apply when you’re ready.

#### A) Input normalization

- **Patch:** update `LoginRequestSchema` and `SignupRequestSchema` to use
  `email: z.string().trim().email().toLowerCase()` and `username: z.string().trim().min(3).max(20)`.
- **Files:**
    - `src/modules/auth/application/auth-user/schemas/login-request.schema.ts`
    - `src/modules/auth/application/auth-user/schemas/signup-request.schema.ts`

#### B) Absolute session lifetime enforcement (if you want it to be real)

- **Patch option 1 (documentation-only):** add a note in `GAPS.md` that `MAX_ABSOLUTE_SESSION_SEC` is currently a
  constant without enforcement.
- **Patch option 2 (code):**
    - Add a claim like `sessionStart` (or reuse `iat` as “session start” only if you never rotate `iat`), and when
      rotating, cap `exp` so that `exp <= sessionStart + MAX_ABSOLUTE_SESSION_SEC`.
    - This requires adjusting claim mappers/schema used by `SessionTokenService`.
- **Files:**
    - `src/modules/auth/domain/shared/constants/session-config.constants.ts`
    - `src/modules/auth/infrastructure/session/services/session-token.service.ts`
    - plus the session claims DTO/schema/mappers (not in the attached set, but referenced by `SessionTokenService`).

#### C) Consistent error mapping between login and signup

- **Patch:** introduce a signup-specific mapper similar to `mapLoginInvalidCredentialsError` for common signup failures
  you care about (e.g., “email already used”) *or* intentionally unify all signup failures into one generic message for
  demo simplicity.
- **Files:**
    - `src/modules/auth/application/shared/mappers/flows/signup/to-signup-form-result.mapper.ts`
    - `src/modules/auth/application/shared/mappers/flows/login/map-generic-auth.error` (if you want shared behavior)

#### D) Logging cleanup for demo friendliness

- **Patch:** in `loginAction`/`signupAction`:
    - remove `email`/`username` from `operationIdentifiers` on failure logs
    - keep `requestId` and (on success) `userId`
- **Files:**
    - `src/modules/auth/presentation/authn/actions/login.action.ts`
    - `src/modules/auth/presentation/authn/actions/signup.action.ts`
    - optionally: `src/modules/auth/infrastructure/persistence/auth-user/dal/get-user-by-email.dal.ts`

### Drop-in text you can paste into `GAPS.md`

```md
#### Cookie-only sessions: feature limitations

- Sessions are stored only as a signed JWT in a cookie (no server-side session state).
- Tradeoffs:
    - No “log out all devices”
    - No forced session invalidation after password change
    - Rotation can mint a new token but cannot prevent replay of older tokens without tracking state server-side

#### Session config constants vs enforcement

- `MAX_ABSOLUTE_SESSION_SEC` exists but is not obviously enforced by the current token issuance/rotation logic.
- `SessionTokenService` always sets `exp = now + SESSION_DURATION_SEC`.

#### Input normalization

- Email/usernames should be consistently normalized (e.g., `trim()` + case policy) to avoid login/signup edge cases.

#### Presentation-layer consistency

- Login has a dedicated unified error message path for `invalid_credentials`.
- Signup maps errors generically; decide whether to keep this difference or standardize.

#### Logging payload size/PII

- Server actions and DAL include raw emails/usernames in logs; consider reducing this for demo friendliness.
```

If you want, paste your current `mapGenericAuthError` implementation and I’ll tailor the “error mapping consistency”
section to exactly what it outputs today.

