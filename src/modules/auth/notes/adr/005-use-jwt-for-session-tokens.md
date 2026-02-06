# ADR 005: Use JWT for Session Tokens

## Status

Accepted

## Context

We need a stateless way to manage user sessions that works well with Next.js Server Actions and Middleware. Using
server-side session stores (like Redis) adds infrastructure complexity and latency for session validation on every
request.

## Decision

We will use JSON Web Tokens (JWT) stored in secure, HTTP-only cookies for session management.

- **Storage**: Tokens are stored in a cookie named `session` (or similar).
- **Security**: Cookies must be `HttpOnly`, `Secure`, and use `SameSite: Strict` (current default; consider `Lax` only
  if you introduce cross-site auth flows and add CSRF protections as needed).
- **Payload**: Minimal data should be stored in the JWT (e.g., `userId`, `role`, `sid`).
- **Signing**: Use a strong cryptographic algorithm (e.g., HS256 with a sufficiently long secret).
- **Rotation**: Sessions should support rotation (refreshing the expiration) to keep users logged in during active use
  while maintaining security.
- **Verification**: Middleware will verify the JWT on every protected request.

## Consequences

### Positive

- **Stateless**: No need for a server-side session store, making the application easier to scale.
- **Performance**: Token verification is a local cryptographic operation, avoiding network round-trips to a
  database/cache for every request.
- **Compatibility**: Works naturally with Next.js edge runtime and middleware.

### Negative

- **Revocation**: Difficult to revoke a single token before it expires without maintaining a blacklist (which
  reintroduces state).
- **Payload Size**: Large amounts of data in the JWT can increase request header size and impact performance.
- **Secret Management**: Requires careful handling of the signing secret.
