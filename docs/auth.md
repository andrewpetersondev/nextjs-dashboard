# Authentication & Authorization

This document describes how auth works in this project: session creation, cookie settings, route protection, roles, and redirects.

Last updated: 2025-09-08

## Overview

- Style: Cookie-based session with a signed/encrypted token.
- Where:
  - Session helpers live in `src/server/auth/session.ts`.
  - Token (encode/decode) lives in `src/server/auth/session-codec.ts`.
  - Route protection is enforced by `src/middleware.ts` (Edge Middleware) and server-side checks.
  - Login action is in `src/server/auth/actions/login.ts`.
- Roles: `user`, `admin`.
- Redirects:
  - Unauthenticated access to protected routes → `/auth/login`.
  - Authenticated access to public routes → `/dashboard`.
  - Authenticated but non-admin access to admin routes → `/dashboard`.

## Session Token

- Cookie name: `SESSION_COOKIE_NAME` (constant). Middleware currently reads the cookie named `"session"`.
- Payload shape (encrypted):
  ```ts
  {
    user: {
      userId: string,
      role: "user" | "admin",
      expiresAt: number // epoch ms
    }
  }
  ```
- Creation: `setSessionToken(userId, role)` sets an HTTP-only cookie with:
  - `expires`: derived from `SESSION_DURATION_MS` (absolute expiration)
  - `httpOnly: true`
  - `path: "/"`
  - `sameSite: "lax"`
  - `secure: DATABASE_ENV === "production"`
- Deletion: `deleteSessionToken()` removes the cookie.

## Login Flow

File: `src/server/auth/actions/login.ts`

1. Validate form data (`LoginFormSchema`), normalize email.
2. Lookup user via `findUserForLogin(db, email, password)`.
3. On success: `setSessionToken(toUserId(user.id), toUserRole(user.role))`.
4. Redirect to `/dashboard`.
5. On failure: return form errors with `USER_ERROR_MESSAGES.INVALID_CREDENTIALS` (or UNEXPECTED on errors) — no session set.

## Verification (Server Components)

File: `src/server/auth/session.ts`

- `verifySessionOptimistic()` (cached via `react/cache`) reads the cookie and decodes it.
- If missing/invalid, redirects to `LOGIN_PATH` (e.g., `/auth/login`).
- On success returns `{ isAuthorized: true, userId, role }` for downstream logic.

## Route Protection (Middleware)

File: `src/middleware.ts`

- Path helpers:
  - Protected prefix: `/dashboard`
  - Admin prefix: `/dashboard/users`
  - Public routes: `/`, `/auth/login`, `/auth/signup`
- Behavior:
  - Not protected/public/admin → `NextResponse.next()` (no work).
  - Reads cookie value and decodes session using `readSessionToken`.
  - Admin-only:
    - No session → redirect `/auth/login`.
    - Session but `role !== 'admin'` → redirect `/dashboard`.
  - Protected (folder-scoped under `/dashboard`):
    - No session → redirect `/auth/login`.
  - Public routes (home, login, signup):
    - If authenticated and not already under `/dashboard` → redirect `/dashboard`.
- Exclusions (`config.matcher`): middleware does NOT run on `/api`, Next internals, data routes, or requests with a file extension.

## Roles & Authorization

- `AuthRole`: `"user" | "admin"`.
- Role is embedded in the session token payload and evaluated in middleware.
- Admin-only paths live under `/dashboard/users`.

## Redirect Matrix (summary)

- Unauthed → Protected/Admin: `/auth/login`
- Authed (user role) → Admin: `/dashboard`
- Authed → Public (`/`, `/auth/login`, `/auth/signup`): `/dashboard`

## Configuration & Secrets

- Environment variables
  - `SESSION_SECRET` (used by session codec for signing/encryption).
  - `DATABASE_ENV` influences `secure` flag for cookies in `setSessionToken`.
  - `NODE_ENV` is used across build/runtime; Turbopack for dev/build.
- Session lifetime
  - `SESSION_DURATION_MS` controls absolute expiration.

## Security Notes

- Cookies are `httpOnly`, `sameSite: "lax"`, and `secure` in production.
- Session object stores minimal user data: `userId`, `role`, `expiresAt`.
- Middleware minimizes work for irrelevant routes and normalizes paths to avoid bypass with trailing slashes.

## Common Tasks

- Login: submit form → session cookie set → redirect to `/dashboard`.
- Logout: call `deleteSessionToken()` (typically from a server action) and redirect to `/auth/login` or `/`.
- Checking auth in server components/actions: call `verifySessionOptimistic()`.

## Testing Tips

- E2E tests can assert redirects:
  - Visiting `/dashboard` unauthenticated should redirect to `/auth/login`.
  - Visiting `/auth/login` authenticated should redirect to `/dashboard`.
  - Visiting `/dashboard/users` as non-admin should redirect to `/dashboard`.

## Notes & Future Considerations

- Ensure `SESSION_COOKIE_NAME` matches the cookie read in middleware (currently `"session"`).
- Consider sliding expiration if needed (currently absolute expiration only; an example update function is present but commented out in `session.ts`).
