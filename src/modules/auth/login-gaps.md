### What you have that’s solid

#### Input validation and server-only boundaries

- `loginAction()` validates `FormData` against `LoginRequestSchema` before touching auth logic (
  `src/modules/auth/presentation/authn/actions/login.action.ts` lines ~56–75).
- `LoginRequestSchema` is a `z.strictObject` with `EmailSchema` + `PasswordSchema` (
  `src/modules/auth/application/auth-user/schemas/login-request.schema.ts` lines ~11–14). The `strictObject` is a nice
  hardening step.
- Sensitive layers are explicitly marked `"server-only"` (DAL, repository, use cases, crypto, session).

#### Password hashing choice and separation

- Password hashing/compare is delegated through a contract and implemented via bcrypt (`BcryptPasswordService` uses
  `bcryptjs.compare` and `bcryptjs.hash`) (`src/modules/auth/infrastructure/crypto/services/bcrypt-password.service.ts`
  lines ~31–44).
- Salt rounds are configurable via env (`getAuthCryptoConfig()` → `AUTH_BCRYPT_SALT_ROUNDS`) (
  `src/modules/auth/infrastructure/crypto/config/auth-crypto.config.ts` lines ~19–22).

#### Session cookie defaults are strong

- Cookie is `HttpOnly: true` and `SameSite: "strict"` (
  `src/modules/auth/infrastructure/session/config/session-cookie-options.config.ts` lines ~23–29; constants in
  `session-cookie.constants.ts` lines ~8–23).
- You have rotation logic and an absolute lifetime concept (`SESSION_DURATION_SEC = 15m`, refresh threshold `2m`,
  absolute max `30d`) (`src/modules/auth/domain/shared/constants/session-config.constants.ts` lines ~4–11), and
  `RotateSessionUseCase` enforces the lifecycle policy.

#### UI error normalization against credential enumeration

- `toLoginFormResult()` intentionally maps `invalid_credentials` to the same message for both email and password (
  `src/modules/auth/application/shared/mappers/flows/login/to-login-form-result.mapper.ts` lines ~9–41, 59–68). That’s
  exactly the right UX/security pattern.

---

### Key weaknesses / gaps (prioritized)

#### 1) Timing-based account enumeration is still likely (even if messages are unified)

Even though the UI error message is unified, `LoginUseCase` returns early on “user not found” and only runs bcrypt
compare when a user exists (`src/modules/auth/application/auth-user/commands/login.use-case.ts` lines ~86–104, ~
120–133).

That means an attacker can often distinguish:

- existing email → bcrypt compare happens (slower)
- non-existent email → no bcrypt compare (faster)

**Recommendation (high-impact / low-risk):**

- Always perform a bcrypt compare even when the user doesn’t exist, using a constant “dummy hash” (a precomputed bcrypt
  hash). Then return `invalid_credentials` either way.

#### 2) No brute-force / credential stuffing protection visible

From what’s shown, there’s no rate limiting, no IP/email throttling, no backoff, and no account lockout policy at the
boundary (`loginAction` and `LoginUseCase`). Your logs include `ip` (`login.action.ts` lines ~44–54), so you have the
data—just not the controls.

**Recommendation (high-impact):**

- Add rate limiting at the server action/workflow boundary using `{ ip, email }` keys.
- Consider progressive delays (small) after repeated failures, and/or CAPTCHA after a threshold.

#### 3) Session revocation / stolen-token risk (stateless cookie tokens)

Your session store implementation shown is purely cookie-based (`SessionCookieStoreAdapter` uses
`cookies.set/get/delete`) (`src/modules/auth/infrastructure/session/adapters/session-cookie-store.adapter.ts` lines ~
42–106).

If the session token is a self-contained JWT and you don’t check it against a server-side session record on every
request, then:

- logout = cookie deletion only (does not revoke a stolen token)
- stolen token may remain valid until expiry, and with rotation the attacker might extend it (up to your absolute
  lifetime) depending on how rotation is triggered.

**Recommendation (high-impact, structural):**

- Back sessions with a server-side record (DB/Redis) keyed by `sid` (and possibly current `jti`).
- On request: validate JWT signature/claims *and* confirm `sid` is still active; optionally require `jti` matches
  latest-issued.
- On logout / suspicious activity: revoke server-side.

#### 4) Email canonicalization and uniqueness pitfalls

`getUserByEmailDal` does `where(eq(users.email, email))` (
`src/modules/auth/infrastructure/persistence/auth-user/dal/get-user-by-email.dal.ts` lines ~28–33).

If you store emails case-sensitively (default `varchar` in Postgres) and enforce uniqueness on raw `email`, you can get
edge cases:

- `Alice@Example.com` and `alice@example.com` may be treated as distinct for uniqueness (depending on how you insert).
- login may fail if user typed different casing than stored.

**Recommendation:**

- Normalize emails to lowercase at write time and read time, or use a `citext` column for `email`.
- Ensure `EmailSchema` and your signup flow align with this normalization.

#### 5) Password length policy should account for bcrypt limits + DoS

bcrypt effectively uses only the first 72 bytes of a password. Also, extremely long passwords can be used for resource
abuse depending on your pipeline.

**Recommendation:**

- Ensure `PasswordSchema` enforces a sensible `min` and a `max` (commonly 72–128 chars). If you allow longer, document
  that only first 72 bytes matter or switch to Argon2id.

#### 6) Logging contains PII and may enable “log-based” enumeration

You log `email` frequently (e.g., `login.validation.success`, `login.authentication.failed`) (`login.action.ts` lines ~
77–96; DAL logs “User not found” with email `get-user-by-email.dal.ts` lines ~34–40).

This is fine for internal audit logs, but it becomes a risk if:

- logs are accessible to too many people
- logs are exported to third-party systems without redaction

**Recommendation:**

- Consider hashing or partially redacting email in some logs.
- Ensure no password values ever enter logs (I did not see password logging in the shown files).

#### 7) Minor UX/security footgun: `autoComplete="off"` on the form

The form sets `autoComplete="off"` (`login-form.tsx` line ~48), but the inputs set appropriate autocomplete tokens (
`email`, `current-password`). Disabling form autocomplete rarely improves security and can reduce password manager
effectiveness.

**Recommendation:**

- Remove `autoComplete="off"` unless you have a specific reason.

---

### Session cookie configuration notes

- `SameSite: "strict"` is the safest default (`session-cookie.constants.ts` line ~23). If you ever need cross-site
  flows (some OAuth return patterns), you may need `lax` or explicit CSRF protections.
- `secure: isProd()` (`session-cookie-options.config.ts` line ~28) is typical. Just ensure production is always HTTPS
  and behind correct proxy headers so `Secure` is actually applied as intended.

---

### Concrete “next files to inspect” (to complete the audit)

To fully confirm the highest-risk items above, the next most valuable files are:

- Anything that *verifies* the session on requests (middleware / session read use case / guards) to see if you do
  server-side session lookups or pure JWT.
- Logout workflow (`logoutWorkflow`) and any “invalidate session(s)” logic.
- The actual `PasswordSchema` (`src/shared/validation/zod/password.schema`) to confirm max length + complexity rules.
- Any rate-limiting middleware/utilities (if present) or the absence thereof.

If you want, tell me where you validate sessions for protected routes (middleware vs server components vs API routes),
and I’ll point out exactly where to add revocation checks and throttling with minimal disruption.
