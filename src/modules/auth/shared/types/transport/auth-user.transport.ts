/**
 * A safe, flattened version of the user for use across the wire (cookies/HTTP).
 * Uses primitives to ensure compatibility with serialization and foreign environments.
 */
export interface AuthUserTransport {
  readonly email: string;
  readonly id: string;
  readonly role: string;
  readonly username: string;
}
