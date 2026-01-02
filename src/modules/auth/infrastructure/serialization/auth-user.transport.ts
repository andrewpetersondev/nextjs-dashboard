/**
 * Wire/HTTP/Cookie-only shape for an authenticated user.
 *
 * This transport object uses primitives to ensure compatibility with
 * serialization (JSON/JWT) and foreign environments (Client Components).
 */
export interface AuthUserTransport {
  readonly email: string;
  readonly id: string;
  readonly role: string;
  readonly username: string;
}
