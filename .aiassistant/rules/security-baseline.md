---
apply: manually
---

# Security Baseline

## Purpose

Define minimum, testable security practices for auth, data handling, logs, storage, and external I/O.

## Scope & Audience

- Audience: all engineers, reviewers, and AI contributors.
- Applies to: server code, server actions/route handlers, DB/DAL, network calls, secrets/config, logging, file uploads, and CI.
- Contexts: implementation, review, and CI security/audit checks.

## Secrets & Configuration

1. Validate process/env via a strict schema (e.g., Zod) at startup; fail fast on missing/invalid values.
2. Do not log secrets, keys, tokens, cookies, or passwords.
3. Redact by default: central redactor with allowlist for safe keys; denylist includes: password, token, secret, key, cookie, authorization, set-cookie, apiKey, privateKey, clientSecret.
4. Persist secrets only in managed secret stores; never commit to VCS; .env files are for local dev only.
5. Scope tokens and credentials with least privilege; prefer short-lived tokens.

## Auth & Sessions

1. Enforce server-side auth checks for all mutations and sensitive reads; never rely on client-only checks.
2. Normalize auth errors to safe codes/messages; never leak existence checks or internal reasons (e.g., always “invalid credentials”).
3. Sessions:
   - HttpOnly, SameSite=strict/lax per route, Secure in production.
   - Rotate on threshold; enforce absolute lifetime; delete when exceeded.
   - Store only minimal claims; no PII in JWTs; include issued-at and expiry.
   - Validate issuer/audience/alg; reject none/weak algorithms.
4. Passwords: hash with a modern KDF (e.g., bcrypt/argon2) with per-hash salt; never log or return hashes.

## Input & Output Hardening

1. Treat all input as untrusted. Validate and normalize at server boundaries (actions, handlers, RPC), not in UI.
2. Enforce content-length and type for bodies; reject oversized payloads.
3. Prevent SSRF:
   - Enforce allowlist for outbound hosts/schemes/ports.
   - Disallow link-local, loopback, and private ranges unless explicitly allowed.
   - Block file://, ftp://, gopher://, ws:// unless approved.
4. Encode/escape all user content in UI; avoid dangerouslySetInnerHTML unless sanitized with a vetted, configured sanitizer.
5. JSON only by default for APIs; parse safely; reject unexpected top-level fields unless explicitly allowed.

## Logging & Redaction

1. Structured logs only; include operation, requestId/correlationId, and minimal identifiers.
2. Centralized redaction at logger boundary; mask deep keys up to a bounded depth.
3. Never log: credentials, tokens, cookies, secrets, raw DB errors, or full stack traces in production.
4. Map infrastructure errors to generic messages; include safe context for debugging.
5. Set log level by environment; debug logs disabled in production unless temporarily enabled with a scoped flag.

## File Uploads

1. Validate MIME type and size before processing; verify using content sniffing, not just extension.
2. Stream to storage; never buffer entire file in memory when avoidable.
3. Store outside web root; generate random object names; strip metadata.
4. Scan with AV if available; quarantine on detection; never execute user files.
5. Serve with correct Content-Type and Content-Disposition; disallow inline execution for risky types.

## Data & Privacy

1. Minimize data collection; store only what’s necessary and for the shortest duration.
2. Encrypt sensitive data at rest when supported; always in transit (TLS).
3. Classify PII; tag fields and ensure redaction/masking in logs and metrics.
4. Implement hard deletes or tombstones per data retention policy; schedule purges.

## Dependencies & Supply Chain

1. Pin versions; maintain update schedule; automate with CI.
2. Run audit in CI; fail on high/critical vulns unless explicitly waived with justification and deadline.
3. Prefer first-party or well-maintained libraries; avoid abandoned packages.
4. Verify integrity (lockfile committed); prevent install scripts from untrusted sources.

## Network & External I/O

1. Timeouts, retries (bounded), and circuit breakers for outbound calls.
2. Validate TLS; enable certificate pinning if feasible for high-risk targets.
3. Do not forward raw user headers; explicitly set allowed headers.
4. Strip hop-by-hop headers; never log Authorization or Set-Cookie.

## Error Handling

1. Never throw untyped errors across boundaries; normalize to typed results or safe HTTP errors.
2. Return discriminated unions/results to UIs; keep error payloads serializable and secret-free.
3. Capture exceptions with an APM/monitoring tool configured to scrub sensitive fields.

## Testing & CI Gates

1. Unit/contract tests for:
   - Env schema validation failure paths.
   - Auth guard behavior (allow/deny matrix).
   - Redaction of known sensitive keys at various depths.
   - Session rotation and absolute lifetime.
   - SSRF protection (allowlist vs private IP).
   - Upload constraints (size, MIME, AV fail).
2. CI checks:
   - Dependency audit.
   - Lint for disallowed APIs (e.g., dangerouslySetInnerHTML, fetch to arbitrary hosts).
   - Secret scan in repo and artifacts.
   - Bundle/route analyzer to ensure server-only modules aren’t shipped to client.

## Do / Don’t Summary

1. Do: validate inputs server-side; log structured, redacted events; enforce allowlists; hash passwords; rotate sessions.
2. Don’t: trust client checks; log secrets or tokens; fetch arbitrary URLs; embed unsanitized HTML; expose raw error details.

_Last updated: 2025-10-13_
