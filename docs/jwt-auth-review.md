# JWT Authentication Review and Fix Plan

Last updated: 2025-09-11

This document reviews the current JWT-based session implementation and outlines improvements and a plan to address identified risks.

## Summary of Current Behavior

- Session cookie name: `session` (httpOnly, SameSite=Lax, Secure in production), rolling `maxAge` equals session duration.
- Token signing: HS256 (`jose`), with optional `iss`/`aud` claims when configured.
- Payload validation: Strong Zod validation on both sign and verify paths.
- Session verification: `verifySessionOptimistic()` redirects unauthenticated users to `/auth/login`.
- Rolling refresh: `updateSessionToken()` re-issues tokens when time-to-expiration ≤ 5 minutes.
- Absolute lifetime: Intended 30 days, checked in code using `iat`.

## Findings

1) Absolute lifetime enforcement is ineffective across rolling refreshes.
   - `updateSessionToken()` compares `Date.now()` to the token's `iat` (issued-at) to impose a 30-day cap.
   - When a token is re-issued, `iat` is reset, so the absolute limit effectively never triggers.
   - A true absolute lifetime requires a stable, preserved timestamp (e.g., `origIat` or `sessionStart`) that is carried across re-issues.

2) Logging clarity was inconsistent.
   - The codec used "encrypt/decrypt" wording for HS256 signing/verification, reducing observability clarity.
   - Some log `context` values did not match function names.

3) Defensive checks for expiration on sign.
   - Signing logic did not explicitly prevent issuing a token with `expiresAt` in the past.

## Changes Implemented (minimal, low-risk)

- Logging clean-up:
  - Consistent `context` values now reflect function names: `setSessionToken`, `updateSessionToken`, `deleteSessionToken`, `createSessionToken`, `readSessionToken`.
  - Messages now reference JWT signing/verification rather than encryption/decryption.
- Defensive guard:
  - `createSessionToken()` now rejects payloads where `expiresAt` is not in the future.

## Recommended Fix Plan (next steps)

1) Enforce true absolute session lifetime (primary fix):
   - Introduce an immutable `sessionStart` (or `origIat`) claim that is set at login and preserved on every refresh.
   - Update schemas and mappers (Encrypt/Decrypt payload Zod, flatten/unflatten) to include this claim.
   - In `updateSessionToken()`, compute `ageMs = now - sessionStartMs`, not `now - iat`.
   - If `ageMs > MAX_ABSOLUTE_SESSION_MS`, delete cookie and force re-authentication.

2) Refresh strategy (optional refinements):
   - Consider refreshing on critical requests, not all page loads, to reduce churn.
   - Add jitter to refresh timing to avoid thundering herd near the 5-minute threshold in high-traffic scenarios.

3) Security and DX niceties:
   - Consider `SameSite=Strict` if app requirements allow (currently `Lax` is a good default for auth flows).
   - Add structured error codes for auth failures to improve SRE dashboards.

## Test Plan

- Unit tests for `createSessionToken()` and `readSessionToken()` covering:
  - Valid/invalid payloads, missing/short secrets, issuer/audience presence and mismatch.
  - Expiration and clock tolerance behavior.
- Integration tests for `verifySessionOptimistic()` and `updateSessionToken()`:
  - Redirect behavior on missing/invalid cookies.
  - Refresh behavior when time-to-expiration is below threshold.
  - Absolute lifetime cut-off once `sessionStart + 30 days` is exceeded (once implemented).

## Rollout

- Ship the logging/guard improvements immediately.
- Implement the absolute lifetime claim in a follow-up PR with schema updates and tests.
- Monitor logs for any spikes in signing/verification errors post-deploy.
