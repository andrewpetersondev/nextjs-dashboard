/**
 * Normalizers for user identity inputs.
 *
 * Intentionally keeps normalization separate from validation so persistence/DAL
 * can normalize consistently without depending on request-layer schemas.
 */

/**
 * Canonicalize an email for storage and lookup.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Canonicalize a username for storage and lookup.
 */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
