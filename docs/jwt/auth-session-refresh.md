# Auth Session Refresh and Rotation

## TL;DR
- A client-side refresher pings a server endpoint on a fixed cadence and on focus/visibility.
- The server rotates the short-lived session token only when it’s near expiry and still within the absolute lifetime.
- Responses return a structured JSON outcome for observability.
- Timing knobs and policy constants live in a shared constants module.
- The session cookie name and other server-only constants are kept server-side to avoid leaking to the client.

---

## Architecture Overview

- Root layout mounts the refresher:
    - The root layout includes a small client component that periodically pings the refresh endpoint and triggers on focus/visibility changes.

- Refresh endpoint:
    - Route handlers accept GET/POST for JSON responses and HEAD for a body-less liveness check.
    - They call the server session helper that performs validation and conditional rotation.

- Server session helpers:
    - Create a session token (at login/signup), verify the current token, and conditionally rotate it.
    - Rotate only if the token is close to expiring and the absolute session lifetime hasn’t been exceeded.
    - Update the session cookie with secure options and return a structured outcome.

---

## Client Refresher

- Behavior:
    - Pings the refresh endpoint on a fixed interval (configurable).
    - Also triggers on window focus and on document visibility changes.
    - Skips when:
        - The tab is hidden,
        - A request is already in flight,
        - The browser is offline.
    - Adds a small random jitter to avoid synchronized bursts across multiple tabs.

- Backward compatibility:
    - If the server responds with 204 (legacy behavior), the client ignores the body and continues working.

- Configuration knobs (imported from the shared constants module):
    - SESSION_REFRESH_PING_MS: base interval for periodic pings.
    - SESSION_KICKOFF_TIMEOUT_MS: initial delay before the first ping.
    - SESSION_REFRESH_JITTER_MS: random jitter added to each ping’s delay.

---

## Server: Session Rotation Logic

- The server helper checks:
    1) Is there a session cookie?
    2) Is the token valid and does it contain a user?
    3) Is the absolute lifetime exceeded? If yes, the cookie is deleted and rotation stops.
    4) How much time is left (timeLeftMs) until expiry?
        - If timeLeftMs is above the refresh threshold, rotation is skipped.
        - If timeLeftMs is at/below the threshold, a fresh token is issued, and the cookie is updated.

- Cookie settings:
    - HttpOnly, SameSite=lax, Secure in production.
    - Path=/ and expiration aligned with the newly issued token.
    - maxAge is derived from the short session duration (in seconds).

---

## Refresh Endpoint Contract

- Methods:
    - POST/GET: run refresh logic and return application/json with the outcome.
    - HEAD: run refresh logic but return 204 without a response body.

- Caching:
    - Explicit no-store/no-cache headers and Vary: Cookie to prevent intermediary caching.

- JSON outcome shape:
    - Success (rotated):
        - { refreshed: true, reason: "rotated", expiresAt, userId, role }
    - No change:
        - { refreshed: false, reason: "not_needed", timeLeftMs }
        - { refreshed: false, reason: "no_cookie" }
        - { refreshed: false, reason: "invalid_or_missing_user" }
    - Deleted (absolute lifetime exceeded):
        - { refreshed: false, reason: "absolute_lifetime_exceeded", ageMs, maxMs, userId? }

---

## Configuration (Shared Constants)

- Session timing and policy:
    - SESSION_DURATION_MS: short-lived token duration.
    - SESSION_REFRESH_THRESHOLD_MS: rotate when timeLeftMs ≤ threshold.
    - MAX_ABSOLUTE_SESSION_MS: hard cap for total session lifetime; rotation stops after this.
    - ROLLING_COOKIE_MAX_AGE_S: cookie maxAge (seconds) derived from session duration.

- Client refresher:
    - SESSION_REFRESH_PING_MS, SESSION_KICKOFF_TIMEOUT_MS, SESSION_REFRESH_JITTER_MS.

- Crypto and verification:
    - MIN_HS256_KEY_LENGTH: minimum secret length for HS256.
    - CLOCK_TOLERANCE_SEC: small tolerance for clock skew during verification.

---

## Server-only Constants (Do Not Leak to Client)

- Server-only module contains:
    - SALT_ROUNDS: hashing cost factor (security-sensitive).
    - SESSION_COOKIE_NAME: the name used for the session cookie.
- Rationale:
    - Keep these values server-only to avoid exposing security-related internals and to enforce a single source of truth for cookie identification on the server.

---

## Security Considerations

- Tokens are short-lived and rotated just-in-time to minimize exposure.
- Absolute lifetime prevents indefinite rolling sessions.
- JWT verification enforces algorithm, minimum key length, optional issuer/audience, and a small clock tolerance.
- The refresh response never includes secrets—only minimal metadata for diagnostics.

---

## Observability & Verification

- Browser DevTools:
    - Application → Cookies: watch the session cookie’s Expires/Max-Age update as rotations occur.
    - Network → /api/auth/refresh: inspect JSON outcomes and Set-Cookie headers.
- Logs:
    - Rotation: “Session token re-issued” with context, userId, role, expiresAt.
    - Skipped: “Session re-issue skipped; sufficient time remaining” with timeLeftMs.
    - Absolute lifetime exceeded: cookie deleted with reason logged.

---

## Operational Notes

- Load profile:
    - Pings are lightweight and jittered to reduce synchronization across tabs/users.
- Failure handling:
    - Transient network errors are ignored client-side; rotation resumes on the next interval or on focus/visibility change.
- Caching:
    - no-store/no-cache and Vary: Cookie guard against intermediary caching of responses.

---

## FAQ

- Is the cookie being changed?
    - Yes, when the outcome is refreshed: true (reason: "rotated"). It is removed if the absolute lifetime is exceeded or on explicit logout. Otherwise, it remains unchanged.

- What happens with multiple tabs?
    - Jitter and in-flight guarding reduce thundering-herd effects. Rotation logic is idempotent; extra calls simply return a “not_needed” outcome when appropriate.

- What if a tab stays open for days?
    - Rotation stops once the absolute lifetime is reached, and the cookie is deleted. A fresh login is required after that.

---

## Change Log (This Iteration)

- Switched refresh route to return a structured JSON outcome for observability (GET/POST) and kept HEAD as a 204 no-body variant.
- Centralized timing and policy constants in a shared constants module, including session duration, refresh threshold, ping interval, kickoff delay, jitter, absolute lifetime, and cookie maxAge.
- Hardened the client refresher (skip hidden/offline, prevent overlap, add jitter) while keeping backward compatibility with 204 responses.
- Documented server-only constants (SALT_ROUNDS and SESSION_COOKIE_NAME) to ensure they remain server-scoped.
